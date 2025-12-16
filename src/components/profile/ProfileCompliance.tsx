import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Shield, Lock, FileCheck, AlertTriangle, Calendar, Mail, Database, Key } from 'lucide-react';
import { ComplianceData } from '@/types/wizard';

interface ProfileComplianceProps {
  data: Partial<ComplianceData>;
  firmSize: string;
}

const COMPLIANCE_ICONS: Record<string, React.ElementType> = {
  hipaa: Shield,
  gdpr: Lock,
  ccpa: Database,
  sox: FileCheck,
  iso27001: AlertTriangle,
  'pci-dss': Key,
};

const COMPLIANCE_LABELS: Record<string, string> = {
  hipaa: 'HIPAA',
  gdpr: 'GDPR',
  ccpa: 'CCPA',
  sox: 'SOX',
  iso27001: 'ISO 27001',
  'pci-dss': 'PCI DSS',
};

const ENCRYPTION_LABELS: Record<string, string> = {
  aes256: 'AES-256 Encryption',
  tls13: 'TLS 1.3',
  fde: 'Full Disk Encryption',
  'key-management': 'Enterprise Key Management',
};

const ProfileCompliance: React.FC<ProfileComplianceProps> = ({ data, firmSize }) => {
  const isRequired = firmSize === 'enterprise';

  return (
    <Card className="hover:shadow-md transition-all duration-200">
      <CardHeader>
        <CardTitle className="flex items-center gap-3 text-xl">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Shield className="w-5 h-5 text-primary" />
          </div>
          Compliance & Security
          {!isRequired && (
            <Badge variant="secondary" className="ml-auto">Optional</Badge>
          )}
        </CardTitle>
        <CardDescription className="text-base">
          Your firm's compliance requirements and security standards
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Compliance Standards */}
        {data.requiredCompliance && data.requiredCompliance.length > 0 && (
          <div className="space-y-4">
            <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
              Compliance Standards
            </h4>
            <div className="flex flex-wrap gap-3">
              {data.requiredCompliance.map((compliance) => {
                const Icon = COMPLIANCE_ICONS[compliance] || Shield;
                return (
                  <Badge 
                    key={compliance} 
                    variant="default" 
                    className="px-3 py-1.5 text-sm font-medium flex items-center gap-2"
                  >
                    <Icon className="w-3 h-3" />
                    {COMPLIANCE_LABELS[compliance] || compliance}
                  </Badge>
                );
              })}
            </div>
          </div>
        )}

        {/* Data Retention & Auditing */}
        <div className="grid md:grid-cols-2 gap-6">
          {data.dataRetentionPeriod && (
            <div className="space-y-2">
              <dt className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                Data Retention Period
              </dt>
              <dd className="text-base font-semibold flex items-center gap-2">
                <Database className="w-4 h-4 text-muted-foreground" />
                <span>{data.dataRetentionPeriod}</span>
              </dd>
            </div>
          )}
          
          {data.auditingFrequency && (
            <div className="space-y-2">
              <dt className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                Audit Frequency
              </dt>
              <dd className="text-base font-semibold flex items-center gap-2">
                <Calendar className="w-4 h-4 text-muted-foreground" />
                <span className="capitalize">{data.auditingFrequency}</span>
              </dd>
            </div>
          )}
        </div>

        {/* Encryption Requirements */}
        {data.encryptionRequirements && data.encryptionRequirements.length > 0 && (
          <div className="space-y-4">
            <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
              Encryption Standards
            </h4>
            <div className="flex flex-wrap gap-2">
              {data.encryptionRequirements.map((encryption) => (
                <Badge 
                  key={encryption} 
                  variant="secondary" 
                  className="px-3 py-1 text-sm"
                >
                  <Lock className="w-3 h-3 mr-1" />
                  {ENCRYPTION_LABELS[encryption] || encryption}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Risk Assessment Status */}
        {data.riskAssessmentCompleted !== undefined && (
          <div className="p-4 bg-muted/30 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <AlertTriangle className="w-5 h-5 text-muted-foreground" />
                <span className="font-medium">Risk Assessment</span>
              </div>
              <Badge variant={data.riskAssessmentCompleted ? "success" : "destructive"}>
                {data.riskAssessmentCompleted ? "Completed" : "Pending"}
              </Badge>
            </div>
          </div>
        )}

        {/* Compliance Officer */}
        {data.complianceOfficerEmail && (
          <div className="space-y-2">
            <dt className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
              Compliance Officer Contact
            </dt>
            <dd className="text-base font-semibold flex items-center gap-2">
              <Mail className="w-4 h-4 text-muted-foreground" />
              <a 
                href={`mailto:${data.complianceOfficerEmail}`}
                className="text-primary hover:underline"
              >
                {data.complianceOfficerEmail}
              </a>
              <span className="text-xs text-muted-foreground">(Compliance)</span>
            </dd>
          </div>
        )}

        {/* Additional Requirements */}
        {data.additionalRequirements && (
          <div className="space-y-2">
            <dt className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
              Additional Requirements
            </dt>
            <dd className="text-sm text-muted-foreground bg-muted/30 p-3 rounded-md">
              {data.additionalRequirements}
            </dd>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ProfileCompliance;