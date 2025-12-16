
import { User } from '@/types/auth';
import { supabaseUserService } from '@/services/supabaseUserService';

export const useSupabaseUserOperations = (
  user: User | null,
  setUser: (user: User | null) => void,
  setIsLoading: (loading: boolean) => void
) => {
  const updateProfile = async (data: Partial<User>) => {
    setIsLoading(true);
    try {
      const updatedUser = await supabaseUserService.updateProfile(user, data);
      setUser(updatedUser);
    } catch (error) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const markWizardComplete = () => {
    const updatedUser = supabaseUserService.markWizardComplete(user);
    if (updatedUser) {
      setUser(updatedUser);
    }
  };

  return {
    updateProfile,
    markWizardComplete,
  };
};
