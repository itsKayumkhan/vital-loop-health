import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { Check, Dna, FlaskConical, Users, Dumbbell, Pill, Brain, Sparkles, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const alaCarte = [
  {
    name: 'Genetic Blueprint Panel',
    description: 'Comprehensive DNA analysis revealing your genetic predispositions, mutations, and optimal health pathways.',
    price: 499,
    icon: Dna,
    features: [
      'Full genetic panel analysis',
      'Personalized action plan',
      'Detailed health report',
      'One-time consultation call',
    ],
  },
  {
    name: 'Precision Lab Testing',
    description: 'Advanced biomarker and vitamin deficiency testing to uncover hidden imbalances.',
    price: 299,
    icon: FlaskConical,
    features: [
      'Complete vitamin panel',
      'Hormone markers',
      'Metabolic indicators',
      'Digital results in 48hrs',
    ],
  },
];

const subscriptionTiers = [
  {
    name: 'Ignite',
    tagline: 'Spark Your Transformation',
    description: 'Begin your journey with foundational genetic insights and personalized guidance.',
    price: 149,
    period: '/month',
    icon: Sparkles,
    popular: false,
    features: [
      'Genetic Blueprint Panel (included)',
      'Quarterly lab testing',
      'Personalized nutrition plan',
      'Access to workout library',
      'Monthly wellness check-in',
      'Client portal access',
      'Detailed health reports',
    ],
  },
  {
    name: 'Elevate',
    tagline: 'Rise to Your Potential',
    description: 'Comprehensive support with coaching, training, and custom supplementation.',
    price: 299,
    period: '/month',
    icon: ArrowRight,
    popular: true,
    features: [
      'Everything in Ignite, plus:',
      'Bi-weekly wellness coaching',
      'Virtual personal training (2x/month)',
      'Custom supplement protocol',
      'Priority nutritionist access',
      'Monthly lab monitoring',
      'Real-time app analytics',
      'Personalized action plans',
    ],
  },
  {
    name: 'Transcend',
    tagline: 'Beyond Limits',
    description: 'Elite, white-glove health optimization with unlimited access to our full team.',
    price: 599,
    period: '/month',
    icon: Brain,
    popular: false,
    features: [
      'Everything in Elevate, plus:',
      'Unlimited wellness coaching',
      'Weekly personal training',
      'Premium supplement line',
      'Mental health support',
      'Dedicated health concierge',
      'Advanced genetic retesting',
      'VIP priority scheduling',
      'Exclusive member events',
    ],
  },
];

const Pricing = () => {
  return (
    <>
      <Helmet>
        <title>Pricing & Plans | VitalityX Health</title>
        <meta
          name="description"
          content="Choose your path to optimal health. From a la carte genetic testing to comprehensive subscription plans—Ignite, Elevate, or Transcend your wellness journey."
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

        {/* A La Carte Section */}
        <section className="py-16 relative">
          <div className="container mx-auto px-4 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Discover: A La Carte Testing
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Start your journey with individual tests. Perfect for those who want to explore 
                their genetic blueprint or identify specific deficiencies.
              </p>
            </motion.div>

            <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              {alaCarte.map((item, index) => (
                <motion.div
                  key={item.name}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="glass-card rounded-2xl p-8 border-secondary/20 hover:border-secondary/40 transition-all duration-300"
                >
                  <div className="w-14 h-14 rounded-xl bg-secondary/10 flex items-center justify-center mb-6">
                    <item.icon className="w-7 h-7 text-secondary" />
                  </div>
                  <h3 className="text-2xl font-bold mb-2">{item.name}</h3>
                  <p className="text-muted-foreground mb-6">{item.description}</p>
                  <div className="mb-6">
                    <span className="text-4xl font-bold text-foreground">${item.price}</span>
                    <span className="text-muted-foreground ml-2">one-time</span>
                  </div>
                  <ul className="space-y-3 mb-8">
                    {item.features.map((feature) => (
                      <li key={feature} className="flex items-center gap-3">
                        <Check className="w-5 h-5 text-secondary flex-shrink-0" />
                        <span className="text-sm text-foreground">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Button variant="heroOutline" className="w-full" size="lg">
                    Order Now
                  </Button>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Subscription Tiers */}
        <section className="py-24 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/5 to-transparent" />
          <div className="container mx-auto px-4 lg:px-8 relative">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Commit to <span className="text-gradient">Transformation</span>
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Our subscription tiers provide ongoing support, continuous optimization, and everything 
                you need for lasting health transformation. All plans include detailed reports with 
                personalized action plans.
              </p>
            </motion.div>

            <div className="grid lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {subscriptionTiers.map((tier, index) => (
                <motion.div
                  key={tier.name}
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.15 }}
                  className={`relative rounded-2xl p-8 transition-all duration-300 ${
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

                  <div className="text-center mb-8">
                    <div className="w-16 h-16 rounded-2xl bg-secondary/10 flex items-center justify-center mx-auto mb-4">
                      <tier.icon className="w-8 h-8 text-secondary" />
                    </div>
                    <h3 className="text-3xl font-bold mb-1">{tier.name}</h3>
                    <p className="text-secondary text-sm font-medium mb-3">{tier.tagline}</p>
                    <p className="text-muted-foreground text-sm">{tier.description}</p>
                  </div>

                  <div className="text-center mb-8">
                    <span className="text-5xl font-bold text-foreground">${tier.price}</span>
                    <span className="text-muted-foreground">{tier.period}</span>
                  </div>

                  <ul className="space-y-3 mb-8">
                    {tier.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-3">
                        <Check className="w-5 h-5 text-secondary flex-shrink-0 mt-0.5" />
                        <span className="text-sm text-foreground">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <Button
                    variant={tier.popular ? 'hero' : 'heroOutline'}
                    className="w-full"
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
              All subscriptions include access to our white-labeled portal with detailed reports and personalized action plans. 
              Cancel anytime with no hidden fees.
            </motion.p>
          </div>
        </section>

        <Footer />
      </main>
    </>
  );
};

export default Pricing;
