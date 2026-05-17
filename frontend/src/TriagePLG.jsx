import { useState, Suspense, lazy } from 'react';
import { useNavigate } from 'react-router-dom';
import useTriageStore from './store/useTriageStore';

const BallPit = lazy(() => import('./components/auth/BallPit'));

const TriagePLG = () => {
    const navigate = useNavigate();
    const setTriageData = useTriageStore((state) => state.setTriageData);

    const [step, setStep] = useState(1);
    const [name, setName] = useState('');
    const [age, setAge] = useState('');
    const [email, setEmail] = useState('');
    const [behaviors, setBehaviors] = useState([]);
    const [interests, setInterests] = useState([]);

    const toggleBehavior = (val) => {
        setBehaviors(prev =>
            prev.includes(val) ? prev.filter(x => x !== val) : [...prev, val]
        );
    };

    const toggleInterest = (val) => {
        setInterests(prev =>
            prev.includes(val) ? prev.filter(x => x !== val) : [...prev, val]
        );
    };

    const handleNext = (e) => {
        e.preventDefault();
        if (step === 1 && (!name || !age)) return;
        setStep(prev => prev + 1);
    };

    const handleBack = () => {
        setStep(prev => prev - 1);
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        // Geração do e-mail fictício caso o pai opte por não informar
        let finalStudentEmail = email.trim();
        if (!finalStudentEmail) {
            const cleanName = name.toLowerCase().replace(/[^a-z0-9]/g, '');
            const randomSuffix = Math.floor(100 + Math.random() * 900);
            finalStudentEmail = `${cleanName}_${randomSuffix}@superdott.edu`;
        }

        const payload = {
            student_name: name,
            student_email: finalStudentEmail,
            student_age: age,
            behaviors,
            interests
        };

        // Salva na store global do Zustand + localStorage
        setTriageData(payload);

        // UX Feedback antes do redirecionamento
        alert(`🎉 Triagem de ${name} concluída com sucesso! Redirecionando para o cadastro para criar sua conta.`);
        navigate('/register');
    };

    return (
        <div className="relative min-h-screen bg-gradient-to-br from-primary-navy to-teal-custom flex items-center justify-center p-4 overflow-hidden">
            {/* Camada 0: BallPit Animado */}
            <div className="absolute inset-0 z-0 pointer-events-auto">
                <Suspense fallback={<div className="w-full h-full bg-primary-navy" />}>
                    <BallPit
                        count={40}
                        gravity={0.015}
                        friction={0.995}
                        wallBounce={0.90}
                        followCursor={false}
                        colors={[0xFFFFFF, 0x0C2C47, 0x00BFFF, 0x4A9D95]}
                        ambientIntensity={4.0}
                        lightIntensity={10}
                        className="w-full h-full"
                    />
                </Suspense>
            </div>

            {/* Camada 1: Card de Triagem */}
            <div className="relative z-10 w-full max-w-[650px] bg-white/95 backdrop-blur-md rounded-[2.5rem] p-8 md:p-12 shadow-2xl border border-white/10 text-on-surface">
                <div className="flex flex-col items-center mb-8">
                    <div className="w-12 h-12 bg-teal-custom/10 text-teal-custom rounded-full flex items-center justify-center mb-3">
                        <span className="material-symbols-outlined text-2xl font-bold">query_stats</span>
                    </div>
                    <h2 className="font-headline text-3xl font-extrabold text-primary-navy tracking-tight text-center">
                        Triagem Pedagógica Rápida
                    </h2>
                    <p className="text-on-surface-variant text-sm mt-1 text-center max-w-sm">
                        Ajude-nos a entender o potencial de desenvolvimento do seu filho em poucos passos.
                    </p>
                    
                    {/* Barra de Progresso */}
                    <div className="w-full bg-slate-100 h-1.5 rounded-full mt-6 flex overflow-hidden">
                        <div className={`h-full bg-teal-custom transition-all duration-300 ${step === 1 ? 'w-1/3' : step === 2 ? 'w-2/3' : 'w-full'}`} />
                    </div>
                    <span className="text-[10px] uppercase tracking-widest text-teal-custom font-bold mt-2">
                        Passo {step} de 3
                    </span>
                </div>

                {step === 1 && (
                    <form onSubmit={handleNext} className="space-y-6">
                        <div className="space-y-1.5">
                            <label className="block font-label text-[10px] font-bold text-primary-navy uppercase tracking-wider ml-1">
                                Nome Completo da Criança *
                            </label>
                            <input
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="block w-full px-4 py-3.5 bg-surface-container-low border-b-2 border-transparent focus:border-primary-navy focus:ring-0 transition-all rounded-2xl placeholder:text-outline text-on-surface font-medium text-sm outline-none"
                                placeholder="Ex: Enzo Silva"
                                required
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <label className="block font-label text-[10px] font-bold text-primary-navy uppercase tracking-wider ml-1">
                                    Idade *
                                </label>
                                <input
                                    type="number"
                                    value={age}
                                    onChange={(e) => setAge(e.target.value)}
                                    className="block w-full px-4 py-3.5 bg-surface-container-low border-b-2 border-transparent focus:border-primary-navy focus:ring-0 transition-all rounded-2xl placeholder:text-outline text-on-surface font-medium text-sm outline-none"
                                    placeholder="Ex: 8"
                                    min="1"
                                    max="18"
                                    required
                                />
                            </div>

                            <div className="space-y-1.5">
                                <label className="block font-label text-[10px] font-bold text-primary-navy uppercase tracking-wider ml-1">
                                    E-mail da Criança (Opcional)
                                </label>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="block w-full px-4 py-3.5 bg-surface-container-low border-b-2 border-transparent focus:border-primary-navy focus:ring-0 transition-all rounded-2xl placeholder:text-outline text-on-surface font-medium text-sm outline-none"
                                    placeholder="enzo@escola.com"
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            className="w-full py-4 bg-primary-navy text-white font-headline font-bold text-base rounded-full shadow-lg hover:shadow-primary-navy/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2 mt-4"
                        >
                            Avançar
                            <span className="material-symbols-outlined">arrow_forward</span>
                        </button>
                    </form>
                )}

                {step === 2 && (
                    <div className="space-y-6">
                        <span className="block font-label text-[10px] font-bold text-primary-navy uppercase tracking-wider text-center">
                            Selecione os comportamentos e características observados:
                        </span>

                        <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                            {[
                                { id: 'c1', label: 'Curiosidade intelectual fora do comum para a idade' },
                                { id: 'c2', label: 'Facilidade extrema em aprender tópicos complexos de forma independente' },
                                { id: 'c3', label: 'Pensamento extremamente divergente ou soluções muito originais' },
                                { id: 'c4', label: 'Comprometimento e foco persistente em tarefas que despertam interesse' },
                                { id: 'c5', label: 'Vocabulário avançado ou excelente raciocínio lógico' },
                                { id: 'c6', label: 'Sensibilidade aguçada ou forte senso de justiça social' }
                            ].map((item) => (
                                <button
                                    key={item.id}
                                    type="button"
                                    onClick={() => toggleBehavior(item.label)}
                                    className={`w-full flex items-center gap-4 p-4 rounded-2xl border text-left transition-all active:scale-[0.98] ${behaviors.includes(item.label) ? 'bg-teal-custom/5 border-teal-custom text-teal-custom font-bold' : 'bg-surface-container-low border-transparent hover:bg-surface-container-high'}`}
                                >
                                    <span className="material-symbols-outlined">
                                        {behaviors.includes(item.label) ? 'check_box' : 'check_box_outline_blank'}
                                    </span>
                                    <span className="text-sm font-medium">{item.label}</span>
                                </button>
                            ))}
                        </div>

                        <div className="flex gap-4">
                            <button
                                type="button"
                                onClick={handleBack}
                                className="w-1/3 py-4 bg-slate-100 hover:bg-slate-200 text-primary-navy font-headline font-bold text-base rounded-full transition-all flex items-center justify-center gap-2"
                            >
                                <span className="material-symbols-outlined">arrow_back</span>
                                Voltar
                            </button>
                            <button
                                type="button"
                                onClick={handleNext}
                                className="w-2/3 py-4 bg-primary-navy text-white font-headline font-bold text-base rounded-full shadow-lg hover:shadow-primary-navy/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2"
                            >
                                Avançar
                                <span className="material-symbols-outlined">arrow_forward</span>
                            </button>
                        </div>
                    </div>
                )}

                {step === 3 && (
                    <div className="space-y-6">
                        <span className="block font-label text-[10px] font-bold text-primary-navy uppercase tracking-wider text-center">
                            Áreas de maior interesse demonstradas pela criança:
                        </span>

                        <div className="grid grid-cols-2 gap-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                            {[
                                { id: 'i1', label: 'Matemática e Lógica', icon: 'calculate' },
                                { id: 'i2', label: 'Artes e Desenho', icon: 'palette' },
                                { id: 'i3', label: 'Música e Ritmo', icon: 'music_note' },
                                { id: 'i4', label: 'Ciências e Natureza', icon: 'biotech' },
                                { id: 'i5', label: 'Leitura e Escrita', icon: 'menu_book' },
                                { id: 'i6', label: 'Esportes e Movimento', icon: 'sports_soccer' }
                            ].map((item) => (
                                <button
                                    key={item.id}
                                    type="button"
                                    onClick={() => toggleInterest(item.label)}
                                    className={`flex flex-col items-center text-center gap-2 p-5 rounded-2xl border transition-all active:scale-[0.98] ${interests.includes(item.label) ? 'bg-teal-custom/5 border-teal-custom text-teal-custom font-bold' : 'bg-surface-container-low border-transparent hover:bg-surface-container-high'}`}
                                >
                                    <span className="material-symbols-outlined text-2xl">{item.icon}</span>
                                    <span className="text-xs font-semibold">{item.label}</span>
                                </button>
                            ))}
                        </div>

                        <div className="flex gap-4">
                            <button
                                type="button"
                                onClick={handleBack}
                                className="w-1/3 py-4 bg-slate-100 hover:bg-slate-200 text-primary-navy font-headline font-bold text-base rounded-full transition-all flex items-center justify-center gap-2"
                            >
                                <span className="material-symbols-outlined">arrow_back</span>
                                Voltar
                            </button>
                            <button
                                type="button"
                                onClick={handleSubmit}
                                className="w-2/3 py-4 bg-[linear-gradient(135deg,#0C2C47_0%,#4A9D95_100%)] text-white font-headline font-bold text-base rounded-full shadow-lg hover:shadow-teal-custom/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2"
                            >
                                Salvar e Criar Conta
                                <span className="material-symbols-outlined">star</span>
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default TriagePLG;
