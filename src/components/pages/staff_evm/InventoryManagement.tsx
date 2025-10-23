import React, { useState, useEffect } from 'react';
import { Search, Package, RefreshCw, AlertCircle, DollarSign, Car, Archive, Eye, Edit2, X, Save } from 'lucide-react';
import { inventoryService, Inventory } from '../../../services/inventoryService';
import { useAuth } from '../../../contexts/AuthContext';

export const InventoryManagement: React.FC = () => {
  const { user } = useAuth();
  const isStaffEVM = user?.role === 'evm_staff';
  
  const [inventory, setInventory] = useState<Inventory[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedInventory, setSelectedInventory] = useState<Inventory | null>(null);
  const [editFormData, setEditFormData] = useState<Partial<Inventory>>({});

  // Fetch inventory on mount
  useEffect(() => {
    fetchInventory();
  }, []);

  const fetchInventory = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await inventoryService.getInventory();
      console.log('📦 Inventory loaded:', response.data);
      setInventory(response.data);
    } catch (err) {
      console.error('Failed to fetch inventory:', err);
      setError(`Không thể tải danh sách tồn kho: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetail = async (vehicleId: number) => {
    try {
      const response = await inventoryService.getInventoryByVehicleId(vehicleId);
      setSelectedInventory(response.data);
      setShowDetailModal(true);
    } catch (err) {
      alert(`Không thể tải chi tiết: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  };

  const handleOpenEditModal = async (vehicleId: number) => {
    try {
      const response = await inventoryService.getInventoryByVehicleId(vehicleId);
      setSelectedInventory(response.data);
      setEditFormData({
        quantity: response.data.quantity,
      });
      setShowEditModal(true);
    } catch (err) {
      alert(`Không thể tải dữ liệu: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  };

  const handleUpdateInventory = async () => {
    if (!selectedInventory) return;
    
    try {
      const newQuantity = editFormData.quantity ?? selectedInventory.quantity;
      console.log('📝 Updating quantity to:', newQuantity);
      
      await inventoryService.updateInventory(selectedInventory.vehicleId, newQuantity);
      alert('Cập nhật số lượng tồn kho thành công!');
      setShowEditModal(false);
      fetchInventory();
    } catch (err) {
      console.error('Update error:', err);
      alert(`Không thể cập nhật: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  };

  // Format price
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  };

  // Get status badge
  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { className: string }> = {
      'Còn hàng': { className: 'bg-green-100 text-green-800' },
      'Hết hàng': { className: 'bg-red-100 text-red-800' },
      'Sắp hết': { className: 'bg-yellow-100 text-yellow-800' },
    };
    
    const statusInfo = statusMap[status] || { className: 'bg-blue-100 text-blue-800' };
    
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusInfo.className}`}>
        {status}
      </span>
    );
  };

  // Filter inventory based on search term
  const filteredInventory = inventory.filter(item =>
    item.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.color.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.status.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Calculate stats
  const totalItems = filteredInventory.length;
  const totalQuantity = filteredInventory.reduce((sum, item) => sum + item.quantity, 0);
  const totalValue = filteredInventory.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const inStockItems = filteredInventory.filter(item => item.status === 'Còn hàng').length;

  if (!isStaffEVM) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-2">
            Truy cập bị từ chối
          </h2>
          <p className="text-gray-600 text-center">
            Bạn không có quyền truy cập trang này. Chỉ staff EVM mới có thể quản lý tồn kho.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
                <Package className="w-8 h-8 text-purple-600" />
                Quản lý Tồn kho
              </h1>
              <p className="text-gray-600 mt-1">Theo dõi số lượng và trạng thái tồn kho xe</p>
            </div>
            <button
              onClick={fetchInventory}
              className="flex items-center gap-2 bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors shadow-lg"
            >
              <RefreshCw className="w-5 h-5" />
              Làm mới
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search Bar */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Tìm kiếm theo model, màu sắc, trạng thái..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
            <button
              onClick={() => setSearchTerm('')}
              className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              Xóa
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Tổng mặt hàng</p>
                <p className="text-3xl font-bold text-gray-900">{totalItems}</p>
              </div>
              <Archive className="w-12 h-12 text-blue-500" />
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Tổng số lượng</p>
                <p className="text-3xl font-bold text-purple-600">{totalQuantity}</p>
              </div>
              <Package className="w-12 h-12 text-purple-500" />
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Còn hàng</p>
                <p className="text-3xl font-bold text-green-600">{inStockItems}</p>
              </div>
              <Car className="w-12 h-12 text-green-500" />
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Tổng giá trị</p>
                <p className="text-xl font-bold text-blue-600">
                  {formatPrice(totalValue)}
                </p>
              </div>
              <DollarSign className="w-12 h-12 text-blue-500" />
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {/* Inventory Table */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Model
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Màu sắc
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Giá
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Số lượng
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Trạng thái
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tổng giá trị
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Thao tác
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-12 text-center">
                      <RefreshCw className="w-8 h-8 text-purple-600 animate-spin mx-auto mb-2" />
                      <p className="text-gray-600">Đang tải dữ liệu...</p>
                    </td>
                  </tr>
                ) : filteredInventory.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-12 text-center">
                      <Package className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                      <p className="text-gray-600">Không có dữ liệu tồn kho</p>
                    </td>
                  </tr>
                ) : (
                  filteredInventory.map((item) => (
                    <tr key={item.inventoryId} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">#{item.inventoryId}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <Car className="w-5 h-5 text-gray-400" />
                          <div>
                            <div className="text-sm font-semibold text-gray-900">{item.model}</div>
                            <div className="text-xs text-gray-500">Vehicle ID: {item.vehicleId}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{item.color}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-semibold text-gray-900">
                          {formatPrice(item.price)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-bold ${
                          item.quantity > 5 
                            ? 'bg-green-100 text-green-800' 
                            : item.quantity > 0 
                            ? 'bg-yellow-100 text-yellow-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {item.quantity}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        {getStatusBadge(item.status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <div className="text-sm font-bold text-purple-600">
                          {formatPrice(item.price * item.quantity)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleViewDetail(item.vehicleId)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Xem chi tiết"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleOpenEditModal(item.vehicleId)}
                            className="p-2 text-yellow-600 hover:bg-yellow-50 rounded-lg transition-colors"
                            title="Chỉnh sửa"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Summary Footer */}
        {/* {filteredInventory.length > 0 && (
          <div className="mt-6 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg shadow-md p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-1">Tổng mặt hàng</p>
                <p className="text-2xl font-bold text-gray-900">{totalItems} loại</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-1">Tổng số xe</p>
                <p className="text-2xl font-bold text-purple-600">{totalQuantity} xe</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-1">Tổng giá trị kho</p>
                <p className="text-2xl font-bold text-blue-600">{formatPrice(totalValue)}</p>
              </div>
            </div>
          </div>
        )} */}
      </div>

      {/* Detail Modal */}
      {showDetailModal && selectedInventory && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            {/* Header */}
            <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-6 flex items-center justify-between flex-shrink-0">
              <div>
                <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                  <Eye className="w-6 h-6" />
                  Chi tiết Tồn kho
                </h2>
                <p className="text-purple-100 mt-1">Thông tin chi tiết về tồn kho</p>
              </div>
              <button
                onClick={() => setShowDetailModal(false)}
                className="text-white hover:bg-white/20 p-2 rounded-lg transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-blue-50 rounded-lg p-4">
                  <label className="text-sm font-semibold text-blue-700 mb-2 block">Inventory ID</label>
                  <p className="text-lg font-bold text-gray-900">#{selectedInventory.inventoryId}</p>
                </div>

                <div className="bg-green-50 rounded-lg p-4">
                  <label className="text-sm font-semibold text-green-700 mb-2 block">Vehicle ID</label>
                  <p className="text-lg font-bold text-gray-900">#{selectedInventory.vehicleId}</p>
                </div>

                <div className="bg-purple-50 rounded-lg p-4">
                  <label className="text-sm font-semibold text-purple-700 mb-2 block">Model</label>
                  <p className="text-lg font-bold text-gray-900">{selectedInventory.model}</p>
                </div>

                <div className="bg-yellow-50 rounded-lg p-4">
                  <label className="text-sm font-semibold text-yellow-700 mb-2 block">Màu sắc</label>
                  <p className="text-lg font-bold text-gray-900">{selectedInventory.color}</p>
                </div>

                <div className="bg-pink-50 rounded-lg p-4">
                  <label className="text-sm font-semibold text-pink-700 mb-2 block">Giá</label>
                  <p className="text-lg font-bold text-gray-900">{formatPrice(selectedInventory.price)}</p>
                </div>

                <div className="bg-orange-50 rounded-lg p-4">
                  <label className="text-sm font-semibold text-orange-700 mb-2 block">Số lượng</label>
                  <p className="text-lg font-bold text-gray-900">{selectedInventory.quantity} xe</p>
                </div>

                <div className="bg-teal-50 rounded-lg p-4">
                  <label className="text-sm font-semibold text-teal-700 mb-2 block">Trạng thái</label>
                  <p className="text-lg font-bold">{getStatusBadge(selectedInventory.status)}</p>
                </div>

                <div className="bg-indigo-50 rounded-lg p-4">
                  <label className="text-sm font-semibold text-indigo-700 mb-2 block">Tổng giá trị</label>
                  <p className="text-lg font-bold text-gray-900">
                    {formatPrice(selectedInventory.price * selectedInventory.quantity)}
                  </p>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="bg-gray-50 px-6 py-4 flex justify-end gap-3 flex-shrink-0 border-t">
              <button
                onClick={() => setShowDetailModal(false)}
                className="px-6 py-2.5 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && selectedInventory && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            {/* Header */}
            <div className="bg-gradient-to-r from-yellow-600 to-orange-600 p-6 flex items-center justify-between flex-shrink-0">
              <div>
                <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                  <Edit2 className="w-6 h-6" />
                  Cập nhật Số lượng Tồn kho
                </h2>
                <p className="text-yellow-100 mt-1">Thay đổi số lượng xe trong kho</p>
              </div>
              <button
                onClick={() => setShowEditModal(false)}
                className="text-white hover:bg-white/20 p-2 rounded-lg transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6">
              <div className="space-y-6">
                {/* Read-only Info */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="text-sm font-semibold text-gray-700 mb-3">Thông tin xe (Chỉ xem)</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Model:</span>
                      <span className="ml-2 font-semibold text-gray-900">{selectedInventory.model}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Màu sắc:</span>
                      <span className="ml-2 font-semibold text-gray-900">{selectedInventory.color}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Giá:</span>
                      <span className="ml-2 font-semibold text-gray-900">{formatPrice(selectedInventory.price)}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Trạng thái:</span>
                      <span className="ml-2">{getStatusBadge(selectedInventory.status)}</span>
                    </div>
                  </div>
                </div>

                {/* Editable Field */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Số lượng tồn kho *
                  </label>
                  <input
                    type="text"
                    value={editFormData.quantity || 0}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, '');
                      setEditFormData({ ...editFormData, quantity: parseInt(value) || 0 });
                    }}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent text-lg font-semibold"
                    placeholder="10"
                  />
                  <p className="mt-2 text-sm text-gray-500">
                    Số lượng hiện tại: <span className="font-semibold text-gray-700">{selectedInventory.quantity}</span>
                  </p>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="bg-gray-50 px-6 py-4 flex justify-end gap-3 flex-shrink-0 border-t">
              <button
                onClick={() => setShowEditModal(false)}
                className="px-6 py-2.5 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                Hủy
              </button>
              <button
                onClick={handleUpdateInventory}
                className="px-6 py-2.5 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors flex items-center gap-2"
              >
                <Save className="w-5 h-5" />
                Cập nhật
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

