"""
STEP 6: Risk Analysis Engine
-------------------------------
Calculates: Sharpe Ratio, Sortino Ratio, Portfolio Volatility, Beta,
Value at Risk (VaR), Maximum Drawdown, Diversification Score
"""
from typing import Optional

import numpy as np
import pandas as pd

from app.core.config import settings
from app.core.logging_config import logger
from app.engines.market_data import market_data_engine


class RiskAnalysisEngine:

    def _portfolio_return_series(self, weights_pct: dict[str, float]) -> pd.Series:
        """Builds the historical daily return series of the weighted portfolio."""
        tickers = list(weights_pct.keys())
        weights = np.array([weights_pct[t] / 100 for t in tickers])

        price_series = {}
        for t in tickers:
            df = market_data_engine.get_price_history(t)
            price_series[t] = df["close"]
        price_df = pd.DataFrame(price_series).dropna(how="all").ffill().dropna()

        returns_df = price_df.pct_change().dropna()
        portfolio_returns = returns_df[tickers].dot(weights)
        return portfolio_returns

    def _benchmark_return_series(self) -> Optional[pd.Series]:
        try:
            df = market_data_engine.get_price_history(settings.BENCHMARK_TICKER)
            return df["close"].pct_change().dropna()
        except Exception as e:
            logger.warning(f"[Risk] benchmark fetch failed: {e}")
            return None

    def analyze(self, weights_pct: dict[str, float]) -> dict:
        port_returns = self._portfolio_return_series(weights_pct)

        annual_return = float(port_returns.mean() * 252)
        annual_vol = float(port_returns.std() * np.sqrt(252))

        rf = settings.RISK_FREE_RATE
        sharpe = (annual_return - rf) / annual_vol if annual_vol > 0 else 0.0

        downside_returns = port_returns[port_returns < 0]
        downside_std = float(downside_returns.std() * np.sqrt(252)) if len(downside_returns) > 1 else 1e-9
        sortino = (annual_return - rf) / downside_std if downside_std > 0 else 0.0

        # Value at Risk (95% confidence, historical method) - 1-day
        var_95 = float(np.percentile(port_returns, 5))
        var_95_rupees_per_lakh = var_95 * 100000  # VaR expressed per ₹1,00,000 invested

        # Maximum Drawdown
        cum_returns = (1 + port_returns).cumprod()
        running_max = cum_returns.cummax()
        drawdown = (cum_returns - running_max) / running_max
        max_drawdown = float(drawdown.min())

        # Beta vs Nifty 50
        beta = None
        benchmark_returns = self._benchmark_return_series()
        if benchmark_returns is not None:
            aligned = pd.concat([port_returns, benchmark_returns], axis=1, join="inner").dropna()
            aligned.columns = ["portfolio", "benchmark"]
            if len(aligned) > 30 and aligned["benchmark"].var() > 0:
                cov = np.cov(aligned["portfolio"], aligned["benchmark"])[0][1]
                beta = float(cov / aligned["benchmark"].var())

        # Diversification score: 1 - normalized Herfindahl-Hirschman Index
        # (HHI close to 1 = concentrated in one asset; close to 1/n = well diversified)
        w = np.array(list(weights_pct.values())) / 100
        hhi = float(np.sum(w ** 2))
        n = len(w)
        min_hhi = 1 / n if n > 0 else 1
        diversification_score = float(np.clip(1 - (hhi - min_hhi) / (1 - min_hhi), 0, 1)) if n > 1 else 0.0

        risk_label = self._risk_label(annual_vol)

        # Per-asset risk metrics
        asset_metrics = {}
        for ticker in weights_pct.keys():
            try:
                df = market_data_engine.get_price_history(ticker)
                if df is not None and not df.empty:
                    asset_ret = df["close"].pct_change().dropna()
                    # Annual volatility
                    asset_vol = float(asset_ret.std() * np.sqrt(252))
                    # Beta
                    asset_beta = 1.0
                    if benchmark_returns is not None:
                        align_a = pd.concat([asset_ret, benchmark_returns], axis=1, join="inner").dropna()
                        align_a.columns = ["asset", "bench"]
                        if len(align_a) > 30 and align_a["bench"].var() > 0:
                            cov_a = np.cov(align_a["asset"], align_a["bench"])[0][1]
                            asset_beta = float(cov_a / align_a["bench"].var())
                    
                    asset_metrics[ticker] = {
                        "volatility_pct": round(asset_vol * 100, 2),
                        "beta": round(asset_beta, 2)
                    }
                else:
                    asset_metrics[ticker] = {"volatility_pct": 0.0, "beta": 1.0}
            except Exception as e:
                logger.warning(f"[Risk] per asset risk failed for {ticker}: {e}")
                asset_metrics[ticker] = {"volatility_pct": 0.0, "beta": 1.0}

        return {
            "sharpe_ratio": round(sharpe, 2),
            "sortino_ratio": round(sortino, 2),
            "portfolio_volatility_pct": round(annual_vol * 100, 2),
            "annual_return_pct": round(annual_return * 100, 2),
            "beta_vs_nifty50": round(beta, 2) if beta is not None else None,
            "value_at_risk_95_pct": round(var_95 * 100, 2),
            "value_at_risk_95_per_lakh": round(var_95_rupees_per_lakh, 0),
            "max_drawdown_pct": round(max_drawdown * 100, 2),
            "diversification_score": round(diversification_score * 100, 1),
            "risk_label": risk_label,
            "asset_metrics": asset_metrics,
        }

    @staticmethod
    def _risk_label(annual_vol: float) -> str:
        if annual_vol < 0.12:
            return "Low"
        elif annual_vol < 0.22:
            return "Moderate"
        elif annual_vol < 0.35:
            return "High"
        return "Very High"


risk_engine = RiskAnalysisEngine()
