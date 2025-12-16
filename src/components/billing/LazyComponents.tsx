// Centralized lazy-loaded billing components
export { default as LazyInvoiceGeneratorModal } from './LazyInvoiceGeneratorModal';
export { default as LazyLEDESExportModal } from './LazyLEDESExportModal';
export { default as LazyLEDESConfigurationModal } from './LazyLEDESConfigurationModal';
export { default as LazyUnsubmittedEntriesModal } from './LazyUnsubmittedEntriesModal';

// Route-based lazy-loaded pages
export {
  LazyBillingPage,
  LazyBillingSettingsPage,
  LazyBillingTestPage,
  preloadBillingPage,
  preloadBillingSettingsPage,
  preloadBillingTestPage
} from './LazyBillingPages';

// Re-export the wrapper utilities for custom lazy loading
export {
  withLazyLoading,
  withLazyModal,
  usePreloadComponent,
  useConditionalPreload,
  ComponentPreloader,
  ModalLoadingFallback,
  InlineLoadingFallback,
  CardLoadingFallback
} from './LazyLoadingWrapper';

// Preload functions for critical components
export const preloadInvoiceGenerator = () => import('./InvoiceGenerator/InvoiceGeneratorModal');
export const preloadLEDESExport = () => import('./LEDESExportModal');
export const preloadLEDESConfiguration = () => import('./LEDESConfigurationModal');
export const preloadUnsubmittedEntries = () => import('./UnsubmittedEntriesModal');