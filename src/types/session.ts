export type SessionEventType = 'login' | 'logout' | 'refresh' | 'terminate';

export type OrganizationRole = 'owner' | 'admin' | 'member';

export interface Organization {
  id: string;
  name: string;
  slug: string;
  description?: string;
  logo_url?: string;
  settings: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface OrganizationMember {
  id: string;
  organization_id: string;
  user_id: string;
  role: OrganizationRole;
  invited_by?: string;
  invited_at: string;
  joined_at?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  
  // Joined data from queries
  organization?: Organization;
  user_email?: string;
  user_name?: string;
  invited_by_email?: string;
}

export interface SessionLog {
  id: string;
  session_id: string;
  user_id: string;
  organization_id?: string;
  event_type: SessionEventType;
  ip_address?: string;
  user_agent?: string;
  device_info: Record<string, unknown>;
  location_info: Record<string, unknown>;
  metadata: Record<string, unknown>;
  created_at: string;
}

export interface UserSession {
  session_id: string;
  user_id: string;
  user_email: string;
  user_name: string;
  last_sign_in_at?: string;
  created_at: string;
  updated_at: string;
  ip_address?: string;
  user_agent?: string;
  is_active: boolean;
  is_current?: boolean;
}

export interface SessionAnalytics {
  id: string;
  organization_id?: string;
  user_id: string;
  date: string;
  total_sessions: number;
  active_sessions: number;
  login_count: number;
  unique_devices: number;
  total_duration_minutes: number;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface DeviceInfo {
  browser?: string;
  browser_version?: string;
  os?: string;
  os_version?: string;
  device_type?: 'mobile' | 'tablet' | 'desktop';
  device_brand?: string;
  device_model?: string;
  is_mobile?: boolean;
  is_tablet?: boolean;
  is_desktop?: boolean;
}

export interface LocationInfo {
  country?: string;
  country_code?: string;
  region?: string;
  city?: string;
  timezone?: string;
  latitude?: number;
  longitude?: number;
  isp?: string;
}

export interface SessionFilter {
  organization_id?: string;
  user_id?: string;
  event_type?: SessionEventType;
  start_date?: string;
  end_date?: string;
  is_active?: boolean;
  search_term?: string;
  limit?: number;
  offset?: number;
}

export interface TeamSessionsResponse {
  sessions: UserSession[];
  total_count: number;
  has_more: boolean;
}

export interface SessionStats {
  total_sessions: number;
  active_sessions: number;
  total_users: number;
  active_users: number;
  recent_logins: number;
  devices_by_type: Record<string, number>;
  sessions_by_day: Array<{
    date: string;
    count: number;
  }>;
}

export interface CreateOrganizationRequest {
  name: string;
  slug: string;
  description?: string;
}

export interface InviteUserRequest {
  organization_id: string;
  user_email: string;
  role: OrganizationRole;
}

export interface SessionTerminateRequest {
  session_id: string;
  organization_id: string;
}

export interface SessionLogParams {
  session_id: string;
  user_id: string;
  event_type: SessionEventType;
  ip_address?: string;
  user_agent?: string;
  device_info?: DeviceInfo;
  location_info?: LocationInfo;
  metadata?: Record<string, unknown>;
}

export interface SessionAnalyticsData {
  session_id: string;
  user_id: string;
  session_started_at: string;
  session_ended_at?: string;
  session_expired_at?: string;
  last_activity_at: string;
  duration_minutes?: number;
  session_status: 'active' | 'ended' | 'expired';
  refresh_count: number;
  ip_address?: string;
  user_agent?: string;
  device_type?: string;
  browser?: string;
  location?: string;
  is_current_session?: boolean;
}