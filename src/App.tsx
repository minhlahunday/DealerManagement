import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import LoginPage from './components/LoginPage';
import { Dashboard } from './components/Dashboard';
import { Layout } from './components/common/Layout';
import { CarDetail } from './components/pages/car/CarDetail';
import { CarProduct } from './components/pages/car/CarProduct';
import { CompareModels } from './components/pages/car/CompareModels';
import { ModelSelector } from './components/pages/car/ModelSelector';
import { TestDrive } from './components/pages/car/TestDrive';

import { AdminDealerManagement } from './components/pages/admin/AdminDealerManagement';
import { AdminStaffManagement } from './components/pages/admin/AdminStaffManagement';

import { CarDeposit } from './components/pages/car/CarDeposit';
import { StaffManagement } from './components/pages/Dealerstaff/StaffManagement';
import { CustomerManagement } from './components/pages/Dealerstaff/CustomerManagement';
import { SalesManagement } from './components/pages/Dealerstaff/SalesManagement';
import { DealerManagement } from './components/pages/Dealerstaff/DealerManagement';
import { TestDriveSchedule } from './components/pages/Dealerstaff/TestDriveSchedule';
import { ReportManagement } from './components/pages/Dealerstaff/ReportManagement';
import { TokenTest } from './components/TokenTest';

function AppContent() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black"></div>
      </div>
    );
  }

  if (!user) {
    return <LoginPage />;
  }

  return (
    <Layout>
      <Routes>
      {/* Portal routes */}
      <Route path="/portal/dashboard" element={<Dashboard />} />
      <Route path="/portal/car-detail/:id" element={<CarDetail />} />
      <Route path="/portal/car-product" element={<CarProduct />} />
      <Route path="/portal/compare-models" element={<CompareModels />} />
      <Route path="/portal/model-selector" element={<ModelSelector />} />
      <Route path="/portal/test-drive" element={<TestDrive />} />
      <Route path="/portal/deposit" element={<CarDeposit />} />
      <Route path="/portal/token-test" element={<TokenTest />} />
      {/* <Route path="/portal/staff-management" element={<StaffManagement />} /> */}
      
      {/* Admin routes */}
      <Route path="/admin/dealer-management" element={<AdminDealerManagement />} />
      <Route path="/admin/staff-management" element={<AdminStaffManagement />} />
      
      {/* Dealer Manager routes */}
      <Route path="/dealer/management" element={<DealerManagement />} />
      <Route path="/dealer/staff-management" element={<StaffManagement />} />
      <Route path="/dealer/sales-management" element={<SalesManagement />} />
      <Route path="/dealer/customer-management" element={<CustomerManagement />} />
      <Route path="/dealer/test-drive-schedule" element={<TestDriveSchedule />} />
      <Route path="/dealer/report-management" element={<ReportManagement />} />
      
      {/* Section routes */}
      <Route path="/sections/sales" element={<SalesManagement />} />
      <Route path="/sections/customers" element={<CustomerManagement />} />
      <Route path="/sections/orders" element={<Dashboard />} />
      <Route path="/sections/payments" element={<Dashboard />} />
      <Route path="/sections/reports" element={<ReportManagement />} />
      <Route path="/sections/pricing" element={<Dashboard />} />
      <Route path="/car-deposit" element={<CarDeposit />} />
      
      {/* Root and default routes */}
      <Route path="/" element={<Dashboard />} />
      <Route path="*" element={<Dashboard />} />
      </Routes>
    </Layout>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  );
}

export default App;