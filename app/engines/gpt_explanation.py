"""
GPT EXPLANATION LAYER
----------------------
As per the architecture doc:
  "GPT DOES NOT CALCULATE ANYTHING."
  "GPT receives Investor Profile + Recommendation JSON + Risk Metrics +
   Fundamental Metrics + RAG Evidence + Market Sentiment"
  "GPT generates: Portfolio Summary, Why this stock?, Why this allocation?,
   Risks, Expected Return Explanation, Diversification Explanation, Answers User Questions"

Uses Google Gemini (google-genai) for LLM calls.
Falls back to a deterministic template when GEMINI_API_KEY is unset or the
call fails -- so the backend always returns a useful explanation.
"""
from __future__ import annotations

import json
import os
from typing import Optional

from app.core.logging_config import logger


# ---------------------------------------------------------------------------
# Gemini client -- imported lazily so the app starts without the package
# ---------------------------------------------------------------------------
def _get_gemini_client():
    """
    Uses the current `google-genai` SDK (pinned in requirements.txt as
    google-genai==0.3.0). This package's import path is `google.genai`,
    NOT `google.generativeai` -- that's the old, deprecated SDK and
    importing it here would raise ModuleNotFoundError even with a valid
    API key, silently forcing every call onto the template fallback.
    """
    try:
        from google import genai
        api_key = os.getenv("GEMINI_API_KEY", "")
        if not api_key:
            return None
        return genai.Client(api_key=api_key)
    except Exception as exc:
        logger.warning(f"[GPT] Gemini init failed: {exc}")
        return None


_GEMINI_MODEL = "gemini-2.5-flash"


def _generate(client, prompt: str) -> str:
    """Thin wrapper around the google-genai call shape, used by both explain() and answer_question()."""
    response = client.models.generate_content(model=_GEMINI_MODEL, contents=prompt)
    text = getattr(response, "text", None)
    if not text:
        raise ValueError("Gemini returned an empty response")
    return text.strip()


# ---------------------------------------------------------------------------
# Template fallback
# ---------------------------------------------------------------------------
def _template_explanation(recommendation: dict, question: Optional[str] = None) -> str:
    alloc = recommendation.get("allocation", {})
    risk = recommendation.get("risk", {})
    exp_ret = recommendation.get("expected_return", "N/A")
    confidence = recommendation.get("confidence", "N/A")
    risk_label = recommendation.get("risk_label", "Moderate")

    top_holdings = sorted(alloc.items(), key=lambda kv: kv[1], reverse=True)[:3]
    holding_str = ", ".join(f"{t} ({w*100:.1f}%)" for t, w in top_holdings)

    rag_str = ""

    sharpe = risk.get("sharpe_ratio", "N/A")
    volatility = risk.get("volatility", "N/A")
    var = risk.get("var_95", "N/A")
    sent_label = "Neutral"

    summary = (
        f"Based on your {risk_label.lower()}-risk profile, "
        f"our quantitative engine has constructed a portfolio targeting an expected annual "
        f"return of {exp_ret}% with a model confidence score of {confidence}%.\n\n"
        f"Top Holdings: {holding_str}.\n\n"
        f"Risk Metrics: Sharpe Ratio {sharpe} | Annual Volatility {volatility}% | "
        f"95% VaR {var}%.\n\n"
        f"Market Sentiment across your portfolio is {sent_label}."
        f"{rag_str}\n\n"
        f"Allocation Rationale: Each stock was selected by the XGBoost ML model for "
        f"its predicted return/volatility profile, then weighted by PyPortfolioOpt's "
        f"Maximum Sharpe optimisation on the efficient frontier, subject to your risk "
        f"preference and any sector exclusions you specified.\n\n"
        f"Key Risks: Equity markets carry inherent volatility. Past backtesting "
        f"performance does not guarantee future results. Please review the VaR figure "
        f"and maximum drawdown before committing capital."
    )

    if question:
        summary += (
            f"\n\nRegarding your question — \"{question}\":\n"
            f"Based on the portfolio data above, the most relevant context is the "
            f"allocation to {top_holdings[0][0] if top_holdings else 'your top holding'} "
            f"and the overall {sent_label.lower()} market sentiment. For a more detailed "
            f"answer, please enable the Gemini API key in your .env file."
        )

    return summary


