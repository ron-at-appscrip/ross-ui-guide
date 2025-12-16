
import { supabase } from '@/integrations/supabase/client';
import { SignupWizardData } from '@/types/wizard';

export const supabaseWizardService = {
  async initializeWizardForUser(userId: string): Promise<void> {
    // Clear any existing wizard data for this user to ensure fresh start
    try {
      await this.clearWizardData(userId);
      console.log('Cleared existing wizard data for user:', userId);
    } catch (error) {
      console.warn('Failed to clear existing wizard data:', error);
    }
  },

  async saveWizardData(userId: string, stepKey: string, data: any): Promise<void> {
    // Validate critical fields before saving
    this.validateStepData(stepKey, data);

    const { error } = await supabase
      .from('wizard_data')
      .upsert({
        user_id: userId,
        step_key: stepKey,
        data: data,
      }, {
        onConflict: 'user_id,step_key',
        ignoreDuplicates: false,
      });

    if (error) {
      throw new Error(`Failed to save wizard data: ${error.message}`);
    }
  },

  async getWizardData(userId: string): Promise<Partial<SignupWizardData>> {
    const { data, error } = await supabase
      .from('wizard_data')
      .select('step_key, data')
      .eq('user_id', userId);

    if (error) {
      throw new Error(`Failed to load wizard data: ${error.message}`);
    }

    const wizardData: Partial<SignupWizardData> = {};
    data?.forEach(item => {
      // Map step_key to the correct property name
      const propertyName = this.mapStepKeyToProperty(item.step_key);
      if (propertyName) {
        (wizardData as any)[propertyName] = item.data;
      }
    });

    return wizardData;
  },

  async getAllWizardData(userId: string): Promise<any> {
    const { data, error } = await supabase
      .from('wizard_data')
      .select('step_key, data')
      .eq('user_id', userId);

    if (error) {
      throw new Error(`Failed to load wizard data: ${error.message}`);
    }

    const wizardData: any = {};
    data?.forEach(item => {
      // Map step_key to the correct property name
      const propertyName = this.mapStepKeyToProperty(item.step_key);
      if (propertyName) {
        wizardData[propertyName] = item.data;
      }
    });

    return wizardData;
  },

  async updateWizardData(userId: string, stepKey: string, partialData: any): Promise<void> {
    // First get existing data
    const { data: existingData, error: fetchError } = await supabase
      .from('wizard_data')
      .select('data')
      .eq('user_id', userId)
      .eq('step_key', stepKey)
      .single();

    if (fetchError && fetchError.code !== 'PGRST116') { // PGRST116 is "not found" error
      throw new Error(`Failed to fetch existing wizard data: ${fetchError.message}`);
    }

    // Merge existing data with new data
    const updatedData = {
      ...(existingData?.data || {}),
      ...partialData,
    };

    if (existingData) {
      // Update existing record
      const { error } = await supabase
        .from('wizard_data')
        .update({ data: updatedData })
        .eq('user_id', userId)
        .eq('step_key', stepKey);

      if (error) {
        throw new Error(`Failed to update wizard data: ${error.message}`);
      }
    } else {
      // Insert new record
      const { error } = await supabase
        .from('wizard_data')
        .insert({
          user_id: userId,
          step_key: stepKey,
          data: updatedData,
        });

      if (error) {
        throw new Error(`Failed to insert wizard data: ${error.message}`);
      }
    }
  },

  async clearWizardData(userId: string): Promise<void> {
    const { error } = await supabase
      .from('wizard_data')
      .delete()
      .eq('user_id', userId);

    if (error) {
      throw new Error(`Failed to clear wizard data: ${error.message}`);
    }
  },

  mapStepKeyToProperty(stepKey: string): keyof SignupWizardData | null {
    const mapping: Record<string, keyof SignupWizardData> = {
      'account': 'accountInfo',
      'personal': 'personalInfo',
      'firm': 'firmInfo',
      'practice': 'practiceAreas',
      'team': 'teamSetup',
      'integrations': 'integrationPreferences',
      'compliance': 'compliance',
      'enterprise': 'enterprise',
    };

    return mapping[stepKey] || null;
  },

  mapPropertyToStepKey(property: keyof SignupWizardData): string {
    const mapping: Record<keyof SignupWizardData, string> = {
      accountInfo: 'account',
      personalInfo: 'personal',
      firmInfo: 'firm',
      practiceAreas: 'practice',
      teamSetup: 'team',
      integrationPreferences: 'integrations',
      compliance: 'compliance',
      enterprise: 'enterprise',
    };

    return mapping[property] || property;
  },

  validateStepData(stepKey: string, data: any): void {
    // Validate critical fields based on step
    switch (stepKey) {
      case 'firm':
        if (!data.firmName || !data.firmSize) {
          console.warn(`Incomplete firm data saved: missing ${!data.firmName ? 'firmName' : 'firmSize'}`, data);
        }
        break;
      case 'personal':
        if (!data.firstName || !data.lastName) {
          console.warn('Incomplete personal data saved: missing name fields', data);
        }
        break;
      case 'practice':
        if (!data.primaryPracticeAreas || data.primaryPracticeAreas.length === 0) {
          console.warn('Incomplete practice areas data: missing primary practice areas', data);
        }
        break;
      case 'compliance':
        if (data.riskAssessmentCompleted === undefined) {
          console.warn('Incomplete compliance data: missing risk assessment status', data);
        }
        break;
      case 'enterprise':
        if (!data.contactName || !data.contactEmail || !data.expectedUsers) {
          console.warn('Incomplete enterprise data: missing required contact/sizing info', data);
        }
        break;
    }
  },
};
