import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Car, Battery, Zap, Clock, Eye, ShoppingCart, X } from 'lucide-react';
import { mockVehicles } from '../../../data/mockData';
import { Vehicle } from '../../../types';
import { vehicleService } from '../../../services/vehicleService';
import { useAuth } from '../../../contexts/AuthContext';
import { getOptimizedImageUrl, handleImageLoadSuccess, handleImageLoadError } from '../../../utils/imageCache';

export const CarProduct: React.FC = () => {
  const navigate = useNavigate();
  const { checkToken } = useAuth();
  const compareTableRef = useRef<HTMLDivElement>(null);
  const [selectedFilters, setSelectedFilters] = useState({
    all: true,
    under500m: false,
    under1b: false,
    under1_5b: false,
    over1_5b: false
  });
  const [filteredVehicles, setFilteredVehicles] = useState<Vehicle[]>(mockVehicles);
  const [compareMode, setCompareMode] = useState(false);
  const [compareList, setCompareList] = useState<Vehicle[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>(mockVehicles);
  const [loading, setLoading] = useState(false);
  const [, setError] = useState<string | null>(null);

  useEffect(() => {
    window.scrollTo(0, 0);
    fetchVehicles();
    
    // Check token when component mounts
    console.log('=== CarProduct Component Mounted ===');
    checkToken();
  }, [checkToken]);

  const fetchVehicles = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await vehicleService.getVehicles();
      console.log('API Response:', response);
      
      if (response.success && response.data.length > 0) {
        setVehicles(response.data);
        setFilteredVehicles(response.data);
        console.log('Vehicles loaded from API:', response.data.length);
      } else {
        console.log('No vehicles from API, using mock data');
        setVehicles(mockVehicles);
        setFilteredVehicles(mockVehicles);
      }
    } catch (error) {
      console.error('Failed to fetch vehicles:', error);
      setError(error instanceof Error ? error.message : 'Lỗi khi tải danh sách xe');
      // Fallback to mock data
      setVehicles(mockVehicles);
      setFilteredVehicles(mockVehicles);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Auto scroll to comparison table when there are 2+ vehicles to compare
    if (compareList.length >= 2 && compareTableRef.current) {
      setTimeout(() => {
        compareTableRef.current?.scrollIntoView({ 
          behavior: 'smooth',
          block: 'start'
        });
      }, 300);
    }
  }, [compareList.length]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  const toggleCompare = (vehicle: Vehicle) => {
    if (compareList.find(v => v.id === vehicle.id)) {
      setCompareList(compareList.filter(v => v.id !== vehicle.id));
    } else if (compareList.length < 3) {
      setCompareList([...compareList, vehicle]);
    }
  };

  const clearCompare = () => {
    setCompareList([]);
    setCompareMode(false);
  };

  // const handleTestDrive = (vehicleId: string) => {
  //   navigate(`/portal/test-drive?vehicleId=${vehicleId}`);
  // };

  const handleDeposit = (vehicleId: string) => {
    navigate(`/portal/deposit?vehicleId=${vehicleId}`);
  };

  const handleFilterChange = (filterType: string) => {
    if (filterType === 'all') {
      setSelectedFilters({
        all: true,
        under500m: false,
        under1b: false,
        under1_5b: false,
        over1_5b: false
      });
      setFilteredVehicles(vehicles);
    } else {
      const newFilters = {
        ...selectedFilters,
        all: false,
        [filterType]: !selectedFilters[filterType as keyof typeof selectedFilters]
      };
      setSelectedFilters(newFilters);

      // Filter vehicles based on price ranges
      let filtered = vehicles;
      const activeFilters = Object.entries(newFilters)
        .filter(([key, value]) => value && key !== 'all')
        .map(([key]) => key);

      if (activeFilters.length > 0) {
        filtered = vehicles.filter(vehicle => {
          return activeFilters.some(filter => {
            switch (filter) {
              case 'under500m':
                return vehicle.price < 500000000;
              case 'under1b':
                return vehicle.price >= 500000000 && vehicle.price < 1000000000;
              case 'under1_5b':
                return vehicle.price >= 1000000000 && vehicle.price < 1500000000;
              case 'over1_5b':
                return vehicle.price >= 1500000000;
              default:
                return false;
            }
          });
        });
      }
      setFilteredVehicles(filtered);
    }
  };

  const resetFilters = () => {
    setSelectedFilters({
      all: true,
      under500m: false,
      under1b: false,
      under1_5b: false,
      over1_5b: false
    });
    setFilteredVehicles(vehicles); // Sử dụng state 'vehicles' thay vì 'mockVehicles'
  };

  return (
    <> {/* Thay đổi từ <div> sang <>, thẻ bọc ngoài cùng */}
      {/* Back Button */}
      <div className="bg-white border-b border-gray-100">
          <div className="max-w-7xl mx-auto px-6 py-3">
            <button 
              onClick={() => navigate(-1)}
              className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 transition-colors duration-200 group"
            >
              <svg className="w-4 h-4 mr-1 transition-transform duration-200 group-hover:-translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Quay lại
            </button>
          </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Loading State */}
        {loading && (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black"></div>
            <span className="ml-3 text-gray-600">Đang tải danh sách xe...</span>
          </div>
        )}

            {/* Info State - Only show if using mock data */}
            {!loading && vehicles === mockVehicles && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-blue-800">Đang sử dụng dữ liệu mẫu</h3>
                    <div className="mt-2 text-sm text-blue-700">
                      <p>API yêu cầu xác thực. Hiển thị dữ liệu mẫu để demo.</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

        {!loading && (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Sidebar Filters */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg p-6 shadow-sm">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Khoảng giá</h3>
                <div className="space-y-3">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="price"
                      checked={selectedFilters.all}
                      onChange={() => handleFilterChange('all')}
                      className="mr-3"
                    />
                    <span className="text-gray-700">Tất cả ({vehicles.length})</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={selectedFilters.under500m}
                      onChange={() => handleFilterChange('under500m')}
                      className="mr-3"
                    />
                    <span className="text-gray-700">Dưới 500 triệu ({vehicles.filter(v => v.price < 500000000).length})</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={selectedFilters.under1b}
                      onChange={() => handleFilterChange('under1b')}
                      className="mr-3"
                    />
                    <span className="text-gray-700">500 triệu - 1 tỷ ({vehicles.filter(v => v.price >= 500000000 && v.price < 1000000000).length})</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={selectedFilters.under1_5b}
                      onChange={() => handleFilterChange('under1_5b')}
                      className="mr-3"
                    />
                    <span className="text-gray-700">1 - 1.5 tỷ ({vehicles.filter(v => v.price >= 1000000000 && v.price < 1500000000).length})</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={selectedFilters.over1_5b}
                      onChange={() => handleFilterChange('over1_5b')}
                      className="mr-3"
                    />
                    <span className="text-gray-700">Trên 1.5 tỷ ({vehicles.filter(v => v.price >= 1500000000).length})</span>
                  </label>
                </div>
                
                <button
                  onClick={resetFilters}
                  className="w-full mt-6 px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-50"
                >
                  Đặt lại bộ lọc
                </button>

                {/* Compare Section */}
                
              </div>
            </div>

            {/* Main Content */}
            <div className="lg:col-span-3">
              {/* Header with Compare button */}
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-medium text-gray-900">Mẫu xe VinFast</h2>
                <div className="flex items-center space-x-4">
                  {compareMode && (
                    <span className="text-sm text-blue-600">
                      Chọn tối đa 3 xe để so sánh ({compareList.length}/3)
                    </span>
                  )}
                  <button 
                    onClick={() => navigate('/portal/compare-models')}
                    className="text-black hover:text-gray-700 text-sm font-medium"
                  >
                    ↔ So sánh mẫu xe
                  </button>
                </div>
              </div>

              {/* Vehicle Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredVehicles.map((vehicle) => (
                  <div key={vehicle.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow relative">
                    {compareMode && (
                      <div className="absolute top-2 right-2 z-10">
                        <button
                          onClick={() => toggleCompare(vehicle)}
                          disabled={!compareList.find(v => v.id === vehicle.id) && compareList.length >= 3}
                          className={`p-2 rounded-full ${
                            compareList.find(v => v.id === vehicle.id)
                              ? 'bg-blue-600 text-white'
                              : compareList.length >= 3
                              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                              : 'bg-white text-gray-600 hover:bg-blue-50'
                          } shadow-md`}
                        >
                          <Car className="h-4 w-4" />
                        </button>
                      </div>
                    )}
                    
                    <div className="relative">
                      <img
                        src={(() => {
                          const imageUrl = vehicle.images?.[0];
                          if (!imageUrl || imageUrl.trim() === '' || imageUrl === 'null') {
                            return '/images/default-car.jpg';
                          }
                          return getOptimizedImageUrl(imageUrl, '/images/default-car.jpg');
                        })()}
                        alt={vehicle.model}
                        className="w-full h-48 object-cover"
                        loading="lazy"
                        onLoad={(e) => {
                          const target = e.target as HTMLImageElement;
                          const originalUrl = vehicle.images?.[0];
                          if (originalUrl && originalUrl.trim() !== '' && originalUrl !== 'null') {
                            handleImageLoadSuccess(originalUrl, target.src);
                          }
                        }}
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          const originalUrl = vehicle.images?.[0];
                          console.log('Image load error for vehicle:', vehicle.model, 'URL:', originalUrl);
                          
                          if (originalUrl && originalUrl.trim() !== '' && originalUrl !== 'null') {
                            handleImageLoadError(originalUrl);
                          }
                          
                          if (target.src !== '/images/default-car.jpg' && !target.src.includes('default-car.jpg')) {
                            target.src = '/images/default-car.jpg';
                          }
                        }}
                      />
                    </div>

                    <div className="p-4">
                      <h3 className="text-xl font-bold text-gray-900 mb-2">{vehicle.model}</h3>
                      <p className="text-sm text-gray-600 mb-2">{vehicle.version} - {vehicle.color}</p>
                      <p className="text-2xl font-bold text-green-600 mb-4">{formatPrice(vehicle.price)}</p>

                      <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                        <div className="flex items-center space-x-2">
                          <Battery className="h-4 w-4 text-blue-500" />
                          <span>{vehicle.distance || `${vehicle.range}km`}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Zap className="h-4 w-4 text-yellow-500" />
                          <span>{vehicle.speed || `${vehicle.maxSpeed}km/h`}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Clock className="h-4 w-4 text-red-500" />
                          <span>{vehicle.timecharging || vehicle.chargingTime}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Car className="h-4 w-4 text-gray-500" />
                          <span>{vehicle.stock || 0} xe</span>
                        </div>
                      </div>

                      <div className="flex space-x-2">
                        <button
                          onClick={() => navigate(`/portal/car-detail/${vehicle.id}`)}
                          className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg font-medium flex items-center justify-center space-x-2"
                        >
                          <Eye className="h-4 w-4" />
                          <span>Chi tiết</span>
                        </button>
                        <button
                          onClick={() => handleDeposit(vehicle.id)}
                          className="flex-1 bg-black hover:bg-gray-800 text-white px-4 py-2 rounded-lg font-medium flex items-center justify-center space-x-2"
                        >
                          <ShoppingCart className="h-4 w-4" />
                          <span>Đặt cọc</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Professional Comparison Table */}
            {compareList.length > 0 && ( /* Thêm điều kiện hiển thị cho bảng so sánh */
                <div ref={compareTableRef} className="mt-12 lg:col-span-4 bg-white rounded-lg shadow-lg overflow-hidden">
                    <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-6">
                      <div className="flex items-center justify-between">
                        <h2 className="text-2xl font-bold text-white">So sánh chi tiết</h2>
                        <button
                          onClick={clearCompare}
                          className="text-white hover:text-gray-200"
                        >
                          <X className="h-6 w-6" />
                        </button>
                      </div>
                    </div>
                    
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="text-left p-6 font-semibold text-gray-900 border-b">Thông số</th>
                            {compareList.map(vehicle => (
                              <th key={vehicle.id} className="text-center p-6 font-semibold text-gray-900 border-b min-w-[200px]">
                                {vehicle.model}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                          <tr className="hover:bg-gray-50">
                            <td className="p-6 font-medium text-gray-900">Hình ảnh</td>
                            {compareList.map(vehicle => (
                              <td key={vehicle.id} className="p-6 text-center">
                                <img 
                                  src={getOptimizedImageUrl(vehicle.images?.[0] || '', '/images/default-car.jpg')} 
                                  alt={vehicle.model} 
                                  className="w-24 h-18 object-cover mx-auto rounded-lg shadow-sm"
                                  loading="lazy"
                                  onLoad={(e) => {
                                    const target = e.target as HTMLImageElement;
                                    const originalUrl = vehicle.images?.[0] || '';
                                    if (originalUrl) {
                                      handleImageLoadSuccess(originalUrl, target.src);
                                    }
                                  }}
                                  onError={(e) => {
                                    const target = e.target as HTMLImageElement;
                                    const originalUrl = vehicle.images?.[0] || '';
                                    if (originalUrl) {
                                      handleImageLoadError(originalUrl);
                                    }
                                    if (target.src !== '/images/default-car.jpg') {
                                      target.src = '/images/default-car.jpg';
                                    }
                                  }}
                                />
                              </td>
                            ))}
                          </tr>
                          <tr className="hover:bg-gray-50">
                            <td className="p-6 font-medium text-gray-900">Giá bán</td>
                            {compareList.map(vehicle => (
                              <td key={vehicle.id} className="p-6 text-center font-bold text-green-600 text-lg">
                                {formatPrice(vehicle.price)}
                              </td>
                            ))}
                          </tr>
                          <tr className="hover:bg-gray-50">
                            <td className="p-6 font-medium text-gray-900">Phiên bản</td>
                            {compareList.map(vehicle => (
                              <td key={vehicle.id} className="p-6 text-center text-gray-700">{vehicle.version}</td>
                            ))}
                          </tr>
                          <tr className="hover:bg-gray-50">
                            <td className="p-6 font-medium text-gray-900">Màu sắc</td>
                            {compareList.map(vehicle => (
                              <td key={vehicle.id} className="p-6 text-center text-gray-700">{vehicle.color}</td>
                            ))}
                          </tr>
                          <tr className="hover:bg-gray-50">
                            <td className="p-6 font-medium text-gray-900">Tầm hoạt động</td>
                            {compareList.map(vehicle => (
                              <td key={vehicle.id} className="p-6 text-center text-blue-600 font-semibold">{vehicle.distance || `${vehicle.range} km`}</td>
                            ))}
                          </tr>
                          <tr className="hover:bg-gray-50">
                            <td className="p-6 font-medium text-gray-900">Tốc độ tối đa</td>
                            {compareList.map(vehicle => (
                              <td key={vehicle.id} className="p-6 text-center text-yellow-600 font-semibold">{vehicle.speed || `${vehicle.maxSpeed} km/h`}</td>
                            ))}
                          </tr>
                          <tr className="hover:bg-gray-50">
                            <td className="p-6 font-medium text-gray-900">Thời gian sạc</td>
                            {compareList.map(vehicle => (
                              <td key={vehicle.id} className="p-6 text-center text-red-600 font-semibold">{vehicle.timecharging || vehicle.chargingTime}</td>
                            ))}
                          </tr>
                          <tr className="hover:bg-gray-50">
                            <td className="p-6 font-medium text-gray-900">Tồn kho</td>
                            {compareList.map(vehicle => (
                              <td key={vehicle.id} className="p-6 text-center text-gray-600">{vehicle.stock || 0} xe</td>
                            ))}
                          </tr>
                          <tr className="hover:bg-gray-50">
                            <td className="p-6 font-medium text-gray-900">Loại xe</td>
                            {compareList.map(vehicle => (
                              <td key={vehicle.id} className="p-6 text-center text-gray-700">{vehicle.type || 'SUV'}</td>
                            ))}
                          </tr>
                          <tr className="hover:bg-gray-50">
                            <td className="p-6 font-medium text-gray-900">Trạng thái</td>
                            {compareList.map(vehicle => (
                              <td key={vehicle.id} className="p-6 text-center">
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                  vehicle.status === 'ACTIVE' 
                                    ? 'bg-green-100 text-green-800' 
                                    : 'bg-gray-100 text-gray-800'
                                }`}>
                                  {vehicle.status || 'ACTIVE'}
                                </span>
                              </td>
                            ))}
                          </tr>
                        </tbody>
                      </table>
                    </div>
                    
                    <div className="bg-gray-50 p-6">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {compareList.map(vehicle => (
                          <div key={vehicle.id} className="flex space-x-2">
                            <button
                              onClick={() => navigate(`/portal/car-detail/${vehicle.id}`)}
                              className="flex-1 bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded font-medium"
                            >
                              Xem {vehicle.model}
                            </button>
                            <button
                              onClick={() => handleDeposit(vehicle.id)}
                              className="flex-1 bg-black hover:bg-gray-800 text-white px-4 py-2 rounded font-medium"
                            >
                              Đặt cọc
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                </div>
            )}
          </div>
        )}
      </div>
    </>
  );
};