import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { 
  FileText, 
  Send, 
  CheckCircle, 
  Clock, 
  AlertTriangle, 
  DollarSign,
  Calendar,
  Search,
  Filter,
  Download,
  Eye,
  Edit,
  MoreVertical,
  Plus,
  TrendingUp,
  TrendingDown,
  BarChart3,
  Mail,
  Copy,
  Archive,
  Trash2
} from 'lucide-react';
import { Invoice, InvoiceStatus } from '@/types/billing';
import { BillingService } from '@/services/billingService';
import { cn } from '@/lib/utils';

interface InvoicingTabProps {
  className?: string;
  onGenerateInvoice?: () => void;
}

interface InvoiceTemplate {
  id: string;
  name: string;
  description: string;
  isDefault: boolean;
  branding: {
    logo?: string;
    primaryColor: string;
    secondaryColor: string;
  };
}

const INVOICE_STATUS_CONFIG = {
  draft: { label: 'Draft', color: 'bg-gray-100 text-gray-800', icon: <FileText className="h-4 w-4" /> },
  sent: { label: 'Sent', color: 'bg-blue-100 text-blue-800', icon: <Send className="h-4 w-4" /> },
  overdue: { label: 'Overdue', color: 'bg-red-100 text-red-800', icon: <AlertTriangle className="h-4 w-4" /> },
  paid: { label: 'Paid', color: 'bg-green-100 text-green-800', icon: <CheckCircle className="h-4 w-4" /> },
  cancelled: { label: 'Cancelled', color: 'bg-gray-100 text-gray-800', icon: <Archive className="h-4 w-4" /> }
};

const PAYMENT_TERMS = [
  { value: 'net_15', label: 'Net 15' },
  { value: 'net_30', label: 'Net 30' },
  { value: 'net_45', label: 'Net 45' },
  { value: 'net_60', label: 'Net 60' },
  { value: 'due_on_receipt', label: 'Due on Receipt' }
];

