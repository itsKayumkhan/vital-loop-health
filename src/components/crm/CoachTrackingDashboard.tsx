import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { 
  Moon, 
  Brain, 
  Users,
  TrendingUp,
  TrendingDown,
  Minus,
  Calendar,
  Activity,
  AlertCircle,
  CheckCircle2
} from 'lucide-react';
import { format, subDays, isToday, isYesterday, parseISO } from 'date-fns';

interface ClientTrackingOverview {
  clientId: string;
  clientName: string;
  lastSleepEntry: string | null;
  lastMentalEntry: string | null;
  avgSleepQuality: number | null;
  avgFocusRating: number | null;
  sleepEntriesLast7Days: number;
  mentalEntriesLast7Days: number;
  sleepTrend: 'up' | 'down' | 'stable' | null;
  mentalTrend: 'up' | 'down' | 'stable' | null;
}

function TrendIcon({ trend }: { trend: 'up' | 'down' | 'stable' | null }) {
  if (trend === 'up') return <TrendingUp className="h-4 w-4 text-green-500" />;
  if (trend === 'down') return <TrendingDown className="h-4 w-4 text-red-500" />;
  if (trend === 'stable') return <Minus className="h-4 w-4 text-muted-foreground" />;
  return <Minus className="h-4 w-4 text-muted-foreground opacity-50" />;
}

function formatLastEntry(dateStr: string | null): { text: string; status: 'good' | 'warning' | 'danger' } {
  if (!dateStr) return { text: 'Never', status: 'danger' };
  
  const date = parseISO(dateStr);
  if (isToday(date)) return { text: 'Today', status: 'good' };
  if (isYesterday(date)) return { text: 'Yesterday', status: 'good' };
  
  const daysAgo = Math.floor((Date.now() - date.getTime()) / (1000 * 60 * 60 * 24));
  if (daysAgo <= 3) return { text: `${daysAgo} days ago`, status: 'warning' };
  return { text: `${daysAgo} days ago`, status: 'danger' };
}

function StatusBadge({ status }: { status: 'good' | 'warning' | 'danger' }) {
  if (status === 'good') return <CheckCircle2 className="h-4 w-4 text-green-500" />;
  if (status === 'warning') return <AlertCircle className="h-4 w-4 text-yellow-500" />;
  return <AlertCircle className="h-4 w-4 text-red-500" />;
}

