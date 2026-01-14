import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useAuth } from '@/hooks/useAuth';
import { Navigate } from 'react-router-dom';
import { CRMSidebar } from '@/components/crm/CRMSidebar';
import { CRMDashboard } from '@/components/crm/CRMDashboard';
import { ClientsList } from '@/components/crm/ClientsList';
import { MembershipsList } from '@/components/crm/MembershipsList';
import { PurchasesList } from '@/components/crm/PurchasesList';
import { DocumentsList } from '@/components/crm/DocumentsList';
import { CampaignsList } from '@/components/crm/CampaignsList';
import { Skeleton } from '@/components/ui/skeleton';

export default function CRM() {
  const { user, loading, isStaff } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');

  if (loading) {
    return (
      <div className="flex min-h-screen bg-background">
        <div className="w-64 p-4">
          <Skeleton className="h-8 w-32 mb-8" />
          <div className="space-y-2">
            {[...Array(6)].map((_, i) => (
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
    return <Navigate to="/auth" replace />;
  }

  if (!isStaff) {
    return <Navigate to="/portal" replace />;
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <CRMDashboard />;
      case 'clients':
        return <ClientsList />;
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
    <>
      <Helmet>
        <title>CRM - VitalityX Health</title>
        <meta name="description" content="VitalityX Health Client Relationship Management System" />
      </Helmet>

      <div className="flex min-h-screen bg-background">
        <CRMSidebar activeTab={activeTab} onTabChange={setActiveTab} />
        <main className="flex-1 p-8 overflow-auto">
          {renderContent()}
        </main>
      </div>
    </>
  );
}
