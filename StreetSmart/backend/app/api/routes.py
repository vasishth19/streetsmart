from fastapi import APIRouter, HTTPException, Query
from typing import Optional
from datetime import datetime
import logging

from app.models.route import RouteRequest, RoutesResponse, Coordinates
from app.services.routing_engine import routing_engine
from app.services.safety_engine import safety_engine

router = APIRouter()
logger = logging.getLogger(__name__)


@router.post("/routes", response_model=RoutesResponse)
async def generate_routes(request: RouteRequest):
    """
    Generate preference-aware, safety-optimized routes.

    Returns up to 3 ranked route alternatives with:
    - Composite safety scores
    - Accessibility ratings
    - Audio navigation instructions
    - Segment-level details
    """
    try:
        logger.info(
            f"Generating routes: {request.origin} -> {request.destination} | "
            f"Profile: {request.preferences.user_profile}"
        )

        routes = routing_engine.generate_routes(
            origin=request.origin,
            destination=request.destination,
            preferences=request.preferences,
        )

        if not routes:
            raise HTTPException(status_code=404, detail="No routes found")

        recommended = routes[0].id  # Highest scored route

        return RoutesResponse(
            routes=routes,
            origin=request.origin,
            destination=request.destination,
            recommended_route_id=recommended,
            total_routes=len(routes),
            generated_at=datetime.utcnow().isoformat(),
        )

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Route generation error: {e}")
        raise HTTPException(status_code=500, detail=f"Route generation failed: {str(e)}")


@router.get("/heatmap")
async def get_heatmap(
    lat: float = Query(default=40.7128, description="Center latitude"),
    lng: float = Query(default=-74.0060, description="Center longitude"),
    radius: float = Query(default=2.0, description="Radius in km"),
    points: int = Query(default=200, ge=50, le=500, description="Number of heatmap points"),
):
    """
    Get safety heatmap data for map overlay.
    Returns intensity points for visualization.
    """
    try:
        heatmap_data = safety_engine.generate_heatmap(lat, lng, radius, points)
        incident_zones = safety_engine.get_incident_zones()
        stats = safety_engine.get_area_safety_stats(lat, lng, radius)

        return {
            "heatmap": heatmap_data,
            "incident_zones": incident_zones,
            "stats": stats,
            "center": {"lat": lat, "lng": lng},
            "radius_km": radius,
        }
    except Exception as e:
        logger.error(f"Heatmap error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/analytics")
async def get_analytics():
    """
    Get Smart City analytics dashboard data.
    """
    import numpy as np

    # Simulated analytics data
    hourly_safety = [
        {"hour": h, "safety": float(np.clip(70 + 15 * np.sin(h * 0.4) + np.random.normal(0, 3), 40, 98))}
        for h in range(24)
    ]

    profile_usage = [
        {"profile": "general", "count": 1240, "percentage": 45.2},
        {"profile": "woman", "count": 890, "percentage": 32.4},
        {"profile": "elderly", "count": 320, "percentage": 11.7},
        {"profile": "wheelchair", "count": 185, "percentage": 6.7},
        {"profile": "visually_impaired", "count": 109, "percentage": 4.0},
    ]

    daily_routes = [
        {"day": day, "routes": int(np.random.normal(450, 80))}
        for day in ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
    ]

    top_issues = [
        {"type": "poor_lighting", "count": 89, "resolved": 34},
        {"type": "broken_sidewalk", "count": 67, "resolved": 45},
        {"type": "unsafe_area", "count": 52, "resolved": 12},
        {"type": "missing_ramp", "count": 38, "resolved": 28},
        {"type": "construction", "count": 29, "resolved": 19},
    ]

    return {
        "overview": {
            "total_routes_today": 2744,
            "active_users": 1893,
            "avg_safety_score": 74.3,
            "reports_resolved": 138,
            "cities_covered": 12,
            "accessibility_score": 71.8,
        },
        "hourly_safety": hourly_safety,
        "profile_usage": profile_usage,
        "daily_routes": daily_routes,
        "top_issues": top_issues,
        "safety_trend": "+3.2%",
        "accessibility_trend": "+1.8%",
    }