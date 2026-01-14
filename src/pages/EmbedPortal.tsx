import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Crown,
  ShoppingCart,
  Users,
  FileText,
  Calendar,
  FolderOpen,
  ArrowRight,
  Clock,
  CheckCircle2,
  AlertCircle,
  User,
  LogOut,
  Mail,
  Phone
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { coachForms } from '@/data/coachForms';

// Types
interface Membership {
  id: string;
  tier: 'free' | 'essential' | 'premium' | 'elite';
  status: 'active' | 'paused' | 'cancelled' | 'expired';
  start_date: string;
  renewal_date: string | null;
  monthly_price: number | null;
}

interface Purchase {
  id: string;
  product_name: string;
  amount: number;
  currency: string;
  status: string;
  purchased_at: string;
  purchase_type: string;
}

interface FormSubmission {
  id: string;
  specialty: string;
  status: string;
  submitted_at: string;
}

interface Document {
  id: string;
  name: string;
  document_type: string;
  file_path: string;
  created_at: string;
}

interface AssignedCoach {
  specialty: string;
  assigned_at: string;
}

// Status configs
const membershipTierConfig: Record<string, { label: string; color: string; icon: string }> = {
  free: { label: 'Free', color: 'bg-gray-500/20 text-gray-500', icon: '🌱' },
  essential: { label: 'Essential', color: 'bg-blue-500/20 text-blue-500', icon: '⭐' },
  premium: { label: 'Premium', color: 'bg-purple-500/20 text-purple-500', icon: '💎' },
  elite: { label: 'Elite', color: 'bg-secondary/20 text-secondary', icon: '👑' },
};

const membershipStatusConfig: Record<string, { label: string; color: string }> = {
  active: { label: 'Active', color: 'bg-green-500/20 text-green-500' },
  paused: { label: 'Paused', color: 'bg-yellow-500/20 text-yellow-500' },
  cancelled: { label: 'Cancelled', color: 'bg-red-500/20 text-red-500' },
  expired: { label: 'Expired', color: 'bg-gray-500/20 text-gray-500' },
};

const formStatusConfig: Record<string, { label: string; color: string; icon: typeof Clock }> = {
  pending: { label: 'Pending Review', color: 'bg-yellow-500/20 text-yellow-500', icon: Clock },
  in_review: { label: 'In Review', color: 'bg-blue-500/20 text-blue-500', icon: AlertCircle },
  assigned: { label: 'Coach Assigned', color: 'bg-purple-500/20 text-purple-500', icon: User },
  completed: { label: 'Completed', color: 'bg-green-500/20 text-green-500', icon: CheckCircle2 },
  archived: { label: 'Archived', color: 'bg-gray-500/20 text-gray-500', icon: FileText },
};

