
import React from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { isValidPhoneNumber } from 'libphonenumber-js';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { PhoneInput } from '@/components/ui/phone-input';
import { Crown, Zap, Users, Shield, HeadphonesIcon } from 'lucide-react';

const enterpriseSchema = z.object({
  dedicatedSupport: z.boolean().optional(),
  customIntegrations: z.array(z.string()).optional(),
  slaRequirements: z.string().optional(),
  dedicatedAccountManager: z.boolean().optional(),
  customBranding: z.boolean().optional(),
  apiAccess: z.boolean().optional(),
  whiteLabeling: z.boolean().optional(),
  priorityTraining: z.boolean().optional(),
  customReporting: z.array(z.string()).optional(),
  expectedUsers: z.string().min(1, 'Expected number of users is required'),
  goLiveDate: z.string().optional(),
  migrationAssistance: z.boolean().optional(),
  contactName: z.string().min(1, 'Primary contact name is required'),
  contactEmail: z.string().email('Please enter a valid email address'),
  contactPhone: z.string()
    .optional()
    .refine((phone) => {
      if (!phone || phone.trim() === '') return true; // Allow empty phone
      return isValidPhoneNumber(phone);
    }, 'Please enter a valid phone number with country code'),
});

export type EnterpriseData = z.infer<typeof enterpriseSchema>;

interface EnterpriseStepProps {
  data: Partial<EnterpriseData>;
  onNext: (data: EnterpriseData) => void;
  onBack: () => void;
  onSave: (data: Partial<EnterpriseData>) => void;
}

const CUSTOM_INTEGRATIONS = [
  { value: 'salesforce', label: 'Salesforce CRM' },
  { value: 'sharepoint', label: 'Microsoft SharePoint' },
  { value: 'workday', label: 'Workday' },
  { value: 'netsuite', label: 'NetSuite' },
  { value: 'custom-erp', label: 'Custom ERP System' },
  { value: 'legacy-systems', label: 'Legacy Systems' },
];

const CUSTOM_REPORTS = [
  { value: 'executive-dashboard', label: 'Executive Dashboard' },
  { value: 'compliance-reports', label: 'Compliance Reports' },
  { value: 'performance-analytics', label: 'Performance Analytics' },
  { value: 'financial-reports', label: 'Financial Reports' },
  { value: 'utilization-reports', label: 'Resource Utilization Reports' },
  { value: 'custom-kpis', label: 'Custom KPI Tracking' },
];

const SLA_OPTIONS = [
  { value: '99.9', label: '99.9% Uptime' },
  { value: '99.95', label: '99.95% Uptime' },
  { value: '99.99', label: '99.99% Uptime' },
];

