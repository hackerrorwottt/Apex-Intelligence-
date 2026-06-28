"""
Central configuration for the Quant Trading Intelligence Platform backend.

All secrets are read from environment variables (.env) — never hardcoded.
"""
import os
from pathlib import Path
from dotenv import load_dotenv

# Load .env from project root
ROOT_DIR = Path(__file__).resolve().parent.parent.parent
load_dotenv(ROOT_DIR / ".env")

BASE_DIR = Path(__file__).resolve().parent.parent
DATA_DIR = BASE_DIR / "data"
CACHE_DIR = DATA_DIR / "cache"
MODELS_DIR = DATA_DIR / "models_store"
KB_DIR = DATA_DIR / "knowledge_base"
CHROMA_DIR = DATA_DIR / "chroma_store"

for d in [DATA_DIR, CACHE_DIR, MODELS_DIR, KB_DIR, CHROMA_DIR]:
    d.mkdir(parents=True, exist_ok=True)


class Settings:
    APP_NAME: str = "Quant Trading Intelligence Platform"
    APP_ENV: str = os.getenv("APP_ENV", "development")
    LOG_LEVEL: str = os.getenv("LOG_LEVEL", "INFO")

    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "").strip()

    # Unused legacy fields, kept only so existing .env files don't break.
    # Price data is now exclusively the fixed Kaggle CSV (see KAGGLE_CSV_PATH
    # below); fundamentals are unconditionally synthetic. Neither of these
    # flags is read anywhere in the current code.
    FINNHUB_API_KEY: str = os.getenv("FINNHUB_API_KEY", "").strip()
    FORCE_SYNTHETIC_DATA: bool = os.getenv("FORCE_SYNTHETIC_DATA", "false").lower() == "true"

    # Fixed investable universe — matches the architecture doc's examples.
    STOCK_UNIVERSE: list = [
        "TCS.NS", "INFY.NS", "RELIANCE.NS", "HDFCBANK.NS", "ICICIBANK.NS",
        "HINDUNILVR.NS", "ITC.NS", "SBIN.NS", "BHARTIARTL.NS", "KOTAKBANK.NS",
        "LT.NS", "ASIANPAINT.NS", "MARUTI.NS", "SUNPHARMA.NS", "TITAN.NS",
        "WIPRO.NS", "AXISBANK.NS", "ULTRACEMCO.NS",
    ]
    # ETFs / non-equity sleeve
    ETF_UNIVERSE: list = ["NIFTYBEES.NS", "GOLDBEES.NS"]

    # Benchmark: NIFTYBEES (Nifty 50 ETF) is used as the benchmark proxy.
    # The raw Nifty 50 index (^NSEI) is not present in the Kaggle NSE bhavcopy
    # dataset this backend now runs on (it only contains tradable equity/ETF
    # symbols, not index values), so NIFTYBEES — which tracks the index
    # closely and IS in the dataset — is the closest available substitute.
    BENCHMARK_TICKER: str = "NIFTYBEES.NS"

    # --- Data source: Kaggle NSE historical bhavcopy CSV (2016-2017) ---
    # This backend uses ONLY this fixed historical CSV for price data — no
    # live yfinance/Finnhub price calls. Fundamentals remain synthetic (the
    # CSV has no revenue/debt/ROE data — see KaggleDataEngine for details).
    KAGGLE_CSV_PATH: Path = DATA_DIR / "source_data" / "nse_universe_2016_2017.csv"
    DATA_START_DATE: str = "2016-01-01"
    DATA_END_DATE: str = "2017-12-29"  # last date present in the dataset

    HISTORY_PERIOD: str = "2y"  # informational only now; loader uses the full fixed CSV range
    RISK_FREE_RATE: float = 0.07  # ~ Indian 10Y G-Sec, annualized

    GEMINI_MODEL: str = "gemini-1.5-flash"

    CHROMA_COLLECTION: str = "investment_knowledge"


settings = Settings()
