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

export interface InvoiceLineItem {
  description: string;
  quantity: number;
  rate: number;
  amount: number;
  date?: string;
}

export interface InvoiceEmailProps extends Omit<BaseEmailProps, 'children'> {
  clientName: string;
  matterName: string;
  invoiceNumber: string;
  invoiceDate: string;
  dueDate: string;
  lineItems: InvoiceLineItem[];
  subtotal: number;
  taxAmount?: number;
  totalAmount: number;
  paymentInstructions?: string;
  clientPortalUrl?: string;
}

export const InvoiceEmailTemplate: React.FC<InvoiceEmailProps> = ({
  clientName,
  matterName,
  invoiceNumber,
  invoiceDate,
  dueDate,
  lineItems,
  subtotal,
  taxAmount = 0,
  totalAmount,
  paymentInstructions,
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
    margin: '0 0 8px 0',
  };

  const tableHeaderStyle = {
    backgroundColor: '#f3f4f6',
    padding: '12px',
    borderBottom: '1px solid #d1d5db',
    fontSize: '12px',
    fontWeight: 'bold',
    color: '#374151',
  };

  const tableCellStyle = {
    padding: '12px',
    borderBottom: '1px solid #e5e7eb',
    fontSize: '14px',
    color: '#374151',
  };

  const totalRowStyle = {
    backgroundColor: '#f9fafb',
    padding: '12px',
    fontSize: '14px',
    fontWeight: 'bold',
    color: '#1e40af',
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

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  return (
    <BaseEmailTemplate
      {...baseProps}
      previewText={`Invoice ${invoiceNumber} for ${matterName} - ${formatCurrency(totalAmount)}`}
    >
      <Heading style={headingStyle}>Invoice {invoiceNumber}</Heading>
      
      <Section>
        <Row>
          <Column style={{ width: '50%' }}>
            <Text style={textStyle}>
              <strong>Bill To:</strong><br />
              {clientName}
            </Text>
          </Column>
          <Column style={{ width: '50%', textAlign: 'right' }}>
            <Text style={textStyle}>
              <strong>Invoice Date:</strong> {invoiceDate}<br />
              <strong>Due Date:</strong> {dueDate}
            </Text>
          </Column>
        </Row>
      </Section>

      <Section style={{ margin: '24px 0' }}>
        <Text style={subheadingStyle}>Matter: {matterName}</Text>
      </Section>

      <Hr style={{ margin: '24px 0', border: 'none', borderTop: '1px solid #d1d5db' }} />

      {/* Invoice Items Table */}
      <Section>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={{ ...tableHeaderStyle, textAlign: 'left', width: '45%' }}>Description</th>
              <th style={{ ...tableHeaderStyle, textAlign: 'center', width: '15%' }}>Qty/Hours</th>
              <th style={{ ...tableHeaderStyle, textAlign: 'right', width: '20%' }}>Rate</th>
              <th style={{ ...tableHeaderStyle, textAlign: 'right', width: '20%' }}>Amount</th>
            </tr>
          </thead>
          <tbody>
            {lineItems.map((item, index) => (
              <tr key={index}>
                <td style={{ ...tableCellStyle, textAlign: 'left' }}>
                  {item.description}
                  {item.date && (
                    <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '4px' }}>
                      {item.date}
                    </div>
                  )}
                </td>
                <td style={{ ...tableCellStyle, textAlign: 'center' }}>{item.quantity}</td>
                <td style={{ ...tableCellStyle, textAlign: 'right' }}>{formatCurrency(item.rate)}</td>
                <td style={{ ...tableCellStyle, textAlign: 'right' }}>{formatCurrency(item.amount)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Section>

      {/* Totals */}
      <Section style={{ marginTop: '24px' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <tbody>
            <tr>
              <td style={{ ...tableCellStyle, textAlign: 'right', borderBottom: 'none', fontWeight: '600' }}>
                Subtotal:
              </td>
              <td style={{ ...tableCellStyle, textAlign: 'right', borderBottom: 'none', fontWeight: '600', width: '20%' }}>
                {formatCurrency(subtotal)}
              </td>
            </tr>
            {taxAmount > 0 && (
              <tr>
                <td style={{ ...tableCellStyle, textAlign: 'right', borderBottom: 'none' }}>Tax:</td>
                <td style={{ ...tableCellStyle, textAlign: 'right', borderBottom: 'none', width: '20%' }}>
                  {formatCurrency(taxAmount)}
                </td>
              </tr>
            )}
            <tr>
              <td style={{ ...totalRowStyle, textAlign: 'right' }}>Total Amount Due:</td>
              <td style={{ ...totalRowStyle, textAlign: 'right', width: '20%' }}>
                {formatCurrency(totalAmount)}
              </td>
            </tr>
          </tbody>
        </table>
      </Section>

      <Hr style={{ margin: '32px 0', border: 'none', borderTop: '2px solid #1e40af' }} />

      {/* Payment Instructions */}
      <Section>
        <Heading style={{ ...subheadingStyle, color: '#1e40af' }}>Payment Instructions</Heading>
        <Text style={textStyle}>
          {paymentInstructions || 
            `Payment is due within 30 days of the invoice date. Please include invoice number ${invoiceNumber} with your payment.`
          }
        </Text>
        
        {clientPortalUrl && (
          <Link href={clientPortalUrl} style={buttonStyle}>
            Pay Online - Client Portal
          </Link>
        )}
      </Section>

      <Section style={{ marginTop: '32px' }}>
        <Text style={{ ...textStyle, fontSize: '12px', color: '#6b7280' }}>
          Questions about this invoice? Please contact us immediately. We appreciate your prompt payment.
        </Text>
      </Section>
    </BaseEmailTemplate>
  );
};

export default InvoiceEmailTemplate;