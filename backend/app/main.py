"""
ORANGE Platform — FastAPI Application
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routers import ocr, vault, batch, collab, billing

app = FastAPI(
    title="ORANGE Platform API",
    description="Premium Digital Services Platform",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routers
app.include_router(ocr.router, prefix="/api/ocr", tags=["OCR"])
app.include_router(vault.router, prefix="/api/vault", tags=["Vault"])
app.include_router(batch.router, prefix="/api/batch", tags=["Batch"])
app.include_router(collab.router, prefix="/api/collab", tags=["Collaboration"])
app.include_router(billing.router, prefix="/api/billing", tags=["Billing"])


@app.get("/api/health")
async def health_check():
    return {"status": "healthy", "service": "ORANGE Platform"}