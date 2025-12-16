
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Users, Briefcase } from 'lucide-react';
import { Client } from '@/types/client';

interface ClientsStatsProps {
  clients: Client[];
}

const ClientsStats = ({ clients }: ClientsStatsProps) => {
  const totalActiveMatters = clients.reduce((sum, client) => sum + client.activeMatters, 0);

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center space-x-4">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Users className="h-6 w-6 text-primary" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-muted-foreground">Total Clients</p>
              <p className="text-3xl font-bold">{clients.length}</p>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center space-x-4">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Briefcase className="h-6 w-6 text-primary" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-muted-foreground">Active Matters</p>
              <p className="text-3xl font-bold">{totalActiveMatters}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ClientsStats;
