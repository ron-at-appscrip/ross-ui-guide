import React, { createContext, useContext, useState, useEffect } from 'react';
import { ChatContext } from '@/types/chat';
import { Matter } from '@/types/matter';
import { Client } from '@/types/client';

interface ChatContextProviderProps {
  children: React.ReactNode;
  initialContext?: ChatContext;
}

interface ChatContextValue {
  context: ChatContext | null;
  setContext: (context: ChatContext | null) => void;
  updateContext: (updates: Partial<ChatContext>) => void;
  clearContext: () => void;
  isLoading: boolean;
}

const ChatContextContext = createContext<ChatContextValue | undefined>(undefined);

export const useChatContext = () => {
  const context = useContext(ChatContextContext);
  if (context === undefined) {
    throw new Error('useChatContext must be used within a ChatContextProvider');
  }
  return context;
};

// Mock data for demonstration
const mockMatters: Matter[] = [
  {
    id: '1',
    title: 'Corporate Merger - TechFusion Acquisition',
    description: 'Legal analysis and due diligence for the acquisition of TechFusion Inc.',
    clientId: '1',
    clientName: 'John Smith',
    status: 'active',
    priority: 'urgent',
    stage: 'discovery',
    practiceArea: 'Corporate Law',
    practiceSubArea: 'M&A',
    responsibleAttorney: 'Sarah Johnson',
    responsibleAttorneyId: '1',
    originatingAttorney: 'David Wilson',
    originatingAttorneyId: '4',
    responsibleStaff: ['Jennifer Adams', 'Robert Taylor'],
    responsibleStaffIds: ['1', '2'],
    dateOpened: '2024-11-15',
    lastActivity: '2024-12-05',
    billedAmount: 45000,
    estimatedBudget: 125000,
    timeSpent: 120.5,
    nextActionDate: '2024-12-10',
    tags: ['M&A', 'Due Diligence', 'Corporate', 'High Value'],
    notes: 'Complex merger requiring extensive due diligence and regulatory approval.',
    matterNumber: 'M240001',
    taskLists: [],
    documentFolders: [],
    notificationCount: 3
  }
];

const mockClients: Client[] = [
  {
    id: '1',
    name: 'John Smith',
    type: 'person',
    status: 'active',
    emails: [{ id: 'e1', value: 'john.smith@email.com', type: 'work', isPrimary: true }],
    phones: [{ id: 'p1', value: '+1-555-0101', type: 'work', isPrimary: true }],
    websites: [],
    addresses: [],
    primaryContact: 'John Smith',
    dateAdded: '2024-01-15',
    lastActivity: '2024-03-10',
    totalMatters: 3,
    activeMatters: 2,
    totalBilled: 125000,
    outstandingBalance: 15000,
    industry: 'Corporate',
    tags: ['Corporate Law', 'M&A']
  }
];

export const ChatContextProvider: React.FC<ChatContextProviderProps> = ({
  children,
  initialContext,
}) => {
  const [context, setContextState] = useState<ChatContext | null>(initialContext || null);
  const [isLoading, setIsLoading] = useState(false);

  const setContext = async (newContext: ChatContext | null) => {
    if (!newContext) {
      setContextState(null);
      return;
    }

    setIsLoading(true);
    
    try {
      // Simulate API call to fetch context data
      await new Promise(resolve => setTimeout(resolve, 500));
      
      let contextData = null;
      let recentActivity = [];
      let relevantDocuments = [];
      let upcomingDeadlines = [];

      if (newContext.type === 'matter' && newContext.id) {
        // Fetch matter data
        contextData = mockMatters.find(m => m.id === newContext.id);
        
        if (contextData) {
          recentActivity = [
            {
              id: '1',
              type: 'document',
              action: 'uploaded',
              description: 'Contract draft v2.pdf uploaded',
              timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
              user: 'Sarah Johnson'
            },
            {
              id: '2',
              type: 'note',
              action: 'added',
              description: 'Client meeting notes added',
              timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
              user: 'David Wilson'
            }
          ];

          relevantDocuments = [
            {
              id: '1',
              name: 'Merger Agreement Draft.pdf',
              type: 'contract',
              lastModified: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
              size: '2.4 MB'
            },
            {
              id: '2',
              name: 'Due Diligence Checklist.docx',
              type: 'checklist',
              lastModified: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
              size: '156 KB'
            }
          ];

          upcomingDeadlines = [
            {
              id: '1',
              title: 'Submit merger documentation',
              date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
              priority: 'high'
            },
            {
              id: '2',
              title: 'Complete due diligence review',
              date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
              priority: 'medium'
            }
          ];
        }
      } else if (newContext.type === 'client' && newContext.id) {
        // Fetch client data
        contextData = mockClients.find(c => c.id === newContext.id);
        
        if (contextData) {
          recentActivity = [
            {
              id: '1',
              type: 'communication',
              action: 'email_sent',
              description: 'Monthly update email sent',
              timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
              user: 'Sarah Johnson'
            }
          ];

          relevantDocuments = [
            {
              id: '1',
              name: 'Client Agreement.pdf',
              type: 'agreement',
              lastModified: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
              size: '1.2 MB'
            }
          ];

          upcomingDeadlines = [
            {
              id: '1',
              title: 'Quarterly review meeting',
              date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
              priority: 'low'
            }
          ];
        }
      }

      const enrichedContext: ChatContext = {
        ...newContext,
        data: contextData,
        recentActivity,
        relevantDocuments,
        upcomingDeadlines,
      };

      setContextState(enrichedContext);
    } catch (error) {
      console.error('Failed to load context:', error);
      setContextState(newContext);
    } finally {
      setIsLoading(false);
    }
  };

  const updateContext = (updates: Partial<ChatContext>) => {
    if (context) {
      setContextState({ ...context, ...updates });
    }
  };

  const clearContext = () => {
    setContextState(null);
  };

  // Auto-detect context from URL or other sources
  useEffect(() => {
    if (!context && !initialContext) {
      // Try to detect context from current page/URL
      const path = window.location.pathname;
      const matterMatch = path.match(/\/matters\/([^\/]+)/);
      const clientMatch = path.match(/\/clients\/([^\/]+)/);

      if (matterMatch) {
        setContext({
          type: 'matter',
          id: matterMatch[1],
        });
      } else if (clientMatch) {
        setContext({
          type: 'client',
          id: clientMatch[1],
        });
      } else {
        setContext({
          type: 'general',
        });
      }
    }
  }, [context, initialContext]);

  const value: ChatContextValue = {
    context,
    setContext,
    updateContext,
    clearContext,
    isLoading,
  };

  return (
    <ChatContextContext.Provider value={value}>
      {children}
    </ChatContextContext.Provider>
  );
};