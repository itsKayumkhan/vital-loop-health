import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Brain, Target, TrendingUp, Users, Activity, Zap, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useMentalProgramStats, useMentalAssessments } from '@/hooks/useMentalPerformance';
import { MentalAssessmentsList } from './MentalAssessmentsList';
import { MentalInterventionsLibrary } from './MentalInterventionsLibrary';
import { 
  mentalPhenotypeLabels, 
  mentalTierLabels, 
  cognitiveSeverityLevels, 
  getCognitiveSeverity 
} from '@/types/mentalPerformance';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

const PHENOTYPE_COLORS = {
  focus_deficit: '#ef4444',
  memory_challenged: '#f97316',
  stress_reactive: '#eab308',
  energy_depleted: '#3b82f6',
  mood_fluctuating: '#8b5cf6',
};

const TIER_COLORS = {
  cognitive_foundations: '#22c55e',
  performance_optimization: '#3b82f6',
  elite_cognition: '#a855f7',
};

export function MentalPerformanceDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const { stats, loading: statsLoading } = useMentalProgramStats();
  const { assessments, loading: assessmentsLoading } = useMentalAssessments();

  const phenotypeData = Object.entries(stats.phenotypeCounts).map(([key, value]) => ({
    name: mentalPhenotypeLabels[key as keyof typeof mentalPhenotypeLabels] || key,
    value,
    color: PHENOTYPE_COLORS[key as keyof typeof PHENOTYPE_COLORS] || '#6b7280',
  }));

  const tierData = Object.entries(stats.tierCounts).map(([key, value]) => ({
    name: mentalTierLabels[key as keyof typeof mentalTierLabels] || key,
    value,
    color: TIER_COLORS[key as keyof typeof TIER_COLORS] || '#6b7280',
    tier: key,
  }));

  const cognitiveSeverity = getCognitiveSeverity(stats.avgCognitiveScore);
  const pendingReviews = assessments.filter(a => a.status === 'pending' || a.status === 'in_progress').length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Brain className="h-7 w-7 text-primary" />
            Mental Performance Program
          </h2>
          <p className="text-muted-foreground">
            Cognitive optimization and brain performance tracking
          </p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="assessments">Assessments</TabsTrigger>
          <TabsTrigger value="interventions">Interventions</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* KPI Cards */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Clients</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.activeClients}</div>
                <p className="text-xs text-muted-foreground">In mental performance program</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Assessments</CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalAssessments}</div>
                <p className="text-xs text-muted-foreground">Cognitive assessments completed</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Avg Cognitive Score</CardTitle>
                <Target className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.avgCognitiveScore}/20</div>
                <p className={`text-xs ${cognitiveSeverity.color}`}>
                  {cognitiveSeverity.label} - {cognitiveSeverity.description}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pending Reviews</CardTitle>
                <AlertCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{pendingReviews}</div>
                <p className="text-xs text-muted-foreground">Assessments awaiting review</p>
              </CardContent>
            </Card>
          </div>

          {/* Charts Row */}
          <div className="grid gap-4 md:grid-cols-2">
            {/* Phenotype Distribution */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Cognitive Phenotype Distribution</CardTitle>
                <CardDescription>Client classification by primary cognitive pattern</CardDescription>
              </CardHeader>
              <CardContent>
                {phenotypeData.length > 0 ? (
                  <div className="flex items-center gap-4">
                    <div className="h-[200px] w-[200px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={phenotypeData}
                            cx="50%"
                            cy="50%"
                            innerRadius={50}
                            outerRadius={80}
                            paddingAngle={2}
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
                    <div className="flex-1 space-y-2">
                      {phenotypeData.map((item) => (
                        <div key={item.name} className="flex items-center gap-2">
                          <div 
                            className="h-3 w-3 rounded-full" 
                            style={{ backgroundColor: item.color }} 
                          />
                          <span className="text-sm">{item.name}</span>
                          <Badge variant="secondary" className="ml-auto">{item.value}</Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="flex h-[200px] items-center justify-center text-muted-foreground">
                    No phenotype data available yet
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Program Tier Enrollment */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Program Tier Enrollment</CardTitle>
                <CardDescription>Client distribution across cognitive tiers</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {tierData.length > 0 ? (
                  tierData.map((tier) => {
                    const percentage = stats.totalAssessments > 0 
                      ? Math.round((tier.value / stats.totalAssessments) * 100) 
                      : 0;
                    return (
                      <div key={tier.tier} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Zap className="h-4 w-4" style={{ color: tier.color }} />
                            <span className="font-medium">{tier.name}</span>
                          </div>
                          <span className="text-sm text-muted-foreground">
                            {tier.value} clients ({percentage}%)
                          </span>
                        </div>
                        <Progress value={percentage} className="h-2" />
                      </div>
                    );
                  })
                ) : (
                  <div className="flex h-[150px] items-center justify-center text-muted-foreground">
                    No tier data available yet
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <AlertCircle className="h-5 w-5 text-amber-500" />
                  Pending Assessment Actions
                </CardTitle>
              </CardHeader>
              <CardContent>
                {pendingReviews > 0 ? (
                  <div className="space-y-3">
                    {assessments
                      .filter(a => a.status === 'pending' || a.status === 'in_progress')
                      .slice(0, 5)
                      .map(assessment => (
                        <div key={assessment.id} className="flex items-center justify-between border-b pb-2 last:border-0">
                          <div>
                            <p className="font-medium text-sm">Client Assessment</p>
                            <p className="text-xs text-muted-foreground">
                              {new Date(assessment.created_at).toLocaleDateString()}
                            </p>
                          </div>
                          <Badge variant={assessment.status === 'pending' ? 'destructive' : 'secondary'}>
                            {assessment.status}
                          </Badge>
                        </div>
                      ))}
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-green-600">
                    <CheckCircle2 className="h-5 w-5" />
                    <span>All assessments reviewed</span>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-primary" />
                  Cognitive Optimization Milestones
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {cognitiveSeverityLevels.map((level, index) => (
                    <div key={level.label} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className={`h-2 w-2 rounded-full ${level.color.replace('text-', 'bg-')}`} />
                        <span className="text-sm">{level.label}</span>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        Score {level.min}-{level.max}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="assessments">
          <MentalAssessmentsList />
        </TabsContent>

        <TabsContent value="interventions">
          <MentalInterventionsLibrary />
        </TabsContent>
      </Tabs>
    </div>
  );
}
