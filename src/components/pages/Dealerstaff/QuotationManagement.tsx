import React, { useState, useEffect } from 'react';
import { Plus, Search, FileText, DollarSign, Calendar, User, Car, Edit, Eye, Trash2 } from 'lucide-react';
import { saleService, CreateQuotationRequest, Quotation, CreateOrderRequest, UpdateQuotationRequest, CreateSaleContractRequest } from '../../../services/saleService';

export const QuotationManagement: React.FC = () => {
  const [quotations, setQuotations] = useState<Quotation[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [creatingQuotation, setCreatingQuotation] = useState(false);
  const [creatingOrder, setCreatingOrder] = useState<number | null>(null);
  const [creatingSaleContract, setCreatingSaleContract] = useState<number | null>(null);
  const [showSaleContractModal, setShowSaleContractModal] = useState(false);
  const [selectedQuotationForContract, setSelectedQuotationForContract] = useState<Quotation | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedQuotation, setSelectedQuotation] = useState<Quotation | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingQuotation, setEditingQuotation] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [quotationToDelete, setQuotationToDelete] = useState<Quotation | null>(null);
  const [deletingQuotation, setDeletingQuotation] = useState(false);

  const [createForm, setCreateForm] = useState({
    quotationId: 0,
    userId: 1,
    vehicleId: 1,
    quotationDate: new Date().toISOString(),
    basePrice: 0,
    discount: 0,
    finalPrice: 0,
    status: 'PENDING'
  });

  const [editForm, setEditForm] = useState({
    quotationId: 0,
    userId: 1,
    vehicleId: 1,
    quotationDate: new Date().toISOString(),
    basePrice: 0,
    discount: 0,
    finalPrice: 0,
    status: 'PENDING'
  });

  const [saleContractForm, setSaleContractForm] = useState({
    quotationId: 0,
    userId: 1,
    vehicleId: 1,
    contractDate: new Date().toISOString(),
    totalAmount: 0,
    status: 'PENDING',
    customerName: '',
    customerPhone: '',
    customerEmail: '',
    deliveryAddress: '',
    paymentMethod: 'CASH',
    notes: ''
  });

  // Load quotations when component mounts
  useEffect(() => {
    fetchQuotations();
  }, []);

  // Fetch quotations from API
  const fetchQuotations = async () => {
    setLoading(true);
    setError(null);

    try {
      console.log('🔍 Fetching quotations from API...');
      const response = await saleService.getQuotations();
      console.log('📡 Quotations API Response:', response);

      if (response.success) {
        setQuotations(response.data || []);
        console.log('✅ Quotations loaded from API:', response.data?.length || 0);
        if (response.data && response.data.length === 0) {
          console.log('📝 API returned empty array - no quotations available');
        }
      } else {
        console.log('❌ API returned success=false, using empty data');
        setQuotations([]);
      }
    } catch (error) {
      console.error('Failed to fetch quotations:', error);
      setError(error instanceof Error ? error.message : 'Lỗi khi tải danh sách báo giá');
      setQuotations([]);
    } finally {
      setLoading(false);
    }
  };

  // Create quotation
  const handleCreateQuotation = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreatingQuotation(true);

    try {
      // Calculate final price
      const finalPrice = createForm.basePrice - createForm.discount;
      
      const quotationData: CreateQuotationRequest = {
        quotationId: 0, // Will be set by backend
        userId: createForm.userId,
        vehicleId: createForm.vehicleId,
        quotationDate: createForm.quotationDate,
        basePrice: createForm.basePrice,
        discount: createForm.discount,
        finalPrice: finalPrice,
        status: createForm.status
      };

      console.log('🔄 Creating quotation with data:', quotationData);
      const response = await saleService.createQuotation(quotationData);

      if (response.success) {
        console.log('✅ Quotation created successfully:', response);
        setShowCreateModal(false);
        setCreateForm({
          quotationId: 0,
          userId: 1,
          vehicleId: 1,
          quotationDate: new Date().toISOString(),
          basePrice: 0,
          discount: 0,
          finalPrice: 0,
          status: 'PENDING'
        });
        // Refresh quotations list
        await fetchQuotations();
        alert('✅ Báo giá đã được tạo thành công!');
      } else {
        console.error('❌ Failed to create quotation:', response.message);
        alert(`❌ Lỗi khi tạo báo giá: ${response.message}`);
      }
    } catch (error) {
      console.error('❌ Error creating quotation:', error);
      alert(`Lỗi khi tạo báo giá: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setCreatingQuotation(false);
    }
  };

  // Edit quotation
  const handleEditQuotation = (quotation: Quotation) => {
    console.log('🔄 Opening edit modal for quotation:', quotation.quotationId);
    setEditForm({
      quotationId: quotation.quotationId,
      userId: quotation.userId,
      vehicleId: quotation.vehicleId,
      quotationDate: quotation.quotationDate,
      basePrice: quotation.basePrice,
      discount: quotation.discount,
      finalPrice: quotation.finalPrice,
      status: quotation.status
    });
    setShowEditModal(true);
    console.log('✅ Edit modal state set to true');
  };

  // Update quotation
  const handleUpdateQuotation = async (e: React.FormEvent) => {
    e.preventDefault();
    setEditingQuotation(true);

    try {
      // Calculate final price
      const finalPrice = editForm.basePrice - editForm.discount;
      
      const quotationData: UpdateQuotationRequest = {
        quotationId: editForm.quotationId,
        userId: editForm.userId,
        vehicleId: editForm.vehicleId,
        quotationDate: editForm.quotationDate,
        basePrice: editForm.basePrice,
        discount: editForm.discount,
        finalPrice: finalPrice,
        status: editForm.status
      };

      console.log('🔄 Updating quotation with data:', quotationData);
      const response = await saleService.updateQuotation(editForm.quotationId, quotationData);

      if (response.success) {
        console.log('✅ Quotation updated successfully:', response);
        setShowEditModal(false);
        // Refresh quotations list
        await fetchQuotations();
        alert('✅ Báo giá đã được cập nhật thành công!');
      } else {
        console.error('❌ Failed to update quotation:', response.message);
        alert(`❌ Lỗi khi cập nhật báo giá: ${response.message}`);
      }
    } catch (error) {
      console.error('❌ Error updating quotation:', error);
      alert(`Lỗi khi cập nhật báo giá: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setEditingQuotation(false);
    }
  };

  // Delete quotation
  const handleDeleteQuotation = (quotation: Quotation) => {
    console.log('🗑️ Opening delete confirmation for quotation:', quotation.quotationId);
    
    // Check if quotation can be deleted (not used in any orders)
    // For now, we'll show a warning for approved quotations
    if (quotation.status === 'APPROVED') {
      const confirmed = window.confirm(
        `⚠️ Cảnh báo: Báo giá #${quotation.quotationId} đã được duyệt và có thể đã được sử dụng để tạo đơn hàng.\n\n` +
        `Nếu báo giá này đã có đơn hàng liên quan, việc xóa sẽ thất bại.\n\n` +
        `Bạn có muốn tiếp tục?`
      );
      
      if (!confirmed) {
        return;
      }
    }
    
    setQuotationToDelete(quotation);
    setShowDeleteModal(true);
  };

  // Confirm delete quotation
  const handleConfirmDelete = async () => {
    if (!quotationToDelete) return;
    
    setDeletingQuotation(true);
    try {
      console.log(`🗑️ Deleting quotation ${quotationToDelete.quotationId} via API...`);
      const response = await saleService.deleteQuotation(quotationToDelete.quotationId);
      
      if (response.success) {
        console.log('✅ Quotation deleted successfully');
        setShowDeleteModal(false);
        setQuotationToDelete(null);
        // Refresh quotations list
        await fetchQuotations();
        alert('✅ Báo giá đã được xóa thành công!');
      } else {
        console.error('❌ Delete returned success=false:', response.message);
        alert(`❌ Lỗi khi xóa báo giá: ${response.message}`);
      }
    } catch (error) {
      console.error('❌ Error deleting quotation:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      // Show more user-friendly error message
      if (errorMessage.includes('đã được sử dụng để tạo đơn hàng')) {
        alert(`❌ ${errorMessage}\n\n💡 Gợi ý: Bạn có thể:\n• Xóa đơn hàng liên quan trước\n• Hoặc liên hệ admin để được hỗ trợ`);
      } else {
        alert(`❌ Lỗi khi xóa báo giá: ${errorMessage}`);
      }
    } finally {
      setDeletingQuotation(false);
    }
  };

  // View quotation details
  const handleViewQuotation = async (quotation: Quotation) => {
    setLoadingDetail(true);
    setError(null);

    try {
      console.log(`🔍 Fetching quotation details for ID: ${quotation.quotationId}`);
      const response = await saleService.getQuotationById(quotation.quotationId);
      
      if (response.success && response.data) {
        setSelectedQuotation(response.data);
        setShowDetailModal(true);
        console.log('✅ Quotation details loaded successfully');
      } else {
        console.error('❌ Failed to load quotation details:', response.message);
        alert(`❌ Lỗi khi tải chi tiết báo giá: ${response.message || 'Không thể đọc dữ liệu từ API'}`);
      }
    } catch (error) {
      console.error('❌ Error loading quotation details:', error);
      alert(`Lỗi khi tải chi tiết báo giá: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoadingDetail(false);
    }
  };

  // Create order from approved quotation
  const handleCreateOrder = async (quotation: Quotation) => {
    if (quotation.status !== 'APPROVED') {
      alert('❌ Chỉ có thể tạo đơn hàng từ báo giá đã được chấp nhận!');
      return;
    }

    setCreatingOrder(quotation.quotationId);

    try {
      const orderData: CreateOrderRequest = {
        orderId: 0, // Will be set by backend
        quotationId: quotation.quotationId,
        userId: quotation.userId,
        vehicleId: quotation.vehicleId,
        orderDate: new Date().toISOString(),
        status: 'PENDING',
        totalAmount: quotation.finalPrice
      };

      console.log('🔄 Creating order from approved quotation:', orderData);
      const response = await saleService.createOrder(orderData);

      if (response.success || (response.message && response.message.includes('thành công'))) {
        console.log('✅ Order created successfully:', response);
        alert(`✅ Đơn hàng đã được tạo thành công từ báo giá #${quotation.quotationId}!\n📦 ${response.message}`);
        // Refresh quotations list
        await fetchQuotations();
      } else {
        console.error('❌ Failed to create order:', response.message);
        alert(`❌ Lỗi khi tạo đơn hàng: ${response.message}`);
      }
    } catch (error) {
      console.error('❌ Error creating order:', error);
      alert(`Lỗi khi tạo đơn hàng: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setCreatingOrder(null);
    }
  };

  // Open sale contract modal
  const handleOpenSaleContractModal = (quotation: Quotation) => {
    if (quotation.status !== 'APPROVED') {
      alert('❌ Chỉ có thể tạo hợp đồng bán hàng từ báo giá đã được chấp nhận!');
      return;
    }

    setSelectedQuotationForContract(quotation);
    setSaleContractForm({
      quotationId: quotation.quotationId,
      userId: quotation.userId,
      vehicleId: quotation.vehicleId,
      contractDate: new Date().toISOString(),
      totalAmount: quotation.finalPrice,
      status: 'PENDING',
      customerName: '',
      customerPhone: '',
      customerEmail: '',
      deliveryAddress: '',
      paymentMethod: 'CASH',
      notes: ''
    });
    setShowSaleContractModal(true);
  };

  // Create sale contract from form
  const handleCreateSaleContract = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedQuotationForContract) return;

    setCreatingSaleContract(selectedQuotationForContract.quotationId);

    try {
      const contractData: CreateSaleContractRequest = {
        quotationId: saleContractForm.quotationId,
        userId: saleContractForm.userId,
        vehicleId: saleContractForm.vehicleId,
        contractDate: saleContractForm.contractDate,
        totalAmount: saleContractForm.totalAmount,
        status: saleContractForm.status
      };

      console.log('🔄 Creating sale contract from form:', contractData);
      const response = await saleService.createSaleContract(contractData);

      if (response.success) {
        console.log('✅ Sale contract created successfully:', response);
        alert(`✅ Hợp đồng bán hàng đã được tạo thành công từ báo giá #${selectedQuotationForContract.quotationId}!\n📋 ${response.message}`);
        setShowSaleContractModal(false);
        setSelectedQuotationForContract(null);
        // Refresh quotations list
        await fetchQuotations();
      } else {
        console.error('❌ Failed to create sale contract:', response.message);
        alert(`❌ Lỗi khi tạo hợp đồng bán hàng: ${response.message}`);
      }
    } catch (error) {
      console.error('❌ Error creating sale contract:', error);
      alert(`Lỗi khi tạo hợp đồng bán hàng: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setCreatingSaleContract(null);
    }
  };

  // Filter quotations
  const filteredQuotations = quotations.filter(quotation =>
    quotation.status.toLowerCase().includes(searchTerm.toLowerCase()) ||
    quotation.quotationId.toString().includes(searchTerm)
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
      day: '2-digit'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      case 'APPROVED':
        return 'bg-green-100 text-green-800';
      case 'REJECTED':
        return 'bg-red-100 text-red-800';
      case 'SENT':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'Chờ duyệt';
      case 'APPROVED':
        return 'Đã duyệt';
      case 'REJECTED':
        return 'Từ chối';
      case 'SENT':
        return 'Đã gửi';
      default:
        return status;
    }
  };

  return (
    <div>
      {/* Header Section */}
      <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-8 mb-8 border border-purple-200">
        <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center space-y-4 lg:space-y-0">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center shadow-lg">
              <FileText className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-gray-900">Quản lý báo giá</h1>
              <p className="text-gray-600 mt-1">Tạo và quản lý báo giá cho khách hàng</p>
            </div>
          </div>
          <div className="flex items-center space-x-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{quotations.length}</div>
              <div className="text-sm text-gray-600">Tổng báo giá</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{quotations.filter(q => q.status === 'APPROVED').length}</div>
              <div className="text-sm text-gray-600">Đã duyệt</div>
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
              placeholder="Tìm kiếm báo giá..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200 bg-gray-50 focus:bg-white"
            />
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={fetchQuotations}
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
              onClick={() => setShowCreateModal(true)}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-6 py-3 rounded-xl font-medium flex items-center space-x-2 shadow-lg transition-all duration-200 transform hover:scale-105"
            >
              <Plus className="h-5 w-5" />
              <span>Tạo báo giá</span>
            </button>
          </div>
        </div>
      </div>

      {/* Loading Spinner */}
      {loading && (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
          <span className="ml-3 text-gray-600">Đang tải danh sách báo giá...</span>
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

      {/* Quotations List */}
      {!loading && filteredQuotations.length > 0 && (
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
          <div className="bg-gradient-to-r from-gray-50 to-slate-50 px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-900 flex items-center space-x-2">
              <FileText className="h-6 w-6 text-purple-600" />
              <span>Danh sách báo giá ({filteredQuotations.length})</span>
            </h2>
          </div>
          
          <div className="divide-y divide-gray-100">
            {filteredQuotations.map((quotation) => (
              <div key={quotation.quotationId} className="p-6 hover:bg-gradient-to-r hover:from-purple-50 hover:to-pink-50 transition-all duration-300">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-6">
                      <div className="flex-shrink-0">
                        <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center shadow-lg">
                          <DollarSign className="h-8 w-8 text-white" />
                        </div>
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-4 mb-3">
                          <h3 className="text-xl font-bold text-gray-900">
                            Báo giá #{quotation.quotationId}
                          </h3>
                          <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(quotation.status)}`}>
                            {getStatusText(quotation.status)}
                          </span>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                          <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
                            <Calendar className="h-5 w-5 text-blue-600" />
                            <div>
                              <p className="text-xs text-gray-600">Ngày tạo</p>
                              <p className="font-semibold text-gray-900">{formatDate(quotation.quotationDate)}</p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
                            <DollarSign className="h-5 w-5 text-green-600" />
                            <div>
                              <p className="text-xs text-gray-600">Giá cuối</p>
                              <p className="font-semibold text-gray-900">{formatPrice(quotation.finalPrice)}</p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-3 p-3 bg-purple-50 rounded-lg">
                            <User className="h-5 w-5 text-purple-600" />
                            <div>
                              <p className="text-xs text-gray-600">Khách hàng</p>
                              <p className="font-semibold text-gray-900">ID: {quotation.userId}</p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                            <Car className="h-5 w-5 text-gray-600" />
                            <div>
                              <p className="text-xs text-gray-600">Xe</p>
                              <p className="font-semibold text-gray-900">ID: {quotation.vehicleId}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2 ml-6">
                    <button
                      onClick={() => handleViewQuotation(quotation)}
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
                      onClick={() => handleEditQuotation(quotation)}
                      className="p-3 text-green-600 hover:text-green-800 hover:bg-green-100 rounded-xl transition-all duration-200"
                      title="Chỉnh sửa"
                    >
                      <Edit className="h-5 w-5" />
                    </button>
                    {quotation.status === 'APPROVED' && (
                      <>
                        <button
                          onClick={() => handleCreateOrder(quotation)}
                          disabled={creatingOrder === quotation.quotationId}
                          className="p-3 text-purple-600 hover:text-purple-800 hover:bg-purple-100 rounded-xl transition-all duration-200 disabled:opacity-50"
                          title="Tạo đơn hàng"
                        >
                          {creatingOrder === quotation.quotationId ? (
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-purple-600"></div>
                          ) : (
                            <FileText className="h-5 w-5" />
                          )}
                        </button>
                        <button
                          onClick={() => handleOpenSaleContractModal(quotation)}
                          className="p-3 text-orange-600 hover:text-orange-800 hover:bg-orange-100 rounded-xl transition-all duration-200"
                          title="Tạo hợp đồng bán hàng"
                        >
                          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                        </button>
                      </>
                    )}
                    <button
                      onClick={() => handleDeleteQuotation(quotation)}
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
      {!loading && filteredQuotations.length === 0 && quotations.length === 0 && (
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-12 text-center">
          <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <FileText className="h-12 w-12 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Chưa có báo giá nào</h3>
          <p className="text-gray-600">Hiện tại chưa có báo giá nào trong hệ thống.</p>
        </div>
      )}

      {/* Create Quotation Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl transform transition-all">
            {/* Header */}
            <div className="bg-gradient-to-r from-purple-500 to-pink-600 text-white p-6 rounded-t-2xl">
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-white bg-opacity-20 rounded-xl flex items-center justify-center">
                    <Plus className="h-6 w-6" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">Tạo báo giá mới</h2>
                    <p className="text-purple-100 text-sm">Tạo báo giá cho khách hàng</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="text-white hover:text-purple-200 transition-colors p-2 hover:bg-white hover:bg-opacity-10 rounded-lg"
                  disabled={creatingQuotation}
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-6">
              <form id="create-quotation-form" onSubmit={handleCreateQuotation} className="space-y-4">
                {/* Row 1: User ID & Vehicle ID */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700">
                      <User className="h-4 w-4 text-purple-600" />
                      <span>ID Khách hàng *</span>
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        required
                        value={createForm.userId}
                        onChange={(e) => setCreateForm({...createForm, userId: parseInt(e.target.value)})}
                        className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:border-purple-500 focus:ring-2 focus:ring-purple-100 transition-all duration-200 bg-gray-50 focus:bg-white"
                        placeholder="Nhập ID khách hàng"
                      />
                      <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                        <User className="h-5 w-5 text-gray-400" />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700">
                      <Car className="h-4 w-4 text-purple-600" />
                      <span>ID Xe *</span>
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        required
                        value={createForm.vehicleId}
                        onChange={(e) => setCreateForm({...createForm, vehicleId: parseInt(e.target.value)})}
                        className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:border-purple-500 focus:ring-2 focus:ring-purple-100 transition-all duration-200 bg-gray-50 focus:bg-white"
                        placeholder="Nhập ID xe"
                      />
                      <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                        <Car className="h-5 w-5 text-gray-400" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Row 2: Base Price & Discount */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700">
                      <DollarSign className="h-4 w-4 text-purple-600" />
                      <span>Giá gốc *</span>
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        required
                        value={createForm.basePrice}
                        onChange={(e) => setCreateForm({...createForm, basePrice: parseFloat(e.target.value)})}
                        className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:border-purple-500 focus:ring-2 focus:ring-purple-100 transition-all duration-200 bg-gray-50 focus:bg-white"
                        placeholder="Nhập giá gốc"
                      />
                      <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                        <DollarSign className="h-5 w-5 text-gray-400" />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700">
                      <div className="w-4 h-4 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"></div>
                      <span>Giảm giá</span>
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        value={createForm.discount}
                        onChange={(e) => setCreateForm({...createForm, discount: parseFloat(e.target.value)})}
                        className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:border-purple-500 focus:ring-2 focus:ring-purple-100 transition-all duration-200 bg-gray-50 focus:bg-white"
                        placeholder="Nhập số tiền giảm giá"
                      />
                      <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                        <span className="text-gray-400 text-sm">VND</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Row 3: Status */}
                <div className="space-y-2">
                  <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700">
                    <FileText className="h-4 w-4 text-purple-600" />
                    <span>Trạng thái *</span>
                  </label>
                  <div className="relative">
                    <select
                      required
                      value={createForm.status}
                      onChange={(e) => setCreateForm({...createForm, status: e.target.value})}
                      className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:border-purple-500 focus:ring-2 focus:ring-purple-100 transition-all duration-200 bg-gray-50 focus:bg-white appearance-none"
                    >
                      <option value="PENDING">Chờ duyệt</option>
                      <option value="APPROVED">Đã duyệt</option>
                      <option value="REJECTED">Từ chối</option>
                      <option value="SENT">Đã gửi</option>
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                      <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                </div>

                {/* Price Summary */}
                <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-4 border border-purple-200">
                  <h3 className="text-sm font-semibold text-gray-700 mb-2">Tóm tắt giá</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Giá gốc:</span>
                      <span className="font-semibold">{formatPrice(createForm.basePrice)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Giảm giá:</span>
                      <span className="font-semibold text-red-600">-{formatPrice(createForm.discount)}</span>
                    </div>
                    <div className="border-t pt-2 flex justify-between">
                      <span className="text-gray-900 font-bold">Tổng cộng:</span>
                      <span className="font-bold text-purple-600">{formatPrice(createForm.basePrice - createForm.discount)}</span>
                    </div>
                  </div>
                </div>
              </form>
            </div>

            {/* Footer */}
            <div className="bg-gray-50 px-6 py-4 rounded-b-2xl flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="px-6 py-3 border-2 border-gray-300 rounded-xl text-gray-700 hover:bg-white hover:border-gray-400 transition-all duration-200 font-medium"
                disabled={creatingQuotation}
              >
                Hủy
              </button>
              <button
                type="submit"
                form="create-quotation-form"
                className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 transition-all duration-200 font-medium shadow-lg"
                disabled={creatingQuotation}
              >
                {creatingQuotation && (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                )}
                <Plus className="h-4 w-4" />
                <span>{creatingQuotation ? 'Đang tạo...' : 'Tạo báo giá'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Quotation Detail Modal */}
      {showDetailModal && selectedQuotation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl transform transition-all">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-6 rounded-t-2xl">
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-white bg-opacity-20 rounded-xl flex items-center justify-center">
                    <FileText className="h-6 w-6" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">Chi tiết báo giá #{selectedQuotation.quotationId}</h2>
                    <p className="text-blue-100 text-sm">Thông tin chi tiết báo giá</p>
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
                        <span className="text-white font-bold text-sm">#{selectedQuotation.quotationId}</span>
                      </div>
                      <div>
                        <p className="text-xs text-gray-600">ID Báo giá</p>
                        <p className="font-semibold text-gray-900">{selectedQuotation.quotationId}</p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
                      <Calendar className="h-5 w-5 text-green-600" />
                      <div>
                        <p className="text-xs text-gray-600">Ngày tạo</p>
                        <p className="font-semibold text-gray-900">{formatDate(selectedQuotation.quotationDate)}</p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3 p-3 bg-purple-50 rounded-lg">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(selectedQuotation.status)}`}>
                        {getStatusText(selectedQuotation.status)}
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
                        <p className="font-semibold text-gray-900">{selectedQuotation.userId}</p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                      <Car className="h-5 w-5 text-gray-600" />
                      <div>
                        <p className="text-xs text-gray-600">ID Xe</p>
                        <p className="font-semibold text-gray-900">{selectedQuotation.vehicleId}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Price Information */}
              <div className="mt-6">
                <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2 mb-4">Thông tin giá</h3>
                
                <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-6 border border-purple-200">
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Giá gốc:</span>
                      <span className="font-semibold text-lg">{formatPrice(selectedQuotation.basePrice)}</span>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Giảm giá:</span>
                      <span className="font-semibold text-red-600 text-lg">-{formatPrice(selectedQuotation.discount)}</span>
                    </div>
                    
                    <div className="border-t border-purple-200 pt-4">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-900 font-bold text-xl">Tổng cộng:</span>
                        <span className="font-bold text-purple-600 text-2xl">{formatPrice(selectedQuotation.finalPrice)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="px-6 py-3 border-2 border-gray-300 rounded-xl text-gray-700 hover:bg-white hover:border-gray-400 transition-all duration-200 font-medium"
                >
                  Đóng
                </button>
                {selectedQuotation.status === 'APPROVED' && (
                  <div className="flex space-x-3">
                    <button
                      onClick={() => {
                        setShowDetailModal(false);
                        handleCreateOrder(selectedQuotation);
                      }}
                      disabled={creatingOrder === selectedQuotation.quotationId}
                      className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 transition-all duration-200 font-medium shadow-lg"
                    >
                      {creatingOrder === selectedQuotation.quotationId ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      ) : (
                        <FileText className="h-4 w-4" />
                      )}
                      <span>{creatingOrder === selectedQuotation.quotationId ? 'Đang tạo...' : 'Tạo đơn hàng'}</span>
                    </button>
                    <button
                      onClick={() => {
                        setShowDetailModal(false);
                        handleOpenSaleContractModal(selectedQuotation);
                      }}
                      className="px-6 py-3 bg-gradient-to-r from-orange-600 to-red-600 text-white rounded-xl hover:from-orange-700 hover:to-red-700 flex items-center space-x-2 transition-all duration-200 font-medium shadow-lg"
                    >
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <span>Tạo hợp đồng</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Quotation Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-[9999]">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl transform transition-all">
            {/* Header */}
            <div className="bg-gradient-to-r from-green-500 to-blue-600 text-white p-6 rounded-t-2xl">
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-white bg-opacity-20 rounded-xl flex items-center justify-center">
                    <Edit className="h-6 w-6" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">Chỉnh sửa báo giá</h2>
                    <p className="text-green-100 text-sm">Cập nhật thông tin báo giá #{editForm.quotationId}</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowEditModal(false)}
                  className="text-white hover:text-green-200 transition-colors p-2 hover:bg-white hover:bg-opacity-10 rounded-lg"
                  disabled={editingQuotation}
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-6">
              <form id="edit-quotation-form" onSubmit={handleUpdateQuotation} className="space-y-4">
                {/* Row 1: User ID & Vehicle ID */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700">
                      <User className="h-4 w-4 text-green-600" />
                      <span>ID Khách hàng *</span>
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        required
                        value={editForm.userId}
                        onChange={(e) => setEditForm({...editForm, userId: parseInt(e.target.value)})}
                        className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:border-green-500 focus:ring-2 focus:ring-green-100 transition-all duration-200 bg-gray-50 focus:bg-white"
                        placeholder="Nhập ID khách hàng"
                      />
                      <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                        <User className="h-5 w-5 text-gray-400" />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700">
                      <Car className="h-4 w-4 text-green-600" />
                      <span>ID Xe *</span>
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        required
                        value={editForm.vehicleId}
                        onChange={(e) => setEditForm({...editForm, vehicleId: parseInt(e.target.value)})}
                        className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:border-green-500 focus:ring-2 focus:ring-green-100 transition-all duration-200 bg-gray-50 focus:bg-white"
                        placeholder="Nhập ID xe"
                      />
                      <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                        <Car className="h-5 w-5 text-gray-400" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Row 2: Base Price & Discount */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700">
                      <DollarSign className="h-4 w-4 text-green-600" />
                      <span>Giá gốc *</span>
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        required
                        value={editForm.basePrice}
                        onChange={(e) => setEditForm({...editForm, basePrice: parseFloat(e.target.value)})}
                        className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:border-green-500 focus:ring-2 focus:ring-green-100 transition-all duration-200 bg-gray-50 focus:bg-white"
                        placeholder="Nhập giá gốc"
                      />
                      <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                        <DollarSign className="h-5 w-5 text-gray-400" />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700">
                      <div className="w-4 h-4 bg-gradient-to-r from-green-500 to-blue-500 rounded-full"></div>
                      <span>Giảm giá</span>
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        value={editForm.discount}
                        onChange={(e) => setEditForm({...editForm, discount: parseFloat(e.target.value)})}
                        className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:border-green-500 focus:ring-2 focus:ring-green-100 transition-all duration-200 bg-gray-50 focus:bg-white"
                        placeholder="Nhập số tiền giảm giá"
                      />
                      <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                        <span className="text-gray-400 text-sm">VND</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Row 3: Status */}
                <div className="space-y-2">
                  <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700">
                    <FileText className="h-4 w-4 text-green-600" />
                    <span>Trạng thái *</span>
                  </label>
                  <div className="relative">
                    <select
                      required
                      value={editForm.status}
                      onChange={(e) => setEditForm({...editForm, status: e.target.value})}
                      className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:border-green-500 focus:ring-2 focus:ring-green-100 transition-all duration-200 bg-gray-50 focus:bg-white appearance-none"
                    >
                      <option value="PENDING">Chờ duyệt</option>
                      <option value="APPROVED">Đã duyệt</option>
                      <option value="REJECTED">Từ chối</option>
                      <option value="SENT">Đã gửi</option>
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                      <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                </div>

                {/* Price Summary */}
                <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-xl p-4 border border-green-200">
                  <h3 className="text-sm font-semibold text-gray-700 mb-2">Tóm tắt giá</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Giá gốc:</span>
                      <span className="font-semibold">{formatPrice(editForm.basePrice)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Giảm giá:</span>
                      <span className="font-semibold text-red-600">-{formatPrice(editForm.discount)}</span>
                    </div>
                    <div className="border-t pt-2 flex justify-between">
                      <span className="text-gray-900 font-bold">Tổng cộng:</span>
                      <span className="font-bold text-green-600">{formatPrice(editForm.basePrice - editForm.discount)}</span>
                    </div>
                  </div>
                </div>
              </form>
            </div>

            {/* Footer */}
            <div className="bg-gray-50 px-6 py-4 rounded-b-2xl flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setShowEditModal(false)}
                className="px-6 py-3 border-2 border-gray-300 rounded-xl text-gray-700 hover:bg-white hover:border-gray-400 transition-all duration-200 font-medium"
                disabled={editingQuotation}
              >
                Hủy
              </button>
              <button
                type="submit"
                form="edit-quotation-form"
                className="px-6 py-3 bg-gradient-to-r from-green-600 to-blue-600 text-white rounded-xl hover:from-green-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 transition-all duration-200 font-medium shadow-lg"
                disabled={editingQuotation}
              >
                {editingQuotation && (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                )}
                <Edit className="h-4 w-4" />
                <span>{editingQuotation ? 'Đang cập nhật...' : 'Cập nhật báo giá'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && quotationToDelete && (
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
                    <p className="text-red-100 text-sm">Xóa báo giá #{quotationToDelete.quotationId}</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="text-white hover:text-red-200 transition-colors p-2 hover:bg-white hover:bg-opacity-10 rounded-lg"
                  disabled={deletingQuotation}
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
                  <Trash2 className="h-8 w-8 text-red-600" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Bạn có chắc chắn muốn xóa báo giá này?
                  </h3>
                  <p className="text-gray-600 text-sm">
                    Báo giá #{quotationToDelete.quotationId} sẽ bị xóa vĩnh viễn và không thể khôi phục.
                  </p>
                </div>
              </div>

              {/* Quotation Info */}
              <div className="bg-gray-50 rounded-xl p-4 mb-6">
                <h4 className="text-sm font-semibold text-gray-700 mb-3">Thông tin báo giá sẽ bị xóa:</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">ID Báo giá:</span>
                    <span className="font-semibold">#{quotationToDelete.quotationId}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Khách hàng:</span>
                    <span className="font-semibold">ID {quotationToDelete.userId}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Xe:</span>
                    <span className="font-semibold">ID {quotationToDelete.vehicleId}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Giá cuối:</span>
                    <span className="font-semibold text-red-600">{formatPrice(quotationToDelete.finalPrice)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Trạng thái:</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(quotationToDelete.status)}`}>
                      {getStatusText(quotationToDelete.status)}
                    </span>
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
                      <p>Hành động này không thể hoàn tác. Báo giá sẽ bị xóa vĩnh viễn khỏi hệ thống.</p>
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
                disabled={deletingQuotation}
              >
                Hủy
              </button>
              <button
                onClick={handleConfirmDelete}
                disabled={deletingQuotation}
                className="px-6 py-3 bg-gradient-to-r from-red-600 to-pink-600 text-white rounded-xl hover:from-red-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 transition-all duration-200 font-medium shadow-lg"
              >
                {deletingQuotation && (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                )}
                <Trash2 className="h-4 w-4" />
                <span>{deletingQuotation ? 'Đang xóa...' : 'Xóa báo giá'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Sale Contract Modal */}
      {showSaleContractModal && selectedQuotationForContract && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-[9999]">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl transform transition-all">
            {/* Header */}
            <div className="bg-gradient-to-r from-orange-500 to-red-600 text-white p-6 rounded-t-2xl">
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-white bg-opacity-20 rounded-xl flex items-center justify-center">
                    <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">Tạo hợp đồng bán hàng</h2>
                    <p className="text-orange-100 text-sm">Từ báo giá #{selectedQuotationForContract.quotationId}</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowSaleContractModal(false)}
                  className="text-white hover:text-orange-200 transition-colors p-2 hover:bg-white hover:bg-opacity-10 rounded-lg"
                  disabled={creatingSaleContract === selectedQuotationForContract.quotationId}
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-6">
              <form id="create-sale-contract-form" onSubmit={handleCreateSaleContract} className="space-y-6">
                {/* Quotation Info */}
                <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-xl p-4 border border-orange-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Thông tin báo giá</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">ID Báo giá:</span>
                      <span className="font-semibold ml-2">#{selectedQuotationForContract.quotationId}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Giá cuối:</span>
                      <span className="font-semibold ml-2 text-green-600">{formatPrice(selectedQuotationForContract.finalPrice)}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Khách hàng ID:</span>
                      <span className="font-semibold ml-2">{selectedQuotationForContract.userId}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Xe ID:</span>
                      <span className="font-semibold ml-2">{selectedQuotationForContract.vehicleId}</span>
                    </div>
                  </div>
                </div>

                {/* Contract Details */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">Chi tiết hợp đồng</h3>
                  
                  {/* Row 1: Contract Date & Status */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700">
                        <Calendar className="h-4 w-4 text-orange-600" />
                        <span>Ngày hợp đồng *</span>
                      </label>
                      <input
                        type="datetime-local"
                        required
                        value={saleContractForm.contractDate.slice(0, 16)}
                        onChange={(e) => setSaleContractForm({...saleContractForm, contractDate: new Date(e.target.value).toISOString()})}
                        className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:border-orange-500 focus:ring-2 focus:ring-orange-100 transition-all duration-200 bg-gray-50 focus:bg-white"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700">
                        <FileText className="h-4 w-4 text-orange-600" />
                        <span>Trạng thái *</span>
                      </label>
                      <select
                        required
                        value={saleContractForm.status}
                        onChange={(e) => setSaleContractForm({...saleContractForm, status: e.target.value})}
                        className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:border-orange-500 focus:ring-2 focus:ring-orange-100 transition-all duration-200 bg-gray-50 focus:bg-white appearance-none"
                      >
                        <option value="PENDING">Chờ xử lý</option>
                        <option value="SIGNED">Đã ký</option>
                        <option value="COMPLETED">Hoàn thành</option>
                        <option value="CANCELLED">Hủy bỏ</option>
                      </select>
                    </div>
                  </div>

                  {/* Row 2: Total Amount */}
                  <div className="space-y-2">
                    <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700">
                      <DollarSign className="h-4 w-4 text-orange-600" />
                      <span>Tổng tiền *</span>
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        required
                        value={saleContractForm.totalAmount}
                        onChange={(e) => setSaleContractForm({...saleContractForm, totalAmount: parseFloat(e.target.value)})}
                        className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:border-orange-500 focus:ring-2 focus:ring-orange-100 transition-all duration-200 bg-gray-50 focus:bg-white"
                        placeholder="Nhập tổng tiền"
                      />
                      <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                        <span className="text-gray-400 text-sm">VND</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Customer Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">Thông tin khách hàng</h3>
                  
                  {/* Row 1: Customer Name & Phone */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700">
                        <User className="h-4 w-4 text-orange-600" />
                        <span>Tên khách hàng *</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={saleContractForm.customerName}
                        onChange={(e) => setSaleContractForm({...saleContractForm, customerName: e.target.value})}
                        className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:border-orange-500 focus:ring-2 focus:ring-orange-100 transition-all duration-200 bg-gray-50 focus:bg-white"
                        placeholder="Nhập tên khách hàng"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700">
                        <svg className="h-4 w-4 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                        </svg>
                        <span>Số điện thoại *</span>
                      </label>
                      <input
                        type="tel"
                        required
                        value={saleContractForm.customerPhone}
                        onChange={(e) => setSaleContractForm({...saleContractForm, customerPhone: e.target.value})}
                        className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:border-orange-500 focus:ring-2 focus:ring-orange-100 transition-all duration-200 bg-gray-50 focus:bg-white"
                        placeholder="Nhập số điện thoại"
                      />
                    </div>
                  </div>

                  {/* Row 2: Email & Payment Method */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700">
                        <svg className="h-4 w-4 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                        <span>Email</span>
                      </label>
                      <input
                        type="email"
                        value={saleContractForm.customerEmail}
                        onChange={(e) => setSaleContractForm({...saleContractForm, customerEmail: e.target.value})}
                        className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:border-orange-500 focus:ring-2 focus:ring-orange-100 transition-all duration-200 bg-gray-50 focus:bg-white"
                        placeholder="Nhập email khách hàng"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700">
                        <DollarSign className="h-4 w-4 text-orange-600" />
                        <span>Phương thức thanh toán *</span>
                      </label>
                      <select
                        required
                        value={saleContractForm.paymentMethod}
                        onChange={(e) => setSaleContractForm({...saleContractForm, paymentMethod: e.target.value})}
                        className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:border-orange-500 focus:ring-2 focus:ring-orange-100 transition-all duration-200 bg-gray-50 focus:bg-white appearance-none"
                      >
                        <option value="CASH">Tiền mặt</option>
                        <option value="BANK_TRANSFER">Chuyển khoản</option>
                        <option value="CREDIT_CARD">Thẻ tín dụng</option>
                        <option value="INSTALLMENT">Trả góp</option>
                      </select>
                    </div>
                  </div>

                  {/* Row 3: Delivery Address */}
                  <div className="space-y-2">
                    <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700">
                      <svg className="h-4 w-4 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <span>Địa chỉ giao hàng</span>
                    </label>
                    <textarea
                      value={saleContractForm.deliveryAddress}
                      onChange={(e) => setSaleContractForm({...saleContractForm, deliveryAddress: e.target.value})}
                      rows={3}
                      className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:border-orange-500 focus:ring-2 focus:ring-orange-100 transition-all duration-200 bg-gray-50 focus:bg-white"
                      placeholder="Nhập địa chỉ giao hàng"
                    />
                  </div>

                  {/* Row 4: Notes */}
                  <div className="space-y-2">
                    <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700">
                      <svg className="h-4 w-4 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                      <span>Ghi chú</span>
                    </label>
                    <textarea
                      value={saleContractForm.notes}
                      onChange={(e) => setSaleContractForm({...saleContractForm, notes: e.target.value})}
                      rows={3}
                      className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:border-orange-500 focus:ring-2 focus:ring-orange-100 transition-all duration-200 bg-gray-50 focus:bg-white"
                      placeholder="Nhập ghi chú (tùy chọn)"
                    />
                  </div>
                </div>
              </form>
            </div>

            {/* Footer */}
            <div className="bg-gray-50 px-6 py-4 rounded-b-2xl flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setShowSaleContractModal(false)}
                className="px-6 py-3 border-2 border-gray-300 rounded-xl text-gray-700 hover:bg-white hover:border-gray-400 transition-all duration-200 font-medium"
                disabled={creatingSaleContract === selectedQuotationForContract.quotationId}
              >
                Hủy
              </button>
              <button
                type="submit"
                form="create-sale-contract-form"
                className="px-6 py-3 bg-gradient-to-r from-orange-600 to-red-600 text-white rounded-xl hover:from-orange-700 hover:to-red-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 transition-all duration-200 font-medium shadow-lg"
                disabled={creatingSaleContract === selectedQuotationForContract.quotationId}
              >
                {creatingSaleContract === selectedQuotationForContract.quotationId && (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                )}
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <span>{creatingSaleContract === selectedQuotationForContract.quotationId ? 'Đang tạo...' : 'Tạo hợp đồng'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
