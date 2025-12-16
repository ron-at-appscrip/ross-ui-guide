import { Conversation, ChatMessage, ConversationCategory } from '@/types/chat';
import { WorkflowExecution } from '@/types/workflow';
import { workflowService } from './workflowService';

interface MockConversationConfig {
  title: string;
  category: ConversationCategory;
  workflowTemplateId?: string;
  workflowExecutionId?: string;
  workflowStatus?: 'not_started' | 'in_progress' | 'completed';
  workflowCurrentStep?: number;
  isStarred?: boolean;
  contextType?: 'matter' | 'client';
  contextName?: string;
  daysAgo: number;
}

class MockConversationsService {
  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
  }

  private getTimestamp(daysAgo: number, additionalMinutes: number = 0): string {
    const date = new Date();
    date.setDate(date.getDate() - daysAgo);
    date.setMinutes(date.getMinutes() - additionalMinutes);
    return date.toISOString();
  }

  private createMessage(
    role: 'user' | 'ai',
    content: string,
    timestamp: string,
    attachments?: { name: string; type: string; size: number }[]
  ): ChatMessage {
    return {
      id: this.generateId(),
      role,
      content: {
        text: content,
        attachments: attachments?.map(att => ({
          id: this.generateId(),
          name: att.name,
          type: att.type as any,
          size: att.size,
          url: '#',
          mimeType: att.type === 'document' ? 'application/pdf' : 'text/plain',
          uploadedAt: timestamp
        }))
      },
      timestamp,
      status: 'delivered'
    };
  }

  generateMockConversations(): Conversation[] {
    console.log('🎭 Generating mock conversations...');
    const configs: MockConversationConfig[] = [
      // Client Alert Workflows
      {
        title: 'SEC Cybersecurity Rules - Client Alert',
        category: 'general',
        workflowTemplateId: 'draft-client-alert',
        workflowStatus: 'completed',
        workflowCurrentStep: 4,
        isStarred: true,
        daysAgo: 2
      },
      {
        title: 'GDPR Update for Financial Services',
        category: 'general',
        workflowTemplateId: 'draft-client-alert',
        workflowStatus: 'in_progress',
        workflowCurrentStep: 2,
        daysAgo: 1
      },
      {
        title: 'New California Privacy Laws',
        category: 'general',
        workflowTemplateId: 'draft-client-alert',
        workflowStatus: 'in_progress',
        workflowCurrentStep: 1,
        daysAgo: 0
      },
      {
        title: 'Federal Tax Reform Impact',
        category: 'general',
        workflowTemplateId: 'draft-client-alert',
        workflowStatus: 'completed',
        workflowCurrentStep: 4,
        daysAgo: 7
      },

      // Contract Analysis Workflows
      {
        title: 'Johnson v. ABC Corp - Contract Review',
        category: 'documents',
        workflowTemplateId: 'analyze-contract',
        workflowStatus: 'completed',
        workflowCurrentStep: 3,
        contextType: 'matter',
        contextName: 'Johnson v. ABC Corp',
        isStarred: true,
        daysAgo: 3
      },
      {
        title: 'SaaS Agreement Risk Assessment',
        category: 'documents',
        workflowTemplateId: 'analyze-contract',
        workflowStatus: 'in_progress',
        workflowCurrentStep: 2,
        daysAgo: 1
      },
      {
        title: 'Employment Agreement Review',
        category: 'documents',
        workflowTemplateId: 'analyze-contract',
        workflowStatus: 'in_progress',
        workflowCurrentStep: 1,
        daysAgo: 0
      },

      // Legal Memo Workflows
      {
        title: 'Remote Work Policy Compliance',
        category: 'research',
        workflowTemplateId: 'legal-memo',
        workflowStatus: 'completed',
        workflowCurrentStep: 3,
        daysAgo: 5
      },
      {
        title: 'Cryptocurrency Regulations Research',
        category: 'research',
        workflowTemplateId: 'legal-memo',
        workflowStatus: 'in_progress',
        workflowCurrentStep: 2,
        daysAgo: 2
      },
      {
        title: 'Data Breach Response Analysis',
        category: 'research',
        workflowTemplateId: 'legal-memo',
        workflowStatus: 'in_progress',
        workflowCurrentStep: 1,
        daysAgo: 1
      },

      // Document Review Workflows
      {
        title: 'Merger Agreement Quick Review',
        category: 'documents',
        workflowTemplateId: 'document-review',
        workflowStatus: 'completed',
        workflowCurrentStep: 1,
        daysAgo: 4
      },
      {
        title: 'NDA Compliance Check',
        category: 'documents',
        workflowTemplateId: 'document-review',
        workflowStatus: 'in_progress',
        workflowCurrentStep: 1,
        daysAgo: 0
      },

      // Regular Chat Conversations
      {
        title: 'Patent Filing Strategy Discussion',
        category: 'research',
        daysAgo: 6
      },
      {
        title: 'Client Meeting Preparation',
        category: 'clients',
        contextType: 'client',
        contextName: 'Acme Corporation',
        daysAgo: 3
      },
      {
        title: 'Litigation Timeline Review',
        category: 'matters',
        contextType: 'matter',
        contextName: 'Smith vs. TechCorp',
        isStarred: true,
        daysAgo: 8
      }
    ];

    const conversations = configs.map(config => this.createConversationFromConfig(config));
    console.log(`✅ Generated ${conversations.length} mock conversations:`, conversations.map(c => `"${c.title}" (${c.workflowStatus || 'chat'})`));
    return conversations;
  }

  private createConversationFromConfig(config: MockConversationConfig): Conversation {
    const conversationId = this.generateId();
    const baseTimestamp = this.getTimestamp(config.daysAgo);
    
    let messages: ChatMessage[] = [];
    let workflowExecutionId: string | undefined = config.workflowExecutionId;

    // Create workflow execution if needed
    if (config.workflowTemplateId && !workflowExecutionId) {
      try {
        const execution = workflowService.createExecution(config.workflowTemplateId, config.title);
        workflowExecutionId = execution.id;
        
        // Update execution to match conversation state
        if (config.workflowStatus && config.workflowCurrentStep !== undefined) {
          workflowService.updateExecution(execution.id, {
            status: config.workflowStatus,
            currentStep: config.workflowCurrentStep,
            progress: {
              completed: config.workflowCurrentStep,
              total: execution.progress.total,
              percentage: Math.round((config.workflowCurrentStep / execution.progress.total) * 100)
            }
          });
        }
      } catch (error) {
        console.error(`Failed to create workflow execution for ${config.title}:`, error);
      }
    }

    // Generate messages based on workflow type and status
    if (config.workflowTemplateId) {
      messages = this.generateWorkflowMessages(config, baseTimestamp);
    } else {
      messages = this.generateRegularChatMessages(config, baseTimestamp);
    }

    const lastMessage = messages[messages.length - 1];

    return {
      id: conversationId,
      title: config.title,
      category: config.category,
      lastMessage: lastMessage?.content.text || '',
      lastActivity: lastMessage?.timestamp || baseTimestamp,
      messageCount: messages.length,
      isStarred: config.isStarred || false,
      contextType: config.contextType,
      contextName: config.contextName,
      messages,
      createdAt: baseTimestamp,
      updatedAt: lastMessage?.timestamp || baseTimestamp,
      // Workflow-specific metadata
      workflowTemplateId: config.workflowTemplateId,
      workflowExecutionId: workflowExecutionId,
      workflowStatus: config.workflowStatus,
      workflowCurrentStep: config.workflowCurrentStep
    };
  }

  private generateWorkflowMessages(config: MockConversationConfig, baseTimestamp: string): ChatMessage[] {
    switch (config.workflowTemplateId) {
      case 'draft-client-alert':
        return this.generateClientAlertMessages(config, baseTimestamp);
      case 'analyze-contract':
        return this.generateContractAnalysisMessages(config, baseTimestamp);
      case 'legal-memo':
        return this.generateLegalMemoMessages(config, baseTimestamp);
      case 'document-review':
        return this.generateDocumentReviewMessages(config, baseTimestamp);
      default:
        return [];
    }
  }

  private generateClientAlertMessages(config: MockConversationConfig, baseTimestamp: string): ChatMessage[] {
    const messages: ChatMessage[] = [];

    if (config.title.includes('SEC Cybersecurity')) {
      // Completed workflow - full conversation
      messages.push(
        this.createMessage('user', 'I need to draft a client alert about the new SEC cybersecurity disclosure rules.', baseTimestamp),
        this.createMessage('ai', 'I\'ll help you draft a comprehensive client alert about the SEC cybersecurity rules. Let me guide you through our 4-step process:\n\n**Step 1: Information Source**\nFirst, I need to understand the source material. Could you upload the SEC regulation or ruling document?', this.getTimestamp(config.daysAgo, -5)),
        this.createMessage('user', 'Here\'s the SEC final rule document.', this.getTimestamp(config.daysAgo, -10), [
          { name: 'SEC_Cybersecurity_Final_Rule.pdf', type: 'document', size: 2400000 }
        ]),
        this.createMessage('ai', '**Step 1 Complete** ✅\n\nI\'ve analyzed the SEC cybersecurity disclosure rules. Key findings:\n• New 4-day incident disclosure requirement (Form 8-K)\n• Annual cybersecurity governance disclosure requirements\n• Board oversight and risk management disclosure mandates\n\n**Step 2: Example Document (Optional)**\nDo you have a previous client alert you\'d like me to use as a style template?', this.getTimestamp(config.daysAgo, -15)),
        this.createMessage('user', 'Yes, here\'s our standard client alert template.', this.getTimestamp(config.daysAgo, -20), [
          { name: 'Client_Alert_Template_2023.docx', type: 'document', size: 850000 }
        ]),
        this.createMessage('ai', '**Step 2 Complete** ✅\n\nI\'ve analyzed your template style. Now proceeding to draft generation.\n\n**Step 3: Generating Draft**\nWho should receive this alert?\n• Target client type?\n• Urgency level?', this.getTimestamp(config.daysAgo, -25)),
        this.createMessage('user', 'This is for our public company clients. High priority - they need to understand the compliance timeline.', this.getTimestamp(config.daysAgo, -30)),
        this.createMessage('ai', '**Step 3 Complete** ✅\n\n**Draft Generated: SEC Cybersecurity Disclosure Rules - Client Alert**\n\n*I\'ve created a comprehensive client alert covering:*\n• Executive summary of new requirements\n• 4-day incident disclosure timeline\n• Annual governance disclosure requirements\n• Immediate action items for public companies\n• Compliance timeline and deadlines\n\n**Step 4: Review and Finalize**\nPlease review the draft. Any adjustments needed?', this.getTimestamp(config.daysAgo, -35)),
        this.createMessage('user', 'Perfect! Please finalize this for distribution.', this.getTimestamp(config.daysAgo, -40)),
        this.createMessage('ai', '**Workflow Complete** ✅\n\n🎉 Your SEC Cybersecurity Client Alert is ready!\n\n📄 **Final Document Generated:**\n• Professional client alert (3 pages)\n• Executive summary with key takeaways\n• Detailed compliance requirements\n• Action items and timeline\n\n**Export Options Available:**\n• PDF for distribution\n• Word document for editing\n• Email template format\n\nWould you like me to export this in your preferred format?', this.getTimestamp(config.daysAgo, -45)),
        this.createMessage('user', 'Perfect! Please export as PDF and provide the executive summary.', this.getTimestamp(config.daysAgo, -50)),
        this.createMessage('ai', '**📄 WORKFLOW RESULTS EXPORTED**\n\n✅ **PDF Document Generated:** `SEC_Cybersecurity_Client_Alert_Final.pdf`\n\n**📋 Executive Summary:**\n\n**New SEC Cybersecurity Disclosure Requirements**\n*Effective December 2023*\n\n**Key Mandates for Public Companies:**\n• **4-Business Day Incident Reporting** - Material cybersecurity incidents must be disclosed on Form 8-K within 4 business days\n• **Annual Cybersecurity Governance Disclosure** - Annual reports must include cybersecurity risk management processes\n• **Board Oversight Requirements** - Disclosure of board expertise and oversight of cybersecurity risks\n\n**Immediate Action Items:**\n1. Review and update incident response procedures\n2. Establish materiality assessment framework\n3. Enhance board cybersecurity expertise\n4. Update disclosure controls and procedures\n\n**📤 Distribution Status:**\n• Sent to 47 public company clients\n• Posted to client portal\n• Executive summary emailed to key contacts\n\n**Client Feedback:** 98% found the alert "extremely helpful" for compliance planning.', this.getTimestamp(config.daysAgo, -55))
      );
    } else if (config.title.includes('GDPR Update')) {
      // In progress - Step 2
      messages.push(
        this.createMessage('user', 'I need to create a client alert about new GDPR updates affecting financial services companies.', baseTimestamp),
        this.createMessage('ai', 'I\'ll help you create a GDPR update client alert for financial services. Let\'s start with our workflow:\n\n**Step 1: Information Source**\nPlease upload the GDPR regulation updates or related documents.', this.getTimestamp(config.daysAgo, -5)),
        this.createMessage('user', 'Here are the European Data Protection Board guidelines and the updated regulation text.', this.getTimestamp(config.daysAgo, -10), [
          { name: 'EDPB_Guidelines_Financial_Services.pdf', type: 'document', size: 1800000 },
          { name: 'GDPR_Amendment_2024.pdf', type: 'document', size: 1200000 }
        ]),
        this.createMessage('ai', '**Step 1 Complete** ✅\n\nI\'ve analyzed the GDPR updates. Key changes for financial services:\n• Enhanced consent requirements for automated decision-making\n• Stricter data transfer protocols\n• New breach notification timelines\n• Updated controller/processor obligations\n\n**Step 2: Style Template**\nCurrently uploading your previous GDPR alert template to match your firm\'s style...\n\n*Processing template analysis...* ⏳', this.getTimestamp(config.daysAgo, -15))
      );
    } else if (config.title.includes('California Privacy')) {
      // Early stage - Step 1
      messages.push(
        this.createMessage('user', 'I need help drafting a client alert about the new California privacy law amendments.', baseTimestamp),
        this.createMessage('ai', 'I\'ll help you draft a client alert about California\'s new privacy law amendments. Let\'s start our workflow:\n\n**Step 1: Information Source**\nPlease upload the California privacy law documents, amendments, or related regulatory materials that will form the basis of your client alert.', this.getTimestamp(config.daysAgo, -2))
      );
    } else {
      // Federal Tax Reform - Completed
      messages.push(
        this.createMessage('user', 'Need to draft a client alert about federal tax reform impacts on corporate transactions.', baseTimestamp),
        this.createMessage('ai', '**Workflow Complete** ✅\n\nYour Federal Tax Reform Impact client alert has been successfully generated!\n\n📋 **Client Alert Summary:**\n• Title: "Federal Tax Reform: Key Impacts on Corporate M&A Transactions"\n• Target: Corporate clients engaged in M&A activity\n• Length: 4 pages with executive summary\n• Coverage: Section 199A, interest deductibility, NOL changes\n\n**Previously Exported:**\n✅ PDF version distributed to 47 corporate clients\n✅ HTML version posted to client portal\n✅ Executive summary sent via email\n\nWould you like to create a follow-up alert or make any updates?', this.getTimestamp(config.daysAgo, -5))
      );
    }

    return messages;
  }

  private generateContractAnalysisMessages(config: MockConversationConfig, baseTimestamp: string): ChatMessage[] {
    const messages: ChatMessage[] = [];

    if (config.title.includes('Johnson v. ABC Corp')) {
      // Completed analysis
      messages.push(
        this.createMessage('user', 'I need a comprehensive risk analysis of this purchase agreement for the Johnson v. ABC Corp matter.', baseTimestamp),
        this.createMessage('ai', 'I\'ll analyze this purchase agreement for potential risks. Let me start the contract analysis workflow.\n\n**Step 1: Upload Contract**\nPlease upload the purchase agreement document.', this.getTimestamp(config.daysAgo, -5)),
        this.createMessage('user', 'Here\'s the purchase agreement with all exhibits.', this.getTimestamp(config.daysAgo, -10), [
          { name: 'Johnson_ABC_Purchase_Agreement_v4.pdf', type: 'document', size: 3200000 }
        ]),
        this.createMessage('ai', '**Step 1 Complete** ✅\n\n**Contract Analysis Results:**\n• Document Type: Asset Purchase Agreement\n• Contract Value: $45M transaction\n• Parties: Johnson Industries (Buyer) vs. ABC Corp (Seller)\n• 127 pages with 8 exhibits\n\n**Step 2: Risk Assessment**\nI\'ve identified several high-priority risk areas. Analyzing liability, indemnification, and termination clauses...', this.getTimestamp(config.daysAgo, -15)),
        this.createMessage('ai', '**Step 2 Complete** ✅\n\n🔴 **Critical Risk Assessment Findings:**\n\n**High Priority Risks:**\n1. **Uncapped Liability** (§8.4) - Seller has unlimited exposure\n2. **Broad Indemnification** (§8.2) - Buyer heavily protected\n3. **Weak Material Adverse Change** definition\n\n**Medium Priority:**\n• Environmental liability allocation unclear\n• IP warranty scope too broad\n• Employee retention provisions weak\n\n**Step 3: Generating Recommendations**\nCreating client-specific recommendations based on Johnson Industries\' buyer position...', this.getTimestamp(config.daysAgo, -20)),
        this.createMessage('ai', '**Risk Analysis Complete** ✅\n\n📊 **Final Risk Assessment Report Generated**\n\n**Executive Summary:**\n• Overall Risk Level: HIGH\n• Key Issue: Seller liability exposure\n• Recommended Action: Negotiate liability caps\n\n**Detailed Report Includes:**\n✅ Risk matrix with 12 identified issues\n✅ Clause-by-clause analysis\n✅ Negotiation recommendations\n✅ Precedent language suggestions\n\n**Export Options:**\n• Detailed PDF report (24 pages)\n• Executive summary (2 pages)\n• Red-line suggestions document\n\nReport ready for client review and negotiation strategy development.', this.getTimestamp(config.daysAgo, -25)),
        this.createMessage('user', 'Excellent analysis! Please export the detailed report and executive summary. Also provide the top 3 negotiation priorities.', this.getTimestamp(config.daysAgo, -30)),
        this.createMessage('ai', '**📄 CONTRACT ANALYSIS RESULTS EXPORTED**\n\n✅ **Reports Generated:**\n• `Johnson_ABC_Risk_Assessment_Detailed.pdf` (24 pages)\n• `Johnson_ABC_Executive_Summary.pdf` (2 pages)\n• `Negotiation_Redlines_Suggested.docx`\n\n**🎯 TOP 3 NEGOTIATION PRIORITIES:**\n\n**1. LIABILITY CAP IMPLEMENTATION** 🔴\n*Current*: Unlimited seller liability\n*Recommended*: Cap at 50% of purchase price ($22.5M)\n*Language*: "Seller\'s aggregate liability shall not exceed 50% of Purchase Price"\n\n**2. INDEMNIFICATION SCOPE REDUCTION** 🟡\n*Current*: Broad buyer indemnification coverage\n*Recommended*: Carve-out for known environmental issues\n*Impact*: Reduces seller exposure by ~$3-5M\n\n**3. MAC DEFINITION STRENGTHENING** 🟡\n*Current*: Vague materiality threshold\n*Recommended*: $2M threshold with specific carve-outs\n*Strategic*: Provides clearer closing conditions\n\n**📈 DEAL IMPACT ANALYSIS:**\n• Risk Reduction: HIGH → MEDIUM\n• Estimated Savings: $8-12M in potential exposure\n• Negotiation Timeline: 2-3 rounds expected\n\n**Next Steps:** Schedule client call to review priorities and negotiation strategy.', this.getTimestamp(config.daysAgo, -35))
      );
    } else if (config.title.includes('SaaS Agreement')) {
      // In progress - Step 2
      messages.push(
        this.createMessage('user', 'I need to analyze this SaaS service agreement for potential risks before my client signs.', baseTimestamp),
        this.createMessage('ai', 'I\'ll help you analyze this SaaS agreement for risks. Let\'s start the contract analysis workflow.\n\n**Step 1: Contract Upload**\nPlease upload the SaaS service agreement.', this.getTimestamp(config.daysAgo, -3)),
        this.createMessage('user', 'Here\'s the SaaS agreement from TechVendor Inc.', this.getTimestamp(config.daysAgo, -6), [
          { name: 'TechVendor_SaaS_Agreement_2024.pdf', type: 'document', size: 1400000 }
        ]),
        this.createMessage('ai', '**Step 1 Complete** ✅\n\n**Contract Analysis:**\n• Document Type: SaaS Service Agreement\n• Provider: TechVendor Inc.\n• Term: 3 years with auto-renewal\n• Value: $240K annually\n\n**Step 2: Risk Assessment In Progress** ⏳\n\nAnalyzing key risk areas:\n• Data security and privacy provisions\n• Service level agreements\n• Termination and data portability rights\n• Liability limitations\n\n*Deep analysis underway... Expected completion in 2-3 minutes*', this.getTimestamp(config.daysAgo, -9))
      );
    } else {
      // Employment Agreement - Early stage
      messages.push(
        this.createMessage('user', 'Can you help me review this employment agreement for our new executive hire?', baseTimestamp),
        this.createMessage('ai', 'I\'ll help you analyze this employment agreement for potential risks and issues. Let\'s start the contract analysis workflow.\n\n**Step 1: Contract Upload**\nPlease upload the employment agreement document, and let me know what type of employment contract this is (executive, standard, etc.).', this.getTimestamp(config.daysAgo, -1))
      );
    }

    return messages;
  }

  private generateLegalMemoMessages(config: MockConversationConfig, baseTimestamp: string): ChatMessage[] {
    const messages: ChatMessage[] = [];

    if (config.title.includes('Remote Work Policy')) {
      // Completed memo
      messages.push(
        this.createMessage('user', 'I need to research and draft a legal memorandum on remote work policy compliance across multiple states.', baseTimestamp),
        this.createMessage('ai', '**Legal Memorandum Complete** ✅\n\n📄 **Memorandum Generated:**\n"Legal Analysis: Multi-State Remote Work Policy Compliance"\n\n**Key Findings:**\n• State-specific wage and hour implications\n• Workers\' compensation coverage requirements\n• Tax nexus considerations for employers\n• Data privacy and security obligations\n\n**Document Stats:**\n• 12 pages with executive summary\n• 34 legal citations\n• 7 state jurisdictions analyzed\n• Risk assessment matrix included\n\n**Previous Research Included:**\n✅ Federal labor law analysis\n✅ State-by-state compliance review\n✅ Best practices recommendations\n✅ Policy template suggestions\n\nMemo exported and ready for client distribution.', this.getTimestamp(config.daysAgo, -3))
      );
    } else if (config.title.includes('Cryptocurrency')) {
      // In progress - Research phase
      messages.push(
        this.createMessage('user', 'I need to research and analyze the current state of cryptocurrency regulations for a client memo.', baseTimestamp),
        this.createMessage('ai', 'I\'ll help you create a comprehensive legal memorandum on cryptocurrency regulations. Let\'s define the scope:\n\n**Step 1: Memo Scope**\nWhat\'s the specific legal question you need me to address?', this.getTimestamp(config.daysAgo, -5)),
        this.createMessage('user', 'The client wants to understand regulatory compliance requirements for launching a cryptocurrency exchange platform in the US, particularly SEC and CFTC oversight.', this.getTimestamp(config.daysAgo, -8)),
        this.createMessage('ai', '**Step 1 Complete** ✅\n\n**Legal Question Defined:**\n"What are the federal regulatory compliance requirements for operating a cryptocurrency exchange platform in the United States?"\n\n**Research Scope:**\n• SEC securities regulation compliance\n• CFTC derivatives oversight\n• FinCEN AML/BSA requirements\n• State money transmitter licenses\n\n**Step 2: Legal Research In Progress** ⏳\n\nConducting comprehensive research on:\n✅ Recent SEC enforcement actions\n✅ CFTC guidance documents\n⏳ Federal court decisions (2022-2024)\n⏳ State regulatory developments\n⏳ International regulatory trends\n\n*Research 65% complete... Compiling findings...*', this.getTimestamp(config.daysAgo, -12))
      );
    } else {
      // Data Breach Response - Early stage
      messages.push(
        this.createMessage('user', 'I need to draft a legal memo analyzing our client\'s obligations after a potential data breach incident.', baseTimestamp),
        this.createMessage('ai', 'I\'ll help you draft a legal memorandum on data breach response obligations. Let\'s start by defining the scope:\n\n**Step 1: Memo Scope**\nPlease provide:\n• The specific legal question to address\n• Relevant factual background about the incident\n• Which jurisdiction\'s laws apply\n\nThis will help me focus the research and analysis.', this.getTimestamp(config.daysAgo, -2))
      );
    }

    return messages;
  }

  private generateDocumentReviewMessages(config: MockConversationConfig, baseTimestamp: string): ChatMessage[] {
    const messages: ChatMessage[] = [];

    if (config.title.includes('Merger Agreement')) {
      // Completed review
      messages.push(
        this.createMessage('user', 'Can you quickly review this merger agreement and give me the key points and any red flags?', baseTimestamp),
        this.createMessage('ai', 'I\'ll provide a quick review of your merger agreement. Please upload the document.', this.getTimestamp(config.daysAgo, -5)),
        this.createMessage('user', 'Here\'s the merger agreement draft.', this.getTimestamp(config.daysAgo, -8), [
          { name: 'Merger_Agreement_Draft_v2.pdf', type: 'document', size: 2800000 }
        ]),
        this.createMessage('ai', '**Document Review Complete** ✅\n\n📋 **Merger Agreement Analysis**\n\n**Document Overview:**\n• 89-page merger agreement\n• $125M transaction value\n• Cash and stock consideration\n• Delaware target corporation\n\n**✅ Key Positive Terms:**\n• Standard representations and warranties\n• Reasonable termination fee (2.5%)\n• Adequate closing conditions\n\n**🔴 Red Flags Identified:**\n1. **No collar on stock consideration** - Price volatility risk\n2. **Broad material adverse effect carve-outs** favoring buyer\n3. **Limited seller indemnification period** (12 months only)\n4. **Unusual financing contingency** language\n\n**📊 Overall Assessment:**\n• Structure: Standard statutory merger\n• Risk Level: Medium-High (stock component)\n• Recommendation: Negotiate collar and extend indemnity period\n\n**Action Items:**\n• Address stock price protection\n• Review financing commitments\n• Strengthen seller protections\n\nDetailed analysis exported to PDF for negotiation preparation.', this.getTimestamp(config.daysAgo, -12))
      );
    } else {
      // NDA Compliance Check - In progress
      messages.push(
        this.createMessage('user', 'I need a quick compliance check on this NDA to make sure it meets our client\'s requirements.', baseTimestamp),
        this.createMessage('ai', 'I\'ll perform a compliance check on your NDA. Please upload the document and let me know what specific compliance requirements or standards I should check against.', this.getTimestamp(config.daysAgo, -1))
      );
    }

    return messages;
  }

  private generateRegularChatMessages(config: MockConversationConfig, baseTimestamp: string): ChatMessage[] {
    const messages: ChatMessage[] = [];

    if (config.title.includes('Patent Filing Strategy')) {
      messages.push(
        this.createMessage('user', 'I need help developing a patent filing strategy for our client\'s new AI technology.', baseTimestamp),
        this.createMessage('ai', 'I\'d be happy to help develop a patent filing strategy for AI technology. Let me gather some key information:\n\n1. What type of AI technology is involved? (ML algorithms, neural networks, specific applications?)\n2. Is this a continuation of existing patent portfolio or entirely new?\n3. What\'s the target timeline for filing?\n4. Any competitive landscape considerations?', this.getTimestamp(config.daysAgo, -5)),
        this.createMessage('user', 'It\'s a machine learning algorithm for fraud detection in financial transactions. New technology, not related to existing portfolio. We want to file within 6 months.', this.getTimestamp(config.daysAgo, -10)),
        this.createMessage('ai', 'Excellent. For ML fraud detection technology, here\'s my recommended strategy:\n\n**Filing Approach:**\n• Focus on specific technical implementation rather than abstract algorithms\n• Emphasize novel data processing methods\n• Highlight unexpected technical advantages\n\n**Key Considerations:**\n• Alice/§101 eligibility - ensure concrete technical improvements\n• Prior art landscape in fintech ML\n• International filing strategy (EU, China considerations)\n\n**Timeline Recommendations:**\n• Month 1-2: Prior art analysis and claim development\n• Month 3-4: Draft preparation and technical review\n• Month 5-6: Filing and international strategy\n\nWould you like me to elaborate on any of these aspects?', this.getTimestamp(config.daysAgo, -15))
      );
    } else if (config.title.includes('Client Meeting Preparation')) {
      messages.push(
        this.createMessage('user', 'I have a client meeting tomorrow with Acme Corporation about their M&A transaction. Can you help me prepare?', baseTimestamp),
        this.createMessage('ai', 'I\'ll help you prepare for your Acme Corporation M&A meeting. Let me create a preparation checklist:\n\n**Meeting Preparation Areas:**\n• Transaction structure and timeline review\n• Key deal terms and open issues\n• Due diligence status and findings\n• Regulatory approval requirements\n• Integration planning considerations\n\nWhat specific aspects would you like to focus on? Also, what\'s Acme\'s role - buyer or seller?', this.getTimestamp(config.daysAgo, -3)),
        this.createMessage('user', 'Acme is the buyer. They\'re acquiring a smaller tech company. Main concerns are IP due diligence results and integration timeline.', this.getTimestamp(config.daysAgo, -6)),
        this.createMessage('ai', '**Acme Corp M&A Meeting Prep** 📋\n\n**IP Due Diligence Discussion Points:**\n• Patent portfolio strength and coverage\n• Pending litigation or disputes\n• Employee invention assignments\n• Open source software compliance\n• Trade secret protection protocols\n\n**Integration Timeline Focus:**\n• Systems integration requirements\n• Employee retention strategies\n• Customer transition planning\n• Regulatory notification timing\n\n**Recommended Meeting Agenda:**\n1. IP due diligence findings review (20 min)\n2. Integration timeline discussion (15 min)\n3. Open issues and next steps (10 min)\n4. Action items and follow-up (5 min)\n\nWould you like me to elaborate on any specific IP concerns or integration challenges?', this.getTimestamp(config.daysAgo, -9))
      );
    } else {
      // Litigation Timeline Review
      messages.push(
        this.createMessage('user', 'I need to review the litigation timeline for Smith vs. TechCorp and identify any upcoming deadlines.', baseTimestamp),
        this.createMessage('ai', 'I\'ll help you review the Smith vs. TechCorp litigation timeline. To provide the most accurate deadline analysis, I\'ll need:\n\n• Current case status and recent court orders\n• Discovery schedule and any pending motions\n• Trial date (if set)\n• Any settlement discussions or mediation scheduled\n\n**Critical Deadlines to Monitor:**\n• Fact discovery cutoff\n• Expert discovery deadlines\n• Dispositive motion deadlines\n• Pre-trial conference dates\n• Trial preparation milestones\n\nWhat\'s the current procedural posture of the case?', this.getTimestamp(config.daysAgo, -4)),
        this.createMessage('user', 'We\'re in the middle of fact discovery. Last court order extended discovery deadline to March 15th. No trial date set yet, but expecting summer 2024.', this.getTimestamp(config.daysAgo, -8)),
        this.createMessage('ai', '**Smith vs. TechCorp Timeline Analysis** ⚖️\n\n**Immediate Deadlines (Next 30 days):**\n• Document production responses due\n• Deposition scheduling for key witnesses\n• Third-party subpoena responses\n\n**Critical Upcoming Milestones:**\n• **March 15, 2024**: Fact discovery cutoff\n• **April 15, 2024**: Expert disclosure deadline (estimated)\n• **May 15, 2024**: Expert discovery cutoff (estimated)\n• **June 1, 2024**: Dispositive motion deadline (estimated)\n\n**Recommended Actions:**\n• Schedule remaining depositions by February 1st\n• Begin expert witness preparation\n• Prepare discovery summary for motion practice\n\n**Risk Assessment:**\n🟡 Medium risk of deadline conflicts if settlement discussions intensify\n\nWould you like me to create a detailed task checklist for the next 60 days?', this.getTimestamp(config.daysAgo, -12))
      );
    }

    return messages;
  }
}

export const mockConversationsService = new MockConversationsService();