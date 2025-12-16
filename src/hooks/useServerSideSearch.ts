import { useState, useEffect, useCallback } from 'react';
import { Client } from '@/types/client';
import ClientService from '@/services/clientService';
import { useToast } from '@/hooks/use-toast';

interface SearchOptions {
  search?: string;
  status?: 'active' | 'inactive' | 'all';
  type?: 'person' | 'company' | 'all';
  sortBy?: 'name' | 'created_at' | 'updated_at';
  sortOrder?: 'asc' | 'desc';
  limit?: number;
}

interface SearchState {
  clients: Client[];
  loading: boolean;
  error: string | null;
  totalCount: number;
  totalPages: number;
  currentPage: number;
  hasMore: boolean;
}

export const useServerSideSearch = (initialOptions: SearchOptions = {}) => {
  const { toast } = useToast();
  const [searchOptions, setSearchOptions] = useState<SearchOptions>({
    search: '',
    status: 'all',
    type: 'all',
    sortBy: 'created_at',
    sortOrder: 'desc',
    limit: 10,
    ...initialOptions
  });

  const [searchState, setSearchState] = useState<SearchState>({
    clients: [],
    loading: true,
    error: null,
    totalCount: 0,
    totalPages: 0,
    currentPage: 1,
    hasMore: false
  });

  const [debouncedSearch, setDebouncedSearch] = useState(searchOptions.search || '');

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchOptions.search || '');
    }, 300);

    return () => clearTimeout(timer);
  }, [searchOptions.search]);

  // Perform search when debounced search or other options change
  const performSearch = useCallback(async (page: number = 1) => {
    setSearchState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const result = await ClientService.getClientsPaginated({
        ...searchOptions,
        search: debouncedSearch,
        page
      });

      setSearchState({
        clients: result.clients,
        loading: false,
        error: null,
        totalCount: result.totalCount,
        totalPages: result.totalPages,
        currentPage: result.page,
        hasMore: result.hasMore
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to search clients';
      
      setSearchState(prev => ({
        ...prev,
        loading: false,
        error: errorMessage
      }));

      toast({
        title: "Search Error",
        description: errorMessage,
        variant: "destructive",
      });
    }
  }, [searchOptions, debouncedSearch, toast]);

  // Perform search when options change
  useEffect(() => {
    performSearch(1);
  }, [performSearch]);

  // Update search options
  const updateSearch = useCallback((newOptions: Partial<SearchOptions>) => {
    setSearchOptions(prev => ({ ...prev, ...newOptions }));
  }, []);

  // Load specific page
  const loadPage = useCallback((page: number) => {
    performSearch(page);
  }, [performSearch]);

  // Refresh current search
  const refresh = useCallback(() => {
    performSearch(searchState.currentPage);
  }, [performSearch, searchState.currentPage]);

  // Reset search to initial state
  const reset = useCallback(() => {
    setSearchOptions({
      search: '',
      status: 'all',
      type: 'all',
      sortBy: 'created_at',
      sortOrder: 'desc',
      limit: 10,
      ...initialOptions
    });
  }, [initialOptions]);

  return {
    // State
    clients: searchState.clients,
    loading: searchState.loading,
    error: searchState.error,
    totalCount: searchState.totalCount,
    totalPages: searchState.totalPages,
    currentPage: searchState.currentPage,
    hasMore: searchState.hasMore,
    
    // Options
    searchOptions,
    
    // Actions
    updateSearch,
    loadPage,
    refresh,
    reset,
    
    // Convenience methods
    setSearchTerm: (search: string) => updateSearch({ search }),
    setStatus: (status: 'active' | 'inactive' | 'all') => updateSearch({ status }),
    setType: (type: 'person' | 'company' | 'all') => updateSearch({ type }),
    setSorting: (sortBy: 'name' | 'created_at' | 'updated_at', sortOrder: 'asc' | 'desc') => 
      updateSearch({ sortBy, sortOrder }),
    
    // Computed values
    isEmpty: !searchState.loading && searchState.clients.length === 0,
    isSearching: Boolean(debouncedSearch.trim()),
    hasFilters: searchOptions.status !== 'all' || searchOptions.type !== 'all'
  };
};