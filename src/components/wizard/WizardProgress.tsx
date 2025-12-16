
import React from 'react';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface WizardProgressProps {
  steps: Array<{ id: string; title: string; isOptional?: boolean }>;
  currentStep: number;
  completedSteps: Set<number>;
}

const WizardProgress: React.FC<WizardProgressProps> = ({
  steps,
  currentStep,
  completedSteps,
}) => {
  return (
    <div className="w-full py-4">
      <div className="flex items-center justify-between">
        {steps.map((step, index) => (
          <div key={step.id} className="flex items-center">
            <div className="flex flex-col items-center">
              <div
                className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300",
                  {
                    "bg-primary border-primary text-primary-foreground": completedSteps.has(index) || currentStep === index,
                    "border-muted-foreground text-muted-foreground": currentStep < index && !completedSteps.has(index),
                  }
                )}
              >
                {completedSteps.has(index) ? (
                  <Check className="w-5 h-5" />
                ) : (
                  <span className="text-sm font-medium">{index + 1}</span>
                )}
              </div>
              <div className="mt-2 text-center">
                <p
                  className={cn(
                    "text-xs font-medium",
                    {
                      "text-primary": currentStep === index || completedSteps.has(index),
                      "text-muted-foreground": currentStep !== index && !completedSteps.has(index),
                    }
                  )}
                >
                  {step.title}
                </p>
                {step.isOptional && (
                  <p className="text-xs text-muted-foreground">Optional</p>
                )}
              </div>
            </div>
            {index < steps.length - 1 && (
              <div
                className={cn(
                  "flex-1 h-0.5 mx-4 transition-all duration-300",
                  {
                    "bg-primary": completedSteps.has(index),
                    "bg-muted": !completedSteps.has(index),
                  }
                )}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default WizardProgress;
