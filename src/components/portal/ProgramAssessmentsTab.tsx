import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Moon, 
  Brain, 
  ArrowRight, 
  CheckCircle2, 
  Clock, 
  FileText,
  Sparkles,
  Calendar,
  Plus,
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { ClientSleepIntakeForm } from './ClientSleepIntakeForm';
import { ClientMentalIntakeForm } from './ClientMentalIntakeForm';
import { SleepDailyTrackingForm } from './SleepDailyTrackingForm';
import { MentalDailyTrackingForm } from './MentalDailyTrackingForm';

interface Assessment {
  id: string;
  status: string;
  created_at: string;
  isi_score?: number;
  cognitive_function_score?: number;
  phenotype?: string;
}

interface TrackingEntry {
  id: string;
  entry_date: string;
  sleep_quality_rating?: number;
  focus_rating?: number;
}

const statusConfig: Record<string, { label: string; color: string; icon: typeof Clock }> = {
  pending: { label: 'Pending Review', color: 'bg-yellow-500/20 text-yellow-400', icon: Clock },
  in_progress: { label: 'In Progress', color: 'bg-blue-500/20 text-blue-400', icon: FileText },
  completed: { label: 'Completed', color: 'bg-green-500/20 text-green-400', icon: CheckCircle2 },
  reviewed: { label: 'Reviewed', color: 'bg-purple-500/20 text-purple-400', icon: CheckCircle2 },
};

type ActiveFormType = 'sleep-assessment' | 'mental-assessment' | 'sleep-tracking' | 'mental-tracking' | null;

