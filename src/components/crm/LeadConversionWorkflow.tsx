import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  ArrowRight, 
  Users, 
  UserCheck, 
  Crown, 
  UserX, 
  Search,
  ChevronRight,
  Clock,
  Mail,
  Phone,
  Sparkles
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

type MarketingStatus = 'lead' | 'prospect' | 'customer' | 'vip' | 'churned';

interface Client {
  id: string;
  full_name: string;
  email: string;
  phone: string | null;
  marketing_status: MarketingStatus;
  health_goals: string | null;
  lead_source: string | null;
  created_at: string;
  notes: string | null;
}

const stages: { id: MarketingStatus; label: string; icon: any; color: string; bgColor: string }[] = [
  { id: 'lead', label: 'Leads', icon: Users, color: 'text-yellow-500', bgColor: 'bg-yellow-500/10' },
  { id: 'prospect', label: 'Prospects', icon: UserCheck, color: 'text-blue-500', bgColor: 'bg-blue-500/10' },
  { id: 'customer', label: 'Customers', icon: Crown, color: 'text-green-500', bgColor: 'bg-green-500/10' },
  { id: 'vip', label: 'VIP', icon: Sparkles, color: 'text-purple-500', bgColor: 'bg-purple-500/10' },
];

const stageTransitions: Record<MarketingStatus, MarketingStatus[]> = {
  lead: ['prospect', 'churned'],
  prospect: ['customer', 'churned'],
  customer: ['vip', 'churned'],
  vip: ['churned'],
  churned: ['lead'], // Allow reactivation
};

