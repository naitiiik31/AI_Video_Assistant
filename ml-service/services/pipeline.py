"""
Pipeline service — wraps the existing AI pipeline for use by FastAPI.
Runs the full processing pipeline in a background thread with stage tracking.
"""

import os
import uuid
import threading
from datetime import datetime
from utils.audio_processor import process_input, cleanup_temp_files, cleanup_directory
from core.transcriber import transcribe_all
from core.summarizer import summarize, generate_title
from core.extractor import extract_action_items, extract_key_decisions, extract_questions
from core.rag_engine import build_rag_chain

# In-memory job store (per-process)
_jobs = {}
_jobs_lock = threading.Lock()

UPLOAD_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "uploads")
os.makedirs(UPLOAD_DIR, exist_ok=True)


def get_job(job_id: str) -> dict:
    """Get current job status and results."""
    with _jobs_lock:
        return _jobs.get(job_id)


def create_job(video_id: str, source: str, source_type: str, language: str, file_path: str = None) -> str:
    """Create a new processing job and start it in a background thread."""
    job_id = str(uuid.uuid4())

    job = {
        "job_id": job_id,
        "video_id": video_id,
        "source": source,
        "source_type": source_type,
        "language": language,
        "file_path": file_path,
        "status": "processing",
        "stage": "audio_extraction",
        "error": None,
        "results": None,
        "created_at": datetime.utcnow().isoformat(),
        "updated_at": datetime.utcnow().isoformat(),
    }

    with _jobs_lock:
        _jobs[job_id] = job

    # Start processing in background thread
    thread = threading.Thread(target=_run_pipeline, args=(job_id,), daemon=True)
    thread.start()

    return job_id


def _update_job(job_id: str, **kwargs):
    """Update job fields thread-safely."""
    with _jobs_lock:
        if job_id in _jobs:
            _jobs[job_id].update(kwargs)
            _jobs[job_id]["updated_at"] = datetime.utcnow().isoformat()


def _run_pipeline(job_id: str):
    """
    Execute the full video processing pipeline.
    This runs in a background thread and updates job status at each stage.
    """
    job = get_job(job_id)
    if not job:
        return

    source = job["source"]
    source_type = job["source_type"]
    language = job["language"]
    file_path = job["file_path"]
    video_id = job["video_id"]

    # Create job-specific temp directory
    job_download_dir = os.path.join(UPLOAD_DIR, f"job_{job_id}")
    os.makedirs(job_download_dir, exist_ok=True)

    chunks = []

    try:
        # ── Stage 1: Audio Extraction ──────────────────────────────
        _update_job(job_id, stage="audio_extraction", status="processing")
        print(f"[Job {job_id}] Stage: audio_extraction")

        if source_type == "youtube":
            chunks = process_input(source, download_dir=job_download_dir)
        elif source_type == "upload" and file_path:
            chunks = process_input(file_path, download_dir=job_download_dir)
        else:
            raise ValueError(f"Invalid source_type: {source_type}")

        # ── Stage 2: Transcription ──────────────────────────────────
        _update_job(job_id, stage="transcription")
        print(f"[Job {job_id}] Stage: transcription")
        transcript = transcribe_all(chunks, language)

        # ── Stage 3: Title Generation ───────────────────────────────
        _update_job(job_id, stage="title_generation")
        print(f"[Job {job_id}] Stage: title_generation")
        title = generate_title(transcript)

        # ── Stage 4: Summary Generation ─────────────────────────────
        _update_job(job_id, stage="summary_generation")
        print(f"[Job {job_id}] Stage: summary_generation")
        summary = summarize(transcript)

        # ── Stage 5: Extraction ─────────────────────────────────────
        _update_job(job_id, stage="action_items")
        print(f"[Job {job_id}] Stage: action_items")
        action_items = extract_action_items(transcript)

        _update_job(job_id, stage="key_decisions")
        print(f"[Job {job_id}] Stage: key_decisions")
        decisions = extract_key_decisions(transcript)

        _update_job(job_id, stage="open_questions")
        print(f"[Job {job_id}] Stage: open_questions")
        questions = extract_questions(transcript)

        # ── Stage 6: RAG Indexing ───────────────────────────────────
        _update_job(job_id, stage="rag_indexing")
        print(f"[Job {job_id}] Stage: rag_indexing")
        build_rag_chain(transcript, video_id)

        # ── Done ────────────────────────────────────────────────────
        results = {
            "title": title,
            "transcript": transcript,
            "summary": summary,
            "action_items": action_items,
            "key_decisions": decisions,
            "open_questions": questions,
        }

        _update_job(job_id, stage="completed", status="completed", results=results)
        print(f"[Job {job_id}] Pipeline completed successfully")

    except Exception as e:
        error_msg = str(e)
        print(f"[Job {job_id}] Pipeline failed: {error_msg}")
        _update_job(job_id, status="failed", error=error_msg)

    finally:
        # Cleanup temporary audio files
        if chunks:
            cleanup_temp_files(chunks)
        cleanup_directory(job_download_dir)
        # If uploaded file exists, clean it up too
        if file_path and os.path.exists(file_path):
            try:
                os.remove(file_path)
            except Exception:
                pass
