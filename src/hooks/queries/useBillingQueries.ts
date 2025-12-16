import {
  useQuery,
  useMutation,
  useQueryClient,
  UseQueryOptions,
  UseMutationOptions,
} from '@tanstack/react-query';
import { BillingService } from '@/services/billingService';
import { MatterService } from '@/services/matterService';
import { TimeEntry, TimeEntryStatus } from '@/types/billing';
import { Matter } from '@/types/matter';

/**
 * React Query keys for billing-related queries
 * Using a hierarchical key structure for efficient cache invalidation
 */
export const billingQueryKeys = {
  all: ['billing'] as const,
  timeEntries: () => [...billingQueryKeys.all, 'timeEntries'] as const,
  timeEntry: (id: string) => [...billingQueryKeys.timeEntries(), id] as const,
  timeEntriesByMatter: (matterId: string) => [...billingQueryKeys.timeEntries(), 'matter', matterId] as const,
  timeEntriesByClient: (clientId: string) => [...billingQueryKeys.timeEntries(), 'client', clientId] as const,
  timeEntriesByStatus: (status: TimeEntryStatus) => [...billingQueryKeys.timeEntries(), 'status', status] as const,
  timeEntriesByDateRange: (start: string, end: string) => [...billingQueryKeys.timeEntries(), 'dateRange', start, end] as const,
  unsubmittedEntries: () => [...billingQueryKeys.timeEntries(), 'unsubmitted'] as const,
  recentEntries: (limit: number) => [...billingQueryKeys.timeEntries(), 'recent', limit] as const,
  matters: () => [...billingQueryKeys.all, 'matters'] as const,
  mattersForTimeEntry: () => [...billingQueryKeys.matters(), 'forTimeEntry'] as const,
  clientBilling: (clientId: string) => [...billingQueryKeys.all, 'client', clientId, 'billing'] as const,
  analytics: (dateRange?: { start: string; end: string }) => 
    dateRange 
      ? [...billingQueryKeys.all, 'analytics', dateRange.start, dateRange.end] as const
      : [...billingQueryKeys.all, 'analytics'] as const,
};

/**
 * Custom hook for fetching time entries with advanced caching
 * 
 * Features:
 * - 5-minute cache time for optimal performance
 * - Stale-while-revalidate strategy for instant UI updates
 * - Background refetching to keep data fresh
 * - Retry logic with exponential backoff
 * 
 * @param filters Optional filters for time entries
 * @param options Additional React Query options
 */
export const useTimeEntriesQuery = (
  filters?: {
    matterId?: string;
    clientId?: string;
    status?: TimeEntryStatus;
    dateRange?: { start: string; end: string };
  },
  options?: Omit<UseQueryOptions<TimeEntry[]>, 'queryKey' | 'queryFn'>
) => {
  // Generate a unique query key based on filters
  const queryKey = filters?.matterId
    ? billingQueryKeys.timeEntriesByMatter(filters.matterId)
    : filters?.clientId
    ? billingQueryKeys.timeEntriesByClient(filters.clientId)
    : filters?.status
    ? billingQueryKeys.timeEntriesByStatus(filters.status)
    : filters?.dateRange
    ? billingQueryKeys.timeEntriesByDateRange(filters.dateRange.start, filters.dateRange.end)
    : billingQueryKeys.timeEntries();

  return useQuery({
    queryKey,
    queryFn: () => BillingService.getTimeEntries(filters),
    // Cache for 5 minutes
    staleTime: 5 * 60 * 1000,
    // Keep cache for 10 minutes (even if stale)
    gcTime: 10 * 60 * 1000,
    // Refetch in background when window regains focus
    refetchOnWindowFocus: true,
    // Refetch in background when reconnecting
    refetchOnReconnect: true,
    // Retry failed requests with exponential backoff
    retry: (failureCount, error) => {
      // Don't retry on 4xx errors (client errors)
      if (error instanceof Error && error.message.includes('4')) {
        return false;
      }
      // Retry up to 3 times with exponential backoff
      return failureCount < 3;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    ...options,
  });
};

/**
 * Custom hook for fetching matters optimized for time entry selection
 * 
 * Features:
 * - 10-minute cache time (matters change less frequently)
 * - Only fetches active matters to reduce payload
 * - Includes billing rates for quick access
 * 
 * @param options Additional React Query options
 */
export const useMattersQuery = (
  options?: Omit<UseQueryOptions<Array<{
    id: string;
    title: string;
    clientName: string;
    practiceArea: string;
    hourlyRate?: number;
    status: string;
  }>>, 'queryKey' | 'queryFn'>
) => {
  return useQuery({
    queryKey: billingQueryKeys.mattersForTimeEntry(),
    queryFn: () => BillingService.getMattersForTimeEntry(),
    // Cache for 10 minutes (matters don't change frequently)
    staleTime: 10 * 60 * 1000,
    // Keep cache for 20 minutes
    gcTime: 20 * 60 * 1000,
    // Don't refetch on window focus (less critical data)
    refetchOnWindowFocus: false,
    // Retry logic
    retry: 2,
    retryDelay: 1000,
    ...options,
  });
};

/**
 * Custom hook for creating time entries with optimistic updates
 * 
 * Features:
 * - Optimistic updates for instant UI feedback
 * - Automatic cache invalidation on success
 * - Error rollback on failure
 * - Preserves scroll position during updates
 * 
 * @param options Additional mutation options
 */
export const useCreateTimeEntryMutation = (
  options?: UseMutationOptions<TimeEntry, Error, Omit<TimeEntry, 'id' | 'createdAt' | 'updatedAt'>>
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (newEntry) => BillingService.createTimeEntry(newEntry),
    // Optimistic update
    onMutate: async (newEntry) => {
      // Cancel any outgoing refetches to prevent overwriting optimistic update
      await queryClient.cancelQueries({ queryKey: billingQueryKeys.timeEntries() });

      // Snapshot the previous value
      const previousEntries = queryClient.getQueryData<TimeEntry[]>(billingQueryKeys.timeEntries());

      // Optimistically update to the new value
      if (previousEntries) {
        const optimisticEntry: TimeEntry = {
          id: `temp-${Date.now()}`,
          ...newEntry,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        
        queryClient.setQueryData<TimeEntry[]>(
          billingQueryKeys.timeEntries(),
          [...previousEntries, optimisticEntry]
        );
      }

      // Return a context object with the snapshotted value
      return { previousEntries };
    },
    // If the mutation fails, use the context returned from onMutate to roll back
    onError: (err, newEntry, context) => {
      if (context?.previousEntries) {
        queryClient.setQueryData(billingQueryKeys.timeEntries(), context.previousEntries);
      }
    },
    // Always refetch after error or success
    onSettled: () => {
      // Invalidate all time entry queries to ensure consistency
      queryClient.invalidateQueries({ queryKey: billingQueryKeys.timeEntries() });
      // Also invalidate related queries
      queryClient.invalidateQueries({ queryKey: billingQueryKeys.unsubmittedEntries() });
      queryClient.invalidateQueries({ queryKey: billingQueryKeys.recentEntries(5) });
      queryClient.invalidateQueries({ queryKey: billingQueryKeys.analytics() });
    },
    ...options,
  });
};

