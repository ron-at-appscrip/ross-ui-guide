# Signup Wizard API

## 📋 Overview

The Signup Wizard API manages the multi-step onboarding process for new users joining the Ross AI platform. This module implements a flexible, progressive disclosure system that adapts the signup flow based on firm size and user needs, ensuring optimal onboarding experience while collecting necessary business information.

## 🎯 Core Features

- **Multi-Step Progressive Flow**: Guided onboarding with conditional steps
- **Firm Size Adaptation**: Different flows for solo, small, medium, large, and enterprise firms
- **State Persistence**: Save and resume signup progress across sessions
- **Conditional Logic**: Dynamic step routing based on user responses
- **Template System**: Pre-configured setups for common firm types
- **Validation Engine**: Real-time validation with helpful error messages
- **Integration Ready**: Seamless connection to billing, team setup, and feature activation

## 🔄 Wizard Flow Architecture

### Signup Flow Types

```python
class FirmSize(str, Enum):
    SOLO = "solo"           # 1 attorney
    SMALL = "small"         # 2-10 attorneys  
    MEDIUM = "medium"       # 11-50 attorneys
    LARGE = "large"         # 51-200 attorneys
    ENTERPRISE = "enterprise" # 200+ attorneys

class WizardStep(str, Enum):
    PERSONAL_INFO = "personal_info"
    FIRM_INFO = "firm_info"
    PRACTICE_AREAS = "practice_areas"
    TEAM_SETUP = "team_setup"
    BILLING_SETUP = "billing_setup"
    INTEGRATIONS = "integrations"
    PREFERENCES = "preferences"
    COMPLETE = "complete"
```

### Flow Configuration

```json
{
  "solo": ["personal_info", "firm_info", "practice_areas", "preferences", "complete"],
  "small": ["personal_info", "firm_info", "practice_areas", "team_setup", "billing_setup", "preferences", "complete"],
  "medium": ["personal_info", "firm_info", "practice_areas", "team_setup", "billing_setup", "integrations", "preferences", "complete"],
  "large": ["personal_info", "firm_info", "practice_areas", "team_setup", "billing_setup", "integrations", "preferences", "complete"],
  "enterprise": ["personal_info", "firm_info", "practice_areas", "team_setup", "billing_setup", "integrations", "preferences", "complete"]
}
```

## 🚀 Wizard Session Management

### 1. Initialize Wizard Session

**POST** `/api/v1/auth/signup/wizard/init`

Initializes a new signup wizard session for an authenticated user.

#### Request Body

```json
{
  "user_id": "123e4567-e89b-12d3-a456-426614174000",
  "firm_size": "small",
  "skip_completed": false
}
```

#### Response

```json
{
  "data": {
    "wizard_id": "wizard_789",
    "user_id": "123e4567-e89b-12d3-a456-426614174000",
    "firm_size": "small",
    "current_step": "personal_info",
    "total_steps": 7,
    "step_index": 0,
    "completion_percentage": 0,
    "steps": [
      {
        "key": "personal_info",
        "title": "Personal Information",
        "description": "Tell us about yourself",
        "status": "current",
        "required": true,
        "estimated_time_minutes": 3
      },
      {
        "key": "firm_info", 
        "title": "Firm Information",
        "description": "About your law firm",
        "status": "pending",
        "required": true,
        "estimated_time_minutes": 5
      }
    ],
    "created_at": "2024-12-07T10:30:00Z",
    "expires_at": "2024-12-14T10:30:00Z"
  }
}
```

#### Implementation

```python
@router.post("/auth/signup/wizard/init", response_model=WizardSessionResponse)
async def initialize_wizard(
    init_data: WizardInitRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
    redis: Redis = Depends(get_redis)
):
    # Check if user already has active wizard session
    existing_session = await wizard_service.get_active_session(db, current_user.id)
    
    if existing_session and not init_data.skip_completed:
        return WizardSessionResponse(data=existing_session)
    
    # Create new wizard session
    wizard_session = await wizard_service.create_session(
        db, 
        user_id=current_user.id,
        firm_size=init_data.firm_size
    )
    
    # Cache session for fast access
    await redis.setex(
        f"wizard_session:{wizard_session.id}",
        timedelta(days=7),
        wizard_session.json()
    )
    
    return WizardSessionResponse(data=wizard_session)
```

