
import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Edit2, Save, X, Building } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface FirmInfo {
  firmName: string;
  firmSize: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

const FIRM_SIZES = [
  { value: 'solo', label: 'Solo Practitioner' },
  { value: 'small', label: 'Small Firm (2-10 attorneys)' },
  { value: 'medium', label: 'Medium Firm (11-50 attorneys)' },
  { value: 'large', label: 'Large Firm (51-200 attorneys)' },
  { value: 'enterprise', label: 'Enterprise Firm (200+ attorneys)' },
];

const COUNTRIES = [
  { value: 'US', label: 'United States' },
  { value: 'CA', label: 'Canada' },
  { value: 'GB', label: 'United Kingdom' },
  { value: 'AU', label: 'Australia' },
];

const ProfileFirmInfo: React.FC = () => {
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [firmInfo, setFirmInfo] = useState<FirmInfo>({
    firmName: '',
    firmSize: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'US',
  });
  const [formData, setFormData] = useState<FirmInfo>(firmInfo);

  // Load saved data on mount
  useEffect(() => {
    const savedData = localStorage.getItem('signup-wizard-data');
    if (savedData) {
      try {
        const wizardData = JSON.parse(savedData);
        if (wizardData.firmInfo) {
          const info = wizardData.firmInfo;
          const loadedInfo = {
            firmName: info.firmName || '',
            firmSize: info.firmSize || '',
            address: info.address || '',
            city: info.city || '',
            state: info.state || '',
            zipCode: info.zipCode || '',
            country: info.country || 'US',
          };
          setFirmInfo(loadedInfo);
          setFormData(loadedInfo);
        }
      } catch (error) {
        console.error('Failed to load firm info:', error);
      }
    }
  }, []);

  const handleEdit = () => {
    setIsEditing(true);
    setFormData(firmInfo);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setFormData(firmInfo);
  };

  const handleSave = async () => {
    setIsLoading(true);
    try {
      // Save to localStorage (in a real app, this would be an API call)
      const savedData = localStorage.getItem('signup-wizard-data');
      const wizardData = savedData ? JSON.parse(savedData) : {};
      wizardData.firmInfo = formData;
      localStorage.setItem('signup-wizard-data', JSON.stringify(wizardData));

      setFirmInfo(formData);
      setIsEditing(false);

      toast({
        title: "Firm information updated",
        description: "Your firm information has been updated successfully.",
      });
    } catch (error) {
      toast({
        title: "Update failed",
        description: "Failed to update firm information",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const hasData = firmInfo.firmName || firmInfo.firmSize;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-lg flex items-center gap-2">
          <Building className="h-5 w-5" />
          Firm Information
        </CardTitle>
        {!isEditing ? (
          <Button variant="outline" size="sm" onClick={handleEdit}>
            <Edit2 className="h-4 w-4 mr-2" />
            Edit
          </Button>
        ) : (
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleCancel}>
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
            <Button size="sm" onClick={handleSave} disabled={isLoading}>
              <Save className="h-4 w-4 mr-2" />
              Save
            </Button>
          </div>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        {!hasData && !isEditing ? (
          <p className="text-sm text-muted-foreground italic">
            No firm information provided during setup. Click Edit to add details.
          </p>
        ) : (
          <>
            <div className="space-y-2">
              <Label htmlFor="firmName">Firm Name</Label>
              {isEditing ? (
                <Input
                  id="firmName"
                  value={formData.firmName}
                  onChange={(e) => setFormData(prev => ({ ...prev, firmName: e.target.value }))}
                  placeholder="Enter firm name"
                />
              ) : (
                <p className="text-sm text-muted-foreground">{firmInfo.firmName || 'Not provided'}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="firmSize">Firm Size</Label>
              {isEditing ? (
                <Select value={formData.firmSize} onValueChange={(value) => setFormData(prev => ({ ...prev, firmSize: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select firm size" />
                  </SelectTrigger>
                  <SelectContent>
                    {FIRM_SIZES.map((size) => (
                      <SelectItem key={size.value} value={size.value}>
                        {size.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <p className="text-sm text-muted-foreground">
                  {FIRM_SIZES.find(size => size.value === firmInfo.firmSize)?.label || firmInfo.firmSize || 'Not provided'}
                </p>
              )}
            </div>

            <div className="space-y-3">
              <Label>Address</Label>
              <div className="space-y-3">
                <div className="space-y-2">
                  {isEditing ? (
                    <Input
                      value={formData.address}
                      onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                      placeholder="Street address"
                    />
                  ) : (
                    <p className="text-sm text-muted-foreground">{firmInfo.address || 'Street address not provided'}</p>
                  )}
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    {isEditing ? (
                      <Input
                        value={formData.city}
                        onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
                        placeholder="City"
                      />
                    ) : (
                      <p className="text-sm text-muted-foreground">{firmInfo.city || 'City not provided'}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    {isEditing ? (
                      <Input
                        value={formData.state}
                        onChange={(e) => setFormData(prev => ({ ...prev, state: e.target.value }))}
                        placeholder="State"
                      />
                    ) : (
                      <p className="text-sm text-muted-foreground">{firmInfo.state || 'State not provided'}</p>
                    )}
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    {isEditing ? (
                      <Input
                        value={formData.zipCode}
                        onChange={(e) => setFormData(prev => ({ ...prev, zipCode: e.target.value }))}
                        placeholder="ZIP Code"
                      />
                    ) : (
                      <p className="text-sm text-muted-foreground">{firmInfo.zipCode || 'ZIP not provided'}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    {isEditing ? (
                      <Select value={formData.country} onValueChange={(value) => setFormData(prev => ({ ...prev, country: value }))}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {COUNTRIES.map((country) => (
                            <SelectItem key={country.value} value={country.value}>
                              {country.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      <p className="text-sm text-muted-foreground">
                        {COUNTRIES.find(country => country.value === firmInfo.country)?.label || firmInfo.country}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default ProfileFirmInfo;
