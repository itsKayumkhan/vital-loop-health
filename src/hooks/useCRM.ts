import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { RealtimeChannel } from '@supabase/supabase-js';
import { 
  CRMClient, 
  CRMMembership, 
  CRMPurchase, 
  CRMDocument, 
  CRMClientNote,
  CRMMarketingCampaign,
  CRMCampaignEnrollment
} from '@/types/crm';
import { toast } from 'sonner';

type RealtimeSubscriptionOptions = {
  enabled?: boolean;
  onUpdate?: () => void;
};

export function useCRMClients(options: RealtimeSubscriptionOptions = {}) {
  const { enabled: realtimeEnabled = false, onUpdate } = options;
  const [clients, setClients] = useState<CRMClient[]>([]);
  const [loading, setLoading] = useState(true);
  const channelRef = useRef<RealtimeChannel | null>(null);

  const fetchClients = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('crm_clients')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      toast.error('Failed to load clients');
      console.error(error);
    } else {
      setClients(data as CRMClient[]);
    }
    setLoading(false);
  }, []);

  const createClient = async (client: Partial<CRMClient>) => {
    const { data, error } = await supabase
      .from('crm_clients')
      .insert([client as any])
      .select()
      .single();
    
    if (error) {
      toast.error('Failed to create client');
      throw error;
    }
    toast.success('Client created successfully');
    if (!realtimeEnabled) await fetchClients();
    return data;
  };

  const updateClient = async (id: string, updates: Partial<CRMClient>) => {
    const { error } = await supabase
      .from('crm_clients')
      .update(updates)
      .eq('id', id);
    
    if (error) {
      toast.error('Failed to update client');
      throw error;
    }
    toast.success('Client updated successfully');
    if (!realtimeEnabled) await fetchClients();
  };

  const deleteClient = async (id: string) => {
    const { error } = await supabase
      .from('crm_clients')
      .delete()
      .eq('id', id);
    
    if (error) {
      toast.error('Failed to delete client');
      throw error;
    }
    toast.success('Client deleted successfully');
    if (!realtimeEnabled) await fetchClients();
  };

  // Set up realtime subscription
  useEffect(() => {
    if (!realtimeEnabled) return;

    channelRef.current = supabase
      .channel('crm-clients-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'crm_clients',
        },
        (payload) => {
          console.log('Realtime client change:', payload.eventType);
          
          if (payload.eventType === 'INSERT') {
            setClients(prev => [payload.new as CRMClient, ...prev]);
          } else if (payload.eventType === 'UPDATE') {
            setClients(prev => prev.map(c => 
              c.id === (payload.new as CRMClient).id ? payload.new as CRMClient : c
            ));
          } else if (payload.eventType === 'DELETE') {
            setClients(prev => prev.filter(c => c.id !== (payload.old as CRMClient).id));
          }
          
          onUpdate?.();
        }
      )
      .subscribe();

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
      }
    };
  }, [realtimeEnabled, onUpdate]);

  useEffect(() => {
    fetchClients();
  }, [fetchClients]);

  return { clients, loading, fetchClients, createClient, updateClient, deleteClient };
}

export function useCRMMemberships(clientId?: string, options: RealtimeSubscriptionOptions = {}) {
  const { enabled: realtimeEnabled = false, onUpdate } = options;
  const [memberships, setMemberships] = useState<CRMMembership[]>([]);
  const [loading, setLoading] = useState(true);
  const channelRef = useRef<RealtimeChannel | null>(null);

  const fetchMemberships = useCallback(async () => {
    setLoading(true);
    let query = supabase.from('crm_memberships').select('*');
    if (clientId) query = query.eq('client_id', clientId);
    
    const { data, error } = await query.order('created_at', { ascending: false });
    
    if (error) {
      toast.error('Failed to load memberships');
      console.error(error);
    } else {
      setMemberships(data as CRMMembership[]);
    }
    setLoading(false);
  }, [clientId]);

  const createMembership = async (membership: Partial<CRMMembership>) => {
    const { data, error } = await supabase
      .from('crm_memberships')
      .insert([membership as any])
      .select()
      .single();
    
    if (error) {
      toast.error('Failed to create membership');
      throw error;
    }
    toast.success('Membership created successfully');
    if (!realtimeEnabled) await fetchMemberships();
    return data;
  };

  const updateMembership = async (id: string, updates: Partial<CRMMembership>) => {
    const { error } = await supabase
      .from('crm_memberships')
      .update(updates)
      .eq('id', id);
    
    if (error) {
      toast.error('Failed to update membership');
      throw error;
    }
    toast.success('Membership updated successfully');
    if (!realtimeEnabled) await fetchMemberships();
  };

  // Set up realtime subscription
  useEffect(() => {
    if (!realtimeEnabled) return;

    channelRef.current = supabase
      .channel('crm-memberships-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'crm_memberships',
        },
        (payload) => {
          console.log('Realtime membership change:', payload.eventType);
          
          if (payload.eventType === 'INSERT') {
            const newMembership = payload.new as CRMMembership;
            if (!clientId || newMembership.client_id === clientId) {
              setMemberships(prev => [newMembership, ...prev]);
            }
          } else if (payload.eventType === 'UPDATE') {
            setMemberships(prev => prev.map(m => 
              m.id === (payload.new as CRMMembership).id ? payload.new as CRMMembership : m
            ));
          } else if (payload.eventType === 'DELETE') {
            setMemberships(prev => prev.filter(m => m.id !== (payload.old as CRMMembership).id));
          }
          
          onUpdate?.();
        }
      )
      .subscribe();

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
      }
    };
  }, [realtimeEnabled, clientId, onUpdate]);

  useEffect(() => {
    fetchMemberships();
  }, [fetchMemberships]);

  return { memberships, loading, fetchMemberships, createMembership, updateMembership };
}

