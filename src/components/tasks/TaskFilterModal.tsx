import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Filter, X } from 'lucide-react';
import { TaskFilters, TaskStatus, TaskCategory, Task } from '@/types/task';
import { MatterPriority } from '@/types/matter';

interface TaskFilterModalProps {
  open: boolean;
  onClose: () => void;
  onApply: (filters: TaskFilters) => void;
  currentFilters: TaskFilters;
  tasks: Task[];
}

const TaskFilterModal: React.FC<TaskFilterModalProps> = ({
  open,
  onClose,
  onApply,
  currentFilters,
  tasks
}) => {
  const [filters, setFilters] = useState<TaskFilters>(currentFilters);

  useEffect(() => {
    setFilters(currentFilters);
  }, [currentFilters, open]);

  const statusOptions: { value: TaskStatus; label: string; count: number }[] = [
    { value: 'not_started', label: 'Not Started', count: 0 },
    { value: 'in_progress', label: 'In Progress', count: 0 },
    { value: 'completed', label: 'Completed', count: 0 },
    { value: 'blocked', label: 'Blocked', count: 0 },
    { value: 'cancelled', label: 'Cancelled', count: 0 }
  ].map(option => ({
    ...option,
    count: tasks.filter(task => task.status === option.value).length
  }));

  const priorityOptions: { value: MatterPriority; label: string; color: string; count: number }[] = [
    { value: 'low', label: 'Low', color: 'bg-gray-100 text-gray-800', count: 0 },
    { value: 'medium', label: 'Medium', color: 'bg-blue-100 text-blue-800', count: 0 },
    { value: 'high', label: 'High', color: 'bg-orange-100 text-orange-800', count: 0 },
    { value: 'urgent', label: 'Urgent', color: 'bg-red-100 text-red-800', count: 0 }
  ].map(option => ({
    ...option,
    count: tasks.filter(task => task.priority === option.value).length
  }));

  const categoryOptions: { value: TaskCategory; label: string; count: number }[] = [
    { value: 'court_filing', label: 'Court Filing', count: 0 },
    { value: 'client_communication', label: 'Client Communication', count: 0 },
    { value: 'document_preparation', label: 'Document Preparation', count: 0 },
    { value: 'research', label: 'Legal Research', count: 0 },
    { value: 'discovery', label: 'Discovery', count: 0 },
    { value: 'administrative', label: 'Administrative', count: 0 },
    { value: 'deadline', label: 'Deadline', count: 0 },
    { value: 'meeting', label: 'Meeting', count: 0 },
    { value: 'review', label: 'Review', count: 0 },
    { value: 'other', label: 'Other', count: 0 }
  ].map(option => ({
    ...option,
    count: tasks.filter(task => task.category === option.value).length
  }));

  // Get unique assignees
  const assigneeOptions = Array.from(
    new Set(
      tasks
        .filter(task => task.assignedToName)
        .map(task => task.assignedToName!)
    )
  ).map(name => ({
    value: name,
    label: name,
    count: tasks.filter(task => task.assignedToName === name).length
  }));

  const handleStatusChange = (status: TaskStatus, checked: boolean) => {
    setFilters(prev => ({
      ...prev,
      status: checked 
        ? [...(prev.status || []), status]
        : (prev.status || []).filter(s => s !== status)
    }));
  };

  const handlePriorityChange = (priority: MatterPriority, checked: boolean) => {
    setFilters(prev => ({
      ...prev,
      priority: checked 
        ? [...(prev.priority || []), priority]
        : (prev.priority || []).filter(p => p !== priority)
    }));
  };

  const handleCategoryChange = (category: TaskCategory, checked: boolean) => {
    setFilters(prev => ({
      ...prev,
      category: checked 
        ? [...(prev.category || []), category]
        : (prev.category || []).filter(c => c !== category)
    }));
  };

  const handleAssigneeChange = (assignee: string, checked: boolean) => {
    setFilters(prev => ({
      ...prev,
      assignedTo: checked 
        ? [...(prev.assignedTo || []), assignee]
        : (prev.assignedTo || []).filter(a => a !== assignee)
    }));
  };

  const handleDateRangeChange = (field: 'start' | 'end', value: string) => {
    setFilters(prev => ({
      ...prev,
      dueDate: {
        start: field === 'start' ? value : prev.dueDate?.start || '',
        end: field === 'end' ? value : prev.dueDate?.end || ''
      }
    }));
  };

  const handleSpecialFilterChange = (filter: keyof TaskFilters, checked: boolean) => {
    setFilters(prev => ({
      ...prev,
      [filter]: checked ? true : undefined
    }));
  };

  const clearFilters = () => {
    setFilters({});
  };

  const applyFilters = () => {
    // Clean up empty arrays and undefined values
    const cleanFilters: TaskFilters = {};
    
    if (filters.status && filters.status.length > 0) {
      cleanFilters.status = filters.status;
    }
    
    if (filters.priority && filters.priority.length > 0) {
      cleanFilters.priority = filters.priority;
    }
    
    if (filters.category && filters.category.length > 0) {
      cleanFilters.category = filters.category;
    }
    
    if (filters.assignedTo && filters.assignedTo.length > 0) {
      cleanFilters.assignedTo = filters.assignedTo;
    }
    
    if (filters.dueDate && (filters.dueDate.start || filters.dueDate.end)) {
      cleanFilters.dueDate = filters.dueDate;
    }
    
    if (filters.isOverdue) cleanFilters.isOverdue = filters.isOverdue;
    if (filters.hasAttachments) cleanFilters.hasAttachments = filters.hasAttachments;
    if (filters.isRecurring) cleanFilters.isRecurring = filters.isRecurring;

    onApply(cleanFilters);
  };

  const getActiveFilterCount = () => {
    let count = 0;
    if (filters.status?.length) count++;
    if (filters.priority?.length) count++;
    if (filters.category?.length) count++;
    if (filters.assignedTo?.length) count++;
    if (filters.dueDate?.start || filters.dueDate?.end) count++;
    if (filters.isOverdue) count++;
    if (filters.hasAttachments) count++;
    if (filters.isRecurring) count++;
    return count;
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Filter className="h-5 w-5" />
            <span>Filter Tasks</span>
            {getActiveFilterCount() > 0 && (
              <Badge variant="secondary">
                {getActiveFilterCount()} active
              </Badge>
            )}
          </DialogTitle>
          <DialogDescription>
            Apply filters to narrow down your task list
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto px-1">
          <div className="space-y-6">
            {/* Status Filters */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Status</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {statusOptions.map((option) => (
                  <div key={option.value} className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id={`status-${option.value}`}
                        checked={(filters.status || []).includes(option.value)}
                        onCheckedChange={(checked) => 
                          handleStatusChange(option.value, checked as boolean)
                        }
                      />
                      <Label 
                        htmlFor={`status-${option.value}`}
                        className="text-sm font-normal cursor-pointer"
                      >
                        {option.label}
                      </Label>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {option.count}
                    </Badge>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Priority Filters */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Priority</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {priorityOptions.map((option) => (
                  <div key={option.value} className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id={`priority-${option.value}`}
                        checked={(filters.priority || []).includes(option.value)}
                        onCheckedChange={(checked) => 
                          handlePriorityChange(option.value, checked as boolean)
                        }
                      />
                      <Label 
                        htmlFor={`priority-${option.value}`}
                        className="text-sm font-normal cursor-pointer flex items-center gap-2"
                      >
                        <Badge className={option.color} variant="secondary">
                          {option.label}
                        </Badge>
                      </Label>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {option.count}
                    </Badge>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Category Filters */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Category</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 max-h-[200px] overflow-y-auto">
                {categoryOptions.filter(option => option.count > 0).map((option) => (
                  <div key={option.value} className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id={`category-${option.value}`}
                        checked={(filters.category || []).includes(option.value)}
                        onCheckedChange={(checked) => 
                          handleCategoryChange(option.value, checked as boolean)
                        }
                      />
                      <Label 
                        htmlFor={`category-${option.value}`}
                        className="text-sm font-normal cursor-pointer"
                      >
                        {option.label}
                      </Label>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {option.count}
                    </Badge>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Assignee Filters */}
            {assigneeOptions.length > 0 && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">Assigned To</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 max-h-[150px] overflow-y-auto">
                  {assigneeOptions.map((option) => (
                    <div key={option.value} className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id={`assignee-${option.value}`}
                          checked={(filters.assignedTo || []).includes(option.value)}
                          onCheckedChange={(checked) => 
                            handleAssigneeChange(option.value, checked as boolean)
                          }
                        />
                        <Label 
                          htmlFor={`assignee-${option.value}`}
                          className="text-sm font-normal cursor-pointer"
                        >
                          {option.label}
                        </Label>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {option.count}
                      </Badge>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* Date Range */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Due Date Range</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="startDate" className="text-xs">From</Label>
                    <Input
                      id="startDate"
                      type="date"
                      value={filters.dueDate?.start || ''}
                      onChange={(e) => handleDateRangeChange('start', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="endDate" className="text-xs">To</Label>
                    <Input
                      id="endDate"
                      type="date"
                      value={filters.dueDate?.end || ''}
                      onChange={(e) => handleDateRangeChange('end', e.target.value)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Special Filters */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Special Filters</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="overdue"
                    checked={!!filters.isOverdue}
                    onCheckedChange={(checked) => 
                      handleSpecialFilterChange('isOverdue', checked as boolean)
                    }
                  />
                  <Label htmlFor="overdue" className="text-sm font-normal cursor-pointer">
                    Show only overdue tasks
                  </Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="attachments"
                    checked={!!filters.hasAttachments}
                    onCheckedChange={(checked) => 
                      handleSpecialFilterChange('hasAttachments', checked as boolean)
                    }
                  />
                  <Label htmlFor="attachments" className="text-sm font-normal cursor-pointer">
                    Tasks with attachments
                  </Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="recurring"
                    checked={!!filters.isRecurring}
                    onCheckedChange={(checked) => 
                      handleSpecialFilterChange('isRecurring', checked as boolean)
                    }
                  />
                  <Label htmlFor="recurring" className="text-sm font-normal cursor-pointer">
                    Recurring tasks only
                  </Label>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <DialogFooter className="border-t pt-4">
          <div className="flex items-center justify-between w-full">
            <Button 
              type="button" 
              variant="ghost" 
              onClick={clearFilters}
              className="text-muted-foreground"
            >
              <X className="h-4 w-4 mr-2" />
              Clear All
            </Button>
            
            <div className="flex gap-2">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button onClick={applyFilters}>
                Apply Filters
                {getActiveFilterCount() > 0 && (
                  <Badge variant="secondary" className="ml-2">
                    {getActiveFilterCount()}
                  </Badge>
                )}
              </Button>
            </div>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default TaskFilterModal;