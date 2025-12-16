import { describe, it, expect } from 'vitest';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.VITE_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

describe('Session Data Quality Monitoring', () => {
  it('should not have orphaned session events', async () => {
    // Events without a 'started' event for the same session
    const { data: orphanedEvents, error } = await supabase
      .from('session_events')
      .select(`
        session_id,
        event_type,
        count(*) as event_count
      `)
      .neq('event_type', 'started')
      .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()) // Last 24 hours
      .order('session_id');

    expect(error).toBeNull();
    
    if (orphanedEvents && orphanedEvents.length > 0) {
      // Check if these sessions have start events
      for (const event of orphanedEvents) {
        const { data: startEvent } = await supabase
          .from('session_events')
          .select('id')
          .eq('session_id', event.session_id)
          .eq('event_type', 'started')
          .limit(1);
        
        expect(startEvent?.length).toBeGreaterThan(0, 
          `Orphaned session found: ${event.session_id} has ${event.event_type} but no 'started' event`
        );
      }
    }
  });

  it('should not have duplicate session start events', async () => {
    const { data: duplicateStarts, error } = await supabase.rpc('find_duplicate_session_starts');
    
    if (!error && duplicateStarts) {
      expect(duplicateStarts.length).toBe(0, 
        `Found sessions with multiple 'started' events: ${JSON.stringify(duplicateStarts)}`
      );
    }
  });

  it('should have reasonable session durations', async () => {
    const { data: analytics, error } = await supabase
      .from('session_analytics')
      .select('session_id, duration_minutes')
      .not('duration_minutes', 'is', null)
      .gte('session_started_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()); // Last 7 days

    expect(error).toBeNull();
    
    if (analytics) {
      analytics.forEach(session => {
        // No session should be longer than 24 hours (1440 minutes)
        expect(session.duration_minutes).toBeLessThan(1440, 
          `Session ${session.session_id} has unrealistic duration: ${session.duration_minutes} minutes`
        );
        
        // No negative durations
        expect(session.duration_minutes).toBeGreaterThan(0,
          `Session ${session.session_id} has negative duration: ${session.duration_minutes} minutes`
        );
      });
    }
  });

  it('should have valid metadata structure', async () => {
    const { data: events, error } = await supabase
      .from('session_events')
      .select('id, metadata, event_type')
      .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
      .limit(100);

    expect(error).toBeNull();
    
    if (events) {
      events.forEach(event => {
        // Metadata should be a valid object
        expect(typeof event.metadata).toBe('object');
        expect(event.metadata).not.toBeNull();
        
        // Started events should have device info
        if (event.event_type === 'started') {
          expect(event.metadata).toHaveProperty('device_type');
          expect(['mobile', 'tablet', 'desktop', 'unknown']).toContain(event.metadata.device_type);
        }
      });
    }
  });

  it('should not have events with future timestamps', async () => {
    const futureThreshold = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes in future
    
    const { data: futureEvents, error } = await supabase
      .from('session_events')
      .select('id, created_at, event_type')
      .gt('created_at', futureThreshold.toISOString());

    expect(error).toBeNull();
    expect(futureEvents?.length || 0).toBe(0, 
      `Found events with future timestamps: ${JSON.stringify(futureEvents)}`
    );
  });

  it('should maintain referential integrity', async () => {
    // All session events should reference existing users
    const { data: invalidUserRefs, error } = await supabase.rpc('check_session_user_refs');
    
    if (!error) {
      expect(invalidUserRefs?.length || 0).toBe(0,
        `Found session events with invalid user references: ${JSON.stringify(invalidUserRefs)}`
      );
    }
  });

  it('should have analytics view in sync with events', async () => {
    // Get a recent session from analytics
    const { data: recentAnalytics, error: analyticsError } = await supabase
      .from('session_analytics')
      .select('session_id, session_status, refresh_count')
      .eq('session_status', 'active')
      .limit(5);

    expect(analyticsError).toBeNull();
    
    if (recentAnalytics && recentAnalytics.length > 0) {
      for (const analytics of recentAnalytics) {
        // Count actual refresh events
        const { count: actualRefreshes, error: countError } = await supabase
          .from('session_events')
          .select('*', { count: 'exact', head: true })
          .eq('session_id', analytics.session_id)
          .eq('event_type', 'refreshed');

        expect(countError).toBeNull();
        expect(actualRefreshes).toBe(analytics.refresh_count,
          `Analytics refresh count mismatch for session ${analytics.session_id}: analytics=${analytics.refresh_count}, actual=${actualRefreshes}`
        );
      }
    }
  });
});