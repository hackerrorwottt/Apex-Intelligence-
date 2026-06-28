from fastapi import APIRouter
from pydantic import BaseModel
from typing import Optional

router = APIRouter(prefix="/api/profile", tags=["Profile"])

# Simple in-memory profile store for development. Replace with DB/auth in prod.
PROFILE = {
    "name": "Vedansh Saini",
    "role": "Portfolio Manager",
    "capital": "10,00,000",
    "riskAppetite": "Moderate",
    "horizon": "5 Years",
    "goal": "Long-Term Wealth",
}


class ProfileIn(BaseModel):
    name: Optional[str] = None
    role: Optional[str] = None
    capital: Optional[str] = None
    riskAppetite: Optional[str] = None
    horizon: Optional[str] = None
    goal: Optional[str] = None


@router.get("/", summary="Get current user profile")
async def get_profile():
    return PROFILE


@router.post("/", summary="Update current user profile")
async def update_profile(payload: ProfileIn):
    data = payload.dict(exclude_unset=True)
    for k, v in data.items():
        PROFILE[k] = v
    return PROFILE
