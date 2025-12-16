import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useToast } from '@/hooks/use-toast';
import {
  Plug,
  Plus,
  Search,
  Filter,
  Grid,
  List,
  MoreHorizontal,
  Settings,
  CheckCircle,
  XCircle,
  AlertCircle,
  Clock,
  Star,
  Download,
  Upload,
  RefreshCw,
  Briefcase,
  Folder,
  Mail,
  DollarSign,
  Scale,
  Users,
  Shield,
  Zap,
  TrendingUp,
  Activity,
  Globe,
  Key,
  Eye,
  EyeOff
} from 'lucide-react';
import { 
  Integration, 
  IntegrationCategory, 
  IntegrationSearchFilters,
  IntegrationConnectionRequest,
  INTEGRATION_CATEGORIES,
  COMPLIANCE_STANDARDS
} from '@/types/integrations';
import { integrationsService } from '@/services/integrationsService';
import { cn } from '@/lib/utils';

const CATEGORY_ICONS = {
  practice_management: Briefcase,
  document_storage: Folder,
  email_communication: Mail,
  billing_accounting: DollarSign,
  legal_research: Search,
  ediscovery_litigation: Scale,
  client_intake_crm: Users,
  compliance_security: Shield,
};

const Integrations = () => {
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [connectedIntegrations, setConnectedIntegrations] = useState<Integration[]>([]);
  const [selectedIntegration, setSelectedIntegration] = useState<Integration | null>(null);
  const [showConnectionDialog, setShowConnectionDialog] = useState(false);
  const [showSettingsDialog, setShowSettingsDialog] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<IntegrationSearchFilters>({});
  const [connectionCredentials, setConnectionCredentials] = useState<Record<string, any>>({});
  const [isConnecting, setIsConnecting] = useState(false);
  const [isDisconnecting, setIsDisconnecting] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadIntegrations();
  }, [filters, searchQuery]);

  const loadIntegrations = () => {
    const searchFilters = { ...filters, search: searchQuery };
    const allIntegrations = integrationsService.searchIntegrations(searchFilters);
    const connected = integrationsService.getConnectedIntegrations();
    
    setIntegrations(allIntegrations);
    setConnectedIntegrations(connected);
  };

  const handleConnect = async (integration: Integration) => {
    setSelectedIntegration(integration);
    setConnectionCredentials({});
    setShowConnectionDialog(true);
  };

  const handleDisconnect = async (integrationId: string) => {
    setIsDisconnecting(true);
    try {
      await integrationsService.disconnectIntegration(integrationId);
      toast({
        title: 'Integration disconnected',
        description: 'The integration has been successfully disconnected',
      });
      loadIntegrations();
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to disconnect integration',
        variant: 'destructive',
      });
    } finally {
      setIsDisconnecting(false);
    }
  };

  const handleConnectionSubmit = async () => {
    if (!selectedIntegration) return;

    setIsConnecting(true);
    try {
      const request: IntegrationConnectionRequest = {
        integrationId: selectedIntegration.id,
        credentials: connectionCredentials,
      };

      await integrationsService.connectIntegration(request);
      
      toast({
        title: 'Integration connected',
        description: `${selectedIntegration.name} has been successfully connected`,
      });
      
      setShowConnectionDialog(false);
      setSelectedIntegration(null);
      setConnectionCredentials({});
      loadIntegrations();
    } catch (error) {
      toast({
        title: 'Connection failed',
        description: error instanceof Error ? error.message : 'Failed to connect integration',
        variant: 'destructive',
      });
    } finally {
      setIsConnecting(false);
    }
  };

  const handleTestConnection = async (integrationId: string) => {
    setIsTesting(true);
    try {
      const success = await integrationsService.testConnection(integrationId);
      toast({
        title: success ? 'Connection successful' : 'Connection failed',
        description: success ? 'The integration is working correctly' : 'There was an issue with the connection',
        variant: success ? 'default' : 'destructive',
      });
    } catch (error) {
      toast({
        title: 'Test failed',
        description: 'Unable to test the connection',
        variant: 'destructive',
      });
    } finally {
      setIsTesting(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'connected':
        return <Badge variant="default" className="bg-green-100 text-green-700 border-green-200 text-xs h-5">
          <CheckCircle className="h-3 w-3 mr-1" />
          Connected
        </Badge>;
      case 'error':
        return <Badge variant="destructive" className="text-xs h-5">
          <XCircle className="h-3 w-3 mr-1" />
          Error
        </Badge>;
      case 'pending':
        return <Badge variant="secondary" className="text-xs h-5">
          <Clock className="h-3 w-3 mr-1" />
          Pending
        </Badge>;
      default:
        return <Badge variant="outline" className="text-xs h-5">
          <AlertCircle className="h-3 w-3 mr-1" />
          Disconnected
        </Badge>;
    }
  };

  const getComplexityBadge = (complexity: string) => {
    const variants = {
      easy: { className: 'bg-green-100 text-green-700 border-green-200', label: 'Easy' },
      medium: { className: 'bg-yellow-100 text-yellow-700 border-yellow-200', label: 'Medium' },
      advanced: { className: 'bg-red-100 text-red-700 border-red-200', label: 'Advanced' },
    };

    const variant = variants[complexity as keyof typeof variants];
    return (
      <Badge variant="outline" className={cn(variant.className, "text-xs h-5")}>
        {variant.label}
      </Badge>
    );
  };

  const getPricingBadge = (pricing: string) => {
    const variants = {
      free: { className: 'bg-green-100 text-green-700 border-green-200', label: 'Free' },
      freemium: { className: 'bg-blue-100 text-blue-700 border-blue-200', label: 'Freemium' },
      paid: { className: 'bg-purple-100 text-purple-700 border-purple-200', label: 'Paid' },
    };

    const variant = variants[pricing as keyof typeof variants];
    return (
      <Badge variant="outline" className={cn(variant.className, "text-xs h-5")}>
        {variant.label}
      </Badge>
    );
  };

  const IntegrationCard = ({ integration }: { integration: Integration }) => {
    const CategoryIcon = CATEGORY_ICONS[integration.category];
    
    return (
      <Card className="relative overflow-hidden hover:shadow-lg transition-all duration-200 h-full">
        <div className="absolute top-2 right-2 z-10">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              {integration.status === 'connected' ? (
                <>
                  <DropdownMenuItem onClick={() => handleTestConnection(integration.id)}>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Test Connection
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setSelectedIntegration(integration)}>
                    <Settings className="h-4 w-4 mr-2" />
                    Settings
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    onClick={() => handleDisconnect(integration.id)}
                    className="text-red-600"
                  >
                    <XCircle className="h-4 w-4 mr-2" />
                    Disconnect
                  </DropdownMenuItem>
                </>
              ) : (
                <>
                  <DropdownMenuItem onClick={() => handleConnect(integration)}>
                    <Plug className="h-4 w-4 mr-2" />
                    Connect
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => window.open(integration.website, '_blank')}>
                    <Globe className="h-4 w-4 mr-2" />
                    Visit Website
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="p-4 h-full flex flex-col">
          {/* Header with icon and name */}
          <div className="flex items-start gap-3 mb-3">
            <div className={cn(
              "h-10 w-10 rounded-lg flex items-center justify-center flex-shrink-0",
              integration.status === 'connected' ? "bg-green-100 text-green-600" : "bg-muted text-muted-foreground"
            )}>
              <CategoryIcon className="h-5 w-5" />
            </div>
            <div className="flex-1 min-w-0 pr-4">
              <h3 className="font-semibold text-base leading-tight mb-1">{integration.name}</h3>
              {integration.isPopular && (
                <Badge variant="secondary" className="text-xs">
                  <Star className="h-3 w-3 mr-1" />
                  Popular
                </Badge>
              )}
            </div>
          </div>

          {/* Description */}
          <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
            {integration.description}
          </p>

          {/* Status badges */}
          <div className="flex flex-wrap items-center gap-1 mb-3">
            {getStatusBadge(integration.status)}
            {getComplexityBadge(integration.setupComplexity)}
            {getPricingBadge(integration.pricing)}
          </div>

          {/* Connected info or Auth type */}
          {integration.status === 'connected' ? (
            <div className="space-y-1 mb-3 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Last Sync</span>
                <span className="font-medium">{new Date(integration.lastSync!).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Records</span>
                <span className="font-medium">{integration.syncedRecords?.toLocaleString()}</span>
              </div>
            </div>
          ) : (
            <div className="mb-3 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Auth Type</span>
                <span className="font-medium capitalize">{integration.authType.replace('_', ' ')}</span>
              </div>
            </div>
          )}

          {/* Compliance badges - only show if connected or has many */}
          {(integration.status === 'connected' || integration.compliance.length > 2) && integration.compliance.length > 0 && (
            <div className="mb-3">
              <div className="flex flex-wrap gap-1">
                {integration.compliance.slice(0, 2).map((standard) => (
                  <Badge key={standard} variant="outline" className="text-xs">
                    {standard}
                  </Badge>
                ))}
                {integration.compliance.length > 2 && (
                  <Badge variant="outline" className="text-xs">
                    +{integration.compliance.length - 2}
                  </Badge>
                )}
              </div>
            </div>
          )}

          {/* Features - simplified */}
          <div className="mb-3">
            <div className="flex flex-wrap gap-1">
              {integration.features.slice(0, 3).map((feature) => (
                <Badge key={feature} variant="secondary" className="text-xs">
                  {feature}
                </Badge>
              ))}
              {integration.features.length > 3 && (
                <Badge variant="secondary" className="text-xs">
                  +{integration.features.length - 3}
                </Badge>
              )}
            </div>
          </div>

          {/* Action button - single button at bottom */}
          <div className="mt-auto">
            {integration.status === 'connected' ? (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => handleDisconnect(integration.id)}
                disabled={isDisconnecting}
                className="w-full"
              >
                Disconnect
              </Button>
            ) : (
              <Button 
                size="sm" 
                onClick={() => handleConnect(integration)}
                disabled={isConnecting}
                className="w-full"
              >
                Connect
              </Button>
            )}
          </div>
        </div>
      </Card>
    );
  };

  const CategoryFilter = () => (
    <div className="space-y-4">
      <h3 className="font-medium">Categories</h3>
      <div className="space-y-1">
        <Button
          variant={!filters.category ? "default" : "ghost"}
          className="w-full justify-start text-sm h-9"
          onClick={() => setFilters(prev => ({ ...prev, category: undefined }))}
        >
          <Grid className="h-4 w-4 mr-2" />
          All Categories
        </Button>
        {Object.entries(INTEGRATION_CATEGORIES).map(([key, category]) => {
          const Icon = CATEGORY_ICONS[key as IntegrationCategory];
          return (
            <Button
              key={key}
              variant={filters.category === key ? "default" : "ghost"}
              className="w-full justify-start text-sm h-9"
              onClick={() => setFilters(prev => ({ ...prev, category: key as IntegrationCategory }))}
            >
              <Icon className="h-4 w-4 mr-2 flex-shrink-0" />
              <span className="truncate">{category.name}</span>
              <Badge variant="outline" className="ml-auto text-xs">
                {category.count}
              </Badge>
            </Button>
          );
        })}
      </div>
    </div>
  );

  const FilterPanel = () => (
    <div className="space-y-6">
      <CategoryFilter />
      
      <div className="space-y-4">
        <h3 className="font-medium">Filters</h3>
        
        <div className="space-y-2">
          <Label>Status</Label>
          <Select 
            value={filters.status || 'all'} 
            onValueChange={(value) => setFilters(prev => ({ ...prev, status: value === 'all' ? undefined : value as any }))}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="connected">Connected</SelectItem>
              <SelectItem value="disconnected">Disconnected</SelectItem>
              <SelectItem value="error">Error</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Setup Complexity</Label>
          <Select 
            value={filters.setupComplexity || 'all'} 
            onValueChange={(value) => setFilters(prev => ({ ...prev, setupComplexity: value === 'all' ? undefined : value as any }))}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Complexity</SelectItem>
              <SelectItem value="easy">Easy</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="advanced">Advanced</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Pricing</Label>
          <Select 
            value={filters.pricing || 'all'} 
            onValueChange={(value) => setFilters(prev => ({ ...prev, pricing: value === 'all' ? undefined : value as any }))}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Pricing</SelectItem>
              <SelectItem value="free">Free</SelectItem>
              <SelectItem value="freemium">Freemium</SelectItem>
              <SelectItem value="paid">Paid</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="pt-4 border-t">
        <Button 
          variant="outline" 
          onClick={() => setFilters({})}
          className="w-full"
        >
          Clear Filters
        </Button>
      </div>
    </div>
  );

  const ConnectedIntegrationsView = () => (
    <div className="space-y-6">
      {connectedIntegrations.length === 0 ? (
        <div className="text-center py-12">
          <Plug className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-medium mb-2">No integrations connected</h3>
          <p className="text-muted-foreground mb-4">
            Connect your first integration to start synchronizing data
          </p>
          <Button onClick={() => setFilters({})}>
            <Plus className="h-4 w-4 mr-2" />
            Browse Integrations
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4">
          {connectedIntegrations.map((integration) => (
            <IntegrationCard key={integration.id} integration={integration} />
          ))}
        </div>
      )}
    </div>
  );

  const BrowseIntegrationsView = () => (
    <div className="flex flex-col lg:flex-row gap-6">
      <div className="lg:w-64 flex-shrink-0">
        <Card className="p-4">
          <FilterPanel />
        </Card>
      </div>
      
      <div className="flex-1 min-w-0">
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="relative max-w-sm">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search integrations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <div className="flex items-center gap-2">
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

          {integrations.length === 0 ? (
            <div className="text-center py-12">
              <Search className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-medium mb-2">No integrations found</h3>
              <p className="text-muted-foreground">
                Try adjusting your search or filters
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4">
              {integrations.map((integration) => (
                <IntegrationCard key={integration.id} integration={integration} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Integrations</h1>
          <p className="text-muted-foreground mt-1">
            Connect your legal practice with essential tools and platforms
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm">
            <Upload className="h-4 w-4 mr-2" />
            Import
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Request Integration
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Available</p>
              <p className="text-2xl font-bold">{integrations.length}</p>
            </div>
            <Grid className="h-8 w-8 text-muted-foreground" />
          </div>
        </Card>
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Connected</p>
              <p className="text-2xl font-bold">{connectedIntegrations.length}</p>
            </div>
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
        </Card>
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Categories</p>
              <p className="text-2xl font-bold">{Object.keys(INTEGRATION_CATEGORIES).length}</p>
            </div>
            <Filter className="h-8 w-8 text-blue-600" />
          </div>
        </Card>
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Popular</p>
              <p className="text-2xl font-bold">{integrationsService.getPopularIntegrations().length}</p>
            </div>
            <Star className="h-8 w-8 text-yellow-600" />
          </div>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="browse" className="space-y-4">
        <TabsList>
          <TabsTrigger value="browse">Browse</TabsTrigger>
          <TabsTrigger value="connected">Connected ({connectedIntegrations.length})</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="browse">
          <BrowseIntegrationsView />
        </TabsContent>

        <TabsContent value="connected">
          <ConnectedIntegrationsView />
        </TabsContent>

        <TabsContent value="settings">
          <Card className="p-6">
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium mb-2">Integration Settings</h3>
                <p className="text-sm text-muted-foreground">
                  Configure global settings for your integrations
                </p>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Auto-sync integrations</Label>
                    <p className="text-sm text-muted-foreground">
                      Automatically sync data from connected integrations
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Sync notifications</Label>
                    <p className="text-sm text-muted-foreground">
                      Receive notifications when syncs complete or fail
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Security alerts</Label>
                    <p className="text-sm text-muted-foreground">
                      Get notified about security issues with integrations
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>
              </div>
            </div>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Connection Dialog */}
      <Dialog open={showConnectionDialog} onOpenChange={setShowConnectionDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Connect {selectedIntegration?.name}</DialogTitle>
            <DialogDescription>
              {selectedIntegration?.longDescription}
            </DialogDescription>
          </DialogHeader>
          
          {selectedIntegration && (
            <div className="space-y-4">
              {selectedIntegration.authType === 'oauth' ? (
                <div className="text-center py-6">
                  <Globe className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-medium mb-2">OAuth Connection</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    You'll be redirected to {selectedIntegration.provider} to authorize the connection
                  </p>
                  <Button onClick={handleConnectionSubmit} disabled={isConnecting}>
                    {isConnecting ? <RefreshCw className="h-4 w-4 mr-2 animate-spin" /> : <Key className="h-4 w-4 mr-2" />}
                    Authorize Connection
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {selectedIntegration.requiredFields.map((field) => (
                    <div key={field.id} className="space-y-2">
                      <Label htmlFor={field.id}>{field.name}</Label>
                      <Input
                        id={field.id}
                        type={field.type}
                        placeholder={field.placeholder}
                        value={connectionCredentials[field.id] || ''}
                        onChange={(e) => setConnectionCredentials(prev => ({
                          ...prev,
                          [field.id]: e.target.value
                        }))}
                        required={field.required}
                      />
                      {field.help && (
                        <p className="text-sm text-muted-foreground">{field.help}</p>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {selectedIntegration.compliance.length > 0 && (
                <div className="p-4 bg-muted rounded-lg">
                  <h4 className="font-medium mb-2">Compliance & Security</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedIntegration.compliance.map((standard) => (
                      <Badge key={standard} variant="secondary" className="text-xs">
                        <Shield className="h-3 w-3 mr-1" />
                        {standard}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowConnectionDialog(false)}>
              Cancel
            </Button>
            {selectedIntegration?.authType !== 'oauth' && (
              <Button onClick={handleConnectionSubmit} disabled={isConnecting}>
                {isConnecting ? <RefreshCw className="h-4 w-4 mr-2 animate-spin" /> : <Plug className="h-4 w-4 mr-2" />}
                Connect
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Integrations;