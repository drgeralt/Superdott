import { useState, useEffect } from 'react';

const AcademicLinks = () => {
    const [linksData, setLinksData] = useState({ active_links: [], link_codes: [] });
    const [loading, setLoading] = useState(true);
    const [errorMsg, setErrorMsg] = useState('');
    const [activeTab, setActiveTab] = useState('connections'); // connections or codes

    useEffect(() => {
        fetchAcademicLinks();
    }, []);

    const fetchAcademicLinks = async () => {
        setLoading(true);
        setErrorMsg('');
        try {
            const token = localStorage.getItem('superdott_token');
            const headers = {};
            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            }
            const res = await fetch('/api/academic-links', { headers });
            if (!res.ok) throw new Error('Falha ao obter dados de vínculos.');
            const data = await res.json();
            setLinksData(data);
        } catch (err) {
            setErrorMsg(err.message || 'Erro de conexão.');
        } finally {
            setLoading(false);
        }
    };

    const handleRevokeLink = async (parentId, studentId) => {
        if (!confirm('Deseja realmente revogar o vínculo deste responsável com o aluno? Ele perderá o acesso visual imediatamente.')) return;
        try {
            const token = localStorage.getItem('superdott_token');
            const headers = {};
            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            }
            const res = await fetch(`/api/academic-links/${parentId}/${studentId}`, {
                method: 'DELETE',
                headers
            });

            if (!res.ok) throw new Error('Falha ao revogar vínculo.');
            fetchAcademicLinks();
        } catch (err) {
            alert(err.message || 'Erro ao revogar vínculo.');
        }
    };

    const handleCopyInvite = (code) => {
        const msg = `Olá! Você foi convidado para acompanhar o desenvolvimento pedagógico e cognitivo de ${code.student_name} na plataforma Superdott!

Para ativar o seu vínculo familiar com segurança, acesse o portal, realize o seu cadastro de responsável pelo link abaixo e resgate seu código de acesso.

Link de Cadastro: ${window.location.origin}/cadastro?role=Pai
Código de Acesso: ${code.code}

Estamos ansiosos para colaborar na jornada educacional do seu filho(a)!`;

        navigator.clipboard.writeText(msg)
            .then(() => alert('Mensagem de convite copiada com sucesso!'))
            .catch(() => alert('Erro ao copiar convite.'));
    };

    const handleSendEmail = (code) => {
        const subject = encodeURIComponent('Convite de Acompanhamento Escolar - Superdott');
        const body = encodeURIComponent(`Olá! Você foi convidado para acompanhar o desenvolvimento pedagógico e cognitivo de ${code.student_name} na plataforma Superdott!

Para ativar o seu vínculo familiar com segurança, acesse o portal, realize o seu cadastro de responsável pelo link abaixo e resgate seu código de acesso.

Link de Cadastro: ${window.location.origin}/cadastro?role=Pai
Código de Acesso: ${code.code}

Estamos ansiosos para colaborar na jornada educacional do seu filho(a)!`);
        
        window.open(`mailto:${code.email_responsavel}?subject=${subject}&body=${body}`, '_blank');
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-24 gap-3 animate-pulse">
                <span className="w-10 h-10 border-4 border-teal-custom border-t-transparent rounded-full animate-spin"></span>
                <p className="text-on-surface-variant font-semibold text-sm">Carregando centro de vínculos acadêmicos...</p>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto space-y-8 animate-[fadeIn_0.4s_ease-out]">
            {/* Top Header Card */}
            <div className="bg-[linear-gradient(135deg,#0C2C47_0%,#4A9D95_100%)] rounded-3xl p-8 md:p-10 text-white shadow-xl relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="space-y-3 z-10 text-center md:text-left">
                    <span className="inline-block px-3 py-1 bg-white/15 text-white font-label text-[10px] font-bold uppercase tracking-widest rounded-full">
                        Gestão de Permissões
                    </span>
                    <h2 className="font-headline text-3xl font-extrabold tracking-tight">
                        Vínculos Acadêmicos
                    </h2>
                    <p className="text-white/80 text-sm font-medium">
                        Monitore e aprove as conexões entre alunos, responsáveis familiares e professores.
                    </p>
                </div>
                <div className="w-20 h-20 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/10 shrink-0">
                    <span className="material-symbols-outlined text-white text-4xl">link</span>
                </div>
            </div>

            {errorMsg && (
                <div className="p-4 bg-rose-50 border-l-4 border-rose-500 text-rose-700 rounded-r-xl text-xs font-semibold">
                    {errorMsg}
                </div>
            )}

            {/* Navigation Tabs */}
            <div className="flex items-center gap-2 border-b border-slate-100">
                <button
                    onClick={() => setActiveTab('connections')}
                    className={`px-5 py-3 text-xs font-bold uppercase tracking-wider border-b-2 transition-all flex items-center gap-2 ${
                        activeTab === 'connections'
                            ? 'border-teal-custom text-teal-custom'
                            : 'border-transparent text-slate-400 hover:text-slate-600'
                    }`}
                >
                    <span className="material-symbols-outlined text-lg">supervised_user_circle</span>
                    Vínculos Ativos ({linksData.active_links.length})
                </button>
                <button
                    onClick={() => setActiveTab('codes')}
                    className={`px-5 py-3 text-xs font-bold uppercase tracking-wider border-b-2 transition-all flex items-center gap-2 ${
                        activeTab === 'codes'
                            ? 'border-teal-custom text-teal-custom'
                            : 'border-transparent text-slate-400 hover:text-slate-600'
                    }`}
                >
                    <span className="material-symbols-outlined text-lg">vpn_key</span>
                    Códigos de Acesso ({linksData.link_codes.length})
                </button>
            </div>

            {/* Content Table Card */}
            <div className="bg-white rounded-3xl border border-slate-100 p-8 shadow-sm">
                {activeTab === 'connections' ? (
                    <div className="space-y-4">
                        <div className="overflow-x-auto border border-slate-100 rounded-2xl">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-slate-50 border-b border-slate-100">
                                        <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Aluno da Escola</th>
                                        <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Responsável Vinculado</th>
                                        <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Ação</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {linksData.active_links.length === 0 ? (
                                        <tr>
                                            <td colSpan="3" className="p-8 text-center text-slate-400 font-medium text-xs">
                                                Nenhum vínculo familiar ativo nesta escola no momento.
                                            </td>
                                        </tr>
                                    ) : (
                                        linksData.active_links.map((link, idx) => (
                                            <tr key={idx} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                                                <td className="p-4 text-xs font-bold text-slate-800">{link.student_name}</td>
                                                <td className="p-4 text-xs font-bold text-slate-600">{link.parent_email}</td>
                                                <td className="p-4 text-right">
                                                    <button
                                                        onClick={() => handleRevokeLink(link.parent_id, link.student_id)}
                                                        className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100/60 text-rose-600 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all"
                                                    >
                                                        Revogar Vínculo
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-4">
                        <div className="overflow-x-auto border border-slate-100 rounded-2xl">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-slate-50 border-b border-slate-100">
                                        <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Código</th>
                                        <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Estudante Alvo</th>
                                        <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Responsável Convidado</th>
                                        <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Estado</th>
                                        <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Ações</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {linksData.link_codes.length === 0 ? (
                                        <tr>
                                            <td colSpan="5" className="p-8 text-center text-slate-400 font-medium text-xs">
                                                Nenhum código de vínculo gerado recentemente nesta escola.
                                            </td>
                                        </tr>
                                    ) : (
                                        linksData.link_codes.map(code => (
                                            <tr key={code.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                                                <td className="p-4 text-xs font-bold text-teal-custom font-mono">{code.code}</td>
                                                <td className="p-4 text-xs font-bold text-slate-800">{code.student_name}</td>
                                                <td className="p-4 text-xs font-bold text-slate-500">
                                                    {code.nome_responsavel} ({code.email_responsavel})
                                                </td>
                                                <td className="p-4">
                                                    {code.is_used ? (
                                                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-emerald-50 text-emerald-600 font-label text-[9px] font-bold uppercase rounded-full">
                                                            Utilizado
                                                        </span>
                                                    ) : (
                                                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-amber-50 text-amber-600 font-label text-[9px] font-bold uppercase rounded-full">
                                                            Pendente
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="p-4 text-right flex items-center justify-end gap-2">
                                                    <button
                                                        onClick={() => handleCopyInvite(code)}
                                                        className="px-2.5 py-1.5 bg-slate-50 hover:bg-teal-custom/5 text-slate-700 hover:text-teal-custom border border-slate-200 hover:border-teal-custom/20 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all flex items-center gap-1"
                                                    >
                                                        <span className="material-symbols-outlined text-[12px]">content_copy</span>
                                                        Copiar Convite
                                                    </button>
                                                    <button
                                                        onClick={() => handleSendEmail(code)}
                                                        className="px-2.5 py-1.5 bg-teal-50 hover:bg-teal-100/50 text-teal-custom rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all flex items-center gap-1"
                                                    >
                                                        <span className="material-symbols-outlined text-[12px]">mail</span>
                                                        Enviar E-mail
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AcademicLinks;
