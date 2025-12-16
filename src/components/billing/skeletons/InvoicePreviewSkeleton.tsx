import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

interface InvoicePreviewSkeletonProps {
  matterSections?: number;
  entriesPerSection?: number;
}

/**
 * Skeleton loader component for the InvoicePreview
 * Matches the structure with header, matter sections, and totals
 */
export const InvoicePreviewSkeleton = React.memo<InvoicePreviewSkeletonProps>(({ 
  matterSections = 2,
  entriesPerSection = 3 
}) => {
  return (
    <Card>
      <CardHeader className="animate-pulse">
        <div className="space-y-2">
          <div className="h-6 bg-muted rounded w-32"></div>
          <div className="h-4 bg-muted/60 rounded w-48"></div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Matter Sections */}
        {Array.from({ length: matterSections }).map((_, sectionIndex) => (
          <div key={sectionIndex} className="animate-pulse border-b pb-4">
            {/* Matter Header */}
            <div className="mb-3">
              <div className="h-5 bg-muted rounded w-64 mb-2"></div>
              <div className="h-4 bg-muted/60 rounded w-40"></div>
            </div>
            
            {/* Time Entries */}
            <div className="space-y-2">
              {Array.from({ length: entriesPerSection }).map((_, entryIndex) => (
                <div key={entryIndex} className="flex justify-between items-center">
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center space-x-4">
                      <div className="h-4 bg-muted/60 rounded w-20"></div>
                      <div className="h-4 bg-muted rounded w-80"></div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="h-4 bg-muted/60 rounded w-24"></div>
                    <div className="h-4 bg-muted rounded w-16"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
        
        {/* Totals Section */}
        <div className="animate-pulse border-t pt-4 space-y-3">
          <div className="flex justify-between items-center">
            <div className="h-4 bg-muted/60 rounded w-32"></div>
            <div className="h-4 bg-muted rounded w-20"></div>
          </div>
          <div className="flex justify-between items-center">
            <div className="h-4 bg-muted/60 rounded w-20"></div>
            <div className="h-4 bg-muted rounded w-16"></div>
          </div>
          <div className="flex justify-between items-center font-bold text-lg border-t pt-2">
            <div className="h-6 bg-muted rounded w-16"></div>
            <div className="h-6 bg-muted rounded w-24"></div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
});

InvoicePreviewSkeleton.displayName = 'InvoicePreviewSkeleton';

/**
 * Empty state skeleton when no entries are selected
 */
export const EmptyInvoicePreviewSkeleton = React.memo(() => {
  return (
    <Card>
      <CardHeader className="animate-pulse">
        <div className="space-y-2">
          <div className="h-6 bg-muted rounded w-32"></div>
          <div className="h-4 bg-muted/60 rounded w-48"></div>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="animate-pulse text-center py-8">
          <div className="mx-auto mb-4 h-12 w-12 bg-muted/60 rounded-full"></div>
          <div className="h-4 bg-muted rounded w-64 mx-auto"></div>
        </div>
      </CardContent>
    </Card>
  );
});

EmptyInvoicePreviewSkeleton.displayName = 'EmptyInvoicePreviewSkeleton';

/**
 * Compact version for smaller preview areas
 */
export const CompactInvoicePreviewSkeleton = React.memo(() => {
  return (
    <div className="animate-pulse space-y-4 p-4 border rounded-lg">
      {/* Header */}
      <div className="space-y-2">
        <div className="h-5 bg-muted rounded w-32"></div>
        <div className="h-3 bg-muted/60 rounded w-48"></div>
      </div>
      
      {/* Summary Stats */}
      <div className="grid grid-cols-2 gap-4">
        <div className="text-center space-y-1">
          <div className="h-6 bg-muted rounded w-16 mx-auto"></div>
          <div className="h-3 bg-muted/60 rounded w-20 mx-auto"></div>
        </div>
        <div className="text-center space-y-1">
          <div className="h-6 bg-muted rounded w-20 mx-auto"></div>
          <div className="h-3 bg-muted/60 rounded w-16 mx-auto"></div>
        </div>
      </div>
      
      {/* Quick preview */}
      <div className="space-y-2">
        <div className="h-3 bg-muted/60 rounded w-full"></div>
        <div className="h-3 bg-muted/60 rounded w-3/4"></div>
        <div className="h-3 bg-muted/60 rounded w-1/2"></div>
      </div>
    </div>
  );
});

CompactInvoicePreviewSkeleton.displayName = 'CompactInvoicePreviewSkeleton';