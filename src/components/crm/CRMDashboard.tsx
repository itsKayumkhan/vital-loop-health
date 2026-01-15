import { useMemo, useState, useCallback, useEffect } from 'react';
import { Users, Crown, TrendingUp, UserPlus, DollarSign, ArrowUp, ArrowDown, Minus, RefreshCw, UserMinus, AlertTriangle, Clock, CheckCircle, Calendar, Brain, Moon, Package } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useCRMClients, useCRMMemberships, useCRMPurchases } from '@/hooks/useCRM';
import { Skeleton } from '@/components/ui/skeleton';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
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
import { format, subMonths, startOfMonth, endOfMonth, eachMonthOfInterval, eachWeekOfInterval, eachDayOfInterval, parseISO, isWithinInterval, differenceInDays, differenceInMonths } from 'date-fns';
import { DateRangeFilter, DateRange, ComparisonRange } from './DateRangeFilter';
import { ChartDrillDown, DrillDownData, DrillDownType } from './ChartDrillDown';
import { SavedViewsManager } from './SavedViewsManager';
import { RealTimeRefresh } from './RealTimeRefresh';
import { useSavedViews, SavedViewConfig } from '@/hooks/useSavedViews';
import { cn } from '@/lib/utils';


type ChangeIndicatorProps = {
  current: number;
  previous: number;
  format?: 'number' | 'currency' | 'percent';
};

function ChangeIndicator({ current, previous, format: formatType = 'number' }: ChangeIndicatorProps) {
  if (previous === 0) return null;
  
  const change = ((current - previous) / previous) * 100;
  const isPositive = change > 0;
  const isNeutral = change === 0;
  
  return (
    <div className={cn(
      "flex items-center gap-1 text-xs font-medium",
      isPositive && "text-green-600",
      !isPositive && !isNeutral && "text-red-600",
      isNeutral && "text-muted-foreground"
    )}>
      {isPositive ? <ArrowUp className="h-3 w-3" /> : isNeutral ? <Minus className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />}
      <span>{Math.abs(change).toFixed(1)}%</span>
      <span className="text-muted-foreground">vs prev</span>
    </div>
  );
}

