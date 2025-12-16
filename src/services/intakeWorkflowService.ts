import { WorkflowTemplate, WorkflowExecution, NewMatterData } from '@/types/workflow';
import { Lead, NewLeadData, ConflictCheckResult } from '@/types/lead';
import { NewClientData } from '@/types/client';
import { LeadService } from './leadService';
import { ClientService } from './clientService';
import { MatterService } from './matterService';

/**
 * IntakeWorkflowService
 * Handles Phase 1 client intake and onboarding workflows
 * Integrates with lead management, conflict checking, and client conversion
 */
export class IntakeWorkflowService {
  private static readonly INTAKE_TEMPLATES_KEY = 'intake_workflow_templates';
  private static readonly INTAKE_EXECUTIONS_KEY = 'intake_workflow_executions';

  /**
   * Pre-defined intake workflow templates for different practice areas
   */
  private static readonly PREDEFINED_TEMPLATES: WorkflowTemplate[] = [
    {
      id: 'estate-planning-intake',
      title: 'Estate Planning Client Intake',
      description: 'Comprehensive intake process for estate planning clients including will, trust, and inheritance planning.',
      category: 'general',
      estimatedTotalTime: '45-60 minutes',
      icon: 'FileText',
      color: 'blue',
      tags: ['estate-planning', 'intake', 'client-onboarding'],
      complexity: 'moderate',
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
      version: '1.0.0',
      isActive: true,
      steps: [
        {
          id: 'lead-qualification',
          name: 'Lead Qualification',
          description: 'Qualify the lead and assess estate planning needs',
          type: 'analysis',
          order: 1,
          prompt: 'Review the lead information and assess their estate planning needs. Consider asset value, family complexity, and urgency.',
          inputs: [
            {
              id: 'lead-info',
              type: 'document',
              label: 'Lead Information',
              description: 'Initial lead details from intake form',
              required: true
            },
            {
              id: 'asset-estimate',
              type: 'text',
              label: 'Estimated Asset Value',
              description: 'Client\'s estimated total asset value',
              required: true,
              placeholder: 'e.g., $2.5M'
            },
            {
              id: 'family-situation',
              type: 'textarea',
              label: 'Family Situation',
              description: 'Details about family structure, beneficiaries, special needs',
              required: true
            }
          ],
          expectedOutputs: [
            {
              type: 'analysis',
              format: 'structured',
              description: 'Lead qualification assessment with recommendations'
            }
          ],
          estimatedTime: '10 minutes'
        },
        {
          id: 'conflict-check',
          name: 'Conflict of Interest Check',
          description: 'Perform comprehensive conflict check against existing clients and matters',
          type: 'analysis',
          order: 2,
          prompt: 'Search for potential conflicts of interest with client name, spouse, beneficiaries, and related entities.',
          inputs: [
            {
              id: 'client-name',
              type: 'text',
              label: 'Client Full Name',
              description: 'Primary client name for conflict check',
              required: true
            },
            {
              id: 'spouse-name',
              type: 'text',
              label: 'Spouse Name',
              description: 'Spouse or partner name if applicable',
              required: false
            },
            {
              id: 'related-entities',
              type: 'textarea',
              label: 'Related Entities',
              description: 'Family trusts, businesses, or other entities to check',
              required: false
            }
          ],
          expectedOutputs: [
            {
              type: 'analysis',
              format: 'structured',
              description: 'Conflict check results with clear/conflict determination'
            }
          ],
          estimatedTime: '5 minutes'
        },
        {
          id: 'consultation-prep',
          name: 'Consultation Preparation',
          description: 'Prepare consultation materials and schedule initial meeting',
          type: 'generation',
          order: 3,
          prompt: 'Generate consultation preparation materials including agenda, document checklist, and preliminary assessment.',
          inputs: [
            {
              id: 'consultation-type',
              type: 'selection',
              label: 'Consultation Type',
              description: 'Type of initial consultation',
              required: true,
              options: [
                { value: 'in-person', label: 'In-Person Meeting' },
                { value: 'video-call', label: 'Video Conference' },
                { value: 'phone-call', label: 'Phone Consultation' }
              ]
            },
            {
              id: 'availability',
              type: 'text',
              label: 'Client Availability',
              description: 'Client\'s preferred times for consultation',
              required: true
            }
          ],
          expectedOutputs: [
            {
              type: 'document',
              format: 'pdf',
              description: 'Consultation agenda and document checklist'
            },
            {
              type: 'summary',
              format: 'text',
              description: 'Pre-consultation client summary'
            }
          ],
          estimatedTime: '15 minutes'
        },
        {
          id: 'engagement-letter',
          name: 'Engagement Letter Generation',
          description: 'Generate customized engagement letter based on client needs',
          type: 'generation',
          order: 4,
          dependencies: ['conflict-check'],
          prompt: 'Create a comprehensive engagement letter tailored to the client\'s estate planning needs.',
          inputs: [
            {
              id: 'services-scope',
              type: 'selection',
              label: 'Scope of Services',
              description: 'Estate planning services to be provided',
              required: true,
              options: [
                { value: 'basic-will', label: 'Basic Will Package' },
                { value: 'revocable-trust', label: 'Revocable Living Trust' },
                { value: 'comprehensive', label: 'Comprehensive Estate Plan' },
                { value: 'business-succession', label: 'Business Succession Planning' }
              ]
            },
            {
              id: 'fee-structure',
              type: 'selection',
              label: 'Fee Structure',
              description: 'Billing arrangement for services',
              required: true,
              options: [
                { value: 'flat-fee', label: 'Flat Fee Package' },
                { value: 'hourly', label: 'Hourly Billing' },
                { value: 'hybrid', label: 'Hybrid (Flat + Hourly)' }
              ]
            }
          ],
          expectedOutputs: [
            {
              type: 'document',
              format: 'docx',
              description: 'Customized engagement letter ready for signature'
            }
          ],
          estimatedTime: '15 minutes'
        }
      ]
    },
    {
      id: 'corporate-law-intake',
      title: 'Corporate Law Client Intake',
      description: 'Intake process for corporate clients including startups, M&A, and general corporate counsel.',
      category: 'transactional',
      estimatedTotalTime: '30-45 minutes',
      icon: 'Building',
      color: 'green',
      tags: ['corporate-law', 'business', 'intake', 'startup'],
      complexity: 'complex',
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
      version: '1.0.0',
      isActive: true,
      steps: [
        {
          id: 'business-assessment',
          name: 'Business Assessment',
          description: 'Analyze business structure, stage, and legal needs',
          type: 'analysis',
          order: 1,
          prompt: 'Evaluate the business structure, funding stage, legal priorities, and immediate needs.',
          inputs: [
            {
              id: 'business-stage',
              type: 'selection',
              label: 'Business Stage',
              description: 'Current stage of business development',
              required: true,
              options: [
                { value: 'idea-stage', label: 'Idea/Concept Stage' },
                { value: 'startup', label: 'Early Stage Startup' },
                { value: 'growth', label: 'Growth Stage' },
                { value: 'established', label: 'Established Business' },
                { value: 'exit-planning', label: 'Exit Planning' }
              ]
            },
            {
              id: 'legal-structure',
              type: 'selection',
              label: 'Current Legal Structure',
              description: 'Existing business entity type',
              required: true,
              options: [
                { value: 'none', label: 'No Entity (Sole Proprietor)' },
                { value: 'llc', label: 'Limited Liability Company' },
                { value: 'corporation', label: 'Corporation' },
                { value: 'partnership', label: 'Partnership' },
                { value: 'other', label: 'Other' }
              ]
            },
            {
              id: 'funding-status',
              type: 'text',
              label: 'Funding Status',
              description: 'Current funding stage and amount if applicable',
              required: false,
              placeholder: 'e.g., Seed round $500K raised'
            }
          ],
          expectedOutputs: [
            {
              type: 'analysis',
              format: 'structured',
              description: 'Business assessment with legal priority recommendations'
            }
          ],
          estimatedTime: '10 minutes'
        },
        {
          id: 'corporate-conflict-check',
          name: 'Corporate Conflict Check',
          description: 'Check for conflicts with competitors, investors, or related entities',
          type: 'analysis',
          order: 2,
          prompt: 'Perform comprehensive conflict check including competitors, investors, board members, and related entities.',
          inputs: [
            {
              id: 'company-name',
              type: 'text',
              label: 'Company Name',
              description: 'Official company name and any DBAs',
              required: true
            },
            {
              id: 'key-personnel',
              type: 'textarea',
              label: 'Key Personnel',
              description: 'Founders, officers, board members, key employees',
              required: true
            },
            {
              id: 'investors',
              type: 'textarea',
              label: 'Investors/Partners',
              description: 'Current and potential investors, business partners',
              required: false
            },
            {
              id: 'competitors',
              type: 'textarea',
              label: 'Known Competitors',
              description: 'Primary competitors in the market space',
              required: false
            }
          ],
          expectedOutputs: [
            {
              type: 'analysis',
              format: 'structured',
              description: 'Comprehensive conflict check results'
            }
          ],
          estimatedTime: '10 minutes'
        },
        {
          id: 'service-proposal',
          name: 'Service Proposal Generation',
          description: 'Create customized legal services proposal',
          type: 'generation',
          order: 3,
          dependencies: ['business-assessment', 'corporate-conflict-check'],
          prompt: 'Generate a comprehensive proposal outlining recommended legal services and engagement structure.',
          inputs: [
            {
              id: 'immediate-needs',
              type: 'selection',
              label: 'Immediate Legal Needs',
              description: 'Most urgent legal requirements',
              required: true,
              options: [
                { value: 'incorporation', label: 'Entity Formation/Incorporation' },
                { value: 'funding-prep', label: 'Funding Preparation' },
                { value: 'contract-review', label: 'Contract Review/Negotiation' },
                { value: 'ip-protection', label: 'IP Protection' },
                { value: 'compliance', label: 'Regulatory Compliance' },
                { value: 'employment', label: 'Employment Issues' }
              ]
            },
            {
              id: 'engagement-type',
              type: 'selection',
              label: 'Preferred Engagement Type',
              description: 'How client prefers to work with counsel',
              required: true,
              options: [
                { value: 'project-based', label: 'Project-Based Engagement' },
                { value: 'general-counsel', label: 'Ongoing General Counsel' },
                { value: 'retainer', label: 'Monthly Retainer' },
                { value: 'hybrid', label: 'Hybrid Arrangement' }
              ]
            }
          ],
          expectedOutputs: [
            {
              type: 'document',
              format: 'pdf',
              description: 'Comprehensive service proposal with fee structure'
            }
          ],
          estimatedTime: '15 minutes'
        }
      ]
    },
    {
      id: 'employment-law-intake',
      title: 'Employment Law Client Intake',
      description: 'Intake process for employment law matters including discrimination, wrongful termination, and workplace issues.',
      category: 'litigation',
      estimatedTotalTime: '35-50 minutes',
      icon: 'Users',
      color: 'purple',
      tags: ['employment-law', 'workplace', 'discrimination', 'litigation'],
      complexity: 'moderate',
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
      version: '1.0.0',
      isActive: true,
      steps: [
        {
          id: 'case-evaluation',
          name: 'Employment Case Evaluation',
          description: 'Assess the employment law claim and potential case merit',
          type: 'analysis',
          order: 1,
          prompt: 'Evaluate the employment law claim for merit, statute of limitations, damages, and litigation potential.',
          inputs: [
            {
              id: 'claim-type',
              type: 'selection',
              label: 'Type of Claim',
              description: 'Primary employment law issue',
              required: true,
              options: [
                { value: 'discrimination', label: 'Discrimination (Race, Gender, Age, etc.)' },
                { value: 'harassment', label: 'Sexual or Other Harassment' },
                { value: 'wrongful-termination', label: 'Wrongful Termination' },
                { value: 'retaliation', label: 'Retaliation' },
                { value: 'wage-hour', label: 'Wage and Hour Violations' },
                { value: 'whistleblower', label: 'Whistleblower Protection' },
                { value: 'disability', label: 'Disability Rights/ADA' }
              ]
            },
            {
              id: 'timeline',
              type: 'textarea',
              label: 'Timeline of Events',
              description: 'Chronological description of key events and incidents',
              required: true
            },
            {
              id: 'employment-details',
              type: 'textarea',
              label: 'Employment Details',
              description: 'Job title, department, supervisor, dates of employment, salary',
              required: true
            },
            {
              id: 'damages',
              type: 'textarea',
              label: 'Damages/Losses',
              description: 'Lost wages, benefits, emotional distress, medical costs',
              required: true
            }
          ],
          expectedOutputs: [
            {
              type: 'analysis',
              format: 'structured',
              description: 'Case merit evaluation with strength assessment'
            }
          ],
          estimatedTime: '15 minutes'
        },
        {
          id: 'employer-conflict-check',
          name: 'Employer Conflict Check',
          description: 'Check for conflicts with employer and related entities',
          type: 'analysis',
          order: 2,
          prompt: 'Check for representation conflicts with employer, management, HR personnel, and related companies.',
          inputs: [
            {
              id: 'employer-name',
              type: 'text',
              label: 'Employer Name',
              description: 'Current or former employer name',
              required: true
            },
            {
              id: 'parent-companies',
              type: 'text',
              label: 'Parent/Related Companies',
              description: 'Parent company, subsidiaries, affiliated entities',
              required: false
            },
            {
              id: 'management-names',
              type: 'textarea',
              label: 'Management Personnel',
              description: 'Supervisors, HR personnel, executives involved',
              required: true
            }
          ],
          expectedOutputs: [
            {
              type: 'analysis',
              format: 'structured',
              description: 'Conflict check results for employment matter'
            }
          ],
          estimatedTime: '5 minutes'
        },
        {
          id: 'representation-agreement',
          name: 'Representation Agreement',
          description: 'Generate appropriate fee agreement based on case type',
          type: 'generation',
          order: 3,
          dependencies: ['case-evaluation', 'employer-conflict-check'],
          prompt: 'Create appropriate representation agreement with fee structure based on case type and merit.',
          inputs: [
            {
              id: 'fee-arrangement',
              type: 'selection',
              label: 'Fee Arrangement',
              description: 'Preferred fee structure for representation',
              required: true,
              options: [
                { value: 'contingency', label: 'Contingency Fee (33-40%)' },
                { value: 'hourly', label: 'Hourly Rate' },
                { value: 'hybrid', label: 'Hybrid (Reduced Rate + Contingency)' },
                { value: 'flat-fee', label: 'Flat Fee for Specific Services' }
              ]
            },
            {
              id: 'case-strategy',
              type: 'selection',
              label: 'Initial Case Strategy',
              description: 'Recommended approach for the matter',
              required: true,
              options: [
                { value: 'negotiate', label: 'Direct Negotiation with Employer' },
                { value: 'eeoc-filing', label: 'EEOC/State Agency Filing' },
                { value: 'litigation-prep', label: 'Prepare for Litigation' },
                { value: 'investigation', label: 'Further Investigation Needed' }
              ]
            }
          ],
          expectedOutputs: [
            {
              type: 'document',
              format: 'docx',
              description: 'Representation agreement with appropriate fee structure'
            }
          ],
          estimatedTime: '15 minutes'
        }
      ]
    }
  ];

