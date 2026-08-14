"""
Chat router — handles RAG Q&A endpoints.
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from core.rag_engine import load_rag_chain, ask_question

router = APIRouter()

# Cache loaded RAG chains to avoid rebuilding on every question
_rag_chain_cache = {}


class ChatRequest(BaseModel):
    video_id: str
    question: str


@router.post("/ask")
async def ask_ai(request: ChatRequest):
    """Ask a question about a processed video using RAG."""
    if not request.question.strip():
        raise HTTPException(status_code=400, detail="Question cannot be empty")

    try:
        # Load or get cached RAG chain for this video
        if request.video_id not in _rag_chain_cache:
            print(f"Loading RAG chain for video: {request.video_id}")
            _rag_chain_cache[request.video_id] = load_rag_chain(request.video_id)

        rag_chain = _rag_chain_cache[request.video_id]
        answer = ask_question(rag_chain, request.question)

        return {
            "answer": answer,
            "video_id": request.video_id,
        }

    except Exception as e:
        print(f"RAG error for video {request.video_id}: {e}")
        raise HTTPException(
            status_code=500,
            detail="Unable to answer right now. The video may not have been processed yet, or an internal error occurred."
        )
