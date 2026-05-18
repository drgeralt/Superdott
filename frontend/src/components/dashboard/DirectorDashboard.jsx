import React from 'react';

const DirectorDashboard = ({ data }) => {
    const { total_students, active_teachers, pdis_generated_month } = data?.metrics || {};

    return (
        <div className="space-y-8 animate-[fadeIn_0.5s_ease-out]">
            {/* Boas-vindas premium */}
            <div className="bg-[linear-gradient(135deg,#0C2C47_0%,#4A9D95_100%)] p-8 rounded-3xl text-white shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <span className="inline-block px-3 py-1 bg-white/10 text-white font-label text-[10px] font-bold uppercase tracking-widest rounded-full mb-3">
                        Painel de Gestão Estratégica
                    </span>
                    <h2 className="font-headline text-3xl font-extrabold tracking-tight">
                        Bem-vindo ao Portal de Direção
                    </h2>
                    <p className="text-white/80 mt-1 max-w-xl text-sm leading-relaxed">
                        Acompanhe o andamento geral dos PDIs, engajamento do corpo docente e atalhos estratégicos para a sua instituição.
                    </p>
                </div>
                <div className="flex gap-3">
                    <div className="bg-white/10 px-4 py-3 rounded-2xl border border-white/10 text-center backdrop-blur-sm">
                        <span className="text-2xl font-black block font-headline">{total_students || 0}</span>
                        <span className="text-[10px] uppercase font-bold text-white/70 tracking-wider">Estudantes</span>
                    </div>
                </div>
            </div>

            {/* Grid de Cards de Métricas */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Alunos Vinculados */}
                <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all hover:scale-[1.02] flex items-center gap-4 group">
                    <div className="w-12 h-12 rounded-xl bg-teal-custom/10 text-teal-custom flex items-center justify-center group-hover:bg-teal-custom group-hover:text-white transition-colors duration-300 shrink-0">
                        <span className="material-symbols-outlined text-2.5xl">group</span>
                    </div>
                    <div>
                        <span className="text-xs font-semibold text-slate-500 block uppercase tracking-wider">Total de Alunos</span>
                        <h3 className="text-3xl font-black font-headline text-primary-navy mt-0.5">{total_students || 0}</h3>
                    </div>
                </div>

                {/* Professores Ativos */}
                <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all hover:scale-[1.02] flex items-center gap-4 group">
                    <div className="w-12 h-12 rounded-xl bg-blue-500/10 text-blue-600 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-colors duration-300 shrink-0">
                        <span className="material-symbols-outlined text-2.5xl">school</span>
                    </div>
                    <div>
                        <span className="text-xs font-semibold text-slate-500 block uppercase tracking-wider">Professores Ativos</span>
                        <h3 className="text-3xl font-black font-headline text-primary-navy mt-0.5">{active_teachers || 0}</h3>
                    </div>
                </div>

                {/* PDIs Gerados no Mês */}
                <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all hover:scale-[1.02] flex items-center gap-4 group">
                    <div className="w-12 h-12 rounded-xl bg-purple-500/10 text-purple-600 flex items-center justify-center group-hover:bg-purple-600 group-hover:text-white transition-colors duration-300 shrink-0">
                        <span className="material-symbols-outlined text-2.5xl">description</span>
                    </div>
                    <div>
                        <span className="text-xs font-semibold text-slate-500 block uppercase tracking-wider">PDIs Gerados no Mês</span>
                        <h3 className="text-3xl font-black font-headline text-primary-navy mt-0.5">{pdis_generated_month || 0}</h3>
                    </div>
                </div>
            </div>

            {/* Seções Adicionais e Atalhos */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                    <h3 className="font-headline font-bold text-lg text-primary-navy mb-4 flex items-center gap-2">
                        <span className="material-symbols-outlined text-teal-custom">settings</span>
                        Gestão da Escola e Recursos
                    </h3>
                    <div className="space-y-3">
                        <div className="flex justify-between items-center p-3.5 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer">
                            <div className="flex items-center gap-3">
                                <span className="material-symbols-outlined text-slate-500">manage_accounts</span>
                                <span className="text-sm font-semibold text-slate-700">Vincular Professores</span>
                            </div>
                            <span className="material-symbols-outlined text-sm text-slate-400">arrow_forward_ios</span>
                        </div>
                        <div className="flex justify-between items-center p-3.5 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer">
                            <div className="flex items-center gap-3">
                                <span className="material-symbols-outlined text-slate-500">add_moderator</span>
                                <span className="text-sm font-semibold text-slate-700">Configurações de Privacidade</span>
                            </div>
                            <span className="material-symbols-outlined text-sm text-slate-400">arrow_forward_ios</span>
                        </div>
                        <div className="flex justify-between items-center p-3.5 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer">
                            <div className="flex items-center gap-3">
                                <span className="material-symbols-outlined text-slate-500">bar_chart</span>
                                <span className="text-sm font-semibold text-slate-700">Relatórios Consolidados</span>
                            </div>
                            <span className="material-symbols-outlined text-sm text-slate-400">arrow_forward_ios</span>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between">
                    <div>
                        <h3 className="font-headline font-bold text-lg text-primary-navy mb-2 flex items-center gap-2">
                            <span className="material-symbols-outlined text-purple-600">tips_and_updates</span>
                            Metas e Desempenho
                        </h3>
                        <p className="text-xs text-slate-500 leading-relaxed">
                            O Superdott incentiva a criação de planos individualizados com maior agilidade. Nossa meta atual de engajamento escolar é manter todos os alunos diagnosticados com PDIs atualizados trimestralmente.
                        </p>
                    </div>
                    <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
                        <div>
                            <span className="text-xs text-slate-400 block font-semibold">Eficiência no Diagnóstico</span>
                            <span className="text-sm font-bold text-teal-custom block">94% acima da média nacional</span>
                        </div>
                        <div className="w-10 h-10 rounded-full bg-teal-custom/5 text-teal-custom flex items-center justify-center font-bold text-xs">
                            +12%
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DirectorDashboard;
