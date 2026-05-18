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

            {/* Metas e Desempenho Real da Escola */}
            <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm space-y-6">
                <div>
                    <h3 className="font-headline font-bold text-lg text-primary-navy mb-2 flex items-center gap-2">
                        <span className="material-symbols-outlined text-purple-600">tips_and_updates</span>
                        Metas e Desempenho da Escola
                    </h3>
                    <p className="text-xs text-slate-500 leading-relaxed font-semibold">
                        Acompanhe o engajamento estratégico em tempo real. O Superdott agiliza a identificação e o desenvolvimento de potenciais em cada aluno da instituição.
                    </p>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-slate-100">
                    <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl">
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">Alunos Ativos</span>
                        <span className="text-xl font-headline font-black text-primary-navy">{total_students || 0}</span>
                    </div>
                    <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl">
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">Corpo Docente</span>
                        <span className="text-xl font-headline font-black text-primary-navy">{active_teachers || 0} lecionando</span>
                    </div>
                    <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl">
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">PDIs Gerados no Mês</span>
                        <span className="text-xl font-headline font-black text-teal-custom">{pdis_generated_month || 0} criados</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DirectorDashboard;
