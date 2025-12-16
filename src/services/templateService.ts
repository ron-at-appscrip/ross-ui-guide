import { 
  DocumentTemplate, 
  TemplateField, 
  DocumentCategory, 
  DocumentSubtype 
} from '@/types/document';

// Mock templates for development
const mockTemplates: DocumentTemplate[] = [
  {
    id: '1',
    name: 'Non-Disclosure Agreement (NDA)',
    category: 'contracts_agreements',
    subtype: 'nda',
    practiceArea: 'Contract Law',
    description: 'Standard mutual non-disclosure agreement for confidential information sharing',
    content: 'NON-DISCLOSURE AGREEMENT\n\nThis Non-Disclosure Agreement ("Agreement") is entered into on {{date:long}} between:\n\nParty A: {{party_a_name}}\nAddress: {{party_a_address}}\n\nParty B: {{party_b_name}}\nAddress: {{party_b_address}}\n\nWHEREAS, the parties wish to explore a potential business relationship and need to share confidential information;\n\nNOW, THEREFORE, the parties agree as follows:\n\n1. CONFIDENTIAL INFORMATION\n   Confidential Information includes: {{confidential_info_description}}\n\n2. OBLIGATIONS\n   {{#if mutual_agreement}}\n   Both parties agree to maintain confidentiality of all shared information.\n   {{/if}}\n\n3. TERM\n   This Agreement shall remain in effect for {{term_years}} years from the date of signing.\n\nParty A: _______________________    Date: _______\n{{party_a_name}}\n\nParty B: _______________________    Date: _______\n{{party_b_name}}',
    fields: [
      {
        id: 'party_a_name',
        name: 'Party A Name',
        type: 'text',
        placeholder: 'Enter first party name',
        required: true,
        validation: { minLength: 2, maxLength: 100 }
      },
      {
        id: 'party_a_address',
        name: 'Party A Address',
        type: 'textarea',
        placeholder: 'Enter first party address',
        required: true
      },
      {
        id: 'party_b_name',
        name: 'Party B Name',
        type: 'text',
        placeholder: 'Enter second party name',
        required: true,
        validation: { minLength: 2, maxLength: 100 }
      },
      {
        id: 'party_b_address',
        name: 'Party B Address',
        type: 'textarea',
        placeholder: 'Enter second party address',
        required: true
      },
      {
        id: 'confidential_info_description',
        name: 'Confidential Information Description',
        type: 'textarea',
        placeholder: 'Describe the confidential information',
        required: true
      },
      {
        id: 'mutual_agreement',
        name: 'Mutual Agreement',
        type: 'checkbox',
        placeholder: 'Is this a mutual NDA?',
        required: false,
        defaultValue: 'true'
      },
      {
        id: 'term_years',
        name: 'Term (Years)',
        type: 'number',
        placeholder: 'Enter term in years',
        required: true,
        validation: { min: 1, max: 10 },
        defaultValue: '2'
      }
    ],
    aiTags: ['contract', 'confidentiality', 'business', 'legal'],
    usageCount: 156,
    rating: 4.8,
    isPopular: true,
    createdBy: 'system',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    version: 1,
    isActive: true
  },
  {
    id: '2',
    name: 'Service Agreement',
    category: 'contracts_agreements',
    subtype: 'service_agreement',
    practiceArea: 'Contract Law',
    description: 'Professional services agreement template',
    content: 'PROFESSIONAL SERVICES AGREEMENT\n\nThis Service Agreement is entered into on {{date:long}} between:\n\nService Provider: {{provider_name}}\nClient: {{client_name}}\n\n1. SERVICES\n   The Provider agrees to provide: {{services_description}}\n\n2. PAYMENT\n   Total Fee: ${{total_fee}}\n   Payment Terms: {{payment_terms}}\n\n3. TERM\n   Start Date: {{start_date}}\n   End Date: {{end_date}}\n\nProvider: _______________________    Date: _______\n{{provider_name}}\n\nClient: _______________________    Date: _______\n{{client_name}}',
    fields: [
      {
        id: 'provider_name',
        name: 'Service Provider Name',
        type: 'text',
        placeholder: 'Enter provider name',
        required: true
      },
      {
        id: 'client_name',
        name: 'Client Name',
        type: 'text',
        placeholder: 'Enter client name',
        required: true
      },
      {
        id: 'services_description',
        name: 'Services Description',
        type: 'textarea',
        placeholder: 'Describe the services to be provided',
        required: true
      },
      {
        id: 'total_fee',
        name: 'Total Fee',
        type: 'number',
        placeholder: 'Enter total fee amount',
        required: true,
        validation: { min: 0 }
      },
      {
        id: 'payment_terms',
        name: 'Payment Terms',
        type: 'select',
        placeholder: 'Select payment terms',
        required: true,
        options: ['Net 15', 'Net 30', 'Net 45', 'Upon completion', 'Monthly installments']
      },
      {
        id: 'start_date',
        name: 'Start Date',
        type: 'date',
        placeholder: 'Select start date',
        required: true
      },
      {
        id: 'end_date',
        name: 'End Date',
        type: 'date',
        placeholder: 'Select end date',
        required: true
      }
    ],
    aiTags: ['contract', 'services', 'professional', 'agreement'],
    usageCount: 89,
    rating: 4.5,
    isPopular: true,
    createdBy: 'system',
    createdAt: '2024-01-02T00:00:00Z',
    updatedAt: '2024-01-02T00:00:00Z',
    version: 1,
    isActive: true
  },
  {
    id: '3',
    name: 'Employment Contract',
    category: 'employment_docs',
    subtype: 'employment_contract',
    practiceArea: 'Employment Law',
    description: 'Standard employment contract template',
    content: 'EMPLOYMENT AGREEMENT\n\nThis Employment Agreement is entered into between {{company_name}} ("Company") and {{employee_name}} ("Employee").\n\n1. POSITION\n   Employee will serve as {{job_title}} starting {{start_date}}.\n\n2. COMPENSATION\n   Annual Salary: ${{annual_salary}}\n   Benefits: {{benefits_description}}\n\n3. TERM\n   This is {{employment_type}} employment.\n\nCompany: _______________________    Date: _______\n{{company_name}}\n\nEmployee: _______________________    Date: _______\n{{employee_name}}',
    fields: [
      {
        id: 'company_name',
        name: 'Company Name',
        type: 'text',
        placeholder: 'Enter company name',
        required: true
      },
      {
        id: 'employee_name',
        name: 'Employee Name',
        type: 'text',
        placeholder: 'Enter employee name',
        required: true
      },
      {
        id: 'job_title',
        name: 'Job Title',
        type: 'text',
        placeholder: 'Enter job title',
        required: true
      },
      {
        id: 'annual_salary',
        name: 'Annual Salary',
        type: 'number',
        placeholder: 'Enter annual salary',
        required: true,
        validation: { min: 0 }
      },
      {
        id: 'start_date',
        name: 'Start Date',
        type: 'date',
        placeholder: 'Select start date',
        required: true
      },
      {
        id: 'employment_type',
        name: 'Employment Type',
        type: 'select',
        placeholder: 'Select employment type',
        required: true,
        options: ['at-will', 'fixed-term', 'contract']
      },
      {
        id: 'benefits_description',
        name: 'Benefits Description',
        type: 'textarea',
        placeholder: 'Describe benefits package',
        required: false
      }
    ],
    aiTags: ['employment', 'contract', 'hr', 'hiring'],
    usageCount: 67,
    rating: 4.6,
    isPopular: false,
    createdBy: 'system',
    createdAt: '2024-01-03T00:00:00Z',
    updatedAt: '2024-01-03T00:00:00Z',
    version: 1,
    isActive: true
  },
  {
    id: '4',
    name: 'Motion to Dismiss',
    category: 'motions',
    subtype: 'motion_to_dismiss',
    practiceArea: 'Litigation',
    description: 'Motion to dismiss for failure to state a claim',
    content: 'MOTION TO DISMISS\n\nTO THE HONORABLE COURT:\n\nDefendant {{defendant_name}} moves to dismiss the complaint for failure to state a claim upon which relief can be granted.\n\nGROUNDS:\n{{grounds_description}}\n\nWHEREFORE, Defendant respectfully requests that this Court dismiss the complaint.\n\nRespectfully submitted,\n{{attorney_name}}\nAttorney for Defendant',
    fields: [
      {
        id: 'defendant_name',
        name: 'Defendant Name',
        type: 'text',
        placeholder: 'Enter defendant name',
        required: true
      },
      {
        id: 'grounds_description',
        name: 'Grounds for Dismissal',
        type: 'textarea',
        placeholder: 'Describe the grounds for dismissal',
        required: true
      },
      {
        id: 'attorney_name',
        name: 'Attorney Name',
        type: 'text',
        placeholder: 'Enter attorney name',
        required: true
      }
    ],
    aiTags: ['motion', 'litigation', 'dismiss', 'court'],
    usageCount: 45,
    rating: 4.7,
    isPopular: false,
    createdBy: 'system',
    createdAt: '2024-01-04T00:00:00Z',
    updatedAt: '2024-01-04T00:00:00Z',
    version: 1,
    isActive: true
  },
  {
    id: '5',
    name: 'Will and Testament',
    category: 'wills_trusts',
    subtype: 'last_will_testament',
    practiceArea: 'Estate Planning',
    description: 'Last will and testament template',
    content: 'LAST WILL AND TESTAMENT\n\nI, {{testator_name}}, being of sound mind, do hereby make this my Last Will and Testament.\n\n1. EXECUTOR\n   I appoint {{executor_name}} as Executor of this Will.\n\n2. BEQUESTS\n   {{bequests_description}}\n\n3. RESIDUARY ESTATE\n   I give the rest of my estate to {{residuary_beneficiary}}.\n\nIN WITNESS WHEREOF, I have signed this Will on {{date:long}}.\n\n_______________________\n{{testator_name}}',
    fields: [
      {
        id: 'testator_name',
        name: 'Testator Name',
        type: 'text',
        placeholder: 'Enter testator name',
        required: true
      },
      {
        id: 'executor_name',
        name: 'Executor Name',
        type: 'text',
        placeholder: 'Enter executor name',
        required: true
      },
      {
        id: 'bequests_description',
        name: 'Specific Bequests',
        type: 'textarea',
        placeholder: 'Describe specific bequests',
        required: true
      },
      {
        id: 'residuary_beneficiary',
        name: 'Residuary Beneficiary',
        type: 'text',
        placeholder: 'Enter residuary beneficiary',
        required: true
      }
    ],
    aiTags: ['will', 'estate', 'planning', 'testament'],
    usageCount: 34,
    rating: 4.9,
    isPopular: false,
    createdBy: 'system',
    createdAt: '2024-01-05T00:00:00Z',
    updatedAt: '2024-01-05T00:00:00Z',
    version: 1,
    isActive: true
  }
];

