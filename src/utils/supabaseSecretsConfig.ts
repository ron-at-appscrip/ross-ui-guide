/**
 * Supabase Secrets Configuration Utility
 * 
 * This utility helps configure Supabase Edge Function secrets for the email service.
 * It provides methods to check, set, and validate secrets required for Resend integration.
 */

import { supabase } from '@/integrations/supabase/client';

export interface SecretConfig {
  key: string;
  description: string;
  required: boolean;
  pattern?: RegExp;
  example?: string;
  validationMessage?: string;
}

export interface SecretsValidationResult {
  isValid: boolean;
  missingSecrets: string[];
  invalidSecrets: Array<{ key: string; reason: string }>;
  warnings: string[];
}

export class SupabaseSecretsManager {
  private readonly REQUIRED_SECRETS: SecretConfig[] = [
    {
      key: 'RESEND_API_KEY',
      description: 'Resend API key for sending emails',
      required: true,
      pattern: /^re_[a-zA-Z0-9]{32,}$/,
      example: 're_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
      validationMessage: 'Must start with "re_" followed by at least 32 characters'
    },
    {
      key: 'RESEND_FROM_EMAIL',
      description: 'Default sender email address (optional)',
      required: false,
      pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
      example: 'noreply@yourdomain.com',
      validationMessage: 'Must be a valid email address'
    },
    {
      key: 'EMAIL_WEBHOOK_SECRET',
      description: 'Webhook secret for email status updates (optional)',
      required: false,
      pattern: /^[a-zA-Z0-9]{16,}$/,
      example: 'your_webhook_secret_here',
      validationMessage: 'Must be at least 16 characters long'
    }
  ];

  /**
   * Generate CLI commands for setting Supabase secrets
   */
  generateSetupCommands(secrets: Record<string, string>): string[] {
    const commands: string[] = [];
    
    // Add header comment
    commands.push('# Supabase Email Service Configuration');
    commands.push('# Run these commands in your terminal where Supabase CLI is available');
    commands.push('');

    // Generate individual secret commands
    for (const [key, value] of Object.entries(secrets)) {
      if (value && value.trim()) {
        commands.push(`supabase secrets set ${key}="${value}"`);
      }
    }

    // Add deployment commands
    commands.push('');
    commands.push('# Deploy Edge Functions after setting secrets');
    commands.push('supabase functions deploy send-email --no-verify-jwt');
    commands.push('supabase functions deploy send-invoice-email --no-verify-jwt');
    commands.push('supabase functions deploy send-client-communication --no-verify-jwt');

    return commands;
  }

  /**
   * Generate environment file content for local development
   */
  generateEnvFile(secrets: Record<string, string>): string {
    const envLines: string[] = [];
    
    envLines.push('# Email Service Configuration');
    envLines.push('# Add these to your .env file for local development');
    envLines.push('');

    for (const [key, value] of Object.entries(secrets)) {
      if (value && value.trim()) {
        envLines.push(`${key}="${value}"`);
      }
    }

    return envLines.join('\n');
  }

  /**
   * Validate secret values against patterns
   */
  validateSecrets(secrets: Record<string, string>): SecretsValidationResult {
    const result: SecretsValidationResult = {
      isValid: true,
      missingSecrets: [],
      invalidSecrets: [],
      warnings: []
    };

    for (const config of this.REQUIRED_SECRETS) {
      const value = secrets[config.key];

      // Check for missing required secrets
      if (config.required && (!value || !value.trim())) {
        result.missingSecrets.push(config.key);
        result.isValid = false;
        continue;
      }

      // Skip validation for empty optional secrets
      if (!value || !value.trim()) {
        continue;
      }

      // Validate pattern if provided
      if (config.pattern && !config.pattern.test(value)) {
        result.invalidSecrets.push({
          key: config.key,
          reason: config.validationMessage || 'Invalid format'
        });
        result.isValid = false;
      }
    }

    // Add warnings for best practices
    if (!secrets.RESEND_FROM_EMAIL) {
      result.warnings.push('Consider setting RESEND_FROM_EMAIL for consistent sender address');
    }

    if (!secrets.EMAIL_WEBHOOK_SECRET) {
      result.warnings.push('Consider setting EMAIL_WEBHOOK_SECRET for enhanced email tracking');
    }

    return result;
  }

  /**
   * Test connection to Supabase Edge Functions
   */
  async testEdgeFunctionConnection(): Promise<{
    success: boolean;
    functions: Array<{
      name: string;
      deployed: boolean;
      hasSecrets: boolean;
      error?: string;
    }>;
  }> {
    const functions = [
      'send-email',
      'send-invoice-email', 
      'send-client-communication'
    ];

    const results = await Promise.all(
      functions.map(async (functionName) => {
        try {
          const { data, error } = await supabase.functions.invoke(functionName, {
            body: { test: true, checkSecrets: true }
          });

          if (error) {
            return {
              name: functionName,
              deployed: false,
              hasSecrets: false,
              error: error.message
            };
          }

          return {
            name: functionName,
            deployed: true,
            hasSecrets: data?.secretsConfigured || false
          };
        } catch (error) {
          return {
            name: functionName,
            deployed: false,
            hasSecrets: false,
            error: error instanceof Error ? error.message : 'Unknown error'
          };
        }
      })
    );

    return {
      success: results.every(r => r.deployed),
      functions: results
    };
  }

