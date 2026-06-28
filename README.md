# Quant Trading Intelligence Platform — Backend (Patched Final Build)

This zip is the **full backend** — all 8 quant pipeline steps, RAG,
Sentiment, Decision Intelligence, GPT Explanation Layer, FastAPI routers,
and `main.py` wiring everything together over HTTP.

The FastAPI layer (`main.py`, all 5 routers, `session_store.py`,
`responses.py` schemas, and a rewritten `gpt_explanation.py`) was built on
top of an earlier checkpoint of this backend, outside of this immediate
session. Two real bugs were found in that layer during review here and
have now been fixed in this zip — see below.

## 🔧 Bugs fixed in this build

1. **Dead Gemini integration.** `gpt_explanation.py` was importing the
   deprecated `google.generativeai` package (`import google.generativeai as
   genai`, `genai.configure()`, `GenerativeModel(...)`), while
   `requirements.txt` installs the current `google-genai` package, which
   exposes a different import path (`from google import genai`) and call
   shape (`client.models.generate_content(...)`). The mismatch meant any
   Gemini call would raise `ModuleNotFoundError` internally and silently
   fall back to the template every time — **even with a valid API key**.
   Fixed: now imports and calls the SDK that's actually installed.

2. **Wrong risk-metric key names**, in two places, both assuming keys
   `annual_volatility_pct` / `var_95_pct`, when `risk_analysis.py` actually
   returns `portfolio_volatility_pct` / `value_at_risk_95_pct`:
   - `gpt_explanation.py`'s template fallback — volatility and VaR always
     printed "N/A" in the explanation text, even with real data present.
   - `app/routers/monitoring.py`'s drift check — volatility-spike and
     VaR-spike alerts could never fire, since both compared the current
     value against a phantom `0` baseline (`stored_risk.get(wrong_key) or
     0`). The Sharpe-drop alert was unaffected — that key name was correct.

   Both now read the correct keys. If you add new code that reads risk
   metrics, the authoritative key names are defined in
   `app/engines/risk_analysis.py`'s `analyze()` return dict — check there
   directly rather than assuming a name.

## 📊 Data source switch: Kaggle CSV instead of yfinance (this build)

Per project decision, this backend now uses **only** a fixed Kaggle NSE
historical dataset for price data — `app/data/source_data/nse_universe_2016_2017.csv`
(trimmed from a larger Kaggle bhavcopy export down to just the 20 tickers in
`STOCK_UNIVERSE`/`ETF_UNIVERSE`). There is no live yfinance/Finnhub price
fetch left anywhere in the code; `yfinance` and `httpx` were removed from
`requirements.txt` since nothing imports them anymore.

**What changed:**
- `app/engines/market_data.py` — `get_price_history()` now loads from the
  Kaggle CSV via a `_KaggleCSVStore` (parsed once into memory, sliced
  per-symbol on each call, matched by stripping `.NS`/`.BO` suffixes).
- `app/core/config.py` — `BENCHMARK_TICKER` changed from `^NSEI` to
  `NIFTYBEES.NS`, since the raw Nifty 50 index isn't a tradable symbol and
  isn't in the dataset; NIFTYBEES (the Nifty 50 ETF) is, and tracks the
  index closely. Added `KAGGLE_CSV_PATH`, `DATA_START_DATE`,
  `DATA_END_DATE` settings.
- `app/engines/backtesting.py` — header/docstrings updated; the `period`
  parameter is now a no-op (accepted for interface compatibility, ignored),
  since there's no live "today" to vary a lookback window against — the
  full fixed CSV range is always used.
- Fundamentals (revenue growth, debt-to-equity, ROE, P/E, etc.) are
  **unaffected** — the Kaggle CSV has no fundamental data, so per project
  decision these remain on the existing deterministic synthetic generator,
  seeded per ticker so values are stable across runs.

**Verified in this session:** the CSV loading + per-symbol slicing logic
was tested directly with pandas (available in this sandbox even without
the full dependency set) — confirmed clean 495-row OHLCV series per ticker,
no NaNs, correct date range (2016-01-01 to 2017-12-29), all 20 configured
tickers present including both ETFs. The downstream ML/risk/backtest
engines that consume this data were **not** re-executed end-to-end in this
session (same sandbox limitation as before — no xgboost/pandas-ta/vectorbt
installed here), but their code reads the same `open/high/low/close/volume`
DataFrame shape as before, so the interface contract is unchanged.

