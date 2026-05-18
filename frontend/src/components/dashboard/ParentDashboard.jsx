import React from 'react';
import useStudentStore from '../../store/useStudentStore';
import AIChat from './AIChat';

const ParentDashboard = ({ data }) => {
    const children = data?.recent_students || [];
    const selectStudent = useStudentStore(state => state.selectStudent);
    const selectedStudent = useStudentStore(state => state.selectedStudent);

    return (
        <div className="grid grid-cols-12 gap-6 items-start animate-[fadeIn_0.5s_ease-out]">
            {/* Esquerda: Perfil dos Filhos & Dicas */}
            <div className="col-span-12 lg:col-span-7 space-y-6">
                
                {/* Boas vindas Acolhedora */}
                <div className="bg-[linear-gradient(135deg,#4A9D95_0%,#0C2C47_100%)] p-8 rounded-3xl text-white shadow-xl">
                    <span className="inline-block px-3 py-1 bg-white/10 text-white font-label text-[10px] font-bold uppercase tracking-widest rounded-full mb-3">
                        Espaço da Família
                    </span>
                    <h2 className="font-headline text-3xl font-extrabold tracking-tight">
                        Seu Canal de Acolhimento
                    </h2>
                    <p className="text-white/90 mt-1 max-w-xl text-sm leading-relaxed font-medium">
                        Acompanhe de perto a evolução do seu filho, tire dúvidas pedagógicas e receba orientações personalizadas de suporte familiar.
                    </p>
                </div>

                {/* Lista de Filhos */}
                <div className="space-y-4">
                    <h3 className="font-headline font-bold text-lg text-primary-navy flex items-center gap-2">
                        <span className="material-symbols-outlined text-teal-custom">child_care</span>
                        Perfil do(s) Filho(s)
                    </h3>

                    {children.map(child => {
                        const isSelected = selectedStudent?.id === child.id;
                        return (
                            <div 
                                key={child.id}
                                className={`p-6 rounded-2xl border transition-all ${
                                    isSelected 
                                        ? 'bg-white border-teal-custom/50 shadow-md ring-2 ring-teal-custom/15' 
                                        : 'bg-white border-slate-100 shadow-sm hover:border-slate-300'
                                }`}
                            >
                                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-full bg-teal-custom/10 text-teal-custom flex items-center justify-center font-bold font-headline text-lg shrink-0">
                                            {child.full_name.charAt(0)}
                                        </div>
                                        <div>
                                            <h4 className="font-headline font-bold text-base text-primary-navy">{child.full_name}</h4>
                                            <p className="text-xs text-slate-500 font-semibold">{child.email}</p>
                                        </div>
                                    </div>

                                    <div className="flex flex-wrap items-center gap-3">
                                        {/* Status da Triagem */}
                                        {child.triage?.completed ? (
                                            <div className="flex items-center gap-2 bg-emerald-50 text-emerald-700 px-3.5 py-1.5 rounded-full text-xs font-bold border border-emerald-100">
                                                <span className="material-symbols-outlined text-sm">verified</span>
                                                Triagem Concluída
                                            </div>
                                        ) : (
                                            <div className="flex items-center gap-2 bg-amber-50 text-amber-700 px-3.5 py-1.5 rounded-full text-xs font-bold border border-amber-100 animate-pulse">
                                                <span className="material-symbols-outlined text-sm">warning</span>
                                                Triagem Pendente
                                            </div>
                                        )}

                                        {/* Seleção de Filho para Chat */}
                                        <button
                                            onClick={() => selectStudent(child)}
                                            className={`px-4 py-2 rounded-full text-xs font-bold shadow-sm transition-all active:scale-95 ${
                                                isSelected 
                                                    ? 'bg-primary-navy text-white hover:bg-primary-navy/90'
                                                    : 'bg-slate-50 text-slate-700 hover:bg-slate-100'
                                            }`}
                                        >
                                            {isSelected ? 'Selecionado' : 'Selecionar'}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        );
                    })}

                    {children.length === 0 && (
                        <div className="bg-slate-50 p-8 rounded-2xl border border-slate-100 text-center">
                            <span className="material-symbols-outlined text-slate-400 text-4xl mb-2">person_search</span>
                            <p className="text-sm text-slate-500 font-medium italic">Nenhum filho associado a esta conta.</p>
                        </div>
                    )}
                </div>

                {/* Dicas e Orientações Rápidas */}
                <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
                    <h3 className="font-headline font-bold text-lg text-primary-navy flex items-center gap-2">
                        <span className="material-symbols-outlined text-amber-500 font-bold">lightbulb</span>
                        Dicas de Apoio Familiar
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-amber-50/40 p-4 rounded-xl border border-amber-100/50">
                            <h4 className="text-xs font-bold text-amber-800 uppercase tracking-wider mb-1">Comunicação Empática</h4>
                            <p className="text-xs text-slate-600 leading-relaxed font-semibold">
                                Crianças superdotadas podem manifestar grande sensibilidade. Converse de forma direta e acolhedora, validando seus sentimentos.
                            </p>
                        </div>
                        <div className="bg-teal-50/40 p-4 rounded-xl border border-teal-100/50">
                            <h4 className="text-xs font-bold text-teal-800 uppercase tracking-wider mb-1">Estímulos Adequados</h4>
                            <p className="text-xs text-slate-600 leading-relaxed font-semibold">
                                Incentive a exploração de temas de grande interesse (hiperfoco) sem impor sobrecarga de tarefas formais em casa.
                            </p>
                        </div>
                    </div>
                </div>

            </div>

            {/* Direita: Chat de Suporte Familiar */}
            <div className="col-span-12 lg:col-span-5 h-[calc(100vh-200px)] min-h-[550px]">
                <AIChat />
            </div>
        </div>
    );
};

export default ParentDashboard;
