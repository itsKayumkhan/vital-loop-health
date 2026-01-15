import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import {
  Dna,
  FlaskConical,
  Activity,
  Brain,
  Heart,
  Leaf,
  Droplets,
  Zap,
  Microscope,
  Target,
  TrendingUp,
  Shield,
  Sparkles,
  ArrowRight,
  Check,
  LineChart,
  Users,
  Clock,
  Award,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

// Educational content about biomarkers
const biomarkerEducation = [
  {
    icon: Target,
    title: 'What Are Biomarkers?',
    description:
      'Biomarkers are measurable indicators of your biological state—from hormones and vitamins to genetic variants and metabolic markers. They reveal what is happening inside your body at a cellular level.',
  },
  {
    icon: TrendingUp,
    title: 'Why They Matter',
    description:
      'Unlike symptoms that appear after damage occurs, biomarkers detect imbalances early. This allows for proactive interventions that prevent disease rather than just treating it.',
  },
  {
    icon: Shield,
    title: 'Personalized Health',
    description:
      'Your biomarkers are unique. Generic health advice fails because it ignores individual variation. Testing reveals YOUR specific needs for optimal function.',
  },
  {
    icon: Sparkles,
    title: 'Actionable Insights',
    description:
      'Every test comes with personalized recommendations. Know exactly which supplements, lifestyle changes, or interventions will have the biggest impact for you.',
  },
];

// Biomarker categories with insights
const biomarkerCategories = [
  {
    id: 'metabolic',
    name: 'Metabolic Health',
    icon: Zap,
    color: 'from-amber-500/20 to-orange-500/20',
    borderColor: 'border-amber-500/30',
    iconColor: 'text-amber-400',
    reveals: [
      'Blood sugar regulation efficiency',
      'Insulin sensitivity and resistance',
      'Fat burning vs storage tendency',
      'Energy production at cellular level',
      'Risk for metabolic syndrome',
    ],
    keyMarkers: ['HbA1c', 'Fasting Insulin', 'HOMA-IR', 'Triglycerides', 'Adiponectin'],
  },
  {
    id: 'hormones',
    name: 'Hormonal Balance',
    icon: Activity,
    color: 'from-purple-500/20 to-pink-500/20',
    borderColor: 'border-purple-500/30',
    iconColor: 'text-purple-400',
    reveals: [
      'Thyroid function and metabolism',
      'Stress hormone patterns',
      'Sex hormone optimization',
      'Sleep quality drivers',
      'Mood and energy regulation',
    ],
    keyMarkers: ['Cortisol Rhythm', 'Free T3/T4', 'Testosterone', 'Estradiol', 'DHEA-S'],
  },
  {
    id: 'inflammation',
    name: 'Inflammation & Immunity',
    icon: Shield,
    color: 'from-red-500/20 to-rose-500/20',
    borderColor: 'border-red-500/30',
    iconColor: 'text-red-400',
    reveals: [
      'Chronic inflammation levels',
      'Immune system activation',
      'Autoimmune risk factors',
      'Gut-immune connection',
      'Recovery capacity',
    ],
    keyMarkers: ['hs-CRP', 'Homocysteine', 'IL-6', 'TNF-alpha', 'Zonulin'],
  },
  {
    id: 'cardiovascular',
    name: 'Heart & Vascular',
    icon: Heart,
    color: 'from-rose-500/20 to-red-500/20',
    borderColor: 'border-rose-500/30',
    iconColor: 'text-rose-400',
    reveals: [
      'True cardiovascular risk',
      'Arterial health status',
      'Cholesterol particle size',
      'Blood vessel flexibility',
      'Clotting tendencies',
    ],
    keyMarkers: ['ApoB', 'Lp(a)', 'LDL Particle Count', 'Fibrinogen', 'Omega-3 Index'],
  },
  {
    id: 'cognitive',
    name: 'Brain & Cognition',
    icon: Brain,
    color: 'from-blue-500/20 to-cyan-500/20',
    borderColor: 'border-blue-500/30',
    iconColor: 'text-blue-400',
    reveals: [
      'Neurotransmitter balance',
      'Brain inflammation markers',
      'Cognitive decline risk',
      'Memory optimization potential',
      'Focus and attention drivers',
    ],
    keyMarkers: ['BDNF', 'Homocysteine', 'B12/Folate', 'Omega-3 DHA', 'Heavy Metals'],
  },
  {
    id: 'gut',
    name: 'Gut & Microbiome',
    icon: Leaf,
    color: 'from-green-500/20 to-emerald-500/20',
    borderColor: 'border-green-500/30',
    iconColor: 'text-green-400',
    reveals: [
      'Microbiome diversity',
      'Leaky gut indicators',
      'Food sensitivities',
      'Digestive enzyme function',
      'Pathogen presence',
    ],
    keyMarkers: ['Zonulin', 'Calprotectin', 'Secretory IgA', 'SIBO Gases', 'Diversity Score'],
  },
];


// Individual test categories
const testCategories = [
  {
    id: 'genetic',
    name: 'Genetic Testing',
    icon: Dna,
    tests: [
      { name: 'Genetic Blueprint Panel', description: 'Comprehensive DNA analysis for health optimization', price: 499 },
      { name: 'Methylation Genetics', description: 'MTHFR and methylation pathway analysis', price: 299 },
      { name: 'Detoxification Genes', description: 'Liver detox pathway genetic variants', price: 249 },
      { name: 'Nutrigenomics Panel', description: 'How your genes respond to nutrients', price: 349 },
      { name: 'Athletic Performance DNA', description: 'Muscle fiber, recovery, and endurance genetics', price: 399 },
    ],
  },
  {
    id: 'precision-labs',
    name: 'Precision Labs',
    icon: Microscope,
    tests: [
      { name: 'Complete Precision Panel', description: 'Comprehensive analysis combining all precision lab markers for total health insight', price: 899 },
      { name: 'Core Metabolic & Energy', description: 'Foundational markers for metabolic health and cellular energy production', price: 199 },
      { name: 'Inflammation & Immunity', description: 'Key inflammatory and immune system biomarkers', price: 179 },
      { name: 'Micronutrient & Mineral', description: 'Essential vitamins and minerals for optimal function', price: 189 },
      { name: 'Thyroid Signal', description: 'Complete thyroid function and signaling assessment', price: 169 },
      { name: 'Lipids & Cardiovascular Baseline', description: 'Advanced lipid analysis and heart health markers', price: 199 },
      { name: 'Hormonal Signal', description: 'Key hormone levels and endocrine function markers', price: 219 },
    ],
  },
  {
    id: 'hormone',
    name: 'Hormone Panels',
    icon: Activity,
    tests: [
      { name: 'Complete Hormone Panel', description: 'Full male/female hormone assessment', price: 399 },
      { name: 'Thyroid Complete', description: 'TSH, T3, T4, antibodies, and reverse T3', price: 199 },
      { name: 'Adrenal Stress Panel', description: 'Cortisol rhythm and DHEA levels', price: 249 },
      { name: 'Testosterone Optimization', description: 'Free, total, and bioavailable testosterone', price: 179 },
      { name: 'Female Hormone Cycle', description: 'Estrogen, progesterone, and cycle mapping', price: 279 },
    ],
  },
  {
    id: 'metabolic',
    name: 'Metabolic Testing',
    icon: Zap,
    tests: [
      { name: 'Advanced Lipid Panel', description: 'Beyond basic cholesterol—particle size and more', price: 199 },
      { name: 'Insulin Resistance Panel', description: 'Fasting insulin, glucose, and HOMA-IR', price: 149 },
      { name: 'Metabolic Syndrome Screen', description: 'Complete metabolic health assessment', price: 249 },
      { name: 'Organic Acids Test', description: 'Cellular energy and mitochondrial function', price: 349 },
    ],
  },
  {
    id: 'gut',
    name: 'Gut Health',
    icon: Leaf,
    tests: [
      { name: 'Complete Microbiome Analysis', description: 'Full gut bacteria mapping and diversity', price: 449 },
      { name: 'Food Sensitivity Panel', description: 'IgG reactions to 150+ foods', price: 349 },
      { name: 'Leaky Gut Assessment', description: 'Zonulin and intestinal permeability', price: 199 },
      { name: 'SIBO Breath Test', description: 'Small intestinal bacterial overgrowth', price: 249 },
      { name: 'Digestive Function Panel', description: 'Enzymes, absorption, and inflammation markers', price: 299 },
    ],
  },
  {
    id: 'vitamin',
    name: 'Vitamin & Mineral',
    icon: Droplets,
    tests: [
      { name: 'Complete Vitamin Panel', description: 'All essential vitamins including D, B12, folate', price: 199 },
      { name: 'Mineral & Electrolyte Panel', description: 'Magnesium, zinc, copper, selenium, and more', price: 179 },
      { name: 'Iron Studies Complete', description: 'Ferritin, TIBC, iron saturation', price: 129 },
      { name: 'Omega Fatty Acid Test', description: 'Omega-3/6 ratio and inflammation index', price: 149 },
      { name: 'Antioxidant Status', description: 'Glutathione, CoQ10, and vitamin E levels', price: 199 },
    ],
  },
  {
    id: 'cardiovascular',
    name: 'Cardiovascular',
    icon: Heart,
    tests: [
      { name: 'Advanced Cardiac Panel', description: 'CRP, homocysteine, Lp(a), and ApoB', price: 299 },
      { name: 'Inflammation Markers', description: 'hs-CRP, fibrinogen, and cytokines', price: 199 },
      { name: 'Vascular Health Screen', description: 'Endothelial function and arterial health', price: 349 },
    ],
  },
  {
    id: 'brain',
    name: 'Brain & Cognitive',
    icon: Brain,
    tests: [
      { name: 'Neurotransmitter Panel', description: 'Serotonin, dopamine, GABA, and more', price: 349 },
      { name: 'Brain Health Markers', description: 'BDNF, inflammation, and cognitive biomarkers', price: 299 },
      { name: 'Heavy Metal Toxicity', description: 'Lead, mercury, arsenic, and cadmium levels', price: 249 },
    ],
  },
];

// Membership benefits for testing
const membershipBenefits = [
  { icon: LineChart, title: 'Quarterly Testing', description: 'Regular monitoring to track your progress over time' },
  { icon: Users, title: 'Coach Interpretation', description: 'Expert analysis of your results with actionable recommendations' },
  { icon: Clock, title: 'Priority Processing', description: 'Fast-track your samples for quicker results' },
  { icon: Award, title: 'Member Pricing', description: 'Up to 25% off all individual tests and panels' },
];

const Biomarkers = () => {
  return (
    <>
      <Helmet>
        <title>Biomarkers | VitalityX Health</title>
        <meta
          name="description"
          content="Discover what your biomarkers reveal about your health. Comprehensive testing with personalized insights and membership benefits."
        />
      </Helmet>

      <Navbar />

      <main className="pt-20">
        {/* Hero Section */}
        <section className="py-20 md:py-28 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-secondary/5 via-transparent to-transparent" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-secondary/5 rounded-full blur-3xl" />

          <div className="container mx-auto px-4 lg:px-8 relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-center max-w-4xl mx-auto"
            >
              <Badge variant="outline" className="mb-6 border-secondary/50 text-secondary">
                <FlaskConical className="w-3 h-3 mr-1" />
                Precision Health Intelligence
              </Badge>
              <h1 className="text-4xl md:text-6xl font-bold mb-6">
                Decode Your <span className="text-gradient">Biology</span>
              </h1>
              <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
                Your biomarkers hold the answers to your health questions. Uncover hidden imbalances,
                optimize your biology, and take control of your wellness journey with precision testing.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button variant="hero" size="lg" className="group">
                  Explore Testing Options
                  <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Button>
                <Link to="/programs">
                  <Button variant="heroOutline" size="lg">
                    View Membership Benefits
                  </Button>
                </Link>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Educational Section - What Biomarkers Reveal */}
        <section className="py-16 md:py-24">
          <div className="container mx-auto px-4 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                The Power of <span className="text-gradient">Biomarker Testing</span>
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Move beyond guesswork. Understand what's really happening in your body
                and make informed decisions about your health.
              </p>
            </motion.div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {biomarkerEducation.map((item, index) => (
                <motion.div
                  key={item.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="h-full glass-card border-border/50 hover:border-secondary/30 transition-colors">
                    <CardHeader>
                      <div className="w-12 h-12 rounded-xl bg-secondary/10 flex items-center justify-center mb-4">
                        <item.icon className="w-6 h-6 text-secondary" />
                      </div>
                      <CardTitle className="text-lg">{item.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground text-sm">{item.description}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Biomarker Categories - What Each Reveals */}
        <section className="py-16 md:py-24 bg-card/30">
          <div className="container mx-auto px-4 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                What Your <span className="text-gradient">Biomarkers Reveal</span>
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Each category of biomarkers tells a different story about your health.
                Together, they create a complete picture of your biological state.
              </p>
            </motion.div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {biomarkerCategories.map((category, index) => (
                <motion.div
                  key={category.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className={`h-full glass-card ${category.borderColor} hover:border-opacity-60 transition-all group`}>
                    <CardHeader>
                      <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${category.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                        <category.icon className={`w-7 h-7 ${category.iconColor}`} />
                      </div>
                      <CardTitle className="text-xl">{category.name}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <p className="text-sm font-medium text-foreground mb-2">Reveals:</p>
                        <ul className="space-y-1.5">
                          {category.reveals.map((item, i) => (
                            <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                              <Check className="w-4 h-4 text-secondary shrink-0 mt-0.5" />
                              {item}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div className="pt-4 border-t border-border/50">
                        <p className="text-xs font-medium text-muted-foreground mb-2">Key Markers:</p>
                        <div className="flex flex-wrap gap-1.5">
                          {category.keyMarkers.map((marker, i) => (
                            <Badge key={i} variant="secondary" className="text-xs bg-secondary/10 text-secondary border-0">
                              {marker}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>


        {/* Individual Tests Accordion */}
        <section className="py-16 md:py-24 bg-card/30">
          <div className="container mx-auto px-4 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Individual <span className="text-gradient">Test Catalog</span>
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Need specific testing? Browse our complete catalog of individual tests
                and build your own custom panel.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="max-w-4xl mx-auto"
            >
              <Accordion type="multiple" className="space-y-4">
                {testCategories.map((category) => (
                  <AccordionItem
                    key={category.id}
                    value={category.id}
                    className="glass-card rounded-xl border-border/50 px-6 overflow-hidden"
                  >
                    <AccordionTrigger className="hover:no-underline py-5">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-secondary/10 flex items-center justify-center">
                          <category.icon className="w-6 h-6 text-secondary" />
                        </div>
                        <div className="text-left">
                          <h3 className="text-xl font-semibold">{category.name}</h3>
                          <p className="text-sm text-muted-foreground">
                            {category.tests.length} tests available
                          </p>
                        </div>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="pb-6">
                      <div className="space-y-3 pt-2">
                        {category.tests.map((test, index) => (
                          <div
                            key={index}
                            className="flex items-center justify-between p-4 rounded-lg bg-background/50 border border-border/50 hover:border-secondary/30 transition-colors"
                          >
                            <div className="flex-1 pr-4">
                              <h4 className="font-medium text-foreground">{test.name}</h4>
                              <p className="text-sm text-muted-foreground">{test.description}</p>
                            </div>
                            <div className="flex items-center gap-4">
                              <span className="text-xl font-bold text-foreground whitespace-nowrap">
                                ${test.price}
                              </span>
                              <Button variant="heroOutline" size="sm">
                                Order
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </motion.div>
          </div>
        </section>

        {/* Membership Integration CTA */}
        <section className="py-16 md:py-24">
          <div className="container mx-auto px-4 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="max-w-5xl mx-auto"
            >
              <Card className="glass-card border-secondary/30 overflow-hidden relative">
                <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-secondary/10 to-transparent" />
                <CardContent className="p-8 md:p-12">
                  <div className="grid md:grid-cols-2 gap-8 items-center">
                    <div>
                      <Badge variant="outline" className="mb-4 border-secondary/50 text-secondary">
                        Membership Benefits
                      </Badge>
                      <h3 className="text-2xl md:text-3xl font-bold mb-4">
                        Unlock <span className="text-gradient">Member Pricing</span>
                      </h3>
                      <p className="text-muted-foreground mb-6">
                        Join a VitalityX program to receive exclusive discounts on all testing,
                        plus expert interpretation of your results by our health coaches.
                      </p>
                      <div className="grid grid-cols-2 gap-4 mb-8">
                        {membershipBenefits.map((benefit, index) => (
                          <div key={index} className="flex items-start gap-3">
                            <div className="w-8 h-8 rounded-lg bg-secondary/10 flex items-center justify-center shrink-0">
                              <benefit.icon className="w-4 h-4 text-secondary" />
                            </div>
                            <div>
                              <p className="text-sm font-medium">{benefit.title}</p>
                              <p className="text-xs text-muted-foreground">{benefit.description}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                      <Link to="/programs">
                        <Button variant="hero" size="lg" className="group">
                          Explore Programs
                          <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </Button>
                      </Link>
                    </div>
                    <div className="hidden md:flex justify-center">
                      <div className="relative">
                        <div className="w-48 h-48 rounded-full bg-gradient-to-br from-secondary/20 to-secondary/5 flex items-center justify-center">
                          <div className="text-center">
                            <p className="text-5xl font-bold text-secondary">25%</p>
                            <p className="text-sm text-muted-foreground">Max Savings</p>
                          </div>
                        </div>
                        <div className="absolute -top-4 -right-4 w-16 h-16 rounded-full bg-secondary/10 flex items-center justify-center">
                          <Sparkles className="w-6 h-6 text-secondary" />
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </section>

        {/* Process Section */}
        <section className="py-16 md:py-24 bg-card/30">
          <div className="container mx-auto px-4 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                How It <span className="text-gradient">Works</span>
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                From ordering to insights, our streamlined process makes biomarker testing simple.
              </p>
            </motion.div>

            <div className="grid md:grid-cols-4 gap-6 max-w-4xl mx-auto">
              {[
                { step: 1, title: 'Choose Your Tests', desc: 'Select a package or build a custom panel' },
                { step: 2, title: 'Collect Your Sample', desc: 'At-home kit or visit a local lab' },
                { step: 3, title: 'Receive Results', desc: 'Detailed report within 5-7 days' },
                { step: 4, title: 'Get Coached', desc: 'Expert interpretation and action plan' },
              ].map((item, index) => (
                <motion.div
                  key={item.step}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="text-center"
                >
                  <div className="w-12 h-12 rounded-full bg-secondary/20 text-secondary font-bold text-xl flex items-center justify-center mx-auto mb-4">
                    {item.step}
                  </div>
                  <h3 className="font-semibold mb-2">{item.title}</h3>
                  <p className="text-sm text-muted-foreground">{item.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="py-20 md:py-28">
          <div className="container mx-auto px-4 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center max-w-3xl mx-auto"
            >
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                Ready to Discover What Your{' '}
                <span className="text-gradient">Biology is Telling You?</span>
              </h2>
              <p className="text-muted-foreground mb-8">
                Start with a comprehensive panel or speak with our team to design
                a testing strategy tailored to your specific health goals.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button variant="hero" size="lg" className="group">
                  Get Started with Testing
                  <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Button>
                <Link to="/contact">
                  <Button variant="heroOutline" size="lg">
                    Schedule a Consultation
                  </Button>
                </Link>
              </div>
            </motion.div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
};

export default Biomarkers;
