import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

/**
 * Skeleton loader component for the LEDES Export Modal
 * Matches the complex tabbed structure with configuration, filters, preview, and validation
 */
export const LEDESExportSkeleton = React.memo(() => {
  return (
    <div className="space-y-4">
      {/* Progress bar skeleton when exporting */}
      <div className="animate-pulse mb-4">
        <div className="flex items-center space-x-2 mb-2">
          <div className="h-4 w-4 bg-muted rounded-full"></div>
          <div className="h-4 bg-muted rounded w-48"></div>
        </div>
        <div className="h-2 bg-muted rounded-full w-full"></div>
      </div>

      <Tabs defaultValue="configuration" className="flex-1">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="configuration" disabled>Configuration</TabsTrigger>
          <TabsTrigger value="filters" disabled>Filters</TabsTrigger>
          <TabsTrigger value="preview" disabled>Preview</TabsTrigger>
          <TabsTrigger value="validation" disabled>Validation</TabsTrigger>
        </TabsList>

        <div className="animate-pulse">
          <TabsContent value="configuration" className="space-y-4 mt-4">
            <Card>
              <CardHeader>
                <div className="flex items-center space-x-2">
                  <div className="h-5 w-5 bg-muted rounded"></div>
                  <div className="h-5 bg-muted rounded w-32"></div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Configuration Select */}
                <div className="space-y-2">
                  <div className="h-4 bg-muted rounded w-32"></div>
                  <div className="h-10 bg-muted rounded w-full"></div>
                  <div className="p-3 bg-muted/30 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div className="space-y-2">
                        <div className="h-5 bg-muted rounded w-48"></div>
                        <div className="h-4 bg-muted/60 rounded w-64"></div>
                      </div>
                      <div className="h-6 bg-muted rounded-full w-16"></div>
                    </div>
                  </div>
                </div>

                {/* Export Options */}
                <div className="space-y-3">
                  <div className="h-4 bg-muted rounded w-24"></div>
                  <div className="grid grid-cols-2 gap-4">
                    {Array.from({ length: 6 }).map((_, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <div className="h-4 w-4 bg-muted rounded"></div>
                        <div className="h-4 bg-muted/60 rounded w-32"></div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="filters" className="space-y-4 mt-4">
            <Card>
              <CardHeader>
                <div className="flex items-center space-x-2">
                  <div className="h-5 w-5 bg-muted rounded"></div>
                  <div className="h-5 bg-muted rounded w-24"></div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Date Range */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="h-4 bg-muted rounded w-20"></div>
                    <div className="h-10 bg-muted rounded w-full"></div>
                  </div>
                  <div className="space-y-2">
                    <div className="h-4 bg-muted rounded w-16"></div>
                    <div className="h-10 bg-muted rounded w-full"></div>
                  </div>
                </div>

                {/* Additional Filters */}
                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="h-4 bg-muted rounded w-24"></div>
                    <div className="h-10 bg-muted rounded w-full"></div>
                  </div>
                  <div className="space-y-2">
                    <div className="h-4 bg-muted rounded w-28"></div>
                    <div className="h-10 bg-muted rounded w-full"></div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="preview" className="space-y-4 mt-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="h-5 w-5 bg-muted rounded"></div>
                    <div className="h-5 bg-muted rounded w-24"></div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-1">
                      <div className="h-4 w-4 bg-muted rounded"></div>
                      <div className="h-4 bg-muted rounded w-16"></div>
                    </div>
                    <div className="flex items-center space-x-1">
                      <div className="h-4 w-4 bg-muted rounded"></div>
                      <div className="h-4 bg-muted rounded w-20"></div>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {Array.from({ length: 8 }).map((_, index) => (
                    <div key={index} className="flex items-center justify-between p-2 border rounded">
                      <div className="flex-1 space-y-1">
                        <div className="h-4 bg-muted rounded w-64"></div>
                        <div className="h-3 bg-muted/60 rounded w-48"></div>
                      </div>
                      <div className="text-right space-y-1">
                        <div className="h-4 bg-muted rounded w-16"></div>
                        <div className="h-3 bg-muted/60 rounded w-20"></div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="validation" className="space-y-4 mt-4">
            <Card>
              <CardHeader>
                <div className="flex items-center space-x-2">
                  <div className="h-5 w-5 bg-muted rounded"></div>
                  <div className="h-5 bg-muted rounded w-32"></div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Stats */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 bg-muted/50 rounded-lg">
                      <div className="h-8 bg-muted rounded w-16 mb-2"></div>
                      <div className="h-3 bg-muted/60 rounded w-24"></div>
                    </div>
                    <div className="p-3 bg-muted/50 rounded-lg">
                      <div className="h-8 bg-muted rounded w-20 mb-2"></div>
                      <div className="h-3 bg-muted/60 rounded w-20"></div>
                    </div>
                  </div>

                  {/* Validation Messages */}
                  <div className="space-y-2">
                    <div className="h-4 bg-muted rounded w-20"></div>
                    <div className="border rounded-lg p-3">
                      <div className="flex items-start space-x-2">
                        <div className="h-4 w-4 bg-muted rounded mt-0.5"></div>
                        <div className="flex-1 space-y-1">
                          <div className="h-4 bg-muted rounded w-48"></div>
                          <div className="h-3 bg-muted/60 rounded w-64"></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
});

LEDESExportSkeleton.displayName = 'LEDESExportSkeleton';

/**
 * Skeleton for LEDES configuration loading
 */
export const LEDESConfigurationSkeleton = React.memo(() => {
  return (
    <div className="animate-pulse space-y-4">
      <div className="space-y-2">
        <div className="h-4 bg-muted rounded w-32"></div>
        <div className="h-10 bg-muted rounded w-full"></div>
      </div>
      
      <div className="p-3 bg-muted/30 rounded-lg">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <div className="h-5 bg-muted rounded w-48"></div>
            <div className="h-4 bg-muted/60 rounded w-64"></div>
          </div>
          <div className="h-6 bg-muted rounded-full w-16"></div>
        </div>
      </div>
    </div>
  );
});

LEDESConfigurationSkeleton.displayName = 'LEDESConfigurationSkeleton';

/**
 * Skeleton for export progress state
 */
export const LEDESExportProgressSkeleton = React.memo(() => {
  return (
    <div className="animate-pulse mb-4">
      <div className="flex items-center space-x-2 mb-2">
        <div className="h-4 w-4 bg-muted rounded-full"></div>
        <div className="h-4 bg-muted rounded w-48"></div>
      </div>
      <div className="h-2 bg-muted rounded-full w-full relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse"></div>
      </div>
    </div>
  );
});

LEDESExportProgressSkeleton.displayName = 'LEDESExportProgressSkeleton';