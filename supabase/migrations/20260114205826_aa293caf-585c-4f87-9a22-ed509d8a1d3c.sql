-- Create satisfaction survey table
CREATE TABLE public.coach_satisfaction_surveys (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID NOT NULL REFERENCES public.crm_clients(id) ON DELETE CASCADE,
  coach_id UUID NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  feedback TEXT,
  survey_type TEXT NOT NULL DEFAULT 'general',
  session_date DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create index for faster lookups
CREATE INDEX idx_coach_satisfaction_surveys_coach_id ON public.coach_satisfaction_surveys(coach_id);
CREATE INDEX idx_coach_satisfaction_surveys_client_id ON public.coach_satisfaction_surveys(client_id);

-- Enable RLS
ALTER TABLE public.coach_satisfaction_surveys ENABLE ROW LEVEL SECURITY;

-- Staff can view all surveys
CREATE POLICY "Staff can view all surveys"
ON public.coach_satisfaction_surveys
FOR SELECT
USING (
  has_role(auth.uid(), 'admin') OR 
  has_role(auth.uid(), 'health_architect') OR
  has_role(auth.uid(), 'coach')
);

-- Staff can insert surveys on behalf of clients
CREATE POLICY "Staff can insert surveys"
ON public.coach_satisfaction_surveys
FOR INSERT
WITH CHECK (
  has_role(auth.uid(), 'admin') OR 
  has_role(auth.uid(), 'health_architect')
);

-- Clients can submit their own surveys (matching their crm_clients record)
CREATE POLICY "Clients can submit their own surveys"
ON public.coach_satisfaction_surveys
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.crm_clients
    WHERE crm_clients.id = client_id
    AND crm_clients.user_id = auth.uid()
  )
);

-- Clients can view their own surveys
CREATE POLICY "Clients can view their own surveys"
ON public.coach_satisfaction_surveys
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.crm_clients
    WHERE crm_clients.id = client_id
    AND crm_clients.user_id = auth.uid()
  )
);

-- Admins can delete surveys
CREATE POLICY "Admins can delete surveys"
ON public.coach_satisfaction_surveys
FOR DELETE
USING (has_role(auth.uid(), 'admin'));