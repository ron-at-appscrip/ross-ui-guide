import { supabase } from '@/integrations/supabase/client';
import {
  Organization,
  OrganizationMember,
  OrganizationRole,
  CreateOrganizationRequest,
  InviteUserRequest
} from '@/types/session';

export const teamService = {
  /**
   * Create a new organization
   */
  async createOrganization(request: CreateOrganizationRequest): Promise<Organization> {
    try {
      const { data, error } = await supabase.rpc('create_organization', {
        p_name: request.name,
        p_slug: request.slug,
        p_description: request.description || null
      });

      if (error) {
        console.error('Error creating organization:', error);
        throw new Error(`Failed to create organization: ${error.message}`);
      }

      // Fetch the created organization
      const { data: organization, error: fetchError } = await supabase
        .from('organizations')
        .select('*')
        .eq('id', data)
        .single();

      if (fetchError) {
        console.error('Error fetching created organization:', fetchError);
        throw new Error(`Failed to fetch organization: ${fetchError.message}`);
      }

      return organization;
    } catch (error) {
      console.error('Organization creation failed:', error);
      throw error;
    }
  },

  /**
   * Get organizations for the current user
   */
  async getUserOrganizations(): Promise<Organization[]> {
    try {
      const { data, error } = await supabase
        .from('organizations')
        .select(`
          *,
          organization_members!inner(
            role,
            is_active
          )
        `)
        .eq('organization_members.user_id', (await supabase.auth.getUser()).data.user?.id)
        .eq('organization_members.is_active', true);

      if (error) {
        console.error('Error fetching user organizations:', error);
        throw new Error(`Failed to fetch organizations: ${error.message}`);
      }

      return data || [];
    } catch (error) {
      console.error('Error getting user organizations:', error);
      throw error;
    }
  },

  /**
   * Get organization by ID
   */
  async getOrganization(organizationId: string): Promise<Organization | null> {
    try {
      const { data, error } = await supabase
        .from('organizations')
        .select('*')
        .eq('id', organizationId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return null; // Not found
        }
        console.error('Error fetching organization:', error);
        throw new Error(`Failed to fetch organization: ${error.message}`);
      }

      return data;
    } catch (error) {
      console.error('Error getting organization:', error);
      throw error;
    }
  },

  /**
   * Get organization members
   */
  async getOrganizationMembers(organizationId: string): Promise<OrganizationMember[]> {
    try {
      const { data, error } = await supabase
        .from('organization_members')
        .select(`
          *,
          user:user_id (
            email,
            raw_user_meta_data
          ),
          invited_by_user:invited_by (
            email
          ),
          organization:organization_id (
            name,
            slug
          )
        `)
        .eq('organization_id', organizationId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching organization members:', error);
        throw new Error(`Failed to fetch organization members: ${error.message}`);
      }

      // Transform the data to include flattened user information
      const members = (data || []).map(member => ({
        ...member,
        user_email: member.user?.email || '',
        user_name: member.user?.raw_user_meta_data?.full_name || member.user?.email || '',
        invited_by_email: member.invited_by_user?.email || ''
      }));

      return members;
    } catch (error) {
      console.error('Error getting organization members:', error);
      throw error;
    }
  },

  /**
   * Invite a user to an organization
   */
  async inviteUserToOrganization(request: InviteUserRequest): Promise<OrganizationMember> {
    try {
      const { data, error } = await supabase.rpc('invite_user_to_organization', {
        p_organization_id: request.organization_id,
        p_user_email: request.user_email,
        p_role: request.role
      });

      if (error) {
        console.error('Error inviting user to organization:', error);
        throw new Error(`Failed to invite user: ${error.message}`);
      }

      // Fetch the created invitation
      const { data: invitation, error: fetchError } = await supabase
        .from('organization_members')
        .select(`
          *,
          user:user_id (
            email,
            raw_user_meta_data
          ),
          invited_by_user:invited_by (
            email
          )
        `)
        .eq('id', data)
        .single();

      if (fetchError) {
        console.error('Error fetching invitation:', fetchError);
        throw new Error(`Failed to fetch invitation: ${fetchError.message}`);
      }

      return {
        ...invitation,
        user_email: invitation.user?.email || '',
        user_name: invitation.user?.raw_user_meta_data?.full_name || invitation.user?.email || '',
        invited_by_email: invitation.invited_by_user?.email || ''
      };
    } catch (error) {
      console.error('User invitation failed:', error);
      throw error;
    }
  },

  /**
   * Accept an organization invitation
   */
  async acceptInvitation(organizationId: string): Promise<OrganizationMember> {
    try {
      const { data, error } = await supabase
        .from('organization_members')
        .update({
          joined_at: new Date().toISOString(),
          is_active: true
        })
        .eq('organization_id', organizationId)
        .eq('user_id', (await supabase.auth.getUser()).data.user?.id)
        .eq('is_active', false)
        .select()
        .single();

      if (error) {
        console.error('Error accepting invitation:', error);
        throw new Error(`Failed to accept invitation: ${error.message}`);
      }

      return data;
    } catch (error) {
      console.error('Invitation acceptance failed:', error);
      throw error;
    }
  },

  /**
   * Update user role in organization
   */
  async updateMemberRole(
    organizationId: string,
    userId: string,
    role: OrganizationRole
  ): Promise<OrganizationMember> {
    try {
      const { data, error } = await supabase
        .from('organization_members')
        .update({ role })
        .eq('organization_id', organizationId)
        .eq('user_id', userId)
        .select()
        .single();

      if (error) {
        console.error('Error updating member role:', error);
        throw new Error(`Failed to update member role: ${error.message}`);
      }

      return data;
    } catch (error) {
      console.error('Member role update failed:', error);
      throw error;
    }
  },

  /**
   * Remove user from organization
   */
  async removeMember(organizationId: string, userId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('organization_members')
        .delete()
        .eq('organization_id', organizationId)
        .eq('user_id', userId);

      if (error) {
        console.error('Error removing member:', error);
        throw new Error(`Failed to remove member: ${error.message}`);
      }

      return true;
    } catch (error) {
      console.error('Member removal failed:', error);
      throw error;
    }
  },

  /**
   * Check if current user is admin of organization
   */
  async isOrganizationAdmin(organizationId: string): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from('organization_members')
        .select('role')
        .eq('organization_id', organizationId)
        .eq('user_id', (await supabase.auth.getUser()).data.user?.id)
        .eq('is_active', true)
        .single();

      if (error) {
        return false;
      }

      return data?.role === 'owner' || data?.role === 'admin';
    } catch (error) {
      console.error('Error checking admin status:', error);
      return false;
    }
  },

  /**
   * Get user's role in organization
   */
  async getUserRole(organizationId: string): Promise<OrganizationRole | null> {
    try {
      const { data, error } = await supabase
        .from('organization_members')
        .select('role')
        .eq('organization_id', organizationId)
        .eq('user_id', (await supabase.auth.getUser()).data.user?.id)
        .eq('is_active', true)
        .single();

      if (error) {
        return null;
      }

      return data?.role || null;
    } catch (error) {
      console.error('Error getting user role:', error);
      return null;
    }
  },

  /**
   * Update organization settings
   */
  async updateOrganization(
    organizationId: string,
    updates: Partial<Pick<Organization, 'name' | 'description' | 'logo_url' | 'settings'>>
  ): Promise<Organization> {
    try {
      const { data, error } = await supabase
        .from('organizations')
        .update(updates)
        .eq('id', organizationId)
        .select()
        .single();

      if (error) {
        console.error('Error updating organization:', error);
        throw new Error(`Failed to update organization: ${error.message}`);
      }

      return data;
    } catch (error) {
      console.error('Organization update failed:', error);
      throw error;
    }
  },

  /**
   * Delete organization (owner only)
   */
  async deleteOrganization(organizationId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('organizations')
        .delete()
        .eq('id', organizationId);

      if (error) {
        console.error('Error deleting organization:', error);
        throw new Error(`Failed to delete organization: ${error.message}`);
      }

      return true;
    } catch (error) {
      console.error('Organization deletion failed:', error);
      throw error;
    }
  },

  /**
   * Get pending invitations for current user
   */
  async getPendingInvitations(): Promise<OrganizationMember[]> {
    try {
      const { data, error } = await supabase
        .from('organization_members')
        .select(`
          *,
          organization:organization_id (
            name,
            slug,
            description
          ),
          invited_by_user:invited_by (
            email
          )
        `)
        .eq('user_id', (await supabase.auth.getUser()).data.user?.id)
        .eq('is_active', false)
        .order('invited_at', { ascending: false });

      if (error) {
        console.error('Error fetching pending invitations:', error);
        throw new Error(`Failed to fetch pending invitations: ${error.message}`);
      }

      return (data || []).map(invitation => ({
        ...invitation,
        invited_by_email: invitation.invited_by_user?.email || ''
      }));
    } catch (error) {
      console.error('Error getting pending invitations:', error);
      throw error;
    }
  }
};