/**
 * Custom hook for updating time entries with optimistic updates
 * 
 * Features:
 * - Granular cache updates (only affected entries)
 * - Preserves list order during updates
 * - Minimal re-renders through targeted updates
 * 
 * @param options Additional mutation options
 */
export const useUpdateTimeEntryMutation = (
  options?: UseMutationOptions<TimeEntry, Error, { id: string; updates: Partial<TimeEntry> }>
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, updates }) => BillingService.updateTimeEntry(id, updates),
    // Optimistic update
    onMutate: async ({ id, updates }) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: billingQueryKeys.timeEntries() });

      // Snapshot the previous value
      const previousEntries = queryClient.getQueryData<TimeEntry[]>(billingQueryKeys.timeEntries());

      // Optimistically update to the new value
      if (previousEntries) {
        queryClient.setQueryData<TimeEntry[]>(
          billingQueryKeys.timeEntries(),
          previousEntries.map(entry =>
            entry.id === id
              ? { ...entry, ...updates, updatedAt: new Date().toISOString() }
              : entry
          )
        );
      }

      // Update individual entry cache if it exists
      const previousEntry = queryClient.getQueryData<TimeEntry>(billingQueryKeys.timeEntry(id));
      if (previousEntry) {
        queryClient.setQueryData<TimeEntry>(
          billingQueryKeys.timeEntry(id),
          { ...previousEntry, ...updates, updatedAt: new Date().toISOString() }
        );
      }

      return { previousEntries, previousEntry };
    },
    // Rollback on error
    onError: (err, variables, context) => {
      if (context?.previousEntries) {
        queryClient.setQueryData(billingQueryKeys.timeEntries(), context.previousEntries);
      }
      if (context?.previousEntry) {
        queryClient.setQueryData(billingQueryKeys.timeEntry(variables.id), context.previousEntry);
      }
    },
    // Invalidate and refetch
    onSettled: (data, error, variables) => {
      // Invalidate specific entry
      queryClient.invalidateQueries({ queryKey: billingQueryKeys.timeEntry(variables.id) });
      // Invalidate list queries that might be affected
      queryClient.invalidateQueries({ queryKey: billingQueryKeys.timeEntries() });
      
      // If status was updated, invalidate status-specific queries
      if (variables.updates.status) {
        queryClient.invalidateQueries({ queryKey: billingQueryKeys.unsubmittedEntries() });
      }
      
      // Invalidate analytics as amounts might have changed
      queryClient.invalidateQueries({ queryKey: billingQueryKeys.analytics() });
    },
    ...options,
  });
};

/**
 * Custom hook for deleting time entries with optimistic updates
 * 
 * Features:
 * - Instant removal from UI
 * - Preserves pagination state
 * - Cascading cache invalidation
 * 
 * @param options Additional mutation options
 */
