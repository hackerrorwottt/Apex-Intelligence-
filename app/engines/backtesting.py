"""
STEP 7: Historical Backtesting
----------------------------------
Library: vectorbt
Runs strategy over the full fixed Kaggle dataset window (2016-01-01 to
2017-12-29) -- there is no live "today" to backtest up to anymore, since
this backend now runs on a fixed historical CSV rather than live data.
Outputs: Portfolio Return, Benchmark Return, CAGR, Win Rate, Max Drawdown
"""
import numpy as np
import pandas as pd
import vectorbt as vbt

from app.core.config import settings
from app.core.logging_config import logger
from app.engines.market_data import market_data_engine


class BacktestEngine:

    def _aligned_price_matrix(self, tickers: list[str], period: str = None) -> pd.DataFrame:
        # `period` is accepted for interface compatibility (callers may
        # still pass a lookback string) but has no effect -- get_price_history
        # always returns the full fixed Kaggle CSV range for the ticker.
        series = {}
        for t in tickers:
            df = market_data_engine.get_price_history(t, period=period)
            series[t] = df["close"]
        price_df = pd.DataFrame(series).dropna(how="all").ffill().dropna()
        return price_df

    def run(self, weights_pct: dict[str, float], initial_capital: float = 100000, period: str = None) -> dict:
        """
        Simulates a buy-and-rebalance-free static allocation portfolio over
        the full fixed dataset window and compares against the NIFTYBEES
        benchmark. `period` is accepted for interface compatibility with
        callers but has no effect on this fixed-dataset version.
        """
        tickers = list(weights_pct.keys())
        weights = np.array([weights_pct[t] / 100 for t in tickers])

        price_df = self._aligned_price_matrix(tickers, period=period)
        # Re-align weights if a ticker got dropped for missing data
        tickers = [t for t in tickers if t in price_df.columns]
        weights = np.array([weights_pct[t] / 100 for t in tickers])
        weights = weights / weights.sum()

        # Build the weighted blended "synthetic portfolio price" series so we
        # can run a clean single-asset vectorbt backtest (buy & hold the
        # blended portfolio, normalized to start at the same value).
        normalized = price_df[tickers] / price_df[tickers].iloc[0]
        portfolio_index_series = (normalized * weights).sum(axis=1)
        portfolio_price = portfolio_index_series * 100  # scale to a "price" series

        pf = vbt.Portfolio.from_holding(portfolio_price, init_cash=initial_capital, freq="1D")

        total_return = float(pf.total_return())
        sharpe = float(pf.sharpe_ratio())
        max_dd = float(pf.max_drawdown())

        daily_rets = portfolio_price.pct_change().dropna()
        win_rate = float((daily_rets > 0).mean())
        n_years = len(portfolio_price) / 252
        cagr = float((1 + total_return) ** (1 / n_years) - 1) if n_years > 0 else 0.0

        # --- Benchmark (Nifty 50) ---
        bench_df = market_data_engine.get_price_history(settings.BENCHMARK_TICKER, period=period)
        bench_price = bench_df["close"]
        bench_pf = vbt.Portfolio.from_holding(bench_price, init_cash=initial_capital, freq="1D")
        bench_total_return = float(bench_pf.total_return())
        bench_cagr = float((1 + bench_total_return) ** (1 / n_years) - 1) if n_years > 0 else 0.0
        bench_max_dd = float(bench_pf.max_drawdown())

        final_value = initial_capital * (1 + total_return)
        bench_final_value = initial_capital * (1 + bench_total_return)

        logger.info(
            f"[Backtest] Portfolio: {total_return*100:.1f}% | Nifty: {bench_total_return*100:.1f}% "
            f"over {n_years:.1f}y"
        )

        return {
            "period": period,
            "start_date": str(portfolio_price.index[0].date()),
            "end_date": str(portfolio_price.index[-1].date()),
            "initial_capital": initial_capital,
            "portfolio_total_return_pct": round(total_return * 100, 2),
            "portfolio_final_value": round(final_value, 2),
            "portfolio_cagr_pct": round(cagr * 100, 2),
            "portfolio_sharpe": round(sharpe, 2),
            "portfolio_max_drawdown_pct": round(max_dd * 100, 2),
            "portfolio_win_rate_pct": round(win_rate * 100, 1),
            "benchmark_name": "Nifty 50 (via NIFTYBEES ETF)",
            "benchmark_total_return_pct": round(bench_total_return * 100, 2),
            "benchmark_final_value": round(bench_final_value, 2),
            "benchmark_cagr_pct": round(bench_cagr * 100, 2),
            "benchmark_max_drawdown_pct": round(bench_max_dd * 100, 2),
            "alpha_vs_benchmark_pct": round((total_return - bench_total_return) * 100, 2),
            "equity_curve": {
                str(d.date()): round(v, 2)
                for d, v in (portfolio_price / portfolio_price.iloc[0] * initial_capital).items()
            },
            "benchmark_curve": {
                str(d.date()): round(v, 2)
                for d, v in (bench_price / bench_price.iloc[0] * initial_capital).items()
            },
        }


backtest_engine = BacktestEngine()
