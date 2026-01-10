import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { 
  ArrowLeft,
  Search,
  Filter,
  User,
  Clock,
  CheckCircle2,
  AlertCircle,
  FileText,
  Eye,
  MessageSquare,
  Download,
  ChevronDown
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { coachForms, CoachSpecialty } from '@/data/coachForms';

type FormStatus = 'pending' | 'in_review' | 'assigned' | 'completed' | 'archived';

interface FormSubmission {
  id: string;
  user_id: string;
  specialty: CoachSpecialty;
  status: FormStatus;
  form_data: Record<string, any>;
  notes: string | null;
  submitted_at: string;
  profiles: {
    full_name: string | null;
    email: string | null;
  } | null;
}

const statusConfig: Record<string, { label: string; color: string; icon: typeof Clock }> = {
  pending: { label: 'Pending', color: 'bg-yellow-500/20 text-yellow-500 border-yellow-500/30', icon: Clock },
  in_review: { label: 'In Review', color: 'bg-blue-500/20 text-blue-500 border-blue-500/30', icon: AlertCircle },
  assigned: { label: 'Assigned', color: 'bg-purple-500/20 text-purple-500 border-purple-500/30', icon: User },
  completed: { label: 'Completed', color: 'bg-green-500/20 text-green-500 border-green-500/30', icon: CheckCircle2 },
  archived: { label: 'Archived', color: 'bg-gray-500/20 text-gray-500 border-gray-500/30', icon: FileText },
};

const PortalManage = () => {
  const { user, isStaff } = useAuth();
  const { toast } = useToast();
  
  const [submissions, setSubmissions] = useState<FormSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [specialtyFilter, setSpecialtyFilter] = useState<string>('all');
  
  const [selectedSubmission, setSelectedSubmission] = useState<FormSubmission | null>(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [noteDialogOpen, setNoteDialogOpen] = useState(false);
  const [noteText, setNoteText] = useState('');
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    const fetchSubmissions = async () => {
      if (!user || !isStaff) return;

      const { data, error } = await supabase
        .from('coach_intake_forms')
        .select('*')
        .order('submitted_at', { ascending: false });

      if (!error && data) {
        // Fetch profiles separately
        const userIds = [...new Set(data.map(d => d.user_id))];
        const { data: profilesData } = await supabase
          .from('profiles')
          .select('user_id, full_name, email')
          .in('user_id', userIds);

        const profilesMap = new Map(profilesData?.map(p => [p.user_id, p]) || []);
        
        const enrichedData = data.map(d => ({
          ...d,
          profiles: profilesMap.get(d.user_id) || null,
        }));
        
        setSubmissions(enrichedData as FormSubmission[]);
      }
      setLoading(false);
    };

    fetchSubmissions();
  }, [user, isStaff]);

  const filteredSubmissions = submissions.filter(sub => {
    const matchesSearch = searchQuery === '' || 
      sub.profiles?.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sub.profiles?.email?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || sub.status === statusFilter;
    const matchesSpecialty = specialtyFilter === 'all' || sub.specialty === specialtyFilter;

    return matchesSearch && matchesStatus && matchesSpecialty;
  });

  const getFormConfig = (specialty: string) => {
    return coachForms.find(f => f.specialty === specialty);
  };

  const updateStatus = async (submissionId: string, newStatus: FormStatus) => {
    setUpdating(true);
    
    const { error } = await supabase
      .from('coach_intake_forms')
      .update({ 
        status: newStatus,
        reviewed_at: newStatus === 'in_review' ? new Date().toISOString() : undefined,
        completed_at: newStatus === 'completed' ? new Date().toISOString() : undefined,
      })
      .eq('id', submissionId);

    if (error) {
      toast({
        title: 'Update failed',
        description: error.message,
        variant: 'destructive',
      });
    } else {
      setSubmissions(prev => 
        prev.map(s => s.id === submissionId ? { ...s, status: newStatus } : s)
      );
      toast({
        title: 'Status updated',
        description: `Form status changed to ${statusConfig[newStatus]?.label}`,
      });
    }
    
    setUpdating(false);
  };

  const saveNote = async () => {
    if (!selectedSubmission) return;
    
    setUpdating(true);
    
    const { error } = await supabase
      .from('coach_intake_forms')
      .update({ notes: noteText })
      .eq('id', selectedSubmission.id);

    if (error) {
      toast({
        title: 'Failed to save note',
        description: error.message,
        variant: 'destructive',
      });
    } else {
      setSubmissions(prev => 
        prev.map(s => s.id === selectedSubmission.id ? { ...s, notes: noteText } : s)
      );
      setNoteDialogOpen(false);
      toast({
        title: 'Note saved',
      });
    }
    
    setUpdating(false);
  };

  const exportToCsv = () => {
    const headers = ['Client Name', 'Email', 'Specialty', 'Status', 'Submitted At', 'Notes'];
    const rows = filteredSubmissions.map(sub => [
      sub.profiles?.full_name || 'Unknown',
      sub.profiles?.email || 'Unknown',
      sub.specialty,
      sub.status,
      new Date(sub.submitted_at).toLocaleString(),
      sub.notes || '',
    ]);
    
    const csvContent = [headers, ...rows].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `intake-forms-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const renderFormData = (formData: Record<string, any>, specialty: CoachSpecialty) => {
    const config = getFormConfig(specialty);
    if (!config) return null;

    return (
      <div className="space-y-6">
        {config.sections.map((section) => (
          <div key={section.title}>
            <h4 className="font-semibold text-lg mb-3 text-secondary">{section.title}</h4>
            <div className="space-y-3">
              {section.fields.map((field) => {
                const value = formData[field.id];
                if (!value || (Array.isArray(value) && value.length === 0)) return null;
                
                return (
                  <div key={field.id} className="glass-card rounded-lg p-3">
                    <p className="text-sm text-muted-foreground mb-1">{field.label}</p>
                    <p className="text-foreground">
                      {Array.isArray(value) ? value.join(', ') : value}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <>
      <Helmet>
        <title>Manage Submissions | VitalityX Health</title>
      </Helmet>

      <main className="min-h-screen">
        <Navbar />
        
        {/* Header */}
        <section className="pt-32 pb-8 lg:pt-40 lg:pb-12">
          <div className="container mx-auto px-4 lg:px-8">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
              >
                <Button variant="ghost" size="sm" asChild className="mb-4">
                  <Link to="/portal">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Portal
                  </Link>
                </Button>
                <h1 className="text-3xl md:text-4xl font-bold">
                  Manage Submissions
                </h1>
                <p className="text-muted-foreground mt-2">
                  Review and manage client intake forms
                </p>
              </motion.div>

              <Button variant="outline" onClick={exportToCsv}>
                <Download className="w-4 h-4 mr-2" />
                Export CSV
              </Button>
            </div>
          </div>
        </section>

        {/* Filters */}
        <section className="pb-8">
          <div className="container mx-auto px-4 lg:px-8">
            <div className="glass-card rounded-xl p-4 flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name or email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-muted/50"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full md:w-48 bg-muted/50">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  {Object.entries(statusConfig).map(([key, config]) => (
                    <SelectItem key={key} value={key}>{config.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={specialtyFilter} onValueChange={setSpecialtyFilter}>
                <SelectTrigger className="w-full md:w-48 bg-muted/50">
                  <SelectValue placeholder="Filter by specialty" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Specialties</SelectItem>
                  {coachForms.map((form) => (
                    <SelectItem key={form.specialty} value={form.specialty}>
                      {form.title.replace(' Intake', '')}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </section>

        {/* Submissions List */}
        <section className="pb-16 lg:pb-24">
          <div className="container mx-auto px-4 lg:px-8">
            {loading ? (
              <div className="text-center py-12 text-muted-foreground">Loading submissions...</div>
            ) : filteredSubmissions.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">No submissions found</div>
            ) : (
              <div className="space-y-4">
                {filteredSubmissions.map((sub) => {
                  const config = getFormConfig(sub.specialty);
                  const status = statusConfig[sub.status];
                  const Icon = config?.icon;
                  const StatusIcon = status?.icon;

                  return (
                    <motion.div
                      key={sub.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="glass-card rounded-xl p-5"
                    >
                      <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                        {/* Client Info */}
                        <div className="flex items-center gap-4 flex-1">
                          <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${config?.gradient} flex items-center justify-center flex-shrink-0`}>
                            {Icon && <Icon className="w-6 h-6 text-white" />}
                          </div>
                          <div className="min-w-0">
                            <p className="font-semibold truncate">
                              {sub.profiles?.full_name || 'Unknown Client'}
                            </p>
                            <p className="text-sm text-muted-foreground truncate">
                              {sub.profiles?.email}
                            </p>
                          </div>
                        </div>

                        {/* Specialty & Status */}
                        <div className="flex items-center gap-3">
                          <Badge variant="outline" className="whitespace-nowrap">
                            {config?.title.replace(' Intake', '')}
                          </Badge>
                          <Badge className={`${status?.color} border whitespace-nowrap`}>
                            {StatusIcon && <StatusIcon className="w-3 h-3 mr-1" />}
                            {status?.label}
                          </Badge>
                        </div>

                        {/* Date */}
                        <div className="text-sm text-muted-foreground whitespace-nowrap">
                          {new Date(sub.submitted_at).toLocaleDateString()}
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedSubmission(sub);
                              setViewDialogOpen(true);
                            }}
                          >
                            <Eye className="w-4 h-4 mr-1" />
                            View
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedSubmission(sub);
                              setNoteText(sub.notes || '');
                              setNoteDialogOpen(true);
                            }}
                          >
                            <MessageSquare className="w-4 h-4 mr-1" />
                            Notes
                          </Button>
                          <Select
                            value={sub.status}
                            onValueChange={(value) => updateStatus(sub.id, value as FormStatus)}
                            disabled={updating}
                          >
                            <SelectTrigger className="w-36">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {Object.entries(statusConfig).map(([key, config]) => (
                                <SelectItem key={key} value={key}>{config.label}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      {sub.notes && (
                        <div className="mt-4 pt-4 border-t border-border">
                          <p className="text-sm text-muted-foreground">
                            <span className="font-medium text-foreground">Notes:</span> {sub.notes}
                          </p>
                        </div>
                      )}
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>
        </section>

        {/* View Dialog */}
        <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
          <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {selectedSubmission?.profiles?.full_name || 'Client'} - {getFormConfig(selectedSubmission?.specialty || '')?.title}
              </DialogTitle>
              <DialogDescription>
                Submitted on {selectedSubmission && new Date(selectedSubmission.submitted_at).toLocaleString()}
              </DialogDescription>
            </DialogHeader>
            {selectedSubmission && renderFormData(selectedSubmission.form_data, selectedSubmission.specialty)}
          </DialogContent>
        </Dialog>

        {/* Notes Dialog */}
        <Dialog open={noteDialogOpen} onOpenChange={setNoteDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Notes</DialogTitle>
              <DialogDescription>
                Add internal notes for {selectedSubmission?.profiles?.full_name || 'this client'}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  value={noteText}
                  onChange={(e) => setNoteText(e.target.value)}
                  placeholder="Add notes about this submission..."
                  className="mt-2 min-h-[150px]"
                />
              </div>
              <div className="flex justify-end gap-3">
                <Button variant="outline" onClick={() => setNoteDialogOpen(false)}>
                  Cancel
                </Button>
                <Button variant="hero" onClick={saveNote} disabled={updating}>
                  Save Notes
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        <Footer />
      </main>
    </>
  );
};

export default PortalManage;
