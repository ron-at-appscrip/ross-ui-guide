import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Search, X, Plus, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface AddTrademarkModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddTrademark: (serialNumber: string) => Promise<{ success: boolean; error?: string; trademarkName?: string }>;
  isLoading?: boolean;
}

const AddTrademarkModal: React.FC<AddTrademarkModalProps> = ({
  isOpen,
  onClose,
  onAddTrademark,
  isLoading = false
}) => {
  const [serialNumber, setSerialNumber] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Clear previous errors
    setError(null);
    
    // Validate serial number
    const cleanedSerialNumber = serialNumber.trim();
    if (!cleanedSerialNumber) {
      setError('Please enter a serial number');
      return;
    }
    
    // Basic serial number validation (should be numeric and reasonable length)
    if (!/^\d+$/.test(cleanedSerialNumber)) {
      setError('Serial number should only contain numbers');
      return;
    }
    
    if (cleanedSerialNumber.length < 7 || cleanedSerialNumber.length > 10) {
      setError('Serial number should be 7-10 digits long');
      return;
    }

    setIsSubmitting(true);
    
    try {
      const result = await onAddTrademark(cleanedSerialNumber);
      
      if (result.success) {
        // Success - close modal and reset form
        handleClose();
      } else {
        // Show error from the API call
        setError(result.error || 'Failed to add trademark. Please try again.');
      }
    } catch (error) {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setSerialNumber('');
    setError(null);
    setIsSubmitting(false);
    onClose();
  };

  const handleSerialNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Only allow numbers
    if (value === '' || /^\d+$/.test(value)) {
      setSerialNumber(value);
      // Clear error when user starts typing
      if (error) {
        setError(null);
      }
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Add Trademark by Serial Number
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="serialNumber">
                USPTO Serial Number <span className="text-red-500">*</span>
              </Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="serialNumber"
                  placeholder="e.g., 78787878"
                  value={serialNumber}
                  onChange={handleSerialNumberChange}
                  className="pl-10"
                  disabled={isSubmitting}
                  maxLength={10}
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Enter the USPTO serial number (7-10 digits) to search and add the trademark to your listing.
              </p>
            </div>

            {/* Error Message */}
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* Example serial numbers for help */}
            <div className="p-3 bg-muted/50 rounded-lg">
              <p className="text-xs font-medium text-muted-foreground mb-1">Example serial numbers:</p>
              <div className="flex flex-wrap gap-2">
                {['78787878', '90123456', '88888888'].map((example) => (
                  <button
                    key={example}
                    type="button"
                    onClick={() => setSerialNumber(example)}
                    className="text-xs px-2 py-1 bg-background border rounded hover:bg-accent transition-colors"
                    disabled={isSubmitting}
                  >
                    {example}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose} disabled={isSubmitting}>
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting || !serialNumber.trim()}>
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-background mr-2"></div>
                  Searching...
                </>
              ) : (
                <>
                  <Search className="h-4 w-4 mr-2" />
                  Search & Add
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddTrademarkModal;