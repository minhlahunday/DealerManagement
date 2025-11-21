import React, { useState, useEffect, useCallback } from 'react';
import { Calendar, Clock, User, Car, Filter, Search, Eye, Edit, Trash2 } from 'lucide-react';
import { testDriveService, TestDriveAppointment, UpdateTestDriveAppointmentRequest } from '../../../services/testDriveService';
import { customerService } from '../../../services/customerService';
import { Customer } from '../../../types';
import { useAuth } from '../../../contexts/AuthContext';

export const TestDriveSchedule: React.FC = () => {
  const { checkToken } = useAuth();
  const [appointments, setAppointments] = useState<TestDriveAppointment[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [selectedAppointment, setSelectedAppointment] = useState<TestDriveAppointment | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState<TestDriveAppointment | null>(null);
  const [updatingAppointment, setUpdatingAppointment] = useState(false);
  const [editForm, setEditForm] = useState({
    appointmentDate: '',
    status: '',
    username: '',
    userId: 0,
    vehicleName: '',
    address: ''
  });
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [, setLoadingCustomers] = useState(false);
  const [customerError, setCustomerError] = useState<string>('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletingAppointment, setDeletingAppointment] = useState(false);
  const [appointmentToDelete, setAppointmentToDelete] = useState<TestDriveAppointment | null>(null);

  // Fetch test drive appointments from API
  const fetchAppointments = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await testDriveService.getTestDriveAppointments();
      console.log('Test Drive Appointments API Response:', response);

      if (response.success && response.data.length > 0) {
        setAppointments(response.data);
        console.log('✅ Test drive appointments loaded from API:', response.data.length);
        console.log('📋 First Appointment Sample:', response.data[0]);
      } else {
        console.log('No appointments from API, using empty data');
        setAppointments([]);
      }
    } catch (error) {
      console.error('Failed to fetch test drive appointments:', error);
      setError(error instanceof Error ? error.message : 'Lỗi khi tải danh sách lịch hẹn');
      setAppointments([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Check token on mount
  useEffect(() => {
    console.log('=== TestDriveSchedule Component Mounted ===');
    checkToken();
  }, [checkToken]);

  // Fetch customers for edit select
  const fetchCustomers = useCallback(async () => {
    setLoadingCustomers(true);
    setCustomerError('');
    try {
      const response = await customerService.getCustomers();
      if (response.success && response.data) {
        setCustomers(response.data);
        console.log('✅ Customers loaded for TestDriveSchedule:', response.data.length);
      } else {
        setCustomerError('Không thể tải danh sách khách hàng');
      }
    } catch (error) {
      console.error('❌ Error loading customers:', error);
      setCustomerError(error instanceof Error ? error.message : 'Lỗi khi tải khách hàng');
    } finally {
      setLoadingCustomers(false);
    }
  }, []);

  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  // Fetch appointments on mount
  useEffect(() => {
    fetchAppointments();
  }, [fetchAppointments]);

  // Filter appointments based on search and status
  const filteredAppointments = appointments.filter(appointment => {
    const matchesSearch = 
      appointment.vehicleName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      appointment.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      appointment.appointmentId.toString().includes(searchTerm);
    
    const matchesStatus = statusFilter === 'ALL' || appointment.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const handleViewAppointment = (appointment: TestDriveAppointment) => {
    setSelectedAppointment(appointment);
    setShowDetailModal(true);
  };

  const handleEditAppointment = (appointment: TestDriveAppointment) => {
    console.log('✏️ Editing appointment:', appointment.appointmentId);
    setSelectedAppointment(null); // Close the detail modal
    setEditingAppointment(appointment); // Store the appointment being edited
    setEditForm({
      appointmentDate: appointment.appointmentDate,
      status: appointment.status,
      username: appointment.username,
      userId: appointment.userId || 0,
      vehicleName: appointment.vehicleName,
      address: appointment.address
    });
    setShowEditModal(true);
  };

  // Update appointment via API
  const handleUpdateAppointment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAppointment) return;

    setUpdatingAppointment(true);

    try {
      // Resolve userId and username from editForm (select) or fall back to original
      const resolvedUserId = editForm.userId && Number(editForm.userId) > 0 ? Number(editForm.userId) : editingAppointment.userId;
      const selectedCustomer = customers.find(c => String(c.id) === String(resolvedUserId));
      const resolvedUsername = selectedCustomer ? selectedCustomer.name : (editForm.username.trim() || 'Khách hàng');

      const appointmentData: UpdateTestDriveAppointmentRequest = {
        appointmentId: editingAppointment.appointmentId,
        appointmentDate: editForm.appointmentDate,
        status: editForm.status,
        userId: resolvedUserId,
        vehicleId: editingAppointment.vehicleId,
        username: resolvedUsername,
        vehicleName: editForm.vehicleName,
        address: editForm.address.trim() || 'Chưa cung cấp'
      };

      console.log('🔄 Updating appointment with data:', appointmentData);
      console.log('🔍 Edit form data debug:', {
        originalUsername: editingAppointment.username,
        editFormUsername: editForm.username,
        editFormUsernameTrimmed: editForm.username.trim(),
        finalUsername: appointmentData.username
      });
      const response = await testDriveService.updateTestDriveAppointment(editingAppointment.appointmentId.toString(), appointmentData);

      if (response.success) {
        console.log('✅ Appointment updated successfully:', response);
        // Refresh appointment list
        await fetchAppointments();
        // Close modal
        setShowEditModal(false);
        setEditingAppointment(null);
        // Show success message
        alert('✅ Lịch hẹn đã được cập nhật thành công!');
      } else {
        console.error('❌ Failed to update appointment:', response.message);
        // Show detailed error message
        const errorMsg = response.message.includes('Authentication required') 
          ? '🔐 Cần đăng nhập với tài khoản hợp lệ để cập nhật lịch hẹn.\n\nVui lòng:\n1. Đăng nhập với tài khoản thật (không phải mock)\n2. Hoặc kiểm tra quyền truy cập API'
          : response.message;
        alert(`❌ Lỗi khi cập nhật lịch hẹn:\n\n${errorMsg}`);
      }
    } catch (error) {
      console.error('❌ Error updating appointment:', error);
      alert(`Lỗi khi cập nhật lịch hẹn: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setUpdatingAppointment(false);
    }
  };

  // Handle delete appointment click
  const handleDeleteAppointment = (appointment: TestDriveAppointment) => {
    console.log('🗑️ Deleting appointment:', appointment.appointmentId);
    setAppointmentToDelete(appointment);
    setShowDeleteModal(true);
  };

  // Delete appointment via API
  const handleConfirmDelete = async () => {
    if (!appointmentToDelete) return;

    setDeletingAppointment(true);

    try {
      console.log('🗑️ Deleting appointment with ID:', appointmentToDelete.appointmentId);
      const response = await testDriveService.deleteTestDriveAppointment(appointmentToDelete.appointmentId.toString());

      if (response.success) {
        console.log('✅ Appointment deleted successfully:', response);
        // Refresh appointment list
        await fetchAppointments();
        // Close modal
        setShowDeleteModal(false);
        setAppointmentToDelete(null);
        // Show success message
        alert('✅ Lịch hẹn đã được xóa thành công!');
      } else {
        console.error('❌ Failed to delete appointment:', response.message);
        // Show detailed error message
        const errorMsg = response.message.includes('Authentication required') 
          ? '🔐 Cần đăng nhập với tài khoản hợp lệ để xóa lịch hẹn.\n\nVui lòng:\n1. Đăng nhập với tài khoản thật (không phải mock)\n2. Hoặc kiểm tra quyền truy cập API'
          : response.message;
        alert(`❌ Lỗi khi xóa lịch hẹn:\n\n${errorMsg}`);
      }
    } catch (error) {
      console.error('❌ Error deleting appointment:', error);
      alert(`Lỗi khi xóa lịch hẹn: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setDeletingAppointment(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (dateString: string) => {
    console.log('🕐 TestDriveSchedule formatTime debug - INPUT:', {
      inputDateString: dateString,
      isUTC: dateString.includes('Z') || dateString.includes('+')
    });
    
    // Parse the date string
    const date = new Date(dateString);
    
    // Get timezone offset in minutes (Vietnam is UTC+7 = -420 minutes)
    const timezoneOffset = date.getTimezoneOffset();
    const vietnamOffset = -420; // UTC+7 in minutes (negative because getTimezoneOffset returns opposite)
    
    console.log('🕐 TestDriveSchedule formatTime debug - PARSING:', {
      parsedDate: date,
      timezoneOffset: timezoneOffset,
      vietnamOffset: vietnamOffset,
      utcHours: date.getUTCHours(),
      localHours: date.getHours(),
      utcMinutes: date.getUTCMinutes(),
      localMinutes: date.getMinutes()
    });
    
    // The date is already in local timezone (Vietnam), but we need to display it correctly
    // If UTC hours is 20 and local hours is 3, it means the original time was 10:00 Vietnam time
    // stored as 03:00 UTC (10:00 - 7h = 03:00 UTC)
    let formattedTime;
    
    if (dateString.includes('Z') || dateString.includes('+')) {
      // This is a UTC date string, but it's already been converted to local time
      // We need to add back the 7 hours to get the original Vietnam time
      const originalVietnamTime = new Date(date.getTime() + (7 * 60 * 60 * 1000));
      formattedTime = originalVietnamTime.toLocaleTimeString('vi-VN', {
        hour: '2-digit',
        minute: '2-digit'
      });
      
      console.log('🕐 TestDriveSchedule formatTime debug - UTC CONVERSION:', {
        originalUTC: date,
        originalVietnamTime: originalVietnamTime,
        formattedTime: formattedTime,
        calculation: `${date.getUTCHours()}:${date.getUTCMinutes().toString().padStart(2, '0')} UTC + 7h = ${originalVietnamTime.getHours()}:${originalVietnamTime.getMinutes().toString().padStart(2, '0')} Vietnam`
      });
    } else {
      // This is a local date string, use as is
      formattedTime = date.toLocaleTimeString('vi-VN', {
        hour: '2-digit',
        minute: '2-digit'
      });
      
      console.log('🕐 TestDriveSchedule formatTime debug - LOCAL:', {
        localDate: date,
        formattedTime: formattedTime
      });
    }
    
    return formattedTime;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      case 'CONFIRMED':
        return 'bg-green-100 text-green-800';
      case 'CANCELLED':
        return 'bg-red-100 text-red-800';
      case 'COMPLETED':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'Chờ xác nhận';
      case 'CONFIRMED':
        return 'Đã xác nhận';
      case 'CANCELLED':
        return 'Đã hủy';
      case 'COMPLETED':
        return 'Đã hoàn thành';
      default:
        return status;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-8 mb-6 border border-green-200">
        <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center space-y-4 lg:space-y-0">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center shadow-lg">
              <Calendar className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-gray-900">Lịch lái thử</h1>
              <p className="text-gray-600 mt-1">Quản lý lịch hẹn lái thử xe của khách hàng</p>
            </div>
          </div>
          <div className="flex items-center space-x-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{appointments.length}</div>
              <div className="text-sm text-gray-600">Tổng lịch hẹn</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{appointments.filter(a => a.status === 'PENDING').length}</div>
              <div className="text-sm text-gray-600">Chờ xác nhận</div>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filter Section */}
      <div className="bg-white rounded-2xl p-6 mb-8 shadow-sm border border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Tìm kiếm theo xe, khách hàng, ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 bg-gray-50 focus:bg-white text-sm"
            />
          </div>

          {/* Status Filter */}
          <div className="relative">
            <Filter className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 appearance-none bg-gray-50 focus:bg-white text-sm transition-all duration-200"
            >
              <option value="ALL">Tất cả trạng thái</option>
              <option value="PENDING">Chờ xác nhận</option>
              <option value="CONFIRMED">Đã xác nhận</option>
              <option value="CANCELLED">Đã hủy</option>
              <option value="COMPLETED">Đã hoàn thành</option>
            </select>
          </div>

          {/* Refresh Button */}
          <button
            onClick={fetchAppointments}
            disabled={loading}
            className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-6 py-3 rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 shadow-lg transition-all duration-200 transform hover:scale-105"
          >
            {loading ? (
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
            ) : (
              <>
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                <span>Làm mới</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Loading Spinner */}
      {loading && (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
          <span className="ml-3 text-gray-600">Đang tải danh sách lịch hẹn...</span>
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
          appointments.length === 0 
            ? 'bg-blue-50 border-blue-200'
            : 'bg-green-50 border-green-200'
        }`}>
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className={`h-5 w-5 ${
                appointments.length === 0 ? 'text-blue-400' : 'text-green-400'
              }`} viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className={`text-sm font-medium ${
                appointments.length === 0 ? 'text-blue-800' : 'text-green-800'
              }`}>
                {appointments.length === 0 ? 'Chưa có lịch hẹn nào' : 'Dữ liệu từ Backend API'}
              </h3>
              <div className={`mt-2 text-sm ${
                appointments.length === 0 ? 'text-blue-700' : 'text-green-700'
              }`}>
                <p>
                  {appointments.length === 0
                    ? 'Backend API chưa sẵn sàng hoặc yêu cầu quyền truy cập. Chưa có lịch hẹn nào được tải.'
                    : `Đã tải thành công ${appointments.length} lịch hẹn từ database.`
                  }
                </p>
              </div>
            </div>
          </div>
        </div>
      )} */}

      {/* Appointments List */}
      {!loading && filteredAppointments.length > 0 && (
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
          <div className="bg-gradient-to-r from-gray-50 to-slate-50 px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-900 flex items-center space-x-2">
              <Calendar className="h-6 w-6 text-green-600" />
              <span>Danh sách lịch hẹn ({filteredAppointments.length})</span>
            </h2>
          </div>
          
          <div className="divide-y divide-gray-100">
            {filteredAppointments.map((appointment) => (
              <div key={appointment.appointmentId} className="p-6 hover:bg-gradient-to-r hover:from-green-50 hover:to-emerald-50 transition-all duration-300">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-6">
                      <div className="flex-shrink-0">
                        <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center shadow-lg">
                          <Car className="h-8 w-8 text-white" />
                        </div>
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-4 mb-3">
                          <h3 className="text-xl font-bold text-gray-900 truncate">
                            {appointment.vehicleName}
                          </h3>
                          <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(appointment.status)}`}>
                            {getStatusText(appointment.status)}
                          </span>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                          <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
                            <Calendar className="h-5 w-5 text-blue-600" />
                            <div>
                              <p className="text-xs text-gray-600">Ngày</p>
                              <p className="font-semibold text-gray-900">{formatDate(appointment.appointmentDate)}</p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
                            <Clock className="h-5 w-5 text-green-600" />
                            <div>
                              <p className="text-xs text-gray-600">Giờ</p>
                              <p className="font-semibold text-gray-900">{formatTime(appointment.appointmentDate)}</p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-3 p-3 bg-purple-50 rounded-lg">
                            <User className="h-5 w-5 text-purple-600" />
                            <div>
                              <p className="text-xs text-gray-600">Khách hàng</p>
                              <p className="font-semibold text-gray-900 truncate">
                                {appointment.username || 'Chưa có tên'}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                            <span className="text-xs bg-gray-200 px-2 py-1 rounded-lg font-medium">ID: {appointment.appointmentId}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2 ml-6">
                    <button
                      onClick={() => handleViewAppointment(appointment)}
                      className="p-3 text-blue-600 hover:text-blue-800 hover:bg-blue-100 rounded-lg transition-all duration-200"
                      title="Xem chi tiết"
                    >
                      <Eye className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => handleEditAppointment(appointment)}
                      className="p-3 text-green-600 hover:text-green-800 hover:bg-green-100 rounded-lg transition-all duration-200"
                      title="Chỉnh sửa"
                    >
                      <Edit className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => handleDeleteAppointment(appointment)}
                      className="p-3 text-red-600 hover:text-red-800 hover:bg-red-100 rounded-lg transition-all duration-200"
                      title="Xóa"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {!loading && filteredAppointments.length === 0 && appointments.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
          <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <Search className="h-12 w-12 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Không tìm thấy lịch hẹn</h3>
          <p className="text-gray-600">Thử thay đổi từ khóa tìm kiếm hoặc bộ lọc trạng thái.</p>
        </div>
      )}

      {/* No Data State */}
      {!loading && appointments.length === 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
          <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <Calendar className="h-12 w-12 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Chưa có lịch hẹn nào</h3>
          <p className="text-gray-600">Hiện tại chưa có lịch hẹn lái thử nào trong hệ thống.</p>
        </div>
      )}

      {/* Appointment Detail Modal */}
      {showDetailModal && selectedAppointment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4 rounded-t-2xl">
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
                    <Calendar className="h-4 w-4" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold">Chi tiết lịch hẹn</h2>
                    <p className="text-blue-100 text-xs">Thông tin chi tiết về cuộc hẹn</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="text-white hover:text-blue-200 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-4">
              {/* Main Info Cards */}
              <div className="grid grid-cols-1 gap-3 mb-4">
                <div className="bg-gradient-to-br from-green-50 to-green-100 p-3 rounded-lg border border-green-200">
                  <div className="flex items-center space-x-2">
                    <div className="w-6 h-6 bg-green-500 rounded-lg flex items-center justify-center">
                      <Car className="h-3 w-3 text-white" />
                    </div>
                    <div>
                      <p className="text-xs text-green-600 font-medium">Xe</p>
                      <p className="text-sm font-bold text-green-900">{selectedAppointment.vehicleName}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-3 rounded-lg border border-purple-200">
                  <div className="flex items-center space-x-2">
                    <div className="w-6 h-6 bg-purple-500 rounded-lg flex items-center justify-center">
                      <User className="h-3 w-3 text-white" />
                    </div>
                    <div>
                      <p className="text-xs text-purple-600 font-medium">Khách hàng</p>
                      <p className="text-sm font-bold text-purple-900">
                        {selectedAppointment.username || 'Chưa có tên'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Date & Time */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-3 rounded-lg border border-blue-200 mb-4">
                <div className="flex items-center space-x-2 mb-2">
                  <div className="w-6 h-6 bg-blue-500 rounded-lg flex items-center justify-center">
                    <Clock className="h-3 w-3 text-white" />
                  </div>
                  <h3 className="text-sm font-semibold text-blue-900">Thời gian hẹn</h3>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-xs text-blue-600 font-medium">Ngày</p>
                    <p className="text-blue-900 font-semibold text-sm">{formatDate(selectedAppointment.appointmentDate)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-blue-600 font-medium">Giờ</p>
                    <p className="text-blue-900 font-semibold text-sm">{formatTime(selectedAppointment.appointmentDate)}</p>
                  </div>
                </div>
              </div>

              {/* Status */}
              <div className="mb-4">
                <p className="text-xs text-gray-600 font-medium mb-2">Trạng thái</p>
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedAppointment.status)}`}>
                  {getStatusText(selectedAppointment.status)}
                </span>
              </div>

              {/* Address Information */}
              <div className="bg-gradient-to-r from-orange-50 to-amber-50 p-3 rounded-lg border border-orange-200 mb-4">
                <div className="flex items-center space-x-2 mb-2">
                  <div className="w-6 h-6 bg-orange-500 rounded-lg flex items-center justify-center">
                    <svg className="h-3 w-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <h3 className="text-sm font-semibold text-orange-900">Địa chỉ</h3>
                </div>
                <p className="text-orange-900 font-semibold text-sm">{selectedAppointment.address || 'Chưa cung cấp'}</p>
              </div>

              {/* ID Information */}
              <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                <h4 className="text-xs font-medium text-gray-700 mb-2">Thông tin ID</h4>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-gray-600">ID lịch hẹn:</span>
                    <span className="font-semibold text-gray-900">{selectedAppointment.appointmentId}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">ID khách hàng:</span>
                    <span className="font-semibold text-gray-900">{selectedAppointment.userId}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">ID xe:</span>
                    <span className="font-semibold text-gray-900">{selectedAppointment.vehicleId}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Tên xe:</span>
                    <span className="font-semibold text-gray-900">{selectedAppointment.vehicleName}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="bg-gray-50 px-3 py-2 rounded-b-2xl flex justify-end space-x-2">
              <button
                onClick={() => setShowDetailModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-white transition-colors font-medium text-sm"
              >
                Đóng
              </button>
              <button
                onClick={() => handleEditAppointment(selectedAppointment)}
                className="px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all font-medium shadow-lg text-sm"
              >
                Chỉnh sửa
              </button>
            </div>
          </div>
        </div>
      )}

       {/* Edit Appointment Modal */}
       {showEditModal && editingAppointment && (
         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
           <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl transform transition-all">
             {/* Header */}
             <div className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white p-4 rounded-t-2xl">
               <div className="flex justify-between items-center">
                 <div className="flex items-center space-x-3">
                   <div className="w-8 h-8 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
                     <Edit className="h-4 w-4" />
                   </div>
                   <div>
                     <h2 className="text-lg font-bold">Chỉnh sửa lịch hẹn</h2>
                     <p className="text-emerald-100 text-xs">Cập nhật thông tin cuộc hẹn</p>
                   </div>
                 </div>
                 <button
                   onClick={() => setShowEditModal(false)}
                   className="text-white hover:text-emerald-200 transition-colors p-2 hover:bg-white hover:bg-opacity-10 rounded-lg"
                   disabled={updatingAppointment}
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
                       <svg className="h-5 w-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                       </svg>
                     </div>
                   </div>
                   <div className="flex-1">
                     <h3 className="text-sm font-semibold text-blue-800 mb-1">Lưu ý về xác thực</h3>
                     <p className="text-sm text-blue-700">Để cập nhật lịch hẹn, bạn cần đăng nhập với tài khoản hợp lệ có quyền truy cập API.</p>
                   </div>
                 </div>
               </div>

               <form id="edit-form" onSubmit={handleUpdateAppointment} className="space-y-4">
                 {/* Date and Time Field */}
                 <div className="space-y-2">
                   <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700">
                     <Calendar className="h-4 w-4 text-emerald-600" />
                     <span>Ngày và giờ *</span>
                   </label>
                   <div className="relative">
                     <input
                       type="datetime-local"
                       required
                       value={editForm.appointmentDate ? new Date(editForm.appointmentDate).toISOString().slice(0, 16) : ''}
                       onChange={(e) => setEditForm({...editForm, appointmentDate: new Date(e.target.value).toISOString()})}
                       className="w-full border-2 border-gray-200 rounded-lg px-3 py-2 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 transition-all duration-200 bg-gray-50 focus:bg-white text-sm"
                     />
                     <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                       <Calendar className="h-5 w-5 text-gray-400" />
                     </div>
                   </div>
                 </div>

                 {/* Status Field */}
                 <div className="space-y-2">
                   <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700">
                     <div className="w-4 h-4 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full"></div>
                     <span>Trạng thái *</span>
                   </label>
                   <div className="relative">
                     <select
                       required
                       value={editForm.status}
                       onChange={(e) => setEditForm({...editForm, status: e.target.value})}
                       className="w-full border-2 border-gray-200 rounded-lg px-3 py-2 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 transition-all duration-200 bg-gray-50 focus:bg-white text-sm appearance-none"
                     >
                       <option value="PENDING">Chờ xác nhận</option>
                       <option value="CONFIRMED">Đã xác nhận</option>
                       <option value="CANCELLED">Đã hủy</option>
                       <option value="COMPLETED">Đã hoàn thành</option>
                     </select>
                     <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                       <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                       </svg>
                     </div>
                   </div>
                 </div>

                 {/* Customer Name Field (select from existing customers) */}
                 <div className="space-y-2">
                   <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700">
                     <User className="h-4 w-4 text-emerald-600" />
                     <span>Khách hàng *</span>
                   </label>
                   <div className="relative">
                     {customerError ? (
                       <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-sm text-red-600">{customerError}</div>
                     ) : (
                       <select
                         required
                         value={editForm.userId === 0 ? '' : editForm.userId}
                         onChange={(e) => {
                           const id = e.target.value === '' ? 0 : Number(e.target.value);
                           const found = customers.find(c => String(c.id) === String(id));
                           setEditForm(prev => ({ ...prev, userId: id, username: found ? found.name : prev.username }));
                         }}
                         className="w-full border-2 border-gray-200 rounded-lg px-3 py-2 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 transition-all duration-200 bg-gray-50 focus:bg-white text-sm appearance-none"
                       >
                         <option value="">-- Chọn khách hàng --</option>
                         {customers.map(customer => (
                           <option key={customer.id} value={customer.id}>{customer.name}</option>
                         ))}
                       </select>
                     )}
                     <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                       <User className="h-5 w-5 text-gray-400" />
                     </div>
                   </div>
                 </div>

                 {/* Vehicle Name Field */}
                 <div className="space-y-2">
                   <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700">
                     <Car className="h-4 w-4 text-emerald-600" />
                     <span>Tên xe *</span>
                   </label>
                   <div className="relative">
                     <input
                       type="text"
                       required
                       value={editForm.vehicleName}
                       onChange={(e) => setEditForm({...editForm, vehicleName: e.target.value})}
                       className="w-full border-2 border-gray-200 rounded-lg px-3 py-2 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 transition-all duration-200 bg-gray-50 focus:bg-white text-sm"
                       placeholder="Nhập tên xe"
                     />
                     <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                       <Car className="h-5 w-5 text-gray-400" />
                     </div>
                   </div>
                 </div>

                 {/* Address Field */}
                 <div className="space-y-2">
                   <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700">
                     <svg className="h-4 w-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                     </svg>
                     <span>Địa chỉ *</span>
                   </label>
                   <div className="relative">
                     <input
                       type="text"
                       required
                       value={editForm.address}
                       onChange={(e) => setEditForm({...editForm, address: e.target.value})}
                       className="w-full border-2 border-gray-200 rounded-lg px-3 py-2 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 transition-all duration-200 bg-gray-50 focus:bg-white text-sm"
                       placeholder="Nhập địa chỉ"
                     />
                     <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                       <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                       </svg>
                     </div>
                   </div>
                 </div>
               </form>
             </div>

             {/* Footer */}
             <div className="bg-gray-50 px-4 py-3 rounded-b-2xl flex justify-end space-x-2">
               <button
                 type="button"
                 onClick={() => setShowEditModal(false)}
                 className="px-4 py-2 border-2 border-gray-300 rounded-lg text-gray-700 hover:bg-white hover:border-gray-400 transition-all duration-200 font-medium text-sm"
                 disabled={updatingAppointment}
               >
                 Hủy
               </button>
               <button
                 type="submit"
                 form="edit-form"
                 className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-lg hover:from-emerald-700 hover:to-teal-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 transition-all duration-200 font-medium shadow-lg text-sm"
                 disabled={updatingAppointment}
               >
                 {updatingAppointment && (
                   <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                 )}
                 <span>{updatingAppointment ? 'Đang cập nhật...' : 'Cập nhật lịch hẹn'}</span>
               </button>
             </div>
           </div>
         </div>
       )}

      {/* Delete Appointment Confirmation Modal */}
      {showDeleteModal && appointmentToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl transform transition-all">
            {/* Header */}
            <div className="bg-gradient-to-r from-red-500 to-red-600 text-white p-4 rounded-t-2xl">
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
                    <Trash2 className="h-5 w-5" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold">Xác nhận xóa lịch hẹn</h2>
                    <p className="text-red-100 text-xs">Hành động này không thể hoàn tác</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="text-white hover:text-red-200 transition-colors p-1 hover:bg-white hover:bg-opacity-10 rounded-lg"
                  disabled={deletingAppointment}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-4">
              {/* Warning Section */}
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-sm font-semibold text-red-800 mb-1">Cảnh báo</h3>
                    <p className="text-xs text-red-700">Hành động này không thể hoàn tác. Lịch hẹn sẽ bị xóa vĩnh viễn khỏi hệ thống.</p>
                  </div>
                </div>
              </div>

              {/* Appointment Info */}
              <div className="bg-gray-50 rounded-lg p-3 mb-4">
                <h3 className="text-sm font-semibold text-gray-700 mb-2 flex items-center space-x-2">
                  <Calendar className="h-4 w-4 text-gray-600" />
                  <span>Thông tin lịch hẹn sẽ bị xóa:</span>
                </h3>
                <div className="space-y-1 text-xs">
                  <p><span className="font-medium text-gray-600">ID lịch hẹn:</span> <span className="text-gray-800">{appointmentToDelete.appointmentId}</span></p>
                  <p><span className="font-medium text-gray-600">ID khách hàng:</span> <span className="text-gray-800">{appointmentToDelete.userId}</span></p>
                  <p><span className="font-medium text-gray-600">ID xe:</span> <span className="text-gray-800">{appointmentToDelete.vehicleId}</span></p>
                  <p><span className="font-medium text-gray-600">Tên xe:</span> <span className="text-gray-800">{appointmentToDelete.vehicleName}</span></p>
                  <p><span className="font-medium text-gray-600">Khách hàng:</span> <span className="text-gray-800">{appointmentToDelete.username || 'Chưa có tên'}</span></p>
                  <p><span className="font-medium text-gray-600">Trạng thái:</span> <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(appointmentToDelete.status)}`}>
                    {getStatusText(appointmentToDelete.status)}
                  </span></p>
                  <p><span className="font-medium text-gray-600">Ngày:</span> <span className="text-gray-800">{formatDate(appointmentToDelete.appointmentDate)}</span></p>
                  <p><span className="font-medium text-gray-600">Giờ:</span> <span className="text-gray-800">{formatTime(appointmentToDelete.appointmentDate)}</span></p>
                </div>
              </div>

              {/* Authentication Notice */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0">
                    <svg className="h-4 w-4 text-blue-500" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xs font-semibold text-blue-800 mb-1">Lưu ý về xác thực</h3>
                    <p className="text-xs text-blue-700">Để xóa lịch hẹn, bạn cần đăng nhập với tài khoản hợp lệ có quyền truy cập API.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="bg-gray-50 px-3 py-2 rounded-b-2xl flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 border-2 border-gray-300 rounded-lg text-gray-700 hover:bg-white hover:border-gray-400 transition-all duration-200 font-medium text-sm"
                disabled={deletingAppointment}
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="px-4 py-2 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-lg hover:from-red-700 hover:to-red-800 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 transition-all duration-200 font-medium text-sm shadow-lg"
                disabled={deletingAppointment}
              >
                {deletingAppointment && (
                  <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
                )}
                <Trash2 className="h-3 w-3" />
                <span>{deletingAppointment ? 'Đang xóa...' : 'Xóa lịch hẹn'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
      </div>
    </div>
  );
};
