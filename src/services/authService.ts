export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: {
    id: string;
    email: string;
    name: string;
    role: string;
  };
}

export interface RegisterRequest {
  full_name: string;
  email: string;
  phone: string;
  password: string;
  role_name: string;
  dealership_id?: string;
  manufacturer_id?: string;
}

export interface RegisterResponse {
  success: boolean;
  message: string;
  data?: unknown;
}

export interface User {
  userId: number;
  username: string;
  email: string;
  password: string | null;
  roleId: number;
  fullName: string;
  phone: string;
  address: string;
  companyName: string | null;
}

export interface UserManagementResponse {
  data: User[];
  status: number;
  message: string;
}

export const authService = {
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    try {
      console.log('Sending login request:', credentials);
      
      const response = await fetch('/api/Auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(credentials),
      });
      
      console.log('Response status:', response.status);
      console.log('Response headers:', Object.fromEntries(response.headers.entries()));

      if (!response.ok) {
        let errorMessage = `HTTP error! status: ${response.status}`;
        
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorData.error || errorMessage;
        } catch {
          // If response is not JSON, use status text
          errorMessage = response.statusText || errorMessage;
        }
        
        // Handle specific status codes
        if (response.status === 401) {
          errorMessage = 'Email hoặc mật khẩu không đúng';
        } else if (response.status === 404) {
          errorMessage = 'API endpoint không tìm thấy - Backend có thể không chạy';
        } else if (response.status >= 500) {
          errorMessage = 'Lỗi server. Vui lòng thử lại sau';
        } else if (response.status === 0) {
          errorMessage = 'Không thể kết nối đến backend - Backend có thể không chạy';
        }
        
        throw new Error(errorMessage);
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const data: any = await response.json();
      console.log('Raw API response:', data);
      
      // Handle different response formats
      if (data.token && data.user) {
        return data; // Standard format
      } else if (data.data && data.data.token && data.data.user) {
        return data.data; // Wrapped format with token and user
      } else if (data.data && data.data.token && data.data.role) {
        // Backend format: { data: { token: "...", role: "dealer" }, status: 200, message: "..." }
        console.log('✅ Backend format detected with token and role');
        const role = data.data.role;
        const token = data.data.token;
        
        // Extract user info from JWT token if possible
        let userInfo = null;
        try {
          const parts = token.split('.');
          if (parts.length === 3) {
            const payload = JSON.parse(atob(parts[1]));
            const extractedRole = payload['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] || payload.role || role;
            
            userInfo = {
              id: payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'] || payload.sub || '1',
              email: payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress'] || payload.email || credentials.email,
              name: payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name'] || payload.name || credentials.email.split('@')[0],
              role: extractedRole
            };
          }
        } catch {
          console.warn('Could not extract user info from JWT, using fallback');
        }
        
        // Use extracted info or fallback
        const user = userInfo || {
          id: '1',
          email: credentials.email,
          name: credentials.email.split('@')[0],
          role: role
        };
        
        return {
          token: token,
          user: user
        };
      } else if (data.data && Object.keys(data.data).length === 0) {
        // Empty data object - API success but no user data
        console.log('API returned success with empty data, but no token provided');
        console.log('This indicates backend authentication issue');
        
        // Throw error instead of creating mock token
        throw new Error('Backend trả về dữ liệu rỗng. Vui lòng kiểm tra kết nối backend.');
      } else {
        // Fallback format
        // Determine role based on email if not provided
        let role = data.role || 'customer';
        if (!data.role) {
          if (credentials.email.includes('admin')) {
            role = 'admin';
          } else if (credentials.email.includes('dealer')) {
            role = 'dealer';
          } else if (credentials.email.includes('staff')) {
            role = 'evm_staff';
          } else if (credentials.email.includes('customer')) {
            role = 'customer';
          }
        }
        
        // Check if we have a real token from backend
        const realToken = data.accessToken || data.jwt || data.token;
        if (!realToken) {
          console.error('No valid token received from backend');
          throw new Error('Backend không trả về token hợp lệ. Vui lòng kiểm tra kết nối backend.');
        }
        
        return {
          token: realToken,
          user: {
            id: data.userId || data.id || '1',
            email: data.email || credentials.email,
            name: data.fullName || data.name || credentials.email.split('@')[0],
            role: role
          }
        };
      }
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  },

  // JWT token validation utility
  isTokenValid(token: string): boolean {
    if (!token || token.startsWith('mock-token-') || token === 'fallback-token') {
      console.warn('Mock token detected, not valid for backend API calls');
      return false;
    }
    // Don't allow api-token- anymore - these are mock tokens
    if (token.startsWith('api-token-')) {
      console.warn('API mock token detected, not valid for backend API calls');
      return false;
    }
    try {
      const parts = token.split('.');
      if (parts.length !== 3) { 
        console.warn('Invalid JWT format');
        return false; 
      }
      const payload = JSON.parse(atob(parts[1]));
      const now = Math.floor(Date.now() / 1000);
      if (payload.exp && payload.exp < now) {
        console.warn('Token expired');
        return false;
      }
      return true;
    } catch (error) {
      console.error('Token validation error:', error);
      return false;
    }
  },

  // JWT token info extraction utility
  getTokenInfo(token: string) {
    if (!token || token.startsWith('mock-token-')) {
      return null;
    }
    // Don't handle api-token- anymore - these are mock tokens
    if (token.startsWith('api-token-')) {
      console.warn('API mock token detected, cannot extract info');
      return null;
    }
    try {
      const parts = token.split('.');
      if (parts.length !== 3) { return null; }
      const payload = JSON.parse(atob(parts[1]));
      const role = payload['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] || payload.role;
      
      return {
        userId: payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'] || payload.sub,
        email: payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress'] || payload.email,
        role: role,
        exp: payload.exp,
        iat: payload.iat
      };
    } catch (error) {
      console.error('Token info extraction error:', error);
      return null;
    }
  },

  async registerStaff(registerData: RegisterRequest): Promise<RegisterResponse> {
    try {
      const token = localStorage.getItem('token');
      
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      };

      if (token && authService.isTokenValid(token)) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch('/api/Auth/register', {
        method: 'POST',
        headers,
        body: JSON.stringify(registerData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        return {
          success: false,
          message: errorData.message || `HTTP error! status: ${response.status}`
        };
      }

      const data = await response.json();
      return {
        success: true,
        message: data.message || 'Đăng ký thành công',
        data: data.data
      };
    } catch (error: unknown) {
      console.error('Register error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Có lỗi xảy ra khi đăng ký';
      return {
        success: false,
        message: errorMessage
      };
    }
  },

  async getUserManagement(): Promise<UserManagementResponse> {
    try {
      const token = localStorage.getItem('token');
      
      const headers: Record<string, string> = {
        'Accept': 'application/json',
      };

      if (token && authService.isTokenValid(token)) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      console.log('🔄 Fetching user management data...');
      const response = await fetch('/api/UserManagement', {
        method: 'GET',
        headers,
      });

      console.log('📡 User Management API Response Status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ User Management API Error:', errorText);
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result: UserManagementResponse = await response.json();
      console.log('✅ User management data fetched successfully:', result);

      return result;
    } catch (error) {
      console.error('❌ Error fetching user management:', error);
      throw error;
    }
  },

  async createUser(userData: {
    userId: number;
    username: string;
    email: string;
    password: string;
    roleId: number;
    fullName: string;
    phone: string;
    address: string;
    companyName: string;
  }): Promise<{ success: boolean; message: string; data?: unknown }> {
    try {
      const token = localStorage.getItem('token');
      
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      };

      if (token && authService.isTokenValid(token)) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      console.log('🔄 Creating new user...');
      const response = await fetch('/api/UserManagement', {
        method: 'POST',
        headers,
        body: JSON.stringify(userData),
      });

      console.log('📡 Create User API Response Status:', response.status);

      if (!response.ok) {
        const errorData = await response.json();
        return {
          success: false,
          message: errorData.message || `HTTP error! status: ${response.status}`
        };
      }

      const data = await response.json();
      return {
        success: true,
        message: data.message || 'Tạo người dùng thành công',
        data: data.data
      };
    } catch (error: unknown) {
      console.error('❌ Error creating user:', error);
      const errorMessage = error instanceof Error ? error.message : 'Có lỗi xảy ra khi tạo người dùng';
      return {
        success: false,
        message: errorMessage
      };
    }
  },

  async getUserById(id: number): Promise<User> {
    try {
      const token = localStorage.getItem('token');
      
      const headers: Record<string, string> = {
        'Accept': 'application/json',
      };

      if (token && authService.isTokenValid(token)) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(`/api/UserManagement/${id}`, {
        method: 'GET',
        headers,
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      return result.data;
    } catch (error) {
      console.error('❌ Error fetching user:', error);
      throw error;
    }
  },

  async updateUser(id: number, userData: {
    userId: number;
    username: string;
    email: string;
    password: string;
    roleId: number;
    fullName: string;
    phone: string;
    address: string;
    companyName: string;
  }): Promise<{ success: boolean; message: string; data?: unknown }> {
    try {
      const token = localStorage.getItem('token');
      
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      };

      if (token && authService.isTokenValid(token)) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(`/api/UserManagement/${id}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify(userData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        return {
          success: false,
          message: errorData.message || `HTTP error! status: ${response.status}`
        };
      }

      const data = await response.json();
      return {
        success: true,
        message: data.message || 'Cập nhật người dùng thành công',
        data: data.data
      };
    } catch (error: unknown) {
      console.error('❌ Error updating user:', error);
      const errorMessage = error instanceof Error ? error.message : 'Có lỗi xảy ra khi cập nhật người dùng';
      return {
        success: false,
        message: errorMessage
      };
    }
  },

  async deleteUser(id: number): Promise<{ success: boolean; message: string; data?: unknown }> {
    try {
      const token = localStorage.getItem('token');
      
      const headers: Record<string, string> = {
        'Accept': 'application/json',
      };

      if (token && authService.isTokenValid(token)) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(`/api/UserManagement/${id}`, {
        method: 'DELETE',
        headers,
      });

      if (!response.ok) {
        const errorData = await response.json();
        return {
          success: false,
          message: errorData.message || `HTTP error! status: ${response.status}`
        };
      }

      const data = await response.json();
      return {
        success: true,
        message: data.message || 'Xóa người dùng thành công',
        data: data.data
      };
    } catch (error: unknown) {
      console.error('❌ Error deleting user:', error);
      const errorMessage = error instanceof Error ? error.message : 'Có lỗi xảy ra khi xóa người dùng';
      return {
        success: false,
        message: errorMessage
      };
    }
  }
};
