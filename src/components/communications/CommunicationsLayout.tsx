
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';
import UnifiedInbox from './UnifiedInbox';
import EmailComposer from './EmailComposer';
import MeetingIntelligence from './MeetingIntelligence';
import CommunicationTimeline from './CommunicationTimeline';
import CommunicationsHeader from './CommunicationsHeader';

const CommunicationsLayout = () => {
  const [activeTab, setActiveTab] = useState('inbox');

  return (
    <div className="space-y-8">
      <CommunicationsHeader />
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <Card className="p-1 w-fit mx-auto">
          <TabsList className="grid w-full grid-cols-4 bg-transparent gap-1">
            <TabsTrigger 
              value="inbox" 
              className="text-form-label data-[state=active]:bg-background data-[state=active]:shadow-sm"
            >
              Unified Inbox
            </TabsTrigger>
            <TabsTrigger 
              value="compose" 
              className="text-form-label data-[state=active]:bg-background data-[state=active]:shadow-sm"
            >
              Compose
            </TabsTrigger>
            <TabsTrigger 
              value="meetings" 
              className="text-form-label data-[state=active]:bg-background data-[state=active]:shadow-sm"
            >
              Meetings
            </TabsTrigger>
            <TabsTrigger 
              value="timeline" 
              className="text-form-label data-[state=active]:bg-background data-[state=active]:shadow-sm"
            >
              Timeline
            </TabsTrigger>
          </TabsList>
        </Card>

        <TabsContent value="inbox" className="mt-8">
          <UnifiedInbox />
        </TabsContent>

        <TabsContent value="compose" className="mt-8">
          <EmailComposer />
        </TabsContent>

        <TabsContent value="meetings" className="mt-8">
          <MeetingIntelligence />
        </TabsContent>

        <TabsContent value="timeline" className="mt-8">
          <CommunicationTimeline />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CommunicationsLayout;