### 2. Get Current Step

**GET** `/api/v1/auth/signup/wizard/{wizard_id}/current`

Retrieves the current step information and form data.

#### Response

```json
{
  "data": {
    "step": {
      "key": "personal_info",
      "title": "Personal Information",
      "description": "Tell us about yourself",
      "step_index": 0,
      "total_steps": 7,
      "required": true,
      "estimated_time_minutes": 3
    },
    "form_schema": {
      "type": "object",
      "properties": {
        "first_name": {
          "type": "string",
          "title": "First Name",
          "maxLength": 50,
          "required": true
        },
        "last_name": {
          "type": "string", 
          "title": "Last Name",
          "maxLength": 50,
          "required": true
        },
        "title": {
          "type": "string",
          "title": "Professional Title",
          "enum": ["Attorney", "Partner", "Associate", "Of Counsel", "Legal Assistant", "Other"]
        },
        "bar_number": {
          "type": "string",
          "title": "Bar Number",
          "pattern": "^[A-Z0-9-]+$"
        },
        "phone": {
          "type": "string",
          "title": "Phone Number",
          "format": "phone"
        }
      }
    },
    "saved_data": {
      "first_name": "John",
      "last_name": "Smith"
    },
    "validation_errors": [],
    "can_skip": false,
    "can_go_back": false
  }
}
```

### 3. Save Step Data

**POST** `/api/v1/auth/signup/wizard/{wizard_id}/steps/{step_key}`

Saves data for the current step and optionally advances to next step.

#### Request Body

```json
{
  "data": {
    "first_name": "John",
    "last_name": "Smith", 
    "title": "Attorney",
    "bar_number": "NY-123456",
    "phone": "+1-555-123-4567"
  },
  "advance_to_next": true,
  "validate_only": false
}
```

#### Response

```json
{
  "data": {
    "wizard_id": "wizard_789",
    "step_key": "personal_info",
    "saved_successfully": true,
    "validation_errors": [],
    "next_step": {
      "key": "firm_info",
      "title": "Firm Information",
      "step_index": 1
    },
    "completion_percentage": 14,
    "updated_at": "2024-12-07T10:35:00Z"
  }
}
```

#### Implementation

```python
@router.post("/auth/signup/wizard/{wizard_id}/steps/{step_key}")
async def save_step_data(
    wizard_id: UUID,
    step_key: str,
    step_data: StepDataRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
    redis: Redis = Depends(get_redis)
):
    # Get wizard session
    wizard_session = await wizard_service.get_session(db, wizard_id, current_user.id)
    if not wizard_session:
        raise HTTPException(404, "Wizard session not found")
    
    # Validate step data
    validator = get_step_validator(step_key, wizard_session.firm_size)
    validation_result = validator.validate(step_data.data)
    
    if not validation_result.is_valid and not step_data.validate_only:
        return StepSaveResponse(
            saved_successfully=False,
            validation_errors=validation_result.errors
        )
    
    if step_data.validate_only:
        return StepSaveResponse(
            saved_successfully=True,
            validation_errors=validation_result.errors,
            is_validation_only=True
        )
    
    # Save step data
    await wizard_service.save_step_data(
        db, wizard_id, step_key, step_data.data
    )
    
    # Advance to next step if requested
    next_step = None
    if step_data.advance_to_next:
        next_step = await wizard_service.advance_step(db, wizard_id)
    
    # Update completion percentage
    completion_percentage = wizard_service.calculate_completion(wizard_session)
    
    # Update cache
    await redis.setex(
        f"wizard_session:{wizard_id}",
        timedelta(days=7),
        wizard_session.json()
    )
    
    return StepSaveResponse(
        wizard_id=wizard_id,
        step_key=step_key,
        saved_successfully=True,
        validation_errors=[],
        next_step=next_step,
        completion_percentage=completion_percentage
    )
```

