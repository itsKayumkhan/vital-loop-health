import { useState, useEffect, createContext, useContext, ReactNode, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User, Session } from '@supabase/supabase-js';

type UserRole = 'admin' | 'health_architect' | 'coach' | 'client';

interface AuthContextType {
    user: User | null;
    session: Session | null;
    role: UserRole | null;
    loading: boolean;
    signUp: (email: string, password: string, fullName: string) => Promise<{ error: Error | null }>;
    signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
    signOut: () => Promise<void>;
    isStaff: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [session, setSession] = useState<Session | null>(null);
    const [role, setRole] = useState<UserRole | null>(null);
    const [loading, setLoading] = useState(true);

    // Refs to track state inside useEffect without dependencies issues
    const userIdRef = useRef<string | undefined>(undefined);
    const roleRef = useRef<UserRole | null>(null);

    // Update refs when state changes
    useEffect(() => {
        userIdRef.current = user?.id;
    }, [user]);

    useEffect(() => {
        roleRef.current = role;
    }, [role]);

    useEffect(() => {
        let mounted = true;

        const fetchRole = async (userId: string) => {
            try {
                const { data } = await supabase.rpc('get_user_role', {
                    _user_id: userId
                });
                if (mounted) {
                    setRole(data as UserRole);
                }
            } catch (err) {
                console.error("Error fetching role:", err);
            } finally {
                if (mounted) {
                    setLoading(false);
                }
            }
        };

        // Initialize session
        const initSession = async () => {
            try {
                const { data: { session } } = await supabase.auth.getSession();
                if (mounted) {
                    setSession(session);
                    setUser(session?.user ?? null);
                    if (session?.user) {
                        await fetchRole(session.user.id);
                    } else {
                        setLoading(false);
                    }
                }
            } catch (error) {
                console.error("Error initializing session:", error);
                if (mounted) setLoading(false);
            }
        };

        initSession();

        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            async (event, session) => {
                if (!mounted) return;

                // Handle token refresh specifically - just update session/user without triggering loading state (which unmounts app)
                if (event === 'TOKEN_REFRESHED') {
                    setSession(session);
                    setUser(session?.user ?? null);
                    return;
                }

                setSession(session);
                const newUser = session?.user ?? null;

                // Use refs to get the CURRENT state, not the state at closure creation time
                const previousUserId = userIdRef.current;
                const currentRole = roleRef.current;

                // Prevent unnecessary updates if user ID and basic fields haven't changed
                // This prevents context thrashing which aborts API calls
                const userChanged =
                    (newUser?.id !== previousUserId) ||
                    (newUser === null && previousUserId !== undefined) ||
                    (newUser !== null && previousUserId === undefined);

                if (userChanged) {
                    setUser(newUser);
                }

                if (newUser) {
                    // Only set loading and fetch role if:
                    // 1. It's a new user (different ID than before)
                    // 2. OR we don't have a role yet
                    // 3. OR it's a SIGNED_IN event (explicit login)
                    const shouldFetchRole = !currentRole || newUser.id !== previousUserId || event === 'SIGNED_IN';

                    if (shouldFetchRole) {
                        setLoading(true);
                        await fetchRole(newUser.id);
                    }
                } else {
                    setRole(null);
                    setLoading(false);
                }
            }
        );

        return () => {
            mounted = false;
            subscription.unsubscribe();
        };
    }, []);

    const signUp = async (email: string, password: string, fullName: string) => {
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    full_name: fullName,
                },
            },
        });
        return { data, error };
    };

    const signIn = async (email: string, password: string) => {
        const { error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });
        return { error };
    };

    const signOut = async () => {
        await supabase.auth.signOut();
    };

    const isStaff = role === 'admin' || role === 'health_architect' || role === 'coach';

    return (
        <AuthContext.Provider value={{
            user,
            session,
            role,
            loading,
            signUp,
            signIn,
            signOut,
            isStaff,
        }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
