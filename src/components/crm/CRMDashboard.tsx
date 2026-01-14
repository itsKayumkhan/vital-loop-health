import { Users, Crown, ShoppingCart, TrendingUp, UserPlus, DollarSign } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useCRMClients, useCRMMemberships, useCRMPurchases } from '@/hooks/useCRM';
import { Skeleton } from '@/components/ui/skeleton';

export function CRMDashboard() {
  const { clients, loading: clientsLoading } = useCRMClients();
  const { memberships, loading: membershipsLoading } = useCRMMemberships();
  const { purchases, loading: purchasesLoading } = useCRMPurchases();

  const loading = clientsLoading || membershipsLoading || purchasesLoading;

  const stats = {
    totalClients: clients.length,
    activeMembers: memberships.filter(m => m.status === 'active').length,
    totalRevenue: purchases.reduce((sum, p) => sum + Number(p.amount), 0),
    newClientsThisMonth: clients.filter(c => {
      const createdAt = new Date(c.created_at);
      const now = new Date();
      return createdAt.getMonth() === now.getMonth() && 
             createdAt.getFullYear() === now.getFullYear();
    }).length,
    leadCount: clients.filter(c => c.marketing_status === 'lead').length,
    vipCount: clients.filter(c => c.marketing_status === 'vip').length,
  };

  const recentClients = clients.slice(0, 5);
  const recentPurchases = purchases.slice(0, 5);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <Skeleton className="h-20" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground">Overview of your client management system</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Clients</p>
                <p className="text-3xl font-bold">{stats.totalClients}</p>
              </div>
              <Users className="h-10 w-10 text-primary opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active Members</p>
                <p className="text-3xl font-bold">{stats.activeMembers}</p>
              </div>
              <Crown className="h-10 w-10 text-amber-500 opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Revenue</p>
                <p className="text-3xl font-bold">${stats.totalRevenue.toLocaleString()}</p>
              </div>
              <DollarSign className="h-10 w-10 text-green-500 opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">New This Month</p>
                <p className="text-3xl font-bold">{stats.newClientsThisMonth}</p>
              </div>
              <UserPlus className="h-10 w-10 text-blue-500 opacity-50" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Secondary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-yellow-500/10 rounded-full">
                <TrendingUp className="h-6 w-6 text-yellow-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Active Leads</p>
                <p className="text-2xl font-bold">{stats.leadCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-purple-500/10 rounded-full">
                <Crown className="h-6 w-6 text-purple-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">VIP Clients</p>
                <p className="text-2xl font-bold">{stats.vipCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-primary/10 rounded-full">
                <ShoppingCart className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Purchases</p>
                <p className="text-2xl font-bold">{purchases.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Recent Clients</CardTitle>
          </CardHeader>
          <CardContent>
            {recentClients.length === 0 ? (
              <p className="text-muted-foreground text-center py-4">No clients yet</p>
            ) : (
              <div className="space-y-4">
                {recentClients.map((client) => (
                  <div key={client.id} className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{client.full_name}</p>
                      <p className="text-sm text-muted-foreground">{client.email}</p>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs capitalize ${
                      client.marketing_status === 'vip' ? 'bg-purple-500/10 text-purple-500' :
                      client.marketing_status === 'customer' ? 'bg-green-500/10 text-green-500' :
                      client.marketing_status === 'lead' ? 'bg-yellow-500/10 text-yellow-500' :
                      'bg-muted text-muted-foreground'
                    }`}>
                      {client.marketing_status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Purchases</CardTitle>
          </CardHeader>
          <CardContent>
            {recentPurchases.length === 0 ? (
              <p className="text-muted-foreground text-center py-4">No purchases yet</p>
            ) : (
              <div className="space-y-4">
                {recentPurchases.map((purchase) => (
                  <div key={purchase.id} className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{purchase.product_name}</p>
                      <p className="text-sm text-muted-foreground capitalize">{purchase.purchase_type}</p>
                    </div>
                    <span className="font-semibold text-green-500">
                      ${Number(purchase.amount).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
