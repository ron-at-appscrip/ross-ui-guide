import { supabase } from '@/integrations/supabase/client';
import { emailServiceWithDevMode as emailService } from './emailServiceWithDevMode';

export interface Communication {
  id: string;
  clientId: string;
  clientName: string;
  matterId?: string;
  matterName?: string;
  type: 'email' | 'phone' | 'meeting' | 'letter' | 'fax' | 'sms';
  direction: 'inbound' | 'outbound';
  subject: string;
  content?: string;
  summary?: string;
  participants: CommunicationParticipant[];
  date: string;
  time: string;
  duration?: string; // For calls and meetings
  billable: boolean;
  billableHours?: number;
  hourlyRate?: number;
  status: 'draft' | 'sent' | 'received' | 'completed' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  tags: string[];
  attachments: CommunicationAttachment[];
  followUpRequired: boolean;
  followUpDate?: string;
  followUpNotes?: string;
  reminderDate?: string;
  createdBy: string;
  createdByName: string;
  createdAt: string;
  updatedAt: string;
  metadata: {
    source: 'manual' | 'email_integration' | 'phone_system' | 'calendar';
    originalMessageId?: string;
    threadId?: string;
    callRecordingUrl?: string;
    meetingRecordingUrl?: string;
    location?: string; // For meetings
    dialInInfo?: string; // For virtual meetings
  };
}

export interface CommunicationParticipant {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  role: 'client' | 'attorney' | 'staff' | 'opposing_counsel' | 'third_party';
  organization?: string;
}

export interface CommunicationAttachment {
  id: string;
  name: string;
  type: string;
  size: number;
  url: string;
}

export interface CommunicationTemplate {
  id: string;
  name: string;
  type: Communication['type'];
  subject: string;
  content: string;
  category: 'general' | 'matter_update' | 'billing' | 'scheduling' | 'legal_notice';
  tags: string[];
  isActive: boolean;
  createdAt: string;
}

export interface CommunicationStats {
  totalCommunications: number;
  thisWeek: number;
  thisMonth: number;
  byType: Record<string, number>;
  byDirection: Record<string, number>;
  pendingFollowUps: number;
  avgResponseTime: string;
  billableHours: number;
  unbilledCommunications: number;
}

export interface CallLogEntry {
  clientId: string;
  clientName: string;
  matterId?: string;
  matterName?: string;
  callType: 'inbound' | 'outbound';
  purpose: string;
  duration: string;
  participants: string[];
  outcome: string;
  nextSteps: string[];
  billable: boolean;
  billableHours?: number;
  followUpRequired: boolean;
  followUpDate?: string;
  followUpNotes?: string;
  tags: string[];
}

export interface EmailData {
  to: string[];
  cc?: string[];
  bcc?: string[];
  subject: string;
  content: string;
  attachments?: File[];
  template?: string;
  priority: Communication['priority'];
  requestReadReceipt: boolean;
  sendLater?: string;
}

export interface MeetingData {
  title: string;
  date: string;
  time: string;
  duration: string;
  type: 'in_person' | 'virtual';
  location?: string;
  meetingUrl?: string;
  dialInInfo?: string;
  agenda: string;
  participants: string[];
  reminderMinutes: number;
  sendCalendarInvite: boolean;
  notes?: string;
}

