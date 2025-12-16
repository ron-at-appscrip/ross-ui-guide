import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface TypingIndicatorProps {
  userName?: string;
  userAvatar?: string;
  className?: string;
  compact?: boolean;
}

export const TypingIndicator: React.FC<TypingIndicatorProps> = ({
  userName = 'AI Assistant',
  userAvatar,
  className,
  compact = false,
}) => {
  return (
    <div className={cn('flex items-end gap-3', className)}>
      {/* Avatar */}
      <Avatar className="h-8 w-8 flex-shrink-0">
        <AvatarImage src={userAvatar} />
        <AvatarFallback className="bg-blue-600 text-white text-xs font-semibold">
          AI
        </AvatarFallback>
      </Avatar>

      {/* Typing Bubble */}
      <Card className="px-4 py-3 bg-white border-gray-200 shadow-sm max-w-[80px]">
        <div className="flex items-center gap-1">
          <div className="flex space-x-1">
            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
          </div>
        </div>
      </Card>

      {/* Optional Status Text */}
      {!compact && (
        <div className="text-xs text-gray-500 self-center ml-2">
          {userName} is typing...
        </div>
      )}
    </div>
  );
};