export function ProgramAssessmentsTab() {
  const { user } = useAuth();
  const [activeForm, setActiveForm] = useState<ActiveFormType>(null);
  const [sleepAssessments, setSleepAssessments] = useState<Assessment[]>([]);
  const [mentalAssessments, setMentalAssessments] = useState<Assessment[]>([]);
  const [sleepTracking, setSleepTracking] = useState<TrackingEntry[]>([]);
  const [mentalTracking, setMentalTracking] = useState<TrackingEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [clientId, setClientId] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;

      try {
        // Get client ID
        const { data: clientData } = await supabase
          .from('crm_clients')
          .select('id')
          .eq('user_id', user.id)
          .single();

        if (!clientData) {
          setLoading(false);
          return;
        }

        setClientId(clientData.id);

        // Fetch assessments and tracking in parallel
        const [sleepResult, mentalResult, sleepTrackResult, mentalTrackResult] = await Promise.all([
          supabase
            .from('sleep_assessments')
            .select('id, status, created_at, isi_score, phenotype')
            .eq('client_id', clientData.id)
            .order('created_at', { ascending: false }),
          supabase
            .from('mental_performance_assessments')
            .select('id, status, created_at, cognitive_function_score, phenotype')
            .eq('client_id', clientData.id)
            .order('created_at', { ascending: false }),
          supabase
            .from('sleep_tracking_entries')
            .select('id, entry_date, sleep_quality_rating')
            .eq('client_id', clientData.id)
            .order('entry_date', { ascending: false })
            .limit(7),
          supabase
            .from('mental_performance_tracking')
            .select('id, entry_date, focus_rating')
            .eq('client_id', clientData.id)
            .order('entry_date', { ascending: false })
            .limit(7),
        ]);

        if (sleepResult.data) setSleepAssessments(sleepResult.data);
        if (mentalResult.data) setMentalAssessments(mentalResult.data);
        if (sleepTrackResult.data) setSleepTracking(sleepTrackResult.data);
        if (mentalTrackResult.data) setMentalTracking(mentalTrackResult.data);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  const handleFormComplete = () => {
    setActiveForm(null);
    // Refresh assessments
    window.location.reload();
  };

  if (activeForm === 'sleep-assessment') {
    return (
      <ClientSleepIntakeForm 
        onComplete={handleFormComplete}
        onCancel={() => setActiveForm(null)}
      />
    );
  }

  if (activeForm === 'mental-assessment') {
    return (
      <ClientMentalIntakeForm 
        onComplete={handleFormComplete}
        onCancel={() => setActiveForm(null)}
      />
    );
  }

  if (activeForm === 'sleep-tracking') {
    return (
      <SleepDailyTrackingForm 
        onComplete={handleFormComplete}
        onCancel={() => setActiveForm(null)}
      />
    );
  }

  if (activeForm === 'mental-tracking') {
    return (
      <MentalDailyTrackingForm 
        onComplete={handleFormComplete}
        onCancel={() => setActiveForm(null)}
      />
    );
  }

  if (loading) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        Loading your programs...
      </div>
    );
  }

  const hasSleepAssessment = sleepAssessments.length > 0;
  const hasMentalAssessment = mentalAssessments.length > 0;

  const todayStr = new Date().toISOString().split('T')[0];
  const hasLoggedSleepToday = sleepTracking.some(t => t.entry_date === todayStr);
  const hasLoggedMentalToday = mentalTracking.some(t => t.entry_date === todayStr);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
          <Sparkles className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h2 className="text-xl font-bold">Health Programs</h2>
          <p className="text-sm text-muted-foreground">
            Complete assessments and track your daily progress
          </p>
        </div>
      </div>

      <Tabs defaultValue="assessments" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="assessments" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Assessments
          </TabsTrigger>
          <TabsTrigger value="tracking" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Daily Tracking
          </TabsTrigger>
        </TabsList>

        {/* Assessments Tab */}
        <TabsContent value="assessments" className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            {/* Sleep Assessment Card */}
            <Card className="relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -translate-y-1/2 translate-x-1/2" />
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <Moon className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <CardTitle>Sleep Optimization</CardTitle>
                    <CardDescription>Assess your sleep patterns and challenges</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {hasSleepAssessment ? (
                  <>
                    <div className="space-y-3">
                      {sleepAssessments.slice(0, 3).map((assessment) => {
                        const config = statusConfig[assessment.status] || statusConfig.pending;
                        const StatusIcon = config.icon;
                        return (
                          <div 
                            key={assessment.id} 
                            className="flex items-center justify-between p-3 rounded-lg bg-muted/50 border"
                          >
                            <div className="flex items-center gap-3">
                              <StatusIcon className="h-4 w-4 text-muted-foreground" />
                              <div>
                                <p className="text-sm font-medium">
                                  {new Date(assessment.created_at).toLocaleDateString()}
                                </p>
                                {assessment.isi_score !== null && (
                                  <p className="text-xs text-muted-foreground">
                                    ISI Score: {assessment.isi_score}
                                  </p>
                                )}
                              </div>
                            </div>
                            <Badge className={config.color}>{config.label}</Badge>
                          </div>
                        );
                      })}
                    </div>
                    <Button 
                      variant="outline" 
                      className="w-full"
                      onClick={() => setActiveForm('sleep-assessment')}
                    >
                      Take New Assessment
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </>
                ) : (
                  <div className="space-y-4">
                    <div className="p-4 rounded-lg bg-muted/50 border border-dashed">
                      <p className="text-sm text-muted-foreground text-center">
                        No sleep assessments yet. Complete your first assessment to get started.
                      </p>
                    </div>
                    <Button 
                      className="w-full"
                      onClick={() => setActiveForm('sleep-assessment')}
                    >
                      Start Sleep Assessment
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Mental Performance Card */}
            <Card className="relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -translate-y-1/2 translate-x-1/2" />
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <Brain className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <CardTitle>Mental Performance</CardTitle>
                    <CardDescription>Assess your cognitive function and focus</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {hasMentalAssessment ? (
                  <>
                    <div className="space-y-3">
                      {mentalAssessments.slice(0, 3).map((assessment) => {
                        const config = statusConfig[assessment.status] || statusConfig.pending;
                        const StatusIcon = config.icon;
                        return (
                          <div 
                            key={assessment.id} 
                            className="flex items-center justify-between p-3 rounded-lg bg-muted/50 border"
                          >
                            <div className="flex items-center gap-3">
                              <StatusIcon className="h-4 w-4 text-muted-foreground" />
                              <div>
                                <p className="text-sm font-medium">
                                  {new Date(assessment.created_at).toLocaleDateString()}
                                </p>
                                {assessment.cognitive_function_score !== null && (
                                  <p className="text-xs text-muted-foreground">
                                    Cognitive Score: {assessment.cognitive_function_score}
                                  </p>
                                )}
                              </div>
                            </div>
                            <Badge className={config.color}>{config.label}</Badge>
                          </div>
                        );
                      })}
                    </div>
                    <Button 
                      variant="outline" 
                      className="w-full"
                      onClick={() => setActiveForm('mental-assessment')}
                    >
                      Take New Assessment
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </>
                ) : (
                  <div className="space-y-4">
                    <div className="p-4 rounded-lg bg-muted/50 border border-dashed">
                      <p className="text-sm text-muted-foreground text-center">
                        No mental performance assessments yet. Complete your first assessment to get started.
                      </p>
                    </div>
                    <Button 
                      className="w-full"
                      onClick={() => setActiveForm('mental-assessment')}
                    >
                      Start Mental Assessment
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Information Card */}
          <Card className="bg-muted/30">
            <CardContent className="py-4">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <FileText className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold">How it works</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    After you complete an assessment, your coach will review your responses and create 
                    a personalized optimization plan tailored to your specific needs and goals.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Daily Tracking Tab */}
        <TabsContent value="tracking" className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            {/* Sleep Tracking Card */}
            <Card className="relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -translate-y-1/2 translate-x-1/2" />
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <Moon className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <CardTitle>Sleep Tracking</CardTitle>
                    <CardDescription>Log your daily sleep metrics</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {hasLoggedSleepToday ? (
                  <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/20">
                    <div className="flex items-center gap-2 text-green-600">
                      <CheckCircle2 className="h-5 w-5" />
                      <p className="text-sm font-medium">Today's entry logged!</p>
                    </div>
                  </div>
                ) : (
                  <Button 
                    className="w-full"
                    onClick={() => setActiveForm('sleep-tracking')}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Log Today's Sleep
                  </Button>
                )}

                {sleepTracking.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-muted-foreground">Recent Entries</p>
                    <div className="space-y-2">
                      {sleepTracking.slice(0, 5).map((entry) => (
                        <div 
                          key={entry.id} 
                          className="flex items-center justify-between p-2 rounded-lg bg-muted/50"
                        >
                          <span className="text-sm">
                            {new Date(entry.entry_date).toLocaleDateString()}
                          </span>
                          {entry.sleep_quality_rating && (
                            <Badge variant="outline">
                              Quality: {entry.sleep_quality_rating}/10
                            </Badge>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {sleepTracking.length === 0 && !hasLoggedSleepToday && (
                  <div className="p-4 rounded-lg bg-muted/50 border border-dashed">
                    <p className="text-sm text-muted-foreground text-center">
                      No sleep tracking entries yet. Start logging daily to see trends.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Mental Tracking Card */}
            <Card className="relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -translate-y-1/2 translate-x-1/2" />
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <Brain className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <CardTitle>Mental Tracking</CardTitle>
                    <CardDescription>Log your daily cognitive metrics</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {hasLoggedMentalToday ? (
                  <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/20">
                    <div className="flex items-center gap-2 text-green-600">
                      <CheckCircle2 className="h-5 w-5" />
                      <p className="text-sm font-medium">Today's entry logged!</p>
                    </div>
                  </div>
                ) : (
                  <Button 
                    className="w-full"
                    onClick={() => setActiveForm('mental-tracking')}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Log Today's Mental State
                  </Button>
                )}

                {mentalTracking.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-muted-foreground">Recent Entries</p>
                    <div className="space-y-2">
                      {mentalTracking.slice(0, 5).map((entry) => (
                        <div 
                          key={entry.id} 
                          className="flex items-center justify-between p-2 rounded-lg bg-muted/50"
                        >
                          <span className="text-sm">
                            {new Date(entry.entry_date).toLocaleDateString()}
                          </span>
                          {entry.focus_rating && (
                            <Badge variant="outline">
                              Focus: {entry.focus_rating}/10
                            </Badge>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {mentalTracking.length === 0 && !hasLoggedMentalToday && (
                  <div className="p-4 rounded-lg bg-muted/50 border border-dashed">
                    <p className="text-sm text-muted-foreground text-center">
                      No mental tracking entries yet. Start logging daily to see trends.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Tracking Info Card */}
          <Card className="bg-muted/30">
            <CardContent className="py-4">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Calendar className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold">Why track daily?</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Daily tracking helps your coach identify patterns and adjust your program for optimal results. 
                    Consistent logging provides valuable insights into what's working and what needs adjustment.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
