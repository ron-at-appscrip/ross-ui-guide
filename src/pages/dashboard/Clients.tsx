import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import ClientFilters from '@/components/clients/ClientFilters';
import AddMatterModal from '@/components/matters/AddMatterModal';
import ClientsHeader from '@/components/clients/ClientsHeader';
import ClientsStats from '@/components/clients/ClientsStats';
import ClientsSearch from '@/components/clients/ClientsSearch';
import ClientsTable from '@/components/clients/ClientsTable';
import ClientsTableSkeleton from '@/components/clients/ClientsTableSkeleton';
import ClientsEmptyState from '@/components/clients/ClientsEmptyState';
import { Client } from '@/types/client';
import { NewMatterData } from '@/types/matter';
import ClientService from '@/services/clientService';
import ExportService from '@/services/exportService';
import { useToast } from '@/hooks/use-toast';
import { useServerSideSearch } from '@/hooks/useServerSideSearch';

// Mock clients data for development
const mockClients: Client[] = [
  {
    id: '1',
    name: 'John Smith',
    type: 'person',
    status: 'active',
    emails: [
      { id: 'e1', value: 'john.smith@email.com', type: 'work', isPrimary: true }
    ],
    phones: [
      { id: 'p1', value: '+1-555-0101', type: 'work', isPrimary: true }
    ],
    websites: [],
    addresses: [],
    primaryContact: 'John Smith',
    dateAdded: '2024-01-15',
    lastActivity: '2024-03-10',
    totalMatters: 3,
    activeMatters: 2,
    totalBilled: 125000,
    outstandingBalance: 15000,
    industry: 'Corporate',
    tags: ['Corporate Law', 'M&A']
  },
  {
    id: '2',
    name: 'Sarah Johnson',
    type: 'person',
    status: 'active',
    emails: [
      { id: 'e2', value: 'sarah.johnson@email.com', type: 'work', isPrimary: true }
    ],
    phones: [
      { id: 'p2', value: '+1-555-0102', type: 'work', isPrimary: true }
    ],
    websites: [],
    addresses: [],
    primaryContact: 'Sarah Johnson',
    dateAdded: '2024-02-20',
    lastActivity: '2024-11-15',
    totalMatters: 1,
    activeMatters: 1,
    totalBilled: 12750,
    outstandingBalance: 5000,
    industry: 'Personal',
    tags: ['Family Law']
  },
  {
    id: '3',
    name: 'TechCorp Solutions',
    type: 'company',
    status: 'active',
    emails: [
      { id: 'e3', value: 'contact@techcorp.com', type: 'work', isPrimary: true }
    ],
    phones: [
      { id: 'p3', value: '+1-555-0104', type: 'work', isPrimary: true }
    ],
    websites: [],
    addresses: [],
    primaryContact: 'Tech Manager',
    dateAdded: '2024-01-10',
    lastActivity: '2024-12-03',
    totalMatters: 1,
    activeMatters: 1,
    totalBilled: 28500,
    outstandingBalance: 8500,
    industry: 'Technology',
    tags: ['Employment Law']
  },
  {
    id: '4',
    name: 'Michael Brown',
    type: 'person',
    status: 'active',
    emails: [
      { id: 'e4', value: 'michael.brown@email.com', type: 'work', isPrimary: true }
    ],
    phones: [
      { id: 'p4', value: '+1-555-0105', type: 'work', isPrimary: true }
    ],
    websites: [],
    addresses: [],
    primaryContact: 'Michael Brown',
    dateAdded: '2024-10-15',
    lastActivity: '2024-12-04',
    totalMatters: 1,
    activeMatters: 1,
    totalBilled: 15750,
    outstandingBalance: 2000,
    industry: 'Real Estate',
    tags: ['IP Law']
  },
  {
    id: '5',
    name: 'Global Manufacturing Inc',
    type: 'company',
    status: 'active',
    emails: [
      { id: 'e5', value: 'legal@globalmanufacturing.com', type: 'work', isPrimary: true }
    ],
    phones: [
      { id: 'p5', value: '+1-555-0106', type: 'work', isPrimary: true }
    ],
    websites: [],
    addresses: [],
    primaryContact: 'Legal Department',
    dateAdded: '2024-08-01',
    lastActivity: '2024-12-06',
    totalMatters: 2,
    activeMatters: 2,
    totalBilled: 84500,
    outstandingBalance: 12000,
    industry: 'Manufacturing',
    tags: ['Tax Law', 'Contract Disputes']
  },
  {
    id: '6',
    name: 'David Wilson',
    type: 'person',
    status: 'active',
    emails: [
      { id: 'e6', value: 'david.wilson@email.com', type: 'work', isPrimary: true }
    ],
    phones: [
      { id: 'p6', value: '+1-555-0109', type: 'work', isPrimary: true }
    ],
    websites: [],
    addresses: [],
    primaryContact: 'David Wilson',
    dateAdded: '2024-11-20',
    lastActivity: '2024-12-06',
    totalMatters: 1,
    activeMatters: 1,
    totalBilled: 8500,
    outstandingBalance: 8500,
    industry: 'Personal',
    tags: ['Criminal Defense']
  },
  {
    id: '7',
    name: 'Retail Ventures LLC',
    type: 'company',
    status: 'active',
    emails: [
      { id: 'e7', value: 'info@retailventures.com', type: 'work', isPrimary: true }
    ],
    phones: [
      { id: 'p7', value: '+1-555-0110', type: 'work', isPrimary: true }
    ],
    websites: [],
    addresses: [],
    primaryContact: 'Business Manager',
    dateAdded: '2024-08-15',
    lastActivity: '2024-12-02',
    totalMatters: 1,
    activeMatters: 1,
    totalBilled: 67500,
    outstandingBalance: 15000,
    industry: 'Retail',
    tags: ['Real Estate']
  },
  {
    id: '8',
    name: 'Lisa Garcia',
    type: 'person',
    status: 'active',
    emails: [
      { id: 'e8', value: 'lisa.garcia@email.com', type: 'work', isPrimary: true }
    ],
    phones: [
      { id: 'p8', value: '+1-555-0111', type: 'work', isPrimary: true }
    ],
    websites: [],
    addresses: [],
    primaryContact: 'Lisa Garcia',
    dateAdded: '2024-11-01',
    lastActivity: '2024-12-04',
    totalMatters: 1,
    activeMatters: 1,
    totalBilled: 5500,
    outstandingBalance: 3000,
    industry: 'Technology',
    tags: ['Immigration']
  },
  {
    id: '9',
    name: 'Healthcare Partners Group',
    type: 'company',
    status: 'active',
    emails: [
      { id: 'e9', value: 'legal@healthcarepartners.com', type: 'work', isPrimary: true }
    ],
    phones: [
      { id: 'p9', value: '+1-555-0113', type: 'work', isPrimary: true }
    ],
    websites: [],
    addresses: [],
    primaryContact: 'Legal Affairs',
    dateAdded: '2024-09-10',
    lastActivity: '2024-12-05',
    totalMatters: 3,
    activeMatters: 2,
    totalBilled: 95000,
    outstandingBalance: 22000,
    industry: 'Healthcare',
    tags: ['Healthcare Law', 'Compliance']
  },
  {
    id: '10',
    name: 'Financial Advisory Group',
    type: 'company',
    status: 'inactive',
    emails: [
      { id: 'e10', value: 'contact@financialadvisory.com', type: 'work', isPrimary: true }
    ],
    phones: [
      { id: 'p10', value: '+1-555-0112', type: 'work', isPrimary: true }
    ],
    websites: [],
    addresses: [],
    primaryContact: 'Advisory Team',
    dateAdded: '2024-07-01',
    lastActivity: '2024-11-30',
    totalMatters: 1,
    activeMatters: 0,
    totalBilled: 18500,
    outstandingBalance: 0,
    industry: 'Financial Services',
    tags: ['Estate Planning']
  }
];


