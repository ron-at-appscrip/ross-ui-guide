import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Crown, 
  Zap, 
  Users, 
  HeadphonesIcon, 
  Palette, 
  Code2, 
  Building2,
  Calendar,
  Mail,
  Phone,
  FileText,
  Gauge,
  User
} from 'lucide-react';
import { EnterpriseData } from '@/types/wizard';
import { formatPhoneNumber } from '@/components/ui/phone-input';

interface ProfileEnterpriseProps {
  data: Partial<EnterpriseData>;
}

const INTEGRATION_LABELS: Record<string, string> = {
  salesforce: 'Salesforce CRM',
  sharepoint: 'Microsoft SharePoint',
  workday: 'Workday',
  netsuite: 'NetSuite',
  'custom-erp': 'Custom ERP System',
  'legacy-systems': 'Legacy Systems',
};

const REPORT_LABELS: Record<string, string> = {
  'executive-dashboard': 'Executive Dashboard',
  'compliance-reports': 'Compliance Reports',
  'performance-analytics': 'Performance Analytics',
  'financial-reports': 'Financial Reports',
  'utilization-reports': 'Resource Utilization Reports',
  'custom-kpis': 'Custom KPI Tracking',
};

const ProfileEnterprise: React.FC<ProfileEnterpriseProps> = ({ data }) => {
  const enabledFeatures = [
    { enabled: data.dedicatedSupport, icon: HeadphonesIcon, label: 'Dedicated Support' },
    { enabled: data.dedicatedAccountManager, icon: User, label: 'Dedicated Account Manager' },
    { enabled: data.customBranding, icon: Palette, label: 'Custom Branding' },
    { enabled: data.apiAccess, icon: Code2, label: 'API Access' },
    { enabled: data.whiteLabeling, icon: Building2, label: 'White Labeling' },
    { enabled: data.priorityTraining, icon: Zap, label: 'Priority Training' },
  ].filter(feature => feature.enabled);

  return (
    <Card className="hover:shadow-md transition-all duration-200 border-primary/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-3 text-xl">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Crown className="w-5 h-5 text-primary" />
          </div>
          Enterprise Features
          <Badge variant="default" className="ml-auto bg-primary">
            ENTERPRISE
          </Badge>
        </CardTitle>
        <CardDescription className="text-base">
          Premium features and dedicated support for your enterprise
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Enterprise Contact Information */}
        <div className="space-y-4">
          <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
            Primary Contact
          </h4>
          <div className="grid md:grid-cols-2 gap-4">
            {data.contactName && (
              <div className="space-y-2">
                <dt className="text-sm font-medium text-muted-foreground">Name</dt>
                <dd className="text-base font-semibold flex items-center gap-2">
                  <User className="w-4 h-4 text-muted-foreground" />
                  <span>{data.contactName}</span>
                </dd>
              </div>
            )}
            {data.contactEmail && (
              <div className="space-y-2">
                <dt className="text-sm font-medium text-muted-foreground">Primary Contact Email</dt>
                <dd className="text-base font-semibold flex items-center gap-2">
                  <Mail className="w-4 h-4 text-muted-foreground" />
                  <a href={`mailto:${data.contactEmail}`} className="text-primary hover:underline">
                    {data.contactEmail}
                  </a>
                  <span className="text-xs text-muted-foreground">(Enterprise)</span>
                </dd>
              </div>
            )}
            {data.contactPhone && (
              <div className="space-y-2">
                <dt className="text-sm font-medium text-muted-foreground">Phone</dt>
                <dd className="text-base font-semibold flex items-center gap-2">
                  <Phone className="w-4 h-4 text-muted-foreground" />
                  <span>{formatPhoneNumber(data.contactPhone)}</span>
                </dd>
              </div>
            )}
            {data.expectedUsers && (
              <div className="space-y-2">
                <dt className="text-sm font-medium text-muted-foreground">Expected Users</dt>
                <dd className="text-base font-semibold flex items-center gap-2">
                  <Users className="w-4 h-4 text-muted-foreground" />
                  <span>{data.expectedUsers}</span>
                </dd>
              </div>
            )}
          </div>
        </div>

        {/* Go-Live Date & SLA */}
        <div className="grid md:grid-cols-2 gap-6">
          {data.goLiveDate && (
            <div className="space-y-2">
              <dt className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                Target Go-Live Date
              </dt>
              <dd className="text-base font-semibold flex items-center gap-2">
                <Calendar className="w-4 h-4 text-muted-foreground" />
                <span>{new Date(data.goLiveDate).toLocaleDateString()}</span>
              </dd>
            </div>
          )}
          {data.slaRequirements && (
            <div className="space-y-2">
              <dt className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                SLA Requirements
              </dt>
              <dd className="text-base font-semibold flex items-center gap-2">
                <Gauge className="w-4 h-4 text-muted-foreground" />
                <span>{data.slaRequirements}% Uptime</span>
              </dd>
            </div>
          )}
        </div>

        {/* Enabled Enterprise Features */}
        {enabledFeatures.length > 0 && (
          <div className="space-y-4">
            <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
              Enabled Features
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {enabledFeatures.map((feature, index) => (
                <div 
                  key={index}
                  className="flex items-center gap-3 p-3 bg-primary/5 rounded-lg border border-primary/10"
                >
                  <feature.icon className="w-5 h-5 text-primary" />
                  <span className="font-medium">{feature.label}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Custom Integrations */}
        {data.customIntegrations && data.customIntegrations.length > 0 && (
          <div className="space-y-4">
            <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
              Custom Integrations
            </h4>
            <div className="flex flex-wrap gap-2">
              {data.customIntegrations.map((integration) => (
                <Badge 
                  key={integration} 
                  variant="secondary" 
                  className="px-3 py-1.5 text-sm"
                >
                  <Code2 className="w-3 h-3 mr-1" />
                  {INTEGRATION_LABELS[integration] || integration}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Custom Reporting */}
        {data.customReporting && data.customReporting.length > 0 && (
          <div className="space-y-4">
            <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
              Custom Reporting
            </h4>
            <div className="flex flex-wrap gap-2">
              {data.customReporting.map((report) => (
                <Badge 
                  key={report} 
                  variant="outline" 
                  className="px-3 py-1.5 text-sm"
                >
                  <FileText className="w-3 h-3 mr-1" />
                  {REPORT_LABELS[report] || report}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Enterprise Support Banner */}
        <div className="mt-6 p-4 bg-primary/10 rounded-lg border border-primary/20">
          <div className="flex items-center gap-3">
            <HeadphonesIcon className="w-6 h-6 text-primary" />
            <div>
              <h4 className="font-semibold">24/7 Enterprise Support</h4>
              <p className="text-sm text-muted-foreground">
                Your dedicated support team is available around the clock
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProfileEnterprise;