import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { 
  FileText, 
  Download, 
  Settings, 
  DollarSign, 
  Shield,
  Clock,
  TrendingUp,
  AlertCircle,
  CheckCircle
} from 'lucide-react';

// Import all our billing components
import FloatingTimer from '@/components/billing/FloatingTimer';
import NaturalTimeEntry from '@/components/billing/NaturalTimeEntry';
import InvoiceGeneratorModal from '@/components/billing/InvoiceGeneratorModal';
import WeeklyHeatMap from '@/components/billing/WeeklyHeatMap';
import LEDESConfigurationModal from '@/components/billing/LEDESConfigurationModal';
import LEDESExportModal from '@/components/billing/LEDESExportModal';
import { BillingErrorBoundary } from '@/components/billing/ErrorBoundary';

// Import services
import { BillingService } from '@/services/billingService';
import { LEDESBillingServiceFixed } from '@/services/ledesBillingService-fixed';
import { TrustAccountService } from '@/services/trustAccountService';
import { MatterService } from '@/services/matterService';
import { ClientService } from '@/services/clientService';

// Import types
import { TimeEntry } from '@/types/billing';
import { TrustAccount, TrustTransaction } from '@/types/trustAccount';
import { LEDESConfigurationFixed } from '@/types/ledes-fixed';

