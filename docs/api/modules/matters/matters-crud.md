# Matter Management - CRUD Operations

## 📋 Overview

The Matter Management API provides comprehensive CRUD operations for managing legal matters within the Ross AI platform. This module handles the entire lifecycle of legal cases, from initial client engagement through resolution, with support for complex workflows, custom fields, and extensive metadata tracking.

## 🎯 Core Features

- **Full CRUD Operations**: Create, Read, Update, Delete matters with validation
- **Matter Templates**: Pre-configured templates for common matter types
- **Custom Fields**: Dynamic field system for practice-specific data
- **Task Management**: Built-in task lists and deadline tracking
- **Document Organization**: Structured folder hierarchy for matter documents
- **Billing Integration**: Time tracking and expense management
- **Team Collaboration**: Role-based access and permissions
- **Workflow Automation**: Stage-based automation and notifications
- **Relationship Tracking**: Client associations and related contacts

## 🗄️ Data Models

### Pydantic Schemas

#### Matter Base Schema

```python
from pydantic import BaseModel, validator, Field
from typing import List, Optional, Dict, Any
from enum import Enum
import uuid
from datetime import datetime, date
from decimal import Decimal

class MatterStatus(str, Enum):
    ACTIVE = "active"
    CLOSED = "closed"
    PENDING = "pending"
    ON_HOLD = "on_hold"

class MatterPriority(str, Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    URGENT = "urgent"

class MatterStage(str, Enum):
    OPEN = "open"
    DISCOVERY = "discovery"
    MEDIATION = "mediation"
    TRIAL = "trial"
    SETTLEMENT = "settlement"
    APPEAL = "appeal"
    CLOSED = "closed"

class BillingMethod(str, Enum):
    HOURLY = "hourly"
    FLAT_FEE = "flat_fee"
    CONTINGENCY = "contingency"
    RETAINER = "retainer"
    MIXED = "mixed"

class FileAccessLevel(str, Enum):
    FULL = "full"
    LIMITED = "limited"
    NONE = "none"

class NotificationSettings(BaseModel):
    email: bool = True
    sms: bool = False
    deadlineReminders: bool = True
    clientNotifications: bool = True
    taskNotifications: bool = True
    reminderDays: List[int] = [30, 14, 7, 1]

class BillingPreference(BaseModel):
    method: BillingMethod
    hourlyRate: Optional[Decimal] = Field(None, decimal_places=2)
    flatFeeAmount: Optional[Decimal] = Field(None, decimal_places=2)
    contingencyPercentage: Optional[float] = Field(None, ge=0, le=100)
    retainerAmount: Optional[Decimal] = Field(None, decimal_places=2)
    expenseTracking: bool = True
    trustAccount: bool = False
    billingIncrement: int = Field(6, description="Billing increment in minutes")
    
    @validator('hourlyRate')
    def validate_hourly_rate(cls, v, values):
        if values.get('method') == BillingMethod.HOURLY and not v:
            raise ValueError('Hourly rate required for hourly billing')
        return v

class MatterPermissions(BaseModel):
    fileAccess: FileAccessLevel = FileAccessLevel.FULL
    clientPortalAccess: bool = True
    documentSharing: bool = True
    allowedUsers: List[UUID] = []
    restrictedFolders: List[str] = []
    viewBilling: bool = True
    editBilling: bool = False

class CustomField(BaseModel):
    id: str
    name: str
    type: str  # text, number, date, dropdown, checkbox, textarea
    value: Any
    required: bool = False
    options: Optional[List[str]] = None
    helpText: Optional[str] = None

class Task(BaseModel):
    id: UUID = Field(default_factory=uuid.uuid4)
    title: str
    description: Optional[str] = None
    dueDate: Optional[datetime] = None
    priority: MatterPriority = MatterPriority.MEDIUM
    assignedTo: Optional[UUID] = None
    assignedToName: Optional[str] = None
    completed: bool = False
    completedAt: Optional[datetime] = None
    completedBy: Optional[UUID] = None

class TaskList(BaseModel):
    id: UUID = Field(default_factory=uuid.uuid4)
    name: str
    description: Optional[str] = None
    tasks: List[Task] = []
    isTemplate: bool = False

class DocumentFolder(BaseModel):
    id: UUID = Field(default_factory=uuid.uuid4)
    name: str
    description: Optional[str] = None
    accessLevel: FileAccessLevel = FileAccessLevel.FULL
    parentId: Optional[UUID] = None
    subfolders: List['DocumentFolder'] = []
    documentCount: int = 0

class RelatedContact(BaseModel):
    id: UUID = Field(default_factory=uuid.uuid4)
    contactId: UUID
    contactName: str
    relationship: str  # expert_witness, consultant, opposing_counsel, etc.
    role: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    isPrimary: bool = False
```

