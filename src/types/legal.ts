export type RiskLevel = 'low' | 'medium' | 'high' | 'critical';
export type CitationType = 'case' | 'statute' | 'regulation' | 'article' | 'book' | 'other';
export type AnalysisType = 'contract' | 'document' | 'case' | 'compliance' | 'risk' | 'precedent';

export interface LegalCitation {
  id: string;
  type: CitationType;
  title: string;
  citation: string;
  court?: string;
  year?: number;
  jurisdiction: string;
  url?: string;
  summary?: string;
  relevance: number; // 0-100
  pinpoint?: string; // Specific page or paragraph
  bluebookFormat: string;
}

export interface RiskAssessment {
  id: string;
  title: string;
  description: string;
  level: RiskLevel;
  category: string;
  impact: string;
  likelihood: string;
  mitigation: string[];
  relatedCitations?: LegalCitation[];
  deadline?: string;
  assignedTo?: string;
  priority: number; // 1-5
}

export interface DocumentAnalysis {
  id: string;
  documentId: string;
  documentName: string;
  analysisType: AnalysisType;
  summary: string;
  keyTerms: HighlightedTerm[];
  risks: RiskAssessment[];
  suggestions: ActionSuggestion[];
  completedAt: string;
  confidence: number; // 0-100
  pageCount?: number;
  wordCount?: number;
}

export interface HighlightedTerm {
  id: string;
  text: string;
  type: 'risk' | 'opportunity' | 'obligation' | 'definition' | 'date' | 'amount';
  description: string;
  position: TextPosition;
  severity?: RiskLevel;
  suggestions?: string[];
}

export interface TextPosition {
  page?: number;
  paragraph?: number;
  startOffset: number;
  endOffset: number;
  context: string; // Surrounding text
}

export interface ContractComparison {
  id: string;
  documentA: string;
  documentB: string;
  comparisonType: 'clause' | 'full' | 'terms';
  differences: ContractDifference[];
  similarities: ContractSimilarity[];
  recommendations: string[];
  completedAt: string;
}

export interface ContractDifference {
  id: string;
  type: 'addition' | 'deletion' | 'modification';
  clauseType: string;
  documentA?: ClauseContent;
  documentB?: ClauseContent;
  impact: RiskLevel;
  description: string;
  recommendation: string;
}

export interface ContractSimilarity {
  id: string;
  clauseType: string;
  content: string;
  position: {
    documentA: TextPosition;
    documentB: TextPosition;
  };
  matchScore: number; // 0-100
}

export interface ClauseContent {
  text: string;
  position: TextPosition;
  metadata?: Record<string, any>;
}

export interface ActionSuggestion {
  id: string;
  title: string;
  description: string;
  type: 'research' | 'draft' | 'review' | 'calendar' | 'communicate' | 'file';
  priority: RiskLevel;
  estimatedTime?: string;
  deadline?: string;
  assignTo?: string;
  relatedTo?: {
    type: 'matter' | 'client' | 'document';
    id: string;
  };
  action: {
    type: 'navigate' | 'create' | 'update' | 'external';
    target: string;
    data?: Record<string, any>;
  };
}

export interface DeadlineCalculation {
  id: string;
  title: string;
  baseDate: string;
  jurisdiction: string;
  ruleType: string;
  days: number;
  businessDaysOnly: boolean;
  excludeHolidays: boolean;
  calculatedDate: string;
  explanation: string;
  relatedRules: LegalCitation[];
  warnings: string[];
  alternatives?: {
    description: string;
    date: string;
    rule: string;
  }[];
}

export interface LegalResearchResult {
  id: string;
  query: string;
  results: LegalSearchResult[];
  filters: ResearchFilter[];
  totalResults: number;
  searchTime: number;
  suggestions: string[];
  relatedQueries: string[];
}

export interface LegalSearchResult {
  id: string;
  title: string;
  type: CitationType;
  citation: LegalCitation;
  snippet: string;
  relevanceScore: number;
  jurisdiction: string;
  date: string;
  keyTerms: string[];
  fullText?: string;
  metadata?: Record<string, any>;
}

export interface ResearchFilter {
  type: 'jurisdiction' | 'court' | 'date' | 'type' | 'relevance';
  value: string;
  label: string;
  active: boolean;
}

export interface AIInsight {
  id: string;
  type: 'warning' | 'opportunity' | 'suggestion' | 'analysis';
  title: string;
  description: string;
  confidence: number;
  source: string;
  relatedData: any;
  timestamp: string;
  dismissed: boolean;
  actions?: ActionSuggestion[];
}