export const useDeleteTimeEntryMutation = (
  options?: UseMutationOptions<void, Error, string>
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id) => BillingService.deleteTimeEntry(id),
    // Optimistic update
    onMutate: async (id) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: billingQueryKeys.timeEntries() });

      // Snapshot the previous value
      const previousEntries = queryClient.getQueryData<TimeEntry[]>(billingQueryKeys.timeEntries());

      // Optimistically remove from the list
      if (previousEntries) {
        queryClient.setQueryData<TimeEntry[]>(
          billingQueryKeys.timeEntries(),
          previousEntries.filter(entry => entry.id !== id)
        );
      }

      // Remove individual entry cache
      queryClient.removeQueries({ queryKey: billingQueryKeys.timeEntry(id) });

      return { previousEntries };
    },
    // Rollback on error
    onError: (err, id, context) => {
      if (context?.previousEntries) {
        queryClient.setQueryData(billingQueryKeys.timeEntries(), context.previousEntries);
      }
    },
    // Invalidate and refetch
    onSettled: () => {
      // Invalidate all related queries
      queryClient.invalidateQueries({ queryKey: billingQueryKeys.timeEntries() });
      queryClient.invalidateQueries({ queryKey: billingQueryKeys.unsubmittedEntries() });
      queryClient.invalidateQueries({ queryKey: billingQueryKeys.analytics() });
    },
    ...options,
  });
};

/**
 * Hook for fetching unsubmitted time entries
 * Uses the same caching strategy as general time entries
 */
export const useUnsubmittedEntriesQuery = (
  options?: Omit<UseQueryOptions<TimeEntry[]>, 'queryKey' | 'queryFn'>
) => {
  return useQuery({
    queryKey: billingQueryKeys.unsubmittedEntries(),
    queryFn: () => BillingService.getUnsubmittedEntries(),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    refetchOnWindowFocus: true,
    ...options,
  });
};

/**
 * Hook for fetching recent time entries
 * Useful for AI suggestions and quick entry features
 */
export const useRecentEntriesQuery = (
  limit: number = 5,
  options?: Omit<UseQueryOptions<TimeEntry[]>, 'queryKey' | 'queryFn'>
) => {
  return useQuery({
    queryKey: billingQueryKeys.recentEntries(limit),
    queryFn: () => BillingService.getRecentTimeEntries(limit),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    ...options,
  });
};

/**
 * Hook for fetching client billing information
 * Includes total billed, paid, and outstanding amounts
 */
export const useClientBillingQuery = (
  clientId: string,
  options?: Omit<UseQueryOptions<{
    totalBilled: number;
    totalPaid: number;
    outstandingBalance: number;
    recentTimeEntries: TimeEntry[];
  }>, 'queryKey' | 'queryFn'>
) => {
  return useQuery({
    queryKey: billingQueryKeys.clientBilling(clientId),
    queryFn: () => BillingService.getClientBillingInfo(clientId),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    enabled: !!clientId,
    ...options,
  });
};

/**
 * Hook for fetching billing analytics
 * Longer cache time as analytics don't need real-time updates
 */
export const useBillingAnalyticsQuery = (
  dateRange?: { start: string; end: string },
  options?: Omit<UseQueryOptions<any>, 'queryKey' | 'queryFn'>
) => {
  return useQuery({
    queryKey: billingQueryKeys.analytics(dateRange),
    queryFn: () => BillingService.getBillingAnalytics(dateRange),
    // Cache for 15 minutes (analytics are expensive to compute)
    staleTime: 15 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    // Don't refetch on window focus
    refetchOnWindowFocus: false,
    ...options,
  });
};

/**
 * Hook for batch submitting time entries
 * Handles multiple entries in a single transaction
 */
export const useSubmitTimeEntriesMutation = (
  options?: UseMutationOptions<void, Error, string[]>
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (entryIds) => BillingService.submitTimeEntries(entryIds),
    onSuccess: () => {
      // Invalidate all time entry queries as status has changed
      queryClient.invalidateQueries({ queryKey: billingQueryKeys.timeEntries() });
      queryClient.invalidateQueries({ queryKey: billingQueryKeys.unsubmittedEntries() });
      queryClient.invalidateQueries({ queryKey: billingQueryKeys.analytics() });
    },
    ...options,
  });
};

/**
 * Utility hook to prefetch matters for time entry form
 * Improves perceived performance by loading data before it's needed
 */
export const usePrefetchMatters = () => {
  const queryClient = useQueryClient();

  return () => {
    queryClient.prefetchQuery({
      queryKey: billingQueryKeys.mattersForTimeEntry(),
      queryFn: () => BillingService.getMattersForTimeEntry(),
      staleTime: 10 * 60 * 1000,
    });
  };
};

/**
 * Hook to invalidate all billing-related queries
 * Useful after major operations or when syncing with server
 */
export const useInvalidateBillingQueries = () => {
  const queryClient = useQueryClient();

  return () => {
    queryClient.invalidateQueries({ queryKey: billingQueryKeys.all });
  };
};