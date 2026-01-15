import { useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  Utensils, 
  ArrowRight, 
  ArrowLeft,
  CheckCircle2,
  Activity,
  Dna,
  LineChart,
  Apple
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const features = [
  {
    icon: Activity,
    title: 'CGM Integration',
    description: 'Real-time glucose monitoring data informs every meal recommendation, helping you understand exactly how foods affect YOUR body.',
  },
  {
    icon: Dna,
    title: 'Genetic Optimization',
    description: 'Your macro ratios and meal timing are designed around your genetic metabolic profile—not generic guidelines.',
  },
  {
    icon: LineChart,
    title: 'Adaptive Protocols',
    description: 'As your body adapts, so do your protocols. Weekly data reviews ensure continuous optimization.',
  },
  {
    icon: Apple,
    title: 'Practical Frameworks',
    description: 'No rigid meal plans. Learn flexible eating frameworks that work with your lifestyle and preferences.',
  },
];

const included = [
  'Initial comprehensive nutrition assessment',
  'CGM device and data analysis (Premium tiers)',
  'Genetic metabolic profile integration',
  'Weekly 1-on-1 coaching sessions',
  'Custom macro frameworks and meal timing',
  'Food sensitivity identification',
  'Supplement recommendations',
  'Messaging access to your coach',
  'Monthly progress reviews with Health Architect',
];

const NutritionProgram = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <>
      <Helmet>
        <title>Nutrition Coaching Program | VitalityX Health</title>
        <meta 
          name="description" 
          content="CGM-informed nutrition coaching tailored to your genetic metabolic profile. Transform your relationship with food through personalized macro frameworks and meal timing." 
        />
      </Helmet>

      <main className="min-h-screen">
        <Navbar />
        
        {/* Hero */}
        <section className="pt-32 pb-16 lg:pt-40 lg:pb-24 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 via-transparent to-transparent" />
          <div className="container mx-auto px-4 lg:px-8 relative z-10">
            <Link to="/programs" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-8 transition-colors">
              <ArrowLeft className="w-4 h-4" />
              Back to Programs
            </Link>
            
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
              >
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center mb-6 shadow-lg">
                  <Utensils className="w-10 h-10 text-white" />
                </div>
                <span className="text-orange-500 font-semibold tracking-widest text-sm uppercase mb-4 block">
                  Fuel Your Potential
                </span>
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
                  Nutrition Coaching
                </h1>
                <p className="text-lg text-muted-foreground mb-8">
                  Beyond generic meal plans. Your Nutrition Coach designs eating strategies based on your 
                  genetic metabolic profile, real-time glucose response, and lifestyle demands.
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Link to="/pricing">
                    <Button variant="hero" size="lg" className="group w-full sm:w-auto">
                      Get Started
                      <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </Link>
                  <Link to="/contact">
                    <Button variant="heroOutline" size="lg" className="w-full sm:w-auto">
                      Book a Consultation
                    </Button>
                  </Link>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="glass-card rounded-3xl p-8 border-2 border-orange-500/20"
              >
                <h3 className="text-xl font-bold mb-6">What's Included</h3>
                <div className="space-y-4">
                  {included.map((item, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <CheckCircle2 className="w-5 h-5 text-orange-500 flex-shrink-0 mt-0.5" />
                      <span className="text-foreground">{item}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="py-16 lg:py-24 bg-secondary/5">
          <div className="container mx-auto px-4 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <h2 className="text-3xl md:text-4xl font-bold mb-4">How It Works</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Our nutrition coaching goes beyond calorie counting to create lasting metabolic change.
              </p>
            </motion.div>

            <div className="grid md:grid-cols-2 gap-8">
              {features.map((feature, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="glass-card rounded-2xl p-8"
                >
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center mb-4">
                    <feature.icon className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-16 lg:py-24">
          <div className="container mx-auto px-4 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="glass-card rounded-3xl p-8 lg:p-16 text-center relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-orange-500/5 via-orange-500/10 to-orange-500/5" />
              <div className="relative z-10">
                <h2 className="text-3xl md:text-4xl font-bold mb-6">
                  Ready to Transform Your Nutrition?
                </h2>
                <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
                  Start with a free consultation to learn how our CGM-informed nutrition coaching 
                  can help you achieve your goals.
                </p>
                <Link to="/pricing">
                  <Button variant="hero" size="lg" className="group">
                    View Plans & Pricing
                    <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
              </div>
            </motion.div>
          </div>
        </section>

        <Footer />
      </main>
    </>
  );
};

export default NutritionProgram;