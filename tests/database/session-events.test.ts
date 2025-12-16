import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { createClient } from '@supabase/supabase-js';

// Test database configuration
const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const supabase = createClient(supabaseUrl, supabaseServiceKey);

describe('Session Events Database Tests', () => {
  const testUserId = 'test-user-' + Date.now();
  const testSessionId = 'test-session-' + Date.now();

  beforeEach(async () => {
    // Create test user in auth.users (if needed for testing)
    // Note: In real tests, you'd use test fixtures
  });

  afterEach(async () => {
    // Clean up test data
    await supabase
      .from('session_events')
      .delete()
      .eq('user_id', testUserId);
  });

  it('should insert session events correctly', async () => {
    const eventData = {
      user_id: testUserId,
      session_id: testSessionId,
      event_type: 'started',
      metadata: {
        device_type: 'desktop',
        browser: 'chrome',
        test: true
      },
      ip_address: '192.168.1.100',
      user_agent: 'Mozilla/5.0 Test Browser'
    };

    const { data, error } = await supabase
      .from('session_events')
      .insert(eventData)
      .select()
      .single();

    expect(error).toBeNull();
    expect(data).toBeDefined();
    expect(data.user_id).toBe(testUserId);
    expect(data.session_id).toBe(testSessionId);
    expect(data.event_type).toBe('started');
    expect(data.metadata.device_type).toBe('desktop');
  });

  it('should enforce event_type constraints', async () => {
    const invalidEventData = {
      user_id: testUserId,
      session_id: testSessionId,
      event_type: 'invalid_event', // Should fail constraint
      metadata: {},
      ip_address: '192.168.1.100',
      user_agent: 'Test'
    };

    const { data, error } = await supabase
      .from('session_events')
      .insert(invalidEventData);

    expect(error).toBeDefined();
    expect(error?.message).toContain('check constraint');
  });

  it('should prevent updates to session_events (immutable)', async () => {
    // First insert an event
    const { data: insertedData } = await supabase
      .from('session_events')
      .insert({
        user_id: testUserId,
        session_id: testSessionId,
        event_type: 'started',
        metadata: { test: true },
        ip_address: '192.168.1.100',
        user_agent: 'Test'
      })
      .select()
      .single();

    expect(insertedData).toBeDefined();

    // Try to update it (should fail)
    const { error } = await supabase
      .from('session_events')
      .update({ event_type: 'ended' })
      .eq('id', insertedData.id);

    expect(error).toBeDefined();
    expect(error?.message).toContain('immutable');
  });

  it('should calculate session analytics correctly', async () => {
    const baseTime = new Date('2024-01-01T10:00:00Z');
    
    // Insert session lifecycle events
    const events = [
      {
        user_id: testUserId,
        session_id: testSessionId,
        event_type: 'started',
        created_at: baseTime.toISOString(),
        metadata: { device_type: 'desktop' },
        ip_address: '192.168.1.100',
        user_agent: 'Chrome'
      },
      {
        user_id: testUserId,
        session_id: testSessionId,
        event_type: 'refreshed',
        created_at: new Date(baseTime.getTime() + 30 * 60 * 1000).toISOString(), // +30min
        metadata: { device_type: 'desktop' },
        ip_address: '192.168.1.100',
        user_agent: 'Chrome'
      },
      {
        user_id: testUserId,
        session_id: testSessionId,
        event_type: 'ended',
        created_at: new Date(baseTime.getTime() + 60 * 60 * 1000).toISOString(), // +60min
        metadata: { device_type: 'desktop' },
        ip_address: '192.168.1.100',
        user_agent: 'Chrome'
      }
    ];

    // Insert all events
    const { error: insertError } = await supabase
      .from('session_events')
      .insert(events);

    expect(insertError).toBeNull();

    // Refresh materialized view
    await supabase.rpc('refresh_session_analytics');

    // Query analytics
    const { data: analytics, error: analyticsError } = await supabase
      .from('session_analytics')
      .select('*')
      .eq('session_id', testSessionId)
      .single();

    expect(analyticsError).toBeNull();
    expect(analytics).toBeDefined();
    expect(analytics.session_status).toBe('ended');
    expect(analytics.duration_minutes).toBe(60); // 1 hour
    expect(analytics.refresh_count).toBe(1);
  });

  it('should handle RPC functions correctly', async () => {
    // Test get_user_session_history function
    const { data, error } = await supabase
      .rpc('get_user_session_history', {
        target_user_id: testUserId,
        page_limit: 10,
        page_offset: 0
      });

    expect(error).toBeNull();
    expect(Array.isArray(data)).toBe(true);
  });

  it('should handle concurrent event insertions', async () => {
    const sessionId1 = testSessionId + '-1';
    const sessionId2 = testSessionId + '-2';

    // Insert multiple events concurrently
    const promises = [
      supabase.from('session_events').insert({
        user_id: testUserId,
        session_id: sessionId1,
        event_type: 'started',
        metadata: { concurrent: true },
        ip_address: '192.168.1.100',
        user_agent: 'Test1'
      }),
      supabase.from('session_events').insert({
        user_id: testUserId,
        session_id: sessionId2,
        event_type: 'started',
        metadata: { concurrent: true },
        ip_address: '192.168.1.101',
        user_agent: 'Test2'
      })
    ];

    const results = await Promise.all(promises);
    
    results.forEach(result => {
      expect(result.error).toBeNull();
    });

    // Verify both events were inserted
    const { data, error } = await supabase
      .from('session_events')
      .select('*')
      .eq('user_id', testUserId)
      .in('session_id', [sessionId1, sessionId2]);

    expect(error).toBeNull();
    expect(data).toHaveLength(2);
  });

  it('should handle large metadata objects', async () => {
    const largeMetadata = {
      device_info: {
        platform: 'MacIntel',
        userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
        language: 'en-US',
        timeZone: 'America/New_York',
        screenResolution: '1920x1080',
        colorDepth: 24,
        pixelRatio: 2
      },
      performance: {
        navigationTiming: {
          loadEventEnd: 1234567890,
          domContentLoadedEventEnd: 1234567880,
          responseEnd: 1234567870
        }
      },
      features: {
        webGL: true,
        webRTC: true,
        localStorage: true,
        sessionStorage: true,
        indexedDB: true
      }
    };

    const { data, error } = await supabase
      .from('session_events')
      .insert({
        user_id: testUserId,
        session_id: testSessionId + '-large',
        event_type: 'started',
        metadata: largeMetadata,
        ip_address: '192.168.1.100',
        user_agent: 'Test Large Metadata'
      })
      .select()
      .single();

    expect(error).toBeNull();
    expect(data.metadata.device_info.platform).toBe('MacIntel');
    expect(data.metadata.performance.navigationTiming.loadEventEnd).toBe(1234567890);
  });
});