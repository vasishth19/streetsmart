from fastapi import APIRouter
from app.models.user import UserPreferenceProfile

router = APIRouter()


@router.get("/preferences")
async def get_preference_profiles():
    """Get all available user preference profiles."""
    profiles = [
        UserPreferenceProfile(
            profile_name="general",
            safety_priority=0.35,
            lighting_priority=0.25,
            crowd_priority=0.20,
            accessibility_priority=0.20,
            description="Balanced route for general users",
            icon="🚶",
            color="#00E5FF",
        ),
        UserPreferenceProfile(
            profile_name="woman",
            safety_priority=0.45,
            lighting_priority=0.30,
            crowd_priority=0.15,
            accessibility_priority=0.10,
            prefer_cctv_coverage=True,
            description="Prioritizes safety, lighting and monitored streets",
            icon="👩",
            color="#FF69B4",
        ),
        UserPreferenceProfile(
            profile_name="elderly",
            safety_priority=0.30,
            lighting_priority=0.20,
            crowd_priority=0.15,
            accessibility_priority=0.35,
            avoid_stairs=True,
            description="Smooth paths with rest stops, no stairs",
            icon="🧓",
            color="#FFB020",
        ),
        UserPreferenceProfile(
            profile_name="wheelchair",
            safety_priority=0.25,
            lighting_priority=0.15,
            crowd_priority=0.10,
            accessibility_priority=0.50,
            avoid_stairs=True,
            description="Full wheelchair accessibility – ramps, smooth surfaces",
            icon="♿",
            color="#00FF9C",
        ),
        UserPreferenceProfile(
            profile_name="visually_impaired",
            safety_priority=0.35,
            lighting_priority=0.30,
            crowd_priority=0.15,
            accessibility_priority=0.20,
            audio_navigation=True,
            description="Audio-first navigation with tactile path guidance",
            icon="👁️",
            color="#B388FF",
        ),
    ]
    return {"profiles": [p.dict() for p in profiles]}