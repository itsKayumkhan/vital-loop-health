import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { ArrowRight, ArrowLeft, CheckCircle2, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { getFormBySpecialty, CoachSpecialty, FormField } from '@/data/coachForms';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const CoachIntakeForm = () => {
  const { specialty } = useParams<{ specialty: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [currentSection, setCurrentSection] = useState(0);
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const formConfig = getFormBySpecialty(specialty as CoachSpecialty);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    if (!user) {
      navigate('/auth', { state: { from: `/intake/${specialty}` } });
    }
  }, [user, navigate, specialty]);

  if (!formConfig) {
    navigate('/services');
    return null;
  }

  const Icon = formConfig.icon;
  const totalSections = formConfig.sections.length;
  const progress = ((currentSection + 1) / totalSections) * 100;

  const updateFormData = (fieldId: string, value: any) => {
    setFormData(prev => ({ ...prev, [fieldId]: value }));
  };

  const handleCheckboxChange = (fieldId: string, option: string, checked: boolean) => {
    setFormData(prev => {
      const current = prev[fieldId] || [];
      if (checked) {
        return { ...prev, [fieldId]: [...current, option] };
      } else {
        return { ...prev, [fieldId]: current.filter((o: string) => o !== option) };
      }
    });
  };

  const validateSection = () => {
    const section = formConfig.sections[currentSection];
    for (const field of section.fields) {
      if (field.required) {
        const value = formData[field.id];
        if (!value || (Array.isArray(value) && value.length === 0)) {
          toast({
            title: 'Required field',
            description: `Please complete "${field.label}"`,
            variant: 'destructive',
          });
          return false;
        }
      }
    }
    return true;
  };

  const handleNext = () => {
    if (validateSection()) {
      if (currentSection < totalSections - 1) {
        setCurrentSection(prev => prev + 1);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }
  };

  const handleBack = () => {
    if (currentSection > 0) {
      setCurrentSection(prev => prev - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleSubmit = async () => {
    if (!validateSection()) return;
    if (!user) return;

    setSubmitting(true);

    try {
      const { error } = await supabase
        .from('coach_intake_forms')
        .insert({
          user_id: user.id,
          specialty: specialty as CoachSpecialty,
          form_data: formData,
          status: 'pending',
        });

      if (error) throw error;

      setSubmitted(true);
      toast({
        title: 'Form submitted!',
        description: 'Your Health Architect will review your submission soon.',
      });
    } catch (err: any) {
      toast({
        title: 'Submission failed',
        description: err.message || 'Please try again',
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const renderField = (field: FormField) => {
    switch (field.type) {
      case 'text':
      case 'number':
      case 'date':
        return (
          <Input
            type={field.type}
            placeholder={field.placeholder}
            value={formData[field.id] || ''}
            onChange={(e) => updateFormData(field.id, e.target.value)}
            className="bg-muted/50"
          />
        );
      
      case 'textarea':
        return (
          <Textarea
            placeholder={field.placeholder}
            value={formData[field.id] || ''}
            onChange={(e) => updateFormData(field.id, e.target.value)}
            className="bg-muted/50 min-h-[100px]"
          />
        );
      
      case 'select':
        return (
          <Select
            value={formData[field.id] || ''}
            onValueChange={(value) => updateFormData(field.id, value)}
          >
            <SelectTrigger className="bg-muted/50">
              <SelectValue placeholder="Select an option..." />
            </SelectTrigger>
            <SelectContent>
              {field.options?.map((option) => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );
      
      case 'radio':
        return (
          <RadioGroup
            value={formData[field.id] || ''}
            onValueChange={(value) => updateFormData(field.id, value)}
            className="space-y-3"
          >
            {field.options?.map((option) => (
              <div key={option} className="flex items-center space-x-3">
                <RadioGroupItem value={option} id={`${field.id}-${option}`} />
                <Label htmlFor={`${field.id}-${option}`} className="font-normal cursor-pointer">
                  {option}
                </Label>
              </div>
            ))}
          </RadioGroup>
        );
      
      case 'checkbox':
        return (
          <div className="space-y-3">
            {field.options?.map((option) => (
              <div key={option} className="flex items-center space-x-3">
                <Checkbox
                  id={`${field.id}-${option}`}
                  checked={(formData[field.id] || []).includes(option)}
                  onCheckedChange={(checked) => handleCheckboxChange(field.id, option, !!checked)}
                />
                <Label htmlFor={`${field.id}-${option}`} className="font-normal cursor-pointer">
                  {option}
                </Label>
              </div>
            ))}
          </div>
        );
      
      default:
        return null;
    }
  };

  if (submitted) {
    return (
      <>
        <Helmet>
          <title>Form Submitted | VitalityX Health</title>
        </Helmet>

        <main className="min-h-screen">
          <Navbar />
          
          <section className="pt-32 pb-16 lg:pt-40 lg:pb-24">
            <div className="container mx-auto px-4 lg:px-8">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6 }}
                className="max-w-2xl mx-auto text-center"
              >
                <div className={`w-24 h-24 rounded-full bg-gradient-to-br ${formConfig.gradient} flex items-center justify-center mx-auto mb-8`}>
                  <CheckCircle2 className="w-12 h-12 text-white" />
                </div>
                <h1 className="text-3xl md:text-4xl font-bold mb-4">
                  Thank You!
                </h1>
                <p className="text-lg text-muted-foreground mb-8">
                  Your {formConfig.title.replace(' Intake', '')} intake form has been submitted successfully. 
                  Your Health Architect will review your responses and reach out soon.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button variant="hero" size="lg" onClick={() => navigate('/portal')}>
                    Go to Portal
                  </Button>
                  <Button variant="heroOutline" size="lg" onClick={() => navigate('/services')}>
                    View Other Services
                  </Button>
                </div>
              </motion.div>
            </div>
          </section>

          <Footer />
        </main>
      </>
    );
  }

  const currentSectionData = formConfig.sections[currentSection];

  return (
    <>
      <Helmet>
        <title>{formConfig.title} | VitalityX Health</title>
        <meta name="description" content={formConfig.description} />
      </Helmet>

      <main className="min-h-screen">
        <Navbar />
        
        {/* Hero Header */}
        <section className="pt-32 pb-8 lg:pt-40 lg:pb-12">
          <div className="container mx-auto px-4 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="max-w-3xl mx-auto"
            >
              <div className="flex items-center gap-4 mb-6">
                <div className={`w-16 h-16 rounded-xl bg-gradient-to-br ${formConfig.gradient} flex items-center justify-center`}>
                  <Icon className="w-8 h-8 text-white" />
                </div>
                <div>
                  <span className="text-secondary text-sm font-bold tracking-widest uppercase">
                    {formConfig.tagline}
                  </span>
                  <h1 className="text-2xl md:text-3xl font-bold">{formConfig.title}</h1>
                </div>
              </div>
              <p className="text-muted-foreground mb-6">
                {formConfig.description}
              </p>
              
              {/* Progress */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">
                    Section {currentSection + 1} of {totalSections}
                  </span>
                  <span className="text-secondary font-medium">
                    {Math.round(progress)}% complete
                  </span>
                </div>
                <Progress value={progress} className="h-2" />
              </div>
            </motion.div>
          </div>
        </section>

        {/* Form Section */}
        <section className="pb-16 lg:pb-24">
          <div className="container mx-auto px-4 lg:px-8">
            <motion.div
              key={currentSection}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4 }}
              className="max-w-3xl mx-auto"
            >
              <div className="glass-card rounded-2xl p-6 lg:p-10">
                <div className="mb-8">
                  <h2 className="text-xl md:text-2xl font-bold mb-2">
                    {currentSectionData.title}
                  </h2>
                  {currentSectionData.description && (
                    <p className="text-muted-foreground">
                      {currentSectionData.description}
                    </p>
                  )}
                </div>

                <div className="space-y-6">
                  {currentSectionData.fields.map((field) => (
                    <div key={field.id} className="space-y-2">
                      <Label className="text-base">
                        {field.label}
                        {field.required && <span className="text-destructive ml-1">*</span>}
                      </Label>
                      {renderField(field)}
                    </div>
                  ))}
                </div>

                {/* Navigation */}
                <div className="flex justify-between mt-10 pt-6 border-t border-border">
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={handleBack}
                    disabled={currentSection === 0}
                    className="group"
                  >
                    <ArrowLeft className="mr-2 w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                    Back
                  </Button>

                  {currentSection < totalSections - 1 ? (
                    <Button
                      variant="hero"
                      size="lg"
                      onClick={handleNext}
                      className="group"
                    >
                      Continue
                      <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  ) : (
                    <Button
                      variant="hero"
                      size="lg"
                      onClick={handleSubmit}
                      disabled={submitting}
                      className="group"
                    >
                      {submitting ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      ) : (
                        <>
                          Submit Form
                          <CheckCircle2 className="ml-2 w-5 h-5" />
                        </>
                      )}
                    </Button>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        <Footer />
      </main>
    </>
  );
};

export default CoachIntakeForm;
