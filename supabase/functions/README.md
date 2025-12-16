# Ross AI Email Edge Functions

This directory contains comprehensive Supabase Edge Functions for email sending using the Resend API. These functions provide secure, scalable, and feature-rich email capabilities for the Ross AI legal practice management system.

## 🚀 Functions Overview

### 1. **send-email** - Core Email Function
General-purpose email sending with template support, attachments, and comprehensive logging.

### 2. **send-invoice-email** - Invoice Email Function  
Specialized function for sending professional invoice emails with PDF attachments and billing-specific features.

### 3. **send-client-communication** - Client Communication Function
Handles various types of client communications with pre-built templates and activity tracking.

### 4. **_shared** - Shared Utilities
Common utilities, types, validators, and services used across all email functions.

## 🛠️ Setup and Configuration

### Environment Variables Required

```bash
# Supabase Configuration
SUPABASE_URL=your_supabase_project_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Resend API Configuration  
RESEND_API_KEY=your_resend_api_key
FROM_EMAIL=noreply@yourdomain.com
FROM_NAME="Your Firm Name"

# Optional Firm Details
FIRM_NAME="Your Legal Firm"
FIRM_ADDRESS="123 Legal Street, City, State 12345"
FIRM_PHONE="+1-555-123-4567"
FIRM_EMAIL="contact@yourdomain.com"
```

### Database Setup

Run the migration to create required tables:

```bash
supabase db push
```

This creates:
- `email_logs` - Email tracking and logging
- `email_templates` - Reusable email templates  
- `matters` - Case/matter management (if not exists)

## 📧 API Usage Examples

### Core Email Function

```typescript
// Send a basic email
const response = await fetch('/functions/v1/send-email', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${userToken}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    to: ['client@example.com'],
    cc: ['attorney@firm.com'],
    subject: 'Important Legal Update',
    html: '<h1>Hello Client</h1><p>This is an important update...</p>',
    priority: 'high',
    tags: ['legal', 'important']
  })
});

// Send email with template
const templateResponse = await fetch('/functions/v1/send-email', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${userToken}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    to: ['client@example.com'],
    template_id: 'template-uuid',
    template_variables: {
      client_name: 'John Doe',
      matter_title: 'Contract Review',
      attorney_name: 'Jane Smith'
    }
  })
});
```

### Invoice Email Function

```typescript
const invoiceResponse = await fetch('/functions/v1/send-invoice-email', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${userToken}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    invoice_id: 'inv-123',
    client_id: 'client-uuid',
    matter_id: 'matter-uuid',
    invoice_number: 'INV-2024-001',
    amount_due: 2500.00,
    due_date: '2024-08-15',
    invoice_pdf_url: 'https://storage.example.com/invoice.pdf',
    to: ['client@example.com'],
    subject: 'Invoice INV-2024-001 - Payment Due August 15th'
  })
});
```

### Client Communication Function

```typescript
const commResponse = await fetch('/functions/v1/send-client-communication', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${userToken}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    client_id: 'client-uuid',
    matter_id: 'matter-uuid',
    communication_type: 'status_update',
    to: ['client@example.com'],
    subject: 'Case Status Update',
    html: '<p>Your case is progressing well. We have completed...</p>',
    billable: true,
    billable_hours: 0.25,
    follow_up_required: true,
    follow_up_date: '2024-08-05'
  })
});
```

## 🎨 Email Templates

### Built-in Template Types

1. **Invoice Templates** (`category: 'invoice'`)
   - Professional invoice layout
   - Payment instructions
   - Firm branding

2. **Communication Templates** (`category: 'communication'`)
   - Status updates
   - Meeting confirmations  
   - Document requests
   - General communications
   - Billing communications

3. **System Templates** (`category: 'system'`)
   - Welcome emails
   - Password resets
   - Notifications

### Template Variables

Common variables available in all templates:

- `{{client_name}}` - Client's name
- `{{attorney_name}}` - Attorney's name  
- `{{firm_name}}` - Firm name
- `{{matter_title}}` - Matter/case title
- `{{date}}` - Current date
- `{{time}}` - Current time

Invoice-specific variables:

- `{{invoice_number}}` - Invoice number
- `{{amount_due}}` - Amount due
- `{{due_date}}` - Payment due date
- `{{invoice_date}}` - Invoice date

