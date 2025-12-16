import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { 
  Clock, 
  User, 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  Edit3, 
  MessageSquare,
  Filter,
  Search,
  MoreVertical,
  Calendar,
  DollarSign,
  Users,
  TrendingUp,
  AlertCircle
} from 'lucide-react';
import { TimeEntry, ReviewWorkflow } from '@/types/billing';
import { BillingService } from '@/services/billingService';
import { cn } from '@/lib/utils';

interface ReviewSubmitTabProps {
  className?: string;
}

interface KanbanColumn {
  id: string;
  title: string;
  status: TimeEntry['status'];
  color: string;
  icon: React.ReactNode;
}

const KANBAN_COLUMNS: KanbanColumn[] = [
  {
    id: 'draft',
    title: 'Draft',
    status: 'draft',
    color: 'bg-gray-100 border-gray-200',
    icon: <Edit3 className="h-4 w-4" />
  },
  {
    id: 'submitted',
    title: 'Under Review',
    status: 'submitted',
    color: 'bg-blue-50 border-blue-200',
    icon: <AlertTriangle className="h-4 w-4" />
  },
  {
    id: 'approved',
    title: 'Approved',
    status: 'billed',
    color: 'bg-green-50 border-green-200',
    icon: <CheckCircle className="h-4 w-4" />
  },
  {
    id: 'rejected',
    title: 'Rejected',
    status: 'draft',
    color: 'bg-red-50 border-red-200',
    icon: <XCircle className="h-4 w-4" />
  }
];

const APPROVAL_HIERARCHY = [
  { level: 'Junior', role: 'Associate', canApprove: false, canReview: true },
  { level: 'Senior', role: 'Senior Associate', canApprove: true, canReview: true },
  { level: 'Partner', role: 'Partner', canApprove: true, canReview: true }
];

