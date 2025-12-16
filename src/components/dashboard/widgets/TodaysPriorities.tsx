
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Clock, AlertTriangle, Calendar, ArrowRight } from 'lucide-react';

const priorities = [
  {
    id: 1,
    title: "Review contract amendments for Acme Corp",
    deadline: "Today, 3:00 PM",
    priority: "high",
    type: "Review",
    timeLeft: "2 hours left"
  },
  {
    id: 2,
    title: "Prepare witness statement for Johnson v. Smith",
    deadline: "Tomorrow, 10:00 AM",
    priority: "medium",
    type: "Preparation",
    timeLeft: "18 hours left"
  },
  {
    id: 3,
    title: "Client meeting: Estate planning consultation",
    deadline: "Today, 4:30 PM",
    priority: "high",
    type: "Meeting",
    timeLeft: "3.5 hours left"
  }
];

const TodaysPriorities = () => {
  const getPriorityStyles = (priority: string) => {
    switch (priority) {
      case 'high': 
        return {
          badgeVariant: 'destructive' as const,
          cardBorder: 'border-red-200',
          cardBg: 'bg-red-50/50',
          timeColor: 'text-red-600'
        };
      case 'medium': 
        return {
          badgeVariant: 'secondary' as const,
          cardBorder: 'border-yellow-200',
          cardBg: 'bg-yellow-50/50',
          timeColor: 'text-yellow-600'
        };
      default: 
        return {
          badgeVariant: 'outline' as const,
          cardBorder: 'border-gray-200',
          cardBg: 'bg-gray-50/50',
          timeColor: 'text-gray-600'
        };
    }
  };

  const todayCount = priorities.filter(p => p.deadline.includes('Today')).length;

  return (
    <Card className="h-full">
      <CardHeader className="pb-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-primary" />
            <div>
              <CardTitle className="text-lg font-semibold">Today's Priorities</CardTitle>
              <CardDescription className="text-sm mt-1">
                Critical tasks and deadlines requiring immediate attention
              </CardDescription>
            </div>
          </div>
          <Badge variant="outline" className="text-xs font-medium w-fit">
            {todayCount} Due Today
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-3">
        {priorities.map((item) => {
          const styles = getPriorityStyles(item.priority);
          
          return (
            <Card 
              key={item.id} 
              className={`${styles.cardBg} ${styles.cardBorder} border transition-all duration-200 hover:shadow-md cursor-pointer`}
            >
              <CardContent className="p-4">
                <div className="space-y-3">
                  {/* Priority and Type Badges */}
                  <div className="flex flex-wrap gap-2">
                    <Badge variant={styles.badgeVariant} className="text-xs">
                      {item.priority.toUpperCase()}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      {item.type}
                    </Badge>
                  </div>
                  
                  {/* Title */}
                  <div className="flex items-start gap-2">
                    {item.priority === 'high' && (
                      <AlertTriangle className="h-4 w-4 text-destructive mt-0.5 flex-shrink-0" />
                    )}
                    <h4 className="font-medium text-sm leading-tight">
                      {item.title}
                    </h4>
                  </div>
                  
                  {/* Deadline and Time Left */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      <span>{item.deadline}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      <span className={item.priority === 'high' ? styles.timeColor : ''}>
                        {item.timeLeft}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
        
        <Button variant="outline" className="w-full mt-4 text-sm">
          <span>View All Tasks</span>
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </CardContent>
    </Card>
  );
};

export default TodaysPriorities;
