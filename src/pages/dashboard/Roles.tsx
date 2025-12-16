import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { 
  Shield, 
  Plus, 
  MoreHorizontal, 
  Edit, 
  Trash2,
  Copy,
  Lock,
  Users,
  FileText,
  Briefcase,
  Settings,
  DollarSign,
  BarChart3,
  Key,
  AlertTriangle
} from 'lucide-react';
import { Role, Permission, PERMISSIONS } from '@/types/userManagement';
import { userManagementService } from '@/services/userManagementService';
import { cn } from '@/lib/utils';

interface PermissionGroup {
  name: string;
  icon: React.ElementType;
  permissions: string[];
  description: string;
}

const PERMISSION_GROUPS: PermissionGroup[] = [
  {
    name: 'User Management',
    icon: Users,
    description: 'Manage users, invitations, and profiles',
    permissions: [
      PERMISSIONS.USER_VIEW,
      PERMISSIONS.USER_CREATE,
      PERMISSIONS.USER_EDIT,
      PERMISSIONS.USER_DELETE,
      PERMISSIONS.USER_INVITE,
      PERMISSIONS.USER_SUSPEND,
    ],
  },
  {
    name: 'Team Management',
    icon: Shield,
    description: 'Create and manage teams',
    permissions: [
      PERMISSIONS.TEAM_VIEW,
      PERMISSIONS.TEAM_CREATE,
      PERMISSIONS.TEAM_EDIT,
      PERMISSIONS.TEAM_DELETE,
      PERMISSIONS.TEAM_MANAGE_MEMBERS,
    ],
  },
  {
    name: 'Role Management',
    icon: Key,
    description: 'Manage roles and permissions',
    permissions: [
      PERMISSIONS.ROLE_VIEW,
      PERMISSIONS.ROLE_CREATE,
      PERMISSIONS.ROLE_EDIT,
      PERMISSIONS.ROLE_DELETE,
      PERMISSIONS.ROLE_ASSIGN,
    ],
  },
  {
    name: 'Client Management',
    icon: Users,
    description: 'Manage client relationships',
    permissions: [
      PERMISSIONS.CLIENT_VIEW,
      PERMISSIONS.CLIENT_CREATE,
      PERMISSIONS.CLIENT_EDIT,
      PERMISSIONS.CLIENT_DELETE,
    ],
  },
  {
    name: 'Matter Management',
    icon: Briefcase,
    description: 'Handle legal matters and cases',
    permissions: [
      PERMISSIONS.MATTER_VIEW,
      PERMISSIONS.MATTER_CREATE,
      PERMISSIONS.MATTER_EDIT,
      PERMISSIONS.MATTER_DELETE,
      PERMISSIONS.MATTER_ASSIGN,
    ],
  },
  {
    name: 'Document Management',
    icon: FileText,
    description: 'Access and manage documents',
    permissions: [
      PERMISSIONS.DOCUMENT_VIEW,
      PERMISSIONS.DOCUMENT_CREATE,
      PERMISSIONS.DOCUMENT_EDIT,
      PERMISSIONS.DOCUMENT_DELETE,
      PERMISSIONS.DOCUMENT_SHARE,
    ],
  },
  {
    name: 'Billing & Finance',
    icon: DollarSign,
    description: 'Manage billing and financial records',
    permissions: [
      PERMISSIONS.BILLING_VIEW,
      PERMISSIONS.BILLING_CREATE,
      PERMISSIONS.BILLING_EDIT,
      PERMISSIONS.BILLING_APPROVE,
    ],
  },
  {
    name: 'Reports & Analytics',
    icon: BarChart3,
    description: 'Access reports and analytics',
    permissions: [
      PERMISSIONS.REPORTS_VIEW,
      PERMISSIONS.REPORTS_CREATE,
      PERMISSIONS.REPORTS_EXPORT,
    ],
  },
  {
    name: 'System Settings',
    icon: Settings,
    description: 'Configure system settings',
    permissions: [
      PERMISSIONS.SETTINGS_VIEW,
      PERMISSIONS.SETTINGS_EDIT,
      PERMISSIONS.SETTINGS_BILLING,
      PERMISSIONS.SETTINGS_SECURITY,
    ],
  },
];

