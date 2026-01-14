-- Create enum types for CRM
CREATE TYPE public.membership_tier AS ENUM ('free', 'essential', 'premium', 'elite');
CREATE TYPE public.membership_status AS ENUM ('active', 'paused', 'cancelled', 'expired');
CREATE TYPE public.purchase_type AS ENUM ('subscription', 'one_time', 'supplement', 'service');
CREATE TYPE public.document_type AS ENUM ('contract', 'lab_results', 'health_record', 'invoice', 'other');
CREATE TYPE public.marketing_status AS ENUM ('lead', 'prospect', 'customer', 'churned', 'vip');

-- CRM Clients table (extends profiles with CRM-specific data)
CREATE TABLE public.crm_clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  email TEXT NOT NULL,
  full_name TEXT NOT NULL,
  phone TEXT,
  date_of_birth DATE,
  address_line1 TEXT,
  address_line2 TEXT,
  city TEXT,
  state TEXT,
  zip_code TEXT,
  country TEXT DEFAULT 'US',
  emergency_contact_name TEXT,
  emergency_contact_phone TEXT,
  health_goals TEXT,
  notes TEXT,
  tags TEXT[] DEFAULT '{}',
  marketing_status marketing_status DEFAULT 'lead',
  lead_source TEXT,
  referral_source TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- CRM Memberships table
CREATE TABLE public.crm_memberships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID REFERENCES public.crm_clients(id) ON DELETE CASCADE NOT NULL,
  tier membership_tier NOT NULL DEFAULT 'free',
  status membership_status NOT NULL DEFAULT 'active',
  start_date DATE NOT NULL DEFAULT CURRENT_DATE,
  end_date DATE,
  renewal_date DATE,
  monthly_price DECIMAL(10, 2),
  stripe_subscription_id TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- CRM Purchases table
CREATE TABLE public.crm_purchases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID REFERENCES public.crm_clients(id) ON DELETE CASCADE NOT NULL,
  purchase_type purchase_type NOT NULL,
  product_name TEXT NOT NULL,
  description TEXT,
  amount DECIMAL(10, 2) NOT NULL,
  currency TEXT DEFAULT 'USD',
  status TEXT DEFAULT 'completed',
  stripe_payment_id TEXT,
  stripe_invoice_id TEXT,
  purchased_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- CRM Documents table
CREATE TABLE public.crm_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID REFERENCES public.crm_clients(id) ON DELETE CASCADE NOT NULL,
  document_type document_type NOT NULL DEFAULT 'other',
  name TEXT NOT NULL,
  description TEXT,
  file_path TEXT NOT NULL,
  file_size INTEGER,
  mime_type TEXT,
  uploaded_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  shared_with_client BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- CRM Client Notes / Activity Log
CREATE TABLE public.crm_client_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID REFERENCES public.crm_clients(id) ON DELETE CASCADE NOT NULL,
  author_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  note_type TEXT DEFAULT 'general',
  content TEXT NOT NULL,
  is_pinned BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Marketing Campaigns table
CREATE TABLE public.crm_marketing_campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  campaign_type TEXT NOT NULL,
  status TEXT DEFAULT 'draft',
  target_segment TEXT,
  start_date DATE,
  end_date DATE,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Campaign Enrollments (for retargeting)
CREATE TABLE public.crm_campaign_enrollments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID REFERENCES public.crm_marketing_campaigns(id) ON DELETE CASCADE NOT NULL,
  client_id UUID REFERENCES public.crm_clients(id) ON DELETE CASCADE NOT NULL,
  enrolled_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  status TEXT DEFAULT 'enrolled',
  last_interaction TIMESTAMPTZ,
  conversion_date TIMESTAMPTZ,
  notes TEXT,
  UNIQUE(campaign_id, client_id)
);

-- Enable RLS on all tables
ALTER TABLE public.crm_clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crm_memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crm_purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crm_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crm_client_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crm_marketing_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crm_campaign_enrollments ENABLE ROW LEVEL SECURITY;

-- RLS Policies - Staff can view/manage all CRM data
CREATE POLICY "Staff can view all clients" ON public.crm_clients
  FOR SELECT USING (
    has_role(auth.uid(), 'admin') OR 
    has_role(auth.uid(), 'health_architect') OR 
    has_role(auth.uid(), 'coach')
  );

CREATE POLICY "Staff can insert clients" ON public.crm_clients
  FOR INSERT WITH CHECK (
    has_role(auth.uid(), 'admin') OR 
    has_role(auth.uid(), 'health_architect')
  );

