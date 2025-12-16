import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  WorkflowExecution, 
  WorkflowTemplate, 
  WorkflowStep, 
  StepInput, 
  InputRequirement,
  WorkflowProgress 
} from '@/types/workflow';
import { workflowService } from '@/services/workflowService';
import { claudeApiService } from '@/services/claudeApiService';
import { 
  CheckCircle, 
  Circle, 
  Clock, 
  Upload, 
  FileText, 
  Play, 
  Pause, 
  RotateCcw,
  Download,
  ChevronRight,
  ChevronDown,
  AlertCircle,
  Loader2,
  X,
  ArrowRight,
  ArrowLeft
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface WorkflowExecutorProps {
  execution: WorkflowExecution;
  template: WorkflowTemplate;
  onComplete?: (execution: WorkflowExecution) => void;
  onPause?: (execution: WorkflowExecution) => void;
  onResume?: (execution: WorkflowExecution) => void;
  onExport?: (execution: WorkflowExecution) => void;
  onClose?: () => void;
  className?: string;
}

interface StepInputState {
  [stepId: string]: {
    [inputId: string]: any;
  };
}

export const WorkflowExecutor: React.FC<WorkflowExecutorProps> = ({
  execution: initialExecution,
  template,
  onComplete,
  onPause,
  onResume,
  onExport,
  onClose,
  className,
}) => {
  const [execution, setExecution] = useState<WorkflowExecution>(initialExecution);
  const [progress, setProgress] = useState<WorkflowProgress | null>(null);
  const [inputState, setInputState] = useState<StepInputState>({});
  const [isProcessing, setIsProcessing] = useState(false);
  const [expandedSteps, setExpandedSteps] = useState<Set<string>>(new Set());
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [generatedContent, setGeneratedContent] = useState<Record<string, any>>({});

  useEffect(() => {
    const currentProgress = workflowService.calculateProgress(execution, template);
    setProgress(currentProgress);
    
    // Auto-expand current step
    if (currentProgress.nextStepId) {
      setExpandedSteps(prev => new Set([...prev, currentProgress.nextStepId!]));
    }
  }, [execution, template]);

  const currentStep = template.steps[execution.currentStep];
  const isComplete = execution.status === 'completed';
  const isPaused = execution.status === 'paused';
  const canProceed = progress?.canProceed || false;

  const handleInputChange = (stepId: string, inputId: string, value: any) => {
    setInputState(prev => ({
      ...prev,
      [stepId]: {
        ...prev[stepId],
        [inputId]: value
      }
    }));

    // Clear validation error for this input
    const errorKey = `${stepId}-${inputId}`;
    if (validationErrors[errorKey]) {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[errorKey];
        return newErrors;
      });
    }
  };

  const handleFileUpload = (stepId: string, inputId: string, files: FileList | null) => {
    if (files && files.length > 0) {
      const fileArray = Array.from(files);
      handleInputChange(stepId, inputId, fileArray);
    }
  };

  const validateStep = (step: WorkflowStep): boolean => {
    const stepInputs = inputState[step.id] || {};
    const errors: Record<string, string> = {};
    let isValid = true;

    step.inputs.forEach(input => {
      const value = stepInputs[input.id];
      const errorKey = `${step.id}-${input.id}`;

      if (input.required && (!value || value === '' || (Array.isArray(value) && value.length === 0))) {
        errors[errorKey] = `${input.label} is required`;
        isValid = false;
      }

      if (input.type === 'file' && value && Array.isArray(value)) {
        const files = value as File[];
        files.forEach(file => {
          if (input.maxFileSize && file.size > input.maxFileSize) {
            errors[errorKey] = `File size must be under ${(input.maxFileSize / 1024 / 1024).toFixed(1)}MB`;
            isValid = false;
          }

          if (input.fileTypes && input.fileTypes.length > 0) {
            const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
            if (!input.fileTypes.includes(fileExtension)) {
              errors[errorKey] = `File type must be one of: ${input.fileTypes.join(', ')}`;
              isValid = false;
            }
          }
        });
      }
    });

    setValidationErrors(prev => ({ ...prev, ...errors }));
    return isValid;
  };

  const handleCompleteStep = async (step: WorkflowStep) => {
    if (!validateStep(step)) {
      return;
    }

    setIsProcessing(true);

    try {
      // Save step inputs
      const stepInputs = inputState[step.id] || {};
      Object.entries(stepInputs).forEach(([inputId, value]) => {
        const stepInput: StepInput = {
          stepId: step.id,
          inputId,
          value,
          timestamp: new Date().toISOString()
        };
        workflowService.addStepInput(execution.id, stepInput);
      });

      // Generate content using Claude API based on workflow type
      let generatedResult: any = null;
      
      if (template.id === 'draft-client-alert') {
        generatedResult = await generateClientAlertContent(step, stepInputs);
      } else if (template.id === 'analyze-contract') {
        generatedResult = await generateContractAnalysisContent(step, stepInputs);
      } else if (template.id === 'legal-memo') {
        generatedResult = await generateLegalMemoContent(step, stepInputs);
      } else if (template.id === 'document-review') {
        generatedResult = await generateDocumentReviewContent(step, stepInputs);
      }

      // Store generated content
      if (generatedResult) {
        setGeneratedContent(prev => ({
          ...prev,
          [step.id]: generatedResult
        }));
      }

      // Complete the step
      const updatedProgress = workflowService.completeStep(execution.id, step.id);
      
      // Get updated execution
      const updatedExecution = workflowService.getExecution(execution.id);
      if (updatedExecution) {
        setExecution(updatedExecution);
        
        if (updatedExecution.status === 'completed') {
          onComplete?.(updatedExecution);
        }
      }

      // Expand next step if available
      if (updatedProgress && updatedProgress.nextStepId) {
        setExpandedSteps(prev => new Set([...prev, updatedProgress.nextStepId!]));
      }

    } catch (error) {
      console.error('Error completing step:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const generateClientAlertContent = async (step: WorkflowStep, stepInputs: any) => {
    const stepIndex = template.steps.findIndex(s => s.id === step.id);
    
    if (stepIndex === 0) {
      // Step 1: Document analysis
      const documentText = await extractTextFromFiles(stepInputs.sourceDocument);
      return { documentAnalysis: documentText };
    } else if (stepIndex === 1) {
      // Step 2: Style template (optional)
      const templateText = stepInputs.styleTemplate ? 
        await extractTextFromFiles(stepInputs.styleTemplate) : null;
      return { styleTemplate: templateText };
    } else if (stepIndex === 2) {
      // Step 3: Generate draft
      const sourceDoc = generatedContent[template.steps[0].id]?.documentAnalysis || 'Legal document';
      const styleTemplate = generatedContent[template.steps[1].id]?.styleTemplate;
      const targetAudience = stepInputs.targetAudience || 'Corporate clients';
      const urgencyLevel = stepInputs.urgencyLevel || 'medium';
      
      const clientAlert = await claudeApiService.generateClientAlert(
        sourceDoc, 
        styleTemplate, 
        targetAudience, 
        urgencyLevel
      );
      return { clientAlert };
    }
    
    return null;
  };

  const generateContractAnalysisContent = async (step: WorkflowStep, stepInputs: any) => {
    const stepIndex = template.steps.findIndex(s => s.id === step.id);
    
    if (stepIndex === 0) {
      // Step 1: Contract upload and initial analysis
      const contractText = await extractTextFromFiles(stepInputs.contractFile);
      const contractType = stepInputs.contractType || 'Commercial Agreement';
      const clientPosition = stepInputs.clientPosition || 'general';
      
      const analysis = await claudeApiService.analyzeContract(
        contractText, 
        contractType, 
        clientPosition
      );
      return { contractAnalysis: analysis };
    } else if (stepIndex === 1) {
      // Step 2: Detailed risk assessment
      const analysis = generatedContent[template.steps[0].id]?.contractAnalysis;
      if (analysis) {
        // Generate more detailed recommendations
        return { 
          detailedRecommendations: analysis.recommendations,
          riskMatrix: analysis.keyFindings
        };
      }
    }
    
    return null;
  };

  const generateLegalMemoContent = async (step: WorkflowStep, stepInputs: any) => {
    const stepIndex = template.steps.findIndex(s => s.id === step.id);
    
    if (stepIndex === 0) {
      // Step 1: Define legal question
      return { legalQuestion: stepInputs.legalQuestion };
    } else if (stepIndex === 1) {
      // Step 2: Research and analysis
      const legalQuestion = generatedContent[template.steps[0].id]?.legalQuestion || stepInputs.legalQuestion;
      const jurisdiction = stepInputs.jurisdiction || 'United States';
      const researchScope = stepInputs.researchScope || ['Federal law', 'State law', 'Case law'];
      
      const memo = await claudeApiService.generateLegalMemo(
        legalQuestion, 
        jurisdiction, 
        researchScope
      );
      return { legalMemo: memo };
    }
    
    return null;
  };

  const generateDocumentReviewContent = async (step: WorkflowStep, stepInputs: any) => {
    const documentText = await extractTextFromFiles(stepInputs.documentFile);
    const documentType = stepInputs.documentType || 'Legal Document';
    
    const review = await claudeApiService.quickDocumentReview(
      documentText, 
      documentType
    );
    return { documentReview: review };
  };

  const extractTextFromFiles = async (files: File[]): Promise<string> => {
    if (!files || files.length === 0) return '';
    
    // For demo purposes, return a placeholder
    // In production, you'd use a proper document parser
    return `[Document content: ${files[0].name}]`;
  };

  const renderGeneratedContent = (stepId: string, content: any) => {
    if (content.clientAlert) {
      const alert = content.clientAlert;
      return (
        <div className="space-y-3">
          <div>
            <h5 className="font-semibold text-sm text-foreground">{alert.title}</h5>
            <p className="text-sm text-muted-foreground mt-1">{alert.executiveSummary}</p>
          </div>
          
          <div>
            <h6 className="font-medium text-xs text-foreground mb-1">Key Points:</h6>
            <ul className="text-xs text-muted-foreground space-y-1">
              {alert.keyPoints.map((point: string, index: number) => (
                <li key={index} className="flex items-start gap-1">
                  <span className="text-green-600 mt-0.5">•</span>
                  {point}
                </li>
              ))}
            </ul>
          </div>
          
          <div>
            <h6 className="font-medium text-xs text-foreground mb-1">Action Items:</h6>
            <ul className="text-xs text-muted-foreground space-y-1">
              {alert.actionItems.map((item: string, index: number) => (
                <li key={index} className="flex items-start gap-1">
                  <span className="text-blue-600 mt-0.5">•</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
          
          <Button size="sm" variant="outline" className="text-xs">
            <Download className="h-3 w-3 mr-1" />
            Export Client Alert
          </Button>
        </div>
      );
    }

    if (content.contractAnalysis) {
      const analysis = content.contractAnalysis;
      return (
        <div className="space-y-3">
          <div>
            <h6 className="font-medium text-xs text-gray-800 mb-1">Summary:</h6>
            <p className="text-xs text-gray-600">{analysis.summary}</p>
          </div>
          
          <div>
            <h6 className="font-medium text-xs text-gray-800 mb-1">
              Risk Level: <span className={`font-semibold ${
                analysis.riskLevel === 'high' ? 'text-red-600' :
                analysis.riskLevel === 'medium' ? 'text-yellow-600' : 'text-green-600'
              }`}>
                {analysis.riskLevel.toUpperCase()}
              </span>
            </h6>
          </div>
          
          <div>
            <h6 className="font-medium text-xs text-gray-800 mb-1">Key Findings:</h6>
            <ul className="text-xs text-gray-600 space-y-1">
              {analysis.keyFindings.map((finding: string, index: number) => (
                <li key={index} className="flex items-start gap-1">
                  <span className="text-red-600 mt-0.5">•</span>
                  {finding}
                </li>
              ))}
            </ul>
          </div>
          
          <div>
            <h6 className="font-medium text-xs text-gray-800 mb-1">Recommendations:</h6>
            <ul className="text-xs text-gray-600 space-y-1">
              {analysis.recommendations.map((rec: string, index: number) => (
                <li key={index} className="flex items-start gap-1">
                  <span className="text-blue-600 mt-0.5">•</span>
                  {rec}
                </li>
              ))}
            </ul>
          </div>
          
          <Button size="sm" variant="outline" className="text-xs">
            <Download className="h-3 w-3 mr-1" />
            Export Analysis Report
          </Button>
        </div>
      );
    }

    if (content.legalMemo) {
      return (
        <div className="space-y-3">
          <div>
            <h6 className="font-medium text-xs text-gray-800 mb-1">Legal Memorandum Generated:</h6>
            <div className="text-xs text-gray-600 bg-white border rounded p-2 max-h-32 overflow-y-auto">
              <pre className="whitespace-pre-wrap font-mono text-xs">{content.legalMemo}</pre>
            </div>
          </div>
          
          <Button size="sm" variant="outline" className="text-xs">
            <Download className="h-3 w-3 mr-1" />
            Export Legal Memo
          </Button>
        </div>
      );
    }

    if (content.documentReview) {
      const review = content.documentReview;
      return (
        <div className="space-y-3">
          <div>
            <h6 className="font-medium text-xs text-gray-800 mb-1">Document Review Summary:</h6>
            <p className="text-xs text-gray-600">{review.summary}</p>
          </div>
          
          <div>
            <h6 className="font-medium text-xs text-gray-800 mb-1">
              Risk Assessment: <span className={`font-semibold ${
                review.riskLevel === 'high' ? 'text-red-600' :
                review.riskLevel === 'medium' ? 'text-yellow-600' : 'text-green-600'
              }`}>
                {review.riskLevel.toUpperCase()}
              </span>
            </h6>
          </div>
          
          <div>
            <h6 className="font-medium text-xs text-gray-800 mb-1">Findings:</h6>
            <ul className="text-xs text-gray-600 space-y-1">
              {review.keyFindings.map((finding: string, index: number) => (
                <li key={index} className="flex items-start gap-1">
                  <span className="text-yellow-600 mt-0.5">•</span>
                  {finding}
                </li>
              ))}
            </ul>
          </div>
          
          <Button size="sm" variant="outline" className="text-xs">
            <Download className="h-3 w-3 mr-1" />
            Export Review Report
          </Button>
        </div>
      );
    }

    // Default fallback for other content types
    return (
      <div className="text-xs text-gray-600">
        <pre className="whitespace-pre-wrap">{JSON.stringify(content, null, 2)}</pre>
      </div>
    );
  };

  const handlePauseWorkflow = () => {
    workflowService.pauseExecution(execution.id);
    const updatedExecution = workflowService.getExecution(execution.id);
    if (updatedExecution) {
      setExecution(updatedExecution);
      onPause?.(updatedExecution);
    }
  };

  const handleResumeWorkflow = () => {
    workflowService.resumeExecution(execution.id);
    const updatedExecution = workflowService.getExecution(execution.id);
    if (updatedExecution) {
      setExecution(updatedExecution);
      onResume?.(updatedExecution);
    }
  };

  const toggleStepExpansion = (stepId: string) => {
    setExpandedSteps(prev => {
      const newSet = new Set(prev);
      if (newSet.has(stepId)) {
        newSet.delete(stepId);
      } else {
        newSet.add(stepId);
      }
      return newSet;
    });
  };

  const getStepIcon = (step: WorkflowStep, stepIndex: number) => {
    if (stepIndex < execution.currentStep) {
      return <CheckCircle className="h-6 w-6 text-green-600" />;
    } else if (stepIndex === execution.currentStep) {
      return <Circle className="h-6 w-6 text-blue-600 fill-blue-100" />;
    } else {
      return <Circle className="h-6 w-6 text-muted-foreground" />;
    }
  };

  const getStepStatus = (stepIndex: number) => {
    if (stepIndex < execution.currentStep) return 'completed';
    if (stepIndex === execution.currentStep) return 'current';
    return 'pending';
  };

  const renderInput = (step: WorkflowStep, input: InputRequirement) => {
    const value = inputState[step.id]?.[input.id] || '';
    const errorKey = `${step.id}-${input.id}`;
    const hasError = !!validationErrors[errorKey];

    switch (input.type) {
      case 'text':
        return (
          <div key={input.id} className="space-y-2">
            <Label htmlFor={input.id} className="text-sm font-medium">
              {input.label}
              {input.required && <span className="text-red-500 ml-1">*</span>}
            </Label>
            <Textarea
              id={input.id}
              value={value}
              onChange={(e) => handleInputChange(step.id, input.id, e.target.value)}
              placeholder={input.placeholder}
              className={cn('min-h-[100px]', hasError && 'border-red-500')}
            />
            {input.description && (
              <p className="text-xs text-muted-foreground">{input.description}</p>
            )}
            {hasError && (
              <p className="text-xs text-red-600 flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {validationErrors[errorKey]}
              </p>
            )}
          </div>
        );

      case 'file':
        return (
          <div key={input.id} className="space-y-2">
            <Label htmlFor={input.id} className="text-sm font-medium">
              {input.label}
              {input.required && <span className="text-red-500 ml-1">*</span>}
            </Label>
            <div className={cn('border-2 border-dashed rounded-lg p-6 text-center hover:border-blue-400 transition-colors', hasError && 'border-red-500')}>
              <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
              <p className="text-sm text-muted-foreground mb-2">
                Click to upload or drag and drop
              </p>
              <input
                type="file"
                id={input.id}
                multiple={false}
                accept={input.fileTypes?.join(',')}
                onChange={(e) => handleFileUpload(step.id, input.id, e.target.files)}
                className="hidden"
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => document.getElementById(input.id)?.click()}
              >
                Select Files
              </Button>
              {input.fileTypes && (
                <p className="text-xs text-muted-foreground mt-2">
                  Supported: {input.fileTypes.join(', ')}
                </p>
              )}
              {input.maxFileSize && (
                <p className="text-xs text-muted-foreground">
                  Max size: {(input.maxFileSize / 1024 / 1024).toFixed(1)}MB
                </p>
              )}
            </div>
            {value && Array.isArray(value) && value.length > 0 && (
              <div className="space-y-2">
                {value.map((file: File, index: number) => (
                  <div key={index} className="flex items-center gap-2 p-2 bg-muted rounded">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm truncate">{file.name}</span>
                    <span className="text-xs text-muted-foreground">
                      ({(file.size / 1024 / 1024).toFixed(1)}MB)
                    </span>
                  </div>
                ))}
              </div>
            )}
            {input.description && (
              <p className="text-xs text-muted-foreground">{input.description}</p>
            )}
            {hasError && (
              <p className="text-xs text-red-600 flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {validationErrors[errorKey]}
              </p>
            )}
          </div>
        );

      case 'selection':
        return (
          <div key={input.id} className="space-y-2">
            <Label htmlFor={input.id} className="text-sm font-medium">
              {input.label}
              {input.required && <span className="text-red-500 ml-1">*</span>}
            </Label>
            <Select
              value={value}
              onValueChange={(newValue) => handleInputChange(step.id, input.id, newValue)}
            >
              <SelectTrigger className={cn(hasError && 'border-red-500')}>
                <SelectValue placeholder="Select an option..." />
              </SelectTrigger>
              <SelectContent>
                {input.options?.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {input.description && (
              <p className="text-xs text-muted-foreground">{input.description}</p>
            )}
            {hasError && (
              <p className="text-xs text-red-600 flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {validationErrors[errorKey]}
              </p>
            )}
          </div>
        );

      default:
        return (
          <div key={input.id} className="space-y-2">
            <Label htmlFor={input.id} className="text-sm font-medium">
              {input.label}
              {input.required && <span className="text-red-500 ml-1">*</span>}
            </Label>
            <Input
              id={input.id}
              value={value}
              onChange={(e) => handleInputChange(step.id, input.id, e.target.value)}
              placeholder={input.placeholder}
              className={cn(hasError && 'border-red-500')}
            />
            {input.description && (
              <p className="text-xs text-muted-foreground">{input.description}</p>
            )}
            {hasError && (
              <p className="text-xs text-red-600 flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {validationErrors[errorKey]}
              </p>
            )}
          </div>
        );
    }
  };

  return (
    <div className={cn('h-full flex flex-col', className)}>
      {/* Header - Fixed */}
      <div className="flex-shrink-0">
        <Card className="mx-8 mt-8 shadow-sm">
          <CardHeader className="pb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-3">
                  <h1 className="text-3xl font-bold text-foreground">{execution.title}</h1>
                  <Badge variant="outline" className="flex items-center gap-1.5 px-3 py-1">
                    <Clock className="h-4 w-4" />
                    WORKFLOW
                  </Badge>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                {!isComplete && !isPaused && (
                  <Button variant="outline" size="default" onClick={handlePauseWorkflow} className="gap-2">
                    <Pause className="h-4 w-4" />
                    Pause
                  </Button>
                )}
                
                {isPaused && (
                  <Button variant="outline" size="default" onClick={handleResumeWorkflow} className="gap-2">
                    <Play className="h-4 w-4" />
                    Resume
                  </Button>
                )}
                
                {isComplete && (
                  <Button variant="outline" size="default" onClick={() => onExport?.(execution)} className="gap-2">
                    <Download className="h-4 w-4" />
                    Export
                  </Button>
                )}

                <Button variant="ghost" size="default" onClick={onClose} className="p-2">
                  <X className="h-5 w-5" />
                </Button>
              </div>
            </div>

            {/* Progress */}
            <div className="space-y-3 mt-6">
              <div className="flex items-center justify-between">
                <span className="text-base text-muted-foreground font-medium">
                  {isComplete ? 'Workflow Completed' : `Step ${execution.currentStep + 1} of ${template.steps.length}`}
                </span>
                <span className="text-lg font-semibold text-blue-600">
                  {progress?.percentage || 0}% Complete
                </span>
              </div>
              <Progress value={progress?.percentage || 0} className="h-3" />
            </div>
          </CardHeader>
        </Card>
      </div>

      {/* Steps - Scrollable */}
      <div className="flex-1 overflow-y-auto px-8 py-6">
        <div className="max-w-4xl mx-auto space-y-6">
          {template.steps.map((step, index) => {
            const stepStatus = getStepStatus(index);
            const isExpanded = expandedSteps.has(step.id);
            const isCurrent = stepStatus === 'current';
            const isCompleted = stepStatus === 'completed';
            const canInteract = isCurrent && !isProcessing;

            return (
              <Card key={step.id} className={cn(
                'transition-all duration-200 shadow-sm hover:shadow-md',
                isCurrent && 'border-blue-300 shadow-md ring-1 ring-blue-100',
                isCompleted && 'border-green-200 bg-green-50/30'
              )}>
                <CardHeader className="pb-4">
                  <div
                    className="flex items-center gap-4 cursor-pointer"
                    onClick={() => toggleStepExpansion(step.id)}
                  >
                    {getStepIcon(step, index)}
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className={cn(
                          'text-lg font-semibold',
                          isCompleted && 'text-green-700',
                          isCurrent && 'text-blue-700',
                          stepStatus === 'pending' && 'text-muted-foreground'
                        )}>
                          {step.name}
                        </h3>
                        {step.isOptional && (
                          <Badge variant="secondary" className="text-xs px-2 py-1">
                            Optional
                          </Badge>
                        )}
                      </div>
                      <p className="text-base text-muted-foreground leading-relaxed">
                        {step.description}
                      </p>
                      {step.estimatedTime && (
                        <p className="text-sm text-muted-foreground mt-2 flex items-center gap-2">
                          <Clock className="h-4 w-4" />
                          <span>Estimated time: {step.estimatedTime}</span>
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-3">
                      {isProcessing && isCurrent && (
                        <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
                      )}
                      {isExpanded ? (
                        <ChevronDown className="h-5 w-5 text-muted-foreground" />
                      ) : (
                        <ChevronRight className="h-5 w-5 text-muted-foreground" />
                      )}
                    </div>
                  </div>
                </CardHeader>

                {isExpanded && (
                  <CardContent className="pt-0">
                    <Separator className="mb-6" />
                    
                    {canInteract && (
                      <div className="space-y-6">
                        {step.inputs.map((input) => renderInput(step, input))}
                        
                        <div className="flex items-center justify-between pt-6 border-t">
                          <div className="text-sm text-muted-foreground">
                            {step.inputs.filter(i => i.required).length > 0 && (
                              <span className="flex items-center gap-2">
                                <span className="text-red-500">*</span>
                                Required fields
                              </span>
                            )}
                          </div>
                          
                          <Button
                            onClick={() => handleCompleteStep(step)}
                            disabled={isProcessing || !canProceed}
                            className="gap-2 px-6 py-2"
                            size="default"
                          >
                            {isProcessing ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <ArrowRight className="h-4 w-4" />
                            )}
                            {index === template.steps.length - 1 ? 'Complete Workflow' : 'Continue to Next Step'}
                          </Button>
                        </div>
                      </div>
                    )}

                    {isCompleted && (
                      <div className="space-y-4">
                        <div className="text-center py-4">
                          <CheckCircle className="h-8 w-8 text-green-600 mx-auto mb-2" />
                          <p className="text-sm text-green-700 font-medium">Step Completed</p>
                        </div>
                        
                        {/* Display generated content */}
                        {generatedContent[step.id] && (
                          <div className="border rounded-lg p-4 bg-green-50">
                            <h4 className="font-medium text-green-800 mb-2">Generated Results:</h4>
                            {renderGeneratedContent(step.id, generatedContent[step.id])}
                          </div>
                        )}
                      </div>
                    )}

                    {stepStatus === 'pending' && (
                      <div className="text-center py-4">
                        <Circle className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                        <p className="text-sm text-muted-foreground">Complete previous steps to unlock</p>
                      </div>
                    )}
                  </CardContent>
                )}
              </Card>
            );
          })}
        </div>
      </div>

      {/* Completion Message - Fixed at bottom */}
      {isComplete && (
        <div className="flex-shrink-0 px-8 pb-8">
          <Card className="border-green-300 bg-green-50/50 max-w-4xl mx-auto shadow-lg">
            <CardContent className="text-center py-12">
              <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-6" />
              <h2 className="text-2xl font-bold text-green-800 mb-3">
                Workflow Completed Successfully!
              </h2>
              <p className="text-green-700 mb-8 text-lg">
                Your {template.title.toLowerCase()} has been successfully completed and is ready for export.
              </p>
              <div className="flex items-center justify-center gap-4">
                <Button onClick={() => onExport?.(execution)} className="gap-2 px-6 py-3" size="lg">
                  <Download className="h-5 w-5" />
                  Export Results
                </Button>
                <Button variant="outline" onClick={onClose} size="lg" className="px-6 py-3">
                  Close Workflow
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};