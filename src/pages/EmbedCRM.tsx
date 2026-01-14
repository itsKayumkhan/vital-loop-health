import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { CRMSidebar } from '@/components/crm/CRMSidebar';
import { CRMDashboard } from '@/components/crm/CRMDashboard';
import { ClientsList } from '@/components/crm/ClientsList';
import { MembershipsList } from '@/components/crm/MembershipsList';
import { PurchasesList } from '@/components/crm/PurchasesList';
import { DocumentsList } from '@/components/crm/DocumentsList';
import { CampaignsList } from '@/components/crm/CampaignsList';
import { IntakeFormsList } from '@/components/crm/IntakeFormsList';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertTriangle } from 'lucide-react';

export default function EmbedCRM() {
  const { user, loading, isStaff } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');

  if (loading) {
    return (
      <div className="flex min-h-screen bg-background">
        <div className="w-64 p-4">
          <Skeleton className="h-8 w-32 mb-8" />
          <div className="space-y-2">
            {[...Array(7)].map((_, i) => (
              <Skeleton key={i} className="h-10 w-full" />
            ))}
          </div>
        </div>
        <div className="flex-1 p-8">
          <Skeleton className="h-12 w-64 mb-6" />
          <div className="grid grid-cols-4 gap-4 mb-6">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-24" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-8">
        <Card className="max-w-md w-full">
          <CardHeader className="text-center">
            <CardTitle>Sign In Required</CardTitle>
            <CardDescription>Please sign in to access the CRM</CardDescription>
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

  if (!isStaff) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-8">
        <Card className="max-w-md w-full">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <AlertTriangle className="h-12 w-12 text-yellow-500" />
            </div>
            <CardTitle>Access Denied</CardTitle>
            <CardDescription>You don't have permission to access the CRM. Staff access required.</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <CRMDashboard />;
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
      default:
        return <CRMDashboard />;
    }
  };

  return (
    <div className="flex min-h-screen bg-background">
      <CRMSidebar activeTab={activeTab} onTabChange={setActiveTab} />
      <main className="flex-1 p-8 overflow-auto">
        {renderContent()}
      </main>
    </div>
  );
}