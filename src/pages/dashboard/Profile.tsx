import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/WorkingAuthContext";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  User, 
  Building2, 
  Mail, 
  Phone, 
  Globe, 
  MapPin, 
  Scale, 
  Users, 
  LogOut, 
  Edit,
  Clock,
  Crown,
  Settings
} from "lucide-react";
import { supabaseWizardService } from "@/services/supabaseWizardService";
import { toast } from "sonner";
import { formatPhoneNumber } from "@/components/ui/phone-input";
import EditProfileModal from "@/components/profile/EditProfileModal";
import ProfileCompliance from "@/components/profile/ProfileCompliance";
import ProfileEnterprise from "@/components/profile/ProfileEnterprise";
import ProfileIntegrations from "@/components/profile/ProfileIntegrations";
import IncompleteSetupCard from "@/components/profile/IncompleteSetupCard";
import { FirmSize } from "@/types/firmSize";
import { IntegrationPreferencesData, ComplianceData, EnterpriseData } from "@/types/wizard";

interface WizardData {
  personalInfo?: {
    firstName?: string;
    lastName?: string;
    phone?: string;
    timezone?: string;
    preferredLanguage?: string;
  };
  firmInfo?: {
    firmName?: string;
    firmSize?: string;
    address?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    country?: string;
  };
  practiceAreas?: {
    primaryPracticeAreas?: string[];
    secondaryPracticeAreas?: string[];
    specializations?: string[];
  };
  teamSetup?: {
    role?: string;
    teamSize?: string;
    inviteEmails?: { email: string }[];
  };
  integrationPreferences?: IntegrationPreferencesData;
  compliance?: ComplianceData;
  enterprise?: EnterpriseData;
}

