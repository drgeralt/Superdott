const { useState, useEffect } = React;

const App = () => {
    const fetchStudents = useStudentStore(state => state.fetchStudents);
    const isLoading = useStudentStore(state => state.isLoading);
    const error = useStudentStore(state => state.error);
    const students = useStudentStore(state => state.students);

    const navItems = [
        { label: 'Dashboard', href: 'index.html' },
        { label: 'Triagem', href: 'triagem.html' },
        { label: 'Relatórios', href: '#' }
    ];

    // Busca os alunos quando o app carrega
    useEffect(() => {
        fetchStudents();
    }, []);

    return (
        <div>
            <header className="absolute left-0 w-full px-6 z-50 grid grid-cols-[1fr_auto_1fr] items-center pointer-events-none">
                <div className="pt-6 pointer-events-auto flex justify-start items-center">
                    <SplitText text="Super Dashboard" className="md:text-2xl lg:text-5xl font-extrabold text-primary-navy font-headline tracking-tight m-0 leading-none" delay={50} duration={1} />
                </div>
                <div className="pointer-events-auto flex justify-center items-center">
                    <PillNav logo=".\src\img\logo.png" items={navItems} activeHref="index.html" hoveredPillTextColor="#ffffff" initialLoadAnimation={true} />
                </div>
                <div className="pointer-events-auto flex justify-end items-center gap-4">
                    <button className="p-2 text-primary-navy/70 hover:text-primary-navy hover:bg-mint-light rounded-full transition-all active:scale-95 flex items-center justify-center">
                        <span className="material-symbols-outlined">settings</span>
                    </button>
                    <div className="h-10 w-10 rounded-full overflow-hidden border-2 border-white shadow-sm cursor-pointer hover:shadow-md transition-all hover:scale-105">
                        <img alt="Perfil" className="w-full h-full object-cover" src="./src/img/no-user-pfp.jpg" />
                    </div>
                </div>
            </header>

            <main className="pt-24 pb-24 lg:pb-8 px-6 min-h-screen">
                <header className="mb-8">
                    <div className="max-w-xl">
                        <p className="text-on-surface-variant mt-2 text-lg">
                            {isLoading
                                ? "Carregando dados pedagógicos..."
                                : error
                                ? "Erro ao conectar com o servidor."
                                : `Dashboard: Analisando ${students.length} alunos.`
                            }
                        </p>
                    </div>
                </header>

                {/* Alerta de erro */}
                {error && (
                    <div className="mb-6 p-4 bg-error-container text-on-surface rounded-xl flex items-center gap-3">
                        <span className="material-symbols-outlined text-error">error</span>
                        <p className="text-sm">{error}</p>
                    </div>
                )}

                <div className="grid grid-cols-12 gap-6 items-start">
                    <StudentList />
                    <TalentMap />
                    <AIChat />
                </div>
            </main>

            <MobileBottomNav />
        </div>
    );
};

const rootElement = document.getElementById('root');
if (rootElement && !rootElement._reactRootContainer) {
    const root = ReactDOM.createRoot(rootElement);
    root.render(
        <StudentProvider>
            <App />
        </StudentProvider>
    );
}