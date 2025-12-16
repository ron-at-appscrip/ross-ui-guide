# Client Management - CRUD Operations

## 📋 Overview

The Client Management API provides comprehensive CRUD operations for managing legal clients within the Ross AI platform. This module handles both individual persons and companies, with support for complex contact information, relationship management, and extensive metadata tracking.

## 🎯 Core Features

- **Full CRUD Operations**: Create, Read, Update, Delete clients
- **Dual Client Types**: Support for both individual persons and companies
- **Rich Contact Management**: Multiple emails, phones, addresses, and websites
- **Organization Isolation**: Multi-tenant data separation
- **Duplicate Detection**: Automatic email and phone validation
- **Audit Trail**: Complete activity logging
- **File Management**: Profile photo upload and management
- **Relationship Tracking**: Client-matter associations and statistics

## 🗄️ Data Models

### Pydantic Schemas

#### ClientBase Schema
```python
from pydantic import BaseModel, EmailStr, validator
from typing import List, Optional
from enum import Enum
import uuid
from datetime import datetime

class ClientType(str, Enum):
    PERSON = "person"
    COMPANY = "company"

class ClientStatus(str, Enum):
    ACTIVE = "active"
    INACTIVE = "inactive" 
    PROSPECT = "prospect"

class ContactType(str, Enum):
    WORK = "work"
    PERSONAL = "personal"
    HOME = "home"
    MOBILE = "mobile"
    FAX = "fax"
    OTHER = "other"

class AddressType(str, Enum):
    WORK = "work"
    HOME = "home"
    BILLING = "billing"
    SHIPPING = "shipping"
    OTHER = "other"

class WebsiteType(str, Enum):
    WORK = "work"
    PERSONAL = "personal"
    PORTFOLIO = "portfolio"
    SOCIAL = "social"
    OTHER = "other"

class ContactMethodBase(BaseModel):
    value: str
    type: ContactType
    is_primary: bool = False

class ContactMethodCreate(ContactMethodBase):
    pass

class ContactMethod(ContactMethodBase):
    id: uuid.UUID
    
    class Config:
        from_attributes = True

class AddressBase(BaseModel):
    street: str
    city: str
    state: str
    zip_code: str
    country: str = "US"
    type: AddressType
    is_primary: bool = False

class AddressCreate(AddressBase):
    pass

class Address(AddressBase):
    id: uuid.UUID
    
    class Config:
        from_attributes = True

class WebsiteBase(BaseModel):
    url: str
    type: WebsiteType
    is_primary: bool = False
    
    @validator('url')
    def validate_url(cls, v):
        if not v.startswith(('http://', 'https://')):
            v = f'https://{v}'
        return v

class WebsiteCreate(WebsiteBase):
    pass

class Website(WebsiteBase):
    id: uuid.UUID
    
    class Config:
        from_attributes = True

class PersonDetailsBase(BaseModel):
    prefix: Optional[str] = None
    first_name: str
    middle_name: Optional[str] = None
    last_name: str
    title: Optional[str] = None
    date_of_birth: Optional[datetime] = None
    company: Optional[str] = None

class PersonDetailsCreate(PersonDetailsBase):
    pass

class PersonDetails(PersonDetailsBase):
    class Config:
        from_attributes = True
```

