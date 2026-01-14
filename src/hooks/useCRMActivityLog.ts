import { useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export type CRMAction = 
  | 'view_dashboard'
  | 'view_clients'
  | 'view_client_detail'
  | 'create_client'
  | 'update_client'
  | 'delete_client'
  | 'view_intake_forms'
  | 'view_intake_form_detail'
  | 'update_intake_form'
  | 'view_memberships'
  | 'create_membership'
  | 'update_membership'
  | 'view_purchases'
  | 'create_purchase'
  | 'view_documents'
  | 'upload_document'
  | 'delete_document'
  | 'view_campaigns'
  | 'create_campaign'
  | 'update_campaign'
  | 'view_activity_log'
  | 'export_data'
  | 'login'
  | 'logout';

export type CRMResourceType = 
  | 'dashboard'
  | 'client'
  | 'intake_form'
  | 'membership'
  | 'purchase'
  | 'document'
  | 'campaign'
  | 'activity_log'
  | 'session';

interface LogActivityParams {
  action: CRMAction;
  resourceType: CRMResourceType;
  resourceId?: string;
  details?: Record<string, unknown>;
}

export function useCRMActivityLog() {
  const { user, role } = useAuth();

  const logActivity = useCallback(async ({
    action,
    resourceType,
    resourceId,
    details = {}
  }: LogActivityParams) => {
    if (!user) return;

    try {
      // Use type assertion since the types file hasn't been regenerated yet
      const { error } = await supabase
        .from('crm_activity_log' as any)
        .insert({
          user_id: user.id,
          user_email: user.email,
          user_role: role,
          action,
          resource_type: resourceType,
          resource_id: resourceId,
          details,
          user_agent: navigator.userAgent,
        } as any);

      if (error) {
        console.error('Failed to log activity:', error);
      }
    } catch (err) {
      console.error('Activity logging error:', err);
    }
  }, [user, role]);

  return { logActivity };
}
