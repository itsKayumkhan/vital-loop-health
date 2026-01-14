import { useState, useEffect } from 'react';
import { Crown, Search, Filter } from 'lucide-react';
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
import { MembershipTier, MembershipStatus, CRMClient } from '@/types/crm';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';

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

export function MembershipsList() {
  const { memberships, loading: membershipsLoading } = useCRMMemberships();
  const { clients, loading: clientsLoading } = useCRMClients();
  const [search, setSearch] = useState('');
  const [tierFilter, setTierFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

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
    return matchesSearch && matchesTier && matchesStatus;
  });

  const stats = {
    total: memberships.length,
    active: memberships.filter(m => m.status === 'active').length,
    premium: memberships.filter(m => m.tier === 'premium' || m.tier === 'elite').length,
    mrr: memberships
      .filter(m => m.status === 'active' && m.monthly_price)
      .reduce((sum, m) => sum + Number(m.monthly_price || 0), 0),
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
        <p className="text-muted-foreground">Manage member subscriptions and tiers</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Total Members</p>
            <p className="text-2xl font-bold">{stats.total}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Active</p>
            <p className="text-2xl font-bold text-green-500">{stats.active}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Premium/Elite</p>
            <p className="text-2xl font-bold text-amber-500">{stats.premium}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">MRR</p>
            <p className="text-2xl font-bold text-primary">${stats.mrr.toLocaleString()}</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex gap-4">
        <div className="relative flex-1">
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
            return (
              <Card key={membership.id} className="hover:border-primary/50 transition-colors">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 rounded-full bg-amber-500/10 flex items-center justify-center">
                        <Crown className="h-6 w-6 text-amber-500" />
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

                    <div className="flex items-center gap-3">
                      <Badge className={tierColors[membership.tier]}>
                        {membership.tier}
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
