from fastapi import APIRouter, HTTPException
from typing import List
import uuid
from datetime import datetime
import logging
import os
from supabase import create_client

from app.models.report import ReportRequest, ReportResponse

router = APIRouter()
logger = logging.getLogger(__name__)

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")
supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

@router.post("/reports", response_model=ReportResponse)
async def submit_report(report: ReportRequest):
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
        supabase.table("reports").insert(new_report).execute()
        return ReportResponse(**new_report)
    except Exception as e:
        logger.error(f"Report submission error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/reports", response_model=List[ReportResponse])
async def get_reports(limit: int = 50, issue_type: str = None, severity: str = None):
    try:
        query = supabase.table("reports").select("*")
        if issue_type:
            query = query.eq("issue_type", issue_type)
        if severity:
            query = query.eq("severity", severity)
        result = query.order("votes", desc=True).limit(limit).execute()
        return [ReportResponse(**r) for r in result.data]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/reports/{report_id}/vote")
async def vote_report(report_id: str):
    try:
        result = supabase.table("reports").select("votes").eq("id", report_id).execute()
        if not result.data:
            raise HTTPException(status_code=404, detail="Report not found")
        votes = result.data[0]["votes"] + 1
        supabase.table("reports").update({"votes": votes}).eq("id", report_id).execute()
        return {"id": report_id, "votes": votes}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))