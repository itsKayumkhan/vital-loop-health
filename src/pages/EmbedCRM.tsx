import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useCRMActivityLog } from '@/hooks/useCRMActivityLog';
import { CRMSidebar } from '@/components/crm/CRMSidebar';
import { CRMDashboard } from '@/components/crm/CRMDashboard';
import { CoachDashboard } from '@/components/crm/CoachDashboard';
import { CoachPerformance } from '@/components/crm/CoachPerformance';
import { SatisfactionSurveysList } from '@/components/crm/SatisfactionSurveysList';
import { ClientsList } from '@/components/crm/ClientsList';
import { MembershipsList } from '@/components/crm/MembershipsList';
import { PurchasesList } from '@/components/crm/PurchasesList';
import { DocumentsList } from '@/components/crm/DocumentsList';
import { CampaignsList } from '@/components/crm/CampaignsList';
import { IntakeFormsList } from '@/components/crm/IntakeFormsList';
import { ActivityLogList } from '@/components/crm/ActivityLogList';
import { RoleManagement } from '@/components/crm/RoleManagement';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AlertTriangle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function EmbedCRM() {
  const { user, loading, isStaff, role, signIn } = useAuth();
  const { logActivity } = useCRMActivityLog();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSigningIn, setIsSigningIn] = useState(false);

  // Log activity when tab changes
  useEffect(() => {
    if (user && isStaff) {
      const actionMap: Record<string, { action: any; resourceType: any }> = {
        dashboard: { action: 'view_dashboard', resourceType: 'dashboard' },
        clients: { action: 'view_clients', resourceType: 'client' },
        'intake-forms': { action: 'view_intake_forms', resourceType: 'intake_form' },
        memberships: { action: 'view_memberships', resourceType: 'membership' },
        purchases: { action: 'view_purchases', resourceType: 'purchase' },
        documents: { action: 'view_documents', resourceType: 'document' },
        campaigns: { action: 'view_campaigns', resourceType: 'campaign' },
        'coach-performance': { action: 'view_dashboard', resourceType: 'dashboard' },
        'activity-log': { action: 'view_activity_log', resourceType: 'activity_log' },
        'role-management': { action: 'view_clients', resourceType: 'client' },
      };
      
      const mapping = actionMap[activeTab];
      if (mapping) {
        logActivity({
          action: mapping.action,
          resourceType: mapping.resourceType,
        });
      }
    }
  }, [activeTab, user, isStaff, logActivity]);

  // Determine which tabs the user can access based on role
  const getAccessibleTabs = () => {
    if (role === 'admin') {
      return ['dashboard', 'clients', 'intake-forms', 'memberships', 'purchases', 'documents', 'campaigns', 'coach-performance', 'satisfaction-surveys', 'activity-log', 'role-management'];
    }
    if (role === 'health_architect') {
      return ['dashboard', 'clients', 'intake-forms', 'memberships', 'purchases', 'documents', 'campaigns', 'satisfaction-surveys'];
    }
    if (role === 'coach') {
      return ['dashboard', 'clients', 'intake-forms', 'documents'];
    }
    return [];
  };

  const accessibleTabs = getAccessibleTabs();

  // Handle sign in directly on this page
  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSigningIn(true);
    
    const { error } = await signIn(email, password);
    
    if (error) {
      toast.error('Sign in failed', { description: error.message });
    } else {
      toast.success('Welcome back!');
      // Log login activity
      logActivity({
        action: 'login',
        resourceType: 'session',
      });
    }
    
    setIsSigningIn(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-secondary" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-8">
        <Card className="max-w-md w-full">
          <CardHeader className="text-center">
            <CardTitle>Staff Sign In</CardTitle>
            <CardDescription>Sign in to access the VitalityX CRM</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSignIn} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@vitalityxhealth.com"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                />
              </div>
              <Button type="submit" className="w-full" disabled={isSigningIn}>
                {isSigningIn ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Signing In...
                  </>
                ) : (
                  'Sign In'
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!isStaff) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-8">
        <Card className="max-w-md w-full">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <AlertTriangle className="h-12 w-12 text-yellow-500" />
            </div>
            <CardTitle>Access Denied</CardTitle>
            <CardDescription>
              You don't have permission to access the CRM. 
              {role === 'client' && ' This area is for staff members only.'}
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Button variant="outline" onClick={() => navigate('/portal')}>
              Go to My VitalityX
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const renderContent = () => {
    // Check if user has access to the current tab
    if (!accessibleTabs.includes(activeTab)) {
      return <CRMDashboard />;
    }

    switch (activeTab) {
      case 'dashboard':
        // Show coach-specific dashboard for coaches
        return role === 'coach' ? <CoachDashboard /> : <CRMDashboard />;
      case 'clients':
        return <ClientsList />;
      case 'intake-forms':
        return <IntakeFormsList />;
      case 'memberships':
        return <MembershipsList />;
      case 'purchases':
        return <PurchasesList />;
      case 'documents':
        return <DocumentsList />;
      case 'campaigns':
        return <CampaignsList />;
      case 'coach-performance':
        return <CoachPerformance />;
      case 'satisfaction-surveys':
        return <SatisfactionSurveysList />;
      case 'activity-log':
        return <ActivityLogList />;
      case 'role-management':
        return <RoleManagement />;
      default:
        return <CRMDashboard />;
    }
  };

  return (
    <div className="flex min-h-screen bg-background">
      <CRMSidebar 
        activeTab={activeTab} 
        onTabChange={setActiveTab} 
        accessibleTabs={accessibleTabs}
        userRole={role}
      />
      <main className="flex-1 p-8 overflow-auto">
        {renderContent()}
      </main>
    </div>
  );
}
