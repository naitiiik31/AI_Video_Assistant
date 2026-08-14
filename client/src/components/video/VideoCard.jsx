import { useNavigate } from 'react-router-dom';
import { Video, Clock, Trash2, MessageSquare, ExternalLink } from 'lucide-react';
import { deleteVideo } from '../../services/api';
import toast from 'react-hot-toast';

const statusColors = {
  pending: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
  processing: 'bg-blue-500/15 text-blue-400 border-blue-500/30',
  completed: 'bg-emerald-500/15 text-[#20D6A0] border-emerald-500/30',
  failed: 'bg-red-500/15 text-[#FF4D5A] border-red-500/30',
};

export default function VideoCard({ video, onDelete }) {
  const navigate = useNavigate();

  const handleDelete = async (e) => {
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to delete this video?')) return;

    try {
      await deleteVideo(video._id);
      toast.success('Video deleted');
      onDelete?.(video._id);
    } catch {
      toast.error('Failed to delete video');
    }
  };

  const handleClick = () => {
    if (video.status === 'completed') {
      navigate(`/videos/${video._id}`);
    } else if (video.status === 'processing') {
      navigate(`/analyze?videoId=${video._id}`);
    }
  };

  return (
    <div
      onClick={handleClick}
      className="bg-[rgba(12,15,35,0.75)] border border-white/12 rounded-[14px] p-6 cursor-pointer group hover:border-[#8B5CF6]/45 transition-all shadow-md flex flex-col justify-between"
    >
      <div>
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <div className="p-2.5 rounded-[10px] bg-[#6C35E8]/15 text-[#8B5CF6] border border-[#6C35E8]/20 shrink-0">
              <Video className="w-5 h-5" />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="font-semibold text-[15px] truncate text-[#F5F5FA] group-hover:text-[#9B6CFF] transition-colors">
                {video.title || 'Untitled Video'}
              </h3>
              <p className="text-[13px] text-[#8C8FA5] flex items-center gap-1 mt-0.5">
                {video.sourceType === 'youtube' ? (
                  <>
                    <ExternalLink className="w-3.5 h-3.5" /> YouTube
                  </>
                ) : (
                  video.originalFileName || 'Uploaded file'
                )}
              </p>
            </div>
          </div>

          <span
            className={`px-2.5 py-0.5 rounded-full text-[12px] font-semibold border capitalize shrink-0 ${statusColors[video.status] || statusColors.pending}`}
          >
            {video.status}
          </span>
        </div>
      </div>

      <div className="flex items-center justify-between pt-3 border-t border-white/5 mt-2">
        <div className="flex items-center gap-1.5 text-[13px] text-[#8C8FA5]">
          <Clock className="w-3.5 h-3.5 text-[#777A91]" />
          {new Date(video.createdAt).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
          })}
        </div>

        <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
          {video.status === 'completed' && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/videos/${video._id}?tab=chat`);
              }}
              className="p-1.5 rounded-lg hover:bg-purple-500/15 text-[#8C8FA5] hover:text-[#9B6CFF] transition-colors"
              title="Ask AI"
            >
              <MessageSquare className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={handleDelete}
            className="p-1.5 rounded-lg hover:bg-red-500/15 text-[#8C8FA5] hover:text-[#FF4D5A] transition-colors"
            title="Delete"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
