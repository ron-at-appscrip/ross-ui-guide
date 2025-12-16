import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { 
  FileText, 
  Download, 
  Search,
  Eye,
  Image as ImageIcon,
  Calendar,
  Clock,
  FileArchive,
  Share2,
  Copy,
  ZoomIn,
  ZoomOut,
  RotateCw,
  ChevronLeft,
  ChevronRight,
  Grid3X3,
  List,
  Filter,
  Upload
} from 'lucide-react';
import { PatentResult } from '@/types/uspto';
import { useToast } from '@/hooks/use-toast';

interface PatentDocumentsTabProps {
  patent: PatentResult;
}

interface PatentDocument {
  documentId: string;
  title: string;
  type: 'application' | 'grant' | 'amendment' | 'office_action' | 'response' | 'correspondence';
  fileFormat: 'pdf' | 'tiff' | 'xml' | 'html';
  fileSize: number;
  uploadDate: string;
  pages: number;
  downloadUrl: string;
  viewerUrl: string;
  description?: string;
}

interface DrawingDocument {
  figureNumber: string;
  title: string;
  description: string;
  imageUrl: string;
  thumbnailUrl: string;
  fileSize: number;
  format: 'png' | 'jpg' | 'tiff' | 'pdf';
}

interface ExportOption {
  format: 'pdf' | 'word' | 'json' | 'csv' | 'xml';
  name: string;
  description: string;
  sections: string[];
  includeImages: boolean;
  includeAnalytics: boolean;
}

