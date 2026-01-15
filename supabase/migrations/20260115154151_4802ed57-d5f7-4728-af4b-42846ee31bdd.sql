-- Create sleep phenotype enum
CREATE TYPE sleep_phenotype AS ENUM (
  'stress_dominant',
  'circadian_shifted',
  'fragmented',
  'short_duration',
  'recovery_deficient'
);

-- Create sleep program tier enum
CREATE TYPE sleep_program_tier AS ENUM (
  'foundational',
  'advanced',
  'elite'
);

-- Create sleep assessment status enum
CREATE TYPE sleep_assessment_status AS ENUM (
  'pending',
  'in_progress',
  'completed',
  'reviewed'
);

-- Sleep assessments table for intake forms
CREATE TABLE public.sleep_assessments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID NOT NULL REFERENCES public.crm_clients(id) ON DELETE CASCADE,
  coach_id UUID,
  program_tier sleep_program_tier NOT NULL DEFAULT 'foundational',
  status sleep_assessment_status NOT NULL DEFAULT 'pending',
  phenotype sleep_phenotype,
  
  -- ISI-inspired questions (0-4 scale)
  difficulty_falling_asleep INTEGER CHECK (difficulty_falling_asleep >= 0 AND difficulty_falling_asleep <= 4),
  difficulty_staying_asleep INTEGER CHECK (difficulty_staying_asleep >= 0 AND difficulty_staying_asleep <= 4),
  waking_too_early INTEGER CHECK (waking_too_early >= 0 AND waking_too_early <= 4),
  sleep_satisfaction INTEGER CHECK (sleep_satisfaction >= 0 AND sleep_satisfaction <= 4),
  sleep_interference_daily INTEGER CHECK (sleep_interference_daily >= 0 AND sleep_interference_daily <= 4),
  sleep_distress INTEGER CHECK (sleep_distress >= 0 AND sleep_distress <= 4),
  
  -- Lifestyle factors
  average_bedtime TIME,
  average_wake_time TIME,
  caffeine_intake TEXT,
  last_caffeine_time TIME,
  screen_time_before_bed INTEGER, -- minutes
  exercise_timing TEXT,
  stress_level INTEGER CHECK (stress_level >= 1 AND stress_level <= 10),
  
  -- Environment
  bedroom_temperature TEXT,
  light_exposure TEXT,
  noise_level TEXT,
  sleep_environment_notes TEXT,
  
  -- Current supplements/medications
  current_sleep_aids TEXT,
  medications TEXT,
  
  -- Goals and notes
  primary_sleep_goals TEXT,
  coach_notes TEXT,
  intervention_plan JSONB DEFAULT '[]'::jsonb,
  
  -- Scores (calculated)
  isi_score INTEGER,
  sleep_quality_score INTEGER,
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Sleep tracking entries for ongoing monitoring
CREATE TABLE public.sleep_tracking_entries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID NOT NULL REFERENCES public.crm_clients(id) ON DELETE CASCADE,
  assessment_id UUID REFERENCES public.sleep_assessments(id) ON DELETE SET NULL,
  entry_date DATE NOT NULL DEFAULT CURRENT_DATE,
  
  -- Nightly metrics
  bedtime TIME,
  wake_time TIME,
  sleep_onset_minutes INTEGER,
  night_awakenings INTEGER,
  time_awake_minutes INTEGER,
  
  -- Morning ratings (1-10)
  sleep_quality_rating INTEGER CHECK (sleep_quality_rating >= 1 AND sleep_quality_rating <= 10),
  morning_energy_rating INTEGER CHECK (morning_energy_rating >= 1 AND morning_energy_rating <= 10),
  mood_rating INTEGER CHECK (mood_rating >= 1 AND mood_rating <= 10),
  
  -- Daytime metrics (1-10)
  daytime_focus_rating INTEGER CHECK (daytime_focus_rating >= 1 AND daytime_focus_rating <= 10),
  stress_resilience_rating INTEGER CHECK (stress_resilience_rating >= 1 AND stress_resilience_rating <= 10),
  recovery_score INTEGER CHECK (recovery_score >= 1 AND recovery_score <= 10),
  
  -- Wearable data (optional)
  total_sleep_hours NUMERIC(4,2),
  deep_sleep_hours NUMERIC(4,2),
  rem_sleep_hours NUMERIC(4,2),
  light_sleep_hours NUMERIC(4,2),
  hrv_score INTEGER,
  resting_heart_rate INTEGER,
  
  -- Notes
  notes TEXT,
  factors_affecting_sleep TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  UNIQUE(client_id, entry_date)
);

-- Sleep interventions library (coach-managed)
CREATE TABLE public.sleep_interventions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL, -- behavioral, nutrition, supplement, environment, nervous_system
  description TEXT,
  instructions TEXT,
  target_phenotypes sleep_phenotype[],
  program_tiers sleep_program_tier[],
  sequence_order INTEGER DEFAULT 1,
  duration_days INTEGER,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Client intervention assignments
CREATE TABLE public.client_sleep_interventions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID NOT NULL REFERENCES public.crm_clients(id) ON DELETE CASCADE,
  intervention_id UUID NOT NULL REFERENCES public.sleep_interventions(id) ON DELETE CASCADE,
  assessment_id UUID REFERENCES public.sleep_assessments(id) ON DELETE SET NULL,
  assigned_by UUID,
  status TEXT DEFAULT 'active', -- active, completed, paused, discontinued
  start_date DATE NOT NULL DEFAULT CURRENT_DATE,
  end_date DATE,
  compliance_score INTEGER,
  effectiveness_rating INTEGER,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.sleep_assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sleep_tracking_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sleep_interventions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.client_sleep_interventions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for sleep_assessments
CREATE POLICY "Staff can view all sleep assessments" ON public.sleep_assessments
  FOR SELECT USING (
    has_role(auth.uid(), 'admin') OR 
    has_role(auth.uid(), 'health_architect') OR 
    has_role(auth.uid(), 'coach')
  );

CREATE POLICY "Staff can manage sleep assessments" ON public.sleep_assessments
  FOR ALL USING (
    has_role(auth.uid(), 'admin') OR 
    has_role(auth.uid(), 'health_architect')
  );

CREATE POLICY "Coaches can manage assigned assessments" ON public.sleep_assessments
  FOR ALL USING (
    has_role(auth.uid(), 'coach') AND coach_id = auth.uid()
  );

-- RLS Policies for sleep_tracking_entries
CREATE POLICY "Staff can view all tracking entries" ON public.sleep_tracking_entries
  FOR SELECT USING (
    has_role(auth.uid(), 'admin') OR 
    has_role(auth.uid(), 'health_architect') OR 
    has_role(auth.uid(), 'coach')
  );

CREATE POLICY "Staff can manage tracking entries" ON public.sleep_tracking_entries
  FOR ALL USING (
    has_role(auth.uid(), 'admin') OR 
    has_role(auth.uid(), 'health_architect')
  );

-- RLS Policies for sleep_interventions (admin-managed library)
CREATE POLICY "Anyone can view active interventions" ON public.sleep_interventions
  FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage interventions" ON public.sleep_interventions
  FOR ALL USING (
    has_role(auth.uid(), 'admin') OR 
    has_role(auth.uid(), 'health_architect')
  );

-- RLS Policies for client_sleep_interventions
CREATE POLICY "Staff can view client interventions" ON public.client_sleep_interventions
  FOR SELECT USING (
    has_role(auth.uid(), 'admin') OR 
    has_role(auth.uid(), 'health_architect') OR 
    has_role(auth.uid(), 'coach')
  );

CREATE POLICY "Staff can manage client interventions" ON public.client_sleep_interventions
  FOR ALL USING (
    has_role(auth.uid(), 'admin') OR 
    has_role(auth.uid(), 'health_architect')
  );

-- Triggers for updated_at
CREATE TRIGGER update_sleep_assessments_updated_at
  BEFORE UPDATE ON public.sleep_assessments
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_sleep_tracking_entries_updated_at
  BEFORE UPDATE ON public.sleep_tracking_entries
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_sleep_interventions_updated_at
  BEFORE UPDATE ON public.sleep_interventions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_client_sleep_interventions_updated_at
  BEFORE UPDATE ON public.client_sleep_interventions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default interventions library
