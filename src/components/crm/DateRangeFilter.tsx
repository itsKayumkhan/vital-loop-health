import { useState } from 'react';
import { format, subDays, subMonths, startOfMonth, endOfMonth, startOfYear, differenceInDays } from 'date-fns';
import { CalendarIcon, GitCompare } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

export type DateRange = {
  from: Date;
  to: Date;
};

export type ComparisonRange = {
  from: Date;
  to: Date;
} | null;

type PresetOption = 
  | 'last7days'
  | 'last30days'
  | 'last3months'
  | 'last6months'
  | 'last12months'
  | 'thisMonth'
  | 'lastMonth'
  | 'thisYear'
  | 'custom';

type ComparisonOption = 
  | 'previousPeriod'
  | 'previousYear'
  | 'custom';

interface DateRangeFilterProps {
  dateRange: DateRange;
  onDateRangeChange: (range: DateRange) => void;
  comparisonRange?: ComparisonRange;
  onComparisonRangeChange?: (range: ComparisonRange) => void;
  comparisonEnabled?: boolean;
  onComparisonEnabledChange?: (enabled: boolean) => void;
}

export function DateRangeFilter({ 
  dateRange, 
  onDateRangeChange,
  comparisonRange,
  onComparisonRangeChange,
  comparisonEnabled = false,
  onComparisonEnabledChange,
}: DateRangeFilterProps) {
  const [preset, setPreset] = useState<PresetOption>('last6months');
  const [isCustom, setIsCustom] = useState(false);
  const [comparisonPreset, setComparisonPreset] = useState<ComparisonOption>('previousPeriod');
  const [isComparisonCustom, setIsComparisonCustom] = useState(false);

  const calculateComparisonRange = (option: ComparisonOption, mainRange: DateRange): DateRange => {
    const daysDiff = differenceInDays(mainRange.to, mainRange.from);
    
    switch (option) {
      case 'previousPeriod':
        return {
          from: subDays(mainRange.from, daysDiff + 1),
          to: subDays(mainRange.from, 1),
        };
      case 'previousYear':
        return {
          from: new Date(mainRange.from.getFullYear() - 1, mainRange.from.getMonth(), mainRange.from.getDate()),
          to: new Date(mainRange.to.getFullYear() - 1, mainRange.to.getMonth(), mainRange.to.getDate()),
        };
      default:
        return {
          from: subDays(mainRange.from, daysDiff + 1),
          to: subDays(mainRange.from, 1),
        };
    }
  };

  const handlePresetChange = (value: PresetOption) => {
    setPreset(value);
    const now = new Date();
    
    let newRange: DateRange;
    
    switch (value) {
      case 'last7days':
        newRange = { from: subDays(now, 7), to: now };
        setIsCustom(false);
        break;
      case 'last30days':
        newRange = { from: subDays(now, 30), to: now };
        setIsCustom(false);
        break;
      case 'last3months':
        newRange = { from: subMonths(now, 3), to: now };
        setIsCustom(false);
        break;
      case 'last6months':
        newRange = { from: subMonths(now, 6), to: now };
        setIsCustom(false);
        break;
      case 'last12months':
        newRange = { from: subMonths(now, 12), to: now };
        setIsCustom(false);
        break;
      case 'thisMonth':
        newRange = { from: startOfMonth(now), to: now };
        setIsCustom(false);
        break;
      case 'lastMonth':
        const lastMonth = subMonths(now, 1);
        newRange = { from: startOfMonth(lastMonth), to: endOfMonth(lastMonth) };
        setIsCustom(false);
        break;
      case 'thisYear':
        newRange = { from: startOfYear(now), to: now };
        setIsCustom(false);
        break;
      case 'custom':
        setIsCustom(true);
        return;
      default:
        newRange = { from: subMonths(now, 6), to: now };
        setIsCustom(false);
    }
    
    onDateRangeChange(newRange);
    
    // Update comparison range if enabled
    if (comparisonEnabled && onComparisonRangeChange) {
      onComparisonRangeChange(calculateComparisonRange(comparisonPreset, newRange));
    }
  };

  const handleComparisonPresetChange = (value: ComparisonOption) => {
    setComparisonPreset(value);
    
    if (value === 'custom') {
      setIsComparisonCustom(true);
      return;
    }
    
    setIsComparisonCustom(false);
    if (onComparisonRangeChange) {
      onComparisonRangeChange(calculateComparisonRange(value, dateRange));
    }
  };

  const handleComparisonToggle = (enabled: boolean) => {
    onComparisonEnabledChange?.(enabled);
    if (enabled && onComparisonRangeChange) {
      onComparisonRangeChange(calculateComparisonRange(comparisonPreset, dateRange));
    } else if (!enabled && onComparisonRangeChange) {
      onComparisonRangeChange(null);
    }
  };

  const handleFromDateChange = (date: Date | undefined) => {
    if (date) {
      const newRange = { ...dateRange, from: date };
      onDateRangeChange(newRange);
      if (comparisonEnabled && onComparisonRangeChange && !isComparisonCustom) {
        onComparisonRangeChange(calculateComparisonRange(comparisonPreset, newRange));
      }
    }
  };

  const handleToDateChange = (date: Date | undefined) => {
    if (date) {
      const newRange = { ...dateRange, to: date };
      onDateRangeChange(newRange);
      if (comparisonEnabled && onComparisonRangeChange && !isComparisonCustom) {
        onComparisonRangeChange(calculateComparisonRange(comparisonPreset, newRange));
      }
    }
  };

  const handleComparisonFromDateChange = (date: Date | undefined) => {
    if (date && comparisonRange && onComparisonRangeChange) {
      onComparisonRangeChange({ ...comparisonRange, from: date });
    }
  };

  const handleComparisonToDateChange = (date: Date | undefined) => {
    if (date && comparisonRange && onComparisonRangeChange) {
      onComparisonRangeChange({ ...comparisonRange, to: date });
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-3">
        <Select value={preset} onValueChange={(v) => handlePresetChange(v as PresetOption)}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select time range" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="last7days">Last 7 days</SelectItem>
            <SelectItem value="last30days">Last 30 days</SelectItem>
            <SelectItem value="last3months">Last 3 months</SelectItem>
            <SelectItem value="last6months">Last 6 months</SelectItem>
            <SelectItem value="last12months">Last 12 months</SelectItem>
            <SelectItem value="thisMonth">This month</SelectItem>
            <SelectItem value="lastMonth">Last month</SelectItem>
            <SelectItem value="thisYear">This year</SelectItem>
            <SelectItem value="custom">Custom range</SelectItem>
          </SelectContent>
        </Select>

        {isCustom && (
          <div className="flex items-center gap-2">
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-[140px] justify-start text-left font-normal",
                    !dateRange.from && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dateRange.from ? format(dateRange.from, "MMM d, yyyy") : "From"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={dateRange.from}
                  onSelect={handleFromDateChange}
                  disabled={(date) => date > new Date() || date > dateRange.to}
                  initialFocus
                  className="p-3 pointer-events-auto"
                />
              </PopoverContent>
            </Popover>

            <span className="text-muted-foreground">to</span>

            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-[140px] justify-start text-left font-normal",
                    !dateRange.to && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dateRange.to ? format(dateRange.to, "MMM d, yyyy") : "To"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={dateRange.to}
                  onSelect={handleToDateChange}
                  disabled={(date) => date > new Date() || date < dateRange.from}
                  initialFocus
                  className="p-3 pointer-events-auto"
                />
              </PopoverContent>
            </Popover>
          </div>
        )}

        <div className="text-sm text-muted-foreground">
          {format(dateRange.from, "MMM d, yyyy")} - {format(dateRange.to, "MMM d, yyyy")}
        </div>

        {onComparisonEnabledChange && (
          <div className="flex items-center gap-2 ml-auto border-l pl-4">
            <Switch
              id="comparison-mode"
              checked={comparisonEnabled}
              onCheckedChange={handleComparisonToggle}
            />
            <Label htmlFor="comparison-mode" className="flex items-center gap-2 cursor-pointer">
              <GitCompare className="h-4 w-4" />
              Compare
            </Label>
          </div>
        )}
      </div>

      {comparisonEnabled && onComparisonRangeChange && (
        <div className="flex flex-wrap items-center gap-3 p-3 bg-muted/50 rounded-lg border border-dashed">
          <span className="text-sm font-medium text-muted-foreground">Compare to:</span>
          
          <Select value={comparisonPreset} onValueChange={(v) => handleComparisonPresetChange(v as ComparisonOption)}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select comparison" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="previousPeriod">Previous period</SelectItem>
              <SelectItem value="previousYear">Previous year</SelectItem>
              <SelectItem value="custom">Custom range</SelectItem>
            </SelectContent>
          </Select>

          {isComparisonCustom && comparisonRange && (
            <div className="flex items-center gap-2">
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className={cn(
                      "w-[130px] justify-start text-left font-normal",
                      !comparisonRange.from && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-3 w-3" />
                    {comparisonRange.from ? format(comparisonRange.from, "MMM d, yyyy") : "From"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={comparisonRange.from}
                    onSelect={handleComparisonFromDateChange}
                    disabled={(date) => date > dateRange.from || date > comparisonRange.to}
                    initialFocus
                    className="p-3 pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>

              <span className="text-muted-foreground text-sm">to</span>

              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className={cn(
                      "w-[130px] justify-start text-left font-normal",
                      !comparisonRange.to && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-3 w-3" />
                    {comparisonRange.to ? format(comparisonRange.to, "MMM d, yyyy") : "To"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={comparisonRange.to}
                    onSelect={handleComparisonToDateChange}
                    disabled={(date) => date > dateRange.from || date < comparisonRange.from}
                    initialFocus
                    className="p-3 pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>
          )}

          {comparisonRange && (
            <div className="text-sm text-muted-foreground italic">
              vs {format(comparisonRange.from, "MMM d, yyyy")} - {format(comparisonRange.to, "MMM d, yyyy")}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
