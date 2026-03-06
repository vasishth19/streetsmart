import numpy as np
import math
import uuid
from typing import List, Dict, Optional, Tuple
from datetime import datetime
import logging

from app.models.route import (
    RouteResult, RouteScores, RouteSegment,
    Coordinates, RoutePreferences, UserProfile
)
from app.services.scoring_engine import scoring_engine

logger = logging.getLogger(__name__)


class RoutingEngine:
    """
    Core routing engine for StreetSmart.
    Generates multiple route alternatives with different safety/accessibility profiles.
    """

    STREET_NAMES = [
        "Main Street", "Oak Avenue", "Park Boulevard", "Cedar Lane",
        "Maple Drive", "Elm Street", "Washington Ave", "Lincoln Blvd",
        "Market Street", "Broadway", "5th Avenue", "Harbor Way",
        "University Drive", "Garden Path", "Riverside Walk", "Station Road",
        "Commerce Street", "Heritage Lane", "Meadow Path", "City Center Way"
    ]

    ROUTE_PROFILES = [
        {
            "name": "Safest Route",
            "description": "Maximum safety with well-lit streets and CCTV coverage",
            "color": "#00FF9C",
            "deviation_factor": 1.3,
            "safety_boost": 15,
            "lighting_boost": 20,
            "crowd_boost": 5,
            "accessibility_boost": 10,
        },
        {
            "name": "Balanced Route",
            "description": "Optimal balance of safety, accessibility, and distance",
            "color": "#00E5FF",
            "deviation_factor": 1.1,
            "safety_boost": 5,
            "lighting_boost": 5,
            "crowd_boost": 10,
            "accessibility_boost": 5,
        },
        {
            "name": "Quickest Safe Route",
            "description": "Shortest path that meets minimum safety standards",
            "color": "#FFB020",
            "deviation_factor": 1.0,
            "safety_boost": 0,
            "lighting_boost": 0,
            "crowd_boost": 15,
            "accessibility_boost": 0,
        },
    ]

    def _haversine_distance(self, coord1: List[float], coord2: List[float]) -> float:
        """Calculate distance between two [lng, lat] coordinates in km."""
        R = 6371
        lat1, lon1 = math.radians(coord1[1]), math.radians(coord1[0])
        lat2, lon2 = math.radians(coord2[1]), math.radians(coord2[0])
        dlat = lat2 - lat1
        dlon = lon2 - lon1
        a = math.sin(dlat/2)**2 + math.cos(lat1)*math.cos(lat2)*math.sin(dlon/2)**2
        c = 2 * math.asin(math.sqrt(a))
        return R * c

    def _interpolate_route(
        self,
        origin: Coordinates,
        destination: Coordinates,
        num_points: int = 20,
        deviation: float = 0.0
    ) -> List[List[float]]:
        """
        Generate smooth route coordinates between origin and destination.
        Adds realistic deviation for alternative routes.
        """
        coords = []
        for i in range(num_points + 1):
            t = i / num_points
            # Linear interpolation
            lat = origin.lat + (destination.lat - origin.lat) * t
            lng = origin.lng + (destination.lng - origin.lng) * t

            # Add smooth deviation using sine curve
            if deviation > 0 and 0 < t < 1:
                sine_deviation = math.sin(t * math.pi) * deviation
                lat += sine_deviation * (0.002 + np.random.normal(0, 0.0005))
                lng += sine_deviation * (0.002 + np.random.normal(0, 0.0005))

            coords.append([round(lng, 6), round(lat, 6)])

        return coords

    def _generate_segments(
        self,
        coordinates: List[List[float]],
        lighting_level: str,
        profile: str
    ) -> List[RouteSegment]:
        """Generate route segments with realistic metadata."""
        segments = []
        num_segments = min(len(coordinates) - 1, 8)
        chunk_size = max(1, (len(coordinates) - 1) // num_segments)

        for i in range(num_segments):
            start_idx = i * chunk_size
            end_idx = min((i + 1) * chunk_size + 1, len(coordinates))
            seg_coords = coordinates[start_idx:end_idx]

            if len(seg_coords) < 2:
                continue

            dist_m = self._haversine_distance(seg_coords[0], seg_coords[-1]) * 1000
            duration_s = dist_m / 1.4  # Walking speed ~1.4 m/s

            seg_safety = float(np.clip(np.random.normal(75, 12), 30, 99))
            has_cctv = np.random.random() > 0.4
            is_accessible = profile not in ["wheelchair", "elderly"] or np.random.random() > 0.3

            segments.append(RouteSegment(
                coordinates=seg_coords,
                distance_m=round(dist_m, 1),
                duration_s=round(duration_s, 1),
                street_name=np.random.choice(self.STREET_NAMES),
                safety_score=seg_safety,
                lighting_level=lighting_level,
                has_cctv=has_cctv,
                is_accessible=is_accessible,
                surface_type=np.random.choice(
                    ["paved", "paved", "paved", "cobblestone", "gravel"],
                    p=[0.6, 0.15, 0.1, 0.1, 0.05]
                )
            ))

        return segments

    def _generate_audio_instructions(
        self,
        segments: List[RouteSegment],
        profile: str
    ) -> List[str]:
        """Generate voice navigation instructions."""
        instructions = []
        directions = ["Head north", "Turn right", "Turn left", "Continue straight",
                     "Bear right", "Bear left", "Head south", "Head east", "Head west"]

        instructions.append(f"Starting navigation. Route optimized for {profile.replace('_', ' ')}.")

        for i, seg in enumerate(segments[:6]):
            direction = directions[i % len(directions)]
            dist = int(seg.distance_m)
            street = seg.street_name

            instruction = f"{direction} on {street} for {dist} meters."

            if not seg.is_accessible and profile in ["wheelchair", "elderly"]:
                instruction += " Warning: possible accessibility issue ahead."
            if seg.lighting_level == "DIM":
                instruction += " Note: low lighting in this area."
            if seg.has_cctv:
                instruction += " CCTV coverage active."

            instructions.append(instruction)

        instructions.append("You have arrived at your destination. Stay safe!")
        return instructions

    def _generate_warnings(
        self,
        scores: Dict,
        profile: str
    ) -> List[str]:
        """Generate contextual warnings based on scores and profile."""
        warnings = []

        if scores["safety"] < 60:
            warnings.append("⚠️ Low safety score – consider traveling with company")
        if scores["lighting"] < 50:
            warnings.append("🔦 Poor lighting on sections of this route")
        if scores["crowd"] < 40:
            warnings.append("👥 High crowd density expected")
        if profile == "wheelchair" and scores["accessibility"] < 60:
            warnings.append("♿ Limited wheelchair accessibility on some segments")
        if profile == "elderly" and scores["accessibility"] < 65:
            warnings.append("🧓 Route may have steep inclines or uneven surfaces")

        return warnings

    def _generate_highlights(self, scores: Dict, profile_data: Dict) -> List[str]:
        """Generate positive route highlights."""
        highlights = []

        if scores["safety"] >= 80:
            highlights.append("✅ High safety corridor with police patrol coverage")
        if scores["lighting"] >= 80:
            highlights.append("💡 Fully lit route – well illuminated throughout")
        if scores["overall"] >= 85:
            highlights.append("🏆 Top-rated route in this area")
        highlights.append(f"📍 {profile_data['name']} – {profile_data['description']}")

        return highlights

    def generate_routes(
        self,
        origin: Coordinates,
        destination: Coordinates,
        preferences: RoutePreferences,
        time_of_day: str = "evening"
    ) -> List[RouteResult]:
        """
        Generate multiple route alternatives ranked by composite score.
        """
        routes = []
        weights = {
            "safety": preferences.weight_safety,
            "lighting": preferences.weight_lighting,
            "crowd": preferences.weight_crowd,
            "accessibility": preferences.weight_accessibility,
        }
        profile = preferences.user_profile.value

        for idx, route_profile in enumerate(self.ROUTE_PROFILES):
            # Generate coordinates with profile-specific deviation
            deviation = route_profile["deviation_factor"] - 1.0
            coordinates = self._interpolate_route(
                origin, destination,
                num_points=25,
                deviation=deviation
            )

            # Score the route with boosts for this profile
            base_scores = scoring_engine.score_route(
                coordinates, profile, time_of_day, weights
            )

            # Apply profile-specific boosts
            boosted_scores = {
                "safety": min(99, base_scores["safety"] + route_profile["safety_boost"]),
                "lighting": min(99, base_scores["lighting"] + route_profile["lighting_boost"]),
                "crowd": min(99, base_scores["crowd"] + route_profile["crowd_boost"]),
                "accessibility": min(99, base_scores["accessibility"] + route_profile["accessibility_boost"]),
                "lighting_level": base_scores["lighting_level"],
            }
            boosted_scores["overall"] = scoring_engine.compute_composite_score(
                boosted_scores["safety"],
                boosted_scores["lighting"],
                boosted_scores["crowd"],
                boosted_scores["accessibility"],
                weights
            )
            boosted_scores["risk_level"] = scoring_engine.get_risk_level(boosted_scores["overall"])

            # Calculate route metrics
            total_distance = 0
            for i in range(len(coordinates) - 1):
                total_distance += self._haversine_distance(coordinates[i], coordinates[i+1])
            total_distance *= route_profile["deviation_factor"]

            walking_speed_kmh = 4.5
            duration_min = (total_distance / walking_speed_kmh) * 60

            # Generate segments
            segments = self._generate_segments(
                coordinates,
                boosted_scores["lighting_level"],
                profile
            )

            # Generate instructions
            audio_instructions = self._generate_audio_instructions(segments, profile)
            warnings = self._generate_warnings(boosted_scores, profile)
            highlights = self._generate_highlights(boosted_scores, route_profile)

            route_scores = RouteScores(
                overall=round(boosted_scores["overall"], 1),
                safety=round(boosted_scores["safety"], 1),
                lighting=round(boosted_scores["lighting"], 1),
                crowd=round(boosted_scores["crowd"], 1),
                accessibility=round(boosted_scores["accessibility"], 1),
                risk_level=boosted_scores["risk_level"],
            )

            route = RouteResult(
                id=str(uuid.uuid4()),
                name=route_profile["name"],
                description=route_profile["description"],
                coordinates=coordinates,
                segments=segments,
                scores=route_scores,
                distance_km=round(total_distance, 2),
                duration_min=round(duration_min, 1),
                waypoints=[origin, destination],
                audio_instructions=audio_instructions,
                warnings=warnings,
                highlights=highlights,
                color=route_profile["color"],
                rank=idx + 1,
            )
            routes.append(route)

        # Sort by composite score descending
        routes.sort(key=lambda r: r.scores.overall, reverse=True)
        for i, r in enumerate(routes):
            r.rank = i + 1

        return routes


# Singleton instance
routing_engine = RoutingEngine()