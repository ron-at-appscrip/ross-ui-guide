import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Filter, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { DocumentCategory, DocumentSubtype } from '@/types/document';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

interface FilterOptions {
  category?: DocumentCategory;
  subtype?: DocumentSubtype;
  dateRange?: {
    from?: Date;
    to?: Date;
  };
  starred?: boolean;
  shared?: boolean;
  hasAiAnalysis?: boolean;
  tags?: string[];
  size?: {
    min?: number;
    max?: number;
  };
  uploadedBy?: string;
}

interface FilterModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onApplyFilters: (filters: FilterOptions) => void;
  currentFilters?: FilterOptions;
}

const FilterModal: React.FC<FilterModalProps> = ({
  open,
  onOpenChange,
  onApplyFilters,
  currentFilters = {}
}) => {
  const [filters, setFilters] = useState<FilterOptions>(currentFilters);
  const [tagInput, setTagInput] = useState('');
  const { toast } = useToast();

  const handleApplyFilters = () => {
    onApplyFilters(filters);
    toast({
      title: 'Filters Applied',
      description: 'Documents have been filtered according to your criteria'
    });
    onOpenChange(false);
  };

  const handleClearFilters = () => {
    setFilters({});
    onApplyFilters({});
    toast({
      title: 'Filters Cleared',
      description: 'All filters have been removed'
    });
    onOpenChange(false);
  };

  const addTag = () => {
    if (tagInput.trim() && !filters.tags?.includes(tagInput.trim())) {
      setFilters(prev => ({
        ...prev,
        tags: [...(prev.tags || []), tagInput.trim()]
      }));
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFilters(prev => ({
      ...prev,
      tags: prev.tags?.filter(tag => tag !== tagToRemove)
    }));
  };

  const formatCategoryName = (category: DocumentCategory) => {
    return category.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Filter className="h-5 w-5" />
            <span>Filter Documents</span>
          </DialogTitle>
          <DialogDescription>
            Apply filters to find specific documents in your collection
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Category Filter */}
          <div className="space-y-2">
            <Label>Category</Label>
            <Select
              value={filters.category || 'all'}
              onValueChange={(value) => setFilters(prev => ({ 
                ...prev, 
                category: value === 'all' ? undefined : value as DocumentCategory 
              }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="contracts_agreements">Contracts & Agreements</SelectItem>
                <SelectItem value="corporate_formation">Corporate Formation</SelectItem>
                <SelectItem value="employment_docs">Employment Documents</SelectItem>
                <SelectItem value="pleadings">Pleadings</SelectItem>
                <SelectItem value="motions">Motions</SelectItem>
                <SelectItem value="real_estate_purchase">Real Estate</SelectItem>
                <SelectItem value="wills_trusts">Wills & Trusts</SelectItem>
                <SelectItem value="patents">Intellectual Property</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Document Status */}
          <div className="space-y-3">
            <Label>Document Status</Label>
            <div className="flex flex-wrap gap-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="starred"
                  checked={filters.starred || false}
                  onCheckedChange={(checked) => setFilters(prev => ({ 
                    ...prev, 
                    starred: checked as boolean 
                  }))}
                />
                <Label htmlFor="starred" className="text-sm">Starred Documents</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="shared"
                  checked={filters.shared || false}
                  onCheckedChange={(checked) => setFilters(prev => ({ 
                    ...prev, 
                    shared: checked as boolean 
                  }))}
                />
                <Label htmlFor="shared" className="text-sm">Shared Documents</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="ai-analysis"
                  checked={filters.hasAiAnalysis || false}
                  onCheckedChange={(checked) => setFilters(prev => ({ 
                    ...prev, 
                    hasAiAnalysis: checked as boolean 
                  }))}
                />
                <Label htmlFor="ai-analysis" className="text-sm">Has AI Analysis</Label>
              </div>
            </div>
          </div>

          {/* Date Range */}
          <div className="space-y-2">
            <Label>Date Range</Label>
            <div className="flex items-center space-x-2">
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !filters.dateRange?.from && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {filters.dateRange?.from ? (
                      filters.dateRange.to ? (
                        <>
                          {format(filters.dateRange.from, "LLL dd, y")} -{" "}
                          {format(filters.dateRange.to, "LLL dd, y")}
                        </>
                      ) : (
                        format(filters.dateRange.from, "LLL dd, y")
                      )
                    ) : (
                      <span>Pick a date range</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    initialFocus
                    mode="range"
                    defaultMonth={filters.dateRange?.from}
                    selected={filters.dateRange}
                    onSelect={(range) => setFilters(prev => ({ ...prev, dateRange: range }))}
                    numberOfMonths={2}
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          {/* Tags */}
          <div className="space-y-2">
            <Label>Tags</Label>
            <div className="flex items-center space-x-2">
              <Input
                placeholder="Add tag..."
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addTag()}
                className="flex-1"
              />
              <Button size="sm" onClick={addTag}>Add</Button>
            </div>
            {filters.tags && filters.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {filters.tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="flex items-center space-x-1">
                    <span>{tag}</span>
                    <X 
                      className="h-3 w-3 cursor-pointer" 
                      onClick={() => removeTag(tag)}
                    />
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* File Size */}
          <div className="space-y-2">
            <Label>File Size (MB)</Label>
            <div className="flex items-center space-x-2">
              <Input
                type="number"
                placeholder="Min"
                value={filters.size?.min || ''}
                onChange={(e) => setFilters(prev => ({ 
                  ...prev, 
                  size: { ...prev.size, min: parseFloat(e.target.value) || undefined }
                }))}
                className="w-20"
              />
              <span className="text-muted-foreground">-</span>
              <Input
                type="number"
                placeholder="Max"
                value={filters.size?.max || ''}
                onChange={(e) => setFilters(prev => ({ 
                  ...prev, 
                  size: { ...prev.size, max: parseFloat(e.target.value) || undefined }
                }))}
                className="w-20"
              />
            </div>
          </div>

          {/* Uploaded By */}
          <div className="space-y-2">
            <Label>Uploaded By</Label>
            <Input
              placeholder="User name or email"
              value={filters.uploadedBy || ''}
              onChange={(e) => setFilters(prev => ({ 
                ...prev, 
                uploadedBy: e.target.value || undefined 
              }))}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClearFilters}>
            Clear All
          </Button>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleApplyFilters}>
            Apply Filters
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default FilterModal;