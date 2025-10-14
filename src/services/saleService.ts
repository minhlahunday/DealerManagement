import { authService } from './authService';

export interface Quotation {
  quotationId: number;
  userId: number;
  vehicleId: number;
  quotationDate: string;
  basePrice: number;
  discount: number;
  finalPrice: number;
  status: string;
}

export interface CreateQuotationRequest {
  quotationId: number;
  userId: number;
  vehicleId: number;
  quotationDate: string;
  basePrice: number;
  discount: number;
  finalPrice: number;
  status: string;
}

export interface CreateQuotationResponse {
  success: boolean;
  message: string;
  data?: Quotation;
}

export interface QuotationListResponse {
  success: boolean;
  message: string;
  data: Quotation[];
}

export interface Order {
  orderId: number;
  quotationId: number;
  userId: number;
  vehicleId: number;
  orderDate: string;
  status: string;
  totalAmount: number;
}

export interface CreateOrderRequest {
  orderId: number;
  quotationId: number;
  userId: number;
  vehicleId: number;
  orderDate: string;
  status: string;
  totalAmount: number;
}

export interface CreateOrderResponse {
  success: boolean;
  message: string;
  data?: Order;
}

class SaleService {
  async createQuotation(quotationData: CreateQuotationRequest): Promise<CreateQuotationResponse> {
    try {
      const token = localStorage.getItem('token');
      
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
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

      console.log('🔄 Creating quotation via API...', quotationData);
      console.log('📤 Request body being sent:', JSON.stringify(quotationData, null, 2));
      console.log('🔍 Request body validation:', {
        hasQuotationId: !!quotationData.quotationId,
        hasUserId: !!quotationData.userId,
        hasVehicleId: !!quotationData.vehicleId,
        hasQuotationDate: !!quotationData.quotationDate,
        hasBasePrice: !!quotationData.basePrice,
        hasDiscount: !!quotationData.discount,
        hasFinalPrice: !!quotationData.finalPrice,
        hasStatus: !!quotationData.status,
        quotationId: quotationData.quotationId,
        userId: quotationData.userId,
        vehicleId: quotationData.vehicleId,
        quotationDate: quotationData.quotationDate,
        basePrice: quotationData.basePrice,
        discount: quotationData.discount,
        finalPrice: quotationData.finalPrice,
        status: quotationData.status
      });
      
      const response = await fetch('/api/SaleManagement/CreateQuotation', {
        method: 'POST',
        headers,
        body: JSON.stringify(quotationData),
      });

      console.log('📡 Create Quotation API Response Status:', response.status, response.statusText);
      console.log('📡 Response Headers:', Object.fromEntries(response.headers.entries()));

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ API Error Response Body:', errorText);
        
        try {
          const errorData = JSON.parse(errorText);
          console.error('❌ Parsed Error Data:', errorData);
          console.error('❌ Validation Errors:', errorData.errors);
        } catch (parseError) {
          console.error('❌ Could not parse error response as JSON');
        }
        
        let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
        
        try {
          const errorData = JSON.parse(errorText);
          errorMessage = errorData.message || errorData.detail || errorMessage;
          console.error('API Error Details:', errorData);
          console.error('❌ Validation Errors:', errorData.errors);
        } catch {
          console.error('Raw Error Response:', errorText);
        }

        console.error('❌ Create Quotation API Error:', {
          status: response.status,
          statusText: response.statusText,
          message: errorMessage,
          details: errorText,
          url: '/api/SaleManagement/CreateQuotation',
          headers: Object.fromEntries(response.headers.entries())
        });

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

        throw new Error(`Dữ liệu không hợp lệ: ${errorMessage}`);
      }

      const responseData = await response.json();
      console.log('📡 Create Quotation API Response Data:', responseData);

      // Check if response has data (indicating success) or success field
      if (responseData.success || responseData.data || response.status === 200 || response.status === 201) {
        console.log('✅ Quotation created successfully:', responseData);
        return {
          success: true,
          message: responseData.message || 'Tạo báo giá thành công',
          data: responseData.data
        };
      } else {
        console.error('❌ API returned success=false:', responseData);
        return {
          success: false,
          message: responseData.message || 'Tạo báo giá thất bại'
        };
      }
    } catch (error) {
      console.error('❌ Create Quotation API Error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Lỗi không xác định';
      throw new Error(`Lỗi API: ${errorMessage}`);
    }
  }

