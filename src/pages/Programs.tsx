import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Brain, Sparkles, ArrowRight, Activity, ChevronDown, Smartphone, Utensils, TrendingUp, MessageSquare, FileText, Moon, Zap, Target, Heart, Clock, Shield, Quote, Star, Package, Percent, LayoutGrid } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import TestCatalog from '@/components/TestCatalog';
import JourneyPathway from '@/components/JourneyPathway';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import ProgramComparison from '@/components/ProgramComparison';

// Recovery Bundle tiers combining Sleep + Mental Performance
const recoveryBundleTiers = [
  {
    name: 'Essential Recovery',
    tagline: 'Foundation Bundle',
    description: 'Combine sleep foundations and cognitive essentials at a discounted rate for complete mind-body recovery.',
    monthlyPrice: 249, // $149 + $149 = $298, save $49
    originalPrice: 298,
    icon: Package,
    popular: false,
    sleepTier: 'Foundational',
    mentalTier: 'Cognitive Foundations',
    features: [
      'Full Sleep Foundational program',
      'Full Cognitive Foundations program',
      'Unified progress tracking dashboard',
      'Cross-program insights & correlations',
      'Combined weekly check-ins',
      'Sleep-cognition optimization tips',
      'Email support for both programs',
    ],
    crossBenefits: [
      'See how sleep quality impacts next-day focus',
      'Unified recommendations for sleep + cognition',
    ],
  },
  {
    name: 'Performance Recovery',
    tagline: 'Optimization Bundle',
    description: 'Advanced sleep and mental performance protocols with integrated coaching for peak daily performance.',
    monthlyPrice: 449, // $279 + $279 = $558, save $109
    originalPrice: 558,
    icon: Zap,
    popular: true,
    sleepTier: 'Advanced',
    mentalTier: 'Performance Optimization',
    features: [
      'Full Sleep Advanced program',
      'Full Performance Optimization program',
      'Bi-weekly integrated coaching sessions',
      'Combined HRV & readiness analysis',
      'Circadian-aligned focus protocols',
      'Sleep + nootropic supplement stack',
      'Stress resilience training',
      'Priority support for both programs',
    ],
    crossBenefits: [
      'Optimize deep sleep for memory consolidation',
      'Time peak focus to your circadian rhythm',
      'Combined supplement protocol synergies',
    ],
  },
  {
    name: 'Elite Recovery',
    tagline: 'Total Mastery Bundle',
    description: 'White-glove sleep and cognitive optimization with weekly expert sessions and advanced diagnostics.',
    monthlyPrice: 749, // $449 + $449 = $898, save $149
    originalPrice: 898,
    icon: Shield,
    popular: false,
    sleepTier: 'Elite',
    mentalTier: 'Elite Cognition',
    features: [
      'Full Sleep Elite program',
      'Full Elite Cognition program',
      'Weekly integrated coaching sessions',
      'Advanced sleep + cognitive testing',
      'Personalized recovery architecture',
      'Executive performance protocols',
      'Travel & high-stress optimization',
      'VIP priority scheduling',
      'Exclusive recovery masterclasses',
    ],
    crossBenefits: [
      'Complete sleep-to-performance pipeline',
      'Executive decision fatigue protocols',
      'Burnout prevention with recovery focus',
      'Travel protocols for both programs',
    ],
  },
];

