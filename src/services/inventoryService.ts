import { authService } from './authService';

export interface Inventory {
  inventoryId: number;
  vehicleId: number;
  model: string;
  color: string;
  price: number;
  quantity: number;
  status: string;
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
      
      return { 
        success: true, 
        message: responseData.message || 'Lấy danh sách tồn kho thành công', 
        data: responseData.data || []
      };
    } catch (error) {
      console.error('Failed to fetch inventory:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Không thể tải danh sách tồn kho: ${errorMessage}`);
    }
  },

  async getInventoryByVehicleId(vehicleId: number): Promise<ApiResponse<Inventory>> {
    try {
      console.log(`📦 Fetching inventory for vehicle ID: ${vehicleId}`);
      
      const token = localStorage.getItem('token');
      
      const headers: Record<string, string> = {
        'Accept': '*/*',
      };
      
      if (token) {
        if (authService.isTokenValid(token) || token.startsWith('mock-token-')) {
          headers['Authorization'] = `Bearer ${token}`;
        }
      }

      const response = await fetch(`/api/Inventory/${vehicleId}`, {
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

  async updateInventory(vehicleId: number, quantity: number): Promise<ApiResponse<Inventory>> {
    try {
      console.log(`🔄 Updating inventory for vehicle ID: ${vehicleId}`);
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

      const response = await fetch(`/api/Inventory/${vehicleId}/update`, {
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

      const response = await fetch('/api/Inventory/dispatch', {
        method: 'POST',
        headers,
        body: JSON.stringify(dispatchData),
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
  }
};
