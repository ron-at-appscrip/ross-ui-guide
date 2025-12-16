import { useState, useCallback, useMemo } from 'react';

export interface ValidationRule {
  field: string;
  required?: boolean;
  type?: 'number' | 'currency' | 'string' | 'date';
  min?: number;
  max?: number;
  pattern?: RegExp;
  customValidator?: (value: any) => string | null;
}

export interface ValidationError {
  field: string;
  message: string;
  code: string;
}

export interface UseFinancialValidationOptions {
  rules: ValidationRule[];
  realTimeValidation?: boolean;
  sanitizeInput?: boolean;
}

export function useFinancialValidation({
  rules,
  realTimeValidation = true,
  sanitizeInput = true
}: UseFinancialValidationOptions) {
  const [errors, setErrors] = useState<ValidationError[]>([]);
  const [touchedFields, setTouchedFields] = useState<Set<string>>(new Set());

  // Create rule map for efficient lookup
  const ruleMap = useMemo(() => {
    const map = new Map<string, ValidationRule>();
    rules.forEach(rule => map.set(rule.field, rule));
    return map;
  }, [rules]);

  // Sanitize currency input
  const sanitizeCurrency = useCallback((value: string): number => {
    if (typeof value !== 'string') {
      throw new Error('Currency value must be a string');
    }

    // Remove currency symbols, commas, and whitespace
    const cleaned = value.replace(/[$,\s]/g, '');
    
    // Validate format
    if (!/^\d*\.?\d{0,2}$/.test(cleaned)) {
      throw new Error('Invalid currency format');
    }

    const num = parseFloat(cleaned) || 0;
    
    if (isNaN(num) || !isFinite(num)) {
      throw new Error('Invalid currency value');
    }

    // Round to 2 decimal places
    return Math.round(num * 100) / 100;
  }, []);

  // Sanitize numeric input
  const sanitizeNumber = useCallback((value: any): number => {
    const num = Number(value);
    
    if (isNaN(num) || !isFinite(num)) {
      throw new Error('Invalid numeric value');
    }

    return num;
  }, []);

  // Validate single field
  const validateField = useCallback((field: string, value: any): ValidationError[] => {
    const rule = ruleMap.get(field);
    if (!rule) return [];

    const fieldErrors: ValidationError[] = [];

    try {
      // Sanitize input if enabled
      let sanitizedValue = value;
      if (sanitizeInput) {
        if (rule.type === 'currency') {
          sanitizedValue = sanitizeCurrency(value);
        } else if (rule.type === 'number') {
          sanitizedValue = sanitizeNumber(value);
        }
      }

      // Required validation
      if (rule.required && (sanitizedValue === null || sanitizedValue === undefined || sanitizedValue === '')) {
        fieldErrors.push({
          field,
          message: `${field} is required`,
          code: 'REQUIRED'
        });
        return fieldErrors; // Don't continue if required field is empty
      }

      // Skip other validations if value is empty and not required
      if (!rule.required && (sanitizedValue === null || sanitizedValue === undefined || sanitizedValue === '')) {
        return fieldErrors;
      }

      // Type validation
      if (rule.type === 'currency' || rule.type === 'number') {
        const num = typeof sanitizedValue === 'number' ? sanitizedValue : Number(sanitizedValue);
        
        if (isNaN(num) || !isFinite(num)) {
          fieldErrors.push({
            field,
            message: `${field} must be a valid number`,
            code: 'INVALID_NUMBER'
          });
          return fieldErrors;
        }

        // Range validation for numbers
        if (rule.min !== undefined && num < rule.min) {
          fieldErrors.push({
            field,
            message: `${field} must be at least ${rule.min}`,
            code: 'MIN_VALUE'
          });
        }

        if (rule.max !== undefined && num > rule.max) {
          fieldErrors.push({
            field,
            message: `${field} must not exceed ${rule.max}`,
            code: 'MAX_VALUE'
          });
        }

        // Currency specific validations
        if (rule.type === 'currency') {
          if (num < 0) {
            fieldErrors.push({
              field,
              message: `${field} cannot be negative`,
              code: 'NEGATIVE_CURRENCY'
            });
          }

          if (num > 999999999.99) {
            fieldErrors.push({
              field,
              message: `${field} exceeds maximum allowed amount`,
              code: 'CURRENCY_TOO_LARGE'
            });
          }

          // Check decimal places
          const decimalPlaces = (num.toString().split('.')[1] || '').length;
          if (decimalPlaces > 2) {
            fieldErrors.push({
              field,
              message: `${field} cannot have more than 2 decimal places`,
              code: 'TOO_MANY_DECIMALS'
            });
          }
        }
      }

      // Pattern validation
      if (rule.pattern && typeof value === 'string' && !rule.pattern.test(value)) {
        fieldErrors.push({
          field,
          message: `${field} format is invalid`,
          code: 'INVALID_FORMAT'
        });
      }

      // Custom validation
      if (rule.customValidator) {
        const customError = rule.customValidator(sanitizedValue);
        if (customError) {
          fieldErrors.push({
            field,
            message: customError,
            code: 'CUSTOM_VALIDATION'
          });
        }
      }

    } catch (error) {
      fieldErrors.push({
        field,
        message: error instanceof Error ? error.message : 'Validation error',
        code: 'VALIDATION_ERROR'
      });
    }

    return fieldErrors;
  }, [ruleMap, sanitizeInput, sanitizeCurrency, sanitizeNumber]);

  // Validate all fields in data object
  const validateAll = useCallback((data: Record<string, any>): ValidationError[] => {
    const allErrors: ValidationError[] = [];

    rules.forEach(rule => {
      const fieldErrors = validateField(rule.field, data[rule.field]);
      allErrors.push(...fieldErrors);
    });

    setErrors(allErrors);
    return allErrors;
  }, [rules, validateField]);

  // Validate specific field and update errors
  const validate = useCallback((field: string, value: any) => {
    const fieldErrors = validateField(field, value);
    
    setErrors(prevErrors => {
      // Remove existing errors for this field
      const otherErrors = prevErrors.filter(error => error.field !== field);
      return [...otherErrors, ...fieldErrors];
    });

    // Mark field as touched
    setTouchedFields(prev => new Set(prev).add(field));

    return fieldErrors;
  }, [validateField]);

  // Handle input change with validation
  const handleChange = useCallback((field: string, value: any) => {
    if (realTimeValidation && touchedFields.has(field)) {
      validate(field, value);
    }
    return value;
  }, [realTimeValidation, touchedFields, validate]);

  // Handle input blur
  const handleBlur = useCallback((field: string, value: any) => {
    setTouchedFields(prev => new Set(prev).add(field));
    return validate(field, value);
  }, [validate]);

  // Clear errors for specific field
  const clearFieldError = useCallback((field: string) => {
    setErrors(prev => prev.filter(error => error.field !== field));
  }, []);

  // Clear all errors
  const clearAllErrors = useCallback(() => {
    setErrors([]);
    setTouchedFields(new Set());
  }, []);

  // Get errors for specific field
  const getFieldErrors = useCallback((field: string) => {
    return errors.filter(error => error.field === field);
  }, [errors]);

  // Check if form is valid
  const isValid = useMemo(() => errors.length === 0, [errors]);

  // Get first error message for a field
  const getFirstFieldError = useCallback((field: string) => {
    const fieldErrors = getFieldErrors(field);
    return fieldErrors.length > 0 ? fieldErrors[0].message : null;
  }, [getFieldErrors]);

  return {
    // Validation state
    errors,
    isValid,
    touchedFields: Array.from(touchedFields),
    
    // Validation methods
    validate,
    validateAll,
    validateField,
    
    // Utility methods
    sanitizeCurrency,
    sanitizeNumber,
    
    // Event handlers
    handleChange,
    handleBlur,
    
    // Error management
    clearFieldError,
    clearAllErrors,
    getFieldErrors,
    getFirstFieldError
  };
}