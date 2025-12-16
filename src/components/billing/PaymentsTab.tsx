import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { 
  DollarSign, 
  Clock, 
  AlertTriangle, 
  CheckCircle, 
  TrendingUp,
  TrendingDown,
  Search,
  Filter,
  Calendar,
  Mail,
  Phone,
  FileText,
  BarChart3,
  Users,
  CreditCard,
  Banknote,
  ArrowUpRight,
  ArrowDownRight,
  MoreVertical,
  Plus,
  Eye,
  Edit,
  Archive,
  Trash2,
  Send,
  PhoneCall,
  MessageSquare
} from 'lucide-react';
import { Invoice, Payment, PaymentStatus } from '@/types/billing';
import { BillingService, ClientPaymentProfile, CollectionActivity, PaymentReminder } from '@/services/billingService';
import { cn } from '@/lib/utils';

interface PaymentsTabProps {
  className?: string;
}

interface AgingBucket {
  range: string;
  amount: number;
  count: number;
  color: string;
}

const AGING_BUCKETS: AgingBucket[] = [
  { range: '0-30 days', amount: 0, count: 0, color: 'bg-green-500' },
  { range: '31-60 days', amount: 0, count: 0, color: 'bg-yellow-500' },
  { range: '61-90 days', amount: 0, count: 0, color: 'bg-orange-500' },
  { range: '90+ days', amount: 0, count: 0, color: 'bg-red-500' }
];

const PAYMENT_METHODS = [
  { value: 'check', label: 'Check', icon: <Banknote className="h-4 w-4" /> },
  { value: 'wire', label: 'Wire Transfer', icon: <ArrowUpRight className="h-4 w-4" /> },
  { value: 'credit_card', label: 'Credit Card', icon: <CreditCard className="h-4 w-4" /> },
  { value: 'ach', label: 'ACH', icon: <ArrowDownRight className="h-4 w-4" /> }
];