#### Matter Create Schema

```python
class MatterCreate(BaseModel):
    # Basic Information
    title: str = Field(..., min_length=1, max_length=500)
    description: str = Field(..., max_length=5000)
    clientId: UUID
    matterNumber: Optional[str] = Field(None, pattern="^[A-Z0-9-]+$")
    
    # Status and Priority
    status: MatterStatus = MatterStatus.ACTIVE
    priority: MatterPriority = MatterPriority.MEDIUM
    stage: MatterStage = MatterStage.OPEN
    
    # Practice Area
    practiceArea: str
    practiceSubArea: Optional[str] = None
    matterType: Optional[str] = None
    
    # Team Assignment
    responsibleAttorneyId: UUID
    originatingAttorneyId: Optional[UUID] = None
    responsibleStaffIds: List[UUID] = []
    
    # Dates
    dateOpened: date = Field(default_factory=date.today)
    estimatedCloseDate: Optional[date] = None
    statuteOfLimitations: Optional[date] = None
    
    # Financial
    estimatedBudget: Optional[Decimal] = Field(None, decimal_places=2)
    billingPreference: BillingPreference
    conflictCheckCompleted: bool = False
    
    # Configuration
    templateId: Optional[UUID] = None
    customFields: Dict[str, Any] = {}
    notificationSettings: NotificationSettings = Field(default_factory=NotificationSettings)
    permissions: MatterPermissions = Field(default_factory=MatterPermissions)
    
    # Related Entities
    relatedContacts: List[RelatedContact] = []
    taskLists: List[TaskList] = []
    documentFolders: List[DocumentFolder] = []
    
    # Metadata
    tags: List[str] = []
    notes: Optional[str] = Field(None, max_length=5000)
    
    @validator('title')
    def sanitize_title(cls, v):
        # Remove any potential XSS
        return bleach.clean(v, tags=[], strip=True)
    
    @validator('estimatedCloseDate')
    def validate_close_date(cls, v, values):
        if v and values.get('dateOpened') and v < values['dateOpened']:
            raise ValueError('Estimated close date cannot be before open date')
        return v
    
    @validator('responsibleStaffIds')
    def validate_staff_ids(cls, v):
        if len(v) != len(set(v)):
            raise ValueError('Duplicate staff IDs not allowed')
        return v
```

#### Matter Response Schema

