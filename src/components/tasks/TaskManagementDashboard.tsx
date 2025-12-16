import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Calendar,
  CheckCircle, 
  Clock, 
  Plus, 
  Filter,
  MoreHorizontal,
  AlertTriangle,
  Users,
  TrendingUp,
  ListTodo,
  LayoutGrid,
  CalendarDays
} from 'lucide-react';
import { Task, TaskStats, TaskStatus, TaskFilters } from '@/types/task';
import { TaskService } from '@/services/taskService';
import TaskKanbanBoard from './TaskKanbanBoard';
import TaskTimelineView from './TaskTimelineView';
import TaskListView from './TaskListView';
import TaskStatsCards from './TaskStatsCards';
import CreateTaskModal from './CreateTaskModal';
import TaskFilterModal from './TaskFilterModal';
import { useToast } from '@/hooks/use-toast';
import { initializeMockTasks } from '@/data/mockTasks';

interface TaskManagementDashboardProps {
  matterId?: string;
  matterTitle?: string;
  clientName?: string;
}

type ViewMode = 'list' | 'kanban' | 'timeline';

const TaskManagementDashboard: React.FC<TaskManagementDashboardProps> = ({
  matterId,
  matterTitle,
  clientName
}) => {
  const { toast } = useToast();
  
  // State management
  const [tasks, setTasks] = useState<Task[]>([]);
  const [stats, setStats] = useState<TaskStats | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('kanban');
  const [activeFilters, setActiveFilters] = useState<TaskFilters>({});
  const [loading, setLoading] = useState(true);
  
  // Modal states
  const [createTaskModal, setCreateTaskModal] = useState(false);
  const [filterModal, setFilterModal] = useState(false);

  // Initialize mock data and load tasks
  useEffect(() => {
    // Initialize mock data for testing (only if no tasks exist)
    initializeMockTasks();
    loadData();
  }, [matterId, activeFilters]);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Load tasks
      const fetchedTasks = matterId 
        ? await TaskService.getTasksByMatter(matterId, activeFilters)
        : await TaskService.getTasks(activeFilters);
      
      setTasks(fetchedTasks);
      
      // Load stats
      const fetchedStats = await TaskService.getTaskStats(matterId);
      setStats(fetchedStats);
      
    } catch (error) {
      console.error('Error loading task data:', error);
      toast({
        title: "Error",
        description: "Failed to load tasks. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleTaskUpdate = async (taskId: string, updates: Partial<Task>) => {
    try {
      const updatedTask = await TaskService.updateTask(
        taskId, 
        updates, 
        'current-user', // In real app, get from auth context
        'Current User'
      );
      
      if (updatedTask) {
        setTasks(prev => prev.map(t => t.id === taskId ? updatedTask : t));
        
        // Reload stats
        const newStats = await TaskService.getTaskStats(matterId);
        setStats(newStats);
        
        toast({
          title: "Task Updated",
          description: "Task has been updated successfully.",
        });
      }
    } catch (error) {
      console.error('Error updating task:', error);
      toast({
        title: "Error",
        description: "Failed to update task. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleTaskDelete = async (taskId: string) => {
    try {
      const success = await TaskService.deleteTask(taskId);
      
      if (success) {
        setTasks(prev => prev.filter(t => t.id !== taskId));
        
        // Reload stats
        const newStats = await TaskService.getTaskStats(matterId);
        setStats(newStats);
        
        toast({
          title: "Task Deleted",
          description: "Task has been deleted successfully.",
        });
      }
    } catch (error) {
      console.error('Error deleting task:', error);
      toast({
        title: "Error",
        description: "Failed to delete task. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleCreateTask = async (taskData: any) => {
    try {
      if (!matterId) {
        toast({
          title: "Error",
          description: "Matter ID is required to create tasks.",
          variant: "destructive"
        });
        return;
      }

      const newTask = await TaskService.createTask(
        matterId,
        taskData,
        'current-user', // In real app, get from auth context
        'Current User'
      );
      
      setTasks(prev => [newTask, ...prev]);
      
      // Reload stats
      const newStats = await TaskService.getTaskStats(matterId);
      setStats(newStats);
      
      toast({
        title: "Task Created",
        description: `Task "${taskData.title}" has been created successfully.`,
      });
    } catch (error) {
      console.error('Error creating task:', error);
      toast({
        title: "Error",
        description: "Failed to create task. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleApplyFilters = (filters: TaskFilters) => {
    setActiveFilters(filters);
    setFilterModal(false);
  };

  const getActiveFilterCount = () => {
    return Object.values(activeFilters).filter(value => {
      if (Array.isArray(value)) return value.length > 0;
      if (typeof value === 'object' && value !== null) return true;
      return value !== undefined && value !== null;
    }).length;
  };

  const getStatusColor = (status: TaskStatus): string => {
    const colors = {
      not_started: 'bg-gray-100 text-gray-800',
      in_progress: 'bg-blue-100 text-blue-800',
      completed: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800',
      blocked: 'bg-yellow-100 text-yellow-800'
    };
    return colors[status];
  };

  const getPriorityColor = (priority: string): string => {
    const colors = {
      low: 'bg-gray-100 text-gray-800',
      medium: 'bg-blue-100 text-blue-800',
      high: 'bg-orange-100 text-orange-800',
      urgent: 'bg-red-100 text-red-800'
    };
    return colors[priority as keyof typeof colors] || colors.medium;
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            {[...Array(4)].map((_, i) => (
              <Card key={i}>
                <CardContent className="p-6">
                  <div className="h-4 bg-muted rounded w-1/2 mb-2"></div>
                  <div className="h-8 bg-muted rounded w-1/3"></div>
                </CardContent>
              </Card>
            ))}
          </div>
          <Card>
            <CardContent className="p-6">
              <div className="h-64 bg-muted rounded"></div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">
            {matterId ? `Tasks - ${matterTitle}` : 'All Tasks'}
          </h1>
          {clientName && (
            <p className="text-muted-foreground">Client: {clientName}</p>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setFilterModal(true)}
            className="relative"
          >
            <Filter className="h-4 w-4 mr-2" />
            Filters
            {getActiveFilterCount() > 0 && (
              <Badge 
                variant="secondary" 
                className="ml-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
              >
                {getActiveFilterCount()}
              </Badge>
            )}
          </Button>
          
          {matterId && (
            <Button
              size="sm"
              onClick={() => setCreateTaskModal(true)}
            >
              <Plus className="h-4 w-4 mr-2" />
              New Task
            </Button>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      {stats && <TaskStatsCards stats={stats} />}

      {/* View Mode Selector */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <ListTodo className="h-5 w-5" />
              Tasks ({tasks.length})
            </CardTitle>
            
            <Tabs value={viewMode} onValueChange={(value) => setViewMode(value as ViewMode)}>
              <TabsList>
                <TabsTrigger value="list">
                  <ListTodo className="h-4 w-4 mr-2" />
                  List
                </TabsTrigger>
                <TabsTrigger value="kanban">
                  <LayoutGrid className="h-4 w-4 mr-2" />
                  Kanban
                </TabsTrigger>
                <TabsTrigger value="timeline">
                  <CalendarDays className="h-4 w-4 mr-2" />
                  Timeline
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </CardHeader>
        
        <CardContent>
          {/* Active Filters Display */}
          {getActiveFilterCount() > 0 && (
            <div className="mb-4 p-3 bg-muted rounded-lg">
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                <Filter className="h-4 w-4" />
                Active Filters:
              </div>
              <div className="flex flex-wrap gap-2">
                {activeFilters.status && activeFilters.status.length > 0 && (
                  <Badge variant="outline">
                    Status: {activeFilters.status.join(', ')}
                  </Badge>
                )}
                {activeFilters.priority && activeFilters.priority.length > 0 && (
                  <Badge variant="outline">
                    Priority: {activeFilters.priority.join(', ')}
                  </Badge>
                )}
                {activeFilters.category && activeFilters.category.length > 0 && (
                  <Badge variant="outline">
                    Category: {activeFilters.category.join(', ')}
                  </Badge>
                )}
                {activeFilters.assignedTo && activeFilters.assignedTo.length > 0 && (
                  <Badge variant="outline">
                    Assigned to: {activeFilters.assignedTo.length} people
                  </Badge>
                )}
                {activeFilters.isOverdue && (
                  <Badge variant="outline" className="bg-red-50 text-red-700">
                    Overdue Only
                  </Badge>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setActiveFilters({})}
                  className="h-6 px-2 text-xs"
                >
                  Clear All
                </Button>
              </div>
            </div>
          )}

          {/* Task Views */}
          {viewMode === 'list' && (
            <TaskListView
              tasks={tasks}
              onTaskUpdate={handleTaskUpdate}
              onTaskDelete={handleTaskDelete}
              getStatusColor={getStatusColor}
              getPriorityColor={getPriorityColor}
            />
          )}
          
          {viewMode === 'kanban' && (
            <TaskKanbanBoard
              tasks={tasks}
              onTaskUpdate={handleTaskUpdate}
              onTaskDelete={handleTaskDelete}
              getStatusColor={getStatusColor}
              getPriorityColor={getPriorityColor}
            />
          )}
          
          {viewMode === 'timeline' && (
            <TaskTimelineView
              tasks={tasks}
              onTaskUpdate={handleTaskUpdate}
              onTaskDelete={handleTaskDelete}
              getStatusColor={getStatusColor}
              getPriorityColor={getPriorityColor}
            />
          )}

          {/* Empty State */}
          {tasks.length === 0 && (
            <div className="text-center py-12">
              <ListTodo className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium text-muted-foreground mb-2">
                No tasks found
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                {getActiveFilterCount() > 0 
                  ? "Try adjusting your filters or create a new task."
                  : matterId 
                    ? "Get started by creating your first task for this matter."
                    : "No tasks have been created yet."
                }
              </p>
              {matterId && (
                <Button onClick={() => setCreateTaskModal(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create First Task
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modals */}
      {createTaskModal && (
        <CreateTaskModal
          open={createTaskModal}
          onClose={() => setCreateTaskModal(false)}
          onSubmit={handleCreateTask}
          matterId={matterId}
          matterTitle={matterTitle}
          clientName={clientName}
        />
      )}

      {filterModal && (
        <TaskFilterModal
          open={filterModal}
          onClose={() => setFilterModal(false)}
          onApply={handleApplyFilters}
          currentFilters={activeFilters}
          tasks={tasks}
        />
      )}
    </div>
  );
};

export default TaskManagementDashboard;