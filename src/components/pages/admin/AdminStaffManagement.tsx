import React, { useState, useEffect } from 'react';
import { Search, Plus, Trash2, UserCheck, UserX, Filter, X, Edit } from 'lucide-react';
import { AdminLayout } from './AdminLayout';
import { authService, User } from '../../../services/authService';

interface Staff {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  position: string;
  department: string;
  startDate: string;
  status: 'active' | 'inactive' | 'pending';
  avatar?: string;
  salary: number;
  address: string;
}

export const AdminStaffManagement: React.FC = () => {
  const [staffList, setStaffList] = useState<Staff[]>([]);

  const [filteredStaff, setFilteredStaff] = useState<Staff[]>(staffList);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingStaffId, setEditingStaffId] = useState<string | null>(null);
  const [newStaff, setNewStaff] = useState({
    username: '',
    fullName: '',
    email: '',
    phone: '',
    address: '',
    password: '',
    roleId: '',
    companyName: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [fetching, setFetching] = useState(false);

  // Helper function to map roleId to role name
  const getUserRoleName = (roleId: number): string => {
    const roleMap: { [key: number]: string } = {
      1: 'Admin',
      2: 'Dealer',
      3: 'EVM Staff',
      4: 'Customer'
    };
    return roleMap[roleId] || 'Unknown';
  };

  // Fetch users from API
  useEffect(() => {
    const loadUsers = async () => {
      setFetching(true);
      try {
        const response = await authService.getUserManagement();
        
        // Filter out admin users (roleId = 1) and map to Staff format
        const mappedStaff: Staff[] = response.data
          .filter((user: User) => user.roleId !== 1) // Exclude admin users
          .map((user: User) => ({
            id: user.userId.toString(),
            fullName: user.fullName,
            email: user.email,
            phone: user.phone,
            position: getUserRoleName(user.roleId),
            department: user.companyName || '',
            startDate: new Date().toISOString().split('T')[0],
            status: 'active' as const,
            address: user.address,
            salary: 0
          }));
        
        setStaffList(mappedStaff);
        console.log('✅ Staff list updated:', mappedStaff);
      } catch (err: unknown) {
        console.error('❌ Lỗi khi lấy danh sách người dùng:', err);
        const errorMessage = err instanceof Error ? err.message : 'Lỗi không xác định';
        setError('Không thể tải danh sách nhân viên: ' + errorMessage);
      } finally {
        setFetching(false);
      }
    };

    loadUsers();
  }, []);

  // Hàm trả về các vai trò có thể tạo - chỉ dành cho Admin
  const getAvailableRoles = () => {
    // Admin có thể tạo các vai trò: Dealer (2), EVM Staff (3), Customer (4)
    return [
      { value: '2', label: 'Dealer' },
      { value: '3', label: 'EVM Staff' },
      { value: '4', label: 'Customer' }
    ];
  };

  useEffect(() => {
    let filtered = staffList;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(staff =>
        staff.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        staff.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        staff.phone.includes(searchTerm)
      );
    }

    setFilteredStaff(filtered);
  }, [staffList, searchTerm]);

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      active: { label: 'Hoạt động', color: 'bg-green-100 text-green-800 border-green-200' },
      inactive: { label: 'Đã khóa', color: 'bg-red-100 text-red-800 border-red-200' },
      pending: { label: 'Chờ duyệt', color: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
    };

    const config = statusConfig[status as keyof typeof statusConfig];
    return (
      <span className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold border ${config.color}`}>
        {config.label}
      </span>
    );
  };

  const handleAddStaff = () => {
    setNewStaff({
      username: '',
      fullName: '',
      email: '',
      phone: '',
      address: '',
      password: '',
      roleId: '',
      companyName: ''
    });
    setError(null);
    setSuccess(null);
    setShowAddModal(true);
  };

  const handleSaveNewStaff = async () => {
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      // Prepare data for POST /api/UserManagement
      const userData = {
        userId: 0, // API will assign the actual ID
        username: newStaff.username,
        email: newStaff.email,
        password: newStaff.password,
        roleId: parseInt(newStaff.roleId),
        fullName: newStaff.fullName,
        phone: newStaff.phone,
        address: newStaff.address,
        companyName: newStaff.companyName
      };

      // Call create user API
      const result = await authService.createUser(userData);

      if (result.success) {
        setSuccess('Tạo người dùng thành công!');
        
        // Reload user list
        window.location.reload();
        
        // Close modal after 2 seconds
        setTimeout(() => {
          setShowAddModal(false);
          setSuccess(null);
        }, 2000);
      } else {
        setError(result.message);
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Có lỗi xảy ra khi tạo người dùng';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setNewStaff(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleEditStaff = async (staffId: string) => {
    try {
      setLoading(true);
      const user = await authService.getUserById(parseInt(staffId));
      setNewStaff({
        username: user.username,
        fullName: user.fullName,
        email: user.email,
        phone: user.phone,
        address: user.address,
        password: '', // Don't show password
        roleId: user.roleId.toString(),
        companyName: user.companyName || ''
      });
      setEditingStaffId(staffId);
      setShowEditModal(true);
      setError(null);
      setSuccess(null);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Có lỗi xảy ra khi lấy thông tin người dùng';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStaff = async () => {
    if (!editingStaffId) return;
    
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const userData = {
        userId: parseInt(editingStaffId),
        username: newStaff.username,
        email: newStaff.email,
        password: newStaff.password || 'dummy', // If not changed, send dummy value
        roleId: parseInt(newStaff.roleId),
        fullName: newStaff.fullName,
        phone: newStaff.phone,
        address: newStaff.address,
        companyName: newStaff.companyName
      };

      const result = await authService.updateUser(parseInt(editingStaffId), userData);

      if (result.success) {
        setSuccess('Cập nhật người dùng thành công!');
        window.location.reload();
        setTimeout(() => {
          setShowEditModal(false);
          setEditingStaffId(null);
          setSuccess(null);
        }, 2000);
      } else {
        setError(result.message);
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Có lỗi xảy ra khi cập nhật người dùng';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteStaff = async (staffId: string) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa nhân viên này?')) {
      setLoading(true);
      try {
        const result = await authService.deleteUser(parseInt(staffId));
        if (result.success) {
          setSuccess('Xóa người dùng thành công!');
          window.location.reload();
        } else {
          setError(result.message);
        }
      } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : 'Có lỗi xảy ra khi xóa người dùng';
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    }
  };


  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Quản lý nhân viên</h1>
          <p className="text-gray-600">Quản lý thông tin nhân viên trong hệ thống</p>
        </div>

        {/* Global Error Display */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-400 text-red-700 rounded-lg shadow-sm">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <X className="h-5 w-5" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Search and Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Tìm kiếm theo tên, email, số điện thoại..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              />
            </div>

            {/* Add Staff Button */}
            <button
              onClick={handleAddStaff}
              className="bg-black hover:bg-gray-800 text-white px-6 py-2.5 rounded-lg font-medium flex items-center justify-center space-x-2 transition-colors shadow-sm"
            >
              <Plus className="h-5 w-5" />
              <span>Thêm nhân viên</span>
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl shadow-sm border border-blue-200 p-6 transition-transform hover:scale-105">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-600 font-medium mb-1">Tổng nhân viên</p>
                <p className="text-3xl font-bold text-blue-900">{staffList.length}</p>
              </div>
              <div className="bg-blue-200 p-3 rounded-full">
                <UserCheck className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl shadow-sm border border-green-200 p-6 transition-transform hover:scale-105">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-600 font-medium mb-1">Hoạt động</p>
                <p className="text-3xl font-bold text-green-900">
                  {staffList.filter(s => s.status === 'active').length}
                </p>
              </div>
              <div className="bg-green-200 p-3 rounded-full">
                <UserCheck className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-xl shadow-sm border border-red-200 p-6 transition-transform hover:scale-105">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-red-600 font-medium mb-1">Đã khóa</p>
                <p className="text-3xl font-bold text-red-900">
                  {staffList.filter(s => s.status === 'inactive').length}
                </p>
              </div>
              <div className="bg-red-200 p-3 rounded-full">
                <UserX className="h-6 w-6 text-red-600" />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-xl shadow-sm border border-yellow-200 p-6 transition-transform hover:scale-105">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-yellow-600 font-medium mb-1">Chờ duyệt</p>
                <p className="text-3xl font-bold text-yellow-900">
                  {staffList.filter(s => s.status === 'pending').length}
                </p>
              </div>
              <div className="bg-yellow-200 p-3 rounded-full">
                <Filter className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Staff Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Nhân viên
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Vai trò / Công ty
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Trạng thái
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Thao tác
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredStaff.map((staff) => (
                  <tr key={staff.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-5">
                      <div className="flex items-center">
                        <div className="h-12 w-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center shadow-sm">
                          <span className="text-lg font-semibold text-white">
                            {staff.fullName.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-semibold text-gray-900">{staff.fullName}</div>
                          <div className="text-sm text-gray-500 mt-0.5">{staff.email}</div>
                          <div className="text-xs text-gray-400 mt-0.5">{staff.phone}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{staff.position}</div>
                        {staff.department && (
                          <div className="text-xs text-gray-500 mt-1">{staff.department}</div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      {getStatusBadge(staff.status)}
                    </td>
                    <td className="px-6 py-5 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => handleEditStaff(staff.id)}
                          className="p-2 rounded-lg text-blue-600 hover:bg-blue-50 transition-colors"
                          title="Chỉnh sửa nhân viên"
                        >
                          <Edit className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => handleDeleteStaff(staff.id)}
                          className="p-2 rounded-lg text-red-600 hover:bg-red-50 transition-colors"
                          title="Xóa nhân viên"
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredStaff.length === 0 && !fetching && (
            <div className="text-center py-16">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-gray-100 mb-4">
                <UserX className="h-6 w-6 text-gray-400" />
              </div>
              <p className="text-gray-500 font-medium">Không tìm thấy nhân viên nào</p>
              <p className="text-sm text-gray-400 mt-1">Thử tìm kiếm với từ khóa khác</p>
            </div>
          )}

          {fetching && (
            <div className="text-center py-16">
              <div className="inline-block animate-spin rounded-full h-10 w-10 border-4 border-gray-200 border-t-blue-600"></div>
              <p className="text-gray-500 mt-4 font-medium">Đang tải dữ liệu...</p>
            </div>
          )}
        </div>
      </div>

      {/* Add Staff Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-hidden flex flex-col">
            {/* Modal Header */}
            <div className="px-6 py-5 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Thêm nhân viên mới</h2>
                  <p className="text-sm text-gray-500 mt-1">Điền thông tin để tạo tài khoản mới</p>
                </div>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-2 rounded-lg transition-colors"
                  disabled={loading}
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="overflow-y-auto flex-1 px-6 py-4">
              {/* Hiển thị thông báo lỗi */}
              {error && (
                <div className="mb-4 p-3 bg-red-50 border-l-4 border-red-400 text-red-700 rounded-lg">
                  {error}
                </div>
              )}

              {/* Hiển thị thông báo thành công */}
              {success && (
                <div className="mb-4 p-3 bg-green-50 border-l-4 border-green-400 text-green-700 rounded-lg">
                  {success}
                </div>
              )}

              <form onSubmit={(e) => { e.preventDefault(); handleSaveNewStaff(); }} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Tên đăng nhập <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="username"
                    required
                    value={newStaff.username}
                    onChange={handleInputChange}
                    disabled={loading}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 transition-colors"
                    placeholder="Nhập tên đăng nhập"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Họ và tên <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="fullName"
                    required
                    value={newStaff.fullName}
                    onChange={handleInputChange}
                    disabled={loading}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 transition-colors"
                    placeholder="Nhập họ và tên đầy đủ"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    name="email"
                    required
                    value={newStaff.email}
                    onChange={handleInputChange}
                    disabled={loading}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 transition-colors"
                    placeholder="example@email.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Số điện thoại <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    required
                    value={newStaff.phone}
                    onChange={handleInputChange}
                    disabled={loading}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 transition-colors"
                    placeholder="0123456789"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Địa chỉ
                  </label>
                  <input
                    type="text"
                    name="address"
                    value={newStaff.address}
                    onChange={handleInputChange}
                    disabled={loading}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 transition-colors"
                    placeholder="Nhập địa chỉ (tùy chọn)"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Mật khẩu <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="password"
                    name="password"
                    required
                    value={newStaff.password}
                    onChange={handleInputChange}
                    disabled={loading}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 transition-colors"
                    placeholder="Tối thiểu 6 ký tự"
                    minLength={6}
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Vai trò <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="roleId"
                    required
                    value={newStaff.roleId}
                    onChange={handleInputChange}
                    disabled={loading}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 transition-colors"
                  >
                    <option value="">Chọn vai trò</option>
                    {getAvailableRoles().map((role) => (
                      <option key={role.value} value={role.value}>
                        {role.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Tên công ty
                  </label>
                  <input
                    type="text"
                    name="companyName"
                    value={newStaff.companyName}
                    onChange={handleInputChange}
                    disabled={loading}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 transition-colors"
                    placeholder="Nhập tên công ty (tùy chọn)"
                  />
                </div>
              </form>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex space-x-3">
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                disabled={loading}
                className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg text-gray-700 font-semibold hover:bg-gray-100 disabled:opacity-50 transition-colors"
              >
                Hủy
              </button>
              <button
                onClick={handleSaveNewStaff}
                disabled={loading}
                className="flex-1 px-4 py-2.5 bg-black text-white rounded-lg font-semibold hover:bg-gray-800 disabled:opacity-50 flex items-center justify-center transition-colors shadow-sm"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Đang xử lý...
                  </>
                ) : (
                  'Thêm nhân viên'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Staff Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-hidden flex flex-col">
            {/* Modal Header */}
            <div className="px-6 py-5 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Chỉnh sửa nhân viên</h2>
                  <p className="text-sm text-gray-500 mt-1">Cập nhật thông tin nhân viên</p>
                </div>
                <button
                  onClick={() => {
                    setShowEditModal(false);
                    setEditingStaffId(null);
                  }}
                  className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-2 rounded-lg transition-colors"
                  disabled={loading}
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="overflow-y-auto flex-1 px-6 py-4">
              {/* Hiển thị thông báo lỗi */}
              {error && (
                <div className="mb-4 p-3 bg-red-50 border-l-4 border-red-400 text-red-700 rounded-lg">
                  {error}
                </div>
              )}

              {/* Hiển thị thông báo thành công */}
              {success && (
                <div className="mb-4 p-3 bg-green-50 border-l-4 border-green-400 text-green-700 rounded-lg">
                  {success}
                </div>
              )}

              <form onSubmit={(e) => { e.preventDefault(); handleUpdateStaff(); }} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Tên đăng nhập <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="username"
                    required
                    value={newStaff.username}
                    onChange={handleInputChange}
                    disabled={loading}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 transition-colors"
                    placeholder="Nhập tên đăng nhập"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Họ và tên <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="fullName"
                    required
                    value={newStaff.fullName}
                    onChange={handleInputChange}
                    disabled={loading}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 transition-colors"
                    placeholder="Nhập họ và tên đầy đủ"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    name="email"
                    required
                    value={newStaff.email}
                    onChange={handleInputChange}
                    disabled={loading}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 transition-colors"
                    placeholder="example@email.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Số điện thoại <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    required
                    value={newStaff.phone}
                    onChange={handleInputChange}
                    disabled={loading}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 transition-colors"
                    placeholder="0123456789"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Địa chỉ
                  </label>
                  <input
                    type="text"
                    name="address"
                    value={newStaff.address}
                    onChange={handleInputChange}
                    disabled={loading}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 transition-colors"
                    placeholder="Nhập địa chỉ (tùy chọn)"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Mật khẩu mới (để trống nếu không đổi)
                  </label>
                  <input
                    type="password"
                    name="password"
                    value={newStaff.password}
                    onChange={handleInputChange}
                    disabled={loading}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 transition-colors"
                    placeholder="Để trống nếu không muốn đổi mật khẩu"
                    minLength={6}
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Vai trò <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="roleId"
                    required
                    value={newStaff.roleId}
                    onChange={handleInputChange}
                    disabled={loading}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 transition-colors"
                  >
                    <option value="">Chọn vai trò</option>
                    {getAvailableRoles().map((role) => (
                      <option key={role.value} value={role.value}>
                        {role.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Tên công ty
                  </label>
                  <input
                    type="text"
                    name="companyName"
                    value={newStaff.companyName}
                    onChange={handleInputChange}
                    disabled={loading}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 transition-colors"
                    placeholder="Nhập tên công ty (tùy chọn)"
                  />
                </div>
              </form>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex space-x-3">
              <button
                type="button"
                onClick={() => {
                  setShowEditModal(false);
                  setEditingStaffId(null);
                }}
                disabled={loading}
                className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg text-gray-700 font-semibold hover:bg-gray-100 disabled:opacity-50 transition-colors"
              >
                Hủy
              </button>
              <button
                onClick={handleUpdateStaff}
                disabled={loading}
                className="flex-1 px-4 py-2.5 bg-black text-white rounded-lg font-semibold hover:bg-gray-800 disabled:opacity-50 flex items-center justify-center transition-colors shadow-sm"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Đang xử lý...
                  </>
                ) : (
                  'Cập nhật'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};
