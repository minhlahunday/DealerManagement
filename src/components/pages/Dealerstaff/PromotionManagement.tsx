import React, { useState, useEffect } from 'react';
import { Search, Gift, Calendar, Tag, DollarSign, User, Eye, Sparkles, Edit, Trash2, AlertTriangle, Plus } from 'lucide-react';
import { promotionService, Promotion, UpdatePromotionRequest, CreatePromotionRequest } from '../../../services/promotionService';

export const PromotionManagement: React.FC = () => {
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPromotion, setSelectedPromotion] = useState<Promotion | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [creatingPromotion, setCreatingPromotion] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingPromotion, setEditingPromotion] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletingPromotion, setDeletingPromotion] = useState(false);
  const [promotionToDelete, setPromotionToDelete] = useState<Promotion | null>(null);
  const [createForm, setCreateForm] = useState<Promotion>({
    promotionId: 0,
    userId: 0,
    promotionCode: '',
    optionName: '',
    optionValue: 0,
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  });
  const [editForm, setEditForm] = useState<Promotion>({
    promotionId: 0,
    userId: 0,
    promotionCode: '',
    optionName: '',
    optionValue: 0,
    startDate: '',
    endDate: ''
  });

  // Load promotions when component mounts
  useEffect(() => {
    fetchPromotions();
  }, []);

  // Fetch promotions from API
  const fetchPromotions = async () => {
    setLoading(true);
    setError(null);

    try {
      console.log('🔍 Fetching promotions from API...');
      const response = await promotionService.getPromotions();
      console.log('📡 Promotions API Response:', response);

      if (response.success) {
        setPromotions(response.data || []);
        console.log('✅ Promotions loaded from API:', response.data?.length || 0);
      } else {
        console.log('❌ API returned success=false');
        setPromotions([]);
      }
    } catch (error) {
      console.error('Failed to fetch promotions:', error);
      setError(error instanceof Error ? error.message : 'Lỗi khi tải danh sách khuyến mãi');
      setPromotions([]);
    } finally {
      setLoading(false);
    }
  };

  // View promotion details
  const handleViewPromotion = async (promotion: Promotion) => {
    setLoadingDetail(true);
    setError(null);

    try {
      console.log(`🔍 Fetching promotion details for ID: ${promotion.promotionId}`);
      const response = await promotionService.getPromotionById(promotion.promotionId);
      
      console.log('📡 API Response:', response);
      
      if (response.success && response.data) {
        console.log('✅ Promotion details loaded successfully:', response.data);
        setSelectedPromotion(response.data);
        setShowDetailModal(true);
      } else {
        console.error('❌ Failed to load promotion details:', response.message);
        console.log('⚠️ Fallback: Using promotion data from list');
        // Fallback to using the promotion data we already have
        setSelectedPromotion(promotion);
        setShowDetailModal(true);
      }
    } catch (error) {
      console.error('❌ Error loading promotion details:', error);
      console.log('⚠️ Fallback: Using promotion data from list due to error');
      // Fallback to using the promotion data we already have
      setSelectedPromotion(promotion);
      setShowDetailModal(true);
    } finally {
      setLoadingDetail(false);
    }
  };

  // Create promotion
  const handleCreatePromotion = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreatingPromotion(true);

    try {
      const promotionData: CreatePromotionRequest = {
        promotionId: 0, // Will be set by backend
        userId: createForm.userId,
        promotionCode: createForm.promotionCode,
        optionName: createForm.optionName,
        optionValue: Number(createForm.optionValue) || 0,
        startDate: createForm.startDate,
        endDate: createForm.endDate
      };

      console.log('🔄 Creating promotion with data:', promotionData);
      const response = await promotionService.createPromotion(promotionData);

      if (response.success) {
        console.log('✅ Promotion created successfully:', response);
        setShowCreateModal(false);
        // Reset form
        setCreateForm({
          promotionId: 0,
          userId: 0,
          promotionCode: '',
          optionName: '',
          optionValue: 0,
          startDate: new Date().toISOString().split('T')[0],
          endDate: new Date().toISOString().split('T')[0]
        });
        // Refresh promotions list
        await fetchPromotions();
        alert('✅ Khuyến mãi đã được tạo thành công!');
      } else {
        console.error('❌ Failed to create promotion:', response.message);
        alert(`❌ Lỗi khi tạo khuyến mãi: ${response.message}`);
      }
    } catch (error) {
      console.error('❌ Error creating promotion:', error);
      alert(`Lỗi khi tạo khuyến mãi: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setCreatingPromotion(false);
    }
  };

  // Edit promotion
  const handleEditPromotion = (promotion: Promotion) => {
    console.log('✏️ Opening edit modal for promotion:', promotion.promotionId);
    
    // Populate edit form with promotion data
    setEditForm({
      promotionId: promotion.promotionId,
      userId: promotion.userId,
      promotionCode: promotion.promotionCode,
      optionName: promotion.optionName,
      optionValue: promotion.optionValue,
      startDate: promotion.startDate,
      endDate: promotion.endDate
    });
    
    setShowEditModal(true);
  };

  // Update promotion
  const handleUpdatePromotion = async (e: React.FormEvent) => {
    e.preventDefault();
    setEditingPromotion(true);

    try {
      const promotionData: UpdatePromotionRequest = {
        promotionId: editForm.promotionId,
        userId: editForm.userId,
        promotionCode: editForm.promotionCode,
        optionName: editForm.optionName,
        optionValue: Number(editForm.optionValue) || 0,
        startDate: editForm.startDate,
        endDate: editForm.endDate
      };

      console.log('🔄 Updating promotion with data:', promotionData);
      const response = await promotionService.updatePromotion(editForm.promotionId, promotionData);

      if (response.success) {
        console.log('✅ Promotion updated successfully:', response);
        setShowEditModal(false);
        // Refresh promotions list
        await fetchPromotions();
        alert('✅ Khuyến mãi đã được cập nhật thành công!');
      } else {
        console.error('❌ Failed to update promotion:', response.message);
        alert(`❌ Lỗi khi cập nhật khuyến mãi: ${response.message}`);
      }
    } catch (error) {
      console.error('❌ Error updating promotion:', error);
      alert(`Lỗi khi cập nhật khuyến mãi: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setEditingPromotion(false);
    }
  };

  // Delete promotion
  const handleDeletePromotion = (promotion: Promotion) => {
    console.log('🗑️ Opening delete confirmation for promotion:', promotion.promotionId);
    setPromotionToDelete(promotion);
    setShowDeleteModal(true);
  };

  // Confirm delete promotion
  const handleConfirmDelete = async () => {
    if (!promotionToDelete) return;
    
    setDeletingPromotion(true);
    try {
      console.log(`🗑️ Deleting promotion ${promotionToDelete.promotionId} via API...`);
      const response = await promotionService.deletePromotion(promotionToDelete.promotionId);
      
      if (response.success) {
        console.log('✅ Promotion deleted successfully');
        setShowDeleteModal(false);
        setPromotionToDelete(null);
        // Refresh promotions list
        await fetchPromotions();
        alert('✅ Khuyến mãi đã được xóa thành công!');
      } else {
        console.error('❌ Delete returned success=false:', response.message);
        alert(`❌ Lỗi khi xóa khuyến mãi: ${response.message}`);
      }
    } catch (error) {
      console.error('❌ Error deleting promotion:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      alert(`❌ Lỗi khi xóa khuyến mãi: ${errorMessage}`);
    } finally {
      setDeletingPromotion(false);
    }
  };

  // Filter promotions
  const filteredPromotions = promotions.filter(promotion =>
    promotion.promotionCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
    promotion.optionName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    promotion.promotionId.toString().includes(searchTerm)
  );

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
      day: '2-digit'
    });
  };

  // Check if promotion is active
  const isPromotionActive = (promotion: Promotion) => {
    const now = new Date();
    const start = new Date(promotion.startDate);
    const end = new Date(promotion.endDate);
    return now >= start && now <= end;
  };

  // Get status badge
  const getStatusBadge = (promotion: Promotion) => {
    const now = new Date();
    const start = new Date(promotion.startDate);
    const end = new Date(promotion.endDate);

    if (now < start) {
      return <span className="px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">Sắp diễn ra</span>;
    } else if (now > end) {
      return <span className="px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800">Đã hết hạn</span>;
    } else {
      return <span className="px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">Đang diễn ra</span>;
    }
  };

  // Count active promotions
  const activePromotionsCount = promotions.filter(p => isPromotionActive(p)).length;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="bg-gradient-to-r from-orange-50 via-pink-50 to-purple-50 rounded-2xl p-8 mb-6 border border-orange-200">
        <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center space-y-4 lg:space-y-0">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-pink-600 rounded-2xl flex items-center justify-center shadow-lg">
              <Gift className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-gray-900">Quản lý khuyến mãi</h1>
              <p className="text-gray-600 mt-1">Xem và quản lý các chương trình khuyến mãi</p>
            </div>
          </div>
          <div className="flex items-center space-x-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">{promotions.length}</div>
              <div className="text-sm text-gray-600">Tổng khuyến mãi</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{activePromotionsCount}</div>
              <div className="text-sm text-gray-600">Đang diễn ra</div>
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
              placeholder="Tìm kiếm khuyến mãi..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200 bg-gray-50 focus:bg-white"
            />
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={fetchPromotions}
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
              className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-6 py-3 rounded-xl font-medium flex items-center space-x-2 shadow-lg transition-all duration-200 transform hover:scale-105"
            >
              <Plus className="h-5 w-5" />
              <span>Tạo khuyến mãi</span>
            </button>
          </div>
        </div>
      </div>

      {/* Loading Spinner */}
      {loading && (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
          <span className="ml-3 text-gray-600">Đang tải danh sách khuyến mãi...</span>
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

      {/* Promotions Grid */}
      {!loading && filteredPromotions.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPromotions.map((promotion) => (
            <div
              key={promotion.promotionId}
              className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:scale-105"
            >
              {/* Card Header with gradient */}
              <div className={`p-6 ${
                isPromotionActive(promotion)
                  ? 'bg-gradient-to-r from-orange-500 to-pink-600'
                  : 'bg-gradient-to-r from-gray-400 to-gray-500'
              }`}>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <div className="w-10 h-10 bg-white bg-opacity-20 rounded-xl flex items-center justify-center">
                      <Gift className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <p className="text-white text-xs font-medium">Mã khuyến mãi</p>
                      <p className="text-white text-xl font-bold">{promotion.promotionCode}</p>
                    </div>
                  </div>
                  <Sparkles className="h-6 w-6 text-white opacity-70" />
                </div>
                <div className="mt-4">
                  {getStatusBadge(promotion)}
                </div>
              </div>

              {/* Card Body */}
              <div className="p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center space-x-2">
                  <Tag className="h-5 w-5 text-orange-600" />
                  <span>{promotion.optionName}</span>
                </h3>

               

                {/* Action Buttons */}
                <div className="mt-6 space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => handleEditPromotion(promotion)}
                      className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-4 py-3 rounded-xl font-medium flex items-center justify-center space-x-2 shadow-lg transition-all duration-200 transform hover:scale-105"
                    >
                      <Edit className="h-5 w-5" />
                      <span>Chỉnh sửa</span>
                    </button>
                    
                    <button
                      onClick={() => handleViewPromotion(promotion)}
                      disabled={loadingDetail}
                      className="bg-gradient-to-r from-orange-600 to-pink-600 hover:from-orange-700 hover:to-pink-700 text-white px-4 py-3 rounded-xl font-medium flex items-center justify-center space-x-2 shadow-lg transition-all duration-200 transform hover:scale-105 disabled:opacity-50"
                    >
                      {loadingDetail ? (
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      ) : (
                        <>
                          <Eye className="h-5 w-5" />
                          <span>Xem</span>
                        </>
                      )}
                    </button>
                  </div>
                  
                  <button
                    onClick={() => handleDeletePromotion(promotion)}
                    className="w-full bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 text-white px-4 py-3 rounded-xl font-medium flex items-center justify-center space-x-2 shadow-lg transition-all duration-200 transform hover:scale-105"
                  >
                    <Trash2 className="h-5 w-5" />
                    <span>Xóa khuyến mãi</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && filteredPromotions.length === 0 && promotions.length === 0 && (
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-12 text-center">
          <div className="mx-auto w-24 h-24 bg-gradient-to-r from-orange-100 to-pink-100 rounded-full flex items-center justify-center mb-4">
            <Gift className="h-12 w-12 text-orange-500" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Chưa có khuyến mãi nào</h3>
          <p className="text-gray-600">Hiện tại chưa có chương trình khuyến mãi nào trong hệ thống.</p>
        </div>
      )}

      {/* No Search Results */}
      {!loading && filteredPromotions.length === 0 && promotions.length > 0 && (
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-12 text-center">
          <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <Search className="h-12 w-12 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Không tìm thấy kết quả</h3>
          <p className="text-gray-600">Không tìm thấy khuyến mãi nào phù hợp với từ khóa "{searchTerm}"</p>
        </div>
      )}

      {/* Detail Modal */}
      {showDetailModal && selectedPromotion && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl transform transition-all">
            {/* Header */}
            <div className={`p-6 rounded-t-2xl ${
              isPromotionActive(selectedPromotion)
                ? 'bg-gradient-to-r from-orange-500 to-pink-600'
                : 'bg-gradient-to-r from-gray-400 to-gray-500'
            }`}>
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-white bg-opacity-20 rounded-xl flex items-center justify-center">
                    <Gift className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-white">Chi tiết khuyến mãi</h2>
                    <p className="text-white text-sm opacity-90">#{selectedPromotion.promotionId}</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="text-white hover:text-gray-200 transition-colors p-2 hover:bg-white hover:bg-opacity-10 rounded-lg"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-6">
              <div className="space-y-6">
                {/* Promotion Code */}
                <div className="bg-gradient-to-r from-orange-50 to-pink-50 rounded-xl p-6 border-2 border-orange-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Mã khuyến mãi</p>
                      <p className="text-3xl font-bold text-orange-600">{selectedPromotion.promotionCode}</p>
                    </div>
                    <div>
                      {getStatusBadge(selectedPromotion)}
                    </div>
                  </div>
                </div>

                {/* Info Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Option Name */}
                  <div className="bg-gray-50 rounded-xl p-4">
                    <div className="flex items-center space-x-2 mb-2">
                      <Tag className="h-5 w-5 text-gray-600" />
                      <p className="text-sm text-gray-600">Tên ưu đãi</p>
                    </div>
                    <p className="font-semibold text-gray-900">{selectedPromotion.optionName}</p>
                  </div>

                  {/* Value */}
                  <div className="bg-green-50 rounded-xl p-4">
                    <div className="flex items-center space-x-2 mb-2">
                      <DollarSign className="h-5 w-5 text-green-600" />
                      <p className="text-sm text-gray-600">Giá trị ưu đãi</p>
                    </div>
                    <p className="font-bold text-green-600">{formatPrice(selectedPromotion.optionValue)}</p>
                  </div>

                  {/* Start Date */}
                  <div className="bg-blue-50 rounded-xl p-4">
                    <div className="flex items-center space-x-2 mb-2">
                      <Calendar className="h-5 w-5 text-blue-600" />
                      <p className="text-sm text-gray-600">Ngày bắt đầu</p>
                    </div>
                    <p className="font-semibold text-gray-900">{formatDate(selectedPromotion.startDate)}</p>
                  </div>

                  {/* End Date */}
                  <div className="bg-purple-50 rounded-xl p-4">
                    <div className="flex items-center space-x-2 mb-2">
                      <Calendar className="h-5 w-5 text-purple-600" />
                      <p className="text-sm text-gray-600">Ngày kết thúc</p>
                    </div>
                    <p className="font-semibold text-gray-900">{formatDate(selectedPromotion.endDate)}</p>
                  </div>

                  {/* User ID */}
                  <div className="bg-orange-50 rounded-xl p-4 md:col-span-2">
                    <div className="flex items-center space-x-2 mb-2">
                      <User className="h-5 w-5 text-orange-600" />
                      <p className="text-sm text-gray-600">Người tạo khuyến mãi</p>
                    </div>
                    <p className="font-semibold text-gray-900">User ID: {selectedPromotion.userId}</p>
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

      {/* Create Modal */}
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
                    <h2 className="text-2xl font-bold">Tạo Khuyến Mãi Mới</h2>
                    <p className="text-green-100 text-sm mt-1">Thêm khuyến mãi mới vào hệ thống</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="text-white hover:bg-white/20 p-2 rounded-lg transition-colors"
                >
                  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleCreatePromotion} className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Promotion Code */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    <Tag className="inline h-4 w-4 mr-2 text-orange-600" />
                    Mã khuyến mãi
                  </label>
                  <input
                    type="text"
                    required
                    value={createForm.promotionCode}
                    onChange={(e) => setCreateForm({ ...createForm, promotionCode: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200"
                    placeholder="Nhập mã khuyến mãi"
                  />
                </div>

                {/* User ID */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    <User className="inline h-4 w-4 mr-2 text-blue-600" />
                    User ID
                  </label>
                  <input
                    type="number"
                    required
                    value={createForm.userId === 0 ? '' : createForm.userId}
                    onChange={(e) => setCreateForm({ ...createForm, userId: Number(e.target.value) || 0 })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    placeholder="Nhập User ID"
                  />
                </div>

                {/* Option Name */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    <Gift className="inline h-4 w-4 mr-2 text-purple-600" />
                    Tên khuyến mãi
                  </label>
                  <input
                    type="text"
                    required
                    value={createForm.optionName}
                    onChange={(e) => setCreateForm({ ...createForm, optionName: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200"
                    placeholder="Nhập tên khuyến mãi"
                  />
                </div>

                {/* Option Value */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    <DollarSign className="inline h-4 w-4 mr-2 text-green-600" />
                    Giá trị khuyến mãi
                  </label>
                  <input
                    type="number"
                    required
                    value={createForm.optionValue === 0 ? '' : createForm.optionValue}
                    onChange={(e) => setCreateForm({ ...createForm, optionValue: Number(e.target.value) || 0 })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    placeholder="Nhập giá trị khuyến mãi"
                  />
                </div>

                {/* Start Date */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    <Calendar className="inline h-4 w-4 mr-2 text-indigo-600" />
                    Ngày bắt đầu
                  </label>
                  <input
                    type="date"
                    required
                    value={createForm.startDate}
                    onChange={(e) => setCreateForm({ ...createForm, startDate: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200"
                  />
                </div>

                {/* End Date */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    <Calendar className="inline h-4 w-4 mr-2 text-pink-600" />
                    Ngày kết thúc
                  </label>
                  <input
                    type="date"
                    required
                    value={createForm.endDate}
                    onChange={(e) => setCreateForm({ ...createForm, endDate: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200"
                  />
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-end space-x-4 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-all duration-200"
                  disabled={creatingPromotion}
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={creatingPromotion}
                  className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-8 py-3 rounded-xl font-medium shadow-lg transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                >
                  {creatingPromotion ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      <span>Đang tạo...</span>
                    </>
                  ) : (
                    <>
                      <Plus className="h-5 w-5" />
                      <span>Tạo khuyến mãi</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl transform transition-all max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white p-6 rounded-t-2xl">
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-white bg-opacity-20 rounded-xl flex items-center justify-center">
                    <Edit className="h-6 w-6" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">Chỉnh sửa khuyến mãi</h2>
                    <p className="text-blue-100 text-sm">Cập nhật thông tin khuyến mãi #{editForm.promotionId}</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowEditModal(false)}
                  className="text-white hover:text-blue-200 transition-colors p-2 hover:bg-white hover:bg-opacity-10 rounded-lg"
                  disabled={editingPromotion}
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-6">
              <form id="edit-promotion-form" onSubmit={handleUpdatePromotion} className="space-y-4">
                {/* Promotion Code */}
                <div className="space-y-2">
                  <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700">
                    <Tag className="h-4 w-4 text-blue-600" />
                    <span>Mã khuyến mãi *</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={editForm.promotionCode}
                    onChange={(e) => setEditForm({...editForm, promotionCode: e.target.value.toUpperCase()})}
                    className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all duration-200 bg-gray-50 focus:bg-white uppercase"
                    placeholder="Nhập mã khuyến mãi"
                  />
                </div>

                {/* Option Name */}
                <div className="space-y-2">
                  <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700">
                    <Gift className="h-4 w-4 text-blue-600" />
                    <span>Tên ưu đãi *</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={editForm.optionName}
                    onChange={(e) => setEditForm({...editForm, optionName: e.target.value})}
                    className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all duration-200 bg-gray-50 focus:bg-white"
                    placeholder="Nhập tên ưu đãi"
                  />
                </div>

                {/* Option Value */}
                <div className="space-y-2">
                  <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700">
                    <DollarSign className="h-4 w-4 text-blue-600" />
                    <span>Giá trị ưu đãi *</span>
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      required
                      value={editForm.optionValue}
                      onChange={(e) => setEditForm({...editForm, optionValue: parseFloat(e.target.value) || 0})}
                      className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all duration-200 bg-gray-50 focus:bg-white"
                      placeholder="Nhập giá trị"
                    />
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                      <span className="text-gray-400 text-sm">VND</span>
                    </div>
                  </div>
                </div>

                {/* Date Range */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700">
                      <Calendar className="h-4 w-4 text-blue-600" />
                      <span>Ngày bắt đầu *</span>
                    </label>
                    <input
                      type="date"
                      required
                      value={editForm.startDate}
                      onChange={(e) => setEditForm({...editForm, startDate: e.target.value})}
                      className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all duration-200 bg-gray-50 focus:bg-white"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700">
                      <Calendar className="h-4 w-4 text-blue-600" />
                      <span>Ngày kết thúc *</span>
                    </label>
                    <input
                      type="date"
                      required
                      value={editForm.endDate}
                      onChange={(e) => setEditForm({...editForm, endDate: e.target.value})}
                      className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all duration-200 bg-gray-50 focus:bg-white"
                    />
                  </div>
                </div>

                {/* User ID (Read-only) */}
                <div className="space-y-2">
                  <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700">
                    <User className="h-4 w-4 text-blue-600" />
                    <span>User ID</span>
                  </label>
                  <input
                    type="number"
                    value={editForm.userId}
                    readOnly
                    className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 bg-gray-100 text-gray-600 cursor-not-allowed"
                  />
                </div>
              </form>
            </div>

            {/* Footer */}
            <div className="bg-gray-50 px-6 py-4 rounded-b-2xl flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setShowEditModal(false)}
                className="px-6 py-3 border-2 border-gray-300 rounded-xl text-gray-700 hover:bg-white hover:border-gray-400 transition-all duration-200 font-medium"
                disabled={editingPromotion}
              >
                Hủy
              </button>
              <button
                type="submit"
                form="edit-promotion-form"
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 transition-all duration-200 font-medium shadow-lg"
                disabled={editingPromotion}
              >
                {editingPromotion && (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                )}
                <Edit className="h-4 w-4" />
                <span>{editingPromotion ? 'Đang cập nhật...' : 'Cập nhật'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && promotionToDelete && (
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
                    <p className="text-red-100 text-sm">Xóa khuyến mãi #{promotionToDelete.promotionId}</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="text-white hover:text-red-200 transition-colors p-2 hover:bg-white hover:bg-opacity-10 rounded-lg"
                  disabled={deletingPromotion}
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
                  <AlertTriangle className="h-8 w-8 text-red-600" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Bạn có chắc chắn muốn xóa khuyến mãi này?
                  </h3>
                  <p className="text-gray-600 text-sm">
                    Khuyến mãi <span className="font-bold">{promotionToDelete.promotionCode}</span> sẽ bị xóa vĩnh viễn và không thể khôi phục.
                  </p>
                </div>
              </div>

              {/* Promotion Info */}
              <div className="bg-gray-50 rounded-xl p-4 mb-6">
                <h4 className="text-sm font-semibold text-gray-700 mb-3">Thông tin khuyến mãi sẽ bị xóa:</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Mã KM:</span>
                    <span className="font-semibold">{promotionToDelete.promotionCode}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Tên ưu đãi:</span>
                    <span className="font-semibold">{promotionToDelete.optionName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Giá trị:</span>
                    <span className="font-semibold text-green-600">{formatPrice(promotionToDelete.optionValue)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Thời gian:</span>
                    <span className="font-semibold text-xs">
                      {formatDate(promotionToDelete.startDate)} - {formatDate(promotionToDelete.endDate)}
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
                      <p>Hành động này không thể hoàn tác. Khuyến mãi sẽ bị xóa vĩnh viễn khỏi hệ thống.</p>
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
                disabled={deletingPromotion}
              >
                Hủy
              </button>
              <button
                onClick={handleConfirmDelete}
                disabled={deletingPromotion}
                className="px-6 py-3 bg-gradient-to-r from-red-600 to-pink-600 text-white rounded-xl hover:from-red-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 transition-all duration-200 font-medium shadow-lg"
              >
                {deletingPromotion && (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                )}
                <Trash2 className="h-4 w-4" />
                <span>{deletingPromotion ? 'Đang xóa...' : 'Xóa khuyến mãi'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
      </div>
    </div>
  );
};

