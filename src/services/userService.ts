
import { User } from '@/types/auth';

export const userService = {
  async updateProfile(currentUser: User | null, data: Partial<User>): Promise<User> {
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const updatedUser = { ...currentUser, ...data } as User;
    const storage = localStorage.getItem('authToken') ? localStorage : sessionStorage;
    storage.setItem('userData', JSON.stringify(updatedUser));
    
    return updatedUser;
  },

  markWizardComplete(currentUser: User | null): User | null {
    if (currentUser) {
      const updatedUser = { ...currentUser, hasCompletedWizard: true };
      const storage = localStorage.getItem('authToken') ? localStorage : sessionStorage;
      storage.setItem('userData', JSON.stringify(updatedUser));
      return updatedUser;
    }
    return null;
  },

  loadUserFromStorage(): User | null {
    const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
    if (token) {
      try {
        const userData = localStorage.getItem('userData') || sessionStorage.getItem('userData');
        if (userData) {
          return JSON.parse(userData);
        }
      } catch (error) {
        localStorage.removeItem('authToken');
        localStorage.removeItem('userData');
        sessionStorage.removeItem('authToken');
        sessionStorage.removeItem('userData');
      }
    }
    return null;
  }
};
