import React, { useState, useEffect } from 'react';
import { Search, FileText, DollarSign, Calendar, User, Car, Eye, Package, Truck, Plus, Edit, Trash2, AlertTriangle, Download, Gift, Tag, CreditCard, CheckCircle, ShoppingBag } from 'lucide-react';
import { saleService, Order, CreateOrderRequest, GetOrderResponse, UpdateOrderRequest, CreateSaleContractRequest } from '../../../services/saleService';
import { paymentService, CreatePaymentRequest } from '../../../services/paymentService';
import { deliveryService, CreateDeliveryRequest } from '../../../services/deliveryService';
import { dealerOrderService } from '../../../services/dealerOrderService';
import { useAuth } from '../../../contexts/AuthContext';

export const OrderManagement: React.FC = () => {
  const { user } = useAuth();
  const isStaffEVM = user?.role === 'evm_staff';
  
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
  const [loadingUserInfo, setLoadingUserInfo] = useState(false);
  const [showCreatePaymentModal, setShowCreatePaymentModal] = useState(false);
  const [creatingPayment, setCreatingPayment] = useState(false);
  const [selectedOrderForPayment, setSelectedOrderForPayment] = useState<Order | null>(null);
  const [showCreateDeliveryModal, setShowCreateDeliveryModal] = useState(false);
  const [creatingDelivery, setCreatingDelivery] = useState(false);
  const [selectedOrderForDelivery, setSelectedOrderForDelivery] = useState<Order | null>(null);
  const [showCreateDealerOrderModal, setShowCreateDealerOrderModal] = useState(false);
  const [creatingDealerOrder, setCreatingDealerOrder] = useState(false);
  const [selectedOrderForDealerOrder, setSelectedOrderForDealerOrder] = useState<Order | null>(null);

  const [createForm, setCreateForm] = useState({
    orderId: 0,
    quotationId: 0,
    userId: 0,
    vehicleId: 0,
    color: '',
    orderDate: new Date().toISOString(),
    deliveryAddress: '',
    attachmentImage: '',
    attachmentFile: '',
    status: 'PENDING',
    promotionCode: '',
    promotionOptionName: '',
    quotationPrice: 0,
    finalPrice: 0,
    totalAmount: 0
  });

  const [formInputs, setFormInputs] = useState({
    quotationId: '',
    userId: '',
    vehicleId: '',
    quotationPrice: '',
    finalPrice: '',
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
    color: '',
    orderDate: '',
    deliveryAddress: '',
    attachmentImage: '',
    attachmentFile: '',
    status: 'PENDING',
    promotionCode: '',
    promotionOptionName: '',
    quotationPrice: 0,
    finalPrice: 0,
    totalAmount: 0
  });

  // Contract form state - match CreateSaleContractRequest schema
  const [contractForm, setContractForm] = useState({
    salesContractId: 0,
    orderId: 0,
    contractDate: new Date().toISOString(),
    terms: 'Điều khoản và Điều kiện Tiêu chuẩn',
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

  // Payment form state
  const [paymentForm, setPaymentForm] = useState({
    paymentId: 0,
    orderId: 0,
    paymentDate: new Date().toISOString().slice(0, 16),
    amount: 0,
    method: '',
    status: 'PENDING'
  });

  // Delivery form state
  const [deliveryForm, setDeliveryForm] = useState({
    deliveryId: 0,
    userId: 0,
    orderId: 0,
    vehicleId: 0,
    deliveryDate: new Date().toISOString().slice(0, 16),
    deliveryStatus: 'PENDING',
    notes: ''
  });

  // Dealer Order form state
  const [dealerOrderForm, setDealerOrderForm] = useState({
    dealerOrderId: 0,
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
        const ordersList = responseData.data;
        
        setOrders(ordersList);
        console.log('✅ Đơn hàng đã tải từ API:', ordersList.length);
      } else {
        console.log('❌ Không có dữ liệu đơn hàng trong phản hồi');
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
      color: '',
      orderDate: new Date().toISOString(),
      deliveryAddress: 'Chưa xác định',
      attachmentImage: 'default-image.jpg',
      attachmentFile: 'default-file.pdf',
      status: 'PENDING',
      promotionCode: '',
      promotionOptionName: '',
      quotationPrice: 0,
      finalPrice: 0,
      totalAmount: 0
    });
    
    setFormInputs({
      quotationId: '',
      userId: '',
      vehicleId: '',
      quotationPrice: '',
      finalPrice: '',
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
      color: '',
      orderDate: new Date().toISOString(),
      deliveryAddress: '',
      attachmentImage: '',
      attachmentFile: '',
      status: 'PENDING',
      promotionCode: '',
      promotionOptionName: '',
      quotationPrice: 0,
      finalPrice: 0,
      totalAmount: 0
    });
    setFormInputs({
      quotationId: '',
      userId: '',
      vehicleId: '',
      quotationPrice: '',
      finalPrice: '',
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
      const quotationPrice = parseFloat(formInputs.quotationPrice) || 0;
      const finalPrice = parseFloat(formInputs.finalPrice) || 0;

      // Handle file uploads - for now, send file names
      // TODO: Implement actual file upload to server
      const attachmentImage = uploadFiles.attachmentImage ? uploadFiles.attachmentImage.name : (createForm.attachmentImage || 'default-image.jpg');
      const attachmentFile = uploadFiles.attachmentFile ? uploadFiles.attachmentFile.name : (createForm.attachmentFile || 'default-file.pdf');

      const orderData: CreateOrderRequest = {
        orderId: 0, // Will be set by backend
        quotationId: quotationId,
        userId: userId,
        vehicleId: vehicleId,
        color: createForm.color || '',
        orderDate: createForm.orderDate,
        deliveryAddress: createForm.deliveryAddress || 'Chưa xác định',
        attachmentImage: attachmentImage,
        attachmentFile: attachmentFile,
        status: createForm.status,
        promotionCode: createForm.promotionCode || '',
        promotionOptionName: createForm.promotionOptionName || '',
        quotationPrice: quotationPrice,
        finalPrice: finalPrice
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

  // Handle edit order - Only allows status update
  const handleEditOrder = (order: Order) => {
    console.log('✏️ Opening edit modal for order:', order.orderId);
    
    // Populate edit form with order data
    setEditForm({
      orderId: order.orderId,
      quotationId: order.quotationId,
      userId: order.userId,
      vehicleId: order.vehicleId,
      color: order.color || '',
      orderDate: order.orderDate,
      deliveryAddress: order.deliveryAddress || '',
      attachmentImage: order.attachmentImage || '',
      attachmentFile: order.attachmentFile || '',
      status: order.status,
      promotionCode: order.promotionCode || '',
      promotionOptionName: order.promotionOptionName || '',
      quotationPrice: order.quotationPrice || 0,
      finalPrice: order.finalPrice || 0,
      totalAmount: order.totalAmount || 0
    });

    setShowEditModal(true);
  };

  // Handle update order - Only allows status update
  const handleUpdateOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setEditingOrder(true);

    try {
      // Only update status - keep other fields unchanged
      const updateData: UpdateOrderRequest = {
        orderId: editForm.orderId,
        quotationId: editForm.quotationId,
        userId: editForm.userId,
        vehicleId: editForm.vehicleId,
        color: editForm.color || '',
        orderDate: editForm.orderDate,
        deliveryAddress: editForm.deliveryAddress,
        attachmentImage: editForm.attachmentImage,
        attachmentFile: editForm.attachmentFile,
        status: editForm.status, // Only this field can be changed by user
        promotionCode: editForm.promotionCode || '',
        promotionOptionName: editForm.promotionOptionName || '',
        quotationPrice: editForm.quotationPrice,
        finalPrice: editForm.finalPrice
      };

      console.log('🔄 Updating order status to:', editForm.status);
      console.log('📊 Full order data:', updateData);
      const response = await saleService.updateOrder(editForm.orderId, updateData);

      if (response.success) {
        console.log('✅ Order updated successfully:', response);
        setShowEditModal(false);
        // Refresh orders list
        await fetchOrders();
        alert('✅ Trạng thái đơn hàng đã được cập nhật thành công!');
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

  // Fetch user info from API
  const fetchUserInfo = async (userId: number) => {
    try {
      setLoadingUserInfo(true);
      console.log(`🔍 Fetching user info for userId: ${userId}`);

      const token = localStorage.getItem('token');
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };

      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      // Try both possible endpoints
      let response = await fetch(`/api/Customer/${userId}`, {
        method: 'GET',
        headers,
      });

      console.log(`📡 Customer API Response Status: ${response.status}`);

      // If Customer endpoint fails, try User endpoint
      if (!response.ok) {
        console.log('⚠️ Customer API failed, trying User endpoint...');
        response = await fetch(`/api/User/${userId}`, {
          method: 'GET',
          headers,
        });
        console.log(`📡 User API Response Status: ${response.status}`);
      }

      if (!response.ok) {
        console.warn(`⚠️ Failed to fetch user info: ${response.status}`);
        const errorText = await response.text();
        console.log('Error response:', errorText);
        return null;
      }

      const data = await response.json();
      console.log('✅ User info fetched successfully!');
      console.log('📡 Raw API response:', data);

      // Handle different response formats
      const userData = data.data || data;
      console.log('📊 User data extracted:', userData);
      
      const userInfo = {
        fullName: userData.fullName || userData.name || userData.customerName || '',
        phone: userData.phone || userData.phoneNumber || '',
        email: userData.email || '',
        address: userData.address || ''
      };

      console.log('📋 Processed user info:');
      console.log('  - fullName:', userInfo.fullName);
      console.log('  - phone:', userInfo.phone);
      console.log('  - email:', userInfo.email);
      console.log('  - address:', userInfo.address);
      
      return userInfo;
    } catch (error) {
      console.error('❌ Error fetching user info:', error);
      return null;
    } finally {
      setLoadingUserInfo(false);
    }
  };

  // Open create contract modal
  const handleOpenCreateContractModal = async (order: Order) => {
    if (order.status !== 'approved') {
      alert('❌ Chỉ có thể tạo hợp đồng từ đơn hàng đã được duyệt!');
      return;
    }

    console.log('🔄 Opening contract modal for order:', order);
    setSelectedOrderForContract(order);
    
    // Open modal first to show loading state
    setShowCreateContractModal(true);
    
    // Fetch user info from database
    console.log(`🔍 Fetching user info for userId: ${order.userId}`);
    const userInfo = await fetchUserInfo(order.userId);
    console.log('✅ User info received:', userInfo);
    
    // Pre-fill form with order data and user info
    const newContractForm = {
      salesContractId: 0, // Will be set by backend
      orderId: order.orderId,
      contractDate: new Date().toISOString(),
      terms: 'Điều khoản và Điều kiện Tiêu chuẩn',
      signedByDealer: 'Dealer One',
      customerName: userInfo?.fullName || '',
      phone: userInfo?.phone || '',
      email: userInfo?.email || '',
      paymentMethod: 'CASH',
      address: userInfo?.address || order.deliveryAddress || '',
      cccd: '',
      contractImage: '',
      contractFile: ''
    };
    
    setContractForm(newContractForm);
    
    console.log('✅ Contract form pre-filled with user info:');
    console.log('📝 Form data:');
    console.log('  - customerName:', newContractForm.customerName);
    console.log('  - phone:', newContractForm.phone);
    console.log('  - email:', newContractForm.email);
    console.log('  - address:', newContractForm.address);
    console.log('  - orderId:', newContractForm.orderId);
  };

  // Create contract
  const handleCreateContract = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreatingContract(true);

    try {
      // Validate userId
      if (!selectedOrderForContract?.userId) {
        alert('❌ Lỗi: Không tìm thấy User ID từ đơn hàng!');
        setCreatingContract(false);
        return;
      }

      // Debug: Log current contract form state
      console.log('📋 Current contractForm state:', contractForm);
      console.log('📋 Selected order:', selectedOrderForContract);

      // Create contract data matching CreateSaleContractRequest schema
      // ✅ Backend will auto-fetch customer info from Users/Customers table using userId
      const contractData: CreateSaleContractRequest = {
        salesContractId: 0, // Will be set by backend
        orderId: contractForm.orderId,
        userId: selectedOrderForContract.userId, // ✅ Backend uses this to fetch customer info
        contractDate: contractForm.contractDate,
        terms: contractForm.terms || 'Standard Terms and Conditions',
        signedByDealer: contractForm.signedByDealer || 'Dealer One',
        paymentMethod: contractForm.paymentMethod || 'CASH',
        cccd: contractForm.cccd || '',
        contractImage: contractForm.contractImage || '',
        contractFile: contractForm.contractFile || ''
        // ❌ Removed: customerName, phone, email, address (backend auto-fetches)
      };

      console.log('🔄 Creating contract with data:', contractData);
      console.log('📤 Contract data being sent:');
      console.log('  - userId:', contractData.userId, '← Backend will fetch customer info from this');
      console.log('  - orderId:', contractData.orderId);
      console.log('  - cccd:', contractData.cccd);
      console.log('  - paymentMethod:', contractData.paymentMethod);
      console.log('📤 Full Request body:', JSON.stringify(contractData, null, 2));
      
      const response = await saleService.createSaleContract(contractData);

      if (response.success) {
        console.log('✅ Contract created successfully!');
        console.log('📦 Response data:', response.data);
        
        // Extract contract ID from response (field name may vary)
        const responseData = response.data || {};
        const contractIdValue = 'salesContractId' in responseData 
          ? responseData.salesContractId 
          : ('contractId' in responseData ? responseData.contractId : 'N/A');
        
        setShowCreateContractModal(false);
        setSelectedOrderForContract(null);
        // Refresh orders list
        await fetchOrders();
        
        alert(`✅ Hợp đồng đã được tạo thành công!\n\n📋 Hợp đồng ID: ${contractIdValue}\n• Order ID: ${contractData.orderId}\n• User ID: ${contractData.userId}\n\n💡 Thông tin khách hàng đã được tự động lấy từ database dựa trên User ID`);
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

  // Open create payment modal for approved orders
  const handleOpenCreatePaymentModal = (order: Order) => {
    console.log('💳 Opening payment creation modal for order:', order.orderId);
    setSelectedOrderForPayment(order);
    setPaymentForm({
      paymentId: 0,
      orderId: order.orderId,
      paymentDate: new Date().toISOString().slice(0, 16),
      amount: order.finalPrice || order.totalAmount || 0,
      method: '',
      status: 'PENDING'
    });
    setShowCreatePaymentModal(true);
  };

  // Create payment
  const handleCreatePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreatingPayment(true);

    try {
      const paymentData: CreatePaymentRequest = {
        paymentId: 0, // Will be set by backend
        orderId: paymentForm.orderId,
        paymentDate: new Date(paymentForm.paymentDate).toISOString(),
        amount: Number(paymentForm.amount) || 0,
        method: paymentForm.method,
        status: paymentForm.status
      };

      console.log('🔄 Creating payment with data:', paymentData);
      const response = await paymentService.createPayment(paymentData);

      if (response.success) {
        console.log('✅ Payment created successfully:', response);
        setShowCreatePaymentModal(false);
        setSelectedOrderForPayment(null);
        // Reset form
        setPaymentForm({
          paymentId: 0,
          orderId: 0,
          paymentDate: new Date().toISOString().slice(0, 16),
          amount: 0,
          method: '',
          status: 'PENDING'
        });
        // Refresh orders list
        await fetchOrders();
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

  // Open create delivery modal
  const handleOpenCreateDeliveryModal = (order: Order) => {
    console.log('🚚 Opening delivery creation modal for order:', order.orderId);
    setSelectedOrderForDelivery(order);
    setDeliveryForm({
      deliveryId: 0,
      userId: order.userId,
      orderId: order.orderId,
      vehicleId: order.vehicleId,
      deliveryDate: new Date().toISOString().slice(0, 16),
      deliveryStatus: 'PENDING',
      notes: ''
    });
    setShowCreateDeliveryModal(true);
  };

  // Create delivery
  const handleCreateDelivery = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreatingDelivery(true);

    try {
      const deliveryData: CreateDeliveryRequest = {
        deliveryId: 0, // Will be set by backend
        userId: deliveryForm.userId,
        orderId: deliveryForm.orderId,
        vehicleId: deliveryForm.vehicleId,
        deliveryDate: new Date(deliveryForm.deliveryDate).toISOString(),
        deliveryStatus: deliveryForm.deliveryStatus,
        notes: deliveryForm.notes || ''
      };

      console.log('🔄 Creating delivery with data:', deliveryData);
      const response = await deliveryService.createDelivery(deliveryData);

      console.log('✅ Delivery created successfully:', response);
      setShowCreateDeliveryModal(false);
      setSelectedOrderForDelivery(null);
      // Reset form
      setDeliveryForm({
        deliveryId: 0,
        userId: 0,
        orderId: 0,
        vehicleId: 0,
        deliveryDate: new Date().toISOString().slice(0, 16),
        deliveryStatus: 'PENDING',
        notes: ''
      });
      // Refresh orders list
      await fetchOrders();
      alert('✅ Vận chuyển đã được tạo thành công!');
    } catch (error) {
      console.error('❌ Error creating delivery:', error);
      alert(`Lỗi khi tạo vận chuyển: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setCreatingDelivery(false);
    }
  };

  // Open create dealer order modal
  const handleOpenCreateDealerOrderModal = (order: Order) => {
    console.log('📦 Opening dealer order creation modal for order:', order.orderId);
    setSelectedOrderForDealerOrder(order);
    setDealerOrderForm({
      dealerOrderId: 0,
      userId: order.userId,
      orderId: order.orderId,
      vehicleId: order.vehicleId,
      quantity: 1, // User will input
      color: order.color || '',
      orderDate: new Date().toISOString().slice(0, 16),
      status: 'PENDING',
      paymentStatus: 'UNPAID',
      totalAmount: order.finalPrice || order.totalAmount || 0
    });
    setShowCreateDealerOrderModal(true);
  };

  // Create dealer order
  const handleCreateDealerOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreatingDealerOrder(true);

    try {
      const dealerOrderData = {
        userId: dealerOrderForm.userId,
        orderId: dealerOrderForm.orderId,
        vehicleId: dealerOrderForm.vehicleId,
        quantity: Number(dealerOrderForm.quantity) || 1,
        color: dealerOrderForm.color || '',
        orderDate: new Date(dealerOrderForm.orderDate).toISOString(),
        status: dealerOrderForm.status,
        paymentStatus: dealerOrderForm.paymentStatus,
        totalAmount: Number(dealerOrderForm.totalAmount) || 0
      };

      console.log('🔄 Creating dealer order with data:', dealerOrderData);
      const response = await dealerOrderService.createDealerOrder(dealerOrderData);

      console.log('✅ Dealer order created successfully:', response);
      setShowCreateDealerOrderModal(false);
      setSelectedOrderForDealerOrder(null);
      // Reset form
      setDealerOrderForm({
        dealerOrderId: 0,
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
      // Refresh orders list
      await fetchOrders();
      alert('✅ Đơn hàng đại lý đã được tạo thành công!');
    } catch (error) {
      console.error('❌ Error creating dealer order:', error);
      alert(`Lỗi khi tạo đơn hàng đại lý: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setCreatingDealerOrder(false);
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
      case 'approved':
        return 'bg-green-100 text-green-800';
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
      case 'approved':
        return 'Đã phê duyệt';
      case 'CANCELLED':
        return 'Đã hủy';
      default:
        return status;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
      {/* Header Section */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-8 mb-6 border border-blue-200">
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
              <div className="text-sm text-gray-600">Đã duyệt</div>
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
            {/* <button
              onClick={handleOpenCreateModal}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-6 py-3 rounded-xl font-medium flex items-center space-x-2 shadow-lg transition-all duration-200 transform hover:scale-105"
            >
              <Plus className="h-5 w-5" />
              <span>Tạo đơn hàng</span>
            </button> */}
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
                              <p className="text-xs text-gray-600">Giá cuối</p>
                              <p className="font-semibold text-gray-900">{formatPrice(order.finalPrice || order.totalAmount || 0)}</p>
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
                        
                        {/* Color & Promotion Info */}
                        {(order.color || order.promotionCode) && (
                          <div className="mt-3 flex items-center space-x-2">
                            {order.color && (
                              <div className="inline-flex items-center space-x-2 px-3 py-1 bg-purple-50 rounded-lg border border-purple-200">
                                <svg className="h-4 w-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                                </svg>
                                <span className="text-xs font-semibold text-purple-700">{order.color}</span>
                      </div>
                            )}
                            {order.promotionCode && (
                              <div className="inline-flex items-center space-x-2 px-3 py-1 bg-amber-50 rounded-lg border border-amber-200">
                                <svg className="h-4 w-4 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
                                </svg>
                                <span className="text-xs font-bold text-amber-700 uppercase">{order.promotionCode}</span>
                              </div>
                            )}
                          </div>
                        )}
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
                    {order.status === 'approved' && (
                      <>
                      <button
                        onClick={() => handleOpenCreateContractModal(order)}
                        className="p-3 text-purple-600 hover:text-purple-800 hover:bg-purple-100 rounded-xl transition-all duration-200"
                        title="Tạo hợp đồng"
                      >
                        <FileText className="h-5 w-5" />
                      </button>
                        <button
                          onClick={() => handleOpenCreatePaymentModal(order)}
                          className="p-3 text-emerald-600 hover:text-emerald-800 hover:bg-emerald-100 rounded-xl transition-all duration-200"
                          title="Tạo thanh toán"
                        >
                          <CreditCard className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => handleOpenCreateDealerOrderModal(order)}
                          className="p-3 text-amber-600 hover:text-amber-800 hover:bg-amber-100 rounded-xl transition-all duration-200"
                          title="Tạo đơn đại lý"
                        >
                          <ShoppingBag className="h-5 w-5" />
                        </button>
                      </>
                    )}
                    {order.status === 'COMPLETED' && (
                      <button
                        onClick={() => handleOpenCreateDeliveryModal(order)}
                        className="p-3 text-blue-600 hover:text-blue-800 hover:bg-blue-100 rounded-xl transition-all duration-200"
                        title="Tạo vận chuyển"
                      >
                        <Truck className="h-5 w-5" />
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

                    {selectedOrder.color && (
                      <div className="flex items-center space-x-3 p-3 bg-purple-50 rounded-lg">
                        <svg className="h-5 w-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                        </svg>
                        <div>
                          <p className="text-xs text-gray-600">Màu xe</p>
                          <p className="font-semibold text-gray-900">{selectedOrder.color}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Price Information */}
              <div className="mt-6">
                <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2 mb-4">Thông tin giá</h3>
                
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6 border border-green-200">
                  <div className="space-y-4">
                    {selectedOrder.quotationPrice && selectedOrder.quotationPrice > 0 && (
                  <div className="flex justify-between items-center">
                        <span className="text-gray-600">Giá báo giá:</span>
                        <span className="font-semibold text-lg">{formatPrice(selectedOrder.quotationPrice)}</span>
                  </div>
                    )}
                    
                    {/* Promotion Information */}
                    {(selectedOrder.promotionCode || selectedOrder.promotionOptionName) && (
                      <div className="border-t border-green-200 pt-4 pb-4 space-y-3">
                        <h4 className="text-sm font-semibold text-gray-700 flex items-center space-x-2">
                          <svg className="h-4 w-4 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
                          </svg>
                          <span>Thông tin khuyến mãi</span>
                        </h4>
                        
                        <div className="bg-white bg-opacity-60 rounded-lg p-3 space-y-2">
                          {selectedOrder.promotionCode && (
                            <div className="flex justify-between items-center">
                              <span className="text-sm text-gray-600">Mã khuyến mãi:</span>
                              <span className="font-semibold text-amber-700 uppercase">
                                {selectedOrder.promotionCode}
                              </span>
                </div>
                          )}
                          
                          {selectedOrder.promotionOptionName && (
                            <div className="flex justify-between items-center">
                              <span className="text-sm text-gray-600">Tên khuyến mãi:</span>
                              <span className="font-semibold text-gray-900">
                                {selectedOrder.promotionOptionName}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                    
                    <div className="border-t border-green-200 pt-4">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-900 font-bold text-xl">Giá cuối cùng:</span>
                        <span className="font-bold text-green-600 text-2xl">{formatPrice(selectedOrder.finalPrice || selectedOrder.totalAmount || 0)}</span>
                      </div>
                    </div>
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
                  
                  {selectedOrder.status === 'approved' && (
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

                {/* Row 3: Color, Quotation Price, Final Price */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700">
                      <svg className="h-4 w-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                      </svg>
                      <span>Màu xe *</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={createForm.color}
                      onChange={(e) => setCreateForm({...createForm, color: e.target.value})}
                      className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:border-purple-500 focus:ring-2 focus:ring-purple-100 transition-all duration-200 bg-gray-50 focus:bg-white"
                      placeholder="Nhập màu xe"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700">
                      <DollarSign className="h-4 w-4 text-green-600" />
                      <span>Giá báo giá *</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={formInputs.quotationPrice}
                      onChange={(e) => setFormInputs({...formInputs, quotationPrice: e.target.value})}
                      className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:border-green-500 focus:ring-2 focus:ring-green-100 transition-all duration-200 bg-gray-50 focus:bg-white"
                      placeholder="Nhập giá báo giá"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700">
                      <DollarSign className="h-4 w-4 text-indigo-600" />
                      <span>Giá cuối cùng *</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={formInputs.finalPrice}
                      onChange={(e) => setFormInputs({...formInputs, finalPrice: e.target.value})}
                      className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all duration-200 bg-gray-50 focus:bg-white"
                      placeholder="Nhập giá cuối cùng"
                    />
                  </div>
                </div>

                {/* Row 4: Delivery Address */}
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

                {/* Row 5: Promotion Code & Option Name */}
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
                    <option value="PENDING">⏳ Chờ duyệt</option>
                    <option value="approved">✅ Đã phê duyệt</option>
                    <option value="CANCELLED">❌ Đã hủy</option>
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
              <form id="edit-order-form" onSubmit={handleUpdateOrder} className="space-y-6">
                {/* Info Banner */}
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                  <div className="flex items-start space-x-3">
                    <svg className="h-5 w-5 text-blue-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-blue-900">Lưu ý:</p>
                      <p className="text-sm text-blue-700 mt-1">
                        Chỉ có thể chỉnh sửa <strong>trạng thái</strong> của đơn hàng. Các thông tin khác không thể thay đổi.
                      </p>
                  </div>
                  </div>
                </div>

                {/* Order Summary - Read-only */}
                <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-5 border border-gray-200">
                  <h3 className="text-sm font-semibold text-gray-700 mb-4 flex items-center space-x-2">
                    <svg className="h-4 w-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <span>Thông tin đơn hàng</span>
                  </h3>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex justify-between items-center p-3 bg-white rounded-lg">
                      <span className="text-gray-600">ID Đơn hàng:</span>
                      <span className="font-semibold text-gray-900">#{editForm.orderId}</span>
                  </div>
                    <div className="flex justify-between items-center p-3 bg-white rounded-lg">
                      <span className="text-gray-600">ID Báo giá:</span>
                      <span className="font-semibold text-gray-900">#{editForm.quotationId}</span>
                  </div>
                    <div className="flex justify-between items-center p-3 bg-white rounded-lg">
                      <span className="text-gray-600">ID Khách hàng:</span>
                      <span className="font-semibold text-gray-900">#{editForm.userId}</span>
                </div>
                    <div className="flex justify-between items-center p-3 bg-white rounded-lg">
                      <span className="text-gray-600">ID Xe:</span>
                      <span className="font-semibold text-gray-900">#{editForm.vehicleId}</span>
                </div>
                    {editForm.color && (
                      <div className="flex justify-between items-center p-3 bg-white rounded-lg">
                        <span className="text-gray-600">Màu xe:</span>
                        <span className="font-semibold text-purple-700">{editForm.color}</span>
                  </div>
                    )}
                    <div className="flex justify-between items-center p-3 bg-white rounded-lg">
                      <span className="text-gray-600">Giá cuối:</span>
                      <span className="font-semibold text-green-700">{formatPrice(editForm.finalPrice)}</span>
                    </div>
                  </div>
                </div>

                {/* Status Field - Editable */}
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
                    className="w-full border-2 border-green-300 rounded-xl px-4 py-3 focus:border-green-500 focus:ring-2 focus:ring-green-100 transition-all duration-200 bg-white appearance-none text-base font-medium"
                  >
                    <option value="PENDING">⏳ Chờ duyệt</option>
                    <option value="approved">✅ Đã phê duyệt</option>
                    <option value="CANCELLED">❌ Đã hủy</option>
                  </select>
                  <p className="text-xs text-gray-500 mt-1">
                    Chọn trạng thái mới cho đơn hàng này
                  </p>
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
                <p><strong>Giá cuối:</strong> {formatPrice(orderToDelete.finalPrice || orderToDelete.totalAmount || 0)}</p>
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
              {/* Order Info Banner */}
              <div className="mb-6 bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-xl p-4">
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                      <FileText className="h-5 w-5 text-purple-600" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-sm font-bold text-purple-900">📋 Thông tin đơn hàng</h4>
                      {loadingUserInfo && (
                        <div className="flex items-center space-x-2 text-xs text-purple-600">
                          <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-purple-600"></div>
                          <span>Đang tải thông tin user...</span>
                        </div>
                      )}
                    </div>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div className="flex items-center space-x-2">
                        <span className="text-purple-600 font-semibold">Order ID:</span>
                        <span className="bg-purple-100 text-purple-800 px-3 py-1 rounded-lg font-mono font-bold">
                          #{selectedOrderForContract.orderId}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-purple-600 font-semibold">User ID:</span>
                        <span className="bg-pink-100 text-pink-800 px-3 py-1 rounded-lg font-mono font-bold">
                          #{selectedOrderForContract.userId}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-purple-600 font-semibold">Vehicle ID:</span>
                        <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-lg font-mono">
                          #{selectedOrderForContract.vehicleId}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-purple-600 font-semibold">Giá cuối:</span>
                        <span className="bg-green-100 text-green-800 px-3 py-1 rounded-lg font-mono font-bold">
                          {formatPrice(selectedOrderForContract.finalPrice || selectedOrderForContract.totalAmount || 0)} VNĐ
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Backend Auto-fill Info Banner */}
              {/* <div className="mb-4 bg-blue-50 border border-blue-200 rounded-xl p-4">
                <div className="flex items-start space-x-3">
                  <svg className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-blue-900 mb-1">💡 Thông tin tự động</p>
                    <p className="text-sm text-blue-700">
                      Thông tin khách hàng (Tên, SĐT, Email, Địa chỉ) sẽ được <strong>tự động lấy từ database</strong> dựa trên User ID #{selectedOrderForContract.userId}. Bạn chỉ cần điền CCCD và các thông tin hợp đồng khác.
                    </p>
                  </div>
                </div>
              </div> */}

              <form id="create-contract-form" onSubmit={handleCreateContract} className="space-y-6">
                {/* Row 1: Contract Date */}
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

                {/* Row 3: Customer Information - Auto-filled by backend */}
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-4">
                  <div className="flex items-start space-x-3">
                    <svg className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-green-900 mb-1">✅ Thông tin khách hàng </p>
                      <div className="text-sm text-green-700 space-y-1">
                        <p>• <strong>Tên khách hàng:</strong> {contractForm.customerName || 'Đang tải...'}</p>
                        <p>• <strong>Số điện thoại:</strong> {contractForm.phone || 'Đang tải...'}</p>
                        <p>• <strong>Email:</strong> {contractForm.email || 'Đang tải...'}</p>
                        <p>• <strong>Địa chỉ:</strong> {contractForm.address || 'Đang tải...'}</p>
                      </div>
                      
                    </div>
                  </div>
                </div>

                {/* Row 4: Payment Method */}
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

      {/* Create Payment Modal */}
      {showCreatePaymentModal && selectedOrderForPayment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-[9999]">
          <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl transform transition-all max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="bg-gradient-to-r from-emerald-500 to-green-600 text-white p-6 rounded-t-2xl sticky top-0 z-10">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="bg-white/20 p-3 rounded-xl backdrop-blur-sm">
                    <CreditCard className="h-6 w-6" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">Tạo thanh toán</h2>
                    <p className="text-emerald-100 text-sm mt-1">Đơn hàng #{selectedOrderForPayment.orderId}</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowCreatePaymentModal(false)}
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
                {/* Order ID (Read-only) */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    <FileText className="inline h-4 w-4 mr-2 text-emerald-600" />
                    Order ID
                  </label>
                  <input
                    type="number"
                    value={paymentForm.orderId}
                    readOnly
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl bg-gray-100 text-gray-600 cursor-not-allowed"
                  />
                </div>

                {/* Amount */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    <DollarSign className="inline h-4 w-4 mr-2 text-green-600" />
                    Số tiền
                  </label>
                  <input
                    type="number"
                    required
                    value={paymentForm.amount === 0 ? '' : paymentForm.amount}
                    onChange={(e) => setPaymentForm({ ...paymentForm, amount: Number(e.target.value) || 0 })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    placeholder="Nhập số tiền"
                  />
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
                    value={paymentForm.paymentDate}
                    onChange={(e) => setPaymentForm({ ...paymentForm, paymentDate: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200"
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
                    value={paymentForm.method}
                    onChange={(e) => setPaymentForm({ ...paymentForm, method: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200 bg-white"
                  >
                    <option value="">Chọn phương thức</option>
                    <option value="CREDIT_CARD">Thẻ tín dụng</option>
                    <option value="BANK_TRANSFER">Chuyển khoản</option>
                    <option value="CASH">Tiền mặt</option>
                    <option value="E_WALLET">Ví điện tử</option>
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
                    value={paymentForm.status}
                    onChange={(e) => setPaymentForm({ ...paymentForm, status: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200 bg-white"
                  >
                    <option value="PENDING">Chờ xử lý</option>
                    <option value="COMPLETED">Hoàn thành</option>
                    <option value="FAILED">Thất bại</option>
                    <option value="CANCELLED">Đã hủy</option>
                  </select>
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-end space-x-4 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setShowCreatePaymentModal(false)}
                  className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-all duration-200"
                  disabled={creatingPayment}
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={creatingPayment}
                  className="bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white px-8 py-3 rounded-xl font-medium shadow-lg transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                >
                  {creatingPayment ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      <span>Đang tạo...</span>
                    </>
                  ) : (
                    <>
                      <CreditCard className="h-5 w-5" />
                      <span>Tạo thanh toán</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Create Delivery Modal */}
      {showCreateDeliveryModal && selectedOrderForDelivery && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-[9999]">
          <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl transform transition-all max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white p-6 rounded-t-2xl sticky top-0 z-10">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="bg-white/20 p-3 rounded-xl backdrop-blur-sm">
                    <Truck className="h-6 w-6" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">Tạo vận chuyển</h2>
                    <p className="text-blue-100 text-sm mt-1">Đơn hàng #{selectedOrderForDelivery.orderId}</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowCreateDeliveryModal(false)}
                  className="text-white hover:bg-white/20 p-2 rounded-lg transition-colors"
                  disabled={creatingDelivery}
                >
                  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleCreateDelivery} className="p-6 space-y-6">
              {/* Info Banner */}
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                <div className="flex items-start space-x-3">
                  <svg className="h-5 w-5 text-blue-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-blue-900 mb-1">Thông tin đơn hàng đại lý:</p>
                    <div className="text-sm text-blue-700 space-y-1">
                      <p>• Mã đơn đại lý: <strong>#{selectedOrderForDelivery.orderId}</strong></p>
                      <p>• User ID: <strong>#{selectedOrderForDelivery.userId}</strong></p>
                      <p>• Vehicle ID: <strong>#{selectedOrderForDelivery.vehicleId}</strong> (tự động điền)</p>
                      <p>• Màu: <strong>{selectedOrderForDelivery.color || 'Đỏ'}</strong></p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* User ID (Read-only) */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    <User className="inline h-4 w-4 mr-2 text-blue-600" />
                    User ID
                  </label>
                  <input
                    type="number"
                    value={deliveryForm.userId}
                    readOnly
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl bg-gray-100 text-gray-600 cursor-not-allowed"
                  />
                </div>

                {/* Order ID (Read-only) */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    <FileText className="inline h-4 w-4 mr-2 text-blue-600" />
                    Order ID
                  </label>
                  <input
                    type="number"
                    value={deliveryForm.orderId}
                    readOnly
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl bg-gray-100 text-gray-600 cursor-not-allowed"
                  />
                </div>

                {/* Vehicle ID (Read-only) */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    <Car className="inline h-4 w-4 mr-2 text-blue-600" />
                    Vehicle ID
                  </label>
                  <input
                    type="number"
                    value={deliveryForm.vehicleId}
                    readOnly
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl bg-gray-100 text-gray-600 cursor-not-allowed"
                  />
                </div>

                {/* Delivery Date */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    <Calendar className="inline h-4 w-4 mr-2 text-indigo-600" />
                    Ngày vận chuyển
                  </label>
                  <input
                    type="datetime-local"
                    required
                    value={deliveryForm.deliveryDate}
                    onChange={(e) => setDeliveryForm({ ...deliveryForm, deliveryDate: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                  />
                </div>

                {/* Delivery Status */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    <CheckCircle className="inline h-4 w-4 mr-2 text-green-600" />
                    Trạng thái vận chuyển
                  </label>
                  <select
                    required
                    value={deliveryForm.deliveryStatus}
                    onChange={(e) => setDeliveryForm({ ...deliveryForm, deliveryStatus: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white"
                  >
                    <option value="PENDING">Chờ xử lý</option>
                    <option value="IN_TRANSIT">Đang vận chuyển</option>
                    <option value="DELIVERED">Đã giao</option>
                    <option value="CANCELLED">Đã hủy</option>
                  </select>
                </div>

                {/* Notes */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    <FileText className="inline h-4 w-4 mr-2 text-gray-600" />
                    Ghi chú
                  </label>
                  <textarea
                    value={deliveryForm.notes}
                    onChange={(e) => setDeliveryForm({ ...deliveryForm, notes: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                    placeholder="Nhập ghi chú (không bắt buộc)"
                    rows={3}
                  />
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-end space-x-4 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setShowCreateDeliveryModal(false)}
                  className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-all duration-200"
                  disabled={creatingDelivery}
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={creatingDelivery}
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-8 py-3 rounded-xl font-medium shadow-lg transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                >
                  {creatingDelivery ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      <span>Đang tạo...</span>
                    </>
                  ) : (
                    <>
                      <Truck className="h-5 w-5" />
                      <span>Tạo vận chuyển</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Create Dealer Order Modal */}
      {showCreateDealerOrderModal && selectedOrderForDealerOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-[9999]">
          <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl transform transition-all max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="bg-gradient-to-r from-amber-500 to-orange-600 text-white p-6 rounded-t-2xl sticky top-0 z-10">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="bg-white/20 p-3 rounded-xl backdrop-blur-sm">
                    <ShoppingBag className="h-6 w-6" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">Tạo đơn đại lý</h2>
                    <p className="text-amber-100 text-sm mt-1">Đơn hàng #{selectedOrderForDealerOrder.orderId}</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowCreateDealerOrderModal(false)}
                  className="text-white hover:bg-white/20 p-2 rounded-lg transition-colors"
                  disabled={creatingDealerOrder}
                >
                  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleCreateDealerOrder} className="p-6 space-y-6">
              {/* Info Banner */}
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                <div className="flex items-start space-x-3">
                  <svg className="h-5 w-5 text-blue-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-blue-900 mb-1">Thông tin đơn hàng gốc</p>
                    <div className="text-sm text-blue-700 space-y-1">
                      <p>• Order ID: <strong>#{selectedOrderForDealerOrder.orderId}</strong></p>
                      <p>• User ID: <strong>#{selectedOrderForDealerOrder.userId}</strong></p>
                      <p>• Vehicle ID: <strong>#{selectedOrderForDealerOrder.vehicleId}</strong></p>
                      {selectedOrderForDealerOrder.color && <p>• Màu: <strong>{selectedOrderForDealerOrder.color}</strong></p>}
                      <p>• Tổng tiền: <strong>{formatPrice(selectedOrderForDealerOrder.finalPrice || selectedOrderForDealerOrder.totalAmount || 0)}</strong></p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* User ID (Read-only) */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    <User className="inline h-4 w-4 mr-2 text-amber-600" />
                    User ID
                  </label>
                  <input
                    type="number"
                    value={dealerOrderForm.userId}
                    readOnly
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl bg-gray-100 text-gray-600 cursor-not-allowed"
                  />
                </div>

                {/* Order ID (Read-only) */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    <ShoppingBag className="inline h-4 w-4 mr-2 text-amber-600" />
                    Order ID
                  </label>
                  <input
                    type="number"
                    value={dealerOrderForm.orderId}
                    readOnly
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl bg-gray-100 text-gray-600 cursor-not-allowed"
                  />
                </div>

                {/* Vehicle ID (Read-only) */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    <Car className="inline h-4 w-4 mr-2 text-amber-600" />
                    Vehicle ID
                  </label>
                  <input
                    type="number"
                    value={dealerOrderForm.vehicleId}
                    readOnly
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl bg-gray-100 text-gray-600 cursor-not-allowed"
                  />
                </div>

                {/* Quantity */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    <Package className="inline h-4 w-4 mr-2 text-orange-600" />
                    Số lượng *
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={dealerOrderForm.quantity}
                    onChange={(e) => setDealerOrderForm({ ...dealerOrderForm, quantity: Number(e.target.value) || 1 })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all duration-200 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    placeholder="Nhập số lượng"
                  />
                </div>

                {/* Color */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    <svg className="inline h-4 w-4 mr-2 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                    </svg>
                    Màu xe
                  </label>
                  <input
                    type="text"
                    value={dealerOrderForm.color}
                    onChange={(e) => setDealerOrderForm({ ...dealerOrderForm, color: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all duration-200"
                    placeholder="Nhập màu xe"
                  />
                </div>

                {/* Total Amount */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    <DollarSign className="inline h-4 w-4 mr-2 text-green-600" />
                    Tổng tiền *
                  </label>
                  <input
                    type="number"
                    required
                    value={dealerOrderForm.totalAmount === 0 ? '' : dealerOrderForm.totalAmount}
                    onChange={(e) => setDealerOrderForm({ ...dealerOrderForm, totalAmount: Number(e.target.value) || 0 })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all duration-200 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    placeholder="Nhập tổng tiền"
                  />
                </div>

                {/* Order Date */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    <Calendar className="inline h-4 w-4 mr-2 text-indigo-600" />
                    Ngày đặt hàng *
                  </label>
                  <input
                    type="datetime-local"
                    required
                    value={dealerOrderForm.orderDate}
                    onChange={(e) => setDealerOrderForm({ ...dealerOrderForm, orderDate: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all duration-200"
                  />
                </div>

                {/* Status */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    <CheckCircle className="inline h-4 w-4 mr-2 text-blue-600" />
                    Trạng thái đơn hàng
                    {!isStaffEVM && (
                      <span className="ml-2 text-xs text-red-600 font-normal">
                        (Chỉ Staff EVM mới được chọn)
                      </span>
                    )}
                  </label>
                  <select
                    required
                    value={dealerOrderForm.status}
                    onChange={(e) => setDealerOrderForm({ ...dealerOrderForm, status: e.target.value })}
                    disabled={!isStaffEVM}
                    className={`w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all duration-200 ${
                      !isStaffEVM ? 'bg-gray-100 cursor-not-allowed opacity-60' : 'bg-white'
                    }`}
                  >
                    <option value="PENDING">⏳ Chờ xử lý</option>
                    <option value="approved">✅ Đã phê duyệt</option>
                    <option value="PROCESSING">🔄 Đang xử lý</option>
                    <option value="COMPLETED">✅ Hoàn thành</option>
                    <option value="CANCELLED">❌ Đã hủy</option>
                  </select>
                </div>

                {/* Payment Status */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    <CreditCard className="inline h-4 w-4 mr-2 text-green-600" />
                    Trạng thái thanh toán
                  </label>
                  <select
                    required
                    value={dealerOrderForm.paymentStatus}
                    onChange={(e) => setDealerOrderForm({ ...dealerOrderForm, paymentStatus: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all duration-200 bg-white"
                  >
                    <option value="UNPAID">Chưa thanh toán</option>
                    <option value="PAID">Đã thanh toán</option>
                    <option value="PARTIAL">Thanh toán một phần</option>
                    <option value="PENDING">Đang xử lý</option>
                  </select>
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-end space-x-4 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setShowCreateDealerOrderModal(false)}
                  className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-all duration-200"
                  disabled={creatingDealerOrder}
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={creatingDealerOrder}
                  className="bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white px-8 py-3 rounded-xl font-medium shadow-lg transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                >
                  {creatingDealerOrder ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      <span>Đang tạo...</span>
                    </>
                  ) : (
                    <>
                      <ShoppingBag className="h-5 w-5" />
                      <span>Tạo đơn đại lý</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      </div>
    </div>
  );
};
