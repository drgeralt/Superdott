import React, { useState, useEffect } from 'react';
import useStudentStore from './store/useStudentStore';
import WechslerModal from './components/dashboard/WechslerModal';
import { useNavigate } from 'react-router-dom';

const MyChildren = () => {
    const fetchStudents = useStudentStore(state => state.fetchStudents);
    const students = useStudentStore(state => state.students);
    const isLoading = useStudentStore(state => state.isLoading);
    const error = useStudentStore(state => state.error);
    
    const [triageModalChild, setTriageModalChild] = useState(null);
    const navigate = useNavigate();
    const [showAddModal, setShowAddModal] = useState(false);
    const [newChildName, setNewChildName] = useState('');
    const [newChildEmail, setNewChildEmail] = useState('');
    const [newChildTurma, setNewChildTurma] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleAddChild = async (e) => {
        e.preventDefault();
        if (!newChildName || !newChildEmail) {
            alert('Por favor, preencha todos os campos obrigatórios.');
            return;
        }
        setIsSubmitting(true);
        try {
            const token = localStorage.getItem('superdott_token');
            const res = await fetch('/api/students/parent-add', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    full_name: newChildName,
                    email: newChildEmail,
                    turma: newChildTurma || null
                })
            });

            if (res.ok) {
                alert('Filho cadastrado com sucesso!');
                setShowAddModal(false);
                setNewChildName('');
                setNewChildEmail('');
                setNewChildTurma('');
                fetchStudents();
            } else {
                const errData = await res.json();
                alert(errData.detail || 'Erro ao cadastrar filho.');
            }
        } catch (err) {
            console.error(err);
            alert('Erro de rede ao cadastrar filho.');
        } finally {
            setIsSubmitting(false);
        }
    };

    useEffect(() => {
        fetchStudents();
    }, [fetchStudents]);

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center py-24 gap-3 animate-pulse">
                <span className="w-10 h-10 border-4 border-teal-custom border-t-transparent rounded-full animate-spin"></span>
                <p className="text-on-surface-variant font-semibold text-sm">Carregando perfil dos seus filhos...</p>
            </div>
        );
    }

    return (
        <div className="max-w-5xl mx-auto space-y-8 animate-[fadeIn_0.4s_ease-out]">
            {/* Top Header Card */}
            <div className="bg-[linear-gradient(135deg,#0C2C47_0%,#4A9D95_100%)] rounded-3xl p-8 md:p-10 text-white shadow-xl relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="space-y-3 z-10 text-center md:text-left">
                    <span className="inline-block px-3 py-1 bg-white/15 text-white font-label text-[10px] font-bold uppercase tracking-widest rounded-full">
                        Espaço da Família
                    </span>
                    <h2 className="font-headline text-3xl font-extrabold tracking-tight">
                        Meus Filhos
                    </h2>
                    <p className="text-white/80 text-sm font-medium">
                        Acompanhe o desenvolvimento individualizado, acesse o mapeamento de potencial e preencha triagens pendentes.
                    </p>
                </div>
                <div className="flex flex-col sm:flex-row gap-3 z-10">
                    <button
                        onClick={() => navigate('/codigos-vinculo')}
                        className="px-5 py-3 bg-white/10 hover:bg-white/20 border border-white/20 text-white rounded-2xl font-headline font-bold text-xs shadow-md transition-all active:scale-95 flex items-center justify-center gap-2 whitespace-nowrap"
                    >
                        <span className="material-symbols-outlined text-sm">key</span>
                        Vincular Filho com Código
                    </button>
                    <button
                        onClick={() => setShowAddModal(true)}
                        className="px-5 py-3 bg-teal-custom hover:bg-teal-custom/90 text-white rounded-2xl font-headline font-bold text-xs shadow-md transition-all active:scale-95 flex items-center justify-center gap-2 whitespace-nowrap"
                    >
                        <span className="material-symbols-outlined text-sm">person_add</span>
                        Cadastrar Novo Filho
                    </button>
                </div>
            </div>

            {error && (
                <div className="p-4 bg-rose-50 border-l-4 border-rose-500 text-rose-700 rounded-r-xl text-xs font-semibold">
                    {error}
                </div>
            )}

            {/* Children Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {students.map(child => (
                    <div 
                        key={child.id}
                        className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
                    >
                        <div className="space-y-5">
                            {/* Child Info Header */}
                            <div className="flex items-center gap-4">
                                <div className="w-14 h-14 rounded-2xl bg-teal-custom/10 text-teal-custom flex items-center justify-center font-extrabold font-headline text-xl shrink-0">
                                    {child.full_name.charAt(0)}
                                </div>
                                <div className="overflow-hidden">
                                    <h4 className="font-headline font-extrabold text-lg text-primary-navy truncate">{child.full_name}</h4>
                                    <p className="text-xs text-slate-400 font-semibold truncate">{child.email}</p>
                                </div>
                            </div>

                            {/* Status and School Details */}
                            <div className="grid grid-cols-2 gap-3 pt-1">
                                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                                    <span className="text-[10px] text-slate-400 uppercase tracking-wider font-bold block mb-0.5">Instituição</span>
                                    <span className="text-xs font-bold text-slate-700 block truncate">
                                        {child.school_name || 'Sem vínculo escolar'}
                                    </span>
                                </div>
                                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                                    <span className="text-[10px] text-slate-400 uppercase tracking-wider font-bold block mb-0.5">Turma</span>
                                    <span className="text-xs font-bold text-slate-700 block truncate">
                                        {child.turma || 'Não definida'}
                                    </span>
                                </div>
                            </div>

                            {/* Wechsler Triage Mapping Area */}
                            <div className="pt-2">
                                {child.triage_completed ? (
                                    <div className="space-y-3 bg-slate-50/50 p-4 rounded-2xl border border-slate-100">
                                        <h5 className="font-headline font-bold text-xs text-primary-navy mb-2 flex items-center gap-1.5">
                                            <span className="material-symbols-outlined text-teal-custom text-base">radar</span>
                                            Potencial Cognitivo (Escala Wechsler)
                                        </h5>
                                        <div className="space-y-2.5">
                                            <div>
                                                <div className="flex justify-between text-[10px] font-extrabold mb-1">
                                                    <span className="text-slate-500 uppercase tracking-wider">Intelectual</span>
                                                    <span className="text-primary-navy">{child.score_intelectual || 0}%</span>
                                                </div>
                                                <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
                                                    <div className="h-full bg-[linear-gradient(90deg,#0C2C47_0%,#4A9D95_100%)] rounded-full" style={{ width: `${child.score_intelectual || 0}%` }}></div>
                                                </div>
                                            </div>
                                            <div>
                                                <div className="flex justify-between text-[10px] font-extrabold mb-1">
                                                    <span className="text-slate-500 uppercase tracking-wider">Criativo</span>
                                                    <span className="text-primary-navy">{child.score_criativo || 0}%</span>
                                                </div>
                                                <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
                                                    <div className="h-full bg-[linear-gradient(90deg,#0C2C47_0%,#4A9D95_100%)] rounded-full" style={{ width: `${child.score_criativo || 0}%` }}></div>
                                                </div>
                                            </div>
                                            <div>
                                                <div className="flex justify-between text-[10px] font-extrabold mb-1">
                                                    <span className="text-slate-500 uppercase tracking-wider">Liderança</span>
                                                    <span className="text-primary-navy">{child.score_lideranca || 0}%</span>
                                                </div>
                                                <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
                                                    <div className="h-full bg-[linear-gradient(90deg,#0C2C47_0%,#4A9D95_100%)] rounded-full" style={{ width: `${child.score_lideranca || 0}%` }}></div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="bg-amber-50/50 p-4 rounded-2xl border border-amber-100/70 space-y-3">
                                        <div className="flex gap-2">
                                            <span className="material-symbols-outlined text-amber-600 font-bold text-xl">warning</span>
                                            <div>
                                                <h5 className="font-headline font-bold text-xs text-amber-800">Mapeamento de Potencial Pendente</h5>
                                                <p className="text-[11px] text-amber-700/80 font-semibold leading-relaxed mt-0.5">
                                                    O questionário Wechsler de triagem ainda não foi preenchido. Precisamos dele para ativar o RAG familiar e suporte de IA.
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="mt-6 pt-4 border-t border-slate-50 flex items-center justify-end gap-2">
                            {child.triage_completed ? (
                                <button
                                    onClick={() => setTriageModalChild(child)}
                                    className="px-4 py-2 bg-slate-50 hover:bg-slate-100 text-slate-600 hover:text-slate-800 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5"
                                >
                                    <span className="material-symbols-outlined text-sm">edit</span>
                                    Atualizar Mapeamento
                                </button>
                            ) : (
                                <button
                                    onClick={() => setTriageModalChild(child)}
                                    className="w-full px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-bold shadow-md transition-all active:scale-95 flex items-center justify-center gap-1.5"
                                >
                                    <span className="material-symbols-outlined text-sm">assignment</span>
                                    Preencher Mapeamento
                                </button>
                            )}
                            <button
                                onClick={() => {
                                    useStudentStore.getState().selectStudent(child);
                                    navigate('/dashboard');
                                }}
                                className="px-4 py-2 bg-primary-navy hover:bg-teal-custom text-white rounded-xl text-xs font-bold transition-all active:scale-95 flex items-center gap-1.5"
                            >
                                <span className="material-symbols-outlined text-sm">chat</span>
                                Conversar
                            </button>
                        </div>
                    </div>
                ))}

                {students.length === 0 && (
                    <div className="col-span-2 bg-white rounded-3xl border border-slate-100 p-12 text-center shadow-sm space-y-4">
                        <div className="w-16 h-16 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center mx-auto text-slate-400">
                            <span className="material-symbols-outlined text-3xl">child_care</span>
                        </div>
                        <div className="space-y-1 max-w-sm mx-auto">
                            <h4 className="font-headline font-extrabold text-base text-primary-navy">Nenhum filho associado</h4>
                            <p className="text-xs text-slate-500 font-semibold leading-relaxed">
                                Você ainda não vinculou perfis de estudantes a esta conta. Peça à escola o código de vínculo SD e clique no botão acima para associá-los.
                            </p>
                        </div>
                        <button
                            onClick={() => navigate('/codigos-vinculo')}
                            className="px-6 py-2.5 bg-primary-navy hover:bg-teal-custom text-white rounded-full font-headline font-bold text-xs shadow-md transition-all active:scale-95 flex items-center gap-2 mx-auto"
                        >
                            <span className="material-symbols-outlined text-sm">key</span>
                            Vincular Primeiro Filho
                        </button>
                    </div>
                )}
            </div>

            {triageModalChild && (
                <WechslerModal 
                    student={triageModalChild} 
                    onClose={() => {
                        setTriageModalChild(null);
                        fetchStudents();
                    }} 
                />
            )}
            {showAddModal && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl max-w-md w-full border border-slate-100 shadow-2xl p-8 space-y-6 animate-[scaleUp_0.3s_ease-out]">
                        <div className="flex justify-between items-center border-b border-slate-100 pb-4">
                            <div>
                                <h3 className="font-headline font-bold text-2xl text-primary-navy">Cadastrar Novo Filho</h3>
                                <p className="text-xs text-slate-500 font-semibold">Crie o perfil de estudante do seu filho na plataforma.</p>
                            </div>
                            <button onClick={() => setShowAddModal(false)} className="p-2 bg-slate-50 text-slate-500 hover:text-rose-500 rounded-xl transition-colors">
                                <span className="material-symbols-outlined text-xl">close</span>
                            </button>
                        </div>

                        <form onSubmit={handleAddChild} className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Nome Completo *</label>
                                <input
                                    type="text"
                                    required
                                    value={newChildName}
                                    onChange={e => setNewChildName(e.target.value)}
                                    placeholder="Ex: João da Silva"
                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-teal-custom cursor-text"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">E-mail do Filho * (Único)</label>
                                <input
                                    type="email"
                                    required
                                    value={newChildEmail}
                                    onChange={e => setNewChildEmail(e.target.value)}
                                    placeholder="Ex: joao@gmail.com"
                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-teal-custom cursor-text"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Turma (Opcional)</label>
                                <input
                                    type="text"
                                    value={newChildTurma}
                                    onChange={e => setNewChildTurma(e.target.value)}
                                    placeholder="Ex: 5º Ano A"
                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-teal-custom cursor-text"
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="w-full py-3 bg-[linear-gradient(135deg,#0C2C47_0%,#4A9D95_100%)] hover:opacity-95 text-white font-headline font-bold text-xs rounded-xl shadow-md transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                {isSubmitting ? 'Cadastrando...' : 'Confirmar Cadastro'}
                                <span className="material-symbols-outlined text-[16px]">done</span>
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MyChildren;
