import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { 
  Users, 
  ClipboardList, 
  Clock, 
  CheckCircle2, 
  AlertCircle,
  ArrowRight,
  Calendar,
  Target,
  TrendingUp
} from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';

interface AssignedClient {
  id: string;
  full_name: string;
  email: string;
  phone: string | null;
  health_goals: string | null;
  marketing_status: string | null;
  created_at: string;
}

interface AssignedIntakeForm {
  id: string;
  user_id: string;
  specialty: string;
  status: string;
  submitted_at: string;
  form_data: Record<string, any>;
  notes: string | null;
}

const specialtyLabels: Record<string, string> = {
  nutrition: 'Nutrition',
  performance: 'Performance',
  wellness_recovery: 'Wellness & Recovery',
  mental_performance: 'Mental Performance',
};

const statusConfig: Record<string, { label: string; color: string; icon: typeof Clock }> = {
  pending: { label: 'Pending Review', color: 'bg-yellow-500/10 text-yellow-500', icon: Clock },
  in_review: { label: 'In Review', color: 'bg-blue-500/10 text-blue-500', icon: AlertCircle },
  assigned: { label: 'Assigned', color: 'bg-purple-500/10 text-purple-500', icon: Target },
  completed: { label: 'Completed', color: 'bg-green-500/10 text-green-500', icon: CheckCircle2 },
  archived: { label: 'Archived', color: 'bg-gray-500/10 text-gray-500', icon: Clock },
};

export function CoachDashboard() {
  const { user } = useAuth();

  // Fetch assigned clients
  const { data: clients, isLoading: clientsLoading } = useQuery({
    queryKey: ['coach-assigned-clients', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('crm_clients')
        .select('id, full_name, email, phone, health_goals, marketing_status, created_at')
        .eq('assigned_coach_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as AssignedClient[];
    },
    enabled: !!user?.id,
  });

  // Fetch assigned intake forms
  const { data: intakeForms, isLoading: formsLoading } = useQuery({
    queryKey: ['coach-assigned-forms', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('coach_intake_forms')
        .select('id, user_id, specialty, status, submitted_at, form_data, notes')
        .eq('assigned_to', user?.id)
        .order('submitted_at', { ascending: false });

      if (error) throw error;
      return data as AssignedIntakeForm[];
    },
    enabled: !!user?.id,
  });

  const stats = useMemo(() => ({
    totalClients: clients?.length || 0,
    pendingForms: intakeForms?.filter(f => f.status === 'pending' || f.status === 'in_review' || f.status === 'assigned').length || 0,
    completedForms: intakeForms?.filter(f => f.status === 'completed').length || 0,
    totalForms: intakeForms?.length || 0,
  }), [clients, intakeForms]);

  const pendingForms = useMemo(() => 
    intakeForms?.filter(f => f.status !== 'completed' && f.status !== 'archived') || [],
    [intakeForms]
  );

  const isLoading = clientsLoading || formsLoading;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-64" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
        <Skeleton className="h-64" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Coach Dashboard</h1>
        <p className="text-muted-foreground mt-1">
          Welcome back! Here's an overview of your assigned clients and forms.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-blue-500/10">
                <Users className="h-6 w-6 text-blue-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.totalClients}</p>
                <p className="text-sm text-muted-foreground">Assigned Clients</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-yellow-500/10">
                <ClipboardList className="h-6 w-6 text-yellow-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.pendingForms}</p>
                <p className="text-sm text-muted-foreground">Pending Forms</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-green-500/10">
                <CheckCircle2 className="h-6 w-6 text-green-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.completedForms}</p>
                <p className="text-sm text-muted-foreground">Completed Forms</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-purple-500/10">
                <TrendingUp className="h-6 w-6 text-purple-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {stats.totalForms > 0 
                    ? Math.round((stats.completedForms / stats.totalForms) * 100) 
                    : 0}%
                </p>
                <p className="text-sm text-muted-foreground">Completion Rate</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Pending Intake Forms */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <ClipboardList className="h-5 w-5" />
                Pending Intake Forms
              </CardTitle>
              <CardDescription>
                Forms assigned to you that need attention
              </CardDescription>
            </div>
            {pendingForms.length > 0 && (
              <Badge variant="secondary">{pendingForms.length} pending</Badge>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {pendingForms.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <CheckCircle2 className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>No pending intake forms</p>
              <p className="text-sm">You're all caught up!</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Specialty</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Submitted</TableHead>
                  <TableHead>Client Name</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pendingForms.map((form) => {
                  const config = statusConfig[form.status] || statusConfig.pending;
                  const Icon = config.icon;
                  const clientName = (form.form_data as any)?.personalInfo?.fullName || 'Unknown';
                  
                  return (
                    <TableRow key={form.id}>
                      <TableCell>
                        <Badge variant="outline">
                          {specialtyLabels[form.specialty] || form.specialty}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={config.color}>
                          <Icon className="h-3 w-3 mr-1" />
                          {config.label}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {formatDistanceToNow(new Date(form.submitted_at), { addSuffix: true })}
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">
                        {clientName}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm">
                          Review
                          <ArrowRight className="h-4 w-4 ml-1" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Assigned Clients */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Your Clients
              </CardTitle>
              <CardDescription>
                Clients assigned to you for coaching
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {clients?.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Users className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>No clients assigned yet</p>
              <p className="text-sm">Clients will appear here once assigned to you</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Client</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Health Goals</TableHead>
                  <TableHead>Since</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {clients?.map((client) => (
                  <TableRow key={client.id}>
                    <TableCell>
                      <div className="font-medium">{client.full_name}</div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div className="text-muted-foreground">{client.email}</div>
                        {client.phone && (
                          <div className="text-muted-foreground">{client.phone}</div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <p className="text-sm text-muted-foreground line-clamp-2 max-w-xs">
                        {client.health_goals || 'No goals specified'}
                      </p>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {format(new Date(client.created_at), 'MMM d, yyyy')}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm">
                        View Profile
                        <ArrowRight className="h-4 w-4 ml-1" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
