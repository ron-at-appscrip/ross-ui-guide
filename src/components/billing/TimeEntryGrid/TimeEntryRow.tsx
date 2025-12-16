import React, { useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { TableCell, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Save, Edit3, Trash2, ExternalLink, Briefcase } from 'lucide-react';
import { TimeEntry } from '@/types/billing';
import { EditFormData, Matter } from './types';
import { StatusBadge } from './StatusBadge';
import { MatterSelect } from './MatterSelect';

interface TimeEntryRowProps {
  entry: TimeEntry;
  isEditing: boolean;
  editFormData: EditFormData;
  matters: Matter[];
  onEdit: (id: string) => void;
  onSave: (id: string) => void;
  onDelete: (id: string) => void;
  onUpdateFormData: (updates: Partial<EditFormData>) => void;
}

export const TimeEntryRow = React.memo<TimeEntryRowProps>(({
  entry,
  isEditing,
  editFormData,
  matters,
  onEdit,
  onSave,
  onDelete,
  onUpdateFormData
}) => {
  const formattedDate = useMemo(
    () => new Date(entry.date).toLocaleDateString(),
    [entry.date]
  );

  const displayAmount = useMemo(
    () => isEditing && editFormData.amount !== undefined 
      ? editFormData.amount.toFixed(2) 
      : entry.amount.toFixed(2),
    [isEditing, editFormData.amount, entry.amount]
  );

  const handleMatterChange = useCallback((value: string, selectedMatter: Matter | undefined) => {
    onUpdateFormData({
      matterId: value,
      rate: selectedMatter?.hourlyRate || 350
    });
  }, [onUpdateFormData]);

  const handleHoursChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const hours = parseFloat(e.target.value) || 0;
    const rate = editFormData.rate !== undefined ? editFormData.rate : entry.rate;
    onUpdateFormData({ 
      hours,
      amount: hours * rate
    });
  }, [editFormData.rate, entry.rate, onUpdateFormData]);

  const handleRateChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const rate = parseFloat(e.target.value) || 0;
    const hours = editFormData.hours !== undefined ? editFormData.hours : entry.hours;
    onUpdateFormData({ 
      rate,
      amount: hours * rate
    });
  }, [editFormData.hours, entry.hours, onUpdateFormData]);

  const handleDescriptionChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    onUpdateFormData({ description: e.target.value });
  }, [onUpdateFormData]);

  return (
    <TableRow>
      <TableCell>
        {isEditing ? (
          <Input
            type="date"
            defaultValue={entry.date}
            className="w-32"
          />
        ) : (
          formattedDate
        )}
      </TableCell>
      <TableCell>
        {isEditing ? (
          <MatterSelect
            value={editFormData.matterId || entry.matterId}
            matters={matters}
            onValueChange={handleMatterChange}
          />
        ) : (
          <div className="text-sm max-w-[200px]">
            <div className="font-medium flex items-center gap-1">
              <Link 
                to={`/dashboard/matters/${entry.matterId}`}
                className="hover:text-primary hover:underline flex items-center gap-1 truncate"
                title={entry.matterTitle}
              >
                <span className="truncate">{entry.matterTitle}</span>
                <ExternalLink className="h-3 w-3 flex-shrink-0" />
              </Link>
            </div>
            <div className="text-muted-foreground flex items-center gap-1">
              <Briefcase className="h-3 w-3 flex-shrink-0" />
              <Link 
                to={`/dashboard/clients/${entry.clientId}`}
                className="hover:text-primary hover:underline truncate"
                title={entry.clientName}
              >
                {entry.clientName}
              </Link>
            </div>
          </div>
        )}
      </TableCell>
      <TableCell>
        {isEditing ? (
          <Input
            value={editFormData.description !== undefined ? editFormData.description : entry.description}
            onChange={handleDescriptionChange}
            className="w-60"
            placeholder="Description of work..."
          />
        ) : (
          <div className="max-w-xs">
            <span className="truncate block" title={entry.description}>
              {entry.description}
            </span>
            {entry.aiSuggested && (
              <Badge variant="outline" className="mt-1 text-xs">
                AI Suggested
              </Badge>
            )}
          </div>
        )}
      </TableCell>
      <TableCell>
        {isEditing ? (
          <Input
            type="number"
            step="0.1"
            value={editFormData.hours !== undefined ? editFormData.hours : entry.hours}
            onChange={handleHoursChange}
            className="w-20"
          />
        ) : (
          entry.hours
        )}
      </TableCell>
      <TableCell>
        {isEditing ? (
          <Input
            type="number"
            step="0.01"
            value={editFormData.rate !== undefined ? editFormData.rate : entry.rate}
            onChange={handleRateChange}
            className="w-20"
          />
        ) : (
          `$${entry.rate}`
        )}
      </TableCell>
      <TableCell>
        ${displayAmount}
      </TableCell>
      <TableCell>
        <StatusBadge status={entry.status} />
      </TableCell>
      <TableCell>
        <div className="flex space-x-1">
          {isEditing ? (
            <Button
              size="sm"
              variant="outline"
              onClick={() => onSave(entry.id)}
            >
              <Save className="h-3 w-3" />
            </Button>
          ) : (
            <Button
              size="sm"
              variant="outline"
              onClick={() => onEdit(entry.id)}
            >
              <Edit3 className="h-3 w-3" />
            </Button>
          )}
          <Button
            size="sm"
            variant="outline"
            onClick={() => onDelete(entry.id)}
          >
            <Trash2 className="h-3 w-3" />
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
});

TimeEntryRow.displayName = 'TimeEntryRow';