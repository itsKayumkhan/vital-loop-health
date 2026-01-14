import { useState } from 'react';
import { format } from 'date-fns';
import { Bookmark, Save, Star, Trash2, MoreHorizontal, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useSavedViews, SavedView, SavedViewConfig } from '@/hooks/useSavedViews';
import { DateRange, ComparisonRange } from './DateRangeFilter';
import { cn } from '@/lib/utils';

interface SavedViewsManagerProps {
  currentConfig: {
    dateRange: DateRange;
    comparisonEnabled: boolean;
    comparisonRange: ComparisonRange;
  };
  onLoadView: (config: SavedViewConfig) => void;
}

export function SavedViewsManager({ currentConfig, onLoadView }: SavedViewsManagerProps) {
  const { savedViews, loading, createView, updateView, deleteView } = useSavedViews();
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [manageDialogOpen, setManageDialogOpen] = useState(false);
  const [viewName, setViewName] = useState('');
  const [viewDescription, setViewDescription] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSaveView = async () => {
    if (!viewName.trim()) return;

    setSaving(true);
    const config: SavedViewConfig = {
      dateRange: {
        from: currentConfig.dateRange.from.toISOString(),
        to: currentConfig.dateRange.to.toISOString(),
      },
      comparisonEnabled: currentConfig.comparisonEnabled,
      comparisonRange: currentConfig.comparisonRange ? {
        from: currentConfig.comparisonRange.from.toISOString(),
        to: currentConfig.comparisonRange.to.toISOString(),
      } : null,
    };

    await createView(viewName.trim(), config, viewDescription.trim() || undefined);
    setSaving(false);
    setSaveDialogOpen(false);
    setViewName('');
    setViewDescription('');
  };

  const handleLoadView = (view: SavedView) => {
    onLoadView(view.config);
    setManageDialogOpen(false);
  };

  const handleSetDefault = async (view: SavedView) => {
    await updateView(view.id, { is_default: !view.is_default });
  };

  const handleDeleteView = async (view: SavedView) => {
    await deleteView(view.id);
  };

  return (
    <div className="flex items-center gap-2">
      {/* Quick Load Dropdown */}
      {savedViews.length > 0 && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="gap-2">
              <Bookmark className="h-4 w-4" />
              Saved Views
              <Badge variant="secondary" className="ml-1 px-1.5 py-0 text-xs">
                {savedViews.length}
              </Badge>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-64">
            <ScrollArea className="max-h-[300px]">
              {savedViews.map((view) => (
                <DropdownMenuItem
                  key={view.id}
                  className="flex items-center justify-between cursor-pointer"
                  onClick={() => handleLoadView(view)}
                >
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    {view.is_default && (
                      <Star className="h-3 w-3 text-yellow-500 flex-shrink-0" />
                    )}
                    <span className="truncate">{view.name}</span>
                  </div>
                  <Check className="h-3 w-3 opacity-0 group-focus:opacity-100" />
                </DropdownMenuItem>
              ))}
            </ScrollArea>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => setManageDialogOpen(true)} className="cursor-pointer">
              <MoreHorizontal className="h-4 w-4 mr-2" />
              Manage Views
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )}

      {/* Save Current View */}
      <Dialog open={saveDialogOpen} onOpenChange={setSaveDialogOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm" className="gap-2">
            <Save className="h-4 w-4" />
            Save View
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Save Current View</DialogTitle>
            <DialogDescription>
              Save your current date range and filter settings for quick access later.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="view-name">View Name</Label>
              <Input
                id="view-name"
                placeholder="e.g., Last Quarter Analysis"
                value={viewName}
                onChange={(e) => setViewName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="view-description">Description (optional)</Label>
              <Textarea
                id="view-description"
                placeholder="Add a description for this view..."
                value={viewDescription}
                onChange={(e) => setViewDescription(e.target.value)}
                rows={2}
              />
            </div>
            <div className="p-3 bg-muted rounded-lg text-sm space-y-1">
              <p className="font-medium">Current Settings:</p>
              <p className="text-muted-foreground">
                {format(currentConfig.dateRange.from, 'MMM d, yyyy')} - {format(currentConfig.dateRange.to, 'MMM d, yyyy')}
              </p>
              {currentConfig.comparisonEnabled && currentConfig.comparisonRange && (
                <p className="text-muted-foreground">
                  Comparing to: {format(currentConfig.comparisonRange.from, 'MMM d, yyyy')} - {format(currentConfig.comparisonRange.to, 'MMM d, yyyy')}
                </p>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSaveDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveView} disabled={!viewName.trim() || saving}>
              {saving ? 'Saving...' : 'Save View'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Manage Views Dialog */}
      <Dialog open={manageDialogOpen} onOpenChange={setManageDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Manage Saved Views</DialogTitle>
            <DialogDescription>
              Load, set defaults, or delete your saved dashboard views.
            </DialogDescription>
          </DialogHeader>
          <ScrollArea className="max-h-[400px] pr-4">
            <div className="space-y-3">
              {savedViews.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No saved views yet. Save your current view to get started.
                </div>
              ) : (
                savedViews.map((view) => (
                  <div
                    key={view.id}
                    className="p-4 border rounded-lg hover:bg-accent/50 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium truncate">{view.name}</h4>
                          {view.is_default && (
                            <Badge variant="secondary" className="text-xs">
                              <Star className="h-3 w-3 mr-1" />
                              Default
                            </Badge>
                          )}
                        </div>
                        {view.description && (
                          <p className="text-sm text-muted-foreground mt-1">{view.description}</p>
                        )}
                        <div className="text-xs text-muted-foreground mt-2 space-y-0.5">
                          <p>
                            {format(new Date(view.config.dateRange.from), 'MMM d, yyyy')} - {format(new Date(view.config.dateRange.to), 'MMM d, yyyy')}
                          </p>
                          {view.config.comparisonEnabled && view.config.comparisonRange && (
                            <p>
                              vs {format(new Date(view.config.comparisonRange.from), 'MMM d, yyyy')} - {format(new Date(view.config.comparisonRange.to), 'MMM d, yyyy')}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleLoadView(view)}
                        >
                          Load
                        </Button>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleSetDefault(view)} className="cursor-pointer">
                              <Star className={cn("h-4 w-4 mr-2", view.is_default && "text-yellow-500")} />
                              {view.is_default ? 'Remove Default' : 'Set as Default'}
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => handleDeleteView(view)}
                              className="text-destructive cursor-pointer"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </div>
  );
}
