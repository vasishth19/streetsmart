from pydantic import BaseModel, Field
from typing import Optional
from enum import Enum


class AccessibilityNeed(str, Enum):
    NONE = "none"
    MOBILITY = "mobility"
    VISUAL = "visual"
    HEARING = "hearing"
    COGNITIVE = "cognitive"


class UserPreferenceProfile(BaseModel):
    profile_name: str
    safety_priority: float = Field(default=0.35, ge=0, le=1)
    lighting_priority: float = Field(default=0.25, ge=0, le=1)
    crowd_priority: float = Field(default=0.20, ge=0, le=1)
    accessibility_priority: float = Field(default=0.20, ge=0, le=1)
    avoid_stairs: bool = False
    avoid_construction: bool = True
    prefer_cctv_coverage: bool = False
    audio_navigation: bool = False
    accessibility_needs: AccessibilityNeed = AccessibilityNeed.NONE
    description: str = ""
    icon: str = ""
    color: str = "#00FF9C"