**⚠️ Real consequence worth knowing about — Live Monitoring is now a
structural no-op.** Both price data (fixed historical CSV) and fundamentals
(deterministic seeded synthetic) are 100% static now. That means
`POST /api/monitor/{session_id}` will **always** report "no significant
change" — there is nothing left that can vary between two calls. This is
documented directly in `app/routers/monitoring.py`'s docstring. If you need
to demo drift detection working, you'll need to either inject a second,
deliberately different fundamentals/price snapshot to compare against, or
present this endpoint's logic conceptually rather than expecting a live
fire.

## What's still genuinely untested end-to-end

Steps 1–7, RAG, Sentiment, and Decision Intelligence were individually
smoke-tested in earlier sessions (see history below). The FastAPI layer
itself (`main.py` + routers) has **not been run** in any sandbox with the
real dependencies installed — only syntax-checked (`python3 -m py_compile`)
and reviewed line-by-line against the engines it calls. Run it on your
machine first; first-run issues (an env var, a missing `pypdf` for PDF
uploads, a chromadb version quirk) are still realistic and expected.

---

## History: checkpoint #2 details below

## What's done in this checkpoint

| Step (per architecture doc) | File | Status |
|---|---|---|
| Step 1: Market Data | `app/engines/market_data.py` | ✅ Tested (checkpoint 1) — real yfinance + Finnhub, synthetic fallback, disk caching |
| Step 2 & 3: Data Processing + Feature Engineering | `app/engines/feature_engineering.py` | ✅ Tested (checkpoint 1) — pandas/numpy cleanup + 50+ pandas-ta indicators |
| Step 4: ML Prediction | `app/engines/ml_prediction.py` | ✅ Tested (checkpoint 1) — real per-ticker XGBoost training, time-series CV, confidence scoring |
| Step 5: Portfolio Optimization | `app/engines/portfolio_optimization.py` | ✅ Tested (checkpoint 1) — real PyPortfolioOpt Max-Sharpe / Efficient Frontier, blends ML + historical returns |
| Step 6: Risk Analysis | `app/engines/risk_analysis.py` | ✅ Tested (checkpoint 1) — Sharpe, Sortino, Beta, VaR, Max Drawdown, Diversification Score |
| Step 7: Backtesting | `app/engines/backtesting.py` | ✅ Tested (checkpoint 1) — real vectorbt backtest, portfolio vs Nifty 50, CAGR/win-rate/drawdown |
| Investor Profile validation | `app/schemas/profile.py`, `app/core/profile_builder.py` | ✅ Tested (checkpoint 1) — Pydantic validation matching the doc's "FastAPI Backend Validation" step |
| RAG Engine | `app/engines/rag_engine.py` | ⚠️ Written, **not yet run** — TF-IDF + ChromaDB, L2-normalized vectors, fit-once-per-index vectorizer lifecycle, 3 seed knowledge-base docs included |
| Market Sentiment Engine | `app/engines/sentiment_engine.py` | ⚠️ Written, **not yet run** — lexicon-based sentiment over real fundamentals-derived statements, calibrated confidence scoring |
| Decision Intelligence Engine | `app/engines/decision_intelligence.py` | ⚠️ Written, **not yet run** — merges all 6 engines into one Recommendation JSON |

## Important: real data vs synthetic fallback

Every engine **tries real data first** (yfinance for prices/fundamentals,
Finnhub as a fundamentals backup). If live calls fail — no internet, rate
limit, delisted ticker, blocked network — it falls back to a **seeded,
deterministic synthetic generator** so the pipeline never breaks. You'll see
this clearly in logs (`source=synthetic` vs `source=yfinance`).

On your own machine with normal internet access, this will pull **real NSE
data**. In the sandbox used to build/test this, Yahoo Finance's hosts are
network-blocked, so all testing here ran on the synthetic fallback — which is
why you'll see that in the example outputs below. The code path for real data
is fully implemented and will activate automatically once you run it
somewhere with normal internet access.

## How to run / test what's here right now

```bash
cd quant-backend
python3 -m venv venv && source venv/bin/activate    # optional but recommended
pip install -r requirements.txt
cp .env.example .env   # then fill in GEMINI_API_KEY later for the GPT layer (not needed for these engines yet)
```

Quick smoke test (run from the `quant-backend` folder):

```python
from app.schemas.profile import InvestorProfileRequest
from app.core.profile_builder import build_investor_profile
from app.engines.portfolio_optimization import portfolio_optimizer
from app.engines.risk_analysis import risk_engine
from app.engines.backtesting import backtest_engine

req = InvestorProfileRequest(
    capital=1_000_000,
    risk_appetite="Moderate",
    investment_horizon_years=5,
    goal="Long-Term Wealth",
)
profile = build_investor_profile(req)

opt_result = portfolio_optimizer.optimize(profile)
print(opt_result["weights_pct"])

risk_result = risk_engine.analyze(opt_result["weights_pct"])
print(risk_result)

bt_result = backtest_engine.run(opt_result["weights_pct"], initial_capital=profile.capital)
print(bt_result["portfolio_total_return_pct"], "vs Nifty", bt_result["benchmark_total_return_pct"])
```

