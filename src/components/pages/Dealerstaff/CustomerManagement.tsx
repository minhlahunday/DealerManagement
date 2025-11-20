import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Search, Phone, Mail, MapPin, Calendar, MessageSquare, Edit, Eye, User, Users, Car } from 'lucide-react';
import { mockCustomers } from '../../../data/mockData';
import { Customer } from '../../../types';
import { useNavigate } from 'react-router-dom';
import { customerService, CreateCustomerRequest, UpdateCustomerRequest } from '../../../services/customerService';
import { testDriveService, TestDriveAppointment } from '../../../services/testDriveService';
import { useAuth } from '../../../contexts/AuthContext';

export const CustomerManagement: React.FC = () => {
  const navigate = useNavigate();
  const { checkToken, user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  // Trạng thái API
  const [customers, setCustomers] = useState<Customer[]>(mockCustomers as Customer[]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loadingCustomerDetail, setLoadingCustomerDetail] = useState(false);
  const [creatingCustomer, setCreatingCustomer] = useState(false);
  const [createForm, setCreateForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    address: '',
    companyName: '',
    notes: ''
  });
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [updatingCustomer, setUpdatingCustomer] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [updateForm, setUpdateForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    address: '',
    companyName: '',
    notes: ''
  });
  
  // Trạng thái lịch sử lái thử
  const [customerTestDrives, setCustomerTestDrives] = useState<TestDriveAppointment[]>([]);
  const [loadingTestDrives, setLoadingTestDrives] = useState(false);

  // Lấy danh sách khách hàng từ API
  const fetchCustomers = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await customerService.getCustomers();
      console.log('Phản hồi API Khách hàng:', response);

      if (response.success && response.data.length > 0) {
        // Thêm mảng testDrives và orders mặc định để khớp với interface Customer
        const customersWithDefaults = response.data.map(customer => ({
          ...customer,
          testDrives: customer.testDrives || [],
          orders: customer.orders || []
        }));
        
        setCustomers(customersWithDefaults);
        console.log('✅ Đã tải khách hàng từ API:', customersWithDefaults.length);
        console.log('📋 Mẫu khách hàng đầu tiên:', customersWithDefaults[0]);
        console.log('📋 Tất cả ID khách hàng:', customersWithDefaults.map(c => ({ id: c.id, name: c.name })));
      } else {
        console.log('Không có khách hàng từ API, sử dụng dữ liệu mẫu');
        setCustomers(mockCustomers as Customer[]);
      }
    } catch (error) {
      console.error('Lỗi khi lấy danh sách khách hàng:', error);
      setError(error instanceof Error ? error.message : 'Lỗi khi tải danh sách khách hàng');
      setCustomers(mockCustomers as Customer[]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Kiểm tra token khi component mount
  useEffect(() => {
    console.log('=== CustomerManagement Component Đã Mount ===');
    checkToken();
  }, [checkToken]);

  // Lấy danh sách khách hàng khi component mount
  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  // Tự động điền companyName từ tài khoản Dealer đang đăng nhập khi mở modal tạo mới
  useEffect(() => {
    if (showCreateModal) {
      // Reset form khi mở modal
      setCreateForm({
        fullName: '',
        email: '',
        phone: '',
        address: '',
        companyName: user?.companyName || '',
        notes: ''
      });
    }
  }, [showCreateModal, user]);

  const filteredCustomers = customers.filter(customer =>
    customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.phone.includes(searchTerm)
  );

  // Lấy lịch lái thử của khách hàng
  const fetchCustomerTestDrives = useCallback(async (customerId: string) => {
    setLoadingTestDrives(true);
    console.log('🚗 Đang lấy lịch lái thử cho khách hàng ID:', customerId);

    try {
      const response = await testDriveService.getTestDriveAppointments();
      console.log('📡 Phản hồi API Lịch lái thử:', response);

      if (response.success && response.data) {
        // Lọc lịch lái thử theo userId (ID khách hàng)
        const customerDrives = response.data.filter(
          (drive: TestDriveAppointment) => drive.userId.toString() === customerId
        );
        console.log('✅ Lịch lái thử của khách hàng:', customerDrives);
        setCustomerTestDrives(customerDrives);
      } else {
        console.log('⚠️ Không tìm thấy lịch lái thử');
        setCustomerTestDrives([]);
      }
    } catch (error) {
      console.error('❌ Lỗi khi lấy lịch lái thử:', error);
      setCustomerTestDrives([]);
    } finally {
      setLoadingTestDrives(false);
    }
  }, []);

  // Lấy chi tiết khách hàng từ API
  const fetchCustomerDetail = useCallback(async (customerId: string) => {
    setLoadingCustomerDetail(true);
    console.log('🔍 Đang lấy chi tiết khách hàng cho ID:', customerId);

    try {
      const response = await customerService.getCustomerById(customerId);
      console.log('📡 Phản hồi API Chi tiết khách hàng:', response);

      if (response.success && response.data) {
        console.log('✅ Đã tải chi tiết khách hàng từ API:', response.data);
        console.log('📋 Dữ liệu khách hàng đã map:', {
          id: response.data.id,
          name: response.data.name,
          email: response.data.email,
          phone: response.data.phone,
          address: response.data.address
        });
        // Thêm testDrives và orders mặc định
        setSelectedCustomer({
          ...response.data,
          testDrives: response.data.testDrives || [],
          orders: response.data.orders || []
        });
        // Lấy lịch lái thử cho khách hàng này
        fetchCustomerTestDrives(customerId);
      } else {
        console.log('⚠️ Không có chi tiết khách hàng từ API, sử dụng dữ liệu mẫu');
        const mockCustomer = (mockCustomers as Customer[]).find(c => c.id === customerId);
        if (mockCustomer) {
          console.log('📋 Áp dụng dữ liệu khách hàng mẫu:', mockCustomer);
          setSelectedCustomer(mockCustomer as Customer);
          fetchCustomerTestDrives(customerId);
        } else {
          console.error('❌ Không tìm thấy khách hàng với ID:', customerId);
          // Tạo object khách hàng mặc định
          const defaultCustomer: Customer = {
            id: customerId,
            name: 'Khách hàng không xác định',
            email: 'unknown@email.com',
            phone: 'N/A',
            address: 'N/A',
            testDrives: [],
            orders: [],
            debt: 0,
            lastPurchaseDate: '',
            totalSpent: 0
          };
          setSelectedCustomer(defaultCustomer);
          setCustomerTestDrives([]);
        }
      }
    } catch (error) {
      console.error('❌ Lỗi khi lấy chi tiết khách hàng:', error);
      const mockCustomer = (mockCustomers as Customer[]).find(c => c.id === customerId);
      if (mockCustomer) {
        console.log('📋 Chuyển sang dữ liệu khách hàng mẫu:', mockCustomer);
        setSelectedCustomer(mockCustomer as Customer);
        fetchCustomerTestDrives(customerId);
      } else {
        console.error('❌ Không tìm thấy khách hàng dự phòng');
      }
    } finally {
      setLoadingCustomerDetail(false);
    }
  }, [fetchCustomerTestDrives]);

  const handleViewCustomer = (customer: Customer) => {
    console.log('👁️ Đang xem khách hàng:', customer.id, customer.name);
    console.log('📋 Đối tượng khách hàng:', customer);
    fetchCustomerDetail(customer.id);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const getStatusBadge = (status: string) => {
    const statusMap: { [key: string]: { bg: string; text: string; label: string } } = {
      'PENDING': { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Chờ xác nhận' },
      'CONFIRMED': { bg: 'bg-blue-100', text: 'text-blue-800', label: 'Đã xác nhận' },
      'COMPLETED': { bg: 'bg-green-100', text: 'text-green-800', label: 'Hoàn thành' },
      'CANCELLED': { bg: 'bg-red-100', text: 'text-red-800', label: 'Đã hủy' }
    };
    const statusInfo = statusMap[status] || { bg: 'bg-gray-100', text: 'text-gray-800', label: status };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusInfo.bg} ${statusInfo.text}`}>
        {statusInfo.label}
      </span>
    );
  };

  // Hàm debug để test API trực tiếp
  const testCustomerAPI = async (customerId: string) => {
    console.log('🧪 Đang kiểm tra API Khách hàng cho ID:', customerId);
    try {
      const response = await customerService.getCustomerById(customerId);
      console.log('🧪 Phản hồi Test API:', response);
      return response;
    } catch (error) {
      console.error('🧪 Lỗi Test API:', error);
      return null;
    }
  };

  const handleScheduleClick = (customer: Customer) => {
    console.log('🚀 Chuyển hướng đến trang sản phẩm xe để đặt lịch với khách hàng:', customer.id, customer.name);
    
    // Điều hướng đến trang car-product với thông tin khách hàng
    navigate(`/portal/car-product?customerId=${customer.id}&customerName=${encodeURIComponent(customer.name)}&customerEmail=${encodeURIComponent(customer.email)}`);
  };


  // Tạo khách hàng qua API
  const handleCreateCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreatingCustomer(true);

    try {
      const customerData: CreateCustomerRequest = {
        userId: 0, // Sẽ được backend thiết lập
        username: createForm.email.split('@')[0], // Sử dụng phần trước @ của email làm username
        email: createForm.email,
        passwordHash: 'defaultPassword123', // Mật khẩu mặc định, người dùng nên đổi
        roleId: 4, // ID vai trò khách hàng (giả định 4 là vai trò khách hàng)
        fullName: createForm.fullName,
        phone: createForm.phone,
        address: createForm.address,
        companyName: createForm.companyName || ''
      };

      console.log('Đang tạo khách hàng với dữ liệu:', customerData);
      const response = await customerService.createCustomer(customerData);

      if (response.success) {
        console.log('✅ Đã tạo khách hàng thành công:', response);
        // Làm mới danh sách khách hàng
        await fetchCustomers();
        // Reset form và đóng modal
        setCreateForm({
          fullName: '',
          email: '',
          phone: '',
          address: '',
          companyName: '',
          notes: ''
        });
        setShowCreateModal(false);
        // Hiển thị thông báo thành công
        alert('✅ Khách hàng đã được tạo thành công!');
      } else {
        console.error('❌ Lỗi khi tạo khách hàng:', response.message);
        // Hiển thị thông báo lỗi chi tiết
        const errorMsg = response.message.includes('Authentication required') 
          ? '🔐 Cần đăng nhập với tài khoản hợp lệ để tạo khách hàng.\n\nVui lòng:\n1. Đăng nhập với tài khoản thật (không phải mock)\n2. Hoặc kiểm tra quyền truy cập API'
          : response.message;
        alert(`❌ Lỗi khi tạo khách hàng:\n\n${errorMsg}`);
      }
    } catch (error) {
      console.error('❌ Lỗi khi tạo khách hàng:', error);
      alert(`Lỗi khi tạo khách hàng: ${error instanceof Error ? error.message : 'Lỗi không xác định'}`);
    } finally {
      setCreatingCustomer(false);
    }
  };

  // Xử lý khi click chỉnh sửa khách hàng
  const handleEditCustomer = (customer: Customer) => {
    console.log('✏️ Đang chỉnh sửa khách hàng:', customer.id, customer.name);
    setSelectedCustomer(null); // Đóng modal chi tiết khách hàng
    setEditingCustomer(customer); // Lưu khách hàng đang được chỉnh sửa
    setUpdateForm({
      fullName: customer.name,
      email: customer.email,
      phone: customer.phone,
      address: customer.address,
      companyName: '', // Trường này có thể không có trong interface Customer
      notes: ''
    });
    setShowUpdateModal(true);
  };

  // Cập nhật khách hàng qua API
  const handleUpdateCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCustomer) return;

    setUpdatingCustomer(true);

    try {
      const customerData: UpdateCustomerRequest = {
        userId: parseInt(editingCustomer.id), // Chuyển đổi ID từ string sang number
        username: updateForm.email.split('@')[0], // Sử dụng phần trước @ của email làm username
        email: updateForm.email,
        passwordHash: 'defaultPassword123', // Giữ mật khẩu hiện tại
        roleId: 4, // ID vai trò khách hàng
        fullName: updateForm.fullName,
        phone: updateForm.phone,
        address: updateForm.address,
        companyName: updateForm.companyName || ''
      };

      console.log('🔄 Đang cập nhật khách hàng với dữ liệu:', customerData);
      const response = await customerService.updateCustomer(editingCustomer.id, customerData);

      if (response.success) {
        console.log('✅ Đã cập nhật khách hàng thành công:', response);
        // Làm mới danh sách khách hàng
        await fetchCustomers();
        // Đóng modal
        setShowUpdateModal(false);
        setEditingCustomer(null);
        // Hiển thị thông báo thành công
        alert('✅ Khách hàng đã được cập nhật thành công!');
      } else {
        console.error('❌ Lỗi khi cập nhật khách hàng:', response.message);
        // Hiển thị thông báo lỗi chi tiết
        const errorMsg = response.message.includes('Authentication required') 
          ? '🔐 Cần đăng nhập với tài khoản hợp lệ để cập nhật khách hàng.\n\nVui lòng:\n1. Đăng nhập với tài khoản thật (không phải mock)\n2. Hoặc kiểm tra quyền truy cập API'
          : response.message;
        alert(`❌ Lỗi khi cập nhật khách hàng:\n\n${errorMsg}`);
      }
    } catch (error) {
      console.error('❌ Lỗi khi cập nhật khách hàng:', error);
      alert(`Lỗi khi cập nhật khách hàng: ${error instanceof Error ? error.message : 'Lỗi không xác định'}`);
    } finally {
      setUpdatingCustomer(false);
    }
  };


  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-8 mb-6 border border-blue-200">
        <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center space-y-4 lg:space-y-0">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
              <Users className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-gray-900">Quản lý khách hàng</h1>
              <p className="text-gray-600 mt-1">Quản lý thông tin và tương tác với khách hàng</p>
            </div>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-6 py-3 rounded-lg font-medium flex items-center space-x-2 shadow-lg transition-all duration-200 transform hover:scale-105"
          >
            <Plus className="h-5 w-5" />
            <span>Thêm khách hàng</span>
          </button>
        </div>
      </div>

      {/* Search and Stats Section */}
      <div className="bg-white rounded-2xl p-6 mb-8 shadow-sm border border-gray-200">
        <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center space-y-4 lg:space-y-0">
          <div className="relative max-w-md">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Tìm kiếm khách hàng..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-gray-50 focus:bg-white text-sm"
            />
          </div>
          <div className="flex items-center space-x-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{customers.length}</div>
              <div className="text-sm text-gray-600">Tổng khách hàng</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{customers.filter(c => c.totalSpent && c.totalSpent > 0).length}</div>
              <div className="text-sm text-gray-600">Khách hàng VIP</div>
            </div>
          </div>
        </div>
      </div>

      {/* Create Customer Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl transform transition-all">
            {/* Header */}
            <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white p-6 rounded-t-2xl">
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
                    <Plus className="h-6 w-6" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">Thêm khách hàng mới</h2>
                    <p className="text-green-100 text-sm">Tạo hồ sơ khách hàng mới</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="text-white hover:text-green-200 transition-colors p-2 hover:bg-white hover:bg-opacity-10 rounded-lg"
                  disabled={creatingCustomer}
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-6">
              {/* Authentication Notice */}
              {/* <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4 mb-6">
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                      <svg className="h-5 w-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-sm font-semibold text-blue-800 mb-1">Lưu ý về xác thực</h3>
                    <p className="text-sm text-blue-700">Để tạo khách hàng mới, bạn cần đăng nhập với tài khoản hợp lệ có quyền truy cập.</p>
                  </div>
                </div>
              </div> */}

              <form id="create-customer-form" onSubmit={handleCreateCustomer} className="space-y-4">
                {/* Row 1: Full Name & Email */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700">
                      <User className="h-4 w-4 text-green-600" />
                      <span>Họ và tên *</span>
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        required
                        value={createForm.fullName}
                        onChange={(e) => setCreateForm({...createForm, fullName: e.target.value})}
                        className="w-full border-2 border-gray-200 rounded-lg px-3 py-2 focus:border-green-500 focus:ring-2 focus:ring-green-100 transition-all duration-200 bg-gray-50 focus:bg-white text-sm"
                        placeholder="Nhập họ và tên"
                      />
                      <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                        <User className="h-5 w-5 text-gray-400" />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700">
                      <Mail className="h-4 w-4 text-green-600" />
                      <span>Email *</span>
                    </label>
                    <div className="relative">
                      <input
                        type="email"
                        required
                        value={createForm.email}
                        onChange={(e) => setCreateForm({...createForm, email: e.target.value})}
                        className="w-full border-2 border-gray-200 rounded-lg px-3 py-2 focus:border-green-500 focus:ring-2 focus:ring-green-100 transition-all duration-200 bg-gray-50 focus:bg-white text-sm"
                        placeholder="Nhập email"
                      />
                      <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                        <Mail className="h-5 w-5 text-gray-400" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Row 2: Phone & Company */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700">
                      <Phone className="h-4 w-4 text-green-600" />
                      <span>Số điện thoại *</span>
                    </label>
                    <div className="relative">
                      <input
                        type="tel"
                        required
                        value={createForm.phone}
                        onChange={(e) => setCreateForm({...createForm, phone: e.target.value})}
                        className="w-full border-2 border-gray-200 rounded-lg px-3 py-2 focus:border-green-500 focus:ring-2 focus:ring-green-100 transition-all duration-200 bg-gray-50 focus:bg-white text-sm"
                        placeholder="Nhập số điện thoại"
                      />
                      <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                        <Phone className="h-5 w-5 text-gray-400" />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700">
                      <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                      <span>Tên công ty</span>
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={createForm.companyName}
                        onChange={(e) => setCreateForm({...createForm, companyName: e.target.value})}
                        className="w-full border-2 border-gray-200 rounded-lg px-3 py-2 focus:border-green-500 focus:ring-2 focus:ring-green-100 transition-all duration-200 bg-gray-50 focus:bg-white text-sm"
                        placeholder="Nhập tên công ty (tùy chọn)"
                      />
                      <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                        <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Row 3: Address */}
                <div className="space-y-2">
                  <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700">
                    <MapPin className="h-4 w-4 text-green-600" />
                    <span>Địa chỉ</span>
                  </label>
                  <div className="relative">
                    <textarea
                      value={createForm.address}
                      onChange={(e) => setCreateForm({...createForm, address: e.target.value})}
                      className="w-full border-2 border-gray-200 rounded-lg px-3 py-2 focus:border-green-500 focus:ring-2 focus:ring-green-100 transition-all duration-200 bg-gray-50 focus:bg-white text-sm resize-none"
                      rows={2}
                      placeholder="Nhập địa chỉ"
                    />
                    <div className="absolute top-3 right-3 pointer-events-none">
                      <MapPin className="h-5 w-5 text-gray-400" />
                    </div>
                  </div>
                </div>

                {/* Row 4: Notes */}
                <div className="space-y-2">
                  <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700">
                    <MessageSquare className="h-4 w-4 text-green-600" />
                    <span>Ghi chú</span>
                  </label>
                  <div className="relative">
                    <textarea
                      value={createForm.notes}
                      onChange={(e) => setCreateForm({...createForm, notes: e.target.value})}
                      className="w-full border-2 border-gray-200 rounded-lg px-3 py-2 focus:border-green-500 focus:ring-2 focus:ring-green-100 transition-all duration-200 bg-gray-50 focus:bg-white text-sm resize-none"
                      rows={2}
                      placeholder="Ghi chú về khách hàng"
                    />
                    <div className="absolute top-3 right-3 pointer-events-none">
                      <MessageSquare className="h-5 w-5 text-gray-400" />
                    </div>
                  </div>
                </div>
              </form>
            </div>

            {/* Footer */}
            <div className="bg-gray-50 px-6 py-4 rounded-b-2xl flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="px-6 py-3 border-2 border-gray-300 rounded-lg text-gray-700 hover:bg-white hover:border-gray-400 transition-all duration-200 font-medium"
                disabled={creatingCustomer}
              >
                Hủy
              </button>
              <button
                type="submit"
                form="create-customer-form"
                className="px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg hover:from-green-700 hover:to-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 transition-all duration-200 font-medium shadow-lg"
                disabled={creatingCustomer}
              >
                {creatingCustomer && (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                )}
                <Plus className="h-4 w-4" />
                <span>{creatingCustomer ? 'Đang thêm...' : 'Thêm khách hàng'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Loading Spinner */}
      {loading && (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
          <span className="ml-3 text-gray-600">Đang tải danh sách khách hàng...</span>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Lỗi khi tải dữ liệu</h3>
              <div className="mt-2 text-sm text-red-700">
                <p>{error}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Info State - Show data source info */}
      {/* {!loading && (
        <div className={`border rounded-lg p-4 mb-6 ${
          customers === mockCustomers 
            ? 'bg-blue-50 border-blue-200'
            : 'bg-green-50 border-green-200'
        }`}>
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className={`h-5 w-5 ${
                customers === mockCustomers ? 'text-blue-400' : 'text-green-400'
              }`} viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
              <div className="ml-3">
                <h3 className={`text-sm font-medium ${
                  customers === mockCustomers ? 'text-blue-800' : 'text-green-800'
                }`}>
                  {customers === mockCustomers ? 'Đang sử dụng dữ liệu mẫu' : 'Dữ liệu từ Backend API'}
                </h3>
                <div className={`mt-2 text-sm ${
                  customers === mockCustomers ? 'text-blue-700' : 'text-green-700'
                }`}>
                  <p>
                    {customers === mockCustomers
                      ? 'Backend API chưa sẵn sàng hoặc yêu cầu quyền truy cập. Hiển thị dữ liệu mẫu để demo.'
                      : `Đã tải thành công ${customers.length} khách hàng từ database.`
                    }
                  </p>
                </div>
              </div>
            </div>
          </div>
        )} */}

        {/* Customer Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCustomers.map((customer) => (
            <div key={customer.id} className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border border-gray-100 overflow-hidden">
              {/* Card Header */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 border-b border-gray-100">
                <div className="flex justify-between items-start">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
                      <User className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">{customer.name}</h3>
                      <p className="text-sm text-gray-600">ID: {customer.id}</p>
                    </div>
                  </div>
                  <div className="flex space-x-1">
                    <button 
                      onClick={() => handleViewCustomer(customer)}
                      className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-100 rounded-lg transition-all"
                      disabled={loadingCustomerDetail}
                      title="Xem chi tiết"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                    <button 
                      onClick={() => handleEditCustomer(customer)}
                      className="p-2 text-green-600 hover:text-green-800 hover:bg-green-100 rounded-lg transition-all"
                      title="Chỉnh sửa"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Card Content */}
              <div className="p-6">
                <div className="space-y-3 mb-6">
                  <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                    <Mail className="h-4 w-4 text-blue-600" />
                    <span className="text-sm text-gray-700 truncate">{customer.email}</span>
                  </div>
                  <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                    <Phone className="h-4 w-4 text-green-600" />
                    <span className="text-sm text-gray-700">{customer.phone}</span>
                  </div>
                  <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                    <MapPin className="h-4 w-4 text-purple-600" />
                    <span className="text-sm text-gray-700 truncate">{customer.address}</span>
                  </div>
                </div>

                
                {/* Action Buttons */}
                <div className="flex space-x-2">
                  <button 
                    onClick={() => handleScheduleClick(customer)}
                    className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-3 py-2 rounded-lg text-sm font-medium flex items-center justify-center space-x-2 transition-all duration-200 shadow-lg"
                  >
                    <Calendar className="h-4 w-4" />
                    <span>Đặt lịch</span>
                  </button>
                  
                </div>
              </div>
            </div>
          ))}
        </div>

      {/* Customer Detail Modal */}
      {selectedCustomer && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white p-6 rounded-t-2xl">
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
                    <Eye className="h-6 w-6" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">Thông tin chi tiết khách hàng</h2>
                    <p className="text-blue-100 text-sm">
                      ID: {selectedCustomer.id} | Nguồn: {customers === mockCustomers ? 'Dữ liệu mẫu' : 'Dữ liệu API'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
               
                  <button
                    onClick={() => setSelectedCustomer(null)}
                    className="text-white hover:text-blue-200 transition-colors p-2 hover:bg-white hover:bg-opacity-10 rounded-lg"
                    disabled={loadingCustomerDetail}
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="p-6">
              {/* Loading overlay for customer detail */}
              {loadingCustomerDetail && (
                <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-10 rounded-b-2xl">
                  <div className="flex flex-col items-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    <span className="mt-2 text-gray-600">Đang tải thông tin khách hàng...</span>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Customer Info */}
                <div className="lg:col-span-1">
                  <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-6 border border-blue-200">
                    <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center space-x-2">
                      <User className="h-5 w-5 text-blue-600" />
                      <span>Thông tin cá nhân</span>
                    </h3>
                    <div className="space-y-4">
                      <div className="bg-white rounded-lg p-3 border border-blue-100">
                        <p className="text-sm text-gray-600 mb-1">Họ và tên</p>
                        <p className="font-semibold text-gray-900">{selectedCustomer.name}</p>
                      </div>
                      <div className="bg-white rounded-lg p-3 border border-blue-100">
                        <p className="text-sm text-gray-600 mb-1">Email</p>
                        <p className="font-semibold text-gray-900">{selectedCustomer.email}</p>
                      </div>
                      <div className="bg-white rounded-lg p-3 border border-blue-100">
                        <p className="text-sm text-gray-600 mb-1">Số điện thoại</p>
                        <p className="font-semibold text-gray-900">{selectedCustomer.phone}</p>
                      </div>
                      <div className="bg-white rounded-lg p-3 border border-blue-100">
                        <p className="text-sm text-gray-600 mb-1">Địa chỉ</p>
                        <p className="font-semibold text-gray-900">{selectedCustomer.address}</p>
                      </div>
                    </div>

                    <button 
                      onClick={() => handleEditCustomer(selectedCustomer)}
                      className="w-full mt-6 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-3 py-2 rounded-lg font-medium transition-all duration-200 shadow-lg flex items-center justify-center space-x-2"
                    >
                      <Edit className="h-4 w-4" />
                      <span>Chỉnh sửa thông tin</span>
                    </button>
                  </div>
                </div>

                {/* Activity History */}
                <div className="lg:col-span-2">
                  <div className="space-y-6">
                    {/* Test Drives */}
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center space-x-2">
                        <Calendar className="h-5 w-5 text-green-600" />
                        <span>Lịch sử lái thử</span>
                        {loadingTestDrives && (
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-600"></div>
                        )}
                      </h3>
                      <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg border border-green-200">
                        {customerTestDrives.length > 0 ? (
                          <div className="p-4">
                            <div className="space-y-3 max-h-80 overflow-y-auto">
                              {customerTestDrives.map((drive) => (
                                <div 
                                  key={drive.appointmentId} 
                                  className="bg-white rounded-lg p-4 shadow-sm border border-green-100 hover:shadow-md transition-shadow"
                                >
                                  <div className="flex items-start justify-between mb-2">
                                    <div className="flex items-center space-x-2">
                                      <Car className="h-4 w-4 text-green-600" />
                                      <span className="font-medium text-gray-900">{drive.vehicleName}</span>
                                    </div>
                                    {getStatusBadge(drive.status)}
                                  </div>
                                  <div className="space-y-1 text-sm text-gray-600">
                                    <div className="flex items-center space-x-2">
                                      <Calendar className="h-3 w-3" />
                                      <span>{formatDate(drive.appointmentDate)}</span>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                      <MapPin className="h-3 w-3" />
                                      <span>{drive.address}</span>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                      <User className="h-3 w-3" />
                                      <span>{drive.username}</span>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                            <button 
                              onClick={() => handleScheduleClick(selectedCustomer)}
                              className="w-full mt-4 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-4 py-2 rounded-lg font-medium transition-all duration-200 shadow-md flex items-center justify-center space-x-2"
                            >
                              <Calendar className="h-4 w-4" />
                              <span>Đặt lịch lái thử mới</span>
                            </button>
                          </div>
                        ) : (
                          <div className="p-6">
                            <div className="text-center py-8">
                              <Calendar className="h-12 w-12 text-green-400 mx-auto mb-4" />
                              <p className="text-gray-600 mb-4">Chưa có lịch lái thử nào</p>
                              <button 
                                onClick={() => handleScheduleClick(selectedCustomer)}
                                className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-6 py-3 rounded-lg font-medium transition-all duration-200 shadow-lg flex items-center space-x-2 mx-auto"
                              >
                                <Calendar className="h-4 w-4" />
                                <span>Đặt lịch lái thử mới</span>
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Orders */}
                    {/* <div>
                      <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center space-x-2">
                        <svg className="h-5 w-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <span>Lịch sử đơn hàng</span>
                      </h3>
                      <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg p-6 border border-purple-200">
                        <div className="text-center py-8">
                          <svg className="h-12 w-12 text-purple-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                          <p className="text-gray-600">Chưa có đơn hàng nào</p>
                        </div>
                      </div>
                    </div> */}

                    {/* Feedback */}
                    {/* <div>
                      <h3 className="text-lg font-bold text-gray-900 mb-4">Phản hồi & Khiếu nại</h3>
                      <div className="bg-gray-50 rounded-lg p-4">
                        <p className="text-gray-600 text-center py-8">Chưa có phản hồi nào</p>
                      </div>
                    </div> */}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Update Customer Modal */}
      {showUpdateModal && editingCustomer && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full shadow-2xl transform transition-all">
            {/* Header */}
            <div className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white p-4 rounded-t-lg">
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
                    <Edit className="h-4 w-4" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold">Cập nhật thông tin khách hàng</h2>
                    <p className="text-emerald-100 text-xs">Sửa đổi thông tin khách hàng</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowUpdateModal(false)}
                  className="text-white hover:text-emerald-200 transition-colors p-2 hover:bg-white hover:bg-opacity-10 rounded-lg"
                  disabled={updatingCustomer}
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-4">
              {/* Authentication Notice */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-3 mb-4">
                <div className="flex items-start space-x-2">
                  <div className="flex-shrink-0">
                    <div className="w-6 h-6 bg-blue-500 rounded-lg flex items-center justify-center">
                      <svg className="h-3 w-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xs font-semibold text-blue-800 mb-1">Lưu ý về xác thực</h3>
                    <p className="text-xs text-blue-700">Để cập nhật thông tin khách hàng, bạn cần đăng nhập với tài khoản hợp lệ có quyền truy cập API.</p>
                  </div>
                </div>
              </div>

              <form id="update-customer-form" onSubmit={handleUpdateCustomer} className="space-y-3">
                {/* Row 1: Full Name & Email */}
                <div className="grid grid-cols-1 gap-3">
                  <div className="space-y-2">
                    <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700">
                      <User className="h-4 w-4 text-emerald-600" />
                      <span>Họ và tên *</span>
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        required
                        value={updateForm.fullName}
                        onChange={(e) => setUpdateForm({...updateForm, fullName: e.target.value})}
                        className="w-full border-2 border-gray-200 rounded-lg px-3 py-2 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 transition-all duration-200 bg-gray-50 focus:bg-white text-sm"
                        placeholder="Nhập họ và tên"
                      />
                      <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                        <User className="h-5 w-5 text-gray-400" />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700">
                      <Mail className="h-4 w-4 text-emerald-600" />
                      <span>Email *</span>
                    </label>
                    <div className="relative">
                      <input
                        type="email"
                        required
                        value={updateForm.email}
                        onChange={(e) => setUpdateForm({...updateForm, email: e.target.value})}
                        className="w-full border-2 border-gray-200 rounded-lg px-3 py-2 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 transition-all duration-200 bg-gray-50 focus:bg-white text-sm"
                        placeholder="Nhập email"
                      />
                      <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                        <Mail className="h-5 w-5 text-gray-400" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Row 2: Phone & Company */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700">
                      <Phone className="h-4 w-4 text-emerald-600" />
                      <span>Số điện thoại *</span>
                    </label>
                    <div className="relative">
                      <input
                        type="tel"
                        required
                        value={updateForm.phone}
                        onChange={(e) => setUpdateForm({...updateForm, phone: e.target.value})}
                        className="w-full border-2 border-gray-200 rounded-lg px-3 py-2 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 transition-all duration-200 bg-gray-50 focus:bg-white text-sm"
                        placeholder="Nhập số điện thoại"
                      />
                      <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                        <Phone className="h-5 w-5 text-gray-400" />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700">
                      <div className="w-4 h-4 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full"></div>
                      <span>Tên công ty</span>
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={updateForm.companyName}
                        onChange={(e) => setUpdateForm({...updateForm, companyName: e.target.value})}
                        className="w-full border-2 border-gray-200 rounded-lg px-3 py-2 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 transition-all duration-200 bg-gray-50 focus:bg-white text-sm"
                        placeholder="Nhập tên công ty (tùy chọn)"
                      />
                      <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                        <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Row 3: Address */}
                <div className="space-y-2">
                  <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700">
                    <MapPin className="h-4 w-4 text-emerald-600" />
                    <span>Địa chỉ</span>
                  </label>
                  <div className="relative">
                    <textarea
                      value={updateForm.address}
                      onChange={(e) => setUpdateForm({...updateForm, address: e.target.value})}
                      className="w-full border-2 border-gray-200 rounded-lg px-3 py-2 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 transition-all duration-200 bg-gray-50 focus:bg-white text-sm resize-none"
                      rows={2}
                      placeholder="Nhập địa chỉ"
                    />
                    <div className="absolute top-3 right-3 pointer-events-none">
                      <MapPin className="h-5 w-5 text-gray-400" />
                    </div>
                  </div>
                </div>

                {/* Row 4: Notes */}
                <div className="space-y-2">
                  <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700">
                    <MessageSquare className="h-4 w-4 text-emerald-600" />
                    <span>Ghi chú</span>
                  </label>
                  <div className="relative">
                    <textarea
                      value={updateForm.notes}
                      onChange={(e) => setUpdateForm({...updateForm, notes: e.target.value})}
                      className="w-full border-2 border-gray-200 rounded-lg px-3 py-2 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 transition-all duration-200 bg-gray-50 focus:bg-white text-sm resize-none"
                      rows={2}
                      placeholder="Ghi chú về khách hàng"
                    />
                    <div className="absolute top-3 right-3 pointer-events-none">
                      <MessageSquare className="h-5 w-5 text-gray-400" />
                    </div>
                  </div>
                </div>

              </form>
            </div>

            {/* Footer */}
            <div className="bg-gray-50 px-4 py-3 rounded-b-lg flex justify-end space-x-2">
              <button
                type="button"
                onClick={() => setShowUpdateModal(false)}
                className="px-4 py-2 border-2 border-gray-300 rounded-lg text-gray-700 hover:bg-white hover:border-gray-400 transition-all duration-200 font-medium text-sm"
                disabled={updatingCustomer}
              >
                Hủy
              </button>
              <button
                type="submit"
                form="update-customer-form"
                className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-lg hover:from-emerald-700 hover:to-teal-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 transition-all duration-200 font-medium shadow-lg text-sm"
                disabled={updatingCustomer}
              >
                {updatingCustomer && (
                  <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
                )}
                <Edit className="h-3 w-3" />
                <span>{updatingCustomer ? 'Đang cập nhật...' : 'Cập nhật thông tin'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      </div>
    </div>
  );
};