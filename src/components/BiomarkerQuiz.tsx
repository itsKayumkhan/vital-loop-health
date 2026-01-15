import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Brain,
  Zap,
  Moon,
  Heart,
  Leaf,
  Activity,
  Dna,
  ArrowRight,
  ArrowLeft,
  RotateCcw,
  Check,
  Sparkles,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

interface QuizOption {
  id: string;
  label: string;
  icon: React.ElementType;
}

interface QuizQuestion {
  id: string;
  question: string;
  subtitle: string;
  options: QuizOption[];
  multiSelect?: boolean;
}

interface TestRecommendation {
  name: string;
  category: string;
  description: string;
  price: number;
  priority: 'high' | 'medium' | 'low';
  matchReason: string;
}

const questions: QuizQuestion[] = [
  {
    id: 'primary_goal',
    question: 'What is your primary health goal?',
    subtitle: 'Select the area you want to focus on most',
    options: [
      { id: 'energy', label: 'More Energy & Vitality', icon: Zap },
      { id: 'cognitive', label: 'Mental Clarity & Focus', icon: Brain },
      { id: 'sleep', label: 'Better Sleep & Recovery', icon: Moon },
      { id: 'longevity', label: 'Longevity & Prevention', icon: Heart },
      { id: 'gut', label: 'Gut Health & Digestion', icon: Leaf },
      { id: 'hormones', label: 'Hormone Optimization', icon: Activity },
    ],
  },
  {
    id: 'symptoms',
    question: 'Which symptoms are you experiencing?',
    subtitle: 'Select all that apply',
    multiSelect: true,
    options: [
      { id: 'fatigue', label: 'Fatigue or Low Energy', icon: Zap },
      { id: 'brain_fog', label: 'Brain Fog or Poor Focus', icon: Brain },
      { id: 'sleep_issues', label: 'Trouble Sleeping', icon: Moon },
      { id: 'weight', label: 'Weight Management Issues', icon: Activity },
      { id: 'digestive', label: 'Digestive Problems', icon: Leaf },
      { id: 'mood', label: 'Mood Swings or Anxiety', icon: Heart },
    ],
  },
  {
    id: 'lifestyle',
    question: 'What best describes your lifestyle?',
    subtitle: 'This helps us personalize recommendations',
    options: [
      { id: 'high_stress', label: 'High-Stress Career', icon: Zap },
      { id: 'athletic', label: 'Athletic / Active', icon: Activity },
      { id: 'sedentary', label: 'Mostly Sedentary', icon: Moon },
      { id: 'parent', label: 'Busy Parent', icon: Heart },
      { id: 'traveler', label: 'Frequent Traveler', icon: Dna },
      { id: 'shift_work', label: 'Shift Worker', icon: Brain },
    ],
  },
  {
    id: 'history',
    question: 'Any specific health concerns?',
    subtitle: 'Select all that apply',
    multiSelect: true,
    options: [
      { id: 'family_heart', label: 'Family History of Heart Disease', icon: Heart },
      { id: 'family_diabetes', label: 'Family History of Diabetes', icon: Activity },
      { id: 'autoimmune', label: 'Autoimmune Conditions', icon: Leaf },
      { id: 'thyroid', label: 'Thyroid Issues', icon: Zap },
      { id: 'none', label: 'None of These', icon: Check },
    ],
  },
];

