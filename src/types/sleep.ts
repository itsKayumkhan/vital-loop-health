export type SleepPhenotype = 'stress_dominant' | 'circadian_shifted' | 'fragmented' | 'short_duration' | 'recovery_deficient';
export type SleepProgramTier = 'foundational' | 'advanced' | 'elite';
export type SleepAssessmentStatus = 'pending' | 'in_progress' | 'completed' | 'reviewed';

export const sleepPhenotypeLabels: Record<SleepPhenotype, string> = {
  stress_dominant: 'Stress-Dominant Sleeper',
  circadian_shifted: 'Circadian-Shifted Sleeper',
  fragmented: 'Fragmented Sleeper',
  short_duration: 'Short-Duration Sleeper',
  recovery_deficient: 'Recovery-Deficient Sleeper',
};

export const sleepPhenotypeDescriptions: Record<SleepPhenotype, string> = {
  stress_dominant: 'Racing mind, difficulty unwinding, stress-driven insomnia patterns',
  circadian_shifted: 'Misaligned sleep schedule, difficulty with consistent timing',
  fragmented: 'Multiple night awakenings, disrupted sleep architecture',
  short_duration: 'Insufficient total sleep time despite opportunity',
  recovery_deficient: 'Poor recovery metrics despite adequate sleep duration',
};

export const programTierLabels: Record<SleepProgramTier, string> = {
  foundational: 'Sleep Reset Protocol',
  advanced: 'Circadian Optimization Program',
  elite: 'NeuroRecovery & Sleep Performance System',
};

export const programTierDescriptions: Record<SleepProgramTier, string> = {
  foundational: 'Stabilization, routine establishment, and baseline recovery optimization',
  advanced: 'Hormonal rhythm optimization, deep sleep enhancement, and consistency training',
  elite: 'Nervous system regulation, REM/deep sleep maximization, and elite recovery protocols',
};

export interface SleepAssessment {
  id: string;
  client_id: string;
  coach_id: string | null;
  program_tier: SleepProgramTier;
  status: SleepAssessmentStatus;
  phenotype: SleepPhenotype | null;
  
  // ISI-inspired questions
  difficulty_falling_asleep: number | null;
  difficulty_staying_asleep: number | null;
  waking_too_early: number | null;
  sleep_satisfaction: number | null;
  sleep_interference_daily: number | null;
  sleep_distress: number | null;
  
  // Lifestyle factors
  average_bedtime: string | null;
  average_wake_time: string | null;
  caffeine_intake: string | null;
  last_caffeine_time: string | null;
  screen_time_before_bed: number | null;
  exercise_timing: string | null;
  stress_level: number | null;
  
  // Environment
  bedroom_temperature: string | null;
  light_exposure: string | null;
  noise_level: string | null;
  sleep_environment_notes: string | null;
  
  // Current aids
  current_sleep_aids: string | null;
  medications: string | null;
  
  // Goals and notes
  primary_sleep_goals: string | null;
  coach_notes: string | null;
  intervention_plan: any[];
  
  // Scores
  isi_score: number | null;
  sleep_quality_score: number | null;
  
  created_at: string;
  updated_at: string;
}

export interface SleepTrackingEntry {
  id: string;
  client_id: string;
  assessment_id: string | null;
  entry_date: string;
  
  // Nightly metrics
  bedtime: string | null;
  wake_time: string | null;
  sleep_onset_minutes: number | null;
  night_awakenings: number | null;
  time_awake_minutes: number | null;
  
  // Morning ratings
  sleep_quality_rating: number | null;
  morning_energy_rating: number | null;
  mood_rating: number | null;
  
  // Daytime metrics
  daytime_focus_rating: number | null;
  stress_resilience_rating: number | null;
  recovery_score: number | null;
  
  // Wearable data
  total_sleep_hours: number | null;
  deep_sleep_hours: number | null;
  rem_sleep_hours: number | null;
  light_sleep_hours: number | null;
  hrv_score: number | null;
  resting_heart_rate: number | null;
  
  notes: string | null;
  factors_affecting_sleep: string | null;
  
  created_at: string;
  updated_at: string;
}

export interface SleepIntervention {
  id: string;
  name: string;
  category: string;
  description: string | null;
  instructions: string | null;
  target_phenotypes: SleepPhenotype[];
  program_tiers: SleepProgramTier[];
  sequence_order: number;
  duration_days: number | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ClientSleepIntervention {
  id: string;
  client_id: string;
  intervention_id: string;
  assessment_id: string | null;
  assigned_by: string | null;
  status: string;
  start_date: string;
  end_date: string | null;
  compliance_score: number | null;
  effectiveness_rating: number | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  intervention?: SleepIntervention;
}

// ISI scoring helpers
export const isiSeverityLevels = [
  { min: 0, max: 7, label: 'No clinically significant insomnia', color: 'text-green-600' },
  { min: 8, max: 14, label: 'Subthreshold insomnia', color: 'text-yellow-600' },
  { min: 15, max: 21, label: 'Clinical insomnia (moderate)', color: 'text-orange-600' },
  { min: 22, max: 28, label: 'Clinical insomnia (severe)', color: 'text-red-600' },
];

export function calculateISIScore(assessment: Partial<SleepAssessment>): number {
  const questions = [
    assessment.difficulty_falling_asleep,
    assessment.difficulty_staying_asleep,
    assessment.waking_too_early,
    assessment.sleep_satisfaction,
    assessment.sleep_interference_daily,
    assessment.sleep_distress,
  ];
  
  const validScores = questions.filter((q): q is number => q !== null && q !== undefined);
  if (validScores.length < 6) return 0;
  
  return validScores.reduce((sum, score) => sum + score, 0);
}

export function getISISeverity(score: number) {
  return isiSeverityLevels.find(level => score >= level.min && score <= level.max) || isiSeverityLevels[0];
}

export function determinePhenotype(assessment: Partial<SleepAssessment>): SleepPhenotype | null {
  if (!assessment.stress_level) return null;
  
  // High stress + difficulty falling asleep = stress dominant
  if ((assessment.stress_level || 0) >= 7 && (assessment.difficulty_falling_asleep || 0) >= 3) {
    return 'stress_dominant';
  }
  
  // Multiple awakenings = fragmented
  if ((assessment.difficulty_staying_asleep || 0) >= 3 || (assessment.waking_too_early || 0) >= 3) {
    return 'fragmented';
  }
  
  // Low satisfaction with sleep despite opportunity = short duration or circadian
  if ((assessment.sleep_satisfaction || 0) >= 3) {
    // Check for timing issues
    return 'circadian_shifted';
  }
  
  // Athletes or high performers with poor recovery
  if ((assessment.sleep_interference_daily || 0) >= 3) {
    return 'recovery_deficient';
  }
  
  return 'short_duration';
}
