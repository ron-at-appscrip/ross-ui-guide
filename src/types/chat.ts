export type MessageRole = 'user' | 'ai' | 'system';
export type MessageStatus = 'sending' | 'sent' | 'delivered' | 'read' | 'error';
export type AttachmentType = 'document' | 'image' | 'audio' | 'video' | 'link';

export interface Attachment {
  id: string;
  name: string;
  type: AttachmentType;
  size: number;
  url: string;
  mimeType: string;
  uploadedAt: string;
  thumbnail?: string;
}

export interface Document {
  id: string;
  name: string;
  type?: string;
  size?: number;
  url?: string;
  mimeType?: string;
  category?: string;
  tags?: string[];
  createdAt?: string;
  updatedAt?: string;
}

export interface MessageContent {
  text?: string;
  attachments?: Attachment[];
  metadata?: Record<string, any>;
}

export interface ChatMessage {
  id: string;
  role: MessageRole;
  content: MessageContent;
  timestamp: string;
  status: MessageStatus;
  contextId?: string; // Reference to matter or client
  threadId?: string;
  replyTo?: string;
  reactions?: MessageReaction[];
  editHistory?: MessageEdit[];
}

export interface MessageReaction {
  emoji: string;
  userId: string;
  timestamp: string;
}

export interface MessageEdit {
  content: MessageContent;
  timestamp: string;
  reason?: string;
}

export interface ChatThread {
  id: string;
  title: string;
  participants: string[];
  messages: ChatMessage[];
  createdAt: string;
  updatedAt: string;
  contextType?: 'matter' | 'client' | 'general';
  contextId?: string;
  archived: boolean;
  pinned: boolean;
  tags: string[];
}

export interface ChatContext {
  type: 'matter' | 'client' | 'general';
  id?: string;
  data?: any;
  recentActivity?: any[];
  relevantDocuments?: any[];
  upcomingDeadlines?: any[];
}

export interface TypingIndicator {
  userId: string;
  userName: string;
  timestamp: string;
}

export interface VoiceRecording {
  id: string;
  audioBlob: Blob;
  duration: number;
  transcript?: string;
  status: 'recording' | 'processing' | 'completed' | 'error';
}

export interface ChatSettings {
  theme: 'light' | 'dark' | 'system';
  notifications: boolean;
  soundEnabled: boolean;
  autoScroll: boolean;
  showTimestamps: boolean;
  compactMode: boolean;
  voiceInputEnabled: boolean;
  legalTerminologyMode: boolean;
}

export type ConversationCategory = 'matters' | 'clients' | 'documents' | 'research' | 'general';

export interface Conversation {
  id: string;
  title: string;
  category: ConversationCategory;
  lastMessage: string;
  lastActivity: string;
  messageCount: number;
  isStarred: boolean;
  contextType?: 'matter' | 'client' | 'general';
  contextId?: string;
  contextName?: string;
  messages: ChatMessage[];
  createdAt: string;
  updatedAt: string;
  // Workflow integration
  workflowTemplateId?: string;
  workflowExecutionId?: string;
  workflowStatus?: 'not_started' | 'in_progress' | 'completed';
  workflowCurrentStep?: number;
}

export interface ConversationSummary {
  id: string;
  title: string;
  category: ConversationCategory;
  lastMessage: string;
  lastActivity: string;
  messageCount: number;
  isStarred: boolean;
  contextType?: 'matter' | 'client' | 'general';
  contextId?: string;
  contextName?: string;
  createdAt: string;
  updatedAt: string;
  // Workflow integration
  workflowTemplateId?: string;
  workflowExecutionId?: string;
  workflowStatus?: 'not_started' | 'in_progress' | 'completed';
  workflowCurrentStep?: number;
}

export interface QuickAction {
  id: string;
  title: string;
  description: string;
  icon: string;
  color: string;
  action: string;
  category: string;
  prompt?: string;
}

export interface ConversationFilters {
  category?: ConversationCategory;
  search?: string;
  starred?: boolean;
  dateRange?: {
    start: string;
    end: string;
  };
}