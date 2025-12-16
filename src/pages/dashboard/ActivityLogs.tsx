import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/SimpleAuthContext';
import { activityService } from '@/services/activityService';
import { ActivityLogWithChanges, ActivityLogFilter, ActivityType, EntityType } from '@/types/activity';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { 
  CalendarIcon, 
  SearchIcon, 
  FilterIcon, 
  RefreshCwIcon, 
  DownloadIcon,
  Activity,
  Clock,
  User,
  FileText,
  Building2,
  Briefcase,
  LogIn,
  LogOut,
  UserPlus,
  Edit,
  Trash2,
  Eye,
  Shield,
  Mail,
  ChevronRight,
  AlertCircle
} from 'lucide-react';
import { format, parseISO, isToday, isYesterday, formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';

// Activity type configuration with icons and colors
const ActivityTypeConfig: Record<ActivityType, { icon: React.ElementType; color: string; bgColor: string }> = {
  CREATE: { icon: UserPlus, color: 'text-green-700', bgColor: 'bg-green-50' },
  UPDATE: { icon: Edit, color: 'text-blue-700', bgColor: 'bg-blue-50' },
  DELETE: { icon: Trash2, color: 'text-red-700', bgColor: 'bg-red-50' },
  VIEW: { icon: Eye, color: 'text-gray-700', bgColor: 'bg-gray-50' },
  LOGIN: { icon: LogIn, color: 'text-purple-700', bgColor: 'bg-purple-50' },
  LOGOUT: { icon: LogOut, color: 'text-purple-700', bgColor: 'bg-purple-50' },
  SIGNUP: { icon: UserPlus, color: 'text-indigo-700', bgColor: 'bg-indigo-50' },
  PROFILE_UPDATE: { icon: User, color: 'text-orange-700', bgColor: 'bg-orange-50' },
  PASSWORD_CHANGE: { icon: Shield, color: 'text-yellow-700', bgColor: 'bg-yellow-50' },
  EMAIL_VERIFICATION: { icon: Mail, color: 'text-teal-700', bgColor: 'bg-teal-50' },
};

// Entity type configuration with icons
const EntityTypeConfig: Record<EntityType, { icon: React.ElementType; label: string }> = {
  USER: { icon: User, label: 'User' },
  PROFILE: { icon: User, label: 'Profile' },
  CLIENT: { icon: Building2, label: 'Client' },
  MATTER: { icon: Briefcase, label: 'Matter' },
  DOCUMENT: { icon: FileText, label: 'Document' },
  WIZARD_DATA: { icon: Activity, label: 'Setup' },
};

export default function ActivityLogs(): JSX.Element {
  const { user } = useAuth();
  const [activityLogs, setActivityLogs] = useState<ActivityLogWithChanges[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTab, setSelectedTab] = useState<'all' | ActivityType | 'recent'>('recent');
  const [selectedEntityType, setSelectedEntityType] = useState<EntityType | 'all'>('all');
  const [dateRange, setDateRange] = useState<{ start?: Date; end?: Date }>({});
  const [showDateFilter, setShowDateFilter] = useState(false);
  const [page, setPage] = useState(0);
  const limit = 20;

  // Load activity logs
  const loadActivityLogs = useCallback(async () => {
    if (!user) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const filter: ActivityLogFilter = {
        search_term: searchTerm || undefined,
        activity_types: selectedTab !== 'all' && selectedTab !== 'recent' ? [selectedTab] : undefined,
        entity_types: selectedEntityType !== 'all' ? [selectedEntityType] : undefined,
        start_date: dateRange.start?.toISOString(),
        end_date: dateRange.end?.toISOString(),
        limit,
        offset: page * limit,
      };

      const logs = await activityService.getUserActivityLogs(user.id, filter);
      
      if (page === 0) {
        setActivityLogs(logs);
      } else {
        setActivityLogs(prev => [...prev, ...logs]);
      }
    } catch (err) {
      console.error('Error loading activity logs:', err);
      setError('Failed to load activity logs. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [user, searchTerm, selectedTab, selectedEntityType, dateRange, limit, page]);

  // Load logs on filter changes
  useEffect(() => {
    setPage(0);
    if (user) {
      loadActivityLogs();
    }
  }, [user, searchTerm, selectedTab, selectedEntityType, dateRange, loadActivityLogs]);

  // Load more on page change
  useEffect(() => {
    if (page > 0 && user) {
      loadActivityLogs();
    }
  }, [page, user, loadActivityLogs]);

  // Format date for display
  const formatActivityDate = (dateString: string) => {
    const date = parseISO(dateString);
    
    if (isToday(date)) {
      return `Today at ${format(date, 'h:mm a')}`;
    } else if (isYesterday(date)) {
      return `Yesterday at ${format(date, 'h:mm a')}`;
    } else {
      return format(date, 'MMM d, yyyy at h:mm a');
    }
  };

  // Format relative time
  const formatRelativeTime = (dateString: string) => {
    return formatDistanceToNow(parseISO(dateString), { addSuffix: true });
  };

  // Group activities by date
  const groupActivitiesByDate = (activities: ActivityLogWithChanges[]) => {
    const groups: Record<string, ActivityLogWithChanges[]> = {};
    
    activities.forEach(activity => {
      const date = format(parseISO(activity.created_at), 'yyyy-MM-dd');
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(activity);
    });
    
    return groups;
  };

  // Get filtered activities
  const filteredActivities = activityLogs.filter(log => {
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      return log.description.toLowerCase().includes(term) ||
        log.entity_name?.toLowerCase().includes(term);
    }
    return true;
  });

  // Export to CSV
  const exportToCSV = () => {
    const csvData = filteredActivities.map(log => ({
      Date: format(parseISO(log.created_at), 'yyyy-MM-dd HH:mm:ss'),
      'Activity Type': log.activity_type,
      'Entity Type': log.entity_type,
      'Entity Name': log.entity_name || '',
      Description: log.description,
      'Field Changes': log.changes?.map(c => `${c.field_name}: ${c.old_value} → ${c.new_value}`).join('; ') || '',
    }));

    const csv = [
      Object.keys(csvData[0] || {}).join(','),
      ...csvData.map(row => Object.values(row).map(val => `"${val}"`).join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `activity-logs-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const groupedActivities = groupActivitiesByDate(filteredActivities);
  const sortedDates = Object.keys(groupedActivities).sort((a, b) => b.localeCompare(a));

  if (!user) {
    return (
      <div className="flex items-center justify-center h-96">
        <Card className="p-8 text-center">
          <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-lg text-muted-foreground">Please log in to view activity logs.</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Activity Timeline</h1>
          <p className="text-muted-foreground mt-1">
            Track all your activities and system events
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={exportToCSV} variant="outline" size="sm">
            <DownloadIcon className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button onClick={() => loadActivityLogs()} variant="outline" size="sm">
            <RefreshCwIcon className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search activities..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              <Select value={selectedEntityType} onValueChange={(value: EntityType | 'all') => setSelectedEntityType(value)}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="All Entities" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Entities</SelectItem>
                  {Object.entries(EntityTypeConfig).map(([type, config]) => (
                    <SelectItem key={type} value={type}>
                      <div className="flex items-center gap-2">
                        <config.icon className="h-4 w-4" />
                        {config.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Popover open={showDateFilter} onOpenChange={setShowDateFilter}>
                <PopoverTrigger asChild>
                  <Button variant="outline" className={cn(
                    "justify-start text-left font-normal",
                    (dateRange.start || dateRange.end) && "text-primary"
                  )}>
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dateRange.start || dateRange.end ? (
                      <span>
                        {dateRange.start && format(dateRange.start, 'MMM d')}
                        {dateRange.start && dateRange.end && ' - '}
                        {dateRange.end && format(dateRange.end, 'MMM d')}
                      </span>
                    ) : (
                      'Date Range'
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="end">
                  <div className="p-4 space-y-4">
                    <div>
                      <p className="text-sm font-medium mb-2">From</p>
                      <Calendar
                        mode="single"
                        selected={dateRange.start}
                        onSelect={(date) => setDateRange(prev => ({ ...prev, start: date }))}
                        initialFocus
                      />
                    </div>
                    <Separator />
                    <div>
                      <p className="text-sm font-medium mb-2">To</p>
                      <Calendar
                        mode="single"
                        selected={dateRange.end}
                        onSelect={(date) => setDateRange(prev => ({ ...prev, end: date }))}
                      />
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => {
                          setDateRange({});
                          setShowDateFilter(false);
                        }}
                      >
                        Clear
                      </Button>
                      <Button 
                        size="sm"
                        onClick={() => setShowDateFilter(false)}
                      >
                        Apply
                      </Button>
                    </div>
                  </div>
                </PopoverContent>
              </Popover>
            </div>
          </div>
        </CardHeader>
        
        {/* Activity Type Tabs */}
        <CardContent className="pt-0">
          <Tabs value={selectedTab} onValueChange={(value) => setSelectedTab(value as typeof selectedTab)}>
            <TabsList className="grid grid-cols-4 lg:grid-cols-6 h-auto p-1">
              <TabsTrigger value="recent" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                <Clock className="h-4 w-4 mr-1" />
                Recent
              </TabsTrigger>
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="CREATE">Create</TabsTrigger>
              <TabsTrigger value="UPDATE">Update</TabsTrigger>
              <TabsTrigger value="DELETE">Delete</TabsTrigger>
              <TabsTrigger value="LOGIN">Access</TabsTrigger>
            </TabsList>
          </Tabs>
        </CardContent>
      </Card>

      {/* Activity Timeline */}
      <Card>
        <CardContent className="p-0">
          {loading && filteredActivities.length === 0 ? (
            <div className="flex items-center justify-center py-12">
              <RefreshCwIcon className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
              <p className="text-destructive">{error}</p>
            </div>
          ) : filteredActivities.length === 0 ? (
            <div className="text-center py-12">
              <Activity className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-lg font-medium">No activities found</p>
              <p className="text-muted-foreground">Try adjusting your filters or search terms</p>
            </div>
          ) : (
            <ScrollArea className="h-[600px]">
              <div className="p-6">
                {sortedDates.map((date, dateIndex) => {
                  const activities = groupedActivities[date];
                  const dateObj = parseISO(date);
                  const dateLabel = isToday(dateObj) ? 'Today' : 
                                   isYesterday(dateObj) ? 'Yesterday' : 
                                   format(dateObj, 'EEEE, MMMM d, yyyy');
                  
                  return (
                    <div key={date} className={cn("relative", dateIndex !== 0 && "mt-8")}>
                      {/* Date Header */}
                      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 pb-2">
                        <div className="flex items-center gap-4">
                          <div className="h-px flex-1 bg-border" />
                          <p className="text-sm font-medium text-muted-foreground px-2">
                            {dateLabel}
                          </p>
                          <div className="h-px flex-1 bg-border" />
                        </div>
                      </div>

                      {/* Activities for this date */}
                      <div className="mt-4 space-y-4">
                        {activities.map((activity, index) => {
                          const config = ActivityTypeConfig[activity.activity_type];
                          const entityConfig = EntityTypeConfig[activity.entity_type];
                          const Icon = config.icon;
                          const EntityIcon = entityConfig.icon;
                          
                          return (
                            <div key={activity.id} className="relative flex gap-4 group">
                              {/* Timeline Line */}
                              {index !== activities.length - 1 && (
                                <div className="absolute left-6 top-12 bottom-0 w-px bg-border" />
                              )}
                              
                              {/* Activity Icon */}
                              <div className={cn(
                                "flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center",
                                config.bgColor,
                                "ring-4 ring-background"
                              )}>
                                <Icon className={cn("h-5 w-5", config.color)} />
                              </div>
                              
                              {/* Activity Content */}
                              <div className="flex-1 bg-muted/30 rounded-lg p-4 group-hover:bg-muted/50 transition-colors">
                                <div className="flex items-start justify-between gap-4">
                                  <div className="flex-1 space-y-2">
                                    {/* Activity Description */}
                                    <p className="font-medium">{activity.description}</p>
                                    
                                    {/* Entity Info */}
                                    {activity.entity_name && (
                                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                        <EntityIcon className="h-4 w-4" />
                                        <span>{activity.entity_name}</span>
                                      </div>
                                    )}
                                    
                                    {/* Field Changes */}
                                    {activity.changes && activity.changes.length > 0 && (
                                      <div className="mt-3 space-y-1">
                                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Changes</p>
                                        <div className="space-y-1">
                                          {activity.changes.map((change, changeIndex) => (
                                            <div key={changeIndex} className="flex items-center gap-2 text-sm">
                                              <span className="text-muted-foreground">{change.field_name}:</span>
                                              <span className="text-red-600 line-through">
                                                {change.old_value ? JSON.stringify(change.old_value) : 'empty'}
                                              </span>
                                              <ChevronRight className="h-3 w-3 text-muted-foreground" />
                                              <span className="text-green-600 font-medium">
                                                {change.new_value ? JSON.stringify(change.new_value) : 'empty'}
                                              </span>
                                            </div>
                                          ))}
                                        </div>
                                      </div>
                                    )}
                                    
                                    {/* Metadata */}
                                    {activity.metadata && Object.keys(activity.metadata).length > 0 && (
                                      <div className="mt-2 flex flex-wrap gap-2">
                                        {Object.entries(activity.metadata).map(([key, value]) => (
                                          <Badge key={key} variant="secondary" className="text-xs">
                                            {key}: {String(value)}
                                          </Badge>
                                        ))}
                                      </div>
                                    )}
                                  </div>
                                  
                                  {/* Time */}
                                  <div className="text-sm text-muted-foreground whitespace-nowrap">
                                    {formatRelativeTime(activity.created_at)}
                                  </div>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
                
                {/* Load More */}
                {filteredActivities.length >= limit && filteredActivities.length % limit === 0 && (
                  <div className="mt-8 text-center">
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
            </ScrollArea>
          )}
        </CardContent>
      </Card>
    </div>
  );
}