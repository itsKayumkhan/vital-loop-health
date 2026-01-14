import { useState } from 'react';
import { Plus, Search, MoreHorizontal, Mail, Phone, Tag, Eye, Pencil, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useCRMClients } from '@/hooks/useCRM';
import { CRMClient, MarketingStatus } from '@/types/crm';
import { Skeleton } from '@/components/ui/skeleton';
import { ClientDetailView } from './ClientDetailView';

const marketingStatusColors: Record<MarketingStatus, string> = {
  lead: 'bg-yellow-500/10 text-yellow-500',
  prospect: 'bg-blue-500/10 text-blue-500',
  customer: 'bg-green-500/10 text-green-500',
  churned: 'bg-red-500/10 text-red-500',
  vip: 'bg-purple-500/10 text-purple-500',
};

export function ClientsList() {
  const { clients, loading, createClient, updateClient, deleteClient } = useCRMClients();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState<CRMClient | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<CRMClient | null>(null);

  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
    health_goals: '',
    notes: '',
    marketing_status: 'lead' as MarketingStatus,
    lead_source: '',
    tags: '',
  });

  const resetForm = () => {
    setFormData({
      full_name: '',
      email: '',
      phone: '',
      health_goals: '',
      notes: '',
      marketing_status: 'lead',
      lead_source: '',
      tags: '',
    });
    setEditingClient(null);
  };

  const handleSubmit = async () => {
    const clientData = {
      ...formData,
      tags: formData.tags.split(',').map(t => t.trim()).filter(Boolean),
    };

    if (editingClient) {
      await updateClient(editingClient.id, clientData);
    } else {
      await createClient(clientData);
    }
    setIsAddDialogOpen(false);
    resetForm();
  };

  const handleEdit = (client: CRMClient) => {
    setEditingClient(client);
    setFormData({
      full_name: client.full_name,
      email: client.email,
      phone: client.phone || '',
      health_goals: client.health_goals || '',
      notes: client.notes || '',
      marketing_status: client.marketing_status,
      lead_source: client.lead_source || '',
      tags: client.tags.join(', '),
    });
    setIsAddDialogOpen(true);
  };

  const handleViewDetails = (client: CRMClient) => {
    setSelectedClient(client);
    setIsDetailOpen(true);
  };

  const filteredClients = clients.filter(client => {
    const matchesSearch = 
      client.full_name.toLowerCase().includes(search.toLowerCase()) ||
      client.email.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || client.marketing_status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-full" />
        <div className="grid gap-4">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Clients</h1>
          <p className="text-muted-foreground">Manage your client database</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={(open) => {
          setIsAddDialogOpen(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Add Client
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{editingClient ? 'Edit Client' : 'Add New Client'}</DialogTitle>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="full_name">Full Name *</Label>
                <Input
                  id="full_name"
                  value={formData.full_name}
                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                  placeholder="John Doe"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="john@example.com"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+1 (555) 000-0000"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="marketing_status">Status</Label>
                <Select
                  value={formData.marketing_status}
                  onValueChange={(value) => setFormData({ ...formData, marketing_status: value as MarketingStatus })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="lead">Lead</SelectItem>
                    <SelectItem value="prospect">Prospect</SelectItem>
                    <SelectItem value="customer">Customer</SelectItem>
                    <SelectItem value="vip">VIP</SelectItem>
                    <SelectItem value="churned">Churned</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="lead_source">Lead Source</Label>
                <Input
                  id="lead_source"
                  value={formData.lead_source}
                  onChange={(e) => setFormData({ ...formData, lead_source: e.target.value })}
                  placeholder="Website, Referral, etc."
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="tags">Tags (comma separated)</Label>
                <Input
                  id="tags"
                  value={formData.tags}
                  onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                  placeholder="weight-loss, premium"
                />
              </div>
              <div className="col-span-2 space-y-2">
                <Label htmlFor="health_goals">Health Goals</Label>
                <Textarea
                  id="health_goals"
                  value={formData.health_goals}
                  onChange={(e) => setFormData({ ...formData, health_goals: e.target.value })}
                  placeholder="Client's health and wellness goals..."
                  rows={3}
                />
              </div>
              <div className="col-span-2 space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Additional notes..."
                  rows={3}
                />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => {
                setIsAddDialogOpen(false);
                resetForm();
              }}>
                Cancel
              </Button>
              <Button onClick={handleSubmit} disabled={!formData.full_name || !formData.email}>
                {editingClient ? 'Update Client' : 'Add Client'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search clients..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="lead">Lead</SelectItem>
            <SelectItem value="prospect">Prospect</SelectItem>
            <SelectItem value="customer">Customer</SelectItem>
            <SelectItem value="vip">VIP</SelectItem>
            <SelectItem value="churned">Churned</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Clients List */}
      {filteredClients.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <p className="text-muted-foreground">No clients found</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {filteredClients.map((client) => (
            <Card key={client.id} className="hover:border-primary/50 transition-colors">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="text-lg font-semibold text-primary">
                        {client.full_name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground">{client.full_name}</h3>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Mail className="h-3 w-3" />
                          {client.email}
                        </span>
                        {client.phone && (
                          <span className="flex items-center gap-1">
                            <Phone className="h-3 w-3" />
                            {client.phone}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    {client.tags.length > 0 && (
                      <div className="flex gap-1">
                        {client.tags.slice(0, 2).map((tag) => (
                          <Badge key={tag} variant="secondary" className="text-xs">
                            <Tag className="h-3 w-3 mr-1" />
                            {tag}
                          </Badge>
                        ))}
                        {client.tags.length > 2 && (
                          <Badge variant="secondary" className="text-xs">
                            +{client.tags.length - 2}
                          </Badge>
                        )}
                      </div>
                    )}
                    
                    <Badge className={marketingStatusColors[client.marketing_status]}>
                      {client.marketing_status}
                    </Badge>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleViewDetails(client)}>
                          <Eye className="h-4 w-4 mr-2" />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleEdit(client)}>
                          <Pencil className="h-4 w-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          className="text-destructive"
                          onClick={() => deleteClient(client.id)}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Client Detail Dialog */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          {selectedClient && <ClientDetailView client={selectedClient} />}
        </DialogContent>
      </Dialog>
    </div>
  );
}
