import { supabase } from '@/integrations/supabase/client';

export interface ClientDocument {
  id: string;
  name: string;
  originalName: string;
  type: string;
  mimeType: string;
  size: number;
  clientId: string;
  matterId?: string;
  matterName?: string;
  category: 'contract' | 'correspondence' | 'legal_brief' | 'evidence' | 'financial' | 'other';
  status: 'draft' | 'final' | 'review' | 'archived';
  confidentialityLevel: 'public' | 'confidential' | 'highly_confidential';
  tags: string[];
  uploadedBy: string;
  uploadedByName: string;
  uploadDate: string;
  lastModified: string;
  version: number;
  parentDocumentId?: string;
  downloadUrl?: string;
  thumbnailUrl?: string;
  notes?: string;
  metadata: {
    fileExtension: string;
    checksum: string;
    ocrText?: string;
    aiAnalysis?: {
      summary: string;
      keyTerms: string[];
      riskLevel: 'low' | 'medium' | 'high';
      suggestedActions: string[];
    };
  };
}

export interface DocumentUploadOptions {
  clientId: string;
  matterId?: string;
  category: ClientDocument['category'];
  confidentialityLevel: ClientDocument['confidentialityLevel'];
  tags?: string[];
  notes?: string;
}

export interface DocumentSearchFilters {
  clientId?: string;
  matterId?: string;
  category?: ClientDocument['category'];
  status?: ClientDocument['status'];
  confidentialityLevel?: ClientDocument['confidentialityLevel'];
  tags?: string[];
  uploadedBy?: string;
  startDate?: string;
  endDate?: string;
  searchTerm?: string;
}

export interface DocumentStats {
  totalDocuments: number;
  totalSize: string;
  documentsByCategory: Record<string, number>;
  documentsByStatus: Record<string, number>;
  recentUploads: number;
  pendingReview: number;
}

