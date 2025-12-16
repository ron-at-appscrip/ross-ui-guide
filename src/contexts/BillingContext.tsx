import React, { createContext, useContext, useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { TimeEntry, BillingPreferences, InvoiceGenerationState, TimerState, BillingFilters } from '../types/billing';
import { Matter } from '../types/matter';
import { billingService } from '../services/billingService';
import { useTimeEntries, useActiveTimer, useBillingPreferences } from '../hooks/useBilling';
import { toast } from 'sonner';

interface BillingContextState {
  // Timer state
  timerState: TimerState | null;
  activeTimerId: string | null;
  
  // Time entries
  selectedTimeEntries: Set<string>;
  
  // Matters
  selectedMatters: Set<string>;
  
  // Filters
  billingFilters: BillingFilters;
  
  // Invoice generation
  invoiceGenerationState: InvoiceGenerationState;
  
  // Preferences
  billingPreferences: BillingPreferences | null;
}

interface BillingContextActions {
  // Timer actions
  startTimer: (matterId: string, description?: string) => Promise<void>;
  stopTimer: (timerId: string) => Promise<void>;
  pauseTimer: (timerId: string) => Promise<void>;
  resumeTimer: (timerId: string) => Promise<void>;
  
  // Time entry actions
  selectTimeEntry: (entryId: string) => void;
  deselectTimeEntry: (entryId: string) => void;
  selectAllTimeEntries: (entryIds: string[]) => void;
  clearTimeEntrySelection: () => void;
  
  // Matter actions
  selectMatter: (matterId: string) => void;
  deselectMatter: (matterId: string) => void;
  clearMatterSelection: () => void;
  
  // Filter actions
  updateFilters: (filters: Partial<BillingFilters>) => void;
  resetFilters: () => void;
  
  // Invoice actions
  startInvoiceGeneration: (clientId: string, matterIds?: string[]) => void;
  updateInvoiceGenerationState: (state: Partial<InvoiceGenerationState>) => void;
  cancelInvoiceGeneration: () => void;
  
  // Preference actions
  updateBillingPreferences: (preferences: Partial<BillingPreferences>) => Promise<void>;
}

interface BillingProviderProps {
  children: React.ReactNode;
}

const BillingStateContext = createContext<BillingContextState | undefined>(undefined);
const BillingActionsContext = createContext<BillingContextActions | undefined>(undefined);

const defaultFilters: BillingFilters = {
  dateRange: {
    start: new Date(new Date().setDate(new Date().getDate() - 30)),
    end: new Date()
  },
  status: 'all',
  clients: [],
  matters: [],
  minAmount: undefined,
  maxAmount: undefined
};

const defaultInvoiceGenerationState: InvoiceGenerationState = {
  isGenerating: false,
  currentStep: 'selection',
  selectedClientId: null,
  selectedMatterIds: [],
  invoiceData: null,
  error: null
};

export function BillingProvider({ children }: BillingProviderProps) {
  const queryClient = useQueryClient();
  
  // React Query hooks
  const { data: activeTimer } = useActiveTimer();
  const { data: preferences } = useBillingPreferences();
  
  // Local state
  const [timerState, setTimerState] = useState<TimerState | null>(null);
  const [selectedTimeEntries, setSelectedTimeEntries] = useState<Set<string>>(new Set());
  const [selectedMatters, setSelectedMatters] = useState<Set<string>>(new Set());
  const [billingFilters, setBillingFilters] = useState<BillingFilters>(defaultFilters);
  const [invoiceGenerationState, setInvoiceGenerationState] = useState<InvoiceGenerationState>(defaultInvoiceGenerationState);
  
  // Refs for timer management
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<Date | null>(null);
  
  // Update timer state when active timer changes
  useEffect(() => {
    if (activeTimer) {
      setTimerState({
        id: activeTimer.id,
        matterId: activeTimer.matter_id,
        description: activeTimer.description || '',
        startTime: new Date(activeTimer.start_time),
        duration: activeTimer.duration || 0,
        isPaused: activeTimer.is_paused || false,
        pausedDuration: activeTimer.paused_duration || 0
      });
      
      if (!activeTimer.is_paused) {
        startTimeRef.current = new Date(activeTimer.start_time);
        startTimerInterval();
      }
    } else {
      setTimerState(null);
      stopTimerInterval();
    }
    
    return () => stopTimerInterval();
  }, [activeTimer]);
  
  const startTimerInterval = useCallback(() => {
    stopTimerInterval();
    
    timerIntervalRef.current = setInterval(() => {
      if (startTimeRef.current && timerState && !timerState.isPaused) {
        const elapsed = Math.floor((Date.now() - startTimeRef.current.getTime()) / 1000);
        setTimerState(prev => prev ? { ...prev, duration: elapsed } : null);
      }
    }, 1000);
  }, [timerState]);
  
  const stopTimerInterval = useCallback(() => {
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
  }, []);
  
  // Timer actions
  const startTimer = useCallback(async (matterId: string, description?: string) => {
    try {
      const timer = await billingService.startTimer(matterId, description);
      
      // Invalidate queries to refetch active timer
      await queryClient.invalidateQueries({ queryKey: ['activeTimer'] });
      await queryClient.invalidateQueries({ queryKey: ['timeEntries'] });
      
      toast.success('Timer started');
    } catch (error) {
      console.error('Failed to start timer:', error);
      toast.error('Failed to start timer');
      throw error;
    }
  }, [queryClient]);
  
  const stopTimer = useCallback(async (timerId: string) => {
    try {
      await billingService.stopTimer(timerId);
      
      // Invalidate queries
      await queryClient.invalidateQueries({ queryKey: ['activeTimer'] });
      await queryClient.invalidateQueries({ queryKey: ['timeEntries'] });
      
      toast.success('Timer stopped');
    } catch (error) {
      console.error('Failed to stop timer:', error);
      toast.error('Failed to stop timer');
      throw error;
    }
  }, [queryClient]);
  
  const pauseTimer = useCallback(async (timerId: string) => {
    try {
      await billingService.pauseTimer(timerId);
      
      // Update local state immediately for responsiveness
      setTimerState(prev => prev ? { ...prev, isPaused: true } : null);
      stopTimerInterval();
      
      // Invalidate queries
      await queryClient.invalidateQueries({ queryKey: ['activeTimer'] });
      
      toast.success('Timer paused');
    } catch (error) {
      console.error('Failed to pause timer:', error);
      toast.error('Failed to pause timer');
      throw error;
    }
  }, [queryClient, stopTimerInterval]);
  
  const resumeTimer = useCallback(async (timerId: string) => {
    try {
      await billingService.resumeTimer(timerId);
      
      // Update local state immediately
      setTimerState(prev => prev ? { ...prev, isPaused: false } : null);
      startTimeRef.current = new Date();
      startTimerInterval();
      
      // Invalidate queries
      await queryClient.invalidateQueries({ queryKey: ['activeTimer'] });
      
      toast.success('Timer resumed');
    } catch (error) {
      console.error('Failed to resume timer:', error);
      toast.error('Failed to resume timer');
      throw error;
    }
  }, [queryClient, startTimerInterval]);
  
  // Time entry selection actions
  const selectTimeEntry = useCallback((entryId: string) => {
    setSelectedTimeEntries(prev => new Set(prev).add(entryId));
  }, []);
  
  const deselectTimeEntry = useCallback((entryId: string) => {
    setSelectedTimeEntries(prev => {
      const next = new Set(prev);
      next.delete(entryId);
      return next;
    });
  }, []);
  
  const selectAllTimeEntries = useCallback((entryIds: string[]) => {
    setSelectedTimeEntries(new Set(entryIds));
  }, []);
  
  const clearTimeEntrySelection = useCallback(() => {
    setSelectedTimeEntries(new Set());
  }, []);
  
  // Matter selection actions
  const selectMatter = useCallback((matterId: string) => {
    setSelectedMatters(prev => new Set(prev).add(matterId));
  }, []);
  
  const deselectMatter = useCallback((matterId: string) => {
    setSelectedMatters(prev => {
      const next = new Set(prev);
      next.delete(matterId);
      return next;
    });
  }, []);
  
  const clearMatterSelection = useCallback(() => {
    setSelectedMatters(new Set());
  }, []);
  
  // Filter actions
  const updateFilters = useCallback((filters: Partial<BillingFilters>) => {
    setBillingFilters(prev => ({ ...prev, ...filters }));
  }, []);
  
  const resetFilters = useCallback(() => {
    setBillingFilters(defaultFilters);
  }, []);
  
  // Invoice generation actions
  const startInvoiceGeneration = useCallback((clientId: string, matterIds?: string[]) => {
    setInvoiceGenerationState({
      isGenerating: true,
      currentStep: 'selection',
      selectedClientId: clientId,
      selectedMatterIds: matterIds || [],
      invoiceData: null,
      error: null
    });
  }, []);
  
  const updateInvoiceGenerationState = useCallback((state: Partial<InvoiceGenerationState>) => {
    setInvoiceGenerationState(prev => ({ ...prev, ...state }));
  }, []);
  
  const cancelInvoiceGeneration = useCallback(() => {
    setInvoiceGenerationState(defaultInvoiceGenerationState);
  }, []);
  
  // Billing preferences actions
  const updateBillingPreferences = useCallback(async (newPreferences: Partial<BillingPreferences>) => {
    try {
      await billingService.updateBillingPreferences(newPreferences);
      
      // Invalidate preferences query
      await queryClient.invalidateQueries({ queryKey: ['billingPreferences'] });
      
      toast.success('Billing preferences updated');
    } catch (error) {
      console.error('Failed to update billing preferences:', error);
      toast.error('Failed to update billing preferences');
      throw error;
    }
  }, [queryClient]);
  
  // Memoized state value
  const stateValue = useMemo<BillingContextState>(() => ({
    timerState,
    activeTimerId: activeTimer?.id || null,
    selectedTimeEntries,
    selectedMatters,
    billingFilters,
    invoiceGenerationState,
    billingPreferences: preferences || null
  }), [
    timerState,
    activeTimer?.id,
    selectedTimeEntries,
    selectedMatters,
    billingFilters,
    invoiceGenerationState,
    preferences
  ]);
  
  // Memoized actions value
  const actionsValue = useMemo<BillingContextActions>(() => ({
    // Timer actions
    startTimer,
    stopTimer,
    pauseTimer,
    resumeTimer,
    
    // Time entry actions
    selectTimeEntry,
    deselectTimeEntry,
    selectAllTimeEntries,
    clearTimeEntrySelection,
    
    // Matter actions
    selectMatter,
    deselectMatter,
    clearMatterSelection,
    
    // Filter actions
    updateFilters,
    resetFilters,
    
    // Invoice actions
    startInvoiceGeneration,
    updateInvoiceGenerationState,
    cancelInvoiceGeneration,
    
    // Preference actions
    updateBillingPreferences
  }), [
    startTimer,
    stopTimer,
    pauseTimer,
    resumeTimer,
    selectTimeEntry,
    deselectTimeEntry,
    selectAllTimeEntries,
    clearTimeEntrySelection,
    selectMatter,
    deselectMatter,
    clearMatterSelection,
    updateFilters,
    resetFilters,
    startInvoiceGeneration,
    updateInvoiceGenerationState,
    cancelInvoiceGeneration,
    updateBillingPreferences
  ]);
  
  return (
    <BillingStateContext.Provider value={stateValue}>
      <BillingActionsContext.Provider value={actionsValue}>
        {children}
      </BillingActionsContext.Provider>
    </BillingStateContext.Provider>
  );
}

// Custom hooks for consuming the context
export function useBillingState() {
  const context = useContext(BillingStateContext);
  if (context === undefined) {
    throw new Error('useBillingState must be used within a BillingProvider');
  }
  return context;
}

export function useBillingActions() {
  const context = useContext(BillingActionsContext);
  if (context === undefined) {
    throw new Error('useBillingActions must be used within a BillingProvider');
  }
  return context;
}

// Combined hook for convenience
export function useBilling() {
  const state = useBillingState();
  const actions = useBillingActions();
  return { ...state, ...actions };
}

// Selector hooks for specific parts of state (performance optimization)
export function useActiveTimerState() {
  const { timerState, activeTimerId } = useBillingState();
  return { timerState, activeTimerId };
}

export function useTimeEntrySelection() {
  const { selectedTimeEntries } = useBillingState();
  const { selectTimeEntry, deselectTimeEntry, selectAllTimeEntries, clearTimeEntrySelection } = useBillingActions();
  
  return {
    selectedTimeEntries,
    selectTimeEntry,
    deselectTimeEntry,
    selectAllTimeEntries,
    clearTimeEntrySelection,
    isSelected: useCallback((entryId: string) => selectedTimeEntries.has(entryId), [selectedTimeEntries])
  };
}

export function useMatterSelection() {
  const { selectedMatters } = useBillingState();
  const { selectMatter, deselectMatter, clearMatterSelection } = useBillingActions();
  
  return {
    selectedMatters,
    selectMatter,
    deselectMatter,
    clearMatterSelection,
    isSelected: useCallback((matterId: string) => selectedMatters.has(matterId), [selectedMatters])
  };
}

export function useBillingFiltersState() {
  const { billingFilters } = useBillingState();
  const { updateFilters, resetFilters } = useBillingActions();
  
  return {
    filters: billingFilters,
    updateFilters,
    resetFilters
  };
}

export function useInvoiceGeneration() {
  const { invoiceGenerationState } = useBillingState();
  const { startInvoiceGeneration, updateInvoiceGenerationState, cancelInvoiceGeneration } = useBillingActions();
  
  return {
    state: invoiceGenerationState,
    startGeneration: startInvoiceGeneration,
    updateState: updateInvoiceGenerationState,
    cancel: cancelInvoiceGeneration
  };
}