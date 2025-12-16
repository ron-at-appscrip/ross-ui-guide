import { 
  Document, 
  DocumentFilters, 
  DocumentUpload, 
  DocumentCategory, 
  DocumentSubtype,
  DocumentStatus 
} from '@/types/document';

// Mock data for development
const mockDocuments: Document[] = [
  {
    id: '1',
    name: 'Smith vs Johnson Contract.pdf',
    type: 'pdf',
    size: 2048576,
    category: 'contracts_agreements',
    subtype: 'nda',
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
      extractedText: 'This agreement is made between...',
      jurisdiction: 'California',
      practiceArea: 'Contract Law'
    },
    version: 1
  },
  {
    id: '2',
    name: 'Employment Agreement - Sarah Wilson.docx',
    type: 'docx',
    size: 1024000,
    category: 'employment_docs',
    subtype: 'employment_contract',
    status: 'active',
    uploadedAt: '2024-01-18T09:15:00Z',
    modifiedAt: '2024-01-22T16:45:00Z',
    uploadedBy: 'Jane Smith',
    tags: ['employment', 'contract', 'wilson'],
    description: 'Employment agreement for Sarah Wilson',
    url: '/documents/employment-sarah-wilson.docx',
    isStarred: false,
    sharedWith: [],
    permissions: {
      canEdit: true,
      canDelete: true,
      canShare: true
    },
    metadata: {
      pageCount: 8,
      wordCount: 2200,
      language: 'en',
      jurisdiction: 'New York',
      practiceArea: 'Employment Law'
    },
    version: 1
  },
  {
    id: '3',
    name: 'Motion to Dismiss - Case 2024-001.pdf',
    type: 'pdf',
    size: 1536000,
    category: 'motions',
    subtype: 'motion_to_dismiss',
    status: 'active',
    uploadedAt: '2024-01-20T11:30:00Z',
    modifiedAt: '2024-01-20T11:30:00Z',
    uploadedBy: 'Michael Johnson',
    tags: ['motion', 'dismiss', 'litigation'],
    description: 'Motion to dismiss filed in Case 2024-001',
    url: '/documents/motion-dismiss-2024-001.pdf',
    isStarred: true,
    sharedWith: ['user1'],
    permissions: {
      canEdit: true,
      canDelete: true,
      canShare: true
    },
    metadata: {
      pageCount: 15,
      wordCount: 4200,
      language: 'en',
      jurisdiction: 'Federal',
      practiceArea: 'Litigation'
    },
    version: 1
  },
  {
    id: '4',
    name: 'Corporate Bylaws - TechCorp Inc.pdf',
    type: 'pdf',
    size: 2560000,
    category: 'corporate_formation',
    subtype: 'bylaws',
    status: 'active',
    uploadedAt: '2024-01-22T14:20:00Z',
    modifiedAt: '2024-01-22T14:20:00Z',
    uploadedBy: 'Emily Davis',
    tags: ['corporate', 'bylaws', 'techcorp'],
    description: 'Corporate bylaws for TechCorp Inc.',
    url: '/documents/bylaws-techcorp.pdf',
    isStarred: false,
    sharedWith: ['user2', 'user3', 'user4'],
    permissions: {
      canEdit: true,
      canDelete: true,
      canShare: true
    },
    metadata: {
      pageCount: 25,
      wordCount: 8500,
      language: 'en',
      jurisdiction: 'Delaware',
      practiceArea: 'Corporate Law'
    },
    version: 1
  },
  {
    id: '5',
    name: 'Real Estate Purchase Agreement.pdf',
    type: 'pdf',
    size: 1800000,
    category: 'real_estate_purchase',
    subtype: 'purchase_agreement',
    status: 'active',
    uploadedAt: '2024-01-25T09:45:00Z',
    modifiedAt: '2024-01-25T09:45:00Z',
    uploadedBy: 'Robert Taylor',
    tags: ['real-estate', 'purchase', 'agreement'],
    description: 'Real estate purchase agreement for residential property',
    url: '/documents/real-estate-purchase.pdf',
    isStarred: true,
    sharedWith: [],
    permissions: {
      canEdit: true,
      canDelete: true,
      canShare: true
    },
    metadata: {
      pageCount: 18,
      wordCount: 5200,
      language: 'en',
      jurisdiction: 'California',
      practiceArea: 'Real Estate Law'
    },
    version: 1
  }
];

export class DocumentService {
  private documents: Document[] = [...mockDocuments];

