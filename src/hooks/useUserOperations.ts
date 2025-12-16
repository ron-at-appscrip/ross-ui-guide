
import { User } from '@/types/auth';
import { userService } from '@/services/userService';

export const useUserOperations = (
  user: User | null,
  setUser: (user: User | null) => void,
  setIsLoading: (loading: boolean) => void
) => {
  const updateProfile = async (data: Partial<User>) => {
    setIsLoading(true);
    try {
      const updatedUser = await userService.updateProfile(user, data);
      setUser(updatedUser);
    } catch (error) {
      throw new Error('Profile update failed');
    } finally {
      setIsLoading(false);
    }
  };

  const markWizardComplete = () => {
    const updatedUser = userService.markWizardComplete(user);
    if (updatedUser) {
      setUser(updatedUser);
    }
  };

  return {
    updateProfile,
    markWizardComplete,
  };
};
