import React, { useState, useEffect } from 'react';
import { Search, Package, ShoppingBag, Calendar, RefreshCw, AlertCircle, Eye, Hash, DollarSign, User, Car, Plus, Edit, Trash2, X } from 'lucide-react';
import { dealerOrderService, DealerOrder } from '../../../services/dealerOrderService';

interface OrderForm {
  userId: number;
  vehicleId: number;
  quantity: number;
  color: string;
  orderDate: string;
  status: string;
  paymentStatus: string;
  totalAmount: number;
}

export const DealerOrderManagement: React.FC = () => {
  const [orders, setOrders] = useState<DealerOrder[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<DealerOrder | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [loadingDetail, setLoadingDetail] = useState(false);
  
  // Create/Edit Modal States
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [formData, setFormData] = useState<OrderForm>({
    userId: 0,
    vehicleId: 0,
    quantity: 1,
    color: '',
    orderDate: new Date().toISOString().slice(0, 16),
    status: 'PENDING',
    paymentStatus: 'UNPAID',
    totalAmount: 0
  });

  // Fetch orders on mount
  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await dealerOrderService.getDealerOrders();
      console.log('📦 Dealer orders loaded:', data);
      setOrders(data);
    } catch (err) {
      console.error('Failed to fetch dealer orders:', err);
      setError(`Không thể tải đơn hàng đại lý: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  // View order detail
  const handleViewOrder = async (order: DealerOrder) => {
    setLoadingDetail(true);
    setShowDetailModal(true);
    try {
      setSelectedOrder(order);
      console.log('👁️ Viewing dealer order detail:', order);
    } catch (err) {
      console.error('Failed to fetch order detail:', err);
      alert(`Không thể tải chi tiết: ${err instanceof Error ? err.message : 'Unknown error'}`);
      setShowDetailModal(false);
    } finally {
      setLoadingDetail(false);
    }
  };

  // Open create modal
  const handleOpenCreateModal = () => {
    setFormData({
      userId: 0,
      vehicleId: 0,
      quantity: 1,
      color: '',
      orderDate: new Date().toISOString().slice(0, 16),
      status: 'PENDING',
      paymentStatus: 'UNPAID',
      totalAmount: 0
    });
    setShowCreateModal(true);
  };

  // Open edit modal
  const handleOpenEditModal = (order: DealerOrder) => {
    setFormData({
      userId: order.userId,
      vehicleId: order.vehicleId,
      quantity: order.quantity,
      color: order.color || '',
      orderDate: new Date(order.orderDate).toISOString().slice(0, 16),
      status: order.status,
      paymentStatus: order.paymentStatus,
      totalAmount: order.totalAmount
    });
    setShowEditModal(true);
  };

  // Create order
  const handleCreateOrder = async () => {
    try {
      if (formData.userId === 0 || formData.vehicleId === 0 || formData.quantity < 1 || formData.totalAmount < 0) {
        alert('Vui lòng điền đầy đủ thông tin hợp lệ!');
        return;
      }

      setLoading(true);
      await dealerOrderService.createDealerOrder(formData);
      alert('✅ Tạo đơn hàng thành công!');
      setShowCreateModal(false);
      await fetchOrders();
    } catch (err) {
      console.error('Failed to create order:', err);
      alert(`❌ Không thể tạo đơn hàng: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  // Update order
  const handleUpdateOrder = async () => {
    if (!selectedOrder) return;

    try {
      if (formData.userId === 0 || formData.vehicleId === 0 || formData.quantity < 1 || formData.totalAmount < 0) {
        alert('Vui lòng điền đầy đủ thông tin hợp lệ!');
        return;
      }

      setLoading(true);
      await dealerOrderService.updateDealerOrder(selectedOrder.dealerOrderId, {
        dealerOrderId: selectedOrder.dealerOrderId,
        ...formData
      });
      alert('✅ Cập nhật đơn hàng thành công!');
      setShowEditModal(false);
      setShowDetailModal(false);
      await fetchOrders();
    } catch (err) {
      console.error('Failed to update order:', err);
      alert(`❌ Không thể cập nhật đơn hàng: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  // Delete order
  const handleDeleteOrder = async (id: number) => {
    if (!window.confirm('⚠️ Bạn có chắc chắn muốn xóa đơn hàng này không?')) {
      return;
    }

    try {
      setLoading(true);
      await dealerOrderService.deleteDealerOrder(id);
      alert('✅ Xóa đơn hàng thành công!');
      setShowDetailModal(false);
      await fetchOrders();
    } catch (err) {
      console.error('Failed to delete order:', err);
      alert(`❌ Không thể xóa đơn hàng: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  // Filter orders
  const filteredOrders = orders.filter(order => {
    const searchLower = searchTerm.toLowerCase();
    return (
      order.dealerOrderId.toString().includes(searchLower) ||
      order.userId.toString().includes(searchLower) ||
      order.vehicleId.toString().includes(searchLower) ||
      order.status.toLowerCase().includes(searchLower) ||
      order.paymentStatus.toLowerCase().includes(searchLower) ||
      order.color?.toLowerCase().includes(searchLower)
    );
  });

  // Calculate statistics
  const totalOrders = filteredOrders.length;
  const totalAmount = filteredOrders.reduce((sum, order) => sum + order.totalAmount, 0);
  const totalQuantity = filteredOrders.reduce((sum, order) => sum + (order.quantity || 0), 0);

  // Format price
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Get status badge
  const getStatusBadge = (status: string) => {
    const statusMap: { [key: string]: { bg: string; text: string; label: string } } = {
      'PENDING': { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Chờ xử lý' },
      'CONFIRMED': { bg: 'bg-blue-100', text: 'text-blue-800', label: 'Đã xác nhận' },
      'PROCESSING': { bg: 'bg-purple-100', text: 'text-purple-800', label: 'Đang xử lý' },
      'COMPLETED': { bg: 'bg-green-100', text: 'text-green-800', label: 'Hoàn thành' },
      'CANCELLED': { bg: 'bg-red-100', text: 'text-red-800', label: 'Đã hủy' },
    };

    const statusInfo = statusMap[status.toUpperCase()] || { bg: 'bg-gray-100', text: 'text-gray-800', label: status };

    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${statusInfo.bg} ${statusInfo.text}`}>
        {statusInfo.label}
      </span>
    );
  };

  // Get payment status badge
  const getPaymentStatusBadge = (paymentStatus: string) => {
    const statusMap: { [key: string]: { bg: string; text: string; label: string } } = {
      'PAID': { bg: 'bg-green-100', text: 'text-green-800', label: 'Đã xử lý' },
      'UNPAID': { bg: 'bg-red-100', text: 'text-red-800', label: 'Chưa xử lý' },
      'PARTIAL': { bg: 'bg-orange-100', text: 'text-orange-800', label: 'Xử lý 1 phần' },
      'PENDING': { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Đang xử lý' },
    };

    const statusInfo = statusMap[paymentStatus.toUpperCase()] || { bg: 'bg-gray-100', text: 'text-gray-800', label: paymentStatus };

    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${statusInfo.bg} ${statusInfo.text}`}>
        {statusInfo.label}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-3xl shadow-2xl p-8 text-white">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-white bg-opacity-20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                <Package className="h-10 w-10 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold mb-2">Đơn hàng đại lý</h1>
                <p className="text-blue-100 text-lg">Quản lý đơn hàng từ các đại lý</p>
              </div>
            </div>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 px-6 pb-6 pt-6">
          {/* Total Orders */}
          <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-blue-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Tổng đơn hàng</p>
                <p className="text-2xl font-bold text-gray-900">{totalOrders}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <ShoppingBag className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>

          {/* Total Amount */}
          <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-green-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Tổng giá trị</p>
                <p className="text-2xl font-bold text-green-600">{formatPrice(totalAmount)}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <DollarSign className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>

          {/* Total Quantity */}
          <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-purple-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Tổng số lượng</p>
                <p className="text-2xl font-bold text-purple-600">{totalQuantity}</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                <Package className="h-6 w-6 text-purple-600" />
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
              placeholder="Tìm kiếm theo mã đơn, user ID, vehicle ID, màu sắc, trạng thái..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all duration-200"
            />
          </div>
          <button
            onClick={fetchOrders}
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
                <RefreshCw className="h-5 w-5" />
                <span>Làm mới</span>
              </>
            )}
          </button>
          <button
            onClick={handleOpenCreateModal}
            className="px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:from-green-700 hover:to-emerald-700 flex items-center space-x-2 transition-all duration-200 shadow-lg font-medium"
          >
            <Plus className="h-5 w-5" />
            <span>Tạo đơn mới</span>
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mx-6 mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-xl">
            <div className="flex items-center space-x-2">
              <AlertCircle className="h-5 w-5 text-red-500" />
              <p className="text-red-700 font-medium">{error}</p>
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center items-center py-20">
            <div className="text-center">
              <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600 font-medium">Đang tải đơn hàng đại lý...</p>
            </div>
          </div>
        )}

        {/* Orders Table */}
        {!loading && filteredOrders.length > 0 && (
          <div className="mx-6 mb-6 bg-white rounded-2xl shadow-xl overflow-hidden">
            <div className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white p-4">
              <div className="flex items-center justify-between">
                <span className="font-semibold">Danh sách đơn hàng ({filteredOrders.length})</span>
              </div>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Mã đơn
                    </th>
                    <th className="px-6 py-4 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      User ID
                    </th>
                    <th className="px-6 py-4 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Vehicle ID
                    </th>
                    <th className="px-6 py-4 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Số lượng
                    </th>
                    <th className="px-6 py-4 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Màu
                    </th>
                    <th className="px-6 py-4 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Tổng tiền
                    </th>
                    <th className="px-6 py-4 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Ngày đặt
                    </th>
                    <th className="px-6 py-4 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      TT Đơn
                    </th>
                    <th className="px-6 py-4 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      TT Thanh toán
                    </th>
                    <th className="px-6 py-4 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Thao tác
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredOrders.map((order) => (
                    <tr key={order.dealerOrderId} className="hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 transition-all duration-200">
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-2">
                          <Hash className="h-4 w-4 text-gray-400" />
                          <span className="font-semibold text-gray-900">{order.dealerOrderId}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="font-semibold text-blue-600">#{order.userId}</span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="font-semibold text-purple-600">#{order.vehicleId}</span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="font-semibold text-gray-900">{order.quantity}</span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        {order.color ? (
                          <span className="inline-flex items-center px-3 py-1 bg-gray-100 rounded-full text-sm text-gray-900">
                            {order.color}
                          </span>
                        ) : (
                          <span className="text-gray-400 text-sm">N/A</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span className="font-bold text-green-600">{formatPrice(order.totalAmount)}</span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="inline-flex items-center space-x-2 text-sm text-gray-600">
                          <Calendar className="h-4 w-4" />
                          <span>{formatDate(order.orderDate)}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        {getStatusBadge(order.status)}
                      </td>
                      <td className="px-6 py-4 text-center">
                        {getPaymentStatusBadge(order.paymentStatus)}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <button
                          onClick={() => handleViewOrder(order)}
                          className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg hover:from-blue-600 hover:to-indigo-700 transition-all duration-200 shadow-md hover:shadow-lg"
                        >
                          <Eye className="h-4 w-4" />
                          Xem
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* No Results */}
        {!loading && filteredOrders.length === 0 && orders.length === 0 && (
          <div className="mx-6 mb-6 bg-white rounded-2xl shadow-xl p-12 text-center">
            <div className="w-24 h-24 bg-gradient-to-r from-blue-100 to-indigo-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Package className="h-12 w-12 text-blue-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Chưa có đơn hàng đại lý</h3>
            <p className="text-gray-600">Đơn hàng từ đại lý sẽ xuất hiện ở đây</p>
          </div>
        )}

        {!loading && filteredOrders.length === 0 && orders.length > 0 && (
          <div className="mx-6 mb-6 bg-white rounded-2xl shadow-xl p-12 text-center">
            <div className="w-24 h-24 bg-gradient-to-r from-orange-100 to-yellow-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Search className="h-12 w-12 text-orange-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Không tìm thấy kết quả</h3>
            <p className="text-gray-600">Không có đơn hàng nào phù hợp với từ khóa "{searchTerm}"</p>
          </div>
        )}

        {/* Detail Modal */}
        {showDetailModal && selectedOrder && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-3xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
              {/* Modal Header */}
              <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6 rounded-t-3xl">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-white bg-opacity-20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                      <Package className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold">Chi tiết đơn hàng</h2>
                      <p className="text-blue-100 mt-1">Mã đơn: #{selectedOrder.dealerOrderId}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowDetailModal(false)}
                    className="text-white hover:bg-white hover:bg-opacity-20 rounded-xl p-2 transition-all duration-200"
                  >
                    <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>

              {loadingDetail ? (
                <div className="p-12 text-center">
                  <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
                  <p className="text-gray-600 font-medium">Đang tải chi tiết...</p>
                </div>
              ) : (
                <div className="p-8 space-y-6">
                  {/* Order Information */}
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 border-l-4 border-blue-500">
                    <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center space-x-2">
                      <Package className="h-5 w-5 text-blue-600" />
                      <span>Thông tin đơn hàng</span>
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex justify-between items-center py-2 border-b border-blue-200">
                        <span className="text-gray-600 font-medium">Mã đơn:</span>
                        <span className="font-bold text-gray-900">#{selectedOrder.dealerOrderId}</span>
                      </div>
                      <div className="flex justify-between items-center py-2 border-b border-blue-200">
                        <span className="text-gray-600 font-medium flex items-center space-x-2">
                          <User className="h-4 w-4" />
                          <span>User ID:</span>
                        </span>
                        <span className="font-bold text-blue-600">#{selectedOrder.userId}</span>
                      </div>
                      <div className="flex justify-between items-center py-2 border-b border-blue-200">
                        <span className="text-gray-600 font-medium flex items-center space-x-2">
                          <Car className="h-4 w-4" />
                          <span>Vehicle ID:</span>
                        </span>
                        <span className="font-bold text-purple-600">#{selectedOrder.vehicleId}</span>
                      </div>
                      <div className="flex justify-between items-center py-2 border-b border-blue-200">
                        <span className="text-gray-600 font-medium">Số lượng:</span>
                        <span className="font-semibold text-gray-900">{selectedOrder.quantity}</span>
                      </div>
                      <div className="flex justify-between items-center py-2 border-b border-blue-200">
                        <span className="text-gray-600 font-medium">Màu sắc:</span>
                        {selectedOrder.color ? (
                          <span className="inline-flex items-center px-3 py-1 bg-white rounded-full text-sm font-semibold text-gray-900 border border-blue-200">
                            {selectedOrder.color}
                          </span>
                        ) : (
                          <span className="text-gray-400">N/A</span>
                        )}
                      </div>
                      <div className="flex justify-between items-center py-2 border-b border-blue-200">
                        <span className="text-gray-600 font-medium">Ngày đặt:</span>
                        <span className="font-semibold text-gray-900">{formatDate(selectedOrder.orderDate)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Status Information */}
                  <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-6 border-l-4 border-purple-500">
                    <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center space-x-2">
                      <AlertCircle className="h-5 w-5 text-purple-600" />
                      <span>Trạng thái</span>
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex justify-between items-center py-2 border-b border-purple-200">
                        <span className="text-gray-600 font-medium">Trạng thái đơn hàng:</span>
                        {getStatusBadge(selectedOrder.status)}
                      </div>
                      <div className="flex justify-between items-center py-2 border-b border-purple-200">
                        <span className="text-gray-600 font-medium">Trạng thái thanh toán:</span>
                        {getPaymentStatusBadge(selectedOrder.paymentStatus)}
                      </div>
                    </div>
                  </div>

                  {/* Payment Information */}
                  <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-6 border-l-4 border-green-500">
                    <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center space-x-2">
                      <DollarSign className="h-5 w-5 text-green-600" />
                      <span>Thông tin thanh toán</span>
                    </h3>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center py-2">
                        <span className="text-gray-600 font-medium">Tổng giá trị đơn hàng:</span>
                        <span className="font-bold text-green-600 text-2xl">{formatPrice(selectedOrder.totalAmount)}</span>
                      </div>
                      <div className="bg-white rounded-xl p-4 border border-green-200">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Đơn giá (TB):</span>
                          <span className="text-sm font-semibold text-gray-900">
                            {formatPrice(selectedOrder.totalAmount / selectedOrder.quantity)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex justify-between items-center pt-4 border-t">
                    <button
                      onClick={() => handleDeleteOrder(selectedOrder.dealerOrderId)}
                      disabled={loading}
                      className="px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl hover:from-red-600 hover:to-red-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 transition-all duration-200 font-medium"
                    >
                      <Trash2 className="h-4 w-4" />
                      <span>Xóa</span>
                    </button>
                    <div className="flex space-x-3">
                      <button
                        onClick={() => {
                          handleOpenEditModal(selectedOrder);
                          setShowDetailModal(false);
                        }}
                        disabled={loading}
                        className="px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl hover:from-blue-600 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 transition-all duration-200 font-medium"
                      >
                        <Edit className="h-4 w-4" />
                        <span>Sửa</span>
                      </button>
                      <button
                        onClick={() => setShowDetailModal(false)}
                        className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-all duration-200 font-medium"
                      >
                        Đóng
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Create Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              {/* Modal Header */}
              <div className="sticky top-0 bg-gradient-to-r from-green-600 to-emerald-600 text-white p-6 rounded-t-3xl">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-white bg-opacity-20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                      <Plus className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold">Tạo đơn hàng mới</h2>
                      <p className="text-green-100 mt-1">Nhập thông tin đơn hàng đại lý</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowCreateModal(false)}
                    className="text-white hover:bg-white hover:bg-opacity-20 rounded-xl p-2 transition-all duration-200"
                  >
                    <X className="h-6 w-6" />
                  </button>
                </div>
              </div>

              {/* Form */}
              <div className="p-8 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      <User className="inline h-4 w-4 mr-1" />
                      User ID *
                    </label>
                    <input
                      type="number"
                      value={formData.userId === 0 ? '' : formData.userId}
                      onChange={(e) => setFormData({...formData, userId: Number(e.target.value) || 0})}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:ring-2 focus:ring-green-100 transition-all duration-200 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                      placeholder="Nhập User ID"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      <Car className="inline h-4 w-4 mr-1" />
                      Vehicle ID *
                    </label>
                    <input
                      type="number"
                      value={formData.vehicleId === 0 ? '' : formData.vehicleId}
                      onChange={(e) => setFormData({...formData, vehicleId: Number(e.target.value) || 0})}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:ring-2 focus:ring-green-100 transition-all duration-200 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                      placeholder="Nhập Vehicle ID"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Số lượng *
                    </label>
                    <input
                      type="number"
                      value={formData.quantity}
                      onChange={(e) => setFormData({...formData, quantity: Number(e.target.value) || 1})}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:ring-2 focus:ring-green-100 transition-all duration-200 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                      min="1"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Màu sắc
                    </label>
                    <input
                      type="text"
                      value={formData.color}
                      onChange={(e) => setFormData({...formData, color: e.target.value})}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:ring-2 focus:ring-green-100 transition-all duration-200"
                      placeholder="Nhập màu (tùy chọn)"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      <DollarSign className="inline h-4 w-4 mr-1" />
                      Tổng tiền *
                    </label>
                    <input
                      type="number"
                      value={formData.totalAmount === 0 ? '' : formData.totalAmount}
                      onChange={(e) => setFormData({...formData, totalAmount: Number(e.target.value) || 0})}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:ring-2 focus:ring-green-100 transition-all duration-200 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                      placeholder="Nhập tổng tiền"
                      min="0"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      <Calendar className="inline h-4 w-4 mr-1" />
                      Ngày đặt *
                    </label>
                    <input
                      type="datetime-local"
                      value={formData.orderDate}
                      onChange={(e) => setFormData({...formData, orderDate: e.target.value})}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:ring-2 focus:ring-green-100 transition-all duration-200"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Trạng thái đơn *
                    </label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({...formData, status: e.target.value})}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:ring-2 focus:ring-green-100 transition-all duration-200"
                      required
                    >
                      <option value="PENDING">Chờ xử lý</option>
                      <option value="CONFIRMED">Đã xác nhận</option>
                      <option value="PROCESSING">Đang xử lý</option>
                      <option value="COMPLETED">Hoàn thành</option>
                      <option value="CANCELLED">Đã hủy</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Trạng thái thanh toán *
                    </label>
                    <select
                      value={formData.paymentStatus}
                      onChange={(e) => setFormData({...formData, paymentStatus: e.target.value})}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:ring-2 focus:ring-green-100 transition-all duration-200"
                      required
                    >
                      <option value="UNPAID">Chưa xử lý</option>
                      <option value="PAID">Đã xác nhận</option>
                      <option value="PARTIAL">Xử lý 1 phần</option>
                      <option value="PENDING">Đang xử lý</option>
                    </select>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end space-x-3 pt-4 border-t">
                  <button
                    onClick={() => setShowCreateModal(false)}
                    className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-all duration-200 font-medium"
                  >
                    Hủy
                  </button>
                  <button
                    onClick={handleCreateOrder}
                    disabled={loading}
                    className="px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:from-green-700 hover:to-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 transition-all duration-200 font-medium"
                  >
                    <Plus className="h-4 w-4" />
                    <span>Tạo đơn</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Edit Modal */}
        {showEditModal && selectedOrder && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              {/* Modal Header */}
              <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6 rounded-t-3xl">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-white bg-opacity-20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                      <Edit className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold">Sửa đơn hàng</h2>
                      <p className="text-blue-100 mt-1">Mã đơn: #{selectedOrder.dealerOrderId}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowEditModal(false)}
                    className="text-white hover:bg-white hover:bg-opacity-20 rounded-xl p-2 transition-all duration-200"
                  >
                    <X className="h-6 w-6" />
                  </button>
                </div>
              </div>

              {/* Form */}
              <div className="p-8 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      <User className="inline h-4 w-4 mr-1" />
                      User ID *
                    </label>
                    <input
                      type="number"
                      value={formData.userId === 0 ? '' : formData.userId}
                      onChange={(e) => setFormData({...formData, userId: Number(e.target.value) || 0})}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all duration-200 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                      placeholder="Nhập User ID"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      <Car className="inline h-4 w-4 mr-1" />
                      Vehicle ID *
                    </label>
                    <input
                      type="number"
                      value={formData.vehicleId === 0 ? '' : formData.vehicleId}
                      onChange={(e) => setFormData({...formData, vehicleId: Number(e.target.value) || 0})}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all duration-200 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                      placeholder="Nhập Vehicle ID"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Số lượng *
                    </label>
                    <input
                      type="number"
                      value={formData.quantity}
                      onChange={(e) => setFormData({...formData, quantity: Number(e.target.value) || 1})}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all duration-200 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                      min="1"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Màu sắc
                    </label>
                    <input
                      type="text"
                      value={formData.color}
                      onChange={(e) => setFormData({...formData, color: e.target.value})}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all duration-200"
                      placeholder="Nhập màu (tùy chọn)"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      <DollarSign className="inline h-4 w-4 mr-1" />
                      Tổng tiền *
                    </label>
                    <input
                      type="number"
                      value={formData.totalAmount === 0 ? '' : formData.totalAmount}
                      onChange={(e) => setFormData({...formData, totalAmount: Number(e.target.value) || 0})}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all duration-200 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                      placeholder="Nhập tổng tiền"
                      min="0"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      <Calendar className="inline h-4 w-4 mr-1" />
                      Ngày đặt *
                    </label>
                    <input
                      type="datetime-local"
                      value={formData.orderDate}
                      onChange={(e) => setFormData({...formData, orderDate: e.target.value})}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all duration-200"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Trạng thái đơn *
                    </label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({...formData, status: e.target.value})}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all duration-200"
                      required
                    >
                      <option value="PENDING">Chờ xử lý</option>
                      <option value="CONFIRMED">Đã xác nhận</option>
                      <option value="PROCESSING">Đang xử lý</option>
                      <option value="COMPLETED">Hoàn thành</option>
                      <option value="CANCELLED">Đã hủy</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Trạng thái thanh toán *
                    </label>
                    <select
                      value={formData.paymentStatus}
                      onChange={(e) => setFormData({...formData, paymentStatus: e.target.value})}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all duration-200"
                      required
                    >
                      <option value="UNPAID">Chưa xử lý</option>
                      <option value="PAID">Đã xử lý</option>
                      <option value="PARTIAL">Xử lý 1 phần</option>
                      <option value="PENDING">Đang xử lý</option>
                    </select>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end space-x-3 pt-4 border-t">
                  <button
                    onClick={() => setShowEditModal(false)}
                    className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-all duration-200 font-medium"
                  >
                    Hủy
                  </button>
                  <button
                    onClick={handleUpdateOrder}
                    disabled={loading}
                    className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 transition-all duration-200 font-medium"
                  >
                    <Edit className="h-4 w-4" />
                    <span>Cập nhật</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

