# Client Contact Management API

## 📋 Overview

The Client Contact Management API provides comprehensive CRUD operations for managing all types of client contact information including emails, phone numbers, addresses, and websites. This module supports multiple contact methods per client with primary designation, type classification, and validation.

## 🎯 Core Features

- **Multi-Contact Support**: Multiple emails, phones, addresses, and websites per client
- **Primary Designation**: Mark one contact method as primary for each type
- **Type Classification**: Categorize contacts (work, home, mobile, billing, etc.)
- **Real-time Validation**: Email format, phone number, and address validation
- **Duplicate Detection**: Prevent duplicate contact information
- **Bulk Operations**: Add, update, or remove multiple contacts at once
- **History Tracking**: Maintain audit trail of contact changes
- **Import/Export**: CSV and vCard format support

## 📞 Contact Types & Validation

### Contact Method Types

```python
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
```

### Data Schemas

```python
class EmailContactCreate(BaseModel):
    value: EmailStr
    type: ContactType = ContactType.WORK
    is_primary: bool = False
    label: Optional[str] = None

class PhoneContactCreate(BaseModel):
    value: str
    type: ContactType = ContactType.WORK
    is_primary: bool = False
    extension: Optional[str] = None
    label: Optional[str] = None
    
    @validator('value')
    def validate_phone(cls, v):
        # Remove formatting and validate
        cleaned = re.sub(r'[^\d+]', '', v)
        if not re.match(r'^\+?[1-9]\d{1,14}$', cleaned):
            raise ValueError('Invalid phone number format')
        return v

class AddressContactCreate(BaseModel):
    street: str
    street2: Optional[str] = None
    city: str
    state: str
    zip_code: str
    country: str = "US"
    type: AddressType = AddressType.WORK
    is_primary: bool = False
    
    @validator('zip_code')
    def validate_zip(cls, v, values):
        if values.get('country') == 'US':
            if not re.match(r'^\d{5}(-\d{4})?$', v):
                raise ValueError('Invalid US ZIP code format')
        return v

class WebsiteContactCreate(BaseModel):
    url: HttpUrl
    type: WebsiteType = WebsiteType.WORK
    is_primary: bool = False
    title: Optional[str] = None
```

## 📧 Email Management

### 1. Add Email Address

**POST** `/api/v1/clients/{client_id}/emails`

Adds a new email address to a client.

#### Request Body

```json
{
  "value": "john.smith@newcompany.com",
  "type": "work",
  "is_primary": false,
  "label": "New Work Email"
}
```

#### Response

```json
{
  "data": {
    "id": "email_123",
    "client_id": "client_456", 
    "value": "john.smith@newcompany.com",
    "type": "work",
    "is_primary": false,
    "label": "New Work Email",
    "verified": false,
    "verification_sent_at": null,
    "created_at": "2024-12-07T10:30:00Z",
    "updated_at": "2024-12-07T10:30:00Z"
  }
}
```

#### Implementation

```python
@router.post("/clients/{client_id}/emails", response_model=EmailContactResponse)
@require_permission(Permission.CLIENTS_WRITE)
async def add_client_email(
    client_id: UUID,
    email_data: EmailContactCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Verify client exists and user has access
    client = await client_service.get_client_by_id(db, client_id, current_user.organization_id)
    if not client:
        raise HTTPException(404, "Client not found")
    
    # Check for duplicate email
    existing_email = await contact_service.find_email_by_value(
        db, email_data.value, current_user.organization_id
    )
    if existing_email:
        raise HTTPException(409, f"Email {email_data.value} already exists for another client")
    
    # If setting as primary, unset other primary emails
    if email_data.is_primary:
        await contact_service.unset_primary_emails(db, client_id)
    
    # Create email contact
    email_contact = await contact_service.create_email_contact(
        db, client_id, email_data, current_user.id
    )
    
    # Log activity
    await activity_service.log_activity(
        db, current_user.id, "email_added",
        resource_type="client", resource_id=client_id,
        details={"email": email_data.value, "type": email_data.type}
    )
    
    return EmailContactResponse(data=email_contact)
```

### 2. Update Email Address

**PUT** `/api/v1/clients/{client_id}/emails/{email_id}`

Updates an existing email address.

#### Request Body

```json
{
  "value": "john.smith@updatedcompany.com",
  "type": "work",
  "is_primary": true,
  "label": "Updated Work Email"
}
```

### 3. Delete Email Address

**DELETE** `/api/v1/clients/{client_id}/emails/{email_id}`

Removes an email address from a client.

#### Response

```json
{
  "message": "Email address deleted successfully",
  "deleted_at": "2024-12-07T10:30:00Z"
}
```

### 4. Verify Email Address

**POST** `/api/v1/clients/{client_id}/emails/{email_id}/verify`

Sends verification email to the address.

#### Response

```json
{
  "message": "Verification email sent",
  "verification_token": "verify_abc123",
  "expires_at": "2024-12-07T16:30:00Z"
}
```

### 5. List Client Emails

**GET** `/api/v1/clients/{client_id}/emails`

Retrieves all email addresses for a client.

#### Response

```json
{
  "data": [
    {
      "id": "email_123",
      "value": "john.smith@company.com",
      "type": "work",
      "is_primary": true,
      "label": "Work Email",
      "verified": true,
      "created_at": "2024-01-15T10:00:00Z"
    },
    {
      "id": "email_124", 
      "value": "john@personal.com",
      "type": "personal",
      "is_primary": false,
      "label": "Personal Email",
      "verified": false,
      "created_at": "2024-02-01T14:30:00Z"
    }
  ]
}
```

## 📱 Phone Management

### 6. Add Phone Number

**POST** `/api/v1/clients/{client_id}/phones`

Adds a new phone number to a client.

#### Request Body

```json
{
  "value": "+1-555-987-6543",
  "type": "mobile", 
  "is_primary": false,
  "extension": "123",
  "label": "Mobile Phone"
}
```

#### Response

```json
{
  "data": {
    "id": "phone_789",
    "client_id": "client_456",
    "value": "+1-555-987-6543",
    "formatted_value": "(555) 987-6543",
    "type": "mobile",
    "is_primary": false,
    "extension": "123",
    "label": "Mobile Phone",
    "country_code": "US",
    "verified": false,
    "created_at": "2024-12-07T10:30:00Z"
  }
}
```

### 7. Update Phone Number

**PUT** `/api/v1/clients/{client_id}/phones/{phone_id}`

Updates an existing phone number.

### 8. Delete Phone Number

**DELETE** `/api/v1/clients/{client_id}/phones/{phone_id}`

Removes a phone number from a client.

### 9. Send SMS Verification

**POST** `/api/v1/clients/{client_id}/phones/{phone_id}/verify`

Sends SMS verification code to the phone number.

#### Response

```json
{
  "message": "Verification code sent via SMS",
  "verification_id": "sms_verify_123",
  "expires_at": "2024-12-07T10:35:00Z"
}
```

### 10. List Client Phones

**GET** `/api/v1/clients/{client_id}/phones`

Retrieves all phone numbers for a client.

## 🏠 Address Management

### 11. Add Address

**POST** `/api/v1/clients/{client_id}/addresses`

Adds a new address to a client.

#### Request Body

```json
{
  "street": "456 Business Ave",
  "street2": "Suite 200",
  "city": "Los Angeles", 
  "state": "CA",
  "zip_code": "90210",
  "country": "US",
  "type": "work",
  "is_primary": true
}
```

#### Response

```json
{
  "data": {
    "id": "address_345",
    "client_id": "client_456",
    "street": "456 Business Ave",
    "street2": "Suite 200", 
    "city": "Los Angeles",
    "state": "CA",
    "zip_code": "90210",
    "country": "US",
    "type": "work",
    "is_primary": true,
    "formatted_address": "456 Business Ave, Suite 200, Los Angeles, CA 90210, US",
    "latitude": 34.0522,
    "longitude": -118.2437,
    "timezone": "America/Los_Angeles",
    "validated": true,
    "validation_source": "USPS",
    "created_at": "2024-12-07T10:30:00Z"
  }
}
```

### 12. Validate Address

**POST** `/api/v1/clients/{client_id}/addresses/validate`

Validates an address using external services (USPS, Google).

#### Request Body

```json
{
  "street": "456 Business Ave",
  "city": "Los Angeles",
  "state": "CA", 
  "zip_code": "90210",
  "country": "US"
}
```

#### Response

```json
{
  "data": {
    "is_valid": true,
    "standardized_address": {
      "street": "456 BUSINESS AVE",
      "city": "LOS ANGELES",
      "state": "CA",
      "zip_code": "90210-1234"
    },
    "suggestions": [],
    "validation_source": "USPS",
    "confidence_score": 1.0,
    "delivery_point": true
  }
}
```

### 13. Update Address

**PUT** `/api/v1/clients/{client_id}/addresses/{address_id}`

Updates an existing address.

### 14. Delete Address

**DELETE** `/api/v1/clients/{client_id}/addresses/{address_id}`

Removes an address from a client.

### 15. List Client Addresses

**GET** `/api/v1/clients/{client_id}/addresses`

Retrieves all addresses for a client.

## 🌐 Website Management

### 16. Add Website

**POST** `/api/v1/clients/{client_id}/websites`

Adds a new website URL to a client.

#### Request Body

```json
{
  "url": "https://johnscompany.com",
  "type": "work",
  "is_primary": true,
  "title": "Company Website"
}
```

#### Response

```json
{
  "data": {
    "id": "website_678",
    "client_id": "client_456",
    "url": "https://johnscompany.com",
    "type": "work", 
    "is_primary": true,
    "title": "Company Website",
    "domain": "johnscompany.com",
    "ssl_enabled": true,
    "last_checked": "2024-12-07T10:30:00Z",
    "status_code": 200,
    "created_at": "2024-12-07T10:30:00Z"
  }
}
```

### 17. Check Website Status

**POST** `/api/v1/clients/{client_id}/websites/{website_id}/check`

Checks if a website is accessible and returns status information.

#### Response

```json
{
  "data": {
    "url": "https://johnscompany.com",
    "status_code": 200,
    "response_time_ms": 245,
    "ssl_enabled": true,
    "ssl_expires": "2025-01-15T00:00:00Z",
    "last_checked": "2024-12-07T10:30:00Z",
    "is_accessible": true
  }
}
```

### 18. Update Website

**PUT** `/api/v1/clients/{client_id}/websites/{website_id}`

Updates an existing website URL.

### 19. Delete Website

**DELETE** `/api/v1/clients/{client_id}/websites/{website_id}`

Removes a website from a client.

### 20. List Client Websites

**GET** `/api/v1/clients/{client_id}/websites`

Retrieves all websites for a client.

## 🔄 Bulk Operations

### 21. Bulk Update Contacts

**PATCH** `/api/v1/clients/{client_id}/contacts/bulk`

Updates multiple contact methods in a single operation.

#### Request Body

```json
{
  "emails": [
    {
      "id": "email_123",
      "value": "updated@company.com",
      "is_primary": true
    }
  ],
  "phones": [
    {
      "action": "create",
      "value": "+1-555-111-2222",
      "type": "work"
    },
    {
      "action": "delete",
      "id": "phone_456"
    }
  ],
  "addresses": [
    {
      "id": "address_789",
      "action": "update",
      "street": "Updated Street Address"
    }
  ]
}
```

#### Response

```json
{
  "data": {
    "emails": {
      "updated": 1,
      "created": 0,
      "deleted": 0
    },
    "phones": {
      "updated": 0,
      "created": 1,
      "deleted": 1
    },
    "addresses": {
      "updated": 1,
      "created": 0,
      "deleted": 0
    }
  },
  "errors": []
}
```

### 22. Import Contacts from vCard

**POST** `/api/v1/clients/{client_id}/contacts/import/vcard`

Imports contact information from vCard format.

#### Request Body (multipart/form-data)

- `file`: vCard file (.vcf)
- `overwrite_existing`: boolean (default: false)
- `set_as_primary`: boolean (default: false)

#### Response

```json
{
  "data": {
    "imported": {
      "emails": 2,
      "phones": 3,
      "addresses": 1,
      "websites": 1
    },
    "skipped": {
      "emails": 0,
      "phones": 0,
      "addresses": 0, 
      "websites": 0
    },
    "errors": []
  }
}
```

### 23. Export Contacts to vCard

**GET** `/api/v1/clients/{client_id}/contacts/export/vcard`

Exports all client contact information as vCard.

#### Response

```
Content-Type: text/vcard
Content-Disposition: attachment; filename="john_smith_contacts.vcf"

BEGIN:VCARD
VERSION:3.0
FN:John Smith
ORG:TechCorp Inc.
EMAIL;TYPE=WORK:john.smith@techcorp.com
TEL;TYPE=WORK:+1-555-123-4567
ADR;TYPE=WORK:;;123 Corporate Blvd;New York;NY;10001;US
URL;TYPE=WORK:https://techcorp.com
END:VCARD
```

## 📊 Contact Analytics

### 24. Contact Statistics

**GET** `/api/v1/clients/{client_id}/contacts/stats`

Retrieves contact method statistics for a client.

#### Response

```json
{
  "data": {
    "total_contacts": 8,
    "by_type": {
      "emails": 3,
      "phones": 2,
      "addresses": 2,
      "websites": 1
    },
    "verified_contacts": 5,
    "primary_contacts": {
      "email": "john.smith@techcorp.com",
      "phone": "+1-555-123-4567",
      "address": "123 Corporate Blvd, New York, NY 10001",
      "website": "https://techcorp.com"
    },
    "last_updated": "2024-12-06T15:30:00Z"
  }
}
```

## 🔒 Security & Validation

### Data Protection

- **Email Validation**: RFC 5322 compliant email validation
- **Phone Validation**: E.164 international format with country-specific rules
- **Address Validation**: Integration with USPS, Google Maps, and other services
- **URL Validation**: Protocol validation and security scanning
- **Duplicate Prevention**: Cross-client duplicate detection
- **Data Encryption**: Sensitive contact data encrypted at rest

### Privacy Compliance

- **Consent Tracking**: Track consent for contact method usage
- **Data Retention**: Automatic cleanup of old unverified contacts
- **Audit Logging**: Complete history of contact changes
- **Access Controls**: Role-based access to contact information

### Rate Limiting

- **Contact CRUD**: 200 operations per minute per user
- **Verification**: 10 verifications per hour per contact method
- **Bulk Operations**: 5 operations per minute per user
- **Import/Export**: 3 operations per hour per user

This comprehensive contact management API provides robust functionality for maintaining accurate, up-to-date client contact information while ensuring data quality and compliance requirements.