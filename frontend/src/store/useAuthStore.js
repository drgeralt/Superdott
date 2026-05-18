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

const useAuthStore = create((set, get) => ({
    user: null,
    token: localStorage.getItem('superdott_token'),
    isSidebarCollapsed: false,

    fetchProfile: async () => {
        const token = get().token;
        if (!token) return;
        try {
            const res = await fetch('/api/profile', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                set((state) => ({
                    user: state.user ? { ...state.user, ...data } : data
                }));
            }
        } catch (err) {
            console.error('Failed to fetch profile in store:', err);
        }
    },

    initializeAuth: () => {
        const token = localStorage.getItem('superdott_token');
        if (token) {
            const decoded = decodeToken(token);
            if (decoded) {
                set({ user: { id: decoded.sub, role: decoded.role }, token });
                get().fetchProfile();
                return;
            } else {
                localStorage.removeItem('superdott_token');
            }
        }
        set({ user: null, token: null });
    },

    setToken: (token) => {
        if (token) {
            localStorage.setItem('superdott_token', token);
            const decoded = decodeToken(token);
            set({ user: decoded ? { id: decoded.sub, role: decoded.role } : null, token });
            get().fetchProfile();
        } else {
            localStorage.removeItem('superdott_token');
            set({ user: null, token: null });
        }
    },

    logout: () => {
        localStorage.removeItem('superdott_token');
        set({ user: null, token: null });
    },

    toggleSidebar: () => set((state) => ({ isSidebarCollapsed: !state.isSidebarCollapsed }))
}));

export default useAuthStore;
