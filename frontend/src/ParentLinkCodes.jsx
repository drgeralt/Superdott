import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useStudentStore from './store/useStudentStore';

const ParentLinkCodes = () => {
    const [code, setCode] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState(null);
    const [errorMsg, setErrorMsg] = useState(null);
    
    const fetchStudents = useStudentStore(state => state.fetchStudents);
    const navigate = useNavigate();

    const handleRedeem = async (e) => {
        e.preventDefault();
        if (!code.trim()) return;

        setLoading(true);
        setMessage(null);
        setErrorMsg(null);

        try {
            const token = localStorage.getItem('superdott_token');
            const res = await fetch('/api/students/redeem-code', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ code: code.trim().toUpperCase() })
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.detail || 'Não foi possível resgatar o código.');
            }

            setMessage('Sucesso! O perfil do seu filho foi vinculado à sua conta com sucesso.');
            setCode('');
            
            // Recarrega os alunos no Zustand store
            await fetchStudents();
        } catch (err) {
            setErrorMsg(err.message || 'Código inválido, expirado ou já utilizado.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-3xl mx-auto space-y-8 animate-[fadeIn_0.4s_ease-out]">
            {/* Top Header Card */}
            <div className="bg-[linear-gradient(135deg,#7C3AED_0%,#4F46E5_100%)] rounded-3xl p-8 md:p-10 text-white shadow-xl relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="space-y-3 z-10 text-center md:text-left">
                    <span className="inline-block px-3 py-1 bg-white/15 text-white font-label text-[10px] font-bold uppercase tracking-widest rounded-full">
                        Segurança & Conectividade
                    </span>
                    <h2 className="font-headline text-3xl font-extrabold tracking-tight">
                        Códigos de Vínculo
                    </h2>
                    <p className="text-white/80 text-sm font-medium">
                        Insira o código gerado pela instituição do seu filho para vinculá-lo instantaneamente e com segurança ao seu perfil.
                    </p>
                </div>
                <div className="w-20 h-20 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/10 shrink-0">
                    <span className="material-symbols-outlined text-white text-4xl">key</span>
                </div>
            </div>

            {/* Main Content Form Card */}
            <div className="bg-white rounded-3xl border border-slate-100 p-8 shadow-sm space-y-6">
                <div className="max-w-md mx-auto space-y-6 text-center">
                    <div className="space-y-2">
                        <h3 className="font-headline font-extrabold text-xl text-primary-navy">Vincular Novo Estudante</h3>
                        <p className="text-xs text-slate-500 font-semibold leading-relaxed">
                            Insira o código alfa-numérico enviado pela escola ou disponível no convite (Exemplo: <span className="font-mono text-indigo-600 font-bold">SD-X1Y2Z3</span>).
                        </p>
                    </div>

                    {message && (
                        <div className="p-4 bg-emerald-50 border border-emerald-100 text-emerald-700 text-xs font-bold rounded-2xl flex items-center gap-3 text-left">
                            <span className="material-symbols-outlined text-emerald-600 shrink-0 text-xl">verified</span>
                            <span>{message}</span>
                        </div>
                    )}

                    {errorMsg && (
                        <div className="p-4 bg-rose-50 border border-rose-100 text-rose-700 text-xs font-bold rounded-2xl flex items-center gap-3 text-left">
                            <span className="material-symbols-outlined text-rose-600 shrink-0 text-xl">error</span>
                            <span>{errorMsg}</span>
                        </div>
                    )}

                    <form onSubmit={handleRedeem} className="space-y-4">
                        <div className="relative group">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                <span className="material-symbols-outlined text-slate-400 group-focus-within:text-indigo-600 text-xl transition-colors">vpn_key</span>
                            </div>
                            <input
                                className="block w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-100/50 transition-all rounded-2xl placeholder:text-slate-400 text-primary-navy font-mono text-center text-lg font-bold outline-none"
                                placeholder="SD-XXXXXX"
                                value={code}
                                onChange={(e) => setCode(e.target.value)}
                                disabled={loading}
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading || !code.trim()}
                            className="w-full py-4 bg-[linear-gradient(135deg,#7C3AED_0%,#4F46E5_100%)] text-white font-headline font-bold rounded-2xl shadow-lg hover:shadow-indigo-500/20 active:scale-[0.98] disabled:opacity-50 transition-all flex items-center justify-center gap-2"
                        >
                            {loading ? 'Validando código...' : 'Resgatar Vínculo Familiar'}
                            {!loading && <span className="material-symbols-outlined text-xl">arrow_forward</span>}
                        </button>
                    </form>

                    <div className="pt-6 border-t border-slate-50 flex items-center justify-between gap-4">
                        <button
                            onClick={() => navigate('/filhos')}
                            className="px-5 py-2.5 bg-slate-50 hover:bg-slate-100 text-slate-600 hover:text-slate-800 font-headline font-bold text-xs rounded-xl transition-all"
                        >
                            Ver Meus Filhos
                        </button>
                        <button
                            onClick={() => navigate('/dashboard')}
                            className="px-5 py-2.5 bg-slate-50 hover:bg-slate-100 text-slate-600 hover:text-slate-800 font-headline font-bold text-xs rounded-xl transition-all"
                        >
                            Voltar ao Dashboard
                        </button>
                    </div>
                </div>
            </div>

            {/* Instruction / Help Box */}
            <div className="bg-slate-50 border border-slate-100 p-6 rounded-3xl flex items-start gap-4">
                <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl shrink-0">
                    <span className="material-symbols-outlined text-xl">help</span>
                </div>
                <div className="space-y-1">
                    <h4 className="font-headline font-bold text-sm text-primary-navy">Onde encontro o código de vínculo?</h4>
                    <p className="text-xs text-slate-500 font-semibold leading-relaxed">
                        Este código é de uso exclusivo, expira em 48 horas e deve ser fornecido pela equipe pedagógica ou direção da escola onde seu filho está matriculado. Se você recebeu um convite por e-mail, o código constará diretamente no corpo da mensagem.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default ParentLinkCodes;
