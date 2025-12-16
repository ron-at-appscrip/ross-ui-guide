import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  FileText, 
  Plus, 
  Search, 
  Filter, 
  Upload, 
  Download,
  Star,
  Clock,
  AlertTriangle,
  CheckCircle,
  TrendingUp,
  BarChart3,
  Calendar,
  Users,
  Zap,
  Eye,
  Edit,
  Share,
  Archive
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Document, DocumentCategory, DocumentTemplate } from '@/types/document';
import { documentService } from '@/services/documentService';
import { templateService } from '@/services/templateService';
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';
import AIAnalysisBadge from './AIAnalysisBadge';
import AIAnalysisModal from './AIAnalysisModal';
import { aiAnalysisService } from '@/services/aiAnalysisService';

interface DocumentDashboardProps {
  onNewDocument?: () => void;
  onUploadDocument?: () => void;
  onBrowseTemplates?: () => void;
  onSearchDocuments?: () => void;
  onFilter?: () => void;
  onAnalytics?: () => void;
}

const DocumentDashboard: React.FC<DocumentDashboardProps> = ({
  onNewDocument,
  onUploadDocument,
  onBrowseTemplates,
  onSearchDocuments,
  onFilter,
  onAnalytics
}) => {
  const [recentDocuments, setRecentDocuments] = useState<Document[]>([]);
  const [starredDocuments, setStarredDocuments] = useState<Document[]>([]);
  const [popularTemplates, setPopularTemplates] = useState<DocumentTemplate[]>([]);
  const [documentsByCategory, setDocumentsByCategory] = useState<Record<DocumentCategory, number>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [analyzingDocuments, setAnalyzingDocuments] = useState<Set<string>>(new Set());
  const [showAnalysisModal, setShowAnalysisModal] = useState(false);
  const [analysisDocument, setAnalysisDocument] = useState<Document | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setIsLoading(true);
      
      // Load dashboard data in parallel
      const [recent, starred, templates, categories] = await Promise.all([
        documentService.getRecentDocuments(8),
        documentService.getStarredDocuments(),
        templateService.getPopularTemplates(6),
        documentService.getDocumentsByCategory()
      ]);

      setRecentDocuments(recent);
      setStarredDocuments(starred);
      setPopularTemplates(templates);
      setDocumentsByCategory(categories);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load dashboard data',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDocumentAction = async (action: string, documentId: string) => {
    try {
      switch (action) {
        case 'star':
          await documentService.toggleStar(documentId);
          toast({
            title: 'Document starred',
            description: 'Document has been added to your starred list'
          });
          await loadDashboardData();
          break;
        case 'view':
          // Show a placeholder preview toast since we don't have a document viewer
          const docToView = [...recentDocuments, ...starredDocuments].find(d => d.id === documentId);
          if (docToView) {
            toast({
              title: 'Document Preview',
              description: `Opening preview for "${docToView.name}" - Full preview coming soon`
            });
          }
          break;
        case 'edit':
          // Show a placeholder edit toast since we don't have a document editor
          const docToEdit = [...recentDocuments, ...starredDocuments].find(d => d.id === documentId);
          if (docToEdit) {
            toast({
              title: 'Document Editor',
              description: `Opening editor for "${docToEdit.name}" - Full editor coming soon`
            });
          }
          break;
        case 'share':
          // Open share dialog
          toast({
            title: 'Share feature',
            description: 'Share functionality coming soon'
          });
          break;
        case 'download':
          // Download document
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

  const getDocumentIcon = (category: DocumentCategory) => {
    const iconMap = {
      'contracts_agreements': FileText,
      'pleadings': FileText,
      'motions': FileText,
      'discovery': Search,
      'corporate_formation': FileText,
      'employment_docs': Users,
      'real_estate_purchase': FileText,
      'real_estate_lease': FileText,
      'real_estate_finance': FileText,
      'wills_trusts': FileText,
      'powers_of_attorney': FileText,
      'healthcare_directives': FileText,
      'divorce_separation': FileText,
      'custody_support': FileText,
      'prenuptial_postnuptial': FileText,
      'patents': FileText,
      'trademarks': FileText,
      'copyrights': FileText,
      'criminal_law': FileText,
      'immigration': FileText,
      'bankruptcy': FileText,
      'regulatory_compliance': CheckCircle,
      'legal_correspondence': FileText,
      'alternative_dispute_resolution': FileText,
      'contract': FileText,
      'brief': FileText,
      'correspondence': FileText,
      'research': Search,
      'evidence': FileText,
      'other': FileText
    };
    return iconMap[category] || FileText;
  };

  const getCategoryColor = (category: DocumentCategory) => {
    const colorMap = {
      'contracts_agreements': 'bg-blue-100 text-blue-700',
      'pleadings': 'bg-red-100 text-red-700',
      'motions': 'bg-orange-100 text-orange-700',
      'discovery': 'bg-purple-100 text-purple-700',
      'corporate_formation': 'bg-green-100 text-green-700',
      'employment_docs': 'bg-yellow-100 text-yellow-700',
      'real_estate_purchase': 'bg-indigo-100 text-indigo-700',
      'real_estate_lease': 'bg-indigo-100 text-indigo-700',
      'real_estate_finance': 'bg-indigo-100 text-indigo-700',
      'wills_trusts': 'bg-teal-100 text-teal-700',
      'powers_of_attorney': 'bg-teal-100 text-teal-700',
      'healthcare_directives': 'bg-teal-100 text-teal-700',
      'divorce_separation': 'bg-pink-100 text-pink-700',
      'custody_support': 'bg-pink-100 text-pink-700',
      'prenuptial_postnuptial': 'bg-pink-100 text-pink-700',
      'patents': 'bg-cyan-100 text-cyan-700',
      'trademarks': 'bg-cyan-100 text-cyan-700',
      'copyrights': 'bg-cyan-100 text-cyan-700',
      'criminal_law': 'bg-red-100 text-red-700',
      'immigration': 'bg-blue-100 text-blue-700',
      'bankruptcy': 'bg-gray-100 text-gray-700',
      'regulatory_compliance': 'bg-green-100 text-green-700',
      'legal_correspondence': 'bg-gray-100 text-gray-700',
      'alternative_dispute_resolution': 'bg-purple-100 text-purple-700',
      'contract': 'bg-blue-100 text-blue-700',
      'brief': 'bg-red-100 text-red-700',
      'correspondence': 'bg-gray-100 text-gray-700',
      'research': 'bg-purple-100 text-purple-700',
      'evidence': 'bg-orange-100 text-orange-700',
      'other': 'bg-gray-100 text-gray-700'
    };
    return colorMap[category] || 'bg-gray-100 text-gray-700';
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

  const DashboardStats = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Documents</CardTitle>
          <FileText className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {Object.values(documentsByCategory).reduce((sum, count) => sum + count, 0)}
          </div>
          <p className="text-xs text-muted-foreground">
            Active documents in system
          </p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Starred</CardTitle>
          <Star className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{starredDocuments.length}</div>
          <p className="text-xs text-muted-foreground">
            Documents marked as important
          </p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Templates</CardTitle>
          <Zap className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{popularTemplates.length}</div>
          <p className="text-xs text-muted-foreground">
            Available document templates
          </p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">AI Insights</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {recentDocuments.filter(d => d.aiAnalysis).length}
          </div>
          <p className="text-xs text-muted-foreground">
            Documents with AI analysis
          </p>
        </CardContent>
      </Card>
    </div>
  );

  const handleNewDocument = () => {
    if (onNewDocument) {
      onNewDocument();
    } else {
      toast({
        title: 'New Document',
        description: 'New document modal will open'
      });
    }
  };

  const handleUploadDocument = () => {
    if (onUploadDocument) {
      onUploadDocument();
    } else {
      toast({
        title: 'Upload Document',
        description: 'Upload modal will open'
      });
    }
  };

  const handleBrowseTemplates = () => {
    if (onBrowseTemplates) {
      onBrowseTemplates();
    } else {
      // Navigate to templates tab
      setActiveTab('templates');
    }
  };

  const handleSearchDocuments = () => {
    if (onSearchDocuments) {
      onSearchDocuments();
    } else {
      // Navigate to documents tab with search focus
      navigate('/dashboard/documents');
    }
  };

  const handleDashboardFilter = () => {
    if (onFilter) {
      onFilter();
    } else {
      toast({
        title: 'Filter Dashboard',
        description: 'Advanced dashboard filtering options'
      });
    }
  };

  const handleDashboardAnalytics = () => {
    if (onAnalytics) {
      onAnalytics();
    } else {
      toast({
        title: 'Analytics Dashboard',
        description: 'Document analytics and insights coming soon'
      });
    }
  };

  const handleAnalyzeDocument = async (documentId: string) => {
    try {
      // Add to analyzing set
      setAnalyzingDocuments(prev => new Set(prev).add(documentId));
      
      // Perform AI analysis
      const analysis = await aiAnalysisService.analyzeDocument(documentId);
      
      // Update the document with AI analysis
      setRecentDocuments(prev => prev.map(doc => 
        doc.id === documentId 
          ? { ...doc, aiAnalysis: analysis }
          : doc
      ));
      
      setStarredDocuments(prev => prev.map(doc => 
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

  const QuickActions = () => (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="text-lg">Quick Actions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-2">
          <Button onClick={handleNewDocument}>
            <Plus className="h-4 w-4 mr-2" />
            New Document
          </Button>
          <Button variant="outline" onClick={handleUploadDocument}>
            <Upload className="h-4 w-4 mr-2" />
            Upload Files
          </Button>
          <Button variant="outline" onClick={handleBrowseTemplates}>
            <Zap className="h-4 w-4 mr-2" />
            Browse Templates
          </Button>
          <Button variant="outline" onClick={handleSearchDocuments}>
            <Search className="h-4 w-4 mr-2" />
            Search Documents
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  const DocumentCard = ({ document }: { document: Document }) => {
    const DocumentIcon = getDocumentIcon(document.category);
    
    return (
      <Card className="hover:shadow-md transition-shadow">
        <CardContent className="p-4">
          <div className="flex items-start justify-between mb-2">
            <div className="flex items-center space-x-2">
              <DocumentIcon className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium text-sm truncate">{document.name}</span>
            </div>
            {document.isStarred && (
              <Star className="h-4 w-4 text-yellow-500 fill-current" />
            )}
          </div>
          
          <div className="flex items-center space-x-2 mb-2">
            <Badge variant="secondary" className={cn("text-xs", getCategoryColor(document.category))}>
              {document.category.replace('_', ' ')}
            </Badge>
            <AIAnalysisBadge 
              document={document}
              size="sm"
              showDetails={true}
              onAnalyze={() => handleAnalyzeDocument(document.id)}
              isAnalyzing={analyzingDocuments.has(document.id)}
              onShowAnalysis={() => handleShowAnalysis(document)}
            />
            <span className="text-xs text-muted-foreground">
              {formatFileSize(document.size)}
            </span>
          </div>
          
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
                onClick={() => handleDocumentAction('star', document.id)}
              >
                <Star className="h-3 w-3" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  const handleUseTemplate = (template: DocumentTemplate) => {
    if (onNewDocument) {
      onNewDocument();
    } else {
      toast({
        title: 'Use Template',
        description: `Template "${template.name}" will be used to create a new document`
      });
    }
  };

  const TemplateCard = ({ template }: { template: DocumentTemplate }) => (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-center space-x-2">
            <Zap className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium text-sm truncate">{template.name}</span>
          </div>
          {template.isPopular && (
            <Badge variant="secondary" className="text-xs">Popular</Badge>
          )}
        </div>
        
        <p className="text-xs text-muted-foreground mb-2 line-clamp-2">
          {template.description}
        </p>
        
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">
            {template.usageCount} uses
          </span>
          <Button size="sm" variant="outline" onClick={() => handleUseTemplate(template)}>
            Use Template
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Document Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Manage your legal documents with AI-powered insights
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" onClick={handleDashboardFilter}>
            <Filter className="h-4 w-4 mr-2" />
            Filter
          </Button>
          <Button variant="outline" size="sm" onClick={handleDashboardAnalytics}>
            <BarChart3 className="h-4 w-4 mr-2" />
            Analytics
          </Button>
        </div>
      </div>

      <DashboardStats />
      <QuickActions />

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="recent">Recent Documents</TabsTrigger>
          <TabsTrigger value="starred">Starred</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Recent Documents</CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[400px]">
                  <div className="space-y-2">
                    {recentDocuments.slice(0, 5).map((document) => (
                      <DocumentCard key={document.id} document={document} />
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Popular Templates</CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[400px]">
                  <div className="space-y-2">
                    {popularTemplates.slice(0, 5).map((template) => (
                      <TemplateCard key={template.id} template={template} />
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="recent" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {recentDocuments.map((document) => (
              <DocumentCard key={document.id} document={document} />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="starred" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {starredDocuments.map((document) => (
              <DocumentCard key={document.id} document={document} />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="templates" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {popularTemplates.map((template) => (
              <TemplateCard key={template.id} template={template} />
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* AI Analysis Modal */}
      <AIAnalysisModal
        open={showAnalysisModal}
        onOpenChange={setShowAnalysisModal}
        analysis={analysisDocument?.aiAnalysis || null}
        documentName={analysisDocument?.name}
      />
    </div>
  );
};

export default DocumentDashboard;