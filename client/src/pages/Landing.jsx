import { Link } from 'react-router-dom';
import { useSafeAuth } from '../hooks/useClerkSafe';
import { Sparkles, ArrowRight, Zap, Brain, MessageSquare } from 'lucide-react';

export default function Landing() {
  const { isSignedIn } = useSafeAuth();

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] flex flex-col">
      {/* Nav */}
      <nav className="flex items-center justify-between px-6 md:px-12 py-4">
        <div className="flex items-center gap-2">
          <Sparkles className="w-7 h-7 text-[var(--accent-primary)]" />
          <span className="font-bold text-lg gradient-text">AI Video Assistant</span>
        </div>
        <div className="flex items-center gap-3">
          {isSignedIn ? (
            <Link to="/dashboard" className="btn-primary text-sm">
              Dashboard <ArrowRight className="w-4 h-4 inline ml-1" />
            </Link>
          ) : (
            <>
              <Link
                to="/sign-in"
                className="btn-secondary text-sm"
              >
                Sign In
              </Link>
              <Link to="/sign-up" className="btn-primary text-sm">
                Get Started
              </Link>
            </>
          )}
        </div>
      </nav>

      {/* Hero */}
      <div className="flex-1 flex flex-col items-center justify-center text-center px-6 py-16 md:py-24">
        <div className="animate-fade-in-up">
          <div className="inline-flex items-center gap-2 bg-[var(--accent-primary)]/10 text-[var(--accent-primary)] px-4 py-1.5 rounded-full text-sm font-semibold mb-6 border border-[var(--accent-primary)]/20">
            <Sparkles className="w-4 h-4" />
            AI-Powered Video Intelligence
          </div>

          <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold leading-tight mb-6">
            <span className="gradient-text">Transform Videos</span>
            <br />
            <span className="text-[var(--text-primary)]">Into Actionable Insights</span>
          </h1>

          <p className="text-lg md:text-xl text-[var(--text-muted)] max-w-2xl mx-auto mb-10 leading-relaxed">
            Upload a video or paste a YouTube link to instantly generate transcripts,
            summaries, action items, and chat interactively with your content using
            advanced RAG technology.
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-4 justify-center">
            <Link
              to={isSignedIn ? '/analyze' : '/sign-up'}
              className="btn-primary text-base px-8 py-3.5 flex items-center gap-2"
            >
              Start Analyzing <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              to={isSignedIn ? '/dashboard' : '/sign-in'}
              className="btn-secondary text-base px-8 py-3.5"
            >
              {isSignedIn ? 'Go to Dashboard' : 'Sign In'}
            </Link>
          </div>
        </div>

        {/* Feature cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-20 max-w-4xl mx-auto w-full">
          {[
            {
              icon: Zap,
              title: 'Lightning Fast',
              desc: 'Process long videos in minutes with optimized AI pipelines.',
              color: 'text-amber-500 bg-amber-500/10',
            },
            {
              icon: Brain,
              title: 'Smart Extraction',
              desc: 'Auto-identify action items, key decisions, and open questions.',
              color: 'text-purple-500 bg-purple-500/10',
            },
            {
              icon: MessageSquare,
              title: 'Interactive Q&A',
              desc: 'Chat naturally with your video using RAG technology.',
              color: 'text-cyan-500 bg-cyan-500/10',
            },
          ].map(({ icon: Icon, title, desc, color }, i) => (
            <div
              key={i}
              className="glass-card p-6 text-center animate-fade-in-up"
              style={{ animationDelay: `${i * 0.1}s` }}
            >
              <div className={`w-12 h-12 rounded-xl ${color} flex items-center justify-center mx-auto mb-4`}>
                <Icon className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-[var(--text-primary)] mb-2">{title}</h3>
              <p className="text-sm text-[var(--text-muted)] leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <footer className="text-center py-6 text-sm text-[var(--text-muted)] border-t border-[var(--glass-border)]">
        Built with Whisper, Mistral AI, LangChain & ChromaDB RAG
      </footer>
    </div>
  );
}
