# Invoice Management API

## 📋 Overview

The Invoice Management API provides comprehensive functionality for creating, managing, and tracking invoices within the Ross AI platform. This module handles billing cycles, payment processing, trust accounting, and financial reporting with support for multiple billing methods and automated workflows.

## 🎯 Core Features

- **Invoice Generation**: Automated and manual invoice creation with templates
- **Multiple Billing Methods**: Hourly, flat fee, contingency, retainer, and mixed billing
- **Payment Processing**: Track payments, partial payments, and payment plans
- **Trust Accounting**: IOLTA compliance and trust fund management
- **Automated Reminders**: Configurable payment reminders and late notices
- **Batch Operations**: Bulk invoice generation and processing
- **Financial Reporting**: Revenue recognition and aging reports
- **Client Portal**: Self-service invoice viewing and payment
- **Export Capabilities**: Multiple format exports (PDF, CSV, QuickBooks)

## 💰 Billing Models

### Billing Method Types

```python
from enum import Enum
from pydantic import BaseModel, Field, validator
from decimal import Decimal
from typing import List, Optional, Dict
import uuid
from datetime import datetime, date

class BillingMethod(str, Enum):
    HOURLY = "hourly"
    FLAT_FEE = "flat_fee"
    CONTINGENCY = "contingency"
    RETAINER = "retainer"
    MIXED = "mixed"
    PRO_BONO = "pro_bono"

class InvoiceStatus(str, Enum):
    DRAFT = "draft"
    PENDING_APPROVAL = "pending_approval"
    SENT = "sent"
    VIEWED = "viewed"
    PARTIALLY_PAID = "partially_paid"
    PAID = "paid"
    OVERDUE = "overdue"
    DISPUTED = "disputed"
    WRITTEN_OFF = "written_off"
    VOID = "void"

class PaymentTerms(str, Enum):
    IMMEDIATE = "immediate"
    NET_10 = "net_10"
    NET_15 = "net_15"
    NET_30 = "net_30"
    NET_45 = "net_45"
    NET_60 = "net_60"
    NET_90 = "net_90"
    CUSTOM = "custom"

class PaymentMethod(str, Enum):
    CHECK = "check"
    WIRE_TRANSFER = "wire_transfer"
    ACH = "ach"
    CREDIT_CARD = "credit_card"
    DEBIT_CARD = "debit_card"
    CASH = "cash"
    TRUST_TRANSFER = "trust_transfer"
    OTHER = "other"

class TaxType(str, Enum):
    NONE = "none"
    GST = "gst"
    VAT = "vat"
    SALES_TAX = "sales_tax"
    SERVICE_TAX = "service_tax"
```

## 📄 Invoice Data Models

### Invoice Line Item Schema

```python
class InvoiceLineItem(BaseModel):
    id: UUID = Field(default_factory=uuid.uuid4)
    type: str  # time_entry, expense, flat_fee, discount, tax
    description: str
    date: date
    quantity: Decimal = Field(decimal_places=2)
    rate: Decimal = Field(decimal_places=2)
    amount: Decimal = Field(decimal_places=2)
    
    # Time entry specific
    timekeeper_id: Optional[UUID] = None
    timekeeper_name: Optional[str] = None
    activity_code: Optional[str] = None
    
    # Expense specific
    expense_category: Optional[str] = None
    is_billable: bool = True
    markup_percentage: Optional[float] = None
    
    # References
    time_entry_id: Optional[UUID] = None
    expense_id: Optional[UUID] = None
    
    @validator('amount')
    def calculate_amount(cls, v, values):
        if v is None:
            return values.get('quantity', 0) * values.get('rate', 0)
        return v

class InvoiceAdjustment(BaseModel):
    id: UUID = Field(default_factory=uuid.uuid4)
    type: str  # discount, write_off, courtesy_credit, volume_discount
    description: str
    percentage: Optional[float] = Field(None, ge=0, le=100)
    amount: Optional[Decimal] = Field(None, decimal_places=2)
    reason: Optional[str] = None
    approved_by: Optional[UUID] = None
    approved_at: Optional[datetime] = None
```

### Invoice Create Schema

```python
class InvoiceCreate(BaseModel):
    # Basic Information
    matter_id: UUID
    client_id: UUID
    invoice_date: date = Field(default_factory=date.today)
    due_date: Optional[date] = None
    payment_terms: PaymentTerms = PaymentTerms.NET_30
    
    # Billing Period
    billing_period_start: date
    billing_period_end: date
    
    # Line Items
    include_time_entries: bool = True
    include_expenses: bool = True
    time_entry_ids: Optional[List[UUID]] = []
    expense_ids: Optional[List[UUID]] = []
    manual_line_items: List[InvoiceLineItem] = []
    
    # Adjustments
    adjustments: List[InvoiceAdjustment] = []
    
    # Tax Configuration
    tax_type: TaxType = TaxType.NONE
    tax_rate: Optional[float] = Field(None, ge=0, le=100)
    tax_exempt: bool = False
    tax_id: Optional[str] = None
    
    # Trust Accounting
    apply_retainer: bool = False
    retainer_amount: Optional[Decimal] = Field(None, decimal_places=2)
    trust_account_id: Optional[UUID] = None
    
    # Payment Configuration
    accepted_payment_methods: List[PaymentMethod] = []
    online_payment_enabled: bool = True
    partial_payments_allowed: bool = True
    
    # Notes and Terms
    invoice_notes: Optional[str] = Field(None, max_length=2000)
    internal_notes: Optional[str] = Field(None, max_length=2000)
    terms_and_conditions: Optional[str] = None
    
    # Automation
    auto_send: bool = False
    send_reminder: bool = True
    reminder_days: List[int] = [7, 3, 0]  # Days before due date
    
    @validator('due_date')
    def validate_due_date(cls, v, values):
        if not v and values.get('payment_terms') != PaymentTerms.CUSTOM:
            invoice_date = values.get('invoice_date', date.today())
            days = int(values['payment_terms'].split('_')[1])
            v = invoice_date + timedelta(days=days)
        return v
    
    @validator('billing_period_end')
    def validate_billing_period(cls, v, values):
        if v < values.get('billing_period_start'):
            raise ValueError('Billing period end must be after start')
        return v
```

### Invoice Response Schema

```python
class Invoice(BaseModel):
    # Identifiers
    id: UUID
    organization_id: UUID
    invoice_number: str
    
    # Client and Matter
    client_id: UUID
    client_name: str
    matter_id: UUID
    matter_title: str
    matter_number: str
    
    # Dates
    invoice_date: date
    due_date: date
    payment_terms: PaymentTerms
    billing_period_start: date
    billing_period_end: date
    
    # Status
    status: InvoiceStatus
    sent_date: Optional[datetime]
    viewed_date: Optional[datetime]
    paid_date: Optional[datetime]
    
    # Financial Summary
    subtotal: Decimal
    tax_amount: Decimal
    tax_rate: Optional[float]
    total_adjustments: Decimal
    total_amount: Decimal
    amount_paid: Decimal
    amount_due: Decimal
    
    # Line Items
    line_items: List[InvoiceLineItem]
    adjustments: List[InvoiceAdjustment]
    
    # Payment Information
    payments: List['Payment']
    accepted_payment_methods: List[PaymentMethod]
    online_payment_url: Optional[str]
    
    # Trust Accounting
    retainer_applied: Decimal
    trust_balance_after: Optional[Decimal]
    
    # Metadata
    created_at: datetime
    updated_at: datetime
    created_by: UUID
    created_by_name: str
    
    # Statistics
    days_outstanding: Optional[int]
    is_overdue: bool
    overdue_days: Optional[int]
    
    class Config:
        from_attributes = True

class Payment(BaseModel):
    id: UUID
    invoice_id: UUID
    payment_date: datetime
    amount: Decimal
    payment_method: PaymentMethod
    reference_number: Optional[str]
    notes: Optional[str]
    processed_by: UUID
    processed_by_name: str
```

## 🚀 Invoice CRUD Operations

### 1. Create Invoice

**POST** `/api/v1/invoices`

Creates a new invoice with automatic line item generation.

#### Request Body

