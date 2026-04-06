const { useState, useEffect } = React;

const navItems = [
    { label: 'Dashboard', href: 'index.html' },
    { label: 'Triagem', href: 'triagem.html' },
    { label: 'Relatórios', href: '#' }
];

const App = () => {
    const [students, setStudents] = useState([]);
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [loading, setLoading] = useState(true);

    // BUSCA REAL DOS ALUNOS
    useEffect(() => {
        fetch('http://localhost:8000/api/students')
            .then(res => res.json())
            .then(data => {
                setStudents(data);
                if (data.length > 0) setSelectedStudent(data); // Seleciona o primeiro por padrão
                setLoading(false);
            })
            .catch(err => console.error("Erro ao carregar alunos:", err));
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
                            {loading ? "Carregando dados pedagógicos..." : `Dashboard: Analisando ${students.length} alunos.`}
                        </p>
                    </div>
                </header>

                <div className="grid grid-cols-12 gap-6 items-start">
                    {/* Passamos os dados e a função de clique */}
                    <StudentList 
                        students={students} 
                        activeId={selectedStudent?.id}
                        onSelect={setSelectedStudent} 
                    />
                    
                    {/* O gráfico agora recebe dados REAIS do aluno selecionado */}
                    <TalentMap student={selectedStudent} />
                    
                    {/* O Chat recebe o contexto do aluno para a IA saber de quem está falando */}
                    <AIChat student={selectedStudent} />
                </div>
            </main>
            <MobileBottomNav />
        </div>
    );
};

const rootElement = document.getElementById('root');
if (rootElement && !rootElement._reactRootContainer) {
    const root = ReactDOM.createRoot(rootElement);
    root.render(<App />);
}