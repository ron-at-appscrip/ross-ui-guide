import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Plus, X, Mail, Phone, UserCheck, UserX } from 'lucide-react';
import { Matter } from '@/types/matter';

interface TeamManagementModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (teamData: TeamUpdateData) => void;
  matter: Matter;
}

interface TeamMember {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: 'responsible_attorney' | 'originating_attorney' | 'staff' | 'paralegal' | 'assistant';
  avatar?: string;
  permissions: string[];
}

interface TeamUpdateData {
  responsibleAttorney: string;
  responsibleAttorneyId: string;
  originatingAttorney?: string;
  originatingAttorneyId?: string;
  responsibleStaff: string[];
  responsibleStaffIds: string[];
  teamMembers: TeamMember[];
}

// Mock available team members
const availableTeamMembers: TeamMember[] = [
  {
    id: '1',
    name: 'Sarah Johnson',
    email: 'sarah.johnson@firm.com',
    phone: '+1 (555) 123-0001',
    role: 'responsible_attorney',
    permissions: ['full_access', 'client_contact', 'billing']
  },
  {
    id: '2',
    name: 'Michael Rodriguez',
    email: 'michael.rodriguez@firm.com',
    phone: '+1 (555) 123-0002',
    role: 'responsible_attorney',
    permissions: ['full_access', 'client_contact', 'billing']
  },
  {
    id: '3',
    name: 'Emily Rodriguez',
    email: 'emily.rodriguez@firm.com',
    phone: '+1 (555) 123-0003',
    role: 'responsible_attorney',
    permissions: ['full_access', 'client_contact', 'billing']
  },
  {
    id: '4',
    name: 'David Wilson',
    email: 'david.wilson@firm.com',
    phone: '+1 (555) 123-0004',
    role: 'responsible_attorney',
    permissions: ['full_access', 'client_contact', 'billing']
  },
  {
    id: '5',
    name: 'Jennifer Adams',
    email: 'jennifer.adams@firm.com',
    phone: '+1 (555) 123-0005',
    role: 'staff',
    permissions: ['document_access', 'time_entry']
  },
  {
    id: '6',
    name: 'Robert Taylor',
    email: 'robert.taylor@firm.com',
    phone: '+1 (555) 123-0006',
    role: 'paralegal',
    permissions: ['document_access', 'client_contact', 'time_entry']
  },
  {
    id: '7',
    name: 'Lisa Chen',
    email: 'lisa.chen@firm.com',
    phone: '+1 (555) 123-0007',
    role: 'paralegal',
    permissions: ['document_access', 'client_contact', 'time_entry']
  },
  {
    id: '8',
    name: 'Maria Garcia',
    email: 'maria.garcia@firm.com',
    phone: '+1 (555) 123-0008',
    role: 'assistant',
    permissions: ['document_access', 'scheduling']
  }
];

const roleLabels = {
  responsible_attorney: 'Responsible Attorney',
  originating_attorney: 'Originating Attorney',
  staff: 'Staff',
  paralegal: 'Paralegal',
  assistant: 'Assistant'
};

