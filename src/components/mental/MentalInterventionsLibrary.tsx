import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { 
  Search, 
  Lightbulb, 
  Sun, 
  Target, 
  Heart, 
  Apple, 
  Brain, 
  Shield, 
  Zap, 
  Smartphone, 
  Coffee, 
  Sparkles,
  Clock
} from 'lucide-react';
import { useMentalInterventions } from '@/hooks/useMentalPerformance';
import { mentalPhenotypeLabels, mentalTierLabels } from '@/types/mentalPerformance';

const categoryConfig: Record<string, { label: string; icon: any; color: string }> = {
  circadian: { label: 'Circadian Optimization', icon: Sun, color: 'text-yellow-500' },
  attention: { label: 'Attention Training', icon: Target, color: 'text-blue-500' },
  stress: { label: 'Stress Management', icon: Shield, color: 'text-red-500' },
  nutrition: { label: 'Brain Nutrition', icon: Apple, color: 'text-green-500' },
  cognitive: { label: 'Cognitive Training', icon: Brain, color: 'text-purple-500' },
  regulation: { label: 'Nervous System', icon: Heart, color: 'text-pink-500' },
  performance: { label: 'Peak Performance', icon: Zap, color: 'text-amber-500' },
  environment: { label: 'Environment', icon: Smartphone, color: 'text-slate-500' },
  stimulant: { label: 'Stimulant Management', icon: Coffee, color: 'text-orange-500' },
  meditation: { label: 'Mindfulness', icon: Sparkles, color: 'text-indigo-500' },
};

const tierBadgeVariants: Record<string, string> = {
  cognitive_foundations: 'bg-green-100 text-green-800',
  performance_optimization: 'bg-blue-100 text-blue-800',
  elite_cognition: 'bg-purple-100 text-purple-800',
};

export function MentalInterventionsLibrary() {
  const { interventions, loading } = useMentalInterventions();
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [tierFilter, setTierFilter] = useState<string>('all');

  const filteredInterventions = interventions.filter(intervention => {
    const matchesSearch = 
      intervention.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      intervention.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || intervention.category === categoryFilter;
    const matchesTier = tierFilter === 'all' || intervention.program_tiers?.includes(tierFilter as any);
    return matchesSearch && matchesCategory && matchesTier;
  });

  const groupedInterventions = filteredInterventions.reduce((acc, intervention) => {
    const category = intervention.category;
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(intervention);
    return acc;
  }, {} as Record<string, typeof interventions>);

  const categories = [...new Set(interventions.map(i => i.category))];

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Lightbulb className="h-5 w-5" />
              Brain Optimization Protocols
            </CardTitle>
            <CardDescription>
              Evidence-based interventions for cognitive enhancement
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
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
            <SelectTrigger className="w-[200px]">
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
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Program Tier" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Tiers</SelectItem>
              <SelectItem value="cognitive_foundations">Cognitive Foundations</SelectItem>
              <SelectItem value="performance_optimization">Performance Optimization</SelectItem>
              <SelectItem value="elite_cognition">Elite Cognition</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Interventions List */}
        {Object.keys(groupedInterventions).length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No interventions found matching your criteria
          </div>
        ) : (
          <Accordion type="multiple" className="space-y-2">
            {Object.entries(groupedInterventions).map(([category, items]) => {
              const config = categoryConfig[category] || { 
                label: category, 
                icon: Lightbulb, 
                color: 'text-gray-500' 
              };
              const IconComponent = config.icon;

              return (
                <AccordionItem key={category} value={category} className="border rounded-lg px-4">
                  <AccordionTrigger className="hover:no-underline">
                    <div className="flex items-center gap-3">
                      <IconComponent className={`h-5 w-5 ${config.color}`} />
                      <span className="font-semibold">{config.label}</span>
                      <Badge variant="secondary" className="ml-2">
                        {items.length} protocols
                      </Badge>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-4 pt-2">
                      {items.map(intervention => (
                        <div 
                          key={intervention.id} 
                          className="border rounded-lg p-4 bg-muted/30 hover:bg-muted/50 transition-colors"
                        >
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <h4 className="font-medium">{intervention.name}</h4>
                              <p className="text-sm text-muted-foreground mt-1">
                                {intervention.description}
                              </p>
                            </div>
                            {intervention.duration_days && (
                              <Badge variant="outline" className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {intervention.duration_days} days
                              </Badge>
                            )}
                          </div>
                          
                          {intervention.instructions && (
                            <div className="mt-3 p-3 bg-background rounded-md text-sm">
                              <strong>Instructions:</strong> {intervention.instructions}
                            </div>
                          )}
                          
                          <div className="mt-3 flex flex-wrap gap-2">
                            {intervention.target_phenotypes?.map(phenotype => (
                              <Badge 
                                key={phenotype} 
                                variant="outline" 
                                className="text-xs"
                              >
                                {mentalPhenotypeLabels[phenotype]}
                              </Badge>
                            ))}
                          </div>
                          
                          <div className="mt-2 flex flex-wrap gap-2">
                            {intervention.program_tiers?.map(tier => (
                              <Badge 
                                key={tier} 
                                className={tierBadgeVariants[tier]}
                              >
                                {mentalTierLabels[tier]}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              );
            })}
          </Accordion>
        )}
      </CardContent>
    </Card>
  );
}
