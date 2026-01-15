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
  Smartphone,
  Thermometer,
  Lightbulb,
  Volume2,
  Brain,
  Target,
} from 'lucide-react';
import { calculateISIScore, getISISeverity, determinePhenotype } from '@/types/sleep';
import type { SleepAssessment } from '@/types/sleep';

interface SleepAssessmentFormProps {
  clientId: string;
  onSubmit: (data: Partial<SleepAssessment>) => Promise<void>;
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
  { id: 'isi', title: 'Sleep Quality Assessment', icon: Moon },
  { id: 'timing', title: 'Sleep Timing', icon: Clock },
  { id: 'lifestyle', title: 'Lifestyle Factors', icon: Coffee },
  { id: 'environment', title: 'Sleep Environment', icon: Thermometer },
  { id: 'goals', title: 'Goals & Current Aids', icon: Target },
];

export function SleepAssessmentForm({ clientId, onSubmit, onCancel }: SleepAssessmentFormProps) {
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
    program_tier: 'foundational',
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
    setIsSubmitting(true);
    try {
      const isiScore = calculateISIScore(formData);
      const phenotype = determinePhenotype(formData);
      
      await onSubmit({
        ...formData,
        client_id: clientId,
        isi_score: isiScore,
        phenotype,
        status: 'completed',
      });
    } catch (error) {
      console.error('Error submitting assessment:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const progress = ((currentStep + 1) / steps.length) * 100;
  const currentISI = calculateISIScore(formData);
  const isiSeverity = getISISeverity(currentISI);

  const renderISIQuestion = (
    field: keyof SleepAssessment,
    question: string
  ) => (
    <div className="space-y-3">
      <Label className="text-base">{question}</Label>
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
                px-4 py-2 rounded-lg border cursor-pointer transition-colors
                ${formData[field] === index 
                  ? 'bg-primary text-primary-foreground border-primary' 
                  : 'bg-background hover:bg-muted border-border'}
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
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            {(() => {
              const StepIcon = steps[currentStep].icon;
              return <StepIcon className="h-6 w-6 text-primary" />;
            })()}
            <div>
              <CardTitle>{steps[currentStep].title}</CardTitle>
              <CardDescription>Step {currentStep + 1} of {steps.length}</CardDescription>
            </div>
          </div>
          <span className="text-sm text-muted-foreground">
            {Math.round(progress)}% Complete
          </span>
        </div>
        <Progress value={progress} className="h-2" />
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Step 1: ISI Questions */}
        {currentStep === 0 && (
          <div className="space-y-6">
            <div className="p-4 rounded-lg bg-muted/50">
              <p className="text-sm text-muted-foreground">
                Rate each of the following during the past 2 weeks
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
              <div className={`p-4 rounded-lg border ${isiSeverity.color.replace('text-', 'border-').replace('600', '200')} ${isiSeverity.color.replace('text-', 'bg-').replace('600', '50')}`}>
                <p className="text-sm font-medium">Current ISI Score: {currentISI}</p>
                <p className={`text-sm ${isiSeverity.color}`}>{isiSeverity.label}</p>
              </div>
            )}
          </div>
        )}

        {/* Step 2: Sleep Timing */}
        {currentStep === 1 && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="bedtime">Average Bedtime</Label>
                <Input
                  id="bedtime"
                  type="time"
                  value={formData.average_bedtime || ''}
                  onChange={(e) => updateField('average_bedtime', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="waketime">Average Wake Time</Label>
                <Input
                  id="waketime"
                  type="time"
                  value={formData.average_wake_time || ''}
                  onChange={(e) => updateField('average_wake_time', e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>When do you typically exercise?</Label>
              <Select 
                value={formData.exercise_timing || ''} 
                onValueChange={(value) => updateField('exercise_timing', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select timing" />
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
        {currentStep === 2 && (
          <div className="space-y-6">
            <div className="space-y-2">
              <Label>Daily caffeine consumption</Label>
              <Select 
                value={formData.caffeine_intake || ''} 
                onValueChange={(value) => updateField('caffeine_intake', value)}
              >
                <SelectTrigger>
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
              <Label htmlFor="last_caffeine">Last caffeine consumption time</Label>
              <Input
                id="last_caffeine"
                type="time"
                value={formData.last_caffeine_time || ''}
                onChange={(e) => updateField('last_caffeine_time', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Screen time before bed (minutes)</Label>
              <div className="flex items-center gap-4">
                <Slider
                  value={[formData.screen_time_before_bed || 60]}
                  onValueChange={([value]) => updateField('screen_time_before_bed', value)}
                  max={180}
                  step={15}
                  className="flex-1"
                />
                <span className="w-16 text-sm text-muted-foreground">
                  {formData.screen_time_before_bed || 60} min
                </span>
              </div>
            </div>

            <div className="space-y-3">
              <Label>Current stress level (1-10)</Label>
              <div className="flex items-center gap-4">
                <Slider
                  value={[formData.stress_level || 5]}
                  onValueChange={([value]) => updateField('stress_level', value)}
                  min={1}
                  max={10}
                  step={1}
                  className="flex-1"
                />
                <span className="w-8 text-center font-medium">
                  {formData.stress_level || 5}
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
        {currentStep === 3 && (
          <div className="space-y-6">
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Thermometer className="h-4 w-4" />
                Bedroom Temperature
              </Label>
              <Select 
                value={formData.bedroom_temperature || ''} 
                onValueChange={(value) => updateField('bedroom_temperature', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select temperature" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="too_cold">Too cold (below 60°F)</SelectItem>
                  <SelectItem value="cool">Cool (60-65°F) - Optimal</SelectItem>
                  <SelectItem value="optimal">Optimal (65-68°F)</SelectItem>
                  <SelectItem value="warm">Warm (68-72°F)</SelectItem>
                  <SelectItem value="too_warm">Too warm (above 72°F)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Lightbulb className="h-4 w-4" />
                Light Exposure in Bedroom
              </Label>
              <Select 
                value={formData.light_exposure || ''} 
                onValueChange={(value) => updateField('light_exposure', value)}
              >
                <SelectTrigger>
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
              <Label className="flex items-center gap-2">
                <Volume2 className="h-4 w-4" />
                Noise Level
              </Label>
              <Select 
                value={formData.noise_level || ''} 
                onValueChange={(value) => updateField('noise_level', value)}
              >
                <SelectTrigger>
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
              <Label>Additional environment notes</Label>
              <Textarea
                placeholder="Any other environmental factors affecting your sleep..."
                value={formData.sleep_environment_notes || ''}
                onChange={(e) => updateField('sleep_environment_notes', e.target.value)}
              />
            </div>
          </div>
        )}

        {/* Step 5: Goals & Current Aids */}
        {currentStep === 4 && (
          <div className="space-y-6">
            <div className="space-y-2">
              <Label>Current sleep aids or supplements</Label>
              <Textarea
                placeholder="List any sleep aids, supplements, or medications you currently use for sleep..."
                value={formData.current_sleep_aids || ''}
                onChange={(e) => updateField('current_sleep_aids', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Current medications (that may affect sleep)</Label>
              <Textarea
                placeholder="List any medications that might impact your sleep..."
                value={formData.medications || ''}
                onChange={(e) => updateField('medications', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Target className="h-4 w-4" />
                Primary Sleep Goals
              </Label>
              <Textarea
                placeholder="What are your main goals for improving your sleep? What does optimal sleep look like for you?"
                value={formData.primary_sleep_goals || ''}
                onChange={(e) => updateField('primary_sleep_goals', e.target.value)}
                className="min-h-[100px]"
              />
            </div>

            <div className="space-y-2">
              <Label>Recommended Program Tier</Label>
              <Select 
                value={formData.program_tier || 'foundational'} 
                onValueChange={(value) => updateField('program_tier', value as any)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="foundational">
                    <div>
                      <div className="font-medium">Sleep Reset Protocol</div>
                      <div className="text-xs text-muted-foreground">Foundational tier</div>
                    </div>
                  </SelectItem>
                  <SelectItem value="advanced">
                    <div>
                      <div className="font-medium">Circadian Optimization Program</div>
                      <div className="text-xs text-muted-foreground">Advanced tier</div>
                    </div>
                  </SelectItem>
                  <SelectItem value="elite">
                    <div>
                      <div className="font-medium">NeuroRecovery & Sleep Performance</div>
                      <div className="text-xs text-muted-foreground">Elite tier</div>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className="flex justify-between pt-4 border-t">
          <Button
            variant="outline"
            onClick={currentStep === 0 ? onCancel : handleBack}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            {currentStep === 0 ? 'Cancel' : 'Back'}
          </Button>

          {currentStep < steps.length - 1 ? (
            <Button onClick={handleNext}>
              Next
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          ) : (
            <Button onClick={handleSubmit} disabled={isSubmitting}>
              {isSubmitting ? (
                'Submitting...'
              ) : (
                <>
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  Complete Assessment
                </>
              )}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
