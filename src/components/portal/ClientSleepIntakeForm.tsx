import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Progress } from '@/components/ui/progress';
import { 
  Moon, 
  ArrowRight, 
  ArrowLeft, 
  CheckCircle2,
  Clock,
  Coffee,
  Thermometer,
  Lightbulb,
  Volume2,
  Target,
  Sparkles,
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { calculateISIScore, getISISeverity, determinePhenotype } from '@/types/sleep';
import type { SleepAssessment } from '@/types/sleep';
import { toast } from 'sonner';

interface ClientSleepIntakeFormProps {
  onComplete?: () => void;
  onCancel?: () => void;
}

const isiLabels = [
  'None',
  'Mild',
  'Moderate',
  'Severe',
  'Very Severe'
];

const steps = [
  { id: 'intro', title: 'Welcome', icon: Sparkles },
  { id: 'isi', title: 'Sleep Quality', icon: Moon },
  { id: 'timing', title: 'Sleep Schedule', icon: Clock },
  { id: 'lifestyle', title: 'Lifestyle', icon: Coffee },
  { id: 'environment', title: 'Environment', icon: Thermometer },
  { id: 'goals', title: 'Your Goals', icon: Target },
];

export function ClientSleepIntakeForm({ onComplete, onCancel }: ClientSleepIntakeFormProps) {
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<Partial<SleepAssessment>>({
    difficulty_falling_asleep: null,
    difficulty_staying_asleep: null,
    waking_too_early: null,
    sleep_satisfaction: null,
    sleep_interference_daily: null,
    sleep_distress: null,
    average_bedtime: null,
    average_wake_time: null,
    caffeine_intake: null,
    last_caffeine_time: null,
    screen_time_before_bed: null,
    exercise_timing: null,
    stress_level: 5,
    bedroom_temperature: null,
    light_exposure: null,
    noise_level: null,
    sleep_environment_notes: null,
    current_sleep_aids: null,
    medications: null,
    primary_sleep_goals: null,
  });

  const updateField = (field: keyof SleepAssessment, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

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

      const isiScore = calculateISIScore(formData);
      const phenotype = determinePhenotype(formData);
      
      const { error } = await supabase
        .from('sleep_assessments')
        .insert({
          client_id: clientData.id,
          ...formData,
          isi_score: isiScore,
          phenotype,
          status: 'pending',
          program_tier: 'foundational',
        });

      if (error) throw error;
      
      toast.success('Sleep assessment submitted successfully! Your coach will review it shortly.');
      onComplete?.();
    } catch (error) {
      console.error('Error submitting assessment:', error);
      toast.error('Failed to submit assessment. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const progress = ((currentStep) / (steps.length - 1)) * 100;
  const currentISI = calculateISIScore(formData);
  const isiSeverity = getISISeverity(currentISI);

  const renderISIQuestion = (
    field: keyof SleepAssessment,
    question: string
  ) => (
    <div className="space-y-3">
      <Label className="text-base font-medium">{question}</Label>
      <RadioGroup
        value={formData[field]?.toString() || ''}
        onValueChange={(value) => updateField(field, parseInt(value))}
        className="flex flex-wrap gap-2"
      >
        {isiLabels.map((label, index) => (
          <div key={index} className="flex items-center">
            <RadioGroupItem value={index.toString()} id={`${field}-${index}`} className="sr-only" />
            <Label
              htmlFor={`${field}-${index}`}
              className={`
                px-4 py-2 rounded-lg border cursor-pointer transition-all
                ${formData[field] === index 
                  ? 'bg-primary text-primary-foreground border-primary shadow-md' 
                  : 'bg-card hover:bg-muted border-border hover:border-primary/50'}
              `}
            >
              {label}
            </Label>
          </div>
        ))}
      </RadioGroup>
    </div>
  );

  return (
    <Card className="max-w-2xl mx-auto border-2">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            {(() => {
              const StepIcon = steps[currentStep].icon;
              return <StepIcon className="h-6 w-6 text-primary" />;
            })()}
            <div>
              <CardTitle className="text-xl">{steps[currentStep].title}</CardTitle>
              <CardDescription>Step {currentStep + 1} of {steps.length}</CardDescription>
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
        {/* Step 0: Introduction */}
        {currentStep === 0 && (
          <div className="space-y-6 text-center py-6">
            <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
              <Moon className="h-10 w-10 text-primary" />
            </div>
            <div className="space-y-3">
              <h2 className="text-2xl font-bold">Sleep Optimization Assessment</h2>
              <p className="text-muted-foreground max-w-md mx-auto">
                This assessment will help us understand your sleep patterns and challenges 
                so we can create a personalized optimization plan for you.
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
                  Questions about your sleep quality
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-primary" />
                  Lifestyle and environment factors
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-primary" />
                  Your coach will review your responses
                </li>
              </ul>
            </div>
          </div>
        )}

        {/* Step 1: ISI Questions */}
        {currentStep === 1 && (
          <div className="space-y-6">
            <div className="p-4 rounded-lg bg-muted/50 border">
              <p className="text-sm text-muted-foreground">
                Rate each of the following during the <strong>past 2 weeks</strong>
              </p>
            </div>
            
            {renderISIQuestion(
              'difficulty_falling_asleep',
              'Difficulty falling asleep'
            )}
            {renderISIQuestion(
              'difficulty_staying_asleep',
              'Difficulty staying asleep'
            )}
            {renderISIQuestion(
              'waking_too_early',
              'Problems waking up too early'
            )}
            {renderISIQuestion(
              'sleep_satisfaction',
              'How unsatisfied are you with your current sleep pattern?'
            )}
            {renderISIQuestion(
              'sleep_interference_daily',
              'How much does your sleep problem interfere with your daily functioning?'
            )}
            {renderISIQuestion(
              'sleep_distress',
              'How worried/distressed are you about your current sleep problem?'
            )}

            {currentISI > 0 && (
              <div className={`p-4 rounded-lg border-2 ${
                currentISI <= 7 ? 'border-green-500/50 bg-green-500/10' :
                currentISI <= 14 ? 'border-yellow-500/50 bg-yellow-500/10' :
                currentISI <= 21 ? 'border-orange-500/50 bg-orange-500/10' :
                'border-red-500/50 bg-red-500/10'
              }`}>
                <p className="text-sm font-medium">Your responses indicate: <span className={isiSeverity.color}>{isiSeverity.label}</span></p>
                <p className="text-xs text-muted-foreground mt-1">This is just an initial assessment - your coach will provide personalized guidance.</p>
              </div>
            )}
          </div>
        )}

        {/* Step 2: Sleep Timing */}
        {currentStep === 2 && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="bedtime" className="text-base">What time do you typically go to bed?</Label>
                <Input
                  id="bedtime"
                  type="time"
                  value={formData.average_bedtime || ''}
                  onChange={(e) => updateField('average_bedtime', e.target.value)}
                  className="h-12"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="waketime" className="text-base">What time do you typically wake up?</Label>
                <Input
                  id="waketime"
                  type="time"
                  value={formData.average_wake_time || ''}
                  onChange={(e) => updateField('average_wake_time', e.target.value)}
                  className="h-12"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-base">When do you typically exercise?</Label>
              <Select 
                value={formData.exercise_timing || ''} 
                onValueChange={(value) => updateField('exercise_timing', value)}
              >
                <SelectTrigger className="h-12">
                  <SelectValue placeholder="Select your exercise timing" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="morning">Morning (before noon)</SelectItem>
                  <SelectItem value="afternoon">Afternoon (12pm-5pm)</SelectItem>
                  <SelectItem value="evening">Evening (5pm-8pm)</SelectItem>
                  <SelectItem value="late_evening">Late evening (after 8pm)</SelectItem>
                  <SelectItem value="no_exercise">I don't exercise regularly</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        )}

        {/* Step 3: Lifestyle Factors */}
        {currentStep === 3 && (
          <div className="space-y-6">
            <div className="space-y-2">
              <Label className="text-base">Daily caffeine consumption</Label>
              <Select 
                value={formData.caffeine_intake || ''} 
                onValueChange={(value) => updateField('caffeine_intake', value)}
              >
                <SelectTrigger className="h-12">
                  <SelectValue placeholder="Select amount" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  <SelectItem value="1-2 cups">1-2 cups</SelectItem>
                  <SelectItem value="3-4 cups">3-4 cups</SelectItem>
                  <SelectItem value="5+ cups">5+ cups</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="last_caffeine" className="text-base">When do you have your last caffeine?</Label>
              <Input
                id="last_caffeine"
                type="time"
                value={formData.last_caffeine_time || ''}
                onChange={(e) => updateField('last_caffeine_time', e.target.value)}
                className="h-12"
              />
            </div>

            <div className="space-y-3">
              <Label className="text-base">Screen time before bed (minutes)</Label>
              <div className="flex items-center gap-4">
                <Slider
                  value={[formData.screen_time_before_bed || 60]}
                  onValueChange={([value]) => updateField('screen_time_before_bed', value)}
                  max={180}
                  step={15}
                  className="flex-1"
                />
                <span className="w-20 text-sm font-medium text-center bg-muted rounded-lg py-2">
                  {formData.screen_time_before_bed || 60} min
                </span>
              </div>
            </div>

            <div className="space-y-3">
              <Label className="text-base">Current stress level</Label>
              <div className="flex items-center gap-4">
                <Slider
                  value={[formData.stress_level || 5]}
                  onValueChange={([value]) => updateField('stress_level', value)}
                  min={1}
                  max={10}
                  step={1}
                  className="flex-1"
                />
                <span className="w-12 text-sm font-medium text-center bg-muted rounded-lg py-2">
                  {formData.stress_level || 5}/10
                </span>
              </div>
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Low stress</span>
                <span>High stress</span>
              </div>
            </div>
          </div>
        )}

        {/* Step 4: Environment */}
        {currentStep === 4 && (
          <div className="space-y-6">
            <div className="space-y-2">
              <Label className="flex items-center gap-2 text-base">
                <Thermometer className="h-4 w-4 text-primary" />
                Bedroom Temperature
              </Label>
              <Select 
                value={formData.bedroom_temperature || ''} 
                onValueChange={(value) => updateField('bedroom_temperature', value)}
              >
                <SelectTrigger className="h-12">
                  <SelectValue placeholder="Select temperature" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="too_cold">Too cold (below 60°F)</SelectItem>
                  <SelectItem value="cool">Cool (60-65°F)</SelectItem>
                  <SelectItem value="optimal">Optimal (65-68°F)</SelectItem>
                  <SelectItem value="warm">Warm (68-72°F)</SelectItem>
                  <SelectItem value="too_warm">Too warm (above 72°F)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-2 text-base">
                <Lightbulb className="h-4 w-4 text-primary" />
                Light in Your Bedroom
              </Label>
              <Select 
                value={formData.light_exposure || ''} 
                onValueChange={(value) => updateField('light_exposure', value)}
              >
                <SelectTrigger className="h-12">
                  <SelectValue placeholder="Select light level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="complete_darkness">Complete darkness</SelectItem>
                  <SelectItem value="minimal">Minimal light</SelectItem>
                  <SelectItem value="some_light">Some light (street lights, etc.)</SelectItem>
                  <SelectItem value="significant">Significant light exposure</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-2 text-base">
                <Volume2 className="h-4 w-4 text-primary" />
                Noise Level
              </Label>
              <Select 
                value={formData.noise_level || ''} 
                onValueChange={(value) => updateField('noise_level', value)}
              >
                <SelectTrigger className="h-12">
                  <SelectValue placeholder="Select noise level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="quiet">Very quiet</SelectItem>
                  <SelectItem value="some_noise">Some background noise</SelectItem>
                  <SelectItem value="noisy">Noisy environment</SelectItem>
                  <SelectItem value="white_noise">Use white noise/fan</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-base">Any other environmental factors?</Label>
              <Textarea
                placeholder="Share anything else about your sleep environment..."
                value={formData.sleep_environment_notes || ''}
                onChange={(e) => updateField('sleep_environment_notes', e.target.value)}
                className="min-h-[80px]"
              />
            </div>
          </div>
        )}

        {/* Step 5: Goals & Current Aids */}
        {currentStep === 5 && (
          <div className="space-y-6">
            <div className="space-y-2">
              <Label className="text-base">What sleep aids or supplements do you currently use?</Label>
              <Textarea
                placeholder="e.g., Melatonin, magnesium, chamomile tea, sleep apps..."
                value={formData.current_sleep_aids || ''}
                onChange={(e) => updateField('current_sleep_aids', e.target.value)}
                className="min-h-[80px]"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-base">Any medications that might affect your sleep?</Label>
              <Textarea
                placeholder="List any medications you take regularly..."
                value={formData.medications || ''}
                onChange={(e) => updateField('medications', e.target.value)}
                className="min-h-[80px]"
              />
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-2 text-base">
                <Target className="h-4 w-4 text-primary" />
                What are your sleep goals?
              </Label>
              <Textarea
                placeholder="What does great sleep look like for you? What would you like to achieve?"
                value={formData.primary_sleep_goals || ''}
                onChange={(e) => updateField('primary_sleep_goals', e.target.value)}
                className="min-h-[100px]"
              />
            </div>

            <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-primary mt-0.5" />
                <div>
                  <p className="font-medium">Ready to submit!</p>
                  <p className="text-sm text-muted-foreground">
                    Your coach will review your assessment and create a personalized sleep optimization plan.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className="flex justify-between pt-4 border-t">
          <Button
            type="button"
            variant="outline"
            onClick={currentStep === 0 ? onCancel : handleBack}
            disabled={isSubmitting}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            {currentStep === 0 ? 'Cancel' : 'Back'}
          </Button>

          {currentStep < steps.length - 1 ? (
            <Button type="button" onClick={handleNext}>
              {currentStep === 0 ? 'Get Started' : 'Continue'}
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          ) : (
            <Button 
              type="button" 
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="min-w-[140px]"
            >
              {isSubmitting ? (
                'Submitting...'
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  Submit Assessment
                </>
              )}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