const Clients = () => {
  const { toast } = useToast();
  const location = useLocation();
  const [showFilters, setShowFilters] = useState(false);
  const [showAddMatter, setShowAddMatter] = useState(false);
  const [selectedClientId, setSelectedClientId] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [typeFilter, setTypeFilter] = useState<'all' | 'person' | 'company'>('all');
  
  // State for clients
  const [clients, setClients] = useState<Client[]>([]);
  const [filteredClients, setFilteredClients] = useState<Client[]>([]);

  // Load clients on mount
  useEffect(() => {
    const loadClients = async () => {
      setLoading(true);
      try {
        console.log('🔍 Loading clients...');
        const loadedClients = await ClientService.getClients();
        console.log('✅ Clients loaded:', loadedClients.length, loadedClients);
        setClients(loadedClients);
        setFilteredClients(loadedClients);
      } catch (error) {
        console.error('❌ Error loading clients:', error);
        toast({
          title: "Error",
          description: "Failed to load clients. Please try again.",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    loadClients();
  }, []);

  // Filter clients based on search and filters
  useEffect(() => {
    let filtered = [...clients];
    
    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(client => 
        client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        client.emails.some(email => email.value.toLowerCase().includes(searchTerm.toLowerCase())) ||
        client.phones.some(phone => phone.value.includes(searchTerm)) ||
        client.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }
    
    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(client => client.status === statusFilter);
    }
    
    // Type filter
    if (typeFilter !== 'all') {
      filtered = filtered.filter(client => client.type === typeFilter);
    }
    
    setFilteredClients(filtered);
  }, [clients, searchTerm, statusFilter, typeFilter]);

  // Handle tab changes
  const handleTabChange = (tab: string) => {
    switch (tab) {
      case 'active':
        setStatusFilter('active');
        break;
      case 'inactive':
        setStatusFilter('inactive');
        break;
      case 'corporate':
      case 'company':
        setTypeFilter('company');
        setStatusFilter('all');
        break;
      case 'individual':
      case 'person':
        setTypeFilter('person');
        setStatusFilter('all');
        break;
      default:
        setStatusFilter('all');
        setTypeFilter('all');
    }
  };


  const handleNewMatter = (clientId: string) => {
    setSelectedClientId(clientId);
    setShowAddMatter(true);
  };

  const handleAddMatter = (matterData: NewMatterData) => {
    console.log('New matter created:', matterData);
    // In a real app, this would create the matter and update the client's matter count
    setShowAddMatter(false);
    setSelectedClientId('');
  };

  const handleBulkAction = async (action: 'delete' | 'export' | 'email' | 'archive', clientIds: string[]) => {
    const selectedClients = clients.filter(c => clientIds.includes(c.id));
    
    try {
      switch (action) {
        case 'export':
          ExportService.exportToCSV(selectedClients, `clients-${new Date().toISOString().split('T')[0]}.csv`);
          toast({
            title: "Export Successful",
            description: `Exported ${selectedClients.length} clients to CSV.`,
          });
          break;
          
        case 'email':
          // Extract primary emails from clients for email functionality
          const emailAddresses = selectedClients
            .map(client => {
              const primaryEmail = client.emails.find(e => e.isPrimary)?.value || client.emails[0]?.value;
              return primaryEmail;
            })
            .filter(Boolean);
          const clientNames = selectedClients.map(client => client.name);
          
          if (emailAddresses.length > 0) {
            const emailList = emailAddresses.join(';');
            const nameList = clientNames.join(', ');
            
            // Open default email client with pre-filled recipients
            window.location.href = `mailto:${emailList}?subject=Message from ${window.location.hostname}&body=Dear ${nameList},%0A%0A`;
            
            toast({
              title: "Email Client Opened",
              description: `Prepared email for ${emailAddresses.length} clients.`,
            });
          } else {
            toast({
              title: "No Email Addresses",
              description: "Selected clients don't have email addresses.",
              variant: "destructive",
            });
          }
          break;
          
        case 'archive':
          // Update clients to inactive status (mock implementation)
          const updatedClients = clients.map(client => 
            clientIds.includes(client.id) 
              ? { ...client, status: 'inactive' as const }
              : client
          );
          setClients(updatedClients);
          
          toast({
            title: "Clients Archived",
            description: `Successfully archived ${selectedClients.length} clients.`,
          });
          break;
          
        case 'delete':
          // Show confirmation dialog
          const confirmed = window.confirm(
            `Are you sure you want to delete ${selectedClients.length} client(s)? This action cannot be undone.`
          );
          
          if (confirmed) {
            for (const clientId of clientIds) {
              await ClientService.deleteClient(clientId);
            }
            
            // Remove deleted clients from state
            const remainingClients = clients.filter(client => !clientIds.includes(client.id));
            setClients(remainingClients);
            
            toast({
              title: "Clients Deleted",
              description: `Successfully deleted ${selectedClients.length} clients.`,
            });
          }
          break;
      }
    } catch (error) {
      console.error(`Error performing bulk ${action}:`, error);
      toast({
        title: "Error",
        description: `Failed to ${action} selected clients. Please try again.`,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-8">
      <ClientsHeader
        showFilters={showFilters}
        onToggleFilters={() => setShowFilters(!showFilters)}
      />

      {showFilters && (
        <ClientFilters onApplyFilters={(filters) => console.log('Filters:', filters)} />
      )}

      <div className="space-y-6">
        <ClientsStats clients={clients} />
        
        <ClientsSearch 
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
        />
      </div>

      {loading ? (
        <ClientsTableSkeleton />
      ) : filteredClients.length === 0 ? (
        <ClientsEmptyState 
          searchTerm={searchTerm}
          activeTab={statusFilter === 'active' ? 'active' : 
                     statusFilter === 'inactive' ? 'inactive' :
                     typeFilter === 'company' ? 'company' :
                     typeFilter === 'person' ? 'person' : 'all'}
        />
      ) : (
        <ClientsTable
          clients={filteredClients}
          activeTab={statusFilter === 'active' ? 'active' : 
                     statusFilter === 'inactive' ? 'inactive' :
                     typeFilter === 'company' ? 'corporate' :
                     typeFilter === 'person' ? 'individual' : 'all'}
          onTabChange={handleTabChange}
          currentPage={1}
          totalPages={1}
          onPageChange={() => {}}
          totalItems={filteredClients.length}
          onNewMatter={handleNewMatter}
          onBulkAction={handleBulkAction}
        />
      )}

      <AddMatterModal
        open={showAddMatter}
        onClose={() => {
          setShowAddMatter(false);
          setSelectedClientId('');
        }}
        onSubmit={handleAddMatter}
        clients={clients}
        selectedClientId={selectedClientId}
      />
    </div>
  );
};

export default Clients;
