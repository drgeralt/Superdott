const { useEffect, useRef } = React;

const TalentMap = () => {
    const selectedStudent = useStudentStore(state => state.selectedStudent);
    const isLoading = useStudentStore(state => state.isLoading);
    const chartRef = useRef(null);
    const chartInstance = useRef(null);

    const data = selectedStudent ? [
        selectedStudent.score_intelectual || 0,
        selectedStudent.score_criatividade || 0,
        selectedStudent.score_lideranca || 0,
    ] : [0, 0, 0];

    useEffect(() => {
        if (!chartRef.current) return;
        if (chartInstance.current) chartInstance.current.destroy();

        const ctx = chartRef.current.getContext('2d');
        chartInstance.current = new window.Chart(ctx, {
            type: 'radar',
            data: {
                labels: ['Intelectual', 'Criativa', 'Liderança'],
                datasets: [{
                    label: 'Pontuação',
                    data: data,
                    backgroundColor: 'rgba(12, 44, 71, 0.15)',
                    borderColor: '#0C2C47',
                    borderWidth: 3,
                    pointRadius: 0,
                    pointHoverRadius: 6,
                    pointBackgroundColor: '#0C2C47',
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                layout: { padding: 24 },
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        backgroundColor: '#0C2C47',
                        titleFont: { family: 'Montserrat', size: 13 },
                        bodyFont: { family: 'Montserrat', size: 14, weight: 'bold' },
                        padding: 12,
                        displayColors: false,
                    }
                },
                scales: {
                    r: {
                        angleLines: { display: true, color: 'rgba(12, 44, 71, 0.1)', lineWidth: 1.5 },
                        grid: { circular: true, color: 'rgba(12, 44, 71, 0.1)', lineWidth: 1.5 },
                        pointLabels: { display: false },
                        ticks: { display: false, min: 0, max: 10, stepSize: 3.3 }
                    }
                }
            }
        });

        return () => { if (chartInstance.current) chartInstance.current.destroy(); };
    }, [data]);

    // Loading state
    if (isLoading) {
        return (
            <section className="col-span-12 md:col-span-4 space-y-6">
                <div className="bg-surface-container-lowest rounded-xl p-6 shadow-sm animate-pulse">
                    <div className="h-5 bg-outline-variant/30 rounded w-1/2 mb-6"></div>
                    <div className="w-full aspect-square bg-outline-variant/20 rounded-full"></div>
                </div>
            </section>
        );
    }

    // Sem aluno selecionado
    if (!selectedStudent) {
        return (
            <section className="col-span-12 md:col-span-4 space-y-6">
                <div className="bg-surface-container-lowest rounded-xl p-6 shadow-sm flex items-center justify-center h-64">
                    <p className="text-on-surface-variant text-sm">Selecione um aluno para ver o mapa de talentos.</p>
                </div>
            </section>
        );
    }

    return (
        <section className="col-span-12 md:col-span-4 space-y-6">
            <div className="bg-surface-container-lowest rounded-xl p-6 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
                    <span className="material-symbols-outlined text-6xl text-primary-navy">psychology</span>
                </div>
                <h2 className="font-headline font-extrabold text-xl mb-2 flex items-center gap-2 text-primary-navy">
                    Mapa de Talentos
                </h2>
                <p className="text-xs text-on-surface-variant mb-4 font-medium">
                    {selectedStudent.full_name}
                </p>
                <div className="relative w-full aspect-square flex items-center justify-center mb-6">
                    <div className="w-full h-full absolute inset-0">
                        <canvas ref={chartRef}></canvas>
                    </div>
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 text-[10px] font-bold uppercase text-white bg-primary-navy px-3 py-1 rounded-full z-10 shadow-sm">
                        Intelectual
                    </div>
                    <div className="absolute bottom-4 right-0 text-[10px] font-bold uppercase text-white bg-teal-custom px-3 py-1 rounded-full z-10 shadow-sm">
                        Criativa
                    </div>
                    <div className="absolute bottom-4 left-0 text-[10px] font-bold uppercase text-white bg-orange-custom px-3 py-1 rounded-full z-10 shadow-sm">
                        Liderança
                    </div>
                </div>
                <div className="space-y-4">
                    <div className="bg-mint-light p-4 rounded-xl">
                        <h4 className="text-xs font-bold uppercase tracking-widest text-primary-navy mb-2">Scores da Triagem</h4>
                        <div className="space-y-1 text-sm text-on-surface">
                            <p>Intelectual: <strong>{selectedStudent.score_intelectual}/10</strong></p>
                            <p>Criativa: <strong>{selectedStudent.score_criatividade}/10</strong></p>
                            <p>Liderança: <strong>{selectedStudent.score_lideranca}/10</strong></p>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

window.TalentMap = TalentMap;