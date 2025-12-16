import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Clock, 
  DollarSign, 
  FileText, 
  Bell, 
  Calendar,
  AlertTriangle,
  CheckCircle,
  Download,
  Settings
} from 'lucide-react';
import type { TrademarkResult } from '@/types/uspto';
import { RenewalService, type RenewalCostEstimate } from '@/services/renewalService';
import { formatDeadline, getDeadlineColorClass } from '@/utils/trademarkDeadlines';
import RenewalStatusBadge from './RenewalStatusBadge';

interface RenewalActionPanelProps {
  trademark: TrademarkResult;
  onConfigureReminders?: () => void;
  onStartRenewal?: () => void;
  onViewTimeline?: () => void;
}

const RenewalActionPanel: React.FC<RenewalActionPanelProps> = ({
  trademark,
  onConfigureReminders,
  onStartRenewal,
  onViewTimeline
}) => {
  const [costEstimate, setCostEstimate] = useState<RenewalCostEstimate | null>(null);
  const [loadingCosts, setLoadingCosts] = useState(false);
  const [showCostBreakdown, setShowCostBreakdown] = useState(false);

  // Get renewal status information
  const renewalStatus = RenewalService.getRenewalStatus(trademark);
  const timeline = RenewalService.getRenewalTimeline(trademark);
  const nextDeadline = trademark.deadlines?.nextMajorDeadline;

  // Load cost estimate when needed
  const handleViewCosts = async () => {
    if (costEstimate) {
      setShowCostBreakdown(!showCostBreakdown);
      return;
    }

    setLoadingCosts(true);
    try {
      // Determine renewal type based on next deadline
      let renewalType: 'section8' | 'section71' | 'renewal' | 'combined' = 'renewal';
      if (trademark.deadlines?.section8 && trademark.deadlines.section8.daysRemaining <= 90) {
        renewalType = trademark.deadlines.renewal && trademark.deadlines.renewal.daysRemaining <= 90 
          ? 'combined' : 'section8';
      }

      const estimate = RenewalService.calculateRenewalCosts(trademark, renewalType);
      setCostEstimate(estimate);
      setShowCostBreakdown(true);
    } catch (error) {
      console.error('Failed to calculate costs:', error);
    } finally {
      setLoadingCosts(false);
    }
  };

  // Don't show if no deadline information
  if (!trademark.deadlines || !nextDeadline) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <CheckCircle className="h-4 w-4 text-green-600" />
            Renewal Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            No upcoming renewal deadlines found for this trademark.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Status Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between text-base">
            <span className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Renewal Status
            </span>
            <RenewalStatusBadge trademark={trademark} showDays={false} />
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Next Deadline */}
          <div className={`p-3 rounded-lg border ${getDeadlineColorClass(nextDeadline.urgencyLevel)}`}>
            <div className="flex items-start justify-between">
              <div>
                <p className="font-medium text-sm">Next Deadline</p>
                <p className="text-sm">{formatDeadline(nextDeadline)}</p>
                <p className="text-xs opacity-75 mt-1">
                  {renewalStatus.nextAction}
                </p>
              </div>
              {nextDeadline.urgencyLevel === 'critical' && (
                <AlertTriangle className="h-4 w-4 text-current flex-shrink-0 mt-1" />
              )}
            </div>
          </div>

          {/* Recommended Actions */}
          {renewalStatus.recommendedActions.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm font-medium">Recommended Actions:</p>
              <ul className="space-y-1">
                {renewalStatus.recommendedActions.slice(0, 3).map((action, index) => (
                  <li key={index} className="text-xs text-muted-foreground flex items-start gap-2">
                    <CheckCircle className="h-3 w-3 text-green-500 flex-shrink-0 mt-0.5" />
                    {action}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="grid grid-cols-2 gap-3">
        <Button 
          onClick={onStartRenewal} 
          className="h-auto py-3 flex-col gap-1"
          variant={renewalStatus.urgency === 'critical' ? 'default' : 'outline'}
        >
          <FileText className="h-4 w-4" />
          <span className="text-xs">Start Renewal</span>
        </Button>

        <Button 
          onClick={handleViewCosts} 
          disabled={loadingCosts}
          variant="outline" 
          className="h-auto py-3 flex-col gap-1"
        >
          <DollarSign className="h-4 w-4" />
          <span className="text-xs">
            {loadingCosts ? 'Loading...' : 'View Costs'}
          </span>
        </Button>

        <Button 
          onClick={onConfigureReminders} 
          variant="outline" 
          className="h-auto py-3 flex-col gap-1"
        >
          <Bell className="h-4 w-4" />
          <span className="text-xs">Reminders</span>
        </Button>

        <Button 
          onClick={onViewTimeline} 
          variant="outline" 
          className="h-auto py-3 flex-col gap-1"
        >
          <Calendar className="h-4 w-4" />
          <span className="text-xs">Timeline</span>
        </Button>
      </div>

      {/* Cost Breakdown */}
      {showCostBreakdown && costEstimate && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <DollarSign className="h-4 w-4" />
              Cost Estimate
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-2">
              {costEstimate.section8Fee > 0 && (
                <div className="flex justify-between text-sm">
                  <span>Section 8 Declaration</span>
                  <span>${costEstimate.section8Fee}</span>
                </div>
              )}
              {costEstimate.section71Fee > 0 && (
                <div className="flex justify-between text-sm">
                  <span>Section 71 Declaration</span>
                  <span>${costEstimate.section71Fee}</span>
                </div>
              )}
              {costEstimate.renewalFee > 0 && (
                <div className="flex justify-between text-sm">
                  <span>Renewal Fee</span>
                  <span>${costEstimate.renewalFee}</span>
                </div>
              )}
              {costEstimate.lateRenewalFee && (
                <div className="flex justify-between text-sm text-red-600">
                  <span>Late Fee Penalty</span>
                  <span>${costEstimate.lateRenewalFee}</span>
                </div>
              )}
              <hr className="my-2" />
              <div className="flex justify-between font-medium">
                <span>Total Estimate</span>
                <span>${costEstimate.totalEstimate}</span>
              </div>
            </div>

            <div className="text-xs text-muted-foreground space-y-1">
              {costEstimate.notes.slice(0, 2).map((note, index) => (
                <p key={index}>• {note}</p>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Timeline Preview */}
      {timeline.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Calendar className="h-4 w-4" />
              Upcoming Events
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {timeline.slice(0, 3).map((event, index) => (
                <div key={index} className="flex items-center gap-3 text-sm">
                  <div className={`w-2 h-2 rounded-full flex-shrink-0 ${
                    event.urgency === 'critical' ? 'bg-red-500' :
                    event.urgency === 'high' ? 'bg-orange-500' :
                    event.urgency === 'medium' ? 'bg-yellow-500' :
                    'bg-green-500'
                  }`} />
                  <div className="flex-1 min-w-0">
                    <p className="truncate">{event.description}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(event.date).toLocaleDateString()}
                    </p>
                  </div>
                  <Badge 
                    variant="outline" 
                    className="text-xs"
                  >
                    {event.status}
                  </Badge>
                </div>
              ))}
              
              {timeline.length > 3 && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={onViewTimeline}
                  className="w-full mt-2"
                >
                  View All Events ({timeline.length})
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default RenewalActionPanel;