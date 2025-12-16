import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

interface BillingCardSkeletonProps {
  showHeader?: boolean;
  showStats?: boolean;
  rows?: number;
  compact?: boolean;
}

/**
 * Generic skeleton loader for billing-related cards
 * Can be used for various billing components that follow card patterns
 */
export const BillingCardSkeleton = React.memo<BillingCardSkeletonProps>(({ 
  showHeader = true,
  showStats = false,
  rows = 3,
  compact = false 
}) => {
  return (
    <Card>
      {showHeader && (
        <CardHeader className="animate-pulse">
          <div className="flex items-center justify-between">
            <div className="h-6 bg-muted rounded w-32"></div>
            <div className="h-8 bg-muted rounded w-20"></div>
          </div>
        </CardHeader>
      )}
      
      <CardContent className={`animate-pulse ${compact ? 'p-4' : ''}`}>
        {showStats && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="text-center p-3 bg-muted/50 rounded-lg">
                <div className="h-8 bg-muted rounded w-16 mx-auto mb-2"></div>
                <div className="h-4 bg-muted/60 rounded w-20 mx-auto"></div>
              </div>
            ))}
          </div>
        )}
        
        <div className="space-y-3">
          {Array.from({ length: rows }).map((_, index) => (
            <div key={index} className={`flex justify-between items-center ${compact ? 'p-2' : 'p-3'} border rounded-lg`}>
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-muted rounded w-64"></div>
                <div className="h-3 bg-muted/60 rounded w-40"></div>
              </div>
              <div className="text-right space-y-1">
                <div className="h-4 bg-muted rounded w-16"></div>
                <div className="h-3 bg-muted/60 rounded w-12"></div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
});

BillingCardSkeleton.displayName = 'BillingCardSkeleton';

/**
 * Skeleton for billing summary cards (used in dashboards)
 */
export const BillingSummaryCardSkeleton = React.memo(() => {
  return (
    <Card>
      <CardContent className="animate-pulse p-6">
        <div className="flex items-center space-x-2 mb-2">
          <div className="h-4 w-4 bg-muted rounded"></div>
          <div className="h-4 bg-muted rounded w-20"></div>
        </div>
        <div className="h-8 bg-muted rounded w-16 mb-1"></div>
        <div className="h-3 bg-muted/60 rounded w-24"></div>
      </CardContent>
    </Card>
  );
});

BillingSummaryCardSkeleton.displayName = 'BillingSummaryCardSkeleton';

/**
 * Skeleton for form inputs in billing components
 */
export const BillingFormSkeleton = React.memo<{ fields?: number }>(({ fields = 4 }) => {
  return (
    <div className="animate-pulse space-y-4">
      {Array.from({ length: fields }).map((_, index) => (
        <div key={index} className="space-y-2">
          <div className="h-4 bg-muted rounded w-24"></div>
          <div className="h-10 bg-muted rounded w-full"></div>
        </div>
      ))}
    </div>
  );
});

BillingFormSkeleton.displayName = 'BillingFormSkeleton';

/**
 * Skeleton for billing list items (time entries, invoices, etc.)
 */
export const BillingListItemSkeleton = React.memo<{ items?: number }>(({ items = 5 }) => {
  return (
    <div className="animate-pulse space-y-2">
      {Array.from({ length: items }).map((_, index) => (
        <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
          <div className="flex items-center space-x-3">
            <div className="h-4 w-4 bg-muted rounded"></div>
            <div className="space-y-1">
              <div className="h-4 bg-muted rounded w-48"></div>
              <div className="h-3 bg-muted/60 rounded w-32"></div>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <div className="h-6 bg-muted/60 rounded-full w-16"></div>
            <div className="h-8 w-8 bg-muted rounded"></div>
          </div>
        </div>
      ))}
    </div>
  );
});

BillingListItemSkeleton.displayName = 'BillingListItemSkeleton';