
import React from 'react';
import { Button } from '@/components/ui/button';
import { Phone, Mail, Edit, Plus, Trash2 } from 'lucide-react';
import { Client } from '@/types/client';

interface ClientActionsProps {
  client: Client;
  onEdit?: () => void;
  onNewMatter?: () => void;
  onDelete?: () => void;
}

const ClientActions: React.FC<ClientActionsProps> = ({ 
  client,
  onEdit, 
  onNewMatter,
  onDelete
}) => {
  const handleCall = () => {
    const phoneNumber = client.phones.find(p => p.isPrimary)?.value || client.phones[0]?.value;
    if (phoneNumber) {
      window.location.href = `tel:${phoneNumber}`;
    }
  };

  const handleEmail = () => {
    const email = client.emails.find(e => e.isPrimary)?.value || client.emails[0]?.value;
    if (email) {
      window.location.href = `mailto:${email}`;
    }
  };

  const primaryPhone = client.phones.find(p => p.isPrimary)?.value || client.phones[0]?.value;
  const primaryEmail = client.emails.find(e => e.isPrimary)?.value || client.emails[0]?.value;

  return (
    <div className="flex flex-col gap-2">
      <div className="flex gap-2">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleCall}
          disabled={!primaryPhone}
          className="flex-1"
        >
          <Phone className="h-4 w-4 mr-2" />
          Call
        </Button>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleEmail}
          disabled={!primaryEmail}
          className="flex-1"
        >
          <Mail className="h-4 w-4 mr-2" />
          Email
        </Button>
      </div>
      <div className="flex gap-2">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={onEdit}
          className="flex-1"
        >
          <Edit className="h-4 w-4 mr-2" />
          Edit
        </Button>
        <Button 
          size="sm" 
          onClick={onNewMatter}
          className="flex-1"
        >
          <Plus className="h-4 w-4 mr-2" />
          New Matter
        </Button>
      </div>
      <Button 
        variant="destructive" 
        size="sm" 
        onClick={onDelete}
        className="w-full"
      >
        <Trash2 className="h-4 w-4 mr-2" />
        Delete Client
      </Button>
    </div>
  );
};

export default ClientActions;
