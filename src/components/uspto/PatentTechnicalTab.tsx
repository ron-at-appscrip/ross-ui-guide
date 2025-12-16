import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { 
  FileText, 
  Search, 
  Copy, 
  ChevronDown, 
  ChevronRight,
  Image as ImageIcon,
  Zap,
  List,
  TreePine
} from 'lucide-react';
import { PatentResult } from '@/types/uspto';
import { useToast } from '@/hooks/use-toast';

interface PatentTechnicalTabProps {
  patent: PatentResult;
}

interface ClaimData {
  number: number;
  text: string;
  type: 'independent' | 'dependent';
  dependsOn?: number[];
  status: 'allowed' | 'rejected' | 'amended' | 'cancelled';
}

interface DescriptionSection {
  title: string;
  content: string;
  figureReferences: string[];
  level: number;
}

interface DrawingData {
  figureNumber: string;
  title: string;
  description: string;
  imageUrl: string;
  thumbnailUrl: string;
}

const PatentTechnicalTab: React.FC<PatentTechnicalTabProps> = ({ patent }) => {
  const [activeSubTab, setActiveSubTab] = useState('claims');
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedClaims, setExpandedClaims] = useState<Set<number>>(new Set([1]));
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['background']));
  const { toast } = useToast();

  // Mock data - in real implementation, this would come from API
  const claims: ClaimData[] = [
    {
      number: 1,
      text: "A computer-implemented method for analyzing legal documents, comprising: receiving a legal document in electronic format; processing the document using natural language processing techniques to identify key legal concepts and clauses; applying machine learning algorithms to assess risk factors associated with identified clauses; and generating a structured analysis report including risk assessment scores and recommended actions.",
      type: 'independent',
      status: 'allowed'
    },
    {
      number: 2,
      text: "The method of claim 1, wherein the natural language processing techniques include tokenization, named entity recognition, semantic relationship extraction, and legal terminology classification.",
      type: 'dependent',
      dependsOn: [1],
      status: 'allowed'
    },
    {
      number: 3,
      text: "The method of claim 1, wherein the machine learning algorithms include at least one of: decision trees, neural networks, support vector machines, and ensemble methods trained on legal document corpora.",
      type: 'dependent',
      dependsOn: [1],
      status: 'allowed'
    },
    {
      number: 4,
      text: "The method of claim 1, wherein the structured analysis report includes risk assessment scores for identified clauses, confidence levels for each assessment, and recommended actions ranked by priority.",
      type: 'dependent',
      dependsOn: [1],
      status: 'allowed'
    },
    {
      number: 5,
      text: "A system for legal document analysis, comprising: a processor; a memory storing instructions that, when executed by the processor, cause the system to perform the method of claim 1; and a user interface for displaying the structured analysis report in an interactive format.",
      type: 'independent',
      status: 'allowed'
    }
  ];

  const descriptionSections: DescriptionSection[] = [
    {
      title: "Background of the Invention",
      content: "Traditional legal document analysis requires significant manual effort from legal professionals. Existing systems have limitations in understanding complex legal terminology and relationships between different sections of legal documents. There is a need for automated systems that can provide accurate and reliable analysis of legal documents.",
      figureReferences: [],
      level: 0
    },
    {
      title: "Field of the Invention",
      content: "This invention relates to artificial intelligence systems and methods for analyzing legal documents, and more particularly to machine learning algorithms that can extract key information from patent documents and legal texts.",
      figureReferences: [],
      level: 1
    },
    {
      title: "Summary of the Invention",
      content: "The present invention provides a computer-implemented method and system for automated legal document analysis using advanced machine learning techniques. The system can identify key clauses, assess risk factors, and generate comprehensive summaries of legal documents with high accuracy and reliability.",
      figureReferences: ["FIG. 1", "FIG. 2"],
      level: 0
    },
    {
      title: "Detailed Description",
      content: "Referring now to the drawings, and particularly to FIG. 1, there is shown a block diagram of the legal document analysis system 100. The system includes a document input module 110, a natural language processing engine 120, a machine learning classifier 130, and an output generation module 140.",
      figureReferences: ["FIG. 1", "FIG. 3"],
      level: 0
    }
  ];

  const drawings: DrawingData[] = [
    {
      figureNumber: "FIG. 1",
      title: "System Architecture Overview",
      description: "Block diagram showing the main components of the legal document analysis system",
      imageUrl: "/images/patent-fig1.png",
      thumbnailUrl: "/images/patent-fig1-thumb.png"
    },
    {
      figureNumber: "FIG. 2",
      title: "Process Flow Diagram",
      description: "Flowchart illustrating the document analysis process from input to output",
      imageUrl: "/images/patent-fig2.png",
      thumbnailUrl: "/images/patent-fig2-thumb.png"
    },
    {
      figureNumber: "FIG. 3",
      title: "User Interface Layout",
      description: "Screenshot of the user interface showing analysis results",
      imageUrl: "/images/patent-fig3.png",
      thumbnailUrl: "/images/patent-fig3-thumb.png"
    }
  ];

  const classifications = [
    { code: "G06F16/35", description: "Information retrieval; Database structures; File system structures" },
    { code: "G06N3/08", description: "Learning methods" },
    { code: "G06N20/00", description: "Machine learning" },
    { code: "G06F40/20", description: "Natural language analysis" }
  ];

  const toggleClaimExpansion = (claimNumber: number) => {
    const newExpanded = new Set(expandedClaims);
    if (newExpanded.has(claimNumber)) {
      newExpanded.delete(claimNumber);
    } else {
      newExpanded.add(claimNumber);
    }
    setExpandedClaims(newExpanded);
  };

  const toggleSectionExpansion = (sectionTitle: string) => {
    const newExpanded = new Set(expandedSections);
    const key = sectionTitle.toLowerCase().replace(/\s+/g, '_');
    if (newExpanded.has(key)) {
      newExpanded.delete(key);
    } else {
      newExpanded.add(key);
    }
    setExpandedSections(newExpanded);
  };

  const copyClaimText = (claimText: string, claimNumber: number) => {
    navigator.clipboard.writeText(claimText);
    toast({
      title: "Copied",
      description: `Claim ${claimNumber} copied to clipboard`
    });
  };

  const getClaimStatusColor = (status: string) => {
    switch (status) {
      case 'allowed': return 'bg-green-100 text-green-800 border-green-200';
      case 'rejected': return 'bg-red-100 text-red-800 border-red-200';
      case 'amended': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'cancelled': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const filteredClaims = claims.filter(claim => 
    searchTerm === '' || claim.text.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold">Technical Details</h2>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search claims and description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-64"
            />
          </div>
        </div>
      </div>

      <Tabs value={activeSubTab} onValueChange={setActiveSubTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="claims" className="flex items-center gap-2">
            <List className="h-4 w-4" />
            Claims ({claims.length})
          </TabsTrigger>
          <TabsTrigger value="description" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Description
          </TabsTrigger>
          <TabsTrigger value="drawings" className="flex items-center gap-2">
            <ImageIcon className="h-4 w-4" />
            Drawings ({drawings.length})
          </TabsTrigger>
          <TabsTrigger value="classification" className="flex items-center gap-2">
            <TreePine className="h-4 w-4" />
            Classification
          </TabsTrigger>
        </TabsList>

        <TabsContent value="claims" className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              {filteredClaims.length} of {claims.length} claims
              {searchTerm && ` matching "${searchTerm}"`}
            </p>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <Zap className="h-4 w-4 mr-2" />
                Highlight Dependencies
              </Button>
            </div>
          </div>

          <div className="space-y-3">
            {filteredClaims.map((claim) => (
              <Card key={claim.number} className="border">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleClaimExpansion(claim.number)}
                        className="p-1 h-6 w-6"
                      >
                        {expandedClaims.has(claim.number) ? 
                          <ChevronDown className="h-4 w-4" /> : 
                          <ChevronRight className="h-4 w-4" />
                        }
                      </Button>
                      <CardTitle className="text-lg">Claim {claim.number}</CardTitle>
                      <Badge variant="secondary" className={claim.type === 'independent' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'}>
                        {claim.type === 'independent' ? 'Independent' : 'Dependent'}
                      </Badge>
                      <Badge className={getClaimStatusColor(claim.status)}>
                        {claim.status.toUpperCase()}
                      </Badge>
                      {claim.dependsOn && (
                        <span className="text-sm text-muted-foreground">
                          → Depends on: {claim.dependsOn.join(', ')}
                        </span>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyClaimText(claim.text, claim.number)}
                      className="h-8 w-8 p-0"
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                {expandedClaims.has(claim.number) && (
                  <CardContent>
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">
                      {claim.text}
                    </p>
                  </CardContent>
                )}
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="description" className="space-y-4">
          <div className="space-y-4">
            {descriptionSections.map((section, index) => {
              const sectionKey = section.title.toLowerCase().replace(/\s+/g, '_');
              const isExpanded = expandedSections.has(sectionKey);
              
              return (
                <Card key={index} className="border">
                  <CardHeader className="pb-3">
                    <div className="flex items-center gap-3">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleSectionExpansion(section.title)}
                        className="p-1 h-6 w-6"
                      >
                        {isExpanded ? 
                          <ChevronDown className="h-4 w-4" /> : 
                          <ChevronRight className="h-4 w-4" />
                        }
                      </Button>
                      <CardTitle className="text-lg" style={{ marginLeft: `${section.level * 20}px` }}>
                        {section.title}
                      </CardTitle>
                      {section.figureReferences.length > 0 && (
                        <div className="flex gap-1">
                          {section.figureReferences.map((ref, idx) => (
                            <Badge key={idx} variant="outline" className="text-xs">
                              {ref}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  </CardHeader>
                  {isExpanded && (
                    <CardContent>
                      <p className="text-sm leading-relaxed">
                        {section.content}
                      </p>
                    </CardContent>
                  )}
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="drawings" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {drawings.map((drawing, index) => (
              <Card key={index} className="border">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">{drawing.figureNumber}</CardTitle>
                  <p className="text-sm font-medium">{drawing.title}</p>
                </CardHeader>
                <CardContent>
                  <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center mb-3">
                    <ImageIcon className="h-12 w-12 text-gray-400" />
                    <span className="ml-2 text-sm text-gray-500">Patent Drawing</span>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {drawing.description}
                  </p>
                  <div className="flex gap-2 mt-3">
                    <Button variant="outline" size="sm" className="flex-1">
                      <ImageIcon className="h-4 w-4 mr-2" />
                      View Full Size
                    </Button>
                    <Button variant="outline" size="sm">
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="classification" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TreePine className="h-5 w-5" />
                Patent Classification Codes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {classifications.map((classification, index) => (
                  <div key={index} className="flex items-start gap-3 p-3 border rounded-lg">
                    <Badge variant="outline" className="font-mono text-sm">
                      {classification.code}
                    </Badge>
                    <div className="flex-1">
                      <p className="text-sm leading-relaxed">
                        {classification.description}
                      </p>
                    </div>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
              
              <Separator className="my-4" />
              
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">
                  Classification System: Cooperative Patent Classification (CPC)
                </span>
                <Button variant="outline" size="sm">
                  View Classification Tree
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PatentTechnicalTab;