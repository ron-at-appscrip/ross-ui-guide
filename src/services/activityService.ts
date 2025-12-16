import { supabase } from '@/integrations/supabase/client';
import { 
  ActivityLog, 
  ActivityLogWithChanges, 
  ActivityLogParams, 
  EntityChangeParams, 
  ActivityLogFilter,
  ActivityType,
  EntityType 
} from '@/types/activity';

export const activityService = {
  /**
   * Log a user activity with optional field changes
   */
  async logActivity(
    userId: string, 
    params: ActivityLogParams, 
    changes?: EntityChangeParams[]
  ): Promise<ActivityLog> {
    try {
      // Get client info for IP/User Agent if available
      const clientInfo = this.getClientInfo();

      // Call the database function to log activity
      const { data, error } = await supabase.rpc('log_activity', {
        p_user_id: userId,
        p_activity_type: params.activity_type,
        p_entity_type: params.entity_type,
        p_entity_id: params.entity_id || null,
        p_entity_name: params.entity_name || null,
        p_description: params.description,
        p_metadata: params.metadata || null,
        p_ip_address: params.ip_address || clientInfo.ip_address || null,
        p_user_agent: params.user_agent || clientInfo.user_agent || null,
        p_session_id: params.session_id || clientInfo.session_id || null,
      });

      if (error) {
        console.error('Error logging activity:', error);
        throw new Error(`Failed to log activity: ${error.message}`);
      }

      const activityId = data;

      // Log field changes if provided
      if (changes && changes.length > 0) {
        await this.logEntityChanges(activityId, changes);
      }

      // Fetch the created activity log
      const { data: activityLog, error: fetchError } = await supabase
        .from('activity_logs')
        .select('*')
        .eq('id', activityId)
        .single();

      if (fetchError) {
        console.error('Error fetching created activity log:', fetchError);
        throw new Error(`Failed to fetch activity log: ${fetchError.message}`);
      }

      return activityLog;
    } catch (error) {
      console.error('Activity logging failed:', error);
      throw error;
    }
  },

  /**
   * Log multiple field changes for an activity
   */
  async logEntityChanges(activityLogId: string, changes: EntityChangeParams[]): Promise<void> {
    try {
      const changePromises = changes.map(change =>
        supabase.rpc('log_entity_change', {
          p_activity_log_id: activityLogId,
          p_field_name: change.field_name,
          p_old_value: change.old_value !== undefined ? JSON.stringify(change.old_value) : null,
          p_new_value: change.new_value !== undefined ? JSON.stringify(change.new_value) : null,
        })
      );

      const results = await Promise.all(changePromises);
      
      // Check for errors
      results.forEach((result, index) => {
        if (result.error) {
          console.error(`Error logging change ${index}:`, result.error);
        }
      });
    } catch (error) {
      console.error('Error logging entity changes:', error);
      throw error;
    }
  },

  /**
   * Get activity logs for a user with optional filtering
   */
  async getUserActivityLogs(
    userId: string, 
    filter: ActivityLogFilter = {}
  ): Promise<ActivityLogWithChanges[]> {
    try {
      let query = supabase
        .from('activity_logs')
        .select(`
          *,
          changes:entity_changes(*)
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      // Apply filters
      if (filter.activity_types && filter.activity_types.length > 0) {
        query = query.in('activity_type', filter.activity_types);
      }

      if (filter.entity_types && filter.entity_types.length > 0) {
        query = query.in('entity_type', filter.entity_types);
      }

      if (filter.entity_id) {
        query = query.eq('entity_id', filter.entity_id);
      }

      if (filter.start_date) {
        query = query.gte('created_at', filter.start_date);
      }

      if (filter.end_date) {
        query = query.lte('created_at', filter.end_date);
      }

      if (filter.search_term) {
        query = query.or(
          `description.ilike.%${filter.search_term}%,entity_name.ilike.%${filter.search_term}%`
        );
      }

      if (filter.limit) {
        query = query.limit(filter.limit);
      }

      if (filter.offset) {
        query = query.range(filter.offset, filter.offset + (filter.limit || 50) - 1);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching activity logs:', error);
        throw new Error(`Failed to fetch activity logs: ${error.message}`);
      }

      return data || [];
    } catch (error) {
      console.error('Error getting user activity logs:', error);
      throw error;
    }
  },

  /**
   * Get activity statistics for a user
   */
  async getUserActivityStats(userId: string, days: number = 30): Promise<{
    total_activities: number;
    activities_by_type: Record<ActivityType, number>;
    activities_by_entity: Record<EntityType, number>;
    recent_activities: ActivityLog[];
  }> {
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const { data, error } = await supabase
        .from('activity_logs')
        .select('activity_type, entity_type, created_at')
        .eq('user_id', userId)
        .gte('created_at', startDate.toISOString());

      if (error) {
        console.error('Error fetching activity stats:', error);
        throw new Error(`Failed to fetch activity stats: ${error.message}`);
      }

      // Calculate statistics
      const activities_by_type: Record<string, number> = {};
      const activities_by_entity: Record<string, number> = {};

      data?.forEach(activity => {
        activities_by_type[activity.activity_type] = 
          (activities_by_type[activity.activity_type] || 0) + 1;
        activities_by_entity[activity.entity_type] = 
          (activities_by_entity[activity.entity_type] || 0) + 1;
      });

      // Get recent activities
      const { data: recentData, error: recentError } = await supabase
        .from('activity_logs')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(10);

      if (recentError) {
        console.error('Error fetching recent activities:', recentError);
      }

      return {
        total_activities: data?.length || 0,
        activities_by_type: activities_by_type as Record<ActivityType, number>,
        activities_by_entity: activities_by_entity as Record<EntityType, number>,
        recent_activities: recentData || [],
      };
    } catch (error) {
      console.error('Error getting activity stats:', error);
      throw error;
    }
  },

  /**
   * Helper to get client information (IP, User Agent, etc.)
   */
  getClientInfo(): { ip_address?: string; user_agent?: string; session_id?: string } {
    if (typeof window === 'undefined') {
      return {}; // Server-side
    }

    return {
      user_agent: navigator.userAgent,
      session_id: this.getOrCreateSessionId(),
    };
  },

  /**
   * Get or create a session ID for tracking user sessions
   */
  getOrCreateSessionId(): string {
    const sessionKey = 'activity_session_id';
    let sessionId = sessionStorage.getItem(sessionKey);
    
    if (!sessionId) {
      sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      sessionStorage.setItem(sessionKey, sessionId);
    }
    
    return sessionId;
  },

  /**
   * Convenience methods for common activities
   */
  async logLogin(userId: string): Promise<void> {
    await this.logActivity(userId, {
      activity_type: 'LOGIN',
      entity_type: 'USER',
      entity_id: userId,
      description: 'User logged in',
    });
  },

  async logLogout(userId: string): Promise<void> {
    await this.logActivity(userId, {
      activity_type: 'LOGOUT',
      entity_type: 'USER',
      entity_id: userId,
      description: 'User logged out',
    });
  },

  async logSignup(userId: string, userEmail: string): Promise<void> {
    await this.logActivity(userId, {
      activity_type: 'SIGNUP',
      entity_type: 'USER',
      entity_id: userId,
      entity_name: userEmail,
      description: 'User signed up',
    });
  },

  async logProfileUpdate(
    userId: string, 
    changes: EntityChangeParams[], 
    profileId?: string
  ): Promise<void> {
    await this.logActivity(userId, {
      activity_type: 'PROFILE_UPDATE',
      entity_type: 'PROFILE',
      entity_id: profileId || userId,
      description: 'Profile updated',
    }, changes);
  },

  async logPasswordChange(userId: string): Promise<void> {
    await this.logActivity(userId, {
      activity_type: 'PASSWORD_CHANGE',
      entity_type: 'USER',
      entity_id: userId,
      description: 'Password changed',
    });
  },

  async logClientCreated(userId: string, clientId: string, clientName: string): Promise<void> {
    await this.logActivity(userId, {
      activity_type: 'CREATE',
      entity_type: 'CLIENT',
      entity_id: clientId,
      entity_name: clientName,
      description: `Created client: ${clientName}`,
    });
  },

  async logClientUpdated(
    userId: string, 
    clientId: string, 
    clientName: string, 
    changes: EntityChangeParams[]
  ): Promise<void> {
    await this.logActivity(userId, {
      activity_type: 'UPDATE',
      entity_type: 'CLIENT',
      entity_id: clientId,
      entity_name: clientName,
      description: `Updated client: ${clientName}`,
    }, changes);
  },

  async logClientDeleted(userId: string, clientId: string, clientName: string): Promise<void> {
    await this.logActivity(userId, {
      activity_type: 'DELETE',
      entity_type: 'CLIENT',
      entity_id: clientId,
      entity_name: clientName,
      description: `Deleted client: ${clientName}`,
    });
  },

  async logMatterCreated(
    userId: string, 
    matterId: string, 
    matterTitle: string, 
    clientName?: string
  ): Promise<void> {
    await this.logActivity(userId, {
      activity_type: 'CREATE',
      entity_type: 'MATTER',
      entity_id: matterId,
      entity_name: matterTitle,
      description: `Created matter: ${matterTitle}${clientName ? ` for ${clientName}` : ''}`,
    });
  },

  async logMatterUpdated(
    userId: string, 
    matterId: string, 
    matterTitle: string, 
    changes: EntityChangeParams[]
  ): Promise<void> {
    await this.logActivity(userId, {
      activity_type: 'UPDATE',
      entity_type: 'MATTER',
      entity_id: matterId,
      entity_name: matterTitle,
      description: `Updated matter: ${matterTitle}`,
    }, changes);
  },

  async logDocumentUploaded(
    userId: string, 
    documentId: string, 
    filename: string, 
    matterTitle?: string
  ): Promise<void> {
    await this.logActivity(userId, {
      activity_type: 'CREATE',
      entity_type: 'DOCUMENT',
      entity_id: documentId,
      entity_name: filename,
      description: `Uploaded document: ${filename}${matterTitle ? ` to ${matterTitle}` : ''}`,
    });
  },
};