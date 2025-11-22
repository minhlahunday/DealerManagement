import React, { useState, useEffect } from 'react';
import { Search, CreditCard, Calendar, FileText, Eye, AlertCircle, CheckCircle, Clock, Edit, Trash2, Plus } from 'lucide-react';
import { paymentService, Payment, UpdatePaymentRequest, CreatePaymentRequest } from '../../../services/paymentService';

export const PaymentManagement: React.FC = () => {

  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [creatingPayment, setCreatingPayment] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingPayment, setEditingPayment] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletingPayment, setDeletingPayment] = useState(false);
  const [paymentToDelete, setPaymentToDelete] = useState<Payment | null>(null);
  const [createForm, setCreateForm] = useState<Payment>({
    paymentId: 0,
    orderId: 0,
    paymentDate: new Date().toISOString().slice(0, 16),
    amount: 0,
    method: '',
    status: 'PENDING'
  });
  const [editForm, setEditForm] = useState<Payment>({
    paymentId: 0,
    orderId: 0,
    paymentDate: '',
    amount: 0,
    method: '',
    status: ''
  });

  // Load payments when component mounts
  useEffect(() => {
    fetchPayments();
  }, []);

  // Fetch payments from API
  const fetchPayments = async () => {
    setLoading(true);
    setError(null);

    try {
      console.log('🔍 Fetching payments from API...');
      const response = await paymentService.getPayments();
      console.log('📡 Payments API Response:', response);

      if (response.success) {
        const paymentsList = response.data || [];
        
        setPayments(paymentsList);
        console.log('✅ Thanh toán đã tải từ API:', paymentsList.length);
      } else {
        console.log('❌ API trả về success=false');
        setPayments([]);
      }
    } catch (error) {
      console.error('Failed to fetch payments:', error);
      setError(error instanceof Error ? error.message : 'Lỗi khi tải danh sách thanh toán');
      setPayments([]);
    } finally {
      setLoading(false);
    }
  };

  // Create payment
  const handleCreatePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreatingPayment(true);

    try {
      const paymentData: CreatePaymentRequest = {
        paymentId: 0, // Will be set by backend
        orderId: createForm.orderId,
        paymentDate: new Date(createForm.paymentDate).toISOString(),
        amount: Number(createForm.amount) || 0,
        method: createForm.method,
        status: createForm.status
      };

      console.log('🔄 Creating payment with data:', paymentData);
      const response = await paymentService.createPayment(paymentData);

      if (response.success) {
        console.log('✅ Payment created successfully:', response);
        setShowCreateModal(false);
        // Reset form
        setCreateForm({
          paymentId: 0,
          orderId: 0,
          paymentDate: new Date().toISOString().slice(0, 16),
          amount: 0,
          method: '',
          status: 'PENDING'
        });
        // Refresh payments list
        await fetchPayments();
        alert('✅ Thanh toán đã được tạo thành công!');
      } else {
        console.error('❌ Failed to create payment:', response.message);
        alert(`❌ Lỗi khi tạo thanh toán: ${response.message}`);
      }
    } catch (error) {
      console.error('❌ Error creating payment:', error);
      alert(`Lỗi khi tạo thanh toán: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setCreatingPayment(false);
    }
  };

  // View payment details
  const handleViewPayment = (payment: Payment) => {
    setSelectedPayment(payment);
    setShowDetailModal(true);
  };

  // Edit payment
  const handleEditPayment = (payment: Payment) => {
    console.log('✏️ Opening edit modal for payment:', payment.paymentId);
    
    // Format date for input[type="datetime-local"]
    const formattedDate = payment.paymentDate.includes('T') 
      ? payment.paymentDate.slice(0, 16) 
      : new Date(payment.paymentDate).toISOString().slice(0, 16);
    
    // Populate edit form with payment data
    setEditForm({
      ...payment,
      paymentDate: formattedDate
    });
    
    setShowEditModal(true);
  };

  // Update payment
  const handleUpdatePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setEditingPayment(true);

    try {
      const paymentData: UpdatePaymentRequest = {
        paymentId: editForm.paymentId,
        orderId: editForm.orderId,
        paymentDate: new Date(editForm.paymentDate).toISOString(),
        amount: Number(editForm.amount) || 0,
        method: editForm.method,
        status: editForm.status
      };

      console.log('🔄 Updating payment with data:', paymentData);
      const response = await paymentService.updatePayment(editForm.paymentId, paymentData);

      if (response.success) {
        console.log('✅ Payment updated successfully:', response);
        setShowEditModal(false);
        // Refresh payments list
        await fetchPayments();
        alert('✅ Thanh toán đã được cập nhật thành công!');
      } else {
        console.error('❌ Failed to update payment:', response.message);
        alert(`❌ Lỗi khi cập nhật thanh toán: ${response.message}`);
      }
    } catch (error) {
      console.error('❌ Error updating payment:', error);
      alert(`Lỗi khi cập nhật thanh toán: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setEditingPayment(false);
    }
  };

  // Delete payment
  const handleDeletePayment = (payment: Payment) => {
    console.log('🗑️ Opening delete confirmation for payment:', payment.paymentId);
    setPaymentToDelete(payment);
    setShowDeleteModal(true);
  };

  // Confirm delete payment
  const handleConfirmDelete = async () => {
    if (!paymentToDelete) return;
    
    setDeletingPayment(true);
    try {
      console.log(`🗑️ Deleting payment ${paymentToDelete.paymentId} via API...`);
      const response = await paymentService.deletePayment(paymentToDelete.paymentId);
      
      if (response.success) {
        console.log('✅ Payment deleted successfully');
        setShowDeleteModal(false);
        setPaymentToDelete(null);
        // Refresh payments list
        await fetchPayments();
        alert('✅ Thanh toán đã được xóa thành công!');
      } else {
        console.error('❌ Delete returned success=false:', response.message);
        alert(`❌ Lỗi khi xóa thanh toán: ${response.message}`);
      }
    } catch (error) {
      console.error('❌ Error deleting payment:', error);
      alert(`❌ Lỗi khi xóa thanh toán: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setDeletingPayment(false);
    }
  };

  // Filter payments
  const filteredPayments = payments.filter(payment =>
    payment.paymentId.toString().includes(searchTerm) ||
    payment.orderId.toString().includes(searchTerm) ||
    payment.method.toLowerCase().includes(searchTerm.toLowerCase()) ||
    payment.status.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getMethodBadge = (method: string) => {
    switch (method) {
      case 'CREDIT_CARD':
        return { bg: 'bg-blue-100', text: 'text-blue-800', label: 'Thẻ tín dụng' };
      case 'BANK_TRANSFER':
        return { bg: 'bg-green-100', text: 'text-green-800', label: 'Chuyển khoản' };
      case 'CASH':
        return { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Tiền mặt' };
      case 'E_WALLET':
        return { bg: 'bg-purple-100', text: 'text-purple-800', label: 'Ví điện tử' };
      case 'REFUND':
        return { bg: 'bg-orange-100', text: 'text-orange-800', label: 'Hoàn tiền' };
      default:
        return { bg: 'bg-gray-100', text: 'text-gray-800', label: method };
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING':
        return { bg: 'bg-yellow-100', text: 'text-yellow-800', icon: <Clock className="h-4 w-4" />, label: 'Chờ xử lý' };
      case 'COMPLETED':
        return { bg: 'bg-green-100', text: 'text-green-800', icon: <CheckCircle className="h-4 w-4" />, label: 'Hoàn thành' };
      case 'FAILED':
        return { bg: 'bg-red-100', text: 'text-red-800', icon: <AlertCircle className="h-4 w-4" />, label: 'Thất bại' };
      case 'REFUNDED':
        return { bg: 'bg-orange-100', text: 'text-orange-800', icon: <AlertCircle className="h-4 w-4" />, label: 'Đã hoàn tiền' };
      case 'CANCELLED':
        return { bg: 'bg-gray-100', text: 'text-gray-800', icon: <AlertCircle className="h-4 w-4" />, label: 'Đã hủy' };
      default:
        return { bg: 'bg-gray-100', text: 'text-gray-800', icon: <AlertCircle className="h-4 w-4" />, label: status };
    }
  };

  // Calculate statistics
  const totalPayments = payments.length;
  const pendingPayments = payments.filter(p => p.status === 'PENDING').length;
  const completedPayments = payments.filter(p => p.status === 'COMPLETED').length;
  const refundedPayments = payments.filter(p => p.status === 'REFUNDED').length;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-8 border border-blue-200 mb-6">
        <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center space-y-4 lg:space-y-0">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
              <CreditCard className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-gray-900">Quản lý thanh toán</h1>
              <p className="text-gray-600 mt-1">Theo dõi và quản lý các giao dịch thanh toán</p>
            </div>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="text-center bg-white rounded-xl p-3 shadow-sm">
              <div className="text-2xl font-bold text-blue-600">{totalPayments}</div>
              <div className="text-xs text-gray-600">Tổng số</div>
            </div>
            <div className="text-center bg-white rounded-xl p-3 shadow-sm">
              <div className="text-2xl font-bold text-yellow-600">{pendingPayments}</div>
              <div className="text-xs text-gray-600">Chờ xử lý</div>
            </div>
            <div className="text-center bg-white rounded-xl p-3 shadow-sm">
              <div className="text-2xl font-bold text-green-600">{completedPayments}</div>
              <div className="text-xs text-gray-600">Hoàn thành</div>
            </div>
            <div className="text-center bg-white rounded-xl p-3 shadow-sm">
              <div className="text-2xl font-bold text-orange-600">{refundedPayments}</div>
              <div className="text-xs text-gray-600">Đã hoàn tiền</div>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Actions Section */}
      <div className="bg-white rounded-2xl p-6 mt-6 mb-6 shadow-sm border border-gray-200">
        <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center space-y-4 lg:space-y-0">
          <div className="relative max-w-md">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Tìm kiếm thanh toán..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-gray-50 focus:bg-white"
            />
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={fetchPayments}
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
            {/* <button
              onClick={() => setShowCreateModal(true)}
              className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-6 py-3 rounded-xl font-medium flex items-center space-x-2 shadow-lg transition-all duration-200 transform hover:scale-105"
            >
              <Plus className="h-5 w-5" />
              <span>Tạo thanh toán</span>
            </button> */}
          </div>
        </div>
      </div>

      {/* Loading Spinner */}
      {loading && (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-gray-600">Đang tải danh sách thanh toán...</span>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <AlertCircle className="h-5 w-5 text-red-400" />
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

      {/* Payments Grid */}
      {!loading && filteredPayments.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPayments.map((payment) => {
            const methodBadge = getMethodBadge(payment.method);
            const statusBadge = getStatusBadge(payment.status);

            return (
              <div
                key={payment.paymentId}
                className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:scale-105"
              >
                {/* Card Header */}
                <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-white text-sm font-semibold">#{payment.paymentId}</span>
                    <div className={`flex items-center space-x-1 px-3 py-1 rounded-full ${statusBadge.bg}`}>
                      {statusBadge.icon}
                      <span className={`text-xs font-medium ${statusBadge.text}`}>{statusBadge.label}</span>
                    </div>
                  </div>
                  <div className="text-3xl font-bold text-white">{formatPrice(payment.amount)}</div>
                </div>

                {/* Card Body */}
                <div className="p-4 space-y-3">
                  <div className="flex items-center space-x-2 text-gray-600">
                    <FileText className="h-4 w-4 text-blue-600" />
                    <span className="text-sm">Đơn hàng: <span className="font-semibold text-gray-900">#{payment.orderId}</span></span>
                  </div>

                  <div className="flex items-center space-x-2 text-gray-600">
                    <Calendar className="h-4 w-4 text-green-600" />
                    <span className="text-sm">{formatDate(payment.paymentDate)}</span>
                  </div>

                  <div className="flex items-center space-x-2">
                    <CreditCard className="h-4 w-4 text-purple-600" />
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${methodBadge.bg} ${methodBadge.text}`}>
                      {methodBadge.label}
                    </span>
                  </div>
                </div>

                {/* Card Footer */}
                <div className="bg-gray-50 px-4 py-3 border-t border-gray-200">
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      onClick={() => handleEditPayment(payment)}
                      className="bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white px-3 py-2 rounded-xl font-medium flex items-center justify-center space-x-1 transition-all duration-200 shadow-md text-sm"
                    >
                      <Edit className="h-4 w-4" />
                      <span>Sửa</span>
                    </button>
                    <button
                      onClick={() => handleViewPayment(payment)}
                      className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-3 py-2 rounded-xl font-medium flex items-center justify-center space-x-1 transition-all duration-200 shadow-md text-sm"
                    >
                      <Eye className="h-4 w-4" />
                      <span>Xem</span>
                    </button>
                    <button
                      onClick={() => handleDeletePayment(payment)}
                      className="bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 text-white px-3 py-2 rounded-xl font-medium flex items-center justify-center space-x-1 transition-all duration-200 shadow-md text-sm"
                    >
                      <Trash2 className="h-4 w-4" />
                      <span>Xóa</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Empty State */}
      {!loading && filteredPayments.length === 0 && payments.length === 0 && (
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-12 text-center">
          <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <CreditCard className="h-12 w-12 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Chưa có thanh toán nào</h3>
          <p className="text-gray-600">Hiện tại chưa có giao dịch thanh toán nào trong hệ thống.</p>
        </div>
      )}

      {/* No Results */}
      {!loading && filteredPayments.length === 0 && payments.length > 0 && (
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-12 text-center">
          <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <Search className="h-12 w-12 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Không tìm thấy kết quả</h3>
          <p className="text-gray-600">Không có thanh toán nào phù hợp với tìm kiếm của bạn.</p>
        </div>
      )}

      {/* Payment Detail Modal */}
      {showDetailModal && selectedPayment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-[9999]">
          <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl transform transition-all">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white p-6 rounded-t-2xl">
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-white bg-opacity-20 rounded-xl flex items-center justify-center">
                    <CreditCard className="h-6 w-6" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">Chi tiết thanh toán #{selectedPayment.paymentId}</h2>
                    <p className="text-blue-100 text-sm">Thông tin chi tiết giao dịch</p>
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
            <div className="p-6 space-y-6">
              {/* Amount Section */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200">
                <div className="text-center">
                  <p className="text-sm text-gray-600 mb-2">Số tiền thanh toán</p>
                  <p className="text-4xl font-bold text-blue-600">{formatPrice(selectedPayment.amount)}</p>
                </div>
              </div>

              {/* Details Grid */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded-xl p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <FileText className="h-5 w-5 text-blue-600" />
                    <p className="text-sm text-gray-600">Mã thanh toán</p>
                  </div>
                  <p className="text-lg font-semibold text-gray-900">#{selectedPayment.paymentId}</p>
                </div>

                <div className="bg-gray-50 rounded-xl p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <FileText className="h-5 w-5 text-green-600" />
                    <p className="text-sm text-gray-600">Mã đơn hàng</p>
                  </div>
                  <p className="text-lg font-semibold text-gray-900">#{selectedPayment.orderId}</p>
                </div>

                <div className="bg-gray-50 rounded-xl p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <Calendar className="h-5 w-5 text-purple-600" />
                    <p className="text-sm text-gray-600">Ngày thanh toán</p>
                  </div>
                  <p className="text-sm font-semibold text-gray-900">{formatDate(selectedPayment.paymentDate)}</p>
                </div>

                <div className="bg-gray-50 rounded-xl p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <CreditCard className="h-5 w-5 text-orange-600" />
                    <p className="text-sm text-gray-600">Phương thức</p>
                  </div>
                  <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getMethodBadge(selectedPayment.method).bg} ${getMethodBadge(selectedPayment.method).text}`}>
                    {getMethodBadge(selectedPayment.method).label}
                  </span>
                </div>
              </div>

              {/* Status Section */}
              <div className="bg-gray-50 rounded-xl p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-2">Trạng thái</p>
                    <div className={`inline-flex items-center space-x-2 px-4 py-2 rounded-full ${getStatusBadge(selectedPayment.status).bg}`}>
                      {getStatusBadge(selectedPayment.status).icon}
                      <span className={`font-semibold ${getStatusBadge(selectedPayment.status).text}`}>
                        {getStatusBadge(selectedPayment.status).label}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="bg-gray-50 px-6 py-4 rounded-b-2xl flex justify-end">
              <button
                onClick={() => setShowDetailModal(false)}
                className="px-6 py-3 border-2 border-gray-300 rounded-xl text-gray-700 hover:bg-white hover:border-gray-400 transition-all duration-200 font-medium"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Payment Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-[9999]">
          <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl transform transition-all max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white p-6 rounded-t-2xl sticky top-0 z-10">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="bg-white/20 p-3 rounded-xl backdrop-blur-sm">
                    <Plus className="h-6 w-6" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">Tạo Thanh Toán Mới</h2>
                    <p className="text-green-100 text-sm mt-1">Thêm thanh toán mới vào hệ thống</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="text-white hover:bg-white/20 p-2 rounded-lg transition-colors"
                  disabled={creatingPayment}
                >
                  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleCreatePayment} className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Order ID */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    <FileText className="inline h-4 w-4 mr-2 text-blue-600" />
                    Order ID
                  </label>
                  <input
                    type="number"
                    required
                    value={createForm.orderId === 0 ? '' : createForm.orderId}
                    onChange={(e) => setCreateForm({ ...createForm, orderId: Number(e.target.value) || 0 })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    placeholder="Nhập Order ID"
                  />
                </div>

                {/* Amount */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    <CreditCard className="inline h-4 w-4 mr-2 text-green-600" />
                    Số tiền
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      value={createForm.amount === 0 ? '' : new Intl.NumberFormat('vi-VN').format(createForm.amount)}
                      onChange={(e) => {
                        const numericValue = e.target.value.replace(/\D/g, '');
                        setCreateForm({ ...createForm, amount: parseFloat(numericValue) || 0 });
                      }}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 bg-gray-50 focus:bg-white"
                      placeholder="Nhập số tiền"
                    />
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                      <span className="text-gray-400 text-sm">VND</span>
                    </div>
                  </div>
                </div>

                {/* Payment Date */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    <Calendar className="inline h-4 w-4 mr-2 text-indigo-600" />
                    Ngày thanh toán
                  </label>
                  <input
                    type="datetime-local"
                    required
                    value={createForm.paymentDate}
                    onChange={(e) => setCreateForm({ ...createForm, paymentDate: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200"
                  />
                </div>

                {/* Payment Method */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    <CreditCard className="inline h-4 w-4 mr-2 text-purple-600" />
                    Phương thức thanh toán
                  </label>
                  <select
                    required
                    value={createForm.method}
                    onChange={(e) => setCreateForm({ ...createForm, method: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 bg-white"
                  >
                    <option value="">Chọn phương thức</option>
                    <option value="CREDIT_CARD">Thẻ tín dụng</option>
                    <option value="BANK_TRANSFER">Chuyển khoản</option>
                    <option value="CASH">Tiền mặt</option>
                    <option value="E_WALLET">Ví điện tử</option>
                    <option value="REFUND">Hoàn tiền</option>
                  </select>
                </div>

                {/* Status */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    <CheckCircle className="inline h-4 w-4 mr-2 text-green-600" />
                    Trạng thái
                  </label>
                  <select
                    required
                    value={createForm.status}
                    onChange={(e) => setCreateForm({ ...createForm, status: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 bg-white"
                  >
                    <option value="PENDING">Chờ xử lý</option>
                    <option value="COMPLETED">Hoàn thành</option>
                    <option value="FAILED">Thất bại</option>
                    <option value="REFUNDED">Đã hoàn tiền</option>
                    <option value="CANCELLED">Đã hủy</option>
                  </select>
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-end space-x-4 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-all duration-200"
                  disabled={creatingPayment}
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={creatingPayment}
                  className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-8 py-3 rounded-xl font-medium shadow-lg transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                >
                  {creatingPayment ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      <span>Đang tạo...</span>
                    </>
                  ) : (
                    <>
                      <Plus className="h-5 w-5" />
                      <span>Tạo thanh toán</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Payment Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-[9999]">
          <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl transform transition-all max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="bg-gradient-to-r from-orange-500 to-red-600 text-white p-6 rounded-t-2xl sticky top-0 z-10">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="bg-white/20 p-3 rounded-xl backdrop-blur-sm">
                    <Edit className="h-6 w-6" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">Chỉnh Sửa Thanh Toán</h2>
                    <p className="text-orange-100 text-sm mt-1">Cập nhật thông tin thanh toán #{editForm.paymentId}</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowEditModal(false)}
                  className="text-white hover:bg-white/20 p-2 rounded-lg transition-colors"
                  disabled={editingPayment}
                >
                  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleUpdatePayment} className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Order ID (Read-only) */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    <FileText className="inline h-4 w-4 mr-2 text-blue-600" />
                    Order ID
                  </label>
                  <input
                    type="number"
                    value={editForm.orderId}
                    readOnly
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl bg-gray-100 text-gray-600 cursor-not-allowed"
                  />
                </div>

                {/* Amount */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    <CreditCard className="inline h-4 w-4 mr-2 text-green-600" />
                    Số tiền
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      value={editForm.amount === 0 ? '' : new Intl.NumberFormat('vi-VN').format(editForm.amount)}
                      readOnly
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl bg-gray-100 text-gray-600 cursor-not-allowed"
                      placeholder="Nhập số tiền"
                    />
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                      <span className="text-gray-400 text-sm">VND</span>
                    </div>
                  </div>
                </div>

                {/* Payment Date */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    <Calendar className="inline h-4 w-4 mr-2 text-indigo-600" />
                    Ngày thanh toán
                  </label>
                  <input
                    type="datetime-local"
                    required
                    value={editForm.paymentDate}
                    onChange={(e) => setEditForm({ ...editForm, paymentDate: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200"
                  />
                </div>

                {/* Payment Method */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    <CreditCard className="inline h-4 w-4 mr-2 text-purple-600" />
                    Phương thức thanh toán
                  </label>
                  <select
                    required
                    value={editForm.method}
                    onChange={(e) => setEditForm({ ...editForm, method: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200 bg-white"
                  >
                    <option value="">Chọn phương thức</option>
                    <option value="CREDIT_CARD">Thẻ tín dụng</option>
                    <option value="BANK_TRANSFER">Chuyển khoản</option>
                    <option value="CASH">Tiền mặt</option>
                    <option value="E_WALLET">Ví điện tử</option>
                    <option value="REFUND">Hoàn tiền</option>
                  </select>
                </div>

                {/* Status */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    <CheckCircle className="inline h-4 w-4 mr-2 text-green-600" />
                    Trạng thái
                  </label>
                  <select
                    required
                    value={editForm.status}
                    onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200 bg-white"
                  >
                    <option value="">Chọn trạng thái</option>
                    <option value="PENDING">Chờ xử lý</option>
                    <option value="COMPLETED">Hoàn thành</option>
                    <option value="FAILED">Thất bại</option>
                    <option value="REFUNDED">Đã hoàn tiền</option>
                    <option value="CANCELLED">Đã hủy</option>
                  </select>
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-end space-x-4 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-all duration-200"
                  disabled={editingPayment}
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={editingPayment}
                  className="bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white px-8 py-3 rounded-xl font-medium shadow-lg transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                >
                  {editingPayment ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      <span>Đang cập nhật...</span>
                    </>
                  ) : (
                    <>
                      <Edit className="h-5 w-5" />
                      <span>Cập nhật</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && paymentToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-[9999]">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl transform transition-all">
            {/* Header */}
            <div className="bg-gradient-to-r from-red-500 to-pink-600 text-white p-6 rounded-t-2xl">
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-white bg-opacity-20 rounded-xl flex items-center justify-center">
                    <Trash2 className="h-6 w-6" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">Xác nhận xóa</h2>
                    <p className="text-red-100 text-sm">Xóa thanh toán #{paymentToDelete.paymentId}</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="text-white hover:text-red-200 transition-colors p-2 hover:bg-white hover:bg-opacity-10 rounded-lg"
                  disabled={deletingPayment}
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-6">
              <div className="flex items-center space-x-4 mb-6">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                  <AlertCircle className="h-8 w-8 text-red-600" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Bạn có chắc chắn muốn xóa thanh toán này?
                  </h3>
                  <p className="text-gray-600 text-sm">
                    Thanh toán #{paymentToDelete.paymentId} sẽ bị xóa vĩnh viễn và không thể khôi phục.
                  </p>
                </div>
              </div>

              {/* Payment Info */}
              <div className="bg-gray-50 rounded-xl p-4 mb-6">
                <h4 className="text-sm font-semibold text-gray-700 mb-3">Thông tin thanh toán sẽ bị xóa:</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">ID Thanh toán:</span>
                    <span className="font-semibold">#{paymentToDelete.paymentId}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Order ID:</span>
                    <span className="font-semibold">#{paymentToDelete.orderId}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Số tiền:</span>
                    <span className="font-semibold text-red-600">
                      {new Intl.NumberFormat('vi-VN', {
                        style: 'currency',
                        currency: 'VND'
                      }).format(paymentToDelete.amount)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Phương thức:</span>
                    <span className="font-semibold">{paymentToDelete.method}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Trạng thái:</span>
                    <span className="font-semibold">{paymentToDelete.status}</span>
                  </div>
                </div>
              </div>

              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-red-800">Cảnh báo</h3>
                    <div className="mt-2 text-sm text-red-700">
                      <p>Hành động này không thể hoàn tác. Thanh toán sẽ bị xóa vĩnh viễn khỏi hệ thống.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="bg-gray-50 px-6 py-4 rounded-b-2xl flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setShowDeleteModal(false)}
                className="px-6 py-3 border-2 border-gray-300 rounded-xl text-gray-700 hover:bg-white hover:border-gray-400 transition-all duration-200 font-medium"
                disabled={deletingPayment}
              >
                Hủy
              </button>
              <button
                onClick={handleConfirmDelete}
                disabled={deletingPayment}
                className="px-6 py-3 bg-gradient-to-r from-red-600 to-pink-600 text-white rounded-xl hover:from-red-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 transition-all duration-200 font-medium shadow-lg"
              >
                {deletingPayment && (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                )}
                <Trash2 className="h-4 w-4" />
                <span>{deletingPayment ? 'Đang xóa...' : 'Xóa thanh toán'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
      </div>
    </div>
  );
};

