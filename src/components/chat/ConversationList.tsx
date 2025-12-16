import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ConversationSummary, ConversationCategory } from '@/types/chat';
import { 
  Star, 
  FileText, 
  Users, 
  Search, 
  Briefcase, 
  MessageSquare,
  MoreHorizontal,
  Pin,
  Workflow,
  Play,
  CheckCircle,
  Clock,
  ArrowRight
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface ConversationListProps {
  conversations: ConversationSummary[];
  selectedConversationId?: string;
  onSelectConversation: (conversation: ConversationSummary) => void;
  onToggleStar?: (conversationId: string) => void;
  onDeleteConversation?: (conversationId: string) => void;
  className?: string;
}

const getCategoryIcon = (category: ConversationCategory) => {
  switch (category) {
    case 'matters':
      return <Briefcase className="h-4 w-4" />;
    case 'clients':
      return <Users className="h-4 w-4" />;
    case 'documents':
      return <FileText className="h-4 w-4" />;
    case 'research':
      return <Search className="h-4 w-4" />;
    case 'general':
      return <MessageSquare className="h-4 w-4" />;
    default:
      return <MessageSquare className="h-4 w-4" />;
  }
};

const getCategoryColor = (category: ConversationCategory) => {
  switch (category) {
    case 'matters':
      return 'text-blue-600 bg-blue-50 border-blue-200';
    case 'clients':
      return 'text-green-600 bg-green-50 border-green-200';
    case 'documents':
      return 'text-purple-600 bg-purple-50 border-purple-200';
    case 'research':
      return 'text-orange-600 bg-orange-50 border-orange-200';
    case 'general':
      return 'text-muted-foreground bg-muted border-border';
    default:
      return 'text-muted-foreground bg-muted border-border';
  }
};

const formatTimeAgo = (timestamp: string) => {
  const date = new Date(timestamp);
  const now = new Date();
  const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
  
  if (diffInMinutes < 1) return 'Just now';
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
  
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours}h ago`;
  
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) return `${diffInDays}d ago`;
  
  if (diffInDays < 30) return `${Math.floor(diffInDays / 7)}w ago`;
  
  return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
};

const getWorkflowStatusIcon = (status?: string) => {
  switch (status) {
    case 'in_progress':
      return <Play className="h-3 w-3 text-blue-600" />;
    case 'completed':
      return <CheckCircle className="h-3 w-3 text-green-600" />;
    default:
      return <Clock className="h-3 w-3 text-muted-foreground" />;
  }
};

const getWorkflowStatusColor = (status?: string) => {
  switch (status) {
    case 'in_progress':
      return 'text-blue-700 bg-blue-50 border-blue-200';
    case 'completed':
      return 'text-green-700 bg-green-50 border-green-200';
    default:
      return 'text-foreground bg-muted border-border';
  }
};

const getWorkflowStatusText = (status?: string) => {
  switch (status) {
    case 'in_progress':
      return 'In Progress';
    case 'completed':
      return 'Completed';
    case 'not_started':
      return 'Not Started';
    default:
      return 'Unknown';
  }
};

export const ConversationList: React.FC<ConversationListProps> = ({
  conversations,
  selectedConversationId,
  onSelectConversation,
  onToggleStar,
  onDeleteConversation,
  className,
}) => {
  const handleStarClick = (e: React.MouseEvent, conversationId: string) => {
    e.stopPropagation();
    onToggleStar?.(conversationId);
  };

  if (conversations.length === 0) {
    return (
      <div className={cn('p-4 text-center text-muted-foreground', className)}>
        <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-50" />
        <p className="text-sm">No conversations found</p>
      </div>
    );
  }

  return (
    <div className={cn('space-y-3', className)}>
      {conversations.map((conversation) => (
        <div
          key={conversation.id}
          onClick={() => onSelectConversation(conversation)}
          className={cn(
            'group relative p-4 rounded-xl cursor-pointer transition-all duration-200 hover:bg-muted/50 hover:shadow-sm border border-transparent',
            selectedConversationId === conversation.id && 'bg-blue-50 hover:bg-blue-50 border-blue-200 shadow-sm'
          )}
        >
          {/* Header */}
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              {/* Workflow indicator with better spacing */}
              {conversation.workflowTemplateId ? (
                <div className="flex items-center gap-2">
                  <div className={cn('flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium', getWorkflowStatusColor(conversation.workflowStatus))}>
                    <Workflow className="h-3 w-3" />
                    <span className="capitalize">{conversation.workflowStatus?.replace('_', ' ')}</span>
                  </div>
                  <Badge variant="outline" className="text-xs px-2 py-0.5 text-muted-foreground rounded-full">
                    {conversation.category}
                  </Badge>
                </div>
              ) : (
                <Badge variant="outline" className={cn('text-xs px-2.5 py-1 rounded-full gap-1.5', getCategoryColor(conversation.category))}>
                  {getCategoryIcon(conversation.category)}
                  <span className="capitalize">{conversation.category}</span>
                </Badge>
              )}
              
              {conversation.isStarred && (
                <Star className="h-3.5 w-3.5 text-yellow-500 fill-current flex-shrink-0" />
              )}
            </div>
            
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              {conversation.workflowTemplateId && conversation.workflowStatus === 'in_progress' && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectConversation(conversation);
                  }}
                  className="h-7 w-7 p-0 text-blue-600 hover:bg-blue-100"
                  title="Resume Workflow"
                >
                  <ArrowRight className="h-3.5 w-3.5" />
                </Button>
              )}
              
              <Button
                size="sm"
                variant="ghost"
                onClick={(e) => handleStarClick(e, conversation.id)}
                className="h-7 w-7 p-0 hover:bg-muted"
              >
                <Star className={cn(
                  'h-3.5 w-3.5',
                  conversation.isStarred ? 'text-yellow-500 fill-current' : 'text-muted-foreground'
                )} />
              </Button>
            </div>
          </div>

          {/* Title */}
          <h4 className={cn(
            'font-semibold text-base leading-tight mb-2 line-clamp-2',
            selectedConversationId === conversation.id ? 'text-primary' : 'text-foreground'
          )}>
            {conversation.title}
          </h4>

          {/* Workflow Progress */}
          {conversation.workflowTemplateId && (
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                {conversation.workflowCurrentStep !== undefined && (
                  <>
                    <Clock className="h-4 w-4" />
                    <span>Step {conversation.workflowCurrentStep + 1}</span>
                  </>
                )}
                {conversation.workflowStatus === 'completed' && (
                  <>
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="text-green-600 font-medium">Results Available</span>
                  </>
                )}
              </div>
              {conversation.workflowStatus === 'in_progress' && (
                <Badge variant="secondary" className="text-xs px-2 py-1 rounded-full">
                  Click to Resume
                </Badge>
              )}
            </div>
          )}

          {/* Context Info */}
          {conversation.contextName && (
            <div className="flex items-center gap-2 mb-3">
              <div className="w-2 h-2 bg-blue-500 rounded-full" />
              <span className="text-sm text-muted-foreground truncate">
                {conversation.contextType === 'matter' && 'Matter: '}
                {conversation.contextType === 'client' && 'Client: '}
                {conversation.contextName}
              </span>
            </div>
          )}

          {/* Last Message */}
          <p className="text-xs text-muted-foreground line-clamp-2 mb-2 leading-relaxed">
            {conversation.lastMessage || 'No messages yet'}
          </p>

          {/* Footer */}
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <div className="flex items-center gap-2">
              <span>{conversation.messageCount} msg{conversation.messageCount !== 1 ? 's' : ''}</span>
              {conversation.hasAttachments && (
                <Paperclip className="h-3 w-3" />
              )}
            </div>
            <span className="whitespace-nowrap font-medium">
              {formatTimeAgo(conversation.lastActivity)}
            </span>
          </div>

          {/* Selection indicator */}
          {selectedConversationId === conversation.id && (
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500 rounded-r-full" />
          )}
        </div>
      ))}
    </div>
  );
};