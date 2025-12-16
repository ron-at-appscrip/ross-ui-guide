import { z } from 'zod';
import ClientService from '@/services/clientService';

// Helper functions
const isValidEmail = (email: string) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const isValidPhoneNumber = (phone: string) => {
  // E.164 format validation (e.g., +1234567890)
  const phoneRegex = /^\+?[1-9]\d{1,14}$/;
  return phoneRegex.test(phone.replace(/[\s\-\(\)]/g, ''));
};

const isValidUrl = (url: string) => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

// Contact method schema
export const contactMethodSchema = z.object({
  id: z.string(),
  type: z.string(),
  value: z.string().min(1, 'Contact value is required'),
  label: z.string().optional(),
  isPrimary: z.boolean().default(false)
});

// Email schema with validation
export const emailSchema = contactMethodSchema.extend({
  value: z.string()
    .min(1, 'Email is required')
    .refine(isValidEmail, 'Invalid email format')
});

// Phone schema with validation
export const phoneSchema = contactMethodSchema.extend({
  value: z.string()
    .min(1, 'Phone number is required')
    .refine(isValidPhoneNumber, 'Invalid phone number format')
});

// Address schema
export const addressSchema = z.object({
  id: z.string(),
  type: z.string(),
  street1: z.string().min(1, 'Street address is required'),
  street2: z.string().optional(),
  city: z.string().min(1, 'City is required'),
  state: z.string().min(1, 'State is required'),
  postalCode: z.string().min(1, 'Postal code is required'),
  country: z.string().default('United States'),
  isPrimary: z.boolean().default(false)
});

// Website schema
export const websiteSchema = z.object({
  id: z.string(),
  type: z.string(),
  url: z.string()
    .min(1, 'Website URL is required')
    .refine(isValidUrl, 'Invalid URL format'),
  label: z.string().optional()
});

// Person details schema
export const personDetailsSchema = z.object({
  prefix: z.string().optional(),
  firstName: z.string().min(1, 'First name is required'),
  middleName: z.string().optional(),
  lastName: z.string().min(1, 'Last name is required'),
  suffix: z.string().optional(),
  preferredName: z.string().optional(),
  birthday: z.string()
    .optional()
    .refine((date) => {
      if (!date) return true;
      const birthDate = new Date(date);
      const today = new Date();
      return birthDate <= today;
    }, 'Birthday cannot be in the future')
});

// Company details schema  
export const companyDetailsSchema = z.object({
  legalName: z.string().min(1, 'Legal name is required'),
  tradingName: z.string().optional(),
  registrationNumber: z.string().optional(),
  taxId: z.string().optional(),
  industry: z.string().optional(),
  founded: z.string().optional()
});

// Tag validation
export const tagSchema = z.string()
  .min(1, 'Tag cannot be empty')
  .max(50, 'Tag must be less than 50 characters')
  .refine((tag) => {
    // Prevent HTML/script injection
    const dangerousPatterns = /<[^>]*>|javascript:|on\w+=/gi;
    return !dangerousPatterns.test(tag);
  }, 'Invalid tag content');

// Base client schema (common fields)
const baseClientSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  emails: z.array(emailSchema).min(1, 'At least one email is required'),
  phones: z.array(phoneSchema).optional().default([]),
  addresses: z.array(addressSchema).optional().default([]),
  websites: z.array(websiteSchema).optional().default([]),
  tags: z.array(tagSchema).optional().default([]),
  notes: z.string()
    .optional()
    .refine((notes) => {
      if (!notes) return true;
      // Basic XSS prevention for notes
      const dangerousPatterns = /<script|javascript:|on\w+=/gi;
      return !dangerousPatterns.test(notes);
    }, 'Invalid content in notes'),
  profilePhotoUrl: z.string().optional()
});

// Person client schema
export const personClientSchema = baseClientSchema.extend({
  type: z.literal('person'),
  personDetails: personDetailsSchema,
  companyDetails: z.undefined()
});

// Company client schema
export const companyClientSchema = baseClientSchema.extend({
  type: z.literal('company'),
  companyDetails: companyDetailsSchema,
  personDetails: z.undefined()
});

// Union schema for client data
export const newClientDataSchema = z.discriminatedUnion('type', [
  personClientSchema,
  companyClientSchema
]);

// Validation helper functions
export const validateEmail = (email: string): boolean => {
  return isValidEmail(email);
};

export const validatePhone = (phone: string): boolean => {
  return isValidPhoneNumber(phone);
};

export const validateUrl = (url: string): boolean => {
  return isValidUrl(url);
};

export const validateTag = (tag: string): string | null => {
  try {
    tagSchema.parse(tag);
    return null;
  } catch (error) {
    if (error instanceof z.ZodError) {
      return error.errors[0].message;
    }
    return 'Invalid tag';
  }
};

// Check for duplicate emails across clients
export const checkDuplicateEmail = async (email: string, excludeClientId?: string): Promise<boolean> => {
  try {
    return await ClientService.checkDuplicateEmail(email, excludeClientId);
  } catch (error) {
    console.error('Error checking duplicate email:', error);
    return false; // Don't block on error
  }
};

// Check for duplicate phone numbers across clients  
export const checkDuplicatePhone = async (phone: string, excludeClientId?: string): Promise<boolean> => {
  try {
    return await ClientService.checkDuplicatePhone(phone, excludeClientId);
  } catch (error) {
    console.error('Error checking duplicate phone:', error);
    return false; // Don't block on error
  }
};