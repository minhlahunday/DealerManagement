import React, { useState, useEffect } from 'react';
import { Search, Package, ShoppingBag, Calendar, RefreshCw, AlertCircle, Eye, Hash, DollarSign, User, Car, Plus, Edit, Trash2, X, Truck, ArrowDownCircle } from 'lucide-react';
import { dealerOrderService, DealerOrder } from '../../../services/dealerOrderService';
import { deliveryService, CreateDeliveryRequest } from '../../../services/deliveryService';
import { inventoryService } from '../../../services/inventoryService';
import { useAuth } from '../../../contexts/AuthContext';
import { vehicleService } from '../../../services/vehicleService';
import { paymentService } from '../../../services/paymentService';
import type { Vehicle } from '../../../types';

interface UserData {
  userId: number;
  username: string;
  email: string;
  roleId: number;
  fullName?: string;
}

interface OrderForm {
  userId: number;
  orderId: number;
  vehicleId: number;
  quantity: number;
  color: string;
  orderDate: string;
  status: string;
  paymentStatus: string;
  totalAmount: number;
}

export const DealerOrderManagement: React.FC = () => {
  const { user } = useAuth();
  const isStaffEVM = user?.role === 'evm_staff';
  
  const [orders, setOrders] = useState<DealerOrder[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<DealerOrder | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [loadingDetail, setLoadingDetail] = useState(false);
  
  // Vehicle data for displaying vehicle model
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  
  // User data for displaying dealer usernames
  const [users, setUsers] = useState<UserData[]>([]);
  
  // Create/Edit Modal States
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [formData, setFormData] = useState<OrderForm>({
    userId: 0,
    orderId: 0,
    vehicleId: 0,
    quantity: 1,
    color: '',
    orderDate: new Date().toISOString().slice(0, 16),
    status: 'PENDING',
    paymentStatus: 'UNPAID',
    totalAmount: 0
  });

  // Delivery Modal States
  const [showCreateDeliveryModal, setShowCreateDeliveryModal] = useState(false);
  const [creatingDelivery, setCreatingDelivery] = useState(false);
  const [selectedOrderForDelivery, setSelectedOrderForDelivery] = useState<DealerOrder | null>(null);
  const [deliveryForm, setDeliveryForm] = useState<CreateDeliveryRequest>({
    deliveryId: 0,
    userId: 0,
    orderId: 0,
    vehicleId: 0,
    deliveryDate: new Date().toISOString().slice(0, 16),
    deliveryStatus: 'PENDING',
    notes: ''
  });

  // Dispatch States
  const [dispatching, setDispatching] = useState<number | null>(null);
  const [dispatchError, setDispatchError] = useState<string | null>(null);

  // Refund States
  const [showRefundModal, setShowRefundModal] = useState(false);
  const [selectedOrderForRefund, setSelectedOrderForRefund] = useState<DealerOrder | null>(null);
  const [refunding, setRefunding] = useState(false);
  const [refundedOrders, setRefundedOrders] = useState<Set<number>>(new Set());

  // Fetch orders on mount
  useEffect(() => {
    fetchOrders();
    fetchVehicles();
    fetchUsers();
    fetchRefundedOrders();
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await dealerOrderService.getDealerOrders();
      console.log('📦 Dealer orders loaded:', data);
      
      setOrders(data);
    } catch (err) {
      console.error('Lỗi khi lấy đơn hàng đại lý:', err);
      setError(`Không thể tải đơn hàng đại lý: ${err instanceof Error ? err.message : 'Lỗi không xác định'}`);
    } finally {
      setLoading(false);
    }
  };

  // Fetch refunded orders to check if order already has refund
  const fetchRefundedOrders = async () => {
    try {
      const response = await paymentService.getPayments();
      if (response.success && response.data) {
        // Lấy danh sách orderIds đã có payment REFUNDED
        const refundedOrderIds = new Set(
          response.data
            .filter(payment => payment.status === 'REFUNDED')
            .map(payment => payment.orderId)
        );
        setRefundedOrders(refundedOrderIds);
        console.log('💰 Refunded orders:', Array.from(refundedOrderIds));
      }
    } catch (err) {
      console.error('Error fetching refunded orders:', err);
    }
  };

  const fetchVehicles = async () => {
    try {
      const response = await vehicleService.getVehicles();
      if (response.success && response.data) {
        setVehicles(response.data);
        console.log('🚗 Vehicles loaded:', response.data);
      }
    } catch (err) {
      console.error('Error fetching vehicles:', err);
    }
  };

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/User', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const result = await response.json();
        const userData = result.data || result;
        setUsers(Array.isArray(userData) ? userData : []);
        console.log('👥 Users loaded:', userData);
      }
    } catch (err) {
      console.error('Error fetching users:', err);
    }
  };

  const getCustomerName = (userId: number): string => {
    // In DealerOrder context, userId represents the dealer's user ID
    const user = users.find(u => u.userId === userId);
    if (user) {
      return user.fullName || user.username || `Dealer`;
    }
    return `Dealer `;
  };

  const getVehicleModel = (vehicleId: number): string => {
    const vehicle = vehicles.find(v => 
      parseInt(v.id) === vehicleId || v.id === vehicleId.toString()
    );
    return vehicle ? vehicle.model : `ID: ${vehicleId}`;
  };

  // View order detail
  const handleViewOrder = async (order: DealerOrder) => {
    setLoadingDetail(true);
    setShowDetailModal(true);
    try {
      setSelectedOrder(order);
      console.log('👁️ Viewing dealer order detail:', order);
    } catch (err) {
      console.error('Lỗi khi lấy chi tiết đơn hàng:', err);
      alert(`Không thể tải chi tiết: ${err instanceof Error ? err.message : 'Lỗi không xác định'}`);
      setShowDetailModal(false);
    } finally {
      setLoadingDetail(false);
    }
  };

  // Open edit modal
  const handleOpenEditModal = (order: DealerOrder) => {
    setFormData({
      userId: order.userId,
      orderId: order.orderId,
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
      console.error('Lỗi khi tạo đơn hàng:', err);
      alert(`❌ Không thể tạo đơn hàng: ${err instanceof Error ? err.message : 'Lỗi không xác định'}`);
    } finally {
      setLoading(false);
    }
  };

  // Update order
  const handleUpdateOrder = async () => {
    if (!selectedOrder) return;

    try {
      // Nếu là evm_staff, chỉ cập nhật status, giữ nguyên các giá trị khác từ selectedOrder
      if (isStaffEVM) {
        setLoading(true);
        await dealerOrderService.updateDealerOrder(selectedOrder.dealerOrderId, {
          dealerOrderId: selectedOrder.dealerOrderId,
          userId: selectedOrder.userId,
          orderId: selectedOrder.orderId,
          vehicleId: selectedOrder.vehicleId,
          quantity: selectedOrder.quantity,
          color: selectedOrder.color || '',
          orderDate: selectedOrder.orderDate,
          status: formData.status, // Chỉ cập nhật status
          paymentStatus: selectedOrder.paymentStatus,
          totalAmount: selectedOrder.totalAmount
        });
        alert('✅ Cập nhật trạng thái đơn hàng thành công!');
        setShowEditModal(false);
        setShowDetailModal(false);
        await fetchOrders();
      } else {
        // Nếu không phải evm_staff, kiểm tra validation đầy đủ
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
      }
    } catch (err) {
      console.error('Lỗi khi cập nhật đơn hàng:', err);
      alert(`❌ Không thể cập nhật đơn hàng: ${err instanceof Error ? err.message : 'Lỗi không xác định'}`);
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
      console.error('Lỗi khi xóa đơn hàng:', err);
      alert(`❌ Không thể xóa đơn hàng: ${err instanceof Error ? err.message : 'Lỗi không xác định'}`);
    } finally {
      setLoading(false);
    }
  };

  // Open create delivery modal
  const handleOpenCreateDeliveryModal = (order: DealerOrder) => {
    setSelectedOrderForDelivery(order);
    setDeliveryForm({
      deliveryId: 0,
      userId: order.userId,
      orderId: order.orderId, // Get orderId from DealerOrder (FK to Orders table)
      vehicleId: order.vehicleId,
      deliveryDate: new Date().toISOString().slice(0, 16),
      deliveryStatus: 'PENDING',
      notes: `Vận chuyển cho đơn hàng đại lý #${order.dealerOrderId} - Vehicle #${order.vehicleId}`
    });
    setShowCreateDeliveryModal(true);
  };

  // Handle dispatch inventory
  const handleDispatchInventory = async (order: DealerOrder) => {
    // Validation ở frontend
    if (!order.vehicleId || order.vehicleId <= 0) {
      alert('❌ Lỗi: Vehicle ID không hợp lệ. Vui lòng kiểm tra lại đơn hàng.');
      return;
    }

    if (!order.quantity || order.quantity <= 0) {
      alert('❌ Lỗi: Số lượng xe không hợp lệ. Vui lòng kiểm tra lại đơn hàng.');
      return;
    }

    if (!order.userId || order.userId <= 0) {
      alert('❌ Lỗi: Dealer ID không hợp lệ. Vui lòng kiểm tra lại đơn hàng.');
      return;
    }

    if (!window.confirm(`🚚 Bạn có chắc chắn muốn chuyển ${order.quantity} xe (Vehicle ID: #${order.vehicleId}) xuống đại lý #${order.userId} không?`)) {
      return;
    }

    setDispatching(order.dealerOrderId);
    setDispatchError(null);
    
    try {
      // Tạo dispatchData với validation
      const dispatchData = {
        vehicleId: Number(order.vehicleId),
        quantity: Number(order.quantity),
        dealerId: Number(order.userId), // dealerId is the userId of the dealer order
        color: order.color || '' // Thêm màu xe từ order
      };

      // Validation lại một lần nữa trước khi gửi
      if (!dispatchData.vehicleId || dispatchData.vehicleId <= 0) {
        throw new Error('Vehicle ID không hợp lệ');
      }
      if (!dispatchData.quantity || dispatchData.quantity <= 0) {
        throw new Error('Số lượng xe phải lớn hơn 0');
      }
      if (!dispatchData.dealerId || dispatchData.dealerId <= 0) {
        throw new Error('Dealer ID không hợp lệ');
      }
      if (!dispatchData.color || dispatchData.color.trim() === '') {
        throw new Error('Màu xe không được để trống');
      }

      console.log('🚚 Dispatching inventory:', dispatchData);
      const result = await inventoryService.dispatchInventory(dispatchData);
      console.log('✅ Dispatch result:', result);
      
      // Update order status to "VEHICLE_DELIVERED" after successful dispatch
      try {
        await dealerOrderService.updateDealerOrder(order.dealerOrderId, {
          dealerOrderId: order.dealerOrderId,
          userId: order.userId,
          orderId: order.orderId,
          vehicleId: order.vehicleId,
          quantity: order.quantity,
          color: order.color || '',
          orderDate: order.orderDate,
          status: 'VEHICLE_DELIVERED', // Update status to "Xe đã được hãng giao"
          paymentStatus: order.paymentStatus,
          totalAmount: order.totalAmount
        });
        console.log('✅ Order status updated to VEHICLE_DELIVERED');
      } catch (updateErr) {
        console.error('⚠️ Failed to update order status:', updateErr);
        // Don't fail the whole operation if status update fails
      }
      
      alert(`✅ Chuyển xe xuống đại lý thành công!\n\n${result.message}\n\nTrạng thái đơn hàng đã được cập nhật thành "Xe đã được hãng giao"`);
      await fetchOrders(); // Refresh orders list
    } catch (err) {
      console.error('❌ Lỗi khi chuyển hàng tồn kho:', err);
      
      // Enhanced error handling for stock validation
      const errorMessage = err instanceof Error ? err.message : 'Lỗi không xác định';
      let userMessage = errorMessage;
      
      // Kiểm tra lỗi validation từ frontend
      if (errorMessage.includes('Vehicle ID không hợp lệ') || 
          errorMessage.includes('Số lượng xe phải lớn hơn 0') ||
          errorMessage.includes('Dealer ID không hợp lệ')) {
        alert(`❌ ${errorMessage}\n\nVui lòng kiểm tra lại thông tin đơn hàng.`);
        setDispatchError(errorMessage);
        setDispatching(null);
        return;
      }
      
      // Check for specific stock-related errors
      if (errorMessage.toLowerCase().includes('stock') || 
          errorMessage.toLowerCase().includes('tồn kho') ||
          errorMessage.toLowerCase().includes('hết hàng') ||
          errorMessage.toLowerCase().includes('insufficient') ||
          errorMessage.toLowerCase().includes('quantity')) {
        userMessage = `🚫 HẾT HÀNG!\n\nKhông đủ số lượng xe trong kho để chuyển xuống đại lý.\n\nChi tiết: ${errorMessage}\n\nVui lòng kiểm tra tồn kho trước khi thực hiện chuyển xe.`;
        setDispatchError(userMessage);
      } else if (errorMessage.toLowerCase().includes('vehicle') || 
                 errorMessage.toLowerCase().includes('xe')) {
        userMessage = `LỖI XE!\n\nKhông tìm thấy xe hoặc thông tin xe không hợp lệ.`;
        setDispatchError(userMessage);
      } else if (errorMessage.toLowerCase().includes('dealer') || 
                 errorMessage.toLowerCase().includes('đại lý')) {
        userMessage = ` LỖI ĐẠI LÝ!\n\nThông tin đại lý không hợp lệ hoặc không tồn tại.`;
        setDispatchError(userMessage);
      } else {
        userMessage = ` LỖI HỆ THỐNG!\n\nKhông thể chuyển xe xuống đại lý.`;
        setDispatchError(userMessage);
      }
      
      alert(userMessage);
    } finally {
      setDispatching(null);
    }
  };

  // Handle refund order
  const handleOpenRefundModal = (order: DealerOrder) => {
    setSelectedOrderForRefund(order);
    setShowRefundModal(true);
  };

  // Process refund
  const handleProcessRefund = async () => {
    if (!selectedOrderForRefund) return;

    setRefunding(true);
    try {
      // Bước 1: Lấy tất cả payments để tìm payment của đơn hàng này
      console.log('🔍 Tìm payment cho Order ID:', selectedOrderForRefund.orderId);
      const paymentsResponse = await paymentService.getPayments();
      
      if (!paymentsResponse.success || !paymentsResponse.data) {
        throw new Error('Không thể lấy danh sách thanh toán');
      }

      // Tìm payment của đơn hàng này
      const existingPayment = paymentsResponse.data.find(
        payment => payment.orderId === selectedOrderForRefund.orderId
      );

      if (!existingPayment) {
        throw new Error(`Không tìm thấy thanh toán cho đơn hàng #${selectedOrderForRefund.orderId}`);
      }

      console.log('💰 Tìm thấy payment:', existingPayment);

      // Bước 2: Cập nhật status của payment thành REFUNDED
      const updatePaymentData = {
        paymentId: existingPayment.paymentId,
        orderId: existingPayment.orderId,
        paymentDate: existingPayment.paymentDate,
        amount: existingPayment.amount,
        method: existingPayment.method,
        status: 'REFUNDED' // Cập nhật status
      };

      console.log('🔄 Cập nhật payment status thành REFUNDED:', updatePaymentData);
      const paymentResult = await paymentService.updatePayment(existingPayment.paymentId, updatePaymentData);
      
      if (!paymentResult.success) {
        throw new Error(paymentResult.message || 'Không thể cập nhật trạng thái thanh toán');
      }

      // Bước 3: Cập nhật paymentStatus của DealerOrder thành REFUNDED
      console.log('🔄 Cập nhật DealerOrder paymentStatus thành REFUNDED');
      await dealerOrderService.updateDealerOrder(selectedOrderForRefund.dealerOrderId, {
        dealerOrderId: selectedOrderForRefund.dealerOrderId,
        userId: selectedOrderForRefund.userId,
        orderId: selectedOrderForRefund.orderId,
        vehicleId: selectedOrderForRefund.vehicleId,
        quantity: selectedOrderForRefund.quantity,
        color: selectedOrderForRefund.color || '',
        orderDate: selectedOrderForRefund.orderDate,
        status: selectedOrderForRefund.status,
        paymentStatus: 'REFUNDED', // Cập nhật paymentStatus
        totalAmount: selectedOrderForRefund.totalAmount
      });

      console.log('✅ Hoàn tiền thành công!');
      alert(`✅ Hoàn tiền thành công!\n\nĐơn hàng: #${selectedOrderForRefund.dealerOrderId}\nSố tiền: ${formatPrice(selectedOrderForRefund.totalAmount)}\n\nTrạng thái thanh toán đã được cập nhật thành "Đã hoàn tiền".`);
      
      setShowRefundModal(false);
      setSelectedOrderForRefund(null);
      await fetchOrders(); // Refresh orders
      await fetchRefundedOrders(); // Refresh refunded orders list
    } catch (err) {
      console.error('❌ Error processing refund:', err);
      alert(`❌ Lỗi khi hoàn tiền: ${err instanceof Error ? err.message : 'Lỗi không xác định'}`);
    } finally {
      setRefunding(false);
    }
  };

  // Create delivery
  const handleCreateDelivery = async () => {
    try {
      if (!deliveryForm.userId || deliveryForm.userId === 0) {
        alert('⚠️ User ID không hợp lệ! Vui lòng chọn lại đơn hàng đại lý.');
        return;
      }

      if (!deliveryForm.orderId || deliveryForm.orderId === 0) {
        alert('⚠️ Order ID không hợp lệ! Đơn hàng đại lý này chưa liên kết với đơn hàng khách.');
        return;
      }

      if (!deliveryForm.vehicleId) {
        alert('⚠️ Vehicle ID không hợp lệ!');
        return;
      }

      setCreatingDelivery(true);

      const deliveryData: CreateDeliveryRequest = {
        deliveryId: 0, // Backend will auto-generate
        userId: deliveryForm.userId,
        orderId: deliveryForm.orderId,
        vehicleId: deliveryForm.vehicleId,
        deliveryDate: deliveryForm.deliveryDate,
        deliveryStatus: deliveryForm.deliveryStatus,
        notes: deliveryForm.notes
      };

      console.log(' Đang tạo giao hàng:', deliveryData);
      const result = await deliveryService.createDelivery(deliveryData);
      console.log('✅ Delivery created:', result);
      
      alert(`✅ Tạo vận chuyển thành công!\n\nDelivery ID: #${result.deliveryId}\nOrder ID: #${result.orderId}\nVehicle ID: #${result.vehicleId}`);
      setShowCreateDeliveryModal(false);
      setSelectedOrderForDelivery(null);
    } catch (err) {
      console.error(' Lỗi khi tạo giao hàng:', err);
      
      let errorMessage = err instanceof Error ? err.message : 'Lỗi không xác định';
      
      // Check if it's a foreign key constraint error
      if (errorMessage.includes('FOREIGN KEY') || errorMessage.includes('FK__Deliverie__order')) {
        errorMessage = `❌ Lỗi Foreign Key Constraint!\n\n` +
          `Đơn hàng đại lý này chưa được liên kết đúng với đơn hàng khách (Orders).\n\n` +
          `Thông tin:\n` +
          `• User ID: ${deliveryForm.userId}\n` +
          `• Order ID: ${deliveryForm.orderId}\n` +
          `• Vehicle ID: ${deliveryForm.vehicleId}\n\n` +
          `Vui lòng kiểm tra:\n` +
          `1. Order ID #${deliveryForm.orderId} có tồn tại trong bảng Orders không?\n` +
          `2. Đơn hàng đại lý có được tạo từ đơn hàng khách hợp lệ không?`;
      }
      
      alert(`❌ Không thể tạo vận chuyển:\n\n${errorMessage}`);
    } finally {
      setCreatingDelivery(false);
    }
  };

  // Filter orders
  const filteredOrders = orders.filter(order => {
    const searchLower = searchTerm.toLowerCase();
    return (
      order.dealerOrderId.toString().includes(searchLower) ||
      order.orderId.toString().includes(searchLower) ||
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

  // Format price for display
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  // Format number with commas for input
  const formatNumberInput = (value: string) => {
    // Remove all non-digit characters
    const numbers = value.replace(/\D/g, '');
    // Format with commas
    return numbers.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  };

  // Parse formatted number to actual number
  const parseFormattedNumber = (value: string) => {
    return parseInt(value.replace(/,/g, '') || '0');
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
      'DELIVERED': { bg: 'bg-teal-100', text: 'text-teal-800', label: 'Xe đã được hãng giao' },
      'VEHICLE_DELIVERED': { bg: 'bg-teal-100', text: 'text-teal-800', label: 'Xe đã được hãng giao' },
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
      'REFUNDED': { bg: 'bg-purple-100', text: 'text-purple-800', label: 'Đã hoàn tiền' },
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
          {/* <button
            onClick={handleOpenCreateModal}
            className="px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:from-green-700 hover:to-emerald-700 flex items-center space-x-2 transition-all duration-200 shadow-lg font-medium"
          >
            <Plus className="h-5 w-5" />
            <span>Tạo đơn mới</span>
          </button> */}
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

        {/* Dispatch Error Message */}
        {dispatchError && (
          <div className="mx-6 mb-6 p-6 bg-red-50 border-l-4 border-red-500 rounded-xl shadow-lg">
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0">
                <AlertCircle className="h-6 w-6 text-red-500 mt-0.5" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-red-800 mb-2">Lỗi chuyển xe xuống đại lý</h3>
                <div className="text-red-700 whitespace-pre-line leading-relaxed">
                  {dispatchError}
                </div>
                <div className="mt-4 flex space-x-3">
                  <button
                    onClick={() => setDispatchError(null)}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
                  >
                    Đóng
                  </button>
                  <button
                    onClick={fetchOrders}
                    className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm font-medium"
                  >
                    Làm mới danh sách
                  </button>
                </div>
              </div>
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
            
            <div className="overflow-hidden">
              <table className="w-full table-fixed">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-3 py-3 text-left text-xs font-semibold text-gray-700 uppercase w-20">
                      Mã đơn
                    </th>
                    <th className="px-2 py-3 text-center text-xs font-semibold text-gray-700 uppercase w-20">
                      Order ID
                    </th>
                    <th className="px-2 py-3 text-center text-xs font-semibold text-gray-700 uppercase w-32">
                      Đại lý
                    </th>
                    <th className="px-2 py-3 text-center text-xs font-semibold text-gray-700 uppercase w-32">
                      Xe
                    </th>
                    <th className="px-2 py-3 text-center text-xs font-semibold text-gray-700 uppercase w-16">
                      SL
                    </th>
                    <th className="px-2 py-3 text-center text-xs font-semibold text-gray-700 uppercase w-20">
                      Màu
                    </th>
                    <th className="px-3 py-3 text-right text-xs font-semibold text-gray-700 uppercase w-32">
                      Tổng tiền
                    </th>
                    <th className="px-2 py-3 text-center text-xs font-semibold text-gray-700 uppercase w-28">
                      Ngày đặt
                    </th>
                    <th className="px-2 py-3 text-center text-xs font-semibold text-gray-700 uppercase w-24">
                      TT Đơn
                    </th>
                    <th className="px-2 py-3 text-center text-xs font-semibold text-gray-700 uppercase w-28">
                      TT thanh toán
                    </th>
                    <th className="px-2 py-3 text-center text-xs font-semibold text-gray-700 uppercase w-32">
                      Thao tác
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredOrders.map((order) => (
                    <tr key={order.dealerOrderId} className="hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 transition-all duration-200">
                      <td className="px-3 py-3">
                        <div className="flex items-center space-x-1">
                          <Hash className="h-3.5 w-3.5 text-gray-400" />
                          <span className="font-semibold text-gray-900 text-sm">{order.dealerOrderId}</span>
                        </div>
                      </td>
                      <td className="px-2 py-3 text-center">
                        <span className="font-semibold text-green-600 text-xs">#{order.orderId}</span>
                      </td>
                      <td className="px-2 py-3 text-center">
                        <span className="font-semibold text-blue-600 text-xs">{getCustomerName(order.userId)}</span>
                      </td>
                      <td className="px-2 py-3 text-center">
                        <span className="font-semibold text-purple-600 text-xs">{getVehicleModel(order.vehicleId)}</span>
                      </td>
                      <td className="px-2 py-3 text-center">
                        <span className="font-semibold text-gray-900 text-sm">{order.quantity}</span>
                      </td>
                      <td className="px-2 py-3 text-center">
                        {order.color ? (
                          <span className="inline-flex items-center px-2 py-0.5 bg-gray-100 rounded-full text-xs text-gray-900 truncate">
                            {order.color}
                          </span>
                        ) : (
                          <span className="text-gray-400 text-xs">N/A</span>
                        )}
                      </td>
                      <td className="px-3 py-3 text-right">
                        <span className="font-bold text-green-600 text-xs">{formatPrice(order.totalAmount)}</span>
                      </td>
                      <td className="px-2 py-3 text-center">
                        <div className="flex flex-col items-center text-xs text-gray-600">
                          <span>{formatDate(order.orderDate).split(' ')[0]}</span>
                          <span className="text-[10px]">{formatDate(order.orderDate).split(' ')[1]}</span>
                        </div>
                      </td>
                      <td className="px-2 py-3 text-center">
                        {getStatusBadge(order.status)}
                      </td>
                      <td className="px-2 py-3 text-center">
                        {getPaymentStatusBadge(order.paymentStatus)}
                      </td>
                      <td className="px-2 py-3 text-center">
                        <div className="flex flex-col items-center gap-1">
                          <button
                            onClick={() => handleViewOrder(order)}
                            className="inline-flex items-center gap-1 px-2 py-1 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg hover:from-blue-600 hover:to-indigo-700 transition-all duration-200 shadow-md hover:shadow-lg text-xs font-medium w-full justify-center"
                          >
                            <Eye className="h-3 w-3" />
                            Xem
                          </button>
                          
                          {/* Dispatch Button - Only show when status is CONFIRMED AND user is staff_evm */}
                          {order.status === 'CONFIRMED' && isStaffEVM && (
                            <button
                              onClick={() => handleDispatchInventory(order)}
                              disabled={dispatching === order.dealerOrderId}
                              className="inline-flex items-center gap-1 px-2 py-1 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-lg hover:from-purple-600 hover:to-pink-700 transition-all duration-200 shadow-md hover:shadow-lg text-xs font-medium w-full justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                              title="Chuyển xe xuống đại lý"
                            >
                              {dispatching === order.dealerOrderId ? (
                                <>
                                  <RefreshCw className="h-3 w-3 animate-spin" />
                                  Đang xử lý...
                                </>
                              ) : (
                                <>
                                  <ArrowDownCircle className="h-3 w-3" />
                                  Chuyển xe
                                </>
                              )}
                            </button>
                          )}
                          
                          {/* Create Delivery Button - Only show when status is VEHICLE_DELIVERED or DELIVERED AND user is NOT staff_evm */}
                          {(order.status === 'VEHICLE_DELIVERED' || order.status === 'DELIVERED') && !isStaffEVM && (
                            <button
                              onClick={() => handleOpenCreateDeliveryModal(order)}
                              className="inline-flex items-center gap-1 px-2 py-1 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg hover:from-green-600 hover:to-emerald-700 transition-all duration-200 shadow-md hover:shadow-lg text-xs font-medium w-full justify-center"
                              title="Tạo vận chuyển"
                            >
                              <Truck className="h-3 w-3" />
                              Vận chuyển
                            </button>
                          )}
                          
                          {/* Refund Button - Show when status is CANCELLED and not yet refunded - Only for dealer role */}
                          {order.status === 'CANCELLED' && !refundedOrders.has(order.orderId) && !isStaffEVM && (
                            <button
                              onClick={() => handleOpenRefundModal(order)}
                              disabled={refunding}
                              className="inline-flex items-center gap-1 px-2 py-1 bg-gradient-to-r from-yellow-500 to-orange-600 text-white rounded-lg hover:from-yellow-600 hover:to-orange-700 transition-all duration-200 shadow-md hover:shadow-lg text-xs font-medium w-full justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                              title="Hoàn tiền cho đơn hàng đã hủy"
                            >
                              <DollarSign className="h-3 w-3" />
                              Hoàn tiền
                            </button>
                          )}
                        </div>
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
                        <span className="text-gray-600 font-medium">Order ID:</span>
                        <span className="font-bold text-green-600">#{selectedOrder.orderId}</span>
                      </div>
                      <div className="flex justify-between items-center py-2 border-b border-blue-200">
                        <span className="text-gray-600 font-medium flex items-center space-x-2">
                          <User className="h-4 w-4" />
                          <span>Đại lý:</span>
                        </span>
                        <span className="font-bold text-blue-600">{getCustomerName(selectedOrder.userId)}</span>
                      </div>
                      <div className="flex justify-between items-center py-2 border-b border-blue-200">
                        <span className="text-gray-600 font-medium flex items-center space-x-2">
                          <Car className="h-4 w-4" />
                          <span>Xe:</span>
                        </span>
                        <span className="font-bold text-purple-600">{getVehicleModel(selectedOrder.vehicleId)}</span>
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
                      className="px-3 py-1.5 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg hover:from-red-600 hover:to-red-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5 transition-all duration-200 font-medium shadow-md text-xs"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      <span>Xóa</span>
                    </button>
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          handleOpenEditModal(selectedOrder);
                          setShowDetailModal(false);
                        }}
                        disabled={loading}
                        className="px-3 py-1.5 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg hover:from-blue-600 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5 transition-all duration-200 font-medium shadow-md text-xs"
                      >
                        <Edit className="h-3.5 w-3.5" />
                        <span>Sửa</span>
                      </button>
                      <button
                        onClick={() => setShowDetailModal(false)}
                        className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-all duration-200 font-medium text-xs border border-gray-300"
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
                      <Hash className="inline h-4 w-4 mr-1" />
                      Order ID *
                    </label>
                    <input
                      type="number"
                      value={formData.orderId === 0 ? '' : formData.orderId}
                      onChange={(e) => setFormData({...formData, orderId: Number(e.target.value) || 0})}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:ring-2 focus:ring-green-100 transition-all duration-200 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                      placeholder="Nhập Order ID"
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
                      Tổng tiền (VNĐ) *
                    </label>
                    <input
                      type="text"
                      value={formData.totalAmount === 0 ? '' : formatNumberInput(formData.totalAmount.toString())}
                      onChange={(e) => setFormData({...formData, totalAmount: parseFormattedNumber(e.target.value)})}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:ring-2 focus:ring-green-100 transition-all duration-200"
                      placeholder="1,000,000,000"
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
                      {!isStaffEVM && (
                        <span className="ml-2 text-xs text-red-600 font-normal">
                          (Chỉ Staff EVM mới được chọn)
                        </span>
                      )}
                    </label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({...formData, status: e.target.value})}
                      disabled={!isStaffEVM}
                      className={`w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:ring-2 focus:ring-green-100 transition-all duration-200 ${
                        !isStaffEVM ? 'bg-gray-100 cursor-not-allowed opacity-60' : ''
                      }`}
                      required
                    >
                      <option value="PENDING">Chờ xử lý</option>
                      <option value="CONFIRMED">Đã xác nhận</option>
                      
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
                <div className="flex justify-end gap-2 pt-4 border-t">
                  <button
                    onClick={() => setShowCreateModal(false)}
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-all duration-200 font-medium text-sm border border-gray-300"
                  >
                    Hủy
                  </button>
                  <button
                    onClick={handleCreateOrder}
                    disabled={loading}
                    className="px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg hover:from-green-700 hover:to-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5 transition-all duration-200 font-medium shadow-md text-sm"
                  >
                    <Plus className="h-3.5 w-3.5" />
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
                {isStaffEVM ? (
                  /* Simplified form for evm_staff - only show status field */
                  <div className="space-y-4">
                    

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Trạng thái đơn 
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
                  </div>
                ) : (
                  /* Full form for other roles */
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
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl transition-all duration-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                        placeholder="Nhập User ID"
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        <Hash className="inline h-4 w-4 mr-1" />
                        Order ID *
                      </label>
                      <input
                        type="number"
                        value={formData.orderId === 0 ? '' : formData.orderId}
                        onChange={(e) => setFormData({...formData, orderId: Number(e.target.value) || 0})}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl transition-all duration-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                        placeholder="Nhập Order ID"
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
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl transition-all duration-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
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
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl transition-all duration-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
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
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl transition-all duration-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                        placeholder="Nhập màu (tùy chọn)"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        <DollarSign className="inline h-4 w-4 mr-1" />
                        Tổng tiền (VNĐ) *
                      </label>
                      <input
                        type="text"
                        value={formData.totalAmount === 0 ? '' : formatNumberInput(formData.totalAmount.toString())}
                        onChange={(e) => setFormData({...formData, totalAmount: parseFormattedNumber(e.target.value)})}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl transition-all duration-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                        placeholder="1,000,000,000"
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
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl transition-all duration-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
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
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all duration-200 bg-gray-100 cursor-not-allowed opacity-60"
                        disabled
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
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl transition-all duration-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                        required
                      >
                        <option value="UNPAID">Chưa xử lý</option>
                        <option value="PAID">Đã xử lý</option>
                      </select>
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex justify-end gap-2 pt-4 border-t">
                  <button
                    onClick={() => setShowEditModal(false)}
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-all duration-200 font-medium text-sm border border-gray-300"
                  >
                    Hủy
                  </button>
                  <button
                    onClick={handleUpdateOrder}
                    disabled={loading}
                    className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5 transition-all duration-200 font-medium shadow-md text-sm"
                  >
                    <Edit className="h-3.5 w-3.5" />
                    <span>Cập nhật</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Create Delivery Modal */}
        {showCreateDeliveryModal && selectedOrderForDelivery && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              {/* Modal Header */}
              <div className="sticky top-0 bg-gradient-to-r from-green-600 to-emerald-600 text-white p-6 rounded-t-3xl">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-white bg-opacity-20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                      <Truck className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold">Tạo vận chuyển</h2>
                      <p className="text-green-100 mt-1">Đơn hàng: #{selectedOrderForDelivery.dealerOrderId}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowCreateDeliveryModal(false)}
                    className="text-white hover:bg-white hover:bg-opacity-20 rounded-xl p-2 transition-all duration-200"
                  >
                    <X className="h-6 w-6" />
                  </button>
                </div>
              </div>

              {/* Form */}
              <div className="p-8 space-y-6">
                {/* Info Banner */}
                <div className="bg-blue-50 border-l-4 border-blue-500 rounded-xl p-4">
                  <div className="flex items-start space-x-3">
                    <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm text-blue-900">
                        <strong>Thông tin đơn hàng đại lý:</strong>
                      </p>
                      <div className="mt-2 space-y-1 text-sm text-blue-800">
                        <p>• Mã đơn đại lý: <strong>#{selectedOrderForDelivery.dealerOrderId}</strong></p>
                        <p>• Khách Hàng: <strong>{getCustomerName(selectedOrderForDelivery.userId)}</strong></p>
                        <p>• ID đơn hàng (từ Orders): <strong>#{selectedOrderForDelivery.orderId}</strong></p>
                        <p>• Mẫu xe: <strong>{getVehicleModel(selectedOrderForDelivery.vehicleId)}</strong></p>
                        <p>• Số lượng: <strong>{selectedOrderForDelivery.quantity}</strong></p>
                        {selectedOrderForDelivery.color && <p>• Màu: <strong>{selectedOrderForDelivery.color}</strong></p>}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      <Calendar className="inline h-4 w-4 mr-1" />
                      Ngày vận chuyển *
                    </label>
                    <input
                      type="datetime-local"
                      value={deliveryForm.deliveryDate}
                      onChange={(e) => setDeliveryForm({...deliveryForm, deliveryDate: e.target.value})}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:ring-2 focus:ring-green-100 transition-all duration-200"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Trạng thái vận chuyển *
                    </label>
                    <select
                      value={deliveryForm.deliveryStatus}
                      onChange={(e) => setDeliveryForm({...deliveryForm, deliveryStatus: e.target.value})}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:ring-2 focus:ring-green-100 transition-all duration-200"
                      required
                    >
                      <option value="PENDING">Chờ vận chuyển</option>
                      <option value="IN_TRANSIT">Đang vận chuyển</option>
                      <option value="DELIVERED">Đã giao hàng</option>
                      <option value="CANCELLED">Đã hủy</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Ghi chú
                    </label>
                    <textarea
                      value={deliveryForm.notes}
                      onChange={(e) => setDeliveryForm({...deliveryForm, notes: e.target.value})}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:ring-2 focus:ring-green-100 transition-all duration-200"
                      placeholder="Nhập ghi chú về vận chuyển (tùy chọn)"
                      rows={4}
                    />
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end gap-2 pt-4 border-t">
                  <button
                    onClick={() => setShowCreateDeliveryModal(false)}
                    disabled={creatingDelivery}
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-all duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed text-sm border border-gray-300"
                  >
                    Hủy
                  </button>
                  <button
                    onClick={handleCreateDelivery}
                    disabled={creatingDelivery}
                    className="px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg hover:from-green-700 hover:to-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5 transition-all duration-200 font-medium shadow-md text-sm"
                  >
                    {creatingDelivery ? (
                      <>
                        <div className="animate-spin rounded-full h-3.5 w-3.5 border-b-2 border-white"></div>
                        <span>Đang tạo...</span>
                      </>
                    ) : (
                      <>
                        <Truck className="h-3.5 w-3.5" />
                        <span>Tạo vận chuyển</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Refund Modal */}
        {showRefundModal && selectedOrderForRefund && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              {/* Modal Header */}
              <div className="sticky top-0 bg-gradient-to-r from-yellow-600 to-orange-600 text-white p-6 rounded-t-3xl">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-white bg-opacity-20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                      <DollarSign className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold">Xác nhận hoàn tiền</h2>
                      <p className="text-yellow-100 mt-1">Đơn hàng: #{selectedOrderForRefund.dealerOrderId}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowRefundModal(false)}
                    disabled={refunding}
                    className="text-white hover:bg-white hover:bg-opacity-20 rounded-xl p-2 transition-all duration-200 disabled:opacity-50"
                  >
                    <X className="h-6 w-6" />
                  </button>
                </div>
              </div>

              {/* Modal Body */}
              <div className="p-8 space-y-6">
                {/* Warning Banner */}
                <div className="bg-yellow-50 border-l-4 border-yellow-500 rounded-xl p-4">
                  <div className="flex items-start space-x-3">
                    <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm text-yellow-900">
                        <strong>Thông báo:</strong> Bạn đang thực hiện hoàn tiền cho đơn hàng đã hủy. Thao tác này sẽ tạo một giao dịch thanh toán mới với trạng thái "Đã hoàn tiền" trong hệ thống Quản lý thanh toán.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Order Information */}
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 border-l-4 border-blue-500">
                  <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center space-x-2">
                    <Package className="h-5 w-5 text-blue-600" />
                    <span>Thông tin đơn hàng</span>
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex justify-between items-center py-2 border-b border-blue-200">
                      <span className="text-gray-600 font-medium">Mã đơn:</span>
                      <span className="font-bold text-gray-900">#{selectedOrderForRefund.dealerOrderId}</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-blue-200">
                      <span className="text-gray-600 font-medium">Order ID:</span>
                      <span className="font-bold text-green-600">#{selectedOrderForRefund.orderId}</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-blue-200">
                      <span className="text-gray-600 font-medium">Đại lý:</span>
                      <span className="font-bold text-blue-600">{getCustomerName(selectedOrderForRefund.userId)}</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-blue-200">
                      <span className="text-gray-600 font-medium">Xe:</span>
                      <span className="font-bold text-purple-600">{getVehicleModel(selectedOrderForRefund.vehicleId)}</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-blue-200">
                      <span className="text-gray-600 font-medium">Trạng thái:</span>
                      {getStatusBadge(selectedOrderForRefund.status)}
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-blue-200">
                      <span className="text-gray-600 font-medium">TT thanh toán:</span>
                      {getPaymentStatusBadge(selectedOrderForRefund.paymentStatus)}
                    </div>
                  </div>
                </div>

                {/* Refund Amount */}
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-6 border-l-4 border-green-500">
                  <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center space-x-2">
                    <DollarSign className="h-5 w-5 text-green-600" />
                    <span>Số tiền hoàn lại</span>
                  </h3>
                  <div className="text-center">
                    <p className="text-sm text-gray-600 mb-2">Tổng số tiền sẽ được hoàn trả</p>
                    <p className="text-4xl font-bold text-green-600">{formatPrice(selectedOrderForRefund.totalAmount)}</p>
                  </div>
                </div>

                {/* Info Section */}
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                  <div className="flex items-start space-x-3">
                    <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
                    <div className="flex-1">
                      <h4 className="text-sm font-semibold text-blue-900 mb-2">Khi bạn xác nhận hoàn tiền:</h4>
                      <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
                        <li>Một giao dịch thanh toán mới sẽ được tạo với trạng thái "Đã hoàn tiền"</li>
                        <li>Phương thức thanh toán sẽ được ghi nhận là "REFUND"</li>
                        <li>Số tiền hoàn: {formatPrice(selectedOrderForRefund.totalAmount)}</li>
                        <li>Bạn có thể xem chi tiết trong phần <strong>Quản lý thanh toán</strong></li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="bg-gray-50 px-6 py-4 rounded-b-3xl flex justify-end space-x-3">
                <button
                  onClick={() => setShowRefundModal(false)}
                  disabled={refunding}
                  className="px-6 py-3 border-2 border-gray-300 rounded-xl text-gray-700 hover:bg-white hover:border-gray-400 transition-all duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Hủy
                </button>
                <button
                  onClick={handleProcessRefund}
                  disabled={refunding}
                  className="px-6 py-3 bg-gradient-to-r from-yellow-600 to-orange-600 text-white rounded-xl hover:from-yellow-700 hover:to-orange-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 transition-all duration-200 font-medium shadow-lg"
                >
                  {refunding ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      <span>Đang xử lý...</span>
                    </>
                  ) : (
                    <>
                      <DollarSign className="h-5 w-5" />
                      <span>Xác nhận hoàn tiền</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

