import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { 
  Shield, 
  Key, 
  Smartphone, 
  Lock, 
  Eye,
  AlertTriangle,
  CheckCircle,
  Monitor,
  MapPin,
  Calendar,
  Trash2,
  Edit,
  User,
  Clock,
  RefreshCw,
  Computer,
  Tablet,
  LogOut
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/WorkingAuthContext';
import { useNavigate } from 'react-router-dom';
import ChangePasswordModal from '@/components/profile/ChangePasswordModal';
import { toast } from 'sonner';

interface SecuritySettings {
  twoFactorEnabled: boolean;
  emailNotifications: boolean;
  loginAlerts: boolean;
  suspiciousActivityAlerts: boolean;
}

interface LoginSession {
  id: string;
  device: string;
  location: string;
  lastActive: string;
  current: boolean;
  deviceType?: string;
  browser?: string;
  ipAddress?: string;
  startTime?: string;
  refreshCount?: number;
}

const SecuritySettings = () => {
  const { toast } = useToast();
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [isChangePasswordModalOpen, setIsChangePasswordModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [settings, setSettings] = useState<SecuritySettings>({
    twoFactorEnabled: true,
    emailNotifications: true,
    loginAlerts: true,
    suspiciousActivityAlerts: true,
  });

  const [sessions] = useState<LoginSession[]>([
    {
      id: '1',
      device: 'Chrome on macOS',
      location: 'New York, NY',
      lastActive: '2 minutes ago',
      current: true,
      deviceType: 'desktop',
      browser: 'Chrome',
      ipAddress: '192.168.1.100',
      startTime: '2024-07-14T10:00:00Z',
      refreshCount: 5,
    },
    {
      id: '2',
      device: 'Safari on iPhone',
      location: 'New York, NY',
      lastActive: '3 hours ago',
      current: false,
      deviceType: 'mobile',
      browser: 'Safari',
      ipAddress: '192.168.1.101',
      startTime: '2024-07-14T07:00:00Z',
      refreshCount: 2,
    },
    {
      id: '3',
      device: 'Chrome on Windows',
      location: 'Chicago, IL',
      lastActive: '2 days ago',
      current: false,
      deviceType: 'desktop',
      browser: 'Chrome',
      ipAddress: '10.0.0.45',
      startTime: '2024-07-12T14:30:00Z',
      refreshCount: 8,
    },
  ]);

  const handleSettingChange = (key: keyof SecuritySettings, value: boolean) => {
    setSettings(prev => ({ ...prev, [key]: value }));
    toast({
      title: "Setting Updated",
      description: "Your security setting has been updated successfully.",
    });
  };

  const handleChangePassword = () => {
    setIsChangePasswordModalOpen(true);
  };

  const handleDeleteAccount = async () => {
    if (!user?.id) return;

    setIsDeleting(true);
    try {
      // In a real implementation, you'd call a secure server endpoint
      // to delete the user account and all associated data
      toast.error('Account deletion requires contacting support for security reasons');
      // For demo purposes, we'll just sign out
      // await deleteUserAccount(user.id);
      // await signOut();
      // navigate('/');
      // toast.success('Account deleted successfully');
    } catch (error) {
      toast.error('Failed to delete account');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/');
      toast.success('Successfully signed out');
    } catch (error) {
      toast.error('Failed to sign out');
    }
  };

  const handleSetup2FA = () => {
    toast({
      title: "Two-Factor Authentication",
      description: "2FA setup process would be initiated here.",
    });
  };

  const handleRevokeSession = (sessionId: string) => {
    toast({
      title: "Session Revoked",
      description: "The selected session has been terminated.",
    });
  };

  const getDeviceIcon = (deviceType?: string) => {
    switch (deviceType?.toLowerCase()) {
      case 'mobile':
        return <Smartphone className="h-4 w-4" />;
      case 'tablet':
        return <Tablet className="h-4 w-4" />;
      case 'desktop':
      default:
        return <Computer className="h-4 w-4" />;
    }
  };

  const formatSessionDate = (dateString: string): string => {
    try {
      if (!dateString) return 'Unknown';
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'Invalid Date';
      return date.toLocaleString();
    } catch (error) {
      return 'Error parsing date';
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-heading-1 font-bold">Security Settings</h1>
        <p className="text-body text-muted-foreground">
          Manage your account security, authentication, and privacy settings.
        </p>
      </div>

      {/* Password Security */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="h-5 w-5" />
            Password Security
          </CardTitle>
          <CardDescription>
            Manage your password and account access credentials.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Password</p>
              <p className="text-sm text-muted-foreground">Last changed 3 months ago</p>
            </div>
            <Button variant="outline" onClick={handleChangePassword} className="gap-2">
              <Edit className="h-4 w-4" />
              Change Password
            </Button>
          </div>
          
          <Separator />
          
          <div className="space-y-4">
            <h3 className="text-form-label font-medium">Password Requirements</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span>At least 8 characters</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span>Contains uppercase letter</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span>Contains lowercase letter</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span>Contains number</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Two-Factor Authentication */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Smartphone className="h-5 w-5" />
            Two-Factor Authentication
          </CardTitle>
          <CardDescription>
            Add an extra layer of security to your account with 2FA.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div>
                <p className="text-sm font-medium">Two-Factor Authentication</p>
                <p className="text-sm text-muted-foreground">
                  {settings.twoFactorEnabled ? 'Enabled with authenticator app' : 'Not enabled'}
                </p>
              </div>
              {settings.twoFactorEnabled && (
                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                  Enabled
                </Badge>
              )}
            </div>
            <Switch
              checked={settings.twoFactorEnabled}
              onCheckedChange={(checked) => handleSettingChange('twoFactorEnabled', checked)}
            />
          </div>

          {settings.twoFactorEnabled && (
            <>
              <Separator />
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">Backup Codes</p>
                    <p className="text-sm text-muted-foreground">Generate backup codes for account recovery</p>
                  </div>
                  <Button variant="outline" size="sm">
                    Generate Codes
                  </Button>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">Recovery Email</p>
                    <p className="text-sm text-muted-foreground">j***@lawfirm.com</p>
                  </div>
                  <Button variant="outline" size="sm">
                    Update
                  </Button>
                </div>
              </div>
            </>
          )}

          {!settings.twoFactorEnabled && (
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-yellow-800">
                    Two-factor authentication is disabled
                  </p>
                  <p className="text-sm text-yellow-700 mt-1">
                    Enable 2FA to add an extra layer of security to your account.
                  </p>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="mt-2"
                    onClick={handleSetup2FA}
                  >
                    Setup 2FA
                  </Button>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Security Notifications */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Security Notifications
          </CardTitle>
          <CardDescription>
            Configure how you want to be notified about security events.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Email notifications</p>
                <p className="text-sm text-muted-foreground">Get notified via email about security events</p>
              </div>
              <Switch
                checked={settings.emailNotifications}
                onCheckedChange={(checked) => handleSettingChange('emailNotifications', checked)}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Login alerts</p>
                <p className="text-sm text-muted-foreground">Get alerted when your account is accessed</p>
              </div>
              <Switch
                checked={settings.loginAlerts}
                onCheckedChange={(checked) => handleSettingChange('loginAlerts', checked)}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Suspicious activity alerts</p>
                <p className="text-sm text-muted-foreground">Get notified about unusual account activity</p>
              </div>
              <Switch
                checked={settings.suspiciousActivityAlerts}
                onCheckedChange={(checked) => handleSettingChange('suspiciousActivityAlerts', checked)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Active Sessions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Monitor className="h-5 w-5" />
            Active Sessions
          </CardTitle>
          <CardDescription>
            Manage and monitor your active login sessions across devices.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {sessions.map((session) => (
            <div key={session.id} className="border rounded-lg p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-3">
                    <h3 className="font-semibold">{session.device}</h3>
                    {session.current && (
                      <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                        Current
                      </Badge>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-muted-foreground">
                    <div className="space-y-2">
                      {session.startTime && (
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4" />
                          Started: {formatSessionDate(session.startTime)}
                        </div>
                      )}
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        Last Activity: {session.lastActive}
                      </div>
                      {session.refreshCount && session.refreshCount > 0 && (
                        <div className="flex items-center gap-2">
                          <RefreshCw className="h-4 w-4" />
                          Refreshes: {session.refreshCount}
                        </div>
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        {getDeviceIcon(session.deviceType)}
                        Device: {session.deviceType || 'Unknown'} - {session.browser || 'Unknown'}
                      </div>
                      {session.ipAddress && (
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4" />
                          IP: {session.ipAddress}
                        </div>
                      )}
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4" />
                        Location: {session.location}
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-4 flex items-center justify-between">
                    <div className="text-xs text-muted-foreground">
                      Session ID: {session.id}
                    </div>
                    <div className="flex gap-2">
                      {session.current ? (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleSignOut}
                          className="gap-2"
                        >
                          <LogOut className="h-4 w-4" />
                          Sign Out
                        </Button>
                      ) : (
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleRevokeSession(session.id)}
                          className="gap-2"
                        >
                          <Trash2 className="h-4 w-4" />
                          Revoke
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* API Keys */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Key className="h-5 w-5" />
            API Keys
          </CardTitle>
          <CardDescription>
            Manage API keys for third-party integrations and applications.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center py-8">
            <Key className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-sm text-muted-foreground mb-4">No API keys created yet</p>
            <Button variant="outline">
              Create API Key
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Account Management */}
      <Card className="border-destructive/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-destructive">
            <User className="h-5 w-5" />
            Account Management
          </CardTitle>
          <CardDescription>
            Manage your account settings and data.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <Button 
              variant="outline" 
              className="gap-2 flex-1 sm:flex-none"
              onClick={handleSignOut}
            >
              <Monitor className="h-4 w-4" />
              Sign Out
            </Button>
          </div>
          
          <Separator />
          
          <div className="space-y-4">
            <div className="p-4 bg-destructive/5 border border-destructive/20 rounded-lg">
              <h4 className="text-sm font-semibold text-destructive mb-2">Danger Zone</h4>
              <p className="text-sm text-muted-foreground mb-4">
                Once you delete your account, there is no going back. Please be certain.
              </p>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" size="sm" className="gap-2">
                    <Trash2 className="h-4 w-4" />
                    Delete Account
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent className="sm:max-w-lg">
                  <AlertDialogHeader>
                    <AlertDialogTitle className="text-destructive">Are you absolutely sure?</AlertDialogTitle>
                    <AlertDialogDescription className="space-y-3">
                      <p>This action cannot be undone. This will permanently delete your account
                      and remove all your data from our servers, including:</p>
                      <ul className="list-disc list-inside space-y-1 text-sm bg-muted/50 p-3 rounded-md">
                        <li>Profile information and preferences</li>
                        <li>Firm and team data</li>
                        <li>Document history and AI interactions</li>
                        <li>Billing and subscription information</li>
                      </ul>
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleDeleteAccount}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      disabled={isDeleting}
                    >
                      {isDeleting ? 'Deleting...' : 'Delete Account'}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Change Password Modal */}
      <ChangePasswordModal
        isOpen={isChangePasswordModalOpen}
        onClose={() => setIsChangePasswordModalOpen(false)}
      />
    </div>
  );
};

export default SecuritySettings;