const BillingTest = () => {
  // State management
  const [showTimer, setShowTimer] = useState(false);
  const [timerMinimized, setTimerMinimized] = useState(false);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [showLEDESConfig, setShowLEDESConfig] = useState(false);
  const [showLEDESExport, setShowLEDESExport] = useState(false);
  
  // Data state
  const [recentEntries, setRecentEntries] = useState<TimeEntry[]>([]);
  const [trustAccounts, setTrustAccounts] = useState<TrustAccount[]>([]);
  const [ledesConfigs, setLedesConfigs] = useState<LEDESConfigurationFixed[]>([]);
  const [summary, setSummary] = useState<any>(null);

  // Load data on component mount
  React.useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      // Load recent time entries
      const entries = await BillingService.getRecentTimeEntries(5);
      setRecentEntries(entries);

      // Load trust accounts
      const accounts = await TrustAccountService.getAccounts();
      setTrustAccounts(accounts);

      // Load LEDES configurations
      const configs = await LEDESBillingServiceFixed.getConfigurations();
      setLedesConfigs(configs);

      // Load billing analytics
      const analytics = await BillingService.getBillingAnalytics();
      setSummary(analytics);

    } catch (error) {
      console.error('Error loading dashboard data:', error);
    }
  };

  const handleCreateTestData = async () => {
    try {
      // Initialize clients first
      await ClientService.initializeMockClients();
      
      // Initialize matters for billing test
      await MatterService.initializeBillingTestMatters();
      
      // Generate comprehensive mock time entries
      await BillingService.generateMockTimeEntries();

      // Create test trust accounts for each client
      const trustAccounts = [
        {
          clientId: 'client-001',
          clientName: 'Acme Corporation',
          accountNumber: `TA-ACME-${Date.now()}`,
          accountName: 'Acme Corporation Trust Account',
          currentBalance: 25000,
          availableBalance: 24000,
          pendingBalance: 1000,
          reservedBalance: 0,
          bankName: 'First National Bank',
          routingNumber: '123456789',
          accountType: 'checking',
          currency: 'USD',
          status: 'active',
          ioltaCompliant: true,
          requiresIOLTA: true,
          minimumBalance: 1000,
          openedDate: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000).toISOString(),
          lastActivity: new Date().toISOString(),
          createdBy: 'admin',
          purpose: 'Client retainer and advance payments',
          tags: ['retainer', 'active']
        },
        {
          clientId: 'client-002',
          clientName: 'TechStart Inc',
          accountNumber: `TA-TECH-${Date.now()}`,
          accountName: 'TechStart Inc Trust Account',
          currentBalance: 15000,
          availableBalance: 15000,
          pendingBalance: 0,
          reservedBalance: 0,
          bankName: 'State Trust Bank',
          routingNumber: '987654321',
          accountType: 'savings',
          currency: 'USD',
          status: 'active',
          ioltaCompliant: true,
          requiresIOLTA: false,
          minimumBalance: 500,
          openedDate: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
          lastActivity: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
          createdBy: 'admin',
          purpose: 'IP filing fees and expenses',
          tags: ['ip', 'active']
        },
        {
          clientId: 'client-003',
          clientName: 'Green Energy Solutions',
          accountNumber: `TA-GREEN-${Date.now()}`,
          accountName: 'Green Energy Solutions M&A Trust',
          currentBalance: 150000,
          availableBalance: 140000,
          pendingBalance: 5000,
          reservedBalance: 5000,
          bankName: 'Commercial Trust Company',
          routingNumber: '456789123',
          accountType: 'checking',
          currency: 'USD',
          status: 'active',
          ioltaCompliant: true,
          requiresIOLTA: true,
          minimumBalance: 10000,
          openedDate: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
          lastActivity: new Date().toISOString(),
          createdBy: 'admin',
          purpose: 'M&A escrow and transaction costs',
          tags: ['m&a', 'escrow', 'active']
        }
      ];

      // Create each trust account
      for (const account of trustAccounts) {
        await TrustAccountService.createAccount(account);
      }

      // Create some LEDES configurations
      await LEDESBillingServiceFixed.createConfiguration({
        clientId: 'client-001',
        clientName: 'Acme Corporation',
        format: 'LEDES1998B',
        version: '1998B',
        utbmsMapping: {
          activityCodes: {
            'document_review': 'L110',
            'document_drafting': 'L120',
            'client_meeting': 'L210',
            'legal_research': 'L310'
          },
          expenseCodes: {
            'filing_fees': 'E110',
            'travel': 'E120',
            'copying': 'E130'
          },
          taskCodes: {},
          matterCategories: {},
          defaultActivityCode: 'L100',
          defaultExpenseCode: 'E100'
        },
        validationRules: [],
        customFields: [],
        isActive: true
      });

      await loadDashboardData();
      alert('Test data created successfully! You now have:\n\n• 11 time entries across 3 clients\n• 9 submitted entries ready for invoicing\n• 2 draft entries\n• 3 trust accounts with varying balances\n• 1 LEDES configuration');
    } catch (error) {
      console.error('Error creating test data:', error);
      alert('Error creating test data: ' + (error as Error).message);
    }
  };

  return (
    <BillingErrorBoundary>
      <div className="container mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Billing System Test Dashboard</h1>
            <p className="text-muted-foreground">Test all billing features in one place</p>
          </div>
          <Button onClick={handleCreateTestData} variant="outline">
            Generate Test Data
          </Button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <Badge variant="outline">This Month</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {summary?.totalBilled ? `$${summary.totalBilled.toFixed(2)}` : '$0.00'}
              </div>
              <p className="text-xs text-muted-foreground">Total Billed</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
                <Badge variant="outline" className="text-green-600">Active</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {summary?.realizationRate ? `${summary.realizationRate.toFixed(0)}%` : '0%'}
              </div>
              <p className="text-xs text-muted-foreground">Realization Rate</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <Shield className="h-4 w-4 text-muted-foreground" />
                <Badge variant="outline" className="text-blue-600">Compliant</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{trustAccounts.length}</div>
              <p className="text-xs text-muted-foreground">Trust Accounts</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <FileText className="h-4 w-4 text-muted-foreground" />
                <Badge variant="outline">LEDES</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{ledesConfigs.length}</div>
              <p className="text-xs text-muted-foreground">Configurations</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="time-tracking" className="space-y-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="time-tracking">Time Tracking</TabsTrigger>
            <TabsTrigger value="billing">Billing & Invoices</TabsTrigger>
            <TabsTrigger value="trust-accounts">Trust Accounts</TabsTrigger>
            <TabsTrigger value="compliance">LEDES & Compliance</TabsTrigger>
          </TabsList>

          {/* Time Tracking Tab */}
          <TabsContent value="time-tracking" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Timer Controls</CardTitle>
                    <CardDescription>Track time with floating timer widget</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button 
                      onClick={() => setShowTimer(!showTimer)}
                      className="w-full"
                    >
                      {showTimer ? 'Hide Timer' : 'Show Floating Timer'}
                    </Button>
                  </CardContent>
                </Card>

                <NaturalTimeEntry />
              </div>

              <div className="space-y-4">
                <WeeklyHeatMap />

                <Card>
                  <CardHeader>
                    <CardTitle>Recent Time Entries</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {recentEntries.length === 0 ? (
                      <p className="text-muted-foreground text-center py-4">
                        No time entries yet. Create some test data to get started.
                      </p>
                    ) : (
                      <div className="space-y-2">
                        {recentEntries.map(entry => (
                          <div key={entry.id} className="flex items-center justify-between p-2 border rounded">
                            <div>
                              <div className="font-medium text-sm">{entry.description}</div>
                              <div className="text-xs text-muted-foreground">
                                {entry.clientName} • {entry.hours}h
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="font-medium">${entry.amount.toFixed(2)}</div>
                              <Badge variant="outline" className="text-xs">
                                {entry.status}
                              </Badge>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Billing & Invoices Tab */}
          <TabsContent value="billing" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Invoice Generation</CardTitle>
                <CardDescription>Create invoices from billable time entries</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button 
                  onClick={() => setShowInvoiceModal(true)}
                  className="w-full"
                >
                  <DollarSign className="h-4 w-4 mr-2" />
                  Generate Invoice
                </Button>

                <div className="p-4 bg-muted/50 rounded-lg">
                  <h4 className="font-medium mb-2">Invoice Features:</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Select multiple time entries</li>
                    <li>• Filter by client, matter, and date</li>
                    <li>• Preview before generation</li>
                    <li>• Automatic tax calculation</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Trust Accounts Tab */}
          <TabsContent value="trust-accounts" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Trust Account Management</CardTitle>
                <CardDescription>IOLTA-compliant trust account tracking</CardDescription>
              </CardHeader>
              <CardContent>
                {trustAccounts.length === 0 ? (
                  <div className="text-center py-8">
                    <Shield className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No trust accounts yet.</p>
                    <p className="text-sm text-muted-foreground">Click "Generate Test Data" to create sample accounts.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {trustAccounts.map(account => (
                      <div key={account.id} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <div>
                            <h4 className="font-medium">{account.accountName}</h4>
                            <p className="text-sm text-muted-foreground">
                              {account.clientName} • {account.accountNumber}
                            </p>
                          </div>
                          <div className="text-right">
                            <div className="text-2xl font-bold">${account.currentBalance.toFixed(2)}</div>
                            <Badge variant={account.ioltaCompliant ? "default" : "destructive"}>
                              {account.ioltaCompliant ? <CheckCircle className="h-3 w-3 mr-1" /> : <AlertCircle className="h-3 w-3 mr-1" />}
                              {account.ioltaCompliant ? 'IOLTA Compliant' : 'Non-Compliant'}
                            </Badge>
                          </div>
                        </div>
                        <div className="grid grid-cols-3 gap-4 mt-4 text-sm">
                          <div>
                            <p className="text-muted-foreground">Available</p>
                            <p className="font-medium">${account.availableBalance.toFixed(2)}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Minimum</p>
                            <p className="font-medium">${account.minimumBalance.toFixed(2)}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Status</p>
                            <Badge variant="outline" className="text-xs">
                              {account.status}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* LEDES & Compliance Tab */}
          <TabsContent value="compliance" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>LEDES Configuration</CardTitle>
                  <CardDescription>Manage client billing format requirements</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button 
                    onClick={() => setShowLEDESConfig(true)}
                    variant="outline"
                    className="w-full"
                  >
                    <Settings className="h-4 w-4 mr-2" />
                    Configure LEDES Settings
                  </Button>

                  <div className="space-y-2">
                    {ledesConfigs.map(config => (
                      <div key={config.id} className="flex items-center justify-between p-2 border rounded">
                        <div>
                          <div className="font-medium text-sm">{config.clientName}</div>
                          <div className="text-xs text-muted-foreground">Format: {config.format}</div>
                        </div>
                        <Badge variant={config.isActive ? "default" : "secondary"}>
                          {config.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>LEDES Export</CardTitle>
                  <CardDescription>Export billing data in LEDES format</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button 
                    onClick={() => setShowLEDESExport(true)}
                    className="w-full"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Export to LEDES
                  </Button>

                  <div className="p-4 bg-muted/50 rounded-lg">
                    <h4 className="font-medium mb-2">Supported Formats:</h4>
                    <div className="grid grid-cols-3 gap-2">
                      <Badge variant="outline">LEDES 1998B</Badge>
                      <Badge variant="outline">LEDES 2.0</Badge>
                      <Badge variant="outline">LEDES XML</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        {/* Floating Timer */}
        {showTimer && (
          <FloatingTimer 
            isMinimized={timerMinimized}
            onToggleMinimize={() => setTimerMinimized(!timerMinimized)}
          />
        )}

        {/* Modals */}
        <InvoiceGeneratorModal 
          open={showInvoiceModal}
          onClose={() => setShowInvoiceModal(false)}
        />

        <LEDESConfigurationModal
          open={showLEDESConfig}
          onClose={() => {
            setShowLEDESConfig(false);
            loadDashboardData();
          }}
        />

        <LEDESExportModal
          open={showLEDESExport}
          onClose={() => setShowLEDESExport(false)}
        />
      </div>
    </BillingErrorBoundary>
  );
};

export default BillingTest;