```json
{
  "matter_id": "matter_123",
  "client_id": "client_456",
  "invoice_date": "2024-12-01",
  "payment_terms": "net_30",
  "billing_period_start": "2024-11-01",
  "billing_period_end": "2024-11-30",
  
  "include_time_entries": true,
  "include_expenses": true,
  
  "manual_line_items": [
    {
      "type": "flat_fee",
      "description": "Monthly retainer - November 2024",
      "date": "2024-11-30",
      "quantity": 1,
      "rate": 5000.00
    }
  ],
  
  "adjustments": [
    {
      "type": "volume_discount",
      "description": "10% volume discount for services over $10,000",
      "percentage": 10,
      "reason": "Long-term client discount"
    }
  ],
  
  "tax_type": "sales_tax",
  "tax_rate": 8.875,
  
  "apply_retainer": true,
  "trust_account_id": "trust_789",
  
  "accepted_payment_methods": ["check", "wire_transfer", "credit_card"],
  "online_payment_enabled": true,
  
  "invoice_notes": "Thank you for your continued business.",
  "auto_send": true,
  "send_reminder": true
}
```

#### Response

```json
{
  "data": {
    "id": "invoice_123",
    "invoice_number": "INV-2024-001234",
    "client_name": "ABC Corporation",
    "matter_title": "Corporate Restructuring",
    "invoice_date": "2024-12-01",
    "due_date": "2024-12-31",
    "status": "draft",
    
    "line_items": [
      {
        "id": "item_1",
        "type": "time_entry",
        "description": "Legal research and analysis",
        "date": "2024-11-15",
        "quantity": 2.5,
        "rate": 350.00,
        "amount": 875.00,
        "timekeeper_name": "John Smith"
      },
      {
        "id": "item_2",
        "type": "time_entry",
        "description": "Client meeting and strategy session",
        "date": "2024-11-20",
        "quantity": 1.5,
        "rate": 450.00,
        "amount": 675.00,
        "timekeeper_name": "Jane Attorney"
      },
      {
        "id": "item_3",
        "type": "expense",
        "description": "Court filing fees",
        "date": "2024-11-22",
        "quantity": 1,
        "rate": 275.00,
        "amount": 275.00,
        "expense_category": "Filing Fees"
      },
      {
        "id": "item_4",
        "type": "flat_fee",
        "description": "Monthly retainer - November 2024",
        "date": "2024-11-30",
        "quantity": 1,
        "rate": 5000.00,
        "amount": 5000.00
      }
    ],
    
    "subtotal": 6825.00,
    "total_adjustments": -682.50,
    "tax_amount": 546.17,
    "total_amount": 6688.67,
    "retainer_applied": 5000.00,
    "amount_due": 1688.67,
    
    "online_payment_url": "https://pay.rossai.com/invoice/invoice_123",
    "created_at": "2024-12-01T10:00:00Z"
  }
}
```

#### Implementation