export function CRMDashboard() {
  // Realtime state
  const [realtimeEnabled, setRealtimeEnabled] = useState(false);
  const [lastRealtimeUpdate, setLastRealtimeUpdate] = useState<Date | null>(null);

  const handleRealtimeUpdate = useCallback(() => {
    setLastRealtimeUpdate(new Date());
  }, []);

  const { clients, loading: clientsLoading, fetchClients } = useCRMClients({ 
    enabled: realtimeEnabled, 
    onUpdate: handleRealtimeUpdate 
  });
  const { memberships, loading: membershipsLoading, fetchMemberships } = useCRMMemberships(
    undefined,
    { enabled: realtimeEnabled, onUpdate: handleRealtimeUpdate }
  );
  const { purchases, loading: purchasesLoading, fetchPurchases } = useCRMPurchases(
    undefined,
    { enabled: realtimeEnabled, onUpdate: handleRealtimeUpdate }
  );
  const { getDefaultView } = useSavedViews();

  const loading = clientsLoading || membershipsLoading || purchasesLoading;

  // Combined refresh function
  const handleRefreshAll = useCallback(async () => {
    await Promise.all([
      fetchClients(),
      fetchMemberships(),
      fetchPurchases(),
    ]);
  }, [fetchClients, fetchMemberships, fetchPurchases]);

  // Date range state
  const [dateRange, setDateRange] = useState<DateRange>(() => ({
    from: subMonths(new Date(), 6),
    to: new Date(),
  }));

  // Comparison state
  const [comparisonEnabled, setComparisonEnabled] = useState(false);
  const [comparisonRange, setComparisonRange] = useState<ComparisonRange>(null);

  // Drill-down state
  const [drillDownOpen, setDrillDownOpen] = useState(false);
  const [drillDownData, setDrillDownData] = useState<DrillDownData | null>(null);

  // Load default view on mount
  useEffect(() => {
    const defaultView = getDefaultView();
    if (defaultView) {
      handleLoadView(defaultView.config);
    }
  }, []);

  // Handle loading a saved view
  const handleLoadView = useCallback((config: SavedViewConfig) => {
    setDateRange({
      from: new Date(config.dateRange.from),
      to: new Date(config.dateRange.to),
    });
    setComparisonEnabled(config.comparisonEnabled);
    if (config.comparisonRange) {
      setComparisonRange({
        from: new Date(config.comparisonRange.from),
        to: new Date(config.comparisonRange.to),
      });
    } else {
      setComparisonRange(null);
    }
  }, []);

  // Filter clients, memberships, and purchases by date range
  const filteredClients = useMemo(() => {
    return clients.filter(c => {
      const createdAt = parseISO(c.created_at);
      return isWithinInterval(createdAt, { start: dateRange.from, end: dateRange.to });
    });
  }, [clients, dateRange]);

  const filteredPurchases = useMemo(() => {
    return purchases.filter(p => {
      const purchaseDate = parseISO(p.purchased_at);
      return isWithinInterval(purchaseDate, { start: dateRange.from, end: dateRange.to });
    });
  }, [purchases, dateRange]);

  // Comparison filtered data
  const comparisonClients = useMemo(() => {
    if (!comparisonRange) return [];
    return clients.filter(c => {
      const createdAt = parseISO(c.created_at);
      return isWithinInterval(createdAt, { start: comparisonRange.from, end: comparisonRange.to });
    });
  }, [clients, comparisonRange]);

  const comparisonPurchases = useMemo(() => {
    if (!comparisonRange) return [];
    return purchases.filter(p => {
      const purchaseDate = parseISO(p.purchased_at);
      return isWithinInterval(purchaseDate, { start: comparisonRange.from, end: comparisonRange.to });
    });
  }, [purchases, comparisonRange]);

  // Calculate MRR from active memberships
  const mrrStats = useMemo(() => {
    const activeMemberships = memberships.filter(m => m.status === 'active');
    const currentMRR = activeMemberships.reduce((sum, m) => sum + Number(m.monthly_price || 0), 0);
    
    // Calculate MRR by tier
    const mrrByTier = {
      free: 0,
      essential: 0,
      premium: 0,
      elite: 0,
    };
    
    activeMemberships.forEach(m => {
      if (m.tier in mrrByTier) {
        mrrByTier[m.tier as keyof typeof mrrByTier] += Number(m.monthly_price || 0);
      }
    });

    // Calculate MRR by program type
    const mrrByProgram = {
      wellness: 0,
      sleep: 0,
      mental_performance: 0,
      bundle: 0,
    };

    const membersByProgram = {
      wellness: 0,
      sleep: 0,
      mental_performance: 0,
      bundle: 0,
    };

    activeMemberships.forEach(m => {
      const programType = (m as any).program_type || 'wellness';
      if (programType in mrrByProgram) {
        mrrByProgram[programType as keyof typeof mrrByProgram] += Number(m.monthly_price || 0);
        membersByProgram[programType as keyof typeof membersByProgram]++;
      }
    });
    
    // Calculate projected annual revenue
    const projectedAnnual = currentMRR * 12;
    
    return {
      currentMRR,
      mrrByTier,
      mrrByProgram,
      membersByProgram,
      projectedAnnual,
      activeMemberCount: activeMemberships.length,
      avgRevenuePerMember: activeMemberships.length > 0 ? currentMRR / activeMemberships.length : 0,
    };
  }, [memberships]);

  // Calculate churn metrics
  const churnStats = useMemo(() => {
    const now = new Date();
    const thirtyDaysAgo = subMonths(now, 1);
    const sixtyDaysAgo = subMonths(now, 2);
    
    // Cancelled memberships in the last 30 days
    const recentCancellations = memberships.filter(m => {
      if (m.status !== 'cancelled') return false;
      const endDate = m.end_date ? parseISO(m.end_date) : null;
      return endDate && isWithinInterval(endDate, { start: thirtyDaysAgo, end: now });
    });
    
    // Cancelled memberships in the previous 30 days (for comparison)
    const previousCancellations = memberships.filter(m => {
      if (m.status !== 'cancelled') return false;
      const endDate = m.end_date ? parseISO(m.end_date) : null;
      return endDate && isWithinInterval(endDate, { start: sixtyDaysAgo, end: thirtyDaysAgo });
    });
    
    // Total cancelled and expired memberships
    const totalChurned = memberships.filter(m => m.status === 'cancelled' || m.status === 'expired').length;
    
    // Active + churned to calculate total ever active
    const activeMemberships = memberships.filter(m => m.status === 'active');
    const totalEverActive = activeMemberships.length + totalChurned;
    
    // Churn rate = churned / (active + churned) * 100
    const churnRate = totalEverActive > 0 ? (totalChurned / totalEverActive) * 100 : 0;
    
    // Monthly churn rate (based on last 30 days)
    const activeAtStartOfMonth = activeMemberships.length + recentCancellations.length;
    const monthlyChurnRate = activeAtStartOfMonth > 0 
      ? (recentCancellations.length / activeAtStartOfMonth) * 100 
      : 0;
    
    // Lost MRR from recent cancellations
    const lostMRR = recentCancellations.reduce((sum, m) => sum + Number(m.monthly_price || 0), 0);
    const previousLostMRR = previousCancellations.reduce((sum, m) => sum + Number(m.monthly_price || 0), 0);
    
    return {
      recentCancellations: recentCancellations.length,
      previousCancellations: previousCancellations.length,
      totalChurned,
      churnRate,
      monthlyChurnRate,
      lostMRR,
      previousLostMRR,
      pausedMemberships: memberships.filter(m => m.status === 'paused').length,
    };
  }, [memberships]);

  // Calculate retention metrics
  const retentionStats = useMemo(() => {
    const now = new Date();
    const activeMemberships = memberships.filter(m => m.status === 'active');
    
    // Calculate average tenure in months
    const tenures = activeMemberships.map(m => {
      const startDate = parseISO(m.start_date);
      return differenceInMonths(now, startDate);
    });
    const avgTenure = tenures.length > 0 ? tenures.reduce((a, b) => a + b, 0) / tenures.length : 0;
    
    // Tenure distribution buckets
    const tenureBuckets = {
      '0-3 months': 0,
      '3-6 months': 0,
      '6-12 months': 0,
      '12+ months': 0,
    };
    
    tenures.forEach(tenure => {
      if (tenure < 3) tenureBuckets['0-3 months']++;
      else if (tenure < 6) tenureBuckets['3-6 months']++;
      else if (tenure < 12) tenureBuckets['6-12 months']++;
      else tenureBuckets['12+ months']++;
    });
    
    // Retention rate = 100% - churn rate
    const totalEverActive = activeMemberships.length + memberships.filter(m => m.status === 'cancelled' || m.status === 'expired').length;
    const retentionRate = totalEverActive > 0 ? (activeMemberships.length / totalEverActive) * 100 : 100;
    
    // Monthly retention rate
    const monthlyRetentionRate = 100 - (churnStats.monthlyChurnRate || 0);
    
    // Members up for renewal in next 30 days
    const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
    const upForRenewal = activeMemberships.filter(m => {
      if (!m.renewal_date) return false;
      const renewalDate = parseISO(m.renewal_date);
      return isWithinInterval(renewalDate, { start: now, end: thirtyDaysFromNow });
    });
    
    // Longest tenured member
    const longestTenure = tenures.length > 0 ? Math.max(...tenures) : 0;
    
    // Renewal success rate (estimate based on active vs total that had renewal dates in past 90 days)
    const ninetyDaysAgo = subMonths(now, 3);
    const recentRenewals = memberships.filter(m => {
      if (!m.renewal_date) return false;
      const renewalDate = parseISO(m.renewal_date);
      return isWithinInterval(renewalDate, { start: ninetyDaysAgo, end: now });
    });
    const successfulRenewals = recentRenewals.filter(m => m.status === 'active').length;
    const renewalSuccessRate = recentRenewals.length > 0 
      ? (successfulRenewals / recentRenewals.length) * 100 
      : 100;
    
    return {
      avgTenure,
      tenureBuckets,
      retentionRate,
      monthlyRetentionRate,
      upForRenewal: upForRenewal.length,
      upForRenewalMRR: upForRenewal.reduce((sum, m) => sum + Number(m.monthly_price || 0), 0),
      longestTenure,
      renewalSuccessRate,
    };
  }, [memberships, churnStats.monthlyChurnRate]);


  const stats = useMemo(() => ({
    totalClients: clients.length,
    activeMembers: memberships.filter(m => m.status === 'active').length,
    totalRevenue: filteredPurchases.reduce((sum, p) => sum + Number(p.amount), 0),
    newClientsInRange: filteredClients.length,
    leadCount: clients.filter(c => c.marketing_status === 'lead').length,
    vipCount: clients.filter(c => c.marketing_status === 'vip').length,
  }), [clients, memberships, filteredClients, filteredPurchases]);

  const comparisonStats = useMemo(() => ({
    totalRevenue: comparisonPurchases.reduce((sum, p) => sum + Number(p.amount), 0),
    newClientsInRange: comparisonClients.length,
  }), [comparisonClients, comparisonPurchases]);

  // Determine the right interval granularity based on date range
  const getIntervalData = useMemo(() => {
    const daysDiff = differenceInDays(dateRange.to, dateRange.from);
    
    if (daysDiff <= 14) {
      return {
        intervals: eachDayOfInterval({ start: dateRange.from, end: dateRange.to }),
        formatStr: 'MMM d',
        getStart: (date: Date) => {
          const d = new Date(date);
          d.setHours(0, 0, 0, 0);
          return d;
        },
        getEnd: (date: Date) => {
          const d = new Date(date);
          d.setHours(23, 59, 59, 999);
          return d;
        },
      };
    } else if (daysDiff <= 90) {
      return {
        intervals: eachWeekOfInterval({ start: dateRange.from, end: dateRange.to }),
        formatStr: 'MMM d',
        getStart: (date: Date) => new Date(date),
        getEnd: (date: Date) => new Date(date.getTime() + 6 * 24 * 60 * 60 * 1000),
      };
    } else {
      return {
        intervals: eachMonthOfInterval({ start: startOfMonth(dateRange.from), end: startOfMonth(dateRange.to) }),
        formatStr: 'MMM yyyy',
        getStart: startOfMonth,
        getEnd: endOfMonth,
      };
    }
  }, [dateRange]);

  // MRR trend data by month
  const mrrTrendData = useMemo(() => {
    const { intervals, formatStr } = getIntervalData;
    
    return intervals.map((interval) => {
      const intervalEnd = endOfMonth(new Date(interval));
      
      // Get memberships that were active at that point in time
      const activeMembershipsAtTime = memberships.filter(m => {
        const startDate = parseISO(m.start_date);
        const endDate = m.end_date ? parseISO(m.end_date) : null;
        
        // Was active: started before or on interval end, and either no end date or ended after interval start
        return startDate <= intervalEnd && (!endDate || endDate >= new Date(interval));
      });
      
      const mrr = activeMembershipsAtTime.reduce((sum, m) => sum + Number(m.monthly_price || 0), 0);
      const memberCount = activeMembershipsAtTime.length;
      
      return {
        period: format(interval, formatStr),
        mrr,
        memberCount,
      };
    });
  }, [memberships, getIntervalData]);

  // Churn trend data by month
  const churnTrendData = useMemo(() => {
    const { intervals, formatStr } = getIntervalData;
    
    return intervals.map((interval) => {
      const intervalStart = startOfMonth(new Date(interval));
      const intervalEnd = endOfMonth(new Date(interval));
      
      // Count cancellations that occurred in this period
      const cancellations = memberships.filter(m => {
        if (m.status !== 'cancelled' && m.status !== 'expired') return false;
        const endDate = m.end_date ? parseISO(m.end_date) : null;
        return endDate && isWithinInterval(endDate, { start: intervalStart, end: intervalEnd });
      });
      
      // Get memberships active at the start of the interval
      const activeAtStart = memberships.filter(m => {
        const startDate = parseISO(m.start_date);
        const endDate = m.end_date ? parseISO(m.end_date) : null;
        // Was active at interval start: started before and (no end or ended after interval start)
        return startDate <= intervalStart && (!endDate || endDate >= intervalStart);
      });
      
      const churnCount = cancellations.length;
      const churnRateForPeriod = activeAtStart.length > 0 
        ? (churnCount / activeAtStart.length) * 100 
        : 0;
      
      const lostMRR = cancellations.reduce((sum, m) => sum + Number(m.monthly_price || 0), 0);
      
      return {
        period: format(interval, formatStr),
        churnCount,
        churnRate: churnRateForPeriod,
        lostMRR,
      };
    });
  }, [memberships, getIntervalData]);

  // Get comparison interval data
  const getComparisonIntervalData = useMemo(() => {
    if (!comparisonRange) return null;
    
    const daysDiff = differenceInDays(comparisonRange.to, comparisonRange.from);
    
    if (daysDiff <= 14) {
      return {
        intervals: eachDayOfInterval({ start: comparisonRange.from, end: comparisonRange.to }),
        formatStr: 'MMM d',
        getStart: (date: Date) => {
          const d = new Date(date);
          d.setHours(0, 0, 0, 0);
          return d;
        },
        getEnd: (date: Date) => {
          const d = new Date(date);
          d.setHours(23, 59, 59, 999);
          return d;
        },
      };
    } else if (daysDiff <= 90) {
      return {
        intervals: eachWeekOfInterval({ start: comparisonRange.from, end: comparisonRange.to }),
        formatStr: 'MMM d',
        getStart: (date: Date) => new Date(date),
        getEnd: (date: Date) => new Date(date.getTime() + 6 * 24 * 60 * 60 * 1000),
      };
    } else {
      return {
        intervals: eachMonthOfInterval({ start: startOfMonth(comparisonRange.from), end: startOfMonth(comparisonRange.to) }),
        formatStr: 'MMM yyyy',
        getStart: startOfMonth,
        getEnd: endOfMonth,
      };
    }
  }, [comparisonRange]);

  // Generate client growth data based on date range
  const clientGrowthData = useMemo(() => {
    const { intervals, formatStr, getStart, getEnd } = getIntervalData;
    
    const mainData = intervals.map((interval, index) => {
      const intervalStart = getStart(new Date(interval));
      const intervalEnd = getEnd(new Date(interval));
      
      const newClients = clients.filter(c => {
        const createdAt = parseISO(c.created_at);
        return isWithinInterval(createdAt, { start: intervalStart, end: intervalEnd });
      }).length;
      
      const cumulativeClients = clients.filter(c => {
        const createdAt = parseISO(c.created_at);
        return createdAt <= intervalEnd;
      }).length;

      const result: Record<string, string | number | Date> = {
        period: format(interval, formatStr),
        index,
        newClients,
        totalClients: cumulativeClients,
        periodStart: intervalStart,
        periodEnd: intervalEnd,
      };

      return result;
    });

    // Add comparison data if enabled
    if (comparisonEnabled && getComparisonIntervalData) {
      const { intervals: compIntervals, getStart: compGetStart, getEnd: compGetEnd } = getComparisonIntervalData;
      
      mainData.forEach((item, index) => {
        if (index < compIntervals.length) {
          const compInterval = compIntervals[index];
          const compIntervalStart = compGetStart(new Date(compInterval));
          const compIntervalEnd = compGetEnd(new Date(compInterval));
          
          const compNewClients = clients.filter(c => {
            const createdAt = parseISO(c.created_at);
            return isWithinInterval(createdAt, { start: compIntervalStart, end: compIntervalEnd });
          }).length;
          
          const compCumulativeClients = clients.filter(c => {
            const createdAt = parseISO(c.created_at);
            return createdAt <= compIntervalEnd;
          }).length;

          item.prevNewClients = compNewClients;
          item.prevTotalClients = compCumulativeClients;
        }
      });
    }
    
    return mainData;
  }, [clients, getIntervalData, comparisonEnabled, getComparisonIntervalData]);

  // Generate revenue trend data based on date range
  const revenueData = useMemo(() => {
    const { intervals, formatStr, getStart, getEnd } = getIntervalData;
    
    const mainData = intervals.map((interval, index) => {
      const intervalStart = getStart(new Date(interval));
      const intervalEnd = getEnd(new Date(interval));
      
      const periodRevenue = purchases
        .filter(p => {
          const purchaseDate = parseISO(p.purchased_at);
          return isWithinInterval(purchaseDate, { start: intervalStart, end: intervalEnd });
        })
        .reduce((sum, p) => sum + Number(p.amount), 0);
      
      const result: Record<string, string | number | Date> = {
        period: format(interval, formatStr),
        index,
        revenue: periodRevenue,
        periodStart: intervalStart,
        periodEnd: intervalEnd,
      };

      return result;
    });

    // Add comparison data if enabled
    if (comparisonEnabled && getComparisonIntervalData) {
      const { intervals: compIntervals, getStart: compGetStart, getEnd: compGetEnd } = getComparisonIntervalData;
      
      mainData.forEach((item, index) => {
        if (index < compIntervals.length) {
          const compInterval = compIntervals[index];
          const compIntervalStart = compGetStart(new Date(compInterval));
          const compIntervalEnd = compGetEnd(new Date(compInterval));
          
          const compPeriodRevenue = purchases
            .filter(p => {
              const purchaseDate = parseISO(p.purchased_at);
              return isWithinInterval(purchaseDate, { start: compIntervalStart, end: compIntervalEnd });
            })
            .reduce((sum, p) => sum + Number(p.amount), 0);

          item.prevRevenue = compPeriodRevenue;
        }
      });
    }
    
    return mainData;
  }, [purchases, getIntervalData, comparisonEnabled, getComparisonIntervalData]);

  // Handle chart click for drill-down
  const handleClientChartClick = useCallback((data: any, type: 'totalClients' | 'newClients') => {
    if (!data || !data.activePayload || data.activePayload.length === 0) return;
    
    const payload = data.activePayload[0].payload;
    const periodStart = payload.periodStart as Date;
    const periodEnd = payload.periodEnd as Date;
    
    const drillDownType: DrillDownType = type === 'newClients' ? 'newClients' : 'clients';
    
    let relevantClients;
    if (type === 'newClients') {
      relevantClients = clients.filter(c => {
        const createdAt = parseISO(c.created_at);
        return isWithinInterval(createdAt, { start: periodStart, end: periodEnd });
      });
    } else {
      relevantClients = clients.filter(c => {
        const createdAt = parseISO(c.created_at);
        return createdAt <= periodEnd;
      });
    }

    setDrillDownData({
      type: drillDownType,
      period: payload.period as string,
      periodStart,
      periodEnd,
      clients: relevantClients.map(c => ({
        id: c.id,
        full_name: c.full_name,
        email: c.email,
        created_at: c.created_at,
        marketing_status: c.marketing_status,
      })),
    });
    setDrillDownOpen(true);
  }, [clients]);

  const handleRevenueChartClick = useCallback((data: any) => {
    if (!data || !data.activePayload || data.activePayload.length === 0) return;
    
    const payload = data.activePayload[0].payload;
    const periodStart = payload.periodStart as Date;
    const periodEnd = payload.periodEnd as Date;
    
    const relevantPurchases = purchases.filter(p => {
      const purchaseDate = parseISO(p.purchased_at);
      return isWithinInterval(purchaseDate, { start: periodStart, end: periodEnd });
    });

    // Get client names for purchases
    const clientMap = new Map(clients.map(c => [c.id, c.full_name]));

    setDrillDownData({
      type: 'revenue',
      period: payload.period as string,
      periodStart,
      periodEnd,
      purchases: relevantPurchases.map(p => ({
        id: p.id,
        product_name: p.product_name,
        amount: Number(p.amount),
        purchase_type: p.purchase_type,
        purchased_at: p.purchased_at,
        client_name: clientMap.get(p.client_id) || 'Unknown',
      })),
    });
    setDrillDownOpen(true);
  }, [purchases, clients]);

  // Membership tier distribution
  const membershipTierData = useMemo(() => {
    const tierCounts = {
      free: 0,
      essential: 0,
      premium: 0,
      elite: 0,
    };
    
    memberships.filter(m => m.status === 'active').forEach(m => {
      if (m.tier in tierCounts) {
        tierCounts[m.tier as keyof typeof tierCounts]++;
      }
    });
    
    return [
      { name: 'Free', value: tierCounts.free, color: 'hsl(var(--muted-foreground))' },
      { name: 'Essential', value: tierCounts.essential, color: 'hsl(220, 70%, 50%)' },
      { name: 'Premium', value: tierCounts.premium, color: 'hsl(280, 70%, 50%)' },
      { name: 'Elite', value: tierCounts.elite, color: 'hsl(45, 90%, 50%)' },
    ].filter(item => item.value > 0);
  }, [memberships]);

  // Marketing funnel data
  const marketingFunnelData = useMemo(() => {
    const statusCounts = {
      lead: 0,
      prospect: 0,
      customer: 0,
      vip: 0,
      churned: 0,
    };
    
    clients.forEach(c => {
      if (c.marketing_status && c.marketing_status in statusCounts) {
        statusCounts[c.marketing_status as keyof typeof statusCounts]++;
      }
    });
    
    return [
      { stage: 'Leads', count: statusCounts.lead, fill: 'hsl(45, 90%, 50%)' },
      { stage: 'Prospects', count: statusCounts.prospect, fill: 'hsl(200, 70%, 50%)' },
      { stage: 'Customers', count: statusCounts.customer, fill: 'hsl(140, 70%, 45%)' },
      { stage: 'VIP', count: statusCounts.vip, fill: 'hsl(280, 70%, 50%)' },
      { stage: 'Churned', count: statusCounts.churned, fill: 'hsl(0, 70%, 50%)' },
    ];
  }, [clients]);

  // Handle funnel chart click
  const handleFunnelClick = useCallback((data: any) => {
    if (!data || !data.stage) return;
    
    const statusMap: Record<string, string> = {
      'Leads': 'lead',
      'Prospects': 'prospect',
      'Customers': 'customer',
      'VIP': 'vip',
      'Churned': 'churned',
    };
    
    const status = statusMap[data.stage];
    const relevantClients = clients.filter(c => c.marketing_status === status);

    setDrillDownData({
      type: 'clients',
      period: data.stage,
      periodStart: dateRange.from,
      periodEnd: dateRange.to,
      clients: relevantClients.map(c => ({
        id: c.id,
        full_name: c.full_name,
        email: c.email,
        created_at: c.created_at,
        marketing_status: c.marketing_status,
      })),
    });
    setDrillDownOpen(true);
  }, [clients, dateRange]);

  // Revenue by category (4 main types)
  const revenueByCategory = useMemo(() => {
    const categories = {
      subscription: { label: 'Membership', amount: 0, color: 'hsl(220, 70%, 50%)', icon: Crown },
      supplement: { label: 'Supplements', amount: 0, color: 'hsl(280, 70%, 50%)', icon: DollarSign },
      lab_testing: { label: 'Lab Testing', amount: 0, color: 'hsl(180, 70%, 45%)', icon: TrendingUp },
      service: { label: 'Services', amount: 0, color: 'hsl(45, 90%, 50%)', icon: Users },
    };
    
    filteredPurchases.forEach(p => {
      if (p.purchase_type === 'subscription') {
        categories.subscription.amount += Number(p.amount);
      } else if (p.purchase_type === 'supplement') {
        categories.supplement.amount += Number(p.amount);
      } else if (p.purchase_type === 'lab_testing') {
        categories.lab_testing.amount += Number(p.amount);
      } else if (p.purchase_type === 'service' || p.purchase_type === 'one_time') {
        categories.service.amount += Number(p.amount);
      }
    });
    
    return Object.entries(categories).map(([key, data]) => ({
      id: key,
      ...data,
    }));
  }, [filteredPurchases]);

  // Purchase type breakdown for pie chart
  const purchaseTypeData = useMemo(() => {
    const typeCounts: Record<string, number> = {};
    
    filteredPurchases.forEach(p => {
      // Group into 4 main categories
      let category = p.purchase_type;
      if (p.purchase_type === 'one_time') {
        category = 'service'; // Group one_time with services
      }
      typeCounts[category] = (typeCounts[category] || 0) + Number(p.amount);
    });
    
    const labels: Record<string, string> = {
      subscription: 'Membership',
      supplement: 'Supplements',
      lab_testing: 'Lab Testing',
      service: 'Services',
    };
    
    const colors: Record<string, string> = {
      subscription: 'hsl(220, 70%, 50%)',
      supplement: 'hsl(280, 70%, 50%)',
      lab_testing: 'hsl(180, 70%, 45%)',
      service: 'hsl(45, 90%, 50%)',
    };
    
    return Object.entries(typeCounts).map(([type, amount]) => ({
      name: labels[type] || type,
      type,
      value: amount,
      color: colors[type] || 'hsl(var(--muted-foreground))',
    }));
  }, [filteredPurchases]);

  // Handle purchase type pie click
  const handlePurchaseTypeClick = useCallback((data: any) => {
    if (!data || !data.type) return;
    
    const relevantPurchases = purchases.filter(p => p.purchase_type === data.type);
    const clientMap = new Map(clients.map(c => [c.id, c.full_name]));

    setDrillDownData({
      type: 'revenue',
      period: data.name,
      periodStart: dateRange.from,
      periodEnd: dateRange.to,
      purchases: relevantPurchases.map(p => ({
        id: p.id,
        product_name: p.product_name,
        amount: Number(p.amount),
        purchase_type: p.purchase_type,
        purchased_at: p.purchased_at,
        client_name: clientMap.get(p.client_id) || 'Unknown',
      })),
    });
    setDrillDownOpen(true);
  }, [purchases, clients, dateRange]);

  const recentClients = clients.slice(0, 5);
  const recentPurchases = purchases.slice(0, 5);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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
      <div className="flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
            <p className="text-muted-foreground">Overview of your client management system</p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <RealTimeRefresh 
              onRefresh={handleRefreshAll} 
              isLoading={loading}
              realtimeEnabled={realtimeEnabled}
              onRealtimeToggle={setRealtimeEnabled}
              lastRealtimeUpdate={lastRealtimeUpdate}
            />
            <SavedViewsManager
              currentConfig={{
                dateRange,
                comparisonEnabled,
                comparisonRange,
              }}
              onLoadView={handleLoadView}
            />
          </div>
        </div>
        <DateRangeFilter 
          dateRange={dateRange} 
          onDateRangeChange={setDateRange}
          comparisonRange={comparisonRange}
          onComparisonRangeChange={setComparisonRange}
          comparisonEnabled={comparisonEnabled}
          onComparisonEnabledChange={setComparisonEnabled}
        />
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Clients</p>
                <p className="text-3xl font-bold">{stats.totalClients}</p>
              </div>
              <Users className="h-10 w-10 text-primary opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active Members</p>
                <p className="text-3xl font-bold">{stats.activeMembers}</p>
              </div>
              <Crown className="h-10 w-10 text-amber-500 opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Total Revenue</p>
                <p className="text-3xl font-bold">${stats.totalRevenue.toLocaleString()}</p>
                {comparisonEnabled && (
                  <ChangeIndicator 
                    current={stats.totalRevenue} 
                    previous={comparisonStats.totalRevenue} 
                    format="currency"
                  />
                )}
              </div>
              <DollarSign className="h-10 w-10 text-green-500 opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">New in Range</p>
                <p className="text-3xl font-bold">{stats.newClientsInRange}</p>
                {comparisonEnabled && (
                  <ChangeIndicator 
                    current={stats.newClientsInRange} 
                    previous={comparisonStats.newClientsInRange} 
                  />
                )}
              </div>
              <UserPlus className="h-10 w-10 text-blue-500 opacity-50" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* MRR Tracker Section */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
          <RefreshCw className="h-5 w-5" />
          Membership MRR Tracker
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Current MRR</p>
                  <p className="text-3xl font-bold text-primary">${mrrStats.currentMRR.toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {mrrStats.activeMemberCount} active members
                  </p>
                </div>
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                  <RefreshCw className="h-6 w-6 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Projected Annual</p>
                  <p className="text-3xl font-bold">${mrrStats.projectedAnnual.toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground mt-1">Based on current MRR</p>
                </div>
                <TrendingUp className="h-10 w-10 text-green-500 opacity-50" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Avg Revenue/Member</p>
                  <p className="text-3xl font-bold">${mrrStats.avgRevenuePerMember.toFixed(0)}</p>
                  <p className="text-xs text-muted-foreground mt-1">Per month</p>
                </div>
                <Users className="h-10 w-10 text-blue-500 opacity-50" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div>
                <p className="text-sm text-muted-foreground mb-3">MRR by Tier</p>
                <div className="space-y-2">
                  {Object.entries(mrrStats.mrrByTier).map(([tier, amount]) => {
                    const tierColors: Record<string, string> = {
                      free: 'bg-muted-foreground/20',
                      essential: 'bg-blue-500',
                      premium: 'bg-purple-500',
                      elite: 'bg-amber-500',
                    };
                    const percentage = mrrStats.currentMRR > 0 ? (amount / mrrStats.currentMRR) * 100 : 0;
                    return amount > 0 ? (
                      <div key={tier} className="flex items-center gap-2">
                        <div className={`h-2 w-2 rounded-full ${tierColors[tier]}`} />
                        <span className="text-xs capitalize flex-1">{tier}</span>
                        <span className="text-xs font-medium">${amount.toLocaleString()}</span>
                        <span className="text-xs text-muted-foreground">({percentage.toFixed(0)}%)</span>
                      </div>
                    ) : null;
                  })}
                  {mrrStats.currentMRR === 0 && (
                    <p className="text-xs text-muted-foreground">No active memberships</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Program Type MRR Breakdown */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="border-l-4 border-l-amber-500">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Crown className="h-5 w-5 text-amber-500" />
                <p className="text-sm font-medium">Wellness</p>
              </div>
              <p className="text-2xl font-bold">${mrrStats.mrrByProgram.wellness.toLocaleString()}</p>
              <p className="text-xs text-muted-foreground">{mrrStats.membersByProgram.wellness} active members</p>
            </CardContent>
          </Card>
          <Card className="border-l-4 border-l-indigo-500">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Moon className="h-5 w-5 text-indigo-500" />
                <p className="text-sm font-medium">Sleep</p>
              </div>
              <p className="text-2xl font-bold">${mrrStats.mrrByProgram.sleep.toLocaleString()}</p>
              <p className="text-xs text-muted-foreground">{mrrStats.membersByProgram.sleep} active members</p>
            </CardContent>
          </Card>
          <Card className="border-l-4 border-l-emerald-500">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Brain className="h-5 w-5 text-emerald-500" />
                <p className="text-sm font-medium">Mental Performance</p>
              </div>
              <p className="text-2xl font-bold">${mrrStats.mrrByProgram.mental_performance.toLocaleString()}</p>
              <p className="text-xs text-muted-foreground">{mrrStats.membersByProgram.mental_performance} active members</p>
            </CardContent>
          </Card>
          <Card className="border-l-4 border-l-purple-500">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Package className="h-5 w-5 text-purple-500" />
                <p className="text-sm font-medium">Recovery Bundles</p>
              </div>
              <p className="text-2xl font-bold">${mrrStats.mrrByProgram.bundle.toLocaleString()}</p>
              <p className="text-xs text-muted-foreground">{mrrStats.membersByProgram.bundle} active members</p>
            </CardContent>
          </Card>
        </div>

        {/* MRR Trend Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <RefreshCw className="h-5 w-5" />
              MRR Trend
            </CardTitle>
            <p className="text-xs text-muted-foreground">Monthly recurring revenue from memberships over time</p>
          </CardHeader>
          <CardContent>
            <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={mrrTrendData}>
                  <defs>
                    <linearGradient id="colorMRR" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="period" className="text-xs" tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                  <YAxis className="text-xs" tick={{ fill: 'hsl(var(--muted-foreground))' }} tickFormatter={(value) => `$${value}`} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                    }}
                    labelStyle={{ color: 'hsl(var(--foreground))' }}
                    formatter={(value: number, name: string) => [
                      name === 'mrr' ? `$${value.toLocaleString()}` : value,
                      name === 'mrr' ? 'MRR' : 'Active Members'
                    ]}
                  />
                  <Legend />
                  <Area
                    type="monotone"
                    dataKey="mrr"
                    name="MRR"
                    stroke="hsl(var(--primary))"
                    fill="url(#colorMRR)"
                    strokeWidth={2}
                  />
                  <Line
                    type="monotone"
                    dataKey="memberCount"
                    name="Active Members"
                    stroke="hsl(280, 70%, 50%)"
                    strokeWidth={2}
                    dot={{ fill: 'hsl(280, 70%, 50%)' }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Program Type MRR Distribution Pie Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              MRR by Program Type
            </CardTitle>
            <p className="text-xs text-muted-foreground">Revenue distribution across program types</p>
          </CardHeader>
          <CardContent>
            <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={[
                      { name: 'Wellness', value: mrrStats.mrrByProgram.wellness, color: 'hsl(45, 90%, 50%)' },
                      { name: 'Sleep', value: mrrStats.mrrByProgram.sleep, color: 'hsl(240, 60%, 60%)' },
                      { name: 'Mental Performance', value: mrrStats.mrrByProgram.mental_performance, color: 'hsl(160, 60%, 45%)' },
                      { name: 'Recovery Bundles', value: mrrStats.mrrByProgram.bundle, color: 'hsl(280, 60%, 55%)' },
                    ].filter(d => d.value > 0)}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    innerRadius={40}
                    dataKey="value"
                    label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                    labelLine={true}
                  >
                    {[
                      { name: 'Wellness', value: mrrStats.mrrByProgram.wellness, color: 'hsl(45, 90%, 50%)' },
                      { name: 'Sleep', value: mrrStats.mrrByProgram.sleep, color: 'hsl(240, 60%, 60%)' },
                      { name: 'Mental Performance', value: mrrStats.mrrByProgram.mental_performance, color: 'hsl(160, 60%, 45%)' },
                      { name: 'Recovery Bundles', value: mrrStats.mrrByProgram.bundle, color: 'hsl(280, 60%, 55%)' },
                    ].filter(d => d.value > 0).map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                    }}
                    formatter={(value: number) => [`$${value.toLocaleString()}`, 'MRR']}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
            {mrrStats.currentMRR === 0 && (
              <p className="text-center text-muted-foreground text-sm">No active memberships to display</p>
            )}
          </CardContent>
        </Card>

        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-500" />
            Churn Rate Tracking
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="border-red-500/20 bg-gradient-to-br from-red-500/5 to-transparent">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Monthly Churn Rate</p>
                    <p className="text-3xl font-bold text-red-500">{churnStats.monthlyChurnRate.toFixed(1)}%</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {churnStats.recentCancellations} cancellation{churnStats.recentCancellations !== 1 ? 's' : ''} (30 days)
                    </p>
                  </div>
                  <div className="h-12 w-12 rounded-lg bg-red-500/10 flex items-center justify-center">
                    <UserMinus className="h-6 w-6 text-red-500" />
                  </div>
                </div>
                {churnStats.previousCancellations > 0 && (
                  <div className="mt-2">
                    <ChangeIndicator 
                      current={churnStats.recentCancellations} 
                      previous={churnStats.previousCancellations}
                    />
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Lost MRR (30 days)</p>
                    <p className="text-3xl font-bold text-red-500">${churnStats.lostMRR.toLocaleString()}</p>
                    <p className="text-xs text-muted-foreground mt-1">Revenue impact</p>
                  </div>
                  <DollarSign className="h-10 w-10 text-red-500 opacity-50" />
                </div>
                {churnStats.previousLostMRR > 0 && (
                  <div className="mt-2">
                    <ChangeIndicator 
                      current={churnStats.lostMRR} 
                      previous={churnStats.previousLostMRR}
                      format="currency"
                    />
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Churned</p>
                    <p className="text-3xl font-bold">{churnStats.totalChurned}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {churnStats.churnRate.toFixed(1)}% lifetime rate
                    </p>
                  </div>
                  <UserMinus className="h-10 w-10 text-muted-foreground opacity-50" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">At Risk (Paused)</p>
                    <p className="text-3xl font-bold text-amber-500">{churnStats.pausedMemberships}</p>
                    <p className="text-xs text-muted-foreground mt-1">May cancel soon</p>
                  </div>
                  <AlertTriangle className="h-10 w-10 text-amber-500 opacity-50" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Churn Trend Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserMinus className="h-5 w-5 text-red-500" />
                Churn Trend
              </CardTitle>
              <p className="text-xs text-muted-foreground">Membership cancellations and churn rate over time</p>
            </CardHeader>
            <CardContent>
              <div className="h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={churnTrendData}>
                    <defs>
                      <linearGradient id="colorChurn" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(0, 70%, 50%)" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="hsl(0, 70%, 50%)" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="period" className="text-xs" tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                    <YAxis 
                      yAxisId="left"
                      className="text-xs" 
                      tick={{ fill: 'hsl(var(--muted-foreground))' }} 
                    />
                    <YAxis 
                      yAxisId="right"
                      orientation="right"
                      className="text-xs" 
                      tick={{ fill: 'hsl(var(--muted-foreground))' }}
                      tickFormatter={(value) => `${value}%`}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px',
                      }}
                      labelStyle={{ color: 'hsl(var(--foreground))' }}
                      formatter={(value: number, name: string) => {
                        if (name === 'churnCount') return [value, 'Cancellations'];
                        if (name === 'churnRate') return [`${value.toFixed(1)}%`, 'Churn Rate'];
                        if (name === 'lostMRR') return [`$${value.toLocaleString()}`, 'Lost MRR'];
                        return [value, name];
                      }}
                    />
                    <Legend />
                    <Area
                      yAxisId="left"
                      type="monotone"
                      dataKey="churnCount"
                      name="Cancellations"
                      stroke="hsl(0, 70%, 50%)"
                      fill="url(#colorChurn)"
                      strokeWidth={2}
                    />
                    <Line
                      yAxisId="right"
                      type="monotone"
                      dataKey="churnRate"
                      name="Churn Rate %"
                      stroke="hsl(45, 90%, 50%)"
                      strokeWidth={2}
                      dot={{ fill: 'hsl(45, 90%, 50%)' }}
                    />
                    <Bar
                      yAxisId="left"
                      dataKey="lostMRR"
                      name="Lost MRR ($)"
                      fill="hsl(0, 70%, 50%)"
                      opacity={0.3}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Retention Metrics */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-500" />
            Retention Metrics
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="border-green-500/20 bg-gradient-to-br from-green-500/5 to-transparent">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Retention Rate</p>
                    <p className="text-3xl font-bold text-green-500">{retentionStats.retentionRate.toFixed(1)}%</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {retentionStats.monthlyRetentionRate.toFixed(1)}% monthly
                    </p>
                  </div>
                  <div className="h-12 w-12 rounded-lg bg-green-500/10 flex items-center justify-center">
                    <CheckCircle className="h-6 w-6 text-green-500" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Avg Member Tenure</p>
                    <p className="text-3xl font-bold">{retentionStats.avgTenure.toFixed(1)}</p>
                    <p className="text-xs text-muted-foreground mt-1">months</p>
                  </div>
                  <Clock className="h-10 w-10 text-blue-500 opacity-50" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Up for Renewal</p>
                    <p className="text-3xl font-bold text-amber-500">{retentionStats.upForRenewal}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      ${retentionStats.upForRenewalMRR.toLocaleString()} MRR at risk
                    </p>
                  </div>
                  <Calendar className="h-10 w-10 text-amber-500 opacity-50" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Renewal Success</p>
                    <p className="text-3xl font-bold text-green-500">{retentionStats.renewalSuccessRate.toFixed(0)}%</p>
                    <p className="text-xs text-muted-foreground mt-1">Last 90 days</p>
                  </div>
                  <TrendingUp className="h-10 w-10 text-green-500 opacity-50" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Tenure Distribution */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-blue-500" />
                Member Tenure Distribution
              </CardTitle>
              <p className="text-xs text-muted-foreground">How long members have been subscribed</p>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {Object.entries(retentionStats.tenureBuckets).map(([bucket, count]) => {
                  const total = Object.values(retentionStats.tenureBuckets).reduce((a, b) => a + b, 0);
                  const percentage = total > 0 ? (count / total) * 100 : 0;
                  const colors: Record<string, string> = {
                    '0-3 months': 'bg-blue-500',
                    '3-6 months': 'bg-cyan-500',
                    '6-12 months': 'bg-purple-500',
                    '12+ months': 'bg-green-500',
                  };
                  return (
                    <div key={bucket} className="text-center p-4 rounded-lg bg-muted/30">
                      <div className={`w-full h-2 rounded-full bg-muted mb-3 overflow-hidden`}>
                        <div 
                          className={`h-full ${colors[bucket]} transition-all`} 
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                      <p className="text-2xl font-bold">{count}</p>
                      <p className="text-xs text-muted-foreground">{bucket}</p>
                      <p className="text-xs font-medium text-muted-foreground mt-1">{percentage.toFixed(0)}%</p>
                    </div>
                  );
                })}
              </div>
              {retentionStats.longestTenure > 0 && (
                <div className="mt-4 pt-4 border-t flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Longest active member tenure:</span>
                  <span className="font-medium">{retentionStats.longestTenure} months</span>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Revenue by Category */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-foreground">Revenue by Category</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {revenueByCategory.map((category) => (
            <Card 
              key={category.id} 
              className="cursor-pointer hover:border-primary/50 transition-colors"
              onClick={() => {
                const relevantPurchases = filteredPurchases.filter(p => {
                  if (category.id === 'service') {
                    return p.purchase_type === 'service' || p.purchase_type === 'one_time';
                  }
                  return p.purchase_type === category.id;
                });
                const clientMap = new Map(clients.map(c => [c.id, c.full_name]));
                
                setDrillDownData({
                  type: 'revenue',
                  period: category.label,
                  periodStart: dateRange.from,
                  periodEnd: dateRange.to,
                  purchases: relevantPurchases.map(p => ({
                    id: p.id,
                    product_name: p.product_name,
                    amount: Number(p.amount),
                    purchase_type: p.purchase_type,
                    purchased_at: p.purchased_at,
                    client_name: clientMap.get(p.client_id) || 'Unknown',
                  })),
                });
                setDrillDownOpen(true);
              }}
            >
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{category.label}</p>
                    <p className="text-2xl font-bold">${category.amount.toLocaleString()}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {stats.totalRevenue > 0 
                        ? `${((category.amount / stats.totalRevenue) * 100).toFixed(1)}% of total`
                        : '0% of total'
                      }
                    </p>
                  </div>
                  <div 
                    className="h-12 w-12 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: `${category.color}20` }}
                  >
                    <category.icon 
                      className="h-6 w-6" 
                      style={{ color: category.color }}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Client Growth Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Client Growth
              {comparisonEnabled && <span className="text-xs font-normal text-muted-foreground">(vs previous period)</span>}
            </CardTitle>
            <p className="text-xs text-muted-foreground">Click on chart to see details</p>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart 
                  data={clientGrowthData}
                  onClick={(data) => handleClientChartClick(data, 'totalClients')}
                  style={{ cursor: 'pointer' }}
                >
                  <defs>
                    <linearGradient id="colorClients" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorClientsPrev" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--muted-foreground))" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="hsl(var(--muted-foreground))" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="period" className="text-xs" tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                  <YAxis className="text-xs" tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                    }}
                    labelStyle={{ color: 'hsl(var(--foreground))' }}
                  />
                  <Legend />
                  {comparisonEnabled && (
                    <>
                      <Area
                        type="monotone"
                        dataKey="prevTotalClients"
                        name="Prev Total"
                        stroke="hsl(var(--muted-foreground))"
                        fill="url(#colorClientsPrev)"
                        strokeWidth={1}
                        strokeDasharray="5 5"
                      />
                      <Line
                        type="monotone"
                        dataKey="prevNewClients"
                        name="Prev New"
                        stroke="hsl(var(--muted-foreground))"
                        strokeWidth={1}
                        strokeDasharray="5 5"
                        dot={false}
                      />
                    </>
                  )}
                  <Area
                    type="monotone"
                    dataKey="totalClients"
                    name="Total Clients"
                    stroke="hsl(var(--primary))"
                    fill="url(#colorClients)"
                    strokeWidth={2}
                  />
                  <Line
                    type="monotone"
                    dataKey="newClients"
                    name="New Clients"
                    stroke="hsl(140, 70%, 45%)"
                    strokeWidth={2}
                    dot={{ fill: 'hsl(140, 70%, 45%)' }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Revenue Trend Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Revenue Trend
              {comparisonEnabled && <span className="text-xs font-normal text-muted-foreground">(vs previous period)</span>}
            </CardTitle>
            <p className="text-xs text-muted-foreground">Click on bars to see transactions</p>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart 
                  data={revenueData}
                  onClick={handleRevenueChartClick}
                  style={{ cursor: 'pointer' }}
                >
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(140, 70%, 45%)" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="hsl(140, 70%, 45%)" stopOpacity={0.4} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="period" className="text-xs" tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                  <YAxis className="text-xs" tick={{ fill: 'hsl(var(--muted-foreground))' }} tickFormatter={(value) => `$${value}`} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                    }}
                    labelStyle={{ color: 'hsl(var(--foreground))' }}
                    formatter={(value: number, name: string) => [`$${value.toLocaleString()}`, name === 'prevRevenue' ? 'Prev Revenue' : 'Revenue']}
                  />
                  <Legend />
                  {comparisonEnabled && (
                    <Bar 
                      dataKey="prevRevenue" 
                      name="Prev Revenue" 
                      fill="hsl(var(--muted-foreground))" 
                      radius={[4, 4, 0, 0]} 
                      opacity={0.5}
                    />
                  )}
                  <Bar dataKey="revenue" name="Revenue" fill="url(#colorRevenue)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Membership Tier Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Crown className="h-5 w-5" />
              Membership Tiers
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[250px]">
              {membershipTierData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={membershipTierData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {membershipTierData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px',
                      }}
                    />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-muted-foreground">
                  No active memberships
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Marketing Funnel */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Marketing Funnel
            </CardTitle>
            <p className="text-xs text-muted-foreground">Click on bars to see clients</p>
          </CardHeader>
          <CardContent>
            <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart 
                  data={marketingFunnelData} 
                  layout="vertical"
                  onClick={(data) => data?.activePayload?.[0]?.payload && handleFunnelClick(data.activePayload[0].payload)}
                  style={{ cursor: 'pointer' }}
                >
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" horizontal={false} />
                  <XAxis type="number" className="text-xs" tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                  <YAxis dataKey="stage" type="category" className="text-xs" tick={{ fill: 'hsl(var(--muted-foreground))' }} width={70} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                    }}
                  />
                  <Bar dataKey="count" name="Clients" radius={[0, 4, 4, 0]}>
                    {marketingFunnelData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Purchase Type Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Revenue by Type
            </CardTitle>
            <p className="text-xs text-muted-foreground">Click on segments to see details</p>
          </CardHeader>
          <CardContent>
            <div className="h-[250px]">
              {purchaseTypeData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={purchaseTypeData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                      onClick={handlePurchaseTypeClick}
                      style={{ cursor: 'pointer' }}
                    >
                      {purchaseTypeData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px',
                      }}
                      formatter={(value: number) => `$${value.toLocaleString()}`}
                    />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-muted-foreground">
                  No purchase data
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Recent Clients</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentClients.length > 0 ? (
                recentClients.map((client) => (
                  <div key={client.id} className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{client.full_name}</p>
                      <p className="text-sm text-muted-foreground">{client.email}</p>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {format(parseISO(client.created_at), 'MMM d, yyyy')}
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-muted-foreground">No clients yet</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Purchases</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentPurchases.length > 0 ? (
                recentPurchases.map((purchase) => (
                  <div key={purchase.id} className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{purchase.product_name}</p>
                      <p className="text-sm text-muted-foreground capitalize">{purchase.purchase_type.replace('_', ' ')}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-green-600">${Number(purchase.amount).toLocaleString()}</p>
                      <p className="text-xs text-muted-foreground">
                        {format(parseISO(purchase.purchased_at), 'MMM d, yyyy')}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-muted-foreground">No purchases yet</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Drill-down Modal */}
      <ChartDrillDown 
        open={drillDownOpen} 
        onOpenChange={setDrillDownOpen} 
        data={drillDownData} 
      />
    </div>
  );
}
