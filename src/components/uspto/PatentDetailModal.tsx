import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  FileText, 
  Scale, 
  TrendingUp, 
  Link2, 
  BarChart3, 
  Download,
  Copy,
  Bookmark,
  ExternalLink,
  Calendar,
  Building2,
  User,
  Tag,
  Clock
} from 'lucide-react';
import { PatentResult } from '@/types/uspto';
import { USPTOService } from '@/services/usptoService';
import { useToast } from '@/hooks/use-toast';
import PatentOverviewTab from './PatentOverviewTab';
import PatentTechnicalTab from './PatentTechnicalTab';
import PatentLegalTab from './PatentLegalTab';
import PatentCitationsTab from './PatentCitationsTab';
import PatentAnalyticsTab from './PatentAnalyticsTab';
import PatentDocumentsTab from './PatentDocumentsTab';

interface PatentDetailModalProps {
  patent: PatentResult | null;
  isOpen: boolean;
  onClose: () => void;
  onAddToPortfolio?: (patent: PatentResult) => void;
  onExport?: (patent: PatentResult) => void;
}

interface PatentDetailData extends PatentResult {
  // Extended data that would come from detailed API call
  fullDescription?: string;
  detailedClaims?: string[];
  legalEvents?: Array<{
    date: string;
    event: string;
    description: string;
  }>;
  patentFamily?: PatentResult[];
  forwardCitations?: PatentResult[];
  backwardCitations?: PatentResult[];
  drawings?: Array<{
    id: string;
    title: string;
    url: string;
  }>;
  prosecutionHistory?: Array<{
    date: string;
    action: string;
    document: string;
  }>;
}