  /**
   * Get all intake workflow templates
   */
  static getIntakeTemplates(): WorkflowTemplate[] {
    try {
      const stored = localStorage.getItem(this.INTAKE_TEMPLATES_KEY);
      const customTemplates = stored ? JSON.parse(stored) : [];
      return [...this.PREDEFINED_TEMPLATES, ...customTemplates];
    } catch (error) {
      console.error('Error loading intake templates:', error);
      return this.PREDEFINED_TEMPLATES;
    }
  }

  /**
   * Get intake template by practice area
   */
  static getTemplateByPracticeArea(practiceArea: string): WorkflowTemplate | null {
    const templates = this.getIntakeTemplates();
    
    // Map practice areas to template IDs
    const practiceAreaMap: Record<string, string> = {
      'Estate Planning': 'estate-planning-intake',
      'Corporate Law': 'corporate-law-intake',
      'Employment Law': 'employment-law-intake'
    };

    const templateId = practiceAreaMap[practiceArea];
    return templates.find(t => t.id === templateId) || null;
  }

  /**
   * Create intake workflow execution from lead
   */
  static async createIntakeFromLead(leadId: string): Promise<WorkflowExecution | null> {
    try {
      const lead = await LeadService.getLead(leadId);
      if (!lead) {
        throw new Error('Lead not found');
      }

      const template = this.getTemplateByPracticeArea(lead.practiceArea);
      if (!template) {
        throw new Error(`No intake template found for practice area: ${lead.practiceArea}`);
      }

      // Create workflow execution with lead context
      const execution: WorkflowExecution = {
        id: this.generateId(),
        templateId: template.id,
        title: `${lead.firstName} ${lead.lastName} - ${lead.practiceArea} Intake`,
        status: 'in_progress',
        currentStep: 0,
        startedAt: new Date().toISOString(),
        context: {
          leadId: lead.id,
          practiceArea: lead.practiceArea,
          clientName: `${lead.firstName} ${lead.lastName}`,
          estimatedValue: lead.estimatedCaseValue,
          priority: lead.priority
        },
        inputs: [],
        outputs: [],
        userId: 'current-user',
        progress: {
          completed: 0,
          total: template.steps.length,
          percentage: 0
        }
      };

      // Save execution
      const executions = this.loadExecutions();
      executions.push(execution);
      this.saveExecutions(executions);

      // Update lead status
      await LeadService.updateLeadStatus(leadId, 'qualified', 'Intake workflow initiated');

      return execution;
    } catch (error) {
      console.error('Error creating intake workflow from lead:', error);
      return null;
    }
  }

