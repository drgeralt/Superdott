import React from 'react';
import { useNavigate } from 'react-router-dom';
import logoImg from './assets/img/logo.png';

const FeatureCard = ({ icon, title, desc, delay }) => (
    <div 
        className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md hover:scale-[1.03] transition-all duration-300 flex flex-col gap-4 text-left group"
        style={{ animationDelay: `${delay}ms` }}
    >
        <div className="w-12 h-12 rounded-2xl bg-teal-custom/10 text-teal-custom flex items-center justify-center group-hover:bg-teal-custom group-hover:text-white transition-colors duration-300 shrink-0">
            <span className="material-symbols-outlined text-2xl">{icon}</span>
        </div>
        <div className="space-y-2">
            <h4 className="font-headline font-bold text-lg text-primary-navy">{title}</h4>
            <p className="text-slate-600 text-sm leading-relaxed font-semibold">{desc}</p>
        </div>
    </div>
);

const PersonaCard = ({ icon, title, role, desc, points, color }) => (
    <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden flex flex-col hover:shadow-lg transition-shadow duration-300">
        <div className={`bg-gradient-to-r ${color} p-6 text-white flex items-center gap-4`}>
            <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-2xl">{icon}</span>
            </div>
            <div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-white/80 block">{role}</span>
                <h4 className="font-headline font-bold text-lg leading-tight">{title}</h4>
            </div>
        </div>
        <div className="p-6 flex-1 flex flex-col justify-between gap-6">
            <p className="text-slate-600 text-sm font-semibold leading-relaxed">{desc}</p>
            <ul className="space-y-2.5">
                {points.map((pt, idx) => (
                    <li key={idx} className="flex items-start gap-2.5 text-xs text-slate-500 font-bold">
                        <span className="material-symbols-outlined text-teal-custom text-base shrink-0">check_circle</span>
                        <span>{pt}</span>
                    </li>
                ))}
            </ul>
        </div>
    </div>
);

