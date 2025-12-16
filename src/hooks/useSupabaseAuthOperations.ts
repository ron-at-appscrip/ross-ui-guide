
import { User, AuthResult } from '@/types/auth';
import { supabaseAuthService } from '@/services/supabaseAuthService';

export const useSupabaseAuthOperations = (
  setUser: (user: User | null) => void,
  setIsLoading: (loading: boolean) => void
) => {
  const login = async (email: string, password: string, rememberMe = false) => {
    setIsLoading(true);
    try {
      const userData = await supabaseAuthService.login(email, password, rememberMe);
      setUser(userData);
    } catch (error) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const loginWithGoogle = async () => {
    setIsLoading(true);
    try {
      await supabaseAuthService.loginWithGoogle();
      // User will be set via auth state change listener
    } catch (error) {
      setIsLoading(false);
      throw error;
    }
  };

  const loginWithApple = async () => {
    setIsLoading(true);
    try {
      await supabaseAuthService.loginWithApple();
      // User will be set via auth state change listener
    } catch (error) {
      setIsLoading(false);
      throw error;
    }
  };

  const register = async (firstName: string, lastName: string, email: string, password: string): Promise<AuthResult> => {
    setIsLoading(true);
    try {
      const { user: userData, result } = await supabaseAuthService.register(firstName, lastName, email, password);
      setUser(userData);
      return result;
    } catch (error) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const registerWithGoogle = async (): Promise<AuthResult> => {
    setIsLoading(true);
    try {
      const { result } = await supabaseAuthService.registerWithGoogle();
      return result;
    } catch (error) {
      setIsLoading(false);
      throw error;
    }
  };

  const registerWithApple = async (): Promise<AuthResult> => {
    setIsLoading(true);
    try {
      const { result } = await supabaseAuthService.registerWithApple();
      return result;
    } catch (error) {
      setIsLoading(false);
      throw error;
    }
  };

  const logout = async () => {
    await supabaseAuthService.logout();
    setUser(null);
  };

  const forgotPassword = async (email: string) => {
    await supabaseAuthService.forgotPassword(email);
  };

  const resetPassword = async (token: string, newPassword: string) => {
    await supabaseAuthService.resetPassword(token, newPassword);
  };

  const resendVerification = async (email: string) => {
    await supabaseAuthService.resendVerification(email);
  };

  return {
    login,
    loginWithGoogle,
    loginWithApple,
    register,
    registerWithGoogle,
    registerWithApple,
    logout,
    signOut: logout, // Add alias for consistency
    forgotPassword,
    resetPassword,
    resendVerification,
  };
};
