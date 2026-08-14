# 🎬 AI Video Assistant

<p align="center">
  <img src="client/public/favicon.svg" width="90" alt="AI Video Assistant Logo" />
</p>

<h3 align="center">
  Full-Stack AI Video Intelligence Platform & RAG Q&A Engine
</h3>

<p align="center">
  Transform long YouTube videos and local audio/video files into actionable insights: automatic transcriptions, smart summaries, key decision tracking, action items, and interactive RAG-powered chat.
</p>



---

## 🌟 Key Features

### 🧠 Advanced AI & RAG Pipeline
* **Multi-Model Transcription**: Built-in support for **OpenAI Whisper** (English) and **Sarvam AI Saaras v2.5** (Hinglish / Indian Accents).
* **Multi-Pass Summarization**: Extracts key takeaways, structured summaries, and context-aware insights powered by **Mistral AI**.
* **Smart Extractions**:
  * 📋 **Action Items**: Automatically detects tasks, assignees, and target timelines.
  * 💡 **Key Decisions**: Identifies major decisions made during meetings or lectures.
  * ❓ **Open Questions**: Isolates unresolved topics and pending questions.
* **Vector-Search RAG Chat**: Interactive natural language Q&A grounded strictly in video context using **ChromaDB** & **HuggingFace** sentence-transformers (`all-MiniLM-L6-v2`).

### 📱 Full-Stack Web Application
* 🎥 **YouTube & Local File Support**: Paste any public YouTube link or upload MP4, MP3, WAV, M4A, WebM files.
* 📊 **Interactive Analytics Dashboard**: Overview of processed videos, completed jobs, active processing pipelines, and query statistics.
* 💬 **Per-Video RAG Q&A**: Individual conversation history and vector isolation per video.
* 📥 **Export Reports**: Download transcripts, formatted summaries, or full Markdown intelligence reports.
* 🎨 **Modern Dark Aesthetics**: Premium UI with glassmorphism, responsive drawers, and custom micro-animations built with React 19, Vite, and Tailwind CSS.

---

## 🏗 System Architecture

```
                  ┌─────────────────────────────────────────┐
                  │          React 19 + Vite Client         │
                  │             (Port 5173)                 │
                  └────────────────────┬────────────────────┘
                                       │
                                       │ REST HTTP API
                                       ▼
                  ┌─────────────────────────────────────────┐
                  │        Express.js API Gateway           │
                  │             (Port 5000)                 │
                  └──────────┬──────────────────┬───────────┘
                             │                  │
               Mongoose ORM  │                  │ REST HTTP API
                             ▼                  ▼
                    ┌────────────────┐  ┌──────────────────────┐
                    │    MongoDB     │  │  FastAPI ML Service  │
                    │   Database     │  │     (Port 8000)      │
                    └────────────────┘  └──────────┬───────────┘
                                                   │
                  ┌────────────────────────────────┴────────────────┐
                  │                                                 │
                  ▼                                                 ▼
      ┌─────────────────────────┐                       ┌──────────────────────┐
      │   AI Transcription      │                       │ ChromaDB Vector DB   │
      │  Whisper / Sarvam AI    │                       │ HuggingFace Embeddings│
      └─────────────────────────┘                       └──────────────────────┘
                  │                                                 │
                  └────────────────────┬────────────────────────────┘
                                       │
                                       ▼
                         ┌──────────────────────────┐
                         │   Mistral AI Engine      │
                         │ (Summaries, RAG & Chat)  │
                         └──────────────────────────┘
```

---

## 🛠 Tech Stack

| Domain | Technology / Library |
| :--- | :--- |
| **Frontend** | React 18 / 19, Vite 8, Tailwind CSS v4, Lucide React, Recharts, Axios, React Router v7 |
| **Backend Gateway** | Node.js, Express.js, Mongoose, Multer |
| **Database** | MongoDB |
| **AI Processing Service** | Python 3.10+, FastAPI, Uvicorn, Pydantic |
| **Speech Recognition** | OpenAI Whisper, Sarvam AI (`saaras:v2.5`) |
| **LLM & RAG** | Mistral AI, LangChain, ChromaDB, HuggingFace (`sentence-transformers/all-MiniLM-L6-v2`) |
| **Audio Processing** | FFmpeg, yt-dlp, PyDub |

---

## 📂 Project Directory Structure

