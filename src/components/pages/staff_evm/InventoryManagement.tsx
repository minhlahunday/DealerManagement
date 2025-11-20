import React, { useState, useEffect } from 'react';
import { Search, Package, RefreshCw, AlertCircle, DollarSign, Car, Archive, Eye, Edit2, X, Save, FileText, Calendar, Download, Plus, Trash2 } from 'lucide-react';
import { inventoryService, Inventory, DispatchReport } from '../../../services/inventoryService';
import { vehicleService } from '../../../services/vehicleService';
import { discountService, Discount } from '../../../services/discountService';
import { Vehicle } from '../../../types';
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
  
  // Dispatch Report states
  const [showDispatchReport, setShowDispatchReport] = useState(false);
  const [dispatchReport, setDispatchReport] = useState<DispatchReport | null>(null);
  const [fromDate, setFromDate] = useState<string>('');
  const [toDate, setToDate] = useState<string>('');
  const [loadingReport, setLoadingReport] = useState(false);
  const [reportError, setReportError] = useState<string | null>(null);
  
  // Create Inventory states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [creatingInventory, setCreatingInventory] = useState(false);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [createFormData, setCreateFormData] = useState({
    vehicleId: '',
    quantity: 0
  });
  
  // Delete Inventory states
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [inventoryToDelete, setInventoryToDelete] = useState<Inventory | null>(null);
  const [deletingInventory, setDeletingInventory] = useState(false);
  
  // Discount states - lưu thông tin discount để hiển thị
  const [vehicleDiscounts, setVehicleDiscounts] = useState<Map<number, Discount>>(new Map());

  // Fetch inventory on mount
  useEffect(() => {
    fetchInventory();
    fetchVehicles();
    fetchDiscounts();
  }, []);
  
  // Fetch discounts để lấy thông tin discount (tên, giá trị, v.v.) để hiển thị
  const fetchDiscounts = async () => {
    try {
      const response = await discountService.getDiscounts();
      if (response.success && response.data) {
        const discountMap = new Map<number, Discount>();
        response.data.forEach(discount => {
          discountMap.set(discount.discountId, discount);
        });
        setVehicleDiscounts(discountMap);
      }
    } catch (error) {
      console.error('Error loading discounts:', error);
    }
  };
  
  // Fetch vehicles for dropdown
  const fetchVehicles = async () => {
    try {
      const response = await vehicleService.getVehicles();
      if (response.success && response.data) {
        setVehicles(response.data);
        console.log('✅ Vehicles loaded for inventory:', response.data.length);
      }
    } catch (err) {
      console.error('Lỗi khi lấy danh sách xe:', err);
    }
  };

  const fetchInventory = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await inventoryService.getInventory();
      console.log('📦 Inventory loaded:', response.data);
      setInventory(response.data);
    } catch (err) {
      console.error('Lỗi khi lấy tồn kho:', err);
      setError(`Không thể tải danh sách tồn kho: ${err instanceof Error ? err.message : 'Lỗi không xác định'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetail = async (inventoryId: number) => {
    try {
      const response = await inventoryService.getInventoryById(inventoryId);
      setSelectedInventory(response.data);
      setShowDetailModal(true);
    } catch (err) {
      alert(`Không thể tải chi tiết: ${err instanceof Error ? err.message : 'Lỗi không xác định'}`);
    }
  };

  const handleOpenEditModal = async (inventoryId: number) => {
    try {
      const response = await inventoryService.getInventoryById(inventoryId);
      setSelectedInventory(response.data);
      setEditFormData({
        quantity: response.data.quantity,
      });
      setShowEditModal(true);
    } catch (err) {
      alert(`Không thể tải dữ liệu: ${err instanceof Error ? err.message : 'Lỗi không xác định'}`);
    }
  };

  const handleUpdateInventory = async () => {
    if (!selectedInventory) return;
    
    try {
      const newQuantity = editFormData.quantity ?? selectedInventory.quantity;
      console.log('📝 Updating inventory ID:', selectedInventory.inventoryId, 'to quantity:', newQuantity);
      
      await inventoryService.updateInventory(selectedInventory.inventoryId, newQuantity);
      alert('Cập nhật số lượng tồn kho thành công!');
      setShowEditModal(false);
      fetchInventory();
    } catch (err) {
      console.error('Update error:', err);
      alert(`Không thể cập nhật: ${err instanceof Error ? err.message : 'Lỗi không xác định'}`);
    }
  };

  const handleCreateInventory = async () => {
    // Validation
    if (!createFormData.vehicleId) {
      alert('❌ Vui lòng chọn xe!');
      return;
    }

    const vehicleId = parseInt(createFormData.vehicleId);
    if (!vehicleId || vehicleId <= 0) {
      alert('❌ Vehicle ID không hợp lệ!');
      return;
    }

    if (createFormData.quantity === undefined || createFormData.quantity === null || createFormData.quantity < 0) {
      alert('❌ Số lượng phải lớn hơn hoặc bằng 0!');
      return;
    }

    setCreatingInventory(true);
    try {
      console.log('🆕 Creating inventory:', { vehicleId, quantity: createFormData.quantity });
      await inventoryService.createInventory(vehicleId, createFormData.quantity);
      alert('✅ Tạo tồn kho thành công!');
      setShowCreateModal(false);
      setCreateFormData({ vehicleId: '', quantity: 0 });
      fetchInventory(); // Refresh inventory list
    } catch (err) {
      console.error('Create inventory error:', err);
      alert(`❌ Không thể tạo tồn kho: ${err instanceof Error ? err.message : 'Lỗi không xác định'}`);
    } finally {
      setCreatingInventory(false);
    }
  };

  const handleDeleteInventory = async () => {
    if (!inventoryToDelete) return;
    
    // KIỂM TRA QUANTITY TRƯỚC KHI GỌI API
    if (inventoryToDelete.quantity > 0) {
      alert(`⚠️ Không thể xóa tồn kho này!\n\n📦 Số lượng còn lại: ${inventoryToDelete.quantity} xe\n\n💡 Vui lòng giảm số lượng về 0 trước khi xóa tồn kho.`);
      return; // Dừng lại, không gọi API
    }
    
    setDeletingInventory(true);
    try {
      console.log('🗑️ Deleting inventory:', inventoryToDelete.inventoryId);
      await inventoryService.deleteInventory(inventoryToDelete.inventoryId);
      alert('✅ Xóa tồn kho thành công!');
      setShowDeleteModal(false);
      setInventoryToDelete(null);
      fetchInventory(); // Refresh inventory list
    } catch (err) {
      console.error('Delete inventory error:', err);
      alert(`❌ Không thể xóa tồn kho: ${err instanceof Error ? err.message : 'Lỗi không xác định'}`);
    } finally {
      setDeletingInventory(false);
    }
  };

  const handleFetchDispatchReport = async () => {
    if (!fromDate || !toDate) {
      alert('Vui lòng chọn đầy đủ ngày bắt đầu và ngày kết thúc!');
      return;
    }

    // Convert dates to ISO string format
    const fromDateISO = new Date(fromDate).toISOString();
    const toDateISO = new Date(toDate).toISOString();

    setLoadingReport(true);
    setReportError(null);
    try {
      const response = await inventoryService.getDispatchReport(fromDateISO, toDateISO);
      setDispatchReport(response.data);
      setShowDispatchReport(true);
      console.log('📊 Dispatch report:', response.data);
    } catch (err) {
      console.error('Lỗi khi lấy báo cáo chuyển hàng:', err);
      setReportError(`Không thể tải báo cáo: ${err instanceof Error ? err.message : 'Lỗi không xác định'}`);
    } finally {
      setLoadingReport(false);
    }
  };

  // Format price
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  };

  // Format date
  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return new Intl.DateTimeFormat('vi-VN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
      }).format(date);
    } catch {
      return dateString;
    }
  };

  // Translate column names to Vietnamese
  const translateColumnName = (key: string): string => {
    const translations: Record<string, string> = {
      'vehicleId': 'Mã xe',
      'vehicle_Id': 'Mã xe',
      'VehicleId': 'Mã xe',
      'VEHICLE_ID': 'Mã xe',
      'type': 'Loại xe',
      'Type': 'Loại xe',
      'TYPE': 'Loại xe',
      'model': 'Mẫu xe',
      'Model': 'Mẫu xe',
      'MODEL': 'Mẫu xe',
      'version': 'Phiên bản',
      'Version': 'Phiên bản',
      'VERSION': 'Phiên bản',
      'color': 'Màu sắc',
      'Color': 'Màu sắc',
      'COLOR': 'Màu sắc',
      'companyName': 'Tên đại lý',
      'company_Name': 'Tên đại lý',
      'CompanyName': 'Tên đại lý',
      'COMPANY_NAME': 'Tên đại lý',
      'dispatchedQuantity': 'Số lượng xuất',
      'dispatched_Quantity': 'Số lượng xuất',
      'DispatchedQuantity': 'Số lượng xuất',
      'DISPATCHED_QUANTITY': 'Số lượng xuất',
      'remainingInStock': 'Tồn kho',
      'remaining_In_Stock': 'Tồn kho',
      'RemainingInStock': 'Tồn kho',
      'REMAINING_IN_STOCK': 'Tồn kho',
      'consumptionRate': 'Tỷ lệ tiêu thụ',
      'consumption_Rate': 'Tỷ lệ tiêu thụ',
      'ConsumptionRate': 'Tỷ lệ tiêu thụ',
      'CONSUMPTION_RATE': 'Tỷ lệ tiêu thụ',
      'status': 'Trạng thái',
      'Status': 'Trạng thái',
      'STATUS': 'Trạng thái',
      'quantity': 'Số lượng',
      'Quantity': 'Số lượng',
      'QUANTITY': 'Số lượng',
      'price': 'Giá',
      'Price': 'Giá',
      'PRICE': 'Giá'
    };

    // Check if there's a direct translation
    if (translations[key]) {
      return translations[key];
    }

    // Otherwise, format the key (split camelCase and capitalize)
    return key
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, (str) => str.toUpperCase())
      .trim();
  };

  // Render report data in a beautiful way
  const renderReportData = (data: DispatchReport) => {
    // If data is an array
    if (Array.isArray(data)) {
      if (data.length === 0) {
        return (
          <div className="text-center py-8">
            <Package className="w-16 h-16 text-gray-300 mx-auto mb-2" />
            <p className="text-gray-500">Không có dữ liệu trong khoảng thời gian này</p>
          </div>
        );
      }

      // Get keys from first item and filter out dealerId columns
      const allKeys = Object.keys(data[0] || {});
      const keys = allKeys.filter(key => 
        !key.toLowerCase().includes('dealerid') && 
        key.toLowerCase() !== 'dealer_id'
      );
      
      return (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gradient-to-r from-blue-600 to-purple-600">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-bold text-white uppercase tracking-wider">
                  #
                </th>
                {keys.map((key) => (
                  <th
                    key={key}
                    className="px-4 py-3 text-left text-xs font-bold text-white uppercase tracking-wider"
                  >
                    {translateColumnName(key)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {data.map((item, index) => (
                <tr key={index} className="hover:bg-blue-50 transition-colors">
                  <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                    {index + 1}
                  </td>
                  {keys.map((key) => {
                    const value = item[key];
                    const formattedValue = 
                      typeof value === 'number' && (key.toLowerCase().includes('price') || key.toLowerCase().includes('amount') || key.toLowerCase().includes('total'))
                        ? formatPrice(value)
                        : typeof value === 'string' && (value.includes('T') || value.match(/^\d{4}-\d{2}-\d{2}/))
                        ? formatDate(value)
                        : value?.toString() || 'N/A';
                    
                    return (
                      <td key={key} className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">
                        {formattedValue}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
          <div className="bg-blue-50 px-4 py-3 border-t border-blue-200">
            <p className="text-sm text-blue-800 font-semibold">
              Tổng số bản ghi: <span className="text-blue-600">{data.length}</span>
            </p>
          </div>
        </div>
      );
    }

    // If data is an object
    if (typeof data === 'object' && data !== null) {
      const entries = Object.entries(data);
      
      // Check if it's a summary/statistics object
      const isSummary = entries.some(([key]) => 
        key.toLowerCase().includes('total') || 
        key.toLowerCase().includes('summary') || 
        key.toLowerCase().includes('stat')
      );

      if (isSummary) {
        // Display as cards
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {entries.map(([key, value]) => {
              const isNumber = typeof value === 'number';
              const isDate = typeof value === 'string' && (value.includes('T') || value.match(/^\d{4}-\d{2}-\d{2}/));
              
              return (
                <div
                  key={key}
                  className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg p-4 border-2 border-blue-200 hover:shadow-lg transition-shadow"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-semibold text-gray-600 uppercase tracking-wide">
                      {key.replace(/([A-Z])/g, ' $1').trim()}
                    </span>
                  </div>
                  <div className="text-2xl font-bold text-blue-600">
                    {isNumber && (key.toLowerCase().includes('price') || key.toLowerCase().includes('amount') || key.toLowerCase().includes('total'))
                      ? formatPrice(value)
                      : isDate
                      ? formatDate(value)
                      : value?.toString() || 'N/A'}
                  </div>
                </div>
              );
            })}
          </div>
        );
      }

      // Display as key-value pairs
      return (
        <div className="space-y-3">
          {entries.map(([key, value]) => {
            const isArray = Array.isArray(value);
            const isObject = typeof value === 'object' && value !== null && !isArray;
            const isNumber = typeof value === 'number';
            const isDate = typeof value === 'string' && (value.includes('T') || value.match(/^\d{4}-\d{2}-\d{2}/));
            const isPrice = isNumber && (key.toLowerCase().includes('price') || key.toLowerCase().includes('amount') || key.toLowerCase().includes('total'));

            return (
              <div
                key={key}
                className="flex items-start justify-between p-4 bg-gradient-to-r from-gray-50 to-blue-50 rounded-lg border border-gray-200 hover:border-blue-300 transition-colors"
              >
                <div className="flex-1">
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    {key.replace(/([A-Z])/g, ' $1').replace(/^./, (str) => str.toUpperCase()).trim()}
                  </label>
                  <div className="text-base text-gray-900">
                    {isArray ? (
                      <span className="text-blue-600 font-semibold">{value.length} mục</span>
                    ) : isObject ? (
                      <span className="text-purple-600 font-semibold">Object ({Object.keys(value).length} trường)</span>
                    ) : isPrice ? (
                      <span className="text-green-600 font-bold">{formatPrice(value)}</span>
                    ) : isDate ? (
                      <span className="text-blue-600">{formatDate(value)}</span>
                    ) : (
                      <span>{value?.toString() || 'N/A'}</span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      );
    }

    // Fallback to JSON for primitive values
    return (
      <div className="bg-gray-50 p-4 rounded-lg">
        <pre className="text-sm text-gray-700 whitespace-pre-wrap">
          {JSON.stringify(data, null, 2)}
        </pre>
      </div>
    );
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
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setCreateFormData({ vehicleId: '', quantity: 0 });
                  setShowCreateModal(true);
                }}
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 font-semibold"
              >
                <Plus className="w-5 h-5" />
                Thêm tồn kho
              </button>
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
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Dispatch Report Section */}
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg shadow-md p-6 mb-6 border-2 border-blue-200">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="bg-blue-600 p-3 rounded-lg">
                <FileText className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Báo cáo Dispatch</h2>
                <p className="text-gray-600 text-sm">Xem báo cáo xuất kho theo khoảng thời gian</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                <Calendar className="w-4 h-4 inline mr-1" />
                Từ ngày
              </label>
              <input
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                <Calendar className="w-4 h-4 inline mr-1" />
                Đến ngày
              </label>
              <input
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                min={fromDate}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div className="flex items-end">
              <button
                onClick={handleFetchDispatchReport}
                disabled={loadingReport || !fromDate || !toDate}
                className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors shadow-lg disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {loadingReport ? (
                  <>
                    <RefreshCw className="w-5 h-5 animate-spin" />
                    Đang tải...
                  </>
                ) : (
                  <>
                    <Download className="w-5 h-5" />
                    Tải báo cáo
                  </>
                )}
              </button>
            </div>
          </div>

          {reportError && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
              <p className="text-red-800">{reportError}</p>
            </div>
          )}

          {showDispatchReport && dispatchReport && (
            <div className="mt-4 bg-white rounded-lg shadow-xl p-6 border-2 border-blue-300 animate-fadeIn">
              <div className="flex items-center justify-between mb-6 pb-4 border-b-2 border-blue-200">
                <div className="flex items-center gap-3">
                  <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-2 rounded-lg">
                    <FileText className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">Kết quả báo cáo Dispatch</h3>
                    <p className="text-sm text-gray-500">
                      {fromDate && toDate && (
                        <>Từ {new Date(fromDate).toLocaleDateString('vi-VN')} đến {new Date(toDate).toLocaleDateString('vi-VN')}</>
                      )}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setShowDispatchReport(false);
                    setDispatchReport(null);
                  }}
                  className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-2 rounded-lg transition-colors"
                  title="Đóng"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="max-h-[600px] overflow-y-auto">
                {renderReportData(dispatchReport)}
              </div>
            </div>
          )}
        </div>

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
                          {(() => {
                            // Sử dụng finalPrice từ API nếu có, nếu không thì dùng price
                            const displayFinalPrice = item.finalPrice ?? item.price;
                            const hasDiscount = item.finalPrice && item.finalPrice < item.price && item.discountId;
                            
                            if (hasDiscount && item.discountId) {
                              const discount = vehicleDiscounts.get(item.discountId);
                              return (
                                <div className="space-y-1">
                                  <div className="text-xs line-through text-gray-400">{formatPrice(item.price)}</div>
                                  <div className="text-sm text-red-600 font-bold">{formatPrice(displayFinalPrice)}</div>
                                  {discount && (
                                    <div className="text-xs text-red-500">
                                      Giảm {discount.discountType.toLowerCase() === 'percent' || discount.discountType.toLowerCase() === 'percentage' 
                                        ? `${discount.discountValue}%` 
                                        : formatPrice(discount.discountValue)}
                                    </div>
                                  )}
                                </div>
                              );
                            }
                            return formatPrice(item.price);
                          })()}
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
                          {(() => {
                            // Sử dụng finalPrice từ API nếu có
                            const finalPrice = item.finalPrice ?? item.price;
                            return formatPrice(finalPrice * item.quantity);
                          })()}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleViewDetail(item.inventoryId)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Xem chi tiết"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleOpenEditModal(item.inventoryId)}
                            className="p-2 text-yellow-600 hover:bg-yellow-50 rounded-lg transition-colors"
                            title="Chỉnh sửa"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              setInventoryToDelete(item);
                              setShowDeleteModal(true);
                            }}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Xóa tồn kho"
                          >
                            <Trash2 className="w-4 h-4" />
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
                  {(() => {
                    // Sử dụng finalPrice từ API nếu có
                    const displayFinalPrice = selectedInventory.finalPrice ?? selectedInventory.price;
                    const hasDiscount = selectedInventory.finalPrice && selectedInventory.finalPrice < selectedInventory.price && selectedInventory.discountId;
                    
                    if (hasDiscount && selectedInventory.discountId) {
                      const discount = vehicleDiscounts.get(selectedInventory.discountId);
                      return (
                        <div className="space-y-1">
                          <div className="text-sm line-through text-gray-400">{formatPrice(selectedInventory.price)}</div>
                          <div className="text-lg font-bold text-red-600">{formatPrice(displayFinalPrice)}</div>
                          {discount && (
                            <div className="text-xs text-red-500">
                              Giảm {discount.discountType.toLowerCase() === 'percent' || discount.discountType.toLowerCase() === 'percentage' 
                                ? `${discount.discountValue}%` 
                                : formatPrice(discount.discountValue)}
                            </div>
                          )}
                        </div>
                      );
                    }
                    return <p className="text-lg font-bold text-gray-900">{formatPrice(selectedInventory.price)}</p>;
                  })()}
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
                  {(() => {
                    // Sử dụng finalPrice từ API nếu có
                    const finalPrice = selectedInventory.finalPrice ?? selectedInventory.price;
                    return (
                      <p className="text-lg font-bold text-gray-900">
                        {formatPrice(finalPrice * selectedInventory.quantity)}
                      </p>
                    );
                  })()}
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

      {/* Create Inventory Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl transform transition-all">
            {/* Header */}
            <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white p-6 rounded-t-2xl">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-2xl font-bold">Thêm tồn kho mới</h2>
                  <p className="text-purple-100 text-sm mt-1">Tạo tồn kho cho xe mới</p>
                </div>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="text-white hover:text-purple-200 transition-colors p-2 hover:bg-white hover:bg-opacity-10 rounded-lg"
                  disabled={creatingInventory}
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6">
              {/* Vehicle Selection */}
              <div className="space-y-2">
                <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700">
                  <Car className="w-5 h-5 text-purple-600" />
                  <span>Chọn xe *</span>
                </label>
                <select
                  value={createFormData.vehicleId}
                  onChange={(e) => setCreateFormData({ ...createFormData, vehicleId: e.target.value })}
                  className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:border-purple-500 focus:ring-2 focus:ring-purple-100 transition-all duration-200 bg-gray-50 focus:bg-white"
                  required
                >
                  <option value="">-- Chọn xe --</option>
                  {vehicles.map((vehicle) => (
                    <option key={vehicle.vehicleId || vehicle.id} value={vehicle.vehicleId || vehicle.id}>
                      {vehicle.model} - {vehicle.version} ({vehicle.color}) - ID: {vehicle.vehicleId || vehicle.id}
                    </option>
                  ))}
                </select>
                {vehicles.length === 0 && (
                  <p className="text-xs text-gray-500">Đang tải danh sách xe...</p>
                )}
              </div>

              {/* Quantity Input */}
              <div className="space-y-2">
                <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700">
                  <Package className="w-5 h-5 text-purple-600" />
                  <span>Số lượng *</span>
                </label>
                <input
                  type="number"
                  min="0"
                  required
                  value={createFormData.quantity === 0 ? '' : createFormData.quantity}
                  onChange={(e) => {
                    const value = parseInt(e.target.value) || 0;
                    setCreateFormData({ ...createFormData, quantity: value });
                  }}
                  className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:border-purple-500 focus:ring-2 focus:ring-purple-100 transition-all duration-200 bg-gray-50 focus:bg-white [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  placeholder="Nhập số lượng tồn kho"
                />
                <p className="text-xs text-gray-500">Số lượng phải lớn hơn hoặc bằng 0</p>
              </div>

              {/* Info Box */}
              <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-4 border border-purple-200">
                <h3 className="text-sm font-semibold text-gray-700 mb-2 flex items-center space-x-2">
                  <FileText className="h-4 w-4 text-purple-600" />
                  <span>Thông tin</span>
                </h3>
                <p className="text-sm text-gray-600">
                  Tạo tồn kho mới sẽ thêm xe vào hệ thống quản lý tồn kho. Bạn có thể cập nhật số lượng sau khi tạo.
                </p>
              </div>
            </div>

            {/* Footer */}
            <div className="bg-gray-50 px-6 py-4 flex justify-end gap-3 rounded-b-2xl border-t border-gray-200">
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  setCreateFormData({ vehicleId: '', quantity: 0 });
                }}
                className="px-6 py-3 border-2 border-gray-300 rounded-xl text-gray-700 hover:bg-white hover:border-gray-400 transition-all duration-200 font-medium"
                disabled={creatingInventory}
              >
                Hủy
              </button>
              <button
                onClick={handleCreateInventory}
                disabled={creatingInventory || !createFormData.vehicleId || createFormData.quantity < 0}
                className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 transition-all duration-200 font-medium shadow-lg"
              >
                {creatingInventory && (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                )}
                <Plus className="w-4 h-4" />
                <span>{creatingInventory ? 'Đang tạo...' : 'Tạo tồn kho'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Inventory Modal */}
      {showDeleteModal && inventoryToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl transform transition-all">
            {/* Header */}
            <div className="bg-gradient-to-r from-red-600 to-red-700 text-white p-6 rounded-t-2xl">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-2xl font-bold">Xóa tồn kho</h2>
                  <p className="text-red-100 text-sm mt-1">Xác nhận xóa tồn kho này?</p>
                </div>
                <button
                  onClick={() => {
                    setShowDeleteModal(false);
                    setInventoryToDelete(null);
                  }}
                  className="text-white hover:text-red-200 transition-colors p-2 hover:bg-white hover:bg-opacity-10 rounded-lg"
                  disabled={deletingInventory}
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-6">
              <div className="flex items-center justify-center mb-4">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                  <Trash2 className="w-8 h-8 text-red-600" />
                </div>
              </div>
              
              <div className="text-center mb-6">
                <p className="text-gray-700 mb-4">
                  Bạn có chắc chắn muốn xóa tồn kho này?
                </p>
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <div className="space-y-2 text-left">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">ID Tồn kho:</span>
                      <span className="text-sm font-semibold text-gray-900">#{inventoryToDelete.inventoryId}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Model:</span>
                      <span className="text-sm font-semibold text-gray-900">{inventoryToDelete.model}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Màu sắc:</span>
                      <span className="text-sm font-semibold text-gray-900">{inventoryToDelete.color}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Số lượng:</span>
                      <span className="text-sm font-semibold text-gray-900">{inventoryToDelete.quantity}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Giá:</span>
                      <span className="text-sm font-semibold text-gray-900">{formatPrice(inventoryToDelete.price)}</span>
                    </div>
                  </div>
                </div>
                <p className="text-red-600 text-sm font-semibold mt-4">
                  ⚠️ Hành động này không thể hoàn tác!
                </p>
              </div>
            </div>

            {/* Footer */}
            <div className="bg-gray-50 px-6 py-4 flex justify-end gap-3 rounded-b-2xl border-t border-gray-200">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setInventoryToDelete(null);
                }}
                className="px-6 py-3 border-2 border-gray-300 rounded-xl text-gray-700 hover:bg-white hover:border-gray-400 transition-all duration-200 font-medium"
                disabled={deletingInventory}
              >
                Hủy
              </button>
              <button
                onClick={handleDeleteInventory}
                disabled={deletingInventory}
                className="px-6 py-3 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-xl hover:from-red-700 hover:to-red-800 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 transition-all duration-200 font-medium shadow-lg"
              >
                {deletingInventory && (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                )}
                <Trash2 className="w-4 h-4" />
                <span>{deletingInventory ? 'Đang xóa...' : 'Xóa tồn kho'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

