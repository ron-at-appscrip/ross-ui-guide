/**
 * BillingLazyLoadingExample - Demonstrates comprehensive lazy loading implementation
 * 
 * This component showcases all the lazy loading features implemented for billing components:
 * - Modal lazy loading with preloading on hover
 * - Conditional rendering to avoid loading components until needed
 * - Error boundaries and fallback components
 * - Performance tracking and monitoring
 * 
 * @example
 * ```tsx
 * import { BillingLazyLoadingExample } from '@/components/billing/BillingLazyLoadingExample';
 * 
 * function MyPage() {
 *   return <BillingLazyLoadingExample />;
 * }
 * ```
 */

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  LazyInvoiceGeneratorModal,
  LazyLEDESExportModal,
  LazyLEDESConfigurationModal,
  LazyUnsubmittedEntriesModal,
  useConditionalPreload,
  ComponentPreloader,
  preloadInvoiceGenerator,
  preloadLEDESExport,
  preloadLEDESConfiguration,
  preloadUnsubmittedEntries
} from './LazyComponents';
import { 
  FileText, 
  Download, 
  Settings, 
  AlertCircle,
  Activity,
  Zap
} from 'lucide-react';

export const BillingLazyLoadingExample: React.FC = () => {
  // Modal state management
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [showLEDESExportModal, setShowLEDESExportModal] = useState(false);
  const [showLEDESConfigModal, setShowLEDESConfigModal] = useState(false);
  const [showUnsubmittedModal, setShowUnsubmittedModal] = useState(false);

  // Preloading hook for performance optimization
  const { preload } = useConditionalPreload();

  return (
    <div className="p-6 space-y-6 max-w-4xl mx-auto">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">Billing Components Lazy Loading Demo</h1>
        <p className="text-muted-foreground">
          Demonstrates code-split billing modals with optimized loading
        </p>
        <div className="flex justify-center space-x-2">
          <Badge variant="outline" className="flex items-center space-x-1">
            <Zap className="h-3 w-3" />
            <span>Lazy Loaded</span>
          </Badge>
          <Badge variant="outline" className="flex items-center space-x-1">
            <Activity className="h-3 w-3" />
            <span>Performance Tracked</span>
          </Badge>
        </div>
      </div>

      {/* Component Preloader - loads critical components in background */}
      <ComponentPreloader
        components={[
          {
            key: 'invoice-generator',
            importFn: preloadInvoiceGenerator,
            priority: 'high'
          },
          {
            key: 'ledes-export',
            importFn: preloadLEDESExport,
            priority: 'medium'
          },
          {
            key: 'ledes-config',
            importFn: preloadLEDESConfiguration,
            priority: 'low'
          },
          {
            key: 'unsubmitted-entries',
            importFn: preloadUnsubmittedEntries,
            priority: 'medium'
          }
        ]}
      />

      {/* Modal Trigger Buttons */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <FileText className="h-5 w-5" />
            <span>Billing Operations</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Button
            onClick={() => setShowInvoiceModal(true)}
            onMouseEnter={() => preload('invoice-generator', preloadInvoiceGenerator)}
            className="h-20 flex flex-col space-y-2"
          >
            <FileText className="h-6 w-6" />
            <div className="text-center">
              <div className="font-medium">Generate Invoice</div>
              <div className="text-xs opacity-75">Hover to preload</div>
            </div>
          </Button>

          <Button
            variant="outline"
            onClick={() => setShowLEDESExportModal(true)}
            onMouseEnter={() => preload('ledes-export', preloadLEDESExport)}
            className="h-20 flex flex-col space-y-2"
          >
            <Download className="h-6 w-6" />
            <div className="text-center">
              <div className="font-medium">LEDES Export</div>
              <div className="text-xs opacity-75">Hover to preload</div>
            </div>
          </Button>

          <Button
            variant="outline"
            onClick={() => setShowLEDESConfigModal(true)}
            onMouseEnter={() => preload('ledes-config', preloadLEDESConfiguration)}
            className="h-20 flex flex-col space-y-2"
          >
            <Settings className="h-6 w-6" />
            <div className="text-center">
              <div className="font-medium">LEDES Configuration</div>
              <div className="text-xs opacity-75">Hover to preload</div>
            </div>
          </Button>

          <Button
            variant="outline"
            onClick={() => setShowUnsubmittedModal(true)}
            onMouseEnter={() => preload('unsubmitted-entries', preloadUnsubmittedEntries)}
            className="h-20 flex flex-col space-y-2"
          >
            <AlertCircle className="h-6 w-6" />
            <div className="text-center">
              <div className="font-medium">Unsubmitted Entries</div>
              <div className="text-xs opacity-75">Hover to preload</div>
            </div>
          </Button>
        </CardContent>
      </Card>

      {/* Features Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Lazy Loading Features</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h4 className="font-medium text-sm">Performance Optimizations</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Components load only when needed</li>
                <li>• Preloading on hover for instant feel</li>
                <li>• Bundle size reduction</li>
                <li>• Improved initial page load</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium text-sm">Error Handling</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Error boundaries for each component</li>
                <li>• Graceful fallback components</li>
                <li>• Loading state management</li>
                <li>• Performance monitoring</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lazy-loaded Modals - Only render when state is true */}
      {showInvoiceModal && (
        <LazyInvoiceGeneratorModal
          open={showInvoiceModal}
          onClose={() => setShowInvoiceModal(false)}
        />
      )}

      {showLEDESExportModal && (
        <LazyLEDESExportModal
          open={showLEDESExportModal}
          onClose={() => setShowLEDESExportModal(false)}
        />
      )}

      {showLEDESConfigModal && (
        <LazyLEDESConfigurationModal
          open={showLEDESConfigModal}
          onClose={() => setShowLEDESConfigModal(false)}
        />
      )}

      {showUnsubmittedModal && (
        <LazyUnsubmittedEntriesModal
          open={showUnsubmittedModal}
          onClose={() => setShowUnsubmittedModal(false)}
        />
      )}
    </div>
  );
};

export default BillingLazyLoadingExample;