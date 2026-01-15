import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { 
  Search, 
  Clock, 
  Brain, 
  Pill, 
  Home, 
  Activity,
  Zap,
  Target,
  CheckCircle2,
  Info,
} from 'lucide-react';
import { useSleepInterventions } from '@/hooks/useSleepProgram';
import { 
  sleepPhenotypeLabels,
  SleepPhenotype,
  SleepProgramTier,
} from '@/types/sleep';

const categoryConfig: Record<string, { label: string; icon: any; color: string }> = {
  behavioral: { label: 'Behavioral', icon: Brain, color: 'bg-blue-500/10 text-blue-600 border-blue-500/20' },
  nutrition: { label: 'Nutrition', icon: Zap, color: 'bg-green-500/10 text-green-600 border-green-500/20' },
  supplement: { label: 'Supplement', icon: Pill, color: 'bg-purple-500/10 text-purple-600 border-purple-500/20' },
  environment: { label: 'Environment', icon: Home, color: 'bg-orange-500/10 text-orange-600 border-orange-500/20' },
  nervous_system: { label: 'Nervous System', icon: Activity, color: 'bg-pink-500/10 text-pink-600 border-pink-500/20' },
};

const tierBadgeVariants: Record<SleepProgramTier, 'outline' | 'secondary' | 'default'> = {
  foundational: 'outline',
  advanced: 'secondary',
  elite: 'default',
};

export function SleepInterventionsLibrary() {
  const { interventions, loading } = useSleepInterventions();
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [tierFilter, setTierFilter] = useState<string>('all');

  const filteredInterventions = interventions.filter(intervention => {
    const matchesSearch = 
      intervention.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      intervention.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      intervention.instructions?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || intervention.category === categoryFilter;
    const matchesTier = tierFilter === 'all' || intervention.program_tiers.includes(tierFilter as SleepProgramTier);
    return matchesSearch && matchesCategory && matchesTier;
  });

  // Group by category
  const groupedInterventions = filteredInterventions.reduce((acc, intervention) => {
    const category = intervention.category;
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(intervention);
    return acc;
  }, {} as Record<string, typeof interventions>);

  const categories = Object.keys(categoryConfig);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="h-5 w-5" />
          Intervention Library
        </CardTitle>
        <CardDescription>
          Evidence-based sleep optimization protocols for each phenotype and tier
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search interventions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map(cat => (
                <SelectItem key={cat} value={cat}>
                  {categoryConfig[cat]?.label || cat}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={tierFilter} onValueChange={setTierFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Program Tier" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Tiers</SelectItem>
              <SelectItem value="foundational">Foundational</SelectItem>
              <SelectItem value="advanced">Advanced</SelectItem>
              <SelectItem value="elite">Elite</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Interventions List */}
        {loading ? (
          <div className="h-64 flex items-center justify-center text-muted-foreground">
            Loading interventions...
          </div>
        ) : filteredInterventions.length === 0 ? (
          <div className="h-64 flex flex-col items-center justify-center text-muted-foreground">
            <Info className="h-12 w-12 mb-4 opacity-50" />
            <p>No interventions match your filters</p>
            <Button 
              variant="link" 
              onClick={() => {
                setSearchQuery('');
                setCategoryFilter('all');
                setTierFilter('all');
              }}
            >
              Clear filters
            </Button>
          </div>
        ) : (
          <Accordion type="multiple" className="space-y-4">
            {Object.entries(groupedInterventions).map(([category, items]) => {
              const config = categoryConfig[category] || { 
                label: category, 
                icon: Activity, 
                color: 'bg-gray-500/10 text-gray-600' 
              };
              const CategoryIcon = config.icon;

              return (
                <div key={category} className="space-y-2">
                  <div className="flex items-center gap-2 px-1">
                    <div className={`p-1.5 rounded ${config.color}`}>
                      <CategoryIcon className="h-4 w-4" />
                    </div>
                    <h3 className="font-semibold">{config.label}</h3>
                    <Badge variant="outline" className="ml-auto">
                      {items.length} {items.length === 1 ? 'protocol' : 'protocols'}
                    </Badge>
                  </div>
                  
                  {items.map((intervention) => (
                    <AccordionItem 
                      key={intervention.id} 
                      value={intervention.id}
                      className="border rounded-lg px-4"
                    >
                      <AccordionTrigger className="hover:no-underline py-3">
                        <div className="flex items-center gap-4 text-left w-full pr-4">
                          <div className="flex-1">
                            <div className="font-medium">{intervention.name}</div>
                            <p className="text-sm text-muted-foreground line-clamp-1">
                              {intervention.description}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            {intervention.duration_days && (
                              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                <Clock className="h-3 w-3" />
                                {intervention.duration_days}d
                              </div>
                            )}
                            <div className="flex gap-1">
                              {intervention.program_tiers.map(tier => (
                                <Badge 
                                  key={tier} 
                                  variant={tierBadgeVariants[tier]}
                                  className="text-xs"
                                >
                                  {tier.charAt(0).toUpperCase()}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="pb-4">
                        <div className="space-y-4 pt-2">
                          {/* Instructions */}
                          {intervention.instructions && (
                            <div className="p-4 rounded-lg bg-muted/50">
                              <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                                <CheckCircle2 className="h-4 w-4 text-green-600" />
                                Protocol Instructions
                              </h4>
                              <p className="text-sm text-muted-foreground">
                                {intervention.instructions}
                              </p>
                            </div>
                          )}

                          {/* Target Phenotypes */}
                          {intervention.target_phenotypes.length > 0 && (
                            <div>
                              <h4 className="text-sm font-medium mb-2">Target Sleep Phenotypes</h4>
                              <div className="flex flex-wrap gap-2">
                                {intervention.target_phenotypes.map(phenotype => (
                                  <Badge key={phenotype} variant="outline">
                                    {sleepPhenotypeLabels[phenotype]}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Program Tiers */}
                          <div>
                            <h4 className="text-sm font-medium mb-2">Available in Tiers</h4>
                            <div className="flex flex-wrap gap-2">
                              {intervention.program_tiers.map(tier => (
                                <Badge key={tier} variant={tierBadgeVariants[tier]}>
                                  {tier === 'foundational' && 'Sleep Reset Protocol'}
                                  {tier === 'advanced' && 'Circadian Optimization'}
                                  {tier === 'elite' && 'NeuroRecovery System'}
                                </Badge>
                              ))}
                            </div>
                          </div>

                          {/* Duration */}
                          {intervention.duration_days && (
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Clock className="h-4 w-4" />
                              Recommended duration: {intervention.duration_days} days
                            </div>
                          )}
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </div>
              );
            })}
          </Accordion>
        )}
      </CardContent>
    </Card>
  );
}
