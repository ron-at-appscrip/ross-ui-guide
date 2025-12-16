
import { z } from 'zod';
import { isValidPhoneNumber } from 'libphonenumber-js';

// Step schemas
export const accountInfoSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/\d/, 'Password must contain at least one number'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export const personalInfoSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  phone: z.string()
    .optional()
    .refine((phone) => {
      if (!phone || phone.trim() === '') return true; // Allow empty phone
      return isValidPhoneNumber(phone);
    }, 'Please enter a valid phone number with country code'),
  timezone: z.string().min(1, 'Please select your timezone'),
  preferredLanguage: z.string().min(1, 'Please select your preferred language'),
});

export const firmInfoSchema = z.object({
  firmName: z.string().min(1, 'Firm name is required'),
  firmSize: z.string().min(1, 'Please select firm size'),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  zipCode: z.string().optional(),
  country: z.string().min(1, 'Please select your country'),
});

export const practiceAreasSchema = z.object({
  primaryPracticeAreas: z.array(z.string()).min(1, 'Please select at least one practice area'),
  secondaryPracticeAreas: z.array(z.string()).optional(),
  specializations: z.array(z.string()).optional(),
});

export const teamSetupSchema = z.object({
  role: z.string().min(1, 'Please select your role'),
  teamSize: z.string().min(1, 'Please select team size'),
  inviteEmails: z.array(z.object({
    email: z.string().email('Please enter a valid email address')
  })).default([]),
});

export const integrationPreferencesSchema = z.object({
  preferredIntegrations: z.array(z.string()).optional(),
  dataImportNeeded: z.boolean().optional(),
  migrationAssistance: z.boolean().optional(),
});

// New schemas for compliance and enterprise steps
export const complianceSchema = z.object({
  requiredCompliance: z.array(z.string()).min(1, 'Please select at least one compliance requirement'),
  dataRetentionPeriod: z.string().min(1, 'Please specify data retention period'),
  encryptionRequirements: z.array(z.string()).optional(),
  auditingFrequency: z.string().min(1, 'Please select auditing frequency'),
  riskAssessmentCompleted: z.boolean().refine(val => val === true, 'Risk assessment completion is required'),
  complianceOfficerEmail: z.string().email('Please enter a valid email address').optional(),
  additionalRequirements: z.string().optional(),
});

export const enterpriseSchema = z.object({
  dedicatedSupport: z.boolean().optional(),
  customIntegrations: z.array(z.string()).optional(),
  slaRequirements: z.string().optional(),
  dedicatedAccountManager: z.boolean().optional(),
  customBranding: z.boolean().optional(),
  apiAccess: z.boolean().optional(),
  whiteLabeling: z.boolean().optional(),
  priorityTraining: z.boolean().optional(),
  customReporting: z.array(z.string()).optional(),
  expectedUsers: z.string().min(1, 'Expected number of users is required'),
  goLiveDate: z.string().optional(),
  contactName: z.string().min(1, 'Primary contact name is required'),
  contactEmail: z.string().email('Please enter a valid email address'),
  contactPhone: z.string()
    .optional()
    .refine((phone) => {
      if (!phone || phone.trim() === '') return true; // Allow empty phone
      return isValidPhoneNumber(phone);
    }, 'Please enter a valid phone number with country code'),
});

// Combined schema for the entire wizard
export const signupWizardSchema = z.object({
  accountInfo: accountInfoSchema,
  personalInfo: personalInfoSchema,
  firmInfo: firmInfoSchema,
  practiceAreas: practiceAreasSchema,
  teamSetup: teamSetupSchema,
  integrationPreferences: integrationPreferencesSchema,
  compliance: complianceSchema,
  enterprise: enterpriseSchema,
});

export type AccountInfoData = z.infer<typeof accountInfoSchema>;
export type PersonalInfoData = z.infer<typeof personalInfoSchema>;
export type FirmInfoData = z.infer<typeof firmInfoSchema>;
export type PracticeAreasData = z.infer<typeof practiceAreasSchema>;
export type TeamSetupData = z.infer<typeof teamSetupSchema>;
export type IntegrationPreferencesData = z.infer<typeof integrationPreferencesSchema>;
export type ComplianceData = z.infer<typeof complianceSchema>;
export type EnterpriseData = z.infer<typeof enterpriseSchema>;
export type SignupWizardData = z.infer<typeof signupWizardSchema>;

export interface WizardStep {
  id: string;
  title: string;
  description: string;
  component: React.ComponentType<any>;
  isOptional?: boolean;
}
