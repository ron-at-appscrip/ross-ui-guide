
import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Users, Building } from 'lucide-react';
import { NewClientData } from '@/types/client';

interface BasicInfoTabProps {
  formData: NewClientData;
  handleInputChange: (field: string, value: any) => void;
  industryOptions: { value: string; label: string }[];
}

const BasicInfoTab: React.FC<BasicInfoTabProps> = ({ formData, handleInputChange, industryOptions }) => {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <div className="space-y-2">
        <Label htmlFor="name">Client Name *</Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => handleInputChange('name', e.target.value)}
          placeholder="Enter client name..."
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="type">Client Type *</Label>
        <Select
          value={formData.type}
          onValueChange={(value) => handleInputChange('type', value)}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="individual">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                Individual
              </div>
            </SelectItem>
            <SelectItem value="corporate">
              <div className="flex items-center gap-2">
                <Building className="h-4 w-4" />
                Corporate
              </div>
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="primaryContact">Primary Contact</Label>
        <Input
          id="primaryContact"
          value={formData.primaryContact}
          onChange={(e) => handleInputChange('primaryContact', e.target.value)}
          placeholder="Primary contact person..."
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="status">Status</Label>
        <Select
          value={formData.status}
          onValueChange={(value) => handleInputChange('status', value)}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
            <SelectItem value="prospect">Prospect</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {formData.type === 'corporate' && (
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="industry">Industry</Label>
          <Select
            value={formData.industry}
            onValueChange={(value) => handleInputChange('industry', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select industry..." />
            </SelectTrigger>
            <SelectContent>
              {industryOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}
    </div>
  );
};

export default BasicInfoTab;
