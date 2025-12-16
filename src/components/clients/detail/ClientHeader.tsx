
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { Client } from '@/types/client';

interface ClientHeaderProps {
  client: Client;
}

const ClientHeader = ({ client }: ClientHeaderProps) => {
  return (
    <div className="mb-6">
      <Link to="/dashboard/clients" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4">
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Clients
      </Link>
    </div>
  );
};

export default ClientHeader;
