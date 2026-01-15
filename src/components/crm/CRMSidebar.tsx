import { useState } from 'react';
import { Brain, PieChart } from 'lucide-react';
import { Users, FileText, ShoppingCart, Crown, Megaphone, LayoutDashboard, ArrowLeft, ClipboardList, LogOut, Shield, Activity, UserCog, BarChart3, Star, Eye, Search, X, ChevronDown, ChevronRight, UserCheck, UserX, UserPlus, GitBranch, TrendingUp, Moon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

interface CRMSidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  accessibleTabs?: string[];
  userRole?: string | null;
}

// Sub-items for expandable menus
interface NavSubItem {
  id: string;
  label: string;
  icon: any;
}

interface NavItem {
  id: string;
  label: string;
  icon: any;
  subItems?: NavSubItem[];
}

interface NavSection {
  label: string;
  items: NavItem[];
}

// Grouped navigation structure with sub-items
const navSections: NavSection[] = [
  {
    label: 'Overview',
    items: [
      { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
      { id: 'coach-view', label: 'Coach View', icon: Eye },
      { id: 'coach-tracking', label: 'Client Tracking', icon: Activity },
    ],
  },
  {
    label: 'Client Management',
    items: [
      { 
        id: 'clients', 
        label: 'Clients', 
        icon: Users,
        subItems: [
          { id: 'clients-active', label: 'Active Clients', icon: UserCheck },
          { id: 'clients-leads', label: 'Leads', icon: UserPlus },
          { id: 'clients-cancelled', label: 'Cancelled', icon: UserX },
        ]
      },
      { id: 'lead-conversion', label: 'Lead Conversion', icon: GitBranch },
      { id: 'documents', label: 'Documents', icon: FileText },
      { id: 'intake-forms', label: 'Intake Forms', icon: ClipboardList },
      { id: 'memberships', label: 'Memberships', icon: Crown },
      { id: 'purchases', label: 'Purchases', icon: ShoppingCart },
    ],
  },
  {
    label: 'Programs',
    items: [
      { id: 'sleep-program', label: 'Sleep Optimization', icon: Moon },
      { id: 'mental-program', label: 'Mental Performance', icon: Brain },
    ],
  },
  {
    label: 'Analytics',
    items: [
      { id: 'program-analytics', label: 'Program Analytics', icon: PieChart },
      { id: 'revenue-forecast', label: 'Revenue Forecast', icon: TrendingUp },
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

// Flatten for backwards compatibility (include sub-items)
const navItems = navSections.flatMap(section => 
  section.items.flatMap(item => 
    item.subItems ? [item, ...item.subItems] : [item]
  )
);

const roleLabels: Record<string, string> = {
  admin: 'Admin',
  health_architect: 'Health Architect',
  coach: 'Coach',
  client: 'Client',
};

export function CRMSidebar({ activeTab, onTabChange, accessibleTabs, userRole }: CRMSidebarProps) {
  const { signOut, user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedItems, setExpandedItems] = useState<string[]>(['clients']); // Default expand clients
  
  // If no accessibleTabs provided, show all (backwards compatibility)
  const visibleTabs = accessibleTabs || navItems.map(item => item.id);

  const handleSignOut = async () => {
    await signOut();
  };

  const toggleExpanded = (itemId: string) => {
    setExpandedItems(prev => 
      prev.includes(itemId) 
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  };

  // Check if active tab is a sub-item of a given parent
  const isSubItemActive = (item: NavItem) => {
    return item.subItems?.some(sub => sub.id === activeTab) || false;
  };

  // Filter sections to only show items the user has access to and match search
  const visibleSections = navSections
    .map(section => ({
      ...section,
      items: section.items.filter(item => {
        const hasAccess = visibleTabs.includes(item.id);
        const matchesSearch = searchQuery === '' || 
          item.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
          section.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.subItems?.some(sub => sub.label.toLowerCase().includes(searchQuery.toLowerCase()));
        return hasAccess && matchesSearch;
      }),
    }))
    .filter(section => section.items.length > 0);

  return (
    <div className="w-64 bg-card border-r border-border min-h-screen p-4 flex flex-col">
      <div className="mb-4">
        <Link to="/" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-4">
          <ArrowLeft className="h-4 w-4" />
          <span className="text-sm">Back to Site</span>
        </Link>
        <h2 className="text-xl font-bold text-foreground">VitalityX CRM</h2>
        <p className="text-sm text-muted-foreground">Client Management System</p>
      </div>

      {/* Search input */}
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Search tabs..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9 pr-8 h-9 text-sm"
        />
        {searchQuery && (
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-1 top-1/2 -translate-y-1/2 h-6 w-6"
            onClick={() => setSearchQuery('')}
          >
            <X className="h-3 w-3" />
          </Button>
        )}
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
              {section.items.map((item) => {
                const hasSubItems = item.subItems && item.subItems.length > 0;
                const isExpanded = expandedItems.includes(item.id);
                const isActive = activeTab === item.id || isSubItemActive(item);
                
                if (hasSubItems) {
                  return (
                    <Collapsible
                      key={item.id}
                      open={isExpanded}
                      onOpenChange={() => toggleExpanded(item.id)}
                    >
                      <CollapsibleTrigger asChild>
                        <Button
                          variant="ghost"
                          className={cn(
                            "w-full justify-between gap-3",
                            isActive && "bg-primary/10 text-primary"
                          )}
                        >
                          <span className="flex items-center gap-3">
                            <item.icon className="h-4 w-4" />
                            {item.label}
                          </span>
                          {isExpanded ? (
                            <ChevronDown className="h-4 w-4" />
                          ) : (
                            <ChevronRight className="h-4 w-4" />
                          )}
                        </Button>
                      </CollapsibleTrigger>
                      <CollapsibleContent className="pl-4 mt-1 space-y-1">
                        {/* All clients option */}
                        <Button
                          variant="ghost"
                          size="sm"
                          className={cn(
                            "w-full justify-start gap-3 text-sm",
                            activeTab === item.id && "bg-primary/10 text-primary"
                          )}
                          onClick={() => onTabChange(item.id)}
                        >
                          <Users className="h-3 w-3" />
                          All Clients
                        </Button>
                        {/* Sub-items */}
                        {item.subItems?.map((subItem) => (
                          <Button
                            key={subItem.id}
                            variant="ghost"
                            size="sm"
                            className={cn(
                              "w-full justify-start gap-3 text-sm",
                              activeTab === subItem.id && "bg-primary/10 text-primary"
                            )}
                            onClick={() => onTabChange(subItem.id)}
                          >
                            <subItem.icon className="h-3 w-3" />
                            {subItem.label}
                          </Button>
                        ))}
                      </CollapsibleContent>
                    </Collapsible>
                  );
                }
                
                return (
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
                );
              })}
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
