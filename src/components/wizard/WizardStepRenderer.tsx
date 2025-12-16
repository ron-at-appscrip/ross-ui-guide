
import React from 'react';
import AccountInfoStep from './steps/AccountInfoStep';
import PersonalInfoStep from './steps/PersonalInfoStep';
import FirmInfoStep from './steps/FirmInfoStep';
import PracticeAreasStep from './steps/PracticeAreasStep';
import TeamSetupStep from './steps/TeamSetupStep';
import IntegrationPreferencesStep from './steps/IntegrationPreferencesStep';
import ComplianceStep from './steps/ComplianceStep';
import EnterpriseStep from './steps/EnterpriseStep';
import CompletionStep from './steps/CompletionStep';
import {
  SignupWizardData,
  AccountInfoData,
  PersonalInfoData,
  FirmInfoData,
  PracticeAreasData,
  TeamSetupData,
  IntegrationPreferencesData,
  ComplianceData,
  EnterpriseData,
} from '@/types/wizard';
import { FirmSize } from '@/types/firmSize';

import { useWizardPathConfiguration } from '@/hooks/useWizardPathConfiguration';

interface WizardStepRendererProps {
  currentStep: number;
  stepId: string;
  wizardData: Partial<SignupWizardData>;
  firmSize?: FirmSize;
  saveData: (stepKey: keyof SignupWizardData, data: any) => void;
  onNext: (stepKey: keyof SignupWizardData, data: any) => void;
  onBack: () => void;
  onSkip: () => void;
  onComplete: () => void;
  isLoading: boolean;
  signupDataName?: string;
}

const WizardStepRenderer: React.FC<WizardStepRendererProps> = ({
  currentStep,
  stepId,
  wizardData,
  firmSize,
  saveData,
  onNext,
  onBack,
  onSkip,
  onComplete,
  isLoading,
  signupDataName,
}) => {
  const { steps } = useWizardPathConfiguration(firmSize);
  const currentStepConfig = steps[currentStep];
  
  if (!currentStepConfig) {
    return <div>Step not found</div>;
  }

  const StepComponent = currentStepConfig.component;
  const commonProps = {
    onBack,
    onSkip,
  };

  // Use dynamic component rendering based on step configuration
  switch (stepId) {
    case 'account':
      return (
        <StepComponent
          data={wizardData.accountInfo || {}}
          onNext={(data: AccountInfoData) => onNext('accountInfo', data)}
          onSave={(data: Partial<AccountInfoData>) => saveData('accountInfo', { ...wizardData.accountInfo, ...data })}
        />
      );
    case 'personal':
      return (
        <StepComponent
          data={wizardData.personalInfo || {}}
          onNext={(data: PersonalInfoData) => onNext('personalInfo', data)}
          onSave={(data: Partial<PersonalInfoData>) => saveData('personalInfo', { ...wizardData.personalInfo, ...data })}
          {...commonProps}
        />
      );
    case 'firm':
      return (
        <StepComponent
          data={wizardData.firmInfo || {}}
          onNext={(data: FirmInfoData) => onNext('firmInfo', data)}
          onSave={(data: Partial<FirmInfoData>) => saveData('firmInfo', { ...wizardData.firmInfo, ...data })}
          {...commonProps}
        />
      );
    case 'practice':
      return (
        <StepComponent
          data={wizardData.practiceAreas || {}}
          onNext={(data: PracticeAreasData) => onNext('practiceAreas', data)}
          onSave={(data: Partial<PracticeAreasData>) => saveData('practiceAreas', { ...wizardData.practiceAreas, ...data })}
          {...commonProps}
        />
      );
    case 'team':
      return (
        <StepComponent
          data={wizardData.teamSetup || {}}
          onNext={(data: TeamSetupData) => onNext('teamSetup', data)}
          onSave={(data: Partial<TeamSetupData>) => saveData('teamSetup', { ...wizardData.teamSetup, ...data })}
          {...commonProps}
        />
      );
    case 'compliance':
      return (
        <StepComponent
          data={wizardData.compliance || {}}
          onNext={(data: ComplianceData) => onNext('compliance', data)}
          onSave={(data: Partial<ComplianceData>) => saveData('compliance', { ...wizardData.compliance, ...data })}
          {...commonProps}
        />
      );
    case 'integrations':
      return (
        <StepComponent
          data={wizardData.integrationPreferences || {}}
          onNext={(data: IntegrationPreferencesData) => onNext('integrationPreferences', data)}
          onSave={(data: Partial<IntegrationPreferencesData>) => saveData('integrationPreferences', { ...wizardData.integrationPreferences, ...data })}
          {...commonProps}
        />
      );
    case 'enterprise':
      return (
        <StepComponent
          data={wizardData.enterprise || {}}
          onNext={(data: EnterpriseData) => onNext('enterprise', data)}
          onSave={(data: Partial<EnterpriseData>) => saveData('enterprise', { ...wizardData.enterprise, ...data })}
          onBack={onBack}
        />
      );
    case 'complete':
      return (
        <StepComponent
          onComplete={onComplete}
          userData={{
            name: wizardData.accountInfo?.name || signupDataName || '',
            firmName: wizardData.firmInfo?.firmName || '',
          }}
          isLoading={isLoading}
        />
      );
    default:
      return null;
  }
};

export default WizardStepRenderer;
