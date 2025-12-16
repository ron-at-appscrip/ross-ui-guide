
import { useState, useEffect } from 'react';
import { SignupWizardData } from '@/types/wizard';
import { useSignupFlow } from '@/contexts/SignupFlowContext';
import { useAuth } from '@/contexts/WorkingAuthContext';
import { supabaseWizardService } from '@/services/supabaseWizardService';

const STORAGE_KEY = 'signup-wizard-data';

export const useWizardData = () => {
  const [wizardData, setWizardData] = useState<Partial<SignupWizardData>>({});
  const { signupData, isFromSignup } = useSignupFlow();
  const { user } = useAuth();

  // Load saved data on mount and pre-fill from signup data
  useEffect(() => {
    const loadData = async () => {
      let initialData: Partial<SignupWizardData> = {};

      // Try to load from Supabase if user is authenticated
      if (user) {
        try {
          // Check if this is a fresh signup - if so, initialize fresh wizard
          if (isFromSignup) {
            console.log('Fresh signup detected, initializing clean wizard for user:', user.id);
            await supabaseWizardService.initializeWizardForUser(user.id);
            // Also clear localStorage for fresh start
            localStorage.removeItem(STORAGE_KEY);
            initialData = {};
          } else {
            initialData = await supabaseWizardService.getWizardData(user.id);
          }
        } catch (error) {
          console.error('Failed to load wizard data from Supabase:', error);
          // Fallback to localStorage only for non-fresh signups
          if (!isFromSignup) {
            const savedData = localStorage.getItem(STORAGE_KEY);
            if (savedData) {
              try {
                initialData = JSON.parse(savedData);
              } catch (parseError) {
                console.error('Failed to parse saved wizard data:', parseError);
              }
            }
          }
        }
      } else {
        // Load from localStorage if not authenticated
        const savedData = localStorage.getItem(STORAGE_KEY);
        if (savedData) {
          try {
            initialData = JSON.parse(savedData);
          } catch (error) {
            console.error('Failed to load saved wizard data:', error);
          }
        }
      }

      // Pre-fill with signup data if available
      if (signupData) {
        const nameParts = signupData.name?.split(' ') || [];
        const firstName = nameParts[0] || '';
        const lastName = nameParts.slice(1).join(' ') || '';

        initialData = {
          ...initialData,
          accountInfo: {
            ...initialData.accountInfo,
            name: signupData.name || '',
            email: signupData.email || '',
            password: '', // Don't pre-fill password for security
            confirmPassword: '',
          },
          personalInfo: {
            ...initialData.personalInfo,
            firstName,
            lastName,
          },
        };
      }

      setWizardData(initialData);
    };

    loadData();
  }, [signupData, isFromSignup, user]);

  const saveData = async (stepKey: keyof SignupWizardData, data: any) => {
    const updatedData = {
      ...wizardData,
      [stepKey]: data,
    };
    setWizardData(updatedData);

    // Save to localStorage for offline access
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedData));

    // Save to Supabase if user is authenticated
    if (user) {
      try {
        const supabaseStepKey = supabaseWizardService.mapPropertyToStepKey(stepKey);
        await supabaseWizardService.saveWizardData(user.id, supabaseStepKey, data);
      } catch (error) {
        console.error('Failed to save wizard data to Supabase:', error);
        // Continue with localStorage save only
      }
    }
  };

  const clearData = async () => {
    localStorage.removeItem(STORAGE_KEY);
    
    if (user) {
      try {
        await supabaseWizardService.clearWizardData(user.id);
      } catch (error) {
        console.error('Failed to clear wizard data from Supabase:', error);
      }
    }
  };

  return {
    wizardData,
    saveData,
    clearData,
  };
};
