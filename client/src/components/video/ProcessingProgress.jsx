import { CheckCircle, Circle, Loader } from 'lucide-react';

const PIPELINE_STAGES = [
  { key: 'audio_extraction', label: 'Audio Extraction', icon: '🔊' },
  { key: 'transcription', label: 'Transcription', icon: '📝' },
  { key: 'title_generation', label: 'Semantic Title', icon: '🏷️' },
  { key: 'summary_generation', label: 'Smart Summary', icon: '📋' },
  { key: 'action_items', label: 'Action Items', icon: '✅' },
  { key: 'key_decisions', label: 'Key Decisions', icon: '🔑' },
  { key: 'open_questions', label: 'Open Questions', icon: '❓' },
  { key: 'rag_indexing', label: 'RAG Indexing', icon: '🧠' },
  { key: 'completed', label: 'Completed', icon: '🎉' },
];

export default function ProcessingProgress({ status, currentStage }) {
  const currentIndex = PIPELINE_STAGES.findIndex((s) => s.key === currentStage);

  const getStageState = (index) => {
    if (status === 'completed') return 'done';
    if (status === 'failed') {
      if (index < currentIndex) return 'done';
      if (index === currentIndex) return 'failed';
      return 'pending';
    }
    if (index < currentIndex) return 'done';
    if (index === currentIndex) return 'active';
    return 'pending';
  };

  return (
    <div className="glass-card p-6 md:p-8">
      <div className="text-center mb-8">
        <h2 className="text-xl font-bold text-[var(--text-primary)] mb-2">
          {status === 'completed'
            ? '✨ Processing Complete'
            : status === 'failed'
            ? '❌ Processing Failed'
            : '⚙️ Processing Video'}
        </h2>
        <p className="text-sm text-[var(--text-muted)]">
          {status === 'completed'
            ? 'Your video has been analyzed successfully.'
            : status === 'failed'
            ? 'An error occurred during processing.'
            : 'Our AI is analyzing your content...'}
        </p>
      </div>

      <div className="max-w-md mx-auto space-y-2.5">
        {PIPELINE_STAGES.map((stage, index) => {
          const state = getStageState(index);

          return (
            <div
              key={stage.key}
              className={`
                flex items-center gap-3.5 px-4 py-3 rounded-xl transition-all duration-300 border
                ${state === 'active' ? 'bg-[var(--accent-primary)]/10 border-[var(--accent-primary)]/40 shadow-sm scale-[1.01]' : 'border-transparent'}
                ${state === 'done' ? 'opacity-90 bg-[var(--bg-secondary)]/40' : ''}
                ${state === 'pending' ? 'opacity-50' : ''}
                ${state === 'failed' ? 'bg-red-500/10 border-red-500/30' : ''}
              `}
            >
              {/* Status indicator */}
              <div className="shrink-0 flex items-center justify-center w-6 h-6">
                {state === 'done' && (
                  <CheckCircle className="w-5 h-5 text-emerald-500" />
                )}
                {state === 'active' && (
                  <Loader className="w-5 h-5 text-[var(--accent-primary)] animate-spin" />
                )}
                {state === 'pending' && (
                  <Circle className="w-5 h-5 text-[var(--text-muted)]" />
                )}
                {state === 'failed' && (
                  <Circle className="w-5 h-5 text-red-500" />
                )}
              </div>

              {/* Icon */}
              <span className="text-lg shrink-0 w-7 text-center">{stage.icon}</span>

              {/* Label */}
              <span
                className={`text-sm font-semibold truncate flex-1
                  ${state === 'active' ? 'text-[var(--accent-primary)]' : 'text-[var(--text-primary)]'}
                  ${state === 'failed' ? 'text-red-500' : ''}
                `}
              >
                {stage.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
