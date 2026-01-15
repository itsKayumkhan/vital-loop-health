import { useState, useCallback, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import type { 
  SleepAssessment, 
  SleepTrackingEntry, 
  SleepIntervention, 
  ClientSleepIntervention,
  SleepPhenotype,
  SleepProgramTier,
  SleepAssessmentStatus
} from '@/types/sleep';

// Hook for managing sleep assessments
export function useSleepAssessments(clientId?: string) {
  const [assessments, setAssessments] = useState<SleepAssessment[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchAssessments = useCallback(async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('sleep_assessments' as any)
        .select('*')
        .order('created_at', { ascending: false });

      if (clientId) {
        query = query.eq('client_id', clientId);
      }

      const { data, error } = await query;
      if (error) throw error;
      setAssessments((data || []) as unknown as SleepAssessment[]);
    } catch (err) {
      console.error('Error fetching sleep assessments:', err);
      toast.error('Failed to load sleep assessments');
    } finally {
      setLoading(false);
    }
  }, [clientId]);

  const createAssessment = useCallback(async (
    clientId: string,
    data: Partial<SleepAssessment>
  ) => {
    try {
      const { data: newAssessment, error } = await supabase
        .from('sleep_assessments' as any)
        .insert({ client_id: clientId, ...data })
        .select()
        .single();

      if (error) throw error;
      setAssessments(prev => [newAssessment as unknown as SleepAssessment, ...prev]);
      toast.success('Sleep assessment created');
      return newAssessment as unknown as SleepAssessment;
    } catch (err) {
      console.error('Error creating assessment:', err);
      toast.error('Failed to create assessment');
      throw err;
    }
  }, []);

  const updateAssessment = useCallback(async (
    assessmentId: string,
    data: Partial<SleepAssessment>
  ) => {
    try {
      const { data: updated, error } = await supabase
        .from('sleep_assessments' as any)
        .update(data)
        .eq('id', assessmentId)
        .select()
        .single();

      if (error) throw error;
      setAssessments(prev => 
        prev.map(a => a.id === assessmentId ? updated as unknown as SleepAssessment : a)
      );
      toast.success('Assessment updated');
      return updated as unknown as SleepAssessment;
    } catch (err) {
      console.error('Error updating assessment:', err);
      toast.error('Failed to update assessment');
      throw err;
    }
  }, []);

  useEffect(() => {
    fetchAssessments();
  }, [fetchAssessments]);

  return { assessments, loading, fetchAssessments, createAssessment, updateAssessment };
}

// Hook for managing sleep tracking entries
export function useSleepTracking(clientId?: string) {
  const [entries, setEntries] = useState<SleepTrackingEntry[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchEntries = useCallback(async (days: number = 30) => {
    setLoading(true);
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      let query = supabase
        .from('sleep_tracking_entries' as any)
        .select('*')
        .gte('entry_date', startDate.toISOString().split('T')[0])
        .order('entry_date', { ascending: false });

      if (clientId) {
        query = query.eq('client_id', clientId);
      }

      const { data, error } = await query;
      if (error) throw error;
      setEntries((data || []) as unknown as SleepTrackingEntry[]);
    } catch (err) {
      console.error('Error fetching tracking entries:', err);
      toast.error('Failed to load sleep data');
    } finally {
      setLoading(false);
    }
  }, [clientId]);

  const addEntry = useCallback(async (data: Partial<SleepTrackingEntry>) => {
    try {
      const { data: newEntry, error } = await supabase
        .from('sleep_tracking_entries' as any)
        .insert(data)
        .select()
        .single();

      if (error) throw error;
      setEntries(prev => [newEntry as unknown as SleepTrackingEntry, ...prev]);
      toast.success('Sleep data recorded');
      return newEntry as unknown as SleepTrackingEntry;
    } catch (err) {
      console.error('Error adding entry:', err);
      toast.error('Failed to save sleep data');
      throw err;
    }
  }, []);

  useEffect(() => {
    fetchEntries();
  }, [fetchEntries]);

  return { entries, loading, fetchEntries, addEntry };
}

// Hook for managing interventions
export function useSleepInterventions() {
  const [interventions, setInterventions] = useState<SleepIntervention[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchInterventions = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('sleep_interventions' as any)
        .select('*')
        .eq('is_active', true)
        .order('sequence_order', { ascending: true });

      if (error) throw error;
      setInterventions((data || []) as unknown as SleepIntervention[]);
    } catch (err) {
      console.error('Error fetching interventions:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const getRecommendedInterventions = useCallback((
    phenotype: SleepPhenotype | null,
    tier: SleepProgramTier
  ) => {
    return interventions.filter(intervention => {
      const tierMatch = intervention.program_tiers.includes(tier);
      const phenotypeMatch = !phenotype || 
        intervention.target_phenotypes.length === 0 ||
        intervention.target_phenotypes.includes(phenotype);
      return tierMatch && phenotypeMatch;
    });
  }, [interventions]);

  useEffect(() => {
    fetchInterventions();
  }, [fetchInterventions]);

  return { interventions, loading, fetchInterventions, getRecommendedInterventions };
}

