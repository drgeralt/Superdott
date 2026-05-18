import { useState, useEffect } from 'react';

const SchoolManagement = () => {
    const [schoolStats, setSchoolStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [errorMsg, setErrorMsg] = useState('');
    
    // Form fields
    const [name, setName] = useState('');
    const [address, setAddress] = useState('');
    const [isUpdating, setIsUpdating] = useState(false);
    const [successMsg, setSuccessMsg] = useState('');

    useEffect(() => {
        fetchSchoolProfile();
    }, []);

    const fetchSchoolProfile = async () => {
        setLoading(true);
        setErrorMsg('');
        try {
            const token = localStorage.getItem('superdott_token');
            const headers = {};
            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            }
            const res = await fetch('/api/school-management', { headers });
            if (!res.ok) throw new Error('Falha ao obter dados da escola.');
            const data = await res.json();
            setSchoolStats(data);
            setName(data.name);
            setAddress(data.address || '');
        } catch (err) {
            setErrorMsg(err.message || 'Erro de conexão.');
        } finally {
            setLoading(false);
        }
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        setIsUpdating(true);
        setSuccessMsg('');
        try {
            const token = localStorage.getItem('superdott_token');
            const headers = { 'Content-Type': 'application/json' };
            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            }
            const res = await fetch('/api/school-management', {
                method: 'PUT',
                headers,
                body: JSON.stringify({ name, address })
            });

            if (!res.ok) throw new Error('Falha ao atualizar dados.');
            
            setSuccessMsg('Informações institucionais salvas com sucesso!');
            setSchoolStats(prev => ({ ...prev, name, address }));
        } catch (err) {
            setErrorMsg(err.message || 'Erro de conexão.');
        } finally {
            setIsUpdating(false);
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-24 gap-3 animate-pulse">
                <span className="w-10 h-10 border-4 border-teal-custom border-t-transparent rounded-full animate-spin"></span>
                <p className="text-on-surface-variant font-semibold text-sm">Carregando perfil institucional...</p>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto space-y-8 animate-[fadeIn_0.4s_ease-out]">
            {/* Top Header Card */}
            <div className="bg-[linear-gradient(135deg,#0C2C47_0%,#4A9D95_100%)] rounded-3xl p-8 md:p-10 text-white shadow-xl relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="space-y-3 z-10 text-center md:text-left">
                    <span className="inline-block px-3 py-1 bg-white/15 text-white font-label text-[10px] font-bold uppercase tracking-widest rounded-full">
                        Gestão Institucional
                    </span>
                    <h2 className="font-headline text-3xl font-extrabold tracking-tight">
                        {schoolStats?.name}
                    </h2>
                    <p className="text-white/80 text-sm font-medium">
                        {schoolStats?.address ? `Endereço: ${schoolStats.address}` : "Endereço principal pendente de cadastro"}
                    </p>
                </div>
                <div className="w-20 h-20 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/10 shrink-0">
                    <span className="material-symbols-outlined text-white text-4xl">domain</span>
                </div>
            </div>

            {errorMsg && (
                <div className="p-4 bg-rose-50 border-l-4 border-rose-500 text-rose-700 rounded-r-xl text-xs font-semibold">
                    {errorMsg}
                </div>
            )}

            {/* Quick Metrics Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <div className="bg-white border border-slate-100 p-6 rounded-2xl shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow">
                    <div className="w-12 h-12 rounded-xl bg-teal-50 flex items-center justify-center text-teal-custom shrink-0">
                        <span className="material-symbols-outlined text-2xl">group</span>
                    </div>
                    <div>
                        <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider block">Alunos Ativos</span>
                        <span className="text-2xl font-bold font-headline text-primary-navy block">{schoolStats?.total_students}</span>
                    </div>
                </div>

                <div className="bg-white border border-slate-100 p-6 rounded-2xl shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow">
                    <div className="w-12 h-12 rounded-xl bg-amber-50 flex items-center justify-center text-amber-500 shrink-0">
                        <span className="material-symbols-outlined text-2xl">school</span>
                    </div>
                    <div>
                        <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider block">Professores</span>
                        <span className="text-2xl font-bold font-headline text-primary-navy block">{schoolStats?.total_teachers}</span>
                    </div>
                </div>

                <div className="bg-white border border-slate-100 p-6 rounded-2xl shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow">
                    <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 shrink-0">
                        <span className="material-symbols-outlined text-2xl">description</span>
                    </div>
                    <div>
                        <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider block">Documentos RAG</span>
                        <span className="text-2xl font-bold font-headline text-primary-navy block">{schoolStats?.total_documents}</span>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Lado Esquerdo: Editar Dados */}
                <div className="lg:col-span-7 space-y-8">
                    <div className="bg-white rounded-3xl border border-slate-100 p-8 shadow-sm space-y-6">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 border border-slate-100 shrink-0">
                                <span className="material-symbols-outlined text-xl">edit_note</span>
                            </div>
                            <div>
                                <h3 className="font-headline font-bold text-lg text-primary-navy">Dados Institucionais</h3>
                                <p className="text-slate-400 text-xs font-semibold">Atualize as informações visíveis aos pais e docentes</p>
                            </div>
                        </div>

                        <form onSubmit={handleUpdate} className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Nome da Escola</label>
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    required
                                    className="w-full bg-slate-50/50 border border-slate-200 focus:border-teal-custom focus:ring-2 focus:ring-teal-custom/10 rounded-xl py-3 px-4 text-sm outline-none transition-all"
                                    placeholder="Nome da instituição"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Endereço Principal</label>
                                <input
                                    type="text"
                                    value={address}
                                    onChange={(e) => setAddress(e.target.value)}
                                    className="w-full bg-slate-50/50 border border-slate-200 focus:border-teal-custom focus:ring-2 focus:ring-teal-custom/10 rounded-xl py-3 px-4 text-sm outline-none transition-all"
                                    placeholder="Ex: Rua das Flores, 123 - Centro"
                                />
                            </div>

                            {successMsg && (
                                <p className="text-xs font-bold text-emerald-500">{successMsg}</p>
                            )}

                            <button
                                type="submit"
                                disabled={isUpdating}
                                className="w-full py-3.5 bg-primary-navy hover:bg-teal-custom text-white font-headline font-bold text-sm rounded-xl shadow-md transition-all active:scale-[0.98] disabled:opacity-50"
                            >
                                {isUpdating ? "Salvando..." : "Salvar Alterações"}
                            </button>
                        </form>
                    </div>
                </div>

                {/* Lado Direito: Salas Multifuncionais (AEE) */}
                <div className="lg:col-span-5 space-y-8">
                    <div className="bg-white rounded-3xl border border-slate-100 p-8 shadow-sm space-y-6">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-teal-50 flex items-center justify-center text-teal-custom border border-teal-100 shrink-0">
                                <span className="material-symbols-outlined text-xl">psychology_alt</span>
                            </div>
                            <div>
                                <h3 className="font-headline font-bold text-lg text-primary-navy">Recursos AEE</h3>
                                <p className="text-slate-400 text-xs font-semibold">Salas de Atendimento Especializado</p>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="flex items-start gap-3 p-3 bg-slate-50/50 border border-slate-100 rounded-xl">
                                <input
                                    type="checkbox"
                                    defaultChecked
                                    className="mt-1 accent-teal-custom rounded"
                                />
                                <div>
                                    <h4 className="text-xs font-bold text-slate-800">Sala de Recursos Multifuncionais Tipo I</h4>
                                    <p className="text-[10px] text-slate-400 font-semibold leading-relaxed">Materiais didáticos, computadores adaptados e jogos pedagógicos.</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-3 p-3 bg-slate-50/50 border border-slate-100 rounded-xl">
                                <input
                                    type="checkbox"
                                    defaultChecked
                                    className="mt-1 accent-teal-custom rounded"
                                />
                                <div>
                                    <h4 className="text-xs font-bold text-slate-800">Apoio em Libras / Braille</h4>
                                    <p className="text-[10px] text-slate-400 font-semibold leading-relaxed">Acessibilidade instrumental e tradutores de apoio pedagógico.</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-3 p-3 bg-slate-50/50 border border-slate-100 rounded-xl">
                                <input
                                    type="checkbox"
                                    className="mt-1 accent-teal-custom rounded"
                                />
                                <div>
                                    <h4 className="text-xs font-bold text-slate-800">Laboratório de Estimulação Cognitiva</h4>
                                    <p className="text-[10px] text-slate-400 font-semibold leading-relaxed">Instrumentos sensoriais avançados para neurodiversidades.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SchoolManagement;
