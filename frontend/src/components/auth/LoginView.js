const { useState } = React;

const LoginVisual = () => (
    <section className="hidden lg:flex flex-col justify-between p-12 relative overflow-hidden bg-[linear-gradient(135deg,#E4F2EA_0%,#f9f9ff_100%)]">
        <div className="relative z-10">
            <div className="flex items-center gap-2 mb-12">
                <span className="font-headline font-extrabold text-4xl text-primary-navy tracking-tighter text-on-surface">Superdott .</span>
            </div>
            <div className="space-y-6">
                <span className="inline-block px-3 py-1 bg-primary-navy/10 text-primary-navy font-label text-[10px] font-bold uppercase tracking-widest rounded-full">
                    Sistema para Pré-Diagnóstico de Super dotados
                </span>
                <h1 className="font-headline text-4xl font-extrabold text-on-surface tracking-tight leading-tight">
                    Transformando dados em <span className="text-primary-navy">excelência.</span>
                </h1>
                <p className="text-on-surface-variant text-lg max-w-sm">
                    Uma plataforma editorial desenhada para coordenadores e docentes que valorizam a precisão e o impacto educacional.
                </p>
            </div>
        </div>

        <div className="relative z-10 mt-auto">
            <p className="text-sm font-medium text-on-surface-variant italic">
                "O Superdott mudou a forma como lidamos com os alunos."
            </p>
        </div>

        {/* Background Illustration */}
        <div className="absolute top-1/2 -right-10 -translate-y-1/2 opacity-10 pointer-events-none">
            <img
                src="./src/img/logo-negative.png"
                alt="Logo Superdott Marca D'água"
                className="w-[450px] h-auto object-contain select-none mix-blend-luminosity"
            />
        </div>
    </section>
);

