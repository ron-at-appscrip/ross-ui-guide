
import { User, AuthResult } from '@/types/auth';

export const authService = {
  async login(email: string, password: string, rememberMe = false): Promise<User> {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const userData: User = {
      id: '1',
      email,
      name: email.split('@')[0],
      title: 'Attorney at Law',
      provider: 'email',
      emailVerified: true,
      hasCompletedWizard: true,
    };

    const token = 'mock-jwt-token-' + Date.now();
    
    const storage = rememberMe ? localStorage : sessionStorage;
    storage.setItem('authToken', token);
    storage.setItem('userData', JSON.stringify(userData));
    
    return userData;
  },

  async loginWithGoogle(): Promise<User> {
    // Simulate Google OAuth
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const userData: User = {
      id: 'google-' + Date.now(),
      email: 'user@gmail.com',
      name: 'Google User',
      title: 'Senior Associate',
      avatar: 'https://via.placeholder.com/40',
      provider: 'google',
      emailVerified: true,
      hasCompletedWizard: true,
    };

    const token = 'google-jwt-token-' + Date.now();
    
    localStorage.setItem('authToken', token);
    localStorage.setItem('userData', JSON.stringify(userData));
    
    return userData;
  },

  async loginWithApple(): Promise<User> {
    // Simulate Apple OAuth
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const userData: User = {
      id: 'apple-' + Date.now(),
      email: 'user@icloud.com',
      name: 'Apple User',
      title: 'Partner',
      avatar: 'https://via.placeholder.com/40',
      provider: 'apple',
      emailVerified: true,
      hasCompletedWizard: true,
    };

    const token = 'apple-jwt-token-' + Date.now();
    
    localStorage.setItem('authToken', token);
    localStorage.setItem('userData', JSON.stringify(userData));
    
    return userData;
  },

  async register(name: string, email: string, password: string): Promise<{ user: User; result: AuthResult }> {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const userData: User = {
      id: 'new-user-' + Date.now(),
      email,
      name,
      title: 'Associate',
      provider: 'email',
      emailVerified: false,
      hasCompletedWizard: false,
    };

    const token = 'mock-jwt-token-' + Date.now();
    
    localStorage.setItem('authToken', token);
    localStorage.setItem('userData', JSON.stringify(userData));

    return { 
      user: userData, 
      result: { shouldRedirectToWizard: true } 
    };
  },

  async registerWithGoogle(): Promise<{ user: User; result: AuthResult }> {
    // Simulate Google OAuth
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const userData: User = {
      id: 'google-new-' + Date.now(),
      email: 'newuser@gmail.com',
      name: 'New Google User',
      title: 'Associate',
      avatar: 'https://via.placeholder.com/40',
      provider: 'google',
      emailVerified: true,
      hasCompletedWizard: false,
    };

    const token = 'google-jwt-token-' + Date.now();
    
    localStorage.setItem('authToken', token);
    localStorage.setItem('userData', JSON.stringify(userData));

    return { 
      user: userData, 
      result: { shouldRedirectToWizard: true } 
    };
  },

  async registerWithApple(): Promise<{ user: User; result: AuthResult }> {
    // Simulate Apple OAuth
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const userData: User = {
      id: 'apple-new-' + Date.now(),
      email: 'newuser@icloud.com',
      name: 'New Apple User',
      title: 'Associate',
      avatar: 'https://via.placeholder.com/40',
      provider: 'apple',
      emailVerified: true,
      hasCompletedWizard: false,
    };

    const token = 'apple-jwt-token-' + Date.now();
    
    localStorage.setItem('authToken', token);
    localStorage.setItem('userData', JSON.stringify(userData));

    return { 
      user: userData, 
      result: { shouldRedirectToWizard: true } 
    };
  },

  async forgotPassword(email: string): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 1000));
    console.log('Password reset email sent to:', email);
  },

  async resetPassword(token: string, newPassword: string): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 1000));
    console.log('Password reset with token:', token);
  },

  async resendVerification(email: string): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 1000));
    console.log('Verification email sent to:', email);
  },

  logout(): void {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userData');
    sessionStorage.removeItem('authToken');
    sessionStorage.removeItem('userData');
  }
};
