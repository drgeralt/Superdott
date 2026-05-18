import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const routeInfo = {
    '/profile': { title: 'Meu Perfil', desc: 'Gerencie suas credenciais de segurança, aceite de termos de privacidade LGPD e informações da conta.', icon: 'manage_accounts', color: 'from-blue-500 to-indigo-600' },
    '/admin/rag': { title: 'Gerenciamento do Motor RAG', desc: 'Configurações avançadas do LLM (Gemini), calibração de prompts de sistema de Zero-Trust e fontes de vetores pedagógicos.', icon: 'neurology', color: 'from-purple-600 to-pink-600' },
    '/admin/metrics': { title: 'Métricas Globais', desc: 'Estatísticas consolidadas de engajamento da rede, tempos de resposta e uso do motor RAG.', icon: 'analytics', color: 'from-emerald-500 to-teal-600' },
    '/escola': { title: 'Gestão da Escola', desc: 'Informações institucionais, salas de recursos multifuncionais e relatórios de conformidade com o MEC.', icon: 'domain', color: 'from-teal-500 to-emerald-600' },
    '/professores': { title: 'Professores Vinculados', desc: 'Gestão do corpo docente ativo, alocação em turmas e permissões de acompanhamento individual (PDI).', icon: 'school', color: 'from-amber-500 to-orange-600' },
    '/importar-alunos': { title: 'Importar Alunos', desc: 'Envio de planilhas consolidadas e enturmação em lote em conformidade com as regras da LGPD (anonimização automática).', icon: 'upload_file', color: 'from-cyan-500 to-blue-600' },
    '/vinculos': { title: 'Vínculos Acadêmicos', desc: 'Aprovação de acessos familiares e vínculos ativos entre alunos, responsáveis e professores.', icon: 'link', color: 'from-rose-500 to-red-600' },
    '/alunos': { title: 'Meus Alunos', desc: 'Listagem dos perfis dos alunos da sua turma e progresso individual dos diagnósticos.', icon: 'group', color: 'from-blue-500 to-teal-500' },
    '/pdis': { title: 'PDIs Pendentes', desc: 'Fila de elaboração e revisão de Planos de Desenvolvimento Individualizado (PDI) integrados com a IA.', icon: 'pending_actions', color: 'from-amber-500 to-yellow-600' },
    '/filhos': { title: 'Meus Filhos', desc: 'Acompanhamento do progresso pedagógico, notas da triagem e suporte direto.', icon: 'child_care', color: 'from-teal-500 to-cyan-500' },
    '/codigos-vinculo': { title: 'Códigos de Vínculo', desc: 'Gere códigos de acesso seguros para vincular a escola do seu filho ao perfil de acompanhamento.', icon: 'key', color: 'from-violet-500 to-purple-600' },
};

const PlaceholderPage = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const info = routeInfo[location.pathname] || {
        title: 'Módulo em Homologação',
        desc: 'Este módulo está em fase final de validação e será disponibilizado na próxima Sprint.',
        icon: 'settings',
        color: 'from-slate-500 to-slate-700'
    };

    return (
        <div className="max-w-4xl mx-auto py-12 animate-[fadeIn_0.5s_ease-out]">
            <div className="bg-white rounded-3xl border border-slate-100 shadow-xl overflow-hidden">
                {/* Header Gradient */}
                <div className={`bg-[linear-gradient(135deg,#0C2C47_0%,#4A9D95_100%)] p-10 text-white flex flex-col md:flex-row justify-between items-start md:items-center gap-6`}>
                    <div className="space-y-2">
                        <span className="inline-block px-3 py-1 bg-white/15 text-white font-label text-[10px] font-bold uppercase tracking-widest rounded-full leading-none">
                            Ambiente Corporativo SaaS
                        </span>
                        <h2 className="font-headline text-3xl font-extrabold tracking-tight flex items-center gap-3">
                            <span className="material-symbols-outlined text-4xl">{info.icon}</span>
                            {info.title}
                        </h2>
                    </div>
                </div>

                {/* Content */}
                <div className="p-8 md:p-12 space-y-8 text-center md:text-left">
                    <div className="flex flex-col md:flex-row gap-8 items-center">
                        <div className="w-24 h-24 rounded-2xl bg-slate-50 flex items-center justify-center border border-slate-100 shrink-0 shadow-inner">
                            <span className="material-symbols-outlined text-slate-400 text-5xl animate-[pulse_2s_infinite]">
                                {info.icon}
                            </span>
                        </div>
                        <div className="space-y-3">
                            <h3 className="font-headline font-bold text-xl text-primary-navy">
                                Funcionalidade em Desenvolvimento
                            </h3>
                            <p className="text-slate-600 text-sm leading-relaxed font-semibold">
                                {info.desc}
                            </p>
                        </div>
                    </div>

                    <div className="pt-8 border-t border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-4">
                        <div>
                            <span className="text-xs text-slate-400 block font-semibold">Status de Liberação</span>
                            <span className="text-sm font-bold text-teal-custom block flex items-center gap-1.5 justify-center sm:justify-start">
                                <span className="w-2.5 h-2.5 bg-teal-custom rounded-full animate-ping"></span>
                                Homologando no Staging
                            </span>
                        </div>
                        <button 
                            onClick={() => navigate('/dashboard')}
                            className="px-6 py-2.5 bg-primary-navy hover:bg-primary-navy/90 text-white rounded-full font-headline font-bold text-sm shadow-md hover:scale-[1.02] active:scale-95 transition-all flex items-center gap-2"
                        >
                            <span className="material-symbols-outlined text-lg">arrow_back</span>
                            Ir para o Dashboard
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PlaceholderPage;
