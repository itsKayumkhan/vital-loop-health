import { useState } from 'react';
import { ShoppingCart, Search, DollarSign, TrendingUp } from 'lucide-react';
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
import { useCRMPurchases, useCRMClients } from '@/hooks/useCRM';
import { PurchaseType, CRMClient } from '@/types/crm';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';

const typeColors: Record<PurchaseType, string> = {
  subscription: 'bg-blue-500/10 text-blue-500',
  one_time: 'bg-green-500/10 text-green-500',
  supplement: 'bg-purple-500/10 text-purple-500',
  service: 'bg-amber-500/10 text-amber-500',
};

export function PurchasesList() {
  const { purchases, loading: purchasesLoading } = useCRMPurchases();
  const { clients, loading: clientsLoading } = useCRMClients();
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');

  const loading = purchasesLoading || clientsLoading;

  const clientsMap = clients.reduce((acc, client) => {
    acc[client.id] = client;
    return acc;
  }, {} as Record<string, CRMClient>);

  const filteredPurchases = purchases.filter(purchase => {
    const client = clientsMap[purchase.client_id];
    const matchesSearch = 
      purchase.product_name.toLowerCase().includes(search.toLowerCase()) ||
      (client && (
        client.full_name.toLowerCase().includes(search.toLowerCase()) ||
        client.email.toLowerCase().includes(search.toLowerCase())
      ));
    const matchesType = typeFilter === 'all' || purchase.purchase_type === typeFilter;
    return matchesSearch && matchesType;
  });

  const stats = {
    total: purchases.length,
    revenue: purchases.reduce((sum, p) => sum + Number(p.amount), 0),
    thisMonth: purchases.filter(p => {
      const date = new Date(p.purchased_at);
      const now = new Date();
      return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
    }).length,
    avgOrder: purchases.length > 0 
      ? purchases.reduce((sum, p) => sum + Number(p.amount), 0) / purchases.length 
      : 0,
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
        <h1 className="text-3xl font-bold text-foreground">Purchases</h1>
        <p className="text-muted-foreground">Track all client purchases and transactions</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Total Purchases</p>
            <p className="text-2xl font-bold">{stats.total}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Total Revenue</p>
            <p className="text-2xl font-bold text-green-500">${stats.revenue.toLocaleString()}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">This Month</p>
            <p className="text-2xl font-bold text-blue-500">{stats.thisMonth}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Avg Order Value</p>
            <p className="text-2xl font-bold text-primary">${stats.avgOrder.toFixed(2)}</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search purchases..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="subscription">Subscription</SelectItem>
            <SelectItem value="one_time">One-Time</SelectItem>
            <SelectItem value="supplement">Supplement</SelectItem>
            <SelectItem value="service">Service</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Purchases List */}
      {filteredPurchases.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <p className="text-muted-foreground">No purchases found</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {filteredPurchases.map((purchase) => {
            const client = clientsMap[purchase.client_id];
            return (
              <Card key={purchase.id} className="hover:border-primary/50 transition-colors">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 rounded-full bg-green-500/10 flex items-center justify-center">
                        <ShoppingCart className="h-6 w-6 text-green-500" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-foreground">{purchase.product_name}</h3>
                        <p className="text-sm text-muted-foreground">
                          {client?.full_name || 'Unknown Client'} • {format(new Date(purchase.purchased_at), 'MMM d, yyyy')}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <Badge className={typeColors[purchase.purchase_type]}>
                        {purchase.purchase_type.replace('_', ' ')}
                      </Badge>
                      <span className="text-lg font-semibold text-green-500">
                        ${Number(purchase.amount).toFixed(2)}
                      </span>
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
