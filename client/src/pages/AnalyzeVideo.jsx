import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Link2, Upload, Globe, Loader, Sparkles, CheckCircle2, PlayCircle, Zap } from 'lucide-react';
import FileUpload from '../components/ui/FileUpload';
import ProcessingProgress from '../components/video/ProcessingProgress';
import { useVideoPolling } from '../hooks/useVideoPolling';
import { analyzeYouTube, analyzeFile } from '../services/api';
import toast from 'react-hot-toast';

export default function AnalyzeVideo() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const resumeVideoId = searchParams.get('videoId');

  const [mode, setMode] = useState('youtube'); // 'youtube' | 'upload'
  const [url, setUrl] = useState('');
  const [file, setFile] = useState(null);
  const [language, setLanguage] = useState('english');
  const [submitting, setSubmitting] = useState(false);
  const [videoId, setVideoId] = useState(resumeVideoId || null);

  const { status, stage, error } = useVideoPolling(
    videoId,
    resumeVideoId ? 'processing' : null
  );

  const handleSubmit = async () => {
    if (submitting) return;

    if (mode === 'youtube' && !url.trim()) {
      toast.error('Please enter a valid YouTube URL');
      return;
    }

    if (mode === 'upload' && !file) {
      toast.error('Please select an audio/video file');
      return;
    }

    setSubmitting(true);
    try {
      let res;
      if (mode === 'youtube') {
        res = await analyzeYouTube(url.trim(), language);
      } else {
        res = await analyzeFile(file, language);
      }

      const vid = res.data.data.videoId;
      setVideoId(vid);
      toast.success('AI processing started!');
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to start video processing';
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleSampleUrl = () => {
    setUrl('https://www.youtube.com/watch?v=dQw4w9WgXcQ');
    toast.success('Sample YouTube URL loaded!');
  };

  // If processing or completed, show progress
  if (videoId && status) {
    if (status === 'completed') {
      navigate(`/videos/${videoId}`);
      return null;
    }

    return (
      <div className="max-w-2xl mx-auto animate-fade-in">
        <ProcessingProgress status={status} currentStage={stage} />
        {error && (
          <div className="glass-card p-6 mt-6 border-red-500/30 bg-red-500/10 rounded-2xl text-center">
            <p className="text-sm text-red-400 font-semibold mb-1">Processing Interrupted</p>
            <p className="text-xs text-red-300/80 mb-4">{error}</p>
            <button
              onClick={() => {
                setVideoId(null);
              }}
              className="btn-secondary text-sm px-6 py-2.5"
            >
              Try Another Video
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-fade-in py-2">
      {/* Header Banner */}
      <div className="text-center space-y-3 pt-2 pb-1">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-violet-500/15 to-cyan-500/15 border border-violet-500/20 text-xs font-extrabold text-[var(--accent-primary)] uppercase tracking-wider badge-glow">
          <Zap className="w-3.5 h-3.5 text-amber-400 fill-amber-400" /> Powered by Whisper & Mistral AI
        </div>

        <h1 className="text-3xl md:text-4xl font-extrabold text-[var(--text-primary)] font-heading tracking-tight leading-tight">
          Analyze Video Intelligence
        </h1>
        <p className="text-sm md:text-base text-[var(--text-muted)] max-w-xl mx-auto leading-relaxed pt-1">
          Extract transcriptions, summaries, action items, and chat interactively with any video or audio file.
        </p>
      </div>

      {/* Main Form Card */}
      <div className="glass-card p-6 md:p-8 space-y-8 relative overflow-hidden">
        {/* Decorative corner glow */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-violet-600/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-cyan-500/15 rounded-full blur-3xl pointer-events-none" />

        {/* Mode Toggle Switcher */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] mb-3">
            Select Input Source
          </label>
          <div className="p-1.5 bg-[var(--bg-secondary)] border border-[var(--glass-border)] rounded-2xl grid grid-cols-2 gap-2">
            <button
              onClick={() => setMode('youtube')}
              className={`flex items-center justify-center gap-2.5 py-3 px-4 rounded-xl text-sm font-bold transition-all duration-200 ${
                mode === 'youtube'
                  ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-lg shadow-violet-500/25'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-card)]'
              }`}
            >
              <Link2 className="w-4 h-4 shrink-0" /> YouTube URL
            </button>

            <button
              onClick={() => setMode('upload')}
              className={`flex items-center justify-center gap-2.5 py-3 px-4 rounded-xl text-sm font-bold transition-all duration-200 ${
                mode === 'upload'
                  ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-lg shadow-violet-500/25'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-card)]'
              }`}
            >
              <Upload className="w-4 h-4 shrink-0" /> Upload File
            </button>
          </div>
        </div>

        {/* Source Inputs */}
        <div className="space-y-4">
          {mode === 'youtube' ? (
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-bold text-[var(--text-primary)]">
                  YouTube Video Link
                </label>
                <button
                  type="button"
                  onClick={handleSampleUrl}
                  className="text-xs font-bold text-[var(--accent-primary)] hover:underline flex items-center gap-1"
                >
                  <PlayCircle className="w-3.5 h-3.5" /> Try Sample URL
                </button>
              </div>

              <div className="relative">
                <Globe className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--text-muted)] pointer-events-none" />
                <input
                  type="url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://www.youtube.com/watch?v=..."
                  className="input-field pl-12 pr-4 py-3.5 text-sm md:text-base"
                  id="youtube-url-input"
                />
              </div>
              <p className="text-xs text-[var(--text-muted)] mt-2">
                Paste any public YouTube video link. Supports all lengths and formats.
              </p>
            </div>
          ) : (
            <div>
              <label className="block text-sm font-bold text-[var(--text-primary)] mb-2">
                Upload Media File
              </label>
              <FileUpload
                file={file}
                onFileSelect={setFile}
                onClear={() => setFile(null)}
              />
            </div>
          )}
        </div>

        {/* Language Selection */}
        <div className="space-y-3">
          <label className="block text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">
            AI Speech Recognition Engine
          </label>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              {
                value: 'english',
                label: 'English Model',
                sublabel: 'Powered by OpenAI Whisper V3',
                tag: 'Recommended',
              },
              {
                value: 'hinglish',
                label: 'Hinglish / Hindi',
                sublabel: 'Powered by Sarvam Saaras AI',
                tag: 'Indian Accents',
              },
            ].map(({ value, label, sublabel, tag }) => {
              const selected = language === value;

              return (
                <label
                  key={value}
                  className={`
                    relative p-4 rounded-2xl border cursor-pointer transition-all duration-200 flex items-start gap-3.5
                    ${
                      selected
                        ? 'border-[var(--accent-primary)] bg-gradient-to-br from-violet-600/15 to-cyan-500/10 shadow-md ring-1 ring-[var(--accent-primary)]/40'
                        : 'border-[var(--glass-border)] bg-[var(--bg-secondary)]/40 hover:border-violet-500/30'
                    }
                  `}
                >
                  <input
                    type="radio"
                    name="language"
                    value={value}
                    checked={selected}
                    onChange={(e) => setLanguage(e.target.value)}
                    className="mt-1 w-4 h-4 accent-[var(--accent-primary)] shrink-0"
                  />

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm font-bold text-[var(--text-primary)] truncate">
                        {label}
                      </p>
                      {selected && (
                        <CheckCircle2 className="w-4 h-4 text-[var(--accent-primary)] shrink-0" />
                      )}
                    </div>
                    <p className="text-xs text-[var(--text-muted)] mt-0.5">{sublabel}</p>
                    <span className="inline-block mt-2 px-2 py-0.5 rounded-md bg-[var(--bg-secondary)] text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-wider">
                      {tag}
                    </span>
                  </div>
                </label>
              );
            })}
          </div>
        </div>

        {/* Submit Action Button */}
        <button
          onClick={handleSubmit}
          disabled={submitting}
          className="btn-primary w-full py-4 text-base rounded-2xl shadow-xl flex items-center justify-center gap-3"
          id="analyze-submit-btn"
        >
          {submitting ? (
            <>
              <Loader className="w-5 h-5 animate-spin" />
              <span>Initiating AI Pipeline...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-5 h-5 text-amber-300" />
              <span>Analyze Video Now</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
