import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useStudentStore from './store/useStudentStore';
import useAuthStore from './store/useAuthStore';
import noUserPfp from './assets/img/no-user-pfp.jpg';

const MyStudents = () => {
    const navigate = useNavigate();
    const students = useStudentStore(state => state.students);
    const fetchStudents = useStudentStore(state => state.fetchStudents);
    const selectStudent = useStudentStore(state => state.selectStudent);
    const isLoading = useStudentStore(state => state.isLoading);
    const user = useAuthStore(state => state.user);

    const [searchTerm, setSearchTerm] = useState('');
    const [filterTurma, setFilterTurma] = useState('');
    const [schools, setSchools] = useState([]);
    const [selectedSchoolId, setSelectedSchoolId] = useState('');
    const [loadingSchools, setLoadingSchools] = useState(false);

    useEffect(() => {
        const fetchSchoolsAndStudents = async () => {
            if (user?.role === 'Professor') {
                setLoadingSchools(true);
                try {
                    const token = localStorage.getItem('superdott_token');
                    const res = await fetch('/api/teachers/my-schools', {
                        headers: { 'Authorization': `Bearer ${token}` }
                    });
                    if (res.ok) {
                        const data = await res.json();
                        setSchools(data);
                        if (data.length > 0) {
                            setSelectedSchoolId(data[0].id);
                            fetchStudents(data[0].id);
                            return;
                        }
                    }
                } catch (err) {
                    console.error(err);
                } finally {
                    setLoadingSchools(false);
                }
            }
            fetchStudents();
        };

        fetchSchoolsAndStudents();
    }, [fetchStudents, user?.role]);

    const handleSchoolChange = (schoolId) => {
        setSelectedSchoolId(schoolId);
        fetchStudents(schoolId);
    };

    const turmas = [...new Set(students.map(s => s.turma).filter(Boolean))];

    const filteredStudents = students.filter(student => {
        const matchesName = student.full_name.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesTurma = filterTurma ? student.turma === filterTurma : true;
        return matchesName && matchesTurma;
    });

    const handleOpenChat = (student) => {
        selectStudent(student);
        navigate('/dashboard');
    };

    return (
        <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header */}
            <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm flex flex-col md:flex-row md:items-end justify-between gap-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-teal-custom/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4 pointer-events-none"></div>
                <div className="relative z-10">
                    <h1 className="font-headline font-black text-3xl text-primary-navy tracking-tight mb-2 flex items-center gap-3">
                        Meus Alunos
                        <span className="px-3 py-1 bg-mint-light text-teal-custom text-xs font-bold rounded-full border border-teal-custom/20">
                            {students.length} Total
                        </span>
                    </h1>
                    <p className="text-slate-500 text-sm max-w-lg">
                        Visualize e gerencie todos os alunos sob sua responsabilidade. Acompanhe os resultados do mapeamento de Altas Habilidades e inicie intervenções pedagógicas focadas.
                    </p>
                </div>
                
                {/* Search & Filter */}
                <div className="flex flex-col sm:flex-row gap-3 relative z-10 w-full md:w-auto">
                    <div className="relative">
                        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">search</span>
                        <input
                            type="text"
                            placeholder="Buscar por nome..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full sm:w-64 pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:border-teal-custom focus:ring-2 focus:ring-teal-custom/20 outline-none transition-all placeholder:text-slate-400"
                        />
                    </div>
                    {user?.role === 'Professor' && schools.length > 0 && (
                        <select
                            value={selectedSchoolId}
                            onChange={(e) => handleSchoolChange(e.target.value)}
                            disabled={loadingSchools}
                            className="px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:border-teal-custom outline-none text-slate-600 appearance-none pr-10 cursor-pointer min-w-[180px]"
                            style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 24 24\' stroke=\'%2364748b\'%3E%3Cpath stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'2\' d=\'M19 9l-7 7-7-7\'%3E%3C/path%3E%3C/svg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 0.75rem center', backgroundSize: '1rem' }}
                        >
                            {schools.map(s => (
                                <option key={s.id} value={s.id}>{s.name}</option>
                            ))}
                        </select>
                    )}
                    <select
                        value={filterTurma}
                        onChange={(e) => setFilterTurma(e.target.value)}
                        className="px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:border-teal-custom outline-none text-slate-600 appearance-none pr-10 cursor-pointer min-w-[140px]"
                        style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 24 24\' stroke=\'%2364748b\'%3E%3Cpath stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'2\' d=\'M19 9l-7 7-7-7\'%3E%3C/path%3E%3C/svg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 0.75rem center', backgroundSize: '1rem' }}
                    >
                        <option value="">Todas as Turmas</option>
                        {turmas.map(t => (
                            <option key={t} value={t}>{t}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Students Grid */}
            {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3, 4, 5, 6].map(i => (
                        <div key={i} className="bg-white rounded-2xl p-6 border border-slate-100 h-64 animate-pulse flex flex-col gap-4">
                            <div className="flex items-center gap-4">
                                <div className="w-14 h-14 rounded-full bg-slate-100"></div>
                                <div className="space-y-2 flex-1">
                                    <div className="h-4 bg-slate-100 rounded w-3/4"></div>
                                    <div className="h-3 bg-slate-100 rounded w-1/2"></div>
                                </div>
                            </div>
                            <div className="space-y-3 mt-4">
                                <div className="h-2 bg-slate-100 rounded w-full"></div>
                                <div className="h-2 bg-slate-100 rounded w-full"></div>
                                <div className="h-2 bg-slate-100 rounded w-full"></div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : filteredStudents.length === 0 ? (
                <div className="bg-white rounded-3xl p-12 border border-slate-100 text-center flex flex-col items-center justify-center">
                    <span className="material-symbols-outlined text-6xl text-slate-200 mb-4">search_off</span>
                    <h3 className="font-headline font-bold text-xl text-primary-navy mb-2">Nenhum aluno encontrado</h3>
                    <p className="text-slate-500">Tente ajustar seus filtros ou termos de busca.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredStudents.map(student => (
                        <div key={student.id} className="bg-white rounded-2xl p-6 border border-slate-100 hover:border-teal-custom/30 hover:shadow-lg hover:shadow-teal-custom/5 transition-all duration-300 group flex flex-col relative overflow-hidden">
                            <div className="flex items-start gap-4 mb-6 relative z-10">
                                <img
                                    src={noUserPfp}
                                    alt="Avatar"
                                    className="w-14 h-14 rounded-full object-cover border-2 border-slate-50 shadow-sm"
                                />
                                <div className="flex-1 overflow-hidden">
                                    <h3 className="font-headline font-bold text-lg text-primary-navy truncate group-hover:text-teal-custom transition-colors">
                                        {student.full_name}
                                    </h3>
                                    <div className="flex items-center gap-2 mt-1">
                                        <span className="px-2 py-0.5 bg-slate-100 text-slate-500 text-[10px] font-bold uppercase tracking-wider rounded-md">
                                            {student.turma || "Sem Turma"}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Scores */}
                            {student.triage_completed ? (
                                <div className="space-y-4 mb-8 flex-1 relative z-10">
                                    <div>
                                        <div className="flex justify-between text-[11px] font-bold mb-1.5">
                                            <span className="text-primary-navy uppercase tracking-wider">Intelectual</span>
                                            <span className="text-teal-custom">{student.score_intelectual}%</span>
                                        </div>
                                        <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                                            <div className="h-full bg-[linear-gradient(90deg,#0C2C47_0%,#4A9D95_100%)] rounded-full transition-all duration-1000" style={{ width: `${student.score_intelectual}%` }}></div>
                                        </div>
                                    </div>
                                    <div>
                                        <div className="flex justify-between text-[11px] font-bold mb-1.5">
                                            <span className="text-primary-navy uppercase tracking-wider">Criativo</span>
                                            <span className="text-teal-custom">{student.score_criativo}%</span>
                                        </div>
                                        <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                                            <div className="h-full bg-[linear-gradient(90deg,#0C2C47_0%,#4A9D95_100%)] rounded-full transition-all duration-1000" style={{ width: `${student.score_criativo}%` }}></div>
                                        </div>
                                    </div>
                                    <div>
                                        <div className="flex justify-between text-[11px] font-bold mb-1.5">
                                            <span className="text-primary-navy uppercase tracking-wider">Liderança</span>
                                            <span className="text-teal-custom">{student.score_lideranca}%</span>
                                        </div>
                                        <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                                            <div className="h-full bg-[linear-gradient(90deg,#0C2C47_0%,#4A9D95_100%)] rounded-full transition-all duration-1000" style={{ width: `${student.score_lideranca}%` }}></div>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex-1 flex items-center justify-center mb-8 bg-slate-50/50 rounded-xl border border-slate-100 border-dashed">
                                    <p className="text-xs font-semibold text-slate-400 text-center px-4">
                                        Mapeamento Wechsler pendente
                                    </p>
                                </div>
                            )}

                            <button
                                onClick={() => handleOpenChat(student)}
                                className="w-full py-2.5 bg-slate-50 hover:bg-primary-navy text-primary-navy hover:text-white font-headline font-bold text-xs rounded-xl transition-colors duration-300 flex items-center justify-center gap-2 group/btn relative z-10"
                            >
                                <span className="material-symbols-outlined text-base">forum</span>
                                Abrir Assistente Pedagógico
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default MyStudents;
