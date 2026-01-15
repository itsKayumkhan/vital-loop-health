import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type { 
  MentalPerformanceAssessment, 
  MentalPerformanceTracking, 
  MentalPerformanceIntervention,
  ClientMentalIntervention,
  MentalPerformancePhenotype,
  MentalPerformanceTier 
} from '@/types/mentalPerformance';

// Hook for managing mental performance assessments
export function useMentalAssessments(clientId?: string) {
  const [assessments, setAssessments] = useState<MentalPerformanceAssessment[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchAssessments = useCallback(async () => {
    try {
      setLoading(true);
      let query = supabase
        .from('mental_performance_assessments')
        .select('*')
        .order('created_at', { ascending: false });

      if (clientId) {
        query = query.eq('client_id', clientId);
      }

      const { data, error } = await query;
      if (error) throw error;
      setAssessments(data as unknown as MentalPerformanceAssessment[]);
    } catch (error: any) {
      toast({
        title: 'Error fetching assessments',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [clientId, toast]);

  const createAssessment = async (clientId: string, data: Partial<MentalPerformanceAssessment>) => {
    try {
      const { error } = await supabase
        .from('mental_performance_assessments')
        .insert({ client_id: clientId, ...data });
      if (error) throw error;
      toast({ title: 'Assessment created successfully' });
      fetchAssessments();
    } catch (error: any) {
      toast({
        title: 'Error creating assessment',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const updateAssessment = async (assessmentId: string, data: Partial<MentalPerformanceAssessment>) => {
    try {
      const { error } = await supabase
        .from('mental_performance_assessments')
        .update(data)
        .eq('id', assessmentId);
      if (error) throw error;
      toast({ title: 'Assessment updated successfully' });
      fetchAssessments();
    } catch (error: any) {
      toast({
        title: 'Error updating assessment',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  useEffect(() => {
    fetchAssessments();
  }, [fetchAssessments]);

  return { assessments, loading, fetchAssessments, createAssessment, updateAssessment };
}

// Hook for managing mental performance tracking entries
export function useMentalTracking(clientId?: string) {
  const [entries, setEntries] = useState<MentalPerformanceTracking[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchEntries = useCallback(async (days: number = 30) => {
    try {
      setLoading(true);
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      let query = supabase
        .from('mental_performance_tracking')
        .select('*')
        .gte('entry_date', startDate.toISOString().split('T')[0])
        .order('entry_date', { ascending: false });

      if (clientId) {
        query = query.eq('client_id', clientId);
      }

      const { data, error } = await query;
      if (error) throw error;
      setEntries(data as unknown as MentalPerformanceTracking[]);
    } catch (error: any) {
      toast({
        title: 'Error fetching tracking entries',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [clientId, toast]);

  const addEntry = async (data: Partial<MentalPerformanceTracking>) => {
    try {
      const { error } = await supabase
        .from('mental_performance_tracking')
        .insert(data as any);
      if (error) throw error;
      toast({ title: 'Tracking entry added' });
      fetchEntries();
    } catch (error: any) {
      toast({
        title: 'Error adding entry',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  useEffect(() => {
    fetchEntries();
  }, [fetchEntries]);

  return { entries, loading, fetchEntries, addEntry };
}

// Hook for fetching mental performance interventions
export function useMentalInterventions() {
  const [interventions, setInterventions] = useState<MentalPerformanceIntervention[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchInterventions = useCallback(async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('mental_performance_interventions')
        .select('*')
        .eq('is_active', true)
        .order('sequence_order', { ascending: true });

      if (error) throw error;
      setInterventions(data as unknown as MentalPerformanceIntervention[]);
    } catch (error: any) {
      toast({
        title: 'Error fetching interventions',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const getRecommendedInterventions = (
    phenotype: MentalPerformancePhenotype | null,
    tier: MentalPerformanceTier
  ) => {
    return interventions.filter(intervention => {
      const matchesTier = intervention.program_tiers?.includes(tier);
      const matchesPhenotype = !phenotype || intervention.target_phenotypes?.includes(phenotype);
      return matchesTier && matchesPhenotype;
    });
  };

  useEffect(() => {
    fetchInterventions();
  }, [fetchInterventions]);

  return { interventions, loading, fetchInterventions, getRecommendedInterventions };
}

// Hook for managing client-specific mental interventions
export function useClientMentalInterventions(clientId: string) {
  const [clientInterventions, setClientInterventions] = useState<ClientMentalIntervention[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchClientInterventions = useCallback(async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('client_mental_interventions')
        .select('*')
        .eq('client_id', clientId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setClientInterventions(data as unknown as ClientMentalIntervention[]);
    } catch (error: any) {
      toast({
        title: 'Error fetching client interventions',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [clientId, toast]);

  const assignIntervention = async (interventionId: string, assessmentId?: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const { error } = await supabase
        .from('client_mental_interventions')
        .insert({
          client_id: clientId,
          intervention_id: interventionId,
          assessment_id: assessmentId,
          assigned_by: user?.id,
        });
      if (error) throw error;
      toast({ title: 'Intervention assigned successfully' });
      fetchClientInterventions();
    } catch (error: any) {
      toast({
        title: 'Error assigning intervention',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const updateInterventionStatus = async (id: string, status: string, notes?: string) => {
    try {
      const { error } = await supabase
        .from('client_mental_interventions')
        .update({ status, notes })
        .eq('id', id);
      if (error) throw error;
      toast({ title: 'Intervention updated' });
      fetchClientInterventions();
    } catch (error: any) {
      toast({
        title: 'Error updating intervention',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  useEffect(() => {
    fetchClientInterventions();
  }, [fetchClientInterventions]);

  return { clientInterventions, loading, fetchClientInterventions, assignIntervention, updateInterventionStatus };
}

// Hook for mental performance program statistics
export function useMentalProgramStats() {
  const [stats, setStats] = useState({
    totalAssessments: 0,
    activeClients: 0,
    phenotypeCounts: {} as Record<string, number>,
    tierCounts: {} as Record<string, number>,
    avgCognitiveScore: 0,
  });
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchStats = useCallback(async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('mental_performance_assessments')
        .select('*');

      if (error) throw error;

      const assessments = data as unknown as MentalPerformanceAssessment[];
      const uniqueClients = new Set(assessments.map(a => a.client_id));
      
      const phenotypeCounts: Record<string, number> = {};
      const tierCounts: Record<string, number> = {};
      let totalCognitiveScore = 0;
      let scoredCount = 0;

      assessments.forEach(assessment => {
        if (assessment.phenotype) {
          phenotypeCounts[assessment.phenotype] = (phenotypeCounts[assessment.phenotype] || 0) + 1;
        }
        tierCounts[assessment.program_tier] = (tierCounts[assessment.program_tier] || 0) + 1;
        
        if (assessment.cognitive_function_score !== null && assessment.cognitive_function_score !== undefined) {
          totalCognitiveScore += assessment.cognitive_function_score;
          scoredCount++;
        }
      });

      setStats({
        totalAssessments: assessments.length,
        activeClients: uniqueClients.size,
        phenotypeCounts,
        tierCounts,
        avgCognitiveScore: scoredCount > 0 ? Math.round(totalCognitiveScore / scoredCount) : 0,
      });
    } catch (error: any) {
      toast({
        title: 'Error fetching program stats',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return { stats, loading, fetchStats };
}
