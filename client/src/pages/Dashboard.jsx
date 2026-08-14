import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSafeUser } from '../hooks/useClerkSafe';
import {
  Video,
  CheckCircle,
  Clock,
  HelpCircle,
  Plus,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import { getStats } from '../services/api';
import StatCard from '../components/ui/StatCard';
import VideoCard from '../components/video/VideoCard';
import SkeletonLoader from '../components/ui/SkeletonLoader';

export default function Dashboard() {
  const { user } = useSafeUser();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const res = await getStats();
      setStats(res.data.data);
    } catch {
      setStats({
        totalVideos: 0,
        completedVideos: 0,
        processingVideos: 0,
        totalQuestions: 0,
        recentVideos: [],
      });
    } finally {
      setLoading(false);
    }
  };

  const firstName = user?.firstName || 'Demo';

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Welcome Banner (Section 6 - Comfortable Internal Spacing) */}
      <div className="relative overflow-hidden rounded-[16px] bg-gradient-to-r from-[#6C35E8]/20 via-purple-900/10 to-[#22D3EE]/10 border border-white/10 p-7 md:px-9 md:py-8 shadow-xl">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-[#8B5CF6] text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5" /> AI Dashboard Overview
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-white font-heading">
              Welcome back, {firstName} 👋
            </h1>
            <p className="text-[#A7A8BA] text-sm md:text-base leading-relaxed">
              Upload or link any video to extract transcriptions, smart summaries, key action items, and query with AI.
            </p>
          </div>

          <button
            onClick={() => navigate('/analyze')}
            className="btn-primary flex items-center gap-2 shrink-0 self-start md:self-auto shadow-lg"
          >
            <Plus className="w-4 h-4" />
            <span>Analyze New Video</span>
          </button>
        </div>

        {/* Subtle Background Radial Glow */}
        <div className="absolute -right-10 -bottom-10 w-72 h-72 bg-purple-600/15 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* Stats Cards Grid (Section 7 - 20px Gap Between Cards) */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {[1, 2, 3, 4].map((i) => (
            <SkeletonLoader key={i} lines={2} />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <StatCard
            title="Videos Analyzed"
            value={stats?.totalVideos || 0}
            icon={Video}
            color="purple"
          />
          <StatCard
            title="Completed Jobs"
            value={stats?.completedVideos || 0}
            icon={CheckCircle}
            color="green"
          />
          <StatCard
            title="In Progress"
            value={stats?.processingVideos || 0}
            icon={Clock}
            color="cyan"
          />
          <StatCard
            title="Questions Asked"
            value={stats?.totalQuestions || 0}
            icon={HelpCircle}
            color="amber"
          />
        </div>
      )}

      {/* Recent Intelligence Reports (Section 8 & 9 - 20px Gap) */}
      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-white font-heading">
            Recent Intelligence Reports
          </h2>
          <button
            onClick={() => navigate('/my-videos')}
            className="flex items-center gap-1.5 text-sm font-semibold text-[#8B5CF6] hover:text-[#9B6CFF] transition-colors"
          >
            <span>View All Videos</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {[1, 2, 3].map((i) => (
              <SkeletonLoader key={i} lines={4} />
            ))}
          </div>
        ) : stats?.recentVideos?.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {stats.recentVideos.map((video) => (
              <VideoCard key={video._id} video={video} />
            ))}
          </div>
        ) : (
          <div className="bg-[rgba(12,15,35,0.75)] border border-white/10 rounded-[14px] p-8 text-center space-y-4">
            <Video className="w-12 h-12 text-[#8C8FA5] mx-auto opacity-50" />
            <div>
              <p className="text-white font-semibold text-base">No videos analyzed yet</p>
              <p className="text-[#8C8FA5] text-sm mt-1">
                Start by analyzing a YouTube video or uploading an audio/video file.
              </p>
            </div>
            <button
              onClick={() => navigate('/analyze')}
              className="btn-primary text-sm inline-flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              <span>Analyze Your First Video</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
