import React, { useState, useEffect, useCallback } from 'react';
import { Calendar, Clock, User, Car, Filter, Search, Eye, Edit, Trash2 } from 'lucide-react';
import { testDriveService, TestDriveAppointment, UpdateTestDriveAppointmentRequest } from '../../../services/testDriveService';
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
    vehicleName: ''
  });
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
      vehicleName: appointment.vehicleName
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
        vehicleName: editForm.vehicleName
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
    return new Date(dateString).toLocaleTimeString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit'
    });
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
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Lịch lái thử</h1>
        <div className="flex items-center space-x-4">
          <span className="text-sm text-gray-600">
            Tổng: {appointments.length} lịch hẹn
          </span>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Tìm kiếm theo xe, khách hàng, ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
            />
          </div>

          {/* Status Filter */}
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 appearance-none"
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
            className="w-full bg-black hover:bg-gray-800 text-white px-4 py-2 rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
          >
            {loading ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            ) : (
              <span>Làm mới</span>
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
      {!loading && (
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
      )}

      {/* Appointments List */}
      {!loading && filteredAppointments.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">
              Danh sách lịch hẹn ({filteredAppointments.length})
            </h2>
          </div>
          
          <div className="divide-y divide-gray-200">
            {filteredAppointments.map((appointment) => (
              <div key={appointment.appointmentId} className="p-6 hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-4">
                      <div className="flex-shrink-0">
                        <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                          <Car className="h-6 w-6 text-green-600" />
                        </div>
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900 truncate">
                            {appointment.vehicleName}
                          </h3>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(appointment.status)}`}>
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
                  </div>
                  
                  <div className="flex items-center space-x-2 ml-4">
                    <button
                      onClick={() => handleViewAppointment(appointment)}
                      className="text-blue-600 hover:text-blue-800 p-2 rounded-lg hover:bg-blue-50"
                      title="Xem chi tiết"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleEditAppointment(appointment)}
                      className="text-green-600 hover:text-green-800 p-2 rounded-lg hover:bg-green-50"
                      title="Chỉnh sửa"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteAppointment(appointment)}
                      className="text-red-600 hover:text-red-800 p-2 rounded-lg hover:bg-red-50"
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
          <div className="bg-white rounded-lg max-w-md w-full">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-900">Chi tiết lịch hẹn</h2>
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Xe</label>
                  <p className="text-lg font-semibold text-gray-900">{selectedAppointment.vehicleName}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Khách hàng</label>
                  <p className="text-lg font-semibold text-gray-900">
                    {selectedAppointment.username || 'Chưa có tên'}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Ngày</label>
                  <p className="text-gray-900">{formatDate(selectedAppointment.appointmentDate)}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Giờ</label>
                  <p className="text-gray-900">{formatTime(selectedAppointment.appointmentDate)}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Trạng thái</label>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(selectedAppointment.status)}`}>
                    {getStatusText(selectedAppointment.status)}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">ID lịch hẹn</label>
                    <p className="text-gray-900">{selectedAppointment.appointmentId}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">ID khách hàng</label>
                    <p className="text-gray-900">{selectedAppointment.userId}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">ID xe</label>
                    <p className="text-gray-900">{selectedAppointment.vehicleId}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Tên xe</label>
                    <p className="text-gray-900">{selectedAppointment.vehicleName}</p>
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-4 pt-6">
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Đóng
                </button>
                <button 
                  onClick={() => handleEditAppointment(selectedAppointment)}
                  className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800"
                >
                  Chỉnh sửa
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Appointment Modal */}
      {showEditModal && editingAppointment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-900">Chỉnh sửa lịch hẹn</h2>
                <button
                  onClick={() => setShowEditModal(false)}
                  className="text-gray-500 hover:text-gray-700"
                  disabled={updatingAppointment}
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
                      <p>Để cập nhật lịch hẹn, bạn cần đăng nhập với tài khoản hợp lệ có quyền truy cập API.</p>
                    </div>
                  </div>
                </div>
              </div>

              <form onSubmit={handleUpdateAppointment} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ngày và giờ *
                  </label>
                  <input
                    type="datetime-local"
                    required
                    value={editForm.appointmentDate ? new Date(editForm.appointmentDate).toISOString().slice(0, 16) : ''}
                    onChange={(e) => setEditForm({...editForm, appointmentDate: new Date(e.target.value).toISOString()})}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Trạng thái *
                  </label>
                  <select
                    required
                    value={editForm.status}
                    onChange={(e) => setEditForm({...editForm, status: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500"
                  >
                    <option value="PENDING">Chờ xác nhận</option>
                    <option value="CONFIRMED">Đã xác nhận</option>
                    <option value="CANCELLED">Đã hủy</option>
                    <option value="COMPLETED">Đã hoàn thành</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tên khách hàng *
                  </label>
                  <input
                    type="text"
                    required
                    value={editForm.username}
                    onChange={(e) => setEditForm({...editForm, username: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500"
                    placeholder="Nhập tên khách hàng"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tên xe *
                  </label>
                  <input
                    type="text"
                    required
                    value={editForm.vehicleName}
                    onChange={(e) => setEditForm({...editForm, vehicleName: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500"
                    placeholder="Nhập tên xe"
                  />
                </div>

                <div className="flex justify-end space-x-4 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowEditModal(false)}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                    disabled={updatingAppointment}
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                    disabled={updatingAppointment}
                  >
                    {updatingAppointment && (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    )}
                    <span>{updatingAppointment ? 'Đang cập nhật...' : 'Cập nhật lịch hẹn'}</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Delete Appointment Confirmation Modal */}
      {showDeleteModal && appointmentToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-900">Xác nhận xóa lịch hẹn</h2>
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="text-gray-500 hover:text-gray-700"
                  disabled={deletingAppointment}
                >
                  ✕
                </button>
              </div>

              {/* Warning Notice */}
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
                      <p>Hành động này không thể hoàn tác. Lịch hẹn sẽ bị xóa vĩnh viễn khỏi hệ thống.</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Appointment Info */}
              <div className="bg-gray-50 rounded-lg p-4 mb-4">
                <h3 className="text-sm font-medium text-gray-700 mb-2">Thông tin lịch hẹn sẽ bị xóa:</h3>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <p><span className="font-medium">ID lịch hẹn:</span> {appointmentToDelete.appointmentId}</p>
                  <p><span className="font-medium">ID khách hàng:</span> {appointmentToDelete.userId}</p>
                  <p><span className="font-medium">ID xe:</span> {appointmentToDelete.vehicleId}</p>
                  <p><span className="font-medium">Tên xe:</span> {appointmentToDelete.vehicleName}</p>
                  <p><span className="font-medium">Khách hàng:</span> <span className="font-semibold text-gray-900">{appointmentToDelete.username || 'Chưa có tên'}</span></p>
                  <p><span className="font-medium">Trạng thái:</span> {getStatusText(appointmentToDelete.status)}</p>
                  <p><span className="font-medium">Ngày:</span> {formatDate(appointmentToDelete.appointmentDate)}</p>
                  <p><span className="font-medium">Giờ:</span> {formatTime(appointmentToDelete.appointmentDate)}</p>
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
                      <p>Để xóa lịch hẹn, bạn cần đăng nhập với tài khoản hợp lệ có quyền truy cập API.</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-4 pt-4">
                <button
                  type="button"
                  onClick={() => setShowDeleteModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                  disabled={deletingAppointment}
                >
                  Hủy
                </button>
                <button
                  type="button"
                  onClick={handleConfirmDelete}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                  disabled={deletingAppointment}
                >
                  {deletingAppointment && (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  )}
                  <span>{deletingAppointment ? 'Đang xóa...' : 'Xóa lịch hẹn'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