```
AI-Video-Assistant/
├── client/                     # React + Vite Frontend Application
│   ├── src/
│   │   ├── components/         # Modular Layout, UI, & Video components
│   │   ├── context/            # React Theme context
│   │   ├── hooks/              # Custom hooks & Video polling
│   │   ├── pages/              # Landing, Dashboard, Analyze, MyVideos, VideoDetail
│   │   ├── services/           # Axios API Client
│   │   └── App.jsx             # Router entry point
│   ├── .env.local              # Client Environment Variables
│   └── vite.config.js          # Vite configuration
│
├── server/                     # Express.js API Gateway
│   ├── config/                 # MongoDB database connection
│   ├── controllers/            # Video, Stats, Chat, & Download handlers
│   ├── middleware/             # Multer File Uploads & Error Handling
│   ├── models/                 # Mongoose Schemas (Video, ChatMessage, UserProfile)
│   ├── routes/                 # Express API routes
│   └── server.js               # Express application entry
│
├── ml-service/                 # FastAPI Python AI Microservice
│   ├── core/                   # Transcriber, Summarizer, Extractor, RAG Engine, ChromaDB
│   ├── routers/                # FastAPI Endpoints (/process, /ask, /upload)
│   ├── services/               # Pipeline Execution & Job Queue Orchestration
│   ├── main.py                 # FastAPI service entry point
│   └── requirements.txt        # Python Dependencies
│
├── .env.local                  # Environment Secrets (Git Ignored)
├── docker-compose.yml          # Containerized deployment config
└── package.json                # Root Concurrently Orchestrator
```

---

## ⚡ Quick Start & Installation

### Prerequisites
* **Node.js** v18 or higher
* **Python** 3.10+
* **MongoDB** (Local instance or MongoDB Atlas cluster URI)
* **FFmpeg** installed and accessible in system `PATH`

---

### Step 1: Clone Repository

```bash
git clone https://github.com/naitiiik31/AI_Video_Assistant.git
cd AI_Video_Assistant
```

### Step 2: Install Dependencies

```bash
# Install root orchestration tools
npm install

# Install client dependencies
cd client && npm install

# Install server dependencies
cd ../server && npm install

# Install Python ML dependencies
cd ../ml-service
pip install -r requirements.txt
cd ..
```

---

### Step 3: Configure Environment Variables

Create `.env.local` in the **root directory**:

```env
# ─── MongoDB ───
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/ai-video-assistant?retryWrites=true&w=majority

# ─── AI Model APIs ───
MISTRAL_API_KEY=your_mistral_api_key
SARVAM_API_KEY=your_sarvam_api_key

# ─── System Defaults ───
WHISPER_MODEL=small
SARVAM_STT_MODEL=saaras:v2.5
ML_SERVICE_URL=http://127.0.0.1:8000
CLIENT_URL=http://localhost:5173
PORT=5000
NODE_ENV=development
```

> [!IMPORTANT]
> Never expose `MISTRAL_API_KEY` to client-side files or commit `.env.local` to public repositories.

---

### Step 4: Run the Application

Start all services (Client, Express Gateway, and FastAPI ML Engine) with a single command:

```bash
npm run dev
```

The services will launch on:
* 🌐 **Frontend App**: `http://localhost:5173`
* 🔌 **Express API**: `http://localhost:5000`
* ⚡ **FastAPI ML Service**: `http://127.0.0.1:8000`

---

## 📡 API Reference

### Express API Gateway (`:5000`)

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/videos/analyze` | Submit YouTube URL or file for AI analysis |
| `GET` | `/api/videos` | List user's videos (Paginated) |
| `GET` | `/api/videos/:id` | Get video details, transcript, & summary |
| `GET` | `/api/videos/:id/status` | Poll real-time processing status |
| `DELETE`| `/api/videos/:id` | Delete video & clear ChromaDB collection |
| `GET` | `/api/videos/stats` | Dashboard analytical counters |
| `GET` | `/api/videos/:id/download/:type`| Export transcript, summary, or report |
| `POST` | `/api/videos/:id/chat` | Send question to video RAG pipeline |
| `GET` | `/api/videos/:id/chat` | Fetch chat history for video |

### FastAPI ML Microservice (`:8000`)

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/health` | Service health status check |
| `POST` | `/process` | Initiate Whisper / Sarvam / Mistral pipeline job |
| `GET` | `/jobs/{job_id}`| Query status of processing job |
| `POST` | `/upload` | Forward uploaded file for processing |
| `POST` | `/ask` | Execute ChromaDB Vector Search + Mistral RAG |

---

## 🛡 Security & Privacy

* **Isolated Vector Storage**: Multi-tenant data segregation in MongoDB and isolated ChromaDB collections per video (`video_<id>`).
* **Environment Protection**: `.gitignore` strictly ignores `.env`, `.env.local`, and build artifacts.

---

## 🤝 Contributing

Contributions, issues, and feature requests are welcome!
Feel free to check out the [Issues Page](https://github.com/naitiiik31/AI_Video_Assistant/issues).

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git checkout -b feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.

---

<p align="center">
  Built with ❤️ by <a href="https://github.com/naitiiik31">Naitik Patel</a>
</p>
