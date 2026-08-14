import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Video, Plus, Loader } from 'lucide-react';
import { getVideos } from '../services/api';
import VideoCard from '../components/video/VideoCard';
import { SkeletonCard } from '../components/ui/SkeletonLoader';

export default function MyVideos() {
  const navigate = useNavigate();
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState(null);

  useEffect(() => {
    loadVideos();
  }, [page]);

  const loadVideos = async () => {
    setLoading(true);
    try {
      const res = await getVideos(page, 12);
      setVideos(res.data.data);
      setPagination(res.data.pagination);
    } catch (err) {
      console.error('Failed to load videos:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = (deletedId) => {
    setVideos((prev) => prev.filter((v) => v._id !== deletedId));
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">My Videos</h1>
          <p className="text-sm text-[var(--text-muted)]">
            {pagination ? `${pagination.total} video${pagination.total !== 1 ? 's' : ''}` : ''}
          </p>
        </div>
        <button
          onClick={() => navigate('/analyze')}
          className="btn-primary text-sm flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> Analyze Video
        </button>
      </div>

      {/* Videos Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : videos.length > 0 ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {videos.map((video) => (
              <VideoCard
                key={video._id}
                video={video}
                onDelete={handleDelete}
              />
            ))}
          </div>

          {/* Pagination */}
          {pagination && pagination.pages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-4">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="btn-secondary text-sm !py-2 !px-4 disabled:opacity-40"
              >
                Previous
              </button>
              <span className="text-sm text-[var(--text-muted)]">
                Page {page} of {pagination.pages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(pagination.pages, p + 1))}
                disabled={page === pagination.pages}
                className="btn-secondary text-sm !py-2 !px-4 disabled:opacity-40"
              >
                Next
              </button>
            </div>
          )}
        </>
      ) : (
        <div className="glass-card p-16 text-center">
          <Video className="w-16 h-16 text-[var(--text-muted)] mx-auto mb-4" />
          <h2 className="text-xl font-bold text-[var(--text-primary)] mb-2">
            No videos yet
          </h2>
          <p className="text-sm text-[var(--text-muted)] mb-6 max-w-md mx-auto">
            Start by analyzing a YouTube video or uploading a local file.
            Your analyzed videos will appear here.
          </p>
          <button
            onClick={() => navigate('/analyze')}
            className="btn-primary"
          >
            Analyze Your First Video
          </button>
        </div>
      )}
    </div>
  );
}
