import React, { useState } from 'react';
import triagemGratis from '../../triagemGratis.json';
import useStudentStore from '../../store/useStudentStore';

const WechslerModal = ({ student, onClose }) => {
    const fetchStudents = useStudentStore(state => state.fetchStudents);
    const [step, setStep] = useState(0);
    const [answers, setAnswers] = useState({});
    const [loading, setLoading] = useState(false);

    const questions = triagemGratis.questions;
    const currentQuestion = questions[step];

    const handleSelectOption = (value) => {
        setAnswers(prev => ({
            ...prev,
            [currentQuestion.id]: value
        }));
    };

    const handleNext = async () => {
        if (step < questions.length - 1) {
            setStep(step + 1);
        } else {
            // Submit
            setLoading(true);
            try {
                const token = localStorage.getItem('superdott_token');
                const res = await fetch(`/api/students/${student.id}/triage`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({ answers })
                });

                if (res.ok) {
                    await fetchStudents();
                    onClose();
                } else {
                    alert('Erro ao enviar triagem.');
                }
            } catch (err) {
                console.error(err);
                alert('Erro de conexão.');
            } finally {
                setLoading(false);
            }
        }
    };

    return (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl max-w-2xl w-full border border-slate-100 shadow-2xl p-8 space-y-8 animate-[scaleUp_0.3s_ease-out]">
                {/* Header */}
                <div className="flex justify-between items-center border-b border-slate-100 pb-4">
                    <div>
                        <h3 className="font-headline font-bold text-2xl text-primary-navy">Mapeamento Wechsler</h3>
                        <p className="text-sm text-slate-500 font-semibold">Avaliação para {student.full_name}</p>
                    </div>
                    <button onClick={onClose} className="p-2 bg-slate-50 text-slate-500 hover:text-rose-500 rounded-xl transition-colors">
                        <span className="material-symbols-outlined text-xl">close</span>
                    </button>
                </div>

                {/* Progress */}
                <div className="space-y-2">
                    <div className="flex justify-between text-xs font-bold text-slate-400">
                        <span>Questão {step + 1} de {questions.length}</span>
                        <span>{Math.round(((step) / questions.length) * 100)}% concluído</span>
                    </div>
                    <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                        <div 
                            className="h-full bg-teal-custom rounded-full transition-all duration-300"
                            style={{ width: `${((step) / questions.length) * 100}%` }}
                        ></div>
                    </div>
                </div>

                {/* Question */}
                <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100 text-center space-y-3">
                    <span className="inline-block px-3 py-1 bg-white text-teal-custom font-headline font-bold text-[10px] tracking-widest uppercase rounded-full shadow-sm">
                        {currentQuestion.domain}
                    </span>
                    <h4 className="font-headline font-bold text-xl text-primary-navy leading-snug">
                        {currentQuestion.text}
                    </h4>
                </div>

                {/* Options (Likert Scale) */}
                <div className="space-y-3">
                    {currentQuestion.options.map(option => (
                        <button
                            key={option.score}
                            onClick={() => handleSelectOption(option.score)}
                            className={`w-full text-left px-5 py-4 rounded-xl border transition-all ${
                                answers[currentQuestion.id] === option.score
                                    ? 'bg-[linear-gradient(135deg,#0C2C47_0%,#4A9D95_100%)] text-white shadow-md border-transparent'
                                    : 'bg-white border-slate-200 text-slate-600 hover:border-teal-custom hover:bg-slate-50'
                            }`}
                        >
                            <div className="flex items-center gap-3">
                                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 ${
                                    answers[currentQuestion.id] === option.score ? 'border-white' : 'border-slate-300'
                                }`}>
                                    {answers[currentQuestion.id] === option.score && <div className="w-3 h-3 bg-white rounded-full"></div>}
                                </div>
                                <div>
                                    <span className="block font-bold text-sm">{option.text}</span>
                                </div>
                            </div>
                        </button>
                    ))}
                </div>

                {/* Footer Controls */}
                <div className="flex justify-between items-center pt-4 border-t border-slate-100">
                    <button
                        onClick={() => setStep(Math.max(0, step - 1))}
                        disabled={step === 0 || loading}
                        className="px-6 py-3 font-bold text-sm text-slate-500 hover:text-primary-navy disabled:opacity-50 transition-colors"
                    >
                        Anterior
                    </button>
                    <button
                        onClick={handleNext}
                        disabled={answers[currentQuestion.id] === undefined || loading}
                        className="px-8 py-3 bg-primary-navy hover:bg-teal-custom text-white font-headline font-bold text-sm rounded-xl shadow-md transition-all active:scale-95 disabled:opacity-50 flex items-center gap-2"
                    >
                        {loading ? 'Processando...' : (step === questions.length - 1 ? 'Concluir Mapeamento' : 'Próxima Questão')}
                        {!loading && <span className="material-symbols-outlined text-lg">arrow_forward</span>}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default WechslerModal;
