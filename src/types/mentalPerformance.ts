// Mental Performance Types

export type MentalPerformancePhenotype = 
  | 'focus_deficit'
  | 'memory_challenged'
  | 'stress_reactive'
  | 'energy_depleted'
  | 'mood_fluctuating';

export type MentalPerformanceTier = 
  | 'cognitive_foundations'
  | 'performance_optimization'
  | 'elite_cognition';

export type MentalPerformanceStatus = 
  | 'pending'
  | 'in_progress'
  | 'completed'
  | 'reviewed';

export const mentalPhenotypeLabels: Record<MentalPerformancePhenotype, string> = {
  focus_deficit: 'Focus Deficit',
  memory_challenged: 'Memory Challenged',
  stress_reactive: 'Stress Reactive',
  energy_depleted: 'Energy Depleted',
  mood_fluctuating: 'Mood Fluctuating',
};

export const mentalPhenotypeDescriptions: Record<MentalPerformancePhenotype, string> = {
  focus_deficit: 'Difficulty sustaining attention and concentration on tasks',
  memory_challenged: 'Struggles with short-term memory and recall',
  stress_reactive: 'Heightened stress response affecting cognitive function',
  energy_depleted: 'Mental fatigue and low cognitive energy throughout the day',
  mood_fluctuating: 'Emotional variability impacting mental performance',
};

export const mentalTierLabels: Record<MentalPerformanceTier, string> = {
  cognitive_foundations: 'Cognitive Foundations',
  performance_optimization: 'Performance Optimization',
  elite_cognition: 'Elite Cognition',
};

export const mentalTierDescriptions: Record<MentalPerformanceTier, string> = {
  cognitive_foundations: 'Build baseline cognitive health and mental clarity',
  performance_optimization: 'Enhance focus, memory, and stress resilience',
  elite_cognition: 'Peak mental performance and flow state mastery',
};

export interface MentalPerformanceAssessment {
  id: string;
  client_id: string;
  coach_id?: string;
  
  // Cognitive Function Questions
  focus_difficulty?: number;
  memory_issues?: number;
  mental_fatigue?: number;
  brain_fog?: number;
  processing_speed?: number;
  
  // Stress & Emotional Regulation
  stress_level?: number;
  anxiety_frequency?: number;
  mood_stability?: number;
  emotional_resilience?: number;
  
  // Energy & Motivation
  morning_mental_clarity?: number;
  afternoon_energy_dip?: number;
  motivation_level?: number;
  task_completion_ability?: number;
  
  // Lifestyle Factors
  caffeine_dependency?: string;
  screen_time_hours?: number;
  exercise_frequency?: string;
  meditation_practice?: boolean;
  nutrition_quality?: number;
  
  // Work/Performance Context
  work_type?: string;
  peak_performance_hours?: string;
  cognitive_demands?: string;
  primary_mental_goals?: string;
  
  // Calculated Scores
  cognitive_function_score?: number;
  stress_resilience_score?: number;
  mental_energy_score?: number;
  
  // Classification
  phenotype?: MentalPerformancePhenotype;
  program_tier: MentalPerformanceTier;
  status: MentalPerformanceStatus;
  
  // Coach Notes
  coach_notes?: string;
  intervention_plan?: any[];
  
  created_at: string;
  updated_at: string;
}

export interface MentalPerformanceTracking {
  id: string;
  client_id: string;
  assessment_id?: string;
  entry_date: string;
  
  // Daily Cognitive Metrics
  focus_rating?: number;
  mental_clarity_rating?: number;
  memory_rating?: number;
  productivity_rating?: number;
  
  // Energy & Mood
  mental_energy_rating?: number;
  mood_rating?: number;
  stress_level?: number;
  anxiety_level?: number;
  
  // Performance Metrics
  deep_work_hours?: number;
  tasks_completed?: number;
  peak_focus_time?: string;
  distractions_count?: number;
  
  // Lifestyle Factors
  caffeine_intake?: number;
  exercise_completed?: boolean;
  meditation_minutes?: number;
  nature_exposure_minutes?: number;
  
  // Wearable Data
  hrv_score?: number;
  readiness_score?: number;
  
  notes?: string;
  factors_affecting_cognition?: string;
  
  created_at: string;
  updated_at: string;
}

export interface MentalPerformanceIntervention {
  id: string;
  name: string;
  category: string;
  description?: string;
  instructions?: string;
  duration_days?: number;
  target_phenotypes?: MentalPerformancePhenotype[];
  program_tiers?: MentalPerformanceTier[];
  sequence_order?: number;
  is_active?: boolean;
  created_at: string;
  updated_at: string;
}

export interface ClientMentalIntervention {
  id: string;
  client_id: string;
  intervention_id: string;
  assessment_id?: string;
  assigned_by?: string;
  start_date: string;
  end_date?: string;
  status?: string;
  compliance_score?: number;
  effectiveness_rating?: number;
  notes?: string;
  created_at: string;
  updated_at: string;
}

// Cognitive Function Score calculation
export const cognitiveSeverityLevels = [
  { min: 0, max: 4, label: 'Optimal', color: 'text-green-600', description: 'Excellent cognitive function' },
  { min: 5, max: 8, label: 'Mild', color: 'text-yellow-600', description: 'Minor cognitive challenges' },
  { min: 9, max: 12, label: 'Moderate', color: 'text-orange-600', description: 'Noticeable cognitive difficulties' },
  { min: 13, max: 16, label: 'Significant', color: 'text-red-500', description: 'Significant cognitive impairment' },
  { min: 17, max: 20, label: 'Severe', color: 'text-red-700', description: 'Severe cognitive dysfunction' },
];

export function calculateCognitiveScore(assessment: Partial<MentalPerformanceAssessment>): number {
  const scores = [
    assessment.focus_difficulty ?? 0,
    assessment.memory_issues ?? 0,
    assessment.mental_fatigue ?? 0,
    assessment.brain_fog ?? 0,
    assessment.processing_speed ?? 0,
  ];
  return scores.reduce((sum, score) => sum + score, 0);
}

export function getCognitiveSeverity(score: number) {
  return cognitiveSeverityLevels.find(level => score >= level.min && score <= level.max) 
    || cognitiveSeverityLevels[cognitiveSeverityLevels.length - 1];
}

export function determineMentalPhenotype(assessment: Partial<MentalPerformanceAssessment>): MentalPerformancePhenotype | null {
  const focusScore = (assessment.focus_difficulty ?? 0) + (assessment.brain_fog ?? 0);
  const memoryScore = assessment.memory_issues ?? 0;
  const stressScore = (assessment.stress_level ?? 0) / 2 + (assessment.anxiety_frequency ?? 0);
  const energyScore = (assessment.mental_fatigue ?? 0) + (10 - (assessment.morning_mental_clarity ?? 10)) / 2;
  const moodScore = (10 - (assessment.mood_stability ?? 10)) / 2 + (10 - (assessment.emotional_resilience ?? 10)) / 2;
  
  const scores: { phenotype: MentalPerformancePhenotype; score: number }[] = [
    { phenotype: 'focus_deficit', score: focusScore },
    { phenotype: 'memory_challenged', score: memoryScore * 2 },
    { phenotype: 'stress_reactive', score: stressScore },
    { phenotype: 'energy_depleted', score: energyScore },
    { phenotype: 'mood_fluctuating', score: moodScore },
  ];
  
  const maxScore = Math.max(...scores.map(s => s.score));
  if (maxScore < 3) return null;
  
  const dominant = scores.find(s => s.score === maxScore);
  return dominant?.phenotype || null;
}
