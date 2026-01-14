import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Loader2, Star } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface SatisfactionSurveyFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  clientId: string;
  clientName: string;
  coachId: string;
  coachName: string;
}

const surveyTypes = [
  { value: 'session', label: 'Session Feedback' },
  { value: 'monthly', label: 'Monthly Review' },
  { value: 'general', label: 'General Feedback' },
  { value: 'program_completion', label: 'Program Completion' },
];

const ratingLabels: Record<number, string> = {
  1: 'Poor',
  2: 'Fair',
  3: 'Good',
  4: 'Very Good',
  5: 'Excellent',
};

export function SatisfactionSurveyForm({
  open,
  onOpenChange,
  clientId,
  clientName,
  coachId,
  coachName,
}: SatisfactionSurveyFormProps) {
  const queryClient = useQueryClient();
  const [rating, setRating] = useState<number>(0);
  const [hoveredRating, setHoveredRating] = useState<number>(0);
  const [feedback, setFeedback] = useState('');
  const [surveyType, setSurveyType] = useState('general');
  const [sessionDate, setSessionDate] = useState<Date | undefined>(undefined);

  const submitSurvey = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from('coach_satisfaction_surveys')
        .insert({
          client_id: clientId,
          coach_id: coachId,
          rating,
          feedback: feedback.trim() || null,
          survey_type: surveyType,
          session_date: sessionDate ? format(sessionDate, 'yyyy-MM-dd') : null,
        });
      
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Survey submitted successfully');
      queryClient.invalidateQueries({ queryKey: ['coach-satisfaction-surveys'] });
      queryClient.invalidateQueries({ queryKey: ['coach-ratings'] });
      resetForm();
      onOpenChange(false);
    },
    onError: (error: any) => {
      toast.error('Failed to submit survey', { description: error.message });
    },
  });

  const resetForm = () => {
    setRating(0);
    setFeedback('');
    setSurveyType('general');
    setSessionDate(undefined);
    setHoveredRating(0);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) {
      toast.error('Please select a rating');
      return;
    }
    submitSurvey.mutate();
  };

  const displayRating = hoveredRating || rating;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Coach Satisfaction Survey</DialogTitle>
          <DialogDescription>
            Rate your experience with <span className="font-medium">{coachName}</span> for client{' '}
            <span className="font-medium">{clientName}</span>
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Survey Type */}
          <div className="space-y-2">
            <Label>Survey Type</Label>
            <Select value={surveyType} onValueChange={setSurveyType}>
              <SelectTrigger>
                <SelectValue placeholder="Select survey type" />
              </SelectTrigger>
              <SelectContent>
                {surveyTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Session Date (optional) */}
          {surveyType === 'session' && (
            <div className="space-y-2">
              <Label>Session Date (Optional)</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      'w-full justify-start text-left font-normal',
                      !sessionDate && 'text-muted-foreground'
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {sessionDate ? format(sessionDate, 'PPP') : 'Pick a date'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={sessionDate}
                    onSelect={setSessionDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          )}

          {/* Star Rating */}
          <div className="space-y-2">
            <Label>Rating *</Label>
            <div className="flex flex-col items-center gap-2">
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    className="p-1 transition-transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-primary rounded"
                    onMouseEnter={() => setHoveredRating(star)}
                    onMouseLeave={() => setHoveredRating(0)}
                    onClick={() => setRating(star)}
                  >
                    <Star
                      className={cn(
                        'h-8 w-8 transition-colors',
                        star <= displayRating
                          ? 'fill-yellow-400 text-yellow-400'
                          : 'text-muted-foreground'
                      )}
                    />
                  </button>
                ))}
              </div>
              {displayRating > 0 && (
                <span className="text-sm font-medium text-muted-foreground">
                  {ratingLabels[displayRating]}
                </span>
              )}
            </div>
          </div>

          {/* Feedback */}
          <div className="space-y-2">
            <Label htmlFor="feedback">Feedback (Optional)</Label>
            <Textarea
              id="feedback"
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="Share your experience..."
              rows={4}
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                resetForm();
                onOpenChange(false);
              }}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={submitSurvey.isPending || rating === 0}>
              {submitSurvey.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                'Submit Survey'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
