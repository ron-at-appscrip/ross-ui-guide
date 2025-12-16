import React from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FirmInfoData, firmInfoSchema } from '@/types/wizard';
import { FIRM_SIZE_OPTIONS } from '@/types/firmSize';

interface FirmInfoStepProps {
  data: Partial<FirmInfoData>;
  onNext: (data: FirmInfoData) => void;
  onBack: () => void;
  onSave: (data: Partial<FirmInfoData>) => void;
}

const COUNTRIES = [
  { value: 'US', label: 'United States' },
  { value: 'CA', label: 'Canada' },
  { value: 'UK', label: 'United Kingdom' },
  { value: 'AU', label: 'Australia' },
  // Add more countries as needed
];

const FirmInfoStep: React.FC<FirmInfoStepProps> = ({
  data,
  onNext,
  onBack,
  onSave,
}) => {
  const {
    register,
    handleSubmit,
    watch,
    control,
    formState: { errors, isValid },
  } = useForm<FirmInfoData>({
    resolver: zodResolver(firmInfoSchema),
    defaultValues: data,
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

  const onSubmit = (formData: FirmInfoData) => {
    onNext(formData);
  };

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold">Firm Information</h2>
        <p className="text-muted-foreground">
          Help us understand your law firm to customize your experience
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="firmName">Firm Name</Label>
          <Input
            id="firmName"
            type="text"
            placeholder="Enter your firm name"
            {...register('firmName')}
            className={errors.firmName ? 'border-destructive' : ''}
          />
          {errors.firmName && (
            <p className="text-sm text-destructive">{errors.firmName.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="firmSize">Firm Size</Label>
          <Controller
            name="firmSize"
            control={control}
            render={({ field }) => (
              <Select onValueChange={field.onChange} value={field.value}>
                <SelectTrigger className={errors.firmSize ? 'border-destructive' : ''}>
                  <SelectValue placeholder="Select firm size" />
                </SelectTrigger>
                <SelectContent>
                  {FIRM_SIZE_OPTIONS.map(size => (
                    <SelectItem key={size.value} value={size.value}>
                      {size.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          {errors.firmSize && (
            <p className="text-sm text-destructive">{errors.firmSize.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="address">Address (Optional)</Label>
          <Input
            id="address"
            type="text"
            placeholder="Street address"
            {...register('address')}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="city">City (Optional)</Label>
            <Input
              id="city"
              type="text"
              placeholder="City"
              {...register('city')}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="state">State (Optional)</Label>
            <Input
              id="state"
              type="text"
              placeholder="State"
              {...register('state')}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="zipCode">ZIP Code (Optional)</Label>
            <Input
              id="zipCode"
              type="text"
              placeholder="ZIP Code"
              {...register('zipCode')}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="country">Country</Label>
            <Controller
              name="country"
              control={control}
              render={({ field }) => (
                <Select onValueChange={field.onChange} value={field.value}>
                  <SelectTrigger className={errors.country ? 'border-destructive' : ''}>
                    <SelectValue placeholder="Select country" />
                  </SelectTrigger>
                  <SelectContent>
                    {COUNTRIES.map(country => (
                      <SelectItem key={country.value} value={country.value}>
                        {country.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.country && (
              <p className="text-sm text-destructive">{errors.country.message}</p>
            )}
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

export default FirmInfoStep;
