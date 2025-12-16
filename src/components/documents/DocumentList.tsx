import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  FileText, 
  Image, 
  Download, 
  Share, 
  Star, 
  Eye,
  MoreHorizontal
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Document } from '@/types/document';
import { formatDistanceToNow } from 'date-fns';

interface DocumentListProps {
  documents: Document[];
  selectedDocuments: string[];
  onSelectionChange: (documentIds: string[]) => void;
  onPreview: (document: Document) => void;
  onDownload: (document: Document) => void;
  onShare: (document: Document) => void;
  onStar: (document: Document) => void;
  onDelete: (document: Document) => void;
}

const DocumentList = ({
  documents,
  selectedDocuments,
  onSelectionChange,
  onPreview,
  onDownload,
  onShare,
  onStar,
  onDelete
}: DocumentListProps) => {
  const getFileIcon = (type: string) => {
    switch (type) {
      case 'pdf':
      case 'docx':
      case 'txt':
        return <FileText className="w-4 h-4 text-blue-500" />;
      case 'image':
        return <Image className="w-4 h-4 text-green-500" />;
      default:
        return <FileText className="w-4 h-4 text-gray-500" />;
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

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      onSelectionChange(documents.map(doc => doc.id));
    } else {
      onSelectionChange([]);
    }
  };

  const handleSelectDocument = (documentId: string, checked: boolean) => {
    if (checked) {
      onSelectionChange([...selectedDocuments, documentId]);
    } else {
      onSelectionChange(selectedDocuments.filter(id => id !== documentId));
    }
  };

  const isAllSelected = documents.length > 0 && selectedDocuments.length === documents.length;
  const isPartiallySelected = selectedDocuments.length > 0 && selectedDocuments.length < documents.length;

  return (
    <div className="border rounded-lg overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-12">
              <Checkbox
                checked={isAllSelected}
                onCheckedChange={handleSelectAll}
                aria-label="Select all documents"
                {...(isPartiallySelected && { 'data-state': 'indeterminate' })}
              />
            </TableHead>
            <TableHead className="min-w-[200px]">Name</TableHead>
            <TableHead className="min-w-[100px]">Category</TableHead>
            <TableHead className="min-w-[80px]">Size</TableHead>
            <TableHead className="min-w-[120px]">Modified</TableHead>
            <TableHead className="min-w-[150px]">Tags</TableHead>
            <TableHead className="w-[120px]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {documents.map((document) => (
            <TableRow key={document.id} className="group hover:bg-muted/50">
              <TableCell>
                <Checkbox
                  checked={selectedDocuments.includes(document.id)}
                  onCheckedChange={(checked) => 
                    handleSelectDocument(document.id, checked as boolean)
                  }
                  aria-label={`Select ${document.name}`}
                />
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-3">
                  {getFileIcon(document.type)}
                  <div className="flex flex-col min-w-0">
                    <span className="font-medium truncate">{document.name}</span>
                    {document.description && (
                      <span className="text-xs text-muted-foreground truncate max-w-xs">
                        {document.description}
                      </span>
                    )}
                  </div>
                  {document.isStarred && (
                    <Star className="w-4 h-4 text-yellow-500 fill-current flex-shrink-0" />
                  )}
                </div>
              </TableCell>
              <TableCell>
                <Badge variant="secondary" className={getCategoryColor(document.category)}>
                  {document.category}
                </Badge>
              </TableCell>
              <TableCell className="text-muted-foreground">
                {formatFileSize(document.size)}
              </TableCell>
              <TableCell className="text-muted-foreground">
                {formatDistanceToNow(new Date(document.modifiedAt), { addSuffix: true })}
              </TableCell>
              <TableCell>
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
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onPreview(document)}
                    className="h-8 w-8 p-0"
                    title="Preview document"
                  >
                    <Eye className="w-4 h-4" />
                  </Button>
                  
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        className="h-8 w-8 p-0"
                        title="More actions"
                      >
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="bg-white border shadow-lg z-[100]">
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
                      <DropdownMenuItem onClick={() => onStar(document)}>
                        <Star className="w-4 h-4 mr-2" />
                        {document.isStarred ? 'Unstar' : 'Star'}
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
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default DocumentList;
