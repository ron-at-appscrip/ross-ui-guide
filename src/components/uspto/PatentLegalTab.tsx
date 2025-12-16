import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { 
  Calendar, 
  Clock, 
  AlertTriangle, 
  CheckCircle, 
  XCircle,
  DollarSign,
  MapPin,
  Users,
  FileText,
  Download,
  ExternalLink,
  Globe
} from 'lucide-react';
import { PatentResult } from '@/types/uspto';

interface PatentLegalTabProps {
  patent: PatentResult;
}

interface LegalEvent {
  date: string;
  eventType: 'filing' | 'publication' | 'examination' | 'grant' | 'maintenance' | 'opposition';
  title: string;
  description: string;
  documentId?: string;
  status: 'completed' | 'pending' | 'overdue';
  severity: 'info' | 'warning' | 'critical';
}

interface FamilyMember {
  patentNumber: string;
  country: string;
  countryCode: string;
  status: 'granted' | 'published' | 'pending' | 'abandoned' | 'expired';
  filingDate: string;
  grantDate?: string;
  priority: boolean;
  relationship: 'parent' | 'child' | 'sibling' | 'continuation' | 'divisional';
}

interface MaintenanceFee {
  dueDate: string;
  amount: number;
  currency: string;
  status: 'paid' | 'due' | 'overdue' | 'waived';
  paymentWindow: { start: string; end: string; };
  penalties?: { amount: number; description: string; }[];
}

