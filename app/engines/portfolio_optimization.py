"""
STEP 5: Portfolio Optimization
---------------------------------
Library: PyPortfolioOpt
Input: Expected Returns, Covariance Matrix, Risk Preference, Capital
Output: Allocation weights per asset (e.g. 30% TCS, 20% Infosys, ...)
Uses: Modern Portfolio Theory, Efficient Frontier, Maximum Sharpe Optimization
"""
import numpy as np
import pandas as pd
from pypfopt import EfficientFrontier, risk_models, expected_returns
from pypfopt.exceptions import OptimizationError

from app.core.config import settings
from app.core.logging_config import logger
from app.engines.market_data import market_data_engine
from app.engines.ml_prediction import ml_engine
from app.schemas.profile import InvestorProfile, RiskAppetite


class PortfolioOptimizationEngine:

    RISK_AVERSION_MAP = {
        RiskAppetite.conservative: 3.0,
        RiskAppetite.moderate: 1.5,
        RiskAppetite.aggressive: 0.6,
    }

    def _build_price_matrix(self, tickers: list[str]) -> pd.DataFrame:
        """Combine close prices for all tickers into one aligned DataFrame."""
        series = {}
        for t in tickers:
            df = market_data_engine.get_price_history(t)
            series[t] = df["close"]
        price_df = pd.DataFrame(series)
        price_df = price_df.dropna(how="all").ffill().dropna()
        return price_df

    def _filter_universe(self, profile: InvestorProfile) -> list[str]:
        universe = list(settings.STOCK_UNIVERSE)

        if profile.preferred_tickers:
            universe = [t for t in universe if t in profile.preferred_tickers] or universe

        if profile.excluded_tickers:
            universe = [t for t in universe if t not in profile.excluded_tickers]

        if profile.excluded_sectors:
            kept = []
            for t in universe:
                fund = market_data_engine.get_fundamentals(t)
                if fund.get("sector") not in profile.excluded_sectors:
                    kept.append(t)
            universe = kept or universe

        if profile.preferred_sectors:
            preferred = []
            for t in universe:
                fund = market_data_engine.get_fundamentals(t)
                if fund.get("sector") in profile.preferred_sectors:
                    preferred.append(t)
            if preferred:
                universe = preferred

        return universe

    def optimize(self, profile: InvestorProfile, include_gold: bool = True, include_index_etf: bool = True) -> dict:
        """
        Runs the full Step 5 pipeline: ML expected returns -> covariance matrix
        -> max-Sharpe efficient-frontier optimization -> discrete allocation.
        """
        equity_universe = self._filter_universe(profile)
        etfs = []
        if include_index_etf:
            etfs.append(settings.ETF_UNIVERSE[0])
        if include_gold:
            etfs.append(settings.ETF_UNIVERSE[1])

        tickers = equity_universe + etfs
        logger.info(f"[PortfolioOpt] universe for optimization: {tickers}")

        price_df = self._build_price_matrix(tickers)
        # Drop any ticker whose price series didn't survive alignment
        tickers = [t for t in tickers if t in price_df.columns]

        # --- Expected returns: blend ML predictions with historical mean ---
        ml_preds = ml_engine.predict_universe(equity_universe, horizon_days=21)
        mu = expected_returns.mean_historical_return(price_df, frequency=252)

        for t in tickers:
            if t in ml_preds:
                ml_return = ml_preds[t]["expected_return_pct"] / 100
                hist_return = mu[t]
                # Blend: 60% ML view, 40% historical anchor (keeps optimizer
                # from over-trusting a single noisy ML estimate)
                mu[t] = 0.6 * ml_return + 0.4 * hist_return

        # ETFs: no ML model, just historical mean (already in mu from above)

        S = risk_models.CovarianceShrinkage(price_df).ledoit_wolf()

        risk_aversion = self.RISK_AVERSION_MAP[profile.risk_appetite]

        ef = EfficientFrontier(mu, S, weight_bounds=(0, 0.40))  # cap any single asset at 40%
        try:
            if profile.risk_appetite == RiskAppetite.conservative:
                ef.add_objective(lambda w: 0)  # no-op placeholder for clarity
                weights = ef.min_volatility()
            else:
                weights = ef.max_sharpe(risk_free_rate=settings.RISK_FREE_RATE)
        except OptimizationError as e:
            logger.warning(f"[PortfolioOpt] optimization failed ({e}), falling back to min volatility")
            ef = EfficientFrontier(mu, S, weight_bounds=(0, 0.40))
            weights = ef.min_volatility()

        cleaned_weights = ef.clean_weights(cutoff=0.01, rounding=4)
        perf = ef.portfolio_performance(verbose=False, risk_free_rate=settings.RISK_FREE_RATE)
        expected_annual_return, annual_volatility, sharpe_ratio = perf

        # Discrete share allocation given actual capital
        latest_prices = price_df.iloc[-1]
        allocation_rupees = {t: round(w * profile.capital, 2) for t, w in cleaned_weights.items() if w > 0}
        allocation_shares = {
            t: int(allocation_rupees[t] // latest_prices[t]) for t in allocation_rupees if latest_prices[t] > 0
        }

        allocation_pct = {t: round(w * 100, 2) for t, w in cleaned_weights.items() if w > 0}

        return {
            "weights_pct": allocation_pct,
            "allocation_rupees": allocation_rupees,
            "allocation_shares": allocation_shares,
            "expected_annual_return_pct": round(expected_annual_return * 100, 2),
            "annual_volatility_pct": round(annual_volatility * 100, 2),
            "sharpe_ratio": round(sharpe_ratio, 3),
            "risk_aversion_used": risk_aversion,
            "universe_considered": tickers,
            "ml_predictions_used": ml_preds,
            "latest_prices": latest_prices.to_dict(),
        }


portfolio_optimizer = PortfolioOptimizationEngine()