#### Client Schemas
```python
class ClientBase(BaseModel):
    name: str
    type: ClientType
    status: ClientStatus
    primary_contact: str
    industry: Optional[str] = None
    notes: Optional[str] = None
    tags: List[str] = []

class ClientCreate(ClientBase):
    # Contact information
    emails: List[ContactMethodCreate] = []
    phones: List[ContactMethodCreate] = []
    websites: List[WebsiteCreate] = []
    addresses: List[AddressCreate] = []
    
    # Person-specific fields
    person_details: Optional[PersonDetailsCreate] = None
    
    @validator('emails')
    def validate_emails(cls, v):
        if not v:
            raise ValueError('At least one email is required')
        
        primary_count = sum(1 for email in v if email.is_primary)
        if primary_count != 1:
            raise ValueError('Exactly one email must be marked as primary')
        return v
    
    @validator('phones')
    def validate_phones(cls, v):
        if v:
            primary_count = sum(1 for phone in v if phone.is_primary)
            if primary_count > 1:
                raise ValueError('Only one phone can be marked as primary')
        return v

class ClientUpdate(BaseModel):
    name: Optional[str] = None
    type: Optional[ClientType] = None
    status: Optional[ClientStatus] = None
    primary_contact: Optional[str] = None
    industry: Optional[str] = None
    notes: Optional[str] = None
    tags: Optional[List[str]] = None
    
    # Contact information updates
    emails: Optional[List[ContactMethodCreate]] = None
    phones: Optional[List[ContactMethodCreate]] = None
    websites: Optional[List[WebsiteCreate]] = None
    addresses: Optional[List[AddressCreate]] = None
    
    # Person details update
    person_details: Optional[PersonDetailsCreate] = None

class Client(ClientBase):
    id: uuid.UUID
    organization_id: uuid.UUID
    
    # Contact information
    emails: List[ContactMethod]
    phones: List[ContactMethod]
    websites: List[Website]
    addresses: List[Address]
    
    # Person-specific fields
    person_details: Optional[PersonDetails] = None
    
    # Profile
    profile_photo_url: Optional[str] = None
    
    # Timestamps
    date_added: datetime
    last_activity: datetime
    created_at: datetime
    updated_at: datetime
    
    # Statistics (computed fields)
    total_matters: int = 0
    active_matters: int = 0
    total_billed: float = 0.0
    outstanding_balance: float = 0.0
    
    class Config:
        from_attributes = True

class ClientResponse(BaseModel):
    data: Client
    
class ClientListResponse(BaseModel):
    data: List[Client]
    meta: dict
    links: dict
```

### SQLAlchemy Models

```python
from sqlalchemy import Column, String, Boolean, DateTime, Text, DECIMAL, ForeignKey, Table
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import relationship
from sqlalchemy.ext.hybrid import hybrid_property
import uuid
from datetime import datetime

# Association table for client tags
client_tags = Table(
    'client_tags',
    Base.metadata,
    Column('client_id', UUID(as_uuid=True), ForeignKey('clients.id')),
    Column('tag_id', UUID(as_uuid=True), ForeignKey('tags.id'))
)

class Client(Base):
    __tablename__ = 'clients'
    
    # Primary fields
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    organization_id = Column(UUID(as_uuid=True), ForeignKey('organizations.id'), nullable=False)
    name = Column(String(255), nullable=False)
    type = Column(String(20), nullable=False)  # person, company
    status = Column(String(20), nullable=False)  # active, inactive, prospect
    primary_contact = Column(String(255), nullable=False)
    industry = Column(String(100))
    notes = Column(Text)
    profile_photo_url = Column(String(500))
    
    # Timestamps
    date_added = Column(DateTime, default=datetime.utcnow)
    last_activity = Column(DateTime, default=datetime.utcnow)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    organization = relationship("Organization", back_populates="clients")
    emails = relationship("ClientEmail", back_populates="client", cascade="all, delete-orphan")
    phones = relationship("ClientPhone", back_populates="client", cascade="all, delete-orphan")
    addresses = relationship("ClientAddress", back_populates="client", cascade="all, delete-orphan")
    websites = relationship("ClientWebsite", back_populates="client", cascade="all, delete-orphan")
    person_details = relationship("ClientPersonDetails", back_populates="client", uselist=False, cascade="all, delete-orphan")
    matters = relationship("Matter", back_populates="client")
    tags = relationship("Tag", secondary=client_tags, back_populates="clients")
    
    # Computed properties
    @hybrid_property
    def total_matters(self):
        return len(self.matters)
    
    @hybrid_property
    def active_matters(self):
        return len([m for m in self.matters if m.status == 'active'])
    
    @hybrid_property
    def total_billed(self):
        return sum(matter.total_billed for matter in self.matters)
    
    @hybrid_property
    def outstanding_balance(self):
        return sum(matter.outstanding_balance for matter in self.matters)

class ClientEmail(Base):
    __tablename__ = 'client_emails'
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    client_id = Column(UUID(as_uuid=True), ForeignKey('clients.id'), nullable=False)
    value = Column(String(255), nullable=False)
    type = Column(String(20), nullable=False)
    is_primary = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    client = relationship("Client", back_populates="emails")

class ClientPhone(Base):
    __tablename__ = 'client_phones'
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    client_id = Column(UUID(as_uuid=True), ForeignKey('clients.id'), nullable=False)
    value = Column(String(50), nullable=False)
    type = Column(String(20), nullable=False)
    is_primary = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    client = relationship("Client", back_populates="phones")

class ClientAddress(Base):
    __tablename__ = 'client_addresses'
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    client_id = Column(UUID(as_uuid=True), ForeignKey('clients.id'), nullable=False)
    street = Column(String(255), nullable=False)
    city = Column(String(100), nullable=False)
    state = Column(String(50), nullable=False)
    zip_code = Column(String(20), nullable=False)
    country = Column(String(50), default='US')
    type = Column(String(20), nullable=False)
    is_primary = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    client = relationship("Client", back_populates="addresses")

class ClientWebsite(Base):
    __tablename__ = 'client_websites'
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    client_id = Column(UUID(as_uuid=True), ForeignKey('clients.id'), nullable=False)
    url = Column(String(500), nullable=False)
    type = Column(String(20), nullable=False)
    is_primary = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    client = relationship("Client", back_populates="websites")

class ClientPersonDetails(Base):
    __tablename__ = 'client_person_details'
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    client_id = Column(UUID(as_uuid=True), ForeignKey('clients.id'), nullable=False)
    prefix = Column(String(10))
    first_name = Column(String(100), nullable=False)
    middle_name = Column(String(100))
    last_name = Column(String(100), nullable=False)
    title = Column(String(100))
    date_of_birth = Column(DateTime)
    company = Column(String(255))
    created_at = Column(DateTime, default=datetime.utcnow)
    
    client = relationship("Client", back_populates="person_details")
```

