import React from 'react';
import SideNavBar from './SideNavBar';
import useAuthStore from '../../store/useAuthStore';

const MainLayout = ({ children }) => {
    const isCollapsed = useAuthStore(state => state.isSidebarCollapsed);

    return (
        <div className="min-h-screen bg-slate-50/50">
            {/* Sidebar Barra Lateral */}
            <SideNavBar />

            {/* Container do Conteúdo Principal com transição suave baseada no menu colapsado */}
            <div 
                className={`transition-all duration-300 min-h-screen flex flex-col ${
                    isCollapsed ? 'lg:pl-20' : 'lg:pl-64'
                } pl-0`}
            >
                <main className="flex-1 p-6 lg:p-10 mt-16 lg:mt-0">
                    {children}
                </main>
            </div>
        </div>
    );
};

export default MainLayout;
