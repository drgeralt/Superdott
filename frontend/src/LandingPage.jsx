import { Link } from 'react-router-dom';
import CurvedLoop from './components/landingpage/CurvedLoop';
import Antigravity from './components/landingpage/Antigravity';
import { Brain, Layers, ChartNoAxesCombined, ArrowUpRight, ArrowDown } from 'lucide-react';
const LandingPage = () => {
    const noiseStyle = {
        backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E\")",
        opacity: 0.02
    };

    return (
        <div className="text-primary-navy selection:bg-mint-light selection:text-teal-custom overflow-x-hidden font-body bg-slate-50">

            <nav className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-xl border-b border-slate-100 transition-all duration-200">
                <div className="flex justify-between items-center px-8 py-5 max-w-[1440px] mx-auto">
                    <div className="flex items-center gap-12">
                        <div className="font-headline font-black text-3xl tracking-tighter text-primary-navy">Superdott .</div>
                        <div className="hidden md:flex gap-8 items-center">
                            <a className="text-slate-500 font-medium hover:text-teal-custom transition-colors duration-300 font-headline font-bold tracking-tight text-sm uppercase" href="#pillars">Pilares</a>
                            <a className="text-slate-500 font-medium hover:text-teal-custom transition-colors duration-300 font-headline font-bold tracking-tight text-sm uppercase" href="#methodology">Metodologia</a>
                            <a className="text-slate-500 font-medium hover:text-teal-custom transition-colors duration-300 font-headline font-bold tracking-tight text-sm uppercase" href="#about">Sobre</a>
                        </div>
                    </div>
                    <Link to="/login" className="transition-all duration-200 hover:scale-105 active:scale-95 bg-primary-navy text-white px-6 py-2.5 rounded-full font-headline font-semibold text-sm shadow-lg shadow-primary-navy/20">
                        Login
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

                    {/* z-20 garante que fique acima do canvas 3d */}
                    <div className="max-w-5xl w-full text-center z-20 relative pointer-events-none">
                        <div className="mb-8 flex justify-center">
                            <span className="px-4 py-1.5 rounded-full bg-mint-light/80 text-teal-custom font-headline font-bold text-xs tracking-widest uppercase border border-teal-custom/20 backdrop-blur-md">
                                Sistema para Pré-Diagnóstico de Superdotados
                            </span>
                        </div>
                        <h1 className="font-headline font-black text-5xl md:text-7xl lg:text-8xl text-primary-navy tracking-tight leading-[1.05] mb-8">
                            Identifique a superdotação em sua escola ou casa.
                        </h1>
                        <p className="font-body text-lg md:text-xl text-slate-500 max-w-2xl mx-auto leading-relaxed mb-12">
                            Nossa metodologia combina precisão técnica e IA avançada para mapear talentos e impulsionar o aprendizado.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
                            <Link to="/triagemgratuita" className="pointer-events-auto bg-gradient-to-br from-primary-navy to-teal-custom text-white px-10 py-4 rounded-full font-headline font-bold text-lg hover:shadow-lg hover:shadow-primary-navy/30 transition-all duration-300 active:scale-95 flex items-center gap-2">
                                Fazer Teste Gratuito
                                <ArrowUpRight className="w-5 h-5" strokeWidth={2.5} />
                            </Link>
                            <a href="#pillars" className="pointer-events-auto text-primary-navy font-headline font-bold text-lg flex items-center gap-2 group hover:text-teal-custom transition-all py-2">
                                Ver Ecossistema
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

                {/* Pillars Section */}
                <section className="py-32 bg-slate-50" id="pillars">
                    <div className="max-w-[1440px] mx-auto px-8">
                        <div className="mb-20 max-w-2xl">
                            <h2 className="font-headline font-bold text-xs uppercase tracking-widest text-teal-custom mb-4">Pilares</h2>
                            <h3 className="font-headline font-black text-4xl md:text-5xl text-primary-navy tracking-tight leading-tight">Arquitetura de detecção de alta performance.</h3>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

                            {/* Pillar 1 */}
                            <div className="p-10 bg-white rounded-3xl border border-slate-100 shadow-sm group hover:shadow-xl hover:-translate-y-2 transition-all duration-500">
                                <div className="mb-8 w-14 h-14 flex items-center justify-center bg-mint-light/50 rounded-2xl group-hover:bg-teal-custom transition-colors duration-500">
                                    <Layers className="w-8 h-8 text-teal-custom group-hover:text-white transition-colors duration-500" strokeWidth={1.5} />
                                </div>
                                <h4 className="font-headline font-bold text-2xl text-primary-navy mb-4">Mapeamento Multidimensional</h4>
                                <p className="font-body text-slate-500 leading-relaxed">
                                    Analisamos padrões cognitivos, criatividade e aspectos socioemocionais para revelar o verdadeiro potencial do aluno.
                                </p>
                            </div>

                            {/* Pillar 2 */}
                            <div className="p-10 bg-white rounded-3xl border border-slate-100 shadow-sm group hover:shadow-xl hover:-translate-y-2 transition-all duration-500">
                                <div className="mb-8 w-14 h-14 flex items-center justify-center bg-mint-light/50 rounded-2xl group-hover:bg-teal-custom transition-colors duration-500">
                                    <Brain className="w-8 h-8 text-teal-custom group-hover:text-white transition-colors duration-500" strokeWidth={1.5} />
                                </div>
                                <h4 className="font-headline font-bold text-2xl text-primary-navy mb-4">Inteligência Pedagógica Aplicada</h4>
                                <p className="font-body text-slate-500 leading-relaxed">
                                    Traduzimos os resultados da triagem em planos de ação práticos, sugerindo intervenções e trilhas de aprendizado personalizadas para cada perfil.
                                </p>
                            </div>

                            {/* Pillar 3 */}
                            <div className="p-10 bg-white rounded-3xl border border-slate-100 shadow-sm group hover:shadow-xl hover:-translate-y-2 transition-all duration-500">
                                <div className="mb-8 w-14 h-14 flex items-center justify-center bg-mint-light/50 rounded-2xl group-hover:bg-teal-custom transition-colors duration-500">
                                    <ChartNoAxesCombined className="w-8 h-8 text-teal-custom group-hover:text-white transition-colors duration-500" strokeWidth={1.5} />
                                </div>
                                <h4 className="font-headline font-bold text-2xl text-primary-navy mb-4">Analytics de Desenvolvimento</h4>
                                <p className="font-body text-slate-500 leading-relaxed">
                                    Modelagem preditiva para identificar necessidades futuras de desenvolvimento antes mesmo de se tornarem evidentes.
                                </p>
                            </div>

                        </div>
                    </div>
                </section>
                {/* The Flow Section */}
                <section className="py-32 bg-white overflow-hidden border-t border-slate-100" id="methodology">
                    <div className="max-w-[1440px] mx-auto px-8 relative">
                        <div className="mb-24 text-center">
                            {/*<h2 className="font-headline font-bold text-xs uppercase tracking-widest text-teal-custom mb-4">Fluxo de Excelência</h2>*/}
                            <h3 className="font-headline font-black text-4xl md:text-5xl text-primary-navy tracking-tight">Fluxo de Excelência</h3>
                        </div>
                        <div className="relative flex flex-col md:flex-row justify-between items-start gap-16 md:gap-0">
                            {/* Connector Line (Desktop) */}
                            <div className="hidden md:block absolute top-10 left-12 w-[calc(100%-6rem)] h-0.5 bg-slate-100 z-0"></div>

                            {/* Step 1 */}
                            <div className="relative z-10 w-full md:w-1/3 flex flex-col items-center md:items-start group px-4">
                                <div className="w-20 h-20 bg-mint-light rounded-full flex items-center justify-center mb-6 border-4 border-white shadow-sm transition-transform duration-500 group-hover:scale-110">
                                    <span className="font-headline font-black text-2xl text-teal-custom">01</span>
                                </div>
                                <h5 className="font-headline font-bold text-xl text-primary-navy mb-3">Detecção</h5>
                                <p className="font-body text-sm text-slate-500 leading-relaxed text-center md:text-left">
                                    Protocolos clínicos e testes neurocognitivos para identificar o potencial oculto no cotidiano escolar.
                                </p>
                            </div>

                            {/* Step 2 */}
                            <div className="relative z-10 w-full md:w-1/3 flex flex-col items-center md:items-start group px-4">
                                <div className="w-20 h-20 bg-mint-light rounded-full flex items-center justify-center mb-6 border-4 border-white shadow-sm transition-transform duration-500 group-hover:scale-110">
                                    <span className="font-headline font-black text-2xl text-teal-custom">02</span>
                                </div>
                                <h5 className="font-headline font-bold text-xl text-primary-navy mb-3">Validação</h5>
                                <p className="font-body text-sm text-slate-500 leading-relaxed text-center md:text-left">
                                    IA refina os dados para confirmar o perfil identificado.
                                </p>
                            </div>

                            {/* Step 3 */}
                            <div className="relative z-10 w-full md:w-1/3 flex flex-col items-center md:items-start group px-4">
                                <div className="w-20 h-20 bg-mint-light rounded-full flex items-center justify-center mb-6 border-4 border-white shadow-sm transition-transform duration-500 group-hover:scale-110">
                                    <span className="font-headline font-black text-2xl text-teal-custom">03</span>
                                </div>
                                <h5 className="font-headline font-bold text-xl text-primary-navy mb-3">Aceleração</h5>
                                <p className="font-body text-sm text-slate-500 leading-relaxed text-center md:text-left">
                                    A identificação de perfil ajuda na aceleração e direcionamento educacional.
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Final CTA Section */}
                <section className="py-40 bg-slate-50 relative overflow-hidden">
                    <div className="absolute inset-0 pointer-events-none" style={noiseStyle}></div>
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-mint-accent/20 blur-[100px] rounded-full"></div>

                    <div className="max-w-4xl mx-auto px-8 text-center relative z-10">
                        <h2 className="font-headline font-black text-5xl md:text-7xl text-primary-navy mb-8 tracking-tight">
                            Transforme potencial em realidade.
                        </h2>
                        <p className="font-body text-lg md:text-xl text-slate-600 mb-12 leading-relaxed max-w-2xl mx-auto">
                            Dê o primeiro passo na aceleração pedagógica. Faça o teste de triagem gratuito e descubra como podemos ajudar.
                        </p>
                        <Link to="/triagemgratuita" className="bg-primary-navy text-white px-12 py-5 rounded-full font-headline font-bold text-lg hover:shadow-2xl hover:shadow-primary-navy/20 hover:scale-105 transition-all duration-300 active:scale-95 flex items-center justify-center gap-3 mx-auto w-max">
                            Iniciar Teste Gratuito
                            <ArrowUpRight className="w-5 h-5" strokeWidth={2.5} />
                        </Link>
                    </div>
                </section>
            </main>

            {/* Footer */}
            <footer className="w-full py-16 px-8 bg-white border-t border-slate-100" id="about">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 max-w-[1440px] mx-auto">
                    <div className="flex flex-col gap-4">
                        <div className="font-headline font-black text-xl text-primary-navy">Superdott .</div>
                        <p className="font-body text-xs leading-relaxed text-slate-500">
                            © 2024 Superdott. Inteligência Educacional para Superdotados.
                        </p>
                    </div>
                    <div className="flex flex-col gap-3">
                        <h6 className="font-headline font-bold text-[10px] uppercase tracking-widest text-primary-navy mb-1">Pesquisa</h6>
                        <Link className="text-slate-500 hover:text-teal-custom font-body text-sm transition-colors" to="#">Arquivo Metodológico</Link>
                        <Link className="text-slate-500 hover:text-teal-custom font-body text-sm transition-colors" to="#">Framework Ético</Link>
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