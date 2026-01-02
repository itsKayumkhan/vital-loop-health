import { motion } from 'framer-motion';
import { Dna, ArrowDown, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';

const JourneyPathway = () => {
  return (
    <section className="py-20 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-secondary/5 via-transparent to-transparent" />
      
      <div className="container mx-auto px-4 lg:px-8 relative">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="text-secondary font-semibold tracking-widest text-sm uppercase mb-4 block">
            Our Methodology
          </span>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Your Path to <span className="text-gradient">Optimization</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            We believe lasting transformation starts with understanding. That's why every journey 
            begins with your unique genetic blueprint.
          </p>
        </motion.div>

        <div className="max-w-4xl mx-auto">
          {/* Step 1: Genetic Blueprint */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="relative"
          >
            <div className="flex items-start gap-6">
              {/* Step indicator */}
              <div className="flex flex-col items-center">
                <div className="w-14 h-14 rounded-full bg-secondary flex items-center justify-center text-secondary-foreground font-bold text-xl shadow-glow">
                  1
                </div>
                <div className="w-0.5 h-24 bg-gradient-to-b from-secondary to-secondary/20 mt-4" />
              </div>

              {/* Content card */}
              <div className="flex-1 glass-card rounded-2xl p-8 border-2 border-secondary/30 hover:border-secondary/50 transition-colors">
                <div className="flex flex-col md:flex-row md:items-center gap-6">
                  <div className="w-20 h-20 rounded-2xl bg-secondary/10 flex items-center justify-center flex-shrink-0">
                    <Dna className="w-10 h-10 text-secondary" />
                  </div>
                  
                  <div className="flex-1">
                    <span className="text-secondary text-sm font-semibold uppercase tracking-wider">Start Here</span>
                    <h3 className="text-2xl md:text-3xl font-bold mt-1 mb-3">Genetic Blueprint Panel</h3>
                    <p className="text-muted-foreground leading-relaxed">
                      Your DNA is your roadmap. This comprehensive analysis reveals how your body processes nutrients, 
                      responds to exercise, manages stress, and more—providing the foundation for every recommendation we make.
                    </p>
                    
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mt-6">
                      <div className="flex items-baseline gap-2">
                        <span className="text-4xl font-bold text-foreground">$499</span>
                        <span className="text-muted-foreground">one-time</span>
                      </div>
                      <Button variant="hero" size="lg">
                        Begin Your Journey
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Value props */}
                <div className="grid sm:grid-cols-3 gap-4 mt-8 pt-6 border-t border-border/50">
                  <div className="text-center sm:text-left">
                    <p className="text-foreground font-semibold">Personalized Insights</p>
                    <p className="text-sm text-muted-foreground">Tailored to your unique DNA</p>
                  </div>
                  <div className="text-center sm:text-left">
                    <p className="text-foreground font-semibold">Actionable Report</p>
                    <p className="text-sm text-muted-foreground">Clear steps, not just data</p>
                  </div>
                  <div className="text-center sm:text-left">
                    <p className="text-foreground font-semibold">Lifetime Reference</p>
                    <p className="text-sm text-muted-foreground">Your genes don't change</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Connector */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="flex items-center gap-6 py-2"
          >
            <div className="w-14 flex justify-center">
              <ArrowDown className="w-6 h-6 text-secondary/50 animate-bounce" />
            </div>
            <p className="text-muted-foreground italic text-sm">
              With your blueprint in hand, choose how deeply you want to optimize...
            </p>
          </motion.div>

          {/* Step 2: Memberships */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="relative"
          >
            <div className="flex items-start gap-6">
              {/* Step indicator */}
              <div className="flex flex-col items-center">
                <div className="w-14 h-14 rounded-full bg-primary/20 border-2 border-secondary flex items-center justify-center text-secondary font-bold text-xl">
                  2
                </div>
              </div>

              {/* Content card */}
              <div className="flex-1 glass-card rounded-2xl p-8 border border-border/50 hover:border-secondary/30 transition-colors">
                <div className="flex flex-col md:flex-row md:items-center gap-6">
                  <div className="w-20 h-20 rounded-2xl bg-secondary/10 flex items-center justify-center flex-shrink-0">
                    <Sparkles className="w-10 h-10 text-secondary" />
                  </div>
                  
                  <div className="flex-1">
                    <span className="text-secondary text-sm font-semibold uppercase tracking-wider">Ongoing Support</span>
                    <h3 className="text-2xl md:text-3xl font-bold mt-1 mb-3">Choose Your Optimization Level</h3>
                    <p className="text-muted-foreground leading-relaxed">
                      Transform insights into action. Our membership tiers provide the coaching, monitoring, 
                      and accountability you need to achieve lasting results—each one built on the foundation 
                      of your genetic blueprint.
                    </p>
                    
                    <div className="flex items-center gap-4 mt-6">
                      <Button 
                        variant="heroOutline" 
                        size="lg"
                        onClick={() => {
                          document.getElementById('memberships')?.scrollIntoView({ behavior: 'smooth' });
                        }}
                      >
                        View Membership Tiers
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Tier preview */}
                <div className="grid sm:grid-cols-3 gap-4 mt-8 pt-6 border-t border-border/50">
                  <div className="text-center p-4 rounded-lg bg-background/50">
                    <p className="text-foreground font-semibold">Ignite</p>
                    <p className="text-secondary font-bold">$129/mo</p>
                  </div>
                  <div className="text-center p-4 rounded-lg bg-secondary/10 border border-secondary/30">
                    <p className="text-foreground font-semibold">Elevate</p>
                    <p className="text-secondary font-bold">$299/mo</p>
                  </div>
                  <div className="text-center p-4 rounded-lg bg-background/50">
                    <p className="text-foreground font-semibold">Transcend</p>
                    <p className="text-secondary font-bold">$649/mo</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default JourneyPathway;