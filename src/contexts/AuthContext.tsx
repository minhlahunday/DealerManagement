import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';
import { authService } from '../services/authService';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
  checkToken: () => { token: string | null; user: string | null };
  clearInvalidToken: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Mock users for fallback
const mockUsers = [
  {
    id: '1',
    email: 'admin@vinfast.com',
    password: 'admin123',
    name: 'Admin',
    role: 'admin' as const
  },
  {
    id: '2',
    email: 'dealer1@gmail.com',
    password: '123456',
    name: 'Dealer 1',
    role: 'dealer' as const
  },
  {
    id: '3',
    email: 'staff1@gmail.com',
    password: 'staff123',
    name: 'Staff 1',
    role: 'evm_staff' as const
  }
];

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Check for existing auth data on mount
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    if (token && userData) {
      try {
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);
        console.log('User restored from localStorage:', parsedUser);
      } catch (error) {
        console.error('Error parsing user data from localStorage:', error);
        localStorage.removeItem('user');
        localStorage.removeItem('token');
      }
    }
  }, []);

  const testVehicleAPI = async (token: string) => {
    try {
      console.log('🚗 Testing Vehicle API...');
      const response = await fetch('/api/Vehicle', {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        console.log('✅ Vehicle API SUCCESS!');
        console.log('🚗 Vehicle count:', data.data?.length || 0);
        
        if (data.data && data.data.length > 0) {
          const vehicle = data.data[0];
          console.log('📸 First vehicle:', vehicle.model);
          console.log('💰 Price:', vehicle.price);
          console.log('🖼️ Images:', {
            image1: vehicle.image1 ? '✅' : '❌',
            image2: vehicle.image2 ? '✅' : '❌', 
            image3: vehicle.image3 ? '✅' : '❌'
          });
        }
      } else {
        console.log('❌ Vehicle API failed:', response.status, response.statusText);
      }
    } catch (error) {
      console.log('🚨 Vehicle API error:', error);
    }
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    console.log('=== LOGIN ATTEMPT ===');
    console.log('Email:', email);
    console.log('Password:', password ? '***' : 'empty');
    
    try {
      // Try API login first
      console.log('🔄 Attempting API login...');
      const response = await authService.login({ email, password });
      console.log('API Response:', response);
      
      if (response.token) {
        let user: User;
        
        // Handle different response formats
        if (response.user && Object.keys(response.user).length > 0) {
          // API returned user data
          user = {
            ...response.user,
            role: response.user.role as 'admin' | 'dealer' | 'evm_staff' | 'customer'
          };
          console.log('✅ User data from API:', user);
        } else {
          // API returned empty user data, infer from email
          console.log('⚠️ Empty user data from API, inferring from email...');
          const inferredRole = email.includes('admin') ? 'admin' as const : 
                              email.includes('dealer') ? 'dealer' as const : 'evm_staff' as const;
          
          user = {
            id: '1',
            email: email,
            name: email.split('@')[0],
            role: inferredRole
          };
          console.log('🔍 Inferred user data:', user);
        }
        
        // Validate token format
        if (response.token && response.token.trim() !== '') {
          console.log('✅ Valid token received from API');
        } else {
          console.warn('⚠️ Invalid token received from API');
        }
        
        setUser(user);
        localStorage.setItem('user', JSON.stringify(user));
        localStorage.setItem('token', response.token);
        console.log('Token saved to localStorage:', response.token);
        
        // Test Vehicle API ngay sau khi đăng nhập thành công
        console.log('🧪 Testing Vehicle API với token mới...');
        testVehicleAPI(response.token);
        
        setIsLoading(false);
        return true;
      } else {
        console.warn('⚠️ Invalid token received from API');
        setIsLoading(false);
        return false;
      }
    } catch (error) {
      console.error('API Login failed:', error);
      console.log('Backend có thể không chạy hoặc không trả về token hợp lệ');
      
      // Don't fallback to mock data - require real backend connection
      console.error('❌ Backend authentication required. Cannot login without valid backend connection.');
      console.log('💡 Please ensure backend is running on https://localhost:7216');
      
      setIsLoading(false);
      return false;
    }
  };

  const logout = () => {
    console.log('=== LOGOUT STARTED ===');
    console.log('Current user:', user);
    
    setUser(null);
    
    // Clear all auth-related data from localStorage
    const keysToRemove = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && (
        key.includes('auth') || 
        key.includes('token') || 
        key.includes('user') ||
        key === 'token' ||
        key === 'user' ||
        key === 'userRole'
      )) {
        keysToRemove.push(key);
      }
    }
    
    keysToRemove.forEach(key => {
      localStorage.removeItem(key);
      console.log(`Removed from localStorage: ${key}`);
    });
    
    console.log('All authentication data cleared from localStorage');
    console.log('=== LOGOUT COMPLETE ===');
  };

  const checkToken = () => {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    console.log('=== TOKEN CHECK ===');
    console.log('Token in localStorage:', token);
    console.log('User in localStorage:', user);
    console.log('Current user state:', user);
    console.log('==================');
    return { token, user };
  };

  const clearInvalidToken = () => {
    console.log('=== CLEARING INVALID TOKEN ===');
    const token = localStorage.getItem('token');
    if (token && (token.startsWith('mock-token-') || token.startsWith('api-token-'))) {
      console.log('Clearing invalid mock token:', token);
      setUser(null);
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      console.log('Invalid token cleared. Please login again.');
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading, checkToken, clearInvalidToken }}>
      {children}
    </AuthContext.Provider>
  );
};
