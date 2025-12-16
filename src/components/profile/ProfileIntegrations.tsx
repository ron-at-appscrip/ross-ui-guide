import React from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plug, CheckCircle, Circle, Database, ArrowRightLeft } from 'lucide-react';
import { IntegrationPreferencesData } from '@/types/wizard';

interface ProfileIntegrationsProps {
  data: Partial<IntegrationPreferencesData>;
  firmSize: string;
}

const INTEGRATIONS = [
  { value: 'office365', label: 'Microsoft Office 365' },
  { value: 'google-workspace', label: 'Google Workspace' },
  { value: 'outlook', label: 'Microsoft Outlook' },
  { value: 'salesforce', label: 'Salesforce' },
  { value: 'slack', label: 'Slack' },
  { value: 'teams', label: 'Microsoft Teams' },
  { value: 'dropbox', label: 'Dropbox' },
  { value: 'box', label: 'Box' },
  { value: 'onedrive', label: 'OneDrive' },
  { value: 'quickbooks', label: 'QuickBooks' },
  { value: 'clio', label: 'Clio' },
  { value: 'mycase', label: 'MyCase' },
  { value: 'practicesuite', label: 'PracticeSuite' },
  { value: 'lawpay', label: 'LawPay' },
];

const ProfileIntegrations: React.FC<ProfileIntegrationsProps> = ({ data, firmSize }) => {
  const isRequired = firmSize === 'enterprise';
  const hasData = (data.preferredIntegrations && data.preferredIntegrations.length > 0) || 
                  data.dataImportNeeded || 
                  data.migrationAssistance;

  const getLabelForValue = (value: string) => {
    return INTEGRATIONS.find(integration => integration.value === value)?.label || value;
  };

  return (
    <Card className="hover:shadow-md transition-all duration-200">
      <CardHeader>
        <CardTitle className="flex items-center gap-3 text-xl">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Plug className="w-5 h-5 text-primary" />
          </div>
          Integrations
          {!isRequired && firmSize !== 'solo' && (
            <Badge variant="secondary" className="ml-auto">Optional</Badge>
          )}
        </CardTitle>
        <CardDescription className="text-base">
          Your preferred tools and data migration needs
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {!hasData ? (
          <div className="text-center py-8 text-muted-foreground">
            <Plug className="w-12 h-12 mx-auto mb-3 opacity-20" />
            <p className="text-sm">No integration preferences configured</p>
          </div>
        ) : (
          <>
            {/* Preferred Integrations */}
            {data.preferredIntegrations && data.preferredIntegrations.length > 0 && (
              <div className="space-y-4">
                <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                  Selected Integrations
                </h4>
                <div className="flex flex-wrap gap-2">
                  {data.preferredIntegrations.map((integration) => (
                    <Badge 
                      key={integration} 
                      variant="secondary" 
                      className="px-3 py-1.5 text-sm font-medium"
                    >
                      <Plug className="w-3 h-3 mr-1" />
                      {getLabelForValue(integration)}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Migration Services */}
            <div className="space-y-4">
              <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                Migration Services
              </h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                  <div className="flex items-center gap-3">
                    {data.dataImportNeeded ? (
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    ) : (
                      <Circle className="w-5 h-5 text-muted-foreground" />
                    )}
                    <div className="flex items-center gap-2">
                      <Database className="w-4 h-4 text-muted-foreground" />
                      <span className="font-medium">Data Import Assistance</span>
                    </div>
                  </div>
                  <Badge variant={data.dataImportNeeded ? "default" : "outline"}>
                    {data.dataImportNeeded ? "Requested" : "Not Needed"}
                  </Badge>
                </div>

                <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                  <div className="flex items-center gap-3">
                    {data.migrationAssistance ? (
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    ) : (
                      <Circle className="w-5 h-5 text-muted-foreground" />
                    )}
                    <div className="flex items-center gap-2">
                      <ArrowRightLeft className="w-4 h-4 text-muted-foreground" />
                      <span className="font-medium">Full Migration Support</span>
                    </div>
                  </div>
                  <Badge variant={data.migrationAssistance ? "default" : "outline"}>
                    {data.migrationAssistance ? "Requested" : "Not Needed"}
                  </Badge>
                </div>
              </div>
            </div>
          </>
        )}
        
        {/* Info Footer */}
        <div className="pt-4 border-t">
          <p className="text-xs text-muted-foreground">
            Integration settings can be managed in the Integrations section of your dashboard
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProfileIntegrations;