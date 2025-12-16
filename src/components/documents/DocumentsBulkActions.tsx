
import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Trash2, Download, Share } from 'lucide-react';

interface DocumentsBulkActionsProps {
  selectedCount: number;
  onBulkAction: (action: 'delete' | 'download' | 'share') => void;
}

const DocumentsBulkActions = ({ selectedCount, onBulkAction }: DocumentsBulkActionsProps) => {
  if (selectedCount === 0) return null;

  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 sm:p-4 bg-blue-50 border border-blue-200 rounded-lg gap-3 sm:gap-0">
      <div className="flex items-center gap-2">
        <Badge variant="secondary">
          {selectedCount} selected
        </Badge>
        <span className="text-xs sm:text-sm text-muted-foreground">
          {selectedCount} document(s) selected
        </span>
      </div>
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onBulkAction('download')}
          className="flex-1 sm:flex-none"
        >
          <Download className="w-4 h-4 mr-1" />
          <span className="hidden sm:inline">Download</span>
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onBulkAction('share')}
          className="flex-1 sm:flex-none"
        >
          <Share className="w-4 h-4 mr-1" />
          <span className="hidden sm:inline">Share</span>
        </Button>
        <Button
          variant="destructive"
          size="sm"
          onClick={() => onBulkAction('delete')}
          className="flex-1 sm:flex-none"
        >
          <Trash2 className="w-4 h-4 mr-1" />
          <span className="hidden sm:inline">Delete</span>
        </Button>
      </div>
    </div>
  );
};

export default DocumentsBulkActions;
