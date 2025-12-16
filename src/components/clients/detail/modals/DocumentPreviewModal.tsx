import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  FileText, 
  Download, 
  Edit, 
  Trash2, 
  Share2,
  Eye,
  Calendar,
  User,
  Tag,
  Briefcase,
  AlertTriangle
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Document {
  id: string;
  name: string;
  type: string;
  matter: string;
  uploadDate: string;
  uploadedBy: string;
  size: string;
  status: 'final' | 'draft' | 'review';
  url?: string;
  description?: string;
  tags?: string[];
}

interface DocumentPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  document: Document | null;
  clientName: string;
}

const DocumentPreviewModal = ({ isOpen, onClose, document, clientName }: DocumentPreviewModalProps) => {
  const { toast } = useToast();
  const [isDownloading, setIsDownloading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  if (!document) return null;

  const getStatusBadge = (status: string) => {
    const variants = {
      final: { color: 'bg-green-50 text-green-700 border-green-200', label: 'Final' },
      draft: { color: 'bg-yellow-50 text-yellow-700 border-yellow-200', label: 'Draft' },
      review: { color: 'bg-blue-50 text-blue-700 border-blue-200', label: 'Under Review' }
    };
    
    const variant = variants[status as keyof typeof variants] || variants.draft;
    return (
      <Badge variant="outline" className={variant.color}>
        {variant.label}
      </Badge>
    );
  };

  const getFileIcon = (fileName: string) => {
    const extension = fileName.split('.').pop()?.toLowerCase();
    
    switch (extension) {
      case 'pdf':
        return <FileText className="h-8 w-8 text-red-500" />;
      case 'doc':
      case 'docx':
        return <FileText className="h-8 w-8 text-blue-500" />;
      case 'xls':
      case 'xlsx':
        return <FileText className="h-8 w-8 text-green-500" />;
      default:
        return <FileText className="h-8 w-8 text-gray-500" />;
    }
  };

  const handleDownload = async () => {
    setIsDownloading(true);
    try {
      // Simulate download
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      toast({
        title: "Download Complete",
        description: `${document.name} has been downloaded.`,
      });
    } catch (error) {
      toast({
        title: "Download Failed",
        description: "Failed to download document. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsDownloading(false);
    }
  };

  const handleShare = () => {
    // Simulate sharing functionality
    navigator.clipboard.writeText(`https://example.com/documents/${document.id}`);
    toast({
      title: "Link Copied",
      description: "Document share link has been copied to clipboard.",
    });
  };

  const handleEdit = () => {
    toast({
      title: "Edit Document",
      description: "Edit functionality would be implemented here.",
    });
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      // Simulate deletion
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: "Document Deleted",
        description: `${document.name} has been deleted successfully.`,
      });
      
      onClose();
    } catch (error) {
      toast({
        title: "Delete Failed",
        description: "Failed to delete document. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const renderPreview = () => {
    const extension = document.name.split('.').pop()?.toLowerCase();
    
    if (extension === 'pdf') {
      return (
        <div className="bg-gray-50 border rounded-lg p-8 text-center">
          <FileText className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <p className="text-lg font-medium mb-2">PDF Document</p>
          <p className="text-sm text-muted-foreground">
            Click "Download" to view the full PDF document
          </p>
        </div>
      );
    }
    
    if (['doc', 'docx'].includes(extension || '')) {
      return (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-8 text-center">
          <FileText className="h-16 w-16 text-blue-500 mx-auto mb-4" />
          <p className="text-lg font-medium mb-2">Word Document</p>
          <p className="text-sm text-muted-foreground">
            Click "Download" to open in Microsoft Word or compatible application
          </p>
        </div>
      );
    }
    
    if (['xls', 'xlsx'].includes(extension || '')) {
      return (
        <div className="bg-green-50 border border-green-200 rounded-lg p-8 text-center">
          <FileText className="h-16 w-16 text-green-500 mx-auto mb-4" />
          <p className="text-lg font-medium mb-2">Excel Spreadsheet</p>
          <p className="text-sm text-muted-foreground">
            Click "Download" to open in Microsoft Excel or compatible application
          </p>
        </div>
      );
    }
    
    // Default preview for other file types
    return (
      <div className="bg-gray-50 border rounded-lg p-8 text-center">
        <FileText className="h-16 w-16 text-gray-500 mx-auto mb-4" />
        <p className="text-lg font-medium mb-2">Document Preview</p>
        <p className="text-sm text-muted-foreground">
          Preview not available for this file type. Click "Download" to view the document.
        </p>
      </div>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5" />
            Document Preview
          </DialogTitle>
          <DialogDescription>
            Viewing document for {clientName}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Document Header */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                {getFileIcon(document.name)}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <h2 className="text-xl font-semibold truncate">{document.name}</h2>
                    {getStatusBadge(document.status)}
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <Tag className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">Type:</span>
                      <span className="font-medium">{document.type}</span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Briefcase className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">Matter:</span>
                      <span className="font-medium truncate">{document.matter}</span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">Uploaded:</span>
                      <span className="font-medium">{new Date(document.uploadDate).toLocaleDateString()}</span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">By:</span>
                      <span className="font-medium">{document.uploadedBy}</span>
                    </div>
                  </div>
                  
                  <div className="mt-3 text-sm text-muted-foreground">
                    File Size: {document.size}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Document Description */}
          {document.description && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Description</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm">{document.description}</p>
              </CardContent>
            </Card>
          )}

          {/* Document Preview */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Preview</CardTitle>
            </CardHeader>
            <CardContent>
              {renderPreview()}
            </CardContent>
          </Card>

          {/* Document Metadata */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Document Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="font-medium mb-1">Document ID</p>
                  <p className="text-muted-foreground">{document.id}</p>
                </div>
                
                <div>
                  <p className="font-medium mb-1">File Format</p>
                  <p className="text-muted-foreground uppercase">
                    {document.name.split('.').pop()}
                  </p>
                </div>
                
                <div>
                  <p className="font-medium mb-1">Client</p>
                  <p className="text-muted-foreground">{clientName}</p>
                </div>
                
                <div>
                  <p className="font-medium mb-1">Last Modified</p>
                  <p className="text-muted-foreground">
                    {new Date(document.uploadDate).toLocaleString()}
                  </p>
                </div>
              </div>
              
              {document.tags && document.tags.length > 0 && (
                <>
                  <Separator className="my-4" />
                  <div>
                    <p className="font-medium mb-2">Tags</p>
                    <div className="flex flex-wrap gap-2">
                      {document.tags.map((tag, index) => (
                        <Badge key={index} variant="secondary">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Security Notice */}
          <Card className="border-orange-200 bg-orange-50">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-orange-600 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-orange-800">
                    Confidential Document
                  </p>
                  <p className="text-sm text-orange-700 mt-1">
                    This document contains confidential client information. 
                    Handle according to your firm's data protection policies.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <DialogFooter className="gap-3 pt-6">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
          <Button
            variant="outline"
            onClick={handleShare}
            className="gap-2"
          >
            <Share2 className="h-4 w-4" />
            Share
          </Button>
          <Button
            variant="outline"
            onClick={handleEdit}
            className="gap-2"
          >
            <Edit className="h-4 w-4" />
            Edit
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={isDeleting}
            className="gap-2"
          >
            <Trash2 className="h-4 w-4" />
            {isDeleting ? "Deleting..." : "Delete"}
          </Button>
          <Button
            onClick={handleDownload}
            disabled={isDownloading}
            className="gap-2"
          >
            <Download className="h-4 w-4" />
            {isDownloading ? "Downloading..." : "Download"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DocumentPreviewModal;