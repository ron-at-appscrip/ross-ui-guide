import React from 'react';
import { Client } from '@/types/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  AlertCircle, 
  Clock, 
  Briefcase,
  Calendar,
  FileText,
  Users,
  AlertTriangle
} from 'lucide-react';

interface ClientBusinessIntelligenceProps {
  client: Client;
  onQuickAction?: (action: string) => void;
}

const ClientBusinessIntelligence = ({ client, onQuickAction }: ClientBusinessIntelligenceProps) => {
  // Calculate business intelligence metrics
  const billingHealth = client.totalBilled > 0 ? client.outstandingBalance / client.totalBilled : 0;
  const paymentHealth = billingHealth < 0.1 ? 'excellent' : billingHealth < 0.3 ? 'good' : 'concerning';
  const matterUtilization = client.totalMatters > 0 ? client.activeMatters / client.totalMatters : 0;
  const avgMatterValue = client.totalMatters > 0 ? client.totalBilled / client.totalMatters : 0;
  
  // Risk assessment
  const riskFactors = [];
  if (client.outstandingBalance > 10000) riskFactors.push('High outstanding balance');
  if (client.activeMatters === 0) riskFactors.push('No active matters');
  if (billingHealth > 0.3) riskFactors.push('Payment delays');
  
  const riskLevel = riskFactors.length === 0 ? 'low' : riskFactors.length === 1 ? 'medium' : 'high';
  
  // Mock data for recent activity and trends
  const recentActivity = [
    { type: 'invoice', description: 'Invoice INV-2024-005 paid', date: '2 days ago', amount: '$5,500' },
    { type: 'matter', description: 'New matter opened: IP Portfolio Review', date: '1 week ago', amount: null },
    { type: 'communication', description: 'Client consultation call logged', date: '3 days ago', amount: null },
  ];

  const getRiskBadge = (risk: string) => {
    const variants = {
      low: { variant: 'default' as const, icon: '🟢', color: 'text-green-700' },
      medium: { variant: 'secondary' as const, icon: '🟡', color: 'text-yellow-700' },
      high: { variant: 'destructive' as const, icon: '🔴', color: 'text-red-700' }
    };
    
    const config = variants[risk as keyof typeof variants];
    return (
      <Badge variant={config.variant} className={`${config.color} font-medium`}>
        {config.icon} {risk.charAt(0).toUpperCase() + risk.slice(1)} Risk
      </Badge>
    );
  };

  const getHealthColor = (health: string) => {
    const colors = {
      excellent: 'text-green-600',
      good: 'text-blue-600',
      concerning: 'text-orange-600'
    };
    return colors[health as keyof typeof colors] || 'text-gray-600';
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
      {/* Financial Health Card */}
      <Card className="lg:col-span-1">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-semibold">Financial Health</CardTitle>
            {getRiskBadge(riskLevel)}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Revenue Overview */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-green-600" />
                <span className="text-sm text-muted-foreground">Total Billed</span>
              </div>
              <p className="text-2xl font-bold text-green-600">
                ${client.totalBilled.toLocaleString()}
              </p>
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-orange-600" />
                <span className="text-sm text-muted-foreground">Outstanding</span>
              </div>
              <p className="text-2xl font-bold text-orange-600">
                ${client.outstandingBalance.toLocaleString()}
              </p>
            </div>
          </div>
          
          {/* Payment Health Indicator */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Payment Health</span>
              <span className={`text-sm font-medium ${getHealthColor(paymentHealth)}`}>
                {paymentHealth.charAt(0).toUpperCase() + paymentHealth.slice(1)}
              </span>
            </div>
            <Progress 
              value={Math.max(0, 100 - (billingHealth * 100))} 
              className="h-2"
            />
          </div>

          {/* Average Matter Value */}
          <div className="pt-2 border-t">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Avg Matter Value</span>
              <span className="text-sm font-medium">${avgMatterValue.toLocaleString()}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Matter Portfolio Card */}
      <Card className="lg:col-span-1">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold">Matter Portfolio</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Matter Statistics */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Briefcase className="h-4 w-4 text-primary" />
                <span className="text-sm text-muted-foreground">Active</span>
              </div>
              <p className="text-2xl font-bold text-primary">
                {client.activeMatters}
              </p>
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Total</span>
              </div>
              <p className="text-2xl font-bold">
                {client.totalMatters}
              </p>
            </div>
          </div>

          {/* Matter Utilization */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Matter Utilization</span>
              <span className="text-sm font-medium">
                {Math.round(matterUtilization * 100)}%
              </span>
            </div>
            <Progress value={matterUtilization * 100} className="h-2" />
          </div>

          {/* Practice Areas */}
          <div className="space-y-2">
            <span className="text-sm text-muted-foreground">Practice Areas</span>
            <div className="flex flex-wrap gap-1">
              {client.tags.map((tag) => (
                <Badge key={tag} variant="outline" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity Card */}
      <Card className="lg:col-span-1">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-semibold">Recent Activity</CardTitle>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => onQuickAction?.('view_all_activity')}
            >
              View All
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {recentActivity.map((activity, index) => {
            const getActivityIcon = (type: string) => {
              const icons = {
                invoice: <DollarSign className="h-4 w-4 text-green-600" />,
                matter: <Briefcase className="h-4 w-4 text-primary" />,
                communication: <Users className="h-4 w-4 text-blue-600" />
              };
              return icons[type as keyof typeof icons] || <FileText className="h-4 w-4" />;
            };

            return (
              <div key={index} className="flex items-start gap-3">
                <div className="mt-1">
                  {getActivityIcon(activity.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">
                    {activity.description}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-muted-foreground">
                      {activity.date}
                    </span>
                    {activity.amount && (
                      <span className="text-xs font-medium text-green-600">
                        {activity.amount}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
          
          {/* Risk Alerts */}
          {riskFactors.length > 0 && (
            <div className="pt-3 border-t">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="h-4 w-4 text-orange-600" />
                <span className="text-sm font-medium text-orange-600">
                  Risk Alerts
                </span>
              </div>
              <div className="space-y-1">
                {riskFactors.map((risk, index) => (
                  <div key={index} className="text-xs text-muted-foreground">
                    • {risk}
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ClientBusinessIntelligence;