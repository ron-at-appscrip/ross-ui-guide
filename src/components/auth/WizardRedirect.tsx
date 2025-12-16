import React from 'react';

interface WizardRedirectProps {
  children: React.ReactNode;
}

const WizardRedirect: React.FC<WizardRedirectProps> = ({ children }) => {
  // No wizard redirects - always render children
  return <>{children}</>;
};

export default WizardRedirect;