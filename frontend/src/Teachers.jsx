import { useState, useEffect } from 'react';

const Teachers = () => {
    const [teachers, setTeachers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [errorMsg, setErrorMsg] = useState('');
    const [search, setSearch] = useState('');

    // Modal invite state
    const [isInviteOpen, setIsInviteOpen] = useState(false);
    const [inviteEmail, setInviteEmail] = useState('');
    const [invitePassword, setInvitePassword] = useState('');
    const [inviteLoading, setInviteLoading] = useState(false);
    const [inviteSuccess, setInviteSuccess] = useState('');
    const [inviteError, setInviteError] = useState('');

    useEffect(() => {
        fetchTeachers();
    }, []);

    const fetchTeachers = async () => {
        setLoading(true);
        setErrorMsg('');
        try {
            const token = localStorage.getItem('superdott_token');
            const headers = {};
            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            }
            const res = await fetch('/api/teachers', { headers });
            if (!res.ok) throw new Error('Falha ao obter lista de professores.');
            const data = await res.json();
            setTeachers(data);
        } catch (err) {
            setErrorMsg(err.message || 'Erro de conexão.');
        } finally {
            setLoading(false);
        }
    };

    const handleInvite = async (e) => {
        e.preventDefault();
        setInviteLoading(true);
        setInviteError('');
        setInviteSuccess('');
        try {
            const token = localStorage.getItem('superdott_token');
            const headers = { 'Content-Type': 'application/json' };
            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            }
            const res = await fetch('/api/teachers/invite', {
                method: 'POST',
                headers,
                body: JSON.stringify({ email: inviteEmail })
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.detail || 'Erro ao convidar professor.');

            setInviteSuccess('Professor cadastrado e vinculado com sucesso!');
            setInviteEmail('');
            fetchTeachers();
            setTimeout(() => {
                setIsInviteOpen(false);
                setInviteSuccess('');
            }, 1500);
        } catch (err) {
            setInviteError(err.message || 'Erro de conexão.');
        } finally {
            setInviteLoading(false);
        }
    };

    const handleRevoke = async (id) => {
        if (!confirm('Deseja realmente revogar o acesso deste professor? ele será desativado do sistema.')) return;
        try {
            const token = localStorage.getItem('superdott_token');
            const headers = {};
            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            }
            const res = await fetch(`/api/teachers/${id}`, {
                method: 'DELETE',
                headers
            });

            if (!res.ok) throw new Error('Falha ao revogar acesso do professor.');
            fetchTeachers();
        } catch (err) {
            alert(err.message || 'Erro ao processar revogação.');
        }
    };

    const filteredTeachers = teachers.filter(t => 
        t.email.toLowerCase().includes(search.toLowerCase())
    );

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-24 gap-3 animate-pulse">
                <span className="w-10 h-10 border-4 border-teal-custom border-t-transparent rounded-full animate-spin"></span>
                <p className="text-on-surface-variant font-semibold text-sm">Carregando quadro de professores...</p>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto space-y-8 animate-[fadeIn_0.4s_ease-out]">
            {/* Top Header Card */}
            <div className="bg-[linear-gradient(135deg,#0C2C47_0%,#4A9D95_100%)] rounded-3xl p-8 md:p-10 text-white shadow-xl relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="space-y-3 z-10 text-center md:text-left">
                    <span className="inline-block px-3 py-1 bg-white/15 text-white font-label text-[10px] font-bold uppercase tracking-widest rounded-full">
                        Docentes Cadastrados
                    </span>
                    <h2 className="font-headline text-3xl font-extrabold tracking-tight">
                        Professores Vinculados
                    </h2>
                    <p className="text-white/80 text-sm font-medium">
                        Gerencie as permissões e o acesso ao acompanhamento pedagógico dos alunos.
                    </p>
                </div>
                <button
                    onClick={() => setIsInviteOpen(true)}
                    className="px-6 py-3.5 bg-white hover:bg-teal-custom hover:text-white text-primary-navy font-headline font-bold text-sm rounded-xl shadow-lg hover:scale-[1.02] active:scale-95 transition-all flex items-center gap-2 shrink-0 border border-slate-100"
                >
                    <span className="material-symbols-outlined text-lg">person_add</span>
                    Convidar Professor
                </button>
            </div>

            {errorMsg && (
                <div className="p-4 bg-rose-50 border-l-4 border-rose-500 text-rose-700 rounded-r-xl text-xs font-semibold">
                    {errorMsg}
                </div>
            )}

            {/* List / Search Card */}
            <div className="bg-white rounded-3xl border border-slate-100 p-8 shadow-sm space-y-6">
                <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                    <div className="relative w-full sm:w-80">
                        <span className="material-symbols-outlined text-slate-400 absolute left-4 top-1/2 -translate-y-1/2 text-xl">search</span>
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full bg-slate-50/50 border border-slate-200 focus:border-teal-custom focus:ring-2 focus:ring-teal-custom/10 rounded-xl py-3 pl-11 pr-4 text-xs font-semibold outline-none transition-all"
                            placeholder="Buscar professor por e-mail..."
                        />
                    </div>
                    <span className="text-xs text-slate-400 font-bold uppercase tracking-wider shrink-0">
                        {filteredTeachers.length} Professor(es) Encontrado(s)
                    </span>
                </div>

                <div className="overflow-x-auto border border-slate-100 rounded-2xl">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-100">
                                <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">E-mail Institucional</th>
                                <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Status de Acesso</th>
                                <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Ações de Segurança</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredTeachers.length === 0 ? (
                                <tr>
                                    <td colSpan="3" className="p-8 text-center text-slate-400 font-medium text-xs">
                                        Nenhum professor ativo encontrado nesta listagem.
                                    </td>
                                </tr>
                            ) : (
                                filteredTeachers.map(teacher => (
                                    <tr key={teacher.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                                        <td className="p-4 text-xs font-bold text-slate-800">{teacher.email}</td>
                                        <td className="p-4">
                                            {teacher.is_active ? (
                                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-emerald-50 text-emerald-600 font-label text-[9px] font-bold uppercase rounded-full">
                                                    <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span>
                                                    Ativo
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-rose-50 text-rose-600 font-label text-[9px] font-bold uppercase rounded-full">
                                                    <span className="w-1.5 h-1.5 bg-rose-500 rounded-full"></span>
                                                    Revogado
                                                </span>
                                            )}
                                        </td>
                                        <td className="p-4 text-right">
                                            {teacher.is_active && (
                                                <button
                                                    onClick={() => handleRevoke(teacher.id)}
                                                    className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100/60 text-rose-600 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all"
                                                >
                                                    Revogar Acesso
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Invite Modal */}
            {isInviteOpen && (
                <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl max-w-md w-full border border-slate-100 shadow-2xl p-8 space-y-6 animate-[scaleUp_0.3s_ease-out]">
                        <div className="flex items-center justify-between">
                            <h4 className="font-headline font-bold text-lg text-slate-800">Convidar Novo Professor</h4>
                            <button
                                onClick={() => setIsInviteOpen(false)}
                                className="text-slate-400 hover:text-slate-600 transition-colors"
                            >
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>

                        <form onSubmit={handleInvite} className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">E-mail Institucional</label>
                                <input
                                    type="email"
                                    value={inviteEmail}
                                    onChange={(e) => setInviteEmail(e.target.value)}
                                    required
                                    className="w-full bg-slate-50/50 border border-slate-200 focus:border-teal-custom focus:ring-2 focus:ring-teal-custom/10 rounded-xl py-3 px-4 text-sm outline-none transition-all"
                                    placeholder="professor@escola.edu"
                                />
                            </div>



                            {inviteError && (
                                <p className="text-xs font-bold text-rose-500">{inviteError}</p>
                            )}
                            {inviteSuccess && (
                                <p className="text-xs font-bold text-emerald-500">{inviteSuccess}</p>
                            )}

                            <button
                                type="submit"
                                disabled={inviteLoading}
                                className="w-full py-3 bg-primary-navy hover:bg-teal-custom text-white rounded-xl font-bold text-xs transition-all active:scale-[0.98] disabled:opacity-50 shadow-md"
                            >
                                {inviteLoading ? "Cadastrando..." : "Cadastrar Professor"}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Teachers;
