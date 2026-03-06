from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from enum import Enum


class UserProfile(str, Enum):
    GENERAL = "general"
    WOMAN = "woman"
    ELDERLY = "elderly"
    WHEELCHAIR = "wheelchair"
    VISUALLY_IMPAIRED = "visually_impaired"


class TransportMode(str, Enum):
    WALKING = "walking"
    CYCLING = "cycling"
    DRIVING = "driving"


class Coordinates(BaseModel):
    lat: float = Field(..., ge=-90, le=90)
    lng: float = Field(..., ge=-180, le=180)


class RoutePreferences(BaseModel):
    user_profile: UserProfile = UserProfile.GENERAL
    transport_mode: TransportMode = TransportMode.WALKING
    avoid_stairs: bool = False
    avoid_crowds: bool = False
    prefer_lit: bool = True
    prefer_cameras: bool = False
    max_distance_km: float = Field(default=10.0, ge=0.1, le=100.0)
    weight_safety: float = Field(default=0.35, ge=0.0, le=1.0)
    weight_lighting: float = Field(default=0.25, ge=0.0, le=1.0)
    weight_crowd: float = Field(default=0.20, ge=0.0, le=1.0)
    weight_accessibility: float = Field(default=0.20, ge=0.0, le=1.0)


class RouteRequest(BaseModel):
    origin: Coordinates
    destination: Coordinates
    preferences: RoutePreferences = RoutePreferences()


class RouteScores(BaseModel):
    overall: float = Field(..., ge=0, le=100)
    safety: float = Field(..., ge=0, le=100)
    lighting: float = Field(..., ge=0, le=100)
    crowd: float = Field(..., ge=0, le=100)
    accessibility: float = Field(..., ge=0, le=100)
    risk_level: str  # LOW, MEDIUM, HIGH


class RouteSegment(BaseModel):
    coordinates: List[List[float]]
    distance_m: float
    duration_s: float
    street_name: str
    safety_score: float
    lighting_level: str  # BRIGHT, MODERATE, DIM
    has_cctv: bool
    is_accessible: bool
    surface_type: str


class RouteResult(BaseModel):
    id: str
    name: str
    description: str
    coordinates: List[List[float]]
    segments: List[RouteSegment]
    scores: RouteScores
    distance_km: float
    duration_min: float
    waypoints: List[Coordinates]
    audio_instructions: List[str]
    warnings: List[str]
    highlights: List[str]
    color: str  # Neon color for map display
    rank: int


class RoutesResponse(BaseModel):
    routes: List[RouteResult]
    origin: Coordinates
    destination: Coordinates
    recommended_route_id: str
    total_routes: int
    generated_at: str