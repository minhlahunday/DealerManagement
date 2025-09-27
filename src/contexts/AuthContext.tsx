import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';
import { authService, LoginResponse } from '../services/authService';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
  checkToken: () => { token: string | null; user: string | null };
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Role mapping function to handle backend role conversion
const mapBackendRole = (backendRole: string): User['role'] => {
  const roleMap: Record<string, User['role']> = {
    'admin': 'admin',
    'dealer': 'dealer', 
    'evm_staff': 'evm_staff',
    'customer': 'customer',
    // Legacy mapping for backward compatibility
    'dealer_staff': 'dealer',
    'dealer_manager': 'dealer'
  };
  
  return roleMap[backendRole] || 'customer';
};

// Mock user data - matching database roles
const mockUsers: (User & { password: string })[] = [
  {
    id: '1',
    email: 'admin@gmail.com',
    password: 'hash123',
    name: 'Admin User',
    role: 'admin'
  },
  {
    id: '2',
    email: 'dealer@gmail.com',
    password: 'hash456',
    name: 'Dealer User',
    role: 'dealer'
  },
  {
    id: '3',
    email: 'staff@gmail.com',
    password: 'hash123',
    name: 'EVM Staff User',
    role: 'evm_staff'
  },
  {
    id: '4',
    email: 'customer@gmail.com',
    password: 'hash456',
    name: 'Customer User',
    role: 'customer'
  }
];

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    const savedToken = localStorage.getItem('token');
    
    if (savedUser && savedToken) {
      // Validate token before setting user
      if (authService.isTokenValid(savedToken) || savedToken.startsWith('mock-token-')) {
        console.log('✅ Valid token found, setting user');
        setUser(JSON.parse(savedUser));
      } else {
        console.log('❌ Invalid/expired token, clearing storage');
        localStorage.removeItem('user');
        localStorage.removeItem('token');
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    
    try {
      // First try API login
      const response: LoginResponse = await authService.login({ email, password });
      console.log('API Response:', response);
      
      // Convert API response to User type with role mapping
      const user: User = {
        id: response.user.id,
        email: response.user.email,
        name: response.user.name,
        role: mapBackendRole(response.user.role),
      };
      
      console.log('Converted user:', user);
      console.log('API Token:', response.token);
      
      // Validate the received token
      if (authService.isTokenValid(response.token)) {
        console.log('✅ Valid JWT token received from API');
        const tokenInfo = authService.getTokenInfo(response.token);
        if (tokenInfo) {
          console.log('Token info:', tokenInfo);
        }
      } else {
        console.warn('⚠️ Invalid token received from API');
      }
      
      setUser(user);
      localStorage.setItem('user', JSON.stringify(user));
      localStorage.setItem('token', response.token);
      console.log('Token saved to localStorage:', response.token);
      setIsLoading(false);
      return true;
    } catch (error) {
      console.error('API Login failed, trying fallback:', error);
      
      // Fallback to mock data for testing
      const foundUser = mockUsers.find(u => u.email === email && u.password === password);
      
      if (foundUser) {
        const { password: _password, ...userWithoutPassword } = foundUser;
        // Suppress unused variable warning
        void _password;
        const mockToken = 'mock-token-' + Date.now();
        console.log('Fallback login successful:', userWithoutPassword);
        console.log('Mock Token:', mockToken);
        setUser(userWithoutPassword);
        localStorage.setItem('user', JSON.stringify(userWithoutPassword));
        localStorage.setItem('token', mockToken);
        console.log('Mock token saved to localStorage:', mockToken);
        setIsLoading(false);
        return true;
      }
      
      console.error('No matching user found in mock data');
      console.log('Available mock users:', mockUsers.map(u => ({ email: u.email, password: u.password })));
      setIsLoading(false);
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
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

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading, checkToken }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};