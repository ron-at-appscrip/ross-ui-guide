import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown, 
  PieChart, 
  FileText, 
  Calendar, 
  Users, 
  Star,
  Upload,
  Eye,
  Download,
  Share,
  Clock,
  AlertTriangle
} from 'lucide-react';
import { Document, DocumentCategory } from '@/types/document';
import { documentService } from '@/services/documentService';

interface AnalyticsData {
  totalDocuments: number;
  documentsThisMonth: number;
  documentsLastMonth: number;
  categoryBreakdown: Record<DocumentCategory, number>;
  mostActiveUsers: Array<{ name: string; count: number }>;
  popularTags: Array<{ tag: string; count: number }>;
  monthlyTrends: Array<{ month: string; count: number }>;
  averageFileSize: number;
  totalStorage: number;
  documentsWithAI: number;
  sharedDocuments: number;
  starredDocuments: number;
}

interface AnalyticsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const AnalyticsModal: React.FC<AnalyticsModalProps> = ({
  open,
  onOpenChange
}) => {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    if (open) {
      loadAnalytics();
    }
  }, [open]);

  const loadAnalytics = async () => {
    try {
      setIsLoading(true);
      
      // Get all documents for analytics
      const documents = await documentService.getDocuments();
      
      // Calculate analytics
      const now = new Date();
      const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      
      const documentsThisMonth = documents.filter(d => 
        new Date(d.uploadedAt) >= thisMonth
      ).length;
      
      const documentsLastMonth = documents.filter(d => {
        const uploadDate = new Date(d.uploadedAt);
        return uploadDate >= lastMonth && uploadDate < thisMonth;
      }).length;
      
      // Category breakdown
      const categoryBreakdown: Record<DocumentCategory, number> = {} as Record<DocumentCategory, number>;
      documents.forEach(doc => {
        categoryBreakdown[doc.category] = (categoryBreakdown[doc.category] || 0) + 1;
      });
      
      // Popular tags
      const tagCounts: Record<string, number> = {};
      documents.forEach(doc => {
        doc.tags.forEach(tag => {
          tagCounts[tag] = (tagCounts[tag] || 0) + 1;
        });
      });
      
      const popularTags = Object.entries(tagCounts)
        .map(([tag, count]) => ({ tag, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10);
      
      // User activity
      const userCounts: Record<string, number> = {};
      documents.forEach(doc => {
        userCounts[doc.uploadedBy] = (userCounts[doc.uploadedBy] || 0) + 1;
      });
      
      const mostActiveUsers = Object.entries(userCounts)
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);
      
      // Monthly trends (last 6 months)
      const monthlyTrends = [];
      for (let i = 5; i >= 0; i--) {
        const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const nextMonth = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);
        const count = documents.filter(d => {
          const uploadDate = new Date(d.uploadedAt);
          return uploadDate >= date && uploadDate < nextMonth;
        }).length;
        
        monthlyTrends.push({
          month: date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
          count
        });
      }
      
      // Storage calculations
      const totalStorage = documents.reduce((sum, doc) => sum + doc.size, 0);
      const averageFileSize = documents.length > 0 ? totalStorage / documents.length : 0;
      
      const analyticsData: AnalyticsData = {
        totalDocuments: documents.length,
        documentsThisMonth,
        documentsLastMonth,
        categoryBreakdown,
        mostActiveUsers,
        popularTags,
        monthlyTrends,
        averageFileSize,
        totalStorage,
        documentsWithAI: documents.filter(d => d.aiAnalysis).length,
        sharedDocuments: documents.filter(d => d.sharedWith.length > 0).length,
        starredDocuments: documents.filter(d => d.isStarred).length
      };
      
      setAnalytics(analyticsData);
    } catch (error) {
      console.error('Failed to load analytics:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatCategoryName = (category: DocumentCategory) => {
    return category.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  const getGrowthPercentage = () => {
    if (!analytics || analytics.documentsLastMonth === 0) return 0;
    return ((analytics.documentsThisMonth - analytics.documentsLastMonth) / analytics.documentsLastMonth) * 100;
  };

  if (isLoading) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl max-h-[90vh]">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading analytics...</p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  if (!analytics) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl max-h-[90vh]">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <AlertTriangle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">Failed to load analytics data</p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <BarChart3 className="h-5 w-5" />
            <span>Document Analytics</span>
          </DialogTitle>
          <DialogDescription>
            Insights and statistics about your document collection
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="categories">Categories</TabsTrigger>
            <TabsTrigger value="activity">Activity</TabsTrigger>
            <TabsTrigger value="storage">Storage</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Documents</CardTitle>
                  <FileText className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{analytics.totalDocuments}</div>
                  <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                    {getGrowthPercentage() > 0 ? (
                      <TrendingUp className="h-3 w-3 text-green-500" />
                    ) : (
                      <TrendingDown className="h-3 w-3 text-red-500" />
                    )}
                    <span>{Math.abs(getGrowthPercentage()).toFixed(1)}% from last month</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">This Month</CardTitle>
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{analytics.documentsThisMonth}</div>
                  <p className="text-xs text-muted-foreground">Documents added</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">AI Analyzed</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{analytics.documentsWithAI}</div>
                  <p className="text-xs text-muted-foreground">
                    {((analytics.documentsWithAI / analytics.totalDocuments) * 100).toFixed(1)}% of total
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Shared</CardTitle>
                  <Share className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{analytics.sharedDocuments}</div>
                  <p className="text-xs text-muted-foreground">Collaborative documents</p>
                </CardContent>
              </Card>
            </div>

            {/* Monthly Trends */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Monthly Trends</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {analytics.monthlyTrends.map((trend, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <span className="text-sm font-medium">{trend.month}</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-32 bg-muted rounded-full h-2">
                          <div 
                            className="bg-primary h-2 rounded-full" 
                            style={{ 
                              width: `${(trend.count / Math.max(...analytics.monthlyTrends.map(t => t.count))) * 100}%` 
                            }}
                          />
                        </div>
                        <span className="text-sm text-muted-foreground w-8 text-right">{trend.count}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="categories" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Document Categories</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {Object.entries(analytics.categoryBreakdown)
                    .sort(([,a], [,b]) => b - a)
                    .map(([category, count]) => (
                      <div key={category} className="flex items-center justify-between">
                        <span className="text-sm font-medium">{formatCategoryName(category as DocumentCategory)}</span>
                        <div className="flex items-center space-x-2">
                          <div className="w-32 bg-muted rounded-full h-2">
                            <div 
                              className="bg-primary h-2 rounded-full" 
                              style={{ 
                                width: `${(count / analytics.totalDocuments) * 100}%` 
                              }}
                            />
                          </div>
                          <span className="text-sm text-muted-foreground w-8 text-right">{count}</span>
                        </div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="activity" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Most Active Users</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {analytics.mostActiveUsers.map((user, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center text-xs text-white">
                            {index + 1}
                          </div>
                          <span className="text-sm font-medium">{user.name}</span>
                        </div>
                        <span className="text-sm text-muted-foreground">{user.count} docs</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Popular Tags</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {analytics.popularTags.map((tag, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {tag.tag} ({tag.count})
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="storage" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Storage</CardTitle>
                  <Upload className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{formatFileSize(analytics.totalStorage)}</div>
                  <p className="text-xs text-muted-foreground">Across all documents</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Average Size</CardTitle>
                  <FileText className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{formatFileSize(analytics.averageFileSize)}</div>
                  <p className="text-xs text-muted-foreground">Per document</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Starred</CardTitle>
                  <Star className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{analytics.starredDocuments}</div>
                  <p className="text-xs text-muted-foreground">Important documents</p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default AnalyticsModal;