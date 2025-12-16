import { describe, it, expect } from 'vitest';

describe('Session Tracking Performance Tests', () => {
  const EDGE_FUNCTION_URL = 'https://aiveyvvhlfiqhbaqazrr.supabase.co/functions/v1/track-session';
  
  it('should handle session event within acceptable latency', async () => {
    const startTime = performance.now();
    
    const response = await fetch(EDGE_FUNCTION_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer test-token'
      },
      body: JSON.stringify({
        session_id: 'perf-test-' + Date.now(),
        event_type: 'started',
        metadata: { performance_test: true }
      })
    });
    
    const endTime = performance.now();
    const latency = endTime - startTime;
    
    // Should respond within 500ms
    expect(latency).toBeLessThan(500);
    expect(response.status).toBe(200);
  });

  it('should handle burst of events efficiently', async () => {
    const batchSize = 50;
    const startTime = performance.now();
    
    const requests = Array.from({ length: batchSize }, (_, i) =>
      fetch(EDGE_FUNCTION_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer test-token'
        },
        body: JSON.stringify({
          session_id: `burst-test-${Date.now()}-${i}`,
          event_type: 'refreshed',
          metadata: { batch_test: true, index: i }
        })
      })
    );

    const responses = await Promise.all(requests);
    const endTime = performance.now();
    
    // Calculate average latency
    const totalTime = endTime - startTime;
    const avgLatency = totalTime / batchSize;
    
    // Should average less than 100ms per request
    expect(avgLatency).toBeLessThan(100);
    
    // All should succeed
    const successCount = responses.filter(r => r.status === 200).length;
    expect(successCount).toBe(batchSize);
  });

  it('should maintain performance with large metadata', async () => {
    const largeMetadata = {
      device_fingerprint: 'x'.repeat(1000), // 1KB string
      performance_metrics: Array.from({ length: 100 }, (_, i) => ({
        metric: `test_metric_${i}`,
        value: Math.random() * 1000,
        timestamp: Date.now()
      })),
      navigation_history: Array.from({ length: 50 }, (_, i) => ({
        url: `https://example.com/page/${i}`,
        timestamp: Date.now() - (i * 1000),
        duration: Math.random() * 10000
      }))
    };
    
    const startTime = performance.now();
    
    const response = await fetch(EDGE_FUNCTION_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer test-token'
      },
      body: JSON.stringify({
        session_id: 'large-metadata-test-' + Date.now(),
        event_type: 'started',
        metadata: largeMetadata
      })
    });
    
    const endTime = performance.now();
    const latency = endTime - startTime;
    
    // Should still respond within reasonable time even with large payload
    expect(latency).toBeLessThan(1000);
    expect(response.status).toBe(200);
  });
});