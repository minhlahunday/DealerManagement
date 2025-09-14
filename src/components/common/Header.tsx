import React from 'react';
import { Car, Phone, User, LogOut } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

export const Header: React.FC = () => {
  const { user, logout } = useAuth();

  return (
    <header className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center space-x-2">
            <Car className="h-8 w-8 text-green-600" />
            <span className="text-2xl font-bold text-gray-900">ElectricVM</span>
          </div>

          {/* Navigation */}
          <nav className="hidden md:flex space-x-8">
            <a href="#" className="text-gray-700 hover:text-green-600 px-3 py-2 rounded-md text-sm font-medium flex items-center">
              <Car className="h-4 w-4 mr-2" />
              Danh mục xe
            </a>
            <a href="#" className="text-gray-700 hover:text-green-600 px-3 py-2 rounded-md text-sm font-medium">
              Đặt lái thử
            </a>
            <a href="#" className="text-gray-700 hover:text-green-600 px-3 py-2 rounded-md text-sm font-medium">
              Theo dõi đơn
            </a>
            <a href="#" className="text-gray-700 hover:text-green-600 px-3 py-2 rounded-md text-sm font-medium">
              Phản hồi
            </a>
          </nav>

          {/* Right side */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center text-sm text-gray-600">
              <Phone className="h-4 w-4 mr-2 text-green-600" />
              1900 2345
            </div>
            
            {user && (
              <div className="relative group">
                <button className="flex items-center space-x-2 text-gray-700 hover:text-green-600">
                  <User className="h-5 w-5" />
                  <span>{user.name}</span>
                </button>
                
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                  <div className="py-1">
                    <div className="px-4 py-2 text-sm text-gray-500 border-b">
                      {user.role === 'dealer_staff' && 'Nhân viên đại lý'}
                      {user.role === 'dealer_manager' && 'Quản lý đại lý'}
                      {user.role === 'evm_staff' && 'Nhân viên hãng'}
                      {user.role === 'admin' && 'Quản trị viên'}
                    </div>
                    <button
                      onClick={logout}
                      className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      <LogOut className="h-4 w-4 mr-2" />
                      Đăng xuất
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};