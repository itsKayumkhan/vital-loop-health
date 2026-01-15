import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Switch } from '@/components/ui/switch';
import { Progress } from '@/components/ui/progress';
import { Brain, ArrowRight, ArrowLeft, Check } from 'lucide-react';
import { useMentalAssessments } from '@/hooks/useMentalPerformance';
import { 
  MentalPerformanceAssessment, 
  calculateCognitiveScore, 
  determineMentalPhenotype 
} from '@/types/mentalPerformance';

interface MentalAssessmentFormProps {
  clientId: string;
  onComplete?: () => void;
}

const STEPS = [
  { id: 'cognitive', title: 'Cognitive Function', description: 'Assess focus, memory, and mental clarity' },
  { id: 'stress', title: 'Stress & Emotions', description: 'Evaluate stress levels and emotional regulation' },
  { id: 'energy', title: 'Energy & Motivation', description: 'Measure mental energy and drive' },
  { id: 'lifestyle', title: 'Lifestyle Factors', description: 'Review habits affecting cognition' },
  { id: 'goals', title: 'Goals & Context', description: 'Define performance objectives' },
];

export function MentalAssessmentForm({ clientId, onComplete }: MentalAssessmentFormProps) {
  const { createAssessment } = useMentalAssessments(clientId);
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

  const progress = ((currentStep + 1) / STEPS.length) * 100;

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const cognitiveScore = calculateCognitiveScore(formData);
      const phenotype = determineMentalPhenotype(formData);
      
      await createAssessment(clientId, {
        ...formData,
        cognitive_function_score: cognitiveScore,
        phenotype: phenotype || undefined,
        status: 'completed',
      });
      
      onComplete?.();
    } catch (error) {
      console.error('Error submitting assessment:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderCognitiveStep = () => (
    <div className="space-y-6">
      <p className="text-sm text-muted-foreground">
        Rate each symptom from 0 (None) to 4 (Very Severe)
      </p>
      
      {[
        { field: 'focus_difficulty', label: 'Difficulty maintaining focus and concentration' },
        { field: 'memory_issues', label: 'Problems with short-term memory or recall' },
        { field: 'mental_fatigue', label: 'Mental fatigue or exhaustion' },
        { field: 'brain_fog', label: 'Brain fog or mental cloudiness' },
        { field: 'processing_speed', label: 'Slow mental processing or thinking' },
      ].map(({ field, label }) => (
        <div key={field} className="space-y-2">
          <div className="flex justify-between">
            <Label>{label}</Label>
            <span className="text-sm font-medium">
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
    </div>
  );

  const renderStressStep = () => (
    <div className="space-y-6">
      <div className="space-y-2">
        <div className="flex justify-between">
          <Label>Overall stress level (0-10)</Label>
          <span className="text-sm font-medium">{formData.stress_level}/10</span>
        </div>
        <Slider
          value={[formData.stress_level ?? 5]}
          onValueChange={([value]) => updateField('stress_level', value)}
          max={10}
          step={1}
        />
      </div>

      <div className="space-y-2">
        <Label>How often do you experience anxiety?</Label>
        <RadioGroup
          value={String(formData.anxiety_frequency)}
          onValueChange={(value) => updateField('anxiety_frequency', parseInt(value))}
        >
          {['Never', 'Rarely', 'Sometimes', 'Often', 'Very Often'].map((label, index) => (
            <div key={index} className="flex items-center space-x-2">
              <RadioGroupItem value={String(index)} id={`anxiety-${index}`} />
              <Label htmlFor={`anxiety-${index}`}>{label}</Label>
            </div>
          ))}
        </RadioGroup>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between">
          <Label>Mood stability (0=Very unstable, 10=Very stable)</Label>
          <span className="text-sm font-medium">{formData.mood_stability}/10</span>
        </div>
        <Slider
          value={[formData.mood_stability ?? 5]}
          onValueChange={([value]) => updateField('mood_stability', value)}
          max={10}
          step={1}
        />
      </div>

      <div className="space-y-2">
        <div className="flex justify-between">
          <Label>Emotional resilience (ability to bounce back)</Label>
          <span className="text-sm font-medium">{formData.emotional_resilience}/10</span>
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
        <div className="flex justify-between">
          <Label>Morning mental clarity</Label>
          <span className="text-sm font-medium">{formData.morning_mental_clarity}/10</span>
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
        <div className="flex justify-between">
          <Label>Afternoon energy dip severity</Label>
          <span className="text-sm font-medium">{formData.afternoon_energy_dip}/10</span>
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
        <div className="flex justify-between">
          <Label>Motivation and drive level</Label>
          <span className="text-sm font-medium">{formData.motivation_level}/10</span>
        </div>
        <Slider
          value={[formData.motivation_level ?? 5]}
          onValueChange={([value]) => updateField('motivation_level', value)}
          max={10}
          step={1}
        />
      </div>

      <div className="space-y-2">
        <div className="flex justify-between">
          <Label>Ability to complete tasks</Label>
          <span className="text-sm font-medium">{formData.task_completion_ability}/10</span>
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
      <div className="space-y-2">
        <Label>Caffeine dependency</Label>
        <RadioGroup
          value={formData.caffeine_dependency || ''}
          onValueChange={(value) => updateField('caffeine_dependency', value)}
        >
          {[
            { value: 'none', label: 'No caffeine' },
            { value: 'low', label: '1-2 cups/day' },
            { value: 'moderate', label: '3-4 cups/day' },
            { value: 'high', label: '5+ cups/day' },
            { value: 'dependent', label: 'Cannot function without it' },
          ].map(({ value, label }) => (
            <div key={value} className="flex items-center space-x-2">
              <RadioGroupItem value={value} id={`caffeine-${value}`} />
              <Label htmlFor={`caffeine-${value}`}>{label}</Label>
            </div>
          ))}
        </RadioGroup>
      </div>

      <div className="space-y-2">
        <Label>Exercise frequency</Label>
        <RadioGroup
          value={formData.exercise_frequency || ''}
          onValueChange={(value) => updateField('exercise_frequency', value)}
        >
          {[
            { value: 'none', label: 'No regular exercise' },
            { value: '1-2x', label: '1-2 times per week' },
            { value: '3-4x', label: '3-4 times per week' },
            { value: '5+x', label: '5+ times per week' },
          ].map(({ value, label }) => (
            <div key={value} className="flex items-center space-x-2">
              <RadioGroupItem value={value} id={`exercise-${value}`} />
              <Label htmlFor={`exercise-${value}`}>{label}</Label>
            </div>
          ))}
        </RadioGroup>
      </div>

      <div className="flex items-center justify-between">
        <Label>Do you have a regular meditation or mindfulness practice?</Label>
        <Switch
          checked={formData.meditation_practice}
          onCheckedChange={(checked) => updateField('meditation_practice', checked)}
        />
      </div>

      <div className="space-y-2">
        <div className="flex justify-between">
          <Label>Overall nutrition quality</Label>
          <span className="text-sm font-medium">{formData.nutrition_quality}/10</span>
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
      <div className="space-y-2">
        <Label>Type of work/primary activities</Label>
        <RadioGroup
          value={formData.work_type || ''}
          onValueChange={(value) => updateField('work_type', value)}
        >
          {[
            { value: 'creative', label: 'Creative/Artistic' },
            { value: 'analytical', label: 'Analytical/Technical' },
            { value: 'leadership', label: 'Leadership/Management' },
            { value: 'physical', label: 'Physical/Athletic' },
            { value: 'mixed', label: 'Mixed/Varied' },
          ].map(({ value, label }) => (
            <div key={value} className="flex items-center space-x-2">
              <RadioGroupItem value={value} id={`work-${value}`} />
              <Label htmlFor={`work-${value}`}>{label}</Label>
            </div>
          ))}
        </RadioGroup>
      </div>

      <div className="space-y-2">
        <Label>When do you typically feel most mentally sharp?</Label>
        <RadioGroup
          value={formData.peak_performance_hours || ''}
          onValueChange={(value) => updateField('peak_performance_hours', value)}
        >
          {[
            { value: 'early_morning', label: 'Early morning (5-9am)' },
            { value: 'late_morning', label: 'Late morning (9am-12pm)' },
            { value: 'afternoon', label: 'Afternoon (12-5pm)' },
            { value: 'evening', label: 'Evening (5-9pm)' },
            { value: 'night', label: 'Night (9pm+)' },
          ].map(({ value, label }) => (
            <div key={value} className="flex items-center space-x-2">
              <RadioGroupItem value={value} id={`peak-${value}`} />
              <Label htmlFor={`peak-${value}`}>{label}</Label>
            </div>
          ))}
        </RadioGroup>
      </div>

      <div className="space-y-2">
        <Label>Primary mental performance goals</Label>
        <Textarea
          value={formData.primary_mental_goals || ''}
          onChange={(e) => updateField('primary_mental_goals', e.target.value)}
          placeholder="e.g., Improve focus during work, reduce brain fog, enhance memory..."
          rows={4}
        />
      </div>
    </div>
  );

  const renderStep = () => {
    switch (currentStep) {
      case 0: return renderCognitiveStep();
      case 1: return renderStressStep();
      case 2: return renderEnergyStep();
      case 3: return renderLifestyleStep();
      case 4: return renderGoalsStep();
      default: return null;
    }
  };

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <div className="flex items-center gap-3">
          <Brain className="h-8 w-8 text-primary" />
          <div>
            <CardTitle>Mental Performance Assessment</CardTitle>
            <CardDescription>
              {STEPS[currentStep].title}: {STEPS[currentStep].description}
            </CardDescription>
          </div>
        </div>
        <Progress value={progress} className="mt-4" />
        <div className="flex justify-between text-xs text-muted-foreground mt-2">
          <span>Step {currentStep + 1} of {STEPS.length}</span>
          <span>{Math.round(progress)}% complete</span>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {renderStep()}
        
        <div className="flex justify-between pt-4">
          <Button
            variant="outline"
            onClick={() => setCurrentStep(prev => prev - 1)}
            disabled={currentStep === 0}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Previous
          </Button>
          
          {currentStep === STEPS.length - 1 ? (
            <Button onClick={handleSubmit} disabled={isSubmitting}>
              {isSubmitting ? 'Submitting...' : (
                <>
                  <Check className="h-4 w-4 mr-2" />
                  Complete Assessment
                </>
              )}
            </Button>
          ) : (
            <Button onClick={() => setCurrentStep(prev => prev + 1)}>
              Next
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
