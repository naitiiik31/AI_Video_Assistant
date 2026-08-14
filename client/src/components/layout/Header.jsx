import { Menu, ArrowLeft, ChevronRight } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';

export default function Header({ onMenuClick }) {
  const location = useLocation();
  const navigate = useNavigate();

  const isVideoDetail = location.pathname.startsWith('/videos/');

  const getPageTitle = (path) => {
    if (path === '/dashboard') return 'Dashboard';
    if (path === '/my-videos') return 'My Videos';
    if (path === '/analyze') return 'Analyze Video';
    if (path.startsWith('/videos/')) return 'Video Intelligence';
    if (path === '/settings') return 'Settings';
    return 'Workspace';
  };

  const currentTitle = getPageTitle(location.pathname);

  return (
    <header className="sticky top-0 z-20 h-[76px] flex items-center justify-between px-6 md:px-10 bg-[#080B1C] border-b border-white/10 transition-all duration-300">
      <div className="flex items-center gap-2.5">
        <button
          onClick={onMenuClick}
          className="md:hidden p-2 rounded-xl hover:bg-white/5 text-[#8C8FA5]"
          id="menu-toggle"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Breadcrumb Header (Section 5 - Perfect 40px Alignment with Content) */}
        <div className="flex items-center gap-2 text-[16px]">
          <span className="text-[#8C8FA5] font-normal">Workspace</span>
          <ChevronRight className="w-4 h-4 text-[#777A91]" />
          <span className="text-[#F5F5FA] font-semibold font-heading">
            {currentTitle}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {isVideoDetail && (
          <button
            onClick={() => navigate('/my-videos')}
            className="flex items-center gap-2 h-[42px] px-4 rounded-[9px] border border-white/15 bg-white/[0.04] hover:bg-white/10 text-[#F5F5FA] text-[15px] font-medium transition-all duration-200"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Videos</span>
          </button>
        )}
      </div>
    </header>
  );
}
