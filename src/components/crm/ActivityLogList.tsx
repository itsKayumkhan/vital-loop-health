import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { format } from 'date-fns';
import { Activity, Search, Filter, User, Clock, FileText } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

interface ActivityLog {
  id: string;
  user_id: string;
  user_email: string | null;
  user_role: string | null;
  action: string;
  resource_type: string;
  resource_id: string | null;
  details: Record<string, unknown> | null;
  created_at: string;
}

const actionLabels: Record<string, string> = {
  view_dashboard: 'Viewed Dashboard',
  view_clients: 'Viewed Clients',
  view_client_detail: 'Viewed Client Details',
  create_client: 'Created Client',
  update_client: 'Updated Client',
  delete_client: 'Deleted Client',
  view_intake_forms: 'Viewed Intake Forms',
  view_intake_form_detail: 'Viewed Intake Form Details',
  update_intake_form: 'Updated Intake Form',
  view_memberships: 'Viewed Memberships',
  create_membership: 'Created Membership',
  update_membership: 'Updated Membership',
  view_purchases: 'Viewed Purchases',
  create_purchase: 'Created Purchase',
  view_documents: 'Viewed Documents',
  upload_document: 'Uploaded Document',
  delete_document: 'Deleted Document',
  view_campaigns: 'Viewed Campaigns',
  create_campaign: 'Created Campaign',
  update_campaign: 'Updated Campaign',
  view_activity_log: 'Viewed Activity Log',
  export_data: 'Exported Data',
  login: 'Logged In',
  logout: 'Logged Out',
};

const actionColors: Record<string, string> = {
  view: 'bg-blue-500/10 text-blue-500',
  create: 'bg-green-500/10 text-green-500',
  update: 'bg-yellow-500/10 text-yellow-500',
  delete: 'bg-red-500/10 text-red-500',
  login: 'bg-purple-500/10 text-purple-500',
  logout: 'bg-gray-500/10 text-gray-500',
  export: 'bg-orange-500/10 text-orange-500',
};

const getActionColor = (action: string) => {
  if (action.startsWith('view')) return actionColors.view;
  if (action.startsWith('create')) return actionColors.create;
  if (action.startsWith('update')) return actionColors.update;
  if (action.startsWith('delete')) return actionColors.delete;
  if (action === 'login') return actionColors.login;
  if (action === 'logout') return actionColors.logout;
  if (action.startsWith('export')) return actionColors.export;
  return 'bg-muted text-muted-foreground';
};

const roleLabels: Record<string, string> = {
  admin: 'Admin',
  health_architect: 'Health Architect',
  coach: 'Coach',
  client: 'Client',
};

export function ActivityLogList() {
  const [searchTerm, setSearchTerm] = useState('');
  const [actionFilter, setActionFilter] = useState<string>('all');
  const [resourceFilter, setResourceFilter] = useState<string>('all');

  const { data: logs, isLoading } = useQuery({
    queryKey: ['crm-activity-logs'],
    queryFn: async () => {
      // Use raw query since the types file hasn't been regenerated yet
      const { data, error } = await (supabase as any)
        .from('crm_activity_log')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(500);

      if (error) throw error;
      return (data || []) as ActivityLog[];
    },
  });

  const filteredLogs = logs?.filter(log => {
    const matchesSearch = 
      !searchTerm || 
      log.user_email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.action.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesAction = 
      actionFilter === 'all' || 
      log.action.startsWith(actionFilter);
    
    const matchesResource = 
      resourceFilter === 'all' || 
      log.resource_type === resourceFilter;

    return matchesSearch && matchesAction && matchesResource;
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
            <Activity className="h-8 w-8" />
            Activity Log
          </h1>
          <p className="text-muted-foreground mt-1">
            Track all CRM access and actions for audit purposes
          </p>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by email or action..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={actionFilter} onValueChange={setActionFilter}>
              <SelectTrigger className="w-[180px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Action type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Actions</SelectItem>
                <SelectItem value="view">Views</SelectItem>
                <SelectItem value="create">Creates</SelectItem>
                <SelectItem value="update">Updates</SelectItem>
                <SelectItem value="delete">Deletes</SelectItem>
                <SelectItem value="login">Logins</SelectItem>
                <SelectItem value="export">Exports</SelectItem>
              </SelectContent>
            </Select>
            <Select value={resourceFilter} onValueChange={setResourceFilter}>
              <SelectTrigger className="w-[180px]">
                <FileText className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Resource type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Resources</SelectItem>
                <SelectItem value="dashboard">Dashboard</SelectItem>
                <SelectItem value="client">Clients</SelectItem>
                <SelectItem value="intake_form">Intake Forms</SelectItem>
                <SelectItem value="membership">Memberships</SelectItem>
                <SelectItem value="purchase">Purchases</SelectItem>
                <SelectItem value="document">Documents</SelectItem>
                <SelectItem value="campaign">Campaigns</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Activity Table */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>
            Showing {filteredLogs?.length || 0} activity entries
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Time</TableHead>
                <TableHead>User</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Action</TableHead>
                <TableHead>Resource</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredLogs?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                    No activity logs found
                  </TableCell>
                </TableRow>
              ) : (
                filteredLogs?.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell className="whitespace-nowrap">
                      <div className="flex items-center gap-2 text-sm">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        {format(new Date(log.created_at), 'MMM d, yyyy h:mm a')}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{log.user_email || 'Unknown'}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-xs">
                        {roleLabels[log.user_role || ''] || log.user_role}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={getActionColor(log.action)}>
                        {actionLabels[log.action] || log.action}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-muted-foreground capitalize">
                        {log.resource_type.replace('_', ' ')}
                        {log.resource_id && (
                          <span className="text-xs ml-1">
                            ({log.resource_id.slice(0, 8)}...)
                          </span>
                        )}
                      </span>
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
