import React from 'react';

const SuperAdminDashboard = ({ data }) => {
    const { total_students, active_teachers, total_schools } = data?.metrics || {};

    return (
        <div className="space-y-8 animate-[fadeIn_0.5s_ease-out]">
            {/* Boas-vindas premium */}
            <div className="bg-[linear-gradient(135deg,#0C2C47_0%,#4A9D95_100%)] p-8 rounded-3xl text-white shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <span className="inline-block px-3 py-1 bg-white/10 text-white font-label text-[10px] font-bold uppercase tracking-widest rounded-full mb-3">
                        Administração Global da Plataforma
                    </span>
                    <h2 className="font-headline text-3xl font-extrabold tracking-tight">
                        Painel do Super Administrador
                    </h2>
                    <p className="text-white/80 mt-1 max-w-xl text-sm leading-relaxed">
                        Visão consolidada de todas as instituições, educadores e estudantes cadastrados na plataforma Superdott.
                    </p>
                </div>
                <div className="flex gap-3">
                    <div className="bg-white/10 px-4 py-3 rounded-2xl border border-white/10 text-center backdrop-blur-sm">
                        <span className="text-2xl font-black block font-headline">{total_schools || 0}</span>
                        <span className="text-[10px] uppercase font-bold text-white/70 tracking-wider">Escolas</span>
                    </div>
                </div>
            </div>

            {/* Grid de Cards de Métricas Globais */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Total de Alunos */}
                <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all hover:scale-[1.02] flex items-center gap-4 group">
                    <div className="w-12 h-12 rounded-xl bg-teal-custom/10 text-teal-custom flex items-center justify-center group-hover:bg-teal-custom group-hover:text-white transition-colors duration-300 shrink-0">
                        <span className="material-symbols-outlined text-2.5xl">group</span>
                    </div>
                    <div>
                        <span className="text-xs font-semibold text-slate-500 block uppercase tracking-wider font-bold">Alunos Mapeados</span>
                        <h3 className="text-3xl font-black font-headline text-primary-navy mt-0.5">{total_students || 0}</h3>
                    </div>
                </div>

                {/* Professores Cadastrados */}
                <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all hover:scale-[1.02] flex items-center gap-4 group">
                    <div className="w-12 h-12 rounded-xl bg-blue-500/10 text-blue-600 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-colors duration-300 shrink-0">
                        <span className="material-symbols-outlined text-2.5xl">school</span>
                    </div>
                    <div>
                        <span className="text-xs font-semibold text-slate-500 block uppercase tracking-wider font-bold">Docentes Ativos</span>
                        <h3 className="text-3xl font-black font-headline text-primary-navy mt-0.5">{active_teachers || 0}</h3>
                    </div>
                </div>

                {/* Escolas Ativas */}
                <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all hover:scale-[1.02] flex items-center gap-4 group">
                    <div className="w-12 h-12 rounded-xl bg-purple-500/10 text-purple-600 flex items-center justify-center group-hover:bg-purple-600 group-hover:text-white transition-colors duration-300 shrink-0">
                        <span className="material-symbols-outlined text-2.5xl">domain</span>
                    </div>
                    <div>
                        <span className="text-xs font-semibold text-slate-500 block uppercase tracking-wider font-bold">Escolas Cadastradas</span>
                        <h3 className="text-3xl font-black font-headline text-primary-navy mt-0.5">{total_schools || 0}</h3>
                    </div>
                </div>
            </div>

            {/* Painel Global de Ações e Métricas Avançadas */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Segurança e Configurações */}
                <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
                    <h3 className="font-headline font-bold text-lg text-primary-navy flex items-center gap-2">
                        <span className="material-symbols-outlined text-teal-custom">shield</span>
                        Controle Global & Segurança
                    </h3>
                    <p className="text-xs text-slate-500 leading-relaxed font-semibold">
                        Monitore a conformidade da LGPD, audite logs de acesso e gerencie as chaves de API da plataforma.
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                        <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl hover:border-teal-custom/30 transition-colors">
                            <span className="material-symbols-outlined text-teal-custom text-2xl block mb-2">security</span>
                            <h4 className="text-sm font-bold text-primary-navy mb-1">Status da LGPD</h4>
                            <p className="text-[11px] text-slate-500 font-semibold">100% dos termos aceitos e auditados no banco.</p>
                        </div>
                        <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl hover:border-teal-custom/30 transition-colors">
                            <span className="material-symbols-outlined text-blue-600 text-2xl block mb-2">dns</span>
                            <h4 className="text-sm font-bold text-primary-navy mb-1">Serviço de IA</h4>
                            <p className="text-[11px] text-slate-500 font-semibold">Uptime global de 99.98% com tempos de resposta &lt;1.2s.</p>
                        </div>
                    </div>
                </div>

                {/* Status Operacional */}
                <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between">
                    <div>
                        <h3 className="font-headline font-bold text-lg text-primary-navy mb-2 flex items-center gap-2">
                            <span className="material-symbols-outlined text-purple-600">query_stats</span>
                            Desempenho da Rede
                        </h3>
                        <p className="text-xs text-slate-500 leading-relaxed font-semibold">
                            A adesão nacional do Superdott está acelerando. Atualmente, o ecossistema processa com inteligência artificial centenas de PDIs por semana com alta precisão e conformidade ética pedagógica.
                        </p>
                    </div>
                    <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
                        <div>
                            <span className="text-xs text-slate-400 block font-semibold">Diagnósticos Gerados</span>
                            <span className="text-sm font-bold text-teal-custom block">Média de 4.8 dias por triagem completa</span>
                        </div>
                        <div className="w-10 h-10 rounded-full bg-teal-custom/5 text-teal-custom flex items-center justify-center font-bold text-xs">
                            Ativo
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SuperAdminDashboard;
