
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Send, Paperclip, Save, Bot, Clock, Users } from 'lucide-react';

const EmailComposer = () => {
  const [to, setTo] = useState('');
  const [cc, setCc] = useState('');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [showAISuggestions, setShowAISuggestions] = useState(false);

  const aiSuggestions = [
    "Thank you for your inquiry regarding...",
    "I hope this email finds you well. I wanted to follow up on...",
    "Please find attached the requested documents...",
    "I am writing to confirm our meeting scheduled for..."
  ];

  const templates = [
    { name: "Client Meeting Follow-up", category: "Meetings" },
    { name: "Document Request", category: "Discovery" },
    { name: "Settlement Proposal", category: "Negotiations" },
    { name: "Case Status Update", category: "Updates" }
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
      {/* Composer */}
      <div className="lg:col-span-3">
        <Card glass>
          <CardHeader>
            <CardTitle className="text-heading-3">Compose Email</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2">
                <label className="text-form-label font-medium mb-2 block">To</label>
                <Input
                  placeholder="Enter recipient email addresses..."
                  value={to}
                  onChange={(e) => setTo(e.target.value)}
                  className="glass border-glass"
                />
              </div>
              <div>
                <label className="text-form-label font-medium mb-2 block">CC</label>
                <Input
                  placeholder="CC recipients..."
                  value={cc}
                  onChange={(e) => setCc(e.target.value)}
                  className="glass border-glass"
                />
              </div>
            </div>

            <div>
              <label className="text-form-label font-medium mb-2 block">Subject</label>
              <Input
                placeholder="Email subject..."
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="glass border-glass"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-form-label font-medium">Message</label>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowAISuggestions(!showAISuggestions)}
                  className="glass border-glass"
                >
                  <Bot className="h-4 w-4 mr-2" />
                  AI Assist
                </Button>
              </div>
              <Textarea
                placeholder="Type your message here..."
                value={body}
                onChange={(e) => setBody(e.target.value)}
                className="min-h-[200px] glass border-glass"
              />
            </div>

            {showAISuggestions && (
              <Card glass className="bg-blue-50/10">
                <CardContent className="p-4">
                  <h4 className="text-form-label font-medium mb-2 flex items-center">
                    <Bot className="h-4 w-4 mr-2" />
                    AI Suggestions
                  </h4>
                  <div className="space-y-2">
                    {aiSuggestions.map((suggestion, index) => (
                      <div
                        key={index}
                        className="p-2 rounded-md bg-background/50 cursor-pointer hover:bg-background/80 transition-colors text-body"
                        onClick={() => setBody(body + suggestion)}
                      >
                        {suggestion}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            <div className="flex items-center justify-between pt-4 border-t border-glass">
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" className="glass border-glass">
                  <Paperclip className="h-4 w-4 mr-2" />
                  Attach
                </Button>
                <Button variant="outline" size="sm" className="glass border-glass">
                  <Clock className="h-4 w-4 mr-2" />
                  Schedule
                </Button>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" className="glass border-glass">
                  <Save className="h-4 w-4 mr-2" />
                  Save Draft
                </Button>
                <Button>
                  <Send className="h-4 w-4 mr-2" />
                  Send Email
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Sidebar */}
      <div className="space-y-6">
        {/* Templates */}
        <Card glass>
          <CardHeader>
            <CardTitle className="text-heading-4">Email Templates</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {templates.map((template, index) => (
              <div
                key={index}
                className="p-3 rounded-md glass hover:bg-muted/50 cursor-pointer transition-colors"
              >
                <h5 className="text-form-label font-medium">{template.name}</h5>
                <Badge variant="secondary" className="text-xs mt-1">
                  {template.category}
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Recent Contacts */}
        <Card glass>
          <CardHeader>
            <CardTitle className="text-heading-4 flex items-center">
              <Users className="h-4 w-4 mr-2" />
              Recent Contacts
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {['John Smith', 'Sarah Wilson', 'Mike Davis', 'Lisa Johnson'].map((contact, index) => (
              <div
                key={index}
                className="flex items-center gap-2 p-2 rounded-md hover:bg-muted/50 cursor-pointer transition-colors"
                onClick={() => setTo(to + (to ? ', ' : '') + `${contact.toLowerCase().replace(' ', '.')}@example.com`)}
              >
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="text-xs font-medium">{contact.split(' ').map(n => n[0]).join('')}</span>
                </div>
                <span className="text-body">{contact}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default EmailComposer;