// Testimonials data by program type
const testimonials = {
  wellness: [
    {
      name: 'Michael R.',
      role: 'Tech Executive',
      tier: 'Elevate',
      quote: 'The CGM insights were a game-changer. I discovered my glucose was spiking after my usual breakfast, and the nutrition coaching helped me optimize my morning routine. Energy levels are through the roof now.',
      metric: '40% more energy',
      avatar: 'MR',
    },
    {
      name: 'Sarah K.',
      role: 'Entrepreneur',
      tier: 'Transcend',
      quote: 'Having a dedicated Health Architect who knows my entire health picture is invaluable. My labs improved across the board, and I feel 10 years younger. This is the future of healthcare.',
      metric: 'All markers optimal',
      avatar: 'SK',
    },
    {
      name: 'David L.',
      role: 'Attorney',
      tier: 'Ignite',
      quote: 'I was skeptical at first, but after 90 days my cholesterol dropped significantly and I lost 15 pounds without feeling like I was on a diet. The personalized protocol made all the difference.',
      metric: '15 lbs lost',
      avatar: 'DL',
    },
  ],
  sleep: [
    {
      name: 'Jennifer M.',
      role: 'Healthcare Professional',
      tier: 'Advanced',
      quote: 'After years of struggling with insomnia, the sleep phenotype analysis revealed I was circadian-shifted. The personalized protocol helped me fall asleep in under 20 minutes for the first time in years.',
      metric: '20 min to sleep',
      avatar: 'JM',
    },
    {
      name: 'Robert T.',
      role: 'Shift Worker',
      tier: 'Elite',
      quote: 'Working nights destroyed my sleep. The Elite program gave me a complete circadian reset protocol. My HRV improved by 30% and I actually feel rested on my days off now.',
      metric: '30% HRV increase',
      avatar: 'RT',
    },
    {
      name: 'Amanda P.',
      role: 'New Parent',
      tier: 'Foundational',
      quote: 'Even with a baby, the sleep hygiene protocols helped me maximize the sleep I could get. My morning energy went from a 3 to a 7. Life-changing during this season.',
      metric: '2x energy levels',
      avatar: 'AP',
    },
  ],
  mental: [
    {
      name: 'Chris H.',
      role: 'Software Engineer',
      tier: 'Performance Optimization',
      quote: 'My focus was scattered before the program. Now I can do 4-hour deep work blocks without distraction. The flow state protocols and supplement stack were exactly what I needed.',
      metric: '4hr focus blocks',
      avatar: 'CH',
    },
    {
      name: 'Lisa W.',
      role: 'Creative Director',
      tier: 'Elite Cognition',
      quote: 'The cognitive assessment pinpointed my stress reactivity patterns. After 8 weeks, my team noticed I was calmer under pressure and my creative output doubled.',
      metric: '2x creative output',
      avatar: 'LW',
    },
    {
      name: 'James B.',
      role: 'Sales Executive',
      tier: 'Cognitive Foundations',
      quote: 'Brain fog was killing my performance in meetings. The foundational protocols cleared the haze within 3 weeks. I feel sharp and present all day now.',
      metric: 'Zero brain fog',
      avatar: 'JB',
    },
  ],
  bundle: [
    {
      name: 'Marcus T.',
      role: 'Startup Founder',
      tier: 'Performance Recovery',
      quote: 'The bundle changed everything. Once my sleep improved, my focus during the day skyrocketed. The integrated coaching helped me see the connection between rest and peak performance.',
      metric: '3x productivity',
      avatar: 'MT',
    },
    {
      name: 'Dr. Emily R.',
      role: 'Surgeon',
      tier: 'Elite Recovery',
      quote: 'Operating with precision requires both restorative sleep and mental sharpness. The Elite bundle optimized both, and my colleagues noticed the difference in my decision-making.',
      metric: 'Peak precision',
      avatar: 'ER',
    },
    {
      name: 'Kevin M.',
      role: 'Investment Banker',
      tier: 'Essential Recovery',
      quote: 'I thought I could outwork my sleep issues. The bundle showed me that fixing sleep first made the mental performance gains actually stick. Wish I started here.',
      metric: '50% less fatigue',
      avatar: 'KM',
    },
  ],
};

type TestimonialType = {
  name: string;
  role: string;
  tier: string;
  quote: string;
  metric: string;
  avatar: string;
};

const membershipTiers = [
  {
    name: 'Ignite',
    tagline: 'Your Personal Health Blueprint',
    description: 'Build your foundation with your dedicated Health Architect, personalized protocols, and measurable progress.',
    monthlyPrice: 179,
    icon: Sparkles,
    popular: false,
    features: [
      'Dedicated Health Architect (your single point of contact)',
      '1x monthly virtual coaching session',
      'Baseline + semi-annual lab testing',
      'Wearable data integration (Oura, Whoop, Apple Watch, Garmin)',
      '90-day personalized VitalityX Protocol',
      'Protocol refresh every 90 days',
      'Personalized supplement protocol',
      'Full on-demand workout & education library',
      'Client portal with health scorecard',
      '10% discount on supplements',
      '5% off additional lab panels',
    ],
  },
  {
    name: 'Elevate',
    tagline: 'Metabolic & Performance Optimization',
    description: 'Accelerate results with deeper optimization, CGM insights, and dedicated performance coaching.',
    monthlyPrice: 339,
    icon: ArrowRight,
    popular: true,
    features: [
      'Everything in Ignite, plus:',
      'Monthly performance coaching consult',
      'Bi-weekly coaching sessions',
      'Priority coaching response times',
      'CGM Sprint Program (2x per year)',
      '14-day continuous glucose monitoring',
      'Nutrition coach debrief + action plan',
      'Monthly virtual personal training session',
      'VO2max-informed programming',
      '15% discount on supplements',
      '10% off additional lab panels',
    ],
  },
  {
    name: 'Transcend',
    tagline: 'Longevity Strategy & Execution',
    description: 'Elite, white-glove health optimization with precision longevity strategy and execution.',
    monthlyPrice: 649,
    icon: Brain,
    popular: false,
    features: [
      'Everything in Elevate, plus:',
      'Weekly coaching sessions',
      'Weekly virtual personal training session',
      'Quarterly lab monitoring (4x per year)',
      'Advanced supplementation protocols',
      'Sleep optimization pathway',
      'Wearable-based sleep diagnostics',
      'Quarterly deep-dive strategy session',
      'VIP priority scheduling',
      'Exclusive member events',
      '20% discount on supplements',
      '15% off additional lab panels',
    ],
  },
];

