"""
ORANGE Platform — Batch Processing Service
Celery + Redis pipeline for bulk document processing.

Supports:
- Batch OCR: Process entire folders/archives
- Batch Translation: Translate multiple documents
- Batch Audiobook: Generate audio for chapters/sections
- Pipeline chaining: OCR → Translate → TTS in one go
- Progress tracking with real-time updates
- Automatic retry with exponential backoff
"""

from celery import Celery, chain, group, chord
from celery.result import AsyncResult
import logging
import uuid
import time
from datetime import datetime, timezone

from app.config import get_settings

logger = logging.getLogger("orange.batch")

settings = get_settings()

# ===================================
# Celery App
# ===================================

celery_app = Celery(
    "orange",
    broker=f"redis://{settings.redis_host}:{settings.redis_port}/0",
    backend=f"redis://{settings.redis_host}:{settings.redis_port}/1",
)

celery_app.conf.update(
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="Europe/Athens",
    enable_utc=True,
    task_track_started=True,
    task_time_limit=600,       # 10 min max per task
    task_soft_time_limit=540,  # Soft limit at 9 min
    worker_prefetch_multiplier=1,
    worker_max_tasks_per_child=50,
    task_acks_late=True,
    task_reject_on_worker_lost=True,
    # Retry settings
    task_default_retry_delay=30,
    task_max_retries=3,
)


# ===================================
# Batch Job Model
# ===================================

class BatchJob:
    """Manages batch processing state in Redis."""

    def __init__(self, job_id: str | None = None):
        import redis
        self.redis = redis.Redis(
            host=settings.redis_host,
            port=settings.redis_port,
            db=2,
            decode_responses=True,
        )
        self.job_id = job_id or str(uuid.uuid4())
        self.key = f"batch:{self.job_id}"

    def create(
        self,
        user_id: str,
        job_type: str,
        total_files: int,
        pipeline: list[str],
        options: dict,
    ) -> dict:
        """Create a new batch job."""
        job = {
            "id": self.job_id,
            "user_id": user_id,
            "type": job_type,
            "status": "queued",
            "pipeline": ",".join(pipeline),
            "total_files": total_files,
            "processed_files": 0,
            "failed_files": 0,
            "progress_percent": 0,
            "options": str(options),
            "results": "[]",
            "errors": "[]",
            "created_at": datetime.now(timezone.utc).isoformat(),
            "started_at": "",
            "completed_at": "",
        }
        self.redis.hset(self.key, mapping=job)
        self.redis.expire(self.key, 86400 * 7)  # 7 day TTL
        return job

    def update_progress(
        self,
        processed: int,
        total: int,
        current_file: str = "",
        current_step: str = "",
    ) -> None:
        """Update job progress."""
        progress = round((processed / total) * 100) if total > 0 else 0
        self.redis.hset(self.key, mapping={
            "processed_files": processed,
            "progress_percent": progress,
            "current_file": current_file,
            "current_step": current_step,
            "status": "processing",
        })

    def add_result(self, result: dict) -> None:
        """Add a file result."""
        import json
        results = json.loads(self.redis.hget(self.key, "results") or "[]")
        results.append(result)
        self.redis.hset(self.key, "results", json.dumps(results))

    def add_error(self, error: dict) -> None:
        """Add a file error."""
        import json
        errors = json.loads(self.redis.hget(self.key, "errors") or "[]")
        errors.append(error)
        failed = int(self.redis.hget(self.key, "failed_files") or 0) + 1
        self.redis.hset(self.key, mapping={
            "errors": json.dumps(errors),
            "failed_files": failed,
        })

    def complete(self) -> None:
        """Mark job as completed."""
        self.redis.hset(self.key, mapping={
            "status": "completed",
            "completed_at": datetime.now(timezone.utc).isoformat(),
            "progress_percent": 100,
        })

    def fail(self, reason: str) -> None:
        """Mark job as failed."""
        self.redis.hset(self.key, mapping={
            "status": "failed",
            "error_message": reason,
            "completed_at": datetime.now(timezone.utc).isoformat(),
        })

    def get_status(self) -> dict | None:
        """Get full job status."""
        import json
        data = self.redis.hgetall(self.key)
        if not data:
            return None
        data["results"] = json.loads(data.get("results", "[]"))
        data["errors"] = json.loads(data.get("errors", "[]"))
        data["total_files"] = int(data.get("total_files", 0))
        data["processed_files"] = int(data.get("processed_files", 0))
        data["failed_files"] = int(data.get("failed_files", 0))
        data["progress_percent"] = int(data.get("progress_percent", 0))
        return data


