import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { 
  Search, 
  FileText, 
  Calendar,
  Filter,
  Clock,
  User,
  FolderOpen,
  File,
  FileImage,
  FileSpreadsheet,
  Mail,
  X,
  Check
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface Document {
  id: string;
  name: string;
  type: 'contract' | 'brief' | 'memo' | 'letter' | 'filing' | 'template';
  size: number;
  mimeType: string;
  uploadedAt: string;
  matterId?: string;
  matterName?: string;
  clientId?: string;
  clientName?: string;
  tags: string[];
  version?: string;
  lastModified: string;
  uploadedBy: string;
}

interface DocumentPickerProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectDocuments: (documents: Document[]) => void;
  matterId?: string;
  clientId?: string;
  multiple?: boolean;
}

// Mock data - in real app, this would come from API
const mockDocuments: Document[] = [
  {
    id: '1',
    name: 'Smith Employment Agreement v2.3.docx',
    type: 'contract',
    size: 245760,
    mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    uploadedAt: '2024-01-15T10:30:00Z',
    matterId: 'matter-123',
    matterName: 'Smith vs. TechCorp',
    clientId: 'client-456',
    clientName: 'John Smith',
    tags: ['employment', 'contract', 'final'],
    version: '2.3',
    lastModified: '2024-01-15T10:30:00Z',
    uploadedBy: 'Sarah Johnson'
  },
  {
    id: '2',
    name: 'Motion to Dismiss - DRAFT.pdf',
    type: 'filing',
    size: 512000,
    mimeType: 'application/pdf',
    uploadedAt: '2024-01-14T15:45:00Z',
    matterId: 'matter-789',
    matterName: 'Anderson LLC Dispute',
    clientId: 'client-101',
    clientName: 'Anderson LLC',
    tags: ['motion', 'draft', 'litigation'],
    lastModified: '2024-01-14T15:45:00Z',
    uploadedBy: 'Michael Chen'
  },
  {
    id: '3',
    name: 'Legal Research Memo - Patent Law.pdf',
    type: 'memo',
    size: 823456,
    mimeType: 'application/pdf',
    uploadedAt: '2024-01-13T09:00:00Z',
    tags: ['research', 'patent', 'memo'],
    lastModified: '2024-01-13T09:00:00Z',
    uploadedBy: 'Emily Davis'
  },
  {
    id: '4',
    name: 'NDA Template - Standard.docx',
    type: 'template',
    size: 98304,
    mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    uploadedAt: '2023-12-01T08:00:00Z',
    tags: ['template', 'nda', 'standard'],
    lastModified: '2023-12-01T08:00:00Z',
    uploadedBy: 'Legal Ops Team'
  }
];

const getDocumentIcon = (mimeType: string, name: string) => {
  if (mimeType.includes('pdf')) return <FileText className="h-5 w-5 text-red-500" />;
  if (mimeType.includes('word') || name.endsWith('.docx')) return <FileText className="h-5 w-5 text-blue-500" />;
  if (mimeType.includes('sheet') || name.endsWith('.xlsx')) return <FileSpreadsheet className="h-5 w-5 text-green-500" />;
  if (mimeType.includes('image')) return <FileImage className="h-5 w-5 text-purple-500" />;
  if (name.endsWith('.eml') || name.endsWith('.msg')) return <Mail className="h-5 w-5 text-orange-500" />;
  return <File className="h-5 w-5 text-muted-foreground" />;
};

const formatFileSize = (bytes: number) => {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / 1048576).toFixed(1) + ' MB';
};

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  
  if (days === 0) return 'Today';
  if (days === 1) return 'Yesterday';
  if (days < 7) return `${days} days ago`;
  if (days < 30) return `${Math.floor(days / 7)} weeks ago`;
  return date.toLocaleDateString();
};

