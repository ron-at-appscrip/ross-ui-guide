import { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { isValidPhoneNumber } from 'libphonenumber-js';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { PhoneInput } from "@/components/ui/phone-input";
import { useAuth } from "@/contexts/WorkingAuthContext";
import { supabaseWizardService } from "@/services/supabaseWizardService";
import { supabaseUserService } from "@/services/supabaseUserService";
import { toast } from "sonner";

const editProfileSchema = z.object({
  // Personal Information
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  phone: z.string()
    .optional()
    .refine((phone) => {
      if (!phone || phone.trim() === '') return true; // Allow empty phone
      return isValidPhoneNumber(phone);
    }, 'Please enter a valid phone number with country code'),
  timezone: z.string().optional(),
  preferredLanguage: z.string().optional(),
  
  // Firm Information  
  firmName: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  zipCode: z.string().optional(),
  country: z.string().optional(),
  
  // Team Information (for existing team members)
  role: z.string().optional(),
});

type EditProfileFormData = z.infer<typeof editProfileSchema>;

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialData?: {
    // Personal Information
    firstName?: string;
    lastName?: string;
    phone?: string;
    timezone?: string;
    preferredLanguage?: string;
    
    // Firm Information
    firmName?: string;
    address?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    country?: string;
    
    // Team Information
    role?: string;
  };
  onSave?: (data: EditProfileFormData) => void;
}

// Get all available timezones
const getTimezones = () => {
  return Intl.supportedValuesOf('timeZone').map(tz => ({
    value: tz,
    label: tz.replace(/_/g, ' '),
    offset: new Intl.DateTimeFormat('en', {
      timeZone: tz,
      timeZoneName: 'short'
    }).formatToParts(new Date()).find(part => part.type === 'timeZoneName')?.value || ''
  })).sort((a, b) => a.label.localeCompare(b.label));
};

// Get browser's current timezone
const getCurrentTimezone = () => {
  return Intl.DateTimeFormat().resolvedOptions().timeZone;
};

// Countries list
const COUNTRIES = [
  { value: 'US', label: 'United States' },
  { value: 'CA', label: 'Canada' },
  { value: 'UK', label: 'United Kingdom' },
  { value: 'AU', label: 'Australia' },
  { value: 'DE', label: 'Germany' },
  { value: 'FR', label: 'France' },
  { value: 'IN', label: 'India' },
  { value: 'JP', label: 'Japan' },
  { value: 'SG', label: 'Singapore' },
  { value: 'NL', label: 'Netherlands' },
];

// Languages list
const LANGUAGES = [
  { value: 'English', label: 'English' },
  { value: 'Spanish', label: 'Spanish' },
  { value: 'French', label: 'French' },
  { value: 'German', label: 'German' },
  { value: 'Italian', label: 'Italian' },
  { value: 'Portuguese', label: 'Portuguese' },
  { value: 'Dutch', label: 'Dutch' },
  { value: 'Japanese', label: 'Japanese' },
  { value: 'Korean', label: 'Korean' },
  { value: 'Chinese', label: 'Chinese' },
];

// Roles list
const ROLES = [
  { value: 'Partner', label: 'Partner' },
  { value: 'Managing Partner', label: 'Managing Partner' },
  { value: 'Senior Partner', label: 'Senior Partner' },
  { value: 'Associate', label: 'Associate' },
  { value: 'Senior Associate', label: 'Senior Associate' },
  { value: 'Junior Associate', label: 'Junior Associate' },
  { value: 'Counsel', label: 'Counsel' },
  { value: 'Senior Counsel', label: 'Senior Counsel' },
  { value: 'Of Counsel', label: 'Of Counsel' },
  { value: 'Legal Director', label: 'Legal Director' },
  { value: 'Paralegal', label: 'Paralegal' },
  { value: 'Legal Assistant', label: 'Legal Assistant' },
  { value: 'Solo Practitioner', label: 'Solo Practitioner' },
];

