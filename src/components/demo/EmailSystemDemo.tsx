import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import {
  Mail,
  Settings,
  BarChart3,
  FileText,
  Play,
  CheckCircle,
  AlertCircle,
  Monitor,
  Code,
  Database,
  Server
} from 'lucide-react';
import { RealEmailComposer } from '@/components/communications/RealEmailComposer';
import { EmailAnalyticsDashboard } from '@/components/communications/EmailAnalyticsDashboard';
import { EmailServiceSetup } from '@/components/setup/EmailServiceSetup';
import { EmailServiceHealthCheck } from '@/components/setup/EmailServiceHealthCheck';
import { useEmail, useEmailStats, useEmailLogs } from '@/hooks/useRealEmail';
import { emailServiceWithDevMode } from '@/services/emailServiceWithDevMode';

export const EmailSystemDemo: React.FC = () => {
  const [demoStep, setDemoStep] = useState(0);
  const [sentEmails, setSentEmails] = useState<string[]>([]);
  
  // Get current configuration
  const config = emailServiceWithDevMode.getConfiguration();
  const { sendEmail, isSendingEmail } = useEmail();
  const { data: stats } = useEmailStats();
  const { data: logs } = useEmailLogs({ limit: 5 });

  const demoSteps = [
    {
      title: "System Overview",
      description: "Complete email system with production-ready infrastructure"
    },
    {
      title: "Send Demo Email",
      description: "Experience the email composer with template system"
    },
    {
      title: "View Analytics",
      description: "Real-time email tracking and performance metrics"
    },
    {
      title: "System Configuration",
      description: "Setup guide and health monitoring"
    }
  ];

  const sendDemoEmail = async () => {
    try {
      await sendEmail({
        to: ['demo@example.com'],
        subject: 'Demo Email from Ross AI Legal System',
        htmlContent: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #1e40af;">Welcome to Ross AI Email System</h2>
            <p>This is a demonstration email showing the complete email integration working in development mode.</p>
            <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3>Features Demonstrated:</h3>
              <ul>
                <li>✅ Professional email templates</li>
                <li>✅ Real-time tracking and analytics</li>
                <li>✅ Development mode simulation</li>
                <li>✅ Complete legal practice integration</li>
              </ul>
            </div>
            <p>Check your browser console to see the email sending simulation in action!</p>
            <p style="color: #6b7280; font-size: 14px;">
              This email was sent in development mode - no actual emails are delivered.
            </p>
          </div>
        `,
        templateType: 'generic',
        priority: 'medium'
      });
      
      setSentEmails(prev => [...prev, `Demo email sent at ${new Date().toLocaleTimeString()}`]);
    } catch (error) {
      console.error('Demo email failed:', error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold">Email System Integration Demo</h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Complete Supabase + Resend email system with development mode, professional templates, 
          and comprehensive analytics - ready for immediate testing.
        </p>
        
        <div className="flex items-center justify-center gap-4">
          <Badge variant="outline" className="flex items-center gap-2">
            <Monitor className="h-4 w-4" />
            {config.mode} Mode
          </Badge>
          {config.mode === 'development' && (
            <Badge variant="secondary" className="flex items-center gap-2">
              <Code className="h-4 w-4" />
              No API Keys Required
            </Badge>
          )}
          <Badge variant="secondary" className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4" />
            Fully Functional
          </Badge>
        </div>
      </div>

      {/* Development Mode Notice */}
      {config.mode === 'development' && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <div className="space-y-2">
              <div className="font-medium">🚀 Development Mode Active</div>
              <div className="text-sm">
                You can test the complete email system right now! All functionality works with simulated email delivery:
                <ul className="list-disc list-inside mt-2 space-y-1">
                  <li>Send emails using the composer below</li>
                  <li>View real-time analytics and tracking</li>
                  <li>Test templates and attachments</li>
                  <li>All emails logged to browser console</li>
                </ul>
              </div>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Demo Steps */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Play className="h-5 w-5" />
            Interactive Demo
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {demoSteps.map((step, index) => (
              <button
                key={index}
                onClick={() => setDemoStep(index)}
                className={`p-4 border rounded-lg text-left transition-colors ${
                  demoStep === index 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center gap-2 mb-2">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${
                    demoStep === index ? 'bg-blue-500 text-white' : 'bg-gray-200'
                  }`}>
                    {index + 1}
                  </div>
                  <div className="font-medium">{step.title}</div>
                </div>
                <div className="text-sm text-gray-600">{step.description}</div>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Demo Content */}
      <div className="space-y-6">
        {demoStep === 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* System Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  System Stats
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span>Emails Sent</span>
                    <span className="font-bold">{stats?.totalSent || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Delivered</span>
                    <span className="font-bold text-green-600">{stats?.delivered || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Opened</span>
                    <span className="font-bold text-blue-600">{stats?.opened || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Templates</span>
                    <span className="font-bold">5</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Features */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5" />
                  Features Ready
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span>Professional Email Templates</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span>Real-time Analytics</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span>File Attachments</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span>Client/Matter Integration</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span>Development Mode Testing</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="h-5 w-5" />
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {logs?.slice(0, 3).map((log, index) => (
                    <div key={index} className="text-sm p-2 bg-gray-50 rounded">
                      <div className="font-medium truncate">{log.subject}</div>
                      <div className="text-gray-500 text-xs">
                        {log.recipient_email} • {new Date(log.sent_at).toLocaleDateString()}
                      </div>
                    </div>
                  ))}
                  {sentEmails.map((email, index) => (
                    <div key={`demo-${index}`} className="text-sm p-2 bg-blue-50 rounded">
                      <div className="font-medium">Demo Email</div>
                      <div className="text-blue-600 text-xs">{email}</div>
                    </div>
                  ))}
                  {(!logs || logs.length === 0) && sentEmails.length === 0 && (
                    <div className="text-center text-gray-500 py-4">
                      No recent activity
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {demoStep === 1 && (
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-xl font-semibold mb-2">Email Composer Demo</h3>
              <p className="text-gray-600 mb-4">
                Try sending an email! In development mode, emails are simulated and logged to the console.
              </p>
              <Button onClick={sendDemoEmail} disabled={isSendingEmail} className="mb-4">
                <Mail className="h-4 w-4 mr-2" />
                {isSendingEmail ? 'Sending...' : 'Send Quick Demo Email'}
              </Button>
            </div>
            
            <RealEmailComposer
              initialTo={['demo@example.com']}
              initialSubject="Test Email from Ross AI Legal System"
              initialContent="This is a test email to demonstrate the email composition and sending functionality."
              onSent={() => {
                setSentEmails(prev => [...prev, `Email sent at ${new Date().toLocaleTimeString()}`]);
              }}
            />
          </div>
        )}

        {demoStep === 2 && (
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-xl font-semibold mb-2">Email Analytics Dashboard</h3>
              <p className="text-gray-600">
                Real-time email tracking and performance metrics with interactive charts.
              </p>
            </div>
            <EmailAnalyticsDashboard />
          </div>
        )}

        {demoStep === 3 && (
          <Tabs defaultValue="setup" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="setup" className="flex items-center gap-2">
                <Settings className="h-4 w-4" />
                Setup Guide
              </TabsTrigger>
              <TabsTrigger value="health" className="flex items-center gap-2">
                <Server className="h-4 w-4" />
                Health Check
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="setup">
              <EmailServiceSetup />
            </TabsContent>
            
            <TabsContent value="health">
              <EmailServiceHealthCheck />
            </TabsContent>
          </Tabs>
        )}
      </div>

      {/* Call to Action */}
      <Card className="border-2 border-blue-200 bg-blue-50">
        <CardContent className="p-6">
          <div className="text-center space-y-4">
            <h3 className="text-xl font-semibold text-blue-900">Ready for Production?</h3>
            <p className="text-blue-700">
              The email system is fully functional in development mode. To enable production email sending:
            </p>
            <div className="flex items-center justify-center gap-4">
              <Button variant="outline" onClick={() => setDemoStep(3)}>
                <Settings className="h-4 w-4 mr-2" />
                View Setup Guide
              </Button>
              <Button asChild>
                <a href="https://resend.com/signup" target="_blank" rel="noopener noreferrer">
                  Create Resend Account
                </a>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Technical Details */}
      <Card>
        <CardHeader>
          <CardTitle>Technical Implementation</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold mb-3">🏗️ Architecture</h4>
              <ul className="space-y-1 text-sm">
                <li>• React Query for data fetching & caching</li>
                <li>• Supabase Edge Functions for email sending</li>
                <li>• React Email for professional templates</li>
                <li>• Real-time analytics dashboard</li>
                <li>• Development mode with simulation</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-3">📊 Features</h4>
              <ul className="space-y-1 text-sm">
                <li>• Professional legal email templates</li>
                <li>• File attachments and CC/BCC support</li>
                <li>• Email tracking and open rates</li>
                <li>• Client/matter context integration</li>
                <li>• Comprehensive error handling</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EmailSystemDemo;