```python
@router.post("/invoices", response_model=InvoiceResponse, status_code=201)
@require_permission(Permission.BILLING_WRITE)
async def create_invoice(
    invoice_data: InvoiceCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
    background_tasks: BackgroundTasks = BackgroundTasks()
):
    # Validate matter and client
    matter = await matter_service.get_by_id(
        db, invoice_data.matter_id, current_user.organization_id
    )
    if not matter or matter.client_id != invoice_data.client_id:
        raise HTTPException(400, "Invalid matter or client combination")
    
    # Generate invoice number
    invoice_number = await invoice_service.generate_invoice_number(
        db, current_user.organization_id, invoice_data.invoice_date
    )
    
    # Collect billable items
    line_items = []
    
    # Add time entries
    if invoice_data.include_time_entries:
        time_entries = await time_service.get_unbilled_entries(
            db,
            matter_id=invoice_data.matter_id,
            start_date=invoice_data.billing_period_start,
            end_date=invoice_data.billing_period_end,
            entry_ids=invoice_data.time_entry_ids
        )
        
        for entry in time_entries:
            line_items.append(InvoiceLineItem(
                type="time_entry",
                description=entry.description,
                date=entry.date_worked,
                quantity=entry.hours,
                rate=entry.rate,
                amount=entry.hours * entry.rate,
                timekeeper_id=entry.user_id,
                timekeeper_name=entry.user_name,
                time_entry_id=entry.id
            ))
    
    # Add expenses
    if invoice_data.include_expenses:
        expenses = await expense_service.get_unbilled_expenses(
            db,
            matter_id=invoice_data.matter_id,
            start_date=invoice_data.billing_period_start,
            end_date=invoice_data.billing_period_end,
            expense_ids=invoice_data.expense_ids
        )
        
        for expense in expenses:
            amount = expense.amount
            if expense.markup_percentage:
                amount = amount * (1 + expense.markup_percentage / 100)
            
            line_items.append(InvoiceLineItem(
                type="expense",
                description=expense.description,
                date=expense.expense_date,
                quantity=1,
                rate=amount,
                amount=amount,
                expense_category=expense.category,
                expense_id=expense.id
            ))
    
    # Add manual line items
    line_items.extend(invoice_data.manual_line_items)
    
    # Calculate totals
    subtotal = sum(item.amount for item in line_items)
    
    # Apply adjustments
    total_adjustments = Decimal(0)
    for adjustment in invoice_data.adjustments:
        if adjustment.percentage:
            adjustment.amount = subtotal * (adjustment.percentage / 100)
        total_adjustments -= adjustment.amount
    
    # Calculate tax
    tax_amount = Decimal(0)
    if not invoice_data.tax_exempt and invoice_data.tax_rate:
        taxable_amount = subtotal + total_adjustments
        tax_amount = taxable_amount * (invoice_data.tax_rate / 100)
    
    # Total amount
    total_amount = subtotal + total_adjustments + tax_amount
    
    # Apply retainer if requested
    retainer_applied = Decimal(0)
    if invoice_data.apply_retainer and invoice_data.trust_account_id:
        trust_balance = await trust_service.get_balance(
            db, invoice_data.trust_account_id
        )
        retainer_applied = min(trust_balance, total_amount)
    
    # Create invoice
    invoice = await invoice_service.create_invoice(
        db,
        invoice_number=invoice_number,
        matter_id=invoice_data.matter_id,
        client_id=invoice_data.client_id,
        invoice_data=invoice_data,
        line_items=line_items,
        subtotal=subtotal,
        total_adjustments=total_adjustments,
        tax_amount=tax_amount,
        total_amount=total_amount,
        retainer_applied=retainer_applied,
        organization_id=current_user.organization_id,
        created_by=current_user.id
    )
    
    # Mark time entries and expenses as billed
    if invoice_data.include_time_entries:
        await time_service.mark_entries_billed(
            db, [entry.id for entry in time_entries], invoice.id
        )
    
    if invoice_data.include_expenses:
        await expense_service.mark_expenses_billed(
            db, [expense.id for expense in expenses], invoice.id
        )
    
    # Apply retainer transaction
    if retainer_applied > 0:
        await trust_service.apply_to_invoice(
            db,
            trust_account_id=invoice_data.trust_account_id,
            invoice_id=invoice.id,
            amount=retainer_applied,
            processed_by=current_user.id
        )
    
    # Auto-send if requested
    if invoice_data.auto_send:
        background_tasks.add_task(
            invoice_service.send_invoice,
            invoice.id,
            current_user.id
        )
    
    # Schedule reminders
    if invoice_data.send_reminder:
        for days in invoice_data.reminder_days:
            reminder_date = invoice.due_date - timedelta(days=days)
            if reminder_date > date.today():
                background_tasks.add_task(
                    schedule_invoice_reminder,
                    invoice.id,
                    reminder_date
                )
    
    return InvoiceResponse(data=invoice)
```

### 2. Get Invoice by ID

**GET** `/api/v1/invoices/{invoice_id}`

Retrieves a single invoice with all details.

#### Query Parameters

- `include_payments`: Include payment history (default: true)
- `include_activity`: Include activity log (default: false)
- `format`: Response format (json, pdf)

#### Response

```json
{
  "data": {
    "id": "invoice_123",
    "invoice_number": "INV-2024-001234",
    "status": "partially_paid",
    "total_amount": 6688.67,
    "amount_paid": 5000.00,
    "amount_due": 1688.67,
    
    "payments": [
      {
        "id": "payment_456",
        "payment_date": "2024-12-05T15:30:00Z",
        "amount": 5000.00,
        "payment_method": "wire_transfer",
        "reference_number": "WT-123456",
        "processed_by_name": "Jane Admin"
      }
    ],
    
    "activity_log": [
      {
        "timestamp": "2024-12-01T10:00:00Z",
        "action": "created",
        "user": "John Attorney"
      },
      {
        "timestamp": "2024-12-01T10:05:00Z",
        "action": "sent",
        "user": "System"
      },
      {
        "timestamp": "2024-12-02T09:15:00Z",
        "action": "viewed",
        "user": "Client"
      }
    ]
  }
}
```

