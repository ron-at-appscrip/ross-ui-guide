import React, { useState, useEffect, useCallback } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
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
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { 
  X, Plus, ChevronDown, ChevronUp, Calendar as CalendarIcon, DollarSign, Users, Bell, 
  Shield, FileText, CheckSquare, Folder, BarChart, Info, ClipboardList, AlertCircle, Edit3
} from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import FieldHelper from '@/components/ui/field-helper';
import { generateMockMatterForEdit, commonDropdownOptions, mockMatterBase } from '@/data/matter-mock-data';
import { 
  Matter, MatterPriority, MatterStage, MatterTemplate, CustomField,
  NotificationSettings, BillingPreference, MatterPermissions, RelatedContact,
  TaskList, DocumentFolder, MatterStatus
} from '@/types/matter';
import { Client } from '@/types/client';
import { useMatterFormValidation } from '@/hooks/useMatterFormValidation';
import { generateMatterNumber, sanitizeString } from '@/lib/validations/matter';
import { useToast } from '@/hooks/use-toast';

interface EditMatterModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (updates: Partial<Matter>) => void;
  matter: Matter;
  clients?: Client[];
}

// Mock data for dropdowns - same as AddMatterModal
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
  'Corporate Law',
  'Litigation', 
  'Employment Law',
  'Intellectual Property',
  'Real Estate Law',
  'Family Law',
  'Criminal Law',
  'Tax Law',
  'Immigration Law'
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

