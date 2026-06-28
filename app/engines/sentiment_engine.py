"""
MARKET SENTIMENT ENGINE
------------------------
Collects: Financial News, Company Announcements, Quarterly Results
Pipeline: Sentiment Analysis -> Positive / Negative / Neutral + Confidence

No real news API is wired in (would need a paid news feed for India-specific
company news at any real coverage). Instead, this engine generates
sentiment-bearing statements directly from each ticker's real fundamentals
(revenue growth, margins, debt, ROE, cash flow) -- i.e. real computation
over real(-ish) numbers, not a hardcoded label. A lightweight lexicon-based
scorer (no heavy NLP dependency) then classifies each statement.

Confidence scoring note: an earlier version multiplied "fraction of words
that are sentiment-bearing" by 10 and clipped at 1.0. On a short 6-word
sentence with even one strong sentiment word, that saturates to 100%
confidence immediately, which is not credible. The fixed version below
scales confidence by the absolute COUNT of sentiment-word hits (more
evidence in the sentence = more confidence), with a sentence-length-aware
ceiling, rather than a multiplier that explodes on short sentences.
"""
import re

import numpy as np

from app.core.logging_config import logger
from app.engines.market_data import market_data_engine


POSITIVE_WORDS = {
    "strong", "growth", "robust", "healthy", "positive", "improving",
    "outperform", "efficient", "resilient", "expanding", "solid",
    "beat", "upgrade", "bullish", "record", "accelerating", "stable",
}

NEGATIVE_WORDS = {
    "weak", "decline", "falling", "negative", "deteriorating", "miss",
    "downgrade", "bearish", "concern", "risk", "elevated", "high debt",
    "contracting", "sluggish", "lags", "underperform", "pressure",
}

NEGATION_WORDS = {"not", "no", "never", "without", "lacks", "lacking"}


