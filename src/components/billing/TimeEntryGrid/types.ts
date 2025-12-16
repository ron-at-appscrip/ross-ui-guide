// Shared types for TimeEntryGrid components
export interface EditFormData {
  matterId?: string;
  description?: string;
  hours?: number;
  rate?: number;
  amount?: number;
}

export interface Matter {
  id: string;
  title: string;
  clientName: string;
  practiceArea: string;
  hourlyRate?: number;
}

export type StatusVariant = 'draft' | 'submitted' | 'billed' | 'paid';