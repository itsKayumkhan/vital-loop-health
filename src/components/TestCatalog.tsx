import { motion } from 'framer-motion';
import { Dna, FlaskConical, Activity, Brain, Heart, Leaf, Droplets, Zap, Microscope } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

interface Test {
  name: string;
  description: string;
  price: number;
}

interface TestCategory {
  id: string;
  name: string;
  icon: React.ElementType;
  tests: Test[];
}

// Sample test data - you can easily expand this
const testCategories: TestCategory[] = [
  {
    id: 'genetic',
    name: 'Genetic Testing',
    icon: Dna,
    tests: [
      { name: 'Genetic Blueprint Panel', description: 'Comprehensive DNA analysis for health optimization', price: 499 },
      { name: 'Methylation Genetics', description: 'MTHFR and methylation pathway analysis', price: 299 },
      { name: 'Detoxification Genes', description: 'Liver detox pathway genetic variants', price: 249 },
      { name: 'Nutrigenomics Panel', description: 'How your genes respond to nutrients', price: 349 },
      { name: 'Athletic Performance DNA', description: 'Muscle fiber, recovery, and endurance genetics', price: 399 },
    ],
  },
  {
    id: 'precision-labs',
    name: 'Precision Labs',
    icon: Microscope,
    tests: [
      { name: 'Complete Precision Panel', description: 'Comprehensive analysis combining all precision lab markers for total health insight', price: 899 },
      { name: 'Core Metabolic & Energy', description: 'Foundational markers for metabolic health and cellular energy production', price: 199 },
      { name: 'Inflammation & Immunity', description: 'Key inflammatory and immune system biomarkers', price: 179 },
      { name: 'Micronutrient & Mineral', description: 'Essential vitamins and minerals for optimal function', price: 189 },
      { name: 'Thyroid Signal', description: 'Complete thyroid function and signaling assessment', price: 169 },
      { name: 'Lipids & Cardiovascular Baseline', description: 'Advanced lipid analysis and heart health markers', price: 199 },
      { name: 'Hormonal Signal', description: 'Key hormone levels and endocrine function markers', price: 219 },
    ],
  },
  {
    id: 'hormone',
    name: 'Hormone Panels',
    icon: Activity,
    tests: [
      { name: 'Complete Hormone Panel', description: 'Full male/female hormone assessment', price: 399 },
      { name: 'Thyroid Complete', description: 'TSH, T3, T4, antibodies, and reverse T3', price: 199 },
      { name: 'Adrenal Stress Panel', description: 'Cortisol rhythm and DHEA levels', price: 249 },
      { name: 'Testosterone Optimization', description: 'Free, total, and bioavailable testosterone', price: 179 },
      { name: 'Female Hormone Cycle', description: 'Estrogen, progesterone, and cycle mapping', price: 279 },
    ],
  },
  {
    id: 'metabolic',
    name: 'Metabolic Testing',
    icon: Zap,
    tests: [
      { name: 'Advanced Lipid Panel', description: 'Beyond basic cholesterol—particle size and more', price: 199 },
      { name: 'Insulin Resistance Panel', description: 'Fasting insulin, glucose, and HOMA-IR', price: 149 },
      { name: 'Metabolic Syndrome Screen', description: 'Complete metabolic health assessment', price: 249 },
      { name: 'Organic Acids Test', description: 'Cellular energy and mitochondrial function', price: 349 },
    ],
  },
  {
    id: 'gut',
    name: 'Gut Health',
    icon: Leaf,
    tests: [
      { name: 'Complete Microbiome Analysis', description: 'Full gut bacteria mapping and diversity', price: 449 },
      { name: 'Food Sensitivity Panel', description: 'IgG reactions to 150+ foods', price: 349 },
      { name: 'Leaky Gut Assessment', description: 'Zonulin and intestinal permeability', price: 199 },
      { name: 'SIBO Breath Test', description: 'Small intestinal bacterial overgrowth', price: 249 },
      { name: 'Digestive Function Panel', description: 'Enzymes, absorption, and inflammation markers', price: 299 },
    ],
  },
  {
    id: 'vitamin',
    name: 'Vitamin & Mineral',
    icon: Droplets,
    tests: [
      { name: 'Complete Vitamin Panel', description: 'All essential vitamins including D, B12, folate', price: 199 },
      { name: 'Mineral & Electrolyte Panel', description: 'Magnesium, zinc, copper, selenium, and more', price: 179 },
      { name: 'Iron Studies Complete', description: 'Ferritin, TIBC, iron saturation', price: 129 },
      { name: 'Omega Fatty Acid Test', description: 'Omega-3/6 ratio and inflammation index', price: 149 },
      { name: 'Antioxidant Status', description: 'Glutathione, CoQ10, and vitamin E levels', price: 199 },
    ],
  },
  {
    id: 'cardiovascular',
    name: 'Cardiovascular',
    icon: Heart,
    tests: [
      { name: 'Advanced Cardiac Panel', description: 'CRP, homocysteine, Lp(a), and ApoB', price: 299 },
      { name: 'Inflammation Markers', description: 'hs-CRP, fibrinogen, and cytokines', price: 199 },
      { name: 'Vascular Health Screen', description: 'Endothelial function and arterial health', price: 349 },
    ],
  },
  {
    id: 'brain',
    name: 'Brain & Cognitive',
    icon: Brain,
    tests: [
      { name: 'Neurotransmitter Panel', description: 'Serotonin, dopamine, GABA, and more', price: 349 },
      { name: 'Brain Health Markers', description: 'BDNF, inflammation, and cognitive biomarkers', price: 299 },
      { name: 'Heavy Metal Toxicity', description: 'Lead, mercury, arsenic, and cadmium levels', price: 249 },
    ],
  },
];

const TestCatalog = () => {
  return (
    <section className="py-16 relative">
      <div className="container mx-auto px-4 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Biomarker <span className="text-gradient">Intelligence</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Select targeted tests designed to deliver accurate, actionable insights 
            specific to your health goals. Each test includes detailed results and personalized recommendations.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-4xl mx-auto"
        >
          <Accordion type="multiple" className="space-y-4">
            {testCategories.map((category) => (
              <AccordionItem
                key={category.id}
                value={category.id}
                className="glass-card rounded-xl border-secondary/20 px-6 overflow-hidden"
              >
                <AccordionTrigger className="hover:no-underline py-5">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-secondary/10 flex items-center justify-center">
                      <category.icon className="w-6 h-6 text-secondary" />
                    </div>
                    <div className="text-left">
                      <h3 className="text-xl font-semibold">{category.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        {category.tests.length} tests available
                      </p>
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="pb-6">
                  <div className="space-y-3 pt-2">
                    {category.tests.map((test, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-4 rounded-lg bg-background/50 border border-border/50 hover:border-secondary/30 transition-colors"
                      >
                        <div className="flex-1 pr-4">
                          <h4 className="font-medium text-foreground">{test.name}</h4>
                          <p className="text-sm text-muted-foreground">{test.description}</p>
                        </div>
                        <div className="flex items-center gap-4">
                          {test.price > 0 ? (
                            <>
                              <span className="text-xl font-bold text-foreground whitespace-nowrap">
                                ${test.price}
                              </span>
                              <Button variant="heroOutline" size="sm">
                                Order
                              </Button>
                            </>
                          ) : (
                            <Button variant="heroOutline" size="sm">
                              Learn More
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center text-muted-foreground text-sm mt-8"
        >
          Bundle multiple tests and save. Contact us for custom panel pricing.
        </motion.p>
      </div>
    </section>
  );
};

export default TestCatalog;