// Hook for client-specific interventions
export function useClientInterventions(clientId?: string) {
  const [clientInterventions, setClientInterventions] = useState<ClientSleepIntervention[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchClientInterventions = useCallback(async () => {
    if (!clientId) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('client_sleep_interventions' as any)
        .select(`
          *,
          intervention:sleep_interventions(*)
        `)
        .eq('client_id', clientId)
        .order('start_date', { ascending: false });

      if (error) throw error;
      setClientInterventions((data || []) as unknown as ClientSleepIntervention[]);
    } catch (err) {
      console.error('Error fetching client interventions:', err);
    } finally {
      setLoading(false);
    }
  }, [clientId]);

  const assignIntervention = useCallback(async (
    interventionId: string,
    assessmentId?: string
  ) => {
    if (!clientId) return;
    try {
      const { data, error } = await supabase
        .from('client_sleep_interventions' as any)
        .insert({
          client_id: clientId,
          intervention_id: interventionId,
          assessment_id: assessmentId,
        })
        .select(`
          *,
          intervention:sleep_interventions(*)
        `)
        .single();

      if (error) throw error;
      setClientInterventions(prev => [data as unknown as ClientSleepIntervention, ...prev]);
      toast.success('Intervention assigned');
      return data as unknown as ClientSleepIntervention;
    } catch (err) {
      console.error('Error assigning intervention:', err);
      toast.error('Failed to assign intervention');
      throw err;
    }
  }, [clientId]);

  const updateInterventionStatus = useCallback(async (
    id: string,
    status: string,
    notes?: string
  ) => {
    try {
      const updates: any = { status };
      if (notes) updates.notes = notes;
      if (status === 'completed') updates.end_date = new Date().toISOString().split('T')[0];

      const { data, error } = await supabase
        .from('client_sleep_interventions' as any)
        .update(updates)
        .eq('id', id)
        .select(`
          *,
          intervention:sleep_interventions(*)
        `)
        .single();

      if (error) throw error;
      setClientInterventions(prev => 
        prev.map(ci => ci.id === id ? data as unknown as ClientSleepIntervention : ci)
      );
      toast.success('Intervention updated');
    } catch (err) {
      console.error('Error updating intervention:', err);
      toast.error('Failed to update intervention');
    }
  }, []);

  useEffect(() => {
    fetchClientInterventions();
  }, [fetchClientInterventions]);

  return { 
    clientInterventions, 
    loading, 
    fetchClientInterventions, 
    assignIntervention,
    updateInterventionStatus 
  };
}

// Aggregate stats hook for dashboard
export function useSleepProgramStats() {
  const [stats, setStats] = useState({
    totalAssessments: 0,
    activeClients: 0,
    byPhenotype: {} as Record<SleepPhenotype, number>,
    byTier: {} as Record<SleepProgramTier, number>,
    averageISI: 0,
    improvementRate: 0,
  });
  const [loading, setLoading] = useState(false);

  const fetchStats = useCallback(async () => {
    setLoading(true);
    try {
      const { data: assessments, error } = await supabase
        .from('sleep_assessments' as any)
        .select('*');

      if (error) throw error;

      const typedAssessments = (assessments || []) as unknown as SleepAssessment[];
      const activeClients = new Set(typedAssessments.filter(a => a.status !== 'completed').map(a => a.client_id)).size;
      
      const byPhenotype = typedAssessments.reduce((acc, a) => {
        if (a.phenotype) {
          acc[a.phenotype] = (acc[a.phenotype] || 0) + 1;
        }
        return acc;
      }, {} as Record<SleepPhenotype, number>);

      const byTier = typedAssessments.reduce((acc, a) => {
        acc[a.program_tier] = (acc[a.program_tier] || 0) + 1;
        return acc;
      }, {} as Record<SleepProgramTier, number>);

      const isiScores = typedAssessments.filter(a => a.isi_score).map(a => a.isi_score!);
      const averageISI = isiScores.length > 0 
        ? Math.round(isiScores.reduce((a, b) => a + b, 0) / isiScores.length)
        : 0;

      setStats({
        totalAssessments: typedAssessments.length,
        activeClients,
        byPhenotype,
        byTier,
        averageISI,
        improvementRate: 0, // Would require historical data comparison
      });
    } catch (err) {
      console.error('Error fetching stats:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return { stats, loading, fetchStats };
}
