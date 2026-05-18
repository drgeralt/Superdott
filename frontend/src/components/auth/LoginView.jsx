import { useState } from 'react';
import logoNegative from '../../assets/img/logo-negative.png';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../../store/useAuthStore';

const LoginVisual = () => (
    <section className="hidden lg:flex flex-col justify-between p-8 lg:p-12 relative overflow-hidden bg-[linear-gradient(135deg,#E4F2EA_0%,#f9f9ff_100%)] h-full">
        <div className="relative z-10">
            <div className="flex items-center gap-2 mb-8 xl:mb-12">
                <span className="font-headline font-extrabold text-4xl text-primary-navy tracking-tighter text-on-surface">Superdott .</span>
            </div>
            <div className="space-y-4 xl:space-y-6">
                <span className="inline-block px-3 py-1 bg-primary-navy/10 text-primary-navy font-label text-[10px] font-bold uppercase tracking-widest rounded-full">
                    Sistema para Pré-Diagnóstico de Super dotados
                </span>
                <h1 className="font-headline text-3xl xl:text-4xl font-extrabold text-on-surface tracking-tight leading-tight">
                    Transformando dados em <span className="text-primary-navy">excelência.</span>
                </h1>
                <p className="text-on-surface-variant text-base xl:text-lg max-w-sm">
                    Uma plataforma desenhada para responsáveis e docentes que valorizam a educação.
                </p>
            </div>
        </div>

        <div className="relative z-10 mt-auto">
            <p className="text-sm font-medium text-on-surface-variant italic">
                &quot;O Superdott mudou a forma como lidamos com os alunos.&quot;
            </p>
        </div>

        <div className="absolute top-1/2 -right-10 -translate-y-1/2 opacity-10 pointer-events-none">
            <img
                src={logoNegative}
                alt="Logo Superdott Marca D'água"
                className="w-[350px] xl:w-[450px] h-auto object-contain select-none mix-blend-luminosity"
            />
        </div>
    </section>
);

const ProfileButton = ({ id, icon, label, isActive, onSelect }) => {
    return (
        <button
            type="button"
            onClick={() => onSelect(id)}
            className={`flex flex-col items-center gap-1.5 p-3 rounded-xl transition-all active:scale-95 group ${isActive ? 'bg-primary-navy/5 border-2 border-primary-navy/20' : 'bg-surface-container-low hover:bg-surface-container-high border-2 border-transparent'}`}
        >
            <div className={`w-10 h-10 rounded-full flex items-center justify-center shadow-sm transition-colors ${isActive ? 'bg-primary-navy text-white' : 'bg-white text-on-surface-variant group-hover:shadow-md'}`}>
                <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: isActive ? "'FILL' 1" : "'FILL' 0" }}>{icon}</span>
            </div>
            <span className={`font-label text-[11px] xl:text-xs ${isActive ? 'font-bold text-primary-navy' : 'font-semibold text-on-surface-variant'}`}>
                {label}
            </span>
        </button>
    );
};