## 📋 Individual Step Endpoints

### 4. Personal Information Step

**GET/POST** `/api/v1/auth/signup/wizard/{wizard_id}/steps/personal-info`

Collects basic personal and professional information.

#### Form Fields

```json
{
  "first_name": "John",
  "last_name": "Smith",
  "title": "Attorney",
  "bar_number": "NY-123456",
  "bar_state": "NY",
  "admission_date": "2020-05-15",
  "phone": "+1-555-123-4567",
  "linkedin_url": "https://linkedin.com/in/johnsmith",
  "specializations": ["Corporate Law", "M&A"],
  "years_experience": 4
}
```

### 5. Firm Information Step

**GET/POST** `/api/v1/auth/signup/wizard/{wizard_id}/steps/firm-info`

Collects law firm details and structure information.

#### Form Fields

```json
{
  "firm_name": "Smith & Associates LLP",
  "firm_type": "LLP",
  "founded_year": 2018,
  "firm_size": "small",
  "attorney_count": 5,
  "staff_count": 3,
  "website": "https://smithlaw.com",
  "description": "Full-service law firm specializing in corporate law",
  "address": {
    "street": "123 Legal St",
    "city": "New York", 
    "state": "NY",
    "zip_code": "10001",
    "country": "US"
  },
  "contact": {
    "main_phone": "+1-555-LAW-FIRM",
    "main_email": "info@smithlaw.com"
  }
}
```

### 6. Practice Areas Step

**GET/POST** `/api/v1/auth/signup/wizard/{wizard_id}/steps/practice-areas`

Defines primary and secondary practice areas with matter types.

#### Form Fields

```json
{
  "primary_practice_areas": [
    {
      "area": "Corporate Law",
      "percentage": 60,
      "matter_types": ["M&A", "Corporate Formation", "Securities"]
    },
    {
      "area": "Real Estate",
      "percentage": 40,
      "matter_types": ["Commercial Real Estate", "Residential"]
    }
  ],
  "industries_served": ["Technology", "Healthcare", "Finance"],
  "client_types": ["Corporations", "Small Business", "Individuals"],
  "average_matter_value": "$50,000",
  "typical_matter_duration": "6 months"
}
```

### 7. Team Setup Step

**GET/POST** `/api/v1/auth/signup/wizard/{wizard_id}/steps/team-setup`

Configures team members, roles, and permissions.

#### Form Fields

```json
{
  "team_structure": "partnership",
  "team_members": [
    {
      "email": "jane@smithlaw.com",
      "first_name": "Jane",
      "last_name": "Doe",
      "role": "Partner",
      "title": "Senior Attorney",
      "permissions": ["clients:write", "matters:write", "billing:admin"],
      "practice_areas": ["Corporate Law"],
      "send_invitation": true
    },
    {
      "email": "assistant@smithlaw.com",
      "first_name": "Mary",
      "last_name": "Johnson",
      "role": "Staff",
      "title": "Legal Assistant", 
      "permissions": ["clients:read", "matters:read"],
      "send_invitation": true
    }
  ],
  "organization_settings": {
    "require_approval_for_new_matters": true,
    "matter_numbering_format": "YYYY-MM-###",
    "default_billing_rate": 350.00,
    "time_tracking_required": true
  }
}
```

### 8. Billing Setup Step

**GET/POST** `/api/v1/auth/signup/wizard/{wizard_id}/steps/billing-setup`

Configures billing preferences and payment methods.

#### Form Fields

```json
{
  "billing_model": "hourly",
  "default_rates": {
    "partner": 500.00,
    "senior_attorney": 350.00,
    "associate": 250.00,
    "paralegal": 150.00
  },
  "invoice_settings": {
    "default_payment_terms": "NET_30",
    "late_fee_percentage": 1.5,
    "auto_send_invoices": true,
    "invoice_template": "professional"
  },
  "accepted_payment_methods": ["check", "wire_transfer", "credit_card"],
  "trust_accounting": {
    "enabled": true,
    "bank_account": "***1234",
    "requires_approval": true
  },
  "expense_tracking": {
    "track_expenses": true,
    "markup_percentage": 10,
    "categories": ["Travel", "Filing Fees", "Copying", "Research"]
  }
}
```

