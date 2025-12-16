import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { WorkflowGallery } from './WorkflowGallery';
import { DocumentPicker } from './DocumentPicker';
import { WorkflowTemplate } from '@/types/workflow';
import { Send, Brain, Lightbulb, MessageSquare, Zap, Sparkles, Search, FileText, Scale, FileCheck, Newspaper, Briefcase, Library, Paperclip, X } from 'lucide-react';
import { cn } from '@/lib/utils';

// Use the Document interface from DocumentPicker
interface Document {
  id: string;
  name: string;
  type?: string;
  size?: number;
  mimeType?: string;
  uploadedAt?: string;
  tags?: string[];
}

interface WelcomeScreenProps {
  onStartConversation: (prompt: string, documents?: Document[]) => void;
  onLaunchWorkflow: (template: WorkflowTemplate) => void;
  onPreviewWorkflow: (template: WorkflowTemplate) => void;
  className?: string;
}


const intelligenceFeatures = [
  {
    icon: Brain,
    title: 'Intelligent Analysis',
    description: 'Advanced AI that understands legal context and nuance',
    hint: 'Ask about contract risks, compliance requirements, or legal strategy',
  },
  {
    icon: Sparkles,
    title: 'Smart Suggestions',
    description: 'Proactive recommendations based on your legal practice',
    hint: 'Get workflow suggestions, document templates, and next steps',
  },
  {
    icon: MessageSquare,
    title: 'Natural Conversation',
    description: 'Communicate in plain language about complex legal matters',
    hint: 'Type naturally - no need for legal jargon or special formatting',
  },
];

