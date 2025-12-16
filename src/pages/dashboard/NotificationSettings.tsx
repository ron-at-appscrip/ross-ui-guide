import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Bell, 
  Mail, 
  MessageSquare, 
  Smartphone,
  Clock,
  FileText,
  DollarSign,
  AlertTriangle,
  Moon,
  Sun,
  Save,
  TestTube,
  RotateCcw
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface NotificationChannels {
  email: boolean;
  sms: boolean;
  inApp: boolean;
  push: boolean;
}

interface NotificationTypes {
  matterUpdates: boolean;
  clientCommunications: boolean;
  taskReminders: boolean;
  billingEvents: boolean;
  complianceAlerts: boolean;
}

interface NotificationSettings {
  channels: NotificationChannels;
  types: NotificationTypes;
  frequency: 'immediate' | 'daily' | 'weekly';
  doNotDisturb: {
    enabled: boolean;
    startTime: string;
    endTime: string;
    vacationMode: boolean;
  };
}

const NotificationSettings = () => {
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);
  
  const [settings, setSettings] = useState<NotificationSettings>({
    channels: {
      email: true,
      sms: false,
      inApp: true,
      push: true,
    },
    types: {
      matterUpdates: true,
      clientCommunications: true,
      taskReminders: true,
      billingEvents: true,
      complianceAlerts: true,
    },
    frequency: 'immediate',
    doNotDisturb: {
      enabled: false,
      startTime: '22:00',
      endTime: '08:00',
      vacationMode: false,
    },
  });

  const handleChannelChange = (channel: keyof NotificationChannels, checked: boolean) => {
    setSettings(prev => ({
      ...prev,
      channels: { ...prev.channels, [channel]: checked }
    }));
  };

  const handleTypeChange = (type: keyof NotificationTypes, checked: boolean) => {
    setSettings(prev => ({
      ...prev,
      types: { ...prev.types, [type]: checked }
    }));
  };

  const handleFrequencyChange = (frequency: 'immediate' | 'daily' | 'weekly') => {
    setSettings(prev => ({ ...prev, frequency }));
  };

  const handleDoNotDisturbChange = (field: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      doNotDisturb: { ...prev.doNotDisturb, [field]: value }
    }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: "Settings Saved",
        description: "Your notification preferences have been updated successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save settings. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleTestNotification = () => {
    toast({
      title: "Test Notification Sent",
      description: "Check your enabled channels for the test notification.",
    });
  };

  const handleReset = () => {
    setSettings({
      channels: { email: true, sms: false, inApp: true, push: true },
      types: { matterUpdates: true, clientCommunications: true, taskReminders: true, billingEvents: true, complianceAlerts: true },
      frequency: 'immediate',
      doNotDisturb: { enabled: false, startTime: '22:00', endTime: '08:00', vacationMode: false },
    });
    toast({
      title: "Settings Reset",
      description: "All notification settings have been reset to defaults.",
    });
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-heading-1 font-bold">Notification Settings</h1>
        <p className="text-body text-muted-foreground">
          Configure how and when you receive notifications about important events.
        </p>
      </div>

      {/* Notification Channels */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notification Channels
          </CardTitle>
          <CardDescription>
            Choose how you want to receive notifications across different channels.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex items-center justify-between space-x-2">
              <div className="flex items-center space-x-3">
                <Mail className="h-5 w-5 text-muted-foreground" />
                <div>
                  <Label className="text-sm font-medium">Email</Label>
                  <p className="text-sm text-muted-foreground">Get notified via email</p>
                </div>
              </div>
              <Switch
                checked={settings.channels.email}
                onCheckedChange={(checked) => handleChannelChange('email', checked)}
              />
            </div>

            <div className="flex items-center justify-between space-x-2">
              <div className="flex items-center space-x-3">
                <MessageSquare className="h-5 w-5 text-muted-foreground" />
                <div>
                  <Label className="text-sm font-medium">SMS</Label>
                  <p className="text-sm text-muted-foreground">Get text message alerts</p>
                </div>
              </div>
              <Switch
                checked={settings.channels.sms}
                onCheckedChange={(checked) => handleChannelChange('sms', checked)}
              />
            </div>

            <div className="flex items-center justify-between space-x-2">
              <div className="flex items-center space-x-3">
                <Bell className="h-5 w-5 text-muted-foreground" />
                <div>
                  <Label className="text-sm font-medium">In-App</Label>
                  <p className="text-sm text-muted-foreground">See notifications in the app</p>
                </div>
              </div>
              <Switch
                checked={settings.channels.inApp}
                onCheckedChange={(checked) => handleChannelChange('inApp', checked)}
              />
            </div>

            <div className="flex items-center justify-between space-x-2">
              <div className="flex items-center space-x-3">
                <Smartphone className="h-5 w-5 text-muted-foreground" />
                <div>
                  <Label className="text-sm font-medium">Push Notifications</Label>
                  <p className="text-sm text-muted-foreground">Browser push notifications</p>
                </div>
              </div>
              <Switch
                checked={settings.channels.push}
                onCheckedChange={(checked) => handleChannelChange('push', checked)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Notification Types */}
      <Card>
        <CardHeader>
          <CardTitle>Notification Types</CardTitle>
          <CardDescription>
            Select which types of events you want to be notified about.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <FileText className="h-5 w-5 text-muted-foreground" />
                <div>
                  <Label className="text-sm font-medium">Case/Matter Updates</Label>
                  <p className="text-sm text-muted-foreground">Status changes, new documents, assignments</p>
                </div>
              </div>
              <Switch
                checked={settings.types.matterUpdates}
                onCheckedChange={(checked) => handleTypeChange('matterUpdates', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <MessageSquare className="h-5 w-5 text-muted-foreground" />
                <div>
                  <Label className="text-sm font-medium">Client Communications</Label>
                  <p className="text-sm text-muted-foreground">New messages, emails, and communications</p>
                </div>
              </div>
              <Switch
                checked={settings.types.clientCommunications}
                onCheckedChange={(checked) => handleTypeChange('clientCommunications', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Clock className="h-5 w-5 text-muted-foreground" />
                <div>
                  <Label className="text-sm font-medium">Task Reminders & Deadlines</Label>
                  <p className="text-sm text-muted-foreground">Due dates, upcoming deadlines, task assignments</p>
                </div>
              </div>
              <Switch
                checked={settings.types.taskReminders}
                onCheckedChange={(checked) => handleTypeChange('taskReminders', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <DollarSign className="h-5 w-5 text-muted-foreground" />
                <div>
                  <Label className="text-sm font-medium">Billing Events</Label>
                  <p className="text-sm text-muted-foreground">Payment confirmations, invoice updates, billing alerts</p>
                </div>
              </div>
              <Switch
                checked={settings.types.billingEvents}
                onCheckedChange={(checked) => handleTypeChange('billingEvents', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <AlertTriangle className="h-5 w-5 text-muted-foreground" />
                <div>
                  <Label className="text-sm font-medium">Compliance Alerts</Label>
                  <p className="text-sm text-muted-foreground">Regulatory deadlines, compliance requirements</p>
                </div>
              </div>
              <Switch
                checked={settings.types.complianceAlerts}
                onCheckedChange={(checked) => handleTypeChange('complianceAlerts', checked)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Notification Frequency */}
      <Card>
        <CardHeader>
          <CardTitle>Notification Frequency</CardTitle>
          <CardDescription>
            Choose how often you want to receive notifications.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <RadioGroup 
            value={settings.frequency} 
            onValueChange={handleFrequencyChange}
            className="space-y-4"
          >
            <div className="flex items-center space-x-3">
              <RadioGroupItem value="immediate" id="immediate" />
              <div>
                <Label htmlFor="immediate" className="text-sm font-medium">Immediate</Label>
                <p className="text-sm text-muted-foreground">Receive notifications as events happen</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <RadioGroupItem value="daily" id="daily" />
              <div>
                <Label htmlFor="daily" className="text-sm font-medium">Daily Digest</Label>
                <p className="text-sm text-muted-foreground">Receive a summary once per day at 9:00 AM</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <RadioGroupItem value="weekly" id="weekly" />
              <div>
                <Label htmlFor="weekly" className="text-sm font-medium">Weekly Summary</Label>
                <p className="text-sm text-muted-foreground">Receive a summary every Monday at 9:00 AM</p>
              </div>
            </div>
          </RadioGroup>
        </CardContent>
      </Card>

      {/* Do Not Disturb */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Moon className="h-5 w-5" />
            Do Not Disturb
          </CardTitle>
          <CardDescription>
            Set quiet hours and vacation mode to control when you receive notifications.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-sm font-medium">Enable Do Not Disturb</Label>
              <p className="text-sm text-muted-foreground">Silence notifications during specified hours</p>
            </div>
            <Switch
              checked={settings.doNotDisturb.enabled}
              onCheckedChange={(checked) => handleDoNotDisturbChange('enabled', checked)}
            />
          </div>

          {settings.doNotDisturb.enabled && (
            <>
              <Separator />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="startTime">Start Time</Label>
                  <Input
                    id="startTime"
                    type="time"
                    value={settings.doNotDisturb.startTime}
                    onChange={(e) => handleDoNotDisturbChange('startTime', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="endTime">End Time</Label>
                  <Input
                    id="endTime"
                    type="time"
                    value={settings.doNotDisturb.endTime}
                    onChange={(e) => handleDoNotDisturbChange('endTime', e.target.value)}
                  />
                </div>
              </div>
            </>
          )}

          <Separator />

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Sun className="h-5 w-5 text-muted-foreground" />
              <div>
                <Label className="text-sm font-medium">Vacation Mode</Label>
                <p className="text-sm text-muted-foreground">
                  Temporarily disable all non-urgent notifications
                </p>
              </div>
            </div>
            <Switch
              checked={settings.doNotDisturb.vacationMode}
              onCheckedChange={(checked) => handleDoNotDisturbChange('vacationMode', checked)}
            />
          </div>

          {settings.doNotDisturb.vacationMode && (
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-center gap-2">
                <Sun className="h-5 w-5 text-yellow-600" />
                <p className="text-sm font-medium text-yellow-800">Vacation Mode Active</p>
              </div>
              <p className="text-sm text-yellow-700 mt-1">
                You'll only receive urgent notifications until vacation mode is disabled.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-3">
        <Button 
          onClick={handleSave} 
          disabled={isSaving}
          className="flex items-center gap-2"
        >
          <Save className="h-4 w-4" />
          {isSaving ? "Saving..." : "Save Changes"}
        </Button>
        
        <Button 
          variant="outline" 
          onClick={handleTestNotification}
          className="flex items-center gap-2"
        >
          <TestTube className="h-4 w-4" />
          Test Notification
        </Button>
        
        <Button 
          variant="outline" 
          onClick={handleReset}
          className="flex items-center gap-2"
        >
          <RotateCcw className="h-4 w-4" />
          Reset to Default
        </Button>
      </div>
    </div>
  );
};

export default NotificationSettings; 