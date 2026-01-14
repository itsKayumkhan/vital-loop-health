-- Create table for saved dashboard views
CREATE TABLE public.crm_saved_views (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  config JSONB NOT NULL DEFAULT '{}',
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.crm_saved_views ENABLE ROW LEVEL SECURITY;

-- Users can view their own saved views
CREATE POLICY "Users can view their own saved views"
ON public.crm_saved_views
FOR SELECT
USING (auth.uid() = user_id);

-- Users can create their own saved views
CREATE POLICY "Users can create their own saved views"
ON public.crm_saved_views
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can update their own saved views
CREATE POLICY "Users can update their own saved views"
ON public.crm_saved_views
FOR UPDATE
USING (auth.uid() = user_id);

-- Users can delete their own saved views
CREATE POLICY "Users can delete their own saved views"
ON public.crm_saved_views
FOR DELETE
USING (auth.uid() = user_id);

-- Add trigger for updating updated_at
CREATE TRIGGER update_crm_saved_views_updated_at
BEFORE UPDATE ON public.crm_saved_views
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create index for faster lookups
CREATE INDEX idx_crm_saved_views_user_id ON public.crm_saved_views(user_id);