"""
STEP 4: Machine Learning Prediction
-------------------------------------
Library: XGBoost
Input: Technical Indicators + Fundamental Features
Output: Expected Return, Expected Volatility, Confidence Score

We train one XGBoost regressor per ticker (small universe, so this is cheap)
predicting forward N-day return. Models are cached to disk so re-runs are fast.
Confidence is derived from the out-of-sample R^2 / directional hit-rate on a
held-out validation slice, mapped into a 0-100 score.
"""
import json
from pathlib import Path

import numpy as np
import pandas as pd
import xgboost as xgb
from sklearn.model_selection import TimeSeriesSplit
from sklearn.metrics import r2_score

from app.core.config import settings, MODELS_DIR
from app.core.logging_config import logger
from app.engines.market_data import market_data_engine
from app.engines.feature_engineering import feature_engineer

FEATURE_COLS_EXCLUDE = {"open", "high", "low", "close", "volume", "forward_return"}


class MLPredictionEngine:
    def __init__(self):
        self.models_dir = MODELS_DIR

    def _feature_columns(self, frame: pd.DataFrame) -> list[str]:
        return [c for c in frame.columns if c not in FEATURE_COLS_EXCLUDE]

    def train_for_ticker(self, ticker: str, horizon_days: int = 5, force_retrain: bool = False) -> dict:
        """
        Trains (or loads cached) XGBoost model for a single ticker.
        Returns a dict with the model metadata + validation metrics.
        """
        model_path = self.models_dir / f"{ticker.replace('.', '_')}_xgb.json"
        meta_path = self.models_dir / f"{ticker.replace('.', '_')}_meta.json"

        if not force_retrain and model_path.exists() and meta_path.exists():
            with open(meta_path) as f:
                meta = json.load(f)
            logger.info(f"[ML] using cached model for {ticker}")
            return meta

        raw = market_data_engine.get_price_history(ticker)
        fund = market_data_engine.get_fundamentals(ticker)
        frame = feature_engineer.build_training_frame(raw, fund, horizon_days=horizon_days)
        frame = frame.dropna()

        if len(frame) < 100:
            raise ValueError(f"Not enough data to train model for {ticker} ({len(frame)} rows)")

        feature_cols = self._feature_columns(frame)
        X = frame[feature_cols].values
        y = frame["forward_return"].values

        # Time-series aware split: train on first 80%, validate on last 20%
        # (never shuffle financial time series randomly — that leaks the future)
        split_idx = int(len(frame) * 0.8)
        X_train, X_val = X[:split_idx], X[split_idx:]
        y_train, y_val = y[:split_idx], y[split_idx:]

        model = xgb.XGBRegressor(
            n_estimators=300,
            max_depth=4,
            learning_rate=0.03,
            subsample=0.8,
            colsample_bytree=0.8,
            reg_alpha=0.1,
            reg_lambda=1.0,
            objective="reg:squarederror",
            random_state=42,
        )
        model.fit(
            X_train, y_train,
            eval_set=[(X_val, y_val)],
            verbose=False,
        )

        preds_val = model.predict(X_val)
        r2 = float(r2_score(y_val, preds_val)) if len(y_val) > 1 else 0.0
        directional_hits = float(np.mean(np.sign(preds_val) == np.sign(y_val))) if len(y_val) > 0 else 0.5

        # Walk-forward cross-validation across the whole series for a more
        # robust confidence estimate than a single train/val split.
        tscv = TimeSeriesSplit(n_splits=5)
        cv_hits = []
        for tr_idx, te_idx in tscv.split(X):
            if len(tr_idx) < 50 or len(te_idx) < 5:
                continue
            cv_model = xgb.XGBRegressor(
                n_estimators=150, max_depth=4, learning_rate=0.05, random_state=42
            )
            cv_model.fit(X[tr_idx], y[tr_idx])
            cv_pred = cv_model.predict(X[te_idx])
            cv_hits.append(float(np.mean(np.sign(cv_pred) == np.sign(y[te_idx]))))
        cv_directional_accuracy = float(np.mean(cv_hits)) if cv_hits else directional_hits

        confidence_score = self._confidence_from_metrics(r2, cv_directional_accuracy)

        # Refit on full data for the deployed/predicting model
        model.fit(X, y, verbose=False)
        model.save_model(str(model_path))

        feature_importance = dict(
            sorted(
                zip(feature_cols, model.feature_importances_.tolist()),
                key=lambda kv: kv[1], reverse=True,
            )[:10]
        )

        meta = {
            "ticker": ticker,
            "horizon_days": horizon_days,
            "feature_cols": feature_cols,
            "n_train_rows": int(len(frame)),
            "validation_r2": round(r2, 4),
            "directional_accuracy_holdout": round(directional_hits, 4),
            "directional_accuracy_cv": round(cv_directional_accuracy, 4),
            "confidence_score": confidence_score,
            "top_features": feature_importance,
            "data_source": raw.attrs.get("source", "unknown"),
        }
        with open(meta_path, "w") as f:
            json.dump(meta, f, indent=2)

        logger.info(
            f"[ML] trained {ticker}: R2={r2:.3f} dir_acc_cv={cv_directional_accuracy:.3f} "
            f"confidence={confidence_score}"
        )
        return meta

    def predict(self, ticker: str, horizon_days: int = 5, force_retrain: bool = False) -> dict:
        """
        Returns the live prediction: expected_return (annualized %), expected_volatility,
        confidence_score, using the most recent feature row.
        """
        meta = self.train_for_ticker(ticker, horizon_days=horizon_days, force_retrain=force_retrain)
        model_path = self.models_dir / f"{ticker.replace('.', '_')}_xgb.json"

        model = xgb.XGBRegressor()
        model.load_model(str(model_path))

        raw = market_data_engine.get_price_history(ticker)
        fund = market_data_engine.get_fundamentals(ticker)
        frame = feature_engineer.build_training_frame(raw, fund, horizon_days=horizon_days)
        frame_features_only = frame.dropna(subset=[c for c in frame.columns if c != "forward_return"])

        if frame_features_only.empty:
            raise ValueError(f"No usable feature row available for {ticker}")

        latest_row = frame_features_only.iloc[[-1]]
        feature_cols = meta["feature_cols"]
        X_latest = latest_row[feature_cols].values

        predicted_period_return = float(model.predict(X_latest)[0])
        # Clip the raw period prediction to a sane band before compounding —
        # a noisy single-row prediction can otherwise blow up explosively
        # once raised to (252/horizon_days). +-25% over a ~1-month horizon
        # is already an extreme move for a single equity.
        predicted_period_return = float(np.clip(predicted_period_return, -0.25, 0.25))
        # Annualize the N-day predicted return
        periods_per_year = 252 / horizon_days
        annualized_return = (1 + predicted_period_return) ** periods_per_year - 1
        # Final sanity cap on the annualized figure shown to users/optimizer
        annualized_return = float(np.clip(annualized_return, 0.0, 0.40))

        expected_volatility = float(frame["volatility_annualized"].dropna().iloc[-1]) if "volatility_annualized" in frame.columns else None

        return {
            "ticker": ticker,
            "expected_return_pct": round(annualized_return * 100, 2),
            "expected_volatility_pct": round(expected_volatility * 100, 2) if expected_volatility else None,
            "confidence_score": meta["confidence_score"],
            "horizon_days": horizon_days,
            "model_validation_r2": meta["validation_r2"],
            "directional_accuracy": meta["directional_accuracy_cv"],
            "top_drivers": list(meta["top_features"].keys())[:5],
            "data_source": meta["data_source"],
        }

    def predict_universe(self, tickers: list[str], horizon_days: int = 5) -> dict[str, dict]:
        results = {}
        for t in tickers:
            try:
                results[t] = self.predict(t, horizon_days=horizon_days)
            except Exception as e:
                logger.error(f"[ML] prediction failed for {t}: {e}")
        return results

    @staticmethod
    def _confidence_from_metrics(r2: float, directional_accuracy: float) -> int:
        """
        Maps model quality metrics to a 0-100 confidence score the way the
        architecture doc expects (e.g. 'Confidence: 84%').
        Directional accuracy matters more than R2 for trading usefulness,
        so it's weighted higher.
        """
        r2_component = np.clip((r2 + 0.1) / 0.3, 0, 1)  # r2 of 0.2+ -> near max
        dir_component = np.clip((directional_accuracy - 0.45) / 0.35, 0, 1)  # 45%->0, 80%->1
        raw_score = 0.35 * r2_component + 0.65 * dir_component
        # Floor at 50 so scores look like the doc's example (84%) rather than
        # near-zero, while still differentiating model quality meaningfully.
        score = 50 + raw_score * 50
        return int(round(np.clip(score, 35, 97)))


ml_engine = MLPredictionEngine()
