import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { Check, Brain, Sparkles, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import TestCatalog from '@/components/TestCatalog';
import JourneyPathway from '@/components/JourneyPathway';

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
      '10% off additional lab panels',
    ],
  },
  {
    name: 'Elevate',
    tagline: 'Metabolic & Performance Optimization',
    description: 'Accelerate results with deeper optimization, CGM insights, and dedicated performance coaching.',
    monthlyPrice: 299,
    icon: ArrowRight,
    popular: true,
    features: [
      'Everything in Ignite, plus:',
      'Bi-weekly coaching sessions',
      'Priority coaching response times',
      'CGM Sprint Program (2x per year)',
      '14-day continuous glucose monitoring',
      'Nutrition coach debrief + action plan',
      'Monthly virtual personal training session',
      'VO2max-informed programming',
      '15% discount on supplements',
      '15% off additional lab panels',
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
      'White-glove coordination of all programs',
      'VIP priority scheduling',
      'Exclusive member events',
      '20% off additional lab panels',
    ],
  },
];

const MembershipSection = () => {
  const [isAnnual, setIsAnnual] = useState(false);

  const getAnnualTotal = (monthlyPrice: number) => {
    return Math.round(monthlyPrice * 12 * 0.85);
  };

  return (
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
            Our membership tiers provide ongoing support, continuous optimization, and everything 
            you need for lasting health transformation. All plans include detailed reports with 
            personalized action plans.
          </p>

          {/* Billing Toggle */}
          <div className="flex items-center justify-center gap-4">
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
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-8 max-w-6xl mx-auto items-stretch">
          {membershipTiers.map((tier, index) => (
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
                <h3 className="text-3xl font-bold mb-1">{tier.name}</h3>
                <p className="text-secondary text-sm font-medium mb-3">{tier.tagline}</p>
                <p className="text-muted-foreground text-sm min-h-[60px]">{tier.description}</p>
              </div>

              <div className="text-center mb-8 h-[100px] flex flex-col justify-start">
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

              <Button
                variant={tier.popular ? 'hero' : 'heroOutline'}
                className="w-full mt-auto"
                size="lg"
              >
                {tier.popular ? 'Start Your Journey' : 'Choose Plan'}
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
          All memberships include access to our client portal with detailed reports and personalized action plans. 
          Cancel anytime with no hidden fees.
        </motion.p>
      </div>
    </section>
  );
};

const Pricing = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <>
      <Helmet>
        <title>Health Optimization Programs | VitalityX Health</title>
        <meta
          name="description"
          content="Discover personalized health optimization programs. From genetic testing to comprehensive wellness memberships—Ignite, Elevate, or Transcend your journey."
        />
        <link rel="canonical" href="https://vitalityxhealth.com/pricing" />
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

    {/* Membership Tiers */}
    <div id="memberships">
      <MembershipSection />
    </div>

    <Footer />
      </main>
    </>
  );
};

export default Pricing;
