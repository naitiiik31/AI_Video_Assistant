# 🎬 AI Video Assistant

A production-quality **AI-powered Video Intelligence Platform** built as a full-stack application. Upload a YouTube video or local file, and the system automatically generates transcripts, summaries, action items, key decisions, open questions, and provides an interactive AI Q&A experience powered by RAG (Retrieval-Augmented Generation).

## 🏗 Architecture

```
React + Vite (5173)  ──→  Express.js API Gateway (5000)  ──→  FastAPI ML Service (8000)
       ↓                            ↓                                    ↓
   Clerk Auth                   MongoDB                      Whisper / Sarvam / Mistral
   Tailwind CSS                 Mongoose                     LangChain / ChromaDB
   React Router                 Rate Limiting                HuggingFace Embeddings
```

## ✨ Features

### AI Pipeline
- **Transcription**: Whisper (English) / Sarvam AI (Hinglish)
- **Title Generation**: AI-generated semantic titles
- **Smart Summary**: Multi-pass Mistral AI summarization
- **Action Items Extraction**: Task, owner, deadline parsing
- **Key Decisions**: Decision identification and extraction
- **Open Questions**: Unresolved topic detection
- **RAG Q&A**: Chat with your video using ChromaDB + HuggingFace embeddings

### Application
- 🔐 **Authentication**: Clerk (sign up, sign in, protected routes)
- 🎥 **YouTube & Local Files**: Supports MP4, MP3, WAV, M4A, WebM
- 🌐 **Multi-language**: English (Whisper) and Hinglish (Sarvam AI)
- 📊 **Dashboard**: Real-time statistics and recent videos
- 🔄 **Async Processing**: Job-based architecture with progress tracking
- 💬 **AI Chat**: RAG-powered Q&A per video with persistent history
- 📥 **Downloads**: Transcript, summary, and full analysis reports
- 🌓 **Dark/Light Mode**: System-aware with manual toggle
- 📱 **Responsive**: Desktop, tablet, and mobile layouts
- 🔒 **User Isolation**: Per-user data + per-video RAG collections

## 🛠 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Vite, Tailwind CSS, React Router, Axios, Recharts, Lucide React |
| Backend | Node.js, Express.js, Mongoose |
| Auth | Clerk |
| Database | MongoDB |
| AI Service | Python FastAPI, OpenAI Whisper, Sarvam AI, Mistral AI |
| AI Framework | LangChain, ChromaDB, HuggingFace sentence-transformers |
| Embeddings | all-MiniLM-L6-v2 |

## 📁 Project Structure

```
AI-Video-Assistant/
├── client/                 # React + Vite frontend
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/          # Route pages
│   │   ├── context/        # React context (theme)
│   │   ├── hooks/          # Custom hooks
│   │   ├── services/       # API service layer
│   │   └── App.jsx         # Root component with routing
│   └── vite.config.js
├── server/                 # Express.js API gateway
│   ├── config/             # Database config
│   ├── middleware/          # Auth, upload, error handling
│   ├── models/             # Mongoose models
│   ├── controllers/        # Route handlers
│   ├── routes/             # API routes
│   ├── services/           # ML service client
│   └── server.js
├── ml-service/             # FastAPI Python AI service
│   ├── core/               # AI modules (preserved from original)
│   │   ├── transcriber.py  # Whisper + Sarvam
│   │   ├── summarizer.py   # Mistral summarization
│   │   ├── extractor.py    # Action items, decisions, questions
│   │   ├── rag_engine.py   # RAG chain builder
│   │   └── vector_store.py # ChromaDB (per-video isolation)
│   ├── utils/              # Audio processing
│   ├── routers/            # FastAPI endpoints
│   ├── services/           # Pipeline orchestration
│   └── main.py             # FastAPI entry point
├── .env.example
├── docker-compose.yml
└── package.json            # Root scripts
```

## 🚀 Installation

### Prerequisites
- **Node.js** 18+
- **Python** 3.10+
- **MongoDB** (local or Atlas)
- **FFmpeg** (required for audio processing)
- **Clerk Account** (for authentication)

### 1. Clone & Install

```bash
# Install Node.js dependencies
cd client && npm install
cd ../server && npm install
cd ..
npm install  # Root (concurrently)

# Install Python dependencies
cd ml-service
pip install -r requirements.txt
```

### 2. Configure Environment

```bash
cp .env.example .env
# Edit .env with your actual keys
```

Required keys:
- `MONGODB_URI` — MongoDB connection string
- `CLERK_SECRET_KEY` — From Clerk dashboard
- `VITE_CLERK_PUBLISHABLE_KEY` — From Clerk dashboard
- `MISTRAL_API_KEY` — From Mistral AI
- `SARVAM_API_KEY` — For Hinglish support (optional)

### 3. Run

```bash
# Start all 3 services
npm run dev

# Or individually:
npm run client   # React on :5173
npm run server   # Express on :5000
npm run ml       # FastAPI on :8000
```

## 🔌 API Endpoints

### Express API Gateway (port 5000)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/videos/analyze` | Start video analysis |
| GET | `/api/videos` | List user's videos |
| GET | `/api/videos/:id` | Get video details |
| GET | `/api/videos/:id/status` | Poll processing status |
| DELETE | `/api/videos/:id` | Delete video |
| GET | `/api/videos/stats` | Dashboard statistics |
| GET | `/api/videos/:id/download/:type` | Download content |
| POST | `/api/videos/:id/chat` | Send RAG question |
| GET | `/api/videos/:id/chat` | Get chat history |

### FastAPI ML Service (port 8000)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Health check |
| POST | `/process` | Start processing job |
| GET | `/jobs/{job_id}` | Get job status |
| POST | `/upload` | Upload file |
| POST | `/ask` | RAG Q&A |

## 🧠 RAG Architecture

Each processed video gets its own isolated ChromaDB collection:

```
ChromaDB
├── collection: video_abc123  ← User A's video
├── collection: video_def456  ← User B's video
└── collection: video_ghi789  ← User A's second video
```

- **Embeddings**: HuggingFace `all-MiniLM-L6-v2`
- **Chunking**: 500 chars, 50 overlap (RecursiveCharacterTextSplitter)
- **Retrieval**: Similarity search, k=4
- **LLM**: Mistral Small (grounded answers only)

## 🐳 Docker

```bash
docker-compose up -d
```

## 🔧 Troubleshooting

| Issue | Solution |
|-------|---------|
| FFmpeg not found | Install FFmpeg and add to PATH |
| Whisper model download slow | First run downloads the model (~500MB for "small") |
| MongoDB connection failed | Ensure MongoDB is running on the configured URI |
| Clerk auth errors | Verify CLERK_SECRET_KEY and VITE_CLERK_PUBLISHABLE_KEY |
| CORS errors | Check CLIENT_URL in .env matches your frontend URL |
| ML service unavailable | Ensure FastAPI is running on port 8000 |

## 🚀 Future Improvements

- WebSocket/SSE for real-time progress (replace polling)
- PDF report generation endpoint
- Video timestamp alignment with transcript
- Speaker diarization
- Multi-language support beyond English/Hinglish
- Redis job queue for horizontal scaling
- Kubernetes deployment configs
- End-to-end testing with Playwright
