import { useState } from 'react';
import { Megaphone, Plus, Search, Play, Pause, Users } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { useCRMCampaigns, useCRMCampaignEnrollments, useCRMClients } from '@/hooks/useCRM';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';

const statusColors: Record<string, string> = {
  draft: 'bg-gray-500/10 text-gray-500',
  active: 'bg-green-500/10 text-green-500',
  paused: 'bg-yellow-500/10 text-yellow-500',
  completed: 'bg-blue-500/10 text-blue-500',
};

export function CampaignsList() {
  const { campaigns, loading, createCampaign, updateCampaign } = useCRMCampaigns();
  const { enrollments } = useCRMCampaignEnrollments();
  const { clients } = useCRMClients();
  const [search, setSearch] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    campaign_type: 'email',
    target_segment: '',
  });

  const handleSubmit = async () => {
    await createCampaign(formData);
    setIsAddDialogOpen(false);
    setFormData({ name: '', description: '', campaign_type: 'email', target_segment: '' });
  };

  const getEnrollmentCount = (campaignId: string) => {
    return enrollments.filter(e => e.campaign_id === campaignId).length;
  };

  const filteredCampaigns = campaigns.filter(campaign =>
    campaign.name.toLowerCase().includes(search.toLowerCase()) ||
    campaign.description?.toLowerCase().includes(search.toLowerCase())
  );

  const stats = {
    total: campaigns.length,
    active: campaigns.filter(c => c.status === 'active').length,
    totalEnrollments: enrollments.length,
    leads: clients.filter(c => c.marketing_status === 'lead').length,
  };

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
          <h1 className="text-3xl font-bold text-foreground">Marketing Campaigns</h1>
          <p className="text-muted-foreground">Create and manage marketing campaigns</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              New Campaign
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Campaign</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Campaign Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Summer Wellness Challenge"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="campaign_type">Type</Label>
                <Select
                  value={formData.campaign_type}
                  onValueChange={(value) => setFormData({ ...formData, campaign_type: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="email">Email</SelectItem>
                    <SelectItem value="sms">SMS</SelectItem>
                    <SelectItem value="retargeting">Retargeting</SelectItem>
                    <SelectItem value="social">Social Media</SelectItem>
                    <SelectItem value="referral">Referral</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="target_segment">Target Segment</Label>
                <Select
                  value={formData.target_segment}
                  onValueChange={(value) => setFormData({ ...formData, target_segment: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select segment" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Clients</SelectItem>
                    <SelectItem value="leads">Leads Only</SelectItem>
                    <SelectItem value="prospects">Prospects</SelectItem>
                    <SelectItem value="customers">Customers</SelectItem>
                    <SelectItem value="vip">VIP</SelectItem>
                    <SelectItem value="churned">Churned</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Campaign goals and details..."
                  rows={3}
                />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSubmit} disabled={!formData.name}>
                Create Campaign
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Total Campaigns</p>
            <p className="text-2xl font-bold">{stats.total}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Active</p>
            <p className="text-2xl font-bold text-green-500">{stats.active}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Total Enrollments</p>
            <p className="text-2xl font-bold text-blue-500">{stats.totalEnrollments}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Available Leads</p>
            <p className="text-2xl font-bold text-amber-500">{stats.leads}</p>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search campaigns..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Campaigns List */}
      {filteredCampaigns.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <p className="text-muted-foreground">No campaigns found</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {filteredCampaigns.map((campaign) => (
            <Card key={campaign.id} className="hover:border-primary/50 transition-colors">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                      <Megaphone className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground">{campaign.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        {campaign.campaign_type} • {format(new Date(campaign.created_at), 'MMM d, yyyy')}
                        {campaign.target_segment && ` • ${campaign.target_segment}`}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Users className="h-4 w-4" />
                      {getEnrollmentCount(campaign.id)}
                    </div>
                    <Badge className={statusColors[campaign.status] || statusColors.draft}>
                      {campaign.status}
                    </Badge>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => updateCampaign(campaign.id, {
                        status: campaign.status === 'active' ? 'paused' : 'active'
                      })}
                    >
                      {campaign.status === 'active' ? (
                        <Pause className="h-4 w-4" />
                      ) : (
                        <Play className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
                {campaign.description && (
                  <p className="mt-2 text-sm text-muted-foreground ml-16">
                    {campaign.description}
                  </p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
