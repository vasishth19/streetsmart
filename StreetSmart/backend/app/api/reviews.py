# ─── backend/app/api/reviews.py ──────────────────────────────────

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime
from .auth import get_current_user

router = APIRouter(prefix="/reviews", tags=["reviews"])

# In-memory reviews store
_reviews: List[dict] = [
    {"id":1,"user_id":1,"user_name":"Sarah K.",  "rating":5,"comment":"Feels so much safer walking home at night. The lit-route feature is amazing!","created_at":"2025-02-28T22:00:00"},
    {"id":2,"user_id":2,"user_name":"Marcus T.", "rating":5,"comment":"Wheelchair routing is genuinely the best I have used. No more surprise stairs.","created_at":"2025-02-27T18:30:00"},
    {"id":3,"user_id":3,"user_name":"Priya M.",  "rating":4,"comment":"Audio navigation works great. Safety scores are spot on.","created_at":"2025-02-26T14:15:00"},
    {"id":4,"user_id":4,"user_name":"James W.",  "rating":5,"comment":"Finally a nav app that thinks about people, not just speed. 10/10.","created_at":"2025-02-25T09:00:00"},
    {"id":5,"user_id":5,"user_name":"Lisa C.",   "rating":4,"comment":"The heatmap overlay is incredible. You can really see which areas to avoid.","created_at":"2025-02-24T20:45:00"},
]
_next_review_id = 6

class ReviewCreate(BaseModel):
    rating:  int   = Field(..., ge=1, le=5)
    comment: str   = Field(..., min_length=3, max_length=500)

class ReviewResponse(BaseModel):
    id:         int
    user_id:    int
    user_name:  str
    rating:     int
    comment:    str
    created_at: str

class ReviewsListResponse(BaseModel):
    reviews:    List[ReviewResponse]
    total:      int
    avg_rating: float

@router.get("", response_model=ReviewsListResponse)
async def list_reviews():
    avg = sum(r["rating"] for r in _reviews) / len(_reviews) if _reviews else 0
    return ReviewsListResponse(
        reviews=[ReviewResponse(**r) for r in reversed(_reviews)],
        total=len(_reviews),
        avg_rating=round(avg, 2),
    )

@router.post("", response_model=ReviewResponse)
async def create_review(body: ReviewCreate, user=Depends(get_current_user)):
    global _next_review_id
    name = user["name"] if user else "Guest"
    uid  = user["id"]   if user else 0

    review = {
        "id":         _next_review_id,
        "user_id":    uid,
        "user_name":  name,
        "rating":     body.rating,
        "comment":    body.comment,
        "created_at": datetime.utcnow().isoformat(),
    }
    _reviews.append(review)
    _next_review_id += 1
    return ReviewResponse(**review)