### 9. Integrations Step

**GET/POST** `/api/v1/auth/signup/wizard/{wizard_id}/steps/integrations`

Sets up third-party integrations and data imports.

#### Form Fields

```json
{
  "calendar_integration": {
    "provider": "google",
    "email": "john@smithlaw.com",
    "sync_enabled": true,
    "calendar_id": "primary"
  },
  "email_integration": {
    "provider": "outlook",
    "email": "john@smithlaw.com",
    "auto_import": true,
    "folder_mapping": {
      "inbox": "general",
      "clients": "client_correspondence"
    }
  },
  "accounting_software": {
    "provider": "quickbooks",
    "company_id": "123456789",
    "sync_invoices": true,
    "sync_payments": true
  },
  "document_storage": {
    "provider": "google_drive",
    "folder_id": "1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms",
    "auto_organize": true
  },
  "data_import": {
    "import_existing_clients": true,
    "import_existing_matters": true,
    "data_source": "csv_upload",
    "mapping_preferences": "auto_detect"
  }
}
```

### 10. Preferences Step

**GET/POST** `/api/v1/auth/signup/wizard/{wizard_id}/steps/preferences`

Configures user preferences and notification settings.

#### Form Fields

```json
{
  "notifications": {
    "email_notifications": true,
    "sms_notifications": false,
    "push_notifications": true,
    "notification_types": {
      "new_matters": true,
      "deadlines": true,
      "client_messages": true,
      "payment_received": true,
      "team_updates": false
    }
  },
  "privacy_settings": {
    "profile_visibility": "organization",
    "contact_sharing": false,
    "analytics_participation": true
  },
  "ui_preferences": {
    "theme": "light",
    "language": "en",
    "timezone": "America/New_York",
    "date_format": "MM/DD/YYYY",
    "time_format": "12h"
  },
  "feature_preferences": {
    "enable_ai_suggestions": true,
    "auto_time_tracking": true,
    "smart_document_categorization": true
  }
}
```

## 🎯 Wizard Navigation

### 11. Go to Previous Step

**POST** `/api/v1/auth/signup/wizard/{wizard_id}/previous`

Navigates to the previous step in the wizard.

#### Response

```json
{
  "data": {
    "current_step": {
      "key": "personal_info",
      "title": "Personal Information",
      "step_index": 0
    },
    "can_go_back": false,
    "can_skip": false
  }
}
```

### 12. Go to Specific Step

**POST** `/api/v1/auth/signup/wizard/{wizard_id}/goto/{step_key}`

Jumps to a specific step (if allowed by business rules).

#### Response

```json
{
  "data": {
    "current_step": {
      "key": "firm_info",
      "title": "Firm Information", 
      "step_index": 1
    },
    "allowed": true,
    "reason": null
  }
}
```

### 13. Skip Current Step

**POST** `/api/v1/auth/signup/wizard/{wizard_id}/skip`

Skips the current step (if skippable).

#### Response

```json
{
  "data": {
    "skipped_step": "integrations",
    "next_step": {
      "key": "preferences",
      "title": "Preferences",
      "step_index": 6
    },
    "completion_percentage": 85
  }
}
```

## ✅ Wizard Completion

### 14. Complete Wizard

**POST** `/api/v1/auth/signup/wizard/{wizard_id}/complete`

Finalizes the wizard and activates the user account.

#### Response

```json
{
  "data": {
    "wizard_id": "wizard_789",
    "completed_at": "2024-12-07T11:45:00Z",
    "user_activated": true,
    "organization_created": true,
    "team_invitations_sent": 2,
    "integrations_configured": 3,
    "next_steps": [
      {
        "action": "complete_profile",
        "title": "Complete Your Profile",
        "description": "Add a profile photo and bio",
        "url": "/dashboard/profile"
      },
      {
        "action": "first_client",
        "title": "Add Your First Client", 
        "description": "Start by adding a client to the system",
        "url": "/dashboard/clients/new"
      }
    ],
    "welcome_tour_available": true
  }
}
```

