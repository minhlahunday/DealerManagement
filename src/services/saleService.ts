import { authService } from './authService';

export interface Quotation {
  quotationId: number;
  userId: number;
  vehicleId: number;
  quotationDate: string;
  basePrice: number;
  discount: number;
  finalPrice: number;
  attachmentImage: string | null;
  attachmentFile: string | null;
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
  attachmentImage: string;
  attachmentFile: string;
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

export interface QuotationDetailResponse {
  success: boolean;
  message: string;
  data?: Quotation;
}

export interface UpdateQuotationRequest {
  quotationId: number;
  userId: number;
  vehicleId: number;
  quotationDate: string;
  basePrice: number;
  discount: number;
  finalPrice: number;
  attachmentImage: string;
  attachmentFile: string;
  status: string;
}

export interface UpdateQuotationResponse {
  success: boolean;
  message: string;
  data?: Quotation;
}

export interface DeleteQuotationResponse {
  success: boolean;
  message: string;
}

export interface SaleContract {
  salesContractId: number;
  orderId: number;
  contractDate: string;
  terms: string;
  signedByDealer: string;
  customerName: string | null;
  phone: string | null;
  email: string | null;
  paymentMethod: string | null;
  address: string | null;
  cccd: string | null;
  contractImage: string | null;
  contractFile?: string | null;
}

export interface CreateSaleContractRequest {
  salesContractId: number;
  orderId: number;
  contractDate: string;
  terms: string;
  signedByDealer: string;
  customerName: string;
  phone: string;
  email: string;
  paymentMethod: string;
  address: string;
  cccd: string;
  contractImage: string;
  contractFile: string;
}

export interface CreateSaleContractResponse {
  success: boolean;
  message: string;
  data?: {
    contractId: number;
    quotationId: number;
    userId: number;
    vehicleId: number;
    contractDate: string;
    totalAmount: number;
    status: string;
  };
}

export interface Report {
  reportId: number;
  senderName: string;
  userId: number;
  orderId: number;
  reportType: string;
  createdDate: string;
  resolvedDate: string;
  content: string;
  status: string;
}

export interface UpdateReportRequest {
  reportId: number;
  senderName: string;
  userId: number;
  orderId: number;
  reportType: string;
  createdDate: string;
  resolvedDate: string;
  content: string;
  status: string;
}

export interface UpdateReportResponse {
  success: boolean;
  message: string;
  data?: Report;
}

export interface DeleteReportResponse {
  success: boolean;
  message: string;
}

export interface Order {
  orderId: number;
  quotationId: number;
  userId: number;
  vehicleId: number;
  orderDate: string;
  deliveryAddress: string | null;
  attachmentImage: string | null;
  attachmentFile: string | null;
  status: string;
  totalAmount: number;
}

export interface CreateOrderRequest {
  orderId: number;
  quotationId: number;
  userId: number;
  vehicleId: number;
  orderDate: string;
  deliveryAddress: string;
  attachmentImage: string;
  attachmentFile: string;
  status: string;
  totalAmount: number;
}

export interface CreateOrderResponse {
  success: boolean;
  message: string;
  data?: Order;
}

export interface GetOrderResponse {
  data: Order;
  status: number;
  message: string;
}

export interface UpdateOrderRequest {
  orderId: number;
  quotationId: number;
  userId: number;
  vehicleId: number;
  orderDate: string;
  deliveryAddress: string;
  attachmentImage: string;
  attachmentFile: string;
  status: string;
  totalAmount: number;
}

export interface UpdateOrderResponse {
  success: boolean;
  message: string;
  data?: Order;
}

export interface DeleteOrderResponse {
  success: boolean;
  message: string;
}

export interface CreateDealerOrderRequest {
  dealerOrderId: number;
  userId: number;
  vehicleId: number;
  quantity: number;
  color: string;
  orderDate: string;
  status: string;
  paymentStatus: string;
  totalAmount: number;
}

export interface CreateDealerOrderResponse {
  success: boolean;
  message: string;
  data?: {
    dealerOrderId: number;
    userId: number;
    vehicleId: number;
    quantity: number;
    color: string;
    orderDate: string;
    status: string;
    paymentStatus: string;
    totalAmount: number;
  };
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
      
