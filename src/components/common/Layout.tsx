import React, { ReactNode, useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Header } from './Header';
import { Sidebar } from './Sidebar';
import { Footer } from './Footer';

interface LayoutProps {
  children: ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [activeSection, setActiveSection] = useState('customers');
  const location = useLocation();

  // Update active section based on current route
  useEffect(() => {
    const path = location.pathname;
    if (path.includes('/sections/sales')) {
      setActiveSection('sales');
    } else if (path.includes('/sections/customers')) {
      setActiveSection('customers');
    } else if (path.includes('/admin')) {
      setActiveSection('admin');
    } else if (path.includes('/portal')) {
      setActiveSection('vehicles');
    } else {
      setActiveSection('customers');
    }
  }, [location.pathname]);

  const handleMenuClick = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleSectionChange = (section: string) => {
    setActiveSection(section);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header - Fixed at top, full width */}
      <Header 
        onMenuClick={handleMenuClick}
        isSidebarOpen={isSidebarOpen}
      />
      
      {/* Main layout with sidebar and content */}
      <div className="flex flex-1 pt-16">
        {/* Sidebar - Fixed position, below header */}
        <Sidebar 
          activeSection={activeSection}
          onSectionChange={handleSectionChange}
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
          onOpen={() => setIsSidebarOpen(true)}
        />
        
        {/* Main content area - starts below header */}
        <main className={`flex-1 transition-all duration-300 ${
          isSidebarOpen ? 'ml-64' : 'ml-16'
        }`}>
          <div className="min-h-full">
            {children}
          </div>
        </main>
      </div>
      
      {/* Footer */}
      <Footer />
    </div>
  );
};
