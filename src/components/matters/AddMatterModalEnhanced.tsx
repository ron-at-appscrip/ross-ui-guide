import React, { useState, useEffect, useCallback } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Checkbox } from '@/components/ui/checkbox';
import { Switch } from '@/components/ui/switch';
import { 
  X, Plus, ChevronDown, ChevronUp, Calendar, DollarSign, Users, Bell, 
  Shield, FileText, CheckSquare, Folder, BarChart, Info, ClipboardList, AlertCircle
} from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import FieldHelper from '@/components/ui/field-helper';
import { generateMockMatterForEdit, commonDropdownOptions, mockMatterBase } from '@/data/matter-mock-data';
import { 
  NewMatterData, MatterPriority, MatterStage, MatterTemplate, CustomField,
  NotificationSettings, BillingPreference, MatterPermissions, RelatedContact,
  TaskList, DocumentFolder
} from '@/types/matter';
import { Client } from '@/types/client';
import { useMatterFormValidation } from '@/hooks/useMatterFormValidation';
import { generateMatterNumber, sanitizeString } from '@/lib/validations/matter';
import { useToast } from '@/hooks/use-toast';

interface AddMatterModalEnhancedProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: NewMatterData) => void;
  clients: Client[];
  selectedClientId?: string;
}

// Mock data for dropdowns
const matterTemplates: MatterTemplate[] = [
  {
    id: '1',
    name: 'Corporate M&A',
    description: 'Merger and acquisition template with due diligence checklist',
    practiceArea: 'Corporate Law',
    defaultFields: {},
    customFields: [],
    taskLists: [],
    documentFolders: []
  },
  {
    id: '2', 
    name: 'Employment Dispute',
    description: 'Employment law dispute template with HR documentation',
    practiceArea: 'Employment Law',
    defaultFields: {},
    customFields: [],
    taskLists: [],
    documentFolders: []
  },
  {
    id: '3',
    name: 'Real Estate Purchase',
    description: 'Commercial real estate purchase agreement template',
    practiceArea: 'Real Estate Law',
    defaultFields: {},
    customFields: [],
    taskLists: [],
    documentFolders: []
  }
];

const practiceAreas = [
  { value: 'Corporate Law', subAreas: ['M&A', 'Securities', 'Compliance', 'Contracts'] },
  { value: 'Litigation', subAreas: ['Civil Litigation', 'Commercial Disputes', 'Employment Disputes'] },
  { value: 'Employment Law', subAreas: ['Workplace Disputes', 'HR Compliance', 'Wage & Hour'] },
  { value: 'Intellectual Property', subAreas: ['Patents', 'Trademarks', 'Copyrights', 'Trade Secrets'] },
  { value: 'Real Estate Law', subAreas: ['Commercial', 'Residential', 'Development', 'Leasing'] },
  { value: 'Family Law', subAreas: ['Divorce', 'Custody', 'Adoption', 'Domestic Relations'] },
  { value: 'Criminal Law', subAreas: ['Felony Defense', 'Misdemeanor', 'DUI', 'White Collar'] },
  { value: 'Tax Law', subAreas: ['Corporate Tax', 'Individual Tax', 'Tax Disputes', 'Estate Tax'] },
  { value: 'Immigration Law', subAreas: ['Business Immigration', 'Family Immigration', 'Deportation Defense'] }
];

const attorneys = [
  { id: '1', name: 'Sarah Johnson', title: 'Partner' },
  { id: '2', name: 'Michael Chen', title: 'Senior Associate' },
  { id: '3', name: 'Emily Rodriguez', title: 'Associate' },
  { id: '4', name: 'David Wilson', title: 'Partner' },
  { id: '5', name: 'Jessica Brown', title: 'Senior Associate' },
  { id: '6', name: 'Lisa Park', title: 'Associate' }
];

const staff = [
  { id: '1', name: 'Jennifer Adams', role: 'Paralegal' },
  { id: '2', name: 'Robert Taylor', role: 'Legal Assistant' },
  { id: '3', name: 'Maria Garcia', role: 'Paralegal' },
  { id: '4', name: 'James Wilson', role: 'Legal Secretary' }
];

const matterStages: { value: MatterStage; label: string }[] = [
  { value: 'open', label: 'Open' },
  { value: 'discovery', label: 'Discovery' },
  { value: 'mediation', label: 'Mediation' },
  { value: 'trial', label: 'Trial' },
  { value: 'settlement', label: 'Settlement' },
  { value: 'appeal', label: 'Appeal' },
  { value: 'closed', label: 'Closed' }
];

const relationshipTypes = [
  { value: 'expert_witness', label: 'Expert Witness' },
  { value: 'consultant', label: 'Consultant' },
  { value: 'opposing_counsel', label: 'Opposing Counsel' },
  { value: 'court_reporter', label: 'Court Reporter' },
  { value: 'other', label: 'Other' }
];