const PatentLegalTab: React.FC<PatentLegalTabProps> = ({ patent }) => {
  const [activeSubTab, setActiveSubTab] = useState('timeline');

  // Mock data - in real implementation, this would come from API
  const legalEvents: LegalEvent[] = [
    {
      date: '2024-03-15',
      eventType: 'grant',
      title: 'Patent Granted',
      description: 'Patent officially granted by USPTO',
      status: 'completed',
      severity: 'info'
    },
    {
      date: '2023-11-20',
      eventType: 'examination',
      title: 'Notice of Allowance',
      description: 'USPTO issued Notice of Allowance',
      documentId: 'NOA-2023-11-20',
      status: 'completed',
      severity: 'info'
    },
    {
      date: '2023-08-10',
      eventType: 'examination',
      title: 'Response Filed',
      description: 'Response to Office Action filed',
      documentId: 'RESP-2023-08-10',
      status: 'completed',
      severity: 'info'
    },
    {
      date: '2023-05-15',
      eventType: 'examination',
      title: 'Office Action - Non-Final',
      description: 'Non-final rejection issued by USPTO',
      documentId: 'OA-2023-05-15',
      status: 'completed',
      severity: 'warning'
    },
    {
      date: '2022-02-10',
      eventType: 'publication',
      title: 'Application Published',
      description: 'Patent application published (18 months after filing)',
      status: 'completed',
      severity: 'info'
    },
    {
      date: '2020-08-10',
      eventType: 'filing',
      title: 'Application Filed',
      description: 'Patent application filed with USPTO',
      status: 'completed',
      severity: 'info'
    },
    {
      date: '2027-03-15',
      eventType: 'maintenance',
      title: 'First Maintenance Fee Due',
      description: '3.5 year maintenance fee payment due',
      status: 'pending',
      severity: 'warning'
    }
  ];

  const familyMembers: FamilyMember[] = [
    {
      patentNumber: patent.patentNumber,
      country: 'United States',
      countryCode: 'US',
      status: 'granted',
      filingDate: '2020-08-10',
      grantDate: '2024-03-15',
      priority: true,
      relationship: 'parent'
    },
    {
      patentNumber: 'EP3456789',
      country: 'European Union',
      countryCode: 'EP',
      status: 'granted',
      filingDate: '2021-08-09',
      grantDate: '2024-01-20',
      priority: false,
      relationship: 'child'
    },
    {
      patentNumber: 'JP2021-123456',
      country: 'Japan',
      countryCode: 'JP',
      status: 'pending',
      filingDate: '2021-08-09',
      priority: false,
      relationship: 'child'
    },
    {
      patentNumber: 'CN202110789012',
      country: 'China',
      countryCode: 'CN',
      status: 'published',
      filingDate: '2021-08-09',
      priority: false,
      relationship: 'child'
    },
    {
      patentNumber: 'CA3,123,456',
      country: 'Canada',
      countryCode: 'CA',
      status: 'granted',
      filingDate: '2021-08-09',
      grantDate: '2023-11-15',
      priority: false,
      relationship: 'child'
    }
  ];

  const maintenanceFees: MaintenanceFee[] = [
    {
      dueDate: '2027-03-15',
      amount: 1600,
      currency: 'USD',
      status: 'due',
      paymentWindow: { start: '2026-09-15', end: '2027-09-15' }
    },
    {
      dueDate: '2031-03-15',
      amount: 3600,
      currency: 'USD',
      status: 'due',
      paymentWindow: { start: '2030-09-15', end: '2031-09-15' }
    },
    {
      dueDate: '2035-03-15',
      amount: 7300,
      currency: 'USD',
      status: 'due',
      paymentWindow: { start: '2034-09-15', end: '2035-09-15' }
    }
  ];

  const getEventIcon = (eventType: string, status: string) => {
    if (status === 'completed') return <CheckCircle className="h-4 w-4 text-green-600" />;
    if (status === 'overdue') return <XCircle className="h-4 w-4 text-red-600" />;
    if (status === 'pending') return <Clock className="h-4 w-4 text-yellow-600" />;
    return <Calendar className="h-4 w-4 text-blue-600" />;
  };

  const getEventTypeColor = (eventType: string) => {
    switch (eventType) {
      case 'filing': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'publication': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'examination': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'grant': return 'bg-green-100 text-green-800 border-green-200';
      case 'maintenance': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'opposition': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'granted': return 'bg-green-100 text-green-800 border-green-200';
      case 'published': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'abandoned': return 'bg-red-100 text-red-800 border-red-200';
      case 'expired': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getFeeStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'bg-green-100 text-green-800 border-green-200';
      case 'due': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'overdue': return 'bg-red-100 text-red-800 border-red-200';
      case 'waived': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const calculateDaysUntilDue = (dueDate: string) => {
    const due = new Date(dueDate);
    const now = new Date();
    const diffTime = due.getTime() - now.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const grantedCount = familyMembers.filter(m => m.status === 'granted').length;
  const pendingCount = familyMembers.filter(m => m.status === 'pending').length;
  const totalCoverage = familyMembers.length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold">Legal Information</h2>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export Legal Summary
          </Button>
        </div>
      </div>

      <Tabs value={activeSubTab} onValueChange={setActiveSubTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="timeline" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Timeline
          </TabsTrigger>
          <TabsTrigger value="family" className="flex items-center gap-2">
            <Globe className="h-4 w-4" />
            Patent Family ({totalCoverage})
          </TabsTrigger>
          <TabsTrigger value="fees" className="flex items-center gap-2">
            <DollarSign className="h-4 w-4" />
            Maintenance Fees
          </TabsTrigger>
          <TabsTrigger value="coverage" className="flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            Geographic Coverage
          </TabsTrigger>
        </TabsList>

        <TabsContent value="timeline" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-8 w-8 text-green-600" />
                  <div>
                    <p className="text-2xl font-bold">6</p>
                    <p className="text-sm text-muted-foreground">Completed Events</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Clock className="h-8 w-8 text-yellow-600" />
                  <div>
                    <p className="text-2xl font-bold">1</p>
                    <p className="text-sm text-muted-foreground">Pending Events</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <AlertTriangle className="h-8 w-8 text-orange-600" />
                  <div>
                    <p className="text-2xl font-bold">1,096</p>
                    <p className="text-sm text-muted-foreground">Days Until Next Fee</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-4">
            {legalEvents.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map((event, index) => (
              <Card key={index} className="border-l-4 border-l-blue-500">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      {getEventIcon(event.eventType, event.status)}
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-semibold">{event.title}</h4>
                          <Badge className={getEventTypeColor(event.eventType)}>
                            {event.eventType.toUpperCase()}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {event.status.toUpperCase()}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">{event.description}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(event.date).toLocaleDateString('en-US', { 
                            year: 'numeric', 
                            month: 'long', 
                            day: 'numeric' 
                          })}
                        </p>
                      </div>
                    </div>
                    {event.documentId && (
                      <Button variant="outline" size="sm" className="ml-4">
                        <FileText className="h-4 w-4 mr-2" />
                        View Document
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="family" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Globe className="h-8 w-8 text-blue-600" />
                  <div>
                    <p className="text-2xl font-bold">{totalCoverage}</p>
                    <p className="text-sm text-muted-foreground">Total Applications</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-8 w-8 text-green-600" />
                  <div>
                    <p className="text-2xl font-bold">{grantedCount}</p>
                    <p className="text-sm text-muted-foreground">Granted</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Clock className="h-8 w-8 text-yellow-600" />
                  <div>
                    <p className="text-2xl font-bold">{pendingCount}</p>
                    <p className="text-sm text-muted-foreground">Pending</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Users className="h-8 w-8 text-purple-600" />
                  <div>
                    <p className="text-2xl font-bold">{Math.round((grantedCount / totalCoverage) * 100)}%</p>
                    <p className="text-sm text-muted-foreground">Success Rate</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-4">
            {familyMembers.map((member, index) => (
              <Card key={index} className={member.priority ? 'border-l-4 border-l-purple-500' : ''}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-8 rounded border flex items-center justify-center text-xs font-semibold bg-gray-100">
                        {member.countryCode}
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-semibold">{member.patentNumber}</h4>
                          {member.priority && (
                            <Badge variant="outline" className="bg-purple-100 text-purple-800 border-purple-200">
                              PRIORITY
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">{member.country}</p>
                        <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                          <span>Filed: {new Date(member.filingDate).toLocaleDateString()}</span>
                          {member.grantDate && (
                            <span>Granted: {new Date(member.grantDate).toLocaleDateString()}</span>
                          )}
                          <span className="capitalize">{member.relationship}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={getStatusColor(member.status)}>
                        {member.status.toUpperCase()}
                      </Badge>
                      <Button variant="outline" size="sm">
                        <ExternalLink className="h-4 w-4 mr-2" />
                        View
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="fees" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <DollarSign className="h-8 w-8 text-green-600" />
                  <div>
                    <p className="text-2xl font-bold">$12,500</p>
                    <p className="text-sm text-muted-foreground">Total Future Fees</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <AlertTriangle className="h-8 w-8 text-yellow-600" />
                  <div>
                    <p className="text-2xl font-bold">$1,600</p>
                    <p className="text-sm text-muted-foreground">Next Fee Due</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-4">
            {maintenanceFees.map((fee, index) => {
              const daysUntilDue = calculateDaysUntilDue(fee.dueDate);
              const isOverdue = daysUntilDue < 0;
              const isDueSoon = daysUntilDue > 0 && daysUntilDue <= 90;
              
              return (
                <Card key={index} className={isOverdue ? 'border-l-4 border-l-red-500' : isDueSoon ? 'border-l-4 border-l-yellow-500' : ''}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="font-semibold">
                            {index === 0 ? '3.5 Year' : index === 1 ? '7.5 Year' : '11.5 Year'} Maintenance Fee
                          </h4>
                          <Badge className={getFeeStatusColor(fee.status)}>
                            {fee.status.toUpperCase()}
                          </Badge>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                          <div>
                            <p className="text-muted-foreground">Due Date</p>
                            <p className="font-medium">{new Date(fee.dueDate).toLocaleDateString()}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Amount</p>
                            <p className="font-medium">${fee.amount.toLocaleString()} USD</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Payment Window</p>
                            <p className="font-medium">
                              {new Date(fee.paymentWindow.start).toLocaleDateString()} - {new Date(fee.paymentWindow.end).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <div className="mt-3">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-sm text-muted-foreground">Time remaining:</span>
                            <span className={`text-sm font-medium ${isOverdue ? 'text-red-600' : isDueSoon ? 'text-yellow-600' : 'text-green-600'}`}>
                              {isOverdue ? `${Math.abs(daysUntilDue)} days overdue` : `${daysUntilDue} days`}
                            </span>
                          </div>
                          <Progress 
                            value={isOverdue ? 100 : Math.max(0, 100 - (daysUntilDue / 1095) * 100)} 
                            className="h-2"
                          />
                        </div>
                      </div>
                      <div className="flex flex-col gap-2 ml-4">
                        <Button variant="outline" size="sm">
                          <Calendar className="h-4 w-4 mr-2" />
                          Set Reminder
                        </Button>
                        <Button variant="outline" size="sm">
                          <DollarSign className="h-4 w-4 mr-2" />
                          Pay Online
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="coverage" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Geographic Coverage Analysis
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold mb-3">Current Coverage</h4>
                  <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center">
                    <div className="text-center">
                      <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-500">Interactive World Map</p>
                      <p className="text-xs text-gray-400">(Coverage visualization would be here)</p>
                    </div>
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold mb-3">Coverage Statistics</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                      <span className="text-sm">Major Markets Covered</span>
                      <span className="font-semibold">4/5</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                      <span className="text-sm">Total Countries</span>
                      <span className="font-semibold">5</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                      <span className="text-sm">Market Share Potential</span>
                      <span className="font-semibold">~78%</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                      <span className="text-sm">Estimated Population Coverage</span>
                      <span className="font-semibold">2.1B people</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="mt-6">
                <h4 className="font-semibold mb-3">Recommended Expansion</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {['India', 'Brazil', 'South Korea'].map((country, index) => (
                    <Card key={index} className="border-dashed">
                      <CardContent className="p-3 text-center">
                        <p className="font-medium">{country}</p>
                        <p className="text-xs text-muted-foreground">High potential market</p>
                        <Button variant="outline" size="sm" className="mt-2">
                          File Application
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PatentLegalTab;