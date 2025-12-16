import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { 
  Network, 
  Search, 
  ExternalLink, 
  TrendingUp, 
  TrendingDown,
  BookOpen,
  FileText,
  Users,
  Star,
  ArrowRight,
  ArrowLeft,
  Filter,
  Download
} from 'lucide-react';
import { PatentResult } from '@/types/uspto';

interface PatentCitationsTabProps {
  patent: PatentResult;
}

interface CitationNode {
  patentId: string;
  patentNumber: string;
  title: string;
  year: number;
  assignee: string;
  citationCount: number;
  nodeType: 'current' | 'cited' | 'citing' | 'family';
  relevanceScore: number;
  abstract?: string;
}

interface CitationReference {
  patentNumber: string;
  title: string;
  assignee: string;
  filingDate: string;
  citationType: 'examiner' | 'applicant' | 'thirdParty';
  relevanceScore: number;
  contextSnippet?: string;
}

interface NonPatentLiterature {
  title: string;
  authors: string[];
  publication: string;
  publicationDate: string;
  doi?: string;
  url?: string;
  citationType: 'examiner' | 'applicant';
}

const PatentCitationsTab: React.FC<PatentCitationsTabProps> = ({ patent }) => {
  const [activeSubTab, setActiveSubTab] = useState('network');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');

  // Mock data - in real implementation, this would come from API
  const forwardCitations: CitationReference[] = [
    {
      patentNumber: 'US11,234,567',
      title: 'Enhanced Natural Language Processing for Legal Text Analysis',
      assignee: 'Legal Tech Solutions Inc.',
      filingDate: '2024-01-15',
      citationType: 'examiner',
      relevanceScore: 0.92,
      contextSnippet: 'Building upon the legal document analysis method described in patent US10,123,456...'
    },
    {
      patentNumber: 'US11,345,678',
      title: 'AI-Powered Contract Review System',
      assignee: 'ContractBot LLC',
      filingDate: '2024-03-20',
      citationType: 'applicant',
      relevanceScore: 0.87,
      contextSnippet: 'The document processing techniques disclosed in US10,123,456 provide a foundation for...'
    },
    {
      patentNumber: 'US11,456,789',
      title: 'Automated Legal Risk Assessment Platform',
      assignee: 'RiskAnalyzer Corp.',
      filingDate: '2024-05-10',
      citationType: 'examiner',
      relevanceScore: 0.81,
      contextSnippet: 'Similar to the method described in US10,123,456, our system analyzes legal documents...'
    },
    {
      patentNumber: 'EP4123456',
      title: 'Machine Learning for Legal Document Classification',
      assignee: 'European Legal AI Ltd.',
      filingDate: '2024-02-28',
      citationType: 'applicant',
      relevanceScore: 0.75
    },
    {
      patentNumber: 'CN114567890',
      title: 'Intelligent Legal Document Processing System',
      assignee: 'Beijing Legal Tech Co.',
      filingDate: '2024-04-05',
      citationType: 'thirdParty',
      relevanceScore: 0.69
    }
  ];

  const backwardCitations: CitationReference[] = [
    {
      patentNumber: 'US9,876,543',
      title: 'Document Analysis Using Natural Language Processing',
      assignee: 'TextAnalytics Inc.',
      filingDate: '2018-03-15',
      citationType: 'examiner',
      relevanceScore: 0.89,
      contextSnippet: 'Prior art document analyzing text using NLP techniques for legal applications'
    },
    {
      patentNumber: 'US9,765,432',
      title: 'Machine Learning Classification of Legal Documents',
      assignee: 'Legal ML Corp.',
      filingDate: '2017-11-20',
      citationType: 'applicant',
      relevanceScore: 0.84,
      contextSnippet: 'Early work on applying machine learning to legal document classification'
    },
    {
      patentNumber: 'US9,654,321',
      title: 'Text Mining for Risk Assessment in Legal Contracts',
      assignee: 'Contract Analytics LLC',
      filingDate: '2016-08-10',
      citationType: 'examiner',
      relevanceScore: 0.77,
      contextSnippet: 'Foundational patent on text mining for legal risk assessment'
    },
    {
      patentNumber: 'US9,543,210',
      title: 'Automated Legal Document Processing System',
      assignee: 'LegalTech Innovations',
      filingDate: '2015-12-05',
      citationType: 'applicant',
      relevanceScore: 0.71
    }
  ];

  const nonPatentLiterature: NonPatentLiterature[] = [
    {
      title: 'Natural Language Processing in Legal Text Analysis: A Comprehensive Survey',
      authors: ['Smith, J.', 'Johnson, K.', 'Williams, M.'],
      publication: 'Journal of Legal Technology',
      publicationDate: '2019-06-15',
      doi: '10.1234/jlt.2019.0123',
      citationType: 'applicant'
    },
    {
      title: 'Machine Learning Applications in Legal Document Review',
      authors: ['Brown, A.', 'Davis, R.'],
      publication: 'AI & Law Review',
      publicationDate: '2018-11-30',
      doi: '10.5678/ailr.2018.0456',
      citationType: 'examiner'
    },
    {
      title: 'Risk Assessment in Legal Contracts Using Deep Learning',
      authors: ['Lee, S.', 'Taylor, P.', 'Anderson, C.'],
      publication: 'International Conference on AI and Law',
      publicationDate: '2020-03-22',
      citationType: 'applicant'
    }
  ];

  const citationNodes: CitationNode[] = [
    {
      patentId: patent.id,
      patentNumber: patent.patentNumber,
      title: patent.title,
      year: 2024,
      assignee: patent.assignee || 'Current Assignee',
      citationCount: forwardCitations.length,
      nodeType: 'current',
      relevanceScore: 1.0
    },
    ...forwardCitations.slice(0, 3).map((citation, index) => ({
      patentId: `citing_${index}`,
      patentNumber: citation.patentNumber,
      title: citation.title,
      year: new Date(citation.filingDate).getFullYear(),
      assignee: citation.assignee,
      citationCount: Math.floor(Math.random() * 10) + 1,
      nodeType: 'citing' as const,
      relevanceScore: citation.relevanceScore
    })),
    ...backwardCitations.slice(0, 3).map((citation, index) => ({
      patentId: `cited_${index}`,
      patentNumber: citation.patentNumber,
      title: citation.title,
      year: new Date(citation.filingDate).getFullYear(),
      assignee: citation.assignee,
      citationCount: Math.floor(Math.random() * 15) + 5,
      nodeType: 'cited' as const,
      relevanceScore: citation.relevanceScore
    }))
  ];

  const getCitationTypeColor = (type: string) => {
    switch (type) {
      case 'examiner': return 'bg-red-100 text-red-800 border-red-200';
      case 'applicant': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'thirdParty': return 'bg-purple-100 text-purple-800 border-purple-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getNodeTypeColor = (type: string) => {
    switch (type) {
      case 'current': return 'border-4 border-blue-500 bg-blue-50';
      case 'citing': return 'border-2 border-green-400 bg-green-50';
      case 'cited': return 'border-2 border-orange-400 bg-orange-50';
      case 'family': return 'border-2 border-purple-400 bg-purple-50';
      default: return 'border-2 border-gray-400 bg-gray-50';
    }
  };

  const filteredForwardCitations = forwardCitations.filter(citation => {
    if (selectedFilter !== 'all' && citation.citationType !== selectedFilter) return false;
    if (searchTerm && !citation.title.toLowerCase().includes(searchTerm.toLowerCase()) && 
        !citation.assignee.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    return true;
  });

  const filteredBackwardCitations = backwardCitations.filter(citation => {
    if (selectedFilter !== 'all' && citation.citationType !== selectedFilter) return false;
    if (searchTerm && !citation.title.toLowerCase().includes(searchTerm.toLowerCase()) && 
        !citation.assignee.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold">Citations & Prior Art</h2>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search citations..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-64"
            />
          </div>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export Citations
          </Button>
        </div>
      </div>

      <Tabs value={activeSubTab} onValueChange={setActiveSubTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="network" className="flex items-center gap-2">
            <Network className="h-4 w-4" />
            Network View
          </TabsTrigger>
          <TabsTrigger value="forward" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Forward ({forwardCitations.length})
          </TabsTrigger>
          <TabsTrigger value="backward" className="flex items-center gap-2">
            <TrendingDown className="h-4 w-4" />
            Backward ({backwardCitations.length})
          </TabsTrigger>
          <TabsTrigger value="literature" className="flex items-center gap-2">
            <BookOpen className="h-4 w-4" />
            Literature ({nonPatentLiterature.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="network" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <TrendingUp className="h-8 w-8 text-green-600" />
                  <div>
                    <p className="text-2xl font-bold">{forwardCitations.length}</p>
                    <p className="text-sm text-muted-foreground">Citing Patents</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <TrendingDown className="h-8 w-8 text-orange-600" />
                  <div>
                    <p className="text-2xl font-bold">{backwardCitations.length}</p>
                    <p className="text-sm text-muted-foreground">Cited Patents</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <BookOpen className="h-8 w-8 text-blue-600" />
                  <div>
                    <p className="text-2xl font-bold">{nonPatentLiterature.length}</p>
                    <p className="text-sm text-muted-foreground">NPL References</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Star className="h-8 w-8 text-purple-600" />
                  <div>
                    <p className="text-2xl font-bold">8.7</p>
                    <p className="text-sm text-muted-foreground">Impact Score</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Network className="h-5 w-5" />
                Citation Network Visualization
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="aspect-video bg-gray-50 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center mb-4">
                <div className="text-center">
                  <Network className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-lg font-medium text-gray-600">Interactive Citation Network</p>
                  <p className="text-sm text-gray-500 mt-2">
                    Click nodes to explore connections • Drag to rearrange • Zoom to focus
                  </p>
                </div>
              </div>

              {/* Simple network representation */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {citationNodes.slice(0, 6).map((node, index) => (
                  <Card key={index} className={`cursor-pointer transition-all hover:shadow-md ${getNodeTypeColor(node.nodeType)}`}>
                    <CardContent className="p-3">
                      <div className="flex items-start justify-between mb-2">
                        <Badge variant="outline" className="text-xs">
                          {node.nodeType.toUpperCase()}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {node.citationCount} cites
                        </span>
                      </div>
                      <h4 className="font-semibold text-sm mb-1">{node.patentNumber}</h4>
                      <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
                        {node.title}
                      </p>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">{node.assignee}</span>
                        <span className="font-medium">{node.year}</span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <div className="flex items-center justify-center gap-4 mt-6 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-4 border-blue-500 bg-blue-50 rounded"></div>
                  <span>Current Patent</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-green-400 bg-green-50 rounded"></div>
                  <span>Citing Patents</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-orange-400 bg-orange-50 rounded"></div>
                  <span>Cited Patents</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="forward" className="space-y-4">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-muted-foreground">
              Patents that cite this patent ({filteredForwardCitations.length} of {forwardCitations.length})
            </p>
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <select 
                value={selectedFilter} 
                onChange={(e) => setSelectedFilter(e.target.value)}
                className="text-sm border rounded px-2 py-1"
              >
                <option value="all">All Citations</option>
                <option value="examiner">Examiner Citations</option>
                <option value="applicant">Applicant Citations</option>
                <option value="thirdParty">Third Party Citations</option>
              </select>
            </div>
          </div>

          <div className="space-y-4">
            {filteredForwardCitations.map((citation, index) => (
              <Card key={index} className="border-l-4 border-l-green-500">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-semibold">{citation.patentNumber}</h4>
                        <Badge className={getCitationTypeColor(citation.citationType)}>
                          {citation.citationType.toUpperCase()}
                        </Badge>
                        <div className="flex items-center gap-1">
                          <Star className="h-3 w-3 text-yellow-500" />
                          <span className="text-xs text-muted-foreground">
                            {(citation.relevanceScore * 100).toFixed(0)}% relevance
                          </span>
                        </div>
                      </div>
                      <h5 className="font-medium mb-2">{citation.title}</h5>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground mb-2">
                        <span className="flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          {citation.assignee}
                        </span>
                        <span>Filed: {new Date(citation.filingDate).toLocaleDateString()}</span>
                      </div>
                      {citation.contextSnippet && (
                        <div className="mt-3 p-3 bg-gray-50 rounded text-sm">
                          <p className="text-muted-foreground mb-1">Citation Context:</p>
                          <p className="italic">"{citation.contextSnippet}"</p>
                        </div>
                      )}
                    </div>
                    <div className="flex flex-col gap-2 ml-4">
                      <Button variant="outline" size="sm">
                        <ExternalLink className="h-4 w-4 mr-2" />
                        View Patent
                      </Button>
                      <Button variant="outline" size="sm">
                        <FileText className="h-4 w-4 mr-2" />
                        Full Context
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="backward" className="space-y-4">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-muted-foreground">
              Patents cited by this patent ({filteredBackwardCitations.length} of {backwardCitations.length})
            </p>
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <select 
                value={selectedFilter} 
                onChange={(e) => setSelectedFilter(e.target.value)}
                className="text-sm border rounded px-2 py-1"
              >
                <option value="all">All Citations</option>
                <option value="examiner">Examiner Citations</option>
                <option value="applicant">Applicant Citations</option>
              </select>
            </div>
          </div>

          <div className="space-y-4">
            {filteredBackwardCitations.map((citation, index) => (
              <Card key={index} className="border-l-4 border-l-orange-500">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-semibold">{citation.patentNumber}</h4>
                        <Badge className={getCitationTypeColor(citation.citationType)}>
                          {citation.citationType.toUpperCase()}
                        </Badge>
                        <div className="flex items-center gap-1">
                          <Star className="h-3 w-3 text-yellow-500" />
                          <span className="text-xs text-muted-foreground">
                            {(citation.relevanceScore * 100).toFixed(0)}% relevance
                          </span>
                        </div>
                      </div>
                      <h5 className="font-medium mb-2">{citation.title}</h5>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground mb-2">
                        <span className="flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          {citation.assignee}
                        </span>
                        <span>Filed: {new Date(citation.filingDate).toLocaleDateString()}</span>
                      </div>
                      {citation.contextSnippet && (
                        <div className="mt-3 p-3 bg-gray-50 rounded text-sm">
                          <p className="text-muted-foreground mb-1">Relevance:</p>
                          <p className="italic">"{citation.contextSnippet}"</p>
                        </div>
                      )}
                    </div>
                    <div className="flex flex-col gap-2 ml-4">
                      <Button variant="outline" size="sm">
                        <ExternalLink className="h-4 w-4 mr-2" />
                        View Patent
                      </Button>
                      <Button variant="outline" size="sm">
                        <FileText className="h-4 w-4 mr-2" />
                        Prior Art Analysis
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="literature" className="space-y-4">
          <p className="text-sm text-muted-foreground mb-4">
            Non-patent literature references ({nonPatentLiterature.length})
          </p>

          <div className="space-y-4">
            {nonPatentLiterature.map((reference, index) => (
              <Card key={index} className="border-l-4 border-l-blue-500">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <BookOpen className="h-4 w-4 text-blue-600" />
                        <Badge className={getCitationTypeColor(reference.citationType)}>
                          {reference.citationType.toUpperCase()}
                        </Badge>
                      </div>
                      <h4 className="font-semibold mb-2">{reference.title}</h4>
                      <div className="space-y-1 text-sm text-muted-foreground">
                        <p><strong>Authors:</strong> {reference.authors.join(', ')}</p>
                        <p><strong>Publication:</strong> {reference.publication}</p>
                        <p><strong>Date:</strong> {new Date(reference.publicationDate).toLocaleDateString()}</p>
                        {reference.doi && (
                          <p><strong>DOI:</strong> {reference.doi}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-col gap-2 ml-4">
                      <Button variant="outline" size="sm">
                        <ExternalLink className="h-4 w-4 mr-2" />
                        View Article
                      </Button>
                      {reference.doi && (
                        <Button variant="outline" size="sm">
                          <BookOpen className="h-4 w-4 mr-2" />
                          DOI Link
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PatentCitationsTab;