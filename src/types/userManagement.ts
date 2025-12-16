export type UserStatus = 'active' | 'inactive' | 'pending' | 'suspended';
export type UserRole = 'owner' | 'admin' | 'attorney' | 'paralegal' | 'support' | 'client';
export type InviteStatus = 'pending' | 'accepted' | 'expired' | 'cancelled';

export interface User {
  id: string;
  email: string;
  fullName: string;
  avatar?: string;
  role: UserRole;
  status: UserStatus;
  department?: string;
  title?: string;
  phone?: string;
  timezone?: string;
  lastLogin?: string;
  createdAt: string;
  updatedAt: string;
  teamIds: string[];
  permissions: string[];
}

export interface Team {
  id: string;
  name: string;
  description?: string;
  type: 'department' | 'practice_group' | 'project' | 'custom';
  leaderId: string;
  memberIds: string[];
  permissions: string[];
  settings: TeamSettings;
  createdAt: string;
  updatedAt: string;
}

export interface TeamSettings {
  visibility: 'public' | 'private';
  allowMemberInvites: boolean;
  requireApproval: boolean;
  defaultPermissions: string[];
}

export interface Role {
  id: string;
  name: string;
  description: string;
  type: 'system' | 'custom';
  permissions: Permission[];
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Permission {
  id: string;
  resource: string;
  action: string;
  scope?: 'own' | 'team' | 'all';
  conditions?: Record<string, any>;
}

export interface UserInvite {
  id: string;
  email: string;
  role: UserRole;
  teamIds?: string[];
  invitedBy: string;
  status: InviteStatus;
  token: string;
  expiresAt: string;
  acceptedAt?: string;
  createdAt: string;
}

export interface TeamMember {
  userId: string;
  teamId: string;
  role: 'leader' | 'member';
  joinedAt: string;
  permissions?: string[];
}

export interface AuditLog {
  id: string;
  userId: string;
  action: string;
  resource: string;
  resourceId?: string;
  details?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
  timestamp: string;
}

// Permission definitions
export const PERMISSIONS = {
  // User management
  USER_VIEW: 'user:view',
  USER_CREATE: 'user:create',
  USER_EDIT: 'user:edit',
  USER_DELETE: 'user:delete',
  USER_INVITE: 'user:invite',
  USER_SUSPEND: 'user:suspend',
  
  // Team management
  TEAM_VIEW: 'team:view',
  TEAM_CREATE: 'team:create',
  TEAM_EDIT: 'team:edit',
  TEAM_DELETE: 'team:delete',
  TEAM_MANAGE_MEMBERS: 'team:manage_members',
  
  // Role management
  ROLE_VIEW: 'role:view',
  ROLE_CREATE: 'role:create',
  ROLE_EDIT: 'role:edit',
  ROLE_DELETE: 'role:delete',
  ROLE_ASSIGN: 'role:assign',
  
  // Client management
  CLIENT_VIEW: 'client:view',
  CLIENT_CREATE: 'client:create',
  CLIENT_EDIT: 'client:edit',
  CLIENT_DELETE: 'client:delete',
  
  // Matter management
  MATTER_VIEW: 'matter:view',
  MATTER_CREATE: 'matter:create',
  MATTER_EDIT: 'matter:edit',
  MATTER_DELETE: 'matter:delete',
  MATTER_ASSIGN: 'matter:assign',
  
  // Document management
  DOCUMENT_VIEW: 'document:view',
  DOCUMENT_CREATE: 'document:create',
  DOCUMENT_EDIT: 'document:edit',
  DOCUMENT_DELETE: 'document:delete',
  DOCUMENT_SHARE: 'document:share',
  
  // Billing
  BILLING_VIEW: 'billing:view',
  BILLING_CREATE: 'billing:create',
  BILLING_EDIT: 'billing:edit',
  BILLING_APPROVE: 'billing:approve',
  
  // Reports
  REPORTS_VIEW: 'reports:view',
  REPORTS_CREATE: 'reports:create',
  REPORTS_EXPORT: 'reports:export',
  
  // Settings
  SETTINGS_VIEW: 'settings:view',
  SETTINGS_EDIT: 'settings:edit',
  SETTINGS_BILLING: 'settings:billing',
  SETTINGS_SECURITY: 'settings:security',
} as const;

// Default role configurations
export const DEFAULT_ROLES: Partial<Role>[] = [
  {
    name: 'Owner',
    type: 'system',
    description: 'Full access to all features and settings',
    permissions: Object.values(PERMISSIONS).map(p => ({
      id: p,
      resource: p.split(':')[0],
      action: p.split(':')[1],
      scope: 'all'
    })),
    isDefault: false,
  },
  {
    name: 'Admin',
    type: 'system',
    description: 'Administrative access with user and team management',
    permissions: Object.values(PERMISSIONS).filter(p => 
      !p.includes('billing') && !p.includes('settings:security')
    ).map(p => ({
      id: p,
      resource: p.split(':')[0],
      action: p.split(':')[1],
      scope: 'all'
    })),
    isDefault: false,
  },
  {
    name: 'Attorney',
    type: 'system',
    description: 'Access to clients, matters, documents, and billing',
    permissions: [
      PERMISSIONS.CLIENT_VIEW,
      PERMISSIONS.CLIENT_CREATE,
      PERMISSIONS.CLIENT_EDIT,
      PERMISSIONS.MATTER_VIEW,
      PERMISSIONS.MATTER_CREATE,
      PERMISSIONS.MATTER_EDIT,
      PERMISSIONS.DOCUMENT_VIEW,
      PERMISSIONS.DOCUMENT_CREATE,
      PERMISSIONS.DOCUMENT_EDIT,
      PERMISSIONS.DOCUMENT_SHARE,
      PERMISSIONS.BILLING_VIEW,
      PERMISSIONS.BILLING_CREATE,
      PERMISSIONS.REPORTS_VIEW,
      PERMISSIONS.TEAM_VIEW,
    ].map(p => ({
      id: p,
      resource: p.split(':')[0],
      action: p.split(':')[1],
      scope: 'team'
    })),
    isDefault: true,
  },
  {
    name: 'Paralegal',
    type: 'system',
    description: 'Support role with document and matter access',
    permissions: [
      PERMISSIONS.CLIENT_VIEW,
      PERMISSIONS.MATTER_VIEW,
      PERMISSIONS.MATTER_EDIT,
      PERMISSIONS.DOCUMENT_VIEW,
      PERMISSIONS.DOCUMENT_CREATE,
      PERMISSIONS.DOCUMENT_EDIT,
      PERMISSIONS.TEAM_VIEW,
    ].map(p => ({
      id: p,
      resource: p.split(':')[0],
      action: p.split(':')[1],
      scope: 'team'
    })),
    isDefault: false,
  },
  {
    name: 'Support Staff',
    type: 'system',
    description: 'Basic access for administrative support',
    permissions: [
      PERMISSIONS.CLIENT_VIEW,
      PERMISSIONS.MATTER_VIEW,
      PERMISSIONS.DOCUMENT_VIEW,
      PERMISSIONS.TEAM_VIEW,
    ].map(p => ({
      id: p,
      resource: p.split(':')[0],
      action: p.split(':')[1],
      scope: 'team'
    })),
    isDefault: false,
  },
];