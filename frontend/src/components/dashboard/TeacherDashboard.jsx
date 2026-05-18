import React, { useState, useEffect } from 'react';
import StudentList from './StudentList';
import TalentMap from './TalentMap';
import AIChat from './AIChat';
import useAuthStore from '../../store/useAuthStore';
import useStudentStore from '../../store/useStudentStore';

const TeacherDashboard = () => {
    const user = useAuthStore(state => state.user);
    const fetchStudents = useStudentStore(state => state.fetchStudents);
    const allStudents = useStudentStore(state => state.allStudents || []);
    const selectedTurma = useStudentStore(state => state.selectedTurma);
    const setTurma = useStudentStore(state => state.setTurma);
    
    const [schools, setSchools] = useState([]);
    const [activeSchoolId, setActiveSchoolId] = useState('');
    const [loadingSchools, setLoadingSchools] = useState(true);

    const availableTurmas = [...new Set(allStudents.map(s => s.turma).filter(Boolean))].sort();

    useEffect(() => {
        fetch('/api/teachers/my-schools', {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('superdott_token')}`
            }
        })
        .then(res => res.json())
        .then(data => {
            if (Array.isArray(data)) {
                setSchools(data);
                if (user?.school_id) {
                    setActiveSchoolId(user.school_id);
                } else if (data.length > 0) {
                    setActiveSchoolId(data[0].id);
                }
            }
        })
        .finally(() => setLoadingSchools(false));
    }, [user?.school_id]);

    const handleSchoolChange = async (e) => {
        const newSchoolId = e.target.value;
        setActiveSchoolId(newSchoolId);
        
        try {
            const res = await fetch('/api/teachers/active-school', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('superdott_token')}`
                },
                body: JSON.stringify({ school_id: newSchoolId })
            });
            if (res.ok) {
                // Refresh students list with the new school context
                fetchStudents();
            }
        } catch (error) {
            console.error("Failed to switch active school", error);
        }
    };

    return (
        <div className="flex flex-col gap-6 animate-[fadeIn_0.5s_ease-out]">
            {/* Context Selector Bar */}
            <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm flex flex-col md:flex-row justify-between items-center gap-4 relative z-10">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-mint-light text-teal-custom rounded-xl flex items-center justify-center">
                        <span className="material-symbols-outlined text-xl">domain</span>
                    </div>
                    <div>
                        <h2 className="font-headline font-bold text-sm text-primary-navy">Contexto de Ensino</h2>
                        <p className="text-xs text-slate-500">Selecione a instituição ativa</p>
                    </div>
                </div>
                
                <div className="w-full md:w-auto flex flex-col md:flex-row gap-4">
                    <select
                        value={selectedTurma}
                        onChange={(e) => setTurma(e.target.value)}
                        className="w-full md:w-48 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-primary-navy focus:border-teal-custom focus:ring-2 focus:ring-teal-custom/20 outline-none appearance-none cursor-pointer"
                        style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 24 24\' stroke=\'%230C2C47\'%3E%3Cpath stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'2\' d=\'M19 9l-7 7-7-7\'%3E%3C/path%3E%3C/svg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 0.75rem center', backgroundSize: '1rem' }}
                    >
                        <option value="">Todas as Turmas</option>
                        {availableTurmas.map(t => (
                            <option key={t} value={t}>Turma {t}</option>
                        ))}
                    </select>

                    <select
                        value={activeSchoolId}
                        onChange={handleSchoolChange}
                        disabled={loadingSchools || schools.length === 0}
                        className="w-full md:w-64 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-primary-navy focus:border-teal-custom focus:ring-2 focus:ring-teal-custom/20 outline-none appearance-none cursor-pointer disabled:opacity-50"
                        style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 24 24\' stroke=\'%230C2C47\'%3E%3Cpath stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'2\' d=\'M19 9l-7 7-7-7\'%3E%3C/path%3E%3C/svg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 0.75rem center', backgroundSize: '1rem' }}
                    >
                        {loadingSchools ? (
                            <option>Carregando escolas...</option>
                        ) : schools.length === 0 ? (
                            <option>Nenhuma escola vinculada</option>
                        ) : (
                            schools.map(s => (
                                <option key={s.id} value={s.id}>{s.name}</option>
                            ))
                        )}
                    </select>
                </div>
            </div>

            <div className="grid grid-cols-12 gap-6 items-start">
                <StudentList />
                <TalentMap />
                <AIChat />
            </div>
        </div>
    );
};

export default TeacherDashboard;
