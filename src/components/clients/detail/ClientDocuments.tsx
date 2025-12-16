
import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Eye, Download, FileText, File, Calendar } from 'lucide-react';
import DocumentUploadModal from './modals/DocumentUploadModal';
import DocumentPreviewModal from './modals/DocumentPreviewModal';
import { useToast } from '@/hooks/use-toast';

interface ClientDocumentsProps {
  clientId: string;
}

// Mock data for documents
const mockDocuments = [
  {
    id: '1',
    name: 'Software License Agreement v2.1.pdf',
    type: 'Contract',
    matter: 'Contract Review - Software License',
    uploadDate: '2024-03-10',
    uploadedBy: 'Sarah Johnson',
    size: '2.4 MB',
    status: 'final'
  },
  {
    id: '2',
    name: 'Employment Policy Review.docx',
    type: 'Policy Document',
    matter: 'Employment Dispute Resolution',
    uploadDate: '2024-03-08',
    uploadedBy: 'Michael Chen',
    size: '1.8 MB',
    status: 'draft'
  },
  {
    id: '3',
    name: 'IP Portfolio Analysis.xlsx',
    type: 'Analysis',
    matter: 'IP Portfolio Review',
    uploadDate: '2024-03-05',
    uploadedBy: 'Sarah Johnson',
    size: '3.2 MB',
    status: 'final'
  },
  {
    id: '4',
    name: 'Client Correspondence.pdf',
    type: 'Correspondence',
    matter: 'General',
    uploadDate: '2024-03-01',
    uploadedBy: 'Legal Assistant',
    size: '856 KB',
    status: 'final'
  }
];

const ClientDocuments = ({ clientId }: ClientDocumentsProps) => {
  const { toast } = useToast();
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<any>(null);

  const getStatusBadge = (status: string) => {
    const variants = {
      final: 'default',
      draft: 'outline',
      review: 'secondary'
    } as const;
    
    return <Badge variant={variants[status as keyof typeof variants]}>{status}</Badge>;
  };

  const getFileIcon = (fileName: string) => {
    const extension = fileName.split('.').pop()?.toLowerCase();
    
    if (extension === 'pdf') {
      return <FileText className="h-4 w-4 text-red-500" />;
    }
    return <File className="h-4 w-4 text-blue-500" />;
  };

  const handleViewDocument = (document: any) => {
    setSelectedDocument(document);
    setShowPreviewModal(true);
  };

  const handleDownloadDocument = async (document: any) => {
    try {
      // Simulate download
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast({
        title: "Download Started",
        description: `${document.name} is being downloaded.`,
      });
    } catch (error) {
      toast({
        title: "Download Failed",
        description: "Failed to download document. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Mock client name for modals
  const clientName = "John Smith"; // This would come from props in real implementation

  return (
    <div className="space-y-6">
      {/* Document Summary */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Total Documents</p>
                <p className="text-2xl font-bold">{mockDocuments.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-green-600" />
              <div>
                <p className="text-sm text-muted-foreground">Final Documents</p>
                <p className="text-2xl font-bold text-green-600">
                  {mockDocuments.filter(doc => doc.status === 'final').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-orange-600" />
              <div>
                <p className="text-sm text-muted-foreground">Draft Documents</p>
                <p className="text-2xl font-bold text-orange-600">
                  {mockDocuments.filter(doc => doc.status === 'draft').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-blue-600" />
              <div>
                <p className="text-sm text-muted-foreground">Last Upload</p>
                <p className="text-lg font-bold text-blue-600">
                  {new Date(Math.max(...mockDocuments.map(doc => new Date(doc.uploadDate).getTime()))).toLocaleDateString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Documents Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Documents</CardTitle>
            <Button onClick={() => setShowUploadModal(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Upload Document
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Document</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Matter</TableHead>
                <TableHead>Upload Date</TableHead>
                <TableHead>Uploaded By</TableHead>
                <TableHead>Size</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-[100px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockDocuments.map((document) => (
                <TableRow key={document.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {getFileIcon(document.name)}
                      <span className="font-medium max-w-[200px] truncate">
                        {document.name}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>{document.type}</TableCell>
                  <TableCell className="max-w-[150px] truncate">{document.matter}</TableCell>
                  <TableCell>{document.uploadDate}</TableCell>
                  <TableCell>{document.uploadedBy}</TableCell>
                  <TableCell>{document.size}</TableCell>
                  <TableCell>{getStatusBadge(document.status)}</TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleViewDocument(document)}
                        title="View Document"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleDownloadDocument(document)}
                        title="Download Document"
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Document Modals */}
      <DocumentUploadModal
        isOpen={showUploadModal}
        onClose={() => setShowUploadModal(false)}
        clientId={clientId}
        clientName={clientName}
      />

      <DocumentPreviewModal
        isOpen={showPreviewModal}
        onClose={() => setShowPreviewModal(false)}
        document={selectedDocument}
        clientName={clientName}
      />
    </div>
  );
};

export default ClientDocuments;
