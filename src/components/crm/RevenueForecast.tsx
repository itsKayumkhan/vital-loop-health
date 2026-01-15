import { useMemo, useState } from 'react';
import { TrendingUp, DollarSign, Calendar, Target, ArrowUp, ArrowDown, Crown, Pill, FlaskConical, Wrench } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useCRMMemberships, useCRMPurchases } from '@/hooks/useCRM';
import { Skeleton } from '@/components/ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ComposedChart,
} from 'recharts';
import { format, addMonths, subMonths, parseISO, startOfMonth, differenceInMonths } from 'date-fns';

type ForecastPeriod = '3' | '6' | '12';

export function RevenueForecast() {
  const { memberships, loading: membershipsLoading } = useCRMMemberships();
  const { purchases, loading: purchasesLoading } = useCRMPurchases();
  const [forecastPeriod, setForecastPeriod] = useState<ForecastPeriod>('6');
  
  const loading = membershipsLoading || purchasesLoading;

  // Calculate historical revenue by category per month
  const historicalData = useMemo(() => {
    const now = new Date();
    const monthsBack = 12;
    const data: Record<string, { membership: number; supplement: number; lab_testing: number; service: number }> = {};
    
    // Initialize months
    for (let i = monthsBack - 1; i >= 0; i--) {
      const month = startOfMonth(subMonths(now, i));
      const key = format(month, 'yyyy-MM');
      data[key] = { membership: 0, supplement: 0, lab_testing: 0, service: 0 };
    }
    
    // Aggregate purchases
    purchases.forEach(p => {
      const month = format(parseISO(p.purchased_at), 'yyyy-MM');
      if (data[month]) {
        const amount = Number(p.amount);
        if (p.purchase_type === 'subscription') {
          data[month].membership += amount;
        } else if (p.purchase_type === 'supplement') {
          data[month].supplement += amount;
        } else if (p.purchase_type === 'lab_testing') {
          data[month].lab_testing += amount;
        } else {
          data[month].service += amount;
        }
      }
    });
    
    return Object.entries(data).map(([month, values]) => ({
      month,
      label: format(parseISO(month + '-01'), 'MMM yyyy'),
      ...values,
      total: values.membership + values.supplement + values.lab_testing + values.service,
    }));
  }, [purchases]);

  // Calculate MRR from active memberships
  const currentMRR = useMemo(() => {
    return memberships
      .filter(m => m.status === 'active')
      .reduce((sum, m) => sum + Number(m.monthly_price || 0), 0);
  }, [memberships]);

  // Calculate growth rates for each category
  const growthRates = useMemo(() => {
    if (historicalData.length < 3) {
      return { membership: 0.02, supplement: 0.03, lab_testing: 0.05, service: 0.02 };
    }
    
    const calculateGrowth = (category: 'membership' | 'supplement' | 'lab_testing' | 'service') => {
      const recentMonths = historicalData.slice(-6);
      const validMonths = recentMonths.filter(m => m[category] > 0);
      
      if (validMonths.length < 2) return 0.02; // Default 2% growth
      
      const firstHalf = validMonths.slice(0, Math.floor(validMonths.length / 2));
      const secondHalf = validMonths.slice(Math.floor(validMonths.length / 2));
      
      const firstAvg = firstHalf.reduce((sum, m) => sum + m[category], 0) / firstHalf.length;
      const secondAvg = secondHalf.reduce((sum, m) => sum + m[category], 0) / secondHalf.length;
      
      if (firstAvg === 0) return 0.02;
      
      const growth = (secondAvg - firstAvg) / firstAvg / (validMonths.length / 2);
      return Math.max(-0.1, Math.min(0.2, growth)); // Clamp between -10% and 20%
    };
    
    return {
      membership: calculateGrowth('membership'),
      supplement: calculateGrowth('supplement'),
      lab_testing: calculateGrowth('lab_testing'),
      service: calculateGrowth('service'),
    };
  }, [historicalData]);

  // Generate forecast data
  const forecastData = useMemo(() => {
    const now = new Date();
    const periods = parseInt(forecastPeriod);
    const lastHistorical = historicalData[historicalData.length - 1] || {
      membership: currentMRR,
      supplement: 0,
      lab_testing: 0,
      service: 0,
    };
    
    const forecast = [];
    let projectedMembership = lastHistorical.membership || currentMRR;
    let projectedSupplement = lastHistorical.supplement;
    let projectedLabTesting = lastHistorical.lab_testing;
    let projectedService = lastHistorical.service;
    
    for (let i = 1; i <= periods; i++) {
      const month = addMonths(now, i);
      
      // Apply growth rates with some variance
      projectedMembership *= (1 + growthRates.membership);
      projectedSupplement *= (1 + growthRates.supplement);
      projectedLabTesting *= (1 + growthRates.lab_testing);
      projectedService *= (1 + growthRates.service);
      
      // For membership, use MRR as base if historical is 0
      if (projectedMembership < currentMRR * 0.5) {
        projectedMembership = currentMRR * (1 + growthRates.membership * i);
      }
      
      forecast.push({
        month: format(month, 'yyyy-MM'),
        label: format(month, 'MMM yyyy'),
        membership: Math.round(projectedMembership),
        supplement: Math.round(projectedSupplement),
        lab_testing: Math.round(projectedLabTesting),
        service: Math.round(projectedService),
        total: Math.round(projectedMembership + projectedSupplement + projectedLabTesting + projectedService),
        isForecast: true,
      });
    }
    
    return forecast;
  }, [forecastPeriod, historicalData, currentMRR, growthRates]);

  // Combined data for chart
  const combinedData = useMemo(() => {
    const historical = historicalData.slice(-6).map(d => ({ ...d, isForecast: false }));
    return [...historical, ...forecastData];
  }, [historicalData, forecastData]);

  // Summary statistics
  const summaryStats = useMemo(() => {
    const lastForecast = forecastData[forecastData.length - 1] || { total: 0, membership: 0, supplement: 0, lab_testing: 0, service: 0 };
    const currentTotal = historicalData[historicalData.length - 1]?.total || 0;
    
    const totalForecastedRevenue = forecastData.reduce((sum, f) => sum + f.total, 0);
    
    return {
      projectedMonthlyEnd: lastForecast.total,
      projectedGrowth: currentTotal > 0 ? ((lastForecast.total - currentTotal) / currentTotal) * 100 : 0,
      totalForecastedRevenue,
      membershipForecast: forecastData.reduce((sum, f) => sum + f.membership, 0),
      supplementForecast: forecastData.reduce((sum, f) => sum + f.supplement, 0),
      labTestingForecast: forecastData.reduce((sum, f) => sum + f.lab_testing, 0),
      serviceForecast: forecastData.reduce((sum, f) => sum + f.service, 0),
    };
  }, [forecastData, historicalData]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <Skeleton className="h-20" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Revenue Forecast</h1>
          <p className="text-muted-foreground">Projected revenue across all streams</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Forecast period:</span>
          <Select value={forecastPeriod} onValueChange={(v) => setForecastPeriod(v as ForecastPeriod)}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="3">3 months</SelectItem>
              <SelectItem value="6">6 months</SelectItem>
              <SelectItem value="12">12 months</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Forecasted Revenue</p>
                <p className="text-3xl font-bold text-primary">
                  ${summaryStats.totalForecastedRevenue.toLocaleString()}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Next {forecastPeriod} months
                </p>
              </div>
              <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                <Target className="h-6 w-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Projected Monthly (End)</p>
                <p className="text-3xl font-bold">${summaryStats.projectedMonthlyEnd.toLocaleString()}</p>
                <div className="flex items-center gap-1 mt-1">
                  {summaryStats.projectedGrowth >= 0 ? (
                    <ArrowUp className="h-3 w-3 text-green-500" />
                  ) : (
                    <ArrowDown className="h-3 w-3 text-red-500" />
                  )}
                  <span className={`text-xs ${summaryStats.projectedGrowth >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                    {Math.abs(summaryStats.projectedGrowth).toFixed(1)}% growth
                  </span>
                </div>
              </div>
              <TrendingUp className="h-10 w-10 text-green-500 opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Current MRR</p>
                <p className="text-3xl font-bold">${currentMRR.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {memberships.filter(m => m.status === 'active').length} active members
                </p>
              </div>
              <Crown className="h-10 w-10 text-amber-500 opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Avg Monthly Growth</p>
                <p className="text-3xl font-bold">
                  {((growthRates.membership + growthRates.supplement + growthRates.lab_testing + growthRates.service) / 4 * 100).toFixed(1)}%
                </p>
                <p className="text-xs text-muted-foreground mt-1">Based on historical data</p>
              </div>
              <Calendar className="h-10 w-10 text-blue-500 opacity-50" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Revenue Stream Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                <Crown className="h-5 w-5 text-blue-500" />
              </div>
              <div className="flex-1">
                <p className="text-xs text-muted-foreground">Membership Forecast</p>
                <p className="text-lg font-bold">${summaryStats.membershipForecast.toLocaleString()}</p>
                <div className="flex items-center gap-1">
                  {growthRates.membership >= 0 ? (
                    <ArrowUp className="h-3 w-3 text-green-500" />
                  ) : (
                    <ArrowDown className="h-3 w-3 text-red-500" />
                  )}
                  <span className="text-xs text-muted-foreground">
                    {(growthRates.membership * 100).toFixed(1)}%/mo
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-purple-500/10 flex items-center justify-center">
                <Pill className="h-5 w-5 text-purple-500" />
              </div>
              <div className="flex-1">
                <p className="text-xs text-muted-foreground">Supplements Forecast</p>
                <p className="text-lg font-bold">${summaryStats.supplementForecast.toLocaleString()}</p>
                <div className="flex items-center gap-1">
                  {growthRates.supplement >= 0 ? (
                    <ArrowUp className="h-3 w-3 text-green-500" />
                  ) : (
                    <ArrowDown className="h-3 w-3 text-red-500" />
                  )}
                  <span className="text-xs text-muted-foreground">
                    {(growthRates.supplement * 100).toFixed(1)}%/mo
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-cyan-500/10 flex items-center justify-center">
                <FlaskConical className="h-5 w-5 text-cyan-500" />
              </div>
              <div className="flex-1">
                <p className="text-xs text-muted-foreground">Lab Testing Forecast</p>
                <p className="text-lg font-bold">${summaryStats.labTestingForecast.toLocaleString()}</p>
                <div className="flex items-center gap-1">
                  {growthRates.lab_testing >= 0 ? (
                    <ArrowUp className="h-3 w-3 text-green-500" />
                  ) : (
                    <ArrowDown className="h-3 w-3 text-red-500" />
                  )}
                  <span className="text-xs text-muted-foreground">
                    {(growthRates.lab_testing * 100).toFixed(1)}%/mo
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-amber-500/10 flex items-center justify-center">
                <Wrench className="h-5 w-5 text-amber-500" />
              </div>
              <div className="flex-1">
                <p className="text-xs text-muted-foreground">Services Forecast</p>
                <p className="text-lg font-bold">${summaryStats.serviceForecast.toLocaleString()}</p>
                <div className="flex items-center gap-1">
                  {growthRates.service >= 0 ? (
                    <ArrowUp className="h-3 w-3 text-green-500" />
                  ) : (
                    <ArrowDown className="h-3 w-3 text-red-500" />
                  )}
                  <span className="text-xs text-muted-foreground">
                    {(growthRates.service * 100).toFixed(1)}%/mo
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Forecast Charts */}
      <Tabs defaultValue="combined" className="space-y-4">
        <TabsList>
          <TabsTrigger value="combined">Combined View</TabsTrigger>
          <TabsTrigger value="membership">Membership</TabsTrigger>
          <TabsTrigger value="supplements">Supplements</TabsTrigger>
          <TabsTrigger value="lab_testing">Lab Testing</TabsTrigger>
          <TabsTrigger value="services">Services</TabsTrigger>
        </TabsList>

        <TabsContent value="combined">
          <Card>
            <CardHeader>
              <CardTitle>Revenue Forecast - All Streams</CardTitle>
              <CardDescription>Historical data and projected revenue for all revenue streams</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={combinedData}>
                    <defs>
                      <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="label" className="text-xs" tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                    <YAxis className="text-xs" tick={{ fill: 'hsl(var(--muted-foreground))' }} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px',
                      }}
                      formatter={(value: number, name: string) => [`$${value.toLocaleString()}`, name]}
                    />
                    <Legend />
                    <Area
                      type="monotone"
                      dataKey="total"
                      name="Total Revenue"
                      stroke="hsl(var(--primary))"
                      fill="url(#colorTotal)"
                      strokeWidth={2}
                    />
                    <Bar dataKey="membership" name="Membership" stackId="a" fill="hsl(220, 70%, 50%)" />
                    <Bar dataKey="supplement" name="Supplements" stackId="a" fill="hsl(280, 70%, 50%)" />
                    <Bar dataKey="lab_testing" name="Lab Testing" stackId="a" fill="hsl(180, 70%, 45%)" />
                    <Bar dataKey="service" name="Services" stackId="a" fill="hsl(45, 90%, 50%)" />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-4 flex items-center justify-center gap-6 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-0.5 bg-muted-foreground" />
                  <span>Historical</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-0.5 bg-muted-foreground border-dashed border-t-2 border-muted-foreground" style={{ borderStyle: 'dashed' }} />
                  <span>Forecast</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="membership">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Crown className="h-5 w-5 text-blue-500" />
                Membership Revenue Forecast
              </CardTitle>
              <CardDescription>Recurring membership revenue projections based on current MRR and growth trends</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[350px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={combinedData}>
                    <defs>
                      <linearGradient id="colorMembership" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(220, 70%, 50%)" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="hsl(220, 70%, 50%)" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="label" className="text-xs" tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                    <YAxis className="text-xs" tick={{ fill: 'hsl(var(--muted-foreground))' }} tickFormatter={(v) => `$${v.toLocaleString()}`} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px',
                      }}
                      formatter={(value: number) => [`$${value.toLocaleString()}`, 'Membership Revenue']}
                    />
                    <Area
                      type="monotone"
                      dataKey="membership"
                      stroke="hsl(220, 70%, 50%)"
                      fill="url(#colorMembership)"
                      strokeWidth={2}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="supplements">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Pill className="h-5 w-5 text-purple-500" />
                Supplements Revenue Forecast
              </CardTitle>
              <CardDescription>Product sales projections based on historical purchase patterns</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[350px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={combinedData}>
                    <defs>
                      <linearGradient id="colorSupplement" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(280, 70%, 50%)" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="hsl(280, 70%, 50%)" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="label" className="text-xs" tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                    <YAxis className="text-xs" tick={{ fill: 'hsl(var(--muted-foreground))' }} tickFormatter={(v) => `$${v.toLocaleString()}`} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px',
                      }}
                      formatter={(value: number) => [`$${value.toLocaleString()}`, 'Supplements Revenue']}
                    />
                    <Area
                      type="monotone"
                      dataKey="supplement"
                      stroke="hsl(280, 70%, 50%)"
                      fill="url(#colorSupplement)"
                      strokeWidth={2}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="lab_testing">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FlaskConical className="h-5 w-5 text-cyan-500" />
                Lab Testing Revenue Forecast
              </CardTitle>
              <CardDescription>Diagnostic and testing services revenue projections</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[350px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={combinedData}>
                    <defs>
                      <linearGradient id="colorLabTesting" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(180, 70%, 45%)" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="hsl(180, 70%, 45%)" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="label" className="text-xs" tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                    <YAxis className="text-xs" tick={{ fill: 'hsl(var(--muted-foreground))' }} tickFormatter={(v) => `$${v.toLocaleString()}`} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px',
                      }}
                      formatter={(value: number) => [`$${value.toLocaleString()}`, 'Lab Testing Revenue']}
                    />
                    <Area
                      type="monotone"
                      dataKey="lab_testing"
                      stroke="hsl(180, 70%, 45%)"
                      fill="url(#colorLabTesting)"
                      strokeWidth={2}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="services">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wrench className="h-5 w-5 text-amber-500" />
                Services Revenue Forecast
              </CardTitle>
              <CardDescription>Coaching and consultation services revenue projections</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[350px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={combinedData}>
                    <defs>
                      <linearGradient id="colorService" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(45, 90%, 50%)" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="hsl(45, 90%, 50%)" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="label" className="text-xs" tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                    <YAxis className="text-xs" tick={{ fill: 'hsl(var(--muted-foreground))' }} tickFormatter={(v) => `$${v.toLocaleString()}`} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px',
                      }}
                      formatter={(value: number) => [`$${value.toLocaleString()}`, 'Services Revenue']}
                    />
                    <Area
                      type="monotone"
                      dataKey="service"
                      stroke="hsl(45, 90%, 50%)"
                      fill="url(#colorService)"
                      strokeWidth={2}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Assumptions Note */}
      <Card className="bg-muted/30">
        <CardContent className="p-4">
          <p className="text-sm text-muted-foreground">
            <strong>Note:</strong> Forecasts are based on historical trends and current MRR. Actual results may vary based on market conditions, 
            customer acquisition, retention rates, and other factors. Growth rates are calculated from the last 6 months of data.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