export const DocumentPicker: React.FC<DocumentPickerProps> = ({
  isOpen,
  onClose,
  onSelectDocuments,
  matterId,
  clientId,
  multiple = true
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTab, setSelectedTab] = useState('recent');
  const [selectedDocuments, setSelectedDocuments] = useState<Set<string>>(new Set());
  const [filteredDocuments, setFilteredDocuments] = useState<Document[]>([]);

  useEffect(() => {
    // Filter documents based on tab and search
    let docs = [...mockDocuments];
    
    // Tab filtering
    switch (selectedTab) {
      case 'matter':
        if (matterId) {
          docs = docs.filter(d => d.matterId === matterId);
        }
        break;
      case 'templates':
        docs = docs.filter(d => d.type === 'template');
        break;
      case 'recent':
        // Sort by upload date, most recent first
        docs.sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime());
        docs = docs.slice(0, 10);
        break;
    }
    
    // Search filtering
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      docs = docs.filter(d => 
        d.name.toLowerCase().includes(query) ||
        d.tags.some(tag => tag.toLowerCase().includes(query)) ||
        d.matterName?.toLowerCase().includes(query) ||
        d.clientName?.toLowerCase().includes(query)
      );
    }
    
    setFilteredDocuments(docs);
  }, [selectedTab, searchQuery, matterId]);

  const handleDocumentToggle = (docId: string) => {
    if (multiple) {
      const newSelection = new Set(selectedDocuments);
      if (newSelection.has(docId)) {
        newSelection.delete(docId);
      } else {
        newSelection.add(docId);
      }
      setSelectedDocuments(newSelection);
    } else {
      setSelectedDocuments(new Set([docId]));
    }
  };

  const handleSelectDocuments = () => {
    const selected = filteredDocuments.filter(d => selectedDocuments.has(d.id));
    onSelectDocuments(selected);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl h-[600px] p-0 flex flex-col">
        <DialogHeader className="flex-shrink-0 px-6 pt-6 pb-4 border-b border-border">
          <DialogTitle className="text-xl">Document Library</DialogTitle>
          <div className="mt-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search documents by name, matter, client, or tags..."
                className="pl-10"
              />
            </div>
          </div>
        </DialogHeader>

        <Tabs value={selectedTab} onValueChange={setSelectedTab} className="flex-1 flex flex-col overflow-hidden">
          <TabsList className="flex-shrink-0 mx-6 mt-2">
            <TabsTrigger value="recent" className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Recent
            </TabsTrigger>
            <TabsTrigger value="matter" className="flex items-center gap-2">
              <FolderOpen className="h-4 w-4" />
              Matter Documents
            </TabsTrigger>
            <TabsTrigger value="templates" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Templates
            </TabsTrigger>
            <TabsTrigger value="all" className="flex items-center gap-2">
              <File className="h-4 w-4" />
              All Documents
            </TabsTrigger>
          </TabsList>

          <div className="flex-1 overflow-hidden px-6 py-4">
            <ScrollArea className="h-full">
              <div className="space-y-2">
                {filteredDocuments.length === 0 ? (
                  <div className="text-center py-12">
                    <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-muted-foreground">No documents found</p>
                  </div>
                ) : (
                  filteredDocuments.map((doc) => (
                  <Card
                    key={doc.id}
                    className={cn(
                      'p-4 cursor-pointer transition-colors hover:bg-muted/50',
                      selectedDocuments.has(doc.id) && 'border-primary bg-primary/5'
                    )}
                    onClick={() => handleDocumentToggle(doc.id)}
                  >
                    <div className="flex items-start gap-4">
                      <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-muted">
                        {getDocumentIcon(doc.mimeType, doc.name)}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1">
                            <h4 className="font-medium text-sm text-foreground truncate">
                              {doc.name}
                            </h4>
                            <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                {formatDate(doc.uploadedAt)}
                              </span>
                              <span>{formatFileSize(doc.size)}</span>
                              {doc.version && (
                                <Badge variant="outline" className="text-xs">
                                  v{doc.version}
                                </Badge>
                              )}
                            </div>
                            {(doc.matterName || doc.clientName) && (
                              <div className="flex items-center gap-2 mt-1">
                                {doc.matterName && (
                                  <Badge variant="secondary" className="text-xs">
                                    <FolderOpen className="h-3 w-3 mr-1" />
                                    {doc.matterName}
                                  </Badge>
                                )}
                                {doc.clientName && (
                                  <Badge variant="secondary" className="text-xs">
                                    <User className="h-3 w-3 mr-1" />
                                    {doc.clientName}
                                  </Badge>
                                )}
                              </div>
                            )}
                            {doc.tags.length > 0 && (
                              <div className="flex items-center gap-1 mt-2">
                                {doc.tags.map((tag) => (
                                  <Badge key={tag} variant="outline" className="text-xs">
                                    {tag}
                                  </Badge>
                                ))}
                              </div>
                            )}
                          </div>
                          
                          {selectedDocuments.has(doc.id) && (
                            <div className="flex-shrink-0">
                              <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                                <Check className="h-3 w-3 text-primary-foreground" />
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </Card>
                ))
              )}
              </div>
            </ScrollArea>
          </div>

          <div className="flex-shrink-0 flex items-center justify-between px-6 py-4 border-t border-border bg-muted/50">
            <div className="text-sm text-muted-foreground">
              {selectedDocuments.size} document{selectedDocuments.size !== 1 ? 's' : ''} selected
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button 
                onClick={handleSelectDocuments} 
                disabled={selectedDocuments.size === 0}
              >
                Add Selected
              </Button>
            </div>
          </div>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};