First run will be slower (trains ~18 XGBoost models, one per stock in the
universe — cached afterwards). Subsequent runs reuse cached models/data from
`app/data/cache` and `app/data/models_store`.

### New in checkpoint 2: full Recommendation JSON smoke test

This exercises RAG + Sentiment + Decision Intelligence on top of the
checkpoint-1 engines, in one call:

```python
from app.schemas.profile import InvestorProfileRequest
from app.core.profile_builder import build_investor_profile
from app.engines.decision_intelligence import decision_engine

req = InvestorProfileRequest(
    capital=1_000_000,
    risk_appetite="Moderate",
    investment_horizon_years=5,
    goal="Long-Term Wealth",
)
profile = build_investor_profile(req)

# include_backtest=False first run to iterate faster; set True once stable
recommendation = decision_engine.build_recommendation(profile, include_backtest=True)

import json
print(json.dumps(recommendation, indent=2, default=str))
```

You can also exercise the RAG engine on its own:

```python
from app.engines.rag_engine import rag_engine
results = rag_engine.search("diversification and gold hedge against equity risk", top_k=3)
for r in results:
    print(r["relevance_score"], r["source"], r["text"][:80])
```

And the sentiment engine on its own:

```python
from app.engines.sentiment_engine import sentiment_engine
print(sentiment_engine.analyze_ticker("TCS.NS"))
```

If something breaks on first run, it's most likely one of: a missing
`pypdf` dependency (only needed if you call `rag_engine.index_pdf_bytes`,
not needed for the seed knowledge base), or a ChromaDB version quirk in
`get_or_create_collection`/`delete_collection` signatures across chromadb
versions — pin to `chromadb==0.5.3` as in `requirements.txt` if you hit
this.

## Known limitations at this checkpoint (will be addressed next)

- No FastAPI app/routes yet — these are pure Python modules, not yet exposed
  over HTTP. `main.py` is not created yet.
- No GPT Explanation Layer (Gemini integration) yet.
- No Live Monitoring / scheduler yet.
- No in-memory session store for the chat assistant yet.
- RAG / Sentiment / Decision Intelligence are new in this checkpoint and
  **have not been executed** in any sandbox yet — see the disclaimer at the
  top of this file. Run the smoke tests above first.
- `.env` is intentionally **not** included in this zip — only `.env.example`.
  Never commit a real API key to a repo or paste one into a chat. If you ever
  pasted a real key anywhere outside your own `.env` file, regenerate it.

## Project structure so far

```
quant-backend/
├── app/
│   ├── core/
│   │   ├── config.py          # Settings, stock universe, paths
│   │   ├── logging_config.py
│   │   └── profile_builder.py # Investor Profile Form -> validated JSON
│   ├── engines/
│   │   ├── market_data.py
│   │   ├── feature_engineering.py
│   │   ├── ml_prediction.py
│   │   ├── portfolio_optimization.py
│   │   ├── risk_analysis.py
│   │   ├── backtesting.py
│   │   ├── rag_engine.py              # NEW — checkpoint 2
│   │   ├── sentiment_engine.py        # NEW — checkpoint 2
│   │   └── decision_intelligence.py   # NEW — checkpoint 2
│   ├── schemas/
│   │   └── profile.py
│   ├── models/        # (empty for now — reserved for future ORM models)
│   ├── routers/        # (empty for now — FastAPI routes coming next)
│   ├── utils/           # (empty for now)
│   └── data/
│       ├── cache/                 # gitignore this in real use — local data cache
│       ├── models_store/          # trained XGBoost models per ticker
│       ├── chroma_store/          # ChromaDB persistent store (created on first RAG run)
│       └── knowledge_base/        # 3 seed .txt docs (portfolio theory, SEBI, IT sector)
├── requirements.txt
└── .env.example
```

## Next up (checkpoint 3)

1. GPT Explanation Layer — Gemini via `google-genai`, with a template-based
   fallback so the demo works even without a live key.
2. FastAPI routers + `main.py` — profile → recommendation endpoint, RAG
   upload endpoint, chat endpoint (grounded in the last recommendation via
   an in-memory session store), backtest endpoint.
3. Live Monitoring endpoint — on-demand re-check for drift/news rather than
   a background scheduler (more demo-friendly and testable).
