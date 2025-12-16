import { withLazyModal } from './LazyLoadingWrapper';

// Lazy-loaded InvoiceGeneratorModal with optimized loading
export const LazyInvoiceGeneratorModal = withLazyModal(
  () => import('./InvoiceGenerator/InvoiceGeneratorModal'),
  'Loading Invoice Generator...',
  'invoice-generator-modal'
);

export default LazyInvoiceGeneratorModal;