import React, { useState, useEffect } from 'react';

const GlobalMetrics = () => {
    const [schools, setSchools] = useState([]);
    const [summary, setSummary] = useState(null);
    const [loading, setLoading] = useState(true);
    const [errorMsg, setErrorMsg] = useState('');
    const [search, setSearch] = useState('');

    // Modal state for adding a new school
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [schoolName, setSchoolName] = useState('');
    const [schoolAddress, setSchoolAddress] = useState('');
    const [directorEmail, setDirectorEmail] = useState('');
    const [directorPassword, setDirectorPassword] = useState('');
    const [modalLoading, setModalLoading] = useState(false);
    const [modalSuccess, setModalSuccess] = useState('');
    const [modalError, setModalError] = useState('');

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        setErrorMsg('');
        try {
            const token = localStorage.getItem('superdott_token');
            const headers = { 'Authorization': `Bearer ${token}` };

            // 1. Fetch Summary Metrics
            const summaryRes = await fetch('/api/dashboard/summary', { headers });
            if (!summaryRes.ok) throw new Error('Falha ao carregar métricas do dashboard.');
            const summaryData = await summaryRes.json();
            setSummary(summaryData);

            // 2. Fetch Schools List with details
            const schoolsRes = await fetch('/api/school-management/admin/schools', { headers });
            if (!schoolsRes.ok) throw new Error('Falha ao carregar lista de escolas.');
            const schoolsData = await schoolsRes.json();
            setSchools(schoolsData);
        } catch (err) {
            setErrorMsg(err.message || 'Erro ao carregar dados do servidor.');
        } finally {
            setLoading(false);
        }
    };

    const [sortKey, setSortKey] = useState('name');
    const [sortOrder, setSortOrder] = useState('asc');

    const handleSort = (key) => {
        if (sortKey === key) {
            setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
        } else {
            setSortKey(key);
            setSortOrder('asc');
        }
    };

    const handleCreateSchool = async (e) => {
        e.preventDefault();
        setModalLoading(true);
        setModalError('');
        setModalSuccess('');
        try {
            const token = localStorage.getItem('superdott_token');
            const res = await fetch('/api/school-management/admin/schools', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    name: schoolName,
                    address: schoolAddress,
                    director_email: directorEmail,
                    director_password: directorPassword
                })
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.detail || 'Erro ao cadastrar escola.');

            setModalSuccess('Escola e Diretor cadastrados com sucesso!');
            setSchoolName('');
            setSchoolAddress('');
            setDirectorEmail('');
            setDirectorPassword('');
            fetchData();
            setTimeout(() => {
                setIsModalOpen(false);
                setModalSuccess('');
            }, 2000);
        } catch (err) {
            setModalError(err.message || 'Erro de rede.');
        } finally {
            setModalLoading(false);
        }
    };

    const filteredSchools = schools.filter(s =>
        s.name.toLowerCase().includes(search.toLowerCase()) ||
        (s.director_email && s.director_email.toLowerCase().includes(search.toLowerCase()))
    );

    const sortedSchools = [...filteredSchools].sort((a, b) => {
        let valA = a[sortKey];
        let valB = b[sortKey];
        if (typeof valA === 'string') {
            valA = valA.toLowerCase();
            valB = valB.toLowerCase();
        }
        if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
        if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
        return 0;
    });

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-24 gap-3 animate-pulse">
                <span className="w-10 h-10 border-4 border-teal-custom border-t-transparent rounded-full animate-spin"></span>
                <p className="text-on-surface-variant font-semibold text-sm">Carregando painel de métricas globais...</p>
            </div>
        );
    }

    // Helper to format action names
    const getActionBadge = (action) => {
        switch(action) {
            case 'PDI_GENERATED':
                return <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-purple-50 text-purple-700 font-label text-[9px] font-black uppercase rounded-full border border-purple-100">
                    <span className="material-symbols-outlined text-[12px]">description</span> PDI Criado
                </span>;
            case 'STUDENT_LINKED':
                return <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-700 font-label text-[9px] font-black uppercase rounded-full border border-emerald-100">
                    <span className="material-symbols-outlined text-[12px]">link</span> Aluno Vinculado
                </span>;
            case 'STUDENT_UNLINKED':
                return <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-rose-50 text-rose-700 font-label text-[9px] font-black uppercase rounded-full border border-rose-100">
                    <span className="material-symbols-outlined text-[12px]">link_off</span> Desvinculado
                </span>;
            case 'SENSITIVE_DATA_ACCESSED':
                return <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 text-amber-700 font-label text-[9px] font-black uppercase rounded-full border border-amber-100">
                    <span className="material-symbols-outlined text-[12px]">security</span> Acesso Sensível
                </span>;
            default:
                return <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-50 text-slate-700 font-label text-[9px] font-black uppercase rounded-full border border-slate-100">
                    {action}
                </span>;
        }
    };

    return (
        <div className="max-w-6xl mx-auto space-y-8 animate-[fadeIn_0.4s_ease-out]">
            {/* Top Header Card */}
            <div className="bg-[linear-gradient(135deg,#0C2C47_0%,#4A9D95_100%)] rounded-3xl p-8 md:p-10 text-white shadow-xl relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="space-y-3 z-10 text-center md:text-left">
                    <span className="inline-block px-3 py-1 bg-white/15 text-white font-label text-[10px] font-bold uppercase tracking-widest rounded-full">
                        Administração Global da Plataforma
                    </span>
                    <h2 className="font-headline text-3xl font-extrabold tracking-tight">
                        Métricas Globais da Rede
                    </h2>
                    <p className="text-white/80 text-sm font-medium max-w-xl">
                        Acompanhe o crescimento integrado do Superdott através de estatísticas de engajamento, PDIs gerados e saúde pedagógica da rede escolar.
                    </p>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="px-6 py-3.5 bg-white hover:bg-teal-custom hover:text-white text-primary-navy font-headline font-bold text-sm rounded-xl shadow-lg hover:scale-[1.02] active:scale-95 transition-all flex items-center gap-2 shrink-0 border border-slate-100"
                >
                    <span className="material-symbols-outlined text-lg">add_business</span>
                    Cadastrar Nova Escola
                </button>
            </div>

            {errorMsg && (
                <div className="p-4 bg-rose-50 border-l-4 border-rose-500 text-rose-700 rounded-r-xl text-xs font-semibold">
                    {errorMsg}
                </div>
            )}

            {/* Premium Metrics Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-6">
                {/* Schools Card */}
                <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm flex items-center gap-4 hover:shadow-md transition-all hover:scale-[1.02]">
                    <div className="p-3.5 bg-teal-custom/10 text-teal-custom rounded-xl">
                        <span className="material-symbols-outlined text-2xl">domain</span>
                    </div>
                    <div>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Escolas Ativas</p>
                        <h3 className="text-2xl font-black text-slate-800 mt-1">{summary?.metrics?.total_schools || 0}</h3>
                    </div>
                </div>

                {/* Teachers Card */}
                <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm flex items-center gap-4 hover:shadow-md transition-all hover:scale-[1.02]">
                    <div className="p-3.5 bg-amber-500/10 text-amber-600 rounded-xl">
                        <span className="material-symbols-outlined text-2xl">school</span>
                    </div>
                    <div>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Professores</p>
                        <h3 className="text-2xl font-black text-slate-800 mt-1">{summary?.metrics?.active_teachers || 0}</h3>
                    </div>
                </div>

                {/* Students Card */}
                <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm flex items-center gap-4 hover:shadow-md transition-all hover:scale-[1.02]">
                    <div className="p-3.5 bg-indigo-500/10 text-indigo-600 rounded-xl">
                        <span className="material-symbols-outlined text-2xl">face</span>
                    </div>
                    <div>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Alunos</p>
                        <h3 className="text-2xl font-black text-slate-800 mt-1">{summary?.metrics?.total_students || 0}</h3>
                    </div>
                </div>

                {/* PDIs Card */}
                <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm flex items-center gap-4 hover:shadow-md transition-all hover:scale-[1.02]">
                    <div className="p-3.5 bg-purple-500/10 text-purple-600 rounded-xl">
                        <span className="material-symbols-outlined text-2xl">description</span>
                    </div>
                    <div>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">PDIs Gerados</p>
                        <h3 className="text-2xl font-black text-slate-800 mt-1">{summary?.metrics?.total_pdis || 0}</h3>
                    </div>
                </div>
            </div>

            {/* Advanced Dashboard Layout (Talents & Audit Logs) */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* SVG Dial/Progress for Network Averages */}
                <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm space-y-6">
                    <div>
                        <h3 className="font-headline font-bold text-lg text-primary-navy flex items-center gap-2">
                            <span className="material-symbols-outlined text-teal-custom">insights</span>
                            Perfil de Potencial Médio da Rede
                        </h3>
                        <p className="text-xs text-slate-500 leading-relaxed font-semibold">
                            Consolidado das dimensões cognitivas mapeadas na triagem Wechsler de todos os alunos da plataforma.
                        </p>
                    </div>

                    <div className="grid grid-cols-3 gap-4 py-4 text-center">
                        {/* Intelectual Ring */}
                        <div className="flex flex-col items-center space-y-2">
                            <div className="relative w-20 h-20 flex items-center justify-center">
                                <svg className="w-full h-full transform -rotate-90">
                                    <circle cx="40" cy="40" r="34" className="stroke-slate-100" strokeWidth="6" fill="transparent" />
                                    <circle cx="40" cy="40" r="34" className="stroke-teal-custom transition-all duration-1000" strokeWidth="6" fill="transparent" 
                                            strokeDasharray="213.6" strokeDashoffset={213.6 - (213.6 * (summary?.metrics?.avg_intelectual || 0)) / 100} />
                                </svg>
                                <span className="absolute font-headline font-black text-sm text-primary-navy">{Math.round(summary?.metrics?.avg_intelectual || 0)}%</span>
                            </div>
                            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Intelectual</span>
                        </div>

                        {/* Criativo Ring */}
                        <div className="flex flex-col items-center space-y-2">
                            <div className="relative w-20 h-20 flex items-center justify-center">
                                <svg className="w-full h-full transform -rotate-90">
                                    <circle cx="40" cy="40" r="34" className="stroke-slate-100" strokeWidth="6" fill="transparent" />
                                    <circle cx="40" cy="40" r="34" className="stroke-amber-500 transition-all duration-1000" strokeWidth="6" fill="transparent" 
                                            strokeDasharray="213.6" strokeDashoffset={213.6 - (213.6 * (summary?.metrics?.avg_criativo || 0)) / 100} />
                                </svg>
                                <span className="absolute font-headline font-black text-sm text-primary-navy">{Math.round(summary?.metrics?.avg_criativo || 0)}%</span>
                            </div>
                            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Criativo</span>
                        </div>

                        {/* Lideranca Ring */}
                        <div className="flex flex-col items-center space-y-2">
                            <div className="relative w-20 h-20 flex items-center justify-center">
                                <svg className="w-full h-full transform -rotate-90">
                                    <circle cx="40" cy="40" r="34" className="stroke-slate-100" strokeWidth="6" fill="transparent" />
                                    <circle cx="40" cy="40" r="34" className="stroke-indigo-500 transition-all duration-1000" strokeWidth="6" fill="transparent" 
                                            strokeDasharray="213.6" strokeDashoffset={213.6 - (213.6 * (summary?.metrics?.avg_lideranca || 0)) / 100} />
                                </svg>
                                <span className="absolute font-headline font-black text-sm text-primary-navy">{Math.round(summary?.metrics?.avg_lideranca || 0)}%</span>
                            </div>
                            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Liderança</span>
                        </div>
                    </div>
                </div>

                {/* Audit Timeline */}
                <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm space-y-6 flex flex-col justify-between">
                    <div>
                        <h3 className="font-headline font-bold text-lg text-primary-navy flex items-center gap-2">
                            <span className="material-symbols-outlined text-purple-600">policy</span>
                            Log de Atividades e Auditoria
                        </h3>
                        <p className="text-xs text-slate-500 leading-relaxed font-semibold">
                            Últimas ações críticas executadas na plataforma pelos diretores e professores.
                        </p>
                    </div>

                    <div className="space-y-4 my-2">
                        {summary?.recent_activities?.length === 0 ? (
                            <p className="text-xs text-slate-400 font-medium italic text-center py-4">Nenhuma atividade registrada ainda.</p>
                        ) : (
                            summary?.recent_activities?.map(log => (
                                <div key={log.id} className="flex items-start gap-3 p-3 bg-slate-50 rounded-2xl border border-slate-100 hover:border-slate-200 transition-colors">
                                    <div className="shrink-0 mt-0.5">{getActionBadge(log.action)}</div>
                                    <div className="overflow-hidden flex-1">
                                        <p className="text-[11px] font-extrabold text-slate-800 truncate">{log.user_email}</p>
                                        <span className="text-[10px] text-slate-400 font-bold block mt-0.5">{log.created_at}</span>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>

            {/* List / Search Card with interactive sorting */}
            <div className="bg-white rounded-3xl border border-slate-100 p-8 shadow-sm space-y-6">
                <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                    <div className="relative w-full sm:w-80">
                        <span className="material-symbols-outlined text-slate-400 absolute left-4 top-1/2 -translate-y-1/2 text-xl">search</span>
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full bg-slate-50/50 border border-slate-200 focus:border-teal-custom focus:ring-2 focus:ring-teal-custom/10 rounded-xl py-3 pl-11 pr-4 text-xs font-semibold outline-none transition-all"
                            placeholder="Buscar por escola ou e-mail do diretor..."
                        />
                    </div>
                    <span className="text-xs text-slate-400 font-bold uppercase tracking-wider shrink-0">
                        {filteredSchools.length} Escola(s) Cadastrada(s)
                    </span>
                </div>

                <div className="overflow-x-auto border border-slate-100 rounded-2xl">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-100">
                                <th onClick={() => handleSort('name')} className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider cursor-pointer hover:bg-slate-100/50 transition-colors">
                                    <div className="flex items-center gap-1">
                                        Escola
                                        {sortKey === 'name' && (
                                            <span className="material-symbols-outlined text-sm">{sortOrder === 'asc' ? 'arrow_upward' : 'arrow_downward'}</span>
                                        )}
                                    </div>
                                </th>
                                <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Endereço</th>
                                <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Diretor Responsável</th>
                                <th onClick={() => handleSort('total_students')} className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider cursor-pointer hover:bg-slate-100/50 transition-colors text-center">
                                    <div className="flex items-center justify-center gap-1">
                                        Alunos
                                        {sortKey === 'total_students' && (
                                            <span className="material-symbols-outlined text-sm">{sortOrder === 'asc' ? 'arrow_upward' : 'arrow_downward'}</span>
                                        )}
                                    </div>
                                </th>
                                <th onClick={() => handleSort('total_teachers')} className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider cursor-pointer hover:bg-slate-100/50 transition-colors text-center">
                                    <div className="flex items-center justify-center gap-1">
                                        Professores
                                        {sortKey === 'total_teachers' && (
                                            <span className="material-symbols-outlined text-sm">{sortOrder === 'asc' ? 'arrow_upward' : 'arrow_downward'}</span>
                                        )}
                                    </div>
                                </th>
                                <th onClick={() => handleSort('total_documents')} className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider cursor-pointer hover:bg-slate-100/50 transition-colors text-center">
                                    <div className="flex items-center justify-center gap-1">
                                        Documentos
                                        {sortKey === 'total_documents' && (
                                            <span className="material-symbols-outlined text-sm">{sortOrder === 'asc' ? 'arrow_upward' : 'arrow_downward'}</span>
                                        )}
                                    </div>
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {sortedSchools.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="p-8 text-center text-slate-400 font-medium text-xs">
                                        Nenhuma instituição de ensino cadastrada.
                                    </td>
                                </tr>
                            ) : (
                                sortedSchools.map(school => (
                                    <tr key={school.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                                        <td className="p-4 text-xs font-bold text-slate-800">{school.name}</td>
                                        <td className="p-4 text-xs text-slate-500 font-medium">{school.address || "Não informado"}</td>
                                        <td className="p-4 text-xs text-slate-500 font-medium">{school.director_email}</td>
                                        <td className="p-4 text-xs font-black text-slate-800 text-center">{school.total_students}</td>
                                        <td className="p-4 text-xs font-black text-slate-800 text-center">{school.total_teachers}</td>
                                        <td className="p-4 text-xs font-black text-slate-800 text-center">{school.total_documents}</td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Create School Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl max-w-lg w-full border border-slate-100 shadow-2xl p-8 space-y-6 animate-[scaleUp_0.3s_ease-out]">
                        <div className="flex items-center justify-between">
                            <h4 className="font-headline font-bold text-lg text-slate-800">Cadastrar Nova Escola & Diretor</h4>
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="text-slate-400 hover:text-slate-600 transition-colors"
                            >
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>

                        <form onSubmit={handleCreateSchool} className="space-y-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Nome da Escola</label>
                                    <input
                                        type="text"
                                        value={schoolName}
                                        onChange={(e) => setSchoolName(e.target.value)}
                                        required
                                        className="w-full bg-slate-50/50 border border-slate-200 focus:border-teal-custom focus:ring-2 focus:ring-teal-custom/10 rounded-xl py-3 px-4 text-xs font-semibold outline-none transition-all"
                                        placeholder="Colégio Dom Bosco"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Endereço</label>
                                    <input
                                        type="text"
                                        value={schoolAddress}
                                        onChange={(e) => setSchoolAddress(e.target.value)}
                                        required
                                        className="w-full bg-slate-50/50 border border-slate-200 focus:border-teal-custom focus:ring-2 focus:ring-teal-custom/10 rounded-xl py-3 px-4 text-xs font-semibold outline-none transition-all"
                                        placeholder="Av. Paulista, 1000 - SP"
                                    />
                                </div>
                            </div>

                            <hr className="border-slate-100" />
                            <p className="text-[10px] font-extrabold uppercase tracking-wider text-teal-custom">Credenciais do Diretor Administrativo</p>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">E-mail do Diretor</label>
                                    <input
                                        type="email"
                                        value={directorEmail}
                                        onChange={(e) => setDirectorEmail(e.target.value)}
                                        required
                                        className="w-full bg-slate-50/50 border border-slate-200 focus:border-teal-custom focus:ring-2 focus:ring-teal-custom/10 rounded-xl py-3 px-4 text-xs font-semibold outline-none transition-all"
                                        placeholder="diretor@escola.com"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Senha Provisória</label>
                                    <input
                                        type="password"
                                        value={directorPassword}
                                        onChange={(e) => setDirectorPassword(e.target.value)}
                                        required
                                        className="w-full bg-slate-50/50 border border-slate-200 focus:border-teal-custom focus:ring-2 focus:ring-teal-custom/10 rounded-xl py-3 px-4 text-xs font-semibold outline-none transition-all"
                                        placeholder="Mínimo de 6 dígitos"
                                    />
                                </div>
                            </div>

                            {modalError && (
                                <p className="text-xs font-bold text-rose-500">{modalError}</p>
                            )}
                            {modalSuccess && (
                                <p className="text-xs font-bold text-emerald-500">{modalSuccess}</p>
                            )}

                            <button
                                type="submit"
                                disabled={modalLoading}
                                className="w-full py-3 bg-primary-navy hover:bg-teal-custom text-white rounded-xl font-bold text-xs transition-all active:scale-[0.98] disabled:opacity-50 shadow-md"
                            >
                                {modalLoading ? "Processando..." : "Cadastrar Escola & Diretor"}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default GlobalMetrics;
