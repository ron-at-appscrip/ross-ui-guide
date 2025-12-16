import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { QuickAction } from '@/types/chat';
import { ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface QuickActionCardProps {
  action: QuickAction;
  onClick: (action: QuickAction) => void;
  className?: string;
}

const getIconComponent = (iconName: string) => {
  // This would typically import icons dynamically or use a map
  // For now, using a simple emoji/text representation
  const iconMap: Record<string, string> = {
    'document-analysis': '📄',
    'case-research': '⚖️',
    'risk-assessment': '⚠️',
    'draft-document': '✍️',
    'matter-insights': '📊',
    'client-communication': '💬',
  };
  
  return iconMap[iconName] || '🔧';
};

export const QuickActionCard: React.FC<QuickActionCardProps> = ({
  action,
  onClick,
  className,
}) => {
  const handleClick = () => {
    onClick(action);
  };

  return (
    <Card 
      className={cn(
        'relative overflow-hidden border-0 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer group',
        `bg-gradient-to-br ${action.color}`,
        className
      )}
      onClick={handleClick}
    >
      <div className="p-6 h-full flex flex-col justify-between min-h-[160px]">
        {/* Icon */}
        <div className="text-3xl mb-4">
          {getIconComponent(action.icon)}
        </div>
        
        {/* Content */}
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900 mb-2 text-lg leading-tight">
            {action.title}
          </h3>
          <p className="text-sm text-gray-700 leading-relaxed">
            {action.description}
          </p>
        </div>
        
        {/* Action Arrow */}
        <div className="flex justify-end mt-4">
          <div className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center group-hover:bg-white/30 transition-colors">
            <ChevronRight className="h-4 w-4 text-gray-700 group-hover:translate-x-0.5 transition-transform" />
          </div>
        </div>
        
        {/* Subtle decoration */}
        <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -translate-y-12 translate-x-12" />
        <div className="absolute bottom-0 left-0 w-16 h-16 bg-white/5 rounded-full translate-y-8 -translate-x-8" />
      </div>
    </Card>
  );
};