import { Conversation, ConversationSummary, ConversationCategory, ConversationFilters, ChatMessage } from '@/types/chat';
import { mockConversationsService } from './mockConversationsService';

class ConversationService {
  private readonly STORAGE_KEY = 'legal_ai_conversations';
  private conversations: Map<string, Conversation> = new Map();

  constructor() {
    this.loadConversations();
  }

  // Load conversations from localStorage
  private loadConversations(): void {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      const versionKey = 'legal_ai_conversations_version';
      const currentVersion = '1.3'; // Update this to force refresh - Added workflow execution linking
      const storedVersion = localStorage.getItem(versionKey);
      
      if (stored && storedVersion === currentVersion) {
        const conversationsArray: Conversation[] = JSON.parse(stored);
        // Check if any conversations have workflow metadata - if not, they're old
        const hasWorkflowConversations = conversationsArray.some(conv => conv.workflowTemplateId);
        
        if (hasWorkflowConversations) {
          conversationsArray.forEach(conv => {
            this.conversations.set(conv.id, conv);
          });
        } else {
          // Old data without workflow metadata, refresh with mock conversations
          console.log('🔄 Upgrading conversations with workflow support...');
          this.initializeMockConversations();
          localStorage.setItem(versionKey, currentVersion);
        }
      } else {
        // No stored data or version mismatch - initialize with mock conversations
        console.log('🎭 Initializing with mock workflow conversations...');
        this.initializeMockConversations();
        localStorage.setItem(versionKey, currentVersion);
      }
    } catch (error) {
      console.error('Failed to load conversations:', error);
      // Fallback to mock conversations
      this.initializeMockConversations();
    }
  }

  // Initialize mock conversations for demonstration
  private initializeMockConversations(): void {
    try {
      const mockConversations = mockConversationsService.generateMockConversations();
      mockConversations.forEach(conv => {
        this.conversations.set(conv.id, conv);
      });
      this.saveConversations();
    } catch (error) {
      console.error('Failed to initialize mock conversations:', error);
    }
  }

  // Save conversations to localStorage
  private saveConversations(): void {
    try {
      const conversationsArray = Array.from(this.conversations.values());
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(conversationsArray));
    } catch (error) {
      console.error('Failed to save conversations:', error);
    }
  }

  // Create a new conversation
  createConversation(
    title: string,
    category: ConversationCategory,
    contextType?: 'matter' | 'client',
    contextId?: string,
    contextName?: string
  ): Conversation {
    const conversation: Conversation = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      title,
      category,
      lastMessage: '',
      lastActivity: new Date().toISOString(),
      messageCount: 0,
      isStarred: false,
      contextType,
      contextId,
      contextName,
      messages: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.conversations.set(conversation.id, conversation);
    this.saveConversations();
    return conversation;
  }

  // Get all conversations as summaries
  getConversationSummaries(filters?: ConversationFilters): ConversationSummary[] {
    let summaries = Array.from(this.conversations.values()).map(conv => ({
      id: conv.id,
      title: conv.title,
      category: conv.category,
      lastMessage: conv.lastMessage,
      lastActivity: conv.lastActivity,
      messageCount: conv.messageCount,
      isStarred: conv.isStarred,
      contextType: conv.contextType,
      contextId: conv.contextId,
      contextName: conv.contextName,
      createdAt: conv.createdAt,
      updatedAt: conv.updatedAt,
      // Include workflow metadata
      workflowTemplateId: conv.workflowTemplateId,
      workflowExecutionId: conv.workflowExecutionId,
      workflowStatus: conv.workflowStatus,
      workflowCurrentStep: conv.workflowCurrentStep,
    }));

    // Apply filters
    if (filters) {
      if (filters.category) {
        summaries = summaries.filter(s => s.category === filters.category);
      }
      if (filters.starred) {
        summaries = summaries.filter(s => s.isStarred);
      }
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        summaries = summaries.filter(s => 
          s.title.toLowerCase().includes(searchLower) ||
          s.lastMessage.toLowerCase().includes(searchLower) ||
          (s.contextName && s.contextName.toLowerCase().includes(searchLower))
        );
      }
      if (filters.dateRange) {
        const startDate = new Date(filters.dateRange.start);
        const endDate = new Date(filters.dateRange.end);
        summaries = summaries.filter(s => {
          const convDate = new Date(s.lastActivity);
          return convDate >= startDate && convDate <= endDate;
        });
      }
    }

    // Sort by last activity (most recent first)
    return summaries.sort((a, b) => 
      new Date(b.lastActivity).getTime() - new Date(a.lastActivity).getTime()
    );
  }

  // Get a specific conversation
  getConversation(id: string): Conversation | null {
    return this.conversations.get(id) || null;
  }

  // Update conversation
  updateConversation(id: string, updates: Partial<Conversation>): boolean {
    const conversation = this.conversations.get(id);
    if (!conversation) return false;

    const updated = {
      ...conversation,
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    this.conversations.set(id, updated);
    this.saveConversations();
    return true;
  }

  // Add message to conversation
  addMessage(conversationId: string, message: ChatMessage): boolean {
    const conversation = this.conversations.get(conversationId);
    if (!conversation) return false;

    conversation.messages.push(message);
    conversation.messageCount = conversation.messages.length;
    conversation.lastMessage = message.content.text || 'File attachment';
    conversation.lastActivity = message.timestamp;
    conversation.updatedAt = new Date().toISOString();

    // Auto-generate title from first message if title is generic
    if (conversation.messages.length === 1 && conversation.title.startsWith('New Conversation')) {
      const messageText = message.content.text || '';
      if (messageText.length > 0) {
        conversation.title = messageText.length > 50 
          ? messageText.substring(0, 50) + '...'
          : messageText;
      }
    }

    this.conversations.set(conversationId, conversation);
    this.saveConversations();
    return true;
  }

  // Star/unstar conversation
  toggleStar(id: string): boolean {
    const conversation = this.conversations.get(id);
    if (!conversation) return false;

    conversation.isStarred = !conversation.isStarred;
    conversation.updatedAt = new Date().toISOString();

    this.conversations.set(id, conversation);
    this.saveConversations();
    return true;
  }

  // Delete conversation
  deleteConversation(id: string): boolean {
    const deleted = this.conversations.delete(id);
    if (deleted) {
      this.saveConversations();
    }
    return deleted;
  }

  // Get conversations by category
  getConversationsByCategory(): Record<ConversationCategory, ConversationSummary[]> {
    const summaries = this.getConversationSummaries();
    
    return {
      matters: summaries.filter(s => s.category === 'matters'),
      clients: summaries.filter(s => s.category === 'clients'),
      documents: summaries.filter(s => s.category === 'documents'),
      research: summaries.filter(s => s.category === 'research'),
      general: summaries.filter(s => s.category === 'general'),
    };
  }

  // Search conversations
  searchConversations(query: string): ConversationSummary[] {
    return this.getConversationSummaries({ search: query });
  }

  // Get recent conversations
  getRecentConversations(limit: number = 10): ConversationSummary[] {
    return this.getConversationSummaries().slice(0, limit);
  }

  // Auto-categorize conversation based on content
  autoCategorizMessage(message: string): ConversationCategory {
    const lowerMessage = message.toLowerCase();
    
    if (lowerMessage.includes('contract') || lowerMessage.includes('document') || 
        lowerMessage.includes('analyze') || lowerMessage.includes('review')) {
      return 'documents';
    }
    
    if (lowerMessage.includes('matter') || lowerMessage.includes('case') || 
        lowerMessage.includes('litigation') || lowerMessage.includes('trial')) {
      return 'matters';
    }
    
    if (lowerMessage.includes('client') || lowerMessage.includes('customer')) {
      return 'clients';
    }
    
    if (lowerMessage.includes('research') || lowerMessage.includes('precedent') || 
        lowerMessage.includes('citation') || lowerMessage.includes('law')) {
      return 'research';
    }
    
    return 'general';
  }

  // Export conversations
  exportConversations(): string {
    const conversations = Array.from(this.conversations.values());
    return JSON.stringify(conversations, null, 2);
  }

  // Import conversations
  importConversations(data: string): boolean {
    try {
      const conversations: Conversation[] = JSON.parse(data);
      conversations.forEach(conv => {
        this.conversations.set(conv.id, conv);
      });
      this.saveConversations();
      return true;
    } catch (error) {
      console.error('Failed to import conversations:', error);
      return false;
    }
  }

  // Clear all conversations
  clearAllConversations(): void {
    this.conversations.clear();
    localStorage.removeItem(this.STORAGE_KEY);
  }

  // Force re-initialize with fresh mock conversations
  reinitializeMockConversations(): void {
    this.conversations.clear();
    localStorage.removeItem(this.STORAGE_KEY);
    this.initializeMockConversations();
  }

  // Force refresh mock conversations (for development)
  forceRefreshMockConversations(): void {
    try {
      console.log('🔄 Force refreshing mock conversations...');
      this.conversations.clear();
      localStorage.removeItem(this.STORAGE_KEY);
      this.initializeMockConversations();
      console.log('✅ Mock conversations refreshed. Total conversations:', this.conversations.size);
    } catch (error) {
      console.error('❌ Error refreshing mock conversations:', error);
    }
  }

  // Get conversations with workflow integration
  getWorkflowConversations(): ConversationSummary[] {
    return this.getConversationSummaries().filter(conv => conv.workflowTemplateId);
  }

  // Get conversations by workflow status
  getConversationsByWorkflowStatus(status: 'not_started' | 'in_progress' | 'completed'): ConversationSummary[] {
    return this.getConversationSummaries().filter(conv => conv.workflowStatus === status);
  }

  // Get conversations for a specific workflow template
  getConversationsForWorkflow(templateId: string): ConversationSummary[] {
    return this.getConversationSummaries().filter(conv => conv.workflowTemplateId === templateId);
  }

  // Check if conversation has resumable workflow
  hasResumableWorkflow(conversationId: string): boolean {
    const conversation = this.getConversation(conversationId);
    return !!(conversation?.workflowTemplateId && conversation?.workflowStatus === 'in_progress');
  }
}

export const conversationService = new ConversationService();