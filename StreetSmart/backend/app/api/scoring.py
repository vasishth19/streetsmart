from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Optional, Dict
import logging

from app.services.scoring_engine import scoring_engine

router = APIRouter()
logger = logging.getLogger(__name__)


class ScoringRequest(BaseModel):
    coordinates: List[List[float]]
    profile: str = "general"
    time_of_day: str = "evening"
    weights: Optional[Dict[str, float]] = None


@router.post("/score")
async def score_route(request: ScoringRequest):
    """
    Score a route given its coordinates and user profile.
    """
    try:
        scores = scoring_engine.score_route(
            coordinates=request.coordinates,
            profile=request.profile,
            time_of_day=request.time_of_day,
            weights=request.weights
        )
        return {"scores": scores, "profile": request.profile}
    except Exception as e:
        logger.error(f"Scoring error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/score/profiles")
async def get_scoring_profiles():
    """Get default scoring weight profiles for each user type."""
    return {
        "profiles": {
            "general": {
                "weight_safety": 0.35,
                "weight_lighting": 0.25,
                "weight_crowd": 0.20,
                "weight_accessibility": 0.20,
            },
            "woman": {
                "weight_safety": 0.45,
                "weight_lighting": 0.30,
                "weight_crowd": 0.15,
                "weight_accessibility": 0.10,
            },
            "elderly": {
                "weight_safety": 0.30,
                "weight_lighting": 0.20,
                "weight_crowd": 0.15,
                "weight_accessibility": 0.35,
            },
            "wheelchair": {
                "weight_safety": 0.25,
                "weight_lighting": 0.15,
                "weight_crowd": 0.10,
                "weight_accessibility": 0.50,
            },
            "visually_impaired": {
                "weight_safety": 0.35,
                "weight_lighting": 0.30,
                "weight_crowd": 0.15,
                "weight_accessibility": 0.20,
            },
        }
    }