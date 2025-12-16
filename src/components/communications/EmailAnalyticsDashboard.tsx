import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Mail,
  Send,
  Eye,
  AlertCircle,
  TrendingUp,
  Clock,
  Filter,
  Download,
  RefreshCw,
  Calendar,
  Loader2
} from 'lucide-react';
import { useEmailStats, useEmailLogs } from '@/hooks/useRealEmail';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { format, subDays, startOfDay, endOfDay } from 'date-fns';

interface EmailAnalyticsDashboardProps {
  clientId?: string;
  matterId?: string;
  className?: string;
}

export const EmailAnalyticsDashboard: React.FC<EmailAnalyticsDashboardProps> = ({
  clientId,
  matterId,
  className
}) => {
  // Filter state
  const [dateRange, setDateRange] = useState<{
    startDate: string;
    endDate: string;
  }>({
    startDate: format(startOfDay(subDays(new Date(), 30)), 'yyyy-MM-dd'),
    endDate: format(endOfDay(new Date()), 'yyyy-MM-dd')
  });
  const [emailTypeFilter, setEmailTypeFilter] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('');

  // Data fetching
  const {
    data: emailStats,
    isLoading: statsLoading,
    refetch: refetchStats
  } = useEmailStats({
    clientId,
    matterId,
    startDate: dateRange.startDate,
    endDate: dateRange.endDate
  });

  const {
    data: emailLogs,
    isLoading: logsLoading,
    refetch: refetchLogs
  } = useEmailLogs({
    clientId,
    matterId,
    emailType: emailTypeFilter || undefined,
    status: statusFilter || undefined,
    startDate: dateRange.startDate,
    endDate: dateRange.endDate,
    limit: 100
  });

  // Chart colors
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  // Prepare chart data
  const statusData = emailStats ? [
    { name: 'Sent', value: emailStats.totalSent, color: '#10B981' },
    { name: 'Delivered', value: emailStats.delivered, color: '#3B82F6' },
    { name: 'Opened', value: emailStats.opened, color: '#8B5CF6' },
    { name: 'Failed', value: emailStats.failed, color: '#EF4444' }
  ] : [];

  const typeData = emailStats ? Object.entries(emailStats.byType).map(([type, count]) => ({
    type: type.charAt(0).toUpperCase() + type.slice(1).replace('_', ' '),
    count
  })) : [];

  // Performance metrics
  const openRate = emailStats ? 
    emailStats.totalSent > 0 ? ((emailStats.opened / emailStats.totalSent) * 100).toFixed(1) : '0' 
    : '0';
  
  const deliveryRate = emailStats ? 
    emailStats.totalSent > 0 ? ((emailStats.delivered / emailStats.totalSent) * 100).toFixed(1) : '0' 
    : '0';

  const failureRate = emailStats ? 
    emailStats.totalSent > 0 ? ((emailStats.failed / emailStats.totalSent) * 100).toFixed(1) : '0' 
    : '0';

  const handleRefresh = () => {
    refetchStats();
    refetchLogs();
  };

  const handleDateRangeChange = (days: number) => {
    setDateRange({
      startDate: format(startOfDay(subDays(new Date(), days)), 'yyyy-MM-dd'),
      endDate: format(endOfDay(new Date()), 'yyyy-MM-dd')
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'sent': return 'bg-blue-100 text-blue-800';
      case 'delivered': return 'bg-green-100 text-green-800';
      case 'opened': return 'bg-purple-100 text-purple-800';
      case 'failed': 
      case 'bounced': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatEmailType = (type: string) => {
    return type.charAt(0).toUpperCase() + type.slice(1).replace('_', ' ');
  };

  if (statsLoading && logsLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header with filters */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Email Analytics</h2>
          <p className="text-gray-600">Track email performance and engagement</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={statsLoading || logsLoading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${(statsLoading || logsLoading) ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Quick filters */}
      <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4" />
          <Label>Quick Range:</Label>
          <div className="flex gap-1">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => handleDateRangeChange(7)}
            >
              7d
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => handleDateRangeChange(30)}
            >
              30d
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => handleDateRangeChange(90)}
            >
              90d
            </Button>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Label>From:</Label>
          <Input
            type="date"
            value={dateRange.startDate}
            onChange={(e) => setDateRange(prev => ({ ...prev, startDate: e.target.value }))}
            className="w-40"
          />
        </div>
        
        <div className="flex items-center gap-2">
          <Label>To:</Label>
          <Input
            type="date"
            value={dateRange.endDate}
            onChange={(e) => setDateRange(prev => ({ ...prev, endDate: e.target.value }))}
            className="w-40"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4" />
          <Select value={emailTypeFilter} onValueChange={setEmailTypeFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="All Types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Types</SelectItem>
              <SelectItem value="invoice">Invoice</SelectItem>
              <SelectItem value="client_communication">Client Communication</SelectItem>
              <SelectItem value="matter_update">Matter Update</SelectItem>
              <SelectItem value="welcome">Welcome</SelectItem>
              <SelectItem value="generic">Generic</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-2">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="All Statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Statuses</SelectItem>
              <SelectItem value="sent">Sent</SelectItem>
              <SelectItem value="delivered">Delivered</SelectItem>
              <SelectItem value="opened">Opened</SelectItem>
              <SelectItem value="failed">Failed</SelectItem>
              <SelectItem value="bounced">Bounced</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Key metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Send className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Sent</p>
                <p className="text-2xl font-bold">{emailStats?.totalSent || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <Mail className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Delivery Rate</p>
                <p className="text-2xl font-bold">{deliveryRate}%</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Eye className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Open Rate</p>
                <p className="text-2xl font-bold">{openRate}%</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-red-100 rounded-lg">
                <AlertCircle className="h-6 w-6 text-red-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Failure Rate</p>
                <p className="text-2xl font-bold">{failureRate}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Email Status Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Email Status Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Email Types */}
        <Card>
          <CardHeader>
            <CardTitle>Emails by Type</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={typeData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="type" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#3B82F6" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Recent emails table */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Emails</CardTitle>
        </CardHeader>
        <CardContent>
          {logsLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2">Recipient</th>
                    <th className="text-left p-2">Subject</th>
                    <th className="text-left p-2">Type</th>
                    <th className="text-left p-2">Status</th>
                    <th className="text-left p-2">Sent At</th>
                  </tr>
                </thead>
                <tbody>
                  {emailLogs?.slice(0, 10).map((email) => (
                    <tr key={email.id} className="border-b hover:bg-gray-50">
                      <td className="p-2">
                        <div>
                          <div className="font-medium">{email.recipient_name || email.recipient_email}</div>
                          {email.recipient_name && (
                            <div className="text-sm text-gray-500">{email.recipient_email}</div>
                          )}
                        </div>
                      </td>
                      <td className="p-2">
                        <div className="max-w-xs truncate" title={email.subject}>
                          {email.subject}
                        </div>
                      </td>
                      <td className="p-2">
                        <Badge variant="outline">
                          {formatEmailType(email.email_type)}
                        </Badge>
                      </td>
                      <td className="p-2">
                        <Badge className={getStatusColor(email.status)}>
                          {email.status}
                        </Badge>
                      </td>
                      <td className="p-2 text-sm text-gray-600">
                        {format(new Date(email.sent_at), 'MMM d, yyyy HH:mm')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              
              {emailLogs && emailLogs.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  No emails found for the selected filters
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default EmailAnalyticsDashboard;