
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Brain, Lightbulb, AlertCircle, TrendingUp, ArrowRight, Sparkles } from 'lucide-react';

const insights = [
  {
    id: 1,
    type: "optimization",
    title: "Case Settlement Opportunity",
    description: "AI analysis suggests Johnson v. Smith case has 85% settlement probability based on similar precedents.",
    priority: "high",
    timeframe: "Next 7 days",
    icon: Lightbulb,
    confidence: "85%"
  },
  {
    id: 2,
    type: "risk",
    title: "Compliance Deadline Alert",
    description: "Acme Corp merger requires additional SEC filings within 14 days to avoid penalties.",
    priority: "urgent",
    timeframe: "14 days",
    icon: AlertCircle,
    confidence: "95%"
  },
  {
    id: 3,
    type: "efficiency",
    title: "Document Review Automation",
    description: "Contract review process can be 40% faster using AI-assisted clause analysis.",
    priority: "medium",
    timeframe: "Ongoing",
    icon: TrendingUp,
    confidence: "78%"
  }
];

const AIInsightsFeed = () => {
  const getPriorityConfig = (priority: string) => {
    switch (priority) {
      case 'urgent': 
        return {
          variant: 'destructive' as const,
          cardBg: 'bg-red-50/50',
          cardBorder: 'border-red-200'
        };
      case 'high': 
        return {
          variant: 'secondary' as const,
          cardBg: 'bg-orange-50/50',
          cardBorder: 'border-orange-200'
        };
      case 'medium': 
        return {
          variant: 'outline' as const,
          cardBg: 'bg-blue-50/50',
          cardBorder: 'border-blue-200'
        };
      default: 
        return {
          variant: 'outline' as const,
          cardBg: 'bg-gray-50/50',
          cardBorder: 'border-gray-200'
        };
    }
  };

  const getTypeConfig = (type: string) => {
    switch (type) {
      case 'optimization': 
        return {
          iconBg: 'bg-green-100',
          iconColor: 'text-green-600',
          label: 'Optimization'
        };
      case 'risk': 
        return {
          iconBg: 'bg-orange-100',
          iconColor: 'text-orange-600',
          label: 'Risk Alert'
        };
      case 'efficiency': 
        return {
          iconBg: 'bg-blue-100',
          iconColor: 'text-blue-600',
          label: 'Efficiency'
        };
      default: 
        return {
          iconBg: 'bg-gray-100',
          iconColor: 'text-gray-600',
          label: type
        };
    }
  };

  return (
    <Card className="h-full">
      <CardHeader className="pb-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-primary" />
            <div>
              <CardTitle className="text-lg font-semibold">AI Insights Feed</CardTitle>
              <CardDescription className="text-sm mt-1">
                Intelligent recommendations and automated alerts
              </CardDescription>
            </div>
          </div>
          <Badge variant="outline" className="text-xs font-medium w-fit flex items-center gap-1">
            <Sparkles className="h-3 w-3" />
            AI Powered
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-3">
        {insights.map((insight) => {
          const IconComponent = insight.icon;
          const priorityConfig = getPriorityConfig(insight.priority);
          const typeConfig = getTypeConfig(insight.type);
          
          return (
            <Card 
              key={insight.id} 
              className={`${priorityConfig.cardBg} ${priorityConfig.cardBorder} border transition-all duration-200 hover:shadow-md cursor-pointer`}
            >
              <CardContent className="p-4">
                <div className="space-y-3">
                  {/* Icon, Title and Priority */}
                  <div className="flex items-start gap-3">
                    <div className={`${typeConfig.iconBg} ${typeConfig.iconColor} p-2 rounded-lg flex-shrink-0`}>
                      <IconComponent className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                        <h4 className="font-medium text-sm leading-tight">
                          {insight.title}
                        </h4>
                        <Badge variant={priorityConfig.variant} className="text-xs w-fit">
                          {insight.priority.toUpperCase()}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  
                  {/* Description */}
                  <p className="text-xs text-muted-foreground leading-relaxed pl-11">
                    {insight.description}
                  </p>
                  
                  {/* Metadata */}
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pl-11">
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span>Timeframe: {insight.timeframe}</span>
                      <span className="hidden sm:inline">•</span>
                      <span className="font-medium">Confidence: {insight.confidence}</span>
                    </div>
                    <Badge variant="outline" className="text-xs w-fit">
                      {typeConfig.label}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
        
        <Button variant="outline" className="w-full mt-4 text-sm">
          <span>View All Insights</span>
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </CardContent>
    </Card>
  );
};

export default AIInsightsFeed;