const EnterpriseStep: React.FC<EnterpriseStepProps> = ({
  data,
  onNext,
  onBack,
  onSave,
}) => {
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    control,
    formState: { errors, isValid },
  } = useForm<EnterpriseData>({
    resolver: zodResolver(enterpriseSchema),
    defaultValues: {
      dedicatedSupport: data.dedicatedSupport || false,
      customIntegrations: data.customIntegrations || [],
      slaRequirements: data.slaRequirements || '',
      dedicatedAccountManager: data.dedicatedAccountManager || false,
      customBranding: data.customBranding || false,
      apiAccess: data.apiAccess || false,
      whiteLabeling: data.whiteLabeling || false,
      priorityTraining: data.priorityTraining || false,
      customReporting: data.customReporting || [],
      expectedUsers: data.expectedUsers || '',
      goLiveDate: data.goLiveDate || '',
      contactName: data.contactName || '',
      contactEmail: data.contactEmail || '',
      contactPhone: data.contactPhone || '',
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

  const handleIntegrationChange = (value: string, checked: boolean) => {
    const currentIntegrations = watchedData.customIntegrations || [];
    if (checked) {
      setValue('customIntegrations', [...currentIntegrations, value]);
    } else {
      setValue('customIntegrations', currentIntegrations.filter(item => item !== value));
    }
  };

  const handleReportChange = (value: string, checked: boolean) => {
    const currentReports = watchedData.customReporting || [];
    if (checked) {
      setValue('customReporting', [...currentReports, value]);
    } else {
      setValue('customReporting', currentReports.filter(item => item !== value));
    }
  };

  const onSubmit = (formData: EnterpriseData) => {
    onNext(formData);
  };

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <div className="flex items-center justify-center">
          <Crown className="h-8 w-8 text-primary mr-2" />
          <h2 className="text-2xl font-bold">Enterprise Features</h2>
        </div>
        <p className="text-muted-foreground">
          Configure advanced enterprise features and support options
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="expectedUsers">Expected Number of Users *</Label>
            <Input
              id="expectedUsers"
              type="number"
              {...register('expectedUsers')}
              placeholder="e.g., 150"
            />
            {errors.expectedUsers && (
              <p className="text-sm text-destructive">{errors.expectedUsers.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="goLiveDate">Preferred Go-Live Date</Label>
            <Input
              id="goLiveDate"
              type="date"
              {...register('goLiveDate')}
            />
          </div>
        </div>

        <div className="space-y-4">
          <Label className="text-base font-medium flex items-center gap-2">
            <HeadphonesIcon className="h-4 w-4" />
            Support & Service Options
          </Label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="dedicatedSupport"
                checked={watchedData.dedicatedSupport}
                onCheckedChange={(checked) => setValue('dedicatedSupport', checked as boolean)}
              />
              <Label htmlFor="dedicatedSupport" className="text-sm">
                24/7 Dedicated Support
              </Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="dedicatedAccountManager"
                checked={watchedData.dedicatedAccountManager}
                onCheckedChange={(checked) => setValue('dedicatedAccountManager', checked as boolean)}
              />
              <Label htmlFor="dedicatedAccountManager" className="text-sm">
                Dedicated Account Manager
              </Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="priorityTraining"
                checked={watchedData.priorityTraining}
                onCheckedChange={(checked) => setValue('priorityTraining', checked as boolean)}
              />
              <Label htmlFor="priorityTraining" className="text-sm">
                Priority Training & Onboarding
              </Label>
            </div>

          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="slaRequirements">SLA Requirements</Label>
          <select
            id="slaRequirements"
            {...register('slaRequirements')}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <option value="">Select SLA level</option>
            {SLA_OPTIONS.map(sla => (
              <option key={sla.value} value={sla.value}>
                {sla.label}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-4">
          <Label className="text-base font-medium flex items-center gap-2">
            <Zap className="h-4 w-4" />
            Customization Options
          </Label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="customBranding"
                checked={watchedData.customBranding}
                onCheckedChange={(checked) => setValue('customBranding', checked as boolean)}
              />
              <Label htmlFor="customBranding" className="text-sm">
                Custom Branding
              </Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="whiteLabeling"
                checked={watchedData.whiteLabeling}
                onCheckedChange={(checked) => setValue('whiteLabeling', checked as boolean)}
              />
              <Label htmlFor="whiteLabeling" className="text-sm">
                White Labeling
              </Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="apiAccess"
                checked={watchedData.apiAccess}
                onCheckedChange={(checked) => setValue('apiAccess', checked as boolean)}
              />
              <Label htmlFor="apiAccess" className="text-sm">
                Advanced API Access
              </Label>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <Label className="text-base font-medium">Custom Integrations</Label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {CUSTOM_INTEGRATIONS.map((integration) => (
              <div key={integration.value} className="flex items-center space-x-2">
                <Checkbox
                  id={integration.value}
                  checked={watchedData.customIntegrations?.includes(integration.value)}
                  onCheckedChange={(checked) => handleIntegrationChange(integration.value, checked as boolean)}
                />
                <Label htmlFor={integration.value} className="text-sm">
                  {integration.label}
                </Label>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          <Label className="text-base font-medium">Custom Reporting</Label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {CUSTOM_REPORTS.map((report) => (
              <div key={report.value} className="flex items-center space-x-2">
                <Checkbox
                  id={report.value}
                  checked={watchedData.customReporting?.includes(report.value)}
                  onCheckedChange={(checked) => handleReportChange(report.value, checked as boolean)}
                />
                <Label htmlFor={report.value} className="text-sm">
                  {report.label}
                </Label>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-4 border-t pt-4">
          <Label className="text-base font-medium">Primary Contact Information</Label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="contactName">Contact Name *</Label>
              <Input
                id="contactName"
                {...register('contactName')}
                placeholder="Primary contact name"
              />
              {errors.contactName && (
                <p className="text-sm text-destructive">{errors.contactName.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="contactEmail">Contact Email *</Label>
              <Input
                id="contactEmail"
                type="email"
                {...register('contactEmail')}
                placeholder="contact@yourfirm.com"
              />
              {errors.contactEmail && (
                <p className="text-sm text-destructive">{errors.contactEmail.message}</p>
              )}
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="contactPhone">Contact Phone</Label>
              <Controller
                name="contactPhone"
                control={control}
                render={({ field: { onChange, value } }) => (
                  <PhoneInput
                    value={value}
                    onChange={onChange}
                    placeholder="Enter contact phone number"
                    defaultCountry="US"
                    error={!!errors.contactPhone}
                  />
                )}
              />
              {errors.contactPhone && (
                <p className="text-sm text-destructive">{errors.contactPhone.message}</p>
              )}
            </div>
          </div>
        </div>

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

export default EnterpriseStep;
