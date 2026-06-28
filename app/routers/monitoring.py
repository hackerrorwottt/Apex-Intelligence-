"""
LIVE MONITORING ROUTER
----------------------
POST /api/monitor/{session_id}
  - On-demand re-check of portfolio health against current market data
  - Detects: risk drift, sentiment shift, return drift
  - Returns structured alerts and snapshots

Architecture doc says:
  "Fetch Latest Market Data -> Run Prediction Again -> Risk Changed? ->
   Portfolio Drift? -> New Financial News? -> Send Notification"

⚠️ IMPORTANT CAVEAT after the Kaggle CSV data source change:
Both the price data (fixed historical CSV) and fundamentals (deterministic,
seeded synthetic generator) are now 100% static -- re-running risk_engine
or sentiment_engine on the same tickers will always return bit-for-bit
identical numbers. That means this endpoint can structurally never detect
real drift anymore; every call will report "no significant change," even
though the code/logic itself is unchanged and correct. This is an honest
limitation of running on a fixed historical dataset, not a bug in the
detection logic. To make this endpoint meaningfully demonstrable again,
you'd need either: (a) a second snapshot of fundamentals to compare against
(e.g. a slightly perturbed synthetic re-roll), or (b) to demo this endpoint
conceptually/with mocked "before/after" data rather than expecting it to
fire from two real consecutive calls.

This is implemented as an on-demand endpoint (not a background scheduler)
so it's testable and demo-friendly. In production, call this from a cron
job or APScheduler every N minutes and push results to a notification service.
"""
from __future__ import annotations

from typing import Optional

import time
from datetime import datetime, timezone

from fastapi import APIRouter, HTTPException, Query

from app.core.session_store import session_store
from app.engines.risk_analysis import risk_engine
from app.engines.sentiment_engine import sentiment_engine
from app.schemas.responses import MonitoringAlert, MonitoringResponse
from app.core.logging_config import logger

router = APIRouter(prefix="/api/monitor", tags=["Live Monitoring"])

# Thresholds for generating alerts
_SHARPE_DROP_THRESHOLD = 0.3       # Sharpe dropped by more than this -> WARNING
_VOLATILITY_SPIKE_THRESHOLD = 3.0  # Volatility rose by more than this % -> WARNING
_SENTIMENT_SHIFT_THRESHOLD = 0.25  # Sentiment polarity shifted by more than this -> WARNING
_VAR_SPIKE_THRESHOLD = 2.0         # VaR (95%) worsened by more than this % -> CRITICAL


def _classify_alert_level(delta: float, warn_threshold: float, crit_threshold: Optional[float] = None) -> str:
    abs_delta = abs(delta)
    if crit_threshold and abs_delta >= crit_threshold:
        return "CRITICAL"
    if abs_delta >= warn_threshold:
        return "WARNING"
    return "INFO"


