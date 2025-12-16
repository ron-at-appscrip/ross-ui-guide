
import { useMemo } from 'react';
import { FirmSize, FIRM_SIZE_CONFIGS } from '@/types/firmSize';
import { WizardStep } from '@/types/wizard';
import AccountInfoStep from '@/components/wizard/steps/AccountInfoStep';
import PersonalInfoStep from '@/components/wizard/steps/PersonalInfoStep';
import FirmInfoStep from '@/components/wizard/steps/FirmInfoStep';
import PracticeAreasStep from '@/components/wizard/steps/PracticeAreasStep';
import TeamSetupStep from '@/components/wizard/steps/TeamSetupStep';
import ComplianceStep from '@/components/wizard/steps/ComplianceStep';
import IntegrationPreferencesStep from '@/components/wizard/steps/IntegrationPreferencesStep';
import EnterpriseStep from '@/components/wizard/steps/EnterpriseStep';
import CompletionStep from '@/components/wizard/steps/CompletionStep';

export interface WizardPathConfig {
  steps: WizardStep[];
  requiredSteps: string[];
  optionalSteps: string[];
  features: readonly string[];
}

export const useWizardPathConfiguration = (firmSize?: FirmSize): WizardPathConfig => {
  return useMemo(() => {
    if (!firmSize) {
      // Default configuration for when firm size is not yet selected
      return {
        steps: [
          {
            id: 'account',
            title: 'Account',
            description: 'Basic account information',
            component: AccountInfoStep,
          },
          {
            id: 'personal',
            title: 'Personal',
            description: 'Personal details',
            component: PersonalInfoStep,
          },
          {
            id: 'firm',
            title: 'Firm',
            description: 'Firm information',
            component: FirmInfoStep,
          },
          {
            id: 'practice',
            title: 'Practice',
            description: 'Practice areas',
            component: PracticeAreasStep,
          },
          {
            id: 'complete',
            title: 'Complete',
            description: 'Setup complete',
            component: CompletionStep,
          },
        ],
        requiredSteps: ['account', 'personal', 'firm', 'practice'],
        optionalSteps: [],
        features: [],
      };
    }

    const config = FIRM_SIZE_CONFIGS[firmSize];
    const baseSteps = [
      {
        id: 'account',
        title: 'Account',
        description: 'Basic account information',
        component: AccountInfoStep,
      },
      {
        id: 'personal',
        title: 'Personal',
        description: 'Personal details',
        component: PersonalInfoStep,
      },
      {
        id: 'firm',
        title: 'Firm',
        description: 'Firm information',
        component: FirmInfoStep,
      },
      {
        id: 'practice',
        title: 'Practice',
        description: 'Practice areas',
        component: PracticeAreasStep,
      },
    ];

    // Add conditional steps based on firm size
    const conditionalSteps = [];
    
    // Team setup - required for small+ firms
    if (firmSize !== 'solo') {
      conditionalSteps.push({
        id: 'team',
        title: 'Team',
        description: 'Team setup',
        component: TeamSetupStep,
        isOptional: firmSize === 'small',
      });
    }

    // Compliance step - required for mid-large+ firms
    if (config.requiresCompliance) {
      conditionalSteps.push({
        id: 'compliance',
        title: 'Compliance',
        description: 'Compliance & security',
        component: ComplianceStep,
        isOptional: firmSize === 'mid-large',
      });
    }

    // Integrations - required for small+ firms
    if (config.requiresIntegrations) {
      conditionalSteps.push({
        id: 'integrations',
        title: 'Integrations',
        description: 'Tool preferences',
        component: IntegrationPreferencesStep,
        isOptional: firmSize !== 'enterprise',
      });
    }

    // Enterprise features step
    if (firmSize === 'enterprise') {
      conditionalSteps.push({
        id: 'enterprise',
        title: 'Enterprise',
        description: 'Enterprise features',
        component: EnterpriseStep,
      });
    }

    // Completion step
    const completionStep = {
      id: 'complete',
      title: 'Complete',
      description: 'Setup complete',
      component: CompletionStep,
    };

    const allSteps = [...baseSteps, ...conditionalSteps, completionStep];
    
    const requiredSteps = ['account', 'personal', 'firm', 'practice'];
    const optionalSteps = [];

    // Add conditional required/optional steps
    if (firmSize !== 'solo') {
      if (firmSize === 'small') {
        optionalSteps.push('team');
      } else {
        requiredSteps.push('team');
      }
    }

    if (config.requiresCompliance) {
      if (firmSize === 'mid-large') {
        optionalSteps.push('compliance');
      } else {
        requiredSteps.push('compliance');
      }
    }

    if (config.requiresIntegrations) {
      if (firmSize === 'enterprise') {
        requiredSteps.push('integrations');
      } else {
        optionalSteps.push('integrations');
      }
    }

    if (firmSize === 'enterprise') {
      requiredSteps.push('enterprise');
    }

    return {
      steps: allSteps,
      requiredSteps,
      optionalSteps,
      features: config.features,
    };
  }, [firmSize]);
};
