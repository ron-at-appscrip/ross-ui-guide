import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

interface BillingDashboardSkeletonProps {
  showHeatMap?: boolean;
  showRecentEntries?: boolean;
  showStats?: boolean;
}

/**
 * Skeleton loader component for the billing dashboard
 * Includes stats cards, heat map, and recent entries sections
 */
export const BillingDashboardSkeleton = React.memo<BillingDashboardSkeletonProps>(({ 
  showHeatMap = true,
  showRecentEntries = true,
  showStats = true 
}) => {
  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      {showStats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <Card key={index}>
              <CardContent className="animate-pulse p-6">
                <div className="flex items-center space-x-2 mb-2">
                  <div className="h-4 w-4 bg-muted rounded"></div>
                  <div className="h-4 bg-muted rounded w-20"></div>
                </div>
                <div className="h-8 bg-muted rounded w-16 mb-1"></div>
                <div className="h-3 bg-muted/60 rounded w-24"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Weekly Heat Map Skeleton */}
      {showHeatMap && (
        <Card>
          <CardHeader className="animate-pulse">
            <div className="flex items-center justify-between">
              <div className="h-6 bg-muted rounded w-40"></div>
              <div className="flex space-x-2">
                <div className="h-6 bg-muted/60 rounded-full w-24"></div>
                <div className="h-6 bg-muted rounded-full w-20"></div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="animate-pulse">
            {/* Week Grid */}
            <div className="grid grid-cols-7 gap-2 mb-6">
              {Array.from({ length: 7 }).map((_, index) => (
                <div key={index} className="text-center">
                  <div className="h-4 bg-muted/60 rounded w-8 mx-auto mb-2"></div>
                  <div className="h-20 bg-muted rounded-lg flex flex-col items-center justify-center">
                    <div className="h-6 bg-muted/60 rounded w-8 mb-1"></div>
                    <div className="h-3 bg-muted/60 rounded w-12"></div>
                  </div>
                  <div className="h-3 bg-muted/60 rounded w-4 mx-auto mt-1"></div>
                </div>
              ))}
            </div>

            {/* Summary Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {Array.from({ length: 3 }).map((_, index) => (
                <div key={index} className="text-center p-3 bg-muted/50 rounded-lg">
                  <div className="h-8 bg-muted rounded w-16 mx-auto mb-2"></div>
                  <div className="h-4 bg-muted/60 rounded w-20 mx-auto"></div>
                </div>
              ))}
            </div>

            {/* Legend */}
            <div className="mt-4 flex items-center justify-between">
              <div className="h-3 bg-muted/60 rounded w-12"></div>
              <div className="flex items-center space-x-2">
                {Array.from({ length: 5 }).map((_, index) => (
                  <div key={index} className="flex items-center space-x-1">
                    <div className="w-3 h-3 bg-muted rounded"></div>
                    <div className="h-3 bg-muted/60 rounded w-8"></div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Entries */}
      {showRecentEntries && (
        <Card>
          <CardHeader className="animate-pulse">
            <div className="flex items-center justify-between">
              <div className="h-6 bg-muted rounded w-32"></div>
              <div className="h-8 bg-muted rounded w-20"></div>
            </div>
          </CardHeader>
          <CardContent className="animate-pulse space-y-4">
            {Array.from({ length: 5 }).map((_, index) => (
              <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex-1 space-y-2">
                  <div className="flex items-center space-x-4">
                    <div className="h-4 bg-muted/60 rounded w-20"></div>
                    <div className="h-4 bg-muted rounded w-48"></div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="h-3 bg-muted/60 rounded w-24"></div>
                    <div className="h-3 bg-muted/60 rounded w-32"></div>
                  </div>
                </div>
                <div className="text-right space-y-1">
                  <div className="h-4 bg-muted rounded w-16"></div>
                  <div className="h-3 bg-muted/60 rounded w-12"></div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
});

BillingDashboardSkeleton.displayName = 'BillingDashboardSkeleton';

/**
 * Compact version for smaller dashboard areas
 */
export const CompactBillingDashboardSkeleton = React.memo(() => {
  return (
    <div className="animate-pulse space-y-4">
      {/* Quick Stats */}
      <div className="grid grid-cols-2 gap-4">
        <div className="p-4 border rounded-lg">
          <div className="h-6 bg-muted rounded w-16 mb-2"></div>
          <div className="h-3 bg-muted/60 rounded w-20"></div>
        </div>
        <div className="p-4 border rounded-lg">
          <div className="h-6 bg-muted rounded w-20 mb-2"></div>
          <div className="h-3 bg-muted/60 rounded w-16"></div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="space-y-3">
        <div className="h-5 bg-muted rounded w-32"></div>
        {Array.from({ length: 3 }).map((_, index) => (
          <div key={index} className="flex justify-between items-center p-3 border rounded">
            <div className="space-y-1">
              <div className="h-4 bg-muted rounded w-40"></div>
              <div className="h-3 bg-muted/60 rounded w-24"></div>
            </div>
            <div className="h-4 bg-muted rounded w-16"></div>
          </div>
        ))}
      </div>
    </div>
  );
});

CompactBillingDashboardSkeleton.displayName = 'CompactBillingDashboardSkeleton';

/**
 * Skeleton specifically for the weekly heat map component
 */
export const WeeklyHeatMapSkeleton = React.memo(() => {
  return (
    <Card>
      <CardHeader className="animate-pulse">
        <div className="flex items-center justify-between">
          <div className="h-6 bg-muted rounded w-40"></div>
          <div className="flex space-x-2">
            <div className="h-6 bg-muted/60 rounded-full w-24"></div>
            <div className="h-6 bg-muted rounded-full w-20"></div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="animate-pulse">
        {/* Week Grid */}
        <div className="grid grid-cols-7 gap-2 mb-6">
          {Array.from({ length: 7 }).map((_, index) => (
            <div key={index} className="text-center">
              <div className="h-4 bg-muted/60 rounded w-8 mx-auto mb-2"></div>
              <div className="h-20 bg-muted rounded-lg"></div>
              <div className="h-3 bg-muted/60 rounded w-4 mx-auto mt-1"></div>
            </div>
          ))}
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="text-center p-3 bg-muted/50 rounded-lg">
              <div className="h-8 bg-muted rounded w-16 mx-auto mb-2"></div>
              <div className="h-4 bg-muted/60 rounded w-20 mx-auto"></div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
});

WeeklyHeatMapSkeleton.displayName = 'WeeklyHeatMapSkeleton';