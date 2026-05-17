import { create } from 'zustand';

const decodeToken = (token) => {
    try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function(c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));
        return JSON.parse(jsonPayload);
    } catch {
        return null;
    }
};

const useAuthStore = create((set) => ({
    user: null,
    token: localStorage.getItem('superdott_token'),

    initializeAuth: () => {
        const token = localStorage.getItem('superdott_token');
        if (token) {
            const decoded = decodeToken(token);
            if (decoded) {
                set({ user: { id: decoded.sub, role: decoded.role }, token });
                return;
            }
        }
        set({ user: null, token: null });
    },

    setToken: (token) => {
        if (token) {
            localStorage.setItem('superdott_token', token);
            const decoded = decodeToken(token);
            set({ user: decoded ? { id: decoded.sub, role: decoded.role } : null, token });
        } else {
            localStorage.removeItem('superdott_token');
            set({ user: null, token: null });
        }
    },

    logout: () => {
        localStorage.removeItem('superdott_token');
        set({ user: null, token: null });
    }
}));

export default useAuthStore;
