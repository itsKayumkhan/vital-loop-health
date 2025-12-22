import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { ArrowLeft, ShoppingCart, Sparkles, Shield, Leaf, Pill, Brain, Zap, Package } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const supplements = [
  {
    id: 1,
    name: 'Vitamin D3 + K2',
    description: 'Optimal bone health and immune support with enhanced absorption',
    icon: Sparkles,
    benefits: ['Bone density', 'Immune function', 'Mood support'],
    price: 49.99,
    category: 'Essential',
  },
  {
    id: 2,
    name: 'Omega-3 Complex',
    description: 'High-potency fish oil for heart, brain, and joint health',
    icon: Shield,
    benefits: ['Heart health', 'Brain function', 'Joint support'],
    price: 54.99,
    category: 'Essential',
  },
  {
    id: 3,
    name: 'Methylated B-Complex',
    description: 'Active B vitamins for energy, metabolism, and nervous system',
    icon: Leaf,
    benefits: ['Energy production', 'Stress response', 'Cellular health'],
    price: 44.99,
    category: 'Essential',
  },
  {
    id: 4,
    name: 'Adaptogen Stack',
    description: 'Premium blend for stress resilience and recovery',
    icon: Pill,
    benefits: ['Stress management', 'Sleep quality', 'Recovery'],
    price: 59.99,
    category: 'Performance',
  },
  {
    id: 5,
    name: 'Neuro Focus',
    description: 'Cognitive enhancers for mental clarity and brain performance',
    icon: Brain,
    benefits: ['Mental clarity', 'Focus', 'Memory support'],
    price: 64.99,
    category: 'Performance',
  },
  {
    id: 6,
    name: 'Metabolic Boost',
    description: 'Metabolism support for energy production and weight management',
    icon: Zap,
    benefits: ['Metabolism', 'Energy', 'Body composition'],
    price: 54.99,
    category: 'Performance',
  },
];

const comboPacks = [
  {
    id: 7,
    name: 'Essential Foundation Pack',
    description: 'Complete daily essentials: D3+K2, Omega-3, and B-Complex for total wellness coverage',
    includes: ['Vitamin D3 + K2', 'Omega-3 Complex', 'Methylated B-Complex'],
    originalPrice: 149.97,
    price: 129.99,
    savings: 19.98,
    icon: Package,
    featured: true,
  },
  {
    id: 8,
    name: 'Performance Stack',
    description: 'Optimize mind and body: Neuro Focus, Adaptogen Stack, and Metabolic Boost for peak performance',
    includes: ['Neuro Focus', 'Adaptogen Stack', 'Metabolic Boost'],
    originalPrice: 179.97,
    price: 149.99,
    savings: 29.98,
    icon: Package,
    featured: false,
  },
];

const Supplements = () => {
  return (
    <>
      <Helmet>
        <title>Precision Supplements | VitalityX</title>
        <meta name="description" content="Science-backed supplements formulated based on your unique genetic profile and biomarkers. Personalized nutrition for optimal health." />
      </Helmet>

      <Navbar />

      <main className="min-h-screen pt-24 pb-16">
        <div className="container mx-auto px-4 lg:px-8">
          {/* Back Link */}
          <Link to="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-secondary transition-colors mb-8">
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>

          {/* Hero Section */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <Badge variant="outline" className="mb-4 border-secondary/50 text-secondary">
              Precision Supplementation
            </Badge>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
              Supplements Designed for{' '}
              <span className="text-gradient">Your Biology</span>
            </h1>
            <p className="text-muted-foreground text-lg md:text-xl max-w-3xl mx-auto">
              Every formula is crafted using insights from your genetic data and biomarker analysis. 
              No guesswork — just science-backed supplementation tailored to your needs.
            </p>
          </motion.div>

          {/* Combo Packs Section */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="mb-16"
          >
            <h2 className="text-2xl md:text-3xl font-bold mb-8 text-center">
              Value Bundles
            </h2>
            <div className="grid md:grid-cols-2 gap-8">
              {comboPacks.map((pack, index) => (
                <motion.div
                  key={pack.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <Card className="h-full glass-card border-secondary/30 hover:border-secondary/60 transition-all duration-300 relative overflow-hidden">
                    {pack.featured && (
                      <div className="absolute top-4 right-4">
                        <Badge className="bg-secondary text-secondary-foreground">Best Value</Badge>
                      </div>
                    )}
                    <CardHeader>
                      <div className="w-14 h-14 rounded-2xl bg-secondary/20 flex items-center justify-center mb-4">
                        <pack.icon className="w-7 h-7 text-secondary" />
                      </div>
                      <CardTitle className="text-2xl">{pack.name}</CardTitle>
                      <CardDescription className="text-base">{pack.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3 mb-6">
                        <p className="text-sm font-medium text-muted-foreground">Includes:</p>
                        <ul className="space-y-2">
                          {pack.includes.map((item) => (
                            <li key={item} className="flex items-center gap-2 text-sm">
                              <div className="w-1.5 h-1.5 rounded-full bg-secondary" />
                              {item}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div className="flex items-baseline gap-3">
                        <span className="text-3xl font-bold">${pack.price}</span>
                        <span className="text-muted-foreground line-through">${pack.originalPrice}</span>
                        <Badge variant="secondary" className="bg-green-500/20 text-green-400 border-green-500/30">
                          Save ${pack.savings.toFixed(2)}
                        </Badge>
                      </div>
                    </CardContent>
                    <CardFooter>
                      <Button className="w-full" size="lg" disabled>
                        <ShoppingCart className="w-4 h-4 mr-2" />
                        Coming Soon
                      </Button>
                    </CardFooter>
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Individual Supplements */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-2xl md:text-3xl font-bold mb-8 text-center">
              Individual Supplements
            </h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {supplements.map((supplement, index) => (
                <motion.div
                  key={supplement.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <Card className="h-full glass-card hover:border-secondary/40 transition-all duration-300">
                    <CardHeader>
                      <div className="flex items-start justify-between mb-2">
                        <div className="w-12 h-12 rounded-xl bg-secondary/10 flex items-center justify-center">
                          <supplement.icon className="w-6 h-6 text-secondary" />
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {supplement.category}
                        </Badge>
                      </div>
                      <CardTitle className="text-xl">{supplement.name}</CardTitle>
                      <CardDescription>{supplement.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-2 mb-4">
                        {supplement.benefits.map((benefit) => (
                          <span
                            key={benefit}
                            className="px-2 py-1 text-xs rounded-full bg-muted text-muted-foreground"
                          >
                            {benefit}
                          </span>
                        ))}
                      </div>
                      <p className="text-2xl font-bold">${supplement.price}</p>
                    </CardContent>
                    <CardFooter>
                      <Button variant="outline" className="w-full" disabled>
                        <ShoppingCart className="w-4 h-4 mr-2" />
                        Coming Soon
                      </Button>
                    </CardFooter>
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* CTA Section */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="mt-20 text-center glass-card rounded-3xl p-12"
          >
            <h2 className="text-2xl md:text-3xl font-bold mb-4">
              Not Sure What You Need?
            </h2>
            <p className="text-muted-foreground text-lg mb-8 max-w-2xl mx-auto">
              Start with a genetic panel or comprehensive biomarker test. 
              We'll recommend the exact supplements your body needs.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg">
                <Link to="/pricing">View Testing Packages</Link>
              </Button>
              <Button variant="outline" size="lg" asChild>
                <Link to="/#contact">Book a Consultation</Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </main>

      <Footer />
    </>
  );
};

export default Supplements;
