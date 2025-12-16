import { withLazyModal } from './LazyLoadingWrapper';

// Lazy-loaded LEDESConfigurationModal with optimized loading
export const LazyLEDESConfigurationModal = withLazyModal(
  () => import('./LEDESConfigurationModal'),
  'Loading LEDES Configuration...',
  'ledes-configuration-modal'
);

export default LazyLEDESConfigurationModal;