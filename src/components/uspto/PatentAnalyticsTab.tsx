import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown,
  Target,
  DollarSign,
  Users,
  Globe,
  Zap,
  Award,
  AlertTriangle,
  CheckCircle,
  Star,
  LineChart,
  PieChart,
  Activity
} from 'lucide-react';
import { PatentResult } from '@/types/uspto';

interface PatentAnalyticsTabProps {
  patent: PatentResult;
}

interface CitationMetrics {
  totalCitations: number;
  citationsPerYear: { year: number; count: number; }[];
  averageCitationsPerYear: number;
  hIndex: number;
  citationVelocity: number;
  peakCitationYear: number;
  selfCitations: number;
}

interface CompetitiveAnalysis {
  assignee: string;
  patentCount: number;
  marketShare: number;
  averageAge: number;
  technologyFocus: string[];
}

interface TechnologyTrend {
  year: number;
  patentCount: number;
  classification: string;
  growthRate: number;
}

interface BusinessMetrics {
  estimatedValue: number;
  valuationMethod: string;
  marketCoverage: string[];
  commercializationStatus: 'commercialized' | 'licensed' | 'available' | 'defensive';
  licenseOpportunities: string[];
  riskFactors: string[];
}

const PatentAnalyticsTab: React.FC<PatentAnalyticsTabProps> = ({ patent }) => {
  const [activeSubTab, setActiveSubTab] = useState('citations');

  // Mock data - in real implementation, this would come from API
  const citationMetrics: CitationMetrics = {
    totalCitations: 12,
    citationsPerYear: [
      { year: 2024, count: 5 },
      { year: 2023, count: 4 },
      { year: 2022, count: 3 },
      { year: 2021, count: 0 },
      { year: 2020, count: 0 }
    ],
    averageCitationsPerYear: 2.4,
    hIndex: 3,
    citationVelocity: 4.5,
    peakCitationYear: 2024,
    selfCitations: 2
  };

  const competitiveAnalysis: CompetitiveAnalysis[] = [
    {
      assignee: 'Legal Tech Solutions Inc.',
      patentCount: 847,
      marketShare: 23.4,
      averageAge: 4.2,
      technologyFocus: ['AI/ML', 'Legal Analysis', 'Document Processing']
    },
    {
      assignee: 'ContractBot LLC',
      patentCount: 623,
      marketShare: 17.2,
      averageAge: 3.8,
      technologyFocus: ['Contract Analysis', 'Risk Assessment', 'NLP']
    },
    {
      assignee: 'RiskAnalyzer Corp.',
      patentCount: 534,
      marketShare: 14.8,
      averageAge: 5.1,
      technologyFocus: ['Risk Management', 'Compliance', 'Legal AI']
    },
    {
      assignee: 'Current Assignee',
      patentCount: 289,
      marketShare: 8.0,
      averageAge: 2.9,
      technologyFocus: ['Legal Document Analysis', 'Machine Learning', 'Text Mining']
    },
    {
      assignee: 'European Legal AI Ltd.',
      patentCount: 412,
      marketShare: 11.4,
      averageAge: 4.6,
      technologyFocus: ['Legal Intelligence', 'Document Review', 'Automation']
    }
  ];

  const technologyTrends: TechnologyTrend[] = [
    { year: 2020, patentCount: 1250, classification: 'G06F16/35', growthRate: 15.2 },
    { year: 2021, patentCount: 1440, classification: 'G06F16/35', growthRate: 15.2 },
    { year: 2022, patentCount: 1680, classification: 'G06F16/35', growthRate: 16.7 },
    { year: 2023, patentCount: 1960, classification: 'G06F16/35', growthRate: 16.7 },
    { year: 2024, patentCount: 2280, classification: 'G06F16/35', growthRate: 16.3 }
  ];

  const businessMetrics: BusinessMetrics = {
    estimatedValue: 2400000,
    valuationMethod: 'DCF + Market Comparables',
    marketCoverage: ['United States', 'European Union', 'Japan', 'Canada', 'China'],
    commercializationStatus: 'available',
    licenseOpportunities: [
      'Enterprise Legal Software',
      'Document Management Systems',
      'AI-Powered Legal Tools',
      'Compliance Platforms'
    ],
    riskFactors: [
      'Prior art challenges in G06N class',
      'Competing patents from major players',
      'Technology evolution risk',
      'Market adoption uncertainty'
    ]
  };

  const getCommercializationColor = (status: string) => {
    switch (status) {
      case 'commercialized': return 'bg-green-100 text-green-800 border-green-200';
      case 'licensed': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'available': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'defensive': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const calculateGrowthRate = (current: number, previous: number) => {
    return ((current - previous) / previous * 100).toFixed(1);
  };

  const getTrendIcon = (rate: number) => {
    if (rate > 0) return <TrendingUp className="h-4 w-4 text-green-600" />;
    if (rate < 0) return <TrendingDown className="h-4 w-4 text-red-600" />;
    return <Activity className="h-4 w-4 text-gray-600" />;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold">Analytics & Insights</h2>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <BarChart3 className="h-4 w-4 mr-2" />
            Generate Report
          </Button>
        </div>
      </div>

      <Tabs value={activeSubTab} onValueChange={setActiveSubTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="citations" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Citation Analytics
          </TabsTrigger>
          <TabsTrigger value="competitive" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Competitive Landscape
          </TabsTrigger>
          <TabsTrigger value="technology" className="flex items-center gap-2">
            <Zap className="h-4 w-4" />
            Technology Evolution
          </TabsTrigger>
          <TabsTrigger value="business" className="flex items-center gap-2">
            <DollarSign className="h-4 w-4" />
            Business Impact
          </TabsTrigger>
        </TabsList>

        <TabsContent value="citations" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <BarChart3 className="h-8 w-8 text-blue-600" />
                  <div>
                    <p className="text-2xl font-bold">{citationMetrics.totalCitations}</p>
                    <p className="text-sm text-muted-foreground">Total Citations</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <TrendingUp className="h-8 w-8 text-green-600" />
                  <div>
                    <p className="text-2xl font-bold">{citationMetrics.citationVelocity}</p>
                    <p className="text-sm text-muted-foreground">Citations/Year</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Award className="h-8 w-8 text-purple-600" />
                  <div>
                    <p className="text-2xl font-bold">{citationMetrics.hIndex}</p>
                    <p className="text-sm text-muted-foreground">H-Index</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Star className="h-8 w-8 text-yellow-600" />
                  <div>
                    <p className="text-2xl font-bold">{citationMetrics.peakCitationYear}</p>
                    <p className="text-sm text-muted-foreground">Peak Year</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <LineChart className="h-5 w-5" />
                  Citation Trends Over Time
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="aspect-video bg-gray-50 rounded-lg border flex items-center justify-center mb-4">
                  <div className="text-center">
                    <LineChart className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-500">Citation Timeline Chart</p>
                  </div>
                </div>
                
                <div className="space-y-2">
                  {citationMetrics.citationsPerYear.map((yearData, index) => (
                    <div key={yearData.year} className="flex items-center justify-between">
                      <span className="text-sm font-medium">{yearData.year}</span>
                      <div className="flex items-center gap-2 flex-1 mx-4">
                        <Progress value={(yearData.count / 5) * 100} className="flex-1" />
                        <span className="text-sm text-muted-foreground w-8">{yearData.count}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChart className="h-5 w-5" />
                  Citation Analysis
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-blue-50 rounded">
                    <span className="text-sm font-medium">Forward Citations</span>
                    <span className="text-lg font-bold text-blue-600">{citationMetrics.totalCitations}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-green-50 rounded">
                    <span className="text-sm font-medium">Self Citations</span>
                    <span className="text-lg font-bold text-green-600">{citationMetrics.selfCitations}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-purple-50 rounded">
                    <span className="text-sm font-medium">External Citations</span>
                    <span className="text-lg font-bold text-purple-600">{citationMetrics.totalCitations - citationMetrics.selfCitations}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-orange-50 rounded">
                    <span className="text-sm font-medium">Average per Year</span>
                    <span className="text-lg font-bold text-orange-600">{citationMetrics.averageCitationsPerYear}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="competitive" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Users className="h-8 w-8 text-blue-600" />
                  <div>
                    <p className="text-2xl font-bold">5</p>
                    <p className="text-sm text-muted-foreground">Major Competitors</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Target className="h-8 w-8 text-green-600" />
                  <div>
                    <p className="text-2xl font-bold">8.0%</p>
                    <p className="text-sm text-muted-foreground">Market Share</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <TrendingUp className="h-8 w-8 text-purple-600" />
                  <div>
                    <p className="text-2xl font-bold">#4</p>
                    <p className="text-sm text-muted-foreground">Market Position</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Competitive Landscape Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {competitiveAnalysis.map((competitor, index) => (
                  <div key={index} className={`p-4 border rounded-lg ${competitor.assignee === 'Current Assignee' ? 'border-blue-500 bg-blue-50' : 'border-gray-200'}`}>
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <h4 className="font-semibold">{competitor.assignee}</h4>
                        {competitor.assignee === 'Current Assignee' && (
                          <Badge className="bg-blue-100 text-blue-800 border-blue-200">YOU</Badge>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold">{competitor.marketShare}%</p>
                        <p className="text-sm text-muted-foreground">Market Share</p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Patent Portfolio</p>
                        <p className="font-medium">{competitor.patentCount.toLocaleString()} patents</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Average Age</p>
                        <p className="font-medium">{competitor.averageAge} years</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Technology Focus</p>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {competitor.technologyFocus.map((tech, techIndex) => (
                            <Badge key={techIndex} variant="outline" className="text-xs">
                              {tech}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-3">
                      <Progress value={competitor.marketShare} className="h-2" />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="technology" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Zap className="h-8 w-8 text-yellow-600" />
                  <div>
                    <p className="text-2xl font-bold">16.3%</p>
                    <p className="text-sm text-muted-foreground">Annual Growth</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <TrendingUp className="h-8 w-8 text-green-600" />
                  <div>
                    <p className="text-2xl font-bold">2,280</p>
                    <p className="text-sm text-muted-foreground">Patents (2024)</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Activity className="h-8 w-8 text-blue-600" />
                  <div>
                    <p className="text-2xl font-bold">High</p>
                    <p className="text-sm text-muted-foreground">Innovation Activity</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <LineChart className="h-5 w-5" />
                Technology Evolution Trends
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="aspect-video bg-gray-50 rounded-lg border flex items-center justify-center mb-6">
                <div className="text-center">
                  <LineChart className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-500">Technology Growth Chart</p>
                  <p className="text-xs text-gray-400">G06F16/35 Classification Trend</p>
                </div>
              </div>

              <div className="space-y-3">
                {technologyTrends.map((trend, index) => {
                  const previousYear = index > 0 ? technologyTrends[index - 1] : null;
                  const growthRate = previousYear ? 
                    calculateGrowthRate(trend.patentCount, previousYear.patentCount) : '0';
                  
                  return (
                    <div key={trend.year} className="flex items-center justify-between p-3 border rounded">
                      <div className="flex items-center gap-3">
                        <span className="font-semibold">{trend.year}</span>
                        {getTrendIcon(parseFloat(growthRate))}
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="font-medium">{trend.patentCount.toLocaleString()} patents</span>
                        <Badge className={parseFloat(growthRate) > 0 ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                          +{growthRate}%
                        </Badge>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Technology Maturity Assessment</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold mb-3">Innovation Lifecycle</h4>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-4 h-4 bg-red-500 rounded-full"></div>
                      <span className="text-sm">Emerging (0-2 years)</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-4 h-4 bg-yellow-500 rounded-full"></div>
                      <span className="text-sm font-semibold">Growth (2-5 years) ← Current</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-4 h-4 bg-green-500 rounded-full"></div>
                      <span className="text-sm">Mature (5-10 years)</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-4 h-4 bg-gray-500 rounded-full"></div>
                      <span className="text-sm">Declining (10+ years)</span>
                    </div>
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold mb-3">Key Indicators</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span>High patent filing activity</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span>Strong commercial interest</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4 text-yellow-600" />
                      <span>Increasing competition</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span>Technology standardization</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="business" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <DollarSign className="h-8 w-8 text-green-600" />
                  <div>
                    <p className="text-2xl font-bold">${(businessMetrics.estimatedValue / 1000000).toFixed(1)}M</p>
                    <p className="text-sm text-muted-foreground">Estimated Value</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Globe className="h-8 w-8 text-blue-600" />
                  <div>
                    <p className="text-2xl font-bold">{businessMetrics.marketCoverage.length}</p>
                    <p className="text-sm text-muted-foreground">Markets Covered</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Target className="h-8 w-8 text-purple-600" />
                  <div>
                    <p className="text-2xl font-bold">{businessMetrics.licenseOpportunities.length}</p>
                    <p className="text-sm text-muted-foreground">License Opportunities</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <AlertTriangle className="h-8 w-8 text-orange-600" />
                  <div>
                    <p className="text-2xl font-bold">{businessMetrics.riskFactors.length}</p>
                    <p className="text-sm text-muted-foreground">Risk Factors</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  Valuation Analysis
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 bg-green-50 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-semibold">Estimated Value</span>
                      <span className="text-2xl font-bold text-green-600">
                        ${businessMetrics.estimatedValue.toLocaleString()}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Method: {businessMetrics.valuationMethod}
                    </p>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold mb-2">Commercialization Status</h4>
                    <Badge className={getCommercializationColor(businessMetrics.commercializationStatus)}>
                      {businessMetrics.commercializationStatus.toUpperCase()}
                    </Badge>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-2">Market Coverage</h4>
                    <div className="flex flex-wrap gap-1">
                      {businessMetrics.marketCoverage.map((market, index) => (
                        <Badge key={index} variant="outline">
                          {market}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Business Opportunities
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold mb-2 flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      License Opportunities
                    </h4>
                    <div className="space-y-2">
                      {businessMetrics.licenseOpportunities.map((opportunity, index) => (
                        <div key={index} className="p-2 bg-green-50 rounded text-sm">
                          {opportunity}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-2 flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4 text-orange-600" />
                      Risk Factors
                    </h4>
                    <div className="space-y-2">
                      {businessMetrics.riskFactors.map((risk, index) => (
                        <div key={index} className="p-2 bg-orange-50 rounded text-sm">
                          {risk}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Portfolio Optimization Recommendations</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 border rounded-lg bg-blue-50">
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-blue-600" />
                    Strengthen
                  </h4>
                  <ul className="text-sm space-y-1">
                    <li>• File continuation applications</li>
                    <li>• Expand to emerging markets</li>
                    <li>• Develop licensing strategy</li>
                  </ul>
                </div>
                <div className="p-4 border rounded-lg bg-yellow-50">
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-yellow-600" />
                    Monitor
                  </h4>
                  <ul className="text-sm space-y-1">
                    <li>• Competitive patent filings</li>
                    <li>• Technology evolution trends</li>
                    <li>• Market adoption rates</li>
                  </ul>
                </div>
                <div className="p-4 border rounded-lg bg-green-50">
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    Opportunities
                  </h4>
                  <ul className="text-sm space-y-1">
                    <li>• Cross-licensing partnerships</li>
                    <li>• Technology transfer deals</li>
                    <li>• Joint venture possibilities</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PatentAnalyticsTab;