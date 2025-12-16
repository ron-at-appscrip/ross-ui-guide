import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useToast } from '@/hooks/use-toast';
import { 
  Users, 
  Plus, 
  MoreHorizontal, 
  Shield, 
  Settings, 
  UserPlus,
  UserMinus,
  Edit,
  Trash2,
  FolderOpen,
  Briefcase,
  Building,
  Star,
  Eye,
  EyeOff,
  Lock,
  Unlock
} from 'lucide-react';
import { Team, User } from '@/types/userManagement';
import { userManagementService } from '@/services/userManagementService';
import { cn } from '@/lib/utils';

const Teams = () => {
  const [teams, setTeams] = useState<Team[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showMembersDialog, setShowMembersDialog] = useState(false);
  const [newTeam, setNewTeam] = useState({
    name: '',
    description: '',
    type: 'custom' as Team['type'],
    visibility: 'public' as 'public' | 'private',
    allowMemberInvites: true,
    requireApproval: false,
  });
  const { toast } = useToast();

  useEffect(() => {
    loadTeams();
    loadUsers();
  }, []);

  const loadTeams = () => {
    setTeams(userManagementService.getTeams());
  };

  const loadUsers = () => {
    setUsers(userManagementService.getUsers());
  };

  const handleCreateTeam = () => {
    const team = userManagementService.createTeam({
      name: newTeam.name,
      description: newTeam.description,
      type: newTeam.type,
      settings: {
        visibility: newTeam.visibility,
        allowMemberInvites: newTeam.allowMemberInvites,
        requireApproval: newTeam.requireApproval,
        defaultPermissions: [],
      },
    });

    toast({
      title: 'Team created',
      description: `${team.name} has been created successfully`,
    });

    setShowCreateDialog(false);
    setNewTeam({
      name: '',
      description: '',
      type: 'custom',
      visibility: 'public',
      allowMemberInvites: true,
      requireApproval: false,
    });
    loadTeams();
  };

  const handleUpdateTeam = () => {
    if (!selectedTeam) return;

    userManagementService.updateTeam(selectedTeam.id, selectedTeam);
    toast({
      title: 'Team updated',
      description: 'Team information has been updated successfully',
    });

    setShowEditDialog(false);
    setSelectedTeam(null);
    loadTeams();
  };

  const handleDeleteTeam = (teamId: string) => {
    if (window.confirm('Are you sure you want to delete this team?')) {
      userManagementService.deleteTeam(teamId);
      toast({
        title: 'Team deleted',
        description: 'The team has been deleted',
      });
      loadTeams();
    }
  };

  const handleAddMember = (teamId: string, userId: string) => {
    userManagementService.addTeamMember(teamId, userId);
    toast({
      title: 'Member added',
      description: 'Team member has been added successfully',
    });
    loadTeams();
    loadUsers();
  };

  const handleRemoveMember = (teamId: string, userId: string) => {
    userManagementService.removeTeamMember(teamId, userId);
    toast({
      title: 'Member removed',
      description: 'Team member has been removed',
    });
    loadTeams();
    loadUsers();
  };

  const getTeamIcon = (type: Team['type']) => {
    switch (type) {
      case 'department':
        return <Building className="h-5 w-5" />;
      case 'practice_group':
        return <Briefcase className="h-5 w-5" />;
      case 'project':
        return <FolderOpen className="h-5 w-5" />;
      default:
        return <Users className="h-5 w-5" />;
    }
  };

  const getTeamMembers = (team: Team): User[] => {
    return users.filter(user => team.memberIds.includes(user.id));
  };

  const getTeamLeader = (team: Team): User | undefined => {
    return users.find(user => user.id === team.leaderId);
  };

  const getAvailableUsers = (team: Team): User[] => {
    return users.filter(user => !team.memberIds.includes(user.id));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Teams</h1>
          <p className="text-muted-foreground mt-1">
            Organize your practice with teams and departments
          </p>
        </div>
        <Button onClick={() => setShowCreateDialog(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Create Team
        </Button>
      </div>

      {/* Teams Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {teams.map((team) => {
          const members = getTeamMembers(team);
          const leader = getTeamLeader(team);
          
          return (
            <Card key={team.id} className="relative overflow-hidden">
              <div className="absolute top-4 right-4">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Team Actions</DropdownMenuLabel>
                    <DropdownMenuItem onClick={() => {
                      setSelectedTeam(team);
                      setShowMembersDialog(true);
                    }}>
                      <Users className="h-4 w-4 mr-2" />
                      Manage Members
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => {
                      setSelectedTeam(team);
                      setShowEditDialog(true);
                    }}>
                      <Edit className="h-4 w-4 mr-2" />
                      Edit Team
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Settings className="h-4 w-4 mr-2" />
                      Team Settings
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem 
                      onClick={() => handleDeleteTeam(team.id)}
                      className="text-red-600"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete Team
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              <div className="p-6">
                <div className="flex items-start gap-4 mb-4">
                  <div className={cn(
                    "h-12 w-12 rounded-lg flex items-center justify-center",
                    team.type === 'department' && "bg-blue-100 text-blue-600",
                    team.type === 'practice_group' && "bg-purple-100 text-purple-600",
                    team.type === 'project' && "bg-green-100 text-green-600",
                    team.type === 'custom' && "bg-gray-100 text-gray-600"
                  )}>
                    {getTeamIcon(team.type)}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg">{team.name}</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      {team.description || 'No description'}
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Type</span>
                    <Badge variant="secondary" className="capitalize">
                      {team.type.replace('_', ' ')}
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Visibility</span>
                    <div className="flex items-center gap-1">
                      {team.settings.visibility === 'public' ? (
                        <>
                          <Eye className="h-3 w-3" />
                          <span>Public</span>
                        </>
                      ) : (
                        <>
                          <EyeOff className="h-3 w-3" />
                          <span>Private</span>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Members</span>
                    <span className="font-medium">{members.length}</span>
                  </div>

                  {leader && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Team Lead</span>
                      <div className="flex items-center gap-2">
                        <Avatar className="h-6 w-6">
                          <AvatarImage src={leader.avatar} />
                          <AvatarFallback>
                            {leader.fullName.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <span className="font-medium">{leader.fullName.split(' ')[0]}</span>
                      </div>
                    </div>
                  )}
                </div>

                <div className="mt-4 pt-4 border-t">
                  <div className="flex items-center -space-x-2">
                    {members.slice(0, 5).map((member) => (
                      <Avatar key={member.id} className="h-8 w-8 border-2 border-background">
                        <AvatarImage src={member.avatar} />
                        <AvatarFallback>
                          {member.fullName.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                    ))}
                    {members.length > 5 && (
                      <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center text-xs font-medium">
                        +{members.length - 5}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Create Team Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Team</DialogTitle>
            <DialogDescription>
              Create a team to organize your practice members
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Team Name</Label>
              <Input
                id="name"
                placeholder="e.g., Corporate Law Team"
                value={newTeam.name}
                onChange={(e) => setNewTeam({ ...newTeam, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Describe the team's purpose..."
                value={newTeam.description}
                onChange={(e) => setNewTeam({ ...newTeam, description: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="type">Team Type</Label>
              <Select 
                value={newTeam.type} 
                onValueChange={(value: Team['type']) => setNewTeam({ ...newTeam, type: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="department">Department</SelectItem>
                  <SelectItem value="practice_group">Practice Group</SelectItem>
                  <SelectItem value="project">Project Team</SelectItem>
                  <SelectItem value="custom">Custom</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Visibility</Label>
                  <p className="text-sm text-muted-foreground">
                    {newTeam.visibility === 'public' ? 'Anyone can see this team' : 'Only members can see this team'}
                  </p>
                </div>
                <Select 
                  value={newTeam.visibility} 
                  onValueChange={(value: 'public' | 'private') => setNewTeam({ ...newTeam, visibility: value })}
                >
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="public">Public</SelectItem>
                    <SelectItem value="private">Private</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Member Invites</Label>
                  <p className="text-sm text-muted-foreground">
                    Allow team members to invite others
                  </p>
                </div>
                <Switch
                  checked={newTeam.allowMemberInvites}
                  onCheckedChange={(checked) => setNewTeam({ ...newTeam, allowMemberInvites: checked })}
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Require Approval</Label>
                  <p className="text-sm text-muted-foreground">
                    New members need leader approval
                  </p>
                </div>
                <Switch
                  checked={newTeam.requireApproval}
                  onCheckedChange={(checked) => setNewTeam({ ...newTeam, requireApproval: checked })}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateTeam} disabled={!newTeam.name}>
              Create Team
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Manage Members Dialog */}
      <Dialog open={showMembersDialog} onOpenChange={setShowMembersDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Manage Team Members</DialogTitle>
            <DialogDescription>
              Add or remove members from {selectedTeam?.name}
            </DialogDescription>
          </DialogHeader>
          {selectedTeam && (
            <Tabs defaultValue="members" className="mt-4">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="members">Current Members</TabsTrigger>
                <TabsTrigger value="add">Add Members</TabsTrigger>
              </TabsList>
              
              <TabsContent value="members" className="space-y-4">
                <div className="space-y-2">
                  {getTeamMembers(selectedTeam).map((member) => (
                    <div key={member.id} className="flex items-center justify-between p-3 rounded-lg border">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={member.avatar} />
                          <AvatarFallback>
                            {member.fullName.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{member.fullName}</p>
                          <p className="text-sm text-muted-foreground">{member.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {member.id === selectedTeam.leaderId && (
                          <Badge variant="secondary">
                            <Star className="h-3 w-3 mr-1" />
                            Leader
                          </Badge>
                        )}
                        {member.id !== selectedTeam.leaderId && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveMember(selectedTeam.id, member.id)}
                          >
                            <UserMinus className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </TabsContent>
              
              <TabsContent value="add" className="space-y-4">
                <div className="space-y-2">
                  {getAvailableUsers(selectedTeam).map((user) => (
                    <div key={user.id} className="flex items-center justify-between p-3 rounded-lg border">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={user.avatar} />
                          <AvatarFallback>
                            {user.fullName.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{user.fullName}</p>
                          <p className="text-sm text-muted-foreground">{user.email}</p>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        onClick={() => handleAddMember(selectedTeam.id, user.id)}
                      >
                        <UserPlus className="h-4 w-4 mr-2" />
                        Add
                      </Button>
                    </div>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          )}
          <DialogFooter>
            <Button onClick={() => setShowMembersDialog(false)}>
              Done
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Teams;