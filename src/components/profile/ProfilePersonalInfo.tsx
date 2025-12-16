
import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Edit2, Save, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface PersonalInfo {
  firstName: string;
  lastName: string;
  phone: string;
  timezone: string;
  preferredLanguage: string;
}

const TIMEZONES = [
  { value: 'America/New_York', label: 'Eastern Time (ET)' },
  { value: 'America/Chicago', label: 'Central Time (CT)' },
  { value: 'America/Denver', label: 'Mountain Time (MT)' },
  { value: 'America/Los_Angeles', label: 'Pacific Time (PT)' },
  { value: 'UTC', label: 'UTC' },
];

const LANGUAGES = [
  { value: 'en', label: 'English' },
  { value: 'es', label: 'Spanish' },
  { value: 'fr', label: 'French' },
  { value: 'de', label: 'German' },
];

const ProfilePersonalInfo: React.FC = () => {
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [personalInfo, setPersonalInfo] = useState<PersonalInfo>({
    firstName: '',
    lastName: '',
    phone: '',
    timezone: 'America/New_York',
    preferredLanguage: 'en',
  });
  const [formData, setFormData] = useState<PersonalInfo>(personalInfo);

  // Load saved data on mount
  useEffect(() => {
    const savedData = localStorage.getItem('signup-wizard-data');
    if (savedData) {
      try {
        const wizardData = JSON.parse(savedData);
        if (wizardData.personalInfo) {
          const info = wizardData.personalInfo;
          const loadedInfo = {
            firstName: info.firstName || '',
            lastName: info.lastName || '',
            phone: info.phone || '',
            timezone: info.timezone || 'America/New_York',
            preferredLanguage: info.preferredLanguage || 'en',
          };
          setPersonalInfo(loadedInfo);
          setFormData(loadedInfo);
        }
      } catch (error) {
        console.error('Failed to load personal info:', error);
      }
    }
  }, []);

  const handleEdit = () => {
    setIsEditing(true);
    setFormData(personalInfo);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setFormData(personalInfo);
  };

  const handleSave = async () => {
    setIsLoading(true);
    try {
      // Save to localStorage (in a real app, this would be an API call)
      const savedData = localStorage.getItem('signup-wizard-data');
      const wizardData = savedData ? JSON.parse(savedData) : {};
      wizardData.personalInfo = formData;
      localStorage.setItem('signup-wizard-data', JSON.stringify(wizardData));

      setPersonalInfo(formData);
      setIsEditing(false);

      toast({
        title: "Personal information updated",
        description: "Your personal information has been updated successfully.",
      });
    } catch (error) {
      toast({
        title: "Update failed",
        description: "Failed to update personal information",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const hasData = personalInfo.firstName || personalInfo.lastName || personalInfo.phone;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-lg">Personal Information</CardTitle>
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
            No personal information provided during setup. Click Edit to add details.
          </p>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name</Label>
                {isEditing ? (
                  <Input
                    id="firstName"
                    value={formData.firstName}
                    onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
                    placeholder="Enter first name"
                  />
                ) : (
                  <p className="text-sm text-muted-foreground">{personalInfo.firstName || 'Not provided'}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name</Label>
                {isEditing ? (
                  <Input
                    id="lastName"
                    value={formData.lastName}
                    onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
                    placeholder="Enter last name"
                  />
                ) : (
                  <p className="text-sm text-muted-foreground">{personalInfo.lastName || 'Not provided'}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              {isEditing ? (
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                  placeholder="Enter phone number"
                />
              ) : (
                <p className="text-sm text-muted-foreground">{personalInfo.phone || 'Not provided'}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="timezone">Timezone</Label>
              {isEditing ? (
                <Select value={formData.timezone} onValueChange={(value) => setFormData(prev => ({ ...prev, timezone: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {TIMEZONES.map((tz) => (
                      <SelectItem key={tz.value} value={tz.value}>
                        {tz.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <p className="text-sm text-muted-foreground">
                  {TIMEZONES.find(tz => tz.value === personalInfo.timezone)?.label || personalInfo.timezone}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="language">Preferred Language</Label>
              {isEditing ? (
                <Select value={formData.preferredLanguage} onValueChange={(value) => setFormData(prev => ({ ...prev, preferredLanguage: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {LANGUAGES.map((lang) => (
                      <SelectItem key={lang.value} value={lang.value}>
                        {lang.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <p className="text-sm text-muted-foreground">
                  {LANGUAGES.find(lang => lang.value === personalInfo.preferredLanguage)?.label || personalInfo.preferredLanguage}
                </p>
              )}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default ProfilePersonalInfo;
