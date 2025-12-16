
export interface User {
  id: string;
  email: string;
  name: string;
  first_name?: string;
  last_name?: string;
  full_name?: string;
  title?: string;
  avatar?: string;
  avatar_url?: string;
  provider?: 'email' | 'google' | 'apple';
  emailVerified?: boolean;
  hasCompletedWizard?: boolean;
}

export interface AuthContextType {
  user: User | null;
  login: (email: string, password: string, rememberMe?: boolean) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  loginWithApple: () => Promise<void>;
  register: (firstName: string, lastName: string, email: string, password: string) => Promise<{ shouldRedirectToWizard: boolean }>;
  registerWithGoogle: () => Promise<{ shouldRedirectToWizard: boolean }>;
  registerWithApple: () => Promise<{ shouldRedirectToWizard: boolean }>;
  logout: () => Promise<void>;
  isLoading: boolean;
  forgotPassword: (email: string) => Promise<void>;
  resetPassword: (token: string, newPassword: string) => Promise<void>;
  resendVerification: (email: string) => Promise<void>;
  updateProfile: (data: Partial<User>) => Promise<void>;
  markWizardComplete: () => void;
}

export interface AuthResult {
  shouldRedirectToWizard: boolean;
}