## 🚀 API Endpoints

### 1. Create Client

**POST** `/api/v1/clients`

Creates a new client with full contact information and metadata.

#### Request Body
```json
{
  "name": "John Smith",
  "type": "person",
  "status": "active",
  "primary_contact": "John Smith",
  "industry": "Technology",
  "notes": "Senior executive with extensive experience in corporate law.",
  "tags": ["Corporate Law", "M&A", "VIP"],
  
  "emails": [
    {
      "value": "john.smith@techcorp.com",
      "type": "work",
      "is_primary": true
    },
    {
      "value": "john@personal.com",
      "type": "personal",
      "is_primary": false
    }
  ],
  
  "phones": [
    {
      "value": "+1-555-123-4567",
      "type": "work",
      "is_primary": true
    },
    {
      "value": "+1-555-987-6543",
      "type": "mobile",
      "is_primary": false
    }
  ],
  
  "addresses": [
    {
      "street": "123 Corporate Blvd",
      "city": "New York",
      "state": "NY",
      "zip_code": "10001",
      "country": "US",
      "type": "work",
      "is_primary": true
    }
  ],
  
  "websites": [
    {
      "url": "https://johnsmith.com",
      "type": "personal",
      "is_primary": true
    }
  ],
  
  "person_details": {
    "prefix": "Mr.",
    "first_name": "John",
    "last_name": "Smith",
    "title": "CEO",
    "company": "TechCorp Inc."
  }
}
```

#### Response
```json
{
  "data": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "organization_id": "987f6543-e21c-43d5-b789-012345678901",
    "name": "John Smith",
    "type": "person",
    "status": "active",
    "primary_contact": "John Smith",
    "industry": "Technology",
    "notes": "Senior executive with extensive experience in corporate law.",
    "tags": ["Corporate Law", "M&A", "VIP"],
    
    "emails": [
      {
        "id": "111e1111-e11b-11d1-a111-111111111111",
        "value": "john.smith@techcorp.com",
        "type": "work",
        "is_primary": true
      }
    ],
    
    "phones": [
      {
        "id": "222e2222-e22b-22d2-a222-222222222222",
        "value": "+1-555-123-4567",
        "type": "work",
        "is_primary": true
      }
    ],
    
    "addresses": [
      {
        "id": "333e3333-e33b-33d3-a333-333333333333",
        "street": "123 Corporate Blvd",
        "city": "New York",
        "state": "NY",
        "zip_code": "10001",
        "country": "US",
        "type": "work",
        "is_primary": true
      }
    ],
    
    "websites": [
      {
        "id": "444e4444-e44b-44d4-a444-444444444444",
        "url": "https://johnsmith.com",
        "type": "personal",
        "is_primary": true
      }
    ],
    
    "person_details": {
      "prefix": "Mr.",
      "first_name": "John",
      "last_name": "Smith",
      "title": "CEO",
      "company": "TechCorp Inc."
    },
    
    "profile_photo_url": null,
    "date_added": "2024-12-07T10:30:00Z",
    "last_activity": "2024-12-07T10:30:00Z",
    "created_at": "2024-12-07T10:30:00Z",
    "updated_at": "2024-12-07T10:30:00Z",
    
    "total_matters": 0,
    "active_matters": 0,
    "total_billed": 0.0,
    "outstanding_balance": 0.0
  }
}
```

