"""
BACKTEST ROUTER
---------------
POST /api/backtest/{session_id}
  - Re-runs the vectorbt backtesting engine on the session's current allocation
  - Always runs over the full fixed Kaggle dataset window (2016-01-01 to
    2017-12-29) -- there's no live data to vary the lookback against anymore
  - Returns updated backtest metrics

GET /api/backtest/{session_id}
  - Returns the backtest results stored in the session's recommendation
"""
from __future__ import annotations

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from app.core.session_store import session_store
from app.engines.backtesting import backtest_engine
from app.schemas.responses import BacktestResponse
from app.core.logging_config import logger

router = APIRouter(prefix="/api/backtest", tags=["Backtesting"])


class BacktestRequest(BaseModel):
    lookback_years: int = 5

@router.post("/{session_id}", response_model=BacktestResponse)
async def run_backtest(
    session_id: str,
    request: BacktestRequest = BacktestRequest(),
):
    """
    Re-run backtesting for the session's current portfolio allocation, over
    the full fixed dataset window. `lookback_years` is accepted but ignored
    on this fixed-dataset version of the backend.
    """
    recommendation = session_store.get_recommendation(session_id)
    if recommendation is None:
        raise HTTPException(
            status_code=404,
            detail=f"No recommendation found for session '{session_id}'. POST /api/recommend first.",
        )

    weights_pct: dict = recommendation.get("allocation", {})
    if not weights_pct:
        raise HTTPException(
            status_code=422,
            detail="Recommendation has no allocation weights. Cannot backtest.",
        )

    capital: float = recommendation.get("investor_profile", {}).get("capital", 1_000_000)

    logger.info(
        f"[Router/backtest] running backtest session={session_id} "
        f"lookback={request.lookback_years}yr capital={capital}"
    )

    try:
        backtest_result = backtest_engine.run(
            weights_pct=weights_pct,
            initial_capital=capital,
            period=f"{request.lookback_years}y",
        )

        # Update the stored recommendation with fresh backtest data
        recommendation["backtest"] = backtest_result
        session_store.set_recommendation(session_id, recommendation)

        return BacktestResponse(session_id=session_id, backtest=backtest_result)

    except Exception as exc:
        logger.error(f"[Router/backtest] error: {exc}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Backtesting failed: {exc}")


@router.get("/{session_id}", response_model=BacktestResponse)
async def get_backtest(session_id: str):
    """Return the backtest results stored in the session's recommendation."""
    recommendation = session_store.get_recommendation(session_id)
    if recommendation is None:
        raise HTTPException(
            status_code=404,
            detail=f"No recommendation found for session '{session_id}'.",
        )
    backtest = recommendation.get("backtest") or {}
    return BacktestResponse(session_id=session_id, backtest=backtest)