const PatentDetailModal: React.FC<PatentDetailModalProps> = ({
  patent,
  isOpen,
  onClose,
  onAddToPortfolio,
  onExport
}) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [detailData, setDetailData] = useState<PatentDetailData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  // Load detailed patent data when modal opens
  useEffect(() => {
    if (isOpen && patent) {
      loadPatentDetails(patent.id);
    }
  }, [isOpen, patent]);

  const loadPatentDetails = async (patentId: string) => {
    setIsLoading(true);
    try {
      // In a real implementation, this would fetch additional details
      // For now, we'll enhance the existing patent data
      const enhanced: PatentDetailData = {
        ...patent!,
        fullDescription: generateMockDescription(),
        detailedClaims: generateMockClaims(),
        legalEvents: generateMockLegalEvents(),
        patentFamily: [],
        forwardCitations: [],
        backwardCitations: [],
        drawings: generateMockDrawings(),
        prosecutionHistory: generateMockProsecutionHistory()
      };
      
      setDetailData(enhanced);
    } catch (error) {
      console.error('Failed to load patent details:', error);
      toast({
        title: "Error",
        description: "Failed to load patent details",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const generateMockDescription = () => {
    return `BACKGROUND OF THE INVENTION

Field of the Invention
This invention relates to artificial intelligence systems and methods for analyzing legal documents, and more particularly to machine learning algorithms that can extract key information from patent documents and legal texts.

Description of Related Art
Traditional legal document analysis requires significant manual effort from legal professionals. Existing systems have limitations in understanding complex legal terminology and relationships between different sections of legal documents.

SUMMARY OF THE INVENTION
The present invention provides a computer-implemented method and system for automated legal document analysis using advanced machine learning techniques. The system can identify key clauses, assess risk factors, and generate comprehensive summaries of legal documents.

DETAILED DESCRIPTION OF THE PREFERRED EMBODIMENTS
Referring now to the drawings, and particularly to FIG. 1, there is shown a block diagram of the legal document analysis system 100. The system includes a document input module 110, a natural language processing engine 120, a machine learning classifier 130, and an output generation module 140.

The document input module 110 is configured to receive legal documents in various formats including PDF, Word documents, and plain text. The system supports batch processing of multiple documents simultaneously.

The natural language processing engine 120 employs advanced tokenization and semantic analysis techniques to understand the structure and content of legal documents. This engine utilizes transformer-based models trained specifically on legal corpora.`;
  };

  const generateMockClaims = () => {
    return [
      "A computer-implemented method for analyzing legal documents, comprising: receiving a legal document in electronic format; processing the document using natural language processing techniques; identifying key legal concepts and clauses; and generating a structured analysis report.",
      "The method of claim 1, wherein the natural language processing techniques include tokenization, named entity recognition, and semantic relationship extraction.",
      "The method of claim 1, wherein the structured analysis report includes risk assessment scores for identified clauses.",
      "A system for legal document analysis, comprising: a processor; a memory storing instructions that, when executed by the processor, cause the system to perform the method of claim 1.",
      "The system of claim 4, further comprising a user interface for displaying the structured analysis report in an interactive format."
    ];
  };

  const generateMockLegalEvents = () => {
    const currentDate = new Date();
    return [
      {
        date: new Date(currentDate.getTime() - 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        event: 'Patent Granted',
        description: 'Patent officially granted by USPTO'
      },
      {
        date: new Date(currentDate.getTime() - 400 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        event: 'Notice of Allowance',
        description: 'USPTO issued Notice of Allowance'
      },
      {
        date: new Date(currentDate.getTime() - 800 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        event: 'Application Filed',
        description: 'Patent application filed with USPTO'
      }
    ];
  };

  const generateMockDrawings = () => {
    return [
      { id: '1', title: 'Figure 1 - System Architecture', url: '/images/patent-fig1.png' },
      { id: '2', title: 'Figure 2 - Process Flow', url: '/images/patent-fig2.png' },
      { id: '3', title: 'Figure 3 - User Interface', url: '/images/patent-fig3.png' }
    ];
  };

  const generateMockProsecutionHistory = () => {
    return [
      {
        date: '2023-03-15',
        action: 'Response Filed',
        document: 'Response to Office Action'
      },
      {
        date: '2022-11-20',
        action: 'Office Action',
        document: 'Non-Final Rejection'
      },
      {
        date: '2022-02-10',
        action: 'Application Filed',
        document: 'Initial Application'
      }
    ];
  };

  const handleCopyPatentNumber = () => {
    if (patent?.patentNumber) {
      navigator.clipboard.writeText(patent.patentNumber);
      toast({
        title: "Copied",
        description: "Patent number copied to clipboard"
      });
    }
  };

  const handleAddToPortfolio = () => {
    if (patent && onAddToPortfolio) {
      onAddToPortfolio(patent);
    }
  };

  const handleExport = () => {
    if (patent && onExport) {
      onExport(patent);
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

  if (!patent) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] flex flex-col">
        <DialogHeader className="pb-4 flex-shrink-0">
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <DialogTitle className="text-xl font-semibold mb-2 pr-4">
                {patent.title}
              </DialogTitle>
              <div className="flex items-center gap-3 flex-wrap">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-sm font-medium">{patent.patentNumber}</span>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={handleCopyPatentNumber}
                    className="h-6 w-6 p-0"
                  >
                    <Copy className="h-3 w-3" />
                  </Button>
                </div>
                <Badge className={getStatusColor(patent.status)}>
                  {patent.status.toUpperCase()}
                </Badge>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={handleAddToPortfolio}>
                <Bookmark className="h-4 w-4 mr-2" />
                Add to Portfolio
              </Button>
              <Button variant="outline" size="sm" onClick={handleExport}>
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
              <Button variant="outline" size="sm" asChild>
                <a 
                  href={`https://patents.uspto.gov/patent/${patent.patentNumber.replace(/[^0-9]/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  USPTO
                </a>
              </Button>
            </div>
          </div>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col overflow-hidden">
          <TabsList className="grid w-full grid-cols-6 flex-shrink-0">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="technical" className="flex items-center gap-2">
              <Tag className="h-4 w-4" />
              Technical
            </TabsTrigger>
            <TabsTrigger value="legal" className="flex items-center gap-2">
              <Scale className="h-4 w-4" />
              Legal
            </TabsTrigger>
            <TabsTrigger value="citations" className="flex items-center gap-2">
              <Link2 className="h-4 w-4" />
              Citations
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Analytics
            </TabsTrigger>
            <TabsTrigger value="documents" className="flex items-center gap-2">
              <Download className="h-4 w-4" />
              Documents
            </TabsTrigger>
          </TabsList>

          <div className="flex-1 overflow-y-auto p-6">
            <TabsContent value="overview" className="mt-0">
              {detailData ? (
                <PatentOverviewTab patent={detailData} detailData={detailData} />
              ) : isLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                  <p className="text-muted-foreground">Loading patent details...</p>
                </div>
              ) : (
                <PatentOverviewTab patent={patent} />
              )}
            </TabsContent>

            <TabsContent value="technical" className="mt-0">
              <PatentTechnicalTab patent={detailData || patent} />
            </TabsContent>

            <TabsContent value="legal" className="mt-0">
              <PatentLegalTab patent={detailData || patent} />
            </TabsContent>

            <TabsContent value="citations" className="mt-0">
              <PatentCitationsTab patent={detailData || patent} />
            </TabsContent>

            <TabsContent value="analytics" className="mt-0">
              <PatentAnalyticsTab patent={detailData || patent} />
            </TabsContent>

            <TabsContent value="documents" className="mt-0">
              <PatentDocumentsTab patent={detailData || patent} />
            </TabsContent>
          </div>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default PatentDetailModal;