#### Implementation

```python
@router.post("/auth/signup/wizard/{wizard_id}/complete")
async def complete_wizard(
    wizard_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
    background_tasks: BackgroundTasks = BackgroundTasks()
):
    # Get wizard session
    wizard_session = await wizard_service.get_session(db, wizard_id, current_user.id)
    if not wizard_session:
        raise HTTPException(404, "Wizard session not found")
    
    # Validate all required steps completed
    validation_result = await wizard_service.validate_completion(wizard_session)
    if not validation_result.is_complete:
        raise HTTPException(400, f"Missing required steps: {validation_result.missing_steps}")
    
    # Process wizard completion
    completion_result = await wizard_service.complete_wizard(db, wizard_session)
    
    # Background tasks
    background_tasks.add_task(
        send_welcome_email, 
        current_user.email, 
        wizard_session.firm_name
    )
    
    if completion_result.team_invitations:
        background_tasks.add_task(
            send_team_invitations,
            completion_result.team_invitations
        )
    
    # Configure integrations
    if completion_result.integrations:
        background_tasks.add_task(
            setup_integrations,
            completion_result.integrations,
            current_user.id
        )
    
    return WizardCompletionResponse(data=completion_result)
```

### 15. Get Wizard Summary

**GET** `/api/v1/auth/signup/wizard/{wizard_id}/summary`

Retrieves a complete summary of all wizard data.

#### Response

```json
{
  "data": {
    "wizard_id": "wizard_789",
    "user_info": {
      "first_name": "John",
      "last_name": "Smith",
      "title": "Attorney"
    },
    "firm_info": {
      "name": "Smith & Associates LLP",
      "size": "small",
      "attorney_count": 5
    },
    "completion_status": {
      "percentage": 100,
      "completed_steps": 7,
      "total_steps": 7,
      "is_complete": true
    },
    "configured_features": [
      "team_management",
      "billing_setup", 
      "calendar_integration",
      "email_integration"
    ]
  }
}
```

## 🔧 Wizard Templates

### 16. Get Wizard Templates

**GET** `/api/v1/auth/signup/wizard/templates`

Retrieves pre-configured wizard templates for different firm types.

#### Query Parameters

- `firm_size`: Filter templates by firm size
- `practice_area`: Filter by primary practice area

#### Response

```json
{
  "data": [
    {
      "id": "template_corp_small",
      "name": "Small Corporate Law Firm",
      "description": "Pre-configured setup for small firms focusing on corporate law",
      "firm_size": "small",
      "practice_areas": ["Corporate Law", "Business Law"],
      "included_features": [
        "client_management",
        "matter_tracking",
        "time_billing",
        "document_management"
      ],
      "estimated_setup_time": "15 minutes",
      "preview_data": {
        "practice_areas": ["Corporate Law", "M&A"],
        "default_rates": {"partner": 450, "associate": 275},
        "team_structure": "partnership"
      }
    }
  ]
}
```

### 17. Apply Wizard Template

**POST** `/api/v1/auth/signup/wizard/{wizard_id}/apply-template`

Applies a pre-configured template to the wizard session.

#### Request Body

```json
{
  "template_id": "template_corp_small",
  "override_existing": false,
  "customize_fields": {
    "firm_name": "Custom Firm Name",
    "primary_practice_area": "Custom Practice Area"
  }
}
```

## 🔒 Security & Validation

### Session Security

- **Session Expiration**: Wizard sessions expire after 7 days of inactivity
- **Step Validation**: Each step validates data integrity and business rules
- **Progress Protection**: Users cannot skip required steps or access future steps prematurely
- **Data Encryption**: Sensitive wizard data encrypted at rest
- **Audit Trail**: Complete log of wizard progression and data changes

### Rate Limiting

- **Wizard Operations**: 100 requests per hour per user
- **Step Saves**: 200 saves per hour per wizard session
- **Template Access**: 50 requests per hour per user

This comprehensive signup wizard API provides a flexible, user-friendly onboarding experience that adapts to different firm sizes and needs while ensuring data quality and security.