const ReviewSubmitTab: React.FC<ReviewSubmitTabProps> = ({ className }) => {
  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>([]);
  const [reviewWorkflows, setReviewWorkflows] = useState<ReviewWorkflow[]>([]);
  const [selectedEntries, setSelectedEntries] = useState<string[]>([]);
  const [filters, setFilters] = useState({
    client: 'all',
    matter: 'all',
    reviewer: 'all',
    dateRange: { start: '', end: '' }
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [selectedEntryForReview, setSelectedEntryForReview] = useState<TimeEntry | null>(null);
  const [reviewComment, setReviewComment] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [entries, workflows] = await Promise.all([
        BillingService.getTimeEntriesForReview(),
        BillingService.getReviewWorkflows()
      ]);
      setTimeEntries(entries);
      setReviewWorkflows(workflows);
    } catch (error) {
      console.error('Error loading review data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredEntries = useMemo(() => {
    return timeEntries.filter(entry => {
      const matchesSearch = entry.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           entry.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           entry.matterTitle.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesClient = filters.client === 'all' || entry.clientId === filters.client;
      const matchesMatter = filters.matter === 'all' || entry.matterId === filters.matter;
      
      return matchesSearch && matchesClient && matchesMatter;
    });
  }, [timeEntries, searchTerm, filters]);

  const entriesByStatus = useMemo(() => {
    const grouped: Record<string, TimeEntry[]> = {};
    KANBAN_COLUMNS.forEach(col => {
      grouped[col.id] = filteredEntries.filter(entry => {
        if (col.id === 'rejected') {
          return reviewWorkflows.some(wf => 
            wf.timeEntryId === entry.id && wf.status === 'rejected'
          );
        }
        return entry.status === col.status;
      });
    });
    return grouped;
  }, [filteredEntries, reviewWorkflows]);

  const handleBulkAction = async (action: 'approve' | 'reject' | 'submit') => {
    if (selectedEntries.length === 0) return;

    try {
      if (action === 'submit') {
        await BillingService.submitTimeEntries(selectedEntries);
      } else {
        // Handle bulk approve/reject
        for (const entryId of selectedEntries) {
          const workflow: Omit<ReviewWorkflow, 'id' | 'createdAt'> = {
            timeEntryId: entryId,
            reviewerId: 'current-user',
            reviewerName: 'Current User',
            status: action === 'approve' ? 'approved' : 'rejected',
            comments: `Bulk ${action} action`
          };
          await BillingService.createReviewWorkflow(workflow);
        }
      }
      
      setSelectedEntries([]);
      await loadData();
    } catch (error) {
      console.error(`Error performing bulk ${action}:`, error);
    }
  };

  const handleReview = async (entry: TimeEntry, status: 'approved' | 'rejected') => {
    try {
      const workflow: Omit<ReviewWorkflow, 'id' | 'createdAt'> = {
        timeEntryId: entry.id,
        reviewerId: 'current-user',
        reviewerName: 'Current User',
        status,
        comments: reviewComment
      };
      
      await BillingService.createReviewWorkflow(workflow);
      setShowReviewModal(false);
      setSelectedEntryForReview(null);
      setReviewComment('');
      await loadData();
    } catch (error) {
      console.error('Error creating review workflow:', error);
    }
  };

  const getValidationIssues = (entry: TimeEntry) => {
    const issues: string[] = [];
    
    // Check for overlapping time entries
    const overlapping = timeEntries.filter(e => 
      e.id !== entry.id && 
      e.matterId === entry.matterId &&
      e.date === entry.date &&
      e.startTime && e.endTime &&
      entry.startTime && entry.endTime &&
      ((e.startTime <= entry.startTime && e.endTime > entry.startTime) ||
       (e.startTime < entry.endTime && e.endTime >= entry.endTime))
    );
    
    if (overlapping.length > 0) {
      issues.push('Overlapping time entries detected');
    }
    
    // Check for rate inconsistencies
    const matterEntries = timeEntries.filter(e => e.matterId === entry.matterId);
    const avgRate = matterEntries.reduce((sum, e) => sum + e.rate, 0) / matterEntries.length;
    if (Math.abs(entry.rate - avgRate) / avgRate > 0.2) {
      issues.push('Rate variance exceeds 20%');
    }
    
    return issues;
  };

  const TimeEntryCard: React.FC<{ entry: TimeEntry }> = ({ entry }) => {
    const validationIssues = getValidationIssues(entry);
    const workflow = reviewWorkflows.find(wf => wf.timeEntryId === entry.id);
    const isSelected = selectedEntries.includes(entry.id);

    return (
      <Card 
        className={cn(
          "mb-3 cursor-pointer transition-all hover:shadow-md",
          isSelected && "ring-2 ring-primary",
          validationIssues.length > 0 && "border-orange-200 bg-orange-50"
        )}
        onClick={() => setSelectedEntries(prev => 
          prev.includes(entry.id) 
            ? prev.filter(id => id !== entry.id)
            : [...prev, entry.id]
        )}
      >
        <CardContent className="p-4">
          <div className="flex items-start justify-between mb-2">
            <div className="flex-1">
              <h4 className="font-medium text-sm line-clamp-2">{entry.description}</h4>
              <p className="text-xs text-muted-foreground mt-1">{entry.clientName}</p>
              <p className="text-xs text-muted-foreground">{entry.matterTitle}</p>
            </div>
            <Checkbox 
              checked={isSelected}
              onChange={() => {}}
              className="ml-2"
            />
          </div>
          
          <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
            <div className="flex items-center">
              <Clock className="h-3 w-3 mr-1" />
              {entry.hours}h @ ${entry.rate}
            </div>
            <div className="font-medium">${entry.amount}</div>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center text-xs">
              <Calendar className="h-3 w-3 mr-1" />
              {new Date(entry.date).toLocaleDateString()}
            </div>
            {workflow && (
              <Badge variant={workflow.status === 'approved' ? 'default' : 'destructive'}>
                {workflow.reviewerName}
              </Badge>
            )}
          </div>
          
          {validationIssues.length > 0 && (
            <div className="mt-2 p-2 bg-orange-100 rounded text-xs">
              <AlertCircle className="h-3 w-3 inline mr-1" />
              {validationIssues[0]}
            </div>
          )}
          
          <div className="flex justify-end mt-2 space-x-1">
            <Button
              size="sm"
              variant="outline"
              onClick={(e) => {
                e.stopPropagation();
                setSelectedEntryForReview(entry);
                setShowReviewModal(true);
              }}
            >
              <MessageSquare className="h-3 w-3" />
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-4">
                <div className="animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-6 bg-gray-200 rounded w-1/2"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <div className="animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[...Array(3)].map((_, j) => (
                    <div key={j} className="animate-pulse">
                      <div className="h-20 bg-gray-200 rounded"></div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={cn("space-y-6", className)}>
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Pending Review</p>
                <p className="text-2xl font-bold text-blue-600">
                  {entriesByStatus.submitted?.length || 0}
                </p>
              </div>
              <AlertTriangle className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Approved Today</p>
                <p className="text-2xl font-bold text-green-600">
                  {reviewWorkflows.filter(wf => 
                    wf.status === 'approved' && 
                    new Date(wf.reviewedAt || '').toDateString() === new Date().toDateString()
                  ).length}
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Avg Review Time</p>
                <p className="text-2xl font-bold text-purple-600">2.3h</p>
              </div>
              <Clock className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Validation Issues</p>
                <p className="text-2xl font-bold text-orange-600">
                  {timeEntries.filter(entry => getValidationIssues(entry).length > 0).length}
                </p>
              </div>
              <AlertCircle className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Actions */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
            <div className="flex flex-1 gap-4 items-center">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search entries..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <Select value={filters.client} onValueChange={(value) => setFilters(prev => ({ ...prev, client: value }))}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Filter by client" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Clients</SelectItem>
                  {Array.from(new Set(timeEntries.map(e => e.clientId))).map(clientId => {
                    const entry = timeEntries.find(e => e.clientId === clientId);
                    return (
                      <SelectItem key={clientId} value={clientId}>
                        {entry?.clientName}
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex gap-2">
              {selectedEntries.length > 0 && (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleBulkAction('submit')}
                  >
                    Submit ({selectedEntries.length})
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleBulkAction('approve')}
                  >
                    Approve ({selectedEntries.length})
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleBulkAction('reject')}
                  >
                    Reject ({selectedEntries.length})
                  </Button>
                </>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedEntries([])}
              >
                Clear Selection
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Kanban Board */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {KANBAN_COLUMNS.map((column) => (
          <Card key={column.id} className={column.color}>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center justify-between text-sm">
                <div className="flex items-center">
                  {column.icon}
                  <span className="ml-2">{column.title}</span>
                </div>
                <Badge variant="secondary">
                  {entriesByStatus[column.id]?.length || 0}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[600px]">
                <div className="space-y-2">
                  {entriesByStatus[column.id]?.map((entry) => (
                    <TimeEntryCard key={entry.id} entry={entry} />
                  ))}
                  {(!entriesByStatus[column.id] || entriesByStatus[column.id].length === 0) && (
                    <div className="text-center text-muted-foreground text-sm py-8">
                      No entries
                    </div>
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Review Modal */}
      <Dialog open={showReviewModal} onOpenChange={setShowReviewModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Review Time Entry</DialogTitle>
            <DialogDescription>
              Provide feedback and approval decision for this time entry.
            </DialogDescription>
          </DialogHeader>
          
          {selectedEntryForReview && (
            <div className="space-y-4">
              <Card>
                <CardContent className="p-4">
                  <h4 className="font-medium mb-2">{selectedEntryForReview.description}</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Client:</span>
                      <p>{selectedEntryForReview.clientName}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Matter:</span>
                      <p>{selectedEntryForReview.matterTitle}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Hours:</span>
                      <p>{selectedEntryForReview.hours}h @ ${selectedEntryForReview.rate}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Total:</span>
                      <p>${selectedEntryForReview.amount}</p>
                    </div>
                  </div>
                  
                  {getValidationIssues(selectedEntryForReview).length > 0 && (
                    <div className="mt-4 p-3 bg-orange-100 rounded">
                      <h5 className="font-medium text-orange-800 mb-2">Validation Issues:</h5>
                      <ul className="text-sm text-orange-700">
                        {getValidationIssues(selectedEntryForReview).map((issue, index) => (
                          <li key={index}>• {issue}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </CardContent>
              </Card>
              
              <div>
                <label className="text-sm font-medium">Review Comments</label>
                <Textarea
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  placeholder="Provide feedback or comments..."
                  className="mt-1"
                />
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowReviewModal(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => selectedEntryForReview && handleReview(selectedEntryForReview, 'rejected')}
            >
              Reject
            </Button>
            <Button
              onClick={() => selectedEntryForReview && handleReview(selectedEntryForReview, 'approved')}
            >
              Approve
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ReviewSubmitTab;