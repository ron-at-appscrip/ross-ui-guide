
import React from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { PracticeAreasData, practiceAreasSchema } from '@/types/wizard';
import MultiSelect from '@/components/wizard/MultiSelect';

interface PracticeAreasStepProps {
  data: Partial<PracticeAreasData>;
  onNext: (data: PracticeAreasData) => void;
  onBack: () => void;
  onSave: (data: Partial<PracticeAreasData>) => void;
}

const PRACTICE_AREAS = [
  { value: 'corporate', label: 'Corporate Law' },
  { value: 'litigation', label: 'Litigation' },
  { value: 'real-estate', label: 'Real Estate' },
  { value: 'family', label: 'Family Law' },
  { value: 'criminal', label: 'Criminal Law' },
  { value: 'personal-injury', label: 'Personal Injury' },
  { value: 'employment', label: 'Employment Law' },
  { value: 'intellectual-property', label: 'Intellectual Property' },
  { value: 'tax', label: 'Tax Law' },
  { value: 'immigration', label: 'Immigration Law' },
  { value: 'bankruptcy', label: 'Bankruptcy' },
  { value: 'estate-planning', label: 'Estate Planning' },
  { value: 'environmental', label: 'Environmental Law' },
  { value: 'healthcare', label: 'Healthcare Law' },
  { value: 'securities', label: 'Securities Law' },
];

const SPECIALIZATIONS = [
  { value: 'mediation', label: 'Mediation' },
  { value: 'arbitration', label: 'Arbitration' },
  { value: 'class-action', label: 'Class Action' },
  { value: 'white-collar', label: 'White Collar Defense' },
  { value: 'mergers-acquisitions', label: 'Mergers & Acquisitions' },
  { value: 'venture-capital', label: 'Venture Capital' },
  { value: 'regulatory-compliance', label: 'Regulatory Compliance' },
  { value: 'international-law', label: 'International Law' },
];

const PracticeAreasStep: React.FC<PracticeAreasStepProps> = ({
  data,
  onNext,
  onBack,
  onSave,
}) => {
  const {
    control,
    handleSubmit,
    watch,
    formState: { errors, isValid },
  } = useForm<PracticeAreasData>({
    resolver: zodResolver(practiceAreasSchema),
    defaultValues: {
      primaryPracticeAreas: data.primaryPracticeAreas || [],
      secondaryPracticeAreas: data.secondaryPracticeAreas || [],
      specializations: data.specializations || [],
    },
    mode: 'onChange',
  });

  const watchedData = watch();

  // Auto-save on data change
  React.useEffect(() => {
    const timer = setTimeout(() => {
      onSave(watchedData);
    }, 1000);
    return () => clearTimeout(timer);
  }, [watchedData, onSave]);

  const onSubmit = (formData: PracticeAreasData) => {
    onNext(formData);
  };

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold">Practice Areas</h2>
        <p className="text-muted-foreground">
          Select your primary and secondary practice areas to help us customize ROSS.AI for your needs
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <Controller
          name="primaryPracticeAreas"
          control={control}
          render={({ field }) => (
            <MultiSelect
              label="Primary Practice Areas *"
              placeholder="Select your main practice areas"
              options={PRACTICE_AREAS}
              value={field.value}
              onChange={field.onChange}
              error={errors.primaryPracticeAreas?.message}
              maxSelections={3}
            />
          )}
        />

        <Controller
          name="secondaryPracticeAreas"
          control={control}
          render={({ field }) => (
            <MultiSelect
              label="Secondary Practice Areas (Optional)"
              placeholder="Select additional practice areas"
              options={PRACTICE_AREAS.filter(area => 
                !watchedData.primaryPracticeAreas?.includes(area.value)
              )}
              value={field.value || []}
              onChange={field.onChange}
            />
          )}
        />

        <Controller
          name="specializations"
          control={control}
          render={({ field }) => (
            <MultiSelect
              label="Specializations (Optional)"
              placeholder="Select your specializations"
              options={SPECIALIZATIONS}
              value={field.value || []}
              onChange={field.onChange}
            />
          )}
        />

        <div className="flex gap-3 pt-4">
          <Button type="button" variant="outline" onClick={onBack} className="flex-1">
            Back
          </Button>
          <Button type="submit" disabled={!isValid} className="flex-1">
            Continue
          </Button>
        </div>
      </form>
    </div>
  );
};

export default PracticeAreasStep;
