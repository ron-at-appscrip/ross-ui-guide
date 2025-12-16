import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Eye, 
  ExternalLink, 
  Download, 
  BookmarkPlus,
  MoreHorizontal,
  Calendar,
  User,
  Building2,
  FileText,
  TrendingUp
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { PatentResult } from '@/types/uspto';
import PatentTableSkeleton from './skeletons/PatentTableSkeleton';
import PatentDetailModal from './PatentDetailModal';

interface PatentResultsTableProps {
  results: PatentResult[];
  total: number;
  currentPage: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onViewDetails: (patent: PatentResult) => void;
  onAddToPortfolio: (patent: PatentResult) => void;
  onExportPatent: (patent: PatentResult) => void;
  isLoading?: boolean;
}

const PatentResultsTable: React.FC<PatentResultsTableProps> = ({
  results,
  total,
  currentPage,
  pageSize,
  onPageChange,
  onViewDetails,
  onAddToPortfolio,
  onExportPatent,
  isLoading = false
}) => {
  const [selectedPatents, setSelectedPatents] = useState<Set<string>>(new Set());
  const [selectedPatentForDetail, setSelectedPatentForDetail] = useState<PatentResult | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedPatents(new Set(results.map(patent => patent.id)));
    } else {
      setSelectedPatents(new Set());
    }
  };

  const handleSelectPatent = (patentId: string, checked: boolean) => {
    const newSelected = new Set(selectedPatents);
    if (checked) {
      newSelected.add(patentId);
    } else {
      newSelected.delete(patentId);
    }
    setSelectedPatents(newSelected);
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'granted':
        return 'default';
      case 'published':
        return 'secondary';
      case 'pending':
        return 'outline';
      case 'abandoned':
        return 'destructive';
      case 'expired':
        return 'destructive';
      default:
        return 'secondary';
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch {
      return 'N/A';
    }
  };

  const truncateText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text;
    return text.substr(0, maxLength) + '...';
  };

  const handleViewPatentDetails = (patent: PatentResult) => {
    setSelectedPatentForDetail(patent);
    setShowDetailModal(true);
    onViewDetails(patent); // Still call the original handler
  };

  const handleCloseDetailModal = () => {
    setShowDetailModal(false);
    setSelectedPatentForDetail(null);
  };

  const totalPages = Math.ceil(total / pageSize);
  const isAllSelected = results.length > 0 && selectedPatents.size === results.length;
  const isSomeSelected = selectedPatents.size > 0 && selectedPatents.size < results.length;

  if (isLoading) {
    return <PatentTableSkeleton />;
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Patent Search Results
            <Badge variant="secondary">{total.toLocaleString()}</Badge>
          </CardTitle>
          
          {selectedPatents.size > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">
                {selectedPatents.size} selected
              </span>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export Selected
              </Button>
              <Button variant="outline" size="sm">
                <BookmarkPlus className="h-4 w-4 mr-2" />
                Add to Portfolio
              </Button>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">
                  <Checkbox
                    checked={isAllSelected}
                    indeterminate={isSomeSelected}
                    onCheckedChange={handleSelectAll}
                  />
                </TableHead>
                <TableHead>Patent</TableHead>
                <TableHead className="hidden lg:table-cell">Inventor(s)</TableHead>
                <TableHead className="hidden xl:table-cell">Assignee</TableHead>
                <TableHead className="hidden lg:table-cell">Grant Date</TableHead>
                <TableHead className="hidden xl:table-cell">Citations</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-12"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {results.map((patent) => (
                <TableRow key={patent.id} className="hover:bg-muted/50">
                  <TableCell>
                    <Checkbox
                      checked={selectedPatents.has(patent.id)}
                      onCheckedChange={(checked) => 
                        handleSelectPatent(patent.id, checked === true)
                      }
                    />
                  </TableCell>
                  
                  <TableCell className="min-w-0">
                    <div className="space-y-1">
                      <div className="font-medium text-sm leading-tight">
                        {truncateText(patent.title, 80)}
                      </div>
                      <div className="text-xs text-muted-foreground font-mono">
                        {patent.patentNumber}
                      </div>
                      <div className="text-xs text-muted-foreground line-clamp-2">
                        {truncateText(patent.abstract, 120)}
                      </div>
                    </div>
                  </TableCell>
                  
                  <TableCell className="hidden lg:table-cell">
                    <div className="text-sm">
                      {patent.inventors.length > 0 ? (
                        <div>
                          <div className="font-medium">
                            {patent.inventors[0]}
                          </div>
                          {patent.inventors.length > 1 && (
                            <div className="text-xs text-muted-foreground">
                              +{patent.inventors.length - 1} more
                            </div>
                          )}
                        </div>
                      ) : (
                        <span className="text-muted-foreground">N/A</span>
                      )}
                    </div>
                  </TableCell>
                  
                  <TableCell className="hidden xl:table-cell">
                    <div className="text-sm">
                      <div className="font-medium flex items-center gap-1">
                        <Building2 className="h-3 w-3" />
                        {truncateText(patent.assignee, 30)}
                      </div>
                    </div>
                  </TableCell>
                  
                  <TableCell className="hidden lg:table-cell">
                    <div className="text-sm flex items-center gap-1">
                      <Calendar className="h-3 w-3 text-muted-foreground" />
                      {formatDate(patent.grantDate || patent.publicationDate || patent.filingDate)}
                    </div>
                  </TableCell>
                  
                  <TableCell className="hidden xl:table-cell">
                    <div className="flex items-center gap-2 text-sm">
                      <div className="flex items-center gap-1">
                        <TrendingUp className="h-3 w-3 text-green-500" />
                        <span>{patent.citedBy}</span>
                      </div>
                      <div className="text-muted-foreground">
                        / {patent.cites}
                      </div>
                    </div>
                  </TableCell>
                  
                  <TableCell>
                    <Badge variant={getStatusBadgeVariant(patent.status)} className="text-xs">
                      {patent.status}
                    </Badge>
                  </TableCell>
                  
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleViewPatentDetails(patent)}>
                          <Eye className="h-4 w-4 mr-2" />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onAddToPortfolio(patent)}>
                          <BookmarkPlus className="h-4 w-4 mr-2" />
                          Add to Portfolio
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => onExportPatent(patent)}>
                          <Download className="h-4 w-4 mr-2" />
                          Export Patent
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <a
                            href={`https://patents.uspto.gov/patent/${patent.patentNumber}`}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <ExternalLink className="h-4 w-4 mr-2" />
                            View on USPTO
                          </a>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-4">
            <div className="text-sm text-muted-foreground">
              Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, total)} of {total.toLocaleString()} results
            </div>
            
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage === 1}
              >
                Previous
              </Button>
              
              {/* Page Numbers */}
              <div className="flex items-center space-x-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const pageNum = Math.max(1, Math.min(totalPages - 4, currentPage - 2)) + i;
                  return (
                    <Button
                      key={pageNum}
                      variant={pageNum === currentPage ? "default" : "outline"}
                      size="sm"
                      onClick={() => onPageChange(pageNum)}
                      className="w-8 h-8 p-0"
                    >
                      {pageNum}
                    </Button>
                  );
                })}
              </div>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </CardContent>

      {/* Patent Detail Modal */}
      <PatentDetailModal
        patent={selectedPatentForDetail}
        isOpen={showDetailModal}
        onClose={handleCloseDetailModal}
        onAddToPortfolio={onAddToPortfolio}
        onExportPatent={onExportPatent}
      />
    </Card>
  );
};

export default PatentResultsTable;