export class TemplateService {
  private templates: DocumentTemplate[] = [...mockTemplates];

  // Template CRUD Operations
  async createTemplate(data: Partial<DocumentTemplate>): Promise<DocumentTemplate> {
    const newTemplate: DocumentTemplate = {
      id: (this.templates.length + 1).toString(),
      name: data.name || 'Untitled Template',
      category: data.category || 'other',
      subtype: data.subtype || 'other',
      practiceArea: data.practiceArea || 'General Practice',
      description: data.description || '',
      content: data.content || '',
      fields: data.fields || [],
      aiTags: data.aiTags || [],
      usageCount: 0,
      rating: 0,
      isPopular: false,
      createdBy: data.createdBy || 'Current User',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      version: 1,
      isActive: true
    };

    this.templates.push(newTemplate);
    return newTemplate;
  }

  async getTemplate(id: string): Promise<DocumentTemplate | null> {
    const template = this.templates.find(t => t.id === id);
    return template || null;
  }

  async updateTemplate(id: string, updates: Partial<DocumentTemplate>): Promise<DocumentTemplate> {
    const index = this.templates.findIndex(t => t.id === id);
    if (index === -1) throw new Error('Template not found');

    this.templates[index] = {
      ...this.templates[index],
      ...updates,
      updatedAt: new Date().toISOString()
    };

    return this.templates[index];
  }

