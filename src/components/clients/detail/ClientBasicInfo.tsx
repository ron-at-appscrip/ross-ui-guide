
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { User, Building, Phone, Mail, Edit, Plus, Calendar, Clock } from 'lucide-react';
import { Client } from '@/types/client';

interface ClientBasicInfoProps {
  client: Client;
  onEdit?: () => void;
  onNewMatter?: () => void;
  onCall?: () => void;
  onEmail?: () => void;
}

const ClientBasicInfo = ({ 
  client, 
  onEdit, 
  onNewMatter, 
  onCall, 
  onEmail 
}: ClientBasicInfoProps) => {
  const getStatusBadge = (status: string) => {
    const variants = {
      active: { variant: 'default' as const, color: 'bg-green-100 text-green-800' },
      inactive: { variant: 'secondary' as const, color: 'bg-gray-100 text-gray-800' },
      prospect: { variant: 'outline' as const, color: 'bg-blue-100 text-blue-800' }
    };
    
    const config = variants[status as keyof typeof variants] || variants.active;
    return (
      <Badge variant={config.variant} className={config.color}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const getTypeBadge = (type: string) => {
    const configs = {
      company: { 
        icon: <Building className="h-3 w-3 mr-1" />, 
        color: 'bg-blue-50 text-blue-700 border-blue-200' 
      },
      person: { 
        icon: <User className="h-3 w-3 mr-1" />, 
        color: 'bg-green-50 text-green-700 border-green-200' 
      }
    };
    
    const config = configs[type as keyof typeof configs];
    return (
      <Badge variant="outline" className={config.color}>
        {config.icon}
        {type.charAt(0).toUpperCase() + type.slice(1)}
      </Badge>
    );
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const formatLastActivity = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffInDays === 0) return 'Today';
    if (diffInDays === 1) return 'Yesterday';
    if (diffInDays < 7) return `${diffInDays} days ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="flex items-center gap-4">
      <Avatar className="h-16 w-16 border-2 border-primary/10">
        <AvatarImage src={client.profilePhoto || ''} alt={`${client.name} profile photo`} />
        <AvatarFallback className="text-lg font-semibold bg-primary/10 text-primary">
          {getInitials(client.name)}
        </AvatarFallback>
      </Avatar>
      <div>
        <div className="flex items-center gap-3 mb-2">
          <h1 className="text-2xl font-bold tracking-tight">{client.name}</h1>
          {getTypeBadge(client.type)}
          {getStatusBadge(client.status)}
        </div>
        <div className="flex items-center gap-6 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <User className="h-4 w-4" />
            <span>{client.primaryContact}</span>
          </div>
          {client.industry && (
            <div className="flex items-center gap-1">
              <Building className="h-4 w-4" />
              <span>{client.industry}</span>
            </div>
          )}
          <div className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            <span>Last activity: {formatLastActivity(client.lastActivity)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClientBasicInfo;
