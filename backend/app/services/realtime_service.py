"""
ORANGE Platform — Real-Time Collaboration Service
Powered by Supabase Realtime + Presence.

Features:
- Live cursors and selection highlighting
- Real-time text editing with conflict resolution
- User presence (who's viewing what)
- Document locking for critical operations
- Activity feed
"""

from supabase import create_client, Client
from datetime import datetime, timezone
import json
import logging
import uuid

from app.config import get_settings

logger = logging.getLogger("orange.collab")

COLLAB_TABLE = "collaboration_sessions"
ACTIVITY_TABLE = "activity_log"


class RealtimeCollaboration:
    """Real-time collaboration engine."""

    def __init__(self):
        settings = get_settings()
        self.client: Client = create_client(
            settings.supabase_url,
            settings.supabase_service_key,
        )

    # ===================================
    # Sessions
    # ===================================

    async def create_session(
        self,
        document_id: str,
        user_id: str,
        service: str,
    ) -> dict:
        """Create or join a collaboration session for a document."""
        session_id = f"collab:{document_id}"

        # Check existing session
        existing = (
            self.client.table(COLLAB_TABLE)
            .select("*")
            .eq("document_id", document_id)
            .eq("is_active", True)
            .maybe_single()
            .execute()
        )

        if existing.data:
            # Add participant
            participants = existing.data.get("participants", [])
            if user_id not in participants:
                participants.append(user_id)
                self.client.table(COLLAB_TABLE).update({
                    "participants": participants,
                    "updated_at": datetime.now(timezone.utc).isoformat(),
                }).eq("id", existing.data["id"]).execute()

            await self._log_activity(
                document_id, user_id, "joined", service
            )

            return {
                "session_id": existing.data["id"],
                "channel": session_id,
                "participants": participants,
                "created_at": existing.data["created_at"],
            }

        # Create new session
        session = {
            "id": str(uuid.uuid4()),
            "document_id": document_id,
            "channel": session_id,
            "participants": [user_id],
            "service": service,
            "is_active": True,
            "locked_by": None,
            "document_state": {},
            "created_at": datetime.now(timezone.utc).isoformat(),
            "updated_at": datetime.now(timezone.utc).isoformat(),
        }

        self.client.table(COLLAB_TABLE).insert(session).execute()

        await self._log_activity(
            document_id, user_id, "created_session", service
        )

        return {
            "session_id": session["id"],
            "channel": session_id,
            "participants": session["participants"],
            "created_at": session["created_at"],
        }

    async def leave_session(
        self,
        document_id: str,
        user_id: str,
    ) -> None:
        """Remove user from collaboration session."""
        result = (
            self.client.table(COLLAB_TABLE)
            .select("*")
            .eq("document_id", document_id)
            .eq("is_active", True)
            .maybe_single()
            .execute()
        )

        if not result.data:
            return

        participants = result.data.get("participants", [])
        if user_id in participants:
            participants.remove(user_id)

        update_data = {
            "participants": participants,
            "updated_at": datetime.now(timezone.utc).isoformat(),
        }

        # If was locked by this user, release lock
        if result.data.get("locked_by") == user_id:
            update_data["locked_by"] = None

        # If no more participants, deactivate session
        if not participants:
            update_data["is_active"] = False

        self.client.table(COLLAB_TABLE).update(update_data).eq(
            "id", result.data["id"]
        ).execute()

        await self._log_activity(document_id, user_id, "left")

    # ===================================
    # Document Locking
    # ===================================

    async def acquire_lock(
        self,
        document_id: str,
        user_id: str,
        operation: str = "editing",
    ) -> dict:
        """
        Acquire exclusive lock on a document.
        Used during critical operations (OCR processing, TTS generation).
        """
        result = (
            self.client.table(COLLAB_TABLE)
            .select("*")
            .eq("document_id", document_id)
            .eq("is_active", True)
            .maybe_single()
            .execute()
        )

        if not result.data:
            return {"locked": False, "error": "No active session"}

        current_lock = result.data.get("locked_by")

        if current_lock and current_lock != user_id:
            return {
                "locked": False,
                "error": "Document is locked by another user",
                "locked_by": current_lock,
            }

        self.client.table(COLLAB_TABLE).update({
            "locked_by": user_id,
            "lock_operation": operation,
            "locked_at": datetime.now(timezone.utc).isoformat(),
            "updated_at": datetime.now(timezone.utc).isoformat(),
        }).eq("id", result.data["id"]).execute()

        await self._log_activity(
            document_id, user_id, f"locked:{operation}"
        )

        return {"locked": True, "operation": operation}

    async def release_lock(
        self,
        document_id: str,
        user_id: str,
    ) -> bool:
        """Release document lock."""
        result = (
            self.client.table(COLLAB_TABLE)
            .update({
                "locked_by": None,
                "lock_operation": None,
                "locked_at": None,
                "updated_at": datetime.now(timezone.utc).isoformat(),
            })
            .eq("document_id", document_id)
            .eq("locked_by", user_id)
            .eq("is_active", True)
            .execute()
        )

        if result.data:
            await self._log_activity(document_id, user_id, "unlocked")
            return True
        return False

    # ===================================
    # Document State Sync
    # ===================================

    async def sync_state(
        self,
        document_id: str,
        user_id: str,
        state: dict,
    ) -> None:
        """
        Broadcast document state change to all participants.
        Uses Supabase Realtime broadcast.
        """
        channel = f"collab:{document_id}"

        # Update stored state
        self.client.table(COLLAB_TABLE).update({
            "document_state": state,
            "updated_at": datetime.now(timezone.utc).isoformat(),
        }).eq("document_id", document_id).eq("is_active", True).execute()

        # Broadcast via Supabase Realtime
        self.client.realtime.channel(channel).send_broadcast(
            "state_sync",
            {
                "user_id": user_id,
                "state": state,
                "timestamp": datetime.now(timezone.utc).isoformat(),
            },
        )

    # ===================================
    # Cursor / Presence
    # ===================================

    async def update_cursor(
        self,
        document_id: str,
        user_id: str,
        cursor_position: dict,
    ) -> None:
        """Broadcast cursor position to collaborators."""
        channel = f"collab:{document_id}"

        self.client.realtime.channel(channel).send_broadcast(
            "cursor_update",
            {
                "user_id": user_id,
                "cursor": cursor_position,
                "timestamp": datetime.now(timezone.utc).isoformat(),
            },
        )

    # ===================================
    # Activity Log
    # ===================================

    async def _log_activity(
        self,
        document_id: str,
        user_id: str,
        action: str,
        service: str | None = None,
    ) -> None:
        """Log collaboration activity."""
        self.client.table(ACTIVITY_TABLE).insert({
            "id": str(uuid.uuid4()),
            "document_id": document_id,
            "user_id": user_id,
            "action": action,
            "service": service,
            "created_at": datetime.now(timezone.utc).isoformat(),
        }).execute()

        logger.info(
            f"Collab activity: user={user_id} action={action} doc={document_id}"
        )

    async def get_activity(
        self,
        document_id: str,
        limit: int = 50,
    ) -> list[dict]:
        """Get recent activity for a document."""
        result = (
            self.client.table(ACTIVITY_TABLE)
            .select("*")
            .eq("document_id", document_id)
            .order("created_at", desc=True)
            .limit(limit)
            .execute()
        )
        return result.data or []