  async createOrder(orderData: CreateOrderRequest): Promise<CreateOrderResponse> {
    try {
      const token = localStorage.getItem('token');
      
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
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

      console.log('🔄 Creating order via API...', orderData);
      console.log('📤 Request body being sent:', JSON.stringify(orderData, null, 2));
      console.log('🔍 Request body validation:', {
        hasOrderId: !!orderData.orderId,
        hasQuotationId: !!orderData.quotationId,
        hasUserId: !!orderData.userId,
        hasVehicleId: !!orderData.vehicleId,
        hasOrderDate: !!orderData.orderDate,
        hasStatus: !!orderData.status,
        hasTotalAmount: !!orderData.totalAmount,
        orderId: orderData.orderId,
        quotationId: orderData.quotationId,
        userId: orderData.userId,
        vehicleId: orderData.vehicleId,
        orderDate: orderData.orderDate,
        status: orderData.status,
        totalAmount: orderData.totalAmount
      });
      
      const response = await fetch('/api/SaleManagement/CreateOrder', {
        method: 'POST',
        headers,
        body: JSON.stringify(orderData),
      });

      console.log('📡 Create Order API Response Status:', response.status, response.statusText);
      console.log('📡 Response Headers:', Object.fromEntries(response.headers.entries()));

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ API Error Response Body:', errorText);
        
        try {
          const errorData = JSON.parse(errorText);
          console.error('❌ Parsed Error Data:', errorData);
          console.error('❌ Validation Errors:', errorData.errors);
        } catch (parseError) {
          console.error('❌ Could not parse error response as JSON');
        }
        
        let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
        
        try {
          const errorData = JSON.parse(errorText);
          errorMessage = errorData.message || errorData.detail || errorMessage;
          console.error('API Error Details:', errorData);
          console.error('❌ Validation Errors:', errorData.errors);
        } catch {
          console.error('Raw Error Response:', errorText);
        }

        console.error('❌ Create Order API Error:', {
          status: response.status,
          statusText: response.statusText,
          message: errorMessage,
          details: errorText,
          url: '/api/SaleManagement/CreateOrder',
          headers: Object.fromEntries(response.headers.entries())
        });

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

        throw new Error(`Dữ liệu không hợp lệ: ${errorMessage}`);
      }

      const responseData = await response.json();
      console.log('📡 Create Order API Response Data:', responseData);

      // Check if response has data (indicating success) or success field
      if (responseData.success || responseData.data || response.status === 200 || response.status === 201) {
        console.log('✅ Order created successfully:', responseData);
        return {
          success: true,
          message: responseData.message || 'Tạo đơn hàng thành công',
          data: responseData.data
        };
      } else {
        console.error('❌ API returned success=false:', responseData);
        return {
          success: false,
          message: responseData.message || 'Tạo đơn hàng thất bại'
        };
      }
    } catch (error) {
      console.error('❌ Create Order API Error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Lỗi không xác định';
      throw new Error(`Lỗi API: ${errorMessage}`);
    }
  }

  async getQuotations(): Promise<QuotationListResponse> {
    try {
      const token = localStorage.getItem('token');
      
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
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

      console.log('🔍 Fetching quotations from API...');
      const response = await fetch('/api/SaleManagement/GetQuotations', {
        method: 'GET',
        headers,
      });

      console.log('📡 Get Quotations API Response Status:', response.status, response.statusText);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ API Error Response Body:', errorText);
        
        try {
          const errorData = JSON.parse(errorText);
          console.error('❌ Parsed Error Data:', errorData);
        } catch (parseError) {
          console.error('❌ Could not parse error response as JSON');
        }
        
        let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
        
        try {
          const errorData = JSON.parse(errorText);
          errorMessage = errorData.message || errorData.detail || errorMessage;
          console.error('API Error Details:', errorData);
        } catch {
          console.error('Raw Error Response:', errorText);
        }

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

        throw new Error(`Lấy danh sách báo giá thất bại: ${errorMessage}`);
      }

      const responseData = await response.json();
      console.log('📡 Get Quotations API Response Data:', responseData);

      if (responseData.success && responseData.data && Array.isArray(responseData.data)) {
        console.log('✅ Quotations loaded from API:', responseData.data.length);
        return {
          success: true,
          message: 'Lấy danh sách báo giá thành công',
          data: responseData.data
        };
      } else if (responseData.success && responseData.data && Array.isArray(responseData.data)) {
        console.log('✅ Quotations loaded from API (alternative format):', responseData.data.length);
        return {
          success: true,
          message: 'Lấy danh sách báo giá thành công',
          data: responseData.data
        };
      } else {
        console.error('❌ Unexpected API response format:', responseData);
        throw new Error('Định dạng phản hồi API không hợp lệ');
      }
    } catch (error) {
      console.error('❌ Get Quotations API Error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Lỗi không xác định';
      throw new Error(`Lấy báo giá thất bại: ${errorMessage}`);
    }
  }
}

export const saleService = new SaleService();