class ClientCommunicationService {
  async getCommunications(clientId: string, filters?: {
    matterId?: string;
    type?: Communication['type'];
    direction?: Communication['direction'];
    startDate?: string;
    endDate?: string;
    followUpRequired?: boolean;
  }): Promise<Communication[]> {
    try {
      // This would integrate with Supabase in a real implementation
      const mockCommunications: Communication[] = [
        {
          id: '1',
          clientId,
          clientName: 'John Smith',
          matterId: '1',
          matterName: 'Corporate Merger - TechFusion Acquisition',
          type: 'email',
          direction: 'outbound',
          subject: 'Contract Review Status Update',
          content: 'Dear John, I wanted to provide you with an update on the contract review process...',
          summary: 'Status update on contract review progress',
          participants: [
            {
              id: '1',
              name: 'Sarah Johnson',
              email: 'sarah.johnson@firm.com',
              role: 'attorney'
            },
            {
              id: '2',
              name: 'John Smith',
              email: 'john.smith@email.com',
              role: 'client'
            }
          ],
          date: '2024-03-10',
          time: '14:30',
          billable: true,
          billableHours: 0.5,
          hourlyRate: 750,
          status: 'sent',
          priority: 'medium',
          tags: ['Contract Review', 'Status Update'],
          attachments: [],
          followUpRequired: true,
          followUpDate: '2024-03-15',
          followUpNotes: 'Follow up on client questions about termination clause',
          createdBy: '1',
          createdByName: 'Sarah Johnson',
          createdAt: '2024-03-10T14:30:00Z',
          updatedAt: '2024-03-10T14:30:00Z',
          metadata: {
            source: 'manual',
            threadId: 'email_thread_123'
          }
        },
        {
          id: '2',
          clientId,
          clientName: 'John Smith',
          matterId: '1',
          matterName: 'Corporate Merger - TechFusion Acquisition',
          type: 'phone',
          direction: 'inbound',
          subject: 'Client Consultation Call',
          summary: 'Discussion about merger timeline and regulatory requirements',
          participants: [
            {
              id: '1',
              name: 'Michael Chen',
              phone: '+1-555-0150',
              role: 'attorney'
            },
            {
              id: '2',
              name: 'John Smith',
              phone: '+1-555-0101',
              role: 'client'
            }
          ],
          date: '2024-03-09',
          time: '10:00',
          duration: '45 minutes',
          billable: true,
          billableHours: 0.75,
          hourlyRate: 750,
          status: 'completed',
          priority: 'high',
          tags: ['Consultation', 'Merger', 'Timeline'],
          attachments: [],
          followUpRequired: true,
          followUpDate: '2024-03-12',
          followUpNotes: 'Send updated timeline and regulatory checklist',
          createdBy: '2',
          createdByName: 'Michael Chen',
          createdAt: '2024-03-09T10:00:00Z',
          updatedAt: '2024-03-09T10:45:00Z',
          metadata: {
            source: 'phone_system',
            callRecordingUrl: 'https://recordings.example.com/call_123'
          }
        },
        {
          id: '3',
          clientId,
          clientName: 'John Smith',
          type: 'meeting',
          direction: 'outbound',
          subject: 'Quarterly Legal Review Meeting',
          summary: 'Comprehensive review of all active matters and upcoming requirements',
          participants: [
            {
              id: '1',
              name: 'Sarah Johnson',
              email: 'sarah.johnson@firm.com',
              role: 'attorney'
            },
            {
              id: '2',
              name: 'John Smith',
              email: 'john.smith@email.com',
              role: 'client'
            },
            {
              id: '3',
              name: 'Legal Team',
              role: 'staff'
            }
          ],
          date: '2024-03-05',
          time: '15:00',
          duration: '90 minutes',
          billable: true,
          billableHours: 1.5,
          hourlyRate: 750,
          status: 'completed',
          priority: 'medium',
          tags: ['Quarterly Review', 'Strategy', 'Planning'],
          attachments: [
            {
              id: '1',
              name: 'Quarterly_Review_Agenda.pdf',
              type: 'application/pdf',
              size: 245760,
              url: 'https://documents.example.com/agenda_123.pdf'
            }
          ],
          followUpRequired: false,
          createdBy: '1',
          createdByName: 'Sarah Johnson',
          createdAt: '2024-03-05T15:00:00Z',
          updatedAt: '2024-03-05T16:30:00Z',
          metadata: {
            source: 'calendar',
            location: 'Conference Room A',
            meetingRecordingUrl: 'https://recordings.example.com/meeting_123'
          }
        }
      ];

      // Apply filters
      let filteredCommunications = mockCommunications.filter(comm => comm.clientId === clientId);

      if (filters) {
        if (filters.matterId) {
          filteredCommunications = filteredCommunications.filter(comm => comm.matterId === filters.matterId);
        }
        if (filters.type) {
          filteredCommunications = filteredCommunications.filter(comm => comm.type === filters.type);
        }
        if (filters.direction) {
          filteredCommunications = filteredCommunications.filter(comm => comm.direction === filters.direction);
        }
        if (filters.followUpRequired !== undefined) {
          filteredCommunications = filteredCommunications.filter(comm => comm.followUpRequired === filters.followUpRequired);
        }
      }

      return filteredCommunications;
    } catch (error) {
      console.error('Error fetching communications:', error);
      throw new Error('Failed to fetch communications');
    }
  }

