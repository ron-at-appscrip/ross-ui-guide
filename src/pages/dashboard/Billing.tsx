
import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import FloatingTimer from '@/components/billing/FloatingTimer';
import TimeEntryGrid from '@/components/billing/TimeEntryGrid';
import NaturalTimeEntry from '@/components/billing/NaturalTimeEntry';
import WeeklyHeatMap from '@/components/billing/WeeklyHeatMap';
import { 
  LazyUnsubmittedEntriesModal, 
  LazyInvoiceGeneratorModal,
  ComponentPreloader,
  useConditionalPreload,
  preloadInvoiceGenerator,
  preloadUnsubmittedEntries
} from '@/components/billing/LazyComponents';
import { Clock, FileText, DollarSign, BarChart3, AlertCircle } from 'lucide-react';
import { BillingService } from '@/services/billingService';
import InvoicingTab from '@/components/billing/InvoicingTab';
import PaymentsTab from '@/components/billing/PaymentsTab';
import XeroIntegration from '@/components/billing/XeroIntegration';

const Billing = () => {
  const [searchParams] = useSearchParams();
  const [timerMinimized, setTimerMinimized] = useState(false);
  const [showUnsubmittedModal, setShowUnsubmittedModal] = useState(false);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [unsubmittedCount, setUnsubmittedCount] = useState(0);
  const [billingStats, setBillingStats] = useState({
    weeklyHours: 32.5,
    billableHours: 28.2,
    outstanding: 45200,
    collectionRate: 94
  });

  // Get the default tab from URL params
  const defaultTab = searchParams.get('tab') || 'time-entry';

  // Hook for conditional component preloading
  const { preload } = useConditionalPreload();

  useEffect(() => {
    loadUnsubmittedCount();
    loadBillingStats();
  }, []);

  const loadUnsubmittedCount = async () => {
    try {
      const unsubmittedEntries = await BillingService.getUnsubmittedEntries();
      setUnsubmittedCount(unsubmittedEntries.length);
    } catch (error) {
      console.error('Error loading unsubmitted count:', error);
    }
  };

  const loadBillingStats = async () => {
    try {
      const analytics = await BillingService.getBillingAnalytics();
      setBillingStats({
        weeklyHours: 32.5, // Mock - would calculate from recent entries
        billableHours: 28.2, // Mock - would calculate billable percentage
        outstanding: analytics.outstandingAmount,
        collectionRate: analytics.utilizationRate
      });
    } catch (error) {
      console.error('Error loading billing stats:', error);
    }
  };

  const handleUnsubmittedModalClose = () => {
    setShowUnsubmittedModal(false);
    loadUnsubmittedCount(); // Refresh count after modal closes
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Time & Billing</h1>
        <div className="flex space-x-2">
          <Button 
            variant="outline" 
            onClick={() => setShowUnsubmittedModal(true)}
            onMouseEnter={() => preload('unsubmitted-entries', preloadUnsubmittedEntries)}
            className={unsubmittedCount > 0 ? "border-orange-200 bg-orange-50 text-orange-700" : ""}
          >
            <AlertCircle className="h-4 w-4 mr-2" />
            {unsubmittedCount} Unsubmitted Entries
          </Button>
          <Button 
            onClick={() => setShowInvoiceModal(true)}
            onMouseEnter={() => preload('invoice-generator', preloadInvoiceGenerator)}
          >
            <FileText className="h-4 w-4 mr-2" />
            Generate Invoice
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">This Week</p>
                <p className="text-2xl font-bold">{billingStats.weeklyHours}h</p>
              </div>
              <Clock className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Billable</p>
                <p className="text-2xl font-bold">{billingStats.billableHours}h</p>
              </div>
              <DollarSign className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Outstanding</p>
                <p className="text-2xl font-bold">${(billingStats.outstanding / 1000).toFixed(1)}K</p>
              </div>
              <FileText className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Collection Rate</p>
                <p className="text-2xl font-bold">{billingStats.collectionRate}%</p>
              </div>
              <BarChart3 className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue={defaultTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="time-entry">Time Entry</TabsTrigger>
          <TabsTrigger value="review">Review & Submit</TabsTrigger>
          <TabsTrigger value="invoicing">Invoicing</TabsTrigger>
          <TabsTrigger value="payments">Payments</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="integrations">Integrations</TabsTrigger>
        </TabsList>

        <TabsContent value="time-entry" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <NaturalTimeEntry />
            <WeeklyHeatMap />
          </div>
          <TimeEntryGrid />
        </TabsContent>

        <TabsContent value="review" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Time Review Dashboard</CardTitle>
            </CardHeader>
            <CardContent>
              <p>Time review dashboard with approval workflows coming soon!</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="invoicing" className="space-y-6">
          <InvoicingTab onGenerateInvoice={() => setShowInvoiceModal(true)} />
        </TabsContent>

        <TabsContent value="payments" className="space-y-6">
          <PaymentsTab />
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Financial Analytics</CardTitle>
            </CardHeader>
            <CardContent>
              <p>Comprehensive financial analytics and reporting coming soon!</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="integrations" className="space-y-6">
          <XeroIntegration />
        </TabsContent>
      </Tabs>

      {/* Floating Timer */}
      <FloatingTimer 
        isMinimized={timerMinimized}
        onToggleMinimize={() => setTimerMinimized(!timerMinimized)}
      />

      {/* Component Preloader for critical modals */}
      <ComponentPreloader
        components={[
          {
            key: 'invoice-generator',
            importFn: preloadInvoiceGenerator,
            priority: 'high'
          },
          {
            key: 'unsubmitted-entries',
            importFn: preloadUnsubmittedEntries,
            priority: 'medium'
          }
        ]}
      />

      {/* Lazy-loaded Modals */}
      {showUnsubmittedModal && (
        <LazyUnsubmittedEntriesModal 
          open={showUnsubmittedModal}
          onClose={handleUnsubmittedModalClose}
        />
      )}
      {showInvoiceModal && (
        <LazyInvoiceGeneratorModal 
          open={showInvoiceModal}
          onClose={() => setShowInvoiceModal(false)}
        />
      )}
    </div>
  );
};

export default Billing;
