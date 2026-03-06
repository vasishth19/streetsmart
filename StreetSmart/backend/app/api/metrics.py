# ─── backend/app/api/metrics.py ───────────────────────────────────

from fastapi import APIRouter
from pydantic import BaseModel
import random
from datetime import datetime

metrics_router = APIRouter(prefix="/metrics", tags=["metrics"])

_base = {
    "active_users":      1893,
    "routes_generated":  2744,
    "safety_reports":    138,
    "reviews_submitted": 5,
    "routes_per_minute": 4,
    "online_cities":     12,
}

class LiveMetrics(BaseModel):
    active_users:      int
    routes_generated:  int
    safety_reports:    int
    reviews_submitted: int
    routes_per_minute: int
    online_cities:     int
    timestamp:         str

@metrics_router.get("/live", response_model=LiveMetrics)
async def live_metrics():
    return LiveMetrics(
        active_users      = _base["active_users"]      + random.randint(-3, 5),
        routes_generated  = _base["routes_generated"]  + random.randint(0,  8),
        safety_reports    = _base["safety_reports"],
        reviews_submitted = _base["reviews_submitted"],
        routes_per_minute = random.randint(2, 8),
        online_cities     = _base["online_cities"],
        timestamp         = datetime.utcnow().isoformat(),
    )