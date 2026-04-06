const navItems = [
    { label: 'Dashboard', href: 'index.html' },
    { label: 'Triagem', href: 'triagem.html' },
    { label: 'Relatórios', href: 'relatorios.html' }
];

const App = () => {
    return (
        <div>
            <header className="absolute left-0 w-full px-6 z-50 grid grid-cols-[1fr_auto_1fr] items-center pointer-events-none">

                {/* Esquerda: Saudação */}
                <div className="pt-6 pointer-events-auto flex justify-start items-center "> {/* translate-y-1.5 */}
                    <SplitText
                        text="Painel de Triagem"
                        className="md:text-2xl lg:text-5xl font-extrabold text-primary-navy font-headline tracking-tight m-0 leading-none"
                        delay={50}
                        duration={1}
                    />
                </div>

                {/*Centro: PillNav*/}
                <div className="pointer-events-auto flex justify-center items-center">
                    <PillNav
                        logo=".\src\img\logo.png"
                        items={navItems}
                        activeHref="triagem.html"
                        hoveredPillTextColor="#ffffff"
                        initialLoadAnimation={true}
                    />
                </div>

                {/* Direita */}
                <div className="pointer-events-auto flex justify-end items-center gap-4">
                    {/* Botão de Engrenagem (Configurações) */}
                    <button className="p-2 text-primary-navy/70 hover:text-primary-navy hover:bg-mint-light rounded-full transition-all active:scale-95 flex items-center justify-center">
                        <span className="material-symbols-outlined">settings</span>
                    </button>

                    {/* Avatar do Usuário */}
                    <div className="h-10 w-10 rounded-full overflow-hidden border-2 border-white shadow-sm cursor-pointer hover:shadow-md transition-all hover:scale-105">
                        <img
                            alt="Perfil do usuário"
                            className="w-full h-full object-cover"
                            src="./src/img/no-user-pfp.jpg"
                        />
                    </div>
                </div>

            </header>

            <main className="pt-24 pb-24 lg:pb-8 px-6 min-h-screen">
                <TriageView />
            </main>

            <MobileBottomNav />
        </div>
    );
};

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);