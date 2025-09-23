import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Header } from './common/Header';
import { Sidebar } from './common/Sidebar';
import { VehicleCatalog } from './sections/VehicleCatalog';
import { SalesManagement } from './pages/Dealerstaff/SalesManagement';
import { CustomerManagement } from './pages/Dealerstaff/CustomerManagement';

import { Play, Pause, Volume2, VolumeX } from 'lucide-react';

export const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [activeSection, setActiveSection] = useState('vehicles');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true);
  const sidebarHoverTimeout = useRef<NodeJS.Timeout>();

  const togglePlayPause = () => {
    const video = document.getElementById('hero-video') as HTMLVideoElement;
    if (video) {
      if (isPlaying) {
        video.pause();
      } else {
        video.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const toggleMute = () => {
    const video = document.getElementById('hero-video') as HTMLVideoElement;
    if (video) {
      video.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const handleSidebarOpen = () => {
    if (sidebarHoverTimeout.current) {
      clearTimeout(sidebarHoverTimeout.current);
    }
    setIsSidebarOpen(true);
  };

  const handleSidebarClose = () => {
    sidebarHoverTimeout.current = setTimeout(() => {
      setIsSidebarOpen(false);
    }, 300);
  };

  const renderContent = () => {
    // For EVM Staff and Admin
    if (user?.role === 'evm_staff' || user?.role === 'admin') {
      switch (activeSection) {
        case 'vehicles':
        return <VehicleCatalog />;
      }
    }

    // For Dealer Staff and Manager
    switch (activeSection) {
      case 'vehicles':
        return <VehicleCatalog />;
      case 'sales':
        return <SalesManagement />;
      case 'customers':
        return <CustomerManagement />;
      case 'test-drives':
        return <CustomerManagement />;
      case 'orders':
        return <SalesManagement />;
      case 'payments':
        return <SalesManagement />;
      case 'feedback':
        return <CustomerManagement />;
      default:
        return <VehicleCatalog />;
    }
  };

  return (
    <div className="flex min-h-screen bg-white">
      <Sidebar
        activeSection={activeSection}
        onSectionChange={(section) => {
          setActiveSection(section);
          setIsSidebarOpen(false);
        }}
        isOpen={isSidebarOpen}
        onClose={handleSidebarClose}
        onOpen={handleSidebarOpen}
      />
      <div className="flex-1 relative">
        {/* Hero Video Section - Full screen */}
        {activeSection === 'vehicles' && (
          <div className="relative">
            {/* Video Hero Section */}
            <div className="relative h-screen w-full overflow-hidden bg-black">
              {/* Video Background */}
              <video
                id="hero-video"
                className="absolute top-0 left-0 w-full h-full object-cover"
                autoPlay
                muted={isMuted}
                loop
                playsInline
                onLoadStart={() => console.log('Video loading started')}
                onCanPlay={() => console.log('Video can play')}
              >
                <source src="/videos/vinfast-hero.mp4" type="video/mp4" />
                <source src="https://www.vinfast.vn/wp-content/uploads/2023/03/VF8-Hero-Video.mp4" type="video/mp4" />
              </video>
              
              {/* Fallback image */}
              <div 
                className="absolute top-0 left-0 w-full h-full bg-cover bg-center bg-no-repeat"
                style={{ 
                  backgroundImage: `url('https://vinfastauto.com/sites/default/files/2023-01/VF8%20Hero%20Desktop.jpg')`,
                  zIndex: -1
                }}
              />

              {/* Transparent Header Overlay */}
              <div className="absolute top-0 left-0 right-0 z-50">
                <div className="bg-gradient-to-b from-black/50 via-black/20 to-transparent h-32" />
                <div className="absolute top-0 left-0 right-0">
                  <Header 
                    onMenuClick={() => {}}
                    isTransparent={true}
                    isSidebarOpen={isSidebarOpen}
                  />
                </div>
              </div>

              {/* Content Overlay */}
              <div className="absolute inset-0 flex flex-col justify-end p-8 lg:p-16 z-20">
                <div className="max-w-4xl">
                  <h1 className="text-5xl lg:text-7xl font-light text-white mb-4 leading-tight">
                    VinFast VF9
                  </h1>
                  <p className="text-white/80 text-lg mb-8 max-w-2xl">
                    Video sử dụng hình ảnh của sản phẩm trong giai đoạn tiền sản xuất. Sản phẩm thực tế có thể có những điểm khác biệt so với hình ảnh.
                  </p>
                </div>
              </div>

              {/* Video Controls */}
              <div className="absolute bottom-8 right-8 flex gap-3 z-30">
                <button 
                  onClick={togglePlayPause}
                  className="w-12 h-12 bg-black/50 border border-white/30 text-white rounded-full flex items-center justify-center hover:bg-black/70 transition-colors backdrop-blur-sm"
                >
                  {isPlaying ? <Pause size={16} /> : <Play size={16} />}
                </button>
                
                <button 
                  onClick={toggleMute}
                  className="w-12 h-12 bg-black/50 border border-white/30 text-white rounded-full flex items-center justify-center hover:bg-black/70 transition-colors backdrop-blur-sm"
                >
                  {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
                </button>
              </div>

              {/* Scroll indicator */}
              <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex flex-col items-center text-white/70 z-30">
                <span className="text-sm mb-2 uppercase tracking-wider">SCROLL TO EXPLORE</span>
                <div className="w-px h-16 bg-gradient-to-b from-white/70 to-transparent animate-pulse" />
              </div>
            </div>

            {/* Vehicle Catalog Section */}
            <div className="relative z-10 bg-white">
              <VehicleCatalog />
            </div>
          </div>
        )}

        {/* Regular Header for other sections */}
        {activeSection !== 'vehicles' && (
          <Header onMenuClick={() => {}} isSidebarOpen={isSidebarOpen} />
        )}

        {/* Content for non-vehicle sections */}
        {activeSection !== 'vehicles' && (
          <main className="mt-[73px] p-6 bg-gray-100 min-h-screen">
            {renderContent()}
          </main>
        )}
      </div>
    </div>
  );
};