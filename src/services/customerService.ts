import { Customer } from '../types';
import { mockCustomers } from '../data/mockData';
import { authService } from './authService';

export interface CustomerResponse {
  success: boolean;
  message: string;
  data: Customer[];
}

export interface CustomerDetailResponse {
  success: boolean;
  message: string;
  data: Customer;
}

export interface CreateCustomerRequest {
  userId: number;
  username: string;
  email: string;
  passwordHash: string;
  roleId: number;
  fullName: string;
  phone: string;
  address: string;
  companyName: string;
}

export interface CreateCustomerResponse {
  success: boolean;
  message: string;
  data?: any;
}

export interface UpdateCustomerRequest {
  userId: number;
  username: string;
  email: string;
  passwordHash: string;
  roleId: number;
  fullName: string;
  phone: string;
  address: string;
  companyName: string;
}

export interface UpdateCustomerResponse {
  success: boolean;
  message: string;
  data?: any;
}

export interface DeleteCustomerResponse {
  success: boolean;
  message: string;
  data?: any;
}

class CustomerService {
  async getCustomers(): Promise<CustomerResponse> {
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

      console.log('🔄 Fetching customers from API...');
      const response = await fetch('/api/Customer', {
        method: 'GET',
        headers,
      });

      console.log('📡 Customer API Response Status:', response.status, response.statusText);

      if (!response.ok) {
        const errorText = await response.text();
        let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
        
        try {
          const errorData = JSON.parse(errorText);
          errorMessage = errorData.message || errorData.detail || errorMessage;
          console.error('API Error Details:', errorData);
        } catch {
          console.error('Raw Error Response:', errorText);
        }

        console.error('❌ Customer API Error:', {
          status: response.status,
          statusText: response.statusText,
          message: errorMessage,
          url: response.url,
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
        
        throw new Error(errorMessage);
      }

      const data = await response.json();
      console.log('✅ Customer API Response:', data);
      console.log('📊 Raw Response Data:', JSON.stringify(data, null, 2));

      // Handle different API response formats
      let customers: Customer[];

      if (data.data && Array.isArray(data.data)) {
        console.log('✅ Customers loaded from API');
        customers = data.data.map((customer: any) => ({
          id: customer.userId?.toString() || customer.customerId?.toString() || customer.id || '',
          name: customer.fullName || customer.name || '',
          email: customer.email || '',
          phone: customer.phone || '',
          address: customer.address || '',
          testDrives: customer.testDrives || [],
          orders: customer.orders || [],
          debt: customer.debt || 0,
          lastPurchaseDate: customer.lastPurchaseDate || '',
          totalSpent: customer.totalSpent || 0,
          companyName: customer.companyName || customer.company_name || null,
        }));
      } else if (Array.isArray(data)) {
        // Direct array response
        customers = data.map((customer: any) => ({
          id: customer.userId?.toString() || customer.customerId?.toString() || customer.id || '',
          name: customer.fullName || customer.name || '',
          email: customer.email || '',
          phone: customer.phone || '',
          address: customer.address || '',
          testDrives: customer.testDrives || [],
          orders: customer.orders || [],
          debt: customer.debt || 0,
          lastPurchaseDate: customer.lastPurchaseDate || '',
          totalSpent: customer.totalSpent || 0,
          companyName: customer.companyName || customer.company_name || null,
        }));
      } else if (data.success && data.data && Array.isArray(data.data)) {
        // Handle ApiResponse<List<CustomerDTO>> format from backend
        console.log('✅ Customers loaded from ApiResponse format');
        customers = data.data.map((customer: any) => ({
          id: customer.userId?.toString() || customer.customerId?.toString() || customer.id || '',
          name: customer.fullName || customer.name || '',
          email: customer.email || '',
          phone: customer.phone || '',
          address: customer.address || '',
          testDrives: customer.testDrives || [],
          orders: customer.orders || [],
          debt: customer.debt || 0,
          lastPurchaseDate: customer.lastPurchaseDate || '',
          totalSpent: customer.totalSpent || 0,
          companyName: customer.companyName || customer.company_name || null,
        }));
      } else {
        console.error('Unexpected API response format for customers');
        console.log('Response structure:', Object.keys(data));
        throw new Error('Định dạng phản hồi API không hợp lệ. Vui lòng thử lại sau.');
      }

      return { 
        success: true, 
        message: data.message || 'Lấy danh sách khách hàng thành công', 
        data: customers 
      };

    } catch (error) {
      console.error('❌ Failed to fetch customers:', error);
      
      // Log detailed error information
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('API call failed:', errorMessage);
      
      // Throw error instead of using mock data
      throw new Error(`Không thể lấy danh sách khách hàng: ${errorMessage}`);
    }
  }

  async getCustomerById(id: string): Promise<CustomerDetailResponse> {
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

      console.log('🔄 Fetching customer by ID from API...', id);
      console.log('📡 Request URL:', `/api/Customer/${id}`);
      console.log('📡 Request Headers:', headers);
      
      const response = await fetch(`/api/Customer/${id}`, {
        method: 'GET',
        headers,
      });

      console.log('📡 Customer Detail API Response Status:', response.status, response.statusText);
      console.log('📡 Response Headers:', Object.fromEntries(response.headers.entries()));

      if (!response.ok) {
        const errorText = await response.text();
        let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
        
        try {
          const errorData = JSON.parse(errorText);
          errorMessage = errorData.message || errorData.detail || errorMessage;
          console.error('API Error Details:', errorData);
        } catch {
          console.error('Raw Error Response:', errorText);
        }

        console.error('❌ Customer Detail API Error:', {
          status: response.status,
          statusText: response.statusText,
          message: errorMessage,
          url: response.url,
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
        } else if (response.status === 404) {
          console.error('Customer not found (404)');
          throw new Error('Không tìm thấy khách hàng với ID đã cho.');
        }
        
        throw new Error(errorMessage);
      }

      const data = await response.json();
      console.log('✅ Customer Detail API Response:', data);
      console.log('📊 Raw Detail Response Data:', JSON.stringify(data, null, 2));

      // Handle different API response formats
      let customer: Customer;

      if (data.data) {
        console.log('✅ Customer loaded from API');
        customer = {
          id: data.data.userId?.toString() || data.data.customerId?.toString() || data.data.id || id,
          name: data.data.fullName || data.data.name || '',
          email: data.data.email || '',
          phone: data.data.phone || '',
          address: data.data.address || '',
          testDrives: data.data.testDrives || [],
          orders: data.data.orders || [],
          debt: data.data.debt || 0,
          lastPurchaseDate: data.data.lastPurchaseDate || '',
          totalSpent: data.data.totalSpent || 0,
        };
      } else if (data.success && data.data) {
        // Handle ApiResponse<CustomerDTO> format from backend
        console.log('✅ Customer loaded from ApiResponse format');
        customer = {
          id: data.data.userId?.toString() || data.data.customerId?.toString() || data.data.id || id,
          name: data.data.fullName || data.data.name || '',
          email: data.data.email || '',
          phone: data.data.phone || '',
          address: data.data.address || '',
          testDrives: data.data.testDrives || [],
          orders: data.data.orders || [],
          debt: data.data.debt || 0,
          lastPurchaseDate: data.data.lastPurchaseDate || '',
          totalSpent: data.data.totalSpent || 0,
        };
      } else {
        // Direct customer object
        customer = {
          id: data.userId?.toString() || data.customerId?.toString() || data.id || id,
          name: data.fullName || data.name || '',
          email: data.email || '',
          phone: data.phone || '',
          address: data.address || '',
          testDrives: data.testDrives || [],
          orders: data.orders || [],
          debt: data.debt || 0,
          lastPurchaseDate: data.lastPurchaseDate || '',
          totalSpent: data.totalSpent || 0,
        };
      }

      return { 
        success: true, 
        message: data.message || 'Lấy thông tin khách hàng thành công', 
        data: customer 
      };

    } catch (error) {
      console.error('❌ Failed to fetch customer:', error);
      
      // Log detailed error information
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('API call failed:', errorMessage);
      
      // Throw error instead of using mock data
      throw new Error(`Không thể lấy thông tin khách hàng: ${errorMessage}`);
    }
  }

  async createCustomer(customerData: CreateCustomerRequest): Promise<CreateCustomerResponse> {
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

      console.log('🔄 Creating customer via API...', customerData);
      const response = await fetch('/api/Customer', {
        method: 'POST',
        headers,
        body: JSON.stringify(customerData),
      });

      console.log('📡 Create Customer API Response Status:', response.status, response.statusText);

      if (!response.ok) {
        const errorText = await response.text();
        let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
        
        try {
          const errorData = JSON.parse(errorText);
          errorMessage = errorData.message || errorData.detail || errorMessage;
          console.error('API Error Details:', errorData);
        } catch {
          console.error('Raw Error Response:', errorText);
        }

        console.error('❌ Create Customer API Error:', {
          status: response.status,
          statusText: response.statusText,
          message: errorMessage,
          url: response.url,
          headers: Object.fromEntries(response.headers.entries())
        });

        if (response.status === 401) {
          console.warn('Authentication failed (401), cannot create customer');
          return { 
            success: false, 
            message: 'Yêu cầu xác thực. Vui lòng đăng nhập với tài khoản hợp lệ để tạo khách hàng.' 
          };
        } else if (response.status === 403) {
          console.warn('Authorization failed (403), cannot create customer');
          return { 
            success: false, 
            message: 'Truy cập bị từ chối. Bạn không có quyền tạo khách hàng.' 
          };
        } else if (response.status === 400) {
          return { 
            success: false, 
            message: `Dữ liệu không hợp lệ: ${errorMessage}` 
          };
        }
        
        return { 
          success: false, 
          message: errorMessage 
        };
      }

      const data = await response.json();
      console.log('✅ Create Customer API Response:', data);

      return { 
        success: true, 
        message: data.message || 'Tạo khách hàng thành công', 
        data: data.data || data
      };

    } catch (error) {
      console.error('❌ Failed to create customer:', error);
      
      return { 
        success: false, 
        message: `Tạo khách hàng thất bại: ${error instanceof Error ? error.message : 'Lỗi không xác định'}`
      };
    }
  }

