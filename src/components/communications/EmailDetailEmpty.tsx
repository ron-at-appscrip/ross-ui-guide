
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Mail, Inbox } from 'lucide-react';

const EmailDetailEmpty = () => {
  return (
    <Card className="h-full flex items-center justify-center">
      <CardContent className="p-12 text-center">
        <div className="space-y-6">
          <div className="relative">
            <div className="p-6 bg-muted/30 rounded-full w-fit mx-auto">
              <Mail className="h-12 w-12 text-muted-foreground/50" />
            </div>
            <div className="absolute -top-1 -right-1 p-2 bg-primary/10 rounded-full">
              <Inbox className="h-4 w-4 text-primary" />
            </div>
          </div>
          
          <div className="space-y-2">
            <h3 className="text-heading-4 font-semibold text-foreground">
              Select a Message
            </h3>
            <p className="text-body text-muted-foreground max-w-md mx-auto leading-relaxed">
              Choose an email from your inbox to view its content, attachments, 
              and respond to your clients and colleagues.
            </p>
          </div>
          
          <div className="pt-4">
            <div className="inline-flex items-center gap-2 text-sm text-muted-foreground bg-muted/30 px-4 py-2 rounded-lg">
              <div className="w-2 h-2 bg-primary/60 rounded-full animate-pulse"></div>
              Waiting for selection...
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default EmailDetailEmpty;
