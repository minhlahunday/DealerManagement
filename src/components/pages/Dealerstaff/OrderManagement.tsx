import React, { useState, useEffect } from 'react';
import { Search, FileText, DollarSign, Calendar, User, Car, Eye, Package, Truck } from 'lucide-react';

interface Order {
  orderId: number;
  quotationId: number;
  userId: number;
  vehicleId: number;
  orderDate: string;
  deliveryAddress: string | null;
  status: string;
  totalAmount: number;
}

export const OrderManagement: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [showTemplateModal, setShowTemplateModal] = useState(false);

  // Load orders when component mounts
  useEffect(() => {
    fetchOrders();
  }, []);

  // Fetch orders from API
  const fetchOrders = async () => {
    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('token');
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };

      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      console.log('🔍 Fetching orders from API...');
      const response = await fetch('/api/Order', {
        method: 'GET',
        headers,
      });

      console.log('📡 Orders API Response status:', response.status);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const responseData = await response.json();
      console.log('📡 Orders API Response Data:', responseData);

      if (responseData.data) {
        setOrders(responseData.data);
        console.log('✅ Orders loaded from API:', responseData.data.length);
      } else {
        console.log('❌ No orders data in response');
        setOrders([]);
      }
    } catch (error) {
      console.error('Failed to fetch orders:', error);
      setError(error instanceof Error ? error.message : 'Lỗi khi tải danh sách đơn hàng');
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  // View order details
  const handleViewOrder = async (order: Order) => {
    setLoadingDetail(true);
    setError(null);

    try {
      console.log(`🔍 Viewing order details for ID: ${order.orderId}`);
      setSelectedOrder(order);
      setShowDetailModal(true);
      console.log('✅ Order details loaded successfully');
    } catch (error) {
      console.error('❌ Error loading order details:', error);
      alert(`Lỗi khi tải chi tiết đơn hàng: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoadingDetail(false);
    }
  };

  // Filter orders
  const filteredOrders = orders.filter(order =>
    order.orderId.toString().includes(searchTerm) ||
    order.status.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.userId.toString().includes(searchTerm) ||
    order.vehicleId.toString().includes(searchTerm)
  );

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      case 'CONFIRMED':
        return 'bg-blue-100 text-blue-800';
      case 'PROCESSING':
        return 'bg-purple-100 text-purple-800';
      case 'SHIPPED':
        return 'bg-indigo-100 text-indigo-800';
      case 'DELIVERED':
        return 'bg-green-100 text-green-800';
      case 'CANCELLED':
        return 'bg-red-100 text-red-800';
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
      case 'PROCESSING':
        return 'Đang xử lý';
      case 'SHIPPED':
        return 'Đã giao hàng';
      case 'DELIVERED':
        return 'Đã nhận hàng';
      case 'CANCELLED':
        return 'Đã hủy';
      default:
        return status;
    }
  };

  return (
    <div>
      {/* Header Section */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-8 mb-8 border border-blue-200">
        <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center space-y-4 lg:space-y-0">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
              <Package className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-gray-900">Quản lý đơn hàng</h1>
              <p className="text-gray-600 mt-1">Theo dõi và quản lý đơn hàng của khách hàng</p>
            </div>
          </div>
          <div className="flex items-center space-x-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{orders.length}</div>
              <div className="text-sm text-gray-600">Tổng đơn hàng</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{orders.filter(o => o.status === 'DELIVERED').length}</div>
              <div className="text-sm text-gray-600">Đã giao</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">{orders.filter(o => o.status === 'PENDING').length}</div>
              <div className="text-sm text-gray-600">Chờ xử lý</div>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Actions Section */}
      <div className="bg-white rounded-2xl p-6 mb-8 shadow-sm border border-gray-200">
        <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center space-y-4 lg:space-y-0">
          <div className="relative max-w-md">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Tìm kiếm đơn hàng..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-gray-50 focus:bg-white"
            />
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={fetchOrders}
              disabled={loading}
              className="bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white px-6 py-3 rounded-xl font-medium flex items-center space-x-2 shadow-lg transition-all duration-200 transform hover:scale-105 disabled:opacity-50"
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
            <button
              onClick={() => setShowTemplateModal(true)}
              className="bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white px-6 py-3 rounded-xl font-medium flex items-center space-x-2 shadow-lg transition-all duration-200 transform hover:scale-105"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span>Mẫu đơn hàng</span>
            </button>
          </div>
        </div>
      </div>

      {/* Loading Spinner */}
      {loading && (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-gray-600">Đang tải danh sách đơn hàng...</span>
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

      {/* Orders List */}
      {!loading && filteredOrders.length > 0 && (
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
          <div className="bg-gradient-to-r from-gray-50 to-slate-50 px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-900 flex items-center space-x-2">
              <Package className="h-6 w-6 text-blue-600" />
              <span>Danh sách đơn hàng ({filteredOrders.length})</span>
            </h2>
          </div>
          
          <div className="divide-y divide-gray-100">
            {filteredOrders.map((order) => (
              <div key={order.orderId} className="p-6 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 transition-all duration-300">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-6">
                      <div className="flex-shrink-0">
                        <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
                          <Package className="h-8 w-8 text-white" />
                        </div>
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-4 mb-3">
                          <h3 className="text-xl font-bold text-gray-900">
                            Đơn hàng #{order.orderId}
                          </h3>
                          <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                            {getStatusText(order.status)}
                          </span>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                          <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
                            <Calendar className="h-5 w-5 text-blue-600" />
                            <div>
                              <p className="text-xs text-gray-600">Ngày đặt</p>
                              <p className="font-semibold text-gray-900">{formatDate(order.orderDate)}</p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
                            <DollarSign className="h-5 w-5 text-green-600" />
                            <div>
                              <p className="text-xs text-gray-600">Tổng tiền</p>
                              <p className="font-semibold text-gray-900">{formatPrice(order.totalAmount)}</p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-3 p-3 bg-purple-50 rounded-lg">
                            <User className="h-5 w-5 text-purple-600" />
                            <div>
                              <p className="text-xs text-gray-600">Khách hàng</p>
                              <p className="font-semibold text-gray-900">ID: {order.userId}</p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                            <Car className="h-5 w-5 text-gray-600" />
                            <div>
                              <p className="text-xs text-gray-600">Xe</p>
                              <p className="font-semibold text-gray-900">ID: {order.vehicleId}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2 ml-6">
                    <button
                      onClick={() => handleViewOrder(order)}
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

      {/* Empty State */}
      {!loading && filteredOrders.length === 0 && orders.length === 0 && (
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-12 text-center">
          <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <Package className="h-12 w-12 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Chưa có đơn hàng nào</h3>
          <p className="text-gray-600">Hiện tại chưa có đơn hàng nào trong hệ thống.</p>
        </div>
      )}

      {/* Order Detail Modal */}
      {showDetailModal && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl transform transition-all">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white p-6 rounded-t-2xl">
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-white bg-opacity-20 rounded-xl flex items-center justify-center">
                    <Package className="h-6 w-6" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">Chi tiết đơn hàng #{selectedOrder.orderId}</h2>
                    <p className="text-blue-100 text-sm">Thông tin chi tiết đơn hàng</p>
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
                        <span className="text-white font-bold text-sm">#{selectedOrder.orderId}</span>
                      </div>
                      <div>
                        <p className="text-xs text-gray-600">ID Đơn hàng</p>
                        <p className="font-semibold text-gray-900">{selectedOrder.orderId}</p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
                      <Calendar className="h-5 w-5 text-green-600" />
                      <div>
                        <p className="text-xs text-gray-600">Ngày đặt hàng</p>
                        <p className="font-semibold text-gray-900">{formatDate(selectedOrder.orderDate)}</p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3 p-3 bg-purple-50 rounded-lg">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(selectedOrder.status)}`}>
                        {getStatusText(selectedOrder.status)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Customer & Vehicle Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">Khách hàng & Xe</h3>
                  
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3 p-3 bg-orange-50 rounded-lg">
                      <User className="h-5 w-5 text-orange-600" />
                      <div>
                        <p className="text-xs text-gray-600">ID Khách hàng</p>
                        <p className="font-semibold text-gray-900">{selectedOrder.userId}</p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                      <Car className="h-5 w-5 text-gray-600" />
                      <div>
                        <p className="text-xs text-gray-600">ID Xe</p>
                        <p className="font-semibold text-gray-900">{selectedOrder.vehicleId}</p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3 p-3 bg-indigo-50 rounded-lg">
                      <FileText className="h-5 w-5 text-indigo-600" />
                      <div>
                        <p className="text-xs text-gray-600">ID Báo giá</p>
                        <p className="font-semibold text-gray-900">{selectedOrder.quotationId}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Price Information */}
              <div className="mt-6">
                <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2 mb-4">Thông tin giá</h3>
                
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6 border border-green-200">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-900 font-bold text-xl">Tổng tiền đơn hàng:</span>
                    <span className="font-bold text-green-600 text-2xl">{formatPrice(selectedOrder.totalAmount)}</span>
                  </div>
                </div>
              </div>

              {/* Delivery Information */}
              {selectedOrder.deliveryAddress && (
                <div className="mt-6">
                  <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2 mb-4">Thông tin giao hàng</h3>
                  
                  <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl p-6 border border-yellow-200">
                    <div className="flex items-center space-x-3">
                      <Truck className="h-6 w-6 text-yellow-600" />
                      <div>
                        <p className="text-sm font-semibold text-gray-700">Địa chỉ giao hàng</p>
                        <p className="text-gray-900 mt-1">{selectedOrder.deliveryAddress}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="px-6 py-3 border-2 border-gray-300 rounded-xl text-gray-700 hover:bg-white hover:border-gray-400 transition-all duration-200 font-medium"
                >
                  Đóng
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Template Modal */}
      {showTemplateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-[9999]">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl transform transition-all">
            {/* Header */}
            <div className="bg-gradient-to-r from-indigo-500 to-blue-600 text-white p-6 rounded-t-2xl">
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-white bg-opacity-20 rounded-xl flex items-center justify-center">
                    <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">Mẫu đơn hàng</h2>
                    <p className="text-indigo-100 text-sm">Tham khảo mẫu đơn hàng chuẩn</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowTemplateModal(false)}
                  className="text-white hover:text-indigo-200 transition-colors p-2 hover:bg-white hover:bg-opacity-10 rounded-lg"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-6">
              {/* Image Display */}
              <div className="bg-gradient-to-r from-gray-50 to-slate-50 rounded-xl p-6 border-2 border-gray-200 mb-6">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center">
                    <Package className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <p className="text-lg font-semibold text-gray-700">Mẫu đơn hàng chuẩn</p>
                    <p className="text-sm text-gray-500">Mẫu đơn hàng để tham khảo</p>
                  </div>
                </div>
                
                {/* Image Container */}
                <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
                  <img 
                    src="/images/mau-don-hang.jpg" 
                    alt="Mẫu đơn hàng" 
                    className="w-full h-auto rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200"
                    style={{ maxHeight: '600px', objectFit: 'contain' }}
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-center space-x-4">
                <a 
                  href="/images/mau-don-hang.jpg"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                  <Eye className="h-5 w-5" />
                  <span>Xem ảnh gốc</span>
                </a>
                <a 
                  href="/images/mau-don-hang.jpg"
                  download="mau-don-hang.jpg"
                  className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-xl hover:from-green-700 hover:to-green-800 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  <span>Tải xuống</span>
                </a>
              </div>

              {/* Info */}
              <div className="mt-6 bg-blue-50 rounded-xl p-4 border border-blue-200">
                <div className="flex items-start space-x-3">
                  <svg className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div>
                    <h3 className="text-sm font-semibold text-blue-800 mb-1">Hướng dẫn sử dụng</h3>
                    <div className="text-sm text-blue-700 space-y-1">
                      <p>• <strong>Xem ảnh gốc:</strong> Mở ảnh trong tab mới với kích thước đầy đủ</p>
                      <p>• <strong>Tải xuống:</strong> Tải ảnh mẫu về máy để tham khảo khi tạo đơn hàng</p>
                      <p>• <strong>Tham khảo:</strong> Sử dụng mẫu này để tạo đơn hàng có cấu trúc tương tự</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="bg-gray-50 px-6 py-4 rounded-b-2xl flex justify-end">
              <button
                onClick={() => setShowTemplateModal(false)}
                className="px-6 py-3 border-2 border-gray-300 rounded-xl text-gray-700 hover:bg-white hover:border-gray-400 transition-all duration-200 font-medium"
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
