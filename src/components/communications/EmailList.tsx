
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Filter, MoreVertical, Star, Paperclip, Clock } from 'lucide-react';
import EmailListItem from './EmailListItem';

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

interface EmailListProps {
  emails: Email[];
  selectedEmail: number | null;
  onEmailSelect: (id: number) => void;
}

const EmailList = ({ emails, selectedEmail, onEmailSelect }: EmailListProps) => {
  return (
    <Card className="h-fit">
      <CardHeader className="pb-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-2">
            <div>
              <CardTitle className="text-lg font-semibold">Inbox</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                {emails.filter(e => e.isUnread).length} unread messages
              </p>
            </div>
          </div>
          <Badge variant="outline" className="text-xs font-medium w-fit">
            {emails.length} Total
          </Badge>
        </div>
        
        {/* Search and Filter */}
        <div className="flex gap-2 mt-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search messages..."
              className="pl-10 text-sm"
            />
          </div>
          <Button variant="outline" size="sm" className="hover-glass">
            <Filter className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="p-0">
        <div className="space-y-1">
          {emails.map((email) => (
            <EmailListItem
              key={email.id}
              email={email}
              isSelected={selectedEmail === email.id}
              onSelect={() => onEmailSelect(email.id)}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default EmailList;
