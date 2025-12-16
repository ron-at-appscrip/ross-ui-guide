
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Upload, Search, Filter, Grid, List, SortAsc } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface DocumentsHeaderProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  viewMode: 'grid' | 'list';
  onViewModeChange: (mode: 'grid' | 'list') => void;
  onUploadClick: () => void;
  onFilterClick: () => void;
  sortBy: string;
  onSortChange: (sort: string) => void;
}

const DocumentsHeader = ({
  searchQuery,
  onSearchChange,
  viewMode,
  onViewModeChange,
  onUploadClick,
  onFilterClick,
  sortBy,
  onSortChange
}: DocumentsHeaderProps) => {
  return (
    <div className="flex flex-col gap-4 mb-4 sm:mb-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Document Library</h1>
          <p className="text-sm sm:text-base text-muted-foreground">Manage and organize your legal documents</p>
        </div>
        <Button onClick={onUploadClick} className="w-full sm:w-auto">
          <Upload className="w-4 h-4 mr-2" />
          Upload Document
        </Button>
      </div>
      
      <div className="flex flex-col gap-3 sm:gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Search documents..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10 text-sm"
          />
        </div>
        
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={onFilterClick} className="flex-1 sm:flex-none">
            <Filter className="w-4 h-4 mr-2" />
            <span className="hidden sm:inline">Filters</span>
            <span className="sm:hidden">Filter</span>
          </Button>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="flex-1 sm:flex-none">
                <SortAsc className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">Sort</span>
                <span className="sm:hidden">Sort</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => onSortChange('name')}>
                Name
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onSortChange('date')}>
                Date Modified
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onSortChange('size')}>
                File Size
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onSortChange('type')}>
                File Type
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          
          <div className="flex border rounded-md">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => onViewModeChange('grid')}
              className="rounded-r-none px-2 sm:px-3"
            >
              <Grid className="w-4 h-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => onViewModeChange('list')}
              className="rounded-l-none px-2 sm:px-3"
            >
              <List className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DocumentsHeader;
