
import { useState, useMemo } from 'react';
import { Document, DocumentUpload } from '@/types/document';
import { useToast } from '@/hooks/use-toast';

// Mock data - replace with actual API calls
const mockDocuments: Document[] = [
  {
    id: '1',
    name: 'Smith vs Johnson Contract.pdf',
    type: 'pdf',
    size: 2048576,
    category: 'contract',
    status: 'active',
    uploadedAt: '2024-01-15T10:30:00Z',
    modifiedAt: '2024-01-20T14:22:00Z',
    uploadedBy: 'John Doe',
    tags: ['contract', 'litigation', 'smith'],
    description: 'Legal contract between Smith and Johnson regarding property transfer',
    url: '/documents/smith-johnson-contract.pdf',
    isStarred: true,
    sharedWith: ['user2', 'user3'],
    permissions: {
      canEdit: true,
      canDelete: true,
      canShare: true,
    },
    metadata: {
      pageCount: 12,
      wordCount: 3500,
      language: 'en',
      extractedText: 'This agreement is made between...'
    }
  },
  {
    id: '2',
    name: 'Research Notes - Patent Law.docx',
    type: 'docx',
    size: 1024000,
    category: 'research',
    status: 'active',
    uploadedAt: '2024-01-18T09:15:00Z',
    modifiedAt: '2024-01-22T16:45:00Z',
    uploadedBy: 'Jane Smith',
    tags: ['research', 'patent', 'intellectual-property'],
    description: 'Comprehensive research on patent law precedents',
    url: '/documents/patent-research.docx',
    isStarred: false,
    sharedWith: [],
    permissions: {
      canEdit: true,
      canDelete: true,
      canShare: true,
    },
    metadata: {
      wordCount: 8500,
      language: 'en'
    }
  },
  {
    id: '3',
    name: 'Evidence Photo - Scene 1.jpg',
    type: 'image',
    size: 3145728,
    category: 'evidence',
    status: 'active',
    uploadedAt: '2024-01-20T11:00:00Z',
    modifiedAt: '2024-01-20T11:00:00Z',
    uploadedBy: 'Mike Wilson',
    tags: ['evidence', 'photo', 'scene'],
    description: 'Crime scene photograph - main entrance',
    url: '/documents/evidence-scene1.jpg',
    thumbnail: '/documents/evidence-scene1-thumb.jpg',
    isStarred: false,
    sharedWith: ['user1'],
    permissions: {
      canEdit: false,
      canDelete: true,
      canShare: true,
    },
    metadata: {
      language: 'en'
    }
  }
];

export const useDocuments = () => {
  const { toast } = useToast();
  const [documents, setDocuments] = useState<Document[]>(mockDocuments);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState('name');
  const [selectedDocuments, setSelectedDocuments] = useState<string[]>([]);
  const [previewDocument, setPreviewDocument] = useState<Document | null>(null);
  const [uploadModalOpen, setUploadModalOpen] = useState(false);

  // Filter and sort documents
  const filteredAndSortedDocuments = useMemo(() => {
    let filtered = documents.filter(doc => {
      const searchLower = searchQuery.toLowerCase();
      return (
        doc.name.toLowerCase().includes(searchLower) ||
        doc.description?.toLowerCase().includes(searchLower) ||
        doc.tags.some(tag => tag.toLowerCase().includes(searchLower)) ||
        doc.category.toLowerCase().includes(searchLower)
      );
    });

    // Sort documents
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'date':
          return new Date(b.modifiedAt).getTime() - new Date(a.modifiedAt).getTime();
        case 'size':
          return b.size - a.size;
        case 'type':
          return a.type.localeCompare(b.type);
        default:
          return 0;
      }
    });

    return filtered;
  }, [documents, searchQuery, sortBy]);

  const handleUpload = async (upload: DocumentUpload) => {
    try {
      // Simulate API call
      const newDocument: Document = {
        id: Date.now().toString(),
        name: upload.file.name,
        type: upload.file.type.includes('image') ? 'image' : 
              upload.file.type.includes('pdf') ? 'pdf' : 'other',
        size: upload.file.size,
        category: upload.category,
        status: 'active',
        uploadedAt: new Date().toISOString(),
        modifiedAt: new Date().toISOString(),
        uploadedBy: 'Current User',
        tags: upload.tags,
        description: upload.description,
        url: URL.createObjectURL(upload.file),
        isStarred: false,
        sharedWith: [],
        permissions: {
          canEdit: true,
          canDelete: true,
          canShare: true,
        },
        metadata: {
          language: 'en'
        }
      };

      setDocuments(prev => [newDocument, ...prev]);
      
      toast({
        title: 'Document uploaded successfully',
        description: `${upload.file.name} has been uploaded to your library.`,
      });
    } catch (error) {
      toast({
        title: 'Upload failed',
        description: 'There was an error uploading your document. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handlePreview = (document: Document) => {
    setPreviewDocument(document);
  };

  const handleDownload = (document: Document) => {
    // Simulate download
    const link = window.document.createElement('a');
    link.href = document.url;
    link.download = document.name;
    link.click();
    
    toast({
      title: 'Download started',
      description: `${document.name} is being downloaded.`,
    });
  };

  const handleShare = (document: Document) => {
    // Simulate sharing - copy link to clipboard
    navigator.clipboard.writeText(document.url);
    toast({
      title: 'Link copied',
      description: 'Document link has been copied to your clipboard.',
    });
  };

  const handleStar = (document: Document) => {
    setDocuments(prev => 
      prev.map(doc => 
        doc.id === document.id 
          ? { ...doc, isStarred: !doc.isStarred }
          : doc
      )
    );
    
    toast({
      title: document.isStarred ? 'Removed from favorites' : 'Added to favorites',
      description: `${document.name} has been ${document.isStarred ? 'removed from' : 'added to'} your favorites.`,
    });
  };

  const handleDelete = (document: Document) => {
    setDocuments(prev => prev.filter(doc => doc.id !== document.id));
    toast({
      title: 'Document deleted',
      description: `${document.name} has been deleted.`,
    });
  };

  const handleBulkAction = (action: 'delete' | 'download' | 'share') => {
    const selectedDocs = documents.filter(doc => selectedDocuments.includes(doc.id));
    
    switch (action) {
      case 'delete':
        setDocuments(prev => prev.filter(doc => !selectedDocuments.includes(doc.id)));
        setSelectedDocuments([]);
        toast({
          title: 'Documents deleted',
          description: `${selectedDocs.length} document(s) have been deleted.`,
        });
        break;
      case 'download':
        selectedDocs.forEach(handleDownload);
        break;
      case 'share':
        toast({
          title: 'Bulk sharing',
          description: `Sharing options for ${selectedDocs.length} document(s).`,
        });
        break;
    }
  };

  return {
    documents,
    filteredAndSortedDocuments,
    searchQuery,
    setSearchQuery,
    viewMode,
    setViewMode,
    sortBy,
    setSortBy,
    selectedDocuments,
    setSelectedDocuments,
    previewDocument,
    setPreviewDocument,
    uploadModalOpen,
    setUploadModalOpen,
    handleUpload,
    handlePreview,
    handleDownload,
    handleShare,
    handleStar,
    handleDelete,
    handleBulkAction
  };
};
