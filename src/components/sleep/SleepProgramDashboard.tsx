import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  Moon, 
  Brain, 
  Activity, 
  Users, 
  TrendingUp, 
  Clock,
  Zap,
  Target,
  AlertCircle,
  CheckCircle2,
  ArrowUpRight,
  BarChart3,
} from 'lucide-react';
import { useSleepProgramStats, useSleepAssessments } from '@/hooks/useSleepProgram';
import { 
  sleepPhenotypeLabels, 
  programTierLabels,
  getISISeverity,
  SleepPhenotype,
  SleepProgramTier,
} from '@/types/sleep';
import { SleepAssessmentsList } from './SleepAssessmentsList';
import { SleepInterventionsLibrary } from './SleepInterventionsLibrary';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const tierColors: Record<SleepProgramTier, string> = {
  foundational: 'hsl(var(--chart-1))',
  advanced: 'hsl(var(--chart-2))',
  elite: 'hsl(var(--chart-3))',
};

const phenotypeColors: Record<SleepPhenotype, string> = {
  stress_dominant: 'hsl(var(--chart-1))',
  circadian_shifted: 'hsl(var(--chart-2))',
  fragmented: 'hsl(var(--chart-3))',
  short_duration: 'hsl(var(--chart-4))',
  recovery_deficient: 'hsl(var(--chart-5))',
};

export function SleepProgramDashboard() {
  const { stats, loading } = useSleepProgramStats();
  const { assessments } = useSleepAssessments();
  const [activeTab, setActiveTab] = useState('overview');

  const phenotypeData = Object.entries(stats.byPhenotype).map(([key, value]) => ({
    name: sleepPhenotypeLabels[key as SleepPhenotype],
    value,
    color: phenotypeColors[key as SleepPhenotype],
  }));

  const tierData = Object.entries(stats.byTier).map(([key, value]) => ({
    name: programTierLabels[key as SleepProgramTier],
    value,
    color: tierColors[key as SleepProgramTier],
  }));

  const isiSeverity = getISISeverity(stats.averageISI);

  // Recent assessments for quick actions
  const pendingAssessments = assessments.filter(a => a.status === 'pending' || a.status === 'in_progress');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
            <Moon className="h-8 w-8 text-primary" />
            Sleep Optimization Pathway
          </h1>
          <p className="text-muted-foreground mt-1">
            Personalized sleep performance and recovery optimization
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <BarChart3 className="h-4 w-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3 md:w-[400px]">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="assessments">Assessments</TabsTrigger>
          <TabsTrigger value="interventions">Interventions</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Stats Grid */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Active Clients</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.activeClients}</div>
                <p className="text-xs text-muted-foreground">
                  In sleep optimization program
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Total Assessments</CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalAssessments}</div>
                <p className="text-xs text-muted-foreground">
                  Completed intake assessments
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Avg ISI Score</CardTitle>
                <Brain className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.averageISI}</div>
                <p className={`text-xs ${isiSeverity.color}`}>
                  {isiSeverity.label}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Pending Reviews</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{pendingAssessments.length}</div>
                <p className="text-xs text-muted-foreground">
                  Awaiting coach review
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Charts Row */}
          <div className="grid gap-6 md:grid-cols-2">
            {/* Phenotype Distribution */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Sleep Phenotype Distribution</CardTitle>
                <CardDescription>Client classification by sleep pattern</CardDescription>
              </CardHeader>
              <CardContent>
                {phenotypeData.length > 0 ? (
                  <div className="h-[250px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={phenotypeData}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={80}
                          paddingAngle={5}
                          dataKey="value"
                        >
                          {phenotypeData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div className="h-[250px] flex items-center justify-center text-muted-foreground">
                    No phenotype data yet
                  </div>
                )}
                <div className="grid grid-cols-2 gap-2 mt-4">
                  {phenotypeData.map((item) => (
                    <div key={item.name} className="flex items-center gap-2 text-sm">
                      <div 
                        className="w-3 h-3 rounded-full" 
                        style={{ backgroundColor: item.color }}
                      />
                      <span className="text-muted-foreground truncate">{item.name}</span>
                      <span className="font-medium ml-auto">{item.value}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Program Tier Distribution */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Program Tier Enrollment</CardTitle>
                <CardDescription>Clients by optimization level</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6 py-4">
                  {(['foundational', 'advanced', 'elite'] as SleepProgramTier[]).map((tier) => {
                    const count = stats.byTier[tier] || 0;
                    const total = stats.totalAssessments || 1;
                    const percentage = Math.round((count / total) * 100);
                    
                    return (
                      <div key={tier} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Badge 
                              variant={tier === 'elite' ? 'default' : 'secondary'}
                              className={tier === 'elite' ? 'bg-primary' : ''}
                            >
                              {tier.charAt(0).toUpperCase() + tier.slice(1)}
                            </Badge>
                            <span className="text-sm text-muted-foreground">
                              {programTierLabels[tier]}
                            </span>
                          </div>
                          <span className="text-sm font-medium">{count} clients</span>
                        </div>
                        <Progress value={percentage} className="h-2" />
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Pending Actions */}
          {pendingAssessments.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <AlertCircle className="h-5 w-5 text-yellow-500" />
                  Pending Actions
                </CardTitle>
                <CardDescription>Assessments requiring attention</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {pendingAssessments.slice(0, 5).map((assessment) => (
                    <div 
                      key={assessment.id}
                      className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-2 h-2 rounded-full ${
                          assessment.status === 'pending' ? 'bg-yellow-500' : 'bg-blue-500'
                        }`} />
                        <div>
                          <p className="text-sm font-medium">
                            Assessment #{assessment.id.slice(0, 8)}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {assessment.status === 'pending' ? 'Awaiting review' : 'In progress'}
                          </p>
                        </div>
                      </div>
                      <Button size="sm" variant="ghost">
                        Review
                        <ArrowUpRight className="h-4 w-4 ml-1" />
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* KPI Benchmarks */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Target className="h-5 w-5" />
                Success Benchmarks
              </CardTitle>
              <CardDescription>Expected milestones for sleep optimization</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3">
                <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/20">
                  <div className="flex items-center gap-2 mb-2">
                    <Clock className="h-4 w-4 text-green-600" />
                    <span className="text-sm font-medium text-green-700">14–21 Days</span>
                  </div>
                  <p className="text-sm text-green-600">Sleep consistency improves</p>
                </div>
                <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/20">
                  <div className="flex items-center gap-2 mb-2">
                    <Zap className="h-4 w-4 text-blue-600" />
                    <span className="text-sm font-medium text-blue-700">30–45 Days</span>
                  </div>
                  <p className="text-sm text-blue-600">Energy and recovery normalize</p>
                </div>
                <div className="p-4 rounded-lg bg-purple-500/10 border border-purple-500/20">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle2 className="h-4 w-4 text-purple-600" />
                    <span className="text-sm font-medium text-purple-700">60–90 Days</span>
                  </div>
                  <p className="text-sm text-purple-600">Sleep becomes self-sustaining</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="assessments">
          <SleepAssessmentsList />
        </TabsContent>

        <TabsContent value="interventions">
          <SleepInterventionsLibrary />
        </TabsContent>
      </Tabs>
    </div>
  );
}
