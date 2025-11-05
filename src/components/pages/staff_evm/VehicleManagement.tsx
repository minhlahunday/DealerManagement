import React, { useState, useEffect } from 'react';
import { Search, Car, Plus, Edit, Trash2, X, Eye, RefreshCw, AlertCircle, DollarSign, Package, Image as ImageIcon, Gauge, Battery, Zap, Info } from 'lucide-react';
import { vehicleService } from '../../../services/vehicleService';
import { inventoryService } from '../../../services/inventoryService';
import { Vehicle } from '../../../types';
import { useAuth } from '../../../contexts/AuthContext';

interface VehicleForm {
  model: string;
  version: string;
  color: string;
  price: number;
  type: string;
  status: string;
  distance: string;
  timecharging: string;
  speed: string;
  image1: string;
  image2: string;
  image3: string;
  stock: number;
  description: string;
}

export const VehicleManagement: React.FC = () => {
  const { user } = useAuth();
  const isStaffEVM = user?.role === 'evm_staff';
  
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [inventoryMap, setInventoryMap] = useState<Map<number, number>>(new Map()); // vehicleId -> quantity
  
  // Create/Edit Modal States
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [vehicleToDelete, setVehicleToDelete] = useState<Vehicle | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [formData, setFormData] = useState<VehicleForm>({
    model: '',
    version: '',
    color: '',
    price: 0,
    type: 'Ô tô điện',
    status: 'available',
    distance: '',
    timecharging: '',
    speed: '',
    image1: '',
    image2: '',
    image3: '',
    stock: 0,
    description: ''
  });

  // Fetch vehicles on mount
  useEffect(() => {
    fetchVehicles();
    fetchInventory();
  }, []);

  // Fetch inventory data
  const fetchInventory = async () => {
    try {
      const response = await inventoryService.getInventory();
      console.log('📦 Inventory loaded:', response.data);
      
      // Tạo map vehicleId -> quantity
      const map = new Map<number, number>();
      if (response.data && Array.isArray(response.data)) {
        response.data.forEach((item) => {
          if (item.vehicleId && item.quantity !== undefined) {
            map.set(item.vehicleId, item.quantity);
          }
        });
      }
      setInventoryMap(map);
      console.log('📊 Inventory map:', Array.from(map.entries()));
    } catch (err) {
      console.error('Lỗi khi lấy tồn kho:', err);
      // Không hiển thị lỗi cho user, chỉ log
    }
  };

  const fetchVehicles = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await vehicleService.getVehicles();
      console.log('🚗 Vehicles loaded:', response.data);
      setVehicles(response.data);
    } catch (err) {
      console.error('Lỗi khi lấy danh sách xe:', err);
      setError(`Không thể tải danh sách xe: ${err instanceof Error ? err.message : 'Lỗi không xác định'}`);
    } finally {
      setLoading(false);
    }
  };

  // Search vehicles
  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      fetchVehicles();
      return;
    }
    
    setLoading(true);
    setError(null);
    try {
      const response = await vehicleService.searchVehicles(searchTerm);
      setVehicles(response.data);
    } catch (err) {
      console.error('Lỗi khi tìm kiếm xe:', err);
      setError(`Không thể tìm kiếm: ${err instanceof Error ? err.message : 'Lỗi không xác định'}`);
    } finally {
      setLoading(false);
    }
  };

  // View vehicle detail
  const handleViewVehicle = async (vehicle: Vehicle) => {
    setLoadingDetail(true);
    setShowDetailModal(true);
    try {
      const response = await vehicleService.getVehicleById(vehicle.vehicleId?.toString() || vehicle.id);
      setSelectedVehicle(response.data);
      console.log('👁️ Viewing vehicle detail:', response.data);
    } catch (err) {
      console.error('Lỗi khi lấy chi tiết xe:', err);
      alert(`Không thể tải chi tiết: ${err instanceof Error ? err.message : 'Lỗi không xác định'}`);
      setShowDetailModal(false);
    } finally {
      setLoadingDetail(false);
    }
  };

  // Open create modal
  const handleOpenCreateModal = () => {
    setFormData({
      model: '',
      version: '',
      color: '',
      price: 0,
      type: 'Ô tô điện',
      status: 'available',
      distance: '',
      timecharging: '',
      speed: '',
      image1: '',
      image2: '',
      image3: '',
      stock: 0,
      description: ''
    });
    setShowCreateModal(true);
  };

  // Open edit modal
  const handleOpenEditModal = (vehicle: Vehicle) => {
    setFormData({
      model: vehicle.model,
      version: vehicle.version,
      color: vehicle.color,
      price: vehicle.price,
      type: vehicle.type || 'Ô tô điện',
      status: vehicle.status || 'available',
      distance: vehicle.distance || '',
      timecharging: vehicle.timecharging || '',
      speed: vehicle.speed || '',
      image1: vehicle.image1 || '',
      image2: vehicle.image2 || '',
      image3: vehicle.image3 || '',
      stock: vehicle.stock || 0,
      description: vehicle.description || ''
    });
    setSelectedVehicle(vehicle);
    setShowEditModal(true);
  };

  // Create vehicle
  const handleCreateVehicle = async () => {
    try {
      setLoading(true);
      await vehicleService.createVehicle(formData);
      alert('✅ Tạo xe mới thành công!');
      setShowCreateModal(false);
      fetchVehicles();
      fetchInventory(); // Refresh inventory sau khi tạo
    } catch (err) {
      console.error('Lỗi khi tạo xe:', err);
      alert(`❌ Không thể tạo xe: ${err instanceof Error ? err.message : 'Lỗi không xác định'}`);
    } finally {
      setLoading(false);
    }
  };

  // Update vehicle
  const handleUpdateVehicle = async () => {
    if (!selectedVehicle) return;
    
    try {
      setLoading(true);
      await vehicleService.updateVehicle(
        selectedVehicle.vehicleId || selectedVehicle.id, 
        formData
      );
      alert('✅ Cập nhật xe thành công!');
      setShowEditModal(false);
      fetchVehicles();
      fetchInventory(); // Refresh inventory sau khi cập nhật
    } catch (err) {
      console.error('Lỗi khi cập nhật xe:', err);
      alert(`❌ Không thể cập nhật xe: ${err instanceof Error ? err.message : 'Lỗi không xác định'}`);
    } finally {
      setLoading(false);
    }
  };

  // Open delete modal
  const handleOpenDeleteModal = (vehicle: Vehicle) => {
    setVehicleToDelete(vehicle);
    setDeleteError(null); // Clear previous error
    setShowDeleteModal(true);
  };

  // Delete vehicle
  const handleDeleteVehicle = async () => {
    if (!vehicleToDelete) return;
    
    setDeleteError(null); // Clear previous error
    setLoading(true);
    
    try {
      const vehicleId = vehicleToDelete.vehicleId || vehicleToDelete.id;
      await vehicleService.deleteVehicle(vehicleId);
      console.log('✅ Vehicle deleted successfully, refreshing data...');
      
      // Close modal first
      setShowDeleteModal(false);
      setVehicleToDelete(null);
      setDeleteError(null);
      
      // Show success message
      alert('✅ Xóa xe thành công!');
      
      // Refresh vehicles list
      await fetchVehicles();
      console.log('✅ Vehicles refreshed');
      
      // Refresh inventory with a small delay to ensure backend has processed
      setTimeout(async () => {
        await fetchInventory();
        console.log('✅ Inventory refreshed after vehicle deletion');
      }, 500);
      
    } catch (err) {
      console.error('Lỗi khi xóa xe:', err);
      const errorMessage = err instanceof Error ? err.message : 'Lỗi không xác định';
      
      // Check if error message indicates inventory issue
      const hasInventoryIssue = errorMessage.toLowerCase().includes('inventory') || 
                                errorMessage.toLowerCase().includes('tồn kho') ||
                                errorMessage.toLowerCase().includes('kho') ||
                                errorMessage.toLowerCase().includes('còn') ||
                                errorMessage.toLowerCase().includes('stock');
      
      if (hasInventoryIssue) {
        setDeleteError(`⚠️ ${errorMessage}\n\n💡 Vui lòng xóa tồn kho của xe này trước khi xóa xe.`);
      } else {
        setDeleteError(`❌ ${errorMessage}`);
      }
    } finally {
      setLoading(false);
    }
  };

  // Format price for display
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
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

  // Get status badge color - dựa trên tồn kho thực tế
  const getStatusBadge = (status: string, vehicleId?: number | string) => {
    // Kiểm tra tồn kho thực tế từ inventory
    let actualQuantity = 0;
    if (vehicleId) {
      const id = typeof vehicleId === 'string' ? parseInt(vehicleId) : vehicleId;
      actualQuantity = inventoryMap.get(id) || 0;
    }
    
    // Nếu có tồn kho > 0, hiển thị "Còn hàng"
    if (actualQuantity > 0) {
      return (
        <span className="px-2 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800">
          Còn hàng ({actualQuantity})
        </span>
      );
    }
    
    // Nếu không có tồn kho hoặc quantity = 0, hiển thị "Hết hàng"
    if (actualQuantity === 0 && inventoryMap.size > 0) {
      // Có dữ liệu inventory nhưng quantity = 0
      return (
        <span className="px-2 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-800">
          Hết hàng
        </span>
      );
    }
    
    // Fallback về status từ vehicle nếu chưa có dữ liệu inventory
    const statusMap: Record<string, { label: string; className: string }> = {
      'available': { label: 'Có sẵn', className: 'bg-green-100 text-green-800' },
      'out_of_stock': { label: 'Hết hàng', className: 'bg-red-100 text-red-800' },
      'discontinued': { label: 'Ngừng sản xuất', className: 'bg-gray-100 text-gray-800' },
    };
    
    const statusInfo = statusMap[status] || { label: status, className: 'bg-blue-100 text-blue-800' };
    
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${statusInfo.className}`}>
        {statusInfo.label}
      </span>
    );
  };

  // Filter vehicles based on search term
  const filteredVehicles = vehicles.filter(vehicle =>
    vehicle.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
    vehicle.version.toLowerCase().includes(searchTerm.toLowerCase()) ||
    vehicle.color.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!isStaffEVM) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-2">
            Truy cập bị từ chối
          </h2>
          <p className="text-gray-600 text-center">
            Bạn không có quyền truy cập trang này. Chỉ staff EVM mới có thể quản lý xe.
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
                <Car className="w-8 h-8 text-blue-600" />
                Quản lý Sản phẩm Xe
              </h1>
              <p className="text-gray-600 mt-1">Quản lý danh sách xe và thông tin sản phẩm</p>
            </div>
            <button
              onClick={handleOpenCreateModal}
              className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors shadow-lg"
            >
              <Plus className="w-5 h-5" />
              Thêm xe mới
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search and Filter Bar */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Tìm kiếm theo model, version, màu sắc..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <button
              onClick={handleSearch}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              <Search className="w-5 h-5" />
              Tìm kiếm
            </button>
            <button
              onClick={fetchVehicles}
              className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors flex items-center gap-2"
            >
              <RefreshCw className="w-5 h-5" />
              Làm mới
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Tổng số xe</p>
                <p className="text-3xl font-bold text-gray-900">{vehicles.length}</p>
              </div>
              <Car className="w-12 h-12 text-blue-500" />
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Xe có sẵn</p>
                <p className="text-3xl font-bold text-green-600">
                  {Array.from(inventoryMap.values()).filter(qty => qty > 0).length || vehicles.filter(v => v.status === 'available').length}
                </p>
              </div>
              <Package className="w-12 h-12 text-green-500" />
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Tổng giá trị kho</p>
                <p className="text-2xl font-bold text-blue-600">
                  {formatPrice(vehicles.reduce((sum, v) => sum + (v.price * (v.stock || 0)), 0))}
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

        {/* Vehicle Table */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Hình ảnh
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Model
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Version
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Màu sắc
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Giá
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Loại
                  </th>
                  {/* <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tồn kho
                  </th> */}
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Trạng thái
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
                      <RefreshCw className="w-8 h-8 text-blue-600 animate-spin mx-auto mb-2" />
                      <p className="text-gray-600">Đang tải dữ liệu...</p>
                    </td>
                  </tr>
                ) : filteredVehicles.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-12 text-center">
                      <Car className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                      <p className="text-gray-600">Không có xe nào</p>
                    </td>
                  </tr>
                ) : (
                  filteredVehicles.map((vehicle) => (
                    <tr key={vehicle.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <img
                          src={vehicle.images?.[0] || vehicle.image1 || '/images/default-car.jpg'}
                          alt={vehicle.model}
                          className="w-16 h-16 object-cover rounded-lg"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = '/images/default-car.jpg';
                          }}
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{vehicle.model}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{vehicle.version}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{vehicle.color}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-semibold text-gray-900">
                          {formatPrice(vehicle.price)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{vehicle.type || 'N/A'}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(vehicle.status || 'available', vehicle.vehicleId || vehicle.id)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleViewVehicle(vehicle)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Xem chi tiết"
                          >
                            <Eye className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => handleOpenEditModal(vehicle)}
                            className="p-2 text-yellow-600 hover:bg-yellow-50 rounded-lg transition-colors"
                            title="Chỉnh sửa"
                          >
                            <Edit className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => handleOpenDeleteModal(vehicle)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Xóa"
                          >
                            <Trash2 className="w-5 h-5" />
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
      </div>

      {/* Detail Modal - Improved */}
      {showDetailModal && selectedVehicle && (
        <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-5xl w-full max-h-[95vh] overflow-hidden">
            {/* Header */}
            <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-5 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <Car className="w-7 h-7 text-white" />
                <h2 className="text-2xl font-bold text-white">Chi tiết xe</h2>
              </div>
              <button
                onClick={() => setShowDetailModal(false)}
                className="p-2 hover:bg-white/20 rounded-lg transition-colors"
              >
                <X className="w-6 h-6 text-white" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto max-h-[calc(95vh-80px)]">
              {loadingDetail ? (
                <div className="text-center py-20">
                  <RefreshCw className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
                  <p className="text-gray-600 text-lg">Đang tải thông tin...</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Main Image Gallery */}
                  <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-6">
                    <div className="flex items-center gap-2 mb-4">
                      <ImageIcon className="w-5 h-5 text-gray-700" />
                      <h3 className="text-lg font-semibold text-gray-900">Hình ảnh sản phẩm</h3>
                    </div>
                    {(() => {
                      const images = [selectedVehicle.image1, selectedVehicle.image2, selectedVehicle.image3]
                        .filter(img => img && img.trim() !== '');
                      return images.length > 0 ? (
                        <>
                          <div className="mb-4">
                            <img
                              src={images[selectedImageIndex] || '/images/default-car.jpg'}
                              alt={selectedVehicle.model}
                              className="w-full h-96 object-cover rounded-xl shadow-lg"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.src = '/images/default-car.jpg';
                              }}
                            />
                          </div>
                          <div className="grid grid-cols-3 gap-3">
                            {images.map((img, index) => (
                              <button
                                key={index}
                                onClick={() => setSelectedImageIndex(index)}
                                className={`relative rounded-lg overflow-hidden transition-all ${
                                  selectedImageIndex === index 
                                    ? 'ring-4 ring-blue-500 scale-105' 
                                    : 'hover:scale-105 opacity-70 hover:opacity-100'
                                }`}
                              >
                                <img
                                  src={img || '/images/default-car.jpg'}
                                  alt={`${selectedVehicle.model} - ${index + 1}`}
                                  className="w-full h-24 object-cover"
                                  onError={(e) => {
                                    const target = e.target as HTMLImageElement;
                                    target.src = '/images/default-car.jpg';
                                  }}
                                />
                              </button>
                            ))}
                          </div>
                        </>
                      ) : (
                        <div className="text-center py-12">
                          <ImageIcon className="w-16 h-16 text-gray-400 mx-auto mb-2" />
                          <p className="text-gray-500">Không có hình ảnh</p>
                        </div>
                      );
                    })()}
                  </div>

                  {/* Basic Info Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-blue-50 rounded-xl p-5 border border-blue-100">
                      <div className="flex items-center gap-3 mb-3">
                        <Car className="w-6 h-6 text-blue-600" />
                        <h3 className="text-lg font-semibold text-gray-900">Thông tin cơ bản</h3>
                      </div>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600">Model:</span>
                          <span className="font-semibold text-gray-900">{selectedVehicle.model}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600">Phiên bản:</span>
                          <span className="font-semibold text-gray-900">{selectedVehicle.version}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600">Màu sắc:</span>
                          <span className="font-semibold text-gray-900">{selectedVehicle.color}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600">Loại xe:</span>
                          <span className="font-semibold text-gray-900">{selectedVehicle.type || 'N/A'}</span>
                        </div>
                      </div>
                    </div>

                    <div className="bg-green-50 rounded-xl p-5 border border-green-100">
                      {/* <div className="flex items-center gap-3 mb-3">
                        <DollarSign className="w-6 h-6 text-green-600" />
                        <h3 className="text-lg font-semibold text-gray-900">Giá & Tồn kho</h3>
                      </div> */}
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600">Giá bán:</span>
                          <span className="font-bold text-xl text-green-600">{formatPrice(selectedVehicle.price)}</span>
                        </div>
                        {/* <div className="flex justify-between items-center">
                          <span className="text-gray-600">Tồn kho:</span>
                          <span className="font-semibold text-gray-900">{selectedVehicle.stock || 0} xe</span>
                        </div> */}
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600">Trạng thái:</span>
                          <div>{getStatusBadge(selectedVehicle.status || 'available', selectedVehicle.vehicleId || selectedVehicle.id)}</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Specifications */}
                  <div className="bg-purple-50 rounded-xl p-5 border border-purple-100">
                    <div className="flex items-center gap-3 mb-4">
                      <Gauge className="w-6 h-6 text-purple-600" />
                      <h3 className="text-lg font-semibold text-gray-900">Thông số kỹ thuật</h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="bg-white rounded-lg p-4 text-center">
                        <Battery className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                        <p className="text-sm text-gray-600 mb-1">Quãng đường</p>
                        <p className="text-lg font-bold text-gray-900">{selectedVehicle.distance || 'N/A'}</p>
                      </div>
                      <div className="bg-white rounded-lg p-4 text-center">
                        <Zap className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                        <p className="text-sm text-gray-600 mb-1">Thời gian sạc</p>
                        <p className="text-lg font-bold text-gray-900">{selectedVehicle.timecharging || 'N/A'}</p>
                      </div>
                      <div className="bg-white rounded-lg p-4 text-center">
                        <Gauge className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                        <p className="text-sm text-gray-600 mb-1">Tốc độ tối đa</p>
                        <p className="text-lg font-bold text-gray-900">{selectedVehicle.speed || 'N/A'}</p>
                      </div>
                    </div>
                  </div>

                  {/* Description */}
                  {selectedVehicle.description && (
                    <div className="bg-gray-50 rounded-xl p-5 border border-gray-200">
                      <div className="flex items-center gap-3 mb-3">
                        <Info className="w-6 h-6 text-gray-700" />
                        <h3 className="text-lg font-semibold text-gray-900">Mô tả chi tiết</h3>
                      </div>
                      <p className="text-gray-700 leading-relaxed">{selectedVehicle.description}</p>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex gap-3 pt-4">
                    <button
                      onClick={() => {
                        setShowDetailModal(false);
                        handleOpenEditModal(selectedVehicle);
                      }}
                      className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 font-semibold"
                    >
                      <Edit className="w-5 h-5" />
                      Chỉnh sửa
                    </button>
                    <button
                      onClick={() => setShowDetailModal(false)}
                      className="flex-1 bg-gray-200 text-gray-800 px-6 py-3 rounded-lg hover:bg-gray-300 transition-colors font-semibold"
                    >
                      Đóng
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Create Modal - Improved */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[95vh] overflow-hidden flex flex-col">
            {/* Header */}
            <div className="flex-shrink-0 bg-gradient-to-r from-green-600 to-green-700 px-6 py-5 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <Plus className="w-7 h-7 text-white" />
                <h2 className="text-2xl font-bold text-white">Thêm xe mới</h2>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-2 hover:bg-white/20 rounded-lg transition-colors"
              >
                <X className="w-6 h-6 text-white" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              <div className="space-y-6">
                {/* Basic Info Section */}
                <div className="bg-blue-50 rounded-xl p-5 border border-blue-100">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Car className="w-5 h-5 text-blue-600" />
                    Thông tin cơ bản
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Model *</label>
                      <input
                        type="text"
                        value={formData.model}
                        onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="VF 8"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Version *</label>
                      <input
                        type="text"
                        value={formData.version}
                        onChange={(e) => setFormData({ ...formData, version: e.target.value })}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Eco"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Màu sắc *</label>
                      <input
                        type="text"
                        value={formData.color}
                        onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Đen"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Loại xe *</label>
                      <select
                        value={formData.type}
                        onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="Ô tô điện">Ô tô điện</option>
                        {/* <option value="Xe máy điện">Xe máy điện</option> */}
                      </select>
                    </div>
                  </div>
                </div>

                {/* Pricing & Status Section */}
                <div className="bg-green-50 rounded-xl p-5 border border-green-100">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <DollarSign className="w-5 h-5 text-green-600" />
                    Giá & Tình trạng
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Giá bán (VNĐ) *</label>
                      <input
                        type="text"
                        value={formatNumberInput(formData.price.toString())}
                        onChange={(e) => setFormData({ ...formData, price: parseFormattedNumber(e.target.value) })}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        placeholder="1,000,000,000"
                        required
                      />
                    </div>
                    {/* <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Tồn kho</label>
                      <input
                        type="number"
                        value={formData.stock}
                        onChange={(e) => setFormData({ ...formData, stock: Number(e.target.value) })}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        placeholder="10"
                      />
                    </div> */}
                    <div className="col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Trạng thái *</label>
                      <select
                        value={formData.status}
                        onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      >
                        <option value="available">Có sẵn</option>
                        <option value="out_of_stock">Hết hàng</option>
                        <option value="discontinued">Ngừng sản xuất</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Specifications Section */}
                <div className="bg-purple-50 rounded-xl p-5 border border-purple-100">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Gauge className="w-5 h-5 text-purple-600" />
                    Thông số kỹ thuật
                  </h3>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Quãng đường</label>
                      <input
                        type="text"
                        value={formData.distance}
                        onChange={(e) => setFormData({ ...formData, distance: e.target.value })}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        placeholder="500km"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Thời gian sạc</label>
                      <input
                        type="text"
                        value={formData.timecharging}
                        onChange={(e) => setFormData({ ...formData, timecharging: e.target.value })}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        placeholder="5-hours"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Tốc độ tối đa</label>
                      <input
                        type="text"
                        value={formData.speed}
                        onChange={(e) => setFormData({ ...formData, speed: e.target.value })}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        placeholder="200km/h"
                      />
                    </div>
                  </div>
                </div>

                {/* Images Section */}
                <div className="bg-gray-50 rounded-xl p-5 border border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <ImageIcon className="w-5 h-5 text-gray-700" />
                    Hình ảnh sản phẩm
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Hình ảnh 1</label>
                      <input
                        type="url"
                        value={formData.image1}
                        onChange={(e) => setFormData({ ...formData, image1: e.target.value })}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                        placeholder="https://example.com/image1.jpg"
                      />
                      {formData.image1 && (
                        <img src={formData.image1} alt="Preview 1" className="mt-2 w-32 h-20 object-cover rounded-lg" 
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.style.display = 'none';
                          }}
                        />
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Hình ảnh 2</label>
                      <input
                        type="url"
                        value={formData.image2}
                        onChange={(e) => setFormData({ ...formData, image2: e.target.value })}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                        placeholder="https://example.com/image2.jpg"
                      />
                      {formData.image2 && (
                        <img src={formData.image2} alt="Preview 2" className="mt-2 w-32 h-20 object-cover rounded-lg"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.style.display = 'none';
                          }}
                        />
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Hình ảnh 3</label>
                      <input
                        type="url"
                        value={formData.image3}
                        onChange={(e) => setFormData({ ...formData, image3: e.target.value })}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                        placeholder="https://example.com/image3.jpg"
                      />
                      {formData.image3 && (
                        <img src={formData.image3} alt="Preview 3" className="mt-2 w-32 h-20 object-cover rounded-lg"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.style.display = 'none';
                          }}
                        />
                      )}
                    </div>
                  </div>
                </div>

                {/* Description Section */}
                <div className="bg-gray-50 rounded-xl p-5 border border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Info className="w-5 h-5 text-gray-700" />
                    Mô tả chi tiết
                  </h3>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={4}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                    placeholder="Mô tả chi tiết về xe..."
                  />
                </div>

              </div>
            </div>

            {/* Action Buttons - Fixed at bottom */}
            <div className="flex-shrink-0 bg-white border-t border-gray-200 px-6 py-4">
              <div className="flex gap-3">
                <button
                  onClick={handleCreateVehicle}
                  disabled={loading}
                  className="flex-1 bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 font-semibold shadow-lg"
                >
                  <Plus className="w-5 h-5" />
                  {loading ? 'Đang tạo...' : 'Tạo xe mới'}
                </button>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 bg-gray-200 text-gray-800 px-6 py-3 rounded-lg hover:bg-gray-300 transition-colors font-semibold"
                >
                  Hủy
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal - Same as Create Modal */}
      {showEditModal && selectedVehicle && (
        <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[95vh] overflow-hidden flex flex-col">
            {/* Header */}
            <div className="flex-shrink-0 bg-gradient-to-r from-yellow-600 to-yellow-700 px-6 py-5 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <Edit className="w-7 h-7 text-white" />
                <h2 className="text-2xl font-bold text-white">Chỉnh sửa xe</h2>
              </div>
              <button
                onClick={() => setShowEditModal(false)}
                className="p-2 hover:bg-white/20 rounded-lg transition-colors"
              >
                <X className="w-6 h-6 text-white" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              <div className="space-y-6">
                {/* Basic Info Section */}
                <div className="bg-blue-50 rounded-xl p-5 border border-blue-100">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Car className="w-5 h-5 text-blue-600" />
                    Thông tin cơ bản
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Model *</label>
                      <input
                        type="text"
                        value={formData.model}
                        onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Version *</label>
                      <input
                        type="text"
                        value={formData.version}
                        onChange={(e) => setFormData({ ...formData, version: e.target.value })}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Màu sắc *</label>
                      <input
                        type="text"
                        value={formData.color}
                        onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Loại xe *</label>
                      <select
                        value={formData.type}
                        onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="Ô tô điện">Ô tô điện</option>
                        {/* <option value="Xe máy điện">Xe máy điện</option> */}
                      </select>
                    </div>
                  </div>
                </div>

                {/* Pricing & Status Section */}
                <div className="bg-green-50 rounded-xl p-5 border border-green-100">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <DollarSign className="w-5 h-5 text-green-600" />
                    Giá & Tình trạng
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Giá bán (VNĐ) *</label>
                      <input
                        type="text"
                        value={formatNumberInput(formData.price.toString())}
                        onChange={(e) => setFormData({ ...formData, price: parseFormattedNumber(e.target.value) })}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        placeholder="1,000,000,000"
                      />
                    </div>
                    {/* <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Tồn kho</label>
                      <input
                        type="number"
                        value={formData.stock}
                        onChange={(e) => setFormData({ ...formData, stock: Number(e.target.value) })}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      />
                    </div> */}
                    <div className="col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Trạng thái *</label>
                      <select
                        value={formData.status}
                        onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      >
                        <option value="available">Có sẵn</option>
                        <option value="out_of_stock">Hết hàng</option>
                        <option value="discontinued">Ngừng sản xuất</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Specifications Section */}
                <div className="bg-purple-50 rounded-xl p-5 border border-purple-100">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Gauge className="w-5 h-5 text-purple-600" />
                    Thông số kỹ thuật
                  </h3>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Quãng đường</label>
                      <input
                        type="text"
                        value={formData.distance}
                        onChange={(e) => setFormData({ ...formData, distance: e.target.value })}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Thời gian sạc</label>
                      <input
                        type="text"
                        value={formData.timecharging}
                        onChange={(e) => setFormData({ ...formData, timecharging: e.target.value })}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Tốc độ tối đa</label>
                      <input
                        type="text"
                        value={formData.speed}
                        onChange={(e) => setFormData({ ...formData, speed: e.target.value })}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                </div>

                {/* Images Section */}
                <div className="bg-gray-50 rounded-xl p-5 border border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <ImageIcon className="w-5 h-5 text-gray-700" />
                    Hình ảnh sản phẩm
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Hình ảnh 1</label>
                      <input
                        type="url"
                        value={formData.image1}
                        onChange={(e) => setFormData({ ...formData, image1: e.target.value })}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                      />
                      {formData.image1 && (
                        <img src={formData.image1} alt="Preview 1" className="mt-2 w-32 h-20 object-cover rounded-lg" 
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.style.display = 'none';
                          }}
                        />
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Hình ảnh 2</label>
                      <input
                        type="url"
                        value={formData.image2}
                        onChange={(e) => setFormData({ ...formData, image2: e.target.value })}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                      />
                      {formData.image2 && (
                        <img src={formData.image2} alt="Preview 2" className="mt-2 w-32 h-20 object-cover rounded-lg"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.style.display = 'none';
                          }}
                        />
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Hình ảnh 3</label>
                      <input
                        type="url"
                        value={formData.image3}
                        onChange={(e) => setFormData({ ...formData, image3: e.target.value })}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                      />
                      {formData.image3 && (
                        <img src={formData.image3} alt="Preview 3" className="mt-2 w-32 h-20 object-cover rounded-lg"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.style.display = 'none';
                          }}
                        />
                      )}
                    </div>
                  </div>
                </div>

                {/* Description Section */}
                <div className="bg-gray-50 rounded-xl p-5 border border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Info className="w-5 h-5 text-gray-700" />
                    Mô tả chi tiết
                  </h3>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={4}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                  />
                </div>

              </div>
            </div>

            {/* Action Buttons - Fixed at bottom */}
            <div className="flex-shrink-0 bg-white border-t border-gray-200 px-6 py-4">
              <div className="flex gap-3">
                <button
                  onClick={handleUpdateVehicle}
                  disabled={loading}
                  className="flex-1 bg-yellow-600 text-white px-6 py-3 rounded-lg hover:bg-yellow-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 font-semibold shadow-lg"
                >
                  <Edit className="w-5 h-5" />
                  {loading ? 'Đang cập nhật...' : 'Cập nhật'}
                </button>
                <button
                  onClick={() => setShowEditModal(false)}
                  className="flex-1 bg-gray-200 text-gray-800 px-6 py-3 rounded-lg hover:bg-gray-300 transition-colors font-semibold"
                >
                  Hủy
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal - New */}
      {showDeleteModal && vehicleToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-red-600 to-red-700 px-6 py-5">
              <div className="flex items-center gap-3">
                <AlertCircle className="w-8 h-8 text-white" />
                <h2 className="text-2xl font-bold text-white">Xác nhận xóa</h2>
              </div>
            </div>

            <div className="p-6">
              <div className="space-y-4">
                {/* Warning Message */}
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <p className="text-gray-800 text-center font-medium">
                    Bạn có chắc chắn muốn xóa xe này?
                  </p>
                  <p className="text-gray-600 text-center text-sm mt-1">
                    Hành động này không thể hoàn tác!
                  </p>
                </div>

                {/* Vehicle Info */}
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <div className="flex items-start gap-4">
                    <img
                      src={vehicleToDelete.images?.[0] || vehicleToDelete.image1 || '/images/default-car.jpg'}
                      alt={vehicleToDelete.model}
                      className="w-20 h-20 object-cover rounded-lg"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = '/images/default-car.jpg';
                      }}
                    />
                    <div className="flex-1">
                      <h3 className="font-bold text-lg text-gray-900">
                        {vehicleToDelete.model} - {vehicleToDelete.version}
                      </h3>
                      <p className="text-gray-600 text-sm">Màu: {vehicleToDelete.color}</p>
                      <p className="text-gray-600 text-sm">Giá: {formatPrice(vehicleToDelete.price)}</p>
                      {getStatusBadge(vehicleToDelete.status || 'available', vehicleToDelete.vehicleId || vehicleToDelete.id)}
                    </div>
                  </div>
                </div>

                {/* Error Message - Validation from Backend */}
                {deleteError && (
                  <div className="bg-red-50 border-2 border-red-300 rounded-lg p-4 animate-fade-in">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <h4 className="font-semibold text-red-800 mb-1">Không thể xóa xe</h4>
                        <div className="text-sm text-red-700 whitespace-pre-line">
                          {deleteError.split('\n\n').map((line, index) => (
                            <p key={index} className={index > 0 ? 'mt-2' : ''}>
                              {line}
                            </p>
                          ))}
                        </div>
                        {deleteError.includes('tồn kho') && (
                          <div className="mt-3 pt-3 border-t border-red-200">
                            <p className="text-xs text-red-600 font-medium">
                              💡 <strong>Hướng dẫn:</strong> Vui lòng vào trang "Quản lý Tồn kho" để xóa tồn kho của xe này trước.
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-3 pt-2">
                  <button
                    onClick={handleDeleteVehicle}
                    disabled={loading}
                    className="flex-1 bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 font-semibold shadow-lg"
                  >
                    <Trash2 className="w-5 h-5" />
                    {loading ? 'Đang xóa...' : 'Xóa'}
                  </button>
                  <button
                    onClick={() => {
                      setShowDeleteModal(false);
                      setDeleteError(null);
                      setVehicleToDelete(null);
                    }}
                    className="flex-1 bg-gray-200 text-gray-800 px-6 py-3 rounded-lg hover:bg-gray-300 transition-colors font-semibold"
                  >
                    {deleteError ? 'Đóng' : 'Hủy'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

