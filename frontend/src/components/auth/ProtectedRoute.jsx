import React, { useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import useAuthStore from '../../store/useAuthStore';

const ProtectedRoute = ({ children, allowedRoles }) => {
    const user = useAuthStore(state => state.user);
    const initializeAuth = useAuthStore(state => state.initializeAuth);
    const token = useAuthStore(state => state.token) || localStorage.getItem('superdott_token');

    useEffect(() => {
        initializeAuth();
    }, [initializeAuth]);

    if (!token) {
        return <Navigate to="/" replace />;
    }

    // Se o token existe mas o usuário ainda está sendo decodificado
    if (!user) {
        return (
            <div className="min-h-screen bg-surface-container-lowest flex flex-col items-center justify-center gap-3">
                <span className="w-10 h-10 border-4 border-teal-custom border-t-transparent rounded-full animate-spin"></span>
                <p className="text-sm font-semibold text-primary-navy/70">Autenticando sessão...</p>
            </div>
        );
    }

    // Se as roles permitidas foram especificadas e a role do usuário não está incluída
    if (allowedRoles && !allowedRoles.includes(user.role)) {
        return <Navigate to="/dashboard" replace />;
    }

    return children;
};

export default ProtectedRoute;
