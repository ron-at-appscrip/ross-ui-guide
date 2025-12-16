import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { RiskAssessment, RiskLevel } from '@/types/legal';
import { 
  AlertTriangle, 
  AlertCircle, 
  Info, 
  CheckCircle,
  Shield,
  Clock,
  User,
  ChevronDown,
  ChevronUp,
  Target,
  TrendingUp,
  Lightbulb
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface RiskAssessmentPanelProps {
  riskAssessment: RiskAssessment[];
  className?: string;
}

const getRiskIcon = (level: RiskLevel) => {
  switch (level) {
    case 'critical':
      return <AlertTriangle className="h-5 w-5" />;
    case 'high':
      return <AlertCircle className="h-5 w-5" />;
    case 'medium':
      return <Info className="h-5 w-5" />;
    case 'low':
      return <CheckCircle className="h-5 w-5" />;
    default:
      return <Info className="h-5 w-5" />;
  }
};

const getRiskColor = (level: RiskLevel) => {
  switch (level) {
    case 'critical':
      return {
        bg: 'bg-red-50',
        border: 'border-red-200',
        text: 'text-red-700',
        icon: 'text-red-600',
        progress: 'bg-red-500',
      };
    case 'high':
      return {
        bg: 'bg-orange-50',
        border: 'border-orange-200',
        text: 'text-orange-700',
        icon: 'text-orange-600',
        progress: 'bg-orange-500',
      };
    case 'medium':
      return {
        bg: 'bg-yellow-50',
        border: 'border-yellow-200',
        text: 'text-yellow-700',
        icon: 'text-yellow-600',
        progress: 'bg-yellow-500',
      };
    case 'low':
      return {
        bg: 'bg-green-50',
        border: 'border-green-200',
        text: 'text-green-700',
        icon: 'text-green-600',
        progress: 'bg-green-500',
      };
    default:
      return {
        bg: 'bg-gray-50',
        border: 'border-gray-200',
        text: 'text-gray-700',
        icon: 'text-gray-600',
        progress: 'bg-gray-500',
      };
  }
};

const getRiskScore = (level: RiskLevel) => {
  switch (level) {
    case 'critical': return 90;
    case 'high': return 70;
    case 'medium': return 50;
    case 'low': return 25;
    default: return 0;
  }
};

const formatDeadline = (deadline: string) => {
  const date = new Date(deadline);
  const now = new Date();
  const diffTime = date.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays < 0) return 'Overdue';
  if (diffDays === 0) return 'Due today';
  if (diffDays === 1) return 'Due tomorrow';
  if (diffDays <= 7) return `Due in ${diffDays} days`;
  return date.toLocaleDateString();
};

