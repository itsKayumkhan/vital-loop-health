-- Add assigned_coach_id to crm_clients for coach assignments
ALTER TABLE public.crm_clients 
ADD COLUMN assigned_coach_id uuid REFERENCES auth.users(id) ON DELETE SET NULL;

-- Create index for efficient querying
CREATE INDEX idx_crm_clients_assigned_coach ON public.crm_clients(assigned_coach_id);

-- Update RLS policy to allow coaches to see their assigned clients
DROP POLICY IF EXISTS "Staff can view all clients" ON public.crm_clients;

CREATE POLICY "Staff can view clients"
ON public.crm_clients
FOR SELECT
USING (
  has_role(auth.uid(), 'admin') OR 
  has_role(auth.uid(), 'health_architect') OR 
  (has_role(auth.uid(), 'coach') AND assigned_coach_id = auth.uid())
);

-- Allow admins/health architects to view all, coaches only their assigned
DROP POLICY IF EXISTS "Staff can view all client notes" ON public.crm_client_notes;

CREATE POLICY "Staff can view client notes"
ON public.crm_client_notes
FOR SELECT
USING (
  has_role(auth.uid(), 'admin') OR 
  has_role(auth.uid(), 'health_architect') OR 
  (has_role(auth.uid(), 'coach') AND EXISTS (
    SELECT 1 FROM public.crm_clients 
    WHERE crm_clients.id = crm_client_notes.client_id 
    AND crm_clients.assigned_coach_id = auth.uid()
  ))
);

-- Update intake forms policy to allow coaches to see forms assigned to them
DROP POLICY IF EXISTS "Staff can view all submissions" ON public.coach_intake_forms;

CREATE POLICY "Staff can view submissions"
ON public.coach_intake_forms
FOR SELECT
USING (
  auth.uid() = user_id OR
  has_role(auth.uid(), 'admin') OR 
  has_role(auth.uid(), 'health_architect') OR 
  (has_role(auth.uid(), 'coach') AND assigned_to = auth.uid())
);

-- Allow coaches to update forms assigned to them
DROP POLICY IF EXISTS "Staff can update submissions" ON public.coach_intake_forms;

CREATE POLICY "Staff can update submissions"
ON public.coach_intake_forms
FOR UPDATE
USING (
  has_role(auth.uid(), 'admin') OR 
  has_role(auth.uid(), 'health_architect') OR
  (has_role(auth.uid(), 'coach') AND assigned_to = auth.uid())
);