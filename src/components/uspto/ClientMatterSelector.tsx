import React, { useState, useEffect } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Building, 
  User, 
  FileText, 
  Clock,
  DollarSign,
  X
} from 'lucide-react';
import { ClientMatterOption } from '@/types/uspto';
import { ClientService } from '@/services/clientService';
import { MatterService } from '@/services/matterService';

interface ClientMatterSelectorProps {
  clientId?: string;
  matterId?: string;
  onClientChange: (clientId: string | undefined) => void;
  onMatterChange: (matterId: string | undefined) => void;
  onLink?: () => void;
  onUnlink?: () => void;
  isLinked?: boolean;
  showLinkControls?: boolean;
  disabled?: boolean;
  className?: string;
}

const ClientMatterSelector: React.FC<ClientMatterSelectorProps> = ({
  clientId,
  matterId,
  onClientChange,
  onMatterChange,
  onLink,
  onUnlink,
  isLinked = false,
  showLinkControls = true,
  disabled = false,
  className = ''
}) => {
  const [clients, setClients] = useState<ClientMatterOption[]>([]);
  const [matters, setMatters] = useState<ClientMatterOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedClient, setSelectedClient] = useState<ClientMatterOption | null>(null);
  const [selectedMatter, setSelectedMatter] = useState<ClientMatterOption | null>(null);

  // Load clients on component mount
  useEffect(() => {
    loadClients();
  }, []);

  // Load matters when client is selected
  useEffect(() => {
    if (clientId) {
      loadMatters(clientId);
      const client = clients.find(c => c.id === clientId);
      setSelectedClient(client || null);
    } else {
      setMatters([]);
      setSelectedClient(null);
    }
  }, [clientId, clients]);

  // Set selected matter when matterId changes
  useEffect(() => {
    if (matterId) {
      const matter = matters.find(m => m.id === matterId);
      setSelectedMatter(matter || null);
    } else {
      setSelectedMatter(null);
    }
  }, [matterId, matters]);

  const loadClients = async () => {
    setLoading(true);
    try {
      const clientsData = await ClientService.getAll();
      const formattedClients: ClientMatterOption[] = clientsData.map(client => ({
        id: client.id,
        name: client.name,
        type: 'client',
        active: client.status === 'active'
      }));
      setClients(formattedClients);
    } catch (error) {
      console.error('Failed to load clients:', error);
      // Use mock data for development
      setClients([
        { id: '1', name: 'TechCorp Industries', type: 'client', active: true },
        { id: '2', name: 'StartupLegal LLC', type: 'client', active: true },
        { id: '3', name: 'Global Manufacturing', type: 'client', active: true },
        { id: '4', name: 'Healthcare Innovations', type: 'client', active: true }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const loadMatters = async (clientId: string) => {
    setLoading(true);
    try {
      const mattersData = await MatterService.getMatters({ clientId });
      const formattedMatters: ClientMatterOption[] = mattersData.map(matter => ({
        id: matter.id,
        name: matter.title,
        type: 'matter',
        clientId: matter.clientId,
        active: matter.status === 'active'
      }));
      setMatters(formattedMatters);
    } catch (error) {
      console.error('Failed to load matters:', error);
      // Use mock data for development
      const mockMatters: ClientMatterOption[] = [
        { id: '1', name: 'Patent Portfolio Review', type: 'matter', clientId, active: true },
        { id: '2', name: 'Trademark Registration', type: 'matter', clientId, active: true },
        { id: '3', name: 'IP Due Diligence', type: 'matter', clientId, active: true },
        { id: '4', name: 'Contract Negotiation', type: 'matter', clientId, active: true }
      ];
      setMatters(mockMatters);
    } finally {
      setLoading(false);
    }
  };

  const handleClientChange = (value: string) => {
    if (value === 'none') {
      onClientChange(undefined);
      onMatterChange(undefined);
      return;
    }
    onClientChange(value);
    onMatterChange(undefined); // Reset matter when client changes
  };

  const handleMatterChange = (value: string) => {
    if (value === 'none') {
      onMatterChange(undefined);
      return;
    }
    onMatterChange(value);
  };

  const handleClear = () => {
    onClientChange(undefined);
    onMatterChange(undefined);
  };

  return (
    <Card className={`${className} ${isLinked ? 'border-green-200 bg-green-50/50' : ''}`}>
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2">
            <Building className="h-4 w-4" />
            Client & Matter Assignment
          </div>
          {(clientId || matterId) && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleClear}
              disabled={disabled}
              className="h-6 w-6 p-0"
            >
              <X className="h-3 w-3" />
            </Button>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Client Selection */}
        <div className="space-y-2">
          <Label htmlFor="client-select" className="text-xs font-medium">
            Client
          </Label>
          <Select 
            value={clientId || 'none'} 
            onValueChange={handleClientChange}
            disabled={disabled || loading}
          >
            <SelectTrigger id="client-select">
              <SelectValue placeholder="Select a client..." />
            </SelectTrigger>
            <SelectContent className="max-h-[200px]" sideOffset={4}>
              <SelectItem value="none">No client selected</SelectItem>
              {clients.map((client) => (
                <SelectItem key={client.id} value={client.id}>
                  <div className="flex items-center gap-2">
                    <Building className="h-3 w-3" />
                    {client.name}
                    {!client.active && (
                      <Badge variant="secondary" className="text-xs">Inactive</Badge>
                    )}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Matter Selection */}
        <div className="space-y-2">
          <Label htmlFor="matter-select" className="text-xs font-medium">
            Matter (Optional)
          </Label>
          <Select 
            value={matterId || 'none'} 
            onValueChange={handleMatterChange}
            disabled={disabled || loading || !clientId}
          >
            <SelectTrigger id="matter-select">
              <SelectValue placeholder={clientId ? "Select a matter..." : "Select client first"} />
            </SelectTrigger>
            <SelectContent className="max-h-[200px]" sideOffset={4}>
              <SelectItem value="none">No matter selected</SelectItem>
              {matters.map((matter) => (
                <SelectItem key={matter.id} value={matter.id}>
                  <div className="flex items-center gap-2">
                    <FileText className="h-3 w-3" />
                    {matter.name}
                    {!matter.active && (
                      <Badge variant="secondary" className="text-xs">Inactive</Badge>
                    )}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Selected Client/Matter Display */}
        {(selectedClient || selectedMatter) && (
          <>
            <Separator />
            <div className="space-y-3">
              <div className="text-xs font-medium text-muted-foreground">Selected Assignment</div>
              
              {selectedClient && (
                <div className="flex items-center gap-2 p-2 bg-muted/50 rounded-md">
                  <Building className="h-4 w-4 text-muted-foreground" />
                  <div className="flex-1">
                    <div className="text-sm font-medium">{selectedClient.name}</div>
                    <div className="text-xs text-muted-foreground">Client</div>
                  </div>
                </div>
              )}

              {selectedMatter && (
                <div className="flex items-center gap-2 p-2 bg-muted/50 rounded-md">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  <div className="flex-1">
                    <div className="text-sm font-medium">{selectedMatter.name}</div>
                    <div className="text-xs text-muted-foreground">Matter</div>
                  </div>
                </div>
              )}
            </div>
          </>
        )}

        {/* Link Controls */}
        {showLinkControls && (clientId || matterId) && (
          <>
            <Separator />
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {isLinked ? (
                  <>
                    <div className="flex items-center gap-1">
                      <div className="h-2 w-2 bg-green-500 rounded-full" />
                      <span className="text-xs text-green-700">Linked for billing</span>
                    </div>
                  </>
                ) : (
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">Ready to link</span>
                  </div>
                )}
              </div>
              
              <div className="flex gap-2">
                {!isLinked && onLink && (
                  <Button 
                    size="sm" 
                    onClick={onLink}
                    disabled={disabled}
                    className="h-7 text-xs"
                  >
                    <DollarSign className="h-3 w-3 mr-1" />
                    Link for Billing
                  </Button>
                )}
                
                {isLinked && onUnlink && (
                  <Button 
                    size="sm" 
                    variant="outline" 
                    onClick={onUnlink}
                    disabled={disabled}
                    className="h-7 text-xs"
                  >
                    Unlink
                  </Button>
                )}
              </div>
            </div>
          </>
        )}

        {/* Billing Info */}
        {isLinked && (clientId || matterId) && (
          <div className="text-xs text-muted-foreground bg-green-50 p-2 rounded-md border border-green-200">
            <div className="flex items-center gap-1 mb-1">
              <DollarSign className="h-3 w-3" />
              <span className="font-medium">Billable Activity</span>
            </div>
            <div>USPTO searches and document reviews for this assignment will be tracked for billing purposes.</div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ClientMatterSelector;