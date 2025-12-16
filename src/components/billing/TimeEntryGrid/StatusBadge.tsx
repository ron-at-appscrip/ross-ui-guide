import React, { useMemo } from 'react';
import { Badge } from '@/components/ui/badge';
import { StatusVariant } from './types';

interface StatusBadgeProps {
  status: string;
}

const STATUS_VARIANTS: Record<StatusVariant, 'secondary' | 'default' | 'success'> = {
  draft: 'secondary',
  submitted: 'default',
  billed: 'success',
  paid: 'success'
};

export const StatusBadge = React.memo<StatusBadgeProps>(({ status }) => {
  const variant = useMemo(
    () => STATUS_VARIANTS[status as StatusVariant] || 'secondary',
    [status]
  );

  return (
    <Badge variant={variant}>
      {status}
    </Badge>
  );
});

StatusBadge.displayName = 'StatusBadge';