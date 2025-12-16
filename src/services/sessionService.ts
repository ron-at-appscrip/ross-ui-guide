import { supabase } from '@/integrations/supabase/client';
import {
  SessionLog,
  UserSession,
  SessionAnalytics,
  SessionAnalyticsData,
  SessionFilter,
  TeamSessionsResponse,
  SessionStats,
  SessionLogParams,
  SessionTerminateRequest,
  DeviceInfo,
  LocationInfo
} from '@/types/session';

export type { SessionAnalyticsData };

export const sessionService = {
  /**
   * Extract session ID from JWT token
   */
  extractSessionIdFromJWT(accessToken: string): string {
    try {
      // JWT has 3 parts separated by dots
      const parts = accessToken.split('.');
      if (parts.length !== 3) {
        throw new Error('Invalid JWT format');
      }
      
      // Decode the payload (second part)
      const payload = JSON.parse(atob(parts[1]));
      
      // Supabase JWT contains session_id claim
      return payload.session_id || `session_${payload.sub}_${payload.iat}`;
    } catch (error) {
      console.warn('Failed to extract session_id from JWT:', error);
      // Fallback to a generated session ID
      return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
  },

  /**
   * Get approximate IP address (note: limited by browser security)
   */
  async getApproximateIP(): Promise<string> {
    try {
      // Try to get IP from a public service (this will work in dev)
      const response = await fetch('https://api.ipify.org?format=json', {
        signal: AbortSignal.timeout(3000)
      });
      const data = await response.json();
      return data.ip || 'Unknown';
    } catch (error) {
      console.log('Could not fetch external IP:', error);
      // Fallback to WebRTC method (may not work in all browsers)
      try {
        return await this.getIPFromWebRTC();
      } catch (webrtcError) {
        console.log('WebRTC IP detection failed:', webrtcError);
        return 'Not available';
      }
    }
  },

  /**
   * Try to get local IP using WebRTC (fallback method)
   */
  getIPFromWebRTC(): Promise<string> {
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('WebRTC IP detection timeout'));
      }, 5000);

      try {
        const pc = new RTCPeerConnection({
          iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
        });

        pc.createDataChannel('');

        pc.onicecandidate = (ice) => {
          if (ice && ice.candidate && ice.candidate.candidate) {
            const candidate = ice.candidate.candidate;
            const ipMatch = candidate.match(/([0-9]{1,3}\.){3}[0-9]{1,3}/);
            if (ipMatch) {
              clearTimeout(timeout);
              pc.close();
              resolve(ipMatch[0]);
              return;
            }
          }
        };

        pc.createOffer()
          .then(offer => pc.setLocalDescription(offer))
          .catch(reject);
      } catch (error) {
        clearTimeout(timeout);
        reject(error);
      }
    });
  },
  /**
   * Log a session event (login, logout, refresh, terminate)
   */
  async logSessionEvent(params: SessionLogParams): Promise<SessionLog> {
    try {
      const { data, error } = await supabase.rpc('log_session_event', {
        p_session_id: params.session_id,
        p_user_id: params.user_id,
        p_event_type: params.event_type,
        p_ip_address: params.ip_address || null,
        p_user_agent: params.user_agent || null,
        p_device_info: params.device_info || {},
        p_location_info: params.location_info || {},
        p_metadata: params.metadata || {}
      });

      if (error) {
        console.error('Error logging session event:', error);
        throw new Error(`Failed to log session event: ${error.message}`);
      }

      // Fetch the created session log
      const { data: sessionLog, error: fetchError } = await supabase
        .from('session_logs')
        .select('*')
        .eq('id', data)
        .single();

      if (fetchError) {
        console.error('Error fetching session log:', fetchError);
        throw new Error(`Failed to fetch session log: ${fetchError.message}`);
      }

      return sessionLog;
    } catch (error) {
      console.error('Session event logging failed:', error);
      throw error;
    }
  },

  /**
   * Get team sessions for organization admins
   */
  async getTeamSessions(
    organizationId: string,
    filter: SessionFilter = {}
  ): Promise<TeamSessionsResponse> {
    try {
      const { data, error } = await supabase.rpc('get_team_sessions', {
        p_organization_id: organizationId,
        p_limit: filter.limit || 50,
        p_offset: filter.offset || 0
      });

      if (error) {
        console.error('Error fetching team sessions:', error);
        throw new Error(`Failed to fetch team sessions: ${error.message}`);
      }

      const sessions: UserSession[] = data || [];
      
      // Apply additional client-side filtering if needed
      let filteredSessions = sessions;
      
      if (filter.search_term) {
        const term = filter.search_term.toLowerCase();
        filteredSessions = sessions.filter(session =>
          session.user_email.toLowerCase().includes(term) ||
          session.user_name.toLowerCase().includes(term) ||
          session.ip_address?.toString().includes(term)
        );
      }

      if (filter.is_active !== undefined) {
        filteredSessions = filteredSessions.filter(session =>
          session.is_active === filter.is_active
        );
      }

      return {
        sessions: filteredSessions,
        total_count: filteredSessions.length,
        has_more: filteredSessions.length === (filter.limit || 50)
      };
    } catch (error) {
      console.error('Error getting team sessions:', error);
      throw error;
    }
  },

  /**
   * Get user's own sessions - using localStorage for session tracking demo
   */
  async getUserSessions(filter: SessionFilter = {}): Promise<UserSession[]> {
    try {
      // Get current user and session
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        throw new Error('User not authenticated');
      }

      const { data: { session: currentSession } } = await supabase.auth.getSession();
      if (!currentSession) {
        console.log('No current session found');
        return [];
      }

      console.log('=== SESSION DEBUG START ===');
      console.log('User ID:', user.id);
      console.log('Session object keys:', Object.keys(currentSession));
      console.log('Access token (first 50 chars):', currentSession.access_token?.substring(0, 50) + '...');
      console.log('Refresh token (first 20 chars):', currentSession.refresh_token?.substring(0, 20) + '...');
      console.log('Session expires at:', currentSession.expires_at);
      console.log('Session expires in:', currentSession.expires_in);
      
      // Try to extract session ID from JWT
      const sessionId = currentSession.access_token ? 
        this.extractSessionIdFromJWT(currentSession.access_token) : 
        `session_${user.id}_${Date.now()}`;
      console.log('Extracted/Generated Session ID:', sessionId);
      console.log('=== SESSION DEBUG END ===');

      // Get stored sessions from localStorage for this user
      const storedSessions = this.getStoredSessions(user.id);
      console.log('Existing stored sessions:', storedSessions.length, storedSessions);
      
      // Check if current session is already stored
      const currentSessionExists = storedSessions.find(s => s.session_id === sessionId);
      
      if (!currentSessionExists) {
        // Create session with current timestamp since we're tracking when we first see it
        const now = new Date();
        const sessionCreatedAt = now.toISOString();
        const sessionUpdatedAt = now.toISOString();
        
        console.log('Creating new session entry at:', sessionCreatedAt);
        
        // Get IP address (this will be async)
        const ipAddress = await this.getApproximateIP();
        console.log('Detected IP address:', ipAddress);
        
        // Store current session
        const newSession: UserSession = {
          session_id: sessionId,
          user_id: user.id,
          user_email: user.email || '',
          user_name: user.user_metadata?.full_name || user.email || '',
          created_at: sessionCreatedAt,
          updated_at: sessionUpdatedAt,
          ip_address: ipAddress,
          user_agent: navigator?.userAgent || 'Unknown',
          is_active: true,
          is_current: true
        };
        
        console.log('New session object:', newSession);
        this.storeSession(user.id, newSession);
        storedSessions.push(newSession);
        
        // Also initialize event tracking for this session
        try {
          await this.initializeSessionTracking();
        } catch (trackingError) {
          console.warn('Failed to initialize session tracking:', trackingError);
        }
      }

      // Mark current session and update active status
      const userSessions = storedSessions.map(session => ({
        ...session,
        is_current: session.session_id === sessionId,
        is_active: session.session_id === sessionId, // For demo, only current is active
        updated_at: session.session_id === sessionId ? new Date().toISOString() : session.updated_at
      }));

      // Sort by most recent first
      userSessions.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

      console.log('=== FINAL SESSIONS ===');
      console.log('Total sessions:', userSessions.length);
      userSessions.forEach((session, index) => {
        console.log(`Session ${index + 1}:`, {
          id: session.session_id,
          created_at: session.created_at,
          is_current: session.is_current,
          is_active: session.is_active
        });
      });
      console.log('=== END FINAL SESSIONS ===');
      
      return userSessions;
    } catch (error) {
      console.error('Error getting user sessions:', error);
      return [];
    }
  },

  /**
   * Helper functions for localStorage session management
   */
  getStoredSessions(userId: string): UserSession[] {
    try {
      const key = `user_sessions_${userId}`;
      const stored = localStorage.getItem(key);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Error reading stored sessions:', error);
      return [];
    }
  },

  storeSession(userId: string, session: UserSession): void {
    try {
      const key = `user_sessions_${userId}`;
      const existing = this.getStoredSessions(userId);
      
      console.log('Storing session - before:', existing.length);
      
      // Avoid duplicates
      const filtered = existing.filter(s => s.session_id !== session.session_id);
      filtered.push(session);
      
      // Keep only last 10 sessions
      if (filtered.length > 10) {
        filtered.splice(0, filtered.length - 10);
      }
      
      console.log('Storing session - after:', filtered.length);
      console.log('Storage key:', key);
      console.log('Session being stored:', session);
      
      localStorage.setItem(key, JSON.stringify(filtered));
      
      // Verify it was stored
      const verification = localStorage.getItem(key);
      console.log('Verification - stored successfully:', verification ? 'YES' : 'NO');
    } catch (error) {
      console.error('Error storing session:', error);
    }
  },

  clearStoredSessions(userId: string): void {
    try {
      const key = `user_sessions_${userId}`;
      localStorage.removeItem(key);
    } catch (error) {
      console.error('Error clearing stored sessions:', error);
    }
  },

  /**
   * Terminate a user session (admin only)
   */
  async terminateSession(request: SessionTerminateRequest): Promise<boolean> {
    try {
      const { data, error } = await supabase.rpc('terminate_user_session', {
        p_session_id: request.session_id,
        p_organization_id: request.organization_id
      });

      if (error) {
        console.error('Error terminating session:', error);
        throw new Error(`Failed to terminate session: ${error.message}`);
      }

      return data === true;
    } catch (error) {
      console.error('Error terminating session:', error);
      throw error;
    }
  },

  /**
   * Get session logs with filtering
   */
  async getSessionLogs(filter: SessionFilter = {}): Promise<SessionLog[]> {
    try {
      let query = supabase
        .from('session_logs')
        .select('*')
        .order('created_at', { ascending: false });

      if (filter.user_id) {
        query = query.eq('user_id', filter.user_id);
      }

      if (filter.organization_id) {
        query = query.eq('organization_id', filter.organization_id);
      }

      if (filter.event_type) {
        query = query.eq('event_type', filter.event_type);
      }

      if (filter.start_date) {
        query = query.gte('created_at', filter.start_date);
      }

      if (filter.end_date) {
        query = query.lte('created_at', filter.end_date);
      }

      if (filter.limit) {
        query = query.limit(filter.limit);
      }

      if (filter.offset) {
        query = query.range(filter.offset, filter.offset + (filter.limit || 50) - 1);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching session logs:', error);
        throw new Error(`Failed to fetch session logs: ${error.message}`);
      }

      return data || [];
    } catch (error) {
      console.error('Error getting session logs:', error);
      throw error;
    }
  },

  /**
   * Get session analytics for an organization
   */
  async getSessionAnalytics(
    organizationId: string,
    days: number = 30
  ): Promise<SessionStats> {
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      // Get basic session analytics
      const { data: analyticsData, error: analyticsError } = await supabase
        .from('session_analytics')
        .select('*')
        .eq('organization_id', organizationId)
        .gte('date', startDate.toISOString().split('T')[0]);

      if (analyticsError) {
        console.error('Error fetching session analytics:', analyticsError);
        throw new Error(`Failed to fetch session analytics: ${analyticsError.message}`);
      }

      // Get recent session logs for additional insights
      const { data: logsData, error: logsError } = await supabase
        .from('session_logs')
        .select('*')
        .eq('organization_id', organizationId)
        .gte('created_at', startDate.toISOString())
        .order('created_at', { ascending: false });

      if (logsError) {
        console.error('Error fetching session logs for analytics:', logsError);
        throw new Error(`Failed to fetch session logs: ${logsError.message}`);
      }

      // Calculate statistics
      const analytics = analyticsData || [];
      const logs = logsData || [];

      const totalSessions = analytics.reduce((sum, day) => sum + day.total_sessions, 0);
      const activeSessions = analytics.reduce((sum, day) => sum + day.active_sessions, 0);
      const totalUsers = new Set(logs.map(log => log.user_id)).size;
      const recentLogins = logs.filter(log => log.event_type === 'login').length;

      // Group devices by type
      const devicesByType: Record<string, number> = {};
      logs.forEach(log => {
        const deviceType = log.device_info?.device_type || 'unknown';
        devicesByType[deviceType] = (devicesByType[deviceType] || 0) + 1;
      });

      // Group sessions by day
      const sessionsByDay = analytics.map(day => ({
        date: day.date,
        count: day.total_sessions
      }));

      return {
        total_sessions: totalSessions,
        active_sessions: activeSessions,
        total_users: totalUsers,
        active_users: activeSessions, // Approximate
        recent_logins: recentLogins,
        devices_by_type: devicesByType,
        sessions_by_day: sessionsByDay
      };
    } catch (error) {
      console.error('Error getting session analytics:', error);
      throw error;
    }
  },

  /**
   * Helper to get client device and location information
   */
  getClientInfo(): { device_info: DeviceInfo; location_info: LocationInfo; ip_address?: string; user_agent?: string } {
    if (typeof window === 'undefined') {
      return { device_info: {}, location_info: {} }; // Server-side
    }

    const device_info: DeviceInfo = {
      is_mobile: /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent),
      is_tablet: /iPad|Android(?!.*Mobile)/i.test(navigator.userAgent),
      is_desktop: !/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
    };

    device_info.device_type = device_info.is_mobile ? 'mobile' : 
                              device_info.is_tablet ? 'tablet' : 'desktop';

    // Get basic browser info
    const userAgent = navigator.userAgent;
    if (userAgent.includes('Chrome')) {
      device_info.browser = 'Chrome';
    } else if (userAgent.includes('Firefox')) {
      device_info.browser = 'Firefox';
    } else if (userAgent.includes('Safari')) {
      device_info.browser = 'Safari';
    } else if (userAgent.includes('Edge')) {
      device_info.browser = 'Edge';
    }

    const location_info: LocationInfo = {
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
    };

    return {
      device_info,
      location_info,
      user_agent: userAgent
    };
  },

  /**
   * Convenience methods for logging common session events
   * Note: These are simplified since we're using auth.sessions directly
   */
  async logLogin(userId: string, sessionId: string): Promise<void> {
    console.log('Login event logged for user:', userId, 'session:', sessionId);
    
    // Track in new event system
    await this.trackSessionEvent({
      session_id: sessionId,
      event_type: 'started',
      metadata: {
        login_method: 'manual',
        user_id: userId,
        ...this.getClientInfo().device_info
      }
    });
  },

  async logLogout(userId: string, sessionId: string): Promise<void> {
    console.log('Logout event logged for user:', userId, 'session:', sessionId);
    
    // Track session end
    await this.trackSessionEnd(sessionId);
  },

  async logRefresh(userId: string, sessionId: string): Promise<void> {
    console.log('Refresh event logged for user:', userId, 'session:', sessionId);
    
    // Track session refresh
    await this.trackSessionRefresh(sessionId);
  },

  /**
   * Initialize session tracking for current session
   */
  async initializeSessionTracking(): Promise<void> {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const sessionId = this.extractSessionIdFromJWT(session.access_token);
      const clientInfo = this.getClientInfo();
      
      await this.trackSessionEvent({
        session_id: sessionId,
        event_type: 'started',
        metadata: {
          initialization: true,
          ...clientInfo.device_info
        }
      });
    } catch (error) {
      console.error('Failed to initialize session tracking:', error);
    }
  },

  /**
   * Track session end event
   */
  async trackSessionEnd(sessionId: string): Promise<void> {
    try {
      await this.trackSessionEvent({
        session_id: sessionId,
        event_type: 'ended',
        metadata: {
          ended_by: 'user_logout'
        }
      });
    } catch (error) {
      console.error('Failed to track session end:', error);
    }
  },

  /**
   * Track session refresh event
   */
  async trackSessionRefresh(sessionId: string): Promise<void> {
    try {
      await this.trackSessionEvent({
        session_id: sessionId,
        event_type: 'refreshed',
        metadata: {
          refresh_time: new Date().toISOString()
        }
      });
    } catch (error) {
      console.error('Failed to track session refresh:', error);
    }
  },

  /**
   * Track generic session event
   */
  async trackSessionEvent(params: {
    session_id: string;
    event_type: 'started' | 'ended' | 'refreshed' | 'expired';
    metadata?: Record<string, any>;
  }): Promise<void> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const clientInfo = this.getClientInfo();
      const ipAddress = await this.getApproximateIP();

      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/track-session`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`
        },
        body: JSON.stringify({
          session_id: params.session_id,
          event_type: params.event_type,
          ip_address: ipAddress,
          user_agent: clientInfo.user_agent,
          device_info: clientInfo.device_info,
          location_info: clientInfo.location_info,
          metadata: params.metadata || {}
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      console.log(`Session ${params.event_type} event tracked for session:`, params.session_id);
    } catch (error) {
      console.error('Failed to track session event:', error);
      // Don't throw - this is background tracking
    }
  },

  /**
   * Get session history using event-based tracking
   */
  async getSessionHistory(limit: number = 50, offset: number = 0): Promise<SessionAnalyticsData[]> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      // Try to get session analytics from materialized view
      const { data, error } = await supabase
        .from('session_analytics')
        .select('*')
        .eq('user_id', user.id)
        .order('session_started_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) {
        console.error('Error getting session history:', error);
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Failed to get session history:', error);
      throw error;
    }
  },

  /**
   * Get currently active sessions
   */
  async getActiveSessions(): Promise<SessionAnalyticsData[]> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      // Get active sessions from analytics view
      const { data, error } = await supabase
        .from('session_analytics')
        .select('*')
        .eq('user_id', user.id)
        .eq('session_status', 'active')
        .order('last_activity_at', { ascending: false });

      if (error) {
        console.error('Error getting active sessions:', error);
        throw error;
      }

      // Mark current session
      const { data: { session: currentSession } } = await supabase.auth.getSession();
      const currentSessionId = currentSession ? 
        this.extractSessionIdFromJWT(currentSession.access_token) : null;

      return (data || []).map(session => ({
        ...session,
        is_current_session: session.session_id === currentSessionId
      }));
    } catch (error) {
      console.error('Failed to get active sessions:', error);
      throw error;
    }
  },

  /**
   * Get session statistics
   */
  async getSessionStats(days: number = 30): Promise<SessionStats | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      // Get session analytics for the specified period
      const { data, error } = await supabase
        .from('session_analytics')
        .select('*')
        .eq('user_id', user.id)
        .gte('session_started_at', startDate.toISOString());

      if (error) {
        console.error('Error getting session stats:', error);
        throw error;
      }

      const sessions = data || [];
      const activeSessions = sessions.filter(s => s.session_status === 'active');
      const completedSessions = sessions.filter(s => s.duration_minutes > 0);
      
      // Calculate average duration
      const totalDuration = completedSessions.reduce((sum, s) => sum + (s.duration_minutes || 0), 0);
      const averageDuration = completedSessions.length > 0 ? totalDuration / completedSessions.length : 0;

      // Count unique devices
      const uniqueDevices = new Set(sessions.map(s => `${s.device_type}-${s.browser}`)).size;

      return {
        total_sessions: sessions.length,
        active_sessions: activeSessions.length,
        average_duration_minutes: averageDuration,
        unique_devices: uniqueDevices
      };
    } catch (error) {
      console.error('Failed to get session stats:', error);
      throw error;
    }
  },

  /**
   * Setup auth state change listener for automatic session tracking
   */
  setupAuthStateListener(): { unsubscribe: () => void } {
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state change:', event, session?.access_token ? 'has_token' : 'no_token');
      
      try {
        switch (event) {
          case 'SIGNED_IN':
            if (session) {
              const sessionId = this.extractSessionIdFromJWT(session.access_token);
              await this.logLogin(session.user.id, sessionId);
            }
            break;
            
          case 'SIGNED_OUT':
            // Note: session will be null here, so we can't track the specific session
            console.log('User signed out - session tracking ended');
            break;
            
          case 'TOKEN_REFRESHED':
            if (session) {
              const sessionId = this.extractSessionIdFromJWT(session.access_token);
              await this.logRefresh(session.user.id, sessionId);
            }
            break;
            
          case 'USER_UPDATED':
            // Optional: track user updates
            console.log('User updated, session may have changed');
            break;
        }
      } catch (error) {
        console.error('Error in auth state change handler:', error);
      }
    });
    
    return {
      unsubscribe: () => {
        authListener.subscription.unsubscribe();
      }
    };
  }
};