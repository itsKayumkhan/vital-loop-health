-- Create CRM activity log table
CREATE TABLE public.crm_activity_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  user_email text,
  user_role text,
  action text NOT NULL,
  resource_type text NOT NULL,
  resource_id uuid,
  details jsonb DEFAULT '{}'::jsonb,
  ip_address text,
  user_agent text,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create index for efficient querying
CREATE INDEX idx_crm_activity_log_user_id ON public.crm_activity_log(user_id);
CREATE INDEX idx_crm_activity_log_created_at ON public.crm_activity_log(created_at DESC);
CREATE INDEX idx_crm_activity_log_action ON public.crm_activity_log(action);
CREATE INDEX idx_crm_activity_log_resource_type ON public.crm_activity_log(resource_type);

-- Enable RLS
ALTER TABLE public.crm_activity_log ENABLE ROW LEVEL SECURITY;

-- Only admins can view all activity logs
CREATE POLICY "Admins can view all activity logs"
ON public.crm_activity_log
FOR SELECT
USING (has_role(auth.uid(), 'admin'));

-- Staff can insert their own activity
CREATE POLICY "Staff can insert activity logs"
ON public.crm_activity_log
FOR INSERT
WITH CHECK (
  auth.uid() = user_id AND (
    has_role(auth.uid(), 'admin') OR 
    has_role(auth.uid(), 'health_architect') OR 
    has_role(auth.uid(), 'coach')
  )
);

-- Comment for documentation
COMMENT ON TABLE public.crm_activity_log IS 'Tracks all CRM access and actions for audit purposes';