const Roles = () => {
  const [roles, setRoles] = useState<Role[]>([]);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [newRole, setNewRole] = useState({
    name: '',
    description: '',
    permissions: [] as string[],
  });
  const { toast } = useToast();

  useEffect(() => {
    loadRoles();
  }, []);

  const loadRoles = () => {
    setRoles(userManagementService.getRoles());
  };

  const handleCreateRole = () => {
    const role = userManagementService.createRole({
      name: newRole.name,
      description: newRole.description,
      permissions: newRole.permissions.map(p => ({
        id: p,
        resource: p.split(':')[0],
        action: p.split(':')[1],
        scope: 'team',
      })),
    });

    toast({
      title: 'Role created',
      description: `${role.name} role has been created successfully`,
    });

    setShowCreateDialog(false);
    setNewRole({ name: '', description: '', permissions: [] });
    loadRoles();
  };

  const handleUpdateRole = () => {
    if (!selectedRole) return;

    try {
      userManagementService.updateRole(selectedRole.id, {
        name: selectedRole.name,
        description: selectedRole.description,
        permissions: selectedRole.permissions,
      });

      toast({
        title: 'Role updated',
        description: 'Role has been updated successfully',
      });

      setShowEditDialog(false);
      setSelectedRole(null);
      loadRoles();
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to update role',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteRole = (roleId: string) => {
    try {
      const role = roles.find(r => r.id === roleId);
      
      if (window.confirm(`Are you sure you want to delete the "${role?.name}" role?`)) {
        userManagementService.deleteRole(roleId);
        toast({
          title: 'Role deleted',
          description: 'The role has been deleted',
        });
        loadRoles();
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to delete role',
        variant: 'destructive',
      });
    }
  };

  const handleCloneRole = (role: Role) => {
    setNewRole({
      name: `${role.name} (Copy)`,
      description: role.description,
      permissions: role.permissions.map(p => p.id),
    });
    setShowCreateDialog(true);
  };

  const togglePermission = (permissionId: string, isNew = false) => {
    if (isNew) {
      setNewRole(prev => ({
        ...prev,
        permissions: prev.permissions.includes(permissionId)
          ? prev.permissions.filter(p => p !== permissionId)
          : [...prev.permissions, permissionId]
      }));
    } else if (selectedRole) {
      const updatedPermissions = selectedRole.permissions.map(p => p.id).includes(permissionId)
        ? selectedRole.permissions.filter(p => p.id !== permissionId)
        : [...selectedRole.permissions, {
            id: permissionId,
            resource: permissionId.split(':')[0],
            action: permissionId.split(':')[1],
            scope: 'team' as const,
          }];

      setSelectedRole({
        ...selectedRole,
        permissions: updatedPermissions,
      });
    }
  };

  const togglePermissionGroup = (groupPermissions: string[], isNew = false) => {
    const currentPermissions = isNew ? newRole.permissions : (selectedRole?.permissions.map(p => p.id) || []);
    const hasAll = groupPermissions.every(p => currentPermissions.includes(p));

    if (hasAll) {
      // Remove all permissions from this group
      const filteredPermissions = currentPermissions.filter(p => !groupPermissions.includes(p));
      
      if (isNew) {
        setNewRole(prev => ({ ...prev, permissions: filteredPermissions }));
      } else if (selectedRole) {
        setSelectedRole({
          ...selectedRole,
          permissions: selectedRole.permissions.filter(p => !groupPermissions.includes(p.id)),
        });
      }
    } else {
      // Add all permissions from this group
      const newPermissions = [...new Set([...currentPermissions, ...groupPermissions])];
      
      if (isNew) {
        setNewRole(prev => ({ ...prev, permissions: newPermissions }));
      } else if (selectedRole) {
        const existingPermissionIds = selectedRole.permissions.map(p => p.id);
        const permissionsToAdd = groupPermissions
          .filter(p => !existingPermissionIds.includes(p))
          .map(p => ({
            id: p,
            resource: p.split(':')[0],
            action: p.split(':')[1],
            scope: 'team' as const,
          }));

        setSelectedRole({
          ...selectedRole,
          permissions: [...selectedRole.permissions, ...permissionsToAdd],
        });
      }
    }
  };

  const getRoleUsageCount = (roleId: string): number => {
    const users = userManagementService.getUsers();
    const role = roles.find(r => r.id === roleId);
    if (!role) return 0;
    
    return users.filter(u => u.role === role.name.toLowerCase().replace(' ', '_')).length;
  };

  const getPermissionDisplayName = (permissionId: string): string => {
    return permissionId.split(':').map(part => 
      part.charAt(0).toUpperCase() + part.slice(1).replace('_', ' ')
    ).join(' - ');
  };

  const PermissionSelector = ({ 
    permissions, 
    onToggle, 
    onToggleGroup, 
    isNew = false 
  }: { 
    permissions: string[], 
    onToggle: (id: string) => void,
    onToggleGroup: (groupPermissions: string[]) => void,
    isNew?: boolean 
  }) => (
    <div className="space-y-6">
      {PERMISSION_GROUPS.map((group) => {
        const hasAll = group.permissions.every(p => permissions.includes(p));
        const hasSome = group.permissions.some(p => permissions.includes(p));

        return (
          <div key={group.name} className="border rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 bg-muted rounded-lg flex items-center justify-center">
                  <group.icon className="h-4 w-4" />
                </div>
                <div>
                  <h4 className="font-medium">{group.name}</h4>
                  <p className="text-sm text-muted-foreground">{group.description}</p>
                </div>
              </div>
              <Checkbox
                checked={hasAll}
                ref={(el) => {
                  if (el) el.indeterminate = hasSome && !hasAll;
                }}
                onCheckedChange={() => onToggleGroup(group.permissions)}
              />
            </div>
            <div className="space-y-2 ml-11">
              {group.permissions.map((permission) => (
                <div key={permission} className="flex items-center justify-between">
                  <Label className="text-sm font-normal cursor-pointer">
                    {getPermissionDisplayName(permission)}
                  </Label>
                  <Checkbox
                    checked={permissions.includes(permission)}
                    onCheckedChange={() => onToggle(permission)}
                  />
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Roles & Permissions</h1>
          <p className="text-muted-foreground mt-1">
            Define roles and permissions for your team members
          </p>
        </div>
        <Button onClick={() => setShowCreateDialog(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Create Role
        </Button>
      </div>

      {/* Roles Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {roles.map((role) => {
          const usageCount = getRoleUsageCount(role.id);
          
          return (
            <Card key={role.id} className="relative overflow-hidden">
              <div className="absolute top-4 right-4">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Role Actions</DropdownMenuLabel>
                    <DropdownMenuItem onClick={() => {
                      setSelectedRole(role);
                      setShowEditDialog(true);
                    }}>
                      <Edit className="h-4 w-4 mr-2" />
                      Edit Role
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleCloneRole(role)}>
                      <Copy className="h-4 w-4 mr-2" />
                      Duplicate Role
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    {role.type === 'custom' && (
                      <DropdownMenuItem 
                        onClick={() => handleDeleteRole(role.id)}
                        className="text-red-600"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete Role
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              <div className="p-6">
                <div className="flex items-start gap-4 mb-4">
                  <div className={cn(
                    "h-12 w-12 rounded-lg flex items-center justify-center",
                    role.type === 'system' ? "bg-blue-100 text-blue-600" : "bg-purple-100 text-purple-600"
                  )}>
                    <Shield className="h-6 w-6" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-lg">{role.name}</h3>
                      {role.type === 'system' && (
                        <Badge variant="secondary" className="text-xs">
                          <Lock className="h-3 w-3 mr-1" />
                          System
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {role.description}
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Permissions</span>
                    <span className="font-medium">{role.permissions.length}</span>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Users</span>
                    <span className="font-medium">{usageCount}</span>
                  </div>

                  {role.isDefault && (
                    <div className="flex items-center gap-2 text-sm text-blue-600">
                      <AlertTriangle className="h-3 w-3" />
                      <span>Default role</span>
                    </div>
                  )}
                </div>

                <div className="mt-4 pt-4 border-t">
                  <div className="flex flex-wrap gap-1">
                    {PERMISSION_GROUPS.slice(0, 3).map((group) => {
                      const hasGroupPermissions = group.permissions.some(p => 
                        role.permissions.map(rp => rp.id).includes(p)
                      );
                      
                      return hasGroupPermissions && (
                        <Badge key={group.name} variant="outline" className="text-xs">
                          {group.name}
                        </Badge>
                      );
                    })}
                    {PERMISSION_GROUPS.filter((group) => 
                      group.permissions.some(p => role.permissions.map(rp => rp.id).includes(p))
                    ).length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{PERMISSION_GROUPS.filter((group) => 
                          group.permissions.some(p => role.permissions.map(rp => rp.id).includes(p))
                        ).length - 3} more
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Create Role Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-4xl h-[600px] flex flex-col">
          <DialogHeader>
            <DialogTitle>Create New Role</DialogTitle>
            <DialogDescription>
              Define a new role with specific permissions
            </DialogDescription>
          </DialogHeader>
          <div className="flex-1 overflow-hidden">
            <Tabs defaultValue="details" className="h-full flex flex-col">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="details">Role Details</TabsTrigger>
                <TabsTrigger value="permissions">Permissions</TabsTrigger>
              </TabsList>
              
              <TabsContent value="details" className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Role Name</Label>
                  <Input
                    id="name"
                    placeholder="e.g., Senior Associate"
                    value={newRole.name}
                    onChange={(e) => setNewRole({ ...newRole, name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Describe the role's responsibilities..."
                    value={newRole.description}
                    onChange={(e) => setNewRole({ ...newRole, description: e.target.value })}
                    rows={4}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Permissions Summary</Label>
                  <div className="p-3 bg-muted rounded-lg">
                    <p className="text-sm text-muted-foreground">
                      {newRole.permissions.length} permissions selected
                    </p>
                    {newRole.permissions.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {PERMISSION_GROUPS.map((group) => {
                          const hasGroupPermissions = group.permissions.some(p => newRole.permissions.includes(p));
                          return hasGroupPermissions && (
                            <Badge key={group.name} variant="outline" className="text-xs">
                              {group.name}
                            </Badge>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="permissions" className="flex-1 overflow-hidden">
                <ScrollArea className="h-full">
                  <PermissionSelector
                    permissions={newRole.permissions}
                    onToggle={(id) => togglePermission(id, true)}
                    onToggleGroup={(groupPermissions) => togglePermissionGroup(groupPermissions, true)}
                    isNew={true}
                  />
                </ScrollArea>
              </TabsContent>
            </Tabs>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateRole} disabled={!newRole.name}>
              Create Role
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Role Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-4xl h-[600px] flex flex-col">
          <DialogHeader>
            <DialogTitle>Edit Role</DialogTitle>
            <DialogDescription>
              Update role information and permissions
            </DialogDescription>
          </DialogHeader>
          {selectedRole && (
            <div className="flex-1 overflow-hidden">
              <Tabs defaultValue="details" className="h-full flex flex-col">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="details">Role Details</TabsTrigger>
                  <TabsTrigger value="permissions">Permissions</TabsTrigger>
                </TabsList>
                
                <TabsContent value="details" className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="editName">Role Name</Label>
                    <Input
                      id="editName"
                      value={selectedRole.name}
                      onChange={(e) => setSelectedRole({ ...selectedRole, name: e.target.value })}
                      disabled={selectedRole.type === 'system'}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="editDescription">Description</Label>
                    <Textarea
                      id="editDescription"
                      value={selectedRole.description}
                      onChange={(e) => setSelectedRole({ ...selectedRole, description: e.target.value })}
                      rows={4}
                      disabled={selectedRole.type === 'system'}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Current Assignments</Label>
                    <div className="p-3 bg-muted rounded-lg">
                      <p className="text-sm text-muted-foreground">
                        {getRoleUsageCount(selectedRole.id)} users have this role
                      </p>
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="permissions" className="flex-1 overflow-hidden">
                  <ScrollArea className="h-full">
                    <PermissionSelector
                      permissions={selectedRole.permissions.map(p => p.id)}
                      onToggle={(id) => togglePermission(id)}
                      onToggleGroup={(groupPermissions) => togglePermissionGroup(groupPermissions)}
                    />
                  </ScrollArea>
                </TabsContent>
              </Tabs>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditDialog(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleUpdateRole} 
              disabled={selectedRole?.type === 'system'}
            >
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Roles;