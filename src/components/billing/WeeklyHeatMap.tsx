
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface DayData {
  date: string;
  hours: number;
  billableHours: number;
  entries: number;
}

const WeeklyHeatMap = () => {
  // Mock data for the week
  const weekData: DayData[] = [
    { date: '2024-03-11', hours: 8.5, billableHours: 7.5, entries: 5 },
    { date: '2024-03-12', hours: 7.2, billableHours: 6.8, entries: 4 },
    { date: '2024-03-13', hours: 9.1, billableHours: 8.9, entries: 6 },
    { date: '2024-03-14', hours: 6.8, billableHours: 6.0, entries: 3 },
    { date: '2024-03-15', hours: 8.0, billableHours: 7.2, entries: 4 },
    { date: '2024-03-16', hours: 0, billableHours: 0, entries: 0 },
    { date: '2024-03-17', hours: 0, billableHours: 0, entries: 0 }
  ];

  const getIntensityClass = (hours: number) => {
    if (hours === 0) return 'bg-gray-100';
    if (hours < 3) return 'bg-blue-100';
    if (hours < 6) return 'bg-blue-200';
    if (hours < 8) return 'bg-blue-400';
    return 'bg-blue-600';
  };

  const getTextColor = (hours: number) => {
    return hours > 6 ? 'text-white' : 'text-gray-800';
  };

  const getDayName = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', { weekday: 'short' });
  };

  const totalHours = weekData.reduce((sum, day) => sum + day.hours, 0);
  const totalBillable = weekData.reduce((sum, day) => sum + day.billableHours, 0);
  const utilizationRate = totalHours > 0 ? (totalBillable / totalHours) * 100 : 0;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Weekly Time Overview</CardTitle>
          <div className="flex space-x-2">
            <Badge variant="outline">
              {totalHours.toFixed(1)} total hours
            </Badge>
            <Badge variant="default">
              {utilizationRate.toFixed(0)}% billable
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-7 gap-2 mb-6">
          {weekData.map((day, index) => (
            <div key={day.date} className="text-center">
              <div className="text-xs font-medium mb-2 text-muted-foreground">
                {getDayName(day.date)}
              </div>
              <div className={`
                w-full h-20 rounded-lg flex flex-col items-center justify-center
                ${getIntensityClass(day.hours)}
                ${getTextColor(day.hours)}
                border border-gray-200
                hover:shadow-md transition-shadow cursor-pointer
              `}>
                <div className="text-lg font-bold">
                  {day.hours > 0 ? day.hours.toFixed(1) : '-'}
                </div>
                {day.hours > 0 && (
                  <div className="text-xs opacity-80">
                    {day.entries} entries
                  </div>
                )}
              </div>
              <div className="text-xs mt-1 text-muted-foreground">
                {new Date(day.date).getDate()}
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center p-3 bg-muted/50 rounded-lg">
            <div className="text-2xl font-bold text-primary">{totalHours.toFixed(1)}</div>
            <div className="text-sm text-muted-foreground">Total Hours</div>
          </div>
          <div className="text-center p-3 bg-muted/50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">{totalBillable.toFixed(1)}</div>
            <div className="text-sm text-muted-foreground">Billable Hours</div>
          </div>
          <div className="text-center p-3 bg-muted/50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">{utilizationRate.toFixed(0)}%</div>
            <div className="text-sm text-muted-foreground">Utilization Rate</div>
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
          <span>Legend:</span>
          <div className="flex items-center space-x-2">
            <div className="flex items-center space-x-1">
              <div className="w-3 h-3 bg-gray-100 rounded"></div>
              <span>0h</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-3 h-3 bg-blue-100 rounded"></div>
              <span>1-3h</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-3 h-3 bg-blue-200 rounded"></div>
              <span>3-6h</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-3 h-3 bg-blue-400 rounded"></div>
              <span>6-8h</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-3 h-3 bg-blue-600 rounded"></div>
              <span>8h+</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default WeeklyHeatMap;