const Profile = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [wizardData, setWizardData] = useState<WizardData>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  
  // Get firm size from wizard data
  const firmSize = wizardData.firmInfo?.firmSize as FirmSize | undefined;

  useEffect(() => {
    const loadWizardData = async () => {
      if (!user?.id) {
        setIsLoading(false);
        return;
      }

      try {
        const data = await supabaseWizardService.getAllWizardData(user.id);
        setWizardData(data);
      } catch (error) {
        console.error('Error loading wizard data:', error);
        toast.error('Failed to load profile data');
      } finally {
        setIsLoading(false);
      }
    };

    loadWizardData();
  }, [user?.id]);

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/');
      toast.success('Successfully signed out');
    } catch (error) {
      toast.error('Failed to sign out');
    }
  };


  const getInitials = () => {
    // Use split names if available for more accurate initials
    if (wizardData.personalInfo?.firstName && wizardData.personalInfo?.lastName) {
      return `${wizardData.personalInfo.firstName[0]}${wizardData.personalInfo.lastName[0]}`.toUpperCase();
    }
    
    // Fallback to full name parsing
    const name = user?.full_name || user?.name || 'U';
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  if (isLoading) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <div className="animate-pulse space-y-8">
          <div className="h-10 bg-muted/50 rounded-md w-1/3"></div>
          <div className="space-y-6">
            <div className="h-32 bg-muted/30 rounded-lg"></div>
            <div className="h-48 bg-muted/30 rounded-lg"></div>
            <div className="h-40 bg-muted/30 rounded-lg"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Responsive Background */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/2 via-transparent to-primary/1"></div>
        <div className="absolute top-10 right-10 sm:top-20 sm:right-20 w-20 h-20 sm:w-32 sm:h-32 bg-primary/4 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-10 left-10 sm:bottom-20 sm:left-20 w-16 h-16 sm:w-24 sm:h-24 bg-primary/3 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      {/* Header */}
      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div className="space-y-1">
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">Profile Settings</h1>
            <p className="text-muted-foreground text-lg">Manage your account information and preferences</p>
          </div>
          <div className="flex gap-3 self-start sm:self-center">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => navigate('/dashboard/settings/security')}
              className="gap-2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <Settings className="w-4 h-4" />
              <span className="hidden sm:inline">Security</span>
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleSignOut} 
              className="gap-2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Sign Out</span>
            </Button>
          </div>
        </div>

        {/* Profile Overview Card */}
        <Card className="hover:shadow-md transition-all duration-200 border-2">
          <CardHeader className="pb-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
              <Avatar className="w-20 h-20 ring-2 ring-primary/10">
                <AvatarImage src={user?.avatar_url || ''} />
                <AvatarFallback className="bg-primary/10 text-primary text-xl font-semibold">
                  {getInitials()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0 space-y-2">
                <h2 className="text-2xl sm:text-3xl font-bold tracking-tight truncate">
                  {wizardData.personalInfo?.firstName && wizardData.personalInfo?.lastName
                    ? `${wizardData.personalInfo.firstName} ${wizardData.personalInfo.lastName}`
                    : user?.full_name || 'User'
                  }
                </h2>
                <p className="text-muted-foreground flex items-center gap-2 text-sm sm:text-base">
                  <Mail className="w-4 h-4 flex-shrink-0" />
                  <span className="truncate">{user?.email}</span>
                  <span className="text-xs text-muted-foreground">(Account)</span>
                </p>
                <div className="flex flex-wrap items-center gap-2 mt-2">
                  {wizardData.teamSetup?.role && (
                    <Badge variant="default" className="font-medium">
                      {wizardData.teamSetup.role}
                    </Badge>
                  )}
                  {firmSize && (
                    <Badge 
                      variant={firmSize === 'enterprise' ? 'default' : 'secondary'} 
                      className={firmSize === 'enterprise' ? 'bg-primary font-medium' : 'font-medium'}
                    >
                      {firmSize === 'solo' && 'Solo Practitioner'}
                      {firmSize === 'small' && 'Small Firm'}
                      {firmSize === 'mid-large' && 'Mid-Large Firm'}
                      {firmSize === 'enterprise' && (
                        <span className="flex items-center gap-1">
                          <Crown className="w-3 h-3" />
                          Enterprise
                        </span>
                      )}
                    </Badge>
                  )}
                </div>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                className="gap-2 self-start sm:self-center shrink-0"
                onClick={() => setIsEditModalOpen(true)}
              >
                <Edit className="w-4 h-4" />
                <span className="hidden sm:inline">Edit Profile</span>
                <span className="sm:hidden">Edit</span>
              </Button>
            </div>
          </CardHeader>
        </Card>
      </div>

      {/* Main Content */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 space-y-8">
        {/* Personal Information */}
        <Card className="hover:shadow-md transition-all duration-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-xl">
              <div className="p-2 bg-primary/10 rounded-lg">
                <User className="w-5 h-5 text-primary" />
              </div>
              Personal Information
            </CardTitle>
            <CardDescription className="text-base">Your personal details and preferences</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {Object.keys(wizardData).length === 0 ? (
              <div className="text-center py-12 text-muted-foreground space-y-4">
                <div className="w-16 h-16 mx-auto bg-muted/30 rounded-full flex items-center justify-center">
                  <User className="w-8 h-8" />
                </div>
                <div>
                  <p className="text-lg font-medium mb-2">No profile data found</p>
                  <p className="text-sm">Complete your signup wizard to see your information here.</p>
                </div>
                <Button 
                  variant="default" 
                  className="mt-6"
                  onClick={() => navigate('/signup-wizard')}
                >
                  Complete Profile Setup
                </Button>
              </div>
            ) : (
              <dl className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <dt className="text-sm font-medium text-muted-foreground uppercase tracking-wide">First Name</dt>
                  <dd className="text-base font-semibold">{wizardData.personalInfo?.firstName || 'Not provided'}</dd>
                </div>
                <div className="space-y-2">
                  <dt className="text-sm font-medium text-muted-foreground uppercase tracking-wide">Last Name</dt>
                  <dd className="text-base font-semibold">{wizardData.personalInfo?.lastName || 'Not provided'}</dd>
                </div>
                <div className="space-y-2">
                  <dt className="text-sm font-medium text-muted-foreground uppercase tracking-wide">Phone</dt>
                  <dd className="text-base font-semibold flex items-center gap-2">
                    <Phone className="w-4 h-4 text-muted-foreground" />
                    <span>{formatPhoneNumber(wizardData.personalInfo?.phone) || 'Not provided'}</span>
                  </dd>
                </div>
                <div className="space-y-2">
                  <dt className="text-sm font-medium text-muted-foreground uppercase tracking-wide">Timezone</dt>
                  <dd className="text-base font-semibold flex items-center gap-2">
                    <Clock className="w-4 h-4 text-muted-foreground" />
                    <span>{wizardData.personalInfo?.timezone || 'Not provided'}</span>
                  </dd>
                </div>
                <div className="space-y-2 md:col-span-2">
                  <dt className="text-sm font-medium text-muted-foreground uppercase tracking-wide">Language</dt>
                  <dd className="text-base font-semibold flex items-center gap-2">
                    <Globe className="w-4 h-4 text-muted-foreground" />
                    <span>{wizardData.personalInfo?.preferredLanguage || 'Not provided'}</span>
                  </dd>
                </div>
              </dl>
            )}
          </CardContent>
        </Card>

        {/* Firm Information */}
        <Card className="hover:shadow-md transition-all duration-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-xl">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Building2 className="w-5 h-5 text-primary" />
              </div>
              Firm Information
            </CardTitle>
            <CardDescription className="text-base">Details about your law firm</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <dl className="grid md:grid-cols-2 gap-6">
              <div className="md:col-span-2 space-y-2">
                <dt className="text-sm font-medium text-muted-foreground uppercase tracking-wide">Firm Name</dt>
                <dd className="text-lg font-bold text-foreground">{wizardData.firmInfo?.firmName || 'Not provided'}</dd>
              </div>
              <div className="space-y-2">
                <dt className="text-sm font-medium text-muted-foreground uppercase tracking-wide">Firm Size</dt>
                <dd className="text-base font-semibold flex items-center gap-2">
                  <Users className="w-4 h-4 text-muted-foreground" />
                  <span>{wizardData.firmInfo?.firmSize || 'Not provided'}</span>
                </dd>
              </div>
              <div className="space-y-2">
                <dt className="text-sm font-medium text-muted-foreground uppercase tracking-wide">Country</dt>
                <dd className="text-base font-semibold flex items-center gap-2">
                  <Globe className="w-4 h-4 text-muted-foreground" />
                  <span>{wizardData.firmInfo?.country || 'Not provided'}</span>
                </dd>
              </div>
              {wizardData.firmInfo?.address && (
                <div className="md:col-span-2 space-y-2">
                  <dt className="text-sm font-medium text-muted-foreground uppercase tracking-wide">Address</dt>
                  <dd className="text-base font-semibold flex items-start gap-2">
                    <MapPin className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                    <span className="max-w-prose break-words">
                      {wizardData.firmInfo.address}
                      {wizardData.firmInfo.city && `, ${wizardData.firmInfo.city}`}
                      {wizardData.firmInfo.state && `, ${wizardData.firmInfo.state}`}
                      {wizardData.firmInfo.zipCode && ` ${wizardData.firmInfo.zipCode}`}
                    </span>
                  </dd>
                </div>
              )}
            </dl>
          </CardContent>
        </Card>

        {/* Practice Areas */}
        {wizardData.practiceAreas?.primaryPracticeAreas && (
          <Card className="hover:shadow-md transition-all duration-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-xl">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Scale className="w-5 h-5 text-primary" />
                </div>
                Practice Areas
              </CardTitle>
              <CardDescription className="text-base">Your areas of legal expertise</CardDescription>
            </CardHeader>
            <CardContent className="space-y-8">
              <div className="space-y-4">
                <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">Primary Practice Areas</h4>
                <div className="flex flex-wrap gap-3">
                  {wizardData.practiceAreas.primaryPracticeAreas.map((area, index) => (
                    <Badge key={index} variant="default" className="px-3 py-1.5 text-sm font-medium">{area}</Badge>
                  ))}
                </div>
              </div>
              {wizardData.practiceAreas.secondaryPracticeAreas && wizardData.practiceAreas.secondaryPracticeAreas.length > 0 && (
                <div className="space-y-4">
                  <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">Secondary Practice Areas</h4>
                  <div className="flex flex-wrap gap-3">
                    {wizardData.practiceAreas.secondaryPracticeAreas.map((area, index) => (
                      <Badge key={index} variant="secondary" className="px-3 py-1.5 text-sm font-medium">{area}</Badge>
                    ))}
                  </div>
                </div>
              )}
              {wizardData.practiceAreas.specializations && wizardData.practiceAreas.specializations.length > 0 && (
                <div className="space-y-4">
                  <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">Specializations</h4>
                  <div className="flex flex-wrap gap-3">
                    {wizardData.practiceAreas.specializations.map((spec, index) => (
                      <Badge key={index} variant="outline" className="px-3 py-1.5 text-sm font-medium">{spec}</Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Team Information - Show for non-solo firms */}
        {firmSize !== 'solo' && wizardData.teamSetup && (
          <Card className="hover:shadow-md transition-all duration-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-xl">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Users className="w-5 h-5 text-primary" />
                </div>
                Team Setup
              </CardTitle>
              <CardDescription className="text-base">Your role and team configuration</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <dl className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <dt className="text-sm font-medium text-muted-foreground uppercase tracking-wide">Your Role</dt>
                  <dd className="text-base font-semibold">{wizardData.teamSetup.role || 'Not provided'}</dd>
                </div>
                <div className="space-y-2">
                  <dt className="text-sm font-medium text-muted-foreground uppercase tracking-wide">Team Size</dt>
                  <dd className="text-base font-semibold">{wizardData.teamSetup.teamSize || 'Not provided'}</dd>
                </div>
              </dl>
              {wizardData.teamSetup.inviteEmails && wizardData.teamSetup.inviteEmails.length > 0 && (
                <div className="space-y-4">
                  <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">Team Invitations Sent</h4>
                  <div className="space-y-3">
                    {wizardData.teamSetup.inviteEmails.map((invite, index) => (
                      <div key={index} className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                        <Mail className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                        <span className="text-sm font-medium truncate">{invite.email}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Incomplete Team Setup Prompt - For small firms that skipped */}
        {firmSize === 'small' && !wizardData.teamSetup && (
          <IncompleteSetupCard type="team" firmSize={firmSize} />
        )}

        {/* Integrations - For small+ firms */}
        {firmSize && firmSize !== 'solo' && wizardData.integrationPreferences && (
          <ProfileIntegrations data={wizardData.integrationPreferences} firmSize={firmSize} />
        )}

        {/* Incomplete Integrations Prompt - For firms that skipped */}
        {firmSize && ['small', 'mid-large'].includes(firmSize) && !wizardData.integrationPreferences && (
          <IncompleteSetupCard type="integrations" firmSize={firmSize} />
        )}

        {/* Compliance - For mid-large+ firms */}
        {firmSize && (firmSize === 'mid-large' || firmSize === 'enterprise') && wizardData.compliance && (
          <ProfileCompliance data={wizardData.compliance} firmSize={firmSize} />
        )}

        {/* Incomplete Compliance Prompt - For mid-large firms that skipped */}
        {firmSize === 'mid-large' && !wizardData.compliance && (
          <IncompleteSetupCard type="compliance" firmSize={firmSize} />
        )}

        {/* Enterprise Features - For enterprise firms only */}
        {firmSize === 'enterprise' && wizardData.enterprise && (
          <ProfileEnterprise data={wizardData.enterprise} />
        )}



        {/* Edit Profile Modal */}
        <EditProfileModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          initialData={{
            // Personal Information
            firstName: wizardData.personalInfo?.firstName,
            lastName: wizardData.personalInfo?.lastName,
            phone: wizardData.personalInfo?.phone,
            timezone: wizardData.personalInfo?.timezone,
            preferredLanguage: wizardData.personalInfo?.preferredLanguage,
            
            // Firm Information
            firmName: wizardData.firmInfo?.firmName,
            address: wizardData.firmInfo?.address,
            city: wizardData.firmInfo?.city,
            state: wizardData.firmInfo?.state,
            zipCode: wizardData.firmInfo?.zipCode,
            country: wizardData.firmInfo?.country,
            
            // Team Information
            role: wizardData.teamSetup?.role,
          }}
          onSave={async (data) => {
            // Update the local state for immediate UI feedback
            setWizardData(prev => ({
              ...prev,
              personalInfo: {
                ...prev.personalInfo,
                firstName: data.firstName,
                lastName: data.lastName,
                phone: data.phone,
                timezone: data.timezone,
                preferredLanguage: data.preferredLanguage,
              },
              firmInfo: {
                ...prev.firmInfo,
                firmName: data.firmName,
                address: data.address,
                city: data.city,
                state: data.state,
                zipCode: data.zipCode,
                country: data.country,
              },
              teamSetup: {
                ...prev.teamSetup,
                role: data.role,
              }
            }));

            // Reload data from database to ensure consistency
            if (user?.id) {
              try {
                const refreshedData = await supabaseWizardService.getAllWizardData(user.id);
                setWizardData(refreshedData);
              } catch (error) {
                console.error('Error refreshing wizard data:', error);
              }
            }
          }}
        />
      </div>
    </div>
  );
};

export default Profile;