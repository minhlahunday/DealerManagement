import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Car, Battery, Zap, Clock, Eye, X, Search, DollarSign } from 'lucide-react';
import { Vehicle } from '../../../types';
import { vehicleService } from '../../../services/vehicleService';
import { discountService, Discount } from '../../../services/discountService';
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
  
  // Advanced filters
  const [advancedFilters, setAdvancedFilters] = useState({
    models: [] as string[],
    status: [] as string[],
    rangeMin: 0,
    speedMin: 0,
    sortBy: 'default'
  });
  const [filteredVehicles, setFilteredVehicles] = useState<Vehicle[]>([]);
  const [compareMode, setCompareMode] = useState(false);
  const [compareList, setCompareList] = useState<Vehicle[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(false);
  const [, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<Vehicle[]>([]);
  
  // Discount states - lưu thông tin discount để hiển thị
  const [vehicleDiscounts, setVehicleDiscounts] = useState<Map<number, Discount>>(new Map());

  useEffect(() => {
    window.scrollTo(0, 0);
    fetchVehicles();
    fetchDiscounts();
    
    // Check token when component mounts
    console.log('=== CarProduct Component Đã Mount ===');
    checkToken();
  }, [checkToken]);
  
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

  const fetchVehicles = async () => {
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


  const applyAllFilters = (
    vehicleList: Vehicle[], 
    priceFilters: typeof selectedFilters,
    advanced: typeof advancedFilters
  ) => {
    let filtered = [...vehicleList];

    // Price range filter
    const activeFilters = Object.entries(priceFilters)
      .filter(([key, value]) => value && key !== 'all')
      .map(([key]) => key);

    if (activeFilters.length > 0) {
      filtered = filtered.filter(vehicle => {
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

    // Model filter
    if (advanced.models.length > 0) {
      filtered = filtered.filter(v =>
        advanced.models.some(model => v.model.toUpperCase().includes(model))
      );
    }

    // Status filter
    if (advanced.status.length > 0) {
      filtered = filtered.filter(v => advanced.status.includes(v.status || ''));
    }

    // Range filter
    if (advanced.rangeMin > 0) {
      filtered = filtered.filter(v => (v.range || 0) >= advanced.rangeMin);
    }

    // Speed filter
    if (advanced.speedMin > 0) {
      filtered = filtered.filter(v => (v.maxSpeed || 0) >= advanced.speedMin);
    }

    // Sort
    switch (advanced.sortBy) {
      case 'price-asc':
        filtered.sort((a, b) => a.price - b.price);
        break;
      case 'price-desc':
        filtered.sort((a, b) => b.price - a.price);
        break;
      case 'range-desc':
        filtered.sort((a, b) => (b.range || 0) - (a.range || 0));
        break;
      case 'name-asc':
        filtered.sort((a, b) => a.model.localeCompare(b.model));
        break;
      default:
        break;
    }

    setFilteredVehicles(filtered);
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
      applyAllFilters(vehicles, {
        all: true,
        under500m: false,
        under1b: false,
        under1_5b: false,
        over1_5b: false
      }, advancedFilters);
    } else {
      const newFilters = {
        ...selectedFilters,
        all: false,
        [filterType]: !selectedFilters[filterType as keyof typeof selectedFilters]
      };
      setSelectedFilters(newFilters);
      applyAllFilters(vehicles, newFilters, advancedFilters);
    }
  };

  const toggleModel = (model: string) => {
    const newModels = advancedFilters.models.includes(model)
      ? advancedFilters.models.filter(m => m !== model)
      : [...advancedFilters.models, model];
    const newFilters = { ...advancedFilters, models: newModels };
    setAdvancedFilters(newFilters);
    applyAllFilters(vehicles, selectedFilters, newFilters);
  };

  const toggleStatus = (status: string) => {
    const newStatus = advancedFilters.status.includes(status)
      ? advancedFilters.status.filter(s => s !== status)
      : [...advancedFilters.status, status];
    const newFilters = { ...advancedFilters, status: newStatus };
    setAdvancedFilters(newFilters);
    applyAllFilters(vehicles, selectedFilters, newFilters);
  };

  const handleSortChange = (sortBy: string) => {
    const newFilters = { ...advancedFilters, sortBy };
    setAdvancedFilters(newFilters);
    applyAllFilters(vehicles, selectedFilters, newFilters);
  };

  const resetFilters = () => {
    setSelectedFilters({
      all: true,
      under500m: false,
      under1b: false,
      under1_5b: false,
      over1_5b: false
    });
    setAdvancedFilters({
      models: [],
      status: [],
      rangeMin: 0,
      speedMin: 0,
      sortBy: 'default'
    });
    setFilteredVehicles(vehicles);
  };

  // Count vehicles in each price range
  const getPriceRangeCount = (range: string) => {
    return vehicles.filter(vehicle => {
      switch (range) {
        case 'all':
          return true;
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
    }).length;
  };

  // Determine which vehicles to display
  const displayVehicles = searchResults.length > 0 ? searchResults : filteredVehicles;
  const isShowingSearchResults = searchResults.length > 0;

  return (
    <> {/* Thay đổi từ <div> sang <>, thẻ bọc ngoài cùng */}
      <div className="max-w-7xl mx-auto px-4 py-6">
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

        {/* Search Results Info - Removed blue background */}
        {isShowingSearchResults && (
          <div className="mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Search className="h-5 w-5 text-gray-600" />
                <div>
                  <h3 className="text-sm font-medium text-gray-800">
                    Kết quả tìm kiếm cho "{searchTerm}"
                  </h3>
                  <p className="text-sm text-gray-600">
                    Tìm thấy {searchResults.length} kết quả
                  </p>
                </div>
              </div>
              <button
                onClick={clearSearch}
                className="text-gray-600 hover:text-gray-800 text-sm font-medium"
              >
                Xóa tìm kiếm
              </button>
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black"></div>
            <span className="ml-3 text-gray-600">Đang tải danh sách xe...</span>
          </div>
        )}

            {/* Info State - Removed (no longer showing mock data notice) */}

        {!loading && (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Sidebar Filters */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                {/* Filter Header */}
                <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-4">
                  <h3 className="text-lg font-semibold text-white flex items-center">
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                    </svg>
                    Lọc sản phẩm
                  </h3>
                </div>

                <div className="p-5 space-y-6">
                  {/* Price Range Filter */}
                  <div>
                    <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center">
                      <DollarSign className="w-4 h-4 mr-1.5 text-blue-600" />
                      Khoảng giá
                    </h4>
                    <div className="space-y-2">
                      <label className="flex items-center cursor-pointer hover:bg-gray-50 p-2 rounded transition-colors">
                        <input
                          type="radio"
                          name="price"
                          checked={selectedFilters.all}
                          onChange={() => handleFilterChange('all')}
                          className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="ml-3 text-sm text-gray-700 flex-1">Tất cả</span>
                        <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">{getPriceRangeCount('all')}</span>
                      </label>
                      <label className="flex items-center cursor-pointer hover:bg-gray-50 p-2 rounded transition-colors">
                        <input
                          type="checkbox"
                          checked={selectedFilters.under500m}
                          onChange={() => handleFilterChange('under500m')}
                          className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                        />
                        <span className="ml-3 text-sm text-gray-700 flex-1">Dưới 500 triệu</span>
                        <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">{getPriceRangeCount('under500m')}</span>
                      </label>
                      <label className="flex items-center cursor-pointer hover:bg-gray-50 p-2 rounded transition-colors">
                        <input
                          type="checkbox"
                          checked={selectedFilters.under1b}
                          onChange={() => handleFilterChange('under1b')}
                          className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                        />
                        <span className="ml-3 text-sm text-gray-700 flex-1">500 triệu - 1 tỷ</span>
                        <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">{getPriceRangeCount('under1b')}</span>
                      </label>
                      <label className="flex items-center cursor-pointer hover:bg-gray-50 p-2 rounded transition-colors">
                        <input
                          type="checkbox"
                          checked={selectedFilters.under1_5b}
                          onChange={() => handleFilterChange('under1_5b')}
                          className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                        />
                        <span className="ml-3 text-sm text-gray-700 flex-1">1 - 1.5 tỷ</span>
                        <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">{getPriceRangeCount('under1_5b')}</span>
                      </label>
                      <label className="flex items-center cursor-pointer hover:bg-gray-50 p-2 rounded transition-colors">
                        <input
                          type="checkbox"
                          checked={selectedFilters.over1_5b}
                          onChange={() => handleFilterChange('over1_5b')}
                          className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                        />
                        <span className="ml-3 text-sm text-gray-700 flex-1">Trên 1.5 tỷ</span>
                        <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">{getPriceRangeCount('over1_5b')}</span>
                      </label>
                    </div>
                  </div>

                  <div className="border-t border-gray-200"></div>

                  {/* Model Filter */}
                  <div>
                    <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center">
                      <Car className="w-4 h-4 mr-1.5 text-blue-600" />
                      Dòng xe
                    </h4>
                    <div className="space-y-2">
                      {['VF7', 'VF8', 'VF9'].map(model => (
                        <label key={model} className="flex items-center cursor-pointer hover:bg-gray-50 p-2 rounded transition-colors">
                          <input
                            type="checkbox"
                            checked={advancedFilters.models.includes(model)}
                            onChange={() => toggleModel(model)}
                            className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                          />
                          <span className="ml-3 text-sm text-gray-700 flex-1">{model}</span>
                          <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                            {vehicles.filter(v => v.model.toUpperCase().includes(model)).length}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="border-t border-gray-200"></div>

                  {/* Status Filter */}
                  <div>
                    <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center">
                      <Zap className="w-4 h-4 mr-1.5 text-blue-600" />
                      Trạng thái
                    </h4>
                    <div className="space-y-2">
                      {['ACTIVE', 'INACTIVE'].map(status => (
                        <label key={status} className="flex items-center cursor-pointer hover:bg-gray-50 p-2 rounded transition-colors">
                          <input
                            type="checkbox"
                            checked={advancedFilters.status.includes(status)}
                            onChange={() => toggleStatus(status)}
                            className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                          />
                          <span className="ml-3 text-sm text-gray-700 flex-1">
                            {status === 'ACTIVE' ? 'Đang bán' : 'Ngừng bán'}
                          </span>
                          <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                            {vehicles.filter(v => v.status === status).length}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="border-t border-gray-200"></div>

                  {/* Sort By */}
                  <div>
                    <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center">
                      <svg className="w-4 h-4 mr-1.5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" />
                      </svg>
                      Sắp xếp theo
                    </h4>
                    <select
                      value={advancedFilters.sortBy}
                      onChange={(e) => handleSortChange(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                    >
                      <option value="default">Mặc định</option>
                      <option value="price-asc">Giá: Thấp đến cao</option>
                      <option value="price-desc">Giá: Cao đến thấp</option>
                      <option value="range-desc">Phạm vi xa nhất</option>
                      <option value="name-asc">Tên A-Z</option>
                    </select>
                  </div>

                  <div className="border-t border-gray-200"></div>

                  {/* Reset Button */}
                  <button
                    onClick={resetFilters}
                    className="w-full px-4 py-2.5 bg-gradient-to-r from-gray-100 to-gray-200 hover:from-gray-200 hover:to-gray-300 text-gray-700 font-medium rounded-lg transition-all duration-200 flex items-center justify-center space-x-2 shadow-sm"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    <span>Đặt lại bộ lọc</span>
                  </button>
                </div>

                {/* Compare Section */}
                
              </div>
            </div>

            {/* Main Content */}
            <div className="lg:col-span-3">
              {/* Header with Compare button */}
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-2xl font-medium text-gray-900">
                    {isShowingSearchResults ? 'Kết quả tìm kiếm' : 'Mẫu xe VinFast'}
                  </h2>
                  {isShowingSearchResults && (
                    <p className="text-sm text-gray-600 mt-1">
                      Tìm thấy {searchResults.length} kết quả cho "{searchTerm}"
                    </p>
                  )}
                </div>
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
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {displayVehicles.map((vehicle) => (
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
                      <div className="mb-4">
                        {(() => {
                          // Sử dụng finalPrice từ API nếu có
                          const displayFinalPrice = vehicle.finalPrice ?? vehicle.price;
                          // Kiểm tra nếu có discountId thì có discount (ngay cả khi finalPrice = price)
                          const hasDiscount = vehicle.discountId && vehicle.finalPrice !== undefined;
                          
                          if (hasDiscount && vehicle.discountId) {
                            const discount = vehicleDiscounts.get(vehicle.discountId);
                            // Nếu finalPrice khác price, hiển thị cả hai
                            if (vehicle.finalPrice && vehicle.finalPrice < vehicle.price) {
                              return (
                                <div className="space-y-1">
                                  <div className="text-lg line-through text-gray-400">{formatPrice(vehicle.price)}</div>
                                  <div className="text-2xl font-bold text-red-600">{formatPrice(displayFinalPrice)}</div>
                                  {discount && (
                                    <p className="text-xs text-red-500 font-semibold">
                                      Giảm {discount.discountType.toLowerCase() === 'percent' || discount.discountType.toLowerCase() === 'percentage' 
                                        ? `${discount.discountValue}%` 
                                        : formatPrice(discount.discountValue)}
                                    </p>
                                  )}
                                </div>
                              );
                            } else if (discount) {
                              // Nếu có discountId nhưng finalPrice = price, vẫn hiển thị thông tin discount
                              return (
                                <div className="space-y-1">
                                  <div className="text-2xl font-bold text-green-600">{formatPrice(vehicle.price)}</div>
                                  {discount && (
                                    <p className="text-xs text-blue-500 font-semibold">
                                      Mã KM: {discount.discountCode}
                                    </p>
                                  )}
                                </div>
                              );
                            }
                          }
                          return <p className="text-2xl font-bold text-green-600">{formatPrice(vehicle.price)}</p>;
                        })()}
                      </div>

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
                        
                      </div>

                      <div className="flex space-x-2">
                        <button
                          onClick={() => navigate(`/portal/car-detail/${vehicle.id}`)}
                          className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg font-medium flex items-center justify-center space-x-2"
                        >
                          <Eye className="h-4 w-4" />
                          <span>Chi tiết</span>
                        </button>
                      </div>
                    </div>
                  </div>
                  ))}
                </div>
              )}
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
                            {compareList.map(vehicle => {
                              // Sử dụng finalPrice từ API nếu có
                              const displayFinalPrice = vehicle.finalPrice ?? vehicle.price;
                              // Kiểm tra nếu có discountId thì có discount
                              const hasDiscount = vehicle.discountId && vehicle.finalPrice !== undefined;
                              
                              return (
                                <td key={vehicle.id} className="p-6 text-center">
                                  {hasDiscount && vehicle.discountId ? (
                                    (() => {
                                      const discount = vehicleDiscounts.get(vehicle.discountId);
                                      // Nếu finalPrice khác price, hiển thị cả hai
                                      if (vehicle.finalPrice && vehicle.finalPrice < vehicle.price) {
                                        return (
                                          <div className="space-y-1">
                                            <div className="text-sm line-through text-gray-400">{formatPrice(vehicle.price)}</div>
                                            <div className="font-bold text-red-600 text-lg">{formatPrice(displayFinalPrice)}</div>
                                            {discount && (
                                              <div className="text-xs text-red-500">
                                                Giảm {discount.discountType.toLowerCase() === 'percent' || discount.discountType.toLowerCase() === 'percentage' 
                                                  ? `${discount.discountValue}%` 
                                                  : formatPrice(discount.discountValue)}
                                              </div>
                                            )}
                                          </div>
                                        );
                                      } else if (discount) {
                                        // Nếu có discountId nhưng finalPrice = price
                                        return (
                                          <div className="space-y-1">
                                            <div className="font-bold text-green-600 text-lg">{formatPrice(vehicle.price)}</div>
                                            <div className="text-xs text-blue-500">
                                              Mã KM: {discount.discountCode}
                                            </div>
                                          </div>
                                        );
                                      }
                                      return <div className="font-bold text-green-600 text-lg">{formatPrice(vehicle.price)}</div>;
                                    })()
                                  ) : (
                                    <div className="font-bold text-green-600 text-lg">{formatPrice(vehicle.price)}</div>
                                  )}
                                </td>
                              );
                            })}
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
                                  {vehicle.status === 'ACTIVE' ? 'Đang bán' : vehicle.status === 'INACTIVE' ? 'Ngừng bán' : 'Đang bán'}
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