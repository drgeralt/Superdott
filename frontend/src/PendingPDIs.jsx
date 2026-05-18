import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useStudentStore from './store/useStudentStore';
import useAuthStore from './store/useAuthStore';
import noUserPfp from './assets/img/no-user-pfp.jpg';

const PendingPDIs = () => {
    const navigate = useNavigate();
    const students = useStudentStore(state => state.students);
    const fetchStudents = useStudentStore(state => state.fetchStudents);
    const selectStudent = useStudentStore(state => state.selectStudent);
    const isLoading = useStudentStore(state => state.isLoading);

    useEffect(() => {
        fetchStudents();
    }, [fetchStudents]);

    // Pending PDIs: for now, assume all students need a PDI if they don't have one generated
    // In a real scenario, this would filter based on a `has_pdi` flag on the student.
    // Let's filter students whose triage is completed but might need a PDI, or just all students for demo purposes
    // who do not have a PDI. We will use a mock filter or show all if `pdi_completed` doesn't exist.
    const pendingStudents = students.filter(student => !student.has_pdi);

    const handleGeneratePDI = (student) => {
        selectStudent(student);
        navigate('/dashboard');
    };

    return (
        <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header */}
            <div className="bg-[linear-gradient(135deg,#0C2C47_0%,#4A9D95_100%)] rounded-3xl p-8 shadow-lg shadow-teal-custom/10 flex flex-col md:flex-row md:items-end justify-between gap-6 relative overflow-hidden text-white">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4 pointer-events-none"></div>
                <div className="relative z-10">
                    <div className="inline-block px-3 py-1 bg-white/20 text-white font-headline font-bold text-[10px] tracking-widest uppercase rounded-full mb-4 backdrop-blur-md">
                        Atenção Requerida
                    </div>
                    <h1 className="font-headline font-black text-3xl tracking-tight mb-2 flex items-center gap-3">
                        PDIs Pendentes
                        <span className="px-3 py-1 bg-red-500 text-white text-xs font-bold rounded-full shadow-sm">
                            {pendingStudents.length}
                        </span>
                    </h1>
                    <p className="text-white/80 text-sm max-w-lg">
                        Alunos que precisam de um Plano de Desenvolvimento Individualizado (PDI). Utilize a IA para gerar um plano estruturado baseado no mapeamento cognitivo de cada um.
                    </p>
                </div>
            </div>

            {/* Students List */}
            {isLoading ? (
                <div className="space-y-4">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="bg-white rounded-2xl p-6 border border-slate-100 h-24 animate-pulse flex items-center gap-6">
                            <div className="w-12 h-12 rounded-full bg-slate-100 shrink-0"></div>
                            <div className="space-y-2 flex-1">
                                <div className="h-4 bg-slate-100 rounded w-1/4"></div>
                                <div className="h-3 bg-slate-100 rounded w-1/3"></div>
                            </div>
                            <div className="w-32 h-10 rounded-xl bg-slate-100 shrink-0"></div>
                        </div>
                    ))}
                </div>
            ) : pendingStudents.length === 0 ? (
                <div className="bg-white rounded-3xl p-16 border border-slate-100 text-center flex flex-col items-center justify-center">
                    <div className="w-20 h-20 bg-teal-custom/10 text-teal-custom rounded-full flex items-center justify-center mb-6">
                        <span className="material-symbols-outlined text-4xl">check_circle</span>
                    </div>
                    <h3 className="font-headline font-bold text-2xl text-primary-navy mb-2">Tudo em dia!</h3>
                    <p className="text-slate-500 max-w-sm">
                        Não há Planos de Desenvolvimento Individualizados pendentes para suas turmas no momento.
                    </p>
                </div>
            ) : (
                <div className="space-y-4">
                    {pendingStudents.map(student => (
                        <div key={student.id} className="bg-white rounded-2xl p-4 sm:p-6 border border-slate-100 hover:border-red-500/30 hover:shadow-lg hover:shadow-red-500/5 transition-all duration-300 flex flex-col sm:flex-row sm:items-center justify-between gap-6 group">
                            
                            <div className="flex items-center gap-4">
                                <div className="relative">
                                    <img
                                        src={noUserPfp}
                                        alt="Avatar"
                                        className="w-12 h-12 sm:w-14 sm:h-14 rounded-full object-cover border-2 border-slate-50 shadow-sm"
                                    />
                                    <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full border-2 border-white"></div>
                                </div>
                                <div>
                                    <h3 className="font-headline font-bold text-lg text-primary-navy group-hover:text-red-600 transition-colors">
                                        {student.full_name}
                                    </h3>
                                    <div className="flex items-center gap-3 mt-1">
                                        <span className="text-xs font-semibold text-slate-500 flex items-center gap-1">
                                            <span className="material-symbols-outlined text-sm">school</span>
                                            {student.turma || "Sem Turma"}
                                        </span>
                                        {student.triage_completed ? (
                                            <span className="text-[10px] font-bold uppercase tracking-widest text-teal-custom bg-mint-light px-2 py-0.5 rounded-md">
                                                Triagem Pronta
                                            </span>
                                        ) : (
                                            <span className="text-[10px] font-bold uppercase tracking-widest text-orange-500 bg-orange-50 px-2 py-0.5 rounded-md">
                                                Falta Triagem
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <button
                                onClick={() => handleGeneratePDI(student)}
                                className="w-full sm:w-auto px-6 py-3 bg-red-50 hover:bg-red-500 text-red-600 hover:text-white font-headline font-bold text-sm rounded-xl transition-all duration-300 flex items-center justify-center gap-2 group/btn shrink-0"
                            >
                                <span className="material-symbols-outlined text-lg group-hover/btn:animate-bounce">auto_awesome</span>
                                Gerar PDI com IA
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default PendingPDIs;
