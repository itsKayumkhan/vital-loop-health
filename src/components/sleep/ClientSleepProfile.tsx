import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Moon, 
  Brain, 
  Clock, 
  Zap, 
  Target,
  TrendingUp,
  TrendingDown,
  Calendar,
  CheckCircle2,
  AlertCircle,
  Plus,
  Activity,
} from 'lucide-react';
import { useSleepAssessments, useSleepTracking, useClientInterventions, useSleepInterventions } from '@/hooks/useSleepProgram';
import { 
  sleepPhenotypeLabels,
  sleepPhenotypeDescriptions,
  programTierLabels,
  getISISeverity,
} from '@/types/sleep';
import { format, subDays, differenceInDays } from 'date-fns';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { SleepAssessmentForm } from './SleepAssessmentForm';

interface ClientSleepProfileProps {
  clientId: string;
  clientName: string;
}

export function ClientSleepProfile({ clientId, clientName }: ClientSleepProfileProps) {
  const { assessments, createAssessment } = useSleepAssessments(clientId);
  const { entries } = useSleepTracking(clientId);
  const { clientInterventions, assignIntervention, updateInterventionStatus } = useClientInterventions(clientId);
  const { getRecommendedInterventions } = useSleepInterventions();
  const [showAssessmentForm, setShowAssessmentForm] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  const latestAssessment = assessments[0];
  const activeInterventions = clientInterventions.filter(ci => ci.status === 'active');

  // Calculate trends from tracking data
  const last7Days = entries.filter(e => {
    const entryDate = new Date(e.entry_date);
    const weekAgo = subDays(new Date(), 7);
    return entryDate >= weekAgo;
  });

  const averageQuality = last7Days.length > 0
    ? Math.round(last7Days.reduce((sum, e) => sum + (e.sleep_quality_rating || 0), 0) / last7Days.length * 10) / 10
    : null;

  const averageEnergy = last7Days.length > 0
    ? Math.round(last7Days.reduce((sum, e) => sum + (e.morning_energy_rating || 0), 0) / last7Days.length * 10) / 10
    : null;

  // Chart data
  const chartData = entries.slice(0, 14).reverse().map(entry => ({
    date: format(new Date(entry.entry_date), 'MMM d'),
    quality: entry.sleep_quality_rating,
    energy: entry.morning_energy_rating,
    focus: entry.daytime_focus_rating,
  }));

  const handleCreateAssessment = async (data: any) => {
    await createAssessment(clientId, data);
    setShowAssessmentForm(false);
  };

  if (showAssessmentForm) {
    return (
      <SleepAssessmentForm
        clientId={clientId}
        onSubmit={handleCreateAssessment}
        onCancel={() => setShowAssessmentForm(false)}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-3">
            <Moon className="h-6 w-6 text-primary" />
            Sleep Profile: {clientName}
          </h2>
          <p className="text-muted-foreground">
            {latestAssessment ? 'Active in sleep optimization program' : 'No assessment completed yet'}
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
            <Moon className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
            <h3 className="text-lg font-medium mb-2">No Sleep Assessment Yet</h3>
            <p className="text-muted-foreground mb-4">
              Start a sleep assessment to enroll this client in the Sleep Optimization Pathway
            </p>
            <Button onClick={() => setShowAssessmentForm(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Start Sleep Assessment
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="tracking">Sleep Tracking</TabsTrigger>
            <TabsTrigger value="interventions">Interventions</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Profile Summary */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {/* Phenotype */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <Brain className="h-4 w-4" />
                    Sleep Phenotype
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {latestAssessment.phenotype ? (
                    <>
                      <div className="font-semibold text-lg">
                        {sleepPhenotypeLabels[latestAssessment.phenotype]}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        {sleepPhenotypeDescriptions[latestAssessment.phenotype]}
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
                    {latestAssessment.program_tier.charAt(0).toUpperCase() + latestAssessment.program_tier.slice(1)}
                  </Badge>
                  <p className="text-xs text-muted-foreground mt-2">
                    {programTierLabels[latestAssessment.program_tier]}
                  </p>
                </CardContent>
              </Card>

              {/* ISI Score */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <Activity className="h-4 w-4" />
                    ISI Score
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {latestAssessment.isi_score !== null ? (
                    <>
                      <div className="text-2xl font-bold">{latestAssessment.isi_score}</div>
                      <p className={`text-xs ${getISISeverity(latestAssessment.isi_score).color}`}>
                        {getISISeverity(latestAssessment.isi_score).label}
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
                  <CardTitle className="text-lg">7-Day Sleep Quality</CardTitle>
                  <CardDescription>Average ratings from tracking data</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 rounded-lg bg-muted/50 text-center">
                      <Moon className="h-5 w-5 mx-auto mb-2 text-primary" />
                      <div className="text-2xl font-bold">
                        {averageQuality !== null ? averageQuality : '—'}
                      </div>
                      <p className="text-xs text-muted-foreground">Sleep Quality</p>
                    </div>
                    <div className="p-4 rounded-lg bg-muted/50 text-center">
                      <Zap className="h-5 w-5 mx-auto mb-2 text-yellow-500" />
                      <div className="text-2xl font-bold">
                        {averageEnergy !== null ? averageEnergy : '—'}
                      </div>
                      <p className="text-xs text-muted-foreground">Morning Energy</p>
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
                            {ci.intervention?.name || 'Unknown'}
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
                <CardTitle>Sleep Metrics Trend</CardTitle>
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
                          dataKey="quality" 
                          stroke="hsl(var(--primary))" 
                          strokeWidth={2}
                          name="Sleep Quality"
                        />
                        <Line 
                          type="monotone" 
                          dataKey="energy" 
                          stroke="hsl(var(--chart-2))" 
                          strokeWidth={2}
                          name="Morning Energy"
                        />
                        <Line 
                          type="monotone" 
                          dataKey="focus" 
                          stroke="hsl(var(--chart-3))" 
                          strokeWidth={2}
                          name="Daytime Focus"
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
                  Protocols currently assigned to this client
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
                          <div className="font-medium">{ci.intervention?.name}</div>
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
