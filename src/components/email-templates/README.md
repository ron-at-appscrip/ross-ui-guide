# Email Templates

Professional React Email templates for legal communications using `@react-email/components`.

## Overview

This directory contains professional email templates designed specifically for legal practice management. All templates are built with TypeScript, follow legal industry standards, and include comprehensive styling for compatibility across email clients.

## Templates

### 1. BaseEmailTemplate
- **File**: `BaseEmailTemplate.tsx`
- **Purpose**: Reusable foundation for all email templates
- **Features**: 
  - Consistent law firm branding
  - Professional header/footer
  - Legal confidentiality notices
  - Mobile responsive design

### 2. InvoiceEmailTemplate
- **File**: `InvoiceEmailTemplate.tsx`
- **Purpose**: Professional invoice emails with line items and payment instructions
- **Features**:
  - Detailed line item breakdown
  - Tax calculations
  - Payment instructions
  - Client portal integration
  - Currency formatting

### 3. ClientCommunicationTemplate
- **File**: `ClientCommunicationTemplate.tsx`
- **Purpose**: General client communication with matter context
- **Features**:
  - Matter-specific context
  - Attachment indicators
  - Urgency levels
  - Attorney signature blocks
  - Client personalization

### 4. MatterUpdateTemplate
- **File**: `MatterUpdateTemplate.tsx`
- **Purpose**: Case status updates with progress tracking
- **Features**:
  - Milestone tracking with status indicators
  - Upcoming deadlines with priority levels
  - Next steps breakdown
  - Timeline visualization
  - Action buttons for client portal

### 5. WelcomeClientTemplate
- **File**: `WelcomeClientTemplate.tsx`
- **Purpose**: New client onboarding communications
- **Features**:
  - Team introductions
  - Client portal setup
  - Important documents
  - Resource links
  - Scheduling integration

## Usage

### Basic Usage

```typescript
import { InvoiceEmailTemplate } from '@/components/email-templates';
import { render } from '@react-email/render';

const emailHtml = render(
  <InvoiceEmailTemplate
    clientName="John Doe"
    matterName="Contract Review"
    invoiceNumber="INV-2024-001"
    invoiceDate="January 15, 2024"
    dueDate="February 14, 2024"
    lineItems={[
      {
        description: "Legal consultation",
        quantity: 2,
        rate: 350,
        amount: 700,
        date: "2024-01-10"
      }
    ]}
    subtotal={700}
    totalAmount={700}
  />
);
```

### Template Registry

Use the template registry for dynamic template selection:

```typescript
import { EMAIL_TEMPLATES, getEmailTemplate } from '@/components/email-templates';

const TemplateComponent = getEmailTemplate('invoice');
// or
const WelcomeTemplate = EMAIL_TEMPLATES.welcome;
```

### Template Metadata

Access template information for UI components:

```typescript
import { EMAIL_TEMPLATE_METADATA } from '@/components/email-templates';

const invoiceMetadata = EMAIL_TEMPLATE_METADATA.invoice;
// {
//   name: 'Invoice Email',
//   description: 'Professional invoice with line items and payment instructions',
//   category: 'billing',
//   icon: '💰'
// }
```

## Integration Examples

### With Email Service

```typescript
import { render } from '@react-email/render';
import { InvoiceEmailTemplate } from '@/components/email-templates';

const sendInvoiceEmail = async (invoiceData: InvoiceEmailProps) => {
  const html = render(<InvoiceEmailTemplate {...invoiceData} />);
  
  // Send with your email service (e.g., Resend, SendGrid)
  await emailService.send({
    to: invoiceData.clientEmail,
    subject: `Invoice ${invoiceData.invoiceNumber}`,
    html
  });
};
```

### With Supabase Edge Functions

```typescript
// In your edge function
import { render } from '@react-email/render';
import { MatterUpdateTemplate } from '@/components/email-templates';

const updateHtml = render(
  <MatterUpdateTemplate
    clientName="Jane Smith"
    matterName="Litigation Case"
    updateType="progress"
    summary="We have received the discovery documents..."
    nextSteps={[
      "Review discovery documents",
      "Prepare witness statements",
      "Schedule deposition"
    ]}
    attorneyName="Attorney Name"
  />
);
```

## Styling Guidelines

### Email Client Compatibility
- Uses inline styles for maximum compatibility
- Follows email-safe CSS practices
- Tested across major email clients
- Mobile responsive design

### Design System
- **Primary Color**: `#1e40af` (Blue 700)
- **Text Color**: `#374151` (Gray 700)
- **Secondary Text**: `#6b7280` (Gray 500)
- **Font**: System fonts for reliability
- **Layout**: Max width 600px with responsive behavior

### Legal Styling Standards
- Professional typography hierarchy
- Clear section separations
- Confidentiality notices
- Attorney branding consistency

## TypeScript Types

All templates include comprehensive TypeScript interfaces:

```typescript
interface InvoiceLineItem {
  description: string;
  quantity: number;
  rate: number;
  amount: number;
  date?: string;
}

interface InvoiceEmailProps extends BaseEmailProps {
  clientName: string;
  matterName: string;
  invoiceNumber: string;
  // ... other props
}
```

## Customization

### Firm Branding
Override default firm information in BaseEmailProps:

```typescript
<InvoiceEmailTemplate
  firmName="Your Law Firm"
  firmAddress="123 Legal Street, Law City, LC 12345"
  firmPhone="(555) 123-4567"
  firmEmail="contact@yourlawfirm.com"
  // ... other props
/>
```

### Custom Styling
Extend template styles by modifying the style objects within each template component.

## Development

### Adding New Templates
1. Create new template component extending BaseEmailTemplate
2. Define TypeScript interfaces for props
3. Add to EMAIL_TEMPLATES registry in index.ts
4. Update EMAIL_TEMPLATE_METADATA
5. Add usage examples to README

### Testing Templates
Use the React Email CLI for preview and testing:

```bash
npx react-email dev
```

## Legal Compliance

All templates include:
- Attorney-client privilege notices
- Confidentiality warnings
- Professional disclaimers
- Proper legal communication formatting

## Best Practices

1. **Always use TypeScript**: Ensures type safety and better developer experience
2. **Test across email clients**: Verify rendering in major email platforms
3. **Keep mobile responsive**: Use responsive design patterns
4. **Include accessibility**: Use semantic HTML and proper contrast
5. **Legal compliance**: Always include required legal notices
6. **Variable validation**: Validate all input data before rendering
7. **Error handling**: Implement proper error boundaries for production use

## Dependencies

- `@react-email/components`: Email component library
- `@react-email/render`: Template rendering
- `react`: React framework
- `typescript`: Type safety