### 3. Update Invoice

**PUT** `/api/v1/invoices/{invoice_id}`

Updates a draft invoice.

#### Request Body

```json
{
  "due_date": "2025-01-15",
  "invoice_notes": "Updated payment terms per client request",
  "adjustments": [
    {
      "type": "courtesy_credit",
      "description": "One-time courtesy credit",
      "amount": 500.00
    }
  ]
}
```

### 4. Delete Invoice

**DELETE** `/api/v1/invoices/{invoice_id}`

Voids or deletes an invoice based on status.

#### Query Parameters

- `reason`: Reason for deletion (required)
- `void`: Void instead of delete for sent invoices (default: true)

### 5. List Invoices

**GET** `/api/v1/invoices`

Retrieves paginated list of invoices with filtering.

#### Query Parameters

- `page`: Page number (default: 1)
- `per_page`: Items per page (default: 20)
- `status`: Filter by status
- `client_id`: Filter by client
- `matter_id`: Filter by matter
- `date_from`: Start date for invoice date
- `date_to`: End date for invoice date
- `overdue_only`: Show only overdue invoices
- `search`: Search in invoice number, client name
- `sort_by`: Sort field (default: invoice_date)
- `sort_order`: Sort direction (desc, asc)

## 💳 Payment Operations

### 6. Record Payment

**POST** `/api/v1/invoices/{invoice_id}/payments`

Records a payment against an invoice.

#### Request Body

```json
{
  "payment_date": "2024-12-07",
  "amount": 1688.67,
  "payment_method": "credit_card",
  "reference_number": "CC-789012",
  "apply_to_oldest": false,
  "notes": "Final payment received via online portal"
}
```

#### Response

```json
{
  "data": {
    "payment_id": "payment_789",
    "invoice_id": "invoice_123",
    "amount_applied": 1688.67,
    "new_balance": 0.00,
    "invoice_status": "paid",
    "receipt_url": "https://receipts.rossai.com/payment_789"
  }
}
```

### 7. Apply Retainer

**POST** `/api/v1/invoices/{invoice_id}/apply-retainer`

Applies retainer/trust funds to an invoice.

#### Request Body

```json
{
  "trust_account_id": "trust_789",
  "amount": 1688.67,
  "create_trust_transaction": true,
  "notes": "Applied remaining retainer balance to invoice"
}
```

### 8. Refund Payment

**POST** `/api/v1/invoices/{invoice_id}/payments/{payment_id}/refund`

Processes a refund for a payment.

#### Request Body

```json
{
  "refund_amount": 500.00,
  "refund_method": "credit_card",
  "reason": "Billing adjustment per client agreement",
  "create_credit_memo": true
}
```

## 📧 Invoice Actions

### 9. Send Invoice

**POST** `/api/v1/invoices/{invoice_id}/send`

Sends invoice to client via email.

#### Request Body

```json
{
  "recipients": ["client@example.com", "accounts@example.com"],
  "cc_recipients": ["attorney@lawfirm.com"],
  "subject": "Invoice INV-2024-001234 from Smith Law Firm",
  "message": "Please find attached your invoice for legal services rendered in November 2024.",
  "attach_supporting_docs": true,
  "include_payment_link": true
}
```

### 10. Generate PDF

**GET** `/api/v1/invoices/{invoice_id}/pdf`

Generates PDF version of invoice.

#### Query Parameters

- `template`: PDF template to use (default, detailed, summary)
- `include_time_details`: Include detailed time entries
- `include_expense_receipts`: Include expense receipts

#### Response

Returns PDF file with appropriate headers:
```
Content-Type: application/pdf
Content-Disposition: attachment; filename="INV-2024-001234.pdf"
```

### 11. Duplicate Invoice

**POST** `/api/v1/invoices/{invoice_id}/duplicate`

Creates a copy of an existing invoice.

#### Request Body

```json
{
  "invoice_date": "2024-12-31",
  "billing_period_start": "2024-12-01",
  "billing_period_end": "2024-12-31",
  "status": "draft",
  "copy_line_items": true,
  "copy_adjustments": false
}
```

## 📊 Batch Operations

### 12. Batch Generate Invoices

**POST** `/api/v1/invoices/batch-generate`

