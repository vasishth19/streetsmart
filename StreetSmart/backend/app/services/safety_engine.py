import numpy as np
from typing import List, Dict, Tuple
import math
import logging

logger = logging.getLogger(__name__)


class SafetyEngine:
    """
    Advanced safety analysis engine.
    Generates heatmap data, incident zones, and safety analytics.
    """

    # Simulated high-risk zone centers (lat, lng, radius_km, risk_score)
    RISK_ZONES = [
        {"lat": 40.7128, "lng": -74.0060, "radius": 0.5, "risk": 0.8, "label": "High Crime Zone"},
        {"lat": 40.7580, "lng": -73.9855, "radius": 0.3, "risk": 0.6, "label": "Poor Lighting Area"},
        {"lat": 40.7282, "lng": -73.7949, "radius": 0.4, "risk": 0.7, "label": "Isolated Path"},
        {"lat": 40.6892, "lng": -74.0445, "radius": 0.6, "risk": 0.5, "label": "Construction Zone"},
        {"lat": 40.7489, "lng": -73.9680, "radius": 0.3, "risk": 0.9, "label": "Critical Zone"},
        {"lat": 40.7614, "lng": -73.9776, "radius": 0.2, "risk": 0.4, "label": "Moderate Risk"},
    ]

    def _distance_km(self, lat1: float, lng1: float, lat2: float, lng2: float) -> float:
        """Haversine distance in km."""
        R = 6371
        dlat = math.radians(lat2 - lat1)
        dlng = math.radians(lng2 - lng1)
        a = (math.sin(dlat/2)**2 +
             math.cos(math.radians(lat1)) *
             math.cos(math.radians(lat2)) *
             math.sin(dlng/2)**2)
        return R * 2 * math.asin(math.sqrt(a))

    def generate_heatmap(
        self,
        center_lat: float = 40.7128,
        center_lng: float = -74.0060,
        radius_km: float = 3.0,
        num_points: int = 300
    ) -> List[Dict]:
        """
        Generate safety heatmap data points.
        Returns list of {lat, lng, intensity} dicts.
        """
        points = []

        # Generate random points within radius
        for _ in range(num_points):
            # Random point within circle
            angle = np.random.uniform(0, 2 * math.pi)
            r = radius_km * math.sqrt(np.random.uniform(0, 1))
            lat = center_lat + (r / 111.0) * math.cos(angle)
            lng = center_lng + (r / (111.0 * math.cos(math.radians(center_lat)))) * math.sin(angle)

            # Compute risk based on proximity to risk zones
            max_risk = 0.1
            for zone in self.RISK_ZONES:
                dist = self._distance_km(lat, lng, zone["lat"], zone["lng"])
                if dist < zone["radius"] * 2:
                    zone_risk = zone["risk"] * max(0, 1 - dist / (zone["radius"] * 2))
                    max_risk = max(max_risk, zone_risk)

            # Add noise
            intensity = float(np.clip(max_risk + np.random.normal(0, 0.05), 0, 1))

            points.append({
                "lat": round(lat, 6),
                "lng": round(lng, 6),
                "intensity": round(intensity, 3),
                "risk_level": "HIGH" if intensity > 0.6 else "MEDIUM" if intensity > 0.3 else "LOW"
            })

        return points

    def get_area_safety_stats(
        self,
        lat: float,
        lng: float,
        radius_km: float = 1.0
    ) -> Dict:
        """Get aggregated safety statistics for an area."""
        heatmap = self.generate_heatmap(lat, lng, radius_km, num_points=100)
        intensities = [p["intensity"] for p in heatmap]

        return {
            "mean_risk": round(float(np.mean(intensities)), 3),
            "max_risk": round(float(np.max(intensities)), 3),
            "safe_percentage": round(
                len([i for i in intensities if i < 0.3]) / len(intensities) * 100, 1
            ),
            "high_risk_count": len([i for i in intensities if i > 0.6]),
            "total_points": len(heatmap),
        }

    def get_incident_zones(self) -> List[Dict]:
        """Return incident zone data for map overlay."""
        zones = []
        for zone in self.RISK_ZONES:
            zones.append({
                "lat": zone["lat"],
                "lng": zone["lng"],
                "radius_m": int(zone["radius"] * 1000),
                "risk_score": zone["risk"],
                "label": zone["label"],
                "color": "#FF3B3B" if zone["risk"] > 0.7 else "#FFB020" if zone["risk"] > 0.4 else "#00FF9C"
            })
        return zones


# Singleton
safety_engine = SafetyEngine()