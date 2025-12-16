import React, { useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Calendar, Briefcase, FileText } from 'lucide-react';
import { TimeEntry } from '@/types/billing';
import { CompactTimeEntryTableSkeleton } from '../skeletons';

interface InvoiceLineItemsProps {
  entries: TimeEntry[];
  selectedEntries: Set<string>;
  isLoading: boolean;
  totalHours: number;
  subtotal: number;
  onSelectAll: (checked: boolean) => void;
  onSelectEntry: (entryId: string, checked: boolean) => void;
}

/**
 * Individual time entry component - Memoized to prevent re-renders
 */
const TimeEntryItem = React.memo<{
  entry: TimeEntry;
  isSelected: boolean;
  onToggle: (checked: boolean) => void;
}>(({ entry, isSelected, onToggle }) => {
  return (
    <div className="flex items-center space-x-3 p-3 border rounded-lg">
      <Checkbox
        checked={isSelected}
        onCheckedChange={onToggle}
      />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-medium text-sm">{entry.description}</span>
          <Badge variant="outline" className="text-xs">
            {entry.hours}h
          </Badge>
          <Badge variant="default" className="text-xs">
            ${entry.amount.toFixed(2)}
          </Badge>
        </div>
        <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
          <Calendar className="h-3 w-3" />
          {new Date(entry.date).toLocaleDateString()}
          <Briefcase className="h-3 w-3 ml-2" />
          {entry.matterTitle} • {entry.clientName}
        </div>
      </div>
    </div>
  );
});

TimeEntryItem.displayName = 'TimeEntryItem';

/**
 * InvoiceLineItems component - Displays selectable time entries
 * Performance optimizations:
 * - Component is memoized
 * - Individual entries are memoized
 * - Callbacks are optimized with useCallback
 * - Virtual scrolling could be added for very large lists
 */
const InvoiceLineItems = React.memo<InvoiceLineItemsProps>(({
  entries,
  selectedEntries,
  isLoading,
  totalHours,
  subtotal,
  onSelectAll,
  onSelectEntry
}) => {
  // Memoize the check for all selected
  const allSelected = entries.length > 0 && selectedEntries.size === entries.length;
  
  // Optimize callback for individual entry selection
  const handleEntryToggle = useCallback((entryId: string) => {
    return (checked: boolean) => onSelectEntry(entryId, checked);
  }, [onSelectEntry]);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Billable Time Entries</CardTitle>
          <div className="flex items-center gap-2">
            <Checkbox
              checked={allSelected}
              onCheckedChange={onSelectAll}
            />
            <Label>Select All ({entries.length})</Label>
          </div>
        </div>
        {selectedEntries.size > 0 && (
          <div className="text-sm text-muted-foreground">
            {selectedEntries.size} entries selected • {totalHours.toFixed(2)} hours • ${subtotal.toFixed(2)}
          </div>
        )}
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <CompactTimeEntryTableSkeleton rows={6} />
        ) : entries.length === 0 ? (
          <div className="text-center py-8">
            <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No billable entries found with current filters.</p>
          </div>
        ) : (
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {entries.map(entry => (
              <TimeEntryItem
                key={entry.id}
                entry={entry}
                isSelected={selectedEntries.has(entry.id)}
                onToggle={handleEntryToggle(entry.id)}
              />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
});

InvoiceLineItems.displayName = 'InvoiceLineItems';

export default InvoiceLineItems;