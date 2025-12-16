import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { LegalCitation } from '@/types/legal';
import { ExternalLink, BookOpen, Scale, Copy, Star, ChevronDown, ChevronUp } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LegalCitationCardProps {
  citations: LegalCitation[];
  maxVisible?: number;
  className?: string;
}

const getCitationTypeIcon = (type: string) => {
  switch (type) {
    case 'case':
      return <Scale className="h-4 w-4" />;
    case 'statute':
      return <BookOpen className="h-4 w-4" />;
    case 'regulation':
      return <BookOpen className="h-4 w-4" />;
    default:
      return <BookOpen className="h-4 w-4" />;
  }
};

const getCitationTypeColor = (type: string) => {
  switch (type) {
    case 'case':
      return 'bg-blue-50 text-blue-700 border-blue-200';
    case 'statute':
      return 'bg-green-50 text-green-700 border-green-200';
    case 'regulation':
      return 'bg-purple-50 text-purple-700 border-purple-200';
    case 'article':
      return 'bg-orange-50 text-orange-700 border-orange-200';
    default:
      return 'bg-gray-50 text-gray-700 border-gray-200';
  }
};

const getRelevanceColor = (relevance: number) => {
  if (relevance >= 90) return 'text-green-600 bg-green-50 border-green-200';
  if (relevance >= 70) return 'text-blue-600 bg-blue-50 border-blue-200';
  if (relevance >= 50) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
  return 'text-gray-600 bg-gray-50 border-gray-200';
};

export const LegalCitationCard: React.FC<LegalCitationCardProps> = ({
  citations,
  maxVisible = 3,
  className,
}) => {
  const [expanded, setExpanded] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const visibleCitations = expanded ? citations : citations.slice(0, maxVisible);
  const hasMore = citations.length > maxVisible;

  const handleCopy = async (citation: LegalCitation) => {
    try {
      await navigator.clipboard.writeText(citation.bluebookFormat);
      setCopiedId(citation.id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (error) {
      console.error('Failed to copy citation:', error);
    }
  };

  const handleOpenLink = (url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  if (citations.length === 0) return null;

  return (
    <Card className={cn('shadow-sm border-l-4 border-l-blue-500', className)}>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Scale className="h-5 w-5 text-blue-600" />
          Legal Citations ({citations.length})
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-3">
        {visibleCitations.map((citation, index) => (
          <div key={citation.id} className="border rounded-lg p-4 bg-gray-50 hover:bg-gray-100 transition-colors">
            {/* Header */}
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <Badge variant="outline" className={cn('border', getCitationTypeColor(citation.type))}>
                  {getCitationTypeIcon(citation.type)}
                  <span className="ml-1 capitalize">{citation.type}</span>
                </Badge>
                
                <Badge variant="outline" className={cn('border', getRelevanceColor(citation.relevance))}>
                  <Star className="h-3 w-3 mr-1" />
                  {citation.relevance}% relevant
                </Badge>
              </div>
              
              <div className="flex items-center gap-1 flex-shrink-0">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => handleCopy(citation)}
                  className="h-8 w-8 p-0"
                  title="Copy Bluebook citation"
                >
                  <Copy className={cn('h-4 w-4', copiedId === citation.id ? 'text-green-600' : 'text-gray-500')} />
                </Button>
                
                {citation.url && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleOpenLink(citation.url!)}
                    className="h-8 w-8 p-0"
                    title="Open external link"
                  >
                    <ExternalLink className="h-4 w-4 text-gray-500" />
                  </Button>
                )}
              </div>
            </div>

            {/* Title */}
            <h4 className="font-semibold text-gray-900 mb-2 leading-tight">
              {citation.title}
            </h4>

            {/* Citation */}
            <div className="bg-white border rounded p-3 mb-3">
              <p className="text-sm font-mono text-gray-800 leading-relaxed">
                {citation.bluebookFormat}
              </p>
              
              {citation.pinpoint && (
                <p className="text-xs text-gray-600 mt-1">
                  See specifically: {citation.pinpoint}
                </p>
              )}
            </div>

            {/* Metadata */}
            <div className="flex items-center gap-4 text-xs text-gray-600 mb-2">
              {citation.court && (
                <span className="flex items-center gap-1">
                  <Scale className="h-3 w-3" />
                  {citation.court}
                </span>
              )}
              
              {citation.year && (
                <span>{citation.year}</span>
              )}
              
              <span className="bg-gray-200 px-2 py-1 rounded">
                {citation.jurisdiction}
              </span>
            </div>

            {/* Summary */}
            {citation.summary && (
              <div className="border-t pt-3">
                <p className="text-sm text-gray-700 leading-relaxed">
                  {citation.summary}
                </p>
              </div>
            )}

            {copiedId === citation.id && (
              <div className="text-xs text-green-600 mt-2 flex items-center gap-1">
                <Copy className="h-3 w-3" />
                Citation copied to clipboard
              </div>
            )}
          </div>
        ))}

        {/* Show More/Less Button */}
        {hasMore && (
          <div className="flex justify-center pt-2">
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setExpanded(!expanded)}
              className="text-blue-600 hover:text-blue-700"
            >
              {expanded ? (
                <>
                  <ChevronUp className="h-4 w-4 mr-1" />
                  Show Less
                </>
              ) : (
                <>
                  <ChevronDown className="h-4 w-4 mr-1" />
                  Show {citations.length - maxVisible} More Citations
                </>
              )}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};