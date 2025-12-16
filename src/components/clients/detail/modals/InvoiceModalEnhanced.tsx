import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import ResponsiveModal, { MultiStepModal, ModalStep } from '@/components/ui/responsive-modal';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Trash2, DollarSign, FileText, Calendar, ArrowRight, ArrowLeft, Clock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const invoiceSchema = z.object({
  invoiceNumber: z.string().min(1, 'Invoice number is required'),
  clientId: z.string().min(1, 'Client is required'),
  matterId: z.string().optional(),
  issueDate: z.string().min(1, 'Issue date is required'),
  dueDate: z.string().min(1, 'Due date is required'),
  terms: z.string().default('Net 30'),
  notes: z.string().optional(),
  lineItems: z.array(z.object({
    id: z.string(),
    description: z.string().min(1, 'Description is required'),
    quantity: z.number().min(0.01, 'Quantity must be greater than 0'),
    rate: z.number().min(0, 'Rate must be 0 or greater'),
    amount: z.number().min(0, 'Amount must be 0 or greater'),
  })).min(1, 'At least one line item is required'),
});

type InvoiceFormData = z.infer<typeof invoiceSchema>;

interface LineItem {
  id: string;
  description: string;
  quantity: number;
  rate: number;
  amount: number;
}

interface InvoiceModalEnhancedProps {
  isOpen: boolean;
  onClose: () => void;
  clientId: string;
  clientName: string;
}

