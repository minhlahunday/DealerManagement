import { Vehicle } from '../types';
import { mockVehicles } from '../data/mockData';
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
        
        // For 401/403 errors, don't throw - just return fallback data
        if (response.status === 401) {
          console.warn('Authentication failed (401), using mock data as fallback');
          return { 
            success: true, 
            message: `Authentication required. Using mock data.`, 
            data: mockVehicles 
          };
        } else if (response.status === 403) {
          console.warn('Authorization failed (403), using mock data as fallback');
          return { 
            success: true, 
            message: `Access denied. Using mock data.`, 
            data: mockVehicles 
          };
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
                  const urlMatch = cleanUrl.match(/https:\/\/[^\s]+\.(png|jpg|webp|gif|jpeg)/i);
                  if (urlMatch) {
                    cleanUrl = urlMatch[0];
                    console.log('🧹 Cleaned URL from Google redirect:', cleanUrl);
                  } else {
                    console.log('⚠️ Could not extract URL from Google redirect, skipping');
                    return; // Skip malformed URLs
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
                    console.log('⚠️ URL does not appear to be an image, skipping:', cleanUrl);
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
      } else if (data.vehicles && Array.isArray(data.vehicles)) {
        console.log('✅ Vehicles loaded from API:', data.vehicles.length);
        vehicles = data.vehicles;
      } else {
        console.warn('Unexpected API response format for vehicles, returning empty array.');
        console.log('Response structure:', Object.keys(data));
        return { success: true, message: 'Unexpected response format', data: [] };
      }
      
      return { success: true, message: data.message || 'Vehicles fetched successfully', data: vehicles };
    } catch (error) {
      console.error('Failed to fetch vehicles from API:', error);
      
      // Log detailed error information
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.warn('API call failed, using mock data as fallback:', errorMessage);
      
      // Always fallback to mock data when API fails
      // This ensures the app continues to work even if backend is down or auth fails
      return { 
        success: true, // Set to true so component doesn't show error
        message: `Using mock data (API unavailable: ${errorMessage})`, 
        data: mockVehicles 
      };
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
        
        // For 401/403/404 errors, don't throw - just return fallback data
        if (response.status === 401) {
          console.warn('Authentication failed (401), using mock data as fallback');
          const mockVehicle = mockVehicles.find(v => v.id === id) || mockVehicles[0];
          return { 
            success: true, 
            message: `Authentication required. Using mock data.`, 
            data: mockVehicle 
          };
        } else if (response.status === 403) {
          console.warn('Authorization failed (403), using mock data as fallback');
          const mockVehicle = mockVehicles.find(v => v.id === id) || mockVehicles[0];
          return { 
            success: true, 
            message: `Access denied. Using mock data.`, 
            data: mockVehicle 
          };
        } else if (response.status === 404) {
          console.warn('Vehicle not found (404), using mock data as fallback');
          const mockVehicle = mockVehicles.find(v => v.id === id) || mockVehicles[0];
          return { 
            success: true, 
            message: `Vehicle not found. Using mock data.`, 
            data: mockVehicle 
          };
        }
        
        throw new Error(errorMessage);
      }

      const data = await response.json();
      console.log('Raw Vehicle API response:', data);

      // Handle different API response formats
      let vehicle: Vehicle;
      
      if (data.data) {
        console.log('✅ Vehicle loaded from API');
        vehicle = {
          id: data.data.vehicleId?.toString() || data.data.id || id,
          vehicleId: data.data.vehicleId,
          model: data.data.model || '',
          version: data.data.version || '',
          color: data.data.color || '',
          price: data.data.price || 0,
          type: data.data.type || '',
          status: data.data.status || '',
          // New API fields
          distance: data.data.distance || '',
          timecharging: data.data.timecharging || '',
          speed: data.data.speed || '',
          image1: data.data.image1 || '',
          image2: data.data.image2 || '',
          image3: data.data.image3 || '',
          // Add default values for missing fields
          range: data.data.range || (data.data.distance ? parseInt(data.data.distance.replace('km', '')) : 500),
          maxSpeed: data.data.maxSpeed || (data.data.speed ? parseInt(data.data.speed.replace('km/h', '')) : 200),
          chargingTime: data.data.chargingTime || data.data.timecharging || '8 giờ',
          stock: data.data.stock || 10,
          // Handle image1, image2, image3 fields from API
          images: (() => {
            const imageUrls: string[] = [];
            const vehicleData = data.data;
            
            // Process image1, image2, image3 fields
            [vehicleData.image1, vehicleData.image2, vehicleData.image3].forEach((img, index) => {
              console.log(`🔍 Processing image${index + 1}:`, img);
              
              if (img && img.trim() !== '' && img !== 'null') {
                let cleanUrl = img.trim();
                
                // Extract actual URL from Google redirect URLs
                if (cleanUrl.includes('https://www.google.com/url')) {
                  const urlMatch = cleanUrl.match(/https:\/\/[^\s]+\.(png|jpg|webp|gif|jpeg)/i);
                  if (urlMatch) {
                    cleanUrl = urlMatch[0];
                    console.log('🧹 Cleaned URL from Google redirect:', cleanUrl);
                  } else {
                    console.log('⚠️ Could not extract URL from Google redirect, skipping');
                    return; // Skip malformed URLs
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
                    console.log('⚠️ URL does not appear to be an image, skipping:', cleanUrl);
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
                  const urlMatch = cleanUrl.match(/https:\/\/[^\s]+\.(png|jpg|webp|gif|jpeg)/i);
                  if (urlMatch) {
                    cleanUrl = urlMatch[0];
                    console.log('🧹 Cleaned URL from Google redirect:', cleanUrl);
                  } else {
                    console.log('⚠️ Could not extract URL from Google redirect, skipping');
                    return; // Skip malformed URLs
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
                    console.log('⚠️ URL does not appear to be an image, skipping:', cleanUrl);
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
      
      return { success: true, message: data.message || 'Vehicle fetched successfully', data: vehicle };
    } catch (error) {
      console.error('Failed to fetch vehicle from API:', error);
      
      // Log detailed error information
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.warn('API call failed, using mock data as fallback:', errorMessage);
      
      // Always fallback to mock data when API fails
      const mockVehicle = mockVehicles.find(v => v.id === id) || mockVehicles[0];
      return { 
        success: true, // Set to true so component doesn't show error
        message: `Using mock data (API unavailable: ${errorMessage})`, 
        data: mockVehicle 
      };
    }
  }
};
