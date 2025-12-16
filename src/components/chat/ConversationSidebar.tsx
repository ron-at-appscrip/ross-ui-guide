import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { ConversationList } from './ConversationList';
import { ConversationSummary, ConversationCategory, ConversationFilters } from '@/types/chat';
import { conversationService } from '@/services/conversationService';
import { 
  Plus, 
  Search, 
  Star, 
  Briefcase, 
  Users, 
  FileText, 
  MessageSquare,
  MoreHorizontal,
  X,
  Workflow,
  Play,
  CheckCircle,
  Clock,
  ChevronLeft,
  ChevronRight,
  Filter
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface ConversationSidebarProps {
  selectedConversationId?: string;
  onSelectConversation: (conversation: ConversationSummary | null) => void;
  onNewConversation: () => void;
  className?: string;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

export const ConversationSidebar: React.FC<ConversationSidebarProps> = ({
  selectedConversationId,
  onSelectConversation,
  onNewConversation,
  className,
  isCollapsed = false,
  onToggleCollapse,
}) => {
  const [conversations, setConversations] = useState<ConversationSummary[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<'all' | 'starred' | 'workflows'>('all');
  const [showFilters, setShowFilters] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Load conversations on mount
  useEffect(() => {
    loadConversations();
  }, []);

  // Filter conversations when search or filter changes
  useEffect(() => {
    loadConversations();
  }, [searchQuery, activeFilter]);

  const loadConversations = () => {
    setIsLoading(true);
    
    const filters: ConversationFilters = {};
    
    if (searchQuery) {
      filters.search = searchQuery;
    }
    
    if (activeFilter === 'starred') {
      filters.starred = true;
    } else if (activeFilter === 'workflows') {
      // Filter for workflow conversations only
      const allConversations = conversationService.getConversationSummaries(filters);
      const workflowConversations = allConversations.filter(conv => conv.workflowTemplateId);
      setConversations(workflowConversations);
      setIsLoading(false);
      return;
    }

    const filteredConversations = conversationService.getConversationSummaries(filters);
    setConversations(filteredConversations);
    setIsLoading(false);
  };

  const handleToggleStar = (conversationId: string) => {
    conversationService.toggleStar(conversationId);
    loadConversations();
  };

  const handleDeleteConversation = (conversationId: string) => {
    if (window.confirm('Are you sure you want to delete this conversation?')) {
      conversationService.deleteConversation(conversationId);
      loadConversations();
      
      // If this was the selected conversation, deselect it
      if (selectedConversationId === conversationId) {
        onSelectConversation(null);
      }
    }
  };

  const handleClearSearch = () => {
    setSearchQuery('');
  };

  const getFilterCount = (filter: 'all' | 'starred' | 'workflows') => {
    if (filter === 'all') {
      return conversationService.getConversationSummaries().length;
    }
    if (filter === 'starred') {
      return conversationService.getConversationSummaries({ starred: true }).length;
    }
    if (filter === 'workflows') {
      return conversationService.getWorkflowConversations().length;
    }
    return 0;
  };

  const getTabIcon = (tab: string) => {
    switch (tab) {
      case 'all':
        return <MessageSquare className="h-4 w-4" />;
      case 'starred':
        return <Star className="h-4 w-4" />;
      case 'workflows':
        return <Workflow className="h-4 w-4" />;
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

  if (isCollapsed) {
    return (
      <div className={cn('flex flex-col h-full bg-background border-r border-border w-16', className)}>
        {/* Collapsed Header */}
        <div className="flex-shrink-0 h-16 flex items-center justify-center border-b border-border">
          <Button
            variant="ghost"
            onClick={onToggleCollapse}
            className="w-11 h-11 p-0 rounded-lg hover:bg-muted transition-colors"
            title="Expand sidebar"
          >
            <ChevronRight className="h-5 w-5" />
          </Button>
        </div>
        
        {/* Collapsed Actions */}
        <div className="flex-1 flex flex-col items-center pt-6">
          <Button
            variant="ghost"
            onClick={onNewConversation}
            className="w-11 h-11 p-0 rounded-lg hover:bg-muted transition-colors mb-4"
            title="New conversation"
          >
            <Plus className="h-5 w-5" />
          </Button>
        </div>
        
        {/* Collapsed Footer */}
        <div className="flex-shrink-0 h-12 flex items-center justify-center border-t border-border">
          <div className="w-2 h-2 bg-green-500 rounded-full" title="Online" />
        </div>
      </div>
    );
  }

  return (
    <div className={cn('flex flex-col h-full bg-background border-r border-border', className)}>
      {/* Header */}
      <div className="flex-shrink-0 h-16 flex items-center justify-between px-6 border-b border-border">
        <h2 className="text-base font-semibold text-foreground">Conversations</h2>
        <div className="flex items-center gap-2">
          <Button
            onClick={onNewConversation}
            className="h-8 px-3 gap-1.5 text-sm"
          >
            <Plus className="h-4 w-4" />
            New
          </Button>
          <Button
            variant="ghost"
            onClick={onToggleCollapse}
            className="w-8 h-8 p-0"
            title="Collapse sidebar"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Search Section */}
      <div className="flex-shrink-0 p-4 border-b border-border">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search conversations..."
            className="pl-10 pr-10 h-10 text-sm"
          />
          {searchQuery && (
            <Button
              variant="ghost"
              onClick={handleClearSearch}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0 hover:bg-muted"
            >
              <X className="h-3 w-3" />
            </Button>
          )}
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex-shrink-0 px-3 py-3 border-b border-border">
        <div className="flex bg-muted rounded-lg p-1 gap-1">
          {[
            { key: 'all', label: 'All', icon: MessageSquare },
            { key: 'starred', label: 'Starred', icon: Star },
            { key: 'workflows', label: 'Workflows', icon: Workflow },
          ].map((filter) => (
            <button
              key={filter.key}
              onClick={() => setActiveFilter(filter.key as any)}
              className={cn(
                'flex-1 min-w-0 h-8 px-2 text-xs font-medium transition-all duration-200 rounded-md flex items-center justify-center gap-1',
                activeFilter === filter.key 
                  ? 'bg-background text-foreground shadow-sm' 
                  : 'text-muted-foreground hover:bg-background/60 hover:text-foreground'
              )}
            >
              <filter.icon className="h-3 w-3 flex-shrink-0" />
              <span className="truncate">{filter.label}</span>
              <span className="text-xs opacity-60 flex-shrink-0">
                {getFilterCount(filter.key as any)}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Conversation List */}
      <div className="flex-1 overflow-hidden">
        <div className="h-full overflow-y-auto">
          <div className="px-4 py-2">
            {isLoading ? (
              <div className="space-y-2">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="animate-pulse p-4 rounded-lg border border-border">
                    <div className="h-4 bg-muted rounded mb-3" />
                    <div className="h-3 bg-muted rounded w-3/4 mb-2" />
                    <div className="h-3 bg-muted rounded w-1/2" />
                  </div>
                ))}
              </div>
            ) : conversations.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <MessageSquare className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-sm font-medium text-foreground mb-2">
                  {searchQuery ? 'No conversations found' : 'No conversations yet'}
                </h3>
                <p className="text-xs text-muted-foreground max-w-48">
                  {searchQuery 
                    ? 'Try adjusting your search terms' 
                    : 'Start a new conversation to begin chatting with your AI legal assistant'
                  }
                </p>
                {!searchQuery && (
                  <Button
                    onClick={onNewConversation}
                    className="mt-4 h-8 px-3 text-xs"
                  >
                    <Plus className="h-3 w-3 mr-1" />
                    Start conversation
                  </Button>
                )}
              </div>
            ) : (
              <ConversationList
                conversations={conversations}
                selectedConversationId={selectedConversationId}
                onSelectConversation={onSelectConversation}
                onToggleStar={handleToggleStar}
                onDeleteConversation={handleDeleteConversation}
              />
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="flex-shrink-0 h-12 flex items-center justify-between px-4 border-t border-border bg-muted/30">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-green-500 rounded-full" />
          <span className="text-xs text-muted-foreground font-medium">Online</span>
        </div>
        <span className="text-xs text-muted-foreground">
          {conversations.length} {conversations.length === 1 ? 'chat' : 'chats'}
        </span>
      </div>
    </div>
  );
};