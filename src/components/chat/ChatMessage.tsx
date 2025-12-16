import React, { useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { LegalCitationCard } from './legal/LegalCitationCard';
import { RiskAssessmentPanel } from './legal/RiskAssessmentPanel';
import { DocumentAnalysisCard } from './legal/DocumentAnalysisCard';
import { ActionSuggestions } from './legal/ActionSuggestions';
import { ChatMessage as ChatMessageType, Attachment } from '@/types/chat';
import { Check, CheckCheck, Clock, AlertCircle, Copy, Download, Eye, Volume2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ChatMessageProps {
  message: ChatMessageType;
  showTimestamp?: boolean;
  compactMode?: boolean;
  className?: string;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({
  message,
  showTimestamp = true,
  compactMode = false,
  className,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const isUser = message.role === 'user';
  const isAI = message.role === 'ai';

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();
    
    if (isToday) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    return date.toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  const getStatusIcon = () => {
    switch (message.status) {
      case 'sending':
        return <Clock className="h-3 w-3 text-gray-400" />;
      case 'sent':
        return <Check className="h-3 w-3 text-gray-400" />;
      case 'delivered':
        return <CheckCheck className="h-3 w-3 text-blue-500" />;
      case 'read':
        return <CheckCheck className="h-3 w-3 text-blue-600" />;
      case 'error':
        return <AlertCircle className="h-3 w-3 text-red-500" />;
      default:
        return null;
    }
  };

  const renderAttachment = (attachment: Attachment) => {
    const isImage = attachment.type === 'image';
    
    return (
      <div key={attachment.id} className="border rounded-lg p-3 bg-gray-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <div className={cn(
              'flex-shrink-0 w-8 h-8 rounded flex items-center justify-center text-white text-xs font-medium',
              isImage ? 'bg-green-500' : 'bg-blue-500'
            )}>
              {isImage ? '📷' : '📄'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">{attachment.name}</p>
              <p className="text-xs text-gray-500">
                {(attachment.size / 1024 / 1024).toFixed(1)} MB
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1 flex-shrink-0">
            {isImage && (
              <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                <Eye className="h-4 w-4" />
              </Button>
            )}
            <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
              <Download className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        {isImage && attachment.thumbnail && (
          <div className="mt-2">
            <img 
              src={attachment.thumbnail} 
              alt={attachment.name}
              className="max-w-full h-auto rounded border max-h-32 object-cover"
            />
          </div>
        )}
      </div>
    );
  };

  const formatMessageText = (text: string) => {
    // Convert markdown-like formatting to JSX
    return text.split('\n').map((line, index) => {
      let formattedLine = line;
      
      // Bold text
      formattedLine = formattedLine.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
      
      // Italic text
      formattedLine = formattedLine.replace(/\*(.*?)\*/g, '<em>$1</em>');
      
      // Bullet points
      if (formattedLine.startsWith('• ')) {
        return (
          <div key={index} className="flex items-start gap-2 ml-4">
            <span className="text-blue-600 font-bold">•</span>
            <span dangerouslySetInnerHTML={{ __html: formattedLine.substring(2) }} />
          </div>
        );
      }
      
      return (
        <p key={index} dangerouslySetInnerHTML={{ __html: formattedLine }} className={line === '' ? 'h-2' : ''} />
      );
    });
  };

  return (
    <div className={cn(
      'flex gap-3',
      isUser ? 'justify-end' : 'justify-start',
      compactMode ? 'mb-2' : 'mb-4',
      className
    )}>
      {/* AI Avatar */}
      {isAI && (
        <div className="flex-shrink-0">
          <Avatar className="h-8 w-8">
            <AvatarImage src="/ai-avatar.png" />
            <AvatarFallback className="bg-blue-600 text-white text-xs font-semibold">
              AI
            </AvatarFallback>
          </Avatar>
        </div>
      )}

      {/* Message Content */}
      <div className={cn(
        'max-w-[80%] space-y-2',
        isUser ? 'order-1' : 'order-2'
      )}>
        {/* Message Bubble */}
        <Card className={cn(
          'p-4 shadow-sm border',
          isUser 
            ? 'bg-blue-600 text-white border-blue-600' 
            : 'bg-white text-gray-900 border-gray-200',
          !compactMode && 'min-h-[48px]'
        )}>
          {/* Message Text */}
          {message.content.text && (
            <div className={cn(
              'prose prose-sm max-w-none',
              isUser ? 'prose-invert' : '',
              '[&>p]:mb-2 [&>p:last-child]:mb-0'
            )}>
              {formatMessageText(message.content.text)}
            </div>
          )}

          {/* Attachments */}
          {message.content.attachments && message.content.attachments.length > 0 && (
            <div className="mt-3 space-y-2">
              {message.content.attachments.map(renderAttachment)}
            </div>
          )}
        </Card>

        {/* Legal Components for AI messages */}
        {isAI && message.content.metadata && (
          <div className="space-y-2">
            {message.content.metadata.citations && (
              <LegalCitationCard citations={message.content.metadata.citations} />
            )}
            
            {message.content.metadata.riskAssessment && (
              <RiskAssessmentPanel riskAssessment={message.content.metadata.riskAssessment} />
            )}
            
            {message.content.metadata.documentAnalysis && (
              <DocumentAnalysisCard analysis={message.content.metadata.documentAnalysis} />
            )}
            
            {message.content.metadata.suggestions && (
              <ActionSuggestions suggestions={message.content.metadata.suggestions} />
            )}
          </div>
        )}

        {/* Message Footer */}
        <div className={cn(
          'flex items-center gap-2 text-xs',
          isUser ? 'justify-end text-gray-500' : 'justify-start text-gray-500'
        )}>
          {showTimestamp && (
            <span>{formatTimestamp(message.timestamp)}</span>
          )}
          
          {isUser && (
            <div className="flex items-center gap-1">
              {getStatusIcon()}
            </div>
          )}
          
          {isAI && (
            <div className="flex items-center gap-1">
              <Button size="sm" variant="ghost" className="h-6 w-6 p-0">
                <Copy className="h-3 w-3" />
              </Button>
              <Button size="sm" variant="ghost" className="h-6 w-6 p-0">
                <Volume2 className="h-3 w-3" />
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* User Avatar */}
      {isUser && (
        <div className="flex-shrink-0 order-2">
          <Avatar className="h-8 w-8">
            <AvatarImage src="/user-avatar.png" />
            <AvatarFallback className="bg-gray-600 text-white text-xs font-semibold">
              U
            </AvatarFallback>
          </Avatar>
        </div>
      )}
    </div>
  );
};