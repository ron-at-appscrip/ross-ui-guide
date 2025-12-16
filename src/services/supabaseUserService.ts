
import { supabase } from '@/integrations/supabase/client';
import { User } from '@/types/auth';
import { activityService } from './activityService';
import { sessionService } from './sessionService';

export const supabaseUserService = {
  async updateProfile(currentUser: User | null, data: Partial<User>): Promise<User> {
    if (!currentUser) {
      throw new Error('No user logged in');
    }

    // Prepare auth metadata updates
    const authUpdates: any = {};
    
    // Handle full name updates (legacy)
    if (data.name) {
      authUpdates.data = { 
        ...authUpdates.data,
        full_name: data.name 
      };
    }
    
    // Handle split name updates
    if (data.first_name !== undefined || data.last_name !== undefined) {
      authUpdates.data = {
        ...authUpdates.data,
        first_name: data.first_name,
        last_name: data.last_name,
        full_name: data.first_name && data.last_name 
          ? `${data.first_name} ${data.last_name}`.trim()
          : data.first_name || data.last_name || data.name
      };
    }

    // Update auth metadata if needed
    if (Object.keys(authUpdates).length > 0) {
      const { error: authError } = await supabase.auth.updateUser(authUpdates);
      if (authError) {
        throw new Error(authError.message);
      }
    }

    // Prepare profile table updates
    const profileUpdates: any = {};
    
    // Handle legacy name field
    if (data.name) profileUpdates.full_name = data.name;
    
    // Handle split names
    if (data.first_name !== undefined) profileUpdates.first_name = data.first_name;
    if (data.last_name !== undefined) profileUpdates.last_name = data.last_name;
    
    // Update full_name if split names are provided
    if (data.first_name !== undefined || data.last_name !== undefined) {
      const firstName = data.first_name !== undefined ? data.first_name : currentUser.first_name;
      const lastName = data.last_name !== undefined ? data.last_name : currentUser.last_name;
      
      if (firstName && lastName) {
        profileUpdates.full_name = `${firstName} ${lastName}`.trim();
      } else if (firstName) {
        profileUpdates.full_name = firstName;
      } else if (lastName) {
        profileUpdates.full_name = lastName;
      }
    }
    
    // Handle avatar updates
    if (data.avatar) profileUpdates.avatar_url = data.avatar;

    // Update the profiles table
    if (Object.keys(profileUpdates).length > 0) {
      const { error: profileError } = await supabase
        .from('profiles')
        .update(profileUpdates)
        .eq('id', currentUser.id);

      if (profileError) {
        throw new Error(profileError.message);
      }
    }

    // Log profile update activity with field changes
    try {
      const changes = [];
      
      // Track field changes
      if (data.first_name !== undefined && data.first_name !== currentUser.first_name) {
        changes.push({
          field_name: 'first_name',
          old_value: currentUser.first_name,
          new_value: data.first_name
        });
      }
      
      if (data.last_name !== undefined && data.last_name !== currentUser.last_name) {
        changes.push({
          field_name: 'last_name',
          old_value: currentUser.last_name,
          new_value: data.last_name
        });
      }
      
      if (data.name !== undefined && data.name !== currentUser.name) {
        changes.push({
          field_name: 'full_name',
          old_value: currentUser.name,
          new_value: data.name
        });
      }
      
      if (data.avatar !== undefined && data.avatar !== currentUser.avatar) {
        changes.push({
          field_name: 'avatar_url',
          old_value: currentUser.avatar,
          new_value: data.avatar
        });
      }

      if (changes.length > 0) {
        await activityService.logProfileUpdate(currentUser.id, changes, currentUser.id);
      }
    } catch (error) {
      console.warn('Failed to log profile update activity:', error);
    }

    return { ...currentUser, ...data };
  },

  markWizardComplete(currentUser: User | null): User | null {
    if (currentUser) {
      return { ...currentUser, hasCompletedWizard: true };
    }
    return null;
  },

  async loadUserFromSession(): Promise<User | null> {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session?.user) {
      return null;
    }

    // Fetch the user profile
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', session.user.id)
      .single();

    if (error) {
      console.error('Profile fetch error:', error);
    }

    // Prioritize fresh auth metadata for new users
    const userData = {
      id: session.user.id,
      email: session.user.email!,
      name: profile?.computed_full_name || profile?.full_name || session.user.user_metadata?.full_name || 'User',
      first_name: profile?.first_name || session.user.user_metadata?.first_name,
      last_name: profile?.last_name || session.user.user_metadata?.last_name,
      full_name: profile?.computed_full_name || profile?.full_name || session.user.user_metadata?.full_name,
      title: 'Attorney at Law',
      avatar: profile?.avatar_url || session.user.user_metadata?.avatar_url,
      avatar_url: profile?.avatar_url || session.user.user_metadata?.avatar_url,
      provider: 'email',
      emailVerified: session.user.email_confirmed_at !== null,
      hasCompletedWizard: true, // We'll implement proper wizard tracking later
    };

    console.log('Loaded user data:', { 
      userId: userData.id, 
      name: userData.name, 
      first_name: userData.first_name, 
      last_name: userData.last_name,
      profileData: profile ? 'found' : 'not found',
      authMetadata: session.user.user_metadata 
    });

    // Log session event for tracking (only if session ID is available and not already logged)
    try {
      if (session.id) {
        // Check if this session has already been logged to avoid duplicates
        const { data: existingLogs } = await supabase
          .from('session_logs')
          .select('id')
          .eq('session_id', session.id)
          .eq('event_type', 'login')
          .limit(1);

        if (!existingLogs || existingLogs.length === 0) {
          await sessionService.logLogin(userData.id, session.id);
          console.log('Session logged successfully for user:', userData.id, 'session:', session.id);
        } else {
          console.log('Session already logged for user:', userData.id, 'session:', session.id);
        }
      }
    } catch (error) {
      console.warn('Failed to log session:', error);
    }

    return userData;
  }
};