@router.post("/{session_id}", response_model=MonitoringResponse)
async def monitor(
    session_id: str,
    include_sentiment: bool = Query(default=True, description="Re-run sentiment engine"),
    include_risk: bool = Query(default=True, description="Re-run risk engine"),
):
    """
    On-demand portfolio health check.
    Re-computes risk metrics and sentiment against current market data and
    compares with the stored recommendation to detect meaningful drift.

    Example alert:
      ⚠️ Technology sector volatility increased.
         Recommendation: Reduce TCS by 5%. Increase Gold ETF by 5%.
    """
    recommendation = session_store.get_recommendation(session_id)
    if recommendation is None:
        raise HTTPException(
            status_code=404,
            detail=f"No recommendation found for session '{session_id}'. POST /api/recommend first.",
        )

    weights_pct: dict = recommendation.get("allocation", {}).get("weights_pct", {})
    if not weights_pct:
        raise HTTPException(status_code=422, detail="No allocation weights found in recommendation.")

    stored_risk: dict = recommendation.get("risk", {})
    stored_sentiment: dict = recommendation.get("sentiment", {}).get("portfolio_overall", {})
    stored_exp_return: float = recommendation.get("expected_return_pct", 0) or 0

    alerts: list[MonitoringAlert] = []
    current_risk: dict = {}
    current_sentiment: dict = {}

    # ------------------------------------------------------------------
    # 1. Risk Drift Check
    # ------------------------------------------------------------------
    if include_risk:
        try:
            logger.info(f"[Monitor] re-running risk analysis for session={session_id}")
            current_risk = risk_engine.analyze(weights_pct)

            # Sharpe ratio
            stored_sharpe = stored_risk.get("sharpe_ratio") or 0
            current_sharpe = current_risk.get("sharpe_ratio") or 0
            sharpe_delta = current_sharpe - stored_sharpe
            if sharpe_delta < -_SHARPE_DROP_THRESHOLD:
                alerts.append(MonitoringAlert(
                    level="WARNING",
                    category="risk_drift",
                    message=(
                        f"Sharpe Ratio has dropped from {stored_sharpe:.2f} to {current_sharpe:.2f}. "
                        f"Portfolio risk-adjusted performance has deteriorated."
                    ),
                    detail={
                        "metric": "sharpe_ratio",
                        "stored": stored_sharpe,
                        "current": current_sharpe,
                        "delta": round(sharpe_delta, 3),
                    },
                ))

            # Portfolio volatility
            stored_vol = stored_risk.get("portfolio_volatility_pct") or 0
            current_vol = current_risk.get("portfolio_volatility_pct") or 0
            vol_delta = current_vol - stored_vol
            if vol_delta > _VOLATILITY_SPIKE_THRESHOLD:
                level = "CRITICAL" if vol_delta > _VOLATILITY_SPIKE_THRESHOLD * 2 else "WARNING"
                alerts.append(MonitoringAlert(
                    level=level,
                    category="risk_drift",
                    message=(
                        f"Portfolio volatility spiked from {stored_vol:.1f}% to {current_vol:.1f}%. "
                        f"Consider reducing equity exposure or increasing Gold ETF allocation."
                    ),
                    detail={
                        "metric": "portfolio_volatility_pct",
                        "stored": stored_vol,
                        "current": current_vol,
                        "delta": round(vol_delta, 3),
                    },
                ))

            # VaR (95%) -- VaR is typically negative; more negative = worse
            stored_var = stored_risk.get("value_at_risk_95_pct") or 0
            current_var = current_risk.get("value_at_risk_95_pct") or 0
            var_delta = current_var - stored_var  # negative delta = worse
            if var_delta < -_VAR_SPIKE_THRESHOLD:
                alerts.append(MonitoringAlert(
                    level="CRITICAL",
                    category="risk_drift",
                    message=(
                        f"95% VaR worsened from {stored_var:.2f}% to {current_var:.2f}%. "
                        f"Potential downside risk has significantly increased."
                    ),
                    detail={
                        "metric": "value_at_risk_95_pct",
                        "stored": stored_var,
                        "current": current_var,
                        "delta": round(var_delta, 3),
                    },
                ))

        except Exception as exc:
            logger.warning(f"[Monitor] risk re-analysis failed: {exc}")
            current_risk = {"error": str(exc)}
            alerts.append(MonitoringAlert(
                level="INFO",
                category="risk_drift",
                message=f"Risk re-analysis unavailable: {exc}",
                detail={},
            ))

    # ------------------------------------------------------------------
    # 2. Sentiment Shift Check
    # ------------------------------------------------------------------
    if include_sentiment:
        try:
            logger.info(f"[Monitor] re-running sentiment for session={session_id}")
            tickers = list(weights_pct.keys())
            sentiment_by_ticker = sentiment_engine.analyze_universe(tickers)

            # Compute simple average polarity across portfolio (weighted)
            total_weight = sum(weights_pct.values()) or 1
            current_polarity = sum(
                sentiment_by_ticker.get(t, {}).get("overall_confidence", 0)
                * (1 if sentiment_by_ticker.get(t, {}).get("overall_label", "Neutral") == "Positive" else -1)
                * (weights_pct.get(t, 0) / total_weight)
                for t in tickers
            )
            current_sentiment = {
                "label": "Positive" if current_polarity > 0.05 else ("Negative" if current_polarity < -0.05 else "Neutral"),
                "polarity": round(current_polarity, 3),
            }

            stored_polarity = stored_sentiment.get("polarity", 0) or 0
            polarity_delta = current_polarity - stored_polarity

            if abs(polarity_delta) > _SENTIMENT_SHIFT_THRESHOLD:
                direction = "deteriorated" if polarity_delta < 0 else "improved"
                label = current_sentiment["label"]
                level = "WARNING" if polarity_delta < 0 else "INFO"
                alerts.append(MonitoringAlert(
                    level=level,
                    category="sentiment_shift",
                    message=(
                        f"Portfolio sentiment has {direction} to {label} "
                        f"(polarity: {stored_polarity:.2f} → {current_polarity:.2f}). "
                        + (
                            "Review latest news and consider defensive rebalancing."
                            if polarity_delta < 0
                            else "Market outlook has improved — review allocation for upside opportunity."
                        )
                    ),
                    detail={
                        "stored_polarity": round(stored_polarity, 3),
                        "current_polarity": round(current_polarity, 3),
                        "delta": round(polarity_delta, 3),
                        "current_label": label,
                    },
                ))

        except Exception as exc:
            logger.warning(f"[Monitor] sentiment re-analysis failed: {exc}")
            current_sentiment = {"error": str(exc)}

    # ------------------------------------------------------------------
    # 3. No alerts -> everything looks stable
    # ------------------------------------------------------------------
    if not alerts:
        alerts.append(MonitoringAlert(
            level="INFO",
            category="portfolio_health",
            message="Portfolio metrics are within normal range. No significant drift detected.",
            detail={},
        ))

    # Compute how old the recommendation is
    rec_age_hrs: Optional[float] = None
    rec_ts = recommendation.get("generated_at")
    if rec_ts:
        try:
            rec_dt = datetime.fromisoformat(rec_ts)
            if rec_dt.tzinfo is None:
                rec_dt = rec_dt.replace(tzinfo=timezone.utc)
            rec_age_hrs = round((datetime.now(timezone.utc) - rec_dt).total_seconds() / 3600, 2)
        except Exception:
            pass

    return MonitoringResponse(
        session_id=session_id,
        alerts=alerts,
        risk_snapshot=current_risk,
        sentiment_snapshot=current_sentiment,
        recommendation_age_hrs=rec_age_hrs,
    )


@router.get("/{session_id}/alerts", response_model=list[MonitoringAlert])
async def get_latest_alerts(session_id: str):
    """
    Quick GET endpoint that runs the same monitor check and returns only alerts.
    Useful for dashboard polling.
    """
    response = await monitor(session_id)
    return response.alerts
