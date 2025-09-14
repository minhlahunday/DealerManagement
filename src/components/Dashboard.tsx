import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Header } from './common/Header';
import { Sidebar } from './common/Sidebar';
import { VehicleCatalog } from './sections/VehicleCatalog';
import { SalesManagement } from './sections/SalesManagement';
import { CustomerManagement } from './sections/CustomerManagement';
import { Reports } from './sections/Reports';
import { ProductManagement } from './sections/ProductManagement';
import { DealerManagement } from './sections/DealerManagement';

export const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [activeSection, setActiveSection] = useState('vehicles');

  const renderContent = () => {
    // For EVM Staff and Admin
    if (user?.role === 'evm_staff' || user?.role === 'admin') {
      switch (activeSection) {
        case 'product-management':
          return <ProductManagement />;
        case 'inventory':
          return <VehicleCatalog />;
        case 'dealer-management':
          return <DealerManagement />;
        case 'pricing':
          return <ProductManagement />;
        case 'analytics':
          return <Reports />;
        case 'forecasting':
          return <Reports />;
        default:
          return <ProductManagement />;
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
      case 'reports':
        return <Reports />;
      default:
        return <VehicleCatalog />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="flex">
        <Sidebar activeSection={activeSection} onSectionChange={setActiveSection} />
        <main className="flex-1">
          {renderContent()}
        </main>
      </div>
    </div>
  );
};