const exampleQuestions = [
  "Review this employment agreement for potential risks",
  "Draft a client alert about new data privacy regulations", 
  "What are the key negotiation points for this M&A transaction?",
  "Help me research patent law precedents for software",
];

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({
  onStartConversation,
  onLaunchWorkflow,
  onPreviewWorkflow,
  className,
}) => {
  const [inputValue, setInputValue] = useState('');
  const [focusedInput, setFocusedInput] = useState(false);
  const [currentHint, setCurrentHint] = useState(0);
  const [showWorkflows, setShowWorkflows] = useState(false);
  const [showDocumentPicker, setShowDocumentPicker] = useState(false);
  const [selectedDocuments, setSelectedDocuments] = useState<Document[]>([]);

  // Rotate through example questions
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentHint((prev) => (prev + 1) % exampleQuestions.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const handleStartConversation = () => {
    if (inputValue.trim() || selectedDocuments.length > 0) {
      const prompt = inputValue.trim() || `Please analyze the following ${selectedDocuments.length > 1 ? 'documents' : 'document'} and provide insights.`;
      onStartConversation(prompt, selectedDocuments);
      setInputValue('');
      setSelectedDocuments([]);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleStartConversation();
    }
  };

  const handleExampleClick = (example: string) => {
    setInputValue(example);
    setFocusedInput(true);
  };

  const handleSelectDocuments = (documents: Document[]) => {
    setSelectedDocuments(documents);
    setShowDocumentPicker(false);
  };

  const handleRemoveDocument = (documentId: string) => {
    setSelectedDocuments(prev => prev.filter(doc => doc.id !== documentId));
  };

  return (
    <div className={cn('min-h-screen bg-gradient-to-b from-muted/50 to-background', className)}>
      {/* Hero Section with Input */}
      <div className="max-w-4xl mx-auto px-8 pt-20 pb-16">
        
        {/* Main Heading */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-light text-foreground mb-4 tracking-tight">
            Your AI Legal Assistant
          </h1>
          <p className="text-xl text-muted-foreground font-light max-w-2xl mx-auto leading-relaxed">
            Ask questions, analyze documents, and get intelligent recommendations for your legal practice.
          </p>
        </div>

        {/* Primary Input */}
        <div className="relative mb-8">
          <div className={cn(
            'relative overflow-hidden rounded-2xl bg-background shadow-sm border border-border transition-all duration-300',
            focusedInput && 'shadow-lg border-blue-200 ring-1 ring-blue-100'
          )}>
            <Input
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              onFocus={() => setFocusedInput(true)}
              onBlur={() => setFocusedInput(false)}
              placeholder={selectedDocuments.length > 0 ? "Ask about the attached documents..." : "Ask me anything about legal matters or attach documents..."}
              className="h-16 text-lg border-0 rounded-2xl bg-transparent px-6 pr-32 placeholder:text-muted-foreground focus-visible:ring-0"
              maxLength={500}
            />
            
            <div className="absolute right-2 top-2 flex items-center gap-2">
              <Button
                onClick={() => setShowDocumentPicker(true)}
                variant="ghost"
                className="h-12 px-3 rounded-xl hover:bg-muted transition-colors"
                title="Attach documents from library"
              >
                <Library className="h-4 w-4" />
              </Button>
              
              <Button
                onClick={handleStartConversation}
                disabled={!inputValue.trim() && selectedDocuments.length === 0}
                className={cn(
                  'h-12 px-6 rounded-xl transition-all duration-200',
                  (inputValue.trim() || selectedDocuments.length > 0)
                    ? 'bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm' 
                    : 'bg-muted text-muted-foreground cursor-not-allowed'
                )}
              >
                <Send className="h-4 w-4 mr-2" />
                Ask
              </Button>
            </div>
          </div>

          {/* Selected Documents */}
          {selectedDocuments.length > 0 && (
            <div className="mt-4 p-4 bg-muted/50 rounded-xl border border-border">
              <div className="flex items-center gap-2 mb-3">
                <Paperclip className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium text-foreground">
                  {selectedDocuments.length} {selectedDocuments.length === 1 ? 'Document' : 'Documents'} Attached
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                {selectedDocuments.map((doc, index) => (
                  <div
                    key={doc.id || index}
                    className="flex items-center gap-2 px-3 py-2 bg-background rounded-lg border border-border text-sm"
                  >
                    <FileText className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    <span className="text-foreground truncate max-w-48">
                      {doc.name || `Document ${index + 1}`}
                    </span>
                    <Button
                      onClick={() => handleRemoveDocument(doc.id || `doc-${index}`)}
                      variant="ghost"
                      className="h-6 w-6 p-0 hover:bg-muted rounded-full"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* Rotating Hint */}
          <div className="absolute -bottom-8 left-0 right-0">
            <p className="text-center text-sm text-muted-foreground animate-pulse">
              Try: "{exampleQuestions[currentHint]}"
            </p>
          </div>
        </div>

        {/* Intelligence Features - Integrated */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16">
          {intelligenceFeatures.map((feature, index) => (
            <div 
              key={index} 
              className="group text-center space-y-4 p-6 rounded-xl hover:bg-background hover:shadow-sm transition-all duration-300 cursor-pointer"
              onClick={() => handleExampleClick(feature.hint)}
            >
              <div className="inline-flex items-center justify-center w-14 h-14 bg-muted rounded-2xl group-hover:bg-primary/10 transition-colors duration-300">
                <feature.icon className="h-7 w-7 text-muted-foreground group-hover:text-primary transition-colors duration-300" />
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  {feature.title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Quick Examples */}
        <div className="mt-12 text-center">
          <p className="text-sm text-muted-foreground mb-4">Quick start examples:</p>
          <div className="flex flex-wrap justify-center gap-3">
            {exampleQuestions.slice(0, 3).map((example, index) => (
              <button
                key={index}
                onClick={() => handleExampleClick(example)}
                className="px-4 py-2 bg-muted hover:bg-muted/80 text-muted-foreground text-sm rounded-full transition-colors duration-200"
              >
                {example.length > 40 ? example.substring(0, 40) + '...' : example}
              </button>
            ))}
          </div>
        </div>

        {/* Legal Feature Buttons - Always Visible */}
        <div className="mt-16">
          <div className="text-center mb-8">
            <h3 className="text-2xl font-light text-foreground mb-2">
              Legal AI Tools
            </h3>
            <p className="text-muted-foreground">
              Powerful features to enhance your legal practice
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 max-w-6xl mx-auto">
            {[
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
            ].map((feature, index) => (
              <button
                key={index}
                onClick={() => {
                  const actionMessages = {
                    draft_document: 'Help me draft a legal document',
                    legal_research: 'I need legal research assistance',
                    review_document: 'Please review a document for potential risks and issues',
                    legal_updates: 'Show me recent legal updates in my practice areas',
                    practice_areas: 'Switch my practice area context',
                  };
                  onStartConversation(actionMessages[feature.action as keyof typeof actionMessages] || '');
                }}
                className={cn(
                  'group relative flex flex-col items-center gap-3 p-6 rounded-xl transition-all duration-200',
                  'border border-border bg-background hover:shadow-lg hover:border-primary/20',
                  feature.hoverColor
                )}
              >
                <div className={cn(
                  'flex items-center justify-center w-14 h-14 rounded-xl transition-colors',
                  feature.bgColor,
                  'group-hover:scale-110 transition-transform duration-200'
                )}>
                  <feature.icon className={cn('h-7 w-7', feature.color)} />
                </div>
                <div className="text-center">
                  <div className="text-sm font-semibold text-foreground mb-1">
                    {feature.label}
                  </div>
                  <div className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                    {feature.description}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Workflow Toggle */}
        <div className="mt-16 text-center">
          <button
            onClick={() => setShowWorkflows(!showWorkflows)}
            className="inline-flex items-center gap-2 text-primary hover:text-primary/80 font-medium"
          >
            <Zap className="h-4 w-4" />
            {showWorkflows ? 'Hide' : 'Browse'} Workflow Templates
          </button>
        </div>
      </div>

      {/* Workflow Gallery - Progressive Disclosure */}
      {showWorkflows && (
        <div className="border-t bg-muted/50 py-16">
          <div className="max-w-6xl mx-auto px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-light text-foreground mb-4">
                Workflow Templates
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Pre-built workflows for common legal tasks and document generation.
              </p>
            </div>
            
            <WorkflowGallery
              onLaunchWorkflow={onLaunchWorkflow}
              onPreviewWorkflow={onPreviewWorkflow}
            />
          </div>
        </div>
      )}

      {/* Document Picker Modal */}
      <DocumentPicker
        isOpen={showDocumentPicker}
        onClose={() => setShowDocumentPicker(false)}
        onSelectDocuments={handleSelectDocuments}
        multiple={true}
      />
    </div>
  );
};