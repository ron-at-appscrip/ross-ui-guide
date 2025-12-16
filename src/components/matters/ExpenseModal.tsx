import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { CalendarIcon, DollarSign, Upload, X } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

interface ExpenseModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (expense: ExpenseData) => void;
  matterId: string;
  matterTitle: string;
  clientName: string;
}

interface ExpenseData {
  matterId: string;
  description: string;
  amount: number;
  category: string;
  date: string;
  billable: boolean;
  receipt?: File;
  vendor?: string;
  notes?: string;
}

const expenseCategories = [
  'Travel',
  'Meals & Entertainment',
  'Office Supplies',
  'Filing Fees',
  'Expert Witnesses',
  'Photocopying',
  'Postage & Shipping',
  'Long Distance',
  'Research',
  'Software & Technology',
  'Professional Services',
  'Other'
];

const ExpenseModal: React.FC<ExpenseModalProps> = ({
  open,
  onClose,
  onSubmit,
  matterId,
  matterTitle,
  clientName
}) => {
  const [formData, setFormData] = useState<ExpenseData>({
    matterId,
    description: '',
    amount: 0,
    category: '',
    date: new Date().toISOString().split('T')[0],
    billable: true,
    vendor: '',
    notes: ''
  });
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }

    if (formData.amount <= 0) {
      newErrors.amount = 'Amount must be greater than 0';
    }

    if (!formData.category) {
      newErrors.category = 'Category is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    
    try {
      await onSubmit({
        ...formData,
        date: format(selectedDate, 'yyyy-MM-dd'),
        receipt: receiptFile || undefined
      });
      
      // Reset form
      setFormData({
        matterId,
        description: '',
        amount: 0,
        category: '',
        date: new Date().toISOString().split('T')[0],
        billable: true,
        vendor: '',
        notes: ''
      });
      setSelectedDate(new Date());
      setReceiptFile(null);
      onClose();
    } catch (error) {
      console.error('Error submitting expense:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: keyof ExpenseData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setErrors(prev => ({ ...prev, receipt: 'File size must be less than 5MB' }));
        return;
      }
      
      // Validate file type
      const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf'];
      if (!validTypes.includes(file.type)) {
        setErrors(prev => ({ ...prev, receipt: 'Only JPEG, PNG, GIF, and PDF files are allowed' }));
        return;
      }
      
      setReceiptFile(file);
      setErrors(prev => ({ ...prev, receipt: '' }));
    }
  };

  const removeReceipt = () => {
    setReceiptFile(null);
    const fileInput = document.getElementById('receipt') as HTMLInputElement;
    if (fileInput) fileInput.value = '';
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <DollarSign className="h-5 w-5" />
            <span>Add Expense</span>
          </DialogTitle>
          <DialogDescription>
            Record an expense for {matterTitle} - {clientName}
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto px-1">
          <form id="expenseForm" onSubmit={handleSubmit} className="space-y-6">
          {/* Date Selection */}
          <div className="space-y-2">
            <Label htmlFor="date">Date *</Label>
            <div className="space-y-2">
              {/* Quick Date Buttons */}
              <div className="flex gap-2 flex-wrap">
                <Button
                  type="button"
                  variant={format(selectedDate, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd') ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedDate(new Date())}
                >
                  Today
                </Button>
                <Button
                  type="button"
                  variant={format(selectedDate, 'yyyy-MM-dd') === format(new Date(Date.now() - 86400000), 'yyyy-MM-dd') ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedDate(new Date(Date.now() - 86400000))}
                >
                  Yesterday
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const monday = new Date();
                    monday.setDate(monday.getDate() - monday.getDay() + 1);
                    setSelectedDate(monday);
                  }}
                >
                  This Week
                </Button>
              </div>
              
              {/* Calendar Picker */}
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    type="button"
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !selectedDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {selectedDate ? format(selectedDate, "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={(date) => {
                      if (date) {
                        setSelectedDate(date);
                      }
                    }}
                    disabled={(date) => date > new Date()}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              <p className="text-xs text-muted-foreground">
                Select the date when this expense was incurred (cannot be in the future)
              </p>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description *</Label>
            <Input
              id="description"
              placeholder="Brief description of the expense..."
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              className={errors.description ? 'border-red-500' : ''}
            />
            {errors.description && (
              <p className="text-sm text-red-500">{errors.description}</p>
            )}
          </div>

          {/* Amount and Category Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="amount">Amount ($) *</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                value={formData.amount || ''}
                onChange={(e) => handleInputChange('amount', parseFloat(e.target.value) || 0)}
                className={errors.amount ? 'border-red-500' : ''}
              />
              {errors.amount && (
                <p className="text-sm text-red-500">{errors.amount}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Category *</Label>
              <Select 
                value={formData.category || ''} 
                onValueChange={(value) => handleInputChange('category', value)}
              >
                <SelectTrigger className={errors.category ? 'border-red-500' : ''}>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {expenseCategories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.category && (
                <p className="text-sm text-red-500">{errors.category}</p>
              )}
            </div>
          </div>

          {/* Vendor */}
          <div className="space-y-2">
            <Label htmlFor="vendor">Vendor/Merchant</Label>
            <Input
              id="vendor"
              placeholder="Name of vendor or merchant"
              value={formData.vendor}
              onChange={(e) => handleInputChange('vendor', e.target.value)}
            />
          </div>

          {/* Receipt Upload */}
          <div className="space-y-2">
            <Label htmlFor="receipt">Receipt</Label>
            <div className="space-y-2">
              <Input
                id="receipt"
                type="file"
                accept="image/*,.pdf"
                onChange={handleFileChange}
                className="file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
              />
              {receiptFile && (
                <div className="flex items-center justify-between p-3 bg-muted rounded-md">
                  <div className="flex items-center space-x-2">
                    <Upload className="h-4 w-4" />
                    <span className="text-sm">{receiptFile.name}</span>
                    <span className="text-xs text-muted-foreground">
                      ({(receiptFile.size / 1024).toFixed(1)} KB)
                    </span>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={removeReceipt}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              )}
              {errors.receipt && (
                <p className="text-sm text-red-500">{errors.receipt}</p>
              )}
              <p className="text-xs text-muted-foreground">
                Upload receipt (JPEG, PNG, GIF, PDF - max 5MB)
              </p>
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              placeholder="Additional notes about this expense..."
              value={formData.notes}
              onChange={(e) => handleInputChange('notes', e.target.value)}
              rows={2}
            />
          </div>

          {/* Billable Toggle */}
          <div className="flex items-center space-x-2">
            <Switch
              id="billable"
              checked={formData.billable}
              onCheckedChange={(checked) => handleInputChange('billable', checked)}
            />
            <Label htmlFor="billable" className="text-sm font-medium">
              Billable to client
            </Label>
          </div>

          {/* Summary */}
          {formData.amount > 0 && (
            <div className="p-4 bg-muted rounded-lg space-y-2">
              <h4 className="font-medium">Expense Summary</h4>
              <div className="text-sm text-muted-foreground space-y-1">
                <p><strong>Matter:</strong> {matterTitle}</p>
                <p><strong>Client:</strong> {clientName}</p>
                <p><strong>Date:</strong> {format(selectedDate, "PPP")}</p>
                <p><strong>Category:</strong> {formData.category}</p>
                <p><strong>Amount:</strong> ${formData.amount.toFixed(2)} {formData.billable ? '(Billable)' : '(Non-billable)'}</p>
                {formData.vendor && <p><strong>Vendor:</strong> {formData.vendor}</p>}
              </div>
            </div>
          )}
          </form>
        </div>

        <DialogFooter className="border-t pt-4">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button 
            type="submit"
            form="expenseForm"
            disabled={isSubmitting || formData.amount <= 0}
            className="min-w-[100px]"
          >
            {isSubmitting ? 'Adding...' : 'Add Expense'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ExpenseModal;