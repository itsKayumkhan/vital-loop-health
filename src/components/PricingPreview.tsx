import { motion } from 'framer-motion';
import { ArrowRight, Sparkles, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

const tiers = [
  { name: 'Ignite', price: 149, tagline: 'Spark Your Transformation' },
  { name: 'Elevate', price: 299, tagline: 'Rise to Your Potential', popular: true },
  { name: 'Transcend', price: 599, tagline: 'Beyond Limits' },
];

const PricingPreview = () => {
  return (
    <section id="pricing" className="py-24 lg:py-32 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-secondary/5 to-transparent" />
      
      <div className="container mx-auto px-4 lg:px-8 relative">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="text-secondary font-semibold tracking-widest text-sm uppercase mb-4 block">
            Investment in You
          </span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6">
            Choose Your <span className="text-gradient">Path</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            From single tests to comprehensive transformation—find the plan that fits your goals. 
            All plans include detailed reports with personalized action plans.
          </p>
        </motion.div>

        {/* Quick tier preview */}
        <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto mb-12">
          {tiers.map((tier, index) => (
            <motion.div
              key={tier.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className={`relative rounded-2xl p-6 text-center transition-all duration-300 ${
                tier.popular
                  ? 'bg-gradient-to-b from-secondary/20 to-primary/10 border-2 border-secondary'
                  : 'glass-card border-border/50 hover:border-secondary/30'
              }`}
            >
              {tier.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="bg-secondary text-secondary-foreground px-3 py-1 rounded-full text-xs font-semibold">
                    Popular
                  </span>
                </div>
              )}
              <div className="w-10 h-10 rounded-xl bg-secondary/10 flex items-center justify-center mx-auto mb-3">
                <Sparkles className="w-5 h-5 text-secondary" />
              </div>
              <h3 className="text-xl font-bold mb-1">{tier.name}</h3>
              <p className="text-secondary text-xs font-medium mb-3">{tier.tagline}</p>
              <div className="mb-2">
                <span className="text-3xl font-bold">${tier.price}</span>
                <span className="text-muted-foreground text-sm">/mo</span>
              </div>
            </motion.div>
          ))}
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <Link to="/pricing">
            <Button variant="hero" size="lg">
              View All Plans & Pricing
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </Link>
          <p className="text-muted-foreground text-sm mt-4">
            Single tests available—begin your journey at your own pace.
          </p>
        </motion.div>
      </div>
    </section>
  );
};

export default PricingPreview;
