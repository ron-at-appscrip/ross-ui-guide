
import React from 'react';

interface WizardFooterProps {
  currentStep: number;
  totalSteps: number;
}

const WizardFooter: React.FC<WizardFooterProps> = ({ currentStep, totalSteps }) => {
  return (
    <div className="mt-8 pt-6 border-t">
      <div className="flex justify-between items-center text-sm text-muted-foreground">
        <span>Step {currentStep + 1} of {totalSteps}</span>
        <span>Your progress is automatically saved</span>
      </div>
    </div>
  );
};

export default WizardFooter;