  // Document CRUD Operations
  async createDocument(data: Partial<Document>): Promise<Document> {
    const newDocument: Document = {
      id: (this.documents.length + 1).toString(),
      name: data.name || 'Untitled Document',
      type: data.type || 'pdf',
      size: data.size || 0,
      category: data.category || 'other',
      subtype: data.subtype,
      status: data.status || 'active',
      uploadedAt: new Date().toISOString(),
      modifiedAt: new Date().toISOString(),
      uploadedBy: data.uploadedBy || 'Current User',
      tags: data.tags || [],
      description: data.description,
      url: data.url || '',
      isStarred: data.isStarred || false,
      sharedWith: data.sharedWith || [],
      permissions: data.permissions || {
        canEdit: true,
        canDelete: true,
        canShare: true
      },
      metadata: data.metadata || {},
      version: 1,
      parentId: data.parentId,
      aiAnalysis: data.aiAnalysis
    };

    this.documents.push(newDocument);
    return newDocument;
  }

  async getDocument(id: string): Promise<Document | null> {
    const document = this.documents.find(d => d.id === id);
    return document || null;
  }

  async updateDocument(id: string, updates: Partial<Document>): Promise<Document> {
    const index = this.documents.findIndex(d => d.id === id);
    if (index === -1) throw new Error('Document not found');

    this.documents[index] = {
      ...this.documents[index],
      ...updates,
      modifiedAt: new Date().toISOString()
    };

    return this.documents[index];
  }

  async deleteDocument(id: string): Promise<void> {
    const index = this.documents.findIndex(d => d.id === id);
    if (index === -1) throw new Error('Document not found');
    
    this.documents.splice(index, 1);
  }

  // Document Querying
  async getDocuments(filters?: DocumentFilters): Promise<Document[]> {
    let filtered = [...this.documents];

    if (filters?.category?.length) {
      filtered = filtered.filter(d => filters.category!.includes(d.category));
    }

    if (filters?.status?.length) {
      filtered = filtered.filter(d => filters.status!.includes(d.status));
    }

    if (filters?.type?.length) {
      filtered = filtered.filter(d => filters.type!.includes(d.type));
    }

    if (filters?.clientId) {
      filtered = filtered.filter(d => d.clientId === filters.clientId);
    }

    if (filters?.matterId) {
      filtered = filtered.filter(d => d.matterId === filters.matterId);
    }

    if (filters?.dateRange) {
      filtered = filtered.filter(d => {
        const docDate = new Date(d.uploadedAt);
        const startDate = new Date(filters.dateRange!.start);
        const endDate = new Date(filters.dateRange!.end);
        return docDate >= startDate && docDate <= endDate;
      });
    }

    if (filters?.sizeRange) {
      filtered = filtered.filter(d => 
        d.size >= filters.sizeRange!.min && d.size <= filters.sizeRange!.max
      );
    }

    if (filters?.uploadedBy?.length) {
      filtered = filtered.filter(d => filters.uploadedBy!.includes(d.uploadedBy));
    }

    return filtered.sort((a, b) => 
      new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime()
    );
  }

  async searchDocuments(searchTerm: string, filters?: DocumentFilters): Promise<Document[]> {
    const searchLower = searchTerm.toLowerCase();
    let filtered = this.documents.filter(d => 
      d.name.toLowerCase().includes(searchLower) ||
      d.description?.toLowerCase().includes(searchLower) ||
      d.tags.some(tag => tag.toLowerCase().includes(searchLower))
    );

    if (filters?.category?.length) {
      filtered = filtered.filter(d => filters.category!.includes(d.category));
    }

    if (filters?.status?.length) {
      filtered = filtered.filter(d => filters.status!.includes(d.status));
    }

    return filtered.sort((a, b) => 
      new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime()
    );
  }

  // Document Categories & Analytics
  async getDocumentsByCategory(): Promise<Record<DocumentCategory, number>> {
    const categoryCounts: Record<string, number> = {};
    
    this.documents
      .filter(d => d.status !== 'archived')
      .forEach(doc => {
        categoryCounts[doc.category] = (categoryCounts[doc.category] || 0) + 1;
      });

    return categoryCounts as Record<DocumentCategory, number>;
  }