  async deleteTemplate(id: string): Promise<void> {
    const index = this.templates.findIndex(t => t.id === id);
    if (index === -1) throw new Error('Template not found');
    
    this.templates.splice(index, 1);
  }

  // Template Querying & Filtering
  async getTemplates(filters?: {
    category?: DocumentCategory;
    subtype?: DocumentSubtype;
    jurisdiction?: string;
    practiceArea?: string;
    isActive?: boolean;
    isPopular?: boolean;
    search?: string;
  }): Promise<DocumentTemplate[]> {
    let filtered = [...this.templates];

    if (filters?.category) {
      filtered = filtered.filter(t => t.category === filters.category);
    }

    if (filters?.subtype) {
      filtered = filtered.filter(t => t.subtype === filters.subtype);
    }

    if (filters?.jurisdiction) {
      filtered = filtered.filter(t => t.jurisdiction === filters.jurisdiction);
    }

    if (filters?.practiceArea) {
      filtered = filtered.filter(t => t.practiceArea === filters.practiceArea);
    }

    if (filters?.isActive !== undefined) {
      filtered = filtered.filter(t => t.isActive === filters.isActive);
    }

    if (filters?.isPopular !== undefined) {
      filtered = filtered.filter(t => t.isPopular === filters.isPopular);
    }

    if (filters?.search) {
      const searchTerm = filters.search.toLowerCase();
      filtered = filtered.filter(t => 
        t.name.toLowerCase().includes(searchTerm) ||
        t.description.toLowerCase().includes(searchTerm)
      );
    }

    return filtered.sort((a, b) => b.usageCount - a.usageCount);
  }

