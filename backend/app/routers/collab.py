"""
ORANGE Platform — Collaboration Router
"""

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from app.services.realtime_service import RealtimeCollaboration
from app.middleware.auth import get_current_user

router = APIRouter()


class CreateSessionRequest(BaseModel):
    document_id: str
    service: str = "ocr"


class LockRequest(BaseModel):
    document_id: str
    operation: str = "editing"


class SyncStateRequest(BaseModel):
    document_id: str
    state: dict


class CursorRequest(BaseModel):
    document_id: str
    cursor: dict


@router.post("/sessions")
async def create_session(
    request: CreateSessionRequest,
    user: dict = Depends(get_current_user),
):
    collab = RealtimeCollaboration()
    return await collab.create_session(
        document_id=request.document_id,
        user_id=user["id"],
        service=request.service,
    )


@router.delete("/sessions/{document_id}")
async def leave_session(
    document_id: str,
    user: dict = Depends(get_current_user),
):
    collab = RealtimeCollaboration()
    await collab.leave_session(document_id, user["id"])
    return {"message": "Left session"}


@router.post("/lock")
async def acquire_lock(
    request: LockRequest,
    user: dict = Depends(get_current_user),
):
    collab = RealtimeCollaboration()
    result = await collab.acquire_lock(
        document_id=request.document_id,
        user_id=user["id"],
        operation=request.operation,
    )
    if not result["locked"]:
        raise HTTPException(status_code=409, detail=result.get("error"))
    return result


@router.delete("/lock/{document_id}")
async def release_lock(
    document_id: str,
    user: dict = Depends(get_current_user),
):
    collab = RealtimeCollaboration()
    released = await collab.release_lock(document_id, user["id"])
    if not released:
        raise HTTPException(status_code=404, detail="No lock found")
    return {"message": "Lock released"}


@router.post("/sync")
async def sync_state(
    request: SyncStateRequest,
    user: dict = Depends(get_current_user),
):
    collab = RealtimeCollaboration()
    await collab.sync_state(
        document_id=request.document_id,
        user_id=user["id"],
        state=request.state,
    )
    return {"message": "State synced"}


@router.post("/cursor")
async def update_cursor(
    request: CursorRequest,
    user: dict = Depends(get_current_user),
):
    collab = RealtimeCollaboration()
    await collab.update_cursor(
        document_id=request.document_id,
        user_id=user["id"],
        cursor_position=request.cursor,
    )
    return {"message": "Cursor updated"}


@router.get("/activity/{document_id}")
async def get_activity(
    document_id: str,
    user: dict = Depends(get_current_user),
):
    collab = RealtimeCollaboration()
    return await collab.get_activity(document_id)