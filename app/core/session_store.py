"""
SESSION STORE
-------------
Simple in-memory store holding per-session state:
  - last Recommendation JSON
  - chat history (list of {role, content} dicts)

Hackathon-scale: data lives in process memory and is lost on restart.
For production, swap this for Redis or a DB-backed store.
"""
from __future__ import annotations

from typing import Optional
from app.core.logging_config import logger


class SessionStore:
    def __init__(self):
        # {session_id: {"recommendation": dict, "history": list[dict]}}
        self._store: dict[str, dict] = {}

    def _ensure(self, session_id: str):
        if session_id not in self._store:
            self._store[session_id] = {"recommendation": None, "history": []}

    # ------------------------------------------------------------------
    # Recommendation
    # ------------------------------------------------------------------
    def set_recommendation(self, session_id: str, recommendation: dict):
        self._ensure(session_id)
        self._store[session_id]["recommendation"] = recommendation
        logger.info(f"[Session] stored recommendation for session={session_id}")

    def get_recommendation(self, session_id: str) -> Optional[dict]:
        return self._store.get(session_id, {}).get("recommendation")

    # ------------------------------------------------------------------
    # Chat history
    # ------------------------------------------------------------------
    def append_message(self, session_id: str, role: str, content: str):
        """role: 'user' | 'assistant'"""
        self._ensure(session_id)
        self._store[session_id]["history"].append({"role": role, "content": content})

    def get_history(self, session_id: str) -> list[dict]:
        return self._store.get(session_id, {}).get("history", [])

    def clear_history(self, session_id: str):
        self._ensure(session_id)
        self._store[session_id]["history"] = []
        logger.info(f"[Session] cleared chat history for session={session_id}")

    # ------------------------------------------------------------------
    # Utility
    # ------------------------------------------------------------------
    def list_sessions(self) -> list[str]:
        return list(self._store.keys())

    def delete_session(self, session_id: str):
        self._store.pop(session_id, None)
        logger.info(f"[Session] deleted session={session_id}")


session_store = SessionStore()
