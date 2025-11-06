import { Vehicle } from '../types';
import { authService } from './authService';

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export const vehicleService = {
  async getVehicles(): Promise<ApiResponse<Vehicle[]>> {
    try {
      console.log('Fetching vehicles from API...');
      
      // Get token from localStorage
      const token = localStorage.getItem('token');
      console.log('Token from localStorage:', token);
      
      const headers: Record<string, string> = {
        'Accept': 'application/json',
      };
      
      // Add token if available and valid
      if (token) {
        if (authService.isTokenValid(token) || token.startsWith('mock-token-')) {
          headers['Authorization'] = `Bearer ${token}`;
          
          if (token.startsWith('mock-token-')) {
            console.log('⚠️ Mock token added to request (will be rejected by backend)');
          } else {
            console.log('✅ Valid JWT token added to request');
            
            // Log token info for debugging
            const tokenInfo = authService.getTokenInfo(token);
            if (tokenInfo) {
              console.log('Token info:', tokenInfo);
            }
          }
        } else {
          console.warn('⚠️ Invalid/expired token, proceeding without authentication');
        }
      } else {
        console.warn('No token found in localStorage');
      }

      console.log('Request headers:', headers);

      const response = await fetch('/api/Vehicle', {
        method: 'GET',
        headers,
      });

      console.log('Response status:', response.status);
      console.log('Response headers:', Object.fromEntries(response.headers.entries()));

      if (!response.ok) {
        let errorMessage = `HTTP error! status: ${response.status}`;
        let errorDetails = '';
        
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorData.error || errorMessage;
          errorDetails = JSON.stringify(errorData);
        } catch {
          errorMessage = response.statusText || errorMessage;
        }
        
        console.error('API Error Details:', {
          status: response.status,
          statusText: response.statusText,
          message: errorMessage,
          details: errorDetails,
          url: '/api/Vehicle',
          headers: headers
        });
        
        // For 401/403 errors, clear token and redirect to login
        if (response.status === 401) {
          console.error('Authentication failed (401) - Invalid or missing token');
          // Clear invalid token
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          // Redirect to login page
          window.location.href = '/';
          throw new Error('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
        } else if (response.status === 403) {
          console.error('Authorization failed (403) - Insufficient permissions');
          throw new Error('Truy cập bị từ chối. Bạn không có quyền truy cập tài nguyên này.');
        }
        
        throw new Error(errorMessage);
      }

      const data = await response.json();
      console.log('Raw API response:', data);

      // Handle different API response formats
      let vehicles: Vehicle[] = [];
      
      if (Array.isArray(data)) {
        vehicles = data;
      } else if (data.data && Array.isArray(data.data)) {
        console.log('✅ Vehicles loaded from API:', data.data.length);
        vehicles = data.data.map((vehicle: Record<string, unknown>) => ({
          id: String(vehicle.vehicleId || vehicle.id || ''),
          vehicleId: vehicle.vehicleId as number,
          model: String(vehicle.model || ''),
          version: String(vehicle.version || ''),
          color: String(vehicle.color || ''),
          price: Number(vehicle.price || 0),
          finalPrice: vehicle.finalPrice !== undefined ? Number(vehicle.finalPrice) : undefined,
          discountId: vehicle.discountId !== undefined ? Number(vehicle.discountId) : undefined,
          type: String(vehicle.type || ''),
          status: String(vehicle.status || ''),
          // New API fields
          distance: String(vehicle.distance || ''),
          timecharging: String(vehicle.timecharging || ''),
          speed: String(vehicle.speed || ''),
          image1: String(vehicle.image1 || ''),
          image2: String(vehicle.image2 || ''),
          image3: String(vehicle.image3 || ''),
          // Add default values for missing fields
          range: Number(vehicle.range) || (vehicle.distance ? parseInt(String(vehicle.distance).replace('km', '')) : 500),
          maxSpeed: Number(vehicle.maxSpeed) || (vehicle.speed ? parseInt(String(vehicle.speed).replace('km/h', '')) : 200),
          chargingTime: String(vehicle.chargingTime || vehicle.timecharging || '8 giờ'),
          stock: Number(vehicle.stock || 10),
          // Handle image1, image2, image3 fields from API
          images: (() => {
            const imageUrls: string[] = [];
            
            // Process image1, image2, image3 fields
            [vehicle.image1, vehicle.image2, vehicle.image3].forEach((img, index) => {
              console.log(`🔍 Processing image${index + 1}:`, img);
              
              if (img && String(img).trim() !== '' && img !== 'null') {
                let cleanUrl = String(img).trim();
                
                // Extract actual URL from Google redirect URLs
                if (cleanUrl.includes('https://www.google.com/url')) {
                  try {
                    // Extract URL parameter from Google redirect
                    const urlParams = new URLSearchParams(cleanUrl.split('?')[1]);
                    const actualUrl = urlParams.get('url');
                    if (actualUrl) {
                      cleanUrl = decodeURIComponent(actualUrl);
                      console.log('🧹 Extracted URL from Google redirect:', cleanUrl);
                    } else {
                      console.log('⚠️ Could not extract URL from Google redirect, skipping');
                      return; // Skip malformed URLs
                    }
                  } catch {
                    console.log('⚠️ Error parsing Google redirect URL, skipping');
                    return;
                  }
                }
                
                // Basic URL validation
                try {
                  new URL(cleanUrl);
                  // Additional validation for image URLs
                  if (cleanUrl.match(/\.(png|jpg|webp|gif|jpeg)$/i)) {
                    imageUrls.push(cleanUrl);
                    console.log('✅ Valid image URL added:', cleanUrl);
                  } else {
                    console.log('⚠️ URL does not appear to be a direct image URL, skipping:', cleanUrl);
                  }
                } catch {
                  console.log('⚠️ Invalid URL format, skipping:', cleanUrl);
                }
              }
            });
            
            // Only use API images (image1, image2, image3), no fallback to legacy formats
            if (imageUrls.length === 0) {
              console.log('📸 No API images found, using default image');
              return ['/images/default-car.jpg'];
            }
            
            // Only use images from API, no mock variations
            console.log('📸 Using only API images:', imageUrls);
            
            console.log('📸 Final images array:', imageUrls.length > 0 ? imageUrls : ['/images/default-car.jpg']);
            return imageUrls.length > 0 ? imageUrls : ['/images/default-car.jpg'];
          })(),
          features: vehicle.features || [],
          description: vehicle.description || ''
        }));
      } else {
        console.error('Unexpected API response format for vehicles');
        console.log('Response structure:', Object.keys(data));
        throw new Error('Định dạng phản hồi API không hợp lệ. Vui lòng thử lại sau.');
      }
      
      return { success: true, message: data.message || 'Lấy danh sách xe thành công', data: vehicles };
    } catch (error) {
      console.error('Failed to fetch vehicles from API:', error);
      
      // Log detailed error information
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('API call failed:', errorMessage);
      
      // Throw error instead of using mock data
      throw new Error(`Không thể lấy danh sách xe: ${errorMessage}`);
    }
  },

  async getVehicleById(id: string): Promise<ApiResponse<Vehicle>> {
    try {
      console.log('Fetching vehicle by ID:', id);
      
      // Get token from localStorage
      const token = localStorage.getItem('token');
      console.log('Token from localStorage:', token);
      
      const headers: Record<string, string> = {
        'Accept': 'application/json',
      };
      
      // Add token if available and valid
      if (token) {
        if (authService.isTokenValid(token) || token.startsWith('mock-token-')) {
          headers['Authorization'] = `Bearer ${token}`;
          
          if (token.startsWith('mock-token-')) {
            console.log('⚠️ Mock token added to request (will be rejected by backend)');
          } else {
            console.log('✅ Valid JWT token added to request');
            const tokenInfo = authService.getTokenInfo(token);
            if (tokenInfo) { console.log('Token info:', tokenInfo); }
          }
        } else {
          console.warn('⚠️ Invalid/expired token, proceeding without authentication');
        }
      } else {
        console.warn('No token found in localStorage');
      }

      console.log('Request headers:', headers);

      const response = await fetch(`/api/Vehicle/${id}`, {
        method: 'GET',
        headers,
      });

      console.log('Response status:', response.status);
      console.log('Response headers:', Object.fromEntries(response.headers.entries()));

      if (!response.ok) {
        let errorMessage = `HTTP error! status: ${response.status}`;
        let errorDetails = '';
        
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorData.error || errorMessage;
          errorDetails = JSON.stringify(errorData);
        } catch {
          errorMessage = response.statusText || errorMessage;
        }
        
        console.error('API Error Details:', {
          status: response.status,
          statusText: response.statusText,
          message: errorMessage,
          details: errorDetails,
          url: `/api/Vehicle/${id}`,
          headers: headers
        });
        
        // For 401/403/404 errors, throw error instead of using mock data
        if (response.status === 401) {
          console.error('Authentication failed (401) - Invalid or missing token');
          throw new Error('Yêu cầu xác thực. Vui lòng đăng nhập lại.');
        } else if (response.status === 403) {
          console.error('Authorization failed (403) - Insufficient permissions');
          throw new Error('Truy cập bị từ chối. Bạn không có quyền truy cập tài nguyên này.');
        } else if (response.status === 404) {
          console.error('Vehicle not found (404)');
          throw new Error('Không tìm thấy xe với ID đã cho.');
        }
        
        throw new Error(errorMessage);
      }

      const data = await response.json();
      console.log('Raw Vehicle API response:', data);
      console.log('Response structure:', {
        hasData: !!data.data,
        dataKeys: data.data ? Object.keys(data.data) : [],
        dataType: typeof data.data,
        fullResponse: data
      });

      // Handle different API response formats
      let vehicle: Vehicle;
      
      if (data.data) {
        console.log('✅ Vehicle loaded from API');
        const vehicleData = data.data;
        vehicle = {
          id: vehicleData.vehicleId?.toString() || vehicleData.id || id,
          vehicleId: vehicleData.vehicleId,
          model: vehicleData.model || '',
          version: vehicleData.version || '',
          color: vehicleData.color || '',
          price: vehicleData.price || 0,
          finalPrice: vehicleData.finalPrice, // Giá sau khi áp dụng giảm giá
          discountId: vehicleData.discountId, // ID của discount được áp dụng
          type: vehicleData.type || '',
          status: vehicleData.status || '',
          // New API fields
          distance: vehicleData.distance || '',
          timecharging: vehicleData.timecharging || '',
          speed: vehicleData.speed || '',
          image1: vehicleData.image1 || '',
          image2: vehicleData.image2 || '',
          image3: vehicleData.image3 || '',
          // Add default values for missing fields
          range: vehicleData.range || (vehicleData.distance ? parseInt(vehicleData.distance.replace('km', '')) : 500),
          maxSpeed: vehicleData.maxSpeed || (vehicleData.speed ? parseInt(vehicleData.speed.replace('km/h', '')) : 200),
          chargingTime: vehicleData.chargingTime || vehicleData.timecharging || '8 giờ',
          stock: vehicleData.stock || 10,
          // Handle image1, image2, image3 fields from API
          images: (() => {
            const imageUrls: string[] = [];
            
            // Process image1, image2, image3 fields
            [vehicleData.image1, vehicleData.image2, vehicleData.image3].forEach((img, index) => {
              console.log(`🔍 Processing image${index + 1}:`, img);
              
              if (img && img.trim() !== '' && img !== 'null') {
                let cleanUrl = img.trim();
                
                // Extract actual URL from Google redirect URLs
                if (cleanUrl.includes('https://www.google.com/url')) {
                  try {
                    // Extract URL parameter from Google redirect
                    const urlParams = new URLSearchParams(cleanUrl.split('?')[1]);
                    const actualUrl = urlParams.get('url');
                    if (actualUrl) {
                      cleanUrl = decodeURIComponent(actualUrl);
                      console.log('🧹 Extracted URL from Google redirect:', cleanUrl);
                    } else {
                      console.log('⚠️ Could not extract URL from Google redirect, skipping');
                      return; // Skip malformed URLs
                    }
                  } catch {
                    console.log('⚠️ Error parsing Google redirect URL, skipping');
                    return;
                  }
                }
                
                // Basic URL validation
                try {
                  new URL(cleanUrl);
                  // Additional validation for image URLs
                  if (cleanUrl.match(/\.(png|jpg|webp|gif|jpeg)$/i)) {
                    imageUrls.push(cleanUrl);
                    console.log('✅ Valid image URL added:', cleanUrl);
                  } else {
                    console.log('⚠️ URL does not appear to be a direct image URL, skipping:', cleanUrl);
                  }
                } catch {
                  console.log('⚠️ Invalid URL format, skipping:', cleanUrl);
                }
              }
            });
            
            // Only use API images (image1, image2, image3), no fallback to legacy formats
            if (imageUrls.length === 0) {
              console.log('📸 No API images found, using default image');
              return ['/images/default-car.jpg'];
            }
            
            console.log('📸 Final images array:', imageUrls.length > 0 ? imageUrls : ['/images/default-car.jpg']);
            return imageUrls.length > 0 ? imageUrls : ['/images/default-car.jpg'];
          })(),
          features: data.data.features || [],
          description: data.data.description || ''
        };
      } else {
        // Direct vehicle object
        vehicle = {
          id: data.vehicleId?.toString() || data.id || id,
          vehicleId: data.vehicleId,
          model: data.model || '',
          version: data.version || '',
          color: data.color || '',
          price: data.price || 0,
          finalPrice: data.finalPrice,
          discountId: data.discountId,
          type: data.type || '',
          status: data.status || '',
          // New API fields
          distance: data.distance || '',
          timecharging: data.timecharging || '',
          speed: data.speed || '',
          image1: data.image1 || '',
          image2: data.image2 || '',
          image3: data.image3 || '',
          // Add default values for missing fields
          range: data.range || (data.distance ? parseInt(data.distance.replace('km', '')) : 500),
          maxSpeed: data.maxSpeed || (data.speed ? parseInt(data.speed.replace('km/h', '')) : 200),
          chargingTime: data.chargingTime || data.timecharging || '8 giờ',
          stock: data.stock || 10,
          // Handle image1, image2, image3 fields from API
          images: (() => {
            const imageUrls: string[] = [];
            
            // Process image1, image2, image3 fields
            [data.image1, data.image2, data.image3].forEach((img, index) => {
              console.log(`🔍 Processing image${index + 1}:`, img);
              
              if (img && img.trim() !== '' && img !== 'null') {
                let cleanUrl = img.trim();
                
                // Extract actual URL from Google redirect URLs
                if (cleanUrl.includes('https://www.google.com/url')) {
                  try {
                    // Extract URL parameter from Google redirect
                    const urlParams = new URLSearchParams(cleanUrl.split('?')[1]);
                    const actualUrl = urlParams.get('url');
                    if (actualUrl) {
                      cleanUrl = decodeURIComponent(actualUrl);
                      console.log('🧹 Extracted URL from Google redirect:', cleanUrl);
                    } else {
                      console.log('⚠️ Could not extract URL from Google redirect, skipping');
                      return; // Skip malformed URLs
                    }
                  } catch {
                    console.log('⚠️ Error parsing Google redirect URL, skipping');
                    return;
                  }
                }
                
                // Basic URL validation
                try {
                  new URL(cleanUrl);
                  // Additional validation for image URLs
                  if (cleanUrl.match(/\.(png|jpg|webp|gif|jpeg)$/i)) {
                    imageUrls.push(cleanUrl);
                    console.log('✅ Valid image URL added:', cleanUrl);
                  } else {
                    console.log('⚠️ URL does not appear to be a direct image URL, skipping:', cleanUrl);
                  }
                } catch {
                  console.log('⚠️ Invalid URL format, skipping:', cleanUrl);
                }
              }
            });
            
            // Only use API images (image1, image2, image3), no fallback to legacy formats
            if (imageUrls.length === 0) {
              console.log('📸 No API images found, using default image');
              return ['/images/default-car.jpg'];
            }
            
            console.log('📸 Final images array:', imageUrls.length > 0 ? imageUrls : ['/images/default-car.jpg']);
            return imageUrls.length > 0 ? imageUrls : ['/images/default-car.jpg'];
          })(),
          features: data.features || [],
          description: data.description || ''
        };
      }
      
      return { success: true, message: data.message || 'Lấy thông tin xe thành công', data: vehicle };
    } catch (error) {
      console.error('Failed to fetch vehicle from API:', error);
      
      // Log detailed error information
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('API call failed:', errorMessage);
      
      // Throw error instead of using mock data
      throw new Error(`Không thể lấy thông tin xe: ${errorMessage}`);
    }
  },

  async searchVehicles(searchTerm: string): Promise<ApiResponse<Vehicle[]>> {
    try {
      console.log('🔍 Searching vehicles with term:', searchTerm);
      
      // Get token from localStorage
      const token = localStorage.getItem('token');
      console.log('Token from localStorage:', token);
      
      const headers: Record<string, string> = {
        'Accept': 'application/json',
      };
      
      // Add token if available and valid
      if (token) {
        if (authService.isTokenValid(token) || token.startsWith('mock-token-')) {
          headers['Authorization'] = `Bearer ${token}`;
          
          if (token.startsWith('mock-token-')) {
            console.log('⚠️ Mock token added to request (will be rejected by backend)');
          } else {
            console.log('✅ Valid JWT token added to request');
            
            // Log token info for debugging
            const tokenInfo = authService.getTokenInfo(token);
            if (tokenInfo) {
              console.log('Token info:', tokenInfo);
            }
          }
        } else {
          console.warn('⚠️ Invalid/expired token, proceeding without authentication');
        }
      } else {
        console.warn('No token found in localStorage');
      }

      console.log('Request headers:', headers);

      // Build search URL with query parameter
      // Use the correct endpoint: /api/Vehicle/Sreach (as shown in Swagger)
      const searchUrl = `/api/Vehicle/Sreach?search=${encodeURIComponent(searchTerm)}`;
      console.log('🔍 Search URL:', searchUrl);

      const response = await fetch(searchUrl, {
        method: 'GET',
        headers,
      });

      console.log('📡 Search Response status:', response.status);
      console.log('📡 Search Response headers:', Object.fromEntries(response.headers.entries()));

      if (!response.ok) {
        let errorMessage = `HTTP error! status: ${response.status}`;
        let errorDetails = '';
        
        try {
          const errorData = await response.json();
          console.log('🔍 Search API Error Data:', errorData);
          errorMessage = errorData.message || errorData.error || errorData.title || errorMessage;
          errorDetails = JSON.stringify(errorData);
          
          // Log specific error details
          if (errorData.detail) {
            console.log('🔍 Search API Error Detail:', errorData.detail);
          }
          if (errorData.errors) {
            console.log('🔍 Search API Validation Errors:', errorData.errors);
          }
        } catch {
          errorMessage = response.statusText || errorMessage;
        }
        
        console.error('🔍 Search API Error Details:', {
          status: response.status,
          statusText: response.statusText,
          message: errorMessage,
          details: errorDetails,
          url: searchUrl,
          headers: headers
        });
        
        // For 401/403 errors, clear token and redirect to login
        if (response.status === 401) {
          console.error('Authentication failed (401) - Invalid or missing token');
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          window.location.href = '/';
          throw new Error('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
        } else if (response.status === 403) {
          console.error('Authorization failed (403) - Insufficient permissions');
          throw new Error('Truy cập bị từ chối. Bạn không có quyền truy cập tài nguyên này.');
        } else if (response.status === 400) {
          console.error('Bad Request (400) - Invalid search parameters');
          throw new Error('Từ khóa tìm kiếm không hợp lệ. Vui lòng thử từ khóa khác.');
        }
        
        throw new Error(errorMessage);
      }

      const data = await response.json();
      console.log('🔍 Raw Search API response:', data);

      // Handle different API response formats
      let vehicles: Vehicle[] = [];
      
      if (Array.isArray(data)) {
        vehicles = data;
      } else if (data.data && Array.isArray(data.data)) {
        console.log('✅ Search results loaded from API:', data.data.length);
        vehicles = data.data.map((vehicle: Record<string, unknown>) => ({
          id: String(vehicle.vehicleId || vehicle.id || ''),
          vehicleId: vehicle.vehicleId as number,
          model: String(vehicle.model || ''),
          version: String(vehicle.version || ''),
          color: String(vehicle.color || ''),
          price: Number(vehicle.price || 0),
          finalPrice: vehicle.finalPrice !== undefined ? Number(vehicle.finalPrice) : undefined,
          discountId: vehicle.discountId !== undefined ? Number(vehicle.discountId) : undefined,
          type: String(vehicle.type || ''),
          status: String(vehicle.status || ''),
          // New API fields
          distance: String(vehicle.distance || ''),
          timecharging: String(vehicle.timecharging || ''),
          speed: String(vehicle.speed || ''),
          image1: String(vehicle.image1 || ''),
          image2: String(vehicle.image2 || ''),
          image3: String(vehicle.image3 || ''),
          // Add default values for missing fields
          range: Number(vehicle.range) || (vehicle.distance ? parseInt(String(vehicle.distance).replace('km', '')) : 500),
          maxSpeed: Number(vehicle.maxSpeed) || (vehicle.speed ? parseInt(String(vehicle.speed).replace('km/h', '')) : 200),
          chargingTime: String(vehicle.chargingTime || vehicle.timecharging || '8 giờ'),
          stock: Number(vehicle.stock || 10),
          // Handle image1, image2, image3 fields from API
          images: (() => {
            const imageUrls: string[] = [];
            
            // Process image1, image2, image3 fields
            [vehicle.image1, vehicle.image2, vehicle.image3].forEach((img, index) => {
              console.log(`🔍 Processing search result image${index + 1}:`, img);
              
              if (img && String(img).trim() !== '' && img !== 'null') {
                let cleanUrl = String(img).trim();
                
                // Extract actual URL from Google redirect URLs
                if (cleanUrl.includes('https://www.google.com/url')) {
                  try {
                    // Extract URL parameter from Google redirect
                    const urlParams = new URLSearchParams(cleanUrl.split('?')[1]);
                    const actualUrl = urlParams.get('url');
                    if (actualUrl) {
                      cleanUrl = decodeURIComponent(actualUrl);
                      console.log('🧹 Extracted URL from Google redirect:', cleanUrl);
                    } else {
                      console.log('⚠️ Could not extract URL from Google redirect, skipping');
                      return; // Skip malformed URLs
                    }
                  } catch {
                    console.log('⚠️ Error parsing Google redirect URL, skipping');
                    return;
                  }
                }
                
                // Basic URL validation
                try {
                  new URL(cleanUrl);
                  // Additional validation for image URLs
                  if (cleanUrl.match(/\.(png|jpg|webp|gif|jpeg)$/i)) {
                    imageUrls.push(cleanUrl);
                    console.log('✅ Valid search result image URL added:', cleanUrl);
                  } else {
                    console.log('⚠️ URL does not appear to be a direct image URL, skipping:', cleanUrl);
                  }
                } catch {
                  console.log('⚠️ Invalid URL format, skipping:', cleanUrl);
                }
              }
            });
            
            // Only use API images (image1, image2, image3), no fallback to legacy formats
            if (imageUrls.length === 0) {
              console.log('📸 No API images found for search result, using default image');
              return ['/images/default-car.jpg'];
            }
            
            console.log('📸 Final search result images array:', imageUrls.length > 0 ? imageUrls : ['/images/default-car.jpg']);
            return imageUrls.length > 0 ? imageUrls : ['/images/default-car.jpg'];
          })(),
          features: vehicle.features || [],
          description: vehicle.description || ''
        }));
      } else {
        console.error('Unexpected search API response format');
        console.log('Response structure:', Object.keys(data));
        throw new Error('Định dạng phản hồi API tìm kiếm không hợp lệ. Vui lòng thử lại sau.');
      }
      
      return { 
        success: true, 
        message: data.message || `Tìm thấy ${vehicles.length} kết quả cho "${searchTerm}"`, 
        data: vehicles 
      };
    } catch (error) {
      console.error('🔍 Failed to search vehicles:', error);
      
      // Log detailed error information
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('🔍 Search API call failed:', errorMessage);
      
      // Throw error instead of using mock data
      throw new Error(`Không thể tìm kiếm xe: ${errorMessage}`);
    }
  },

  async createVehicle(vehicleData: Partial<Vehicle>): Promise<ApiResponse<Vehicle>> {
    try {
      console.log('➕ Creating new vehicle:', vehicleData);
      
      const token = localStorage.getItem('token');
      
      const headers: Record<string, string> = {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      };
      
      if (token) {
        if (authService.isTokenValid(token) || token.startsWith('mock-token-')) {
          headers['Authorization'] = `Bearer ${token}`;
        }
      }

      const response = await fetch('/api/Vehicle', {
        method: 'POST',
        headers,
        body: JSON.stringify(vehicleData),
      });

      console.log('➕ Create Response status:', response.status);

      if (!response.ok) {
        let errorMessage = `HTTP error! status: ${response.status}`;
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorData.error || errorMessage;
        } catch {
          errorMessage = response.statusText || errorMessage;
        }
        
        if (response.status === 401) {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          window.location.href = '/';
          throw new Error('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
        }
        
        throw new Error(errorMessage);
      }

      const data = await response.json();
      console.log('✅ Vehicle created successfully:', data);
      
      return { 
        success: true, 
        message: 'Tạo xe mới thành công', 
        data: data.data || data 
      };
    } catch (error) {
      console.error('Failed to create vehicle:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Không thể tạo xe mới: ${errorMessage}`);
    }
  },

  async updateVehicle(id: string | number, vehicleData: Partial<Vehicle>): Promise<ApiResponse<Vehicle>> {
    try {
      console.log('✏️ Updating vehicle:', id, vehicleData);
      
      const token = localStorage.getItem('token');
      
      const headers: Record<string, string> = {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      };
      
      if (token) {
        if (authService.isTokenValid(token) || token.startsWith('mock-token-')) {
          headers['Authorization'] = `Bearer ${token}`;
        }
      }

      const response = await fetch(`/api/Vehicle/${id}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify(vehicleData),
      });

      console.log('✏️ Update Response status:', response.status);

      if (!response.ok) {
        let errorMessage = `HTTP error! status: ${response.status}`;
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorData.error || errorMessage;
        } catch {
          errorMessage = response.statusText || errorMessage;
        }
        
        if (response.status === 401) {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          window.location.href = '/';
          throw new Error('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
        }
        
        throw new Error(errorMessage);
      }

      const data = await response.json();
      console.log('✅ Vehicle updated successfully:', data);
      
      return { 
        success: true, 
        message: 'Cập nhật xe thành công', 
        data: data.data || data 
      };
    } catch (error) {
      console.error('Failed to update vehicle:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Không thể cập nhật xe: ${errorMessage}`);
    }
  },

  async deleteVehicle(id: string | number): Promise<ApiResponse<null>> {
    try {
      console.log('🗑️ Deleting vehicle:', id);
      
      const token = localStorage.getItem('token');
      
      const headers: Record<string, string> = {
        'Accept': 'application/json',
      };
      
      if (token) {
        if (authService.isTokenValid(token) || token.startsWith('mock-token-')) {
          headers['Authorization'] = `Bearer ${token}`;
        }
      }

      const response = await fetch(`/api/Vehicle/${id}`, {
        method: 'DELETE',
        headers,
      });

      console.log('🗑️ Delete Response status:', response.status);

      if (!response.ok) {
        let errorMessage = `HTTP error! status: ${response.status}`;
        try {
          const errorText = await response.text();
          console.log('🗑️ Delete Error Response Text:', errorText);
          
          // Check for REFERENCE constraint error (foreign key violation)
          if (errorText.includes('REFERENCE constraint') && errorText.includes('Inventory')) {
            errorMessage = 'Không thể xóa xe vì xe này vẫn còn tồn kho. Vui lòng xóa tồn kho trước khi xóa xe.';
            console.error('🗑️ Delete Error Message (Inventory constraint):', errorMessage);
            throw new Error(errorMessage);
          }
          
          // Check for other foreign key constraints
          if (errorText.includes('REFERENCE constraint') || errorText.includes('FK__')) {
            const tableMatch = errorText.match(/table "dbo\.(\w+)"/i);
            const tableName = tableMatch ? tableMatch[1] : 'dữ liệu liên quan';
            errorMessage = `Không thể xóa xe vì xe này vẫn còn được sử dụng trong ${tableName}. Vui lòng xóa dữ liệu liên quan trước.`;
            console.error('🗑️ Delete Error Message (Foreign key constraint):', errorMessage);
            throw new Error(errorMessage);
          }
          
          // Try to parse as JSON
          let errorData;
          try {
            errorData = JSON.parse(errorText);
          } catch {
            // If not JSON, try to extract meaningful message from stack trace
            // Look for inner exception message
            const innerExceptionMatch = errorText.match(/inner exception[^:]*:\s*([^\n]+)/i);
            if (innerExceptionMatch) {
              errorMessage = innerExceptionMatch[1].trim();
            } else {
              // Try to find first meaningful error line (usually contains error description)
              const lines = errorText.split('\n');
              for (const line of lines) {
                if (line.includes('Exception') || line.includes('Error') || line.includes('conflicted')) {
                  // Skip stack trace lines
                  if (!line.includes('at ') && !line.includes('---') && line.trim()) {
                    errorMessage = line.trim();
                    break;
                  }
                }
              }
              // If still no meaningful message, use generic
              if (errorMessage === `HTTP error! status: ${response.status}` || errorMessage.length > 500) {
                errorMessage = 'Không thể xóa xe. Vui lòng kiểm tra lại dữ liệu liên quan.';
              }
            }
          }
          
          // Extract error message from JSON response
          if (errorData) {
            errorMessage = errorData.message || 
                          errorData.error || 
                          errorData.title ||
                          errorData.Message ||
                          errorData.Error ||
                          (typeof errorData === 'string' && errorData.length < 500 ? errorData : errorMessage);
            
            // Handle validation errors array
            if (errorData.errors && typeof errorData.errors === 'object') {
              const validationErrors = Object.values(errorData.errors).flat();
              if (validationErrors.length > 0) {
                errorMessage = validationErrors.join(', ');
              }
            }
            
            // If message is too long (likely stack trace), use generic message
            if (errorMessage.length > 500) {
              errorMessage = 'Không thể xóa xe. Vui lòng kiểm tra lại dữ liệu liên quan.';
            }
          }
        } catch (parseError) {
          console.error('Error parsing error response:', parseError);
          // If we already have a meaningful error message, use it
          if (errorMessage && errorMessage !== `HTTP error! status: ${response.status}`) {
            throw new Error(errorMessage);
          }
          errorMessage = response.statusText || 'Không thể xóa xe. Vui lòng thử lại sau.';
        }
        
        if (response.status === 401) {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          window.location.href = '/';
          throw new Error('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
        }
        
        // Final check: if message is still too long or contains stack trace patterns, use generic
        if (errorMessage.length > 500 || 
            errorMessage.includes('at Microsoft.') || 
            errorMessage.includes('at System.') ||
            errorMessage.includes('stack trace') ||
            errorMessage.includes('--- End of')) {
          errorMessage = 'Không thể xóa xe vì xe này vẫn còn được sử dụng trong hệ thống. Vui lòng xóa dữ liệu liên quan trước.';
        }
        
        console.error('🗑️ Delete Error Message (Final):', errorMessage);
        throw new Error(errorMessage);
      }

      console.log('✅ Vehicle deleted successfully');
      
      return { 
        success: true, 
        message: 'Xóa xe thành công', 
        data: null 
      };
    } catch (error) {
      console.error('Failed to delete vehicle:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Không thể xóa xe: ${errorMessage}`);
    }
  }
};
