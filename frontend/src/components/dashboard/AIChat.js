const AIChat = () => (
    <section className="col-span-12 md:col-span-5 h-[650px] flex flex-col bg-surface-container-low rounded-xl overflow-hidden shadow-sm">
        <header className="px-6 py-4 bg-white/80 backdrop-blur-md flex justify-between items-center border-b border-outline-variant/10">
            <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-primary-navy to-teal-custom flex items-center justify-center text-white">
                    <span className="material-symbols-outlined text-xl">auto_awesome</span>
                </div>
                <div>
                    <h3 className="text-sm font-bold font-headline text-primary-navy">Assistente Pedagógico IA</h3>
                    <div className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-teal-custom block"></span>
                        <p className="text-[10px] text-on-surface-variant font-medium italic">Assistindo <span className="text-primary-navy font-bold">Ana Beatriz Silva</span></p>
                    </div>
                </div>
            </div>
            <button className="text-slate-400 hover:text-primary-navy transition-colors">
                <span className="material-symbols-outlined">more_vert</span>
            </button>
        </header>
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
            <div className="flex flex-col items-start gap-2 max-w-[85%]">
                <div className="bg-white p-4 rounded-2xl rounded-tl-none shadow-sm text-sm leading-relaxed border border-outline-variant/10">
                    Olá, Professor. Analisando o Mapa de Talentos da Ana, percebo que ela se destaca na área Criativa. Como posso ajudar a integrá-la melhor nas aulas de Matemática esta semana?
                </div>
                <div className="text-[10px] text-on-surface-variant font-medium px-1">09:12 AM</div>
            </div>

            <div className="flex flex-col items-end gap-2 ml-auto max-w-[85%]">
                <div className="bg-primary-navy text-white p-4 rounded-2xl rounded-tr-none shadow-md text-sm leading-relaxed">
                    Gostaria de sugestões de atividades que utilizem o desenho para explicar geometria espacial. Ela parece ter dificuldade com abstração pura.
                </div>
                <div className="text-[10px] text-on-surface-variant font-medium px-1">09:15 AM</div>
            </div>

            <div className="flex flex-col items-start gap-3 max-w-[90%]">
                <div className="bg-white p-4 rounded-2xl rounded-tl-none shadow-sm text-sm leading-relaxed border border-outline-variant/10">
                    Excelente abordagem. Com base nas diretrizes pedagógicas, recomendo o uso de <strong>perspectiva isométrica</strong>. Sugiro que ela crie uma "Cidade Geométrica" no papel, onde cada prédio represente um cálculo de volume específico.

                    <div className="mt-4 pt-4 border-t border-slate-100">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-primary-navy mb-2">Fontes Citadas</p>
                        <div className="grid grid-cols-2 gap-2">
                            <div className="bg-mint-light p-2 rounded-lg flex items-center gap-2 hover:bg-mint-accent transition-colors cursor-pointer border border-outline-variant/5">
                                <span className="material-symbols-outlined text-xs text-primary-navy">description</span>
                                <span className="text-[9px] font-bold truncate">Manual BNCC - Matemática</span>
                            </div>
                            <div className="bg-mint-light p-2 rounded-lg flex items-center gap-2 hover:bg-mint-accent transition-colors cursor-pointer border border-outline-variant/5">
                                <span className="material-symbols-outlined text-xs text-primary-navy">article</span>
                                <span className="text-[9px] font-bold truncate">Artigo: Visualização Espacial</span>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="text-[10px] text-on-surface-variant font-medium px-1">09:16 AM</div>
            </div>
        </div>
        <footer className="p-4 bg-white border-t border-outline-variant/10">
            <div className="relative flex items-center">
                <input className="w-full bg-surface-container-low border-none rounded-full py-3 px-6 text-sm focus:ring-2 focus:ring-primary-navy/20 placeholder:text-on-surface-variant/50" placeholder="Pergunte algo sobre o plano de aula..." type="text" />
                <button className="absolute right-2 w-10 h-10 flex items-center justify-center bg-primary-navy text-white rounded-full shadow-lg hover:bg-teal-custom active:scale-90 transition-all">
                    <span className="material-symbols-outlined">send</span>
                </button>
            </div>
        </footer>
    </section>
);