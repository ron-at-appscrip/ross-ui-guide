
import React from 'react';
import { Button } from '@/components/ui/button';
import { Filter, Plus } from 'lucide-react';

interface MattersHeaderProps {
  showFilters: boolean;
  onToggleFilters: () => void;
  onAddMatter: () => void;
}

const MattersHeader = ({ showFilters, onToggleFilters, onAddMatter }: MattersHeaderProps) => {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Matters</h1>
        <p className="text-muted-foreground">
          Manage all legal matters and cases
        </p>
      </div>
      <div className="flex gap-2">
        <Button 
          variant="outline" 
          onClick={onToggleFilters}
          className={showFilters ? "bg-muted" : ""}
        >
          <Filter className="h-4 w-4 mr-2" />
          Filters
        </Button>
        <Button onClick={onAddMatter}>
          <Plus className="h-4 w-4 mr-2" />
          New Matter
        </Button>
      </div>
    </div>
  );
};

export default MattersHeader;
