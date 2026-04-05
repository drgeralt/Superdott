const StudentList = () => (
    <section className="col-span-12 md:col-span-3 space-y-4">
        <div className="bg-surface-container-low rounded-xl p-4">
            <h3 className="font-headline font-bold text-sm mb-4 text-on-surface-variant flex items-center gap-2">
                <span className="material-symbols-outlined text-lg">group</span>
                Turma 9º Ano A
            </h3>
            <div className="space-y-2">
                <button className="w-full flex items-center gap-3 p-3 bg-white rounded-xl shadow-sm border-l-4 border-primary-navy text-left transition-all">
                    <img className="w-10 h-10 rounded-full object-cover" src="./src/img/no-user-pfp.jpg" alt="Avatar Ana" />
                    <div>
                        <p className="text-sm font-bold font-headline text-primary-navy">Ana Beatriz Silva</p>
                        <p className="text-[10px] text-on-surface-variant font-medium">Atenção Especial</p>
                    </div>
                </button>
                <button className="w-full flex items-center gap-3 p-3 hover:bg-surface-container-high rounded-xl text-left transition-all group">
                    <img className="w-10 h-10 rounded-full object-cover" src="./src/img/no-user-pfp.jpg" alt="Avatar Carlos" />
                    <div>
                        <p className="text-sm font-bold font-headline text-on-surface group-hover:text-primary-navy transition-colors">Carlos Eduardo</p>
                        <p className="text-[10px] text-on-surface-variant">Progresso Estável</p>
                    </div>
                </button>
                <button className="w-full flex items-center gap-3 p-3 hover:bg-surface-container-high rounded-xl text-left transition-all group">
                    <img className="w-10 h-10 rounded-full object-cover" src="./src/img/no-user-pfp.jpg" alt="Avatar Mariana" />
                    <div>
                        <p className="text-sm font-bold font-headline text-on-surface group-hover:text-primary-navy transition-colors">Mariana Oliveira</p>
                        <p className="text-[10px] text-on-surface-variant font-medium">Destaque Criativo</p>
                    </div>
                </button>
            </div>
        </div>
    </section>
);