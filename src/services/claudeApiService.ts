import { WorkflowTemplate, WorkflowStep, StepInput } from '@/types/workflow';

export interface ClaudeApiResponse {
  content: string;
  success: boolean;
  error?: string;
}

export interface DocumentAnalysis {
  summary: string;
  keyFindings: string[];
  riskLevel: 'low' | 'medium' | 'high';
  recommendations: string[];
}

export interface ClientAlertData {
  title: string;
  executiveSummary: string;
  keyPoints: string[];
  actionItems: string[];
  urgencyLevel: 'low' | 'medium' | 'high';
  targetAudience: string[];
}

class ClaudeApiService {
  private readonly BASE_URL = 'https://api.anthropic.com/v1/messages';
  private readonly API_KEY = import.meta.env.VITE_CLAUDE_API_KEY;

  constructor() {
    if (!this.API_KEY) {
      console.warn('Claude API key not found. Using mock responses.');
    }
  }

  async generateClientAlert(
    sourceDocument: string,
    templateStyle?: string,
    targetAudience?: string,
    urgencyLevel?: string
  ): Promise<ClientAlertData> {
    const prompt = `
You are a senior legal expert creating a client alert. Please analyze the following legal document/regulation and create a comprehensive client alert.

Source Document/Regulation:
${sourceDocument}

${templateStyle ? `Template Style to Follow:\n${templateStyle}\n` : ''}

Target Audience: ${targetAudience || 'General corporate clients'}
Urgency Level: ${urgencyLevel || 'Medium'}

Please provide a comprehensive client alert with:
1. A compelling title
2. Executive summary (2-3 sentences)
3. Key points (3-5 bullet points)
4. Action items for clients
5. Assessment of urgency level

Format your response as a structured legal client alert that would be suitable for distribution to corporate clients.
`;

    try {
      const response = await this.callClaudeApi(prompt);
      return this.parseClientAlertResponse(response.content);
    } catch (error) {
      console.error('Error generating client alert:', error);
      return this.getMockClientAlert();
    }
  }

  async analyzeContract(
    contractText: string,
    contractType: string,
    clientPosition: 'buyer' | 'seller' | 'general'
  ): Promise<DocumentAnalysis> {
    const prompt = `
You are a senior corporate attorney conducting a detailed contract analysis. Please analyze the following contract and provide a comprehensive risk assessment.

Contract Type: ${contractType}
Client Position: ${clientPosition}

Contract Text:
${contractText}

Please provide:
1. Executive summary of the contract
2. Key findings and issues identified
3. Risk level assessment (low/medium/high)
4. Specific recommendations for negotiation
5. Priority items that need immediate attention

Focus on liability, indemnification, termination, payment terms, and any unusual or problematic clauses.
`;

    try {
      const response = await this.callClaudeApi(prompt);
      return this.parseContractAnalysis(response.content);
    } catch (error) {
      console.error('Error analyzing contract:', error);
      return this.getMockContractAnalysis();
    }
  }

  async generateLegalMemo(
    legalQuestion: string,
    jurisdiction: string,
    researchScope: string[]
  ): Promise<string> {
    const prompt = `
You are a senior legal researcher writing a comprehensive legal memorandum. Please research and analyze the following legal question.

Legal Question: ${legalQuestion}
Jurisdiction: ${jurisdiction}
Research Scope: ${researchScope.join(', ')}

Please provide a detailed legal memorandum with:
1. Executive Summary
2. Legal Analysis
3. Relevant Case Law and Statutes
4. Risk Assessment
5. Recommendations

Format this as a professional legal memorandum suitable for client review.
`;

    try {
      const response = await this.callClaudeApi(prompt);
      return response.content;
    } catch (error) {
      console.error('Error generating legal memo:', error);
      return this.getMockLegalMemo();
    }
  }

  async quickDocumentReview(
    documentText: string,
    documentType: string
  ): Promise<DocumentAnalysis> {
    const prompt = `
You are a senior attorney conducting a quick document review. Please analyze the following document and provide immediate feedback.

Document Type: ${documentType}

Document Text:
${documentText}

Please provide:
1. Brief summary of the document
2. Key issues or red flags identified
3. Overall risk level
4. Immediate recommendations

This should be a quick but thorough review focusing on the most critical issues.
`;

    try {
      const response = await this.callClaudeApi(prompt);
      return this.parseDocumentReview(response.content);
    } catch (error) {
      console.error('Error reviewing document:', error);
      return this.getMockDocumentReview();
    }
  }

