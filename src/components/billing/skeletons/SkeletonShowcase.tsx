import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  TimeEntryTableSkeleton,
  CompactTimeEntryTableSkeleton,
  InvoicePreviewSkeleton,
  EmptyInvoicePreviewSkeleton,
  CompactInvoicePreviewSkeleton,
  BillingDashboardSkeleton,
  WeeklyHeatMapSkeleton,
  CompactBillingDashboardSkeleton,
  FloatingTimerSkeleton,
  MatterSelectSkeleton,
  TimerControlsSkeleton,
  TimerDisplaySkeleton,
  LEDESExportSkeleton,
  LEDESConfigurationSkeleton,
  LEDESExportProgressSkeleton,
  UnsubmittedEntriesSkeleton,
  EmptyUnsubmittedEntriesSkeleton,
  CompactUnsubmittedEntriesSkeleton,
  BillingCardSkeleton,
  BillingSummaryCardSkeleton,
  BillingFormSkeleton,
  BillingListItemSkeleton
} from './index';

/**
 * SkeletonShowcase - Development component to preview all skeleton loaders
 * This component is for development and testing purposes only
 * Use it to verify skeleton component rendering and animations
 */
const SkeletonShowcase: React.FC = () => {
  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Billing Skeleton Components Showcase</h1>
        <p className="text-muted-foreground">
          Preview of all skeleton loading states for billing components. 
          These skeletons provide smooth loading experiences across the application.
        </p>
      </div>

      <Tabs defaultValue="time-entries" className="space-y-6">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="time-entries">Time Entries</TabsTrigger>
          <TabsTrigger value="invoices">Invoices</TabsTrigger>
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="timer">Timer</TabsTrigger>
          <TabsTrigger value="ledes">LEDES</TabsTrigger>
          <TabsTrigger value="generic">Generic</TabsTrigger>
        </TabsList>

        <TabsContent value="time-entries" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Time Entry Table Skeleton</CardTitle>
            </CardHeader>
            <CardContent>
              <TimeEntryTableSkeleton rows={5} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Compact Time Entry Table Skeleton</CardTitle>
            </CardHeader>
            <CardContent>
              <CompactTimeEntryTableSkeleton rows={3} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Unsubmitted Entries Skeleton</CardTitle>
            </CardHeader>
            <CardContent>
              <UnsubmittedEntriesSkeleton entries={4} />
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Empty Unsubmitted Entries</CardTitle>
              </CardHeader>
              <CardContent>
                <EmptyUnsubmittedEntriesSkeleton />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Compact Unsubmitted Entries</CardTitle>
              </CardHeader>
              <CardContent>
                <CompactUnsubmittedEntriesSkeleton entries={3} />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="invoices" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Invoice Preview Skeleton</CardTitle>
            </CardHeader>
            <CardContent>
              <InvoicePreviewSkeleton matterSections={2} entriesPerSection={3} />
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Empty Invoice Preview</CardTitle>
              </CardHeader>
              <CardContent>
                <EmptyInvoicePreviewSkeleton />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Compact Invoice Preview</CardTitle>
              </CardHeader>
              <CardContent>
                <CompactInvoicePreviewSkeleton />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="dashboard" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Full Billing Dashboard Skeleton</CardTitle>
            </CardHeader>
            <CardContent>
              <BillingDashboardSkeleton 
                showHeatMap={true} 
                showRecentEntries={true} 
                showStats={true} 
              />
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Weekly Heat Map</CardTitle>
              </CardHeader>
              <CardContent>
                <WeeklyHeatMapSkeleton />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Compact Dashboard</CardTitle>
              </CardHeader>
              <CardContent>
                <CompactBillingDashboardSkeleton />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="timer" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Floating Timer - Expanded</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="relative h-80">
                  <FloatingTimerSkeleton isMinimized={false} />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Floating Timer - Minimized</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="relative h-20">
                  <FloatingTimerSkeleton isMinimized={true} />
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Matter Select</CardTitle>
              </CardHeader>
              <CardContent>
                <MatterSelectSkeleton />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Timer Controls</CardTitle>
              </CardHeader>
              <CardContent>
                <TimerControlsSkeleton />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Timer Display</CardTitle>
              </CardHeader>
              <CardContent>
                <TimerDisplaySkeleton />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="ledes" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>LEDES Export Modal Skeleton</CardTitle>
            </CardHeader>
            <CardContent>
              <LEDESExportSkeleton />
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>LEDES Configuration</CardTitle>
              </CardHeader>
              <CardContent>
                <LEDESConfigurationSkeleton />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Export Progress</CardTitle>
              </CardHeader>
              <CardContent>
                <LEDESExportProgressSkeleton />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="generic" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Billing Card Skeleton</CardTitle>
              </CardHeader>
              <CardContent>
                <BillingCardSkeleton 
                  showHeader={true} 
                  showStats={true} 
                  rows={4} 
                  compact={false} 
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Compact Billing Card</CardTitle>
              </CardHeader>
              <CardContent>
                <BillingCardSkeleton 
                  showHeader={false} 
                  showStats={false} 
                  rows={3} 
                  compact={true} 
                />
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
            <BillingSummaryCardSkeleton />
            <BillingSummaryCardSkeleton />
            <BillingSummaryCardSkeleton />
            <BillingSummaryCardSkeleton />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Billing Form Skeleton</CardTitle>
              </CardHeader>
              <CardContent>
                <BillingFormSkeleton fields={5} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Billing List Items</CardTitle>
              </CardHeader>
              <CardContent>
                <BillingListItemSkeleton items={4} />
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      <div className="mt-8 p-4 bg-muted/30 rounded-lg">
        <h3 className="text-lg font-semibold mb-2">Development Notes</h3>
        <ul className="text-sm text-muted-foreground space-y-1">
          <li>• All skeletons are optimized with React.memo for performance</li>
          <li>• Animations use animate-pulse for smooth loading effects</li>
          <li>• Color scheme follows Tailwind semantic colors (muted variations)</li>
          <li>• Components are responsive and work across different screen sizes</li>
          <li>• Skeleton dimensions match actual component layouts closely</li>
        </ul>
      </div>
    </div>
  );
};

export default SkeletonShowcase;