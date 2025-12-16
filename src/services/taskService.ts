import { 
  Task, 
  TaskStatus, 
  TaskCategory, 
  NewTaskData, 
  TaskFilters, 
  TaskStats,
  TaskHistory,
  TaskComment,
  TaskAttachment,
  TaskReminder,
  LEGAL_TASK_TEMPLATES
} from '@/types/task';
import { addDays, addWeeks, addMonths, isAfter, isBefore, startOfDay, endOfDay } from 'date-fns';

export class TaskService {
  private static readonly STORAGE_KEY = 'ross_ai_tasks';
  private static readonly TASK_HISTORY_KEY = 'ross_ai_task_history';
  
  /**
   * Generate unique ID
   */
  private static generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  /**
   * Load tasks from localStorage
   */
  private static loadTasks(): Task[] {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Error loading tasks:', error);
      return [];
    }
  }

  /**
   * Save tasks to localStorage
   */
  private static saveTasks(tasks: Task[]): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(tasks));
    } catch (error) {
      console.error('Error saving tasks:', error);
    }
  }

  /**
   * Add history entry to task
   */
  private static addHistoryEntry(
    task: Task, 
    action: TaskHistory['action'], 
    userId: string, 
    userName: string,
    changes?: Record<string, { from: any; to: any }>,
    comment?: string
  ): TaskHistory {
    const historyEntry: TaskHistory = {
      id: this.generateId(),
      action,
      userId,
      userName,
      timestamp: new Date().toISOString(),
      changes,
      comment
    };

    if (!task.history) {
      task.history = [];
    }
    task.history.unshift(historyEntry);
    
    return historyEntry;
  }

  /**
   * Create a new task
   */
  static async createTask(matterId: string, taskData: NewTaskData, userId: string, userName: string): Promise<Task> {
    await new Promise(resolve => setTimeout(resolve, 300));

    const newTask: Task = {
      id: this.generateId(),
      matterId,
      title: taskData.title,
      description: taskData.description,
      category: taskData.category,
      priority: taskData.priority,
      status: 'not_started',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      dueDate: taskData.dueDate,
      dueTime: taskData.dueTime,
      startDate: taskData.startDate,
      estimatedHours: taskData.estimatedHours,
      assignedTo: taskData.assignedTo,
      assignedBy: userId,
      assignedByName: userName,
      assignedAt: taskData.assignedTo ? new Date().toISOString() : undefined,
      tags: taskData.tags || [],
      recurrence: taskData.recurrence,
      dependencies: taskData.dependencies || [],
      reminders: taskData.reminders?.map(r => ({ ...r, id: this.generateId(), sent: false })) || [],
      customFields: taskData.customFields || {},
      history: []
    };

    // Add creation history
    this.addHistoryEntry(newTask, 'created', userId, userName);

    // If assigned, add assignment history
    if (taskData.assignedTo) {
      this.addHistoryEntry(newTask, 'assigned', userId, userName, {
        assignedTo: { from: null, to: taskData.assignedTo }
      });
    }

    const tasks = this.loadTasks();
    tasks.unshift(newTask);
    this.saveTasks(tasks);

    // Handle recurring tasks
    if (taskData.recurrence) {
      await this.createRecurringTasks(newTask, userId, userName);
    }

    return newTask;
  }

  /**
   * Update an existing task
   */
  static async updateTask(taskId: string, updates: Partial<Task>, userId: string, userName: string): Promise<Task | null> {
    await new Promise(resolve => setTimeout(resolve, 200));

    const tasks = this.loadTasks();
    const index = tasks.findIndex(t => t.id === taskId);
    
    if (index === -1) {
      throw new Error(`Task with ID ${taskId} not found`);
    }

    const oldTask = { ...tasks[index] };
    const changes: Record<string, { from: any; to: any }> = {};

    // Track changes for history
    Object.keys(updates).forEach(key => {
      if (oldTask[key as keyof Task] !== updates[key as keyof Task]) {
        changes[key] = {
          from: oldTask[key as keyof Task],
          to: updates[key as keyof Task]
        };
      }
    });

    tasks[index] = {
      ...tasks[index],
      ...updates,
      updatedAt: new Date().toISOString(),
      lastModifiedBy: userId
    };

    // Add history entry
    this.addHistoryEntry(tasks[index], 'updated', userId, userName, changes);

    // Special handling for status changes
    if (updates.status === 'completed' && oldTask.status !== 'completed') {
      tasks[index].completedAt = new Date().toISOString();
      tasks[index].actualHours = tasks[index].actualHours || tasks[index].estimatedHours;
      this.addHistoryEntry(tasks[index], 'completed', userId, userName);
      
      // Check for dependent tasks
      await this.handleTaskCompletion(tasks[index], userId, userName);
    } else if (oldTask.status === 'completed' && updates.status !== 'completed') {
      tasks[index].completedAt = undefined;
      this.addHistoryEntry(tasks[index], 'reopened', userId, userName);
    }

    // Handle assignment changes
    if (updates.assignedTo && updates.assignedTo !== oldTask.assignedTo) {
      tasks[index].assignedAt = new Date().toISOString();
      tasks[index].assignedBy = userId;
      tasks[index].assignedByName = userName;
      this.addHistoryEntry(tasks[index], 'assigned', userId, userName, {
        assignedTo: { from: oldTask.assignedTo, to: updates.assignedTo }
      });
    }

    this.saveTasks(tasks);
    return tasks[index];
  }

  /**
   * Delete a task
   */
  static async deleteTask(taskId: string): Promise<boolean> {
    await new Promise(resolve => setTimeout(resolve, 200));

    const tasks = this.loadTasks();
    const index = tasks.findIndex(t => t.id === taskId);
    
    if (index === -1) {
      return false;
    }

    tasks.splice(index, 1);
    this.saveTasks(tasks);
    return true;
  }

  /**
   * Get tasks for a specific matter
   */
  static async getTasksByMatter(matterId: string, filters?: TaskFilters): Promise<Task[]> {
    await new Promise(resolve => setTimeout(resolve, 200));

    let tasks = this.loadTasks().filter(t => t.matterId === matterId);
    
    if (filters) {
      tasks = this.applyFilters(tasks, filters);
    }

    return tasks.sort((a, b) => {
      // Sort by priority first, then due date
      const priorityOrder = { urgent: 0, high: 1, medium: 2, low: 3 };
      const priorityDiff = priorityOrder[a.priority] - priorityOrder[b.priority];
      
      if (priorityDiff !== 0) return priorityDiff;
      
      if (a.dueDate && b.dueDate) {
        return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
      }
      
      return 0;
    });
  }

  /**
   * Get all tasks with optional filtering
   */
  static async getTasks(filters?: TaskFilters): Promise<Task[]> {
    await new Promise(resolve => setTimeout(resolve, 200));

    let tasks = this.loadTasks();
    
    if (filters) {
      tasks = this.applyFilters(tasks, filters);
    }

    return tasks;
  }

  /**
   * Apply filters to task list
   */
  private static applyFilters(tasks: Task[], filters: TaskFilters): Task[] {
    return tasks.filter(task => {
      if (filters.status && filters.status.length > 0 && !filters.status.includes(task.status)) {
        return false;
      }
      
      if (filters.priority && filters.priority.length > 0 && !filters.priority.includes(task.priority)) {
        return false;
      }
      
      if (filters.category && filters.category.length > 0 && !filters.category.includes(task.category)) {
        return false;
      }
      
      if (filters.assignedTo && filters.assignedTo.length > 0 && (!task.assignedTo || !filters.assignedTo.includes(task.assignedTo))) {
        return false;
      }
      
      if (filters.matterId && task.matterId !== filters.matterId) {
        return false;
      }
      
      if (filters.dueDate) {
        if (!task.dueDate) return false;
        const taskDate = new Date(task.dueDate);
        const startDate = new Date(filters.dueDate.start);
        const endDate = new Date(filters.dueDate.end);
        if (taskDate < startDate || taskDate > endDate) {
          return false;
        }
      }
      
      if (filters.tags && filters.tags.length > 0) {
        if (!task.tags || !filters.tags.some(tag => task.tags?.includes(tag))) {
          return false;
        }
      }
      
      if (filters.hasAttachments !== undefined) {
        const hasAttachments = task.attachments && task.attachments.length > 0;
        if (filters.hasAttachments !== hasAttachments) {
          return false;
        }
      }
      
      if (filters.isOverdue !== undefined) {
        const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'completed';
        if (filters.isOverdue !== isOverdue) {
          return false;
        }
      }
      
      if (filters.isRecurring !== undefined) {
        const isRecurring = !!task.recurrence;
        if (filters.isRecurring !== isRecurring) {
          return false;
        }
      }
      
      return true;
    });
  }

  /**
   * Add comment to task
   */
  static async addComment(
    taskId: string, 
    text: string, 
    userId: string, 
    userName: string,
    mentions?: string[],
    attachments?: TaskAttachment[]
  ): Promise<TaskComment> {
    await new Promise(resolve => setTimeout(resolve, 200));

    const tasks = this.loadTasks();
    const task = tasks.find(t => t.id === taskId);
    
    if (!task) {
      throw new Error(`Task with ID ${taskId} not found`);
    }

    const comment: TaskComment = {
      id: this.generateId(),
      text,
      authorId: userId,
      authorName: userName,
      createdAt: new Date().toISOString(),
      mentions,
      attachments
    };

    if (!task.comments) {
      task.comments = [];
    }
    task.comments.push(comment);

    this.addHistoryEntry(task, 'commented', userId, userName, undefined, text);
    task.updatedAt = new Date().toISOString();

    this.saveTasks(tasks);
    return comment;
  }

  /**
   * Get task statistics
   */
  static async getTaskStats(matterId?: string): Promise<TaskStats> {
    await new Promise(resolve => setTimeout(resolve, 200));

    let tasks = this.loadTasks();
    
    if (matterId) {
      tasks = tasks.filter(t => t.matterId === matterId);
    }

    const now = new Date();
    const todayStart = startOfDay(now);
    const todayEnd = endOfDay(now);
    const weekStart = addDays(todayStart, -7);

    const stats: TaskStats = {
      total: tasks.length,
      byStatus: {
        not_started: 0,
        in_progress: 0,
        completed: 0,
        cancelled: 0,
        blocked: 0
      },
      byPriority: {
        low: 0,
        medium: 0,
        high: 0,
        urgent: 0
      },
      overdue: 0,
      dueToday: 0,
      dueThisWeek: 0,
      completedThisWeek: 0,
      averageCompletionTime: 0
    };

    let totalCompletionTime = 0;
    let completedCount = 0;

    tasks.forEach(task => {
      // Status counts
      stats.byStatus[task.status]++;
      
      // Priority counts
      stats.byPriority[task.priority]++;
      
      // Due date analysis
      if (task.dueDate) {
        const dueDate = new Date(task.dueDate);
        
        if (dueDate < now && task.status !== 'completed') {
          stats.overdue++;
        }
        
        if (dueDate >= todayStart && dueDate <= todayEnd) {
          stats.dueToday++;
        }
        
        if (dueDate >= weekStart && dueDate <= todayEnd) {
          stats.dueThisWeek++;
        }
      }
      
      // Completion analysis
      if (task.completedAt) {
        const completedDate = new Date(task.completedAt);
        
        if (completedDate >= weekStart) {
          stats.completedThisWeek++;
        }
        
        if (task.createdAt) {
          const completionTime = completedDate.getTime() - new Date(task.createdAt).getTime();
          totalCompletionTime += completionTime;
          completedCount++;
        }
      }
    });

    // Calculate average completion time in hours
    if (completedCount > 0) {
      stats.averageCompletionTime = (totalCompletionTime / completedCount) / (1000 * 60 * 60);
    }

    return stats;
  }

  /**
   * Create recurring tasks based on recurrence pattern
   */
  private static async createRecurringTasks(
    originalTask: Task, 
    userId: string, 
    userName: string
  ): Promise<void> {
    if (!originalTask.recurrence || !originalTask.dueDate) return;

    const { pattern, endDate, maxOccurrences } = originalTask.recurrence;
    const tasks: Task[] = [];
    let currentDate = new Date(originalTask.dueDate);
    let occurrences = 1;

    while (occurrences < (maxOccurrences || 52)) { // Default max 52 occurrences (1 year for weekly)
      // Calculate next date based on pattern
      switch (pattern) {
        case 'daily':
          currentDate = addDays(currentDate, 1);
          break;
        case 'weekly':
          currentDate = addWeeks(currentDate, 1);
          break;
        case 'biweekly':
          currentDate = addWeeks(currentDate, 2);
          break;
        case 'monthly':
          currentDate = addMonths(currentDate, 1);
          break;
        case 'quarterly':
          currentDate = addMonths(currentDate, 3);
          break;
        case 'yearly':
          currentDate = addMonths(currentDate, 12);
          break;
      }

      // Check if we've passed the end date
      if (endDate && currentDate > new Date(endDate)) {
        break;
      }

      // Create recurring task
      const recurringTask: Task = {
        ...originalTask,
        id: this.generateId(),
        dueDate: currentDate.toISOString().split('T')[0],
        status: 'not_started',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        completedAt: undefined,
        history: []
      };

      this.addHistoryEntry(recurringTask, 'created', userId, userName, undefined, 'Created as recurring task');
      tasks.push(recurringTask);
      occurrences++;
    }

    // Save all recurring tasks
    const allTasks = this.loadTasks();
    allTasks.push(...tasks);
    this.saveTasks(allTasks);
  }

  /**
   * Handle task completion and dependent tasks
   */
  private static async handleTaskCompletion(
    completedTask: Task, 
    userId: string, 
    userName: string
  ): Promise<void> {
    const tasks = this.loadTasks();
    
    // Find tasks that depend on this completed task
    const dependentTasks = tasks.filter(task => 
      task.dependencies?.some(dep => dep.dependsOnTaskId === completedTask.id)
    );

    for (const dependentTask of dependentTasks) {
      // Check if all dependencies are met
      const allDependenciesMet = dependentTask.dependencies?.every(dep => {
        const depTask = tasks.find(t => t.id === dep.dependsOnTaskId);
        return depTask?.status === 'completed';
      });

      if (allDependenciesMet && dependentTask.status === 'blocked') {
        // Update task status from blocked to not_started
        await this.updateTask(
          dependentTask.id, 
          { 
            status: 'not_started',
            blockedBy: dependentTask.blockedBy?.filter(id => id !== completedTask.id)
          }, 
          userId, 
          userName
        );
      }
    }
  }

  /**
   * Get task templates for a practice area
   */
  static getTaskTemplates(practiceArea?: string): Partial<Task>[] {
    // In a real app, this would filter templates by practice area
    return LEGAL_TASK_TEMPLATES;
  }

  /**
   * Bulk create tasks from template
   */
  static async createTasksFromTemplate(
    matterId: string,
    templates: Partial<Task>[],
    userId: string,
    userName: string
  ): Promise<Task[]> {
    const createdTasks: Task[] = [];

    for (const template of templates) {
      const taskData: NewTaskData = {
        title: template.title || 'Untitled Task',
        description: template.description,
        category: template.category || 'other',
        priority: template.priority || 'medium',
        estimatedHours: template.estimatedHours,
        tags: template.tags,
        recurrence: template.recurrence
      };

      const task = await this.createTask(matterId, taskData, userId, userName);
      createdTasks.push(task);
    }

    return createdTasks;
  }

  /**
   * Get overdue tasks
   */
  static async getOverdueTasks(matterId?: string): Promise<Task[]> {
    const filters: TaskFilters = {
      isOverdue: true,
      matterId
    };

    return this.getTasks(filters);
  }

  /**
   * Get tasks due today
   */
  static async getTasksDueToday(matterId?: string): Promise<Task[]> {
    const today = new Date();
    const filters: TaskFilters = {
      dueDate: {
        start: startOfDay(today).toISOString(),
        end: endOfDay(today).toISOString()
      },
      matterId
    };

    return this.getTasks(filters);
  }
}

export const taskService = TaskService;