# ---------------------------------------------------------------------------
# Prompt builder
# ---------------------------------------------------------------------------
def _build_prompt(recommendation: dict, question: Optional[str] = None, history: Optional[list[dict]] = None) -> str:
    alloc = recommendation.get("allocation", {})
    risk = recommendation.get("risk", {})
    fundamentals = recommendation.get("fundamentals", {})
    exp_ret = recommendation.get("expected_return", "N/A")
    confidence = recommendation.get("confidence", "N/A")
    risk_label = recommendation.get("risk_label", "Moderate")

    rag_text = "No RAG evidence retrieved."

    fund_text = json.dumps(fundamentals, indent=2) if fundamentals else "{}"
    alloc_text = json.dumps(alloc, indent=2) if alloc else "{}"
    risk_text = json.dumps(risk, indent=2) if risk else "{}"
    
    history_text = ""
    if history:
        history_text = "CHAT HISTORY (Prior Context):\n"
        for msg in history:
            role = "Investor" if msg["role"] == "user" else "Advisor"
            history_text += f"{role}: {msg['content']}\n"
        history_text += "\n"

    task = (
        f'Answer this specific question from the investor: "{question}"'
        if question
        else (
            "Generate a comprehensive portfolio explanation covering:\n"
            "1. Portfolio Summary\n"
            "2. Why each major stock was selected\n"
            "3. Why this specific allocation\n"
            "4. Key risks\n"
            "5. Expected return explanation\n"
            "6. Diversification rationale\n"
        )
    )

    return f"""You are a senior investment advisor AI. You do NOT perform calculations yourself.
You explain the quantitative results already computed by the backend engines, in clear,
professional, jargon-free language suitable for a retail investor in India.

INVESTOR PROFILE:
Risk Level: {risk_label}

PORTFOLIO ALLOCATION (weights %):
{alloc_text}

EXPECTED ANNUAL RETURN: {exp_ret}%
MODEL CONFIDENCE SCORE: {confidence}%

RISK METRICS:
{risk_text}

FUNDAMENTAL ANALYSIS:
{fund_text}

RAG EVIDENCE (from knowledge base):
{rag_text}

{history_text}TASK:
{task}

Guidelines:
- Speak directly to the investor using "your portfolio", "your allocation" etc.
- Cite RAG evidence where relevant.
- Keep the tone professional but accessible.
- Do not invent numbers — only reference figures provided above.
- Response should be 200–400 words for a question, 400–700 words for a full explanation.
"""


# ---------------------------------------------------------------------------
# Public interface
# ---------------------------------------------------------------------------
class GPTExplanationLayer:

    def explain(self, recommendation: dict) -> str:
        """Generate a full portfolio explanation for the dashboard."""
        client = _get_gemini_client()
        if client is None:
            logger.info("[GPT] No Gemini client -- using template fallback for explain()")
            return _template_explanation(recommendation)

        try:
            prompt = _build_prompt(recommendation)
            text = _generate(client, prompt)
            logger.info(f"[GPT] explain() returned {len(text)} chars via Gemini")
            return text
        except Exception as exc:
            logger.warning(f"[GPT] Gemini explain() failed: {exc} -- falling back to template")
            return _template_explanation(recommendation)

    def answer_question(self, recommendation: dict, question: str, history: Optional[list[dict]] = None) -> str:
        """Answer a specific user question grounded in the recommendation JSON and prior chat history."""
        client = _get_gemini_client()
        if client is None:
            logger.info("[GPT] No Gemini client -- using template fallback for answer_question()")
            return _template_explanation(recommendation, question=question)

        try:
            prompt = _build_prompt(recommendation, question=question, history=history)
            text = _generate(client, prompt)
            logger.info(f"[GPT] answer_question() returned {len(text)} chars via Gemini")
            return text
        except Exception as exc:
            logger.warning(f"[GPT] Gemini answer_question() failed: {exc} -- falling back to template")
            return _template_explanation(recommendation, question=question)


gpt_explanation_layer = GPTExplanationLayer()
