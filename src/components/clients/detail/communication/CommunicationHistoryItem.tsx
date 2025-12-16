
import React from 'react';
import { getCommunicationIcon, getStatusBadge } from './CommunicationUtils';

interface CommunicationHistoryItemProps {
  communication: {
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
  };
}

const CommunicationHistoryItem = ({ communication }: CommunicationHistoryItemProps) => {
  return (
    <div className="border rounded-lg p-4">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-muted rounded-full">
            {getCommunicationIcon(communication.type)}
          </div>
          <div>
            <h4 className="font-medium">{communication.subject}</h4>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>{communication.date} at {communication.time}</span>
              <span>•</span>
              <span>{communication.matter}</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {getStatusBadge(communication.status)}
        </div>
      </div>

      {communication.type === 'email' && (
        <div className="ml-12">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
            <span>From: {communication.from}</span>
            <span>•</span>
            <span>To: {communication.to}</span>
          </div>
          <p className="text-sm">{communication.preview}</p>
        </div>
      )}

      {(communication.type === 'phone' || communication.type === 'meeting') && (
        <div className="ml-12">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
            <span>Participants: {communication.participants?.join(', ')}</span>
            {communication.duration && (
              <>
                <span>•</span>
                <span>Duration: {communication.duration}</span>
              </>
            )}
          </div>
          {communication.notes && (
            <p className="text-sm">{communication.notes}</p>
          )}
        </div>
      )}
    </div>
  );
};

export default CommunicationHistoryItem;
