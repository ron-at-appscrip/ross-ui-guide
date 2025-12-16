import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import USPTOHeader from '@/components/uspto/USPTOHeader';
import USPTOSearch from '@/components/uspto/USPTOSearch';
import PatentResultsTable from '@/components/uspto/PatentResultsTable';
import TrademarkResultsTable from '@/components/uspto/TrademarkResultsTable';
import ClientMatterLinkModal from '@/components/uspto/ClientMatterLinkModal';
import { USPTOService } from '@/services/usptoService';
import { 
  PatentSearchQuery, 
  TrademarkSearchQuery, 
  PatentResult, 
  TrademarkResult,
  SearchResult,
  SearchType,
  SavedSearch,
  PortfolioItem
} from '@/types/uspto';
import AnalyticsSkeleton from '@/components/uspto/skeletons/AnalyticsSkeleton';
import { 
  FileText, 
  Shield, 
  Bookmark, 
  BarChart3,
  TrendingUp,
  Clock,
  AlertCircle,
  Search,
  Play,
  Trash2,
  Calendar,
  DollarSign,
  Building,
  User
} from 'lucide-react';

const USPTO: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  // State management
  const [currentTab, setCurrentTab] = useState<'patents' | 'trademarks' | 'saved' | 'portfolio'>('patents');
  const [showAdvancedSearch, setShowAdvancedSearch] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  
  // Search results
  const [patentResults, setPatentResults] = useState<SearchResult<PatentResult> | null>(null);
  const [trademarkResults, setTrademarkResults] = useState<SearchResult<TrademarkResult> | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(25);

  // Analytics data
  const [analytics, setAnalytics] = useState<any>(null);
  const [isLoadingAnalytics, setIsLoadingAnalytics] = useState(true);

  // Saved searches and portfolio
  const [savedSearches, setSavedSearches] = useState<SavedSearch[]>([]);
  const [portfolioItems, setPortfolioItems] = useState<PortfolioItem[]>([]);
  const [isLoadingSaved, setIsLoadingSaved] = useState(false);
  const [isLoadingPortfolio, setIsLoadingPortfolio] = useState(false);

  // Client/Matter linking
  const [linkModalOpen, setLinkModalOpen] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState<PatentResult | TrademarkResult | null>(null);
  const [selectedAssetType, setSelectedAssetType] = useState<'patent' | 'trademark'>('patent');

  // Load analytics on component mount
  useEffect(() => {
    const loadAnalytics = async () => {
      try {
        const data = await USPTOService.getAnalytics();
        setAnalytics(data);
      } catch (error) {
        console.error('Failed to load analytics:', error);
      } finally {
        setIsLoadingAnalytics(false);
      }
    };
    loadAnalytics();
  }, []);

  // Load initial results when tabs are selected
  useEffect(() => {
    const loadInitialData = async () => {
      // Load patents when patents tab is selected for the first time
      if (currentTab === 'patents' && !patentResults) {
        setIsSearching(true);
        try {
          const results = await USPTOService.searchPatents({
            limit: 10
          });
          setPatentResults(results);
        } catch (error) {
          console.error('Failed to load initial patents:', error);
        } finally {
          setIsSearching(false);
        }
      }
      
      // Load trademarks when trademarks tab is selected for the first time
      if (currentTab === 'trademarks' && !trademarkResults) {
        setIsSearching(true);
        try {
          const results = await USPTOService.searchTrademarks({
            limit: 10
          });
          setTrademarkResults(results);
        } catch (error) {
          console.error('Failed to load initial trademarks:', error);
        } finally {
          setIsSearching(false);
        }
      }

      // Load saved searches when saved tab is selected
      if (currentTab === 'saved' && savedSearches.length === 0) {
        setIsLoadingSaved(true);
        try {
          const searches = await USPTOService.getSavedSearches();
          setSavedSearches(searches);
        } catch (error) {
          console.error('Failed to load saved searches:', error);
        } finally {
          setIsLoadingSaved(false);
        }
      }

      // Load portfolio when portfolio tab is selected
      if (currentTab === 'portfolio' && portfolioItems.length === 0) {
        setIsLoadingPortfolio(true);
        try {
          const items = await USPTOService.getPortfolioItems();
          setPortfolioItems(items);
        } catch (error) {
          console.error('Failed to load portfolio items:', error);
        } finally {
          setIsLoadingPortfolio(false);
        }
      }
    };
    loadInitialData();
  }, [currentTab, patentResults, trademarkResults, savedSearches.length, portfolioItems.length]);

  // Handle patent search
  const handlePatentSearch = async (query: PatentSearchQuery) => {
    setIsSearching(true);
    try {
      const searchQuery = {
        ...query,
        offset: (currentPage - 1) * pageSize,
        limit: pageSize
      };
      
      const results = await USPTOService.searchPatents(searchQuery);
      setPatentResults(results);
      
      toast({
        title: "Search completed",
        description: `Found ${results.total.toLocaleString()} patents in ${results.searchTime.toFixed(2)}s`,
      });
    } catch (error) {
      console.error('Patent search failed:', error);
      toast({
        title: "Search failed",
        description: "Unable to search patents. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSearching(false);
    }
  };

  // Handle trademark search
  const handleTrademarkSearch = async (query: TrademarkSearchQuery) => {
    setIsSearching(true);
    try {
      const searchQuery = {
        ...query,
        offset: (currentPage - 1) * pageSize,
        limit: pageSize
      };
      
      const results = await USPTOService.searchTrademarks(searchQuery);
      setTrademarkResults(results);
      
      toast({
        title: "Search completed",
        description: `Found ${results.total.toLocaleString()} trademarks in ${results.searchTime.toFixed(2)}s`,
      });
    } catch (error) {
      console.error('Trademark search failed:', error);
      toast({
        title: "Search failed",
        description: "Unable to search trademarks. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSearching(false);
    }
  };

  // Handle search based on current tab
  const handleSearch = (query: PatentSearchQuery | TrademarkSearchQuery) => {
    setCurrentPage(1);
    if (currentTab === 'patents') {
      handlePatentSearch(query as PatentSearchQuery);
    } else if (currentTab === 'trademarks') {
      handleTrademarkSearch(query as TrademarkSearchQuery);
    }
  };

  // Handle page change
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    // Re-run search with new page
    if (currentTab === 'patents' && patentResults?.query) {
      handlePatentSearch({
        ...patentResults.query,
        offset: (page - 1) * pageSize
      } as PatentSearchQuery);
    } else if (currentTab === 'trademarks' && trademarkResults?.query) {
      handleTrademarkSearch({
        ...trademarkResults.query,
        offset: (page - 1) * pageSize
      } as TrademarkSearchQuery);
    }
  };

  // Handle patent actions
  const handleViewPatentDetails = (patent: PatentResult) => {
    // TODO: Open patent detail modal
    console.log('View patent details:', patent);
  };

  const handleAddPatentToPortfolio = (patent: PatentResult) => {
    // TODO: Add to portfolio
    toast({
      title: "Added to portfolio",
      description: `Patent ${patent.patentNumber} added to your portfolio`,
    });
  };

  const handleExportPatent = (patent: PatentResult) => {
    // TODO: Export patent data
    console.log('Export patent:', patent);
  };

  // Handle trademark actions
  const handleViewTrademarkDetails = (trademark: TrademarkResult) => {
    // TODO: Open trademark detail modal
    console.log('View trademark details:', trademark);
    toast({
      title: "Trademark Details",
      description: `Viewing details for ${trademark.mark} (${trademark.serialNumber})`,
    });
  };

  const handleAddTrademarkToPortfolio = (trademark: TrademarkResult) => {
    // TODO: Add to portfolio
    toast({
      title: "Added to portfolio",
      description: `Trademark ${trademark.mark} added to your portfolio`,
    });
  };

  const handleDownloadTrademarkDocuments = async (trademark: TrademarkResult) => {
    if (trademark.serialNumber) {
      try {
        const result = await USPTOService.downloadTrademarkDocuments(trademark.serialNumber, 'pdf');
        if (result.success && result.data) {
          // Create a blob and download
          const blob = new Blob([result.data], { type: 'application/pdf' });
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `trademark-${trademark.serialNumber}.pdf`;
          document.body.appendChild(a);
          a.click();
          window.URL.revokeObjectURL(url);
          document.body.removeChild(a);
          
          toast({
            title: "Download started",
            description: `Downloading documents for ${trademark.mark}`,
          });
        } else {
          toast({
            title: "Download failed",
            description: result.error || "Unable to download documents",
            variant: "destructive",
          });
        }
      } catch (error) {
        console.error('Download error:', error);
        toast({
          title: "Download failed",
          description: "An error occurred while downloading documents",
          variant: "destructive",
        });
      }
    }
  };

  // Handle adding trademark by serial number
  const handleAddTrademark = async (serialNumber: string): Promise<{ success: boolean; error?: string; trademarkName?: string }> => {
    try {
      console.log(`🔍 Adding trademark with serial number: ${serialNumber}`);
      
      // Check if trademark already exists in current results
      const existingTrademark = trademarkResults?.results.find(
        trademark => trademark.serialNumber === serialNumber
      );
      
      if (existingTrademark) {
        return {
          success: false,
          error: `Trademark with serial number ${serialNumber} is already in the listing`
        };
      }
      
      // Try to get XML data first (preferred), then fall back to HTML
      let parsedTrademark: TrademarkResult | null = null;
      
      // Try XML endpoint first
      try {
        const xmlResult = await USPTOService.getTrademarkXML(serialNumber);
        
        if (xmlResult.success && xmlResult.content) {
          console.log('📋 Using XML data for enhanced trademark information');
          parsedTrademark = USPTOService.parseTrademarkXML(xmlResult.content, serialNumber);
          
          if (parsedTrademark) {
            // Add XML metadata
            parsedTrademark.dataSource = 'xml';
            parsedTrademark.xmlParseSuccess = true;
            parsedTrademark.lastUpdated = new Date().toISOString();
            
            // Calculate renewal deadlines if we have registration date
            if (parsedTrademark.registrationDate) {
              const { calculateAllTrademarkDeadlines, getRenewalStatus } = await import('@/utils/trademarkDeadlines');
              parsedTrademark.deadlines = calculateAllTrademarkDeadlines(
                parsedTrademark.registrationDate,
                parsedTrademark.isForeignBased || false
              );
              parsedTrademark.renewalStatus = getRenewalStatus(parsedTrademark.deadlines);
            }
          }
        }
      } catch (xmlError) {
        console.warn('⚠️ XML endpoint failed, falling back to HTML:', xmlError);
      }
      
      // Fall back to HTML if XML didn't work
      if (!parsedTrademark) {
        console.log('📋 Falling back to HTML data');
        const statusResult = await USPTOService.getTrademarkStatus(serialNumber);
        
        if (!statusResult.success || !statusResult.content) {
          return {
            success: false,
            error: statusResult.error || `No trademark found with serial number ${serialNumber}`
          };
        }
        
        // Parse the HTML response into a TrademarkResult
        parsedTrademark = USPTOService.parseTrademarkResponse(statusResult.content, serialNumber);
        
        if (parsedTrademark) {
          parsedTrademark.dataSource = 'html';
          parsedTrademark.xmlParseSuccess = false;
          parsedTrademark.lastUpdated = new Date().toISOString();
        }
      }
      
      if (!parsedTrademark) {
        return {
          success: false,
          error: 'Failed to parse trademark data from USPTO response'
        };
      }
      
      // Add the new trademark to the existing results
      const updatedResults = {
        ...trademarkResults,
        results: [parsedTrademark, ...(trademarkResults?.results || [])],
        total: (trademarkResults?.total || 0) + 1
      };
      
      setTrademarkResults(updatedResults);
      
      // Show success message
      toast({
        title: "Trademark added successfully",
        description: `${parsedTrademark.mark} (Serial: ${serialNumber}) has been added to the listing`,
      });
      
      return {
        success: true,
        trademarkName: parsedTrademark.mark
      };
      
    } catch (error: any) {
      console.error('Failed to add trademark:', error);
      
      const errorMessage = error.message?.includes('fetch') || error.message?.includes('network')
        ? 'Network error. Please check your connection and try again.'
        : `Failed to add trademark: ${error.message || 'Unknown error'}`;
      
      return {
        success: false,
        error: errorMessage
      };
    }
  };

  // Handle client/matter linking
  const handleLinkToClient = (asset: PatentResult | TrademarkResult, assetType: 'patent' | 'trademark') => {
    setSelectedAsset(asset);
    setSelectedAssetType(assetType);
    setLinkModalOpen(true);
  };

  const handleLinkAsset = async (assetId: string, clientId: string, matterId?: string) => {
    try {
      // TODO: Implement actual linking service call
      await USPTOService.linkAssetToClient(assetId, clientId, matterId);
      
      // Update the results in state to reflect the linking
      if (selectedAssetType === 'patent' && patentResults) {
        const updatedResults = patentResults.results.map(patent => 
          patent.id === assetId 
            ? { ...patent, clientId, matterId, linkedAt: new Date().toISOString() }
            : patent
        );
        setPatentResults({ ...patentResults, results: updatedResults });
      } else if (selectedAssetType === 'trademark' && trademarkResults) {
        const updatedResults = trademarkResults.results.map(trademark => 
          trademark.id === assetId 
            ? { ...trademark, clientId, matterId, linkedAt: new Date().toISOString() }
            : trademark
        );
        setTrademarkResults({ ...trademarkResults, results: updatedResults });
      }

      toast({
        title: "Asset linked successfully",
        description: `${selectedAssetType === 'patent' ? 'Patent' : 'Trademark'} has been linked to the client${matterId ? ' and matter' : ''}`,
      });
    } catch (error) {
      console.error('Failed to link asset:', error);
      toast({
        title: "Link failed",
        description: "Unable to link asset to client. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleUnlinkAsset = async (assetId: string) => {
    try {
      // TODO: Implement actual unlinking service call
      await USPTOService.unlinkAssetFromClient(assetId);
      
      // Update the results in state to reflect the unlinking
      if (selectedAssetType === 'patent' && patentResults) {
        const updatedResults = patentResults.results.map(patent => 
          patent.id === assetId 
            ? { ...patent, clientId: undefined, matterId: undefined, linkedAt: undefined }
            : patent
        );
        setPatentResults({ ...patentResults, results: updatedResults });
      } else if (selectedAssetType === 'trademark' && trademarkResults) {
        const updatedResults = trademarkResults.results.map(trademark => 
          trademark.id === assetId 
            ? { ...trademark, clientId: undefined, matterId: undefined, linkedAt: undefined }
            : trademark
        );
        setTrademarkResults({ ...trademarkResults, results: updatedResults });
      }

      toast({
        title: "Asset unlinked",
        description: "Asset has been unlinked from client and matter",
      });
    } catch (error) {
      console.error('Failed to unlink asset:', error);
      toast({
        title: "Unlink failed",
        description: "Unable to unlink asset. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Handle save search
  const handleSaveSearch = () => {
    // TODO: Open save search modal
    console.log('Save search');
  };

  // Handle export results
  const handleExportResults = () => {
    // TODO: Export current results
    console.log('Export results');
  };

  // Test API connection
  const handleTestAPI = async () => {
    console.log('🧪 Testing USPTO API Connection...');
    try {
      const result = await USPTOService.testAPIConnection();
      console.log('API Test Result:', result);
      toast({
        title: result.success ? "API Test Successful" : "API Test Failed",
        description: result.message,
        variant: result.success ? "default" : "destructive"
      });
    } catch (error) {
      console.error('API Test Error:', error);
      toast({
        title: "API Test Error",
        description: "Failed to test API connection",
        variant: "destructive"
      });
    }
  };

  // Get current results count
  const getCurrentResultsCount = () => {
    if (currentTab === 'patents') {
      return patentResults?.total || 0;
    } else if (currentTab === 'trademarks') {
      return trademarkResults?.total || 0;
    }
    return 0;
  };

  // Render analytics dashboard
  const renderAnalyticsDashboard = () => (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Searches</CardTitle>
          <FileText className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{analytics?.totalSearches.toLocaleString()}</div>
          <p className="text-xs text-muted-foreground">All time searches</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Portfolio Assets</CardTitle>
          <BarChart3 className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{analytics?.portfolioSummary.totalAssets}</div>
          <p className="text-xs text-muted-foreground">
            {analytics?.portfolioSummary.patents} patents, {analytics?.portfolioSummary.trademarks} trademarks
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Portfolio Value</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            ${(analytics?.portfolioSummary.value / 1000000).toFixed(1)}M
          </div>
          <p className="text-xs text-muted-foreground">Estimated total value</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Upcoming Deadlines</CardTitle>
          <Clock className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{analytics?.upcomingDeadlines.length}</div>
          <p className="text-xs text-muted-foreground">Next 30 days</p>
        </CardContent>
      </Card>
    </div>
  );

  // Render search interface
  const renderSearchInterface = () => (
    <div className="space-y-6">
      <USPTOSearch
        searchType={currentTab as SearchType}
        onSearch={handleSearch}
        isSearching={isSearching}
        showAdvanced={showAdvancedSearch}
        onToggleAdvanced={() => setShowAdvancedSearch(!showAdvancedSearch)}
      />

      {/* Search Results */}
      {currentTab === 'patents' && patentResults && (
        <PatentResultsTable
          results={patentResults.results}
          total={patentResults.total}
          currentPage={currentPage}
          pageSize={pageSize}
          onPageChange={handlePageChange}
          onViewDetails={handleViewPatentDetails}
          onAddToPortfolio={handleAddPatentToPortfolio}
          onExportPatent={handleExportPatent}
          isLoading={isSearching}
        />
      )}

      {currentTab === 'trademarks' && trademarkResults && (
        <TrademarkResultsTable
          results={trademarkResults.results}
          total={trademarkResults.total}
          currentPage={currentPage}
          pageSize={pageSize}
          onPageChange={handlePageChange}
          onViewDetails={handleViewTrademarkDetails}
          onAddToPortfolio={handleAddTrademarkToPortfolio}
          onDownloadDocuments={handleDownloadTrademarkDocuments}
          onLinkToClient={(trademark) => handleLinkToClient(trademark, 'trademark')}
          onAddTrademark={handleAddTrademark}
          isLoading={isSearching}
        />
      )}

      {/* No results message */}
      {!isSearching && 
       ((currentTab === 'patents' && patentResults && patentResults.results.length === 0) ||
        (currentTab === 'trademarks' && trademarkResults && trademarkResults.results.length === 0)) && (
        <Card>
          <CardContent className="py-12">
            <div className="text-center">
              <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No results found</h3>
              <p className="text-muted-foreground mb-4">
                Try adjusting your search criteria or using different keywords.
              </p>
              <Button variant="outline" onClick={() => setShowAdvancedSearch(true)}>
                Try Advanced Search
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );

  // Handle saved search actions
  const handleRunSavedSearch = async (searchId: string) => {
    try {
      const result = await USPTOService.runSavedSearch(searchId);
      const search = savedSearches.find(s => s.id === searchId);
      
      if (search?.type === 'patents') {
        setCurrentTab('patents');
        setPatentResults(result as SearchResult<PatentResult>);
      } else if (search?.type === 'trademarks') {
        setCurrentTab('trademarks');
        setTrademarkResults(result as SearchResult<TrademarkResult>);
      }
      
      toast({
        title: "Search executed",
        description: `Found ${result.total} results`,
      });
    } catch (error) {
      console.error('Failed to run saved search:', error);
      toast({
        title: "Search failed",
        description: "Unable to run saved search",
        variant: "destructive",
      });
    }
  };

  const handleDeleteSavedSearch = async (searchId: string) => {
    try {
      await USPTOService.deleteSavedSearch(searchId);
      setSavedSearches(savedSearches.filter(s => s.id !== searchId));
      toast({
        title: "Search deleted",
        description: "Saved search has been removed",
      });
    } catch (error) {
      console.error('Failed to delete saved search:', error);
      toast({
        title: "Delete failed",
        description: "Unable to delete saved search",
        variant: "destructive",
      });
    }
  };

  // Render saved searches
  const renderSavedSearches = () => {
    if (isLoadingSaved) {
      return (
        <Card>
          <CardHeader>
            <CardTitle>Saved Searches</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading saved searches...</p>
            </div>
          </CardContent>
        </Card>
      );
    }

    if (savedSearches.length === 0) {
      return (
        <Card>
          <CardHeader>
            <CardTitle>Saved Searches</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-12">
              <Bookmark className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No saved searches</h3>
              <p className="text-muted-foreground mb-4">
                Save your frequent searches for quick access.
              </p>
              <Button onClick={() => setCurrentTab('patents')}>
                Start Searching
              </Button>
            </div>
          </CardContent>
        </Card>
      );
    }

    return (
      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Saved Searches ({savedSearches.length})</span>
              <Button variant="outline" size="sm" onClick={() => setCurrentTab('patents')}>
                <Search className="h-4 w-4 mr-2" />
                New Search
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {savedSearches.map((search) => (
                <Card key={search.id} className="border border-muted">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="font-semibold">{search.name}</h4>
                          <Badge variant={search.type === 'patents' ? 'default' : 'secondary'}>
                            {search.type}
                          </Badge>
                          {search.isAlert && (
                            <Badge variant="outline" className="text-blue-600">
                              Alert {search.alertFrequency}
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground mb-3">{search.description}</p>
                        
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            Created {new Date(search.createdAt).toLocaleDateString()}
                          </div>
                          {search.lastRunAt && (
                            <div className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              Last run {new Date(search.lastRunAt).toLocaleDateString()}
                            </div>
                          )}
                          {search.resultCount && (
                            <div className="flex items-center gap-1">
                              <BarChart3 className="h-3 w-3" />
                              {search.resultCount} results
                            </div>
                          )}
                        </div>

                        {(search.clientId || search.matterId) && (
                          <div className="flex items-center gap-2 mt-2">
                            {search.clientId && (
                              <Badge variant="outline" className="text-xs">
                                <Building className="h-3 w-3 mr-1" />
                                Client ID: {search.clientId}
                              </Badge>
                            )}
                            {search.matterId && (
                              <Badge variant="outline" className="text-xs">
                                <FileText className="h-3 w-3 mr-1" />
                                Matter ID: {search.matterId}
                              </Badge>
                            )}
                          </div>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          onClick={() => handleRunSavedSearch(search.id)}
                          className="h-8"
                        >
                          <Play className="h-3 w-3 mr-1" />
                          Run
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDeleteSavedSearch(search.id)}
                          className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  // Handle portfolio actions
  const handleRemoveFromPortfolio = async (itemId: string) => {
    try {
      await USPTOService.removeFromPortfolio(itemId);
      setPortfolioItems(portfolioItems.filter(item => item.id !== itemId));
      toast({
        title: "Removed from portfolio",
        description: "Item has been removed from your portfolio",
      });
    } catch (error) {
      console.error('Failed to remove from portfolio:', error);
      toast({
        title: "Remove failed",
        description: "Unable to remove item from portfolio",
        variant: "destructive",
      });
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'granted':
      case 'registered':
        return 'bg-green-100 text-green-800';
      case 'pending':
      case 'published':
        return 'bg-yellow-100 text-yellow-800';
      case 'abandoned':
      case 'expired':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Render portfolio
  const renderPortfolio = () => {
    if (isLoadingPortfolio) {
      return (
        <div className="space-y-6">
          {isLoadingAnalytics ? <AnalyticsSkeleton /> : analytics && renderAnalyticsDashboard()}
          <Card>
            <CardHeader>
              <CardTitle>IP Portfolio</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-muted-foreground">Loading portfolio...</p>
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        {isLoadingAnalytics ? <AnalyticsSkeleton /> : analytics && renderAnalyticsDashboard()}
        
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>IP Portfolio ({portfolioItems.length})</span>
              <Button variant="outline" size="sm" onClick={() => setCurrentTab('patents')}>
                <Search className="h-4 w-4 mr-2" />
                Add Assets
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {portfolioItems.length === 0 ? (
              <div className="text-center py-12">
                <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No portfolio items</h3>
                <p className="text-muted-foreground mb-4">
                  Add patents and trademarks to track your IP portfolio.
                </p>
                <Button onClick={() => setCurrentTab('patents')}>
                  Search Patents
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {portfolioItems.map((item) => (
                  <Card key={item.id} className="border border-muted">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge variant={item.type === 'patent' ? 'default' : 'secondary'}>
                              {item.type}
                            </Badge>
                            <Badge variant="outline" className={getStatusColor(item.status)}>
                              {item.status}
                            </Badge>
                            {item.value && (
                              <Badge variant="outline" className="text-green-600">
                                {formatCurrency(item.value)}
                              </Badge>
                            )}
                          </div>
                          
                          <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                            <div className="flex items-center gap-1">
                              <FileText className="h-3 w-3" />
                              Asset ID: {item.assetId}
                            </div>
                            {item.clientId && (
                              <div className="flex items-center gap-1">
                                <Building className="h-3 w-3" />
                                Client: {item.clientId}
                              </div>
                            )}
                            {item.matterId && (
                              <div className="flex items-center gap-1">
                                <User className="h-3 w-3" />
                                Matter: {item.matterId}
                              </div>
                            )}
                          </div>

                          {item.notes && (
                            <p className="text-sm text-muted-foreground mb-3">{item.notes}</p>
                          )}

                          <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              Added {new Date(item.createdAt).toLocaleDateString()}
                            </div>
                            {item.renewalDate && (
                              <div className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                Renewal {new Date(item.renewalDate).toLocaleDateString()}
                              </div>
                            )}
                            {item.maintenanceDate && (
                              <div className="flex items-center gap-1">
                                <AlertCircle className="h-3 w-3" />
                                Maintenance {new Date(item.maintenanceDate).toLocaleDateString()}
                              </div>
                            )}
                          </div>

                          {item.tags && item.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-2">
                              {item.tags.map((tag) => (
                                <Badge key={tag} variant="outline" className="text-xs">
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                          )}

                          {item.deadlines && item.deadlines.length > 0 && (
                            <div className="mt-3">
                              <p className="text-xs font-medium text-muted-foreground mb-2">Upcoming Deadlines:</p>
                              <div className="space-y-1">
                                {item.deadlines.slice(0, 2).map((deadline) => (
                                  <div key={deadline.id} className="flex items-center gap-2 text-xs">
                                    <Badge variant="outline" className={`${deadline.priority === 'high' ? 'text-red-600' : deadline.priority === 'medium' ? 'text-yellow-600' : 'text-blue-600'}`}>
                                      {deadline.priority}
                                    </Badge>
                                    <span>{deadline.description}</span>
                                    <span className="text-muted-foreground">({new Date(deadline.date).toLocaleDateString()})</span>
                                    {deadline.cost && (
                                      <span className="text-green-600">{formatCurrency(deadline.cost)}</span>
                                    )}
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleRemoveFromPortfolio(item.id)}
                            className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  };

  // Render main content based on current tab
  const renderMainContent = () => {
    switch (currentTab) {
      case 'patents':
      case 'trademarks':
        return renderSearchInterface();
      case 'saved':
        return renderSavedSearches();
      case 'portfolio':
        return renderPortfolio();
      default:
        return renderSearchInterface();
    }
  };

  return (
    <div className="space-y-6">
      <USPTOHeader
        currentTab={currentTab}
        onTabChange={setCurrentTab}
        onToggleFilters={() => setShowFilters(!showFilters)}
        onSaveSearch={handleSaveSearch}
        onExportResults={handleExportResults}
        searchCount={getCurrentResultsCount()}
        isSearching={isSearching}
      />


      {renderMainContent()}

      {/* Client/Matter Link Modal */}
      <ClientMatterLinkModal
        isOpen={linkModalOpen}
        onClose={() => setLinkModalOpen(false)}
        asset={selectedAsset}
        assetType={selectedAssetType}
        onLink={handleLinkAsset}
        onUnlink={handleUnlinkAsset}
        isLoading={isSearching}
      />
    </div>
  );
};

export default USPTO;