  async getTemplatesByCategory(): Promise<Record<DocumentCategory, DocumentTemplate[]>> {
    const templatesByCategory: Record<string, DocumentTemplate[]> = {};
    
    this.templates
      .filter(t => t.isActive)
      .forEach(template => {
        const category = template.category;
        if (!templatesByCategory[category]) {
          templatesByCategory[category] = [];
        }
        templatesByCategory[category].push(template);
      });

    // Sort by usage count
    Object.keys(templatesByCategory).forEach(category => {
      templatesByCategory[category].sort((a, b) => b.usageCount - a.usageCount);
    });

    return templatesByCategory as Record<DocumentCategory, DocumentTemplate[]>;
  }

  async getPopularTemplates(limit: number = 10): Promise<DocumentTemplate[]> {
    return this.templates
      .filter(t => t.isActive)
      .filter(t => t.isPopular || t.usageCount >= 50)
      .sort((a, b) => b.usageCount - a.usageCount)
      .slice(0, limit);
  }

  async getRecentTemplates(limit: number = 10): Promise<DocumentTemplate[]> {
    return this.templates
      .filter(t => t.isActive)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, limit);
  }

  // Template Usage & Analytics
  async incrementUsageCount(templateId: string): Promise<void> {
    const template = await this.getTemplate(templateId);
    if (!template) throw new Error('Template not found');

    await this.updateTemplate(templateId, { 
      usageCount: template.usageCount + 1 
    });
  }

  async rateTemplate(templateId: string, rating: number): Promise<void> {
    if (rating < 1 || rating > 5) {
      throw new Error('Rating must be between 1 and 5');
    }

    // Mock rating update (in real implementation would average with other ratings)
    await this.updateTemplate(templateId, { rating });
  }

  async updateTemplateRating(templateId: string): Promise<void> {
    // Mock implementation - in real system would calculate average from ratings table
    const template = await this.getTemplate(templateId);
    if (!template) return;

    // Keep current rating for mock
  }

  // Template Generation & Customization
  async generateDocumentFromTemplate(
    templateId: string, 
    fieldValues: Record<string, any>
  ): Promise<string> {
    const template = await this.getTemplate(templateId);
    if (!template) throw new Error('Template not found');

    // Increment usage count
    await this.incrementUsageCount(templateId);

    // Replace placeholders with field values
    let content = template.content;
    
    template.fields.forEach(field => {
      const placeholder = `{{${field.id}}}`;
      const value = fieldValues[field.id] || field.defaultValue || '';
      content = content.replace(new RegExp(placeholder, 'g'), value);
    });

    // Handle conditional sections
    content = this.processConditionalSections(content, fieldValues);

    // Handle date formatting
    content = this.processDateFormatting(content);

    return content;
  }

  async validateTemplateFields(
    templateId: string, 
    fieldValues: Record<string, any>
  ): Promise<{ isValid: boolean; errors: string[] }> {
    const template = await this.getTemplate(templateId);
    if (!template) throw new Error('Template not found');

    const errors: string[] = [];

    template.fields.forEach(field => {
      const value = fieldValues[field.id];

      // Required field validation
      if (field.required && (!value || value.toString().trim() === '')) {
        errors.push(`${field.name} is required`);
        return;
      }

      if (value && field.validation) {
        const validation = field.validation;

        // Pattern validation
        if (validation.pattern) {
          const regex = new RegExp(validation.pattern);
          if (!regex.test(value.toString())) {
            errors.push(`${field.name} format is invalid`);
          }
        }

        // Length validation
        if (validation.minLength && value.toString().length < validation.minLength) {
          errors.push(`${field.name} must be at least ${validation.minLength} characters`);
        }

        if (validation.maxLength && value.toString().length > validation.maxLength) {
          errors.push(`${field.name} must not exceed ${validation.maxLength} characters`);
        }

        // Number validation
        if (field.type === 'number') {
          const numValue = parseFloat(value);
          if (isNaN(numValue)) {
            errors.push(`${field.name} must be a valid number`);
          } else {
            if (validation.min !== undefined && numValue < validation.min) {
              errors.push(`${field.name} must be at least ${validation.min}`);
            }
            if (validation.max !== undefined && numValue > validation.max) {
              errors.push(`${field.name} must not exceed ${validation.max}`);
            }
          }
        }

        // Date validation
        if (field.type === 'date') {
          const dateValue = new Date(value);
          if (isNaN(dateValue.getTime())) {
            errors.push(`${field.name} must be a valid date`);
          }
        }
      }
    });

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  // Helper Methods
  private processConditionalSections(content: string, fieldValues: Record<string, any>): string {
    // Handle conditional sections like {{#if condition}}...{{/if}}
    const conditionalRegex = /\{\{#if\s+(\w+)\}\}(.*?)\{\{\/if\}\}/gs;
    
    return content.replace(conditionalRegex, (match, condition, sectionContent) => {
      const conditionValue = fieldValues[condition];
      if (conditionValue && conditionValue !== 'false' && conditionValue !== '0') {
        return sectionContent;
      }
      return '';
    });
  }

  private processDateFormatting(content: string): string {
    // Handle date formatting like {{date:format}}
    const dateRegex = /\{\{date:(\w+)\}\}/g;
    
    return content.replace(dateRegex, (match, format) => {
      const now = new Date();
      switch (format) {
        case 'short':
          return now.toLocaleDateString();
        case 'long':
          return now.toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          });
        case 'iso':
          return now.toISOString().split('T')[0];
        default:
          return now.toLocaleDateString();
      }
    });
  }

  // Mock Templates for Development (no longer needed - already loaded)
  async seedMockTemplates(): Promise<void> {
    // Templates already loaded in constructor
    return;
  }
}

export const templateService = new TemplateService();