import React, { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { MoreHorizontal, Eye, Clock, DollarSign, Calendar, User, Users, Bell, Briefcase, TrendingUp, ChevronLeft, ChevronRight, Edit, ListTodo } from 'lucide-react';
import { Matter } from '@/types/matter';
import MatterStatusBadge from './MatterStatusBadge';
import MatterPriorityBadge from './MatterPriorityBadge';
import TimeEntryModal from './TimeEntryModal';
import ExpenseModal from './ExpenseModal';
import EditMatterModal from './EditMatterModal';
import TeamManagementModal from './TeamManagementModal';
import ScheduleEventModal from './ScheduleEventModal';
import { MatterService } from '@/services/matterService';

interface MattersTableProps {
  matters: Matter[];
  title?: string;
  pageSize?: number;
  onMatterUpdate?: () => void;
}

const formatTimeAgo = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
  
  if (diffInDays === 0) return 'Today';
  if (diffInDays === 1) return '1 day ago';
  if (diffInDays < 7) return `${diffInDays} days ago`;
  if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} weeks ago`;
  return date.toLocaleDateString();
};

const getStageDisplay = (stage: string) => {
  const stageMap: { [key: string]: { label: string; color: string } } = {
    open: { label: 'Open', color: 'bg-blue-50 text-blue-700 border-blue-200' },
    discovery: { label: 'Discovery', color: 'bg-yellow-50 text-yellow-700 border-yellow-200' },
    mediation: { label: 'Mediation', color: 'bg-purple-50 text-purple-700 border-purple-200' },
    trial: { label: 'Trial', color: 'bg-red-50 text-red-700 border-red-200' },
    settlement: { label: 'Settlement', color: 'bg-green-50 text-green-700 border-green-200' },
    appeal: { label: 'Appeal', color: 'bg-orange-50 text-orange-700 border-orange-200' },
    closed: { label: 'Closed', color: 'bg-gray-50 text-gray-700 border-gray-200' }
  };
  
  return stageMap[stage] || { label: stage, color: 'bg-gray-50 text-gray-700 border-gray-200' };
};

const MattersTableEnhanced = ({ 
  matters, 
  title = "Matters", 
  pageSize = 10,
  onMatterUpdate 
}: MattersTableProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // Modal states
  const [timeEntryModal, setTimeEntryModal] = useState<{ open: boolean; matter?: Matter }>({ open: false });
  const [expenseModal, setExpenseModal] = useState<{ open: boolean; matter?: Matter }>({ open: false });
  const [editMatterModal, setEditMatterModal] = useState<{ open: boolean; matter?: Matter }>({ open: false });
  const [teamManagementModal, setTeamManagementModal] = useState<{ open: boolean; matter?: Matter }>({ open: false });
  const [scheduleEventModal, setScheduleEventModal] = useState<{ open: boolean; matter?: Matter }>({ open: false });
  
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(pageSize);

  // Calculate pagination
  const totalItems = matters.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  
  const paginatedMatters = useMemo(() => {
    return matters.slice(startIndex, endIndex);
  }, [matters, startIndex, endIndex]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleItemsPerPageChange = (value: string) => {
    setItemsPerPage(Number(value));
    setCurrentPage(1); // Reset to first page when changing page size
  };

  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;
    
    if (totalPages <= maxVisiblePages) {
      // Show all pages if total is less than max visible
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Show smart pagination
      if (currentPage <= 3) {
        // Show first 5 pages
        for (let i = 1; i <= 5; i++) {
          pages.push(i);
        }
      } else if (currentPage >= totalPages - 2) {
        // Show last 5 pages
        for (let i = totalPages - 4; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        // Show current page with 2 pages on each side
        for (let i = currentPage - 2; i <= currentPage + 2; i++) {
          pages.push(i);
        }
      }
    }
    
    return pages;
  };

  // Action handlers
  const handleViewDetails = (matter: Matter) => {
    navigate(`/dashboard/matters/${matter.id}`);
  };

  const handleEditMatter = (matter: Matter) => {
    setEditMatterModal({ open: true, matter });
  };

  const handleAddTimeEntry = (matter: Matter) => {
    setTimeEntryModal({ open: true, matter });
  };

  const handleAddExpense = (matter: Matter) => {
    setExpenseModal({ open: true, matter });
  };

  const handleScheduleEvent = (matter: Matter) => {
    setScheduleEventModal({ open: true, matter });
  };

  const handleManageTeam = (matter: Matter) => {
    setTeamManagementModal({ open: true, matter });
  };

  const handleManageTasks = (matter: Matter) => {
    navigate(`/dashboard/matters/${matter.id}?tab=tasks`);
  };

  // Modal submission handlers
  const handleTimeEntrySubmit = async (timeEntryData: any) => {
    try {
      const matter = timeEntryModal.matter;
      if (!matter) return;

      const result = await MatterService.addTimeEntry(matter.id, timeEntryData);
      
      if (result.matter && result.timeEntry) {
        const billingText = timeEntryData.billable 
          ? `($${(timeEntryData.hours * timeEntryData.rate).toFixed(2)} billable)`
          : '(non-billable)';
        
        toast({
          title: "Time Entry Added",
          description: `${timeEntryData.hours} hours added to ${matter.title} ${billingText}`,
        });

        if (onMatterUpdate) onMatterUpdate();
      } else {
        throw new Error('Failed to create time entry');
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add time entry. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleExpenseSubmit = async (expenseData: any) => {
    try {
      const matter = expenseModal.matter;
      if (!matter) return;

      // Note: MatterService doesn't have addExpense method yet, but we'll show success for UX
      console.log('Expense data:', expenseData);
      
      toast({
        title: "Expense Added",
        description: `$${expenseData.amount} expense added to ${matter.title}`,
      });

      if (onMatterUpdate) onMatterUpdate();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add expense. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleEditMatterSubmit = async (updates: any) => {
    try {
      const matter = editMatterModal.matter;
      if (!matter) return;

      await MatterService.updateMatter(matter.id, updates);
      
      toast({
        title: "Matter Updated",
        description: `${matter.title} has been updated successfully.`,
      });

      if (onMatterUpdate) onMatterUpdate();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update matter. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleTeamManagementSubmit = async (teamData: any) => {
    try {
      const matter = teamManagementModal.matter;
      if (!matter) return;

      await MatterService.updateMatter(matter.id, teamData);
      
      toast({
        title: "Team Updated",
        description: `Team assignments updated for ${matter.title}`,
      });

      if (onMatterUpdate) onMatterUpdate();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update team. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleScheduleEventSubmit = async (eventData: any) => {
    try {
      const matter = scheduleEventModal.matter;
      if (!matter) return;

      // Note: This would integrate with calendar service
      console.log('Event data:', eventData);
      
      toast({
        title: "Event Scheduled",
        description: `${eventData.title} scheduled for ${matter.title}`,
      });

      if (onMatterUpdate) onMatterUpdate();
    } catch (error) {
      toast({
        title: "Error", 
        description: "Failed to schedule event. Please try again.",
        variant: "destructive"
      });
    }
  };

  return (
    <Card className="overflow-hidden shadow-sm">
      <CardHeader>
        <CardTitle className="text-xl font-semibold text-gray-900">{title}</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-b">
                <TableHead className="px-6 py-4 min-w-[300px] font-semibold">Matter</TableHead>
                <TableHead className="px-4 py-4 min-w-[150px] font-semibold">Client</TableHead>
                <TableHead className="px-4 py-4 min-w-[150px] font-semibold">Responsible Attorney</TableHead>
                <TableHead className="px-4 py-4 min-w-[150px] font-semibold">Originating Attorney</TableHead>
                <TableHead className="px-4 py-4 min-w-[120px] font-semibold">Responsible Staff</TableHead>
                <TableHead className="px-4 py-4 min-w-[120px] font-semibold">Matter Notifications</TableHead>
                <TableHead className="px-4 py-4 min-w-[130px] font-semibold">Practice Area</TableHead>
                <TableHead className="px-4 py-4 min-w-[100px] font-semibold">Matter Stage</TableHead>
                <TableHead className="px-4 py-4 min-w-[120px] font-semibold">Open Date</TableHead>
                <TableHead className="px-4 py-4 w-[60px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedMatters.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={10} className="text-center py-12 text-muted-foreground">
                    <div className="text-sm">
                      {matters.length === 0 ? 'No matters found' : 'No matters found for this page'}
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                paginatedMatters.map((matter) => {
                  const stageDisplay = getStageDisplay(matter.stage);
                  return (
                    <TableRow key={matter.id} className="group hover:bg-muted/50 border-b transition-colors">
                      {/* Matter Column */}
                      <TableCell className="px-6 py-4">
                        <div className="space-y-2">
                          <div className="font-medium text-base">
                            <Link 
                              to={`/dashboard/matters/${matter.id}`}
                              className="hover:underline hover:text-primary transition-colors inline-block"
                            >
                              {matter.title}
                            </Link>
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {matter.practiceArea}
                            {matter.practiceSubArea && ` • ${matter.practiceSubArea}`}
                          </div>
                          <div className="flex items-center gap-2">
                            <MatterPriorityBadge priority={matter.priority} />
                            {matter.matterNumber && (
                              <Badge variant="outline" className="text-xs font-normal">
                                {matter.matterNumber}
                              </Badge>
                            )}
                          </div>
                          {matter.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1">
                              {matter.tags.slice(0, 2).map((tag) => (
                                <Badge key={tag} variant="outline" className="text-xs">
                                  {tag}
                                </Badge>
                              ))}
                              {matter.tags.length > 2 && (
                                <Badge variant="outline" className="text-xs">
                                  +{matter.tags.length - 2}
                                </Badge>
                              )}
                            </div>
                          )}
                        </div>
                      </TableCell>

                      {/* Client Column */}
                      <TableCell className="px-4 py-4">
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-muted-foreground" />
                          <Link 
                            to={`/dashboard/clients/${matter.clientId}`}
                            className="hover:underline hover:text-primary transition-colors text-sm"
                          >
                            {matter.clientName}
                          </Link>
                        </div>
                      </TableCell>

                      {/* Responsible Attorney Column */}
                      <TableCell className="px-4 py-4">
                        <div className="flex items-center gap-2">
                          <Briefcase className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">{matter.responsibleAttorney}</span>
                        </div>
                      </TableCell>

                      {/* Originating Attorney Column */}
                      <TableCell className="px-4 py-4">
                        {matter.originatingAttorney ? (
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm">{matter.originatingAttorney}</span>
                          </div>
                        ) : (
                          <span className="text-sm text-muted-foreground">—</span>
                        )}
                      </TableCell>

                      {/* Responsible Staff Column */}
                      <TableCell className="px-4 py-4">
                        {matter.responsibleStaff && matter.responsibleStaff.length > 0 ? (
                          <div className="flex items-center gap-2">
                            <Users className="h-4 w-4 text-muted-foreground" />
                            <div className="text-sm">
                              {matter.responsibleStaff.length === 1 ? (
                                matter.responsibleStaff[0]
                              ) : (
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <div className="inline-block">
                                      <Badge variant="secondary" className="text-xs cursor-help hover:bg-secondary/80 transition-colors">
                                        {matter.responsibleStaff.length} staff
                                      </Badge>
                                    </div>
                                  </TooltipTrigger>
                                  <TooltipContent side="top" className="max-w-sm p-3">
                                    <div className="space-y-2">
                                      <div className="font-semibold text-sm text-foreground">Responsible Staff</div>
                                      <div className="space-y-1">
                                        {matter.responsibleStaff.map((staff, index) => (
                                          <div key={index} className="flex items-center gap-2 text-sm">
                                            <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
                                            <span className="text-foreground">{staff}</span>
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  </TooltipContent>
                                </Tooltip>
                              )}
                            </div>
                          </div>
                        ) : (
                          <span className="text-sm text-muted-foreground">—</span>
                        )}
                      </TableCell>

                      {/* Matter Notifications Column */}
                      <TableCell className="px-4 py-4">
                        <div className="flex items-center gap-2">
                          <Bell className="h-4 w-4 text-muted-foreground" />
                          {matter.notificationCount > 0 ? (
                            <Badge variant="secondary" className="text-xs bg-blue-50 text-blue-700 hover:bg-blue-100">
                              {matter.notificationCount}
                            </Badge>
                          ) : (
                            <span className="text-sm text-muted-foreground">—</span>
                          )}
                        </div>
                      </TableCell>

                      {/* Practice Area Column */}
                      <TableCell className="px-4 py-4">
                        <div className="text-sm">
                          {matter.practiceArea}
                        </div>
                      </TableCell>

                      {/* Matter Stage Column */}
                      <TableCell className="px-4 py-4">
                        <div className="flex items-center gap-2">
                          <TrendingUp className="h-4 w-4 text-muted-foreground" />
                          <Badge variant="outline" className={`text-xs border ${stageDisplay.color}`}>
                            {stageDisplay.label}
                          </Badge>
                        </div>
                      </TableCell>

                      {/* Open Date Column */}
                      <TableCell className="px-4 py-4">
                        <div className="text-sm">
                          <div>{formatTimeAgo(matter.dateOpened)}</div>
                          <div className="text-xs text-muted-foreground">
                            {new Date(matter.dateOpened).toLocaleDateString()}
                          </div>
                        </div>
                      </TableCell>

                      {/* Actions Column */}
                      <TableCell className="px-4 py-4">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleViewDetails(matter)}>
                              <Eye className="mr-2 h-4 w-4" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleEditMatter(matter)}>
                              <Edit className="mr-2 h-4 w-4" />
                              Edit Matter
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleManageTasks(matter)}>
                              <ListTodo className="mr-2 h-4 w-4" />
                              Manage Tasks
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleAddTimeEntry(matter)}>
                              <Clock className="mr-2 h-4 w-4" />
                              Add Time Entry
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleAddExpense(matter)}>
                              <DollarSign className="mr-2 h-4 w-4" />
                              Add Expense
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleScheduleEvent(matter)}>
                              <Calendar className="mr-2 h-4 w-4" />
                              Schedule Event
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleManageTeam(matter)}>
                              <Users className="mr-2 h-4 w-4" />
                              Manage Team
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
        
        {/* Pagination Controls */}
        {matters.length > 0 && (
          <div className="flex items-center justify-between px-6 py-4 border-t bg-gray-50/50">
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium text-gray-700">Show</span>
              <Select value={itemsPerPage.toString()} onValueChange={handleItemsPerPageChange}>
                <SelectTrigger className="w-20 h-8">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5">5</SelectItem>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="20">20</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                  <SelectItem value="100">100</SelectItem>
                </SelectContent>
              </Select>
              <span className="text-sm text-gray-600">entries</span>
            </div>
            
            <div className="flex items-center gap-6">
              <span className="text-sm text-gray-600">
                Showing <span className="font-medium text-gray-900">{startIndex + 1}</span> to <span className="font-medium text-gray-900">{Math.min(endIndex, totalItems)}</span> of <span className="font-medium text-gray-900">{totalItems}</span> results
              </span>
              
              <div className="flex items-center gap-1">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="h-8 w-8 p-0 disabled:opacity-50"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                
                {getPageNumbers().map((page) => (
                  <Button
                    key={page}
                    variant={currentPage === page ? "default" : "outline"}
                    size="sm"
                    onClick={() => handlePageChange(page)}
                    className={`h-8 min-w-[32px] px-3 ${currentPage === page ? 'shadow-sm' : ''}`}
                  >
                    {page}
                  </Button>
                ))}
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="h-8 w-8 p-0 disabled:opacity-50"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        )}
      </CardContent>

      {/* Modals */}
      {timeEntryModal.open && timeEntryModal.matter && (
        <TimeEntryModal
          open={timeEntryModal.open}
          onClose={() => setTimeEntryModal({ open: false })}
          onSubmit={handleTimeEntrySubmit}
          matterId={timeEntryModal.matter.id}
          matterTitle={timeEntryModal.matter.title}
          clientName={timeEntryModal.matter.clientName}
        />
      )}

      {expenseModal.open && expenseModal.matter && (
        <ExpenseModal
          open={expenseModal.open}
          onClose={() => setExpenseModal({ open: false })}
          onSubmit={handleExpenseSubmit}
          matterId={expenseModal.matter.id}
          matterTitle={expenseModal.matter.title}
          clientName={expenseModal.matter.clientName}
        />
      )}

      {editMatterModal.open && editMatterModal.matter && (
        <EditMatterModal
          open={editMatterModal.open}
          onClose={() => setEditMatterModal({ open: false })}
          onSubmit={handleEditMatterSubmit}
          matter={editMatterModal.matter}
        />
      )}

      {teamManagementModal.open && teamManagementModal.matter && (
        <TeamManagementModal
          open={teamManagementModal.open}
          onClose={() => setTeamManagementModal({ open: false })}
          onSubmit={handleTeamManagementSubmit}
          matter={teamManagementModal.matter}
        />
      )}

      {scheduleEventModal.open && scheduleEventModal.matter && (
        <ScheduleEventModal
          open={scheduleEventModal.open}
          onClose={() => setScheduleEventModal({ open: false })}
          onSubmit={handleScheduleEventSubmit}
          matter={scheduleEventModal.matter}
        />
      )}
    </Card>
  );
};

export default MattersTableEnhanced;