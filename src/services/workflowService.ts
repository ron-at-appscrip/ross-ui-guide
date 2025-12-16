import { 
  WorkflowTemplate, 
  WorkflowExecution, 
  WorkflowFilters, 
  StepInput, 
  StepOutput, 
  WorkflowProgress,
  WorkflowCategory,
  ExportOptions,
  WorkflowMetrics
} from '@/types/workflow';

class WorkflowService {
  private readonly TEMPLATES_KEY = 'workflow_templates';
  private readonly EXECUTIONS_KEY = 'workflow_executions';
  private readonly METRICS_KEY = 'workflow_metrics';

  // Template Management
  getTemplates(filters?: WorkflowFilters): WorkflowTemplate[] {
    const templates = this.loadTemplates();
    if (!filters) return templates;

    return templates.filter(template => {
      if (filters.category && template.category !== filters.category) return false;
      if (filters.complexity && template.complexity !== filters.complexity) return false;
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        const matchesSearch = 
          template.title.toLowerCase().includes(searchLower) ||
          template.description.toLowerCase().includes(searchLower) ||
          template.tags.some(tag => tag.toLowerCase().includes(searchLower));
        if (!matchesSearch) return false;
      }
      if (filters.tags && filters.tags.length > 0) {
        const hasMatchingTag = filters.tags.some(tag => template.tags.includes(tag));
        if (!hasMatchingTag) return false;
      }
      return template.isActive;
    });
  }

  getTemplate(id: string): WorkflowTemplate | null {
    const templates = this.loadTemplates();
    return templates.find(t => t.id === id) || null;
  }

  createTemplate(template: Omit<WorkflowTemplate, 'id' | 'createdAt' | 'updatedAt' | 'version'>): WorkflowTemplate {
    const newTemplate: WorkflowTemplate = {
      ...template,
      id: this.generateId(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      version: '1.0.0'
    };

    const templates = this.loadTemplates();
    templates.push(newTemplate);
    this.saveTemplates(templates);
    
    return newTemplate;
  }

  // Workflow Execution Management
  createExecution(templateId: string, title?: string): WorkflowExecution {
    const template = this.getTemplate(templateId);
    if (!template) {
      throw new Error(`Template with ID ${templateId} not found`);
    }

    const execution: WorkflowExecution = {
      id: this.generateId(),
      templateId,
      title: title || template.title,
      status: 'not_started',
      currentStep: 0,
      startedAt: new Date().toISOString(),
      context: {},
      inputs: [],
      outputs: [],
      userId: 'current-user', // In real app, get from auth context
      progress: {
        completed: 0,
        total: template.steps.length,
        percentage: 0
      }
    };

    const executions = this.loadExecutions();
    executions.push(execution);
    this.saveExecutions(executions);

    return execution;
  }

  getExecution(id: string): WorkflowExecution | null {
    const executions = this.loadExecutions();
    return executions.find(e => e.id === id) || null;
  }

  updateExecution(id: string, updates: Partial<WorkflowExecution>): WorkflowExecution | null {
    const executions = this.loadExecutions();
    const index = executions.findIndex(e => e.id === id);
    
    if (index === -1) return null;

    executions[index] = {
      ...executions[index],
      ...updates,
      updatedAt: new Date().toISOString()
    };

    this.saveExecutions(executions);
    return executions[index];
  }

  // Step Management
  addStepInput(executionId: string, stepInput: StepInput): void {
    const execution = this.getExecution(executionId);
    if (!execution) return;

    // Remove existing input for this step and input ID
    execution.inputs = execution.inputs.filter(
      input => !(input.stepId === stepInput.stepId && input.inputId === stepInput.inputId)
    );
    
    execution.inputs.push(stepInput);
    this.updateExecution(executionId, { inputs: execution.inputs });
  }

  addStepOutput(executionId: string, stepOutput: StepOutput): void {
    const execution = this.getExecution(executionId);
    if (!execution) return;

    execution.outputs.push(stepOutput);
    this.updateExecution(executionId, { outputs: execution.outputs });
  }

  completeStep(executionId: string, stepId: string): WorkflowProgress | null {
    const execution = this.getExecution(executionId);
    const template = execution ? this.getTemplate(execution.templateId) : null;
    
    if (!execution || !template) return null;

    const stepIndex = template.steps.findIndex(s => s.id === stepId);
    if (stepIndex === -1) return null;

    const progress = this.calculateProgress(execution, template);
    const nextStepIndex = stepIndex + 1;
    
    const updates: Partial<WorkflowExecution> = {
      currentStep: nextStepIndex,
      progress: {
        completed: stepIndex + 1,
        total: template.steps.length,
        percentage: Math.round(((stepIndex + 1) / template.steps.length) * 100)
      }
    };

    // Check if workflow is complete
    if (nextStepIndex >= template.steps.length) {
      updates.status = 'completed';
      updates.completedAt = new Date().toISOString();
      this.updateMetrics(template.id, execution);
    } else {
      updates.status = 'in_progress';
    }

    this.updateExecution(executionId, updates);
    return this.calculateProgress(execution, template);
  }

  pauseExecution(executionId: string): void {
    this.updateExecution(executionId, {
      status: 'paused',
      pausedAt: new Date().toISOString()
    });
  }

  resumeExecution(executionId: string): void {
    this.updateExecution(executionId, {
      status: 'in_progress',
      pausedAt: undefined
    });
  }

  // Progress Calculation
  calculateProgress(execution: WorkflowExecution, template: WorkflowTemplate): WorkflowProgress {
    const completedSteps: string[] = [];
    const pendingSteps: string[] = [];
    const skippedSteps: string[] = [];

    template.steps.forEach((step, index) => {
      if (index < execution.currentStep) {
        completedSteps.push(step.id);
      } else if (index === execution.currentStep) {
        // Current step is pending
        pendingSteps.push(step.id);
      } else {
        pendingSteps.push(step.id);
      }
    });

    const isComplete = execution.currentStep >= template.steps.length;
    const canProceed = this.canProceedToNextStep(execution, template);
    const nextStepId = !isComplete && execution.currentStep < template.steps.length 
      ? template.steps[execution.currentStep].id 
      : undefined;

    return {
      currentStepIndex: execution.currentStep,
      completedSteps,
      pendingSteps,
      skippedSteps,
      totalSteps: template.steps.length,
      isComplete,
      canProceed,
      nextStepId
    };
  }

  private canProceedToNextStep(execution: WorkflowExecution, template: WorkflowTemplate): boolean {
    if (execution.currentStep >= template.steps.length) return false;
    
    const currentStep = template.steps[execution.currentStep];
    if (!currentStep) return false;

    // Check if all required inputs are provided
    const requiredInputs = currentStep.inputs.filter(input => input.required);
    const providedInputs = execution.inputs.filter(input => input.stepId === currentStep.id);
    
    for (const requiredInput of requiredInputs) {
      const hasInput = providedInputs.some(input => 
        input.inputId === requiredInput.id && 
        input.value !== null && 
        input.value !== undefined && 
        input.value !== ''
      );
      if (!hasInput) return false;
    }

    // Check dependencies
    if (currentStep.dependencies) {
      const completedStepIds = new Set(
        template.steps
          .slice(0, execution.currentStep)
          .map(step => step.id)
      );
      
      for (const depId of currentStep.dependencies) {
        if (!completedStepIds.has(depId)) return false;
      }
    }

    return true;
  }

  // Analytics & Metrics
  getMetrics(templateId?: string): WorkflowMetrics {
    const metrics = this.loadMetrics();
    if (templateId && metrics[templateId]) {
      return metrics[templateId];
    }

    // Aggregate metrics across all templates
    const allMetrics = Object.values(metrics);
    return {
      totalExecutions: allMetrics.reduce((sum, m) => sum + m.totalExecutions, 0),
      averageCompletionTime: allMetrics.reduce((sum, m) => sum + m.averageCompletionTime, 0) / (allMetrics.length || 1),
      successRate: allMetrics.reduce((sum, m) => sum + m.successRate, 0) / (allMetrics.length || 1),
      popularSteps: [],
      userSatisfactionScore: allMetrics.reduce((sum, m) => sum + (m.userSatisfactionScore || 0), 0) / (allMetrics.length || 1)
    };
  }

  private updateMetrics(templateId: string, execution: WorkflowExecution): void {
    const metrics = this.loadMetrics();
    const currentMetrics = metrics[templateId] || {
      totalExecutions: 0,
      averageCompletionTime: 0,
      successRate: 0,
      popularSteps: []
    };

    const executionTime = execution.completedAt && execution.startedAt
      ? new Date(execution.completedAt).getTime() - new Date(execution.startedAt).getTime()
      : 0;

    const newTotalExecutions = currentMetrics.totalExecutions + 1;
    const newAverageTime = ((currentMetrics.averageCompletionTime * currentMetrics.totalExecutions) + executionTime) / newTotalExecutions;
    const newSuccessRate = execution.status === 'completed' 
      ? ((currentMetrics.successRate * currentMetrics.totalExecutions) + 1) / newTotalExecutions
      : currentMetrics.successRate;

    metrics[templateId] = {
      ...currentMetrics,
      totalExecutions: newTotalExecutions,
      averageCompletionTime: newAverageTime,
      successRate: newSuccessRate
    };

    this.saveMetrics(metrics);
  }

  // Export Functionality
  exportExecution(executionId: string, options: ExportOptions): any {
    const execution = this.getExecution(executionId);
    const template = execution ? this.getTemplate(execution.templateId) : null;
    
    if (!execution || !template) return null;

    const exportData: any = {
      workflow: {
        title: execution.title,
        template: template.title,
        category: template.category,
        completedAt: execution.completedAt,
        status: execution.status
      }
    };

    if (options.sections.summary) {
      exportData.summary = {
        totalSteps: template.steps.length,
        completedSteps: execution.progress.completed,
        timeSpent: execution.timeSpent,
        successRate: execution.status === 'completed' ? 100 : 0
      };
    }

    if (options.sections.steps) {
      exportData.steps = template.steps.map(step => ({
        name: step.name,
        description: step.description,
        type: step.type,
        completed: execution.currentStep > step.order
      }));
    }

    if (options.sections.outputs && options.includeInputs) {
      exportData.inputs = execution.inputs;
    }

    if (options.sections.outputs) {
      exportData.outputs = execution.outputs.filter(output => output.exportable);
    }

    if (options.sections.timeline) {
      exportData.timeline = this.generateTimeline(execution, template);
    }

    return exportData;
  }

  private generateTimeline(execution: WorkflowExecution, template: WorkflowTemplate): any[] {
    const timeline = [];
    
    timeline.push({
      event: 'Workflow Started',
      timestamp: execution.startedAt,
      type: 'start'
    });

    execution.inputs.forEach(input => {
      timeline.push({
        event: `Input provided for ${template.steps.find(s => s.id === input.stepId)?.name}`,
        timestamp: input.timestamp,
        type: 'input'
      });
    });

    execution.outputs.forEach(output => {
      timeline.push({
        event: `Output generated for ${template.steps.find(s => s.id === output.stepId)?.name}`,
        timestamp: output.timestamp,
        type: 'output'
      });
    });

    if (execution.completedAt) {
      timeline.push({
        event: 'Workflow Completed',
        timestamp: execution.completedAt,
        type: 'completion'
      });
    }

    return timeline.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  }

  // Utility Methods
  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  private loadTemplates(): WorkflowTemplate[] {
    try {
      const stored = localStorage.getItem(this.TEMPLATES_KEY);
      return stored ? JSON.parse(stored) : this.getDefaultTemplates();
    } catch {
      return this.getDefaultTemplates();
    }
  }

  private saveTemplates(templates: WorkflowTemplate[]): void {
    localStorage.setItem(this.TEMPLATES_KEY, JSON.stringify(templates));
  }

  private loadExecutions(): WorkflowExecution[] {
    try {
      const stored = localStorage.getItem(this.EXECUTIONS_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }

  private saveExecutions(executions: WorkflowExecution[]): void {
    localStorage.setItem(this.EXECUTIONS_KEY, JSON.stringify(executions));
  }

  private loadMetrics(): Record<string, WorkflowMetrics> {
    try {
      const stored = localStorage.getItem(this.METRICS_KEY);
      return stored ? JSON.parse(stored) : {};
    } catch {
      return {};
    }
  }

  private saveMetrics(metrics: Record<string, WorkflowMetrics>): void {
    localStorage.setItem(this.METRICS_KEY, JSON.stringify(metrics));
  }

  private getDefaultTemplates(): WorkflowTemplate[] {
    return [
      {
        id: 'draft-client-alert',
        title: 'Draft a Client Alert',
        description: 'Create professional client alerts about regulatory changes, new laws, or important legal developments affecting your clients.',
        category: 'general',
        steps: [
          {
            id: 'step-1',
            name: 'Upload Information Source',
            description: 'Upload a file or paste text of the opinion, regulation, statute, or other information source that will be the topic of the client alert.',
            type: 'upload',
            order: 0,
            inputs: [
              {
                id: 'source-document',
                type: 'file',
                label: 'Information Source',
                description: 'Upload the source document or regulation',
                required: true,
                fileTypes: ['.pdf', '.docx', '.txt'],
                maxFileSize: 10485760 // 10MB
              },
              {
                id: 'source-text',
                type: 'text',
                label: 'Or paste text directly',
                description: 'Alternatively, paste the relevant text content',
                required: false,
                placeholder: 'Paste regulation text, news article, or other source material...'
              }
            ],
            expectedOutputs: [
              { type: 'analysis', format: 'text', description: 'Initial source analysis' }
            ],
            estimatedTime: '2-3 minutes'
          },
          {
            id: 'step-2',
            name: 'Upload Example Document',
            description: 'Upload a file or paste text of a prior client alert that you want to use as an exemplar.',
            type: 'upload',
            order: 1,
            inputs: [
              {
                id: 'example-alert',
                type: 'file',
                label: 'Example Client Alert',
                description: 'Upload a previous client alert to match style and tone',
                required: false,
                fileTypes: ['.pdf', '.docx', '.txt'],
                maxFileSize: 5242880 // 5MB
              }
            ],
            expectedOutputs: [
              { type: 'analysis', format: 'text', description: 'Style and structure analysis' }
            ],
            estimatedTime: '1-2 minutes',
            isOptional: true
          },
          {
            id: 'step-3',
            name: 'Generate Draft',
            description: 'AI generates a comprehensive client alert draft based on your inputs.',
            type: 'generation',
            order: 2,
            inputs: [
              {
                id: 'target-audience',
                type: 'selection',
                label: 'Target Client Type',
                description: 'Who should receive this alert?',
                required: true,
                options: [
                  { value: 'public-companies', label: 'Public Companies' },
                  { value: 'private-companies', label: 'Private Companies' },
                  { value: 'individuals', label: 'Individual Clients' },
                  { value: 'nonprofits', label: 'Non-profit Organizations' },
                  { value: 'all-clients', label: 'All Clients' }
                ]
              },
              {
                id: 'urgency-level',
                type: 'selection',
                label: 'Urgency Level',
                description: 'How urgent is this information?',
                required: true,
                options: [
                  { value: 'immediate', label: 'Immediate Action Required' },
                  { value: 'high', label: 'High Priority' },
                  { value: 'medium', label: 'Medium Priority' },
                  { value: 'informational', label: 'Informational Only' }
                ]
              }
            ],
            expectedOutputs: [
              { type: 'document', format: 'docx', description: 'Client alert draft' }
            ],
            estimatedTime: '3-5 minutes'
          },
          {
            id: 'step-4',
            name: 'Review and Finalize',
            description: 'Review the generated draft and make any necessary adjustments.',
            type: 'review',
            order: 3,
            inputs: [
              {
                id: 'review-notes',
                type: 'text',
                label: 'Review Comments',
                description: 'Add any specific changes or adjustments needed',
                required: false,
                placeholder: 'Add specific changes, tone adjustments, or additional information needed...'
              }
            ],
            expectedOutputs: [
              { type: 'document', format: 'docx', description: 'Final client alert' }
            ],
            estimatedTime: '2-3 minutes'
          }
        ],
        estimatedTotalTime: '8-13 minutes',
        icon: 'file-text',
        color: 'from-blue-50 to-blue-100',
        tags: ['client-communication', 'regulatory', 'alerts', 'professional'],
        complexity: 'moderate',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        version: '1.0.0',
        isActive: true
      },
      {
        id: 'analyze-contract',
        title: 'Analyze Contract Risk',
        description: 'Comprehensive contract analysis to identify potential risks, problematic clauses, and compliance issues.',
        category: 'transactional',
        steps: [
          {
            id: 'contract-upload',
            name: 'Upload Contract',
            description: 'Upload the contract document for comprehensive analysis.',
            type: 'upload',
            order: 0,
            inputs: [
              {
                id: 'contract-document',
                type: 'file',
                label: 'Contract Document',
                description: 'Upload the contract to be analyzed',
                required: true,
                fileTypes: ['.pdf', '.docx'],
                maxFileSize: 15728640 // 15MB
              },
              {
                id: 'contract-type',
                type: 'selection',
                label: 'Contract Type',
                description: 'What type of contract is this?',
                required: true,
                options: [
                  { value: 'employment', label: 'Employment Agreement' },
                  { value: 'service', label: 'Service Agreement' },
                  { value: 'purchase', label: 'Purchase Agreement' },
                  { value: 'lease', label: 'Lease Agreement' },
                  { value: 'nda', label: 'Non-Disclosure Agreement' },
                  { value: 'partnership', label: 'Partnership Agreement' },
                  { value: 'other', label: 'Other Contract Type' }
                ]
              }
            ],
            expectedOutputs: [
              { type: 'analysis', format: 'json', description: 'Initial contract structure analysis' }
            ],
            estimatedTime: '2-3 minutes'
          },
          {
            id: 'risk-analysis',
            name: 'Risk Assessment',
            description: 'AI analyzes the contract for potential legal risks and problematic clauses.',
            type: 'analysis',
            order: 1,
            inputs: [
              {
                id: 'risk-focus',
                type: 'selection',
                label: 'Risk Focus Areas',
                description: 'Which areas should we focus on?',
                required: false,
                options: [
                  { value: 'liability', label: 'Liability and Indemnification' },
                  { value: 'termination', label: 'Termination Clauses' },
                  { value: 'payment', label: 'Payment Terms' },
                  { value: 'ip', label: 'Intellectual Property' },
                  { value: 'compliance', label: 'Regulatory Compliance' },
                  { value: 'all', label: 'All Risk Areas' }
                ]
              }
            ],
            expectedOutputs: [
              { type: 'report', format: 'html', description: 'Risk assessment report' }
            ],
            estimatedTime: '3-5 minutes'
          },
          {
            id: 'recommendations',
            name: 'Generate Recommendations',
            description: 'Provide actionable recommendations to mitigate identified risks.',
            type: 'generation',
            order: 2,
            inputs: [
              {
                id: 'client-position',
                type: 'selection',
                label: 'Client Position',
                description: 'Is your client the buyer or seller in this transaction?',
                required: true,
                options: [
                  { value: 'buyer', label: 'Buyer/Customer' },
                  { value: 'seller', label: 'Seller/Vendor' },
                  { value: 'employer', label: 'Employer' },
                  { value: 'employee', label: 'Employee' },
                  { value: 'tenant', label: 'Tenant' },
                  { value: 'landlord', label: 'Landlord' }
                ]
              }
            ],
            expectedOutputs: [
              { type: 'report', format: 'docx', description: 'Recommendations report' }
            ],
            estimatedTime: '2-4 minutes'
          }
        ],
        estimatedTotalTime: '7-12 minutes',
        icon: 'shield',
        color: 'from-red-50 to-red-100',
        tags: ['contract-review', 'risk-analysis', 'due-diligence'],
        complexity: 'moderate',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        version: '1.0.0',
        isActive: true
      },
      {
        id: 'legal-memo',
        title: 'Draft Legal Memo',
        description: 'Generate comprehensive legal memoranda with research, analysis, and recommendations.',
        category: 'litigation',
        steps: [
          {
            id: 'memo-scope',
            name: 'Define Memo Scope',
            description: 'Provide the legal question and context for the memorandum.',
            type: 'input',
            order: 0,
            inputs: [
              {
                id: 'legal-question',
                type: 'text',
                label: 'Legal Question',
                description: 'What is the specific legal question to be addressed?',
                required: true,
                placeholder: 'State the legal issue or question to be researched and analyzed...'
              },
              {
                id: 'factual-background',
                type: 'text',
                label: 'Factual Background',
                description: 'Provide relevant facts and context',
                required: true,
                placeholder: 'Describe the relevant facts, circumstances, and background information...'
              },
              {
                id: 'jurisdiction',
                type: 'selection',
                label: 'Jurisdiction',
                description: 'Which jurisdiction\'s law applies?',
                required: true,
                options: [
                  { value: 'federal', label: 'Federal Law' },
                  { value: 'california', label: 'California' },
                  { value: 'new-york', label: 'New York' },
                  { value: 'texas', label: 'Texas' },
                  { value: 'florida', label: 'Florida' },
                  { value: 'other', label: 'Other State/Jurisdiction' }
                ]
              }
            ],
            expectedOutputs: [
              { type: 'analysis', format: 'text', description: 'Issue spotting and research plan' }
            ],
            estimatedTime: '3-5 minutes'
          },
          {
            id: 'legal-research',
            name: 'Legal Research',
            description: 'AI conducts legal research and identifies relevant authorities.',
            type: 'analysis',
            order: 1,
            inputs: [
              {
                id: 'research-depth',
                type: 'selection',
                label: 'Research Depth',
                description: 'How comprehensive should the research be?',
                required: true,
                options: [
                  { value: 'basic', label: 'Basic - Key cases and statutes' },
                  { value: 'standard', label: 'Standard - Comprehensive research' },
                  { value: 'extensive', label: 'Extensive - Deep dive with secondary sources' }
                ]
              }
            ],
            expectedOutputs: [
              { type: 'report', format: 'html', description: 'Research findings with citations' }
            ],
            estimatedTime: '5-8 minutes'
          },
          {
            id: 'draft-memo',
            name: 'Generate Memo Draft',
            description: 'Create a structured legal memorandum with analysis and conclusions.',
            type: 'generation',
            order: 2,
            inputs: [
              {
                id: 'memo-style',
                type: 'selection',
                label: 'Memo Style',
                description: 'What style of memorandum?',
                required: true,
                options: [
                  { value: 'formal', label: 'Formal Legal Memo' },
                  { value: 'internal', label: 'Internal Office Memo' },
                  { value: 'client', label: 'Client Advisory Letter' },
                  { value: 'brief', label: 'Executive Summary' }
                ]
              }
            ],
            expectedOutputs: [
              { type: 'document', format: 'docx', description: 'Legal memorandum draft' }
            ],
            estimatedTime: '4-6 minutes'
          }
        ],
        estimatedTotalTime: '12-19 minutes',
        icon: 'file-text',
        color: 'from-purple-50 to-purple-100',
        tags: ['legal-research', 'memorandum', 'analysis', 'litigation'],
        complexity: 'complex',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        version: '1.0.0',
        isActive: true
      },
      {
        id: 'document-review',
        title: 'Document Review',
        description: 'Quick review and summary of legal documents with key findings and action items.',
        category: 'general',
        steps: [
          {
            id: 'document-upload',
            name: 'Upload Document',
            description: 'Upload the document(s) you need reviewed.',
            type: 'upload',
            order: 0,
            inputs: [
              {
                id: 'documents',
                type: 'file',
                label: 'Documents to Review',
                description: 'Upload one or more documents for review',
                required: true,
                fileTypes: ['.pdf', '.docx', '.txt'],
                maxFileSize: 20971520 // 20MB
              },
              {
                id: 'review-purpose',
                type: 'selection',
                label: 'Review Purpose',
                description: 'What type of review do you need?',
                required: true,
                options: [
                  { value: 'summary', label: 'Summary and Key Points' },
                  { value: 'compliance', label: 'Compliance Check' },
                  { value: 'risk', label: 'Risk Identification' },
                  { value: 'comparison', label: 'Compare with Standards' },
                  { value: 'extraction', label: 'Extract Specific Information' }
                ]
              }
            ],
            expectedOutputs: [
              { type: 'summary', format: 'html', description: 'Document review summary' }
            ],
            estimatedTime: '3-7 minutes'
          }
        ],
        estimatedTotalTime: '3-7 minutes',
        icon: 'search',
        color: 'from-green-50 to-green-100',
        tags: ['document-review', 'summary', 'quick-analysis'],
        complexity: 'simple',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        version: '1.0.0',
        isActive: true
      }
    ];
  }
}

export const workflowService = new WorkflowService();