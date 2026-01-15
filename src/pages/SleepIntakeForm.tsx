import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { ArrowLeft, ArrowRight, Moon, Clock, Coffee, Thermometer, Lightbulb, Volume2, Target, Sparkles, CheckCircle2, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { calculateISIScore, getISISeverity, determinePhenotype, sleepPhenotypeLabels } from '@/types/sleep';
import type { SleepAssessment } from '@/types/sleep';
import { toast } from 'sonner';
import { z } from 'zod';

const contactInfoSchema = z.object({
  fullName: z.string().trim().min(2, 'Name must be at least 2 characters').max(100, 'Name must be less than 100 characters'),
  email: z.string().trim().email('Please enter a valid email address').max(255, 'Email must be less than 255 characters'),
  phone: z.string().trim().optional(),
});

const isiLabels = ['None', 'Mild', 'Moderate', 'Severe', 'Very Severe'];

const steps = [
  { id: 'intro', title: 'Welcome', icon: Sparkles },
  { id: 'contact', title: 'Your Info', icon: Target },
  { id: 'isi', title: 'Sleep Quality', icon: Moon },
  { id: 'timing', title: 'Sleep Schedule', icon: Clock },
  { id: 'lifestyle', title: 'Lifestyle', icon: Coffee },
  { id: 'environment', title: 'Environment', icon: Thermometer },
  { id: 'goals', title: 'Your Goals', icon: Target },
  { id: 'results', title: 'Results', icon: CheckCircle2 },
];

const SleepIntakeForm = () => {
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
    screen_time_before_bed: 60,
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

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const updateField = (field: keyof SleepAssessment, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const updateContactField = (field: string, value: string) => {
    setContactInfo(prev => ({ ...prev, [field]: value }));
    // Clear validation error when user types
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
    // Validate contact info before proceeding from that step
    if (currentStep === 1 && !validateContactInfo()) {
      return;
    }
    
    if (currentStep < steps.length - 1) {
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
      const isiScore = calculateISIScore(formData);
      const phenotype = determinePhenotype(formData);

      // If user is logged in, try to save to database
      if (user) {
        const { data: clientData } = await supabase
          .from('crm_clients')
          .select('id')
          .eq('user_id', user.id)
          .single();

        if (clientData) {
          await supabase
            .from('sleep_assessments')
            .insert({
              client_id: clientData.id,
              ...formData,
              isi_score: isiScore,
              phenotype,
              status: 'pending',
              program_tier: 'foundational',
            });
        }
      }

      // For non-logged-in users, we just show results and collect their info
      // In a real app, you might want to save this to a leads table or send an email
      
      setIsSubmitted(true);
      toast.success('Assessment complete! See your results below.');
    } catch (error) {
      console.error('Error submitting assessment:', error);
      toast.error('Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const progress = ((currentStep) / (steps.length - 1)) * 100;
  const currentISI = calculateISIScore(formData);
  const isiSeverity = getISISeverity(currentISI);
  const phenotype = determinePhenotype(formData);

  const renderISIQuestion = (field: keyof SleepAssessment, question: string) => (
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
              className={`px-4 py-2 rounded-lg border cursor-pointer transition-all ${
                formData[field] === index
                  ? 'bg-primary text-primary-foreground border-primary shadow-md'
                  : 'bg-card hover:bg-muted border-border hover:border-primary/50'
              }`}
            >
              {label}
            </Label>
          </div>
        ))}
      </RadioGroup>
    </div>
  );

  return (
    <>
      <Helmet>
        <title>Sleep Assessment | VitalityX Health</title>
        <meta name="description" content="Take our comprehensive sleep assessment to understand your sleep patterns and get personalized recommendations." />
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
                        const StepIcon = steps[currentStep].icon;
                        return <StepIcon className="h-6 w-6 text-secondary" />;
                      })()}
                      <div>
                        <CardTitle className="text-xl">{steps[currentStep].title}</CardTitle>
                        <CardDescription>Step {currentStep + 1} of {steps.length}</CardDescription>
                      </div>
                    </div>
                    {currentStep > 0 && currentStep < steps.length - 1 && (
                      <span className="text-sm text-muted-foreground font-medium">
                        {Math.round(progress)}% Complete
                      </span>
                    )}
                  </div>
                  {currentStep > 0 && currentStep < steps.length - 1 && (
                    <Progress value={progress} className="h-2" />
                  )}
                </CardHeader>

                <CardContent className="space-y-6">
                  {/* Step 0: Introduction */}
                  {currentStep === 0 && (
                    <div className="space-y-6 text-center py-6">
                      <div className="w-20 h-20 rounded-full bg-secondary/10 flex items-center justify-center mx-auto">
                        <Moon className="h-10 w-10 text-secondary" />
                      </div>
                      <div className="space-y-3">
                        <h2 className="text-2xl font-bold">Sleep Optimization Assessment</h2>
                        <p className="text-muted-foreground max-w-md mx-auto">
                          Discover your sleep phenotype and get personalized recommendations to transform your rest and recovery.
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
                            Validated sleep quality questionnaire
                          </li>
                          <li className="flex items-center gap-2">
                            <CheckCircle2 className="h-4 w-4 text-secondary" />
                            Personalized phenotype analysis
                          </li>
                          <li className="flex items-center gap-2">
                            <CheckCircle2 className="h-4 w-4 text-secondary" />
                            Instant results and recommendations
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

                  {/* Step 2: ISI Questions */}
                  {currentStep === 2 && (
                    <div className="space-y-6">
                      <div className="p-4 rounded-lg bg-muted/50 border">
                        <p className="text-sm text-muted-foreground">
                          Rate each of the following during the <strong>past 2 weeks</strong>
                        </p>
                      </div>
                      {renderISIQuestion('difficulty_falling_asleep', 'Difficulty falling asleep')}
                      {renderISIQuestion('difficulty_staying_asleep', 'Difficulty staying asleep')}
                      {renderISIQuestion('waking_too_early', 'Problems waking up too early')}
                      {renderISIQuestion('sleep_satisfaction', 'How unsatisfied are you with your current sleep pattern?')}
                      {renderISIQuestion('sleep_interference_daily', 'How much does your sleep problem interfere with your daily functioning?')}
                      {renderISIQuestion('sleep_distress', 'How worried/distressed are you about your current sleep problem?')}

                      {currentISI > 0 && (
                        <div className={`p-4 rounded-lg border-2 ${
                          currentISI <= 7 ? 'border-green-500/50 bg-green-500/10' :
                          currentISI <= 14 ? 'border-yellow-500/50 bg-yellow-500/10' :
                          currentISI <= 21 ? 'border-orange-500/50 bg-orange-500/10' :
                          'border-red-500/50 bg-red-500/10'
                        }`}>
                          <p className="text-sm font-medium">Your current score indicates: <span className={isiSeverity.color}>{isiSeverity.label}</span></p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Step 3: Sleep Timing */}
                  {currentStep === 3 && (
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
                        <Select value={formData.exercise_timing || ''} onValueChange={(value) => updateField('exercise_timing', value)}>
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

                  {/* Step 4: Lifestyle Factors */}
                  {currentStep === 4 && (
                    <div className="space-y-6">
                      <div className="space-y-2">
                        <Label className="text-base">Daily caffeine consumption</Label>
                        <Select value={formData.caffeine_intake || ''} onValueChange={(value) => updateField('caffeine_intake', value)}>
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
                      </div>
                    </div>
                  )}

                  {/* Step 5: Environment */}
                  {currentStep === 5 && (
                    <div className="space-y-6">
                      <div className="space-y-2">
                        <Label className="flex items-center gap-2 text-base">
                          <Thermometer className="h-4 w-4 text-secondary" />
                          Bedroom Temperature
                        </Label>
                        <Select value={formData.bedroom_temperature || ''} onValueChange={(value) => updateField('bedroom_temperature', value)}>
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
                          <Lightbulb className="h-4 w-4 text-secondary" />
                          Light in Your Bedroom
                        </Label>
                        <Select value={formData.light_exposure || ''} onValueChange={(value) => updateField('light_exposure', value)}>
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
                          <Volume2 className="h-4 w-4 text-secondary" />
                          Noise Level
                        </Label>
                        <Select value={formData.noise_level || ''} onValueChange={(value) => updateField('noise_level', value)}>
                          <SelectTrigger className="h-12">
                            <SelectValue placeholder="Select noise level" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="silent">Silent</SelectItem>
                            <SelectItem value="quiet">Quiet</SelectItem>
                            <SelectItem value="moderate">Moderate noise</SelectItem>
                            <SelectItem value="noisy">Noisy (traffic, neighbors, etc.)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  )}

                  {/* Step 6: Goals */}
                  {currentStep === 6 && (
                    <div className="space-y-6">
                      <div className="space-y-2">
                        <Label className="text-base">What are your primary sleep goals?</Label>
                        <Textarea
                          value={formData.primary_sleep_goals || ''}
                          onChange={(e) => updateField('primary_sleep_goals', e.target.value.slice(0, 500))}
                          placeholder="E.g., Fall asleep faster, wake up feeling refreshed, stop waking up at night..."
                          className="min-h-[100px]"
                          maxLength={500}
                        />
                        <p className="text-xs text-muted-foreground text-right">
                          {(formData.primary_sleep_goals || '').length}/500
                        </p>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-base">Current sleep aids or supplements</Label>
                        <Textarea
                          value={formData.current_sleep_aids || ''}
                          onChange={(e) => updateField('current_sleep_aids', e.target.value.slice(0, 300))}
                          placeholder="List any sleep aids, supplements, or medications you currently use..."
                          className="min-h-[80px]"
                          maxLength={300}
                        />
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
                              Click below to complete your assessment and discover your sleep phenotype with personalized recommendations.
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
                            <h2 className="text-2xl font-bold">Your Sleep Assessment Results</h2>
                          </div>

                          {/* ISI Score */}
                          <div className={`p-6 rounded-xl border-2 ${
                            currentISI <= 7 ? 'border-green-500/50 bg-green-500/10' :
                            currentISI <= 14 ? 'border-yellow-500/50 bg-yellow-500/10' :
                            currentISI <= 21 ? 'border-orange-500/50 bg-orange-500/10' :
                            'border-red-500/50 bg-red-500/10'
                          }`}>
                            <div className="flex items-center justify-between mb-4">
                              <h3 className="font-semibold">Insomnia Severity Index</h3>
                              <span className="text-3xl font-bold">{currentISI}/28</span>
                            </div>
                            <p className="text-lg font-medium mb-2">{isiSeverity.label}</p>
                            <p className="text-sm text-muted-foreground">
                              {currentISI <= 7 ? 'Your sleep quality appears to be within normal range.' :
                               currentISI <= 14 ? 'You may benefit from sleep optimization strategies.' :
                               currentISI <= 21 ? 'Moderate sleep difficulties detected. Professional guidance recommended.' :
                               'Significant sleep challenges detected. Our program can help.'}
                            </p>
                          </div>

                          {/* Phenotype */}
                          {phenotype && (
                            <div className="p-6 rounded-xl border-2 border-secondary/50 bg-secondary/5">
                              <h3 className="font-semibold mb-2">Your Sleep Phenotype</h3>
                              <p className="text-2xl font-bold text-secondary mb-3">
                                {sleepPhenotypeLabels[phenotype]}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                This phenotype helps us tailor interventions specifically for your sleep challenges.
                              </p>
                            </div>
                          )}

                          {/* CTA */}
                          <div className="bg-gradient-to-r from-secondary/20 to-primary/20 rounded-xl p-6 text-center space-y-4">
                            <h3 className="font-bold text-lg">Ready to Transform Your Sleep?</h3>
                            <p className="text-sm text-muted-foreground">
                              Our Sleep Performance Program provides personalized coaching and interventions based on your assessment.
                            </p>
                            <div className="flex flex-col sm:flex-row gap-3 justify-center">
                              <Button variant="hero" asChild>
                                <Link to="/programs">Explore Sleep Programs</Link>
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
                  {currentStep < steps.length - 1 && (
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

export default SleepIntakeForm;
