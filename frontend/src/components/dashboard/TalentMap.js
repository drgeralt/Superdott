const TalentMap = () => (
    <section className="col-span-12 md:col-span-4 space-y-6">
        <div className="bg-surface-container-lowest rounded-xl p-6 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10">
                <span className="material-symbols-outlined text-6xl text-primary-navy">psychology</span>
            </div>
            <h2 className="font-headline font-extrabold text-xl mb-6 flex items-center gap-2 text-primary-navy">
                Mapa de Talentos
            </h2>
            <div className="relative w-full aspect-square flex items-center justify-center mb-6">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 200 200">
                    <circle className="radar-grid" cx="100" cy="100" r="80" />
                    <circle className="radar-grid" cx="100" cy="100" r="60" />
                    <circle className="radar-grid" cx="100" cy="100" r="40" />
                    <circle className="radar-grid" cx="100" cy="100" r="20" />
                    <line className="radar-grid" x1="100" x2="100" y1="100" y2="20" />
                    <line className="radar-grid" x1="100" x2="169" y1="100" y2="140" />
                    <line className="radar-grid" x1="100" x2="31" y1="100" y2="140" />
                    <polygon className="radar-area" points="100,36 162,136 72,116" />
                </svg>
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-2 text-[10px] font-bold uppercase text-white bg-primary-navy px-2 py-0.5 rounded-full">Intelectual</div>
                <div className="absolute bottom-4 right-2 text-[10px] font-bold uppercase text-white bg-teal-custom px-2 py-0.5 rounded-full">Criativa</div>
                <div className="absolute bottom-4 left-2 text-[10px] font-bold uppercase text-white bg-orange-custom px-2 py-0.5 rounded-full">Liderança</div>
            </div>
            <div className="space-y-4">
                <div className="bg-mint-light p-4 rounded-xl">
                    <h4 className="text-xs font-bold uppercase tracking-widest text-primary-navy mb-2">Resumo da Triagem</h4>
                    <p className="text-sm text-on-surface leading-relaxed">
                        Ana demonstra um perfil altamente <span className="text-teal-custom font-bold">analítico</span> com inclinação para artes visuais. Sua capacidade de síntese é superior à média da turma, embora apresente sinais de <span className="text-orange-custom font-bold">retraimento</span> em atividades de grupo que exigem liderança direta.
                    </p>
                </div>
            </div>
        </div>
    </section>
);