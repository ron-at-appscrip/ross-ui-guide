# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

**Development:**
```bash
npm run dev        # Start development server on http://localhost:5173
npm run build      # Production build
npm run build:dev  # Development build
npm run preview    # Preview production build
npm run lint       # Run ESLint
```

## Architecture Overview

This is a React + TypeScript legal practice management application built with Vite and using Supabase as the backend.

### Core Stack
- **React 18** with TypeScript
- **Vite** for bundling and development
- **React Router v6** for navigation
- **Supabase** for authentication, database, and real-time features
- **React Query** for server state management
- **shadcn/ui** component library
- **Tailwind CSS** for styling
- **React Hook Form + Zod** for form handling and validation

### Project Structure

The application follows a feature-based organization:

```
src/
├── components/       # UI components organized by feature
│   ├── auth/        # Authentication components
│   ├── billing/     # Time tracking and billing
│   ├── clients/     # Client management
│   ├── matters/     # Legal matter management
│   ├── documents/   # Document management
│   ├── communications/ # Email and messaging
│   ├── dashboard/   # Dashboard layout and navigation
│   ├── landing/     # Public landing page
│   ├── profile/     # User profile management
│   ├── wizard/      # Multi-step signup wizard
│   └── ui/          # shadcn/ui base components
├── contexts/        # React contexts (Auth, SignupFlow)
├── hooks/           # Custom React hooks
├── integrations/    # External service integrations
│   └── supabase/    # Supabase client and types
├── pages/           # Route components
├── services/        # Business logic and API calls
└── types/           # TypeScript type definitions
```

### Key Architectural Patterns

1. **Authentication Flow**
   - Dual state management: Supabase session + user profile
   - Protected routes wrap all dashboard pages
   - OAuth support (Google, Apple)
   - Email verification required

2. **Service Layer Pattern**
   - All Supabase operations go through service files
   - Services: `supabaseAuthService`, `supabaseUserService`, `supabaseWizardService`
   - Keeps components clean and testable

3. **Database Schema**
   - `profiles` table extends Supabase auth.users
   - `wizard_data` table persists signup wizard state
   - Row Level Security (RLS) policies ensure data isolation
   - Automatic profile creation via database trigger

4. **Routing Structure**
   - Public routes: `/`, `/login`, `/signup`, `/signup-wizard`
   - Protected routes: All under `/dashboard/*`
   - Nested routing for feature modules
   - Detail views: `/dashboard/clients/:id`, `/dashboard/matters/:id`
   - Profile management: `/dashboard/profile`

5. **State Management**
   - React Query for server state (caching, synchronization)
   - Context API for auth and wizard flow
   - Local component state for UI interactions
   - No global state management library

6. **Component Patterns**
   - Compound components for complex UI (e.g., sidebar)
   - Controlled components with React Hook Form
   - Glass morphism effect with `hover-glass` class
   - Consistent use of shadcn/ui variants

### Important Conventions

1. **File Naming**
   - Components: PascalCase (e.g., `ClientsTable.tsx`)
   - Hooks: camelCase with 'use' prefix (e.g., `useAuthOperations.ts`)
   - Services: camelCase (e.g., `supabaseAuthService.ts`)
   - Types: camelCase for files, PascalCase for interfaces

2. **Imports**
   - Use `@/` prefix for absolute imports from src/
   - Group imports: external deps, internal deps, types
   - Import types separately with `type` keyword

3. **Component Structure**
   - Props interface defined above component
   - Hooks at the top of component
   - Early returns for loading/error states
   - Render logic at the bottom

4. **Form Handling**
   - Always use React Hook Form with Zod schemas
   - Define schemas in the component file
   - Use `formState.errors` for validation display

5. **Styling**
   - Tailwind utilities preferred over custom CSS
   - Use `cn()` helper for conditional classes
   - CSS variables defined in `src/styles/variables.css`
   - Responsive design with Tailwind breakpoints

### Supabase Integration

**Environment Variables Required:**
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

**Key Operations:**
- Authentication state synced via `onAuthStateChange`
- Profile data loaded separately after auth
- Wizard data persisted across sessions
- All operations use Row Level Security

**Database Tables:**
- `profiles`: User profile information
- `wizard_data`: Signup wizard progress (JSON data per step)

### Development Workflow

1. **Adding New Features**
   - Create feature folder under `components/`
   - Add types to `types/` directory
   - Create service functions if needed
   - Add route to `pages/Dashboard.tsx`

2. **Working with Forms**
   - Define Zod schema first
   - Use `useForm` with zodResolver
   - Handle submission in service layer
   - Show errors with form state

3. **Adding Protected Routes**
   - Add route in `App.tsx` under dashboard routes
   - Component automatically protected by layout
   - Access user via `useAuth()` hook

4. **Modifying Database**
   - Create new migration in `supabase/migrations/`
   - Update TypeScript types in `integrations/supabase/types.ts`
   - Add RLS policies for new tables
   - Update service layer as needed