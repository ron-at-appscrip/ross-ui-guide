
import React, { useState, useEffect, useCallback, useRef, memo } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Play, Pause, Square, Clock, Minimize2, Maximize2, Briefcase } from 'lucide-react';
import { TimerSession } from '@/types/billing';
import { BillingService } from '@/services/billingService';
import { useToast } from '@/components/ui/use-toast';
import { MatterSelectSkeleton } from './skeletons';

// Constants
const STORAGE_KEYS = {
  TIMER_STATE: 'floating_timer_state',
  TIMER_SESSION: 'floating_timer_session'
} as const;

const TIMER_INTERVAL = 1000;
const DEFAULT_HOURLY_RATE = 350;

// Types
interface FloatingTimerProps {
  isMinimized?: boolean;
  onToggleMinimize?: () => void;
}

interface Matter {
  id: string;
  title: string;
  clientName: string;
  practiceArea: string;
  hourlyRate?: number;
}

interface TimerState {
  isActive: boolean;
  seconds: number;
  description: string;
  selectedMatter: string;
  startedAt?: string;
}

interface StorageOperationError {
  type: 'STORAGE_ERROR';
  operation: string;
  error: Error;
}

// Safe localStorage operations with error handling
const safeLocalStorage = {
  getItem: (key: string): string | null => {
    try {
      return localStorage.getItem(key);
    } catch (error) {
      console.error(`Error reading from localStorage (${key}):`, error);
      return null;
    }
  },
  
  setItem: (key: string, value: string): boolean => {
    try {
      localStorage.setItem(key, value);
      return true;
    } catch (error) {
      console.error(`Error writing to localStorage (${key}):`, error);
      return false;
    }
  },
  
  removeItem: (key: string): boolean => {
    try {
      localStorage.removeItem(key);
      return true;
    } catch (error) {
      console.error(`Error removing from localStorage (${key}):`, error);
      return false;
    }
  }
};

// Timer persistence utilities
const TimerPersistence = {
  saveState: (state: TimerState): boolean => {
    return safeLocalStorage.setItem(STORAGE_KEYS.TIMER_STATE, JSON.stringify(state));
  },
  
  loadState: (): TimerState | null => {
    const saved = safeLocalStorage.getItem(STORAGE_KEYS.TIMER_STATE);
    if (!saved) return null;
    
    try {
      const parsed = JSON.parse(saved) as TimerState;
      // Validate the structure
      if (typeof parsed.isActive !== 'boolean' || typeof parsed.seconds !== 'number') {
        return null;
      }
      return parsed;
    } catch (error) {
      console.error('Error parsing saved timer state:', error);
      return null;
    }
  },
  
  clearState: (): boolean => {
    return safeLocalStorage.removeItem(STORAGE_KEYS.TIMER_STATE);
  }
};

const FloatingTimerComponent = ({ isMinimized = false, onToggleMinimize }: FloatingTimerProps) => {
  // State
  const [isActive, setIsActive] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [description, setDescription] = useState('');
  const [selectedMatter, setSelectedMatter] = useState('');
  const [matters, setMatters] = useState<Matter[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<StorageOperationError | null>(null);
  
  // Refs for cleanup
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const isMountedRef = useRef(true);
  const lastSaveTimeRef = useRef<number>(0);
  
  const { toast } = useToast();

  // Memoized callback to avoid recreating functions
  const showErrorToast = useCallback((title: string, description: string) => {
    if (isMountedRef.current) {
      toast({
        title,
        description,
        variant: "destructive"
      });
    }
  }, [toast]);
  
  const showSuccessToast = useCallback((title: string, description: string) => {
    if (isMountedRef.current) {
      toast({
        title,
        description
      });
    }
  }, [toast]);

  // Optimized matter loading with proper error handling
  const loadMatters = useCallback(async () => {
    if (!isMountedRef.current) return;
    
    try {
      setIsLoading(true);
      setError(null);
      const mattersList = await BillingService.getMattersForTimeEntry();
      
      if (isMountedRef.current) {
        setMatters(mattersList);
      }
    } catch (error) {
      console.error('Error loading matters:', error);
      if (isMountedRef.current) {
        showErrorToast(
          "Error loading matters",
          "Unable to load matter list. Please try again."
        );
      }
    } finally {
      if (isMountedRef.current) {
        setIsLoading(false);
      }
    }
  }, [showErrorToast]);

  // Optimized timer state persistence (debounced)
  const saveTimerState = useCallback(() => {
    const now = Date.now();
    // Debounce saves to avoid excessive localStorage writes
    if (now - lastSaveTimeRef.current < 5000) return;
    
    lastSaveTimeRef.current = now;
    const state: TimerState = {
      isActive,
      seconds,
      description,
      selectedMatter,
      startedAt: isActive ? new Date().toISOString() : undefined
    };
    
    TimerPersistence.saveState(state);
  }, [isActive, seconds, description, selectedMatter]);
  
  // Load persisted state on mount
  useEffect(() => {
    const loadPersistedState = () => {
      const savedState = TimerPersistence.loadState();
      if (!savedState || !isMountedRef.current) return;
      
      // Calculate elapsed time if timer was active
      if (savedState.isActive && savedState.startedAt) {
        const elapsed = Math.floor(
          (Date.now() - new Date(savedState.startedAt).getTime()) / 1000
        );
        const adjustedSeconds = savedState.seconds + elapsed;
        
        setSeconds(adjustedSeconds);
        setIsActive(true);
      } else {
        setSeconds(savedState.seconds);
        setIsActive(savedState.isActive);
      }
      
      setDescription(savedState.description);
      setSelectedMatter(savedState.selectedMatter);
    };
    
    loadPersistedState();
    loadMatters();
  }, [loadMatters]);
  
  // Optimized timer effect with proper cleanup
  useEffect(() => {
    const cleanup = () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
    
    if (isActive && isMountedRef.current) {
      intervalRef.current = setInterval(() => {
        if (isMountedRef.current) {
          setSeconds(prev => prev + 1);
        }
      }, TIMER_INTERVAL);
    } else {
      cleanup();
    }
    
    return cleanup;
  }, [isActive]);
  
  // Save state periodically when timer is running
  useEffect(() => {
    if (isActive) {
      saveTimerState();
    }
  }, [seconds, saveTimerState, isActive]);
  
  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      // Save final state
      const state: TimerState = {
        isActive,
        seconds,
        description,
        selectedMatter
      };
      TimerPersistence.saveState(state);
    };
  }, [isActive, seconds, description, selectedMatter]);

  // Memoized time formatting to prevent unnecessary recalculations
  const formatTime = useCallback((totalSeconds: number): string => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }, []);

  // Optimized handlers with proper state management
  const handleStart = useCallback(() => {
    if (!isMountedRef.current) return;
    setIsActive(true);
    saveTimerState();
  }, [saveTimerState]);
  
  const handlePause = useCallback(() => {
    if (!isMountedRef.current) return;
    setIsActive(false);
    saveTimerState();
  }, [saveTimerState]);

  const handleStop = useCallback(async () => {
    if (!selectedMatter || seconds === 0 || !isMountedRef.current) return;
    
    setIsActive(false);
    
    try {
      const matter = matters.find(m => m.id === selectedMatter);
      if (!matter) {
        showErrorToast("Invalid matter", "Selected matter not found.");
        return;
      }
      
      const hours = parseFloat((seconds / 3600).toFixed(2));
      const rate = matter.hourlyRate || DEFAULT_HOURLY_RATE;
      
      await BillingService.createTimeEntry({
        matterId: selectedMatter,
        matterTitle: matter.title,
        clientId: '', // Will be populated by service
        clientName: matter.clientName,
        description: description || 'Timer session',
        hours,
        rate,
        amount: hours * rate,
        date: new Date().toISOString().split('T')[0],
        status: 'draft',
        billable: true,
        activityType: 'general_work',
        tags: ['timer']
      });
      
      if (isMountedRef.current) {
        showSuccessToast(
          "Time entry saved",
          `${hours} hours recorded for ${matter.title}`
        );
        
        // Reset timer and clear persisted state
        setSeconds(0);
        setDescription('');
        setSelectedMatter('');
        TimerPersistence.clearState();
      }
    } catch (error) {
      console.error('Error saving time entry:', error);
      showErrorToast(
        "Error saving time entry",
        "Please try again."
      );
    }
  }, [selectedMatter, seconds, matters, description, showErrorToast, showSuccessToast]);
  
  // Memoized handlers for input changes
  const handleDescriptionChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (isMountedRef.current) {
      setDescription(e.target.value);
    }
  }, []);
  
  const handleMatterChange = useCallback((matterId: string) => {
    if (isMountedRef.current) {
      setSelectedMatter(matterId);
    }
  }, []);
  
  // Memoized values
  const formattedTime = formatTime(seconds);
  const canStart = description && selectedMatter && !isLoading;
  const canStop = seconds > 0;

  // Error boundary rendering
  if (error) {
    return (
      <Card className="fixed bottom-4 right-4 p-4 bg-white shadow-lg border z-50 w-80">
        <div className="text-center">
          <div className="text-red-500 mb-2">Timer Error</div>
          <div className="text-sm text-gray-600 mb-3">
            {error.type === 'STORAGE_ERROR' ? 
              'Storage unavailable. Timer will not persist.' : 
              'An error occurred with the timer.'}
          </div>
          <Button 
            onClick={() => setError(null)} 
            size="sm" 
            variant="outline"
          >
            Retry
          </Button>
        </div>
      </Card>
    );
  }
  
  if (isMinimized) {
    return (
      <Card className="fixed bottom-4 right-4 p-3 bg-white shadow-lg border z-50 cursor-pointer hover:shadow-xl transition-shadow">
        <div className="flex items-center space-x-2" onClick={onToggleMinimize}>
          <Clock className="h-4 w-4 text-primary" />
          <span className="font-mono text-sm">{formattedTime}</span>
          {isActive ? (
            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
          ) : (
            <div className="w-2 h-2 bg-gray-300 rounded-full" />
          )}
        </div>
      </Card>
    );
  }

  return (
    <Card className="fixed bottom-4 right-4 p-4 bg-white shadow-lg border z-50 w-80">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <Clock className="h-5 w-5 text-primary" />
          <span className="font-semibold">Timer</span>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={onToggleMinimize}
        >
          <Minimize2 className="h-4 w-4" />
        </Button>
      </div>

      <div className="text-center mb-4">
        <div className="text-3xl font-mono font-bold text-primary">
          {formattedTime}
        </div>
        {isActive && (
          <div className="text-sm text-green-600 flex items-center justify-center space-x-1">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <span>Recording</span>
          </div>
        )}
      </div>

      <div className="space-y-3">
        <Input
          placeholder="What are you working on?"
          value={description}
          onChange={handleDescriptionChange}
        />
        
{isLoading ? (
          <MatterSelectSkeleton />
        ) : (
          <Select value={selectedMatter} onValueChange={handleMatterChange}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select matter..." />
            </SelectTrigger>
          <SelectContent>
            {matters.map((matter) => (
              <SelectItem key={matter.id} value={matter.id}>
                <div className="flex flex-col">
                  <div className="font-medium text-sm">{matter.title}</div>
                  <div className="text-xs text-muted-foreground flex items-center gap-1">
                    <Briefcase className="h-3 w-3" />
                    {matter.clientName} • {matter.practiceArea}
                    {matter.hourlyRate && (
                      <span className="ml-1">• ${matter.hourlyRate}/hr</span>
                    )}
                  </div>
                </div>
              </SelectItem>
            ))}
            {matters.length === 0 && (
              <SelectItem value="no-matters" disabled>
                No active matters found
              </SelectItem>
            )}
          </SelectContent>
          </Select>
        )}

        <div className="flex space-x-2">
          {!isActive ? (
            <Button onClick={handleStart} className="flex-1" disabled={!canStart}>
              <Play className="h-4 w-4 mr-2" />
              Start
            </Button>
          ) : (
            <Button onClick={handlePause} variant="outline" className="flex-1">
              <Pause className="h-4 w-4 mr-2" />
              Pause
            </Button>
          )}
          
          <Button onClick={handleStop} variant="outline" disabled={!canStop}>
            <Square className="h-4 w-4 mr-2" />
            Stop & Save
          </Button>
        </div>
      </div>
    </Card>
  );
};

// Memoize the component to prevent unnecessary re-renders
const FloatingTimer = memo(FloatingTimerComponent);
FloatingTimer.displayName = 'FloatingTimer';

export default FloatingTimer;
