import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  CheckCircle, 
  XCircle, 
  RefreshCw, 
  Settings, 
  AlertTriangle,
  ExternalLink,
  Download,
  Upload,
  Clock,
  Users,
  FileText,
  DollarSign
} from 'lucide-react';
import { XeroService } from '@/services/xeroService';
import { XeroConfig, XeroIntegrationSettings, XeroSyncResult, XeroTenant } from '@/types/xero';
import { useToast } from '@/components/ui/use-toast';

interface XeroIntegrationProps {
  className?: string;
}

const XeroIntegration: React.FC<XeroIntegrationProps> = ({ className }) => {
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [connectionStatus, setConnectionStatus] = useState<{
    isConnected: boolean;
    tenantName?: string;
    lastSync?: string;
  }>({ isConnected: false });
  
  const [config, setConfig] = useState<XeroConfig>({
    clientId: import.meta.env.VITE_XERO_CLIENT_ID || '',
    clientSecret: import.meta.env.VITE_XERO_CLIENT_SECRET || '',
    redirectUri: import.meta.env.VITE_XERO_REDIRECT_URI || 'http://localhost:3000/auth/xero/callback',
    scope: 'openid profile email accounting.transactions accounting.contacts accounting.settings offline_access'
  });
  
  const [settings, setSettings] = useState<XeroIntegrationSettings>({
    isEnabled: false,
    autoSync: false,
    syncFrequency: 'daily',
    defaultCurrency: 'USD',
    contactSyncEnabled: true,
    paymentSyncEnabled: true
  });
  
  const [tenants, setTenants] = useState<XeroTenant[]>([]);
  const [selectedTenant, setSelectedTenant] = useState<string>('');
  const [syncResults, setSyncResults] = useState<XeroSyncResult[]>([]);
  const [isSyncing, setIsSyncing] = useState(false);
  
  const { toast } = useToast();

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      setIsLoading(true);
      const [storedSettings, storedConfig, status] = await Promise.all([
        XeroService.getIntegrationSettings(),
        XeroService.getConfig(),
        XeroService.getConnectionStatus()
      ]);

      setSettings(storedSettings);
      setConfig(storedConfig);
      setConnectionStatus(status);
      setIsConnected(status.isConnected);

      if (status.isConnected) {
        loadTenants();
      }
    } catch (error) {
      console.error('Error loading initial data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadTenants = async () => {
    try {
      const tenantsData = await XeroService.getTenants();
      setTenants(tenantsData);
      
      const currentTenant = XeroService.getConfig().tenantId;
      if (currentTenant) {
        setSelectedTenant(currentTenant);
      }
    } catch (error) {
      console.error('Error loading tenants:', error);
      toast({
        title: "Error loading tenants",
        description: "Failed to load Xero organizations",
        variant: "destructive"
      });
    }
  };

  const handleConnect = () => {
    if (!config.clientId || !config.clientSecret) {
      toast({
        title: "Configuration Required",
        description: "Please enter your Xero Client ID and Client Secret",
        variant: "destructive"
      });
      return;
    }

    XeroService.setConfig(config);
    
    // For development: Direct connection without OAuth
    if (import.meta.env.DEV && import.meta.env.VITE_XERO_SKIP_OAUTH === 'true') {
      handleDevConnection();
    } else {
      const authUrl = XeroService.getAuthUrl();
      window.location.href = authUrl;
    }
  };

  const handleDevConnection = async () => {
    try {
      // Mock successful connection for development
      setIsConnected(true);
      setConnectionStatus({
        isConnected: true,
        tenantName: 'Development Tenant',
        lastSync: new Date().toISOString()
      });
      
      // Mock tenant data
      setTenants([{
        tenantId: 'dev-tenant-id',
        tenantType: 'ORGANISATION',
        tenantName: 'Development Tenant',
        createdDateUtc: new Date().toISOString(),
        updatedDateUtc: new Date().toISOString()
      }]);
      setSelectedTenant('dev-tenant-id');
      
      toast({
        title: "Connected (Dev Mode)",
        description: "Using development connection without OAuth"
      });
    } catch (error) {
      toast({
        title: "Connection Failed",
        description: "Failed to establish development connection",
        variant: "destructive"
      });
    }
  };

  const handleDisconnect = () => {
    localStorage.removeItem('xero_access_token');
    localStorage.removeItem('xero_refresh_token');
    setIsConnected(false);
    setConnectionStatus({ isConnected: false });
    setTenants([]);
    setSelectedTenant('');
    
    toast({
      title: "Disconnected",
      description: "Successfully disconnected from Xero"
    });
  };

  const handleTestConnection = async () => {
    try {
      setIsLoading(true);
      const isValid = await XeroService.testConnection();
      
      if (isValid) {
        toast({
          title: "Connection Successful",
          description: "Successfully connected to Xero API"
        });
      } else {
        throw new Error('Connection test failed');
      }
    } catch (error) {
      toast({
        title: "Connection Failed",
        description: "Unable to connect to Xero API",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleTenantSelect = (tenantId: string) => {
    setSelectedTenant(tenantId);
    XeroService.setTenant(tenantId);
    
    const updatedConfig = { ...config, tenantId };
    setConfig(updatedConfig);
    XeroService.setConfig(updatedConfig);
    
    toast({
      title: "Organization Selected",
      description: "Xero organization has been updated"
    });
  };

  const handleSettingsUpdate = (key: keyof XeroIntegrationSettings, value: any) => {
    const updatedSettings = { ...settings, [key]: value };
    setSettings(updatedSettings);
    XeroService.saveIntegrationSettings(updatedSettings);
  };

  const handleSyncClients = async () => {
    try {
      setIsSyncing(true);
      // This would integrate with your actual client service
      // const clients = await ClientService.getClients();
      // const result = await XeroService.syncClientsToContacts(clients);
      
      // Mock sync for now
      const mockResult: XeroSyncResult = {
        status: 'success',
        message: 'Successfully synced 5 clients to Xero',
        timestamp: new Date().toISOString(),
        itemsProcessed: 5
      };

      setSyncResults(prev => [mockResult, ...prev.slice(0, 9)]);
      
      toast({
        title: "Sync Complete",
        description: mockResult.message
      });
    } catch (error) {
      toast({
        title: "Sync Failed",
        description: "Failed to sync clients to Xero",
        variant: "destructive"
      });
    } finally {
      setIsSyncing(false);
    }
  };

  const handleSyncInvoices = async () => {
    try {
      setIsSyncing(true);
      // This would integrate with your billing service
      // const invoices = await BillingService.getInvoices();
      // const result = await XeroService.syncInvoicesToXero(invoices);
      
      // Mock sync for now
      const mockResult: XeroSyncResult = {
        status: 'success',
        message: 'Successfully synced 12 invoices to Xero',
        timestamp: new Date().toISOString(),
        itemsProcessed: 12
      };

      setSyncResults(prev => [mockResult, ...prev.slice(0, 9)]);
      
      toast({
        title: "Sync Complete",
        description: mockResult.message
      });
    } catch (error) {
      toast({
        title: "Sync Failed",
        description: "Failed to sync invoices to Xero",
        variant: "destructive"
      });
    } finally {
      setIsSyncing(false);
    }
  };

  if (isLoading) {
    return (
      <Card className={className}>
        <CardContent className="p-6 flex items-center justify-center">
          <RefreshCw className="h-6 w-6 animate-spin mr-2" />
          <span>Loading Xero integration...</span>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Connection Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Xero Integration</span>
            <Badge variant={isConnected ? "default" : "secondary"}>
              {isConnected ? (
                <>
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Connected
                </>
              ) : (
                <>
                  <XCircle className="h-3 w-3 mr-1" />
                  Disconnected
                </>
              )}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isConnected ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Connected to: {connectionStatus.tenantName}</p>
                  {connectionStatus.lastSync && (
                    <p className="text-sm text-muted-foreground">
                      Last sync: {new Date(connectionStatus.lastSync).toLocaleString()}
                    </p>
                  )}
                </div>
                <div className="space-x-2">
                  <Button variant="outline" size="sm" onClick={handleTestConnection}>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Test Connection
                  </Button>
                  <Button variant="destructive" size="sm" onClick={handleDisconnect}>
                    Disconnect
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="clientId">Client ID</Label>
                  <Input
                    id="clientId"
                    type="password"
                    placeholder="Your Xero Client ID"
                    value={config.clientId}
                    onChange={(e) => setConfig({ ...config, clientId: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="clientSecret">Client Secret</Label>
                  <Input
                    id="clientSecret"
                    type="password"
                    placeholder="Your Xero Client Secret"
                    value={config.clientSecret}
                    onChange={(e) => setConfig({ ...config, clientSecret: e.target.value })}
                  />
                </div>
              </div>
              
              <Button onClick={handleConnect} className="w-full">
                <ExternalLink className="h-4 w-4 mr-2" />
                Connect to Xero
              </Button>
              
              <div className="text-sm text-muted-foreground">
                <p>Need help setting up? Visit the <a href="https://developer.xero.com" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Xero Developer Center</a></p>
                {import.meta.env.DEV && (
                  <p className="mt-2 text-orange-600">
                    Development Mode: Add VITE_XERO_SKIP_OAUTH=true to .env to bypass OAuth
                  </p>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {isConnected && (
        <Tabs defaultValue="sync" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="sync">Sync Data</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
            <TabsTrigger value="history">Sync History</TabsTrigger>
          </TabsList>

          {/* Sync Tab */}
          <TabsContent value="sync" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Data Synchronization</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center">
                          <Users className="h-5 w-5 mr-2 text-blue-500" />
                          <span className="font-medium">Clients</span>
                        </div>
                        <Badge variant="outline">Ready</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-4">
                        Sync client information to Xero contacts
                      </p>
                      <Button 
                        onClick={handleSyncClients} 
                        disabled={isSyncing}
                        className="w-full"
                        size="sm"
                      >
                        {isSyncing ? (
                          <>
                            <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                            Syncing...
                          </>
                        ) : (
                          <>
                            <Upload className="h-4 w-4 mr-2" />
                            Sync Clients
                          </>
                        )}
                      </Button>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center">
                          <FileText className="h-5 w-5 mr-2 text-green-500" />
                          <span className="font-medium">Invoices</span>
                        </div>
                        <Badge variant="outline">Ready</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-4">
                        Sync invoices to Xero accounting
                      </p>
                      <Button 
                        onClick={handleSyncInvoices} 
                        disabled={isSyncing}
                        className="w-full"
                        size="sm"
                      >
                        {isSyncing ? (
                          <>
                            <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                            Syncing...
                          </>
                        ) : (
                          <>
                            <Upload className="h-4 w-4 mr-2" />
                            Sync Invoices
                          </>
                        )}
                      </Button>
                    </CardContent>
                  </Card>
                </div>

                {tenants.length > 0 && (
                  <div className="mt-6">
                    <Label htmlFor="tenant">Xero Organization</Label>
                    <Select value={selectedTenant} onValueChange={handleTenantSelect}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select Xero organization" />
                      </SelectTrigger>
                      <SelectContent>
                        {tenants.map((tenant) => (
                          <SelectItem key={tenant.tenantId} value={tenant.tenantId}>
                            {tenant.tenantName}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Integration Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="auto-sync">Enable Auto Sync</Label>
                    <p className="text-sm text-muted-foreground">
                      Automatically sync data at regular intervals
                    </p>
                  </div>
                  <Switch
                    id="auto-sync"
                    checked={settings.autoSync}
                    onCheckedChange={(checked) => handleSettingsUpdate('autoSync', checked)}
                  />
                </div>

                <Separator />

                <div>
                  <Label htmlFor="sync-frequency">Sync Frequency</Label>
                  <Select 
                    value={settings.syncFrequency} 
                    onValueChange={(value) => handleSettingsUpdate('syncFrequency', value)}
                  >
                    <SelectTrigger className="w-48 mt-2">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="hourly">Every Hour</SelectItem>
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Separator />

                <div>
                  <Label htmlFor="currency">Default Currency</Label>
                  <Select 
                    value={settings.defaultCurrency} 
                    onValueChange={(value) => handleSettingsUpdate('defaultCurrency', value)}
                  >
                    <SelectTrigger className="w-48 mt-2">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="USD">USD - US Dollar</SelectItem>
                      <SelectItem value="EUR">EUR - Euro</SelectItem>
                      <SelectItem value="GBP">GBP - British Pound</SelectItem>
                      <SelectItem value="AUD">AUD - Australian Dollar</SelectItem>
                      <SelectItem value="CAD">CAD - Canadian Dollar</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Separator />

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="contact-sync">Sync Contacts</Label>
                      <p className="text-sm text-muted-foreground">
                        Enable client to contact synchronization
                      </p>
                    </div>
                    <Switch
                      id="contact-sync"
                      checked={settings.contactSyncEnabled}
                      onCheckedChange={(checked) => handleSettingsUpdate('contactSyncEnabled', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="payment-sync">Sync Payments</Label>
                      <p className="text-sm text-muted-foreground">
                        Enable payment synchronization
                      </p>
                    </div>
                    <Switch
                      id="payment-sync"
                      checked={settings.paymentSyncEnabled}
                      onCheckedChange={(checked) => handleSettingsUpdate('paymentSyncEnabled', checked)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* History Tab */}
          <TabsContent value="history">
            <Card>
              <CardHeader>
                <CardTitle>Sync History</CardTitle>
              </CardHeader>
              <CardContent>
                {syncResults.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No sync history available</p>
                    <p className="text-sm">Sync data will appear here after your first sync</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {syncResults.map((result, index) => (
                      <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center space-x-3">
                          {result.status === 'success' ? (
                            <CheckCircle className="h-5 w-5 text-green-500" />
                          ) : result.status === 'error' ? (
                            <XCircle className="h-5 w-5 text-red-500" />
                          ) : (
                            <AlertTriangle className="h-5 w-5 text-yellow-500" />
                          )}
                          <div>
                            <p className="font-medium">{result.message}</p>
                            <p className="text-sm text-muted-foreground">
                              {new Date(result.timestamp).toLocaleString()}
                            </p>
                            {result.errors && result.errors.length > 0 && (
                              <p className="text-sm text-red-500 mt-1">
                                {result.errors.length} error(s) occurred
                              </p>
                            )}
                          </div>
                        </div>
                        <Badge variant={result.status === 'success' ? 'default' : 'destructive'}>
                          {result.itemsProcessed} items
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
};

export default XeroIntegration;