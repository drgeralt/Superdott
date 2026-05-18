import { useState, useEffect, Suspense, lazy } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import useTriageStore from './store/useTriageStore';
import useStudentStore from './store/useStudentStore';
import useAuthStore from './store/useAuthStore';

const BallPit = lazy(() => import('./components/auth/BallPit'));

const Register = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { triageData, loadTriageData, clearTriageData } = useTriageStore();
    const fetchStudents = useStudentStore((state) => state.fetchStudents);

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [role, setRole] = useState('Pai');
    const [acceptedTcle, setAcceptedTcle] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    // Multitenancy: Escolas
    const [schools, setSchools] = useState([]);
    const [selectedSchoolId, setSelectedSchoolId] = useState('');

    // Carrega os dados de triagem do localStorage no mount e a role da URL
    useEffect(() => {
        loadTriageData();
        
        const params = new URLSearchParams(location.search);
        const queryRole = params.get('role');
        if (queryRole && ['Pai', 'Professor', 'Diretor'].includes(queryRole)) {
            setRole(queryRole);
        }

        // Buscar escolas ativas
        fetch('/api/auth/schools')
            .then(res => res.json())
            .then(data => setSchools(data))
            .catch(err => console.error('Erro ao buscar escolas:', err));
        
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [location.search]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (password !== confirmPassword) {
            setError('As senhas não coincidem.');
            return;
        }

        if (!acceptedTcle) {
            setError('O aceite do TCLE é obrigatório.');
            return;
        }

        setLoading(true);

        const registerPayload = {
            email: email.trim(),
            password: password,
            accepted_tcle: acceptedTcle,
            role: triageData ? 'Pai' : role,
            student: triageData ? {
                full_name: triageData.student_name,
                email: triageData.student_email
            } : null
        };

        try {
            // 1. Cadastra o usuário composto/seco no backend
            const regRes = await fetch('/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(registerPayload)
            });

            if (!regRes.ok) {
                const errData = await regRes.json();
                throw new Error(errData.detail || 'Falha ao realizar cadastro.');
            }

            // 2. Realiza login automático imediato para obter o JWT
            const formData = new URLSearchParams();
            formData.append('username', email.trim());
            formData.append('password', password);

            const tokenRes = await fetch('/api/auth/token', {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: formData
            });

            if (!tokenRes.ok) {
                throw new Error('Cadastro realizado, mas falha ao obter token de acesso.');
            }

            const tokenData = await tokenRes.json();
            
            // 3. Salva o token no localStorage e no useAuthStore
            localStorage.setItem('superdott_token', tokenData.access_token);
            useAuthStore.getState().setToken(tokenData.access_token);

            // 4. Limpa a triagem
            if (triageData) {
                clearTriageData();
            }

            // 5. Busca e seleciona automaticamente o aluno no Zustand Store
            await fetchStudents();

            // 6. Redireciona para o dashboard principal
            navigate('/dashboard');

        } catch (err) {
            setError(err.message || 'Ocorreu um erro no processamento do cadastro.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="relative min-h-screen bg-gradient-to-br from-primary-navy to-teal-custom flex items-center justify-end p-4 lg:pr-24 overflow-hidden">
            {/* Camada 0: BallPit animado */}
            <div className="absolute inset-0 z-0 pointer-events-auto">
                <Suspense fallback={<div className="w-full h-full bg-primary-navy" />}>
                    <BallPit
                        count={60}
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

            {/* Camada 1: Formulário de Registro */}
            <div className="relative z-10 w-full max-w-[1100px] h-[calc(100vh-40px)] max-h-[850px] grid lg:grid-cols-2 bg-white rounded-[2rem] overflow-hidden shadow-2xl relative z-10 mx-auto">
                
                {/* Lado Visual */}
                <section className="hidden lg:flex flex-col justify-between p-12 relative overflow-hidden bg-[linear-gradient(135deg,#E4F2EA_0%,#f9f9ff_100%)] h-full">
                    <div>
                        <span className="font-headline font-extrabold text-4xl text-primary-navy tracking-tighter block mb-12">Superdott .</span>
                        <div className="space-y-6">
                            <span className="inline-block px-3 py-1 bg-primary-navy/10 text-primary-navy font-label text-[10px] font-bold uppercase tracking-widest rounded-full">
                                Cuidado e Excelência em Educação Especial
                            </span>
                            <h1 className="font-headline text-4xl font-extrabold text-on-surface tracking-tight leading-tight">
                                Seu cadastro em <span className="text-teal-custom">segundos.</span>
                            </h1>
                            <p className="text-on-surface-variant text-base max-w-sm">
                                Junte-se à maior rede de apoio a crianças com Altas Habilidades e Superdotação do país.
                            </p>
                        </div>
                    </div>
                    <div className="mt-auto">
                        <p className="text-xs font-semibold text-on-surface-variant italic">
                            🔒 Proteção Zero-Trust e Anonimização PII ativas em conformidade com a LGPD.
                        </p>
                    </div>
                </section>

                {/* Lado Form */}
                <div className="overflow-y-auto custom-scrollbar flex flex-col p-8 md:p-12 justify-center bg-white">
                    <div className="w-full max-w-md mx-auto">
                        <div className="text-center lg:text-left mb-8">
                            <h2 className="font-headline text-3xl font-bold text-primary-navy mb-1">Crie sua Conta</h2>
                            <p className="text-sm text-on-surface-variant">Comece a acompanhar o progresso pedagógico hoje.</p>
                        </div>

                        {error && (
                            <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 text-xs font-bold rounded-r-xl flex items-center gap-2">
                                <span className="material-symbols-outlined text-sm">error</span>
                                <span>{error}</span>
                            </div>
                        )}

                        {/* Banner de Dados Importados da Triagem Pública */}
                        {triageData && (
                            <div className="mb-6 p-4 bg-teal-custom/5 border-2 border-teal-custom/20 text-teal-custom rounded-2xl flex flex-col gap-1 shadow-sm">
                                <div className="flex items-center gap-2">
                                    <span className="material-symbols-outlined text-base">star</span>
                                    <span className="font-headline font-bold text-xs uppercase tracking-wider">Dados Importados</span>
                                </div>
                                <p className="text-xs font-semibold text-primary-navy">
                                    Criando perfil e importando triagem para:
                                </p>
                                <span className="text-sm font-bold block bg-white px-3 py-1.5 rounded-lg border border-slate-100 mt-1">
                                    {triageData.student_name} ({triageData.student_age} anos)
                                </span>
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-1.5">
                                <label className="block font-label text-[10px] font-bold text-primary-navy uppercase tracking-wider ml-1" htmlFor="email">
                                    Endereço de E-mail
                                </label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <span className="material-symbols-outlined text-on-surface-variant text-xl">alternate_email</span>
                                    </div>
                                    <input
                                        className="block w-full pl-11 pr-4 py-3 bg-surface-container-low border-b-2 border-outline-variant focus:border-primary-navy focus:ring-0 transition-all rounded-t-xl placeholder:text-outline text-on-surface font-medium text-sm outline-none"
                                        id="email"
                                        placeholder="seuemail@exemplo.com"
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1.5">
                                    <label className="block font-label text-[10px] font-bold text-primary-navy uppercase tracking-wider ml-1" htmlFor="password">
                                        Senha
                                    </label>
                                    <div className="relative group">
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                            <span className="material-symbols-outlined text-on-surface-variant text-xl">lock</span>
                                        </div>
                                        <input
                                            className="block w-full pl-11 pr-10 py-3 bg-surface-container-low border-b-2 border-outline-variant focus:border-primary-navy focus:ring-0 transition-all rounded-t-xl placeholder:text-outline text-on-surface font-medium text-sm outline-none"
                                            id="password"
                                            placeholder="••••••••"
                                            type={showPassword ? 'text' : 'password'}
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            required
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute inset-y-0 right-0 pr-3 flex items-center text-on-surface-variant hover:text-primary-navy"
                                        >
                                            <span className="material-symbols-outlined text-lg">{showPassword ? 'visibility_off' : 'visibility'}</span>
                                        </button>
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="block font-label text-[10px] font-bold text-primary-navy uppercase tracking-wider ml-1" htmlFor="confirmPassword">
                                        Confirmar Senha
                                    </label>
                                    <div className="relative group">
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                            <span className="material-symbols-outlined text-on-surface-variant text-xl">lock</span>
                                        </div>
                                        <input
                                            className="block w-full pl-11 pr-4 py-3 bg-surface-container-low border-b-2 border-outline-variant focus:border-primary-navy focus:ring-0 transition-all rounded-t-xl placeholder:text-outline text-on-surface font-medium text-sm outline-none"
                                            id="confirmPassword"
                                            placeholder="••••••••"
                                            type={showPassword ? 'text' : 'password'}
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            required
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Seleção de Perfil para Cadastro Seco */}
                            {!triageData && (
                                <div className="space-y-4">
                                    <div className="space-y-1.5">
                                        <label className="block font-label text-[10px] font-bold text-primary-navy uppercase tracking-wider ml-1" htmlFor="role">
                                            Perfil de Acesso
                                        </label>
                                        <div className="relative">
                                            <select
                                                className="block w-full px-4 py-3 bg-surface-container-low border-b-2 border-outline-variant focus:border-primary-navy focus:ring-0 transition-all rounded-xl text-on-surface font-medium text-sm outline-none appearance-none"
                                                id="role"
                                                value={role}
                                                onChange={(e) => setRole(e.target.value)}
                                            >
                                                <option value="Pai">Responsável / Pai / Mãe</option>
                                                <option value="Professor">Docente / Professor</option>
                                                <option value="Diretor">Coordenador / Diretor</option>
                                            </select>
                                            <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none text-on-surface-variant">
                                                <span className="material-symbols-outlined">expand_more</span>
                                            </div>
                                        </div>
                                    </div>


                                </div>
                            )}

                            {/* Aceite do TCLE */}
                            <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-2xl border border-slate-100 mt-2">
                                <input
                                    className="w-4 h-4 rounded border-outline-variant text-primary-navy focus:ring-primary-navy/20 bg-white mt-0.5 cursor-pointer"
                                    id="acceptedTcle"
                                    type="checkbox"
                                    checked={acceptedTcle}
                                    onChange={(e) => setAcceptedTcle(e.target.checked)}
                                    required
                                />
                                <label className="text-xs font-semibold text-on-surface-variant cursor-pointer select-none" htmlFor="acceptedTcle">
                                    Eu li e concordo com o <a href="#" className="text-primary-navy underline hover:text-teal-custom">Termo de Consentimento Livre e Esclarecido (TCLE)</a> e com a <a href="#" className="text-primary-navy underline hover:text-teal-custom">Política de Privacidade</a> de dados de menores da plataforma.
                                </label>
                            </div>

                            <button
                                className="w-full py-4 mt-4 bg-[linear-gradient(135deg,#0C2C47_0%,#4A9D95_100%)] text-white font-headline font-bold text-base rounded-full shadow-lg hover:shadow-primary-navy/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2"
                                type="submit"
                                disabled={loading}
                            >
                                {loading ? 'Processando...' : 'Concluir Cadastro e Acessar'}
                                <span className="material-symbols-outlined text-xl">arrow_forward</span>
                            </button>
                        </form>

                        <div className="mt-8 pt-6 border-t border-slate-100 text-center">
                            <p className="text-xs text-on-surface-variant">
                                Já possui uma conta?
                                <a className="text-primary-navy ml-1 font-bold hover:underline decoration-2 underline-offset-4 cursor-pointer" onClick={() => navigate('/login')}>
                                    Fazer Login
                                </a>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Register;