```python
class Matter(BaseModel):
    # Identifiers
    id: UUID
    organizationId: UUID
    matterNumber: str
    
    # Basic Information
    title: str
    description: str
    clientId: UUID
    clientName: str
    
    # Status and Priority
    status: MatterStatus
    priority: MatterPriority
    stage: MatterStage
    
    # Practice Area
    practiceArea: str
    practiceSubArea: Optional[str]
    matterType: Optional[str]
    
    # Team
    responsibleAttorneyId: UUID
    responsibleAttorneyName: str
    originatingAttorneyId: Optional[UUID]
    originatingAttorneyName: Optional[str]
    responsibleStaffIds: List[UUID]
    responsibleStaffNames: List[str]
    
    # Dates
    dateOpened: date
    dateClosed: Optional[date]
    estimatedCloseDate: Optional[date]
    statuteOfLimitations: Optional[date]
    lastActivity: datetime
    
    # Financial
    estimatedBudget: Optional[Decimal]
    totalBilled: Decimal
    totalPaid: Decimal
    outstandingBalance: Decimal
    totalExpenses: Decimal
    timeSpent: float  # in hours
    billingPreference: BillingPreference
    
    # Configuration
    customFields: Dict[str, Any]
    notificationSettings: NotificationSettings
    permissions: MatterPermissions
    
    # Related Entities
    relatedContacts: List[RelatedContact]
    taskLists: List[TaskList]
    documentFolders: List[DocumentFolder]
    
    # Statistics
    documentCount: int
    noteCount: int
    activityCount: int
    openTaskCount: int
    notificationCount: int
    
    # Metadata
    tags: List[str]
    notes: Optional[str]
    createdAt: datetime
    updatedAt: datetime
    createdBy: UUID
    updatedBy: UUID
    
    class Config:
        from_attributes = True
```

### SQLAlchemy Models

```python
from sqlalchemy import Column, String, Boolean, DateTime, Text, DECIMAL, ForeignKey, Table, Integer, Float
from sqlalchemy.dialects.postgresql import UUID, JSONB, ARRAY
from sqlalchemy.orm import relationship
import uuid
from datetime import datetime

# Association tables
matter_staff = Table(
    'matter_staff',
    Base.metadata,
    Column('matter_id', UUID(as_uuid=True), ForeignKey('matters.id')),
    Column('user_id', UUID(as_uuid=True), ForeignKey('users.id'))
)

matter_tags = Table(
    'matter_tags',
    Base.metadata,
    Column('matter_id', UUID(as_uuid=True), ForeignKey('matters.id')),
    Column('tag_id', UUID(as_uuid=True), ForeignKey('tags.id'))
)

class Matter(Base):
    __tablename__ = 'matters'
    
    # Primary fields
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    organization_id = Column(UUID(as_uuid=True), ForeignKey('organizations.id'), nullable=False)
    matter_number = Column(String(50), unique=True, nullable=False)
    
    # Basic information
    title = Column(String(500), nullable=False)
    description = Column(Text, nullable=False)
    client_id = Column(UUID(as_uuid=True), ForeignKey('clients.id'), nullable=False)
    
    # Status fields
    status = Column(String(20), nullable=False)  # active, closed, pending, on_hold
    priority = Column(String(20), nullable=False)  # low, medium, high, urgent
    stage = Column(String(50), nullable=False)  # open, discovery, mediation, trial, etc.
    
    # Practice area
    practice_area = Column(String(100), nullable=False)
    practice_sub_area = Column(String(100))
    matter_type = Column(String(100))
    
    # Team assignment
    responsible_attorney_id = Column(UUID(as_uuid=True), ForeignKey('users.id'), nullable=False)
    originating_attorney_id = Column(UUID(as_uuid=True), ForeignKey('users.id'))
    
    # Important dates
    date_opened = Column(DateTime, nullable=False)
    date_closed = Column(DateTime)
    estimated_close_date = Column(DateTime)
    statute_of_limitations = Column(DateTime)
    last_activity = Column(DateTime, default=datetime.utcnow)
    
    # Financial fields
    estimated_budget = Column(DECIMAL(10, 2))
    billing_method = Column(String(50), nullable=False)
    hourly_rate = Column(DECIMAL(8, 2))
    flat_fee_amount = Column(DECIMAL(10, 2))
    contingency_percentage = Column(Float)
    retainer_amount = Column(DECIMAL(10, 2))
    expense_tracking = Column(Boolean, default=True)
    trust_account = Column(Boolean, default=False)
    billing_increment = Column(Integer, default=6)  # minutes
    
    # Configuration
    template_id = Column(UUID(as_uuid=True), ForeignKey('matter_templates.id'))
    custom_fields = Column(JSONB, default={})
    notification_settings = Column(JSONB, default={})
    permissions = Column(JSONB, default={})
    
    # Metadata
    tags = Column(ARRAY(String))
    notes = Column(Text)
    conflict_check_completed = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    created_by = Column(UUID(as_uuid=True), ForeignKey('users.id'))
    updated_by = Column(UUID(as_uuid=True), ForeignKey('users.id'))
    
    # Relationships
    organization = relationship("Organization", back_populates="matters")
    client = relationship("Client", back_populates="matters")
    responsible_attorney = relationship("User", foreign_keys=[responsible_attorney_id])
    originating_attorney = relationship("User", foreign_keys=[originating_attorney_id])
    responsible_staff = relationship("User", secondary=matter_staff, back_populates="matters")
    documents = relationship("Document", back_populates="matter", cascade="all, delete-orphan")
    time_entries = relationship("TimeEntry", back_populates="matter", cascade="all, delete-orphan")
    expenses = relationship("Expense", back_populates="matter", cascade="all, delete-orphan")
    invoices = relationship("Invoice", back_populates="matter")
    activities = relationship("Activity", back_populates="matter")
    task_lists = relationship("MatterTaskList", back_populates="matter", cascade="all, delete-orphan")
    document_folders = relationship("MatterDocumentFolder", back_populates="matter", cascade="all, delete-orphan")
    related_contacts = relationship("MatterRelatedContact", back_populates="matter", cascade="all, delete-orphan")
```

