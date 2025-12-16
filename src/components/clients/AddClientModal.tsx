import React, { useState, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Plus, User, Building, Upload, X, Camera, ChevronDown, ChevronUp } from 'lucide-react';
import { NewClientData, ContactMethod, Address, Website, PersonDetails, AddressType } from '@/types/client';
import { generateId } from '@/lib/utils';

interface AddClientModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (clientData: NewClientData) => void;
}

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

const AddClientModal: React.FC<AddClientModalProps> = ({ open, onClose, onSubmit }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [tagInput, setTagInput] = useState('');
  const [showAdditionalFields, setShowAdditionalFields] = useState(false);
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
    notes: ''
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

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        setFormData(prev => ({ ...prev, profilePhoto: result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const removePhoto = () => {
    setFormData(prev => ({ ...prev, profilePhoto: '' }));
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const addTag = (tag: string) => {
    const trimmedTag = tag.trim();
    if (trimmedTag && !formData.tags.includes(trimmedTag)) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, trimmedTag]
      }));
    }
    setTagInput('');
  };

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>New contact</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Contact Information Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Contact information</h3>
            
            {/* Person/Company Toggle */}
            <div className="space-y-2">
              <Label>Is this contact a person or a company?</Label>
              <div className="flex gap-2">
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
                      className="w-16 h-16 rounded-full object-cover border-2 border-gray-200"
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
                  <div className="w-16 h-16 rounded-full bg-gray-100 border-2 border-dashed border-gray-300 flex items-center justify-center">
                    <Camera className="h-6 w-6 text-gray-400" />
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
                    className="flex items-center gap-2"
                  >
                    <Upload className="h-4 w-4" />
                    {formData.profilePhoto ? 'Change photo' : 'Upload photo'}
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
                    onChange={(e) => updatePersonDetails('firstName', e.target.value)}
                    required
                  />
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
                    onChange={(e) => updatePersonDetails('lastName', e.target.value)}
                    required
                  />
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
                    onChange={(e) => updatePersonDetails('dateOfBirth', e.target.value)}
                  />
                </div>
              </div>
            )}

            {/* Company Fields */}
            {formData.type === 'company' && (
              <div className="space-y-2">
                <Label>Name *</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  required
                />
              </div>
            )}
          </div>

          <Separator />

          {/* Email Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Email</h3>
            {formData.emails.map((email, index) => (
              <div key={email.id} className="flex gap-2 items-end">
                <div className="flex-1 space-y-2">
                  <Label>Email address</Label>
                  <Input
                    type="email"
                    value={email.value}
                    onChange={(e) => updateContactMethod('emails', email.id, 'value', e.target.value)}
                  />
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
              <div key={phone.id} className="flex gap-2 items-end">
                <div className="flex-1 space-y-2">
                  <Label>Phone number</Label>
                  <Input
                    value={phone.value}
                    onChange={(e) => updateContactMethod('phones', phone.id, 'value', e.target.value)}
                  />
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
              <div key={website.id} className="flex gap-2 items-end">
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
              <div key={address.id} className="space-y-4 p-4 border rounded-lg">
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
            <h3 className="text-lg font-medium">Tags</h3>
            <div className="space-y-2">
              <Label>Contact tags</Label>
              <div className="space-y-2">
                <Input
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={handleTagInputKeyDown}
                  placeholder="Type a tag and press Enter"
                />
                {formData.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {formData.tags.map((tag, index) => (
                      <Badge key={index} variant="secondary" className="flex items-center gap-1">
                        {tag}
                        <Button
                          type="button"
                          size="sm"
                          variant="ghost"
                          onClick={() => removeTag(tag)}
                          className="h-4 w-4 p-0 hover:bg-transparent"
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </div>
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

                {/* Billing Preferences (Collapsed Section) */}
                <div className="space-y-2">
                  <h4 className="text-md font-medium text-gray-700">Billing Preferences</h4>
                  <div className="grid gap-4 md:grid-cols-2 p-4 bg-gray-50 rounded-lg">
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
                  <h4 className="text-md font-medium text-gray-700">Custom Fields</h4>
                  <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
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

          {/* Action Buttons */}
          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">
              Save contact
            </Button>
            <Button type="button" variant="outline">
              Save and create new matter
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddClientModal;