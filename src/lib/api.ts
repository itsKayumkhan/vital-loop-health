
import { supabase } from '@/integrations/supabase/client';

export type CancellationError = Error & { name: 'AbortError' };

export const api = {
    getUserProfile: async (userId: string, signal?: AbortSignal) => {
        const { data, error } = await supabase
            .from('profiles')
            .select('full_name, email, phone')
            .eq('user_id', userId)
            .maybeSingle()
            .abortSignal(signal!);

        if (error) throw error;
        return data;
    },

    getSubmissions: async (userId: string, signal?: AbortSignal) => {
        const { data, error } = await supabase
            .from('coach_intake_forms')
            .select('id, specialty, status, submitted_at')
            .eq('user_id', userId)
            .order('submitted_at', { ascending: false })
            .abortSignal(signal!);

        if (error) throw error;
        return data;
    },

    getOrders: async (userId: string, signal?: AbortSignal) => {
        const { data, error } = await supabase
            .from('orders')
            .select('*, order_items(*)')
            .eq('customer_id', userId)
            .neq('status', 'Pending')
            .order('created_at', { ascending: false })
            .abortSignal(signal!);

        if (error) throw error;
        return data;
    },

    getCRMClient: async (userId: string, signal?: AbortSignal) => {
        const { data, error } = await supabase
            .from('crm_clients')
            .select('id')
            .eq('user_id', userId)
            .maybeSingle()
            .abortSignal(signal!);

        if (error) throw error;
        return data;
    },

    getCRMMembership: async (clientId: string, signal?: AbortSignal) => {
        const { data, error } = await supabase
            .from('crm_memberships')
            .select('*')
            .eq('client_id', clientId)
            .eq('status', 'active')
            .order('start_date', { ascending: false })
            .limit(1)
            .abortSignal(signal!);

        if (error) throw error;
        return data;
    },

    getCRMPurchases: async (clientId: string, signal?: AbortSignal) => {
        const { data, error } = await supabase
            .from('crm_purchases')
            .select('*')
            .eq('client_id', clientId)
            .order('purchased_at', { ascending: false })
            .limit(10)
            .abortSignal(signal!);

        if (error) throw error;
        return data;
    },

    getCRMDocuments: async (clientId: string, signal?: AbortSignal) => {
        const { data, error } = await supabase
            .from('crm_documents')
            .select('*')
            .eq('client_id', clientId)
            .eq('shared_with_client', true)
            .order('created_at', { ascending: false })
            .abortSignal(signal!);

        if (error) throw error;
        return data;
    }
};
