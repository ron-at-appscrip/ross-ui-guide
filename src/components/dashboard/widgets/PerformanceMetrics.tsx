
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, Users, Clock, DollarSign, FileText } from 'lucide-react';

const metrics = [
  {
    id: 1,
    title: "Active Clients",
    value: "47",
    change: "+12%",
    trend: "up",
    icon: Users,
    timeframe: "vs last month"
  },
  {
    id: 2,
    title: "Billable Hours",
    value: "186.5",
    change: "+8%",
    trend: "up",
    icon: Clock,
    timeframe: "this month"
  },
  {
    id: 3,
    title: "Collection Rate",
    value: "94.2%",
    change: "-2%",
    trend: "down",
    icon: DollarSign,
    timeframe: "vs last quarter"
  },
  {
    id: 4,
    title: "Documents Generated",
    value: "234",
    change: "+23%",
    trend: "up",
    icon: FileText,
    timeframe: "this month"
  }
];

const PerformanceMetrics = () => {
  return (
    <Card className="animate-fade-in">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-primary" />
          Performance Metrics
        </CardTitle>
        <CardDescription>
          Key performance indicators for your practice
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          {metrics.map((metric) => {
            const IconComponent = metric.icon;
            const TrendIcon = metric.trend === 'up' ? TrendingUp : TrendingDown;
            const trendColor = metric.trend === 'up' ? 'text-green-600' : 'text-red-600';
            
            return (
              <div 
                key={metric.id} 
                className="p-4 border rounded-lg hover:bg-muted/50 transition-all duration-200 hover-scale"
              >
                <div className="flex items-center justify-between mb-2">
                  <IconComponent className="h-4 w-4 text-muted-foreground" />
                  <div className={`flex items-center gap-1 text-xs ${trendColor}`}>
                    <TrendIcon className="h-3 w-3" />
                    {metric.change}
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="text-2xl font-bold">{metric.value}</div>
                  <div className="text-xs text-muted-foreground">{metric.title}</div>
                  <div className="text-xs text-muted-foreground">{metric.timeframe}</div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

export default PerformanceMetrics;
