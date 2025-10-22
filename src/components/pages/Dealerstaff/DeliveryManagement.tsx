import React, { useState, useEffect } from 'react';
import { Search, Truck, Calendar, MapPin, User, Phone, Eye, Package, CheckCircle, Clock, XCircle, Edit, Trash2 } from 'lucide-react';
import { deliveryService, Delivery, UpdateDeliveryRequest } from '../../../services/deliveryService';

// User Info Interface
interface UserInfo {
  fullName: string;
  phone: string;
  email: string;
  address: string;
}

export const DeliveryManagement: React.FC = () => {
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDelivery, setSelectedDelivery] = useState<Delivery | null>(null);
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [loadingUserInfo, setLoadingUserInfo] = useState(false);
  const [userInfoMap, setUserInfoMap] = useState<Record<number, UserInfo>>({});
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingDelivery, setEditingDelivery] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletingDelivery, setDeletingDelivery] = useState(false);
  const [deliveryToDelete, setDeliveryToDelete] = useState<Delivery | null>(null);
  const [editForm, setEditForm] = useState<UpdateDeliveryRequest>({
    deliveryId: 0,
    userId: 0,
    orderId: 0,
    vehicleId: 0,
    deliveryDate: new Date().toISOString(),
    deliveryStatus: 'PENDING',
    notes: ''
  });

  // Fetch deliveries on mount
  useEffect(() => {
    fetchDeliveries();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchDeliveries = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await deliveryService.getDeliveries();
      console.log('📦 Deliveries loaded:', data);
      setDeliveries(data);
      
      // Fetch user info for all deliveries
      const userIds = [...new Set(data.map(d => d.userId).filter((id): id is number => id !== undefined && id !== 0))];
      console.log('👥 Fetching user info for userIds:', userIds);
      
      const newUserInfoMap: Record<number, UserInfo> = {};
      for (const userId of userIds) {
        const info = await fetchUserInfo(userId);
        if (info) {
          newUserInfoMap[userId] = info;
        }
      }
      
      setUserInfoMap(newUserInfoMap);
      console.log('✅ User info map loaded:', newUserInfoMap);
    } catch (err) {
      console.error('Failed to fetch deliveries:', err);
      setError(`Không thể tải danh sách vận chuyển: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  // Fetch user info by userId
  const fetchUserInfo = async (userId: number): Promise<UserInfo | null> => {
    if (!userId || userId === 0) {
      console.warn('⚠️ Invalid userId:', userId);
      return null;
    }

    try {
      setLoadingUserInfo(true);
      const token = localStorage.getItem('token');
      
      console.log(`👤 Fetching user info for userId: ${userId}...`);
      
      const response = await fetch(`/api/Customer/${userId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        console.warn(`⚠️ Failed to fetch user info: ${response.status}`);
        return null;
      }

      const data = await response.json();
      console.log('✅ User info fetched successfully!');
      console.log('📡 Raw API response:', data);

      // Handle different response formats
      const userData = data.data || data;
      console.log('📊 User data extracted:', userData);
      
      const userInfo: UserInfo = {
        fullName: userData.fullName || userData.name || userData.customerName || 'N/A',
        phone: userData.phone || userData.phoneNumber || 'N/A',
        email: userData.email || 'N/A',
        address: userData.address || 'N/A'
      };

      console.log('📋 Processed user info:', userInfo);
      
      return userInfo;
    } catch (error) {
      console.error('❌ Error fetching user info:', error);
      return null;
    } finally {
      setLoadingUserInfo(false);
    }
  };

  // View delivery details
  const handleViewDelivery = async (delivery: Delivery) => {
    setLoadingDetail(true);
    setUserInfo(null); // Reset user info
    try {
      const detailData = await deliveryService.getDeliveryById(delivery.deliveryId);
      setSelectedDelivery(detailData);
      
      // Fetch user info if userId exists
      if (detailData.userId) {
        console.log('🔄 Fetching user info for delivery...');
        const fetchedUserInfo = await fetchUserInfo(detailData.userId);
        setUserInfo(fetchedUserInfo);
      } else {
        console.warn('⚠️ No userId in delivery data');
      }
      
      setShowDetailModal(true);
    } catch (err) {
      console.error('Failed to fetch delivery details:', err);
      alert(`Không thể tải chi tiết vận chuyển: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setLoadingDetail(false);
    }
  };

  // Open edit modal
  const handleOpenEditModal = async (delivery: Delivery) => {
    try {
      const detailData = await deliveryService.getDeliveryById(delivery.deliveryId);
      setSelectedDelivery(detailData);
      setEditForm({
        deliveryId: detailData.deliveryId,
        userId: detailData.userId || 0,
        orderId: detailData.orderId,
        vehicleId: detailData.vehicleId || 0,
        deliveryDate: detailData.deliveryDate,
        deliveryStatus: detailData.deliveryStatus || 'PENDING',
        notes: detailData.notes || ''
      });
      setShowEditModal(true);
    } catch (err) {
      console.error('Failed to fetch delivery details:', err);
      alert(`Không thể tải chi tiết vận chuyển: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  };

  // Update delivery
  const handleUpdateDelivery = async (e: React.FormEvent) => {
    e.preventDefault();
    setEditingDelivery(true);
    try {
      await deliveryService.updateDelivery(editForm.deliveryId, editForm);
      setShowEditModal(false);
      await fetchDeliveries();
      alert('✅ Cập nhật vận chuyển thành công!');
    } catch (err) {
      console.error('Failed to update delivery:', err);
      alert(`❌ Lỗi khi cập nhật vận chuyển: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setEditingDelivery(false);
    }
  };

  // Open delete modal
  const handleOpenDeleteModal = (delivery: Delivery) => {
    setDeliveryToDelete(delivery);
    setShowDeleteModal(true);
  };

  // Delete delivery
  const handleDeleteDelivery = async () => {
    if (!deliveryToDelete) return;
    
    setDeletingDelivery(true);
    try {
      await deliveryService.deleteDelivery(deliveryToDelete.deliveryId);
      setShowDeleteModal(false);
      setDeliveryToDelete(null);
      await fetchDeliveries();
      alert('✅ Xóa vận chuyển thành công!');
    } catch (err) {
      console.error('Failed to delete delivery:', err);
      alert(`❌ Lỗi khi xóa vận chuyển: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setDeletingDelivery(false);
    }
  };

  // Filter deliveries
  const filteredDeliveries = deliveries.filter(delivery =>
    delivery.deliveryId.toString().includes(searchTerm.toLowerCase()) ||
    delivery.orderId.toString().includes(searchTerm.toLowerCase()) ||
    (delivery.recipientName && delivery.recipientName.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (delivery.recipientPhone && delivery.recipientPhone.includes(searchTerm)) ||
    (delivery.deliveryAddress && delivery.deliveryAddress.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (delivery.deliveryStatus && delivery.deliveryStatus.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (delivery.status && delivery.status.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Get status badge (works with both `deliveryStatus` and `status` fields)
  const getStatusBadge = (delivery: Delivery) => {
    const status = delivery.deliveryStatus || delivery.status;
    if (!status) {
      return (
        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-800">
          N/A
        </span>
      );
    }
    
    switch (status.toUpperCase()) {
      case 'PENDING':
        return (
          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-800 flex items-center space-x-1">
            <Clock className="h-3 w-3" />
            <span>Chờ giao</span>
          </span>
        );
      case 'IN_TRANSIT':
        return (
          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 flex items-center space-x-1">
            <Truck className="h-3 w-3" />
            <span>Đang giao</span>
          </span>
        );
      case 'DELIVERED':
        return (
          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800 flex items-center space-x-1">
            <CheckCircle className="h-3 w-3" />
            <span>Đã giao</span>
          </span>
        );
      case 'CANCELLED':
        return (
          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-800 flex items-center space-x-1">
            <XCircle className="h-3 w-3" />
            <span>Đã hủy</span>
          </span>
        );
      default:
        return (
          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-800">
            {status}
          </span>
        );
    }
  };

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-3xl shadow-2xl p-8 text-white">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-white bg-opacity-20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                <Truck className="h-10 w-10 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold mb-2">Quản lý vận chuyển</h1>
                <p className="text-blue-100 text-lg">Theo dõi và quản lý các đơn vận chuyển</p>
              </div>
            </div>
          </div>
        </div>

        {/* Search and Actions */}
        <div className="px-6 pb-6 flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Tìm kiếm theo ID, đơn hàng, người nhận, SĐT, địa chỉ, trạng thái..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all duration-200"
            />
          </div>
          <button
            onClick={fetchDeliveries}
            disabled={loading}
            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 transition-all duration-200 shadow-lg font-medium"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                <span>Đang tải...</span>
              </>
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

        {/* Error Message */}
        {error && (
          <div className="mx-6 mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-xl">
            <div className="flex items-center space-x-2">
              <XCircle className="h-5 w-5 text-red-500" />
              <p className="text-red-700 font-medium">{error}</p>
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center items-center py-20">
            <div className="text-center">
              <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600 font-medium">Đang tải danh sách vận chuyển...</p>
            </div>
          </div>
        )}

        {/* Deliveries List */}
        {!loading && filteredDeliveries.length > 0 && (
          <div className="mx-6 mb-6 bg-white rounded-2xl shadow-xl overflow-hidden">
            <div className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white p-4">
              <div className="flex items-center justify-between">
                <span className="font-semibold">Danh sách vận chuyển ({filteredDeliveries.length})</span>
              </div>
            </div>
            
            <div className="divide-y divide-gray-200">
              {filteredDeliveries.map((delivery) => (
                <div key={delivery.deliveryId} className="p-6 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 transition-all duration-300">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-6">
                        <div className="flex-shrink-0">
                          <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
                            <Truck className="h-8 w-8 text-white" />
                          </div>
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-4 mb-3">
                            <h3 className="text-xl font-bold text-gray-900">
                              Vận chuyển #{delivery.deliveryId}
                            </h3>
                            {getStatusBadge(delivery)}
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
                              <Package className="h-5 w-5 text-blue-600" />
                              <div>
                                <p className="text-xs text-gray-600">Đơn hàng</p>
                                <p className="font-semibold text-gray-900">#{delivery.orderId}</p>
                              </div>
                            </div>
                            <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
                              <User className="h-5 w-5 text-green-600" />
                              <div className="flex-1">
                                <p className="text-xs text-gray-600">Người nhận</p>
                                <p className="font-semibold text-gray-900">
                                  {delivery.userId && userInfoMap[delivery.userId] 
                                    ? userInfoMap[delivery.userId].fullName 
                                    : (delivery.recipientName || 'Chưa có thông tin')}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center space-x-3 p-3 bg-purple-50 rounded-lg">
                              <Calendar className="h-5 w-5 text-purple-600" />
                              <div>
                                <p className="text-xs text-gray-600">Ngày giao</p>
                                <p className="font-semibold text-gray-900">{formatDate(delivery.deliveryDate)}</p>
                              </div>
                            </div>
                          </div>

                          {/* <div className="mt-3 flex items-start space-x-2 p-3 bg-gray-50 rounded-lg">
                            <MapPin className="h-5 w-5 text-gray-600 flex-shrink-0 mt-0.5" />
                            <div>
                              <p className="text-xs text-gray-600">Địa chỉ giao hàng</p>
                              <p className="font-medium text-gray-900">{delivery.deliveryAddress}</p>
                            </div>
                          </div> */}

                          {/* <div className="mt-3 flex items-center space-x-2 p-3 bg-orange-50 rounded-lg">
                            <Phone className="h-5 w-5 text-orange-600" />
                            <div>
                              <p className="text-xs text-gray-600">Số điện thoại</p>
                              <p className="font-semibold text-gray-900">{delivery.recipientPhone}</p>
                            </div>
                          </div> */}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2 ml-6">
                      <button
                        onClick={() => handleViewDelivery(delivery)}
                        disabled={loadingDetail}
                        className="p-3 text-blue-600 hover:text-blue-800 hover:bg-blue-100 rounded-xl transition-all duration-200 disabled:opacity-50"
                        title="Xem chi tiết"
                      >
                        {loadingDetail ? (
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                        ) : (
                          <Eye className="h-5 w-5" />
                        )}
                      </button>
                      <button
                        onClick={() => handleOpenEditModal(delivery)}
                        className="p-3 text-green-600 hover:text-green-800 hover:bg-green-100 rounded-xl transition-all duration-200"
                        title="Chỉnh sửa"
                      >
                        <Edit className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => handleOpenDeleteModal(delivery)}
                        className="p-3 text-red-600 hover:text-red-800 hover:bg-red-100 rounded-xl transition-all duration-200"
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

        {/* No Results */}
        {!loading && filteredDeliveries.length === 0 && deliveries.length === 0 && (
          <div className="mx-6 mb-6 bg-white rounded-2xl shadow-xl p-12 text-center">
            <div className="w-24 h-24 bg-gradient-to-r from-blue-100 to-indigo-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Truck className="h-12 w-12 text-blue-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Chưa có vận chuyển nào</h3>
            <p className="text-gray-600">Danh sách vận chuyển sẽ xuất hiện ở đây</p>
          </div>
        )}

        {!loading && filteredDeliveries.length === 0 && deliveries.length > 0 && (
          <div className="mx-6 mb-6 bg-white rounded-2xl shadow-xl p-12 text-center">
            <div className="w-24 h-24 bg-gradient-to-r from-orange-100 to-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Search className="h-12 w-12 text-orange-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Không tìm thấy kết quả</h3>
            <p className="text-gray-600">Không có vận chuyển nào phù hợp với từ khóa "{searchTerm}"</p>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {showDetailModal && selectedDelivery && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl transform transition-all">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white p-6 rounded-t-2xl">
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-white bg-opacity-20 rounded-xl flex items-center justify-center">
                    <Truck className="h-6 w-6" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">Chi tiết vận chuyển #{selectedDelivery.deliveryId}</h2>
                    <p className="text-blue-100 text-sm">Thông tin chi tiết đơn vận chuyển</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="text-white hover:text-blue-200 transition-colors p-2 hover:bg-white hover:bg-opacity-10 rounded-lg"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Basic Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">Thông tin cơ bản</h3>
                  
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
                      <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                        <span className="text-white font-bold text-sm">#{selectedDelivery.deliveryId}</span>
                      </div>
                      <div>
                        <p className="text-xs text-gray-600">ID Vận chuyển</p>
                        <p className="font-semibold text-gray-900">{selectedDelivery.deliveryId}</p>
                      </div>
                    </div>

                    {selectedDelivery.userId && (
                      <div className="flex items-center space-x-3 p-3 bg-indigo-50 rounded-lg">
                        <User className="h-5 w-5 text-indigo-600" />
                        <div>
                          <p className="text-xs text-gray-600">User ID</p>
                          <p className="font-semibold text-gray-900">#{selectedDelivery.userId}</p>
                        </div>
                      </div>
                    )}

                    <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
                      <Package className="h-5 w-5 text-green-600" />
                      <div>
                        <p className="text-xs text-gray-600">ID Đơn hàng</p>
                        <p className="font-semibold text-gray-900">#{selectedDelivery.orderId}</p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3 p-3 bg-purple-50 rounded-lg">
                      <Calendar className="h-5 w-5 text-purple-600" />
                      <div>
                        <p className="text-xs text-gray-600">Ngày giao hàng</p>
                        <p className="font-semibold text-gray-900">{formatDate(selectedDelivery.deliveryDate)}</p>
                      </div>
                    </div>

                    <div className="p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border-2 border-blue-200">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-semibold text-gray-700">Trạng thái:</span>
                        {getStatusBadge(selectedDelivery)}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Recipient Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">Thông tin người nhận</h3>
                  
                  {loadingUserInfo ? (
                    <div className="flex justify-center items-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                      <p className="ml-3 text-gray-600">Đang tải thông tin...</p>
                    </div>
                  ) : userInfo ? (
                    <div className="space-y-3">
                      <div className="flex items-center space-x-3 p-3 bg-orange-50 rounded-lg">
                        <User className="h-5 w-5 text-orange-600" />
                        <div className="flex-1">
                          <p className="text-xs text-gray-600">Tên người nhận</p>
                          <p className="font-semibold text-gray-900">{userInfo.fullName}</p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-3 p-3 bg-pink-50 rounded-lg">
                        <Phone className="h-5 w-5 text-pink-600" />
                        <div className="flex-1">
                          <p className="text-xs text-gray-600">Số điện thoại</p>
                          <p className="font-semibold text-gray-900">{userInfo.phone}</p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
                        <svg className="h-5 w-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                        <div className="flex-1">
                          <p className="text-xs text-gray-600">Email</p>
                          <p className="font-semibold text-gray-900">{userInfo.email}</p>
                        </div>
                      </div>

                      <div className="flex items-start space-x-3 p-3 bg-green-50 rounded-lg">
                        <MapPin className="h-5 w-5 text-green-600 mt-0.5" />
                        <div className="flex-1">
                          <p className="text-xs text-gray-600">Địa chỉ</p>
                          <p className="font-semibold text-gray-900">{userInfo.address}</p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded">
                      <p className="text-sm text-yellow-800">
                        ⚠️ Không thể tải thông tin người nhận. Vui lòng kiểm tra lại User ID.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="bg-gray-50 px-6 py-4 rounded-b-2xl flex justify-end">
              <button
                onClick={() => setShowDetailModal(false)}
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 font-medium shadow-lg"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && selectedDelivery && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            {/* Header */}
            <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white p-6 rounded-t-2xl">
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-white bg-opacity-20 rounded-xl flex items-center justify-center">
                    <Edit className="h-6 w-6" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">Chỉnh sửa vận chuyển</h2>
                    <p className="text-green-100 text-sm">Vận chuyển #{selectedDelivery.deliveryId}</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowEditModal(false)}
                  disabled={editingDelivery}
                  className="text-white hover:text-green-200 transition-colors p-2 hover:bg-white hover:bg-opacity-10 rounded-lg"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleUpdateDelivery} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                {/* User ID (Read-only) */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">User ID (tự động)</label>
                  <input
                    type="number"
                    value={editForm.userId}
                    readOnly
                    className="w-full border-2 border-gray-200 rounded-lg px-4 py-2 bg-gray-100 text-gray-600 cursor-not-allowed"
                  />
                </div>

                {/* Order ID */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Order ID *</label>
                  <input
                    type="number"
                    required
                    value={editForm.orderId}
                    onChange={(e) => setEditForm({...editForm, orderId: parseInt(e.target.value)})}
                    className="w-full border-2 border-gray-200 rounded-lg px-4 py-2 focus:border-green-500 focus:ring-2 focus:ring-green-100"
                  />
                </div>

                {/* Vehicle ID */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Vehicle ID *</label>
                  <input
                    type="number"
                    required
                    value={editForm.vehicleId}
                    onChange={(e) => setEditForm({...editForm, vehicleId: parseInt(e.target.value)})}
                    className="w-full border-2 border-gray-200 rounded-lg px-4 py-2 focus:border-green-500 focus:ring-2 focus:ring-green-100"
                  />
                </div>
              </div>

              {/* Delivery Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Ngày giao hàng *</label>
                <input
                  type="datetime-local"
                  required
                  value={editForm.deliveryDate.slice(0, 16)}
                  onChange={(e) => setEditForm({...editForm, deliveryDate: new Date(e.target.value).toISOString()})}
                  className="w-full border-2 border-gray-200 rounded-lg px-4 py-2 focus:border-green-500 focus:ring-2 focus:ring-green-100"
                />
              </div>

              {/* Status */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Trạng thái *</label>
                <select
                  required
                  value={editForm.deliveryStatus}
                  onChange={(e) => setEditForm({...editForm, deliveryStatus: e.target.value})}
                  className="w-full border-2 border-gray-200 rounded-lg px-4 py-2 focus:border-green-500 focus:ring-2 focus:ring-green-100"
                >
                  <option value="PENDING">Chờ giao</option>
                  <option value="ON THE WAY">Đang giao</option>
                  <option value="IN_TRANSIT">Đang vận chuyển</option>
                  <option value="DELIVERED">Đã giao</option>
                  <option value="CANCELLED">Đã hủy</option>
                </select>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Ghi chú</label>
                <textarea
                  value={editForm.notes}
                  onChange={(e) => setEditForm({...editForm, notes: e.target.value})}
                  rows={3}
                  className="w-full border-2 border-gray-200 rounded-lg px-4 py-2 focus:border-green-500 focus:ring-2 focus:ring-green-100"
                  placeholder="Nhập ghi chú..."
                />
              </div>

              {/* Actions */}
              <div className="flex justify-end space-x-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  disabled={editingDelivery}
                  className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 disabled:opacity-50"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={editingDelivery}
                  className="px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:from-green-700 hover:to-emerald-700 disabled:opacity-50 flex items-center space-x-2"
                >
                  {editingDelivery && (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  )}
                  <span>{editingDelivery ? 'Đang lưu...' : 'Lưu thay đổi'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {showDeleteModal && deliveryToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl">
            {/* Header */}
            <div className="bg-gradient-to-r from-red-500 to-pink-600 text-white p-6 rounded-t-2xl">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-white bg-opacity-20 rounded-xl flex items-center justify-center">
                  <Trash2 className="h-6 w-6" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold">Xác nhận xóa</h2>
                  <p className="text-red-100 text-sm">Thao tác này không thể hoàn tác</p>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="p-6">
              <p className="text-gray-700 mb-4">
                Bạn có chắc chắn muốn xóa vận chuyển <strong>#{deliveryToDelete.deliveryId}</strong> không?
              </p>
              <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded">
                <p className="text-sm text-yellow-800">
                  ⚠️ Thông tin vận chuyển sẽ bị xóa vĩnh viễn khỏi hệ thống.
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="bg-gray-50 px-6 py-4 rounded-b-2xl flex justify-end space-x-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                disabled={deletingDelivery}
                className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 disabled:opacity-50"
              >
                Hủy
              </button>
              <button
                onClick={handleDeleteDelivery}
                disabled={deletingDelivery}
                className="px-6 py-3 bg-gradient-to-r from-red-600 to-pink-600 text-white rounded-xl hover:from-red-700 hover:to-pink-700 disabled:opacity-50 flex items-center space-x-2"
              >
                {deletingDelivery && (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                )}
                <Trash2 className="h-4 w-4" />
                <span>{deletingDelivery ? 'Đang xóa...' : 'Xóa vận chuyển'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