const EditProfileModal = ({ isOpen, onClose, initialData, onSave }: EditProfileModalProps) => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<EditProfileFormData>({
    resolver: zodResolver(editProfileSchema),
    defaultValues: {
      // Personal Information
      firstName: initialData?.firstName || "",
      lastName: initialData?.lastName || "",
      phone: initialData?.phone || "",
      timezone: initialData?.timezone || getCurrentTimezone(),
      preferredLanguage: initialData?.preferredLanguage || "English",
      
      // Firm Information
      firmName: initialData?.firmName || "",
      address: initialData?.address || "",
      city: initialData?.city || "",
      state: initialData?.state || "",
      zipCode: initialData?.zipCode || "",
      country: initialData?.country || "US",
      
      // Team Information
      role: initialData?.role || "",
    },
    mode: "onChange",
  });

  const timezones = getTimezones();

  const handleSubmit = async (data: EditProfileFormData) => {
    if (!user?.id) return;

    setIsLoading(true);
    try {
      // Update personal information
      await supabaseWizardService.updateWizardData(
        user.id, 
        'personal', 
        {
          firstName: data.firstName,
          lastName: data.lastName,
          phone: data.phone,
          timezone: data.timezone,
          preferredLanguage: data.preferredLanguage,
        }
      );

      // Update firm information
      const firmData: any = {};
      if (data.firmName) firmData.firmName = data.firmName;
      if (data.address) firmData.address = data.address;
      if (data.city) firmData.city = data.city;
      if (data.state) firmData.state = data.state;
      if (data.zipCode) firmData.zipCode = data.zipCode;
      if (data.country) firmData.country = data.country;
      
      if (Object.keys(firmData).length > 0) {
        await supabaseWizardService.updateWizardData(user.id, 'firm', firmData);
      }

      // Update team information if role is provided
      if (data.role) {
        await supabaseWizardService.updateWizardData(
          user.id,
          'team',
          { role: data.role }
        );
      }

      // Also update the main profiles table with split names for consistency
      await supabaseUserService.updateProfile(user, {
        first_name: data.firstName,
        last_name: data.lastName,
      });

      // Update local state for immediate UI feedback
      onSave?.(data);
      toast.success("Profile updated successfully");
      onClose();
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error("Failed to update profile");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader className="space-y-3">
          <DialogTitle className="text-2xl font-bold">Edit Profile</DialogTitle>
          <DialogDescription className="text-base text-muted-foreground">
            Update your personal and professional information. Changes will be saved to your profile.
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-8">
            {/* Personal Information Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold border-b pb-2">Personal Information</h3>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="firstName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>First Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter first name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="lastName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Last Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter last name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field: { onChange, value }, fieldState: { error } }) => (
                    <FormItem>
                      <FormLabel>Phone <span className="text-muted-foreground text-xs">(Optional)</span></FormLabel>
                      <FormControl>
                        <PhoneInput
                          value={value}
                          onChange={onChange}
                          placeholder="Enter phone number"
                          defaultCountry="US"
                          error={!!error}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="timezone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Timezone</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select timezone" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="max-h-60">
                            {timezones.map((timezone) => (
                              <SelectItem key={timezone.value} value={timezone.value}>
                                <div className="flex items-center justify-between w-full">
                                  <span className="flex-1">{timezone.label}</span>
                                  <span className="text-muted-foreground text-xs ml-2">{timezone.offset}</span>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="preferredLanguage"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Preferred Language</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select language" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {LANGUAGES.map((language) => (
                              <SelectItem key={language.value} value={language.value}>
                                {language.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            </div>

            {/* Firm Information Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold border-b pb-2">Firm Information</h3>
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="firmName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Firm Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter firm name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Address</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter street address" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="city"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>City</FormLabel>
                        <FormControl>
                          <Input placeholder="City" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="state"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>State</FormLabel>
                        <FormControl>
                          <Input placeholder="State" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="zipCode"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>ZIP Code</FormLabel>
                        <FormControl>
                          <Input placeholder="ZIP Code" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="country"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Country</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select country" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {COUNTRIES.map((country) => (
                            <SelectItem key={country.value} value={country.value}>
                              {country.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Professional Information Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold border-b pb-2">Professional Information</h3>
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="role"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Role</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select your role" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {ROLES.map((role) => (
                            <SelectItem key={role.value} value={role.value}>
                              {role.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <DialogFooter className="gap-3 pt-6">
              <Button 
                type="button" 
                variant="outline" 
                onClick={onClose}
                className="flex-1 sm:flex-none"
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={isLoading}
                className="flex-1 sm:flex-none"
              >
                {isLoading ? "Saving..." : "Save Changes"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default EditProfileModal;