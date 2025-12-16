import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ActionSuggestion, RiskLevel } from '@/types/legal';
import { 
  Lightbulb,
  Search,
  FileText,
  Eye,
  Calendar,
  MessageSquare,
  Archive,
  ExternalLink,
  Clock,
  User,
  ArrowRight,
  Plus
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface ActionSuggestionsProps {
  suggestions: ActionSuggestion[];
  onActionClick?: (suggestion: ActionSuggestion) => void;
  className?: string;
}

const getActionIcon = (type: string) => {
  switch (type) {
    case 'research':
      return <Search className="h-4 w-4" />;
    case 'draft':
      return <FileText className="h-4 w-4" />;
    case 'review':
      return <Eye className="h-4 w-4" />;
    case 'calendar':
      return <Calendar className="h-4 w-4" />;
    case 'communicate':
      return <MessageSquare className="h-4 w-4" />;
    case 'file':
      return <Archive className="h-4 w-4" />;
    default:
      return <Plus className="h-4 w-4" />;
  }
};

const getPriorityColor = (priority: RiskLevel) => {
  switch (priority) {
    case 'critical':
      return 'bg-red-50 text-red-700 border-red-200';
    case 'high':
      return 'bg-orange-50 text-orange-700 border-orange-200';
    case 'medium':
      return 'bg-yellow-50 text-yellow-700 border-yellow-200';
    case 'low':
      return 'bg-green-50 text-green-700 border-green-200';
    default:
      return 'bg-gray-50 text-gray-700 border-gray-200';
  }
};

const formatDeadline = (deadline: string) => {
  const date = new Date(deadline);
  const now = new Date();
  const diffTime = date.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays < 0) return { text: 'Overdue', urgent: true };
  if (diffDays === 0) return { text: 'Due today', urgent: true };
  if (diffDays === 1) return { text: 'Due tomorrow', urgent: true };
  if (diffDays <= 7) return { text: `Due in ${diffDays} days`, urgent: false };
  return { text: date.toLocaleDateString(), urgent: false };
};

export const ActionSuggestions: React.FC<ActionSuggestionsProps> = ({
  suggestions,
  onActionClick,
  className,
}) => {
  const handleActionClick = (suggestion: ActionSuggestion) => {
    if (onActionClick) {
      onActionClick(suggestion);
    } else {
      // Default action handling
      switch (suggestion.action.type) {
        case 'navigate':
          // In a real app, this would use React Router
          console.log('Navigate to:', suggestion.action.target);
          break;
        case 'external':
          window.open(suggestion.action.target, '_blank', 'noopener,noreferrer');
          break;
        case 'create':
        case 'update':
          console.log('Action:', suggestion.action.type, suggestion.action.target, suggestion.action.data);
          break;
        default:
          console.log('Unknown action type:', suggestion.action.type);
      }
    }
  };

  // Sort suggestions by priority
  const sortedSuggestions = [...suggestions].sort((a, b) => {
    const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
    return priorityOrder[b.priority] - priorityOrder[a.priority];
  });

  if (suggestions.length === 0) return null;

  return (
    <Card className={cn('shadow-sm border-l-4 border-l-purple-500', className)}>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Lightbulb className="h-5 w-5 text-purple-600" />
          Suggested Actions ({suggestions.length})
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-3">
        {sortedSuggestions.map((suggestion) => {
          const deadline = suggestion.deadline ? formatDeadline(suggestion.deadline) : null;
          
          return (
            <div key={suggestion.id} className="border rounded-lg p-4 bg-gray-50 hover:bg-gray-100 transition-colors">
              {/* Header */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <div className="flex-shrink-0 text-purple-600">
                    {getActionIcon(suggestion.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-gray-900 leading-tight">
                      {suggestion.title}
                    </h4>
                    <p className="text-sm text-gray-600 capitalize">
                      {suggestion.type.replace('_', ' ')} action
                    </p>
                  </div>
                </div>
                
                <Badge variant="outline" className={cn('border flex-shrink-0', getPriorityColor(suggestion.priority))}>
                  {suggestion.priority}
                </Badge>
              </div>

              {/* Description */}
              <p className="text-sm text-gray-700 mb-4 leading-relaxed">
                {suggestion.description}
              </p>

              {/* Metadata */}
              <div className="flex items-center gap-4 mb-4 text-xs text-gray-600">
                {suggestion.estimatedTime && (
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {suggestion.estimatedTime}
                  </div>
                )}
                
                {deadline && (
                  <div className={cn(
                    'flex items-center gap-1',
                    deadline.urgent ? 'text-red-600 font-medium' : ''
                  )}>
                    <Calendar className="h-3 w-3" />
                    {deadline.text}
                  </div>
                )}
                
                {suggestion.assignTo && (
                  <div className="flex items-center gap-1">
                    <User className="h-3 w-3" />
                    {suggestion.assignTo}
                  </div>
                )}
              </div>

              {/* Related Context */}
              {suggestion.relatedTo && (
                <div className="bg-white border rounded p-2 mb-4">
                  <div className="text-xs text-gray-600 mb-1">Related to:</div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">
                      {suggestion.relatedTo.type}
                    </Badge>
                    <span className="text-sm text-gray-700">
                      {suggestion.relatedTo.type === 'matter' && 'Matter'}
                      {suggestion.relatedTo.type === 'client' && 'Client'}
                      {suggestion.relatedTo.type === 'document' && 'Document'}
                      : {suggestion.relatedTo.id}
                    </span>
                  </div>
                </div>
              )}

              {/* Action Button */}
              <Button
                onClick={() => handleActionClick(suggestion)}
                className="w-full justify-between group"
                variant={suggestion.priority === 'critical' || suggestion.priority === 'high' ? 'default' : 'outline'}
              >
                <span className="flex items-center gap-2">
                  {getActionIcon(suggestion.type)}
                  {suggestion.action.type === 'navigate' && 'Go to'}
                  {suggestion.action.type === 'create' && 'Create'}
                  {suggestion.action.type === 'update' && 'Update'}
                  {suggestion.action.type === 'external' && 'Open'}
                  {' '}
                  {suggestion.type === 'research' && 'Research'}
                  {suggestion.type === 'draft' && 'Draft'}
                  {suggestion.type === 'review' && 'Review'}
                  {suggestion.type === 'calendar' && 'Schedule'}
                  {suggestion.type === 'communicate' && 'Send'}
                  {suggestion.type === 'file' && 'File'}
                </span>
                
                <div className="flex items-center gap-1">
                  {suggestion.action.type === 'external' && (
                    <ExternalLink className="h-3 w-3" />
                  )}
                  <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </Button>
            </div>
          );
        })}

        {/* Summary */}
        {suggestions.length > 1 && (
          <div className="border-t pt-4 mt-4">
            <div className="grid grid-cols-4 gap-4 text-center">
              {(['critical', 'high', 'medium', 'low'] as RiskLevel[]).map(priority => {
                const count = suggestions.filter(s => s.priority === priority).length;
                const colors = getPriorityColor(priority);
                
                return count > 0 ? (
                  <div key={priority} className="space-y-1">
                    <div className={cn('font-semibold text-lg', colors.split(' ')[1])}>
                      {count}
                    </div>
                    <div className="text-xs text-gray-600 capitalize">
                      {priority}
                    </div>
                  </div>
                ) : null;
              })}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};