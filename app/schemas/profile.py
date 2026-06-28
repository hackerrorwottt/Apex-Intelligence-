"""
Schemas matching "Investment Profile Form" -> "Investor Profile JSON" in the
architecture doc, plus shared enums.
"""
from enum import Enum
from typing import Optional
from pydantic import BaseModel, Field, field_validator


class RiskAppetite(str, Enum):
    conservative = "Conservative"
    moderate = "Moderate"
    aggressive = "Aggressive"


class InvestmentGoal(str, Enum):
    long_term_wealth = "Long-Term Wealth"
    retirement = "Retirement"
    short_term_growth = "Short-Term Growth"
    passive_income = "Passive Income"
    capital_preservation = "Capital Preservation"


class InvestorProfileRequest(BaseModel):
    """Mirrors the 'Investment Profile Form' in the architecture doc."""
    capital: float = Field(..., gt=0, description="Total investable capital in INR")
    risk_appetite: RiskAppetite = RiskAppetite.moderate
    investment_horizon_years: int = Field(..., ge=1, le=40)
    goal: InvestmentGoal = InvestmentGoal.long_term_wealth
    preferred_sectors: list[str] = Field(default_factory=list)
    excluded_sectors: list[str] = Field(default_factory=list)
    preferred_tickers: list[str] = Field(default_factory=list)
    excluded_tickers: list[str] = Field(default_factory=list)
    user_id: Optional[str] = "demo-user"

    @field_validator("capital")
    @classmethod
    def capital_reasonable(cls, v):
        if v < 1000:
            raise ValueError("Capital must be at least ₹1,000")
        return v


class InvestorProfile(BaseModel):
    """The validated 'Investor Profile JSON' produced after FastAPI validation."""
    user_id: str
    capital: float
    risk_appetite: RiskAppetite
    investment_horizon_years: int
    goal: InvestmentGoal
    preferred_sectors: list[str]
    excluded_sectors: list[str]
    preferred_tickers: list[str]
    excluded_tickers: list[str]
    risk_aversion_lambda: float  # derived numeric risk-aversion used by optimizer


class ChatRequest(BaseModel):
    session_id: str
    message: str


class RAGUploadResponse(BaseModel):
    doc_id: str
    filename: str
    chunks_indexed: int
