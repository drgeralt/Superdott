import React, { useState, useEffect } from 'react';

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
    const [students, setStudents] = useState([]);
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [loading, setLoading] = useState(true);

    // BUSCA REAL DOS ALUNOS ATRAVÉS DO PROXY DO VITE
    useEffect(() => {
        // o caminho '/api/students' será redirecionado para 'http://localhost:8000/api/students' pelo vite.config.js
        fetch('/api/students')
            .then(res => res.json())
            .then(data => {
                setStudents(data);
                if (data && data.length > 0) {
                    setSelectedStudent(data[0]); // Seleciona o primeiro objeto da lista por padrão
                }
                setLoading(false);
            })
            .catch(err => {
                console.error("Erro ao carregar alunos:", err);
                setLoading(false);
            });
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
                    {/* Settings e Profile... */}
                    <div className="h-10 w-10 rounded-full overflow-hidden border-2 border-white shadow-sm cursor-pointer hover:scale-105 transition-transform">
                        <img alt="Perfil" className="w-full h-full object-cover" src={noUserPfp} />
                    </div>
                </div>
            </header>

            <main className="pt-24 pb-24 lg:pb-8 px-6 min-h-screen">
                <header className="mb-8">
                    <div className="max-w-xl">
                        <p className="text-on-surface-variant mt-2 text-lg font-medium">
                            {loading ? (
                                <span className="flex items-center gap-2">
                                    <span className="w-4 h-4 border-2 border-primary-navy border-t-transparent rounded-full animate-spin"></span>
                                    Carregando dados pedagógicos...
                                </span>
                            ) : (
                                `Dashboard: Analisando ${students.length} alunos da turma.`
                            )}
                        </p>
                    </div>
                </header>

                <div className="grid grid-cols-12 gap-6 items-start">
                    {/* Lista de Alunos Lateral */}
                    <StudentList
                        students={students}
                        activeId={selectedStudent?.id}
                        onSelect={setSelectedStudent}
                    />

                    {/* Gráfico de Radar (Mapa de Talentos) */}
                    <TalentMap student={selectedStudent} />

                    {/* Chat de Assistente IA com contexto do aluno */}
                    <AIChat student={selectedStudent} />
                </div>
            </main>

            {/* Navegação Mobile mantida para consistência */}
            <MobileBottomNav />
        </div>
    );
};

export default Dashboard;