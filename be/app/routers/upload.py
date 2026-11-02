import os
from uuid import uuid4

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile

from app.deps import get_current_user
from app.models import User

router = APIRouter(prefix="/upload", tags=["upload"])

UPLOAD_DIR = "static/uploads"
ALLOWED_TYPES = {"image/jpeg", "image/png", "image/webp"}
MAX_SIZE_BYTES = 5 * 1024 * 1024  # 5MB


# PENTING: implementasi ini menulis ke filesystem lokal (static/uploads).
# Cocok untuk development. Untuk production, ganti isi function ini supaya
# upload ke S3 (lihat README) - terutama kalau backend nanti dideploy ke
# platform serverless/container yang filesystem-nya tidak persisten.
@router.post("")
async def upload_file(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
):
    if file.content_type not in ALLOWED_TYPES:
        raise HTTPException(status_code=400, detail="Tipe file tidak didukung")

    contents = await file.read()
    if len(contents) > MAX_SIZE_BYTES:
        raise HTTPException(status_code=400, detail="File terlalu besar (maks 5MB)")

    ext = (file.filename or "upload").split(".")[-1]
    filename = f"{uuid4()}.{ext}"

    os.makedirs(UPLOAD_DIR, exist_ok=True)
    file_path = os.path.join(UPLOAD_DIR, filename)
    with open(file_path, "wb") as f:
        f.write(contents)

    return {"url": f"/static/uploads/{filename}"}
