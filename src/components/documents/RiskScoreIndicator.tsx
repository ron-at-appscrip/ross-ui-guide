import React from 'react';
import { AlertTriangle, CheckCircle, AlertCircle, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';

interface RiskScoreIndicatorProps {
  score: number;
  size?: 'compact' | 'detailed';
  showLabel?: boolean;
  className?: string;
}

const RiskScoreIndicator: React.FC<RiskScoreIndicatorProps> = ({
  score,
  size = 'compact',
  showLabel = true,
  className
}) => {
  // Ensure score is between 0 and 100
  const normalizedScore = Math.max(0, Math.min(100, score));
  
  // Determine risk level
  const getRiskInfo = (score: number) => {
    if (score <= 30) {
      return {
        level: 'Low Risk',
        color: 'text-green-600',
        bgColor: 'bg-green-500',
        icon: CheckCircle,
        description: 'This document appears to be low risk'
      };
    }
    if (score <= 70) {
      return {
        level: 'Medium Risk',
        color: 'text-yellow-600',
        bgColor: 'bg-yellow-500',
        icon: AlertCircle,
        description: 'This document has some potential issues to review'
      };
    }
    return {
      level: 'High Risk',
      color: 'text-red-600',
      bgColor: 'bg-red-500',
      icon: AlertTriangle,
      description: 'This document requires immediate attention'
    };
  };

  const riskInfo = getRiskInfo(normalizedScore);
  const RiskIcon = riskInfo.icon;

  if (size === 'compact') {
    return (
      <div className={cn('flex items-center space-x-2', className)}>
        <RiskIcon className={cn('h-4 w-4', riskInfo.color)} />
        {showLabel && (
          <span className={cn('text-sm font-medium', riskInfo.color)}>
            {normalizedScore}
          </span>
        )}
      </div>
    );
  }

  // Detailed view
  return (
    <div className={cn('space-y-3', className)}>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <RiskIcon className={cn('h-5 w-5', riskInfo.color)} />
          <div>
            <p className={cn('text-sm font-medium', riskInfo.color)}>
              {riskInfo.level}
            </p>
            <p className="text-xs text-muted-foreground">
              Risk Score: {normalizedScore}/100
            </p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold">{normalizedScore}</p>
        </div>
      </div>
      
      <div className="relative h-2 w-full overflow-hidden rounded-full bg-secondary">
        <div 
          className={cn("h-full transition-all", riskInfo.bgColor)}
          style={{ width: `${normalizedScore}%` }}
        />
      </div>
      
      {showLabel && (
        <p className="text-sm text-muted-foreground">
          {riskInfo.description}
        </p>
      )}

      {size === 'detailed' && normalizedScore > 50 && (
        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
          <TrendingUp className="h-4 w-4" />
          <span>Review recommended</span>
        </div>
      )}
    </div>
  );
};

export default RiskScoreIndicator;