
import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Edit2, Users, Mail } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface TeamSetupInfo {
  role: string;
  teamSize: string;
  inviteEmails: { email: string }[];
}

const ROLES = [
  { value: 'partner', label: 'Partner' },
  { value: 'associate', label: 'Associate' },
  { value: 'counsel', label: 'Counsel' },
  { value: 'paralegal', label: 'Paralegal' },
  { value: 'admin', label: 'Administrator' },
  { value: 'other', label: 'Other' },
];

const TEAM_SIZES = [
  { value: 'solo', label: 'Just Me' },
  { value: 'small', label: '2-5 People' },
  { value: 'medium', label: '6-20 People' },
  { value: 'large', label: '21-50 People' },
  { value: 'enterprise', label: '50+ People' },
];

const ProfileTeamSetup: React.FC = () => {
  const { toast } = useToast();
  const [teamSetup, setTeamSetup] = useState<TeamSetupInfo>({
    role: '',
    teamSize: '',
    inviteEmails: [],
  });

  // Load saved data on mount
  useEffect(() => {
    const savedData = localStorage.getItem('signup-wizard-data');
    if (savedData) {
      try {
        const wizardData = JSON.parse(savedData);
        if (wizardData.teamSetup) {
          const info = wizardData.teamSetup;
          const loadedInfo = {
            role: info.role || '',
            teamSize: info.teamSize || '',
            inviteEmails: info.inviteEmails || [],
          };
          setTeamSetup(loadedInfo);
        }
      } catch (error) {
        console.error('Failed to load team setup:', error);
      }
    }
  }, []);

  const getLabelForValue = (value: string, options: { value: string; label: string }[]) => {
    return options.find(option => option.value === value)?.label || value;
  };

  const hasData = teamSetup.role || teamSetup.teamSize || teamSetup.inviteEmails.length > 0;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-lg flex items-center gap-2">
          <Users className="h-5 w-5" />
          Team Setup
        </CardTitle>
        <Badge variant="secondary" className="text-xs">
          View Only
        </Badge>
      </CardHeader>
      <CardContent className="space-y-4">
        {!hasData ? (
          <p className="text-sm text-muted-foreground italic">
            No team information provided during setup.
          </p>
        ) : (
          <>
            <div className="space-y-2">
              <h4 className="text-sm font-medium">Your Role</h4>
              <p className="text-sm text-muted-foreground">
                {getLabelForValue(teamSetup.role, ROLES) || 'Not specified'}
              </p>
            </div>

            <div className="space-y-2">
              <h4 className="text-sm font-medium">Team Size</h4>
              <p className="text-sm text-muted-foreground">
                {getLabelForValue(teamSetup.teamSize, TEAM_SIZES) || 'Not specified'}
              </p>
            </div>

            {teamSetup.inviteEmails.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-sm font-medium flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  Team Invitations Sent
                </h4>
                <div className="space-y-1">
                  {teamSetup.inviteEmails.map((invite, index) => (
                    <p key={index} className="text-sm text-muted-foreground">
                      {invite.email}
                    </p>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
        
        <div className="pt-2 border-t">
          <p className="text-xs text-muted-foreground">
            Team settings can be managed in the Team section of your dashboard.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProfileTeamSetup;