  async updateCustomer(id: string, customerData: UpdateCustomerRequest): Promise<UpdateCustomerResponse> {
    try {
      const token = localStorage.getItem('token');
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      };

      if (token && (authService.isTokenValid(token) || token.startsWith('mock-token-'))) {
        headers['Authorization'] = `Bearer ${token}`;
        console.log('🔐 Using token for update customer request');
      } else {
        console.warn('No valid token found in localStorage');
      }

      console.log('🔄 Updating customer via API...', id);
      console.log('📡 Request URL:', `/api/Customer/${id}`);
      console.log('📡 Request Headers:', headers);
      console.log('📡 Request Body:', customerData);
      
      const response = await fetch(`/api/Customer/${id}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify(customerData),
      });

      console.log('📡 Update Customer API Response Status:', response.status, response.statusText);
      console.log('📡 Response Headers:', Object.fromEntries(response.headers.entries()));

      if (!response.ok) {
        const errorText = await response.text();
        let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
        
        try {
          const errorData = JSON.parse(errorText);
          errorMessage = errorData.message || errorData.detail || errorMessage;
        } catch {
          // Keep the default error message if JSON parsing fails
        }

        console.error('❌ Update Customer API Error:', {
          status: response.status,
          statusText: response.statusText,
          message: errorMessage,
          details: errorText,
          url: `/api/Customer/${id}`,
          headers: Object.fromEntries(response.headers.entries())
        });

        // Handle specific error cases
        if (response.status === 401) {
          errorMessage = 'Yêu cầu xác thực. Vui lòng đăng nhập với tài khoản hợp lệ.';
        } else if (response.status === 403) {
          errorMessage = 'Truy cập bị từ chối. Bạn không có quyền cập nhật khách hàng.';
        } else if (response.status === 400) {
          errorMessage = `Yêu cầu không hợp lệ: ${errorMessage}`;
        } else if (response.status === 404) {
          errorMessage = 'Không tìm thấy khách hàng.';
        }
        
        return { 
          success: false, 
          message: errorMessage 
        };
      }

      const data = await response.json();
      console.log('✅ Update Customer API Response:', data);
      console.log('📊 Raw Update Response Data:', JSON.stringify(data, null, 2));

      return { 
        success: true, 
        message: data.message || 'Cập nhật khách hàng thành công', 
        data: data.data || data 
      };

    } catch (error) {
      console.error('❌ Error updating customer:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      
      return { 
        success: false, 
        message: `Cập nhật khách hàng thất bại: ${errorMessage}` 
      };
    }
  }

  async deleteCustomer(id: string): Promise<DeleteCustomerResponse> {
    try {
      const token = localStorage.getItem('token');
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      };

      if (token && (authService.isTokenValid(token) || token.startsWith('mock-token-'))) {
        headers['Authorization'] = `Bearer ${token}`;
        console.log('🔐 Using token for delete customer request');
      } else {
        console.warn('No valid token found in localStorage');
      }

      console.log('🗑️ Deleting customer via API...', id);
      console.log('📡 Request URL:', `/api/Customer/${id}`);
      console.log('📡 Request Headers:', headers);
      
      const response = await fetch(`/api/Customer/${id}`, {
        method: 'DELETE',
        headers,
      });

      console.log('📡 Delete Customer API Response Status:', response.status, response.statusText);
      console.log('📡 Response Headers:', Object.fromEntries(response.headers.entries()));

      if (!response.ok) {
        const errorText = await response.text();
        let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
        
        try {
          const errorData = JSON.parse(errorText);
          errorMessage = errorData.message || errorData.detail || errorMessage;
        } catch {
          // Keep the default error message if JSON parsing fails
        }

        console.error('❌ Delete Customer API Error:', {
          status: response.status,
          statusText: response.statusText,
          message: errorMessage,
          details: errorText,
          url: `/api/Customer/${id}`,
          headers: Object.fromEntries(response.headers.entries())
        });

        // Handle specific error cases
        if (response.status === 401) {
          errorMessage = 'Yêu cầu xác thực. Vui lòng đăng nhập với tài khoản hợp lệ.';
        } else if (response.status === 403) {
          errorMessage = 'Truy cập bị từ chối. Bạn không có quyền xóa khách hàng.';
        } else if (response.status === 400) {
          errorMessage = `Yêu cầu không hợp lệ: ${errorMessage}`;
        } else if (response.status === 404) {
          errorMessage = 'Không tìm thấy khách hàng.';
        }
        
        return { 
          success: false, 
          message: errorMessage 
        };
      }

      const data = await response.json();
      console.log('✅ Delete Customer API Response:', data);
      console.log('📊 Raw Delete Response Data:', JSON.stringify(data, null, 2));

      return { 
        success: true, 
        message: data.message || 'Xóa khách hàng thành công', 
        data: data.data || data 
      };

    } catch (error) {
      console.error('❌ Error deleting customer:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      
      return { 
        success: false, 
        message: `Xóa khách hàng thất bại: ${errorMessage}` 
      };
    }
  }
}

export const customerService = new CustomerService();