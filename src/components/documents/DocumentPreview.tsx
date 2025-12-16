
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Download, 
  Share, 
  Star, 
  FileText, 
  User, 
  Calendar,
  Tag,
  Eye,
  ExternalLink
} from 'lucide-react';
import { Document } from '@/types/document';
import { formatDistanceToNow } from 'date-fns';

interface DocumentPreviewProps {
  document: Document | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDownload: (document: Document) => void;
  onShare: (document: Document) => void;
  onStar: (document: Document) => void;
}

const DocumentPreview = ({
  document,
  open,
  onOpenChange,
  onDownload,
  onShare,
  onStar
}: DocumentPreviewProps) => {
  if (!document) return null;

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getCategoryColor = (category: string) => {
    const colors = {
      contract: 'bg-blue-100 text-blue-800',
      brief: 'bg-purple-100 text-purple-800',
      correspondence: 'bg-green-100 text-green-800',
      research: 'bg-yellow-100 text-yellow-800',
      evidence: 'bg-red-100 text-red-800',
      other: 'bg-gray-100 text-gray-800'
    };
    return colors[category as keyof typeof colors] || colors.other;
  };

  const renderPreviewContent = () => {
    if (document.type === 'image') {
      return (
        <div className="flex justify-center p-4 bg-gray-50 rounded-lg">
          <img 
            src={document.url} 
            alt={document.name}
            className="max-w-full max-h-96 object-contain rounded"
          />
        </div>
      );
    }

    if (document.type === 'pdf') {
      return (
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center justify-center h-64 border-2 border-dashed border-gray-300 rounded">
            <div className="text-center">
              <FileText className="w-12 h-12 text-gray-400 mx-auto mb-2" />
              <p className="text-sm text-gray-500">PDF Preview</p>
              <p className="text-xs text-gray-400">
                {document.metadata.pageCount} pages
              </p>
            </div>
          </div>
        </div>
      );
    }

    if (document.metadata.extractedText) {
      return (
        <div className="bg-gray-50 rounded-lg p-4 max-h-64 overflow-y-auto">
          <p className="text-sm whitespace-pre-wrap">
            {document.metadata.extractedText.substring(0, 1000)}
            {document.metadata.extractedText.length > 1000 && '...'}
          </p>
        </div>
      );
    }

    return (
      <div className="flex items-center justify-center h-32 bg-gray-50 rounded-lg">
        <div className="text-center">
          <FileText className="w-8 h-8 text-gray-400 mx-auto mb-2" />
          <p className="text-sm text-gray-500">Preview not available</p>
        </div>
      </div>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            {document.name}
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Preview Area */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Preview</h3>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" asChild>
                  <a href={document.url} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="w-4 h-4 mr-1" />
                    Open
                  </a>
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => onStar(document)}
                >
                  <Star className={`w-4 h-4 mr-1 ${document.isStarred ? 'fill-current text-yellow-500' : ''}`} />
                  {document.isStarred ? 'Starred' : 'Star'}
                </Button>
              </div>
            </div>
            
            {renderPreviewContent()}
          </div>

          {/* Document Info */}
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-4">Document Details</h3>
              
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Tag className="w-4 h-4 text-muted-foreground" />
                  <Badge className={getCategoryColor(document.category)}>
                    {document.category}
                  </Badge>
                </div>

                <div className="flex items-center gap-2 text-sm">
                  <Eye className="w-4 h-4 text-muted-foreground" />
                  <span>{formatFileSize(document.size)}</span>
                </div>

                <div className="flex items-center gap-2 text-sm">
                  <User className="w-4 h-4 text-muted-foreground" />
                  <span>Uploaded by {document.uploadedBy}</span>
                </div>

                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  <span>
                    Modified {formatDistanceToNow(new Date(document.modifiedAt), { addSuffix: true })}
                  </span>
                </div>
              </div>

              {document.metadata.pageCount && (
                <div className="mt-2 text-sm text-muted-foreground">
                  {document.metadata.pageCount} pages
                </div>
              )}

              {document.metadata.wordCount && (
                <div className="mt-1 text-sm text-muted-foreground">
                  {document.metadata.wordCount.toLocaleString()} words
                </div>
              )}
            </div>

            {document.description && (
              <div>
                <h4 className="font-medium mb-2">Description</h4>
                <p className="text-sm text-muted-foreground">
                  {document.description}
                </p>
              </div>
            )}

            {document.tags.length > 0 && (
              <div>
                <h4 className="font-medium mb-2">Tags</h4>
                <div className="flex flex-wrap gap-1">
                  {document.tags.map((tag) => (
                    <Badge key={tag} variant="outline" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            <Separator />

            <div className="flex flex-col gap-2">
              <Button onClick={() => onDownload(document)} className="w-full">
                <Download className="w-4 h-4 mr-2" />
                Download
              </Button>
              <Button 
                variant="outline" 
                onClick={() => onShare(document)} 
                className="w-full"
              >
                <Share className="w-4 h-4 mr-2" />
                Share
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DocumentPreview;
