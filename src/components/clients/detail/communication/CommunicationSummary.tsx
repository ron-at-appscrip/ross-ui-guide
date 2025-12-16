
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Mail, Phone, MessageSquare, Calendar } from 'lucide-react';

interface Communication {
  id: string;
  type: string;
  date: string;
  [key: string]: any;
}

interface CommunicationSummaryProps {
  communications: Communication[];
}

const CommunicationSummary = ({ communications }: CommunicationSummaryProps) => {
  const emailCount = communications.filter(comm => comm.type === 'email').length;
  const phoneCount = communications.filter(comm => comm.type === 'phone').length;
  const meetingCount = communications.filter(comm => comm.type === 'meeting').length;
  const lastContact = new Date(Math.max(...communications.map(comm => new Date(comm.date).getTime()))).toLocaleDateString();

  return (
    <div className="grid gap-4 md:grid-cols-4">
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-2">
            <Mail className="h-4 w-4 text-primary" />
            <div>
              <p className="text-sm text-muted-foreground">Emails</p>
              <p className="text-2xl font-bold">{emailCount}</p>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-2">
            <Phone className="h-4 w-4 text-green-600" />
            <div>
              <p className="text-sm text-muted-foreground">Phone Calls</p>
              <p className="text-2xl font-bold text-green-600">{phoneCount}</p>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4 text-blue-600" />
            <div>
              <p className="text-sm text-muted-foreground">Meetings</p>
              <p className="text-2xl font-bold text-blue-600">{meetingCount}</p>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-purple-600" />
            <div>
              <p className="text-sm text-muted-foreground">Last Contact</p>
              <p className="text-lg font-bold text-purple-600">{lastContact}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CommunicationSummary;
