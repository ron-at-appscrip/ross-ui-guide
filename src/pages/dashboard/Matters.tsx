
import React, { useState, useEffect } from 'react';
import MattersHeader from '@/components/matters/MattersHeader';
import MattersStats from '@/components/matters/MattersStats';
import MattersSearch from '@/components/matters/MattersSearch';
import MattersFilters from '@/components/matters/MattersFilters';
import MattersTable from '@/components/matters/MattersTable';
import AddMatterModal from '@/components/matters/AddMatterModal';
import { Matter, MatterFilters } from '@/types/matter';
import { Client } from '@/types/client';
import { MatterService } from '@/services/matterService';
import { ClientService } from '@/services/clientService';


const Matters = () => {
  const [matters, setMatters] = useState<Matter[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [showAddMatter, setShowAddMatter] = useState(false);
  const [filters, setFilters] = useState<MatterFilters>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load data function
  const loadData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // Load matters and clients in parallel
        const [mattersData] = await Promise.all([
          MatterService.getMatters(),
          loadClients()
        ]);
        
        setMatters(mattersData);
      } catch (err) {
        console.error('Error loading matters data:', err);
        setError('Failed to load matters. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

  // Load data on component mount
  useEffect(() => {
    loadData();
  }, []);

  // Load clients with fallback for mock data development
  const loadClients = async () => {
    try {
      // Try to load from ClientService, but fall back to empty array if auth is disabled
      const clientsData = await ClientService.getClients();
      setClients(clientsData);
    } catch (err) {
      // Fallback for development when auth is disabled
      console.warn('ClientService unavailable, using empty clients array:', err);
      setClients([]);
    }
  };

  // Apply search and filters
  const filteredMatters = React.useMemo(() => {
    if (searchTerm.trim()) {
      // Use MatterService search when there's a search term
      return matters.filter(matter => {
        const searchLower = searchTerm.toLowerCase();
        return matter.title.toLowerCase().includes(searchLower) ||
               matter.description.toLowerCase().includes(searchLower) ||
               matter.matterNumber?.toLowerCase().includes(searchLower) ||
               matter.clientName.toLowerCase().includes(searchLower) ||
               matter.practiceArea.toLowerCase().includes(searchLower) ||
               matter.tags.some(tag => tag.toLowerCase().includes(searchLower));
      });
    }

    // Apply filters
    return matters.filter(matter => {
      if (filters.status && filters.status.length > 0 && !filters.status.includes(matter.status)) {
        return false;
      }
      if (filters.priority && filters.priority.length > 0 && !filters.priority.includes(matter.priority)) {
        return false;
      }
      if (filters.practiceArea && filters.practiceArea.length > 0 && !filters.practiceArea.includes(matter.practiceArea)) {
        return false;
      }
      if (filters.responsibleAttorney && filters.responsibleAttorney.length > 0 && !filters.responsibleAttorney.includes(matter.responsibleAttorneyId)) {
        return false;
      }
      if (filters.clientId && matter.clientId !== filters.clientId) {
        return false;
      }
      if (filters.dateRange) {
        const matterDate = new Date(matter.dateOpened);
        const startDate = new Date(filters.dateRange.start);
        const endDate = new Date(filters.dateRange.end);
        if (matterDate < startDate || matterDate > endDate) {
          return false;
        }
      }
      return true;
    });
  }, [matters, searchTerm, filters]);

  const handleAddMatter = async (matterData: any) => {
    try {
      const newMatter = await MatterService.createMatter(matterData);
      console.log('New matter created:', newMatter);
      
      // Refresh matters list
      const updatedMatters = await MatterService.getMatters();
      setMatters(updatedMatters);
      
      setShowAddMatter(false);
    } catch (err) {
      console.error('Error creating matter:', err);
      setError('Failed to create matter. Please try again.');
    }
  };

  const handleApplyFilters = async (newFilters: MatterFilters) => {
    try {
      setIsLoading(true);
      setFilters(newFilters);
      
      // Get filtered matters from service
      const filteredMatters = await MatterService.getMatters(newFilters);
      setMatters(filteredMatters);
    } catch (err) {
      console.error('Error applying filters:', err);
      setError('Failed to apply filters. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearchChange = async (searchValue: string) => {
    setSearchTerm(searchValue);
    
    if (searchValue.trim()) {
      try {
        const searchResults = await MatterService.searchMatters(searchValue);
        setMatters(searchResults);
      } catch (err) {
        console.error('Error searching matters:', err);
      }
    } else {
      // Reset to all matters when search is cleared
      try {
        const allMatters = await MatterService.getMatters(filters);
        setMatters(allMatters);
      } catch (err) {
        console.error('Error loading matters:', err);
      }
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground">Loading matters...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-destructive">{error}</div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <MattersHeader
        showFilters={showFilters}
        onToggleFilters={() => setShowFilters(!showFilters)}
        onAddMatter={() => setShowAddMatter(true)}
      />

      {showFilters && (
        <MattersFilters onApplyFilters={handleApplyFilters} />
      )}

      <div className="space-y-6">
        <MattersStats matters={matters} />
        
        <MattersSearch 
          searchTerm={searchTerm}
          onSearchChange={handleSearchChange}
        />
      </div>

      <MattersTable matters={filteredMatters} title="All Matters" onMatterUpdate={loadData} />

      <AddMatterModal
        open={showAddMatter}
        onClose={() => setShowAddMatter(false)}
        onSubmit={handleAddMatter}
        clients={clients}
      />
    </div>
  );
};

export default Matters;