  private async callClaudeApi(prompt: string): Promise<ClaudeApiResponse> {
    if (!this.API_KEY) {
      throw new Error('Claude API key not configured');
    }

    const response = await fetch(this.BASE_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.API_KEY}`,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-3-sonnet-20240229',
        max_tokens: 4000,
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ]
      })
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status}`);
    }

    const data = await response.json();
    return {
      content: data.content[0].text,
      success: true
    };
  }

  private parseClientAlertResponse(content: string): ClientAlertData {
    // Simple parsing - in production, you'd want more sophisticated parsing
    const lines = content.split('\n');
    const titleMatch = content.match(/Title:?\s*(.+)/i);
    const summaryMatch = content.match(/Executive Summary:?\s*(.+)/i);
    
    return {
      title: titleMatch?.[1] || 'Legal Update - Client Alert',
      executiveSummary: summaryMatch?.[1] || 'Important legal developments requiring client attention.',
      keyPoints: this.extractBulletPoints(content, 'Key Points'),
      actionItems: this.extractBulletPoints(content, 'Action Items'),
      urgencyLevel: content.toLowerCase().includes('urgent') ? 'high' : 'medium',
      targetAudience: ['Corporate Clients', 'General Counsel']
    };
  }

  private parseContractAnalysis(content: string): DocumentAnalysis {
    const riskLevel = content.toLowerCase().includes('high risk') ? 'high' :
                     content.toLowerCase().includes('medium risk') ? 'medium' : 'low';
    
    return {
      summary: this.extractSection(content, 'Summary') || 'Contract analysis completed',
      keyFindings: this.extractBulletPoints(content, 'Key Findings'),
      riskLevel,
      recommendations: this.extractBulletPoints(content, 'Recommendations')
    };
  }

  private parseDocumentReview(content: string): DocumentAnalysis {
    const riskLevel = content.toLowerCase().includes('high risk') ? 'high' :
                     content.toLowerCase().includes('medium risk') ? 'medium' : 'low';
    
    return {
      summary: this.extractSection(content, 'Summary') || 'Document review completed',
      keyFindings: this.extractBulletPoints(content, 'Issues') || this.extractBulletPoints(content, 'Key Points'),
      riskLevel,
      recommendations: this.extractBulletPoints(content, 'Recommendations')
    };
  }

  private extractSection(content: string, sectionName: string): string | null {
    const regex = new RegExp(`${sectionName}:?\\s*(.+?)(?=\\n\\n|$)`, 'i');
    const match = content.match(regex);
    return match?.[1]?.trim() || null;
  }

  private extractBulletPoints(content: string, sectionName: string): string[] {
    const sectionRegex = new RegExp(`${sectionName}:?\\s*([\\s\\S]*?)(?=\\n\\n[A-Z]|$)`, 'i');
    const section = content.match(sectionRegex)?.[1];
    
    if (!section) return [];
    
    const bulletPoints = section
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.match(/^[-•*]\s/) || line.match(/^\d+\.\s/))
      .map(line => line.replace(/^[-•*]\s|^\d+\.\s/, '').trim());
    
    return bulletPoints;
  }

  // Mock responses for when API is not available
  private getMockClientAlert(): ClientAlertData {
    return {
      title: 'New Privacy Law Requirements - Client Alert',
      executiveSummary: 'Recent privacy law changes require immediate attention from all affected organizations.',
      keyPoints: [
        'New compliance requirements take effect within 60 days',
        'Enhanced data protection measures required',
        'Potential penalties for non-compliance increased significantly'
      ],
      actionItems: [
        'Review current privacy policies and procedures',
        'Implement additional data protection safeguards',
        'Train staff on new compliance requirements'
      ],
      urgencyLevel: 'high',
      targetAudience: ['Corporate Clients', 'Data Controllers']
    };
  }

  private getMockContractAnalysis(): DocumentAnalysis {
    return {
      summary: 'Standard commercial agreement with several areas requiring attention',
      keyFindings: [
        'Liability limitations favor counterparty',
        'Termination provisions lack adequate protection',
        'Payment terms may cause cash flow issues'
      ],
      riskLevel: 'medium',
      recommendations: [
        'Negotiate liability cap at 50% of contract value',
        'Add termination for convenience clause',
        'Modify payment terms to net 30 days'
      ]
    };
  }

  private getMockLegalMemo(): string {
    return `
LEGAL MEMORANDUM

TO: Client
FROM: Legal Team
DATE: ${new Date().toLocaleDateString()}
RE: Legal Analysis Request

EXECUTIVE SUMMARY

This memorandum provides analysis of the requested legal issue and recommendations for moving forward.

LEGAL ANALYSIS

Based on current jurisprudence and applicable statutes, the following considerations apply:

1. Relevant Legal Framework
2. Risk Assessment
3. Recommended Approach

CONCLUSION

The analysis suggests a measured approach with careful consideration of the identified risks and opportunities.
`;
  }

  private getMockDocumentReview(): DocumentAnalysis {
    return {
      summary: 'Document reviewed for key legal issues and compliance requirements',
      keyFindings: [
        'Standard terms and conditions generally acceptable',
        'Some clauses may require modification',
        'Overall structure follows industry standards'
      ],
      riskLevel: 'low',
      recommendations: [
        'Consider minor modifications to liability clauses',
        'Review termination provisions',
        'Document appears suitable for execution'
      ]
    };
  }
}

export const claudeApiService = new ClaudeApiService();