  /**
   * Complete conflict check step
   */
  static async completeConflictCheck(
    executionId: string,
    stepId: string,
    inputs: { [key: string]: any }
  ): Promise<ConflictCheckResult> {
    const execution = this.getExecution(executionId);
    if (!execution) {
      throw new Error('Workflow execution not found');
    }

    // Simulate conflict checking process
    const result = await LeadService.performConflictCheck(
      execution.context.leadId, 
      'System Auto-Check'
    );

    // Record step completion
    await this.recordStepCompletion(executionId, stepId, inputs, {
      type: 'analysis',
      content: result,
      metadata: { conflictStatus: result.status },
      timestamp: new Date().toISOString(),
      exportable: true
    });

    return result;
  }

  /**
   * Convert lead to client after successful intake
   */
  static async convertLeadToClient(
    executionId: string,
    clientData: NewClientData,
    matterData?: NewMatterData
  ): Promise<{ clientId: string; matterId?: string }> {
    try {
      const execution = this.getExecution(executionId);
      if (!execution) {
        throw new Error('Workflow execution not found');
      }

      // Create client
      const client = await ClientService.createClient(clientData);
      
      let matterId: string | undefined;
      
      // Create matter if data provided
      if (matterData) {
        const matter = await MatterService.createMatter({
          ...matterData,
          clientId: client.id,
          clientName: client.name
        });
        matterId = matter.id;
      }

      // Convert lead
      await LeadService.convertToClient(
        execution.context.leadId, 
        client.id, 
        matterId
      );

      // Complete workflow
      await this.updateExecution(executionId, {
        status: 'completed',
        completedAt: new Date().toISOString(),
        progress: {
          completed: execution.progress.total,
          total: execution.progress.total,
          percentage: 100
        },
        context: {
          ...execution.context,
          clientId: client.id,
          matterId,
          conversionCompleted: true
        }
      });

      return { clientId: client.id, matterId };
    } catch (error) {
      console.error('Error converting lead to client:', error);
      throw error;
    }
  }

