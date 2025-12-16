import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import {
  Brain,
  AlertTriangle,
  CheckCircle,
  AlertCircle,
  Info,
  Clock,
  FileText,
  Eye,
  Download,
  Share,
  Calendar,
  DollarSign,
  Scale,
  Shield,
  Target
} from 'lucide-react';
import { AIAnalysis, Finding, Recommendation } from '@/types/document';
import { cn } from '@/lib/utils';

interface AIAnalysisModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  analysis: AIAnalysis | null;
  documentName?: string;
}

const AIAnalysisModal: React.FC<AIAnalysisModalProps> = ({
  open,
  onOpenChange,
  analysis,
  documentName = 'Document'
}) => {
  if (!analysis) return null;

  const getRiskLevel = (score: number) => {
    if (score <= 30) return {
      level: 'low',
      color: 'text-green-600 bg-green-50 border-green-200',
      icon: CheckCircle,
      description: 'Low Risk',
      bgColor: 'bg-green-500'
    };
    if (score <= 70) return {
      level: 'medium',
      color: 'text-yellow-600 bg-yellow-50 border-yellow-200',
      icon: AlertCircle,
      description: 'Medium Risk',
      bgColor: 'bg-yellow-500'
    };
    return {
      level: 'high',
      color: 'text-red-600 bg-red-50 border-red-200',
      icon: AlertTriangle,
      description: 'High Risk',
      bgColor: 'bg-red-500'
    };
  };

  const getFindingIcon = (type: Finding['type']) => {
    switch (type) {
      case 'risk': return AlertTriangle;
      case 'missing_clause': return Info;
      case 'compliance_issue': return Shield;
      case 'opportunity': return CheckCircle;
      case 'unfavorable_term': return AlertCircle;
      default: return Info;
    }
  };

  const getFindingColor = (type: Finding['type']) => {
    switch (type) {
      case 'risk': return 'text-red-600 bg-red-50';
      case 'missing_clause': return 'text-blue-600 bg-blue-50';
      case 'compliance_issue': return 'text-purple-600 bg-purple-50';
      case 'opportunity': return 'text-green-600 bg-green-50';
      case 'unfavorable_term': return 'text-orange-600 bg-orange-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const risk = getRiskLevel(analysis.riskScore);
  const RiskIcon = risk.icon;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Brain className="h-5 w-5 text-primary" />
            <span>AI Analysis Results</span>
          </DialogTitle>
          <DialogDescription>
            Detailed AI analysis for {documentName}
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[calc(90vh-120px)]">
          <div className="space-y-6 pr-4">
            {/* Risk Score Overview */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center space-x-2">
                    <RiskIcon className="h-5 w-5" />
                    <span>Risk Assessment</span>
                  </span>
                  <Badge variant="outline" className={cn('text-lg px-4 py-1', risk.color)}>
                    {analysis.riskScore}/100
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">{risk.description}</span>
                    <span className="text-sm text-muted-foreground">{analysis.riskScore}%</span>
                  </div>
                  <Progress value={analysis.riskScore} className="h-2" />
                </div>
                <div className="p-4 rounded-lg bg-muted">
                  <p className="text-sm">{analysis.summary}</p>
                </div>
              </CardContent>
            </Card>

            {/* Analysis Metadata */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Info className="h-5 w-5" />
                  <span>Analysis Details</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <Clock className="h-4 w-4 mx-auto mb-1 text-muted-foreground" />
                    <p className="text-xs text-muted-foreground">Analyzed</p>
                    <p className="text-sm font-medium">
                      {new Date(analysis.analyzedAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-center">
                    <FileText className="h-4 w-4 mx-auto mb-1 text-muted-foreground" />
                    <p className="text-xs text-muted-foreground">Type</p>
                    <p className="text-sm font-medium capitalize">
                      {analysis.analysisType.replace('_', ' ')}
                    </p>
                  </div>
                  <div className="text-center">
                    <Target className="h-4 w-4 mx-auto mb-1 text-muted-foreground" />
                    <p className="text-xs text-muted-foreground">Findings</p>
                    <p className="text-sm font-medium">{analysis.findings.length}</p>
                  </div>
                  <div className="text-center">
                    <Scale className="h-4 w-4 mx-auto mb-1 text-muted-foreground" />
                    <p className="text-xs text-muted-foreground">Confidence</p>
                    <p className="text-sm font-medium">{analysis.confidence}%</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Key Findings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <AlertTriangle className="h-5 w-5" />
                  <span>Key Findings ({analysis.findings.length})</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {analysis.findings.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <CheckCircle className="h-8 w-8 mx-auto mb-2" />
                    <p>No significant issues found in this document.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {analysis.findings.map((finding, index) => {
                      const FindingIcon = getFindingIcon(finding.type);
                      const findingColor = getFindingColor(finding.type);
                      
                      return (
                        <div
                          key={index}
                          className="border rounded-lg p-4 space-y-2"
                        >
                          <div className="flex items-start space-x-3">
                            <div className={cn('p-2 rounded-lg', findingColor)}>
                              <FindingIcon className="h-4 w-4" />
                            </div>
                            <div className="flex-1 space-y-1">
                              <div className="flex items-center justify-between">
                                <h4 className="font-medium">{finding.title}</h4>
                                <Badge variant="outline" className="text-xs capitalize">
                                  {finding.type.replace('_', ' ')}
                                </Badge>
                              </div>
                              <p className="text-sm text-muted-foreground">
                                {finding.description}
                              </p>
                              {finding.suggestedAction && (
                                <div className="mt-2 p-2 bg-muted rounded text-xs">
                                  <strong>Suggested Action:</strong> {finding.suggestedAction}
                                </div>
                              )}
                              {finding.severity && (
                                <div className="flex items-center space-x-2 mt-1">
                                  <span className="text-xs text-muted-foreground">Severity:</span>
                                  <Badge 
                                    variant={finding.severity === 'high' ? 'destructive' : 
                                            finding.severity === 'medium' ? 'default' : 'secondary'}
                                    className="text-xs"
                                  >
                                    {finding.severity}
                                  </Badge>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Key Dates & Terms */}
            {analysis.keyDates && analysis.keyDates.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Calendar className="h-5 w-5" />
                    <span>Important Dates</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {analysis.keyDates.map((date, index) => (
                      <div key={index} className="flex items-center justify-between p-2 border rounded">
                        <span className="text-sm font-medium">{date.type}</span>
                        <span className="text-sm">{new Date(date.date).toLocaleDateString()}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}


            {/* Recommendations */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Target className="h-5 w-5" />
                  <span>Recommendations</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {analysis.recommendations && analysis.recommendations.length > 0 ? (
                    analysis.recommendations.map((rec, index) => (
                      <div key={index} className="flex items-start space-x-3 p-3 border rounded-lg">
                        <Info className="h-4 w-4 mt-0.5 text-primary" />
                        <div className="flex-1">
                          <h4 className="font-medium text-sm">{rec.title}</h4>
                          <p className="text-sm text-muted-foreground mt-1">{rec.description}</p>
                          {rec.reasoning && (
                            <p className="text-xs text-muted-foreground mt-1 italic">{rec.reasoning}</p>
                          )}
                          <div className="flex items-center space-x-2 mt-2">
                            <Badge variant={rec.priority === 'critical' ? 'destructive' : 'secondary'} className="text-xs">
                              {rec.priority}
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              {rec.type.replace('_', ' ')}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-4 text-muted-foreground">
                      <p className="text-sm">No specific recommendations at this time.</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </ScrollArea>

        {/* Action Buttons */}
        <div className="flex justify-between pt-4 border-t">
          <div className="flex space-x-2">
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export Analysis
            </Button>
            <Button variant="outline" size="sm">
              <Share className="h-4 w-4 mr-2" />
              Share Results
            </Button>
          </div>
          <Button onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AIAnalysisModal;