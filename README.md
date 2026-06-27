# 🚀 Apex - AI Quantitative Investment Intelligence Platform

> **From Investment Goals to Intelligent Portfolios.**

Apex is an AI-powered quantitative investment intelligence platform that helps retail investors make data-driven investment decisions through machine learning, portfolio optimization, risk analytics, backtesting, explainable AI, and Retrieval-Augmented Generation (RAG).

Unlike traditional investment platforms that only provide market data or execute trades, Apex transforms natural language investment goals into optimized portfolios backed by quantitative finance and transparent AI explanations.

---

## 🌟 Features

### 🤖 AI-Powered Investment Assistant
- Natural language investment planning
- Personalized investor profiling
- Conversational financial advisor
- Explainable recommendations

---

### 📈 Machine Learning Return Prediction
- XGBoost-based return prediction
- Technical indicator engineering
- Feature importance analysis
- Confidence scoring

---

### 📊 Quantitative Portfolio Optimization
- Modern Portfolio Theory
- Efficient Frontier
- Maximum Sharpe Ratio Optimization
- Diversification Optimization
- Portfolio Weight Allocation

Powered by **PyPortfolioOpt**

---

### ⚠️ Advanced Risk Analytics

Institutional-grade risk analysis including:

- Sharpe Ratio
- Sortino Ratio
- Beta
- Portfolio Volatility
- Value at Risk (VaR)
- Maximum Drawdown
- Diversification Score

---

### 📉 Historical Backtesting

Validate every recommendation using historical market data.

Includes:

- CAGR
- Annual Returns
- Portfolio Growth
- Drawdown Analysis
- Benchmark Comparison
- Strategy Performance

Powered by **vectorbt**

---

### 📚 AI Research Vault (RAG)

Upload financial documents including:

- Annual Reports
- Research Papers
- SEBI Guidelines
- Investment Books

Our Retrieval-Augmented Generation pipeline grounds every AI explanation using trusted financial sources.

---

### 🧠 Explainable AI

Every recommendation includes:

- Why a stock was selected
- Expected return
- Allocation reasoning
- Risk contribution
- Supporting research
- Mathematical optimization explanation

No black-box AI.

---

## 🏗️ System Architecture

```text
                        USER
                          │
                   Login / Signup
                          │
                          ▼
               Investment Goal Form
        (Capital • Risk • Duration • Goal)
                          │
                          ▼
                  Investor Profiling
                          │
                          ▼
═══════════════════════════════════════════════
            QUANTITATIVE ENGINE
═══════════════════════════════════════════════
                          │
                          ▼
               Market Data Collection
             (Yahoo Finance / Finnhub)
                          │
                          ▼
          Data Cleaning & Feature Engineering
               (Pandas + NumPy)
                          │
                          ▼
       Technical Indicator Generation
                  (pandas-ta)
                          │
                          ▼
       Machine Learning Prediction
                   (XGBoost)
                          │
                          ▼
      Portfolio Optimization Engine
               (PyPortfolioOpt)
                          │
                          ▼
          Risk Analytics Engine
   (Sharpe • Beta • VaR • Volatility)
                          │
                          ▼
      Historical Backtesting Engine
                  (vectorbt)
                          │
                          ▼
         Recommendation JSON Output
═══════════════════════════════════════════════
                          │
                          ▼
═══════════════════════════════════════════════
             AI RESEARCH LAYER
═══════════════════════════════════════════════
                          │
                   User clicks Explain
                          │
                          ▼
                 RAG Search Engine
                          │
     ┌────────────┬─────────────┬────────────┐
     ▼            ▼             ▼
 Annual Reports  SEBI Docs   Finance Books
     │            │             │
     └────────────┴─────────────┘
                  ▼
          Relevant Knowledge
═══════════════════════════════════════════════
                  │
                  ▼
═══════════════════════════════════════════════
          EXPLAINABLE AI LAYER
═══════════════════════════════════════════════
                  │
                  ▼
         GPT-powered Recommendation
                  │
                  ▼
          Interactive Dashboard
                  │
                  ▼
         Live Monitoring & Alerts
```

---

# 🛠 Tech Stack

## Frontend

- Next.js 15
- React
- TypeScript
- Tailwind CSS
- shadcn/ui
- Framer Motion
- Recharts

---

## Backend

- FastAPI
- Python
- SQLAlchemy
- PostgreSQL
- JWT Authentication

---

## Machine Learning

- XGBoost
- Pandas
- NumPy
- pandas-ta

---

## Quantitative Finance

- PyPortfolioOpt

---

## Backtesting

- vectorbt

---

## AI

- OpenAI GPT
- LangChain
- ChromaDB

---

## APIs

- Yahoo Finance
- Finnhub

---

## Deployment

- Docker
- Vercel
- Railway

---

# 📂 Project Structure

```
apex/
│
├── frontend/
│   ├── app/
│   ├── components/
│   ├── hooks/
│   ├── lib/
│   └── utils/
│
├── backend/
│   ├── api/
│   ├── auth/
│   ├── models/
│   ├── services/
│   ├── database/
│   └── schemas/
│
├── ml/
│   ├── training/
│   ├── prediction/
│   ├── preprocessing/
│   └── saved_models/
│
├── quant/
│   ├── optimization/
│   ├── risk/
│   └── backtesting/
│
├── rag/
│   ├── embeddings/
│   ├── vector_store/
│   ├── ingestion/
│   └── retrieval/
│
├── docs/
│
└── README.md
```

---

# 🚀 How It Works

### Step 1

User enters investment goals.

```
Capital: ₹10,00,000
Risk: Moderate
Duration: 5 Years
Goal: Wealth Growth
```

---

### Step 2

Market data is collected and cleaned.

---

### Step 3

Technical indicators are generated.

---

### Step 4

XGBoost predicts expected stock returns.

---

### Step 5

PyPortfolioOpt constructs the optimal portfolio using Modern Portfolio Theory.

---

### Step 6

Risk metrics are calculated.

---

### Step 7

Portfolio is backtested using historical data.

---

### Step 8

If the user requests an explanation, the RAG engine retrieves relevant financial knowledge.

---

### Step 9

GPT generates a transparent explanation grounded in quantitative analysis and retrieved financial documents.

---

### Step 10

The optimized portfolio is presented through an interactive dashboard.

---

# 🎯 Target Users

- Retail Investors
- Wealth Advisors
- Financial Analysts
- Finance Students
- Investment Research Teams

---

# 🚀 Future Enhancements

- Broker API Integration
- Live Portfolio Rebalancing
- AI Market Sentiment Analysis
- Reinforcement Learning Strategies
- Multi-Asset Portfolio Support
- ESG Investing Module
- Mobile Application
- Multi-language Support

---

# 🤝 Contributors

Built with ❤️ for AI Hackathons.

---

# 📜 License

MIT License
