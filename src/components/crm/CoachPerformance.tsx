import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import { Users, FileCheck, ClipboardList, TrendingUp, Award, Target, Star } from 'lucide-react';
import { format, parseISO, subDays, isWithinInterval } from 'date-fns';

interface CoachStats {
  coachId: string;
  coachEmail: string;
  coachName: string;
  totalClients: number;
  pendingForms: number;
  completedForms: number;
  inReviewForms: number;
  totalForms: number;
  completionRate: number;
  recentActivity: number; // forms completed in last 30 days
  avgRating: number;
  totalSurveys: number;
}

export function CoachPerformance() {
  // Fetch all coaches
  const { data: coaches, isLoading: coachesLoading } = useQuery({
    queryKey: ['coaches-list'],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_all_users_with_roles');
      if (error) throw error;
      return (data || []).filter((u: any) => u.role === 'coach');
    },
  });

  // Fetch all clients with coach assignments
  const { data: clients, isLoading: clientsLoading } = useQuery({
    queryKey: ['all-clients-for-performance'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('crm_clients')
        .select('id, full_name, email, assigned_coach_id, created_at');
      if (error) throw error;
      return data || [];
    },
  });

  // Fetch all intake forms
  const { data: intakeForms, isLoading: formsLoading } = useQuery({
    queryKey: ['all-intake-forms-for-performance'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('coach_intake_forms')
        .select('id, assigned_to, status, specialty, completed_at, created_at');
      if (error) throw error;
      return data || [];
    },
  });

  // Fetch satisfaction surveys
  const { data: surveys, isLoading: surveysLoading } = useQuery({
    queryKey: ['coach-satisfaction-surveys'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('coach_satisfaction_surveys')
        .select('id, coach_id, rating');
      if (error) throw error;
      return data || [];
    },
  });

  const loading = coachesLoading || clientsLoading || formsLoading || surveysLoading;

  // Calculate coach performance metrics
  const coachStats = useMemo<CoachStats[]>(() => {
    if (!coaches || !clients || !intakeForms) return [];

    const thirtyDaysAgo = subDays(new Date(), 30);

    return coaches.map((coach: any) => {
      const coachClients = clients.filter(c => c.assigned_coach_id === coach.user_id);
      const coachForms = intakeForms.filter(f => f.assigned_to === coach.user_id);
      const coachSurveys = surveys?.filter(s => s.coach_id === coach.user_id) || [];
      
      const pendingForms = coachForms.filter(f => f.status === 'pending' || f.status === 'assigned').length;
      const completedForms = coachForms.filter(f => f.status === 'completed').length;
      const inReviewForms = coachForms.filter(f => f.status === 'in_review').length;
      const totalForms = coachForms.length;
      
      const recentActivity = coachForms.filter(f => {
        if (!f.completed_at) return false;
        const completedDate = parseISO(f.completed_at);
        return isWithinInterval(completedDate, { start: thirtyDaysAgo, end: new Date() });
      }).length;

      const avgRating = coachSurveys.length > 0 
        ? coachSurveys.reduce((sum, s) => sum + s.rating, 0) / coachSurveys.length 
        : 0;

      return {
        coachId: coach.user_id,
        coachEmail: coach.email || '',
        coachName: coach.full_name || coach.email?.split('@')[0] || 'Unknown',
        totalClients: coachClients.length,
        pendingForms,
        completedForms,
        inReviewForms,
        totalForms,
        completionRate: totalForms > 0 ? Math.round((completedForms / totalForms) * 100) : 0,
        recentActivity,
        avgRating: Math.round(avgRating * 10) / 10,
        totalSurveys: coachSurveys.length,
      };
    });
  }, [coaches, clients, intakeForms, surveys]);

  // Summary stats
  const summaryStats = useMemo(() => {
    const totalCoaches = coachStats.length;
    const totalAssignedClients = coachStats.reduce((sum, c) => sum + c.totalClients, 0);
    const totalCompletedForms = coachStats.reduce((sum, c) => sum + c.completedForms, 0);
    const totalPendingForms = coachStats.reduce((sum, c) => sum + c.pendingForms, 0);
    const avgCompletionRate = totalCoaches > 0 
      ? Math.round(coachStats.reduce((sum, c) => sum + c.completionRate, 0) / totalCoaches) 
      : 0;
    const totalRecentActivity = coachStats.reduce((sum, c) => sum + c.recentActivity, 0);
    
    const coachesWithRatings = coachStats.filter(c => c.totalSurveys > 0);
    const avgSatisfactionRating = coachesWithRatings.length > 0
      ? (coachesWithRatings.reduce((sum, c) => sum + c.avgRating, 0) / coachesWithRatings.length).toFixed(1)
      : '0.0';
    const totalSurveys = coachStats.reduce((sum, c) => sum + c.totalSurveys, 0);

    return {
      totalCoaches,
      totalAssignedClients,
      totalCompletedForms,
      totalPendingForms,
      avgCompletionRate,
      totalRecentActivity,
      avgSatisfactionRating,
      totalSurveys,
    };
  }, [coachStats]);

  // Chart data for clients per coach
  const clientsPerCoachData = useMemo(() => {
    return coachStats
      .map(c => ({
        name: c.coachName.split(' ')[0], // First name only for chart
        clients: c.totalClients,
        fullName: c.coachName,
      }))
      .sort((a, b) => b.clients - a.clients);
  }, [coachStats]);

  // Chart data for form completion status
  const formStatusData = useMemo(() => {
    const pending = coachStats.reduce((sum, c) => sum + c.pendingForms, 0);
    const inReview = coachStats.reduce((sum, c) => sum + c.inReviewForms, 0);
    const completed = coachStats.reduce((sum, c) => sum + c.completedForms, 0);

    return [
      { name: 'Completed', value: completed, color: 'hsl(140, 70%, 45%)' },
      { name: 'In Review', value: inReview, color: 'hsl(45, 90%, 50%)' },
      { name: 'Pending', value: pending, color: 'hsl(200, 70%, 50%)' },
    ].filter(item => item.value > 0);
  }, [coachStats]);

  // Top performers (by completion rate)
  const topPerformers = useMemo(() => {
    return [...coachStats]
      .filter(c => c.totalForms > 0)
      .sort((a, b) => b.completionRate - a.completionRate)
      .slice(0, 3);
  }, [coachStats]);

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => (
            <Card key={i}>
              <CardHeader className="pb-2">
                <Skeleton className="h-4 w-24" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-16" />
              </CardContent>
            </Card>
          ))}
        </div>
        <Card>
          <CardContent className="pt-6">
            <Skeleton className="h-64 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Coach Performance</h1>
        <p className="text-muted-foreground">Monitor coach workload and productivity metrics</p>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Coaches</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summaryStats.totalCoaches}</div>
            <p className="text-xs text-muted-foreground">Active coaching staff</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Assigned Clients</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summaryStats.totalAssignedClients}</div>
            <p className="text-xs text-muted-foreground">Clients with coaches</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Forms Completed</CardTitle>
            <FileCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summaryStats.totalCompletedForms}</div>
            <p className="text-xs text-muted-foreground">{summaryStats.totalPendingForms} pending</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Avg Completion Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summaryStats.avgCompletionRate}%</div>
            <p className="text-xs text-muted-foreground">{summaryStats.totalRecentActivity} completed (30d)</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Avg Satisfaction</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold">{summaryStats.avgSatisfactionRating}</span>
              <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
            </div>
            <p className="text-xs text-muted-foreground">{summaryStats.totalSurveys} surveys</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Clients per Coach */}
        <Card>
          <CardHeader>
            <CardTitle>Clients per Coach</CardTitle>
            <CardDescription>Client distribution across coaching staff</CardDescription>
          </CardHeader>
          <CardContent>
            {clientsPerCoachData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={clientsPerCoachData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis type="number" />
                  <YAxis dataKey="name" type="category" width={80} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                    }}
                    formatter={(value: number, name: string, props: any) => [
                      value,
                      `Clients (${props.payload.fullName})`,
                    ]}
                  />
                  <Bar dataKey="clients" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                No coaches with assigned clients
              </div>
            )}
          </CardContent>
        </Card>

        {/* Form Status Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Form Status Distribution</CardTitle>
            <CardDescription>Overall intake form completion status</CardDescription>
          </CardHeader>
          <CardContent>
            {formStatusData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={formStatusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {formStatusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                    }}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                No intake forms found
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Top Performers */}
      {topPerformers.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5 text-yellow-500" />
              Top Performers
            </CardTitle>
            <CardDescription>Coaches with highest form completion rates</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {topPerformers.map((coach, index) => (
                <div
                  key={coach.coachId}
                  className="flex items-center gap-4 p-4 rounded-lg border bg-card"
                >
                  <div className="relative">
                    <Avatar className="h-12 w-12">
                      <AvatarFallback className="bg-primary/10 text-primary">
                        {getInitials(coach.coachName)}
                      </AvatarFallback>
                    </Avatar>
                    {index === 0 && (
                      <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center bg-yellow-500">
                        1
                      </Badge>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{coach.coachName}</p>
                    <p className="text-sm text-muted-foreground">{coach.completionRate}% completion</p>
                    <p className="text-xs text-muted-foreground">
                      {coach.completedForms}/{coach.totalForms} forms
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Detailed Coach Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ClipboardList className="h-5 w-5" />
            Coach Performance Details
          </CardTitle>
          <CardDescription>Comprehensive metrics for each coach</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Coach</TableHead>
                <TableHead className="text-center">Clients</TableHead>
                <TableHead className="text-center">Pending</TableHead>
                <TableHead className="text-center">In Review</TableHead>
                <TableHead className="text-center">Completed</TableHead>
                <TableHead className="text-center">Completion Rate</TableHead>
                <TableHead className="text-center">Rating</TableHead>
                <TableHead className="text-center">Recent (30d)</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {coachStats.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center text-muted-foreground py-8">
                    No coaches found
                  </TableCell>
                </TableRow>
              ) : (
                coachStats.map((coach) => (
                  <TableRow key={coach.coachId}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="text-xs bg-primary/10 text-primary">
                            {getInitials(coach.coachName)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{coach.coachName}</p>
                          <p className="text-xs text-muted-foreground">{coach.coachEmail}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge variant="secondary">{coach.totalClients}</Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge variant="outline" className="text-blue-600 border-blue-200 bg-blue-50">
                        {coach.pendingForms}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge variant="outline" className="text-yellow-600 border-yellow-200 bg-yellow-50">
                        {coach.inReviewForms}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge variant="outline" className="text-green-600 border-green-200 bg-green-50">
                        {coach.completedForms}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex items-center gap-2">
                        <Progress value={coach.completionRate} className="h-2 w-16" />
                        <span className="text-sm font-medium">{coach.completionRate}%</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      {coach.totalSurveys > 0 ? (
                        <div className="flex items-center justify-center gap-1">
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          <span className="text-sm font-medium">{coach.avgRating}</span>
                          <span className="text-xs text-muted-foreground">({coach.totalSurveys})</span>
                        </div>
                      ) : (
                        <span className="text-muted-foreground text-sm">—</span>
                      )}
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge variant="secondary">{coach.recentActivity}</Badge>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
