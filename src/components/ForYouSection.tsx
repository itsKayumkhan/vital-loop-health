import { motion } from 'framer-motion';
import { Target, TrendingUp, Shield, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

const personas = [
  {
    icon: Target,
    title: 'High Performers',
    description: 'Executives, entrepreneurs, and professionals who need peak mental and physical performance. You don\'t have time for trial and error.',
    traits: ['Time-conscious', 'Results-driven', 'Data-oriented'],
  },
  {
    icon: TrendingUp,
    title: 'Health Optimizers',
    description: 'You\'ve tried everything mainstream has to offer. Now you want to know what YOUR body actually needs based on science, not trends.',
    traits: ['Proactive', 'Research-minded', 'Quality-focused'],
  },
  {
    icon: Shield,
    title: 'Prevention-First',
    description: 'Family history has you concerned. You want to understand your genetic risks and take action before problems develop.',
    traits: ['Forward-thinking', 'Family-focused', 'Prevention-oriented'],
  },
  {
    icon: Zap,
    title: 'Ready for Real Answers',
    description: 'You\'ve seen multiple specialists but still don\'t feel your best. You\'re tired of disconnected advice that doesn\'t consider the whole picture.',
    traits: ['Solution-seeking', 'Holistic-minded', 'Ready for change'],
  },
];

const ForYouSection = () => {
  return (
    <section id="for-you" className="py-24 lg:py-32 relative">
      <div className="container mx-auto px-4 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <span className="text-secondary font-semibold tracking-widest text-sm uppercase mb-4 block">
            Who We're For
          </span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6">
            Is VitalityX Right For You?
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            We work with people who are done with guesswork and ready to make decisions 
            based on their own biological data.
          </p>
        </motion.div>

        {/* Personas Grid */}
        <div className="grid md:grid-cols-2 gap-8">
          {personas.map((persona, index) => (
            <motion.div
              key={persona.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.15 }}
              className="group glass-card rounded-2xl p-8 hover:border-secondary/50 transition-all duration-500"
            >
              <div className="flex items-start gap-6">
                <div className="w-14 h-14 rounded-2xl bg-secondary/10 flex items-center justify-center flex-shrink-0 group-hover:bg-secondary/20 transition-colors">
                  <persona.icon className="w-7 h-7 text-secondary" />
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl font-bold mb-3 group-hover:text-secondary transition-colors">
                    {persona.title}
                  </h3>
                  <p className="text-muted-foreground leading-relaxed mb-4">
                    {persona.description}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {persona.traits.map((trait) => (
                      <span
                        key={trait}
                        className="px-3 py-1 text-xs font-medium rounded-full bg-secondary/10 text-secondary border border-secondary/20"
                      >
                        {trait}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Bottom Message */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="text-center mt-16"
        >
          <p className="text-lg text-muted-foreground mb-4">
            <span className="text-foreground font-semibold">Not ready for a full program?</span>{' '}
            Explore individual genetic and lab panels.
          </p>
          <Link to="/pricing">
            <Button variant="outline" size="sm">
              Browse Test Catalog
            </Button>
          </Link>
        </motion.div>
      </div>
    </section>
  );
};

export default ForYouSection;
