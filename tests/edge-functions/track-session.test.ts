import { describe, it, expect, beforeEach } from 'vitest';

// Mock Edge Function testing setup
const EDGE_FUNCTION_URL = 'https://aiveyvvhlfiqhbaqazrr.supabase.co/functions/v1/track-session';

describe('Track Session Edge Function Tests', () => {
  let authToken: string;

  beforeEach(async () => {
    // Get a valid auth token for testing
    // In real tests, you'd use a test user token
    authToken = 'test-jwt-token';
  });

  it('should track session started event successfully', async () => {
    const eventData = {
      session_id: 'test-session-' + Date.now(),
      event_type: 'started',
      metadata: {
        device_type: 'desktop',
        browser: 'chrome',
        test: true
      }
    };

    const response = await fetch(EDGE_FUNCTION_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`,
        'User-Agent': 'Mozilla/5.0 Test Browser'
      },
      body: JSON.stringify(eventData)
    });

    expect(response.status).toBe(200);
    
    const result = await response.json();
    expect(result.success).toBe(true);
    expect(result.event_id).toBeDefined();
    expect(result.message).toContain('logged successfully');
  });

  it('should reject invalid event types', async () => {
    const eventData = {
      session_id: 'test-session-' + Date.now(),
      event_type: 'invalid_type', // Should be rejected
      metadata: {}
    };

    const response = await fetch(EDGE_FUNCTION_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      },
      body: JSON.stringify(eventData)
    });

    expect(response.status).toBe(400);
    
    const result = await response.json();
    expect(result.error).toContain('Invalid event_type');
  });

  it('should require authorization header', async () => {
    const eventData = {
      session_id: 'test-session-' + Date.now(),
      event_type: 'started',
      metadata: {}
    };

    const response = await fetch(EDGE_FUNCTION_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
        // No authorization header
      },
      body: JSON.stringify(eventData)
    });

    expect(response.status).toBe(401);
    
    const result = await response.json();
    expect(result.error).toContain('Authorization header required');
  });

  it('should handle missing required fields', async () => {
    const eventData = {
      // Missing session_id and event_type
      metadata: {}
    };

    const response = await fetch(EDGE_FUNCTION_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      },
      body: JSON.stringify(eventData)
    });

    expect(response.status).toBe(400);
    
    const result = await response.json();
    expect(result.error).toContain('Missing required fields');
  });

  it('should extract client information correctly', async () => {
    const eventData = {
      session_id: 'test-session-' + Date.now(),
      event_type: 'started',
      metadata: {
        custom_field: 'test'
      }
    };

    const response = await fetch(EDGE_FUNCTION_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`,
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'X-Forwarded-For': '203.0.113.123, 192.168.1.1'
      },
      body: JSON.stringify(eventData)
    });

    expect(response.status).toBe(200);
    
    const result = await response.json();
    expect(result.success).toBe(true);
    
    // The function should have detected browser as Chrome and device as desktop
    // This would be verified by checking the database entry
  });

  it('should handle CORS preflight requests', async () => {
    const response = await fetch(EDGE_FUNCTION_URL, {
      method: 'OPTIONS',
      headers: {
        'Origin': 'https://localhost:3000',
        'Access-Control-Request-Method': 'POST',
        'Access-Control-Request-Headers': 'authorization, content-type'
      }
    });

    expect(response.status).toBe(200);
    expect(response.headers.get('Access-Control-Allow-Origin')).toBe('*');
    expect(response.headers.get('Access-Control-Allow-Methods')).toContain('POST');
  });

  it('should handle high concurrent requests', async () => {
    const sessionId = 'concurrent-test-' + Date.now();
    
    // Create multiple concurrent requests
    const requests = Array.from({ length: 10 }, (_, i) => 
      fetch(EDGE_FUNCTION_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify({
          session_id: sessionId + '-' + i,
          event_type: 'started',
          metadata: { concurrent_test: true, index: i }
        })
      })
    );

    const responses = await Promise.all(requests);
    
    // All requests should succeed
    responses.forEach((response, index) => {
      expect(response.status).toBe(200);
    });

    // Verify all got unique event IDs
    const results = await Promise.all(responses.map(r => r.json()));
    const eventIds = results.map(r => r.event_id);
    const uniqueEventIds = new Set(eventIds);
    
    expect(uniqueEventIds.size).toBe(eventIds.length);
  });

  it('should handle malformed JSON gracefully', async () => {
    const response = await fetch(EDGE_FUNCTION_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      },
      body: '{"invalid": json malformed'
    });

    expect(response.status).toBe(500);
    
    const result = await response.json();
    expect(result.error).toContain('Internal server error');
  });
});