  async getRecentDocuments(limit: number = 10): Promise<Document[]> {
    return this.documents
      .sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime())
      .slice(0, limit);
  }

  async getStarredDocuments(): Promise<Document[]> {
    return this.documents
      .filter(d => d.isStarred)
      .sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime());
  }

  // Document Sharing & Permissions
  async shareDocument(documentId: string, userIds: string[]): Promise<void> {
    const document = await this.getDocument(documentId);
    if (!document) throw new Error('Document not found');

    await this.updateDocument(documentId, { sharedWith: userIds });
  }

  async toggleStar(documentId: string): Promise<Document> {
    const document = await this.getDocument(documentId);
    if (!document) throw new Error('Document not found');

    return await this.updateDocument(documentId, { isStarred: !document.isStarred });
  }

  // File Upload & Storage (Mock)
  async uploadFile(file: File, path: string): Promise<string> {
    // Simulate file upload delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Return mock URL
    return `/documents/${path}`;
  }

  async createDocumentFromUpload(upload: DocumentUpload): Promise<Document> {
    // Generate unique file path
    const timestamp = Date.now();
    const fileName = `${timestamp}_${upload.file.name}`;
    const filePath = `uploads/${fileName}`;

    // Mock file upload
    const url = await this.uploadFile(upload.file, filePath);

    // Extract basic metadata
    const metadata = {
      language: 'en',
      extractedText: '', // Would be populated by OCR/text extraction
      jurisdiction: undefined,
      practiceArea: this.getCategoryPracticeArea(upload.category)
    };

    // Create document record
    const documentData: Partial<Document> = {
      name: upload.file.name,
      type: this.getFileType(upload.file.name),
      size: upload.file.size,
      category: upload.category,
      subtype: upload.subtype,
      status: 'active' as DocumentStatus,
      uploadedAt: new Date().toISOString(),
      modifiedAt: new Date().toISOString(),
      uploadedBy: 'Current User',
      matterId: upload.matterId,
      clientId: upload.clientId,
      tags: upload.tags,
      description: upload.description,
      url,
      isStarred: false,
      sharedWith: [],
      permissions: {
        canEdit: true,
        canDelete: true,
        canShare: true
      },
      metadata,
      version: 1
    };

    return this.createDocument(documentData);
  }

  // Version Control
  async createDocumentVersion(documentId: string, updates: Partial<Document>): Promise<Document> {
    const currentDoc = await this.getDocument(documentId);
    if (!currentDoc) throw new Error('Document not found');

    const versionData = {
      ...currentDoc,
      ...updates,
      version: currentDoc.version + 1,
      parentId: documentId,
      modifiedAt: new Date().toISOString()
    };

    return this.createDocument(versionData);
  }

  async getDocumentVersions(documentId: string): Promise<Document[]> {
    return this.documents
      .filter(d => d.parentId === documentId)
      .sort((a, b) => b.version - a.version);
  }

  // Helper Methods
  private getFileType(fileName: string): any {
    const extension = fileName.split('.').pop()?.toLowerCase();
    switch (extension) {
      case 'pdf': return 'pdf';
      case 'doc':
      case 'docx': return 'docx';
      case 'txt': return 'txt';
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif': return 'image';
      default: return 'other';
    }
  }

  private getCategoryPracticeArea(category: DocumentCategory): string {
    const practiceAreaMap: Record<string, string> = {
      'corporate_formation': 'Corporate Law',
      'contracts_agreements': 'Contract Law',
      'employment_docs': 'Employment Law',
      'pleadings': 'Litigation',
      'motions': 'Litigation',
      'discovery': 'Litigation',
      'real_estate_purchase': 'Real Estate Law',
      'real_estate_lease': 'Real Estate Law',
      'real_estate_finance': 'Real Estate Law',
      'wills_trusts': 'Estate Planning',
      'powers_of_attorney': 'Estate Planning',
      'healthcare_directives': 'Estate Planning',
      'divorce_separation': 'Family Law',
      'custody_support': 'Family Law',
      'prenuptial_postnuptial': 'Family Law',
      'patents': 'Intellectual Property',
      'trademarks': 'Intellectual Property',
      'copyrights': 'Intellectual Property',
      'criminal_law': 'Criminal Law',
      'immigration': 'Immigration Law',
      'bankruptcy': 'Bankruptcy Law',
      'regulatory_compliance': 'Regulatory Law',
      'legal_correspondence': 'General Practice',
      'alternative_dispute_resolution': 'ADR'
    };

    return practiceAreaMap[category] || 'General Practice';
  }
}

export const documentService = new DocumentService();