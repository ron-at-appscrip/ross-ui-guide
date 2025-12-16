# Ross AI UI Guide - Database Schema Documentation

## Overview

This document provides comprehensive documentation for all database tables in the Ross AI UI Guide application. The database uses PostgreSQL via Supabase with Row Level Security (RLS) enabled on all tables.

**Database**: PostgreSQL via Supabase  
**Project Reference**: aiveyvvhlfiqhbaqazrr  
**Schema**: public (application tables) + auth (Supabase managed)

---

## Table Index

1. [profiles](#profiles) - User profile information
2. [wizard_data](#wizard_data) - Signup wizard form data
3. [clients](#clients) - Client management 
4. [matters](#matters) - Legal matters/cases
5. [documents](#documents) - Document management
6. [activity_logs](#activity_logs) - User activity tracking
7. [entity_changes](#entity_changes) - Field-level change tracking
8. [organizations](#organizations) - Team/organization structure
9. [organization_members](#organization_members) - Team membership
10. [session_logs](#session_logs) - Session tracking
11. [session_events](#session_events) - Session event logging

---

## Tables

### profiles

**Purpose**: Stores user profile information with enhanced name handling  
**RLS Enabled**: ✅ Yes  
**Size**: 72 kB (6 live rows)

#### Schema

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | uuid | NOT NULL | - | Primary key, references auth.users(id) |
| `email` | text | NOT NULL | - | User email address |
| `full_name` | text | NOT NULL | - | Legacy full name field |
| `avatar_url` | text | NULL | - | URL to user avatar image |
| `created_at` | timestamptz | NULL | now() | Record creation timestamp |
| `updated_at` | timestamptz | NULL | now() | Record last update timestamp |
| `first_name` | text | NULL | - | User's first name |
| `last_name` | text | NULL | - | User's last name |
| `computed_full_name` | text | NULL | *computed* | Auto-computed full name from first/last names |
| `phone` | text | NULL | - | Phone number in E.164 format (validated) |

#### Constraints & Indexes
- **Primary Key**: `id`
- **Foreign Key**: `id` → `auth.users(id)`
- **Check Constraint**: `phone IS NULL OR is_valid_phone_number(phone)`
- **Generated Column**: `computed_full_name` combines first_name and last_name intelligently

#### Relationships
- **1:1** with `auth.users` (Supabase auth)
- **1:N** with `wizard_data` (user's wizard steps)
- **1:N** with `clients` (user's clients)
- **1:N** with all other user-owned entities

---

### wizard_data

**Purpose**: Stores multi-step signup wizard form data  
**RLS Enabled**: ✅ Yes  
**Size**: 80 kB (12 live rows)

#### Schema

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | uuid | NOT NULL | gen_random_uuid() | Primary key |
| `user_id` | uuid | NOT NULL | - | References auth.users(id) |
| `step_key` | text | NOT NULL | - | Step identifier (personalInfo, firmInfo, etc.) |
| `data` | jsonb | NOT NULL | - | Step form data as JSON |
| `created_at` | timestamptz | NULL | now() | Record creation timestamp |
| `updated_at` | timestamptz | NULL | now() | Record last update timestamp |

#### Constraints & Indexes
- **Primary Key**: `id`
- **Foreign Key**: `user_id` → `auth.users(id)`
- **Unique Constraint**: `(user_id, step_key)` - one record per user per step

#### Common step_key Values
- `personalInfo` - Personal information step
- `firmInfo` - Law firm information
- `practiceAreas` - Practice area selection
- `enterpriseInfo` - Enterprise-specific data

---

### clients

**Purpose**: Client management with comprehensive contact information  
**RLS Enabled**: ✅ Yes  
**Size**: 48 kB (1 live row)

#### Schema

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | uuid | NOT NULL | gen_random_uuid() | Primary key |
| `user_id` | uuid | NOT NULL | - | References auth.users(id) |
| `name` | text | NOT NULL | - | Client name (person or company) |
| `email` | text | NULL | - | Client email address |
| `phone` | text | NULL | - | Client phone number |
| `address` | text | NULL | - | Street address |
| `city` | text | NULL | - | City |
| `state` | text | NULL | - | State/Province |
| `zip_code` | text | NULL | - | ZIP/Postal code |
| `country` | text | NULL | 'United States' | Country |
| `client_type` | text | NULL | 'individual' | Type: individual or company |
| `company_name` | text | NULL | - | Company name (if applicable) |
| `industry` | text | NULL | - | Industry/business type |
| `notes` | text | NULL | - | Additional notes |
| `is_active` | boolean | NULL | true | Active status |
| `created_at` | timestamptz | NULL | now() | Record creation timestamp |
| `updated_at` | timestamptz | NULL | now() | Record last update timestamp |
| `profile_photo_url` | text | NULL | - | URL to client photo in Supabase Storage |

#### Constraints & Indexes
- **Primary Key**: `id`
- **Foreign Key**: `user_id` → `auth.users(id)`

#### Relationships
- **N:1** with `profiles` (belongs to user)
- **1:N** with `matters` (client can have multiple matters)
- **1:N** with `documents` (client can have multiple documents)

---

### matters

**Purpose**: Legal matters/cases with billing and tracking information  
**RLS Enabled**: ✅ Yes  
**Size**: 40 kB (0 live rows)

#### Schema

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | uuid | NOT NULL | gen_random_uuid() | Primary key |
| `user_id` | uuid | NOT NULL | - | References auth.users(id) |
| `client_id` | uuid | NOT NULL | - | References clients(id) |
| `matter_number` | text | NOT NULL | - | Unique matter identifier |
| `title` | text | NOT NULL | - | Matter title/description |
| `description` | text | NULL | - | Detailed description |
| `practice_area` | text | NOT NULL | - | Practice area category |
| `status` | text | NULL | 'open' | Matter status |
| `priority` | text | NULL | 'medium' | Priority level |
| `estimated_hours` | numeric | NULL | - | Estimated hours for completion |
| `hourly_rate` | numeric | NULL | - | Hourly billing rate |
| `total_billed` | numeric | NULL | 0.00 | Total amount billed |
| `date_opened` | date | NULL | CURRENT_DATE | Date matter was opened |
| `date_closed` | date | NULL | - | Date matter was closed |
| `assigned_attorney` | text | NULL | - | Assigned attorney name |
| `notes` | text | NULL | - | Internal notes |
| `is_active` | boolean | NULL | true | Active status |
| `created_at` | timestamptz | NULL | now() | Record creation timestamp |
| `updated_at` | timestamptz | NULL | now() | Record last update timestamp |

#### Constraints & Indexes
- **Primary Key**: `id`
- **Foreign Key**: `user_id` → `auth.users(id)`
- **Foreign Key**: `client_id` → `clients(id)`

#### Relationships
- **N:1** with `clients` (belongs to client)
- **N:1** with `profiles` (belongs to user)
- **1:N** with `documents` (matter can have multiple documents)

---

### documents

**Purpose**: Document management with file storage and versioning  
**RLS Enabled**: ✅ Yes  
**Size**: 32 kB (0 live rows)

#### Schema

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | uuid | NOT NULL | gen_random_uuid() | Primary key |
| `user_id` | uuid | NOT NULL | - | References auth.users(id) |
| `client_id` | uuid | NULL | - | References clients(id) |
| `matter_id` | uuid | NULL | - | References matters(id) |
| `filename` | text | NOT NULL | - | Stored filename |
| `original_filename` | text | NOT NULL | - | Original uploaded filename |
| `file_path` | text | NOT NULL | - | Path in Supabase Storage |
| `file_size` | bigint | NOT NULL | - | File size in bytes |
| `mime_type` | text | NOT NULL | - | MIME type |
| `document_type` | text | NULL | - | Document category |
| `description` | text | NULL | - | Document description |
| `tags` | text[] | NULL | - | Array of tags |
| `is_confidential` | boolean | NULL | false | Confidentiality flag |
| `version_number` | integer | NULL | 1 | Version number |
| `parent_document_id` | uuid | NULL | - | Parent document for versioning |
| `created_at` | timestamptz | NULL | now() | Record creation timestamp |
| `updated_at` | timestamptz | NULL | now() | Record last update timestamp |

#### Constraints & Indexes
- **Primary Key**: `id`
- **Foreign Key**: `user_id` → `auth.users(id)`
- **Foreign Key**: `client_id` → `clients(id)`
- **Foreign Key**: `matter_id` → `matters(id)`
- **Foreign Key**: `parent_document_id` → `documents(id)` (self-reference)

#### Relationships
- **N:1** with `profiles` (belongs to user)
- **N:1** with `clients` (optionally belongs to client)
- **N:1** with `matters` (optionally belongs to matter)
- **N:1** with `documents` (parent document for versions)

---

### activity_logs

**Purpose**: Comprehensive user activity tracking with metadata  
**RLS Enabled**: ✅ Yes  
**Size**: 96 kB (34 live rows)

#### Schema

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | uuid | NOT NULL | gen_random_uuid() | Primary key |
| `user_id` | uuid | NOT NULL | - | References auth.users(id) |
| `activity_type` | activity_type | NOT NULL | - | Type of activity (enum) |
| `entity_type` | entity_type | NOT NULL | - | Type of entity affected (enum) |
| `entity_id` | uuid | NULL | - | ID of affected entity |
| `entity_name` | text | NULL | - | Name/title of affected entity |
| `description` | text | NOT NULL | - | Human-readable description |
| `metadata` | jsonb | NULL | - | Additional activity metadata |
| `ip_address` | inet | NULL | - | IP address of user |
| `user_agent` | text | NULL | - | User agent string |
| `session_id` | text | NULL | - | Session identifier |
| `created_at` | timestamptz | NULL | now() | Activity timestamp |

#### Enums

**activity_type**: CREATE, UPDATE, DELETE, VIEW, LOGIN, LOGOUT, SIGNUP, PROFILE_UPDATE, PASSWORD_CHANGE, EMAIL_VERIFICATION

**entity_type**: USER, PROFILE, CLIENT, MATTER, DOCUMENT, WIZARD_DATA

#### Constraints & Indexes
- **Primary Key**: `id`
- **Foreign Key**: `user_id` → `auth.users(id)`

#### Relationships
- **N:1** with `profiles` (belongs to user)
- **1:N** with `entity_changes` (activity can have multiple field changes)

---

### entity_changes

**Purpose**: Field-level change tracking for audit trails  
**RLS Enabled**: ✅ Yes  
**Size**: 32 kB (13 live rows)

#### Schema

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | uuid | NOT NULL | gen_random_uuid() | Primary key |
| `activity_log_id` | uuid | NOT NULL | - | References activity_logs(id) |
| `field_name` | text | NOT NULL | - | Name of changed field |
| `old_value` | jsonb | NULL | - | Previous value (JSON) |
| `new_value` | jsonb | NULL | - | New value (JSON) |
| `created_at` | timestamptz | NULL | now() | Change timestamp |

#### Constraints & Indexes
- **Primary Key**: `id`
- **Foreign Key**: `activity_log_id` → `activity_logs(id)`

#### Relationships
- **N:1** with `activity_logs` (belongs to activity log)

---

### organizations

**Purpose**: Team/organization structure for multi-user environments  
**RLS Enabled**: ✅ Yes  
**Size**: 32 kB (0 live rows)

#### Schema

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | uuid | NOT NULL | gen_random_uuid() | Primary key |
| `name` | text | NOT NULL | - | Organization name |
| `slug` | text | NOT NULL | - | URL-friendly identifier |
| `description` | text | NULL | - | Organization description |
| `logo_url` | text | NULL | - | URL to organization logo |
| `settings` | jsonb | NULL | '{}' | Organization settings |
| `created_at` | timestamptz | NULL | now() | Record creation timestamp |
| `updated_at` | timestamptz | NULL | now() | Record last update timestamp |

#### Constraints & Indexes
- **Primary Key**: `id`
- **Unique**: `slug`

#### Relationships
- **1:N** with `organization_members` (organization has multiple members)
- **1:N** with `session_logs` (organization sessions)

---

### organization_members

**Purpose**: Team membership with roles and invitation tracking  
**RLS Enabled**: ✅ Yes  
**Size**: 40 kB (0 live rows)

#### Schema

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | uuid | NOT NULL | gen_random_uuid() | Primary key |
| `organization_id` | uuid | NOT NULL | - | References organizations(id) |
| `user_id` | uuid | NOT NULL | - | References auth.users(id) |
| `role` | organization_role | NOT NULL | 'member' | Member role (enum) |
| `invited_by` | uuid | NULL | - | References auth.users(id) |
| `invited_at` | timestamptz | NULL | now() | Invitation timestamp |
| `joined_at` | timestamptz | NULL | - | Join timestamp |
| `is_active` | boolean | NOT NULL | true | Active membership status |
| `created_at` | timestamptz | NULL | now() | Record creation timestamp |
| `updated_at` | timestamptz | NULL | now() | Record last update timestamp |

#### Enums

**organization_role**: owner, admin, member

#### Constraints & Indexes
- **Primary Key**: `id`
- **Foreign Key**: `organization_id` → `organizations(id)`
- **Foreign Key**: `user_id` → `auth.users(id)`
- **Foreign Key**: `invited_by` → `auth.users(id)`

#### Relationships
- **N:1** with `organizations` (belongs to organization)
- **N:1** with `profiles` (belongs to user)
- **N:1** with `profiles` (invited by user)

---

### session_logs

**Purpose**: Detailed session tracking with device and location info  
**RLS Enabled**: ✅ Yes  
**Size**: 112 kB (3 live rows)

#### Schema

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | uuid | NOT NULL | gen_random_uuid() | Primary key |
| `session_id` | uuid | NOT NULL | - | Session identifier |
| `user_id` | uuid | NOT NULL | - | References auth.users(id) |
| `organization_id` | uuid | NULL | - | References organizations(id) |
| `event_type` | text | NOT NULL | - | Type of session event |
| `ip_address` | inet | NULL | - | IP address |
| `user_agent` | text | NULL | - | User agent string |
| `device_info` | jsonb | NULL | '{}' | Device information |
| `location_info` | jsonb | NULL | '{}' | Location information |
| `metadata` | jsonb | NULL | '{}' | Additional metadata |
| `created_at` | timestamptz | NULL | now() | Event timestamp |

#### Constraints & Indexes
- **Primary Key**: `id`
- **Foreign Key**: `user_id` → `auth.users(id)`
- **Foreign Key**: `organization_id` → `organizations(id)`

#### Relationships
- **N:1** with `profiles` (belongs to user)
- **N:1** with `organizations` (belongs to organization)

---

### session_events

**Purpose**: Immutable session event log for analytics  
**RLS Enabled**: ✅ Yes  
**Size**: 64 kB (0 live rows)

#### Schema

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | uuid | NOT NULL | gen_random_uuid() | Primary key |
| `user_id` | uuid | NOT NULL | - | References auth.users(id) |
| `session_id` | uuid | NOT NULL | - | Session identifier |
| `event_type` | text | NOT NULL | - | Event type (started, ended, expired, refreshed) |
| `created_at` | timestamptz | NOT NULL | now() | Event timestamp |
| `metadata` | jsonb | NOT NULL | '{}' | Event metadata |
| `ip_address` | inet | NULL | - | IP address |
| `user_agent` | text | NULL | - | User agent string |

#### Constraints & Indexes
- **Primary Key**: `id`
- **Foreign Key**: `user_id` → `auth.users(id)`
- **Check Constraint**: `event_type IN ('started', 'ended', 'expired', 'refreshed')`

#### Relationships
- **N:1** with `profiles` (belongs to user)

---

## Database Relationships Overview

```
auth.users (Supabase)
    ├── profiles (1:1)
    ├── wizard_data (1:N)
    ├── clients (1:N)
    │   ├── matters (1:N)
    │   └── documents (1:N)
    ├── matters (1:N)
    │   └── documents (1:N)
    ├── documents (1:N)
    ├── activity_logs (1:N)
    │   └── entity_changes (1:N)
    ├── organization_members (1:N)
    ├── session_logs (1:N)
    └── session_events (1:N)

organizations
    ├── organization_members (1:N)
    └── session_logs (1:N)

documents
    └── documents (1:N) [parent_document_id for versioning]
```

## Security Notes

- **Row Level Security (RLS)** is enabled on all tables
- All user data is isolated by `user_id` foreign key constraints
- Phone numbers are validated using `is_valid_phone_number()` function
- Session tracking includes IP address and user agent for security
- Activity logs provide comprehensive audit trails

## Migration History

Recent migrations have added:
- Phone number validation and E.164 format support
- Enhanced name handling with first/last name fields
- Comprehensive activity logging system
- Session tracking infrastructure
- Organization/team management structure

---

*Last Updated: 2025-01-01*  
*Database Version: Latest*  
*Generated from Supabase Project: aiveyvvhlfiqhbaqazrr*