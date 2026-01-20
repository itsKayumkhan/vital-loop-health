
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { api } from '@/lib/api';
import { toast } from 'sonner';

interface UserProfile {
    full_name: string | null;
    email: string | null;
    phone: string | null;
}

interface Membership {
    id: string;
    tier: 'free' | 'essential' | 'premium' | 'elite';
    status: 'active' | 'paused' | 'cancelled' | 'expired';
    start_date: string;
    renewal_date: string | null;
    monthly_price: number | null;
}

interface Purchase {
    id: string;
    product_name: string;
    amount: number;
    currency: string;
    status: string;
    purchased_at: string;
    purchase_type: string;
}

interface FormSubmission {
    id: string;
    specialty: string;
    status: string;
    submitted_at: string;
}

interface Document {
    id: string;
    name: string;
    document_type: string;
    file_path: string;
    created_at: string;
}

interface Order {
    id: string;
    created_at: string;
    total_amount: number;
    status: string;
    currency: string;
    order_items: any[];
    billing_address?: any;
    shipping_address?: any;
}

interface UserContextType {
    profile: UserProfile | null;
    membership: Membership | null;
    purchases: Purchase[];
    submissions: FormSubmission[];
    documents: Document[];
    orders: Order[];
    assignedCoaches: { specialty: string; assigned_at: string }[];
    loading: boolean;
    refreshData: () => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { user } = useAuth();
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [membership, setMembership] = useState<Membership | null>(null);
    const [purchases, setPurchases] = useState<Purchase[]>([]);
    const [submissions, setSubmissions] = useState<FormSubmission[]>([]);
    const [documents, setDocuments] = useState<Document[]>([]);
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(false);
    const [isInitialized, setIsInitialized] = useState(false);
    const mounted = React.useRef(true);

    const abortControllerRef = React.useRef<AbortController | null>(null);

    // Track mounted state
    useEffect(() => {
        mounted.current = true;
        return () => {
            mounted.current = false;
        };
    }, []);

    const fetchData = useCallback(async (force = false) => {
        // Cancel any pending request
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
        }

        if (!user) {
            if (mounted.current) {
                setProfile(null);
                setMembership(null);
                setPurchases([]);
                setSubmissions([]);
                setDocuments([]);
                setOrders([]);
                setLoading(false);
            }
            return;
        }

        // Create new AbortController
        const controller = new AbortController();
        abortControllerRef.current = controller;

        // Auto-abort after 15 seconds to prevent hanging
        const timeoutId = setTimeout(() => {
            console.warn('UserContext fetch timed out, aborting...');
            controller.abort();
        }, 15000);

        if (mounted.current) setLoading(true);

        try {
            // Group 1: Core User Data and Client ID (Parallelized)
            const [
                profileData,
                submissionsData,
                ordersData,
                clientResult
            ] = await Promise.all([
                api.getUserProfile(user.id, controller.signal),
                api.getSubmissions(user.id, controller.signal),
                api.getOrders(user.id, controller.signal),
                api.getCRMClient(user.id, controller.signal)
            ]);

            let membershipData = null;
            let crmPurchasesData = null;
            let crmDocumentsData = null;

            if (clientResult?.id) {
                const [mem, pur, doc] = await Promise.all([
                    api.getCRMMembership(clientResult.id, controller.signal),
                    api.getCRMPurchases(clientResult.id, controller.signal),
                    api.getCRMDocuments(clientResult.id, controller.signal)
                ]);
                membershipData = mem;
                crmPurchasesData = pur;
                crmDocumentsData = doc;
            }

            if (!mounted.current || controller.signal.aborted) return;

            setProfile(profileData);
            if (membershipData && Array.isArray(membershipData) && membershipData.length > 0) {
                setMembership(membershipData[0] as Membership);
            } else {
                setMembership(null);
            }
            setPurchases(crmPurchasesData as Purchase[] || []);
            setSubmissions(submissionsData || []);
            setDocuments(crmDocumentsData as Document[] || []);
            setOrders(ordersData as Order[] || []);

            setIsInitialized(true);
        } catch (error: any) {
            if (error.name !== 'AbortError') {
                console.error('Error fetching context user data:', error);
            }
        } finally {
            clearTimeout(timeoutId);
            if (mounted.current && abortControllerRef.current === controller) {
                setLoading(false);
                setIsInitialized(true);
                // Don't nullify ref here immediately if we want to keep specific controller logic,
                // but clearing it is safe if we are done.
                if (abortControllerRef.current === controller) {
                    abortControllerRef.current = null;
                }
            }
        }
    }, [user]);

    useEffect(() => {
        fetchData();

        return () => {
            if (abortControllerRef.current) {
                abortControllerRef.current.abort();
            }
        };
    }, [fetchData]);

    const assignedCoaches = submissions
        ?.filter(s => s.status === 'assigned' || s.status === 'completed')
        .map(s => ({ specialty: s.specialty, assigned_at: s.submitted_at })) || [];

    return (
        <UserContext.Provider value={{
            profile,
            membership,
            purchases,
            submissions,
            documents,
            orders,
            assignedCoaches,
            loading: loading || (!!user && !isInitialized),
            refreshData: () => fetchData(true)
        }}>
            {children}
        </UserContext.Provider>
    );
};

export const useUser = () => {
    const context = useContext(UserContext);
    if (context === undefined) {
        throw new Error('useUser must be used within a UserProvider');
    }
    return context;
};
