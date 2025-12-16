import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Calendar,
  Clock,
  User,
  MoreHorizontal,
  AlertTriangle
} from 'lucide-react';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from '@/components/ui/dropdown-menu';
import { Task, TaskStatus } from '@/types/task';
import { format, parseISO, isAfter, startOfWeek, endOfWeek, addWeeks, isSameWeek } from 'date-fns';

interface TaskTimelineViewProps {
  tasks: Task[];
  onTaskUpdate: (taskId: string, updates: Partial<Task>) => void;
  onTaskDelete: (taskId: string) => void;
  getStatusColor: (status: TaskStatus) => string;
  getPriorityColor: (priority: string) => string;
}

const TaskTimelineView: React.FC<TaskTimelineViewProps> = ({
  tasks,
  onTaskUpdate,
  onTaskDelete,
  getStatusColor,
  getPriorityColor
}) => {
  const statusOptions: { status: TaskStatus; label: string }[] = [
    { status: 'not_started', label: 'Not Started' },
    { status: 'in_progress', label: 'In Progress' },
    { status: 'completed', label: 'Completed' },
    { status: 'blocked', label: 'Blocked' },
    { status: 'cancelled', label: 'Cancelled' }
  ];

  const handleStatusChange = (taskId: string, newStatus: TaskStatus) => {
    onTaskUpdate(taskId, { status: newStatus });
  };

  const isOverdue = (task: Task): boolean => {
    if (!task.dueDate) return false;
    return isAfter(new Date(), parseISO(task.dueDate)) && task.status !== 'completed';
  };

  const formatDate = (dateString: string | undefined): string => {
    if (!dateString) return 'No due date';
    try {
      return format(parseISO(dateString), 'MMM d, yyyy');
    } catch {
      return 'Invalid date';
    }
  };

  // Group tasks by week
  const groupTasksByWeek = () => {
    const now = new Date();
    const weeks: { [key: string]: Task[] } = {};
    
    // Generate weeks for the next 8 weeks
    for (let i = -2; i < 6; i++) {
      const weekStart = startOfWeek(addWeeks(now, i));
      const weekKey = format(weekStart, 'yyyy-MM-dd');
      weeks[weekKey] = [];
    }

    // Add tasks with due dates to appropriate weeks
    tasks.forEach(task => {
      if (task.dueDate) {
        try {
          const taskDate = parseISO(task.dueDate);
          const weekStart = startOfWeek(taskDate);
          const weekKey = format(weekStart, 'yyyy-MM-dd');
          
          if (!weeks[weekKey]) {
            weeks[weekKey] = [];
          }
          weeks[weekKey].push(task);
        } catch (error) {
          // Invalid date, add to current week
          const currentWeekKey = format(startOfWeek(now), 'yyyy-MM-dd');
          weeks[currentWeekKey].push(task);
        }
      }
    });

    // Add tasks without due dates to current week
    const tasksWithoutDates = tasks.filter(task => !task.dueDate);
    if (tasksWithoutDates.length > 0) {
      const currentWeekKey = format(startOfWeek(now), 'yyyy-MM-dd');
      weeks[currentWeekKey].push(...tasksWithoutDates);
    }

    return weeks;
  };

  const weekGroups = groupTasksByWeek();
  const sortedWeeks = Object.keys(weekGroups).sort();

  const TaskCard: React.FC<{ task: Task }> = ({ task }) => (
    <Card className="mb-2 hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            {/* Title and Priority */}
            <div className="flex items-center gap-2 mb-2">
              <h4 className="font-medium text-sm">{task.title}</h4>
              <Badge 
                variant="outline" 
                className={getPriorityColor(task.priority)}
              >
                {task.priority}
              </Badge>
              {isOverdue(task) && (
                <AlertTriangle className="h-4 w-4 text-red-500" />
              )}
            </div>

            {/* Status and Category */}
            <div className="flex items-center gap-2 mb-2">
              <Badge className={getStatusColor(task.status)}>
                {task.status.replace('_', ' ')}
              </Badge>
              {task.category && (
                <Badge variant="secondary" className="text-xs">
                  {task.category.replace('_', ' ')}
                </Badge>
              )}
            </div>

            {/* Due Date and Assignee */}
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              {task.dueDate && (
                <div className={`flex items-center gap-1 ${
                  isOverdue(task) ? 'text-red-600' : ''
                }`}>
                  <Calendar className="h-3 w-3" />
                  <span>{formatDate(task.dueDate)}</span>
                </div>
              )}
              
              {task.assignedToName && (
                <div className="flex items-center gap-1">
                  <User className="h-3 w-3" />
                  <span>{task.assignedToName}</span>
                </div>
              )}
              
              {task.estimatedHours && (
                <div className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  <span>{task.estimatedHours}h</span>
                </div>
              )}
            </div>

            {/* Description */}
            {task.description && (
              <p className="text-xs text-muted-foreground mt-2 line-clamp-2">
                {task.description}
              </p>
            )}
          </div>

          {/* Actions */}
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
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      {sortedWeeks.map(weekKey => {
        const weekStart = parseISO(weekKey);
        const weekEnd = endOfWeek(weekStart);
        const weekTasks = weekGroups[weekKey];
        const isCurrentWeek = isSameWeek(weekStart, new Date());
        
        if (weekTasks.length === 0) return null;

        return (
          <div key={weekKey}>
            {/* Week Header */}
            <div className={`sticky top-0 z-10 bg-background border-b pb-2 mb-4 ${
              isCurrentWeek ? 'border-primary' : 'border-muted'
            }`}>
              <h3 className={`text-lg font-semibold ${
                isCurrentWeek ? 'text-primary' : 'text-foreground'
              }`}>
                {format(weekStart, 'MMM d')} - {format(weekEnd, 'MMM d, yyyy')}
                {isCurrentWeek && (
                  <Badge variant="secondary" className="ml-2">
                    This Week
                  </Badge>
                )}
              </h3>
              <p className="text-sm text-muted-foreground">
                {weekTasks.length} task{weekTasks.length > 1 ? 's' : ''}
              </p>
            </div>

            {/* Week Tasks */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {weekTasks
                .sort((a, b) => {
                  // Sort by priority, then by due date
                  const priorityOrder = { urgent: 0, high: 1, medium: 2, low: 3 };
                  const aPriority = priorityOrder[a.priority as keyof typeof priorityOrder];
                  const bPriority = priorityOrder[b.priority as keyof typeof priorityOrder];
                  
                  if (aPriority !== bPriority) {
                    return aPriority - bPriority;
                  }
                  
                  if (a.dueDate && b.dueDate) {
                    return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
                  }
                  
                  return 0;
                })
                .map(task => (
                  <TaskCard key={task.id} task={task} />
                ))}
            </div>
          </div>
        );
      })}

      {/* No Tasks Message */}
      {Object.values(weekGroups).every(tasks => tasks.length === 0) && (
        <div className="text-center py-12">
          <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium text-muted-foreground mb-2">
            No scheduled tasks
          </h3>
          <p className="text-sm text-muted-foreground">
            Tasks with due dates will appear in the timeline view.
          </p>
        </div>
      )}
    </div>
  );
};

export default TaskTimelineView;