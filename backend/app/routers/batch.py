"""
ORANGE Platform — Batch Processing Router
"""

from fastapi import APIRouter, UploadFile, File, Depends, HTTPException, Query
from pydantic import BaseModel
from typing import Optional
import zipfile
import io

from app.middleware.auth import get_current_user
from app.services.batch_service import (
    BatchJob,
    celery_app,
    process_ocr_task,
    process_translate_task,
    process_tts_task,
    finalize_batch,
)
from celery import chord

router = APIRouter()


class BatchRequest(BaseModel):
    pipeline: list[str]  # e.g. ["ocr", "translate", "tts"]
    target_lang: str = "EN-GB"
    voice_id: str | None = None


class BatchStatusResponse(BaseModel):
    id: str
    status: str
    progress_percent: int
    total_files: int
    processed_files: int
    failed_files: int
    results: list[dict]
    errors: list[dict]
    created_at: str
    completed_at: str | None = None


@router.post("/start")
async def start_batch(
    files: list[UploadFile] = File(...),
    pipeline: str = Query(default="ocr", description="Comma-separated: ocr,translate,tts"),
    target_lang: str = Query(default="EN-GB"),
    voice_id: str | None = Query(default=None),
    user: dict = Depends(get_current_user),
):
    """
    Start a batch processing job.

    Upload multiple files (or a ZIP archive) and define a pipeline:
    - "ocr" → OCR only
    - "ocr,translate" → OCR then translate
    - "ocr,translate,tts" → Full pipeline: OCR → Translate → TTS
    """
    pipeline_steps = [s.strip() for s in pipeline.split(",")]
    valid_steps = {"ocr", "translate", "tts"}

    for step in pipeline_steps:
        if step not in valid_steps:
            raise HTTPException(
                status_code=400,
                detail=f"Invalid pipeline step: {step}. Valid: {valid_steps}",
            )

    # Handle ZIP files
    all_files: list[tuple[str, bytes]] = []

    for upload_file in files:
        content = await upload_file.read()

        if upload_file.content_type == "application/zip":
            # Extract ZIP
            with zipfile.ZipFile(io.BytesIO(content)) as zf:
                for name in zf.namelist():
                    if name.startswith("__MACOSX") or name.startswith("."):
                        continue
                    if name.endswith("/"):
                        continue
                    file_content = zf.read(name)
                    all_files.append((name, file_content))
        else:
            all_files.append((upload_file.filename or "file", content))

    if not all_files:
        raise HTTPException(status_code=400, detail="No files to process")

    if len(all_files) > 100:
        raise HTTPException(status_code=400, detail="Maximum 100 files per batch")

    # Create batch job
    job = BatchJob()
    job_data = job.create(
        user_id=user["id"],
        job_type=pipeline,
        total_files=len(all_files),
        pipeline=pipeline_steps,
        options={"target_lang": target_lang, "voice_id": voice_id},
    )

    # Upload files to temp storage
    from app.services.supabase_service import SupabaseVault
    vault = SupabaseVault()
    file_paths: list[str] = []

    for filename, content in all_files:
        path = f"{user['id']}/batch/{job.job_id}/{filename}"
        vault.client.storage.from_("orange-vault").upload(
            path=path,
            file=content,
            file_options={"content-type": "application/octet-stream", "x-upsert": "true"},
        )
        file_paths.append(path)

    # Build Celery pipeline
    # For now, start with OCR tasks — chaining handled in completion callback
    tasks = []
    for idx, file_path in enumerate(file_paths):
        tasks.append(
            process_ocr_task.s(
                file_path=file_path,
                job_id=job.job_id,
                file_index=idx + 1,
                total=len(file_paths),
            )
        )

    # Use chord: run all OCR in parallel, then finalize
    workflow = chord(tasks)(finalize_batch.s(job_id=job.job_id))

    return {
        "job_id": job.job_id,
        "status": "queued",
        "total_files": len(all_files),
        "pipeline": pipeline_steps,
        "message": f"Batch job created with {len(all_files)} files",
    }


@router.get("/status/{job_id}", response_model=BatchStatusResponse)
async def get_batch_status(
    job_id: str,
    user: dict = Depends(get_current_user),
):
    """Get batch job status and progress."""
    job = BatchJob(job_id)
    status = job.get_status()

    if not status:
        raise HTTPException(status_code=404, detail="Job not found")

    if status.get("user_id") != user["id"]:
        raise HTTPException(status_code=403, detail="Access denied")

    return BatchStatusResponse(
        id=status["id"],
        status=status["status"],
        progress_percent=status["progress_percent"],
        total_files=status["total_files"],
        processed_files=status["processed_files"],
        failed_files=status["failed_files"],
        results=status["results"],
        errors=status["errors"],
        created_at=status["created_at"],
        completed_at=status.get("completed_at") or None,
    )


@router.get("/jobs")
async def list_jobs(
    user: dict = Depends(get_current_user),
    status: str | None = Query(default=None),
):
    """List all batch jobs for the current user."""
    import redis
    settings = get_settings()
    r = redis.Redis(
        host=settings.redis_host,
        port=settings.redis_port,
        db=2,
        decode_responses=True,
    )

    jobs = []
    for key in r.scan_iter("batch:*"):
        job_data = r.hgetall(key)
        if job_data.get("user_id") == user["id"]:
            if status and job_data.get("status") != status:
                continue
            jobs.append({
                "id": job_data.get("id"),
                "type": job_data.get("type"),
                "status": job_data.get("status"),
                "total_files": int(job_data.get("total_files", 0)),
                "progress_percent": int(job_data.get("progress_percent", 0)),
                "created_at": job_data.get("created_at"),
            })

    jobs.sort(key=lambda j: j["created_at"], reverse=True)
    return {"jobs": jobs}


# Need this import for chord usage
from app.config import get_settings