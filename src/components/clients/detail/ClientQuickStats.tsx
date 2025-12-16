
import React from 'react';
import { Client } from '@/types/client';
import { Card } from '@/components/ui/card';
import { TrendingUp, DollarSign, AlertCircle, Briefcase } from 'lucide-react';

interface ClientQuickStatsProps {
  client: Client;
}

const ClientQuickStats = ({ client }: ClientQuickStatsProps) => {
  const stats = [
    {
      label: 'Active Matters',
      value: client.activeMatters.toString(),
      icon: TrendingUp,
      color: 'text-primary'
    },
    {
      label: 'Total Billed',
      value: `$${client.totalBilled.toLocaleString()}`,
      icon: DollarSign,
      color: 'text-green-600'
    },
    {
      label: 'Outstanding',
      value: `$${client.outstandingBalance.toLocaleString()}`,
      icon: AlertCircle,
      color: client.outstandingBalance > 0 ? 'text-orange-600' : 'text-green-600'
    },
    {
      label: 'Total Matters',
      value: client.totalMatters.toString(),
      icon: Briefcase,
      color: 'text-primary'
    }
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <div key={index} className="flex flex-col space-y-2">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Icon className="h-4 w-4" />
              <span className="text-sm font-medium">{stat.label}</span>
            </div>
            <p className={`text-2xl font-bold ${stat.color}`}>
              {stat.value}
            </p>
          </div>
        );
      })}
    </div>
  );
};

export default ClientQuickStats;
