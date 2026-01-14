import { useState } from 'react';
import { format, subDays, subMonths, startOfMonth, endOfMonth, startOfYear } from 'date-fns';
import { CalendarIcon } from 'lucide-react';
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

export type DateRange = {
  from: Date;
  to: Date;
};

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

interface DateRangeFilterProps {
  dateRange: DateRange;
  onDateRangeChange: (range: DateRange) => void;
}

export function DateRangeFilter({ dateRange, onDateRangeChange }: DateRangeFilterProps) {
  const [preset, setPreset] = useState<PresetOption>('last6months');
  const [isCustom, setIsCustom] = useState(false);

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
  };

  const handleFromDateChange = (date: Date | undefined) => {
    if (date) {
      onDateRangeChange({ ...dateRange, from: date });
    }
  };

  const handleToDateChange = (date: Date | undefined) => {
    if (date) {
      onDateRangeChange({ ...dateRange, to: date });
    }
  };

  return (
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
    </div>
  );
}