export function CoachTrackingDashboard() {
  const { user } = useAuth();
  const sevenDaysAgo = format(subDays(new Date(), 7), 'yyyy-MM-dd');

  // Fetch assigned clients
  const { data: clients, isLoading: clientsLoading } = useQuery({
    queryKey: ['coach-tracking-clients', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('crm_clients')
        .select('id, full_name')
        .eq('assigned_coach_id', user?.id)
        .order('full_name');

      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  // Fetch sleep tracking entries for all clients
  const { data: sleepEntries, isLoading: sleepLoading } = useQuery({
    queryKey: ['coach-sleep-tracking', user?.id, sevenDaysAgo],
    queryFn: async () => {
      if (!clients?.length) return [];
      
      const clientIds = clients.map(c => c.id);
      const { data, error } = await supabase
        .from('sleep_tracking_entries')
        .select('client_id, entry_date, sleep_quality_rating, morning_energy_rating')
        .in('client_id', clientIds)
        .gte('entry_date', sevenDaysAgo)
        .order('entry_date', { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!clients?.length,
  });

  // Fetch mental tracking entries for all clients
  const { data: mentalEntries, isLoading: mentalLoading } = useQuery({
    queryKey: ['coach-mental-tracking', user?.id, sevenDaysAgo],
    queryFn: async () => {
      if (!clients?.length) return [];
      
      const clientIds = clients.map(c => c.id);
      const { data, error } = await supabase
        .from('mental_performance_tracking')
        .select('client_id, entry_date, focus_rating, mental_clarity_rating, productivity_rating')
        .in('client_id', clientIds)
        .gte('entry_date', sevenDaysAgo)
        .order('entry_date', { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!clients?.length,
  });

  // Calculate aggregated data per client
  const clientOverviews = useMemo<ClientTrackingOverview[]>(() => {
    if (!clients) return [];

    return clients.map(client => {
      const clientSleepEntries = sleepEntries?.filter(e => e.client_id === client.id) || [];
      const clientMentalEntries = mentalEntries?.filter(e => e.client_id === client.id) || [];

      // Last entries
      const lastSleepEntry = clientSleepEntries[0]?.entry_date || null;
      const lastMentalEntry = clientMentalEntries[0]?.entry_date || null;

      // Average ratings
      const sleepRatings = clientSleepEntries
        .map(e => e.sleep_quality_rating)
        .filter((r): r is number => r !== null);
      const avgSleepQuality = sleepRatings.length > 0 
        ? sleepRatings.reduce((a, b) => a + b, 0) / sleepRatings.length 
        : null;

      const focusRatings = clientMentalEntries
        .map(e => e.focus_rating)
        .filter((r): r is number => r !== null);
      const avgFocusRating = focusRatings.length > 0 
        ? focusRatings.reduce((a, b) => a + b, 0) / focusRatings.length 
        : null;

      // Calculate trends (compare first half to second half of entries)
      const calculateTrend = (ratings: number[]): 'up' | 'down' | 'stable' | null => {
        if (ratings.length < 2) return null;
        const mid = Math.floor(ratings.length / 2);
        const recentAvg = ratings.slice(0, mid).reduce((a, b) => a + b, 0) / mid;
        const olderAvg = ratings.slice(mid).reduce((a, b) => a + b, 0) / (ratings.length - mid);
        const diff = recentAvg - olderAvg;
        if (diff > 0.5) return 'up';
        if (diff < -0.5) return 'down';
        return 'stable';
      };

      return {
        clientId: client.id,
        clientName: client.full_name,
        lastSleepEntry,
        lastMentalEntry,
        avgSleepQuality,
        avgFocusRating,
        sleepEntriesLast7Days: clientSleepEntries.length,
        mentalEntriesLast7Days: clientMentalEntries.length,
        sleepTrend: calculateTrend(sleepRatings),
        mentalTrend: calculateTrend(focusRatings),
      };
    });
  }, [clients, sleepEntries, mentalEntries]);

  // Summary stats
  const stats = useMemo(() => {
    const activeTrackingSleep = clientOverviews.filter(c => c.sleepEntriesLast7Days > 0).length;
    const activeTrackingMental = clientOverviews.filter(c => c.mentalEntriesLast7Days > 0).length;
    const totalSleepEntries = clientOverviews.reduce((sum, c) => sum + c.sleepEntriesLast7Days, 0);
    const totalMentalEntries = clientOverviews.reduce((sum, c) => sum + c.mentalEntriesLast7Days, 0);
    const avgCompliance = clients?.length 
      ? ((activeTrackingSleep + activeTrackingMental) / (clients.length * 2)) * 100 
      : 0;

    return {
      totalClients: clients?.length || 0,
      activeTrackingSleep,
      activeTrackingMental,
      totalSleepEntries,
      totalMentalEntries,
      avgCompliance,
    };
  }, [clientOverviews, clients]);

  const isLoading = clientsLoading || sleepLoading || mentalLoading;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-64" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
        <Skeleton className="h-96" />
      </div>
    );
  }

  if (!clients?.length) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Client Tracking Overview</h1>
          <p className="text-muted-foreground mt-1">
            Monitor daily tracking data for your assigned clients
          </p>
        </div>
        <Card>
          <CardContent className="py-12">
            <div className="text-center text-muted-foreground">
              <Users className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p className="font-medium">No clients assigned</p>
              <p className="text-sm">Client tracking data will appear here once you have assigned clients.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Client Tracking Overview</h1>
        <p className="text-muted-foreground mt-1">
          Monitor daily tracking data for your assigned clients (last 7 days)
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-blue-500/10">
                <Users className="h-6 w-6 text-blue-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.totalClients}</p>
                <p className="text-sm text-muted-foreground">Total Clients</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-indigo-500/10">
                <Moon className="h-6 w-6 text-indigo-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.activeTrackingSleep}</p>
                <p className="text-sm text-muted-foreground">Tracking Sleep</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-purple-500/10">
                <Brain className="h-6 w-6 text-purple-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.activeTrackingMental}</p>
                <p className="text-sm text-muted-foreground">Tracking Mental</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-green-500/10">
                <Activity className="h-6 w-6 text-green-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.totalSleepEntries + stats.totalMentalEntries}</p>
                <p className="text-sm text-muted-foreground">Total Entries</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">Compliance</p>
                <p className="text-sm font-medium">{Math.round(stats.avgCompliance)}%</p>
              </div>
              <Progress value={stats.avgCompliance} className="h-2" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tracking Tables */}
      <Tabs defaultValue="combined" className="space-y-4">
        <TabsList>
          <TabsTrigger value="combined">Combined View</TabsTrigger>
          <TabsTrigger value="sleep">Sleep Tracking</TabsTrigger>
          <TabsTrigger value="mental">Mental Performance</TabsTrigger>
        </TabsList>

        <TabsContent value="combined">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                All Client Tracking
              </CardTitle>
              <CardDescription>
                Overview of both sleep and mental performance tracking for all clients
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Client</TableHead>
                    <TableHead className="text-center">
                      <div className="flex items-center justify-center gap-1">
                        <Moon className="h-4 w-4" />
                        Last Sleep
                      </div>
                    </TableHead>
                    <TableHead className="text-center">Sleep Entries</TableHead>
                    <TableHead className="text-center">Avg Quality</TableHead>
                    <TableHead className="text-center">
                      <div className="flex items-center justify-center gap-1">
                        <Brain className="h-4 w-4" />
                        Last Mental
                      </div>
                    </TableHead>
                    <TableHead className="text-center">Mental Entries</TableHead>
                    <TableHead className="text-center">Avg Focus</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {clientOverviews.map((client) => {
                    const sleepStatus = formatLastEntry(client.lastSleepEntry);
                    const mentalStatus = formatLastEntry(client.lastMentalEntry);
                    
                    return (
                      <TableRow key={client.clientId}>
                        <TableCell className="font-medium">{client.clientName}</TableCell>
                        <TableCell className="text-center">
                          <div className="flex items-center justify-center gap-2">
                            <StatusBadge status={sleepStatus.status} />
                            <span className="text-sm">{sleepStatus.text}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="flex items-center justify-center gap-1">
                            <span>{client.sleepEntriesLast7Days}/7</span>
                            <TrendIcon trend={client.sleepTrend} />
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          {client.avgSleepQuality !== null ? (
                            <Badge variant="secondary">{client.avgSleepQuality.toFixed(1)}/10</Badge>
                          ) : (
                            <span className="text-muted-foreground">—</span>
                          )}
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="flex items-center justify-center gap-2">
                            <StatusBadge status={mentalStatus.status} />
                            <span className="text-sm">{mentalStatus.text}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="flex items-center justify-center gap-1">
                            <span>{client.mentalEntriesLast7Days}/7</span>
                            <TrendIcon trend={client.mentalTrend} />
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          {client.avgFocusRating !== null ? (
                            <Badge variant="secondary">{client.avgFocusRating.toFixed(1)}/10</Badge>
                          ) : (
                            <span className="text-muted-foreground">—</span>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sleep">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Moon className="h-5 w-5" />
                Sleep Tracking Details
              </CardTitle>
              <CardDescription>
                Detailed sleep tracking data for your clients
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Client</TableHead>
                    <TableHead className="text-center">Last Entry</TableHead>
                    <TableHead className="text-center">Entries (7 days)</TableHead>
                    <TableHead className="text-center">Avg Sleep Quality</TableHead>
                    <TableHead className="text-center">Trend</TableHead>
                    <TableHead className="text-center">Compliance</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {clientOverviews.map((client) => {
                    const sleepStatus = formatLastEntry(client.lastSleepEntry);
                    const compliance = (client.sleepEntriesLast7Days / 7) * 100;
                    
                    return (
                      <TableRow key={client.clientId}>
                        <TableCell className="font-medium">{client.clientName}</TableCell>
                        <TableCell className="text-center">
                          <div className="flex items-center justify-center gap-2">
                            <StatusBadge status={sleepStatus.status} />
                            <span className="text-sm">{sleepStatus.text}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-center">{client.sleepEntriesLast7Days}</TableCell>
                        <TableCell className="text-center">
                          {client.avgSleepQuality !== null ? (
                            <Badge variant="secondary">{client.avgSleepQuality.toFixed(1)}/10</Badge>
                          ) : (
                            <span className="text-muted-foreground">—</span>
                          )}
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="flex items-center justify-center">
                            <TrendIcon trend={client.sleepTrend} />
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="w-20 mx-auto">
                            <Progress value={compliance} className="h-2" />
                            <span className="text-xs text-muted-foreground">{Math.round(compliance)}%</span>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="mental">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5" />
                Mental Performance Tracking Details
              </CardTitle>
              <CardDescription>
                Detailed mental performance tracking data for your clients
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Client</TableHead>
                    <TableHead className="text-center">Last Entry</TableHead>
                    <TableHead className="text-center">Entries (7 days)</TableHead>
                    <TableHead className="text-center">Avg Focus</TableHead>
                    <TableHead className="text-center">Trend</TableHead>
                    <TableHead className="text-center">Compliance</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {clientOverviews.map((client) => {
                    const mentalStatus = formatLastEntry(client.lastMentalEntry);
                    const compliance = (client.mentalEntriesLast7Days / 7) * 100;
                    
                    return (
                      <TableRow key={client.clientId}>
                        <TableCell className="font-medium">{client.clientName}</TableCell>
                        <TableCell className="text-center">
                          <div className="flex items-center justify-center gap-2">
                            <StatusBadge status={mentalStatus.status} />
                            <span className="text-sm">{mentalStatus.text}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-center">{client.mentalEntriesLast7Days}</TableCell>
                        <TableCell className="text-center">
                          {client.avgFocusRating !== null ? (
                            <Badge variant="secondary">{client.avgFocusRating.toFixed(1)}/10</Badge>
                          ) : (
                            <span className="text-muted-foreground">—</span>
                          )}
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="flex items-center justify-center">
                            <TrendIcon trend={client.mentalTrend} />
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="w-20 mx-auto">
                            <Progress value={compliance} className="h-2" />
                            <span className="text-xs text-muted-foreground">{Math.round(compliance)}%</span>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
