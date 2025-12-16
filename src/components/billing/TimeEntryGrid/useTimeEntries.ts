import { useState, useEffect, useCallback } from 'react';
import { TimeEntry } from '@/types/billing';
import { BillingService } from '@/services/billingService';
import { useToast } from '@/components/ui/use-toast';
import { EditFormData, Matter } from './types';

export const useTimeEntries = () => {
  const [entries, setEntries] = useState<TimeEntry[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editFormData, setEditFormData] = useState<EditFormData>({});
  const [isLoading, setIsLoading] = useState(true);
  const [matters, setMatters] = useState<Matter[]>([]);
  const { toast } = useToast();

  const loadTimeEntries = useCallback(async () => {
    try {
      setIsLoading(true);
      const timeEntries = await BillingService.getTimeEntries();
      setEntries(timeEntries);
    } catch (error) {
      console.error('Error loading time entries:', error);
      toast({
        title: "Error loading time entries",
        description: "Unable to load time entries. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  const loadMatters = useCallback(async () => {
    try {
      const mattersList = await BillingService.getMattersForTimeEntry();
      setMatters(mattersList);
    } catch (error) {
      console.error('Error loading matters:', error);
    }
  }, []);

  useEffect(() => {
    loadTimeEntries();
    loadMatters();
  }, [loadTimeEntries, loadMatters]);

  const handleEdit = useCallback((id: string) => {
    const entry = entries.find(e => e.id === id);
    if (entry) {
      setEditFormData({
        matterId: entry.matterId,
        description: entry.description,
        hours: entry.hours,
        rate: entry.rate,
        amount: entry.amount
      });
    }
    setEditingId(id);
  }, [entries]);

  const handleSave = useCallback(async (id: string) => {
    try {
      const formData = editFormData;
      const hours = parseFloat(String(formData.hours)) || 0;
      const rate = parseFloat(String(formData.rate)) || 0;
      const amount = hours * rate;
      
      const updatedEntry = {
        ...entries.find(e => e.id === id)!,
        matterId: formData.matterId!,
        description: formData.description!,
        hours,
        rate,
        amount
      };
      
      await BillingService.updateTimeEntry(id, updatedEntry);
      setEntries(prevEntries => prevEntries.map(e => e.id === id ? updatedEntry : e));
      setEditingId(null);
      setEditFormData({});
      
      toast({
        title: "Time entry saved",
        description: "Your changes have been saved successfully."
      });
    } catch (error) {
      console.error('Error saving time entry:', error);
      toast({
        title: "Error saving entry",
        description: "Please try again.",
        variant: "destructive"
      });
    }
  }, [editFormData, entries, toast]);

  const handleDelete = useCallback(async (id: string) => {
    try {
      await BillingService.deleteTimeEntry(id);
      setEntries(prevEntries => prevEntries.filter(entry => entry.id !== id));
      toast({
        title: "Time entry deleted",
        description: "The time entry has been removed."
      });
    } catch (error) {
      console.error('Error deleting time entry:', error);
      toast({
        title: "Error deleting entry",
        description: "Please try again.",
        variant: "destructive"
      });
    }
  }, [toast]);

  const addNewEntry = useCallback(async () => {
    if (matters.length === 0) {
      toast({
        title: "No matters available",
        description: "Please create a matter first before adding time entries.",
        variant: "destructive"
      });
      return;
    }

    try {
      const firstMatter = matters[0];
      const rate = firstMatter.hourlyRate || 350;
      const hours = 0;
      const newEntry = await BillingService.createTimeEntry({
        matterId: firstMatter.id,
        matterTitle: firstMatter.title,
        clientId: '',
        clientName: firstMatter.clientName,
        description: '',
        hours,
        rate,
        amount: hours * rate,
        date: new Date().toISOString().split('T')[0],
        status: 'draft',
        billable: true,
        activityType: 'general_work',
        tags: []
      });
      
      setEntries(prevEntries => [newEntry, ...prevEntries]);
      setEditingId(newEntry.id);
      
      setEditFormData({
        matterId: firstMatter.id,
        description: '',
        hours,
        rate,
        amount: hours * rate
      });
    } catch (error) {
      console.error('Error creating time entry:', error);
      toast({
        title: "Error creating entry",
        description: "Please try again.",
        variant: "destructive"
      });
    }
  }, [matters, toast]);

  const updateEditFormData = useCallback((updates: Partial<EditFormData>) => {
    setEditFormData(prev => ({ ...prev, ...updates }));
  }, []);

  return {
    entries,
    editingId,
    editFormData,
    isLoading,
    matters,
    handleEdit,
    handleSave,
    handleDelete,
    addNewEntry,
    updateEditFormData,
    setEditFormData
  };
};