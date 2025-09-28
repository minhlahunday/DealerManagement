import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Search, Phone, Mail, MapPin, Calendar, MessageSquare, Edit, Eye, Trash2 } from 'lucide-react';
import { mockCustomers, mockVehicles, mockMotorbikes } from '../../../data/mockData';
import { Customer } from '../../../types';
import { useNavigate } from 'react-router-dom';
import { customerService, CreateCustomerRequest, UpdateCustomerRequest } from '../../../services/customerService';
import { useAuth } from '../../../contexts/AuthContext';

export const CustomerManagement: React.FC = () => {
  const navigate = useNavigate();
  const { checkToken } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [selectedCustomerForSchedule, setSelectedCustomerForSchedule] = useState<Customer | null>(null);
  const [scheduleForm, setScheduleForm] = useState({
    vehicleId: '',
    vehicleType: 'car', // 'car' or 'motorbike'
    date: '',
    time: '',
    purpose: '',
    notes: ''
  });

  // API states
  const [customers, setCustomers] = useState<Customer[]>(mockCustomers);
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
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletingCustomer, setDeletingCustomer] = useState(false);
  const [customerToDelete, setCustomerToDelete] = useState<Customer | null>(null);
  const [updateForm, setUpdateForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    address: '',
    companyName: '',
    notes: ''
  });

  const allVehicles = [...mockVehicles, ...mockMotorbikes];

  // Fetch customers from API
  const fetchCustomers = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await customerService.getCustomers();
      console.log('Customer API Response:', response);

      if (response.success && response.data.length > 0) {
        setCustomers(response.data);
        console.log('✅ Customers loaded from API:', response.data.length);
        console.log('📋 First Customer Sample:', response.data[0]);
        console.log('📋 All Customer IDs:', response.data.map(c => ({ id: c.id, name: c.name })));
      } else {
        console.log('No customers from API, using mock data');
        setCustomers(mockCustomers);
      }
    } catch (error) {
      console.error('Failed to fetch customers:', error);
      setError(error instanceof Error ? error.message : 'Lỗi khi tải danh sách khách hàng');
      setCustomers(mockCustomers);
    } finally {
      setLoading(false);
    }
  }, []);

  // Check token on mount
  useEffect(() => {
    console.log('=== CustomerManagement Component Mounted ===');
    checkToken();
  }, [checkToken]);

  // Fetch customers on mount
  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  const filteredCustomers = customers.filter(customer =>
    customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.phone.includes(searchTerm)
  );

  // Fetch customer detail from API
  const fetchCustomerDetail = useCallback(async (customerId: string) => {
    setLoadingCustomerDetail(true);
    console.log('🔍 Fetching customer detail for ID:', customerId);

    try {
      const response = await customerService.getCustomerById(customerId);
      console.log('📡 Customer Detail API Response:', response);

      if (response.success && response.data) {
        console.log('✅ Customer detail loaded from API:', response.data);
        console.log('📋 Mapped Customer Data:', {
          id: response.data.id,
          name: response.data.name,
          email: response.data.email,
          phone: response.data.phone,
          address: response.data.address
        });
        setSelectedCustomer(response.data);
      } else {
        console.log('⚠️ No customer detail from API, using mock data');
        const mockCustomer = mockCustomers.find(c => c.id === customerId);
        if (mockCustomer) {
          console.log('📋 Using mock customer data:', mockCustomer);
          setSelectedCustomer(mockCustomer);
        } else {
          console.error('❌ No customer found with ID:', customerId);
          // Create a default customer object
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
        }
      }
    } catch (error) {
      console.error('❌ Failed to fetch customer detail:', error);
      const mockCustomer = mockCustomers.find(c => c.id === customerId);
      if (mockCustomer) {
        console.log('📋 Fallback to mock customer data:', mockCustomer);
        setSelectedCustomer(mockCustomer);
      } else {
        console.error('❌ No fallback customer found');
      }
    } finally {
      setLoadingCustomerDetail(false);
    }
  }, []);

  const handleViewCustomer = (customer: Customer) => {
    console.log('👁️ Viewing customer:', customer.id, customer.name);
    console.log('📋 Customer object:', customer);
    fetchCustomerDetail(customer.id);
  };

  // Debug function to test API directly
  const testCustomerAPI = async (customerId: string) => {
    console.log('🧪 Testing Customer API for ID:', customerId);
    try {
      const response = await customerService.getCustomerById(customerId);
      console.log('🧪 Test API Response:', response);
      return response;
    } catch (error) {
      console.error('🧪 Test API Error:', error);
      return null;
    }
  };

  const handleScheduleClick = (customer: Customer) => {
    setSelectedCustomerForSchedule(customer);
    setShowScheduleModal(true);
  };

  // Create customer via API
  const handleCreateCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreatingCustomer(true);

    try {
      const customerData: CreateCustomerRequest = {
        userId: 0, // Will be set by backend
        username: createForm.email.split('@')[0], // Use email prefix as username
        email: createForm.email,
        passwordHash: 'defaultPassword123', // Default password, should be changed by user
        roleId: 4, // Customer role ID (assuming 4 is customer role)
        fullName: createForm.fullName,
        phone: createForm.phone,
        address: createForm.address,
        companyName: createForm.companyName || ''
      };

      console.log('Creating customer with data:', customerData);
      const response = await customerService.createCustomer(customerData);

      if (response.success) {
        console.log('✅ Customer created successfully:', response);
        // Refresh customer list
        await fetchCustomers();
        // Reset form and close modal
        setCreateForm({
          fullName: '',
          email: '',
          phone: '',
          address: '',
          companyName: '',
          notes: ''
        });
        setShowCreateModal(false);
        // Show success message
        alert('✅ Khách hàng đã được tạo thành công!');
      } else {
        console.error('❌ Failed to create customer:', response.message);
        // Show detailed error message
        const errorMsg = response.message.includes('Authentication required') 
          ? '🔐 Cần đăng nhập với tài khoản hợp lệ để tạo khách hàng.\n\nVui lòng:\n1. Đăng nhập với tài khoản thật (không phải mock)\n2. Hoặc kiểm tra quyền truy cập API'
          : response.message;
        alert(`❌ Lỗi khi tạo khách hàng:\n\n${errorMsg}`);
      }
    } catch (error) {
      console.error('❌ Error creating customer:', error);
      alert(`Lỗi khi tạo khách hàng: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setCreatingCustomer(false);
    }
  };

  const handleScheduleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (scheduleForm.vehicleId) {
      const vehicle = allVehicles.find(v => v.id === scheduleForm.vehicleId);
      if (vehicle) {
        navigate(`/portal/test-drive?vehicleId=${scheduleForm.vehicleId}&customerId=${selectedCustomerForSchedule?.id}`);
      }
    }
    setShowScheduleModal(false);
  };

  // Handle edit customer click
  const handleEditCustomer = (customer: Customer) => {
    console.log('✏️ Editing customer:', customer.id, customer.name);
    setSelectedCustomer(null); // Close the customer detail modal
    setEditingCustomer(customer); // Store the customer being edited
    setUpdateForm({
      fullName: customer.name,
      email: customer.email,
      phone: customer.phone,
      address: customer.address,
      companyName: '', // This field might not be in Customer interface
      notes: ''
    });
    setShowUpdateModal(true);
  };

  // Update customer via API
  const handleUpdateCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCustomer) return;

    setUpdatingCustomer(true);

    try {
      const customerData: UpdateCustomerRequest = {
        userId: parseInt(editingCustomer.id), // Convert string ID to number
        username: updateForm.email.split('@')[0], // Use email prefix as username
        email: updateForm.email,
        passwordHash: 'defaultPassword123', // Keep existing password
        roleId: 4, // Customer role ID
        fullName: updateForm.fullName,
        phone: updateForm.phone,
        address: updateForm.address,
        companyName: updateForm.companyName || ''
      };

      console.log('🔄 Updating customer with data:', customerData);
      const response = await customerService.updateCustomer(editingCustomer.id, customerData);

      if (response.success) {
        console.log('✅ Customer updated successfully:', response);
        // Refresh customer list
        await fetchCustomers();
        // Close modal
        setShowUpdateModal(false);
        setEditingCustomer(null);
        // Show success message
        alert('✅ Khách hàng đã được cập nhật thành công!');
      } else {
        console.error('❌ Failed to update customer:', response.message);
        // Show detailed error message
        const errorMsg = response.message.includes('Authentication required') 
          ? '🔐 Cần đăng nhập với tài khoản hợp lệ để cập nhật khách hàng.\n\nVui lòng:\n1. Đăng nhập với tài khoản thật (không phải mock)\n2. Hoặc kiểm tra quyền truy cập API'
          : response.message;
        alert(`❌ Lỗi khi cập nhật khách hàng:\n\n${errorMsg}`);
      }
    } catch (error) {
      console.error('❌ Error updating customer:', error);
      alert(`Lỗi khi cập nhật khách hàng: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setUpdatingCustomer(false);
    }
  };

  // Handle delete customer click
  const handleDeleteCustomer = (customer: Customer) => {
    console.log('🗑️ Deleting customer:', customer.id, customer.name);
    setCustomerToDelete(customer);
    setShowDeleteModal(true);
  };

  // Delete customer via API
  const handleConfirmDelete = async () => {
    if (!customerToDelete) return;

    setDeletingCustomer(true);

    try {
      console.log('🗑️ Deleting customer with ID:', customerToDelete.id);
      const response = await customerService.deleteCustomer(customerToDelete.id);

      if (response.success) {
        console.log('✅ Customer deleted successfully:', response);
        // Refresh customer list
        await fetchCustomers();
        // Close modal
        setShowDeleteModal(false);
        setCustomerToDelete(null);
        // Show success message
        alert('✅ Khách hàng đã được xóa thành công!');
      } else {
        console.error('❌ Failed to delete customer:', response.message);
        // Show detailed error message
        const errorMsg = response.message.includes('Authentication required') 
          ? '🔐 Cần đăng nhập với tài khoản hợp lệ để xóa khách hàng.\n\nVui lòng:\n1. Đăng nhập với tài khoản thật (không phải mock)\n2. Hoặc kiểm tra quyền truy cập API'
          : response.message;
        alert(`❌ Lỗi khi xóa khách hàng:\n\n${errorMsg}`);
      }
    } catch (error) {
      console.error('❌ Error deleting customer:', error);
      alert(`Lỗi khi xóa khách hàng: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setDeletingCustomer(false);
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Quản lý khách hàng</h1>
        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-black hover:bg-gray-800 text-white px-4 py-2 rounded-lg font-medium flex items-center space-x-2"
        >
          <Plus className="h-4 w-4" />
          <span>Thêm khách hàng</span>
        </button>
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Tìm kiếm khách hàng..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
          />
        </div>
      </div>

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
      {!loading && (
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
      )}

      {/* Customer Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCustomers.map((customer) => (
          <div key={customer.id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
            <div className="flex justify-between items-start mb-4">
              <div className="flex-1">
                <h3 className="text-lg font-bold text-gray-900 mb-1">{customer.name}</h3>
                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex items-center space-x-2">
                    <Mail className="h-4 w-4" />
                    <span>{customer.email}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Phone className="h-4 w-4" />
                    <span>{customer.phone}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <MapPin className="h-4 w-4" />
                    <span>{customer.address}</span>
                  </div>
                </div>
              </div>
              <div className="flex space-x-2">
                <button 
                  onClick={() => handleViewCustomer(customer)}
                  className="text-blue-600 hover:text-blue-800"
                  disabled={loadingCustomerDetail}
                  title="Xem chi tiết khách hàng"
                >
                  <Eye className="h-4 w-4" />
                </button>
                <button 
                  onClick={() => handleEditCustomer(customer)}
                  className="text-green-600 hover:text-green-800"
                  title="Chỉnh sửa khách hàng"
                >
                  <Edit className="h-4 w-4" />
                </button>
                <button 
                  onClick={() => handleDeleteCustomer(customer)}
                  className="text-red-600 hover:text-red-800"
                  title="Xóa khách hàng"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="border-t pt-4">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-xl font-bold text-gray-900">{customer.orders?.length || 0}</p>
                  <p className="text-xs text-gray-600">Đơn hàng</p>
                </div>
                <div>
                  <p className="text-xl font-bold text-gray-900">{customer.testDrives?.length || 0}</p>
                  <p className="text-xs text-gray-600">Lái thử</p>
                </div>
                <div>
                  <p className="text-xl font-bold text-green-600">VIP</p>
                  <p className="text-xs text-gray-600">Hạng</p>
                </div>
              </div>
            </div>

            <div className="flex space-x-2 mt-4">
              <button 
                onClick={() => handleScheduleClick(customer)}
                className="flex-1 bg-black hover:bg-gray-800 text-white px-3 py-2 rounded text-sm font-medium flex items-center justify-center space-x-1"
              >
                <Calendar className="h-3 w-3" />
                <span>Đặt lịch</span>
              </button>
              <button className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-2 rounded text-sm font-medium flex items-center justify-center space-x-1">
                <MessageSquare className="h-3 w-3" />
                <span>Nhắn tin</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Create Customer Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-900">Thêm khách hàng mới</h2>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>

              {/* Authentication Notice */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-blue-800">Lưu ý về xác thực</h3>
                    <div className="mt-1 text-sm text-blue-700">
                      <p>Để tạo khách hàng mới, bạn cần đăng nhập với tài khoản hợp lệ có quyền truy cập API.</p>
                    </div>
                  </div>
                </div>
              </div>

              <form onSubmit={handleCreateCustomer} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Họ và tên *
                  </label>
                  <input
                    type="text"
                    required
                    value={createForm.fullName}
                    onChange={(e) => setCreateForm({...createForm, fullName: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500"
                    placeholder="Nhập họ và tên"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email *
                  </label>
                  <input
                    type="email"
                    required
                    value={createForm.email}
                    onChange={(e) => setCreateForm({...createForm, email: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500"
                    placeholder="Nhập email"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Số điện thoại *
                  </label>
                  <input
                    type="tel"
                    required
                    value={createForm.phone}
                    onChange={(e) => setCreateForm({...createForm, phone: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500"
                    placeholder="Nhập số điện thoại"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Địa chỉ
                  </label>
                  <textarea
                    value={createForm.address}
                    onChange={(e) => setCreateForm({...createForm, address: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500"
                    rows={3}
                    placeholder="Nhập địa chỉ"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tên công ty
                  </label>
                  <input
                    type="text"
                    value={createForm.companyName}
                    onChange={(e) => setCreateForm({...createForm, companyName: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500"
                    placeholder="Nhập tên công ty (tùy chọn)"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ghi chú
                  </label>
                  <textarea
                    value={createForm.notes}
                    onChange={(e) => setCreateForm({...createForm, notes: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500"
                    rows={2}
                    placeholder="Ghi chú về khách hàng"
                  />
                </div>

                <div className="flex justify-end space-x-4 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                    disabled={creatingCustomer}
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                    disabled={creatingCustomer}
                  >
                    {creatingCustomer && (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    )}
                    <span>{creatingCustomer ? 'Đang thêm...' : 'Thêm khách hàng'}</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Customer Detail Modal */}
      {selectedCustomer && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Thông tin chi tiết khách hàng</h2>
                  {selectedCustomer && (
                    <p className="text-sm text-gray-500 mt-1">
                      ID: {selectedCustomer.id} | Source: {customers === mockCustomers ? 'Mock Data' : 'API Data'}
                    </p>
                  )}
                </div>
                <div className="flex space-x-2">
                  {selectedCustomer && (
                    <button
                      onClick={() => testCustomerAPI(selectedCustomer.id)}
                      className="px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                      title="Test API call"
                    >
                      🧪 Test API
                    </button>
                  )}
                  <button
                    onClick={() => setSelectedCustomer(null)}
                    className="text-gray-500 hover:text-gray-700"
                    disabled={loadingCustomerDetail}
                  >
                    ✕
                  </button>
                </div>
              </div>

              {/* Loading overlay for customer detail */}
              {loadingCustomerDetail && (
                <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-10">
                  <div className="flex flex-col items-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
                    <span className="mt-2 text-gray-600">Đang tải thông tin khách hàng...</span>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Customer Info */}
                <div className="lg:col-span-1">
                  <div className="bg-gray-50 rounded-lg p-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-4">Thông tin cá nhân</h3>
                    <div className="space-y-3">
                      <div>
                        <p className="text-sm text-gray-600">Họ và tên</p>
                        <p className="font-medium">{selectedCustomer.name}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Email</p>
                        <p className="font-medium">{selectedCustomer.email}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Số điện thoại</p>
                        <p className="font-medium">{selectedCustomer.phone}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Địa chỉ</p>
                        <p className="font-medium">{selectedCustomer.address}</p>
                      </div>
                    </div>

                    <button 
                      onClick={() => handleEditCustomer(selectedCustomer)}
                      className="w-full mt-4 bg-black hover:bg-gray-800 text-white px-4 py-2 rounded-lg font-medium"
                    >
                      Chỉnh sửa thông tin
                    </button>
                  </div>
                </div>

                {/* Activity History */}
                <div className="lg:col-span-2">
                  <div className="space-y-6">
                    {/* Test Drives */}
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 mb-4">Lịch sử lái thử</h3>
                      <div className="bg-gray-50 rounded-lg p-4">
                        <p className="text-gray-600 text-center py-8">Chưa có lịch lái thử nào</p>
                        <button className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium">
                          Đặt lịch lái thử mới
                        </button>
                      </div>
                    </div>

                    {/* Orders */}
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 mb-4">Lịch sử đơn hàng</h3>
                      <div className="bg-gray-50 rounded-lg p-4">
                        <p className="text-gray-600 text-center py-8">Chưa có đơn hàng nào</p>
                        <button className="w-full bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium">
                          Tạo đơn hàng mới
                        </button>
                      </div>
                    </div>

                    {/* Feedback */}
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 mb-4">Phản hồi & Khiếu nại</h3>
                      <div className="bg-gray-50 rounded-lg p-4">
                        <p className="text-gray-600 text-center py-8">Chưa có phản hồi nào</p>
                        <button className="w-full bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-medium">
                          Ghi nhận phản hồi
                        </button>
                      </div>
                    </div>
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
          <div className="bg-white rounded-lg max-w-md w-full">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-900">Cập nhật thông tin khách hàng</h2>
                <button
                  onClick={() => setShowUpdateModal(false)}
                  className="text-gray-500 hover:text-gray-700"
                  disabled={updatingCustomer}
                >
                  ✕
                </button>
              </div>

              {/* Authentication Notice */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-blue-800">Lưu ý về xác thực</h3>
                    <div className="mt-1 text-sm text-blue-700">
                      <p>Để cập nhật thông tin khách hàng, bạn cần đăng nhập với tài khoản hợp lệ có quyền truy cập API.</p>
                    </div>
                  </div>
                </div>
              </div>

              <form onSubmit={handleUpdateCustomer} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Họ và tên *
                  </label>
                  <input
                    type="text"
                    required
                    value={updateForm.fullName}
                    onChange={(e) => setUpdateForm({...updateForm, fullName: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500"
                    placeholder="Nhập họ và tên"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email *
                  </label>
                  <input
                    type="email"
                    required
                    value={updateForm.email}
                    onChange={(e) => setUpdateForm({...updateForm, email: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500"
                    placeholder="Nhập email"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Số điện thoại *
                  </label>
                  <input
                    type="tel"
                    required
                    value={updateForm.phone}
                    onChange={(e) => setUpdateForm({...updateForm, phone: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500"
                    placeholder="Nhập số điện thoại"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Địa chỉ
                  </label>
                  <textarea
                    value={updateForm.address}
                    onChange={(e) => setUpdateForm({...updateForm, address: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500"
                    rows={3}
                    placeholder="Nhập địa chỉ"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tên công ty
                  </label>
                  <input
                    type="text"
                    value={updateForm.companyName}
                    onChange={(e) => setUpdateForm({...updateForm, companyName: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500"
                    placeholder="Nhập tên công ty (tùy chọn)"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ghi chú
                  </label>
                  <textarea
                    value={updateForm.notes}
                    onChange={(e) => setUpdateForm({...updateForm, notes: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500"
                    rows={2}
                    placeholder="Ghi chú về khách hàng"
                  />
                </div>

                <div className="flex justify-end space-x-4 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowUpdateModal(false)}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                    disabled={updatingCustomer}
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                    disabled={updatingCustomer}
                  >
                    {updatingCustomer && (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    )}
                    <span>{updatingCustomer ? 'Đang cập nhật...' : 'Cập nhật khách hàng'}</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Add Schedule Modal */}
      {showScheduleModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-900">Đặt lịch cho khách hàng</h2>
                <button
                  onClick={() => setShowScheduleModal(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleScheduleSubmit} className="space-y-4">
                {/* Vehicle Type Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Loại xe *
                  </label>
                  <div className="flex space-x-4">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="vehicleType"
                        value="car"
                        checked={scheduleForm.vehicleType === 'car'}
                        onChange={(e) => setScheduleForm({...scheduleForm, vehicleType: e.target.value, vehicleId: ''})}
                        className="mr-2"
                      />
                      <span>Ô tô điện</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="vehicleType"
                        value="motorbike"
                        checked={scheduleForm.vehicleType === 'motorbike'}
                        onChange={(e) => setScheduleForm({...scheduleForm, vehicleType: e.target.value, vehicleId: ''})}
                        className="mr-2"
                      />
                      <span>Xe máy điện</span>
                    </label>
                  </div>
                </div>

                {/* Vehicle Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Chọn xe *
                  </label>
                  <select
                    required
                    value={scheduleForm.vehicleId}
                    onChange={(e) => setScheduleForm({...scheduleForm, vehicleId: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500"
                  >
                    <option value="">Chọn xe</option>
                    {scheduleForm.vehicleType === 'car' 
                      ? mockVehicles.map(vehicle => (
                          <option key={vehicle.id} value={vehicle.id}>
                            {vehicle.model} - {vehicle.version}
                          </option>
                        ))
                      : mockMotorbikes.map(vehicle => (
                          <option key={vehicle.id} value={vehicle.id}>
                            {vehicle.model} - {vehicle.version}
                          </option>
                        ))
                    }
                  </select>
                </div>

                <div className="flex justify-end space-x-4 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowScheduleModal(false)}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800"
                  >
                    Tiếp tục
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Delete Customer Confirmation Modal */}
      {showDeleteModal && customerToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-900">Xác nhận xóa khách hàng</h2>
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="text-gray-500 hover:text-gray-700"
                  disabled={deletingCustomer}
                >
                  ✕
                </button>
              </div>

              {/* Authentication Notice */}
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-red-800">Cảnh báo</h3>
                    <div className="mt-1 text-sm text-red-700">
                      <p>Hành động này không thể hoàn tác. Khách hàng sẽ bị xóa vĩnh viễn khỏi hệ thống.</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Customer Info */}
              <div className="bg-gray-50 rounded-lg p-4 mb-4">
                <h3 className="text-sm font-medium text-gray-700 mb-2">Thông tin khách hàng sẽ bị xóa:</h3>
                <div className="space-y-1 text-sm">
                  <p><span className="font-medium">Tên:</span> {customerToDelete.name}</p>
                  <p><span className="font-medium">Email:</span> {customerToDelete.email}</p>
                  <p><span className="font-medium">SĐT:</span> {customerToDelete.phone}</p>
                </div>
              </div>

              {/* Authentication Notice */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-blue-800">Lưu ý về xác thực</h3>
                    <div className="mt-1 text-sm text-blue-700">
                      <p>Để xóa khách hàng, bạn cần đăng nhập với tài khoản hợp lệ có quyền truy cập API.</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-4 pt-4">
                <button
                  type="button"
                  onClick={() => setShowDeleteModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                  disabled={deletingCustomer}
                >
                  Hủy
                </button>
                <button
                  type="button"
                  onClick={handleConfirmDelete}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                  disabled={deletingCustomer}
                >
                  {deletingCustomer && (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  )}
                  <span>{deletingCustomer ? 'Đang xóa...' : 'Xóa khách hàng'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};