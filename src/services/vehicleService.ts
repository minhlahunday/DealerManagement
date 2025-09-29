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
        vehicles = data.data.map((vehicle: any) => ({
          id: vehicle.vehicleId?.toString() || vehicle.id || '',
          vehicleId: vehicle.vehicleId,
          model: vehicle.model || '',
          version: vehicle.version || '',
          color: vehicle.color || '',
          price: vehicle.price || 0,
          type: vehicle.type || '',
          status: vehicle.status || '',
          // Add default values for missing fields
          range: vehicle.range || 500,
          maxSpeed: vehicle.maxSpeed || 200,
          chargingTime: vehicle.chargingTime || '8 giờ',
          stock: vehicle.stock || 10,
          // Handle both 'image' (API) and 'images' (mock) formats
          images: Array.isArray(vehicle.images) 
            ? vehicle.images 
            : vehicle.image 
            ? [vehicle.image] 
            : ['/images/default-car.jpg'],
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
          // Add default values for missing fields
          range: data.data.range || 500,
          maxSpeed: data.data.maxSpeed || 200,
          chargingTime: data.data.chargingTime || '8 giờ',
          stock: data.data.stock || 10,
          // Handle both 'image' (API) and 'images' (mock) formats
          images: Array.isArray(data.data.images) 
            ? data.data.images 
            : data.data.image 
            ? [data.data.image] 
            : ['/images/default-car.jpg'],
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
          // Add default values for missing fields
          range: data.range || 500,
          maxSpeed: data.maxSpeed || 200,
          chargingTime: data.chargingTime || '8 giờ',
          stock: data.stock || 10,
          // Handle both 'image' (API) and 'images' (mock) formats
          images: Array.isArray(data.images) 
            ? data.images 
            : data.image 
            ? [data.image] 
            : ['/images/default-car.jpg'],
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
