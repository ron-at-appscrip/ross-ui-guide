export type ActivityType = 
  | 'CREATE'
  | 'UPDATE'
  | 'DELETE'
  | 'VIEW'
  | 'LOGIN'
  | 'LOGOUT'
  | 'SIGNUP'
  | 'PROFILE_UPDATE'
  | 'PASSWORD_CHANGE'
  | 'EMAIL_VERIFICATION';

export type EntityType = 
  | 'USER'
  | 'PROFILE'
  | 'CLIENT'
  | 'MATTER'
  | 'DOCUMENT'
  | 'WIZARD_DATA';

export interface ActivityLog {
  id: string;
  user_id: string;
  activity_type: ActivityType;
  entity_type: EntityType;
  entity_id?: string;
  entity_name?: string;
  description: string;
  metadata?: Record<string, unknown>;
  ip_address?: string;
  user_agent?: string;
  session_id?: string;
  created_at: string;
}

export interface EntityChange {
  id: string;
  activity_log_id: string;
  field_name: string;
  old_value?: unknown;
  new_value?: unknown;
  created_at: string;
}

export interface ActivityLogWithChanges extends ActivityLog {
  changes?: EntityChange[];
}

export interface Client {
  id: string;
  user_id: string;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  zip_code?: string;
  country?: string;
  client_type: 'individual' | 'corporate';
  company_name?: string;
  industry?: string;
  notes?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Matter {
  id: string;
  user_id: string;
  client_id: string;
  matter_number: string;
  title: string;
  description?: string;
  practice_area: string;
  status: 'open' | 'closed' | 'pending' | 'on_hold';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  estimated_hours?: number;
  hourly_rate?: number;
  total_billed?: number;
  date_opened?: string;
  date_closed?: string;
  assigned_attorney?: string;
  notes?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  client?: Client; // For joins
}

export interface Document {
  id: string;
  user_id: string;
  client_id?: string;
  matter_id?: string;
  filename: string;
  original_filename: string;
  file_path: string;
  file_size: number;
  mime_type: string;
  document_type?: string;
  description?: string;
  tags?: string[];
  is_confidential: boolean;
  version_number: number;
  parent_document_id?: string;
  created_at: string;
  updated_at: string;
  client?: Client; // For joins
  matter?: Matter; // For joins
}

export interface ActivityLogParams {
  activity_type: ActivityType;
  entity_type: EntityType;
  entity_id?: string;
  entity_name?: string;
  description: string;
  metadata?: Record<string, unknown>;
  ip_address?: string;
  user_agent?: string;
  session_id?: string;
}

export interface EntityChangeParams {
  field_name: string;
  old_value?: unknown;
  new_value?: unknown;
}

export interface ActivityLogFilter {
  activity_types?: ActivityType[];
  entity_types?: EntityType[];
  entity_id?: string;
  start_date?: string;
  end_date?: string;
  search_term?: string;
  limit?: number;
  offset?: number;
}