import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// Simple user type
interface User {
  id: string;
  email: string;
  name: string;
  hasCompletedWizard?: boolean;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (firstName: string, lastName: string, email: string, password: string) => Promise<{ shouldRedirectToWizard: boolean }>;
  logout: () => Promise<void>;
  forgotPassword: (email: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  registerWithGoogle: () => Promise<void>;
  updateUser: (updates: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

const STORAGE_KEY = 'simple-auth-user';

export const SimpleAuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load user from localStorage on mount
  useEffect(() => {
    try {
      const storedUser = localStorage.getItem(STORAGE_KEY);
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    } catch (error) {
      console.error('Failed to load user from storage:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Save user to localStorage whenever it changes
  useEffect(() => {
    if (user) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, [user]);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      // Simple login - just create a user object
      // No API calls, no validation
      const userData: User = {
        id: `user-${Date.now()}`,
        email,
        name: email.split('@')[0],
        hasCompletedWizard: false,
      };
      
      setUser(userData);
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (firstName: string, lastName: string, email: string, password: string) => {
    setIsLoading(true);
    try {
      // Simple registration - just create a user object
      const userData: User = {
        id: `user-${Date.now()}`,
        email,
        name: `${firstName} ${lastName}`,
        hasCompletedWizard: false,
      };
      
      setUser(userData);
      
      // Store user data for wizard
      localStorage.setItem('pending-user-profile', JSON.stringify({
        id: userData.id,
        email,
        firstName,
        lastName,
        fullName: `${firstName} ${lastName}`
      }));
      
      return { shouldRedirectToWizard: true };
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      setUser(null);
      localStorage.removeItem('pending-user-profile');
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  };

  const forgotPassword = async (email: string) => {
    // Simple implementation - just show a message
    console.log('Password reset requested for:', email);
    // In a real app, you'd show a success message
  };

  const loginWithGoogle = async () => {
    // Simple implementation - just create a mock user
    const userData: User = {
      id: `user-google-${Date.now()}`,
      email: 'user@gmail.com',
      name: 'Google User',
      hasCompletedWizard: false,
    };
    setUser(userData);
  };

  const registerWithGoogle = async () => {
    // Simple implementation - just create a mock user
    const userData: User = {
      id: `user-google-${Date.now()}`,
      email: 'user@gmail.com',
      name: 'Google User',
      hasCompletedWizard: false,
    };
    setUser(userData);
  };

  const updateUser = (updates: Partial<User>) => {
    setUser(prev => prev ? { ...prev, ...updates } : null);
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      isLoading, 
      login, 
      register, 
      logout, 
      forgotPassword, 
      loginWithGoogle, 
      registerWithGoogle, 
      updateUser 
    }}>
      {children}
    </AuthContext.Provider>
  );
};
