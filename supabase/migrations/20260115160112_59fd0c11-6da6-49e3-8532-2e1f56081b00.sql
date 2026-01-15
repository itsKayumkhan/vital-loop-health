-- Create mental performance phenotype enum
CREATE TYPE mental_performance_phenotype AS ENUM (
  'focus_deficit',
  'memory_challenged', 
  'stress_reactive',
  'energy_depleted',
  'mood_fluctuating'
);

-- Create mental performance program tier enum
CREATE TYPE mental_performance_tier AS ENUM (
  'cognitive_foundations',
  'performance_optimization',
  'elite_cognition'
);

-- Create mental performance assessment status enum
CREATE TYPE mental_performance_status AS ENUM (
  'pending',
  'in_progress',
  'completed',
  'reviewed'
);

-- Create mental performance assessments table
CREATE TABLE public.mental_performance_assessments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID NOT NULL REFERENCES public.crm_clients(id) ON DELETE CASCADE,
  coach_id UUID,
  
  -- Cognitive Function Questions (1-4 scale: 0=None, 1=Mild, 2=Moderate, 3=Severe, 4=Very Severe)
  focus_difficulty INTEGER CHECK (focus_difficulty >= 0 AND focus_difficulty <= 4),
  memory_issues INTEGER CHECK (memory_issues >= 0 AND memory_issues <= 4),
  mental_fatigue INTEGER CHECK (mental_fatigue >= 0 AND mental_fatigue <= 4),
  brain_fog INTEGER CHECK (brain_fog >= 0 AND brain_fog <= 4),
  processing_speed INTEGER CHECK (processing_speed >= 0 AND processing_speed <= 4),
  
  -- Stress & Emotional Regulation
  stress_level INTEGER CHECK (stress_level >= 0 AND stress_level <= 10),
  anxiety_frequency INTEGER CHECK (anxiety_frequency >= 0 AND anxiety_frequency <= 4),
  mood_stability INTEGER CHECK (mood_stability >= 0 AND mood_stability <= 10),
  emotional_resilience INTEGER CHECK (emotional_resilience >= 0 AND emotional_resilience <= 10),
  
  -- Energy & Motivation
  morning_mental_clarity INTEGER CHECK (morning_mental_clarity >= 0 AND morning_mental_clarity <= 10),
  afternoon_energy_dip INTEGER CHECK (afternoon_energy_dip >= 0 AND afternoon_energy_dip <= 10),
  motivation_level INTEGER CHECK (motivation_level >= 0 AND motivation_level <= 10),
  task_completion_ability INTEGER CHECK (task_completion_ability >= 0 AND task_completion_ability <= 10),
  
  -- Lifestyle Factors
  caffeine_dependency TEXT,
  screen_time_hours INTEGER,
  exercise_frequency TEXT,
  meditation_practice BOOLEAN DEFAULT false,
  nutrition_quality INTEGER CHECK (nutrition_quality >= 0 AND nutrition_quality <= 10),
  
  -- Work/Performance Context
  work_type TEXT,
  peak_performance_hours TEXT,
  cognitive_demands TEXT,
  primary_mental_goals TEXT,
  
  -- Calculated Scores
  cognitive_function_score INTEGER,
  stress_resilience_score INTEGER,
  mental_energy_score INTEGER,
  
  -- Classification
  phenotype mental_performance_phenotype,
  program_tier mental_performance_tier NOT NULL DEFAULT 'cognitive_foundations',
  status mental_performance_status NOT NULL DEFAULT 'pending',
  
  -- Coach Notes
  coach_notes TEXT,
  intervention_plan JSONB DEFAULT '[]'::jsonb,
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create mental performance tracking entries table
CREATE TABLE public.mental_performance_tracking (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID NOT NULL REFERENCES public.crm_clients(id) ON DELETE CASCADE,
  assessment_id UUID REFERENCES public.mental_performance_assessments(id) ON DELETE SET NULL,
  entry_date DATE NOT NULL DEFAULT CURRENT_DATE,
  
  -- Daily Cognitive Metrics
  focus_rating INTEGER CHECK (focus_rating >= 1 AND focus_rating <= 10),
  mental_clarity_rating INTEGER CHECK (mental_clarity_rating >= 1 AND mental_clarity_rating <= 10),
  memory_rating INTEGER CHECK (memory_rating >= 1 AND memory_rating <= 10),
  productivity_rating INTEGER CHECK (productivity_rating >= 1 AND productivity_rating <= 10),
  
  -- Energy & Mood
  mental_energy_rating INTEGER CHECK (mental_energy_rating >= 1 AND mental_energy_rating <= 10),
  mood_rating INTEGER CHECK (mood_rating >= 1 AND mood_rating <= 10),
  stress_level INTEGER CHECK (stress_level >= 1 AND stress_level <= 10),
  anxiety_level INTEGER CHECK (anxiety_level >= 1 AND anxiety_level <= 10),
  
  -- Performance Metrics
  deep_work_hours NUMERIC(4,2),
  tasks_completed INTEGER,
  peak_focus_time TEXT,
  distractions_count INTEGER,
  
  -- Lifestyle Factors
  caffeine_intake INTEGER,
  exercise_completed BOOLEAN DEFAULT false,
  meditation_minutes INTEGER,
  nature_exposure_minutes INTEGER,
  
  -- Wearable Data (if available)
  hrv_score INTEGER,
  readiness_score INTEGER,
  
  notes TEXT,
  factors_affecting_cognition TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create mental performance interventions library table
CREATE TABLE public.mental_performance_interventions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  description TEXT,
  instructions TEXT,
  duration_days INTEGER,
  target_phenotypes mental_performance_phenotype[],
  program_tiers mental_performance_tier[],
  sequence_order INTEGER DEFAULT 1,
  is_active BOOLEAN DEFAULT true,
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create client mental performance interventions table
CREATE TABLE public.client_mental_interventions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID NOT NULL REFERENCES public.crm_clients(id) ON DELETE CASCADE,
  intervention_id UUID NOT NULL REFERENCES public.mental_performance_interventions(id) ON DELETE CASCADE,
  assessment_id UUID REFERENCES public.mental_performance_assessments(id) ON DELETE SET NULL,
  assigned_by UUID,
  
  start_date DATE NOT NULL DEFAULT CURRENT_DATE,
  end_date DATE,
  status TEXT DEFAULT 'active',
  compliance_score INTEGER CHECK (compliance_score >= 0 AND compliance_score <= 100),
  effectiveness_rating INTEGER CHECK (effectiveness_rating >= 1 AND effectiveness_rating <= 10),
  notes TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.mental_performance_assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mental_performance_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mental_performance_interventions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.client_mental_interventions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for mental_performance_assessments
CREATE POLICY "Staff can manage mental assessments" ON public.mental_performance_assessments
  FOR ALL USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'health_architect'));

