
import React, { useState, useEffect } from 'react';
import { ChatInterface } from '@/components/chat/ChatInterface';
import { ConversationSidebar } from '@/components/chat/ConversationSidebar';
import { WelcomeScreen } from '@/components/chat/WelcomeScreen';
import { WorkflowExecutor } from '@/components/chat/WorkflowExecutor';
import { ExportModal } from '@/components/chat/ExportModal';
import { ChatContextProvider } from '@/components/chat/smart/ContextProvider';
import { ChatContext, ChatMessage, Conversation, ConversationSummary } from '@/types/chat';
import { WorkflowTemplate, WorkflowExecution } from '@/types/workflow';
import { conversationService } from '@/services/conversationService';
import { workflowService } from '@/services/workflowService';

// Use the Document interface that matches DocumentPicker
interface Document {
  id: string;
  name: string;
  type?: string;
  size?: number;
  mimeType?: string;
  uploadedAt?: string;
  tags?: string[];
}

const Assistant = () => {
  const [currentConversation, setCurrentConversation] = useState<Conversation | null>(null);
  const [context, setContext] = useState<ChatContext>({ type: 'general' });
  const [showWelcome, setShowWelcome] = useState(true);
  const [currentWorkflow, setCurrentWorkflow] = useState<{ execution: WorkflowExecution; template: WorkflowTemplate } | null>(null);
  const [previewWorkflow, setPreviewWorkflow] = useState<WorkflowTemplate | null>(null);
  const [exportModal, setExportModal] = useState<{ execution: WorkflowExecution; template: WorkflowTemplate } | null>(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const handleNewConversation = () => {
    setCurrentConversation(null);
    setShowWelcome(true);
    setContext({ type: 'general' });
    setCurrentWorkflow(null);
    setPreviewWorkflow(null);
  };

  const handleSelectConversation = (conversationSummary: ConversationSummary | null) => {
    if (!conversationSummary) {
      handleNewConversation();
      return;
    }

    const conversation = conversationService.getConversation(conversationSummary.id);
    if (conversation) {
      // Check if this is a workflow conversation
      if (conversation.workflowTemplateId && conversation.workflowStatus === 'in_progress') {
        // Resume workflow
        handleResumeWorkflow(conversation);
      } else if (conversation.workflowTemplateId && conversation.workflowStatus === 'completed') {
        // Show completed workflow conversation
        setCurrentConversation(conversation);
        setShowWelcome(false);
        setCurrentWorkflow(null);
      } else {
        // Regular conversation
        setCurrentConversation(conversation);
        setShowWelcome(false);
        setCurrentWorkflow(null);
      }
      
      // Set context based on conversation
      const newContext: ChatContext = {
        type: conversation.contextType || 'general',
        id: conversation.contextId,
      };
      setContext(newContext);
    }
  };

  const handleResumeWorkflow = (conversation: Conversation) => {
    if (!conversation.workflowTemplateId) return;

    const template = workflowService.getTemplate(conversation.workflowTemplateId);
    if (!template) return;

    // Create or get existing workflow execution
    let execution: WorkflowExecution;
    
    if (conversation.workflowExecutionId) {
      const existingExecution = workflowService.getExecution(conversation.workflowExecutionId);
      if (existingExecution) {
        execution = existingExecution;
      } else {
        // Create new execution if existing one not found
        execution = workflowService.createExecution(template.id, conversation.title);
        if (conversation.workflowCurrentStep !== undefined) {
          execution.currentStep = conversation.workflowCurrentStep;
        }
      }
    } else {
      // Create new execution
      execution = workflowService.createExecution(template.id, conversation.title);
      if (conversation.workflowCurrentStep !== undefined) {
        execution.currentStep = conversation.workflowCurrentStep;
      }
      
      // Update conversation with execution ID
      conversationService.updateConversation(conversation.id, {
        workflowExecutionId: execution.id
      });
    }

    setCurrentWorkflow({ execution, template });
    setCurrentConversation(null);
    setShowWelcome(false);
  };

  const handleStartConversation = (prompt: string, documents?: Document[]) => {
    // Auto-categorize the message
    const category = conversationService.autoCategorizMessage(prompt);

    // Create new conversation with document context
    const conversationTitle = documents && documents.length > 0 
      ? `Document Analysis: ${documents[0].name || 'Legal Documents'}`
      : 'New Conversation';
    
    const conversation = conversationService.createConversation(
      conversationTitle,
      category
    );

    // Create initial user message with documents
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: { 
        text: prompt,
        attachments: documents?.map(doc => ({
          id: doc.id || Date.now().toString(),
          name: doc.name || 'Document',
          type: 'document',
          size: doc.size || 0,
          url: doc.url || '',
          mimeType: doc.mimeType || 'application/pdf',
          uploadedAt: new Date().toISOString(),
        }))
      },
      timestamp: new Date().toISOString(),
      status: 'sent',
    };

    // Add message to conversation
    conversationService.addMessage(conversation.id, userMessage);

    // Load the updated conversation
    const updatedConversation = conversationService.getConversation(conversation.id);
    if (updatedConversation) {
      setCurrentConversation(updatedConversation);
      setShowWelcome(false);
      setContext({ type: 'general' });
    }
  };

  const handleLaunchWorkflow = (template: WorkflowTemplate) => {
    const execution = workflowService.createExecution(template.id, template.title);
    setCurrentWorkflow({ execution, template });
    setShowWelcome(false);
  };

  const handlePreviewWorkflow = (template: WorkflowTemplate) => {
    setPreviewWorkflow(template);
  };

  const handleWorkflowComplete = (execution: WorkflowExecution) => {
    const template = workflowService.getTemplate(execution.templateId);
    if (template) {
      setExportModal({ execution, template });
    }
  };

  const handleCloseWorkflow = () => {
    setCurrentWorkflow(null);
    setShowWelcome(true);
  };

  const handleSendMessage = (content: string, attachments?: File[]) => {
    if (!currentConversation) return;

    // Create new user message
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: { 
        text: content,
        attachments: attachments?.map(file => ({
          id: Date.now().toString(),
          name: file.name,
          type: file.type.startsWith('image/') ? 'image' : 'document',
          size: file.size,
          url: URL.createObjectURL(file),
          mimeType: file.type,
          uploadedAt: new Date().toISOString(),
        })),
      },
      timestamp: new Date().toISOString(),
      status: 'sent',
    };

    // Add message to conversation
    conversationService.addMessage(currentConversation.id, userMessage);

    // Reload conversation to get updated state
    const updatedConversation = conversationService.getConversation(currentConversation.id);
    if (updatedConversation) {
      setCurrentConversation(updatedConversation);
    }

    // Simulate AI response (in real app, this would be an API call)
    setTimeout(() => {
      const aiMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'ai',
        content: {
          text: generateAIResponse(content, attachments),
        },
        timestamp: new Date().toISOString(),
        status: 'delivered',
      };

      conversationService.addMessage(currentConversation.id, aiMessage);
      
      const finalConversation = conversationService.getConversation(currentConversation.id);
      if (finalConversation) {
        setCurrentConversation(finalConversation);
      }
    }, 1500);
  };

  const generateAIResponse = (userMessage: string, attachments?: File[]): string => {
    if (attachments && attachments.length > 0) {
      return `I've received your ${attachments.length > 1 ? 'documents' : 'document'}: **${attachments.map(f => f.name).join(', ')}**. Let me analyze ${attachments.length > 1 ? 'them' : 'it'} for you.\n\n*Processing document analysis...*\n\nI'll provide a detailed legal analysis, risk assessment, and recommendations.`;
    }

    const responses = [
      'I understand your legal question. Based on current jurisprudence and applicable statutes, here are the key considerations you should be aware of...',
      'That\'s an excellent question. Let me research the relevant legal precedents and provide you with a comprehensive analysis of your options.',
      'I can help you with that matter. Here\'s what you need to know from a legal perspective, including potential risks and recommended next steps...',
    ];

    return responses[Math.floor(Math.random() * responses.length)];
  };

  const handleTyping = (isTyping: boolean) => {
    // In a real implementation, this would notify the AI or other users
    console.log('User typing:', isTyping);
  };

  return (
    <ChatContextProvider initialContext={context}>
      <div className="h-screen flex flex-col -ml-4 sm:-ml-6 lg:-ml-8 overflow-hidden">
        <div className="flex-1 flex overflow-hidden">
          {/* Sidebar */}
          <ConversationSidebar
            selectedConversationId={currentConversation?.id}
            onSelectConversation={handleSelectConversation}
            onNewConversation={handleNewConversation}
            isCollapsed={sidebarCollapsed}
            onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
            className={`${sidebarCollapsed ? 'w-16' : 'w-[360px]'} flex-shrink-0 h-full transition-all duration-300 ease-out`}
          />

          {/* Main Content */}
          <div className="flex-1 flex flex-col h-full overflow-hidden">
            {showWelcome ? (
              <WelcomeScreen
                onStartConversation={handleStartConversation}
                onLaunchWorkflow={handleLaunchWorkflow}
                onPreviewWorkflow={handlePreviewWorkflow}
                className="flex-1 overflow-y-auto"
              />
            ) : currentWorkflow ? (
              <WorkflowExecutor
                execution={currentWorkflow.execution}
                template={currentWorkflow.template}
                onComplete={handleWorkflowComplete}
                onClose={handleCloseWorkflow}
                className="flex-1 overflow-y-auto"
              />
            ) : currentConversation ? (
              <ChatInterface
                thread={currentConversation}
                context={context}
                onSendMessage={handleSendMessage}
                onTyping={handleTyping}
                settings={{
                  theme: 'light',
                  notifications: true,
                  soundEnabled: true,
                  autoScroll: true,
                  showTimestamps: true,
                  compactMode: false,
                  voiceInputEnabled: true,
                  legalTerminologyMode: true,
                }}
                className="flex-1 h-full"
              />
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <p className="text-muted-foreground">Select a conversation or start a new one</p>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Export Modal */}
      {exportModal && (
        <ExportModal
          isOpen={!!exportModal}
          onClose={() => setExportModal(null)}
          execution={exportModal.execution}
          template={exportModal.template}
        />
      )}
    </ChatContextProvider>
  );
};

export default Assistant;
