
export type FirmSize = 'solo' | 'small' | 'mid-large' | 'enterprise';

export const FIRM_SIZE_OPTIONS = [
  { value: 'solo', label: 'Solo Practitioner' },
  { value: 'small', label: 'Small Firm (2-10 attorneys)' },
  { value: 'mid-large', label: 'Mid-Size/Large Firm (11-100 attorneys)' },
  { value: 'enterprise', label: 'Enterprise Firm (100+ attorneys)' },
] as const;

export const FIRM_SIZE_CONFIGS = {
  solo: {
    label: 'Solo Practitioner',
    features: ['basic_ai', 'document_management', 'time_tracking'],
    maxTeamSize: 1,
    requiresCompliance: false,
    requiresIntegrations: false,
  },
  small: {
    label: 'Small Firm',
    features: ['basic_ai', 'document_management', 'time_tracking', 'client_management', 'team_collaboration'],
    maxTeamSize: 10,
    requiresCompliance: false,
    requiresIntegrations: true,
  },
  'mid-large': {
    label: 'Mid-Size/Large Firm',
    features: ['advanced_ai', 'document_management', 'time_tracking', 'client_management', 'team_collaboration', 'analytics', 'workflow_automation'],
    maxTeamSize: 100,
    requiresCompliance: true,
    requiresIntegrations: true,
  },
  enterprise: {
    label: 'Enterprise Firm',
    features: ['enterprise_ai', 'document_management', 'time_tracking', 'client_management', 'team_collaboration', 'analytics', 'workflow_automation', 'compliance_management', 'custom_integrations', 'dedicated_support'],
    maxTeamSize: null, // Unlimited
    requiresCompliance: true,
    requiresIntegrations: true,
  },
} as const;