const LoginForm = () => {
    const [activeProfile, setActiveProfile] = useState('docente');
    const [showPassword, setShowPassword] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        const formData = new URLSearchParams();
        formData.append('username', email.trim());
        formData.append('password', password);

        try {
            const response = await fetch('/api/auth/token', {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: formData
            });

            if (!response.ok) {
                const errData = await response.json();
                throw new Error(errData.detail || 'E-mail ou senha incorretos.');
            }

            const data = await response.json();
            // Salva o token no localStorage e no useAuthStore para que a mudança de estado seja reativa
            localStorage.setItem('superdott_token', data.access_token);
            useAuthStore.getState().setToken(data.access_token);
            
            // Navega para o dashboard
            navigate('/dashboard');
        } catch (err) {
            setError(err.message || 'Erro ao conectar ao servidor de autenticação.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <section className="p-6 lg:p-10 flex flex-col h-full w-full min-h-0">
            <div className="w-full max-w-md mx-auto flex flex-col h-full">

                <div className="lg:hidden flex items-center gap-2 mb-6 justify-center shrink-0">
                    <span className="material-symbols-outlined text-primary-navy text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>auto_stories</span>
                    <span className="font-headline font-extrabold text-2xl tracking-tighter text-on-surface">Superdott</span>
                </div>

                <div className="text-center lg:text-left mb-6 shrink-0">
                    <h2 className="font-headline text-2xl xl:text-3xl font-bold text-on-surface mb-1">É ótimo te ver aqui!</h2>
                    <p className="text-sm xl:text-base text-on-surface-variant">Selecione seu perfil e acesse sua conta.</p>
                </div>

                <div className="grid grid-cols-3 gap-2 xl:gap-3 mb-6 shrink-0">
                    <ProfileButton id="coordenador" icon="psychology" label="Coordenador" isActive={activeProfile === 'coordenador'} onSelect={setActiveProfile} />
                    <ProfileButton id="docente" icon="menu_book" label="Docente" isActive={activeProfile === 'docente'} onSelect={setActiveProfile} />
                    <ProfileButton id="admin" icon="admin_panel_settings" label="Administrativo" isActive={activeProfile === 'admin'} onSelect={setActiveProfile} />
                </div>

                {error && (
                    <div className="mb-4 p-3 bg-red-50 border-l-4 border-red-500 text-red-700 text-xs font-bold rounded-r-lg flex items-center gap-2 shrink-0">
                        <span className="material-symbols-outlined text-sm">error</span>
                        <span>{error}</span>
                    </div>
                )}

                <form className="space-y-4 xl:space-y-5 shrink-0" onSubmit={handleLogin}>
                    <div className="space-y-1.5">
                        <label className="block font-label text-[10px] xl:text-xs font-bold text-primary-navy uppercase tracking-wider ml-1" htmlFor="email">
                            E-mail Institucional
                        </label>
                        <div className="relative group">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                <span className="material-symbols-outlined text-on-surface-variant text-xl">alternate_email</span>
                            </div>
                            <input
                                className="block w-full pl-11 pr-4 py-3 bg-surface-container-low border-0 border-b-2 border-outline-variant focus:border-primary-navy focus:ring-0 transition-all rounded-t-xl placeholder:text-outline text-on-surface font-medium text-sm outline-none"
                                id="email"
                                name="email"
                                placeholder="nome@superdott.edu"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <div className="flex justify-between items-end px-1">
                            <label className="block font-label text-[10px] xl:text-xs font-bold text-primary-navy uppercase tracking-wider" htmlFor="password">
                                Senha de Acesso
                            </label>
                            <a className="text-[11px] xl:text-xs font-semibold text-on-surface-variant hover:text-primary-navy transition-colors" href="#">Esqueceu?</a>
                        </div>
                        <div className="relative group">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                <span className="material-symbols-outlined text-on-surface-variant text-xl">lock</span>
                            </div>
                            <input
                                className="block w-full pl-11 pr-12 py-3 bg-surface-container-low border-0 border-b-2 border-outline-variant focus:border-primary-navy focus:ring-0 transition-all rounded-t-xl placeholder:text-outline text-on-surface font-medium text-sm outline-none"
                                id="password"
                                name="password"
                                placeholder="••••••••"
                                type={showPassword ? "text" : "password"}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute inset-y-0 right-0 pr-4 flex items-center text-on-surface-variant hover:text-primary-navy transition-colors"
                            >
                                <span className="material-symbols-outlined text-xl">{showPassword ? 'visibility_off' : 'visibility'}</span>
                            </button>
                        </div>
                    </div>

                    <div className="flex items-center gap-3 px-1 pt-1">
                        <input className="w-4 h-4 rounded border-outline-variant text-primary-navy focus:ring-primary-navy/20 bg-surface-container-low" id="remember" type="checkbox" />
                        <label className="text-xs xl:text-sm font-medium text-on-surface-variant cursor-pointer" htmlFor="remember">
                            Manter sessão ativa
                        </label>
                    </div>

                    <button
                        className="w-full py-3 px-6 mt-2 bg-[linear-gradient(135deg,#0C2C47_0%,#4A9D95_100%)] text-white font-headline font-bold text-base xl:text-lg rounded-full shadow-lg hover:shadow-primary-navy/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2"
                        type="submit"
                        disabled={loading}
                    >
                        {loading ? 'Entrando...' : 'Entrar no Superdott'}
                        <span className="material-symbols-outlined text-xl">arrow_forward</span>
                    </button>
                </form>

                <div className="mt-auto pt-6 pb-2 border-t border-slate-200 text-center shrink-0">
                    <p className="text-xs xl:text-sm text-on-surface-variant mb-2">
                        Não possui acesso?
                        <a className="text-primary-navy ml-1 font-bold hover:underline decoration-2 underline-offset-4 cursor-pointer" onClick={() => navigate('/register')}>
                            Cadastre-se aqui
                        </a>
                    </p>
                    <div className="bg-teal-custom/5 border border-teal-custom/10 p-3 rounded-2xl flex items-center justify-between gap-3 shadow-sm hover:scale-[1.01] transition-all cursor-pointer mt-2" onClick={() => navigate('/triagem-plg')}>
                        <div className="text-left">
                            <span className="text-[10px] font-bold uppercase tracking-widest text-teal-custom block">Fluxo de Onboarding</span>
                            <span className="text-xs font-bold text-primary-navy block">Faça uma Triagem Rápida</span>
                        </div>
                        <span className="material-symbols-outlined text-teal-custom">arrow_forward_ios</span>
                    </div>
                </div>
            </div>
        </section>
    );
};

const LoginView = () => (
    <main className="w-full max-w-[1100px] h-[calc(100vh-40px)] max-h-[800px] grid lg:grid-cols-2 bg-white rounded-[2rem] overflow-hidden shadow-[0px_12px_32px_rgba(25,28,35,0.06)] relative z-10 mx-auto">
        <LoginVisual />
        <div className="overflow-y-auto custom-scrollbar flex-1 min-h-0 bg-white">
            <LoginForm />
        </div>
    </main>
);

export default LoginView;