"""
STEP 1: Fetch Market Data
--------------------------
Source: Kaggle NSE historical bhavcopy CSV (fixed 2016-2017 dataset)
Collects: Historical Prices, Volume, Market Cap, EPS, Revenue, Debt, Cash Flow

Per project decision, this engine uses ONLY the Kaggle CSV for price data —
no live yfinance/Finnhub price calls. The CSV is NSE daily bhavcopy-style
data (SYMBOL, SERIES, OPEN, HIGH, LOW, CLOSE, ..., TIMESTAMP) covering
2016-01-01 to 2017-12-29 for the ~20 tickers in STOCK_UNIVERSE/ETF_UNIVERSE.

Fundamentals (revenue growth, debt-to-equity, ROE, P/E, etc.) are NOT in
this CSV — it's price/volume only. Per project decision, fundamentals stay
on the deterministic synthetic generator already in this file; only the
PRICE path was switched to the Kaggle CSV.

Everything is cached to disk under app/data/cache so repeated calls are
fast; the CSV itself is parsed once into memory at first use.
"""
import hashlib
import json
import time
from pathlib import Path

from typing import Optional

import numpy as np
import pandas as pd

from app.core.config import settings, CACHE_DIR
from app.core.logging_config import logger


class _KaggleCSVStore:
    """
    Loads the fixed Kaggle NSE CSV once and serves per-symbol OHLCV slices
    from memory. Symbol matching strips the ".NS"/".BO" suffix used
    elsewhere in this codebase, since the CSV uses bare NSE symbols
    (e.g. "TCS", not "TCS.NS").
    """

    def __init__(self, csv_path: Path):
        self.csv_path = csv_path
        self._by_symbol: Optional[dict[str, pd.DataFrame]] = None

    def _load(self):
        if self._by_symbol is not None:
            return
        if not self.csv_path.exists():
            raise FileNotFoundError(
                f"Kaggle CSV not found at {self.csv_path}. This backend requires "
                f"app/data/source_data/nse_universe_2016_2017.csv to be present."
            )
        raw = pd.read_csv(self.csv_path, parse_dates=["TIMESTAMP"])
        raw = raw.rename(columns={
            "OPEN": "open", "HIGH": "high", "LOW": "low", "CLOSE": "close",
            "TOTTRDQTY": "volume", "TIMESTAMP": "date", "SYMBOL": "symbol",
        })
        by_symbol = {}
        for symbol, group in raw.groupby("symbol"):
            df = group[["date", "open", "high", "low", "close", "volume"]].copy()
            df = df.sort_values("date").drop_duplicates(subset="date", keep="last")
            df = df.set_index("date")
            df.index.name = "date"
            by_symbol[symbol.upper()] = df
        self._by_symbol = by_symbol
        logger.info(f"[MarketData] loaded Kaggle CSV: {len(by_symbol)} symbols, "
                     f"{len(raw)} total rows from {self.csv_path.name}")

    @staticmethod
    def _strip_suffix(ticker: str) -> str:
        return ticker.replace(".NS", "").replace(".BO", "").upper()

    def get(self, ticker: str) -> Optional[pd.DataFrame]:
        self._load()
        bare = self._strip_suffix(ticker)
        df = self._by_symbol.get(bare)
        return df.copy() if df is not None else None

    def available_symbols(self) -> list[str]:
        self._load()
        return sorted(self._by_symbol.keys())


_kaggle_store = _KaggleCSVStore(settings.KAGGLE_CSV_PATH)