const getRecommendations = (answers: Record<string, string[]>): TestRecommendation[] => {
  const recommendations: TestRecommendation[] = [];
  const primaryGoal = answers.primary_goal?.[0];
  const symptoms = answers.symptoms || [];
  const lifestyle = answers.lifestyle?.[0];
  const history = answers.history || [];

  // Core recommendations based on primary goal
  if (primaryGoal === 'energy') {
    recommendations.push({
      name: 'Core Metabolic & Energy Panel',
      category: 'Precision Labs',
      description: 'Foundational markers for metabolic health and cellular energy production',
      price: 199,
      priority: 'high',
      matchReason: 'Directly addresses your energy optimization goal',
    });
    recommendations.push({
      name: 'Thyroid Complete',
      category: 'Hormone Panels',
      description: 'TSH, T3, T4, antibodies, and reverse T3',
      price: 199,
      priority: 'high',
      matchReason: 'Thyroid function is critical for energy levels',
    });
  }

  if (primaryGoal === 'cognitive') {
    recommendations.push({
      name: 'Neurotransmitter Panel',
      category: 'Brain & Cognitive',
      description: 'Serotonin, dopamine, GABA, and more',
      price: 349,
      priority: 'high',
      matchReason: 'Maps your brain chemistry for cognitive optimization',
    });
    recommendations.push({
      name: 'Brain Health Markers',
      category: 'Brain & Cognitive',
      description: 'BDNF, inflammation, and cognitive biomarkers',
      price: 299,
      priority: 'high',
      matchReason: 'Identifies factors affecting mental clarity',
    });
  }

  if (primaryGoal === 'sleep') {
    recommendations.push({
      name: 'Adrenal Stress Panel',
      category: 'Hormone Panels',
      description: 'Cortisol rhythm and DHEA levels',
      price: 249,
      priority: 'high',
      matchReason: 'Cortisol patterns directly impact sleep quality',
    });
    recommendations.push({
      name: 'Complete Vitamin Panel',
      category: 'Vitamin & Mineral',
      description: 'All essential vitamins including D, B12, folate',
      price: 199,
      priority: 'medium',
      matchReason: 'Vitamin deficiencies often cause sleep issues',
    });
  }

  if (primaryGoal === 'longevity') {
    recommendations.push({
      name: 'Advanced Cardiac Panel',
      category: 'Cardiovascular',
      description: 'CRP, homocysteine, Lp(a), and ApoB',
      price: 299,
      priority: 'high',
      matchReason: 'Key markers for cardiovascular longevity',
    });
    recommendations.push({
      name: 'Genetic Blueprint Panel',
      category: 'Genetic Testing',
      description: 'Comprehensive DNA analysis for health optimization',
      price: 499,
      priority: 'high',
      matchReason: 'Understand your genetic predispositions',
    });
  }

  if (primaryGoal === 'gut') {
    recommendations.push({
      name: 'Complete Microbiome Analysis',
      category: 'Gut Health',
      description: 'Full gut bacteria mapping and diversity',
      price: 449,
      priority: 'high',
      matchReason: 'Comprehensive view of your gut ecosystem',
    });
    recommendations.push({
      name: 'Food Sensitivity Panel',
      category: 'Gut Health',
      description: 'IgG reactions to 150+ foods',
      price: 349,
      priority: 'high',
      matchReason: 'Identify foods causing inflammation',
    });
  }

  if (primaryGoal === 'hormones') {
    recommendations.push({
      name: 'Complete Hormone Panel',
      category: 'Hormone Panels',
      description: 'Full male/female hormone assessment',
      price: 399,
      priority: 'high',
      matchReason: 'Comprehensive hormone optimization baseline',
    });
    recommendations.push({
      name: 'Thyroid Complete',
      category: 'Hormone Panels',
      description: 'TSH, T3, T4, antibodies, and reverse T3',
      price: 199,
      priority: 'high',
      matchReason: 'Thyroid affects all other hormones',
    });
  }

  // Symptom-based additions
  if (symptoms.includes('fatigue') && primaryGoal !== 'energy') {
    recommendations.push({
      name: 'Iron Studies Complete',
      category: 'Vitamin & Mineral',
      description: 'Ferritin, TIBC, iron saturation',
      price: 129,
      priority: 'medium',
      matchReason: 'Iron deficiency is a common cause of fatigue',
    });
  }

  if (symptoms.includes('brain_fog')) {
    recommendations.push({
      name: 'Heavy Metal Toxicity',
      category: 'Brain & Cognitive',
      description: 'Lead, mercury, arsenic, and cadmium levels',
      price: 249,
      priority: 'medium',
      matchReason: 'Heavy metals can cause cognitive issues',
    });
  }

  if (symptoms.includes('digestive') && primaryGoal !== 'gut') {
    recommendations.push({
      name: 'Leaky Gut Assessment',
      category: 'Gut Health',
      description: 'Zonulin and intestinal permeability',
      price: 199,
      priority: 'medium',
      matchReason: 'Addresses your digestive symptoms',
    });
  }

  if (symptoms.includes('weight')) {
    recommendations.push({
      name: 'Insulin Resistance Panel',
      category: 'Metabolic Testing',
      description: 'Fasting insulin, glucose, and HOMA-IR',
      price: 149,
      priority: 'medium',
      matchReason: 'Key for understanding weight management',
    });
  }

  // Lifestyle-based additions
  if (lifestyle === 'high_stress') {
    if (!recommendations.find(r => r.name === 'Adrenal Stress Panel')) {
      recommendations.push({
        name: 'Adrenal Stress Panel',
        category: 'Hormone Panels',
        description: 'Cortisol rhythm and DHEA levels',
        price: 249,
        priority: 'medium',
        matchReason: 'Essential for high-stress lifestyles',
      });
    }
  }

  if (lifestyle === 'athletic') {
    recommendations.push({
      name: 'Athletic Performance DNA',
      category: 'Genetic Testing',
      description: 'Muscle fiber, recovery, and endurance genetics',
      price: 399,
      priority: 'medium',
      matchReason: 'Optimize your training based on genetics',
    });
  }

  // History-based additions
  if (history.includes('family_heart')) {
    if (!recommendations.find(r => r.name === 'Advanced Cardiac Panel')) {
      recommendations.push({
        name: 'Advanced Cardiac Panel',
        category: 'Cardiovascular',
        description: 'CRP, homocysteine, Lp(a), and ApoB',
        price: 299,
        priority: 'high',
        matchReason: 'Critical given your family history',
      });
    }
  }

  if (history.includes('family_diabetes')) {
    if (!recommendations.find(r => r.name === 'Insulin Resistance Panel')) {
      recommendations.push({
        name: 'Insulin Resistance Panel',
        category: 'Metabolic Testing',
        description: 'Fasting insulin, glucose, and HOMA-IR',
        price: 149,
        priority: 'high',
        matchReason: 'Important for diabetes prevention',
      });
    }
  }

  if (history.includes('thyroid')) {
    if (!recommendations.find(r => r.name === 'Thyroid Complete')) {
      recommendations.push({
        name: 'Thyroid Complete',
        category: 'Hormone Panels',
        description: 'TSH, T3, T4, antibodies, and reverse T3',
        price: 199,
        priority: 'high',
        matchReason: 'Monitor your thyroid condition',
      });
    }
  }

  // Sort by priority and remove duplicates
  const uniqueRecs = recommendations.filter(
    (rec, index, self) => index === self.findIndex(r => r.name === rec.name)
  );
  
  return uniqueRecs.sort((a, b) => {
    const priorityOrder = { high: 0, medium: 1, low: 2 };
    return priorityOrder[a.priority] - priorityOrder[b.priority];
  }).slice(0, 6);
};

