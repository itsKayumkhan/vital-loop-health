import { Users, FileText, ShoppingCart, Crown, Megaphone, LayoutDashboard, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Link } from 'react-router-dom';

interface CRMSidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const navItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'clients', label: 'Clients', icon: Users },
  { id: 'memberships', label: 'Memberships', icon: Crown },
  { id: 'purchases', label: 'Purchases', icon: ShoppingCart },
  { id: 'documents', label: 'Documents', icon: FileText },
  { id: 'campaigns', label: 'Marketing', icon: Megaphone },
];

export function CRMSidebar({ activeTab, onTabChange }: CRMSidebarProps) {
  return (
    <div className="w-64 bg-card border-r border-border min-h-screen p-4">
      <div className="mb-8">
        <Link to="/" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-4">
          <ArrowLeft className="h-4 w-4" />
          <span className="text-sm">Back to Site</span>
        </Link>
        <h2 className="text-xl font-bold text-foreground">VitalityX CRM</h2>
        <p className="text-sm text-muted-foreground">Client Management System</p>
      </div>

      <nav className="space-y-1">
        {navItems.map((item) => (
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
      </nav>
    </div>
  );
}
