import React from 'react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { LeadStatus, IntakeStage } from '@/types/client';

interface LeadStatusBadgeProps {
  status: LeadStatus;
  className?: string;
  variant?: 'default' | 'outline';
}

interface IntakeStageBadgeProps {
  stage: IntakeStage;
  className?: string;
  variant?: 'default' | 'outline';
}

/**
 * LeadStatusBadge - Displays lead status with appropriate colors
 */
export const LeadStatusBadge: React.FC<LeadStatusBadgeProps> = ({ 
  status, 
  className, 
  variant = 'default' 
}) => {
  const getStatusConfig = (status: LeadStatus) => {
    switch (status) {
      case 'prospect':
        return {
          label: 'Prospect',
          className: 'bg-blue-100 text-blue-800 border-blue-200',
          dotColor: 'bg-blue-500'
        };
      case 'qualified':
        return {
          label: 'Qualified',
          className: 'bg-yellow-100 text-yellow-800 border-yellow-200',
          dotColor: 'bg-yellow-500'
        };
      case 'consultation':
        return {
          label: 'Consultation',
          className: 'bg-purple-100 text-purple-800 border-purple-200',
          dotColor: 'bg-purple-500'
        };
      case 'proposal':
        return {
          label: 'Proposal',
          className: 'bg-orange-100 text-orange-800 border-orange-200',
          dotColor: 'bg-orange-500'
        };
      case 'converted':
        return {
          label: 'Converted',
          className: 'bg-green-100 text-green-800 border-green-200',
          dotColor: 'bg-green-500'
        };
      case 'lost':
        return {
          label: 'Lost',
          className: 'bg-red-100 text-red-800 border-red-200',
          dotColor: 'bg-red-500'
        };
      default:
        return {
          label: 'Unknown',
          className: 'bg-gray-100 text-gray-800 border-gray-200',
          dotColor: 'bg-gray-500'
        };
    }
  };

  const config = getStatusConfig(status);

  return (
    <Badge
      variant={variant}
      className={cn(
        'flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium',
        variant === 'default' ? config.className : 'border-current',
        className
      )}
    >
      <div className={cn('w-2 h-2 rounded-full', config.dotColor)} />
      {config.label}
    </Badge>
  );
};

/**
 * IntakeStageBadge - Displays intake stage with appropriate colors
 */
export const IntakeStageBadge: React.FC<IntakeStageBadgeProps> = ({ 
  stage, 
  className, 
  variant = 'default' 
}) => {
  const getStageConfig = (stage: IntakeStage) => {
    switch (stage) {
      case 'initial':
        return {
          label: 'Initial Contact',
          className: 'bg-slate-100 text-slate-800 border-slate-200',
          dotColor: 'bg-slate-500'
        };
      case 'qualification':
        return {
          label: 'Qualification',
          className: 'bg-blue-100 text-blue-800 border-blue-200',
          dotColor: 'bg-blue-500'
        };
      case 'conflict_check':
        return {
          label: 'Conflict Check',
          className: 'bg-yellow-100 text-yellow-800 border-yellow-200',
          dotColor: 'bg-yellow-500'
        };
      case 'consultation':
        return {
          label: 'Consultation',
          className: 'bg-purple-100 text-purple-800 border-purple-200',
          dotColor: 'bg-purple-500'
        };
      case 'proposal':
        return {
          label: 'Proposal',
          className: 'bg-orange-100 text-orange-800 border-orange-200',
          dotColor: 'bg-orange-500'
        };
      case 'onboarding':
        return {
          label: 'Onboarding',
          className: 'bg-indigo-100 text-indigo-800 border-indigo-200',
          dotColor: 'bg-indigo-500'
        };
      case 'completed':
        return {
          label: 'Completed',
          className: 'bg-green-100 text-green-800 border-green-200',
          dotColor: 'bg-green-500'
        };
      default:
        return {
          label: 'Unknown',
          className: 'bg-gray-100 text-gray-800 border-gray-200',
          dotColor: 'bg-gray-500'
        };
    }
  };

  const config = getStageConfig(stage);

  return (
    <Badge
      variant={variant}
      className={cn(
        'flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium',
        variant === 'default' ? config.className : 'border-current',
        className
      )}
    >
      <div className={cn('w-2 h-2 rounded-full', config.dotColor)} />
      {config.label}
    </Badge>
  );
};

