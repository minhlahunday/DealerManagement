import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Car, 
  Users, 
  BarChart3, 
  Package, 
  Building2,
  Calendar,
  FileText,
  CreditCard,
  UserCog,
  Calculator,
  Gift,
  Truck,
  DollarSign,
  TrendingUp,
  ShoppingBag
} from 'lucide-react';
import { Layout, Menu, Button, Typography, Space } from 'antd';
import { CloseOutlined, MenuOutlined } from '@ant-design/icons';
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
    // { 
    //   key: 'sales', 
    //   label: 'Quản lý bán hàng', 
    //   icon: <ShoppingCart className="h-4 w-4" />, 
    //   route: '/sections/sales' 
    // },
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
      route: '/dealer/test-drive-schedule' 
    },
    { 
      key: 'quotations', 
      label: 'Quản lý báo giá', 
      icon: <Calculator className="h-4 w-4" />, 
      route: '/dealer/quotation-management' 
    },
    { 
      key: 'orders', 
      label: 'Quản lý đơn hàng', 
      icon: <Package className="h-4 w-4" />, 
      route: '/dealer/order-management' 
    },
    
    { 
      key: 'contracts', 
      label: 'Quản lý hợp đồng', 
      icon: <FileText className="h-4 w-4" />, 
      route: '/dealer/contract-management' 
    },
    { 
      key: 'payments', 
      label: 'Thanh toán', 
      icon: <CreditCard className="h-4 w-4" />, 
      route: '/sections/payments' 
    },
    { 
      key: 'dealer-orders', 
      label: 'Đơn hàng đại lý', 
      icon: <ShoppingBag className="h-4 w-4" />, 
      route: '/sections/dealer-orders' 
    },
    { 
      key: 'deliveries', 
      label: 'Quản lý vận chuyển', 
      icon: <Truck className="h-4 w-4" />, 
      route: '/sections/deliveries' 
    },
    { 
      key: 'promotions', 
      label: 'Quản lý khuyến mãi', 
      icon: <Gift className="h-4 w-4" />, 
      route: '/dealer/promotion-management' 
    },
    { 
      key: 'debt-reports', 
      label: 'Quản lý công nợ', 
      icon: <DollarSign className="h-4 w-4" />, 
      route: '/sections/debt-reports' 
    },
    { 
      key: 'dealer-revenue', 
      label: 'Báo cáo doanh thu', 
      icon: <TrendingUp className="h-4 w-4" />, 
      route: '/sections/dealer-revenue' 
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
    // { 
    //   key: 'analytics', 
    //   label: 'Báo cáo tổng quan', 
    //   icon: <BarChart3 className="h-4 w-4" />, 
    //   route: '/admin/analytics' 
    // },
    // { 
    //   key: 'settings', 
    //   label: 'Cài đặt hệ thống', 
    //   icon: <Settings className="h-4 w-4" />, 
    //   route: '/admin/settings' 
    // },
  ];

  // Menu EVM Staff (chỉ hiển thị các trang dành cho EVM Staff)
  const evmStaffMenuItems = [
    { 
      key: 'vehicles', 
      label: 'Danh mục xe', 
      icon: <Car className="h-4 w-4" />, 
      route: '/portal/car-product' 
    },
    { 
      key: 'product-management', 
      label: 'Quản lý xe', 
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
      key: 'dealer-orders', 
      label: 'Đơn hàng đại lý', 
      icon: <ShoppingBag className="h-4 w-4" />, 
      route: '/sections/dealer-orders' 
    },
    { 
      key: 'reports', 
      label: 'Báo cáo & Phân tích', 
      icon: <BarChart3 className="h-4 w-4" />, 
      route: '/sections/reports' 
    },
    // { 
    //   key: 'forecasting', 
    //   label: 'Dự báo nhu cầu', 
    //   icon: <BarChart3 className="h-4 w-4" />, 
    //   route: '/sections/forecasting' 
    // },
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
    // Update active section immediately to avoid visual delay
    onSectionChange(key);
    
    const menuItem = menuItems.find(item => item.key === key);
    if (menuItem?.route) {
      // Use replace instead of push to avoid back button issues and smoother navigation
      navigate(menuItem.route, { replace: false });
    }
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-30 lg:hidden"
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
        breakpoint="lg"
        className="transition-all duration-300 ease-in-out shadow-2xl"
        style={{
          background: 'linear-gradient(180deg, #1f2937 0%, #111827 100%)',
          height: 'calc(100vh - 64px)',
          top: '64px',
          position: 'fixed',
          left: 0,
          zIndex: 40,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          visibility: 'visible',
        }}
      >
        {/* Header - Fixed at top */}
        <div className="flex-shrink-0 h-12 px-3 border-b border-gray-700 flex items-center justify-between bg-gray-800/50">
          <Space align="center" size="small">
            <Car className="h-6 w-6 text-green-500 flex-shrink-0" />
            {isOpen && (
              <div>
                <Text strong className="text-white text-sm block leading-tight">
                  VinFast EVM
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

        {/* Scrollable Content Area */}
        <div 
          className="flex-1 overflow-y-auto overflow-x-hidden custom-scrollbar" 
          style={{ 
            scrollbarWidth: 'thin',
            scrollbarColor: '#6B7280 #1f2937',
            minHeight: 0,
            overflowY: 'auto'
          }}
        >
          {/* Menu Title */}
          {isOpen && (
            <div className="px-3 pt-2 pb-1 flex-shrink-0">
              <Text className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                {user?.role === 'admin' 
                  ? 'ADMIN MENU'
                  : user?.role === 'evm_staff'
                  ? 'EVM STAFF MENU'
                  : user?.role === 'dealer'
                  ? 'DEALER MENU'
                  : 'MENU'
                }
              </Text>
            </div>
          )}

          {/* Navigation Menu - Scrollable */}
          <Menu
            theme="dark"
            mode="inline"
            selectedKeys={[activeSection]}
            items={menuItems}
            onClick={handleMenuItemClick}
            className="border-r-0 bg-transparent"
            style={{
              background: 'transparent',
              border: 'none',
              height: 'auto',
              paddingBottom: '24px'
            }}
          />
        </div>
      </Sider>
    </>
  );
};