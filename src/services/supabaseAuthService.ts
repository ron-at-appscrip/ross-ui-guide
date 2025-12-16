
import { supabase } from '@/integrations/supabase/client';
import { User, AuthResult } from '@/types/auth';
import { activityService } from './activityService';
import { sessionService } from './sessionService';

export const supabaseAuthService = {
  async login(email: string, password: string, rememberMe = false): Promise<User> {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      throw new Error(error.message);
    }

    if (!data.user) {
      throw new Error('Login failed');
    }

    // Fetch the user profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', data.user.id)
      .single();

    if (profileError) {
      console.error('Profile fetch error:', profileError);
    }

    const userData: User = {
      id: data.user.id,
      email: data.user.email!,
      name: profile?.full_name || data.user.user_metadata?.full_name || 'User',
      first_name: profile?.first_name || data.user.user_metadata?.first_name,
      last_name: profile?.last_name || data.user.user_metadata?.last_name,
      full_name: profile?.full_name || data.user.user_metadata?.full_name,
      title: 'Attorney at Law',
      avatar: profile?.avatar_url || data.user.user_metadata?.avatar_url,
      avatar_url: profile?.avatar_url || data.user.user_metadata?.avatar_url,
      provider: 'email',
      emailVerified: data.user.email_confirmed_at !== null,
      hasCompletedWizard: true, // We'll check this properly later
    };

    // Log login activity
    try {
      await activityService.logLogin(userData.id);
    } catch (error) {
      console.warn('Failed to log login activity:', error);
    }

    return userData;
  },

  async loginWithGoogle(): Promise<User> {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
    });

    if (error) {
      throw new Error(error.message);
    }

    // For OAuth, we need to handle the redirect, so we'll return a placeholder
    // The actual user data will be handled by the auth state change listener
    throw new Error('Redirecting to Google...');
  },

  async loginWithApple(): Promise<User> {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'apple',
    });

    if (error) {
      throw new Error(error.message);
    }

    throw new Error('Redirecting to Apple...');
  },

  async register(firstName: string, lastName: string, email: string, password: string): Promise<{ user: User; result: AuthResult }> {
    // Clear any existing session data before registering new user
    try {
      sessionStorage.clear();
      localStorage.removeItem('supabase.auth.token');
      localStorage.removeItem('sb-aiveyvvhlfiqhbaqazrr-auth-token');
    } catch (error) {
      console.warn('Failed to clear existing session data:', error);
    }

    const fullName = `${firstName.trim()} ${lastName.trim()}`.trim();
    
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          first_name: firstName.trim(),
          last_name: lastName.trim(),
        },
      },
    });

    if (error) {
      throw new Error(error.message);
    }

    if (!data.user) {
      throw new Error('Registration failed');
    }

    const userData: User = {
      id: data.user.id,
      email: data.user.email!,
      name: fullName,
      first_name: firstName.trim(),
      last_name: lastName.trim(),
      full_name: fullName,
      title: 'Associate',
      provider: 'email',
      emailVerified: data.user.email_confirmed_at !== null,
      hasCompletedWizard: false,
    };

    // Log signup activity
    try {
      await activityService.logSignup(userData.id, userData.email);
    } catch (error) {
      console.warn('Failed to log signup activity:', error);
    }

    return { 
      user: userData, 
      result: { shouldRedirectToWizard: true } 
    };
  },

  async registerWithGoogle(): Promise<{ user: User; result: AuthResult }> {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
    });

    if (error) {
      throw new Error(error.message);
    }

    throw new Error('Redirecting to Google...');
  },

  async registerWithApple(): Promise<{ user: User; result: AuthResult }> {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'apple',
    });

    if (error) {
      throw new Error(error.message);
    }

    throw new Error('Redirecting to Apple...');
  },

  async forgotPassword(email: string): Promise<void> {
    const { error } = await supabase.auth.resetPasswordForEmail(email);

    if (error) {
      throw new Error(error.message);
    }
  },

  async resetPassword(token: string, newPassword: string): Promise<void> {
    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (error) {
      throw new Error(error.message);
    }
  },

  async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    // First, get the current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      throw new Error('User not authenticated');
    }

    // Verify current password by attempting to sign in with it
    const { error: verifyError } = await supabase.auth.signInWithPassword({
      email: user.email!,
      password: currentPassword,
    });

    if (verifyError) {
      throw new Error('Invalid login credentials');
    }

    // If verification successful, update to new password
    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (error) {
      throw new Error(error.message);
    }

    // Log password change activity
    try {
      await activityService.logPasswordChange(user.id);
    } catch (error) {
      console.warn('Failed to log password change activity:', error);
    }
  },

  async resendVerification(email: string): Promise<void> {
    const { error } = await supabase.auth.resend({
      type: 'signup',
      email,
    });

    if (error) {
      throw new Error(error.message);
    }
  },

  async logout(): Promise<void> {
    // Get current user and session for logging
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const { data: { session } } = await supabase.auth.getSession();
      
      if (user) {
        await activityService.logLogout(user.id);
      }
    } catch (error) {
      console.warn('Failed to log logout activity:', error);
    }

    // Clear all local data before signing out
    try {
      sessionStorage.clear();
      localStorage.removeItem('supabase.auth.token');
      localStorage.removeItem('sb-aiveyvvhlfiqhbaqazrr-auth-token');
    } catch (error) {
      console.warn('Failed to clear local storage:', error);
    }

    // Sign out
    await supabase.auth.signOut();
  }
};
