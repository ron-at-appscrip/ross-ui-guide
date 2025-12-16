import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/WorkingAuthContext';

interface WizardRedirectProps {
  children: React.ReactNode;
}

const WizardRedirect: React.FC<WizardRedirectProps> = ({ children }) => {
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Don't redirect if still loading or no user
    if (isLoading || !user) return;

    // Don't redirect if already on wizard page or auth pages
    const wizardPaths = ['/signup-wizard', '/login', '/signup', '/forgot-password', '/reset-password'];
    if (wizardPaths.some(path => location.pathname.startsWith(path))) return;

    // If user hasn't completed wizard, redirect to wizard
    if (user.hasCompletedWizard === false) {
      console.log('User has not completed wizard, redirecting to wizard');
      navigate('/signup-wizard', { replace: true });
    }
  }, [user, isLoading, navigate, location.pathname]);

  // If loading or redirecting, show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // If user needs wizard, don't render children (will redirect)
  if (user && user.hasCompletedWizard === false && 
      !location.pathname.startsWith('/signup-wizard')) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-muted-foreground">Redirecting to setup...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default WizardRedirect;