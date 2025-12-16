
import React from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { IntegrationPreferencesData, integrationPreferencesSchema } from '@/types/wizard';
import MultiSelect from '@/components/wizard/MultiSelect';

interface IntegrationPreferencesStepProps {
  data: Partial<IntegrationPreferencesData>;
  onNext: (data: IntegrationPreferencesData) => void;
  onBack: () => void;
  onSkip: () => void;
  onSave: (data: Partial<IntegrationPreferencesData>) => void;
}

const INTEGRATIONS = [
  { value: 'office365', label: 'Microsoft Office 365' },
  { value: 'google-workspace', label: 'Google Workspace' },
  { value: 'outlook', label: 'Microsoft Outlook' },
  { value: 'salesforce', label: 'Salesforce' },
  { value: 'slack', label: 'Slack' },
  { value: 'teams', label: 'Microsoft Teams' },
  { value: 'dropbox', label: 'Dropbox' },
  { value: 'box', label: 'Box' },
  { value: 'onedrive', label: 'OneDrive' },
  { value: 'quickbooks', label: 'QuickBooks' },
  { value: 'clio', label: 'Clio' },
  { value: 'mycase', label: 'MyCase' },
  { value: 'practicesuite', label: 'PracticeSuite' },
  { value: 'lawpay', label: 'LawPay' },
];

const IntegrationPreferencesStep: React.FC<IntegrationPreferencesStepProps> = ({
  data,
  onNext,
  onBack,
  onSkip,
  onSave,
}) => {
  const {
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { isValid },
  } = useForm<IntegrationPreferencesData>({
    resolver: zodResolver(integrationPreferencesSchema),
    defaultValues: {
      preferredIntegrations: data.preferredIntegrations || [],
      dataImportNeeded: data.dataImportNeeded || false,
      migrationAssistance: data.migrationAssistance || false,
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

  const onSubmit = (formData: IntegrationPreferencesData) => {
    onNext(formData);
  };

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold">Integration Preferences</h2>
        <p className="text-muted-foreground">
          Let us know which tools you'd like to connect with ROSS.AI
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <Controller
          name="preferredIntegrations"
          control={control}
          render={({ field }) => (
            <MultiSelect
              label="Preferred Integrations (Optional)"
              placeholder="Select tools you use"
              options={INTEGRATIONS}
              value={field.value || []}
              onChange={field.onChange}
            />
          )}
        />

        <div className="space-y-4">
          <Label>Additional Services</Label>
          
          <div className="space-y-3">
            <div className="flex items-start space-x-3">
              <Controller
                name="dataImportNeeded"
                control={control}
                render={({ field }) => (
                  <Checkbox
                    id="dataImportNeeded"
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                )}
              />
              <div className="space-y-1">
                <Label htmlFor="dataImportNeeded" className="text-sm font-medium cursor-pointer">
                  I need help importing existing data
                </Label>
                <p className="text-sm text-muted-foreground">
                  Our team can help you migrate your existing cases, documents, and client data
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <Controller
                name="migrationAssistance"
                control={control}
                render={({ field }) => (
                  <Checkbox
                    id="migrationAssistance"
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                )}
              />
              <div className="space-y-1">
                <Label htmlFor="migrationAssistance" className="text-sm font-medium cursor-pointer">
                  I need migration assistance from another platform
                </Label>
                <p className="text-sm text-muted-foreground">
                  Get personalized help transitioning from your current legal software
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex gap-3 pt-4">
          <Button type="button" variant="outline" onClick={onBack} className="flex-1">
            Back
          </Button>
          <Button type="button" variant="ghost" onClick={onSkip} className="flex-1">
            Skip for Now
          </Button>
          <Button type="submit" className="flex-1">
            Continue
          </Button>
        </div>
      </form>
    </div>
  );
};

export default IntegrationPreferencesStep;