class MarketSentimentEngine:

    def _tokenize(self, text: str) -> list[str]:
        return re.findall(r"[a-zA-Z]+", text.lower())

    def _score_statement(self, statement: str) -> dict:
        tokens = self._tokenize(statement)
        n_tokens = max(len(tokens), 1)

        pos_hits = sum(1 for t in tokens if t in POSITIVE_WORDS)
        neg_hits = sum(1 for t in tokens if t in NEGATIVE_WORDS)
        has_negation = any(t in NEGATION_WORDS for t in tokens)

        if has_negation:
            # crude negation handling: a negation word flips the dominant
            # polarity rather than literally inverting every hit
            pos_hits, neg_hits = neg_hits, pos_hits

        total_hits = pos_hits + neg_hits

        if total_hits == 0:
            return {"statement": statement, "label": "Neutral", "polarity": 0.0, "confidence": 0.5}

        polarity = (pos_hits - neg_hits) / total_hits
        if polarity > 0.15:
            label = "Positive"
        elif polarity < -0.15:
            label = "Negative"
        else:
            label = "Neutral"

        # Confidence: driven by how much sentiment evidence is present
        # relative to sentence length, using a hit-COUNT based scale (not a
        # raw-fraction multiplier that saturates on short sentences).
        # 1 hit in a short sentence -> moderate confidence; 2+ consistent
        # hits, or hits that make up a meaningful share of a longer
        # sentence, push confidence up gradually.
        density = total_hits / n_tokens
        count_component = np.clip(total_hits / 3, 0, 1)       # 3+ hits -> maxed
        density_component = np.clip(density * 4, 0, 1)         # gentler than *10
        agreement_component = abs(polarity)                    # 1.0 if unanimous

        confidence = 0.4 * count_component + 0.3 * density_component + 0.3 * agreement_component
        confidence = float(np.clip(0.45 + confidence * 0.5, 0.45, 0.97))

        return {
            "statement": statement,
            "label": label,
            "polarity": round(polarity, 3),
            "confidence": round(confidence, 3),
        }

    def _statements_from_fundamentals(self, ticker: str, fund: dict) -> list[str]:
        statements = []

        rev_growth = fund.get("revenue_growth")
        if rev_growth is not None:
            if rev_growth >= 0.15:
                statements.append(f"{ticker} reported strong revenue growth, outperforming expectations.")
            elif rev_growth >= 0.07:
                statements.append(f"{ticker} posted solid, steady revenue growth this period.")
            elif rev_growth >= 0.0:
                statements.append(f"{ticker} showed modest, sluggish revenue growth this period.")
            else:
                statements.append(f"{ticker} revenue is declining, a concerning signal for the sector.")

        op_margin = fund.get("operating_margin")
        if op_margin is not None:
            if op_margin >= 0.22:
                statements.append(f"{ticker} maintains a healthy, resilient operating margin.")
            elif op_margin >= 0.12:
                statements.append(f"{ticker} operating margin remains stable and efficient.")
            else:
                statements.append(f"{ticker} operating margin is under pressure, lagging peers.")

        debt_to_equity = fund.get("debt_to_equity")
        if debt_to_equity is not None:
            if debt_to_equity < 0.3:
                statements.append(f"{ticker} carries low debt, a healthy and resilient balance sheet.")
            elif debt_to_equity < 0.8:
                statements.append(f"{ticker} debt levels are moderate and stable, not a major risk.")
            else:
                statements.append(f"{ticker} has elevated debt, a risk factor flagged by analysts.")

        roe = fund.get("roe")
        if roe is not None:
            if roe >= 0.18:
                statements.append(f"{ticker} delivers strong, robust return on equity for shareholders.")
            elif roe >= 0.10:
                statements.append(f"{ticker} return on equity is healthy and improving.")
            else:
                statements.append(f"{ticker} return on equity is weak compared to sector peers.")

        ocf = fund.get("operating_cash_flow")
        revenue = fund.get("revenue")
        if ocf is not None and revenue:
            ocf_margin = ocf / revenue if revenue else 0
            if ocf_margin >= 0.18:
                statements.append(f"{ticker} generates robust, healthy operating cash flow.")
            elif ocf_margin >= 0.08:
                statements.append(f"{ticker} cash flow generation is stable and solid.")
            else:
                statements.append(f"{ticker} cash flow conversion is weak, a concern for analysts.")

        if not statements:
            statements.append(f"{ticker} fundamentals are broadly stable with no major signal either way.")

        return statements

    def analyze_ticker(self, ticker: str) -> dict:
        fund = market_data_engine.get_fundamentals(ticker)
        statements_text = self._statements_from_fundamentals(ticker, fund)
        scored = [self._score_statement(s) for s in statements_text]

        pos = [s for s in scored if s["label"] == "Positive"]
        neg = [s for s in scored if s["label"] == "Negative"]
        neu = [s for s in scored if s["label"] == "Neutral"]

        # Overall label: majority vote weighted by each statement's confidence
        weighted_polarity = sum(s["polarity"] * s["confidence"] for s in scored)
        total_weight = sum(s["confidence"] for s in scored) or 1.0
        avg_polarity = weighted_polarity / total_weight

        if avg_polarity > 0.1:
            overall_label = "Positive"
        elif avg_polarity < -0.1:
            overall_label = "Negative"
        else:
            overall_label = "Neutral"

        overall_confidence = round(float(np.mean([s["confidence"] for s in scored])), 3)

        return {
            "ticker": ticker,
            "overall_label": overall_label,
            "overall_confidence": overall_confidence,
            "overall_polarity": round(avg_polarity, 3),
            "positive_count": len(pos),
            "negative_count": len(neg),
            "neutral_count": len(neu),
            "statements": scored,
        }

    def analyze_universe(self, tickers: list[str]) -> dict[str, dict]:
        out = {}
        for t in tickers:
            try:
                out[t] = self.analyze_ticker(t)
            except Exception as e:
                logger.error(f"[Sentiment] failed for {t}: {e}")
        return out


sentiment_engine = MarketSentimentEngine()
