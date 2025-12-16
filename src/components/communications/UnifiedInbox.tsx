
import React, { useState } from 'react';
import EmailList from './EmailList';
import EmailDetail from './EmailDetail';
import EmailDetailEmpty from './EmailDetailEmpty';

const mockEmails = [
  {
    id: 1,
    sender: 'John Smith',
    senderEmail: 'john.smith@example.com',
    subject: 'Contract Review Required',
    preview: 'Please review the attached contract for the Johnson case...',
    time: '2 hours ago',
    isUnread: true,
    isStarred: false,
    hasAttachment: true,
    priority: 'high',
    matter: 'Johnson v. ABC Corp'
  },
  {
    id: 2,
    sender: 'Sarah Wilson',
    senderEmail: 'sarah.wilson@client.com',
    subject: 'Meeting Follow-up',
    preview: 'Thank you for the productive meeting yesterday. As discussed...',
    time: '4 hours ago',
    isUnread: true,
    isStarred: true,
    hasAttachment: false,
    priority: 'medium',
    matter: 'Wilson Estate Planning'
  },
  {
    id: 3,
    sender: 'Mike Davis',
    senderEmail: 'mike.davis@lawfirm.com',
    subject: 'Deposition Schedule',
    preview: 'The deposition for the Martinez case has been scheduled...',
    time: '1 day ago',
    isUnread: false,
    isStarred: false,
    hasAttachment: true,
    priority: 'low',
    matter: 'Martinez Personal Injury'
  }
];

const UnifiedInbox = () => {
  const [selectedEmail, setSelectedEmail] = useState<number | null>(null);

  const selectedEmailData = mockEmails.find(email => email.id === selectedEmail);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Email List */}
      <div className="lg:col-span-1 space-y-4">
        <EmailList
          emails={mockEmails}
          selectedEmail={selectedEmail}
          onEmailSelect={setSelectedEmail}
        />
      </div>

      {/* Email Detail */}
      <div className="lg:col-span-2">
        {selectedEmailData ? (
          <EmailDetail email={selectedEmailData} />
        ) : (
          <EmailDetailEmpty />
        )}
      </div>
    </div>
  );
};

export default UnifiedInbox;
