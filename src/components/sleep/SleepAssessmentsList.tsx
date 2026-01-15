import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Search, Filter, Eye, Edit, Clock, CheckCircle2, AlertCircle, FileText } from 'lucide-react';
import { useSleepAssessments } from '@/hooks/useSleepProgram';
import { useCRMClients } from '@/hooks/useCRM';
import { 
  sleepPhenotypeLabels, 
  programTierLabels,
  getISISeverity,
  SleepAssessment,
  SleepProgramTier,
  SleepAssessmentStatus,
} from '@/types/sleep';
import { format } from 'date-fns';

const statusConfig: Record<SleepAssessmentStatus, { label: string; variant: 'default' | 'secondary' | 'outline' | 'destructive'; icon: any }> = {
  pending: { label: 'Pending', variant: 'outline', icon: Clock },
  in_progress: { label: 'In Progress', variant: 'secondary', icon: FileText },
  completed: { label: 'Completed', variant: 'default', icon: CheckCircle2 },
  reviewed: { label: 'Reviewed', variant: 'default', icon: CheckCircle2 },
};

export function SleepAssessmentsList() {
  const { assessments, loading } = useSleepAssessments();
  const { clients } = useCRMClients();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [tierFilter, setTierFilter] = useState<string>('all');

  // Create a map of client IDs to names
  const clientMap = clients.reduce((acc, client) => {
    acc[client.id] = client.full_name;
    return acc;
  }, {} as Record<string, string>);

  const filteredAssessments = assessments.filter(assessment => {
    const clientName = clientMap[assessment.client_id] || '';
    const matchesSearch = 
      clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      assessment.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || assessment.status === statusFilter;
    const matchesTier = tierFilter === 'all' || assessment.program_tier === tierFilter;
    return matchesSearch && matchesStatus && matchesTier;
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Sleep Assessments</CardTitle>
        <CardDescription>
          View and manage client sleep optimization assessments
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by client name or ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="in_progress">In Progress</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="reviewed">Reviewed</SelectItem>
            </SelectContent>
          </Select>
          <Select value={tierFilter} onValueChange={setTierFilter}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Filter by tier" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Tiers</SelectItem>
              <SelectItem value="foundational">Foundational</SelectItem>
              <SelectItem value="advanced">Advanced</SelectItem>
              <SelectItem value="elite">Elite</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Table */}
        {loading ? (
          <div className="h-64 flex items-center justify-center text-muted-foreground">
            Loading assessments...
          </div>
        ) : filteredAssessments.length === 0 ? (
          <div className="h-64 flex flex-col items-center justify-center text-muted-foreground">
            <FileText className="h-12 w-12 mb-4 opacity-50" />
            <p>No assessments found</p>
            {(searchQuery || statusFilter !== 'all' || tierFilter !== 'all') && (
              <Button 
                variant="link" 
                onClick={() => {
                  setSearchQuery('');
                  setStatusFilter('all');
                  setTierFilter('all');
                }}
              >
                Clear filters
              </Button>
            )}
          </div>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Client</TableHead>
                  <TableHead>Program Tier</TableHead>
                  <TableHead>Phenotype</TableHead>
                  <TableHead>ISI Score</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAssessments.map((assessment) => {
                  const StatusIcon = statusConfig[assessment.status].icon;
                  const isiSeverity = assessment.isi_score ? getISISeverity(assessment.isi_score) : null;
                  
                  return (
                    <TableRow key={assessment.id}>
                      <TableCell className="font-medium">
                        {clientMap[assessment.client_id] || 'Unknown Client'}
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">
                          {assessment.program_tier.charAt(0).toUpperCase() + assessment.program_tier.slice(1)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {assessment.phenotype ? (
                          <span className="text-sm">
                            {sleepPhenotypeLabels[assessment.phenotype]}
                          </span>
                        ) : (
                          <span className="text-muted-foreground text-sm">Not classified</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {assessment.isi_score !== null ? (
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{assessment.isi_score}</span>
                            {isiSeverity && (
                              <span className={`text-xs ${isiSeverity.color}`}>
                                ({isiSeverity.label.split(' ')[0]})
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-muted-foreground text-sm">—</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant={statusConfig[assessment.status].variant}>
                          <StatusIcon className="h-3 w-3 mr-1" />
                          {statusConfig[assessment.status].label}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        {format(new Date(assessment.created_at), 'MMM d, yyyy')}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button size="icon" variant="ghost">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button size="icon" variant="ghost">
                            <Edit className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
