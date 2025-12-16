
import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { 
  Reply, 
  ReplyAll, 
  Forward, 
  Archive, 
  Trash2, 
  Star, 
  Paperclip,
  Clock,
  MoreHorizontal,
  Calendar,
  User
} from 'lucide-react';

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

interface EmailDetailProps {
  email: Email;
}

const EmailDetail = ({ email }: EmailDetailProps) => {
  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'high': 
        return <Badge variant="destructive" className="text-xs">HIGH PRIORITY</Badge>;
      case 'medium': 
        return <Badge variant="secondary" className="text-xs">MEDIUM PRIORITY</Badge>;
      case 'low': 
        return <Badge variant="outline" className="text-xs">LOW PRIORITY</Badge>;
      default: 
        return null;
    }
  };

  return (
    <Card className="h-fit">
      <CardHeader className="pb-6">
        {/* Action Buttons */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div className="flex flex-wrap gap-2">
            <Button size="sm" className="hover-glass">
              <Reply className="h-4 w-4 mr-2" />
              Reply
            </Button>
            <Button variant="outline" size="sm" className="hover-glass">
              <ReplyAll className="h-4 w-4 mr-2" />
              Reply All
            </Button>
            <Button variant="outline" size="sm" className="hover-glass">
              <Forward className="h-4 w-4 mr-2" />
              Forward
            </Button>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="hover-glass">
              <Archive className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" className="hover-glass">
              <Star className={`h-4 w-4 ${email.isStarred ? 'text-yellow-500 fill-yellow-500' : ''}`} />
            </Button>
            <Button variant="outline" size="sm" className="hover-glass">
              <Trash2 className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" className="hover-glass">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Email Header */}
        <div className="space-y-4">
          <div className="flex items-start justify-between gap-4">
            <h1 className="text-heading-3 font-semibold leading-tight flex-1">
              {email.subject}
            </h1>
            {getPriorityBadge(email.priority)}
          </div>

          <div className="flex items-center gap-4">
            <Avatar className="h-10 w-10">
              <AvatarFallback className="bg-primary/10 text-primary">
                {getInitials(email.sender)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 space-y-1">
              <div className="flex items-center gap-2">
                <span className="font-medium text-sm">{email.sender}</span>
                <span className="text-xs text-muted-foreground">
                  &lt;{email.senderEmail}&gt;
                </span>
              </div>
              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {email.time}
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {email.matter}
                </span>
                {email.hasAttachment && (
                  <span className="flex items-center gap-1">
                    <Paperclip className="h-3 w-3" />
                    Attachment
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </CardHeader>

      <Separator />

      <CardContent className="pt-6">
        <div className="space-y-6">
          {/* Email Content */}
          <div className="prose prose-sm max-w-none">
            <p className="text-body leading-relaxed">
              Dear Legal Team,
            </p>
            <p className="text-body leading-relaxed">
              I hope this email finds you well. I am writing to follow up on the contract review 
              we discussed during our meeting last week. The attached document contains the latest 
              version of the service agreement that requires your immediate attention.
            </p>
            <p className="text-body leading-relaxed">
              The key changes include:
            </p>
            <ul className="list-disc ml-6 space-y-1">
              <li>Updated termination clauses in Section 4.2</li>
              <li>Revised payment terms and conditions</li>
              <li>New intellectual property provisions</li>
              <li>Enhanced liability limitations</li>
            </ul>
            <p className="text-body leading-relaxed">
              Please review these changes and provide your feedback by the end of this week. 
              If you have any questions or need clarification on any of the provisions, 
              please don't hesitate to reach out.
            </p>
            <p className="text-body leading-relaxed">
              Thank you for your prompt attention to this matter.
            </p>
            <p className="text-body leading-relaxed">
              Best regards,<br />
              {email.sender}
            </p>
          </div>

          {/* Attachments */}
          {email.hasAttachment && (
            <div className="space-y-2">
              <h3 className="font-medium text-sm">Attachments</h3>
              <Card className="p-4 hover-glass cursor-pointer">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-50 rounded-lg">
                    <Paperclip className="h-4 w-4 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-sm">Service_Agreement_v2.1.pdf</p>
                    <p className="text-xs text-muted-foreground">2.4 MB • PDF Document</p>
                  </div>
                  <Button variant="outline" size="sm">
                    Download
                  </Button>
                </div>
              </Card>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default EmailDetail;