class MarketDataEngine:
    """Fetches and caches historical price (Kaggle CSV) + fundamental data (synthetic) for a ticker."""

    def __init__(self):
        self.cache_dir = CACHE_DIR

    # ------------------------------------------------------------------ #
    # Public API
    # ------------------------------------------------------------------ #
    def get_price_history(self, ticker: str, period: str = None, force_refresh: bool = False) -> pd.DataFrame:
        """
        Returns a DataFrame indexed by date with OHLCV columns, sourced from
        the fixed Kaggle CSV (2016-01-01 to 2017-12-29). The `period` and
        `force_refresh` arguments are accepted for interface compatibility
        with callers (backtesting.py, ml_prediction.py, etc.) but have no
        effect — there is no live data window to vary; the full fixed
        historical range for the ticker is always returned.
        """
        cache_path = self._cache_path(ticker, "prices", "kaggle")
        source_marker = cache_path.with_suffix(".source.txt")

        if not force_refresh and cache_path.exists():
            df = pd.read_csv(cache_path, index_col=0, parse_dates=True)
            df.attrs["source"] = source_marker.read_text().strip() if source_marker.exists() else "unknown"
            logger.info(f"[MarketData] cache hit: {ticker} prices (source={df.attrs['source']})")
            return df

        df = _kaggle_store.get(ticker)
        if df is None or df.empty:
            raise ValueError(
                f"'{ticker}' not found in the Kaggle dataset (looked for symbol "
                f"'{_kaggle_store._strip_suffix(ticker)}'). Available symbols: "
                f"{_kaggle_store.available_symbols()[:10]}... "
                f"({len(_kaggle_store.available_symbols())} total)"
            )
        df.attrs["source"] = "kaggle_csv"

        df.to_csv(cache_path)
        source_marker.write_text(df.attrs["source"])
        return df

    def get_fundamentals(self, ticker: str, force_refresh: bool = False) -> dict:
        """
        Returns a fundamental snapshot: EPS, revenue, debt, cash flow, market
        cap. The Kaggle CSV has no fundamental data, so this is always the
        deterministic synthetic generator (seeded per ticker, so values are
        stable across calls/restarts) — this is unaffected by the price
        source change.
        """
        cache_path = self._cache_path(ticker, "fundamentals", "latest", ext="json")

        if not force_refresh and cache_path.exists():
            with open(cache_path) as f:
                logger.info(f"[MarketData] cache hit: {ticker} fundamentals")
                return json.load(f)

        fund = self._synthetic_fundamentals(ticker)
        fund["source"] = "synthetic"

        with open(cache_path, "w") as f:
            json.dump(fund, f, indent=2, default=str)
        return fund

    def get_universe_snapshot(self, tickers: list[str]) -> dict[str, dict]:
        """Convenience: fundamentals for a whole list of tickers."""
        return {t: self.get_fundamentals(t) for t in tickers}

    # ------------------------------------------------------------------ #
    # Synthetic fundamentals (seeded -> deterministic per ticker)
    # ------------------------------------------------------------------ #
    def _seed_for(self, ticker: str) -> int:
        return int(hashlib.md5(ticker.encode()).hexdigest(), 16) % (2 ** 32)

    def _synthetic_fundamentals(self, ticker: str) -> dict:
        rng = np.random.default_rng(self._seed_for(ticker))
        sectors = ["Technology", "Financials", "Energy", "Consumer", "Healthcare", "Industrials"]
        revenue = float(rng.uniform(5_000, 200_000)) * 1e6
        return {
            "ticker": ticker,
            "market_cap": float(rng.uniform(20_000, 1_500_000)) * 1e6,
            "eps": float(rng.uniform(5, 250)),
            "revenue": revenue,
            "revenue_growth": float(rng.uniform(-0.05, 0.28)),
            "debt_to_equity": float(rng.uniform(0.05, 1.4)),
            "operating_cash_flow": revenue * float(rng.uniform(0.08, 0.25)),
            "free_cash_flow": revenue * float(rng.uniform(0.04, 0.18)),
            "operating_margin": float(rng.uniform(0.08, 0.35)),
            "roe": float(rng.uniform(0.05, 0.35)),
            "sector": sectors[self._seed_for(ticker) % len(sectors)],
            "industry": "Diversified",
            "pe_ratio": float(rng.uniform(10, 45)),
            "current_price": None,  # filled from price series by caller if needed
        }

    # ------------------------------------------------------------------ #
    # Cache helpers
    # ------------------------------------------------------------------ #
    def _cache_path(self, ticker: str, kind: str, suffix: str, ext: str = "csv") -> Path:
        safe = ticker.replace(".", "_").replace("^", "")
        return self.cache_dir / f"{safe}_{kind}_{suffix}.{ext}"


market_data_engine = MarketDataEngine()
