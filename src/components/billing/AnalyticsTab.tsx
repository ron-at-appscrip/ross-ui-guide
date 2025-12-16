import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Clock, 
  Users,
  Target,
  Calendar,
  Download,
  RefreshCw,
  Eye,
  Filter,
  MoreVertical,
  ArrowUpRight,
  ArrowDownRight,
  PieChart,
  Activity,
  Zap,
  Award,
  AlertTriangle,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { Invoice, TimeEntry } from '@/types/billing';
import { BillingService } from '@/services/billingService';
import { cn } from '@/lib/utils';

interface AnalyticsTabProps {
  className?: string;
}

interface FinancialMetrics {
  totalRevenue: number;
  totalExpenses: number;
  netProfit: number;
  profitMargin: number;
  realizationRate: number;
  utilizationRate: number;
  collectionRate: number;
  averageDSO: number;
}

interface AttorneyMetrics {
  attorney: string;
  revenue: number;
  hours: number;
  utilization: number;
  realization: number;
  profit: number;
}

interface MatterMetrics {
  matterId: string;
  matterTitle: string;
  revenue: number;
  cost: number;
  profit: number;
  margin: number;
  hours: number;
}

interface ClientMetrics {
  clientId: string;
  clientName: string;
  revenue: number;
  profit: number;
  margin: number;
  lifetimeValue: number;
  retentionRate: number;
}

