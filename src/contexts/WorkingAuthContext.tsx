import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Session, User as SupabaseUser } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

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

// Helper function to create user object with wizard completion status
const createUserFromSession = async (session: Session): Promise<User> => {
  const baseUser = {
    id: session.user.id,
    email: session.user.email!,
    name: session.user.user_metadata?.full_name || session.user.email!.split('@')[0],
    hasCompletedWizard: false // Default to false
  };

  // Fetch profile to check wizard completion
  try {
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Query timeout')), 1000)
    );
    const queryPromise = supabase.from('profiles').select('wizard_completed').eq('id', session.user.id).single();
    const result = await Promise.race([queryPromise, timeoutPromise]);
    if (result?.data?.wizard_completed) {
      baseUser.hasCompletedWizard = result.data.wizard_completed;
    }
    // const { data: profile } = await supabase
    //   .from('profiles')
    //   .select('wizard_completed')
    //   .eq('id', session.user.id)
    //   .single();

    // if (profile) {
    //   baseUser.hasCompletedWizard = profile.wizard_completed || false;
    // }
  } catch (error) {
    console.warn('Failed to fetch profile wizard status:', error);
  }

  return baseUser;
};

export const WorkingAuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // TEMPORARY: Mock user for testing
  const mockUser: User = {
    id: '018c280e-fc00-45a5-87e1-cd267439f8e0',
    email: 'shivansh.mudgil@gmail.com',
    name: 'Shivansh',
    hasCompletedWizard: true
  };
  
  const [user, setUser] = useState<User | null>(mockUser);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Check active session
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user) {
        const userData = await createUserFromSession(session);
        setUser(userData);
      }
      setIsLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state changed:', event, session?.user?.email);
      
      if (event === 'SIGNED_OUT') {
        console.log('User signed out - clearing state');
        setUser(null);
      } else if (session?.user) {
        const userData = await createUserFromSession(session);
        setUser(userData);
      } else {
        setUser(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const login = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;
    // User will be set by auth state listener
  };

  const register = async (firstName: string, lastName: string, email: string, password: string) => {
    console.log('Attempting registration for:', email);
    
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          first_name: firstName,
          last_name: lastName,
          full_name: `${firstName} ${lastName}`
        }
      }
    });

    if (error) {
        console.error('Supabase signup error details:', {
          message: error.message,
          status: error.status,
          details: error
        });
        
        // Log the exact error for debugging
        console.error('Signup failed with error:', error);
        
        // Don't use mock users - let the real error surface
        // This will help identify the exact backend issue
        
      throw new Error(`Registration failed: ${error.message}`);
    }

    console.log('Registration data:', data);
    
    // Create user profile manually using the new safe function
    if (data && data.user) {
      console.log('User created successfully, creating profile');
      
      try {
        const { error: profileError } = await supabase.rpc('create_user_profile', {
          user_id: data.user.id,
          user_email: data.user.email || email,
          user_full_name: `${firstName} ${lastName}`,
          user_first_name: firstName,
          user_last_name: lastName,
          mark_wizard_complete: false
        });
        
        if (profileError) {
          console.warn('Profile creation failed:', profileError);
        } else {
          console.log('Profile created successfully');
        }
      } catch (profileError) {
        console.warn('Profile creation RPC failed:', profileError);
      }
      
      // Store user data for wizard
      localStorage.setItem('pending-user-profile', JSON.stringify({
        id: data.user.id,
        email: data.user.email || email,
        firstName,
        lastName,
        fullName: `${firstName} ${lastName}`
      }));
      
      if (data.session) {
        console.log('User has immediate session (no email confirmation)');
        // If we have an immediate session, set the user state with wizard incomplete
        setUser({
          id: data.user.id,
          email: data.user.email!,
          name: `${firstName} ${lastName}`,
          hasCompletedWizard: false
        });
      } else {
        console.log('User needs email confirmation');
      }
    }
    
    // Always redirect to wizard for new registrations
    return { shouldRedirectToWizard: true };
  };

  const logout = async () => {
    console.log('Logout initiated');
    
    try {
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error('Logout error:', error);
        throw error;
      }
      
      // Force clear user state immediately
      setUser(null);
      
      // Clear any stored session data
      localStorage.removeItem('pending-user-profile');
      
      console.log('Logout successful');
    } catch (error) {
      console.error('Failed to logout:', error);
      // Force clear user state even on error
      setUser(null);
      throw error;
    }
  };

  const forgotPassword = async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    
    if (error) {
      console.error('Password reset error:', error);
      throw error;
    }
  };

  const loginWithGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/dashboard`,
      },
    });

    if (error) {
      console.error('Google login error:', error);
      throw error;
    }
  };

  const registerWithGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/signup-wizard`,
      },
    });

    if (error) {
      console.error('Google registration error:', error);
      throw error;
    }
  };

  const updateUser = (updates: Partial<User>) => {
    setUser(prev => prev ? { ...prev, ...updates } : null);
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, register, logout, forgotPassword, loginWithGoogle, registerWithGoogle, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};