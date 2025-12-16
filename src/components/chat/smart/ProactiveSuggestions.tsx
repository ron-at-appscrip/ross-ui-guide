import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ChatContext } from '@/types/chat';
import { 
  Clock, 
  AlertTriangle, 
  FileText, 
  Calendar, 
  TrendingUp,
  MessageSquare,
  X,
  ChevronRight
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface ProactiveSuggestionsProps {
  context: ChatContext;
  onSuggestionClick?: (suggestion: string) => void;
  className?: string;
}

interface Suggestion {
  id: string;
  type: 'deadline' | 'task' | 'document' | 'insight' | 'communication';
  priority: 'high' | 'medium' | 'low';
  title: string;
  description: string;
  action: string;
  icon: React.ComponentType<{ className?: string }>;
  urgent?: boolean;
}

const getSuggestionColor = (type: string, priority: string, urgent?: boolean) => {
  if (urgent) {
    return 'bg-red-50 border-red-200 text-red-700';
  }
  
  switch (priority) {
    case 'high':
      return 'bg-orange-50 border-orange-200 text-orange-700';
    case 'medium':
      return 'bg-blue-50 border-blue-200 text-blue-700';
    case 'low':
      return 'bg-gray-50 border-gray-200 text-gray-700';
    default:
      return 'bg-gray-50 border-gray-200 text-gray-700';
  }
};

export const ProactiveSuggestions: React.FC<ProactiveSuggestionsProps> = ({
  context,
  onSuggestionClick,
  className,
}) => {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [dismissedSuggestions, setDismissedSuggestions] = useState<Set<string>>(new Set());

  useEffect(() => {
    generateSuggestions();
  }, [context]);

  const generateSuggestions = () => {
    const newSuggestions: Suggestion[] = [];

    if (context.type === 'matter' && context.data) {
      const matter = context.data;

      // Deadline-based suggestions
      if (context.upcomingDeadlines) {
        context.upcomingDeadlines.forEach(deadline => {
          const dueDate = new Date(deadline.date);
          const daysUntil = Math.ceil((dueDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
          
          if (daysUntil <= 7) {
            newSuggestions.push({
              id: `deadline-${deadline.id}`,
              type: 'deadline',
              priority: deadline.priority as 'high' | 'medium' | 'low',
              urgent: daysUntil <= 2,
              title: `Upcoming Deadline: ${deadline.title}`,
              description: `Due in ${daysUntil} day${daysUntil !== 1 ? 's' : ''}`,
              action: `Help me prepare for ${deadline.title}`,
              icon: Clock,
            });
          }
        });
      }

      // Matter-specific suggestions
      if (matter.status === 'active') {
        if (matter.stage === 'discovery') {
          newSuggestions.push({
            id: 'discovery-checklist',
            type: 'task',
            priority: 'medium',
            title: 'Discovery Phase Assistance',
            description: 'Generate discovery checklist and document requests',
            action: 'Create discovery checklist for this matter',
            icon: FileText,
          });
        }

        if (matter.stage === 'trial') {
          newSuggestions.push({
            id: 'trial-prep',
            type: 'task',
            priority: 'high',
            title: 'Trial Preparation',
            description: 'Review trial preparation checklist and timeline',
            action: 'Help me prepare for trial',
            icon: Calendar,
          });
        }
      }

      // Budget analysis
      if (matter.billedAmount && matter.estimatedBudget) {
        const budgetUsed = (matter.billedAmount / matter.estimatedBudget) * 100;
        if (budgetUsed > 80) {
          newSuggestions.push({
            id: 'budget-warning',
            type: 'insight',
            priority: 'high',
            urgent: budgetUsed > 95,
            title: 'Budget Alert',
            description: `${Math.round(budgetUsed)}% of budget used`,
            action: 'Analyze budget and recommend next steps',
            icon: TrendingUp,
          });
        }
      }

      // Recent activity suggestions
      if (context.recentActivity) {
        const recentDocuments = context.recentActivity.filter(a => a.type === 'document');
        if (recentDocuments.length > 0) {
          newSuggestions.push({
            id: 'recent-docs',
            type: 'document',
            priority: 'medium',
            title: 'Recent Document Analysis',
            description: 'Analyze recently uploaded documents',
            action: 'Review and analyze recent documents',
            icon: FileText,
          });
        }
      }
    } else if (context.type === 'client' && context.data) {
      const client = context.data;

      // Client-specific suggestions
      if (client.outstandingBalance > 0) {
        newSuggestions.push({
          id: 'outstanding-balance',
          type: 'communication',
          priority: client.outstandingBalance > 10000 ? 'high' : 'medium',
          title: 'Outstanding Balance',
          description: `$${client.outstandingBalance.toLocaleString()} pending`,
          action: 'Draft payment reminder communication',
          icon: MessageSquare,
        });
      }

      // Activity-based suggestions
      const lastActivityDate = new Date(client.lastActivity);
      const daysSinceActivity = Math.ceil((Date.now() - lastActivityDate.getTime()) / (1000 * 60 * 60 * 24));
      
      if (daysSinceActivity > 30) {
        newSuggestions.push({
          id: 'client-check-in',
          type: 'communication',
          priority: 'low',
          title: 'Client Check-in',
          description: `No activity in ${daysSinceActivity} days`,
          action: 'Draft client check-in message',
          icon: MessageSquare,
        });
      }
    } else if (context.type === 'general') {
      // General suggestions when no specific context
      newSuggestions.push({
        id: 'daily-priorities',
        type: 'task',
        priority: 'medium',
        title: 'Daily Priorities',
        description: 'Review today\'s urgent tasks and deadlines',
        action: 'Show me today\'s priorities',
        icon: Calendar,
      });

      newSuggestions.push({
        id: 'matter-review',
        type: 'insight',
        priority: 'low',
        title: 'Matter Status Review',
        description: 'Check status of active matters',
        action: 'Review all active matters',
        icon: TrendingUp,
      });
    }

    setSuggestions(newSuggestions);
  };

  const handleSuggestionClick = (suggestion: Suggestion) => {
    if (onSuggestionClick) {
      onSuggestionClick(suggestion.action);
    }
  };

  const dismissSuggestion = (suggestionId: string) => {
    setDismissedSuggestions(prev => new Set([...prev, suggestionId]));
  };

  const visibleSuggestions = suggestions.filter(s => !dismissedSuggestions.has(s.id));

  if (visibleSuggestions.length === 0) {
    return null;
  }

  return (
    <div className={cn('space-y-2', className)}>
      {visibleSuggestions.slice(0, 3).map((suggestion) => {
        const colorClass = getSuggestionColor(suggestion.type, suggestion.priority, suggestion.urgent);
        
        return (
          <div
            key={suggestion.id}
            className={cn(
              'flex items-center gap-3 p-3 rounded-lg border transition-colors hover:bg-opacity-80',
              colorClass
            )}
          >
            <div className="flex-shrink-0">
              <suggestion.icon className="h-4 w-4" />
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-medium text-sm">{suggestion.title}</span>
                {suggestion.urgent && (
                  <Badge variant="destructive" className="text-xs px-1 py-0">
                    Urgent
                  </Badge>
                )}
              </div>
              <p className="text-xs opacity-80">{suggestion.description}</p>
            </div>
            
            <div className="flex items-center gap-1 flex-shrink-0">
              <Button
                size="sm"
                variant="ghost"
                onClick={() => handleSuggestionClick(suggestion)}
                className="h-7 px-2 text-xs hover:bg-white/20"
              >
                Ask
                <ChevronRight className="h-3 w-3 ml-1" />
              </Button>
              
              <Button
                size="sm"
                variant="ghost"
                onClick={() => dismissSuggestion(suggestion.id)}
                className="h-7 w-7 p-0 hover:bg-white/20"
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          </div>
        );
      })}
      
      {visibleSuggestions.length > 3 && (
        <div className="text-center">
          <Button variant="ghost" size="sm" className="text-xs text-gray-500">
            +{visibleSuggestions.length - 3} more suggestions
          </Button>
        </div>
      )}
    </div>
  );
};