const InvoiceModalEnhanced = ({ isOpen, onClose, clientId, clientName }: InvoiceModalEnhancedProps) => {
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [lineItems, setLineItems] = useState<LineItem[]>([
    {
      id: '1',
      description: 'Legal consultation',
      quantity: 1,
      rate: 750,
      amount: 750,
    }
  ]);

  const form = useForm<InvoiceFormData>({
    resolver: zodResolver(invoiceSchema),
    defaultValues: {
      invoiceNumber: `INV-${new Date().getFullYear()}-${String(Date.now()).slice(-6)}`,
      clientId,
      issueDate: new Date().toISOString().split('T')[0],
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      terms: 'Net 30',
      notes: '',
      lineItems,
    },
  });

  const addLineItem = () => {
    const newItem: LineItem = {
      id: String(Date.now()),
      description: '',
      quantity: 1,
      rate: 750,
      amount: 750,
    };
    const updatedItems = [...lineItems, newItem];
    setLineItems(updatedItems);
    form.setValue('lineItems', updatedItems);
  };

  const removeLineItem = (id: string) => {
    const updatedItems = lineItems.filter(item => item.id !== id);
    setLineItems(updatedItems);
    form.setValue('lineItems', updatedItems);
  };

  const updateLineItem = (id: string, field: keyof LineItem, value: any) => {
    const updatedItems = lineItems.map(item => {
      if (item.id === id) {
        const updatedItem = { ...item, [field]: value };
        if (field === 'quantity' || field === 'rate') {
          updatedItem.amount = updatedItem.quantity * updatedItem.rate;
        }
        return updatedItem;
      }
      return item;
    });
    setLineItems(updatedItems);
    form.setValue('lineItems', updatedItems);
  };

  const calculateTotals = () => {
    const subtotal = lineItems.reduce((sum, item) => sum + item.amount, 0);
    const tax = subtotal * 0.08; // 8% tax
    const total = subtotal + tax;
    return { subtotal, tax, total };
  };

  const onSubmit = async (data: InvoiceFormData) => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast({
        title: "Invoice Created",
        description: `Invoice ${data.invoiceNumber} has been created successfully.`,
      });
      
      onClose();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create invoice. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const { subtotal, tax, total } = calculateTotals();

  const steps = [
    {
      title: "Invoice Details",
      description: "Basic invoice information and client details",
      content: (
        <ModalStep>
          <Form {...form}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="invoiceNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Invoice Number</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="INV-2024-001" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="matterId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Matter (Optional)</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select matter" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="1">Corporate Merger - TechFusion</SelectItem>
                        <SelectItem value="2">IP Portfolio Review</SelectItem>
                        <SelectItem value="3">Employment Dispute</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="issueDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Issue Date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="dueDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Due Date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="terms"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Payment Terms</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Net 15">Net 15</SelectItem>
                        <SelectItem value="Net 30">Net 30</SelectItem>
                        <SelectItem value="Net 45">Net 45</SelectItem>
                        <SelectItem value="Net 60">Net 60</SelectItem>
                        <SelectItem value="Due on Receipt">Due on Receipt</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <div className="mt-4">
              <Card className="bg-blue-50 border-blue-200">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 text-blue-700">
                    <Clock className="h-4 w-4" />
                    <span className="font-medium">Bill To:</span>
                  </div>
                  <div className="mt-2 text-blue-600">
                    <p className="font-semibold">{clientName}</p>
                    <p className="text-sm">Primary client for this invoice</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </Form>
        </ModalStep>
      )
    },
    {
      title: "Line Items",
      description: "Add services and charges for this invoice",
      content: (
        <ModalStep>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-medium">Invoice Items</h4>
              <Button 
                type="button" 
                variant="outline" 
                size="sm"
                onClick={addLineItem}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Item
              </Button>
            </div>
            
            <div className="space-y-2">
              {lineItems.map((item, index) => (
                <Card key={item.id} className="p-4">
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-start">
                    <div className="md:col-span-5">
                      <Input
                        placeholder="Description of service..."
                        value={item.description}
                        onChange={(e) => updateLineItem(item.id, 'description', e.target.value)}
                        className="w-full"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <Input
                        type="number"
                        placeholder="Qty"
                        value={item.quantity}
                        onChange={(e) => updateLineItem(item.id, 'quantity', parseFloat(e.target.value) || 0)}
                        step="0.01"
                        min="0"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <Input
                        type="number"
                        placeholder="Rate"
                        value={item.rate}
                        onChange={(e) => updateLineItem(item.id, 'rate', parseFloat(e.target.value) || 0)}
                        step="0.01"
                        min="0"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <Input
                        type="number"
                        value={item.amount}
                        readOnly
                        className="bg-muted"
                      />
                    </div>
                    <div className="md:col-span-1">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeLineItem(item.id)}
                        disabled={lineItems.length === 1}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
            
            <Card className="bg-muted/30">
              <CardContent className="p-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span className="font-medium">${subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Tax (8%):</span>
                    <span className="font-medium">${tax.toFixed(2)}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total:</span>
                    <span>${total.toFixed(2)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </ModalStep>
      )
    },
    {
      title: "Review & Create",
      description: "Review invoice details and add optional notes",
      content: (
        <ModalStep>
          <Form {...form}>
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Invoice Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <p><strong>Invoice #:</strong> {form.getValues('invoiceNumber')}</p>
                      <p><strong>Client:</strong> {clientName}</p>
                      <p><strong>Issue Date:</strong> {form.getValues('issueDate')}</p>
                      <p><strong>Due Date:</strong> {form.getValues('dueDate')}</p>
                    </div>
                    <div>
                      <p><strong>Terms:</strong> {form.getValues('terms')}</p>
                      <p><strong>Items:</strong> {lineItems.length}</p>
                      <p><strong>Subtotal:</strong> ${subtotal.toFixed(2)}</p>
                      <p><strong>Total:</strong> ${total.toFixed(2)}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notes (Optional)</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Additional notes for this invoice..."
                        {...field}
                        rows={3}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </Form>
        </ModalStep>
      )
    }
  ];

  return (
    <MultiStepModal
      isOpen={isOpen}
      onClose={onClose}
      size="lg"
      steps={steps}
      currentStep={currentStep}
      onStepChange={setCurrentStep}
      showCloseButton={!isLoading}
    >
      <div className="flex items-center justify-between pt-4">
        <Button
          variant="outline"
          onClick={prevStep}
          disabled={currentStep === 0 || isLoading}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Previous
        </Button>
        
        {currentStep < steps.length - 1 ? (
          <Button onClick={nextStep} disabled={isLoading}>
            Next
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        ) : (
          <Button 
            onClick={form.handleSubmit(onSubmit)} 
            disabled={isLoading}
            className="bg-primary hover:bg-primary/90"
          >
            {isLoading ? 'Creating...' : 'Create Invoice'}
            <FileText className="h-4 w-4 ml-2" />
          </Button>
        )}
      </div>
    </MultiStepModal>
  );
};

export default InvoiceModalEnhanced;