Generates multiple invoices based on criteria.

#### Request Body

```json
{
  "generation_date": "2024-12-01",
  "matter_filters": {
    "status": "active",
    "has_unbilled_time": true,
    "minimum_amount": 100.00
  },
  "invoice_settings": {
    "payment_terms": "net_30",
    "auto_send": false,
    "group_by": "matter"
  },
  "preview_only": false
}
```

#### Response

```json
{
  "data": {
    "total_generated": 25,
    "total_amount": 125750.50,
    "invoices": [
      {
        "invoice_id": "invoice_001",
        "invoice_number": "INV-2024-001235",
        "client_name": "ABC Corp",
        "amount": 5250.00
      }
    ],
    "errors": [],
    "generation_time_seconds": 4.5
  }
}
```

### 13. Batch Send Invoices

**POST** `/api/v1/invoices/batch-send`

Sends multiple invoices in batch.

#### Request Body

```json
{
  "invoice_ids": ["invoice_123", "invoice_456", "invoice_789"],
  "send_options": {
    "use_default_template": true,
    "include_payment_link": true,
    "schedule_time": "2024-12-07T09:00:00Z"
  }
}
```

## 📈 Analytics & Reporting

### 14. Invoice Analytics

**GET** `/api/v1/invoices/analytics`

Retrieves invoice analytics and metrics.

#### Query Parameters

- `period`: Time period (month, quarter, year)
- `group_by`: Grouping (client, matter, practice_area)

#### Response

```json
{
  "data": {
    "summary": {
      "total_invoiced": 450750.00,
      "total_collected": 385250.00,
      "total_outstanding": 65500.00,
      "collection_rate": 0.854,
      "average_days_to_payment": 28.5
    },
    "aging": {
      "current": 25000.00,
      "30_days": 15000.00,
      "60_days": 10000.00,
      "90_days": 8000.00,
      "over_90": 7500.00
    },
    "by_status": {
      "draft": 5,
      "sent": 15,
      "partially_paid": 8,
      "paid": 145,
      "overdue": 12
    }
  }
}
```

### 15. Aging Report

**GET** `/api/v1/invoices/reports/aging`

Generates detailed aging report.

#### Query Parameters

- `as_of_date`: Report date (default: today)
- `group_by`: Group by client or matter
- `include_details`: Include invoice details
- `format`: Output format (json, csv, pdf)

## 🔧 Configuration

### 16. Invoice Templates

**GET** `/api/v1/invoices/templates`

Retrieves available invoice templates.

#### Response

```json
{
  "data": [
    {
      "id": "template_001",
      "name": "Standard Invoice",
      "description": "Default invoice template with itemized billing",
      "preview_url": "https://templates.rossai.com/preview/template_001",
      "customizable_fields": ["logo", "header", "footer", "terms"]
    }
  ]
}
```

### 17. Invoice Settings

**GET/PUT** `/api/v1/invoices/settings`

Manages organization invoice settings.

#### Settings Schema

```json
{
  "invoice_number_format": "INV-{YYYY}-{#####}",
  "starting_number": 1000,
  "default_payment_terms": "net_30",
  "default_template_id": "template_001",
  "late_fee_percentage": 1.5,
  "late_fee_minimum": 25.00,
  "reminder_schedule": [7, 3, 0],
  "auto_late_fees": true,
  "trust_accounting_enabled": true,
  "online_payments": {
    "enabled": true,
    "accepted_cards": ["visa", "mastercard", "amex"],
    "ach_enabled": true,
    "processing_fee_payer": "client"
  }
}
```

## 🔒 Security & Compliance

### Permission Requirements

- **View Invoices**: `billing:read` permission
- **Create/Edit**: `billing:write` permission
- **Delete/Void**: `billing:admin` permission
- **View Payments**: `billing:read` permission
- **Process Payments**: `billing:write` permission

### Compliance Features

- **Audit Trail**: Complete history of all invoice changes
- **Trust Accounting**: IOLTA compliant trust fund handling
- **Data Retention**: Configurable retention policies
- **Access Control**: Client portal restrictions
- **Encryption**: Payment data encryption at rest
- **PCI Compliance**: Secure payment processing

This comprehensive Invoice Management API provides robust billing functionality while ensuring compliance, security, and excellent user experience for legal professionals and their clients.