class ClientDocumentService {
  async getClientDocuments(clientId: string, filters?: DocumentSearchFilters): Promise<ClientDocument[]> {
    try {
      // This would integrate with Supabase in a real implementation
      const mockDocuments: ClientDocument[] = [
        {
          id: '1',
          name: 'software_license_agreement_v2.1.pdf',
          originalName: 'Software License Agreement v2.1.pdf',
          type: 'Contract',
          mimeType: 'application/pdf',
          size: 2516582, // 2.4 MB
          clientId,
          matterId: '1',
          matterName: 'Contract Review - Software License',
          category: 'contract',
          status: 'final',
          confidentialityLevel: 'confidential',
          tags: ['Contract', 'Software', 'License'],
          uploadedBy: '1',
          uploadedByName: 'Sarah Johnson',
          uploadDate: '2024-03-10T14:30:00Z',
          lastModified: '2024-03-10T14:30:00Z',
          version: 1,
          notes: 'Final version approved by client',
          metadata: {
            fileExtension: 'pdf',
            checksum: 'abc123def456',
            ocrText: 'Software License Agreement...',
            aiAnalysis: {
              summary: 'Standard software license agreement with favorable terms',
              keyTerms: ['License Term', 'Payment Schedule', 'Termination Clause'],
              riskLevel: 'low',
              suggestedActions: ['Review termination clause', 'Confirm payment terms']
            }
          }
        },
        {
          id: '2',
          name: 'employment_policy_review.docx',
          originalName: 'Employment Policy Review.docx',
          type: 'Policy Document',
          mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          size: 1887437, // 1.8 MB
          clientId,
          matterId: '2',
          matterName: 'Employment Dispute Resolution',
          category: 'legal_brief',
          status: 'draft',
          confidentialityLevel: 'highly_confidential',
          tags: ['Employment', 'Policy', 'HR'],
          uploadedBy: '2',
          uploadedByName: 'Michael Chen',
          uploadDate: '2024-03-08T10:15:00Z',
          lastModified: '2024-03-08T16:45:00Z',
          version: 2,
          notes: 'Draft for client review - confidential HR policies',
          metadata: {
            fileExtension: 'docx',
            checksum: 'def456ghi789',
            aiAnalysis: {
              summary: 'Comprehensive employment policy covering discrimination and harassment',
              keyTerms: ['Equal Opportunity', 'Harassment Policy', 'Disciplinary Procedures'],
              riskLevel: 'medium',
              suggestedActions: ['Update harassment reporting procedures', 'Add remote work policies']
            }
          }
        },
        {
          id: '3',
          name: 'ip_portfolio_analysis.xlsx',
          originalName: 'IP Portfolio Analysis.xlsx',
          type: 'Analysis',
          mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          size: 3355443, // 3.2 MB
          clientId,
          matterId: '3',
          matterName: 'IP Portfolio Review',
          category: 'financial',
          status: 'final',
          confidentialityLevel: 'confidential',
          tags: ['IP', 'Analysis', 'Portfolio'],
          uploadedBy: '1',
          uploadedByName: 'Sarah Johnson',
          uploadDate: '2024-03-05T09:00:00Z',
          lastModified: '2024-03-05T09:00:00Z',
          version: 1,
          notes: 'Complete IP portfolio valuation and analysis',
          metadata: {
            fileExtension: 'xlsx',
            checksum: 'ghi789jkl012',
            aiAnalysis: {
              summary: 'Detailed IP portfolio analysis showing strong patent protection',
              keyTerms: ['Patent Valuation', 'Market Analysis', 'Competitive Landscape'],
              riskLevel: 'low',
              suggestedActions: ['File additional patents', 'Monitor competitor activities']
            }
          }
        },
        {
          id: '4',
          name: 'client_correspondence_march.pdf',
          originalName: 'Client Correspondence.pdf',
          type: 'Correspondence',
          mimeType: 'application/pdf',
          size: 876543, // 856 KB
          clientId,
          category: 'correspondence',
          status: 'final',
          confidentialityLevel: 'confidential',
          tags: ['Correspondence', 'March', 'Client Communication'],
          uploadedBy: '3',
          uploadedByName: 'Legal Assistant',
          uploadDate: '2024-03-01T13:20:00Z',
          lastModified: '2024-03-01T13:20:00Z',
          version: 1,
          notes: 'March correspondence compilation',
          metadata: {
            fileExtension: 'pdf',
            checksum: 'jkl012mno345',
            ocrText: 'Dear Client, Following up on our previous discussion...',
            aiAnalysis: {
              summary: 'Routine client correspondence regarding case updates',
              keyTerms: ['Case Update', 'Next Steps', 'Timeline'],
              riskLevel: 'low',
              suggestedActions: ['Schedule follow-up meeting', 'Prepare status report']
            }
          }
        }
      ];

      // Apply filters if provided
      let filteredDocuments = mockDocuments.filter(doc => doc.clientId === clientId);

      if (filters) {
        if (filters.matterId) {
          filteredDocuments = filteredDocuments.filter(doc => doc.matterId === filters.matterId);
        }
        if (filters.category) {
          filteredDocuments = filteredDocuments.filter(doc => doc.category === filters.category);
        }
        if (filters.status) {
          filteredDocuments = filteredDocuments.filter(doc => doc.status === filters.status);
        }
        if (filters.confidentialityLevel) {
          filteredDocuments = filteredDocuments.filter(doc => doc.confidentialityLevel === filters.confidentialityLevel);
        }
        if (filters.searchTerm) {
          const searchLower = filters.searchTerm.toLowerCase();
          filteredDocuments = filteredDocuments.filter(doc => 
            doc.name.toLowerCase().includes(searchLower) ||
            doc.originalName.toLowerCase().includes(searchLower) ||
            doc.type.toLowerCase().includes(searchLower) ||
            doc.tags.some(tag => tag.toLowerCase().includes(searchLower))
          );
        }
      }

      return filteredDocuments;
    } catch (error) {
      console.error('Error fetching client documents:', error);
      throw new Error('Failed to fetch client documents');
    }
  }

  async uploadDocument(file: File, options: DocumentUploadOptions): Promise<ClientDocument> {
    try {
      // This would integrate with Supabase Storage in a real implementation
      
      // Simulate file upload with progress
      const uploadPromise = new Promise<string>((resolve) => {
        setTimeout(() => {
          resolve(`documents/${options.clientId}/${Date.now()}_${file.name}`);
        }, 2000);
      });

      const filePath = await uploadPromise;

      const newDocument: ClientDocument = {
        id: `doc_${Date.now()}`,
        name: file.name.toLowerCase().replace(/[^a-z0-9.-]/g, '_'),
        originalName: file.name,
        type: this.getDocumentType(file.name),
        mimeType: file.type,
        size: file.size,
        clientId: options.clientId,
        matterId: options.matterId,
        category: options.category,
        status: 'draft',
        confidentialityLevel: options.confidentialityLevel,
        tags: options.tags || [],
        uploadedBy: '1', // This would come from current user context
        uploadedByName: 'Current User',
        uploadDate: new Date().toISOString(),
        lastModified: new Date().toISOString(),
        version: 1,
        notes: options.notes,
        downloadUrl: filePath,
        metadata: {
          fileExtension: file.name.split('.').pop()?.toLowerCase() || '',
          checksum: `checksum_${Date.now()}`,
        }
      };

      return newDocument;
    } catch (error) {
      console.error('Error uploading document:', error);
      throw new Error('Failed to upload document');
    }
  }

  async downloadDocument(documentId: string): Promise<Blob> {
    try {
      // This would integrate with Supabase Storage in a real implementation
      // Simulate download
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Return a mock blob for demonstration
      return new Blob(['Mock document content'], { type: 'application/pdf' });
    } catch (error) {
      console.error('Error downloading document:', error);
      throw new Error('Failed to download document');
    }
  }

  async deleteDocument(documentId: string): Promise<void> {
    try {
      // This would integrate with Supabase in a real implementation
      await new Promise(resolve => setTimeout(resolve, 500));
    } catch (error) {
      console.error('Error deleting document:', error);
      throw new Error('Failed to delete document');
    }
  }

  async updateDocument(documentId: string, updates: Partial<ClientDocument>): Promise<ClientDocument> {
    try {
      // This would integrate with Supabase in a real implementation
      const existingDoc = await this.getDocumentById(documentId);
      
      const updatedDocument: ClientDocument = {
        ...existingDoc,
        ...updates,
        lastModified: new Date().toISOString(),
        version: existingDoc.version + 1
      };

      await new Promise(resolve => setTimeout(resolve, 500));
      return updatedDocument;
    } catch (error) {
      console.error('Error updating document:', error);
      throw new Error('Failed to update document');
    }
  }

  async getDocumentById(documentId: string): Promise<ClientDocument> {
    try {
      // This would integrate with Supabase in a real implementation
      const mockDocument: ClientDocument = {
        id: documentId,
        name: 'sample_document.pdf',
        originalName: 'Sample Document.pdf',
        type: 'Contract',
        mimeType: 'application/pdf',
        size: 1024000,
        clientId: '1',
        category: 'contract',
        status: 'final',
        confidentialityLevel: 'confidential',
        tags: ['Sample'],
        uploadedBy: '1',
        uploadedByName: 'User',
        uploadDate: new Date().toISOString(),
        lastModified: new Date().toISOString(),
        version: 1,
        metadata: {
          fileExtension: 'pdf',
          checksum: 'sample_checksum'
        }
      };

      return mockDocument;
    } catch (error) {
      console.error('Error fetching document:', error);
      throw new Error('Failed to fetch document');
    }
  }

  async getDocumentStats(clientId: string): Promise<DocumentStats> {
    try {
      const documents = await this.getClientDocuments(clientId);
      
      const stats: DocumentStats = {
        totalDocuments: documents.length,
        totalSize: this.formatFileSize(documents.reduce((sum, doc) => sum + doc.size, 0)),
        documentsByCategory: {},
        documentsByStatus: {},
        recentUploads: documents.filter(doc => {
          const uploadDate = new Date(doc.uploadDate);
          const weekAgo = new Date();
          weekAgo.setDate(weekAgo.getDate() - 7);
          return uploadDate > weekAgo;
        }).length,
        pendingReview: documents.filter(doc => doc.status === 'review').length
      };

      // Count by category
      documents.forEach(doc => {
        stats.documentsByCategory[doc.category] = (stats.documentsByCategory[doc.category] || 0) + 1;
      });

      // Count by status
      documents.forEach(doc => {
        stats.documentsByStatus[doc.status] = (stats.documentsByStatus[doc.status] || 0) + 1;
      });

      return stats;
    } catch (error) {
      console.error('Error fetching document stats:', error);
      throw new Error('Failed to fetch document statistics');
    }
  }

  async shareDocument(documentId: string, options: {
    recipients: string[];
    message?: string;
    expirationDate?: string;
    permissions: 'view' | 'download' | 'edit';
  }): Promise<{ shareLink: string; expirationDate: string }> {
    try {
      // This would integrate with email service and generate secure share links
      const shareLink = `https://app.example.com/shared/${documentId}/${Date.now()}`;
      const expirationDate = options.expirationDate || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();

      await new Promise(resolve => setTimeout(resolve, 1000));

      return { shareLink, expirationDate };
    } catch (error) {
      console.error('Error sharing document:', error);
      throw new Error('Failed to share document');
    }
  }

  private getDocumentType(filename: string): string {
    const extension = filename.split('.').pop()?.toLowerCase();
    
    const typeMap: Record<string, string> = {
      'pdf': 'PDF Document',
      'doc': 'Word Document',
      'docx': 'Word Document',
      'xls': 'Excel Spreadsheet',
      'xlsx': 'Excel Spreadsheet',
      'ppt': 'PowerPoint Presentation',
      'pptx': 'PowerPoint Presentation',
      'txt': 'Text Document',
      'jpg': 'Image',
      'jpeg': 'Image',
      'png': 'Image',
      'gif': 'Image',
      'zip': 'Archive',
      'rar': 'Archive'
    };

    return typeMap[extension || ''] || 'Unknown';
  }

  private formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 B';
    
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
}

export const clientDocumentService = new ClientDocumentService();