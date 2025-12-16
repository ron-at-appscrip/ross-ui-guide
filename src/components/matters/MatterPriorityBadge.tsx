
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { MatterPriority } from '@/types/matter';

interface MatterPriorityBadgeProps {
  priority: MatterPriority;
  className?: string;
}

const MatterPriorityBadge = ({ priority, className }: MatterPriorityBadgeProps) => {
  const getPriorityConfig = (priority: MatterPriority) => {
    const configs = {
      low: {
        className: 'bg-green-100 text-green-800 hover:bg-green-200',
        label: 'Low'
      },
      medium: {
        className: 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200',
        label: 'Medium'
      },
      high: {
        className: 'bg-orange-100 text-orange-800 hover:bg-orange-200',
        label: 'High'
      },
      urgent: {
        className: 'bg-red-100 text-red-800 hover:bg-red-200',
        label: 'Urgent'
      }
    };
    
    return configs[priority];
  };

  const config = getPriorityConfig(priority);

  return (
    <Badge 
      className={`${config.className} ${className}`}
      variant="outline"
    >
      {config.label}
    </Badge>
  );
};

export default MatterPriorityBadge;
