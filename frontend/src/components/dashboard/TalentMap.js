const { useEffect, useRef } = React;
const TalentMap = ({ data = [30, 90, 45] }) => {
    const chartRef = useRef(null);
    const chartInstance = useRef(null);

    useEffect(() => {
        if (!chartRef.current) return;
        if (chartInstance.current) {
            chartInstance.current.destroy();
        }

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
                layout: {
                    padding: 24
                },
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
                        angleLines: {
                            display: true,
                            color: 'rgba(12, 44, 71, 0.1)',
                            lineWidth: 1.5
                        },
                        grid: {
                            circular: true, // Força as teias a serem circulares
                            color: 'rgba(12, 44, 71, 0.1)',
                            lineWidth: 1.5
                        },
                        pointLabels: {
                            display: false
                        },
                        ticks: {
                            display: false,
                            min: 0,
                            max: 100,
                            stepSize: 33.3 // Cria exatamente os 3 anéis da imagem
                        }
                    }
                }
            }
        });

        return () => {
            if (chartInstance.current) {
                chartInstance.current.destroy();
            }
        };
    }, [data]);

    return (
        <section className="col-span-12 md:col-span-4 space-y-6">
            <div className="bg-surface-container-lowest rounded-xl p-6 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
                    <span className="material-symbols-outlined text-6xl text-primary-navy">psychology</span>
                </div>
                <h2 className="font-headline font-extrabold text-xl mb-6 flex items-center gap-2 text-primary-navy">
                    Mapa de Talentos
                </h2>

                {/* Contêiner do Gráfico */}
                <div className="relative w-full aspect-square flex items-center justify-center mb-6">

                    {/* O Gráfico Dinâmico */}
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
                        <h4 className="text-xs font-bold uppercase tracking-widest text-primary-navy mb-2">Resumo da Triagem</h4>
                        <p className="text-sm text-on-surface leading-relaxed">
                            Ana demonstra um perfil altamente <span className="text-teal-custom font-bold">analítico</span> com inclinação para artes visuais. Sua capacidade de síntese é superior à média da turma, embora apresente sinais de <span className="text-orange-custom font-bold">retraimento</span> em atividades de grupo que exigem liderança direta.
                        </p>
                    </div>
                </div>
            </div>
        </section>
    );
};

window.TalentMap = TalentMap; 