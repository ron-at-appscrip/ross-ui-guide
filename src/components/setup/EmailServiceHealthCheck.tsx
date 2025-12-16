import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import {
  CheckCircle,
  XCircle,
  AlertCircle,
  RefreshCw,
  Loader2,
  Mail,
  Server,
  Database,
  Key,
  Globe,
  Activity,
  Clock
} from 'lucide-react';
import { emailServiceWithDevMode } from '@/services/emailServiceWithDevMode';
import { supabaseSecretsManager } from '@/utils/supabaseSecretsConfig';
import { useToast } from '@/components/ui/use-toast';

interface HealthCheckResult {
  component: string;
  status: 'healthy' | 'warning' | 'error' | 'unknown';
  message: string;
  details?: string;
  lastChecked: string;
  responseTime?: number;
}

interface SystemHealth {
  overall: 'healthy' | 'degraded' | 'down';
  score: number;
  checks: HealthCheckResult[];
  mode: 'production' | 'development';
  recommendations: string[];
}

export const EmailServiceHealthCheck: React.FC = () => {
  const [health, setHealth] = useState<SystemHealth | null>(null);
  const [isChecking, setIsChecking] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    performHealthCheck();
    
    // Set up periodic health checks every 5 minutes
    const interval = setInterval(performHealthCheck, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const performHealthCheck = async () => {
    setIsChecking(true);
    try {
      const checks: HealthCheckResult[] = [];
      const startTime = Date.now();

      // 1. Check email service configuration
      const configCheck = await checkEmailServiceConfig();
      checks.push(configCheck);

      // 2. Check database connectivity
      const dbCheck = await checkDatabaseHealth();
      checks.push(dbCheck);

      // 3. Check Supabase Edge Functions
      const edgeFunctionsCheck = await checkEdgeFunctions();
      checks.push(edgeFunctionsCheck);

      // 4. Check email templates
      const templatesCheck = await checkEmailTemplates();
      checks.push(templatesCheck);

      // 5. Check email logs and analytics
      const analyticsCheck = await checkEmailAnalytics();
      checks.push(analyticsCheck);

      // 6. Check secrets configuration
      const secretsCheck = await checkSecretsConfiguration();
      checks.push(secretsCheck);

      // Calculate overall health
      const healthyCount = checks.filter(c => c.status === 'healthy').length;
      const warningCount = checks.filter(c => c.status === 'warning').length;
      const errorCount = checks.filter(c => c.status === 'error').length;

      const score = Math.round((healthyCount / checks.length) * 100);
      
      let overall: SystemHealth['overall'];
      if (errorCount > 0) {
        overall = 'down';
      } else if (warningCount > 0) {
        overall = 'degraded';
      } else {
        overall = 'healthy';
      }

      // Get current mode
      const config = emailServiceWithDevMode.getConfiguration();
      
      // Generate recommendations
      const recommendations = generateRecommendations(checks, config.mode);

      setHealth({
        overall,
        score,
        checks,
        mode: config.mode,
        recommendations
      });

      setLastUpdate(new Date());
    } catch (error) {
      console.error('Health check failed:', error);
      toast({
        title: "Health check failed",
        description: "Unable to complete system health check",
        variant: "destructive"
      });
    } finally {
      setIsChecking(false);
    }
  };

  const checkEmailServiceConfig = async (): Promise<HealthCheckResult> => {
    const startTime = Date.now();
    try {
      const configStatus = await emailServiceWithDevMode.checkConfiguration();
      const responseTime = Date.now() - startTime;

      if (configStatus.isConfigured) {
        return {
          component: 'Email Service',
          status: 'healthy',
          message: `Email service is properly configured in ${configStatus.mode} mode`,
          responseTime,
          lastChecked: new Date().toISOString()
        };
      } else {
        return {
          component: 'Email Service',
          status: 'warning',
          message: `Running in ${configStatus.mode} mode with configuration issues`,
          details: configStatus.issues.join(', '),
          responseTime,
          lastChecked: new Date().toISOString()
        };
      }
    } catch (error) {
      return {
        component: 'Email Service',
        status: 'error',
        message: 'Email service configuration check failed',
        details: error instanceof Error ? error.message : 'Unknown error',
        responseTime: Date.now() - startTime,
        lastChecked: new Date().toISOString()
      };
    }
  };

  const checkDatabaseHealth = async (): Promise<HealthCheckResult> => {
    const startTime = Date.now();
    try {
      // Test database connectivity and email-related tables
      const { data, error } = await supabase
        .from('email_logs')
        .select('id')
        .limit(1);

      const responseTime = Date.now() - startTime;

      if (error) {
        return {
          component: 'Database',
          status: 'error',
          message: 'Database connectivity issues',
          details: error.message,
          responseTime,
          lastChecked: new Date().toISOString()
        };
      }

      return {
        component: 'Database',
        status: 'healthy',
        message: 'Database is accessible and email tables are available',
        responseTime,
        lastChecked: new Date().toISOString()
      };
    } catch (error) {
      return {
        component: 'Database',
        status: 'error',
        message: 'Database connection failed',
        details: error instanceof Error ? error.message : 'Unknown error',
        responseTime: Date.now() - startTime,
        lastChecked: new Date().toISOString()
      };
    }
  };

  const checkEdgeFunctions = async (): Promise<HealthCheckResult> => {
    const startTime = Date.now();
    try {
      const connectionTest = await supabaseSecretsManager.testEdgeFunctionConnection();
      const responseTime = Date.now() - startTime;

      if (connectionTest.success) {
        const deployedCount = connectionTest.functions.filter(f => f.deployed).length;
        return {
          component: 'Edge Functions',
          status: 'healthy',
          message: `All ${deployedCount} email functions are deployed and accessible`,
          responseTime,
          lastChecked: new Date().toISOString()
        };
      } else {
        const issues = connectionTest.functions
          .filter(f => !f.deployed)
          .map(f => `${f.name}: ${f.error || 'Not deployed'}`)
          .join(', ');

        return {
          component: 'Edge Functions',
          status: 'warning',
          message: 'Some Edge Functions are not accessible',
          details: issues,
          responseTime,
          lastChecked: new Date().toISOString()
        };
      }
    } catch (error) {
      return {
        component: 'Edge Functions',
        status: 'error',
        message: 'Edge Functions connectivity check failed',
        details: error instanceof Error ? error.message : 'Unknown error',
        responseTime: Date.now() - startTime,
        lastChecked: new Date().toISOString()
      };
    }
  };

  const checkEmailTemplates = async (): Promise<HealthCheckResult> => {
    const startTime = Date.now();
    try {
      const templates = await emailServiceWithDevMode.getEmailTemplates();
      const responseTime = Date.now() - startTime;

      if (templates.length > 0) {
        return {
          component: 'Email Templates',
          status: 'healthy',
          message: `${templates.length} email templates are available`,
          responseTime,
          lastChecked: new Date().toISOString()
        };
      } else {
        return {
          component: 'Email Templates',
          status: 'warning',
          message: 'No email templates found (using default templates)',
          details: 'Consider creating custom templates for better branding',
          responseTime,
          lastChecked: new Date().toISOString()
        };
      }
    } catch (error) {
      return {
        component: 'Email Templates',
        status: 'error',
        message: 'Email templates check failed',
        details: error instanceof Error ? error.message : 'Unknown error',
        responseTime: Date.now() - startTime,
        lastChecked: new Date().toISOString()
      };
    }
  };

  const checkEmailAnalytics = async (): Promise<HealthCheckResult> => {
    const startTime = Date.now();
    try {
      const stats = await emailServiceWithDevMode.getEmailStats();
      const responseTime = Date.now() - startTime;

      return {
        component: 'Email Analytics',
        status: 'healthy',
        message: `Analytics are working (${stats.totalSent} emails tracked)`,
        details: `Open rate: ${stats.totalSent > 0 ? Math.round((stats.opened / stats.totalSent) * 100) : 0}%`,
        responseTime,
        lastChecked: new Date().toISOString()
      };
    } catch (error) {
      return {
        component: 'Email Analytics',
        status: 'warning',
        message: 'Email analytics check failed',
        details: error instanceof Error ? error.message : 'Unknown error',
        responseTime: Date.now() - startTime,
        lastChecked: new Date().toISOString()
      };
    }
  };

  const checkSecretsConfiguration = async (): Promise<HealthCheckResult> => {
    const startTime = Date.now();
    try {
      const secretsCheck = await supabaseSecretsManager.checkSecretsConfiguration();
      const responseTime = Date.now() - startTime;

      if (secretsCheck.configured) {
        return {
          component: 'Secrets Configuration',
          status: 'healthy',
          message: 'All required secrets are properly configured',
          responseTime,
          lastChecked: new Date().toISOString()
        };
      } else {
        return {
          component: 'Secrets Configuration',
          status: 'warning',
          message: 'Some secrets may not be configured',
          details: secretsCheck.errors.join(', '),
          responseTime,
          lastChecked: new Date().toISOString()
        };
      }
    } catch (error) {
      return {
        component: 'Secrets Configuration',
        status: 'error',
        message: 'Secrets configuration check failed',
        details: error instanceof Error ? error.message : 'Unknown error',
        responseTime: Date.now() - startTime,
        lastChecked: new Date().toISOString()
      };
    }
  };

  const generateRecommendations = (checks: HealthCheckResult[], mode: string): string[] => {
    const recommendations: string[] = [];

    // Check for errors
    const errorChecks = checks.filter(c => c.status === 'error');
    if (errorChecks.length > 0) {
      recommendations.push(`Fix ${errorChecks.length} critical issues: ${errorChecks.map(c => c.component).join(', ')}`);
    }

    // Check for warnings
    const warningChecks = checks.filter(c => c.status === 'warning');
    if (warningChecks.length > 0) {
      recommendations.push(`Address ${warningChecks.length} warnings for optimal performance`);
    }

    // Mode-specific recommendations
    if (mode === 'development') {
      recommendations.push('Configure Resend API key and deploy Edge Functions for production use');
    }

    // Performance recommendations
    const slowChecks = checks.filter(c => c.responseTime && c.responseTime > 1000);
    if (slowChecks.length > 0) {
      recommendations.push('Some components are responding slowly - consider optimization');
    }

    if (recommendations.length === 0) {
      recommendations.push('System is healthy - no immediate actions required');
    }

    return recommendations;
  };

  const getStatusIcon = (status: HealthCheckResult['status']) => {
    switch (status) {
      case 'healthy':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'warning':
        return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: HealthCheckResult['status']) => {
    switch (status) {
      case 'healthy':
        return 'bg-green-100 text-green-800';
      case 'warning':
        return 'bg-yellow-100 text-yellow-800';
      case 'error':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getOverallStatusColor = (status: SystemHealth['overall']) => {
    switch (status) {
      case 'healthy':
        return 'text-green-600';
      case 'degraded':
        return 'text-yellow-600';
      case 'down':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  if (!health && isChecking) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Performing health check...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Overall Status */}
      {health && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                System Health Status
              </CardTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={performHealthCheck}
                disabled={isChecking}
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${isChecking ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`text-2xl font-bold ${getOverallStatusColor(health.overall)}`}>
                    {health.overall.charAt(0).toUpperCase() + health.overall.slice(1)}
                  </div>
                  <Badge className={getStatusColor(health.overall === 'healthy' ? 'healthy' : 'warning')}>
                    {health.mode} mode
                  </Badge>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold">{health.score}%</div>
                  <div className="text-sm text-gray-500">Health Score</div>
                </div>
              </div>

              <Progress value={health.score} className="w-full" />

              {lastUpdate && (
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <Clock className="h-4 w-4" />
                  Last updated: {lastUpdate.toLocaleString()}
                </div>
              )}

              {/* Recommendations */}
              {health.recommendations.length > 0 && (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    <div className="space-y-1">
                      <div className="font-medium">Recommendations:</div>
                      <ul className="list-disc list-inside space-y-1">
                        {health.recommendations.map((rec, index) => (
                          <li key={index} className="text-sm">{rec}</li>
                        ))}
                      </ul>
                    </div>
                  </AlertDescription>
                </Alert>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Component Status Details */}
      {health && (
        <Card>
          <CardHeader>
            <CardTitle>Component Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {health.checks.map((check, index) => (
                <div key={index} className="flex items-start gap-3 p-3 border rounded-lg">
                  {getStatusIcon(check.status)}
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <div className="font-medium">{check.component}</div>
                      <div className="flex items-center gap-2">
                        {check.responseTime && (
                          <span className="text-xs text-gray-500">
                            {check.responseTime}ms
                          </span>
                        )}
                        <Badge variant="outline" className={getStatusColor(check.status)}>
                          {check.status}
                        </Badge>
                      </div>
                    </div>
                    <div className="text-sm text-gray-700">{check.message}</div>
                    {check.details && (
                      <div className="text-xs text-gray-500 mt-1">{check.details}</div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default EmailServiceHealthCheck;