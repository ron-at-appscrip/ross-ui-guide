
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Mail, Phone, MessageSquare } from 'lucide-react';

export const getCommunicationIcon = (type: string) => {
  switch (type) {
    case 'email':
      return <Mail className="h-4 w-4" />;
    case 'phone':
      return <Phone className="h-4 w-4" />;
    case 'meeting':
      return <MessageSquare className="h-4 w-4" />;
    default:
      return <MessageSquare className="h-4 w-4" />;
  }
};

export const getStatusBadge = (status: string) => {
  const variants = {
    sent: 'default',
    received: 'secondary',
    completed: 'default',
    scheduled: 'outline'
  } as const;
  
  return <Badge variant={variants[status as keyof typeof variants]}>{status}</Badge>;
};

export const getInitials = (name: string) => {
  return name.split(' ').map(n => n[0]).join('').toUpperCase();
};
