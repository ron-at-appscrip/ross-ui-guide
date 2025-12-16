import React, { useState, useRef } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Send, 
  Paperclip, 
  Clock, 
  Star, 
  Plus,
  X,
  FileText,
  Image,
  File,
  Loader2
} from 'lucide-react';
import { useEmail, useEmailTemplates } from '@/hooks/useRealEmail';
import { useToast } from '@/components/ui/use-toast';

interface EmailAttachment {
  id: string;
  file: File;
  name: string;
  size: number;
  type: string;
}

interface EmailRecipient {
  email: string;
  name?: string;
  type: 'to' | 'cc' | 'bcc';
}

interface RealEmailComposerProps {
  initialTo?: string[];
  initialSubject?: string;
  initialContent?: string;
  clientId?: string;
  clientName?: string;
  matterId?: string;
  matterName?: string;
  onSent?: () => void;
  className?: string;
}

export const RealEmailComposer: React.FC<RealEmailComposerProps> = ({
  initialTo = [],
  initialSubject = '',
  initialContent = '',
  clientId,
  clientName,
  matterId,
  matterName,
  onSent,
  className
}) => {
  // Form state
  const [recipients, setRecipients] = useState<EmailRecipient[]>(
    initialTo.map(email => ({ email, type: 'to' }))
  );
  const [subject, setSubject] = useState(initialSubject);
  const [content, setContent] = useState(initialContent);
  const [priority, setPriority] = useState<'low' | 'medium' | 'high' | 'urgent'>('medium');
  const [attachments, setAttachments] = useState<EmailAttachment[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [scheduleDateTime, setScheduleDateTime] = useState<string>('');
  
  // UI state
  const [showCc, setShowCc] = useState(false);
  const [showBcc, setShowBcc] = useState(false);
  const [showSchedule, setShowSchedule] = useState(false);
  const [isTemplateDialogOpen, setIsTemplateDialogOpen] = useState(false);
  
  // Refs
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Hooks
  const { toast } = useToast();
  const { sendEmail, isSendingEmail } = useEmail();
  const { data: templates, isLoading: loadingTemplates } = useEmailTemplates();

  // Handlers
  const handleAddRecipient = (email: string, type: 'to' | 'cc' | 'bcc') => {
    if (email && !recipients.find(r => r.email === email)) {
      setRecipients([...recipients, { email, type }]);
    }
  };

  const handleRemoveRecipient = (email: string) => {
    setRecipients(recipients.filter(r => r.email !== email));
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    const newAttachments = files.map((file, index) => ({
      id: `${Date.now()}-${index}`,
      file,
      name: file.name,
      size: file.size,
      type: file.type
    }));
    
    setAttachments([...attachments, ...newAttachments]);
  };

  const handleRemoveAttachment = (id: string) => {
    setAttachments(attachments.filter(att => att.id !== id));
  };

  const handleTemplateSelect = (templateId: string) => {
    const template = templates?.find(t => t.id === templateId);
    if (template) {
      setSubject(template.subject);
      setContent(template.html_content);
      setSelectedTemplate(templateId);
      setIsTemplateDialogOpen(false);
    }
  };

  const handleSend = async () => {
    if (recipients.length === 0) {
      toast({
        title: "Recipients required",
        description: "Please add at least one recipient",
        variant: "destructive"
      });
      return;
    }

    if (!subject.trim()) {
      toast({
        title: "Subject required",
        description: "Please enter an email subject",
        variant: "destructive"
      });
      return;
    }

    if (!content.trim()) {
      toast({
        title: "Content required",
        description: "Please enter email content",
        variant: "destructive"
      });
      return;
    }

    try {
      // Convert attachments to the format expected by the email service
      const emailAttachments = await Promise.all(
        attachments.map(async (att) => ({
          filename: att.name,
          content: await fileToBase64(att.file),
          contentType: att.type
        }))
      );

      // Send email
      sendEmail({
        to: recipients.filter(r => r.type === 'to').map(r => r.email),
        cc: recipients.filter(r => r.type === 'cc').map(r => r.email),
        bcc: recipients.filter(r => r.type === 'bcc').map(r => r.email),
        subject,
        htmlContent: convertToHtml(content),
        textContent: content,
        clientId,
        matterId,
        priority,
        attachments: emailAttachments.length > 0 ? emailAttachments : undefined
      });

      // Reset form on success
      setRecipients([]);
      setSubject('');
      setContent('');
      setAttachments([]);
      setSelectedTemplate('');
      setPriority('medium');
      
      onSent?.();
    } catch (error) {
      console.error('Error sending email:', error);
    }
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const result = reader.result as string;
        const base64 = result.split(',')[1];
        resolve(base64);
      };
      reader.onerror = error => reject(error);
    });
  };

  const convertToHtml = (text: string): string => {
    return text
      .replace(/\n\n/g, '</p><p>')
      .replace(/\n/g, '<br>')
      .replace(/^(.*)$/, '<p>$1</p>');
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (type: string) => {
    if (type.startsWith('image/')) return <Image className="h-4 w-4" />;
    if (type.includes('pdf')) return <FileText className="h-4 w-4" />;
    return <File className="h-4 w-4" />;
  };

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Compose Email</CardTitle>
          <div className="flex items-center gap-2">
            <Dialog open={isTemplateDialogOpen} onOpenChange={setIsTemplateDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  <FileText className="h-4 w-4 mr-2" />
                  Templates
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Email Templates</DialogTitle>
                  <DialogDescription>
                    Choose a template to get started with your email
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  {loadingTemplates ? (
                    <div className="flex items-center justify-center py-4">
                      <Loader2 className="h-4 w-4 animate-spin" />
                    </div>
                  ) : (
                    templates?.map((template) => (
                      <div
                        key={template.id}
                        className="p-3 border rounded-lg cursor-pointer hover:bg-gray-50"
                        onClick={() => handleTemplateSelect(template.id)}
                      >
                        <div className="font-medium">{template.name}</div>
                        <div className="text-sm text-gray-500">{template.subject}</div>
                        <Badge variant="secondary" className="mt-1">
                          {template.template_type}
                        </Badge>
                      </div>
                    ))
                  )}
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Recipients */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Label htmlFor="to">To:</Label>
            <div className="flex-1 flex flex-wrap gap-1">
              {recipients.filter(r => r.type === 'to').map((recipient) => (
                <Badge key={recipient.email} variant="secondary" className="flex items-center gap-1">
                  {recipient.email}
                  <X
                    className="h-3 w-3 cursor-pointer hover:text-red-500"
                    onClick={() => handleRemoveRecipient(recipient.email)}
                  />
                </Badge>
              ))}
              <Input
                id="to"
                placeholder="Enter email address..."
                className="flex-1 min-w-[200px] border-none shadow-none p-0 h-auto"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ',') {
                    e.preventDefault();
                    const email = (e.target as HTMLInputElement).value.trim();
                    if (email) {
                      handleAddRecipient(email, 'to');
                      (e.target as HTMLInputElement).value = '';
                    }
                  }
                }}
              />
            </div>
            <div className="flex gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowCc(!showCc)}
                className={showCc ? 'text-blue-600' : ''}
              >
                Cc
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowBcc(!showBcc)}
                className={showBcc ? 'text-blue-600' : ''}
              >
                Bcc
              </Button>
            </div>
          </div>

          {/* CC Recipients */}
          {showCc && (
            <div className="flex items-center gap-2">
              <Label htmlFor="cc" className="w-8">Cc:</Label>
              <div className="flex-1 flex flex-wrap gap-1">
                {recipients.filter(r => r.type === 'cc').map((recipient) => (
                  <Badge key={recipient.email} variant="outline" className="flex items-center gap-1">
                    {recipient.email}
                    <X
                      className="h-3 w-3 cursor-pointer hover:text-red-500"
                      onClick={() => handleRemoveRecipient(recipient.email)}
                    />
                  </Badge>
                ))}
                <Input
                  id="cc"
                  placeholder="Enter CC email..."
                  className="flex-1 min-w-[200px] border-none shadow-none p-0 h-auto"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ',') {
                      e.preventDefault();
                      const email = (e.target as HTMLInputElement).value.trim();
                      if (email) {
                        handleAddRecipient(email, 'cc');
                        (e.target as HTMLInputElement).value = '';
                      }
                    }
                  }}
                />
              </div>
            </div>
          )}

          {/* BCC Recipients */}
          {showBcc && (
            <div className="flex items-center gap-2">
              <Label htmlFor="bcc" className="w-8">Bcc:</Label>
              <div className="flex-1 flex flex-wrap gap-1">
                {recipients.filter(r => r.type === 'bcc').map((recipient) => (
                  <Badge key={recipient.email} variant="outline" className="flex items-center gap-1">
                    {recipient.email}
                    <X
                      className="h-3 w-3 cursor-pointer hover:text-red-500"
                      onClick={() => handleRemoveRecipient(recipient.email)}
                    />
                  </Badge>
                ))}
                <Input
                  id="bcc"
                  placeholder="Enter BCC email..."
                  className="flex-1 min-w-[200px] border-none shadow-none p-0 h-auto"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ',') {
                      e.preventDefault();
                      const email = (e.target as HTMLInputElement).value.trim();
                      if (email) {
                        handleAddRecipient(email, 'bcc');
                        (e.target as HTMLInputElement).value = '';
                      }
                    }
                  }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Subject */}
        <div className="space-y-2">
          <Label htmlFor="subject">Subject:</Label>
          <Input
            id="subject"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="Enter email subject..."
          />
        </div>

        {/* Priority and Options */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Label>Priority:</Label>
            <Select value={priority} onValueChange={(value: any) => setPriority(value)}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="urgent">Urgent</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowSchedule(!showSchedule)}
            className={showSchedule ? 'text-blue-600' : ''}
          >
            <Clock className="h-4 w-4 mr-2" />
            Schedule
          </Button>
        </div>

        {/* Schedule DateTime */}
        {showSchedule && (
          <div className="space-y-2">
            <Label htmlFor="schedule">Send at:</Label>
            <Input
              id="schedule"
              type="datetime-local"
              value={scheduleDateTime}
              onChange={(e) => setScheduleDateTime(e.target.value)}
            />
          </div>
        )}

        {/* Content */}
        <div className="space-y-2">
          <Label htmlFor="content">Message:</Label>
          <Textarea
            id="content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Type your message here..."
            rows={12}
          />
        </div>

        {/* Attachments */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label>Attachments:</Label>
            <Button
              variant="outline"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
            >
              <Paperclip className="h-4 w-4 mr-2" />
              Add Files
            </Button>
          </div>
          
          <input
            ref={fileInputRef}
            type="file"
            multiple
            className="hidden"
            onChange={handleFileSelect}
          />

          {attachments.length > 0 && (
            <div className="grid grid-cols-1 gap-2">
              {attachments.map((attachment) => (
                <div
                  key={attachment.id}
                  className="flex items-center gap-3 p-2 border rounded-lg"
                >
                  {getFileIcon(attachment.type)}
                  <div className="flex-1">
                    <div className="font-medium text-sm">{attachment.name}</div>
                    <div className="text-xs text-gray-500">
                      {formatFileSize(attachment.size)}
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveAttachment(attachment.id)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Context Info */}
        {(clientName || matterName) && (
          <div className="p-3 bg-blue-50 rounded-lg">
            <div className="text-sm font-medium text-blue-900">Context:</div>
            {clientName && (
              <div className="text-sm text-blue-700">Client: {clientName}</div>
            )}
            {matterName && (
              <div className="text-sm text-blue-700">Matter: {matterName}</div>
            )}
          </div>
        )}

        {/* Send Button */}
        <div className="flex justify-end">
          <Button onClick={handleSend} disabled={isSendingEmail}>
            {isSendingEmail ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Send className="h-4 w-4 mr-2" />
            )}
            {isSendingEmail ? 'Sending...' : 'Send Email'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default RealEmailComposer;