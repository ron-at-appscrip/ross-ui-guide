
import { useState } from 'react';
import { User, AuthResult } from '@/types/auth';
import { authService } from '@/services/authService';

export const useAuthOperations = (
  setUser: (user: User | null) => void,
  setIsLoading: (loading: boolean) => void
) => {
  const login = async (email: string, password: string, rememberMe = false) => {
    setIsLoading(true);
    try {
      const userData = await authService.login(email, password, rememberMe);
      setUser(userData);
    } catch (error) {
      throw new Error('Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  const loginWithGoogle = async () => {
    setIsLoading(true);
    try {
      const userData = await authService.loginWithGoogle();
      setUser(userData);
    } catch (error) {
      throw new Error('Google login failed');
    } finally {
      setIsLoading(false);
    }
  };

  const loginWithApple = async () => {
    setIsLoading(true);
    try {
      const userData = await authService.loginWithApple();
      setUser(userData);
    } catch (error) {
      throw new Error('Apple login failed');
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (name: string, email: string, password: string): Promise<AuthResult> => {
    setIsLoading(true);
    try {
      const { user: userData, result } = await authService.register(name, email, password);
      setUser(userData);
      return result;
    } catch (error) {
      throw new Error('Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  const registerWithGoogle = async (): Promise<AuthResult> => {
    setIsLoading(true);
    try {
      const { user: userData, result } = await authService.registerWithGoogle();
      setUser(userData);
      return result;
    } catch (error) {
      throw new Error('Google registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  const registerWithApple = async (): Promise<AuthResult> => {
    setIsLoading(true);
    try {
      const { user: userData, result } = await authService.registerWithApple();
      setUser(userData);
      return result;
    } catch (error) {
      throw new Error('Apple registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    authService.logout();
    setUser(null);
  };

  const forgotPassword = async (email: string) => {
    await authService.forgotPassword(email);
  };

  const resetPassword = async (token: string, newPassword: string) => {
    await authService.resetPassword(token, newPassword);
  };

  const resendVerification = async (email: string) => {
    await authService.resendVerification(email);
  };

  return {
    login,
    loginWithGoogle,
    loginWithApple,
    register,
    registerWithGoogle,
    registerWithApple,
    logout,
    forgotPassword,
    resetPassword,
    resendVerification,
  };
};
