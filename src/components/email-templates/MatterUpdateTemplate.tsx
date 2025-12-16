import React from 'react';
import {
  Heading,
  Text,
  Section,
  Row,
  Column,
  Hr,
  Link,
} from '@react-email/components';
import { BaseEmailTemplate, BaseEmailProps } from './BaseEmailTemplate';

export interface MatterMilestone {
  title: string;
  description: string;
  status: 'completed' | 'in-progress' | 'upcoming' | 'overdue';
  date?: string;
  dueDate?: string;
}

export interface UpcomingDeadline {
  description: string;
  date: string;
  priority: 'low' | 'medium' | 'high';
  actionRequired?: string;
}

export interface MatterUpdateProps extends Omit<BaseEmailProps, 'children'> {
  clientName: string;
  matterName: string;
  matterNumber?: string;
  updateType: 'progress' | 'milestone' | 'deadline' | 'completion' | 'general';
  summary: string;
  milestones?: MatterMilestone[];
  upcomingDeadlines?: UpcomingDeadline[];
  nextSteps: string[];
  attorneyName: string;
  attorneyTitle?: string;
  estimatedCompletion?: string;
  clientPortalUrl?: string;
  scheduleMeetingUrl?: string;
}

export const MatterUpdateTemplate: React.FC<MatterUpdateProps> = ({
  clientName,
  matterName,
  matterNumber,
  updateType,
  summary,
  milestones = [],
  upcomingDeadlines = [],
  nextSteps,
  attorneyName,
  attorneyTitle = 'Attorney',
  estimatedCompletion,
  clientPortalUrl,
  scheduleMeetingUrl,
  ...baseProps
}) => {
  const headingStyle = {
    color: '#1e40af',
    fontSize: '24px',
    fontWeight: 'bold',
    margin: '0 0 16px 0',
  };

  const subheadingStyle = {
    color: '#374151',
    fontSize: '18px',
    fontWeight: '600',
    margin: '24px 0 12px 0',
  };

  const textStyle = {
    color: '#374151',
    fontSize: '14px',
    lineHeight: '20px',
    margin: '0 0 16px 0',
  };

  const matterInfoStyle = {
    backgroundColor: '#f3f4f6',
    padding: '16px',
    borderRadius: '6px',
    border: '1px solid #d1d5db',
    margin: '16px 0',
  };

  const milestoneStyle = {
    padding: '12px',
    border: '1px solid #e5e7eb',
    borderRadius: '6px',
    margin: '8px 0',
  };

  const statusColors = {
    completed: '#10b981',
    'in-progress': '#3b82f6',
    upcoming: '#6b7280',
    overdue: '#ef4444',
  };

  const priorityColors = {
    low: '#6b7280',
    medium: '#f59e0b',
    high: '#ef4444',
  };

  const getStatusIcon = (status: MatterMilestone['status']) => {
    switch (status) {
      case 'completed': return '✅';
      case 'in-progress': return '🔄';
      case 'upcoming': return '📅';
      case 'overdue': return '⚠️';
      default: return '📋';
    }
  };

  const getPriorityIcon = (priority: UpcomingDeadline['priority']) => {
    switch (priority) {
      case 'high': return '🔴';
      case 'medium': return '🟡';
      case 'low': return '🟢';
      default: return '📋';
    }
  };

  const buttonStyle = {
    backgroundColor: '#1e40af',
    borderRadius: '6px',
    color: '#ffffff',
    fontSize: '14px',
    fontWeight: 'bold',
    textDecoration: 'none',
    textAlign: 'center' as const,
    display: 'inline-block',
    padding: '10px 20px',
    margin: '8px 8px 8px 0',
  };

  const updateTypeLabels = {
    progress: 'Progress Update',
    milestone: 'Milestone Reached',
    deadline: 'Upcoming Deadline',
    completion: 'Matter Completion',
    general: 'Case Update',
  };

  return (
    <BaseEmailTemplate
      {...baseProps}
      previewText={`${updateTypeLabels[updateType]} - ${matterName}`}
    >
      <Heading style={headingStyle}>
        {updateTypeLabels[updateType]} - {matterName}
      </Heading>
      
      <Section style={matterInfoStyle}>
        <Row>
          <Column style={{ width: '60%' }}>
            <Text style={{ ...textStyle, margin: '0', fontSize: '12px', color: '#6b7280' }}>
              <strong>Client:</strong> {clientName}<br />
              <strong>Matter:</strong> {matterName}
              {matterNumber && <><br /><strong>Matter #:</strong> {matterNumber}</>}
            </Text>
          </Column>
          <Column style={{ width: '40%', textAlign: 'right' }}>
            <Text style={{ ...textStyle, margin: '0', fontSize: '12px', color: '#6b7280' }}>
              <strong>Update Date:</strong> {new Date().toLocaleDateString()}<br />
              {estimatedCompletion && (
                <><strong>Est. Completion:</strong> {estimatedCompletion}</>
              )}
            </Text>
          </Column>
        </Row>
      </Section>

      <Text style={{ ...textStyle, fontSize: '16px' }}>Dear {clientName},</Text>

      <Section>
        <Text style={textStyle}>
          I wanted to provide you with an update on the progress of your matter. {summary}
        </Text>
      </Section>

      {milestones.length > 0 && (
        <Section>
          <Heading style={subheadingStyle}>Case Milestones</Heading>
          {milestones.map((milestone, index) => (
            <div key={index} style={{
              ...milestoneStyle,
              borderLeft: `4px solid ${statusColors[milestone.status]}`,
            }}>
              <Text style={{ ...textStyle, margin: '0 0 8px 0', fontWeight: 'bold' }}>
                {getStatusIcon(milestone.status)} {milestone.title}
              </Text>
              <Text style={{ ...textStyle, margin: '0 0 8px 0' }}>
                {milestone.description}
              </Text>
              {(milestone.date || milestone.dueDate) && (
                <Text style={{ ...textStyle, margin: '0', fontSize: '12px', color: '#6b7280' }}>
                  {milestone.date && `Completed: ${milestone.date}`}
                  {milestone.dueDate && `Due: ${milestone.dueDate}`}
                </Text>
              )}
            </div>
          ))}
        </Section>
      )}

      {upcomingDeadlines.length > 0 && (
        <Section>
          <Heading style={subheadingStyle}>Upcoming Deadlines</Heading>
          {upcomingDeadlines.map((deadline, index) => (
            <div key={index} style={{
              ...milestoneStyle,
              borderLeft: `4px solid ${priorityColors[deadline.priority]}`,
            }}>
              <Text style={{ ...textStyle, margin: '0 0 8px 0', fontWeight: 'bold' }}>
                {getPriorityIcon(deadline.priority)} {deadline.description}
              </Text>
              <Text style={{ ...textStyle, margin: '0 0 8px 0', fontSize: '12px', color: '#6b7280' }}>
                <strong>Due Date:</strong> {deadline.date}
              </Text>
              {deadline.actionRequired && (
                <Text style={{ ...textStyle, margin: '0', fontSize: '14px' }}>
                  <strong>Action Required:</strong> {deadline.actionRequired}
                </Text>
              )}
            </div>
          ))}
        </Section>
      )}

      <Section>
        <Heading style={subheadingStyle}>Next Steps</Heading>
        <ul style={{ ...textStyle, paddingLeft: '20px' }}>
          {nextSteps.map((step, index) => (
            <li key={index} style={{ marginBottom: '8px' }}>{step}</li>
          ))}
        </ul>
      </Section>

      <Hr style={{ margin: '32px 0', border: 'none', borderTop: '1px solid #d1d5db' }} />

      {/* Action Buttons */}
      <Section style={{ textAlign: 'center' }}>
        {clientPortalUrl && (
          <Link href={clientPortalUrl} style={buttonStyle}>
            📋 View Full Case Details
          </Link>
        )}
        {scheduleMeetingUrl && (
          <Link href={scheduleMeetingUrl} style={buttonStyle}>
            📅 Schedule Meeting
          </Link>
        )}
      </Section>

      <Section style={{ marginTop: '24px' }}>
        <Text style={textStyle}>
          I will continue to keep you informed of any significant developments in your matter. 
          Please don't hesitate to contact me if you have any questions or concerns about this update.
        </Text>
        
        <Text style={textStyle}>
          Thank you for your continued trust in our legal services.
        </Text>

        <Text style={textStyle}>
          Best regards,
        </Text>
      </Section>

      {/* Attorney Signature */}
      <Section style={{ 
        borderTop: '1px solid #e5e7eb',
        paddingTop: '16px',
        marginTop: '24px',
      }}>
        <Text style={{ ...textStyle, margin: '0', fontWeight: 'bold', fontSize: '16px' }}>
          {attorneyName}
        </Text>
        <Text style={{ ...textStyle, margin: '4px 0 0 0', color: '#6b7280' }}>
          {attorneyTitle}
        </Text>
      </Section>

      <Section style={{ marginTop: '24px' }}>
        <Text style={{ ...textStyle, fontSize: '12px', color: '#6b7280', fontStyle: 'italic' }}>
          This update is provided for informational purposes and does not constitute legal advice. 
          The information contained herein is confidential and subject to attorney-client privilege.
        </Text>
      </Section>
    </BaseEmailTemplate>
  );
};

export default MatterUpdateTemplate;