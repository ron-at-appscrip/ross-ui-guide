// Bundle analysis utilities for monitoring lazy loading effectiveness
import React from 'react';

export interface ChunkInfo {
  name: string;
  size: number;
  loadTime?: number;
  isLoaded: boolean;
}

class BundleAnalyzer {
  private chunks: Map<string, ChunkInfo> = new Map();
  private loadStartTimes: Map<string, number> = new Map();

  // Track when a chunk starts loading
  trackChunkLoadStart(chunkName: string) {
    if (typeof performance !== 'undefined') {
      this.loadStartTimes.set(chunkName, performance.now());
    }
  }

  // Track when a chunk finishes loading
  trackChunkLoadEnd(chunkName: string, size?: number) {
    const startTime = this.loadStartTimes.get(chunkName);
    const loadTime = startTime ? performance.now() - startTime : undefined;

    this.chunks.set(chunkName, {
      name: chunkName,
      size: size || 0,
      loadTime,
      isLoaded: true
    });

    this.loadStartTimes.delete(chunkName);

    // Log performance in development
    if (process.env.NODE_ENV === 'development' && loadTime) {
      console.log(`📦 Lazy chunk "${chunkName}" loaded in ${loadTime.toFixed(2)}ms`);
    }
  }

  // Get analytics for all chunks
  getAnalytics() {
    const chunks = Array.from(this.chunks.values());
    const totalSize = chunks.reduce((sum, chunk) => sum + chunk.size, 0);
    const averageLoadTime = chunks
      .filter(chunk => chunk.loadTime)
      .reduce((sum, chunk, _, arr) => sum + (chunk.loadTime! / arr.length), 0);

    return {
      totalChunks: chunks.length,
      totalSize,
      averageLoadTime,
      chunks: chunks.sort((a, b) => (b.loadTime || 0) - (a.loadTime || 0))
    };
  }

  // Log performance summary
  logPerformanceSummary() {
    if (process.env.NODE_ENV !== 'development') return;

    const analytics = this.getAnalytics();
    
    console.group('📊 Bundle Performance Summary');
    console.log(`Total lazy chunks loaded: ${analytics.totalChunks}`);
    console.log(`Average load time: ${analytics.averageLoadTime.toFixed(2)}ms`);
    
    if (analytics.chunks.length > 0) {
      console.log('Slowest chunks:');
      analytics.chunks.slice(0, 5).forEach(chunk => {
        if (chunk.loadTime) {
          console.log(`  • ${chunk.name}: ${chunk.loadTime.toFixed(2)}ms`);
        }
      });
    }
    
    console.groupEnd();
  }

  // Check if bundle splitting is effective
  analyzeBundleEffectiveness() {
    const analytics = this.getAnalytics();
    const recommendations: string[] = [];

    // Check for chunks that load too quickly (might not need splitting)
    const quickChunks = analytics.chunks.filter(chunk => 
      chunk.loadTime && chunk.loadTime < 10
    );
    
    if (quickChunks.length > 0) {
      recommendations.push(
        `Consider bundling these fast-loading chunks: ${quickChunks.map(c => c.name).join(', ')}`
      );
    }

    // Check for chunks that load too slowly
    const slowChunks = analytics.chunks.filter(chunk => 
      chunk.loadTime && chunk.loadTime > 1000
    );
    
    if (slowChunks.length > 0) {
      recommendations.push(
        `Consider further splitting these slow chunks: ${slowChunks.map(c => c.name).join(', ')}`
      );
    }

    return {
      isEffective: recommendations.length === 0,
      recommendations
    };
  }
}

// Global bundle analyzer instance
export const bundleAnalyzer = new BundleAnalyzer();

// HOC to track component loading performance
export function withLoadTracking<T extends object>(
  Component: React.ComponentType<T>,
  chunkName: string
) {
  return React.forwardRef<any, T>((props, ref) => {
    React.useEffect(() => {
      bundleAnalyzer.trackChunkLoadEnd(chunkName);
    }, []);

    return React.createElement(Component, { ...props, ref });
  });
}

// Hook to track lazy loading performance
export function useLazyLoadTracking(chunkName: string) {
  React.useEffect(() => {
    bundleAnalyzer.trackChunkLoadStart(chunkName);
    
    return () => {
      bundleAnalyzer.trackChunkLoadEnd(chunkName);
    };
  }, [chunkName]);
}

// Development-only performance monitoring
export function initPerformanceMonitoring() {
  if (process.env.NODE_ENV !== 'development') return;

  // Log performance summary when page becomes hidden (user navigates away)
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      bundleAnalyzer.logPerformanceSummary();
    }
  });

  // Log performance summary on page unload
  window.addEventListener('beforeunload', () => {
    bundleAnalyzer.logPerformanceSummary();
  });

  // Periodic analysis in development
  setInterval(() => {
    const analysis = bundleAnalyzer.analyzeBundleEffectiveness();
    if (!analysis.isEffective && analysis.recommendations.length > 0) {
      console.group('🔧 Bundle Optimization Recommendations');
      analysis.recommendations.forEach(rec => console.log(`• ${rec}`));
      console.groupEnd();
    }
  }, 30000); // Check every 30 seconds
}