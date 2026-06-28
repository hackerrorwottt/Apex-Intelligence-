"""
CHAT ROUTER
-----------
POST /api/chat
  - Accepts {session_id, message}
  - Grounds the answer in the session's last Recommendation JSON
  - Uses GPT Explanation Layer for LLM-powered responses
  - Maintains per-session chat history

DELETE /api/chat/{session_id}
  - Clears chat history for a session
"""
from __future__ import annotations

from fastapi import APIRouter, HTTPException

from app.core.session_store import session_store
from app.engines.gpt_explanation import gpt_explanation_layer
from app.schemas.profile import ChatRequest
from app.schemas.responses import ChatMessage, ChatResponse
from app.core.logging_config import logger

router = APIRouter(prefix="/api", tags=["Chat"])


@router.post("/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    """
    Chat assistant endpoint.
    Grounds every answer in the session's last Recommendation JSON so the
    model only references real computed values — it cannot hallucinate numbers.
    """
    session_id = request.session_id
    question = request.message.strip()

    if not question:
        raise HTTPException(status_code=422, detail="Message cannot be empty.")

    recommendation = session_store.get_recommendation(session_id)
    if recommendation is None:
        raise HTTPException(
            status_code=404,
            detail=(
                f"No recommendation found for session '{session_id}'. "
                "Please submit your investor profile first via POST /api/recommend."
            ),
        )

    # Log user message
    session_store.append_message(session_id, "user", question)
    logger.info(f"[Router/chat] session={session_id} question='{question[:60]}...'")
    
    # Fetch existing history to pass as context
    history_raw = session_store.get_history(session_id)
    # The current question was just appended, so it's the last element. We pass everything before it as history context.
    prior_history = history_raw[:-1] if len(history_raw) > 1 else None

    # Generate grounded answer
    try:
        answer = gpt_explanation_layer.answer_question(recommendation, question, history=prior_history)
    except Exception as exc:
        logger.error(f"[Router/chat] GPT layer error: {exc}", exc_info=True)
        answer = (
            "I'm having trouble generating a response right now. "
            "Please check your Gemini API key configuration or try again."
        )

    # Log assistant message
    session_store.append_message(session_id, "assistant", answer)

    history_raw = session_store.get_history(session_id)
    history = [ChatMessage(role=m["role"], content=m["content"]) for m in history_raw]

    return ChatResponse(session_id=session_id, answer=answer, history=history)


@router.delete("/chat/{session_id}")
async def clear_chat(session_id: str):
    """Clear chat history for a session."""
    session_store.clear_history(session_id)
    return {"session_id": session_id, "status": "history cleared"}


@router.get("/chat/{session_id}/history", response_model=list[ChatMessage])
async def get_history(session_id: str):
    """Retrieve chat history for a session."""
    history_raw = session_store.get_history(session_id)
    return [ChatMessage(role=m["role"], content=m["content"]) for m in history_raw]
