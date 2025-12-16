
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { useAuth } from '@/contexts/SimpleAuthContext';
import ProfileHeader from '@/components/profile/ProfileHeader';
import ProfileAccountInfo from '@/components/profile/ProfileAccountInfo';
import ProfilePersonalInfo from '@/components/profile/ProfilePersonalInfo';
import ProfileFirmInfo from '@/components/profile/ProfileFirmInfo';
import ProfilePracticeAreas from '@/components/profile/ProfilePracticeAreas';
import ProfileTeamSetup from '@/components/profile/ProfileTeamSetup';
import ProfileIntegrations from '@/components/profile/ProfileIntegrations';
import { IntegrationPreferencesData } from '@/types/wizard';

const DEFAULT_INTEGRATION_DATA: Partial<IntegrationPreferencesData> = {
  preferredIntegrations: [],
  dataImportNeeded: false,
  migrationAssistance: false,
};
const DEFAULT_FIRM_SIZE = 'small';

const UserProfile = () => {
  const { user } = useAuth();

  if (!user) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Please log in to view your profile.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <ProfileHeader user={user} />
      
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-6">
          <ProfileAccountInfo />
          <ProfilePersonalInfo />
          <ProfilePracticeAreas />
        </div>
        
        <div className="space-y-6">
          <ProfileFirmInfo />
          <ProfileTeamSetup />
          <ProfileIntegrations data={DEFAULT_INTEGRATION_DATA} firmSize={DEFAULT_FIRM_SIZE} />
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
