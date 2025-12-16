import React from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  FileText, 
  Download, 
  Share, 
  Edit, 
  Star, 
  Calendar, 
  User, 
  Eye, 
  Tag,
  Building
} from 'lucide-react';
import { Document, DocumentCategory } from '@/types/document';

interface DocumentPreviewModalProps {
  document: Document | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAction?: (action: string, documentId: string) => void;
}

const DocumentPreviewModal: React.FC<DocumentPreviewModalProps> = ({
  document,
  open,
  onOpenChange,
  onAction
}) => {
  if (!document) return null;

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getCategoryColor = (category: DocumentCategory) => {
    const colorMap = {
      'contracts_agreements': 'bg-blue-100 text-blue-700 border-blue-200',
      'employment_docs': 'bg-green-100 text-green-700 border-green-200',
      'pleadings': 'bg-red-100 text-red-700 border-red-200',
      'motions': 'bg-orange-100 text-orange-700 border-orange-200',
      'corporate_formation': 'bg-purple-100 text-purple-700 border-purple-200',
      'real_estate_purchase': 'bg-indigo-100 text-indigo-700 border-indigo-200',
      'wills_trusts': 'bg-teal-100 text-teal-700 border-teal-200',
      'other': 'bg-gray-100 text-gray-700 border-gray-200'
    };
    return colorMap[category] || 'bg-gray-100 text-gray-700 border-gray-200';
  };

  const formatCategoryName = (category: DocumentCategory) => {
    return category.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  const handleAction = (action: string) => {
    if (onAction) {
      onAction(action, document.id);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh]">
        <DialogHeader>
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-3">
              <FileText className="h-6 w-6 text-muted-foreground" />
              <div>
                <DialogTitle className="text-xl">{document.name}</DialogTitle>
                <DialogDescription className="mt-1">
                  Document preview and details
                </DialogDescription>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                size="sm"
                variant="ghost"
                onClick={() => handleAction('star')}
              >
                <Star className={`h-4 w-4 ${document.isStarred ? 'fill-current text-yellow-500' : 'text-muted-foreground'}`} />
              </Button>
              <Badge variant="outline" className={getCategoryColor(document.category)}>
                {formatCategoryName(document.category)}
              </Badge>
            </div>
          </div>
        </DialogHeader>

        <ScrollArea className="max-h-[60vh]">
          <div className="space-y-6">
            {/* Document Info */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Uploaded by</p>
                    <p className="text-sm text-muted-foreground">{document.uploadedBy}</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Created</p>
                    <p className="text-sm text-muted-foreground">{formatDate(document.uploadedAt)}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">File Size</p>
                    <p className="text-sm text-muted-foreground">{formatFileSize(document.size)}</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Building className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Type</p>
                    <p className="text-sm text-muted-foreground">{document.type.toUpperCase()}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Description */}
            {document.description && (
              <div>
                <h4 className="text-sm font-medium mb-2">Description</h4>
                <p className="text-sm text-muted-foreground bg-muted p-3 rounded-lg">
                  {document.description}
                </p>
              </div>
            )}

            {/* Tags */}
            {document.tags.length > 0 && (
              <div>
                <h4 className="text-sm font-medium mb-2 flex items-center space-x-2">
                  <Tag className="h-4 w-4" />
                  <span>Tags</span>
                </h4>
                <div className="flex flex-wrap gap-2">
                  {document.tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Metadata */}
            {document.metadata && (
              <div>
                <h4 className="text-sm font-medium mb-2">Document Metadata</h4>
                <div className="bg-muted p-3 rounded-lg space-y-2">
                  {document.metadata.pageCount && (
                    <div className="flex justify-between">
                      <span className="text-sm">Pages:</span>
                      <span className="text-sm font-medium">{document.metadata.pageCount}</span>
                    </div>
                  )}
                  {document.metadata.wordCount && (
                    <div className="flex justify-between">
                      <span className="text-sm">Words:</span>
                      <span className="text-sm font-medium">{document.metadata.wordCount.toLocaleString()}</span>
                    </div>
                  )}
                  {document.metadata.jurisdiction && (
                    <div className="flex justify-between">
                      <span className="text-sm">Jurisdiction:</span>
                      <span className="text-sm font-medium">{document.metadata.jurisdiction}</span>
                    </div>
                  )}
                  {document.metadata.practiceArea && (
                    <div className="flex justify-between">
                      <span className="text-sm">Practice Area:</span>
                      <span className="text-sm font-medium">{document.metadata.practiceArea}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* AI Analysis Preview */}
            {document.aiAnalysis && (
              <div>
                <h4 className="text-sm font-medium mb-2">AI Analysis</h4>
                <div className="bg-blue-50 p-3 rounded-lg">
                  <p className="text-sm text-blue-900 mb-2">
                    <strong>Risk Score:</strong> {document.aiAnalysis.riskScore}/100
                  </p>
                  <p className="text-sm text-blue-800">
                    {document.aiAnalysis.summary}
                  </p>
                </div>
              </div>
            )}

            {/* Sharing Info */}
            {document.sharedWith.length > 0 && (
              <div>
                <h4 className="text-sm font-medium mb-2">Shared With</h4>
                <div className="flex flex-wrap gap-2">
                  {document.sharedWith.map((userId) => (
                    <Badge key={userId} variant="outline" className="text-xs">
                      User {userId}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Document Content Preview */}
            <div>
              <h4 className="text-sm font-medium mb-2">Document Preview</h4>
              <div className="bg-muted p-4 rounded-lg">
                <div className="flex items-center justify-center h-32 text-muted-foreground">
                  <div className="text-center">
                    <Eye className="h-8 w-8 mx-auto mb-2" />
                    <p className="text-sm">Document preview not available</p>
                    <p className="text-xs">Click "View Document" to open in full viewer</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </ScrollArea>

        <DialogFooter>
          <div className="flex justify-between w-full">
            <div className="flex space-x-2">
              <Button variant="outline" onClick={() => handleAction('download')}>
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
              <Button variant="outline" onClick={() => handleAction('share')}>
                <Share className="h-4 w-4 mr-2" />
                Share
              </Button>
            </div>
            <div className="flex space-x-2">
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Close
              </Button>
              <Button onClick={() => handleAction('edit')}>
                <Edit className="h-4 w-4 mr-2" />
                Edit Document
              </Button>
            </div>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DocumentPreviewModal;