import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Brain, 
  Target, 
  Zap, 
  Coffee,
  Activity,
  CheckCircle2,
  ArrowLeft,
  Smile,
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

interface MentalDailyTrackingFormProps {
  onComplete: () => void;
  onCancel: () => void;
}

export function MentalDailyTrackingForm({ onComplete, onCancel }: MentalDailyTrackingFormProps) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    focus_rating: 5,
    memory_rating: 5,
    mental_clarity_rating: 5,
    mental_energy_rating: 5,
    productivity_rating: 5,
    mood_rating: 5,
    stress_level: 5,
    anxiety_level: 5,
    deep_work_hours: 2,
    tasks_completed: 0,
    distractions_count: 5,
    caffeine_intake: 1,
    meditation_minutes: 0,
    exercise_completed: false,
    peak_focus_time: '',
    factors_affecting_cognition: '',
    notes: '',
  });

  const handleSliderChange = (field: string, value: number[]) => {
    setFormData(prev => ({ ...prev, [field]: value[0] }));
  };

  const handleInputChange = (field: string, value: string | number | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    if (!user) return;

    setLoading(true);
    try {
      // Get client ID
      const { data: clientData, error: clientError } = await supabase
        .from('crm_clients')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (clientError || !clientData) {
        toast.error('Client profile not found');
        return;
      }

      // Get latest assessment ID if exists
      const { data: assessmentData } = await supabase
        .from('mental_performance_assessments')
        .select('id')
        .eq('client_id', clientData.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      const { error } = await supabase
        .from('mental_performance_tracking')
        .insert({
          client_id: clientData.id,
          assessment_id: assessmentData?.id || null,
          entry_date: new Date().toISOString().split('T')[0],
          focus_rating: formData.focus_rating,
          memory_rating: formData.memory_rating,
          mental_clarity_rating: formData.mental_clarity_rating,
          mental_energy_rating: formData.mental_energy_rating,
          productivity_rating: formData.productivity_rating,
          mood_rating: formData.mood_rating,
          stress_level: formData.stress_level,
          anxiety_level: formData.anxiety_level,
          deep_work_hours: formData.deep_work_hours,
          tasks_completed: formData.tasks_completed,
          distractions_count: formData.distractions_count,
          caffeine_intake: formData.caffeine_intake,
          meditation_minutes: formData.meditation_minutes,
          exercise_completed: formData.exercise_completed,
          peak_focus_time: formData.peak_focus_time || null,
          factors_affecting_cognition: formData.factors_affecting_cognition || null,
          notes: formData.notes || null,
        });

      if (error) throw error;

      toast.success('Mental performance tracking logged successfully!');
      onComplete();
    } catch (error) {
      console.error('Error submitting mental tracking:', error);
      toast.error('Failed to log mental performance tracking');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={onCancel}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
            <Brain className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h2 className="text-xl font-bold">Daily Mental Log</h2>
            <p className="text-sm text-muted-foreground">
              Track your cognitive performance today
            </p>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Cognitive Metrics */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Brain className="h-4 w-4" />
              Cognitive Metrics
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between">
                <Label>Focus Quality</Label>
                <span className="text-sm font-medium">{formData.focus_rating}/10</span>
              </div>
              <Slider
                value={[formData.focus_rating]}
                onValueChange={(v) => handleSliderChange('focus_rating', v)}
                min={1}
                max={10}
                step={1}
              />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between">
                <Label>Memory Function</Label>
                <span className="text-sm font-medium">{formData.memory_rating}/10</span>
              </div>
              <Slider
                value={[formData.memory_rating]}
                onValueChange={(v) => handleSliderChange('memory_rating', v)}
                min={1}
                max={10}
                step={1}
              />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between">
                <Label>Mental Clarity</Label>
                <span className="text-sm font-medium">{formData.mental_clarity_rating}/10</span>
              </div>
              <Slider
                value={[formData.mental_clarity_rating]}
                onValueChange={(v) => handleSliderChange('mental_clarity_rating', v)}
                min={1}
                max={10}
                step={1}
              />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between">
                <Label>Mental Energy</Label>
                <span className="text-sm font-medium">{formData.mental_energy_rating}/10</span>
              </div>
              <Slider
                value={[formData.mental_energy_rating]}
                onValueChange={(v) => handleSliderChange('mental_energy_rating', v)}
                min={1}
                max={10}
                step={1}
              />
            </div>
          </CardContent>
        </Card>

        {/* Mood & Stress */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Smile className="h-4 w-4" />
              Mood & Stress
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between">
                <Label>Mood Rating</Label>
                <span className="text-sm font-medium">{formData.mood_rating}/10</span>
              </div>
              <Slider
                value={[formData.mood_rating]}
                onValueChange={(v) => handleSliderChange('mood_rating', v)}
                min={1}
                max={10}
                step={1}
              />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between">
                <Label>Stress Level</Label>
                <span className="text-sm font-medium">{formData.stress_level}/10</span>
              </div>
              <Slider
                value={[formData.stress_level]}
                onValueChange={(v) => handleSliderChange('stress_level', v)}
                min={1}
                max={10}
                step={1}
              />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between">
                <Label>Anxiety Level</Label>
                <span className="text-sm font-medium">{formData.anxiety_level}/10</span>
              </div>
              <Slider
                value={[formData.anxiety_level]}
                onValueChange={(v) => handleSliderChange('anxiety_level', v)}
                min={1}
                max={10}
                step={1}
              />
            </div>
          </CardContent>
        </Card>

        {/* Productivity */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Target className="h-4 w-4" />
              Productivity
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between">
                <Label>Productivity Rating</Label>
                <span className="text-sm font-medium">{formData.productivity_rating}/10</span>
              </div>
              <Slider
                value={[formData.productivity_rating]}
                onValueChange={(v) => handleSliderChange('productivity_rating', v)}
                min={1}
                max={10}
                step={1}
              />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between">
                <Label>Deep Work Hours</Label>
                <span className="text-sm font-medium">{formData.deep_work_hours}h</span>
              </div>
              <Slider
                value={[formData.deep_work_hours]}
                onValueChange={(v) => handleSliderChange('deep_work_hours', v)}
                min={0}
                max={12}
                step={0.5}
              />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between">
                <Label>Tasks Completed</Label>
                <span className="text-sm font-medium">{formData.tasks_completed}</span>
              </div>
              <Slider
                value={[formData.tasks_completed]}
                onValueChange={(v) => handleSliderChange('tasks_completed', v)}
                min={0}
                max={20}
                step={1}
              />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between">
                <Label>Distractions</Label>
                <span className="text-sm font-medium">{formData.distractions_count}</span>
              </div>
              <Slider
                value={[formData.distractions_count]}
                onValueChange={(v) => handleSliderChange('distractions_count', v)}
                min={0}
                max={20}
                step={1}
              />
            </div>
          </CardContent>
        </Card>

        {/* Lifestyle Factors */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Activity className="h-4 w-4" />
              Lifestyle Factors
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between">
                <Label className="flex items-center gap-2">
                  <Coffee className="h-4 w-4" />
                  Caffeine (cups)
                </Label>
                <span className="text-sm font-medium">{formData.caffeine_intake}</span>
              </div>
              <Slider
                value={[formData.caffeine_intake]}
                onValueChange={(v) => handleSliderChange('caffeine_intake', v)}
                min={0}
                max={10}
                step={1}
              />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between">
                <Label>Meditation (minutes)</Label>
                <span className="text-sm font-medium">{formData.meditation_minutes}</span>
              </div>
              <Slider
                value={[formData.meditation_minutes]}
                onValueChange={(v) => handleSliderChange('meditation_minutes', v)}
                min={0}
                max={120}
                step={5}
              />
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="exercise"
                checked={formData.exercise_completed}
                onCheckedChange={(checked) => handleInputChange('exercise_completed', checked as boolean)}
              />
              <Label htmlFor="exercise">Exercised today</Label>
            </div>

            <div className="space-y-2">
              <Label>Peak Focus Time</Label>
              <Input
                type="time"
                value={formData.peak_focus_time}
                onChange={(e) => handleInputChange('peak_focus_time', e.target.value)}
                placeholder="When did you feel most focused?"
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Notes Section */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Zap className="h-4 w-4" />
            Additional Notes
          </CardTitle>
        </CardHeader>
        <CardContent className="grid md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Factors Affecting Cognition</Label>
            <Textarea
              placeholder="e.g., poor sleep, stress, diet, environment..."
              value={formData.factors_affecting_cognition}
              onChange={(e) => handleInputChange('factors_affecting_cognition', e.target.value)}
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label>Notes</Label>
            <Textarea
              placeholder="Any other observations about your mental performance..."
              value={formData.notes}
              onChange={(e) => handleInputChange('notes', e.target.value)}
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      {/* Submit Button */}
      <div className="flex justify-end gap-3">
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button onClick={handleSubmit} disabled={loading}>
          {loading ? (
            'Saving...'
          ) : (
            <>
              <CheckCircle2 className="w-4 h-4 mr-2" />
              Log Mental Entry
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