const AddMatterModalEnhanced = ({ open, onClose, onSubmit, clients, selectedClientId }: AddMatterModalEnhancedProps) => {
  const { toast } = useToast();
  const {
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
  } = useMatterFormValidation();

  // Initialize form data with complete defaults matching schema requirements
  const getInitialFormData = useCallback((): Partial<NewMatterData> => ({
    title: '',
    description: '',
    clientId: selectedClientId || '',
    priority: 'medium' as MatterPriority,
    stage: 'open' as MatterStage,
    practiceArea: '',
    practiceSubArea: '',
    responsibleAttorney: '',
    responsibleAttorneyId: '',
    originatingAttorney: '',
    originatingAttorneyId: '',
    responsibleStaff: [],
    responsibleStaffIds: [],
    estimatedBudget: undefined,
    nextActionDate: '',
    tags: [],
    notes: '',
    matterNumber: '',
    templateId: '',
    customFields: {},
    notificationSettings: {
      email: true,
      sms: false,
      deadlineReminders: true,
      clientNotifications: true,
      taskNotifications: true
    },
    billingPreference: {
      method: 'hourly' as const,
      hourlyRate: undefined,
      flatFeeAmount: undefined,
      contingencyPercentage: undefined,
      retainerAmount: undefined,
      expenseTracking: true
    },
    permissions: {
      fileAccess: 'full' as const,
      clientPortalAccess: true,
      documentSharing: true,
      allowedUsers: []
    },
    relatedContacts: [],
    taskLists: [],
    documentFolders: []
  }), [selectedClientId]);

  const [formData, setFormData] = useState<Partial<NewMatterData>>(getInitialFormData());
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Section collapse states
  const [collapsedSections, setCollapsedSections] = useState<{ [key: string]: boolean }>({
    template: false,
    details: false,
    permissions: true,
    notifications: true,
    contacts: true,
    customFields: true,
    billing: true,
    tasks: true,
    documents: true
  });

  const [newTag, setNewTag] = useState('');
  const [selectedPracticeArea, setSelectedPracticeArea] = useState('');

  const toggleSection = (section: string) => {
    setCollapsedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  // Reset form when modal opens/closes or selectedClientId changes
  useEffect(() => {
    if (open) {
      const initialData = getInitialFormData();
      setFormData(initialData);
      clearErrors();
      setSelectedPracticeArea('');
      setNewTag('');
    }
  }, [open, getInitialFormData, clearErrors]);

  // Update clientId in form when selectedClientId prop changes
  useEffect(() => {
    if (selectedClientId && open) {
      setFormData(prev => ({
        ...prev,
        clientId: selectedClientId
      }));
    }
  }, [selectedClientId, open]);

  // Comprehensive form reset function
  const resetForm = useCallback(async () => {
    const initialData = getInitialFormData();
    setFormData(initialData);
    clearErrors();
    setSelectedPracticeArea('');
    setNewTag('');
    setNewCustomField({
      name: '',
      type: 'text',
      required: false,
      helpText: ''
    });
    setCollapsedSections({
      template: false,
      details: false,
      permissions: true,
      notifications: true,
      contacts: true,
      customFields: true,
      billing: true,
      tasks: true,
      documents: true
    });
  }, [getInitialFormData, clearErrors]);

  // Handle form field changes with validation
  const handleFieldChange = useCallback(async (
    fieldName: string, 
    value: any, 
    shouldValidate: boolean = false
  ) => {
    // Sanitize string inputs
    const sanitizedValue = typeof value === 'string' ? sanitizeString(value) : value;
    
    const newFormData = { ...formData, [fieldName]: sanitizedValue };
    setFormData(newFormData);

    // Clear previous error when user starts typing
    if (hasFieldError(fieldName)) {
      clearFieldError(fieldName);
    }

    // Validate field if requested (on blur or for critical fields)
    if (shouldValidate) {
      await validateField(fieldName, sanitizedValue, newFormData);
    }
  }, [formData, hasFieldError, clearFieldError, validateField]);

  // Handle form submission with comprehensive validation
  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // First check required fields
      const requiredErrors = validateRequiredFields(formData);
      if (Object.keys(requiredErrors).length > 0) {
        toast({
          title: "Validation Error",
          description: "Please fill in all required fields.",
          variant: "destructive",
        });
        setIsSubmitting(false);
        return;
      }

      // Comprehensive form validation
      const validationResult = await validateForm(formData);
      
      if (!validationResult.isValid) {
        toast({
          title: "Validation Error", 
          description: "Please fix the errors below before submitting.",
          variant: "destructive",
        });
        setIsSubmitting(false);
        return;
      }

      // Generate matter number and prepare final data
      const matterNumber = generateMatterNumber();
      const validatedData = validationResult.data!;
      
      // Ensure all required data is properly mapped
      const finalData: NewMatterData = {
        title: validatedData.title,
        description: validatedData.description || '',
        clientId: validatedData.clientId,
        priority: validatedData.priority,
        stage: validatedData.stage,
        practiceArea: validatedData.practiceArea,
        practiceSubArea: validatedData.practiceSubArea || '',
        responsibleAttorney: validatedData.responsibleAttorney,
        responsibleAttorneyId: validatedData.responsibleAttorneyId,
        originatingAttorney: validatedData.originatingAttorney || '',
        originatingAttorneyId: validatedData.originatingAttorneyId || '',
        responsibleStaff: validatedData.responsibleStaff,
        responsibleStaffIds: validatedData.responsibleStaffIds,
        estimatedBudget: validatedData.estimatedBudget,
        nextActionDate: validatedData.nextActionDate || '',
        tags: validatedData.tags,
        notes: validatedData.notes || '',
        matterNumber,
        templateId: validatedData.templateId || '',
        customFields: validatedData.customFields,
        notificationSettings: validatedData.notificationSettings,
        billingPreference: validatedData.billingPreference,
        permissions: validatedData.permissions,
        relatedContacts: validatedData.relatedContacts,
        taskLists: validatedData.taskLists,
        documentFolders: validatedData.documentFolders
      };

      // Submit the form
      await onSubmit(finalData);
      
      // Reset form state completely
      await resetForm();
      
      toast({
        title: "Success",
        description: `Matter "${finalData.title}" created successfully.`,
      });

    } catch (error) {
      console.error('Form submission error:', error);
      toast({
        title: "Error",
        description: "An error occurred while creating the matter. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  }, [formData, validateRequiredFields, validateForm, onSubmit, getInitialFormData, clearErrors, toast]);

  // Handle modal close with simple reset
  const handleClose = useCallback(async () => {
    // Reset form and close
    await resetForm();
    onClose();
  }, [resetForm, onClose]);

  // Tag management with validation
  const addTag = useCallback(() => {
    const trimmedTag = newTag.trim();
    if (!trimmedTag) return;
    
    if (formData.tags?.includes(trimmedTag)) {
      toast({
        title: "Duplicate Tag",
        description: "This tag already exists.",
        variant: "destructive",
      });
      return;
    }

    if (trimmedTag.length > 50) {
      toast({
        title: "Tag Too Long",
        description: "Tags must be less than 50 characters.",
        variant: "destructive",
      });
      return;
    }

    // Check for malicious content
    if (/<[^>]*>|javascript:|on\w+=/gi.test(trimmedTag)) {
      toast({
        title: "Invalid Tag",
        description: "Tag contains invalid content.",
        variant: "destructive",
      });
      return;
    }

    const newTags = [...(formData.tags || []), sanitizeString(trimmedTag)];
    handleFieldChange('tags', newTags);
    setNewTag('');
  }, [newTag, formData.tags, handleFieldChange, toast]);

  const removeTag = useCallback((tagToRemove: string) => {
    const newTags = formData.tags?.filter(tag => tag !== tagToRemove) || [];
    handleFieldChange('tags', newTags);
  }, [formData.tags, handleFieldChange]);

  // Staff management with validation
  const addStaffMember = useCallback((staffId: string, staffName: string) => {
    if (formData.responsibleStaffIds?.includes(staffId)) {
      toast({
        title: "Duplicate Staff",
        description: "This staff member is already assigned.",
        variant: "destructive",
      });
      return;
    }

    const newStaff = [...(formData.responsibleStaff || []), sanitizeString(staffName)];
    const newStaffIds = [...(formData.responsibleStaffIds || []), staffId];
    
    setFormData(prev => ({
      ...prev,
      responsibleStaff: newStaff,
      responsibleStaffIds: newStaffIds
    }));
  }, [formData.responsibleStaff, formData.responsibleStaffIds, toast]);

  const removeStaffMember = useCallback((staffId: string) => {
    const staffMember = staff.find(s => s.id === staffId);
    const newStaff = formData.responsibleStaff?.filter(name => name !== staffMember?.name) || [];
    const newStaffIds = formData.responsibleStaffIds?.filter(id => id !== staffId) || [];
    
    setFormData(prev => ({
      ...prev,
      responsibleStaff: newStaff,
      responsibleStaffIds: newStaffIds
    }));
  }, [formData.responsibleStaff, formData.responsibleStaffIds]);

  // Custom field management
  const [newCustomField, setNewCustomField] = useState<Partial<CustomField>>({
    name: '',
    type: 'text',
    required: false,
    helpText: ''
  });

  const addCustomField = useCallback(() => {
    if (!newCustomField.name?.trim()) {
      toast({
        title: "Field Name Required",
        description: "Please enter a name for the custom field.",
        variant: "destructive",
      });
      return;
    }

    const fieldId = `custom_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const customField: CustomField = {
      id: fieldId,
      name: sanitizeString(newCustomField.name!),
      type: newCustomField.type!,
      required: newCustomField.required!,
      helpText: newCustomField.helpText ? sanitizeString(newCustomField.helpText) : undefined,
      options: newCustomField.type === 'dropdown' ? newCustomField.options : undefined,
      value: undefined
    };

    const currentCustomFields = formData.customFields || {};
    const newCustomFields = { ...currentCustomFields, [fieldId]: customField };
    
    handleFieldChange('customFields', newCustomFields);
    
    // Reset form
    setNewCustomField({
      name: '',
      type: 'text',
      required: false,
      helpText: ''
    });
  }, [newCustomField, formData.customFields, handleFieldChange, toast]);

  const removeCustomField = useCallback((fieldId: string) => {
    const currentCustomFields = formData.customFields || {};
    const newCustomFields = { ...currentCustomFields };
    delete newCustomFields[fieldId];
    
    handleFieldChange('customFields', newCustomFields);
  }, [formData.customFields, handleFieldChange]);

  const updateCustomFieldValue = useCallback((fieldId: string, value: any) => {
    const currentCustomFields = formData.customFields || {};
    const field = currentCustomFields[fieldId];
    if (field) {
      const updatedField = { ...field, value: value };
      const newCustomFields = { ...currentCustomFields, [fieldId]: updatedField };
      handleFieldChange('customFields', newCustomFields);
    }
  }, [formData.customFields, handleFieldChange]);

  // Custom field input component
  const CustomFieldInput = ({ 
    field, 
    value, 
    onChange, 
    onRemove, 
    disabled 
  }: {
    field: CustomField;
    value: any;
    onChange: (value: any) => void;
    onRemove: () => void;
    disabled?: boolean;
  }) => {
    const renderInput = () => {
      switch (field.type) {
        case 'text':
          return (
            <Input
              value={value || ''}
              onChange={(e) => onChange(e.target.value)}
              placeholder={`Enter ${field.name.toLowerCase()}`}
              disabled={disabled}
              maxLength={200}
            />
          );
        
        case 'number':
          return (
            <Input
              type="number"
              value={value || ''}
              onChange={(e) => onChange(Number(e.target.value))}
              placeholder={`Enter ${field.name.toLowerCase()}`}
              disabled={disabled}
            />
          );
        
        case 'date':
          return (
            <Input
              type="date"
              value={value || ''}
              onChange={(e) => onChange(e.target.value)}
              disabled={disabled}
            />
          );
        
        case 'dropdown':
          return (
            <Select value={value || ''} onValueChange={onChange} disabled={disabled}>
              <SelectTrigger>
                <SelectValue placeholder={`Select ${field.name.toLowerCase()}`} />
              </SelectTrigger>
              <SelectContent>
                {field.options?.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          );
        
        case 'checkbox':
          return (
            <div className="flex items-center space-x-2">
              <Checkbox
                checked={!!value}
                onCheckedChange={onChange}
                disabled={disabled}
              />
              <Label className="text-sm">{field.name}</Label>
            </div>
          );
        
        case 'textarea':
          return (
            <Textarea
              value={value || ''}
              onChange={(e) => onChange(e.target.value)}
              placeholder={`Enter ${field.name.toLowerCase()}`}
              disabled={disabled}
              rows={3}
              maxLength={1000}
            />
          );
        
        default:
          return null;
      }
    };

    return (
      <div className="space-y-2 p-3 border rounded-lg bg-background">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Label className="font-medium">
              {field.name}
              {field.required && <span className="text-destructive ml-1">*</span>}
            </Label>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={onRemove}
              className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive"
              disabled={disabled}
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        </div>
        
        {field.type !== 'checkbox' && renderInput()}
        {field.type === 'checkbox' && renderInput()}
        
        {field.helpText && (
          <p className="text-xs text-muted-foreground">{field.helpText}</p>
        )}
      </div>
    );
  };

  // Error display component
  const FieldError = ({ fieldName }: { fieldName: string }) => {
    const error = getFieldError(fieldName);
    if (!error) return null;
    
    return (
      <div className="flex items-center gap-1 mt-1">
        <AlertCircle className="h-3 w-3 text-destructive" />
        <p className="text-sm text-destructive">{error}</p>
      </div>
    );
  };

  // Form progress indicator
  const FormProgress = () => {
    const requiredFields = ['title', 'clientId', 'practiceArea', 'responsibleAttorneyId'];
    const completedRequired = requiredFields.filter(field => {
      const value = formData[field as keyof typeof formData];
      return value && String(value).trim().length > 0;
    }).length;
    
    const progressPercentage = (completedRequired / requiredFields.length) * 100;
    
    return (
      <div className="space-y-2">
        <div className="flex justify-between text-sm text-muted-foreground">
          <span>Required fields completed</span>
          <span>{completedRequired}/{requiredFields.length}</span>
        </div>
        <div className="w-full bg-muted rounded-full h-2">
          <div 
            className="bg-primary h-2 rounded-full transition-all duration-300"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
      </div>
    );
  };

  // Section header with error indicators and required field validation
  const SectionHeader = ({ 
    title, 
    icon: Icon, 
    sectionKey, 
    required = false,
    fieldNames = []
  }: { 
    title: string; 
    icon: any; 
    sectionKey: string; 
    required?: boolean;
    fieldNames?: string[];
  }) => {
    const hasErrors = fieldNames.some(fieldName => hasFieldError(fieldName));
    const hasRequiredFields = required || fieldNames.some(fieldName => 
      ['title', 'clientId', 'practiceArea', 'responsibleAttorneyId'].includes(fieldName)
    );
    
    return (
      <div 
        className="flex items-center justify-between cursor-pointer p-4 hover:bg-muted/50 rounded-lg"
        onClick={() => toggleSection(sectionKey)}
      >
        <div className="flex items-center gap-3">
          <Icon className={`h-5 w-5 ${hasErrors ? 'text-destructive' : hasRequiredFields ? 'text-orange-500' : 'text-primary'}`} />
          <h3 className="text-lg font-semibold">
            {title}
            {hasRequiredFields && <span className="text-destructive ml-1">*</span>}
            {hasErrors && <AlertCircle className="h-4 w-4 text-destructive inline ml-2" />}
          </h3>
        </div>
        <div className="flex items-center gap-2">
          {hasRequiredFields && !hasErrors && (
            <span className="text-xs text-orange-500 font-medium">Required</span>
          )}
          {collapsedSections[sectionKey] ? (
            <ChevronDown className="h-4 w-4" />
          ) : (
            <ChevronUp className="h-4 w-4" />
          )}
        </div>
      </div>
    );
  };

  return (
    <Dialog open={open} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">Create New Matter</DialogTitle>
          <FormProgress />
        </DialogHeader>

        {/* Global form errors */}
        {hasErrors() && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Please fix the errors below before submitting the form.
            </AlertDescription>
          </Alert>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Template Information Section */}
          <Card>
            <SectionHeader title="Template Information" icon={ClipboardList} sectionKey="template" />
            {!collapsedSections.template && (
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="template">Use Existing Template</Label>
                    <Select 
                      value={formData.templateId || ''} 
                      onValueChange={(value) => setFormData({ ...formData, templateId: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a template (optional)" />
                      </SelectTrigger>
                      <SelectContent>
                        {matterTemplates.map((template) => (
                          <SelectItem key={template.id} value={template.id}>
                            <div>
                              <div className="font-medium">{template.name}</div>
                              <div className="text-sm text-muted-foreground">{template.description}</div>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            )}
          </Card>

          {/* Matter Details Section */}
          <Card>
            <SectionHeader 
              title="Matter Details" 
              icon={FileText} 
              sectionKey="details" 
              required 
              fieldNames={['title', 'description', 'clientId', 'practiceArea', 'responsibleAttorneyId']}
            />
            {!collapsedSections.details && (
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <div className="flex items-center gap-2">
                      <Label htmlFor="title">Matter Title *</Label>
                      <FieldHelper fieldName="title" />
                    </div>
                    <Input
                      id="title"
                      value={formData.title || ''}
                      onChange={(e) => handleFieldChange('title', e.target.value)}
                      onBlur={(e) => validateField('title', e.target.value, formData)}
                      placeholder="Enter matter title"
                      className={hasFieldError('title') ? 'border-destructive' : ''}
                      disabled={isSubmitting}
                      maxLength={200}
                    />
                    <FieldError fieldName="title" />
                  </div>

                  <div className="md:col-span-2">
                    <div className="flex items-center gap-2">
                      <Label htmlFor="description">Matter Description</Label>
                      <FieldHelper fieldName="description" />
                    </div>
                    <Textarea
                      id="description"
                      value={formData.description || ''}
                      onChange={(e) => handleFieldChange('description', e.target.value)}
                      onBlur={(e) => validateField('description', e.target.value, formData)}
                      placeholder="Enter detailed matter description"
                      className={hasFieldError('description') ? 'border-destructive' : ''}
                      disabled={isSubmitting}
                      rows={3}
                      maxLength={2000}
                    />
                    <FieldError fieldName="description" />
                    <div className="text-xs text-muted-foreground mt-1">
                      {(formData.description || '').length}/2000 characters
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <Label htmlFor="client">Client *</Label>
                      <FieldHelper fieldName="clientName" />
                    </div>
                    <Select 
                      value={formData.clientId || ''} 
                      onValueChange={(value) => handleFieldChange('clientId', value, true)}
                      disabled={isSubmitting}
                    >
                      <SelectTrigger className={hasFieldError('clientId') ? 'border-destructive' : ''}>
                        <SelectValue placeholder="Select client" />
                      </SelectTrigger>
                      <SelectContent>
                        {clients.map((client) => (
                          <SelectItem key={client.id} value={client.id}>
                            <div>
                              <div className="font-medium">{client.name}</div>
                              <div className="text-sm text-muted-foreground">{client.type}</div>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FieldError fieldName="clientId" />
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <Label htmlFor="stage">Matter Stage</Label>
                      <FieldHelper fieldName="stage" />
                    </div>
                    <Select 
                      value={formData.stage} 
                      onValueChange={(value) => setFormData({ ...formData, stage: value as MatterStage })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {matterStages.map((stage) => (
                          <SelectItem key={stage.value} value={stage.value}>
                            {stage.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <Label htmlFor="practiceArea">Practice Area *</Label>
                      <FieldHelper fieldName="practiceArea" />
                    </div>
                    <Select 
                      value={formData.practiceArea} 
                      onValueChange={(value) => {
                        handleFieldChange('practiceArea', value, true);
                        setFormData(prev => ({ ...prev, practiceSubArea: '' }));
                        setSelectedPracticeArea(value);
                      }}
                      disabled={isSubmitting}
                    >
                      <SelectTrigger className={hasFieldError('practiceArea') ? 'border-destructive' : ''}>
                        <SelectValue placeholder="Select practice area" />
                      </SelectTrigger>
                      <SelectContent>
                        {practiceAreas.map((area) => (
                          <SelectItem key={area.value} value={area.value}>
                            {area.value}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FieldError fieldName="practiceArea" />
                  </div>

                  {selectedPracticeArea && (
                    <div>
                      <div className="flex items-center gap-2">
                        <Label htmlFor="practiceSubArea">Practice Sub-Area</Label>
                        <FieldHelper fieldName="practiceSubArea" />
                      </div>
                      <Select 
                        value={formData.practiceSubArea || ''} 
                        onValueChange={(value) => setFormData({ ...formData, practiceSubArea: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select sub-area" />
                        </SelectTrigger>
                        <SelectContent>
                          {practiceAreas
                            .find(area => area.value === selectedPracticeArea)
                            ?.subAreas.map((subArea) => (
                              <SelectItem key={subArea} value={subArea}>
                                {subArea}
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  <div>
                    <Label htmlFor="responsibleAttorney">Responsible Attorney *</Label>
                    <Select 
                      value={formData.responsibleAttorneyId || ''} 
                      onValueChange={(value) => {
                        const attorney = attorneys.find(a => a.id === value);
                        handleFieldChange('responsibleAttorneyId', value, true);
                        setFormData(prev => ({ 
                          ...prev, 
                          responsibleAttorney: attorney?.name || ''
                        }));
                      }}
                      disabled={isSubmitting}
                    >
                      <SelectTrigger className={hasFieldError('responsibleAttorneyId') ? 'border-destructive' : ''}>
                        <SelectValue placeholder="Select responsible attorney" />
                      </SelectTrigger>
                      <SelectContent>
                        {attorneys.map((attorney) => (
                          <SelectItem key={attorney.id} value={attorney.id}>
                            <div>
                              <div className="font-medium">{attorney.name}</div>
                              <div className="text-sm text-muted-foreground">{attorney.title}</div>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FieldError fieldName="responsibleAttorneyId" />
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <Label htmlFor="originatingAttorney">Originating Attorney</Label>
                      <FieldHelper fieldName="originatingAttorney" />
                    </div>
                    <Select 
                      value={formData.originatingAttorneyId || ''} 
                      onValueChange={(value) => {
                        const attorney = attorneys.find(a => a.id === value);
                        handleFieldChange('originatingAttorneyId', value, true);
                        setFormData(prev => ({ 
                          ...prev, 
                          originatingAttorney: attorney?.name || ''
                        }));
                      }}
                      disabled={isSubmitting}
                    >
                      <SelectTrigger className={hasFieldError('originatingAttorneyId') ? 'border-destructive' : ''}>
                        <SelectValue placeholder="Select originating attorney" />
                      </SelectTrigger>
                      <SelectContent>
                        {attorneys.map((attorney) => (
                          <SelectItem key={attorney.id} value={attorney.id}>
                            <div>
                              <div className="font-medium">{attorney.name}</div>
                              <div className="text-sm text-muted-foreground">{attorney.title}</div>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FieldError fieldName="originatingAttorneyId" />
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <Label htmlFor="priority">Priority</Label>
                      <FieldHelper fieldName="priority" />
                    </div>
                    <Select 
                      value={formData.priority} 
                      onValueChange={(value) => setFormData({ ...formData, priority: value as MatterPriority })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="urgent">Urgent</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <Label htmlFor="budget">Estimated Budget</Label>
                      <FieldHelper fieldName="estimatedBudget" />
                    </div>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="budget"
                        type="number"
                        value={formData.estimatedBudget || ''}
                        onChange={(e) => handleFieldChange('estimatedBudget', Number(e.target.value))}
                        onBlur={(e) => validateField('estimatedBudget', Number(e.target.value), formData)}
                        placeholder="0.00"
                        className={`pl-10 ${hasFieldError('estimatedBudget') ? 'border-destructive' : ''}`}
                        disabled={isSubmitting}
                        min="0"
                        max="100000000"
                        step="0.01"
                      />
                    </div>
                    <FieldError fieldName="estimatedBudget" />
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <Label htmlFor="nextAction">Next Action Date</Label>
                      <FieldHelper fieldName="nextActionDate" />
                    </div>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="nextAction"
                        type="date"
                        value={formData.nextActionDate || ''}
                        onChange={(e) => handleFieldChange('nextActionDate', e.target.value)}
                        onBlur={(e) => validateField('nextActionDate', e.target.value, formData)}
                        className={`pl-10 ${hasFieldError('nextActionDate') ? 'border-destructive' : ''}`}
                        disabled={isSubmitting}
                        min={new Date().toISOString().split('T')[0]}
                      />
                    </div>
                    <FieldError fieldName="nextActionDate" />
                  </div>

                  {/* Responsible Staff */}
                  <div className="md:col-span-2">
                    <div className="flex items-center gap-2">
                      <Label>Responsible Staff</Label>
                      <FieldHelper fieldName="responsibleStaff" />
                    </div>
                    <div className="space-y-2">
                      <Select 
                        value=""
                        onValueChange={(value) => {
                          const staffMember = staff.find(s => s.id === value);
                          if (staffMember) {
                            addStaffMember(staffMember.id, staffMember.name);
                          }
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Add staff member" />
                        </SelectTrigger>
                        <SelectContent>
                          {staff
                            .filter(s => !formData.responsibleStaffIds?.includes(s.id))
                            .map((staffMember) => (
                              <SelectItem key={staffMember.id} value={staffMember.id}>
                                <div>
                                  <div className="font-medium">{staffMember.name}</div>
                                  <div className="text-sm text-muted-foreground">{staffMember.role}</div>
                                </div>
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                      
                      {formData.responsibleStaff && formData.responsibleStaff.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {formData.responsibleStaff.map((staffName, index) => {
                            const staffId = formData.responsibleStaffIds?.[index];
                            return (
                              <Badge key={staffId} variant="secondary" className="gap-1">
                                {staffName}
                                <X
                                  className="h-3 w-3 cursor-pointer"
                                  onClick={() => staffId && removeStaffMember(staffId)}
                                />
                              </Badge>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Tags */}
                  <div className="md:col-span-2">
                    <div className="flex items-center gap-2">
                      <Label>Tags</Label>
                      <FieldHelper fieldName="tags" />
                    </div>
                    <div className="flex gap-2 mt-1">
                      <Input
                        value={newTag}
                        onChange={(e) => setNewTag(e.target.value)}
                        placeholder="Add a tag"
                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                      />
                      <Button type="button" onClick={addTag} size="sm">
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                    {formData.tags && formData.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {formData.tags.map((tag) => (
                          <Badge key={tag} variant="secondary" className="gap-1">
                            {tag}
                            <X
                              className="h-3 w-3 cursor-pointer"
                              onClick={() => removeTag(tag)}
                            />
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Notes */}
                  <div className="md:col-span-2">
                    <div className="flex items-center gap-2">
                      <Label htmlFor="notes">Notes</Label>
                      <FieldHelper fieldName="notes" />
                    </div>
                    <Textarea
                      id="notes"
                      value={formData.notes || ''}
                      onChange={(e) => handleFieldChange('notes', e.target.value)}
                      placeholder="Add any additional notes"
                      className={hasFieldError('notes') ? 'border-destructive' : ''}
                      disabled={isSubmitting}
                      rows={2}
                      maxLength={5000}
                    />
                    <FieldError fieldName="notes" />
                    <div className="text-xs text-muted-foreground mt-1">
                      {(formData.notes || '').length}/5000 characters
                    </div>
                  </div>
                </div>
              </CardContent>
            )}
          </Card>

          {/* Matter Permissions Section */}
          <Card>
            <SectionHeader title="Matter Permissions" icon={Shield} sectionKey="permissions" />
            {!collapsedSections.permissions && (
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <Label>File Access Level</Label>
                        <FieldHelper fieldName="fileAccess" />
                      </div>
                      <Select 
                        value={formData.permissions?.fileAccess || 'full'} 
                        onValueChange={(value) => setFormData({ 
                          ...formData, 
                          permissions: { 
                            ...formData.permissions!, 
                            fileAccess: value as 'full' | 'limited' | 'none' 
                          } 
                        })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="full">Full Access</SelectItem>
                          <SelectItem value="limited">Limited Access</SelectItem>
                          <SelectItem value="none">No Access</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Label htmlFor="clientPortal">Client Portal Access</Label>
                        <FieldHelper fieldName="clientPortalAccess" />
                      </div>
                      <Switch
                        id="clientPortal"
                        checked={formData.permissions?.clientPortalAccess || false}
                        onCheckedChange={(checked) => setFormData({
                          ...formData,
                          permissions: { ...formData.permissions!, clientPortalAccess: checked }
                        })}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Label htmlFor="documentSharing">Document Sharing</Label>
                        <FieldHelper fieldName="documentSharing" />
                      </div>
                      <Switch
                        id="documentSharing"
                        checked={formData.permissions?.documentSharing || false}
                        onCheckedChange={(checked) => setFormData({
                          ...formData,
                          permissions: { ...formData.permissions!, documentSharing: checked }
                        })}
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            )}
          </Card>

          {/* Matter Notifications Section */}
          <Card>
            <SectionHeader title="Matter Notifications" icon={Bell} sectionKey="notifications" />
            {!collapsedSections.notifications && (
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Label htmlFor="emailNotifications">Email Notifications</Label>
                        <FieldHelper fieldName="emailNotifications" />
                      </div>
                      <Switch
                        id="emailNotifications"
                        checked={formData.notificationSettings?.email || false}
                        onCheckedChange={(checked) => setFormData({
                          ...formData,
                          notificationSettings: { ...formData.notificationSettings!, email: checked }
                        })}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Label htmlFor="smsNotifications">SMS Notifications</Label>
                        <FieldHelper fieldName="smsNotifications" />
                      </div>
                      <Switch
                        id="smsNotifications"
                        checked={formData.notificationSettings?.sms || false}
                        onCheckedChange={(checked) => setFormData({
                          ...formData,
                          notificationSettings: { ...formData.notificationSettings!, sms: checked }
                        })}
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Label htmlFor="deadlineReminders">Deadline Reminders</Label>
                        <FieldHelper fieldName="deadlineReminders" />
                      </div>
                      <Switch
                        id="deadlineReminders"
                        checked={formData.notificationSettings?.deadlineReminders || false}
                        onCheckedChange={(checked) => setFormData({
                          ...formData,
                          notificationSettings: { ...formData.notificationSettings!, deadlineReminders: checked }
                        })}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Label htmlFor="clientNotifications">Client Notifications</Label>
                        <FieldHelper fieldName="clientNotifications" />
                      </div>
                      <Switch
                        id="clientNotifications"
                        checked={formData.notificationSettings?.clientNotifications || false}
                        onCheckedChange={(checked) => setFormData({
                          ...formData,
                          notificationSettings: { ...formData.notificationSettings!, clientNotifications: checked }
                        })}
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            )}
          </Card>

          {/* Billing Preference Section */}
          <Card>
            <SectionHeader 
              title="Billing Preference" 
              icon={DollarSign} 
              sectionKey="billing" 
              fieldNames={['billingPreference']}
            />
            {!collapsedSections.billing && (
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <Label>Billing Method</Label>
                      <FieldHelper fieldName="billingMethod" />
                    </div>
                    <Select 
                      value={formData.billingPreference?.method || 'hourly'} 
                      onValueChange={(value) => {
                        const newBillingPreference = {
                          ...formData.billingPreference!,
                          method: value as 'hourly' | 'flat_fee' | 'contingency' | 'retainer'
                        };
                        handleFieldChange('billingPreference', newBillingPreference, true);
                      }}
                      disabled={isSubmitting}
                    >
                      <SelectTrigger className={hasFieldError('billingPreference') ? 'border-destructive' : ''}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="hourly">Hourly Rate</SelectItem>
                        <SelectItem value="flat_fee">Flat Fee</SelectItem>
                        <SelectItem value="contingency">Contingency</SelectItem>
                        <SelectItem value="retainer">Retainer</SelectItem>
                      </SelectContent>
                    </Select>
                    <FieldError fieldName="billingPreference" />
                  </div>

                  {formData.billingPreference?.method === 'hourly' && (
                    <div>
                      <div className="flex items-center gap-2">
                        <Label>Hourly Rate</Label>
                        <FieldHelper fieldName="hourlyRate" />
                      </div>
                      <div className="relative">
                        <DollarSign className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          type="number"
                          value={formData.billingPreference?.hourlyRate || ''}
                          onChange={(e) => {
                            const newBillingPreference = {
                              ...formData.billingPreference!,
                              hourlyRate: Number(e.target.value)
                            };
                            handleFieldChange('billingPreference', newBillingPreference);
                          }}
                          onBlur={(e) => {
                            const newBillingPreference = {
                              ...formData.billingPreference!,
                              hourlyRate: Number(e.target.value)
                            };
                            validateField('billingPreference', newBillingPreference, formData);
                          }}
                          placeholder="0.00"
                          className={`pl-10 ${hasFieldError('billingPreference') ? 'border-destructive' : ''}`}
                          disabled={isSubmitting}
                          min="0"
                          max="10000"
                          step="0.01"
                        />
                      </div>
                    </div>
                  )}

                  {formData.billingPreference?.method === 'flat_fee' && (
                    <div>
                      <div className="flex items-center gap-2">
                        <Label>Flat Fee Amount</Label>
                        <FieldHelper fieldName="flatFee" />
                      </div>
                      <div className="relative">
                        <DollarSign className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          type="number"
                          value={formData.billingPreference?.flatFeeAmount || ''}
                          onChange={(e) => {
                            const newBillingPreference = {
                              ...formData.billingPreference!,
                              flatFeeAmount: Number(e.target.value)
                            };
                            handleFieldChange('billingPreference', newBillingPreference);
                          }}
                          onBlur={(e) => {
                            const newBillingPreference = {
                              ...formData.billingPreference!,
                              flatFeeAmount: Number(e.target.value)
                            };
                            validateField('billingPreference', newBillingPreference, formData);
                          }}
                          placeholder="0.00"
                          className={`pl-10 ${hasFieldError('billingPreference') ? 'border-destructive' : ''}`}
                          disabled={isSubmitting}
                          min="0"
                          max="10000000"
                          step="0.01"
                        />
                      </div>
                    </div>
                  )}

                  {formData.billingPreference?.method === 'contingency' && (
                    <div>
                      <div className="flex items-center gap-2">
                        <Label>Contingency Percentage</Label>
                        <FieldHelper fieldName="contingencyRate" />
                      </div>
                      <div className="relative">
                        <span className="absolute left-3 top-3 text-sm text-muted-foreground">%</span>
                        <Input
                          type="number"
                          value={formData.billingPreference?.contingencyPercentage || ''}
                          onChange={(e) => {
                            const newBillingPreference = {
                              ...formData.billingPreference!,
                              contingencyPercentage: Number(e.target.value)
                            };
                            handleFieldChange('billingPreference', newBillingPreference);
                          }}
                          onBlur={(e) => {
                            const newBillingPreference = {
                              ...formData.billingPreference!,
                              contingencyPercentage: Number(e.target.value)
                            };
                            validateField('billingPreference', newBillingPreference, formData);
                          }}
                          placeholder="0.00"
                          className={`pl-8 ${hasFieldError('billingPreference') ? 'border-destructive' : ''}`}
                          disabled={isSubmitting}
                          min="0"
                          max="100"
                          step="0.01"
                        />
                      </div>
                    </div>
                  )}

                  {formData.billingPreference?.method === 'retainer' && (
                    <div>
                      <div className="flex items-center gap-2">
                        <Label>Retainer Amount</Label>
                        <FieldHelper fieldName="retainerAmount" />
                      </div>
                      <div className="relative">
                        <DollarSign className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          type="number"
                          value={formData.billingPreference?.retainerAmount || ''}
                          onChange={(e) => {
                            const newBillingPreference = {
                              ...formData.billingPreference!,
                              retainerAmount: Number(e.target.value)
                            };
                            handleFieldChange('billingPreference', newBillingPreference);
                          }}
                          onBlur={(e) => {
                            const newBillingPreference = {
                              ...formData.billingPreference!,
                              retainerAmount: Number(e.target.value)
                            };
                            validateField('billingPreference', newBillingPreference, formData);
                          }}
                          placeholder="0.00"
                          className={`pl-10 ${hasFieldError('billingPreference') ? 'border-destructive' : ''}`}
                          disabled={isSubmitting}
                          min="0"
                          max="10000000"
                          step="0.01"
                        />
                      </div>
                    </div>
                  )}

                  <div className="flex items-center justify-between md:col-span-2">
                    <div className="flex items-center gap-2">
                      <Label htmlFor="expenseTracking">Enable Expense Tracking</Label>
                      <FieldHelper fieldName="expenseTracking" />
                    </div>
                    <Switch
                      id="expenseTracking"
                      checked={formData.billingPreference?.expenseTracking || false}
                      onCheckedChange={(checked) => setFormData({
                        ...formData,
                        billingPreference: { ...formData.billingPreference!, expenseTracking: checked }
                      })}
                    />
                  </div>
                </div>
              </CardContent>
            )}
          </Card>

          {/* Custom Fields Section */}
          <Card>
            <SectionHeader 
              title="Custom Fields" 
              icon={CheckSquare} 
              sectionKey="customFields" 
              fieldNames={['customFields']}
            />
            {!collapsedSections.customFields && (
              <CardContent className="space-y-6">
                {/* Add New Custom Field */}
                <div className="space-y-4 p-4 border rounded-lg bg-muted/50">
                  <h4 className="font-medium text-sm">Add Custom Field</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <Label htmlFor="customFieldName">Field Name</Label>
                        <FieldHelper fieldName="customFieldName" />
                      </div>
                      <Input
                        id="customFieldName"
                        value={newCustomField.name || ''}
                        onChange={(e) => setNewCustomField(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="Enter field name"
                        maxLength={100}
                      />
                    </div>
                    <div>
                      <Label htmlFor="customFieldType">Field Type</Label>
                      <Select 
                        value={newCustomField.type || 'text'} 
                        onValueChange={(value) => setNewCustomField(prev => ({ ...prev, type: value as CustomField['type'] }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="text">Text</SelectItem>
                          <SelectItem value="number">Number</SelectItem>
                          <SelectItem value="date">Date</SelectItem>
                          <SelectItem value="dropdown">Dropdown</SelectItem>
                          <SelectItem value="checkbox">Checkbox</SelectItem>
                          <SelectItem value="textarea">Textarea</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="customFieldHelp">Help Text (Optional)</Label>
                      <Input
                        id="customFieldHelp"
                        value={newCustomField.helpText || ''}
                        onChange={(e) => setNewCustomField(prev => ({ ...prev, helpText: e.target.value }))}
                        placeholder="Help text"
                        maxLength={500}
                      />
                    </div>
                  </div>
                  
                  {newCustomField.type === 'dropdown' && (
                    <div>
                      <Label>Dropdown Options (comma-separated)</Label>
                      <Input
                        value={newCustomField.options?.join(', ') || ''}
                        onChange={(e) => {
                          const options = e.target.value.split(',').map(opt => opt.trim()).filter(Boolean);
                          setNewCustomField(prev => ({ ...prev, options }));
                        }}
                        placeholder="Option 1, Option 2, Option 3"
                      />
                    </div>
                  )}

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="customFieldRequired"
                        checked={newCustomField.required || false}
                        onCheckedChange={(checked) => setNewCustomField(prev => ({ ...prev, required: !!checked }))}
                      />
                      <Label htmlFor="customFieldRequired" className="text-sm">Required field</Label>
                    </div>
                    
                    <Button type="button" onClick={addCustomField} size="sm">
                      <Plus className="h-4 w-4 mr-1" />
                      Add Field
                    </Button>
                  </div>
                </div>

                {/* Existing Custom Fields */}
                {formData.customFields && Object.keys(formData.customFields).length > 0 && (
                  <div className="space-y-4">
                    <h4 className="font-medium text-sm">Custom Fields</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {Object.entries(formData.customFields).map(([fieldId, field]) => (
                        <CustomFieldInput
                          key={fieldId}
                          field={field as CustomField}
                          value={field.value}
                          onChange={(value) => updateCustomFieldValue(fieldId, value)}
                          onRemove={() => removeCustomField(fieldId)}
                          disabled={isSubmitting}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            )}
          </Card>

          <div className="flex gap-2 justify-end pt-6">
            <Button type="button" variant="outline" onClick={handleClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting || hasErrors()}>
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Creating...
                </>
              ) : (
                'Create Matter'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddMatterModalEnhanced;