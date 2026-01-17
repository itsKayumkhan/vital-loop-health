-- Add baseline RLS policy to explicitly deny anonymous access to crm_clients
-- This ensures that even if other policies fail, unauthenticated users cannot access the table

CREATE POLICY "Deny anonymous access to crm_clients"
ON public.crm_clients
AS RESTRICTIVE
FOR ALL
USING (auth.uid() IS NOT NULL);