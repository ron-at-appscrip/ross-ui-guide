
import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Eye, Download, DollarSign, Calendar } from 'lucide-react';
import InvoiceModalEnhanced from './modals/InvoiceModalEnhanced';
import ViewInvoiceModal from './modals/ViewInvoiceModal';
import { useToast } from '@/hooks/use-toast';

interface ClientBillingProps {
  clientId: string;
}

// Mock data for billing
const mockInvoices = [
  {
    id: 'INV-2024-005',
    date: '2024-03-01',
    amount: 5500,
    status: 'paid',
    dueDate: '2024-03-31',
    matter: 'Contract Review - Software License'
  },
  {
    id: 'INV-2024-004',
    date: '2024-02-01',
    amount: 3250,
    status: 'pending',
    dueDate: '2024-03-15',
    matter: 'Employment Dispute Resolution'
  },
  {
    id: 'INV-2024-003',
    date: '2024-01-01',
    amount: 7800,
    status: 'paid',
    dueDate: '2024-01-31',
    matter: 'IP Portfolio Review'
  }
];

const mockTimeEntries = [
  {
    id: '1',
    date: '2024-03-10',
    attorney: 'Sarah Johnson',
    matter: 'Contract Review - Software License',
    description: 'Review software licensing agreement terms',
    hours: 2.5,
    rate: 450,
    amount: 1125
  },
  {
    id: '2',
    date: '2024-03-09',
    attorney: 'Michael Chen',
    matter: 'Employment Dispute Resolution',
    description: 'Client consultation and case strategy',
    hours: 1.0,
    rate: 425,
    amount: 425
  }
];

const ClientBilling = ({ clientId }: ClientBillingProps) => {
  const { toast } = useToast();
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [showViewInvoiceModal, setShowViewInvoiceModal] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<any>(null);

  const getStatusBadge = (status: string) => {
    const variants = {
      paid: 'default',
      pending: 'outline',
      overdue: 'destructive'
    } as const;
    
    return <Badge variant={variants[status as keyof typeof variants]}>{status}</Badge>;
  };

  const totalBilled = mockInvoices.reduce((sum, invoice) => sum + invoice.amount, 0);
  const totalPaid = mockInvoices.filter(inv => inv.status === 'paid').reduce((sum, invoice) => sum + invoice.amount, 0);
  const totalOutstanding = totalBilled - totalPaid;

  const handleViewInvoice = (invoice: any) => {
    setSelectedInvoice(invoice);
    setShowViewInvoiceModal(true);
  };

  const handleDownloadInvoice = async (invoice: any) => {
    try {
      // Simulate download
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast({
        title: "Download Started",
        description: `Invoice ${invoice.id} is being downloaded.`,
      });
    } catch (error) {
      toast({
        title: "Download Failed",
        description: "Failed to download invoice. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Mock client name for modals
  const clientName = "John Smith"; // This would come from props in real implementation

  return (
    <div className="space-y-6">
      {/* Billing Summary */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Total Billed</p>
                <p className="text-2xl font-bold">${totalBilled.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-green-600" />
              <div>
                <p className="text-sm text-muted-foreground">Total Paid</p>
                <p className="text-2xl font-bold text-green-600">${totalPaid.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-orange-600" />
              <div>
                <p className="text-sm text-muted-foreground">Outstanding</p>
                <p className="text-2xl font-bold text-orange-600">${totalOutstanding.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Invoices */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Invoices</CardTitle>
            <Button onClick={() => setShowInvoiceModal(true)}>
              <Plus className="h-4 w-4 mr-2" />
              New Invoice
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Invoice #</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Matter</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-[100px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockInvoices.map((invoice) => (
                <TableRow key={invoice.id}>
                  <TableCell className="font-medium">{invoice.id}</TableCell>
                  <TableCell>{invoice.date}</TableCell>
                  <TableCell>{invoice.matter}</TableCell>
                  <TableCell className="font-medium">${invoice.amount.toLocaleString()}</TableCell>
                  <TableCell>{invoice.dueDate}</TableCell>
                  <TableCell>{getStatusBadge(invoice.status)}</TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleViewInvoice(invoice)}
                        title="View Invoice"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleDownloadInvoice(invoice)}
                        title="Download Invoice"
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Recent Time Entries */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Time Entries</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Attorney</TableHead>
                <TableHead>Matter</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Hours</TableHead>
                <TableHead>Rate</TableHead>
                <TableHead>Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockTimeEntries.map((entry) => (
                <TableRow key={entry.id}>
                  <TableCell>{entry.date}</TableCell>
                  <TableCell>{entry.attorney}</TableCell>
                  <TableCell className="max-w-[150px] truncate">{entry.matter}</TableCell>
                  <TableCell className="max-w-[200px] truncate">{entry.description}</TableCell>
                  <TableCell>{entry.hours}h</TableCell>
                  <TableCell>${entry.rate}/h</TableCell>
                  <TableCell className="font-medium">${entry.amount.toLocaleString()}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Invoice Modals */}
      <InvoiceModalEnhanced
        isOpen={showInvoiceModal}
        onClose={() => setShowInvoiceModal(false)}
        clientId={clientId}
        clientName={clientName}
      />

      <ViewInvoiceModal
        isOpen={showViewInvoiceModal}
        onClose={() => setShowViewInvoiceModal(false)}
        invoice={selectedInvoice}
        clientName={clientName}
      />
    </div>
  );
};

export default ClientBilling;
