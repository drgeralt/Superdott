import { useEffect, useRef } from 'react';
import Chart from 'chart.js/auto';

const TalentMap = ({ student }) => {
    const chartRef = useRef(null);
    const chartInstance = useRef(null);

    const radarData = student?.scores ? [
        student.scores.intelectual || 0,
        student.scores.criativa || 0,
        student.scores.lideranca || 0
    ] : [0, 0, 0];

    useEffect(() => {
        if (!chartRef.current) return;
        if (chartInstance.current) chartInstance.current.destroy();

        const ctx = chartRef.current.getContext('2d');

        chartInstance.current = new Chart(ctx, {
            type: 'radar',
            data: {
                labels: ['Intelectual', 'Criativa', 'Liderança'],
                datasets: [{
                    label: 'Pontuação',
                    data: radarData,
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
                maintainAspectRatio: false, // Fundamental para não quebrar a tela
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
                        ticks: { display: false, min: 0, max: 100, stepSize: 33.3 }
                    }
                }
            }
        });

        return () => {
            if (chartInstance.current) chartInstance.current.destroy();
        };// eslint-disable-next-line react-hooks/exhaustive-deps
    }, [student?.id, student?.scores]);

    return (
        <section className="col-span-12 md:col-span-4">
            <div className="bg-surface-container-lowest rounded-xl p-6 shadow-sm relative overflow-hidden border border-outline-variant/10 flex flex-col h-auto md:h-[calc(100vh-200px)] min-h-[500px]">
                <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
                    <span className="material-symbols-outlined text-6xl text-primary-navy">psychology</span>
                </div>
                <h2 className="font-headline font-extrabold text-xl mb-4 flex items-center gap-2 text-primary-navy shrink-0">
                    Mapa de Talentos
                </h2>

                {/* Container Dinâmico: flex-1 e min-h-0 permitem que o gráfico encolha se a tela for pequena */}
                <div className="relative w-full max-w-[320px] mx-auto flex-1 min-h-0 flex items-center justify-center mb-6">
                    <div className="w-full h-full absolute inset-0">
                        <canvas ref={chartRef}></canvas>
                    </div>

                    <div className="absolute top-0 left-1/2 -translate-x-1/2 text-[10px] font-bold uppercase text-white bg-primary-navy px-3 py-1 rounded-full z-10 shadow-sm pointer-events-none">
                        Intelectual
                    </div>
                    <div className="absolute bottom-2 right-[-10px] text-[10px] font-bold uppercase text-white bg-teal-custom px-3 py-1 rounded-full z-10 shadow-sm pointer-events-none">
                        Criativa
                    </div>
                    <div className="absolute bottom-2 left-[-10px] text-[10px] font-bold uppercase text-white bg-orange-custom px-3 py-1 rounded-full z-10 shadow-sm pointer-events-none">
                        Liderança
                    </div>
                </div>

                <div className="mt-auto shrink-0">
                    <div className="bg-mint-light p-4 rounded-xl border border-teal-custom/5">
                        <h4 className="text-xs font-bold uppercase tracking-widest text-primary-navy mb-2">Resumo da Triagem</h4>
                        <p className="text-xs text-on-surface leading-relaxed">
                            {student ? (
                                <>O perfil de <span className="font-bold text-primary-navy">{student.full_name}</span> está sendo analisado com base nas submissões recentes.</>
                            ) : (
                                "Selecione um aluno para visualizar o resumo analítico de competências e talentos."
                            )}
                        </p>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default TalentMap;