import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

interface TimeEntryTableSkeletonProps {
  rows?: number;
}

/**
 * Skeleton loader component for the TimeEntryTable
 * Matches the structure of the actual table with 8 columns and realistic loading animations
 */
export const TimeEntryTableSkeleton = React.memo<TimeEntryTableSkeletonProps>(({ 
  rows = 5 
}) => {
  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Date</TableHead>
            <TableHead>Matter</TableHead>
            <TableHead>Description</TableHead>
            <TableHead>Hours</TableHead>
            <TableHead>Rate</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {Array.from({ length: rows }).map((_, index) => (
            <TableRow key={index} className="animate-pulse">
              {/* Date */}
              <TableCell>
                <div className="h-4 bg-muted rounded w-20"></div>
              </TableCell>
              
              {/* Matter */}
              <TableCell>
                <div className="space-y-2">
                  <div className="h-4 bg-muted rounded w-32"></div>
                  <div className="h-3 bg-muted/60 rounded w-24"></div>
                </div>
              </TableCell>
              
              {/* Description */}
              <TableCell>
                <div className="space-y-1">
                  <div className="h-4 bg-muted rounded w-48"></div>
                  <div className="h-3 bg-muted/60 rounded w-32"></div>
                </div>
              </TableCell>
              
              {/* Hours */}
              <TableCell>
                <div className="h-4 bg-muted rounded w-12"></div>
              </TableCell>
              
              {/* Rate */}
              <TableCell>
                <div className="h-4 bg-muted rounded w-16"></div>
              </TableCell>
              
              {/* Amount */}
              <TableCell>
                <div className="h-4 bg-muted rounded w-20"></div>
              </TableCell>
              
              {/* Status */}
              <TableCell>
                <div className="h-6 bg-muted rounded-full w-16"></div>
              </TableCell>
              
              {/* Actions */}
              <TableCell>
                <div className="flex space-x-2">
                  <div className="h-8 w-8 bg-muted rounded"></div>
                  <div className="h-8 w-8 bg-muted rounded"></div>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
});

TimeEntryTableSkeleton.displayName = 'TimeEntryTableSkeleton';

/**
 * Alternative compact skeleton for mobile or smaller spaces
 */
export const CompactTimeEntryTableSkeleton = React.memo<TimeEntryTableSkeletonProps>(({ 
  rows = 3 
}) => {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, index) => (
        <div key={index} className="animate-pulse border rounded-lg p-4">
          <div className="flex justify-between items-start mb-3">
            <div className="space-y-2 flex-1">
              <div className="h-4 bg-muted rounded w-48"></div>
              <div className="h-3 bg-muted/60 rounded w-32"></div>
            </div>
            <div className="h-6 bg-muted rounded-full w-16"></div>
          </div>
          
          <div className="flex justify-between items-center">
            <div className="space-y-1">
              <div className="h-3 bg-muted/60 rounded w-20"></div>
              <div className="h-3 bg-muted/60 rounded w-24"></div>
            </div>
            <div className="text-right space-y-1">
              <div className="h-4 bg-muted rounded w-16"></div>
              <div className="h-3 bg-muted/60 rounded w-20"></div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
});

CompactTimeEntryTableSkeleton.displayName = 'CompactTimeEntryTableSkeleton';