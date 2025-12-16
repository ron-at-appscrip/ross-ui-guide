
import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Shield, Lock, FileCheck, AlertTriangle } from 'lucide-react';

const complianceSchema = z.object({
  requiredCompliance: z.array(z.string()).min(1, 'Please select at least one compliance requirement'),
  dataRetentionPeriod: z.string().min(1, 'Please specify data retention period'),
  encryptionRequirements: z.array(z.string()).optional(),
  auditingFrequency: z.string().min(1, 'Please select auditing frequency'),
  riskAssessmentCompleted: z.boolean().refine(val => val === true, 'Risk assessment completion is required'),
  complianceOfficerEmail: z.string().email('Please enter a valid email address').optional(),
  additionalRequirements: z.string().optional(),
});

export type ComplianceData = z.infer<typeof complianceSchema>;

interface ComplianceStepProps {
  data: Partial<ComplianceData>;
  onNext: (data: ComplianceData) => void;
  onBack: () => void;
  onSkip?: () => void;
  onSave: (data: Partial<ComplianceData>) => void;
}

const COMPLIANCE_REQUIREMENTS = [
  { value: 'hipaa', label: 'HIPAA', description: 'Health Insurance Portability and Accountability Act' },
  { value: 'gdpr', label: 'GDPR', description: 'General Data Protection Regulation' },
  { value: 'ccpa', label: 'CCPA', description: 'California Consumer Privacy Act' },
  { value: 'sox', label: 'SOX', description: 'Sarbanes-Oxley Act' },
  { value: 'iso27001', label: 'ISO 27001', description: 'Information Security Management' },
  { value: 'pci-dss', label: 'PCI DSS', description: 'Payment Card Industry Data Security Standard' },
];

const ENCRYPTION_OPTIONS = [
  { value: 'aes256', label: 'AES-256 Encryption' },
  { value: 'tls13', label: 'TLS 1.3 for Data in Transit' },
  { value: 'fde', label: 'Full Disk Encryption' },
  { value: 'key-management', label: 'Enterprise Key Management' },
];

const AUDIT_FREQUENCIES = [
  { value: 'monthly', label: 'Monthly' },
  { value: 'quarterly', label: 'Quarterly' },
  { value: 'bi-annual', label: 'Bi-Annual' },
  { value: 'annual', label: 'Annual' },
];

