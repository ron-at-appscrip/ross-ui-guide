import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  MoreHorizontal, 
  Calendar,
  Clock,
  User,
  MessageSquare,
  Paperclip,
  AlertTriangle,
  ChevronDown,
  ChevronRight
} from 'lucide-react';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from '@/components/ui/dropdown-menu';
import { Task, TaskStatus } from '@/types/task';
import { format, isAfter, parseISO } from 'date-fns';

interface TaskListViewProps {
  tasks: Task[];
  onTaskUpdate: (taskId: string, updates: Partial<Task>) => void;
  onTaskDelete: (taskId: string) => void;
  getStatusColor: (status: TaskStatus) => string;
  getPriorityColor: (priority: string) => string;
}

const TaskListView: React.FC<TaskListViewProps> = ({
  tasks,
  onTaskUpdate,
  onTaskDelete,
  getStatusColor,
  getPriorityColor
}) => {
  const [expandedTasks, setExpandedTasks] = useState<Set<string>>(new Set());
  const [selectedTasks, setSelectedTasks] = useState<Set<string>>(new Set());

  const toggleTaskExpansion = (taskId: string) => {
    setExpandedTasks(prev => {
      const newSet = new Set(prev);
      if (newSet.has(taskId)) {
        newSet.delete(taskId);
      } else {
        newSet.add(taskId);
      }
      return newSet;
    });
  };

  const toggleTaskSelection = (taskId: string) => {
    setSelectedTasks(prev => {
      const newSet = new Set(prev);
      if (newSet.has(taskId)) {
        newSet.delete(taskId);
      } else {
        newSet.add(taskId);
      }
      return newSet;
    });
  };

  const selectAllTasks = () => {
    if (selectedTasks.size === tasks.length) {
      setSelectedTasks(new Set());
    } else {
      setSelectedTasks(new Set(tasks.map(t => t.id)));
    }
  };

  const handleStatusChange = (taskId: string, newStatus: TaskStatus) => {
    onTaskUpdate(taskId, { status: newStatus });
  };

  const handleTaskCompletion = (taskId: string, completed: boolean) => {
    onTaskUpdate(taskId, { status: completed ? 'completed' : 'not_started' });
  };

  const isOverdue = (task: Task): boolean => {
    if (!task.dueDate) return false;
    return isAfter(new Date(), parseISO(task.dueDate)) && task.status !== 'completed';
  };

  const formatDate = (dateString: string | undefined): string => {
    if (!dateString) return '-';
    try {
      return format(parseISO(dateString), 'MMM d, yyyy');
    } catch {
      return 'Invalid date';
    }
  };

  const formatDateTime = (dateString: string | undefined): string => {
    if (!dateString) return '-';
    try {
      return format(parseISO(dateString), 'MMM d, yyyy h:mm a');
    } catch {
      return 'Invalid date';
    }
  };

  const statusOptions: { status: TaskStatus; label: string }[] = [
    { status: 'not_started', label: 'Not Started' },
    { status: 'in_progress', label: 'In Progress' },
    { status: 'completed', label: 'Completed' },
    { status: 'blocked', label: 'Blocked' },
    { status: 'cancelled', label: 'Cancelled' }
  ];

  return (
    <div className="space-y-4">
      {/* Bulk Actions */}
      {selectedTasks.size > 0 && (
        <Card className="border-primary bg-primary/5">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">
                {selectedTasks.size} task{selectedTasks.size > 1 ? 's' : ''} selected
              </span>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    selectedTasks.forEach(taskId => {
                      handleStatusChange(taskId, 'completed');
                    });
                    setSelectedTasks(new Set());
                  }}
                >
                  Mark Completed
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    selectedTasks.forEach(taskId => {
                      onTaskDelete(taskId);
                    });
                    setSelectedTasks(new Set());
                  }}
                  className="text-red-600 hover:text-red-700"
                >
                  Delete Selected
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedTasks(new Set())}
                >
                  Clear Selection
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tasks Table */}
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">
                <Checkbox
                  checked={selectedTasks.size === tasks.length && tasks.length > 0}
                  onCheckedChange={selectAllTasks}
                />
              </TableHead>
              <TableHead className="w-12"></TableHead>
              <TableHead className="w-12">
                <Checkbox className="opacity-0" />
              </TableHead>
              <TableHead>Task</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Priority</TableHead>
              <TableHead>Assignee</TableHead>
              <TableHead>Due Date</TableHead>
              <TableHead>Progress</TableHead>
              <TableHead className="w-12"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tasks.map((task) => {
              const isExpanded = expandedTasks.has(task.id);
              const isSelected = selectedTasks.has(task.id);
              
              return (
                <React.Fragment key={task.id}>
                  <TableRow className={isSelected ? 'bg-muted/50' : ''}>
                    {/* Selection Checkbox */}
                    <TableCell>
                      <Checkbox
                        checked={isSelected}
                        onCheckedChange={() => toggleTaskSelection(task.id)}
                      />
                    </TableCell>

                    {/* Expand Button */}
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0"
                        onClick={() => toggleTaskExpansion(task.id)}
                      >
                        {isExpanded ? (
                          <ChevronDown className="h-4 w-4" />
                        ) : (
                          <ChevronRight className="h-4 w-4" />
                        )}
                      </Button>
                    </TableCell>

                    {/* Completion Checkbox */}
                    <TableCell>
                      <Checkbox
                        checked={task.status === 'completed'}
                        onCheckedChange={(checked) => 
                          handleTaskCompletion(task.id, checked as boolean)
                        }
                      />
                    </TableCell>

                    {/* Task Title and Category */}
                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{task.title}</span>
                          {isOverdue(task) && (
                            <AlertTriangle className="h-4 w-4 text-red-500" />
                          )}
                        </div>
                        
                        <div className="flex items-center gap-2">
                          {task.category && (
                            <Badge variant="outline" className="text-xs">
                              {task.category.replace('_', ' ')}
                            </Badge>
                          )}
                          
                          {task.comments && task.comments.length > 0 && (
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                              <MessageSquare className="h-3 w-3" />
                              <span>{task.comments.length}</span>
                            </div>
                          )}
                          
                          {task.attachments && task.attachments.length > 0 && (
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                              <Paperclip className="h-3 w-3" />
                              <span>{task.attachments.length}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </TableCell>

                    {/* Status */}
                    <TableCell>
                      <Badge className={getStatusColor(task.status)}>
                        {task.status.replace('_', ' ')}
                      </Badge>
                    </TableCell>

                    {/* Priority */}
                    <TableCell>
                      <Badge 
                        variant="outline" 
                        className={getPriorityColor(task.priority)}
                      >
                        {task.priority}
                      </Badge>
                    </TableCell>

                    {/* Assignee */}
                    <TableCell>
                      {task.assignedToName ? (
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">{task.assignedToName}</span>
                        </div>
                      ) : (
                        <span className="text-sm text-muted-foreground">Unassigned</span>
                      )}
                    </TableCell>

                    {/* Due Date */}
                    <TableCell>
                      {task.dueDate ? (
                        <div className={`flex items-center gap-2 ${
                          isOverdue(task) ? 'text-red-600' : 'text-muted-foreground'
                        }`}>
                          <Calendar className="h-4 w-4" />
                          <span className="text-sm">{formatDate(task.dueDate)}</span>
                        </div>
                      ) : (
                        <span className="text-sm text-muted-foreground">-</span>
                      )}
                    </TableCell>

                    {/* Progress */}
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {task.estimatedHours && (
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Clock className="h-3 w-3" />
                            <span>{task.estimatedHours}h</span>
                          </div>
                        )}
                        
                        {task.status === 'in_progress' && task.estimatedHours && task.actualHours && (
                          <div className="text-xs font-medium">
                            {Math.round((task.actualHours / task.estimatedHours) * 100)}%
                          </div>
                        )}
                      </div>
                    </TableCell>

                    {/* Actions */}
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {statusOptions.map((option) => (
                            <DropdownMenuItem
                              key={option.status}
                              onClick={() => handleStatusChange(task.id, option.status)}
                              disabled={task.status === option.status}
                            >
                              Mark as {option.label}
                            </DropdownMenuItem>
                          ))}
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            onClick={() => onTaskDelete(task.id)}
                            className="text-red-600"
                          >
                            Delete Task
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>

                  {/* Expanded Details */}
                  {isExpanded && (
                    <TableRow>
                      <TableCell colSpan={10} className="bg-muted/30 p-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          {/* Left Column */}
                          <div className="space-y-4">
                            {/* Description */}
                            {task.description && (
                              <div>
                                <h4 className="font-medium text-sm mb-2">Description</h4>
                                <p className="text-sm text-muted-foreground">
                                  {task.description}
                                </p>
                              </div>
                            )}

                            {/* Tags */}
                            {task.tags && task.tags.length > 0 && (
                              <div>
                                <h4 className="font-medium text-sm mb-2">Tags</h4>
                                <div className="flex flex-wrap gap-1">
                                  {task.tags.map((tag, index) => (
                                    <Badge key={index} variant="secondary" className="text-xs">
                                      {tag}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Dependencies */}
                            {task.dependencies && task.dependencies.length > 0 && (
                              <div>
                                <h4 className="font-medium text-sm mb-2">Dependencies</h4>
                                <p className="text-sm text-muted-foreground">
                                  Depends on {task.dependencies.length} other task{task.dependencies.length > 1 ? 's' : ''}
                                </p>
                              </div>
                            )}
                          </div>

                          {/* Right Column */}
                          <div className="space-y-4">
                            {/* Timestamps */}
                            <div>
                              <h4 className="font-medium text-sm mb-2">Timestamps</h4>
                              <div className="space-y-1 text-sm text-muted-foreground">
                                <div>Created: {formatDateTime(task.createdAt)}</div>
                                <div>Updated: {formatDateTime(task.updatedAt)}</div>
                                {task.completedAt && (
                                  <div>Completed: {formatDateTime(task.completedAt)}</div>
                                )}
                              </div>
                            </div>

                            {/* Time Tracking */}
                            {(task.estimatedHours || task.actualHours) && (
                              <div>
                                <h4 className="font-medium text-sm mb-2">Time Tracking</h4>
                                <div className="space-y-1 text-sm text-muted-foreground">
                                  {task.estimatedHours && (
                                    <div>Estimated: {task.estimatedHours} hours</div>
                                  )}
                                  {task.actualHours && (
                                    <div>Actual: {task.actualHours} hours</div>
                                  )}
                                </div>
                              </div>
                            )}

                            {/* Custom Fields */}
                            {task.customFields && Object.keys(task.customFields).length > 0 && (
                              <div>
                                <h4 className="font-medium text-sm mb-2">Custom Fields</h4>
                                <div className="space-y-1 text-sm text-muted-foreground">
                                  {Object.entries(task.customFields).map(([key, value]) => (
                                    <div key={key}>
                                      {key}: {String(value)}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </React.Fragment>
              );
            })}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
};

export default TaskListView;