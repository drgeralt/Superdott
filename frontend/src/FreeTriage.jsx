import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Brain, ShieldAlert, ArrowRight, ArrowLeft, Loader2, Sparkles } from 'lucide-react';
import Stepper, { Step } from './components/freetriage/Stepper';
import triagemGratis from './triagemGratis.json';

const FreeTriage = () => {
    const [hasAccepted, setHasAccepted] = useState(false);
    const [isStarted, setIsStarted] = useState(false);
    const [isCalculating, setIsCalculating] = useState(false);
    const [isFinished, setIsFinished] = useState(false);
    const [resultData, setResultData] = useState(null);

    const [triageData, setTriageData] = useState({
        parentName: '',
        parentEmail: '',
        childName: '',
        childAge: '',
        answers: {}
    });

    const navigate = useNavigate();

    const noiseStyle = {
        backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E\")",
        opacity: 0.02
    };

    const handleStart = () => {
        if (hasAccepted) {
            setIsStarted(true);
        }
    };

    const handleFinalSubmit = () => {
        setIsCalculating(true);
        const totalScore = Object.values(triageData.answers).reduce((acc, curr) => acc + curr, 0);
        let profile = {};

        if (totalScore <= 11) {
            profile = {
                title: "Perfil de Suporte e Organização",
                description: "Os resultados indicam um desenvolvimento típico ou possíveis desafios neurodivergentes de outra natureza. Reforçamos que a triagem gratuita que você acabou de realizar não é um diagnóstico, mas o Superdott pode te ajudar a entender isso melhor.",
                ctaText: "Criar Conta de Suporte"
            };
        } else if (totalScore <= 22) {
            profile = {
                title: "Potencial Latente Identificado",
                description: "Notamos picos de inteligência em áreas específicas. É fundamental estimular esse talento para que ele não se perca. Reforçamos que a triagem gratuita que você acabou de realizar não é um diagnóstico, mas o Superdott pode te ajudar a entender isso melhor.",
                ctaText: "Desbloquear Potencial"
            };
        } else {
            profile = {
                title: "Forte Indício de Altas Habilidades",
                description: `As respostas para ${triageData.childName} sugerem um quadro clássico de Altas Habilidades/Superdotação. Reforçamos que a triagem gratuita que você acabou de realizar não é um diagnóstico, mas o Superdott pode te ajudar a entender isso melhor.`,
                ctaText: "Acessar Superdott"
            };
        }

        setResultData(profile);
        sessionStorage.setItem('@superdott:triage_result', JSON.stringify({ ...triageData, totalScore }));

        setTimeout(() => {
            setIsCalculating(false);
            setIsFinished(true);
        }, 2500);
    };

    const validateCurrentStep = (step) => {
        if (step === 1) {
            const { parentName, parentEmail, childName, childAge } = triageData;
            return (
                parentName.trim() !== '' &&
                parentEmail.trim() !== '' &&
                parentEmail.includes('@') &&
                childName.trim() !== '' &&
                childAge !== ''
            );
        }

        const questionIndex = step - 2;
        if (questionIndex >= 0 && questionIndex < triagemGratis.questions.length) {
            const questionId = triagemGratis.questions[questionIndex].id;
            // Retorna true somente se a resposta para este ID existir no objeto 'answers'
            return triageData.answers[questionId] !== undefined;
        }

        return true;
    };

    return (
        <div className="min-h-screen text-primary-navy selection:bg-mint-light selection:text-teal-custom font-body bg-slate-50 relative overflow-hidden flex flex-col">
            <div className="absolute inset-0 pointer-events-none z-0" style={noiseStyle}></div>

            <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-mint-accent/20 rounded-full blur-[100px] opacity-60 z-0 pointer-events-none"></div>
            <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-teal-custom/10 rounded-full blur-[100px] opacity-60 z-0 pointer-events-none"></div>

            <nav className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-xl border-b border-slate-100 transition-all duration-200">
                <div className="flex justify-between items-center px-8 py-5 max-w-[1440px] mx-auto">
                    <div className="font-headline font-black text-3xl tracking-tighter text-primary-navy">Superdott .</div>
                    <Link to="/" className="flex items-center gap-2 text-slate-500 hover:text-teal-custom transition-colors font-medium text-sm uppercase font-headline tracking-tight">
                        <ArrowLeft className="w-4 h-4" strokeWidth={2.5} />
                        Voltar
                    </Link>
                </div>
            </nav>

            <main className="flex-1 flex items-center justify-center p-4 pt-20 md:pt-24 relative z-10 w-full">

                {/* DISCLAIMER */}
                {!isStarted && !isFinished && !isCalculating && (
                    <div className="w-full max-w-2xl bg-white rounded-[2rem] shadow-2xl shadow-primary-navy/5 border border-slate-100 p-8 md:p-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
                        <div className="w-16 h-16 bg-mint-light rounded-2xl flex items-center justify-center mb-8 border border-mint-accent/30">
                            <Brain className="w-8 h-8 text-teal-custom" strokeWidth={1.5} />
                        </div>

                        <h1 className="font-headline font-black text-3xl md:text-4xl text-primary-navy mb-4 tracking-tight">
                            Triagem Cognitiva Gratuita
                        </h1>
                        <p className="font-body text-slate-500 text-lg leading-relaxed mb-10">
                            Bem-vindo ao motor de inteligência educacional Superdott. Em menos de 5 minutos, mapearemos indicativos de altas habilidades ou necessidades de suporte baseado nas Escalas Wechsler.
                        </p>

                        <div className="bg-slate-50 border border-slate-200 rounded-xl p-6 mb-8">
                            <div className="flex gap-4 items-start mb-4">
                                <ShieldAlert className="w-6 h-6 text-amber-500 flex-shrink-0 mt-0.5" strokeWidth={2} />
                                <div>
                                    <h3 className="font-headline font-bold text-primary-navy mb-2">Aviso Importante e Termo de Responsabilidade</h3>
                                    <p className="font-body text-sm text-slate-600 leading-relaxed">
                                        Este questionário baseia-se nos domínios cognitivos do WISC-V, porém <strong>não constitui um teste de QI, não possui validade clínica e não substitui uma avaliação neuropsicológica formal.</strong>
                                    </p>
                                </div>
                            </div>

                            <label className="flex items-start gap-3 cursor-pointer group mt-6 pt-6 border-t border-slate-200">
                                <div className="relative flex items-center justify-center mt-0.5">
                                    <input
                                        type="checkbox"
                                        className="peer sr-only"
                                        checked={hasAccepted}
                                        onChange={(e) => setHasAccepted(e.target.checked)}
                                    />
                                    <div className="w-5 h-5 border-2 border-slate-300 rounded transition-all peer-checked:bg-teal-custom peer-checked:border-teal-custom group-hover:border-teal-custom"></div>
                                    <div className="absolute text-white opacity-0 peer-checked:opacity-100 transition-opacity pointer-events-none">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                        </svg>
                                    </div>
                                </div>
                                <span className="text-sm font-medium text-primary-navy select-none">
                                    Compreendo a natureza não-clínica desta ferramenta e desejo iniciar a triagem.
                                </span>
                            </label>
                        </div>

                        <button
                            onClick={handleStart}
                            disabled={!hasAccepted}
                            className={`w-full py-4 rounded-xl font-headline font-bold text-lg flex items-center justify-center gap-3 transition-all duration-300 ${
                                hasAccepted
                                    ? 'bg-primary-navy text-white hover:shadow-lg hover:shadow-primary-navy/20 hover:-translate-y-0.5 active:translate-y-0 cursor-pointer'
                                    : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                            }`}
                        >
                            Iniciar Triagem
                            <ArrowRight className="w-5 h-5" strokeWidth={2.5} />
                        </button>
                    </div>
                )}

                {/* STEPPER */}
                {isStarted && !isFinished && !isCalculating && (
                    <div className="w-full max-w-4xl animate-in fade-in zoom-in-95 duration-500">
                        <Stepper
                            initialStep={1}
                            onFinalStepCompleted={handleFinalSubmit}
                            backButtonText="Voltar"
                            nextButtonText="Avançar"
                            disableStepIndicators={true}
                            validateStep={validateCurrentStep}
                        >
                            <Step>
                                <div className="py-6 text-left">
                                    <h2 className="font-headline font-black text-3xl text-primary-navy mb-2">Quem está preenchendo?</h2>
                                    <p className="font-body text-slate-500 mb-8">Precisamos de alguns dados básicos para personalizar o resultado final.</p>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="flex flex-col gap-2">
                                            <label className="font-headline font-semibold text-sm text-primary-navy">Nome do Responsável</label>
                                            <input
                                                type="text"
                                                value={triageData.parentName}
                                                onChange={e => setTriageData({...triageData, parentName: e.target.value})}
                                                className="px-4 py-3 rounded-xl border border-slate-200 focus:border-teal-custom focus:ring-2 focus:ring-mint-light outline-none transition-all font-body"
                                                placeholder="Ex: Maria Silva"
                                            />
                                        </div>
                                        <div className="flex flex-col gap-2">
                                            <label className="font-headline font-semibold text-sm text-primary-navy">Seu melhor e-mail</label>
                                            <input
                                                type="email"
                                                value={triageData.parentEmail}
                                                onChange={e => setTriageData({...triageData, parentEmail: e.target.value})}
                                                className="px-4 py-3 rounded-xl border border-slate-200 focus:border-teal-custom focus:ring-2 focus:ring-mint-light outline-none transition-all font-body"
                                                placeholder="Ex: maria@email.com"
                                            />
                                        </div>
                                        <div className="flex flex-col gap-2">
                                            <label className="font-headline font-semibold text-sm text-primary-navy">Nome da criança</label>
                                            <input
                                                type="text"
                                                value={triageData.childName}
                                                onChange={e => setTriageData({...triageData, childName: e.target.value})}
                                                className="px-4 py-3 rounded-xl border border-slate-200 focus:border-teal-custom focus:ring-2 focus:ring-mint-light outline-none transition-all font-body"
                                                placeholder="Ex: Joãozinho"
                                            />
                                        </div>
                                        <div className="flex flex-col gap-2">
                                            <label className="font-headline font-semibold text-sm text-primary-navy">Idade da criança</label>
                                            <input
                                                type="number"
                                                value={triageData.childAge}
                                                onChange={e => setTriageData({...triageData, childAge: e.target.value})}
                                                className="px-4 py-3 rounded-xl border border-slate-200 focus:border-teal-custom focus:ring-2 focus:ring-mint-light outline-none transition-all font-body"
                                                placeholder="Ex: 8"
                                                min="4"
                                                max="17"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </Step>

                            {triagemGratis.questions.map((question, index) => (
                                <Step key={question.id}>
                                    <div className="py-2 text-left">
                                        <div className="mb-1 inline-block px-2.5 py-0.5 bg-mint-light/50 text-teal-custom font-headline font-bold text-[9px] tracking-widest uppercase rounded-full border border-teal-custom/10">
                                            Domínio Analítico: {question.domain}
                                        </div>
                                        <h2 className="font-headline font-bold text-xl md:text-2xl text-primary-navy mb-5 mt-2 leading-tight">
                                            {question.text}
                                        </h2>

                                        <div className="flex flex-col gap-3">
                                            {question.options.map((option, optIdx) => (
                                                <label
                                                    key={optIdx}
                                                    className={`p-4 rounded-xl border-2 cursor-pointer transition-all flex items-center gap-4 ${
                                                        triageData.answers[question.id] === option.score
                                                            ? 'border-teal-custom bg-mint-light/10 shadow-md shadow-teal-custom/5'
                                                            : 'border-slate-100 hover:border-slate-300 hover:bg-slate-50'
                                                    }`}
                                                >
                                                    <input
                                                        type="radio"
                                                        name={question.id}
                                                        value={option.score}
                                                        className="w-4 h-4 text-teal-custom focus:ring-teal-custom"
                                                        checked={triageData.answers[question.id] === option.score}
                                                        onChange={() => {
                                                            setTriageData(prev => ({
                                                                ...prev,
                                                                answers: { ...prev.answers, [question.id]: option.score }
                                                            }))
                                                        }}
                                                    />
                                                    <span className="font-body text-slate-700 text-base">{option.text}</span>
                                                </label>
                                            ))}
                                        </div>
                                    </div>
                                </Step>
                            ))}
                        </Stepper>
                    </div>
                )}

                {/* CARREGAMENTO FINAL*/}
                {isCalculating && (
                    <div className="w-full max-w-xl bg-white rounded-[2rem] shadow-2xl shadow-primary-navy/5 border border-slate-100 p-12 text-center flex flex-col items-center justify-center animate-in fade-in duration-500">
                        <div className="relative mb-8">
                            <div className="absolute inset-0 bg-mint-light rounded-full animate-ping opacity-75"></div>
                            <div className="relative bg-white rounded-full p-4 border border-teal-custom/20 shadow-lg">
                                <Loader2 className="w-10 h-10 text-teal-custom animate-spin" strokeWidth={2} />
                            </div>
                        </div>
                        <h2 className="font-headline font-bold text-2xl text-primary-navy mb-2">Analisando os padrões...</h2>
                    </div>
                )}

                {/* RESULTADO E CONVERSÃO */}
                {isFinished && resultData && (
                    <div className="w-full max-w-2xl bg-white rounded-[2rem] shadow-2xl shadow-primary-navy/5 border border-slate-100 p-8 md:p-12 text-center animate-in zoom-in-95 duration-700">
                        <div className="w-20 h-20 bg-mint-light/50 rounded-full flex items-center justify-center mx-auto mb-6 border border-teal-custom/20">
                            <Sparkles className="w-10 h-10 text-teal-custom" strokeWidth={1.5} />
                        </div>

                        <div className="inline-block px-4 py-1.5 bg-slate-50 text-slate-500 font-headline font-bold text-[10px] tracking-widest uppercase rounded-full border border-slate-200 mb-6">
                            Análise Concluída
                        </div>

                        <h2 className="font-headline font-black text-3xl md:text-4xl text-primary-navy mb-4 leading-tight">
                            {resultData.title}
                        </h2>

                        <p className="font-body text-slate-600 text-lg leading-relaxed mb-10 max-w-lg mx-auto">
                            {resultData.description}
                        </p>

                        <Link
                            to="/login"
                            className="bg-primary-navy text-white px-10 py-4 w-full md:w-auto flex items-center justify-center gap-3 rounded-xl font-headline font-bold text-lg hover:shadow-xl hover:shadow-primary-navy/20 hover:-translate-y-1 transition-all duration-300 active:translate-y-0 mx-auto"
                        >
                            {resultData.ctaText}
                            <ArrowRight className="w-5 h-5" strokeWidth={2.5} />
                        </Link>

                    </div>
                )}
            </main>
        </div>
    );
};

export default FreeTriage;