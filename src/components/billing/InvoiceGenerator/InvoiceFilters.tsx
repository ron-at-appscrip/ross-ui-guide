import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface InvoiceFiltersProps {
  clientFilter: string;
  matterFilter: string;
  dateFrom: string;
  dateTo: string;
  clients: string[];
  matters: Array<{ id: string; title: string; clientName: string }>;
  onFilterChange: <K extends 'clientFilter' | 'matterFilter' | 'dateFrom' | 'dateTo'>(
    key: K,
    value: string
  ) => void;
}

/**
 * InvoiceFilters component - Handles filtering of time entries
 * Performance optimizations:
 * - Memoized to prevent unnecessary re-renders
 * - Parent component debounces filter values
 * - Callbacks are stable (from useCallback in parent)
 */
const InvoiceFilters = React.memo<InvoiceFiltersProps>(({
  clientFilter,
  matterFilter,
  dateFrom,
  dateTo,
  clients,
  matters,
  onFilterChange
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Filter Time Entries</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <Label htmlFor="clientFilter">Client</Label>
            <Select 
              value={clientFilter} 
              onValueChange={(value) => onFilterChange('clientFilter', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="All clients" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all-clients">All clients</SelectItem>
                {clients.map(client => (
                  <SelectItem key={client} value={client}>{client}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label htmlFor="matterFilter">Matter</Label>
            <Select 
              value={matterFilter} 
              onValueChange={(value) => onFilterChange('matterFilter', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="All matters" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all-matters">All matters</SelectItem>
                {matters.map(matter => (
                  <SelectItem key={matter.id} value={matter.id}>
                    {matter.title} • {matter.clientName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label htmlFor="dateFrom">From Date</Label>
            <Input
              type="date"
              value={dateFrom}
              onChange={(e) => onFilterChange('dateFrom', e.target.value)}
            />
          </div>
          
          <div>
            <Label htmlFor="dateTo">To Date</Label>
            <Input
              type="date"
              value={dateTo}
              onChange={(e) => onFilterChange('dateTo', e.target.value)}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
});

InvoiceFilters.displayName = 'InvoiceFilters';

export default InvoiceFilters;