const PaymentsTab: React.FC<PaymentsTabProps> = ({ className }) => {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [clientProfiles, setClientProfiles] = useState<ClientPaymentProfile[]>([]);
  const [collectionActivities, setCollectionActivities] = useState<CollectionActivity[]>([]);
  const [paymentReminders, setPaymentReminders] = useState<PaymentReminder[]>([]);
  const [filters, setFilters] = useState({
    status: 'all',
    client: 'all',
    paymentMethod: 'all',
    dateRange: { start: '', end: '' }
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedInvoices, setSelectedInvoices] = useState<string[]>([]);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showCollectionModal, setShowCollectionModal] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [agingBuckets, setAgingBuckets] = useState<AgingBucket[]>(AGING_BUCKETS);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [invoicesData, paymentsData, profilesData, activitiesData, remindersData] = await Promise.all([
        BillingService.getInvoices(),
        BillingService.getPayments(),
        BillingService.getClientPaymentProfiles(),
        BillingService.getCollectionActivities(),
        BillingService.getPaymentReminders()
      ]);
      
      setInvoices(invoicesData);
      setPayments(paymentsData);
      setClientProfiles(profilesData);
      setCollectionActivities(activitiesData);
      setPaymentReminders(remindersData);
      
      // Calculate aging buckets
      calculateAgingBuckets(invoicesData);
    } catch (error) {
      console.error('Error loading payments data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const calculateAgingBuckets = (invoicesData: Invoice[]) => {
    const now = new Date();
    const buckets = [...AGING_BUCKETS];
    
    invoicesData
      .filter(inv => inv.status === 'sent' || inv.status === 'overdue')
      .forEach(invoice => {
        const dueDate = new Date(invoice.dueDate);
        const daysOverdue = Math.floor((now.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24));
        
        if (daysOverdue <= 30) {
          buckets[0].amount += invoice.total;
          buckets[0].count += 1;
        } else if (daysOverdue <= 60) {
          buckets[1].amount += invoice.total;
          buckets[1].count += 1;
        } else if (daysOverdue <= 90) {
          buckets[2].amount += invoice.total;
          buckets[2].count += 1;
        } else {
          buckets[3].amount += invoice.total;
          buckets[3].count += 1;
        }
      });
    
    setAgingBuckets(buckets);
  };

  const filteredInvoices = useMemo(() => {
    return invoices.filter(invoice => {
      const matchesSearch = invoice.number.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           invoice.clientName.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = filters.status === 'all' || invoice.status === filters.status;
      const matchesClient = filters.client === 'all' || invoice.clientId === filters.client;
      
      return matchesSearch && matchesStatus && matchesClient;
    });
  }, [invoices, searchTerm, filters]);

  const paymentStats = useMemo(() => {
    const totalOutstanding = invoices
      .filter(inv => inv.status === 'sent' || inv.status === 'overdue')
      .reduce((sum, inv) => sum + inv.total, 0);
    
    const totalCollected = payments
      .filter(p => p.status === 'paid')
      .reduce((sum, p) => sum + p.amount, 0);
    
    const overdueAmount = invoices
      .filter(inv => inv.status === 'overdue')
      .reduce((sum, inv) => sum + inv.total, 0);
    
    const avgDSO = clientProfiles.length > 0 
      ? clientProfiles.reduce((sum, p) => sum + p.averagePaymentDays, 0) / clientProfiles.length
      : 0;
    
    return { totalOutstanding, totalCollected, overdueAmount, avgDSO };
  }, [invoices, payments, clientProfiles]);

  const handleBulkAction = async (action: 'send_reminder' | 'assign_collection' | 'mark_paid') => {
    if (selectedInvoices.length === 0) return;

    try {
      for (const invoiceId of selectedInvoices) {
        switch (action) {
          case 'send_reminder':
            const reminder: Omit<PaymentReminder, 'id'> = {
              invoiceId,
              type: 'follow_up',
              sentAt: new Date().toISOString(),
              daysOverdue: 0
            };
            await BillingService.createPaymentReminder(reminder);
            break;
          case 'assign_collection':
            const activity: Omit<CollectionActivity, 'id'> = {
              invoiceId,
              activityType: 'reminder_sent',
              description: 'Bulk reminder sent',
              assignedTo: 'Current User',
              dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
            };
            await BillingService.createCollectionActivity(activity);
            break;
          case 'mark_paid':
            // In production, this would create a payment record
            console.log('Mark as paid:', invoiceId);
            break;
        }
      }
      
      setSelectedInvoices([]);
      await loadData();
    } catch (error) {
      console.error(`Error performing bulk ${action}:`, error);
    }
  };

  const handleRecordPayment = async (invoiceId: string, amount: number, method: string) => {
    try {
      const payment: Omit<Payment, 'id'> = {
        invoiceId,
        amount,
        paymentDate: new Date().toISOString(),
        method,
        status: 'paid',
        notes: 'Payment recorded'
      };
      
      await BillingService.createPayment(payment);
      await BillingService.updateInvoiceStatus(invoiceId, 'paid');
      await loadData();
    } catch (error) {
      console.error('Error recording payment:', error);
    }
  };

  const InvoiceCard: React.FC<{ invoice: Invoice }> = ({ invoice }) => {
    const isSelected = selectedInvoices.includes(invoice.id);
    const isOverdue = invoice.status === 'sent' && new Date(invoice.dueDate) < new Date();
    const daysOverdue = isOverdue 
      ? Math.ceil((new Date().getTime() - new Date(invoice.dueDate).getTime()) / (1000 * 60 * 60 * 24))
      : 0;
    const clientProfile = clientProfiles.find(p => p.clientId === invoice.clientId);
    const recentPayments = payments.filter(p => p.invoiceId === invoice.id);

    return (
      <Card 
        className={cn(
          "mb-3 cursor-pointer transition-all hover:shadow-md",
          isSelected && "ring-2 ring-primary",
          isOverdue && "border-red-200 bg-red-50"
        )}
        onClick={() => setSelectedInvoices(prev => 
          prev.includes(invoice.id) 
            ? prev.filter(id => id !== invoice.id)
            : [...prev, invoice.id]
        )}
      >
        <CardContent className="p-4">
          <div className="flex items-start justify-between mb-2">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h4 className="font-medium text-sm">{invoice.number}</h4>
                <Badge variant={isOverdue ? 'destructive' : 'secondary'}>
                  {isOverdue ? `${daysOverdue} days overdue` : 'Outstanding'}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground">{invoice.clientName}</p>
              <p className="text-xs text-muted-foreground">Due: {new Date(invoice.dueDate).toLocaleDateString()}</p>
            </div>
            <div className="text-right">
              <p className="font-medium">${invoice.total.toFixed(2)}</p>
              {clientProfile && (
                <p className="text-xs text-muted-foreground">
                  Avg: {clientProfile.averagePaymentDays} days
                </p>
              )}
            </div>
          </div>
          
          {recentPayments.length > 0 && (
            <div className="mt-2 p-2 bg-green-50 rounded text-xs">
              <div className="flex items-center justify-between">
                <span className="text-green-700">Recent payments:</span>
                <span className="font-medium">
                  ${recentPayments.reduce((sum, p) => sum + p.amount, 0).toFixed(2)}
                </span>
              </div>
            </div>
          )}
          
          <div className="flex justify-end mt-2 space-x-1">
            <Button
              size="sm"
              variant="outline"
              onClick={(e) => {
                e.stopPropagation();
                setSelectedInvoice(invoice);
                setShowPaymentModal(true);
              }}
            >
              <DollarSign className="h-3 w-3" />
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={(e) => {
                e.stopPropagation();
                setSelectedInvoice(invoice);
                setShowCollectionModal(true);
              }}
            >
              <MessageSquare className="h-3 w-3" />
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  };

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
                <div className="space-y-3">
                  {[...Array(3)].map((_, j) => (
                    <div key={j} className="animate-pulse">
                      <div className="h-20 bg-gray-200 rounded"></div>
                    </div>
                  ))}
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
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Outstanding</p>
                <p className="text-2xl font-bold text-orange-600">
                  ${(paymentStats.totalOutstanding / 1000).toFixed(1)}K
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Collected</p>
                <p className="text-2xl font-bold text-green-600">
                  ${(paymentStats.totalCollected / 1000).toFixed(1)}K
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Overdue</p>
                <p className="text-2xl font-bold text-red-600">
                  ${(paymentStats.overdueAmount / 1000).toFixed(1)}K
                </p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Avg DSO</p>
                <p className="text-2xl font-bold text-blue-600">
                  {paymentStats.avgDSO.toFixed(0)} days
                </p>
              </div>
              <Clock className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Aging Analysis */}
      <Card>
        <CardHeader>
          <CardTitle>Aging Analysis</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {agingBuckets.map((bucket, index) => (
              <div key={index} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">{bucket.range}</span>
                  <span className="text-sm text-muted-foreground">{bucket.count} invoices</span>
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span>${bucket.amount.toFixed(0)}</span>
                    <span>{((bucket.amount / paymentStats.totalOutstanding) * 100).toFixed(1)}%</span>
                  </div>
                  <Progress 
                    value={(bucket.amount / paymentStats.totalOutstanding) * 100} 
                    className="h-2"
                  />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Actions and Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
            <div className="flex flex-1 gap-4 items-center">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search invoices..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <Select value={filters.status} onValueChange={(value) => setFilters(prev => ({ ...prev, status: value }))}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="sent">Sent</SelectItem>
                  <SelectItem value="overdue">Overdue</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex gap-2">
              {selectedInvoices.length > 0 && (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleBulkAction('send_reminder')}
                  >
                    <Mail className="h-4 w-4 mr-2" />
                    Send Reminder ({selectedInvoices.length})
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleBulkAction('assign_collection')}
                  >
                    <Phone className="h-4 w-4 mr-2" />
                    Assign Collection ({selectedInvoices.length})
                  </Button>
                </>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedInvoices([])}
              >
                Clear Selection
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Payment Pipeline */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Outstanding Invoices */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center justify-between text-sm">
              <div className="flex items-center">
                <Clock className="h-4 w-4 mr-2" />
                Outstanding Invoices
              </div>
              <Badge variant="secondary">
                {filteredInvoices.filter(inv => inv.status === 'sent').length}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[600px]">
              <div className="space-y-2">
                {filteredInvoices
                  .filter(invoice => invoice.status === 'sent')
                  .map((invoice) => (
                    <InvoiceCard key={invoice.id} invoice={invoice} />
                  ))}
                {filteredInvoices.filter(inv => inv.status === 'sent').length === 0 && (
                  <div className="text-center text-muted-foreground text-sm py-8">
                    No outstanding invoices
                  </div>
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Overdue Invoices */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center justify-between text-sm">
              <div className="flex items-center">
                <AlertTriangle className="h-4 w-4 mr-2" />
                Overdue Invoices
              </div>
              <Badge variant="destructive">
                {filteredInvoices.filter(inv => inv.status === 'overdue').length}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[600px]">
              <div className="space-y-2">
                {filteredInvoices
                  .filter(invoice => invoice.status === 'overdue')
                  .map((invoice) => (
                    <InvoiceCard key={invoice.id} invoice={invoice} />
                  ))}
                {filteredInvoices.filter(inv => inv.status === 'overdue').length === 0 && (
                  <div className="text-center text-muted-foreground text-sm py-8">
                    No overdue invoices
                  </div>
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>

      {/* Payment Modal */}
      <Dialog open={showPaymentModal} onOpenChange={setShowPaymentModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Record Payment</DialogTitle>
            <DialogDescription>
              Record a payment for this invoice
            </DialogDescription>
          </DialogHeader>
          
          {selectedInvoice && (
            <div className="space-y-4">
              <Card>
                <CardContent className="p-4">
                  <h4 className="font-medium mb-2">{selectedInvoice.number}</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Client:</span>
                      <p>{selectedInvoice.clientName}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Amount:</span>
                      <p>${selectedInvoice.total.toFixed(2)}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Payment Amount</label>
                  <Input
                    type="number"
                    placeholder="0.00"
                    className="mt-1"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Payment Method</label>
                  <Select>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select method" />
                    </SelectTrigger>
                    <SelectContent>
                      {PAYMENT_METHODS.map((method) => (
                        <SelectItem key={method.value} value={method.value}>
                          <div className="flex items-center">
                            {method.icon}
                            <span className="ml-2">{method.label}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium">Notes</label>
                <Textarea
                  placeholder="Payment notes..."
                  className="mt-1"
                />
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowPaymentModal(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={() => {
                if (selectedInvoice) {
                  handleRecordPayment(selectedInvoice.id, selectedInvoice.total, 'check');
                  setShowPaymentModal(false);
                }
              }}
            >
              Record Payment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Collection Activity Modal */}
      <Dialog open={showCollectionModal} onOpenChange={setShowCollectionModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Collection Activity</DialogTitle>
            <DialogDescription>
              Log collection activity for this invoice
            </DialogDescription>
          </DialogHeader>
          
          {selectedInvoice && (
            <div className="space-y-4">
              <Card>
                <CardContent className="p-4">
                  <h4 className="font-medium mb-2">{selectedInvoice.number}</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Client:</span>
                      <p>{selectedInvoice.clientName}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Outstanding:</span>
                      <p>${selectedInvoice.total.toFixed(2)}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Activity Type</label>
                  <Select>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select activity" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="reminder_sent">Reminder Sent</SelectItem>
                      <SelectItem value="call_made">Call Made</SelectItem>
                      <SelectItem value="letter_sent">Letter Sent</SelectItem>
                      <SelectItem value="payment_plan">Payment Plan</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium">Due Date</label>
                  <Input
                    type="date"
                    className="mt-1"
                  />
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium">Description</label>
                <Textarea
                  placeholder="Activity description..."
                  className="mt-1"
                />
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowCollectionModal(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={() => {
                setShowCollectionModal(false);
              }}
            >
              Log Activity
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PaymentsTab; 