## 🚀 API Endpoints

### 1. Create Matter

**POST** `/api/v1/matters`

Creates a new legal matter with comprehensive validation and configuration.

#### Request Body

```json
{
  "title": "Smith Corp Acquisition",
  "description": "Acquisition of Smith Corp by ABC Holdings. Deal value $50M.",
  "clientId": "client_123",
  "priority": "high",
  "stage": "open",
  "practiceArea": "Corporate Law",
  "practiceSubArea": "Mergers & Acquisitions",
  "matterType": "Corporate Acquisition",
  
  "responsibleAttorneyId": "user_456",
  "originatingAttorneyId": "user_456",
  "responsibleStaffIds": ["user_789", "user_012"],
  
  "dateOpened": "2024-12-07",
  "estimatedCloseDate": "2025-03-15",
  "statuteOfLimitations": "2030-12-07",
  
  "estimatedBudget": 150000.00,
  "billingPreference": {
    "method": "hourly",
    "hourlyRate": 450.00,
    "expenseTracking": true,
    "billingIncrement": 6
  },
  
  "customFields": {
    "deal_value": "50000000",
    "buyer": "ABC Holdings",
    "seller": "Smith Family Trust",
    "jurisdiction": "Delaware"
  },
  
  "notificationSettings": {
    "email": true,
    "deadlineReminders": true,
    "reminderDays": [30, 14, 7, 1]
  },
  
  "permissions": {
    "fileAccess": "full",
    "clientPortalAccess": true,
    "allowedUsers": ["user_789", "user_012"]
  },
  
  "relatedContacts": [
    {
      "contactId": "contact_345",
      "contactName": "Jane Attorney",
      "relationship": "opposing_counsel",
      "email": "jane@lawfirm.com",
      "isPrimary": true
    }
  ],
  
  "taskLists": [
    {
      "name": "Due Diligence",
      "tasks": [
        {
          "title": "Review financial statements",
          "dueDate": "2024-12-20",
          "priority": "high",
          "assignedTo": "user_789"
        },
        {
          "title": "Environmental assessment",
          "dueDate": "2024-12-25",
          "priority": "medium",
          "assignedTo": "user_012"
        }
      ]
    }
  ],
  
  "documentFolders": [
    {
      "name": "Due Diligence",
      "subfolders": [
        {"name": "Financial Documents"},
        {"name": "Legal Documents"},
        {"name": "Environmental Reports"}
      ]
    },
    {
      "name": "Correspondence",
      "accessLevel": "limited"
    }
  ],
  
  "tags": ["M&A", "High Value", "Priority Client"],
  "notes": "CEO requires weekly updates. Engage environmental consultant by Dec 15."
}
```

