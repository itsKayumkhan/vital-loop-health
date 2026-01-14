import { useState, useEffect, useCallback, useRef } from 'react';
import { RefreshCw, Radio, Pause, Play, Zap, ZapOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

type RefreshInterval = 'off' | '10s' | '30s' | '1m' | '5m';

interface RealTimeRefreshProps {
  onRefresh: () => Promise<void> | void;
  isLoading?: boolean;
  realtimeEnabled?: boolean;
  onRealtimeToggle?: (enabled: boolean) => void;
  lastRealtimeUpdate?: Date | null;
}

const INTERVAL_MS: Record<RefreshInterval, number> = {
  'off': 0,
  '10s': 10000,
  '30s': 30000,
  '1m': 60000,
  '5m': 300000,
};

const INTERVAL_LABELS: Record<RefreshInterval, string> = {
  'off': 'Off',
  '10s': '10 seconds',
  '30s': '30 seconds',
  '1m': '1 minute',
  '5m': '5 minutes',
};

export function RealTimeRefresh({ 
  onRefresh, 
  isLoading = false,
  realtimeEnabled = false,
  onRealtimeToggle,
  lastRealtimeUpdate,
}: RealTimeRefreshProps) {
  const [autoRefresh, setAutoRefresh] = useState<RefreshInterval>('off');
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Update last refresh when realtime update occurs
  useEffect(() => {
    if (lastRealtimeUpdate) {
      setLastRefresh(lastRealtimeUpdate);
    }
  }, [lastRealtimeUpdate]);

  const handleRefresh = useCallback(async () => {
    if (isRefreshing || isLoading) return;
    
    setIsRefreshing(true);
    try {
      await onRefresh();
      setLastRefresh(new Date());
    } finally {
      setIsRefreshing(false);
    }
  }, [onRefresh, isRefreshing, isLoading]);

  // Set up auto-refresh interval (disabled when realtime is active)
  useEffect(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    // Don't use polling if realtime is enabled
    if (realtimeEnabled) return;

    const intervalMs = INTERVAL_MS[autoRefresh];
    if (intervalMs > 0 && !isPaused) {
      intervalRef.current = setInterval(handleRefresh, intervalMs);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [autoRefresh, isPaused, handleRefresh, realtimeEnabled]);

  const handleIntervalChange = (interval: RefreshInterval) => {
    setAutoRefresh(interval);
    if (interval !== 'off') {
      setIsPaused(false);
    }
  };

  const togglePause = () => {
    setIsPaused(prev => !prev);
  };

  const isAutoRefreshActive = autoRefresh !== 'off' && !isPaused && !realtimeEnabled;

  return (
    <div className="flex items-center gap-2">
      {/* Last refresh time */}
      <span className="text-xs text-muted-foreground hidden sm:inline">
        Updated {format(lastRefresh, 'h:mm:ss a')}
      </span>

      {/* Manual refresh button */}
      <Button
        variant="outline"
        size="sm"
        onClick={handleRefresh}
        disabled={isRefreshing || isLoading}
        className="gap-2"
      >
        <RefreshCw className={cn("h-4 w-4", (isRefreshing || isLoading) && "animate-spin")} />
        <span className="hidden sm:inline">Refresh</span>
      </Button>

      {/* Real-time & Auto-refresh dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant={realtimeEnabled ? "default" : isAutoRefreshActive ? "secondary" : "outline"}
            size="sm"
            className={cn(
              "gap-2",
              realtimeEnabled && "bg-green-600 hover:bg-green-700"
            )}
          >
            {realtimeEnabled ? (
              <Zap className="h-4 w-4 animate-pulse" />
            ) : (
              <Radio className={cn("h-4 w-4", isAutoRefreshActive && "animate-pulse")} />
            )}
            <span className="hidden sm:inline">
              {realtimeEnabled ? 'Live' : autoRefresh === 'off' ? 'Auto' : INTERVAL_LABELS[autoRefresh]}
            </span>
            {realtimeEnabled && (
              <Badge variant="secondary" className="ml-1 px-1.5 py-0 text-xs bg-green-700">
                WebSocket
              </Badge>
            )}
            {isAutoRefreshActive && !realtimeEnabled && (
              <Badge variant="secondary" className="ml-1 px-1.5 py-0 text-xs">
                Polling
              </Badge>
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          {/* Realtime toggle */}
          {onRealtimeToggle && (
            <>
              <div className="px-2 py-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Zap className={cn("h-4 w-4", realtimeEnabled && "text-green-500")} />
                    <Label htmlFor="realtime-toggle" className="text-sm font-medium cursor-pointer">
                      Real-time Updates
                    </Label>
                  </div>
                  <Switch
                    id="realtime-toggle"
                    checked={realtimeEnabled}
                    onCheckedChange={onRealtimeToggle}
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-1 pl-6">
                  Instant updates via WebSocket
                </p>
              </div>
              <DropdownMenuSeparator />
            </>
          )}

          <DropdownMenuLabel className="flex items-center gap-2">
            <Radio className="h-4 w-4" />
            Polling Interval
            {realtimeEnabled && (
              <Badge variant="outline" className="text-xs ml-auto">
                Disabled
              </Badge>
            )}
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          {(Object.keys(INTERVAL_LABELS) as RefreshInterval[]).map((interval) => (
            <DropdownMenuItem
              key={interval}
              onClick={() => handleIntervalChange(interval)}
              disabled={realtimeEnabled}
              className={cn(
                "cursor-pointer",
                autoRefresh === interval && !realtimeEnabled && "bg-accent"
              )}
            >
              {INTERVAL_LABELS[interval]}
              {autoRefresh === interval && !realtimeEnabled && (
                <span className="ml-auto text-primary">✓</span>
              )}
            </DropdownMenuItem>
          ))}
          {autoRefresh !== 'off' && !realtimeEnabled && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={togglePause} className="cursor-pointer">
                {isPaused ? (
                  <>
                    <Play className="h-4 w-4 mr-2" />
                    Resume
                  </>
                ) : (
                  <>
                    <Pause className="h-4 w-4 mr-2" />
                    Pause
                  </>
                )}
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
