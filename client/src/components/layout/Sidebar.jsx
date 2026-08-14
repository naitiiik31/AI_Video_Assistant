import { NavLink, useNavigate } from 'react-router-dom';
import { useSafeUser, useSafeClerk } from '../../hooks/useClerkSafe';
import {
  LayoutDashboard,
  PlayCircle,
  BarChart2,
  Settings,
  HelpCircle,
  LogOut,
  Sparkles,
  X,
} from 'lucide-react';

export default function Sidebar({ isOpen, onClose }) {
  const { user } = useSafeUser();
  const { signOut } = useSafeClerk();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const navItems = [
    { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/my-videos', icon: PlayCircle, label: 'My Videos' },
    { to: '/analyze', icon: BarChart2, label: 'Analyze Video' },
  ];

  return (
    <>
      {/* Mobile Drawer Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-40 md:hidden"
          onClick={onClose}
        />
      )}

      {/* 322px Permanently Fixed Desktop Sidebar / Mobile Offcanvas Drawer */}
      <aside
        className={`
          w-[322px] min-w-[322px] bg-[#0D1028] border-r border-white/10
          flex flex-col shrink-0 h-screen h-[100dvh]
          transition-all duration-300 ease-in-out
          
          /* Desktop: Permanently Fixed to Left Viewport */
          hidden md:flex md:fixed md:top-0 md:left-0 md:z-40

          /* Mobile: Drawer Overlay when open */
          ${isOpen ? '!flex !fixed !top-0 !left-0 !h-full !z-50' : ''}
        `}
      >
        {/* Sidebar Top Branding */}
        <div className="flex items-center justify-between px-6 py-5 h-[76px] shrink-0 border-b border-white/5">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#6C35E8] to-[#8B5CF6] p-0.5 shadow-md shadow-purple-500/20 shrink-0 flex items-center justify-center">
              <div className="w-full h-full rounded-[9px] bg-[#0D1028] flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-[#8B5CF6] fill-[#8B5CF6]" />
              </div>
            </div>
            <span className="text-[19px] font-semibold text-[#F5F5FA] leading-[1.2] font-heading">
              AI Video Assistant
            </span>
          </div>

          <button
            onClick={onClose}
            className="md:hidden p-1.5 rounded-xl hover:bg-white/5 text-[#8C8FA5]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 py-5 space-y-1.5 overflow-y-auto">
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              onClick={onClose}
              className={({ isActive }) =>
                isActive
                  ? 'flex items-center gap-3.5 h-[52px] ml-[11px] mr-[16px] px-4 rounded-[10px] bg-gradient-to-r from-[#6C35E8] to-[#8B5CF6] border border-purple-500/30 text-white font-medium text-[16px] leading-[1.4] shadow-sm transition-all'
                  : 'flex items-center gap-3.5 h-[48px] mx-6 px-4 rounded-[10px] text-[#D4D5E1] hover:bg-purple-900/15 hover:text-white font-medium text-[16px] leading-[1.4] transition-all'
              }
            >
              <Icon className="w-[21px] h-[21px] shrink-0" />
              <span>{label}</span>
            </NavLink>
          ))}

          <div className="pt-3 space-y-1.5">
            <NavLink
              to="/settings"
              onClick={onClose}
              className="flex items-center gap-3.5 h-[48px] mx-6 px-4 rounded-[10px] text-[#D4D5E1] hover:bg-purple-900/15 hover:text-white font-medium text-[16px] leading-[1.4] transition-all"
            >
              <Settings className="w-[21px] h-[21px] shrink-0 text-[#C9CAD7]" />
              <span>Settings</span>
            </NavLink>

            <a
              href="#"
              className="flex items-center gap-3.5 h-[48px] mx-6 px-4 rounded-[10px] text-[#D4D5E1] hover:bg-purple-900/15 hover:text-white font-medium text-[16px] leading-[1.4] transition-all"
            >
              <HelpCircle className="w-[21px] h-[21px] shrink-0 text-[#C9CAD7]" />
              <span>Help & Docs</span>
            </a>
          </div>
        </nav>

        {/* Bottom User Section (Permanently at bottom) */}
        <div className="shrink-0 space-y-3.5 mt-auto">
          <div className="mx-6 border-t border-white/10" />

          {/* User Profile */}
          <div className="px-6 flex items-center gap-3.5">
            {user?.imageUrl ? (
              <img
                src={user.imageUrl}
                alt=""
                className="w-[52px] h-[52px] rounded-full shrink-0 ring-2 ring-purple-500/30 object-cover"
              />
            ) : (
              <div className="w-[52px] h-[52px] rounded-full bg-gradient-to-tr from-[#6C35E8] to-[#8B5CF6] flex items-center justify-center text-white font-bold text-[20px] shrink-0 shadow-md">
                {user?.firstName?.[0] || 'D'}
              </div>
            )}
            <div className="min-w-0 flex-1">
              <p className="text-[15px] font-semibold truncate text-white">
                {user?.fullName || 'Demo User'}
              </p>
              <p className="text-[13px] font-normal truncate text-[#85879B]">
                {user?.primaryEmailAddress?.emailAddress || 'demo@example.com'}
              </p>
            </div>
          </div>

          {/* Sign Out Button */}
          <button
            onClick={handleSignOut}
            className="mx-[23px] mb-5 h-[54px] w-[calc(100%-46px)] flex items-center justify-center gap-2.5 rounded-[12px] border border-[#8B5CF6]/55 bg-transparent hover:bg-red-500/10 hover:border-red-500/45 text-[#FF4D5A] text-[15px] font-medium transition-all"
          >
            <LogOut className="w-[19px] h-[19px] shrink-0 text-[#FF4D5A]" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  );
}
