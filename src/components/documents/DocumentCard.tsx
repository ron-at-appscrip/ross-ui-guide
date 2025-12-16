
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  FileText, 
  Image, 
  Download, 
  Share, 
  Star, 
  MoreHorizontal,
  Eye
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Document } from '@/types/document';
import { formatDistanceToNow } from 'date-fns';

interface DocumentCardProps {
  document: Document;
  onPreview: (document: Document) => void;
  onDownload: (document: Document) => void;
  onShare: (document: Document) => void;
  onStar: (document: Document) => void;
  onDelete: (document: Document) => void;
}

const DocumentCard = ({
  document,
  onPreview,
  onDownload,
  onShare,
  onStar,
  onDelete
}: DocumentCardProps) => {
  const getFileIcon = (type: string) => {
    switch (type) {
      case 'pdf':
      case 'docx':
      case 'txt':
        return <FileText className="w-6 h-6 sm:w-8 sm:h-8 text-blue-500" />;
      case 'image':
        return <Image className="w-6 h-6 sm:w-8 sm:h-8 text-green-500" />;
      default:
        return <FileText className="w-6 h-6 sm:w-8 sm:h-8 text-gray-500" />;
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getCategoryColor = (category: string) => {
    const colors = {
      contract: 'bg-blue-100 text-blue-800',
      brief: 'bg-purple-100 text-purple-800',
      correspondence: 'bg-green-100 text-green-800',
      research: 'bg-yellow-100 text-yellow-800',
      evidence: 'bg-red-100 text-red-800',
      other: 'bg-gray-100 text-gray-800'
    };
    return colors[category as keyof typeof colors] || colors.other;
  };

  return (
    <Card className="group hover:shadow-md transition-all duration-200 hover-lift h-full flex flex-col">
      <CardContent className="p-3 sm:p-4 flex flex-col h-full">
        <div className="flex items-start justify-between mb-2 sm:mb-3">
          <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
            {document.thumbnail ? (
              <img 
                src={document.thumbnail} 
                alt={document.name}
                className="w-8 h-8 sm:w-10 sm:h-10 rounded object-cover flex-shrink-0"
              />
            ) : (
              <div className="flex-shrink-0">
                {getFileIcon(document.type)}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <h3 className="font-medium text-xs sm:text-sm truncate">{document.name}</h3>
              <p className="text-xs text-muted-foreground">
                <span className="hidden sm:inline">{formatFileSize(document.size)} • </span>
                {formatDistanceToNow(new Date(document.modifiedAt), { addSuffix: true })}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-1 flex-shrink-0">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onStar(document)}
              className={`opacity-0 group-hover:opacity-100 transition-opacity p-1 sm:p-2 ${
                document.isStarred ? 'text-yellow-500' : ''
              }`}
            >
              <Star className={`w-3 h-3 sm:w-4 sm:h-4 ${document.isStarred ? 'fill-current' : ''}`} />
            </Button>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="sm"
                  className="opacity-0 group-hover:opacity-100 transition-opacity p-1 sm:p-2"
                >
                  <MoreHorizontal className="w-3 h-3 sm:w-4 sm:h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onPreview(document)}>
                  <Eye className="w-4 h-4 mr-2" />
                  Preview
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onDownload(document)}>
                  <Download className="w-4 h-4 mr-2" />
                  Download
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onShare(document)}>
                  <Share className="w-4 h-4 mr-2" />
                  Share
                </DropdownMenuItem>
                {document.permissions.canDelete && (
                  <DropdownMenuItem 
                    onClick={() => onDelete(document)}
                    className="text-destructive"
                  >
                    Delete
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
        
        <div className="space-y-2 flex-1">
          <Badge variant="secondary" className={`${getCategoryColor(document.category)} text-xs`}>
            {document.category}
          </Badge>
          
          {document.tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {document.tags.slice(0, 2).map((tag) => (
                <Badge key={tag} variant="outline" className="text-xs">
                  {tag}
                </Badge>
              ))}
              {document.tags.length > 2 && (
                <Badge variant="outline" className="text-xs">
                  +{document.tags.length - 2}
                </Badge>
              )}
            </div>
          )}
          
          {document.description && (
            <p className="text-xs text-muted-foreground line-clamp-2 hidden sm:block">
              {document.description}
            </p>
          )}
        </div>
        
        <div className="mt-2 sm:mt-3 flex gap-1 sm:gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            className="flex-1 text-xs sm:text-sm px-2 sm:px-3 py-1 sm:py-2"
            onClick={() => onPreview(document)}
          >
            <Eye className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
            <span className="hidden sm:inline">Preview</span>
            <span className="sm:hidden">View</span>
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            className="px-2 sm:px-3 py-1 sm:py-2"
            onClick={() => onDownload(document)}
          >
            <Download className="w-3 h-3 sm:w-4 sm:h-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default DocumentCard;
