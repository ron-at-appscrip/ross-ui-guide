
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, FileText, Clock, Calendar, Users, Mail, Calculator, Search } from 'lucide-react';

const quickActions = [
  {
    id: 1,
    title: "New Matter",
    description: "Create a new case or matter",
    icon: Plus,
    category: "Primary",
    color: "text-blue-600",
    bgColor: "bg-blue-50 hover:bg-blue-100",
    borderColor: "border-blue-200"
  },
  {
    id: 2,
    title: "Draft Document",
    description: "Generate legal documents with AI",
    icon: FileText,
    category: "Documents",
    color: "text-green-600",
    bgColor: "bg-green-50 hover:bg-green-100",
    borderColor: "border-green-200"
  },
  {
    id: 3,
    title: "Start Timer",
    description: "Begin time tracking for billable work",
    icon: Clock,
    category: "Billing",
    color: "text-orange-600",
    bgColor: "bg-orange-50 hover:bg-orange-100",
    borderColor: "border-orange-200"
  },
  {
    id: 4,
    title: "Schedule Meeting",
    description: "Book client consultations",
    icon: Calendar,
    category: "Calendar",
    color: "text-purple-600",
    bgColor: "bg-purple-50 hover:bg-purple-100",
    borderColor: "border-purple-200"
  },
  {
    id: 5,
    title: "Add Client",
    description: "Register new client information",
    icon: Users,
    category: "Clients",
    color: "text-teal-600",
    bgColor: "bg-teal-50 hover:bg-teal-100",
    borderColor: "border-teal-200"
  },
  {
    id: 6,
    title: "Send Email",
    description: "Compose client communications",
    icon: Mail,
    category: "Communication",
    color: "text-red-600",
    bgColor: "bg-red-50 hover:bg-red-100",
    borderColor: "border-red-200"
  },
  {
    id: 7,
    title: "Calculate Fees",
    description: "Generate billing estimates",
    icon: Calculator,
    category: "Billing",
    color: "text-indigo-600",
    bgColor: "bg-indigo-50 hover:bg-indigo-100",
    borderColor: "border-indigo-200"
  },
  {
    id: 8,
    title: "Search Cases",
    description: "Find matters and precedents",
    icon: Search,
    category: "Research",
    color: "text-pink-600",
    bgColor: "bg-pink-50 hover:bg-pink-100",
    borderColor: "border-pink-200"
  }
];

const QuickActions = () => {
  return (
    <Card className="animate-fade-in glass-card">
      <CardHeader className="pb-6">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-2xl font-semibold text-foreground mb-2">Quick Actions</CardTitle>
            <CardDescription className="text-base text-muted-foreground">
              Streamlined access to common tasks and workflows
            </CardDescription>
          </div>
          <Badge variant="outline" className="text-sm font-medium px-3 py-1">
            8 Actions
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {quickActions.map((action, index) => {
            const IconComponent = action.icon;
            return (
              <Card
                key={action.id}
                className={`group cursor-pointer transition-all duration-300 hover:shadow-lg hover:scale-[1.02] ${action.bgColor} ${action.borderColor} border-2 hover:border-opacity-60 animate-fade-in`}
                style={{ 
                  animationDelay: `${index * 50}ms`,
                  animationFillMode: 'both'
                }}
              >
                <CardContent className="p-6 space-y-4">
                  <div className="flex items-start justify-between">
                    <div className={`p-3 rounded-xl ${action.bgColor.replace('hover:', '')} ${action.color} group-hover:scale-110 transition-transform duration-200`}>
                      <IconComponent className="h-6 w-6" />
                    </div>
                    <Badge 
                      variant="secondary" 
                      className="text-xs font-medium px-2 py-1 bg-white/80 text-gray-600 border border-gray-200"
                    >
                      {action.category}
                    </Badge>
                  </div>
                  
                  <div className="space-y-2">
                    <h3 className="font-semibold text-lg text-foreground group-hover:text-opacity-90 transition-colors">
                      {action.title}
                    </h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {action.description}
                    </p>
                  </div>

                  <div className="pt-2">
                    <div className={`h-1 w-0 ${action.color.replace('text-', 'bg-')} rounded-full group-hover:w-full transition-all duration-300 ease-out`} />
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

export default QuickActions;
