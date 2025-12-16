import React from 'react';
import {
  Html,
  Head,
  Preview,
  Body,
  Container,
  Section,
  Row,
  Column,
  Heading,
  Text,
  Hr,
  Link,
  Img,
} from '@react-email/components';

export interface BaseEmailProps {
  firmName?: string;
  firmAddress?: string;
  firmPhone?: string;
  firmEmail?: string;
  clientName?: string;
  previewText?: string;
  children: React.ReactNode;
}

export const BaseEmailTemplate: React.FC<BaseEmailProps> = ({
  firmName = "Ross AI Law Firm",
  firmAddress = "123 Legal Boulevard, Suite 456, Legal City, LC 12345",
  firmPhone = "(555) 123-4567",
  firmEmail = "contact@rossailaw.com",
  previewText = "Important communication from your legal team",
  children,
}) => {
  const main = {
    backgroundColor: '#ffffff',
    fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Oxygen-Sans,Ubuntu,Cantarell,"Helvetica Neue",sans-serif',
  };

  const container = {
    margin: '0 auto',
    padding: '20px 0 48px',
    maxWidth: '600px',
  };

  const header = {
    backgroundColor: '#1e40af',
    padding: '24px',
    borderRadius: '8px 8px 0 0',
  };

  const firmNameStyle = {
    color: '#ffffff',
    fontSize: '28px',
    fontWeight: 'bold',
    margin: '0',
    textAlign: 'center' as const,
  };

  const taglineStyle = {
    color: '#e5e7eb',
    fontSize: '14px',
    margin: '8px 0 0 0',
    textAlign: 'center' as const,
  };

  const content = {
    backgroundColor: '#ffffff',
    padding: '32px 24px',
    border: '1px solid #e5e7eb',
    borderTop: 'none',
  };

  const footer = {
    backgroundColor: '#f9fafb',
    padding: '24px',
    borderRadius: '0 0 8px 8px',
    border: '1px solid #e5e7eb',
    borderTop: 'none',
  };

  const footerText = {
    color: '#6b7280',
    fontSize: '12px',
    lineHeight: '16px',
    margin: '0',
    textAlign: 'center' as const,
  };

  const confidentialityNotice = {
    color: '#ef4444',
    fontSize: '11px',
    fontWeight: 'bold',
    margin: '16px 0 0 0',
    textAlign: 'center' as const,
  };

  return (
    <Html>
      <Head />
      <Preview>{previewText}</Preview>
      <Body style={main}>
        <Container style={container}>
          {/* Header */}
          <Section style={header}>
            <Heading style={firmNameStyle}>{firmName}</Heading>
            <Text style={taglineStyle}>Professional Legal Services</Text>
          </Section>

          {/* Content */}
          <Section style={content}>
            {children}
          </Section>

          {/* Footer */}
          <Section style={footer}>
            <Text style={footerText}>
              <strong>{firmName}</strong><br />
              {firmAddress}<br />
              Phone: {firmPhone} | Email: {firmEmail}
            </Text>
            <Hr style={{ margin: '16px 0', border: 'none', borderTop: '1px solid #e5e7eb' }} />
            <Text style={footerText}>
              This email and any attachments are confidential and may be subject to attorney-client privilege.
              If you are not the intended recipient, please notify the sender immediately and delete this email.
            </Text>
            <Text style={confidentialityNotice}>
              ATTORNEY-CLIENT PRIVILEGED AND CONFIDENTIAL COMMUNICATION
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
};

export default BaseEmailTemplate;