"""
RECOMMENDATION ROUTER
---------------------
POST /api/recommend
  - Accepts InvestorProfileRequest
  - Runs the full quant pipeline via DecisionIntelligenceEngine
  - Generates GPT explanation
  - Stores result in session store
  - Returns RecommendationResponse
"""
from __future__ import annotations

import uuid
from typing import Any

from fastapi import APIRouter, HTTPException

from app.core.profile_builder import build_investor_profile as build_profile
from app.core.session_store import session_store
from app.schemas.profile import InvestorProfileRequest, InvestorProfile
from app.schemas.responses import RecommendationResponse
from app.core.logging_config import logger

router = APIRouter(prefix="/api", tags=["Recommendation"])


def _get_decision_engine():
    try:
        from app.engines.decision_intelligence import DecisionIntelligenceEngine
        return DecisionIntelligenceEngine()
    except Exception as exc:
        raise RuntimeError(f"Full recommendation engine unavailable: {exc}")


def _get_explanation_layer():
    try:
        from app.engines.gpt_explanation import gpt_explanation_layer
        return gpt_explanation_layer
    except Exception:
        return None


def _fallback_recommendation(profile: InvestorProfile) -> dict[str, any]:
    base_return = 9.8 if profile.risk_appetite == profile.risk_appetite.conservative else 14.0 if profile.risk_appetite == profile.risk_appetite.moderate else 18.5
    confidence = 88 if profile.risk_appetite == profile.risk_appetite.conservative else 84 if profile.risk_appetite == profile.risk_appetite.moderate else 78
    vol = 6.2 if profile.risk_appetite == profile.risk_appetite.conservative else 9.4 if profile.risk_appetite == profile.risk_appetite.moderate else 14.8
    allocations = [
        {"ticker": "TCS", "weight_pct": 30 if profile.risk_appetite == profile.risk_appetite.moderate else 15 if profile.risk_appetite == profile.risk_appetite.conservative else 40},
        {"ticker": "INFY", "weight_pct": 20 if profile.risk_appetite == profile.risk_appetite.moderate else 10 if profile.risk_appetite == profile.risk_appetite.conservative else 25},
        {"ticker": "RELIANCE", "weight_pct": 20 if profile.risk_appetite == profile.risk_appetite.moderate else 15 if profile.risk_appetite == profile.risk_appetite.conservative else 20},
        {"ticker": "NIFTY_BEES", "weight_pct": 20 if profile.risk_appetite == profile.risk_appetite.moderate else 30 if profile.risk_appetite == profile.risk_appetite.conservative else 10},
        {"ticker": "GOLDBEES", "weight_pct": 10 if profile.risk_appetite == profile.risk_appetite.moderate else 30 if profile.risk_appetite == profile.risk_appetite.conservative else 5},
    ]
    return {
        "expected_return_pct": round(base_return, 1),
        "confidence_score": confidence,
        "volatility_pct": vol,
        "sharpe_ratio": round(base_return / (vol or 1), 2),
        "cagr_pct": round(base_return + 1.2, 1),
        "max_drawdown_pct": round(-vol * 1.3, 1),
        "allocations": allocations,
        "summary": f"Fallback recommendation generated for {profile.risk_appetite.value} risk. Install full backend dependencies for complete decision engine output.",
    }


@router.post("/recommend", response_model=RecommendationResponse)
async def recommend(request: InvestorProfileRequest):
    """
    Full pipeline endpoint:
      Profile Form -> Investor Profile JSON -> Quant Engines -> Recommendation JSON
      -> GPT Explanation -> Session Store -> Response
    """
    session_id = request.user_id or str(uuid.uuid4())

    try:
        # Step 1: Validate & build InvestorProfile
        profile = build_profile(request)
        logger.info(f"[Router/recommend] profile built for session={session_id}")

        # Step 2: Attempt to run full quant pipeline
        try:
            decision_engine = _get_decision_engine()
            recommendation = decision_engine.build_recommendation(profile, include_backtest=True)
            logger.info(f"[Router/recommend] recommendation built for session={session_id}")
        except RuntimeError as exc:
            logger.warning(f"[Router/recommend] full engine unavailable; using fallback recommendation: {exc}")
            recommendation = _fallback_recommendation(profile)

        # Step 3: GPT Explanation Layer
        explanation_layer = _get_explanation_layer()
        if explanation_layer is not None:
            explanation = explanation_layer.explain(recommendation)
            logger.info(f"[Router/recommend] explanation generated for session={session_id}")
        else:
            explanation = (
                "Fallback recommendation generated. Full GPT explanation layer is unavailable "
                "because the gpt_explanation engine could not be loaded."
            )
            logger.warning(f"[Router/recommend] explanation layer unavailable for session={session_id}")

        # Step 4: Persist in session store for chat/backtest/monitoring endpoints
        session_store.set_recommendation(session_id, recommendation)
        session_store.clear_history(session_id)

        return RecommendationResponse(
            session_id=session_id,
            recommendation=recommendation,
            explanation=explanation,
        )

    except ValueError as exc:
        logger.error(f"[Router/recommend] validation error: {exc}")
        raise HTTPException(status_code=422, detail=str(exc))
    except Exception as exc:
        logger.error(f"[Router/recommend] unexpected error: {exc}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Pipeline error: {exc}")


@router.get("/recommend/{session_id}", response_model=RecommendationResponse)
async def get_recommendation(session_id: str):
    """Retrieve the last recommendation for a session (no re-run)."""
    rec = session_store.get_recommendation(session_id)
    if rec is None:
        raise HTTPException(
            status_code=404,
            detail=f"No recommendation found for session '{session_id}'. POST /api/recommend first.",
        )
    # Re-generate explanation from stored recommendation
    explanation_layer = _get_explanation_layer()
    if explanation_layer is not None:
        explanation = explanation_layer.explain(rec)
    else:
        explanation = "Explanation unavailable."
    return RecommendationResponse(
        session_id=session_id,
        recommendation=rec,
        explanation=explanation,
    )
