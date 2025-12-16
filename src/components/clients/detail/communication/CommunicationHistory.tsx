
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Phone } from 'lucide-react';
import CommunicationHistoryItem from './CommunicationHistoryItem';

interface Communication {
  id: string;
  type: string;
  subject: string;
  date: string;
  time: string;
  matter: string;
  status: string;
  from?: string;
  to?: string;
  preview?: string;
  participants?: string[];
  duration?: string;
  notes?: string;
}

interface CommunicationHistoryProps {
  communications: Communication[];
  onLogCall?: () => void;
  onNewCommunication?: () => void;
}

const CommunicationHistory = ({ communications, onLogCall, onNewCommunication }: CommunicationHistoryProps) => {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Communication History</CardTitle>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={onLogCall}
            >
              <Phone className="h-4 w-4 mr-2" />
              Log Call
            </Button>
            <Button 
              size="sm"
              onClick={onNewCommunication}
            >
              <Plus className="h-4 w-4 mr-2" />
              New Communication
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {communications.map((communication) => (
            <CommunicationHistoryItem 
              key={communication.id} 
              communication={communication} 
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default CommunicationHistory;
