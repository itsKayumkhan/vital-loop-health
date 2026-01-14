import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Search, Star, MessageSquare, Plus } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { SatisfactionSurveyForm } from './SatisfactionSurveyForm';

interface Survey {
  id: string;
  client_id: string;
  coach_id: string;
  rating: number;
  feedback: string | null;
  survey_type: string;
  session_date: string | null;
  created_at: string;
  client_name?: string;
  coach_name?: string;
}

const surveyTypeLabels: Record<string, string> = {
  session: 'Session',
  monthly: 'Monthly',
  general: 'General',
  program_completion: 'Program',
};

const surveyTypeColors: Record<string, string> = {
  session: 'bg-blue-100 text-blue-700',
  monthly: 'bg-purple-100 text-purple-700',
  general: 'bg-gray-100 text-gray-700',
  program_completion: 'bg-green-100 text-green-700',
};

export function SatisfactionSurveysList() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterRating, setFilterRating] = useState<string>('all');
  const [surveyDialogOpen, setSurveyDialogOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState<{ id: string; name: string } | null>(null);
  const [selectedCoach, setSelectedCoach] = useState<{ id: string; name: string } | null>(null);

  // Fetch surveys with client and coach info
  const { data: surveys, isLoading: surveysLoading } = useQuery({
    queryKey: ['coach-satisfaction-surveys'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('coach_satisfaction_surveys')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    },
  });

  // Fetch clients for mapping
  const { data: clients } = useQuery({
    queryKey: ['clients-for-surveys'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('crm_clients')
        .select('id, full_name, assigned_coach_id');
      if (error) throw error;
      return data || [];
    },
  });

  // Fetch coaches for mapping
  const { data: coaches } = useQuery({
    queryKey: ['coaches-for-surveys'],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_all_users_with_roles');
      if (error) throw error;
      return (data || []).filter((u: any) => u.role === 'coach');
    },
  });

  // Clients with assigned coaches for new survey
  const clientsWithCoaches = useMemo(() => {
    if (!clients || !coaches) return [];
    return clients
      .filter(c => c.assigned_coach_id)
      .map(c => {
        const coach = coaches.find((co: any) => co.user_id === c.assigned_coach_id);
        return {
          clientId: c.id,
          clientName: c.full_name,
          coachId: c.assigned_coach_id!,
          coachName: coach?.full_name || coach?.email?.split('@')[0] || 'Unknown',
        };
      });
  }, [clients, coaches]);

  // Enrich surveys with names
  const enrichedSurveys = useMemo<Survey[]>(() => {
    if (!surveys) return [];
    
    const clientMap = new Map(clients?.map(c => [c.id, c.full_name]) || []);
    const coachMap = new Map(coaches?.map((c: any) => [c.user_id, c.full_name || c.email?.split('@')[0]]) || []);
    
    return surveys.map(s => ({
      ...s,
      client_name: clientMap.get(s.client_id) || 'Unknown',
      coach_name: coachMap.get(s.coach_id) || 'Unknown',
    }));
  }, [surveys, clients, coaches]);

  // Filter surveys
  const filteredSurveys = useMemo(() => {
    return enrichedSurveys.filter(s => {
      const matchesSearch = 
        s.client_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.coach_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.feedback?.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesType = filterType === 'all' || s.survey_type === filterType;
      const matchesRating = filterRating === 'all' || s.rating === parseInt(filterRating);
      
      return matchesSearch && matchesType && matchesRating;
    });
  }, [enrichedSurveys, searchQuery, filterType, filterRating]);

  // Summary stats
  const stats = useMemo(() => {
    const total = enrichedSurveys.length;
    const avgRating = total > 0 
      ? (enrichedSurveys.reduce((sum, s) => sum + s.rating, 0) / total).toFixed(1)
      : '0.0';
    const fiveStarCount = enrichedSurveys.filter(s => s.rating === 5).length;
    const withFeedback = enrichedSurveys.filter(s => s.feedback).length;
    
    return { total, avgRating, fiveStarCount, withFeedback };
  }, [enrichedSurveys]);

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-4 w-4 ${
              star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground'
            }`}
          />
        ))}
      </div>
    );
  };

  const handleAddSurvey = (client: typeof clientsWithCoaches[0]) => {
    setSelectedClient({ id: client.clientId, name: client.clientName });
    setSelectedCoach({ id: client.coachId, name: client.coachName });
    setSurveyDialogOpen(true);
  };

  if (surveysLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => (
            <Card key={i}>
              <CardContent className="pt-6">
                <Skeleton className="h-8 w-16" />
              </CardContent>
            </Card>
          ))}
        </div>
        <Card>
          <CardContent className="pt-6">
            <Skeleton className="h-64 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Satisfaction Surveys</h1>
          <p className="text-muted-foreground">Track client feedback and coach ratings</p>
        </div>
        
        {clientsWithCoaches.length > 0 && (
          <Select onValueChange={(value) => {
            const client = clientsWithCoaches.find(c => c.clientId === value);
            if (client) handleAddSurvey(client);
          }}>
            <SelectTrigger className="w-[200px]">
              <div className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                <span>Add Survey</span>
              </div>
            </SelectTrigger>
            <SelectContent>
              {clientsWithCoaches.map(c => (
                <SelectItem key={c.clientId} value={c.clientId}>
                  {c.clientName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Surveys</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Average Rating</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold">{stats.avgRating}</span>
              <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">5-Star Ratings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.fiveStarCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">With Feedback</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold">{stats.withFeedback}</span>
              <MessageSquare className="h-5 w-5 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by client, coach, or feedback..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="session">Session</SelectItem>
                <SelectItem value="monthly">Monthly</SelectItem>
                <SelectItem value="general">General</SelectItem>
                <SelectItem value="program_completion">Program</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterRating} onValueChange={setFilterRating}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Rating" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Ratings</SelectItem>
                <SelectItem value="5">5 Stars</SelectItem>
                <SelectItem value="4">4 Stars</SelectItem>
                <SelectItem value="3">3 Stars</SelectItem>
                <SelectItem value="2">2 Stars</SelectItem>
                <SelectItem value="1">1 Star</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Surveys Table */}
      <Card>
        <CardContent className="pt-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Client</TableHead>
                <TableHead>Coach</TableHead>
                <TableHead>Rating</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Feedback</TableHead>
                <TableHead>Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredSurveys.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                    No surveys found
                  </TableCell>
                </TableRow>
              ) : (
                filteredSurveys.map((survey) => (
                  <TableRow key={survey.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="text-xs bg-primary/10 text-primary">
                            {getInitials(survey.client_name || 'U')}
                          </AvatarFallback>
                        </Avatar>
                        <span className="font-medium">{survey.client_name}</span>
                      </div>
                    </TableCell>
                    <TableCell>{survey.coach_name}</TableCell>
                    <TableCell>{renderStars(survey.rating)}</TableCell>
                    <TableCell>
                      <Badge className={surveyTypeColors[survey.survey_type] || surveyTypeColors.general}>
                        {surveyTypeLabels[survey.survey_type] || survey.survey_type}
                      </Badge>
                    </TableCell>
                    <TableCell className="max-w-[200px]">
                      {survey.feedback ? (
                        <p className="truncate text-sm text-muted-foreground">{survey.feedback}</p>
                      ) : (
                        <span className="text-muted-foreground text-sm">—</span>
                      )}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {format(parseISO(survey.created_at), 'MMM d, yyyy')}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Survey Form Dialog */}
      {selectedClient && selectedCoach && (
        <SatisfactionSurveyForm
          open={surveyDialogOpen}
          onOpenChange={setSurveyDialogOpen}
          clientId={selectedClient.id}
          clientName={selectedClient.name}
          coachId={selectedCoach.id}
          coachName={selectedCoach.name}
        />
      )}
    </div>
  );
}
