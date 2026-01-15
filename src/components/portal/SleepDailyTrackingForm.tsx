import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { 
  Moon, 
  Sun, 
  Clock, 
  Activity, 
  Heart,
  Zap,
  CheckCircle2,
  ArrowLeft,
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

interface SleepDailyTrackingFormProps {
  onComplete: () => void;
  onCancel: () => void;
}

export function SleepDailyTrackingForm({ onComplete, onCancel }: SleepDailyTrackingFormProps) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    bedtime: '',
    wake_time: '',
    total_sleep_hours: 7,
    sleep_quality_rating: 5,
    sleep_onset_minutes: 15,
    night_awakenings: 0,
    morning_energy_rating: 5,
    mood_rating: 5,
    daytime_focus_rating: 5,
    stress_resilience_rating: 5,
    factors_affecting_sleep: '',
    notes: '',
  });

  const handleSliderChange = (field: string, value: number[]) => {
    setFormData(prev => ({ ...prev, [field]: value[0] }));
  };

  const handleInputChange = (field: string, value: string | number) => {
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
        .from('sleep_assessments')
        .select('id')
        .eq('client_id', clientData.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      const { error } = await supabase
        .from('sleep_tracking_entries')
        .insert({
          client_id: clientData.id,
          assessment_id: assessmentData?.id || null,
          entry_date: new Date().toISOString().split('T')[0],
          bedtime: formData.bedtime || null,
          wake_time: formData.wake_time || null,
          total_sleep_hours: formData.total_sleep_hours,
          sleep_quality_rating: formData.sleep_quality_rating,
          sleep_onset_minutes: formData.sleep_onset_minutes,
          night_awakenings: formData.night_awakenings,
          morning_energy_rating: formData.morning_energy_rating,
          mood_rating: formData.mood_rating,
          daytime_focus_rating: formData.daytime_focus_rating,
          stress_resilience_rating: formData.stress_resilience_rating,
          factors_affecting_sleep: formData.factors_affecting_sleep || null,
          notes: formData.notes || null,
        });

      if (error) throw error;

      toast.success('Sleep tracking entry logged successfully!');
      onComplete();
    } catch (error) {
      console.error('Error submitting sleep tracking:', error);
      toast.error('Failed to log sleep tracking entry');
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
            <Moon className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h2 className="text-xl font-bold">Daily Sleep Log</h2>
            <p className="text-sm text-muted-foreground">
              Track your sleep from last night
            </p>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Sleep Times */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Sleep Schedule
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Bedtime</Label>
                <Input
                  type="time"
                  value={formData.bedtime}
                  onChange={(e) => handleInputChange('bedtime', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Wake Time</Label>
                <Input
                  type="time"
                  value={formData.wake_time}
                  onChange={(e) => handleInputChange('wake_time', e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between">
                <Label>Total Sleep Hours</Label>
                <span className="text-sm font-medium">{formData.total_sleep_hours}h</span>
              </div>
              <Slider
                value={[formData.total_sleep_hours]}
                onValueChange={(v) => handleSliderChange('total_sleep_hours', v)}
                min={0}
                max={12}
                step={0.5}
              />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between">
                <Label>Time to Fall Asleep</Label>
                <span className="text-sm font-medium">{formData.sleep_onset_minutes} min</span>
              </div>
              <Slider
                value={[formData.sleep_onset_minutes]}
                onValueChange={(v) => handleSliderChange('sleep_onset_minutes', v)}
                min={0}
                max={120}
                step={5}
              />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between">
                <Label>Night Awakenings</Label>
                <span className="text-sm font-medium">{formData.night_awakenings}</span>
              </div>
              <Slider
                value={[formData.night_awakenings]}
                onValueChange={(v) => handleSliderChange('night_awakenings', v)}
                min={0}
                max={10}
                step={1}
              />
            </div>
          </CardContent>
        </Card>

        {/* Sleep Quality */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Activity className="h-4 w-4" />
              Sleep Quality
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between">
                <Label>Overall Sleep Quality</Label>
                <span className="text-sm font-medium">{formData.sleep_quality_rating}/10</span>
              </div>
              <Slider
                value={[formData.sleep_quality_rating]}
                onValueChange={(v) => handleSliderChange('sleep_quality_rating', v)}
                min={1}
                max={10}
                step={1}
              />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between">
                <Label>Morning Energy</Label>
                <span className="text-sm font-medium">{formData.morning_energy_rating}/10</span>
              </div>
              <Slider
                value={[formData.morning_energy_rating]}
                onValueChange={(v) => handleSliderChange('morning_energy_rating', v)}
                min={1}
                max={10}
                step={1}
              />
            </div>

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
          </CardContent>
        </Card>

        {/* Daytime Performance */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Sun className="h-4 w-4" />
              Daytime Performance
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between">
                <Label>Daytime Focus</Label>
                <span className="text-sm font-medium">{formData.daytime_focus_rating}/10</span>
              </div>
              <Slider
                value={[formData.daytime_focus_rating]}
                onValueChange={(v) => handleSliderChange('daytime_focus_rating', v)}
                min={1}
                max={10}
                step={1}
              />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between">
                <Label>Stress Resilience</Label>
                <span className="text-sm font-medium">{formData.stress_resilience_rating}/10</span>
              </div>
              <Slider
                value={[formData.stress_resilience_rating]}
                onValueChange={(v) => handleSliderChange('stress_resilience_rating', v)}
                min={1}
                max={10}
                step={1}
              />
            </div>
          </CardContent>
        </Card>

        {/* Notes */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Heart className="h-4 w-4" />
              Additional Notes
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Factors Affecting Sleep</Label>
              <Textarea
                placeholder="e.g., caffeine, stress, exercise, screen time..."
                value={formData.factors_affecting_sleep}
                onChange={(e) => handleInputChange('factors_affecting_sleep', e.target.value)}
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label>Notes</Label>
              <Textarea
                placeholder="Any other observations..."
                value={formData.notes}
                onChange={(e) => handleInputChange('notes', e.target.value)}
                rows={3}
              />
            </div>
          </CardContent>
        </Card>
      </div>

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
              Log Sleep Entry
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
