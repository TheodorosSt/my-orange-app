"""
ORANGE Platform — Vault Router (with Auth)
"""

from fastapi import APIRouter, UploadFile, File, HTTPException, Query, Depends
from app.services.supabase_service import SupabaseVault
from app.models.schemas import VaultUploadResponse, VaultListResponse, VaultDocument
from app.middleware.auth import get_current_user

router = APIRouter()


@router.post("/upload", response_model=VaultUploadResponse)
async def upload_document(
    file: UploadFile = File(...),
    service_origin: str = Query(default="ocr"),
    user: dict = Depends(get_current_user),
):
    """Upload a document to the encrypted vault."""
    content = await file.read()

    if len(content) == 0:
        raise HTTPException(status_code=400, detail="Empty file")

    vault = SupabaseVault()
    result = await vault.upload_document(
        file_content=content,
        filename=file.filename or "untitled",
        mime_type=file.content_type or "application/octet-stream",
        user_id=user["id"],
        service_origin=service_origin,
    )

    return VaultUploadResponse(
        document=VaultDocument(**result, download_url=None),
    )


@router.get("/documents", response_model=VaultListResponse)
async def list_documents(
    page: int = Query(default=1, ge=1),
    per_page: int = Query(default=20, ge=1, le=100),
    service: str | None = Query(default=None),
    user: dict = Depends(get_current_user),
):
    """List documents in the vault with pagination."""
    vault = SupabaseVault()
    result = await vault.list_documents(
        user_id=user["id"],
        page=page,
        per_page=per_page,
        service_filter=service,
    )

    documents = [
        VaultDocument(
            id=doc["id"],
            filename=doc["filename"],
            mime_type=doc["mime_type"],
            size_bytes=doc["size_bytes"],
            service_origin=doc["service_origin"],
            created_at=doc["created_at"],
            updated_at=doc["updated_at"],
            metadata=doc.get("metadata", {}),
        )
        for doc in result["documents"]
    ]

    return VaultListResponse(
        documents=documents,
        total=result["total"],
        page=result["page"],
        per_page=result["per_page"],
    )


@router.get("/documents/{doc_id}/download")
async def download_document(
    doc_id: str,
    user: dict = Depends(get_current_user),
):
    """Get a signed download URL for a document."""
    try:
        vault = SupabaseVault()
        url = await vault.get_download_url(user_id=user["id"], doc_id=doc_id)
        return {"download_url": url}
    except PermissionError:
        raise HTTPException(status_code=404, detail="Document not found")


@router.delete("/documents/{doc_id}")
async def delete_document(
    doc_id: str,
    user: dict = Depends(get_current_user),
):
    """Delete a document from the vault."""
    try:
        vault = SupabaseVault()
        await vault.delete_document(user_id=user["id"], doc_id=doc_id)
        return {"message": "Document deleted successfully"}
    except PermissionError:
        raise HTTPException(status_code=404, detail="Document not found")