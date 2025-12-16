import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  MoreHorizontal, 
  Calendar,
  Clock,
  User,
  Tag,
  MessageSquare,
  Paperclip,
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
import { format, isAfter, parseISO } from 'date-fns';

interface TaskKanbanBoardProps {
  tasks: Task[];
  onTaskUpdate: (taskId: string, updates: Partial<Task>) => void;
  onTaskDelete: (taskId: string) => void;
  getStatusColor: (status: TaskStatus) => string;
  getPriorityColor: (priority: string) => string;
}

const TaskKanbanBoard: React.FC<TaskKanbanBoardProps> = ({
  tasks,
  onTaskUpdate,
  onTaskDelete,
  getStatusColor,
  getPriorityColor
}) => {
  const [draggedTask, setDraggedTask] = useState<string | null>(null);

  const columns: { status: TaskStatus; title: string; description: string }[] = [
    { 
      status: 'not_started', 
      title: 'To Do', 
      description: 'Tasks ready to begin' 
    },
    { 
      status: 'in_progress', 
      title: 'In Progress', 
      description: 'Currently being worked on' 
    },
    { 
      status: 'completed', 
      title: 'Completed', 
      description: 'Finished tasks' 
    },
    { 
      status: 'blocked', 
      title: 'Blocked', 
      description: 'Waiting on dependencies' 
    },
    { 
      status: 'cancelled', 
      title: 'Cancelled', 
      description: 'No longer needed' 
    }
  ];

  const getTasksByStatus = (status: TaskStatus) => {
    return tasks.filter(task => task.status === status);
  };

  const handleDragStart = (e: React.DragEvent, taskId: string) => {
    setDraggedTask(taskId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, newStatus: TaskStatus) => {
    e.preventDefault();
    
    if (draggedTask) {
      const task = tasks.find(t => t.id === draggedTask);
      if (task && task.status !== newStatus) {
        onTaskUpdate(draggedTask, { status: newStatus });
      }
      setDraggedTask(null);
    }
  };

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

  const TaskCard: React.FC<{ task: Task }> = ({ task }) => (
    <Card 
      className="mb-3 cursor-move hover:shadow-md transition-shadow"
      draggable
      onDragStart={(e) => handleDragStart(e, task.id)}
    >
      <CardContent className="p-4">
        {/* Priority and Status Badges */}
        <div className="flex items-center justify-between mb-2">
          <Badge 
            variant="outline" 
            className={getPriorityColor(task.priority)}
          >
            {task.priority}
          </Badge>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {columns.map((column) => (
                <DropdownMenuItem
                  key={column.status}
                  onClick={() => handleStatusChange(task.id, column.status)}
                  disabled={task.status === column.status}
                >
                  Move to {column.title}
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

        {/* Task Title */}
        <h4 className="font-medium text-sm mb-2 line-clamp-2">
          {task.title}
        </h4>

        {/* Task Description */}
        {task.description && (
          <p className="text-xs text-muted-foreground mb-3 line-clamp-2">
            {task.description}
          </p>
        )}

        {/* Due Date */}
        {task.dueDate && (
          <div className={`flex items-center gap-1 text-xs mb-2 ${
            isOverdue(task) ? 'text-red-600' : 'text-muted-foreground'
          }`}>
            {isOverdue(task) && <AlertTriangle className="h-3 w-3" />}
            <Calendar className="h-3 w-3" />
            <span>{formatDate(task.dueDate)}</span>
          </div>
        )}

        {/* Assignee */}
        {task.assignedToName && (
          <div className="flex items-center gap-1 text-xs text-muted-foreground mb-2">
            <User className="h-3 w-3" />
            <span>{task.assignedToName}</span>
          </div>
        )}

        {/* Estimated Hours */}
        {task.estimatedHours && (
          <div className="flex items-center gap-1 text-xs text-muted-foreground mb-2">
            <Clock className="h-3 w-3" />
            <span>{task.estimatedHours}h estimated</span>
          </div>
        )}

        {/* Tags */}
        {task.tags && task.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-2">
            {task.tags.slice(0, 2).map((tag, index) => (
              <Badge key={index} variant="secondary" className="text-xs">
                {tag}
              </Badge>
            ))}
            {task.tags.length > 2 && (
              <Badge variant="secondary" className="text-xs">
                +{task.tags.length - 2}
              </Badge>
            )}
          </div>
        )}

        {/* Footer Icons */}
        <div className="flex items-center justify-between pt-2 border-t">
          <div className="flex items-center gap-2">
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

            {task.category && (
              <Badge variant="outline" className="text-xs">
                {task.category.replace('_', ' ')}
              </Badge>
            )}
          </div>

          {/* Completion Progress */}
          {task.status === 'in_progress' && task.estimatedHours && task.actualHours && (
            <div className="text-xs text-muted-foreground">
              {Math.round((task.actualHours / task.estimatedHours) * 100)}%
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
      {columns.map((column) => {
        const columnTasks = getTasksByStatus(column.status);
        
        return (
          <div key={column.status} className="space-y-4">
            {/* Column Header */}
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-sm font-medium">
                      {column.title}
                    </CardTitle>
                    <p className="text-xs text-muted-foreground mt-1">
                      {column.description}
                    </p>
                  </div>
                  <Badge 
                    variant="secondary" 
                    className={`${getStatusColor(column.status)} border-0`}
                  >
                    {columnTasks.length}
                  </Badge>
                </div>
              </CardHeader>
            </Card>

            {/* Drop Zone */}
            <div
              className={`min-h-[400px] rounded-lg border-2 border-dashed p-2 transition-colors ${
                draggedTask 
                  ? 'border-primary bg-primary/5' 
                  : 'border-muted-foreground/25'
              }`}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, column.status)}
            >
              {/* Tasks */}
              {columnTasks.map((task) => (
                <TaskCard key={task.id} task={task} />
              ))}

              {/* Empty State */}
              {columnTasks.length === 0 && (
                <div className="flex flex-col items-center justify-center h-32 text-muted-foreground">
                  <p className="text-sm">No tasks</p>
                  <p className="text-xs">{column.description.toLowerCase()}</p>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default TaskKanbanBoard;