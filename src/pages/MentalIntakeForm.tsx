import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { ArrowLeft, ArrowRight, Brain, Zap, Heart, Activity, Target, Sparkles, CheckCircle2, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { 
  calculateCognitiveScore, 
  getCognitiveSeverity, 
  determineMentalPhenotype,
  mentalPhenotypeLabels,
  mentalPhenotypeDescriptions,
} from '@/types/mentalPerformance';
import type { MentalPerformanceAssessment } from '@/types/mentalPerformance';
import { toast } from 'sonner';
import { z } from 'zod';

const contactInfoSchema = z.object({
  fullName: z.string().trim().min(2, 'Name must be at least 2 characters').max(100, 'Name must be less than 100 characters'),
  email: z.string().trim().email('Please enter a valid email address').max(255, 'Email must be less than 255 characters'),
  phone: z.string().trim().optional(),
});

const STEPS = [
  { id: 'intro', title: 'Welcome', icon: Sparkles, description: 'Introduction to the assessment' },
  { id: 'contact', title: 'Your Info', icon: Target, description: 'Contact information' },
  { id: 'cognitive', title: 'Cognitive Function', icon: Brain, description: 'Assess focus, memory, and mental clarity' },
  { id: 'stress', title: 'Stress & Emotions', icon: Heart, description: 'Evaluate stress levels and emotional regulation' },
  { id: 'energy', title: 'Mental Energy', icon: Zap, description: 'Measure your energy and motivation' },
  { id: 'lifestyle', title: 'Lifestyle', icon: Activity, description: 'Review habits affecting cognition' },
  { id: 'goals', title: 'Your Goals', icon: Target, description: 'Define your performance objectives' },
  { id: 'results', title: 'Results', icon: CheckCircle2, description: 'Your personalized results' },
];

const MentalIntakeForm = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  const [contactInfo, setContactInfo] = useState({
    fullName: '',
    email: '',
    phone: '',
  });

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
    caffeine_dependency: '',
    exercise_frequency: '',
    work_type: '',
    peak_performance_hours: '',
    primary_mental_goals: '',
  });

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const updateField = (field: keyof MentalPerformanceAssessment, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const updateContactField = (field: string, value: string) => {
    setContactInfo(prev => ({ ...prev, [field]: value }));
    if (validationErrors[field]) {
      setValidationErrors(prev => {
        const updated = { ...prev };
        delete updated[field];
        return updated;
      });
    }
  };

  const validateContactInfo = () => {
    try {
      contactInfoSchema.parse(contactInfo);
      setValidationErrors({});
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errors: Record<string, string> = {};
        error.errors.forEach(err => {
          if (err.path[0]) {
            errors[err.path[0] as string] = err.message;
          }
        });
        setValidationErrors(errors);
      }
      return false;
    }
  };

  const handleNext = () => {
    if (currentStep === 1 && !validateContactInfo()) {
      return;
    }
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(prev => prev + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const cognitiveScore = calculateCognitiveScore(formData);
      const phenotype = determineMentalPhenotype(formData);

      if (user) {
        const { data: clientData } = await supabase
          .from('crm_clients')
          .select('id')
          .eq('user_id', user.id)
          .single();

        if (clientData) {
          await supabase
            .from('mental_performance_assessments')
            .insert({
              client_id: clientData.id,
              ...formData,
              cognitive_function_score: cognitiveScore,
              phenotype: phenotype || null,
              status: 'pending',
              program_tier: 'cognitive_foundations',
            });
        }
      }

      setIsSubmitted(true);
      toast.success('Assessment complete! See your results below.');
    } catch (error) {
      console.error('Error submitting assessment:', error);
      toast.error('Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const progress = ((currentStep) / (STEPS.length - 1)) * 100;
  const currentCognitiveScore = calculateCognitiveScore(formData);
  const cognitiveSeverity = getCognitiveSeverity(currentCognitiveScore);
  const phenotype = determineMentalPhenotype(formData);

  return (
    <>
      <Helmet>
        <title>Mental Performance Assessment | VitalityX Health</title>
        <meta name="description" content="Take our comprehensive mental performance assessment to understand your cognitive patterns and get personalized recommendations." />
      </Helmet>

      <main className="min-h-screen">
        <Navbar />

        <section className="pt-32 pb-24 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-primary/10 via-transparent to-transparent" />
          <div className="container mx-auto px-4 lg:px-8 relative">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-2xl mx-auto"
            >
              <Card className="border-2">
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      {(() => {
                        const StepIcon = STEPS[currentStep].icon;
                        return <StepIcon className="h-6 w-6 text-secondary" />;
                      })()}
                      <div>
                        <CardTitle className="text-xl">{STEPS[currentStep].title}</CardTitle>
                        <CardDescription>Step {currentStep + 1} of {STEPS.length}</CardDescription>
                      </div>
                    </div>
                    {currentStep > 0 && currentStep < STEPS.length - 1 && (
                      <span className="text-sm text-muted-foreground font-medium">
                        {Math.round(progress)}% Complete
                      </span>
                    )}
                  </div>
                  {currentStep > 0 && currentStep < STEPS.length - 1 && (
                    <Progress value={progress} className="h-2" />
                  )}
                </CardHeader>

                <CardContent className="space-y-6">
                  {/* Step 0: Introduction */}
                  {currentStep === 0 && (
                    <div className="space-y-6 text-center py-6">
                      <div className="w-20 h-20 rounded-full bg-secondary/10 flex items-center justify-center mx-auto">
                        <Brain className="h-10 w-10 text-secondary" />
                      </div>
                      <div className="space-y-3">
                        <h2 className="text-2xl font-bold">Mental Performance Assessment</h2>
                        <p className="text-muted-foreground max-w-md mx-auto">
                          Discover your cognitive phenotype and get personalized strategies to optimize focus, memory, and mental clarity.
                        </p>
                      </div>
                      <div className="bg-muted/50 rounded-lg p-4 max-w-md mx-auto text-left">
                        <h3 className="font-semibold mb-2">What to expect:</h3>
                        <ul className="space-y-2 text-sm text-muted-foreground">
                          <li className="flex items-center gap-2">
                            <CheckCircle2 className="h-4 w-4 text-secondary" />
                            5-7 minutes to complete
                          </li>
                          <li className="flex items-center gap-2">
                            <CheckCircle2 className="h-4 w-4 text-secondary" />
                            Cognitive function assessment
                          </li>
                          <li className="flex items-center gap-2">
                            <CheckCircle2 className="h-4 w-4 text-secondary" />
                            Stress and energy analysis
                          </li>
                          <li className="flex items-center gap-2">
                            <CheckCircle2 className="h-4 w-4 text-secondary" />
                            Instant phenotype results
                          </li>
                        </ul>
                      </div>
                    </div>
                  )}

                  {/* Step 1: Contact Info */}
                  {currentStep === 1 && (
                    <div className="space-y-6">
                      <div className="space-y-2">
                        <Label htmlFor="fullName" className="text-base">Full Name *</Label>
                        <Input
                          id="fullName"
                          value={contactInfo.fullName}
                          onChange={(e) => updateContactField('fullName', e.target.value)}
                          placeholder="Your full name"
                          className={`h-12 ${validationErrors.fullName ? 'border-destructive' : ''}`}
                        />
                        {validationErrors.fullName && (
                          <p className="text-sm text-destructive">{validationErrors.fullName}</p>
                        )}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email" className="text-base">Email Address *</Label>
                        <Input
                          id="email"
                          type="email"
                          value={contactInfo.email}
                          onChange={(e) => updateContactField('email', e.target.value)}
                          placeholder="your@email.com"
                          className={`h-12 ${validationErrors.email ? 'border-destructive' : ''}`}
                        />
                        {validationErrors.email && (
                          <p className="text-sm text-destructive">{validationErrors.email}</p>
                        )}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="phone" className="text-base">Phone (optional)</Label>
                        <Input
                          id="phone"
                          type="tel"
                          value={contactInfo.phone}
                          onChange={(e) => updateContactField('phone', e.target.value)}
                          placeholder="(555) 123-4567"
                          className="h-12"
                        />
                      </div>
                    </div>
                  )}

                  {/* Step 2: Cognitive Function */}
                  {currentStep === 2 && (
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
                            Current assessment: <span className={cognitiveSeverity.color}>{cognitiveSeverity.label}</span>
                          </p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Step 3: Stress & Emotions */}
                  {currentStep === 3 && (
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
                          <Label className="text-base">Emotional resilience</Label>
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
                  )}

                  {/* Step 4: Mental Energy */}
                  {currentStep === 4 && (
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
                  )}

                  {/* Step 5: Lifestyle */}
                  {currentStep === 5 && (
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
                  )}

                  {/* Step 6: Goals */}
                  {currentStep === 6 && (
                    <div className="space-y-6">
                      <div className="space-y-3">
                        <Label className="text-base">What type of work do you primarily do?</Label>
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
                            { value: 'night', label: 'Night (after 9pm)' },
                          ].map(({ value, label }) => (
                            <div key={value} className="flex items-center space-x-3">
                              <RadioGroupItem value={value} id={`peak-${value}`} />
                              <Label htmlFor={`peak-${value}`} className="cursor-pointer">{label}</Label>
                            </div>
                          ))}
                        </RadioGroup>
                      </div>

                      <div className="space-y-2">
                        <Label className="text-base">What are your primary mental performance goals?</Label>
                        <Textarea
                          value={formData.primary_mental_goals || ''}
                          onChange={(e) => updateField('primary_mental_goals', e.target.value.slice(0, 500))}
                          placeholder="E.g., Improve focus during work, reduce brain fog, better memory recall..."
                          className="min-h-[100px]"
                          maxLength={500}
                        />
                        <p className="text-xs text-muted-foreground text-right">
                          {(formData.primary_mental_goals || '').length}/500
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Step 7: Results */}
                  {currentStep === 7 && (
                    <div className="space-y-6">
                      {!isSubmitted ? (
                        <div className="text-center py-6 space-y-6">
                          <div className="w-20 h-20 rounded-full bg-secondary/10 flex items-center justify-center mx-auto">
                            <Send className="h-10 w-10 text-secondary" />
                          </div>
                          <div className="space-y-3">
                            <h2 className="text-2xl font-bold">Ready to See Your Results?</h2>
                            <p className="text-muted-foreground max-w-md mx-auto">
                              Click below to complete your assessment and discover your cognitive phenotype with personalized recommendations.
                            </p>
                          </div>
                          <Button 
                            variant="hero" 
                            size="lg" 
                            onClick={handleSubmit}
                            disabled={isSubmitting}
                            className="gap-2"
                          >
                            {isSubmitting ? 'Processing...' : 'Get My Results'}
                            <ArrowRight className="w-4 h-4" />
                          </Button>
                        </div>
                      ) : (
                        <div className="space-y-6">
                          <div className="text-center space-y-4">
                            <div className="w-20 h-20 rounded-full bg-green-500/10 flex items-center justify-center mx-auto">
                              <CheckCircle2 className="h-10 w-10 text-green-500" />
                            </div>
                            <h2 className="text-2xl font-bold">Your Mental Performance Results</h2>
                          </div>

                          {/* Cognitive Score */}
                          <div className={`p-6 rounded-xl border-2 ${
                            currentCognitiveScore <= 4 ? 'border-green-500/50 bg-green-500/10' :
                            currentCognitiveScore <= 8 ? 'border-yellow-500/50 bg-yellow-500/10' :
                            currentCognitiveScore <= 12 ? 'border-orange-500/50 bg-orange-500/10' :
                            'border-red-500/50 bg-red-500/10'
                          }`}>
                            <div className="flex items-center justify-between mb-4">
                              <h3 className="font-semibold">Cognitive Function Score</h3>
                              <span className="text-3xl font-bold">{currentCognitiveScore}/20</span>
                            </div>
                            <p className="text-lg font-medium mb-2">{cognitiveSeverity.label}</p>
                            <p className="text-sm text-muted-foreground">
                              {currentCognitiveScore <= 4 ? 'Your cognitive function appears healthy.' :
                               currentCognitiveScore <= 8 ? 'Mild cognitive challenges detected. Optimization strategies can help.' :
                               currentCognitiveScore <= 12 ? 'Moderate cognitive difficulties. Our program can significantly improve your performance.' :
                               'Significant cognitive challenges. Professional guidance highly recommended.'}
                            </p>
                          </div>

                          {/* Phenotype */}
                          {phenotype && (
                            <div className="p-6 rounded-xl border-2 border-secondary/50 bg-secondary/5">
                              <h3 className="font-semibold mb-2">Your Cognitive Phenotype</h3>
                              <p className="text-2xl font-bold text-secondary mb-3">
                                {mentalPhenotypeLabels[phenotype]}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                {mentalPhenotypeDescriptions[phenotype]}
                              </p>
                            </div>
                          )}

                          {/* CTA */}
                          <div className="bg-gradient-to-r from-secondary/20 to-primary/20 rounded-xl p-6 text-center space-y-4">
                            <h3 className="font-bold text-lg">Ready to Unlock Peak Performance?</h3>
                            <p className="text-sm text-muted-foreground">
                              Our Mental Performance Program provides personalized coaching and interventions based on your assessment.
                            </p>
                            <div className="flex flex-col sm:flex-row gap-3 justify-center">
                              <Button variant="hero" asChild>
                                <Link to="/programs">Explore Mental Programs</Link>
                              </Button>
                              <Button variant="heroOutline" asChild>
                                <Link to="/contact">Book a Consultation</Link>
                              </Button>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Navigation Buttons */}
                  {currentStep < STEPS.length - 1 && (
                    <div className="flex gap-3 pt-4 border-t border-border">
                      {currentStep > 0 && (
                        <Button variant="outline" onClick={handleBack} className="gap-2">
                          <ArrowLeft className="w-4 h-4" />
                          Back
                        </Button>
                      )}
                      <Button variant="hero" onClick={handleNext} className="ml-auto gap-2">
                        {currentStep === 0 ? 'Start Assessment' : 'Continue'}
                        <ArrowRight className="w-4 h-4" />
                      </Button>
                    </div>
                  )}

                  {isSubmitted && (
                    <div className="pt-4 border-t border-border">
                      <Button variant="outline" asChild className="w-full">
                        <Link to="/programs">
                          <ArrowLeft className="w-4 h-4 mr-2" />
                          Back to Programs
                        </Link>
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </section>

        <Footer />
      </main>
    </>
  );
};

export default MentalIntakeForm;
