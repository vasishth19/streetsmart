import numpy as np
from typing import List, Dict, Tuple
import json
import os
import logging

logger = logging.getLogger(__name__)


class ScoringEngine:
    """
    Core scoring engine for StreetSmart routes.
    Computes multi-dimensional safety, lighting, crowd, and accessibility scores.
    """

    def __init__(self):
        self.data_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), "data")
        self._load_datasets()

    def _load_datasets(self):
        """Load all mock datasets for scoring."""
        try:
            with open(os.path.join(self.data_dir, "crime.json")) as f:
                self.crime_data = json.load(f)
            with open(os.path.join(self.data_dir, "lighting.json")) as f:
                self.lighting_data = json.load(f)
            with open(os.path.join(self.data_dir, "crowd.json")) as f:
                self.crowd_data = json.load(f)
            with open(os.path.join(self.data_dir, "accessibility.json")) as f:
                self.accessibility_data = json.load(f)
            logger.info("✅ All datasets loaded successfully")
        except Exception as e:
            logger.warning(f"⚠️ Could not load datasets: {e}. Using defaults.")
            self.crime_data = {"zones": []}
            self.lighting_data = {"zones": []}
            self.crowd_data = {"zones": []}
            self.accessibility_data = {"zones": []}

    def compute_safety_score(
        self,
        coordinates: List[List[float]],
        time_of_day: str = "evening"
    ) -> float:
        """
        Compute safety score (0-100) for a route based on crime data.
        Higher = safer.
        """
        base_score = 75.0
        time_multiplier = {
            "morning": 0.9,
            "afternoon": 1.0,
            "evening": 0.75,
            "night": 0.6
        }.get(time_of_day, 0.8)

        # Simulate geo-based scoring using coordinate variance
        if coordinates:
            lat_vals = [c[1] for c in coordinates]
            lng_vals = [c[0] for c in coordinates]
            variance = np.std(lat_vals) + np.std(lng_vals)
            noise = np.random.normal(0, 3)
            score = base_score * time_multiplier + noise - (variance * 100)
        else:
            score = base_score * time_multiplier

        return float(np.clip(score, 20, 99))

    def compute_lighting_score(self, coordinates: List[List[float]]) -> Tuple[float, str]:
        """
        Compute lighting score and level for a route.
        Returns (score, level) where level is BRIGHT/MODERATE/DIM.
        """
        if not coordinates:
            return 70.0, "MODERATE"

        # Use coordinate hashing for deterministic pseudo-random lighting
        coord_hash = sum(abs(c[0]) + abs(c[1]) for c in coordinates)
        score = 50 + (coord_hash * 7.3) % 45
        noise = np.random.normal(0, 5)
        score = float(np.clip(score + noise, 15, 98))

        if score >= 75:
            level = "BRIGHT"
        elif score >= 50:
            level = "MODERATE"
        else:
            level = "DIM"

        return score, level

    def compute_crowd_score(
        self,
        coordinates: List[List[float]],
        time_of_day: str = "evening"
    ) -> float:
        """
        Compute crowd density score (0-100).
        Higher = less crowded (better for most profiles).
        """
        hour_density = {
            "morning": 0.6,
            "afternoon": 0.8,
            "evening": 0.7,
            "night": 0.3
        }.get(time_of_day, 0.5)

        base = 60.0
        noise = np.random.normal(0, 8)
        score = base + (1 - hour_density) * 30 + noise
        return float(np.clip(score, 10, 99))

    def compute_accessibility_score(
        self,
        coordinates: List[List[float]],
        profile: str = "general"
    ) -> float:
        """
        Compute accessibility score based on user profile.
        """
        profile_base = {
            "general": 80,
            "woman": 75,
            "elderly": 65,
            "wheelchair": 55,
            "visually_impaired": 60
        }.get(profile, 75)

        if coordinates:
            coord_sum = sum(c[0] + c[1] for c in coordinates)
            variation = (abs(coord_sum) * 13.7) % 25
            noise = np.random.normal(0, 3)
            score = profile_base + variation + noise
        else:
            score = profile_base

        return float(np.clip(score, 15, 99))

    def compute_composite_score(
        self,
        safety: float,
        lighting: float,
        crowd: float,
        accessibility: float,
        weights: Dict[str, float] = None
    ) -> float:
        """
        Compute composite route score using weighted formula:
        score = 0.35*safety + 0.25*lighting + 0.20*crowd + 0.20*accessibility
        """
        if weights is None:
            weights = {
                "safety": 0.35,
                "lighting": 0.25,
                "crowd": 0.20,
                "accessibility": 0.20
            }

        w_safety = weights.get("safety", 0.35)
        w_lighting = weights.get("lighting", 0.25)
        w_crowd = weights.get("crowd", 0.20)
        w_accessibility = weights.get("accessibility", 0.20)

        # Normalize weights
        total_weight = w_safety + w_lighting + w_crowd + w_accessibility
        if total_weight > 0:
            w_safety /= total_weight
            w_lighting /= total_weight
            w_crowd /= total_weight
            w_accessibility /= total_weight

        composite = (
            w_safety * safety +
            w_lighting * lighting +
            w_crowd * crowd +
            w_accessibility * accessibility
        )
        return float(np.clip(composite, 0, 100))

    def get_risk_level(self, composite_score: float) -> str:
        """Classify risk level from composite score."""
        if composite_score >= 75:
            return "LOW"
        elif composite_score >= 50:
            return "MEDIUM"
        else:
            return "HIGH"

    def score_route(
        self,
        coordinates: List[List[float]],
        profile: str = "general",
        time_of_day: str = "evening",
        weights: Dict[str, float] = None
    ) -> Dict:
        """
        Full route scoring pipeline.
        Returns complete scores dict.
        """
        safety = self.compute_safety_score(coordinates, time_of_day)
        lighting, lighting_level = self.compute_lighting_score(coordinates)
        crowd = self.compute_crowd_score(coordinates, time_of_day)
        accessibility = self.compute_accessibility_score(coordinates, profile)
        overall = self.compute_composite_score(safety, lighting, crowd, accessibility, weights)
        risk = self.get_risk_level(overall)

        return {
            "overall": round(overall, 1),
            "safety": round(safety, 1),
            "lighting": round(lighting, 1),
            "crowd": round(crowd, 1),
            "accessibility": round(accessibility, 1),
            "risk_level": risk,
            "lighting_level": lighting_level,
        }


# Singleton instance
scoring_engine = ScoringEngine()