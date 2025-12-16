import { useState, useCallback } from 'react';
import { 
  validateMatterForm, 
  checkDuplicateMatter, 
  validateAttorneyAssignment,
  isValidFutureDate,
  isValidBudget,
  NewMatterFormData
} from '@/lib/validations/matter';
import { NewMatterData } from '@/types/matter';

interface ValidationErrors {
  [key: string]: string | string[];
}

interface FormValidationResult {
  isValid: boolean;
  errors: ValidationErrors;
  data?: NewMatterFormData;
}

export const useMatterFormValidation = () => {
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [isValidating, setIsValidating] = useState(false);

  // Clear a specific field error
  const clearFieldError = useCallback((fieldName: string) => {
    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[fieldName];
      return newErrors;
    });
  }, []);

  // Clear all errors
  const clearErrors = useCallback(() => {
    setErrors({});
  }, []);

  // Validate a single field
  const validateField = useCallback(async (
    fieldName: string, 
    value: any, 
    formData?: Partial<NewMatterData>
  ): Promise<boolean> => {
    let fieldError: string | undefined;

    switch (fieldName) {
      case 'title':
        if (!value || typeof value !== 'string') {
          fieldError = 'Matter title is required';
        } else if (value.length > 200) {
          fieldError = 'Matter title must be less than 200 characters';
        } else if (formData?.clientId) {
          // Check for duplicate matter
          const isDuplicate = await checkDuplicateMatter(value, formData.clientId);
          if (isDuplicate) {
            fieldError = 'A matter with this title already exists for this client';
          }
        }
        break;

      case 'clientId':
        if (!value) {
          fieldError = 'Client selection is required';
        }
        break;

      case 'practiceArea':
        if (!value) {
          fieldError = 'Practice area is required';
        }
        break;

      case 'responsibleAttorneyId':
        if (!value) {
          fieldError = 'Responsible attorney is required';
        } else if (formData?.originatingAttorneyId) {
          const validation = validateAttorneyAssignment(value, formData.originatingAttorneyId);
          if (!validation.valid) {
            fieldError = validation.error;
          }
        }
        break;

      case 'originatingAttorneyId':
        if (value && formData?.responsibleAttorneyId) {
          const validation = validateAttorneyAssignment(formData.responsibleAttorneyId, value);
          if (!validation.valid) {
            fieldError = validation.error;
          }
        }
        break;

      case 'estimatedBudget':
        if (value !== undefined && value !== null && value !== '') {
          const numValue = Number(value);
          if (!isValidBudget(numValue)) {
            fieldError = 'Budget must be a positive number less than $100,000,000';
          }
        }
        break;

      case 'nextActionDate':
        if (value && !isValidFutureDate(value)) {
          fieldError = 'Next action date cannot be in the past';
        }
        break;

      case 'tags':
        if (Array.isArray(value)) {
          const tagErrors: string[] = [];
          value.forEach((tag, index) => {
            if (!tag || tag.trim().length === 0) {
              tagErrors.push(`Tag ${index + 1} cannot be empty`);
            } else if (tag.length > 50) {
              tagErrors.push(`Tag ${index + 1} must be less than 50 characters`);
            } else if (/<[^>]*>|javascript:|on\w+=/gi.test(tag)) {
              tagErrors.push(`Tag ${index + 1} contains invalid content`);
            }
          });
          if (tagErrors.length > 0) {
            fieldError = tagErrors.join(', ');
          }
        }
        break;

      case 'billingPreference':
        if (value && typeof value === 'object') {
          const { method, hourlyRate, flatFeeAmount, contingencyPercentage, retainerAmount } = value;
          
          switch (method) {
            case 'hourly':
              if (!hourlyRate || hourlyRate <= 0) {
                fieldError = 'Hourly rate is required for hourly billing';
              } else if (hourlyRate > 10000) {
                fieldError = 'Hourly rate must be less than $10,000';
              }
              break;
            case 'flat_fee':
              if (!flatFeeAmount || flatFeeAmount <= 0) {
                fieldError = 'Flat fee amount is required for flat fee billing';
              } else if (flatFeeAmount > 10000000) {
                fieldError = 'Flat fee amount must be less than $10,000,000';
              }
              break;
            case 'contingency':
              if (!contingencyPercentage || contingencyPercentage <= 0) {
                fieldError = 'Contingency percentage is required for contingency billing';
              } else if (contingencyPercentage > 100) {
                fieldError = 'Contingency percentage cannot exceed 100%';
              }
              break;
            case 'retainer':
              if (!retainerAmount || retainerAmount <= 0) {
                fieldError = 'Retainer amount is required for retainer billing';
              } else if (retainerAmount > 10000000) {
                fieldError = 'Retainer amount must be less than $10,000,000';
              }
              break;
          }
        }
        break;
    }

    if (fieldError) {
      setErrors(prev => ({ ...prev, [fieldName]: fieldError! }));
      return false;
    } else {
      clearFieldError(fieldName);
      return true;
    }
  }, [clearFieldError]);

  // Validate the entire form
  const validateForm = useCallback(async (formData: Partial<NewMatterData>): Promise<FormValidationResult> => {
    setIsValidating(true);
    
    try {
      // Use Zod schema for comprehensive validation
      const result = validateMatterForm(formData);
      
      if (!result.success) {
        const validationErrors: ValidationErrors = {};
        
        result.error.errors.forEach((error) => {
          const fieldName = error.path.join('.');
          if (!validationErrors[fieldName]) {
            validationErrors[fieldName] = error.message;
          }
        });
        
        setErrors(validationErrors);
        return { isValid: false, errors: validationErrors };
      }

      // Additional custom validations
      const customErrors: ValidationErrors = {};

      // Check for duplicate matter
      if (formData.title && formData.clientId) {
        const isDuplicate = await checkDuplicateMatter(formData.title, formData.clientId);
        if (isDuplicate) {
          customErrors.title = 'A matter with this title already exists for this client';
        }
      }

      // Validate attorney assignment
      if (formData.responsibleAttorneyId && formData.originatingAttorneyId) {
        const validation = validateAttorneyAssignment(
          formData.responsibleAttorneyId, 
          formData.originatingAttorneyId
        );
        if (!validation.valid) {
          customErrors.originatingAttorneyId = validation.error!;
        }
      }

      // Check for business logic errors
      if (formData.stage === 'closed' && formData.nextActionDate) {
        customErrors.nextActionDate = 'Closed matters should not have next action dates';
      }

      if (Object.keys(customErrors).length > 0) {
        setErrors(customErrors);
        return { isValid: false, errors: customErrors };
      }

      setErrors({});
      return { isValid: true, errors: {}, data: result.data };
      
    } catch (error) {
      console.error('Form validation error:', error);
      const errorMessage = 'Validation failed due to an unexpected error';
      setErrors({ form: errorMessage });
      return { isValid: false, errors: { form: errorMessage } };
    } finally {
      setIsValidating(false);
    }
  }, []);

  // Validate required fields only (for step-by-step validation)
  const validateRequiredFields = useCallback((formData: Partial<NewMatterData>): ValidationErrors => {
    const requiredErrors: ValidationErrors = {};

    if (!formData.title?.trim()) {
      requiredErrors.title = 'Matter title is required';
    }

    if (!formData.clientId) {
      requiredErrors.clientId = 'Client selection is required';
    }

    if (!formData.practiceArea) {
      requiredErrors.practiceArea = 'Practice area is required';
    }

    if (!formData.responsibleAttorneyId) {
      requiredErrors.responsibleAttorneyId = 'Responsible attorney is required';
    }

    setErrors(requiredErrors);
    return requiredErrors;
  }, []);

  // Check if form has any errors
  const hasErrors = useCallback((): boolean => {
    return Object.keys(errors).length > 0;
  }, [errors]);

  // Get error for a specific field
  const getFieldError = useCallback((fieldName: string): string | undefined => {
    const error = errors[fieldName];
    return Array.isArray(error) ? error[0] : error;
  }, [errors]);

  // Check if a specific field has an error
  const hasFieldError = useCallback((fieldName: string): boolean => {
    return fieldName in errors;
  }, [errors]);

  return {
    errors,
    isValidating,
    validateField,
    validateForm,
    validateRequiredFields,
    clearFieldError,
    clearErrors,
    hasErrors,
    getFieldError,
    hasFieldError
  };
};

export default useMatterFormValidation;