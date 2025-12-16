import { withLazyLoading, CardLoadingFallback } from './LazyLoadingWrapper';

// Route-based lazy loading for billing pages
export const LazyBillingPage = withLazyLoading(
  () => import('../../pages/dashboard/Billing'),
  CardLoadingFallback,
  undefined,
  'billing-page'
);

export const LazyBillingSettingsPage = withLazyLoading(
  () => import('../../pages/dashboard/BillingSettings'),
  CardLoadingFallback,
  undefined,
  'billing-settings-page'
);

export const LazyBillingTestPage = withLazyLoading(
  () => import('../../pages/dashboard/BillingTest'),
  CardLoadingFallback,
  undefined,
  'billing-test-page'
);

// Preload functions for route-based components
export const preloadBillingPage = () => import('../../pages/dashboard/Billing');
export const preloadBillingSettingsPage = () => import('../../pages/dashboard/BillingSettings');
export const preloadBillingTestPage = () => import('../../pages/dashboard/BillingTest');