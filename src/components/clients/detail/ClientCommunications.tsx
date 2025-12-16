
import React, { useState } from 'react';
import CommunicationSummary from './communication/CommunicationSummary';
import CommunicationHistory from './communication/CommunicationHistory';
import LogCallModal from './modals/LogCallModal';
import NewCommunicationModal from './modals/NewCommunicationModal';

interface ClientCommunicationsProps {
  clientId: string;
}

// Mock data for communications
const mockCommunications = [
  {
    id: '1',
    type: 'email',
    subject: 'Contract Review Status Update',
    date: '2024-03-10',
    time: '2:30 PM',
    from: 'sarah.johnson@firm.com',
    to: 'legal@acme.com',
    matter: 'Contract Review - Software License',
    status: 'sent',
    preview: 'Hi John, I wanted to provide you with an update on the contract review process...'
  },
  {
    id: '2',
    type: 'phone',
    subject: 'Client Consultation Call',
    date: '2024-03-09',
    time: '10:00 AM',
    participants: ['Michael Chen', 'John Smith'],
    matter: 'Employment Dispute Resolution',
    status: 'completed',
    duration: '45 minutes',
    notes: 'Discussed case strategy and next steps for the employment dispute.'
  },
  {
    id: '3',
    type: 'meeting',
    subject: 'Quarterly Legal Review Meeting',
    date: '2024-03-05',
    time: '3:00 PM',
    participants: ['Sarah Johnson', 'John Smith', 'Legal Team'],
    matter: 'General',
    status: 'completed',
    duration: '90 minutes',
    notes: 'Reviewed all active matters and discussed upcoming legal requirements.'
  },
  {
    id: '4',
    type: 'email',
    subject: 'Document Request Follow-up',
    date: '2024-03-01',
    time: '11:15 AM',
    from: 'michael.chen@firm.com',
    to: 'legal@acme.com',
    matter: 'Employment Dispute Resolution',
    status: 'sent',
    preview: 'Following up on the documents we discussed during our last call...'
  }
];

const ClientCommunications = ({ clientId }: ClientCommunicationsProps) => {
  const [showLogCallModal, setShowLogCallModal] = useState(false);
  const [showNewCommunicationModal, setShowNewCommunicationModal] = useState(false);

  // Mock client data for modals
  const clientName = "John Smith"; // This would come from props in real implementation
  const clientEmail = "john.smith@email.com"; // This would come from props in real implementation

  return (
    <div className="space-y-6">
      <CommunicationSummary communications={mockCommunications} />
      <CommunicationHistory 
        communications={mockCommunications} 
        onLogCall={() => setShowLogCallModal(true)}
        onNewCommunication={() => setShowNewCommunicationModal(true)}
      />

      {/* Communication Modals */}
      <LogCallModal
        isOpen={showLogCallModal}
        onClose={() => setShowLogCallModal(false)}
        clientId={clientId}
        clientName={clientName}
      />

      <NewCommunicationModal
        isOpen={showNewCommunicationModal}
        onClose={() => setShowNewCommunicationModal(false)}
        clientId={clientId}
        clientName={clientName}
        clientEmail={clientEmail}
      />
    </div>
  );
};

export default ClientCommunications;
