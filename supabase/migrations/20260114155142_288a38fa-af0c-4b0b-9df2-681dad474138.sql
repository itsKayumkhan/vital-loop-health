-- Communication logs table for tracking all client interactions
CREATE TABLE public.crm_communication_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID REFERENCES public.crm_clients(id) ON DELETE CASCADE NOT NULL,
  staff_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  communication_type TEXT NOT NULL CHECK (communication_type IN ('email', 'phone', 'sms', 'video_call', 'in_person', 'other')),
  direction TEXT NOT NULL CHECK (direction IN ('inbound', 'outbound')),
  subject TEXT,
  content TEXT NOT NULL,
  duration_minutes INTEGER,
  outcome TEXT,
  follow_up_date DATE,
  follow_up_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Email notification logs for tracking sent emails
CREATE TABLE public.crm_email_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID REFERENCES public.crm_clients(id) ON DELETE CASCADE,
  campaign_id UUID REFERENCES public.crm_marketing_campaigns(id) ON DELETE SET NULL,
  email_type TEXT NOT NULL,
  recipient_email TEXT NOT NULL,
  subject TEXT NOT NULL,
  status TEXT DEFAULT 'sent',
  sent_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  opened_at TIMESTAMPTZ,
  clicked_at TIMESTAMPTZ,
  error_message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- CRM Analytics snapshots for historical tracking
CREATE TABLE public.crm_analytics_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  snapshot_date DATE NOT NULL DEFAULT CURRENT_DATE,
  total_clients INTEGER DEFAULT 0,
  new_clients INTEGER DEFAULT 0,
  active_members INTEGER DEFAULT 0,
  churned_members INTEGER DEFAULT 0,
  total_revenue DECIMAL(12, 2) DEFAULT 0,
  mrr DECIMAL(12, 2) DEFAULT 0,
  leads_count INTEGER DEFAULT 0,
  prospects_count INTEGER DEFAULT 0,
  customers_count INTEGER DEFAULT 0,
  vip_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(snapshot_date)
);

-- Enable RLS
ALTER TABLE public.crm_communication_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crm_email_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crm_analytics_snapshots ENABLE ROW LEVEL SECURITY;

-- Communication logs policies
CREATE POLICY "Staff can view all communication logs" ON public.crm_communication_logs
  FOR SELECT USING (
    has_role(auth.uid(), 'admin') OR 
    has_role(auth.uid(), 'health_architect') OR 
    has_role(auth.uid(), 'coach')
  );

CREATE POLICY "Staff can manage communication logs" ON public.crm_communication_logs
  FOR ALL USING (
    has_role(auth.uid(), 'admin') OR 
    has_role(auth.uid(), 'health_architect') OR 
    has_role(auth.uid(), 'coach')
  );

-- Email logs policies
CREATE POLICY "Staff can view email logs" ON public.crm_email_logs
  FOR SELECT USING (
    has_role(auth.uid(), 'admin') OR 
    has_role(auth.uid(), 'health_architect')
  );

CREATE POLICY "Staff can manage email logs" ON public.crm_email_logs
  FOR ALL USING (
    has_role(auth.uid(), 'admin') OR 
    has_role(auth.uid(), 'health_architect')
  );

-- Analytics policies
CREATE POLICY "Staff can view analytics" ON public.crm_analytics_snapshots
  FOR SELECT USING (
    has_role(auth.uid(), 'admin') OR 
    has_role(auth.uid(), 'health_architect')
  );

CREATE POLICY "Staff can manage analytics" ON public.crm_analytics_snapshots
  FOR ALL USING (
    has_role(auth.uid(), 'admin') OR 
    has_role(auth.uid(), 'health_architect')
  );

-- Update trigger for communication logs
CREATE TRIGGER update_crm_communication_logs_updated_at
  BEFORE UPDATE ON public.crm_communication_logs
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();