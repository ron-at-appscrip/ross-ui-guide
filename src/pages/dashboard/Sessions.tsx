import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/WorkingAuthContext';
import { sessionService, type SessionAnalyticsData } from '@/services/sessionService';
import { UserSession, SessionStats } from '@/types/session';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { RefreshCwIcon, MonitorIcon, AlertCircleIcon, ClockIcon, SmartphoneIcon, ComputerIcon, TabletIcon, WifiIcon, MapPinIcon, XCircleIcon } from 'lucide-react';

// Helper function to safely format dates
const formatSessionDate = (dateString: string): string => {
  try {
    if (!dateString) return 'Unknown';
    
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      console.warn('Invalid date string:', dateString);
      return 'Invalid Date';
    }
    
    return date.toLocaleString();
  } catch (error) {
    console.error('Error formatting date:', dateString, error);
    return 'Error parsing date';
  }
};

// Helper function to get device icon
const getDeviceIcon = (deviceType?: string) => {
  switch (deviceType?.toLowerCase()) {
    case 'mobile':
      return <SmartphoneIcon className="h-4 w-4" />;
    case 'tablet':
      return <TabletIcon className="h-4 w-4" />;
    case 'desktop':
    default:
      return <ComputerIcon className="h-4 w-4" />;
  }
};

