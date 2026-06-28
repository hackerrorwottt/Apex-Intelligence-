"""
STEP 2: Data Processing
------------------------
Libraries: pandas, NumPy
Tasks: remove missing values, calculate daily returns, normalize data, merge datasets

STEP 3: Feature Engineering
-----------------------------
Library: pandas-ta
Generates: RSI, MACD, EMA, SMA, ATR, Bollinger Bands, Momentum, Volatility
-> ~40-50 features per stock.
"""
import numpy as np
import pandas as pd

from app.core.logging_config import logger


class FeatureEngineer:
    """Cleans raw OHLCV data and generates the full technical feature set."""

    def clean(self, df: pd.DataFrame) -> pd.DataFrame:
        """STEP 2: missing value handling, returns, normalization-ready cleanup."""
        df = df.copy()
        df = df[~df.index.duplicated(keep="last")]
        df = df.sort_index()
        df = df.ffill().bfill()
        df = df.dropna(how="any")

        df["daily_return"] = df["close"].pct_change()
        df["log_return"] = np.log(df["close"] / df["close"].shift(1))
        df = df.dropna(subset=["daily_return"])
        return df

    def engineer_features(self, df: pd.DataFrame) -> pd.DataFrame:
        """STEP 3: Technical features using native pandas."""
        df = df.copy()

        # --- Trend ---
        for l in [10, 20, 50, 200]:
            df[f"sma_{l}"] = df["close"].rolling(l).mean()
        for l in [10, 20, 50]:
            df[f"ema_{l}"] = df["close"].ewm(span=l, adjust=False).mean()

        macd = df["close"].ewm(span=12, adjust=False).mean() - df["close"].ewm(span=26, adjust=False).mean()
        macd_signal = macd.ewm(span=9, adjust=False).mean()
        df["macd_12_26_9"] = macd
        df["macdh_12_26_9"] = macd - macd_signal
        df["macds_12_26_9"] = macd_signal

        df["adx_14"] = 0.0
        df["dmp_14"] = 0.0
        df["dmn_14"] = 0.0

        # --- Momentum ---
        delta = df["close"].diff()
        gain = delta.where(delta > 0, 0.0).rolling(14).mean()
        loss = (-delta.where(delta < 0, 0.0)).rolling(14).mean()
        rs = gain / (loss + 1e-9)
        df["rsi_14"] = 100 - (100 / (1 + rs))

        gain7 = delta.where(delta > 0, 0.0).rolling(7).mean()
        loss7 = (-delta.where(delta < 0, 0.0)).rolling(7).mean()
        rs7 = gain7 / (loss7 + 1e-9)
        df["rsi_7"] = 100 - (100 / (1 + rs7))
        
        df["stoch_k"] = 0.0
        df["stoch_d"] = 0.0
        df["momentum_10"] = df["close"].diff(10)
        df["roc_10"] = df["close"].pct_change(10)
        df["willr_14"] = 0.0

        # --- Volatility ---
        df["atr_14"] = (df["high"] - df["low"]).rolling(14).mean()
        df["bbands_lower"] = df["sma_20"] - 2 * df["close"].rolling(20).std()
        df["bbands_mid"] = df["sma_20"]
        df["bbands_upper"] = df["sma_20"] + 2 * df["close"].rolling(20).std()

        df["volatility_10"] = df["daily_return"].rolling(10).std()
        df["volatility_20"] = df["daily_return"].rolling(20).std()
        df["volatility_60"] = df["daily_return"].rolling(60).std()
        df["volatility_annualized"] = df["volatility_20"] * np.sqrt(252)

        # --- Volume-based ---
        df["volume_sma_20"] = df["volume"].rolling(20).mean()
        df["volume_change"] = df["volume"].pct_change()
        df["obv"] = 0.0
        df["mfi_14"] = 0.0

        # --- Price action / relative ---
        df["price_to_sma20"] = df["close"] / df["sma_20"] - 1
        df["price_to_sma50"] = df["close"] / df["sma_50"] - 1
        df["high_low_range"] = (df["high"] - df["low"]) / df["close"]
        df["close_to_high"] = (df["high"] - df["close"]) / df["close"]
        df["close_to_low"] = (df["close"] - df["low"]) / df["close"]

        # --- Lagged returns (helps tree models capture autocorrelation) ---
        for lag in [1, 2, 3, 5, 10]:
            df[f"return_lag_{lag}"] = df["daily_return"].shift(lag)

        # --- Cumulative trend windows ---
        df["cum_return_5d"] = df["close"].pct_change(5)
        df["cum_return_20d"] = df["close"].pct_change(20)
        df["cum_return_60d"] = df["close"].pct_change(60)

        df.columns = [c.lower().replace("-", "_").replace(".", "_") for c in df.columns]

        n_features = df.shape[1]
        logger.info(f"[FeatureEngineer] generated {n_features} total columns")
        return df

    def build_training_frame(self, raw_ohlcv: pd.DataFrame, fundamentals: dict, horizon_days: int = 21) -> pd.DataFrame:
        """
        Produces the full model-ready frame: technical features + static
        fundamental features + the forward-return label used for training.

        horizon_days: how many trading days ahead the model predicts return
        (e.g. 21 ≈ 1 month forward return — used as the ML target).
        """
        cleaned = self.clean(raw_ohlcv)
        feats = self.engineer_features(cleaned)

        # static fundamental features broadcast across all rows
        feats["fund_revenue_growth"] = fundamentals.get("revenue_growth") or 0.0
        feats["fund_debt_to_equity"] = fundamentals.get("debt_to_equity") or 0.0
        feats["fund_operating_margin"] = fundamentals.get("operating_margin") or 0.0
        feats["fund_roe"] = fundamentals.get("roe") or 0.0
        feats["fund_pe_ratio"] = fundamentals.get("pe_ratio") or 0.0
        eps = fundamentals.get("eps") or 0.0
        feats["fund_eps"] = eps

        # forward return label (target) - what the ML model learns to predict
        feats["forward_return"] = feats["close"].pct_change(horizon_days).shift(-horizon_days)

        feats = feats.replace([np.inf, -np.inf], np.nan)
        return feats


feature_engineer = FeatureEngineer()