const TeamManagementModal: React.FC<TeamManagementModalProps> = ({
  open,
  onClose,
  onSubmit,
  matter
}) => {
  const [responsibleAttorney, setResponsibleAttorney] = useState(matter.responsibleAttorneyId || '');
  const [originatingAttorney, setOriginatingAttorney] = useState(matter.originatingAttorneyId || '');
  const [selectedStaff, setSelectedStaff] = useState<string[]>(matter.responsibleStaffIds || []);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const responsibleAttorneyMember = availableTeamMembers.find(m => m.id === responsibleAttorney);
      const originatingAttorneyMember = originatingAttorney && originatingAttorney !== 'none' 
        ? availableTeamMembers.find(m => m.id === originatingAttorney) 
        : undefined;
      const staffMembers = availableTeamMembers.filter(m => selectedStaff.includes(m.id));

      const teamData: TeamUpdateData = {
        responsibleAttorney: responsibleAttorneyMember?.name || '',
        responsibleAttorneyId: responsibleAttorney,
        originatingAttorney: originatingAttorneyMember?.name,
        originatingAttorneyId: originatingAttorney && originatingAttorney !== 'none' ? originatingAttorney : undefined,
        responsibleStaff: staffMembers.map(m => m.name),
        responsibleStaffIds: selectedStaff,
        teamMembers: [
          ...(responsibleAttorneyMember ? [responsibleAttorneyMember] : []),
          ...(originatingAttorneyMember ? [originatingAttorneyMember] : []),
          ...staffMembers
        ]
      };

      await onSubmit(teamData);
      onClose();
    } catch (error) {
      console.error('Error updating team:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleStaffMember = (staffId: string) => {
    setSelectedStaff(prev => 
      prev.includes(staffId)
        ? prev.filter(id => id !== staffId)
        : [...prev, staffId]
    );
  };

  const attorneys = availableTeamMembers.filter(m => m.role === 'responsible_attorney');
  const staff = availableTeamMembers.filter(m => ['staff', 'paralegal', 'assistant'].includes(m.role));

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'responsible_attorney':
      case 'originating_attorney':
        return 'bg-blue-100 text-blue-800';
      case 'paralegal':
        return 'bg-green-100 text-green-800';
      case 'staff':
        return 'bg-purple-100 text-purple-800';
      case 'assistant':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Dialog open={open} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Users className="h-5 w-5" />
            <span>Manage Team</span>
          </DialogTitle>
          <DialogDescription>
            Assign team members and manage permissions for {matter.title}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Current Team Overview */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Current Team</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">Responsible Attorney</Label>
                  <p className="text-sm text-muted-foreground">{matter.responsibleAttorney}</p>
                </div>
                {matter.originatingAttorney && (
                  <div>
                    <Label className="text-sm font-medium">Originating Attorney</Label>
                    <p className="text-sm text-muted-foreground">{matter.originatingAttorney}</p>
                  </div>
                )}
              </div>
              
              {matter.responsibleStaff && matter.responsibleStaff.length > 0 && (
                <div>
                  <Label className="text-sm font-medium">Team Members</Label>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {matter.responsibleStaff.map((staff, index) => (
                      <Badge key={index} variant="secondary">
                        {staff}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Responsible Attorney Selection */}
          <div className="space-y-2">
            <Label>Responsible Attorney *</Label>
            <Select value={responsibleAttorney} onValueChange={setResponsibleAttorney}>
              <SelectTrigger>
                <SelectValue placeholder="Select responsible attorney" />
              </SelectTrigger>
              <SelectContent>
                {attorneys.map((attorney) => (
                  <SelectItem key={attorney.id} value={attorney.id}>
                    <div className="flex items-center space-x-2">
                      <Avatar className="h-6 w-6">
                        <AvatarImage src={attorney.avatar} />
                        <AvatarFallback className="text-xs">
                          {getInitials(attorney.name)}
                        </AvatarFallback>
                      </Avatar>
                      <span>{attorney.name}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Originating Attorney Selection */}
          <div className="space-y-2">
            <Label>Originating Attorney</Label>
            <Select value={originatingAttorney} onValueChange={setOriginatingAttorney}>
              <SelectTrigger>
                <SelectValue placeholder="Select originating attorney (optional)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None</SelectItem>
                {attorneys.map((attorney) => (
                  <SelectItem key={attorney.id} value={attorney.id}>
                    <div className="flex items-center space-x-2">
                      <Avatar className="h-6 w-6">
                        <AvatarImage src={attorney.avatar} />
                        <AvatarFallback className="text-xs">
                          {getInitials(attorney.name)}
                        </AvatarFallback>
                      </Avatar>
                      <span>{attorney.name}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Staff Selection */}
          <div className="space-y-3">
            <Label>Team Members</Label>
            <div className="grid gap-3">
              {staff.map((member) => (
                <Card 
                  key={member.id} 
                  className={`cursor-pointer transition-colors ${
                    selectedStaff.includes(member.id) 
                      ? 'border-primary bg-primary/5' 
                      : 'hover:bg-muted/50'
                  }`}
                  onClick={() => toggleStaffMember(member.id)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={member.avatar} />
                          <AvatarFallback>
                            {getInitials(member.name)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            <h4 className="font-medium">{member.name}</h4>
                            <Badge 
                              variant="secondary" 
                              className={getRoleBadgeColor(member.role)}
                            >
                              {roleLabels[member.role]}
                            </Badge>
                          </div>
                          <div className="flex items-center space-x-4 mt-1 text-sm text-muted-foreground">
                            <div className="flex items-center space-x-1">
                              <Mail className="h-3 w-3" />
                              <span>{member.email}</span>
                            </div>
                            {member.phone && (
                              <div className="flex items-center space-x-1">
                                <Phone className="h-3 w-3" />
                                <span>{member.phone}</span>
                              </div>
                            )}
                          </div>
                          <div className="flex flex-wrap gap-1 mt-2">
                            {member.permissions.map((permission) => (
                              <Badge key={permission} variant="outline" className="text-xs">
                                {permission.replace('_', ' ')}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center">
                        {selectedStaff.includes(member.id) ? (
                          <UserCheck className="h-5 w-5 text-primary" />
                        ) : (
                          <UserX className="h-5 w-5 text-muted-foreground" />
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Selected Team Summary */}
          {(responsibleAttorney || originatingAttorney || selectedStaff.length > 0) && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">New Team Assignment</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {responsibleAttorney && (
                  <div className="flex items-center space-x-2">
                    <Badge className="bg-blue-100 text-blue-800">Responsible Attorney</Badge>
                    <span>{attorneys.find(a => a.id === responsibleAttorney)?.name}</span>
                  </div>
                )}
                
                {originatingAttorney && originatingAttorney !== 'none' && (
                  <div className="flex items-center space-x-2">
                    <Badge className="bg-blue-100 text-blue-800">Originating Attorney</Badge>
                    <span>{attorneys.find(a => a.id === originatingAttorney)?.name}</span>
                  </div>
                )}
                
                {selectedStaff.length > 0 && (
                  <div>
                    <div className="flex items-center space-x-2 mb-2">
                      <Badge className="bg-green-100 text-green-800">Team Members</Badge>
                      <span className="text-sm text-muted-foreground">
                        ({selectedStaff.length} selected)
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {selectedStaff.map(staffId => {
                        const member = staff.find(s => s.id === staffId);
                        return member ? (
                          <Badge key={staffId} variant="secondary">
                            {member.name}
                          </Badge>
                        ) : null;
                      })}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={isSubmitting || !responsibleAttorney}
              className="min-w-[120px]"
            >
              {isSubmitting ? 'Updating...' : 'Update Team'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default TeamManagementModal;