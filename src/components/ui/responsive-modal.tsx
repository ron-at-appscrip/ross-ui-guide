import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';

export type ModalSize = 'sm' | 'md' | 'lg' | 'xl' | 'full';

interface ResponsiveModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  size?: ModalSize;
  children: React.ReactNode;
  showCloseButton?: boolean;
  className?: string;
}

const ResponsiveModal = ({
  isOpen,
  onClose,
  title,
  description,
  size = 'md',
  children,
  showCloseButton = true,
  className = ''
}: ResponsiveModalProps) => {
  const getSizeClasses = (size: ModalSize) => {
    const sizeClasses = {
      sm: 'max-w-sm',
      md: 'max-w-md',
      lg: 'max-w-2xl',
      xl: 'max-w-4xl',
      full: 'max-w-[95vw] max-h-[95vh]'
    };
    return sizeClasses[size];
  };

  const getResponsiveClasses = (size: ModalSize) => {
    const responsiveClasses = {
      sm: 'w-full max-w-sm mx-4',
      md: 'w-full max-w-md mx-4',
      lg: 'w-full max-w-2xl mx-4 lg:max-w-2xl',
      xl: 'w-full max-w-sm mx-4 sm:max-w-md md:max-w-lg lg:max-w-4xl',
      full: 'w-[95vw] max-w-[95vw] h-[95vh] max-h-[95vh] mx-2'
    };
    return responsiveClasses[size];
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent 
        className={`
          ${getResponsiveClasses(size)}
          ${size === 'full' ? 'p-0' : ''}
          ${className}
        `}
        aria-describedby={description ? undefined : 'modal-description'}
      >
        <DialogHeader className={size === 'full' ? 'p-6 pb-0' : ''}>
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-lg font-semibold">{title}</DialogTitle>
              {description && (
                <DialogDescription className="text-sm text-muted-foreground mt-1">
                  {description}
                </DialogDescription>
              )}
            </div>
            {showCloseButton && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="h-8 w-8 p-0 hover:bg-muted"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </DialogHeader>
        <div 
          className={`
            ${size === 'full' ? 'flex-1 overflow-hidden px-6 pb-6' : ''}
            ${size === 'xl' ? 'max-h-[80vh] overflow-y-auto' : ''}
          `}
        >
          {children}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ResponsiveModal;

// Hook for managing modal state
export const useModal = (initialState = false) => {
  const [isOpen, setIsOpen] = React.useState(initialState);
  
  const openModal = React.useCallback(() => setIsOpen(true), []);
  const closeModal = React.useCallback(() => setIsOpen(false), []);
  const toggleModal = React.useCallback(() => setIsOpen(prev => !prev), []);
  
  return {
    isOpen,
    openModal,
    closeModal,
    toggleModal
  };
};

// Progressive disclosure helper component
export const ModalStep = ({ 
  children, 
  title, 
  description,
  className = '' 
}: {
  children: React.ReactNode;
  title?: string;
  description?: string;
  className?: string;
}) => {
  return (
    <div className={`space-y-4 ${className}`}>
      {title && <h3 className="text-lg font-semibold">{title}</h3>}
      {description && <p className="text-sm text-muted-foreground">{description}</p>}
      {children}
    </div>
  );
};

// Multi-step modal container
export const MultiStepModal = ({ 
  steps, 
  currentStep, 
  onStepChange,
  ...modalProps 
}: {
  steps: Array<{ title: string; description?: string; content: React.ReactNode }>;
  currentStep: number;
  onStepChange: (step: number) => void;
} & Omit<ResponsiveModalProps, 'children'>) => {
  const currentStepData = steps[currentStep];
  
  return (
    <ResponsiveModal {...modalProps} title={currentStepData.title} description={currentStepData.description}>
      <div className="space-y-4">
        {/* Progress indicator */}
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>Step {currentStep + 1} of {steps.length}</span>
          <div className="flex gap-1">
            {steps.map((_, index) => (
              <div
                key={index}
                className={`w-2 h-2 rounded-full ${
                  index === currentStep ? 'bg-primary' : 
                  index < currentStep ? 'bg-primary/50' : 'bg-muted'
                }`}
              />
            ))}
          </div>
        </div>
        
        {/* Step content */}
        {currentStepData.content}
      </div>
    </ResponsiveModal>
  );
};