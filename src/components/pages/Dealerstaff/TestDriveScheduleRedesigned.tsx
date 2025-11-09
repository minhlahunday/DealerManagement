import React, { useState, useEffect, useCallback } from 'react';
import { Calendar, Clock, User, Car, Search, Eye, Edit, Trash2 } from 'lucide-react';
import { testDriveService, TestDriveAppointment, UpdateTestDriveAppointmentRequest } from '../../../services/testDriveService';
import { useAuth } from '../../../contexts/AuthContext';

export const TestDriveScheduleRedesigned: React.FC = () => {
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
    vehicleName: '',
    address: ''
  });
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletingAppointment, setDeletingAppointment] = useState(false);
  const [appointmentToDelete, setAppointmentToDelete] = useState<TestDriveAppointment | null>(null);

  // Fetch test drive appointments from API
  const fetchAppointments = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      console.log('🔍 Fetching test drive appointments from API...');
      const response = await testDriveService.getTestDriveAppointments();
      console.log('📡 Test Drive Appointments API Response:', response);

      if (response.data && Array.isArray(response.data)) {
        console.log('✅ Test drive appointments loaded from API:', response.data.length);
        setAppointments(response.data);
      } else {
        console.log('⚠️ No appointments from API, using empty array');
        setAppointments([]);
      }
    } catch (error) {
      console.error('❌ Failed to fetch test drive appointments:', error);
      setError(error instanceof Error ? error.message : 'Lỗi khi tải danh sách lịch hẹn');
      setAppointments([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Load appointments on component mount
  useEffect(() => {
    fetchAppointments();
  }, [fetchAppointments]);

  // Check token on mount
  useEffect(() => {
    console.log('=== TestDriveSchedule Component Mounted ===');
    checkToken();
  }, [checkToken]);

  // Filter appointments
  const filteredAppointments = appointments.filter(appointment => {
    const matchesSearch = searchTerm === '' || 
      appointment.vehicleName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      appointment.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      appointment.appointmentId.toString().includes(searchTerm);
    
    const matchesStatus = statusFilter === 'ALL' || appointment.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    
    // If the date was stored as UTC but we want to display it as Vietnam time
    // We need to add 7 hours to UTC time to get Vietnam time
    let formattedTime;
    if (dateString.includes('Z') || dateString.includes('+')) {
      // This is a UTC date string, convert to Vietnam time
      const vietnamTime = new Date(date.getTime() + (7 * 60 * 60 * 1000));
      formattedTime = vietnamTime.toLocaleTimeString('vi-VN', {
        hour: '2-digit',
        minute: '2-digit'
      });
    } else {
      // This is a local date string, use as is
      formattedTime = date.toLocaleTimeString('vi-VN', {
        hour: '2-digit',
        minute: '2-digit'
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

  const handleViewAppointment = (appointment: TestDriveAppointment) => {
    setSelectedAppointment(appointment);
    setShowDetailModal(true);
  };

  const handleEditAppointment = (appointment: TestDriveAppointment) => {
    console.log('✏️ Editing appointment:', appointment.appointmentId);
    setSelectedAppointment(null);
    setEditingAppointment(appointment);
    setEditForm({
      appointmentDate: appointment.appointmentDate,
      status: appointment.status,
      username: appointment.username,
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
      const appointmentData: UpdateTestDriveAppointmentRequest = {
        appointmentId: editingAppointment.appointmentId,
        appointmentDate: editForm.appointmentDate,
        status: editForm.status,
        userId: editingAppointment.userId,
        vehicleId: editingAppointment.vehicleId,
        username: editForm.username.trim() || 'Khách hàng',
        vehicleName: editForm.vehicleName,
        address: editForm.address.trim() || 'Chưa cung cấp'
      };

      console.log('🔄 Updating appointment with data:', appointmentData);
      const response = await testDriveService.updateTestDriveAppointment(editingAppointment.appointmentId.toString(), appointmentData);

      if (response.success) {
        console.log('✅ Appointment updated successfully:', response);
        setShowEditModal(false);
        setEditingAppointment(null);
        fetchAppointments(); // Refresh the list
      } else {
        console.error('❌ Failed to update appointment:', response.message);
        setError(response.message || 'Không thể cập nhật lịch hẹn');
      }
    } catch (error) {
      console.error('❌ Failed to update appointment:', error);
      setError(error instanceof Error ? error.message : 'Lỗi khi cập nhật lịch hẹn');
    } finally {
      setUpdatingAppointment(false);
    }
  };

  const handleDeleteAppointment = (appointment: TestDriveAppointment) => {
    setAppointmentToDelete(appointment);
    setShowDeleteModal(true);
  };

  const confirmDeleteAppointment = async () => {
    if (!appointmentToDelete) return;

    setDeletingAppointment(true);
    try {
      const response = await testDriveService.deleteTestDriveAppointment(appointmentToDelete.appointmentId.toString());
      
      if (response.success) {
        console.log('✅ Appointment deleted successfully');
        setShowDeleteModal(false);
        setAppointmentToDelete(null);
        fetchAppointments();
      } else {
        console.error('❌ Failed to delete appointment:', response.message);
        setError(response.message || 'Không thể xóa lịch hẹn');
      }
    } catch (error) {
      console.error('❌ Failed to delete appointment:', error);
      setError(error instanceof Error ? error.message : 'Lỗi khi xóa lịch hẹn');
    } finally {
      setDeletingAppointment(false);
    }
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Lịch lái thử</h1>
            <p className="text-gray-600 mt-2">Quản lý và theo dõi các cuộc hẹn lái thử xe</p>
          </div>
          <button
            onClick={fetchAppointments}
            className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-3 rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all shadow-lg flex items-center space-x-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <span>Làm mới</span>
          </button>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Tìm kiếm theo xe, khách hàng, ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
          <div className="md:w-64">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="ALL">Tất cả trạng thái</option>
              <option value="PENDING">Chờ xác nhận</option>
              <option value="CONFIRMED">Đã xác nhận</option>
              <option value="CANCELLED">Đã hủy</option>
              <option value="COMPLETED">Đã hoàn thành</option>
            </select>
          </div>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Lỗi</h3>
              <div className="mt-2 text-sm text-red-700">
                <p>{error}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Đang tải danh sách lịch hẹn...</p>
        </div>
      )}

      {/* Appointments List */}
      {!loading && filteredAppointments.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">
              Danh sách lịch hẹn ({filteredAppointments.length})
            </h2>
          </div>
          <div className="divide-y divide-gray-200">
            {filteredAppointments.map((appointment) => (
              <div key={appointment.appointmentId} className="p-6 hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center">
                      <Car className="h-6 w-6 text-white" />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900 truncate">
                          {appointment.vehicleName}
                        </h3>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(appointment.status)}`}>
                          {getStatusText(appointment.status)}
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm text-gray-600">
                        <div className="flex items-center space-x-2">
                          <Calendar className="h-4 w-4" />
                          <span>{formatDate(appointment.appointmentDate)}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Clock className="h-4 w-4" />
                          <span>{formatTime(appointment.appointmentDate)}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <User className="h-4 w-4" />
                          <span className="font-medium text-gray-900">
                            {appointment.username || 'Chưa có tên'}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="text-xs bg-gray-100 px-2 py-1 rounded">ID: {appointment.appointmentId}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2 ml-4">
                    <button
                      onClick={() => handleViewAppointment(appointment)}
                      className="text-blue-600 hover:text-blue-800 p-2 rounded-lg hover:bg-blue-50 transition-colors"
                      title="Xem chi tiết"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleEditAppointment(appointment)}
                      className="text-green-600 hover:text-green-800 p-2 rounded-lg hover:bg-green-50 transition-colors"
                      title="Chỉnh sửa"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteAppointment(appointment)}
                      className="text-red-600 hover:text-red-800 p-2 rounded-lg hover:bg-red-50 transition-colors"
                      title="Xóa"
                    >
                      <Trash2 className="h-4 w-4" />
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
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
          <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <Search className="h-12 w-12 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Không tìm thấy lịch hẹn</h3>
          <p className="text-gray-600">Thử thay đổi từ khóa tìm kiếm hoặc bộ lọc trạng thái.</p>
        </div>
      )}

      {/* No Data State */}
      {!loading && appointments.length === 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
          <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <Calendar className="h-12 w-12 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Chưa có lịch hẹn nào</h3>
          <p className="text-gray-600">Hiện tại chưa có lịch hẹn lái thử nào trong hệ thống.</p>
        </div>
      )}

      {/* Appointment Detail Modal - Beautiful Design */}
      {showDetailModal && selectedAppointment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-lg w-full shadow-2xl">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6 rounded-t-xl">
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
                    <Calendar className="h-5 w-5" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold">Chi tiết lịch hẹn</h2>
                    <p className="text-blue-100 text-sm">Thông tin chi tiết về cuộc hẹn</p>
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
            <div className="p-6">
              {/* Main Info Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-lg border border-green-200">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
                      <Car className="h-4 w-4 text-white" />
                    </div>
                    <div>
                      <p className="text-sm text-green-600 font-medium">Xe</p>
                      <p className="text-lg font-bold text-green-900">{selectedAppointment.vehicleName}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-lg border border-purple-200">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-purple-500 rounded-lg flex items-center justify-center">
                      <User className="h-4 w-4 text-white" />
                    </div>
                    <div>
                      <p className="text-sm text-purple-600 font-medium">Khách hàng</p>
                      <p className="text-lg font-bold text-purple-900">
                        {selectedAppointment.username || 'Chưa có tên'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Date & Time */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg border border-blue-200 mb-6">
                <div className="flex items-center space-x-3 mb-3">
                  <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                    <Clock className="h-4 w-4 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-blue-900">Thời gian hẹn</h3>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-blue-600 font-medium">Ngày</p>
                    <p className="text-blue-900 font-semibold">{formatDate(selectedAppointment.appointmentDate)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-blue-600 font-medium">Giờ</p>
                    <p className="text-blue-900 font-semibold">{formatTime(selectedAppointment.appointmentDate)}</p>
                  </div>
                </div>
              </div>

              {/* Status */}
              <div className="mb-6">
                <p className="text-sm text-gray-600 font-medium mb-2">Trạng thái</p>
                <span className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium ${getStatusColor(selectedAppointment.status)}`}>
                  {getStatusText(selectedAppointment.status)}
                </span>
              </div>

              {/* ID Information */}
              {/* <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <h4 className="text-sm font-medium text-gray-700 mb-3">Thông tin ID</h4>
                <div className="grid grid-cols-2 gap-3 text-sm">
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
              </div> */}
            </div>

            {/* Footer */}
            <div className="bg-gray-50 px-6 py-4 rounded-b-xl flex justify-end space-x-3">
              <button
                onClick={() => setShowDetailModal(false)}
                className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-white transition-colors font-medium"
              >
                Đóng
              </button>
              <button
                onClick={() => handleEditAppointment(selectedAppointment)}
                className="px-6 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all font-medium shadow-lg"
              >
                Chỉnh sửa
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Appointment Modal - Beautiful Design */}
      {showEditModal && editingAppointment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-lg w-full shadow-2xl">
            {/* Header */}
            <div className="bg-gradient-to-r from-green-600 to-green-700 text-white p-6 rounded-t-xl">
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
                    <Edit className="h-5 w-5" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold">Chỉnh sửa lịch hẹn</h2>
                    <p className="text-green-100 text-sm">Cập nhật thông tin cuộc hẹn</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowEditModal(false)}
                  className="text-white hover:text-green-200 transition-colors"
                  disabled={updatingAppointment}
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
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4 mb-6">
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                      <svg className="h-4 w-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                      </svg>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-blue-800 mb-1">Lưu ý về xác thực</h3>
                    <p className="text-sm text-blue-700">Để cập nhật lịch hẹn, bạn cần đăng nhập với tài khoản hợp lệ có quyền truy cập API.</p>
                  </div>
                </div>
              </div>

              <form onSubmit={handleUpdateAppointment} className="space-y-6">
                {/* Date & Time */}
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg border border-blue-200">
                  <div className="flex items-center space-x-3 mb-3">
                    <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                      <Clock className="h-4 w-4 text-white" />
                    </div>
                    <h3 className="text-lg font-semibold text-blue-900">Thời gian hẹn</h3>
                  </div>
                  <input
                    type="datetime-local"
                    required
                    value={editForm.appointmentDate ? new Date(editForm.appointmentDate).toISOString().slice(0, 16) : ''}
                    onChange={(e) => setEditForm({...editForm, appointmentDate: new Date(e.target.value).toISOString()})}
                    className="w-full border border-blue-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                  />
                </div>

                {/* Status */}
                <div className="bg-gradient-to-r from-yellow-50 to-orange-50 p-4 rounded-lg border border-yellow-200">
                  <div className="flex items-center space-x-3 mb-3">
                    <div className="w-8 h-8 bg-yellow-500 rounded-lg flex items-center justify-center">
                      <svg className="h-4 w-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-semibold text-yellow-900">Trạng thái</h3>
                  </div>
                  <select
                    required
                    value={editForm.status}
                    onChange={(e) => setEditForm({...editForm, status: e.target.value})}
                    className="w-full border border-yellow-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 bg-white"
                  >
                    <option value="PENDING">Chờ xác nhận</option>
                    <option value="CONFIRMED">Đã xác nhận</option>
                    <option value="CANCELLED">Đã hủy</option>
                    <option value="COMPLETED">Đã hoàn thành</option>
                  </select>
                </div>

                {/* Customer Info */}
                <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-4 rounded-lg border border-purple-200">
                  <div className="flex items-center space-x-3 mb-3">
                    <div className="w-8 h-8 bg-purple-500 rounded-lg flex items-center justify-center">
                      <User className="h-4 w-4 text-white" />
                    </div>
                    <h3 className="text-lg font-semibold text-purple-900">Thông tin khách hàng</h3>
                  </div>
                  <input
                    type="text"
                    required
                    value={editForm.username}
                    onChange={(e) => setEditForm({...editForm, username: e.target.value})}
                    className="w-full border border-purple-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white"
                    placeholder="Nhập tên khách hàng"
                  />
                </div>

                {/* Vehicle Info */}
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-lg border border-green-200">
                  <div className="flex items-center space-x-3 mb-3">
                    <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
                      <Car className="h-4 w-4 text-white" />
                    </div>
                    <h3 className="text-lg font-semibold text-green-900">Thông tin xe</h3>
                  </div>
                  <input
                    type="text"
                    required
                    value={editForm.vehicleName}
                    onChange={(e) => setEditForm({...editForm, vehicleName: e.target.value})}
                    className="w-full border border-green-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white"
                    placeholder="Nhập tên xe"
                  />
                </div>

                {/* Address Info */}
                <div className="bg-gradient-to-r from-orange-50 to-amber-50 p-4 rounded-lg border border-orange-200">
                  <div className="flex items-center space-x-3 mb-3">
                    <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
                      <svg className="h-4 w-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-semibold text-orange-900">Địa chỉ</h3>
                  </div>
                  <input
                    type="text"
                    required
                    value={editForm.address}
                    onChange={(e) => setEditForm({...editForm, address: e.target.value})}
                    className="w-full border border-orange-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 bg-white"
                    placeholder="Nhập địa chỉ"
                  />
                </div>
              </form>
            </div>

            {/* Footer */}
            <div className="bg-gray-50 px-6 py-4 rounded-b-xl flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setShowEditModal(false)}
                className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-white transition-colors font-medium"
                disabled={updatingAppointment}
              >
                Hủy
              </button>
              <button
                type="submit"
                onClick={handleUpdateAppointment}
                className="px-6 py-2 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg hover:from-green-700 hover:to-green-800 transition-all font-medium shadow-lg disabled:opacity-50"
                disabled={updatingAppointment}
              >
                {updatingAppointment ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Đang cập nhật...</span>
                  </div>
                ) : (
                  'Cập nhật lịch hẹn'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && appointmentToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-md w-full shadow-2xl">
            <div className="p-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                  <Trash2 className="h-5 w-5 text-red-600" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Xác nhận xóa</h2>
                  <p className="text-gray-600">Hành động này không thể hoàn tác</p>
                </div>
              </div>

              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                <p className="text-red-800">
                  Bạn có chắc chắn muốn xóa lịch hẹn cho <strong>{appointmentToDelete.vehicleName}</strong> của khách hàng <strong>{appointmentToDelete.username}</strong>?
                </p>
                <div className="mt-2 text-sm text-red-700">
                  <p><span className="font-medium">Ngày:</span> {formatDate(appointmentToDelete.appointmentDate)}</p>
                  <p><span className="font-medium">Giờ:</span> {formatTime(appointmentToDelete.appointmentDate)}</p>
                </div>
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                  disabled={deletingAppointment}
                >
                  Hủy
                </button>
                <button
                  onClick={confirmDeleteAppointment}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
                  disabled={deletingAppointment}
                >
                  {deletingAppointment ? 'Đang xóa...' : 'Xóa lịch hẹn'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