# ===================================
# Celery Tasks
# ===================================

@celery_app.task(bind=True, max_retries=3, acks_late=True)
def process_ocr_task(self, file_path: str, job_id: str, file_index: int, total: int):
    """Process a single file with OCR."""
    from app.services.google_vision import GoogleVisionOCR
    import json

    job = BatchJob(job_id)

    try:
        job.update_progress(file_index, total, file_path, "OCR")

        # Read file from storage
        from app.services.supabase_service import SupabaseVault
        vault = SupabaseVault()
        # In production, file_path points to Supabase storage
        content = vault.client.storage.from_("orange-vault").download(file_path)

        # Determine mime type
        mime_type = "image/png"
        if file_path.endswith(".pdf"):
            mime_type = "application/pdf"
        elif file_path.endswith((".jpg", ".jpeg")):
            mime_type = "image/jpeg"
        elif file_path.endswith(".tiff"):
            mime_type = "image/tiff"

        ocr = GoogleVisionOCR()
        # Note: In celery tasks we use sync version
        import asyncio
        result = asyncio.run(ocr.extract_text(content, mime_type))

        job.add_result({
            "file": file_path,
            "step": "ocr",
            "text": result["text"],
            "confidence": result["confidence"],
            "word_count": result["word_count"],
            "processing_time_ms": result["processing_time_ms"],
        })

        return {
            "file": file_path,
            "text": result["text"],
            "confidence": result["confidence"],
        }

    except Exception as exc:
        job.add_error({
            "file": file_path,
            "step": "ocr",
            "error": str(exc),
        })
        raise self.retry(exc=exc, countdown=30 * (self.request.retries + 1))


@celery_app.task(bind=True, max_retries=3, acks_late=True)
def process_translate_task(
    self,
    text: str,
    target_lang: str,
    job_id: str,
    file_path: str,
    file_index: int,
    total: int,
):
    """Translate text from a previous OCR step."""
    from app.services.deepl_service import DeepLTranslator
    import asyncio

    job = BatchJob(job_id)

    try:
        job.update_progress(file_index, total, file_path, "Translate")

        translator = DeepLTranslator()
        result = asyncio.run(
            translator.translate(text, target_lang=target_lang)
        )

        job.add_result({
            "file": file_path,
            "step": "translate",
            "translated_text": result["translated_text"],
            "source_lang": result["source_lang"],
            "target_lang": result["target_lang"],
            "processing_time_ms": result["processing_time_ms"],
        })

        return {
            "file": file_path,
            "translated_text": result["translated_text"],
        }

    except Exception as exc:
        job.add_error({
            "file": file_path,
            "step": "translate",
            "error": str(exc),
        })
        raise self.retry(exc=exc, countdown=30 * (self.request.retries + 1))


@celery_app.task(bind=True, max_retries=2, acks_late=True)
def process_tts_task(
    self,
    text: str,
    voice_id: str | None,
    job_id: str,
    file_path: str,
    file_index: int,
    total: int,
):
    """Generate audio from text."""
    from app.services.elevenlabs_service import ElevenLabsTTS
    import asyncio

    job = BatchJob(job_id)

    try:
        job.update_progress(file_index, total, file_path, "TTS")

        tts = ElevenLabsTTS()
        result = asyncio.run(
            tts.generate_speech(text=text, voice_id=voice_id)
        )

        # Store audio in vault
        from app.services.supabase_service import SupabaseVault
        vault = SupabaseVault()
        audio_path = file_path.rsplit(".", 1)[0] + ".mp3"

        # Upload audio bytes
        vault.client.storage.from_("orange-vault").upload(
            path=f"batch-output/{audio_path}",
            file=result["audio_bytes"],
            file_options={"content-type": "audio/mpeg"},
        )

        job.add_result({
            "file": file_path,
            "step": "tts",
            "audio_path": f"batch-output/{audio_path}",
            "duration_seconds": result["duration_seconds"],
            "processing_time_ms": result["processing_time_ms"],
        })

        return {
            "file": file_path,
            "audio_path": f"batch-output/{audio_path}",
        }

    except Exception as exc:
        job.add_error({
            "file": file_path,
            "step": "tts",
            "error": str(exc),
        })
        raise self.retry(exc=exc, countdown=60 * (self.request.retries + 1))


@celery_app.task
def finalize_batch(results: list, job_id: str):
    """Called after all tasks complete. Marks job as done."""
    job = BatchJob(job_id)
    job.complete()
    logger.info(f"Batch job {job_id} completed with {len(results)} results")