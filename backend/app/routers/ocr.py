"""
ORANGE Platform — OCR Router
"""

from fastapi import APIRouter, UploadFile, File, Depends, HTTPException
from app.middleware.auth import get_current_user
from app.services.google_vision import GoogleVisionOCR

router = APIRouter()


@router.post("/process")
async def process_document(
    file: UploadFile = File(...),
    user: dict = Depends(get_current_user),
):
    """Process a document with OCR using Google Vision."""
    content = await file.read()

    if len(content) == 0:
        raise HTTPException(status_code=400, detail="Empty file")

    # Validate file type
    allowed_types = {
        "image/png", "image/jpeg", "image/jpg", "image/tiff",
        "image/webp", "application/pdf",
    }
    mime_type = file.content_type or "image/png"
    if mime_type not in allowed_types:
        raise HTTPException(status_code=415, detail=f"Unsupported file type: {mime_type}")

    try:
        ocr = GoogleVisionOCR()
        result = await ocr.extract_text(content, mime_type)

        return {
            "text": result["text"],
            "confidence": result["confidence"],
            "language": result["language"],
            "word_count": result["word_count"],
            "processing_time_ms": result["processing_time_ms"],
            "pages": result.get("pages", 1),
        }
    except RuntimeError as e:
        raise HTTPException(status_code=502, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail="OCR processing failed")