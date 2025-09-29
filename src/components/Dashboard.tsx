import React, { useState } from 'react';
import { VehicleCatalog } from './sections/VehicleCatalog';
import { Play, Pause, Volume2, VolumeX } from 'lucide-react';

export const Dashboard: React.FC = () => {
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true);

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

  return (
    <div className="w-full">
      {/* Video Hero Section */}
      <div className="h-screen w-full relative bg-black overflow-hidden">
        {/* Video Background */}
        <video
          id="hero-video"
          className="absolute inset-0 w-full h-full object-cover"
          autoPlay
          muted={isMuted}
          loop
          playsInline
        >
          <source src="/videos/VF9.mp4" type="video/mp4" />
          <source src="/videos/vinfast-hero.mp4" type="video/mp4" />
          <source src="/videos/VF8.mp4" type="video/mp4" />
        </video>
        
        {/* Dark overlay for text readability */}
        <div className="absolute inset-0 bg-black bg-opacity-40"></div>
        
        {/* Content */}
        <div className="relative z-10 h-full flex flex-col justify-between text-white p-8 lg:p-16">
          {/* Top Center Text */}
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <h2 className="text-4xl lg:text-6xl font-light mb-4">
                THIẾT KẾ TƯƠNG LAI
              </h2>
              <h3 className="text-2xl lg:text-4xl font-light">
                ẤN TƯỢNG
              </h3>
            </div>
          </div>
          
          {/* Bottom Text */}
          <div className="max-w-4xl">
            <h1 className="text-5xl lg:text-7xl font-light mb-4">
              VinFast VF9
            </h1>
            <p className="text-white/80 text-lg max-w-2xl">
              Video sử dụng hình ảnh của sản phẩm trong giai đoạn tiền sản xuất. Sản phẩm thực tế có thể có những điểm khác biệt so với hình ảnh.
            </p>
          </div>
          
          {/* Video Controls */}
          <div className="flex justify-end gap-3 mt-8">
            <button 
              onClick={togglePlayPause}
              className="w-12 h-12 bg-black/50 border border-white/30 text-white rounded-full flex items-center justify-center hover:bg-black/70 transition-colors"
            >
              {isPlaying ? <Pause size={16} /> : <Play size={16} />}
            </button>
            
            <button 
              onClick={toggleMute}
              className="w-12 h-12 bg-black/50 border border-white/30 text-white rounded-full flex items-center justify-center hover:bg-black/70 transition-colors"
            >
              {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
            </button>
          </div>
        </div>
      </div>

      {/* Vehicle Catalog Section - Directly attached, no gap */}
      <div className="bg-white">
        <VehicleCatalog />
      </div>
    </div>
  );
};