CREATE POLICY "Staff can update clients" ON public.crm_clients
  FOR UPDATE USING (
    has_role(auth.uid(), 'admin') OR 
    has_role(auth.uid(), 'health_architect')
  );

CREATE POLICY "Admins can delete clients" ON public.crm_clients
  FOR DELETE USING (has_role(auth.uid(), 'admin'));

-- Memberships policies
CREATE POLICY "Staff can view all memberships" ON public.crm_memberships
  FOR SELECT USING (
    has_role(auth.uid(), 'admin') OR 
    has_role(auth.uid(), 'health_architect') OR 
    has_role(auth.uid(), 'coach')
  );

CREATE POLICY "Staff can manage memberships" ON public.crm_memberships
  FOR ALL USING (
    has_role(auth.uid(), 'admin') OR 
    has_role(auth.uid(), 'health_architect')
  );

-- Purchases policies
CREATE POLICY "Staff can view all purchases" ON public.crm_purchases
  FOR SELECT USING (
    has_role(auth.uid(), 'admin') OR 
    has_role(auth.uid(), 'health_architect') OR 
    has_role(auth.uid(), 'coach')
  );

CREATE POLICY "Staff can manage purchases" ON public.crm_purchases
  FOR ALL USING (
    has_role(auth.uid(), 'admin') OR 
    has_role(auth.uid(), 'health_architect')
  );

-- Documents policies
CREATE POLICY "Staff can view all documents" ON public.crm_documents
  FOR SELECT USING (
    has_role(auth.uid(), 'admin') OR 
    has_role(auth.uid(), 'health_architect') OR 
    has_role(auth.uid(), 'coach')
  );

CREATE POLICY "Staff can manage documents" ON public.crm_documents
  FOR ALL USING (
    has_role(auth.uid(), 'admin') OR 
    has_role(auth.uid(), 'health_architect')
  );

-- Client notes policies
CREATE POLICY "Staff can view all client notes" ON public.crm_client_notes
  FOR SELECT USING (
    has_role(auth.uid(), 'admin') OR 
    has_role(auth.uid(), 'health_architect') OR 
    has_role(auth.uid(), 'coach')
  );

CREATE POLICY "Staff can manage client notes" ON public.crm_client_notes
  FOR ALL USING (
    has_role(auth.uid(), 'admin') OR 
    has_role(auth.uid(), 'health_architect') OR 
    has_role(auth.uid(), 'coach')
  );

-- Marketing campaigns policies
CREATE POLICY "Staff can view campaigns" ON public.crm_marketing_campaigns
  FOR SELECT USING (
    has_role(auth.uid(), 'admin') OR 
    has_role(auth.uid(), 'health_architect')
  );

CREATE POLICY "Staff can manage campaigns" ON public.crm_marketing_campaigns
  FOR ALL USING (
    has_role(auth.uid(), 'admin') OR 
    has_role(auth.uid(), 'health_architect')
  );

-- Campaign enrollments policies
CREATE POLICY "Staff can view enrollments" ON public.crm_campaign_enrollments
  FOR SELECT USING (
    has_role(auth.uid(), 'admin') OR 
    has_role(auth.uid(), 'health_architect')
  );

CREATE POLICY "Staff can manage enrollments" ON public.crm_campaign_enrollments
  FOR ALL USING (
    has_role(auth.uid(), 'admin') OR 
    has_role(auth.uid(), 'health_architect')
  );

-- Create storage bucket for CRM documents
INSERT INTO storage.buckets (id, name, public) VALUES ('crm-documents', 'crm-documents', false);

-- Storage policies for CRM documents
CREATE POLICY "Staff can upload documents" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'crm-documents' AND 
    (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'health_architect'))
  );

CREATE POLICY "Staff can view documents" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'crm-documents' AND 
    (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'health_architect') OR has_role(auth.uid(), 'coach'))
  );

CREATE POLICY "Staff can delete documents" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'crm-documents' AND 
    (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'health_architect'))
  );

-- Update triggers
CREATE TRIGGER update_crm_clients_updated_at
  BEFORE UPDATE ON public.crm_clients
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_crm_memberships_updated_at
  BEFORE UPDATE ON public.crm_memberships
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_crm_documents_updated_at
  BEFORE UPDATE ON public.crm_documents
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_crm_client_notes_updated_at
  BEFORE UPDATE ON public.crm_client_notes
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_crm_marketing_campaigns_updated_at
  BEFORE UPDATE ON public.crm_marketing_campaigns
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();