      const response = await fetch('/api/Quotation', {
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
        } catch {
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
          url: '/api/Quotation',
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

      // Ensure required fields are not empty
      const validatedOrderData: CreateOrderRequest = {
        ...orderData,
        deliveryAddress: orderData.deliveryAddress || 'Chưa xác định',
        attachmentImage: orderData.attachmentImage || 'default-image.jpg',
        attachmentFile: orderData.attachmentFile || 'default-file.pdf'
      };

      console.log('🔄 Creating order via API...', validatedOrderData);
      console.log('📤 Request body being sent:', JSON.stringify(validatedOrderData, null, 2));
      console.log('🔍 Request body validation:', {
        hasOrderId: !!validatedOrderData.orderId,
        hasQuotationId: !!validatedOrderData.quotationId,
        hasUserId: !!validatedOrderData.userId,
        hasVehicleId: !!validatedOrderData.vehicleId,
        hasOrderDate: !!validatedOrderData.orderDate,
        hasDeliveryAddress: !!validatedOrderData.deliveryAddress,
        hasAttachmentImage: !!validatedOrderData.attachmentImage,
        hasAttachmentFile: !!validatedOrderData.attachmentFile,
        hasStatus: !!validatedOrderData.status,
        hasTotalAmount: !!validatedOrderData.totalAmount,
        orderId: validatedOrderData.orderId,
        quotationId: validatedOrderData.quotationId,
        userId: validatedOrderData.userId,
        vehicleId: validatedOrderData.vehicleId,
        orderDate: validatedOrderData.orderDate,
        deliveryAddress: validatedOrderData.deliveryAddress,
        attachmentImage: validatedOrderData.attachmentImage,
        attachmentFile: validatedOrderData.attachmentFile,
        status: validatedOrderData.status,
        totalAmount: validatedOrderData.totalAmount
      });
      
      const response = await fetch('/api/Order', {
        method: 'POST',
        headers,
        body: JSON.stringify(validatedOrderData),
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
        } catch {
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
          url: '/api/Order',
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
      const response = await fetch('/api/Quotation', {
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
        } catch {
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
      console.log('📡 Response Data Type:', typeof responseData);
      console.log('📡 Response Data Keys:', Object.keys(responseData));
      console.log('📡 Is Array?', Array.isArray(responseData));

      // Handle different response formats
      if (Array.isArray(responseData)) {
        // Direct array response
        console.log('✅ Quotations loaded from API (direct array):', responseData.length);
        return {
          success: true,
          message: 'Lấy danh sách báo giá thành công',
          data: responseData
        };
      } else if (responseData.success && responseData.data && Array.isArray(responseData.data)) {
        // Standard success response with data array
        console.log('✅ Quotations loaded from API (success wrapper):', responseData.data.length);
        return {
          success: true,
          message: 'Lấy danh sách báo giá thành công',
          data: responseData.data
        };
      } else if (responseData.data && Array.isArray(responseData.data)) {
        // Response with data array but no success field
        console.log('✅ Quotations loaded from API (data wrapper):', responseData.data.length);
        return {
          success: true,
          message: 'Lấy danh sách báo giá thành công',
          data: responseData.data
        };
      } else {
        console.error('❌ Unexpected API response format:', responseData);
        console.error('❌ Response structure:', {
          isArray: Array.isArray(responseData),
          hasSuccess: 'success' in responseData,
          hasData: 'data' in responseData,
          dataIsArray: responseData.data ? Array.isArray(responseData.data) : false,
          keys: Object.keys(responseData)
        });
        
        // Return empty array instead of throwing error
        console.log('⚠️ Returning empty array due to unexpected format');
        return {
          success: true,
          message: 'Không có dữ liệu báo giá',
          data: []
        };
      }
    } catch (error) {
      console.error('❌ Get Quotations API Error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Lỗi không xác định';
      throw new Error(`Lấy báo giá thất bại: ${errorMessage}`);
    }
  }

  async getQuotationById(id: number): Promise<QuotationDetailResponse> {
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

      console.log(`🔍 Fetching quotation by ID: ${id} from API...`);
      const response = await fetch(`/api/Quotation/${id}`, {
        method: 'GET',
        headers,
      });

      console.log(`📡 Get Quotation ${id} API Response Status:`, response.status, response.statusText);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ API Error Response Body:', errorText);
        
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
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          window.location.href = '/';
          throw new Error('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
        } else if (response.status === 403) {
          console.error('Authorization failed (403) - Insufficient permissions');
          throw new Error('Truy cập bị từ chối. Bạn không có quyền truy cập tài nguyên này.');
        } else if (response.status === 404) {
          throw new Error('Không tìm thấy báo giá với ID này.');
        }

        throw new Error(`Lấy chi tiết báo giá thất bại: ${errorMessage}`);
      }

      const responseData = await response.json();
      console.log(`📡 Get Quotation ${id} API Response Data:`, responseData);
      console.log(`📡 Response Data Type:`, typeof responseData);
      console.log(`📡 Response Data Keys:`, Object.keys(responseData));
      console.log(`📡 Has quotationId:`, 'quotationId' in responseData);
      console.log(`📡 Has success:`, 'success' in responseData);
      console.log(`📡 Has data:`, 'data' in responseData);

      // Handle different response formats
      if (responseData && typeof responseData === 'object') {
        if (responseData.success && responseData.data) {
          // Standard success response with data wrapper
          console.log(`✅ Quotation ${id} loaded from API (success wrapper)`);
          return {
            success: true,
            message: 'Lấy chi tiết báo giá thành công',
            data: responseData.data
          };
        } else if (responseData.quotationId) {
          // Direct quotation object
          console.log(`✅ Quotation ${id} loaded from API (direct object)`);
          return {
            success: true,
            message: 'Lấy chi tiết báo giá thành công',
            data: responseData
          };
        } else if (responseData.data && responseData.data.quotationId) {
          // Response with data field containing quotation
          console.log(`✅ Quotation ${id} loaded from API (data field)`);
          return {
            success: true,
            message: 'Lấy chi tiết báo giá thành công',
            data: responseData.data
          };
        } else {
          console.error('❌ Unexpected quotation response format:', responseData);
          console.error('❌ Response structure analysis:', {
            isObject: typeof responseData === 'object',
            hasQuotationId: 'quotationId' in responseData,
            hasSuccess: 'success' in responseData,
            hasData: 'data' in responseData,
            dataType: responseData.data ? typeof responseData.data : 'undefined',
            keys: Object.keys(responseData),
            quotationIdValue: responseData.quotationId,
            successValue: responseData.success,
            dataValue: responseData.data
          });
          
          // Return empty response instead of throwing error
          console.log('⚠️ Returning empty response due to unexpected format');
          return {
            success: false,
            message: 'Không thể đọc dữ liệu báo giá từ API'
          };
        }
      } else {
        console.error('❌ Invalid quotation response type:', typeof responseData);
        return {
          success: false,
          message: 'Phản hồi API không hợp lệ'
        };
      }
    } catch (error) {
      console.error(`❌ Get Quotation ${id} API Error:`, error);
      const errorMessage = error instanceof Error ? error.message : 'Lỗi không xác định';
      throw new Error(`Lấy chi tiết báo giá thất bại: ${errorMessage}`);
    }
  }

  async updateQuotation(id: number, quotationData: UpdateQuotationRequest): Promise<UpdateQuotationResponse> {
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

      console.log(`🔄 Updating quotation ${id} via API...`, quotationData);
      const response = await fetch(`/api/Quotation/${id}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify(quotationData),
      });

      console.log(`📡 Update Quotation ${id} API Response Status:`, response.status, response.statusText);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ API Error Response Body:', errorText);
        
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
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          window.location.href = '/';
          throw new Error('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
        } else if (response.status === 403) {
          console.error('Authorization failed (403) - Insufficient permissions');
          throw new Error('Truy cập bị từ chối. Bạn không có quyền truy cập tài nguyên này.');
        } else if (response.status === 404) {
          throw new Error('Không tìm thấy báo giá với ID này.');
        }

        throw new Error(`Cập nhật báo giá thất bại: ${errorMessage}`);
      }

      const responseData = await response.json();
      console.log(`📡 Update Quotation ${id} API Response Data:`, responseData);

      if (responseData.success || response.status === 200 || response.status === 204) {
        console.log(`✅ Quotation ${id} updated successfully`);
        return {
          success: true,
          message: responseData.message || 'Cập nhật báo giá thành công',
          data: responseData.data || responseData
        };
      } else {
        console.error('❌ API returned success=false:', responseData);
        return {
          success: false,
          message: responseData.message || 'Cập nhật báo giá thất bại'
        };
      }
    } catch (error) {
      console.error(`❌ Update Quotation ${id} API Error:`, error);
      const errorMessage = error instanceof Error ? error.message : 'Lỗi không xác định';
      throw new Error(`Cập nhật báo giá thất bại: ${errorMessage}`);
    }
  }

  async deleteQuotation(id: number): Promise<DeleteQuotationResponse> {
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

      console.log(`🗑️ Deleting quotation ${id} via API...`);
      const response = await fetch(`/api/Quotation/${id}`, {
        method: 'DELETE',
        headers,
      });

      console.log(`📡 Delete Quotation ${id} API Response Status:`, response.status, response.statusText);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ API Error Response Body:', errorText);
        
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
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          window.location.href = '/';
          throw new Error('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
        } else if (response.status === 403) {
          console.error('Authorization failed (403) - Insufficient permissions');
          throw new Error('Truy cập bị từ chối. Bạn không có quyền truy cập tài nguyên này.');
        } else if (response.status === 404) {
          throw new Error('Không tìm thấy báo giá với ID này.');
        } else if (response.status === 500 && errorText.includes('REFERENCE constraint')) {
          throw new Error('Không thể xóa báo giá này vì đã được sử dụng để tạo đơn hàng. Vui lòng xóa đơn hàng liên quan trước.');
        }

        throw new Error(`Xóa báo giá thất bại: ${errorMessage}`);
      }

      // For DELETE requests, response might be empty
      let responseData = null;
      try {
        const responseText = await response.text();
        if (responseText) {
          responseData = JSON.parse(responseText);
          console.log(`📡 Delete Quotation ${id} API Response Data:`, responseData);
        }
      } catch {
        console.log('No response body for DELETE request');
      }

      if (response.status === 200 || response.status === 204 || (responseData && responseData.success)) {
        console.log(`✅ Quotation ${id} deleted successfully`);
        return {
          success: true,
          message: responseData?.message || 'Xóa báo giá thành công'
        };
      } else {
        console.error('❌ Delete operation failed:', responseData);
        return {
          success: false,
          message: responseData?.message || 'Xóa báo giá thất bại'
        };
      }
    } catch (error) {
      console.error(`❌ Delete Quotation ${id} API Error:`, error);
      const errorMessage = error instanceof Error ? error.message : 'Lỗi không xác định';
      throw new Error(`Xóa báo giá thất bại: ${errorMessage}`);
    }
  }

  async updateReport(id: number, reportData: UpdateReportRequest): Promise<UpdateReportResponse> {
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

      console.log(`🔄 Updating report ${id} via API...`, reportData);
      const response = await fetch(`/api/Report/${id}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify(reportData),
      });

      console.log(`📡 Update Report ${id} API Response Status:`, response.status, response.statusText);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ API Error Response Body:', errorText);
        
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
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          window.location.href = '/';
          throw new Error('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
        } else if (response.status === 403) {
          console.error('Authorization failed (403) - Insufficient permissions');
          throw new Error('Truy cập bị từ chối. Bạn không có quyền truy cập tài nguyên này.');
        } else if (response.status === 404) {
          throw new Error('Không tìm thấy báo cáo với ID này.');
        }

        throw new Error(`Cập nhật báo cáo thất bại: ${errorMessage}`);
      }

      const responseData = await response.json();
      console.log(`📡 Update Report ${id} API Response Data:`, responseData);

      if (responseData.success || response.status === 200 || response.status === 204) {
        console.log(`✅ Report ${id} updated successfully`);
        return {
          success: true,
          message: responseData.message || 'Cập nhật báo cáo thành công',
          data: responseData.data
        };
      } else {
        console.error('❌ API returned success=false:', responseData);
        return {
          success: false,
          message: responseData.message || 'Cập nhật báo cáo thất bại'
        };
      }
    } catch (error) {
      console.error(`❌ Update Report ${id} API Error:`, error);
      const errorMessage = error instanceof Error ? error.message : 'Lỗi không xác định';
      throw new Error(`Cập nhật báo cáo thất bại: ${errorMessage}`);
    }
  }

