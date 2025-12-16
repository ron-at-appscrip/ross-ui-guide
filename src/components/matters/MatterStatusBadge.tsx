
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { MatterStatus } from '@/types/matter';

interface MatterStatusBadgeProps {
  status: MatterStatus;
  className?: string;
}

const MatterStatusBadge = ({ status, className }: MatterStatusBadgeProps) => {
  const getStatusConfig = (status: MatterStatus) => {
    const configs = {
      active: {
        variant: 'default' as const,
        label: 'Active'
      },
      closed: {
        variant: 'secondary' as const,
        label: 'Closed'
      },
      pending: {
        variant: 'outline' as const,
        label: 'Pending'
      },
      on_hold: {
        variant: 'destructive' as const,
        label: 'On Hold'
      }
    };
    
    return configs[status];
  };

  const config = getStatusConfig(status);

  return (
    <Badge variant={config.variant} className={className}>
      {config.label}
    </Badge>
  );
};

export default MatterStatusBadge;