const BiomarkerQuiz = () => {
  const [isStarted, setIsStarted] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string[]>>({});
  const [showResults, setShowResults] = useState(false);

  const currentQuestion = questions[currentStep];
  const progress = ((currentStep + 1) / questions.length) * 100;

  const handleSelect = (optionId: string) => {
    const questionId = currentQuestion.id;
    
    if (currentQuestion.multiSelect) {
      const current = answers[questionId] || [];
      if (optionId === 'none') {
        setAnswers({ ...answers, [questionId]: ['none'] });
      } else {
        const filtered = current.filter(id => id !== 'none');
        if (filtered.includes(optionId)) {
          setAnswers({ ...answers, [questionId]: filtered.filter(id => id !== optionId) });
        } else {
          setAnswers({ ...answers, [questionId]: [...filtered, optionId] });
        }
      }
    } else {
      setAnswers({ ...answers, [questionId]: [optionId] });
      // Auto-advance for single select
      setTimeout(() => {
        if (currentStep < questions.length - 1) {
          setCurrentStep(currentStep + 1);
        } else {
          setShowResults(true);
        }
      }, 300);
    }
  };

  const handleNext = () => {
    if (currentStep < questions.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      setShowResults(true);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleReset = () => {
    setIsStarted(false);
    setCurrentStep(0);
    setAnswers({});
    setShowResults(false);
  };

  const isOptionSelected = (optionId: string) => {
    return answers[currentQuestion?.id]?.includes(optionId) || false;
  };

  const canProceed = () => {
    const currentAnswers = answers[currentQuestion?.id];
    return currentAnswers && currentAnswers.length > 0;
  };

  const recommendations = showResults ? getRecommendations(answers) : [];

  if (!isStarted) {
    return (
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-2xl mx-auto text-center"
          >
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-secondary/20 to-secondary/5 flex items-center justify-center mx-auto mb-6">
              <Sparkles className="w-8 h-8 text-secondary" />
            </div>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Find Your <span className="text-gradient">Perfect Tests</span>
            </h2>
            <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
              Answer a few questions about your health goals and symptoms, and we'll recommend 
              the most relevant biomarker tests for your unique situation.
            </p>
            <Button variant="hero" size="lg" onClick={() => setIsStarted(true)} className="group">
              Start Quiz
              <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Button>
            <p className="text-xs text-muted-foreground mt-4">Takes about 1 minute</p>
          </motion.div>
        </div>
      </section>
    );
  }

  if (showResults) {
    return (
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-4xl mx-auto"
          >
            <div className="text-center mb-12">
              <Badge variant="outline" className="mb-4 border-secondary/50 text-secondary">
                <Check className="w-3 h-3 mr-1" />
                Personalized Results
              </Badge>
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Your <span className="text-gradient">Recommended Tests</span>
              </h2>
              <p className="text-muted-foreground max-w-xl mx-auto">
                Based on your responses, here are the biomarker tests that will provide 
                the most valuable insights for your health journey.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-4 mb-8">
              {recommendations.map((rec, index) => (
                <motion.div
                  key={rec.name}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className={`h-full glass-card ${rec.priority === 'high' ? 'border-secondary/50' : 'border-border/50'}`}>
                    <CardHeader className="pb-2">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <CardTitle className="text-lg">{rec.name}</CardTitle>
                          <p className="text-xs text-muted-foreground">{rec.category}</p>
                        </div>
                        <Badge 
                          variant={rec.priority === 'high' ? 'default' : 'secondary'}
                          className={rec.priority === 'high' ? 'bg-secondary text-secondary-foreground' : 'bg-secondary/10 text-secondary border-0'}
                        >
                          {rec.priority === 'high' ? 'Top Match' : 'Recommended'}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground mb-3">{rec.description}</p>
                      <div className="flex items-center justify-between">
                        <p className="text-xs text-secondary italic">{rec.matchReason}</p>
                        <span className="text-lg font-bold">${rec.price}</span>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>

            <div className="text-center space-y-4">
              <Button 
                variant="hero" 
                size="lg"
                onClick={() => {
                  const catalogSection = document.getElementById('test-catalog');
                  if (catalogSection) {
                    catalogSection.scrollIntoView({ behavior: 'smooth' });
                  }
                }}
              >
                View Full Test Catalog
                <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
              <div>
                <Button variant="ghost" onClick={handleReset} className="text-muted-foreground">
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Retake Quiz
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 md:py-24">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="max-w-2xl mx-auto">
          <div className="mb-8">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">
                Question {currentStep + 1} of {questions.length}
              </span>
              <Button variant="ghost" size="sm" onClick={handleReset} className="text-muted-foreground">
                <RotateCcw className="w-4 h-4 mr-1" />
                Start Over
              </Button>
            </div>
            <Progress value={progress} className="h-2" />
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="glass-card border-border/50">
                <CardHeader className="text-center pb-4">
                  <CardTitle className="text-2xl">{currentQuestion.question}</CardTitle>
                  <p className="text-muted-foreground">{currentQuestion.subtitle}</p>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-3">
                    {currentQuestion.options.map((option) => {
                      const isSelected = isOptionSelected(option.id);
                      return (
                        <button
                          key={option.id}
                          onClick={() => handleSelect(option.id)}
                          className={`p-4 rounded-xl border-2 text-left transition-all ${
                            isSelected
                              ? 'border-secondary bg-secondary/10'
                              : 'border-border/50 hover:border-secondary/30 bg-background/50'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                              isSelected ? 'bg-secondary/20' : 'bg-muted/50'
                            }`}>
                              <option.icon className={`w-5 h-5 ${isSelected ? 'text-secondary' : 'text-muted-foreground'}`} />
                            </div>
                            <span className={`text-sm font-medium ${isSelected ? 'text-foreground' : 'text-muted-foreground'}`}>
                              {option.label}
                            </span>
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  {currentQuestion.multiSelect && (
                    <div className="flex justify-between mt-6 pt-4 border-t border-border/50">
                      <Button
                        variant="ghost"
                        onClick={handleBack}
                        disabled={currentStep === 0}
                      >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back
                      </Button>
                      <Button
                        variant="hero"
                        onClick={handleNext}
                        disabled={!canProceed()}
                      >
                        {currentStep === questions.length - 1 ? 'See Results' : 'Next'}
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
};

export default BiomarkerQuiz;
