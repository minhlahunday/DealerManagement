import { authService } from './authService';

export interface Inventory {
  inventoryId: number;
  vehicleId: number;
  model: string;
  color: string;
  price: number;
  finalPrice?: number; // Giá sau khi áp dụng giảm giá
  discountId?: number; // ID của discount được áp dụng
  quantity: number;
  status: string;
  // Additional fields from API
  type?: string;
  version?: string;
  distance?: string;
  timecharging?: string;
  speed?: string;
  image1?: string;
  image2?: string;
  image3?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  status?: number;
}

export interface DispatchReport {
  [key: string]: unknown; // Flexible structure to handle any response format
}

export interface DispatchRequest {
  vehicleId: number;
  quantity: number;
  dealerId: number;
  color: string;
}

export const inventoryService = {
  async getInventory(): Promise<ApiResponse<Inventory[]>> {
    try {
      console.log('Fetching inventory from API...');
      
      const token = localStorage.getItem('token');
      
      const headers: Record<string, string> = {
        'Accept': '*/*',
      };
      
      if (token) {
        if (authService.isTokenValid(token) || token.startsWith('mock-token-')) {
          headers['Authorization'] = `Bearer ${token}`;
          console.log('✅ Token added to request');
        }
      }

      const response = await fetch('/api/Inventory', {
        method: 'GET',
        headers,
      });

      console.log('Response status:', response.status);

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

      const responseData = await response.json();
      console.log('✅ Inventory loaded:', responseData);
      
      // API trả về trực tiếp array hoặc { data: array }
      const inventoryData = Array.isArray(responseData) ? responseData : (responseData.data || []);
      
      return { 
        success: true, 
        message: responseData.message || 'Lấy danh sách tồn kho thành công', 
        data: inventoryData
      };
    } catch (error) {
      console.error('Failed to fetch inventory:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Không thể tải danh sách tồn kho: ${errorMessage}`);
    }
  },

  async getInventoryById(inventoryId: number): Promise<ApiResponse<Inventory>> {
    try {
      console.log(`📦 Fetching inventory ID: ${inventoryId}`);
      
      const token = localStorage.getItem('token');
      
      const headers: Record<string, string> = {
        'Accept': '*/*',
      };
      
      if (token) {
        if (authService.isTokenValid(token) || token.startsWith('mock-token-')) {
          headers['Authorization'] = `Bearer ${token}`;
        }
      }

      const response = await fetch(`/api/Inventory/${inventoryId}`, {
        method: 'GET',
        headers,
      });

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

      const responseData = await response.json();
      console.log('✅ Inventory detail loaded:', responseData);
      
      return { 
        success: true, 
        message: responseData.message || 'Lấy chi tiết tồn kho thành công', 
        data: responseData.data || responseData
      };
    } catch (error) {
      console.error('Failed to fetch inventory detail:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Không thể tải chi tiết tồn kho: ${errorMessage}`);
    }
  },

  async updateInventory(inventoryId: number, quantity: number): Promise<ApiResponse<Inventory>> {
    try {
      console.log(`🔄 Updating inventory ID: ${inventoryId}`);
      console.log('📦 New quantity:', quantity);
      
      const token = localStorage.getItem('token');
      
      const headers: Record<string, string> = {
        'Accept': '*/*',
        'Content-Type': 'application/json',
      };
      
      if (token) {
        if (authService.isTokenValid(token) || token.startsWith('mock-token-')) {
          headers['Authorization'] = `Bearer ${token}`;
        }
      }

      // API chỉ cần số lượng (quantity) thôi
      const bodyData = JSON.stringify(quantity);
      console.log('📤 Sending body:', bodyData);

      const response = await fetch(`/api/Inventory/${inventoryId}`, {
        method: 'PUT',
        headers,
        body: bodyData,
      });

      console.log('📥 Response status:', response.status);

      if (!response.ok) {
        let errorMessage = `HTTP error! status: ${response.status}`;
        let errorDetails = null;
        try {
          const errorData = await response.json();
          console.error('❌ Error response:', errorData);
          errorDetails = errorData;
          errorMessage = errorData.message || errorData.error || errorData.title || errorMessage;
          
          // Log validation errors if any
          if (errorData.errors) {
            console.error('Validation errors:', errorData.errors);
            errorMessage += '\n' + JSON.stringify(errorData.errors);
          }
        } catch {
          const textError = await response.text();
          console.error('❌ Error text:', textError);
          errorMessage = textError || response.statusText || errorMessage;
        }
        
        if (response.status === 401) {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          window.location.href = '/';
          throw new Error('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
        }
        
        throw new Error(errorMessage);
      }

      const responseData = await response.json();
      console.log('✅ Inventory updated:', responseData);
      
      return { 
        success: true, 
        message: responseData.message || 'Cập nhật tồn kho thành công', 
        data: responseData.data || responseData
      };
    } catch (error) {
      console.error('Failed to update inventory:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Không thể cập nhật tồn kho: ${errorMessage}`);
    }
  },

  async getDispatchReport(fromDate: string, toDate: string): Promise<ApiResponse<DispatchReport>> {
    try {
      console.log('📊 Fetching dispatch report from API...');
      console.log('📅 Date range:', { fromDate, toDate });
      
      const token = localStorage.getItem('token');
      
      const headers: Record<string, string> = {
        'Accept': '*/*',
      };
      
      if (token) {
        if (authService.isTokenValid(token) || token.startsWith('mock-token-')) {
          headers['Authorization'] = `Bearer ${token}`;
          console.log('✅ Token added to request');
        }
      }

      // Build query parameters
      const params = new URLSearchParams({
        fromDate: fromDate,
        toDate: toDate,
      });

      const response = await fetch(`/api/InventoryReport/dispatch-report?${params.toString()}`, {
        method: 'GET',
        headers,
      });

      console.log('Response status:', response.status);

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

      const responseData = await response.json();
      console.log('✅ Dispatch report loaded:', responseData);
      
      return { 
        success: true, 
        message: responseData.message || 'Lấy báo cáo dispatch thành công', 
        data: responseData.data || responseData
      };
    } catch (error) {
      console.error('Failed to fetch dispatch report:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Không thể tải báo cáo dispatch: ${errorMessage}`);
    }
  },

  async dispatchInventory(dispatchData: DispatchRequest): Promise<ApiResponse<unknown>> {
    try {
      console.log('🚚 Dispatching inventory...', dispatchData);
      
      // Validation ở frontend trước khi gửi request
      if (!dispatchData.vehicleId || dispatchData.vehicleId <= 0) {
        throw new Error('Vehicle ID không hợp lệ. Vui lòng kiểm tra lại.');
      }
      
      if (!dispatchData.quantity || dispatchData.quantity <= 0) {
        throw new Error('Số lượng xe phải lớn hơn 0. Vui lòng kiểm tra lại.');
      }
      
      if (!dispatchData.dealerId || dispatchData.dealerId <= 0) {
        throw new Error('Dealer ID không hợp lệ. Vui lòng kiểm tra lại.');
      }
      
      if (!dispatchData.color || dispatchData.color.trim() === '') {
        throw new Error('Màu xe không được để trống. Vui lòng kiểm tra lại.');
      }
      
      // Đảm bảo các giá trị là số nguyên và color là string
      const validatedData = {
        vehicleId: Number(dispatchData.vehicleId),
        quantity: Number(dispatchData.quantity),
        dealerId: Number(dispatchData.dealerId),
        color: String(dispatchData.color).trim()
      };
      
      // Validate lại sau khi convert
      if (isNaN(validatedData.vehicleId) || validatedData.vehicleId <= 0) {
        throw new Error('Vehicle ID phải là số nguyên dương hợp lệ.');
      }
      
      if (isNaN(validatedData.quantity) || validatedData.quantity <= 0) {
        throw new Error('Số lượng xe phải là số nguyên dương hợp lệ.');
      }
      
      if (isNaN(validatedData.dealerId) || validatedData.dealerId <= 0) {
        throw new Error('Dealer ID phải là số nguyên dương hợp lệ.');
      }
      
      const token = localStorage.getItem('token');
      
      const headers: Record<string, string> = {
        'Accept': '*/*',
        'Content-Type': 'application/json',
      };
      
      if (token) {
        if (authService.isTokenValid(token) || token.startsWith('mock-token-')) {
          headers['Authorization'] = `Bearer ${token}`;
          console.log('✅ Token added to request');
        }
      }

      console.log('✅ Validated dispatch data:', validatedData);
      const response = await fetch('/api/Inventory/dispatch', {
        method: 'POST',
        headers,
        body: JSON.stringify(validatedData),
      });

      console.log('Response status:', response.status);

      if (!response.ok) {
        let errorMessage = `HTTP error! status: ${response.status}`;
        let isStockError = false;
        
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorData.error || errorMessage;
          
          // Check for stock-related errors
          const errorText = errorMessage.toLowerCase();
          if (errorText.includes('stock') || 
              errorText.includes('tồn kho') ||
              errorText.includes('hết hàng') ||
              errorText.includes('insufficient') ||
              errorText.includes('quantity') ||
              errorText.includes('không đủ') ||
              errorText.includes('out of stock')) {
            isStockError = true;
            errorMessage = `HẾT HÀNG: ${errorMessage}`;
          }
        } catch {
          errorMessage = response.statusText || errorMessage;
        }
        
        if (response.status === 401) {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          window.location.href = '/';
          throw new Error('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
        }
        
        // Enhanced error message for stock issues
        if (isStockError) {
          throw new Error(`🚫 HẾT HÀNG!\n\nKhông đủ số lượng xe trong kho để chuyển xuống đại lý.\n\nChi tiết: ${errorMessage}\n\nVui lòng kiểm tra tồn kho trước khi thực hiện chuyển xe.`);
        }
        
        throw new Error(errorMessage);
      }

      const responseData = await response.json();
      console.log('✅ Inventory dispatched:', responseData);
      
      return { 
        success: true, 
        message: responseData.message || 'Chuyển xe xuống đại lý thành công', 
        data: responseData.data || responseData
      };
    } catch (error) {
      console.error('Failed to dispatch inventory:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Không thể chuyển xe xuống đại lý: ${errorMessage}`);
    }
  },

  async createInventory(vehicleId: number, quantity: number): Promise<ApiResponse<Inventory>> {
    try {
      console.log('🆕 Creating inventory for vehicle:', vehicleId, 'quantity:', quantity);
      
      // Validation
      if (!vehicleId || vehicleId <= 0) {
        throw new Error('Vehicle ID không hợp lệ');
      }
      if (quantity === undefined || quantity === null || quantity < 0) {
        throw new Error('Số lượng phải lớn hơn hoặc bằng 0');
      }
      
      const token = localStorage.getItem('token');
      
      const headers: Record<string, string> = {
        'Accept': '*/*',
        'Content-Type': 'application/json',
      };
      
      if (token) {
        if (authService.isTokenValid(token) || token.startsWith('mock-token-')) {
          headers['Authorization'] = `Bearer ${token}`;
          console.log('✅ Token added to request');
        }
      }

      // Build URL with query parameter
      const url = `/api/Inventory/${vehicleId}/create${quantity !== undefined && quantity !== null ? `?quantity=${quantity}` : ''}`;
      console.log('📡 Creating inventory with URL:', url);

      const response = await fetch(url, {
        method: 'POST',
        headers,
      });

      console.log('Response status:', response.status);

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

      const responseData = await response.json();
      console.log('✅ Inventory created:', responseData);
      
      return { 
        success: true, 
        message: responseData.message || 'Tạo tồn kho thành công', 
        data: responseData.data || responseData
      };
    } catch (error) {
      console.error('Failed to create inventory:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Không thể tạo tồn kho: ${errorMessage}`);
    }
  },

  async deleteInventory(inventoryId: number): Promise<ApiResponse<null>> {
    try {
      console.log('🗑️ Deleting inventory:', inventoryId);
      
      // Validation
      if (!inventoryId || inventoryId <= 0) {
        throw new Error('Inventory ID không hợp lệ');
      }
      
      const token = localStorage.getItem('token');
      
      const headers: Record<string, string> = {
        'Accept': '*/*',
      };
      
      if (token) {
        if (authService.isTokenValid(token) || token.startsWith('mock-token-')) {
          headers['Authorization'] = `Bearer ${token}`;
          console.log('✅ Token added to request');
        }
      }

      const url = `/api/Inventory/${inventoryId}`;
      console.log('📡 Deleting inventory with URL:', url);

      const response = await fetch(url, {
        method: 'DELETE',
        headers,
      });

      console.log('Response status:', response.status);

      if (!response.ok) {
        let errorMessage = `HTTP error! status: ${response.status}`;
        
        try {
          const errorText = await response.text();
          console.log('🗑️ Delete Inventory Error Response Text:', errorText);
          
          // Try to parse as JSON
          let errorData;
          try {
            errorData = JSON.parse(errorText);
          } catch {
            // If not JSON, use text as is
            errorMessage = errorText || response.statusText || errorMessage;
          }
          
          // Extract error message from various possible formats
          if (errorData) {
            errorMessage = errorData.message || 
                          errorData.error || 
                          errorData.title ||
                          errorData.Message ||
                          errorData.Error ||
                          (typeof errorData === 'string' ? errorData : errorMessage);
            
            // Handle validation errors array
            if (errorData.errors && typeof errorData.errors === 'object') {
              const validationErrors = Object.values(errorData.errors).flat();
              if (validationErrors.length > 0) {
                errorMessage = validationErrors.join(', ');
              }
            }
            
            // If still no message, try to extract from response
            if (!errorMessage || errorMessage === `HTTP error! status: ${response.status}`) {
              errorMessage = errorText || response.statusText || errorMessage;
            }
          }
        } catch (parseError) {
          console.error('Error parsing error response:', parseError);
          errorMessage = response.statusText || errorMessage;
        }
        
        if (response.status === 401) {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          window.location.href = '/';
          throw new Error('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
        }
        
        console.error('🗑️ Delete Inventory Error Message:', errorMessage);
        throw new Error(errorMessage);
      }

      // Check if response has content
      let responseData = null;
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        try {
          responseData = await response.json();
        } catch {
          // Response might be empty, that's ok
        }
      }
      
      console.log('✅ Inventory deleted:', responseData);
      
      return { 
        success: true, 
        message: responseData?.message || 'Xóa tồn kho thành công', 
        data: null
      };
    } catch (error) {
      console.error('Failed to delete inventory:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Không thể xóa tồn kho: ${errorMessage}`);
    }
  }
};
