# Ross AI UI Guide - Project Documentation for Claude

## 🎯 Project Overview

**Project Name**: Ross AI UI Guide  
**Type**: Legal Practice Management SaaS Application  
**Stack**: React + TypeScript + Supabase + Tailwind CSS + shadcn/ui  
**Primary User**: shivansh@trulyfreehome.com (and shivansh.mudgil@gmail.com)  
**Current State**: Advanced MVP with comprehensive features across all practice areas

## 🏗️ Architecture Overview

### Frontend Stack
- **Framework**: React 18 with TypeScript
- **Routing**: React Router v6
- **State Management**: React Context (AuthContext)
- **UI Components**: shadcn/ui (Radix UI based)
- **Styling**: Tailwind CSS with semantic color system
- **Forms**: React Hook Form with Zod validation
- **Phone Input**: Custom PhoneInput component with country codes

### Backend Stack
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth (email/password + Google/Apple OAuth)
- **File Storage**: Supabase Storage (for client photos, documents)
- **Real-time**: Supabase Realtime (partially implemented)
- **API**: Supabase auto-generated REST APIs + Mock Services
- **Data Fetching**: TanStack Query (React Query) for caching and synchronization

### Key Integrations
- **MCP Server**: Supabase MCP for database operations
- **Project Reference**: aiveyvvhlfiqhbaqazrr
- **Project URL**: https://aiveyvvhlfiqhbaqazrr.supabase.co

## 📁 Project Structure

```
ross-ai-ui-guide/
├── src/
│   ├── components/
│   │   ├── auth/              # Authentication components
│   │   ├── billing/           # Time tracking, billing, invoicing
│   │   ├── chat/              # AI Assistant chat interface
│   │   │   ├── legal/         # Legal-specific AI features
│   │   │   ├── media/         # File upload, voice recording
│   │   │   └── smart/         # Context-aware suggestions
│   │   ├── clients/           # Client management (COMPLETE)
│   │   │   └── detail/        # Enhanced client detail views
│   │   ├── communications/    # Email, messaging, unified inbox
│   │   ├── dashboard/         # Dashboard widgets & sidebar
│   │   ├── documents/         # Document management with AI
│   │   ├── landing/           # Landing page components
│   │   ├── matters/           # Matter management (UI ready)
│   │   ├── profile/           # User profile management
│   │   ├── tasks/             # Task management system
│   │   ├── ui/                # shadcn/ui components
│   │   └── wizard/            # Signup wizard flow
│   ├── contexts/              # React contexts (3 auth contexts)
│   ├── hooks/                 # Custom React hooks (13+ hooks)
│   ├── integrations/          # Supabase client setup
│   ├── lib/                   # Utility functions
│   ├── pages/dashboard/       # 25+ Dashboard pages
│   ├── services/              # 29 Service layer classes
│   ├── styles/                # Global styles
│   └── types/                 # 17 TypeScript type definitions
├── supabase/migrations/       # Database migrations
├── tests/                     # Comprehensive test suite
│   ├── components/            # Component tests
│   ├── database/              # Database tests
│   ├── e2e/                   # End-to-end tests
│   ├── edge-functions/        # Edge function tests
│   ├── monitoring/            # Data quality tests
│   ├── performance/           # Performance tests
│   └── visual/                # Visual regression tests
└── public/                    # Static assets
```

## 🔧 Development Workflow

### Development Server
- **Port**: 8080 (HTTP only, not HTTPS)
- **Start Command**: `npm run dev`
- **Clean Start**: `npm run dev:clean`
- **Force Refresh**: `npm run dev:force`

### Development Considerations
- **Make sure hot module reload is working after every edit**
- **Package Name**: Consider updating from "vite_react_shadcn_ts" to "ross-ai-ui-guide"

### Testing Commands
```bash
npm run test              # Run all tests
npm run test:unit         # Unit tests
npm run test:components   # Component tests
npm run test:database     # Database tests
npm run test:e2e          # End-to-end tests
npm run test:visual       # Visual regression tests
npm run test:coverage     # Coverage report
```

## 🚀 Key Features

### 1. **AI-Powered Legal Assistant**
- Full chat interface with conversation management
- Legal-specific features (citations, risk assessment, document analysis)
- Workflow automation and execution
- Voice recording and file upload capabilities
- Context-aware proactive suggestions

### 2. **Task Management System**
- Kanban board view
- Timeline visualization
- Advanced filtering and search
- Task statistics and analytics

### 3. **Enhanced Billing Features**
- Natural language time entry
- Floating timer widget
- Invoice generation
- Weekly heat map visualization
- Unsubmitted entries tracking

### 4. **Client Management Enhancements**
- Business intelligence dashboard
- Enhanced communication tracking
- Document management per client
- Billing history and analytics

### 5. **Session Tracking**
- Active session monitoring
- Session history
- IP address tracking
- JWT-based session identification

## 📚 Service Layer (29 Services)

### Authentication & User Management
- `authService.ts` - Core authentication
- `simpleAuthService.ts` - Simplified auth operations
- `supabaseAuthService.ts` - Supabase auth integration
- `supabaseUserService.ts` - User operations
- `userService.ts` - User profile management
- `userManagementService.ts` - Admin user management
- `sessionService.ts` - Session tracking

### Client Services
- `clientService.ts` - Client CRUD operations
- `clientBillingService.ts` - Client billing management
- `clientCommunicationService.ts` - Communication tracking
- `clientDocumentService.ts` - Client documents

### AI & Automation
- `aiAnalysisService.ts` - AI document analysis
- `claudeApiService.ts` - Claude API integration
- `conversationService.ts` - Chat conversations
- `workflowService.ts` - Workflow automation
- `intakeWorkflowService.ts` - Client intake flows

### Practice Management
- `matterService.ts` - Matter management
- `billingService.ts` - Billing operations
- `documentService.ts` - Document management
- `taskService.ts` - Task management
- `activityService.ts` - Activity logging

### Other Services
- `teamService.ts` - Team management
- `leadService.ts` - Lead tracking
- `templateService.ts` - Document templates
- `exportService.ts` - Data export
- `imageUploadService.ts` - Image handling
- `integrationsService.ts` - Third-party integrations
- `supabaseWizardService.ts` - Wizard data persistence
- `mockConversationsService.ts` - Development mock data

## 📝 Type Definitions (17 Types)

- `auth.ts` - Authentication types
- `client.ts` - Client data structures
- `matter.ts` - Matter/case types
- `billing.ts` - Billing and invoicing
- `document.ts` - Document management
- `chat.ts` - Chat and conversation types
- `task.ts` - Task management types
- `timeEntry.ts` - Time tracking types
- `workflow.ts` - Workflow automation
- `activity.ts` - Activity logging
- `session.ts` - Session tracking
- `lead.ts` - Lead management
- `legal.ts` - Legal-specific types
- `userManagement.ts` - User admin types
- `integrations.ts` - Integration configs
- `firmSize.ts` - Firm categorization
- `wizard.ts` - Signup wizard types

## 🧠 AI QA Considerations

### UI/UX Review Guidelines
- When looking at UI elements make sure you act as the best UI / UX QA and thoroughly.