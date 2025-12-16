
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { X, Filter } from 'lucide-react';
import { ClientFilters as ClientFiltersType } from '@/types/client';
import MultiSelect from '@/components/wizard/MultiSelect';

interface ClientFiltersProps {
  onApplyFilters: (filters: ClientFiltersType) => void;
}

const industryOptions = [
  { value: 'technology', label: 'Technology' },
  { value: 'healthcare', label: 'Healthcare' },
  { value: 'finance', label: 'Finance' },
  { value: 'real-estate', label: 'Real Estate' },
  { value: 'manufacturing', label: 'Manufacturing' },
  { value: 'retail', label: 'Retail' },
  { value: 'education', label: 'Education' },
  { value: 'non-profit', label: 'Non-Profit' }
];

const tagOptions = [
  { value: 'corporate-law', label: 'Corporate Law' },
  { value: 'family-law', label: 'Family Law' },
  { value: 'ip-law', label: 'IP Law' },
  { value: 'employment-law', label: 'Employment Law' },
  { value: 'real-estate-law', label: 'Real Estate Law' },
  { value: 'litigation', label: 'Litigation' },
  { value: 'contracts', label: 'Contracts' },
  { value: 'compliance', label: 'Compliance' }
];

const ClientFilters: React.FC<ClientFiltersProps> = ({ onApplyFilters }) => {
  const [filters, setFilters] = useState<ClientFiltersType>({});
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [selectedIndustries, setSelectedIndustries] = useState<string[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  const handleStatusChange = (status: string, checked: boolean) => {
    if (checked) {
      setSelectedStatuses([...selectedStatuses, status]);
    } else {
      setSelectedStatuses(selectedStatuses.filter(s => s !== status));
    }
  };

  const handleTypeChange = (type: string, checked: boolean) => {
    if (checked) {
      setSelectedTypes([...selectedTypes, type]);
    } else {
      setSelectedTypes(selectedTypes.filter(t => t !== type));
    }
  };

  const applyFilters = () => {
    const appliedFilters: ClientFiltersType = {
      ...(selectedStatuses.length > 0 && { status: selectedStatuses as any }),
      ...(selectedTypes.length > 0 && { type: selectedTypes as any }),
      ...(selectedIndustries.length > 0 && { industry: selectedIndustries }),
      ...(selectedTags.length > 0 && { tags: selectedTags })
    };
    
    onApplyFilters(appliedFilters);
  };

  const clearFilters = () => {
    setSelectedStatuses([]);
    setSelectedTypes([]);
    setSelectedIndustries([]);
    setSelectedTags([]);
    onApplyFilters({});
  };

  const hasActiveFilters = selectedStatuses.length > 0 || 
                          selectedTypes.length > 0 || 
                          selectedIndustries.length > 0 || 
                          selectedTags.length > 0;

  return (
    <Card className="animate-fade-in">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Filter className="h-5 w-5" />
          Filter Clients
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {/* Status Filter */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Status</Label>
            <div className="space-y-2">
              {['active', 'inactive', 'prospect'].map((status) => (
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
                    {status}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          {/* Type Filter */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Client Type</Label>
            <div className="space-y-2">
              {['corporate', 'individual'].map((type) => (
                <div key={type} className="flex items-center space-x-2">
                  <Checkbox
                    id={`type-${type}`}
                    checked={selectedTypes.includes(type)}
                    onCheckedChange={(checked) => handleTypeChange(type, checked as boolean)}
                  />
                  <Label
                    htmlFor={`type-${type}`}
                    className="text-sm capitalize cursor-pointer"
                  >
                    {type}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          {/* Industry Filter */}
          <div className="space-y-2">
            <MultiSelect
              label="Industry"
              placeholder="Select industries..."
              options={industryOptions}
              value={selectedIndustries}
              onChange={setSelectedIndustries}
            />
          </div>

          {/* Tags Filter */}
          <div className="space-y-2">
            <MultiSelect
              label="Practice Areas"
              placeholder="Select practice areas..."
              options={tagOptions}
              value={selectedTags}
              onChange={setSelectedTags}
            />
          </div>
        </div>

        {/* Active Filters Display */}
        {hasActiveFilters && (
          <div className="space-y-2">
            <Label className="text-sm font-medium">Active Filters</Label>
            <div className="flex flex-wrap gap-2">
              {selectedStatuses.map((status) => (
                <Badge key={`status-${status}`} variant="secondary" className="gap-1">
                  Status: {status}
                  <X
                    className="h-3 w-3 cursor-pointer"
                    onClick={() => handleStatusChange(status, false)}
                  />
                </Badge>
              ))}
              {selectedTypes.map((type) => (
                <Badge key={`type-${type}`} variant="secondary" className="gap-1">
                  Type: {type}
                  <X
                    className="h-3 w-3 cursor-pointer"
                    onClick={() => handleTypeChange(type, false)}
                  />
                </Badge>
              ))}
              {selectedIndustries.map((industry) => (
                <Badge key={`industry-${industry}`} variant="secondary" className="gap-1">
                  {industryOptions.find(opt => opt.value === industry)?.label}
                  <X
                    className="h-3 w-3 cursor-pointer"
                    onClick={() => setSelectedIndustries(selectedIndustries.filter(i => i !== industry))}
                  />
                </Badge>
              ))}
              {selectedTags.map((tag) => (
                <Badge key={`tag-${tag}`} variant="secondary" className="gap-1">
                  {tagOptions.find(opt => opt.value === tag)?.label}
                  <X
                    className="h-3 w-3 cursor-pointer"
                    onClick={() => setSelectedTags(selectedTags.filter(t => t !== tag))}
                  />
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2">
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

export default ClientFilters;