export function useCRMPurchases(clientId?: string, options: RealtimeSubscriptionOptions = {}) {
  const { enabled: realtimeEnabled = false, onUpdate } = options;
  const [purchases, setPurchases] = useState<CRMPurchase[]>([]);
  const [loading, setLoading] = useState(true);
  const channelRef = useRef<RealtimeChannel | null>(null);

  const fetchPurchases = useCallback(async () => {
    setLoading(true);
    let query = supabase.from('crm_purchases').select('*');
    if (clientId) query = query.eq('client_id', clientId);
    
    const { data, error } = await query.order('purchased_at', { ascending: false });
    
    if (error) {
      toast.error('Failed to load purchases');
      console.error(error);
    } else {
      setPurchases(data as CRMPurchase[]);
    }
    setLoading(false);
  }, [clientId]);

  const createPurchase = async (purchase: Partial<CRMPurchase>) => {
    const { data, error } = await supabase
      .from('crm_purchases')
      .insert([purchase as any])
      .select()
      .single();
    
    if (error) {
      toast.error('Failed to create purchase');
      throw error;
    }
    toast.success('Purchase recorded successfully');
    if (!realtimeEnabled) await fetchPurchases();
    return data;
  };

  // Set up realtime subscription
  useEffect(() => {
    if (!realtimeEnabled) return;

    channelRef.current = supabase
      .channel('crm-purchases-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'crm_purchases',
        },
        (payload) => {
          console.log('Realtime purchase change:', payload.eventType);
          
          if (payload.eventType === 'INSERT') {
            const newPurchase = payload.new as CRMPurchase;
            if (!clientId || newPurchase.client_id === clientId) {
              setPurchases(prev => [newPurchase, ...prev]);
            }
          } else if (payload.eventType === 'UPDATE') {
            setPurchases(prev => prev.map(p => 
              p.id === (payload.new as CRMPurchase).id ? payload.new as CRMPurchase : p
            ));
          } else if (payload.eventType === 'DELETE') {
            setPurchases(prev => prev.filter(p => p.id !== (payload.old as CRMPurchase).id));
          }
          
          onUpdate?.();
        }
      )
      .subscribe();

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
      }
    };
  }, [realtimeEnabled, clientId, onUpdate]);

  useEffect(() => {
    fetchPurchases();
  }, [fetchPurchases]);

  return { purchases, loading, fetchPurchases, createPurchase };
}

