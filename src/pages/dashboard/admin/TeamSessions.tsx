import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/WorkingAuthContext';
import { sessionService } from '@/services/sessionService';
import { teamService } from '@/services/teamService';
import { UserSession, Organization, SessionFilter, TeamSessionsResponse } from '@/types/session';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { 
  SearchIcon, 
  RefreshCwIcon, 
  MonitorIcon,
  ShieldIcon,
  UserIcon,
  CalendarIcon,
  GlobeIcon,
  SmartphoneIcon,
  MonitorIcon as DesktopIcon,
  TabletIcon,
  XCircleIcon,
  AlertCircleIcon,
  CheckCircleIcon
} from 'lucide-react';
import { format, parseISO, formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

export default function TeamSessions(): JSX.Element {
  const { user } = useAuth();
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [selectedOrgId, setSelectedOrgId] = useState<string>('');
  const [sessions, setSessions] = useState<UserSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  
  // Filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [page, setPage] = useState(0);
  const limit = 20;

  // Load user organizations
  useEffect(() => {
    const loadOrganizations = async () => {
      if (!user) return;
      
      try {
        const orgs = await teamService.getUserOrganizations();
        setOrganizations(orgs);
        
        // Auto-select first organization where user is admin
        for (const org of orgs) {
          const userRole = await teamService.getUserRole(org.id);
          if (userRole === 'owner' || userRole === 'admin') {
            setSelectedOrgId(org.id);
            setIsAdmin(true);
            break;
          }
        }
      } catch (err) {
        console.error('Error loading organizations:', err);
        setError('Failed to load organizations');
      }
    };

    loadOrganizations();
  }, [user]);

  // Load team sessions
  const loadTeamSessions = useCallback(async () => {
    if (!selectedOrgId || !isAdmin) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const filter: SessionFilter = {
        organization_id: selectedOrgId,
        search_term: searchTerm || undefined,
        is_active: statusFilter === 'all' ? undefined : statusFilter === 'active',
        limit,
        offset: page * limit,
      };

      const response: TeamSessionsResponse = await sessionService.getTeamSessions(selectedOrgId, filter);
      
      if (page === 0) {
        setSessions(response.sessions);
      } else {
        setSessions(prev => [...prev, ...response.sessions]);
      }
    } catch (err) {
      console.error('Error loading team sessions:', err);
      setError('Failed to load team sessions. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [selectedOrgId, isAdmin, searchTerm, statusFilter, limit, page]);

  // Load sessions when filters change
  useEffect(() => {
    setPage(0);
    if (selectedOrgId && isAdmin) {
      loadTeamSessions();
    }
  }, [selectedOrgId, isAdmin, searchTerm, statusFilter]);

  // Load more on page change
  useEffect(() => {
    if (page > 0 && selectedOrgId && isAdmin) {
      loadTeamSessions();
    }
  }, [page, selectedOrgId, isAdmin, loadTeamSessions]);

  // Check admin status when organization changes
  useEffect(() => {
    const checkAdminStatus = async () => {
      if (!selectedOrgId) {
        setIsAdmin(false);
        return;
      }
      
      try {
        const adminStatus = await teamService.isOrganizationAdmin(selectedOrgId);
        setIsAdmin(adminStatus);
        
        if (!adminStatus) {
          setError('You do not have admin access to view team sessions for this organization.');
          setSessions([]);
        }
      } catch (err) {
        console.error('Error checking admin status:', err);
        setIsAdmin(false);
      }
    };

    checkAdminStatus();
  }, [selectedOrgId]);

  // Terminate session
  const handleTerminateSession = async (sessionId: string) => {
    if (!selectedOrgId) return;
    
    try {
      const success = await sessionService.terminateSession({
        session_id: sessionId,
        organization_id: selectedOrgId
      });
      
      if (success) {
        toast.success('Session terminated successfully');
        // Refresh sessions
        setPage(0);
        loadTeamSessions();
      } else {
        toast.error('Failed to terminate session');
      }
    } catch (err) {
      console.error('Error terminating session:', err);
      toast.error('Failed to terminate session');
    }
  };

  // Format date for display
  const formatSessionDate = (dateString: string) => {
    return format(parseISO(dateString), 'MMM d, yyyy at h:mm a');
  };

  // Get device icon
  const getDeviceIcon = (userAgent?: string) => {
    if (!userAgent) return <MonitorIcon className="h-4 w-4" />;
    
    if (/Mobile|Android|iPhone/i.test(userAgent)) {
      return <SmartphoneIcon className="h-4 w-4" />;
    } else if (/iPad|Tablet/i.test(userAgent)) {
      return <TabletIcon className="h-4 w-4" />;
    } else {
      return <DesktopIcon className="h-4 w-4" />;
    }
  };

  // Parse browser from user agent
  const getBrowser = (userAgent?: string) => {
    if (!userAgent) return 'Unknown';
    
    if (userAgent.includes('Chrome')) return 'Chrome';
    if (userAgent.includes('Firefox')) return 'Firefox';
    if (userAgent.includes('Safari')) return 'Safari';
    if (userAgent.includes('Edge')) return 'Edge';
    return 'Other';
  };

  const filteredSessions = sessions.filter(session => {
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      return session.user_email.toLowerCase().includes(term) ||
        session.user_name.toLowerCase().includes(term) ||
        session.ip_address?.toString().includes(term);
    }
    return true;
  });

  if (!user) {
    return (
      <div className="flex items-center justify-center h-96">
        <Card className="p-8 text-center">
          <AlertCircleIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-lg text-muted-foreground">Please log in to view team sessions.</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Team Sessions</h1>
          <p className="text-muted-foreground mt-1">
            Monitor and manage active user sessions for your team
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => loadTeamSessions()} variant="outline" size="sm" disabled={!isAdmin}>
            <RefreshCwIcon className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Organization Selector */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShieldIcon className="h-5 w-5" />
            Select Organization
          </CardTitle>
          <CardDescription>
            Choose an organization to view team member sessions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Select value={selectedOrgId} onValueChange={setSelectedOrgId}>
            <SelectTrigger className="w-full max-w-md">
              <SelectValue placeholder="Select an organization" />
            </SelectTrigger>
            <SelectContent>
              {organizations.map((org) => (
                <SelectItem key={org.id} value={org.id}>
                  {org.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Filters */}
      {selectedOrgId && isAdmin && (
        <Card>
          <CardHeader className="pb-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 relative">
                <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by user, email, or IP address..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={statusFilter} onValueChange={(value: 'all' | 'active' | 'inactive') => setStatusFilter(value)}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Sessions</SelectItem>
                  <SelectItem value="active">Active Only</SelectItem>
                  <SelectItem value="inactive">Inactive Only</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
        </Card>
      )}

      {/* Sessions Table */}
      {selectedOrgId && isAdmin && (
        <Card>
          <CardContent className="p-0">
            {loading && filteredSessions.length === 0 ? (
              <div className="flex items-center justify-center py-12">
                <RefreshCwIcon className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : error ? (
              <div className="text-center py-12">
                <AlertCircleIcon className="h-12 w-12 text-destructive mx-auto mb-4" />
                <p className="text-destructive">{error}</p>
              </div>
            ) : filteredSessions.length === 0 ? (
              <div className="text-center py-12">
                <MonitorIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-lg font-medium">No sessions found</p>
                <p className="text-muted-foreground">No active sessions match your current filters</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Device</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead>Last Activity</TableHead>
                      <TableHead>Session Start</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredSessions.map((session) => (
                      <TableRow key={session.session_id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                              <UserIcon className="w-4 h-4 text-primary" />
                            </div>
                            <div>
                              <p className="font-medium">{session.user_name}</p>
                              <p className="text-sm text-muted-foreground">{session.user_email}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={session.is_active ? "default" : "secondary"}>
                            {session.is_active ? (
                              <CheckCircleIcon className="w-3 h-3 mr-1" />
                            ) : (
                              <XCircleIcon className="w-3 h-3 mr-1" />
                            )}
                            {session.is_active ? 'Active' : 'Inactive'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {getDeviceIcon(session.user_agent)}
                            <span className="text-sm">{getBrowser(session.user_agent)}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <GlobeIcon className="w-4 h-4 text-muted-foreground" />
                            <span className="text-sm">{session.ip_address || 'Unknown'}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <CalendarIcon className="w-4 h-4 text-muted-foreground" />
                            <span className="text-sm">
                              {formatDistanceToNow(parseISO(session.updated_at), { addSuffix: true })}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm">
                            {formatSessionDate(session.created_at)}
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          {session.is_active && (
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="outline" size="sm" className="text-destructive hover:text-destructive">
                                  <XCircleIcon className="w-4 h-4 mr-1" />
                                  Terminate
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Terminate Session</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Are you sure you want to terminate this session for {session.user_name}? 
                                    They will be logged out immediately and will need to sign in again.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => handleTerminateSession(session.session_id)}
                                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                  >
                                    Terminate Session
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                
                {/* Load More */}
                {filteredSessions.length >= limit && filteredSessions.length % limit === 0 && (
                  <div className="p-4 text-center border-t">
                    <Button
                      variant="outline"
                      onClick={() => setPage(prev => prev + 1)}
                      disabled={loading}
                    >
                      {loading ? (
                        <>
                          <RefreshCwIcon className="h-4 w-4 mr-2 animate-spin" />
                          Loading...
                        </>
                      ) : (
                        'Load More'
                      )}
                    </Button>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* No Organization Selected */}
      {!selectedOrgId && (
        <Card>
          <CardContent className="text-center py-12">
            <ShieldIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-lg font-medium">Select an Organization</p>
            <p className="text-muted-foreground">Choose an organization above to view team member sessions</p>
          </CardContent>
        </Card>
      )}

      {/* Not Admin */}
      {selectedOrgId && !isAdmin && (
        <Card>
          <CardContent className="text-center py-12">
            <ShieldIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-lg font-medium">Admin Access Required</p>
            <p className="text-muted-foreground">You need admin privileges to view team member sessions</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}