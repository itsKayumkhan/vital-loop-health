import { useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  Dumbbell, 
  ArrowRight, 
  ArrowLeft,
  CheckCircle2,
  Zap,
  Dna,
  Heart,
  Target
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const features = [
  {
    icon: Dna,
    title: 'Genetic Training Blueprint',
    description: 'Your muscle fiber composition and recovery genetics determine your optimal training style and volume.',
  },
  {
    icon: Heart,
    title: 'VO2max Optimization',
    description: 'Cardiovascular protocols designed around your aerobic capacity and heart rate zones.',
  },
  {
    icon: Zap,
    title: 'Recovery-Matched Intensity',
    description: 'Training loads that push your limits while respecting your genetic recovery capacity.',
  },
  {
    icon: Target,
    title: 'Goal-Specific Programming',
    description: 'Whether it\'s strength, endurance, or sport-specific performance—programs built for your goals.',
  },
];

const included = [
  'Comprehensive fitness assessment',
  'Genetic muscle fiber composition analysis',
  'VO2max testing and zone calculations',
  'Custom periodized training programs',
  'Weekly 1-on-1 coaching sessions',
  'Form analysis and correction',
  'Progressive overload tracking',
  'Recovery protocol integration',
  'Monthly progress reviews with Health Architect',
];

const PerformanceProgram = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <>
      <Helmet>
        <title>Performance Training Program | VitalityX Health</title>
        <meta 
          name="description" 
          content="Genetically-informed performance training designed around your muscle fiber composition and recovery capacity. Build strength, endurance, and athletic performance." 
        />
      </Helmet>

      <main className="min-h-screen">
        <Navbar />
        
        {/* Hero */}
        <section className="pt-32 pb-16 lg:pt-40 lg:pb-24 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-red-500/10 via-transparent to-transparent" />
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
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-red-500 to-rose-500 flex items-center justify-center mb-6 shadow-lg">
                  <Dumbbell className="w-10 h-10 text-white" />
                </div>
                <span className="text-red-500 font-semibold tracking-widest text-sm uppercase mb-4 block">
                  Build Your Best
                </span>
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
                  Performance Training
                </h1>
                <p className="text-lg text-muted-foreground mb-8">
                  Training that respects your genetic ceiling while pushing your actual limits. Programs that 
                  maximize results while minimizing injury risk.
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
                className="glass-card rounded-3xl p-8 border-2 border-red-500/20"
              >
                <h3 className="text-xl font-bold mb-6">What's Included</h3>
                <div className="space-y-4">
                  {included.map((item, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <CheckCircle2 className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
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
                Science-backed training methodology that adapts to your unique physiology.
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
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-red-500 to-rose-500 flex items-center justify-center mb-4">
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
              <div className="absolute inset-0 bg-gradient-to-r from-red-500/5 via-red-500/10 to-red-500/5" />
              <div className="relative z-10">
                <h2 className="text-3xl md:text-4xl font-bold mb-6">
                  Ready to Unlock Your Performance?
                </h2>
                <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
                  Start with a fitness assessment to understand your genetic potential and 
                  create your personalized training roadmap.
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

export default PerformanceProgram;