INSERT INTO public.sleep_interventions (name, category, description, instructions, target_phenotypes, program_tiers, sequence_order, duration_days) VALUES
('Morning Light Protocol', 'behavioral', 'Circadian rhythm reset through strategic light exposure', 'Get 10-30 minutes of natural light within 30 minutes of waking. Avoid sunglasses during this time.', ARRAY['circadian_shifted', 'stress_dominant']::sleep_phenotype[], ARRAY['foundational', 'advanced', 'elite']::sleep_program_tier[], 1, 21),
('Caffeine Curfew', 'behavioral', 'Optimize adenosine clearance for better sleep pressure', 'No caffeine after 2pm (or 8 hours before bedtime). Switch to decaf or herbal alternatives.', ARRAY['stress_dominant', 'fragmented']::sleep_phenotype[], ARRAY['foundational', 'advanced', 'elite']::sleep_program_tier[], 2, 14),
('Digital Sunset Protocol', 'environment', 'Reduce blue light and stimulation before bed', 'No screens 1-2 hours before bed. Use night mode on devices after sunset. Consider blue-light blocking glasses.', ARRAY['circadian_shifted', 'fragmented', 'stress_dominant']::sleep_phenotype[], ARRAY['foundational', 'advanced', 'elite']::sleep_program_tier[], 3, 21),
('Sleep Environment Optimization', 'environment', 'Create optimal sleep conditions', 'Room temperature 65-68°F. Complete darkness (blackout curtains). White noise if needed. Remove all electronics.', ARRAY['fragmented', 'recovery_deficient']::sleep_phenotype[], ARRAY['foundational', 'advanced', 'elite']::sleep_program_tier[], 4, 14),
('Evening Wind-Down Routine', 'behavioral', 'Signal to body that sleep is approaching', 'Begin relaxation activities 60-90 min before bed. Include: dim lights, gentle stretching, reading, or meditation.', ARRAY['stress_dominant', 'fragmented']::sleep_phenotype[], ARRAY['foundational', 'advanced', 'elite']::sleep_program_tier[], 5, 21),
('Nervous System Down-Regulation', 'nervous_system', 'Activate parasympathetic response', 'Practice 4-7-8 breathing or physiological sigh before bed. 5-10 minutes of guided relaxation or body scan meditation.', ARRAY['stress_dominant', 'recovery_deficient']::sleep_phenotype[], ARRAY['advanced', 'elite']::sleep_program_tier[], 1, 30),
('Magnesium Protocol', 'supplement', 'Support GABA and relaxation pathways', 'Magnesium glycinate 300-400mg, 30-60 minutes before bed. Start with lower dose.', ARRAY['stress_dominant', 'fragmented', 'recovery_deficient']::sleep_phenotype[], ARRAY['advanced', 'elite']::sleep_program_tier[], 2, 30),
('Sleep Timing Consistency', 'behavioral', 'Strengthen circadian entrainment', 'Same bedtime and wake time every day (including weekends). Variance should be <30 minutes.', ARRAY['circadian_shifted', 'short_duration']::sleep_phenotype[], ARRAY['foundational', 'advanced', 'elite']::sleep_program_tier[], 1, 30),
('Strategic Napping Protocol', 'behavioral', 'Optimize daytime recovery without disrupting night sleep', 'If needed: nap before 2pm, max 20-30 minutes. Avoid napping if you have sleep onset issues.', ARRAY['short_duration', 'recovery_deficient']::sleep_phenotype[], ARRAY['advanced', 'elite']::sleep_program_tier[], 3, 14),
('HRV-Guided Recovery', 'nervous_system', 'Use biofeedback for optimal recovery', 'Morning HRV measurements to guide training intensity. Adjust evening protocols based on recovery scores.', ARRAY['recovery_deficient']::sleep_phenotype[], ARRAY['elite']::sleep_program_tier[], 1, 60);