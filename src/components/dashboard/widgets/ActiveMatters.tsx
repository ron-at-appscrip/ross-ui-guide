
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Folder, Users, DollarSign, ArrowRight, Activity } from 'lucide-react';

const matters = [
  {
    id: 1,
    title: "Johnson v. Smith Litigation",
    client: "Johnson Industries",
    status: "discovery",
    progress: 65,
    value: "$250,000",
    lastActivity: "2 hours ago",
    urgency: "medium"
  },
  {
    id: 2,
    title: "Acme Corp Merger & Acquisition",
    client: "Acme Corporation",
    status: "due-diligence",
    progress: 40,
    value: "$2.5M",
    lastActivity: "1 day ago",
    urgency: "high"
  },
  {
    id: 3,
    title: "Estate Planning - Williams Family",
    client: "Williams Family Trust",
    status: "drafting",
    progress: 80,
    value: "$75,000",
    lastActivity: "3 hours ago",
    urgency: "low"
  }
];

const ActiveMatters = () => {
  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'discovery': 
        return {
          variant: 'secondary' as const,
          cardBg: 'bg-blue-50/50',
          cardBorder: 'border-blue-200',
          label: 'Discovery Phase'
        };
      case 'due-diligence': 
        return {
          variant: 'default' as const,
          cardBg: 'bg-purple-50/50',
          cardBorder: 'border-purple-200',
          label: 'Due Diligence'
        };
      case 'drafting': 
        return {
          variant: 'outline' as const,
          cardBg: 'bg-green-50/50',
          cardBorder: 'border-green-200',
          label: 'Document Drafting'
        };
      default: 
        return {
          variant: 'outline' as const,
          cardBg: 'bg-gray-50/50',
          cardBorder: 'border-gray-200',
          label: status
        };
    }
  };

  const getProgressColor = (progress: number) => {
    if (progress >= 80) return 'bg-green-500';
    if (progress >= 60) return 'bg-blue-500';
    if (progress >= 40) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <Card className="h-full">
      <CardHeader className="pb-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center gap-2">
            <Folder className="h-5 w-5 text-primary" />
            <div>
              <CardTitle className="text-lg font-semibold">Active Matters</CardTitle>
              <CardDescription className="text-sm mt-1">
                Current cases and their progress status
              </CardDescription>
            </div>
          </div>
          <Badge variant="outline" className="text-xs font-medium w-fit">
            {matters.length} Active
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-3">
        {matters.map((matter) => {
          const statusConfig = getStatusConfig(matter.status);
          
          return (
            <Card 
              key={matter.id} 
              className={`${statusConfig.cardBg} ${statusConfig.cardBorder} border transition-all duration-200 hover:shadow-md cursor-pointer`}
            >
              <CardContent className="p-4">
                <div className="space-y-3">
                  {/* Title and Status */}
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                    <h4 className="font-medium text-sm leading-tight flex-1">
                      {matter.title}
                    </h4>
                    <Badge variant={statusConfig.variant} className="text-xs w-fit">
                      {statusConfig.label}
                    </Badge>
                  </div>
                  
                  {/* Client and Value */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Users className="h-3 w-3" />
                      <span>{matter.client}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <DollarSign className="h-3 w-3" />
                      <span className="font-medium">{matter.value}</span>
                    </div>
                  </div>

                  {/* Progress */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-muted-foreground">Progress</span>
                      <span className="font-medium">{matter.progress}%</span>
                    </div>
                    <div className="relative">
                      <Progress value={matter.progress} className="h-2" />
                    </div>
                  </div>

                  {/* Last Activity */}
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Activity className="h-3 w-3" />
                    <span>Last activity: {matter.lastActivity}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
        
        <Button variant="outline" className="w-full mt-4 text-sm">
          <span>View All Matters</span>
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </CardContent>
    </Card>
  );
};

export default ActiveMatters;
