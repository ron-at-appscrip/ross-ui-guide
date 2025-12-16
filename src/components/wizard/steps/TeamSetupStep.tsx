
import React from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Plus, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { TeamSetupData, teamSetupSchema } from '@/types/wizard';

interface TeamSetupStepProps {
  data: Partial<TeamSetupData>;
  onNext: (data: TeamSetupData) => void;
  onBack: () => void;
  onSkip: () => void;
  onSave: (data: Partial<TeamSetupData>) => void;
}

const ROLES = [
  { value: 'partner', label: 'Partner' },
  { value: 'associate', label: 'Associate' },
  { value: 'counsel', label: 'Counsel' },
  { value: 'paralegal', label: 'Paralegal' },
  { value: 'legal-assistant', label: 'Legal Assistant' },
  { value: 'administrator', label: 'Administrator' },
  { value: 'other', label: 'Other' },
];

const TEAM_SIZES = [
  { value: '1', label: 'Just me' },
  { value: '2-5', label: '2-5 people' },
  { value: '6-10', label: '6-10 people' },
  { value: '11-25', label: '11-25 people' },
  { value: '26-50', label: '26-50 people' },
  { value: '50+', label: '50+ people' },
];

const TeamSetupStep: React.FC<TeamSetupStepProps> = ({
  data,
  onNext,
  onBack,
  onSkip,
  onSave,
}) => {
  const {
    register,
    control,
    handleSubmit,
    watch,
    formState: { errors, isValid },
  } = useForm<TeamSetupData>({
    resolver: zodResolver(teamSetupSchema),
    defaultValues: {
      role: data.role || '',
      teamSize: data.teamSize || '',
      inviteEmails: data.inviteEmails || [],
    },
    mode: 'onChange',
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'inviteEmails',
  });

  const watchedData = watch();

  // Auto-save on data change
  React.useEffect(() => {
    const timer = setTimeout(() => {
      onSave(watchedData);
    }, 1000);
    return () => clearTimeout(timer);
  }, [watchedData, onSave]);

  const onSubmit = (formData: TeamSetupData) => {
    onNext(formData);
  };

  const addEmailField = () => {
    append({ email: '' });
  };

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold">Team Setup</h2>
        <p className="text-muted-foreground">
          Set up your team and invite colleagues to join ROSS.AI
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="role">Your Role</Label>
          <select
            id="role"
            {...register('role')}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <option value="">Select your role</option>
            {ROLES.map(role => (
              <option key={role.value} value={role.value}>
                {role.label}
              </option>
            ))}
          </select>
          {errors.role && (
            <p className="text-sm text-destructive">{errors.role.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="teamSize">Expected Team Size</Label>
          <select
            id="teamSize"
            {...register('teamSize')}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <option value="">Select team size</option>
            {TEAM_SIZES.map(size => (
              <option key={size.value} value={size.value}>
                {size.label}
              </option>
            ))}
          </select>
          {errors.teamSize && (
            <p className="text-sm text-destructive">{errors.teamSize.message}</p>
          )}
        </div>

        <div className="space-y-4">
          <Label>Invite Team Members (Optional)</Label>
          <p className="text-sm text-muted-foreground">
            Send invitations to colleagues you'd like to join your ROSS.AI workspace
          </p>
          
          {fields.map((field, index) => (
            <div key={field.id} className="flex gap-2">
              <Input
                type="email"
                placeholder="colleague@firm.com"
                {...register(`inviteEmails.${index}.email` as const)}
                className="flex-1"
              />
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => remove(index)}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          ))}

          <Button
            type="button"
            variant="outline"
            onClick={addEmailField}
            className="w-full"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Another Email
          </Button>
        </div>

        <div className="flex gap-3 pt-4">
          <Button type="button" variant="outline" onClick={onBack} className="flex-1">
            Back
          </Button>
          <Button type="button" variant="ghost" onClick={onSkip} className="flex-1">
            Skip for Now
          </Button>
          <Button type="submit" disabled={!isValid} className="flex-1">
            Continue
          </Button>
        </div>
      </form>
    </div>
  );
};

export default TeamSetupStep;
