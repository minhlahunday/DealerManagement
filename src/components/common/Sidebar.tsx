import React from 'react';
import { useNavigate } from 'react-router-dom';
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
  MessageSquare,
  UserCog,
  Settings
} from 'lucide-react';
import { Layout, Menu, Input, Avatar, Button, Typography, Space } from 'antd';
import { SearchOutlined, UserOutlined, MenuOutlined, CloseOutlined } from '@ant-design/icons';
import { useAuth } from '../../contexts/AuthContext';

const { Sider } = Layout;
const { Text } = Typography;

interface SidebarProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
  isOpen: boolean;
  onClose: () => void;
  onOpen: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeSection, onSectionChange, isOpen, onClose, onOpen }) => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const dealerMenuItems = [
    { 
      key: 'vehicles', 
      label: 'Danh mục xe', 
      icon: <Car className="h-4 w-4" />, 
      route: '/portal/car-product' 
    },
    { 
      key: 'sales', 
      label: 'Quản lý bán hàng', 
      icon: <ShoppingCart className="h-4 w-4" />, 
      route: '/sections/sales' 
    },
    { 
      key: 'customers', 
      label: 'Quản lý khách hàng', 
      icon: <Users className="h-4 w-4" />, 
      route: '/sections/customers' 
    },
    { 
      key: 'test-drives', 
      label: 'Lịch lái thử', 
      icon: <Calendar className="h-4 w-4" />, 
      route: '/portal/test-drive' 
    },
    { 
      key: 'orders', 
      label: 'Đơn hàng', 
      icon: <FileText className="h-4 w-4" />, 
      route: '/sections/orders' 
    },
    { 
      key: 'payments', 
      label: 'Thanh toán', 
      icon: <CreditCard className="h-4 w-4" />, 
      route: '/sections/payments' 
    },
    { 
      key: 'feedback', 
      label: 'Phản hồi', 
      icon: <MessageSquare className="h-4 w-4" />, 
      route: '/sections/feedback' 
    },
    { 
      key: 'reports', 
      label: 'Báo cáo', 
      icon: <BarChart3 className="h-4 w-4" />, 
      route: '/sections/reports' 
    },
  ];

  // Menu Admin
  const adminMenuItems = [
    { 
      key: 'dealer-management', 
      label: 'Quản lý đại lý', 
      icon: <Building2 className="h-4 w-4" />, 
      route: '/admin/dealer-management' 
    },
    { 
      key: 'staff-management', 
      label: 'Quản lý nhân viên', 
      icon: <UserCog className="h-4 w-4" />, 
      route: '/admin/staff-management' 
    },
    { 
      key: 'analytics', 
      label: 'Báo cáo tổng quan', 
      icon: <BarChart3 className="h-4 w-4" />, 
      route: '/admin/analytics' 
    },
    { 
      key: 'settings', 
      label: 'Cài đặt hệ thống', 
      icon: <Settings className="h-4 w-4" />, 
      route: '/admin/settings' 
    },
  ];

  // Menu EVM Staff
  const evmStaffMenuItems = [
    { 
      key: 'vehicles', 
      label: 'Danh mục xe', 
      icon: <Car className="h-4 w-4" />, 
      route: '/portal/car-product' 
    },
    { 
      key: 'product-management', 
      label: 'Quản lý sản phẩm', 
      icon: <Package className="h-4 w-4" />, 
      route: '/portal/product-management' 
    },
    { 
      key: 'inventory', 
      label: 'Quản lý tồn kho', 
      icon: <Car className="h-4 w-4" />, 
      route: '/portal/inventory' 
    },
    { 
      key: 'pricing', 
      label: 'Giá & Khuyến mãi', 
      icon: <CreditCard className="h-4 w-4" />, 
      route: '/sections/pricing' 
    },
    { 
      key: 'analytics', 
      label: 'Báo cáo & Phân tích', 
      icon: <BarChart3 className="h-4 w-4" />, 
      route: '/sections/analytics' 
    },
    { 
      key: 'forecasting', 
      label: 'Dự báo nhu cầu', 
      icon: <BarChart3 className="h-4 w-4" />, 
      route: '/sections/forecasting' 
    },
  ];

  const getMenuItems = () => {
    if (user?.role === 'admin') {
      return adminMenuItems;
    } else if (user?.role === 'evm_staff') {
      return evmStaffMenuItems;
    } else if (user?.role === 'dealer') {
      return dealerMenuItems;
    } else {
      // Default fallback for customer or unknown roles
      return [];
    }
  };

  const menuItems = getMenuItems();

  const handleMenuItemClick = ({ key }: { key: string }) => {
    onSectionChange(key);
    
    const menuItem = menuItems.find(item => item.key === key);
    if (menuItem?.route) {
      navigate(menuItem.route);
    }
    
    // Không tự động đóng sidebar - chỉ đóng khi click toggle hoặc overlay
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
          onClick={onClose}
        />
      )}
      
      {/* Ant Design Sider */}
      <Sider
        collapsed={!isOpen}
        collapsible
        trigger={null}
        width={280}
        collapsedWidth={64}
        theme="dark"
        className={`transition-all duration-300 ease-in-out shadow-2xl ${
          isOpen 
            ? 'translate-x-0' 
            : '-translate-x-full lg:translate-x-0'
        } fixed top-0 left-0 z-50`}
        style={{
          background: 'linear-gradient(180deg, #1f2937 0%, #111827 100%)',
          height: 'calc(100vh - 64px)',
          top: '64px',
          position: 'fixed',
        }}
      >
        {/* Header */}
        <div className="h-16 px-4 border-b border-gray-700 flex items-center justify-between bg-gray-800/50">
          <Space align="center">
            <Car className="h-8 w-8 text-green-500 flex-shrink-0" />
            {isOpen && (
              <div>
                <Text strong className="text-white text-base block leading-tight">
                  VinFast EVM
                </Text>
                <Text className="text-gray-400 text-xs block">
                  {user?.role === 'admin' 
                    ? 'Admin Panel'
                    : user?.role === 'evm_staff'
                    ? 'EVM Staff Panel'
                    : user?.role === 'dealer'
                    ? 'Dealer Panel'
                    : 'Customer Panel'
                  }
                </Text>
              </div>
            )}
          </Space>
          
          {/* Toggle Button */}
          <Button
            type="text"
            icon={isOpen ? <CloseOutlined /> : <MenuOutlined />}
            onClick={isOpen ? onClose : onOpen}
            className="text-gray-400 hover:text-white hover:bg-gray-700"
            size="small"
          />
        </div>

        {/* Search Bar */}
        {isOpen && (
          <div className="p-4">
            <Input
              placeholder="Tìm kiếm..."
              prefix={<SearchOutlined className="text-gray-400" />}
              className="bg-gray-800 border-gray-600 text-white"
              style={{
                backgroundColor: '#374151',
                borderColor: '#4B5563',
                color: 'white'
              }}
            />
          </div>
        )}

        {/* Menu Title */}
        {isOpen && (
          <div className="px-4 mb-4">
            <Text className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
              {user?.role === 'admin' 
                ? 'Admin Menu'
                : user?.role === 'evm_staff'
                ? 'EVM Staff Menu'
                : user?.role === 'dealer'
                ? 'Dealer Menu'
                : 'Customer Menu'
              }
            </Text>
          </div>
        )}

        {/* Navigation Menu */}
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[activeSection]}
          items={menuItems}
          onClick={handleMenuItemClick}
          className="border-r-0 bg-transparent"
          style={{
            background: 'transparent',
            border: 'none'
          }}
        />

        {/* User Profile (when expanded) */}
        {isOpen && (
          <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-700 bg-gray-800/30">
            <Space align="center" className="w-full">
              <Avatar 
                size="small" 
                icon={<UserOutlined />} 
                className="bg-green-500"
              />
              <div className="flex-1 min-w-0">
                <Text className="text-white text-sm block truncate">
                  {user?.email || 'Admin User'}
                </Text>
                <Text className="text-gray-400 text-xs block truncate">
                  {user?.role || 'Administrator'}
                </Text>
              </div>
            </Space>
          </div>
        )}
      </Sider>
    </>
  );
};