## 📊 Logging and Tracking

All emails are automatically logged to the `email_logs` table with:

- **Status Tracking**: pending → sent → delivered/bounced/failed
- **External ID**: Resend email ID for tracking
- **Metadata**: Priority, tags, attachments, etc.
- **Timestamps**: Sent, delivered, opened, clicked, bounced
- **Error Logging**: Detailed error messages for failed sends

### Activity Tracking

Client communication emails are also logged as activities in `lead_activities` table for:

- **Billable Time Tracking**: If marked as billable
- **Follow-up Management**: Automatic follow-up scheduling
- **Communication History**: Complete client interaction log
- **Matter Association**: Link to specific cases/matters

## 🔒 Security Features

### Authentication
- JWT token validation for all requests
- User-specific access controls
- Row Level Security (RLS) on all tables

### Rate Limiting
- Per-user rate limits (configurable)
- Protection against abuse
- Graceful rate limit responses

### Input Validation
- Comprehensive email address validation
- Content size limits (1MB HTML, 500KB text)
- Attachment limits (20 files, 10MB each, 25MB total)
- XSS protection through input sanitization

### Data Privacy
- User data isolation
- Secure credential handling
- No sensitive data in logs

## 🧪 Testing

### Local Testing

```bash
# Start Supabase locally
supabase start

# Deploy functions
supabase functions deploy send-email
supabase functions deploy send-invoice-email  
supabase functions deploy send-client-communication

# Test with curl
curl -X POST 'http://localhost:54321/functions/v1/send-email' \
  -H 'Authorization: Bearer YOUR_JWT_TOKEN' \
  -H 'Content-Type: application/json' \
  -d '{
    "to": ["test@example.com"],
    "subject": "Test Email",
    "html": "<h1>Test</h1>"
  }'
```

### Mock Data

Use the included mock data generators to create test emails and templates for development.

## 🚨 Error Handling

All functions return standardized error responses:

```typescript
{
  success: false,
  message: "Human-readable error message",
  errors?: ValidationError[], // For validation errors
  email_id?: string, // If email was logged before failure
  error?: string // Technical error details
}
```

Common error codes:
- `400` - Validation errors, malformed requests
- `401` - Authentication errors
- `404` - Client/matter not found
- `429` - Rate limit exceeded
- `500` - Server errors, Resend API errors

## 📈 Monitoring and Analytics

### Email Statistics

Use the `get_email_statistics()` function to get delivery metrics:

```sql
SELECT public.get_email_statistics(
  'user-uuid'::UUID,
  '2024-07-01'::TIMESTAMP WITH TIME ZONE,
  '2024-07-31'::TIMESTAMP WITH TIME ZONE
);
```

Returns:
- Total sent, delivered, bounced, failed counts
- Delivery rate and bounce rate percentages
- Time period analyzed

### Logs and Monitoring

- All function executions are logged with structured logging
- Email status updates are tracked automatically
- Database queries are optimized with proper indexing
- Monitor Resend webhook events (if configured)

## 🔧 Customization

### Adding New Templates

1. Insert into `email_templates` table
2. Define template variables
3. Use in any email function with `template_id`

### Custom Email Types

Add new types to the `email_type` enum in the database:

```sql
ALTER TABLE email_logs DROP CONSTRAINT email_logs_email_type_check;
ALTER TABLE email_logs ADD CONSTRAINT email_logs_email_type_check 
  CHECK (email_type IN ('general', 'invoice', 'communication', 'notification', 'marketing', 'your_new_type'));
```

### Webhook Integration

To receive delivery status updates from Resend:

1. Set up webhook endpoint
2. Verify webhook signatures
3. Update email_logs status based on events

## 🤝 Contributing

When adding new email functions:

1. Follow the established patterns in existing functions
2. Use shared utilities from `_shared/` directory
3. Add comprehensive error handling
4. Include proper logging and activity tracking
5. Update this documentation

## 📚 Additional Resources

- [Resend API Documentation](https://resend.com/docs)
- [Supabase Edge Functions Guide](https://supabase.com/docs/guides/functions)
- [TypeScript Email Types](./supabase/functions/_shared/types.ts)
- [Email Templates Examples](./supabase/migrations/20250729000001-create-email-logging-tables.sql)