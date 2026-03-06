import math
from typing import List, Tuple, Dict
import numpy as np


def haversine(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """
    Calculate the great-circle distance between two points in km.
    """
    R = 6371
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    a = (math.sin(dlat / 2) ** 2 +
         math.cos(math.radians(lat1)) *
         math.cos(math.radians(lat2)) *
         math.sin(dlon / 2) ** 2)
    return R * 2 * math.asin(math.sqrt(a))


def bbox_from_center(lat: float, lng: float, radius_km: float) -> Dict[str, float]:
    """Get bounding box from center point and radius."""
    delta_lat = radius_km / 111.0
    delta_lng = radius_km / (111.0 * math.cos(math.radians(lat)))
    return {
        "min_lat": lat - delta_lat,
        "max_lat": lat + delta_lat,
        "min_lng": lng - delta_lng,
        "max_lng": lng + delta_lng,
    }


def bearing(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """Calculate compass bearing between two points."""
    dlon = math.radians(lon2 - lon1)
    lat1, lat2 = math.radians(lat1), math.radians(lat2)
    x = math.sin(dlon) * math.cos(lat2)
    y = (math.cos(lat1) * math.sin(lat2) -
         math.sin(lat1) * math.cos(lat2) * math.cos(dlon))
    bearing = math.degrees(math.atan2(x, y))
    return (bearing + 360) % 360


def bearing_to_cardinal(degrees: float) -> str:
    """Convert bearing degrees to cardinal direction."""
    directions = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"]
    idx = round(degrees / 45) % 8
    return directions[idx]


def simplify_polyline(coords: List[List[float]], tolerance: float = 0.0001) -> List[List[float]]:
    """Douglas-Peucker polyline simplification."""
    if len(coords) <= 2:
        return coords

    def point_line_distance(point, start, end):
        if start == end:
            return math.sqrt((point[0]-start[0])**2 + (point[1]-start[1])**2)
        n = abs((end[1]-start[1])*point[0] - (end[0]-start[0])*point[1] +
                end[0]*start[1] - end[1]*start[0])
        d = math.sqrt((end[1]-start[1])**2 + (end[0]-start[0])**2)
        return n / d if d > 0 else 0

    max_dist = 0
    max_idx = 0
    for i in range(1, len(coords) - 1):
        dist = point_line_distance(coords[i], coords[0], coords[-1])
        if dist > max_dist:
            max_dist = dist
            max_idx = i

    if max_dist > tolerance:
        left = simplify_polyline(coords[:max_idx+1], tolerance)
        right = simplify_polyline(coords[max_idx:], tolerance)
        return left[:-1] + right
    else:
        return [coords[0], coords[-1]]