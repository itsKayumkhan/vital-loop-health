import { Users, FileText, ShoppingCart, Crown, Megaphone, LayoutDashboard, ArrowLeft, ClipboardList, LogOut, Shield, Activity, UserCog, BarChart3, Star, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Badge } from '@/components/ui/badge';

interface CRMSidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  accessibleTabs?: string[];
  userRole?: string | null;
}

// Grouped navigation structure
const navSections = [
  {
    label: 'Overview',
    items: [
      { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
      { id: 'coach-view', label: 'Coach View', icon: Eye },
    ],
  },
  {
    label: 'Client Management',
    items: [
      { id: 'clients', label: 'Clients', icon: Users },
      { id: 'documents', label: 'Documents', icon: FileText },
      { id: 'intake-forms', label: 'Intake Forms', icon: ClipboardList },
      { id: 'memberships', label: 'Memberships', icon: Crown },
      { id: 'purchases', label: 'Purchases', icon: ShoppingCart },
    ],
  },
  {
    label: 'Analytics',
    items: [
      { id: 'activity-log', label: 'Activity Log', icon: Activity },
      { id: 'coach-performance', label: 'Coach Performance', icon: BarChart3 },
      { id: 'satisfaction-surveys', label: 'Satisfaction Surveys', icon: Star },
    ],
  },
  {
    label: 'Settings',
    items: [
      { id: 'campaigns', label: 'Marketing', icon: Megaphone },
      { id: 'role-management', label: 'Role Management', icon: UserCog },
    ],
  },
];

// Flatten for backwards compatibility
const navItems = navSections.flatMap(section => section.items);

const roleLabels: Record<string, string> = {
  admin: 'Admin',
  health_architect: 'Health Architect',
  coach: 'Coach',
  client: 'Client',
};

export function CRMSidebar({ activeTab, onTabChange, accessibleTabs, userRole }: CRMSidebarProps) {
  const { signOut, user } = useAuth();
  
  // If no accessibleTabs provided, show all (backwards compatibility)
  const visibleTabs = accessibleTabs || navItems.map(item => item.id);

  const handleSignOut = async () => {
    await signOut();
  };

  // Filter sections to only show items the user has access to
  const visibleSections = navSections
    .map(section => ({
      ...section,
      items: section.items.filter(item => visibleTabs.includes(item.id)),
    }))
    .filter(section => section.items.length > 0);

  return (
    <div className="w-64 bg-card border-r border-border min-h-screen p-4 flex flex-col">
      <div className="mb-6">
        <Link to="/" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-4">
          <ArrowLeft className="h-4 w-4" />
          <span className="text-sm">Back to Site</span>
        </Link>
        <h2 className="text-xl font-bold text-foreground">VitalityX CRM</h2>
        <p className="text-sm text-muted-foreground">Client Management System</p>
      </div>

      <nav className="flex-1 space-y-4 overflow-y-auto">
        {visibleSections.map((section, sectionIndex) => (
          <div key={section.label}>
            {/* Section divider (not on first section) */}
            {sectionIndex > 0 && (
              <div className="border-t border-border mb-3" />
            )}
            
            {/* Section label */}
            <h3 className="px-3 mb-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              {section.label}
            </h3>
            
            {/* Section items */}
            <div className="space-y-1">
              {section.items.map((item) => (
                <Button
                  key={item.id}
                  variant="ghost"
                  className={cn(
                    "w-full justify-start gap-3",
                    activeTab === item.id && "bg-primary/10 text-primary"
                  )}
                  onClick={() => onTabChange(item.id)}
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </Button>
              ))}
            </div>
          </div>
        ))}
      </nav>

      {/* User info and sign out */}
      <div className="border-t border-border pt-4 mt-4 space-y-3">
        <div className="px-2">
          <div className="flex items-center gap-2 mb-1">
            <Shield className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium text-foreground truncate">
              {user?.email}
            </span>
          </div>
          {userRole && (
            <Badge variant="secondary" className="text-xs">
              {roleLabels[userRole] || userRole}
            </Badge>
          )}
        </div>
        <Button
          variant="ghost"
          className="w-full justify-start gap-3 text-muted-foreground hover:text-foreground"
          onClick={handleSignOut}
        >
          <LogOut className="h-4 w-4" />
          Sign Out
        </Button>
      </div>
    </div>
  );
}
