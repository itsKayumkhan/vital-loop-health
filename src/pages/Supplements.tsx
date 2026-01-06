import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { ArrowLeft, ShoppingCart, Package, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { supplements } from '@/data/supplements';


const comboPacks = [
  {
    id: 'foundational-bundle-men',
    name: 'Foundational Bundle (Men)',
    description: 'Complete foundation for men\'s health with methylation support, omega-3s, and cellular energy.',
    includes: ['MethylGeniX Men', 'OmegaCore', 'CelluCore'],
    icon: Package,
    featured: true,
    price: 239.00,
  },
  {
    id: 'foundational-bundle-women',
    name: 'Foundational Bundle (Women)',
    description: 'Complete foundation for women\'s health with methylation support, omega-3s, and cellular energy.',
    includes: ['MethylGeniX Women', 'OmegaCore', 'CelluCore'],
    icon: Package,
    featured: true,
    price: 239.00,
  },
  {
    id: 'longevity-bundle',
    name: 'Longevity Bundle',
    description: 'Advanced anti-aging support with NAD+ precursors, gut health, and cognitive enhancement.',
    includes: ['NADiGenix / CelluVive+', 'GutGeniX', 'NeuroSync'],
    icon: Package,
    featured: false,
    price: 217.00,
  },
  {
    id: 'metabolic-bundle',
    name: 'Metabolic Bundle',
    description: 'Optimize metabolic health with blood sugar support, cardiovascular function, and omega-3s.',
    includes: ['GlucoSync+', 'CardiaGeniX', 'OmegaCore'],
    icon: Package,
    featured: false,
    price: 189.00,
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
                        <span className="text-3xl font-bold text-secondary">${pack.price.toFixed(2)}</span>
                      </div>
                    </CardContent>
                    <CardFooter>
                      <Button className="w-full" size="lg">
                        <ShoppingCart className="w-4 h-4 mr-2" />
                        Add Bundle to Cart
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
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {supplements.map((supplement, index) => (
                <motion.div
                  key={supplement.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.05 }}
                >
                  <Card className="h-full glass-card hover:border-secondary/40 transition-all duration-300 group">
                    <CardHeader className="p-0">
                      <div className="relative overflow-hidden rounded-t-lg bg-gradient-to-b from-muted/50 to-muted/20">
                        <img 
                          src={supplement.image} 
                          alt={supplement.name}
                          className="w-full h-48 object-contain p-4 group-hover:scale-105 transition-transform duration-300"
                        />
                        <Badge 
                          variant="outline" 
                          className="absolute top-3 right-3 text-xs bg-background/80 backdrop-blur-sm"
                        >
                          {supplement.category}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-4">
                      <CardTitle className="text-lg mb-1">{supplement.name}</CardTitle>
                      <p className="text-xs text-muted-foreground mb-2">{supplement.form}</p>
                      <CardDescription className="text-sm line-clamp-2 mb-3">
                        {supplement.description}
                      </CardDescription>
                      <div className="flex flex-wrap gap-1.5 mb-3">
                        {supplement.benefits.map((benefit) => (
                          <span
                            key={benefit}
                            className="px-2 py-0.5 text-xs rounded-full bg-secondary/10 text-secondary border border-secondary/20"
                          >
                            {benefit}
                          </span>
                        ))}
                      </div>
                      <p className="text-xl font-bold text-secondary mb-2">${supplement.price.toFixed(2)}</p>
                      <div className="flex flex-wrap gap-1">
                        {supplement.tags.map((tag) => (
                          <span
                            key={tag}
                            className="px-1.5 py-0.5 text-[10px] rounded bg-muted text-muted-foreground"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </CardContent>
                    <CardFooter className="pt-0 flex gap-2">
                      <Link to={`/supplements/${supplement.id}`} className="flex-1">
                        <Button variant="ghost" className="w-full" size="sm">
                          <Eye className="w-3.5 h-3.5 mr-2" />
                          Details
                        </Button>
                      </Link>
                      <Button variant="outline" className="flex-1" size="sm">
                        <ShoppingCart className="w-3.5 h-3.5 mr-2" />
                        Add
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