const ComplianceStep: React.FC<ComplianceStepProps> = ({
  data,
  onNext,
  onBack,
  onSkip,
  onSave,
}) => {
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isValid },
  } = useForm<ComplianceData>({
    resolver: zodResolver(complianceSchema),
    defaultValues: {
      requiredCompliance: data.requiredCompliance || [],
      dataRetentionPeriod: data.dataRetentionPeriod || '',
      encryptionRequirements: data.encryptionRequirements || [],
      auditingFrequency: data.auditingFrequency || '',
      riskAssessmentCompleted: data.riskAssessmentCompleted || false,
      complianceOfficerEmail: data.complianceOfficerEmail || '',
      additionalRequirements: data.additionalRequirements || '',
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

  const handleComplianceChange = (value: string, checked: boolean) => {
    const currentCompliance = watchedData.requiredCompliance || [];
    if (checked) {
      setValue('requiredCompliance', [...currentCompliance, value]);
    } else {
      setValue('requiredCompliance', currentCompliance.filter(item => item !== value));
    }
  };

  const handleEncryptionChange = (value: string, checked: boolean) => {
    const currentEncryption = watchedData.encryptionRequirements || [];
    if (checked) {
      setValue('encryptionRequirements', [...currentEncryption, value]);
    } else {
      setValue('encryptionRequirements', currentEncryption.filter(item => item !== value));
    }
  };

  const onSubmit = (formData: ComplianceData) => {
    onNext(formData);
  };

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <div className="flex items-center justify-center">
          <Shield className="h-8 w-8 text-primary mr-2" />
          <h2 className="text-2xl font-bold">Compliance & Security</h2>
        </div>
        <p className="text-muted-foreground">
          Configure compliance requirements and security settings for your firm
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-4">
          <div className="space-y-3">
            <Label className="text-base font-medium flex items-center gap-2">
              <FileCheck className="h-4 w-4" />
              Required Compliance Standards *
            </Label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {COMPLIANCE_REQUIREMENTS.map((requirement) => (
                <div key={requirement.value} className="flex items-start space-x-3 p-3 border rounded-lg">
                  <Checkbox
                    id={requirement.value}
                    checked={watchedData.requiredCompliance?.includes(requirement.value)}
                    onCheckedChange={(checked) => handleComplianceChange(requirement.value, checked as boolean)}
                  />
                  <div className="grid gap-1.5 leading-none">
                    <Label
                      htmlFor={requirement.value}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      {requirement.label}
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      {requirement.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            {errors.requiredCompliance && (
              <p className="text-sm text-destructive">{errors.requiredCompliance.message}</p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="dataRetentionPeriod">Data Retention Period *</Label>
              <Input
                id="dataRetentionPeriod"
                {...register('dataRetentionPeriod')}
                placeholder="e.g., 7 years"
              />
              {errors.dataRetentionPeriod && (
                <p className="text-sm text-destructive">{errors.dataRetentionPeriod.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="auditingFrequency">Auditing Frequency *</Label>
              <select
                id="auditingFrequency"
                {...register('auditingFrequency')}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="">Select frequency</option>
                {AUDIT_FREQUENCIES.map(freq => (
                  <option key={freq.value} value={freq.value}>
                    {freq.label}
                  </option>
                ))}
              </select>
              {errors.auditingFrequency && (
                <p className="text-sm text-destructive">{errors.auditingFrequency.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-3">
            <Label className="text-base font-medium flex items-center gap-2">
              <Lock className="h-4 w-4" />
              Encryption Requirements
            </Label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {ENCRYPTION_OPTIONS.map((option) => (
                <div key={option.value} className="flex items-center space-x-2">
                  <Checkbox
                    id={option.value}
                    checked={watchedData.encryptionRequirements?.includes(option.value)}
                    onCheckedChange={(checked) => handleEncryptionChange(option.value, checked as boolean)}
                  />
                  <Label htmlFor={option.value} className="text-sm">
                    {option.label}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="complianceOfficerEmail">Compliance Officer Email</Label>
            <Input
              id="complianceOfficerEmail"
              type="email"
              {...register('complianceOfficerEmail')}
              placeholder="compliance@yourfirm.com"
            />
            {errors.complianceOfficerEmail && (
              <p className="text-sm text-destructive">{errors.complianceOfficerEmail.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="additionalRequirements">Additional Requirements</Label>
            <textarea
              id="additionalRequirements"
              {...register('additionalRequirements')}
              className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              placeholder="Any additional compliance requirements or notes..."
            />
          </div>

          <div className="flex items-start space-x-3 p-4 border rounded-lg bg-muted/20">
            <Checkbox
              id="riskAssessmentCompleted"
              checked={watchedData.riskAssessmentCompleted}
              onCheckedChange={(checked) => setValue('riskAssessmentCompleted', checked as boolean)}
            />
            <div className="space-y-1">
              <Label htmlFor="riskAssessmentCompleted" className="flex items-center gap-2 text-sm font-medium">
                <AlertTriangle className="h-4 w-4 text-amber-500" />
                Risk Assessment Completed *
              </Label>
              <p className="text-xs text-muted-foreground">
                I confirm that a comprehensive risk assessment has been completed for our firm's data and systems.
              </p>
            </div>
          </div>
          {errors.riskAssessmentCompleted && (
            <p className="text-sm text-destructive">{errors.riskAssessmentCompleted.message}</p>
          )}
        </div>

        <div className="flex gap-3 pt-4">
          <Button type="button" variant="outline" onClick={onBack} className="flex-1">
            Back
          </Button>
          {onSkip && (
            <Button type="button" variant="ghost" onClick={onSkip} className="flex-1">
              Skip for Now
            </Button>
          )}
          <Button type="submit" disabled={!isValid} className="flex-1">
            Continue
          </Button>
        </div>
      </form>
    </div>
  );
};

export default ComplianceStep;
