import React, { Suspense, lazy, ComponentType } from 'react';
import { BillingErrorBoundary } from './ErrorBoundary';
import { bundleAnalyzer } from '../../utils/bundleAnalysis';

// Loading fallback components for different modal types
export const ModalLoadingFallback: React.FC<{ title?: string }> = ({ title = "Loading..." }) => (
  <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center">
    <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-lg">
      <div className="text-center space-y-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
        <div className="space-y-2">
          <div className="text-lg font-semibold">{title}</div>
          <div className="text-sm text-muted-foreground">Please wait while we load the component...</div>
        </div>
      </div>
    </div>
  </div>
);

export const InlineLoadingFallback: React.FC<{ height?: number }> = ({ height = 200 }) => (
  <div className="flex items-center justify-center" style={{ height: `${height}px` }}>
    <div className="text-center space-y-3">
      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto"></div>
      <div className="text-sm text-muted-foreground">Loading component...</div>
    </div>
  </div>
);

export const CardLoadingFallback: React.FC = () => (
  <div className="border rounded-lg p-6">
    <div className="animate-pulse space-y-4">
      <div className="h-4 bg-gray-200 rounded w-1/4"></div>
      <div className="space-y-2">
        <div className="h-4 bg-gray-200 rounded"></div>
        <div className="h-4 bg-gray-200 rounded w-5/6"></div>
      </div>
      <div className="flex space-x-2">
        <div className="h-8 bg-gray-200 rounded w-20"></div>
        <div className="h-8 bg-gray-200 rounded w-20"></div>
      </div>
    </div>
  </div>
);

// Generic lazy loading wrapper with error boundary and suspense
export function withLazyLoading<T extends object>(
  importFn: () => Promise<{ default: ComponentType<T> }>,
  fallbackComponent?: React.ComponentType,
  errorFallback?: React.ReactNode,
  chunkName?: string
) {
  const LazyComponent = lazy(() => {
    if (chunkName) {
      bundleAnalyzer.trackChunkLoadStart(chunkName);
    }
    
    return importFn().then(module => {
      if (chunkName) {
        bundleAnalyzer.trackChunkLoadEnd(chunkName);
      }
      return module;
    }).catch(error => {
      if (chunkName) {
        bundleAnalyzer.trackChunkLoadEnd(chunkName);
      }
      throw error;
    });
  });
  
  return React.forwardRef<any, T>((props, ref) => (
    <BillingErrorBoundary fallbackComponent={errorFallback}>
      <Suspense fallback={fallbackComponent ? React.createElement(fallbackComponent) : <ModalLoadingFallback />}>
        <LazyComponent {...props} ref={ref} />
      </Suspense>
    </BillingErrorBoundary>
  ));
}

// Specialized wrapper for modal components
export function withLazyModal<T extends object>(
  importFn: () => Promise<{ default: ComponentType<T> }>,
  modalTitle?: string,
  chunkName?: string
) {
  return withLazyLoading(
    importFn,
    () => <ModalLoadingFallback title={modalTitle} />,
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-lg">
        <div className="text-center space-y-4">
          <div className="text-red-600 text-lg font-semibold">Error Loading Component</div>
          <div className="text-sm text-muted-foreground">
            Failed to load the modal component. Please refresh and try again.
          </div>
        </div>
      </div>
    </div>,
    chunkName
  );
}

// Hook for preloading components
export function usePreloadComponent(importFn: () => Promise<any>) {
  React.useEffect(() => {
    // Preload on mount with a slight delay to avoid blocking initial render
    const timer = setTimeout(() => {
      importFn().catch(console.error);
    }, 100);

    return () => clearTimeout(timer);
  }, [importFn]);
}

// Hook for conditional preloading (e.g., on hover)
export function useConditionalPreload() {
  const preloadedComponents = React.useRef(new Set<string>());

  const preload = React.useCallback((
    key: string, 
    importFn: () => Promise<any>
  ) => {
    if (!preloadedComponents.current.has(key)) {
      preloadedComponents.current.add(key);
      importFn().catch(console.error);
    }
  }, []);

  return { preload };
}

// Component preloader for critical components
export const ComponentPreloader: React.FC<{
  components: Array<{
    key: string;
    importFn: () => Promise<any>;
    priority?: 'high' | 'medium' | 'low';
  }>;
}> = ({ components }) => {
  React.useEffect(() => {
    // Sort by priority and preload
    const sortedComponents = components.sort((a, b) => {
      const priorityOrder = { high: 0, medium: 1, low: 2 };
      return priorityOrder[a.priority || 'medium'] - priorityOrder[b.priority || 'medium'];
    });

    sortedComponents.forEach((component, index) => {
      setTimeout(() => {
        component.importFn().catch(console.error);
      }, index * 50); // Stagger preloading
    });
  }, [components]);

  return null;
};