import React, { useState, useRef, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ChatMessage } from './ChatMessage';
import { ChatInput } from './ChatInput';
import { TypingIndicator } from './TypingIndicator';
import { ChatContext } from './smart/ContextProvider';
import { ProactiveSuggestions } from './smart/ProactiveSuggestions';
import { ChatMessage as ChatMessageType, ChatThread, ChatSettings } from '@/types/chat';
import { cn } from '@/lib/utils';

interface ChatInterfaceProps {
  thread?: ChatThread;
  context?: ChatContext;
  settings?: Partial<ChatSettings>;
  className?: string;
  onSendMessage?: (content: string, attachments?: File[]) => void;
  onTyping?: (isTyping: boolean) => void;
}

const defaultSettings: ChatSettings = {
  theme: 'light',
  notifications: true,
  soundEnabled: true,
  autoScroll: true,
  showTimestamps: true,
  compactMode: false,
  voiceInputEnabled: true,
  legalTerminologyMode: true,
};

const mockMessages: ChatMessageType[] = [
  {
    id: '1',
    role: 'ai',
    content: {
      text: 'Hello! I\'m your AI legal assistant. I can help you with case research, document analysis, contract review, and legal strategy. What would you like to work on today?',
    },
    timestamp: new Date(Date.now() - 300000).toISOString(),
    status: 'delivered',
  },
  {
    id: '2',
    role: 'user',
    content: {
      text: 'I need help analyzing a contract for potential risks.',
    },
    timestamp: new Date(Date.now() - 240000).toISOString(),
    status: 'read',
  },
  {
    id: '3',
    role: 'ai',
    content: {
      text: 'I\'d be happy to help you analyze a contract for potential risks. Please upload the contract document, and I\'ll provide a comprehensive risk assessment including:\n\n• **Risk identification** with severity levels\n• **Key terms analysis** with highlighted concerns\n• **Compliance review** against standard practices\n• **Actionable recommendations** for mitigation\n\nYou can drag and drop the file here or use the attachment button below.',
    },
    timestamp: new Date(Date.now() - 180000).toISOString(),
    status: 'delivered',
  },
];

export const ChatInterface: React.FC<ChatInterfaceProps> = ({
  thread,
  context,
  settings: userSettings = {},
  className,
  onSendMessage,
  onTyping,
}) => {
  const [messages, setMessages] = useState<ChatMessageType[]>(thread?.messages || []);
  const [isTyping, setIsTyping] = useState(false);
  const [settings] = useState<ChatSettings>({ ...defaultSettings, ...userSettings });
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    if (settings.autoScroll) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  // Update messages when thread changes
  useEffect(() => {
    if (thread) {
      setMessages(thread.messages);
    }
  }, [thread]);

  const handleSendMessage = async (content: string, attachments?: File[]) => {
    onSendMessage?.(content, attachments);
  };

  const generateAIResponse = (userMessage: string, attachments?: File[]): string => {
    if (attachments && attachments.length > 0) {
      return `I've received your ${attachments.length > 1 ? 'documents' : 'document'}: **${attachments.map(f => f.name).join(', ')}**. Let me analyze ${attachments.length > 1 ? 'them' : 'it'} for you.\n\n*Processing document analysis...*\n\nI'll provide a detailed risk assessment, key terms analysis, and recommendations within a few moments.`;
    }

    const responses = [
      'I understand you need assistance with that. Let me research the relevant legal precedents and provide you with a comprehensive analysis.',
      'That\'s an interesting legal question. Based on current jurisprudence and applicable statutes, here are the key considerations...',
      'I can help you with that matter. Let me pull together the relevant case law and statutory requirements for your jurisdiction.',
    ];

    return responses[Math.floor(Math.random() * responses.length)];
  };

  const handleTyping = (typing: boolean) => {
    onTyping?.(typing);
  };

  return (
    <div className={cn('flex flex-col h-full', className)}>
      {/* Chat Header - Enhanced */}
      <div className="flex-shrink-0 px-8 py-6 border-b border-border bg-background">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-light text-foreground mb-1">AI Legal Assistant</h2>
            <p className="text-sm text-muted-foreground">
              {context?.type === 'matter' && context?.data?.title 
                ? `Discussing: ${context.data.title}`
                : context?.type === 'client' && context?.data?.name
                ? `Client context: ${context.data.name}`
                : 'Ready to assist with your legal questions'
              }
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1 bg-green-50 text-green-700 rounded-full text-xs font-medium">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              Online
            </div>
          </div>
        </div>
      </div>

      {/* Proactive Suggestions */}
      {context && (
        <div className="flex-shrink-0 px-6 py-2 border-b bg-gray-50">
          <ProactiveSuggestions context={context} />
        </div>
      )}

      {/* Messages Area */}
      <div className="flex-1 relative overflow-hidden bg-gradient-to-b from-background to-muted/20">
        <ScrollArea ref={scrollAreaRef} className="h-full px-8 py-6">
          <div className="max-w-4xl mx-auto space-y-8">
            {messages.map((message) => (
              <ChatMessage
                key={message.id}
                message={message}
                showTimestamp={settings.showTimestamps}
                compactMode={settings.compactMode}
              />
            ))}
            
            {isTyping && (
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="text-sm font-medium text-primary">AI</span>
                </div>
                <div className="flex-1">
                  <TypingIndicator />
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
            {/* Bottom spacing for better UX */}
            <div className="h-4" />
          </div>
        </ScrollArea>
      </div>

      {/* Chat Input */}
      <div className="flex-shrink-0 border-t border-border bg-background">
        <ChatInput
          onSendMessage={handleSendMessage}
          onTyping={handleTyping}
          voiceEnabled={settings.voiceInputEnabled}
          legalTerminologyMode={settings.legalTerminologyMode}
          context={context}
        />
      </div>
    </div>
  );
};