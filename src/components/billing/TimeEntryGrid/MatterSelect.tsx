import React, { useCallback } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Matter } from './types';

interface MatterSelectProps {
  value: string;
  matters: Matter[];
  onValueChange: (value: string, matter: Matter | undefined) => void;
}

export const MatterSelect = React.memo<MatterSelectProps>(({ value, matters, onValueChange }) => {
  const handleChange = useCallback((newValue: string) => {
    const selectedMatter = matters.find(m => m.id === newValue);
    onValueChange(newValue, selectedMatter);
  }, [matters, onValueChange]);

  return (
    <Select value={value} onValueChange={handleChange}>
      <SelectTrigger className="w-48">
        <SelectValue placeholder="Select matter..." />
      </SelectTrigger>
      <SelectContent>
        {matters.map((matter) => (
          <SelectItem key={matter.id} value={matter.id}>
            <div className="flex flex-col max-w-[250px]">
              <div className="font-medium text-sm truncate" title={matter.title}>
                {matter.title}
              </div>
              <div className="text-xs text-muted-foreground truncate" 
                   title={`${matter.clientName} • ${matter.practiceArea}`}>
                {matter.clientName} • {matter.practiceArea}
              </div>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
});

MatterSelect.displayName = 'MatterSelect';