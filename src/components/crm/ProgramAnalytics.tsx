import { useMemo, useState } from 'react';
import { Crown, Moon, Brain, Package, Users, DollarSign, UserMinus, ArrowUp, ArrowDown, Minus, RefreshCw } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useCRMMemberships, useCRMClients } from '@/hooks/useCRM';
import { Skeleton } from '@/components/ui/skeleton';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { format, subMonths, startOfMonth, endOfMonth, eachMonthOfInterval, parseISO, isWithinInterval, differenceInMonths } from 'date-fns';
import { cn } from '@/lib/utils';

type ProgramType = 'wellness' | 'sleep' | 'mental_performance' | 'bundle';

const programConfig: Record<ProgramType, { 
  label: string; 
  icon: React.ElementType; 
  color: string; 
  bgColor: string;
  chartColor: string;
}> = {
  wellness: { 
    label: 'Wellness', 
    icon: Crown, 
    color: 'text-amber-500', 
    bgColor: 'bg-amber-500/10',
    chartColor: 'hsl(45, 90%, 50%)',
  },
  sleep: { 
    label: 'Sleep Optimization', 
    icon: Moon, 
    color: 'text-indigo-500', 
    bgColor: 'bg-indigo-500/10',
    chartColor: 'hsl(240, 60%, 60%)',
  },
  mental_performance: { 
    label: 'Mental Performance', 
    icon: Brain, 
    color: 'text-emerald-500', 
    bgColor: 'bg-emerald-500/10',
    chartColor: 'hsl(160, 60%, 45%)',
  },
  bundle: { 
    label: 'Recovery Bundles', 
    icon: Package, 
    color: 'text-purple-500', 
    bgColor: 'bg-purple-500/10',
    chartColor: 'hsl(280, 60%, 55%)',
  },
};

type ChangeIndicatorProps = {
  current: number;
  previous: number;
  format?: 'number' | 'currency' | 'percent';
  inverted?: boolean; // true for metrics where lower is better (like churn)
};

function ChangeIndicator({ current, previous, inverted = false }: ChangeIndicatorProps) {
  if (previous === 0) return null;
  
  const change = ((current - previous) / previous) * 100;
  let isPositive = change > 0;
  if (inverted) isPositive = !isPositive;
  const isNeutral = change === 0;
  
  return (
    <div className={cn(
      "flex items-center gap-1 text-xs font-medium",
      isPositive && "text-green-600",
      !isPositive && !isNeutral && "text-red-600",
      isNeutral && "text-muted-foreground"
    )}>
      {change > 0 ? <ArrowUp className="h-3 w-3" /> : change < 0 ? <ArrowDown className="h-3 w-3" /> : <Minus className="h-3 w-3" />}
      <span>{Math.abs(change).toFixed(1)}%</span>
    </div>
  );
}

export function ProgramAnalytics() {
  const { memberships, loading: membershipsLoading } = useCRMMemberships();
  const { loading: clientsLoading } = useCRMClients();

  const loading = membershipsLoading || clientsLoading;

  // Calculate comprehensive stats for each program
  const programStats = useMemo(() => {
    const now = new Date();
    const thirtyDaysAgo = subMonths(now, 1);
    const sixtyDaysAgo = subMonths(now, 2);

    const calculateStatsForProgram = (programType: ProgramType) => {
      const programMemberships = memberships.filter(m => (m as any).program_type === programType);
      const activeMemberships = programMemberships.filter(m => m.status === 'active');
      
      // MRR
      const currentMRR = activeMemberships.reduce((sum, m) => sum + Number(m.monthly_price || 0), 0);
      
      // Churn - cancellations in last 30 days
      const recentCancellations = programMemberships.filter(m => {
        if (m.status !== 'cancelled') return false;
        const endDate = m.end_date ? parseISO(m.end_date) : null;
        return endDate && isWithinInterval(endDate, { start: thirtyDaysAgo, end: now });
      });
      
      const previousCancellations = programMemberships.filter(m => {
        if (m.status !== 'cancelled') return false;
        const endDate = m.end_date ? parseISO(m.end_date) : null;
        return endDate && isWithinInterval(endDate, { start: sixtyDaysAgo, end: thirtyDaysAgo });
      });
      
      const activeAtStartOfMonth = activeMemberships.length + recentCancellations.length;
      const monthlyChurnRate = activeAtStartOfMonth > 0 
        ? (recentCancellations.length / activeAtStartOfMonth) * 100 
        : 0;
      
      const prevActiveAtStartOfMonth = activeMemberships.length + previousCancellations.length + recentCancellations.length;
      const prevMonthlyChurnRate = prevActiveAtStartOfMonth > 0 
        ? (previousCancellations.length / prevActiveAtStartOfMonth) * 100 
        : 0;
      
      const lostMRR = recentCancellations.reduce((sum, m) => sum + Number(m.monthly_price || 0), 0);
      
      // Retention
      const totalChurned = programMemberships.filter(m => m.status === 'cancelled' || m.status === 'expired').length;
      const totalEverActive = activeMemberships.length + totalChurned;
      const retentionRate = totalEverActive > 0 ? (activeMemberships.length / totalEverActive) * 100 : 100;
      const monthlyRetentionRate = 100 - monthlyChurnRate;
      
      // Average tenure
      const tenures = activeMemberships.map(m => {
        const startDate = parseISO(m.start_date);
        return differenceInMonths(now, startDate);
      });
      const avgTenure = tenures.length > 0 ? tenures.reduce((a, b) => a + b, 0) / tenures.length : 0;
      
      // Members up for renewal in next 30 days
      const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
      const upForRenewal = activeMemberships.filter(m => {
        if (!m.renewal_date) return false;
        const renewalDate = parseISO(m.renewal_date);
        return isWithinInterval(renewalDate, { start: now, end: thirtyDaysFromNow });
      });
      
      // New members in last 30 days
      const newMembers = programMemberships.filter(m => {
        const startDate = parseISO(m.start_date);
        return isWithinInterval(startDate, { start: thirtyDaysAgo, end: now });
      });
      
      const prevNewMembers = programMemberships.filter(m => {
        const startDate = parseISO(m.start_date);
        return isWithinInterval(startDate, { start: sixtyDaysAgo, end: thirtyDaysAgo });
      });
      
      // Net MRR change
      const newMRR = newMembers.reduce((sum, m) => sum + Number(m.monthly_price || 0), 0);
      const netMRRChange = newMRR - lostMRR;
      
      return {
        programType,
        totalMembers: programMemberships.length,
        activeMembers: activeMemberships.length,
        currentMRR,
        monthlyChurnRate,
        prevMonthlyChurnRate,
        lostMRR,
        retentionRate,
        monthlyRetentionRate,
        avgTenure,
        upForRenewal: upForRenewal.length,
        upForRenewalMRR: upForRenewal.reduce((sum, m) => sum + Number(m.monthly_price || 0), 0),
        newMembers: newMembers.length,
        prevNewMembers: prevNewMembers.length,
        newMRR,
        netMRRChange,
        recentCancellations: recentCancellations.length,
        pausedMembers: programMemberships.filter(m => m.status === 'paused').length,
      };
    };

    return {
      wellness: calculateStatsForProgram('wellness'),
      sleep: calculateStatsForProgram('sleep'),
      mental_performance: calculateStatsForProgram('mental_performance'),
      bundle: calculateStatsForProgram('bundle'),
    };
  }, [memberships]);

  // MRR trend by program over last 6 months
  const mrrTrendData = useMemo(() => {
    const intervals = eachMonthOfInterval({
      start: startOfMonth(subMonths(new Date(), 5)),
      end: startOfMonth(new Date()),
    });

    return intervals.map(interval => {
      const intervalEnd = endOfMonth(interval);
      
      const getMRRForProgram = (programType: ProgramType) => {
        return memberships.filter(m => {
          const pType = (m as any).program_type || 'wellness';
          if (pType !== programType) return false;
          
          const startDate = parseISO(m.start_date);
          const endDate = m.end_date ? parseISO(m.end_date) : null;
          return startDate <= intervalEnd && (!endDate || endDate >= interval);
        }).reduce((sum, m) => sum + Number(m.monthly_price || 0), 0);
      };

      return {
        period: format(interval, 'MMM yyyy'),
        wellness: getMRRForProgram('wellness'),
        sleep: getMRRForProgram('sleep'),
        mental_performance: getMRRForProgram('mental_performance'),
        bundle: getMRRForProgram('bundle'),
      };
    });
  }, [memberships]);

  // Member count trend by program
  const memberTrendData = useMemo(() => {
    const intervals = eachMonthOfInterval({
      start: startOfMonth(subMonths(new Date(), 5)),
      end: startOfMonth(new Date()),
    });

    return intervals.map(interval => {
      const intervalEnd = endOfMonth(interval);
      
      const getMembersForProgram = (programType: ProgramType) => {
        return memberships.filter(m => {
          const pType = (m as any).program_type || 'wellness';
          if (pType !== programType) return false;
          
          const startDate = parseISO(m.start_date);
          const endDate = m.end_date ? parseISO(m.end_date) : null;
          return startDate <= intervalEnd && (!endDate || endDate >= interval);
        }).length;
      };

      return {
        period: format(interval, 'MMM yyyy'),
        wellness: getMembersForProgram('wellness'),
        sleep: getMembersForProgram('sleep'),
        mental_performance: getMembersForProgram('mental_performance'),
        bundle: getMembersForProgram('bundle'),
      };
    });
  }, [memberships]);

  // Churn trend by program
  const churnTrendData = useMemo(() => {
    const intervals = eachMonthOfInterval({
      start: startOfMonth(subMonths(new Date(), 5)),
      end: startOfMonth(new Date()),
    });

    return intervals.map(interval => {
      const intervalStart = startOfMonth(interval);
      const intervalEnd = endOfMonth(interval);
      
      const getChurnForProgram = (programType: ProgramType) => {
        const cancellations = memberships.filter(m => {
          const pType = (m as any).program_type || 'wellness';
          if (pType !== programType) return false;
          if (m.status !== 'cancelled' && m.status !== 'expired') return false;
          const endDate = m.end_date ? parseISO(m.end_date) : null;
          return endDate && isWithinInterval(endDate, { start: intervalStart, end: intervalEnd });
        });

        const activeAtStart = memberships.filter(m => {
          const pType = (m as any).program_type || 'wellness';
          if (pType !== programType) return false;
          const startDate = parseISO(m.start_date);
          const endDate = m.end_date ? parseISO(m.end_date) : null;
          return startDate <= intervalStart && (!endDate || endDate >= intervalStart);
        });

        return activeAtStart.length > 0 
          ? (cancellations.length / activeAtStart.length) * 100 
          : 0;
      };

      return {
        period: format(interval, 'MMM'),
        wellness: getChurnForProgram('wellness'),
        sleep: getChurnForProgram('sleep'),
        mental_performance: getChurnForProgram('mental_performance'),
        bundle: getChurnForProgram('bundle'),
      };
    });
  }, [memberships]);

  // Program distribution for pie chart
  const programDistribution = useMemo(() => {
    return Object.entries(programStats).map(([key, stats]) => ({
      name: programConfig[key as ProgramType].label,
      value: stats.currentMRR,
      members: stats.activeMembers,
      color: programConfig[key as ProgramType].chartColor,
    })).filter(d => d.value > 0 || d.members > 0);
  }, [programStats]);

  // Total stats across all programs
  const totalStats = useMemo(() => {
    const all = Object.values(programStats);
    return {
      totalMRR: all.reduce((sum, s) => sum + s.currentMRR, 0),
      totalActive: all.reduce((sum, s) => sum + s.activeMembers, 0),
      totalNew: all.reduce((sum, s) => sum + s.newMembers, 0),
      avgChurn: all.length > 0 ? all.reduce((sum, s) => sum + s.monthlyChurnRate, 0) / all.length : 0,
      avgRetention: all.length > 0 ? all.reduce((sum, s) => sum + s.monthlyRetentionRate, 0) / all.length : 0,
      netMRRChange: all.reduce((sum, s) => sum + s.netMRRChange, 0),
    };
  }, [programStats]);

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-64" />
        <div className="grid grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
        <Skeleton className="h-[300px]" />
      </div>
    );
  }

  const renderProgramCard = (programType: ProgramType) => {
    const stats = programStats[programType];
    const config = programConfig[programType];
    const Icon = config.icon;

    return (
      <Card key={programType} className={cn("border-l-4", `border-l-${config.color.replace('text-', '')}`)}>
        <CardContent className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className={cn("p-2 rounded-lg", config.bgColor)}>
              <Icon className={cn("h-5 w-5", config.color)} />
            </div>
            <div>
              <h3 className="font-semibold">{config.label}</h3>
              <p className="text-xs text-muted-foreground">{stats.activeMembers} active members</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-muted-foreground">MRR</p>
              <p className="text-xl font-bold">${stats.currentMRR.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Churn Rate</p>
              <div className="flex items-center gap-2">
                <p className={cn("text-xl font-bold", stats.monthlyChurnRate > 5 ? "text-red-500" : "text-green-500")}>
                  {stats.monthlyChurnRate.toFixed(1)}%
                </p>
                <ChangeIndicator 
                  current={stats.monthlyChurnRate} 
                  previous={stats.prevMonthlyChurnRate} 
                  inverted 
                />
              </div>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Retention</p>
              <p className="text-lg font-semibold text-green-500">{stats.monthlyRetentionRate.toFixed(0)}%</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Avg Tenure</p>
              <p className="text-lg font-semibold">{stats.avgTenure.toFixed(1)} mo</p>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">New this month</span>
              <div className="flex items-center gap-2">
                <span className="font-medium text-green-500">+{stats.newMembers}</span>
                <ChangeIndicator current={stats.newMembers} previous={stats.prevNewMembers} />
              </div>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Lost this month</span>
              <span className="font-medium text-red-500">-{stats.recentCancellations}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Net MRR Change</span>
              <span className={cn("font-medium", stats.netMRRChange >= 0 ? "text-green-500" : "text-red-500")}>
                {stats.netMRRChange >= 0 ? '+' : ''}${stats.netMRRChange.toLocaleString()}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Program Analytics</h1>
        <p className="text-muted-foreground">Detailed trends, churn rates, and retention metrics by program type</p>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <Card className="bg-gradient-to-br from-primary/10 to-transparent border-primary/20">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Total MRR</p>
            <p className="text-2xl font-bold text-primary">${totalStats.totalMRR.toLocaleString()}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Active Members</p>
            <p className="text-2xl font-bold">{totalStats.totalActive}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">New This Month</p>
            <p className="text-2xl font-bold text-green-500">+{totalStats.totalNew}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Avg Churn Rate</p>
            <p className={cn("text-2xl font-bold", totalStats.avgChurn > 5 ? "text-red-500" : "text-green-500")}>
              {totalStats.avgChurn.toFixed(1)}%
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Avg Retention</p>
            <p className="text-2xl font-bold text-green-500">{totalStats.avgRetention.toFixed(0)}%</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Net MRR Change</p>
            <p className={cn("text-2xl font-bold", totalStats.netMRRChange >= 0 ? "text-green-500" : "text-red-500")}>
              {totalStats.netMRRChange >= 0 ? '+' : ''}${totalStats.netMRRChange.toLocaleString()}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Program Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {(['wellness', 'sleep', 'mental_performance', 'bundle'] as ProgramType[]).map(renderProgramCard)}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* MRR Trend by Program */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-primary" />
              MRR Trend by Program
            </CardTitle>
            <p className="text-xs text-muted-foreground">Monthly recurring revenue over the last 6 months</p>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={mrrTrendData}>
                  <defs>
                    {Object.entries(programConfig).map(([key, config]) => (
                      <linearGradient key={key} id={`color${key}`} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={config.chartColor} stopOpacity={0.3} />
                        <stop offset="95%" stopColor={config.chartColor} stopOpacity={0} />
                      </linearGradient>
                    ))}
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="period" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} />
                  <YAxis tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} tickFormatter={(value) => `$${value}`} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                    }}
                    formatter={(value: number, name: string) => [`$${value.toLocaleString()}`, programConfig[name as ProgramType]?.label || name]}
                  />
                  <Legend formatter={(value) => programConfig[value as ProgramType]?.label || value} />
                  {Object.entries(programConfig).map(([key, config]) => (
                    <Area
                      key={key}
                      type="monotone"
                      dataKey={key}
                      stroke={config.chartColor}
                      fill={`url(#color${key})`}
                      strokeWidth={2}
                    />
                  ))}
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Member Count Trend */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-blue-500" />
              Member Count Trend
            </CardTitle>
            <p className="text-xs text-muted-foreground">Active members per program over time</p>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={memberTrendData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="period" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} />
                  <YAxis tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                    }}
                    formatter={(value: number, name: string) => [value, programConfig[name as ProgramType]?.label || name]}
                  />
                  <Legend formatter={(value) => programConfig[value as ProgramType]?.label || value} />
                  {Object.entries(programConfig).map(([key, config]) => (
                    <Line
                      key={key}
                      type="monotone"
                      dataKey={key}
                      stroke={config.chartColor}
                      strokeWidth={2}
                      dot={{ fill: config.chartColor }}
                    />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Churn Rate Comparison */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserMinus className="h-5 w-5 text-red-500" />
              Monthly Churn Rate by Program
            </CardTitle>
            <p className="text-xs text-muted-foreground">Percentage of members churning each month</p>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={churnTrendData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="period" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} />
                  <YAxis tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} tickFormatter={(value) => `${value}%`} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                    }}
                    formatter={(value: number, name: string) => [`${value.toFixed(1)}%`, programConfig[name as ProgramType]?.label || name]}
                  />
                  <Legend formatter={(value) => programConfig[value as ProgramType]?.label || value} />
                  {Object.entries(programConfig).map(([key, config]) => (
                    <Bar
                      key={key}
                      dataKey={key}
                      fill={config.chartColor}
                      radius={[4, 4, 0, 0]}
                    />
                  ))}
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Program Distribution Pie */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <RefreshCw className="h-5 w-5" />
              MRR Distribution by Program
            </CardTitle>
            <p className="text-xs text-muted-foreground">Share of recurring revenue per program</p>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              {programDistribution.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={programDistribution}
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      innerRadius={50}
                      dataKey="value"
                      label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                      labelLine={true}
                    >
                      {programDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px',
                      }}
                      formatter={(value: number, name: string, props: any) => [
                        `$${value.toLocaleString()} (${props.payload.members} members)`,
                        'MRR'
                      ]}
                    />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-muted-foreground">
                  No active memberships to display
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Program Comparison Table */}
      <Card>
        <CardHeader>
          <CardTitle>Program Comparison</CardTitle>
          <p className="text-xs text-muted-foreground">Side-by-side metrics for all programs</p>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-3 font-medium text-muted-foreground">Metric</th>
                  {Object.entries(programConfig).map(([key, config]) => (
                    <th key={key} className="text-right p-3 font-medium">
                      <div className="flex items-center justify-end gap-2">
                        <config.icon className={cn("h-4 w-4", config.color)} />
                        <span>{config.label}</span>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr className="border-b">
                  <td className="p-3 text-muted-foreground">Active Members</td>
                  {Object.keys(programConfig).map(key => (
                    <td key={key} className="p-3 text-right font-medium">
                      {programStats[key as ProgramType].activeMembers}
                    </td>
                  ))}
                </tr>
                <tr className="border-b">
                  <td className="p-3 text-muted-foreground">Monthly MRR</td>
                  {Object.keys(programConfig).map(key => (
                    <td key={key} className="p-3 text-right font-medium">
                      ${programStats[key as ProgramType].currentMRR.toLocaleString()}
                    </td>
                  ))}
                </tr>
                <tr className="border-b">
                  <td className="p-3 text-muted-foreground">Monthly Churn Rate</td>
                  {Object.keys(programConfig).map(key => (
                    <td key={key} className="p-3 text-right">
                      <span className={cn(
                        "font-medium",
                        programStats[key as ProgramType].monthlyChurnRate > 5 ? "text-red-500" : "text-green-500"
                      )}>
                        {programStats[key as ProgramType].monthlyChurnRate.toFixed(1)}%
                      </span>
                    </td>
                  ))}
                </tr>
                <tr className="border-b">
                  <td className="p-3 text-muted-foreground">Retention Rate</td>
                  {Object.keys(programConfig).map(key => (
                    <td key={key} className="p-3 text-right font-medium text-green-500">
                      {programStats[key as ProgramType].monthlyRetentionRate.toFixed(0)}%
                    </td>
                  ))}
                </tr>
                <tr className="border-b">
                  <td className="p-3 text-muted-foreground">Avg Tenure</td>
                  {Object.keys(programConfig).map(key => (
                    <td key={key} className="p-3 text-right font-medium">
                      {programStats[key as ProgramType].avgTenure.toFixed(1)} months
                    </td>
                  ))}
                </tr>
                <tr className="border-b">
                  <td className="p-3 text-muted-foreground">Up for Renewal</td>
                  {Object.keys(programConfig).map(key => (
                    <td key={key} className="p-3 text-right">
                      <span className="font-medium">{programStats[key as ProgramType].upForRenewal}</span>
                      <span className="text-xs text-muted-foreground ml-1">
                        (${programStats[key as ProgramType].upForRenewalMRR.toLocaleString()})
                      </span>
                    </td>
                  ))}
                </tr>
                <tr className="border-b">
                  <td className="p-3 text-muted-foreground">Net MRR Change</td>
                  {Object.keys(programConfig).map(key => (
                    <td key={key} className="p-3 text-right">
                      <span className={cn(
                        "font-medium",
                        programStats[key as ProgramType].netMRRChange >= 0 ? "text-green-500" : "text-red-500"
                      )}>
                        {programStats[key as ProgramType].netMRRChange >= 0 ? '+' : ''}
                        ${programStats[key as ProgramType].netMRRChange.toLocaleString()}
                      </span>
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="p-3 text-muted-foreground">Paused Members</td>
                  {Object.keys(programConfig).map(key => (
                    <td key={key} className="p-3 text-right font-medium text-amber-500">
                      {programStats[key as ProgramType].pausedMembers}
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}