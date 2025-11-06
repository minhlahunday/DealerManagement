import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Play, Pause, Calculator, DollarSign, FileText, X } from 'lucide-react';
import { mockVehicles } from '../../../data/mockData';
import { vehicleService } from '../../../services/vehicleService';
import { saleService, CreateQuotationRequest } from '../../../services/saleService';
import { promotionService, Promotion } from '../../../services/promotionService';
import { discountService, Discount } from '../../../services/discountService';
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
  const [quotationForm, setQuotationForm] = useState({
    userId: 1,
    basePrice: 0,
    discount: 0,
    discountCode: '',
    promotionCode: '',
    promotionOptionName: '',
    color: '',
    attachmentImage: '',
    attachmentFile: '',
    status: 'PENDING'
  });

  // Promotion states
  const [activePromotions, setActivePromotions] = useState<Promotion[]>([]);
  const [promotionError, setPromotionError] = useState<string>('');
  const [loadingPromotions, setLoadingPromotions] = useState(false);
  
  // Discount states - lưu thông tin discount để hiển thị
  const [vehicleDiscounts, setVehicleDiscounts] = useState<Map<number, Discount>>(new Map());
  
  // Final price for quotation form (tính từ basePrice và discount trong form)
  const [quotationFinalPrice, setQuotationFinalPrice] = useState(0);

  // Fetch discounts để lấy thông tin discount (tên, giá trị, v.v.) để hiển thị
  const fetchDiscounts = useCallback(async () => {
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
  }, []);

  const fetchVehicle = useCallback(async () => {
    if (!id) return;
    
    // Prevent multiple simultaneous calls
    if (fetchRef.current) {
      console.log('⚠️ Fetch already in progress, skipping');
      return;
    }
    
    console.log('🔄 Đang lấy dữ liệu xe cho ID:', id);
    fetchRef.current = true;
    setLoading(true);
    setError(null);
    
    try {
      const response = await vehicleService.getVehicleById(id);
      console.log('Phản hồi API Xe:', response);
      console.log('Cấu trúc phản hồi:', {
        success: response.success,
        hasData: !!response.data,
        dataType: typeof response.data,
        dataKeys: response.data ? Object.keys(response.data) : []
      });
      
      if (response.success && response.data) {
        setVehicle(response.data);
        console.log('✅ Đã tải xe từ API:', response.data);
      } else {
        console.error('❌ Không có xe từ API - vấn đề về định dạng phản hồi');
        console.log('Phản hồi:', response);
        throw new Error('Không thể lấy thông tin xe từ API');
      }
    } catch (error) {
      console.error('Lỗi khi lấy xe:', error);
      setError(error instanceof Error ? error.message : 'Lỗi khi tải thông tin xe');
      // Don't fallback to mock data - show error instead
    } finally {
      setLoading(false);
      fetchRef.current = false;
    }
  }, [id]);

  // Fetch active promotions
  const fetchActivePromotions = async () => {
    setLoadingPromotions(true);
    try {
      const response = await promotionService.getPromotions();
      if (response.success && response.data) {
        // Filter only active promotions (current date between startDate and endDate)
        const now = new Date();
        const active = response.data.filter(promo => {
          const startDate = new Date(promo.startDate);
          const endDate = new Date(promo.endDate);
          return now >= startDate && now <= endDate;
        });
        setActivePromotions(active);
        console.log('✅ Active promotions loaded:', active);
      }
    } catch (error) {
      console.error('❌ Error loading promotions:', error);
    } finally {
      setLoadingPromotions(false);
    }
  };
  
  // Check token on mount
  useEffect(() => {
    console.log('=== CarDetail Component Đã Mount ===');
    checkToken();
    fetchActivePromotions(); // Fetch active promotions
    fetchDiscounts(); // Fetch discounts để hiển thị thông tin
  }, [checkToken, fetchDiscounts]);

  // Validate promotion code
  const validatePromotionCode = (code: string): { valid: boolean; promotion?: Promotion; error?: string } => {
    if (!code) return { valid: false };
    
    const promotion = activePromotions.find(
      p => p.promotionCode.toUpperCase() === code.toUpperCase()
    );
    
    if (!promotion) {
      return { valid: false, error: 'Mã khuyến mãi không hợp lệ hoặc không đang diễn ra!' };
    }
    
    // Check stock
    if (promotion.stock <= 0) {
      return { valid: false, error: 'Mã khuyến mãi này đã hết hàng! Vui lòng chọn mã khác.', promotion };
    }
    
    return { valid: true, promotion };
  };

  // Handle promotion code change with validation
  const handlePromotionCodeChange = (code: string) => {
    const upperCode = code.toUpperCase();
    
    // Update form
    setQuotationForm({
      ...quotationForm, 
      promotionCode: upperCode, 
      discountCode: upperCode,
      promotionOptionName: '' // Clear option name first
    });
    
    // Clear previous error
    setPromotionError('');
    
    // If code is empty, no validation needed
    if (!upperCode) {
      return;
    }
    
    // Validate promotion code
    const validation = validatePromotionCode(upperCode);
    
    if (validation.valid && validation.promotion) {
      // Valid promotion - auto-fill option name
      setQuotationForm(prev => ({
        ...prev,
        promotionCode: upperCode,
        discountCode: upperCode,
        promotionOptionName: validation.promotion!.optionName
      }));
      setPromotionError('');
      console.log('✅ Valid promotion:', validation.promotion);
    } else {
      // Invalid promotion or out of stock
      setPromotionError(validation.error || 'Mã khuyến mãi không hợp lệ!');
      console.warn('⚠️ Invalid promotion code:', upperCode, validation.error);
    }
  };

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

  // Auto-play effect - optimized for 3 images
  useEffect(() => {
    const images = vehicle.images || [];
    
    // Filter out empty, null, or invalid images
    const validImages = images.filter(img => 
      img && 
      img.trim() !== '' && 
      img !== 'null' && 
      img !== 'undefined'
    );
    
    // Remove duplicates to get unique images
    const uniqueImages = [...new Set(validImages)];
    
    // Ensure we have exactly 3 images
    let availableImages;
    if (uniqueImages.length === 0) {
      availableImages = ['/images/default-car.jpg', '/images/default-car.jpg', '/images/default-car.jpg'];
    } else if (uniqueImages.length === 3) {
      availableImages = uniqueImages;
    } else if (uniqueImages.length > 3) {
      availableImages = uniqueImages.slice(0, 3);
    } else {
      const result = [...uniqueImages];
      while (result.length < 3) {
        if (result.length === 1) {
          result.push(result[0]);
          result.push(result[0]);
        } else if (result.length === 2) {
          result.push(result[0]);
        }
      }
      availableImages = result;
    }
    
    if (isAutoPlaying && availableImages.length > 1) {
      if (autoPlayRef.current) {
        clearInterval(autoPlayRef.current);
      }
      
      autoPlayRef.current = setInterval(() => {
        setSelectedImage((prev) => (prev + 1) % availableImages.length);
      }, 3000); // Change image every 3 seconds
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

  // Get available images from API only - ensure we have exactly 3 unique images
  const getAvailableImages = () => {
    const images = vehicle.images || [];
    
    console.log('🖼️ CarDetail - Raw images from API:', images);
    console.log('🖼️ CarDetail - Images length:', images.length);
    
    // Filter out empty, null, or invalid images
    const validImages = images.filter(img => 
      img && 
      img.trim() !== '' && 
      img !== 'null' && 
      img !== 'undefined'
    );
    
    console.log('🖼️ CarDetail - Valid images after filtering:', validImages);
    console.log('🖼️ CarDetail - Valid images length:', validImages.length);
    
    // Remove duplicates to get unique images
    const uniqueImages = [...new Set(validImages)];
    console.log('🖼️ CarDetail - Unique images after removing duplicates:', uniqueImages);
    console.log('🖼️ CarDetail - Unique images length:', uniqueImages.length);
    
    // If no valid images, use default
    if (uniqueImages.length === 0) {
      console.log('🖼️ CarDetail - No valid images, using default');
      return ['/images/default-car.jpg', '/images/default-car.jpg', '/images/default-car.jpg'];
    }
    
    // If we have exactly 3 unique images, return them
    if (uniqueImages.length === 3) {
      console.log('🖼️ CarDetail - Exactly 3 unique images, returning all');
      return uniqueImages;
    }
    
    // If we have more than 3 unique images, take the first 3
    if (uniqueImages.length > 3) {
      console.log('🖼️ CarDetail - More than 3 unique images, taking first 3');
      return uniqueImages.slice(0, 3);
    }
    
    // If we have less than 3 unique images, add variations to make 3
    console.log('🖼️ CarDetail - Less than 3 unique images, adding variations to make 3');
    const result = [...uniqueImages];
    
    // Add different angles/variations of the same car if we have only 1-2 unique images
    while (result.length < 3) {
      if (result.length === 1) {
        // If we only have 1 image, add 2 more variations
        result.push(result[0]); // Same image for consistency
        result.push(result[0]); // Same image for consistency
      } else if (result.length === 2) {
        // If we have 2 images, add the first one again
        result.push(result[0]);
      }
    }
    
    console.log('🖼️ CarDetail - Final result with variations:', result);
    return result;
  };

  const availableImages = getAvailableImages();
  
  // Debug log for availableImages
  console.log('🖼️ CarDetail - availableImages for render:', availableImages);
  console.log('🖼️ CarDetail - availableImages length for render:', availableImages.length);

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
    
    // Check if promotion code is valid and has stock
    if (quotationForm.promotionCode || quotationForm.discountCode) {
      const codeToValidate = quotationForm.promotionCode || quotationForm.discountCode;
      const validation = validatePromotionCode(codeToValidate);
      
      if (!validation.valid) {
        setPromotionError(validation.error || 'Mã khuyến mãi không hợp lệ!');
        alert(`❌ ${validation.error || 'Mã khuyến mãi không hợp lệ!'}`);
        return;
      }
      
      if (validation.promotion && validation.promotion.stock <= 0) {
        setPromotionError('Mã khuyến mãi này đã hết hàng! Vui lòng chọn mã khác.');
        alert('❌ Mã khuyến mãi này đã hết hàng! Không thể tạo báo giá với mã này.');
        return;
      }
    }
    
    setCreatingQuotation(true);

    try {
      // Ensure basePrice and discount are valid numbers
      const basePrice = Number(quotationForm.basePrice) || 0;
      const discount = Number(quotationForm.discount) || 0;
      
      // Calculate final price
      const calculatedFinalPrice = basePrice - discount;
      
      const quotationData: CreateQuotationRequest = {
        quotationId: 0, // Will be set by backend
        userId: quotationForm.userId,
        vehicleId: parseInt(vehicle.id),
        quotationDate: new Date().toISOString(),
        color: quotationForm.color || '',
        basePrice: basePrice,
        finalPrice: calculatedFinalPrice,
        attachmentImage: quotationForm.attachmentImage || '',
        attachmentFile: quotationForm.attachmentFile || '',
        promotionCode: quotationForm.promotionCode || quotationForm.discountCode || '',
        promotionOptionName: quotationForm.promotionOptionName || '',
        status: 'PENDING' // Always set to PENDING for new quotations
      };

      console.log('🔄 Đang tạo báo giá cho xe:', vehicle.model, 'với dữ liệu:', quotationData);
      console.log('📊 Calculation check:', { basePrice, discount, calculatedFinalPrice });
      const quotationResponse = await saleService.createQuotation(quotationData);

      if (quotationResponse.success || (quotationResponse.message && quotationResponse.message.includes('thành công'))) {
        console.log('✅ Quotation created successfully:', quotationResponse);
        
        setShowQuotationModal(false);
        setQuotationForm({
          userId: 1,
          basePrice: 0,
          discount: 0,
          discountCode: '',
          promotionCode: '',
          promotionOptionName: '',
          color: '',
          attachmentImage: '',
          attachmentFile: '',
          status: 'PENDING'
        });
        setQuotationFinalPrice(0);
        
        alert(`✅ Báo giá đã được tạo thành công với trạng thái "chờ duyệt"!\n📋 ${quotationResponse.message}`);
      } else {
        console.error('❌ Lỗi khi tạo báo giá:', quotationResponse.message);
        alert(`❌ Lỗi khi tạo báo giá: ${quotationResponse.message}`);
      }
    } catch (error) {
      console.error('❌ Lỗi khi tạo báo giá:', error);
      alert(`Lỗi khi tạo báo giá: ${error instanceof Error ? error.message : 'Lỗi không xác định'}`);
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


  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  const specifications = [
    {
      label: 'Động cơ & Hiệu suất',
      value: '',
      description:
        'Xe điện VinFast được trang bị động cơ điện mạnh mẽ, cho khả năng tăng tốc ấn tượng, vận hành êm ái và thân thiện với môi trường. Công suất cực đại mang đến trải nghiệm lái phấn khích, đồng thời đảm bảo hiệu suất ổn định trong mọi điều kiện di chuyển. Hệ thống truyền động tiên tiến giúp xe phản hồi tức thì, mang lại cảm giác lái mượt mà, linh hoạt và đầy hứng khởi.'
    },
    {
      label: 'Tốc độ tối đa',
      value: vehicle.speed || `${vehicle.maxSpeed} km/h`,
      description: ''
    }
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
          {/* Navigation Arrows - Show when we have multiple images */}
          {availableImages.length > 1 && (
            <>
              <button
                onClick={goToPreviousImage}
                className="absolute left-4 top-1/2 transform -translate-y-1/2 z-20 bg-black/20 backdrop-blur-sm hover:bg-black/40 text-white p-3 rounded-full transition-all duration-200 group"
                onMouseEnter={stopAutoPlay}
                onMouseLeave={() => isAutoPlaying && startAutoPlay()}
                title="Ảnh trước"
              >
                <ChevronLeft className="h-6 w-6 group-hover:scale-110 transition-transform" />
              </button>
              
              <button
                onClick={goToNextImage}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 z-20 bg-black/20 backdrop-blur-sm hover:bg-black/40 text-white p-3 rounded-full transition-all duration-200 group"
                onMouseEnter={stopAutoPlay}
                onMouseLeave={() => isAutoPlaying && startAutoPlay()}
                title="Ảnh tiếp theo"
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
              title={isAutoPlaying ? "Tạm dừng tự động chuyển ảnh" : "Bắt đầu tự động chuyển ảnh"}
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

          {/* Image Dots - Always show 3 dots */}
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
              <div className="text-3xl font-bold text-green-600 mb-2">
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
                          <div className="text-2xl line-through text-gray-400">{formatPrice(vehicle.price)}</div>
                          <div className="text-3xl text-red-600">{formatPrice(displayFinalPrice)}</div>
                          {discount && (
                            <p className="text-xs text-red-600 mt-1 font-semibold">
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
                          <div className="text-3xl font-bold text-green-600">{formatPrice(vehicle.price)}</div>
                          {discount && (
                            <p className="text-xs text-blue-500 mt-1 font-semibold">
                              Mã KM: {discount.discountCode}
                            </p>
                          )}
                        </div>
                      );
                    }
                  }
                  return formatPrice(vehicle.price);
                })()}
              </div>
              <p className="text-gray-600">
                {vehicle.finalPrice && vehicle.finalPrice < vehicle.price ? 'Giá sau giảm' : 'Giá bán'}
              </p>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600 mb-2">{vehicle.timecharging || vehicle.chargingTime}</div>
              <p className="text-gray-600">Thời gian sạc</p>
            </div>
          </div>
          
          <div className="mt-12 text-center">
            <button
              onClick={() => navigate(`/portal/test-drive?vehicleId=${vehicle.id}`)}
              className="border border-gray-300 text-gray-700 px-12 py-3 rounded-lg font-medium hover:bg-gray-50 mr-4"
            >
              Đặt lái thử
            </button>
            <button
              onClick={openQuotationModal}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-12 py-3 rounded-lg font-medium shadow-lg transition-all duration-200 transform hover:scale-105"
            >
              <Calculator className="inline h-5 w-5 mr-2" />
              Tạo báo giá
            </button>
          </div>
        </div>
      </div>

      {/* Main Content - MOVED TO BOTTOM with fade-in effect */}
      <div className={`max-w-7xl mx-auto px-4 py-8 bg-white transition-opacity duration-1000 delay-1000 ${showContent ? 'opacity-100' : 'opacity-0'}`}>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          {/* Left Side - Specifications */}
          <div className="space-y-6">
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Thông số kỹ thuật</h2>
              <div className="w-20 h-1 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full"></div>
            </div>

            {specifications.map((spec, index) => (
              <div 
                key={index} 
                className="group relative bg-gradient-to-br from-white to-gray-50 rounded-2xl p-6 border border-gray-200 hover:border-blue-400 transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
              >
                {/* Icon/Number Badge */}
                <div className="absolute -top-4 -left-4 w-12 h-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-transform duration-300">
                  <span className="text-white font-bold text-lg">{index + 1}</span>
                </div>

                {/* Content */}
                <div className="ml-4 space-y-3">
                  {/* Title */}
                  <h3 className="text-xl font-bold text-gray-900 flex items-center space-x-2">
                    <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                      {spec.label}
                    </span>
                  </h3>

                  {/* Value - Only show if not empty */}
                  {spec.value && (
                    <div className="flex items-baseline space-x-2">
                      <span className="text-4xl font-bold text-gray-900">
                        {spec.value.split(' ')[0]}
                      </span>
                      {spec.value.split(' ').slice(1).length > 0 && (
                        <span className="text-lg font-medium text-gray-600">
                          {spec.value.split(' ').slice(1).join(' ')}
                        </span>
                      )}
                    </div>
                  )}

                  {/* Description */}
                  {spec.description && (
                    <p className="text-sm text-gray-600 leading-relaxed">
                      {spec.description}
                    </p>
                  )}
                </div>

                {/* Decorative element */}
                <div className="absolute bottom-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-50 to-purple-50 rounded-tl-full opacity-50 group-hover:opacity-70 transition-opacity duration-300"></div>
              </div>
            ))}
            
            <div className="pt-8">
              <button className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-3 rounded-xl text-sm font-semibold shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 flex items-center justify-center space-x-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <span>Xem tất cả thông số kỹ thuật</span>
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

            {/* Thumbnail Gallery - Always show 3 thumbnails */}
            <div className="grid grid-cols-3 gap-2">
              {availableImages.map((image, index) => {
                console.log(`🖼️ CarDetail - Rendering thumbnail ${index}:`, image);
                return (
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
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Quotation Modal */}
      {showQuotationModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-start justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-xl w-full shadow-2xl my-4 transform transition-all">
            {/* Header - Fixed */}
            <div className="bg-gradient-to-r from-purple-500 to-pink-600 text-white p-6 rounded-t-2xl">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-2xl font-bold">Tạo báo giá</h2>
                  <p className="text-purple-100 text-sm">Vinfast {vehicle.model}</p>
                </div>
                <button
                  onClick={() => setShowQuotationModal(false)}
                  className="text-white hover:text-purple-200 transition-colors p-2 hover:bg-white hover:bg-opacity-10 rounded-lg"
                  disabled={creatingQuotation}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Content - Scrollable */}
            <div className="p-6 max-h-[calc(100vh-300px)] overflow-y-auto">
              <form id="create-quotation-form" onSubmit={handleCreateQuotation} className="space-y-4">
                {/* Vehicle Info */}
                <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-4 border border-purple-200">
                  <h3 className="text-sm font-semibold text-gray-700 mb-2 flex items-center space-x-2">
                    <FileText className="h-4 w-4 text-purple-600" />
                    <span>Thông tin xe</span>
                  </h3>
                  <div className="text-sm text-gray-700">
                    <p><strong className="text-purple-600">Model:</strong> {vehicle.model}</p>
                    <p><strong className="text-purple-600">Type:</strong> {vehicle.type || 'SUV'}</p>
                    <p><strong className="text-purple-600">Version:</strong> {vehicle.version}</p>
                  </div>
                </div>

                {/* Row 1: User ID */}
                <div className="space-y-2">
                  <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700">
                    <svg className="h-4 w-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    <span>ID Khách hàng *</span>
                  </label>
                  <input
                    type="number"
                    required
                    value={quotationForm.userId}
                    onChange={(e) => setQuotationForm({...quotationForm, userId: parseInt(e.target.value)})}
                    className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:border-purple-500 focus:ring-2 focus:ring-purple-100 transition-all duration-200 bg-gray-50 focus:bg-white"
                    placeholder="Nhập ID khách hàng"
                  />
                </div>

                {/* Row 2: Base Price */}
                <div className="space-y-2">
                  <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700">
                    <DollarSign className="h-4 w-4 text-purple-600" />
                    <span>Giá gốc *</span>
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      required
                      value={quotationForm.basePrice === 0 ? '' : quotationForm.basePrice}
                      onChange={(e) => {
                        const basePriceValue = parseFloat(e.target.value) || 0;
                        setQuotationForm({...quotationForm, basePrice: basePriceValue});
                        setQuotationFinalPrice(basePriceValue - quotationForm.discount);
                      }}
                      className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:border-purple-500 focus:ring-2 focus:ring-purple-100 transition-all duration-200 bg-gray-50 focus:bg-white [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                      placeholder="Nhập giá gốc"
                    />
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                      <span className="text-gray-400 text-sm">VND</span>
                    </div>
                  </div>
                </div>

                {/* Row 3: Promotion Code */}
                <div className="space-y-2">
                  <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700">
                      <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                      </svg>
                      <span>Mã khuyến mãi</span>
                      {loadingPromotions && <span className="text-xs text-gray-400">(Đang tải...)</span>}
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={quotationForm.promotionCode || quotationForm.discountCode}
                        onChange={(e) => handlePromotionCodeChange(e.target.value)}
                        className={`w-full border-2 rounded-xl px-4 py-3 pr-12 focus:ring-2 transition-all duration-200 bg-gray-50 focus:bg-white uppercase ${
                          promotionError ? 'border-red-500 focus:border-red-500 focus:ring-red-100' : 'border-gray-200 focus:border-purple-500 focus:ring-purple-100'
                        }`}
                        placeholder="NHẬP MÃ KHUYẾN MÃI (NẾU CÓ)"
                      />
                      <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                        {promotionError ? (
                          <svg className="h-5 w-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        ) : quotationForm.promotionCode && !promotionError ? (
                          <svg className="h-5 w-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        ) : (
                          <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
                          </svg>
                        )}
                      </div>
                    </div>
                    {promotionError && (
                      <p className="text-xs text-red-600 flex items-center space-x-1">
                        <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span>{promotionError}</span>
                      </p>
                    )}
                    {quotationForm.promotionCode && !promotionError && (() => {
                      const validPromotion = activePromotions.find(
                        p => p.promotionCode.toUpperCase() === (quotationForm.promotionCode || quotationForm.discountCode || '').toUpperCase()
                      );
                      const remainingStock = validPromotion?.stock || 0;
                      
                      return (
                        <div className="space-y-1">
                          <p className="text-xs text-green-600 flex items-center space-x-1">
                            <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            <span>Mã khuyến mãi hợp lệ</span>
                          </p>
                          {remainingStock > 0 && (
                            <p className="text-xs text-blue-600 flex items-center space-x-1">
                              <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                              </svg>
                              <span>Còn lại: {remainingStock} mã</span>
                            </p>
                          )}
                        </div>
                      );
                    })()}
                  </div>

                  {/* Row 4: Promotion Name */}
                  <div className="space-y-2">
                    <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700">
                      <svg className="h-4 w-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
                      </svg>
                      <span>Tên khuyến mãi</span>
                    </label>
                    <input
                      type="text"
                      value={quotationForm.promotionOptionName}
                      readOnly
                      className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 bg-gray-100 text-gray-700 cursor-not-allowed"
                      placeholder="Tự động điền khi nhập mã KM hợp lệ"
                    />
                  </div>

                  {/* Row 5: Car Color */}
                  <div className="space-y-2">
                    <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700">
                      <svg className="h-4 w-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                      </svg>
                      <span>Màu xe</span>
                    </label>
                    <input
                      type="text"
                      value={quotationForm.color}
                      onChange={(e) => setQuotationForm({...quotationForm, color: e.target.value})}
                      className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:border-purple-500 focus:ring-2 focus:ring-purple-100 transition-all duration-200 bg-gray-50 focus:bg-white"
                      placeholder="VD: Đỏ, Đen, Trắng"
                    />
                  </div>

                  {/* Row 6: Discount field */}
                  {/* <div className="space-y-2">
                    <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700">
                      <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span>Khuyến mãi (VND)</span>
                    </label>
                    <input
                      type="number"
                      value={quotationForm.discount === 0 ? '' : quotationForm.discount}
                      onChange={(e) => {
                        const discountValue = parseFloat(e.target.value) || 0;
                        setQuotationForm({...quotationForm, discount: discountValue});
                        setQuotationFinalPrice(quotationForm.basePrice - discountValue);
                      }}
                      className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:border-purple-500 focus:ring-2 focus:ring-purple-100 transition-all duration-200 bg-gray-50 focus:bg-white [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                      placeholder="Nhập giá khuyến mãi"
                    />
                  </div> */}

                  {/* Price Summary */}
                  <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-4 border border-purple-200">
                    <h3 className="text-sm font-semibold text-gray-700 mb-2">Tóm tắt giá</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Giá gốc:</span>
                        <span className="font-semibold">{formatPrice(quotationForm.basePrice)}</span>
                      </div>
                      {(quotationForm.promotionCode || quotationForm.discountCode) && (
                        <div className="space-y-1">
                          <div className="flex justify-between items-center">
                            <span className="text-gray-600">Mã khuyến mãi:</span>
                            <span className="font-semibold text-purple-600 bg-purple-100 px-2 py-1 rounded uppercase">
                              {quotationForm.promotionCode || quotationForm.discountCode}
                            </span>
                          </div>
                          {quotationForm.promotionOptionName && (
                            <div className="flex justify-between items-center">
                              <span className="text-gray-600">Tên KM:</span>
                              <span className="font-medium text-gray-700">
                                {quotationForm.promotionOptionName}
                              </span>
                            </div>
                          )}
                        </div>
                      )}
                      {quotationForm.discount > 0 && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Khuyến mãi:</span>
                          <span className="font-semibold text-red-600">-{formatPrice(quotationForm.discount)}</span>
                        </div>
                      )}
                      <div className="border-t pt-2 flex justify-between">
                        <span className="text-gray-900 font-bold">Tổng cộng:</span>
                        <span className="font-bold text-purple-600">{formatPrice(quotationFinalPrice)}</span>
                      </div>
                    </div>
                  </div>
              </form>

              {/* Commented out attachment fields */}
                {/* <div className="space-y-2">
                    <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700">
                      <svg className="h-4 w-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span>Ảnh đính kèm</span>
                    </label>
                    <input
                      type="text"
                      value={quotationForm.attachmentImage}
                      onChange={(e) => setQuotationForm({...quotationForm, attachmentImage: e.target.value})}
                      className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all duration-200 bg-gray-50 focus:bg-white"
                      placeholder="URL ảnh"
                    />
                  </div> */}

                  {/* <div className="space-y-2">
                    <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700">
                      <svg className="h-4 w-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <span>File đính kèm</span>
                    </label>
                    <input
                      type="text"
                      value={quotationForm.attachmentFile}
                      onChange={(e) => setQuotationForm({...quotationForm, attachmentFile: e.target.value})}
                      className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:border-green-500 focus:ring-2 focus:ring-green-100 transition-all duration-200 bg-gray-50 focus:bg-white"
                      placeholder="URL file"
                    />
                </div> */}
            </div>

            {/* Footer - Fixed */}
            <div className="bg-gray-50 px-6 py-4 rounded-b-2xl flex justify-end space-x-3 border-t border-gray-200">
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
                disabled={creatingQuotation || !!promotionError}
                title={promotionError ? 'Vui lòng nhập mã khuyến mãi hợp lệ' : ''}
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
