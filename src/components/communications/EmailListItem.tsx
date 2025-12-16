
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Star, Paperclip, Clock, MoreVertical } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Email {
  id: number;
  sender: string;
  senderEmail: string;
  subject: string;
  preview: string;
  time: string;
  isUnread: boolean;
  isStarred: boolean;
  hasAttachment: boolean;
  priority: string;
  matter: string;
}

interface EmailListItemProps {
  email: Email;
  isSelected: boolean;
  onSelect: () => void;
}

const EmailListItem = ({ email, isSelected, onSelect }: EmailListItemProps) => {
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'border-l-red-500 bg-red-50/30';
      case 'medium': return 'border-l-yellow-500 bg-yellow-50/30';
      case 'low': return 'border-l-green-500 bg-green-50/30';
      default: return 'border-l-gray-300 bg-gray-50/30';
    }
  };

  return (
    <div
      onClick={onSelect}
      className={cn(
        "group relative border-l-4 p-4 hover:bg-muted/50 cursor-pointer transition-all duration-200",
        getPriorityColor(email.priority),
        isSelected && "bg-primary/5 border-l-primary",
        email.isUnread && "bg-background border-l-4"
      )}
    >
      <div className="space-y-3">
        {/* Header Row */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h4 className={cn(
                "font-medium text-sm truncate",
                email.isUnread ? "text-foreground" : "text-muted-foreground"
              )}>
                {email.sender}
              </h4>
              {email.isStarred && (
                <Star className="h-3 w-3 text-yellow-500 fill-yellow-500 flex-shrink-0" />
              )}
              {email.hasAttachment && (
                <Paperclip className="h-3 w-3 text-muted-foreground flex-shrink-0" />
              )}
            </div>
            <p className="text-xs text-muted-foreground truncate">{email.senderEmail}</p>
          </div>
          <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {email.time}
            </span>
            <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
              <MoreVertical className="h-3 w-3" />
            </Button>
          </div>
        </div>

        {/* Subject */}
        <div className="space-y-1">
          <h5 className={cn(
            "font-medium text-sm leading-tight line-clamp-1",
            email.isUnread ? "text-foreground" : "text-muted-foreground"
          )}>
            {email.subject}
          </h5>
          <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
            {email.preview}
          </p>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between gap-2">
          <Badge variant="outline" className="text-xs font-medium">
            {email.matter}
          </Badge>
          <div className="flex items-center gap-1">
            {email.priority === 'high' && (
              <Badge variant="destructive" className="text-xs">
                HIGH
              </Badge>
            )}
            {email.priority === 'medium' && (
              <Badge variant="secondary" className="text-xs">
                MEDIUM
              </Badge>
            )}
            {email.isUnread && (
              <div className="w-2 h-2 bg-primary rounded-full"></div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmailListItem;
