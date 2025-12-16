import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PhoneInput } from '@/components/ui/phone-input';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Client, ContactMethod, Address } from '@/types/client';
import ClientService from '@/services/clientService';
import { generateId } from '@/lib/utils';
import { useClientFormValidation } from '@/hooks/useClientFormValidation';
import { Plus, X } from 'lucide-react';

interface EditClientModalProps {
  client: Client;
  open: boolean;
  onClose: () => void;
  onSuccess: (updatedClient: Client) => void;
}

const EditClientModal: React.FC<EditClientModalProps> = ({ client, open, onClose, onSuccess }) => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { 
    errors, 
    validateEmailField, 
    validatePhoneField, 
    clearError 
  } = useClientFormValidation({ checkDuplicates: true });

  // Initialize form data from client
  const [formData, setFormData] = useState({
    name: client.name,
    emails: [...client.emails],
    phones: [...client.phones],
    addresses: [...client.addresses],
    tags: [...client.tags],
    notes: client.notes || '',
    status: client.status
  });

  // Reset form when modal opens with new client
  useEffect(() => {
    if (open && client) {
      setFormData({
        name: client.name,
        emails: [...client.emails],
        phones: [...client.phones],
        addresses: [...client.addresses],
        tags: [...client.tags],
        notes: client.notes || '',
        status: client.status
      });
    }
  }, [open, client]);

  const updateContactMethod = (
    type: 'emails' | 'phones',
    id: string,
    field: keyof ContactMethod,
    value: any
  ) => {
    setFormData(prev => ({
      ...prev,
      [type]: prev[type].map(item =>
        item.id === id ? { ...item, [field]: value } : item
      )
    }));
  };

  const addContactMethod = (type: 'emails' | 'phones') => {
    const newMethod: ContactMethod = {
      id: generateId(),
      value: '',
      type: 'work',
      isPrimary: formData[type].length === 0
    };
    setFormData(prev => ({
      ...prev,
      [type]: [...prev[type], newMethod]
    }));
  };

  const removeContactMethod = (type: 'emails' | 'phones', id: string) => {
    setFormData(prev => {
      const updated = prev[type].filter(item => item.id !== id);
      // If we removed the primary, make the first one primary
      if (updated.length > 0 && !updated.some(item => item.isPrimary)) {
        updated[0].isPrimary = true;
      }
      return {
        ...prev,
        [type]: updated
      };
    });
  };

  const setPrimaryContact = (type: 'emails' | 'phones', id: string) => {
    setFormData(prev => ({
      ...prev,
      [type]: prev[type].map(item => ({
        ...item,
        isPrimary: item.id === id
      }))
    }));
  };

  const updateAddress = (id: string, field: keyof Address, value: any) => {
    setFormData(prev => ({
      ...prev,
      addresses: prev.addresses.map(addr =>
        addr.id === id ? { ...addr, [field]: value } : addr
      )
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Basic validation
    if (!formData.name.trim()) {
      toast({
        title: "Validation Error",
        description: "Client name is required.",
        variant: "destructive",
      });
      return;
    }

    if (formData.emails.length === 0 || !formData.emails[0].value) {
      toast({
        title: "Validation Error",
        description: "At least one email is required.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Update client
      const updatedClient = await ClientService.updateClient(client.id, {
        name: formData.name,
        emails: formData.emails,
        phones: formData.phones,
        addresses: formData.addresses,
        tags: formData.tags,
        notes: formData.notes,
        status: formData.status,
        type: client.type
      });

      toast({
        title: "Success",
        description: "Client updated successfully.",
      });

      onSuccess(updatedClient);
      onClose();
    } catch (error) {
      console.error('Error updating client:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update client.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Client</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Name *</Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                required
              />
            </div>

            <div className="space-y-2">
              <Label>Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value) => setFormData(prev => ({ ...prev, status: value as 'active' | 'inactive' }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Email Addresses */}
          <div className="space-y-4">
            <h3 className="font-medium">Email Addresses</h3>
            {formData.emails.map((email) => (
              <div key={email.id} className="flex gap-2 items-end">
                <div className="flex-1 space-y-2">
                  <Input
                    type="email"
                    value={email.value}
                    onChange={(e) => {
                      updateContactMethod('emails', email.id, 'value', e.target.value);
                      clearError('emails', email.id);
                    }}
                    onBlur={async () => {
                      const error = await validateEmailField(email);
                      if (error && errors.emails) {
                        errors.emails[email.id] = error;
                      }
                    }}
                    placeholder="Email address"
                    className={errors.emails?.[email.id] ? 'border-red-500' : ''}
                  />
                  {errors.emails?.[email.id] && (
                    <p className="text-sm text-red-500">{errors.emails[email.id]}</p>
                  )}
                </div>
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
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => addContactMethod('emails')}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Email
            </Button>
          </div>

          {/* Phone Numbers */}
          <div className="space-y-4">
            <h3 className="font-medium">Phone Numbers</h3>
            {formData.phones.map((phone) => (
              <div key={phone.id} className="flex gap-2 items-end">
                <div className="flex-1 space-y-2">
                  <PhoneInput
                    value={phone.value}
                    onChange={(value) => {
                      updateContactMethod('phones', phone.id, 'value', value || '');
                      clearError('phones', phone.id);
                    }}
                    onBlur={async () => {
                      const error = await validatePhoneField(phone);
                      if (error && errors.phones) {
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
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => addContactMethod('phones')}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Phone
            </Button>
          </div>

          {/* Primary Address */}
          {formData.addresses.length > 0 && (
            <div className="space-y-4">
              <h3 className="font-medium">Primary Address</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2 space-y-2">
                  <Label>Street Address</Label>
                  <Input
                    value={formData.addresses[0].street}
                    onChange={(e) => updateAddress(formData.addresses[0].id, 'street', e.target.value)}
                    placeholder="123 Main St"
                  />
                </div>
                <div className="space-y-2">
                  <Label>City</Label>
                  <Input
                    value={formData.addresses[0].city}
                    onChange={(e) => updateAddress(formData.addresses[0].id, 'city', e.target.value)}
                    placeholder="City"
                  />
                </div>
                <div className="space-y-2">
                  <Label>State</Label>
                  <Input
                    value={formData.addresses[0].state}
                    onChange={(e) => updateAddress(formData.addresses[0].id, 'state', e.target.value)}
                    placeholder="State"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Zip Code</Label>
                  <Input
                    value={formData.addresses[0].zipCode}
                    onChange={(e) => updateAddress(formData.addresses[0].id, 'zipCode', e.target.value)}
                    placeholder="12345"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Country</Label>
                  <Input
                    value={formData.addresses[0].country}
                    onChange={(e) => updateAddress(formData.addresses[0].id, 'country', e.target.value)}
                    placeholder="Country"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Tags */}
          <div className="space-y-4">
            <h3 className="font-medium">Tags</h3>
            <div className="flex flex-wrap gap-2">
              {formData.tags.map((tag) => (
                <Badge key={tag} variant="secondary">
                  {tag}
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({
                      ...prev,
                      tags: prev.tags.filter(t => t !== tag)
                    }))}
                    className="ml-1"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label>Notes</Label>
            <Textarea
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              rows={4}
              placeholder="Add any additional notes about this client..."
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditClientModal;