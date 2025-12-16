
import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  FileText, 
  Plus, 
  Upload, 
  Search, 
  Filter, 
  Star, 
  Zap,
  Grid,
  List,
  BarChart3,
  Eye,
  Edit,
  Share,
  Download,
  Archive,
  Clock,
  Users,
  TrendingUp,
  Brain
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Document, DocumentCategory } from '@/types/document';
import { documentService } from '@/services/documentService';
import DocumentDashboard from '@/components/documents/DocumentDashboard';
import TemplateGallery from '@/components/documents/TemplateGallery';
import DocumentUploadModal from '@/components/documents/DocumentUploadModal';
import DocumentPreviewModal from '@/components/documents/DocumentPreviewModal';
import NewDocumentModal from '@/components/documents/NewDocumentModal';
import FilterModal from '@/components/documents/FilterModal';
import AnalyticsModal from '@/components/documents/AnalyticsModal';
import AIAnalysisBadge from '@/components/documents/AIAnalysisBadge';
import AIAnalysisModal from '@/components/documents/AIAnalysisModal';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { aiAnalysisService } from '@/services/aiAnalysisService';

const Documents = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [documents, setDocuments] = useState<Document[]>([]);
  const [filteredDocuments, setFilteredDocuments] = useState<Document[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [isLoading, setIsLoading] = useState(true);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showNewDocModal, setShowNewDocModal] = useState(false);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [showAnalyticsModal, setShowAnalyticsModal] = useState(false);
  const [showAnalysisModal, setShowAnalysisModal] = useState(false);
  const [previewDocument, setPreviewDocument] = useState<Document | null>(null);
  const [analysisDocument, setAnalysisDocument] = useState<Document | null>(null);
  const [activeFilters, setActiveFilters] = useState<any>({});
  const [analyzingDocuments, setAnalyzingDocuments] = useState<Set<string>>(new Set());
  const [documentStats, setDocumentStats] = useState({
    total: 0,
    recentWeek: 0,
    shared: 0,
    aiAnalyzed: 0
  });
  const { toast } = useToast();

  useEffect(() => {
    loadDocuments();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [documents, searchQuery, activeFilters]);

  const loadDocuments = async () => {
    try {
      setIsLoading(true);
      const [allDocuments, categories] = await Promise.all([
        documentService.getDocuments(),
        documentService.getDocumentsByCategory()
      ]);
      
      setDocuments(allDocuments);
      
      // Calculate stats
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
      
      setDocumentStats({
        total: allDocuments.length,
        recentWeek: allDocuments.filter(d => new Date(d.uploadedAt) >= oneWeekAgo).length,
        shared: allDocuments.filter(d => d.sharedWith.length > 0).length,
        aiAnalyzed: allDocuments.filter(d => d.aiAnalysis).length
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load documents',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = documents;
    
    // Apply search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(doc => 
        doc.name.toLowerCase().includes(query) ||
        doc.description?.toLowerCase().includes(query) ||
        doc.tags.some(tag => tag.toLowerCase().includes(query))
      );
    }
    
    // Apply modal filters
    if (activeFilters.category) {
      filtered = filtered.filter(doc => doc.category === activeFilters.category);
    }
    
    if (activeFilters.starred) {
      filtered = filtered.filter(doc => doc.isStarred);
    }
    
    if (activeFilters.shared) {
      filtered = filtered.filter(doc => doc.sharedWith.length > 0);
    }
    
    if (activeFilters.hasAiAnalysis) {
      filtered = filtered.filter(doc => doc.aiAnalysis);
    }
    
    if (activeFilters.tags && activeFilters.tags.length > 0) {
      filtered = filtered.filter(doc => 
        activeFilters.tags.some((tag: string) => doc.tags.includes(tag))
      );
    }
    
    if (activeFilters.dateRange?.from) {
      filtered = filtered.filter(doc => 
        new Date(doc.uploadedAt) >= activeFilters.dateRange.from
      );
    }
    
    if (activeFilters.dateRange?.to) {
      filtered = filtered.filter(doc => 
        new Date(doc.uploadedAt) <= activeFilters.dateRange.to
      );
    }
    
    if (activeFilters.uploadedBy) {
      filtered = filtered.filter(doc => 
        doc.uploadedBy.toLowerCase().includes(activeFilters.uploadedBy.toLowerCase())
      );
    }
    
    if (activeFilters.size?.min) {
      filtered = filtered.filter(doc => doc.size >= activeFilters.size.min * 1024 * 1024);
    }
    
    if (activeFilters.size?.max) {
      filtered = filtered.filter(doc => doc.size <= activeFilters.size.max * 1024 * 1024);
    }
    
    setFilteredDocuments(filtered);
  };

  const handleDocumentAction = async (action: string, documentId: string) => {
    try {
      switch (action) {
        case 'view':
          const docToPreview = documents.find(d => d.id === documentId);
          if (docToPreview) {
            setPreviewDocument(docToPreview);
          }
          break;
        case 'edit':
          // For now, show a toast indicating this feature is coming soon
          toast({
            title: 'Document Editor',
            description: 'Document editing feature coming soon'
          });
          break;
        case 'share':
          toast({
            title: 'Share feature',
            description: 'Share functionality coming soon'
          });
          break;
        case 'star':
          await documentService.toggleStar(documentId);
          toast({
            title: 'Document starred',
            description: 'Document has been added to your starred list'
          });
          await loadDocuments();
          break;
        case 'download':
          toast({
            title: 'Download started',
            description: 'Document download has begun'
          });
          break;
        default:
          break;
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to perform action',
        variant: 'destructive'
      });
    }
  };

  const handleNewDocument = () => {
    setShowNewDocModal(true);
  };

  const handleUpload = () => {
    setShowUploadModal(true);
  };

  const handleFilter = () => {
    setShowFilterModal(true);
  };

  const handleAnalytics = () => {
    setShowAnalyticsModal(true);
  };

  const handleApplyFilters = (filters: any) => {
    setActiveFilters(filters);
    applyFilters();
  };

  const handleAnalyzeDocument = async (documentId: string) => {
    try {
      // Add to analyzing set
      setAnalyzingDocuments(prev => new Set(prev).add(documentId));
      
      // Perform AI analysis
      const analysis = await aiAnalysisService.analyzeDocument(documentId);
      
      // Update the document with AI analysis
      setDocuments(prev => prev.map(doc => 
        doc.id === documentId 
          ? { ...doc, aiAnalysis: analysis }
          : doc
      ));
      
      toast({
        title: 'AI Analysis Complete',
        description: `Risk score: ${analysis.riskScore}/100`,
      });
      
    } catch (error) {
      toast({
        title: 'Analysis Failed',
        description: 'Failed to analyze document',
        variant: 'destructive'
      });
    } finally {
      // Remove from analyzing set
      setAnalyzingDocuments(prev => {
        const newSet = new Set(prev);
        newSet.delete(documentId);
        return newSet;
      });
    }
  };

  const handleShowAnalysis = (document: Document) => {
    if (document.aiAnalysis) {
      setAnalysisDocument(document);
      setShowAnalysisModal(true);
    }
  };

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
      month: 'short',
      day: 'numeric'
    });
  };

  const getCategoryColor = (category: DocumentCategory) => {
    const colorMap = {
      'contracts_agreements': 'bg-blue-100 text-blue-700',
      'employment_docs': 'bg-green-100 text-green-700',
      'pleadings': 'bg-red-100 text-red-700',
      'motions': 'bg-orange-100 text-orange-700',
      'corporate_formation': 'bg-purple-100 text-purple-700',
      'real_estate_purchase': 'bg-indigo-100 text-indigo-700',
      'wills_trusts': 'bg-teal-100 text-teal-700',
      'other': 'bg-gray-100 text-gray-700'
    };
    return colorMap[category] || 'bg-gray-100 text-gray-700';
  };

  const formatCategoryName = (category: DocumentCategory) => {
    return category.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  return (
    <TooltipProvider>
      <div className="container max-w-7xl mx-auto p-6">
        <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Legal Document Management</h1>
          <p className="text-muted-foreground mt-1">
            AI-powered document management system for legal professionals
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button onClick={handleNewDocument}>
            <Plus className="h-4 w-4 mr-2" />
            New Document
          </Button>
          <Button variant="outline" onClick={handleUpload}>
            <Upload className="h-4 w-4 mr-2" />
            Upload
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="dashboard" className="flex items-center space-x-2">
            <BarChart3 className="h-4 w-4" />
            <span>Dashboard</span>
          </TabsTrigger>
          <TabsTrigger value="documents" className="flex items-center space-x-2">
            <FileText className="h-4 w-4" />
            <span>Documents</span>
          </TabsTrigger>
          <TabsTrigger value="templates" className="flex items-center space-x-2">
            <Zap className="h-4 w-4" />
            <span>Templates</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="space-y-4">
          <DocumentDashboard 
            onNewDocument={handleNewDocument}
            onUploadDocument={handleUpload}
            onBrowseTemplates={() => setActiveTab('templates')}
            onSearchDocuments={() => setActiveTab('documents')}
            onFilter={() => setShowFilterModal(true)}
            onAnalytics={() => setShowAnalyticsModal(true)}
          />
        </TabsContent>

        <TabsContent value="documents" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">All Documents</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{documentStats.total}</div>
                <p className="text-xs text-muted-foreground">
                  Total documents in system
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Recent Activity</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{documentStats.recentWeek}</div>
                <p className="text-xs text-muted-foreground">
                  Documents this week
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Shared</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{documentStats.shared}</div>
                <p className="text-xs text-muted-foreground">
                  Collaborative documents
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">AI Analyzed</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{documentStats.aiAnalyzed}</div>
                <p className="text-xs text-muted-foreground">
                  Documents with AI insights
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm" onClick={handleFilter}>
                <Filter className="h-4 w-4 mr-2" />
                Filter
              </Button>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search documents..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 w-64"
                />
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Button 
                variant={viewMode === 'grid' ? 'default' : 'outline'} 
                size="sm"
                onClick={() => setViewMode('grid')}
              >
                <Grid className="h-4 w-4" />
              </Button>
              <Button 
                variant={viewMode === 'list' ? 'default' : 'outline'} 
                size="sm"
                onClick={() => setViewMode('list')}
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center min-h-[400px]">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-muted-foreground">Loading documents...</p>
              </div>
            </div>
          ) : (
            <div className={`grid gap-4 ${viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'}`}>
              {filteredDocuments.length === 0 ? (
                <div className="col-span-full text-center py-12">
                  <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">No documents found</h3>
                  <p className="text-muted-foreground mb-4">
                    {searchQuery ? 'Try adjusting your search query' : 'Get started by creating your first document'}
                  </p>
                  <Button onClick={handleNewDocument}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Document
                  </Button>
                </div>
              ) : (
                filteredDocuments.map((document) => (
                  <Card key={document.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <FileText className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium text-sm truncate">{document.name}</span>
                        </div>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDocumentAction('star', document.id)}
                        >
                          <Star className={`h-4 w-4 ${document.isStarred ? 'fill-current text-yellow-500' : 'text-muted-foreground'}`} />
                        </Button>
                      </div>
                      
                      <div className="flex items-center space-x-2 mb-2">
                        <Badge variant="secondary" className={`text-xs ${getCategoryColor(document.category)}`}>
                          {formatCategoryName(document.category)}
                        </Badge>
                        <AIAnalysisBadge 
                          document={document}
                          size="sm"
                          showDetails={true}
                          onAnalyze={() => handleAnalyzeDocument(document.id)}
                          isAnalyzing={analyzingDocuments.has(document.id)}
                          onShowAnalysis={() => handleShowAnalysis(document)}
                        />
                        <span className="text-xs text-muted-foreground">{formatFileSize(document.size)}</span>
                      </div>
                      
                      {document.description && (
                        <p className="text-xs text-muted-foreground mb-2 line-clamp-2">{document.description}</p>
                      )}
                      
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">
                          {formatDate(document.uploadedAt)}
                        </span>
                        <div className="flex space-x-1">
                          <Button 
                            size="sm" 
                            variant="ghost"
                            onClick={() => handleDocumentAction('view', document.id)}
                          >
                            <Eye className="h-3 w-3" />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="ghost"
                            onClick={() => handleDocumentAction('edit', document.id)}
                          >
                            <Edit className="h-3 w-3" />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="ghost"
                            onClick={() => handleDocumentAction('share', document.id)}
                          >
                            <Share className="h-3 w-3" />
                          </Button>
                          {!document.aiAnalysis && !analyzingDocuments.has(document.id) && (
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button 
                                  size="sm" 
                                  variant="ghost"
                                  onClick={() => handleAnalyzeDocument(document.id)}
                                >
                                  <Brain className="h-3 w-3" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Analyze document with AI for legal risks and insights</p>
                              </TooltipContent>
                            </Tooltip>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          )}
        </TabsContent>

        <TabsContent value="templates" className="space-y-4">
          <TemplateGallery />
        </TabsContent>
      </Tabs>

      {/* Upload Modal */}
      <DocumentUploadModal
        open={showUploadModal}
        onOpenChange={setShowUploadModal}
        onUploadComplete={loadDocuments}
      />

      {/* New Document Modal */}
      <NewDocumentModal
        open={showNewDocModal}
        onOpenChange={setShowNewDocModal}
        onDocumentCreated={loadDocuments}
      />

      {/* Document Preview Modal */}
      <DocumentPreviewModal
        document={previewDocument}
        open={!!previewDocument}
        onOpenChange={(open) => !open && setPreviewDocument(null)}
        onAction={handleDocumentAction}
      />

      {/* Filter Modal */}
      <FilterModal
        open={showFilterModal}
        onOpenChange={setShowFilterModal}
        onApplyFilters={handleApplyFilters}
        currentFilters={activeFilters}
      />

      {/* Analytics Modal */}
      <AnalyticsModal
        open={showAnalyticsModal}
        onOpenChange={setShowAnalyticsModal}
      />

      {/* AI Analysis Modal */}
      <AIAnalysisModal
        open={showAnalysisModal}
        onOpenChange={setShowAnalysisModal}
        analysis={analysisDocument?.aiAnalysis || null}
        documentName={analysisDocument?.name}
      />
      </div>
    </TooltipProvider>
  );
};

export default Documents;
