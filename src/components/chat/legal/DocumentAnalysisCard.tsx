import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { DocumentAnalysis, HighlightedTerm } from '@/types/legal';
import { 
  FileText,
  AlertTriangle,
  CheckCircle,
  Info,
  Calendar,
  DollarSign,
  ChevronDown,
  ChevronUp,
  Eye,
  Download
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface DocumentAnalysisCardProps {
  analysis: DocumentAnalysis;
  onViewDocument?: () => void;
  onDownloadReport?: () => void;
  className?: string;
}

const getTermTypeIcon = (type: string) => {
  switch (type) {
    case 'risk':
      return <AlertTriangle className="h-3 w-3" />;
    case 'opportunity':
      return <CheckCircle className="h-3 w-3" />;
    case 'obligation':
      return <Info className="h-3 w-3" />;
    case 'date':
      return <Calendar className="h-3 w-3" />;
    case 'amount':
      return <DollarSign className="h-3 w-3" />;
    default:
      return <Info className="h-3 w-3" />;
  }
};

const getTermTypeColor = (type: string) => {
  switch (type) {
    case 'risk':
      return 'bg-red-50 text-red-700 border-red-200';
    case 'opportunity':
      return 'bg-green-50 text-green-700 border-green-200';
    case 'obligation':
      return 'bg-blue-50 text-blue-700 border-blue-200';
    case 'date':
      return 'bg-purple-50 text-purple-700 border-purple-200';
    case 'amount':
      return 'bg-orange-50 text-orange-700 border-orange-200';
    default:
      return 'bg-gray-50 text-gray-700 border-gray-200';
  }
};

const getConfidenceColor = (confidence: number) => {
  if (confidence >= 90) return 'text-green-600';
  if (confidence >= 70) return 'text-blue-600';
  if (confidence >= 50) return 'text-yellow-600';
  return 'text-red-600';
};

export const DocumentAnalysisCard: React.FC<DocumentAnalysisCardProps> = ({
  analysis,
  onViewDocument,
  onDownloadReport,
  className,
}) => {
  const [showKeyTerms, setShowKeyTerms] = useState(false);
  const [selectedTermType, setSelectedTermType] = useState<string | null>(null);

  const filteredTerms = selectedTermType 
    ? analysis.keyTerms.filter(term => term.type === selectedTermType)
    : analysis.keyTerms;

  const termTypeCounts = analysis.keyTerms.reduce((acc, term) => {
    acc[term.type] = (acc[term.type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const riskTerms = analysis.keyTerms.filter(term => term.type === 'risk');
  const opportunityTerms = analysis.keyTerms.filter(term => term.type === 'opportunity');

  return (
    <Card className={cn('shadow-sm border-l-4 border-l-green-500', className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <FileText className="h-5 w-5 text-green-600" />
            Document Analysis
          </CardTitle>
          
          <div className="flex items-center gap-2">
            <Badge variant="outline" className={cn('border', getConfidenceColor(analysis.confidence))}>
              {Math.round(analysis.confidence)}% confidence
            </Badge>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Document Info */}
        <div className="bg-gray-50 border rounded-lg p-3">
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-medium text-gray-900">{analysis.documentName}</h4>
            <Badge variant="secondary" className="text-xs capitalize">
              {analysis.analysisType}
            </Badge>
          </div>
          
          <div className="grid grid-cols-3 gap-4 text-sm text-gray-600">
            {analysis.pageCount && (
              <div>{analysis.pageCount} pages</div>
            )}
            {analysis.wordCount && (
              <div>{analysis.wordCount.toLocaleString()} words</div>
            )}
            <div>{new Date(analysis.completedAt).toLocaleDateString()}</div>
          </div>
        </div>

        {/* Summary */}
        <div>
          <h5 className="font-medium text-gray-900 mb-2">Executive Summary</h5>
          <p className="text-sm text-gray-700 leading-relaxed">
            {analysis.summary}
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-4 p-3 bg-gray-50 rounded-lg">
          <div className="text-center">
            <div className="text-lg font-semibold text-red-600">
              {riskTerms.length}
            </div>
            <div className="text-xs text-gray-600">Risks</div>
          </div>
          
          <div className="text-center">
            <div className="text-lg font-semibold text-green-600">
              {opportunityTerms.length}
            </div>
            <div className="text-xs text-gray-600">Opportunities</div>
          </div>
          
          <div className="text-center">
            <div className="text-lg font-semibold text-blue-600">
              {analysis.suggestions.length}
            </div>
            <div className="text-xs text-gray-600">Suggestions</div>
          </div>
        </div>

        {/* Key Terms Toggle */}
        <div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowKeyTerms(!showKeyTerms)}
            className="w-full justify-between"
          >
            <span>Key Terms ({analysis.keyTerms.length})</span>
            {showKeyTerms ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </Button>

          {showKeyTerms && (
            <div className="mt-3 space-y-3">
              {/* Term Type Filters */}
              <div className="flex flex-wrap gap-2">
                <Button
                  size="sm"
                  variant={selectedTermType === null ? "default" : "outline"}
                  onClick={() => setSelectedTermType(null)}
                  className="text-xs"
                >
                  All ({analysis.keyTerms.length})
                </Button>
                
                {Object.entries(termTypeCounts).map(([type, count]) => (
                  <Button
                    key={type}
                    size="sm"
                    variant={selectedTermType === type ? "default" : "outline"}
                    onClick={() => setSelectedTermType(type)}
                    className="text-xs capitalize"
                  >
                    {type} ({count})
                  </Button>
                ))}
              </div>

              {/* Terms List */}
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {filteredTerms.map((term) => (
                  <div key={term.id} className="border rounded p-3 bg-white">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className={cn('border text-xs', getTermTypeColor(term.type))}>
                          {getTermTypeIcon(term.type)}
                          <span className="ml-1 capitalize">{term.type}</span>
                        </Badge>
                        
                        {term.severity && (
                          <Badge variant="outline" className={cn('text-xs', getTermTypeColor(term.severity))}>
                            {term.severity}
                          </Badge>
                        )}
                      </div>
                    </div>
                    
                    <div className="mb-2">
                      <span className="font-medium text-gray-900">{term.text}</span>
                    </div>
                    
                    <p className="text-sm text-gray-600 mb-2">
                      {term.description}
                    </p>
                    
                    {term.context && (
                      <div className="bg-gray-50 border rounded p-2 text-xs text-gray-600">
                        <span className="font-medium">Context:</span> {term.context}
                      </div>
                    )}
                    
                    {term.suggestions && term.suggestions.length > 0 && (
                      <div className="mt-2 space-y-1">
                        {term.suggestions.map((suggestion, index) => (
                          <div key={index} className="text-xs text-blue-600 flex items-start gap-1">
                            <span>💡</span>
                            {suggestion}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 pt-3 border-t">
          {onViewDocument && (
            <Button size="sm" variant="outline" onClick={onViewDocument}>
              <Eye className="h-4 w-4 mr-2" />
              View Document
            </Button>
          )}
          
          {onDownloadReport && (
            <Button size="sm" variant="outline" onClick={onDownloadReport}>
              <Download className="h-4 w-4 mr-2" />
              Download Report
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};