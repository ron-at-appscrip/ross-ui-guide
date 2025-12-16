
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Clock, FileText, Users, Mail, Calendar } from 'lucide-react';

const activities = [
  {
    id: 1,
    type: "document",
    title: "Contract amendment uploaded",
    description: "Acme Corp - Service Agreement v2.1",
    time: "2 minutes ago",
    user: "Sarah Chen",
    icon: FileText
  },
  {
    id: 2,
    type: "meeting",
    title: "Client consultation completed",
    description: "Williams Family Trust - Estate planning review",
    time: "1 hour ago",
    user: "Michael Rodriguez",
    icon: Users
  },
  {
    id: 3,
    type: "communication",
    title: "Email sent to opposing counsel",
    description: "Johnson v. Smith - Settlement proposal",
    time: "3 hours ago",
    user: "Jessica Thompson",
    icon: Mail
  },
  {
    id: 4,
    type: "calendar",
    title: "Deposition scheduled",
    description: "Johnson v. Smith - Witness testimony",
    time: "5 hours ago",
    user: "David Kim",
    icon: Calendar
  },
  {
    id: 5,
    type: "document",
    title: "Legal brief filed",
    description: "Motion to dismiss - Case #2024-CV-1234",
    time: "1 day ago",
    user: "Sarah Chen",
    icon: FileText
  }
];

const RecentActivityTimeline = () => {
  const getActivityColor = (type: string) => {
    switch (type) {
      case 'document': return 'text-blue-600';
      case 'meeting': return 'text-green-600';
      case 'communication': return 'text-purple-600';
      case 'calendar': return 'text-orange-600';
      default: return 'text-gray-600';
    }
  };

  const getActivityBadge = (type: string) => {
    switch (type) {
      case 'document': return 'Document';
      case 'meeting': return 'Meeting';
      case 'communication': return 'Communication';
      case 'calendar': return 'Calendar';
      default: return 'Activity';
    }
  };

  return (
    <Card className="animate-fade-in">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5 text-primary" />
          Recent Activity
        </CardTitle>
        <CardDescription>
          Latest updates across your matters
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {activities.map((activity, index) => {
          const IconComponent = activity.icon;
          return (
            <div key={activity.id}>
              <div className="flex items-start gap-3 p-2 hover:bg-muted/50 transition-colors rounded-lg">
                <div className={`mt-1 ${getActivityColor(activity.type)}`}>
                  <IconComponent className="h-4 w-4" />
                </div>
                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium text-sm">{activity.title}</h4>
                    <span className="text-xs text-muted-foreground">{activity.time}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">{activity.description}</p>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">
                      {getActivityBadge(activity.type)}
                    </Badge>
                    <span className="text-xs text-muted-foreground">by {activity.user}</span>
                  </div>
                </div>
              </div>
              {index < activities.length - 1 && (
                <Separator className="my-2 ml-7" />
              )}
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
};

export default RecentActivityTimeline;
