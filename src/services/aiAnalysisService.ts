import { 
  AIAnalysis, 
  AnalysisType, 
  Finding, 
  Recommendation, 
  KeyDate, 
  Obligation,
  KeyTerm,
  ComplianceIssue 
} from '@/types/document';

// Mock AI analysis service - will be replaced with real AI integration later
class AIAnalysisService {
  // Simulate AI analysis with realistic mock data
  async analyzeDocument(documentId: string, analysisType: AnalysisType = 'contract_analysis'): Promise<AIAnalysis> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 2000 + Math.random() * 1000));

    // Generate mock risk score (weighted towards medium risk for realism)
    const riskScore = this.generateWeightedRiskScore();
    
    // Generate mock findings based on risk score
    const findings = this.generateMockFindings(riskScore);
    
    // Generate recommendations based on findings
    const recommendations = this.generateMockRecommendations(findings);
    
    // Generate other mock data
    const keyDates = this.generateMockKeyDates();
    const obligations = this.generateMockObligations();
    const keyTerms = this.generateMockKeyTerms();
    const complianceIssues = this.generateMockComplianceIssues(riskScore);

    const analysis: AIAnalysis = {
      id: `ai_${Date.now()}`,
      documentId,
      analysisType,
      riskScore,
      confidence: 0.85 + Math.random() * 0.15, // 85-100% confidence
      findings,
      recommendations,
      summary: this.generateMockSummary(riskScore, findings.length),
      keyDates,
      obligations,
      keyTerms,
      complianceIssues,
      createdAt: new Date().toISOString(),
      processingTime: 2000 + Math.random() * 3000,
      modelVersion: 'mock-v1.0'
    };

    return analysis;
  }

  // Batch analyze multiple documents
  async analyzeDocuments(documentIds: string[]): Promise<AIAnalysis[]> {
    const analyses = await Promise.all(
      documentIds.map(id => this.analyzeDocument(id))
    );
    return analyses;
  }

  // Get analysis by document ID
  async getAnalysis(documentId: string): Promise<AIAnalysis | null> {
    // In a real implementation, this would fetch from database
    // For now, return null to simulate no existing analysis
    return null;
  }

  // Private helper methods
  private generateWeightedRiskScore(): number {
    const random = Math.random();
    if (random < 0.4) {
      // 40% chance of low risk (0-30)
      return Math.floor(Math.random() * 31);
    } else if (random < 0.8) {
      // 40% chance of medium risk (31-70)
      return 31 + Math.floor(Math.random() * 40);
    } else {
      // 20% chance of high risk (71-100)
      return 71 + Math.floor(Math.random() * 30);
    }
  }

  private generateMockFindings(riskScore: number): Finding[] {
    const findings: Finding[] = [];
    const numFindings = Math.floor(riskScore / 20) + 1;

    const findingTypes = [
      { type: 'missing_clause', title: 'Missing Limitation of Liability Clause', severity: 'high' },
      { type: 'unfavorable_term', title: 'Unfavorable Payment Terms', severity: 'medium' },
      { type: 'compliance_issue', title: 'GDPR Compliance Gap', severity: 'high' },
      { type: 'risk', title: 'Unclear Termination Conditions', severity: 'medium' },
      { type: 'opportunity', title: 'Favorable Renewal Terms Available', severity: 'low' }
    ];

    for (let i = 0; i < numFindings && i < findingTypes.length; i++) {
      const finding = findingTypes[i];
      findings.push({
        id: `finding_${i + 1}`,
        type: finding.type as Finding['type'],
        severity: finding.severity as Finding['severity'],
        title: finding.title,
        description: `Analysis has identified: ${finding.title}. This requires attention.`,
        location: {
          page: Math.floor(Math.random() * 10) + 1,
          paragraph: Math.floor(Math.random() * 20) + 1
        },
        confidence: 0.7 + Math.random() * 0.3,
        suggestedAction: 'Review and address this finding with legal counsel'
      });
    }

    return findings;
  }

  private generateMockRecommendations(findings: Finding[]): Recommendation[] {
    return findings.slice(0, 3).map((finding, index) => ({
      id: `rec_${index + 1}`,
      type: 'modify_clause' as Recommendation['type'],
      priority: finding.severity as Recommendation['priority'],
      title: `Address: ${finding.title}`,
      description: `Recommendation to address the identified issue`,
      reasoning: 'Based on AI analysis and best practices',
      suggestedText: 'Sample suggested text for modification',
      relatedFindings: [finding.id]
    }));
  }

  private generateMockKeyDates(): KeyDate[] {
    const today = new Date();
    return [
      {
        id: 'date_1',
        date: new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        type: 'deadline',
        description: 'Contract Review Deadline',
        importance: 'high',
        location: { page: 1, paragraph: 3 }
      },
      {
        id: 'date_2',
        date: new Date(today.getTime() + 90 * 24 * 60 * 60 * 1000).toISOString(),
        type: 'renewal',
        description: 'Auto-Renewal Date',
        importance: 'critical',
        location: { page: 5, paragraph: 2 }
      }
    ];
  }

  private generateMockObligations(): Obligation[] {
    return [
      {
        id: 'ob_1',
        party: 'Client',
        description: 'Monthly payment of fees',
        type: 'payment',
        deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        conditions: ['Upon invoice receipt'],
        consequences: 'Late fees apply',
        location: { page: 3, paragraph: 1 }
      }
    ];
  }

  private generateMockKeyTerms(): KeyTerm[] {
    return [
      {
        id: 'term_1',
        term: 'Confidential Information',
        definition: 'Any proprietary information disclosed by either party',
        importance: 'high',
        context: 'As defined in Section 5',
        location: { page: 2, paragraph: 1 }
      }
    ];
  }

  private generateMockComplianceIssues(riskScore: number): ComplianceIssue[] {
    if (riskScore < 50) return [];
    
    return [
      {
        id: 'comp_1',
        regulation: 'GDPR',
        description: 'Data processing terms need updating',
        severity: 'medium',
        remediation: 'Add standard GDPR clauses',
        deadline: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString()
      }
    ];
  }

  private generateMockSummary(riskScore: number, findingsCount: number): string {
    if (riskScore <= 30) {
      return `This document appears to be low risk with ${findingsCount} minor findings. The terms are generally favorable and compliant with standard practices.`;
    } else if (riskScore <= 70) {
      return `This document has moderate risk with ${findingsCount} findings that require attention. Several clauses could be improved to better protect your interests.`;
    } else {
      return `This document presents significant risk with ${findingsCount} critical findings. Immediate legal review is strongly recommended before proceeding.`;
    }
  }
}

// Export singleton instance
export const aiAnalysisService = new AIAnalysisService();