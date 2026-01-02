import { useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { 
  Crown, 
  Utensils, 
  Dumbbell, 
  Moon, 
  Brain,
  ArrowRight,
  CheckCircle2,
  Star
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const coaches = [
  {
    icon: Utensils,
    title: 'Nutrition Coach',
    scope: 'CGM programs, macro targets, meal frameworks',
    tagline: 'Your Fuel Strategist',
    description: 'Beyond generic meal plans. Your Nutrition Coach designs eating strategies based on your genetic metabolic profile, real-time glucose response, and lifestyle demands. Using continuous glucose monitoring data alongside your DNA markers, they craft macro frameworks that work with your body—not against it.',
    differentiators: [
      'CGM-informed meal timing and composition',
      'Genetic-based macro optimization',
      'Personalized food sensitivity integration',
      'Metabolic flexibility protocols'
    ],
    color: 'from-orange-500 to-amber-500',
  },
  {
    icon: Dumbbell,
    title: 'Performance Coach',
    scope: 'Strength, aerobic capacity, VO2max-informed training',
    tagline: 'Your Physical Architect',
    description: 'Training that respects your genetic ceiling while pushing your actual limits. Your Performance Coach translates your genetic muscle fiber composition, recovery capacity, and cardiovascular potential into programs that maximize results while minimizing injury risk.',
    differentiators: [
      'Genetically-informed training periodization',
      'VO2max-optimized cardiovascular protocols',
      'Recovery-matched intensity programming',
      'Sport-specific genetic advantage mapping'
    ],
    color: 'from-red-500 to-rose-500',
  },
  {
    icon: Moon,
    title: 'Wellness & Recovery Coach',
    scope: 'Sleep, stress, HRV, circadian rhythm',
    tagline: 'Your Restoration Specialist',
    description: "Performance happens in the margins—and recovery is where it's built. Your Wellness Coach uses HRV data, sleep architecture analysis, and circadian rhythm science to optimize the hours you're not training. Because the best workout means nothing if your body can't recover from it.",
    differentiators: [
      'HRV-guided recovery protocols',
      'Circadian rhythm optimization',
      'Sleep architecture enhancement',
      'Stress adaptation strategies'
    ],
    color: 'from-indigo-500 to-purple-500',
  },
  {
    icon: Brain,
    title: 'Mental Performance Coach',
    scope: 'Stress management, resilience, focus (NOT therapy)',
    tagline: 'Your Cognitive Edge',
    description: "Mental performance isn't therapy—it's the tactical advantage that separates good from great. Your Mental Performance Coach builds focus protocols, stress resilience frameworks, and cognitive optimization strategies that translate directly to better decisions, sustained attention, and peak performance under pressure.",
    differentiators: [
      'Focus and attention optimization',
      'Performance under pressure protocols',
      'Stress resilience development',
      'Cognitive load management strategies'
    ],
    color: 'from-cyan-500 to-teal-500',
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.7,
      ease: 'easeOut',
    },
  },
};

const Services = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <>
      <Helmet>
        <title>Our Services | VitalityX Health - Expert Coaching Team</title>
        <meta 
          name="description" 
          content="Meet your Health Architect and specialized coaching team. Personalized nutrition, performance training, wellness recovery, and mental performance coaching—all coordinated around your genetic profile." 
        />
        <meta name="keywords" content="health coaching, nutrition coach, personal trainer, mental performance, wellness coach, genetic-based coaching" />
        <link rel="canonical" href="https://vitalityxhealth.com/services" />
      </Helmet>

      <main className="min-h-screen">
        <Navbar />
        
        {/* Hero Section */}
        <section className="pt-32 pb-16 lg:pt-40 lg:pb-24 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-secondary/5 via-transparent to-transparent" />
          <div className="container mx-auto px-4 lg:px-8 relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-center max-w-4xl mx-auto"
            >
              <span className="text-secondary font-semibold tracking-widest text-sm uppercase mb-4 block">
                Your Complete Support System
              </span>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
                One Vision. One Team.<br />
                <span className="text-gradient">Your Success.</span>
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
                Every aspect of your health optimization is coordinated by experts who work together—
                because fragmented advice creates fragmented results.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Health Architect Section - Key Differentiator */}
        <section className="py-16 lg:py-24 relative">
          <div className="absolute inset-0 bg-gradient-to-r from-secondary/5 via-secondary/10 to-secondary/5" />
          <div className="container mx-auto px-4 lg:px-8 relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="max-w-6xl mx-auto"
            >
              <div className="glass-card rounded-3xl p-8 lg:p-12 border-2 border-secondary/30 relative overflow-hidden">
                {/* Decorative glow */}
                <div className="absolute -top-20 -right-20 w-60 h-60 bg-secondary/20 rounded-full blur-3xl" />
                <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-secondary/10 rounded-full blur-2xl" />
                
                <div className="relative z-10">
                  <div className="flex flex-col lg:flex-row gap-8 lg:gap-16 items-start">
                    {/* Icon & Badge */}
                    <div className="flex-shrink-0">
                      <div className="w-24 h-24 lg:w-32 lg:h-32 rounded-2xl bg-gradient-to-br from-secondary to-secondary/70 flex items-center justify-center glow-green">
                        <Crown className="w-12 h-12 lg:w-16 lg:h-16 text-background" />
                      </div>
                      <div className="mt-4 flex items-center gap-2">
                        <Star className="w-4 h-4 text-secondary fill-secondary" />
                        <span className="text-sm font-semibold text-secondary">Your Quarterback</span>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1">
                      <span className="text-secondary text-sm font-bold tracking-widest uppercase">
                        The VitalityX Difference
                      </span>
                      <h2 className="text-3xl lg:text-4xl font-bold mt-2 mb-6">
                        Your Health Architect
                      </h2>
                      <p className="text-lg text-muted-foreground mb-6 leading-relaxed">
                        Unlike fragmented health services where you're bounced between providers who never communicate, 
                        your Health Architect is your single point of contact—the internal quarterback who knows your 
                        genetic profile, your goals, and your progress inside and out.
                      </p>
                      <p className="text-lg text-foreground font-medium mb-8">
                        They coordinate every aspect of your journey: ensuring your nutrition coach knows what your 
                        performance coach is programming, that your supplements address what your labs reveal, and 
                        that every recommendation is aligned with your genetic blueprint.
                      </p>

                      {/* Key Benefits */}
                      <div className="grid sm:grid-cols-2 gap-4 mb-8">
                        {[
                          'Single point of contact for all questions',
                          'Coordinates all specialist recommendations',
                          'Tracks progress across every health domain',
                          'Adjusts protocols based on real-time data',
                          'Ensures no conflicting advice between coaches',
                          'Monthly comprehensive strategy sessions'
                        ].map((benefit, index) => (
                          <div key={index} className="flex items-start gap-3">
                            <CheckCircle2 className="w-5 h-5 text-secondary flex-shrink-0 mt-0.5" />
                            <span className="text-foreground">{benefit}</span>
                          </div>
                        ))}
                      </div>

                      <Button variant="hero" size="lg" className="group">
                        Meet Your Health Architect
                        <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Specialist Coaches Section */}
        <section className="py-16 lg:py-24">
          <div className="container mx-auto px-4 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="text-center mb-16"
            >
              <span className="text-secondary font-semibold tracking-widest text-sm uppercase mb-4 block">
                Your Specialist Team
              </span>
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6">
                Experts in Every Domain
              </h2>
              <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                Each coach brings deep expertise in their specialty—and works in perfect coordination 
                with your Health Architect to ensure integrated, cohesive guidance.
              </p>
            </motion.div>

            <motion.div
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              className="space-y-8"
            >
              {coaches.map((coach, index) => (
                <motion.div
                  key={coach.title}
                  variants={itemVariants}
                  className="glass-card rounded-2xl p-6 lg:p-10 hover:border-secondary/50 transition-all duration-500"
                >
                  <div className={`flex flex-col ${index % 2 === 1 ? 'lg:flex-row-reverse' : 'lg:flex-row'} gap-8 lg:gap-12 items-start`}>
                    {/* Icon & Meta */}
                    <div className="flex-shrink-0 lg:w-64">
                      <div className={`w-16 h-16 lg:w-20 lg:h-20 rounded-2xl bg-gradient-to-br ${coach.color} flex items-center justify-center mb-4`}>
                        <coach.icon className="w-8 h-8 lg:w-10 lg:h-10 text-white" />
                      </div>
                      <span className="text-secondary text-xs font-bold tracking-widest uppercase block mb-1">
                        {coach.tagline}
                      </span>
                      <h3 className="text-2xl lg:text-3xl font-bold mb-2">
                        {coach.title}
                      </h3>
                      <p className="text-sm text-muted-foreground font-medium">
                        {coach.scope}
                      </p>
                    </div>

                    {/* Content */}
                    <div className="flex-1">
                      <p className="text-lg text-muted-foreground leading-relaxed mb-6">
                        {coach.description}
                      </p>
                      
                      <div className="grid sm:grid-cols-2 gap-3 mb-6">
                        {coach.differentiators.map((diff, i) => (
                          <div key={i} className="flex items-start gap-2">
                            <CheckCircle2 className="w-4 h-4 text-secondary flex-shrink-0 mt-1" />
                            <span className="text-sm text-foreground">{diff}</span>
                          </div>
                        ))}
                      </div>

                      <Button variant="heroOutline" size="lg" className="group">
                        Schedule a Session
                        <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </Button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 lg:py-24">
          <div className="container mx-auto px-4 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="glass-card rounded-3xl p-8 lg:p-16 text-center relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-secondary/5 via-secondary/10 to-secondary/5" />
              <div className="relative z-10">
                <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6">
                  Ready to Meet Your Team?
                </h2>
                <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
                  Start with your genetic blueprint, and we'll match you with the Health Architect 
                  and coaching team that's right for your goals.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button variant="hero" size="lg" className="group">
                    Get Started Today
                    <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </Button>
                  <Button variant="heroOutline" size="lg">
                    Explore Programs
                  </Button>
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

export default Services;
