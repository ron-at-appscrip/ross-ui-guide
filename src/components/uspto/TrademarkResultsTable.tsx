import React, { useState } from 'react';
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
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Eye, Download, FolderPlus, FileText, Link, Building, Plus, ExternalLink } from 'lucide-react';
import type { TrademarkResult } from '@/types/uspto';
import TrademarkResultsSkeleton from './skeletons/TrademarkResultsSkeleton';
import TSDRDocumentViewer from './TSDRDocumentViewer';
import AddTrademarkModal from './AddTrademarkModal';
import RenewalStatusBadge from './RenewalStatusBadge';
import { useToast } from '@/hooks/use-toast';
import { USPTOService } from '@/services/usptoService';
import { openTrademarkHTMLView, downloadTrademarkPDF } from '@/utils/trademarkUtils';

interface TrademarkResultsTableProps {
  results: TrademarkResult[];
  total: number;
  currentPage: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onViewDetails: (trademark: TrademarkResult) => void;
  onAddToPortfolio: (trademark: TrademarkResult) => void;
  onDownloadDocuments: (trademark: TrademarkResult) => void;
  onLinkToClient?: (trademark: TrademarkResult) => void;
  onAddTrademark?: (serialNumber: string) => Promise<{ success: boolean; error?: string; trademarkName?: string }>;
  isLoading?: boolean;
}