export default function Sessions(): JSX.Element {
  const { user } = useAuth();
  const [sessions, setSessions] = useState<SessionAnalyticsData[]>([]);
  const [sessionStats, setSessionStats] = useState<SessionStats | null>(null);
  const [activeSessions, setActiveSessions] = useState<SessionAnalyticsData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);

  // Load user sessions and analytics
  const loadUserSessions = useCallback(async () => {
    if (!user) return;
    
    setLoading(true);
    setError(null);
    
    try {
      // Load session history using new event-based system
      const sessionHistory = await sessionService.getSessionHistory(50, 0);
      console.log('Session history received:', sessionHistory);
      setSessions(sessionHistory);
      
      // Load active sessions
      const activeSessionsData = await sessionService.getActiveSessions();
      console.log('Active sessions received:', activeSessionsData);
      setActiveSessions(activeSessionsData);
      
    } catch (err) {
      console.error('Error loading user sessions:', err);
      setError('Failed to load your sessions. Please try again.');
      
      // Fallback to legacy method
      try {
        const legacySessions = await sessionService.getUserSessions({ limit: 50 });
        // Convert UserSession to SessionAnalyticsData format
        const convertedSessions: SessionAnalyticsData[] = legacySessions.map(session => ({
          session_id: session.session_id,
          session_started_at: session.created_at,
          session_ended_at: session.is_active ? undefined : session.updated_at,
          session_expired_at: undefined,
          last_activity_at: session.updated_at,
          duration_minutes: undefined,
          session_status: session.is_active ? 'active' : 'ended' as const,
          refresh_count: 0,
          ip_address: session.ip_address,
          user_agent: session.user_agent,
          device_type: 'unknown',
          browser: 'unknown',
          location: undefined,
          is_current_session: session.is_current
        }));
        setSessions(convertedSessions);
        setActiveSessions(convertedSessions.filter(s => s.session_status === 'active'));
      } catch (fallbackErr) {
        console.error('Fallback also failed:', fallbackErr);
      }
    } finally {
      setLoading(false);
    }
  }, [user]);
  
  // Load session statistics
  const loadSessionStats = useCallback(async () => {
    if (!user) return;
    
    setStatsLoading(true);
    
    try {
      const stats = await sessionService.getSessionStats(30);
      console.log('Session stats received:', stats);
      setSessionStats(stats);
    } catch (err) {
      console.error('Error loading session stats:', err);
      // Don't show error for stats, just log it
    } finally {
      setStatsLoading(false);
    }
  }, [user]);
  
  // Handle session termination
  const handleTerminateSession = useCallback(async (sessionId: string) => {
    if (!user) return;
    
    try {
      // Track session end event
      await sessionService.trackSessionEnd(sessionId);
      
      // If this is the current session, sign out the user
      const { data: { session: currentSession } } = await supabase.auth.getSession();
      if (currentSession?.id === sessionId) {
        await supabase.auth.signOut();
        // The auth state change will handle the rest
      } else {
        // Just refresh the session list for non-current sessions
        await loadUserSessions();
        await loadSessionStats();
      }
    } catch (err) {
      console.error('Error terminating session:', err);
      setError('Failed to terminate session. Please try again.');
    }
  }, [user, loadUserSessions, loadSessionStats]);

  // Load sessions and stats on component mount
  useEffect(() => {
    if (user) {
      loadUserSessions();
      loadSessionStats();
    }
  }, [user, loadUserSessions, loadSessionStats]);

  if (!user) {
    return (
      <div className="flex items-center justify-center h-96">
        <Card className="p-8 text-center">
          <AlertCircleIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-lg text-muted-foreground">Please log in to view your sessions.</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Your Sessions</h1>
          <p className="text-muted-foreground mt-1">
            Monitor and manage your active sessions across all devices
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => { loadUserSessions(); loadSessionStats(); }} variant="outline" size="sm">
            <RefreshCwIcon className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button 
            onClick={() => {
              if (user) {
                sessionService.clearStoredSessions(user.id);
                loadUserSessions();
              }
            }} 
            variant="outline" 
            size="sm"
          >
            Clear Legacy Data
          </Button>
        </div>
      </div>

      {/* Session Statistics */}
      {sessionStats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold">{sessionStats.total_sessions || 0}</div>
              <p className="text-xs text-muted-foreground">Total Sessions (30 days)</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold">{sessionStats.active_sessions || 0}</div>
              <p className="text-xs text-muted-foreground">Active Sessions</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold">
                {sessionStats.average_duration_minutes ? Math.round(sessionStats.average_duration_minutes) : 0}m
              </div>
              <p className="text-xs text-muted-foreground">Avg Duration</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold">{sessionStats.unique_devices || 0}</div>
              <p className="text-xs text-muted-foreground">Unique Devices</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Active Sessions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <WifiIcon className="h-5 w-5" />
            Active Sessions ({activeSessions.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <RefreshCwIcon className="h-6 w-6 animate-spin text-muted-foreground" />
              <span className="ml-2">Loading sessions...</span>
            </div>
          ) : activeSessions.length === 0 ? (
            <div className="text-center py-12">
              <MonitorIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-lg font-medium">No active sessions</p>
              <p className="text-muted-foreground">You don't have any active sessions</p>
            </div>
          ) : (
            <div className="space-y-4">
              {activeSessions.map((session, index) => (
                <div key={session.session_id} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold">Active Session {index + 1}</h3>
                        {session.is_current_session && (
                          <Badge variant="secondary">Current</Badge>
                        )}
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-muted-foreground">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <ClockIcon className="h-4 w-4" />
                            Started: {formatSessionDate(session.session_started_at)}
                          </div>
                          <div className="flex items-center gap-2">
                            <ClockIcon className="h-4 w-4" />
                            Last Activity: {formatSessionDate(session.last_activity_at)}
                          </div>
                          {session.refresh_count > 0 && (
                            <div className="flex items-center gap-2">
                              <RefreshCwIcon className="h-4 w-4" />
                              Refreshes: {session.refresh_count}
                            </div>
                          )}
                        </div>
                        
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            {getDeviceIcon(session.device_type)}
                            Device: {session.device_type || 'Unknown'} - {session.browser || 'Unknown'}
                          </div>
                          {session.ip_address && (
                            <div className="flex items-center gap-2">
                              <MapPinIcon className="h-4 w-4" />
                              IP: {session.ip_address}
                            </div>
                          )}
                          {session.location && (
                            <div className="flex items-center gap-2">
                              <MapPinIcon className="h-4 w-4" />
                              Location: {session.location}
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="mt-3 flex items-center justify-between">
                        <div className="text-xs text-muted-foreground">
                          Session ID: {session.session_id}
                        </div>
                        {!session.is_current_session && (
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleTerminateSession(session.session_id)}
                            className="ml-2"
                          >
                            <XCircleIcon className="h-4 w-4 mr-2" />
                            Terminate
                          </Button>
                        )}
                        {session.is_current_session && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleTerminateSession(session.session_id)}
                            className="ml-2"
                          >
                            <XCircleIcon className="h-4 w-4 mr-2" />
                            Sign Out
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Session History */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MonitorIcon className="h-5 w-5" />
            Session History ({sessions.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <RefreshCwIcon className="h-6 w-6 animate-spin text-muted-foreground" />
              <span className="ml-2">Loading sessions...</span>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <AlertCircleIcon className="h-12 w-12 text-destructive mx-auto mb-4" />
              <p className="text-destructive">{error}</p>
            </div>
          ) : sessions.length === 0 ? (
            <div className="text-center py-12">
              <MonitorIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-lg font-medium">No session history found</p>
              <p className="text-muted-foreground">Your session history will appear here</p>
            </div>
          ) : (
            <div className="space-y-4">
              {sessions.map((session, index) => (
                <div key={session.session_id} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold">Session {index + 1}</h3>
                        <Badge 
                          variant={session.session_status === 'active' ? 'default' : 
                                  session.session_status === 'ended' ? 'secondary' : 'destructive'}
                        >
                          {session.session_status}
                        </Badge>
                        {session.is_current_session && (
                          <Badge variant="outline">Current</Badge>
                        )}
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-muted-foreground">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <ClockIcon className="h-4 w-4" />
                            Started: {formatSessionDate(session.session_started_at)}
                          </div>
                          {session.session_ended_at && (
                            <div className="flex items-center gap-2">
                              <ClockIcon className="h-4 w-4" />
                              Ended: {formatSessionDate(session.session_ended_at)}
                            </div>
                          )}
                          {session.session_expired_at && (
                            <div className="flex items-center gap-2">
                              <ClockIcon className="h-4 w-4" />
                              Expired: {formatSessionDate(session.session_expired_at)}
                            </div>
                          )}
                          {session.duration_minutes && (
                            <div className="flex items-center gap-2">
                              <ClockIcon className="h-4 w-4" />
                              Duration: {Math.round(session.duration_minutes)}m
                            </div>
                          )}
                        </div>
                        
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            {getDeviceIcon(session.device_type)}
                            Device: {session.device_type || 'Unknown'} - {session.browser || 'Unknown'}
                          </div>
                          {session.ip_address && (
                            <div className="flex items-center gap-2">
                              <MapPinIcon className="h-4 w-4" />
                              IP: {session.ip_address}
                            </div>
                          )}
                          {session.refresh_count > 0 && (
                            <div className="flex items-center gap-2">
                              <RefreshCwIcon className="h-4 w-4" />
                              Refreshes: {session.refresh_count}
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="mt-3 text-xs text-muted-foreground">
                        Session ID: {session.session_id}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}