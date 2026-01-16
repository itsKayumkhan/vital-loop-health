import { useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { 
  Check, 
  X, 
  Shield, 
  Users, 
  Dna, 
  Award,
  ArrowRight,
  Star,
  Fingerprint,
  BarChart3,
  HeartHandshake,
  Zap,
  Target,
  Clock
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const differentiators = [
  {
    us: 'Genetic-based protocols tailored to your DNA',
    them: 'Generic plans based on age and weight',
  },
  {
    us: 'All services integrated in one closed-loop system',
    them: 'Fragmented services from different providers',
  },
  {
    us: 'Supplements formulated for YOUR deficiencies',
    them: 'Off-the-shelf vitamins for "general wellness"',
  },
  {
    us: 'One team that knows your complete health profile',
    them: 'Starting from scratch with every new provider',
  },
  {
    us: 'Real-time app access to all your health data',
    them: 'Scattered records and paperwork',
  },
  {
    us: 'Workouts designed for your genetic response',
    them: 'Cookie-cutter exercise programs',
  },
  {
    us: 'Fully customized health report guiding your entire journey',
    them: 'One-size-fits-all PDFs with no actionable steps',
  },
];

const trustPillars = [
  {
    icon: Fingerprint,
    title: 'Your Biology, Not Algorithms',
    description: 'Every recommendation we make starts with your genetic code. No guessing, no trends—just science-backed protocols designed specifically for your unique physiology.',
  },
  {
    icon: Users,
    title: 'A Team That Knows You',
    description: 'Your Health Architect coordinates nutrition, fitness, wellness, and mental performance coaches—all working together with full access to your health profile. No repeating your story.',
  },
  {
    icon: BarChart3,
    title: 'Measurable Results',
    description: 'We track your progress with lab markers, wearable data, and performance metrics. You\'ll see exactly what\'s working and why—no more guessing if something is helping.',
  },
  {
    icon: HeartHandshake,
    title: 'Long-Term Partnership',
    description: 'We\'re not here to sell you a quick fix. We build lasting relationships because health optimization is a journey, and you deserve a team that grows with you.',
  },
];

const statistics = [
  { value: '94%', label: 'Client retention rate', subtext: 'Year over year' },
  { value: '300+', label: 'Genetic markers analyzed', subtext: 'Per client' },
  { value: '1,000+', label: 'Lives transformed', subtext: 'And counting' },
  { value: '4.9/5', label: 'Client satisfaction', subtext: 'Average rating' },
];

const problems = [
  {
    icon: Clock,
    problem: 'Years of Trial and Error',
    solution: 'Your DNA tells us what works for YOU on day one.',
  },
  {
    icon: Target,
    problem: 'Generic Advice That Doesn\'t Work',
    solution: 'Protocols built for your metabolism, recovery, and genetic responses.',
  },
  {
    icon: Zap,
    problem: 'Fragmented Healthcare',
    solution: 'One integrated team, one complete picture, one cohesive plan.',
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: 'easeOut' },
  },
};

const WhyUs = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <>
      <Helmet>
        <title>Why VitalityX | The Closed-Loop Health System That Actually Works</title>
        <meta 
          name="description" 
          content="Discover why VitalityX is different. Genetic-based health optimization with an integrated team of specialists who work together to deliver real, measurable results." 
        />
        <meta name="keywords" content="personalized health, genetic health optimization, why choose VitalityX, health coaching, DNA-based wellness" />
        <link rel="canonical" href="https://vitalityxhealth.com/why-us" />
      </Helmet>

      <main className="min-h-screen">
        <Navbar />
        
        {/* Hero Section */}
        <section className="pt-32 pb-16 lg:pt-40 lg:pb-24 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-secondary/5 via-transparent to-transparent" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[1000px] bg-secondary/5 rounded-full blur-3xl" />
          
          <div className="container mx-auto px-4 lg:px-8 relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-center max-w-4xl mx-auto"
            >
              <span className="text-secondary font-semibold tracking-widest text-sm uppercase mb-4 block">
                Why Choose VitalityX
              </span>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
                Because Your Health Deserves<br />
                <span className="text-gradient">More Than Guesswork</span>
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
                We built VitalityX because we were tired of fragmented healthcare that ignores what makes 
                you unique. Your DNA holds the answers—we just help you read them.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link to="/programs">
                  <Button variant="hero" size="lg" className="group">
                    See Our Programs
                    <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
                <Link to="/services">
                  <Button variant="heroOutline" size="lg">
                    Meet Your Team
                  </Button>
                </Link>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Statistics Bar */}
        <section className="py-12 relative">
          <div className="container mx-auto px-4 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="glass-card rounded-2xl p-8 lg:p-12"
            >
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
                {statistics.map((stat, index) => (
                  <motion.div
                    key={stat.label}
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    className="text-center"
                  >
                    <div className="text-3xl md:text-4xl lg:text-5xl font-bold text-secondary mb-2">
                      {stat.value}
                    </div>
                    <div className="text-foreground font-semibold mb-1">{stat.label}</div>
                    <div className="text-sm text-muted-foreground">{stat.subtext}</div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </section>

        {/* The Problem We Solve */}
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
                The Problem We Solve
              </span>
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6">
                Sound Familiar?
              </h2>
              <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                If you've experienced these frustrations, you're not alone—and you're exactly who we built VitalityX for.
              </p>
            </motion.div>

            <div className="grid md:grid-cols-3 gap-8">
              {problems.map((item, index) => (
                <motion.div
                  key={item.problem}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.15 }}
                  className="glass-card rounded-2xl p-8 text-center group hover:border-secondary/50 transition-all duration-500"
                >
                  <div className="w-16 h-16 rounded-2xl bg-destructive/10 flex items-center justify-center mx-auto mb-6 group-hover:bg-secondary/10 transition-colors">
                    <item.icon className="w-8 h-8 text-destructive group-hover:text-secondary transition-colors" />
                  </div>
                  <h3 className="text-xl font-bold mb-3 text-destructive group-hover:text-foreground transition-colors">
                    {item.problem}
                  </h3>
                  <div className="w-12 h-px bg-border mx-auto my-4" />
                  <p className="text-muted-foreground group-hover:text-foreground transition-colors">
                    <span className="text-secondary font-semibold">Our solution:</span> {item.solution}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Trust Pillars */}
        <section className="py-16 lg:py-24 relative">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-secondary/5 to-transparent" />
          <div className="container mx-auto px-4 lg:px-8 relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="text-center mb-16"
            >
              <span className="text-secondary font-semibold tracking-widest text-sm uppercase mb-4 block">
                Our Promise
              </span>
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6">
                What You Can <span className="text-gradient">Count On</span>
              </h2>
              <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                These aren't buzzwords—they're the non-negotiable principles that guide everything we do.
              </p>
            </motion.div>

            <motion.div
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              className="grid md:grid-cols-2 gap-8"
            >
              {trustPillars.map((pillar) => (
                <motion.div
                  key={pillar.title}
                  variants={itemVariants}
                  className="glass-card rounded-2xl p-8 group hover:border-secondary/50 transition-all duration-500"
                >
                  <div className="flex items-start gap-6">
                    <div className="w-14 h-14 rounded-2xl bg-secondary/10 flex items-center justify-center flex-shrink-0 group-hover:bg-secondary/20 transition-colors">
                      <pillar.icon className="w-7 h-7 text-secondary" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold mb-3 group-hover:text-secondary transition-colors">
                        {pillar.title}
                      </h3>
                      <p className="text-muted-foreground leading-relaxed">
                        {pillar.description}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* Comparison Section */}
        <section className="py-16 lg:py-24">
          <div className="container mx-auto px-4 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              {/* Left Content */}
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
              >
                <span className="text-secondary font-semibold tracking-widest text-sm uppercase mb-4 block">
                  The VitalityX Difference
                </span>
                <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6">
                  A True{' '}
                  <span className="text-gradient">Closed-Loop</span>{' '}
                  Health Blueprint
                </h2>
                <p className="text-muted-foreground text-lg mb-8 leading-relaxed">
                  Other companies offer pieces of the puzzle. A DNA test here. A meal plan there. 
                  A workout app somewhere else. You're left connecting the dots yourself.
                </p>
                <p className="text-muted-foreground text-lg mb-8 leading-relaxed">
                  <strong className="text-foreground">VitalityX is different.</strong> We built a complete ecosystem 
                  where every service is informed by your genetics and every team member has access to your full health picture. 
                  No more guesswork. No more fragmentation.
                </p>
                
                <div className="glass-card rounded-2xl p-6 border-l-4 border-secondary">
                  <p className="text-foreground font-medium italic">
                    "Your body isn't generic—why should your health plan be? We read your genetic code 
                    and build everything around what makes you, you."
                  </p>
                </div>
              </motion.div>

              {/* Right - Comparison */}
              <motion.div
                initial={{ opacity: 0, x: 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="space-y-4"
              >
                {/* Header */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="text-center">
                    <span className="text-secondary font-bold text-lg">VitalityX</span>
                  </div>
                  <div className="text-center">
                    <span className="text-muted-foreground font-bold text-lg">Everyone Else</span>
                  </div>
                </div>

                {/* Comparison Items */}
                {differentiators.map((item, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: index * 0.08 }}
                    className="grid grid-cols-2 gap-4"
                  >
                    <div className="glass-card rounded-xl p-4 border-secondary/30">
                      <div className="flex items-start gap-3">
                        <div className="w-5 h-5 rounded-full bg-secondary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <Check className="w-3 h-3 text-secondary" />
                        </div>
                        <p className="text-sm text-foreground">{item.us}</p>
                      </div>
                    </div>
                    <div className="bg-muted/30 rounded-xl p-4 border border-border/50">
                      <div className="flex items-start gap-3">
                        <div className="w-5 h-5 rounded-full bg-destructive/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <X className="w-3 h-3 text-destructive" />
                        </div>
                        <p className="text-sm text-muted-foreground">{item.them}</p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            </div>
          </div>
        </section>

        {/* Credibility Section */}
        <section className="py-16 lg:py-24 relative">
          <div className="absolute inset-0 bg-gradient-to-r from-secondary/5 via-secondary/10 to-secondary/5" />
          <div className="container mx-auto px-4 lg:px-8 relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="glass-card rounded-3xl p-8 lg:p-12 border-2 border-secondary/20"
            >
              <div className="grid lg:grid-cols-2 gap-12 items-center">
                <div>
                  <div className="flex items-center gap-3 mb-6">
                    <Award className="w-10 h-10 text-secondary" />
                    <span className="text-secondary font-bold text-sm tracking-widest uppercase">
                      Our Credentials
                    </span>
                  </div>
                  <h2 className="text-3xl lg:text-4xl font-bold mb-6">
                    Built By Experts.<br />
                    <span className="text-gradient">Trusted By Clients.</span>
                  </h2>
                  <p className="text-muted-foreground text-lg mb-8 leading-relaxed">
                    VitalityX was founded by health optimization experts who saw firsthand how 
                    fragmented healthcare fails people. We partner with board-certified physicians, 
                    certified coaches, and CLIA-certified laboratories to deliver protocols that are 
                    evidence-based, personalized, and proven to work.
                  </p>
                  <div className="space-y-4">
                    {[
                      'Board-certified physicians overseeing all protocols',
                      'CLIA-certified laboratory partnerships',
                      'Certified coaches in nutrition, fitness, and wellness',
                      'HIPAA-compliant data security and privacy',
                    ].map((credential, index) => (
                      <div key={index} className="flex items-center gap-3">
                        <Shield className="w-5 h-5 text-secondary flex-shrink-0" />
                        <span className="text-foreground">{credential}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="glass-card rounded-2xl p-6">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="flex -space-x-2">
                        {[...Array(5)].map((_, i) => (
                          <div key={i} className="w-10 h-10 rounded-full bg-gradient-to-br from-secondary to-secondary/60 border-2 border-background flex items-center justify-center">
                            <Star className="w-4 h-4 text-background fill-background" />
                          </div>
                        ))}
                      </div>
                      <div className="text-3xl font-bold text-secondary">4.9</div>
                    </div>
                    <p className="text-muted-foreground">
                      Average rating from over 1,000 clients who've transformed their health with VitalityX.
                    </p>
                  </div>

                  <div className="glass-card rounded-2xl p-6">
                    <p className="text-foreground italic mb-4">
                      "I've worked with nutritionists, trainers, and doctors—but no one ever connected the dots 
                      until VitalityX. For the first time, everything makes sense because it's based on MY body."
                    </p>
                    <div className="flex items-center gap-3">
                      <Dna className="w-5 h-5 text-secondary" />
                      <span className="text-muted-foreground text-sm">— Sarah M., Austin TX</span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="py-16 lg:py-24">
          <div className="container mx-auto px-4 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="text-center max-w-3xl mx-auto"
            >
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6">
                Ready to Experience the Difference?
              </h2>
              <p className="text-lg text-muted-foreground mb-8">
                Stop settling for generic advice and fragmented care. Your health journey 
                starts with understanding what makes you unique.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link to="/pricing">
                  <Button variant="hero" size="lg" className="group">
                    Explore Programs
                    <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
                <Button variant="heroOutline" size="lg">
                  Schedule a Call
                </Button>
              </div>
            </motion.div>
          </div>
        </section>

        <Footer />
      </main>
    </>
  );
};

export default WhyUs;