const AnalyticsTab: React.FC<AnalyticsTabProps> = ({ className }) => {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>([]);
  const [dateRange, setDateRange] = useState('30');
  const [isLoading, setIsLoading] = useState(true);
  const [selectedMetric, setSelectedMetric] = useState('revenue');

  useEffect(() => {
    loadData();
  }, [dateRange]);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [invoicesData, timeEntriesData] = await Promise.all([
        BillingService.getInvoices(),
        BillingService.getTimeEntries()
      ]);
      
      setInvoices(invoicesData);
      setTimeEntries(timeEntriesData);
    } catch (error) {
      console.error('Error loading analytics data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const financialMetrics = useMemo((): FinancialMetrics => {
    const totalRevenue = invoices
      .filter(inv => inv.status === 'paid')
      .reduce((sum, inv) => sum + inv.total, 0);
    
    const totalExpenses = timeEntries
      .filter(entry => entry.billable)
      .reduce((sum, entry) => sum + (entry.hours * 150), 0); // Assuming $150/hour cost
    
    const netProfit = totalRevenue - totalExpenses;
    const profitMargin = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0;
    
    const billableHours = timeEntries
      .filter(entry => entry.billable)
      .reduce((sum, entry) => sum + entry.hours, 0);
    
    const totalHours = timeEntries.reduce((sum, entry) => sum + entry.hours, 0);
    const utilizationRate = totalHours > 0 ? (billableHours / totalHours) * 100 : 0;
    
    const billedAmount = timeEntries
      .filter(entry => entry.status === 'billed')
      .reduce((sum, entry) => sum + entry.amount, 0);
    
    const realizationRate = totalRevenue > 0 ? (billedAmount / totalRevenue) * 100 : 0;
    
    const collectionRate = 94; // Mock data
    const averageDSO = 28; // Mock data
    
    return {
      totalRevenue,
      totalExpenses,
      netProfit,
      profitMargin,
      realizationRate,
      utilizationRate,
      collectionRate,
      averageDSO
    };
  }, [invoices, timeEntries]);

  const attorneyMetrics = useMemo((): AttorneyMetrics[] => {
    const attorneyMap = new Map<string, { revenue: number; hours: number; billableHours: number }>();
    
    // Aggregate data by attorney (using userId as proxy for attorney)
    timeEntries.forEach(entry => {
      const attorney = entry.userId || 'Unknown Attorney';
      const current = attorneyMap.get(attorney) || { revenue: 0, hours: 0, billableHours: 0 };
      
      current.hours += entry.hours;
      if (entry.billable) {
        current.billableHours += entry.hours;
        current.revenue += entry.amount;
      }
      
      attorneyMap.set(attorney, current);
    });
    
    return Array.from(attorneyMap.entries()).map(([attorney, data]) => ({
      attorney,
      revenue: data.revenue,
      hours: data.hours,
      utilization: data.hours > 0 ? (data.billableHours / data.hours) * 100 : 0,
      realization: data.revenue > 0 ? (data.revenue / (data.billableHours * 350)) * 100 : 0, // Assuming $350 rate
      profit: data.revenue - (data.hours * 150) // Assuming $150/hour cost
    })).sort((a, b) => b.revenue - a.revenue);
  }, [timeEntries]);

  const matterMetrics = useMemo((): MatterMetrics[] => {
    const matterMap = new Map<string, { revenue: number; hours: number; cost: number }>();
    
    timeEntries.forEach(entry => {
      const matterId = entry.matterId;
      const current = matterMap.get(matterId) || { revenue: 0, hours: 0, cost: 0 };
      
      current.hours += entry.hours;
      current.cost += entry.hours * 150; // Assuming $150/hour cost
      if (entry.billable) {
        current.revenue += entry.amount;
      }
      
      matterMap.set(matterId, current);
    });
    
    return Array.from(matterMap.entries()).map(([matterId, data]) => {
      const matterTitle = timeEntries.find(entry => entry.matterId === matterId)?.matterTitle || 'Unknown Matter';
      const profit = data.revenue - data.cost;
      const margin = data.revenue > 0 ? (profit / data.revenue) * 100 : 0;
      
      return {
        matterId,
        matterTitle,
        revenue: data.revenue,
        cost: data.cost,
        profit,
        margin,
        hours: data.hours
      };
    }).sort((a, b) => b.revenue - a.revenue);
  }, [timeEntries]);

  const clientMetrics = useMemo((): ClientMetrics[] => {
    const clientMap = new Map<string, { revenue: number; profit: number; invoices: number }>();
    
    invoices.forEach(invoice => {
      const clientId = invoice.clientId;
      const current = clientMap.get(clientId) || { revenue: 0, profit: 0, invoices: 0 };
      
      current.revenue += invoice.total;
      current.profit += invoice.total * 0.7; // Assuming 70% profit margin
      current.invoices += 1;
      
      clientMap.set(clientId, current);
    });
    
    return Array.from(clientMap.entries()).map(([clientId, data]) => {
      const clientName = invoices.find(inv => inv.clientId === clientId)?.clientName || 'Unknown Client';
      const margin = data.revenue > 0 ? (data.profit / data.revenue) * 100 : 0;
      
      return {
        clientId,
        clientName,
        revenue: data.revenue,
        profit: data.profit,
        margin,
        lifetimeValue: data.revenue * 1.5, // Mock calculation
        retentionRate: 85 // Mock data
      };
    }).sort((a, b) => b.revenue - a.revenue);
  }, [invoices]);

  const MetricCard: React.FC<{ 
    title: string; 
    value: string; 
    change?: number; 
    icon: React.ReactNode; 
    color: string;
    subtitle?: string;
  }> = ({ title, value, change, icon, color, subtitle }) => (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold">{value}</p>
            {subtitle && (
              <p className="text-xs text-muted-foreground">{subtitle}</p>
            )}
            {change !== undefined && (
              <div className="flex items-center mt-1">
                {change >= 0 ? (
                  <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
                ) : (
                  <TrendingDown className="h-3 w-3 text-red-500 mr-1" />
                )}
                <span className={cn("text-xs", change >= 0 ? "text-green-500" : "text-red-500")}>
                  {Math.abs(change)}% from last period
                </span>
              </div>
            )}
          </div>
          <div className={cn("p-2 rounded-lg", color)}>
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-4">
                <div className="animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-6 bg-gray-200 rounded w-1/2"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[...Array(2)].map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <div className="animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="animate-pulse">
                  <div className="h-64 bg-gray-200 rounded"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={cn("space-y-6", className)}>
      {/* Date Range Filter */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Select value={dateRange} onValueChange={setDateRange}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7">Last 7 days</SelectItem>
                  <SelectItem value="30">Last 30 days</SelectItem>
                  <SelectItem value="90">Last 90 days</SelectItem>
                  <SelectItem value="365">Last year</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={selectedMetric} onValueChange={setSelectedMetric}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="revenue">Revenue</SelectItem>
                  <SelectItem value="profit">Profit</SelectItem>
                  <SelectItem value="utilization">Utilization</SelectItem>
                  <SelectItem value="realization">Realization</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={loadData}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <MetricCard
          title="Total Revenue"
          value={`$${(financialMetrics.totalRevenue / 1000).toFixed(1)}K`}
          change={12.5}
          icon={<DollarSign className="h-6 w-6 text-white" />}
          color="bg-green-500"
          subtitle={`${financialMetrics.realizationRate.toFixed(1)}% realization rate`}
        />
        
        <MetricCard
          title="Net Profit"
          value={`$${(financialMetrics.netProfit / 1000).toFixed(1)}K`}
          change={8.2}
          icon={<TrendingUp className="h-6 w-6 text-white" />}
          color="bg-blue-500"
          subtitle={`${financialMetrics.profitMargin.toFixed(1)}% margin`}
        />
        
        <MetricCard
          title="Utilization Rate"
          value={`${financialMetrics.utilizationRate.toFixed(1)}%`}
          change={-2.1}
          icon={<Target className="h-6 w-6 text-white" />}
          color="bg-purple-500"
          subtitle="Billable hours vs total"
        />
        
        <MetricCard
          title="Collection Rate"
          value={`${financialMetrics.collectionRate}%`}
          change={1.8}
          icon={<CheckCircle className="h-6 w-6 text-white" />}
          color="bg-orange-500"
          subtitle={`${financialMetrics.averageDSO} days DSO`}
        />
      </div>

      {/* Performance Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Attorney Performance */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Attorney Performance</span>
              <Badge variant="secondary">Top Performers</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {attorneyMetrics.slice(0, 5).map((attorney, index) => (
                <div key={attorney.attorney} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="text-sm font-medium">{index + 1}</span>
                    </div>
                    <div>
                      <p className="font-medium text-sm">{attorney.attorney}</p>
                      <p className="text-xs text-muted-foreground">
                        {attorney.hours.toFixed(1)}h • {attorney.utilization.toFixed(1)}% utilization
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-sm">${(attorney.revenue / 1000).toFixed(1)}K</p>
                    <p className="text-xs text-muted-foreground">
                      {attorney.realization.toFixed(1)}% realization
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Matter Profitability */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Matter Profitability</span>
              <Badge variant="secondary">Revenue Leaders</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {matterMetrics.slice(0, 5).map((matter, index) => (
                <div key={matter.matterId} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="text-sm font-medium">{index + 1}</span>
                    </div>
                    <div>
                      <p className="font-medium text-sm">{matter.matterTitle}</p>
                      <p className="text-xs text-muted-foreground">
                        {matter.hours.toFixed(1)}h • {matter.margin.toFixed(1)}% margin
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-sm">${(matter.revenue / 1000).toFixed(1)}K</p>
                    <p className="text-xs text-muted-foreground">
                      ${(matter.profit / 1000).toFixed(1)}K profit
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Client Performance */}
        <Card>
          <CardHeader>
            <CardTitle>Client Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[400px]">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Client</TableHead>
                    <TableHead>Revenue</TableHead>
                    <TableHead>Margin</TableHead>
                    <TableHead>LTV</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {clientMetrics.slice(0, 10).map((client) => (
                    <TableRow key={client.clientId}>
                      <TableCell className="font-medium">{client.clientName}</TableCell>
                      <TableCell>${(client.revenue / 1000).toFixed(1)}K</TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <span className="mr-2">{client.margin.toFixed(1)}%</span>
                          <Progress value={client.margin} className="w-16 h-2" />
                        </div>
                      </TableCell>
                      <TableCell>${(client.lifetimeValue / 1000).toFixed(1)}K</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Operational Metrics */}
        <Card>
          <CardHeader>
            <CardTitle>Operational Metrics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Utilization Rate</span>
                  <span className="text-sm text-muted-foreground">{financialMetrics.utilizationRate.toFixed(1)}%</span>
                </div>
                <Progress value={financialMetrics.utilizationRate} className="h-2" />
                <p className="text-xs text-muted-foreground mt-1">Target: 85%</p>
              </div>
              
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Realization Rate</span>
                  <span className="text-sm text-muted-foreground">{financialMetrics.realizationRate.toFixed(1)}%</span>
                </div>
                <Progress value={financialMetrics.realizationRate} className="h-2" />
                <p className="text-xs text-muted-foreground mt-1">Target: 90%</p>
              </div>
              
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Collection Rate</span>
                  <span className="text-sm text-muted-foreground">{financialMetrics.collectionRate}%</span>
                </div>
                <Progress value={financialMetrics.collectionRate} className="h-2" />
                <p className="text-xs text-muted-foreground mt-1">Target: 95%</p>
              </div>
              
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Days Sales Outstanding</span>
                  <span className="text-sm text-muted-foreground">{financialMetrics.averageDSO} days</span>
                </div>
                <Progress value={100 - (financialMetrics.averageDSO / 60) * 100} className="h-2" />
                <p className="text-xs text-muted-foreground mt-1">Target: 30 days</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Trend Analysis */}
      <Card>
        <CardHeader>
          <CardTitle>Revenue Trends</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600 mb-2">
                +{financialMetrics.profitMargin.toFixed(1)}%
              </div>
              <p className="text-sm text-muted-foreground">Profit Margin</p>
              <div className="flex items-center justify-center mt-2">
                <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                <span className="text-xs text-green-500">+2.3% from last month</span>
              </div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600 mb-2">
                {financialMetrics.utilizationRate.toFixed(1)}%
              </div>
              <p className="text-sm text-muted-foreground">Utilization Rate</p>
              <div className="flex items-center justify-center mt-2">
                <TrendingDown className="h-4 w-4 text-red-500 mr-1" />
                <span className="text-xs text-red-500">-1.2% from last month</span>
              </div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600 mb-2">
                {financialMetrics.realizationRate.toFixed(1)}%
              </div>
              <p className="text-sm text-muted-foreground">Realization Rate</p>
              <div className="flex items-center justify-center mt-2">
                <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                <span className="text-xs text-green-500">+0.8% from last month</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AnalyticsTab; 