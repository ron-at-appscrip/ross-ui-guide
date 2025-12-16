
import React from 'react';
import { Check, Circle, Lock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Progress } from '@/components/ui/progress';

interface WizardStep {
  id: string;
  title: string;
  isOptional?: boolean;
}

interface WizardProgressIndicatorProps {
  steps: WizardStep[];
  currentStepIndex: number;
  completedSteps: Set<number>;
}

const WizardProgressIndicator: React.FC<WizardProgressIndicatorProps> = ({
  steps,
  currentStepIndex,
  completedSteps,
}) => {
  const totalSteps = steps.length;
  const completedCount = completedSteps.size;
  const progressPercentage = totalSteps > 0 ? (completedCount / totalSteps) * 100 : 0;

  const getStepStatus = (index: number) => {
    if (completedSteps.has(index)) return 'completed';
    if (index === currentStepIndex) return 'current';
    if (index < currentStepIndex) return 'available';
    return 'locked';
  };

  const getStepIcon = (index: number, status: string) => {
    switch (status) {
      case 'completed':
        return <Check className="w-4 h-4 text-white" />;
      case 'current':
        return <Circle className="w-4 h-4 text-primary fill-primary" />;
      case 'available':
        return <span className="text-sm font-medium text-muted-foreground">{index + 1}</span>;
      case 'locked':
        return <Lock className="w-4 h-4 text-muted-foreground" />;
      default:
        return <span className="text-sm font-medium">{index + 1}</span>;
    }
  };

  const getStepCircleStyles = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-primary border-primary';
      case 'current':
        return 'bg-primary/10 border-primary';
      case 'available':
        return 'bg-background border-muted-foreground';
      case 'locked':
        return 'bg-muted border-muted-foreground';
      default:
        return 'bg-background border-muted-foreground';
    }
  };

  const getConnectorStyles = (index: number) => {
    const isCompleted = completedSteps.has(index);
    return cn(
      "flex-1 h-0.5 transition-all duration-300",
      isCompleted ? "bg-primary" : "bg-muted"
    );
  };

  return (
    <div className="w-full space-y-4 sm:space-y-6">
      {/* Overall Progress Bar */}
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <span className="text-sm sm:text-base font-medium">Setup Progress</span>
          <span className="text-xs sm:text-sm text-muted-foreground">
            {completedCount} of {totalSteps} completed
          </span>
        </div>
        <Progress value={progressPercentage} className="h-2 sm:h-3" />
      </div>

      {/* Step Indicators - Mobile: Horizontal scroll, Desktop: Fit to width */}
      <div className="relative">
        <div className="flex items-center gap-2 overflow-x-auto pb-2 sm:pb-0 sm:justify-between sm:overflow-visible">
          {steps.map((step, index) => {
            const status = getStepStatus(index);
            
            return (
              <React.Fragment key={step.id}>
                <div className="flex flex-col items-center space-y-1 sm:space-y-2 min-w-0 flex-shrink-0">
                  {/* Step Circle - Larger touch targets */}
                  <div
                    className={cn(
                      "w-10 h-10 sm:w-12 sm:h-12 rounded-full border-2 flex items-center justify-center transition-all duration-300",
                      getStepCircleStyles(status)
                    )}
                  >
                    {getStepIcon(index, status)}
                  </div>
                  
                  {/* Step Title - Better mobile sizing */}
                  <div className="text-center min-w-12 sm:min-w-16 max-w-16 sm:max-w-20">
                    <p
                      className={cn(
                        "text-xs sm:text-sm font-medium leading-tight",
                        status === 'current' || status === 'completed' 
                          ? "text-primary" 
                          : "text-muted-foreground"
                      )}
                    >
                      {step.title}
                    </p>
                    {step.isOptional && (
                      <p className="text-xs text-muted-foreground hidden sm:block">Optional</p>
                    )}
                  </div>
                </div>
                
                {/* Connector Line - Hidden on mobile scroll view */}
                {index < steps.length - 1 && (
                  <div className={cn(
                    "hidden sm:block sm:flex-1 h-0.5 transition-all duration-300",
                    getConnectorStyles(index)
                  )} />
                )}
              </React.Fragment>
            );
          })}
        </div>
        
        {/* Mobile scroll indicators */}
        <div className="sm:hidden flex justify-center mt-2 space-x-1">
          {steps.map((_, index) => (
            <div
              key={index}
              className={cn(
                "w-1.5 h-1.5 rounded-full transition-all duration-300",
                index === currentStepIndex ? "bg-primary" : "bg-muted"
              )}
            />
          ))}
        </div>
      </div>

      {/* Current Step Info - More touch-friendly */}
      <div className="text-center p-3 sm:p-4 bg-muted/50 rounded-lg">
        <p className="text-sm sm:text-base font-medium">
          Step {currentStepIndex + 1} of {totalSteps}: {steps[currentStepIndex]?.title}
        </p>
        {steps[currentStepIndex]?.isOptional && (
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">This step is optional</p>
        )}
      </div>
    </div>
  );
};

export default WizardProgressIndicator;
