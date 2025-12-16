import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { 
  CheckCircle, 
  Clock, 
  AlertTriangle, 
  TrendingUp,
  Calendar,
  Users,
  Target
} from 'lucide-react';
import { TaskStats } from '@/types/task';

interface TaskStatsCardsProps {
  stats: TaskStats;
}

const TaskStatsCards: React.FC<TaskStatsCardsProps> = ({ stats }) => {
  const completionRate = stats.total > 0 ? (stats.byStatus.completed / stats.total) * 100 : 0;
  const inProgressRate = stats.total > 0 ? (stats.byStatus.in_progress / stats.total) * 100 : 0;

  const statCards = [
    {
      title: 'Total Tasks',
      value: stats.total,
      icon: Target,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      description: 'All tasks',
      trend: null
    },
    {
      title: 'Completed',
      value: stats.byStatus.completed,
      icon: CheckCircle,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      description: `${completionRate.toFixed(1)}% completion rate`,
      trend: stats.completedThisWeek > 0 ? `+${stats.completedThisWeek} this week` : null
    },
    {
      title: 'In Progress',
      value: stats.byStatus.in_progress,
      icon: Clock,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      description: `${inProgressRate.toFixed(1)}% of total`,
      trend: null
    },
    {
      title: 'Overdue',
      value: stats.overdue,
      icon: AlertTriangle,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
      description: 'Need attention',
      trend: stats.overdue > 0 ? 'Action required' : 'All on track'
    },
    {
      title: 'Due Today',
      value: stats.dueToday,
      icon: Calendar,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      description: 'Tasks due today',
      trend: null
    },
    {
      title: 'Avg. Completion Time',
      value: stats.averageCompletionTime > 0 ? `${stats.averageCompletionTime.toFixed(1)}h` : '-',
      icon: TrendingUp,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      description: 'Hours per task',
      trend: null
    }
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
      {statCards.map((stat, index) => {
        const Icon = stat.icon;
        
        return (
          <Card key={index} className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                  <Icon className={`h-4 w-4 ${stat.color}`} />
                </div>
                {stat.title === 'Completed' && stats.total > 0 && (
                  <Progress 
                    value={completionRate} 
                    className="w-8 h-2" 
                  />
                )}
              </div>
              
              <div className="space-y-1">
                <p className="text-2xl font-bold">
                  {typeof stat.value === 'number' ? stat.value.toLocaleString() : stat.value}
                </p>
                <p className="text-xs font-medium text-muted-foreground">
                  {stat.title}
                </p>
                <p className="text-xs text-muted-foreground">
                  {stat.description}
                </p>
                {stat.trend && (
                  <p className={`text-xs font-medium ${
                    stat.title === 'Overdue' && stat.value > 0 
                      ? 'text-red-600' 
                      : 'text-green-600'
                  }`}>
                    {stat.trend}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default TaskStatsCards;