#### Error Responses
```json
// 400 - Validation Error
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Request validation failed",
    "details": [
      {
        "field": "emails",
        "message": "At least one email is required"
      },
      {
        "field": "emails.0.value",
        "message": "Invalid email format"
      }
    ]
  },
  "timestamp": "2024-12-07T10:30:00Z",
  "request_id": "req_abc123"
}

// 409 - Duplicate Client
{
  "error": {
    "code": "DUPLICATE_CLIENT",
    "message": "Client with this email already exists",
    "details": {
      "email": "john.smith@techcorp.com",
      "existing_client_id": "123e4567-e89b-12d3-a456-426614174000"
    }
  },
  "timestamp": "2024-12-07T10:30:00Z",
  "request_id": "req_abc123"
}
```

#### Implementation
```python
@router.post("/clients", response_model=ClientResponse, status_code=201)
@require_permission(Permission.CLIENTS_WRITE)
async def create_client(
    client_data: ClientCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
    redis: Redis = Depends(get_redis)
):
    # Check for duplicate email
    primary_email = next((e for e in client_data.emails if e.is_primary), None)
    if primary_email:
        existing_client = await client_service.find_by_email(
            db, primary_email.value, current_user.organization_id
        )
        if existing_client:
            raise HTTPException(
                status_code=409,
                detail={
                    "code": "DUPLICATE_CLIENT",
                    "message": "Client with this email already exists",
                    "details": {
                        "email": primary_email.value,
                        "existing_client_id": str(existing_client.id)
                    }
                }
            )
    
    # Create client
    client = await client_service.create_client(
        db, client_data, current_user.organization_id, current_user.id
    )
    
    # Log activity
    await activity_service.log_activity(
        db, current_user.id, "client_created",
        resource_type="client", resource_id=client.id,
        details={"client_name": client.name}
    )
    
    # Invalidate cache
    await redis.delete(f"clients:org:{current_user.organization_id}")
    
    return ClientResponse(data=client)
```

### 2. Get Client by ID

**GET** `/api/v1/clients/{client_id}`

Retrieves a single client by ID with all related data.

#### Path Parameters
- `client_id` (UUID): The unique identifier of the client

#### Response
```json
{
  "data": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "name": "John Smith",
    // ... full client object
  }
}
```

#### Implementation
```python
@router.get("/clients/{client_id}", response_model=ClientResponse)
@require_permission(Permission.CLIENTS_READ)
async def get_client(
    client_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
    redis: Redis = Depends(get_redis)
):
    # Try cache first
    cache_key = f"client:{client_id}"
    cached_client = await redis.get(cache_key)
    if cached_client:
        return ClientResponse(data=json.loads(cached_client))
    
    # Get from database
    client = await client_service.get_client_by_id(
        db, client_id, current_user.organization_id
    )
    
    if not client:
        raise HTTPException(404, "Client not found")
    
    # Cache result
    await redis.setex(
        cache_key, 
        timedelta(minutes=15), 
        json.dumps(client.dict(), default=str)
    )
    
    return ClientResponse(data=client)
```

### 3. Update Client

**PUT** `/api/v1/clients/{client_id}`

Updates an existing client with partial or complete data.

#### Request Body
```json
{
  "name": "John Smith Jr.",
  "status": "active",
  "notes": "Updated notes about the client",
  "emails": [
    {
      "value": "john.smith.jr@newemail.com",
      "type": "work",
      "is_primary": true
    }
  ]
}
```

#### Implementation
```python
@router.put("/clients/{client_id}", response_model=ClientResponse)
@require_permission(Permission.CLIENTS_WRITE)
async def update_client(
    client_id: UUID,
    client_data: ClientUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
    redis: Redis = Depends(get_redis)
):
    # Get existing client
    existing_client = await client_service.get_client_by_id(
        db, client_id, current_user.organization_id
    )
    
    if not existing_client:
        raise HTTPException(404, "Client not found")
    
    # Update client
    updated_client = await client_service.update_client(
        db, client_id, client_data, current_user.id
    )
    
    # Log activity
    await activity_service.log_activity(
        db, current_user.id, "client_updated",
        resource_type="client", resource_id=client_id,
        details={"changes": client_data.dict(exclude_unset=True)}
    )
    
    # Invalidate cache
    await redis.delete(f"client:{client_id}")
    await redis.delete(f"clients:org:{current_user.organization_id}")
    
    return ClientResponse(data=updated_client)
```

