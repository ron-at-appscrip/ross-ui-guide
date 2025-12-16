import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Brain, AlertTriangle, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { Document } from '@/types/document';
import { cn } from '@/lib/utils';

interface AIAnalysisBadgeProps {
  document: Document;
  size?: 'sm' | 'md' | 'lg';
  showDetails?: boolean;
  onAnalyze?: () => void;
  isAnalyzing?: boolean;
  onShowAnalysis?: () => void;
  className?: string;
}

const AIAnalysisBadge: React.FC<AIAnalysisBadgeProps> = ({
  document,
  size = 'sm',
  showDetails = true,
  onAnalyze,
  isAnalyzing = false,
  onShowAnalysis,
  className
}) => {
  const aiAnalysis = document.aiAnalysis;
  
  // Determine risk level and colors
  const getRiskLevel = (score: number) => {
    if (score <= 30) return { 
      level: 'low', 
      color: 'text-green-600 bg-green-50 border-green-200', 
      icon: CheckCircle,
      description: 'Low Risk - This document appears to be well-structured with minimal legal concerns. Standard terms and conditions are present.',
      recommendation: 'Document is safe to proceed with minimal review required.'
    };
    if (score <= 70) return { 
      level: 'medium', 
      color: 'text-yellow-600 bg-yellow-50 border-yellow-200', 
      icon: AlertCircle,
      description: 'Medium Risk - This document has some potential issues that should be reviewed. Missing clauses or unfavorable terms detected.',
      recommendation: 'Legal review recommended before signing. Address highlighted concerns.'
    };
    return { 
      level: 'high', 
      color: 'text-red-600 bg-red-50 border-red-200', 
      icon: AlertTriangle,
      description: 'High Risk - This document contains significant legal concerns, unfavorable terms, or missing critical protections.',
      recommendation: 'Immediate legal review required. Do not proceed without attorney consultation.'
    };
  };

  // Size configurations
  const sizeConfig = {
    sm: { badge: 'text-xs px-2 py-0.5', icon: 'h-3 w-3', button: 'h-6 text-xs' },
    md: { badge: 'text-sm px-2.5 py-1', icon: 'h-4 w-4', button: 'h-8 text-sm' },
    lg: { badge: 'text-base px-3 py-1.5', icon: 'h-5 w-5', button: 'h-10 text-base' }
  };

  const config = sizeConfig[size];

  // If document is being analyzed
  if (isAnalyzing) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge 
            variant="secondary" 
            className={cn('flex items-center space-x-1', config.badge, className)}
          >
            <Loader2 className={cn('animate-spin', config.icon)} />
            <span>Analyzing...</span>
          </Badge>
        </TooltipTrigger>
        <TooltipContent>
          <div className="max-w-xs">
            <p className="font-medium">AI Analysis in Progress</p>
            <p className="text-sm mt-1">
              Our AI is analyzing this document for legal risks, missing clauses, 
              compliance issues, and key terms. This typically takes 2-3 seconds.
            </p>
          </div>
        </TooltipContent>
      </Tooltip>
    );
  }

  // If document has been analyzed
  if (aiAnalysis) {
    const risk = getRiskLevel(aiAnalysis.riskScore);
    const RiskIcon = risk.icon;

    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <div 
            onClick={onShowAnalysis}
            className={cn(
              'cursor-pointer hover:shadow-sm transition-shadow',
              className
            )}
          >
            <Badge 
              variant="outline" 
              className={cn(
                'flex items-center space-x-1',
                config.badge,
                risk.color
              )}
            >
            <Brain className={config.icon} />
            <span>AI</span>
            {showDetails && (
              <>
                <span className="mx-1">•</span>
                <span>Risk: {aiAnalysis.riskScore}</span>
                <RiskIcon className={config.icon} />
              </>
            )}
          </Badge>
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <div className="max-w-sm">
            <p className="font-medium">AI Risk Analysis: {aiAnalysis.riskScore}/100</p>
            <p className="text-sm mt-1 mb-2">{risk.description}</p>
            <div className="border-t pt-2">
              <p className="text-xs font-medium">Analysis Summary:</p>
              <p className="text-xs mt-1">{aiAnalysis.summary}</p>
            </div>
            <div className="border-t pt-2 mt-2">
              <p className="text-xs font-medium">Recommendation:</p>
              <p className="text-xs mt-1">{risk.recommendation}</p>
            </div>
            {aiAnalysis.findings.length > 0 && (
              <div className="border-t pt-2 mt-2">
                <p className="text-xs font-medium">{aiAnalysis.findings.length} Finding(s) Detected</p>
                <p className="text-xs mt-1">Click document to view detailed analysis</p>
              </div>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    );
  }

  // If document has not been analyzed and we have an analyze callback
  if (onAnalyze) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            onClick={onAnalyze}
            className={cn(
              'flex items-center space-x-1',
              config.button,
              'hover:bg-primary/10',
              className
            )}
          >
            <Brain className={config.icon} />
            <span>Analyze</span>
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <div className="max-w-xs">
            <p className="font-medium">AI Document Analysis</p>
            <p className="text-sm mt-1">
              Click to analyze this document with AI. Our system will:
            </p>
            <ul className="text-xs mt-2 space-y-1">
              <li>• Scan for legal risks and unfavorable terms</li>
              <li>• Identify missing clauses and protections</li>
              <li>• Check compliance with regulations</li>
              <li>• Extract key dates and obligations</li>
              <li>• Generate risk score and recommendations</li>
            </ul>
            <p className="text-xs mt-2 font-medium">
              Analysis takes 2-3 seconds and provides actionable insights.
            </p>
          </div>
        </TooltipContent>
      </Tooltip>
    );
  }

  // No analysis and no callback - just show a subtle indicator
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Badge 
          variant="outline" 
          className={cn(
            'flex items-center space-x-1 text-muted-foreground border-muted cursor-help',
            config.badge,
            className
          )}
        >
          <Brain className={config.icon} />
          <span>No AI Analysis</span>
        </Badge>
      </TooltipTrigger>
      <TooltipContent>
        <div className="max-w-xs">
          <p className="font-medium">AI Analysis Not Available</p>
          <p className="text-sm mt-1">
            This document has not been analyzed by our AI system yet. 
            AI analysis can identify legal risks, missing clauses, and compliance issues.
          </p>
          <p className="text-xs mt-2">
            Contact your administrator to enable AI analysis for this document.
          </p>
        </div>
      </TooltipContent>
    </Tooltip>
  );
};

export default AIAnalysisBadge;