import React from 'react';
import { Table, TableBody, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { TimeEntry } from '@/types/billing';
import { EditFormData, Matter } from './types';
import { TimeEntryRow } from './TimeEntryRow';

interface TimeEntryTableProps {
  entries: TimeEntry[];
  editingId: string | null;
  editFormData: EditFormData;
  matters: Matter[];
  onEdit: (id: string) => void;
  onSave: (id: string) => void;
  onDelete: (id: string) => void;
  onUpdateFormData: (updates: Partial<EditFormData>) => void;
}

export const TimeEntryTable = React.memo<TimeEntryTableProps>(({
  entries,
  editingId,
  editFormData,
  matters,
  onEdit,
  onSave,
  onDelete,
  onUpdateFormData
}) => {
  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Date</TableHead>
            <TableHead>Matter</TableHead>
            <TableHead>Description</TableHead>
            <TableHead>Hours</TableHead>
            <TableHead>Rate</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {entries.map((entry) => (
            <TimeEntryRow
              key={entry.id}
              entry={entry}
              isEditing={editingId === entry.id}
              editFormData={editFormData}
              matters={matters}
              onEdit={onEdit}
              onSave={onSave}
              onDelete={onDelete}
              onUpdateFormData={onUpdateFormData}
            />
          ))}
        </TableBody>
      </Table>
    </div>
  );
});

TimeEntryTable.displayName = 'TimeEntryTable';