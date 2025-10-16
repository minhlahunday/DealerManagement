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

      const data = await response.json();
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
            let extractedRole = payload['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] || payload.role || role;
            
            // Map evm_staff to dealer for API compatibility
            if (extractedRole === 'evm_staff') {
              extractedRole = 'dealer';
            }
            
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
        
        // Map evm_staff to dealer for API compatibility
        let finalRole = role;
        if (role === 'evm_staff') {
          finalRole = 'dealer';
        }
        
        // Use extracted info or fallback
        const user = userInfo || {
          id: '1',
          email: credentials.email,
          name: credentials.email.split('@')[0],
          role: finalRole
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
            role = 'dealer'; // Map evm_staff to dealer for API access
          } else if (credentials.email.includes('customer')) {
            role = 'customer';
          }
        }
        
        // Map evm_staff to dealer for API compatibility
        if (role === 'evm_staff') {
          role = 'dealer';
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
      let role = payload['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] || payload.role;
      
      // Map evm_staff to dealer for API compatibility
      if (role === 'evm_staff') {
        role = 'dealer';
      }
      
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
  }
};
