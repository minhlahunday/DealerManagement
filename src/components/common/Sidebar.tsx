import React from 'react';
import { 
  Car, 
  ShoppingCart, 
  Users, 
  BarChart3, 
  Package, 
  Building2,
  Calendar,
  FileText,
  CreditCard,
  MessageSquare
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

interface SidebarProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeSection, onSectionChange }) => {
  const { user } = useAuth();

  const dealerMenuItems = [
    { id: 'vehicles', label: 'Danh mục xe', icon: Car },
    { id: 'sales', label: 'Quản lý bán hàng', icon: ShoppingCart },
    { id: 'customers', label: 'Quản lý khách hàng', icon: Users },
    { id: 'test-drives', label: 'Lịch lái thử', icon: Calendar },
    { id: 'orders', label: 'Đơn hàng', icon: FileText },
    { id: 'payments', label: 'Thanh toán', icon: CreditCard },
    { id: 'feedback', label: 'Phản hồi', icon: MessageSquare },
    { id: 'reports', label: 'Báo cáo', icon: BarChart3 },
  ];

  const evmMenuItems = [
    { id: 'product-management', label: 'Quản lý sản phẩm', icon: Package },
    { id: 'inventory', label: 'Tồn kho', icon: Car },
    { id: 'dealer-management', label: 'Quản lý đại lý', icon: Building2 },
    { id: 'pricing', label: 'Giá & Khuyến mãi', icon: CreditCard },
    { id: 'analytics', label: 'Báo cáo & Phân tích', icon: BarChart3 },
    { id: 'forecasting', label: 'Dự báo nhu cầu', icon: BarChart3 },
  ];

  const menuItems = user?.role === 'evm_staff' || user?.role === 'admin' ? evmMenuItems : dealerMenuItems;

  return (
    <aside className="bg-gray-900 text-white w-64 min-h-screen p-4">
      <div className="space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => onSectionChange(item.id)}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-colors ${
                activeSection === item.id
                  ? 'bg-green-600 text-white'
                  : 'text-gray-300 hover:bg-gray-800 hover:text-white'
              }`}
            >
              <Icon className="h-5 w-5" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>
    </aside>
  );
};