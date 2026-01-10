import { Utensils, Dumbbell, Moon, Brain, LucideIcon } from 'lucide-react';

export type CoachSpecialty = 'nutrition' | 'performance' | 'wellness_recovery' | 'mental_performance';

export interface FormField {
  id: string;
  label: string;
  type: 'text' | 'textarea' | 'select' | 'radio' | 'checkbox' | 'number' | 'date';
  placeholder?: string;
  options?: string[];
  required?: boolean;
}

export interface FormSection {
  title: string;
  description?: string;
  fields: FormField[];
}

export interface CoachFormConfig {
  specialty: CoachSpecialty;
  title: string;
  tagline: string;
  description: string;
  icon: LucideIcon;
  gradient: string;
  sections: FormSection[];
}

export const coachForms: CoachFormConfig[] = [
  {
    specialty: 'nutrition',
    title: 'Nutrition Coach Intake',
    tagline: 'Your Fuel Strategist',
    description: 'Help us understand your current eating habits, goals, and preferences so we can design a personalized nutrition strategy based on your genetic metabolic profile.',
    icon: Utensils,
    gradient: 'from-orange-500 to-amber-500',
    sections: [
      {
        title: 'Current Nutrition Overview',
        description: 'Tell us about your current eating patterns',
        fields: [
          { id: 'meals_per_day', label: 'How many meals do you typically eat per day?', type: 'select', options: ['1-2', '3', '4-5', '6+'], required: true },
          { id: 'eating_schedule', label: 'Do you follow a consistent eating schedule?', type: 'radio', options: ['Yes, very consistent', 'Somewhat consistent', 'No, it varies daily'], required: true },
          { id: 'typical_breakfast', label: 'What does a typical breakfast look like for you?', type: 'textarea', placeholder: 'Describe your usual breakfast...', required: true },
          { id: 'typical_lunch', label: 'What does a typical lunch look like for you?', type: 'textarea', placeholder: 'Describe your usual lunch...', required: true },
          { id: 'typical_dinner', label: 'What does a typical dinner look like for you?', type: 'textarea', placeholder: 'Describe your usual dinner...', required: true },
          { id: 'snacking_habits', label: 'Describe your snacking habits', type: 'textarea', placeholder: 'What do you typically snack on and when?', required: false },
        ],
      },
      {
        title: 'Dietary Preferences & Restrictions',
        fields: [
          { id: 'dietary_restrictions', label: 'Do you have any dietary restrictions?', type: 'checkbox', options: ['Vegetarian', 'Vegan', 'Gluten-free', 'Dairy-free', 'Keto', 'Paleo', 'None'] },
          { id: 'food_allergies', label: 'List any food allergies or intolerances', type: 'textarea', placeholder: 'E.g., nuts, shellfish, lactose...', required: false },
          { id: 'foods_dislike', label: 'Are there any foods you strongly dislike?', type: 'textarea', placeholder: 'List foods you prefer to avoid...', required: false },
          { id: 'foods_love', label: 'What foods do you absolutely love?', type: 'textarea', placeholder: 'List your favorite foods...', required: false },
        ],
      },
      {
        title: 'Goals & Challenges',
        fields: [
          { id: 'nutrition_goals', label: 'What are your primary nutrition goals?', type: 'checkbox', options: ['Weight loss', 'Muscle gain', 'Better energy', 'Improved digestion', 'Blood sugar control', 'Athletic performance', 'General health'] },
          { id: 'biggest_challenge', label: 'What is your biggest nutrition challenge?', type: 'textarea', placeholder: 'E.g., late night snacking, meal prep, cravings...', required: true },
          { id: 'past_diets', label: 'Have you tried any diets or nutrition programs before? What worked or didnt?', type: 'textarea', placeholder: 'Share your past experiences...', required: false },
          { id: 'cgm_interest', label: 'Are you interested in using CGM (Continuous Glucose Monitoring)?', type: 'radio', options: ['Yes, definitely', 'Maybe, tell me more', 'No, not interested'], required: true },
        ],
      },
      {
        title: 'Lifestyle Context',
        fields: [
          { id: 'cooking_frequency', label: 'How often do you cook at home?', type: 'select', options: ['Every day', '4-6 times/week', '2-3 times/week', 'Rarely', 'Never'], required: true },
          { id: 'eating_out', label: 'How often do you eat out or order takeout?', type: 'select', options: ['Daily', '4-6 times/week', '2-3 times/week', 'Once a week', 'Rarely'], required: true },
          { id: 'meal_prep_time', label: 'How much time can you dedicate to meal prep?', type: 'select', options: ['Less than 30 min/day', '30-60 min/day', '1-2 hours/day', 'Unlimited'], required: true },
          { id: 'hydration', label: 'How much water do you drink daily?', type: 'select', options: ['Less than 4 glasses', '4-6 glasses', '6-8 glasses', '8+ glasses'], required: true },
        ],
      },
    ],
  },
  {
    specialty: 'performance',
    title: 'Performance Coach Intake',
    tagline: 'Your Physical Architect',
    description: 'Share your training background, goals, and physical capabilities so we can create a genetically-informed training program that maximizes results.',
    icon: Dumbbell,
    gradient: 'from-red-500 to-rose-500',
    sections: [
      {
        title: 'Training History',
        description: 'Tell us about your exercise background',
        fields: [
          { id: 'training_experience', label: 'How long have you been training consistently?', type: 'select', options: ['Just starting', 'Less than 1 year', '1-3 years', '3-5 years', '5+ years'], required: true },
          { id: 'current_routine', label: 'Describe your current workout routine', type: 'textarea', placeholder: 'Include frequency, types of exercise, duration...', required: true },
          { id: 'training_types', label: 'What types of training do you currently do?', type: 'checkbox', options: ['Weightlifting', 'Cardio/Running', 'HIIT', 'CrossFit', 'Yoga/Mobility', 'Sports', 'Swimming', 'Cycling'] },
          { id: 'weekly_frequency', label: 'How many days per week do you currently train?', type: 'select', options: ['0-1', '2-3', '4-5', '6-7'], required: true },
        ],
      },
      {
        title: 'Physical Assessment',
        fields: [
          { id: 'injuries_history', label: 'Do you have any current or past injuries we should know about?', type: 'textarea', placeholder: 'Describe any injuries, surgeries, or physical limitations...', required: true },
          { id: 'mobility_issues', label: 'Any mobility or flexibility limitations?', type: 'textarea', placeholder: 'E.g., tight hips, shoulder restrictions...', required: false },
          { id: 'current_fitness_level', label: 'How would you rate your current fitness level?', type: 'select', options: ['Beginner', 'Intermediate', 'Advanced', 'Elite'], required: true },
          { id: 'equipment_access', label: 'What equipment do you have access to?', type: 'checkbox', options: ['Full gym', 'Home gym', 'Dumbbells only', 'Bodyweight only', 'Cardio machines', 'Resistance bands'] },
        ],
      },
      {
        title: 'Performance Goals',
        fields: [
          { id: 'primary_goals', label: 'What are your primary training goals?', type: 'checkbox', options: ['Build muscle', 'Lose fat', 'Increase strength', 'Improve endurance', 'Athletic performance', 'General fitness', 'Competition prep'] },
          { id: 'specific_targets', label: 'Do you have any specific performance targets?', type: 'textarea', placeholder: 'E.g., run a 5K in under 25 min, bench press 200lbs...', required: false },
          { id: 'sports_activities', label: 'Do you play any sports or have specific athletic goals?', type: 'textarea', placeholder: 'List sports, competitions, or events...', required: false },
          { id: 'vo2max_tested', label: 'Have you ever had your VO2max tested?', type: 'radio', options: ['Yes', 'No', 'Not sure what that is'], required: true },
        ],
      },
      {
        title: 'Schedule & Preferences',
        fields: [
          { id: 'preferred_training_time', label: 'When do you prefer to train?', type: 'select', options: ['Early morning (5-7am)', 'Morning (7-10am)', 'Midday (10am-2pm)', 'Afternoon (2-5pm)', 'Evening (5-8pm)', 'Night (8pm+)'], required: true },
          { id: 'session_duration', label: 'How long can you dedicate to each training session?', type: 'select', options: ['30 min', '45 min', '60 min', '90 min', '2+ hours'], required: true },
          { id: 'training_environment', label: 'Where do you primarily train?', type: 'select', options: ['Commercial gym', 'Home gym', 'Outdoors', 'CrossFit box', 'Sports facility'], required: true },
          { id: 'coaching_style', label: 'What coaching style do you respond best to?', type: 'radio', options: ['Detailed programming with explanations', 'Just tell me what to do', 'Flexible guidelines', 'High accountability/check-ins'], required: true },
        ],
      },
    ],
  },
  {
    specialty: 'wellness_recovery',
    title: 'Wellness & Recovery Coach Intake',
    tagline: 'Your Restoration Specialist',
    description: 'Help us understand your sleep patterns, stress levels, and recovery habits so we can optimize the hours you\'re not training.',
    icon: Moon,
    gradient: 'from-indigo-500 to-purple-500',
    sections: [
      {
        title: 'Sleep Assessment',
        description: 'Tell us about your sleep habits',
        fields: [
          { id: 'sleep_duration', label: 'How many hours of sleep do you typically get?', type: 'select', options: ['Less than 5', '5-6 hours', '6-7 hours', '7-8 hours', '8+ hours'], required: true },
          { id: 'sleep_quality', label: 'How would you rate your sleep quality?', type: 'select', options: ['Poor', 'Fair', 'Good', 'Excellent'], required: true },
          { id: 'bedtime', label: 'What time do you typically go to bed?', type: 'select', options: ['Before 9pm', '9-10pm', '10-11pm', '11pm-12am', 'After midnight'], required: true },
          { id: 'wake_time', label: 'What time do you typically wake up?', type: 'select', options: ['Before 5am', '5-6am', '6-7am', '7-8am', 'After 8am'], required: true },
          { id: 'sleep_issues', label: 'Do you experience any sleep issues?', type: 'checkbox', options: ['Difficulty falling asleep', 'Waking during the night', 'Waking too early', 'Not feeling rested', 'Sleep apnea', 'Snoring', 'None'] },
          { id: 'sleep_environment', label: 'Describe your sleep environment', type: 'textarea', placeholder: 'Room darkness, temperature, noise, devices in bedroom...', required: false },
        ],
      },
      {
        title: 'Stress & Recovery',
        fields: [
          { id: 'stress_level', label: 'How would you rate your current stress level (1-10)?', type: 'select', options: ['1-2 (Very low)', '3-4 (Low)', '5-6 (Moderate)', '7-8 (High)', '9-10 (Very high)'], required: true },
          { id: 'stress_sources', label: 'What are your primary sources of stress?', type: 'checkbox', options: ['Work', 'Relationships', 'Finances', 'Health', 'Family', 'Training', 'Time management'] },
          { id: 'stress_management', label: 'What do you currently do to manage stress?', type: 'textarea', placeholder: 'E.g., meditation, exercise, hobbies...', required: false },
          { id: 'hrv_tracking', label: 'Do you track HRV or use any recovery monitoring devices?', type: 'radio', options: ['Yes, regularly', 'Sometimes', 'No', 'Not sure what HRV is'], required: true },
        ],
      },
      {
        title: 'Energy & Circadian Rhythm',
        fields: [
          { id: 'energy_patterns', label: 'When do you feel most energetic during the day?', type: 'select', options: ['Early morning', 'Mid-morning', 'Afternoon', 'Evening', 'Inconsistent'], required: true },
          { id: 'energy_crashes', label: 'Do you experience energy crashes? When?', type: 'textarea', placeholder: 'Describe when you typically feel tired or low energy...', required: false },
          { id: 'caffeine_use', label: 'How much caffeine do you consume daily?', type: 'select', options: ['None', '1 cup/serving', '2-3 cups/servings', '4+ cups/servings'], required: true },
          { id: 'caffeine_timing', label: 'When do you typically have caffeine?', type: 'select', options: ['Morning only', 'Throughout the day', 'Afternoon', 'I dont consume caffeine'], required: true },
        ],
      },
      {
        title: 'Recovery Practices',
        fields: [
          { id: 'current_recovery', label: 'What recovery practices do you currently use?', type: 'checkbox', options: ['Stretching', 'Foam rolling', 'Massage', 'Sauna', 'Cold therapy', 'Meditation', 'Breathwork', 'None'] },
          { id: 'rest_days', label: 'How many rest days do you take per week?', type: 'select', options: ['None', '1', '2', '3+'], required: true },
          { id: 'screen_time', label: 'How much screen time before bed?', type: 'select', options: ['None', 'Less than 30 min', '30-60 min', '1-2 hours', '2+ hours'], required: true },
          { id: 'recovery_goals', label: 'What are your main recovery/wellness goals?', type: 'textarea', placeholder: 'E.g., better sleep, reduced stress, more energy...', required: true },
        ],
      },
    ],
  },
  {
    specialty: 'mental_performance',
    title: 'Mental Performance Coach Intake',
    tagline: 'Your Cognitive Edge',
    description: 'Share your mental performance challenges and goals so we can build focus protocols and stress resilience frameworks tailored to you.',
    icon: Brain,
    gradient: 'from-cyan-500 to-teal-500',
    sections: [
      {
        title: 'Focus & Attention',
        description: 'Tell us about your concentration and focus',
        fields: [
          { id: 'focus_rating', label: 'How would you rate your ability to focus (1-10)?', type: 'select', options: ['1-2 (Very poor)', '3-4 (Poor)', '5-6 (Average)', '7-8 (Good)', '9-10 (Excellent)'], required: true },
          { id: 'focus_challenges', label: 'What are your biggest focus challenges?', type: 'checkbox', options: ['Easily distracted', 'Mind wandering', 'Multitasking', 'Information overload', 'Phone/notifications', 'Fatigue', 'Anxiety'] },
          { id: 'focus_duration', label: 'How long can you typically maintain deep focus?', type: 'select', options: ['Less than 15 min', '15-30 min', '30-60 min', '60-90 min', '90+ min'], required: true },
          { id: 'peak_focus_time', label: 'When are you most focused during the day?', type: 'select', options: ['Early morning', 'Mid-morning', 'Afternoon', 'Evening', 'Varies'], required: true },
        ],
      },
      {
        title: 'Performance Under Pressure',
        fields: [
          { id: 'pressure_situations', label: 'What situations make you feel the most pressure?', type: 'checkbox', options: ['Public speaking', 'Important meetings', 'Competitions/sports', 'Deadlines', 'Conflict', 'High-stakes decisions', 'Social situations'] },
          { id: 'pressure_response', label: 'How do you typically respond under pressure?', type: 'radio', options: ['I thrive and perform better', 'I perform about the same', 'I struggle and underperform', 'It varies significantly'], required: true },
          { id: 'anxiety_symptoms', label: 'Do you experience anxiety symptoms? Which ones?', type: 'checkbox', options: ['Racing thoughts', 'Physical tension', 'Rapid heartbeat', 'Sweating', 'Difficulty breathing', 'Avoidance', 'None'] },
          { id: 'past_performance_issues', label: 'Describe any past situations where you felt you underperformed due to mental factors', type: 'textarea', placeholder: 'Share specific examples...', required: false },
        ],
      },
      {
        title: 'Goals & Motivation',
        fields: [
          { id: 'performance_goals', label: 'What areas of mental performance do you want to improve?', type: 'checkbox', options: ['Focus/concentration', 'Stress management', 'Confidence', 'Motivation', 'Decision making', 'Emotional control', 'Public speaking'] },
          { id: 'motivation_level', label: 'How motivated are you currently toward your goals?', type: 'select', options: ['Very low', 'Low', 'Moderate', 'High', 'Very high'], required: true },
          { id: 'procrastination', label: 'How often do you struggle with procrastination?', type: 'select', options: ['Rarely', 'Sometimes', 'Often', 'Very often'], required: true },
          { id: 'specific_mental_goals', label: 'What specific mental performance outcomes are you hoping to achieve?', type: 'textarea', placeholder: 'E.g., deliver presentations confidently, stay calm during competitions...', required: true },
        ],
      },
      {
        title: 'Current Practices',
        fields: [
          { id: 'mental_practices', label: 'Do you currently practice any mental training techniques?', type: 'checkbox', options: ['Meditation', 'Visualization', 'Breathing exercises', 'Journaling', 'Gratitude practice', 'Mindfulness', 'None'] },
          { id: 'therapy_history', label: 'Have you worked with a therapist or counselor? (We are NOT therapists - this helps us understand your background)', type: 'radio', options: ['Yes, currently', 'Yes, in the past', 'No'], required: true },
          { id: 'learning_style', label: 'How do you learn best?', type: 'radio', options: ['Reading/written content', 'Video/audio', 'Hands-on practice', 'One-on-one coaching'], required: true },
          { id: 'additional_context', label: 'Anything else you want us to know about your mental performance goals?', type: 'textarea', placeholder: 'Share any additional context...', required: false },
        ],
      },
    ],
  },
];

export const getFormBySpecialty = (specialty: CoachSpecialty): CoachFormConfig | undefined => {
  return coachForms.find(form => form.specialty === specialty);
};
