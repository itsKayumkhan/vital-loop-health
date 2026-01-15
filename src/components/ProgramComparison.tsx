import { useState } from 'react';
import { motion } from 'framer-motion';
import { Check, X, Sparkles, Moon, Brain, Package, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface ComparisonTier {
  program: string;
  programIcon: React.ComponentType<{ className?: string }>;
  tiers: {
    name: string;
    price: number;
    tagline: string;
    keyFeatures: string[];
  }[];
}

const comparisonData: ComparisonTier[] = [
  {
    program: 'Wellness',
    programIcon: Sparkles,
    tiers: [
      {
        name: 'Ignite',
        price: 179,
        tagline: 'Your Personal Health Blueprint',
        keyFeatures: [
          'Dedicated Health Architect',
          '1x monthly coaching session',
          'Baseline + semi-annual labs',
          'Wearable integration',
          '90-day personalized protocol',
          '10% supplement discount',
        ],
      },
      {
        name: 'Elevate',
        price: 339,
        tagline: 'Metabolic & Performance',
        keyFeatures: [
          'Everything in Ignite',
          'Bi-weekly coaching sessions',
          'CGM Sprint (2x/year)',
          'Monthly PT session',
          'VO2max programming',
          '15% supplement discount',
        ],
      },
      {
        name: 'Transcend',
        price: 649,
        tagline: 'Longevity Strategy',
        keyFeatures: [
          'Everything in Elevate',
          'Weekly coaching + PT',
          'Quarterly lab monitoring',
          'Sleep optimization pathway',
          'VIP priority scheduling',
          '20% supplement discount',
        ],
      },
    ],
  },
  {
    program: 'Sleep',
    programIcon: Moon,
    tiers: [
      {
        name: 'Foundational',
        price: 149,
        tagline: 'Sleep Fundamentals',
        keyFeatures: [
          'Sleep phenotype analysis',
          'Weekly check-ins',
          'Sleep hygiene protocol',
          'Environment optimization',
          'Relaxation techniques',
          'Email support',
        ],
      },
      {
        name: 'Advanced',
        price: 279,
        tagline: 'Deep Sleep Optimization',
        keyFeatures: [
          'Everything in Foundational',
          'Bi-weekly 1:1 coaching',
          'Wearable data analysis',
          'Circadian optimization',
          'Supplement protocol',
          'CBT-I techniques',
        ],
      },
      {
        name: 'Elite',
        price: 449,
        tagline: 'Complete Sleep Mastery',
        keyFeatures: [
          'Everything in Advanced',
          'Weekly 1:1 coaching',
          'At-home sleep study',
          'HRV & recovery analysis',
          'Travel protocols',
          'VIP scheduling',
        ],
      },
    ],
  },
  {
    program: 'Mental Performance',
    programIcon: Brain,
    tiers: [
      {
        name: 'Cognitive Foundations',
        price: 149,
        tagline: 'Mental Clarity Essentials',
        keyFeatures: [
          'Cognitive assessment',
          'Phenotype analysis',
          'Focus protocols',
          'Mindfulness library',
          'Brain nutrition guide',
          'Email support',
        ],
      },
      {
        name: 'Performance Optimization',
        price: 279,
        tagline: 'Peak Mental Performance',
        keyFeatures: [
          'Everything in Foundations',
          'Bi-weekly 1:1 coaching',
          'HRV readiness tracking',
          'Nootropic protocol',
          'Flow state training',
          'Priority support',
        ],
      },
      {
        name: 'Elite Cognition',
        price: 449,
        tagline: 'Executive-Level Performance',
        keyFeatures: [
          'Everything in Performance',
          'Weekly 1:1 coaching',
          'Advanced cognitive testing',
          'Peak performance windows',
          'Burnout prevention',
          'VIP scheduling',
        ],
      },
    ],
  },
  {
    program: 'Bundle',
    programIcon: Package,
    tiers: [
      {
        name: 'Essential Recovery',
        price: 249,
        tagline: 'Save $49/mo',
        keyFeatures: [
          'Sleep Foundational',
          'Cognitive Foundations',
          'Unified dashboard',
          'Combined check-ins',
          'Cross-program insights',
          'Email support',
        ],
      },
      {
        name: 'Performance Recovery',
        price: 449,
        tagline: 'Save $109/mo',
        keyFeatures: [
          'Sleep Advanced',
          'Performance Optimization',
          'Bi-weekly coaching',
          'Combined HRV analysis',
          'Supplement synergies',
          'Priority support',
        ],
      },
      {
        name: 'Elite Recovery',
        price: 749,
        tagline: 'Save $149/mo',
        keyFeatures: [
          'Sleep Elite',
          'Elite Cognition',
          'Weekly coaching',
          'Advanced testing',
          'Executive protocols',
          'VIP scheduling',
        ],
      },
    ],
  },
];

// Common features to compare across all programs
const featureCategories = [
  {
    name: 'Coaching',
    features: [
      { label: 'Weekly 1:1 Sessions', tiers: [false, false, true, false, false, true, false, false, true, false, false, true] },
      { label: 'Bi-weekly Sessions', tiers: [false, true, true, false, true, true, false, true, true, false, true, true] },
      { label: 'Monthly Check-ins', tiers: [true, true, true, true, true, true, true, true, true, true, true, true] },
    ],
  },
  {
    name: 'Testing & Analysis',
    features: [
      { label: 'Lab Testing', tiers: [true, true, true, false, false, false, false, false, false, false, false, false] },
      { label: 'CGM Program', tiers: [false, true, true, false, false, false, false, false, false, false, false, false] },
      { label: 'Wearable Integration', tiers: [true, true, true, false, true, true, false, true, true, false, true, true] },
      { label: 'Sleep Study', tiers: [false, false, false, false, false, true, false, false, false, false, false, true] },
      { label: 'Cognitive Testing', tiers: [false, false, false, false, false, false, true, true, true, true, true, true] },
    ],
  },
  {
    name: 'Protocols',
    features: [
      { label: 'Supplement Protocol', tiers: [true, true, true, false, true, true, false, true, true, false, true, true] },
      { label: 'Sleep Optimization', tiers: [false, false, true, true, true, true, false, false, true, true, true, true] },
      { label: 'Stress Management', tiers: [false, true, true, false, true, true, true, true, true, true, true, true] },
      { label: 'Travel Protocols', tiers: [false, false, true, false, false, true, false, false, false, false, false, true] },
    ],
  },
  {
    name: 'Support & Access',
    features: [
      { label: 'VIP Scheduling', tiers: [false, false, true, false, false, true, false, false, true, false, false, true] },
      { label: 'Priority Response', tiers: [false, true, true, false, true, true, false, true, true, false, true, true] },
      { label: 'Member Events', tiers: [false, false, true, false, false, true, false, false, true, false, false, true] },
    ],
  },
];

export const ProgramComparison = () => {
  const [expandedCategory, setExpandedCategory] = useState<string | null>('Coaching');
  const [highlightedTier, setHighlightedTier] = useState<number | null>(null);

  const allTiers = comparisonData.flatMap(program => 
    program.tiers.map(tier => ({
      ...tier,
      program: program.program,
      programIcon: program.programIcon,
    }))
  );

  return (
    <div className="py-8">
      {/* Quick overview cards - Mobile friendly */}
      <div className="block lg:hidden space-y-6 mb-12">
        {comparisonData.map((program, programIndex) => (
          <motion.div
            key={program.program}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: programIndex * 0.1 }}
            className="glass-card rounded-2xl p-6 border border-border/50"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-secondary/10 flex items-center justify-center">
                <program.programIcon className="w-5 h-5 text-secondary" />
              </div>
              <h3 className="text-xl font-bold">{program.program}</h3>
            </div>
            
            <div className="space-y-4">
              {program.tiers.map((tier, tierIndex) => (
                <div 
                  key={tier.name}
                  className={cn(
                    "rounded-xl p-4 border transition-all",
                    tierIndex === 1 
                      ? "border-secondary/50 bg-secondary/5" 
                      : "border-border/30 bg-muted/20"
                  )}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <p className="font-semibold">{tier.name}</p>
                      <p className="text-xs text-muted-foreground">{tier.tagline}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold">${tier.price}</p>
                      <p className="text-xs text-muted-foreground">/month</p>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-1 mt-3">
                    {tier.keyFeatures.slice(0, 3).map((feature) => (
                      <span 
                        key={feature}
                        className="text-xs bg-muted/50 text-muted-foreground px-2 py-1 rounded-full"
                      >
                        {feature}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Desktop comparison table */}
      <div className="hidden lg:block overflow-x-auto">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="min-w-[1200px]"
        >
          {/* Header row with all tiers */}
          <div className="grid grid-cols-13 gap-2 mb-6">
            <div className="col-span-1" /> {/* Empty corner cell */}
            {comparisonData.map((program) => (
              <div key={program.program} className="col-span-3 text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <program.programIcon className="w-5 h-5 text-secondary" />
                  <span className="font-bold text-lg">{program.program}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Tier names and prices */}
          <div className="grid grid-cols-13 gap-2 mb-8">
            <div className="col-span-1 flex items-end pb-4">
              <span className="text-sm font-medium text-muted-foreground">Tier Level</span>
            </div>
            {allTiers.map((tier, index) => (
              <motion.div
                key={`${tier.program}-${tier.name}`}
                className={cn(
                  "col-span-1 rounded-xl p-4 text-center transition-all cursor-pointer border",
                  index % 3 === 1 
                    ? "border-secondary/50 bg-secondary/5" 
                    : "border-border/30 bg-muted/10",
                  highlightedTier === index && "ring-2 ring-secondary"
                )}
                onMouseEnter={() => setHighlightedTier(index)}
                onMouseLeave={() => setHighlightedTier(null)}
                whileHover={{ scale: 1.02 }}
              >
                <p className="font-semibold text-sm mb-1 leading-tight min-h-[40px] flex items-center justify-center">
                  {tier.name}
                </p>
                <p className="text-2xl font-bold text-foreground">${tier.price}</p>
                <p className="text-xs text-muted-foreground">/month</p>
                <p className="text-xs text-secondary mt-2 font-medium">{tier.tagline}</p>
              </motion.div>
            ))}
          </div>

          {/* Feature categories */}
          <div className="space-y-4">
            {featureCategories.map((category) => (
              <div key={category.name} className="rounded-xl border border-border/30 overflow-hidden">
                <button
                  onClick={() => setExpandedCategory(
                    expandedCategory === category.name ? null : category.name
                  )}
                  className="w-full flex items-center justify-between px-4 py-3 bg-muted/30 hover:bg-muted/50 transition-colors"
                >
                  <span className="font-semibold">{category.name}</span>
                  {expandedCategory === category.name ? (
                    <ChevronUp className="w-5 h-5 text-muted-foreground" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-muted-foreground" />
                  )}
                </button>
                
                {expandedCategory === category.name && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="divide-y divide-border/20"
                  >
                    {category.features.map((feature) => (
                      <div 
                        key={feature.label}
                        className="grid grid-cols-13 gap-2 py-3 px-4 hover:bg-muted/20 transition-colors"
                      >
                        <div className="col-span-1 flex items-center">
                          <span className="text-sm text-muted-foreground">{feature.label}</span>
                        </div>
                        {feature.tiers.map((included, tierIndex) => (
                          <div 
                            key={tierIndex}
                            className={cn(
                              "col-span-1 flex items-center justify-center",
                              highlightedTier === tierIndex && "bg-secondary/10 rounded-lg"
                            )}
                          >
                            {included ? (
                              <Check className="w-5 h-5 text-secondary" />
                            ) : (
                              <X className="w-4 h-4 text-muted-foreground/40" />
                            )}
                          </div>
                        ))}
                      </div>
                    ))}
                  </motion.div>
                )}
              </div>
            ))}
          </div>

          {/* CTA row */}
          <div className="grid grid-cols-13 gap-2 mt-8">
            <div className="col-span-1" />
            {allTiers.map((tier, index) => (
              <div key={`cta-${tier.program}-${tier.name}`} className="col-span-1">
                <Button
                  variant={index % 3 === 1 ? 'hero' : 'heroOutline'}
                  size="sm"
                  className="w-full text-xs"
                >
                  Get Started
                </Button>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Price comparison summary */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="mt-12 text-center"
      >
        <div className="inline-flex items-center gap-3 bg-secondary/10 text-secondary px-6 py-3 rounded-full">
          <Package className="w-5 h-5" />
          <span className="font-semibold">
            Bundle & save up to $149/month when combining Sleep + Mental Performance
          </span>
        </div>
      </motion.div>

      <p className="text-center text-muted-foreground text-sm mt-8">
        All programs include access to our client portal. Cancel anytime with no hidden fees.
      </p>
    </div>
  );
};

export default ProgramComparison;
