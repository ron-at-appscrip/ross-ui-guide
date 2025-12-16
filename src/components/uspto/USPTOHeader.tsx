import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Filter, 
  Bookmark, 
  Download, 
  Search, 
  BarChart3,
  FileText,
  Shield,
  Clock
} from 'lucide-react';

interface USPTOHeaderProps {
  currentTab: 'patents' | 'trademarks' | 'saved' | 'portfolio';
  onTabChange: (tab: 'patents' | 'trademarks' | 'saved' | 'portfolio') => void;
  onToggleFilters: () => void;
  onSaveSearch: () => void;
  onExportResults: () => void;
  searchCount?: number;
  isSearching?: boolean;
}

const USPTOHeader: React.FC<USPTOHeaderProps> = ({
  currentTab,
  onTabChange,
  onToggleFilters,
  onSaveSearch,
  onExportResults,
  searchCount,
  isSearching = false
}) => {
  return (
    <div className="space-y-6">
      {/* Main Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold">USPTO Research</h1>
          <p className="text-muted-foreground">
            Search patents and trademarks from the USPTO database
          </p>
        </div>
        
        <div className="flex gap-2">
          <Button variant="outline" onClick={onToggleFilters}>
            <Filter className="h-4 w-4 mr-2" />
            Filters
          </Button>
          <Button variant="outline" onClick={onSaveSearch} disabled={!searchCount}>
            <Bookmark className="h-4 w-4 mr-2" />
            Save Search
          </Button>
          <Button variant="outline" onClick={onExportResults} disabled={!searchCount}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex flex-col sm:flex-row gap-4 sm:items-center sm:justify-between">
        <div className="flex space-x-1 rounded-lg bg-muted p-1">
          <button
            onClick={() => onTabChange('patents')}
            className={`
              flex items-center space-x-2 px-3 py-2 text-sm font-medium rounded-md transition-colors
              ${currentTab === 'patents' 
                ? 'bg-background text-foreground shadow-sm' 
                : 'text-muted-foreground hover:text-foreground'
              }
            `}
          >
            <FileText className="h-4 w-4" />
            <span>Patents</span>
          </button>
          
          <button
            onClick={() => onTabChange('trademarks')}
            className={`
              flex items-center space-x-2 px-3 py-2 text-sm font-medium rounded-md transition-colors
              ${currentTab === 'trademarks' 
                ? 'bg-background text-foreground shadow-sm' 
                : 'text-muted-foreground hover:text-foreground'
              }
            `}
          >
            <Shield className="h-4 w-4" />
            <span>Trademarks</span>
          </button>
          
          <button
            onClick={() => onTabChange('saved')}
            className={`
              flex items-center space-x-2 px-3 py-2 text-sm font-medium rounded-md transition-colors
              ${currentTab === 'saved' 
                ? 'bg-background text-foreground shadow-sm' 
                : 'text-muted-foreground hover:text-foreground'
              }
            `}
          >
            <Bookmark className="h-4 w-4" />
            <span>Saved Searches</span>
          </button>
          
          <button
            onClick={() => onTabChange('portfolio')}
            className={`
              flex items-center space-x-2 px-3 py-2 text-sm font-medium rounded-md transition-colors
              ${currentTab === 'portfolio' 
                ? 'bg-background text-foreground shadow-sm' 
                : 'text-muted-foreground hover:text-foreground'
              }
            `}
          >
            <BarChart3 className="h-4 w-4" />
            <span>Portfolio</span>
          </button>
        </div>

        {/* Search Results Info */}
        {searchCount !== undefined && (
          <div className="flex items-center gap-2">
            {isSearching ? (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                <span>Searching...</span>
              </div>
            ) : (
              <Badge variant="secondary" className="text-sm">
                {searchCount.toLocaleString()} results found
              </Badge>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default USPTOHeader;