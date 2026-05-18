import React from 'react';
import { Link } from 'react-router-dom';
import CurvedLoop from './components/landingpage/CurvedLoop';
import Antigravity from './components/landingpage/Antigravity';
import { ArrowUpRight, ArrowDown, Building, GraduationCap, Heart, ShieldCheck, ArrowRight, Brain, ChartNoAxesCombined } from 'lucide-react';

const LandingPage = () => {
    const noiseStyle = {
        backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E\")",
        opacity: 0.02
    };

    return (
        <div className="text-primary-navy selection:bg-mint-light selection:text-teal-custom overflow-x-hidden font-body bg-slate-50">

            {/* Navbar */}
            <nav className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-xl border-b border-slate-100 transition-all duration-200">
                <div className="flex justify-between items-center px-8 py-5 max-w-[1440px] mx-auto">
                    <div className="flex items-center gap-12">
                        <div className="font-headline font-black text-3xl tracking-tighter text-primary-navy">Superdott .</div>
                        <div className="hidden md:flex gap-8 items-center">
                            <a className="text-slate-500 hover:text-teal-custom transition-colors duration-300 font-headline font-bold tracking-tight text-sm uppercase" href="#como-funciona">Como funciona</a>
                            <a className="text-slate-500 hover:text-teal-custom transition-colors duration-300 font-headline font-bold tracking-tight text-sm uppercase" href="#para-quem-serve">Para quem serve</a>
                            <a className="text-slate-500 hover:text-teal-custom transition-colors duration-300 font-headline font-bold tracking-tight text-sm uppercase" href="#beneficios">Benefícios</a>
                        </div>
                    </div>
                    <Link to="/login" className="transition-all duration-200 hover:scale-105 active:scale-95 bg-primary-navy text-white px-6 py-2.5 rounded-full font-headline font-semibold text-sm shadow-lg shadow-primary-navy/20 flex items-center gap-2">
                        Já sou cadastrado
                        <ArrowRight className="w-4 h-4" />
                    </Link>
                </div>
            </nav>

            <main>
                {/* Hero Section */}
                <section className="min-h-screen flex flex-col justify-center items-center px-6 relative overflow-hidden bg-slate-50 pt-20">
                    <div className="absolute inset-0 z-0">
                        <Antigravity
                            count={350}
                            magnetRadius={7}
                            ringRadius={7}
                            waveSpeed={0.4}
                            waveAmplitude={1.0}
                            particleSize={1.5}
                            lerpSpeed={0.05}
                            color="#2DD4BF"
                            autoAnimate={true}
                            particleVariance={1.0}
                            rotationSpeed={0.0}
                            particleShape={"sphere"}
                            depthFactor={1.0}
                        />
                    </div>

                    <div className="max-w-5xl w-full text-center z-20 relative pointer-events-none mt-10">
                        <div className="mb-6 flex justify-center">
                            <span className="px-4 py-1.5 rounded-full bg-mint-light/80 text-teal-custom font-headline font-bold text-xs tracking-widest uppercase border border-teal-custom/20 backdrop-blur-md flex items-center gap-2">
                                SISTEMA PARA PRÉ-DIAGNÓSTICO DE SUPERDOTADOS
                            </span>
                        </div>
                        <h1 className="font-headline font-black text-5xl md:text-7xl lg:text-8xl text-primary-navy tracking-tight leading-[1.05] mb-8">
                            Identifique a superdotação em sua casa ou escola.
                        </h1>
                        <p className="font-body text-lg md:text-xl text-slate-500 max-w-3xl mx-auto leading-relaxed mb-12">
                            Uma plataforma SaaS dedicada a escolas, professores e famílias para realizar análises inteligentes, relatórios consolidados e Planos de Desenvolvimento Individualizados (PDI) de forma 100% segura e anônima.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
                            <Link to="/triagem-plg" className="pointer-events-auto bg-gradient-to-br from-primary-navy to-teal-custom text-white px-10 py-4 rounded-full font-headline font-bold text-lg hover:shadow-lg hover:shadow-primary-navy/30 transition-all duration-300 active:scale-95 flex items-center gap-2">
                                Faça uma Triagem Rápida
                                <ArrowUpRight className="w-5 h-5" strokeWidth={2.5} />
                            </Link>
                            <a href="#como-funciona" className="pointer-events-auto text-primary-navy font-headline font-bold text-lg flex items-center gap-2 group hover:text-teal-custom transition-all py-2">
                                Saiba mais
                                <ArrowDown className="w-5 h-5 group-hover:translate-y-1 transition-transform" strokeWidth={2.5} />
                            </a>
                        </div>
                    </div>
                </section>

                <section className="py-2 bg-white border-y border-slate-50 overflow-hidden text-primary-navy">
                    <CurvedLoop
                        marqueeText="FAÇA ✦ MAIS ✦ COM ✦ SUPERDOTT ✦ "
                        speed={1.3}
                        curveAmount={50}
                        direction="left"
                        interactive={true}
                        className="font-headline text-primary-navy"
                    />
                </section>

                {/* Como Funciona Section */}
                <section className="py-32 bg-white overflow-hidden border-t border-slate-100 scroll-mt-28" id="como-funciona">
                    <div className="max-w-[1440px] mx-auto px-8 relative">
                        <div className="mb-24 text-center max-w-3xl mx-auto">
                            <h2 className="font-headline font-bold text-xs uppercase tracking-widest text-teal-custom mb-4">Método Científico</h2>
                            <h3 className="font-headline font-black text-4xl md:text-5xl text-primary-navy tracking-tight mb-6">Como o Superdott Funciona?</h3>
                            <p className="font-body text-lg text-slate-500 leading-relaxed">Combinamos inteligência artificial e metodologias psicopedagógicas validadas pelo MEC para uma análise precisa.</p>
                        </div>
                        <div className="relative flex flex-col md:flex-row justify-between items-start gap-16 md:gap-0">
                            <div className="hidden md:block absolute top-10 left-12 w-[calc(100%-6rem)] h-0.5 bg-slate-100 z-0"></div>

                            <div className="relative z-10 w-full md:w-1/3 flex flex-col items-center md:items-start group px-4">
                                <div className="w-20 h-20 bg-mint-light rounded-full flex items-center justify-center mb-6 border-4 border-white shadow-sm transition-transform duration-500 group-hover:scale-110">
                                    <span className="font-headline font-black text-2xl text-teal-custom">1</span>
                                </div>
                                <h5 className="font-headline font-bold text-xl text-primary-navy mb-3">Triagem Inteligente</h5>
                                <p className="font-body text-sm text-slate-500 leading-relaxed text-center md:text-left">
                                    Pais ou docentes respondem a um questionário dinâmico sobre características cognitivas, criatividade e liderança da criança.
                                </p>
                            </div>

                            <div className="relative z-10 w-full md:w-1/3 flex flex-col items-center md:items-start group px-4">
                                <div className="w-20 h-20 bg-mint-light rounded-full flex items-center justify-center mb-6 border-4 border-white shadow-sm transition-transform duration-500 group-hover:scale-110">
                                    <span className="font-headline font-black text-2xl text-teal-custom">2</span>
                                </div>
                                <h5 className="font-headline font-bold text-xl text-primary-navy mb-3">Anonimização e IA</h5>
                                <p className="font-body text-sm text-slate-500 leading-relaxed text-center md:text-left">
                                    Os dados são anonimizados localmente (Zero-Trust LGPD) e processados pela IA contextual para gerar insights profundos.
                                </p>
                            </div>

                            <div className="relative z-10 w-full md:w-1/3 flex flex-col items-center md:items-start group px-4">
                                <div className="w-20 h-20 bg-mint-light rounded-full flex items-center justify-center mb-6 border-4 border-white shadow-sm transition-transform duration-500 group-hover:scale-110">
                                    <span className="font-headline font-black text-2xl text-teal-custom">3</span>
                                </div>
                                <h5 className="font-headline font-bold text-xl text-primary-navy mb-3">Plano de Apoio (PDI)</h5>
                                <p className="font-body text-sm text-slate-500 leading-relaxed text-center md:text-left">
                                    Geração automatizada de Planos de Desenvolvimento Individualizados (PDI) com estratégias pedagógicas sob medida.
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Audiences Section */}
                <section className="py-32 bg-slate-50 scroll-mt-28" id="para-quem-serve">
                    <div className="max-w-[1440px] mx-auto px-8">
                        <div className="mb-20 max-w-2xl">
                            <h2 className="font-headline font-bold text-xs uppercase tracking-widest text-teal-custom mb-4">Para quem serve</h2>
                            <h3 className="font-headline font-black text-4xl md:text-5xl text-primary-navy tracking-tight leading-tight">O Ecossistema Superdott.</h3>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

                            <div className="p-10 bg-white rounded-3xl border border-slate-100 shadow-sm group hover:shadow-xl hover:-translate-y-2 transition-all duration-500">
                                <div className="mb-6 inline-block px-3 py-1 bg-slate-100 text-slate-500 font-headline font-bold text-[10px] tracking-widest uppercase rounded-full">
                                    Gestão Institucional
                                </div>
                                <div className="mb-8 w-14 h-14 flex items-center justify-center bg-mint-light/50 rounded-2xl group-hover:bg-teal-custom transition-colors duration-500">
                                    <Building className="w-8 h-8 text-teal-custom group-hover:text-white transition-colors duration-500" strokeWidth={1.5} />
                                </div>
                                <h4 className="font-headline font-bold text-2xl text-primary-navy mb-4">Escolas e Diretores</h4>
                                <p className="font-body text-slate-500 leading-relaxed mb-6">
                                    Tenha controle macro do progresso de inclusão escolar, visualize o desempenho dos docentes e exporte relatórios consolidados em conformidade com as diretrizes do MEC.
                                </p>
                                <ul className="text-sm font-body text-slate-600 space-y-2">
                                    <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-teal-custom"></div>Dashboard administrativo unificado</li>
                                    <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-teal-custom"></div>Estatísticas agregadas de engajamento</li>
                                    <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-teal-custom"></div>Geração rápida de laudos corporativos</li>
                                </ul>
                            </div>

                            <div className="p-10 bg-white rounded-3xl border border-slate-100 shadow-sm group hover:shadow-xl hover:-translate-y-2 transition-all duration-500">
                                <div className="mb-6 inline-block px-3 py-1 bg-slate-100 text-slate-500 font-headline font-bold text-[10px] tracking-widest uppercase rounded-full">
                                    Prática Pedagógica
                                </div>
                                <div className="mb-8 w-14 h-14 flex items-center justify-center bg-mint-light/50 rounded-2xl group-hover:bg-teal-custom transition-colors duration-500">
                                    <GraduationCap className="w-8 h-8 text-teal-custom group-hover:text-white transition-colors duration-500" strokeWidth={1.5} />
                                </div>
                                <h4 className="font-headline font-bold text-2xl text-primary-navy mb-4">Professores e Docentes</h4>
                                <p className="font-body text-slate-500 leading-relaxed mb-6">
                                    Obtenha insights em tempo real para enriquecimento curricular, crie adaptações curriculares com suporte de IA contextual e acesse um workbench pedagógico completo.
                                </p>
                                <ul className="text-sm font-body text-slate-600 space-y-2">
                                    <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-teal-custom"></div>Workbench de alunos integrado</li>
                                    <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-teal-custom"></div>Sugestões de hiperfocos e metodologias</li>
                                </ul>
                            </div>

                            <div className="p-10 bg-white rounded-3xl border border-slate-100 shadow-sm group hover:shadow-xl hover:-translate-y-2 transition-all duration-500">
                                <div className="mb-6 inline-block px-3 py-1 bg-slate-100 text-slate-500 font-headline font-bold text-[10px] tracking-widest uppercase rounded-full">
                                    Suporte Afetivo
                                </div>
                                <div className="mb-8 w-14 h-14 flex items-center justify-center bg-mint-light/50 rounded-2xl group-hover:bg-teal-custom transition-colors duration-500">
                                    <Heart className="w-8 h-8 text-teal-custom group-hover:text-white transition-colors duration-500" strokeWidth={1.5} />
                                </div>
                                <h4 className="font-headline font-bold text-2xl text-primary-navy mb-4">Pais e Família</h4>
                                <p className="font-body text-slate-500 leading-relaxed mb-6">
                                    Realize a triagem do seu filho de forma rápida, acesse orientações claras sobre mediação no cotidiano familiar e converse com um assistente empático.
                                </p>
                                <ul className="text-sm font-body text-slate-600 space-y-2">
                                    <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-teal-custom"></div>Triagem fácil para responsáveis</li>
                                    <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-teal-custom"></div>Chat acolhedor sem jargões complexos</li>
                                    <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-teal-custom"></div>Dicas de suporte doméstico diário</li>
                                </ul>
                            </div>

                        </div>
                    </div>
                </section>

                {/* Final CTA Section */}
                <section className="py-40 bg-white relative overflow-hidden border-t border-slate-100" id="beneficios">
                    <div className="absolute inset-0 pointer-events-none" style={noiseStyle}></div>
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-mint-accent/10 blur-[100px] rounded-full"></div>

                    <div className="max-w-[1440px] mx-auto px-8 relative z-10">
                        <div className="text-center mb-16">
                            <h2 className="font-headline font-bold text-xs uppercase tracking-widest text-teal-custom mb-4">Junte-se a nós</h2>
                            <h3 className="font-headline font-black text-5xl md:text-6xl text-primary-navy mb-6 tracking-tight">
                                Pronto para começar a transformar a educação especial?
                            </h3>
                            <p className="font-body text-lg md:text-xl text-slate-500 max-w-2xl mx-auto leading-relaxed">
                                Escolha o fluxo ideal para criar sua conta hoje. Proteção e anonimato desde o primeiro clique.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                            <div className="p-10 bg-slate-50 rounded-3xl border border-slate-200 flex flex-col justify-between items-start group hover:border-teal-custom/30 transition-colors">
                                <div>
                                    <h4 className="font-headline font-black text-2xl text-primary-navy mb-4">Sou Pai ou Responsável</h4>
                                    <p className="font-body text-slate-600 leading-relaxed mb-10">
                                        Quero iniciar uma triagem de altas habilidades do meu filho para obter orientações e vincular o perfil com a instituição de ensino.
                                    </p>
                                </div>
                                <Link to="/triagem-plg" className="w-full bg-primary-navy text-white px-8 py-4 rounded-xl font-headline font-bold text-center hover:bg-teal-custom transition-colors">
                                    Iniciar como Responsável
                                </Link>
                            </div>

                            <div className="p-10 bg-slate-50 rounded-3xl border border-slate-200 flex flex-col justify-between items-start group hover:border-teal-custom/30 transition-colors">
                                <div>
                                    <h4 className="font-headline font-black text-2xl text-primary-navy mb-4">Sou Escola ou Diretor</h4>
                                    <p className="font-body text-slate-600 leading-relaxed mb-10">
                                        Quero registrar minha instituição escolar no Superdott para integrar diretores, docentes, emitir relatórios corporativos e PDIs.
                                    </p>
                                </div>
                                <Link to="/login" className="w-full bg-transparent border-2 border-primary-navy text-primary-navy px-8 py-4 rounded-xl font-headline font-bold text-center hover:bg-primary-navy hover:text-white transition-all flex items-center justify-center gap-2">
                                    Registrar Instituição Escolar
                                    <ArrowRight className="w-4 h-4" strokeWidth={2.5} />
                                </Link>
                            </div>
                        </div>
                    </div>
                </section>
            </main>

            {/* Footer */}
            <footer className="w-full py-16 px-8 bg-slate-50 border-t border-slate-200" id="about">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 max-w-[1440px] mx-auto">
                    <div className="flex flex-col gap-4">
                        <div className="font-headline font-black text-xl text-primary-navy">Superdott .</div>
                        <p className="font-body text-xs leading-relaxed text-slate-500">
                            © 2026 Superdott.
                        </p>
                        <div className="inline-flex items-center gap-2 mt-2 px-3 py-1.5 bg-mint-light/50 border border-teal-custom/20 rounded-md w-max">
                            <ShieldCheck className="w-4 h-4 text-teal-custom" />
                            <Brain className="w-4 h-4 text-teal-custom" />
                            <ChartNoAxesCombined className="w-4 h-4 text-teal-custom" />
                        </div>
                    </div>

                    <div className="flex flex-col gap-3">
                        <h6 className="font-headline font-bold text-[10px] uppercase tracking-widest text-primary-navy mb-1">Legal</h6>
                        <Link className="text-slate-500 hover:text-teal-custom font-body text-sm transition-colors" to="#">Política de Privacidade</Link>
                        <Link className="text-slate-500 hover:text-teal-custom font-body text-sm transition-colors" to="#">Termos de Serviço</Link>
                    </div>
                    <div className="flex flex-col gap-3">
                        <h6 className="font-headline font-bold text-[10px] uppercase tracking-widest text-primary-navy mb-1">Contato</h6>
                        <p className="font-body text-sm text-slate-500">contato@superdott.edu</p>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default LandingPage;