export const RiskAssessmentPanel: React.FC<RiskAssessmentPanelProps> = ({
  riskAssessment,
  className,
}) => {
  const [expandedRisks, setExpandedRisks] = useState<Set<string>>(new Set());

  const toggleExpanded = (riskId: string) => {
    setExpandedRisks(prev => {
      const newSet = new Set(prev);
      if (newSet.has(riskId)) {
        newSet.delete(riskId);
      } else {
        newSet.add(riskId);
      }
      return newSet;
    });
  };

  // Sort risks by priority (critical first)
  const sortedRisks = [...riskAssessment].sort((a, b) => {
    const scoreA = getRiskScore(a.level);
    const scoreB = getRiskScore(b.level);
    return scoreB - scoreA;
  });

  // Calculate overall risk score
  const overallRiskScore = riskAssessment.length > 0 
    ? riskAssessment.reduce((sum, risk) => sum + getRiskScore(risk.level), 0) / riskAssessment.length
    : 0;

  const getOverallRiskLevel = (score: number): RiskLevel => {
    if (score >= 80) return 'critical';
    if (score >= 60) return 'high';
    if (score >= 40) return 'medium';
    return 'low';
  };

  const overallLevel = getOverallRiskLevel(overallRiskScore);
  const overallColors = getRiskColor(overallLevel);

  if (riskAssessment.length === 0) return null;

  return (
    <Card className={cn('shadow-sm border-l-4', `border-l-${overallColors.progress.split('-')[1]}-500`, className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <Shield className="h-5 w-5 text-blue-600" />
            Risk Assessment
          </CardTitle>
          
          <div className="flex items-center gap-2">
            <Badge variant="outline" className={cn('border', overallColors.border, overallColors.bg, overallColors.text)}>
              {getRiskIcon(overallLevel)}
              <span className="ml-1 capitalize">{overallLevel} Risk</span>
            </Badge>
          </div>
        </div>
        
        {/* Overall Risk Score */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Overall Risk Score</span>
            <span className={cn('font-semibold', overallColors.text)}>
              {Math.round(overallRiskScore)}/100
            </span>
          </div>
          <Progress 
            value={overallRiskScore} 
            className="h-2"
          />
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {sortedRisks.map((risk) => {
          const isExpanded = expandedRisks.has(risk.id);
          const colors = getRiskColor(risk.level);
          const score = getRiskScore(risk.level);
          
          return (
            <div key={risk.id} className={cn('border rounded-lg', colors.border, colors.bg)}>
              {/* Risk Header */}
              <div className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <div className={cn('flex-shrink-0', colors.icon)}>
                      {getRiskIcon(risk.level)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className={cn('font-semibold leading-tight', colors.text)}>
                        {risk.title}
                      </h4>
                      <p className="text-sm text-gray-600 mt-1">
                        {risk.category}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <Badge variant="outline" className={cn('border text-xs', colors.border, colors.text)}>
                      Priority {risk.priority}
                    </Badge>
                    
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => toggleExpanded(risk.id)}
                      className="h-8 w-8 p-0"
                    >
                      {isExpanded ? (
                        <ChevronUp className="h-4 w-4" />
                      ) : (
                        <ChevronDown className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>

                {/* Risk Description */}
                <p className="text-sm text-gray-700 mb-3 leading-relaxed">
                  {risk.description}
                </p>

                {/* Risk Metrics */}
                <div className="grid grid-cols-2 gap-4 mb-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-1 text-xs text-gray-600">
                      <Target className="h-3 w-3" />
                      Impact
                    </div>
                    <p className="text-sm font-medium">{risk.impact}</p>
                  </div>
                  
                  <div className="space-y-1">
                    <div className="flex items-center gap-1 text-xs text-gray-600">
                      <TrendingUp className="h-3 w-3" />
                      Likelihood
                    </div>
                    <p className="text-sm font-medium">{risk.likelihood}</p>
                  </div>
                </div>

                {/* Deadline and Assignment */}
                <div className="flex items-center gap-4 text-xs text-gray-600">
                  {risk.deadline && (
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {formatDeadline(risk.deadline)}
                    </div>
                  )}
                  
                  {risk.assignedTo && (
                    <div className="flex items-center gap-1">
                      <User className="h-3 w-3" />
                      {risk.assignedTo}
                    </div>
                  )}
                </div>
              </div>

              {/* Expanded Content */}
              {isExpanded && (
                <div className="border-t bg-white/50 p-4 space-y-4">
                  {/* Mitigation Strategies */}
                  <div>
                    <div className="flex items-center gap-1 mb-2">
                      <Lightbulb className="h-4 w-4 text-blue-600" />
                      <h5 className="font-medium text-gray-900">Mitigation Strategies</h5>
                    </div>
                    <ul className="space-y-1">
                      {risk.mitigation.map((strategy, index) => (
                        <li key={index} className="text-sm text-gray-700 flex items-start gap-2">
                          <span className="text-blue-600 font-bold">•</span>
                          {strategy}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Related Citations */}
                  {risk.relatedCitations && risk.relatedCitations.length > 0 && (
                    <div>
                      <h5 className="font-medium text-gray-900 mb-2">Related Legal Authority</h5>
                      <div className="space-y-1">
                        {risk.relatedCitations.map((citation, index) => (
                          <div key={index} className="text-sm">
                            <span className="font-medium">{citation.title}</span>
                            <p className="text-gray-600 font-mono text-xs">{citation.citation}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}

        {/* Summary Statistics */}
        <div className="border-t pt-4 mt-4">
          <div className="grid grid-cols-4 gap-4 text-center">
            {(['critical', 'high', 'medium', 'low'] as RiskLevel[]).map(level => {
              const count = riskAssessment.filter(r => r.level === level).length;
              const colors = getRiskColor(level);
              
              return (
                <div key={level} className="space-y-1">
                  <div className={cn('font-semibold text-lg', colors.text)}>
                    {count}
                  </div>
                  <div className="text-xs text-gray-600 capitalize">
                    {level}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};