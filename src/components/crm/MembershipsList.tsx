import { useState } from 'react';
import { Crown, Search, Brain, Moon, Package } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useCRMMemberships, useCRMClients } from '@/hooks/useCRM';
import { 
  MembershipTier, 
  MembershipStatus, 
  CRMClient, 
  ProgramType,
  SleepMembershipTier,
  MentalPerformanceMembershipTier,
  BundleMembershipTier,
} from '@/types/crm';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const tierColors: Record<MembershipTier, string> = {
  free: 'bg-gray-500/10 text-gray-500',
  essential: 'bg-blue-500/10 text-blue-500',
  premium: 'bg-amber-500/10 text-amber-500',
  elite: 'bg-purple-500/10 text-purple-500',
};

const statusColors: Record<MembershipStatus, string> = {
  active: 'bg-green-500/10 text-green-500',
  paused: 'bg-yellow-500/10 text-yellow-500',
  cancelled: 'bg-red-500/10 text-red-500',
  expired: 'bg-gray-500/10 text-gray-500',
};

const programTypeLabels: Record<ProgramType, string> = {
  wellness: 'Wellness',
  sleep: 'Sleep',
  mental_performance: 'Mental Performance',
  bundle: 'Recovery Bundle',
};

const programTypeIcons: Record<ProgramType, React.ElementType> = {
  wellness: Crown,
  sleep: Moon,
  mental_performance: Brain,
  bundle: Package,
};

const sleepTierLabels: Record<SleepMembershipTier, string> = {
  foundational: 'Foundational',
  enhanced: 'Enhanced',
  premium: 'Premium',
};

const mentalTierLabels: Record<MentalPerformanceMembershipTier, string> = {
  cognitive_foundations: 'Cognitive Foundations',
  performance_optimization: 'Performance Optimization',
  elite_cognition: 'Elite Cognition',
};

const bundleTierLabels: Record<BundleMembershipTier, string> = {
  essential_recovery: 'Essential Recovery',
  performance_recovery: 'Performance Recovery',
  elite_recovery: 'Elite Recovery',
};

function getTierLabel(membership: {
  program_type: ProgramType;
  tier: MembershipTier;
  sleep_tier?: SleepMembershipTier | null;
  mental_performance_tier?: MentalPerformanceMembershipTier | null;
  bundle_tier?: BundleMembershipTier | null;
}) {
  switch (membership.program_type) {
    case 'sleep':
      return membership.sleep_tier ? sleepTierLabels[membership.sleep_tier] : membership.tier;
    case 'mental_performance':
      return membership.mental_performance_tier ? mentalTierLabels[membership.mental_performance_tier] : membership.tier;
    case 'bundle':
      return membership.bundle_tier ? bundleTierLabels[membership.bundle_tier] : membership.tier;
    default:
      return membership.tier;
  }
}

function getTierBadgeColor(membership: {
  program_type: ProgramType;
  tier: MembershipTier;
  sleep_tier?: SleepMembershipTier | null;
  mental_performance_tier?: MentalPerformanceMembershipTier | null;
  bundle_tier?: BundleMembershipTier | null;
}) {
  switch (membership.program_type) {
    case 'sleep':
      if (membership.sleep_tier === 'premium') return 'bg-purple-500/10 text-purple-500';
      if (membership.sleep_tier === 'enhanced') return 'bg-amber-500/10 text-amber-500';
      return 'bg-blue-500/10 text-blue-500';
    case 'mental_performance':
      if (membership.mental_performance_tier === 'elite_cognition') return 'bg-purple-500/10 text-purple-500';
      if (membership.mental_performance_tier === 'performance_optimization') return 'bg-amber-500/10 text-amber-500';
      return 'bg-blue-500/10 text-blue-500';
    case 'bundle':
      if (membership.bundle_tier === 'elite_recovery') return 'bg-purple-500/10 text-purple-500';
      if (membership.bundle_tier === 'performance_recovery') return 'bg-amber-500/10 text-amber-500';
      return 'bg-blue-500/10 text-blue-500';
    default:
      return tierColors[membership.tier];
  }
}

export function MembershipsList() {
  const { memberships, loading: membershipsLoading } = useCRMMemberships();
  const { clients, loading: clientsLoading } = useCRMClients();
  const [search, setSearch] = useState('');
  const [tierFilter, setTierFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [programFilter, setProgramFilter] = useState<ProgramType | 'all'>('all');

  const loading = membershipsLoading || clientsLoading;

  const clientsMap = clients.reduce((acc, client) => {
    acc[client.id] = client;
    return acc;
  }, {} as Record<string, CRMClient>);

  const filteredMemberships = memberships.filter(membership => {
    const client = clientsMap[membership.client_id];
    const matchesSearch = client 
      ? client.full_name.toLowerCase().includes(search.toLowerCase()) ||
        client.email.toLowerCase().includes(search.toLowerCase())
      : false;
    const matchesTier = tierFilter === 'all' || membership.tier === tierFilter;
    const matchesStatus = statusFilter === 'all' || membership.status === statusFilter;
    const matchesProgram = programFilter === 'all' || membership.program_type === programFilter;
    return matchesSearch && matchesTier && matchesStatus && matchesProgram;
  });

  // Stats by program type
  const statsByProgram = {
    wellness: {
      total: memberships.filter(m => m.program_type === 'wellness').length,
      active: memberships.filter(m => m.program_type === 'wellness' && m.status === 'active').length,
      mrr: memberships.filter(m => m.program_type === 'wellness' && m.status === 'active').reduce((sum, m) => sum + Number(m.monthly_price || 0), 0),
    },
    sleep: {
      total: memberships.filter(m => m.program_type === 'sleep').length,
      active: memberships.filter(m => m.program_type === 'sleep' && m.status === 'active').length,
      mrr: memberships.filter(m => m.program_type === 'sleep' && m.status === 'active').reduce((sum, m) => sum + Number(m.monthly_price || 0), 0),
    },
    mental_performance: {
      total: memberships.filter(m => m.program_type === 'mental_performance').length,
      active: memberships.filter(m => m.program_type === 'mental_performance' && m.status === 'active').length,
      mrr: memberships.filter(m => m.program_type === 'mental_performance' && m.status === 'active').reduce((sum, m) => sum + Number(m.monthly_price || 0), 0),
    },
    bundle: {
      total: memberships.filter(m => m.program_type === 'bundle').length,
      active: memberships.filter(m => m.program_type === 'bundle' && m.status === 'active').length,
      mrr: memberships.filter(m => m.program_type === 'bundle' && m.status === 'active').reduce((sum, m) => sum + Number(m.monthly_price || 0), 0),
    },
  };

  const totalStats = {
    total: memberships.length,
    active: memberships.filter(m => m.status === 'active').length,
    premium: memberships.filter(m => m.tier === 'premium' || m.tier === 'elite').length,
    mrr: memberships.filter(m => m.status === 'active' && m.monthly_price).reduce((sum, m) => sum + Number(m.monthly_price || 0), 0),
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-full" />
        <div className="grid gap-4">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Memberships</h1>
        <p className="text-muted-foreground">Manage member subscriptions across all programs</p>
      </div>

      {/* Program Type Stats */}
      <Tabs defaultValue="all" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="all" onClick={() => setProgramFilter('all')}>All Programs</TabsTrigger>
          <TabsTrigger value="wellness" onClick={() => setProgramFilter('wellness')}>Wellness</TabsTrigger>
          <TabsTrigger value="sleep" onClick={() => setProgramFilter('sleep')}>Sleep</TabsTrigger>
          <TabsTrigger value="mental" onClick={() => setProgramFilter('mental_performance')}>Mental</TabsTrigger>
          <TabsTrigger value="bundle" onClick={() => setProgramFilter('bundle')}>Bundles</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <p className="text-sm text-muted-foreground">Total Members</p>
                <p className="text-2xl font-bold">{totalStats.total}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <p className="text-sm text-muted-foreground">Active</p>
                <p className="text-2xl font-bold text-green-500">{totalStats.active}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <p className="text-sm text-muted-foreground">Premium/Elite</p>
                <p className="text-2xl font-bold text-amber-500">{totalStats.premium}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <p className="text-sm text-muted-foreground">Total MRR</p>
                <p className="text-2xl font-bold text-primary">${totalStats.mrr.toLocaleString()}</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {(['wellness', 'sleep', 'mental_performance', 'bundle'] as const).map(program => (
          <TabsContent key={program} value={program === 'mental_performance' ? 'mental' : program} className="mt-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="border-l-4 border-l-primary">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    {(() => {
                      const Icon = programTypeIcons[program];
                      return <Icon className="h-5 w-5 text-primary" />;
                    })()}
                    <p className="text-sm font-medium text-muted-foreground">{programTypeLabels[program]} Members</p>
                  </div>
                  <p className="text-2xl font-bold">{statsByProgram[program].total}</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <p className="text-sm text-muted-foreground">Active</p>
                  <p className="text-2xl font-bold text-green-500">{statsByProgram[program].active}</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <p className="text-sm text-muted-foreground">{programTypeLabels[program]} MRR</p>
                  <p className="text-2xl font-bold text-primary">${statsByProgram[program].mrr.toLocaleString()}</p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        ))}
      </Tabs>

      {/* Filters */}
      <div className="flex flex-wrap gap-4">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by client name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={tierFilter} onValueChange={setTierFilter}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Tier" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Tiers</SelectItem>
            <SelectItem value="free">Free</SelectItem>
            <SelectItem value="essential">Essential</SelectItem>
            <SelectItem value="premium">Premium</SelectItem>
            <SelectItem value="elite">Elite</SelectItem>
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="paused">Paused</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
            <SelectItem value="expired">Expired</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Memberships List */}
      {filteredMemberships.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <p className="text-muted-foreground">No memberships found</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {filteredMemberships.map((membership) => {
            const client = clientsMap[membership.client_id];
            const ProgramIcon = programTypeIcons[membership.program_type];
            return (
              <Card key={membership.id} className="hover:border-primary/50 transition-colors">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between flex-wrap gap-4">
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                        <ProgramIcon className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-foreground">
                          {client?.full_name || 'Unknown Client'}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {client?.email} • Started {format(new Date(membership.start_date), 'MMM d, yyyy')}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 flex-wrap">
                      <Badge variant="outline" className="bg-muted">
                        {programTypeLabels[membership.program_type]}
                      </Badge>
                      <Badge className={getTierBadgeColor(membership)}>
                        {getTierLabel(membership)}
                      </Badge>
                      <Badge className={statusColors[membership.status]}>
                        {membership.status}
                      </Badge>
                      {membership.monthly_price && (
                        <span className="font-semibold text-primary">
                          ${Number(membership.monthly_price).toFixed(2)}/mo
                        </span>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}