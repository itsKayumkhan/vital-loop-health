import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Switch } from '@/components/ui/switch';
import { Progress } from '@/components/ui/progress';
import { 
  Brain, 
  ArrowRight, 
  ArrowLeft, 
  CheckCircle2, 
  Sparkles,
  Zap,
  Heart,
  Activity,
  Target,
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { 
  MentalPerformanceAssessment, 
  calculateCognitiveScore, 
  determineMentalPhenotype,
  getCognitiveSeverity,
} from '@/types/mentalPerformance';
import { toast } from 'sonner';

interface ClientMentalIntakeFormProps {
  onComplete?: () => void;
  onCancel?: () => void;
}

const STEPS = [
  { id: 'intro', title: 'Welcome', icon: Sparkles, description: 'Introduction to the assessment' },
  { id: 'cognitive', title: 'Cognitive Function', icon: Brain, description: 'Assess focus, memory, and mental clarity' },
  { id: 'stress', title: 'Stress & Emotions', icon: Heart, description: 'Evaluate stress levels and emotional regulation' },
  { id: 'energy', title: 'Mental Energy', icon: Zap, description: 'Measure your energy and motivation' },
  { id: 'lifestyle', title: 'Lifestyle', icon: Activity, description: 'Review habits affecting cognition' },
  { id: 'goals', title: 'Your Goals', icon: Target, description: 'Define your performance objectives' },
];

export function ClientMentalIntakeForm({ onComplete, onCancel }: ClientMentalIntakeFormProps) {
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState<Partial<MentalPerformanceAssessment>>({
    focus_difficulty: 0,
    memory_issues: 0,
    mental_fatigue: 0,
    brain_fog: 0,
    processing_speed: 0,
    stress_level: 5,
    anxiety_frequency: 0,
    mood_stability: 5,
    emotional_resilience: 5,
    morning_mental_clarity: 5,
    afternoon_energy_dip: 5,
    motivation_level: 5,
    task_completion_ability: 5,
    meditation_practice: false,
    nutrition_quality: 5,
  });

  const updateField = (field: keyof MentalPerformanceAssessment, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const progress = ((currentStep) / (STEPS.length - 1)) * 100;
  const currentCognitiveScore = calculateCognitiveScore(formData);
  const cognitiveSeverity = getCognitiveSeverity(currentCognitiveScore);

  const handleSubmit = async () => {
    if (!user) {
      toast.error('Please sign in to submit');
      return;
    }

    setIsSubmitting(true);
    try {
      // Get the client record for the current user
      const { data: clientData, error: clientError } = await supabase
        .from('crm_clients')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (clientError || !clientData) {
        toast.error('Client profile not found. Please contact support.');
        return;
      }

      const cognitiveScore = calculateCognitiveScore(formData);
      const phenotype = determineMentalPhenotype(formData);
      
      const { error } = await supabase
        .from('mental_performance_assessments')
        .insert({
          client_id: clientData.id,
          ...formData,
          cognitive_function_score: cognitiveScore,
          phenotype: phenotype || null,
          status: 'pending',
          program_tier: 'cognitive_foundations',
        });

      if (error) throw error;
      
      toast.success('Mental performance assessment submitted successfully! Your coach will review it shortly.');
      onComplete?.();
    } catch (error) {
      console.error('Error submitting assessment:', error);
      toast.error('Failed to submit assessment. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderIntroStep = () => (
    <div className="space-y-6 text-center py-6">
      <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
        <Brain className="h-10 w-10 text-primary" />
      </div>
      <div className="space-y-3">
        <h2 className="text-2xl font-bold">Mental Performance Assessment</h2>
        <p className="text-muted-foreground max-w-md mx-auto">
          This assessment will help us understand your cognitive patterns and challenges 
          so we can create a personalized brain optimization plan for you.
        </p>
      </div>
      <div className="bg-muted/50 rounded-lg p-4 max-w-md mx-auto text-left">
        <h3 className="font-semibold mb-2">What to expect:</h3>
        <ul className="space-y-2 text-sm text-muted-foreground">
          <li className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-primary" />
            5-7 minutes to complete
          </li>
          <li className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-primary" />
            Questions about focus and cognition
          </li>
          <li className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-primary" />
            Stress and energy assessment
          </li>
          <li className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-primary" />
            Your coach will review your responses
          </li>
        </ul>
      </div>
    </div>
  );

  const renderCognitiveStep = () => (
    <div className="space-y-6">
      <div className="p-4 rounded-lg bg-muted/50 border">
        <p className="text-sm text-muted-foreground">
          Rate each symptom from <strong>0 (None)</strong> to <strong>4 (Very Severe)</strong>
        </p>
      </div>
      
      {[
        { field: 'focus_difficulty', label: 'Difficulty maintaining focus and concentration' },
        { field: 'memory_issues', label: 'Problems with short-term memory or recall' },
        { field: 'mental_fatigue', label: 'Mental fatigue or exhaustion' },
        { field: 'brain_fog', label: 'Brain fog or mental cloudiness' },
        { field: 'processing_speed', label: 'Slow mental processing or thinking' },
      ].map(({ field, label }) => (
        <div key={field} className="space-y-2">
          <div className="flex justify-between items-center">
            <Label className="text-base">{label}</Label>
            <span className="text-sm font-medium bg-muted rounded-lg px-3 py-1">
              {formData[field as keyof typeof formData] as number}/4
            </span>
          </div>
          <Slider
            value={[formData[field as keyof typeof formData] as number]}
            onValueChange={([value]) => updateField(field as any, value)}
            max={4}
            step={1}
            className="py-2"
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>None</span>
            <span>Very Severe</span>
          </div>
        </div>
      ))}

      {currentCognitiveScore > 0 && (
        <div className={`p-4 rounded-lg border-2 ${
          currentCognitiveScore <= 4 ? 'border-green-500/50 bg-green-500/10' :
          currentCognitiveScore <= 8 ? 'border-yellow-500/50 bg-yellow-500/10' :
          currentCognitiveScore <= 12 ? 'border-orange-500/50 bg-orange-500/10' :
          'border-red-500/50 bg-red-500/10'
        }`}>
          <p className="text-sm font-medium">
            Current cognitive assessment: <span className={cognitiveSeverity.color}>{cognitiveSeverity.label}</span>
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            This is just an initial assessment - your coach will provide personalized guidance.
          </p>
        </div>
      )}
    </div>
  );

  const renderStressStep = () => (
    <div className="space-y-6">
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <Label className="text-base">Overall stress level</Label>
          <span className="text-sm font-medium bg-muted rounded-lg px-3 py-1">{formData.stress_level}/10</span>
        </div>
        <Slider
          value={[formData.stress_level ?? 5]}
          onValueChange={([value]) => updateField('stress_level', value)}
          max={10}
          step={1}
        />
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>Very low</span>
          <span>Very high</span>
        </div>
      </div>

      <div className="space-y-3">
        <Label className="text-base">How often do you experience anxiety?</Label>
        <RadioGroup
          value={String(formData.anxiety_frequency)}
          onValueChange={(value) => updateField('anxiety_frequency', parseInt(value))}
          className="space-y-2"
        >
          {['Never', 'Rarely', 'Sometimes', 'Often', 'Very Often'].map((label, index) => (
            <div key={index} className="flex items-center space-x-3">
              <RadioGroupItem value={String(index)} id={`anxiety-${index}`} />
              <Label htmlFor={`anxiety-${index}`} className="cursor-pointer">{label}</Label>
            </div>
          ))}
        </RadioGroup>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <Label className="text-base">Mood stability</Label>
          <span className="text-sm font-medium bg-muted rounded-lg px-3 py-1">{formData.mood_stability}/10</span>
        </div>
        <Slider
          value={[formData.mood_stability ?? 5]}
          onValueChange={([value]) => updateField('mood_stability', value)}
          max={10}
          step={1}
        />
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>Very unstable</span>
          <span>Very stable</span>
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <Label className="text-base">Emotional resilience (ability to bounce back)</Label>
          <span className="text-sm font-medium bg-muted rounded-lg px-3 py-1">{formData.emotional_resilience}/10</span>
        </div>
        <Slider
          value={[formData.emotional_resilience ?? 5]}
          onValueChange={([value]) => updateField('emotional_resilience', value)}
          max={10}
          step={1}
        />
      </div>
    </div>
  );

  const renderEnergyStep = () => (
    <div className="space-y-6">
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <Label className="text-base">Morning mental clarity</Label>
          <span className="text-sm font-medium bg-muted rounded-lg px-3 py-1">{formData.morning_mental_clarity}/10</span>
        </div>
        <Slider
          value={[formData.morning_mental_clarity ?? 5]}
          onValueChange={([value]) => updateField('morning_mental_clarity', value)}
          max={10}
          step={1}
        />
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>Very foggy</span>
          <span>Crystal clear</span>
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <Label className="text-base">Afternoon energy dip severity</Label>
          <span className="text-sm font-medium bg-muted rounded-lg px-3 py-1">{formData.afternoon_energy_dip}/10</span>
        </div>
        <Slider
          value={[formData.afternoon_energy_dip ?? 5]}
          onValueChange={([value]) => updateField('afternoon_energy_dip', value)}
          max={10}
          step={1}
        />
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>No dip</span>
          <span>Severe crash</span>
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <Label className="text-base">Motivation and drive level</Label>
          <span className="text-sm font-medium bg-muted rounded-lg px-3 py-1">{formData.motivation_level}/10</span>
        </div>
        <Slider
          value={[formData.motivation_level ?? 5]}
          onValueChange={([value]) => updateField('motivation_level', value)}
          max={10}
          step={1}
        />
      </div>

      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <Label className="text-base">Ability to complete tasks</Label>
          <span className="text-sm font-medium bg-muted rounded-lg px-3 py-1">{formData.task_completion_ability}/10</span>
        </div>
        <Slider
          value={[formData.task_completion_ability ?? 5]}
          onValueChange={([value]) => updateField('task_completion_ability', value)}
          max={10}
          step={1}
        />
      </div>
    </div>
  );

  const renderLifestyleStep = () => (
    <div className="space-y-6">
      <div className="space-y-3">
        <Label className="text-base">Caffeine dependency</Label>
        <RadioGroup
          value={formData.caffeine_dependency || ''}
          onValueChange={(value) => updateField('caffeine_dependency', value)}
          className="space-y-2"
        >
          {[
            { value: 'none', label: 'No caffeine' },
            { value: 'low', label: '1-2 cups/day' },
            { value: 'moderate', label: '3-4 cups/day' },
            { value: 'high', label: '5+ cups/day' },
            { value: 'dependent', label: 'Cannot function without it' },
          ].map(({ value, label }) => (
            <div key={value} className="flex items-center space-x-3">
              <RadioGroupItem value={value} id={`caffeine-${value}`} />
              <Label htmlFor={`caffeine-${value}`} className="cursor-pointer">{label}</Label>
            </div>
          ))}
        </RadioGroup>
      </div>

      <div className="space-y-3">
        <Label className="text-base">Exercise frequency</Label>
        <RadioGroup
          value={formData.exercise_frequency || ''}
          onValueChange={(value) => updateField('exercise_frequency', value)}
          className="space-y-2"
        >
          {[
            { value: 'none', label: 'No regular exercise' },
            { value: '1-2x', label: '1-2 times per week' },
            { value: '3-4x', label: '3-4 times per week' },
            { value: '5+x', label: '5+ times per week' },
          ].map(({ value, label }) => (
            <div key={value} className="flex items-center space-x-3">
              <RadioGroupItem value={value} id={`exercise-${value}`} />
              <Label htmlFor={`exercise-${value}`} className="cursor-pointer">{label}</Label>
            </div>
          ))}
        </RadioGroup>
      </div>

      <div className="flex items-center justify-between p-4 rounded-lg border bg-card">
        <Label className="text-base cursor-pointer">Do you practice meditation or mindfulness?</Label>
        <Switch
          checked={formData.meditation_practice}
          onCheckedChange={(checked) => updateField('meditation_practice', checked)}
        />
      </div>

      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <Label className="text-base">Overall nutrition quality</Label>
          <span className="text-sm font-medium bg-muted rounded-lg px-3 py-1">{formData.nutrition_quality}/10</span>
        </div>
        <Slider
          value={[formData.nutrition_quality ?? 5]}
          onValueChange={([value]) => updateField('nutrition_quality', value)}
          max={10}
          step={1}
        />
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>Poor</span>
          <span>Excellent</span>
        </div>
      </div>
    </div>
  );

  const renderGoalsStep = () => (
    <div className="space-y-6">
      <div className="space-y-3">
        <Label className="text-base">What type of work or activities do you primarily do?</Label>
        <RadioGroup
          value={formData.work_type || ''}
          onValueChange={(value) => updateField('work_type', value)}
          className="space-y-2"
        >
          {[
            { value: 'creative', label: 'Creative/Artistic' },
            { value: 'analytical', label: 'Analytical/Technical' },
            { value: 'leadership', label: 'Leadership/Management' },
            { value: 'physical', label: 'Physical/Athletic' },
            { value: 'mixed', label: 'Mixed/Varied' },
          ].map(({ value, label }) => (
            <div key={value} className="flex items-center space-x-3">
              <RadioGroupItem value={value} id={`work-${value}`} />
              <Label htmlFor={`work-${value}`} className="cursor-pointer">{label}</Label>
            </div>
          ))}
        </RadioGroup>
      </div>

      <div className="space-y-3">
        <Label className="text-base">When do you feel most mentally sharp?</Label>
        <RadioGroup
          value={formData.peak_performance_hours || ''}
          onValueChange={(value) => updateField('peak_performance_hours', value)}
          className="space-y-2"
        >
          {[
            { value: 'early_morning', label: 'Early morning (5-9am)' },
            { value: 'late_morning', label: 'Late morning (9am-12pm)' },
            { value: 'afternoon', label: 'Afternoon (12-5pm)' },
            { value: 'evening', label: 'Evening (5-9pm)' },
            { value: 'night', label: 'Night (9pm+)' },
          ].map(({ value, label }) => (
            <div key={value} className="flex items-center space-x-3">
              <RadioGroupItem value={value} id={`peak-${value}`} />
              <Label htmlFor={`peak-${value}`} className="cursor-pointer">{label}</Label>
            </div>
          ))}
        </RadioGroup>
      </div>

      <div className="space-y-2">
        <Label className="flex items-center gap-2 text-base">
          <Target className="h-4 w-4 text-primary" />
          What are your mental performance goals?
        </Label>
        <Textarea
          value={formData.primary_mental_goals || ''}
          onChange={(e) => updateField('primary_mental_goals', e.target.value)}
          placeholder="e.g., Improve focus during work, reduce brain fog, enhance memory, increase productivity..."
          className="min-h-[100px]"
        />
      </div>

      <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
        <div className="flex items-start gap-3">
          <CheckCircle2 className="h-5 w-5 text-primary mt-0.5" />
          <div>
            <p className="font-medium">Ready to submit!</p>
            <p className="text-sm text-muted-foreground">
              Your coach will review your assessment and create a personalized brain optimization plan.
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  const renderStep = () => {
    switch (currentStep) {
      case 0: return renderIntroStep();
      case 1: return renderCognitiveStep();
      case 2: return renderStressStep();
      case 3: return renderEnergyStep();
      case 4: return renderLifestyleStep();
      case 5: return renderGoalsStep();
      default: return null;
    }
  };

  return (
    <Card className="max-w-2xl mx-auto border-2">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            {(() => {
              const StepIcon = STEPS[currentStep].icon;
              return <StepIcon className="h-6 w-6 text-primary" />;
            })()}
            <div>
              <CardTitle className="text-xl">{STEPS[currentStep].title}</CardTitle>
              <CardDescription>{STEPS[currentStep].description}</CardDescription>
            </div>
          </div>
          {currentStep > 0 && (
            <span className="text-sm text-muted-foreground font-medium">
              {Math.round(progress)}% Complete
            </span>
          )}
        </div>
        {currentStep > 0 && <Progress value={progress} className="h-2" />}
      </CardHeader>
      
      <CardContent className="space-y-6">
        {renderStep()}
        
        <div className="flex justify-between pt-4 border-t">
          <Button
            type="button"
            variant="outline"
            onClick={currentStep === 0 ? onCancel : () => setCurrentStep(prev => prev - 1)}
            disabled={isSubmitting}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            {currentStep === 0 ? 'Cancel' : 'Back'}
          </Button>
          
          {currentStep === STEPS.length - 1 ? (
            <Button 
              onClick={handleSubmit} 
              disabled={isSubmitting}
              className="min-w-[140px]"
            >
              {isSubmitting ? 'Submitting...' : (
                <>
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  Submit Assessment
                </>
              )}
            </Button>
          ) : (
            <Button onClick={() => setCurrentStep(prev => prev + 1)}>
              {currentStep === 0 ? 'Get Started' : 'Continue'}
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