const sleepProgramTiers = [
  {
    name: 'Foundational',
    tagline: 'Sleep Fundamentals',
    description: 'Build healthy sleep habits with evidence-based protocols and personalized guidance.',
    monthlyPrice: 149,
    icon: Moon,
    popular: false,
    features: [
      'Comprehensive sleep assessment',
      'Sleep phenotype identification',
      'Personalized sleep hygiene protocol',
      'Weekly Coach check-ins',
      'Sleep environment optimization guide',
      'Relaxation technique library',
      'Progress tracking dashboard',
      'Email support',
    ],
  },
  {
    name: 'Advanced',
    tagline: 'Deep Sleep Optimization',
    description: 'Advanced protocols with wearable integration and bi-weekly coaching for transformative results.',
    monthlyPrice: 279,
    icon: Heart,
    popular: true,
    features: [
      'Everything in Foundational, plus:',
      'Bi-weekly 1:1 coaching sessions',
      'Wearable data analysis (Oura, Whoop, Apple)',
      'Circadian rhythm optimization',
      'Sleep supplement protocol',
      'Stress & anxiety management toolkit',
      'CBT-I techniques for insomnia',
      'Priority support response',
    ],
  },
  {
    name: 'Elite',
    tagline: 'Complete Sleep Mastery',
    description: 'White-glove sleep optimization with advanced diagnostics and weekly expert sessions.',
    monthlyPrice: 449,
    icon: Shield,
    popular: false,
    features: [
      'Everything in Advanced, plus:',
      'Weekly 1:1 coaching sessions',
      'At-home sleep study coordination',
      'Advanced HRV & recovery analysis',
      'Personalized chronotype optimization',
      'Travel & jet lag protocols',
      'Sleep disorder screening & referral',
      'VIP priority scheduling',
      'Exclusive sleep masterclasses',
    ],
  },
];

const mentalProgramTiers = [
  {
    name: 'Cognitive Foundations',
    tagline: 'Mental Clarity Essentials',
    description: 'Build cognitive resilience with foundational protocols for focus, memory, and mental clarity.',
    monthlyPrice: 149,
    icon: Target,
    popular: false,
    features: [
      'Comprehensive cognitive assessment',
      'Mental performance phenotype analysis',
      'Focus optimization protocols',
      'Weekly progress tracking',
      'Mindfulness technique library',
      'Cognitive exercise program',
      'Nutrition for brain health guide',
      'Email support',
    ],
  },
  {
    name: 'Performance Optimization',
    tagline: 'Peak Mental Performance',
    description: 'Advanced protocols with coaching to unlock sustained focus, creativity, and mental energy.',
    monthlyPrice: 279,
    icon: Zap,
    popular: true,
    features: [
      'Everything in Cognitive Foundations, plus:',
      'Bi-weekly 1:1 coaching sessions',
      'HRV-based readiness tracking',
      'Nootropic supplement protocol',
      'Stress resilience training',
      'Flow state optimization',
      'Work environment design consultation',
      'Priority support response',
    ],
  },
  {
    name: 'Elite Cognition',
    tagline: 'Executive-Level Performance',
    description: 'Elite cognitive enhancement with comprehensive diagnostics and weekly expert guidance.',
    monthlyPrice: 449,
    icon: Brain,
    popular: false,
    features: [
      'Everything in Performance Optimization, plus:',
      'Weekly 1:1 coaching sessions',
      'Advanced cognitive testing',
      'Personalized peak performance windows',
      'Executive function optimization',
      'Burnout prevention protocols',
      'High-performance sleep integration',
      'VIP priority scheduling',
      'Exclusive performance workshops',
    ],
  },
];

