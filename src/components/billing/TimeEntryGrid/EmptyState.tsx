import React from 'react';
import { Button } from '@/components/ui/button';
import { Plus, Clock } from 'lucide-react';

interface EmptyStateProps {
  onAddEntry: () => void;
}

export const EmptyState = React.memo<EmptyStateProps>(({ onAddEntry }) => {
  return (
    <div className="flex items-center justify-center py-12">
      <div className="text-center">
        <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-medium mb-2">No time entries yet</h3>
        <p className="text-muted-foreground mb-4">Start tracking your time by adding your first entry.</p>
        <Button onClick={onAddEntry}>
          <Plus className="h-4 w-4 mr-2" />
          Add Your First Entry
        </Button>
      </div>
    </div>
  );
});

EmptyState.displayName = 'EmptyState';