import { useState, useEffect, useCallback, useRef } from 'react';
import { RefreshCw, Radio, Pause, Play } from 'lucide-react';
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
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

type RefreshInterval = 'off' | '10s' | '30s' | '1m' | '5m';

interface RealTimeRefreshProps {
  onRefresh: () => Promise<void> | void;
  isLoading?: boolean;
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

export function RealTimeRefresh({ onRefresh, isLoading = false }: RealTimeRefreshProps) {
  const [autoRefresh, setAutoRefresh] = useState<RefreshInterval>('off');
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

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

  // Set up auto-refresh interval
  useEffect(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    const intervalMs = INTERVAL_MS[autoRefresh];
    if (intervalMs > 0 && !isPaused) {
      intervalRef.current = setInterval(handleRefresh, intervalMs);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [autoRefresh, isPaused, handleRefresh]);

  const handleIntervalChange = (interval: RefreshInterval) => {
    setAutoRefresh(interval);
    if (interval !== 'off') {
      setIsPaused(false);
    }
  };

  const togglePause = () => {
    setIsPaused(prev => !prev);
  };

  const isAutoRefreshActive = autoRefresh !== 'off' && !isPaused;

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

      {/* Auto-refresh dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant={isAutoRefreshActive ? "default" : "outline"}
            size="sm"
            className={cn(
              "gap-2",
              isAutoRefreshActive && "bg-green-600 hover:bg-green-700"
            )}
          >
            <Radio className={cn(
              "h-4 w-4",
              isAutoRefreshActive && "animate-pulse"
            )} />
            <span className="hidden sm:inline">
              {autoRefresh === 'off' ? 'Auto' : INTERVAL_LABELS[autoRefresh]}
            </span>
            {isAutoRefreshActive && (
              <Badge variant="secondary" className="ml-1 px-1.5 py-0 text-xs bg-green-700">
                Live
              </Badge>
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Auto-Refresh Interval</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {(Object.keys(INTERVAL_LABELS) as RefreshInterval[]).map((interval) => (
            <DropdownMenuItem
              key={interval}
              onClick={() => handleIntervalChange(interval)}
              className={cn(
                "cursor-pointer",
                autoRefresh === interval && "bg-accent"
              )}
            >
              {INTERVAL_LABELS[interval]}
              {autoRefresh === interval && (
                <span className="ml-auto text-primary">✓</span>
              )}
            </DropdownMenuItem>
          ))}
          {autoRefresh !== 'off' && (
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