const TrademarkResultsTable: React.FC<TrademarkResultsTableProps> = ({
  results,
  total,
  currentPage,
  pageSize,
  onPageChange,
  onViewDetails,
  onAddToPortfolio,
  onDownloadDocuments,
  onLinkToClient,
  onAddTrademark,
  isLoading = false
}) => {
  const { toast } = useToast();
  const [documentViewerOpen, setDocumentViewerOpen] = useState(false);
  const [selectedTrademark, setSelectedTrademark] = useState<TrademarkResult | null>(null);
  const [addTrademarkModalOpen, setAddTrademarkModalOpen] = useState(false);

  if (isLoading) {
    return <TrademarkResultsSkeleton />;
  }

  const totalPages = Math.ceil(total / pageSize);

  const handleViewDocuments = (trademark: TrademarkResult) => {
    setSelectedTrademark(trademark);
    setDocumentViewerOpen(true);
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
      registered: 'default',
      pending: 'secondary',
      abandoned: 'destructive',
      cancelled: 'destructive',
      opposition: 'outline'
    };

    const colors: Record<string, string> = {
      registered: 'bg-green-100 text-green-800',
      pending: 'bg-yellow-100 text-yellow-800',
      abandoned: 'bg-red-100 text-red-800',
      cancelled: 'bg-red-100 text-red-800',
      opposition: 'bg-orange-100 text-orange-800'
    };

    return (
      <Badge variant={variants[status] || 'outline'} className={colors[status] || ''}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  return (
    <>
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Trademark Search Results</span>
          <div className="flex items-center gap-3">
            <span className="text-sm font-normal text-muted-foreground">
              {total.toLocaleString()} results found
            </span>
            {onAddTrademark && (
              <Button
                size="sm"
                onClick={() => setAddTrademarkModalOpen(true)}
                className="h-8"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Trademark
              </Button>
            )}
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[120px]">Serial Number</TableHead>
                <TableHead>Mark</TableHead>
                <TableHead>Owner</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-[140px]">Renewal Status</TableHead>
                <TableHead>Filing Date</TableHead>
                <TableHead>Class</TableHead>
                <TableHead>Client/Matter</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {results.map((trademark) => (
                <TableRow key={trademark.id}>
                  <TableCell className="font-medium">
                    {trademark.serialNumber}
                    {trademark.registrationNumber && (
                      <div className="text-xs text-muted-foreground">
                        Reg: {trademark.registrationNumber}
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{trademark.mark}</div>
                      <div className="text-xs text-muted-foreground line-clamp-1">
                        {trademark.description}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">{trademark.owner}</div>
                    {trademark.attorney && (
                      <div className="text-xs text-muted-foreground">
                        Attorney: {trademark.attorney}
                      </div>
                    )}
                  </TableCell>
                  <TableCell>{getStatusBadge(trademark.status)}</TableCell>
                  <TableCell>
                    <RenewalStatusBadge trademark={trademark} size="sm" />
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      {new Date(trademark.filingDate).toLocaleDateString()}
                    </div>
                    {trademark.registrationDate && (
                      <div className="text-xs text-muted-foreground">
                        Reg: {new Date(trademark.registrationDate).toLocaleDateString()}
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {trademark.class.slice(0, 3).map((cls, index) => (
                        <Badge key={`class-${cls}-${index}`} variant="outline" className="text-xs">
                          {cls}
                        </Badge>
                      ))}
                      {trademark.class.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{trademark.class.length - 3}
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    {trademark.clientId ? (
                      <div className="flex items-center gap-1">
                        <Building className="h-3 w-3 text-green-600" />
                        <div>
                          <div className="text-xs font-medium text-green-700">Linked</div>
                          {trademark.matterId && (
                            <div className="text-xs text-muted-foreground">Matter assigned</div>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <Building className="h-3 w-3" />
                        <span className="text-xs">Not linked</span>
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center gap-1 justify-end">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleViewDocuments(trademark)}
                        title="View TSDR Documents"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={async () => {
                          try {
                            await openTrademarkHTMLView(trademark, {
                              windowTitle: `USPTO HTML - ${trademark.mark}`,
                              includeMetadata: true,
                              includeRawData: true
                            });
                          } catch (error: any) {
                            console.error('HTML view failed:', error);
                            toast({
                              title: "HTML View Failed",
                              description: error.message || "Failed to load HTML view. Please try again.",
                              variant: "destructive"
                            });
                          }
                        }}
                        title="View HTML Report"
                      >
                        <FileText className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={async () => {
                          try {
                            await downloadTrademarkPDF(trademark);
                            toast({
                              title: "Download Complete",
                              description: `PDF downloaded for ${trademark.mark}`,
                            });
                          } catch (error: any) {
                            console.error('PDF download failed:', error);
                            toast({
                              title: "Download Failed",
                              description: error.message || "Failed to download PDF. Please try again.",
                              variant: "destructive"
                            });
                          }
                        }}
                        title="Download PDF"
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                      {onLinkToClient && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => onLinkToClient(trademark)}
                          title={trademark.clientId ? "Manage Client Link" : "Link to Client"}
                        >
                          <Link className="h-4 w-4" />
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => onAddToPortfolio(trademark)}
                        title="Add to Portfolio"
                      >
                        <FolderPlus className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between space-x-2 py-4">
            <div className="text-sm text-muted-foreground">
              Showing {((currentPage - 1) * pageSize) + 1} to{' '}
              {Math.min(currentPage * pageSize, total)} of {total} results
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
              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const page = i + 1;
                  return (
                    <Button
                      key={page}
                      variant={page === currentPage ? "default" : "outline"}
                      size="sm"
                      onClick={() => onPageChange(page)}
                    >
                      {page}
                    </Button>
                  );
                })}
                {totalPages > 5 && <span className="px-2">...</span>}
                {totalPages > 5 && (
                  <Button
                    variant={totalPages === currentPage ? "default" : "outline"}
                    size="sm"
                    onClick={() => onPageChange(totalPages)}
                  >
                    {totalPages}
                  </Button>
                )}
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
    </Card>

    {/* TSDR Document Viewer Modal */}
    {selectedTrademark && (
      <TSDRDocumentViewer
        isOpen={documentViewerOpen}
        onClose={() => setDocumentViewerOpen(false)}
        trademark={selectedTrademark}
        onDownload={(document) => {
          // Handle document download through the parent component
          if (selectedTrademark.serialNumber) {
            onDownloadDocuments(selectedTrademark);
          }
        }}
      />
    )}

    {/* Add Trademark Modal */}
    {onAddTrademark && (
      <AddTrademarkModal
        isOpen={addTrademarkModalOpen}
        onClose={() => setAddTrademarkModalOpen(false)}
        onAddTrademark={onAddTrademark}
      />
    )}
  </>
  );
};

export default TrademarkResultsTable;