### 4. Delete Client

**DELETE** `/api/v1/clients/{client_id}`

Soft deletes a client (marks as inactive) or hard deletes if no associated matters exist.

#### Query Parameters
- `force` (boolean, optional): Force hard delete even with associated matters

#### Response
```json
{
  "message": "Client deleted successfully",
  "deleted_at": "2024-12-07T10:30:00Z"
}
```

#### Implementation
```python
@router.delete("/clients/{client_id}")
@require_permission(Permission.CLIENTS_DELETE)
async def delete_client(
    client_id: UUID,
    force: bool = False,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
    redis: Redis = Depends(get_redis)
):
    # Check if client exists
    client = await client_service.get_client_by_id(
        db, client_id, current_user.organization_id
    )
    
    if not client:
        raise HTTPException(404, "Client not found")
    
    # Check for associated matters
    matter_count = await client_service.get_matter_count(db, client_id)
    
    if matter_count > 0 and not force:
        # Soft delete - mark as inactive
        await client_service.soft_delete_client(db, client_id, current_user.id)
        action = "client_deactivated"
    else:
        # Hard delete
        await client_service.hard_delete_client(db, client_id)
        action = "client_deleted"
    
    # Log activity
    await activity_service.log_activity(
        db, current_user.id, action,
        resource_type="client", resource_id=client_id,
        details={"client_name": client.name, "force": force}
    )
    
    # Invalidate cache
    await redis.delete(f"client:{client_id}")
    await redis.delete(f"clients:org:{current_user.organization_id}")
    
    return {
        "message": "Client deleted successfully",
        "deleted_at": datetime.utcnow().isoformat()
    }
```

### 5. List Clients

**GET** `/api/v1/clients`

Retrieves a paginated list of clients with filtering and sorting options.

#### Query Parameters
- `page` (int, default=1): Page number
- `per_page` (int, default=20): Items per page (max 100)
- `status` (string): Filter by status (active, inactive, prospect)
- `type` (string): Filter by type (person, company)
- `search` (string): Search in name, email, phone
- `industry` (string): Filter by industry
- `tags` (string): Comma-separated tags to filter by
- `sort_by` (string): Sort field (name, created_at, last_activity)
- `sort_order` (string): Sort direction (asc, desc)

#### Response
```json
{
  "data": [
    {
      "id": "123e4567-e89b-12d3-a456-426614174000",
      "name": "John Smith",
      // ... client objects
    }
  ],
  "meta": {
    "total": 150,
    "page": 1,
    "per_page": 20,
    "total_pages": 8,
    "has_next": true,
    "has_prev": false
  },
  "links": {
    "first": "/api/v1/clients?page=1&per_page=20",
    "last": "/api/v1/clients?page=8&per_page=20",
    "next": "/api/v1/clients?page=2&per_page=20",
    "prev": null
  }
}
```

## 🔒 Security Considerations

### Permission Requirements
- **Read Operations**: `clients:read` permission
- **Write Operations**: `clients:write` permission  
- **Delete Operations**: `clients:delete` permission

### Data Validation
- Email format validation
- Phone number format validation
- URL validation for websites
- Required field enforcement
- Duplicate detection

### Organization Isolation
All client operations are automatically filtered by the user's organization to ensure data isolation in multi-tenant environment.

### Audit Logging
All client operations are logged with:
- User ID and organization ID
- Action performed
- Resource affected
- Timestamp and IP address
- Change details for updates

## 📊 Rate Limiting

- **General API calls**: 1000 requests per hour per user
- **Client creation**: 100 requests per hour per user
- **Bulk operations**: 10 requests per minute per user

## 🔄 Background Tasks

### Automatic Tasks
- **Statistics Calculation**: Update matter counts and billing totals
- **Duplicate Detection**: Periodic cleanup of potential duplicates
- **Photo Processing**: Resize and optimize uploaded profile photos
- **Search Index Update**: Update full-text search indexes

### Manual Tasks
- **Data Export**: Generate CSV/Excel exports
- **Bulk Import**: Process client import files
- **Data Cleanup**: Remove orphaned contact records

This comprehensive CRUD API provides all necessary operations for complete client lifecycle management while maintaining security, performance, and data integrity.