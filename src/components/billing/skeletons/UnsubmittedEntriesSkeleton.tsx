import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

interface UnsubmittedEntriesSkeletonProps {
  entries?: number;
}

/**
 * Skeleton loader component for the UnsubmittedEntriesModal
 * Matches the table structure with checkboxes and entry details
 */
export const UnsubmittedEntriesSkeleton = React.memo<UnsubmittedEntriesSkeletonProps>(({ 
  entries = 5 
}) => {
  return (
    <div className="space-y-4">
      {/* Summary Section */}
      <div className="animate-pulse bg-muted/50 p-4 rounded-lg">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <div className="h-5 bg-muted rounded w-48"></div>
            <div className="h-4 bg-muted/60 rounded w-64"></div>
          </div>
          <div className="text-right space-y-1">
            <div className="h-4 bg-muted rounded w-32"></div>
            <div className="h-3 bg-muted/60 rounded w-28"></div>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">
                <div className="animate-pulse h-4 w-4 bg-muted rounded"></div>
              </TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Matter</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Hours</TableHead>
              <TableHead>Amount</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.from({ length: entries }).map((_, index) => (
              <TableRow key={index} className="animate-pulse">
                {/* Checkbox */}
                <TableCell>
                  <div className="h-4 w-4 bg-muted rounded"></div>
                </TableCell>
                
                {/* Date */}
                <TableCell>
                  <div className="h-4 bg-muted rounded w-20"></div>
                </TableCell>
                
                {/* Matter */}
                <TableCell>
                  <div className="space-y-2">
                    <div className="flex items-center gap-1">
                      <div className="h-4 bg-muted rounded w-32"></div>
                      <div className="h-3 w-3 bg-muted/60 rounded"></div>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="h-3 w-3 bg-muted/60 rounded"></div>
                      <div className="h-3 bg-muted/60 rounded w-24"></div>
                    </div>
                  </div>
                </TableCell>
                
                {/* Description */}
                <TableCell>
                  <div className="space-y-2">
                    <div className="h-4 bg-muted rounded w-48"></div>
                    <div className="flex gap-1">
                      <div className="h-5 bg-muted/60 rounded-full w-12"></div>
                      <div className="h-5 bg-muted/60 rounded-full w-16"></div>
                    </div>
                  </div>
                </TableCell>
                
                {/* Hours */}
                <TableCell>
                  <div className="space-y-1">
                    <div className="h-4 bg-muted rounded w-12"></div>
                    <div className="h-5 bg-muted/60 rounded-full w-16"></div>
                  </div>
                </TableCell>
                
                {/* Amount */}
                <TableCell>
                  <div className="space-y-1">
                    <div className="h-4 bg-muted rounded w-16"></div>
                    <div className="h-3 bg-muted/60 rounded w-12"></div>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
});

UnsubmittedEntriesSkeleton.displayName = 'UnsubmittedEntriesSkeleton';

/**
 * Empty state skeleton when there are no unsubmitted entries
 */
export const EmptyUnsubmittedEntriesSkeleton = React.memo(() => {
  return (
    <div className="animate-pulse flex items-center justify-center py-12">
      <div className="text-center space-y-4">
        <div className="h-12 w-12 bg-muted rounded-full mx-auto"></div>
        <div className="space-y-2">
          <div className="h-5 bg-muted rounded w-32 mx-auto"></div>
          <div className="h-4 bg-muted/60 rounded w-48 mx-auto"></div>
        </div>
      </div>
    </div>
  );
});

EmptyUnsubmittedEntriesSkeleton.displayName = 'EmptyUnsubmittedEntriesSkeleton';

/**
 * Compact version for smaller modal sizes
 */
export const CompactUnsubmittedEntriesSkeleton = React.memo<UnsubmittedEntriesSkeletonProps>(({ 
  entries = 3 
}) => {
  return (
    <div className="animate-pulse space-y-3">
      {/* Summary */}
      <div className="p-3 bg-muted/50 rounded-lg">
        <div className="flex justify-between items-center">
          <div className="h-4 bg-muted rounded w-40"></div>
          <div className="h-4 bg-muted rounded w-24"></div>
        </div>
      </div>

      {/* Entries List */}
      <div className="space-y-2">
        {Array.from({ length: entries }).map((_, index) => (
          <div key={index} className="flex items-center space-x-3 p-3 border rounded-lg">
            <div className="h-4 w-4 bg-muted rounded"></div>
            <div className="flex-1 space-y-1">
              <div className="h-4 bg-muted rounded w-48"></div>
              <div className="h-3 bg-muted/60 rounded w-32"></div>
            </div>
            <div className="text-right space-y-1">
              <div className="h-4 bg-muted rounded w-16"></div>
              <div className="h-3 bg-muted/60 rounded w-12"></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
});

CompactUnsubmittedEntriesSkeleton.displayName = 'CompactUnsubmittedEntriesSkeleton';