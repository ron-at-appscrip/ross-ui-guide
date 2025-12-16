import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { WorkflowExecution, WorkflowTemplate, ExportOptions } from '@/types/workflow';
import { workflowService } from '@/services/workflowService';
import { 
  Download, 
  FileText, 
  CheckCircle, 
  X, 
  ArrowLeft, 
  ArrowRight,
  Loader2,
  File,
  Globe,
  Code
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  execution: WorkflowExecution;
  template: WorkflowTemplate;
  className?: string;
}

const formatOptions = [
  { value: 'pdf', label: 'PDF Document', icon: FileText, description: 'Professional PDF format' },
  { value: 'docx', label: 'Word Document', icon: File, description: 'Editable Word document' },
  { value: 'html', label: 'Web Page', icon: Globe, description: 'HTML web page format' },
  { value: 'json', label: 'Data Export', icon: Code, description: 'Raw data in JSON format' }
];

const templateStyles = [
  { value: 'legal', label: 'Legal Professional', description: 'Formal legal document style' },
  { value: 'business', label: 'Business Standard', description: 'Clean business document style' },
  { value: 'minimal', label: 'Minimal', description: 'Simple, minimal formatting' }
];

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  execution,
  template,
  className,
}) => {
  const [currentStep, setCurrentStep] = useState<'options' | 'preview' | 'export'>('options');
  const [isExporting, setIsExporting] = useState(false);
  const [exportSuccess, setExportSuccess] = useState(false);
  const [exportedData, setExportedData] = useState<any>(null);
  
  const [exportOptions, setExportOptions] = useState<ExportOptions>({
    format: 'pdf',
    includeInputs: true,
    includeMetadata: true,
    templateStyle: 'legal',
    sections: {
      summary: true,
      steps: true,
      outputs: true,
      timeline: true
    }
  });

  const handleBack = () => {
    if (currentStep === 'preview') {
      setCurrentStep('options');
    } else if (currentStep === 'export') {
      setCurrentStep('preview');
    }
  };

  const handleNext = () => {
    if (currentStep === 'options') {
      setCurrentStep('preview');
    } else if (currentStep === 'preview') {
      handleExport();
    }
  };

  const handleExport = async () => {
    setCurrentStep('export');
    setIsExporting(true);
    
    try {
      // Simulate export processing
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const exportData = workflowService.exportExecution(execution.id, exportOptions);
      setExportedData(exportData);
      setExportSuccess(true);
      
      // In a real implementation, this would trigger file download
      console.log('Export data:', exportData);
      
    } catch (error) {
      console.error('Export failed:', error);
      setExportSuccess(false);
    } finally {
      setIsExporting(false);
    }
  };

  const handleDownload = () => {
    if (exportedData) {
      // In a real implementation, this would create and download the file
      const blob = new Blob([JSON.stringify(exportedData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${execution.title}-export.${exportOptions.format}`;
      link.click();
      URL.revokeObjectURL(url);
    }
  };

  const handleClose = () => {
    setCurrentStep('options');
    setIsExporting(false);
    setExportSuccess(false);
    setExportedData(null);
    onClose();
  };

  const updateExportOption = (key: keyof ExportOptions, value: any) => {
    setExportOptions(prev => ({ ...prev, [key]: value }));
  };

  const updateSection = (section: keyof ExportOptions['sections'], checked: boolean) => {
    setExportOptions(prev => ({
      ...prev,
      sections: { ...prev.sections, [section]: checked }
    }));
  };

  const selectedFormat = formatOptions.find(f => f.value === exportOptions.format);
  const selectedStyle = templateStyles.find(s => s.value === exportOptions.templateStyle);

  const renderOptionsStep = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-3">Export Format</h3>
        <RadioGroup 
          value={exportOptions.format} 
          onValueChange={(value) => updateExportOption('format', value)}
          className="space-y-3"
        >
          {formatOptions.map((format) => (
            <div key={format.value} className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50">
              <RadioGroupItem value={format.value} id={format.value} />
              <format.icon className="h-5 w-5 text-gray-600" />
              <div className="flex-1">
                <Label htmlFor={format.value} className="font-medium cursor-pointer">
                  {format.label}
                </Label>
                <p className="text-sm text-gray-600">{format.description}</p>
              </div>
            </div>
          ))}
        </RadioGroup>
      </div>

      <Separator />

      <div>
        <h3 className="text-lg font-semibold mb-3">Template Style</h3>
        <Select value={exportOptions.templateStyle} onValueChange={(value) => updateExportOption('templateStyle', value)}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {templateStyles.map((style) => (
              <SelectItem key={style.value} value={style.value}>
                <div>
                  <div className="font-medium">{style.label}</div>
                  <div className="text-sm text-gray-600">{style.description}</div>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Separator />

      <div>
        <h3 className="text-lg font-semibold mb-3">Include Sections</h3>
        <div className="space-y-3">
          {[
            { key: 'summary' as const, label: 'Executive Summary', description: 'Overview of workflow results' },
            { key: 'steps' as const, label: 'Workflow Steps', description: 'Detailed step-by-step breakdown' },
            { key: 'outputs' as const, label: 'Generated Outputs', description: 'All generated documents and analysis' },
            { key: 'timeline' as const, label: 'Timeline', description: 'Chronological workflow timeline' }
          ].map((section) => (
            <div key={section.key} className="flex items-start space-x-3">
              <Checkbox
                id={section.key}
                checked={exportOptions.sections[section.key]}
                onCheckedChange={(checked) => updateSection(section.key, !!checked)}
                className="mt-1"
              />
              <div className="flex-1">
                <Label htmlFor={section.key} className="font-medium cursor-pointer">
                  {section.label}
                </Label>
                <p className="text-sm text-gray-600">{section.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <Separator />

      <div>
        <h3 className="text-lg font-semibold mb-3">Additional Options</h3>
        <div className="space-y-3">
          <div className="flex items-start space-x-3">
            <Checkbox
              id="includeInputs"
              checked={exportOptions.includeInputs}
              onCheckedChange={(checked) => updateExportOption('includeInputs', !!checked)}
              className="mt-1"
            />
            <div className="flex-1">
              <Label htmlFor="includeInputs" className="font-medium cursor-pointer">
                Include User Inputs
              </Label>
              <p className="text-sm text-gray-600">Include all user inputs and form data</p>
            </div>
          </div>

          <div className="flex items-start space-x-3">
            <Checkbox
              id="includeMetadata"
              checked={exportOptions.includeMetadata}
              onCheckedChange={(checked) => updateExportOption('includeMetadata', !!checked)}
              className="mt-1"
            />
            <div className="flex-1">
              <Label htmlFor="includeMetadata" className="font-medium cursor-pointer">
                Include Metadata
              </Label>
              <p className="text-sm text-gray-600">Include timestamps, workflow details, and technical information</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderPreviewStep = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Export Preview
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <Label className="font-medium">Format:</Label>
              <p className="text-gray-600">{selectedFormat?.label}</p>
            </div>
            <div>
              <Label className="font-medium">Style:</Label>
              <p className="text-gray-600">{selectedStyle?.label}</p>
            </div>
          </div>

          <Separator />

          <div>
            <Label className="font-medium">Included Sections:</Label>
            <div className="mt-2 space-y-1">
              {Object.entries(exportOptions.sections)
                .filter(([_, included]) => included)
                .map(([section, _]) => (
                  <div key={section} className="flex items-center gap-2 text-sm text-gray-600">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="capitalize">{section.replace(/([A-Z])/g, ' $1').trim()}</span>
                  </div>
                ))}
            </div>
          </div>

          <Separator />

          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-medium mb-2">Export Contents</h4>
            <div className="text-sm text-gray-600 space-y-1">
              <div>• Workflow: {execution.title}</div>
              <div>• Template: {template.title}</div>
              <div>• Completed Steps: {execution.progress.completed}/{execution.progress.total}</div>
              <div>• Generated Outputs: {execution.outputs.length}</div>
              {exportOptions.includeInputs && <div>• User Inputs: {execution.inputs.length}</div>}
              {exportOptions.includeMetadata && <div>• Metadata and timestamps included</div>}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderExportStep = () => (
    <div className="text-center space-y-6">
      {isExporting ? (
        <>
          <div className="flex items-center justify-center">
            <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-2">Generating Export...</h3>
            <p className="text-gray-600">
              Please wait while we prepare your {selectedFormat?.label.toLowerCase()}.
            </p>
          </div>
        </>
      ) : exportSuccess ? (
        <>
          <div className="flex items-center justify-center">
            <CheckCircle className="h-12 w-12 text-green-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-green-800 mb-2">Export Complete!</h3>
            <p className="text-gray-600 mb-4">
              Your {selectedFormat?.label.toLowerCase()} has been generated successfully.
            </p>
            <Button onClick={handleDownload} className="gap-2">
              <Download className="h-4 w-4" />
              Download File
            </Button>
          </div>
        </>
      ) : (
        <>
          <div className="flex items-center justify-center">
            <X className="h-12 w-12 text-red-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-red-800 mb-2">Export Failed</h3>
            <p className="text-gray-600 mb-4">
              There was an error generating your export. Please try again.
            </p>
            <Button variant="outline" onClick={() => setCurrentStep('options')}>
              Try Again
            </Button>
          </div>
        </>
      )}
    </div>
  );

  const getStepContent = () => {
    switch (currentStep) {
      case 'options':
        return renderOptionsStep();
      case 'preview':
        return renderPreviewStep();
      case 'export':
        return renderExportStep();
      default:
        return renderOptionsStep();
    }
  };

  const canProceed = () => {
    if (currentStep === 'options') {
      return Object.values(exportOptions.sections).some(Boolean);
    }
    return true;
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className={cn('max-w-2xl max-h-[90vh] overflow-y-auto', className)}>
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2">
              <Download className="h-5 w-5" />
              Export Workflow Results
            </DialogTitle>
            
            {/* Step Indicator */}
            <div className="flex items-center gap-2 text-sm">
              <div className={cn(
                'px-2 py-1 rounded',
                currentStep === 'options' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-600'
              )}>
                1. Options
              </div>
              <ArrowRight className="h-3 w-3 text-gray-400" />
              <div className={cn(
                'px-2 py-1 rounded',
                currentStep === 'preview' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-600'
              )}>
                2. Preview
              </div>
              <ArrowRight className="h-3 w-3 text-gray-400" />
              <div className={cn(
                'px-2 py-1 rounded',
                currentStep === 'export' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-600'
              )}>
                3. Export
              </div>
            </div>
          </div>
        </DialogHeader>

        <div className="mt-6">
          {getStepContent()}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-6 border-t">
          <div>
            {currentStep !== 'options' && !isExporting && (
              <Button variant="outline" onClick={handleBack} className="gap-2">
                <ArrowLeft className="h-4 w-4" />
                Previous
              </Button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={handleClose}>
              {currentStep === 'export' && exportSuccess ? 'Close' : 'Cancel'}
            </Button>
            
            {currentStep !== 'export' && (
              <Button 
                onClick={handleNext} 
                disabled={!canProceed() || isExporting}
                className="gap-2"
              >
                {currentStep === 'preview' ? (
                  <>
                    <Download className="h-4 w-4" />
                    Export
                  </>
                ) : (
                  <>
                    Next
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};