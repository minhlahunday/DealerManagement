import React, { useState, useEffect } from 'react';
import { Search, FileText, DollarSign, Calendar, User, Car, Eye, Package, Truck, Plus, Edit, Trash2, AlertTriangle, Download, Gift, Tag } from 'lucide-react';
import { saleService, Order, CreateOrderRequest, GetOrderResponse, UpdateOrderRequest, CreateSaleContractRequest } from '../../../services/saleService';

export const OrderManagement: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [creatingOrder, setCreatingOrder] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingOrder, setEditingOrder] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletingOrder, setDeletingOrder] = useState(false);
  const [orderToDelete, setOrderToDelete] = useState<Order | null>(null);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [orderToUpload, setOrderToUpload] = useState<Order | null>(null);
  const [uploadingAttachments, setUploadingAttachments] = useState(false);
  const [attachmentImageFile, setAttachmentImageFile] = useState<File | null>(null);
  const [attachmentDocFile, setAttachmentDocFile] = useState<File | null>(null);
  const [showCreateContractModal, setShowCreateContractModal] = useState(false);
  const [creatingContract, setCreatingContract] = useState(false);
  const [selectedOrderForContract, setSelectedOrderForContract] = useState<Order | null>(null);

  const [createForm, setCreateForm] = useState({
    orderId: 0,
    quotationId: 0,
    userId: 0,
    vehicleId: 0,
    orderDate: new Date().toISOString(),
    deliveryAddress: '',
    attachmentImage: '',
    attachmentFile: '',
    status: 'PENDING',
    totalAmount: 0,
    promotionCode: '',
    promotionOptionName: ''
  });

  const [formInputs, setFormInputs] = useState({
    quotationId: '',
    userId: '',
    vehicleId: '',
    totalAmount: ''
  });

  const [uploadFiles, setUploadFiles] = useState({
    attachmentImage: null as File | null,
    attachmentFile: null as File | null
  });

  const [editForm, setEditForm] = useState({
    orderId: 0,
    quotationId: 0,
    userId: 0,
    vehicleId: 0,
    orderDate: '',
    deliveryAddress: '',
    attachmentImage: '',
    attachmentFile: '',
    status: 'PENDING',
    totalAmount: 0,
    promotionCode: '',
    promotionOptionName: ''
  });

  const [editFormInputs, setEditFormInputs] = useState({
    quotationId: '',
    userId: '',
    vehicleId: '',
    totalAmount: ''
  });

  // Contract form state - match CreateSaleContractRequest schema
  const [contractForm, setContractForm] = useState({
    salesContractId: 0,
    orderId: 0,
    contractDate: new Date().toISOString(),
    terms: 'Standard Terms and Conditions',
    signedByDealer: 'Dealer One',
    customerName: '',
    phone: '',
    email: '',
    paymentMethod: 'CASH',
    address: '',
    cccd: '',
    contractImage: '',
    contractFile: ''
  });

  // Load orders when component mounts
  useEffect(() => {
    fetchOrders();
  }, []);

  // Debug showCreateModal state
  useEffect(() => {
    console.log('🔍 showCreateModal state changed:', showCreateModal);
  }, [showCreateModal]);

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
      
      // Call API to get detailed order information
      const response: GetOrderResponse = await saleService.getOrderById(order.orderId);
      console.log('📡 Order detail API response:', response);
      
      if (response.data) {
        setSelectedOrder(response.data);
        setShowDetailModal(true);
        console.log('✅ Order details loaded successfully');
      } else {
        throw new Error('Không có dữ liệu đơn hàng');
      }
    } catch (error) {
      console.error('❌ Error loading order details:', error);
      alert(`Lỗi khi tải chi tiết đơn hàng: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoadingDetail(false);
    }
  };

  // Reset form when opening modal
  const handleOpenCreateModal = () => {
    console.log('🔍 Opening create modal...');
    
    // Reset form data first
    setCreateForm({
      orderId: 0,
      quotationId: 0,
      userId: 0,
      vehicleId: 0,
      orderDate: new Date().toISOString(),
      deliveryAddress: 'Chưa xác định',
      attachmentImage: 'default-image.jpg',
      attachmentFile: 'default-file.pdf',
      status: 'PENDING',
      totalAmount: 0,
      promotionCode: '',
      promotionOptionName: ''
    });
    
    setFormInputs({
      quotationId: '',
      userId: '',
      vehicleId: '',
      totalAmount: ''
    });
    
    setUploadFiles({
      attachmentImage: null,
      attachmentFile: null
    });
    
    // Open modal
    setShowCreateModal(true);
    console.log('🔍 Modal should be open now');
  };

  // Reset form when closing modal
  const handleCloseCreateModal = () => {
    setShowCreateModal(false);
    setCreateForm({
      orderId: 0,
      quotationId: 0,
      userId: 0,
      vehicleId: 0,
      orderDate: new Date().toISOString(),
      deliveryAddress: '',
      attachmentImage: '',
      attachmentFile: '',
      status: 'PENDING',
      totalAmount: 0,
      promotionCode: '',
      promotionOptionName: ''
    });
    setFormInputs({
      quotationId: '',
      userId: '',
      vehicleId: '',
      totalAmount: ''
    });
    setUploadFiles({
      attachmentImage: null,
      attachmentFile: null
    });
  };

  // Handle file upload
  const handleFileUpload = (field: 'attachmentImage' | 'attachmentFile', file: File | null) => {
    setUploadFiles(prev => ({
      ...prev,
      [field]: file
    }));
    
    // Also update the form with file name for backend compatibility
    setCreateForm(prev => ({
      ...prev,
      [field]: file ? file.name : ''
    }));
  };

  // Create order
  const handleCreateOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreatingOrder(true);

    try {
      // Parse form inputs to numbers
      const quotationId = parseInt(formInputs.quotationId) || 0;
      const userId = parseInt(formInputs.userId) || 0;
      const vehicleId = parseInt(formInputs.vehicleId) || 0;
      const totalAmount = parseFloat(formInputs.totalAmount) || 0;

      // Handle file uploads - for now, send file names
      // TODO: Implement actual file upload to server
      const attachmentImage = uploadFiles.attachmentImage ? uploadFiles.attachmentImage.name : (createForm.attachmentImage || 'default-image.jpg');
      const attachmentFile = uploadFiles.attachmentFile ? uploadFiles.attachmentFile.name : (createForm.attachmentFile || 'default-file.pdf');

      const orderData: CreateOrderRequest = {
        orderId: 0, // Will be set by backend
        quotationId: quotationId,
        userId: userId,
        vehicleId: vehicleId,
        orderDate: createForm.orderDate,
        deliveryAddress: createForm.deliveryAddress || 'Chưa xác định',
        attachmentImage: attachmentImage,
        attachmentFile: attachmentFile,
        status: createForm.status,
        totalAmount: totalAmount,
        promotionCode: createForm.promotionCode,
        promotionOptionName: createForm.promotionOptionName
      };

      console.log('🔄 Creating order with data:', orderData);
      const response = await saleService.createOrder(orderData);

      if (response.success) {
        console.log('✅ Order created successfully:', response);
        handleCloseCreateModal();
        // Refresh orders list
        await fetchOrders();
        alert('✅ Đơn hàng đã được tạo thành công!');
      } else {
        console.error('❌ Failed to create order:', response.message);
        alert(`❌ Lỗi khi tạo đơn hàng: ${response.message}`);
      }
    } catch (error) {
      console.error('❌ Error creating order:', error);
      alert(`Lỗi khi tạo đơn hàng: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setCreatingOrder(false);
    }
  };

  // Handle edit order
  const handleEditOrder = (order: Order) => {
    console.log('🔍 Editing order:', order);
    
    // Populate edit form with order data
    setEditForm({
      orderId: order.orderId,
      quotationId: order.quotationId,
      userId: order.userId,
      vehicleId: order.vehicleId,
      orderDate: order.orderDate,
      deliveryAddress: order.deliveryAddress || '',
      attachmentImage: order.attachmentImage || '',
      attachmentFile: order.attachmentFile || '',
      status: order.status,
      totalAmount: order.totalAmount,
      promotionCode: order.promotionCode || '',
      promotionOptionName: order.promotionOptionName || ''
    });

    setEditFormInputs({
      quotationId: order.quotationId.toString(),
      userId: order.userId.toString(),
      vehicleId: order.vehicleId.toString(),
      totalAmount: order.totalAmount.toString()
    });

    setShowEditModal(true);
  };

  // Handle update order
  const handleUpdateOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setEditingOrder(true);

    try {
      // Parse form inputs to numbers
      const quotationId = parseInt(editFormInputs.quotationId) || 0;
      const userId = parseInt(editFormInputs.userId) || 0;
      const vehicleId = parseInt(editFormInputs.vehicleId) || 0;
      const totalAmount = parseFloat(editFormInputs.totalAmount) || 0;

      const updateData: UpdateOrderRequest = {
        orderId: editForm.orderId,
        quotationId: quotationId,
        userId: userId,
        vehicleId: vehicleId,
        orderDate: editForm.orderDate,
        deliveryAddress: editForm.deliveryAddress,
        attachmentImage: editForm.attachmentImage,
        attachmentFile: editForm.attachmentFile,
        status: editForm.status,
        totalAmount: totalAmount,
        promotionCode: editForm.promotionCode,
        promotionOptionName: editForm.promotionOptionName
      };

      console.log('🔄 Updating order with data:', updateData);
      const response = await saleService.updateOrder(editForm.orderId, updateData);

      if (response.success) {
        console.log('✅ Order updated successfully:', response);
        setShowEditModal(false);
        // Refresh orders list
        await fetchOrders();
        alert('✅ Đơn hàng đã được cập nhật thành công!');
      } else {
        console.error('❌ Failed to update order:', response.message);
        alert(`❌ Lỗi khi cập nhật đơn hàng: ${response.message}`);
      }
    } catch (error) {
      console.error('❌ Error updating order:', error);
      alert(`Lỗi khi cập nhật đơn hàng: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setEditingOrder(false);
    }
  };

  // Handle delete order
  const handleDeleteOrder = (order: Order) => {
    setOrderToDelete(order);
    setShowDeleteModal(true);
  };

  // Confirm delete order
  const handleConfirmDelete = async () => {
    if (!orderToDelete) return;
    
    setDeletingOrder(true);

    try {
      console.log('🗑️ Deleting order:', orderToDelete.orderId);
      const response = await saleService.deleteOrder(orderToDelete.orderId);

      if (response.success) {
        console.log('✅ Order deleted successfully:', response);
        setShowDeleteModal(false);
        setOrderToDelete(null);
        // Refresh orders list
        await fetchOrders();
        alert('✅ Đơn hàng đã được xóa thành công!');
      } else {
        console.error('❌ Failed to delete order:', response.message);
        alert(`❌ Lỗi khi xóa đơn hàng: ${response.message}`);
      }
    } catch (error) {
      console.error('❌ Error deleting order:', error);
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      setErrorMessage(errorMsg);
      setShowDeleteModal(false); // Close delete modal
      setOrderToDelete(null);
      setShowErrorModal(true); // Show error modal instead
    } finally {
      setDeletingOrder(false);
    }
  };

  // Open upload modal
  const handleOpenUploadModal = (order: Order) => {
    setOrderToUpload(order);
    setAttachmentImageFile(null);
    setAttachmentDocFile(null);
    setShowUploadModal(true);
  };

  // Upload attachments
  const handleUploadAttachments = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderToUpload) return;

    if (!attachmentImageFile && !attachmentDocFile) {
      alert('❌ Vui lòng chọn ít nhất một tệp để upload!');
      return;
    }

    setUploadingAttachments(true);

    try {
      console.log('📤 Uploading attachments for order:', orderToUpload.orderId);
      const response = await saleService.uploadOrderAttachments(
        orderToUpload.orderId,
        attachmentImageFile,
        attachmentDocFile
      );

      if (response.success) {
        console.log('✅ Attachments uploaded successfully:', response);
        alert(`✅ Upload tệp đính kèm thành công!\n📎 ${response.message}`);
        setShowUploadModal(false);
        setOrderToUpload(null);
        setAttachmentImageFile(null);
        setAttachmentDocFile(null);
        // Refresh orders list
        await fetchOrders();
      } else {
        console.error('❌ Failed to upload attachments:', response.message);
        alert(`❌ Lỗi khi upload tệp đính kèm: ${response.message}`);
      }
    } catch (error) {
      console.error('❌ Error uploading attachments:', error);
      alert(`Lỗi khi upload tệp đính kèm: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setUploadingAttachments(false);
    }
  };

  // Open create contract modal
  const handleOpenCreateContractModal = (order: Order) => {
    if (order.status !== 'CONFIRMED') {
      alert('❌ Chỉ có thể tạo hợp đồng từ đơn hàng đã được duyệt!');
      return;
    }

    setSelectedOrderForContract(order);
    
    // Pre-fill form with order data
    setContractForm({
      salesContractId: 0, // Will be set by backend
      orderId: order.orderId,
      contractDate: new Date().toISOString(),
      terms: 'Standard Terms and Conditions',
      signedByDealer: 'Dealer One',
      customerName: '',
      phone: '',
      email: '',
      paymentMethod: 'CASH',
      address: order.deliveryAddress || '',
      cccd: '',
      contractImage: '',
      contractFile: ''
    });

    setShowCreateContractModal(true);
  };

  // Create contract
  const handleCreateContract = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreatingContract(true);

    try {
      // Create contract data matching CreateSaleContractRequest schema
      const contractData: CreateSaleContractRequest = {
        salesContractId: 0, // Will be set by backend
        orderId: contractForm.orderId,
        contractDate: contractForm.contractDate,
        terms: contractForm.terms || 'Standard Terms and Conditions',
        signedByDealer: contractForm.signedByDealer || 'Dealer One',
        customerName: contractForm.customerName || '',
        phone: contractForm.phone || '',
        email: contractForm.email || '',
        paymentMethod: contractForm.paymentMethod || 'CASH',
        address: contractForm.address || '',
        cccd: contractForm.cccd || '',
        contractImage: contractForm.contractImage || '',
        contractFile: contractForm.contractFile || ''
      };

      console.log('🔄 Creating contract with data:', contractData);
      console.log('📤 Request body being sent:', JSON.stringify(contractData, null, 2));
      
      const response = await saleService.createSaleContract(contractData);

      if (response.success) {
        console.log('✅ Contract created successfully:', response);
        setShowCreateContractModal(false);
        setSelectedOrderForContract(null);
        // Refresh orders list
        await fetchOrders();
        alert('✅ Hợp đồng đã được tạo thành công!');
      } else {
        console.error('❌ Failed to create contract:', response.message);
        alert(`❌ Lỗi khi tạo hợp đồng: ${response.message}`);
      }
    } catch (error) {
      console.error('❌ Error creating contract:', error);
      alert(`Lỗi khi tạo hợp đồng: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setCreatingContract(false);
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
        return 'Chờ duyệt';
      case 'CONFIRMED':
        return 'Đã duyệt';
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
            <button
              onClick={handleOpenCreateModal}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-6 py-3 rounded-xl font-medium flex items-center space-x-2 shadow-lg transition-all duration-200 transform hover:scale-105"
            >
              <Plus className="h-5 w-5" />
              <span>Tạo đơn hàng</span>
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
                    <button
                      onClick={() => handleOpenUploadModal(order)}
                      className="p-3 text-indigo-600 hover:text-indigo-800 hover:bg-indigo-100 rounded-xl transition-all duration-200"
                      title="Upload tệp đính kèm"
                    >
                      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                      </svg>
                    </button>
                    <button
                      onClick={() => handleEditOrder(order)}
                      className="p-3 text-green-600 hover:text-green-800 hover:bg-green-100 rounded-xl transition-all duration-200"
                      title="Chỉnh sửa"
                    >
                      <Edit className="h-5 w-5" />
                    </button>
                    {order.status === 'CONFIRMED' && (
                      <button
                        onClick={() => handleOpenCreateContractModal(order)}
                        className="p-3 text-purple-600 hover:text-purple-800 hover:bg-purple-100 rounded-xl transition-all duration-200"
                        title="Tạo hợp đồng"
                      >
                        <FileText className="h-5 w-5" />
                      </button>
                    )}
                    <button
                      onClick={() => handleDeleteOrder(order)}
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

              {/* Attachment Files */}
              {(selectedOrder.attachmentImage || selectedOrder.attachmentFile) && (
                <div className="mt-6">
                  <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2 mb-4">Tệp đính kèm</h3>
                  
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
                    {selectedOrder.attachmentImage && (
                      <div className="bg-gradient-to-br from-purple-50 via-purple-25 to-pink-50 rounded-2xl p-4 border-2 border-purple-200 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden">
                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                          <div className="flex items-center space-x-3 flex-1 min-w-0">
                            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg flex-shrink-0">
                              <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-bold text-gray-800 mb-1">Ảnh đính kèm</p>
                              <p className="text-gray-600 text-xs truncate overflow-hidden">{selectedOrder.attachmentImage.split('/').pop() || selectedOrder.attachmentImage}</p>
                            </div>
                          </div>
                          <div className="flex space-x-2 flex-shrink-0 w-full sm:w-auto">
                            <a
                              href={`https://localhost:7216${selectedOrder.attachmentImage.startsWith('/') ? '' : '/'}${selectedOrder.attachmentImage}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-3 py-2 bg-gradient-to-r from-purple-600 to-purple-700 text-white text-xs font-medium rounded-lg hover:from-purple-700 hover:to-purple-800 transition-all duration-200 flex items-center justify-center space-x-1 shadow-md hover:shadow-lg flex-1 sm:flex-none"
                            >
                              <Eye className="h-3 w-3" />
                              <span>Xem</span>
                            </a>
                            <a
                              href={`https://localhost:7216${selectedOrder.attachmentImage.startsWith('/') ? '' : '/'}${selectedOrder.attachmentImage}`}
                              download
                              className="px-3 py-2 bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 text-xs font-medium rounded-lg hover:from-purple-200 hover:to-pink-200 transition-all duration-200 flex items-center justify-center space-x-1 border border-purple-200 flex-1 sm:flex-none"
                            >
                              <Download className="h-3 w-3" />
                              <span>Tải</span>
                            </a>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {selectedOrder.attachmentFile && (
                      <div className="bg-gradient-to-br from-blue-50 via-blue-25 to-indigo-50 rounded-2xl p-4 border-2 border-blue-200 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden">
                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                          <div className="flex items-center space-x-3 flex-1 min-w-0">
                            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center shadow-lg flex-shrink-0">
                              <FileText className="h-6 w-6 text-white" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-bold text-gray-800 mb-1">Tệp đính kèm</p>
                              <p className="text-gray-600 text-xs truncate overflow-hidden">{selectedOrder.attachmentFile.split('/').pop() || selectedOrder.attachmentFile}</p>
                            </div>
                          </div>
                          <div className="flex space-x-2 flex-shrink-0 w-full sm:w-auto">
                            <a
                              href={`https://localhost:7216${selectedOrder.attachmentFile.startsWith('/') ? '' : '/'}${selectedOrder.attachmentFile}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-3 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white text-xs font-medium rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200 flex items-center justify-center space-x-1 shadow-md hover:shadow-lg flex-1 sm:flex-none"
                            >
                              <Eye className="h-3 w-3" />
                              <span>Xem</span>
                            </a>
                            <a
                              href={`https://localhost:7216${selectedOrder.attachmentFile.startsWith('/') ? '' : '/'}${selectedOrder.attachmentFile}`}
                              download
                              className="px-3 py-2 bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-700 text-xs font-medium rounded-lg hover:from-blue-200 hover:to-indigo-200 transition-all duration-200 flex items-center justify-center space-x-1 border border-blue-200 flex-1 sm:flex-none"
                            >
                              <Download className="h-3 w-3" />
                              <span>Tải</span>
                            </a>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="mt-8">
                {/* File attachment indicator */}
                {(selectedOrder.attachmentImage || selectedOrder.attachmentFile) && (
                  <div className="mb-4">
                    <span className="text-sm text-gray-600 font-medium">Tệp đính kèm đã upload:</span>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex flex-wrap items-center gap-3">
                  {selectedOrder.attachmentImage && (
                    <a 
                      href={`https://localhost:7216${selectedOrder.attachmentImage.startsWith('/') ? '' : '/'}${selectedOrder.attachmentImage}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-xl hover:from-purple-700 hover:to-purple-800 transition-all duration-200 text-sm font-medium flex items-center space-x-2 shadow-md hover:shadow-lg"
                    >
                      <Eye className="h-4 w-4" />
                      <span>Xem ảnh</span>
                    </a>
                  )}
                  {selectedOrder.attachmentFile && (
                    <a 
                      href={`https://localhost:7216${selectedOrder.attachmentFile.startsWith('/') ? '' : '/'}${selectedOrder.attachmentFile}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-200 text-sm font-medium flex items-center space-x-2 shadow-md hover:shadow-lg"
                    >
                      <Eye className="h-4 w-4" />
                      <span>Xem tài liệu</span>
                    </a>
                  )}
                  
                  <button
                    onClick={() => {
                      if (selectedOrder) {
                        handleEditOrder(selectedOrder);
                        setShowDetailModal(false);
                      }
                    }}
                    className="px-4 py-2 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-xl hover:from-green-700 hover:to-green-800 transition-all duration-200 text-sm font-medium flex items-center space-x-2 shadow-md hover:shadow-lg"
                  >
                    <Edit className="h-4 w-4" />
                    <span>Chỉnh sửa</span>
                  </button>
                  
                  {selectedOrder.status === 'CONFIRMED' && (
                    <button
                      onClick={() => {
                        if (selectedOrder) {
                          setShowDetailModal(false);
                          handleOpenCreateContractModal(selectedOrder);
                        }
                      }}
                      className="px-4 py-2 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-xl hover:from-purple-700 hover:to-purple-800 transition-all duration-200 text-sm font-medium flex items-center space-x-2 shadow-md hover:shadow-lg"
                    >
                      <FileText className="h-4 w-4" />
                      <span>Tạo hợp đồng</span>
                    </button>
                  )}
                  
                  <button
                    onClick={() => {
                      if (selectedOrder) {
                        handleDeleteOrder(selectedOrder);
                        setShowDetailModal(false);
                      }
                    }}
                    className="px-4 py-2 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-xl hover:from-red-700 hover:to-red-800 transition-all duration-200 text-sm font-medium flex items-center space-x-2 shadow-md hover:shadow-lg"
                  >
                    <Trash2 className="h-4 w-4" />
                    <span>Xóa</span>
                  </button>
                  
                  <button
                    onClick={() => setShowDetailModal(false)}
                    className="px-4 py-2 bg-white border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 text-sm font-medium"
                  >
                    Đóng
                  </button>

                  {!(selectedOrder.attachmentImage || selectedOrder.attachmentFile) && (
                    <button
                      onClick={() => {
                        setShowDetailModal(false);
                        handleOpenUploadModal(selectedOrder);
                      }}
                      className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 text-sm font-medium flex items-center space-x-2 shadow-md hover:shadow-lg"
                    >
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                      </svg>
                      <span>Upload tệp</span>
                    </button>
                  )}
                </div>

                {/* Upload hint for empty state */}
                {!(selectedOrder.attachmentImage || selectedOrder.attachmentFile) && (
                  <div className="mt-3">
                    <span className="text-sm text-gray-500">Chưa có tệp đính kèm nào</span>
                  </div>
                )}
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

      {/* Create Order Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-[9999]">
          <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl transform transition-all max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white p-6 rounded-t-2xl">
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-white bg-opacity-20 rounded-xl flex items-center justify-center">
                    <Plus className="h-6 w-6" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">Tạo đơn hàng mới</h2>
                    <p className="text-blue-100 text-sm">Nhập thông tin đơn hàng</p>
                  </div>
                </div>
                <button
                  onClick={handleCloseCreateModal}
                  className="text-white hover:text-blue-200 transition-colors p-2 hover:bg-white hover:bg-opacity-10 rounded-lg"
                  disabled={creatingOrder}
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-6">
              <form id="create-order-form" onSubmit={handleCreateOrder} className="space-y-4">
                {/* Row 1: Quotation ID & User ID */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700">
                      <FileText className="h-4 w-4 text-blue-600" />
                      <span>ID Báo giá *</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={formInputs.quotationId}
                      onChange={(e) => setFormInputs({...formInputs, quotationId: e.target.value})}
                      className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all duration-200 bg-gray-50 focus:bg-white"
                      placeholder="Nhập ID báo giá"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700">
                      <User className="h-4 w-4 text-blue-600" />
                      <span>ID Khách hàng *</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={formInputs.userId}
                      onChange={(e) => setFormInputs({...formInputs, userId: e.target.value})}
                      className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all duration-200 bg-gray-50 focus:bg-white"
                      placeholder="Nhập ID khách hàng"
                    />
                  </div>
                </div>

                {/* Row 2: Vehicle ID & Total Amount */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700">
                      <Car className="h-4 w-4 text-blue-600" />
                      <span>ID Xe *</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={formInputs.vehicleId}
                      onChange={(e) => setFormInputs({...formInputs, vehicleId: e.target.value})}
                      className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all duration-200 bg-gray-50 focus:bg-white"
                      placeholder="Nhập ID xe"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700">
                      <DollarSign className="h-4 w-4 text-blue-600" />
                      <span>Tổng tiền *</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={formInputs.totalAmount}
                      onChange={(e) => setFormInputs({...formInputs, totalAmount: e.target.value})}
                      className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all duration-200 bg-gray-50 focus:bg-white"
                      placeholder="Nhập tổng tiền"
                    />
                  </div>
                </div>

                {/* Row 3: Delivery Address */}
                <div className="space-y-2">
                  <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700">
                    <Truck className="h-4 w-4 text-blue-600" />
                    <span>Địa chỉ giao hàng</span>
                  </label>
                  <textarea
                    value={createForm.deliveryAddress}
                    onChange={(e) => setCreateForm({...createForm, deliveryAddress: e.target.value})}
                    className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all duration-200 bg-gray-50 focus:bg-white"
                    placeholder="Nhập địa chỉ giao hàng"
                    rows={3}
                  />
                </div>

                {/* Row 4: Promotion Code & Option Name */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700">
                      <Gift className="h-4 w-4 text-blue-600" />
                      <span>Mã khuyến mãi *</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={createForm.promotionCode}
                      onChange={(e) => setCreateForm({...createForm, promotionCode: e.target.value.toUpperCase()})}
                      className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all duration-200 bg-gray-50 focus:bg-white uppercase"
                      placeholder="Nhập mã khuyến mãi"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700">
                      <Tag className="h-4 w-4 text-blue-600" />
                      <span>Tên khuyến mãi *</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={createForm.promotionOptionName}
                      onChange={(e) => setCreateForm({...createForm, promotionOptionName: e.target.value})}
                      className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all duration-200 bg-gray-50 focus:bg-white"
                      placeholder="Nhập tên khuyến mãi"
                    />
                  </div>
                </div>

                {/* Row 5: Attachment Files */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700">
                      <svg className="h-4 w-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span>Ảnh đính kèm</span>
                    </label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0] || null;
                        handleFileUpload('attachmentImage', file);
                      }}
                      className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all duration-200 bg-gray-50 focus:bg-white file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                    />
                    {uploadFiles.attachmentImage && (
                      <p className="text-sm text-gray-600 mt-1">
                        Đã chọn: {uploadFiles.attachmentImage.name}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700">
                      <FileText className="h-4 w-4 text-blue-600" />
                      <span>Tệp đính kèm</span>
                    </label>
                    <input
                      type="file"
                      accept=".pdf,.doc,.docx,.txt"
                      onChange={(e) => {
                        const file = e.target.files?.[0] || null;
                        handleFileUpload('attachmentFile', file);
                      }}
                      className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all duration-200 bg-gray-50 focus:bg-white file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                    />
                    {uploadFiles.attachmentFile && (
                      <p className="text-sm text-gray-600 mt-1">
                        Đã chọn: {uploadFiles.attachmentFile.name}
                      </p>
                    )}
                  </div>
                </div>

                {/* Row 5: Status */}
                <div className="space-y-2">
                  <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700">
                    <svg className="h-4 w-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>Trạng thái *</span>
                  </label>
                  <select
                    required
                    value={createForm.status}
                    onChange={(e) => setCreateForm({...createForm, status: e.target.value})}
                    className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all duration-200 bg-gray-50 focus:bg-white appearance-none"
                  >
                    <option value="PENDING">Chờ duyệt</option>
                    <option value="CONFIRMED">Đã duyệt</option>
                    <option value="CANCELLED">Đã hủy</option>
                  </select>
                </div>
              </form>
            </div>

            {/* Footer */}
            <div className="bg-gray-50 px-6 py-4 rounded-b-2xl flex justify-end space-x-3">
              <button
                type="button"
                onClick={handleCloseCreateModal}
                className="px-6 py-3 border-2 border-gray-300 rounded-xl text-gray-700 hover:bg-white hover:border-gray-400 transition-all duration-200 font-medium"
                disabled={creatingOrder}
              >
                Hủy
              </button>
              <button
                type="submit"
                form="create-order-form"
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 transition-all duration-200 font-medium shadow-lg"
                disabled={creatingOrder}
              >
                {creatingOrder && (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                )}
                <Plus className="h-4 w-4" />
                <span>{creatingOrder ? 'Đang tạo...' : 'Tạo đơn hàng'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Order Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl transform transition-all max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white p-6 rounded-t-2xl">
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-white bg-opacity-20 rounded-xl flex items-center justify-center">
                    <Edit className="h-6 w-6" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">Chỉnh sửa đơn hàng</h2>
                    <p className="text-green-100 text-sm">Cập nhật thông tin đơn hàng #{editForm.orderId}</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowEditModal(false)}
                  className="text-white hover:text-green-200 transition-colors p-2 hover:bg-white hover:bg-opacity-10 rounded-lg"
                  disabled={editingOrder}
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-6">
              <form id="edit-order-form" onSubmit={handleUpdateOrder} className="space-y-4">
                {/* Row 1: Quotation ID & User ID */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700">
                      <FileText className="h-4 w-4 text-green-600" />
                      <span>ID Báo giá *</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={editFormInputs.quotationId}
                      onChange={(e) => setEditFormInputs({...editFormInputs, quotationId: e.target.value})}
                      className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:border-green-500 focus:ring-2 focus:ring-green-100 transition-all duration-200 bg-gray-50 focus:bg-white"
                      placeholder="Nhập ID báo giá"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700">
                      <User className="h-4 w-4 text-green-600" />
                      <span>ID Khách hàng *</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={editFormInputs.userId}
                      onChange={(e) => setEditFormInputs({...editFormInputs, userId: e.target.value})}
                      className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:border-green-500 focus:ring-2 focus:ring-green-100 transition-all duration-200 bg-gray-50 focus:bg-white"
                      placeholder="Nhập ID khách hàng"
                    />
                  </div>
                </div>

                {/* Row 2: Vehicle ID & Total Amount */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700">
                      <Car className="h-4 w-4 text-green-600" />
                      <span>ID Xe *</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={editFormInputs.vehicleId}
                      onChange={(e) => setEditFormInputs({...editFormInputs, vehicleId: e.target.value})}
                      className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:border-green-500 focus:ring-2 focus:ring-green-100 transition-all duration-200 bg-gray-50 focus:bg-white"
                      placeholder="Nhập ID xe"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700">
                      <DollarSign className="h-4 w-4 text-green-600" />
                      <span>Tổng tiền *</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={editFormInputs.totalAmount}
                      onChange={(e) => setEditFormInputs({...editFormInputs, totalAmount: e.target.value})}
                      className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:border-green-500 focus:ring-2 focus:ring-green-100 transition-all duration-200 bg-gray-50 focus:bg-white"
                      placeholder="Nhập tổng tiền"
                    />
                  </div>
                </div>

                {/* Row 3: Delivery Address */}
                <div className="space-y-2">
                  <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700">
                    <Truck className="h-4 w-4 text-green-600" />
                    <span>Địa chỉ giao hàng</span>
                  </label>
                  <textarea
                    value={editForm.deliveryAddress}
                    onChange={(e) => setEditForm({...editForm, deliveryAddress: e.target.value})}
                    className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:border-green-500 focus:ring-2 focus:ring-green-100 transition-all duration-200 bg-gray-50 focus:bg-white"
                    placeholder="Nhập địa chỉ giao hàng"
                    rows={3}
                  />
                </div>

                {/* Row 4: Promotion Code & Option Name */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700">
                      <Gift className="h-4 w-4 text-green-600" />
                      <span>Mã khuyến mãi *</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={editForm.promotionCode}
                      onChange={(e) => setEditForm({...editForm, promotionCode: e.target.value.toUpperCase()})}
                      className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:border-green-500 focus:ring-2 focus:ring-green-100 transition-all duration-200 bg-gray-50 focus:bg-white uppercase"
                      placeholder="Nhập mã khuyến mãi"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700">
                      <Tag className="h-4 w-4 text-green-600" />
                      <span>Tên khuyến mãi *</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={editForm.promotionOptionName}
                      onChange={(e) => setEditForm({...editForm, promotionOptionName: e.target.value})}
                      className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:border-green-500 focus:ring-2 focus:ring-green-100 transition-all duration-200 bg-gray-50 focus:bg-white"
                      placeholder="Nhập tên khuyến mãi"
                    />
                  </div>
                </div>

                {/* Row 5: Status */}
                <div className="space-y-2">
                  <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700">
                    <svg className="h-4 w-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>Trạng thái *</span>
                  </label>
                  <select
                    required
                    value={editForm.status}
                    onChange={(e) => setEditForm({...editForm, status: e.target.value})}
                    className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:border-green-500 focus:ring-2 focus:ring-green-100 transition-all duration-200 bg-gray-50 focus:bg-white appearance-none"
                  >
                    <option value="PENDING">Chờ duyệt</option>
                    <option value="CONFIRMED">Đã duyệt</option>
                    <option value="CANCELLED">Đã hủy</option>
                  </select>
                </div>
              </form>
            </div>

            {/* Footer */}
            <div className="bg-gray-50 px-6 py-4 rounded-b-2xl flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setShowEditModal(false)}
                className="px-6 py-3 border-2 border-gray-300 rounded-xl text-gray-700 hover:bg-white hover:border-gray-400 transition-all duration-200 font-medium"
                disabled={editingOrder}
              >
                Hủy
              </button>
              <button
                type="submit"
                form="edit-order-form"
                className="px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:from-green-700 hover:to-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 transition-all duration-200 font-medium shadow-lg"
                disabled={editingOrder}
              >
                {editingOrder && (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                )}
                <Edit className="h-4 w-4" />
                <span>{editingOrder ? 'Đang cập nhật...' : 'Cập nhật'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && orderToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl transform transition-all">
            {/* Header */}
            <div className="bg-gradient-to-r from-red-500 to-pink-600 text-white p-6 rounded-t-2xl">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-white bg-opacity-20 rounded-xl flex items-center justify-center">
                  <Trash2 className="h-6 w-6" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold">Xác nhận xóa đơn hàng</h2>
                  <p className="text-red-100 text-sm">Hành động này không thể hoàn tác</p>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="p-6">
              <div className="bg-red-50 rounded-xl p-4 border border-red-200 mb-4">
                <div className="flex items-start space-x-3">
                  <svg className="h-6 w-6 text-red-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                  <div>
                    <h3 className="text-sm font-semibold text-red-800 mb-1">Cảnh báo</h3>
                    <p className="text-sm text-red-700">
                      Bạn có chắc chắn muốn xóa đơn hàng <strong>#{orderToDelete.orderId}</strong>?
                      Tất cả dữ liệu liên quan đến đơn hàng này sẽ bị xóa vĩnh viễn và không thể khôi phục.
                    </p>
                    <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <p className="text-sm text-yellow-800 font-medium">
                        ⚠️ Lưu ý: Nếu đơn hàng có liên quan đến giao dịch thanh toán, bạn cần xóa các giao dịch đó trước khi xóa đơn hàng.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="text-gray-700 text-sm space-y-2">
                <p><strong>ID Đơn hàng:</strong> {orderToDelete.orderId}</p>
                <p><strong>ID Báo giá:</strong> {orderToDelete.quotationId}</p>
                <p><strong>ID Khách hàng:</strong> {orderToDelete.userId}</p>
                <p><strong>Tổng tiền:</strong> {formatPrice(orderToDelete.totalAmount)}</p>
              </div>
            </div>

            {/* Footer */}
            <div className="bg-gray-50 px-6 py-4 rounded-b-2xl flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => {
                  setShowDeleteModal(false);
                  setOrderToDelete(null);
                }}
                className="px-6 py-3 border-2 border-gray-300 rounded-xl text-gray-700 hover:bg-white hover:border-gray-400 transition-all duration-200 font-medium"
                disabled={deletingOrder}
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="px-6 py-3 bg-gradient-to-r from-red-600 to-pink-600 text-white rounded-xl hover:from-red-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 transition-all duration-200 font-medium shadow-lg"
                disabled={deletingOrder}
              >
                {deletingOrder && (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                )}
                <Trash2 className="h-4 w-4" />
                <span>{deletingOrder ? 'Đang xóa...' : 'Xóa đơn hàng'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Error Modal */}
      {showErrorModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl transform transition-all">
            {/* Header */}
            <div className="bg-gradient-to-r from-red-500 to-pink-600 text-white p-6 rounded-t-2xl">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-white bg-opacity-20 rounded-xl flex items-center justify-center">
                  <AlertTriangle className="h-6 w-6" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold">Không thể xóa đơn hàng</h2>
                  <p className="text-red-100 text-sm">Có lỗi xảy ra khi thực hiện thao tác</p>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="p-6">
              <div className="bg-red-50 rounded-xl p-4 border border-red-200 mb-4">
                <div className="flex items-start space-x-3">
                  <AlertTriangle className="h-6 w-6 text-red-600 mt-0.5 flex-shrink-0" />
                  <div className="text-sm text-red-700">
                    <p className="font-semibold mb-2">Chi tiết lỗi:</p>
                    <p>{errorMessage}</p>
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
                <div className="flex items-start space-x-3">
                  <svg className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div>
                    <h3 className="text-sm font-semibold text-blue-800 mb-1">Hướng dẫn khắc phục</h3>
                    <div className="text-sm text-blue-700 space-y-1">
                      <p>• Kiểm tra xem đơn hàng có liên quan đến giao dịch thanh toán nào không</p>
                      <p>• Xóa các giao dịch thanh toán liên quan trước khi xóa đơn hàng</p>
                      <p>• Hoặc liên hệ quản trị viên để được hỗ trợ</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="bg-gray-50 px-6 py-4 rounded-b-2xl flex justify-end">
              <button
                type="button"
                onClick={() => {
                  setShowErrorModal(false);
                  setErrorMessage('');
                }}
                className="px-6 py-3 bg-gradient-to-r from-gray-600 to-gray-700 text-white rounded-xl hover:from-gray-700 hover:to-gray-800 transition-all duration-200 font-medium"
              >
                Đã hiểu
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Upload Attachments Modal */}
      {showUploadModal && orderToUpload && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-[9999]">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl transform transition-all">
            {/* Header */}
            <div className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white p-6 rounded-t-2xl">
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-white bg-opacity-20 rounded-xl flex items-center justify-center">
                    <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">Upload tệp đính kèm</h2>
                    <p className="text-indigo-100 text-sm">Đơn hàng #{orderToUpload.orderId}</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowUploadModal(false)}
                  className="text-white hover:text-indigo-200 transition-colors p-2 hover:bg-white hover:bg-opacity-10 rounded-lg"
                  disabled={uploadingAttachments}
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-6">
              <form id="upload-attachments-form" onSubmit={handleUploadAttachments} className="space-y-6">
                {/* Attachment Image */}
                <div className="space-y-3">
                  <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700">
                    <svg className="h-5 w-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span>Hình ảnh (JPG, PNG)</span>
                  </label>
                  <div className="relative">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => setAttachmentImageFile(e.target.files?.[0] || null)}
                      className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all duration-200 bg-gray-50 focus:bg-white file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                    />
                  </div>
                  {attachmentImageFile && (
                    <div className="flex items-center space-x-2 text-sm text-green-600 bg-green-50 rounded-lg p-3">
                      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span>Đã chọn: {attachmentImageFile.name}</span>
                    </div>
                  )}
                </div>

                {/* Attachment File */}
                <div className="space-y-3">
                  <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700">
                    <svg className="h-5 w-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <span>Tệp tin (PDF, DOC, DOCX)</span>
                  </label>
                  <div className="relative">
                    <input
                      type="file"
                      accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                      onChange={(e) => setAttachmentDocFile(e.target.files?.[0] || null)}
                      className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all duration-200 bg-gray-50 focus:bg-white file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                    />
                  </div>
                  {attachmentDocFile && (
                    <div className="flex items-center space-x-2 text-sm text-green-600 bg-green-50 rounded-lg p-3">
                      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span>Đã chọn: {attachmentDocFile.name}</span>
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-blue-800">Lưu ý</h3>
                      <div className="mt-2 text-sm text-blue-700">
                        <p>• Bạn có thể upload cả 2 tệp hoặc chỉ 1 tệp</p>
                        <p>• Hình ảnh: JPG, PNG (tối đa 10MB)</p>
                        <p>• Tệp tin: PDF, DOC, DOCX (tối đa 10MB)</p>
                      </div>
                    </div>
                  </div>
                </div>
              </form>
            </div>

            {/* Footer */}
            <div className="bg-gray-50 px-6 py-4 rounded-b-2xl flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setShowUploadModal(false)}
                className="px-6 py-3 border-2 border-gray-300 rounded-xl text-gray-700 hover:bg-white hover:border-gray-400 transition-all duration-200 font-medium"
                disabled={uploadingAttachments}
              >
                Hủy
              </button>
              <button
                type="submit"
                form="upload-attachments-form"
                className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:from-indigo-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 transition-all duration-200 font-medium shadow-lg"
                disabled={uploadingAttachments || (!attachmentImageFile && !attachmentDocFile)}
              >
                {uploadingAttachments && (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                )}
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                <span>{uploadingAttachments ? 'Đang upload...' : 'Upload'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Contract Modal */}
      {showCreateContractModal && selectedOrderForContract && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-[9999]">
          <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl transform transition-all max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="bg-gradient-to-r from-purple-500 to-pink-600 text-white p-6 rounded-t-2xl">
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-white bg-opacity-20 rounded-xl flex items-center justify-center">
                    <FileText className="h-6 w-6" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">Tạo hợp đồng từ đơn hàng</h2>
                    <p className="text-purple-100 text-sm">Đơn hàng #{selectedOrderForContract.orderId}</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowCreateContractModal(false)}
                  className="text-white hover:text-purple-200 transition-colors p-2 hover:bg-white hover:bg-opacity-10 rounded-lg"
                  disabled={creatingContract}
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-6">
              <form id="create-contract-form" onSubmit={handleCreateContract} className="space-y-6">
                {/* Row 1: Order ID & Contract Date */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700">
                      <FileText className="h-4 w-4 text-purple-600" />
                      <span>Order ID *</span>
                    </label>
                    <input
                      type="number"
                      required
                      value={contractForm.orderId}
                      onChange={(e) => setContractForm({...contractForm, orderId: parseInt(e.target.value)})}
                      className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:border-purple-500 focus:ring-2 focus:ring-purple-100 transition-all duration-200 bg-gray-50 focus:bg-white"
                      placeholder="Nhập Order ID"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700">
                      <Calendar className="h-4 w-4 text-purple-600" />
                      <span>Ngày hợp đồng *</span>
                    </label>
                    <input
                      type="datetime-local"
                      required
                      value={contractForm.contractDate.slice(0, 16)}
                      onChange={(e) => setContractForm({...contractForm, contractDate: new Date(e.target.value).toISOString()})}
                      className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:border-purple-500 focus:ring-2 focus:ring-purple-100 transition-all duration-200 bg-gray-50 focus:bg-white"
                    />
                  </div>
                </div>

                {/* Row 2: Signed By Dealer & Terms */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700">
                      <User className="h-4 w-4 text-purple-600" />
                      <span>Dealer *</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={contractForm.signedByDealer}
                      onChange={(e) => setContractForm({...contractForm, signedByDealer: e.target.value})}
                      className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:border-purple-500 focus:ring-2 focus:ring-purple-100 transition-all duration-200 bg-gray-50 focus:bg-white"
                      placeholder="Nhập tên dealer"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700">
                      <FileText className="h-4 w-4 text-purple-600" />
                      <span>Điều khoản</span>
                    </label>
                    <textarea
                      value={contractForm.terms}
                      onChange={(e) => setContractForm({...contractForm, terms: e.target.value})}
                      className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:border-purple-500 focus:ring-2 focus:ring-purple-100 transition-all duration-200 bg-gray-50 focus:bg-white"
                      placeholder="Nhập điều khoản hợp đồng"
                      rows={3}
                    />
                  </div>
                </div>

                {/* Row 3: Customer Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700">
                      <User className="h-4 w-4 text-purple-600" />
                      <span>Tên khách hàng</span>
                    </label>
                    <input
                      type="text"
                      value={contractForm.customerName}
                      onChange={(e) => setContractForm({...contractForm, customerName: e.target.value})}
                      className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:border-purple-500 focus:ring-2 focus:ring-purple-100 transition-all duration-200 bg-gray-50 focus:bg-white"
                      placeholder="Nhập tên khách hàng"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700">
                      <svg className="h-4 w-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                      <span>Số điện thoại</span>
                    </label>
                    <input
                      type="tel"
                      value={contractForm.phone}
                      onChange={(e) => setContractForm({...contractForm, phone: e.target.value})}
                      className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:border-purple-500 focus:ring-2 focus:ring-purple-100 transition-all duration-200 bg-gray-50 focus:bg-white"
                      placeholder="Nhập số điện thoại"
                    />
                  </div>
                </div>

                {/* Row 4: Email & Payment Method */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700">
                      <svg className="h-4 w-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                      <span>Email</span>
                    </label>
                    <input
                      type="email"
                      value={contractForm.email}
                      onChange={(e) => setContractForm({...contractForm, email: e.target.value})}
                      className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:border-purple-500 focus:ring-2 focus:ring-purple-100 transition-all duration-200 bg-gray-50 focus:bg-white"
                      placeholder="Nhập email"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700">
                      <DollarSign className="h-4 w-4 text-purple-600" />
                      <span>Phương thức thanh toán</span>
                    </label>
                    <select
                      value={contractForm.paymentMethod}
                      onChange={(e) => setContractForm({...contractForm, paymentMethod: e.target.value})}
                      className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:border-purple-500 focus:ring-2 focus:ring-purple-100 transition-all duration-200 bg-gray-50 focus:bg-white appearance-none"
                    >
                      <option value="CASH">Tiền mặt</option>
                      <option value="BANK_TRANSFER">Chuyển khoản</option>
                      <option value="CREDIT_CARD">Thẻ tín dụng</option>
                      <option value="INSTALLMENT">Trả góp</option>
                    </select>
                  </div>
                </div>

                {/* Row 5: Address & CCCD */}
                <div className="space-y-2">
                  <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700">
                    <svg className="h-4 w-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span>Địa chỉ</span>
                  </label>
                  <textarea
                    value={contractForm.address}
                    onChange={(e) => setContractForm({...contractForm, address: e.target.value})}
                    className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:border-purple-500 focus:ring-2 focus:ring-purple-100 transition-all duration-200 bg-gray-50 focus:bg-white"
                    placeholder="Nhập địa chỉ"
                    rows={2}
                  />
                </div>

                <div className="space-y-2">
                  <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700">
                    <svg className="h-4 w-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" />
                    </svg>
                    <span>CCCD</span>
                  </label>
                  <input
                    type="text"
                    value={contractForm.cccd}
                    onChange={(e) => setContractForm({...contractForm, cccd: e.target.value})}
                    className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:border-purple-500 focus:ring-2 focus:ring-purple-100 transition-all duration-200 bg-gray-50 focus:bg-white"
                    placeholder="Nhập số CCCD"
                  />
                </div>

                {/* Row 6: Contract Files */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700">
                      <svg className="h-4 w-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span>Ảnh hợp đồng *</span>
                    </label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          setContractForm({...contractForm, contractImage: file.name});
                        }
                      }}
                      className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:border-purple-500 focus:ring-2 focus:ring-purple-100 transition-all duration-200 bg-gray-50 focus:bg-white file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700">
                      <svg className="h-4 w-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <span>Tệp hợp đồng *</span>
                    </label>
                    <input
                      type="file"
                      accept=".pdf,.doc,.docx"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          setContractForm({...contractForm, contractFile: file.name});
                        }
                      }}
                      className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:border-purple-500 focus:ring-2 focus:ring-purple-100 transition-all duration-200 bg-gray-50 focus:bg-white file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100"
                      required
                    />
                  </div>
                </div>
              </form>
            </div>

            {/* Footer */}
            <div className="bg-gray-50 px-6 py-4 rounded-b-2xl flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setShowCreateContractModal(false)}
                className="px-6 py-3 border-2 border-gray-300 rounded-xl text-gray-700 hover:bg-white hover:border-gray-400 transition-all duration-200 font-medium"
                disabled={creatingContract}
              >
                Hủy
              </button>
              <button
                type="submit"
                form="create-contract-form"
                className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 transition-all duration-200 font-medium shadow-lg"
                disabled={creatingContract}
              >
                {creatingContract && (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                )}
                <FileText className="h-4 w-4" />
                <span>{creatingContract ? 'Đang tạo...' : 'Tạo hợp đồng'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
