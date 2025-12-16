import { useState, useCallback } from 'react';
import { z } from 'zod';
import { 
  newClientDataSchema, 
  validateEmail, 
  validatePhone, 
  validateUrl,
  validateTag,
  checkDuplicateEmail,
  checkDuplicatePhone
} from '@/lib/validations/client';
import { NewClientData, ContactMethod, Address, Website } from '@/types/client';

interface ValidationErrors {
  name?: string;
  emails?: Record<string, string>;
  phones?: Record<string, string>;
  addresses?: Record<string, Record<string, string>>;
  websites?: Record<string, string>;
  tags?: string;
  notes?: string;
  personDetails?: Record<string, string>;
  companyDetails?: Record<string, string>;
}

interface UseClientFormValidationProps {
  checkDuplicates?: boolean;
}

export const useClientFormValidation = ({ checkDuplicates = false }: UseClientFormValidationProps = {}) => {
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [isValidating, setIsValidating] = useState(false);

  // Validate individual email
  const validateEmailField = useCallback(async (email: ContactMethod): Promise<string | null> => {
    if (!email.value) return 'Email is required';
    if (!validateEmail(email.value)) return 'Invalid email format';
    
    if (checkDuplicates) {
      const isDuplicate = await checkDuplicateEmail(email.value);
      if (isDuplicate) return 'This email already exists for another client';
    }
    
    return null;
  }, [checkDuplicates]);

  // Validate individual phone
  const validatePhoneField = useCallback(async (phone: ContactMethod): Promise<string | null> => {
    if (!phone.value) return null; // Phone is optional
    if (!validatePhone(phone.value)) return 'Invalid phone number format';
    
    if (checkDuplicates) {
      const isDuplicate = await checkDuplicatePhone(phone.value);
      if (isDuplicate) return 'This phone number already exists for another client';
    }
    
    return null;
  }, [checkDuplicates]);

  // Validate individual website
  const validateWebsiteField = useCallback((website: Website): string | null => {
    if (!website.url) return null; // Website is optional
    if (!validateUrl(website.url)) return 'Invalid URL format (include http:// or https://)';
    return null;
  }, []);

  // Validate individual address
  const validateAddressField = useCallback((address: Address): Record<string, string> => {
    const addressErrors: Record<string, string> = {};
    
    if (!address.street1) addressErrors.street1 = 'Street address is required';
    if (!address.city) addressErrors.city = 'City is required';
    if (!address.state) addressErrors.state = 'State is required';
    if (!address.postalCode) addressErrors.postalCode = 'Postal code is required';
    
    return addressErrors;
  }, []);

  // Validate tag
  const validateTagField = useCallback((tag: string): string | null => {
    return validateTag(tag);
  }, []);

  // Validate entire form
  const validateForm = useCallback(async (data: NewClientData): Promise<boolean> => {
    setIsValidating(true);
    const newErrors: ValidationErrors = {};

    try {
      // Use Zod schema for overall validation
      await newClientDataSchema.parseAsync(data);
      
      // Additional async validations
      if (checkDuplicates) {
        // Check for duplicate emails
        const emailErrors: Record<string, string> = {};
        for (const email of data.emails) {
          const error = await validateEmailField(email);
          if (error) emailErrors[email.id] = error;
        }
        if (Object.keys(emailErrors).length > 0) {
          newErrors.emails = emailErrors;
        }

        // Check for duplicate phones
        const phoneErrors: Record<string, string> = {};
        for (const phone of data.phones) {
          const error = await validatePhoneField(phone);
          if (error) phoneErrors[phone.id] = error;
        }
        if (Object.keys(phoneErrors).length > 0) {
          newErrors.phones = phoneErrors;
        }
      }

      setErrors(newErrors);
      return Object.keys(newErrors).length === 0;
    } catch (error) {
      if (error instanceof z.ZodError) {
        // Convert Zod errors to our error format
        error.errors.forEach((err) => {
          const path = err.path.join('.');
          
          if (path.startsWith('emails')) {
            const index = parseInt(err.path[1] as string);
            if (!newErrors.emails) newErrors.emails = {};
            newErrors.emails[data.emails[index]?.id || index.toString()] = err.message;
          } else if (path.startsWith('phones')) {
            const index = parseInt(err.path[1] as string);
            if (!newErrors.phones) newErrors.phones = {};
            newErrors.phones[data.phones[index]?.id || index.toString()] = err.message;
          } else if (path.startsWith('addresses')) {
            const index = parseInt(err.path[1] as string);
            const field = err.path[2] as string;
            if (!newErrors.addresses) newErrors.addresses = {};
            if (!newErrors.addresses[data.addresses[index]?.id || index.toString()]) {
              newErrors.addresses[data.addresses[index]?.id || index.toString()] = {};
            }
            newErrors.addresses[data.addresses[index]?.id || index.toString()][field] = err.message;
          } else if (path.startsWith('personDetails')) {
            if (!newErrors.personDetails) newErrors.personDetails = {};
            newErrors.personDetails[err.path[1] as string] = err.message;
          } else if (path.startsWith('companyDetails')) {
            if (!newErrors.companyDetails) newErrors.companyDetails = {};
            newErrors.companyDetails[err.path[1] as string] = err.message;
          } else if (path === 'name') {
            newErrors.name = err.message;
          } else if (path === 'notes') {
            newErrors.notes = err.message;
          }
        });
      }
      
      setErrors(newErrors);
      return false;
    } finally {
      setIsValidating(false);
    }
  }, [checkDuplicates, validateEmailField, validatePhoneField]);

  // Clear specific error
  const clearError = useCallback((field: string, id?: string) => {
    setErrors(prev => {
      const newErrors = { ...prev };
      
      if (id) {
        // Clear specific item error (e.g., emails.id123)
        if (newErrors[field as keyof ValidationErrors]) {
          const fieldErrors = { ...(newErrors[field as keyof ValidationErrors] as any) };
          delete fieldErrors[id];
          if (Object.keys(fieldErrors).length === 0) {
            delete newErrors[field as keyof ValidationErrors];
          } else {
            (newErrors as any)[field] = fieldErrors;
          }
        }
      } else {
        // Clear entire field error
        delete newErrors[field as keyof ValidationErrors];
      }
      
      return newErrors;
    });
  }, []);

  // Clear all errors
  const clearAllErrors = useCallback(() => {
    setErrors({});
  }, []);

  return {
    errors,
    isValidating,
    validateForm,
    validateEmailField,
    validatePhoneField,
    validateWebsiteField,
    validateAddressField,
    validateTagField,
    clearError,
    clearAllErrors
  };
};