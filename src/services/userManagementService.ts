import { User, Team, Role, UserInvite, TeamMember, AuditLog, UserStatus, UserRole, DEFAULT_ROLES, PERMISSIONS } from '@/types/userManagement';

class UserManagementService {
  private users: User[] = [];
  private teams: Team[] = [];
  private roles: Role[] = [];
  private invites: UserInvite[] = [];
  private auditLogs: AuditLog[] = [];
  private currentUserId: string = 'current-user-id';

  constructor() {
    this.initializeMockData();
  }

  private initializeMockData() {
    // Initialize default roles
    this.roles = DEFAULT_ROLES.map((role, index) => ({
      id: `role-${index + 1}`,
      name: role.name!,
      description: role.description!,
      type: role.type!,
      permissions: role.permissions!,
      isDefault: role.isDefault!,
      createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    }));

    // Initialize mock users
    this.users = [
      {
        id: 'user-1',
        email: 'john.smith@lawfirm.com',
        fullName: 'John Smith',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=John',
        role: 'owner',
        status: 'active',
        department: 'Corporate Law',
        title: 'Managing Partner',
        phone: '+1 (555) 123-4567',
        timezone: 'America/New_York',
        lastLogin: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        createdAt: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        teamIds: ['team-1', 'team-2'],
        permissions: Object.values(PERMISSIONS),
      },
      {
        id: 'user-2',
        email: 'sarah.johnson@lawfirm.com',
        fullName: 'Sarah Johnson',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah',
        role: 'admin',
        status: 'active',
        department: 'Operations',
        title: 'Office Administrator',
        phone: '+1 (555) 234-5678',
        timezone: 'America/New_York',
        lastLogin: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        createdAt: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
        teamIds: ['team-2'],
        permissions: this.roles.find(r => r.name === 'Admin')?.permissions.map(p => p.id) || [],
      },
      {
        id: 'user-3',
        email: 'michael.chen@lawfirm.com',
        fullName: 'Michael Chen',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Michael',
        role: 'attorney',
        status: 'active',
        department: 'Litigation',
        title: 'Senior Associate',
        phone: '+1 (555) 345-6789',
        timezone: 'America/Los_Angeles',
        lastLogin: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
        createdAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        teamIds: ['team-1', 'team-3'],
        permissions: this.roles.find(r => r.name === 'Attorney')?.permissions.map(p => p.id) || [],
      },
      {
        id: 'user-4',
        email: 'emily.davis@lawfirm.com',
        fullName: 'Emily Davis',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Emily',
        role: 'paralegal',
        status: 'active',
        department: 'Corporate Law',
        title: 'Senior Paralegal',
        phone: '+1 (555) 456-7890',
        timezone: 'America/Chicago',
        lastLogin: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
        createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        teamIds: ['team-1'],
        permissions: this.roles.find(r => r.name === 'Paralegal')?.permissions.map(p => p.id) || [],
      },
      {
        id: 'user-5',
        email: 'robert.wilson@lawfirm.com',
        fullName: 'Robert Wilson',
        role: 'attorney',
        status: 'inactive',
        department: 'Tax Law',
        title: 'Associate',
        lastLogin: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        createdAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        teamIds: [],
        permissions: [],
      },
    ];

    // Initialize mock teams
    this.teams = [
      {
        id: 'team-1',
        name: 'Corporate Law Team',
        description: 'Handles all corporate law matters including M&A, securities, and governance',
        type: 'practice_group',
        leaderId: 'user-1',
        memberIds: ['user-1', 'user-3', 'user-4'],
        permissions: [PERMISSIONS.CLIENT_VIEW, PERMISSIONS.MATTER_VIEW, PERMISSIONS.DOCUMENT_VIEW],
        settings: {
          visibility: 'public',
          allowMemberInvites: true,
          requireApproval: true,
          defaultPermissions: [],
        },
        createdAt: new Date(Date.now() - 200 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: 'team-2',
        name: 'Admin Team',
        description: 'Administrative and operational staff',
        type: 'department',
        leaderId: 'user-2',
        memberIds: ['user-1', 'user-2'],
        permissions: Object.values(PERMISSIONS),
        settings: {
          visibility: 'private',
          allowMemberInvites: false,
          requireApproval: true,
          defaultPermissions: [],
        },
        createdAt: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: 'team-3',
        name: 'Litigation Support',
        description: 'Support team for litigation matters',
        type: 'project',
        leaderId: 'user-3',
        memberIds: ['user-3'],
        permissions: [PERMISSIONS.MATTER_VIEW, PERMISSIONS.DOCUMENT_VIEW, PERMISSIONS.DOCUMENT_CREATE],
        settings: {
          visibility: 'public',
          allowMemberInvites: true,
          requireApproval: false,
          defaultPermissions: [PERMISSIONS.DOCUMENT_VIEW],
        },
        createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      },
    ];

    // Initialize mock invites
    this.invites = [
      {
        id: 'invite-1',
        email: 'jane.doe@email.com',
        role: 'attorney',
        teamIds: ['team-1'],
        invitedBy: 'user-1',
        status: 'pending',
        token: 'mock-token-1',
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      },
    ];
  }

  // User Management
  getUsers(filters?: { status?: UserStatus; role?: UserRole; teamId?: string }): User[] {
    let filteredUsers = [...this.users];

    if (filters?.status) {
      filteredUsers = filteredUsers.filter(u => u.status === filters.status);
    }
    if (filters?.role) {
      filteredUsers = filteredUsers.filter(u => u.role === filters.role);
    }
    if (filters?.teamId) {
      filteredUsers = filteredUsers.filter(u => u.teamIds.includes(filters.teamId));
    }

    return filteredUsers;
  }

  getUserById(userId: string): User | null {
    return this.users.find(u => u.id === userId) || null;
  }

  createUser(userData: Partial<User>): User {
    const newUser: User = {
      id: `user-${Date.now()}`,
      email: userData.email!,
      fullName: userData.fullName!,
      avatar: userData.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${userData.fullName}`,
      role: userData.role || 'attorney',
      status: 'pending',
      teamIds: userData.teamIds || [],
      permissions: this.roles.find(r => r.name === 'Attorney')?.permissions.map(p => p.id) || [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ...userData,
    };

    this.users.push(newUser);
    this.logAction('user:create', 'user', newUser.id, { email: newUser.email });
    return newUser;
  }

  updateUser(userId: string, updates: Partial<User>): User | null {
    const userIndex = this.users.findIndex(u => u.id === userId);
    if (userIndex === -1) return null;

    this.users[userIndex] = {
      ...this.users[userIndex],
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    this.logAction('user:edit', 'user', userId, updates);
    return this.users[userIndex];
  }

  deleteUser(userId: string): boolean {
    const userIndex = this.users.findIndex(u => u.id === userId);
    if (userIndex === -1) return false;

    this.users.splice(userIndex, 1);
    this.logAction('user:delete', 'user', userId);
    return true;
  }

  suspendUser(userId: string): User | null {
    return this.updateUser(userId, { status: 'suspended' });
  }

  // Team Management
  getTeams(): Team[] {
    return [...this.teams];
  }

  getTeamById(teamId: string): Team | null {
    return this.teams.find(t => t.id === teamId) || null;
  }

  createTeam(teamData: Partial<Team>): Team {
    const newTeam: Team = {
      id: `team-${Date.now()}`,
      name: teamData.name!,
      description: teamData.description,
      type: teamData.type || 'custom',
      leaderId: teamData.leaderId || this.currentUserId,
      memberIds: teamData.memberIds || [this.currentUserId],
      permissions: teamData.permissions || [],
      settings: teamData.settings || {
        visibility: 'public',
        allowMemberInvites: true,
        requireApproval: false,
        defaultPermissions: [],
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.teams.push(newTeam);
    this.logAction('team:create', 'team', newTeam.id, { name: newTeam.name });
    return newTeam;
  }

  updateTeam(teamId: string, updates: Partial<Team>): Team | null {
    const teamIndex = this.teams.findIndex(t => t.id === teamId);
    if (teamIndex === -1) return null;

    this.teams[teamIndex] = {
      ...this.teams[teamIndex],
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    this.logAction('team:edit', 'team', teamId, updates);
    return this.teams[teamIndex];
  }

  deleteTeam(teamId: string): boolean {
    const teamIndex = this.teams.findIndex(t => t.id === teamId);
    if (teamIndex === -1) return false;

    this.teams.splice(teamIndex, 1);
    this.logAction('team:delete', 'team', teamId);
    return true;
  }

  addTeamMember(teamId: string, userId: string): boolean {
    const team = this.getTeamById(teamId);
    const user = this.getUserById(userId);
    
    if (!team || !user) return false;
    
    if (!team.memberIds.includes(userId)) {
      team.memberIds.push(userId);
      this.updateTeam(teamId, { memberIds: team.memberIds });
    }
    
    if (!user.teamIds.includes(teamId)) {
      user.teamIds.push(teamId);
      this.updateUser(userId, { teamIds: user.teamIds });
    }
    
    this.logAction('team:manage_members', 'team', teamId, { action: 'add', userId });
    return true;
  }

  removeTeamMember(teamId: string, userId: string): boolean {
    const team = this.getTeamById(teamId);
    const user = this.getUserById(userId);
    
    if (!team || !user) return false;
    
    team.memberIds = team.memberIds.filter(id => id !== userId);
    this.updateTeam(teamId, { memberIds: team.memberIds });
    
    user.teamIds = user.teamIds.filter(id => id !== teamId);
    this.updateUser(userId, { teamIds: user.teamIds });
    
    this.logAction('team:manage_members', 'team', teamId, { action: 'remove', userId });
    return true;
  }

  // Role Management
  getRoles(): Role[] {
    return [...this.roles];
  }

  getRoleById(roleId: string): Role | null {
    return this.roles.find(r => r.id === roleId) || null;
  }

  createRole(roleData: Partial<Role>): Role {
    const newRole: Role = {
      id: `role-${Date.now()}`,
      name: roleData.name!,
      description: roleData.description!,
      type: 'custom',
      permissions: roleData.permissions || [],
      isDefault: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.roles.push(newRole);
    this.logAction('role:create', 'role', newRole.id, { name: newRole.name });
    return newRole;
  }

  updateRole(roleId: string, updates: Partial<Role>): Role | null {
    const roleIndex = this.roles.findIndex(r => r.id === roleId);
    if (roleIndex === -1) return null;

    // Prevent editing system roles
    if (this.roles[roleIndex].type === 'system') {
      throw new Error('System roles cannot be modified');
    }

    this.roles[roleIndex] = {
      ...this.roles[roleIndex],
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    this.logAction('role:edit', 'role', roleId, updates);
    return this.roles[roleIndex];
  }

  deleteRole(roleId: string): boolean {
    const roleIndex = this.roles.findIndex(r => r.id === roleId);
    if (roleIndex === -1) return false;

    // Prevent deleting system roles
    if (this.roles[roleIndex].type === 'system') {
      throw new Error('System roles cannot be deleted');
    }

    this.roles.splice(roleIndex, 1);
    this.logAction('role:delete', 'role', roleId);
    return true;
  }

  // User Invites
  getInvites(): UserInvite[] {
    return [...this.invites];
  }

  createInvite(inviteData: Partial<UserInvite>): UserInvite {
    const newInvite: UserInvite = {
      id: `invite-${Date.now()}`,
      email: inviteData.email!,
      role: inviteData.role || 'attorney',
      teamIds: inviteData.teamIds,
      invitedBy: this.currentUserId,
      status: 'pending',
      token: `token-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      createdAt: new Date().toISOString(),
    };

    this.invites.push(newInvite);
    this.logAction('user:invite', 'invite', newInvite.id, { email: newInvite.email });
    
    // In a real app, send invitation email here
    console.log(`Invitation sent to ${newInvite.email}`);
    
    return newInvite;
  }

  cancelInvite(inviteId: string): boolean {
    const inviteIndex = this.invites.findIndex(i => i.id === inviteId);
    if (inviteIndex === -1) return false;

    this.invites[inviteIndex].status = 'cancelled';
    this.logAction('user:invite', 'invite', inviteId, { action: 'cancel' });
    return true;
  }

  // Audit Logs
  getAuditLogs(filters?: { userId?: string; resource?: string; startDate?: Date; endDate?: Date }): AuditLog[] {
    let filteredLogs = [...this.auditLogs];

    if (filters?.userId) {
      filteredLogs = filteredLogs.filter(log => log.userId === filters.userId);
    }
    if (filters?.resource) {
      filteredLogs = filteredLogs.filter(log => log.resource === filters.resource);
    }
    if (filters?.startDate) {
      filteredLogs = filteredLogs.filter(log => new Date(log.timestamp) >= filters.startDate);
    }
    if (filters?.endDate) {
      filteredLogs = filteredLogs.filter(log => new Date(log.timestamp) <= filters.endDate);
    }

    return filteredLogs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }

  private logAction(action: string, resource: string, resourceId?: string, details?: any) {
    const log: AuditLog = {
      id: `log-${Date.now()}`,
      userId: this.currentUserId,
      action,
      resource,
      resourceId,
      details,
      timestamp: new Date().toISOString(),
    };

    this.auditLogs.push(log);
  }

  // Permission checking
  hasPermission(userId: string, permission: string): boolean {
    const user = this.getUserById(userId);
    if (!user) return false;

    return user.permissions.includes(permission);
  }

  getUserPermissions(userId: string): string[] {
    const user = this.getUserById(userId);
    if (!user) return [];

    // Get base permissions from user role
    const rolePermissions = user.permissions;

    // Get additional permissions from teams
    const teamPermissions: string[] = [];
    user.teamIds.forEach(teamId => {
      const team = this.getTeamById(teamId);
      if (team) {
        teamPermissions.push(...team.permissions);
      }
    });

    // Combine and deduplicate
    return [...new Set([...rolePermissions, ...teamPermissions])];
  }
}

export const userManagementService = new UserManagementService();