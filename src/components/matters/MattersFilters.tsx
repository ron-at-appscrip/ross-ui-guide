
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { X, Filter } from 'lucide-react';
import { MatterFilters as MatterFiltersType } from '@/types/matter';
import MultiSelect from '@/components/wizard/MultiSelect';

interface MattersFiltersProps {
  onApplyFilters: (filters: MatterFiltersType) => void;
}

const practiceAreaOptions = [
  { value: 'Contract Law', label: 'Contract Law' },
  { value: 'Employment Law', label: 'Employment Law' },
  { value: 'Intellectual Property', label: 'Intellectual Property' },
  { value: 'Corporate Law', label: 'Corporate Law' },
  { value: 'Real Estate Law', label: 'Real Estate Law' },
  { value: 'Family Law', label: 'Family Law' },
  { value: 'Criminal Law', label: 'Criminal Law' },
  { value: 'Immigration Law', label: 'Immigration Law' }
];

const attorneyOptions = [
  { value: 'Sarah Johnson', label: 'Sarah Johnson' },
  { value: 'Michael Chen', label: 'Michael Chen' },
  { value: 'David Wilson', label: 'David Wilson' },
  { value: 'Lisa Park', label: 'Lisa Park' },
  { value: 'Jennifer Brown', label: 'Jennifer Brown' }
];