  /**
   * Generate a secure webhook secret
   */
  generateWebhookSecret(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < 32; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  /**
   * Get configuration template with current values
   */
  getConfigurationTemplate(): Record<string, { value: string; config: SecretConfig }> {
    const template: Record<string, { value: string; config: SecretConfig }> = {};
    
    for (const config of this.REQUIRED_SECRETS) {
      template[config.key] = {
        value: '',
        config
      };
    }

    return template;
  }

  /**
   * Check if secrets are properly configured by testing Edge Functions
   */
  async checkSecretsConfiguration(): Promise<{
    configured: boolean;
    details: {
      apiKeyConfigured: boolean;
      functionsDeployed: boolean;
      connectivityOk: boolean;
    };
    errors: string[];
  }> {
    const errors: string[] = [];
    let apiKeyConfigured = false;
    let functionsDeployed = false;
    let connectivityOk = false;

    try {
      // Test basic connectivity
      const { data: healthCheck, error: healthError } = await supabase.functions.invoke('send-email', {
        body: { health_check: true }
      });

      if (!healthError) {
        connectivityOk = true;
        functionsDeployed = true;

        // Check if API key is configured
        if (healthCheck?.resend_configured) {
          apiKeyConfigured = true;
        } else {
          errors.push('Resend API key not configured in Edge Functions');
        }
      } else {
        if (healthError.message?.includes('Function not found')) {
          errors.push('Edge Functions not deployed');
        } else if (healthError.message?.includes('RESEND_API_KEY')) {
          functionsDeployed = true;
          errors.push('Resend API key missing or invalid');
        } else {
          errors.push(`Edge Function error: ${healthError.message}`);
        }
      }
    } catch (error) {
      errors.push(`Connection error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    return {
      configured: apiKeyConfigured && functionsDeployed && connectivityOk,
      details: {
        apiKeyConfigured,
        functionsDeployed,
        connectivityOk
      },
      errors
    };
  }

  /**
   * Get setup instructions based on current configuration state
   */
  async getSetupInstructions(): Promise<{
    currentStep: number;
    totalSteps: number;
    instructions: Array<{
      step: number;
      title: string;
      description: string;
      completed: boolean;
      commands?: string[];
      links?: Array<{ text: string; url: string }>;
    }>;
  }> {
    const configCheck = await this.checkSecretsConfiguration();
    
    const instructions = [
      {
        step: 1,
        title: 'Create Resend Account',
        description: 'Sign up for Resend and generate an API key',
        completed: false, // This needs to be checked manually
        links: [
          { text: 'Resend Signup', url: 'https://resend.com/signup' },
          { text: 'API Keys', url: 'https://resend.com/api-keys' }
        ]
      },
      {
        step: 2,
        title: 'Configure Domain',
        description: 'Add and verify your sending domain in Resend',
        completed: false, // This needs to be checked manually
        links: [
          { text: 'Domain Setup', url: 'https://resend.com/domains' }
        ]
      },
      {
        step: 3,
        title: 'Set Supabase Secrets',
        description: 'Configure API keys in Supabase Edge Functions',
        completed: configCheck.details.apiKeyConfigured,
        commands: [
          'supabase secrets set RESEND_API_KEY="your_api_key_here"',
          'supabase secrets set RESEND_FROM_EMAIL="noreply@yourdomain.com"'
        ]
      },
      {
        step: 4,
        title: 'Deploy Edge Functions',
        description: 'Deploy email functions to Supabase',
        completed: configCheck.details.functionsDeployed,
        commands: [
          'supabase functions deploy send-email --no-verify-jwt',
          'supabase functions deploy send-invoice-email --no-verify-jwt',
          'supabase functions deploy send-client-communication --no-verify-jwt'
        ]
      },
      {
        step: 5,
        title: 'Test Configuration',
        description: 'Verify email sending functionality',
        completed: configCheck.configured,
        commands: [
          '# Use the email composer in the application to send a test email'
        ]
      }
    ];

    // Determine current step (first incomplete step)
    const currentStep = instructions.findIndex(instruction => !instruction.completed) + 1;

    return {
      currentStep: currentStep > 0 ? currentStep : instructions.length,
      totalSteps: instructions.length,
      instructions
    };
  }

  /**
   * Export configuration for sharing or backup
   */
  exportConfiguration(secrets: Record<string, string>, includeSecrets: boolean = false): {
    timestamp: string;
    mode: 'production' | 'development';
    secrets: Record<string, string | string>;
    setupCommands: string[];
    envFile: string;
  } {
    const safeSecrets: Record<string, string> = {};
    
    for (const [key, value] of Object.entries(secrets)) {
      if (includeSecrets) {
        safeSecrets[key] = value;
      } else {
        // Mask secrets for safe sharing
        safeSecrets[key] = value ? `${value.substring(0, 8)}...` : '';
      }
    }

    return {
      timestamp: new Date().toISOString(),
      mode: secrets.RESEND_API_KEY ? 'production' : 'development',
      secrets: safeSecrets,
      setupCommands: this.generateSetupCommands(secrets),
      envFile: this.generateEnvFile(secrets)
    };
  }
}

// Singleton instance
export const supabaseSecretsManager = new SupabaseSecretsManager();