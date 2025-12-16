// FIXED: LEDES Types with proper serialization support

export type LEDESFormat = 'LEDES1998B' | 'LEDES2.0' | 'LEDESXML';
export type UTBMSActivityCode = 'L100' | 'L110' | 'L120' | 'L130' | 'L140' | 'L150' | 'L160' | 'L170' | 'L200' | 'L210' | 'L220' | 'L230' | 'L240' | 'L250' | 'L300' | 'L310' | 'L320' | 'L400' | 'L410' | 'L420' | 'L500' | 'L510' | 'L520' | 'L530';
export type UTBMSExpenseCode = 'E100' | 'E110' | 'E120' | 'E130' | 'E140' | 'E150' | 'E160' | 'E170' | 'E200' | 'E210' | 'E220' | 'E300';

// FIX: Replace Map with serializable object
export interface UTBMSMappingFixed {
  activityCodes: Record<string, UTBMSActivityCode>; // Instead of Map
  expenseCodes: Record<string, UTBMSExpenseCode>;   // Instead of Map
  taskCodes: Record<string, string>;               // Instead of Map
  matterCategories: Record<string, string>;        // Instead of Map
  defaultActivityCode: UTBMSActivityCode;
  defaultExpenseCode: UTBMSExpenseCode;
}

export interface LEDESConfigurationFixed {
  id: string;
  clientId: string;
  clientName: string;
  format: LEDESFormat;
  version: string;
  utbmsMapping: UTBMSMappingFixed; // Fixed type
  validationRules: LEDESValidationRule[];
  customFields: LEDESCustomField[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// FIX: Add proper validation schemas
export interface ValidationSchema {
  field: string;
  required: boolean;
  type: 'string' | 'number' | 'date' | 'currency';
  minValue?: number;
  maxValue?: number;
  pattern?: string;
  customValidator?: (value: any) => boolean;
}

// FIX: Add error boundary support
export interface LEDESError extends Error {
  code: string;
  severity: 'low' | 'medium' | 'high';
  context?: Record<string, any>;
  timestamp: string;
  userId?: string;
}

export interface LEDESValidationRule {
  id: string;
  field: string;
  ruleType: 'required' | 'format' | 'range' | 'custom';
  value: any;
  errorMessage: string;
  isActive: boolean;
  schema?: ValidationSchema; // Added validation schema
}

// Rest of interfaces remain the same...