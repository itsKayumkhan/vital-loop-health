import { useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  Utensils, 
  Dumbbell, 
  Moon, 
  Brain,
  ArrowRight,
  Sparkles,
  Target,
  TrendingUp
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const programs = [
  {
    id: 'nutrition',
    icon: Utensils,
    title: 'Nutrition Coaching',
    tagline: 'Fuel Your Potential',
    shortDescription: 'CGM-informed nutrition strategies tailored to your genetic metabolic profile.',
    highlights: ['Continuous glucose monitoring integration', 'Genetic-based macro optimization', 'Personalized meal frameworks'],
    color: 'from-orange-500 to-amber-500',
    bgColor: 'bg-orange-500/10',
    href: '/programs/nutrition',
  },
  {
    id: 'performance',
    icon: Dumbbell,
    title: 'Performance Training',
    tagline: 'Build Your Best',
    shortDescription: 'Training programs designed around your genetic muscle fiber composition and recovery capacity.',
    highlights: ['VO2max-optimized protocols', 'Genetically-informed periodization', 'Recovery-matched programming'],
    color: 'from-red-500 to-rose-500',
    bgColor: 'bg-red-500/10',
    href: '/programs/performance',
  },
  {
    id: 'wellness',
    icon: Moon,
    title: 'Wellness & Recovery',
    tagline: 'Restore Your Edge',
    shortDescription: 'Optimize sleep, stress, and recovery using HRV data and circadian rhythm science.',
    highlights: ['HRV-guided recovery', 'Sleep architecture enhancement', 'Circadian rhythm optimization'],
    color: 'from-indigo-500 to-purple-500',
    bgColor: 'bg-indigo-500/10',
    href: '/programs/wellness',
  },
  {
    id: 'mental-performance',
    icon: Brain,
    title: 'Mental Performance',
    tagline: 'Sharpen Your Mind',
    shortDescription: 'Build focus, resilience, and cognitive performance for peak mental clarity.',
    highlights: ['Focus & attention optimization', 'Stress resilience protocols', 'Cognitive load management'],
    color: 'from-cyan-500 to-teal-500',
    bgColor: 'bg-cyan-500/10',
    href: '/programs/mental-performance',
  },
  {
    id: 'sleep',
    icon: Moon,
    title: 'Sleep Optimization',
    tagline: 'Master Your Rest',
    shortDescription: 'Transform your sleep quality with personalized protocols based on your sleep phenotype.',
    highlights: ['Sleep phenotype analysis', 'Evidence-based interventions', 'Circadian rhythm reset'],
    color: 'from-violet-500 to-purple-500',
    bgColor: 'bg-violet-500/10',
    href: '/programs/sleep',
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: 'easeOut',
    },
  },
};

const Programs = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <>
      <Helmet>
        <title>Coaching Programs | VitalityX Health - Personalized Health Optimization</title>
        <meta 
          name="description" 
          content="Explore our comprehensive coaching programs: Nutrition, Performance Training, Wellness & Recovery, Mental Performance, and Sleep Optimization. All personalized to your genetic profile." 
        />
        <meta name="keywords" content="health coaching programs, nutrition coaching, performance training, sleep optimization, mental performance, wellness coaching" />
        <link rel="canonical" href="https://vitalityxhealth.com/programs" />
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
                Personalized Coaching Programs
              </span>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
                Transform Every Dimension<br />
                <span className="text-gradient">of Your Health</span>
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
                Choose your focus area—or combine multiple programs for comprehensive optimization. 
                Every program is tailored to your unique genetic profile and goals.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Value Props */}
        <section className="py-12 border-y border-border/50 bg-secondary/5">
          <div className="container mx-auto px-4 lg:px-8">
            <div className="grid md:grid-cols-3 gap-8">
              {[
                { icon: Sparkles, title: 'Genetically Personalized', desc: 'Every protocol based on your DNA' },
                { icon: Target, title: 'Data-Driven Progress', desc: 'Real-time tracking and adjustments' },
                { icon: TrendingUp, title: 'Coordinated Care', desc: 'All coaches work as one team' },
              ].map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="flex items-center gap-4"
                >
                  <div className="w-12 h-12 rounded-xl bg-secondary/20 flex items-center justify-center flex-shrink-0">
                    <item.icon className="w-6 h-6 text-secondary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">{item.title}</h3>
                    <p className="text-sm text-muted-foreground">{item.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Programs Grid */}
        <section className="py-16 lg:py-24">
          <div className="container mx-auto px-4 lg:px-8">
            <motion.div
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              className="grid lg:grid-cols-2 gap-8"
            >
              {programs.map((program) => (
                <motion.div
                  key={program.id}
                  variants={itemVariants}
                  className="group"
                >
                  <Link to={program.href} className="block h-full">
                    <div className="glass-card rounded-3xl p-8 h-full border-2 border-transparent hover:border-secondary/30 transition-all duration-500 relative overflow-hidden">
                      {/* Background gradient on hover */}
                      <div className={`absolute inset-0 bg-gradient-to-br ${program.color} opacity-0 group-hover:opacity-5 transition-opacity duration-500`} />
                      
                      <div className="relative z-10">
                        {/* Header */}
                        <div className="flex items-start justify-between mb-6">
                          <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${program.color} flex items-center justify-center shadow-lg`}>
                            <program.icon className="w-8 h-8 text-white" />
                          </div>
                          <ArrowRight className="w-6 h-6 text-muted-foreground group-hover:text-secondary group-hover:translate-x-1 transition-all" />
                        </div>

                        {/* Content */}
                        <span className="text-secondary text-xs font-bold tracking-widest uppercase block mb-2">
                          {program.tagline}
                        </span>
                        <h3 className="text-2xl font-bold mb-3">{program.title}</h3>
                        <p className="text-muted-foreground mb-6">{program.shortDescription}</p>

                        {/* Highlights */}
                        <div className="space-y-2">
                          {program.highlights.map((highlight, i) => (
                            <div key={i} className="flex items-center gap-3">
                              <div className={`w-1.5 h-1.5 rounded-full bg-gradient-to-br ${program.color}`} />
                              <span className="text-sm text-foreground">{highlight}</span>
                            </div>
                          ))}
                        </div>

                        {/* CTA hint */}
                        <div className="mt-6 pt-6 border-t border-border/50">
                          <span className="text-secondary font-medium text-sm group-hover:underline">
                            Learn more about this program →
                          </span>
                        </div>
                      </div>
                    </div>
                  </Link>
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
                  Not Sure Where to Start?
                </h2>
                <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
                  Take our quick assessment and we'll recommend the perfect program combination 
                  based on your goals and current health status.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link to="/pricing">
                    <Button variant="hero" size="lg" className="group">
                      View Pricing Plans
                      <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </Link>
                  <Link to="/contact">
                    <Button variant="heroOutline" size="lg">
                      Talk to an Advisor
                    </Button>
                  </Link>
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

export default Programs;