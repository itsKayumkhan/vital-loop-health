-- Enable realtime for CRM tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.crm_clients;
ALTER PUBLICATION supabase_realtime ADD TABLE public.crm_memberships;
ALTER PUBLICATION supabase_realtime ADD TABLE public.crm_purchases;