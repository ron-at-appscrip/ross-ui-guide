
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { Matter } from '@/types/matter';
import MattersTableEnhanced from '@/components/matters/MattersTableEnhanced';

interface ClientMattersProps {
  clientId: string;
  onNewMatter?: () => void;
}

// Import the same mock matters from the Matters page
const mockMatters: Matter[] = [
  {
    id: '1',
    title: 'Corporate Merger - TechFusion Acquisition',
    description: 'Legal analysis and due diligence for the acquisition of TechFusion Inc. by GlobalTech Corp.',
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
    customFields: {
      dealValue: '$50M',
      targetCloseDate: '2025-02-15',
      regulatoryApproval: 'Required'
    },
    notificationSettings: {
      email: true,
      sms: true,
      deadlineReminders: true,
      clientNotifications: true,
      taskNotifications: true
    },
    billingPreference: {
      method: 'hourly',
      hourlyRate: 750,
      expenseTracking: true
    },
    permissions: {
      fileAccess: 'full',
      clientPortalAccess: true,
      documentSharing: true,
      allowedUsers: ['1', '4']
    },
    relatedContacts: [
      {
        id: '1',
        contactId: 'c1',
        contactName: 'John Davis',
        relationship: 'opposing_counsel',
        email: 'john.davis@lawfirm.com',
        phone: '+1-555-0199'
      }
    ],
    taskLists: [],
    documentFolders: [],
    notificationCount: 3
  },
  {
    id: '11',
    title: 'Real Estate Investment Advisory',
    description: 'Legal counsel for commercial real estate investment and financing.',
    clientId: '1',
    clientName: 'John Smith',
    status: 'active',
    priority: 'medium',
    stage: 'open',
    practiceArea: 'Real Estate Law',
    practiceSubArea: 'Commercial',
    responsibleAttorney: 'Emily Rodriguez',
    responsibleAttorneyId: '3',
    responsibleStaff: ['Maria Garcia'],
    responsibleStaffIds: ['3'],
    dateOpened: '2024-10-20',
    lastActivity: '2024-12-01',
    billedAmount: 18500,
    estimatedBudget: 35000,
    timeSpent: 45.0,
    nextActionDate: '2024-12-15',
    tags: ['Real Estate', 'Investment', 'Commercial'],
    notes: 'Client expanding portfolio with new commercial properties.',
    matterNumber: 'M240011',
    customFields: {
      propertyValue: '$2.5M',
      financingType: 'Commercial Loan'
    },
    notificationSettings: {
      email: true,
      sms: false,
      deadlineReminders: true,
      clientNotifications: true,
      taskNotifications: false
    },
    billingPreference: {
      method: 'hourly',
      hourlyRate: 650,
      expenseTracking: true
    },
    permissions: {
      fileAccess: 'full',
      clientPortalAccess: true,
      documentSharing: true,
      allowedUsers: ['3']
    },
    relatedContacts: [],
    taskLists: [],
    documentFolders: [],
    notificationCount: 1
  },
  {
    id: '12',
    title: 'Estate Planning Update',
    description: 'Annual review and update of estate planning documents.',
    clientId: '1',
    clientName: 'John Smith',
    status: 'closed',
    priority: 'low',
    stage: 'closed',
    practiceArea: 'Estate Planning',
    responsibleAttorney: 'Lisa Park',
    responsibleAttorneyId: '6',
    responsibleStaff: ['Jennifer Adams'],
    responsibleStaffIds: ['1'],
    dateOpened: '2024-08-15',
    dateClosed: '2024-09-30',
    lastActivity: '2024-09-30',
    billedAmount: 5500,
    estimatedBudget: 6000,
    timeSpent: 18.0,
    tags: ['Estate Planning', 'Documentation', 'Review'],
    notes: 'Annual estate planning review completed successfully.',
    matterNumber: 'M240012',
    customFields: {
      documentType: 'Will and Trust Review'
    },
    notificationSettings: {
      email: false,
      sms: false,
      deadlineReminders: false,
      clientNotifications: false,
      taskNotifications: false
    },
    billingPreference: {
      method: 'flat_fee',
      flatFeeAmount: 6000,
      expenseTracking: false
    },
    permissions: {
      fileAccess: 'limited',
      clientPortalAccess: false,
      documentSharing: false,
      allowedUsers: ['6']
    },
    relatedContacts: [],
    taskLists: [],
    documentFolders: [],
    notificationCount: 0
  }
];

const ClientMatters = ({ clientId, onNewMatter }: ClientMattersProps) => {
  
  // Filter matters for this specific client
  const clientMatters = mockMatters.filter(matter => matter.clientId === clientId);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Client Matters</h3>
          <p className="text-sm text-muted-foreground">
            {clientMatters.length} {clientMatters.length === 1 ? 'matter' : 'matters'} for this client
          </p>
        </div>
        <Button onClick={onNewMatter}>
          <Plus className="h-4 w-4 mr-2" />
          New Matter
        </Button>
      </div>
      
      {clientMatters.length > 0 ? (
        <MattersTableEnhanced matters={clientMatters} title="" pageSize={5} />
      ) : (
        <div className="text-center py-8 text-muted-foreground">
          <p>No matters found for this client.</p>
          <Button className="mt-4" onClick={onNewMatter}>
            <Plus className="h-4 w-4 mr-2" />
            Create First Matter
          </Button>
        </div>
      )}
    </div>
  );
};

export default ClientMatters;