#### Response

```json
{
  "data": {
    "id": "matter_567",
    "organizationId": "org_123",
    "matterNumber": "2024-12-0001",
    "title": "Smith Corp Acquisition",
    "clientId": "client_123",
    "clientName": "ABC Holdings Inc.",
    "status": "active",
    "priority": "high",
    "stage": "open",
    
    "responsibleAttorneyId": "user_456",
    "responsibleAttorneyName": "John Smith",
    "responsibleStaffIds": ["user_789", "user_012"],
    "responsibleStaffNames": ["Jane Doe", "Bob Johnson"],
    
    "dateOpened": "2024-12-07",
    "lastActivity": "2024-12-07T10:30:00Z",
    
    "totalBilled": 0.00,
    "totalPaid": 0.00,
    "outstandingBalance": 0.00,
    "timeSpent": 0.0,
    
    "documentCount": 0,
    "openTaskCount": 2,
    "notificationCount": 0,
    
    "createdAt": "2024-12-07T10:30:00Z",
    "createdBy": "user_456"
  }
}
```

#### Error Responses

```json
// 400 - Validation Error
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Matter validation failed",
    "details": [
      {
        "field": "responsibleAttorneyId",
        "message": "Attorney not found or inactive"
      },
      {
        "field": "clientId",
        "message": "Client not found in organization"
      }
    ]
  }
}

// 409 - Conflict Check Failed
{
  "error": {
    "code": "CONFLICT_CHECK_REQUIRED",
    "message": "Conflict check must be completed before creating matter",
    "details": {
      "conflicting_matters": [
        {
          "matter_id": "matter_123",
          "client_name": "XYZ Corp",
          "conflict_type": "adverse_party"
        }
      ]
    }
  }
}
```

#### Implementation

```python
@router.post("/matters", response_model=MatterResponse, status_code=201)
@require_permission(Permission.MATTERS_WRITE)
async def create_matter(
    matter_data: MatterCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
    redis: Redis = Depends(get_redis)
):
    # Validate client belongs to organization
    client = await client_service.get_by_id(db, matter_data.clientId, current_user.organization_id)
    if not client:
        raise HTTPException(404, "Client not found")
    
    # Validate attorneys and staff
    if not await user_service.validate_user_in_org(
        db, matter_data.responsibleAttorneyId, current_user.organization_id
    ):
        raise HTTPException(400, "Responsible attorney not found in organization")
    
    # Check for conflicts
    if not matter_data.conflictCheckCompleted:
        conflicts = await conflict_service.check_conflicts(
            db, current_user.organization_id, matter_data
        )
        if conflicts:
            raise HTTPException(409, {
                "code": "CONFLICT_CHECK_REQUIRED",
                "message": "Potential conflicts detected",
                "details": {"conflicts": conflicts}
            })
    
    # Generate matter number
    matter_number = await matter_service.generate_matter_number(
        db, current_user.organization_id, matter_data.dateOpened
    )
    
    # Create matter
    matter = await matter_service.create_matter(
        db,
        matter_data=matter_data,
        matter_number=matter_number,
        organization_id=current_user.organization_id,
        created_by=current_user.id
    )
    
    # Create initial task lists
    for task_list in matter_data.taskLists:
        await task_service.create_task_list(
            db, matter.id, task_list, current_user.id
        )
    
    # Create document folders
    for folder in matter_data.documentFolders:
        await document_service.create_folder_structure(
            db, matter.id, folder, current_user.id
        )
    
    # Send notifications
    await notification_service.notify_matter_creation(
        matter, matter_data.responsibleStaffIds
    )
    
    # Invalidate cache
    await redis.delete(f"matters:org:{current_user.organization_id}")
    
    # Log activity
    await activity_service.log_activity(
        db, current_user.id, "matter_created",
        resource_type="matter", resource_id=matter.id,
        details={
            "matter_title": matter.title,
            "client_name": client.name,
            "practice_area": matter.practice_area
        }
    )
    
    return MatterResponse(data=matter)
```

