import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { 
  ArrowLeft,
  Search,
  Shield,
  Crown,
  Dumbbell,
  User,
  Users,
  Loader2,
  CheckCircle2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

type UserRole = 'admin' | 'health_architect' | 'coach' | 'client';

interface UserWithRole {
  user_id: string;
  email: string | null;
  full_name: string | null;
  role: UserRole | null;
  created_at: string;
}

const roleConfig: Record<UserRole, { label: string; color: string; icon: typeof User }> = {
  admin: { label: 'Admin', color: 'bg-red-500/20 text-red-500 border-red-500/30', icon: Shield },
  health_architect: { label: 'Health Architect', color: 'bg-secondary/20 text-secondary border-secondary/30', icon: Crown },
  coach: { label: 'Coach', color: 'bg-blue-500/20 text-blue-500 border-blue-500/30', icon: Dumbbell },
  client: { label: 'Client', color: 'bg-gray-500/20 text-gray-400 border-gray-500/30', icon: User },
};

const AdminPanel = () => {
  const { user, role: currentUserRole } = useAuth();
  const { toast } = useToast();
  
  const [users, setUsers] = useState<UserWithRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [updating, setUpdating] = useState<string | null>(null);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    const fetchUsers = async () => {
      if (!user || currentUserRole !== 'admin') {
        setLoading(false);
        return;
      }

      const { data, error } = await supabase.rpc('get_all_users_with_roles');

      if (error) {
        toast({
          title: 'Failed to load users',
          description: error.message,
          variant: 'destructive',
        });
      } else if (data) {
        setUsers(data as UserWithRole[]);
      }
      setLoading(false);
    };

    fetchUsers();
  }, [user, currentUserRole, toast]);

  const filteredUsers = users.filter(u => {
    const matchesSearch = searchQuery === '' || 
      u.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesRole = roleFilter === 'all' || u.role === roleFilter;

    return matchesSearch && matchesRole;
  });

  const updateUserRole = async (targetUserId: string, newRole: UserRole) => {
    if (targetUserId === user?.id) {
      toast({
        title: 'Cannot change your own role',
        variant: 'destructive',
      });
      return;
    }

    setUpdating(targetUserId);

    const { error } = await supabase.rpc('update_user_role', {
      _target_user_id: targetUserId,
      _new_role: newRole,
    });

    if (error) {
      toast({
        title: 'Failed to update role',
        description: error.message,
        variant: 'destructive',
      });
    } else {
      setUsers(prev => 
        prev.map(u => u.user_id === targetUserId ? { ...u, role: newRole } : u)
      );
      toast({
        title: 'Role updated',
        description: `User role changed to ${roleConfig[newRole].label}`,
      });
    }

    setUpdating(null);
  };

  const stats = {
    total: users.length,
    admins: users.filter(u => u.role === 'admin').length,
    healthArchitects: users.filter(u => u.role === 'health_architect').length,
    coaches: users.filter(u => u.role === 'coach').length,
    clients: users.filter(u => u.role === 'client').length,
  };

  if (currentUserRole !== 'admin') {
    return (
      <>
        <Navbar />
        <main className="min-h-screen pt-32 pb-16">
          <div className="container mx-auto px-4 text-center">
            <Shield className="w-16 h-16 text-destructive mx-auto mb-4" />
            <h1 className="text-2xl font-bold mb-2">Access Denied</h1>
            <p className="text-muted-foreground mb-6">You need admin privileges to access this page.</p>
            <Button variant="hero" asChild>
              <Link to="/portal">Go to Portal</Link>
            </Button>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Helmet>
        <title>Admin Panel | VitalityX Health</title>
      </Helmet>

      <main className="min-h-screen">
        <Navbar />
        
        {/* Header */}
        <section className="pt-32 pb-8 lg:pt-40 lg:pb-12">
          <div className="container mx-auto px-4 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <Button variant="ghost" size="sm" asChild className="mb-4">
                <Link to="/portal">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Portal
                </Link>
              </Button>
              <div className="flex items-center gap-3 mb-2">
                <Shield className="w-8 h-8 text-secondary" />
                <h1 className="text-3xl md:text-4xl font-bold">Admin Panel</h1>
              </div>
              <p className="text-muted-foreground">
                Manage user roles and permissions
              </p>
            </motion.div>
          </div>
        </section>

        {/* Stats */}
        <section className="pb-8">
          <div className="container mx-auto px-4 lg:px-8">
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {[
                { label: 'Total Users', value: stats.total, icon: Users, color: 'text-foreground' },
                { label: 'Admins', value: stats.admins, icon: Shield, color: 'text-red-500' },
                { label: 'Health Architects', value: stats.healthArchitects, icon: Crown, color: 'text-secondary' },
                { label: 'Coaches', value: stats.coaches, icon: Dumbbell, color: 'text-blue-500' },
                { label: 'Clients', value: stats.clients, icon: User, color: 'text-gray-400' },
              ].map((stat) => (
                <div key={stat.label} className="glass-card rounded-xl p-4">
                  <stat.icon className={`w-5 h-5 ${stat.color} mb-2`} />
                  <p className="text-2xl font-bold">{stat.value}</p>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Filters */}
        <section className="pb-8">
          <div className="container mx-auto px-4 lg:px-8">
            <div className="glass-card rounded-xl p-4 flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name or email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-muted/50"
                />
              </div>
              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger className="w-full md:w-48 bg-muted/50">
                  <SelectValue placeholder="Filter by role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Roles</SelectItem>
                  {Object.entries(roleConfig).map(([key, config]) => (
                    <SelectItem key={key} value={key}>{config.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </section>

        {/* Users List */}
        <section className="pb-16 lg:pb-24">
          <div className="container mx-auto px-4 lg:px-8">
            {loading ? (
              <div className="text-center py-12">
                <Loader2 className="w-8 h-8 animate-spin mx-auto text-secondary" />
                <p className="text-muted-foreground mt-2">Loading users...</p>
              </div>
            ) : filteredUsers.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">No users found</div>
            ) : (
              <div className="space-y-3">
                {filteredUsers.map((u) => {
                  const role = u.role || 'client';
                  const config = roleConfig[role];
                  const RoleIcon = config.icon;
                  const isCurrentUser = u.user_id === user?.id;

                  return (
                    <motion.div
                      key={u.user_id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`glass-card rounded-xl p-5 ${isCurrentUser ? 'border-secondary/50' : ''}`}
                    >
                      <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                        {/* User Info */}
                        <div className="flex items-center gap-4 flex-1">
                          <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                            <User className="w-6 h-6 text-muted-foreground" />
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <p className="font-semibold truncate">
                                {u.full_name || 'No name'}
                              </p>
                              {isCurrentUser && (
                                <Badge variant="outline" className="text-xs">You</Badge>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground truncate">
                              {u.email}
                            </p>
                          </div>
                        </div>

                        {/* Current Role Badge */}
                        <Badge className={`${config.color} border whitespace-nowrap`}>
                          <RoleIcon className="w-3 h-3 mr-1" />
                          {config.label}
                        </Badge>

                        {/* Join Date */}
                        <div className="text-sm text-muted-foreground whitespace-nowrap">
                          Joined {new Date(u.created_at).toLocaleDateString()}
                        </div>

                        {/* Role Selector */}
                        <div className="flex items-center gap-2">
                          <Select
                            value={role}
                            onValueChange={(value) => updateUserRole(u.user_id, value as UserRole)}
                            disabled={isCurrentUser || updating === u.user_id}
                          >
                            <SelectTrigger className="w-44">
                              {updating === u.user_id ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                <SelectValue />
                              )}
                            </SelectTrigger>
                            <SelectContent>
                              {Object.entries(roleConfig).map(([key, cfg]) => (
                                <SelectItem key={key} value={key}>
                                  <div className="flex items-center gap-2">
                                    <cfg.icon className="w-4 h-4" />
                                    {cfg.label}
                                  </div>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          {updating === u.user_id && (
                            <CheckCircle2 className="w-5 h-5 text-secondary animate-pulse" />
                          )}
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>
        </section>

        <Footer />
      </main>
    </>
  );
};

export default AdminPanel;