CREATE POLICY "Staff can view all mental assessments" ON public.mental_performance_assessments
  FOR SELECT USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'health_architect') OR has_role(auth.uid(), 'coach'));

CREATE POLICY "Coaches can manage assigned mental assessments" ON public.mental_performance_assessments
  FOR ALL USING (has_role(auth.uid(), 'coach') AND coach_id = auth.uid());

-- RLS Policies for mental_performance_tracking
CREATE POLICY "Staff can manage mental tracking" ON public.mental_performance_tracking
  FOR ALL USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'health_architect'));

CREATE POLICY "Staff can view all mental tracking" ON public.mental_performance_tracking
  FOR SELECT USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'health_architect') OR has_role(auth.uid(), 'coach'));

-- RLS Policies for mental_performance_interventions
CREATE POLICY "Admins can manage mental interventions" ON public.mental_performance_interventions
  FOR ALL USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'health_architect'));

CREATE POLICY "Anyone can view active mental interventions" ON public.mental_performance_interventions
  FOR SELECT USING (is_active = true);

-- RLS Policies for client_mental_interventions
CREATE POLICY "Staff can manage client mental interventions" ON public.client_mental_interventions
  FOR ALL USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'health_architect'));

CREATE POLICY "Staff can view client mental interventions" ON public.client_mental_interventions
  FOR SELECT USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'health_architect') OR has_role(auth.uid(), 'coach'));

-- Create updated_at triggers
CREATE TRIGGER update_mental_assessments_updated_at
  BEFORE UPDATE ON public.mental_performance_assessments
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_mental_tracking_updated_at
  BEFORE UPDATE ON public.mental_performance_tracking
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_mental_interventions_updated_at
  BEFORE UPDATE ON public.mental_performance_interventions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_client_mental_interventions_updated_at
  BEFORE UPDATE ON public.client_mental_interventions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default mental performance interventions
INSERT INTO public.mental_performance_interventions (name, category, description, instructions, duration_days, target_phenotypes, program_tiers, sequence_order) VALUES
('Morning Light Protocol', 'circadian', 'Optimize cortisol awakening response for mental clarity', 'Get 10-15 minutes of natural light within 30 minutes of waking. Avoid sunglasses during this time.', 14, ARRAY['focus_deficit', 'energy_depleted']::mental_performance_phenotype[], ARRAY['cognitive_foundations', 'performance_optimization', 'elite_cognition']::mental_performance_tier[], 1),
('Focus Block Training', 'attention', 'Build sustained attention capacity through structured work blocks', 'Start with 25-minute focus blocks with 5-minute breaks. Gradually increase to 90-minute blocks over 4 weeks.', 28, ARRAY['focus_deficit']::mental_performance_phenotype[], ARRAY['cognitive_foundations', 'performance_optimization']::mental_performance_tier[], 2),
('Stress Inoculation Protocol', 'stress', 'Build stress resilience through controlled exposure', 'Daily cold exposure (30 sec cold shower), breathwork practice, and progressive stress challenges.', 21, ARRAY['stress_reactive', 'mood_fluctuating']::mental_performance_phenotype[], ARRAY['performance_optimization', 'elite_cognition']::mental_performance_tier[], 3),
('Cognitive Nutrition Protocol', 'nutrition', 'Optimize brain nutrition for mental performance', 'Focus on omega-3s, choline sources, polyphenols. Time protein intake for neurotransmitter support.', 30, ARRAY['focus_deficit', 'memory_challenged', 'energy_depleted']::mental_performance_phenotype[], ARRAY['cognitive_foundations', 'performance_optimization', 'elite_cognition']::mental_performance_tier[], 1),
('Memory Enhancement Training', 'cognitive', 'Strengthen memory through spaced repetition and active recall', 'Daily memory exercises: visualization, spaced repetition practice, and learning new skills.', 42, ARRAY['memory_challenged']::mental_performance_phenotype[], ARRAY['cognitive_foundations', 'performance_optimization']::mental_performance_tier[], 2),
('Nervous System Reset', 'regulation', 'Down-regulate overactive stress response', 'Daily vagal toning: humming, cold face immersion, extended exhales. Evening wind-down routine.', 14, ARRAY['stress_reactive', 'mood_fluctuating']::mental_performance_phenotype[], ARRAY['cognitive_foundations', 'performance_optimization']::mental_performance_tier[], 1),
('Peak State Training', 'performance', 'Optimize flow state access and peak cognitive performance', 'Pre-performance protocols, state anchoring, and deliberate practice of flow triggers.', 30, ARRAY['focus_deficit', 'energy_depleted']::mental_performance_phenotype[], ARRAY['elite_cognition']::mental_performance_tier[], 4),
('Digital Detox Protocol', 'environment', 'Reduce cognitive load from digital overwhelm', 'Structured screen breaks, notification management, phone-free morning routine.', 14, ARRAY['focus_deficit', 'stress_reactive']::mental_performance_phenotype[], ARRAY['cognitive_foundations', 'performance_optimization']::mental_performance_tier[], 1),
('Caffeine Optimization', 'stimulant', 'Strategic caffeine use for sustained mental energy', 'Delay first caffeine 90-120 min post-wake. Cycle caffeine intake. No caffeine after 2pm.', 21, ARRAY['energy_depleted', 'focus_deficit']::mental_performance_phenotype[], ARRAY['cognitive_foundations', 'performance_optimization']::mental_performance_tier[], 2),
('Mindfulness Integration', 'meditation', 'Build attention control through meditation practice', 'Progressive meditation: start with 5 min daily, build to 20 min. Focus on breath awareness.', 60, ARRAY['focus_deficit', 'stress_reactive', 'mood_fluctuating']::mental_performance_phenotype[], ARRAY['cognitive_foundations', 'performance_optimization', 'elite_cognition']::mental_performance_tier[], 1);