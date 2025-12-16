import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TimeEntry } from '@/types/billing';

interface InvoicePreviewProps {
  invoiceNumber: string;
  dueDate: string;
  entriesByMatter: Record<string, {
    matterTitle: string;
    clientName: string;
    entries: TimeEntry[];
  }>;
  selectedEntriesCount: number;
  calculations: {
    subtotal: number;
    tax: number;
    total: number;
    totalHours: number;
  };
}

/**
 * Matter section component - Memoized for performance
 */
const MatterSection = React.memo<{
  matterId: string;
  matterData: {
    matterTitle: string;
    clientName: string;
    entries: TimeEntry[];
  };
}>(({ matterId, matterData }) => {
  return (
    <div key={matterId} className="border-b pb-4">
      <h4 className="font-medium text-lg mb-2">{matterData.matterTitle}</h4>
      <p className="text-sm text-muted-foreground mb-3">Client: {matterData.clientName}</p>
      <div className="space-y-2">
        {matterData.entries.map((entry: TimeEntry) => (
          <div key={entry.id} className="flex justify-between items-center text-sm">
            <div className="flex-1">
              <span>{new Date(entry.date).toLocaleDateString()}</span>
              <span className="ml-4">{entry.description}</span>
            </div>
            <div className="flex items-center gap-4">
              <span>{entry.hours} hrs @ ${entry.rate}/hr</span>
              <span className="font-medium">${entry.amount.toFixed(2)}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
});

MatterSection.displayName = 'MatterSection';

/**
 * InvoicePreview component - Shows preview of the invoice
 * Performance optimizations:
 * - Component is memoized
 * - Matter sections are memoized
 * - Calculations are passed as props (computed in parent with useMemo)
 */
const InvoicePreview = React.memo<InvoicePreviewProps>(({
  invoiceNumber,
  dueDate,
  entriesByMatter,
  selectedEntriesCount,
  calculations
}) => {
  const { subtotal, tax, total, totalHours } = calculations;
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Invoice Preview</CardTitle>
        <div className="text-sm text-muted-foreground">
          Invoice {invoiceNumber} • Due: {dueDate}
        </div>
      </CardHeader>
      <CardContent>
        {selectedEntriesCount === 0 ? (
          <p className="text-muted-foreground text-center py-8">
            No entries selected for invoice.
          </p>
        ) : (
          <div className="space-y-6">
            {Object.entries(entriesByMatter).map(([matterId, matterData]) => (
              <MatterSection
                key={matterId}
                matterId={matterId}
                matterData={matterData}
              />
            ))}
            
            <div className="border-t pt-4">
              <div className="flex justify-between items-center">
                <span>Subtotal ({totalHours.toFixed(2)} hours):</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Tax (10%):</span>
                <span>${tax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center font-bold text-lg border-t pt-2">
                <span>Total:</span>
                <span>${total.toFixed(2)}</span>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
});

InvoicePreview.displayName = 'InvoicePreview';

export default InvoicePreview;