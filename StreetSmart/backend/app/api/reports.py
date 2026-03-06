from fastapi import APIRouter, HTTPException
from typing import List
import uuid
from datetime import datetime
import logging

from app.models.report import ReportRequest, ReportResponse

router = APIRouter()
logger = logging.getLogger(__name__)

# In-memory store (replace with DB in production)
_reports_store: List[dict] = [
    {
        "id": str(uuid.uuid4()),
        "lat": 40.7128, "lng": -74.0060,
        "issue_type": "poor_lighting",
        "severity": "high",
        "description": "Street lights out on 3rd block, very dark at night",
        "status": "investigating",
        "created_at": "2024-01-15T22:30:00",
        "votes": 12,
        "address": "3rd Ave & 42nd St"
    },
    {
        "id": str(uuid.uuid4()),
        "lat": 40.7580, "lng": -73.9855,
        "issue_type": "broken_sidewalk",
        "severity": "medium",
        "description": "Large crack in sidewalk near bus stop, wheelchair hazard",
        "status": "reported",
        "created_at": "2024-01-14T10:00:00",
        "votes": 8,
        "address": "Broadway & 47th St"
    },
    {
        "id": str(uuid.uuid4()),
        "lat": 40.7282, "lng": -73.7949,
        "issue_type": "missing_ramp",
        "severity": "high",
        "description": "No wheelchair ramp at corner, elderly and disabled cannot cross safely",
        "status": "resolved",
        "created_at": "2024-01-10T15:00:00",
        "votes": 23,
        "address": "Park Ave & 110th St"
    },
]


@router.post("/reports", response_model=ReportResponse)
async def submit_report(report: ReportRequest):
    """Submit a community safety/accessibility report."""
    try:
        new_report = {
            "id": str(uuid.uuid4()),
            "lat": report.lat,
            "lng": report.lng,
            "issue_type": report.issue_type.value,
            "severity": report.severity.value,
            "description": report.description,
            "status": "reported",
            "created_at": datetime.utcnow().isoformat(),
            "votes": 0,
            "address": report.address,
        }
        _reports_store.append(new_report)
        logger.info(f"New report submitted: {new_report['id']}")
        return ReportResponse(**new_report)
    except Exception as e:
        logger.error(f"Report submission error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/reports", response_model=List[ReportResponse])
async def get_reports(
    limit: int = 50,
    issue_type: str = None,
    severity: str = None,
):
    """Get all community reports with optional filters."""
    reports = _reports_store.copy()

    if issue_type:
        reports = [r for r in reports if r["issue_type"] == issue_type]
    if severity:
        reports = [r for r in reports if r["severity"] == severity]

    reports.sort(key=lambda r: r["votes"], reverse=True)
    return [ReportResponse(**r) for r in reports[:limit]]


@router.post("/reports/{report_id}/vote")
async def vote_report(report_id: str):
    """Upvote a report to increase its priority."""
    for report in _reports_store:
        if report["id"] == report_id:
            report["votes"] += 1
            return {"id": report_id, "votes": report["votes"]}
    raise HTTPException(status_code=404, detail="Report not found")