export function useCRMDocuments(clientId?: string) {
  const [documents, setDocuments] = useState<CRMDocument[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchDocuments = async () => {
    setLoading(true);
    let query = supabase.from('crm_documents').select('*');
    if (clientId) query = query.eq('client_id', clientId);
    
    const { data, error } = await query.order('created_at', { ascending: false });
    
    if (error) {
      toast.error('Failed to load documents');
      console.error(error);
    } else {
      setDocuments(data as CRMDocument[]);
    }
    setLoading(false);
  };

  const uploadDocument = async (
    clientId: string,
    file: File,
    documentType: string,
    description?: string
  ) => {
    const filePath = `${clientId}/${Date.now()}-${file.name}`;
    
    const { error: uploadError } = await supabase.storage
      .from('crm-documents')
      .upload(filePath, file);
    
    if (uploadError) {
      toast.error('Failed to upload file');
      throw uploadError;
    }

    const { data, error } = await supabase
      .from('crm_documents')
      .insert([{
        client_id: clientId,
        document_type: documentType,
        name: file.name,
        description,
        file_path: filePath,
        file_size: file.size,
        mime_type: file.type,
      }] as any)
      .select()
      .single();
    
    if (error) {
      toast.error('Failed to save document record');
      throw error;
    }
    toast.success('Document uploaded successfully');
    await fetchDocuments();
    return data;
  };

  const deleteDocument = async (id: string, filePath: string) => {
    await supabase.storage.from('crm-documents').remove([filePath]);
    
    const { error } = await supabase
      .from('crm_documents')
      .delete()
      .eq('id', id);
    
    if (error) {
      toast.error('Failed to delete document');
      throw error;
    }
    toast.success('Document deleted successfully');
    await fetchDocuments();
  };

  const getDocumentUrl = (filePath: string) => {
    const { data } = supabase.storage.from('crm-documents').getPublicUrl(filePath);
    return data.publicUrl;
  };

  useEffect(() => {
    fetchDocuments();
  }, [clientId]);

  return { documents, loading, fetchDocuments, uploadDocument, deleteDocument, getDocumentUrl };
}

export function useCRMClientNotes(clientId?: string) {
  const [notes, setNotes] = useState<CRMClientNote[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchNotes = async () => {
    setLoading(true);
    let query = supabase.from('crm_client_notes').select('*');
    if (clientId) query = query.eq('client_id', clientId);
    
    const { data, error } = await query.order('created_at', { ascending: false });
    
    if (error) {
      toast.error('Failed to load notes');
      console.error(error);
    } else {
      setNotes(data as CRMClientNote[]);
    }
    setLoading(false);
  };

  const createNote = async (note: Partial<CRMClientNote>) => {
    const { data, error } = await supabase
      .from('crm_client_notes')
      .insert([note as any])
      .select()
      .single();
    
    if (error) {
      toast.error('Failed to create note');
      throw error;
    }
    toast.success('Note added successfully');
    await fetchNotes();
    return data;
  };

  const updateNote = async (id: string, updates: Partial<CRMClientNote>) => {
    const { error } = await supabase
      .from('crm_client_notes')
      .update(updates)
      .eq('id', id);
    
    if (error) {
      toast.error('Failed to update note');
      throw error;
    }
    await fetchNotes();
  };

  const deleteNote = async (id: string) => {
    const { error } = await supabase
      .from('crm_client_notes')
      .delete()
      .eq('id', id);
    
    if (error) {
      toast.error('Failed to delete note');
      throw error;
    }
    toast.success('Note deleted');
    await fetchNotes();
  };

  useEffect(() => {
    fetchNotes();
  }, [clientId]);

  return { notes, loading, fetchNotes, createNote, updateNote, deleteNote };
}

export function useCRMCampaigns() {
  const [campaigns, setCampaigns] = useState<CRMMarketingCampaign[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCampaigns = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('crm_marketing_campaigns')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      toast.error('Failed to load campaigns');
      console.error(error);
    } else {
      setCampaigns(data as CRMMarketingCampaign[]);
    }
    setLoading(false);
  };

  const createCampaign = async (campaign: Partial<CRMMarketingCampaign>) => {
    const { data, error } = await supabase
      .from('crm_marketing_campaigns')
      .insert([campaign as any])
      .select()
      .single();
    
    if (error) {
      toast.error('Failed to create campaign');
      throw error;
    }
    toast.success('Campaign created successfully');
    await fetchCampaigns();
    return data;
  };

  const updateCampaign = async (id: string, updates: Partial<CRMMarketingCampaign>) => {
    const { error } = await supabase
      .from('crm_marketing_campaigns')
      .update(updates)
      .eq('id', id);
    
    if (error) {
      toast.error('Failed to update campaign');
      throw error;
    }
    toast.success('Campaign updated successfully');
    await fetchCampaigns();
  };

  useEffect(() => {
    fetchCampaigns();
  }, []);

  return { campaigns, loading, fetchCampaigns, createCampaign, updateCampaign };
}

export function useCRMCampaignEnrollments(campaignId?: string) {
  const [enrollments, setEnrollments] = useState<CRMCampaignEnrollment[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchEnrollments = async () => {
    setLoading(true);
    let query = supabase.from('crm_campaign_enrollments').select('*');
    if (campaignId) query = query.eq('campaign_id', campaignId);
    
    const { data, error } = await query.order('enrolled_at', { ascending: false });
    
    if (error) {
      toast.error('Failed to load enrollments');
      console.error(error);
    } else {
      setEnrollments(data as CRMCampaignEnrollment[]);
    }
    setLoading(false);
  };

  const enrollClient = async (campaignId: string, clientId: string) => {
    const { data, error } = await supabase
      .from('crm_campaign_enrollments')
      .insert({ campaign_id: campaignId, client_id: clientId })
      .select()
      .single();
    
    if (error) {
      toast.error('Failed to enroll client');
      throw error;
    }
    toast.success('Client enrolled in campaign');
    await fetchEnrollments();
    return data;
  };

  useEffect(() => {
    fetchEnrollments();
  }, [campaignId]);

  return { enrollments, loading, fetchEnrollments, enrollClient };
}
