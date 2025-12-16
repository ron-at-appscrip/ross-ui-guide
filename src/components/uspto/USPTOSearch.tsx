import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { 
  Search, 
  X, 
  Calendar,
  Filter
} from 'lucide-react';
import { PatentSearchQuery, TrademarkSearchQuery, SearchType } from '@/types/uspto';

interface USPTOSearchProps {
  searchType: SearchType;
  onSearch: (query: PatentSearchQuery | TrademarkSearchQuery) => void;
  isSearching?: boolean;
  showAdvanced?: boolean;
  onToggleAdvanced?: () => void;
}

const USPTOSearch: React.FC<USPTOSearchProps> = ({
  searchType,
  onSearch,
  isSearching = false,
  showAdvanced = false,
  onToggleAdvanced
}) => {
  // Patent search state
  const [patentQuery, setPatentQuery] = useState<PatentSearchQuery>({
    keywords: '',
    inventor: '',
    assignee: '',
    patentNumber: '',
    applicationNumber: '',
    sortBy: 'relevance',
    sortOrder: 'desc',
    limit: 25
  });

  // Trademark search state
  const [trademarkQuery, setTrademarkQuery] = useState<TrademarkSearchQuery>({
    mark: '',
    owner: '',
    serialNumber: '',
    registrationNumber: '',
    sortBy: 'relevance',
    sortOrder: 'desc',
    limit: 25
  });


  const handlePatentSearch = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(patentQuery);
  };

  const handleTrademarkSearch = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(trademarkQuery);
  };

  const clearPatentForm = () => {
    setPatentQuery({
      keywords: '',
      inventor: '',
      assignee: '',
      patentNumber: '',
      applicationNumber: '',
      sortBy: 'relevance',
      sortOrder: 'desc',
      limit: 25
    });
  };

  const clearTrademarkForm = () => {
    setTrademarkQuery({
      mark: '',
      owner: '',
      serialNumber: '',
      registrationNumber: '',
      sortBy: 'relevance',
      sortOrder: 'desc',
      limit: 25
    });
  };


  const renderPatentSearch = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Patent Search</span>
          {onToggleAdvanced && (
            <Button variant="ghost" size="sm" onClick={onToggleAdvanced}>
              <Filter className="h-4 w-4 mr-2" />
              {showAdvanced ? 'Simple' : 'Advanced'}
            </Button>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handlePatentSearch} className="space-y-4">
          {/* Basic Search Fields */}
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="keywords">Keywords</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="keywords"
                  placeholder="Search patents..."
                  value={patentQuery.keywords || ''}
                  onChange={(e) => setPatentQuery({ ...patentQuery, keywords: e.target.value })}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="inventor">Inventor Name</Label>
              <Input
                id="inventor"
                placeholder="Inventor name..."
                value={patentQuery.inventor || ''}
                onChange={(e) => setPatentQuery({ ...patentQuery, inventor: e.target.value })}
              />
            </div>
          </div>


          {/* Advanced Fields */}
          {showAdvanced && (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="assignee">Assignee</Label>
                <Input
                  id="assignee"
                  placeholder="Company or organization..."
                  value={patentQuery.assignee || ''}
                  onChange={(e) => setPatentQuery({ ...patentQuery, assignee: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="patentNumber">Patent Number</Label>
                <Input
                  id="patentNumber"
                  placeholder="US1234567"
                  value={patentQuery.patentNumber || ''}
                  onChange={(e) => setPatentQuery({ ...patentQuery, patentNumber: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="applicationNumber">Application Number</Label>
                <Input
                  id="applicationNumber"
                  placeholder="16/123456"
                  value={patentQuery.applicationNumber || ''}
                  onChange={(e) => setPatentQuery({ ...patentQuery, applicationNumber: e.target.value })}
                />
              </div>
            </div>
          )}

          {/* Sort Options */}
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="sortBy">Sort By</Label>
              <Select
                value={patentQuery.sortBy || 'relevance'}
                onValueChange={(value) => setPatentQuery({ ...patentQuery, sortBy: value as any })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="relevance">Relevance</SelectItem>
                  <SelectItem value="date">Date</SelectItem>
                  <SelectItem value="patent_number">Patent Number</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="sortOrder">Order</Label>
              <Select
                value={patentQuery.sortOrder || 'desc'}
                onValueChange={(value) => setPatentQuery({ ...patentQuery, sortOrder: value as any })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="desc">Descending</SelectItem>
                  <SelectItem value="asc">Ascending</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="limit">Results Per Page</Label>
              <Select
                value={String(patentQuery.limit || 25)}
                onValueChange={(value) => setPatentQuery({ ...patentQuery, limit: parseInt(value) })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="25">25</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                  <SelectItem value="100">100</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-between">
            <Button type="button" variant="outline" onClick={clearPatentForm}>
              <X className="h-4 w-4 mr-2" />
              Clear
            </Button>
            <Button type="submit" disabled={isSearching}>
              {isSearching ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-background mr-2"></div>
              ) : (
                <Search className="h-4 w-4 mr-2" />
              )}
              Search Patents
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );

  const renderTrademarkSearch = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Trademark Search</span>
          {onToggleAdvanced && (
            <Button variant="ghost" size="sm" onClick={onToggleAdvanced}>
              <Filter className="h-4 w-4 mr-2" />
              {showAdvanced ? 'Simple' : 'Advanced'}
            </Button>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleTrademarkSearch} className="space-y-4">
          {/* Basic Search Fields */}
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="mark">Mark Text</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="mark"
                  placeholder="Search trademarks..."
                  value={trademarkQuery.mark || ''}
                  onChange={(e) => setTrademarkQuery({ ...trademarkQuery, mark: e.target.value })}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="owner">Owner Name</Label>
              <Input
                id="owner"
                placeholder="Company or individual..."
                value={trademarkQuery.owner || ''}
                onChange={(e) => setTrademarkQuery({ ...trademarkQuery, owner: e.target.value })}
              />
            </div>
          </div>


          {/* Advanced Fields */}
          {showAdvanced && (
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="serialNumber">Serial Number <span className="text-blue-600">*</span></Label>
                <Input
                  id="serialNumber"
                  placeholder="90123456 (for TSDR API lookup)"
                  value={trademarkQuery.serialNumber || ''}
                  onChange={(e) => setTrademarkQuery({ ...trademarkQuery, serialNumber: e.target.value })}
                />
                <p className="text-xs text-muted-foreground">Required for real USPTO data retrieval</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="registrationNumber">Registration Number <span className="text-blue-600">*</span></Label>
                <Input
                  id="registrationNumber"
                  placeholder="6789012 (for TSDR API lookup)"
                  value={trademarkQuery.registrationNumber || ''}
                  onChange={(e) => setTrademarkQuery({ ...trademarkQuery, registrationNumber: e.target.value })}
                />
                <p className="text-xs text-muted-foreground">Alternative to serial number for registered marks</p>
              </div>
            </div>
          )}

          {/* Sort Options */}
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="tmSortBy">Sort By</Label>
              <Select
                value={trademarkQuery.sortBy || 'relevance'}
                onValueChange={(value) => setTrademarkQuery({ ...trademarkQuery, sortBy: value as any })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="relevance">Relevance</SelectItem>
                  <SelectItem value="date">Date</SelectItem>
                  <SelectItem value="serial_number">Serial Number</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="tmSortOrder">Order</Label>
              <Select
                value={trademarkQuery.sortOrder || 'desc'}
                onValueChange={(value) => setTrademarkQuery({ ...trademarkQuery, sortOrder: value as any })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="desc">Descending</SelectItem>
                  <SelectItem value="asc">Ascending</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="tmLimit">Results Per Page</Label>
              <Select
                value={String(trademarkQuery.limit || 25)}
                onValueChange={(value) => setTrademarkQuery({ ...trademarkQuery, limit: parseInt(value) })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="25">25</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                  <SelectItem value="100">100</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-between">
            <Button type="button" variant="outline" onClick={clearTrademarkForm}>
              <X className="h-4 w-4 mr-2" />
              Clear
            </Button>
            <Button type="submit" disabled={isSearching}>
              {isSearching ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-background mr-2"></div>
              ) : (
                <Search className="h-4 w-4 mr-2" />
              )}
              Search Trademarks
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );

  return searchType === 'patents' ? renderPatentSearch() : renderTrademarkSearch();
};

export default USPTOSearch;