const MattersFilters: React.FC<MattersFiltersProps> = ({ onApplyFilters }) => {
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);
  const [selectedPriorities, setSelectedPriorities] = useState<string[]>([]);
  const [selectedPracticeAreas, setSelectedPracticeAreas] = useState<string[]>([]);
  const [selectedAttorneys, setSelectedAttorneys] = useState<string[]>([]);
  const [dateRange, setDateRange] = useState({ start: '', end: '' });

  const handleStatusChange = (status: string, checked: boolean) => {
    if (checked) {
      setSelectedStatuses([...selectedStatuses, status]);
    } else {
      setSelectedStatuses(selectedStatuses.filter(s => s !== status));
    }
  };

  const handlePriorityChange = (priority: string, checked: boolean) => {
    if (checked) {
      setSelectedPriorities([...selectedPriorities, priority]);
    } else {
      setSelectedPriorities(selectedPriorities.filter(p => p !== priority));
    }
  };

  const applyFilters = () => {
    const appliedFilters: MatterFiltersType = {
      ...(selectedStatuses.length > 0 && { status: selectedStatuses as any }),
      ...(selectedPriorities.length > 0 && { priority: selectedPriorities as any }),
      ...(selectedPracticeAreas.length > 0 && { practiceArea: selectedPracticeAreas }),
      ...(selectedAttorneys.length > 0 && { responsibleAttorney: selectedAttorneys }),
      ...(dateRange.start && dateRange.end && { dateRange })
    };
    
    onApplyFilters(appliedFilters);
  };

  const clearFilters = () => {
    setSelectedStatuses([]);
    setSelectedPriorities([]);
    setSelectedPracticeAreas([]);
    setSelectedAttorneys([]);
    setDateRange({ start: '', end: '' });
    onApplyFilters({});
  };

  const hasActiveFilters = selectedStatuses.length > 0 || 
                          selectedPriorities.length > 0 || 
                          selectedPracticeAreas.length > 0 || 
                          selectedAttorneys.length > 0 ||
                          (dateRange.start && dateRange.end);

  return (
    <Card className="border rounded-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg font-semibold">
          <Filter className="h-5 w-5" />
          Filter Matters
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-5">
          {/* Status Filter */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Status</Label>
            <div className="space-y-2">
              {['active', 'closed', 'pending', 'on_hold'].map((status) => (
                <div key={status} className="flex items-center space-x-2">
                  <Checkbox
                    id={`status-${status}`}
                    checked={selectedStatuses.includes(status)}
                    onCheckedChange={(checked) => handleStatusChange(status, checked as boolean)}
                  />
                  <Label
                    htmlFor={`status-${status}`}
                    className="text-sm capitalize cursor-pointer"
                  >
                    {status.replace('_', ' ')}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          {/* Priority Filter */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Priority</Label>
            <div className="space-y-2">
              {['low', 'medium', 'high', 'urgent'].map((priority) => (
                <div key={priority} className="flex items-center space-x-2">
                  <Checkbox
                    id={`priority-${priority}`}
                    checked={selectedPriorities.includes(priority)}
                    onCheckedChange={(checked) => handlePriorityChange(priority, checked as boolean)}
                  />
                  <Label
                    htmlFor={`priority-${priority}`}
                    className="text-sm capitalize cursor-pointer"
                  >
                    {priority}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          {/* Practice Area Filter */}
          <div className="space-y-3">
            <MultiSelect
              label="Practice Area"
              placeholder="Select practice areas..."
              options={practiceAreaOptions}
              value={selectedPracticeAreas}
              onChange={setSelectedPracticeAreas}
            />
          </div>

          {/* Attorney Filter */}
          <div className="space-y-3">
            <MultiSelect
              label="Attorney"
              placeholder="Select attorneys..."
              options={attorneyOptions}
              value={selectedAttorneys}
              onChange={setSelectedAttorneys}
            />
          </div>

          {/* Date Range Filter */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Date Range</Label>
            <div className="space-y-2">
              <Input
                type="date"
                placeholder="Start date"
                value={dateRange.start}
                onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                className="bg-white"
              />
              <Input
                type="date"
                placeholder="End date"
                value={dateRange.end}
                onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                className="bg-white"
              />
            </div>
          </div>
        </div>

        {/* Active Filters Display */}
        {hasActiveFilters && (
          <div className="space-y-3">
            <Label className="text-sm font-medium">Active Filters</Label>
            <div className="flex flex-wrap gap-2">
              {selectedStatuses.map((status) => (
                <Badge key={`status-${status}`} variant="secondary" className="gap-1">
                  Status: {status.replace('_', ' ')}
                  <X
                    className="h-3 w-3 cursor-pointer hover:text-destructive"
                    onClick={() => handleStatusChange(status, false)}
                  />
                </Badge>
              ))}
              {selectedPriorities.map((priority) => (
                <Badge key={`priority-${priority}`} variant="secondary" className="gap-1">
                  Priority: {priority}
                  <X
                    className="h-3 w-3 cursor-pointer hover:text-destructive"
                    onClick={() => handlePriorityChange(priority, false)}
                  />
                </Badge>
              ))}
              {selectedPracticeAreas.map((area) => (
                <Badge key={`area-${area}`} variant="secondary" className="gap-1">
                  {area}
                  <X
                    className="h-3 w-3 cursor-pointer hover:text-destructive"
                    onClick={() => setSelectedPracticeAreas(selectedPracticeAreas.filter(a => a !== area))}
                  />
                </Badge>
              ))}
              {selectedAttorneys.map((attorney) => (
                <Badge key={`attorney-${attorney}`} variant="secondary" className="gap-1">
                  {attorney}
                  <X
                    className="h-3 w-3 cursor-pointer hover:text-destructive"
                    onClick={() => setSelectedAttorneys(selectedAttorneys.filter(a => a !== attorney))}
                  />
                </Badge>
              ))}
              {dateRange.start && dateRange.end && (
                <Badge variant="secondary" className="gap-1">
                  {dateRange.start} to {dateRange.end}
                  <X
                    className="h-3 w-3 cursor-pointer hover:text-destructive"
                    onClick={() => setDateRange({ start: '', end: '' })}
                  />
                </Badge>
              )}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3 pt-2">
          <Button onClick={applyFilters}>
            Apply Filters
          </Button>
          {hasActiveFilters && (
            <Button variant="outline" onClick={clearFilters}>
              Clear All
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default MattersFilters;