const LoginForm = () => {
    const [activeProfile, setActiveProfile] = useState('docente');
    const [showPassword, setShowPassword] = useState(false);

    const ProfileButton = ({ id, icon, label }) => {
        const isActive = activeProfile === id;
        return (
            <button
                type="button"
                onClick={() => setActiveProfile(id)}
                className={`flex flex-col items-center gap-2 p-4 rounded-xl transition-all active:scale-95 group ${isActive ? 'bg-primary-navy/5 border-2 border-primary-navy/20' : 'bg-surface-container-low hover:bg-surface-container-high border-2 border-transparent'}`}
            >
                <div className={`w-12 h-12 rounded-full flex items-center justify-center shadow-sm transition-colors ${isActive ? 'bg-primary-navy text-white' : 'bg-white text-on-surface-variant group-hover:shadow-md'}`}>
                    <span className="material-symbols-outlined" style={{ fontVariationSettings: isActive ? "'FILL' 1" : "'FILL' 0" }}>{icon}</span>
                </div>
                <span className={`font-label text-xs ${isActive ? 'font-bold text-primary-navy' : 'font-semibold text-on-surface-variant'}`}>
                    {label}
                </span>
            </button>
        );
    };

    return (
        <section className="p-8 lg:p-16 flex flex-col justify-center w-full">
            <div className="w-full max-w-md mx-auto">
                {/* Mobile Logo */}
                <div className="lg:hidden flex items-center gap-2 mb-8 justify-center">
                    <span className="material-symbols-outlined text-primary-navy text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>auto_stories</span>
                    <span className="font-headline font-extrabold text-2xl tracking-tighter text-on-surface">Superdott</span>
                </div>

                <div className="text-center lg:text-left mb-10">
                    <h2 className="font-headline text-3xl font-bold text-on-surface mb-2">É ótimo te ver aqui!</h2>
                    <p className="text-on-surface-variant">Selecione seu perfil e acesse sua conta.</p>
                </div>

                {/* Profile Selection */}
                <div className="grid grid-cols-3 gap-3 mb-8">
                    <ProfileButton id="coordenador" icon="psychology" label="Coordenador" />
                    <ProfileButton id="docente" icon="menu_book" label="Docente" />
                    <ProfileButton id="admin" icon="admin_panel_settings" label="Administrativo" />
                </div>

                <form className="space-y-6" onSubmit={(e) => { e.preventDefault(); window.location.href = 'index.html'; }}>
                    {/* Email Field */}
                    <div className="space-y-1.5">
                        <label className="block font-label text-xs font-bold text-primary-navy uppercase tracking-wider ml-1" htmlFor="email">
                            E-mail Institucional
                        </label>
                        <div className="relative group">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                <span className="material-symbols-outlined text-on-surface-variant text-xl">alternate_email</span>
                            </div>
                            <input
                                className="block w-full pl-11 pr-4 py-4 bg-surface-container-low border-0 border-b-2 border-outline-variant focus:border-primary-navy focus:ring-0 transition-all rounded-t-xl placeholder:text-outline text-on-surface font-medium"
                                id="email"
                                name="email"
                                placeholder="nome@superdott.edu"
                                type="email"
                                required
                            />
                        </div>
                    </div>

                    {/* Password Field */}
                    <div className="space-y-1.5">
                        <div className="flex justify-between items-end px-1">
                            <label className="block font-label text-xs font-bold text-primary-navy uppercase tracking-wider" htmlFor="password">
                                Senha de Acesso
                            </label>
                            <a className="text-xs font-semibold text-on-surface-variant hover:text-primary-navy transition-colors" href="#">Esqueceu?</a>
                        </div>
                        <div className="relative group">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                <span className="material-symbols-outlined text-on-surface-variant text-xl">lock</span>
                            </div>
                            <input
                                className="block w-full pl-11 pr-12 py-4 bg-surface-container-low border-0 border-b-2 border-outline-variant focus:border-primary-navy focus:ring-0 transition-all rounded-t-xl placeholder:text-outline text-on-surface font-medium"
                                id="password"
                                name="password"
                                placeholder="••••••••"
                                type={showPassword ? "text" : "password"}
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

                    {/* Remember Me */}
                    <div className="flex items-center gap-3 px-1">
                        <input className="w-5 h-5 rounded border-outline-variant text-primary-navy focus:ring-primary-navy/20 bg-surface-container-low" id="remember" type="checkbox" />
                        <label className="text-sm font-medium text-on-surface-variant cursor-pointer" htmlFor="remember">
                            Manter sessão ativa por 30 dias
                        </label>
                    </div>

                    {/* Primary CTA */}
                    <button
                        className="w-full py-4 px-6 bg-[linear-gradient(135deg,#0C2C47_0%,#4A9D95_100%)] text-white font-headline font-bold text-lg rounded-full shadow-lg hover:shadow-primary-navy/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2"
                        type="submit"
                    >
                        Entrar no Superdott
                        <span className="material-symbols-outlined text-xl">arrow_forward</span>
                    </button>
                </form>

                {/* Footer Links */}
                <div className="mt-10 pt-8 border-t border-slate-200 text-center">
                    <p className="text-sm text-on-surface-variant">
                        Não possui acesso?
                        <a className="text-primary-navy ml-1 font-bold hover:underline decoration-2 underline-offset-4" href="#">
                            Contate a Coordenação
                        </a>
                    </p>
                </div>
            </div>
        </section>
    );
};

const LoginView = () => (
    <main className="w-full max-w-[1100px] grid lg:grid-cols-2 bg-white rounded-[2rem] overflow-hidden shadow-[0px_12px_32px_rgba(25,28,35,0.06)] relative z-10">
        <LoginVisual />
        <LoginForm />
    </main>
);

const FloatingHelpButton = () => (
    <button className="fixed bottom-6 right-6 w-14 h-14 bg-white text-primary-navy rounded-full shadow-xl flex items-center justify-center hover:bg-primary-navy hover:text-white transition-all group z-50">
        <span className="material-symbols-outlined text-2xl group-hover:scale-110 duration-200">help</span>
    </button>
);

window.LoginView = LoginView;