  async logCall(callData: CallLogEntry): Promise<Communication> {
    try {
      const communication: Communication = {
        id: `call_${Date.now()}`,
        clientId: callData.clientId,
        clientName: callData.clientName,
        matterId: callData.matterId,
        matterName: callData.matterName,
        type: 'phone',
        direction: callData.callType,
        subject: callData.purpose,
        summary: `Call outcome: ${callData.outcome}`,
        participants: [
          {
            id: '1',
            name: 'Current User',
            role: 'attorney'
          },
          {
            id: '2',
            name: callData.clientName,
            role: 'client'
          },
          ...callData.participants.map((name, index) => ({
            id: `p_${index + 3}`,
            name,
            role: 'third_party' as const
          }))
        ],
        date: new Date().toISOString().split('T')[0],
        time: new Date().toLocaleTimeString('en-US', { hour12: false }),
        duration: callData.duration,
        billable: callData.billable,
        billableHours: callData.billableHours,
        hourlyRate: 750,
        status: 'completed',
        priority: 'medium',
        tags: callData.tags,
        attachments: [],
        followUpRequired: callData.followUpRequired,
        followUpDate: callData.followUpDate,
        followUpNotes: callData.followUpNotes,
        createdBy: '1',
        createdByName: 'Current User',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        metadata: {
          source: 'manual'
        }
      };

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      return communication;
    } catch (error) {
      console.error('Error logging call:', error);
      throw new Error('Failed to log call');
    }
  }

