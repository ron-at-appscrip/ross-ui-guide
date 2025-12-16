import { withLazyModal } from './LazyLoadingWrapper';

// Lazy-loaded LEDESExportModal with optimized loading
export const LazyLEDESExportModal = withLazyModal(
  () => import('./LEDESExportModal'),
  'Loading LEDES Export...',
  'ledes-export-modal'
);

export default LazyLEDESExportModal;