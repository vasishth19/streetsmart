from typing import List, Dict
import numpy as np
import logging

logger = logging.getLogger(__name__)


class AccessibilityEngine:
    """
    Accessibility classification engine.
    Evaluates routes for wheelchair, elderly, and visually impaired users.
    """

    ACCESSIBILITY_FEATURES = {
        "ramps": {"present": 0.7, "weight": 0.25},
        "tactile_paving": {"present": 0.5, "weight": 0.20},
        "audio_signals": {"present": 0.4, "weight": 0.15},
        "benches": {"present": 0.6, "weight": 0.10},
        "smooth_surface": {"present": 0.8, "weight": 0.15},
        "wide_footpath": {"present": 0.65, "weight": 0.10},
        "elevator_access": {"present": 0.3, "weight": 0.05},
    }

    def classify_route_accessibility(
        self,
        coordinates: List[List[float]],
        profile: str = "general"
    ) -> Dict:
        """
        Classify full accessibility profile of a route.
        """
        features_present = {}
        for feature, config in self.ACCESSIBILITY_FEATURES.items():
            # Simulate feature presence with random variation
            noise = np.random.normal(0, 0.1)
            present = (config["present"] + noise) > 0.5
            features_present[feature] = bool(present)

        # Compute weighted accessibility score
        total_weight = sum(v["weight"] for v in self.ACCESSIBILITY_FEATURES.values())
        score = sum(
            self.ACCESSIBILITY_FEATURES[feat]["weight"]
            for feat, present in features_present.items()
            if present
        ) / total_weight * 100

        # Profile-specific adjustments
        profile_penalties = {
            "wheelchair": {"elevator_access": 2.0, "ramps": 2.0, "smooth_surface": 1.5},
            "elderly": {"benches": 1.5, "smooth_surface": 1.5, "wide_footpath": 1.3},
            "visually_impaired": {"tactile_paving": 2.0, "audio_signals": 2.0},
        }

        penalties = profile_penalties.get(profile, {})
        for feature, multiplier in penalties.items():
            if not features_present.get(feature, True):
                score -= (multiplier - 1) * 10

        score = float(np.clip(score, 10, 100))

        return {
            "score": round(score, 1),
            "features": features_present,
            "grade": "EXCELLENT" if score >= 80 else "GOOD" if score >= 60 else "FAIR" if score >= 40 else "POOR",
            "suitable_for": self._get_suitable_profiles(features_present),
        }

    def _get_suitable_profiles(self, features: Dict[str, bool]) -> List[str]:
        """Determine which user profiles this route suits."""
        suitable = ["general"]
        if features.get("ramps") and features.get("smooth_surface"):
            suitable.append("wheelchair")
        if features.get("benches") and features.get("smooth_surface"):
            suitable.append("elderly")
        if features.get("tactile_paving") and features.get("audio_signals"):
            suitable.append("visually_impaired")
        suitable.append("woman")
        return suitable


# Singleton
accessibility_engine = AccessibilityEngine()