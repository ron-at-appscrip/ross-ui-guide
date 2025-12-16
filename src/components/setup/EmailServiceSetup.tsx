import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import {
  CheckCircle,
  XCircle,
  AlertCircle,
  Copy,
  ExternalLink,
  Settings,
  Mail,
  Server,
  Key,
  Globe,
  RefreshCw,
  Loader2,
  Eye,
  EyeOff
} from 'lucide-react';
import { emailServiceWithDevMode } from '@/services/emailServiceWithDevMode';
import { useToast } from '@/components/ui/use-toast';

interface ConfigurationStatus {
  isConfigured: boolean;
  mode: string;
  issues: string[];
  suggestions: string[];
}

export const EmailServiceSetup: React.FC = () => {
  const [status, setStatus] = useState<ConfigurationStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showApiKey, setShowApiKey] = useState(false);
  const [testApiKey, setTestApiKey] = useState('');
  const [testingConnection, setTestingConnection] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    checkConfiguration();
  }, []);

  const checkConfiguration = async () => {
    setIsLoading(true);
    try {
      const configStatus = await emailServiceWithDevMode.checkConfiguration();
      setStatus(configStatus);
    } catch (error) {
      console.error('Error checking configuration:', error);
      toast({
        title: "Configuration check failed",
        description: "Unable to verify email service configuration",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const testConnection = async () => {
    setTestingConnection(true);
    try {
      // Test sending a mock email
      await emailServiceWithDevMode.sendEmail({
        to: ['test@example.com'],
        subject: 'Test Email Configuration',
        htmlContent: '<p>This is a test email to verify configuration.</p>',
        priority: 'low'
      });

      toast({
        title: "Connection test successful",
        description: "Email service is working correctly"
      });
    } catch (error) {
      toast({
        title: "Connection test failed",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive"
      });
    } finally {
      setTestingConnection(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied to clipboard",
      description: "Text has been copied to your clipboard"
    });
  };

  const getDnsRecords = (domain: string) => [
    {
      type: 'TXT',
      name: '@',
      value: `resend-verification=${domain.replace('.', '-')}-verification-key`,
      description: 'Domain verification record'
    },
    {
      type: 'MX',
      name: '@',
      value: '10 mx.resend.com',
      description: 'Mail exchange record'
    },
    {
      type: 'TXT',
      name: '@',
      value: 'v=spf1 include:_spf.resend.com ~all',
      description: 'SPF record for email authentication'
    },
    {
      type: 'CNAME',
      name: 'resend._domainkey',
      value: 'resend._domainkey.resend.com',
      description: 'DKIM signature record'
    }
  ];

  const getStatusIcon = (isConfigured: boolean) => {
    if (isLoading) return <Loader2 className="h-5 w-5 animate-spin" />;
    return isConfigured ? 
      <CheckCircle className="h-5 w-5 text-green-500" /> : 
      <XCircle className="h-5 w-5 text-red-500" />;
  };

  const getStatusColor = (isConfigured: boolean) => {
    return isConfigured ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Checking email service configuration...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Status Overview */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              Email Service Status
            </CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={checkConfiguration}
              disabled={isLoading}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {status && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {getStatusIcon(status.isConfigured)}
                  <span className="font-medium">
                    {status.isConfigured ? 'Fully Configured' : 'Configuration Required'}
                  </span>
                </div>
                <Badge className={getStatusColor(status.isConfigured)}>
                  {status.mode} mode
                </Badge>
              </div>

              {status.issues.length > 0 && (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    <div className="space-y-1">
                      <div className="font-medium">Issues found:</div>
                      <ul className="list-disc list-inside space-y-1">
                        {status.issues.map((issue, index) => (
                          <li key={index} className="text-sm">{issue}</li>
                        ))}
                      </ul>
                    </div>
                  </AlertDescription>
                </Alert>
              )}

              {status.suggestions.length > 0 && (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    <div className="space-y-1">
                      <div className="font-medium">Suggestions:</div>
                      <ul className="list-disc list-inside space-y-1">
                        {status.suggestions.map((suggestion, index) => (
                          <li key={index} className="text-sm">{suggestion}</li>
                        ))}
                      </ul>
                    </div>
                  </AlertDescription>
                </Alert>
              )}

              <div className="flex gap-2">
                <Button
                  onClick={testConnection}
                  disabled={testingConnection}
                  variant="outline"
                >
                  {testingConnection ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Settings className="h-4 w-4 mr-2" />
                  )}
                  Test Connection
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Setup Guide */}
      <Card>
        <CardHeader>
          <CardTitle>Email Service Setup Guide</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="resend" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="resend">1. Resend Account</TabsTrigger>
              <TabsTrigger value="domain">2. Domain Setup</TabsTrigger>
              <TabsTrigger value="supabase">3. Supabase Config</TabsTrigger>
              <TabsTrigger value="testing">4. Testing</TabsTrigger>
            </TabsList>

            {/* Step 1: Resend Account */}
            <TabsContent value="resend" className="space-y-4">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Create Resend Account</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <h4 className="font-medium">1. Sign up for Resend</h4>
                    <p className="text-sm text-gray-600">
                      Create an account at resend.com with your professional email address.
                    </p>
                    <Button variant="outline" size="sm" asChild>
                      <a href="https://resend.com/signup" target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="h-4 w-4 mr-2" />
                        Open Resend
                      </a>
                    </Button>
                  </div>
                  
                  <div className="space-y-2">
                    <h4 className="font-medium">2. Choose Plan</h4>
                    <p className="text-sm text-gray-600">
                      Free tier: 3,000 emails/month<br />
                      Pro tier: $20/month for professional use
                    </p>
                  </div>
                </div>

                <Separator />

                <div className="space-y-2">
                  <h4 className="font-medium">3. Generate API Key</h4>
                  <p className="text-sm text-gray-600 mb-3">
                    Go to API Keys section and create a new key with full permissions.
                  </p>
                  
                  <div className="flex items-center gap-2">
                    <Input
                      type={showApiKey ? 'text' : 'password'}
                      placeholder="re_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                      value={testApiKey}
                      onChange={(e) => setTestApiKey(e.target.value)}
                      className="font-mono text-sm"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowApiKey(!showApiKey)}
                    >
                      {showApiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                  
                  <Alert>
                    <Key className="h-4 w-4" />
                    <AlertDescription>
                      Keep your API key secure! Never commit it to version control or share it publicly.
                    </AlertDescription>
                  </Alert>
                </div>
              </div>
            </TabsContent>

            {/* Step 2: Domain Setup */}
            <TabsContent value="domain" className="space-y-4">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Domain Verification</h3>
                
                <div className="space-y-2">
                  <h4 className="font-medium">1. Add Domain to Resend</h4>
                  <p className="text-sm text-gray-600">
                    In your Resend dashboard, go to Domains and add your professional domain (e.g., yourlawfirm.com).
                  </p>
                </div>

                <div className="space-y-2">
                  <h4 className="font-medium">2. Configure DNS Records</h4>
                  <p className="text-sm text-gray-600 mb-3">
                    Add these DNS records to your domain registrar or DNS provider:
                  </p>
                  
                  <div className="space-y-3">
                    {getDnsRecords('yourdomain.com').map((record, index) => (
                      <div key={index} className="p-3 border rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <Badge variant="outline">{record.type}</Badge>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => copyToClipboard(record.value)}
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                        </div>
                        <div className="text-sm space-y-1">
                          <div><strong>Name:</strong> {record.name}</div>
                          <div><strong>Value:</strong> <code className="bg-gray-100 px-1 rounded">{record.value}</code></div>
                          <div className="text-gray-600">{record.description}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <Alert>
                  <Globe className="h-4 w-4" />
                  <AlertDescription>
                    DNS changes can take up to 48 hours to propagate globally. You can check verification status in your Resend dashboard.
                  </AlertDescription>
                </Alert>
              </div>
            </TabsContent>

            {/* Step 3: Supabase Configuration */}
            <TabsContent value="supabase" className="space-y-4">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Supabase Configuration</h3>
                
                <div className="space-y-2">
                  <h4 className="font-medium">1. Set Environment Variables</h4>
                  <p className="text-sm text-gray-600 mb-3">
                    Add your Resend API key to Supabase Edge Function secrets:
                  </p>
                  
                  <div className="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-sm">
                    <div># In your terminal:</div>
                    <div>supabase secrets set RESEND_API_KEY={testApiKey || 're_your_api_key_here'}</div>
                  </div>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard(`supabase secrets set RESEND_API_KEY=${testApiKey || 're_your_api_key_here'}`)}
                  >
                    <Copy className="h-4 w-4 mr-2" />
                    Copy Command
                  </Button>
                </div>

                <div className="space-y-2">
                  <h4 className="font-medium">2. Deploy Edge Functions</h4>
                  <p className="text-sm text-gray-600 mb-3">
                    Deploy the email functions to Supabase:
                  </p>
                  
                  <div className="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-sm space-y-1">
                    <div>supabase functions deploy send-email --no-verify-jwt</div>
                    <div>supabase functions deploy send-invoice-email --no-verify-jwt</div>
                    <div>supabase functions deploy send-client-communication --no-verify-jwt</div>
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="font-medium">3. Configure Sender Addresses</h4>
                  <p className="text-sm text-gray-600">
                    Set up professional sender addresses in your verified domain:
                  </p>
                  <ul className="text-sm text-gray-600 list-disc list-inside space-y-1">
                    <li>noreply@yourdomain.com - For automated emails</li>
                    <li>billing@yourdomain.com - For invoice emails</li>
                    <li>legal@yourdomain.com - For client communications</li>
                  </ul>
                </div>
              </div>
            </TabsContent>

            {/* Step 4: Testing */}
            <TabsContent value="testing" className="space-y-4">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Testing & Validation</h3>
                
                <div className="space-y-2">
                  <h4 className="font-medium">1. Test Email Sending</h4>
                  <p className="text-sm text-gray-600 mb-3">
                    Use the email composer to send a test email and verify delivery.
                  </p>
                  
                  <Button onClick={testConnection} disabled={testingConnection}>
                    {testingConnection ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Mail className="h-4 w-4 mr-2" />
                    )}
                    Send Test Email
                  </Button>
                </div>

                <div className="space-y-2">
                  <h4 className="font-medium">2. Verify Analytics</h4>
                  <p className="text-sm text-gray-600">
                    Check that email logs are being recorded and analytics are updating properly.
                  </p>
                </div>

                <div className="space-y-2">
                  <h4 className="font-medium">3. Test Templates</h4>
                  <p className="text-sm text-gray-600">
                    Send test emails using different templates (invoice, client communication, etc.) to verify formatting.
                  </p>
                </div>

                <div className="space-y-2">
                  <h4 className="font-medium">4. Monitor Delivery</h4>
                  <p className="text-sm text-gray-600">
                    Check email delivery status in both the application dashboard and Resend's analytics.
                  </p>
                </div>

                <Alert>
                  <CheckCircle className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Success Checklist:</strong>
                    <ul className="list-disc list-inside mt-2 space-y-1">
                      <li>Test emails are delivered successfully</li>
                      <li>Email logs appear in the analytics dashboard</li>
                      <li>Templates render correctly with professional formatting</li>
                      <li>Email status updates (delivered, opened) are tracked</li>
                    </ul>
                  </AlertDescription>
                </Alert>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Development Mode Information */}
      {status?.mode === 'development' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Development Mode Active
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <div className="space-y-2">
                  <div className="font-medium">You're currently in development mode.</div>
                  <div className="text-sm">
                    Emails are simulated and logged to the console. No actual emails are sent.
                    This allows you to test the UI and functionality without requiring API keys.
                  </div>
                  <div className="text-sm">
                    <strong>Development features:</strong>
                    <ul className="list-disc list-inside mt-1 space-y-1">
                      <li>Email sending simulated with realistic delays</li>
                      <li>Status updates (delivered, opened) automatically simulated</li>
                      <li>All emails logged to browser console for debugging</li>
                      <li>Analytics show mock data for testing dashboard</li>
                    </ul>
                  </div>
                </div>
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default EmailServiceSetup;