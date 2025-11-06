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

import { StaffManagement } from './components/pages/Dealerstaff/StaffManagement';
import { CustomerManagement } from './components/pages/Dealerstaff/CustomerManagement';
import { SalesManagement } from './components/pages/Dealerstaff/SalesManagement';
import { DealerManagement } from './components/pages/Dealerstaff/DealerManagement';
import { TestDriveSchedule } from './components/pages/Dealerstaff/TestDriveSchedule';
import { ReportManagement } from './components/pages/Dealerstaff/ReportManagement';
import { QuotationManagement } from './components/pages/Dealerstaff/QuotationManagement';
import { PromotionManagement } from './components/pages/Dealerstaff/PromotionManagement';
import { PaymentManagement } from './components/pages/Dealerstaff/PaymentManagement';
import { ContractManagement } from './components/pages/Dealerstaff/ContractManagement';
import { OrderManagement } from './components/pages/Dealerstaff/OrderManagement';
import { DeliveryManagement } from './components/pages/Dealerstaff/DeliveryManagement';
import { DebtReportManagement } from './components/pages/Dealerstaff/DebtReportManagement';
import { DealerRevenueManagement } from './components/pages/Dealerstaff/DealerRevenueManagement';
import { DealerOrderManagement } from './components/pages/Dealerstaff/DealerOrderManagement';
import { VehicleManagement } from './components/pages/staff_evm/VehicleManagement';
import { InventoryManagement } from './components/pages/staff_evm/InventoryManagement';
import { SalesReportManagement } from './components/pages/staff_evm/SalesReportManagement';
import { PricingManagement } from './components/pages/staff_evm/PricingManagement';
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
      <Route path="/portal/token-test" element={<TokenTest />} />
      <Route path="/portal/product-management" element={<VehicleManagement />} />
      <Route path="/portal/inventory" element={<InventoryManagement />} />
      <Route path="/portal/sales-report" element={<SalesReportManagement />} />
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
      <Route path="/dealer/quotation-management" element={<QuotationManagement />} />
      <Route path="/dealer/promotion-management" element={<PromotionManagement />} />
      <Route path="/sections/payments" element={<PaymentManagement />} />
      <Route path="/sections/deliveries" element={<DeliveryManagement />} />
      <Route path="/sections/debt-reports" element={<DebtReportManagement />} />
      <Route path="/sections/dealer-revenue" element={<DealerRevenueManagement />} />
      <Route path="/sections/dealer-orders" element={<DealerOrderManagement />} />
      <Route path="/dealer/contract-management" element={<ContractManagement />} />
      <Route path="/dealer/order-management" element={<OrderManagement />} />
      
      {/* Section routes */}
      <Route path="/sections/sales" element={<SalesManagement />} />
      <Route path="/sections/customers" element={<CustomerManagement />} />
      <Route path="/sections/orders" element={<Dashboard />} />
      <Route path="/sections/payments" element={<Dashboard />} />
      <Route path="/sections/reports" element={<ReportManagement />} />
      <Route path="/sections/pricing" element={<PricingManagement />} />
      
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