### 2. Get Matter by ID

**GET** `/api/v1/matters/{matter_id}`

Retrieves a single matter by ID with all related data.

#### Query Parameters

- `include_statistics`: Include computed statistics (default: true)
- `include_financial`: Include financial summary (default: true)
- `include_tasks`: Include task lists (default: false)
- `include_documents`: Include document folders (default: false)

#### Response

```json
{
  "data": {
    "id": "matter_567",
    "title": "Smith Corp Acquisition",
    "status": "active",
    "priority": "high",
    "stage": "discovery",
    
    "totalBilled": 45000.00,
    "totalPaid": 30000.00,
    "outstandingBalance": 15000.00,
    "totalExpenses": 2500.00,
    "timeSpent": 100.5,
    
    "statistics": {
      "documentCount": 145,
      "noteCount": 23,
      "activityCount": 287,
      "openTaskCount": 5,
      "completedTaskCount": 18,
      "avgResponseTime": "2.5 days"
    },
    
    "financialSummary": {
      "billedThisMonth": 12000.00,
      "collectedThisMonth": 8000.00,
      "expensesThisMonth": 500.00,
      "effectiveRate": 447.50,
      "realization": 0.67,
      "budgetUtilization": 0.30
    }
  }
}
```

### 3. Update Matter

**PUT** `/api/v1/matters/{matter_id}`

Updates an existing matter with validation.

#### Request Body

```json
{
  "title": "Smith Corp Acquisition - Phase 2",
  "stage": "discovery",
  "priority": "urgent",
  "estimatedCloseDate": "2025-04-30",
  "customFields": {
    "deal_value": "55000000",
    "additional_parties": ["DEF Corp"]
  },
  "notes": "Expedited timeline requested by client. Additional party added to transaction."
}
```

### 4. Delete Matter

**DELETE** `/api/v1/matters/{matter_id}`

Soft deletes or archives a matter based on status.

#### Query Parameters

- `archive`: Archive instead of delete (default: true)
- `delete_documents`: Also delete associated documents (default: false)

#### Response

```json
{
  "message": "Matter archived successfully",
  "archived_at": "2024-12-07T10:30:00Z",
  "retained_data": {
    "documents": true,
    "time_entries": true,
    "invoices": true
  }
}
```

### 5. List Matters

**GET** `/api/v1/matters`

Retrieves a paginated list of matters with filtering and sorting.

#### Query Parameters

- `page`: Page number (default: 1)
- `per_page`: Items per page (default: 20, max: 100)
- `status`: Filter by status (active, closed, pending, on_hold)
- `priority`: Filter by priority (low, medium, high, urgent)
- `stage`: Filter by stage
- `practice_area`: Filter by practice area
- `client_id`: Filter by client
- `responsible_attorney_id`: Filter by responsible attorney
- `date_opened_after`: Filter by open date
- `date_opened_before`: Filter by open date
- `search`: Search in title, description, matter number
- `sort_by`: Sort field (default: date_opened)
- `sort_order`: Sort direction (asc, desc)

#### Response

```json
{
  "data": [
    {
      "id": "matter_567",
      "matterNumber": "2024-12-0001",
      "title": "Smith Corp Acquisition",
      "clientName": "ABC Holdings Inc.",
      "status": "active",
      "priority": "high",
      "stage": "discovery",
      "responsibleAttorneyName": "John Smith",
      "dateOpened": "2024-12-07",
      "lastActivity": "2024-12-07T14:22:00Z",
      "totalBilled": 45000.00,
      "timeSpent": 100.5
    }
  ],
  "meta": {
    "total": 150,
    "page": 1,
    "per_page": 20,
    "total_pages": 8
  }
}
```