const InvoicingTab: React.FC<InvoicingTabProps> = ({ className, onGenerateInvoice }) => {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [templates, setTemplates] = useState<InvoiceTemplate[]>([]);
  const [filters, setFilters] = useState({
    status: 'all',
    client: 'all',
    dateRange: { start: '', end: '' }
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedInvoices, setSelectedInvoices] = useState<string[]>([]);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<InvoiceTemplate | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [invoicesData, templatesData] = await Promise.all([
        BillingService.getInvoices(),
        loadTemplates()
      ]);
      setInvoices(invoicesData);
      setTemplates(templatesData);
    } catch (error) {
      console.error('Error loading invoicing data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadTemplates = async (): Promise<InvoiceTemplate[]> => {
    // Mock templates - in production this would come from the service
    return [
      {
        id: 'default',
        name: 'Standard Template',
        description: 'Professional invoice template with firm branding',
        isDefault: true,
        branding: {
          primaryColor: '#2563eb',
          secondaryColor: '#1e40af'
        }
      },
      {
        id: 'premium',
        name: 'Premium Template',
        description: 'Enhanced template with advanced styling',
        isDefault: false,
        branding: {
          primaryColor: '#7c3aed',
          secondaryColor: '#5b21b6'
        }
      }
    ];
  };

  const filteredInvoices = useMemo(() => {
    return invoices.filter(invoice => {
      const matchesSearch = invoice.number.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           invoice.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           invoice.matterTitle?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = filters.status === 'all' || invoice.status === filters.status;
      const matchesClient = filters.client === 'all' || invoice.clientId === filters.client;
      
      return matchesSearch && matchesStatus && matchesClient;
    });
  }, [invoices, searchTerm, filters]);

  const invoiceStats = useMemo(() => {
    const total = invoices.length;
    const totalAmount = invoices.reduce((sum, inv) => sum + inv.total, 0);
    const outstanding = invoices
      .filter(inv => inv.status === 'sent' || inv.status === 'overdue')
      .reduce((sum, inv) => sum + inv.total, 0);
    const overdue = invoices
      .filter(inv => inv.status === 'overdue')
      .reduce((sum, inv) => sum + inv.total, 0);
    
    return { total, totalAmount, outstanding, overdue };
  }, [invoices]);

  const handleBulkAction = async (action: 'send' | 'archive' | 'delete') => {
    if (selectedInvoices.length === 0) return;

    try {
      for (const invoiceId of selectedInvoices) {
        switch (action) {
          case 'send':
            await BillingService.updateInvoiceStatus(invoiceId, 'sent');
            break;
          case 'archive':
            await BillingService.updateInvoiceStatus(invoiceId, 'cancelled');
            break;
          case 'delete':
            // In production, this would call a delete method
            console.log('Delete invoice:', invoiceId);
            break;
        }
      }
      
      setSelectedInvoices([]);
      await loadData();
    } catch (error) {
      console.error(`Error performing bulk ${action}:`, error);
    }
  };

  const handleSendInvoice = async (invoiceId: string) => {
    try {
      await BillingService.updateInvoiceStatus(invoiceId, 'sent');
      await loadData();
    } catch (error) {
      console.error('Error sending invoice:', error);
    }
  };

  const handleDuplicateInvoice = async (invoice: Invoice) => {
    try {
      const newInvoice: Omit<Invoice, 'id' | 'createdAt' | 'updatedAt'> = {
        ...invoice,
        number: `${invoice.number}-COPY`,
        status: 'draft',
        issueDate: new Date().toISOString(),
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
      };
      
      await BillingService.createInvoice(newInvoice);
      await loadData();
    } catch (error) {
      console.error('Error duplicating invoice:', error);
    }
  };

  const InvoiceCard: React.FC<{ invoice: Invoice }> = ({ invoice }) => {
    const statusConfig = INVOICE_STATUS_CONFIG[invoice.status];
    const isSelected = selectedInvoices.includes(invoice.id);
    const isOverdue = invoice.status === 'sent' && new Date(invoice.dueDate) < new Date();

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
                <Badge className={cn("text-xs", statusConfig.color)}>
                  {statusConfig.icon}
                  <span className="ml-1">{statusConfig.label}</span>
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground">{invoice.clientName}</p>
              {invoice.matterTitle && (
                <p className="text-xs text-muted-foreground">{invoice.matterTitle}</p>
              )}
            </div>
          </div>
          
          <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
            <div className="flex items-center">
              <Calendar className="h-3 w-3 mr-1" />
              {new Date(invoice.issueDate).toLocaleDateString()}
            </div>
            <div className="font-medium">${invoice.total.toFixed(2)}</div>
          </div>
          
          {isOverdue && (
            <div className="mt-2 p-2 bg-red-100 rounded text-xs text-red-700">
              <AlertTriangle className="h-3 w-3 inline mr-1" />
              Overdue by {Math.ceil((new Date().getTime() - new Date(invoice.dueDate).getTime()) / (1000 * 60 * 60 * 24))} days
            </div>
          )}
          
          <div className="flex justify-end mt-2 space-x-1">
            <Button
              size="sm"
              variant="outline"
              onClick={(e) => {
                e.stopPropagation();
                setSelectedInvoice(invoice);
                setShowInvoiceModal(true);
              }}
            >
              <Eye className="h-3 w-3" />
            </Button>
            {invoice.status === 'draft' && (
              <Button
                size="sm"
                variant="outline"
                onClick={(e) => {
                  e.stopPropagation();
                  handleSendInvoice(invoice.id);
                }}
              >
                <Send className="h-3 w-3" />
              </Button>
            )}
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
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
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
                <p className="text-sm text-muted-foreground">Total Invoices</p>
                <p className="text-2xl font-bold text-blue-600">{invoiceStats.total}</p>
              </div>
              <FileText className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Amount</p>
                <p className="text-2xl font-bold text-green-600">
                  ${(invoiceStats.totalAmount / 1000).toFixed(1)}K
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Outstanding</p>
                <p className="text-2xl font-bold text-orange-600">
                  ${(invoiceStats.outstanding / 1000).toFixed(1)}K
                </p>
              </div>
              <Clock className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Overdue</p>
                <p className="text-2xl font-bold text-red-600">
                  ${(invoiceStats.overdue / 1000).toFixed(1)}K
                </p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
      </div>

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
                  {Object.entries(INVOICE_STATUS_CONFIG).map(([status, config]) => (
                    <SelectItem key={status} value={status}>
                      {config.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex gap-2">
              {selectedInvoices.length > 0 && (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleBulkAction('send')}
                  >
                    <Send className="h-4 w-4 mr-2" />
                    Send ({selectedInvoices.length})
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleBulkAction('archive')}
                  >
                    <Archive className="h-4 w-4 mr-2" />
                    Archive ({selectedInvoices.length})
                  </Button>
                </>
              )}
              <Button
                onClick={onGenerateInvoice}
                className="bg-primary hover:bg-primary/90"
              >
                <Plus className="h-4 w-4 mr-2" />
                Generate Invoice
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Invoice Pipeline */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Draft Invoices */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center justify-between text-sm">
              <div className="flex items-center">
                <FileText className="h-4 w-4 mr-2" />
                Draft
              </div>
              <Badge variant="secondary">
                {filteredInvoices.filter(inv => inv.status === 'draft').length}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[600px]">
              <div className="space-y-2">
                {filteredInvoices
                  .filter(invoice => invoice.status === 'draft')
                  .map((invoice) => (
                    <InvoiceCard key={invoice.id} invoice={invoice} />
                  ))}
                {filteredInvoices.filter(inv => inv.status === 'draft').length === 0 && (
                  <div className="text-center text-muted-foreground text-sm py-8">
                    No draft invoices
                  </div>
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Sent Invoices */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center justify-between text-sm">
              <div className="flex items-center">
                <Send className="h-4 w-4 mr-2" />
                Sent
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
                    No sent invoices
                  </div>
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Paid Invoices */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center justify-between text-sm">
              <div className="flex items-center">
                <CheckCircle className="h-4 w-4 mr-2" />
                Paid
              </div>
              <Badge variant="secondary">
                {filteredInvoices.filter(inv => inv.status === 'paid').length}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[600px]">
              <div className="space-y-2">
                {filteredInvoices
                  .filter(invoice => invoice.status === 'paid')
                  .map((invoice) => (
                    <InvoiceCard key={invoice.id} invoice={invoice} />
                  ))}
                {filteredInvoices.filter(inv => inv.status === 'paid').length === 0 && (
                  <div className="text-center text-muted-foreground text-sm py-8">
                    No paid invoices
                  </div>
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>

      {/* Invoice Detail Modal */}
      <Dialog open={showInvoiceModal} onOpenChange={setShowInvoiceModal}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Invoice Details</DialogTitle>
            <DialogDescription>
              View and manage invoice details
            </DialogDescription>
          </DialogHeader>
          
          {selectedInvoice && (
            <div className="space-y-6">
              {/* Invoice Header */}
              <Card>
                <CardContent className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-xl font-bold">{selectedInvoice.number}</h3>
                      <p className="text-muted-foreground">{selectedInvoice.clientName}</p>
                      {selectedInvoice.matterTitle && (
                        <p className="text-muted-foreground">{selectedInvoice.matterTitle}</p>
                      )}
                    </div>
                    <div className="text-right">
                      <Badge className={cn("mb-2", INVOICE_STATUS_CONFIG[selectedInvoice.status].color)}>
                        {INVOICE_STATUS_CONFIG[selectedInvoice.status].label}
                      </Badge>
                      <p className="text-2xl font-bold">${selectedInvoice.total.toFixed(2)}</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Issue Date:</span>
                      <p>{new Date(selectedInvoice.issueDate).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Due Date:</span>
                      <p>{new Date(selectedInvoice.dueDate).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Payment Terms:</span>
                      <p>{selectedInvoice.paymentTerms}</p>
                    </div>
                    {selectedInvoice.paidDate && (
                      <div>
                        <span className="text-muted-foreground">Paid Date:</span>
                        <p>{new Date(selectedInvoice.paidDate).toLocaleDateString()}</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Invoice Items */}
              <Card>
                <CardHeader>
                  <CardTitle>Line Items</CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Description</TableHead>
                        <TableHead>Hours</TableHead>
                        <TableHead>Rate</TableHead>
                        <TableHead className="text-right">Amount</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {selectedInvoice.timeEntries.map((entry) => (
                        <TableRow key={entry.id}>
                          <TableCell>{entry.description}</TableCell>
                          <TableCell>{entry.hours}</TableCell>
                          <TableCell>${entry.rate}</TableCell>
                          <TableCell className="text-right">${entry.amount.toFixed(2)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  
                  <div className="mt-4 text-right space-y-2">
                    <div className="flex justify-between">
                      <span>Subtotal:</span>
                      <span>${selectedInvoice.subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Tax:</span>
                      <span>${selectedInvoice.tax.toFixed(2)}</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between font-bold">
                      <span>Total:</span>
                      <span>${selectedInvoice.total.toFixed(2)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Actions */}
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => handleDuplicateInvoice(selectedInvoice)}>
                  <Copy className="h-4 w-4 mr-2" />
                  Duplicate
                </Button>
                <Button variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  Download PDF
                </Button>
                {selectedInvoice.status === 'draft' && (
                  <Button onClick={() => handleSendInvoice(selectedInvoice.id)}>
                    <Send className="h-4 w-4 mr-2" />
                    Send Invoice
                  </Button>
                )}
                {selectedInvoice.status === 'sent' && (
                  <Button variant="outline">
                    <Mail className="h-4 w-4 mr-2" />
                    Send Reminder
                  </Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default InvoicingTab;