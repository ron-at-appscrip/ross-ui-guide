import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Client } from '@/types/client';
import { useToast } from '@/hooks/use-toast';
import { useClientDetailShortcuts } from '@/hooks/useKeyboardShortcuts';
import KeyboardShortcutsHelp from '@/components/ui/keyboard-shortcuts-help';
import ClientHeader from '@/components/clients/detail/ClientHeader';
import ClientBasicInfo from '@/components/clients/detail/ClientBasicInfo';
import ClientQuickStats from '@/components/clients/detail/ClientQuickStats';
import ClientActions from '@/components/clients/detail/ClientActions';
import ClientContactInfo from '@/components/clients/detail/ClientContactInfo';
import ClientOverview from '@/components/clients/detail/ClientOverview';
import ClientMatters from '@/components/clients/detail/ClientMatters';
import ClientBilling from '@/components/clients/detail/ClientBilling';
import ClientDocuments from '@/components/clients/detail/ClientDocuments';
import ClientCommunications from '@/components/clients/detail/ClientCommunications';
import ClientBusinessIntelligence from '@/components/clients/detail/ClientBusinessIntelligence';
import EditClientModal from '@/components/clients/EditClientModal';
import AddMatterModal from '@/components/matters/AddMatterModal';
import ClientService from '@/services/clientService';

const ClientDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [client, setClient] = useState<Client | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('matters');
  const [showEditModal, setShowEditModal] = useState(false);
  const [showNewMatterModal, setShowNewMatterModal] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadClient();
  }, [id]);

  const loadClient = async () => {
    if (!id) {
      navigate('/dashboard/clients');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      // Load client from service
      console.log('🔍 Loading client with ID:', id);
      const clientData = await ClientService.getClientById(id);
      console.log('✅ Client data loaded:', clientData);
      
      if (!clientData) {
        toast({
          title: "Client not found",
          description: "The requested client could not be found.",
          variant: "destructive",
        });
        navigate('/dashboard/clients');
        return;
      }

      setClient(clientData);
    } catch (error) {
      console.error('Error loading client:', error);
      setError('Failed to load client details. Please try again.');
      toast({
        title: "Error",
        description: "Failed to load client details. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateClient = async (updatedClient: Client) => {
    try {
      // Update client through service
      await ClientService.updateClient(updatedClient.id, updatedClient);
      setClient(updatedClient);
      setShowEditModal(false);
      toast({
        title: "Success",
        description: "Client updated successfully.",
      });
    } catch (error) {
      console.error('Error updating client:', error);
      toast({
        title: "Error",
        description: "Failed to update client. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteClient = async () => {
    if (!client) return;

    try {
      await ClientService.deleteClient(client.id);
      toast({
        title: "Success", 
        description: "Client deleted successfully.",
      });
      navigate('/dashboard/clients');
    } catch (error) {
      console.error('Error deleting client:', error);
      toast({
        title: "Error",
        description: "Failed to delete client. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleAddMatter = () => {
    setShowNewMatterModal(true);
  };

  const handleNewMatter = async (matterData: any) => {
    try {
      // Handle new matter creation
      console.log('Creating new matter:', matterData);
      setShowNewMatterModal(false);
      toast({
        title: "Success",
        description: "Matter created successfully.",
      });
    } catch (error) {
      console.error('Error creating matter:', error);
      toast({
        title: "Error",
        description: "Failed to create matter. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Set up keyboard shortcuts (disabled temporarily to fix hook issue)
  // useClientDetailShortcuts({
  //   onEdit: () => client && setShowEditModal(true),
  //   onNewMatter: () => client && setShowNewMatterModal(true),
  //   onSwitchTab: (tab: string) => setActiveTab(tab),
  //   isEnabled: !!client && !showEditModal && !showNewMatterModal
  // });

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-64 bg-gray-200 rounded mb-4"></div>
          <div className="h-96 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (error || !client) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="p-8 text-center">
            <h2 className="text-2xl font-bold mb-4">Client Not Found</h2>
            <p className="text-gray-600 mb-6">
              {error || "The requested client could not be found."}
            </p>
            <button
              onClick={() => navigate('/dashboard/clients')}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Back to Clients
            </button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <ClientHeader client={client} />
      
      <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main content area */}
        <div className="lg:col-span-2 space-y-6">
          <ClientBasicInfo client={client} />
          <ClientQuickStats client={client} />
        </div>
        
        {/* Side actions panel */}
        <div className="lg:col-span-1">
          <Card className="p-4 sticky top-4">
            <ClientActions 
              client={client}
              onEdit={() => setShowEditModal(true)}
              onDelete={handleDeleteClient}
              onNewMatter={handleAddMatter}
            />
          </Card>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full mt-8">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="matters">Matters</TabsTrigger>
          <TabsTrigger value="billing">Billing</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
          <TabsTrigger value="communications">Communications</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <ClientOverview client={client} />
          <ClientContactInfo client={client} />
        </TabsContent>

        <TabsContent value="matters" className="space-y-6">
          <ClientMatters clientId={client.id} onNewMatter={handleAddMatter} />
        </TabsContent>

        <TabsContent value="billing" className="space-y-6">
          <ClientBilling clientId={client.id} />
        </TabsContent>

        <TabsContent value="documents" className="space-y-6">
          <ClientDocuments clientId={client.id} />
        </TabsContent>

        <TabsContent value="communications" className="space-y-6">
          <ClientCommunications clientId={client.id} />
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <ClientBusinessIntelligence client={client} />
        </TabsContent>
      </Tabs>

      {showEditModal && (
        <EditClientModal
          client={client}
          isOpen={showEditModal}
          onClose={() => setShowEditModal(false)}
          onSave={handleUpdateClient}
        />
      )}

      {showNewMatterModal && (
        <AddMatterModal
          clientId={client.id}
          isOpen={showNewMatterModal}
          onClose={() => setShowNewMatterModal(false)}
          onAdd={handleNewMatter}
        />
      )}

      <KeyboardShortcutsHelp />
    </div>
  );
};

export default ClientDetail;