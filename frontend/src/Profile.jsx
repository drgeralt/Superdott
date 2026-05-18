import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from './store/useAuthStore';

const Profile = () => {
    const navigate = useNavigate();
    const logout = useAuthStore(state => state.logout);
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [errorMsg, setErrorMsg] = useState('');
    
    // Password state
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmNewPassword, setConfirmNewPassword] = useState('');
    const [pwdSuccess, setPwdSuccess] = useState('');
    const [pwdError, setPwdError] = useState('');
    const [pwdLoading, setPwdLoading] = useState(false);

    // Consent modal state
    const [isConsentModalOpen, setIsConsentModalOpen] = useState(false);
    const [consentLoading, setConsentLoading] = useState(false);

    // Multitenancy state
    const [teacherSchools, setTeacherSchools] = useState([]);
    const [publicSchools, setPublicSchools] = useState([]);
    
    // Avatar Upload
    const [avatarFile, setAvatarFile] = useState(null);
    const [avatarUploading, setAvatarUploading] = useState(false);

    useEffect(() => {
        fetchProfile();
        fetchPublicSchools();
    }, []);

    const fetchPublicSchools = async () => {
        try {
            const res = await fetch('/api/auth/schools');
            if (res.ok) {
                const data = await res.json();
                setPublicSchools(data);
            }
        } catch (err) {
            console.error(err);
        }
    };

    const fetchTeacherSchools = async () => {
        try {
            const token = localStorage.getItem('superdott_token');
            const res = await fetch('/api/teachers/my-schools', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setTeacherSchools(data);
            }
        } catch (err) {
            console.error(err);
        }
    };

    const fetchProfile = async () => {
        setLoading(true);
        setErrorMsg('');
        try {
            const token = localStorage.getItem('superdott_token');
            const headers = {};
            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            }
            const res = await fetch('/api/profile', { headers });
            if (!res.ok) throw new Error('Não foi possível carregar o perfil.');
            const data = await res.json();
            setProfile(data);
            
            if (data.role === 'Professor') {
                fetchTeacherSchools();
            }
        } catch (err) {
            setErrorMsg(err.message || 'Erro de conexão.');
        } finally {
            setLoading(false);
        }
    };

    const handleAvatarUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setAvatarUploading(true);
        try {
            const token = localStorage.getItem('superdott_token');
            const formData = new FormData();
            formData.append('file', file);

            const res = await fetch('/api/profile/avatar', {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` },
                body: formData
            });

            if (res.ok) {
                const data = await res.json();
                setProfile(prev => ({ ...prev, avatar_url: data.avatar_url }));
                useAuthStore.setState((state) => ({
                    user: state.user ? { ...state.user, avatar_url: data.avatar_url } : { avatar_url: data.avatar_url }
                }));
            } else {
                alert('Erro ao fazer upload da foto de perfil.');
            }
        } catch (err) {
            console.error(err);
        } finally {
            setAvatarUploading(false);
        }
    };

    const handlePasswordChange = async (e) => {
        e.preventDefault();
        setPwdError('');
        setPwdSuccess('');
        
        if (newPassword !== confirmNewPassword) {
            setPwdError('A nova senha e a confirmação não coincidem.');
            return;
        }

        if (newPassword.length < 6) {
            setPwdError('A nova senha deve ter no mínimo 6 caracteres.');
            return;
        }

        setPwdLoading(true);
        try {
            const token = localStorage.getItem('superdott_token');
            const headers = { 'Content-Type': 'application/json' };
            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            }
            const res = await fetch('/api/profile/change-password', {
                method: 'PUT',
                headers,
                body: JSON.stringify({ current_password: currentPassword, new_password: newPassword })
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.detail || 'Erro ao alterar senha.');
            
            setPwdSuccess('Senha atualizada com sucesso!');
            setCurrentPassword('');
            setNewPassword('');
            setConfirmNewPassword('');
        } catch (err) {
            setPwdError(err.message || 'Erro de conexão.');
        } finally {
            setPwdLoading(false);
        }
    };

    const handleRevokeConsent = async () => {
        setConsentLoading(true);
        try {
            const token = localStorage.getItem('superdott_token');
            const headers = {};
            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            }
            const res = await fetch('/api/profile/revoke-consent', {
                method: 'POST',
                headers
            });
            if (!res.ok) throw new Error('Falha ao revogar consentimento.');
            
            logout();
            navigate('/');
        } catch (err) {
            alert(err.message || 'Erro ao processar revogação.');
        } finally {
            setConsentLoading(false);
            setIsConsentModalOpen(false);
        }
    };

    const downloadPersonalData = () => {
        if (!profile) return;
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(profile, null, 2));
        const downloadAnchor = document.createElement('a');
        downloadAnchor.setAttribute("href", dataStr);
        downloadAnchor.setAttribute("download", `superdott_meus_dados_${profile.id}.json`);
        document.body.appendChild(downloadAnchor);
        downloadAnchor.click();
        downloadAnchor.remove();
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-24 gap-3 animate-pulse">
                <span className="w-10 h-10 border-4 border-teal-custom border-t-transparent rounded-full animate-spin"></span>
                <p className="text-on-surface-variant font-semibold text-sm">Buscando informações do perfil...</p>
            </div>
        );
    }

    return (
        <div className="max-w-5xl mx-auto space-y-8 animate-[fadeIn_0.4s_ease-out]">
            {/* Top Header Card */}
            <div className="bg-[linear-gradient(135deg,#0C2C47_0%,#4A9D95_100%)] rounded-3xl p-8 md:p-10 text-white shadow-xl relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="flex items-center gap-6 relative z-10">
                    <div className="relative">
                        <div className="w-24 h-24 rounded-[1.5rem] bg-white/10 border-2 border-white/20 flex items-center justify-center backdrop-blur-md shrink-0 shadow-inner overflow-hidden">
                            {profile?.avatar_url ? (
                                <img src={profile.avatar_url} alt="Profile Avatar" className="w-full h-full object-cover" />
                            ) : (
                                <span className="material-symbols-outlined text-white text-5xl opacity-80">account_circle</span>
                            )}
                        </div>
                        <label className="absolute -bottom-2 -right-2 bg-teal-custom hover:bg-white hover:text-teal-custom text-white w-8 h-8 rounded-full flex items-center justify-center cursor-pointer shadow-md transition-colors">
                            <span className="material-symbols-outlined text-[16px]">{avatarUploading ? 'sync' : 'add_a_photo'}</span>
                            <input type="file" accept="image/png, image/jpeg, image/jpg" className="hidden" onChange={handleAvatarUpload} disabled={avatarUploading} />
                        </label>
                    </div>
                    
                    <div className="space-y-3 z-10 text-center md:text-left">
                        <span className="inline-block px-3 py-1 bg-white/15 text-white font-label text-[10px] font-bold uppercase tracking-widest rounded-full">
                            Minha Conta
                        </span>
                        <h2 className="font-headline text-3xl font-extrabold tracking-tight">
                            {profile?.email}
                        </h2>
                        <p className="text-white/80 text-sm font-medium">
                            Função: <span className="font-bold text-white uppercase tracking-wider">{profile?.role}</span>
                            {profile?.school_name && ` • Vinculado a: ${profile.school_name}`}
                        </p>
                    </div>
                </div>
            </div>

            {errorMsg && (
                <div className="p-4 bg-rose-50 border-l-4 border-rose-500 text-rose-700 rounded-r-xl text-xs font-semibold">
                    {errorMsg}
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
                {/* Lado Esquerdo: Dados Gerais e Alterar Senha */}
                <div className="md:col-span-7 space-y-8">
                    {/* Alterar Senha Card */}
                    <div className="bg-white rounded-3xl border border-slate-100 p-8 shadow-sm space-y-6">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center text-amber-500 border border-amber-100 shrink-0">
                                <span className="material-symbols-outlined text-xl">lock</span>
                            </div>
                            <div>
                                <h3 className="font-headline font-bold text-lg text-primary-navy">Alterar Senha</h3>
                                <p className="text-slate-400 text-xs font-semibold">Mantenha sua conta corporativa segura</p>
                            </div>
                        </div>

                        <form onSubmit={handlePasswordChange} className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Senha Atual</label>
                                <input
                                    type="password"
                                    value={currentPassword}
                                    onChange={(e) => setCurrentPassword(e.target.value)}
                                    required
                                    className="w-full bg-slate-50/50 border border-slate-200 focus:border-teal-custom focus:ring-2 focus:ring-teal-custom/10 rounded-xl py-3 px-4 text-sm outline-none transition-all"
                                    placeholder="Digite sua senha atual"
                                />
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Nova Senha</label>
                                    <input
                                        type="password"
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        required
                                        className="w-full bg-slate-50/50 border border-slate-200 focus:border-teal-custom focus:ring-2 focus:ring-teal-custom/10 rounded-xl py-3 px-4 text-sm outline-none transition-all"
                                        placeholder="No mínimo 6 dígitos"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Confirmar Nova Senha</label>
                                    <input
                                        type="password"
                                        value={confirmNewPassword}
                                        onChange={(e) => setConfirmNewPassword(e.target.value)}
                                        required
                                        className="w-full bg-slate-50/50 border border-slate-200 focus:border-teal-custom focus:ring-2 focus:ring-teal-custom/10 rounded-xl py-3 px-4 text-sm outline-none transition-all"
                                        placeholder="Repita a nova senha"
                                    />
                                </div>
                            </div>

                            {pwdError && (
                                <p className="text-xs font-bold text-rose-500">{pwdError}</p>
                            )}
                            {pwdSuccess && (
                                <p className="text-xs font-bold text-emerald-500">{pwdSuccess}</p>
                            )}

                            <button
                                type="submit"
                                disabled={pwdLoading}
                                className="w-full py-3.5 bg-primary-navy hover:bg-teal-custom text-white font-headline font-bold text-sm rounded-xl shadow-md transition-all active:scale-[0.98] disabled:opacity-50"
                            >
                                {pwdLoading ? "Atualizando..." : "Salvar Nova Senha"}
                            </button>
                        </form>
                    </div>
                </div>

                {/* Lado Direito: Escolas (Professor) & LGPD */}
                <div className="md:col-span-5 space-y-8">
                    
                    {profile?.role === 'Professor' && (
                        <div className="bg-white rounded-3xl border border-slate-100 p-8 shadow-sm space-y-6">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-teal-50 flex items-center justify-center text-teal-custom border border-teal-100 shrink-0">
                                    <span className="material-symbols-outlined text-xl">school</span>
                                </div>
                                <div>
                                    <h3 className="font-headline font-bold text-lg text-primary-navy">Minhas Escolas</h3>
                                    <p className="text-slate-400 text-xs font-semibold">Instituições que você leciona</p>
                                </div>
                            </div>
                            
                            <ul className="space-y-2">
                                {teacherSchools.map(school => (
                                    <li key={school.id} className="flex items-center gap-3 p-3 bg-slate-50 border border-slate-100 rounded-xl">
                                        <span className="material-symbols-outlined text-slate-400">domain</span>
                                        <div className="flex-1">
                                            <p className="text-sm font-bold text-primary-navy">{school.name}</p>
                                            {profile.school_id === school.id && (
                                                <span className="text-[10px] font-bold uppercase tracking-wider text-teal-custom">Escola Ativa</span>
                                            )}
                                        </div>
                                    </li>
                                ))}
                            </ul>

                        </div>
                    )}
                    {profile?.role !== 'Diretor' && profile?.role !== 'SuperAdmin' && (
                        <div className="bg-white rounded-3xl border border-slate-100 p-8 shadow-sm space-y-6">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-teal-50 flex items-center justify-center text-teal-custom border border-teal-100 shrink-0">
                                    <span className="material-symbols-outlined text-xl">gavel</span>
                                </div>
                                <div>
                                    <h3 className="font-headline font-bold text-lg text-primary-navy">LGPD & Privacidade</h3>
                                    <p className="text-slate-400 text-xs font-semibold">Seus direitos de transparência e privacidade</p>
                                </div>
                            </div>

                            <div className="p-4 bg-teal-50/30 rounded-2xl border border-teal-custom/5 space-y-2">
                                <div className="flex items-center gap-2 text-teal-custom">
                                    <span className="material-symbols-outlined text-md">check_circle</span>
                                    <span className="text-xs font-bold uppercase tracking-wider">Consentimento Ativo</span>
                                </div>
                                <p className="text-slate-500 text-xs font-medium leading-relaxed">
                                    Você aceitou livremente os termos do TCLE e da nossa política de proteção a dados sensíveis de menores.
                                </p>
                                {profile?.tcle_accepted_at && (
                                    <span className="text-[10px] text-slate-400 font-bold block mt-1">
                                        Aceito em: {new Date(profile.tcle_accepted_at).toLocaleString()}
                                    </span>
                                )}
                            </div>

                            <div className="space-y-3 pt-2">
                                <button
                                    onClick={downloadPersonalData}
                                    className="w-full flex items-center justify-between gap-2 px-5 py-3.5 bg-slate-50 hover:bg-teal-custom/5 text-slate-700 hover:text-teal-custom border border-slate-200 hover:border-teal-custom/20 rounded-xl font-bold text-xs transition-all active:scale-[0.98]"
                                >
                                    <span className="flex items-center gap-2">
                                        <span className="material-symbols-outlined text-lg">download</span>
                                        Exportar Meus Dados (JSON)
                                    </span>
                                    <span className="material-symbols-outlined text-lg">chevron_right</span>
                                </button>

                                <button
                                    onClick={() => setIsConsentModalOpen(true)}
                                    className="w-full flex items-center justify-between gap-2 px-5 py-3.5 bg-rose-50 hover:bg-rose-100/40 text-rose-600 border border-rose-100 rounded-xl font-bold text-xs transition-all active:scale-[0.98]"
                                >
                                    <span className="flex items-center gap-2">
                                        <span className="material-symbols-outlined text-lg text-rose-500">no_accounts</span>
                                        Revogar Consentimento
                                    </span>
                                    <span className="material-symbols-outlined text-lg text-rose-500">chevron_right</span>
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Modal de Confirmação LGPD */}
            {isConsentModalOpen && (
                <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl max-w-md w-full border border-slate-100 shadow-2xl p-8 space-y-6 animate-[scaleUp_0.3s_ease-out]">
                        <div className="w-12 h-12 rounded-2xl bg-rose-50 flex items-center justify-center text-rose-500 border border-rose-100">
                            <span className="material-symbols-outlined text-2xl">warning</span>
                        </div>

                        <div className="space-y-2">
                            <h4 className="font-headline font-bold text-lg text-slate-800">Atenção! Revogação de Dados</h4>
                            <p className="text-slate-500 text-xs font-semibold leading-relaxed">
                                De acordo com as normas da LGPD, ao revogar o consentimento, sua conta corporativa será **desativada de imediato** e você será desconectado. Esta ação é definitiva e exige nova aprovação do Diretor para ser reativada.
                            </p>
                        </div>

                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => setIsConsentModalOpen(false)}
                                disabled={consentLoading}
                                className="flex-1 py-3 hover:bg-slate-50 text-slate-500 hover:text-slate-800 rounded-xl font-bold text-xs transition-colors"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleRevokeConsent}
                                disabled={consentLoading}
                                className="flex-1 py-3 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold text-xs transition-all active:scale-[0.98] shadow-md disabled:opacity-50"
                            >
                                {consentLoading ? "Revogando..." : "Confirmar Revogação"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Profile;
