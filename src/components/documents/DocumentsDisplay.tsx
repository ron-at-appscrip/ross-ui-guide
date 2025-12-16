
import React from 'react';
import { Document } from '@/types/document';
import DocumentCard from './DocumentCard';
import DocumentList from './DocumentList';

interface DocumentsDisplayProps {
  documents: Document[];
  viewMode: 'grid' | 'list';
  selectedDocuments: string[];
  onSelectionChange: (documentIds: string[]) => void;
  onPreview: (document: Document) => void;
  onDownload: (document: Document) => void;
  onShare: (document: Document) => void;
  onStar: (document: Document) => void;
  onDelete: (document: Document) => void;
}

const DocumentsDisplay = ({
  documents,
  viewMode,
  selectedDocuments,
  onSelectionChange,
  onPreview,
  onDownload,
  onShare,
  onStar,
  onDelete
}: DocumentsDisplayProps) => {
  if (viewMode === 'grid') {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4 sm:gap-6">
        {documents.map((document) => (
          <DocumentCard
            key={document.id}
            document={document}
            onPreview={onPreview}
            onDownload={onDownload}
            onShare={onShare}
            onStar={onStar}
            onDelete={onDelete}
          />
        ))}
      </div>
    );
  }

  return (
    <DocumentList
      documents={documents}
      selectedDocuments={selectedDocuments}
      onSelectionChange={onSelectionChange}
      onPreview={onPreview}
      onDownload={onDownload}
      onShare={onShare}
      onStar={onStar}
      onDelete={onDelete}
    />
  );
};

export default DocumentsDisplay;
