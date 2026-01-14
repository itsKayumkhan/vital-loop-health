import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { format } from 'date-fns';
import { Users, Search, Shield, UserCog, Crown, Briefcase, User } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';
import { useCRMActivityLog } from '@/hooks/useCRMActivityLog';

type AppRole = 'admin' | 'health_architect' | 'coach' | 'client';

interface UserWithRole {
  user_id: string;
  email: string;
  full_name: string;
  role: AppRole;
  created_at: string;
}

const roleConfig: Record<AppRole, { label: string; icon: typeof Shield; color: string; description: string }> = {
  admin: { 
    label: 'Admin', 
    icon: Shield, 
    color: 'bg-red-500/10 text-red-500 border-red-500/20',
    description: 'Full access to all CRM features and settings'
  },
  health_architect: { 
    label: 'Health Architect', 
    icon: Crown, 
    color: 'bg-purple-500/10 text-purple-500 border-purple-500/20',
    description: 'Access to all client management features'
  },
  coach: { 
    label: 'Coach', 
    icon: Briefcase, 
    color: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
    description: 'Access to assigned clients and intake forms'
  },
  client: { 
    label: 'Client', 
    icon: User, 
    color: 'bg-gray-500/10 text-gray-500 border-gray-500/20',
    description: 'Access to personal portal only'
  },
};

export function RoleManagement() {
  const { user: currentUser } = useAuth();
  const { logActivity } = useCRMActivityLog();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [selectedUser, setSelectedUser] = useState<UserWithRole | null>(null);
  const [newRole, setNewRole] = useState<AppRole | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const { data: users, isLoading } = useQuery({
    queryKey: ['users-with-roles'],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_all_users_with_roles');
      if (error) throw error;
      return data as UserWithRole[];
    },
  });

  const updateRoleMutation = useMutation({
    mutationFn: async ({ userId, role }: { userId: string; role: AppRole }) => {
      const { data, error } = await supabase.rpc('update_user_role', {
        _target_user_id: userId,
        _new_role: role,
      });
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users-with-roles'] });
      toast.success('Role updated successfully');
      logActivity({
        action: 'update_client',
        resourceType: 'client',
        resourceId: selectedUser?.user_id,
        details: { 
          action: 'role_change',
          previousRole: selectedUser?.role,
          newRole: newRole,
          userEmail: selectedUser?.email,
        },
      });
      setDialogOpen(false);
      setSelectedUser(null);
      setNewRole(null);
    },
    onError: (error: Error) => {
      toast.error('Failed to update role', { description: error.message });
    },
  });

  const handleRoleChange = (user: UserWithRole) => {
    setSelectedUser(user);
    setNewRole(user.role);
    setDialogOpen(true);
  };

  const confirmRoleChange = () => {
    if (selectedUser && newRole && newRole !== selectedUser.role) {
      updateRoleMutation.mutate({ userId: selectedUser.user_id, role: newRole });
    } else {
      setDialogOpen(false);
    }
  };

  const filteredUsers = users?.filter(user => {
    const matchesSearch = 
      !searchTerm || 
      user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.full_name?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesRole = 
      roleFilter === 'all' || 
      user.role === roleFilter;

    return matchesSearch && matchesRole;
  });

  const roleCounts = users?.reduce((acc, user) => {
    acc[user.role] = (acc[user.role] || 0) + 1;
    return acc;
  }, {} as Record<string, number>) || {};

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
            <UserCog className="h-8 w-8" />
            Role Management
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage user roles and access permissions
          </p>
        </div>
      </div>

      {/* Role Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {(Object.keys(roleConfig) as AppRole[]).map(role => {
          const config = roleConfig[role];
          const Icon = config.icon;
          return (
            <Card key={role} className="cursor-pointer hover:border-primary/50 transition-colors" onClick={() => setRoleFilter(role)}>
              <CardContent className="pt-4">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${config.color}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{roleCounts[role] || 0}</p>
                    <p className="text-sm text-muted-foreground">{config.label}s</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-[180px]">
                <Users className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Filter by role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="admin">Admins</SelectItem>
                <SelectItem value="health_architect">Health Architects</SelectItem>
                <SelectItem value="coach">Coaches</SelectItem>
                <SelectItem value="client">Clients</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle>Users</CardTitle>
          <CardDescription>
            {filteredUsers?.length || 0} users found
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Current Role</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                    No users found
                  </TableCell>
                </TableRow>
              ) : (
                filteredUsers?.map((user) => {
                  const config = roleConfig[user.role];
                  const Icon = config.icon;
                  const isCurrentUser = user.user_id === currentUser?.id;
                  
                  return (
                    <TableRow key={user.user_id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className={`p-1.5 rounded-full ${config.color}`}>
                            <Icon className="h-4 w-4" />
                          </div>
                          <span className="font-medium">
                            {user.full_name || 'No name'}
                            {isCurrentUser && (
                              <Badge variant="outline" className="ml-2 text-xs">You</Badge>
                            )}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {user.email}
                      </TableCell>
                      <TableCell>
                        <Badge className={config.color}>
                          {config.label}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {format(new Date(user.created_at), 'MMM d, yyyy')}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleRoleChange(user)}
                          disabled={isCurrentUser}
                        >
                          Change Role
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Change Role Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change User Role</DialogTitle>
            <DialogDescription>
              Update the role for {selectedUser?.full_name || selectedUser?.email}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-3">
              {(Object.keys(roleConfig) as AppRole[]).map(role => {
                const config = roleConfig[role];
                const Icon = config.icon;
                const isSelected = newRole === role;
                
                return (
                  <div
                    key={role}
                    className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                      isSelected 
                        ? 'border-primary bg-primary/5' 
                        : 'border-border hover:border-primary/50'
                    }`}
                    onClick={() => setNewRole(role)}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${config.color}`}>
                        <Icon className="h-5 w-5" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">{config.label}</p>
                        <p className="text-sm text-muted-foreground">{config.description}</p>
                      </div>
                      {isSelected && (
                        <div className="h-4 w-4 rounded-full bg-primary" />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={confirmRoleChange}
              disabled={!newRole || newRole === selectedUser?.role || updateRoleMutation.isPending}
            >
              {updateRoleMutation.isPending ? 'Updating...' : 'Update Role'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
