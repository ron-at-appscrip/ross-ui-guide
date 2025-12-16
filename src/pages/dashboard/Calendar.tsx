
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

const Calendar = () => {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Calendar</h1>
      <Card>
        <CardHeader>
          <CardTitle>Your Calendar</CardTitle>
        </CardHeader>
        <CardContent>
          <p>This is where your calendar will be. Content coming soon!</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default Calendar;
