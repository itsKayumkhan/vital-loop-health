-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create app_role enum
CREATE TYPE public.app_role AS ENUM ('admin', 'health_architect', 'coach', 'client');

-- Create coach_specialty enum
CREATE TYPE public.coach_specialty AS ENUM ('nutrition', 'performance', 'wellness_recovery', 'mental_performance');

-- Create form_status enum
CREATE TYPE public.form_status AS ENUM ('pending', 'in_review', 'assigned', 'completed', 'archived');

-- =====================
-- PROFILES TABLE
-- =====================
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  full_name TEXT,
  email TEXT,
  phone TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- =====================
-- USER ROLES TABLE
-- =====================
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  UNIQUE (user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Function to get user's highest role
CREATE OR REPLACE FUNCTION public.get_user_role(_user_id UUID)
RETURNS app_role
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role FROM public.user_roles
  WHERE user_id = _user_id
  ORDER BY 
    CASE role 
      WHEN 'admin' THEN 1 
      WHEN 'health_architect' THEN 2 
      WHEN 'coach' THEN 3 
      WHEN 'client' THEN 4 
    END
  LIMIT 1
$$;

CREATE POLICY "Users can view their own roles"
  ON public.user_roles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all roles"
  ON public.user_roles FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

-- =====================
-- COACH INTAKE FORMS TABLE
-- =====================
CREATE TABLE public.coach_intake_forms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  specialty coach_specialty NOT NULL,
  status form_status NOT NULL DEFAULT 'pending',
  assigned_to UUID REFERENCES auth.users(id),
  form_data JSONB NOT NULL DEFAULT '{}',
  notes TEXT,
  submitted_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.coach_intake_forms ENABLE ROW LEVEL SECURITY;

-- Clients can view their own submissions
CREATE POLICY "Clients can view their own submissions"
  ON public.coach_intake_forms FOR SELECT
  USING (auth.uid() = user_id);

-- Clients can create submissions
CREATE POLICY "Authenticated users can create submissions"
  ON public.coach_intake_forms FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Clients can update their own pending submissions
CREATE POLICY "Clients can update pending submissions"
  ON public.coach_intake_forms FOR UPDATE
  USING (auth.uid() = user_id AND status = 'pending');

-- Staff (admin, health_architect, coach) can view all submissions
CREATE POLICY "Staff can view all submissions"
  ON public.coach_intake_forms FOR SELECT
  USING (
    public.has_role(auth.uid(), 'admin') OR 
    public.has_role(auth.uid(), 'health_architect') OR 
    public.has_role(auth.uid(), 'coach')
  );

-- Staff can update submissions
CREATE POLICY "Staff can update submissions"
  ON public.coach_intake_forms FOR UPDATE
  USING (
    public.has_role(auth.uid(), 'admin') OR 
    public.has_role(auth.uid(), 'health_architect')
  );

-- =====================
-- FORM ACTIVITY LOG TABLE
-- =====================
CREATE TABLE public.form_activity_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  form_id UUID REFERENCES public.coach_intake_forms(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  details JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.form_activity_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Form owners can view their activity"
  ON public.form_activity_log FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.coach_intake_forms
      WHERE coach_intake_forms.id = form_activity_log.form_id
      AND coach_intake_forms.user_id = auth.uid()
    )
  );

CREATE POLICY "Staff can view all activity"
  ON public.form_activity_log FOR SELECT
  USING (
    public.has_role(auth.uid(), 'admin') OR 
    public.has_role(auth.uid(), 'health_architect')
  );

CREATE POLICY "Staff can insert activity"
  ON public.form_activity_log FOR INSERT
  WITH CHECK (
    public.has_role(auth.uid(), 'admin') OR 
    public.has_role(auth.uid(), 'health_architect') OR
    auth.uid() = user_id
  );

-- =====================
-- TRIGGERS
-- =====================

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, email, full_name)
  VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'full_name', ''));
  
  -- Default role is client
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'client');
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Update timestamp trigger
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_coach_intake_forms_updated_at
  BEFORE UPDATE ON public.coach_intake_forms
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();