import { motion } from 'framer-motion';
import { ArrowRight, Calendar, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

const CTASection = () => {
  return (
    <section id="contact" className="py-24 lg:py-32 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-gradient-to-t from-secondary/10 via-transparent to-transparent" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-secondary/5 rounded-full blur-3xl" />

      <div className="container mx-auto px-4 lg:px-8 relative">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="max-w-4xl mx-auto text-center"
        >
          {/* Main CTA */}
          <h2 className="text-3xl md:text-4xl lg:text-6xl font-bold mb-6">
            Ready to Decode{' '}
            <span className="text-gradient">Your Potential?</span>
          </h2>
          <p className="text-muted-foreground text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
            Your genes hold the answers. Your labs tell the story. 
            Let us build a health system that's designed for one person: you.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
            <Button variant="hero" size="xl" className="group">
              <Calendar className="mr-2 w-5 h-5" />
              Schedule Discovery Call
              <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
            <Button variant="heroOutline" size="xl" className="group">
              <MessageCircle className="mr-2 w-5 h-5" />
              Have Questions?
            </Button>
          </div>

          {/* What to Expect */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="glass-card rounded-2xl p-8 md:p-12"
          >
            <h3 className="text-xl font-bold mb-6 text-secondary">Your Journey Starts With:</h3>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-left">
                <div className="w-10 h-10 rounded-full bg-secondary text-secondary-foreground flex items-center justify-center font-bold mb-4">
                  1
                </div>
                <h4 className="font-semibold mb-2">Discovery Call</h4>
                <p className="text-muted-foreground text-sm">
                  We learn about your goals, concerns, and what's not working.
                </p>
              </div>
              <div className="text-left">
                <div className="w-10 h-10 rounded-full bg-secondary text-secondary-foreground flex items-center justify-center font-bold mb-4">
                  2
                </div>
                <h4 className="font-semibold mb-2">Genetic & Lab Testing</h4>
                <p className="text-muted-foreground text-sm">
                  Simple at-home collection. Results in 2-3 weeks with full analysis.
                </p>
              </div>
              <div className="text-left">
                <div className="w-10 h-10 rounded-full bg-secondary text-secondary-foreground flex items-center justify-center font-bold mb-4">
                  3
                </div>
                <h4 className="font-semibold mb-2">Your Custom Protocol</h4>
                <p className="text-muted-foreground text-sm">
                  Nutrition, training, supplements, and coaching—all personalized.
                </p>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default CTASection;
