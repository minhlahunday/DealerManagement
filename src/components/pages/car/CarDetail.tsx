import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Play, Pause, Calculator, DollarSign, Percent, FileText } from 'lucide-react';
import { mockVehicles } from '../../../data/mockData';
import { vehicleService } from '../../../services/vehicleService';
import { saleService, CreateQuotationRequest, CreateOrderRequest } from '../../../services/saleService';
import { Vehicle } from '../../../types';
import { useAuth } from '../../../contexts/AuthContext';
import { getOptimizedImageUrl, handleImageLoadSuccess, handleImageLoadError } from '../../../utils/imageCache';

export const CarDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { checkToken } = useAuth();
  const [selectedImage, setSelectedImage] = useState(0);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [showContent, setShowContent] = useState(false);
  const [vehicle, setVehicle] = useState<Vehicle>(mockVehicles[0]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const autoPlayRef = useRef<NodeJS.Timeout | null>(null);
  const fetchRef = useRef<boolean>(false);
  
  // Quotation states
  const [showQuotationModal, setShowQuotationModal] = useState(false);
  const [creatingQuotation, setCreatingQuotation] = useState(false);
  const [creatingOrder, setCreatingOrder] = useState(false);
  const [createdQuotation, setCreatedQuotation] = useState<{
    quotationId: number;
    userId: number;
    vehicleId: number;
    finalPrice: number;
    status: string;
    basePrice: number;
    discount: number;
  } | null>(null);
  const [quotationForm, setQuotationForm] = useState({
    userId: 1,
    basePrice: 0,
    discount: 0,
    status: 'PENDING'
  });

  const fetchVehicle = useCallback(async () => {
    if (!id) return;
    
    // Prevent multiple simultaneous calls
    if (fetchRef.current) {
      console.log('⚠️ Fetch already in progress, skipping');
      return;
    }
    
    console.log('🔄 Fetching vehicle data for ID:', id);
    fetchRef.current = true;
    setLoading(true);
    setError(null);
    
    try {
      const response = await vehicleService.getVehicleById(id);
      console.log('Vehicle API Response:', response);
      console.log('Response structure:', {
        success: response.success,
        hasData: !!response.data,
        dataType: typeof response.data,
        dataKeys: response.data ? Object.keys(response.data) : []
      });
      
      if (response.success && response.data) {
        setVehicle(response.data);
        console.log('✅ Vehicle loaded from API:', response.data);
      } else {
        console.error('❌ No vehicle from API - response format issue');
        console.log('Response:', response);
        throw new Error('Không thể lấy thông tin xe từ API');
      }
    } catch (error) {
      console.error('Failed to fetch vehicle:', error);
      setError(error instanceof Error ? error.message : 'Lỗi khi tải thông tin xe');
      // Don't fallback to mock data - show error instead
    } finally {
      setLoading(false);
      fetchRef.current = false;
    }
  }, [id]);

  // Check token on mount
  useEffect(() => {
    console.log('=== CarDetail Component Mounted ===');
    checkToken();
  }, [checkToken]);

  // Main effect for vehicle data
  useEffect(() => {
    // Scroll to top when component mounts or ID changes
    window.scrollTo(0, 0);
    setImageLoaded(false);
    setShowContent(false);
    setSelectedImage(0);
    fetchRef.current = false; // Reset fetch flag when ID changes
    
    // Fetch vehicle data
    fetchVehicle();
  }, [id, fetchVehicle]);

  // Force show content when vehicle data is loaded
  useEffect(() => {
    if (vehicle && vehicle.id && !loading) {
      console.log('✅ Vehicle data loaded, forcing content display');
      setImageLoaded(true);
      setTimeout(() => {
        setShowContent(true);
      }, 500);
    }
  }, [vehicle, loading]);

  // Fallback timeout to show content even if images don't load
  useEffect(() => {
    const fallbackTimeout = setTimeout(() => {
      if (!showContent && !loading) {
        console.log('⚠️ Fallback: Showing content after timeout');
        setImageLoaded(true);
        setShowContent(true);
      }
    }, 3000); // 3 seconds timeout
    
    return () => clearTimeout(fallbackTimeout);
  }, [showContent, loading]);

  // Auto-play effect
  useEffect(() => {
    const images = vehicle.images || [];
    const availableImages = images.length === 0 ? ['/images/default-car.jpg'] : images;
    
    if (isAutoPlaying && availableImages.length > 1) {
      if (autoPlayRef.current) {
        clearInterval(autoPlayRef.current);
      }
      
      autoPlayRef.current = setInterval(() => {
        setSelectedImage((prev) => (prev + 1) % availableImages.length);
      }, 3000);
    } else {
      if (autoPlayRef.current) {
        clearInterval(autoPlayRef.current);
        autoPlayRef.current = null;
      }
    }

    return () => {
      if (autoPlayRef.current) {
        clearInterval(autoPlayRef.current);
        autoPlayRef.current = null;
      }
    };
  }, [isAutoPlaying, vehicle.images]);

  // Get available images from API only
  const getAvailableImages = () => {
    const images = vehicle.images || [];
    
    // Filter out empty, null, or invalid images
    const validImages = images.filter(img => 
      img && 
      img.trim() !== '' && 
      img !== 'null' && 
      img !== 'undefined'
    );
    
    // If no valid images, use default
    if (validImages.length === 0) {
      return ['/images/default-car.jpg'];
    }
    
    return validImages;
  };

  const availableImages = getAvailableImages();

  const handleImageLoad = () => {
    setImageLoaded(true);
    // Delay showing content for better visual effect
    setTimeout(() => {
      setShowContent(true);
    }, 500);
  };

  // Auto-play functionality
  const startAutoPlay = useCallback(() => {
    if (autoPlayRef.current) {
      clearInterval(autoPlayRef.current);
    }
    
    if (isAutoPlaying && availableImages.length > 1) {
      autoPlayRef.current = setInterval(() => {
        setSelectedImage((prev) => (prev + 1) % availableImages.length);
      }, 3000); // Change image every 3 seconds
    }
  }, [isAutoPlaying, availableImages.length]);

  const stopAutoPlay = useCallback(() => {
    if (autoPlayRef.current) {
      clearInterval(autoPlayRef.current);
      autoPlayRef.current = null;
    }
  }, []);

  const toggleAutoPlay = () => {
    setIsAutoPlaying(!isAutoPlaying);
  };

  const goToNextImage = () => {
    setSelectedImage((prev) => (prev + 1) % availableImages.length);
  };

  const goToPreviousImage = () => {
    setSelectedImage((prev) => (prev - 1 + availableImages.length) % availableImages.length);
  };

  const goToImage = (index: number) => {
    setSelectedImage(index);
  };

  // Quotation handlers
  const handleCreateQuotation = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreatingQuotation(true);

    try {
      // Calculate final price
      const finalPrice = quotationForm.basePrice - quotationForm.discount;
      
      const quotationData: CreateQuotationRequest = {
        quotationId: 0, // Will be set by backend
        userId: quotationForm.userId,
        vehicleId: parseInt(vehicle.id),
        quotationDate: new Date().toISOString(),
        basePrice: quotationForm.basePrice,
        discount: quotationForm.discount,
        finalPrice: finalPrice,
        status: quotationForm.status
      };

      console.log('🔄 Creating quotation for vehicle:', vehicle.model, 'with data:', quotationData);
      const quotationResponse = await saleService.createQuotation(quotationData);

      if (quotationResponse.success || (quotationResponse.message && quotationResponse.message.includes('thành công'))) {
        console.log('✅ Quotation created successfully:', quotationResponse);
        
        // Save created quotation data for order creation
        const quotationData = {
          quotationId: quotationResponse.data?.quotationId || 0,
          userId: quotationForm.userId,
          vehicleId: parseInt(vehicle.id),
          finalPrice: finalPrice,
          status: quotationForm.status,
          basePrice: quotationForm.basePrice,
          discount: quotationForm.discount
        };
        
        setCreatedQuotation(quotationData);
        setShowQuotationModal(false);
        setQuotationForm({
          userId: 1,
          basePrice: 0,
          discount: 0,
          status: 'PENDING'
        });
        
        const statusText = quotationForm.status === 'PENDING' ? 'chờ duyệt' : 
                         quotationForm.status === 'APPROVED' ? 'đã chấp nhận' :
                         quotationForm.status === 'REJECTED' ? 'bị từ chối' : 
                         quotationForm.status === 'SENT' ? 'đã gửi' : quotationForm.status;
        
        alert(`✅ Báo giá đã được tạo thành công với trạng thái "${statusText}"!\n📋 ${quotationResponse.message}\n\n💡 Bạn có thể tạo đơn hàng ngay bây giờ bằng nút "Tạo đơn hàng" bên dưới.`);
      } else {
        console.error('❌ Failed to create quotation:', quotationResponse.message);
        alert(`❌ Lỗi khi tạo báo giá: ${quotationResponse.message}`);
      }
    } catch (error) {
      console.error('❌ Error creating quotation:', error);
      alert(`Lỗi khi tạo báo giá: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setCreatingQuotation(false);
    }
  };

  const openQuotationModal = () => {
    // Set base price to vehicle price
    setQuotationForm({
      ...quotationForm,
      basePrice: vehicle.price || 0
    });
    setShowQuotationModal(true);
  };

  // Create order from created quotation
  const handleCreateOrder = async () => {
    if (!createdQuotation) {
      alert('❌ Không có báo giá để tạo đơn hàng!');
      return;
    }

    setCreatingOrder(true);

    try {
      const orderData: CreateOrderRequest = {
        orderId: 0, // Will be set by backend
        quotationId: createdQuotation.quotationId || 0,
        userId: createdQuotation.userId || quotationForm.userId,
        vehicleId: parseInt(vehicle.id),
        orderDate: new Date().toISOString(),
        status: 'PENDING',
        totalAmount: createdQuotation.finalPrice || (quotationForm.basePrice - quotationForm.discount)
      };

      console.log('🔄 Creating order from quotation:', orderData);
      const orderResponse = await saleService.createOrder(orderData);

      if (orderResponse.success || (orderResponse.message && orderResponse.message.includes('thành công'))) {
        console.log('✅ Order created successfully:', orderResponse);
        setCreatedQuotation(null); // Clear created quotation
        alert(`✅ Đơn hàng đã được tạo thành công!\n📦 ${orderResponse.message}`);
      } else {
        console.error('❌ Failed to create order:', orderResponse.message);
        alert(`❌ Lỗi khi tạo đơn hàng: ${orderResponse.message}`);
      }
    } catch (error) {
      console.error('❌ Error creating order:', error);
      alert(`Lỗi khi tạo đơn hàng: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setCreatingOrder(false);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  const specifications = [
    { label: 'Acceleration 0-100 km/h', value: '5.7s', description: 'with Launch Control' },
    { label: 'Overboost Power', value: '265 kW / 360 PS', description: 'with Launch Control up to [kW]/Overboost Power with Launch Control up to [PS]' },
    { label: 'Top speed', value: vehicle.speed || `${vehicle.maxSpeed} km/h`, description: '' }
  ];

  return (
    <div>
      {/* Loading State */}
      {loading && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto mb-4"></div>
            <p className="text-gray-600">Đang tải thông tin xe...</p>
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

      {/* Info State - Show data source info */}
      {/* {!loading && vehicle && (
        <div className={`border rounded-lg p-4 mx-4 mt-4 ${
          vehicle === mockVehicles.find(v => v.id === id) || vehicle === mockVehicles[0]
            ? 'bg-blue-50 border-blue-200' 
            : 'bg-green-50 border-green-200'
        }`}>
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className={`h-5 w-5 ${
                vehicle === mockVehicles.find(v => v.id === id) || vehicle === mockVehicles[0]
                  ? 'text-blue-400' : 'text-green-400'
              }`} viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className={`text-sm font-medium ${
                vehicle === mockVehicles.find(v => v.id === id) || vehicle === mockVehicles[0]
                  ? 'text-blue-800' : 'text-green-800'
              }`}>
                {vehicle === mockVehicles.find(v => v.id === id) || vehicle === mockVehicles[0]
                  ? 'Đang sử dụng dữ liệu mẫu' : 'Dữ liệu từ Backend API'}
              </h3>
              <div className={`mt-2 text-sm ${
                vehicle === mockVehicles.find(v => v.id === id) || vehicle === mockVehicles[0]
                  ? 'text-blue-700' : 'text-green-700'
              }`}>
                <p>
                  {vehicle === mockVehicles.find(v => v.id === id) || vehicle === mockVehicles[0]
                    ? 'Backend API chưa sẵn sàng hoặc yêu cầu quyền truy cập. Hiển thị dữ liệu mẫu để demo.'
                    : `Đã tải thành công thông tin xe ${vehicle.model} từ database.`
                  }
                </p>
              </div>
            </div>
          </div>
        </div>
      )} */}

      {/* Hero Section with Vehicle Name */}
      <div className="relative bg-gradient-to-r from-blue-900 via-purple-900 to-blue-900 h-[70vh] flex items-center justify-center overflow-hidden">
        {/* Back Button */}
        <div className="absolute top-6 left-6 z-20">
          <button 
            onClick={() => navigate(-1)}
            className="inline-flex items-center bg-black/20 backdrop-blur-sm hover:bg-black/30 text-white px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 group border border-white/20"
          >
            <svg className="w-4 h-4 mr-2 transition-transform duration-200 group-hover:-translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Trở lại
          </button>
        </div>

        {/* Background Car Image */}
        <div className="absolute inset-0 opacity-10">
          <img
            src={(() => {
              const imageUrl = availableImages[selectedImage];
              if (!imageUrl || imageUrl === '/images/default-car.jpg') {
                return '/images/default-car.jpg';
              }
              return getOptimizedImageUrl(imageUrl, '/images/default-car.jpg');
            })()}
            alt={vehicle.model}
            className="w-full h-full object-cover blur-lg"
            loading="eager"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              const originalUrl = availableImages[selectedImage];
              if (originalUrl && originalUrl !== '/images/default-car.jpg') {
                handleImageLoadError(originalUrl);
              }
              if (target.src !== '/images/default-car.jpg' && !target.src.includes('default-car.jpg')) {
                target.src = '/images/default-car.jpg';
              }
            }}
          />
        </div>
        
        {/* Carousel Container */}
        <div className="relative z-10 w-full max-w-4xl">
          {/* Navigation Arrows */}
          {availableImages.length > 1 && (
            <>
              <button
                onClick={goToPreviousImage}
                className="absolute left-4 top-1/2 transform -translate-y-1/2 z-20 bg-black/20 backdrop-blur-sm hover:bg-black/40 text-white p-3 rounded-full transition-all duration-200 group"
                onMouseEnter={stopAutoPlay}
                onMouseLeave={() => isAutoPlaying && startAutoPlay()}
              >
                <ChevronLeft className="h-6 w-6 group-hover:scale-110 transition-transform" />
              </button>
              
              <button
                onClick={goToNextImage}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 z-20 bg-black/20 backdrop-blur-sm hover:bg-black/40 text-white p-3 rounded-full transition-all duration-200 group"
                onMouseEnter={stopAutoPlay}
                onMouseLeave={() => isAutoPlaying && startAutoPlay()}
              >
                <ChevronRight className="h-6 w-6 group-hover:scale-110 transition-transform" />
              </button>
            </>
          )}

          {/* Auto-play Toggle */}
          {availableImages.length > 1 && (
            <button
              onClick={toggleAutoPlay}
              className="absolute top-4 right-4 z-20 bg-black/20 backdrop-blur-sm hover:bg-black/40 text-white p-2 rounded-full transition-all duration-200"
            >
              {isAutoPlaying ? (
                <Pause className="h-5 w-5" />
              ) : (
                <Play className="h-5 w-5" />
              )}
            </button>
          )}

          {/* Main Car Image */}
          {!imageLoaded && (
            <div className="w-full h-64 flex items-center justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
            </div>
          )}
          <img
            src={(() => {
              const imageUrl = availableImages[selectedImage];
              if (!imageUrl || imageUrl === '/images/default-car.jpg') {
                return '/images/default-car.jpg';
              }
              return getOptimizedImageUrl(imageUrl, '/images/default-car.jpg');
            })()}
            alt={vehicle.model}
            className={`w-full h-auto object-contain max-h-[50vh] transition-all duration-500 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
            loading="eager"
            onLoad={handleImageLoad}
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              const originalUrl = availableImages[selectedImage];
              console.log('Main image load error for:', vehicle.model, 'URL:', originalUrl);
              
              if (originalUrl && originalUrl !== '/images/default-car.jpg') {
                handleImageLoadError(originalUrl);
              }
              
              if (target.src !== '/images/default-car.jpg' && !target.src.includes('default-car.jpg')) {
                target.src = '/images/default-car.jpg';
              }
              
              // Force show content even if image fails to load
              setImageLoaded(true);
              setTimeout(() => {
                setShowContent(true);
              }, 100);
            }}
          />

          {/* Image Dots */}
          {availableImages.length > 1 && (
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-20 flex space-x-2">
              {availableImages.map((_, index) => (
                <button
                  key={index}
                  onClick={() => goToImage(index)}
                  className={`w-3 h-3 rounded-full transition-all duration-200 ${
                    index === selectedImage
                      ? 'bg-white scale-125'
                      : 'bg-white/50 hover:bg-white/75'
                  }`}
                  onMouseEnter={stopAutoPlay}
                  onMouseLeave={() => isAutoPlaying && startAutoPlay()}
                />
              ))}
            </div>
          )}
        </div>

        {/* Vehicle Name Overlay with fade-in effect */}
        <div className={`absolute inset-0 flex items-center justify-center transition-opacity duration-1000 ${showContent ? 'opacity-90' : 'opacity-0'}`}>
          <h1 className="text-6xl font-light text-white italic tracking-wider">
            {vehicle.model}
          </h1>
        </div>

        {/* Bottom Info with fade-in effect */}
        {/* <div className={`absolute bottom-8 left-1/2 transform -translate-x-1/2 text-center transition-opacity duration-1000 delay-300 ${showContent ? 'opacity-100' : 'opacity-0'}`}>
          <p className="text-white text-sm mb-2">SUV</p>
          <p className="text-white text-sm">{vehicle.model} Electric</p>
        </div> */}
      </div>

      {/* Vehicle Title Section with fade-in effect */}
      <div className={`bg-white py-16 transition-opacity duration-1000 delay-500 ${showContent ? 'opacity-100' : 'opacity-0'}`}>
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h2 className="text-5xl font-light text-gray-900 mb-4">Vinfast {vehicle.model} Electric</h2>
          <p className="text-gray-600">{vehicle.type || 'SUV'} - {vehicle.version}</p>
          {vehicle.status && (
            <div className="mt-4">
              <span className={`px-4 py-2 rounded-full text-sm font-medium ${
                vehicle.status === 'ACTIVE' 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-gray-100 text-gray-800'
              }`}>
                {vehicle.status}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Additional Vehicle Info - Stats Section with fade-in effect */}
      <div className={`bg-gray-50 py-16 transition-opacity duration-1000 delay-700 ${showContent ? 'opacity-100' : 'opacity-0'}`}>
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600 mb-2">{vehicle.distance || `${vehicle.range} km`}</div>
              <p className="text-gray-600">Phạm vi</p>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600 mb-2">{vehicle.speed || `${vehicle.maxSpeed} km/h`}</div>
              <p className="text-gray-600">Tốc độ tối đa</p>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600 mb-2">{formatPrice(vehicle.price)}</div>
              <p className="text-gray-600">Giá bán</p>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600 mb-2">{vehicle.timecharging || vehicle.chargingTime}</div>
              <p className="text-gray-600">Thời gian sạc</p>
            </div>
          </div>
          
          <div className="mt-12 text-center">
            <button
              onClick={() => navigate(`/car-deposit?vehicleId=${vehicle.id}`)}
              className="bg-black hover:bg-gray-800 text-white px-12 py-3 rounded-lg font-medium mr-4"
            >
              Đặt cọc ngay
            </button>
            <button
              onClick={() => navigate(`/portal/test-drive?vehicleId=${vehicle.id}`)}
              className="border border-gray-300 text-gray-700 px-12 py-3 rounded-lg font-medium hover:bg-gray-50 mr-4"
            >
              Đặt lái thử
            </button>
            <button
              onClick={openQuotationModal}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-12 py-3 rounded-lg font-medium shadow-lg transition-all duration-200 transform hover:scale-105 mr-4"
            >
              <Calculator className="inline h-5 w-5 mr-2" />
              Tạo báo giá
            </button>
            {createdQuotation && (
              <button
                onClick={handleCreateOrder}
                disabled={creatingOrder}
                className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-12 py-3 rounded-lg font-medium shadow-lg transition-all duration-200 transform hover:scale-105 disabled:opacity-50"
              >
                {creatingOrder ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white inline mr-2"></div>
                    Đang tạo...
                  </>
                ) : (
                  <>
                    <FileText className="inline h-5 w-5 mr-2" />
                    Tạo đơn hàng
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Content - MOVED TO BOTTOM with fade-in effect */}
      <div className={`max-w-7xl mx-auto px-4 py-8 bg-white transition-opacity duration-1000 delay-1000 ${showContent ? 'opacity-100' : 'opacity-0'}`}>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          {/* Left Side - Specifications */}
          <div className="space-y-12">
            {specifications.map((spec, index) => (
              <div key={index} className="space-y-2">
                <div className="text-6xl font-light text-gray-900">
                  {spec.value.split(' ')[0]}
                  <span className="text-2xl ml-2">{spec.value.split(' ').slice(1).join(' ')}</span>
                </div>
                <h3 className="text-lg font-medium text-gray-900">{spec.label}</h3>
                {spec.description && (
                  <p className="text-sm text-gray-600 max-w-md">{spec.description}</p>
                )}
              </div>
            ))}
            
            <div className="pt-8">
              <button className="border border-gray-300 text-gray-700 px-6 py-2 rounded text-sm font-medium hover:bg-gray-50">
                Xem tất cả thông số kỹ thuật
              </button>
            </div>
          </div>

          {/* Right Side - Vehicle Image Gallery */}
          <div className="relative">
            {/* Main Image */}
            <div className="relative mb-4">
              <img
                src={(() => {
                  const imageUrl = availableImages[selectedImage];
                  if (!imageUrl || imageUrl === '/images/default-car.jpg') {
                    return '/images/default-car.jpg';
                  }
                  return getOptimizedImageUrl(imageUrl, '/images/default-car.jpg');
                })()}
                alt={vehicle.model}
                className="w-full h-auto object-contain rounded-lg shadow-lg"
                loading="lazy"
                onLoad={(e) => {
                  const target = e.target as HTMLImageElement;
                  const originalUrl = availableImages[selectedImage];
                  if (originalUrl && originalUrl !== '/images/default-car.jpg') {
                    handleImageLoadSuccess(originalUrl, target.src);
                  }
                }}
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  const originalUrl = availableImages[selectedImage];
                  console.log('Detail image load error for:', vehicle.model, 'URL:', originalUrl);
                  
                  if (originalUrl && originalUrl !== '/images/default-car.jpg') {
                    handleImageLoadError(originalUrl);
                  }
                  
                  if (target.src !== '/images/default-car.jpg' && !target.src.includes('default-car.jpg')) {
                    target.src = '/images/default-car.jpg';
                  }
                  
                  // Force show content even if image fails to load
                  setImageLoaded(true);
                  setTimeout(() => {
                    setShowContent(true);
                  }, 100);
                }}
              />
            </div>

            {/* Thumbnail Gallery */}
            {availableImages.length > 1 && (
              <div className="grid grid-cols-3 gap-2">
                {availableImages.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => goToImage(index)}
                    className={`relative overflow-hidden rounded-lg transition-all duration-200 ${
                      index === selectedImage
                        ? 'ring-2 ring-blue-500 scale-105'
                        : 'hover:scale-105 opacity-70 hover:opacity-100'
                    }`}
                    onMouseEnter={stopAutoPlay}
                    onMouseLeave={() => isAutoPlaying && startAutoPlay()}
                  >
                    <img
                      src={(() => {
                        if (!image || image === '/images/default-car.jpg') {
                          return '/images/default-car.jpg';
                        }
                        return getOptimizedImageUrl(image, '/images/default-car.jpg');
                      })()}
                      alt={`${vehicle.model} - Hình ${index + 1}`}
                      className="w-full h-20 object-cover"
                      loading="lazy"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        console.log('Thumbnail load error for:', image);
                        
                        if (image && image !== '/images/default-car.jpg') {
                          handleImageLoadError(image);
                        }
                        
                        if (target.src !== '/images/default-car.jpg' && !target.src.includes('default-car.jpg')) {
                          target.src = '/images/default-car.jpg';
                        }
                      }}
                    />
                    {index === selectedImage && (
                      <div className="absolute inset-0 bg-blue-500/20 flex items-center justify-center">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      </div>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quotation Modal */}
      {showQuotationModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl transform transition-all">
            {/* Header */}
            <div className="bg-gradient-to-r from-purple-500 to-pink-600 text-white p-6 rounded-t-2xl">
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-white bg-opacity-20 rounded-xl flex items-center justify-center">
                    <Calculator className="h-6 w-6" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">Tạo báo giá</h2>
                    <p className="text-purple-100 text-sm">Vinfast {vehicle.model}</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowQuotationModal(false)}
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
                {/* Vehicle Info */}
                <div className="bg-gradient-to-r from-gray-50 to-slate-50 rounded-xl p-4 border border-gray-200">
                  <h3 className="text-sm font-semibold text-gray-700 mb-2 flex items-center space-x-2">
                    <FileText className="h-4 w-4 text-purple-600" />
                    <span>Thông tin xe</span>
                  </h3>
                  <div className="text-sm text-gray-600">
                    <p><strong>Model:</strong> {vehicle.model}</p>
                    <p><strong>Type:</strong> {vehicle.type || 'SUV'}</p>
                    <p><strong>Version:</strong> {vehicle.version}</p>
                  </div>
                </div>

                {/* Row 1: User ID & Base Price */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700">
                      <DollarSign className="h-4 w-4 text-purple-600" />
                      <span>ID Khách hàng *</span>
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        required
                        value={quotationForm.userId}
                        onChange={(e) => setQuotationForm({...quotationForm, userId: parseInt(e.target.value)})}
                        className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:border-purple-500 focus:ring-2 focus:ring-purple-100 transition-all duration-200 bg-gray-50 focus:bg-white"
                        placeholder="Nhập ID khách hàng"
                      />
                      {/* <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                        <DollarSign className="h-5 w-5 text-gray-400" />
                      </div> */}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700">
                      <DollarSign className="h-4 w-4 text-purple-600" />
                      <span>Giá gốc *</span>
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        required
                        value={quotationForm.basePrice}
                        onChange={(e) => setQuotationForm({...quotationForm, basePrice: parseFloat(e.target.value)})}
                        className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:border-purple-500 focus:ring-2 focus:ring-purple-100 transition-all duration-200 bg-gray-50 focus:bg-white"
                        placeholder="Nhập giá gốc"
                      />
                      <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                        <span className="text-gray-400 text-sm">VND</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Row 2: Discount & Status */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700">
                      <Percent className="h-4 w-4 text-purple-600" />
                      <span>Giảm giá</span>
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        value={quotationForm.discount}
                        onChange={(e) => setQuotationForm({...quotationForm, discount: parseFloat(e.target.value)})}
                        className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:border-purple-500 focus:ring-2 focus:ring-purple-100 transition-all duration-200 bg-gray-50 focus:bg-white"
                        placeholder="Nhập số tiền giảm giá"
                      />
                      <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                        <span className="text-gray-400 text-sm">VND</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700">
                      <FileText className="h-4 w-4 text-purple-600" />
                      <span>Trạng thái *</span>
                    </label>
                    <div className="relative">
                      <select
                        required
                        value={quotationForm.status}
                        onChange={(e) => setQuotationForm({...quotationForm, status: e.target.value})}
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
                </div>

                {/* Price Summary */}
                <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-4 border border-purple-200">
                  <h3 className="text-sm font-semibold text-gray-700 mb-2">Tóm tắt giá</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Giá gốc:</span>
                      <span className="font-semibold">{formatPrice(quotationForm.basePrice)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Giảm giá:</span>
                      <span className="font-semibold text-red-600">-{formatPrice(quotationForm.discount)}</span>
                    </div>
                    <div className="border-t pt-2 flex justify-between">
                      <span className="text-gray-900 font-bold">Tổng cộng:</span>
                      <span className="font-bold text-purple-600">{formatPrice(quotationForm.basePrice - quotationForm.discount)}</span>
                    </div>
                  </div>
                </div>
              </form>
            </div>

            {/* Footer */}
            <div className="bg-gray-50 px-6 py-4 rounded-b-2xl flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setShowQuotationModal(false)}
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
                <Calculator className="h-4 w-4" />
                <span>{creatingQuotation ? 'Đang tạo...' : 'Tạo báo giá'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
