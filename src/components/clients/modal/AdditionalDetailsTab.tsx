
import React from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import MultiSelect from '@/components/wizard/MultiSelect';
import AISuggestions from './AISuggestions';
import { NewClientData } from '@/types/client';

interface AdditionalDetailsTabProps {
  formData: NewClientData;
  handleInputChange: (field: string, value: any) => void;
  practiceAreaOptions: { value: string; label: string }[];
  generateAISuggestions: () => void;
  aiSuggestions: string[];
  addSuggestionToTags: (suggestion: string) => void;
}

const AdditionalDetailsTab: React.FC<AdditionalDetailsTabProps> = ({
  formData,
  handleInputChange,
  practiceAreaOptions,
  generateAISuggestions,
  aiSuggestions,
  addSuggestionToTags,
}) => {
  return (
    <div className="space-y-4">
      <div className="space-y-4">
        <div className="space-y-2">
          <MultiSelect
            label="Practice Areas"
            placeholder="Select relevant practice areas..."
            options={practiceAreaOptions}
            value={formData.tags}
            onChange={(tags) => handleInputChange('tags', tags)}
          />
        </div>

        <AISuggestions
          generateAISuggestions={generateAISuggestions}
          aiSuggestions={aiSuggestions}
          addSuggestionToTags={addSuggestionToTags}
          isGenerationDisabled={!formData.name || !formData.type}
        />

        <div className="space-y-2">
          <Label htmlFor="notes">Notes</Label>
          <Textarea
            id="notes"
            value={formData.notes}
            onChange={(e) => handleInputChange('notes', e.target.value)}
            placeholder="Additional notes about the client..."
            rows={4}
          />
        </div>
      </div>
    </div>
  );
};

export default AdditionalDetailsTab;