const EmbedPortal = () => {
  const { user, signOut, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const [membership, setMembership] = useState<Membership | null>(null);
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [submissions, setSubmissions] = useState<FormSubmission[]>([]);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [assignedCoaches, setAssignedCoaches] = useState<AssignedCoach[]>([]);
  const [profile, setProfile] = useState<{ full_name: string | null; email: string | null; phone: string | null } | null>(null);

  useEffect(() => {
    const fetchClientData = async () => {
      if (!user) return;

      const [
        { data: profileData },
        { data: membershipData },
        { data: purchasesData },
        { data: submissionsData },
        { data: documentsData }
      ] = await Promise.all([
        supabase.from('profiles').select('full_name, email, phone').eq('user_id', user.id).single(),
        supabase.from('crm_clients').select('id').eq('user_id', user.id).single().then(async (clientResult) => {
          if (clientResult.data?.id) {
            return supabase.from('crm_memberships')
              .select('*')
              .eq('client_id', clientResult.data.id)
              .eq('status', 'active')
              .order('start_date', { ascending: false })
              .limit(1);
          }
          return { data: null };
        }),
        supabase.from('crm_clients').select('id').eq('user_id', user.id).single().then(async (clientResult) => {
          if (clientResult.data?.id) {
            return supabase.from('crm_purchases')
              .select('*')
              .eq('client_id', clientResult.data.id)
              .order('purchased_at', { ascending: false })
              .limit(10);
          }
          return { data: null };
        }),
        supabase.from('coach_intake_forms')
          .select('id, specialty, status, submitted_at')
          .eq('user_id', user.id)
          .order('submitted_at', { ascending: false }),
        supabase.from('crm_clients').select('id').eq('user_id', user.id).single().then(async (clientResult) => {
          if (clientResult.data?.id) {
            return supabase.from('crm_documents')
              .select('*')
              .eq('client_id', clientResult.data.id)
              .eq('shared_with_client', true)
              .order('created_at', { ascending: false });
          }
          return { data: null };
        }),
      ]);

      setProfile(profileData);
      if (membershipData && Array.isArray(membershipData) && membershipData.length > 0) {
        setMembership(membershipData[0] as Membership);
      }
      if (purchasesData) setPurchases(purchasesData as Purchase[]);
      if (submissionsData) setSubmissions(submissionsData);
      if (documentsData) setDocuments(documentsData as Document[]);

      const coaches = submissionsData
        ?.filter(s => s.status === 'assigned' || s.status === 'completed')
        .map(s => ({ specialty: s.specialty, assigned_at: s.submitted_at })) || [];
      setAssignedCoaches(coaches);

      setLoading(false);
    };

    fetchClientData();
  }, [user]);

  const getFormConfig = (specialty: string) => coachForms.find(f => f.specialty === specialty);

  // Show login prompt for embed
  if (!authLoading && !user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-8">
        <Card className="max-w-md w-full">
          <CardHeader className="text-center">
            <CardTitle>Sign In Required</CardTitle>
            <CardDescription>Please sign in to access your VitalityX portal</CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full" onClick={() => window.open('/auth', '_blank')}>
              Sign In
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header - Compact for embed */}
      <div className="border-b border-border bg-background/95 backdrop-blur-sm sticky top-0 z-10">
        <div className="px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold">
              {profile?.full_name || 'My VitalityX'}
            </h1>
            <p className="text-sm text-muted-foreground">{user?.email}</p>
          </div>
          <Button variant="outline" size="sm" onClick={signOut}>
            <LogOut className="w-4 h-4 mr-2" />
            Sign Out
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-6">
        {loading ? (
          <div className="text-center py-12 text-muted-foreground">Loading your portal...</div>
        ) : (
          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3 md:grid-cols-6 gap-2">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="membership">Membership</TabsTrigger>
              <TabsTrigger value="purchases">Purchases</TabsTrigger>
              <TabsTrigger value="coaches">My Coaches</TabsTrigger>
              <TabsTrigger value="forms">Intake Forms</TabsTrigger>
              <TabsTrigger value="documents">Documents</TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-6">
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Membership Card */}
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-lg font-medium">Membership</CardTitle>
                    <Crown className="h-5 w-5 text-secondary" />
                  </CardHeader>
                  <CardContent>
                    {membership ? (
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <span className="text-2xl">{membershipTierConfig[membership.tier]?.icon}</span>
                          <Badge className={membershipTierConfig[membership.tier]?.color}>
                            {membershipTierConfig[membership.tier]?.label}
                          </Badge>
                          <Badge className={membershipStatusConfig[membership.status]?.color}>
                            {membershipStatusConfig[membership.status]?.label}
                          </Badge>
                        </div>
                        {membership.renewal_date && (
                          <p className="text-sm text-muted-foreground">
                            Renews: {new Date(membership.renewal_date).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                    ) : (
                      <p className="text-muted-foreground">No active membership</p>
                    )}
                  </CardContent>
                </Card>

                {/* Coaches Card */}
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-lg font-medium">Assigned Coaches</CardTitle>
                    <Users className="h-5 w-5 text-secondary" />
                  </CardHeader>
                  <CardContent>
                    {assignedCoaches.length > 0 ? (
                      <div className="space-y-2">
                        {assignedCoaches.map((coach, i) => {
                          const config = getFormConfig(coach.specialty);
                          return (
                            <Badge key={i} variant="outline">
                              {config?.title.replace(' Intake', '') || coach.specialty}
                            </Badge>
                          );
                        })}
                      </div>
                    ) : (
                      <p className="text-muted-foreground">No coaches assigned yet</p>
                    )}
                  </CardContent>
                </Card>

                {/* Recent Purchases Card */}
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-lg font-medium">Recent Purchases</CardTitle>
                    <ShoppingCart className="h-5 w-5 text-secondary" />
                  </CardHeader>
                  <CardContent>
                    {purchases.length > 0 ? (
                      <div className="space-y-2">
                        {purchases.slice(0, 3).map((purchase) => (
                          <div key={purchase.id} className="text-sm">
                            <p className="font-medium truncate">{purchase.product_name}</p>
                            <p className="text-muted-foreground">
                              ${purchase.amount} • {new Date(purchase.purchased_at).toLocaleDateString()}
                            </p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-muted-foreground">No purchases yet</p>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Membership Tab */}
            <TabsContent value="membership">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Crown className="h-5 w-5 text-secondary" />
                    Your Membership
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {membership ? (
                    <div className="space-y-6">
                      <div className="flex items-center gap-4">
                        <span className="text-4xl">{membershipTierConfig[membership.tier]?.icon}</span>
                        <div>
                          <h3 className="text-2xl font-bold">{membershipTierConfig[membership.tier]?.label} Plan</h3>
                          <Badge className={membershipStatusConfig[membership.status]?.color}>
                            {membershipStatusConfig[membership.status]?.label}
                          </Badge>
                        </div>
                      </div>
                      <div className="grid md:grid-cols-3 gap-4">
                        <div className="rounded-lg border p-4">
                          <p className="text-sm text-muted-foreground">Started</p>
                          <p className="font-semibold">{new Date(membership.start_date).toLocaleDateString()}</p>
                        </div>
                        {membership.renewal_date && (
                          <div className="rounded-lg border p-4">
                            <p className="text-sm text-muted-foreground">Next Renewal</p>
                            <p className="font-semibold">{new Date(membership.renewal_date).toLocaleDateString()}</p>
                          </div>
                        )}
                        {membership.monthly_price && (
                          <div className="rounded-lg border p-4">
                            <p className="text-sm text-muted-foreground">Monthly Rate</p>
                            <p className="font-semibold">${membership.monthly_price}/mo</p>
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Crown className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">No active membership</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Purchases Tab */}
            <TabsContent value="purchases">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ShoppingCart className="h-5 w-5 text-secondary" />
                    Purchase History
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {purchases.length > 0 ? (
                    <div className="space-y-4">
                      {purchases.map((purchase) => (
                        <div key={purchase.id} className="flex items-center justify-between p-4 rounded-lg border">
                          <div>
                            <p className="font-medium">{purchase.product_name}</p>
                            <p className="text-sm text-muted-foreground">
                              {new Date(purchase.purchased_at).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold">${purchase.amount}</p>
                            <Badge variant="outline">{purchase.purchase_type}</Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <ShoppingCart className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">No purchases yet</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Coaches Tab */}
            <TabsContent value="coaches">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-secondary" />
                    My Coaches
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {assignedCoaches.length > 0 ? (
                    <div className="grid md:grid-cols-2 gap-4">
                      {assignedCoaches.map((coach, i) => {
                        const config = getFormConfig(coach.specialty);
                        return (
                          <div key={i} className="p-4 rounded-lg border">
                            <div className="flex items-center gap-3">
                              <div className="h-10 w-10 rounded-full bg-secondary/20 flex items-center justify-center">
                                <User className="h-5 w-5 text-secondary" />
                              </div>
                              <div>
                                <p className="font-medium">{config?.title.replace(' Intake', '') || coach.specialty}</p>
                                <p className="text-sm text-muted-foreground">
                                  Assigned {new Date(coach.assigned_at).toLocaleDateString()}
                                </p>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">No coaches assigned yet</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Forms Tab */}
            <TabsContent value="forms">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-secondary" />
                    Intake Form Submissions
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {submissions.length > 0 ? (
                    <div className="space-y-4">
                      {submissions.map((submission) => {
                        const config = getFormConfig(submission.specialty);
                        const statusConfig = formStatusConfig[submission.status];
                        const StatusIcon = statusConfig?.icon || Clock;
                        return (
                          <div key={submission.id} className="flex items-center justify-between p-4 rounded-lg border">
                            <div className="flex items-center gap-3">
                              <StatusIcon className="h-5 w-5 text-muted-foreground" />
                              <div>
                                <p className="font-medium">{config?.title || submission.specialty}</p>
                                <p className="text-sm text-muted-foreground">
                                  Submitted {new Date(submission.submitted_at).toLocaleDateString()}
                                </p>
                              </div>
                            </div>
                            <Badge className={statusConfig?.color}>
                              {statusConfig?.label}
                            </Badge>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">No forms submitted yet</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Documents Tab */}
            <TabsContent value="documents">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FolderOpen className="h-5 w-5 text-secondary" />
                    Shared Documents
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {documents.length > 0 ? (
                    <div className="space-y-4">
                      {documents.map((doc) => (
                        <div key={doc.id} className="flex items-center justify-between p-4 rounded-lg border">
                          <div className="flex items-center gap-3">
                            <FolderOpen className="h-5 w-5 text-muted-foreground" />
                            <div>
                              <p className="font-medium">{doc.name}</p>
                              <p className="text-sm text-muted-foreground">
                                {new Date(doc.created_at).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          <Badge variant="outline">{doc.document_type}</Badge>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <FolderOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">No documents shared yet</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        )}
      </div>
    </div>
  );
};

export default EmbedPortal;