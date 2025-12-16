import { withLazyModal } from './LazyLoadingWrapper';

// Lazy-loaded UnsubmittedEntriesModal with optimized loading
export const LazyUnsubmittedEntriesModal = withLazyModal(
  () => import('./UnsubmittedEntriesModal'),
  'Loading Unsubmitted Entries...',
  'unsubmitted-entries-modal'
);

export default LazyUnsubmittedEntriesModal;