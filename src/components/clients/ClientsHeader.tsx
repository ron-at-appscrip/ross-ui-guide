
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Filter, Plus } from 'lucide-react';

interface ClientsHeaderProps {
  showFilters: boolean;
  onToggleFilters: () => void;
}

const ClientsHeader = ({ showFilters, onToggleFilters }: ClientsHeaderProps) => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 className="text-3xl font-bold">Clients & Matters</h1>
        <p className="text-muted-foreground">
          Manage your client relationships and legal matters
        </p>
      </div>
      <div className="flex gap-2">
        <Button 
          variant="outline" 
          onClick={onToggleFilters}
        >
          <Filter className="h-4 w-4 mr-2" />
          Filters
        </Button>
        <Button onClick={() => navigate('/dashboard/clients/new')}>
          <Plus className="h-4 w-4 mr-2" />
          Add Client
        </Button>
      </div>
    </div>
  );
};

export default ClientsHeader;
