import React, { useState, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { VoiceRecorder } from './media/VoiceRecorder';
import { FileUploadZone } from './media/FileUploadZone';
import { DocumentPicker } from './DocumentPicker';
import { ChatContext } from '@/types/chat';
import { 
  Send, 
  Paperclip, 
  Mic, 
  MicOff, 
  Smile, 
  X, 
  FileText, 
  Image, 
  Video,
  Calendar,
  Users,
  Scale,
  Briefcase,
  Library,
  FileCheck,
  Newspaper
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface ChatInputProps {
  onSendMessage: (content: string, attachments?: File[]) => void;
  onTyping?: (isTyping: boolean) => void;
  voiceEnabled?: boolean;
  legalTerminologyMode?: boolean;
  context?: ChatContext;
  placeholder?: string;
  maxLength?: number;
  className?: string;
}

const legalSuggestions = [
  'Analyze contract for risks',
  'Research case precedents',
  'Draft motion to dismiss',
  'Review compliance requirements',
  'Calculate statute of limitations',
  'Summarize deposition',
  'Check conflict of interest',
  'Generate client letter',
];

const legalFeatures = [
  { 
    icon: FileText, 
    label: 'Draft Documents', 
    description: 'Generate contracts, briefs, and legal documents',
    action: 'draft_document',
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    hoverColor: 'hover:bg-blue-100'
  },
  { 
    icon: Scale, 
    label: 'Legal Research', 
    description: 'Search case law, statutes, and precedents',
    action: 'legal_research',
    color: 'text-purple-600',
    bgColor: 'bg-purple-50',
    hoverColor: 'hover:bg-purple-100'
  },
  { 
    icon: FileCheck, 
    label: 'Review Documents', 
    description: 'Analyze contracts and identify risks',
    action: 'review_document',
    color: 'text-green-600',
    bgColor: 'bg-green-50',
    hoverColor: 'hover:bg-green-100'
  },
  { 
    icon: Newspaper, 
    label: 'Legal Updates', 
    description: 'Latest case decisions and regulatory changes',
    action: 'legal_updates',
    color: 'text-orange-600',
    bgColor: 'bg-orange-50',
    hoverColor: 'hover:bg-orange-100'
  },
  { 
    icon: Briefcase, 
    label: 'Practice Areas', 
    description: 'Switch between specialized legal contexts',
    action: 'practice_areas',
    color: 'text-indigo-600',
    bgColor: 'bg-indigo-50',
    hoverColor: 'hover:bg-indigo-100'
  },
];

export const ChatInput: React.FC<ChatInputProps> = ({
  onSendMessage,
  onTyping,
  voiceEnabled = true,
  legalTerminologyMode = true,
  context,
  placeholder = 'Ask me anything about law, or upload documents for analysis...',
  maxLength = 4000,
  className,
}) => {
  const [message, setMessage] = useState('');
  const [attachments, setAttachments] = useState<File[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [showFileUpload, setShowFileUpload] = useState(false);
  const [showDocumentPicker, setShowDocumentPicker] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showDocumentMentions, setShowDocumentMentions] = useState(false);
  const [mentionSearch, setMentionSearch] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout>();

  const handleInputChange = (value: string) => {
    setMessage(value);
    
    // Handle typing indicator
    if (!isTyping) {
      setIsTyping(true);
      onTyping?.(true);
    }
    
    // Clear previous timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    
    // Set new timeout
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      onTyping?.(false);
    }, 1000);

    // Auto-resize textarea
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }

    // Check for @ mentions
    const lastAtIndex = value.lastIndexOf('@');
    if (lastAtIndex !== -1 && lastAtIndex === value.length - 1) {
      setShowDocumentMentions(true);
      setMentionSearch('');
    } else if (lastAtIndex !== -1 && value.charAt(lastAtIndex - 1) === ' ') {
      const searchTerm = value.substring(lastAtIndex + 1);
      if (!searchTerm.includes(' ')) {
        setShowDocumentMentions(true);
        setMentionSearch(searchTerm);
      } else {
        setShowDocumentMentions(false);
      }
    } else {
      setShowDocumentMentions(false);
    }

    // Show suggestions if message is short
    setShowSuggestions(value.length < 10 && value.length > 0 && !showDocumentMentions);
  };

  const handleSend = () => {
    if (message.trim() || attachments.length > 0) {
      onSendMessage(message.trim(), attachments);
      setMessage('');
      setAttachments([]);
      setIsTyping(false);
      onTyping?.(false);
      
      // Reset textarea height
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleFileSelect = (files: File[]) => {
    setAttachments(prev => [...prev, ...files]);
    setShowFileUpload(false);
  };

  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const handleVoiceResult = (transcript: string) => {
    setMessage(prev => prev + (prev ? ' ' : '') + transcript);
    setIsRecording(false);
  };

  const handleSuggestionClick = (suggestion: string) => {
    setMessage(suggestion);
    setShowSuggestions(false);
    textareaRef.current?.focus();
  };

  const handleFeatureAction = (action: string) => {
    const actionMessages = {
      draft_document: 'Help me draft a legal document',
      legal_research: 'I need legal research assistance',
      review_document: 'Please review the attached document for potential risks and issues',
      legal_updates: 'Show me recent legal updates in my practice areas',
      practice_areas: 'Switch my practice area context',
    };
    
    setMessage(actionMessages[action as keyof typeof actionMessages] || '');
    textareaRef.current?.focus();
  };

  const getFileTypeIcon = (file: File) => {
    if (file.type.startsWith('image/')) return <Image className="h-4 w-4" />;
    if (file.type.startsWith('video/')) return <Video className="h-4 w-4" />;
    return <FileText className="h-4 w-4" />;
  };

  const handleDocumentsSelected = (documents: any[]) => {
    // Convert document objects to File-like objects for consistency
    const files = documents.map(doc => {
      // Create a mock File object from document data
      const file = new File([], doc.name, { type: doc.mimeType });
      // Add custom properties
      Object.defineProperty(file, 'size', { value: doc.size });
      return file;
    });
    setAttachments(prev => [...prev, ...files]);
    setShowDocumentPicker(false);
  };

  return (
    <div className={cn('relative', className)}>
      {/* Document Picker Modal */}
      <DocumentPicker
        isOpen={showDocumentPicker}
        onClose={() => setShowDocumentPicker(false)}
        onSelectDocuments={handleDocumentsSelected}
        multiple={true}
      />

      {/* File Upload Overlay */}
      {showFileUpload && (
        <div className="absolute inset-0 bg-black/50 z-50 flex items-center justify-center">
          <Card className="w-96 p-6">
            <FileUploadZone
              onFilesSelected={handleFileSelect}
              onClose={() => setShowFileUpload(false)}
              accept=".pdf,.doc,.docx,.txt,.jpg,.png,.eml,.msg,.xlsx,.pptx"
              maxSize={50 * 1024 * 1024} // 50MB
              maxFiles={5}
            />
          </Card>
        </div>
      )}

      {/* Voice Recording Overlay */}
      {isRecording && (
        <div className="absolute inset-0 bg-black/50 z-50 flex items-center justify-center">
          <Card className="p-6">
            <VoiceRecorder
              onResult={handleVoiceResult}
              onCancel={() => setIsRecording(false)}
              legalTerminologyMode={legalTerminologyMode}
            />
          </Card>
        </div>
      )}

      {/* Document Mentions */}
      {showDocumentMentions && (
        <div className="absolute bottom-full left-0 right-0 mb-2 z-20">
          <Card className="p-4 shadow-lg max-h-64 overflow-y-auto">
            <div className="text-sm font-medium text-foreground mb-2">Recent Documents:</div>
            <div className="space-y-1">
              {[
                { name: 'Smith Employment Agreement v2.3.docx', type: 'contract' },
                { name: 'Motion to Dismiss - DRAFT.pdf', type: 'filing' },
                { name: 'Legal Research Memo - Patent Law.pdf', type: 'memo' },
                { name: 'NDA Template - Standard.docx', type: 'template' }
              ]
                .filter(doc => !mentionSearch || doc.name.toLowerCase().includes(mentionSearch.toLowerCase()))
                .map((doc, index) => (
                  <Button
                    key={index}
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      const lastAtIndex = message.lastIndexOf('@');
                      const newMessage = message.substring(0, lastAtIndex) + '@' + doc.name + ' ';
                      setMessage(newMessage);
                      setShowDocumentMentions(false);
                      textareaRef.current?.focus();
                    }}
                    className="w-full justify-start text-left h-auto py-2"
                  >
                    <FileText className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span className="truncate">{doc.name}</span>
                    <Badge variant="outline" className="ml-auto text-xs">
                      {doc.type}
                    </Badge>
                  </Button>
                ))}
            </div>
          </Card>
        </div>
      )}

      {/* Suggestions */}
      {showSuggestions && legalTerminologyMode && !showDocumentMentions && (
        <div className="absolute bottom-full left-0 right-0 mb-2 z-20">
          <Card className="p-4 shadow-lg">
            <div className="text-sm font-medium text-foreground mb-2">Suggestions:</div>
            <div className="grid grid-cols-2 gap-2">
              {legalSuggestions.slice(0, 6).map((suggestion, index) => (
                <Button
                  key={index}
                  variant="ghost"
                  size="sm"
                  onClick={() => handleSuggestionClick(suggestion)}
                  className="justify-start text-left h-auto py-2"
                >
                  {suggestion}
                </Button>
              ))}
            </div>
          </Card>
        </div>
      )}


      {/* Attachments Preview */}
      {attachments.length > 0 && (
        <div className="px-4 py-3 border-b border-border bg-muted/30">
          <div className="space-y-3">
            <div className="flex items-center gap-2 flex-wrap">
              {attachments.map((file, index) => (
                <div key={index} className="flex items-center gap-2 px-3 py-2 bg-background rounded-lg border border-border">
                  {getFileTypeIcon(file)}
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-foreground truncate">
                      {file.name}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {(file.size / 1024 / 1024).toFixed(2)} MB
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => removeAttachment(index)}
                    className="h-7 w-7 p-0 hover:bg-muted"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              ))}
            </div>
            
            {/* Smart Document Actions */}
            {attachments.some(f => f.type === 'application/pdf' || f.name.endsWith('.docx')) && (
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">Suggested actions:</span>
                <Button 
                  size="sm" 
                  variant="secondary"
                  onClick={() => setMessage('Analyze this document for potential risks')}
                  className="h-7 text-xs"
                >
                  Analyze for risks
                </Button>
                <Button 
                  size="sm" 
                  variant="secondary"
                  onClick={() => setMessage('Extract key terms and clauses from this document')}
                  className="h-7 text-xs"
                >
                  Extract key terms
                </Button>
                <Button 
                  size="sm" 
                  variant="secondary"
                  onClick={() => setMessage('Compare this with our standard template')}
                  className="h-7 text-xs"
                >
                  Compare versions
                </Button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Input Area */}
      <div className="flex items-end gap-2 p-4">
        {/* File Action Buttons */}
        <div className="flex items-center gap-1">
          <Button
            size="sm"
            variant="ghost"
            onClick={() => {
              setShowDocumentPicker(false);
              setShowFileUpload(true);
            }}
            className="flex-shrink-0"
            title="Upload files"
          >
            <Paperclip className="h-4 w-4" />
          </Button>
          
          <Button
            size="sm"
            variant="ghost"
            onClick={() => {
              setShowFileUpload(false);
              setShowDocumentPicker(true);
            }}
            className="flex-shrink-0"
            title="Document library"
          >
            <Library className="h-4 w-4" />
          </Button>
        </div>

        {/* Text Input */}
        <div className="flex-1 relative">
          <Textarea
            ref={textareaRef}
            value={message}
            onChange={(e) => handleInputChange(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={placeholder}
            maxLength={maxLength}
            className="min-h-[40px] max-h-[120px] resize-none pr-12"
            rows={1}
          />
          
          {/* Character Count */}
          {message.length > maxLength * 0.8 && (
            <div className="absolute bottom-2 right-2 text-xs text-muted-foreground">
              {message.length}/{maxLength}
            </div>
          )}
        </div>

        {/* Voice/Send Buttons */}
        <div className="flex items-center gap-1 flex-shrink-0">
          {voiceEnabled && message === '' && (
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setIsRecording(true)}
              className="flex-shrink-0"
            >
              <Mic className="h-4 w-4" />
            </Button>
          )}
          
          <Button
            size="sm"
            onClick={handleSend}
            disabled={!message.trim() && attachments.length === 0}
            className="flex-shrink-0"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Context Info */}
      {context && context.type !== 'general' && (
        <div className="px-4 py-1 text-xs text-muted-foreground bg-primary/5 border-t border-border">
          {context.type === 'matter' && `Matter context: ${context.data?.title || 'Unknown'}`}
          {context.type === 'client' && `Client context: ${context.data?.name || 'Unknown'}`}
        </div>
      )}
    </div>
  );
};