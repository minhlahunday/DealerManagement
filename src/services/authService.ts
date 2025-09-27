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
          errorMessage = 'API endpoint không tìm thấy';
        } else if (response.status >= 500) {
          errorMessage = 'Lỗi server. Vui lòng thử lại sau';
        }
        
        throw new Error(errorMessage);
      }

      const data = await response.json();
      console.log('Raw API response:', data);
      
      // Handle different response formats
      if (data.token && data.user) {
        return data; // Standard format
      } else if (data.data) {
        return data.data; // Wrapped format
      } else {
        // Fallback format
        return {
          token: data.accessToken || data.jwt || 'mock-token',
          user: {
            id: data.userId || data.id || '1',
            email: data.email || credentials.email,
            name: data.fullName || data.name || 'User',
            role: data.role || 'user'
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
      return false;
    }
    try {
      const parts = token.split('.');
      if (parts.length !== 3) { return false; }
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
    try {
      const parts = token.split('.');
      if (parts.length !== 3) { return null; }
      const payload = JSON.parse(atob(parts[1]));
      return {
        userId: payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'] || payload.sub,
        email: payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress'] || payload.email,
        role: payload['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] || payload.role,
        exp: payload.exp,
        iat: payload.iat
      };
    } catch (error) {
      console.error('Token info extraction error:', error);
      return null;
    }
  }
};
