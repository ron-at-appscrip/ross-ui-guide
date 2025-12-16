import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Calendar,
  Building2,
  User,
  Hash,
  Clock,
  TrendingUp,
  FileText,
  Scale,
  Globe
} from 'lucide-react';
import { PatentResult } from '@/types/uspto';

interface PatentOverviewTabProps {
  patent: PatentResult;
  detailData?: {
    legalEvents?: Array<{
      date: string;
      event: string;
      description: string;
    }>;
  };
}

const PatentOverviewTab: React.FC<PatentOverviewTabProps> = ({ patent, detailData }) => {
  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch {
      return 'N/A';
    }
  };

  const getStatusInfo = (status: string) => {
    switch (status.toLowerCase()) {
      case 'granted':
        return { color: 'bg-green-100 text-green-800 border-green-200', description: 'Patent has been granted and is in force' };
      case 'published':
        return { color: 'bg-blue-100 text-blue-800 border-blue-200', description: 'Application published, examination pending' };
      case 'pending':
        return { color: 'bg-yellow-100 text-yellow-800 border-yellow-200', description: 'Application under examination' };
      case 'abandoned':
        return { color: 'bg-red-100 text-red-800 border-red-200', description: 'Application abandoned or withdrawn' };
      case 'expired':
        return { color: 'bg-gray-100 text-gray-800 border-gray-200', description: 'Patent term has expired' };
      default:
        return { color: 'bg-gray-100 text-gray-800 border-gray-200', description: 'Status unknown' };
    }
  };

  const statusInfo = getStatusInfo(patent.status);

  return (
    <div className="space-y-6">
      {/* Header Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Patent Summary
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Status and Key Dates */}
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Current Status</label>
                <div className="flex items-center gap-2 mt-1">
                  <Badge className={statusInfo.color}>
                    {patent.status.toUpperCase()}
                  </Badge>
                  <span className="text-sm text-muted-foreground">{statusInfo.description}</span>
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium text-muted-foreground">Patent Number</label>
                <div className="flex items-center gap-2 mt-1">
                  <Hash className="h-4 w-4 text-muted-foreground" />
                  <span className="font-mono font-medium">{patent.patentNumber}</span>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-muted-foreground">Application Number</label>
                <div className="flex items-center gap-2 mt-1">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  <span className="font-mono">{patent.applicationNumber}</span>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Filing Date</label>
                <div className="flex items-center gap-2 mt-1">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span>{formatDate(patent.filingDate)}</span>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-muted-foreground">Grant Date</label>
                <div className="flex items-center gap-2 mt-1">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span>{formatDate(patent.grantDate)}</span>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-muted-foreground">Expiration Date</label>
                <div className="flex items-center gap-2 mt-1">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span>{formatDate(patent.expirationDate)}</span>
                </div>
              </div>
            </div>
          </div>

          <Separator />

          {/* Abstract */}
          <div>
            <label className="text-sm font-medium text-muted-foreground">Abstract</label>
            <div className="mt-2 p-4 bg-muted/50 rounded-lg">
              <p className="text-sm leading-relaxed">{patent.abstract}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Inventors and Assignee */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Inventor{patent.inventors.length > 1 ? 's' : ''}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {patent.inventors.length > 0 ? (
                patent.inventors.map((inventor, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full" />
                    <span className="text-sm">{inventor}</span>
                  </div>
                ))
              ) : (
                <span className="text-sm text-muted-foreground">No inventors listed</span>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Current Assignee
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full" />
              <span className="font-medium">{patent.assignee}</span>
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              The organization or individual that currently owns the rights to this patent.
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Stats */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Patent Statistics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{patent.citedBy}</div>
              <div className="text-sm text-muted-foreground">Times Cited</div>
            </div>
            
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">{patent.cites}</div>
              <div className="text-sm text-muted-foreground">References</div>
            </div>
            
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">{patent.claims}</div>
              <div className="text-sm text-muted-foreground">Claims</div>
            </div>
            
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <div className="text-2xl font-bold text-orange-600">{patent.familySize}</div>
              <div className="text-sm text-muted-foreground">Family Size</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Classification */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Scale className="h-5 w-5" />
            Patent Classification
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Classification Codes</label>
              <div className="flex flex-wrap gap-2 mt-2">
                {patent.classification.length > 0 ? (
                  patent.classification.map((code, index) => (
                    <Badge key={index} variant="outline" className="font-mono text-xs">
                      {code}
                    </Badge>
                  ))
                ) : (
                  <span className="text-sm text-muted-foreground">No classification codes available</span>
                )}
              </div>
            </div>
            
            <p className="text-sm text-muted-foreground">
              Classification codes help categorize patents by technology area and make them easier to search and analyze.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Recent Legal Events */}
      {detailData?.legalEvents && detailData.legalEvents.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5" />
              Recent Legal Events
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {detailData.legalEvents.slice(0, 3).map((event, index) => (
                <div key={index} className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-sm">{event.event}</span>
                      <span className="text-xs text-muted-foreground">{formatDate(event.date)}</span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">{event.description}</p>
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

export default PatentOverviewTab;