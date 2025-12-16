import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import ClientService from '@/services/clientService';
import { Input } from '@/components/ui/input';
import { PhoneInput } from '@/components/ui/phone-input';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Plus, User, Building, Upload, X, Camera, ChevronDown, ChevronUp, Info, Search, Pencil, Trash2 } from 'lucide-react';
import { NewClientData, ContactMethod, Address, Website, PersonDetails, AddressType, LeadStatus, IntakeStage } from '@/types/client';
import { generateId } from '@/lib/utils';
import imageUploadService from '@/services/imageUploadService';
import { useClientFormValidation } from '@/hooks/useClientFormValidation';
import { LeadSourceSelector } from '@/components/lead/LeadSourceSelector';
import { LeadStatusBadge, IntakeStageBadge, LeadScoreBadge } from '@/components/lead/LeadStatusBadge';
import { LeadService } from '@/services/leadService';
import { Switch } from '@/components/ui/switch';

const prefixOptions = [
  { value: 'mr', label: 'Mr.' },
  { value: 'mrs', label: 'Mrs.' },
  { value: 'ms', label: 'Ms.' },
  { value: 'dr', label: 'Dr.' },
  { value: 'prof', label: 'Prof.' },
  { value: 'rev', label: 'Rev.' }
];

const contactTypeOptions = [
  { value: 'work', label: 'Work' },
  { value: 'personal', label: 'Personal' },
  { value: 'home', label: 'Home' },
  { value: 'mobile', label: 'Mobile' },
  { value: 'fax', label: 'Fax' },
  { value: 'other', label: 'Other' }
];

const addressTypeOptions = [
  { value: 'work', label: 'Work' },
  { value: 'home', label: 'Home' },
  { value: 'billing', label: 'Billing' },
  { value: 'shipping', label: 'Shipping' },
  { value: 'other', label: 'Other' }
];

const websiteTypeOptions = [
  { value: 'work', label: 'Work' },
  { value: 'personal', label: 'Personal' },
  { value: 'portfolio', label: 'Portfolio' },
  { value: 'social', label: 'Social' },
  { value: 'other', label: 'Other' }
];

const countryOptions = [
  { value: 'US', label: 'United States' },
  { value: 'CA', label: 'Canada' },
  { value: 'GB', label: 'United Kingdom' },
  { value: 'AU', label: 'Australia' },
  { value: 'DE', label: 'Germany' },
  { value: 'FR', label: 'France' }
];

const AddClient: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [tagInput, setTagInput] = useState('');
  const [showAdditionalFields, setShowAdditionalFields] = useState(false);
  const [showLeadManagement, setShowLeadManagement] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [showTagDropdown, setShowTagDropdown] = useState(false);
  const [showManageTagsModal, setShowManageTagsModal] = useState(false);
  const [availableTags, setAvailableTags] = useState<string[]>(['High Potential Customer', 'VIP', 'Priority Client', 'New Lead']);
  const [newTagInput, setNewTagInput] = useState('');
  const [editingTagIndex, setEditingTagIndex] = useState<number | null>(null);
  const [editingTagValue, setEditingTagValue] = useState('');
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [tagToDelete, setTagToDelete] = useState<{index: number, name: string} | null>(null);
  const [leadScore, setLeadScore] = useState(50);
  const { 
    errors, 
    isValidating, 
    validateForm, 
    validateEmailField, 
    validatePhoneField, 
    validateWebsiteField, 
    validateAddressField,
    validateTagField,
    clearError 
  } = useClientFormValidation({ checkDuplicates: true });
  
  const [formData, setFormData] = useState<NewClientData>({
    name: '',
    type: 'person',
    status: 'active',
    personDetails: {
      prefix: '',
      firstName: '',
      middleName: '',
      lastName: '',
      title: '',
      dateOfBirth: '',
      company: ''
    },
    emails: [{
      id: generateId(),
      value: '',
      type: 'work',
      isPrimary: true
    }],
    phones: [{
      id: generateId(),
      value: '',
      type: 'work',
      isPrimary: true
    }],
    websites: [],
    addresses: [{
      id: generateId(),
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: 'US',
      type: 'work',
      isPrimary: true
    }],
    profilePhoto: '',
    primaryContact: '',
    industry: '',
    tags: [],
    notes: '',
    // Lead Management Properties
    leadStatus: 'prospect',
    leadScore: 50,
    leadSource: '',
    intakeStage: 'initial',
    referralSource: ''
  });

  const handleTypeChange = (type: 'person' | 'company') => {
    setFormData(prev => ({
      ...prev,
      type,
      name: type === 'person' ? 
        `${prev.personDetails?.firstName || ''} ${prev.personDetails?.lastName || ''}`.trim() :
        prev.name
    }));
  };

  const updatePersonDetails = (field: keyof PersonDetails, value: string) => {
    setFormData(prev => ({
      ...prev,
      personDetails: {
        ...prev.personDetails!,
        [field]: value
      },
      name: field === 'firstName' || field === 'lastName' ? 
        `${field === 'firstName' ? value : prev.personDetails?.firstName || ''} ${field === 'lastName' ? value : prev.personDetails?.lastName || ''}`.trim() :
        prev.name
    }));
  };

  const addContactMethod = (type: 'emails' | 'phones' | 'websites') => {
    const newItem = type === 'emails' ? {
      id: generateId(),
      value: '',
      type: 'work' as any,
      isPrimary: false
    } : type === 'phones' ? {
      id: generateId(),
      value: '',
      type: 'work' as any,
      isPrimary: false
    } : {
      id: generateId(),
      url: '',
      type: 'work' as any,
      isPrimary: false
    };

    setFormData(prev => ({
      ...prev,
      [type]: [...prev[type], newItem]
    }));
  };

  const removeContactMethod = (type: 'emails' | 'phones' | 'websites', id: string) => {
    setFormData(prev => ({
      ...prev,
      [type]: prev[type].filter(item => item.id !== id)
    }));
  };

  const updateContactMethod = (type: 'emails' | 'phones' | 'websites' | 'addresses', id: string, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [type]: prev[type].map(item => 
        item.id === id ? { ...item, [field]: value } : item
      )
    }));
  };

  const setPrimaryContact = (type: 'emails' | 'phones' | 'websites', id: string) => {
    setFormData(prev => ({
      ...prev,
      [type]: prev[type].map(item => ({
        ...item,
        isPrimary: item.id === id
      }))
    }));
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingImage(true);
    try {
      // Upload image to Supabase Storage
      const uploadResult = await imageUploadService.uploadClientPhoto(file);
      
      // Update form data with the uploaded image URL
      setFormData(prev => ({ ...prev, profilePhoto: uploadResult.publicUrl }));
      
      toast({
        title: "Success",
        description: "Profile photo uploaded successfully.",
      });
    } catch (error) {
      console.error('Error uploading image:', error);
      const errorMessage = error instanceof Error ? error.message : "Failed to upload image. Please try again.";
      
      toast({
        title: "Upload Error",
        description: errorMessage,
        variant: "destructive",
      });
      
      // Reset file input on error
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } finally {
      setIsUploadingImage(false);
    }
  };

  const removePhoto = async () => {
    // If there's an existing photo URL, try to delete it from storage
    if (formData.profilePhoto && formData.profilePhoto.includes('supabase')) {
      try {
        const imagePath = imageUploadService.getPathFromUrl(formData.profilePhoto);
        if (imagePath) {
          await imageUploadService.deleteImage(imagePath);
        }
      } catch (error) {
        console.warn('Failed to delete image from storage:', error);
        // Don't show error to user, just log it
      }
    }

    setFormData(prev => ({ ...prev, profilePhoto: '' }));
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const addTag = (tag: string) => {
    const trimmedTag = tag.trim();
    
    // Validate tag
    const tagError = validateTagField(trimmedTag);
    if (tagError) {
      toast({
        title: "Invalid Tag",
        description: tagError,
        variant: "destructive",
      });
      return;
    }
    
    if (trimmedTag && !formData.tags.includes(trimmedTag)) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, trimmedTag]
      }));
      // Add to available tags if it's not already there
      if (!availableTags.includes(trimmedTag)) {
        setAvailableTags(prev => [...prev, trimmedTag]);
      }
    }
    setTagInput('');
    setShowTagDropdown(false);
  };

  const createNewTag = (tag: string) => {
    const trimmedTag = tag.trim();
    if (trimmedTag && !availableTags.includes(trimmedTag)) {
      setAvailableTags(prev => [...prev, trimmedTag]);
      addTag(trimmedTag);
    }
    setNewTagInput('');
  };

  const filteredTags = availableTags.filter(tag => 
    tag.toLowerCase().includes(tagInput.toLowerCase()) && 
    !formData.tags.includes(tag)
  );

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleTagInputKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTag(tagInput);
    }
  };

  const startEditingTag = (index: number, tagName: string) => {
    setEditingTagIndex(index);
    setEditingTagValue(tagName);
  };

  const saveEditedTag = () => {
    if (editingTagIndex !== null && editingTagValue.trim()) {
      const newTags = [...availableTags];
      const oldTagName = newTags[editingTagIndex];
      newTags[editingTagIndex] = editingTagValue.trim();
      setAvailableTags(newTags);
      
      // Update formData tags if the edited tag was selected
      setFormData(prev => ({
        ...prev,
        tags: prev.tags.map(tag => tag === oldTagName ? editingTagValue.trim() : tag)
      }));
      
      setEditingTagIndex(null);
      setEditingTagValue('');
    }
  };

  const cancelEditingTag = () => {
    setEditingTagIndex(null);
    setEditingTagValue('');
  };

  const confirmDeleteTag = (index: number, tagName: string) => {
    setTagToDelete({ index, name: tagName });
    setShowDeleteConfirmation(true);
  };

  const deleteTag = () => {
    if (tagToDelete) {
      const newTags = availableTags.filter((_, index) => index !== tagToDelete.index);
      setAvailableTags(newTags);
      
      // Remove from formData tags if it was selected
      setFormData(prev => ({
        ...prev,
        tags: prev.tags.filter(tag => tag !== tagToDelete.name)
      }));
      
      setTagToDelete(null);
      setShowDeleteConfirmation(false);
    }
  };

  const cancelDeleteTag = () => {
    setTagToDelete(null);
    setShowDeleteConfirmation(false);
  };

  const calculateLeadScore = () => {
    const factors = {
      matterUrgency: 70, // Based on form inputs
      budgetRange: 60,
      referralQuality: formData.referralSource ? 80 : 40,
      responseTime: 75,
      practiceAreaMatch: 80,
      geographicMatch: 70
    };
    
    const calculatedScore = LeadService.calculateLeadScore(factors);
    setLeadScore(calculatedScore);
    setFormData(prev => ({ ...prev, leadScore: calculatedScore }));
  };

  const updateLeadManagementField = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form before submission
    const isValid = await validateForm(formData);
    if (!isValid) {
      toast({
        title: "Validation Error",
        description: "Please fix the errors in the form before submitting.",
        variant: "destructive",
      });
      return;
    }
    
    setIsSubmitting(true);

    try {
      await ClientService.createClient(formData);
      
      toast({
        title: "Success",
        description: `Client "${formData.name}" has been created successfully.`,
      });
      
      navigate('/dashboard/clients');
    } catch (error) {
      console.error('Error creating client:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create client. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    navigate('/dashboard/clients');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Add New Contact</h1>
          <p className="text-muted-foreground mt-1">
            Create a new client or contact in your database
          </p>
        </div>
        <div className="flex gap-2">
          <Button type="button" variant="outline" onClick={handleCancel}>
            Cancel
          </Button>
          <Button 
            type="submit" 
            form="client-form"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Saving...' : 'Save contact'}
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <Card>
        <CardContent className="p-6">
          <form id="client-form" onSubmit={handleSubmit} className="space-y-6">
              {/* Contact Information Section */}
              <div className="space-y-6">
                <h2 className="text-lg font-medium">Contact information</h2>
                
                {/* Person/Company Toggle */}
                <div className="space-y-2">
                  <Label>Is this contact a person or a company?</Label>
                  <div className="flex gap-3">
                    <Button
                      type="button"
                      variant={formData.type === 'person' ? 'default' : 'outline'}
                      onClick={() => handleTypeChange('person')}
                      className="flex items-center gap-2"
                    >
                      <User className="h-4 w-4" />
                      Person
                    </Button>
                    <Button
                      type="button"
                      variant={formData.type === 'company' ? 'default' : 'outline'}
                      onClick={() => handleTypeChange('company')}
                      className="flex items-center gap-2"
                    >
                      <Building className="h-4 w-4" />
                      Company
                    </Button>
                  </div>
                </div>

                {/* Profile Photo */}
                <div className="space-y-2">
                  <Label>Profile photo</Label>
                  <div className="flex items-center gap-4">
                    {formData.profilePhoto ? (
                      <div className="relative">
                        <img 
                          src={formData.profilePhoto} 
                          alt="Profile preview" 
                          className="w-16 h-16 rounded-full object-cover border-2 border-border"
                        />
                        <Button
                          type="button"
                          size="sm"
                          variant="destructive"
                          onClick={removePhoto}
                          className="absolute -top-2 -right-2 h-6 w-6 p-0 rounded-full"
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    ) : (
                      <div className="w-16 h-16 rounded-full bg-muted border-2 border-dashed border-border flex items-center justify-center">
                        <Camera className="h-6 w-6 text-muted-foreground" />
                      </div>
                    )}
                    <div className="space-y-2">
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handlePhotoUpload}
                        className="hidden"
                      />
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isUploadingImage}
                        className="flex items-center gap-2"
                      >
                        <Upload className="h-4 w-4" />
                        {isUploadingImage ? 'Uploading...' : formData.profilePhoto ? 'Change photo' : 'Upload photo'}
                      </Button>
                      {formData.profilePhoto && (
                        <Button
                          type="button"
                          size="sm"
                          variant="ghost"
                          onClick={removePhoto}
                          className="text-red-600 hover:text-red-700"
                        >
                          Remove photo
                        </Button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Person Fields */}
                {formData.type === 'person' && (
                  <div className="grid gap-4 md:grid-cols-4">
                    <div className="space-y-2">
                      <Label>Prefix</Label>
                      <Select
                        value={formData.personDetails?.prefix || ''}
                        onValueChange={(value) => updatePersonDetails('prefix', value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select..." />
                        </SelectTrigger>
                        <SelectContent>
                          {prefixOptions.map(option => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>First name *</Label>
                      <Input
                        value={formData.personDetails?.firstName || ''}
                        onChange={(e) => {
                          updatePersonDetails('firstName', e.target.value);
                          clearError('personDetails', 'firstName');
                        }}
                        required
                        className={errors.personDetails?.firstName ? 'border-red-500' : ''}
                      />
                      {errors.personDetails?.firstName && (
                        <p className="text-sm text-red-500">{errors.personDetails.firstName}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label>Middle name</Label>
                      <Input
                        value={formData.personDetails?.middleName || ''}
                        onChange={(e) => updatePersonDetails('middleName', e.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Last name *</Label>
                      <Input
                        value={formData.personDetails?.lastName || ''}
                        onChange={(e) => {
                          updatePersonDetails('lastName', e.target.value);
                          clearError('personDetails', 'lastName');
                        }}
                        required
                        className={errors.personDetails?.lastName ? 'border-red-500' : ''}
                      />
                      {errors.personDetails?.lastName && (
                        <p className="text-sm text-red-500">{errors.personDetails.lastName}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label>Company</Label>
                      <Input
                        value={formData.personDetails?.company || ''}
                        onChange={(e) => updatePersonDetails('company', e.target.value)}
                        placeholder="What's the company's name?"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Title</Label>
                      <Input
                        value={formData.personDetails?.title || ''}
                        onChange={(e) => updatePersonDetails('title', e.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Date of birth</Label>
                      <Input
                        type="date"
                        value={formData.personDetails?.dateOfBirth || ''}
                        onChange={(e) => {
                          updatePersonDetails('dateOfBirth', e.target.value);
                          clearError('personDetails', 'birthday');
                        }}
                        max={new Date().toISOString().split('T')[0]}
                        className={errors.personDetails?.birthday ? 'border-red-500' : ''}
                      />
                      {errors.personDetails?.birthday && (
                        <p className="text-sm text-red-500">{errors.personDetails.birthday}</p>
                      )}
                    </div>
                  </div>
                )}

                {/* Company Fields */}
                {formData.type === 'company' && (
                  <div className="space-y-2">
                    <Label>Name *</Label>
                    <Input
                      value={formData.name}
                      onChange={(e) => {
                        setFormData(prev => ({ ...prev, name: e.target.value }));
                        clearError('name');
                      }}
                      required
                      className={errors.name ? 'border-red-500' : ''}
                    />
                    {errors.name && (
                      <p className="text-sm text-red-500">{errors.name}</p>
                    )}
                  </div>
                )}
              </div>

              <Separator />

              {/* Email Section */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Email</h3>
                {formData.emails.map((email, index) => (
                  <div key={email.id} className="flex gap-3 items-end">
                    <div className="flex-1 space-y-2">
                      <Label>Email address</Label>
                      <Input
                        type="email"
                        value={email.value}
                        onChange={(e) => {
                          updateContactMethod('emails', email.id, 'value', e.target.value);
                          clearError('emails', email.id);
                        }}
                        onBlur={async () => {
                          const error = await validateEmailField(email);
                          if (error) {
                            if (!errors.emails) errors.emails = {};
                            errors.emails[email.id] = error;
                          }
                        }}
                        className={errors.emails?.[email.id] ? 'border-red-500' : ''}
                      />
                      {errors.emails?.[email.id] && (
                        <p className="text-sm text-red-500">{errors.emails[email.id]}</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label>Type</Label>
                      <Select
                        value={email.type}
                        onValueChange={(value) => updateContactMethod('emails', email.id, 'type', value)}
                      >
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {contactTypeOptions.slice(0, 3).map(option => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        type="button"
                        size="sm"
                        variant={email.isPrimary ? 'default' : 'outline'}
                        onClick={() => setPrimaryContact('emails', email.id)}
                      >
                        Primary
                      </Button>
                      {formData.emails.length > 1 && (
                        <Button
                          type="button"
                          size="sm"
                          variant="ghost"
                          onClick={() => removeContactMethod('emails', email.id)}
                        >
                          Remove
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
                <Button
                  type="button"
                  variant="link"
                  onClick={() => addContactMethod('emails')}
                  className="text-blue-600 p-0 h-auto"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add email address
                </Button>
              </div>

              <Separator />

              {/* Phone Section */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Phone</h3>
                {formData.phones.map((phone, index) => (
                  <div key={phone.id} className="flex gap-3 items-end">
                    <div className="flex-1 space-y-2">
                      <Label>Phone number</Label>
                      <PhoneInput
                        value={phone.value}
                        onChange={(value) => {
                          updateContactMethod('phones', phone.id, 'value', value || '');
                          clearError('phones', phone.id);
                        }}
                        onBlur={async () => {
                          const error = await validatePhoneField(phone);
                          if (error) {
                            if (!errors.phones) errors.phones = {};
                            errors.phones[phone.id] = error;
                          }
                        }}
                        defaultCountry="US"
                        className={errors.phones?.[phone.id] ? 'border-red-500' : ''}
                      />
                      {errors.phones?.[phone.id] && (
                        <p className="text-sm text-red-500">{errors.phones[phone.id]}</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label>Type</Label>
                      <Select
                        value={phone.type}
                        onValueChange={(value) => updateContactMethod('phones', phone.id, 'type', value)}
                      >
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {contactTypeOptions.map(option => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        type="button"
                        size="sm"
                        variant={phone.isPrimary ? 'default' : 'outline'}
                        onClick={() => setPrimaryContact('phones', phone.id)}
                      >
                        Primary
                      </Button>
                      {formData.phones.length > 1 && (
                        <Button
                          type="button"
                          size="sm"
                          variant="ghost"
                          onClick={() => removeContactMethod('phones', phone.id)}
                        >
                          Remove
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
                <Button
                  type="button"
                  variant="link"
                  onClick={() => addContactMethod('phones')}
                  className="text-blue-600 p-0 h-auto"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add phone number
                </Button>
              </div>

              <Separator />

              {/* Website Section */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Website</h3>
                {formData.websites.map((website, index) => (
                  <div key={website.id} className="flex gap-3 items-end">
                    <div className="flex-1 space-y-2">
                      <Label>Web address</Label>
                      <Input
                        value={website.url}
                        onChange={(e) => updateContactMethod('websites', website.id, 'url', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Type</Label>
                      <Select
                        value={website.type}
                        onValueChange={(value) => updateContactMethod('websites', website.id, 'type', value)}
                      >
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {websiteTypeOptions.map(option => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        type="button"
                        size="sm"
                        variant={website.isPrimary ? 'default' : 'outline'}
                        onClick={() => setPrimaryContact('websites', website.id)}
                      >
                        Primary
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        onClick={() => removeContactMethod('websites', website.id)}
                      >
                        Remove
                      </Button>
                    </div>
                  </div>
                ))}
                <Button
                  type="button"
                  variant="link"
                  onClick={() => addContactMethod('websites')}
                  className="text-blue-600 p-0 h-auto"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add website
                </Button>
              </div>

              <Separator />

              {/* Address Section */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Address</h3>
                {formData.addresses.map((address, index) => (
                  <div key={address.id} className="space-y-4 p-4 border border-border rounded-lg">
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2 md:col-span-2">
                        <Label>Street</Label>
                        <Input
                          value={address.street}
                          onChange={(e) => updateContactMethod('addresses', address.id, 'street', e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>City</Label>
                        <Input
                          value={address.city}
                          onChange={(e) => updateContactMethod('addresses', address.id, 'city', e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>State/Province</Label>
                        <Input
                          value={address.state}
                          onChange={(e) => updateContactMethod('addresses', address.id, 'state', e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Zip/Postal code</Label>
                        <Input
                          value={address.zipCode}
                          onChange={(e) => updateContactMethod('addresses', address.id, 'zipCode', e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Country</Label>
                        <Select
                          value={address.country}
                          onValueChange={(value) => updateContactMethod('addresses', address.id, 'country', value)}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {countryOptions.map(option => (
                              <SelectItem key={option.value} value={option.value}>
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Type</Label>
                        <Select
                          value={address.type}
                          onValueChange={(value) => updateContactMethod('addresses', address.id, 'type', value)}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {addressTypeOptions.map(option => (
                              <SelectItem key={option.value} value={option.value}>
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="flex justify-between">
                      <Button
                        type="button"
                        size="sm"
                        variant={address.isPrimary ? 'default' : 'outline'}
                        onClick={() => setPrimaryContact('addresses', address.id)}
                      >
                        Primary
                      </Button>
                      {formData.addresses.length > 1 && (
                        <Button
                          type="button"
                          size="sm"
                          variant="ghost"
                          onClick={() => removeContactMethod('addresses', address.id)}
                        >
                          Remove
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
                <Button
                  type="button"
                  variant="link"
                  onClick={() => {
                    const newAddress = {
                      id: generateId(),
                      street: '',
                      city: '',
                      state: '',
                      zipCode: '',
                      country: 'US',
                      type: 'work' as AddressType,
                      isPrimary: false
                    };
                    setFormData(prev => ({
                      ...prev,
                      addresses: [...prev.addresses, newAddress]
                    }));
                  }}
                  className="text-blue-600 p-0 h-auto"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add address
                </Button>
              </div>

              <Separator />

              {/* Tags Section */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium">Tags</h3>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setShowManageTagsModal(true)}
                    className="text-sm"
                  >
                    Manage tags
                  </Button>
                </div>
                
                <div className="rounded-lg border bg-blue-50 p-4">
                  <div className="flex gap-2">
                    <div className="mt-0.5">
                      <div className="rounded-full bg-blue-500 p-1">
                        <Info className="h-3 w-3 text-white" />
                      </div>
                    </div>
                    <p className="text-sm text-gray-700">
                      Add up to 50 tags to a contact for easier searching, filtering, and categorization. The tags will appear on a contact's dashboard, the contacts table, related contacts section in a matter's dashboard, and contact selector drop-downs.
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="contact-tags">Contact tags</Label>
                  <Popover open={showTagDropdown} onOpenChange={setShowTagDropdown}>
                    <PopoverTrigger asChild>
                      <div 
                        className="relative min-h-[40px] border border-input rounded-md bg-background px-3 py-2 text-sm ring-offset-background focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 cursor-text"
                        onClick={() => {
                          setShowTagDropdown(true);
                          document.getElementById('contact-tags')?.focus();
                        }}
                      >
                        <div className="flex flex-wrap gap-1 items-center">
                          {formData.tags.map((tag, index) => (
                            <Badge 
                              key={index} 
                              variant="secondary" 
                              className="bg-blue-100 text-blue-700 hover:bg-blue-200 flex items-center gap-1 px-2 py-1"
                            >
                              <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                              <span>{tag}</span>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  removeTag(tag);
                                }}
                                className="ml-1 hover:bg-blue-300 rounded-full p-0.5"
                              >
                                <X className="h-3 w-3" />
                              </button>
                            </Badge>
                          ))}
                          <input
                            id="contact-tags"
                            value={tagInput}
                            onChange={(e) => {
                              setTagInput(e.target.value);
                              setShowTagDropdown(true);
                            }}
                            onFocus={() => setShowTagDropdown(true)}
                            onKeyDown={handleTagInputKeyDown}
                            placeholder={formData.tags.length === 0 ? "Search contact tags" : ""}
                            className="flex-1 min-w-[120px] bg-transparent border-0 outline-none placeholder:text-muted-foreground"
                          />
                        </div>
                        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                          <Search className="h-4 w-4 text-gray-400" />
                        </div>
                      </div>
                    </PopoverTrigger>
                    <PopoverContent className="w-full p-0" align="start">
                      <div className="max-h-48 overflow-y-auto">
                        {filteredTags.length > 0 && (
                          <div>
                            {filteredTags.map((tag, index) => (
                              <button
                                key={index}
                                onClick={() => addTag(tag)}
                                className="w-full px-3 py-2 text-left hover:bg-gray-50 flex items-center gap-2"
                              >
                                <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                                <span className="text-sm">{tag}</span>
                              </button>
                            ))}
                          </div>
                        )}
                        {tagInput && (
                          <div className="border-t">
                            <button
                              onClick={() => addTag(tagInput)}
                              className="w-full px-3 py-2 text-left hover:bg-blue-50 flex items-center gap-2 text-blue-600"
                            >
                              <Plus className="h-4 w-4" />
                              <span className="text-sm">New contact tag</span>
                            </button>
                          </div>
                        )}
                      </div>
                    </PopoverContent>
                  </Popover>
                </div>
              </div>

              <Separator />

              {/* Lead Management Section */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => setShowLeadManagement(!showLeadManagement)}
                    className="flex items-center gap-2 p-0 h-auto font-medium text-blue-600 hover:text-blue-700"
                  >
                    {showLeadManagement ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    Lead Management
                  </Button>
                  <Switch
                    checked={showLeadManagement}
                    onCheckedChange={setShowLeadManagement}
                  />
                </div>

                {showLeadManagement && (
                  <div className="space-y-6 pt-4 border-t">
                    {/* Lead Status & Stage */}
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label>Lead Status</Label>
                        <Select
                          value={formData.leadStatus}
                          onValueChange={(value) => updateLeadManagementField('leadStatus', value)}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="prospect">Prospect</SelectItem>
                            <SelectItem value="qualified">Qualified</SelectItem>
                            <SelectItem value="consultation">Consultation</SelectItem>
                            <SelectItem value="proposal">Proposal</SelectItem>
                            <SelectItem value="converted">Converted</SelectItem>
                            <SelectItem value="lost">Lost</SelectItem>
                          </SelectContent>
                        </Select>
                        <div className="flex items-center gap-2">
                          <LeadStatusBadge status={formData.leadStatus as LeadStatus} />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label>Intake Stage</Label>
                        <Select
                          value={formData.intakeStage}
                          onValueChange={(value) => updateLeadManagementField('intakeStage', value)}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="initial">Initial Contact</SelectItem>
                            <SelectItem value="qualification">Qualification</SelectItem>
                            <SelectItem value="conflict_check">Conflict Check</SelectItem>
                            <SelectItem value="consultation">Consultation</SelectItem>
                            <SelectItem value="proposal">Proposal</SelectItem>
                            <SelectItem value="onboarding">Onboarding</SelectItem>
                            <SelectItem value="completed">Completed</SelectItem>
                          </SelectContent>
                        </Select>
                        <div className="flex items-center gap-2">
                          <IntakeStageBadge stage={formData.intakeStage as IntakeStage} />
                        </div>
                      </div>
                    </div>

                    {/* Lead Source */}
                    <div className="space-y-2">
                      <Label>Lead Source</Label>
                      <LeadSourceSelector
                        value={formData.leadSource}
                        onValueChange={(value) => updateLeadManagementField('leadSource', value)}
                        showCreateButton={true}
                        showAnalytics={true}
                      />
                    </div>

                    {/* Referral Source */}
                    <div className="space-y-2">
                      <Label>Referral Source</Label>
                      <Input
                        value={formData.referralSource}
                        onChange={(e) => updateLeadManagementField('referralSource', e.target.value)}
                        placeholder="Who referred this lead? (if applicable)"
                      />
                    </div>

                    {/* Lead Score */}
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <Label>Lead Score</Label>
                        <div className="flex items-center gap-2">
                          <LeadScoreBadge score={formData.leadScore || 50} />
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={calculateLeadScore}
                          >
                            Calculate
                          </Button>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm text-gray-600">
                          <span>Cold (0-39)</span>
                          <span>Cool (40-59)</span>
                          <span>Warm (60-79)</span>
                          <span>Hot (80-100)</span>
                        </div>
                        <div className="relative">
                          <input
                            type="range"
                            min="0"
                            max="100"
                            value={formData.leadScore || 50}
                            onChange={(e) => updateLeadManagementField('leadScore', parseInt(e.target.value))}
                            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                          />
                          <div className="flex justify-between text-xs text-gray-500 mt-1">
                            <span>0</span>
                            <span>25</span>
                            <span>50</span>
                            <span>75</span>
                            <span>100</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Lead Management Info */}
                    <div className="rounded-lg border bg-blue-50 p-4">
                      <div className="flex gap-2">
                        <div className="mt-0.5">
                          <div className="rounded-full bg-blue-500 p-1">
                            <Info className="h-3 w-3 text-white" />
                          </div>
                        </div>
                        <div className="text-sm text-gray-700">
                          <p className="font-medium mb-1">Lead Management</p>
                          <p>Track your lead through the intake process from initial contact to client conversion. Lead scoring helps prioritize follow-up activities.</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <Separator />

              {/* Additional Fields Section */}
              <div className="space-y-4">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setShowAdditionalFields(!showAdditionalFields)}
                  className="flex items-center gap-2 p-0 h-auto font-medium text-blue-600 hover:text-blue-700"
                >
                  {showAdditionalFields ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  Additional fields
                </Button>

                {showAdditionalFields && (
                  <div className="space-y-6 pt-4">
                    {/* Industry */}
                    <div className="space-y-2">
                      <Label>Industry</Label>
                      <Input
                        value={formData.industry}
                        onChange={(e) => setFormData(prev => ({ ...prev, industry: e.target.value }))}
                        placeholder="e.g., Legal Services, Technology, Healthcare"
                      />
                    </div>

                    {/* Notes */}
                    <div className="space-y-2">
                      <Label>Notes</Label>
                      <Textarea
                        value={formData.notes}
                        onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                        placeholder="Add any additional notes about this contact..."
                        rows={3}
                      />
                    </div>

                    {/* Billing Preferences */}
                    <div className="space-y-2">
                      <h4 className="text-md font-medium text-muted-foreground">Billing Preferences</h4>
                      <div className="grid gap-4 md:grid-cols-2 p-4 bg-muted/50 rounded-lg">
                        <div className="space-y-2">
                          <Label>Preferred billing method</Label>
                          <Select defaultValue="email">
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="email">Email</SelectItem>
                              <SelectItem value="mail">Mail</SelectItem>
                              <SelectItem value="portal">Client Portal</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label>Payment terms</Label>
                          <Select defaultValue="30">
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="0">Due on receipt</SelectItem>
                              <SelectItem value="15">Net 15</SelectItem>
                              <SelectItem value="30">Net 30</SelectItem>
                              <SelectItem value="60">Net 60</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>

                    {/* Custom Fields */}
                    <div className="space-y-2">
                      <h4 className="text-md font-medium text-muted-foreground">Custom Fields</h4>
                      <div className="space-y-4 p-4 bg-muted/50 rounded-lg">
                        <div className="grid gap-4 md:grid-cols-2">
                          <div className="space-y-2">
                            <Label>Client source</Label>
                            <Input placeholder="How did you acquire this client?" />
                          </div>
                          <div className="space-y-2">
                            <Label>Referral source</Label>
                            <Input placeholder="Who referred this client?" />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label>Special instructions</Label>
                          <Textarea placeholder="Any special handling instructions..." rows={2} />
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Manage Tags Modal */}
        <Dialog open={showManageTagsModal} onOpenChange={setShowManageTagsModal}>
        <DialogContent className="max-w-lg">
          <DialogHeader className="space-y-3">
            <DialogTitle className="text-xl font-semibold">Contact tags settings</DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground">
              Tags help you categorize and locate contacts. Using shorter tags and keeping the number of total tags your firm uses to a minimum will make this categorization more effective.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6 pt-2">
            <div className="space-y-4">
              <h4 className="text-sm font-medium text-foreground">Create new tag</h4>
              <div className="flex gap-3">
                <div className="relative flex-1">
                  <div className="absolute left-3 top-1/2 transform -translate-y-1/2 z-10">
                    <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                  </div>
                  <Input
                    value={newTagInput}
                    onChange={(e) => setNewTagInput(e.target.value)}
                    placeholder="Name your new tag"
                    className="pl-8 h-10"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        createNewTag(newTagInput);
                      }
                    }}
                  />
                </div>
                <Button
                  onClick={() => createNewTag(newTagInput)}
                  disabled={!newTagInput.trim()}
                  className="h-10 px-4"
                >
                  Create tag
                </Button>
              </div>
            </div>
            
            {availableTags.length > 0 && (
              <div className="space-y-4">
                <h4 className="text-sm font-medium text-foreground">Available tags ({availableTags.length})</h4>
                <div className="border rounded-lg max-h-64 overflow-y-auto">
                  <div className="divide-y">
                    {availableTags.map((tag, index) => (
                      <div key={index} className="flex items-center justify-between p-3 hover:bg-muted/50 transition-colors">
                        <div className="flex items-center gap-3 flex-1">
                          <div className="w-2 h-2 rounded-full bg-blue-500 flex-shrink-0"></div>
                          {editingTagIndex === index ? (
                            <div className="flex items-center gap-2 flex-1">
                              <Input
                                value={editingTagValue}
                                onChange={(e) => setEditingTagValue(e.target.value)}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') {
                                    saveEditedTag();
                                  } else if (e.key === 'Escape') {
                                    cancelEditingTag();
                                  }
                                }}
                                className="h-8 text-sm"
                                autoFocus
                              />
                              <Button
                                onClick={saveEditedTag}
                                variant="outline"
                                size="sm"
                                className="h-8 px-2"
                              >
                                Save
                              </Button>
                              <Button
                                onClick={cancelEditingTag}
                                variant="outline"
                                size="sm"
                                className="h-8 px-2"
                              >
                                Cancel
                              </Button>
                            </div>
                          ) : (
                            <>
                              <span className="text-sm text-foreground">{tag}</span>
                              {formData.tags.includes(tag) && (
                                <Badge variant="secondary" className="text-xs bg-green-100 text-green-700">
                                  Added
                                </Badge>
                              )}
                            </>
                          )}
                        </div>
                        {editingTagIndex !== index && (
                          <div className="flex items-center gap-1">
                            {!formData.tags.includes(tag) && (
                              <Button
                                onClick={() => addTag(tag)}
                                variant="outline"
                                size="sm"
                                className="h-8 px-3 text-xs"
                              >
                                Add to contact
                              </Button>
                            )}
                            <Button
                              onClick={() => startEditingTag(index, tag)}
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0 hover:bg-blue-50"
                            >
                              <Pencil className="h-3 w-3 text-blue-600" />
                            </Button>
                            <Button
                              onClick={() => confirmDeleteTag(index, tag)}
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0 hover:bg-red-50"
                            >
                              <Trash2 className="h-3 w-3 text-red-600" />
                            </Button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteConfirmation} onOpenChange={setShowDeleteConfirmation}>
        <DialogContent className="max-w-md">
          <DialogHeader className="space-y-3">
            <DialogTitle className="text-lg font-semibold">Delete tag</DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground">
              Deleting the '{tagToDelete?.name}' tag will remove it from all contacts it's applied to. Are you sure you want to delete it?
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-3 mt-6">
            <Button
              onClick={cancelDeleteTag}
              variant="outline"
              className="h-9 px-4"
            >
              Cancel
            </Button>
            <Button
              onClick={deleteTag}
              variant="destructive"
              className="h-9 px-4"
            >
              Confirm
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AddClient;