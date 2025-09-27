import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';
import { authService, LoginResponse } from '../services/authService';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Mock user data - matching database
const mockUsers: (User & { password: string })[] = [
  {
    id: '1',
    email: 'admin@gmail.com', // Note: missing 'a' in database
    password: 'hash123',
    name: 'admin One',
    role: 'admin'
  },
  {
    id: '2',
    email: 'customer1@gmail.com',
    password: 'hash456',
    name: 'dealer One',
    role: 'dealer_staff'
  },
  {
    id: '3',
    email: 'staff@gmail.com',
    password: 'hash123',
    name: 'staff One',
    role: 'evm_staff'
  },
  {
    id: '4',
    email: 'customer@gmail.com',
    password: 'hash456',
    name: 'customer One',
    role: 'dealer_staff'
  }
];

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    
    try {
      // First try API login
      const response: LoginResponse = await authService.login({ email, password });
      console.log('API Response:', response);
      
      // Convert API response to User type
      const user: User = {
        id: response.user.id,
        email: response.user.email,
        name: response.user.name,
        role: response.user.role as User['role'],
      };
      
      console.log('Converted user:', user);
      setUser(user);
      localStorage.setItem('user', JSON.stringify(user));
      localStorage.setItem('token', response.token);
      setIsLoading(false);
      return true;
    } catch (error) {
      console.error('API Login failed, trying fallback:', error);
      
      // Fallback to mock data for testing
      const foundUser = mockUsers.find(u => u.email === email && u.password === password);
      
      if (foundUser) {
        const { password: _, ...userWithoutPassword } = foundUser;
        console.log('Fallback login successful:', userWithoutPassword);
        setUser(userWithoutPassword);
        localStorage.setItem('user', JSON.stringify(userWithoutPassword));
        localStorage.setItem('token', 'mock-token-' + Date.now());
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

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading }}>
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