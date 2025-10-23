import React, { useState, useRef } from 'react';
import { ChevronDown, LogOut } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

interface HeaderProps {
  onMenuClick: () => void;
  isTransparent?: boolean;
}

export const Header: React.FC<HeaderProps> = ({ isTransparent = false }) => {
  const { user, logout } = useAuth();
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const tooltipTimeout = useRef<NodeJS.Timeout>();
  const navigate = useNavigate(); // Fix: Use useNavigate hook directly

  const handleLogout = () => {
    logout();
    setIsUserMenuOpen(false);
  };

  const handleMouseEnter = () => {
    setShowTooltip(true);
    if (tooltipTimeout.current) {
      clearTimeout(tooltipTimeout.current);
    }
  };

  const handleMouseLeave = () => {
    tooltipTimeout.current = setTimeout(() => {
      setShowTooltip(false);
    }, 200); // Giảm thời gian delay xuống 200ms
  };

  return (
    <header className={`
      fixed top-0 z-50 w-full
      transition-all duration-300 ease-in-out
      ${isTransparent 
        ? 'bg-white/98 backdrop-blur-lg border-b border-gray-200/50 shadow-lg shadow-gray-200/50' 
        : 'bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 border-b border-blue-700/30 shadow-lg'
      }
    `}>
      <div className="h-16 px-6 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          {/* Nút menu đã được xóa */}
          
          {/* Chỉnh sửa phần Dashboard title và tooltip */}
          <div className="hidden md:block relative group">
            <h1 
              className="text-xl font-semibold cursor-pointer text-white hover:text-blue-300 transition-colors"
              onClick={() => navigate('/portal/dashboard')}
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
            >
              VinFast Dashboard
            </h1>
            
            {/* Tooltip được cải thiện */}
            <div 
              className={`
                absolute left-1/2 -translate-x-1/2 transform
                px-3 py-1.5 rounded bg-gradient-to-r from-blue-900 to-indigo-900 text-blue-100 text-sm
                transition-all duration-200 pointer-events-none border border-blue-700/50
                ${showTooltip 
                  ? 'opacity-100 -bottom-10 translate-y-0' 
                  : 'opacity-0 -bottom-8 translate-y-1'
                }
                whitespace-nowrap z-50
              `}
            >
              <div className="absolute -top-1 left-1/2 -translate-x-1/2 transform w-2 h-2 bg-gradient-to-r from-blue-900 to-indigo-900 rotate-45" />
              Click để về trang chủ
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          {/* User menu */}
          <div className="relative">
            <button
              onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
              className="flex items-center space-x-2 p-2 rounded-lg transition-all duration-200 text-blue-100 hover:bg-blue-700/20"
            >
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-blue-500 flex items-center justify-center text-sm font-medium text-white shadow-md">
                {user?.name?.charAt(0).toUpperCase() || 'U'}
              </div>
              <span className="hidden md:block font-medium text-blue-100">{user?.name || 'User'}</span>
              <ChevronDown className="h-4 w-4 text-blue-300" />
            </button>

            {/* Dropdown menu */}
            {isUserMenuOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-gradient-to-b from-slate-900 to-slate-800 rounded-lg shadow-2xl border border-blue-700/30 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                {/* User Info Header */}
                <div className="px-4 py-3 border-b border-blue-700/30">
                  <p className="text-sm font-semibold text-blue-100">{user?.name || 'User'}</p>
                  <p className="text-xs text-blue-300/70">{user?.email || 'user@example.com'}</p>
                </div>
                
                {/* <div className="py-1">
                  <button
                    onClick={() => setIsUserMenuOpen(false)}
                    className="flex items-center space-x-3 w-full px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    <User className="h-4 w-4 text-gray-500" />
                    <span>Hồ sơ cá nhân</span>
                  </button>
                  <button
                    onClick={() => setIsUserMenuOpen(false)}
                    className="flex items-center space-x-3 w-full px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    <Settings className="h-4 w-4 text-gray-500" />
                    <span>Cài đặt</span>
                  </button>
                </div> */}
                
                <hr className="my-1 border-blue-700/20" />
                
                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-3 w-full px-4 py-2.5 text-sm text-red-400 hover:bg-red-900/20 transition-colors"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Đăng xuất</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};