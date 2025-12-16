import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Building, 
  FileText, 
  Link, 
  X,
  DollarSign,
  Clock
} from 'lucide-react';
import ClientMatterSelector from './ClientMatterSelector';
import { TrademarkResult, PatentResult } from '@/types/uspto';

interface ClientMatterLinkModalProps {
  isOpen: boolean;
  onClose: () => void;
  asset: TrademarkResult | PatentResult | null;
  assetType: 'patent' | 'trademark';
  onLink: (assetId: string, clientId: string, matterId?: string) => Promise<void>;
  onUnlink: (assetId: string) => Promise<void>;
  isLoading?: boolean;
}

const ClientMatterLinkModal: React.FC<ClientMatterLinkModalProps> = ({
  isOpen,
  onClose,
  asset,
  assetType,
  onLink,
  onUnlink,
  isLoading = false
}) => {
  const [selectedClientId, setSelectedClientId] = useState<string | undefined>(asset?.clientId);
  const [selectedMatterId, setSelectedMatterId] = useState<string | undefined>(asset?.matterId);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isLinked = Boolean(asset?.clientId);
  const hasChanges = selectedClientId !== asset?.clientId || selectedMatterId !== asset?.matterId;

  const handleLink = async () => {
    if (!asset || !selectedClientId) return;
    
    setIsSubmitting(true);
    try {
      await onLink(asset.id, selectedClientId, selectedMatterId);
      onClose();
    } catch (error) {
      console.error('Failed to link asset:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUnlink = async () => {
    if (!asset) return;
    
    setIsSubmitting(true);
    try {
      await onUnlink(asset.id);
      setSelectedClientId(undefined);
      setSelectedMatterId(undefined);
      onClose();
    } catch (error) {
      console.error('Failed to unlink asset:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!hasChanges) {
      onClose();
      return;
    }
    
    // Reset to original values on close if there are unsaved changes
    setSelectedClientId(asset?.clientId);
    setSelectedMatterId(asset?.matterId);
    onClose();
  };

  const getAssetTitle = () => {
    if (!asset) return '';
    
    if (assetType === 'patent') {
      const patent = asset as PatentResult;
      return patent.title || `Patent ${patent.patentNumber}`;
    } else {
      const trademark = asset as TrademarkResult;
      return trademark.mark || `Trademark ${trademark.serialNumber}`;
    }
  };

  const getAssetNumber = () => {
    if (!asset) return '';
    
    if (assetType === 'patent') {
      const patent = asset as PatentResult;
      return patent.patentNumber;
    } else {
      const trademark = asset as TrademarkResult;
      return trademark.serialNumber;
    }
  };

  if (!asset) return null;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[85vh] flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle className="flex items-center gap-2">
            <Link className="h-5 w-5" />
            {isLinked ? 'Manage Client Link' : 'Link to Client & Matter'}
          </DialogTitle>
          <DialogDescription>
            {isLinked 
              ? 'Update or remove the client and matter assignment for this USPTO asset.'
              : 'Assign this USPTO asset to a client and matter for billing and organization purposes.'
            }
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto space-y-6 pr-2">
          {/* Asset Information */}
          <div className="space-y-3">
            <h4 className="text-sm font-medium">USPTO Asset Details</h4>
            <div className="bg-muted/50 p-4 rounded-lg space-y-2">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-muted-foreground" />
                <div>
                  <div className="font-medium">{getAssetTitle()}</div>
                  <div className="text-sm text-muted-foreground">
                    {assetType === 'patent' ? 'Patent' : 'Trademark'} {getAssetNumber()}
                  </div>
                </div>
              </div>
              
              {isLinked && (
                <div className="flex items-center gap-2 pt-2">
                  <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                    <Building className="h-3 w-3 mr-1" />
                    Currently Linked
                  </Badge>
                  {asset.linkedAt && (
                    <span className="text-xs text-muted-foreground">
                      Linked {new Date(asset.linkedAt).toLocaleDateString()}
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>

          <Separator />

          {/* Client/Matter Selector */}
          <ClientMatterSelector
            clientId={selectedClientId}
            matterId={selectedMatterId}
            onClientChange={setSelectedClientId}
            onMatterChange={setSelectedMatterId}
            disabled={isLoading || isSubmitting}
            showLinkControls={false}
          />

          {/* Billing Information */}
          {selectedClientId && (
            <>
              <Separator />
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <div className="flex items-start gap-3">
                  <DollarSign className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div className="flex-1">
                    <h4 className="text-sm font-medium text-blue-900 mb-1">Billing Impact</h4>
                    <p className="text-sm text-blue-700">
                      Once linked, all USPTO activities for this asset (searches, document views, downloads) 
                      will be tracked as billable time and associated with this client
                      {selectedMatterId ? ' and matter' : ''}.
                    </p>
                    <div className="flex items-center gap-1 mt-2 text-xs text-blue-600">
                      <Clock className="h-3 w-3" />
                      <span>Time tracking will begin immediately after linking</span>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        <DialogFooter className="flex-shrink-0 flex items-center justify-between mt-6 pt-4 border-t">
          <div className="flex gap-2">
            {isLinked && (
              <Button 
                variant="outline" 
                onClick={handleUnlink}
                disabled={isLoading || isSubmitting}
                className="text-red-600 hover:text-red-700"
              >
                <X className="h-4 w-4 mr-2" />
                Unlink
              </Button>
            )}
          </div>
          
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              onClick={handleClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleLink}
              disabled={!selectedClientId || isLoading || isSubmitting || !hasChanges}
            >
              {isSubmitting ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-background mr-2"></div>
              ) : (
                <Link className="h-4 w-4 mr-2" />
              )}
              {isLinked ? 'Update Link' : 'Link Asset'}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ClientMatterLinkModal;