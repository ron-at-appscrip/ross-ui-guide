
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Briefcase, Clock, DollarSign, TrendingUp } from 'lucide-react';
import { Matter } from '@/types/matter';

interface MattersStatsProps {
  matters: Matter[];
}

const MattersStats = ({ matters }: MattersStatsProps) => {
  const activeMatters = matters.filter(m => m.status === 'active').length;
  const totalBilled = matters.reduce((sum, matter) => sum + matter.billedAmount, 0);
  const totalHours = matters.reduce((sum, matter) => sum + matter.timeSpent, 0);
  const urgentMatters = matters.filter(m => m.priority === 'urgent').length;

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
      <Card className="border rounded-lg hover:shadow-md transition-shadow">
        <CardContent className="p-6">
          <div className="flex items-center space-x-4">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Briefcase className="h-6 w-6 text-primary" />
            </div>
            <div className="flex-1">
              <p className="text-sm text-muted-foreground">Active Matters</p>
              <p className="text-2xl font-bold">{activeMatters}</p>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card className="border rounded-lg hover:shadow-md transition-shadow">
        <CardContent className="p-6">
          <div className="flex items-center space-x-4">
            <div className="p-2 bg-green-100 rounded-lg">
              <DollarSign className="h-6 w-6 text-green-600" />
            </div>
            <div className="flex-1">
              <p className="text-sm text-muted-foreground">Total Billed</p>
              <p className="text-2xl font-bold text-green-600">${totalBilled.toLocaleString()}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border rounded-lg hover:shadow-md transition-shadow">
        <CardContent className="p-6">
          <div className="flex items-center space-x-4">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Clock className="h-6 w-6 text-blue-600" />
            </div>
            <div className="flex-1">
              <p className="text-sm text-muted-foreground">Total Hours</p>
              <p className="text-2xl font-bold text-blue-600">{totalHours.toFixed(1)}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border rounded-lg hover:shadow-md transition-shadow">
        <CardContent className="p-6">
          <div className="flex items-center space-x-4">
            <div className="p-2 bg-red-100 rounded-lg">
              <TrendingUp className="h-6 w-6 text-red-600" />
            </div>
            <div className="flex-1">
              <p className="text-sm text-muted-foreground">Urgent Matters</p>
              <p className="text-2xl font-bold text-red-600">{urgentMatters}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MattersStats;
