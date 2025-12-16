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

export interface AttachmentInfo {
  name: string;
  type: string;
  size?: string;
}

export interface ClientCommunicationProps extends Omit<BaseEmailProps, 'children'> {
  clientName: string;
  matterName: string;
  matterNumber?: string;
  subject: string;
  message: string;
  attorneyName: string;
  attorneyTitle?: string;
  attorneyPhone?: string;
  attorneyEmail?: string;
  attachments?: AttachmentInfo[];
  urgencyLevel?: 'low' | 'normal' | 'high' | 'urgent';
  nextSteps?: string[];
  clientPortalUrl?: string;
}

export const ClientCommunicationTemplate: React.FC<ClientCommunicationProps> = ({
  clientName,
  matterName,
  matterNumber,
  subject,
  message,
  attorneyName,
  attorneyTitle = 'Attorney',
  attorneyPhone,
  attorneyEmail,
  attachments = [],
  urgencyLevel = 'normal',
  nextSteps = [],
  clientPortalUrl,
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

  const urgencyColors = {
    low: '#10b981',
    normal: '#6b7280',
    high: '#f59e0b',
    urgent: '#ef4444',
  };

  const urgencyStyle = {
    color: urgencyColors[urgencyLevel],
    fontSize: '12px',
    fontWeight: 'bold',
    textTransform: 'uppercase' as const,
    margin: '0 0 16px 0',
  };

  const attachmentStyle = {
    backgroundColor: '#f9fafb',
    border: '1px solid #e5e7eb',
    borderRadius: '6px',
    padding: '12px',
    margin: '8px 0',
    fontSize: '14px',
    color: '#374151',
  };

  const buttonStyle = {
    backgroundColor: '#1e40af',
    borderRadius: '6px',
    color: '#ffffff',
    fontSize: '16px',
    fontWeight: 'bold',
    textDecoration: 'none',
    textAlign: 'center' as const,
    display: 'block',
    padding: '12px 24px',
    margin: '16px 0',
  };

  const signatureStyle = {
    borderTop: '1px solid #e5e7eb',
    paddingTop: '16px',
    marginTop: '32px',
  };

  return (
    <BaseEmailTemplate
      {...baseProps}
      previewText={`${subject} - ${matterName}`}
    >
      {urgencyLevel !== 'normal' && (
        <Text style={urgencyStyle}>
          {urgencyLevel === 'urgent' ? '🚨 URGENT' : urgencyLevel.toUpperCase()} - PRIORITY COMMUNICATION
        </Text>
      )}

      <Heading style={headingStyle}>{subject}</Heading>
      
      <Section style={matterInfoStyle}>
        <Row>
          <Column style={{ width: '50%' }}>
            <Text style={{ ...textStyle, margin: '0', fontSize: '12px', color: '#6b7280' }}>
              <strong>Client:</strong> {clientName}
            </Text>
          </Column>
          <Column style={{ width: '50%', textAlign: 'right' }}>
            <Text style={{ ...textStyle, margin: '0', fontSize: '12px', color: '#6b7280' }}>
              <strong>Matter:</strong> {matterName}
              {matterNumber && <><br /><strong>Matter #:</strong> {matterNumber}</>}
            </Text>
          </Column>
        </Row>
      </Section>

      <Text style={{ ...textStyle, fontSize: '16px' }}>Dear {clientName},</Text>

      <Section>
        <div dangerouslySetInnerHTML={{ __html: message.replace(/\n/g, '<br />') }} 
             style={textStyle} />
      </Section>

      {nextSteps.length > 0 && (
        <Section>
          <Heading style={subheadingStyle}>Next Steps</Heading>
          <ul style={{ ...textStyle, paddingLeft: '20px' }}>
            {nextSteps.map((step, index) => (
              <li key={index} style={{ marginBottom: '8px' }}>{step}</li>
            ))}
          </ul>
        </Section>
      )}

      {attachments.length > 0 && (
        <Section>
          <Heading style={subheadingStyle}>Attachments</Heading>
          {attachments.map((attachment, index) => (
            <div key={index} style={attachmentStyle}>
              <strong>📎 {attachment.name}</strong>
              <br />
              <span style={{ fontSize: '12px', color: '#6b7280' }}>
                {attachment.type}{attachment.size && ` • ${attachment.size}`}
              </span>
            </div>
          ))}
          <Text style={{ ...textStyle, fontSize: '12px', color: '#6b7280' }}>
            Please review the attached documents carefully. If you have any questions about the attachments, 
            please don't hesitate to contact me.
          </Text>
        </Section>
      )}

      {clientPortalUrl && (
        <Section>
          <Link href={clientPortalUrl} style={buttonStyle}>
            Access Client Portal
          </Link>
          <Text style={{ ...textStyle, fontSize: '12px', color: '#6b7280', textAlign: 'center' }}>
            View case updates, documents, and communicate securely through our client portal
          </Text>
        </Section>
      )}

      <Hr style={{ margin: '32px 0', border: 'none', borderTop: '1px solid #d1d5db' }} />

      <Section>
        <Text style={textStyle}>
          If you have any questions or concerns, please don't hesitate to contact me at your convenience.
        </Text>
        
        <Text style={textStyle}>
          Best regards,
        </Text>
      </Section>

      {/* Attorney Signature */}
      <Section style={signatureStyle}>
        <Text style={{ ...textStyle, margin: '0', fontWeight: 'bold', fontSize: '16px' }}>
          {attorneyName}
        </Text>
        <Text style={{ ...textStyle, margin: '4px 0', color: '#6b7280' }}>
          {attorneyTitle}
        </Text>
        {attorneyPhone && (
          <Text style={{ ...textStyle, margin: '0', fontSize: '14px', color: '#6b7280' }}>
            Direct: {attorneyPhone}
          </Text>
        )}
        {attorneyEmail && (
          <Text style={{ ...textStyle, margin: '0', fontSize: '14px', color: '#6b7280' }}>
            Email: <Link href={`mailto:${attorneyEmail}`} style={{ color: '#1e40af' }}>{attorneyEmail}</Link>
          </Text>
        )}
      </Section>

      <Section style={{ marginTop: '24px' }}>
        <Text style={{ ...textStyle, fontSize: '12px', color: '#6b7280', fontStyle: 'italic' }}>
          This communication may contain attorney work product and other confidential information. 
          Please handle accordingly and contact us immediately if you have received this in error.
        </Text>
      </Section>
    </BaseEmailTemplate>
  );
};

export default ClientCommunicationTemplate;