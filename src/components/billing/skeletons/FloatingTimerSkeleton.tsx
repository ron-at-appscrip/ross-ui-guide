import React from 'react';
import { Card } from '@/components/ui/card';

interface FloatingTimerSkeletonProps {
  isMinimized?: boolean;
}

/**
 * Skeleton loader component for the FloatingTimer
 * Matches both minimized and expanded states
 */
export const FloatingTimerSkeleton = React.memo<FloatingTimerSkeletonProps>(({ 
  isMinimized = false 
}) => {
  if (isMinimized) {
    return (
      <Card className="fixed bottom-4 right-4 p-3 bg-white shadow-lg border z-50">
        <div className="animate-pulse flex items-center space-x-2">
          <div className="h-4 w-4 bg-muted rounded"></div>
          <div className="h-4 bg-muted rounded w-16"></div>
          <div className="w-2 h-2 bg-muted/60 rounded-full"></div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="fixed bottom-4 right-4 p-4 bg-white shadow-lg border z-50 w-80">
      <div className="animate-pulse">
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <div className="h-5 w-5 bg-muted rounded"></div>
            <div className="h-5 bg-muted rounded w-12"></div>
          </div>
          <div className="h-8 w-8 bg-muted rounded"></div>
        </div>

        {/* Timer Display */}
        <div className="text-center mb-4 space-y-2">
          <div className="h-12 bg-muted rounded w-32 mx-auto"></div>
          <div className="flex items-center justify-center space-x-1">
            <div className="w-2 h-2 bg-muted/60 rounded-full"></div>
            <div className="h-3 bg-muted/60 rounded w-16"></div>
          </div>
        </div>

        {/* Input Fields */}
        <div className="space-y-3">
          {/* Description Input */}
          <div className="h-10 bg-muted rounded w-full"></div>
          
          {/* Matter Select */}
          <div className="h-10 bg-muted rounded w-full"></div>

          {/* Action Buttons */}
          <div className="flex space-x-2">
            <div className="h-10 bg-muted rounded flex-1"></div>
            <div className="h-10 bg-muted rounded w-24"></div>
          </div>
        </div>
      </div>
    </Card>
  );
});

FloatingTimerSkeleton.displayName = 'FloatingTimerSkeleton';

/**
 * Skeleton for the matter select dropdown when loading
 */
export const MatterSelectSkeleton = React.memo(() => {
  return (
    <div className="animate-pulse">
      <div className="h-10 bg-muted rounded w-full flex items-center px-3">
        <div className="h-4 bg-muted/60 rounded w-32"></div>
      </div>
    </div>
  );
});

MatterSelectSkeleton.displayName = 'MatterSelectSkeleton';

/**
 * Inline skeleton for timer controls only
 */
export const TimerControlsSkeleton = React.memo(() => {
  return (
    <div className="animate-pulse flex space-x-2">
      <div className="h-10 bg-muted rounded flex-1 flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <div className="h-4 w-4 bg-muted/60 rounded"></div>
          <div className="h-4 bg-muted/60 rounded w-12"></div>
        </div>
      </div>
      <div className="h-10 bg-muted rounded w-24 flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <div className="h-4 w-4 bg-muted/60 rounded"></div>
          <div className="h-4 bg-muted/60 rounded w-8"></div>
        </div>
      </div>
    </div>
  );
});

TimerControlsSkeleton.displayName = 'TimerControlsSkeleton';

/**
 * Skeleton for timer session display
 */
export const TimerDisplaySkeleton = React.memo(() => {
  return (
    <div className="animate-pulse text-center space-y-2">
      <div className="h-12 bg-muted rounded w-32 mx-auto"></div>
      <div className="flex items-center justify-center space-x-1">
        <div className="w-2 h-2 bg-muted/60 rounded-full"></div>
        <div className="h-3 bg-muted/60 rounded w-16"></div>
      </div>
    </div>
  );
});

TimerDisplaySkeleton.displayName = 'TimerDisplaySkeleton';