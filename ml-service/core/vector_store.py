import os 
from langchain_chroma import Chroma 
try:
    from langchain_huggingface import HuggingFaceEmbeddings
except ImportError:
    from langchain_community.embeddings import HuggingFaceEmbeddings
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_core.documents import Document

CHROMA_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "..", "vector_db")
EMBEDDING_MODEL  = "sentence-transformers/all-MiniLM-L6-v2"

_embeddings = None

def get_embeddings():
    """Reuse embedding model instance to avoid reloading."""
    global _embeddings
    if _embeddings is None:
        _embeddings = HuggingFaceEmbeddings(
            model_name=EMBEDDING_MODEL,
            model_kwargs={"device": "cpu"},
            encode_kwargs={"normalize_embeddings": True}
        )
    return _embeddings

def build_vector_store(transcript: str, video_id: str) -> Chroma:
    """
    Build a ChromaDB vector store for a specific video.
    Each video gets its own collection for RAG isolation.
    """
    print(f"Building vector store for video: {video_id}")

    collection_name = f"video_{video_id}"

    splitter = RecursiveCharacterTextSplitter(
        chunk_size=500,
        chunk_overlap=50
    )
    chunks = splitter.split_text(transcript)

    docs = [
        Document(page_content=chunk, metadata={"chunk_index": i, "video_id": video_id})
        for i, chunk in enumerate(chunks)
    ]

    embeddings = get_embeddings()
    vector_store = Chroma.from_documents(
        documents=docs,
        embedding=embeddings,
        collection_name=collection_name,
        persist_directory=CHROMA_DIR
    )

    print(f"Vector store built with {len(docs)} chunks for collection '{collection_name}'")
    return vector_store


def load_vector_store(video_id: str) -> Chroma:
    """Load an existing vector store for a specific video."""
    collection_name = f"video_{video_id}"
    embeddings = get_embeddings()
    vector_store = Chroma(
        collection_name=collection_name,
        embedding_function=embeddings,
        persist_directory=CHROMA_DIR
    )
    return vector_store


def delete_vector_store(video_id: str):
    """Delete a video's vector store collection."""
    try:
        collection_name = f"video_{video_id}"
        import chromadb
        client = chromadb.PersistentClient(path=CHROMA_DIR)
        client.delete_collection(collection_name)
        print(f"Deleted vector store collection: {collection_name}")
    except Exception as e:
        print(f"Warning: Could not delete vector store for {video_id}: {e}")


def get_retriever(vector_store: Chroma, k: int = 4):
    return vector_store.as_retriever(
        search_type="similarity",
        search_kwargs={"k": k}
    )