/**
 * LeadScoreBadge - Displays lead score with color-coded styling
 */
interface LeadScoreBadgeProps {
  score: number;
  className?: string;
  showLabel?: boolean;
}

export const LeadScoreBadge: React.FC<LeadScoreBadgeProps> = ({ 
  score, 
  className, 
  showLabel = true 
}) => {
  const getScoreConfig = (score: number) => {
    if (score >= 80) {
      return {
        label: 'Hot',
        className: 'bg-red-100 text-red-800 border-red-200',
        dotColor: 'bg-red-500'
      };
    } else if (score >= 60) {
      return {
        label: 'Warm',
        className: 'bg-orange-100 text-orange-800 border-orange-200',
        dotColor: 'bg-orange-500'
      };
    } else if (score >= 40) {
      return {
        label: 'Cool',
        className: 'bg-blue-100 text-blue-800 border-blue-200',
        dotColor: 'bg-blue-500'
      };
    } else {
      return {
        label: 'Cold',
        className: 'bg-gray-100 text-gray-800 border-gray-200',
        dotColor: 'bg-gray-500'
      };
    }
  };

  const config = getScoreConfig(score);

  return (
    <Badge
      variant="default"
      className={cn(
        'flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium',
        config.className,
        className
      )}
    >
      <div className={cn('w-2 h-2 rounded-full', config.dotColor)} />
      {score}
      {showLabel && (
        <span className="ml-1 text-xs opacity-75">
          ({config.label})
        </span>
      )}
    </Badge>
  );
};

/**
 * LeadSourceBadge - Displays lead source with category-based styling
 */
interface LeadSourceBadgeProps {
  source: string;
  category?: string;
  className?: string;
}

export const LeadSourceBadge: React.FC<LeadSourceBadgeProps> = ({ 
  source, 
  category, 
  className 
}) => {
  const getCategoryConfig = (category?: string) => {
    switch (category) {
      case 'referral':
        return {
          className: 'bg-emerald-100 text-emerald-800 border-emerald-200',
          dotColor: 'bg-emerald-500'
        };
      case 'organic':
        return {
          className: 'bg-green-100 text-green-800 border-green-200',
          dotColor: 'bg-green-500'
        };
      case 'advertising':
        return {
          className: 'bg-purple-100 text-purple-800 border-purple-200',
          dotColor: 'bg-purple-500'
        };
      case 'marketing':
        return {
          className: 'bg-pink-100 text-pink-800 border-pink-200',
          dotColor: 'bg-pink-500'
        };
      case 'social_media':
        return {
          className: 'bg-sky-100 text-sky-800 border-sky-200',
          dotColor: 'bg-sky-500'
        };
      case 'networking':
        return {
          className: 'bg-amber-100 text-amber-800 border-amber-200',
          dotColor: 'bg-amber-500'
        };
      default:
        return {
          className: 'bg-gray-100 text-gray-800 border-gray-200',
          dotColor: 'bg-gray-500'
        };
    }
  };

  const config = getCategoryConfig(category);

  return (
    <Badge
      variant="default"
      className={cn(
        'flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium',
        config.className,
        className
      )}
    >
      <div className={cn('w-2 h-2 rounded-full', config.dotColor)} />
      {source}
    </Badge>
  );
};

/**
 * Combined LeadInfoBadges - Shows multiple lead indicators in a compact layout
 */
interface LeadInfoBadgesProps {
  status: LeadStatus;
  stage: IntakeStage;
  score?: number;
  source?: string;
  sourceCategory?: string;
  className?: string;
  compact?: boolean;
}

export const LeadInfoBadges: React.FC<LeadInfoBadgesProps> = ({
  status,
  stage,
  score,
  source,
  sourceCategory,
  className,
  compact = false
}) => {
  return (
    <div className={cn('flex items-center gap-1.5 flex-wrap', className)}>
      <LeadStatusBadge status={status} variant={compact ? 'outline' : 'default'} />
      <IntakeStageBadge stage={stage} variant={compact ? 'outline' : 'default'} />
      {score !== undefined && (
        <LeadScoreBadge score={score} showLabel={!compact} />
      )}
      {source && (
        <LeadSourceBadge 
          source={source} 
          category={sourceCategory}
        />
      )}
    </div>
  );
};

export default LeadStatusBadge;