  /**
   * Get intake workflow metrics
   */
  static async getIntakeMetrics(): Promise<{
    totalIntakes: number;
    completedIntakes: number;
    conversionRate: number;
    avgCompletionTime: number;
    intakesByPracticeArea: Record<string, number>;
  }> {
    const executions = this.loadExecutions();
    const intakeExecutions = executions.filter(e => 
      this.PREDEFINED_TEMPLATES.some(t => t.id === e.templateId)
    );

    const completed = intakeExecutions.filter(e => e.status === 'completed');
    const converted = completed.filter(e => e.context.conversionCompleted);

    return {
      totalIntakes: intakeExecutions.length,
      completedIntakes: completed.length,
      conversionRate: intakeExecutions.length > 0 
        ? (converted.length / intakeExecutions.length) * 100 
        : 0,
      avgCompletionTime: this.calculateAvgCompletionTime(completed),
      intakesByPracticeArea: this.calculateIntakesByPracticeArea(intakeExecutions)
    };
  }

  // Helper methods
  private static generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  private static loadExecutions(): WorkflowExecution[] {
    try {
      const stored = localStorage.getItem(this.INTAKE_EXECUTIONS_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Error loading workflow executions:', error);
      return [];
    }
  }

  private static saveExecutions(executions: WorkflowExecution[]): void {
    try {
      localStorage.setItem(this.INTAKE_EXECUTIONS_KEY, JSON.stringify(executions));
    } catch (error) {
      console.error('Error saving workflow executions:', error);
    }
  }

  private static getExecution(id: string): WorkflowExecution | null {
    const executions = this.loadExecutions();
    return executions.find(e => e.id === id) || null;
  }

  private static async updateExecution(
    id: string, 
    updates: Partial<WorkflowExecution>
  ): Promise<WorkflowExecution | null> {
    const executions = this.loadExecutions();
    const index = executions.findIndex(e => e.id === id);
    
    if (index === -1) return null;

    executions[index] = { ...executions[index], ...updates };
    this.saveExecutions(executions);
    
    return executions[index];
  }

  private static async recordStepCompletion(
    executionId: string,
    stepId: string,
    inputs: { [key: string]: any },
    output: StepOutput
  ): Promise<void> {
    const execution = this.getExecution(executionId);
    if (!execution) return;

    // Add step input
    execution.inputs.push({
      stepId,
      inputId: stepId,
      value: inputs,
      timestamp: new Date().toISOString()
    });

    // Add step output
    execution.outputs.push(output);

    // Update progress
    execution.progress.completed++;
    execution.progress.percentage = (execution.progress.completed / execution.progress.total) * 100;
    execution.currentStep++;

    await this.updateExecution(executionId, execution);
  }

  private static calculateAvgCompletionTime(completedExecutions: WorkflowExecution[]): number {
    if (completedExecutions.length === 0) return 0;

    const totalTime = completedExecutions.reduce((sum, exec) => {
      if (exec.startedAt && exec.completedAt) {
        const start = new Date(exec.startedAt).getTime();
        const end = new Date(exec.completedAt).getTime();
        return sum + (end - start);
      }
      return sum;
    }, 0);

    return totalTime / completedExecutions.length / (1000 * 60 * 60); // Convert to hours
  }

  private static calculateIntakesByPracticeArea(executions: WorkflowExecution[]): Record<string, number> {
    const stats: Record<string, number> = {};
    
    executions.forEach(exec => {
      const practiceArea = exec.context.practiceArea || 'Unknown';
      stats[practiceArea] = (stats[practiceArea] || 0) + 1;
    });

    return stats;
  }
}

export const intakeWorkflowService = IntakeWorkflowService;