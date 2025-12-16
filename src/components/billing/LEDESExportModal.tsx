import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Download, 
  FileText, 
  AlertCircle, 
  CheckCircle, 
  Settings, 
  Calendar,
  Users,
  DollarSign,
  Clock
} from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { 
  LEDESConfiguration, 
  LEDESExportRequest, 
  LEDESExportResult,
  LEDESValidationResult,
  LEDESExportFilters
} from '@/types/ledes';
import { LEDESBillingService } from '@/services/ledesBillingService';
import { BillingService } from '@/services/billingService';
import { TimeEntry } from '@/types/billing';
import { LEDESExportProgressSkeleton } from './skeletons';

interface LEDESExportModalProps {
  open: boolean;
  onClose: () => void;
}

const LEDESExportModal: React.FC<LEDESExportModalProps> = ({ open, onClose }) => {
  const [configurations, setConfigurations] = useState<LEDESConfiguration[]>([]);
  const [selectedConfig, setSelectedConfig] = useState<string>('');
  const [filters, setFilters] = useState<LEDESExportFilters>({
    dateRange: {
      startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      endDate: new Date().toISOString().split('T')[0]
    },
    billingStatus: 'all'
  });
  const [previewData, setPreviewData] = useState<TimeEntry[]>([]);
  const [validationResult, setValidationResult] = useState<LEDESValidationResult | null>(null);
  const [exportOptions, setExportOptions] = useState({
    includeExpenses: true,
    includeAdjustments: false,
    groupByMatter: true,
    includeHeader: true,
    includeTimekeeperDetails: true,
    includeMatterDetails: true
  });
  const [isLoading, setIsLoading] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);
  const [exportResult, setExportResult] = useState<LEDESExportResult | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (open) {
      loadConfigurations();
      loadPreviewData();
    }
  }, [open]);

  useEffect(() => {
    if (selectedConfig && previewData.length > 0) {
      validateData();
    }
  }, [selectedConfig, previewData, filters]);

  const loadConfigurations = async () => {
    try {
      const configs = await LEDESBillingService.getConfigurations();
      setConfigurations(configs.filter(c => c.isActive));
      if (configs.length > 0 && !selectedConfig) {
        setSelectedConfig(configs[0].id);
      }
    } catch (error) {
      console.error('Error loading configurations:', error);
      toast({
        title: "Error",
        description: "Failed to load LEDES configurations.",
        variant: "destructive"
      });
    }
  };

  const loadPreviewData = async () => {
    try {
      const entries = await BillingService.getTimeEntries({
        status: filters.billingStatus === 'all' ? undefined : filters.billingStatus as any,
        dateRange: filters.dateRange
      });
      setPreviewData(entries.filter(e => e.billable));
    } catch (error) {
      console.error('Error loading preview data:', error);
    }
  };

  const validateData = async () => {
    if (!selectedConfig) return;

    try {
      const config = configurations.find(c => c.id === selectedConfig);
      if (!config) return;

      const filteredEntries = applyFilters(previewData);
      
      // Simulate validation (would call LEDESBillingService in real implementation)
      const mockValidation: LEDESValidationResult = {
        isValid: true,
        errors: [],
        warnings: filteredEntries.length > 100 ? [{
          id: 'warning-1',
          recordNumber: 0,
          field: 'recordCount',
          value: filteredEntries.length,
          message: `Large export with ${filteredEntries.length} records`,
          suggestion: 'Consider filtering data for better performance'
        }] : [],
        recordCount: filteredEntries.length,
        totalAmount: filteredEntries.reduce((sum, entry) => sum + entry.amount, 0)
      };

      setValidationResult(mockValidation);
    } catch (error) {
      console.error('Validation error:', error);
    }
  };

  const applyFilters = (entries: TimeEntry[]): TimeEntry[] => {
    return entries.filter(entry => {
      // Date range
      if (entry.date < filters.dateRange.startDate || entry.date > filters.dateRange.endDate) {
        return false;
      }

      // Client filter
      if (filters.clientIds && filters.clientIds.length > 0) {
        if (!filters.clientIds.includes(entry.clientId)) {
          return false;
        }
      }

      // Matter filter
      if (filters.matterIds && filters.matterIds.length > 0) {
        if (!filters.matterIds.includes(entry.matterId)) {
          return false;
        }
      }

      // Minimum amount filter
      if (filters.minimumAmount && entry.amount < filters.minimumAmount) {
        return false;
      }

      return true;
    });
  };

  const handleExport = async () => {
    if (!selectedConfig || !validationResult) {
      toast({
        title: "Validation Required",
        description: "Please select a configuration and ensure data is valid.",
        variant: "destructive"
      });
      return;
    }

    const config = configurations.find(c => c.id === selectedConfig);
    if (!config) return;

    setIsLoading(true);
    setExportProgress(0);

    try {
      // Simulate export progress
      const progressInterval = setInterval(() => {
        setExportProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return prev;
          }
          return prev + 10;
        });
      }, 200);

      const exportRequest: LEDESExportRequest = {
        configurationId: selectedConfig,
        format: config.format,
        filters,
        includeExpenses: exportOptions.includeExpenses,
        includeAdjustments: exportOptions.includeAdjustments,
        groupByMatter: exportOptions.groupByMatter,
        outputOptions: {
          includeHeader: exportOptions.includeHeader,
          dateFormat: 'YYYY/MM/DD',
          currencyFormat: 'USD',
          decimalPlaces: 2,
          includeTimekeeperDetails: exportOptions.includeTimekeeperDetails,
          includeMatterDetails: exportOptions.includeMatterDetails
        }
      };

      const result = await LEDESBillingService.exportToLEDES(exportRequest);
      
      clearInterval(progressInterval);
      setExportProgress(100);
      setExportResult(result);

      if (result.success) {
        toast({
          title: "Export Successful",
          description: `LEDES file generated with ${result.recordCount} records.`
        });
      } else {
        toast({
          title: "Export Failed",
          description: result.errors?.[0] || "Unknown error occurred during export.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Export error:', error);
      toast({
        title: "Export Error",
        description: "An error occurred during export. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = () => {
    if (exportResult?.downloadUrl) {
      const link = document.createElement('a');
      link.href = exportResult.downloadUrl;
      link.download = exportResult.fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const selectedConfiguration = configurations.find(c => c.id === selectedConfig);
  const filteredEntries = applyFilters(previewData);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Download className="h-5 w-5 text-primary" />
            <span>Export to LEDES Format</span>
          </DialogTitle>
          <DialogDescription>
            Export billable time entries to LEDES format for client e-billing requirements.
          </DialogDescription>
        </DialogHeader>

{isLoading && (
          <LEDESExportProgressSkeleton />
        )}

        {exportResult && (
          <Alert className={exportResult.success ? "border-green-200" : "border-red-200"}>
            <div className="flex items-center space-x-2">
              {exportResult.success ? (
                <CheckCircle className="h-4 w-4 text-green-500" />
              ) : (
                <AlertCircle className="h-4 w-4 text-red-500" />
              )}
              <AlertDescription>
                {exportResult.success ? (
                  <div className="flex items-center justify-between w-full">
                    <span>
                      Export completed: {exportResult.recordCount} records, ${exportResult.totalAmount.toFixed(2)} total
                    </span>
                    <Button size="sm" onClick={handleDownload}>
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </Button>
                  </div>
                ) : (
                  <span>Export failed: {exportResult.errors?.[0]}</span>
                )}
              </AlertDescription>
            </div>
          </Alert>
        )}

        <Tabs defaultValue="configuration" className="flex-1 overflow-hidden">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="configuration">Configuration</TabsTrigger>
            <TabsTrigger value="filters">Filters</TabsTrigger>
            <TabsTrigger value="preview">Preview</TabsTrigger>
            <TabsTrigger value="validation">Validation</TabsTrigger>
          </TabsList>

          <div className="flex-1 overflow-y-auto">
            <TabsContent value="configuration" className="space-y-4 mt-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Settings className="h-5 w-5" />
                    <span>Export Configuration</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="configuration">LEDES Configuration</Label>
                    <Select value={selectedConfig} onValueChange={setSelectedConfig}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select configuration..." />
                      </SelectTrigger>
                      <SelectContent>
                        {configurations.map(config => (
                          <SelectItem key={config.id} value={config.id}>
                            <div className="flex items-center justify-between w-full">
                              <span>{config.clientName}</span>
                              <Badge variant="outline" className="ml-2">{config.format}</Badge>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {selectedConfiguration && (
                      <div className="mt-2 p-3 bg-muted/50 rounded-lg">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-medium">{selectedConfiguration.clientName}</div>
                            <div className="text-sm text-muted-foreground">
                              Format: {selectedConfiguration.format} • Version: {selectedConfiguration.version}
                            </div>
                          </div>
                          <Badge variant={selectedConfiguration.isActive ? "default" : "secondary"}>
                            {selectedConfiguration.isActive ? "Active" : "Inactive"}
                          </Badge>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="space-y-3">
                    <Label>Export Options</Label>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          checked={exportOptions.includeExpenses}
                          onCheckedChange={(checked) => 
                            setExportOptions(prev => ({ ...prev, includeExpenses: !!checked }))
                          }
                        />
                        <Label className="text-sm">Include Expenses</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          checked={exportOptions.includeAdjustments}
                          onCheckedChange={(checked) => 
                            setExportOptions(prev => ({ ...prev, includeAdjustments: !!checked }))
                          }
                        />
                        <Label className="text-sm">Include Adjustments</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          checked={exportOptions.groupByMatter}
                          onCheckedChange={(checked) => 
                            setExportOptions(prev => ({ ...prev, groupByMatter: !!checked }))
                          }
                        />
                        <Label className="text-sm">Group by Matter</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          checked={exportOptions.includeHeader}
                          onCheckedChange={(checked) => 
                            setExportOptions(prev => ({ ...prev, includeHeader: !!checked }))
                          }
                        />
                        <Label className="text-sm">Include Header Row</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          checked={exportOptions.includeTimekeeperDetails}
                          onCheckedChange={(checked) => 
                            setExportOptions(prev => ({ ...prev, includeTimekeeperDetails: !!checked }))
                          }
                        />
                        <Label className="text-sm">Timekeeper Details</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          checked={exportOptions.includeMatterDetails}
                          onCheckedChange={(checked) => 
                            setExportOptions(prev => ({ ...prev, includeMatterDetails: !!checked }))
                          }
                        />
                        <Label className="text-sm">Matter Details</Label>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="filters" className="space-y-4 mt-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Calendar className="h-5 w-5" />
                    <span>Export Filters</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="startDate">Start Date</Label>
                      <Input
                        type="date"
                        value={filters.dateRange.startDate}
                        onChange={(e) => setFilters(prev => ({
                          ...prev,
                          dateRange: { ...prev.dateRange, startDate: e.target.value }
                        }))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="endDate">End Date</Label>
                      <Input
                        type="date"
                        value={filters.dateRange.endDate}
                        onChange={(e) => setFilters(prev => ({
                          ...prev,
                          dateRange: { ...prev.dateRange, endDate: e.target.value }
                        }))}
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="billingStatus">Billing Status</Label>
                    <Select 
                      value={filters.billingStatus || 'all'} 
                      onValueChange={(value) => setFilters(prev => ({ 
                        ...prev, 
                        billingStatus: value as any 
                      }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Entries</SelectItem>
                        <SelectItem value="billed">Billed Only</SelectItem>
                        <SelectItem value="unbilled">Unbilled Only</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="minimumAmount">Minimum Amount ($)</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={filters.minimumAmount || ''}
                      onChange={(e) => setFilters(prev => ({
                        ...prev,
                        minimumAmount: e.target.value ? parseFloat(e.target.value) : undefined
                      }))}
                      placeholder="0.00"
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="preview" className="space-y-4 mt-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <FileText className="h-5 w-5" />
                      <span>Export Preview</span>
                    </div>
                    <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                      <div className="flex items-center space-x-1">
                        <Clock className="h-4 w-4" />
                        <span>{filteredEntries.reduce((sum, e) => sum + e.hours, 0).toFixed(2)} hours</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <DollarSign className="h-4 w-4" />
                        <span>${filteredEntries.reduce((sum, e) => sum + e.amount, 0).toFixed(2)}</span>
                      </div>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {filteredEntries.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>No billable entries found with current filters.</p>
                    </div>
                  ) : (
                    <div className="space-y-2 max-h-64 overflow-y-auto">
                      {filteredEntries.slice(0, 50).map((entry, index) => (
                        <div key={entry.id} className="flex items-center justify-between p-2 border rounded">
                          <div className="flex-1">
                            <div className="font-medium text-sm">{entry.description}</div>
                            <div className="text-xs text-muted-foreground">
                              {entry.clientName} • {entry.matterTitle} • {entry.date}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-medium">${entry.amount.toFixed(2)}</div>
                            <div className="text-xs text-muted-foreground">{entry.hours}h @ ${entry.rate}/h</div>
                          </div>
                        </div>
                      ))}
                      {filteredEntries.length > 50 && (
                        <div className="text-center text-sm text-muted-foreground py-2">
                          ... and {filteredEntries.length - 50} more entries
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="validation" className="space-y-4 mt-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    {validationResult?.isValid ? (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    ) : (
                      <AlertCircle className="h-5 w-5 text-red-500" />
                    )}
                    <span>Validation Results</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {validationResult ? (
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="p-3 bg-muted/50 rounded-lg">
                          <div className="text-2xl font-bold">{validationResult.recordCount}</div>
                          <div className="text-sm text-muted-foreground">Records to Export</div>
                        </div>
                        <div className="p-3 bg-muted/50 rounded-lg">
                          <div className="text-2xl font-bold">${validationResult.totalAmount.toFixed(2)}</div>
                          <div className="text-sm text-muted-foreground">Total Amount</div>
                        </div>
                      </div>

                      {validationResult.errors.length > 0 && (
                        <div className="space-y-2">
                          <h4 className="font-medium text-red-600">Errors</h4>
                          {validationResult.errors.map(error => (
                            <Alert key={error.id} variant="destructive">
                              <AlertCircle className="h-4 w-4" />
                              <AlertDescription>
                                <div className="font-medium">Record {error.recordNumber}: {error.field}</div>
                                <div className="text-sm">{error.message}</div>
                              </AlertDescription>
                            </Alert>
                          ))}
                        </div>
                      )}

                      {validationResult.warnings.length > 0 && (
                        <div className="space-y-2">
                          <h4 className="font-medium text-yellow-600">Warnings</h4>
                          {validationResult.warnings.map(warning => (
                            <Alert key={warning.id}>
                              <AlertCircle className="h-4 w-4" />
                              <AlertDescription>
                                <div className="font-medium">{warning.message}</div>
                                <div className="text-sm text-muted-foreground">{warning.suggestion}</div>
                              </AlertDescription>
                            </Alert>
                          ))}
                        </div>
                      )}

                      {validationResult.isValid && validationResult.errors.length === 0 && validationResult.warnings.length === 0 && (
                        <Alert>
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          <AlertDescription>
                            All validation checks passed. Data is ready for export.
                          </AlertDescription>
                        </Alert>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>Select a configuration to run validation.</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </div>
        </Tabs>

        <DialogFooter className="border-t pt-4">
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button 
            onClick={handleExport} 
            disabled={!selectedConfig || !validationResult?.isValid || isLoading}
          >
            <Download className="h-4 w-4 mr-2" />
            {isLoading ? 'Exporting...' : 'Export to LEDES'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default LEDESExportModal;