const PatentDocumentsTab: React.FC<PatentDocumentsTabProps> = ({ patent }) => {
  const [activeSubTab, setActiveSubTab] = useState('viewer');
  const [selectedDocument, setSelectedDocument] = useState<PatentDocument | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  const [currentPage, setCurrentPage] = useState(1);
  const [zoomLevel, setZoomLevel] = useState(100);
  const { toast } = useToast();

  // Mock data - in real implementation, this would come from API
  const documents: PatentDocument[] = [
    {
      documentId: 'PAT-GRANT-001',
      title: 'Patent Grant Document',
      type: 'grant',
      fileFormat: 'pdf',
      fileSize: 1245760,
      uploadDate: '2024-03-15',
      pages: 45,
      downloadUrl: '/docs/patent-grant.pdf',
      viewerUrl: '/docs/patent-grant.pdf',
      description: 'Official patent grant document from USPTO'
    },
    {
      documentId: 'PAT-APP-001',
      title: 'Original Patent Application',
      type: 'application',
      fileFormat: 'pdf',
      fileSize: 2048000,
      uploadDate: '2020-08-10',
      pages: 67,
      downloadUrl: '/docs/patent-application.pdf',
      viewerUrl: '/docs/patent-application.pdf',
      description: 'Initial patent application as filed'
    },
    {
      documentId: 'OA-001',
      title: 'Office Action - Non-Final Rejection',
      type: 'office_action',
      fileFormat: 'pdf',
      fileSize: 512000,
      uploadDate: '2023-05-15',
      pages: 12,
      downloadUrl: '/docs/office-action-1.pdf',
      viewerUrl: '/docs/office-action-1.pdf',
      description: 'First Office Action with rejections under 35 USC 103'
    },
    {
      documentId: 'RESP-001',
      title: 'Response to Office Action',
      type: 'response',
      fileFormat: 'pdf',
      fileSize: 768000,
      uploadDate: '2023-08-10',
      pages: 24,
      downloadUrl: '/docs/response-1.pdf',
      viewerUrl: '/docs/response-1.pdf',
      description: 'Attorney response with claim amendments'
    },
    {
      documentId: 'NOA-001',
      title: 'Notice of Allowance',
      type: 'correspondence',
      fileFormat: 'pdf',
      fileSize: 256000,
      uploadDate: '2023-11-20',
      pages: 8,
      downloadUrl: '/docs/notice-allowance.pdf',
      viewerUrl: '/docs/notice-allowance.pdf',
      description: 'Notice of Allowance from USPTO'
    },
    {
      documentId: 'AMD-001',
      title: 'Claim Amendments',
      type: 'amendment',
      fileFormat: 'pdf',
      fileSize: 384000,
      uploadDate: '2023-08-10',
      pages: 16,
      downloadUrl: '/docs/amendments.pdf',
      viewerUrl: '/docs/amendments.pdf',
      description: 'Amendment to claims in response to Office Action'
    }
  ];

  const drawings: DrawingDocument[] = [
    {
      figureNumber: 'FIG. 1',
      title: 'System Architecture Overview',
      description: 'Block diagram showing the main components of the legal document analysis system',
      imageUrl: '/images/patent-fig1.png',
      thumbnailUrl: '/images/patent-fig1-thumb.png',
      fileSize: 156432,
      format: 'png'
    },
    {
      figureNumber: 'FIG. 2',
      title: 'Process Flow Diagram',
      description: 'Flowchart illustrating the document analysis process from input to output',
      imageUrl: '/images/patent-fig2.png',
      thumbnailUrl: '/images/patent-fig2-thumb.png',
      fileSize: 203845,
      format: 'png'
    },
    {
      figureNumber: 'FIG. 3',
      title: 'User Interface Layout',
      description: 'Screenshot of the user interface showing analysis results and user interactions',
      imageUrl: '/images/patent-fig3.png',
      thumbnailUrl: '/images/patent-fig3-thumb.png',
      fileSize: 298756,
      format: 'png'
    },
    {
      figureNumber: 'FIG. 4',
      title: 'Machine Learning Model Architecture',
      description: 'Detailed diagram of the neural network architecture used for document classification',
      imageUrl: '/images/patent-fig4.png',
      thumbnailUrl: '/images/patent-fig4-thumb.png',
      fileSize: 445123,
      format: 'png'
    }
  ];

  const exportOptions: ExportOption[] = [
    {
      format: 'pdf',
      name: 'Complete Patent Report',
      description: 'Full patent analysis including all sections and visualizations',
      sections: ['Overview', 'Technical Details', 'Legal Information', 'Citations', 'Analytics'],
      includeImages: true,
      includeAnalytics: true
    },
    {
      format: 'word',
      name: 'Patent Summary Document',
      description: 'Editable summary report in Microsoft Word format',
      sections: ['Overview', 'Technical Details', 'Citations'],
      includeImages: true,
      includeAnalytics: false
    },
    {
      format: 'json',
      name: 'Structured Data Export',
      description: 'Machine-readable JSON format for API integration',
      sections: ['All Data'],
      includeImages: false,
      includeAnalytics: true
    },
    {
      format: 'csv',
      name: 'Citation Analysis Spreadsheet',
      description: 'CSV format for citation and analytics data analysis',
      sections: ['Citations', 'Analytics'],
      includeImages: false,
      includeAnalytics: true
    }
  ];

  const getDocumentTypeColor = (type: string) => {
    switch (type) {
      case 'grant': return 'bg-green-100 text-green-800 border-green-200';
      case 'application': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'office_action': return 'bg-red-100 text-red-800 border-red-200';
      case 'response': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'amendment': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'correspondence': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getDocumentIcon = (type: string) => {
    switch (type) {
      case 'grant': return <FileArchive className="h-4 w-4" />;
      case 'application': return <FileText className="h-4 w-4" />;
      case 'office_action': return <FileText className="h-4 w-4" />;
      case 'response': return <FileText className="h-4 w-4" />;
      case 'amendment': return <FileText className="h-4 w-4" />;
      case 'correspondence': return <FileText className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleDocumentSelect = (document: PatentDocument) => {
    setSelectedDocument(document);
    setCurrentPage(1);
    setZoomLevel(100);
  };

  const handleDownload = (document: PatentDocument) => {
    // In real implementation, this would trigger actual download
    toast({
      title: "Download Started",
      description: `Downloading ${document.title}...`
    });
  };

  const handleExport = (exportOption: ExportOption) => {
    toast({
      title: "Export Started",
      description: `Generating ${exportOption.name}...`
    });
  };

  const filteredDocuments = documents.filter(doc => 
    searchTerm === '' || 
    doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    doc.type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const sortedDocuments = filteredDocuments.sort((a, b) => 
    new Date(b.uploadDate).getTime() - new Date(a.uploadDate).getTime()
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold">Documents & Files</h2>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search documents..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-64"
            />
          </div>
          <Button variant="outline" size="sm">
            <Upload className="h-4 w-4 mr-2" />
            Upload
          </Button>
        </div>
      </div>

      <Tabs value={activeSubTab} onValueChange={setActiveSubTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="viewer" className="flex items-center gap-2">
            <Eye className="h-4 w-4" />
            Document Viewer
          </TabsTrigger>
          <TabsTrigger value="history" className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Prosecution History ({documents.length})
          </TabsTrigger>
          <TabsTrigger value="images" className="flex items-center gap-2">
            <ImageIcon className="h-4 w-4" />
            Images ({drawings.length})
          </TabsTrigger>
          <TabsTrigger value="export" className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            Export & Share
          </TabsTrigger>
        </TabsList>

        <TabsContent value="viewer" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Document List */}
            <Card className="lg:col-span-1">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">Document List</CardTitle>
                  <div className="flex items-center gap-1">
                    <Button
                      variant={viewMode === 'list' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setViewMode('list')}
                      className="p-2"
                    >
                      <List className="h-4 w-4" />
                    </Button>
                    <Button
                      variant={viewMode === 'grid' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setViewMode('grid')}
                      className="p-2"
                    >
                      <Grid3X3 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="max-h-96 overflow-y-auto">
                  {viewMode === 'list' ? (
                    <div className="space-y-2 p-4">
                      {sortedDocuments.map((document) => (
                        <div
                          key={document.documentId}
                          className={`p-3 border rounded cursor-pointer transition-colors hover:bg-gray-50 ${
                            selectedDocument?.documentId === document.documentId ? 'border-blue-500 bg-blue-50' : ''
                          }`}
                          onClick={() => handleDocumentSelect(document)}
                        >
                          <div className="flex items-start gap-3">
                            <div className="mt-1">
                              {getDocumentIcon(document.type)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="font-medium text-sm truncate">{document.title}</h4>
                              <div className="flex items-center gap-2 mt-1">
                                <Badge className={getDocumentTypeColor(document.type)} variant="outline">
                                  {document.type.replace('_', ' ').toUpperCase()}
                                </Badge>
                              </div>
                              <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                                <span>{document.pages} pages</span>
                                <span>{formatFileSize(document.fileSize)}</span>
                                <span>{new Date(document.uploadDate).toLocaleDateString()}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-2 p-4">
                      {sortedDocuments.map((document) => (
                        <div
                          key={document.documentId}
                          className={`p-2 border rounded cursor-pointer transition-colors hover:bg-gray-50 ${
                            selectedDocument?.documentId === document.documentId ? 'border-blue-500 bg-blue-50' : ''
                          }`}
                          onClick={() => handleDocumentSelect(document)}
                        >
                          <div className="text-center">
                            <div className="mb-2">
                              {getDocumentIcon(document.type)}
                            </div>
                            <h4 className="font-medium text-xs truncate">{document.title}</h4>
                            <p className="text-xs text-muted-foreground mt-1">{document.pages} pages</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Document Viewer */}
            <Card className="lg:col-span-2">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">
                    {selectedDocument ? selectedDocument.title : 'Select a document to view'}
                  </CardTitle>
                  {selectedDocument && (
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setZoomLevel(Math.max(50, zoomLevel - 25))}
                      >
                        <ZoomOut className="h-4 w-4" />
                      </Button>
                      <span className="text-sm font-medium">{zoomLevel}%</span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setZoomLevel(Math.min(200, zoomLevel + 25))}
                      >
                        <ZoomIn className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDownload(selectedDocument)}
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {selectedDocument ? (
                  <div className="space-y-4">
                    {/* PDF Viewer Placeholder */}
                    <div className="aspect-[8.5/11] bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center">
                      <div className="text-center">
                        <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                        <p className="text-lg font-medium text-gray-600">PDF Viewer</p>
                        <p className="text-sm text-gray-500 mt-2">
                          {selectedDocument.title} • Page {currentPage} of {selectedDocument.pages}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          Zoom: {zoomLevel}% • {formatFileSize(selectedDocument.fileSize)}
                        </p>
                      </div>
                    </div>

                    {/* Page Navigation */}
                    <div className="flex items-center justify-between">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                        disabled={currentPage === 1}
                      >
                        <ChevronLeft className="h-4 w-4 mr-2" />
                        Previous
                      </Button>
                      
                      <div className="flex items-center gap-2">
                        <span className="text-sm">Page</span>
                        <Input
                          type="number"
                          min="1"
                          max={selectedDocument.pages}
                          value={currentPage}
                          onChange={(e) => setCurrentPage(Math.min(selectedDocument.pages, Math.max(1, parseInt(e.target.value) || 1)))}
                          className="w-20 h-8 text-center"
                        />
                        <span className="text-sm">of {selectedDocument.pages}</span>
                      </div>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(Math.min(selectedDocument.pages, currentPage + 1))}
                        disabled={currentPage === selectedDocument.pages}
                      >
                        Next
                        <ChevronRight className="h-4 w-4 ml-2" />
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="aspect-[8.5/11] bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center">
                    <div className="text-center">
                      <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                      <p className="text-lg font-medium text-gray-600">No Document Selected</p>
                      <p className="text-sm text-gray-500 mt-2">
                        Choose a document from the list to view it here
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-muted-foreground">
              Prosecution documents in chronological order ({sortedDocuments.length} documents)
            </p>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Download All
            </Button>
          </div>

          <div className="space-y-4">
            {sortedDocuments.map((document, index) => (
              <Card key={document.documentId} className="border-l-4 border-l-blue-500">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4">
                      <div className="mt-1">
                        {getDocumentIcon(document.type)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="font-semibold">{document.title}</h4>
                          <Badge className={getDocumentTypeColor(document.type)}>
                            {document.type.replace('_', ' ').toUpperCase()}
                          </Badge>
                        </div>
                        {document.description && (
                          <p className="text-sm text-muted-foreground mb-2">{document.description}</p>
                        )}
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {new Date(document.uploadDate).toLocaleDateString()}
                          </span>
                          <span>{document.pages} pages</span>
                          <span>{formatFileSize(document.fileSize)}</span>
                          <span className="uppercase">{document.fileFormat}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDocumentSelect(document)}
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        View
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDownload(document)}
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Download
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="images" className="space-y-4">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-muted-foreground">
              Patent drawings and figures ({drawings.length} images)
            </p>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Download All Images
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {drawings.map((drawing, index) => (
              <Card key={index} className="overflow-hidden">
                <CardContent className="p-0">
                  <div className="aspect-video bg-gray-100 flex items-center justify-center">
                    <div className="text-center">
                      <ImageIcon className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm font-medium">{drawing.figureNumber}</p>
                    </div>
                  </div>
                  <div className="p-4">
                    <h4 className="font-semibold mb-2">{drawing.title}</h4>
                    <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                      {drawing.description}
                    </p>
                    <div className="flex items-center justify-between text-xs text-muted-foreground mb-3">
                      <span>{formatFileSize(drawing.fileSize)}</span>
                      <span className="uppercase">{drawing.format}</span>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" className="flex-1">
                        <Eye className="h-4 w-4 mr-2" />
                        View Full Size
                      </Button>
                      <Button variant="outline" size="sm">
                        <Download className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm">
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="export" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Download className="h-5 w-5" />
                  Export Options
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {exportOptions.map((option, index) => (
                    <div key={index} className="p-4 border rounded-lg">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h4 className="font-semibold">{option.name}</h4>
                          <p className="text-sm text-muted-foreground">{option.description}</p>
                        </div>
                        <Badge variant="outline" className="uppercase">
                          {option.format}
                        </Badge>
                      </div>
                      <div className="mt-3">
                        <p className="text-xs text-muted-foreground mb-1">Includes:</p>
                        <div className="flex flex-wrap gap-1">
                          {option.sections.map((section, sectionIndex) => (
                            <Badge key={sectionIndex} variant="secondary" className="text-xs">
                              {section}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <Button
                        className="w-full mt-3"
                        variant="outline"
                        onClick={() => handleExport(option)}
                      >
                        Export {option.format.toUpperCase()}
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Share2 className="h-5 w-5" />
                  Sharing & Collaboration
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-semibold mb-2">Generate Secure Link</h4>
                    <p className="text-sm text-muted-foreground mb-3">
                      Create a secure, time-limited link to share this patent analysis
                    </p>
                    <div className="space-y-3">
                      <div>
                        <label className="text-sm font-medium">Access Level:</label>
                        <select className="w-full mt-1 p-2 border rounded text-sm">
                          <option>View Only</option>
                          <option>View & Download</option>
                          <option>View & Comment</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-sm font-medium">Expiration:</label>
                        <select className="w-full mt-1 p-2 border rounded text-sm">
                          <option>7 days</option>
                          <option>30 days</option>
                          <option>90 days</option>
                          <option>No expiration</option>
                        </select>
                      </div>
                      <Button className="w-full">
                        <Share2 className="h-4 w-4 mr-2" />
                        Generate Link
                      </Button>
                    </div>
                  </div>

                  <div className="p-4 border rounded-lg">
                    <h4 className="font-semibold mb-2">Email Report</h4>
                    <p className="text-sm text-muted-foreground mb-3">
                      Send patent analysis directly to email recipients
                    </p>
                    <div className="space-y-3">
                      <Input placeholder="Enter email addresses..." />
                      <textarea
                        className="w-full p-2 border rounded text-sm resize-none"
                        rows={3}
                        placeholder="Add a message (optional)..."
                      />
                      <Button className="w-full">
                        Send Report
                      </Button>
                    </div>
                  </div>

                  <div className="p-4 border rounded-lg">
                    <h4 className="font-semibold mb-2">Bulk Operations</h4>
                    <p className="text-sm text-muted-foreground mb-3">
                      Perform batch operations on all documents
                    </p>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" className="flex-1">
                        <Download className="h-4 w-4 mr-2" />
                        Download All
                      </Button>
                      <Button variant="outline" size="sm" className="flex-1">
                        <FileArchive className="h-4 w-4 mr-2" />
                        Create Archive
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PatentDocumentsTab;