  async deleteReport(id: number): Promise<DeleteReportResponse> {
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

      console.log(`🗑️ Deleting report ${id} via API...`);
      const response = await fetch(`/api/Report/${id}`, {
        method: 'DELETE',
        headers,
      });

      console.log(`📡 Delete Report ${id} API Response Status:`, response.status, response.statusText);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ API Error Response Body:', errorText);
        
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
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          window.location.href = '/';
          throw new Error('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
        } else if (response.status === 403) {
          console.error('Authorization failed (403) - Insufficient permissions');
          throw new Error('Truy cập bị từ chối. Bạn không có quyền truy cập tài nguyên này.');
        } else if (response.status === 404) {
          throw new Error('Không tìm thấy báo cáo với ID này.');
        }

        throw new Error(`Xóa báo cáo thất bại: ${errorMessage}`);
      }

      // For DELETE requests, response might be empty
      let responseData = null;
      try {
        const responseText = await response.text();
        if (responseText) {
          responseData = JSON.parse(responseText);
          console.log(`📡 Delete Report ${id} API Response Data:`, responseData);
        }
        } catch {
          console.log('No response body for DELETE request');
        }

      if (response.status === 200 || response.status === 204 || (responseData && responseData.success)) {
        console.log(`✅ Report ${id} deleted successfully`);
        return {
          success: true,
          message: responseData?.message || 'Xóa báo cáo thành công'
        };
      } else {
        console.error('❌ Delete operation failed:', responseData);
        return {
          success: false,
          message: responseData?.message || 'Xóa báo cáo thất bại'
        };
      }
    } catch (error) {
      console.error(`❌ Delete Report ${id} API Error:`, error);
      const errorMessage = error instanceof Error ? error.message : 'Lỗi không xác định';
      throw new Error(`Xóa báo cáo thất bại: ${errorMessage}`);
    }
  }

  // Create Sale Contract
  async createSaleContract(contractData: CreateSaleContractRequest): Promise<CreateSaleContractResponse> {
    try {
      console.log('🔄 Creating sale contract with data:', contractData);

      const token = localStorage.getItem('token');
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };

      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
        console.log('✅ Token found, adding to headers');
      } else {
        console.warn('No token found in localStorage');
      }

      console.log('Request headers:', headers);

      const response = await fetch('/api/SaleContract', {
        method: 'POST',
        headers,
        body: JSON.stringify(contractData),
      });

      console.log('📡 Create Sale Contract Response status:', response.status);
      console.log('📡 Create Sale Contract Response headers:', Object.fromEntries(response.headers.entries()));

      if (!response.ok) {
        let errorMessage = `HTTP error! status: ${response.status}`;
        let errorDetails = '';
        
        try {
          const errorData = await response.json();
          console.log('🔍 Create Sale Contract API Error Data:', errorData);
          errorMessage = errorData.message || errorData.error || errorData.title || errorMessage;
          errorDetails = JSON.stringify(errorData);
        } catch {
          const errorText = await response.text();
          console.log('🔍 Create Sale Contract API Error Text:', errorText);
          errorMessage = errorText || errorMessage;
        }
        
        console.error('❌ Create Sale Contract API Error:', {
          status: response.status,
          statusText: response.statusText,
          message: errorMessage,
          details: errorDetails
        });
        
        throw new Error(errorMessage);
      }

      const responseData = await response.json();
      console.log('📡 Create Sale Contract API Response Data:', responseData);

      // Check multiple success indicators (HTTP status and response structure)
      const isSuccess = response.ok && 
                       (responseData.success === true || 
                        responseData.status === 200 || 
                        (responseData.message && responseData.message.includes('thành công')));

      if (isSuccess) {
        console.log('✅ Sale contract created successfully:', responseData);
        return {
          success: true,
          message: responseData.message || 'Tạo hợp đồng bán hàng thành công',
          data: responseData.data
        };
      } else {
        console.error('❌ Create Sale Contract returned failure:', {
          httpStatus: response.status,
          responseData: responseData,
          success: responseData.success,
          message: responseData.message
        });
        return {
          success: false,
          message: responseData.message || 'Tạo hợp đồng bán hàng thất bại'
        };
      }
    } catch (error) {
      console.error('❌ Create Sale Contract API Error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Lỗi không xác định';
      throw new Error(`Tạo hợp đồng bán hàng thất bại: ${errorMessage}`);
    }
  }

  async uploadQuotationAttachments(
    quotationId: number, 
    attachmentImage?: File | null, 
    attachmentFile?: File | null
  ): Promise<{ success: boolean; message: string; data?: Quotation }> {
    try {
      const token = localStorage.getItem('token');
      
      const headers: Record<string, string> = {};

      // Add token if available and valid
      if (token) {
        if (authService.isTokenValid(token) || token.startsWith('mock-token-')) {
          headers['Authorization'] = `Bearer ${token}`;
        }
      }

      // Create FormData for multipart/form-data
      const formData = new FormData();
      
      if (attachmentImage) {
        formData.append('attachmentImage', attachmentImage);
        console.log('📎 Adding attachmentImage:', attachmentImage.name);
      }
      
      if (attachmentFile) {
        formData.append('attachmentFile', attachmentFile);
        console.log('📎 Adding attachmentFile:', attachmentFile.name);
      }

      console.log(`📤 Uploading attachments for quotation ${quotationId}...`);
      const response = await fetch(`/api/Quotation/upload?id=${quotationId}`, {
        method: 'POST',
        headers, // Don't set Content-Type, browser will set it automatically for FormData
        body: formData,
      });

      console.log(`📡 Upload Quotation Attachments API Response Status:`, response.status, response.statusText);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ API Error Response Body:', errorText);
        
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
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          window.location.href = '/';
          throw new Error('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
        } else if (response.status === 403) {
          console.error('Authorization failed (403) - Insufficient permissions');
          throw new Error('Truy cập bị từ chối. Bạn không có quyền truy cập tài nguyên này.');
        }

        throw new Error(`Upload tệp đính kèm thất bại: ${errorMessage}`);
      }

      const responseData = await response.json();
      console.log(`📡 Upload Quotation Attachments API Response Data:`, responseData);

      if (responseData.success || response.status === 200) {
        console.log(`✅ Quotation ${quotationId} attachments uploaded successfully`);
        return {
          success: true,
          message: responseData.message || 'Upload tệp đính kèm thành công',
          data: responseData.data
        };
      } else {
        console.error('❌ Upload returned success=false:', responseData);
        return {
          success: false,
          message: responseData.message || 'Upload tệp đính kèm thất bại'
        };
      }

    } catch (error) {
      console.error(`❌ Upload Quotation ${quotationId} Attachments Error:`, error);
      const errorMessage = error instanceof Error ? error.message : 'Lỗi không xác định';
      throw new Error(`Upload tệp đính kèm thất bại: ${errorMessage}`);
    }
  }

  async getOrderById(orderId: number): Promise<GetOrderResponse> {
    try {
      const token = localStorage.getItem('token');
      
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };

      // Add token if available and valid
      if (token) {
        if (authService.isTokenValid(token) || token.startsWith('mock-token-')) {
          headers['Authorization'] = `Bearer ${token}`;
          console.log('✅ Valid JWT token added to request');
        } else {
          console.warn('⚠️ Invalid/expired token, proceeding without authentication');
        }
      } else {
        console.warn('No token found in localStorage');
      }

      console.log(`🔍 Fetching order details for ID: ${orderId}`);
      
      const response = await fetch(`/api/Order/${orderId}`, {
        method: 'GET',
        headers,
      });

      console.log('📡 Get Order API Response Status:', response.status, response.statusText);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ API Error Response Body:', errorText);
        
        let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
        
        try {
          const errorData = JSON.parse(errorText);
          errorMessage = errorData.message || errorData.detail || errorMessage;
        } catch {
          console.error('Raw Error Response:', errorText);
        }
        
        throw new Error(errorMessage);
      }

      const responseData: GetOrderResponse = await response.json();
      console.log('✅ Order details fetched successfully:', responseData);
      
      return responseData;

    } catch (error) {
      console.error(`❌ Get Order ${orderId} Error:`, error);
      const errorMessage = error instanceof Error ? error.message : 'Lỗi không xác định';
      throw new Error(`Lấy thông tin đơn hàng thất bại: ${errorMessage}`);
    }
  }

  async updateOrder(orderId: number, orderData: UpdateOrderRequest): Promise<UpdateOrderResponse> {
    try {
      const token = localStorage.getItem('token');
      
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };

      // Add token if available and valid
      if (token) {
        if (authService.isTokenValid(token) || token.startsWith('mock-token-')) {
          headers['Authorization'] = `Bearer ${token}`;
          console.log('✅ Valid JWT token added to request');
        } else {
          console.warn('⚠️ Invalid/expired token, proceeding without authentication');
        }
      } else {
        console.warn('No token found in localStorage');
      }

      console.log(`🔄 Updating order ${orderId} with data:`, orderData);
      
      const response = await fetch(`/api/Order/${orderId}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify(orderData),
      });

      console.log('📡 Update Order API Response Status:', response.status, response.statusText);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ API Error Response Body:', errorText);
        
        let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
        
        try {
          const errorData = JSON.parse(errorText);
          errorMessage = errorData.message || errorData.detail || errorMessage;
        } catch {
          console.error('Raw Error Response:', errorText);
        }
        
        throw new Error(errorMessage);
      }

      const responseData = await response.json();
      console.log('✅ Order updated successfully:', responseData);
      
      return {
        success: true,
        message: responseData.message || 'Cập nhật đơn hàng thành công',
        data: responseData.data
      };

    } catch (error) {
      console.error(`❌ Update Order ${orderId} Error:`, error);
      const errorMessage = error instanceof Error ? error.message : 'Lỗi không xác định';
      throw new Error(`Cập nhật đơn hàng thất bại: ${errorMessage}`);
    }
  }

  async deleteOrder(orderId: number): Promise<DeleteOrderResponse> {
    try {
      const token = localStorage.getItem('token');
      
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };

      // Add token if available and valid
      if (token) {
        if (authService.isTokenValid(token) || token.startsWith('mock-token-')) {
          headers['Authorization'] = `Bearer ${token}`;
          console.log('✅ Valid JWT token added to request');
        } else {
          console.warn('⚠️ Invalid/expired token, proceeding without authentication');
        }
      } else {
        console.warn('No token found in localStorage');
      }

      console.log(`🗑️ Deleting order ${orderId}`);
      
      const response = await fetch(`/api/Order/${orderId}`, {
        method: 'DELETE',
        headers,
      });

      console.log('📡 Delete Order API Response Status:', response.status, response.statusText);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ API Error Response Body:', errorText);
        
        let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
        
        try {
          const errorData = JSON.parse(errorText);
          errorMessage = errorData.message || errorData.detail || errorMessage;
        } catch {
          console.error('Raw Error Response:', errorText);
          
          // Check for specific error patterns in the raw text
          if (errorText.includes('REFERENCE constraint')) {
            if (errorText.includes('FK__Payments__order_')) {
              errorMessage = 'Không thể xóa đơn hàng này vì vẫn còn thông tin thanh toán liên quan. Vui lòng xóa các giao dịch thanh toán trước khi xóa đơn hàng.';
            } else if (errorText.includes('FK__')) {
              errorMessage = 'Không thể xóa đơn hàng này vì vẫn còn dữ liệu liên quan khác. Vui lòng kiểm tra và xóa các dữ liệu phụ thuộc trước.';
            }
          } else if (errorText.includes('DbUpdateException') || errorText.includes('SqlException')) {
            errorMessage = 'Lỗi cơ sở dữ liệu khi xóa đơn hàng. Vui lòng thử lại hoặc liên hệ quản trị viên.';
          }
        }
        
        throw new Error(errorMessage);
      }

      const responseData = await response.json();
      console.log('✅ Order deleted successfully:', responseData);
      
      return {
        success: true,
        message: responseData.message || 'Xóa đơn hàng thành công'
      };

    } catch (error) {
      console.error(`❌ Delete Order ${orderId} Error:`, error);
      const errorMessage = error instanceof Error ? error.message : 'Lỗi không xác định';
      throw new Error(`Xóa đơn hàng thất bại: ${errorMessage}`);
    }
  }

  // Upload Order Attachments
  async uploadOrderAttachments(
    orderId: number, 
    attachmentImage?: File | null, 
    attachmentFile?: File | null
  ): Promise<{ success: boolean; message: string; data?: Order }> {
    try {
      const token = localStorage.getItem('token');
      
      const headers: Record<string, string> = {};

      // Add token if available and valid
      if (token) {
        if (authService.isTokenValid(token) || token.startsWith('mock-token-')) {
          headers['Authorization'] = `Bearer ${token}`;
          console.log('✅ Valid JWT token added to request');
        } else {
          console.warn('⚠️ Invalid/expired token, proceeding without authentication');
        }
      } else {
        console.warn('No token found in localStorage');
      }

      // Create FormData for multipart/form-data
      const formData = new FormData();
      
      if (attachmentImage) {
        formData.append('attachmentImage', attachmentImage);
        console.log('📎 Adding attachmentImage:', attachmentImage.name);
      }
      
      if (attachmentFile) {
        formData.append('attachmentFile', attachmentFile);
        console.log('📎 Adding attachmentFile:', attachmentFile.name);
      }

      console.log(`📤 Uploading attachments for order ${orderId}...`);
      const response = await fetch(`/api/Order/upload?id=${orderId}`, {
        method: 'POST',
        headers, // Don't set Content-Type, browser will set it automatically for FormData
        body: formData,
      });

      console.log(`📡 Upload Order Attachments API Response Status:`, response.status, response.statusText);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ API Error Response Body:', errorText);
        
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
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          window.location.href = '/';
          throw new Error('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
        } else if (response.status === 403) {
          console.error('Authorization failed (403) - Insufficient permissions');
          throw new Error('Truy cập bị từ chối. Bạn không có quyền truy cập tài nguyên này.');
        }

        throw new Error(`Upload tệp đính kèm thất bại: ${errorMessage}`);
      }

      const responseData = await response.json();
      console.log(`📡 Upload Order Attachments API Response Data:`, responseData);

      if (responseData.success || response.status === 200) {
        console.log(`✅ Order ${orderId} attachments uploaded successfully`);
        return {
          success: true,
          message: responseData.message || 'Upload tệp đính kèm thành công',
          data: responseData.data
        };
      } else {
        console.error('❌ Upload returned success=false:', responseData);
        return {
          success: false,
          message: responseData.message || 'Upload tệp đính kèm thất bại'
        };
      }

    } catch (error) {
      console.error(`❌ Upload Order Attachments ${orderId} Error:`, error);
      const errorMessage = error instanceof Error ? error.message : 'Lỗi không xác định';
      throw new Error(`Upload tệp đính kèm thất bại: ${errorMessage}`);
    }
  }

  // Upload Sale Contract Attachments
  async uploadSaleContractAttachments(
    contractId: number, 
    attachmentImage?: File | null, 
    attachmentFile?: File | null
  ): Promise<{ success: boolean; message: string; data?: SaleContract }> {
    try {
      const token = localStorage.getItem('token');
      
      const headers: Record<string, string> = {};

      // Add token if available and valid
      if (token) {
        if (authService.isTokenValid(token) || token.startsWith('mock-token-')) {
          headers['Authorization'] = `Bearer ${token}`;
          console.log('✅ Valid JWT token added to request');
        } else {
          console.warn('⚠️ Invalid/expired token, proceeding without authentication');
        }
      } else {
        console.warn('No token found in localStorage');
      }

      // Create FormData for multipart/form-data
      const formData = new FormData();
      
      if (attachmentImage) {
        formData.append('attachmentImage', attachmentImage);
        console.log('📎 Adding attachmentImage:', attachmentImage.name);
      }
      
      if (attachmentFile) {
        formData.append('attachmentFile', attachmentFile);
        console.log('📎 Adding attachmentFile:', attachmentFile.name);
      }

      console.log(`📤 Uploading attachments for contract ${contractId}...`);
      const response = await fetch(`/api/SaleContract/upload?id=${contractId}`, {
        method: 'POST',
        headers, // Don't set Content-Type, browser will set it automatically for FormData
        body: formData,
      });

      console.log(`📡 Upload Sale Contract Attachments API Response Status:`, response.status, response.statusText);

      if (!response.ok) {
        let errorMessage = `HTTP error! status: ${response.status}`;
        
        try {
          const errorData = await response.json();
          console.log('🔍 Upload Sale Contract Attachments API Error Data:', errorData);
          errorMessage = errorData.message || errorData.error || errorData.title || errorMessage;
        } catch {
          const errorText = await response.text();
          console.log('🔍 Upload Sale Contract Attachments API Error Text:', errorText);
          errorMessage = errorText || errorMessage;
        }
        
        console.error(`❌ Upload Sale Contract Attachments ${contractId} Error:`, {
          status: response.status,
          statusText: response.statusText,
          message: errorMessage
        });
        
        throw new Error(errorMessage);
      }

      const responseData = await response.json();
      console.log('📡 Upload Sale Contract Attachments API Response Data:', responseData);

      // Check multiple success indicators
      const isSuccess = response.ok && 
                       (responseData.success === true || 
                        responseData.status === 200 || 
                        (responseData.message && responseData.message.includes('thành công')));

      if (isSuccess) {
        console.log(`✅ Sale contract attachments uploaded successfully for contract ${contractId}:`, responseData);
        return {
          success: true,
          message: responseData.message || 'Upload tệp đính kèm thành công',
          data: responseData.data
        };
      } else {
        console.error(`❌ Upload Sale Contract Attachments ${contractId} returned failure:`, responseData);
        return {
          success: false,
          message: responseData.message || 'Upload tệp đính kèm thất bại'
        };
      }

    } catch (error) {
      console.error(`❌ Upload Sale Contract Attachments ${contractId} Error:`, error);
      const errorMessage = error instanceof Error ? error.message : 'Lỗi không xác định';
      throw new Error(`Upload tệp đính kèm thất bại: ${errorMessage}`);
    }
  }

  async createDealerOrder(dealerOrderData: CreateDealerOrderRequest): Promise<CreateDealerOrderResponse> {
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

      // Validate required fields according to schema
      const validatedData = {
        dealerOrderId: dealerOrderData.dealerOrderId || 0,
        userId: dealerOrderData.userId,
        vehicleId: dealerOrderData.vehicleId,
        quantity: dealerOrderData.quantity || 1,
        color: dealerOrderData.color || '',
        orderDate: dealerOrderData.orderDate || new Date().toISOString(),
        status: dealerOrderData.status || 'PENDING',
        paymentStatus: dealerOrderData.paymentStatus || 'UNPAID',
        totalAmount: dealerOrderData.totalAmount || 0
      };

      console.log('🔄 Creating dealer order via API...', validatedData);
      console.log('📤 Request body being sent:', JSON.stringify(validatedData, null, 2));
      
      const response = await fetch('/api/DealerOrder', {
        method: 'POST',
        headers,
        body: JSON.stringify(validatedData),
      });

      console.log('📡 Create Dealer Order API Response Status:', response.status, response.statusText);
      console.log('📡 Response Headers:', Object.fromEntries(response.headers.entries()));

      if (!response.ok) {
        let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
        
        try {
          const errorText = await response.text();
          console.error('❌ API Error Response Body:', errorText);
          
          try {
            const errorData = JSON.parse(errorText);
            console.error('❌ Parsed Error Data:', errorData);
            
            // Handle validation errors
            if (response.status === 400 && errorData.errors) {
              const validationErrors = Object.values(errorData.errors).flat();
              errorMessage = `Validation errors: ${validationErrors.join(', ')}`;
            } else {
              errorMessage = errorData.message || errorData.detail || errorMessage;
            }
          } catch {
            errorMessage = errorText || errorMessage;
          }
        } catch {
          console.error('❌ Could not read error response');
        }

        if (response.status === 401) {
          console.error('Authentication failed (401) - Invalid or missing token');
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          window.location.href = '/';
          throw new Error('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
        } else if (response.status === 403) {
          console.error('Authorization failed (403) - Insufficient permissions');
          throw new Error('Truy cập bị từ chối. Bạn không có quyền truy cập tài nguyên này.');
        }

        throw new Error(`Lỗi API: ${errorMessage}`);
      }

      const responseData = await response.json();
      console.log('📡 Create Dealer Order API Response Data:', responseData);

      if (responseData.success || response.status === 200 || response.status === 201) {
        console.log('✅ Dealer order created successfully');
        return {
          success: true,
          message: responseData.message || 'Tạo hợp đồng thành công',
          data: responseData.data
        };
      } else {
        console.error('❌ Create returned success=false:', responseData);
        return {
          success: false,
          message: responseData.message || 'Tạo hợp đồng thất bại'
        };
      }

    } catch (error) {
      console.error('❌ Create Dealer Order Error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Lỗi không xác định';
      throw new Error(`Tạo hợp đồng thất bại: ${errorMessage}`);
    }
  }
}

export const saleService = new SaleService();
