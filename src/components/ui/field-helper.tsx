/**
 * FieldHelper Component
 * Provides contextual help information for form fields
 */

import React from 'react';
import { Info, HelpCircle } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { getFieldHelpText, FieldHelpText } from '@/data/field-help-text';
import { cn } from '@/lib/utils';

interface FieldHelperProps {
  fieldName: string;
  variant?: 'icon' | 'inline' | 'detailed';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const FieldHelper: React.FC<FieldHelperProps> = ({
  fieldName,
  variant = 'icon',
  size = 'sm',
  className
}) => {
  const helpText = getFieldHelpText(fieldName);

  if (!helpText) {
    return null;
  }

  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-6 w-6'
  };

  const getCategoryColor = (category: FieldHelpText['category']) => {
    const colors = {
      basic: 'bg-blue-50 text-blue-700 border-blue-200',
      billing: 'bg-green-50 text-green-700 border-green-200',
      team: 'bg-purple-50 text-purple-700 border-purple-200',
      legal: 'bg-red-50 text-red-700 border-red-200',
      notifications: 'bg-yellow-50 text-yellow-700 border-yellow-200',
      permissions: 'bg-orange-50 text-orange-700 border-orange-200',
      custom: 'bg-gray-50 text-gray-700 border-gray-200'
    };
    return colors[category] || colors.basic;
  };

  // Icon variant - small tooltip on hover
  if (variant === 'icon') {
    return (
      <div className={cn('inline-flex', className)}>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="p-1 h-auto text-muted-foreground hover:text-foreground"
            >
              <Info className={sizeClasses[size]} />
            </Button>
          </TooltipTrigger>
          <TooltipContent 
            className="max-w-sm z-50"
            side="top"
            align="start"
            sideOffset={5}
          >
            <div className="space-y-2">
              <p className="font-medium text-sm">{helpText.title}</p>
              <p className="text-xs text-muted-foreground leading-relaxed">{helpText.description}</p>
              {helpText.examples && helpText.examples.length > 0 && (
                <p className="text-xs text-muted-foreground italic">
                  Example: {helpText.examples[0]}
                </p>
              )}
              {helpText.required && (
                <Badge variant="outline" className="text-xs">Required</Badge>
              )}
            </div>
          </TooltipContent>
        </Tooltip>

      </div>
    );
  }

  // Inline variant - text description
  if (variant === 'inline') {
    return (
      <div className={cn('text-sm text-muted-foreground space-y-1', className)}>
        <p>{helpText.description}</p>
        {helpText.examples && helpText.examples.length > 0 && (
          <p className="text-xs">
            Example: {helpText.examples[0]}
          </p>
        )}
      </div>
    );
  }

  // Detailed variant - full information card
  if (variant === 'detailed') {
    return (
      <Card className={cn('border-l-4', getCategoryColor(helpText.category), className)}>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <HelpCircle className="h-4 w-4" />
              {helpText.title}
            </CardTitle>
            <div className="flex gap-1">
              <Badge variant="outline" className={cn('text-xs', getCategoryColor(helpText.category))}>
                {helpText.category.replace('_', ' ')}
              </Badge>
              {helpText.required && (
                <Badge variant="destructive" className="text-xs">Required</Badge>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <CardDescription>{helpText.description}</CardDescription>
          
          {helpText.examples && helpText.examples.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium">Examples:</h4>
              <div className="space-y-1">
                {helpText.examples.map((example, index) => (
                  <div key={index} className="text-sm text-muted-foreground pl-3 border-l-2 border-muted">
                    {example}
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  return null;
};

export default FieldHelper;