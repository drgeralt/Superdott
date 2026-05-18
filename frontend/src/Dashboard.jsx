import { useState, useEffect } from 'react';
import useStudentStore from './store/useStudentStore';
import useAuthStore from './store/useAuthStore';

import DirectorDashboard from './components/dashboard/DirectorDashboard';
import TeacherDashboard from './components/dashboard/TeacherDashboard';
import ParentDashboard from './components/dashboard/ParentDashboard';

import PillNav from './components/layout/PillNav';
import MobileBottomNav from './components/layout/MobileBottomNav';
import SplitText from './components/layout/SplitText';

import logoImg from './assets/img/logo.png';
import noUserPfp from './assets/img/no-user-pfp.jpg';

const navItems = [
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Triagem', href: '/triagem' },
    { label: 'Relatórios', href: '#' }
];

const Dashboard = () => {
    const [summaryData, setSummaryData] = useState(null);
    const [summaryLoading, setSummaryLoading] = useState(true);
    const [summaryError, setSummaryError] = useState(null);

    const initializeAuth = useAuthStore(state => state.initializeAuth);
    const user = useAuthStore(state => state.user);

    const fetchStudents = useStudentStore(state => state.fetchStudents);
    const selectStudent = useStudentStore(state => state.selectStudent);

    useEffect(() => {
        initializeAuth();
    }, [initializeAuth]);

    useEffect(() => {
        const loadDashboardSummary = async () => {
            setSummaryLoading(true);
            setSummaryError(null);
            try {
                const token = localStorage.getItem('superdott_token');
                const headers = {};
                if (token) {
                    headers['Authorization'] = `Bearer ${token}`;
                }
                const res = await fetch('/api/dashboard/summary', { headers });
                if (!res.ok) {
                    throw new Error('Falha ao carregar sumário do dashboard');
                }
                const data = await res.json();
                setSummaryData(data);
                
                // Se for pai, pré-seleciona o primeiro filho para instanciar o chat context
                if (data.role === 'Pai' && data.recent_students?.length > 0) {
                    selectStudent(data.recent_students[0]);
                }
            } catch (err) {
                setSummaryError(err.message || 'Erro ao carregar dados do painel.');
            } finally {
                setSummaryLoading(false);
            }
        };

        loadDashboardSummary();
        fetchStudents();
    }, [fetchStudents, selectStudent]);

    const renderDashboardContent = () => {
        if (summaryLoading) {
            return (
                <div className="flex flex-col items-center justify-center py-24 gap-3 animate-pulse">
                    <span className="w-10 h-10 border-4 border-teal-custom border-t-transparent rounded-full animate-spin"></span>
                    <p className="text-on-surface-variant font-semibold text-sm">Carregando painel personalizado...</p>
                </div>
            );
        }

        if (summaryError) {
            return (
                <div className="p-6 bg-red-50 border-l-4 border-red-500 text-red-700 rounded-r-xl flex items-center gap-3">
                    <span className="material-symbols-outlined">error</span>
                    <div>
                        <h4 className="font-bold text-sm">Ops! Não foi possível carregar os dados</h4>
                        <p className="text-xs mt-0.5">{summaryError}</p>
                    </div>
                </div>
            );
        }

        const role = user?.role || summaryData?.role;

        if (role === 'Diretor' || role === 'SuperAdmin') {
            return <DirectorDashboard data={summaryData} />;
        } else if (role === 'Pai') {
            return <ParentDashboard data={summaryData} />;
        } else {
            return <TeacherDashboard />;
        }
    };

    return (
        <div className="min-h-screen bg-surface-container-lowest">
            <header className="absolute top-0 left-0 w-full px-6 z-50 grid grid-cols-[1fr_auto_1fr] items-center h-20 pointer-events-none">
                <div className="pointer-events-auto flex items-center h-full">
                    <SplitText
                        text="Super Dashboard"
                        className="md:text-2xl lg:text-5xl font-black text-primary-navy font-headline tracking-tighter"
                        delay={40}
                    />
                </div>
                <div className="pointer-events-auto flex items-center h-full">
                    <PillNav
                        logo={logoImg}
                        items={navItems}
                        activeHref="/dashboard"
                        hoveredPillTextColor="#ffffff"
                    />
                </div>
                <div className="pointer-events-auto flex justify-end items-center gap-4 h-full">
                    <div className="h-10 w-10 rounded-full overflow-hidden border-2 border-white shadow-sm cursor-pointer hover:scale-105 transition-transform">
                        <img alt="Perfil" className="w-full h-full object-cover" src={noUserPfp} />
                    </div>
                </div>
            </header>

            <main className="pt-24 pb-24 lg:pb-8 px-6 min-h-screen">
                {renderDashboardContent()}
            </main>

            <MobileBottomNav />
        </div>
    );
};

export default Dashboard;