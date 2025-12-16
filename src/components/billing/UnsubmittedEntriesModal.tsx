import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { AlertCircle, Clock, Briefcase, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';
import { TimeEntry } from '@/types/billing';
import { BillingService } from '@/services/billingService';
import { useToast } from '@/components/ui/use-toast';
import { UnsubmittedEntriesSkeleton, EmptyUnsubmittedEntriesSkeleton } from './skeletons';

interface UnsubmittedEntriesModalProps {
  open: boolean;
  onClose: () => void;
}

const UnsubmittedEntriesModal: React.FC<UnsubmittedEntriesModalProps> = ({ open, onClose }) => {
  const [entries, setEntries] = useState<TimeEntry[]>([]);
  const [selectedEntries, setSelectedEntries] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (open) {
      loadUnsubmittedEntries();
    }
  }, [open]);

  const loadUnsubmittedEntries = async () => {
    try {
      setIsLoading(true);
      const unsubmittedEntries = await BillingService.getUnsubmittedEntries();
      setEntries(unsubmittedEntries);
      setSelectedEntries(new Set());
    } catch (error) {
      console.error('Error loading unsubmitted entries:', error);
      toast({
        title: "Error loading entries",
        description: "Unable to load unsubmitted time entries.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedEntries(new Set(entries.map(e => e.id)));
    } else {
      setSelectedEntries(new Set());
    }
  };

  const handleSelectEntry = (entryId: string, checked: boolean) => {
    const newSelected = new Set(selectedEntries);
    if (checked) {
      newSelected.add(entryId);
    } else {
      newSelected.delete(entryId);
    }
    setSelectedEntries(newSelected);
  };

  const handleSubmitSelected = async () => {
    if (selectedEntries.size === 0) {
      toast({
        title: "No entries selected",
        description: "Please select at least one entry to submit.",
        variant: "destructive"
      });
      return;
    }

    try {
      setIsSubmitting(true);
      await BillingService.submitTimeEntries(Array.from(selectedEntries));
      
      toast({
        title: "Entries submitted successfully",
        description: `${selectedEntries.size} time entries have been submitted for review.`
      });
      
      // Refresh the list
      await loadUnsubmittedEntries();
      
      // Close modal if no more entries
      if (entries.filter(e => !selectedEntries.has(e.id)).length === 0) {
        onClose();
      }
    } catch (error) {
      console.error('Error submitting entries:', error);
      toast({
        title: "Error submitting entries",
        description: "Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const totalAmount = entries
    .filter(e => selectedEntries.has(e.id))
    .reduce((sum, e) => sum + e.amount, 0);

  const totalHours = entries
    .filter(e => selectedEntries.has(e.id))
    .reduce((sum, e) => sum + e.hours, 0);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <AlertCircle className="h-5 w-5 text-orange-500" />
            <span>Unsubmitted Time Entries</span>
          </DialogTitle>
          <DialogDescription>
            Review and submit your draft time entries for billing approval.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto">
          {isLoading ? (
            <UnsubmittedEntriesSkeleton entries={6} />
          ) : entries.length === 0 ? (
            <EmptyUnsubmittedEntriesSkeleton />
          ) : (
            <div className="space-y-4">
              {/* Summary */}
              <div className="bg-muted/50 p-4 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Unsubmitted Entries Summary</h4>
                    <p className="text-sm text-muted-foreground">
                      {entries.length} draft entries • Total: ${entries.reduce((sum, e) => sum + e.amount, 0).toFixed(2)}
                    </p>
                  </div>
                  {selectedEntries.size > 0 && (
                    <div className="text-right">
                      <p className="text-sm font-medium">Selected: {selectedEntries.size} entries</p>
                      <p className="text-sm text-muted-foreground">
                        {totalHours.toFixed(2)} hours • ${totalAmount.toFixed(2)}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Table */}
              <div className="border rounded-lg">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12">
                        <Checkbox
                          checked={selectedEntries.size === entries.length && entries.length > 0}
                          onCheckedChange={handleSelectAll}
                        />
                      </TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Matter</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Hours</TableHead>
                      <TableHead>Amount</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {entries.map((entry) => (
                      <TableRow key={entry.id}>
                        <TableCell>
                          <Checkbox
                            checked={selectedEntries.has(entry.id)}
                            onCheckedChange={(checked) => handleSelectEntry(entry.id, !!checked)}
                          />
                        </TableCell>
                        <TableCell>
                          {new Date(entry.date).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="flex items-center gap-1">
                              <Link 
                                to={`/dashboard/matters/${entry.matterId}`}
                                className="font-medium text-sm hover:text-primary hover:underline flex items-center gap-1"
                              >
                                {entry.matterTitle}
                                <ExternalLink className="h-3 w-3" />
                              </Link>
                            </div>
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                              <Briefcase className="h-3 w-3" />
                              {entry.clientName}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="max-w-xs">
                            <p className="text-sm">{entry.description}</p>
                            {entry.tags && entry.tags.length > 0 && (
                              <div className="flex gap-1 mt-1">
                                {entry.tags.slice(0, 2).map(tag => (
                                  <Badge key={tag} variant="outline" className="text-xs">
                                    {tag}
                                  </Badge>
                                ))}
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            {entry.hours} hrs
                            {entry.billable && (
                              <Badge variant="default" className="ml-2 text-xs">
                                Billable
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm font-medium">
                            ${entry.amount.toFixed(2)}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            ${entry.rate}/hr
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="border-t pt-4">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
          {entries.length > 0 && (
            <Button 
              onClick={handleSubmitSelected}
              disabled={selectedEntries.size === 0 || isSubmitting}
            >
              {isSubmitting 
                ? `Submitting ${selectedEntries.size} entries...` 
                : `Submit ${selectedEntries.size} Selected ${selectedEntries.size === 1 ? 'Entry' : 'Entries'}`
              }
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default UnsubmittedEntriesModal;