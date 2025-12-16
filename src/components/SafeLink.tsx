import React from 'react';
import { Link, LinkProps } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';

interface SafeLinkProps extends LinkProps {
  fallbackMessage?: string;
}

const SafeLink = React.forwardRef<HTMLAnchorElement, SafeLinkProps>(({ 
  to, 
  children, 
  fallbackMessage = "This feature is not yet available", 
  ...props 
}, ref) => {
  const { toast } = useToast();

  const handleClick = (e: React.MouseEvent) => {
    // List of unimplemented routes that should show a toast instead of navigating
    const unimplementedRoutes = [
      '/dashboard/analytics/activity',
      '/dashboard/analytics/traffic', 
      '/dashboard/analytics/statistics'
    ];

    if (unimplementedRoutes.includes(to as string)) {
      e.preventDefault();
      toast({
        title: "Coming Soon",
        description: fallbackMessage,
        variant: "default",
      });
      return;
    }

    // Allow normal navigation for other routes
    if (props.onClick) {
      props.onClick(e);
    }
  };

  return (
    <Link ref={ref} to={to} {...props} onClick={handleClick}>
      {children}
    </Link>
  );
});

SafeLink.displayName = 'SafeLink';

export default SafeLink;