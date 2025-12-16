
import { useState, useEffect } from 'react';
import { useSignupFlow } from '@/contexts/SignupFlowContext';
import { SignupWizardData } from '@/types/wizard';
import { FirmSize } from '@/types/firmSize';
import { useWizardPathConfiguration } from './useWizardPathConfiguration';

export const useWizardNavigation = (wizardData: Partial<SignupWizardData>) => {
  const { isFromSignup, signupData } = useSignupFlow();
  const firmSize = wizardData.firmInfo?.firmSize as FirmSize;
  const { steps } = useWizardPathConfiguration(firmSize);
  
  // Check if we have pending signup data (indicates user just registered)
  const hasPendingSignupData = Boolean(
    signupData || 
    (typeof localStorage !== 'undefined' && localStorage.getItem('pending-signup-data'))
  );
  
  // Skip account step if from signup or has pending signup data
  const shouldSkipAccount = isFromSignup || hasPendingSignupData;
  const initialStep = shouldSkipAccount ? 1 : 0;
  
  const [currentStep, setCurrentStep] = useState(initialStep);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());
  const [previousFirmSize, setPreviousFirmSize] = useState<FirmSize | undefined>(firmSize);

  // Debug logging
  console.log('Wizard Navigation Debug:', {
    shouldSkipAccount,
    initialStep,
    currentStep,
    hasPendingSignupData,
    isFromSignup,
    signupDataExists: !!signupData,
    completedSteps: Array.from(completedSteps),
    wizardDataKeys: Object.keys(wizardData)
  });

  useEffect(() => {
    // Handle firm size changes - reset step if needed
    if (previousFirmSize !== firmSize && firmSize) {
      setPreviousFirmSize(firmSize);
      // If we're past the firm step and firm size changed, we may need to adjust current step
      if (currentStep > 3) { // 3 is the practice step index
        // Stay on current step if it still exists, otherwise go to next valid step
        const currentStepId = steps[currentStep]?.id;
        if (!currentStepId) {
          // Current step no longer exists, find the next step after practice
          setCurrentStep(4); // Start with first conditional step
        }
      }
    }

    // Determine which steps are completed based on saved data
    const completed = new Set<number>();
    
    steps.forEach((step, index) => {
      switch (step.id) {
        case 'account':
          if (wizardData.accountInfo || shouldSkipAccount) completed.add(index);
          break;
        case 'personal':
          if (wizardData.personalInfo) completed.add(index);
          break;
        case 'firm':
          if (wizardData.firmInfo) completed.add(index);
          break;
        case 'practice':
          if (wizardData.practiceAreas) completed.add(index);
          break;
        case 'team':
          if (wizardData.teamSetup) completed.add(index);
          break;
        case 'compliance':
          if (wizardData.compliance) completed.add(index);
          break;
        case 'integrations':
          if (wizardData.integrationPreferences) completed.add(index);
          break;
        case 'enterprise':
          if (wizardData.enterprise) completed.add(index);
          break;
      }
    });
    
    setCompletedSteps(completed);
  }, [wizardData, shouldSkipAccount, steps, firmSize, previousFirmSize, currentStep]);

  const getCurrentStepId = () => {
    return steps[currentStep]?.id || '';
  };

  const handleNext = (stepKey: keyof SignupWizardData, data: any, saveData: (key: keyof SignupWizardData, data: any) => void) => {
    saveData(stepKey, data);
    
    // Mark current step as completed
    setCompletedSteps(prev => new Set([...prev, currentStep]));
    
    // Move to next step
    const nextStep = Math.min(currentStep + 1, steps.length - 1);
    setCurrentStep(nextStep);
  };

  const handleBack = () => {
    // Don't allow going back to account step if should skip account
    const minStep = shouldSkipAccount ? 1 : 0;
    setCurrentStep(prev => Math.max(prev - 1, minStep));
  };

  const handleSkip = () => {
    // Move to next step without marking current as completed
    setCurrentStep(prev => Math.min(prev + 1, steps.length - 1));
  };

  return {
    currentStep,
    currentStepId: getCurrentStepId(),
    completedSteps,
    handleNext,
    handleBack,
    handleSkip,
    isFromSignup: shouldSkipAccount,
    totalSteps: steps.length,
    steps,
  };
};