const CGMProtocolInfo = () => {
  const [isExpanded, setIsExpanded] = useState(false);

  const cgmSteps = [
    { icon: Smartphone, title: 'Device Shipped', desc: 'CGM sensor shipped directly to your door with easy setup guide' },
    { icon: Activity, title: 'Days 1-14', desc: 'Wear sensor continuously while logging meals, sleep, and activities' },
    { icon: Utensils, title: 'Real-Time Insights', desc: 'See how foods, stress, and exercise impact your glucose in real-time' },
    { icon: TrendingUp, title: 'Data Analysis', desc: 'Your Health Architect analyzes patterns and glucose variability' },
    { icon: MessageSquare, title: 'Coach Debrief', desc: 'Nutrition coach session with personalized metabolic action plan' },
  ];

  return (
    <div className="mt-4 border-t border-secondary/20 pt-4">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center gap-2 text-secondary text-sm font-medium hover:text-secondary/80 transition-colors w-full justify-center"
      >
        <Activity className="w-4 h-4" />
        CGM Protocol Details
        <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} />
      </button>
      
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="mt-4 bg-secondary/5 rounded-xl p-4 space-y-3">
              <h4 className="text-sm font-semibold text-foreground text-center">
                14-Day CGM Sprint (2x/year)
              </h4>
              <p className="text-xs text-muted-foreground text-center mb-4">
                Unlock your metabolic fingerprint with continuous glucose monitoring
              </p>
              
              <div className="space-y-3">
                {cgmSteps.map((step, idx) => (
                  <div key={idx} className="flex items-start gap-3">
                    <div className="w-7 h-7 rounded-lg bg-secondary/10 flex items-center justify-center flex-shrink-0">
                      <step.icon className="w-3.5 h-3.5 text-secondary" />
                    </div>
                    <div>
                      <p className="text-xs font-medium text-foreground">{step.title}</p>
                      <p className="text-xs text-muted-foreground">{step.desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-4 pt-3 border-t border-secondary/10 space-y-3">
                <p className="text-xs text-muted-foreground text-center">
                  <span className="text-secondary font-medium">What you receive:</span> CGM sensor kit, mobile app access, meal logging templates, 
                  personalized glucose report, and 1:1 nutrition coach session
                </p>
                <Link to="/cgm-intake" className="flex items-center justify-center gap-2 text-xs text-secondary hover:text-secondary/80 font-medium transition-colors">
                  <FileText className="w-3.5 h-3.5" />
                  Download CGM Intake Form
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

interface ProgramTier {
  name: string;
  tagline: string;
  description: string;
  monthlyPrice: number;
  icon: React.ComponentType<{ className?: string }>;
  popular: boolean;
  features: string[];
}

const ProgramSection = ({ 
  tiers, 
  showCGM = false,
  cgmTierName = ''
}: { 
  tiers: ProgramTier[];
  showCGM?: boolean;
  cgmTierName?: string;
}) => {
  const [isAnnual, setIsAnnual] = useState(false);

  const getAnnualTotal = (monthlyPrice: number) => {
    return Math.round(monthlyPrice * 12 * 0.85);
  };

  return (
    <div className="py-12">
      {/* Billing Toggle */}
      <div className="flex items-center justify-center gap-4 mb-12">
        <span className={`font-medium transition-colors ${!isAnnual ? 'text-foreground' : 'text-muted-foreground'}`}>
          Monthly
        </span>
        <button
          onClick={() => setIsAnnual(!isAnnual)}
          className={`relative w-16 h-8 rounded-full transition-colors duration-300 ${
            isAnnual ? 'bg-secondary' : 'bg-muted'
          }`}
        >
          <span
            className={`absolute top-1 w-6 h-6 rounded-full bg-background shadow-md transition-transform duration-300 ${
              isAnnual ? 'translate-x-9' : 'translate-x-1'
            }`}
          />
        </button>
        <span className={`font-medium transition-colors ${isAnnual ? 'text-foreground' : 'text-muted-foreground'}`}>
          Annual
        </span>
        {isAnnual && (
          <span className="bg-secondary/20 text-secondary px-3 py-1 rounded-full text-sm font-semibold">
            Save 15%
          </span>
        )}
      </div>

      <div className="grid lg:grid-cols-3 gap-8 max-w-6xl mx-auto items-stretch">
        {tiers.map((tier, index) => (
          <motion.div
            key={tier.name}
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.15 }}
            className={`relative rounded-2xl p-8 transition-all duration-300 flex flex-col ${
              tier.popular
                ? 'bg-gradient-to-b from-secondary/20 to-primary/10 border-2 border-secondary shadow-glow'
                : 'glass-card border-border/50 hover:border-secondary/30'
            }`}
          >
            {tier.popular && (
              <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                <span className="bg-secondary text-secondary-foreground px-4 py-1.5 rounded-full text-sm font-semibold">
                  Most Popular
                </span>
              </div>
            )}

            <div className="text-center mb-6">
              <div className="w-16 h-16 rounded-2xl bg-secondary/10 flex items-center justify-center mx-auto mb-4">
                <tier.icon className="w-8 h-8 text-secondary" />
              </div>
              <h3 className="text-2xl md:text-3xl font-bold mb-1 min-h-[36px] flex items-center justify-center">{tier.name}</h3>
              <p className="text-secondary text-sm font-medium mb-2 min-h-[20px]">{tier.tagline}</p>
              <p className="text-muted-foreground text-sm min-h-[60px]">{tier.description}</p>
            </div>

            <div className="text-center mb-8 min-h-[88px]">
              {isAnnual ? (
                <>
                  <div>
                    <span className="text-5xl font-bold text-foreground">${getAnnualTotal(tier.monthlyPrice).toLocaleString()}</span>
                    <span className="text-muted-foreground">/year</span>
                  </div>
                  <p className="text-muted-foreground text-sm mt-1 line-through">${(tier.monthlyPrice * 12).toLocaleString()}/year</p>
                  <p className="text-secondary text-sm font-medium">Save ${((tier.monthlyPrice * 12) - getAnnualTotal(tier.monthlyPrice)).toLocaleString()}</p>
                </>
              ) : (
                <div>
                  <span className="text-5xl font-bold text-foreground">${tier.monthlyPrice}</span>
                  <span className="text-muted-foreground">/month</span>
                </div>
              )}
            </div>

            <ul className="space-y-3 mb-8 flex-grow">
              {tier.features.map((feature) => (
                <li key={feature} className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-secondary flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-foreground">{feature}</span>
                </li>
              ))}
            </ul>

            {showCGM && tier.name === cgmTierName && <CGMProtocolInfo />}

            <Button
              variant={tier.popular ? 'hero' : 'heroOutline'}
              className="w-full mt-auto"
              size="lg"
            >
              Start Your Journey
            </Button>
          </motion.div>
        ))}
      </div>

      {/* Trust note */}
      <motion.p
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        className="text-center text-muted-foreground text-sm mt-12"
      >
        All programs include access to our client portal with detailed reports and personalized action plans. 
        Cancel anytime with no hidden fees.
      </motion.p>
    </div>
  );
};

interface BundleTier {
  name: string;
  tagline: string;
  description: string;
  monthlyPrice: number;
  originalPrice: number;
  icon: React.ComponentType<{ className?: string }>;
  popular: boolean;
  sleepTier: string;
  mentalTier: string;
  features: string[];
  crossBenefits: string[];
}

const BundleSection = ({ tiers }: { tiers: BundleTier[] }) => {
  const [isAnnual, setIsAnnual] = useState(false);

  const getAnnualTotal = (monthlyPrice: number) => {
    return Math.round(monthlyPrice * 12 * 0.85);
  };

  const getAnnualOriginal = (originalPrice: number) => {
    return Math.round(originalPrice * 12 * 0.85);
  };

  return (
    <div className="py-12">
      {/* Bundle value proposition */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-center mb-8 max-w-3xl mx-auto"
      >
        <div className="inline-flex items-center gap-2 bg-secondary/10 text-secondary px-4 py-2 rounded-full text-sm font-semibold mb-4">
          <Percent className="w-4 h-4" />
          Bundle & Save up to 17%
        </div>
        <p className="text-muted-foreground">
          Sleep and mental performance are deeply connected. When you optimize both together, 
          you unlock synergies that accelerate your results.
        </p>
      </motion.div>

      {/* Billing Toggle */}
      <div className="flex items-center justify-center gap-4 mb-12">
        <span className={`font-medium transition-colors ${!isAnnual ? 'text-foreground' : 'text-muted-foreground'}`}>
          Monthly
        </span>
        <button
          onClick={() => setIsAnnual(!isAnnual)}
          className={`relative w-16 h-8 rounded-full transition-colors duration-300 ${
            isAnnual ? 'bg-secondary' : 'bg-muted'
          }`}
        >
          <span
            className={`absolute top-1 w-6 h-6 rounded-full bg-background shadow-md transition-transform duration-300 ${
              isAnnual ? 'translate-x-9' : 'translate-x-1'
            }`}
          />
        </button>
        <span className={`font-medium transition-colors ${isAnnual ? 'text-foreground' : 'text-muted-foreground'}`}>
          Annual
        </span>
        {isAnnual && (
          <span className="bg-secondary/20 text-secondary px-3 py-1 rounded-full text-sm font-semibold">
            Save 15% more
          </span>
        )}
      </div>

      <div className="grid lg:grid-cols-3 gap-8 max-w-6xl mx-auto items-stretch">
        {tiers.map((tier, index) => (
          <motion.div
            key={tier.name}
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.15 }}
            className={`relative rounded-2xl p-8 transition-all duration-300 flex flex-col ${
              tier.popular
                ? 'bg-gradient-to-b from-secondary/20 to-primary/10 border-2 border-secondary shadow-glow'
                : 'glass-card border-border/50 hover:border-secondary/30'
            }`}
          >
            {tier.popular && (
              <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                <span className="bg-secondary text-secondary-foreground px-4 py-1.5 rounded-full text-sm font-semibold">
                  Best Value
                </span>
              </div>
            )}

            <div className="text-center mb-6">
              <div className="w-16 h-16 rounded-2xl bg-secondary/10 flex items-center justify-center mx-auto mb-4">
                <tier.icon className="w-8 h-8 text-secondary" />
              </div>
              <h3 className="text-2xl md:text-3xl font-bold mb-1 min-h-[36px] flex items-center justify-center">{tier.name}</h3>
              <p className="text-secondary text-sm font-medium mb-2 min-h-[20px]">{tier.tagline}</p>
              <p className="text-muted-foreground text-sm min-h-[60px]">{tier.description}</p>
            </div>

            {/* Pricing with savings */}
            <div className="text-center mb-6 min-h-[100px]">
              {isAnnual ? (
                <>
                  <div>
                    <span className="text-5xl font-bold text-foreground">${getAnnualTotal(tier.monthlyPrice).toLocaleString()}</span>
                    <span className="text-muted-foreground">/year</span>
                  </div>
                  <p className="text-muted-foreground text-sm mt-1 line-through">
                    ${getAnnualOriginal(tier.originalPrice).toLocaleString()}/year if purchased separately
                  </p>
                  <p className="text-secondary text-sm font-semibold">
                    Total savings: ${(getAnnualOriginal(tier.originalPrice) - getAnnualTotal(tier.monthlyPrice)).toLocaleString()}/year
                  </p>
                </>
              ) : (
                <>
                  <div>
                    <span className="text-5xl font-bold text-foreground">${tier.monthlyPrice}</span>
                    <span className="text-muted-foreground">/month</span>
                  </div>
                  <p className="text-muted-foreground text-sm mt-1 line-through">
                    ${tier.originalPrice}/mo if purchased separately
                  </p>
                  <p className="text-secondary text-sm font-semibold">
                    Save ${tier.originalPrice - tier.monthlyPrice}/month
                  </p>
                </>
              )}
            </div>

            {/* Included programs */}
            <div className="bg-muted/30 rounded-xl p-4 mb-6">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Includes:</p>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <Moon className="w-4 h-4 text-secondary" />
                  <span>Sleep {tier.sleepTier}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Brain className="w-4 h-4 text-secondary" />
                  <span>Mental {tier.mentalTier}</span>
                </div>
              </div>
            </div>

            <ul className="space-y-3 mb-6 flex-grow">
              {tier.features.map((feature) => (
                <li key={feature} className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-secondary flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-foreground">{feature}</span>
                </li>
              ))}
            </ul>

            {/* Cross-program benefits */}
            <div className="border-t border-border/30 pt-4 mb-6">
              <p className="text-xs font-semibold text-secondary uppercase tracking-wider mb-3 flex items-center gap-2">
                <Zap className="w-3.5 h-3.5" />
                Cross-Program Synergies
              </p>
              <ul className="space-y-2">
                {tier.crossBenefits.map((benefit) => (
                  <li key={benefit} className="flex items-start gap-2 text-xs text-muted-foreground">
                    <ArrowRight className="w-3.5 h-3.5 text-secondary flex-shrink-0 mt-0.5" />
                    <span>{benefit}</span>
                  </li>
                ))}
              </ul>
            </div>

            <Button
              variant={tier.popular ? 'hero' : 'heroOutline'}
              className="w-full mt-auto"
              size="lg"
            >
              Get the Bundle
            </Button>
          </motion.div>
        ))}
      </div>

      {/* Trust note */}
      <motion.p
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        className="text-center text-muted-foreground text-sm mt-12"
      >
        Bundle programs include unified coaching, integrated tracking, and cross-program insights. 
        Cancel anytime with no hidden fees.
      </motion.p>
    </div>
  );
};

const TestimonialsSection = ({ testimonials }: { testimonials: TestimonialType[] }) => {
  return (
    <div className="mt-20 pt-16 border-t border-border/30">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-center mb-12"
      >
        <h3 className="text-2xl md:text-3xl font-bold mb-3">
          Real Results from <span className="text-gradient">Real Members</span>
        </h3>
        <p className="text-muted-foreground max-w-xl mx-auto">
          Hear from people who have transformed their health with our programs.
        </p>
      </motion.div>

      <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
        {testimonials.map((testimonial, index) => (
          <motion.div
            key={testimonial.name}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.1 }}
            className="relative glass-card rounded-2xl p-6 border border-border/50 hover:border-secondary/30 transition-all duration-300 group"
          >
            {/* Quote icon */}
            <div className="absolute -top-3 -left-3 w-10 h-10 rounded-full bg-secondary/10 flex items-center justify-center">
              <Quote className="w-5 h-5 text-secondary" />
            </div>

            {/* Stars */}
            <div className="flex gap-1 mb-4 pt-2">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-4 h-4 fill-secondary text-secondary" />
              ))}
            </div>

            {/* Quote text */}
            <p className="text-foreground/90 text-sm leading-relaxed mb-6">
              "{testimonial.quote}"
            </p>

            {/* Metric badge */}
            <div className="mb-6">
              <span className="inline-flex items-center gap-2 bg-secondary/10 text-secondary px-3 py-1.5 rounded-full text-xs font-semibold">
                <TrendingUp className="w-3.5 h-3.5" />
                {testimonial.metric}
              </span>
            </div>

            {/* Author */}
            <div className="flex items-center gap-3 pt-4 border-t border-border/30">
              <Avatar className="w-10 h-10 bg-gradient-to-br from-secondary/20 to-primary/20">
                <AvatarFallback className="bg-gradient-to-br from-secondary/20 to-primary/20 text-foreground font-semibold text-sm">
                  {testimonial.avatar}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-semibold text-foreground text-sm">{testimonial.name}</p>
                <p className="text-muted-foreground text-xs">{testimonial.role} • {testimonial.tier}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

const Programs = () => {
  const [activeTab, setActiveTab] = useState('wellness');

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <>
      <Helmet>
        <title>Health Optimization Programs | VitalityX Health</title>
        <meta
          name="description"
          content="Discover personalized health optimization programs. From genetic testing to comprehensive wellness, sleep, and mental performance memberships."
        />
        <link rel="canonical" href="https://vitalityxhealth.com/programs" />
      </Helmet>

      <main className="min-h-screen">
        <Navbar />

        {/* Hero */}
        <section className="pt-32 pb-16 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-primary/10 via-transparent to-transparent" />
          <div className="container mx-auto px-4 lg:px-8 relative">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-center max-w-3xl mx-auto"
            >
              <span className="text-secondary font-semibold tracking-widest text-sm uppercase mb-4 block">
                Investment in You
              </span>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
                Your Health,{' '}
                <span className="text-gradient">Your Terms</span>
              </h1>
              <p className="text-muted-foreground text-lg md:text-xl leading-relaxed">
                Whether you want to start with a single test or commit to complete transformation, 
                we have a path designed for your goals.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Journey Pathway - Step 1 & 2 */}
        <JourneyPathway />

        {/* A La Carte Test Catalog */}
        <TestCatalog />

        {/* Program Tabs */}
        <section className="py-24 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/5 to-transparent" />
          <div className="container mx-auto px-4 lg:px-8 relative">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Commit to <span className="text-gradient">Transformation</span>
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto mb-8">
                Choose your focus area and let our expert coaches guide you to lasting results. 
                All programs include detailed reports with personalized action plans.
              </p>
            </motion.div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="flex flex-wrap justify-center gap-2 w-full max-w-5xl mx-auto mb-8 bg-muted/50 p-2 rounded-xl sm:grid sm:grid-cols-5">
                <TabsTrigger 
                  value="wellness" 
                  className="flex items-center gap-2 data-[state=active]:bg-background data-[state=active]:shadow-md rounded-lg py-3 px-4 text-sm"
                >
                  <Sparkles className="w-4 h-4 flex-shrink-0" />
                  <span className="hidden md:inline">Wellness</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="sleep"
                  className="flex items-center gap-2 data-[state=active]:bg-background data-[state=active]:shadow-md rounded-lg py-3 px-4 text-sm"
                >
                  <Moon className="w-4 h-4 flex-shrink-0" />
                  <span className="hidden md:inline">Sleep</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="mental"
                  className="flex items-center gap-2 data-[state=active]:bg-background data-[state=active]:shadow-md rounded-lg py-3 px-4 text-sm whitespace-nowrap"
                >
                  <Brain className="w-4 h-4 flex-shrink-0" />
                  <span className="hidden md:inline">Mental Performance</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="bundle"
                  className="flex items-center gap-2 data-[state=active]:bg-background data-[state=active]:shadow-md rounded-lg py-3 px-4 relative text-sm"
                >
                  <Package className="w-4 h-4 flex-shrink-0" />
                  <span className="hidden md:inline">Bundle</span>
                  <span className="absolute -top-2 -right-1 bg-secondary text-secondary-foreground text-[10px] px-1.5 py-0.5 rounded-full font-semibold">
                    Save
                  </span>
                </TabsTrigger>
                <TabsTrigger 
                  value="compare"
                  className="flex items-center gap-2 data-[state=active]:bg-background data-[state=active]:shadow-md rounded-lg py-3 px-4 text-sm"
                >
                  <LayoutGrid className="w-4 h-4 flex-shrink-0" />
                  <span className="hidden md:inline">Compare All</span>
                </TabsTrigger>
              </TabsList>

              {/* Program Descriptions */}
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="text-center mb-8"
              >
                {activeTab === 'wellness' && (
                  <div className="max-w-2xl mx-auto">
                    <h3 className="text-2xl font-bold mb-3 flex items-center justify-center gap-3">
                      <Sparkles className="w-6 h-6 text-secondary" />
                      Health & Wellness Optimization
                    </h3>
                    <p className="text-muted-foreground">
                      Comprehensive health optimization with lab testing, wearable integration, 
                      and dedicated coaching to transform your overall wellbeing.
                    </p>
                  </div>
                )}
                {activeTab === 'sleep' && (
                  <div className="max-w-2xl mx-auto">
                    <h3 className="text-2xl font-bold mb-3 flex items-center justify-center gap-3">
                      <Moon className="w-6 h-6 text-secondary" />
                      Sleep Performance Program
                    </h3>
                    <p className="text-muted-foreground">
                      Evidence-based sleep optimization using phenotype analysis, circadian rhythm 
                      protocols, and personalized interventions to restore restorative sleep.
                    </p>
                  </div>
                )}
                {activeTab === 'mental' && (
                  <div className="max-w-2xl mx-auto">
                    <h3 className="text-2xl font-bold mb-3 flex items-center justify-center gap-3">
                      <Brain className="w-6 h-6 text-secondary" />
                      Mental Performance Program
                    </h3>
                    <p className="text-muted-foreground">
                      Unlock peak cognitive performance with focus optimization, stress resilience 
                      training, and personalized protocols for sustained mental clarity.
                    </p>
                  </div>
                )}
                {activeTab === 'bundle' && (
                  <div className="max-w-2xl mx-auto">
                    <h3 className="text-2xl font-bold mb-3 flex items-center justify-center gap-3">
                      <Package className="w-6 h-6 text-secondary" />
                      Recovery Bundle
                      <span className="bg-secondary/20 text-secondary text-sm px-3 py-1 rounded-full font-semibold">
                        Save up to $149/mo
                      </span>
                    </h3>
                    <p className="text-muted-foreground">
                      Combine Sleep + Mental Performance programs at a discounted rate. 
                      Optimize your rest and cognition together for complete recovery.
                    </p>
                  </div>
                )}
                {activeTab === 'compare' && (
                  <div className="max-w-2xl mx-auto">
                    <h3 className="text-2xl font-bold mb-3 flex items-center justify-center gap-3">
                      <LayoutGrid className="w-6 h-6 text-secondary" />
                      Compare All Programs
                    </h3>
                    <p className="text-muted-foreground">
                      View all membership tiers side-by-side to find the perfect fit 
                      for your health optimization goals.
                    </p>
                  </div>
                )}
              </motion.div>

              <TabsContent value="wellness" className="mt-0">
                <ProgramSection tiers={membershipTiers} showCGM cgmTierName="Elevate" />
                <TestimonialsSection testimonials={testimonials.wellness} />
              </TabsContent>

              <TabsContent value="sleep" className="mt-0">
                <ProgramSection tiers={sleepProgramTiers} />
                <TestimonialsSection testimonials={testimonials.sleep} />
              </TabsContent>

              <TabsContent value="mental" className="mt-0">
                <ProgramSection tiers={mentalProgramTiers} />
                <TestimonialsSection testimonials={testimonials.mental} />
              </TabsContent>

              <TabsContent value="bundle" className="mt-0">
                <BundleSection tiers={recoveryBundleTiers} />
                <TestimonialsSection testimonials={testimonials.bundle} />
              </TabsContent>

              <TabsContent value="compare" className="mt-0">
                <ProgramComparison />
              </TabsContent>
            </Tabs>
          </div>
        </section>

        <Footer />
      </main>
    </>
  );
};

export default Programs;
