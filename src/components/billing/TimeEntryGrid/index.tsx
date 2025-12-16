import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { useTimeEntries } from './useTimeEntries';
import { TimeEntryTableSkeleton } from '../skeletons';
import { EmptyState } from './EmptyState';
import { TimeEntryTable } from './TimeEntryTable';

const TimeEntryGrid = React.memo(() => {
  const {
    entries,
    editingId,
    editFormData,
    isLoading,
    matters,
    handleEdit,
    handleSave,
    handleDelete,
    addNewEntry,
    updateEditFormData
  } = useTimeEntries();

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Time Entries</CardTitle>
          <Button onClick={addNewEntry} size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Add Entry
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <TimeEntryTableSkeleton rows={8} />
        ) : entries.length === 0 ? (
          <EmptyState onAddEntry={addNewEntry} />
        ) : (
          <TimeEntryTable
            entries={entries}
            editingId={editingId}
            editFormData={editFormData}
            matters={matters}
            onEdit={handleEdit}
            onSave={handleSave}
            onDelete={handleDelete}
            onUpdateFormData={updateEditFormData}
          />
        )}
      </CardContent>
    </Card>
  );
});

TimeEntryGrid.displayName = 'TimeEntryGrid';

export default TimeEntryGrid;