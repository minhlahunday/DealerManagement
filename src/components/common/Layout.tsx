import React, { ReactNode, useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { Header } from './Header';
import { Sidebar } from './Sidebar';

interface LayoutProps {
  children: ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [activeSection, setActiveSection] = useState('customers');
  const location = useLocation();
  const lastPathRef = useRef(location.pathname);

  // Update active section based on current route
  useEffect(() => {
    const path = location.pathname;
    
    // Only update if path actually changed to prevent unnecessary updates
    if (lastPathRef.current === path) {
      return;
    }
    lastPathRef.current = path;
    
    // Handle dealer routes
    if (path.includes('/dealer/')) {
      if (path.includes('/dealer/test-drive-schedule')) {
        setActiveSection('test-drives');
      } else if (path.includes('/dealer/quotation-management')) {
        setActiveSection('quotations');
      } else if (path.includes('/dealer/promotion-management')) {
        setActiveSection('promotions');
      } else if (path.includes('/dealer/contract-management')) {
        setActiveSection('contracts');
      } else if (path.includes('/dealer/order-management')) {
        setActiveSection('orders');
      } else if (path.includes('/dealer/customer-management')) {
        setActiveSection('customers');
      } else if (path.includes('/dealer/sales-management')) {
        setActiveSection('sales');
      } else if (path.includes('/dealer/report-management')) {
        setActiveSection('reports');
      } else {
        // Default for other dealer routes
        setActiveSection('customers');
      }
    }
    // Handle admin routes
    else if (path.includes('/admin/')) {
      if (path.includes('/admin/dealer-management')) {
        setActiveSection('dealer-management');
      } else if (path.includes('/admin/staff-management')) {
        setActiveSection('staff-management');
      } else {
        setActiveSection('dealer-management');
      }
    }
    // Handle portal routes
    else if (path.includes('/portal/')) {
      setActiveSection('vehicles');
    }
    // Handle section routes (legacy)
    else if (path.includes('/sections/sales')) {
      setActiveSection('sales');
    } else if (path.includes('/sections/customers')) {
      setActiveSection('customers');
    } else if (path.includes('/sections/payments')) {
      setActiveSection('payments');
    } else if (path.includes('/sections/deliveries')) {
      setActiveSection('deliveries');
    } else if (path.includes('/sections/debt-reports')) {
      setActiveSection('debt-reports');
    } else if (path.includes('/sections/dealer-revenue')) {
      setActiveSection('dealer-revenue');
    } else if (path.includes('/sections/dealer-orders')) {
      setActiveSection('dealer-orders');
    } else if (path.includes('/sections/reports')) {
      setActiveSection('reports');
    }
    // Default fallback
    else {
      setActiveSection('customers');
    }
  }, [location.pathname]);

  const handleMenuClick = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleSectionChange = (section: string) => {
    // Update active section immediately and update the ref to prevent useEffect from overriding
    setActiveSection(section);
    lastPathRef.current = location.pathname;
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header - Fixed at top, full width */}
      <Header 
        onMenuClick={handleMenuClick}
        isSidebarOpen={isSidebarOpen}
      />
      
      {/* Main layout with sidebar and content */}
      <div className="flex flex-1">
        {/* Sidebar - Fixed position, below header */}
        <Sidebar 
          activeSection={activeSection}
          onSectionChange={handleSectionChange}
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
          onOpen={() => setIsSidebarOpen(true)}
        />
        
        {/* Main content area - starts below header */}
        <main className={`flex-1 transition-all duration-300 pt-16 ${
          isSidebarOpen ? 'ml-[280px]' : 'ml-16'
        }`}>
          <div className="min-h-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};
