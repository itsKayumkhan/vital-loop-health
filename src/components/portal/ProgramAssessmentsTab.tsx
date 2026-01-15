import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Moon, 
  Brain, 
  ArrowRight, 
  CheckCircle2, 
  Clock, 
  FileText,
  Sparkles,
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { ClientSleepIntakeForm } from './ClientSleepIntakeForm';
import { ClientMentalIntakeForm } from './ClientMentalIntakeForm';

interface Assessment {
  id: string;
  status: string;
  created_at: string;
  isi_score?: number;
  cognitive_function_score?: number;
  phenotype?: string;
}

const statusConfig: Record<string, { label: string; color: string; icon: typeof Clock }> = {
  pending: { label: 'Pending Review', color: 'bg-yellow-500/20 text-yellow-400', icon: Clock },
  in_progress: { label: 'In Progress', color: 'bg-blue-500/20 text-blue-400', icon: FileText },
  completed: { label: 'Completed', color: 'bg-green-500/20 text-green-400', icon: CheckCircle2 },
  reviewed: { label: 'Reviewed', color: 'bg-purple-500/20 text-purple-400', icon: CheckCircle2 },
};

export function ProgramAssessmentsTab() {
  const { user } = useAuth();
  const [activeForm, setActiveForm] = useState<'sleep' | 'mental' | null>(null);
  const [sleepAssessments, setSleepAssessments] = useState<Assessment[]>([]);
  const [mentalAssessments, setMentalAssessments] = useState<Assessment[]>([]);
  const [loading, setLoading] = useState(true);
  const [clientId, setClientId] = useState<string | null>(null);

  useEffect(() => {
    const fetchAssessments = async () => {
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

        // Fetch both assessment types in parallel
        const [sleepResult, mentalResult] = await Promise.all([
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
        ]);

        if (sleepResult.data) setSleepAssessments(sleepResult.data);
        if (mentalResult.data) setMentalAssessments(mentalResult.data);
      } catch (error) {
        console.error('Error fetching assessments:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAssessments();
  }, [user]);

  const handleFormComplete = () => {
    setActiveForm(null);
    // Refresh assessments
    window.location.reload();
  };

  if (activeForm === 'sleep') {
    return (
      <ClientSleepIntakeForm 
        onComplete={handleFormComplete}
        onCancel={() => setActiveForm(null)}
      />
    );
  }

  if (activeForm === 'mental') {
    return (
      <ClientMentalIntakeForm 
        onComplete={handleFormComplete}
        onCancel={() => setActiveForm(null)}
      />
    );
  }

  if (loading) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        Loading your assessments...
      </div>
    );
  }

  const hasSleepAssessment = sleepAssessments.length > 0;
  const hasMentalAssessment = mentalAssessments.length > 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
          <Sparkles className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h2 className="text-xl font-bold">Program Assessments</h2>
          <p className="text-sm text-muted-foreground">
            Complete your assessments to help your coach create personalized programs
          </p>
        </div>
      </div>

      {/* Assessment Cards */}
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
                  onClick={() => setActiveForm('sleep')}
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
                  onClick={() => setActiveForm('sleep')}
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
                  onClick={() => setActiveForm('mental')}
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
                  onClick={() => setActiveForm('mental')}
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
                a personalized optimization plan tailored to your specific needs and goals. You'll 
                receive notification when your plan is ready.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
