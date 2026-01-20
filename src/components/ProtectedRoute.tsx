import { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
    children: ReactNode;
    requireRole?: 'admin' | 'health_architect' | 'coach' | 'client';
    requireStaff?: boolean;
}

const ProtectedRoute = ({ children, requireRole, requireStaff }: ProtectedRouteProps) => {
    const { user, role, loading, isStaff } = useAuth();
    const location = useLocation();

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-secondary" />
            </div>
        );
    }

    if (!user) {
        return <Navigate to="/auth" state={{ from: location.pathname }} replace />;
    }

    // Role-based access checks
    if (requireStaff && !isStaff) {
        console.warn('Unauthorized staff access attempt');
        return <Navigate to="/portal" replace />;
    }

    if (requireRole) {
        const currentRole = role?.toLowerCase();
        if (currentRole !== requireRole && currentRole !== 'admin') {
            console.warn(`Unauthorized role access attempt: ${role} tried to access ${requireRole}`);
            return <Navigate to="/portal" replace />;
        }
    }

    return <>{children}</>;
};

export default ProtectedRoute;
