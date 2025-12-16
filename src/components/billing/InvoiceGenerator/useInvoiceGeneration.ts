import { useState, useEffect, useMemo, useCallback } from 'react';
import { TimeEntry } from '@/types/billing';
import { BillingService } from '@/services/billingService';
import { useToast } from '@/components/ui/use-toast';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';

interface InvoiceData {
  clientFilter: string;
  matterFilter: string;
  dateFrom: string;
  dateTo: string;
  invoiceNumber: string;
  dueDate: string;
  notes: string;
  terms: string;
}

interface Matter {
  id: string;
  title: string;
  clientName: string;
}

export const useInvoiceGeneration = (open: boolean) => {
  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>([]);
  const [selectedEntries, setSelectedEntries] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);
  const [invoiceData, setInvoiceData] = useState<InvoiceData>({
    clientFilter: 'all-clients',
    matterFilter: 'all-matters',
    dateFrom: '',
    dateTo: '',
    invoiceNumber: '',
    dueDate: '',
    notes: '',
    terms: '30'
  });
  const [matters, setMatters] = useState<Matter[]>([]);
  const { toast } = useToast();

  // Debounce filter values to prevent excessive re-renders during typing
  const debouncedClientFilter = useDebouncedValue(invoiceData.clientFilter, 300);
  const debouncedDateFrom = useDebouncedValue(invoiceData.dateFrom, 300);
  const debouncedDateTo = useDebouncedValue(invoiceData.dateTo, 300);

  // Extract unique clients with memoization
  const clients = useMemo(() => {
    return Array.from(new Set(matters.map(m => m.clientName)));
  }, [matters]);

  // Generate invoice number
  const generateInvoiceNumber = useCallback(() => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `INV-${year}-${month}-${random}`;
  }, []);

  // Set default due date
  const getDefaultDueDate = useCallback(() => {
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 30);
    return dueDate.toISOString().split('T')[0];
  }, []);

  // Load billable entries
  const loadBillableEntries = useCallback(async () => {
    try {
      setIsLoading(true);
      const entries = await BillingService.getTimeEntries({ status: 'submitted' });
      const billableEntries = entries.filter(e => e.billable);
      setTimeEntries(billableEntries);
    } catch (error) {
      console.error('Error loading billable entries:', error);
      toast({
        title: "Error loading entries",
        description: "Unable to load billable time entries.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  // Load filters
  const loadFilters = useCallback(async () => {
    try {
      const mattersList = await BillingService.getMattersForTimeEntry();
      setMatters(mattersList);
    } catch (error) {
      console.error('Error loading filters:', error);
    }
  }, []);

  // Initialize data when modal opens
  useEffect(() => {
    if (open) {
      loadBillableEntries();
      loadFilters();
      setInvoiceData(prev => ({
        ...prev,
        invoiceNumber: generateInvoiceNumber(),
        dueDate: getDefaultDueDate()
      }));
    }
  }, [open, loadBillableEntries, loadFilters, generateInvoiceNumber, getDefaultDueDate]);

  // Memoized filtered entries using debounced values
  const filteredEntries = useMemo(() => {
    return timeEntries.filter(entry => {
      if (debouncedClientFilter && debouncedClientFilter !== 'all-clients' && 
          !entry.clientName.toLowerCase().includes(debouncedClientFilter.toLowerCase())) {
        return false;
      }
      if (invoiceData.matterFilter && invoiceData.matterFilter !== 'all-matters' && 
          entry.matterId !== invoiceData.matterFilter) {
        return false;
      }
      if (debouncedDateFrom && entry.date < debouncedDateFrom) {
        return false;
      }
      if (debouncedDateTo && entry.date > debouncedDateTo) {
        return false;
      }
      return true;
    });
  }, [timeEntries, debouncedClientFilter, invoiceData.matterFilter, debouncedDateFrom, debouncedDateTo]);

  // Selected entries data
  const selectedEntriesData = useMemo(() => {
    return filteredEntries.filter(e => selectedEntries.has(e.id));
  }, [filteredEntries, selectedEntries]);

  // Calculate totals with memoization
  const calculations = useMemo(() => {
    const subtotal = selectedEntriesData.reduce((sum, e) => sum + e.amount, 0);
    const tax = subtotal * 0.1; // 10% tax
    const total = subtotal + tax;
    const totalHours = selectedEntriesData.reduce((sum, e) => sum + e.hours, 0);
    
    return { subtotal, tax, total, totalHours };
  }, [selectedEntriesData]);

  // Group entries by matter with memoization
  const entriesByMatter = useMemo(() => {
    return selectedEntriesData.reduce((acc, entry) => {
      const key = entry.matterId;
      if (!acc[key]) {
        acc[key] = {
          matterTitle: entry.matterTitle,
          clientName: entry.clientName,
          entries: []
        };
      }
      acc[key].entries.push(entry);
      return acc;
    }, {} as Record<string, { matterTitle: string; clientName: string; entries: TimeEntry[] }>);
  }, [selectedEntriesData]);

  // Handle select all with useCallback
  const handleSelectAll = useCallback((checked: boolean) => {
    if (checked) {
      setSelectedEntries(new Set(filteredEntries.map(e => e.id)));
    } else {
      setSelectedEntries(new Set());
    }
  }, [filteredEntries]);

  // Handle select entry with useCallback
  const handleSelectEntry = useCallback((entryId: string, checked: boolean) => {
    setSelectedEntries(prev => {
      const newSelected = new Set(prev);
      if (checked) {
        newSelected.add(entryId);
      } else {
        newSelected.delete(entryId);
      }
      return newSelected;
    });
  }, []);

  // Update invoice data with useCallback
  const updateInvoiceData = useCallback(<K extends keyof InvoiceData>(
    key: K,
    value: InvoiceData[K]
  ) => {
    setInvoiceData(prev => ({ ...prev, [key]: value }));
  }, []);

  // Generate invoice handler
  const handleGenerateInvoice = useCallback(async (onSuccess: () => void) => {
    if (selectedEntries.size === 0) {
      toast({
        title: "No entries selected",
        description: "Please select at least one time entry to include in the invoice.",
        variant: "destructive"
      });
      return;
    }

    try {
      // Get the selected time entries
      const entriesToInvoice = selectedEntriesData;
      
      // Create the invoice
      const invoice = await BillingService.createInvoice({
        number: invoiceData.invoiceNumber,
        clientId: entriesToInvoice[0].clientId,
        clientName: entriesToInvoice[0].clientName,
        matterId: invoiceData.matterFilter !== 'all-matters' ? invoiceData.matterFilter : undefined,
        matterTitle: invoiceData.matterFilter !== 'all-matters' 
          ? entriesToInvoice.find(e => e.matterId === invoiceData.matterFilter)?.matterTitle 
          : undefined,
        status: 'draft',
        issueDate: new Date().toISOString().split('T')[0],
        dueDate: invoiceData.dueDate,
        subtotal: calculations.subtotal,
        tax: calculations.tax,
        total: calculations.total,
        timeEntries: entriesToInvoice,
        expenses: [],
        notes: invoiceData.notes,
        paymentTerms: invoiceData.terms
      });

      // Update time entries to 'billed' status
      for (const entry of entriesToInvoice) {
        await BillingService.updateTimeEntry(entry.id, { status: 'billed' });
      }

      toast({
        title: "Invoice generated successfully",
        description: `Invoice ${invoice.number} has been created with ${selectedEntries.size} time entries.`
      });

      onSuccess();
    } catch (error) {
      console.error('Error generating invoice:', error);
      toast({
        title: "Error generating invoice",
        description: "Please try again.",
        variant: "destructive"
      });
    }
  }, [selectedEntries, selectedEntriesData, invoiceData, calculations, toast]);

  return {
    // State
    timeEntries,
    selectedEntries,
    isLoading,
    invoiceData,
    clients,
    matters,
    filteredEntries,
    selectedEntriesData,
    entriesByMatter,
    calculations,
    
    // Actions
    handleSelectAll,
    handleSelectEntry,
    updateInvoiceData,
    handleGenerateInvoice
  };
};