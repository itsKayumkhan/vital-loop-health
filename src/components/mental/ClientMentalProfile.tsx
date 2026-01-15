import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Brain, 
  Zap, 
  Target,
  Calendar,
  CheckCircle2,
  Plus,
  Activity,
  Lightbulb,
} from 'lucide-react';
import { useMentalAssessments, useMentalTracking, useClientMentalInterventions, useMentalInterventions } from '@/hooks/useMentalPerformance';
import { 
  mentalPhenotypeLabels,
  mentalPhenotypeDescriptions,
  mentalTierLabels,
  getCognitiveFunctionLevel,
} from '@/types/mentalPerformance';
import { format, subDays, differenceInDays } from 'date-fns';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { MentalAssessmentForm } from './MentalAssessmentForm';

interface ClientMentalProfileProps {
  clientId: string;
  clientName: string;
}

export function ClientMentalProfile({ clientId, clientName }: ClientMentalProfileProps) {
  const { assessments, fetchAssessments } = useMentalAssessments(clientId);
  const { entries } = useMentalTracking(clientId);
  const { clientInterventions, updateInterventionStatus } = useClientMentalInterventions(clientId);
  const { interventions } = useMentalInterventions();
  const [showAssessmentForm, setShowAssessmentForm] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  const latestAssessment = assessments[0];
  const activeInterventions = clientInterventions.filter(ci => ci.status === 'active');

  // Get intervention name by ID
  const getInterventionName = (interventionId: string) => {
    const intervention = interventions.find(i => i.id === interventionId);
    return intervention?.name || 'Unknown';
  };

  // Calculate trends from tracking data
  const last7Days = entries.filter(e => {
    const entryDate = new Date(e.entry_date);
    const weekAgo = subDays(new Date(), 7);
    return entryDate >= weekAgo;
  });

  const averageFocus = last7Days.length > 0
    ? Math.round(last7Days.reduce((sum, e) => sum + (e.focus_rating || 0), 0) / last7Days.length * 10) / 10
    : null;

  const averageEnergy = last7Days.length > 0
    ? Math.round(last7Days.reduce((sum, e) => sum + (e.mental_energy_rating || 0), 0) / last7Days.length * 10) / 10
    : null;

  // Chart data
  const chartData = entries.slice(0, 14).reverse().map(entry => ({
    date: format(new Date(entry.entry_date), 'MMM d'),
    focus: entry.focus_rating,
    energy: entry.mental_energy_rating,
    clarity: entry.mental_clarity_rating,
    mood: entry.mood_rating,
  }));

  const handleAssessmentComplete = () => {
    setShowAssessmentForm(false);
    fetchAssessments();
  };

  if (showAssessmentForm) {
    return (
      <div className="space-y-4">
        <Button variant="outline" onClick={() => setShowAssessmentForm(false)}>
          ← Back to Profile
        </Button>
        <MentalAssessmentForm
          clientId={clientId}
          onComplete={handleAssessmentComplete}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-3">
            <Brain className="h-6 w-6 text-primary" />
            Mental Profile: {clientName}
          </h2>
          <p className="text-muted-foreground">
            {latestAssessment ? 'Active in mental performance program' : 'No assessment completed yet'}
          </p>
        </div>
        <Button onClick={() => setShowAssessmentForm(true)}>
          <Plus className="h-4 w-4 mr-2" />
          {latestAssessment ? 'New Assessment' : 'Start Assessment'}
        </Button>
      </div>

      {!latestAssessment ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Brain className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
            <h3 className="text-lg font-medium mb-2">No Mental Performance Assessment Yet</h3>
            <p className="text-muted-foreground mb-4">
              Start an assessment to enroll this client in the Mental Performance Optimization program
            </p>
            <Button onClick={() => setShowAssessmentForm(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Start Mental Assessment
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="tracking">Performance Tracking</TabsTrigger>
            <TabsTrigger value="interventions">Interventions</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Profile Summary */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {/* Phenotype */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <Lightbulb className="h-4 w-4" />
                    Cognitive Phenotype
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {latestAssessment.phenotype ? (
                    <>
                      <div className="font-semibold text-lg">
                        {mentalPhenotypeLabels[latestAssessment.phenotype]}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        {mentalPhenotypeDescriptions[latestAssessment.phenotype]}
                      </p>
                    </>
                  ) : (
                    <span className="text-muted-foreground">Not classified</span>
                  )}
                </CardContent>
              </Card>

              {/* Program Tier */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <Target className="h-4 w-4" />
                    Program Tier
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Badge className="text-sm">
                    {mentalTierLabels[latestAssessment.program_tier]}
                  </Badge>
                </CardContent>
              </Card>

              {/* Cognitive Function Score */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <Activity className="h-4 w-4" />
                    Cognitive Score
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {latestAssessment.cognitive_function_score !== null && latestAssessment.cognitive_function_score !== undefined ? (
                    <>
                      <div className="text-2xl font-bold">{latestAssessment.cognitive_function_score}</div>
                      <p className={`text-xs ${getCognitiveFunctionLevel(latestAssessment.cognitive_function_score).color}`}>
                        {getCognitiveFunctionLevel(latestAssessment.cognitive_function_score).label}
                      </p>
                    </>
                  ) : (
                    <span className="text-muted-foreground">Not calculated</span>
                  )}
                </CardContent>
              </Card>

              {/* Days in Program */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Days in Program
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {differenceInDays(new Date(), new Date(latestAssessment.created_at))}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Started {format(new Date(latestAssessment.created_at), 'MMM d, yyyy')}
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* 7-Day Metrics */}
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">7-Day Mental Performance</CardTitle>
                  <CardDescription>Average ratings from tracking data</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 rounded-lg bg-muted/50 text-center">
                      <Target className="h-5 w-5 mx-auto mb-2 text-primary" />
                      <div className="text-2xl font-bold">
                        {averageFocus !== null ? averageFocus : '—'}
                      </div>
                      <p className="text-xs text-muted-foreground">Focus Rating</p>
                    </div>
                    <div className="p-4 rounded-lg bg-muted/50 text-center">
                      <Zap className="h-5 w-5 mx-auto mb-2 text-yellow-500" />
                      <div className="text-2xl font-bold">
                        {averageEnergy !== null ? averageEnergy : '—'}
                      </div>
                      <p className="text-xs text-muted-foreground">Mental Energy</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Active Interventions */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Active Interventions</CardTitle>
                  <CardDescription>{activeInterventions.length} protocols in progress</CardDescription>
                </CardHeader>
                <CardContent>
                  {activeInterventions.length > 0 ? (
                    <div className="space-y-2">
                      {activeInterventions.slice(0, 3).map(ci => (
                        <div key={ci.id} className="flex items-center justify-between p-2 rounded-lg bg-muted/50">
                          <span className="text-sm font-medium">
                            {getInterventionName(ci.intervention_id)}
                          </span>
                          <Badge variant="secondary">
                            {differenceInDays(new Date(), new Date(ci.start_date))}d
                          </Badge>
                        </div>
                      ))}
                      {activeInterventions.length > 3 && (
                        <Button variant="link" className="w-full" onClick={() => setActiveTab('interventions')}>
                          View all {activeInterventions.length} interventions
                        </Button>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-4 text-muted-foreground">
                      <p className="text-sm">No active interventions</p>
                      <Button variant="link" onClick={() => setActiveTab('interventions')}>
                        Assign interventions
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="tracking" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Mental Performance Trend</CardTitle>
                <CardDescription>Last 14 days of tracking data</CardDescription>
              </CardHeader>
              <CardContent>
                {chartData.length > 0 ? (
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                        <XAxis dataKey="date" className="text-xs" />
                        <YAxis domain={[0, 10]} className="text-xs" />
                        <Tooltip />
                        <Line 
                          type="monotone" 
                          dataKey="focus" 
                          stroke="hsl(var(--primary))" 
                          strokeWidth={2}
                          name="Focus"
                        />
                        <Line 
                          type="monotone" 
                          dataKey="energy" 
                          stroke="hsl(var(--chart-2))" 
                          strokeWidth={2}
                          name="Mental Energy"
                        />
                        <Line 
                          type="monotone" 
                          dataKey="clarity" 
                          stroke="hsl(var(--chart-3))" 
                          strokeWidth={2}
                          name="Mental Clarity"
                        />
                        <Line 
                          type="monotone" 
                          dataKey="mood" 
                          stroke="hsl(var(--chart-4))" 
                          strokeWidth={2}
                          name="Mood"
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                    No tracking data available
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="interventions" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Assigned Interventions</CardTitle>
                <CardDescription>
                  Brain optimization protocols assigned to this client
                </CardDescription>
              </CardHeader>
              <CardContent>
                {clientInterventions.length > 0 ? (
                  <div className="space-y-3">
                    {clientInterventions.map(ci => (
                      <div 
                        key={ci.id}
                        className="flex items-center justify-between p-4 rounded-lg border"
                      >
                        <div>
                          <div className="font-medium">{getInterventionName(ci.intervention_id)}</div>
                          <p className="text-sm text-muted-foreground">
                            Started {format(new Date(ci.start_date), 'MMM d, yyyy')}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant={ci.status === 'active' ? 'default' : 'secondary'}>
                            {ci.status}
                          </Badge>
                          {ci.status === 'active' && (
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => updateInterventionStatus(ci.id, 'completed')}
                            >
                              <CheckCircle2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <p>No interventions assigned yet</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}
