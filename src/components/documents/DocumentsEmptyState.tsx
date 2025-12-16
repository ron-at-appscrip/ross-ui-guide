
import React from 'react';
import { Button } from '@/components/ui/button';

interface DocumentsEmptyStateProps {
  searchQuery: string;
  onUploadClick: () => void;
}

const DocumentsEmptyState = ({ searchQuery, onUploadClick }: DocumentsEmptyStateProps) => {
  return (
    <div className="text-center py-12">
      <div className="text-muted-foreground mb-4">
        {searchQuery ? 'No documents found matching your search.' : 'No documents uploaded yet.'}
      </div>
      <Button onClick={onUploadClick}>
        Upload Your First Document
      </Button>
    </div>
  );
};

export default DocumentsEmptyState;
