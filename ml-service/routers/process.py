"""
Process router — handles video processing job endpoints.
"""

import os
import shutil
from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from pydantic import BaseModel
from typing import Optional
from services.pipeline import create_job, get_job

router = APIRouter()

UPLOAD_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "uploads")
os.makedirs(UPLOAD_DIR, exist_ok=True)


class ProcessRequest(BaseModel):
    video_id: str
    source: str
    source_type: str  # "youtube" or "upload"
    language: str = "english"


@router.post("/process")
async def start_processing(request: ProcessRequest):
    """Start a new video processing job."""
    if request.source_type not in ("youtube", "upload"):
        raise HTTPException(status_code=400, detail="source_type must be 'youtube' or 'upload'")

    if request.language not in ("english", "hinglish"):
        raise HTTPException(status_code=400, detail="language must be 'english' or 'hinglish'")

    file_path = None
    if request.source_type == "upload":
        # For uploads, source is the filename that was uploaded via /upload endpoint
        file_path = os.path.join(UPLOAD_DIR, request.source)
        if not os.path.exists(file_path):
            raise HTTPException(status_code=400, detail="Uploaded file not found. Upload the file first.")

    job_id = create_job(
        video_id=request.video_id,
        source=request.source,
        source_type=request.source_type,
        language=request.language,
        file_path=file_path,
    )

    return {"job_id": job_id, "status": "processing"}


@router.get("/jobs/{job_id}")
async def get_job_status(job_id: str):
    """Get the current status and results of a processing job."""
    job = get_job(job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")

    response = {
        "job_id": job["job_id"],
        "video_id": job["video_id"],
        "status": job["status"],
        "stage": job["stage"],
        "error": job["error"],
        "created_at": job["created_at"],
        "updated_at": job["updated_at"],
    }

    # Include results only when completed
    if job["status"] == "completed" and job["results"]:
        response["results"] = job["results"]

    return response


ALLOWED_EXTENSIONS = {".mp4", ".mp3", ".wav", ".m4a", ".webm", ".ogg", ".flac"}
MAX_FILE_SIZE = 500 * 1024 * 1024  # 500MB


@router.post("/upload")
async def upload_file(file: UploadFile = File(...)):
    """Upload a video/audio file for processing."""
    # Validate file extension
    _, ext = os.path.splitext(file.filename)
    if ext.lower() not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail=f"File type '{ext}' is not supported. Supported: {', '.join(ALLOWED_EXTENSIONS)}"
        )

    # Generate unique filename to avoid collisions
    import uuid
    unique_name = f"{uuid.uuid4()}{ext}"
    file_path = os.path.join(UPLOAD_DIR, unique_name)

    # Save file with size check
    total_size = 0
    with open(file_path, "wb") as f:
        while True:
            chunk = await file.read(1024 * 1024)  # Read 1MB at a time
            if not chunk:
                break
            total_size += len(chunk)
            if total_size > MAX_FILE_SIZE:
                f.close()
                os.remove(file_path)
                raise HTTPException(status_code=413, detail="File too large. Maximum size is 500MB.")
            f.write(chunk)

    return {
        "filename": unique_name,
        "original_name": file.filename,
        "size": total_size,
    }
