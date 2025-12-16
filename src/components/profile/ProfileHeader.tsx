
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { User, Shield, CheckCircle } from 'lucide-react';

interface ProfileHeaderProps {
  user: {
    name: string;
    first_name?: string;
    last_name?: string;
    full_name?: string;
    email: string;
    title?: string;
    avatar?: string;
    provider?: 'email' | 'google' | 'apple';
    emailVerified?: boolean;
    hasCompletedWizard?: boolean;
  };
}

const ProfileHeader: React.FC<ProfileHeaderProps> = ({ user }) => {
  // Get display name with priority: first_name + last_name, then full_name, then name fallback
  const getDisplayName = () => {
    if (user.first_name && user.last_name) {
      return `${user.first_name} ${user.last_name}`.trim();
    }
    if (user.first_name) {
      return user.first_name;
    }
    return user.full_name || user.name || 'User';
  };

  const displayName = getDisplayName();

  const getInitials = (name: string) => {
    if (user.first_name && user.last_name) {
      return `${user.first_name[0]}${user.last_name[0]}`.toUpperCase();
    }
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getProviderIcon = (provider?: string) => {
    switch (provider) {
      case 'google':
        return '🌐';
      case 'apple':
        return '🍎';
      default:
        return '📧';
    }
  };

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <Avatar className="h-20 w-20">
            <AvatarImage src={user.avatar} alt={displayName} />
            <AvatarFallback className="text-lg font-semibold">
              {getInitials(displayName)}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1 space-y-2">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2">
              <h1 className="text-2xl font-bold">{displayName}</h1>
              <div className="flex gap-2">
                {user.emailVerified && (
                  <Badge variant="secondary" className="flex items-center gap-1">
                    <CheckCircle className="h-3 w-3" />
                    Verified
                  </Badge>
                )}
                {user.hasCompletedWizard && (
                  <Badge variant="default" className="flex items-center gap-1">
                    <Shield className="h-3 w-3" />
                    Setup Complete
                  </Badge>
                )}
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-2 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                {getProviderIcon(user.provider)} {user.email}
              </span>
              {user.title && (
                <span className="flex items-center gap-1">
                  <User className="h-3 w-3" />
                  {user.title}
                </span>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProfileHeader;
