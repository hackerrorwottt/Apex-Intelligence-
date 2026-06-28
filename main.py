"""
QUANT TRADING INTELLIGENCE PLATFORM — FastAPI Backend
======================================================
Architecture: Investment Profile Form
  → FastAPI Validation
  → Investor Profile JSON
  → Quantitative Engine (Steps 1-8)
  → Fundamental Analysis Engine
  → RAG Engine
  → Market Sentiment Engine
  → Decision Intelligence Engine
  → GPT Explanation Layer
  → Dashboard / Chat / Live Monitoring

Routers:
  POST   /api/recommend              — full pipeline, returns Recommendation JSON + GPT explanation
  GET    /api/recommend/{session_id} — retrieve stored recommendation
  POST   /api/chat                   — AI chat assistant grounded in recommendation
  GET    /api/chat/{session_id}/history
  DELETE /api/chat/{session_id}
  POST   /api/rag/upload             — upload PDF/text to knowledge base
  POST   /api/rag/search             — semantic search
  GET    /api/rag/stats
  POST   /api/backtest/{session_id}  — re-run backtesting with optional lookback
  GET    /api/backtest/{session_id}
  POST   /api/monitor/{session_id}   — on-demand portfolio health / drift check
  GET    /api/monitor/{session_id}/alerts
  GET    /health                     — liveness probe
  GET    /                           — API info
"""
from __future__ import annotations

import os
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.logging_config import logger

# Import the lightweight profile router directly. Other routers depend on
# heavy ML/data science libraries which may not be installed in the dev
# environment. Import them lazily and skip any that fail to import so
# the API can run for lightweight endpoints (like /api/profile).
from app.routers import profile

recommendation = chat = rag = backtest = monitoring = None
try:
    from app.routers import recommendation
except Exception as exc:  # pragma: no cover - runtime import guard
    logger.warning(f"Recommendation router failed to import; skipping: {exc}")

try:
    from app.routers import chat
except Exception as exc:  # pragma: no cover - runtime import guard
    logger.warning(f"Chat router failed to import; skipping: {exc}")

try:
    from app.routers import rag
except Exception as exc:  # pragma: no cover - runtime import guard
    logger.warning(f"RAG router failed to import; skipping: {exc}")

try:
    from app.routers import backtest
except Exception as exc:  # pragma: no cover - runtime import guard
    logger.warning(f"Backtest router failed to import; skipping: {exc}")

try:
    from app.routers import monitoring
except Exception as exc:  # pragma: no cover - runtime import guard
    logger.warning(f"Monitoring router failed to import; skipping: {exc}")


# ---------------------------------------------------------------------------
# Lifespan: startup / shutdown
# ---------------------------------------------------------------------------
@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("=" * 60)
    logger.info("Quant Trading Intelligence Platform starting up")
    logger.info(f"  GEMINI_API_KEY configured: {bool(os.getenv('GEMINI_API_KEY'))}")
    logger.info(f"  FINNHUB_API_KEY configured: {bool(os.getenv('FINNHUB_API_KEY'))}")
    logger.info("=" * 60)

    # Pre-warm the RAG engine knowledge base (loads seed docs into ChromaDB)
    try:
        from app.engines.rag_engine import rag_engine
        stats = rag_engine.get_stats()
        logger.info(f"RAG Engine ready: {stats.get('total_chunks', 0)} chunks in knowledge base")
    except Exception as exc:
        logger.warning(f"RAG Engine warm-up skipped: {exc}")

    yield

    logger.info("Quant Trading Intelligence Platform shutting down")


# ---------------------------------------------------------------------------
# App
# ---------------------------------------------------------------------------
app = FastAPI(
    title="Quant Trading Intelligence Platform",
    description=(
        "AI-powered investment recommendation backend. "
        "Combines ML prediction, portfolio optimisation, risk analysis, "
        "backtesting, RAG evidence retrieval, sentiment analysis, and "
        "GPT-powered explanations into one unified API."
    ),
    version="1.0.0",
    lifespan=lifespan,
)

# ---------------------------------------------------------------------------
# CORS — allow all origins in dev; restrict in production
# ---------------------------------------------------------------------------
ALLOWED_ORIGINS = [
    "http://localhost:3000",
    "http://localhost:3001",
    "http://localhost:5173",
    "http://127.0.0.1:3000",
    "http://127.0.0.1:3001"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------------------------------------------------------------------------
# Routers
# ---------------------------------------------------------------------------
if recommendation is not None:
    app.include_router(recommendation.router)
if chat is not None:
    app.include_router(chat.router)
if rag is not None:
    app.include_router(rag.router)
if backtest is not None:
    app.include_router(backtest.router)
if monitoring is not None:
    app.include_router(monitoring.router)

# Always include the profile router (lightweight, used by the frontend).
app.include_router(profile.router)


# ---------------------------------------------------------------------------
# Root / Health
# ---------------------------------------------------------------------------
@app.get("/", tags=["Meta"])
async def root():
    return {
        "name": "Quant Trading Intelligence Platform",
        "version": "1.0.0",
        "status": "running",
        "endpoints": {
            "recommend":  "POST /api/recommend",
            "chat":       "POST /api/chat",
            "rag_upload": "POST /api/rag/upload",
            "rag_search": "POST /api/rag/search",
            "backtest":   "POST /api/backtest/{session_id}",
            "monitor":    "POST /api/monitor/{session_id}",
            "docs":       "/docs",
            "redoc":      "/redoc",
        },
    }


@app.get("/health", tags=["Meta"])
async def health():
    return {"status": "healthy"}
