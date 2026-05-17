import { useState, useEffect } from 'react';
import useStudentStore from './store/useStudentStore';
import useAuthStore from './store/useAuthStore';

import DirectorDashboard from './components/dashboard/DirectorDashboard';
import TeacherDashboard from './components/dashboard/TeacherDashboard';
import ParentDashboard from './components/dashboard/ParentDashboard';

import MainLayout from './components/layout/MainLayout';

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
        <MainLayout>
            {renderDashboardContent()}
        </MainLayout>
    );
};

export default Dashboard;