const LandingPage = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-slate-50/50 flex flex-col overflow-x-hidden">
            {/* Header / Navbar */}
            <header className="fixed top-0 left-0 w-full bg-white/80 backdrop-blur-md border-b border-slate-100 px-6 py-4 flex items-center justify-between z-50 shadow-sm">
                <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
                    <img src={logoImg} alt="Superdott Logo" className="w-8 h-8 object-contain shrink-0" />
                    <span className="font-headline font-extrabold text-2xl text-primary-navy tracking-tighter">Superdott.</span>
                </div>
                
                <nav className="hidden md:flex items-center gap-8">
                    <a href="#como-funciona" className="text-slate-500 hover:text-primary-navy text-sm font-bold transition-colors">Como funciona</a>
                    <a href="#para-quem-serve" className="text-slate-500 hover:text-primary-navy text-sm font-bold transition-colors">Para quem serve</a>
                    <a href="#beneficios" className="text-slate-500 hover:text-primary-navy text-sm font-bold transition-colors">Benefícios</a>
                </nav>

                <div className="flex items-center gap-3">
                    <button 
                        onClick={() => navigate('/login')}
                        className="px-5 py-2.5 bg-slate-50 hover:bg-slate-100 text-primary-navy font-headline font-bold text-sm rounded-full transition-all border border-slate-200 active:scale-95 flex items-center gap-1.5"
                    >
                        <span className="material-symbols-outlined text-lg">login</span>
                        Já sou cadastrado
                    </button>
                </div>
            </header>

            {/* Hero Section */}
            <section className="pt-32 pb-20 px-6 bg-gradient-to-b from-teal-custom/5 via-transparent to-transparent text-center relative overflow-hidden flex flex-col items-center">
                <div className="max-w-4xl mx-auto space-y-6 relative z-10">
                    <span className="inline-block px-4 py-1.5 bg-teal-custom/10 text-teal-custom font-label text-[11px] font-extrabold uppercase tracking-wider rounded-full">
                        🚀 IA Contextual e LGPD Zero-Trust
                    </span>
                    <h1 className="font-headline text-4xl sm:text-5xl md:text-6xl font-black text-primary-navy tracking-tight leading-[1.1] max-w-3xl mx-auto">
                        Identifique Altas Habilidades com <span className="bg-gradient-to-r from-primary-navy to-teal-custom bg-clip-text text-transparent">Excelência e IA</span>
                    </h1>
                    <p className="text-slate-600 text-base sm:text-lg md:text-xl max-w-2xl mx-auto leading-relaxed font-semibold">
                        Uma plataforma SaaS dedicada a escolas, professores e famílias para realizar triagens inteligentes, relatórios consolidados e Planos de Desenvolvimento Individualizados (PDI) de forma 100% segura e anonimizada.
                    </p>
                    
                    <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
                        <button 
                            onClick={() => navigate('/triagem-plg')}
                            className="w-full sm:w-auto px-8 py-4 bg-[linear-gradient(135deg,#0C2C47_0%,#4A9D95_100%)] text-white font-headline font-bold text-base rounded-full shadow-lg hover:shadow-primary-navy/20 hover:scale-[1.03] active:scale-95 transition-all flex items-center justify-center gap-2"
                        >
                            Faça uma Triagem Rápida
                            <span className="material-symbols-outlined text-xl">arrow_forward</span>
                        </button>
                        <a 
                            href="#como-funciona"
                            className="w-full sm:w-auto px-8 py-4 bg-white hover:bg-slate-50 text-slate-700 font-headline font-bold text-base rounded-full border border-slate-200 transition-all flex items-center justify-center gap-1.5"
                        >
                            Saiba mais
                        </a>
                    </div>
                </div>
            </section>

            {/* Como Funciona Section */}
            <section id="como-funciona" className="py-20 px-6 bg-white text-center">
                <div className="max-w-5xl mx-auto space-y-12">
                    <div className="space-y-3">
                        <span className="text-[11px] font-bold text-teal-custom uppercase tracking-wider block">Método Científico</span>
                        <h2 className="font-headline text-3xl sm:text-4xl font-extrabold text-primary-navy">Como o Superdott Funciona?</h2>
                        <p className="text-slate-500 text-sm max-w-xl mx-auto font-semibold">
                            Combinamos inteligência artificial e metodologias psicopedagógicas validadas pelo MEC para uma análise precisa.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <FeatureCard 
                            icon="checklist"
                            title="1. Triagem Inteligente"
                            desc="Pais ou docentes respondem a um questionário dinâmico sobre características cognitivas, criatividade e liderança da criança."
                            delay={100}
                        />
                        <FeatureCard 
                            icon="vpn_lock"
                            title="2. Anonimização e IA"
                            desc="Os dados são anonimizados localmente (Zero-Trust LGPD) e processados pela IA contextual para gerar insights profundos."
                            delay={200}
                        />
                        <FeatureCard 
                            icon="description"
                            title="3. Plano de Apoio (PDI)"
                            desc="Geração automatizada de Planos de Desenvolvimento Individualizados (PDI) com estratégias pedagógicas sob medida."
                            delay={300}
                        />
                    </div>
                </div>
            </section>

            {/* Para Quem Serve Section */}
            <section id="para-quem-serve" className="py-20 px-6 bg-slate-50/50">
                <div className="max-w-5xl mx-auto space-y-12">
                    <div className="text-center space-y-3">
                        <span className="text-[11px] font-bold text-teal-custom uppercase tracking-wider block">Flexibilidade Contextual</span>
                        <h2 className="font-headline text-3xl sm:text-4xl font-extrabold text-primary-navy">Experiências Customizadas</h2>
                        <p className="text-slate-500 text-sm max-w-xl mx-auto font-semibold">
                            Nossa IA contextual se adapta de acordo com o perfil do usuário logado para oferecer as ferramentas corretas.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        <PersonaCard 
                            icon="domain"
                            role="Gestão Institucional"
                            title="Escolas e Diretores"
                            desc="Tenha controle macro do progresso de inclusão escolar, visualize o desempenho dos docentes e exporte relatórios consolidados em conformidade com as diretrizes do MEC."
                            points={[
                                "Dashboard administrativo unificado",
                                "Estatísticas agregadas de engajamento",
                                "Geração rápida de laudos corporativos"
                            ]}
                            color="from-blue-600 to-indigo-600"
                        />
                        <PersonaCard 
                            icon="school"
                            role="Prática Pedagógica"
                            title="Professores e Docentes"
                            desc="Obtenha insights em tempo real para enriquecimento curricular, crie adaptações curriculares com suporte de IA contextual e acesse um workbench pedagógico completo."
                            points={[
                                "Workbench de alunos integrado",
                                "Sugestões de hiperfocos e metodologias",
                                "Elaboração e exportação de PDIs"
                            ]}
                            color="from-teal-600 to-emerald-600"
                        />
                        <PersonaCard 
                            icon="child_care"
                            role="Suporte Afetivo"
                            title="Pais e Família"
                            desc="Realize a triagem do seu filho de forma rápida, acesse orientações claras sobre mediação no cotidiano familiar e converse com um assistente empático dedicado ao bem-estar familiar."
                            points={[
                                "Triagem fácil para responsáveis",
                                "Chat acolhedor sem jargões complexos",
                                "Dicas de suporte doméstico diário"
                            ]}
                            color="from-amber-500 to-orange-600"
                        />
                    </div>
                </div>
            </section>

            {/* Cadastro Section */}
            <section id="cadastro" className="py-24 px-6 bg-white text-center border-t border-slate-100">
                <div className="max-w-4xl mx-auto space-y-12">
                    <div className="space-y-4">
                        <span className="text-[11px] font-bold text-teal-custom uppercase tracking-wider block">Junte-se a nós</span>
                        <h2 className="font-headline text-3xl sm:text-4xl font-extrabold text-primary-navy">
                            Pronto para começar a transformar a educação especial?
                        </h2>
                        <p className="text-slate-500 text-sm max-w-xl mx-auto font-semibold">
                            Escolha o fluxo ideal para criar sua conta hoje. Proteção Zero-Trust e anonimização PII ativas em conformidade com a LGPD.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-3xl mx-auto">
                        {/* Pais */}
                        <div className="bg-slate-50/50 p-8 rounded-3xl border border-slate-100 flex flex-col justify-between gap-6 hover:scale-[1.01] hover:border-teal-custom/30 transition-all text-left">
                            <div className="space-y-3">
                                <div className="w-12 h-12 rounded-2xl bg-teal-custom/10 text-teal-custom flex items-center justify-center shrink-0">
                                    <span className="material-symbols-outlined text-2xl">child_care</span>
                                </div>
                                <h3 className="font-headline font-bold text-xl text-primary-navy">Sou Pai ou Responsável</h3>
                                <p className="text-xs text-slate-500 leading-relaxed font-semibold">
                                    Quero iniciar uma triagem de altas habilidades do meu filho para obter orientações e vincular o perfil com a instituição de ensino.
                                </p>
                            </div>
                            <button
                                onClick={() => navigate('/triagem-plg')}
                                className="w-full py-3.5 bg-teal-custom hover:bg-teal-custom/90 text-white font-headline font-bold text-sm rounded-full shadow-md transition-all active:scale-95 flex items-center justify-center gap-2"
                            >
                                Iniciar como Responsável
                                <span className="material-symbols-outlined text-lg">arrow_forward</span>
                            </button>
                        </div>

                        {/* Escolas */}
                        <div className="bg-slate-50/50 p-8 rounded-3xl border border-slate-100 flex flex-col justify-between gap-6 hover:scale-[1.01] hover:border-primary-navy/30 transition-all text-left">
                            <div className="space-y-3">
                                <div className="w-12 h-12 rounded-2xl bg-primary-navy/10 text-primary-navy flex items-center justify-center shrink-0">
                                    <span className="material-symbols-outlined text-2xl">domain</span>
                                </div>
                                <h3 className="font-headline font-bold text-xl text-primary-navy">Sou Escola ou Diretor</h3>
                                <p className="text-xs text-slate-500 leading-relaxed font-semibold">
                                    Quero registrar minha instituição escolar no Superdott para integrar diretores, docentes, emitir relatórios corporativos e PDIs.
                                </p>
                            </div>
                            <button
                                onClick={() => navigate('/register')}
                                className="w-full py-3.5 bg-primary-navy hover:bg-primary-navy/90 text-white font-headline font-bold text-sm rounded-full shadow-md transition-all active:scale-95 flex items-center justify-center gap-2"
                            >
                                Registrar Instituição Escolar
                                <span className="material-symbols-outlined text-lg">arrow_forward</span>
                            </button>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="mt-auto py-8 bg-slate-50 border-t border-slate-200/50 px-6 text-center">
                <div className="max-w-5xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4">
                    <div className="flex items-center gap-2">
                        <img src={logoImg} alt="Logo" className="w-6 h-6 object-contain" />
                        <span className="font-headline font-bold text-sm text-primary-navy">Superdott. © 2026</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-slate-400 font-bold uppercase tracking-wider">
                        <span className="material-symbols-outlined text-sm">lock</span>
                        <span>Anonimização PII & Segurança MEC ativas</span>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default LandingPage;
