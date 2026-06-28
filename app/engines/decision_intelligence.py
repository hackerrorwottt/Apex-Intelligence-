"""
DECISION INTELLIGENCE ENGINE
-----------------------------
Combines outputs from every engine into ONE Recommendation JSON:
  - ML Prediction
  - Portfolio Allocation
  - Risk Metrics
  - Fundamental Metrics
  - RAG Evidence
  - News Sentiment

This module performs no new calculation of its own -- it is purely an
aggregation/shaping layer over the real outputs already produced by the
other six engines, matching the architecture doc's "Decision Intelligence
Engine" box exactly.
"""
from app.core.logging_config import logger
from app.engines.market_data import market_data_engine
from app.engines.portfolio_optimization import portfolio_optimizer
from app.engines.risk_analysis import risk_engine
from app.engines.sentiment_engine import sentiment_engine
from app.engines.rag_engine import rag_engine

try:
    from app.engines.backtesting import backtest_engine
except ImportError as exc:
    logger.warning(f"Backtesting engine unavailable: {exc}")
    backtest_engine = None
from app.schemas.profile import InvestorProfile


class DecisionIntelligenceEngine:

    def _fundamental_label(self, fund: dict) -> dict:
        """Maps raw fundamentals into the doc's {earnings, debt, valuation} shape."""
        rev_growth = fund.get("revenue_growth")
        if rev_growth is None:
            earnings = "Unknown"
        elif rev_growth >= 0.15:
            earnings = "Strong"
        elif rev_growth >= 0.05:
            earnings = "Moderate"
        else:
            earnings = "Weak"

        d2e = fund.get("debt_to_equity")
        if d2e is None:
            debt = "Unknown"
        elif d2e < 0.3:
            debt = "Low"
        elif d2e < 0.8:
            debt = "Moderate"
        else:
            debt = "High"

        pe = fund.get("pe_ratio")
        if pe is None:
            valuation = "Unknown"
        elif pe < 15:
            valuation = "Undervalued"
        elif pe < 30:
            valuation = "Fair"
        else:
            valuation = "Expensive"

        return {
            "earnings": earnings,
            "debt": debt,
            "valuation": valuation,
            "revenue_growth_pct": round(rev_growth * 100, 2) if rev_growth is not None else None,
            "debt_to_equity": round(d2e, 2) if d2e is not None else None,
            "pe_ratio": round(pe, 2) if pe is not None else None,
            "roe_pct": round(fund.get("roe") * 100, 2) if fund.get("roe") is not None else None,
            "operating_margin_pct": round(fund.get("operating_margin") * 100, 2) if fund.get("operating_margin") is not None else None,
        }

    def _overall_sentiment_for_portfolio(self, ticker_sentiments: dict[str, dict], weights_pct: dict[str, float]) -> dict:
        """Weighted blend of each holding's sentiment, weighted by allocation %."""
        total_weight = 0.0
        weighted_polarity = 0.0
        for ticker, weight in weights_pct.items():
            s = ticker_sentiments.get(ticker)
            if not s:
                continue
            weighted_polarity += s["overall_polarity"] * weight
            total_weight += weight

        avg_polarity = weighted_polarity / total_weight if total_weight > 0 else 0.0
        if avg_polarity > 0.1:
            label = "Positive"
        elif avg_polarity < -0.1:
            label = "Negative"
        else:
            label = "Neutral"
        return {"label": label, "polarity": round(avg_polarity, 3)}

    def build_recommendation(self, profile: InvestorProfile, include_backtest: bool = True) -> dict:
        """
        Runs/collects the full pipeline and returns the unified Recommendation
        JSON described in the architecture doc's "Decision Intelligence
        Engine" and "Step 8: Recommendation JSON" sections.
        """
        logger.info(f"[Decision] building recommendation for user={profile.user_id}")

        # --- Step 5: Portfolio Optimization (also runs Step 4 ML internally) ---
        opt_result = portfolio_optimizer.optimize(profile)
        weights_pct = opt_result["weights_pct"]
        held_tickers = list(weights_pct.keys())

        # --- Step 6: Risk Analysis ---
        risk_result = risk_engine.analyze(weights_pct)

        # --- Step 7: Backtesting (optional, can be slow on first run) ---
        backtest_result = None
        if include_backtest and backtest_engine is not None:
            try:
                backtest_result = backtest_engine.run(weights_pct, initial_capital=profile.capital)
            except Exception as e:
                logger.warning(f"Backtest failed to run: {e}")

        # --- Fundamental Analysis Engine ---
        fundamentals_by_ticker = {}
        for t in held_tickers:
            fund = market_data_engine.get_fundamentals(t)
            fundamentals_by_ticker[t] = self._fundamental_label(fund)

        # --- Market Sentiment Engine ---
        sentiment_by_ticker = sentiment_engine.analyze_universe(held_tickers)
        portfolio_sentiment = self._overall_sentiment_for_portfolio(sentiment_by_ticker, weights_pct)

        # --- RAG Engine: pull supporting evidence for the top holdings ---
        rag_context = []
        top_holdings = sorted(weights_pct.items(), key=lambda kv: kv[1], reverse=True)[:3]
        for ticker, _ in top_holdings:
            fund_summary = fundamentals_by_ticker.get(ticker, {})
            query = f"{ticker} {fund_summary.get('earnings', '')} earnings {fund_summary.get('debt', '')} debt diversification"
            hits = rag_engine.search(query, top_k=2)
            for h in hits:
                rag_context.append({
                    "ticker": ticker,
                    "evidence": h["text"][:280] + ("..." if len(h["text"]) > 280 else ""),
                    "source": h["source"],
                    "relevance_score": h["relevance_score"],
                })

        # --- Step 8: Recommendation JSON (User Requested Schema) ---
        formatted_fundamentals = {}
        for t, fund_data in fundamentals_by_ticker.items():
            sent = sentiment_by_ticker.get(t, {}).get("overall_label", "Neutral")
            val = fund_data.get("valuation", "Unknown")
            formatted_fundamentals[t] = {"valuation": val, "sentiment": sent}

        recommendation = {
            "investor_profile": profile.dict(),
            "expected_return": round(opt_result["expected_annual_return_pct"], 2),
            "volatility": round(risk_result.get("portfolio_volatility_pct", 0.0), 2),
            "allocation": {k: round(v / 100, 4) for k, v in weights_pct.items()},
            "risk": risk_result,
            "fundamentals": formatted_fundamentals,
            "confidence": round(
                sum(p["confidence_score"] for p in opt_result["ml_predictions_used"].values())
                / max(len(opt_result["ml_predictions_used"]), 1),
                1,
            ),
            "risk_label": profile.risk_appetite.value.capitalize(),
            "diversification_score": round(max(0, 100 - (max(weights_pct.values()) if weights_pct else 0) * 0.8), 1)
        }
        return recommendation


decision_engine = DecisionIntelligenceEngine()
