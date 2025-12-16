import React, { useCallback } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FileText } from 'lucide-react';
import { useInvoiceGeneration } from './useInvoiceGeneration';
import InvoiceFilters from './InvoiceFilters';
import InvoiceLineItems from './InvoiceLineItems';
import InvoicePreview from './InvoicePreview';
import { InvoicePreviewSkeleton, TimeEntryTableSkeleton } from '../skeletons';

interface InvoiceGeneratorModalProps {
  open: boolean;
  onClose: () => void;
}

/**
 * Invoice Details Tab Component - Memoized for performance
 */
const InvoiceDetailsTab = React.memo<{
  invoiceData: {
    invoiceNumber: string;
    dueDate: string;
    terms: string;
    notes: string;
  };
  onUpdate: <K extends 'invoiceNumber' | 'dueDate' | 'terms' | 'notes'>(
    key: K,
    value: string
  ) => void;
}>(({ invoiceData, onUpdate }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Invoice Information</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="invoiceNumber">Invoice Number</Label>
            <Input
              value={invoiceData.invoiceNumber}
              onChange={(e) => onUpdate('invoiceNumber', e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="dueDate">Due Date</Label>
            <Input
              type="date"
              value={invoiceData.dueDate}
              onChange={(e) => onUpdate('dueDate', e.target.value)}
            />
          </div>
        </div>
        <div>
          <Label htmlFor="terms">Payment Terms (days)</Label>
          <Select 
            value={invoiceData.terms} 
            onValueChange={(value) => onUpdate('terms', value)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="15">15 days</SelectItem>
              <SelectItem value="30">30 days</SelectItem>
              <SelectItem value="60">60 days</SelectItem>
              <SelectItem value="90">90 days</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="notes">Notes</Label>
          <Textarea
            placeholder="Additional notes for the invoice..."
            value={invoiceData.notes}
            onChange={(e) => onUpdate('notes', e.target.value)}
          />
        </div>
      </CardContent>
    </Card>
  );
});

InvoiceDetailsTab.displayName = 'InvoiceDetailsTab';

/**
 * InvoiceGeneratorModal - Main modal component
 * Performance optimizations:
 * - Uses custom hook for state management and calculations
 * - All child components are memoized
 * - Callbacks are optimized with useCallback
 * - Expensive calculations are memoized in the hook
 * - Filter inputs are debounced
 */
const InvoiceGeneratorModal: React.FC<InvoiceGeneratorModalProps> = ({ open, onClose }) => {
  const {
    isLoading,
    invoiceData,
    clients,
    matters,
    filteredEntries,
    selectedEntries,
    entriesByMatter,
    calculations,
    handleSelectAll,
    handleSelectEntry,
    updateInvoiceData,
    handleGenerateInvoice
  } = useInvoiceGeneration(open);

  // Memoize the close handler
  const handleClose = useCallback(() => {
    onClose();
  }, [onClose]);

  // Memoize the generate handler
  const handleGenerate = useCallback(() => {
    handleGenerateInvoice(handleClose);
  }, [handleGenerateInvoice, handleClose]);

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <FileText className="h-5 w-5 text-primary" />
            <span>Generate Invoice</span>
          </DialogTitle>
          <DialogDescription>
            Create an invoice from billable time entries
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="entries" className="flex-1 overflow-hidden">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="entries">Select Entries</TabsTrigger>
            <TabsTrigger value="details">Invoice Details</TabsTrigger>
            <TabsTrigger value="preview">Preview</TabsTrigger>
          </TabsList>

          <TabsContent value="entries" className="flex-1 overflow-y-auto space-y-4">
            <InvoiceFilters
              clientFilter={invoiceData.clientFilter}
              matterFilter={invoiceData.matterFilter}
              dateFrom={invoiceData.dateFrom}
              dateTo={invoiceData.dateTo}
              clients={clients}
              matters={matters}
              onFilterChange={updateInvoiceData}
            />
            
            <InvoiceLineItems
              entries={filteredEntries}
              selectedEntries={selectedEntries}
              isLoading={isLoading}
              totalHours={calculations.totalHours}
              subtotal={calculations.subtotal}
              onSelectAll={handleSelectAll}
              onSelectEntry={handleSelectEntry}
            />
          </TabsContent>

          <TabsContent value="details" className="space-y-4">
            <InvoiceDetailsTab
              invoiceData={invoiceData}
              onUpdate={updateInvoiceData}
            />
          </TabsContent>

          <TabsContent value="preview" className="space-y-4">
            <InvoicePreview
              invoiceNumber={invoiceData.invoiceNumber}
              dueDate={invoiceData.dueDate}
              entriesByMatter={entriesByMatter}
              selectedEntriesCount={selectedEntries.size}
              calculations={calculations}
            />
          </TabsContent>
        </Tabs>

        <DialogFooter className="border-t pt-4">
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button 
            onClick={handleGenerate}
            disabled={selectedEntries.size === 0}
          >
            <FileText className="h-4 w-4 mr-2" />
            Generate Invoice
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default InvoiceGeneratorModal;