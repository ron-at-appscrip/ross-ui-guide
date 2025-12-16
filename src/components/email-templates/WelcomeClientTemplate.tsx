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

export interface WelcomeResource {
  title: string;
  description: string;
  url?: string;
  type: 'document' | 'portal' | 'form' | 'contact' | 'info';
}

export interface TeamMember {
  name: string;
  role: string;
  email?: string;
  phone?: string;
}

export interface WelcomeClientProps extends Omit<BaseEmailProps, 'children'> {
  clientName: string;
  matterName: string;
  matterType: string;
  primaryAttorneyName: string;
  primaryAttorneyTitle?: string;
  primaryAttorneyEmail?: string;
  primaryAttorneyPhone?: string;
  teamMembers?: TeamMember[];
  clientPortalUrl?: string;
  clientPortalLoginInfo?: {
    username: string;
    temporaryPassword: string;
  };
  nextSteps: string[];
  importantDocuments?: WelcomeResource[];
  resources?: WelcomeResource[];
  schedulingUrl?: string;
  estimatedTimeline?: string;
}

export const WelcomeClientTemplate: React.FC<WelcomeClientProps> = ({
  clientName,
  matterName,
  matterType,
  primaryAttorneyName,
  primaryAttorneyTitle = 'Attorney',
  primaryAttorneyEmail,
  primaryAttorneyPhone,
  teamMembers = [],
  clientPortalUrl,
  clientPortalLoginInfo,
  nextSteps,
  importantDocuments = [],
  resources = [],
  schedulingUrl,
  estimatedTimeline,
  ...baseProps
}) => {
  const headingStyle = {
    color: '#1e40af',
    fontSize: '28px',
    fontWeight: 'bold',
    margin: '0 0 16px 0',
    textAlign: 'center' as const,
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

  const highlightBoxStyle = {
    backgroundColor: '#eff6ff',
    border: '1px solid #93c5fd',
    borderRadius: '8px',
    padding: '20px',
    margin: '20px 0',
  };

  const resourceItemStyle = {
    backgroundColor: '#f9fafb',
    border: '1px solid #e5e7eb',
    borderRadius: '6px',
    padding: '16px',
    margin: '12px 0',
  };

  const buttonPrimaryStyle = {
    backgroundColor: '#1e40af',
    borderRadius: '6px',
    color: '#ffffff',
    fontSize: '16px',
    fontWeight: 'bold',
    textDecoration: 'none',
    textAlign: 'center' as const,
    display: 'block',
    padding: '14px 28px',
    margin: '16px 0',
  };

  const buttonSecondaryStyle = {
    backgroundColor: '#ffffff',
    border: '2px solid #1e40af',
    borderRadius: '6px',
    color: '#1e40af',
    fontSize: '14px',
    fontWeight: 'bold',
    textDecoration: 'none',
    textAlign: 'center' as const,
    display: 'inline-block',
    padding: '10px 20px',
    margin: '8px 8px 8px 0',
  };

  const getResourceIcon = (type: WelcomeResource['type']) => {
    switch (type) {
      case 'document': return '📄';
      case 'portal': return '🌐';
      case 'form': return '📝';
      case 'contact': return '📞';
      case 'info': return 'ℹ️';
      default: return '📋';
    }
  };

  return (
    <BaseEmailTemplate
      {...baseProps}
      previewText={`Welcome to ${baseProps.firmName || 'Ross AI Law Firm'} - ${matterName}`}
    >
      <Heading style={headingStyle}>
        Welcome to Our Legal Team! 🎉
      </Heading>
      
      <Section style={highlightBoxStyle}>
        <Text style={{ ...textStyle, textAlign: 'center', fontSize: '16px', margin: '0' }}>
          <strong>Your Matter:</strong> {matterName}<br />
          <strong>Matter Type:</strong> {matterType}<br />
          {estimatedTimeline && (
            <><strong>Estimated Timeline:</strong> {estimatedTimeline}</>
          )}
        </Text>
      </Section>

      <Text style={{ ...textStyle, fontSize: '16px' }}>Dear {clientName},</Text>

      <Section>
        <Text style={textStyle}>
          Welcome to our firm! We are delighted to represent you in your {matterType.toLowerCase()} matter. 
          Our team is committed to providing you with exceptional legal services and ensuring you are 
          informed and comfortable throughout the entire process.
        </Text>

        <Text style={textStyle}>
          This email contains important information about your case, our team, and the resources available 
          to you. Please take a moment to review everything carefully and don't hesitate to contact us 
          with any questions.
        </Text>
      </Section>

      {/* Team Introduction */}
      <Section>
        <Heading style={subheadingStyle}>Your Legal Team</Heading>
        
        {/* Primary Attorney */}
        <div style={resourceItemStyle}>
          <Text style={{ ...textStyle, margin: '0 0 8px 0', fontWeight: 'bold', fontSize: '16px' }}>
            👨‍💼 {primaryAttorneyName} - {primaryAttorneyTitle}
          </Text>
          <Text style={{ ...textStyle, margin: '0 0 8px 0' }}>
            Primary Attorney for your matter
          </Text>
          {primaryAttorneyEmail && (
            <Text style={{ ...textStyle, margin: '0', fontSize: '12px', color: '#6b7280' }}>
              📧 <Link href={`mailto:${primaryAttorneyEmail}`} style={{ color: '#1e40af' }}>
                {primaryAttorneyEmail}
              </Link>
              {primaryAttorneyPhone && <> | 📞 {primaryAttorneyPhone}</>}
            </Text>
          )}
        </div>

        {/* Team Members */}
        {teamMembers.map((member, index) => (
          <div key={index} style={resourceItemStyle}>
            <Text style={{ ...textStyle, margin: '0 0 8px 0', fontWeight: 'bold' }}>
              👥 {member.name} - {member.role}
            </Text>
            {(member.email || member.phone) && (
              <Text style={{ ...textStyle, margin: '0', fontSize: '12px', color: '#6b7280' }}>
                {member.email && (
                  <>📧 <Link href={`mailto:${member.email}`} style={{ color: '#1e40af' }}>
                    {member.email}
                  </Link></>
                )}
                {member.email && member.phone && ' | '}
                {member.phone && <>📞 {member.phone}</>}
              </Text>
            )}
          </div>
        ))}
      </Section>

      {/* Client Portal Access */}
      {clientPortalUrl && (
        <Section>
          <Heading style={subheadingStyle}>Your Client Portal Access</Heading>
          <div style={highlightBoxStyle}>
            <Text style={{ ...textStyle, margin: '0 0 16px 0' }}>
              We've created a secure client portal where you can:
            </Text>
            <ul style={{ ...textStyle, paddingLeft: '20px', margin: '0 0 16px 0' }}>
              <li>View case updates and documents</li>
              <li>Communicate securely with your legal team</li>
              <li>Track billing and payment information</li>
              <li>Schedule appointments</li>
            </ul>
            
            {clientPortalLoginInfo && (
              <div style={{ backgroundColor: '#ffffff', padding: '12px', borderRadius: '4px', margin: '16px 0' }}>
                <Text style={{ ...textStyle, margin: '0 0 8px 0', fontSize: '12px', fontWeight: 'bold' }}>
                  Login Credentials:
                </Text>
                <Text style={{ ...textStyle, margin: '0', fontSize: '12px', fontFamily: 'monospace' }}>
                  Username: {clientPortalLoginInfo.username}<br />
                  Temporary Password: {clientPortalLoginInfo.temporaryPassword}
                </Text>
                <Text style={{ ...textStyle, margin: '8px 0 0 0', fontSize: '11px', color: '#ef4444' }}>
                  Please change your password upon first login
                </Text>
              </div>
            )}
            
            <Link href={clientPortalUrl} style={buttonPrimaryStyle}>
              Access Your Client Portal
            </Link>
          </div>
        </Section>
      )}

      {/* Next Steps */}
      <Section>
        <Heading style={subheadingStyle}>What Happens Next</Heading>
        <ol style={{ ...textStyle, paddingLeft: '20px' }}>
          {nextSteps.map((step, index) => (
            <li key={index} style={{ marginBottom: '8px' }}>{step}</li>
          ))}
        </ol>
      </Section>

      {/* Important Documents */}
      {importantDocuments.length > 0 && (
        <Section>
          <Heading style={subheadingStyle}>Important Documents</Heading>
          {importantDocuments.map((doc, index) => (
            <div key={index} style={resourceItemStyle}>
              <Text style={{ ...textStyle, margin: '0 0 8px 0', fontWeight: 'bold' }}>
                {getResourceIcon(doc.type)} {doc.title}
              </Text>
              <Text style={{ ...textStyle, margin: '0 0 8px 0' }}>
                {doc.description}
              </Text>
              {doc.url && (
                <Link href={doc.url} style={{ color: '#1e40af', fontSize: '14px' }}>
                  View Document →
                </Link>
              )}
            </div>
          ))}
        </Section>
      )}

      {/* Resources */}
      {resources.length > 0 && (
        <Section>
          <Heading style={subheadingStyle}>Helpful Resources</Heading>
          {resources.map((resource, index) => (
            <div key={index} style={resourceItemStyle}>
              <Text style={{ ...textStyle, margin: '0 0 8px 0', fontWeight: 'bold' }}>
                {getResourceIcon(resource.type)} {resource.title}
              </Text>
              <Text style={{ ...textStyle, margin: '0 0 8px 0' }}>
                {resource.description}
              </Text>
              {resource.url && (
                <Link href={resource.url} style={{ color: '#1e40af', fontSize: '14px' }}>
                  Learn More →
                </Link>
              )}
            </div>
          ))}
        </Section>
      )}

      {/* Action Items */}
      <Section style={{ textAlign: 'center', margin: '32px 0' }}>
        <Text style={{ ...textStyle, textAlign: 'center', fontWeight: 'bold' }}>
          Ready to get started?
        </Text>
        {schedulingUrl && (
          <Link href={schedulingUrl} style={buttonSecondaryStyle}>
            📅 Schedule Initial Meeting
          </Link>
        )}
        {clientPortalUrl && (
          <Link href={clientPortalUrl} style={buttonSecondaryStyle}>
            🌐 Explore Client Portal
          </Link>
        )}
      </Section>

      <Hr style={{ margin: '32px 0', border: 'none', borderTop: '2px solid #1e40af' }} />

      <Section>
        <Text style={textStyle}>
          We understand that legal matters can feel overwhelming, but you're not alone in this process. 
          Our experienced team is here to guide you every step of the way and ensure you receive the 
          best possible outcome for your case.
        </Text>

        <Text style={textStyle}>
          We encourage open communication and want you to feel comfortable reaching out to us at any time 
          with questions, concerns, or updates related to your matter.
        </Text>

        <Text style={textStyle}>
          Thank you for choosing our firm to represent you. We look forward to working with you!
        </Text>

        <Text style={textStyle}>
          Warm regards,
        </Text>
      </Section>

      {/* Attorney Signature */}
      <Section style={{ 
        borderTop: '1px solid #e5e7eb',
        paddingTop: '16px',
        marginTop: '24px',
      }}>
        <Text style={{ ...textStyle, margin: '0', fontWeight: 'bold', fontSize: '16px' }}>
          {primaryAttorneyName}
        </Text>
        <Text style={{ ...textStyle, margin: '4px 0 0 0', color: '#6b7280' }}>
          {primaryAttorneyTitle}
        </Text>
        <Text style={{ ...textStyle, margin: '8px 0 0 0', fontSize: '12px', color: '#6b7280' }}>
          Your dedicated legal advocate
        </Text>
      </Section>
    </BaseEmailTemplate>
  );
};

export default WelcomeClientTemplate;