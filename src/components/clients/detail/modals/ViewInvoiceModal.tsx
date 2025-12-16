import React, { useState } from 'react';
import ResponsiveModal from '@/components/ui/responsive-modal';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { 
  FileText, 
  Download, 
  Mail, 
  Printer, 
  DollarSign, 
  Calendar,
  Building,
  User,
  Clock,
  Send,
  Eye
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Invoice {
  id: string;
  date: string;
  amount: number;
  status: 'paid' | 'pending' | 'overdue';
  dueDate: string;
  matter: string;
  invoiceNumber?: string;
  terms?: string;
  notes?: string;
  lineItems?: Array<{
    id: string;
    description: string;
    quantity: number;
    rate: number;
    amount: number;
  }>;
}

interface ViewInvoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  invoice: Invoice | null;
  clientName: string;
}

const ViewInvoiceModal = ({ isOpen, onClose, invoice, clientName }: ViewInvoiceModalProps) => {
  const { toast } = useToast();
  const [isDownloading, setIsDownloading] = useState(false);
  const [isSending, setIsSending] = useState(false);

  if (!invoice) return null;

  const getStatusBadge = (status: string) => {
    const variants = {
      paid: { color: 'bg-green-50 text-green-700 border-green-200', label: 'Paid' },
      pending: { color: 'bg-yellow-50 text-yellow-700 border-yellow-200', label: 'Pending' },
      overdue: { color: 'bg-red-50 text-red-700 border-red-200', label: 'Overdue' }
    };
    
    const variant = variants[status as keyof typeof variants] || variants.pending;
    return (
      <Badge variant="outline" className={variant.color}>
        {variant.label}
      </Badge>
    );
  };

  const handleDownload = async () => {
    setIsDownloading(true);
    try {
      // Simulate PDF generation and download
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      toast({
        title: "Download Complete",
        description: `Invoice ${invoice.invoiceNumber || invoice.id} has been downloaded.`,
      });
    } catch (error) {
      toast({
        title: "Download Failed",
        description: "Failed to download invoice. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsDownloading(false);
    }
  };

  const handleSendEmail = async () => {
    setIsSending(true);
    try {
      // Simulate email sending
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: "Invoice Sent",
        description: `Invoice has been sent to the client via email.`,
      });
    } catch (error) {
      toast({
        title: "Send Failed",
        description: "Failed to send invoice. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSending(false);
    }
  };

  const handlePrint = () => {
    // Simulate print functionality
    window.print();
    toast({
      title: "Print Dialog Opened",
      description: "Invoice is ready for printing.",
    });
  };

  // Mock line items if not provided
  const lineItems = invoice.lineItems || [
    {
      id: '1',
      description: invoice.matter || 'Legal Services',
      quantity: 1,
      rate: invoice.amount,
      amount: invoice.amount
    }
  ];

  const subtotal = lineItems.reduce((sum, item) => sum + item.amount, 0);
  const tax = subtotal * 0.08; // 8% tax rate
  const total = subtotal + tax;

  return (
    <ResponsiveModal
      isOpen={isOpen}
      onClose={onClose}
      title="Invoice Details"
      description={`View and manage invoice ${invoice.invoiceNumber || invoice.id}`}
      size="xl"
    >

        <div className="space-y-6">
          {/* Invoice Header */}
          <Card>
            <CardContent className="p-6">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-2xl font-bold mb-2">INVOICE</h2>
                  <p className="text-lg font-semibold">#{invoice.invoiceNumber || invoice.id}</p>
                </div>
                <div className="text-right">
                  {getStatusBadge(invoice.status)}
                  <p className="text-sm text-muted-foreground mt-2">
                    Issue Date: {new Date(invoice.date).toLocaleDateString()}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Due Date: {new Date(invoice.dueDate).toLocaleDateString()}
                  </p>
                </div>
              </div>

              {/* Billing Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <h3 className="font-semibold mb-2 flex items-center gap-2">
                    <Building className="h-4 w-4" />
                    Bill From
                  </h3>
                  <div className="text-sm space-y-1">
                    <p className="font-medium">Your Law Firm</p>
                    <p>123 Legal Street</p>
                    <p>New York, NY 10001</p>
                    <p>contact@lawfirm.com</p>
                    <p>(555) 123-4567</p>
                  </div>
                </div>
                
                <div>
                  <h3 className="font-semibold mb-2 flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Bill To
                  </h3>
                  <div className="text-sm space-y-1">
                    <p className="font-medium">{clientName}</p>
                    <p>Client Address Line 1</p>
                    <p>Client Address Line 2</p>
                    <p>client@email.com</p>
                  </div>
                </div>
              </div>

              <Separator className="my-6" />

              {/* Matter Information */}
              <div className="mb-6">
                <h3 className="font-semibold mb-2">Matter Information</h3>
                <p className="text-sm">{invoice.matter}</p>
                {invoice.terms && (
                  <p className="text-sm text-muted-foreground mt-1">
                    Payment Terms: {invoice.terms}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Line Items */}
          <Card>
            <CardHeader>
              <CardTitle>Services & Charges</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Description</TableHead>
                    <TableHead className="text-center">Quantity</TableHead>
                    <TableHead className="text-right">Rate</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {lineItems.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>{item.description}</TableCell>
                      <TableCell className="text-center">{item.quantity}</TableCell>
                      <TableCell className="text-right">${item.rate.toFixed(2)}</TableCell>
                      <TableCell className="text-right font-medium">${item.amount.toFixed(2)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              <Separator className="my-4" />

              {/* Invoice Totals */}
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Tax (8%):</span>
                  <span>${tax.toFixed(2)}</span>
                </div>
                <Separator />
                <div className="flex justify-between text-lg font-bold">
                  <span>Total:</span>
                  <span className="flex items-center gap-1">
                    <DollarSign className="h-4 w-4" />
                    ${total.toFixed(2)}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Notes */}
          {invoice.notes && (
            <Card>
              <CardHeader>
                <CardTitle>Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm">{invoice.notes}</p>
              </CardContent>
            </Card>
          )}

          {/* Payment Information */}
          <Card>
            <CardHeader>
              <CardTitle>Payment Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="font-medium mb-2">Payment Status</p>
                  {getStatusBadge(invoice.status)}
                  {invoice.status === 'paid' && (
                    <p className="text-green-600 mt-1 flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      Paid on {new Date(invoice.date).toLocaleDateString()}
                    </p>
                  )}
                </div>
                <div>
                  <p className="font-medium mb-2">Payment Methods</p>
                  <p>Bank Transfer, Check, Online Payment</p>
                  <p className="text-muted-foreground">
                    Please reference invoice #{invoice.invoiceNumber || invoice.id}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex flex-col sm:flex-row justify-between gap-3 pt-6 mt-6 border-t">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={handlePrint}
              className="gap-2"
            >
              <Printer className="h-4 w-4" />
              Print
            </Button>
            <Button
              variant="outline"
              onClick={handleSendEmail}
              disabled={isSending}
              className="gap-2"
            >
              <Mail className="h-4 w-4" />
              {isSending ? "Sending..." : "Send"}
            </Button>
            <Button
              onClick={handleDownload}
              disabled={isDownloading}
              className="gap-2"
            >
              <Download className="h-4 w-4" />
              {isDownloading ? "Downloading..." : "Download"}
            </Button>
          </div>
        </div>
    </ResponsiveModal>
  );
};

export default ViewInvoiceModal;