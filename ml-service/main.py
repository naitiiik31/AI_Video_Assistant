"""
AI Video Assistant — FastAPI ML Service
Exposes the existing Python AI pipeline (Whisper, Sarvam, Mistral, ChromaDB) as REST APIs.
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import os

# Load environment variables
load_dotenv(os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", ".env"))

from routers.process import router as process_router
from routers.chat import router as chat_router

app = FastAPI(
    title="AI Video Assistant — ML Service",
    description="FastAPI service wrapping the AI pipeline: Whisper, Sarvam AI, Mistral, LangChain, ChromaDB",
    version="1.0.0",
)

# CORS — allow Express backend to communicate
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, restrict to Express server URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(process_router, tags=["Processing"])
app.include_router(chat_router, tags=["Chat"])


@app.get("/health")
async def health_check():
    """Health check endpoint."""
    return {
        "status": "healthy",
        "service": "ml-service",
        "whisper_model": os.getenv("WHISPER_MODEL", "small"),
        "sarvam_configured": bool(os.getenv("SARVAM_API_KEY")),
        "mistral_configured": bool(os.getenv("MISTRAL_API_KEY")),
    }


@app.on_event("startup")
async def startup_event():
    """Pre-load models on startup for faster first request."""
    print("ML Service starting up...")
    print(f"   Whisper model: {os.getenv('WHISPER_MODEL', 'small')}")
    print(f"   Sarvam configured: {bool(os.getenv('SARVAM_API_KEY'))}")
    print(f"   Mistral configured: {bool(os.getenv('MISTRAL_API_KEY'))}")

    # Create required directories
    os.makedirs("uploads", exist_ok=True)
    os.makedirs(os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "vector_db"), exist_ok=True)
