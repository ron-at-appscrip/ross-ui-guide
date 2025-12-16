import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Clock, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import type { TrademarkResult } from '@/types/uspto';

interface RenewalStatusBadgeProps {
  trademark: TrademarkResult;
  showDays?: boolean;
  size?: 'sm' | 'default' | 'lg';
}

const RenewalStatusBadge: React.FC<RenewalStatusBadgeProps> = ({
  trademark,
  showDays = true,
  size = 'default'
}) => {
  // If no renewal information available, show basic status
  if (!trademark.deadlines?.nextMajorDeadline) {
    return (
      <Badge variant="outline" className="text-gray-600">
        <CheckCircle className="h-3 w-3 mr-1" />
        Current
      </Badge>
    );
  }

  const { nextMajorDeadline } = trademark.deadlines;
  const { daysRemaining, urgencyLevel } = nextMajorDeadline;

  // Determine badge variant and styling based on urgency
  const getBadgeProps = () => {
    switch (urgencyLevel) {
      case 'critical':
        return {
          variant: 'destructive' as const,
          className: 'bg-red-100 text-red-800 border-red-200 hover:bg-red-200',
          icon: <AlertTriangle className="h-3 w-3 mr-1" />,
          label: daysRemaining < 0 ? 'Overdue' : 'Critical'
        };
      case 'high':
        return {
          variant: 'secondary' as const,
          className: 'bg-orange-100 text-orange-800 border-orange-200 hover:bg-orange-200',
          icon: <Clock className="h-3 w-3 mr-1" />,
          label: 'Due Soon'
        };
      case 'medium':
        return {
          variant: 'secondary' as const,
          className: 'bg-yellow-100 text-yellow-800 border-yellow-200 hover:bg-yellow-200',
          icon: <Clock className="h-3 w-3 mr-1" />,
          label: 'Upcoming'
        };
      case 'low':
      default:
        return {
          variant: 'outline' as const,
          className: 'bg-green-100 text-green-800 border-green-200 hover:bg-green-200',
          icon: <CheckCircle className="h-3 w-3 mr-1" />,
          label: 'Current'
        };
    }
  };

  const badgeProps = getBadgeProps();

  // Format days text
  const formatDaysText = () => {
    if (!showDays) return '';
    
    if (daysRemaining < 0) {
      return ` (${Math.abs(daysRemaining)} days overdue)`;
    } else if (daysRemaining === 0) {
      return ' (Due today!)';
    } else if (daysRemaining === 1) {
      return ' (1 day)';
    } else if (daysRemaining <= 30) {
      return ` (${daysRemaining} days)`;
    } else if (daysRemaining <= 365) {
      const months = Math.floor(daysRemaining / 30);
      return ` (${months} months)`;
    } else {
      const years = Math.floor(daysRemaining / 365);
      const remainingMonths = Math.floor((daysRemaining % 365) / 30);
      if (remainingMonths > 0) {
        return ` (${years}y ${remainingMonths}m)`;
      }
      return ` (${years} years)`;
    }
  };

  const sizeClass = size === 'sm' ? 'text-xs px-2 py-1' : size === 'lg' ? 'text-sm px-3 py-2' : '';

  return (
    <Badge 
      variant={badgeProps.variant}
      className={`${badgeProps.className} ${sizeClass} flex items-center gap-1 whitespace-nowrap`}
      title={`Next deadline: ${new Date(nextMajorDeadline.date).toLocaleDateString()} (${Math.abs(daysRemaining)} days ${daysRemaining < 0 ? 'overdue' : 'remaining'})`}
    >
      {badgeProps.icon}
      <span>{badgeProps.label}{formatDaysText()}</span>
    </Badge>
  );
};

export default RenewalStatusBadge;