const EditMatterModal: React.FC<EditMatterModalProps> = ({
  open,
  onClose,
  onSubmit,
  matter,
  clients = []
}) => {
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

  const [formData, setFormData] = useState<Partial<Matter>>({});
  const [nextActionDate, setNextActionDate] = useState<Date | undefined>();
  const [retainerDate, setRetainerDate] = useState<Date | undefined>();
  const [statuteDate, setStatuteDate] = useState<Date | undefined>();
  const [trialDate, setTrialDate] = useState<Date | undefined>();
  const [closeExpectedDate, setCloseExpectedDate] = useState<Date | undefined>();
  const [newTag, setNewTag] = useState('');
  const [newCustomField, setNewCustomField] = useState({ name: '', value: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Collapsible sections state
  const [collapsedSections, setCollapsedSections] = useState({
    basic: false,
    legal: true,
    billing: true,
    team: true,
    notifications: true,
    permissions: true,
    custom: true
  });
  
  // Character counts for textareas
  const [characterCounts, setCharacterCounts] = useState({
    description: 0,
    notes: 0
  });
  
  // Get mock clients if none provided
  const mockClients: Client[] = [
    {
      id: '1',
      firstName: 'Global',
      lastName: 'TechCorp',
      email: 'legal@globaltechcorp.com',
      phone: '+1-555-0123',
      type: 'company',
      createdAt: '2024-01-15',
      updatedAt: '2024-01-15'
    },
    {
      id: '2', 
      firstName: 'Sarah',
      lastName: 'Johnson',
      email: 'sarah.johnson@email.com',
      phone: '+1-555-0456',
      type: 'person',
      createdAt: '2024-01-20',
      updatedAt: '2024-01-20'
    },
    {
      id: '3',
      firstName: 'Enterprise',
      lastName: 'Solutions LLC',
      email: 'contact@enterprisesolutions.com', 
      phone: '+1-555-0789',
      type: 'company',
      createdAt: '2024-02-01',
      updatedAt: '2024-02-01'
    }
  ];
  
  const availableClients = clients.length > 0 ? clients : mockClients;

  // Initialize form data when matter changes
  useEffect(() => {
    if (matter && open) {
      // Use shared mock data to ensure consistency
      const mockMatter = generateMockMatterForEdit(matter.practiceArea);
      
      setFormData({
        ...mockMatter,
        ...matter,
        tags: matter.tags ? [...matter.tags] : [...(mockMatter.tags || [])],
        customFields: matter.customFields || mockMatter.customFields || [],
        notificationSettings: matter.notificationSettings || mockMatter.notificationSettings,
        billingPreferences: matter.billingPreferences || mockMatter.billingPreferences,
        permissions: matter.permissions || mockMatter.permissions
      });
      
      // Set dates
      if (matter.nextActionDate) {
        setNextActionDate(new Date(matter.nextActionDate));
      } else if (mockMatter.nextActionDate) {
        setNextActionDate(new Date(mockMatter.nextActionDate));
      }
      
      if (matter.retainerDate) {
        setRetainerDate(new Date(matter.retainerDate));
      } else if (mockMatter.retainerDate) {
        setRetainerDate(new Date(mockMatter.retainerDate));
      }
      
      if (matter.statuteOfLimitations) {
        setStatuteDate(new Date(matter.statuteOfLimitations));
      } else if (mockMatter.statuteOfLimitations) {
        setStatuteDate(new Date(mockMatter.statuteOfLimitations));
      }
      
      if (matter.trialDate) {
        setTrialDate(new Date(matter.trialDate));
      } else if (mockMatter.trialDate) {
        setTrialDate(new Date(mockMatter.trialDate));
      }
      
      if (matter.closeExpectedDate) {
        setCloseExpectedDate(new Date(matter.closeExpectedDate));
      } else if (mockMatter.closeExpectedDate) {
        setCloseExpectedDate(new Date(mockMatter.closeExpectedDate));
      }
      
      // Set character counts
      setCharacterCounts({
        description: (matter.description || mockMatter.description || '').length,
        notes: (matter.notes || mockMatter.notes || '').length
      });

      // Clear any existing errors
      clearErrors();
    }
  }, [matter, open, clearErrors]);

  // Handle collapsible sections
  const toggleSection = (section: keyof typeof collapsedSections) => {
    setCollapsedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };
  
  // Field validation helper
  const validateFormFields = async (): Promise<boolean> => {
    const requiredErrors = validateRequiredFields(formData);
    if (Object.keys(requiredErrors).length > 0) {
      return false;
    }

    const validationResult = await validateForm(formData);
    return validationResult.isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const isValid = await validateFormFields();
    if (!isValid) {
      toast({
        title: "Validation Error",
        description: "Please fix the errors below before submitting.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      const updates = {
        ...formData,
        nextActionDate: nextActionDate ? nextActionDate.toISOString().split('T')[0] : undefined,
        retainerDate: retainerDate ? retainerDate.toISOString().split('T')[0] : undefined,
        statuteOfLimitations: statuteDate ? statuteDate.toISOString().split('T')[0] : undefined,
        trialDate: trialDate ? trialDate.toISOString().split('T')[0] : undefined,
        closeExpectedDate: closeExpectedDate ? closeExpectedDate.toISOString().split('T')[0] : undefined,
        lastActivity: new Date().toISOString().split('T')[0]
      };

      await onSubmit(updates);
      
      toast({
        title: "Matter Updated",
        description: "The matter has been successfully updated.",
      });
      
      onClose();
    } catch (error) {
      console.error('Error updating matter:', error);
      toast({
        title: "Error",
        description: "Failed to update matter. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = useCallback(async (field: string, value: any, shouldValidate: boolean = false) => {
    // Sanitize string inputs
    const sanitizedValue = typeof value === 'string' ? sanitizeString(value) : value;
    
    const newFormData = { ...formData, [field]: sanitizedValue };
    setFormData(newFormData);

    // Clear previous error when user starts typing
    if (hasFieldError(field)) {
      clearFieldError(field);
    }

    // Validate field if requested (on blur or for critical fields)
    if (shouldValidate) {
      await validateField(field, sanitizedValue, newFormData);
    }
    
    // Update character counts for textareas
    if (field === 'description' || field === 'notes') {
      setCharacterCounts(prev => ({ ...prev, [field]: value?.length || 0 }));
    }
  }, [formData, hasFieldError, clearFieldError, validateField]);
  
  const handleNestedChange = useCallback((section: string, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...prev[section as keyof typeof prev],
        [field]: value
      }
    }));
  }, []);

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
    handleInputChange('tags', newTags);
    setNewTag('');
  }, [newTag, formData.tags, handleInputChange, toast]);

  const removeTag = useCallback((tagToRemove: string) => {
    const newTags = formData.tags?.filter(tag => tag !== tagToRemove) || [];
    handleInputChange('tags', newTags);
  }, [formData.tags, handleInputChange]);

  const handleTagKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTag();
    }
  };
  
  // Custom field management
  const addCustomField = () => {
    if (newCustomField.name.trim() && newCustomField.value.trim()) {
      const customField: CustomField = {
        id: Date.now().toString(),
        name: newCustomField.name.trim(),
        value: newCustomField.value.trim(),
        type: 'text'
      };
      
      setFormData(prev => ({
        ...prev,
        customFields: [...(prev.customFields || []), customField]
      }));
      
      setNewCustomField({ name: '', value: '' });
    }
  };
  
  const removeCustomField = (fieldId: string) => {
    setFormData(prev => ({
      ...prev,
      customFields: prev.customFields?.filter(field => field.id !== fieldId) || []
    }));
  };
  
  const handleCustomFieldKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addCustomField();
    }
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

  // Section header component
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
    const sectionHasErrors = fieldNames.some(fieldName => hasFieldError(fieldName));
    const hasRequiredFields = required || fieldNames.some(fieldName => 
      ['title', 'clientId', 'practiceArea', 'responsibleAttorneyId'].includes(fieldName)
    );
    
    return (
      <div 
        className="flex items-center justify-between cursor-pointer p-4 hover:bg-muted/50 rounded-lg"
        onClick={() => toggleSection(sectionKey)}
      >
        <div className="flex items-center gap-3">
          <Icon className={`h-5 w-5 ${sectionHasErrors ? 'text-destructive' : hasRequiredFields ? 'text-orange-500' : 'text-primary'}`} />
          <h3 className="text-lg font-semibold">
            {title}
            {hasRequiredFields && <span className="text-destructive ml-1">*</span>}
            {sectionHasErrors && <AlertCircle className="h-4 w-4 text-destructive inline ml-2" />}
          </h3>
        </div>
        <div className="flex items-center gap-2">
          {hasRequiredFields && !sectionHasErrors && (
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
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold flex items-center space-x-2">
            <Edit3 className="h-5 w-5" />
            <span>Edit Matter</span>
          </DialogTitle>
          <DialogDescription>
            Update matter information for {matter.clientName || 'this client'}
          </DialogDescription>
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
          {/* Basic Information Section */}
          <Card>
            <SectionHeader 
              title="Basic Information" 
              icon={FileText} 
              sectionKey="basic" 
              required 
              fieldNames={['title', 'description', 'clientId', 'practiceArea']}
            />
            {!collapsedSections.basic && (
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
                      onChange={(e) => handleInputChange('title', e.target.value)}
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
                      onChange={(e) => handleInputChange('description', e.target.value)}
                      onBlur={(e) => validateField('description', e.target.value, formData)}
                      placeholder="Enter detailed matter description"
                      className={hasFieldError('description') ? 'border-destructive' : ''}
                      disabled={isSubmitting}
                      rows={3}
                      maxLength={2000}
                    />
                    <FieldError fieldName="description" />
                    <div className="text-xs text-muted-foreground mt-1">
                      {characterCounts.description}/2000 characters
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <Label htmlFor="client">Client *</Label>
                      <FieldHelper fieldName="clientName" />
                    </div>
                    <Select 
                      value={formData.clientId || ''} 
                      onValueChange={(value) => handleInputChange('clientId', value, true)}
                      disabled={isSubmitting}
                    >
                      <SelectTrigger className={hasFieldError('clientId') ? 'border-destructive' : ''}>
                        <SelectValue placeholder="Select client" />
                      </SelectTrigger>
                      <SelectContent>
                        {availableClients.map((client) => (
                          <SelectItem key={client.id} value={client.id}>
                            <div>
                              <div className="font-medium">{client.firstName} {client.lastName}</div>
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
                      onValueChange={(value) => handleInputChange('practiceArea', value, true)}
                      disabled={isSubmitting}
                    >
                      <SelectTrigger className={hasFieldError('practiceArea') ? 'border-destructive' : ''}>
                        <SelectValue placeholder="Select practice area" />
                      </SelectTrigger>
                      <SelectContent>
                        {practiceAreas.map((area) => (
                          <SelectItem key={area} value={area}>
                            {area}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FieldError fieldName="practiceArea" />
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <Label htmlFor="practiceSubArea">Practice Sub-Area</Label>
                      <FieldHelper fieldName="practiceSubArea" />
                    </div>
                    <Input
                      id="practiceSubArea"
                      placeholder="e.g., M&A, Employment Disputes"
                      value={formData.practiceSubArea || ''}
                      onChange={(e) => handleInputChange('practiceSubArea', e.target.value)}
                    />
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <Label>Status</Label>
                      <FieldHelper fieldName="status" />
                    </div>
                    <Select 
                      value={formData.status} 
                      onValueChange={(value: MatterStatus) => handleInputChange('status', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        {commonDropdownOptions.statuses.map((status) => (
                          <SelectItem key={status.value} value={status.value}>
                            {status.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <Label>Priority</Label>
                      <FieldHelper fieldName="priority" />
                    </div>
                    <Select 
                      value={formData.priority} 
                      onValueChange={(value: MatterPriority) => handleInputChange('priority', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select priority" />
                      </SelectTrigger>
                      <SelectContent>
                        {commonDropdownOptions.priorities.map((priority) => (
                          <SelectItem key={priority.value} value={priority.value}>
                            {priority.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <Label htmlFor="estimatedBudget">Estimated Budget ($)</Label>
                      <FieldHelper fieldName="estimatedBudget" />
                    </div>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="estimatedBudget"
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="0.00"
                        value={formData.estimatedBudget || ''}
                        onChange={(e) => handleInputChange('estimatedBudget', parseFloat(e.target.value) || undefined)}
                        onBlur={(e) => validateField('estimatedBudget', parseFloat(e.target.value) || undefined, formData)}
                        className={`pl-10 ${hasFieldError('estimatedBudget') ? 'border-destructive' : ''}`}
                        disabled={isSubmitting}
                        max="100000000"
                      />
                    </div>
                    <FieldError fieldName="estimatedBudget" />
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <Label>Next Action Date</Label>
                      <FieldHelper fieldName="nextActionDate" />
                    </div>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !nextActionDate && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {nextActionDate ? format(nextActionDate, "PPP") : <span>Select date</span>}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={nextActionDate}
                          onSelect={setNextActionDate}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>

                  {/* Tags */}
                  <div className="md:col-span-2">
                    <div className="flex items-center gap-2">
                      <Label>Tags</Label>
                      <FieldHelper fieldName="tags" />
                    </div>
                    <div className="space-y-2">
                      <div className="flex space-x-2">
                        <Input
                          placeholder="Add a tag"
                          value={newTag}
                          onChange={(e) => setNewTag(e.target.value)}
                          onKeyPress={handleTagKeyPress}
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={addTag}
                          disabled={!newTag.trim()}
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                      
                      {formData.tags && formData.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {formData.tags.map((tag, index) => (
                            <Badge key={index} variant="secondary" className="flex items-center space-x-1">
                              <span>{tag}</span>
                              <button
                                type="button"
                                onClick={() => removeTag(tag)}
                                className="ml-1 hover:text-destructive"
                              >
                                <X className="h-3 w-3" />
                              </button>
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Notes */}
                  <div className="md:col-span-2">
                    <div className="flex items-center gap-2">
                      <Label htmlFor="notes">Notes</Label>
                      <FieldHelper fieldName="notes" />
                    </div>
                    <Textarea
                      id="notes"
                      placeholder="Additional notes about this matter"
                      value={formData.notes || ''}
                      onChange={(e) => handleInputChange('notes', e.target.value)}
                      rows={3}
                      maxLength={5000}
                    />
                    <div className="text-xs text-muted-foreground mt-1">
                      {characterCounts.notes}/5000 characters
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
                        onValueChange={(value) => handleNestedChange('permissions', 'fileAccess', value)}
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
                        onCheckedChange={(checked) => handleNestedChange('permissions', 'clientPortalAccess', checked)}
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
                        onCheckedChange={(checked) => handleNestedChange('permissions', 'documentSharing', checked)}
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
                        onCheckedChange={(checked) => handleNestedChange('notificationSettings', 'email', checked)}
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
                        onCheckedChange={(checked) => handleNestedChange('notificationSettings', 'sms', checked)}
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
                        onCheckedChange={(checked) => handleNestedChange('notificationSettings', 'deadlineReminders', checked)}
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
                        onCheckedChange={(checked) => handleNestedChange('notificationSettings', 'clientNotifications', checked)}
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
                      onValueChange={(value) => handleNestedChange('billingPreference', 'method', value)}
                      disabled={isSubmitting}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="hourly">Hourly Rate</SelectItem>
                        <SelectItem value="flat_fee">Flat Fee</SelectItem>
                        <SelectItem value="contingency">Contingency</SelectItem>
                        <SelectItem value="retainer">Retainer</SelectItem>
                      </SelectContent>
                    </Select>
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
                          onChange={(e) => handleNestedChange('billingPreference', 'hourlyRate', Number(e.target.value))}
                          placeholder="0.00"
                          className="pl-10"
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
                          onChange={(e) => handleNestedChange('billingPreference', 'flatFeeAmount', Number(e.target.value))}
                          placeholder="0.00"
                          className="pl-10"
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
                          onChange={(e) => handleNestedChange('billingPreference', 'contingencyPercentage', Number(e.target.value))}
                          placeholder="0.00"
                          className="pl-8"
                          disabled={isSubmitting}
                          min="0"
                          max="100"
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
                      onCheckedChange={(checked) => handleNestedChange('billingPreference', 'expenseTracking', checked)}
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
              sectionKey="custom" 
              fieldNames={['customFields']}
            />
            {!collapsedSections.custom && (
              <CardContent className="space-y-6">
                {/* Add New Custom Field */}
                <div className="space-y-4 p-4 border rounded-lg bg-muted/50">
                  <h4 className="font-medium text-sm">Add Custom Field</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="customFieldName">Field Name</Label>
                      <Input
                        id="customFieldName"
                        value={newCustomField.name}
                        onChange={(e) => setNewCustomField(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="Enter field name"
                        maxLength={100}
                      />
                    </div>
                    <div>
                      <Label htmlFor="customFieldValue">Field Value</Label>
                      <Input
                        id="customFieldValue"
                        value={newCustomField.value}
                        onChange={(e) => setNewCustomField(prev => ({ ...prev, value: e.target.value }))}
                        placeholder="Enter field value"
                        maxLength={200}
                      />
                    </div>
                  </div>
                  
                  <div className="flex justify-end">
                    <Button type="button" onClick={addCustomField} size="sm">
                      <Plus className="h-4 w-4 mr-1" />
                      Add Field
                    </Button>
                  </div>
                </div>

                {/* Existing Custom Fields */}
                {formData.customFields && formData.customFields.length > 0 && (
                  <div className="space-y-4">
                    <h4 className="font-medium text-sm">Custom Fields</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {formData.customFields.map((field) => (
                        <div key={field.id} className="space-y-2 p-3 border rounded-lg bg-background">
                          <div className="flex items-center justify-between">
                            <Label className="font-medium">{field.name}</Label>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => removeCustomField(field.id)}
                              className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive"
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </div>
                          <Input
                            value={field.value}
                            onChange={(e) => {
                              const updatedFields = formData.customFields?.map(f => 
                                f.id === field.id ? { ...f, value: e.target.value } : f
                              ) || [];
                              setFormData(prev => ({ ...prev, customFields: updatedFields }));
                            }}
                            placeholder={`Enter ${field.name.toLowerCase()}`}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            )}
          </Card>

          <div className="flex gap-2 justify-end pt-6">
            <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={isSubmitting || hasErrors()}
              className="min-w-[120px]"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Updating...
                </>
              ) : (
                'Update Matter'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditMatterModal;