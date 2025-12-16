import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import Sessions from '@/pages/dashboard/Sessions';
import { useAuth } from '@/contexts/WorkingAuthContext';
import { sessionService } from '@/services/sessionService';

// Mock dependencies
vi.mock('@/contexts/WorkingAuthContext');
vi.mock('@/services/sessionService');
vi.mock('@/integrations/supabase/client');

const mockUser = {
  id: 'user-123',
  email: 'test@example.com',
  user_metadata: { full_name: 'Test User' }
};

const mockSessionData = [
  {
    session_id: 'session-1',
    session_started_at: '2024-01-01T10:00:00Z',
    session_ended_at: null,
    last_activity_at: '2024-01-01T11:00:00Z',
    duration_minutes: null,
    session_status: 'active',
    refresh_count: 3,
    ip_address: '192.168.1.1',
    user_agent: 'Mozilla/5.0 Chrome/120.0',
    device_type: 'desktop',
    browser: 'chrome',
    is_current_session: true
  },
  {
    session_id: 'session-2',
    session_started_at: '2024-01-01T08:00:00Z',
    session_ended_at: '2024-01-01T09:30:00Z',
    last_activity_at: '2024-01-01T09:30:00Z',
    duration_minutes: 90,
    session_status: 'ended',
    refresh_count: 1,
    ip_address: '192.168.1.2',
    user_agent: 'Mozilla/5.0 Safari/17.0',
    device_type: 'mobile',
    browser: 'safari',
    is_current_session: false
  }
];

const mockSessionStats = {
  total_sessions: 5,
  active_sessions: 1,
  average_duration_minutes: 45,
  unique_devices: 3
};

describe('Sessions Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    (useAuth as any).mockReturnValue({
      user: mockUser,
      isLoading: false
    });
    
    (sessionService.getSessionHistory as any).mockResolvedValue(mockSessionData);
    (sessionService.getActiveSessions as any).mockResolvedValue([mockSessionData[0]]);
    (sessionService.getSessionStats as any).mockResolvedValue(mockSessionStats);
  });

  it('renders session statistics correctly', async () => {
    render(<Sessions />);
    
    await waitFor(() => {
      expect(screen.getByText('5')).toBeInTheDocument(); // Total sessions
      expect(screen.getByText('1')).toBeInTheDocument(); // Active sessions
      expect(screen.getByText('45m')).toBeInTheDocument(); // Avg duration
      expect(screen.getByText('3')).toBeInTheDocument(); // Unique devices
    });
  });

  it('displays active sessions with correct badges', async () => {
    render(<Sessions />);
    
    await waitFor(() => {
      expect(screen.getByText('Active Session 1')).toBeInTheDocument();
      expect(screen.getByText('Current')).toBeInTheDocument();
      expect(screen.getByText('Sign Out')).toBeInTheDocument();
    });
  });

  it('displays session history with status badges', async () => {
    render(<Sessions />);
    
    await waitFor(() => {
      expect(screen.getByText('Session 1')).toBeInTheDocument();
      expect(screen.getByText('Session 2')).toBeInTheDocument();
      expect(screen.getByText('active')).toBeInTheDocument();
      expect(screen.getByText('ended')).toBeInTheDocument();
    });
  });

  it('shows device icons correctly', async () => {
    render(<Sessions />);
    
    await waitFor(() => {
      // Desktop session should show computer icon
      expect(screen.getByText('Device: desktop - chrome')).toBeInTheDocument();
      // Mobile session should show phone icon  
      expect(screen.getByText('Device: mobile - safari')).toBeInTheDocument();
    });
  });

  it('handles session termination', async () => {
    const mockTrackSessionEnd = vi.fn().mockResolvedValue(undefined);
    (sessionService.trackSessionEnd as any).mockImplementation(mockTrackSessionEnd);
    
    render(<Sessions />);
    
    await waitFor(() => {
      const signOutButton = screen.getByText('Sign Out');
      fireEvent.click(signOutButton);
    });
    
    expect(mockTrackSessionEnd).toHaveBeenCalledWith('session-1');
  });

  it('displays loading state correctly', () => {
    (sessionService.getSessionHistory as any).mockImplementation(
      () => new Promise(resolve => setTimeout(resolve, 1000))
    );
    
    render(<Sessions />);
    
    expect(screen.getByText('Loading sessions...')).toBeInTheDocument();
    expect(screen.getByLabelText('Loading')).toBeInTheDocument();
  });

  it('handles error states gracefully', async () => {
    (sessionService.getSessionHistory as any).mockRejectedValue(
      new Error('Failed to fetch sessions')
    );
    
    render(<Sessions />);
    
    await waitFor(() => {
      expect(screen.getByText(/Failed to load your sessions/)).toBeInTheDocument();
    });
  });

  it('shows empty state when no sessions exist', async () => {
    (sessionService.getSessionHistory as any).mockResolvedValue([]);
    (sessionService.getActiveSessions as any).mockResolvedValue([]);
    
    render(<Sessions />);
    
    await waitFor(() => {
      expect(screen.getByText('No session history found')).toBeInTheDocument();
      expect(screen.getByText('No active sessions')).toBeInTheDocument();
    });
  });

  it('formats dates correctly', async () => {
    render(<Sessions />);
    
    await waitFor(() => {
      // Check that dates are formatted and displayed
      const dateElements = screen.getAllByText(/Started:/);
      expect(dateElements.length).toBeGreaterThan(0);
      
      // Verify date format (should not show "Invalid Date")
      dateElements.forEach(element => {
        expect(element.textContent).not.toContain('Invalid Date');
        expect(element.textContent).not.toContain('Unknown');
      });
    });
  });

  it('handles refresh functionality', async () => {
    const mockGetSessionHistory = vi.fn().mockResolvedValue(mockSessionData);
    const mockGetSessionStats = vi.fn().mockResolvedValue(mockSessionStats);
    
    (sessionService.getSessionHistory as any).mockImplementation(mockGetSessionHistory);
    (sessionService.getSessionStats as any).mockImplementation(mockGetSessionStats);
    
    render(<Sessions />);
    
    await waitFor(() => {
      const refreshButton = screen.getByText('Refresh');
      fireEvent.click(refreshButton);
    });
    
    // Should call the services again
    expect(mockGetSessionHistory).toHaveBeenCalledTimes(2); // Initial + refresh
    expect(mockGetSessionStats).toHaveBeenCalledTimes(2); // Initial + refresh
  });
});