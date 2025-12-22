import { motion } from 'framer-motion';
import { ArrowRight, Pill, Shield, Sparkles, Leaf, Zap, Brain } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

const supplements = [
  {
    name: 'Foundation Multi',
    description: 'Complete daily vitamin complex based on your genetic needs',
    icon: Shield,
    color: 'from-secondary to-secondary/60',
  },
  {
    name: 'Omega Elite',
    description: 'Premium fish oil for cognitive and cardiovascular support',
    icon: Sparkles,
    color: 'from-primary to-primary/60',
  },
  {
    name: 'Vitality Greens',
    description: 'Organic superfoods blend for energy and detoxification',
    icon: Leaf,
    color: 'from-secondary to-primary',
  },
  {
    name: 'Rest & Recover',
    description: 'Adaptogen blend for stress, sleep, and muscle recovery',
    icon: Pill,
    color: 'from-primary/80 to-secondary/80',
  },
  {
    name: 'Neuro Focus',
    description: 'Cognitive enhancers for mental clarity and brain performance',
    icon: Brain,
    color: 'from-primary to-secondary/70',
  },
  {
    name: 'Metabolic Boost',
    description: 'Metabolism support for energy production and weight management',
    icon: Zap,
    color: 'from-secondary/80 to-primary/80',
  },
];

const SupplementsSection = () => {
  return (
    <section id="supplements" className="py-24 lg:py-32 relative overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-secondary/5" />
      
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
              Precision Supplementation
            </span>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6">
              Supplements Designed for{' '}
              <span className="text-gradient">Your DNA</span>
            </h2>
            <p className="text-muted-foreground text-lg mb-6 leading-relaxed">
              Stop wasting money on generic vitamins your body may not even need. Our supplement line 
              is formulated to address the specific deficiencies revealed by your genetic testing and lab work.
            </p>
            <p className="text-muted-foreground text-lg mb-8 leading-relaxed">
              Each product is premium-quality, third-party tested, and designed to work synergistically 
              with your personalized health protocol.
            </p>

            <div className="flex flex-wrap gap-4">
              <Button variant="hero" size="lg" asChild>
                <Link to="/supplements">
                  Shop Supplements
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Link>
              </Button>
              <Button variant="heroOutline" size="lg">
                View Your Protocol
              </Button>
            </div>

            {/* Trust badges */}
            <div className="flex flex-wrap gap-6 mt-8 pt-8 border-t border-border/50">
              <div className="text-center">
                <p className="text-2xl font-bold text-foreground">GMP</p>
                <p className="text-xs text-muted-foreground">Certified</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-foreground">3rd Party</p>
                <p className="text-xs text-muted-foreground">Tested</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-foreground">USA</p>
                <p className="text-xs text-muted-foreground">Manufactured</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-foreground">Methylated</p>
                <p className="text-xs text-muted-foreground">Ingredients</p>
              </div>
            </div>
          </motion.div>

          {/* Right - Product Grid */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="grid grid-cols-2 gap-4"
          >
            {supplements.map((product, index) => (
              <Link to="/supplements" key={product.name}>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 + 0.3 }}
                  className="glass-card rounded-2xl p-6 group hover:border-secondary/40 transition-all duration-300 cursor-pointer"
                >
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${product.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                    <product.icon className="w-6 h-6 text-background" />
                  </div>
                  <h3 className="font-bold text-lg mb-2 group-hover:text-secondary transition-colors">
                    {product.name}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {product.description}
                  </p>
                </motion.div>
              </Link>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default SupplementsSection;