  async sendEmail(emailData: EmailData, clientId: string, clientName: string): Promise<Communication> {
    try {
      // Convert attachments to base64 format for real email service
      const attachments = emailData.attachments ? await Promise.all(
        emailData.attachments.map(async (file) => ({
          filename: file.name,
          content: await this.fileToBase64(file),
          contentType: file.type
        }))
      ) : undefined;

      // Send real email using the email service
      const emailLog = await emailService.sendEmail({
        to: emailData.to,
        cc: emailData.cc,
        bcc: emailData.bcc,
        subject: emailData.subject,
        htmlContent: this.convertToHtml(emailData.content),
        clientId,
        priority: emailData.priority,
        attachments
      });

      // Create communication record for tracking
      const communication: Communication = {
        id: emailLog.id,
        clientId,
        clientName,
        type: 'email',
        direction: 'outbound',
        subject: emailData.subject,
        content: emailData.content,
        participants: [
          {
            id: '1',
            name: 'Current User',
            email: 'user@firm.com',
            role: 'attorney'
          },
          ...emailData.to.map((email, index) => ({
            id: `to_${index}`,
            name: email.includes('@') ? email.split('@')[0] : email,
            email,
            role: 'client' as const
          }))
        ],
        date: new Date().toISOString().split('T')[0],
        time: new Date().toLocaleTimeString('en-US', { hour12: false }),
        billable: true,
        billableHours: 0.25,
        hourlyRate: 750,
        status: emailLog.status === 'sent' ? 'sent' : 'draft',
        priority: emailData.priority,
        tags: ['Email'],
        attachments: emailData.attachments?.map((file, index) => ({
          id: `att_${index}`,
          name: file.name,
          type: file.type,
          size: file.size,
          url: `temp_url_${index}`
        })) || [],
        followUpRequired: false,
        createdBy: '1',
        createdByName: 'Current User',
        createdAt: emailLog.sent_at,
        updatedAt: emailLog.updated_at,
        metadata: {
          source: 'email_integration',
          originalMessageId: emailLog.resend_email_id,
          emailLogId: emailLog.id
        }
      };

      return communication;
    } catch (error) {
      console.error('Error sending email:', error);
      throw new Error(`Failed to send email: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private async fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const result = reader.result as string;
        // Remove the data URL prefix (e.g., "data:image/png;base64,")
        const base64 = result.split(',')[1];
        resolve(base64);
      };
      reader.onerror = error => reject(error);
    });
  }

  private convertToHtml(content: string): string {
    // Convert plain text to HTML, preserving line breaks
    return content
      .replace(/\n\n/g, '</p><p>')
      .replace(/\n/g, '<br>')
      .replace(/^(.*)$/, '<p>$1</p>');
  }

  async scheduleMeeting(meetingData: MeetingData, clientId: string, clientName: string): Promise<Communication> {
    try {
      const communication: Communication = {
        id: `meeting_${Date.now()}`,
        clientId,
        clientName,
        type: 'meeting',
        direction: 'outbound',
        subject: meetingData.title,
        content: meetingData.agenda,
        participants: [
          {
            id: '1',
            name: 'Current User',
            role: 'attorney'
          },
          {
            id: '2',
            name: clientName,
            role: 'client'
          },
          ...meetingData.participants.map((name, index) => ({
            id: `p_${index + 3}`,
            name,
            role: 'third_party' as const
          }))
        ],
        date: meetingData.date,
        time: meetingData.time,
        duration: meetingData.duration,
        billable: true,
        billableHours: parseFloat(meetingData.duration.replace(/[^\d.]/g, '')),
        hourlyRate: 750,
        status: 'draft',
        priority: 'medium',
        tags: ['Meeting', 'Scheduled'],
        attachments: [],
        followUpRequired: false,
        reminderDate: new Date(new Date(meetingData.date).getTime() - meetingData.reminderMinutes * 60000).toISOString(),
        createdBy: '1',
        createdByName: 'Current User',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        metadata: {
          source: 'calendar',
          location: meetingData.location,
          meetingUrl: meetingData.meetingUrl,
          dialInInfo: meetingData.dialInInfo
        }
      };

      // Simulate meeting scheduling delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      return communication;
    } catch (error) {
      console.error('Error scheduling meeting:', error);
      throw new Error('Failed to schedule meeting');
    }
  }

  async getCommunicationStats(clientId: string): Promise<CommunicationStats> {
    try {
      const communications = await this.getCommunications(clientId);
      
      const now = new Date();
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

      const stats: CommunicationStats = {
        totalCommunications: communications.length,
        thisWeek: communications.filter(comm => new Date(comm.date) > weekAgo).length,
        thisMonth: communications.filter(comm => new Date(comm.date) > monthAgo).length,
        byType: {},
        byDirection: {},
        pendingFollowUps: communications.filter(comm => comm.followUpRequired).length,
        avgResponseTime: '2.5 hours',
        billableHours: communications.reduce((sum, comm) => sum + (comm.billableHours || 0), 0),
        unbilledCommunications: communications.filter(comm => comm.billable && !comm.metadata.originalMessageId?.includes('billed')).length
      };

      // Count by type
      communications.forEach(comm => {
        stats.byType[comm.type] = (stats.byType[comm.type] || 0) + 1;
      });

      // Count by direction
      communications.forEach(comm => {
        stats.byDirection[comm.direction] = (stats.byDirection[comm.direction] || 0) + 1;
      });

      return stats;
    } catch (error) {
      console.error('Error fetching communication stats:', error);
      throw new Error('Failed to fetch communication statistics');
    }
  }

  async getTemplates(type?: Communication['type']): Promise<CommunicationTemplate[]> {
    try {
      const mockTemplates: CommunicationTemplate[] = [
        {
          id: '1',
          name: 'Case Status Update',
          type: 'email',
          subject: 'Update on your case - {{matterName}}',
          content: 'Dear {{clientName}},\n\nI wanted to provide you with an update on your case...',
          category: 'matter_update',
          tags: ['Status', 'Update'],
          isActive: true,
          createdAt: '2024-01-01T00:00:00Z'
        },
        {
          id: '2',
          name: 'Invoice Notification',
          type: 'email',
          subject: 'Invoice {{invoiceNumber}} - Payment Due',
          content: 'Dear {{clientName}},\n\nPlease find attached your invoice...',
          category: 'billing',
          tags: ['Invoice', 'Payment'],
          isActive: true,
          createdAt: '2024-01-01T00:00:00Z'
        },
        {
          id: '3',
          name: 'Meeting Confirmation',
          type: 'email',
          subject: 'Meeting Confirmation - {{meetingDate}}',
          content: 'Dear {{clientName}},\n\nThis confirms our meeting scheduled for...',
          category: 'scheduling',
          tags: ['Meeting', 'Confirmation'],
          isActive: true,
          createdAt: '2024-01-01T00:00:00Z'
        }
      ];

      let filteredTemplates = mockTemplates;
      if (type) {
        filteredTemplates = mockTemplates.filter(template => template.type === type);
      }

      return filteredTemplates.filter(template => template.isActive);
    } catch (error) {
      console.error('Error fetching templates:', error);
      throw new Error('Failed to fetch communication templates');
    }
  }

  async markFollowUpComplete(communicationId: string): Promise<void> {
    try {
      // This would update the communication in Supabase
      await new Promise(resolve => setTimeout(resolve, 500));
    } catch (error) {
      console.error('Error marking follow-up complete:', error);
      throw new Error('Failed to mark follow-up as complete');
    }
  }

  async deleteCommunication(communicationId: string): Promise<void> {
    try {
      // This would delete the communication from Supabase
      await new Promise(resolve => setTimeout(resolve, 500));
    } catch (error) {
      console.error('Error deleting communication:', error);
      throw new Error('Failed to delete communication');
    }
  }
}

export const clientCommunicationService = new ClientCommunicationService();