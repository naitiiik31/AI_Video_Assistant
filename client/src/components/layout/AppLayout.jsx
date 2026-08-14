import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';

export default function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#080B1C] text-[#F5F5FA] relative">
      {/* 322px Permanently Fixed Left Sidebar */}
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Main Content Area Offset by 322px on Desktop with 40px Horizontal Padding */}
      <div className="md:ml-[322px] min-h-screen flex flex-col bg-[#080B1C]">
        <Header onMenuClick={() => setSidebarOpen(true)} />

        <main className="flex-1 px-6 md:px-10 py-8 max-w-[1600px] w-full mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