## 📊 Matter Operations

### 6. Close Matter

**POST** `/api/v1/matters/{matter_id}/close`

Closes a matter with final billing and archival options.

#### Request Body

```json
{
  "closing_notes": "Matter successfully resolved through settlement",
  "final_billing": true,
  "archive_documents": true,
  "retention_period_years": 7,
  "client_notification": {
    "send": true,
    "message": "Thank you for trusting us with your legal matter."
  }
}
```

### 7. Reopen Matter

**POST** `/api/v1/matters/{matter_id}/reopen`

Reopens a previously closed matter.

#### Request Body

```json
{
  "reason": "Client requested additional work on related matter",
  "new_stage": "open",
  "notify_team": true
}
```

### 8. Change Matter Stage

**PUT** `/api/v1/matters/{matter_id}/stage`

Updates the matter stage with workflow automation.

#### Request Body

```json
{
  "new_stage": "trial",
  "notes": "Discovery complete, moving to trial preparation",
  "trigger_automations": true
}
```

#### Response

```json
{
  "data": {
    "matter_id": "matter_567",
    "previous_stage": "discovery",
    "new_stage": "trial",
    "automations_triggered": [
      "trial_prep_checklist_created",
      "court_dates_reminder_scheduled",
      "trial_team_notified"
    ]
  }
}
```

### 9. Run Conflict Check

**POST** `/api/v1/matters/{matter_id}/conflict-check`

Runs or reruns conflict check for a matter.

#### Response

```json
{
  "data": {
    "conflicts_found": false,
    "checked_entities": [
      "ABC Holdings Inc.",
      "Smith Corp",
      "John Smith",
      "Jane Attorney"
    ],
    "potential_conflicts": [],
    "check_completed_at": "2024-12-07T10:30:00Z"
  }
}
```

## 🔧 Matter Templates

### 10. Get Matter Templates

**GET** `/api/v1/matters/templates`

Retrieves available matter templates.

#### Query Parameters

- `practice_area`: Filter by practice area
- `matter_type`: Filter by matter type

#### Response

```json
{
  "data": [
    {
      "id": "template_123",
      "name": "Corporate Acquisition Template",
      "description": "Standard template for M&A transactions",
      "practice_area": "Corporate Law",
      "matter_type": "Acquisition",
      "default_fields": {
        "stage": "open",
        "priority": "high",
        "billingPreference": {
          "method": "hourly",
          "hourlyRate": 450.00
        }
      },
      "task_lists": [
        {
          "name": "Due Diligence Checklist",
          "task_count": 25
        }
      ],
      "document_folders": [
        "Due Diligence",
        "Contracts",
        "Correspondence"
      ],
      "estimated_duration_days": 90
    }
  ]
}
```

### 11. Create from Template

**POST** `/api/v1/matters/create-from-template`

Creates a new matter from a template.

#### Request Body

```json
{
  "template_id": "template_123",
  "client_id": "client_456",
  "title": "NewCorp Acquisition",
  "overrides": {
    "responsibleAttorneyId": "user_789",
    "estimatedBudget": 200000.00
  }
}
```

## 🔒 Security & Permissions

### Permission Levels

- **Read**: View matter details and documents
- **Write**: Edit matter information and add documents
- **Delete**: Close or delete matters
- **Admin**: Manage permissions and billing settings

### Data Access Control

- Organization-level isolation
- Role-based permissions
- Matter-specific access lists
- Client portal restrictions
- Document-level security

### Audit Trail

All matter operations are logged with:
- User identification
- Timestamp
- Action performed
- Previous/new values
- IP address

This comprehensive Matter Management API provides robust functionality for managing the complete lifecycle of legal matters while ensuring security, compliance, and optimal workflow management.