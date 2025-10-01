import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Play, Pause } from 'lucide-react';
import { mockVehicles } from '../../../data/mockData';
import { vehicleService } from '../../../services/vehicleService';
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

  const fetchVehicle = useCallback(async () => {
    if (!id) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await vehicleService.getVehicleById(id);
      console.log('Vehicle API Response:', response);
      
      if (response.success && response.data) {
        setVehicle(response.data);
        console.log('Vehicle loaded from API:', response.data);
      } else {
        console.log('No vehicle from API, using mock data');
        const mockVehicle = mockVehicles.find(v => v.id === id) || mockVehicles[0];
        setVehicle(mockVehicle);
      }
    } catch (error) {
      console.error('Failed to fetch vehicle:', error);
      setError(error instanceof Error ? error.message : 'Lỗi khi tải thông tin xe');
      // Fallback to mock data
      const mockVehicle = mockVehicles.find(v => v.id === id) || mockVehicles[0];
      setVehicle(mockVehicle);
    } finally {
      setLoading(false);
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
    
    // Fetch vehicle data
    fetchVehicle();
  }, [id, fetchVehicle]);

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
    
    // Only use images from API, no mock variations
    if (images.length === 0) {
      return ['/images/default-car.jpg'];
    }
    
    return images;
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
    <div className="min-h-screen bg-gray-50">
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
            src={getOptimizedImageUrl(availableImages[selectedImage] || '', '/images/default-car.jpg')}
            alt={vehicle.model}
            className="w-full h-full object-cover blur-lg"
            loading="eager"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              if (target.src !== '/images/default-car.jpg') {
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
            src={getOptimizedImageUrl(availableImages[selectedImage] || '', '/images/default-car.jpg')}
            alt={vehicle.model}
            className={`w-full h-auto object-contain max-h-[50vh] transition-all duration-500 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
            loading="eager"
            onLoad={handleImageLoad}
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              const originalUrl = availableImages[selectedImage] || '';
              if (originalUrl) {
                handleImageLoadError(originalUrl);
              }
              if (target.src !== '/images/default-car.jpg') {
                target.src = '/images/default-car.jpg';
              }
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
              className="border border-gray-300 text-gray-700 px-12 py-3 rounded-lg font-medium hover:bg-gray-50"
            >
              Đặt lái thử
            </button>
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
                src={getOptimizedImageUrl(availableImages[selectedImage] || '', '/images/default-car.jpg')}
                alt={vehicle.model}
                className="w-full h-auto object-contain rounded-lg shadow-lg"
                loading="lazy"
                onLoad={(e) => {
                  const target = e.target as HTMLImageElement;
                  const originalUrl = availableImages[selectedImage] || '';
                  if (originalUrl) {
                    handleImageLoadSuccess(originalUrl, target.src);
                  }
                }}
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  const originalUrl = availableImages[selectedImage] || '';
                  if (originalUrl) {
                    handleImageLoadError(originalUrl);
                  }
                  if (target.src !== '/images/default-car.jpg') {
                    target.src = '/images/default-car.jpg';
                  }
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
                      src={getOptimizedImageUrl(image, '/images/default-car.jpg')}
                      alt={`${vehicle.model} - Hình ${index + 1}`}
                      className="w-full h-20 object-cover"
                      loading="lazy"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        if (target.src !== '/images/default-car.jpg') {
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
    </div>
  );
};
