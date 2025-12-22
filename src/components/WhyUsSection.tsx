import { motion } from 'framer-motion';
import { Check, X } from 'lucide-react';

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
];

const WhyUsSection = () => {
  return (
    <section id="why-us" className="py-24 lg:py-32 relative overflow-hidden">
      {/* Background accent */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-secondary/5 to-transparent" />
      
      <div className="container mx-auto px-4 lg:px-8 relative">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left Content */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <span className="text-secondary font-semibold tracking-widest text-sm uppercase mb-4 block">
              Why We're Different
            </span>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6">
              The First True{' '}
              <span className="text-gradient">Closed-Loop</span>{' '}
              Health Blueprint
            </h2>
            <p className="text-muted-foreground text-lg mb-8 leading-relaxed">
              Other companies offer pieces of the puzzle. A DNA test here. A meal plan there. 
              A workout app somewhere else. You're left connecting the dots yourself.
            </p>
            <p className="text-muted-foreground text-lg mb-8 leading-relaxed">
              <strong className="text-foreground">VitalityX is different.</strong> We built a complete ecosystem 
              where every service is informed by your genetics and every provider has access to your full health picture. 
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
                transition={{ duration: 0.5, delay: index * 0.1 }}
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
  );
};

export default WhyUsSection;
