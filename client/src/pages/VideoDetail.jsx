import { useState, useEffect } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import {
  FileText, List, CheckSquare, KeyRound, HelpCircle, MessageSquare,
  Download, Copy, Check, LayoutDashboard, CheckCircle2
} from 'lucide-react';
import { getVideo, downloadContent } from '../services/api';
import TranscriptViewer from '../components/video/TranscriptViewer';
import ChatInterface from '../components/video/ChatInterface';
import SkeletonLoader from '../components/ui/SkeletonLoader';
import ReactMarkdown from 'react-markdown';
import toast from 'react-hot-toast';

const TABS = [
  { key: 'overview', label: 'Overview', icon: LayoutDashboard },
  { key: 'transcript', label: 'Transcript', icon: FileText },
  { key: 'summary', label: 'Summary', icon: List },
  { key: 'actions', label: 'Action Items', icon: CheckSquare },
  { key: 'decisions', label: 'Decisions', icon: KeyRound },
  { key: 'questions', label: 'Questions', icon: HelpCircle },
];

export default function VideoDetail() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [video, setVideo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'overview');
  const [copied, setCopied] = useState('');

  useEffect(() => {
    loadVideo();
  }, [id]);

  const loadVideo = async () => {
    try {
      const res = await getVideo(id);
      setVideo(res.data.data);
    } catch (err) {
      toast.error('Failed to load video');
      navigate('/my-videos');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async (text, label) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(label);
      toast.success(`${label} copied`);
      setTimeout(() => setCopied(''), 2000);
    } catch {
      toast.error('Failed to copy');
    }
  };

  const handleDownload = async (type) => {
    try {
      const res = await downloadContent(id, type);
      const blob = new Blob([res.data]);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      const ext = type === 'report' ? '.md' : '.txt';
      a.download = `${video?.title || 'download'}${ext}`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success('Download started');
    } catch {
      toast.error('Download failed');
    }
  };

  // Helper to format summary into checklist items with green circular checkmarks matching Section 14
  const renderFormattedSummary = (summaryText) => {
    if (!summaryText) return null;

    const rawLines = summaryText.split('\n').map(l => l.trim()).filter(Boolean);
    let introText = "";
    let outroText = "";
    const items = [];
    let stage = 'intro';

    for (const line of rawLines) {
      const listMatch = line.match(/^(\d+[\.\)]|[\*\-\•\✓\✔])\s*(.*)/);
      if (listMatch) {
        stage = 'items';
        const cleanText = listMatch[2].replace(/^[\*\-\•\✓\✔\d\.\)]+\s*/, '');
        items.push(cleanText);
      } else {
        if (stage === 'items') {
          outroText += (outroText ? " " : "") + line;
        } else {
          introText += (introText ? " " : "") + line;
        }
      }
    }

    if (items.length > 0) {
      return (
        <div className="space-y-3.5">
          {introText && (
            <div className="text-[16px] text-[#D8D9E4] leading-[1.6] font-normal">
              <ReactMarkdown components={{ p: 'span', strong: 'strong' }}>{introText}</ReactMarkdown>
            </div>
          )}

          {/* Checklist Items (Section 14: 15px, 400 weight, 18-20px green check icon) */}
          <div className="space-y-3 py-1">
            {items.map((itemText, idx) => (
              <div key={idx} className="flex items-start gap-3">
                <CheckCircle2 className="w-[19px] h-[19px] text-[#20D6A0] shrink-0 mt-0.5" />
                <span className="text-[15px] text-[#D8D9E4] leading-[1.5] font-normal">
                  <ReactMarkdown components={{ p: 'span', strong: 'strong' }}>{itemText}</ReactMarkdown>
                </span>
              </div>
            ))}
          </div>

          {outroText && (
            <div className="text-[15px] text-[#D0D1DC] leading-[1.5] font-normal pt-1">
              <ReactMarkdown components={{ p: 'span', strong: 'strong' }}>{outroText}</ReactMarkdown>
            </div>
          )}
        </div>
      );
    }

    return (
      <div className="text-[16px] leading-[1.6] text-[#D8D9E4] font-normal prose prose-invert max-w-none">
        <ReactMarkdown>{summaryText}</ReactMarkdown>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="space-y-6 py-4 px-[32px]">
        <div className="skeleton h-4 w-32 bg-white/5" />
        <div className="skeleton h-10 w-96 bg-white/5" />
        <SkeletonLoader lines={6} />
      </div>
    );
  }

  if (!video) return null;

  return (
    <div className="px-[32px] pt-[28px] pb-10 space-y-6 animate-fade-in">
      {/* Report Header Title Area */}
      <div>
        <p className="text-[13px] font-bold uppercase tracking-[0.4px] text-[#8B5CF6] mb-1 font-heading">
          INTELLIGENCE REPORT
        </p>
        <h1 className="text-[38px] font-bold text-[#F7F7FA] font-heading leading-[1.15]">
          {video.title || 'Ten Tips to Remember English Words'}
        </h1>
      </div>

      {/* Tab Navigation & Ask AI Button (Section 9 & 10) */}
      <div className="flex items-center justify-between border-b border-white/10 pb-1 overflow-x-auto scrollbar-none gap-4">
        <div className="flex items-center gap-[32px] shrink-0">
          {TABS.map(({ key, label, icon: Icon }) => {
            const active = activeTab === key;
            return (
              <button
                key={key}
                onClick={() => setActiveTab(key)}
                className={`flex items-center gap-2 py-3 text-[16px] font-medium transition-all relative shrink-0 ${
                  active ? 'text-[#9B6CFF] font-semibold' : 'text-[#C0C1CE] hover:text-white'
                }`}
                id={`tab-${key}`}
              >
                <Icon className="w-[19px] h-[19px]" />
                <span>{label}</span>
                {active && (
                  <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#9B6CFF] rounded-full shadow-sm" />
                )}
              </button>
            );
          })}
        </div>

        {/* 15px Ask AI Button (Section 10) */}
        <button
          onClick={() => setActiveTab('chat')}
          className={`shrink-0 flex items-center gap-2 h-[48px] px-5 rounded-[10px] text-[15px] font-semibold transition-all shadow-md ${
            activeTab === 'chat'
              ? 'bg-[#6C35E8] text-white shadow-purple-500/30'
              : 'bg-gradient-to-r from-[#6C35E8] to-[#8B5CF6] hover:opacity-95 text-white shadow-purple-500/25'
          }`}
          id="ask-ai-tab-btn"
        >
          <MessageSquare className="w-[19px] h-[19px]" />
          <span>Ask AI</span>
        </button>
      </div>

      {/* Tab Content */}
      <div className="animate-fade-in" key={activeTab}>
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* AI Assistant Card (Section 11 - 15 Pixel Perfect Typography) */}
            <div className="bg-[rgba(12,15,35,0.75)] border border-white/12 rounded-[13px] p-7 shadow-lg">
              {/* Card Header */}
              <div className="flex items-center gap-3.5">
                <div className="w-[46px] h-[46px] rounded-[9px] bg-gradient-to-br from-[#6C35E8] to-[#8B5CF6] flex items-center justify-center shrink-0 shadow-md">
                  <MessageSquare className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-[16px] font-semibold text-[#8B5CF6] leading-tight font-heading">
                    AI Assistant
                  </h3>
                  <p className="text-[15px] font-normal text-[#D1D2DE] leading-tight mt-0.5">
                    What about this video is?
                  </p>
                </div>
              </div>

              {/* Horizontal Divider */}
              <div className="border-t border-white/10 my-5" />

              {/* Response Section */}
              <div className="space-y-3">
                <p className="text-[13px] font-bold text-[#22D3EE] uppercase tracking-[0.4px]">
                  AI ASSISTANT
                </p>

                {renderFormattedSummary(video.summary)}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'transcript' && (
          <TranscriptViewer transcript={video.transcript} videoId={id} />
        )}

        {activeTab === 'summary' && (
          <div className="bg-[rgba(12,15,35,0.75)] border border-white/12 rounded-[13px] p-7 space-y-4">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-[18px] font-bold text-white font-heading">AI-Generated Summary</h2>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleCopy(video.summary, 'Summary')}
                  className="btn-secondary text-xs flex items-center gap-1.5 py-1.5 px-3"
                >
                  {copied === 'Summary' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  Copy
                </button>
                <button
                  onClick={() => handleDownload('summary')}
                  className="btn-secondary text-xs flex items-center gap-1.5 py-1.5 px-3"
                >
                  <Download className="w-3.5 h-3.5" /> Download
                </button>
              </div>
            </div>

            {renderFormattedSummary(video.summary)}
          </div>
        )}

        {activeTab === 'actions' && (
          <div className="bg-[rgba(12,15,35,0.75)] border border-white/12 rounded-[13px] p-7 space-y-4">
            <h2 className="text-[18px] font-bold text-white font-heading flex items-center gap-2">
              <CheckSquare className="w-4 h-4 text-[#8B5CF6]" /> Action Items
            </h2>
            <div className="text-[15px] leading-relaxed text-[#D8D9E4] font-normal prose prose-invert max-w-none">
              <ReactMarkdown>{video.actionItems}</ReactMarkdown>
            </div>
          </div>
        )}

        {activeTab === 'decisions' && (
          <div className="bg-[rgba(12,15,35,0.75)] border border-white/12 rounded-[13px] p-7 space-y-4">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-[18px] font-bold text-white font-heading flex items-center gap-2">
                <KeyRound className="w-4 h-4 text-[#22D3EE]" /> Key Decisions
              </h2>
              <button
                onClick={() => handleCopy(video.keyDecisions, 'Decisions')}
                className="btn-secondary text-xs flex items-center gap-1.5 py-1.5 px-3"
              >
                {copied === 'Decisions' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                Copy
              </button>
            </div>
            <div className="text-[15px] leading-relaxed text-[#D8D9E4] font-normal prose prose-invert max-w-none">
              <ReactMarkdown>{video.keyDecisions}</ReactMarkdown>
            </div>
          </div>
        )}

        {activeTab === 'questions' && (
          <div className="bg-[rgba(12,15,35,0.75)] border border-white/12 rounded-[13px] p-7 space-y-4">
            <h2 className="text-[18px] font-bold text-white font-heading flex items-center gap-2">
              <HelpCircle className="w-4 h-4 text-amber-400" /> Open Questions
            </h2>
            <div className="text-[15px] leading-relaxed text-[#D8D9E4] font-normal prose prose-invert max-w-none">
              <ReactMarkdown>{video.openQuestions}</ReactMarkdown>
            </div>
          </div>
        )}

        {activeTab === 'chat' && (
          <ChatInterface videoId={id} />
        )}
      </div>
    </div>
  );
}
