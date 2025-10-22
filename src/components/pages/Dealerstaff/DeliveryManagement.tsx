import React, { useState, useEffect } from 'react';
import { Search, Truck, Calendar, MapPin, User, Phone, Eye, Package, CheckCircle, Clock, XCircle } from 'lucide-react';
import { deliveryService, Delivery } from '../../../services/deliveryService';

export const DeliveryManagement: React.FC = () => {
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDelivery, setSelectedDelivery] = useState<Delivery | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [loadingDetail, setLoadingDetail] = useState(false);

  // Fetch deliveries on mount
  useEffect(() => {
    fetchDeliveries();
  }, []);

  const fetchDeliveries = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await deliveryService.getDeliveries();
      console.log('📦 Deliveries loaded:', data);
      setDeliveries(data);
    } catch (err) {
      console.error('Failed to fetch deliveries:', err);
      setError(`Không thể tải danh sách vận chuyển: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  // View delivery details
  const handleViewDelivery = async (delivery: Delivery) => {
    setLoadingDetail(true);
    try {
      const detailData = await deliveryService.getDeliveryById(delivery.deliveryId);
      setSelectedDelivery(detailData);
      setShowDetailModal(true);
    } catch (err) {
      console.error('Failed to fetch delivery details:', err);
      alert(`Không thể tải chi tiết vận chuyển: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setLoadingDetail(false);
    }
  };

  // Filter deliveries
  const filteredDeliveries = deliveries.filter(delivery =>
    delivery.deliveryId.toString().includes(searchTerm.toLowerCase()) ||
    delivery.orderId.toString().includes(searchTerm.toLowerCase()) ||
    delivery.recipientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    delivery.recipientPhone.includes(searchTerm) ||
    delivery.deliveryAddress.toLowerCase().includes(searchTerm.toLowerCase()) ||
    delivery.status.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Get status badge
  const getStatusBadge = (status: string) => {
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
                            {getStatusBadge(delivery.status)}
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
                              <div>
                                <p className="text-xs text-gray-600">Người nhận</p>
                                <p className="font-semibold text-gray-900">{delivery.recipientName}</p>
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

                          <div className="mt-3 flex items-start space-x-2 p-3 bg-gray-50 rounded-lg">
                            <MapPin className="h-5 w-5 text-gray-600 flex-shrink-0 mt-0.5" />
                            <div>
                              <p className="text-xs text-gray-600">Địa chỉ giao hàng</p>
                              <p className="font-medium text-gray-900">{delivery.deliveryAddress}</p>
                            </div>
                          </div>

                          <div className="mt-3 flex items-center space-x-2 p-3 bg-orange-50 rounded-lg">
                            <Phone className="h-5 w-5 text-orange-600" />
                            <div>
                              <p className="text-xs text-gray-600">Số điện thoại</p>
                              <p className="font-semibold text-gray-900">{delivery.recipientPhone}</p>
                            </div>
                          </div>
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
                        {getStatusBadge(selectedDelivery.status)}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Recipient Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">Thông tin người nhận</h3>
                  
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3 p-3 bg-orange-50 rounded-lg">
                      <User className="h-5 w-5 text-orange-600" />
                      <div>
                        <p className="text-xs text-gray-600">Tên người nhận</p>
                        <p className="font-semibold text-gray-900">{selectedDelivery.recipientName}</p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3 p-3 bg-pink-50 rounded-lg">
                      <Phone className="h-5 w-5 text-pink-600" />
                      <div>
                        <p className="text-xs text-gray-600">Số điện thoại</p>
                        <p className="font-semibold text-gray-900">{selectedDelivery.recipientPhone}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Delivery Address */}
              <div className="mt-6">
                <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2 mb-4">Địa chỉ giao hàng</h3>
                
                <div className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl p-6 border border-gray-200">
                  <div className="flex items-start space-x-3">
                    <MapPin className="h-6 w-6 text-blue-600 flex-shrink-0 mt-1" />
                    <div>
                      <p className="text-gray-900 font-semibold text-lg">{selectedDelivery.deliveryAddress}</p>
                    </div>
                  </div>
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
    </div>
  );
};

