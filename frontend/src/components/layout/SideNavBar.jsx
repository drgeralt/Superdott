import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import useAuthStore from '../../store/useAuthStore';
import logoImg from '../../assets/img/logo.png';
import noUserPfp from '../../assets/img/no-user-pfp.jpg';

const navItems = [
    // Todos
    { path: '/dashboard', label: 'Dashboard', icon: 'dashboard', allowedRoles: ['Diretor', 'SuperAdmin', 'Professor', 'Pai'] },
    { path: '/profile', label: 'Meu Perfil', icon: 'person', allowedRoles: ['Diretor', 'SuperAdmin', 'Professor', 'Pai'] },
    
    // SuperAdmin
    { path: '/admin/rag', label: 'Motor RAG', icon: 'neurology', allowedRoles: ['SuperAdmin'] },
    { path: '/admin/metrics', label: 'Métricas Globais', icon: 'analytics', allowedRoles: ['SuperAdmin'] },
    
    // Diretor
    { path: '/escola', label: 'Gestão da Escola', icon: 'domain', allowedRoles: ['Diretor'] },
    { path: '/professores', label: 'Professores', icon: 'school', allowedRoles: ['Diretor'] },
    { path: '/importar-alunos', label: 'Importar Alunos', icon: 'upload_file', allowedRoles: ['Diretor'] },
    { path: '/vinculos', label: 'Vínculos', icon: 'link', allowedRoles: ['Diretor'] },
    
    // Professor
    { path: '/alunos', label: 'Meus Alunos', icon: 'group', allowedRoles: ['Professor'] },
    { path: '/pdis', label: 'PDIs Pendentes', icon: 'pending_actions', allowedRoles: ['Professor'] },
    
    // Pai
    { path: '/filhos', label: 'Meus Filhos', icon: 'child_care', allowedRoles: ['Pai'] },
    { path: '/codigos-vinculo', label: 'Códigos de Vínculo', icon: 'key', allowedRoles: ['Pai'] },
];

const SideNavBar = () => {
    const user = useAuthStore(state => state.user);
    const logout = useAuthStore(state => state.logout);
    const isCollapsed = useAuthStore(state => state.isSidebarCollapsed);
    const toggleSidebar = useAuthStore(state => state.toggleSidebar);
    const navigate = useNavigate();
    const location = useLocation();
    const [isMobileOpen, setIsMobileOpen] = useState(false);

    // Filtra itens permitidos com base na Role
    const allowedItems = navItems.filter(item => 
        user && item.allowedRoles.includes(user.role)
    );

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    return (
        <>
            {/* Botão Hambúrguer Mobile (Escondido em Desktop) */}
            <div className="lg:hidden fixed top-4 left-4 z-[90] flex items-center gap-3 pointer-events-auto">
                <button
                    onClick={() => setIsMobileOpen(!isMobileOpen)}
                    className="p-2.5 bg-white text-primary-navy rounded-xl shadow-lg border border-slate-100 hover:bg-slate-50 transition-all active:scale-95 flex items-center justify-center"
                >
                    <span className="material-symbols-outlined text-2xl">
                        {isMobileOpen ? 'close' : 'menu'}
                    </span>
                </button>
            </div>

            {/* Overlay Mobile */}
            {isMobileOpen && (
                <div 
                    onClick={() => setIsMobileOpen(false)}
                    className="lg:hidden fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[80] transition-all"
                />
            )}

            {/* Sidebar Container */}
            <aside 
                className={`fixed top-0 left-0 h-screen bg-white border-r border-slate-100 shadow-[2px_0_12px_rgba(25,28,35,0.02)] flex flex-col z-[85] transition-all duration-300 ${
                    isMobileOpen ? 'translate-x-0 w-64' : '-translate-x-full lg:translate-x-0'
                } ${isCollapsed ? 'lg:w-20' : 'lg:w-64'}`}
            >
                {/* Header / Logo */}
                <div className={`p-6 border-b border-slate-50 flex items-center justify-between shrink-0 h-20`}>
                    <div className="flex items-center gap-3 overflow-hidden">
                        <img 
                            src={logoImg} 
                            alt="Logo" 
                            className="w-8 h-8 object-contain shrink-0" 
                        />
                        {!isCollapsed && (
                            <span className="font-headline font-extrabold text-lg text-primary-navy tracking-tight truncate">
                                Superdott .
                            </span>
                        )}
                    </div>
                    <button
                        onClick={toggleSidebar}
                        className="hidden lg:flex p-1.5 hover:bg-slate-50 text-slate-400 hover:text-slate-600 rounded-lg transition-colors"
                    >
                        <span className="material-symbols-outlined text-xl">
                            {isCollapsed ? 'arrow_forward_ios' : 'arrow_back_ios'}
                        </span>
                    </button>
                </div>

                {/* Itens de Navegação */}
                <nav className="flex-1 px-3 py-6 space-y-1.5 overflow-y-auto custom-scrollbar">
                    {allowedItems.map(item => {
                        const isActive = location.pathname === item.path;
                        return (
                            <button
                                key={item.path}
                                onClick={() => {
                                    navigate(item.path);
                                    setIsMobileOpen(false);
                                }}
                                className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-xl transition-all duration-200 group text-left ${
                                    isActive
                                        ? 'bg-[linear-gradient(135deg,#0C2C47_0%,#4A9D95_100%)] text-white shadow-md'
                                        : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
                                }`}
                                title={isCollapsed ? item.label : undefined}
                            >
                                <span className={`material-symbols-outlined text-xl group-hover:scale-110 duration-200 shrink-0 ${
                                    isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-600'
                                }`}>
                                    {item.icon}
                                </span>
                                {(!isCollapsed || isMobileOpen) && (
                                    <span className={`text-sm font-semibold truncate`}>
                                        {item.label}
                                    </span>
                                )}
                            </button>
                        );
                    })}
                </nav>

                {/* Profile Card / Footer */}
                {user && (
                    <div className="p-4 border-t border-slate-50 bg-slate-50/50 shrink-0">
                        <div className="flex items-center gap-3 overflow-hidden mb-3">
                            <img 
                                src={noUserPfp} 
                                alt="Perfil" 
                                className="w-10 h-10 rounded-full object-cover shrink-0 border border-slate-200 shadow-sm" 
                            />
                            {(!isCollapsed || isMobileOpen) && (
                                <div className="overflow-hidden">
                                    <p className="text-xs font-bold text-slate-800 truncate leading-tight">
                                        {user.email}
                                    </p>
                                    <span className="inline-block mt-1 px-2.5 py-0.5 bg-teal-custom/10 text-teal-custom font-label text-[9px] font-extrabold uppercase tracking-wider rounded-full leading-none">
                                        {user.role}
                                    </span>
                                </div>
                            )}
                        </div>
                        <button
                            onClick={handleLogout}
                            className={`w-full flex items-center gap-3.5 px-4 py-2.5 text-slate-500 hover:bg-red-50 hover:text-red-600 rounded-xl transition-all duration-200 font-bold text-xs ${
                                isCollapsed && !isMobileOpen ? 'justify-center' : ''
                            }`}
                        >
                            <span className="material-symbols-outlined text-lg shrink-0">logout</span>
                            {(!isCollapsed || isMobileOpen) && <span>Sair da Conta</span>}
                        </button>
                    </div>
                )}
            </aside>
        </>
    );
};

export default SideNavBar;