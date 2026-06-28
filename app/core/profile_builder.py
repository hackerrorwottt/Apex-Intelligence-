"""
FastAPI Backend Validation step from the architecture doc:
turns the raw Investment Profile Form submission into the validated
Investor Profile JSON used by every downstream engine.
"""
from app.schemas.profile import InvestorProfileRequest, InvestorProfile, RiskAppetite

RISK_LAMBDA = {
    RiskAppetite.conservative: 3.0,
    RiskAppetite.moderate: 1.5,
    RiskAppetite.aggressive: 0.6,
}


def build_investor_profile(req: InvestorProfileRequest) -> InvestorProfile:
    return InvestorProfile(
        user_id=req.user_id or "demo-user",
        capital=req.capital,
        risk_appetite=req.risk_appetite,
        investment_horizon_years=req.investment_horizon_years,
        goal=req.goal,
        preferred_sectors=req.preferred_sectors,
        excluded_sectors=req.excluded_sectors,
        preferred_tickers=req.preferred_tickers,
        excluded_tickers=req.excluded_tickers,
        risk_aversion_lambda=RISK_LAMBDA[req.risk_appetite],
    )
