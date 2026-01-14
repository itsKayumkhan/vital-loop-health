import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

export type SavedViewConfig = {
  dateRange: {
    from: string;
    to: string;
  };
  comparisonEnabled: boolean;
  comparisonRange?: {
    from: string;
    to: string;
  } | null;
  preset?: string;
  comparisonPreset?: string;
};

export type SavedView = {
  id: string;
  name: string;
  description: string | null;
  config: SavedViewConfig;
  is_default: boolean;
  created_at: string;
  updated_at: string;
};

export function useSavedViews() {
  const { user } = useAuth();
  const [savedViews, setSavedViews] = useState<SavedView[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchSavedViews = useCallback(async () => {
    if (!user) {
      setSavedViews([]);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('crm_saved_views')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Type assertion since config comes as Json from Supabase
      setSavedViews((data || []).map(view => ({
        ...view,
        config: view.config as SavedViewConfig,
      })));
    } catch (error) {
      console.error('Error fetching saved views:', error);
      toast.error('Failed to load saved views');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchSavedViews();
  }, [fetchSavedViews]);

  const createView = useCallback(async (
    name: string, 
    config: SavedViewConfig, 
    description?: string
  ): Promise<SavedView | null> => {
    if (!user) {
      toast.error('You must be logged in to save views');
      return null;
    }

    try {
      const { data, error } = await supabase
        .from('crm_saved_views')
        .insert([{
          user_id: user.id,
          name,
          description: description || null,
          config: config as unknown as Record<string, never>,
          is_default: false,
        }])
        .select()
        .single();

      if (error) throw error;

      const newView = {
        ...data,
        config: data.config as unknown as SavedViewConfig,
      };
      
      setSavedViews(prev => [newView, ...prev]);
      toast.success('View saved successfully');
      return newView;
    } catch (error) {
      console.error('Error creating view:', error);
      toast.error('Failed to save view');
      return null;
    }
  }, [user]);

  const updateView = useCallback(async (
    id: string, 
    updates: Partial<Pick<SavedView, 'name' | 'description' | 'config' | 'is_default'>>
  ): Promise<boolean> => {
    if (!user) {
      toast.error('You must be logged in to update views');
      return false;
    }

    try {
      // If setting as default, unset other defaults first
      if (updates.is_default) {
        await supabase
          .from('crm_saved_views')
          .update({ is_default: false })
          .eq('user_id', user.id)
          .neq('id', id);
      }

      const updateData: Record<string, unknown> = {};
      if (updates.name !== undefined) updateData.name = updates.name;
      if (updates.description !== undefined) updateData.description = updates.description;
      if (updates.is_default !== undefined) updateData.is_default = updates.is_default;
      if (updates.config !== undefined) updateData.config = updates.config;

      const { error } = await supabase
        .from('crm_saved_views')
        .update(updateData)
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;

      setSavedViews(prev => prev.map(view => {
        if (view.id === id) {
          return { ...view, ...updates };
        }
        if (updates.is_default) {
          return { ...view, is_default: false };
        }
        return view;
      }));

      toast.success('View updated');
      return true;
    } catch (error) {
      console.error('Error updating view:', error);
      toast.error('Failed to update view');
      return false;
    }
  }, [user]);

  const deleteView = useCallback(async (id: string): Promise<boolean> => {
    if (!user) {
      toast.error('You must be logged in to delete views');
      return false;
    }

    try {
      const { error } = await supabase
        .from('crm_saved_views')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;

      setSavedViews(prev => prev.filter(view => view.id !== id));
      toast.success('View deleted');
      return true;
    } catch (error) {
      console.error('Error deleting view:', error);
      toast.error('Failed to delete view');
      return false;
    }
  }, [user]);

  const getDefaultView = useCallback((): SavedView | undefined => {
    return savedViews.find(view => view.is_default);
  }, [savedViews]);

  return {
    savedViews,
    loading,
    createView,
    updateView,
    deleteView,
    getDefaultView,
    refetch: fetchSavedViews,
  };
}
