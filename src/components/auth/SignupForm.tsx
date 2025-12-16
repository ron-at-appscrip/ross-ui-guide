
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/SimpleAuthContext';
import { useSignupFlow } from '@/contexts/SignupFlowContext';
import { useToast } from '@/hooks/use-toast';
import PasswordStrengthIndicator from '@/components/auth/PasswordStrengthIndicator';

const signupSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Please enter a valid email address'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/\d/, 'Password must contain at least one number'),
  confirmPassword: z.string(),
  agreeToTerms: z.boolean().refine(val => val === true, {
    message: 'You must agree to the terms and conditions',
  }),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type SignupFormData = z.infer<typeof signupSchema>;

interface SignupFormProps {
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  socialLoading: boolean;
  setSocialLoading: (loading: boolean) => void;
}

const SignupForm: React.FC<SignupFormProps> = ({
  isLoading,
  setIsLoading,
  socialLoading,
  setSocialLoading
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const navigate = useNavigate();
  const { register: registerUser } = useAuth();
  const { setSignupData } = useSignupFlow();
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
  });

  const watchedPassword = watch('password', '');

  const onSubmit = async (data: SignupFormData) => {
    setIsLoading(true);
    try {
      // Use separate first and last names for registration
      const result = await registerUser(data.firstName, data.lastName, data.email, data.password);
      
      if (result.shouldRedirectToWizard) {
        const fullName = `${data.firstName.trim()} ${data.lastName.trim()}`.trim();
        
        // Store signup data for wizard
        setSignupData({
          name: fullName,
          firstName: data.firstName.trim(),
          lastName: data.lastName.trim(),
          email: data.email,
          provider: 'email',
        });
        
        // Also store temporarily in localStorage for email confirmation scenarios
        localStorage.setItem('pending-signup-data', JSON.stringify({
          name: fullName,
          firstName: data.firstName.trim(),
          lastName: data.lastName.trim(),
          email: data.email,
          provider: 'email',
        }));
        
        toast({
          title: "Account created!",
          description: "Complete your setup to get started with ROSS.AI.",
        });
        navigate('/signup-wizard');
      } else {
        toast({
          title: "Account created!",
          description: "Welcome to ROSS.AI. Your account has been created successfully.",
        });
        navigate('/dashboard');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Something went wrong. Please try again.";
      
      toast({
        title: "Registration failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <SocialLoginButtons 
        isLoading={anyLoading} 
        onLoadingChange={setSocialLoading}
        mode="signup"
      />

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <Separator />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">
            Or continue with email
          </span>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="firstName">First Name</Label>
            <Input
              id="firstName"
              type="text"
              placeholder="Enter your first name"
              {...register('firstName')}
              className={errors.firstName ? 'border-destructive' : ''}
              disabled={anyLoading}
            />
            {errors.firstName && (
              <p className="text-sm text-destructive">{errors.firstName.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="lastName">Last Name</Label>
            <Input
              id="lastName"
              type="text"
              placeholder="Enter your last name"
              {...register('lastName')}
              className={errors.lastName ? 'border-destructive' : ''}
              disabled={anyLoading}
            />
            {errors.lastName && (
              <p className="text-sm text-destructive">{errors.lastName.message}</p>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="Enter your email"
            {...register('email')}
            className={errors.email ? 'border-destructive' : ''}
            disabled={anyLoading}
          />
          {errors.email && (
            <p className="text-sm text-destructive">{errors.email.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? 'text' : 'password'}
              placeholder="Create a password"
              {...register('password')}
              className={errors.password ? 'border-destructive pr-12' : 'pr-12'}
              disabled={anyLoading}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-1 top-1/2 transform -translate-y-1/2 p-2 text-muted-foreground hover:text-foreground disabled:opacity-50 rounded-md hover:bg-muted/50 transition-colors"
              disabled={anyLoading}
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {errors.password && (
            <p className="text-sm text-destructive">{errors.password.message}</p>
          )}
          <PasswordStrengthIndicator password={watchedPassword} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="confirmPassword">Confirm Password</Label>
          <div className="relative">
            <Input
              id="confirmPassword"
              type={showConfirmPassword ? 'text' : 'password'}
              placeholder="Confirm your password"
              {...register('confirmPassword')}
              className={errors.confirmPassword ? 'border-destructive pr-12' : 'pr-12'}
              disabled={anyLoading}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-1 top-1/2 transform -translate-y-1/2 p-2 text-muted-foreground hover:text-foreground disabled:opacity-50 rounded-md hover:bg-muted/50 transition-colors"
              disabled={anyLoading}
              aria-label={showConfirmPassword ? "Hide password" : "Show password"}
            >
              {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {errors.confirmPassword && (
            <p className="text-sm text-destructive">{errors.confirmPassword.message}</p>
          )}
        </div>

        <div className="flex items-start space-x-3">
          <input
            type="checkbox"
            id="agreeToTerms"
            {...register('agreeToTerms')}
            className="rounded border-gray-300 mt-0.5 h-4 w-4 flex-shrink-0"
            disabled={anyLoading}
          />
          <div className="space-y-1">
            <Label htmlFor="agreeToTerms" className="text-sm leading-tight cursor-pointer">
              I agree to the{' '}
              <Link to="/terms" className="text-primary hover:underline font-medium">
                Terms of Service
              </Link>{' '}
              and{' '}
              <Link to="/privacy" className="text-primary hover:underline font-medium">
                Privacy Policy
              </Link>
            </Label>
            {errors.agreeToTerms && (
              <p className="text-sm text-destructive">{errors.agreeToTerms.message}</p>
            )}
          </div>
        </div>

        <Button
          type="submit"
          className="w-full"
          disabled={anyLoading}
        >
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {isLoading ? 'Creating account...' : 'Create account'}
        </Button>
      </form>

      <div className="text-center text-sm">
        <span className="text-muted-foreground">Already have an account? </span>
        <Link to="/login" className="text-primary hover:underline font-medium">
          Sign in
        </Link>
      </div>
    </div>
  );
};

export default SignupForm;
