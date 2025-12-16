
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { useAuth } from '@/contexts/WorkingAuthContext';
import { useSignupFlow } from '@/contexts/SignupFlowContext';
import { useToast } from '@/hooks/use-toast';
import { useWizardData } from '@/hooks/useWizardData';
import { useWizardNavigation } from '@/hooks/useWizardNavigation';
import WizardProgressIndicator from './WizardProgressIndicator';
import WizardStepRenderer from './WizardStepRenderer';
import WizardFooter from './WizardFooter';
import { SignupWizardData, AccountInfoData } from '@/types/wizard';
import { FirmSize } from '@/types/firmSize';
import { supabase } from '@/integrations/supabase/client';

const SignupWizard: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();
  const { register, user, updateUser } = useAuth();
  const { signupData, clearSignupData } = useSignupFlow();
  const { toast } = useToast();
  
  // Check for pending signup data in localStorage if signupData is not available
  const pendingSignupData = React.useMemo(() => {
    if (signupData) return signupData;
    
    try {
      const stored = localStorage.getItem('pending-signup-data');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  }, [signupData]);
  
  const { wizardData, saveData, clearData } = useWizardData();
  
  // Clear any existing wizard data for fresh signups
  React.useEffect(() => {
    if (pendingSignupData && !user) {
      // Clear any stale wizard data for fresh signup
      console.log('Fresh signup detected - clearing stale wizard data');
      localStorage.removeItem('signup-wizard-data');
    }
  }, []);
  const firmSize = wizardData.firmInfo?.firmSize as FirmSize;
  
  const { 
    currentStep, 
    currentStepId,
    completedSteps, 
    handleNext: navigationHandleNext, 
    handleBack, 
    handleSkip, 
    isFromSignup,
    steps,
  } = useWizardNavigation(wizardData);

  const handleNext = (stepKey: keyof SignupWizardData, data: any) => {
    navigationHandleNext(stepKey, data, saveData);
  };

  const handleComplete = async () => {
    setIsLoading(true);
    try {
      // Only register if user doesn't exist AND we have account info with password
      // If coming from signup flow, user is already registered
      if (!user && !isFromSignup && wizardData.accountInfo?.password) {
        const accountData = wizardData.accountInfo as AccountInfoData;
        const nameParts = accountData.name.split(' ');
        const firstName = nameParts[0] || '';
        const lastName = nameParts.slice(1).join(' ') || '';
        await register(firstName, lastName, accountData.email, accountData.password);
      }
      
      // Mark wizard as completed in database
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        console.log('Marking wizard as completed for user:', session.user.id);
        
        const userData = pendingSignupData || {
          name: session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || 'User',
          email: session.user.email || '',
          firstName: session.user.user_metadata?.first_name || 'User',
          lastName: session.user.user_metadata?.last_name || ''
        };
        
        // Create/update profile and mark wizard as completed
        try {
          const { error: profileError } = await supabase.rpc('create_user_profile', {
            user_id: session.user.id,
            user_email: userData.email,
            user_full_name: userData.name,
            user_first_name: userData.firstName,
            user_last_name: userData.lastName,
            mark_wizard_complete: true
          });
          
          if (profileError) {
            console.error('Profile creation/wizard completion failed:', profileError);
            throw new Error('Failed to complete setup');
          } else {
            console.log('Profile created and wizard marked as completed successfully');
            // Update user context immediately to prevent redirect loops
            updateUser({ hasCompletedWizard: true });
          }
        } catch (profileError) {
          console.error('Profile/wizard completion failed:', profileError);
          throw profileError;
        }
      }
      
      // Clear only local storage and signup flow data, keep database data for profile
      localStorage.removeItem('signup-wizard-data');
      localStorage.removeItem('pending-signup-data');
      localStorage.removeItem('pending-user-profile');
      clearSignupData();
      
      toast({
        title: "Welcome to ROSS.AI!",
        description: "Your setup has been completed successfully.",
      });
      
      // Force a small delay to ensure auth state is properly set
      await new Promise(resolve => setTimeout(resolve, 500));
      
      navigate('/dashboard');
    } catch (error) {
      console.error('Setup completion error:', error);
      toast({
        title: "Setup completion failed",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Check if we're on completion step
  const isCompletionStep = currentStepId === 'complete';
  
  // Filter steps for progress display (exclude completion step)
  const progressSteps = steps.filter(step => step.id !== 'complete');
  
  // Calculate progress values
  const progressCurrentStep = isCompletionStep 
    ? progressSteps.length - 1 
    : Math.min(currentStep, progressSteps.length - 1);

  // Map completed steps to progress steps (excluding completion)
  const progressCompletedSteps = new Set(
    Array.from(completedSteps)
      .map(stepIndex => {
        // If this is the completion step, don't include it in progress
        if (steps[stepIndex]?.id === 'complete') return -1;
        // Find the index in progressSteps
        const progressIndex = progressSteps.findIndex(step => step.id === steps[stepIndex]?.id);
        return progressIndex;
      })
      .filter(index => index >= 0)
  );

  // Debug information
  console.log('SignupWizard Debug:', {
    currentStep,
    currentStepId,
    isCompletionStep,
    completedSteps: Array.from(completedSteps),
    progressCurrentStep,
    progressCompletedSteps: Array.from(progressCompletedSteps),
    totalSteps: steps.length,
    progressSteps: progressSteps.length,
    pendingSignupData: !!pendingSignupData,
    user: !!user,
    firmSize,
    wizardDataKeys: Object.keys(wizardData)
  });

  return (
    <div className="flex justify-center">
      <div className="w-full max-w-2xl">
        <Card className="shadow-lg">
          <CardContent className="p-8">
            {!isCompletionStep && (
              <WizardProgressIndicator
                steps={progressSteps}
                currentStepIndex={progressCurrentStep}
                completedSteps={progressCompletedSteps}
              />
            )}
            
            <div className="mt-8">
              <WizardStepRenderer
                currentStep={currentStep}
                stepId={currentStepId}
                wizardData={wizardData}
                firmSize={firmSize}
                saveData={saveData}
                onNext={handleNext}
                onBack={handleBack}
                onSkip={handleSkip}
                onComplete={handleComplete}
                isLoading={isLoading}
                signupDataName={pendingSignupData?.name}
              />
            </div>

            {!isCompletionStep && (
              <WizardFooter
                currentStep={progressCurrentStep}
                totalSteps={progressSteps.length}
              />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SignupWizard;
