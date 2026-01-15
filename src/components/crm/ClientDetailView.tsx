import { useState } from 'react';
import { format } from 'date-fns';
import { 
  User, Mail, Phone, MapPin, Calendar, Target, 
  FileText, ShoppingCart, Crown, MessageSquare, 
  Plus, Upload, Download, Trash2, Pin, Moon, Brain
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
import { CRMClient, MembershipTier, MembershipStatus, PurchaseType, DocumentType } from '@/types/crm';
import { 
  useCRMMemberships, 
  useCRMPurchases, 
  useCRMDocuments, 
  useCRMClientNotes 
} from '@/hooks/useCRM';
import { Skeleton } from '@/components/ui/skeleton';
import { ClientSleepProfile } from '@/components/sleep/ClientSleepProfile';
import { ClientMentalProfile } from '@/components/mental/ClientMentalProfile';

interface ClientDetailViewProps {
  client: CRMClient;
}

export function ClientDetailView({ client }: ClientDetailViewProps) {
  const { memberships, loading: membershipsLoading, createMembership, updateMembership } = useCRMMemberships(client.id);
  const { purchases, loading: purchasesLoading, createPurchase } = useCRMPurchases(client.id);
  const { documents, loading: documentsLoading, uploadDocument, deleteDocument } = useCRMDocuments(client.id);
  const { notes, loading: notesLoading, createNote, updateNote, deleteNote } = useCRMClientNotes(client.id);

  const [isAddMembershipOpen, setIsAddMembershipOpen] = useState(false);
  const [isAddPurchaseOpen, setIsAddPurchaseOpen] = useState(false);
  const [isAddNoteOpen, setIsAddNoteOpen] = useState(false);
  const [newNote, setNewNote] = useState('');
  
  const [membershipForm, setMembershipForm] = useState({
    tier: 'essential' as MembershipTier,
    status: 'active' as MembershipStatus,
    monthly_price: '',
    notes: '',
  });

  const [purchaseForm, setPurchaseForm] = useState({
    purchase_type: 'one_time' as PurchaseType,
    product_name: '',
    description: '',
    amount: '',
  });

  const handleAddMembership = async () => {
    await createMembership({
      client_id: client.id,
      tier: membershipForm.tier,
      status: membershipForm.status,
      monthly_price: membershipForm.monthly_price ? parseFloat(membershipForm.monthly_price) : null,
      notes: membershipForm.notes || null,
    });
    setIsAddMembershipOpen(false);
    setMembershipForm({ tier: 'essential', status: 'active', monthly_price: '', notes: '' });
  };

  const handleAddPurchase = async () => {
    await createPurchase({
      client_id: client.id,
      purchase_type: purchaseForm.purchase_type,
      product_name: purchaseForm.product_name,
      description: purchaseForm.description || null,
      amount: parseFloat(purchaseForm.amount),
    });
    setIsAddPurchaseOpen(false);
    setPurchaseForm({ purchase_type: 'one_time', product_name: '', description: '', amount: '' });
  };

  const handleAddNote = async () => {
    if (!newNote.trim()) return;
    await createNote({
      client_id: client.id,
      content: newNote,
      note_type: 'general',
    });
    setNewNote('');
    setIsAddNoteOpen(false);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      await uploadDocument(client.id, file, 'other');
    }
  };

  const tierColors: Record<MembershipTier, string> = {
    free: 'bg-gray-500/10 text-gray-500',
    essential: 'bg-blue-500/10 text-blue-500',
    premium: 'bg-amber-500/10 text-amber-500',
    elite: 'bg-purple-500/10 text-purple-500',
  };

  const statusColors: Record<MembershipStatus, string> = {
    active: 'bg-green-500/10 text-green-500',
    paused: 'bg-yellow-500/10 text-yellow-500',
    cancelled: 'bg-red-500/10 text-red-500',
    expired: 'bg-gray-500/10 text-gray-500',
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start gap-4">
        <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
          <span className="text-2xl font-bold text-primary">
            {client.full_name.charAt(0).toUpperCase()}
          </span>
        </div>
        <div className="flex-1">
          <h2 className="text-2xl font-bold text-foreground">{client.full_name}</h2>
          <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mt-1">
            <span className="flex items-center gap-1">
              <Mail className="h-4 w-4" />
              {client.email}
            </span>
            {client.phone && (
              <span className="flex items-center gap-1">
                <Phone className="h-4 w-4" />
                {client.phone}
              </span>
            )}
            <span className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              Client since {format(new Date(client.created_at), 'MMM yyyy')}
            </span>
          </div>
        </div>
        <Badge className={`capitalize ${
          client.marketing_status === 'vip' ? 'bg-purple-500/10 text-purple-500' :
          client.marketing_status === 'customer' ? 'bg-green-500/10 text-green-500' :
          'bg-yellow-500/10 text-yellow-500'
        }`}>
          {client.marketing_status}
        </Badge>
      </div>

      {/* Quick Info */}
      {(client.health_goals || client.notes) && (
        <Card>
          <CardContent className="p-4">
            <div className="grid md:grid-cols-2 gap-4">
              {client.health_goals && (
                <div>
                  <Label className="flex items-center gap-1 text-muted-foreground mb-1">
                    <Target className="h-4 w-4" />
                    Health Goals
                  </Label>
                  <p className="text-sm">{client.health_goals}</p>
                </div>
              )}
              {client.notes && (
                <div>
                  <Label className="flex items-center gap-1 text-muted-foreground mb-1">
                    <FileText className="h-4 w-4" />
                    Notes
                  </Label>
                  <p className="text-sm">{client.notes}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tabs */}
      <Tabs defaultValue="memberships" className="w-full">
        <TabsList className="flex flex-wrap w-full h-auto gap-1">
          <TabsTrigger value="memberships" className="gap-2">
            <Crown className="h-4 w-4" />
            Memberships
          </TabsTrigger>
          <TabsTrigger value="purchases" className="gap-2">
            <ShoppingCart className="h-4 w-4" />
            Purchases
          </TabsTrigger>
          <TabsTrigger value="documents" className="gap-2">
            <FileText className="h-4 w-4" />
            Documents
          </TabsTrigger>
          <TabsTrigger value="notes" className="gap-2">
            <MessageSquare className="h-4 w-4" />
            Notes
          </TabsTrigger>
          <TabsTrigger value="sleep" className="gap-2">
            <Moon className="h-4 w-4" />
            Sleep
          </TabsTrigger>
          <TabsTrigger value="mental" className="gap-2">
            <Brain className="h-4 w-4" />
            Mental
          </TabsTrigger>
        </TabsList>

        {/* Memberships Tab */}
        <TabsContent value="memberships" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="font-semibold">Membership History</h3>
            <Dialog open={isAddMembershipOpen} onOpenChange={setIsAddMembershipOpen}>
              <DialogTrigger asChild>
                <Button size="sm" className="gap-2">
                  <Plus className="h-4 w-4" />
                  Add Membership
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add Membership</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label>Tier</Label>
                    <Select
                      value={membershipForm.tier}
                      onValueChange={(value) => setMembershipForm({ ...membershipForm, tier: value as MembershipTier })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="free">Free</SelectItem>
                        <SelectItem value="essential">Essential</SelectItem>
                        <SelectItem value="premium">Premium</SelectItem>
                        <SelectItem value="elite">Elite</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Status</Label>
                    <Select
                      value={membershipForm.status}
                      onValueChange={(value) => setMembershipForm({ ...membershipForm, status: value as MembershipStatus })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="paused">Paused</SelectItem>
                        <SelectItem value="cancelled">Cancelled</SelectItem>
                        <SelectItem value="expired">Expired</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Monthly Price</Label>
                    <Input
                      type="number"
                      value={membershipForm.monthly_price}
                      onChange={(e) => setMembershipForm({ ...membershipForm, monthly_price: e.target.value })}
                      placeholder="0.00"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Notes</Label>
                    <Textarea
                      value={membershipForm.notes}
                      onChange={(e) => setMembershipForm({ ...membershipForm, notes: e.target.value })}
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setIsAddMembershipOpen(false)}>Cancel</Button>
                  <Button onClick={handleAddMembership}>Add Membership</Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {membershipsLoading ? (
            <Skeleton className="h-24" />
          ) : memberships.length === 0 ? (
            <Card>
              <CardContent className="p-6 text-center text-muted-foreground">
                No memberships found
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {memberships.map((membership) => (
                <Card key={membership.id}>
                  <CardContent className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <Crown className="h-8 w-8 text-amber-500" />
                      <div>
                        <div className="flex items-center gap-2">
                          <Badge className={tierColors[membership.tier]}>
                            {membership.tier}
                          </Badge>
                          <Badge className={statusColors[membership.status]}>
                            {membership.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          Started {format(new Date(membership.start_date), 'MMM d, yyyy')}
                          {membership.monthly_price && ` • $${membership.monthly_price}/month`}
                        </p>
                      </div>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => updateMembership(membership.id, { 
                        status: membership.status === 'active' ? 'paused' : 'active' 
                      })}
                    >
                      {membership.status === 'active' ? 'Pause' : 'Activate'}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Purchases Tab */}
        <TabsContent value="purchases" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="font-semibold">Purchase History</h3>
            <Dialog open={isAddPurchaseOpen} onOpenChange={setIsAddPurchaseOpen}>
              <DialogTrigger asChild>
                <Button size="sm" className="gap-2">
                  <Plus className="h-4 w-4" />
                  Add Purchase
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Record Purchase</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label>Type</Label>
                    <Select
                      value={purchaseForm.purchase_type}
                      onValueChange={(value) => setPurchaseForm({ ...purchaseForm, purchase_type: value as PurchaseType })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="subscription">Subscription</SelectItem>
                        <SelectItem value="one_time">One-Time</SelectItem>
                        <SelectItem value="supplement">Supplement</SelectItem>
                        <SelectItem value="service">Service</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Product Name</Label>
                    <Input
                      value={purchaseForm.product_name}
                      onChange={(e) => setPurchaseForm({ ...purchaseForm, product_name: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Amount</Label>
                    <Input
                      type="number"
                      value={purchaseForm.amount}
                      onChange={(e) => setPurchaseForm({ ...purchaseForm, amount: e.target.value })}
                      placeholder="0.00"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Description</Label>
                    <Textarea
                      value={purchaseForm.description}
                      onChange={(e) => setPurchaseForm({ ...purchaseForm, description: e.target.value })}
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setIsAddPurchaseOpen(false)}>Cancel</Button>
                  <Button onClick={handleAddPurchase} disabled={!purchaseForm.product_name || !purchaseForm.amount}>
                    Add Purchase
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {purchasesLoading ? (
            <Skeleton className="h-24" />
          ) : purchases.length === 0 ? (
            <Card>
              <CardContent className="p-6 text-center text-muted-foreground">
                No purchases found
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {purchases.map((purchase) => (
                <Card key={purchase.id}>
                  <CardContent className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <ShoppingCart className="h-8 w-8 text-green-500" />
                      <div>
                        <p className="font-medium">{purchase.product_name}</p>
                        <p className="text-sm text-muted-foreground">
                          {format(new Date(purchase.purchased_at), 'MMM d, yyyy')} • {purchase.purchase_type}
                        </p>
                      </div>
                    </div>
                    <span className="text-lg font-semibold text-green-500">
                      ${Number(purchase.amount).toFixed(2)}
                    </span>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Documents Tab */}
        <TabsContent value="documents" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="font-semibold">Documents</h3>
            <label>
              <input
                type="file"
                className="hidden"
                onChange={handleFileUpload}
              />
              <Button size="sm" className="gap-2" asChild>
                <span>
                  <Upload className="h-4 w-4" />
                  Upload Document
                </span>
              </Button>
            </label>
          </div>

          {documentsLoading ? (
            <Skeleton className="h-24" />
          ) : documents.length === 0 ? (
            <Card>
              <CardContent className="p-6 text-center text-muted-foreground">
                No documents found
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {documents.map((doc) => (
                <Card key={doc.id}>
                  <CardContent className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <FileText className="h-8 w-8 text-blue-500" />
                      <div>
                        <p className="font-medium">{doc.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {format(new Date(doc.created_at), 'MMM d, yyyy')} • {doc.document_type}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="icon" onClick={() => deleteDocument(doc.id, doc.file_path)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Notes Tab */}
        <TabsContent value="notes" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="font-semibold">Client Notes</h3>
            <Dialog open={isAddNoteOpen} onOpenChange={setIsAddNoteOpen}>
              <DialogTrigger asChild>
                <Button size="sm" className="gap-2">
                  <Plus className="h-4 w-4" />
                  Add Note
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add Note</DialogTitle>
                </DialogHeader>
                <div className="py-4">
                  <Textarea
                    value={newNote}
                    onChange={(e) => setNewNote(e.target.value)}
                    placeholder="Enter your note..."
                    rows={4}
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setIsAddNoteOpen(false)}>Cancel</Button>
                  <Button onClick={handleAddNote} disabled={!newNote.trim()}>Add Note</Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {notesLoading ? (
            <Skeleton className="h-24" />
          ) : notes.length === 0 ? (
            <Card>
              <CardContent className="p-6 text-center text-muted-foreground">
                No notes found
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {notes.map((note) => (
                <Card key={note.id} className={note.is_pinned ? 'border-primary' : ''}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="text-sm">{note.content}</p>
                        <p className="text-xs text-muted-foreground mt-2">
                          {format(new Date(note.created_at), 'MMM d, yyyy h:mm a')}
                        </p>
                      </div>
                      <div className="flex gap-1">
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => updateNote(note.id, { is_pinned: !note.is_pinned })}
                        >
                          <Pin className={`h-4 w-4 ${note.is_pinned ? 'text-primary' : ''}`} />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => deleteNote(note.id)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Sleep Tab */}
        <TabsContent value="sleep">
          <ClientSleepProfile clientId={client.id} clientName={client.full_name} />
        </TabsContent>

        {/* Mental Performance Tab */}
        <TabsContent value="mental">
          <ClientMentalProfile clientId={client.id} clientName={client.full_name} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
