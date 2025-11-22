import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, Battery, Zap, Clock, Car, Eye, Search, X } from 'lucide-react';
import { Vehicle } from '../../../types';
import { vehicleService } from '../../../services/vehicleService';
import { useAuth } from '../../../contexts/AuthContext';

export const ModelSelector: React.FC = () => {
  const navigate = useNavigate();
  const { checkToken } = useAuth();
  const [selectedModels, setSelectedModels] = useState<Vehicle[]>([]);
  const [selectedFilters, setSelectedFilters] = useState({
    all: true,
    under500m: false,
    under1b: false,
    under1_5b: false,
    over1_5b: false
  });
  const [filteredVehicles, setFilteredVehicles] = useState<Vehicle[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<Vehicle[]>([]);

  const fetchVehicles = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await vehicleService.getVehicles();
      console.log('Phản hồi API:', response);
      
      if (response.success && response.data.length > 0) {
        setVehicles(response.data);
        setFilteredVehicles(response.data);
        console.log('Đã tải xe từ API:', response.data.length);
      }
    } catch (error) {
      console.error('Lỗi khi lấy danh sách xe:', error);
      setError(error instanceof Error ? error.message : 'Lỗi khi tải danh sách xe');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    window.scrollTo(0, 0);
    
    // Check token when component mounts
    console.log('=== ModelSelector Component Đã Mount ===');
    checkToken();
    
    // Fetch vehicles data
    fetchVehicles();
  }, [checkToken, fetchVehicles]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
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

  const startComparison = () => {
    if (selectedModels.length === 2) {
      // Navigate back to comparison with selected models
      navigate('/portal/compare-models', { 
        state: { models: selectedModels }
      });
    }
  };

  const toggleSelection = (vehicle: Vehicle) => {
    if (selectedModels.find(v => v.id === vehicle.id)) {
      setSelectedModels(selectedModels.filter(v => v.id !== vehicle.id));
    } else if (selectedModels.length < 2) {
      setSelectedModels([...selectedModels, vehicle]);
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
    setFilteredVehicles(vehicles);
  };

  const handleSearch = async (term: string) => {
    if (!term.trim()) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    setError(null);

    try {
      console.log('🔍 Searching for:', term);
      const response = await vehicleService.searchVehicles(term);
      
      if (response.success) {
        setSearchResults(response.data);
        console.log('✅ Search results:', response.data.length);
        console.log('🔍 Search results data:', response.data);
        console.log('🔍 Search results models:', response.data.map(v => v.model));
      } else {
        console.log('❌ Search returned no results');
        setSearchResults([]);
      }
    } catch (error) {
      console.error('❌ Search API failed:', error);
      setError(error instanceof Error ? error.message : 'Lỗi khi tìm kiếm');
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSearch(searchTerm);
  };

  const clearSearch = () => {
    setSearchTerm('');
    setSearchResults([]);
    setIsSearching(false);
  };

  // Determine which vehicles to display
  const displayVehicles = searchResults.length > 0 ? searchResults : filteredVehicles;
  const isShowingSearchResults = searchResults.length > 0;

  return (
    <div>
        {/* Loading State */}
        {loading && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
            <div className="bg-white rounded-lg p-8 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto mb-4"></div>
              <p className="text-gray-600">Đang tải danh sách xe...</p>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mx-4 mt-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Lỗi tải dữ liệu</h3>
                <div className="mt-2 text-sm text-red-700">
                  <p>{error}</p>
                </div>
              </div>
            </div>
          </div>
        )}


        <div className="max-w-7xl mx-auto px-6 py-6">
          {/* Back Button */}
          <div className="mb-6">
            <button 
              onClick={() => navigate(-1)}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 border border-gray-300 rounded-lg transition-all duration-200 group shadow-sm hover:shadow"
            >
              <svg className="w-4 h-4 transition-transform duration-200 group-hover:-translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              <span>Quay lại</span>
            </button>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-6 pb-10">
          {/* Search Bar */}
          <div className="mb-8">
            <form onSubmit={handleSearchSubmit} className="max-w-2xl mx-auto">
              <div className="relative flex">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Tìm kiếm xe theo tên, model, màu sắc..."
                  className="flex-1 pl-12 pr-4 py-3 border-2 border-gray-200 rounded-l-2xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white shadow-sm text-base"
                />
                {searchTerm && (
                  <button
                    type="button"
                    onClick={clearSearch}
                    className="absolute right-20 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <X className="h-5 w-5" />
                  </button>
                )}
                <button
                  type="submit"
                  disabled={isSearching || !searchTerm.trim()}
                  className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-r-2xl font-medium hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 transition-all duration-200 shadow-sm"
                >
                  {isSearching ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Tìm...</span>
                    </>
                  ) : (
                    <>
                      <Search className="h-4 w-4" />
                      <span>Tìm kiếm</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* Search Results Info */}
          {isShowingSearchResults && (
            <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Search className="h-5 w-5 text-blue-600" />
                  <div>
                    <h3 className="text-sm font-medium text-blue-800">
                      Kết quả tìm kiếm cho "{searchTerm}"
                    </h3>
                    <p className="text-sm text-blue-700">
                      Tìm thấy {searchResults.length} kết quả
                    </p>
                  </div>
                </div>
                <button
                  onClick={clearSearch}
                  className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                >
                  Xóa tìm kiếm
                </button>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-10">
            {/* Sidebar */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-2xl shadow-lg p-8 sticky top-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-6">Khoảng giá</h3>
                <div className="space-y-4">
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
                  className="w-full mt-8 px-6 py-3 border-2 border-gray-200 rounded-xl text-gray-700 hover:bg-gray-50 hover:border-gray-300 font-medium transition-all duration-200"
                >
                  Đặt lại tất cả bộ lọc
                </button>
              </div>

              {/* Start Comparison Button */}
              {selectedModels.length === 2 && (
                <div className="mt-8 bg-gradient-to-r from-gray-800 to-black text-white p-6 rounded-2xl shadow-xl">
                  <h4 className="font-semibold mb-3">Sẵn sàng so sánh</h4>
                  <p className="text-gray-200 text-sm mb-4">Bạn đã chọn 2 mẫu xe để so sánh</p>
                  <button
                    onClick={startComparison}
                    className="w-full bg-white text-black px-6 py-3 rounded-xl font-semibold hover:bg-gray-100 transition-all duration-200 shadow-md"
                  >
                    Bắt đầu so sánh
                  </button>
                </div>
              )}
            </div>

            {/* Main Content */}
            <div className="lg:col-span-3">
              <div className="mb-10">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-2xl font-semibold text-gray-900">
                      {isShowingSearchResults ? 'Kết quả tìm kiếm' : 'Mẫu xe VinFast'}
                    </h2>
                    {isShowingSearchResults && (
                      <p className="text-sm text-gray-600 mt-1">
                        Tìm thấy {searchResults.length} kết quả cho "{searchTerm}"
                      </p>
                    )}
                  </div>
                  <div className="bg-gray-900 px-4 py-2 rounded-full">
                    <span className="text-white font-medium text-sm">
                      Đã chọn: {selectedModels.length}/2 mẫu xe
                    </span>
                  </div>
                </div>
              </div>

              {/* Empty State for Search Results */}
              {isShowingSearchResults && displayVehicles.length === 0 && !isSearching && (
                <div className="text-center py-12">
                  <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                    <Search className="h-12 w-12 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Không tìm thấy kết quả</h3>
                  <p className="text-gray-600 mb-4">
                    Không có xe nào phù hợp với từ khóa "{searchTerm}"
                  </p>
                  <button
                    onClick={clearSearch}
                    className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Xóa tìm kiếm
                  </button>
                </div>
              )}

              {/* Vehicle Grid */}
              {displayVehicles.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                  {displayVehicles.map((vehicle) => {
                  const isSelected = selectedModels.find(v => v.id === vehicle.id);
                  const canSelect = selectedModels.length < 2 || isSelected;

                  return (
                    <div 
                      key={vehicle.id} 
                      className={`bg-white rounded-lg shadow-md overflow-hidden relative transform transition-all duration-300 ${
                        canSelect ? 'cursor-pointer hover:shadow-xl hover:scale-105' : 'opacity-60 cursor-not-allowed'
                      } ${isSelected ? 'ring-4 ring-blue-500 ring-opacity-50 shadow-xl' : ''}`}
                      onClick={() => canSelect && toggleSelection(vehicle)}
                    >
                      {/* Selection Badge */}
                      <div className="absolute top-4 right-4 z-10">
                        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                          isSelected ? 'bg-black border-black' : 'bg-white border-gray-300'
                        }`}>
                          {isSelected && <Check className="w-4 h-4 text-white" />}
                        </div>
                      </div>

                      {/* Electric Badge */}
                      {/* <div className="absolute top-4 left-4 z-10">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          Điện • 2024
                        </span>
                      </div> */}

                      {/* Vehicle Image */}
                      <div className="relative">
                        <img
                          src={vehicle.images?.[0] || '/images/default-car.jpg'}
                          alt={vehicle.model}
                          className="w-full h-48 object-cover"
                          loading="lazy"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            if (target.src !== '/images/default-car.jpg') {
                              target.src = '/images/default-car.jpg';
                            }
                          }}
                        />
                      </div>

                      {/* Vehicle Information */}
                      <div className="p-4">
                        <h3 className="text-xl font-bold text-gray-900 mb-2">{vehicle.model}</h3>
                        <p className="text-sm text-gray-600 mb-2">{vehicle.version} - {vehicle.color}</p>
                        <p className="text-2xl font-bold text-green-600 mb-4">Từ {formatPrice(vehicle.price)}</p>

                        {/* Specifications Grid - Same as CarProduct */}
                        <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                          <div className="flex items-center space-x-2">
                            <Battery className="h-4 w-4 text-blue-500" />
                            <span>{vehicle.range}km</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Zap className="h-4 w-4 text-yellow-500" />
                            <span>{vehicle.maxSpeed}km/h</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Clock className="h-4 w-4 text-red-500" />
                            <span>{vehicle.chargingTime}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Car className="h-4 w-4 text-gray-500" />
                            <span>{vehicle.stock} xe</span>
                          </div>
                        </div>

                        {/* Action Buttons - Same as CarProduct */}
                        <div className="flex space-x-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/portal/car-detail/${vehicle.id}`);
                            }}
                            className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg font-medium flex items-center justify-center space-x-2"
                          >
                            <Eye className="h-4 w-4" />
                            <span>Chi tiết</span>
                          </button>
                        </div>

                        {/* Add to Comparison Info */}
                        <div className="mt-3 text-center">
                          <span className="text-xs text-gray-500">
                            {isSelected ? 'Đã thêm vào so sánh' : 'Nhấp để thêm vào so sánh'}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
  );
};

