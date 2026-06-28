"""
API Response Schemas
--------------------
Pydantic models for all endpoint responses.
"""
from __future__ import annotations

from typing import Any, Optional
from pydantic import BaseModel


# ---------------------------------------------------------------------------
# Recommendation endpoint
# ---------------------------------------------------------------------------
class RecommendationResponse(BaseModel):
    session_id: str
    recommendation: dict[str, Any]
    explanation: str
    status: str = "success"


# ---------------------------------------------------------------------------
# Chat endpoint
# ---------------------------------------------------------------------------
class ChatMessage(BaseModel):
    role: str        # "user" | "assistant"
    content: str


class ChatResponse(BaseModel):
    session_id: str
    answer: str
    history: list[ChatMessage]


# ---------------------------------------------------------------------------
# RAG endpoints
# ---------------------------------------------------------------------------
class RAGSearchResult(BaseModel):
    ticker: str
    text: str
    source: str
    relevance_score: float


class RAGSearchResponse(BaseModel):
    query: str
    results: list[RAGSearchResult]


# ---------------------------------------------------------------------------
# Backtest endpoint
# ---------------------------------------------------------------------------
class BacktestResponse(BaseModel):
    session_id: str
    backtest: dict[str, Any]


# ---------------------------------------------------------------------------
# Monitoring endpoint
# ---------------------------------------------------------------------------
class MonitoringAlert(BaseModel):
    level: str        # "INFO" | "WARNING" | "CRITICAL"
    category: str     # "risk_drift" | "sentiment_shift" | "return_drift"
    message: str
    detail: dict[str, Any] = {}


class MonitoringResponse(BaseModel):
    session_id: str
    alerts: list[MonitoringAlert]
    risk_snapshot: dict[str, Any]
    sentiment_snapshot: dict[str, Any]
    recommendation_age_hrs: Optional[float] = None
