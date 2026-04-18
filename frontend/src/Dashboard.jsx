import { useEffect } from 'react';
import useStudentStore from './store/useStudentStore';

import StudentList from './components/dashboard/StudentList';
import TalentMap from './components/dashboard/TalentMap';
import AIChat from './components/dashboard/AIChat';

import PillNav from './components/layout/PillNav';
import MobileBottomNav from './components/layout/MobileBottomNav';
import SplitText from './components/layout/SplitText';

import logoImg from './assets/img/logo.png';
import noUserPfp from './assets/img/no-user-pfp.jpg';

const navItems = [
    { label: 'Dashboard', href: '/' },
    { label: 'Triagem', href: '/triagem' },
    { label: 'Relatórios', href: '#' }
];

const Dashboard = () => {
    const fetchStudents = useStudentStore(state => state.fetchStudents);
    const isLoading = useStudentStore(state => state.isLoading);
    const error = useStudentStore(state => state.error);
    const students = useStudentStore(state => state.students);

    useEffect(() => {
        fetchStudents();
    }, []);

    return (
        <div className="min-h-screen bg-surface-container-lowest">
            <header className="absolute top-0 left-0 w-full px-6 z-50 grid grid-cols-[1fr_auto_1fr] items-center h-20 pointer-events-none">
                <div className="pointer-events-auto flex items-center h-full">
                    <SplitText
                        text="Super Dashboard"
                        className="md:text-xl lg:text-3xl font-black text-primary-navy font-headline tracking-tighter"
                        delay={40}
                    />
                </div>
                <div className="pointer-events-auto flex items-center h-full">
                    <PillNav
                        logo={logoImg}
                        items={navItems}
                        activeHref="/"
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
                <header className="mb-8">
                    <div className="max-w-xl">
                        <p className="text-on-surface-variant mt-2 text-lg font-medium">
                            {isLoading ? (
                                <span className="flex items-center gap-2">
                                    <span className="w-4 h-4 border-2 border-primary-navy border-t-transparent rounded-full animate-spin"></span>
                                    Carregando dados pedagógicos...
                                </span>
                            ) : error ? (
                                "Erro ao conectar com o servidor."
                            ) : (
                                `Dashboard: Analisando ${students.length} alunos da turma.`
                            )}
                        </p>
                    </div>
                </header>

                {error && (
                    <div className="mb-6 p-4 bg-error-container text-on-surface rounded-xl flex items-center gap-3">
                        <span className="material-symbols-outlined text-error">error</span>
                        <p className="text-sm">{error}</p>
                    </div>
                )}

                <div className="grid grid-cols-12 gap-6 items-start">
                    <StudentList />
                    <TalentMap />
                    <AIChat />
                </div>
            </main>

            <MobileBottomNav />
        </div>
    );
};

export default Dashboard;