export function LeadConversionWorkflow() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [targetStatus, setTargetStatus] = useState<MarketingStatus | null>(null);
  const [conversionNotes, setConversionNotes] = useState('');
  const [isConvertDialogOpen, setIsConvertDialogOpen] = useState(false);

  // Fetch all clients
  const { data: clients = [], isLoading } = useQuery({
    queryKey: ['crm-clients-workflow'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('crm_clients')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as Client[];
    },
  });

  // Mutation to update client status
  const updateStatusMutation = useMutation({
    mutationFn: async ({ clientId, newStatus, notes }: { clientId: string; newStatus: MarketingStatus; notes: string }) => {
      const updates: any = { 
        marketing_status: newStatus,
        updated_at: new Date().toISOString(),
      };
      
      // Append conversion notes to existing notes
      if (notes.trim()) {
        const existingClient = clients.find(c => c.id === clientId);
        const existingNotes = existingClient?.notes || '';
        const timestamp = format(new Date(), 'MMM d, yyyy h:mm a');
        const newNote = `[${timestamp}] Converted to ${newStatus}: ${notes}`;
        updates.notes = existingNotes ? `${existingNotes}\n\n${newNote}` : newNote;
      }

      const { error } = await supabase
        .from('crm_clients')
        .update(updates)
        .eq('id', clientId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['crm-clients-workflow'] });
      queryClient.invalidateQueries({ queryKey: ['crm-clients'] });
      toast.success('Client status updated successfully');
      closeConvertDialog();
    },
    onError: (error: any) => {
      toast.error('Failed to update status', { description: error.message });
    },
  });

  const openConvertDialog = (client: Client, newStatus: MarketingStatus) => {
    setSelectedClient(client);
    setTargetStatus(newStatus);
    setConversionNotes('');
    setIsConvertDialogOpen(true);
  };

  const closeConvertDialog = () => {
    setSelectedClient(null);
    setTargetStatus(null);
    setConversionNotes('');
    setIsConvertDialogOpen(false);
  };

  const handleConvert = () => {
    if (!selectedClient || !targetStatus) return;
    updateStatusMutation.mutate({
      clientId: selectedClient.id,
      newStatus: targetStatus,
      notes: conversionNotes,
    });
  };

  // Filter clients by search
  const filteredClients = clients.filter(client =>
    client.full_name.toLowerCase().includes(search.toLowerCase()) ||
    client.email.toLowerCase().includes(search.toLowerCase())
  );

  // Group clients by stage
  const clientsByStage = stages.reduce((acc, stage) => {
    acc[stage.id] = filteredClients.filter(c => c.marketing_status === stage.id);
    return acc;
  }, {} as Record<MarketingStatus, Client[]>);

  // Calculate stats
  const totalLeads = clients.filter(c => c.marketing_status === 'lead').length;
  const totalProspects = clients.filter(c => c.marketing_status === 'prospect').length;
  const totalCustomers = clients.filter(c => c.marketing_status === 'customer').length;
  const totalVIP = clients.filter(c => c.marketing_status === 'vip').length;
  const conversionRate = totalLeads > 0 
    ? Math.round(((totalCustomers + totalVIP) / (totalLeads + totalProspects + totalCustomers + totalVIP)) * 100) 
    : 0;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-full" />
        <div className="grid grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-96" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Lead Conversion</h1>
          <p className="text-muted-foreground">Move leads through your sales pipeline</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-2xl font-bold text-primary">{conversionRate}%</p>
            <p className="text-xs text-muted-foreground">Conversion Rate</p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        {stages.map((stage) => {
          const count = clientsByStage[stage.id]?.length || 0;
          return (
            <Card key={stage.id} className={cn("border-l-4", stage.color.replace('text-', 'border-'))}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-2xl font-bold">{count}</p>
                    <p className="text-sm text-muted-foreground">{stage.label}</p>
                  </div>
                  <div className={cn("p-2 rounded-lg", stage.bgColor)}>
                    <stage.icon className={cn("h-5 w-5", stage.color)} />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search clients..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Pipeline Columns */}
      <div className="grid grid-cols-4 gap-4">
        {stages.map((stage, stageIndex) => (
          <div key={stage.id} className="space-y-3">
            {/* Column Header */}
            <div className={cn("p-3 rounded-lg flex items-center justify-between", stage.bgColor)}>
              <div className="flex items-center gap-2">
                <stage.icon className={cn("h-4 w-4", stage.color)} />
                <span className="font-semibold text-sm">{stage.label}</span>
              </div>
              <Badge variant="secondary" className="text-xs">
                {clientsByStage[stage.id]?.length || 0}
              </Badge>
            </div>

            {/* Arrow between columns */}
            {stageIndex < stages.length - 1 && (
              <div className="absolute top-1/2 -right-2 hidden lg:block">
                <ChevronRight className="h-5 w-5 text-muted-foreground" />
              </div>
            )}

            {/* Client Cards */}
            <div className="space-y-2 min-h-[200px]">
              {clientsByStage[stage.id]?.map((client) => {
                const nextStages = stageTransitions[client.marketing_status] || [];
                
                return (
                  <Card key={client.id} className="hover:border-primary/50 transition-colors">
                    <CardContent className="p-3 space-y-2">
                      <div className="flex items-start justify-between">
                        <div className="min-w-0 flex-1">
                          <h4 className="font-medium text-sm truncate">{client.full_name}</h4>
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Mail className="h-3 w-3 flex-shrink-0" />
                            <span className="truncate">{client.email}</span>
                          </div>
                          {client.phone && (
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                              <Phone className="h-3 w-3 flex-shrink-0" />
                              <span>{client.phone}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {client.lead_source && (
                        <Badge variant="outline" className="text-xs">
                          {client.lead_source}
                        </Badge>
                      )}

                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        <span>{format(new Date(client.created_at), 'MMM d, yyyy')}</span>
                      </div>

                      {/* Conversion Buttons */}
                      {nextStages.length > 0 && (
                        <div className="flex flex-wrap gap-1 pt-2 border-t border-border">
                          {nextStages.map((nextStatus) => {
                            const nextStage = stages.find(s => s.id === nextStatus) || 
                              { label: nextStatus === 'churned' ? 'Churned' : nextStatus, color: 'text-red-500' };
                            const isChurned = nextStatus === 'churned';
                            
                            return (
                              <Button
                                key={nextStatus}
                                size="sm"
                                variant={isChurned ? "outline" : "default"}
                                className={cn(
                                  "text-xs h-7 flex-1",
                                  isChurned && "text-red-500 hover:text-red-600 hover:bg-red-500/10"
                                )}
                                onClick={() => openConvertDialog(client, nextStatus)}
                              >
                                <ArrowRight className="h-3 w-3 mr-1" />
                                {isChurned ? 'Churned' : nextStage.label}
                              </Button>
                            );
                          })}
                        </div>
                      )}

                      {/* Reactivate churned */}
                      {client.marketing_status === 'churned' && (
                        <div className="pt-2 border-t border-border">
                          <Button
                            size="sm"
                            variant="outline"
                            className="w-full text-xs h-7"
                            onClick={() => openConvertDialog(client, 'lead')}
                          >
                            <ArrowRight className="h-3 w-3 mr-1" />
                            Reactivate as Lead
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}

              {(clientsByStage[stage.id]?.length || 0) === 0 && (
                <div className="text-center py-8 text-muted-foreground text-sm">
                  No {stage.label.toLowerCase()}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Churned Section */}
      {filteredClients.filter(c => c.marketing_status === 'churned').length > 0 && (
        <Card className="border-red-500/20">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <UserX className="h-5 w-5 text-red-500" />
              Churned Clients
              <Badge variant="secondary" className="ml-2">
                {filteredClients.filter(c => c.marketing_status === 'churned').length}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-4 gap-3">
              {filteredClients
                .filter(c => c.marketing_status === 'churned')
                .slice(0, 8)
                .map((client) => (
                  <Card key={client.id} className="bg-red-500/5">
                    <CardContent className="p-3">
                      <h4 className="font-medium text-sm truncate">{client.full_name}</h4>
                      <p className="text-xs text-muted-foreground truncate">{client.email}</p>
                      <Button
                        size="sm"
                        variant="outline"
                        className="w-full mt-2 text-xs h-7"
                        onClick={() => openConvertDialog(client, 'lead')}
                      >
                        Reactivate
                      </Button>
                    </CardContent>
                  </Card>
                ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Conversion Dialog */}
      <Dialog open={isConvertDialogOpen} onOpenChange={setIsConvertDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Convert to {targetStatus === 'churned' ? 'Churned' : stages.find(s => s.id === targetStatus)?.label}
            </DialogTitle>
            <DialogDescription>
              Moving <strong>{selectedClient?.full_name}</strong> from{' '}
              <strong>{selectedClient?.marketing_status}</strong> to{' '}
              <strong>{targetStatus}</strong>
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="flex items-center justify-center gap-4 py-4">
              <div className="text-center">
                <Badge className={cn(
                  "px-3 py-1",
                  stages.find(s => s.id === selectedClient?.marketing_status)?.bgColor,
                  stages.find(s => s.id === selectedClient?.marketing_status)?.color
                )}>
                  {selectedClient?.marketing_status}
                </Badge>
              </div>
              <ArrowRight className="h-5 w-5 text-muted-foreground" />
              <div className="text-center">
                <Badge className={cn(
                  "px-3 py-1",
                  targetStatus === 'churned' ? 'bg-red-500/10 text-red-500' :
                  stages.find(s => s.id === targetStatus)?.bgColor,
                  targetStatus === 'churned' ? '' :
                  stages.find(s => s.id === targetStatus)?.color
                )}>
                  {targetStatus}
                </Badge>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Conversion Notes (optional)</label>
              <Textarea
                placeholder="Add notes about this conversion..."
                value={conversionNotes}
                onChange={(e) => setConversionNotes(e.target.value)}
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={closeConvertDialog}>
              Cancel
            </Button>
            <Button 
              onClick={handleConvert}
              disabled={updateStatusMutation.isPending}
              className={targetStatus === 'churned' ? 'bg-red-500 hover:bg-red-600' : ''}
            >
              {updateStatusMutation.isPending ? 'Converting...' : 'Confirm Conversion'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}