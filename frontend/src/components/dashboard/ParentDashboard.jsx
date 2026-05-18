import React, { useState, useEffect } from 'react';
import useStudentStore from '../../store/useStudentStore';
import AIChat from './AIChat';
import WechslerModal from './WechslerModal';

const ParentDashboard = ({ data, refreshSummary }) => {
    const children = data?.recent_students || [];
    const selectStudent = useStudentStore(state => state.selectStudent);
    const selectedStudent = useStudentStore(state => state.selectedStudent);
    const [triageModalChild, setTriageModalChild] = useState(null);
    const [documents, setDocuments] = useState([]);
    const [docsLoading, setDocsLoading] = useState(false);
    const [uploadingDoc, setUploadingDoc] = useState(false);

    // Fetch documents whenever the selected student changes
    useEffect(() => {
        if (selectedStudent?.id) {
            fetchStudentDocuments(selectedStudent.id);
        }
    }, [selectedStudent]);

    const fetchStudentDocuments = async (studentId) => {
        setDocsLoading(true);
        try {
            const token = localStorage.getItem('superdott_token');
            const res = await fetch(`/api/rag_documents/${studentId}/documents`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setDocuments(data);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setDocsLoading(false);
        }
    };

    const handleDocumentUpload = async (e) => {
        const file = e.target.files[0];
        if (!file || !selectedStudent) return;
        setUploadingDoc(true);
        try {
            const token = localStorage.getItem('superdott_token');
            const formData = new FormData();
            formData.append('file', file);

            const res = await fetch(`/api/rag_documents/${selectedStudent.id}/documents`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` },
                body: formData
            });

            if (res.ok) {
                alert('Documento enviado com sucesso!');
                fetchStudentDocuments(selectedStudent.id);
            } else {
                const errData = await res.json();
                alert(errData.detail || 'Erro ao enviar o documento. Formatos aceitos: PDF, DOCX, TXT.');
            }
        } catch (err) {
            console.error(err);
        } finally {
            setUploadingDoc(false);
        }
    };

    const handleToggleShare = async (docId, currentShared) => {
        try {
            const token = localStorage.getItem('superdott_token');
            const res = await fetch(`/api/rag_documents/documents/${docId}/share?shared=${!currentShared}`, {
                method: 'PUT',
                headers: { 
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (res.ok) {
                setDocuments(prev => prev.map(doc => doc.id === docId ? { ...doc, shared_with_school: !currentShared } : doc));
            } else {
                alert('Erro ao atualizar permissão de compartilhamento.');
            }
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div className="grid grid-cols-12 gap-6 items-start animate-[fadeIn_0.5s_ease-out]">
            {/* Esquerda: Perfil dos Filhos & Dicas */}
            <div className="col-span-12 lg:col-span-7 space-y-6">
                
                {/* Boas vindas Acolhedora */}
                <div className="bg-[linear-gradient(135deg,#4A9D95_0%,#0C2C47_100%)] p-8 rounded-3xl text-white shadow-xl">
                    <span className="inline-block px-3 py-1 bg-white/10 text-white font-label text-[10px] font-bold uppercase tracking-widest rounded-full mb-3">
                        Espaço da Família
                    </span>
                    <h2 className="font-headline text-3xl font-extrabold tracking-tight">
                        Seu Canal de Acolhimento
                    </h2>
                    <p className="text-white/90 mt-1 max-w-xl text-sm leading-relaxed font-medium">
                        Acompanhe de perto a evolução do seu filho, tire dúvidas pedagógicas e receba orientações personalizadas de suporte familiar.
                    </p>
                </div>

                {/* Lista de Filhos */}
                <div className="space-y-4">
                    <h3 className="font-headline font-bold text-lg text-primary-navy flex items-center gap-2">
                        <span className="material-symbols-outlined text-teal-custom">child_care</span>
                        Perfil do(s) Filho(s)
                    </h3>

                    {children.map(child => {
                        const isSelected = selectedStudent?.id === child.id;
                        return (
                            <div 
                                key={child.id}
                                className={`p-6 rounded-2xl border transition-all ${
                                    isSelected 
                                        ? 'bg-white border-teal-custom/50 shadow-md ring-2 ring-teal-custom/15' 
                                        : 'bg-white border-slate-100 shadow-sm hover:border-slate-300'
                                }`}
                            >
                                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-full bg-teal-custom/10 text-teal-custom flex items-center justify-center font-bold font-headline text-lg shrink-0">
                                            {child.full_name.charAt(0)}
                                        </div>
                                        <div>
                                            <h4 className="font-headline font-bold text-base text-primary-navy">{child.full_name}</h4>
                                            <p className="text-xs text-slate-500 font-semibold">{child.email}</p>
                                        </div>
                                    </div>

                                    <div className="flex flex-wrap items-center gap-3">
                                        {/* Status da Triagem */}
                                        {child.triage_completed || child.triage?.completed ? (
                                            <div className="flex items-center gap-2 bg-emerald-50 text-emerald-700 px-3.5 py-1.5 rounded-full text-xs font-bold border border-emerald-100">
                                                <span className="material-symbols-outlined text-sm">verified</span>
                                                Triagem Concluída
                                            </div>
                                        ) : (
                                            <div className="flex items-center gap-2 bg-amber-50 text-amber-700 px-3.5 py-1.5 rounded-full text-xs font-bold border border-amber-100 animate-pulse">
                                                <span className="material-symbols-outlined text-sm">warning</span>
                                                Triagem Pendente
                                            </div>
                                        )}

                                        {/* Seleção de Filho para Chat */}
                                        <button
                                            onClick={() => selectStudent(child)}
                                            className={`px-4 py-2 rounded-full text-xs font-bold shadow-sm transition-all active:scale-95 ${
                                                isSelected 
                                                    ? 'bg-primary-navy text-white hover:bg-primary-navy/90'
                                                    : 'bg-slate-50 text-slate-700 hover:bg-slate-100'
                                            }`}
                                        >
                                            {isSelected ? 'Selecionado' : 'Selecionar'}
                                        </button>
                                    </div>
                                </div>

                                {/* Area do Mapeamento Wechsler */}
                                <div className="mt-6 pt-6 border-t border-slate-100">
                                    {child.triage_completed || child.triage?.completed ? (
                                        <div className="space-y-4 bg-slate-50 p-5 rounded-xl border border-slate-100">
                                            <h5 className="font-headline font-bold text-sm text-primary-navy mb-3 flex items-center gap-2">
                                                <span className="material-symbols-outlined text-teal-custom text-base">radar</span>
                                                Potencial Cognitivo Wechsler
                                            </h5>
                                            <div>
                                                <div className="flex justify-between text-[11px] font-bold mb-1.5">
                                                    <span className="text-primary-navy uppercase tracking-wider">Intelectual</span>
                                                    <span className="text-teal-custom">{child.score_intelectual || 0}%</span>
                                                </div>
                                                <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden">
                                                    <div className="h-full bg-[linear-gradient(90deg,#0C2C47_0%,#4A9D95_100%)] rounded-full transition-all duration-1000" style={{ width: `${child.score_intelectual || 0}%` }}></div>
                                                </div>
                                            </div>
                                            <div>
                                                <div className="flex justify-between text-[11px] font-bold mb-1.5">
                                                    <span className="text-primary-navy uppercase tracking-wider">Criativo</span>
                                                    <span className="text-teal-custom">{child.score_criativo || 0}%</span>
                                                </div>
                                                <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden">
                                                    <div className="h-full bg-[linear-gradient(90deg,#0C2C47_0%,#4A9D95_100%)] rounded-full transition-all duration-1000" style={{ width: `${child.score_criativo || 0}%` }}></div>
                                                </div>
                                            </div>
                                            <div>
                                                <div className="flex justify-between text-[11px] font-bold mb-1.5">
                                                    <span className="text-primary-navy uppercase tracking-wider">Liderança</span>
                                                    <span className="text-teal-custom">{child.score_lideranca || 0}%</span>
                                                </div>
                                                <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden">
                                                    <div className="h-full bg-[linear-gradient(90deg,#0C2C47_0%,#4A9D95_100%)] rounded-full transition-all duration-1000" style={{ width: `${child.score_lideranca || 0}%` }}></div>
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="bg-amber-50/50 p-6 rounded-xl border border-amber-100 flex flex-col sm:flex-row items-center justify-between gap-4">
                                            <div>
                                                <h5 className="font-headline font-bold text-sm text-amber-800 mb-1">Mapeamento Incompleto</h5>
                                                <p className="text-xs text-amber-700/80 font-semibold max-w-sm">
                                                    Para habilitar a IA e orientações direcionadas, precisamos mapear o perfil do seu filho. Leva apenas 3 minutos.
                                                </p>
                                            </div>
                                            <button
                                                onClick={() => setTriageModalChild(child)}
                                                className="w-full sm:w-auto px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-white font-headline font-bold text-xs rounded-xl shadow-md transition-all active:scale-95 flex items-center justify-center gap-2 whitespace-nowrap"
                                            >
                                                <span className="material-symbols-outlined text-sm">assignment</span>
                                                Preencher Mapeamento
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}

                    {children.length === 0 && (
                        <div className="bg-slate-50 p-8 rounded-2xl border border-slate-100 text-center">
                            <span className="material-symbols-outlined text-slate-400 text-4xl mb-2">person_search</span>
                            <p className="text-sm text-slate-500 font-medium italic">Nenhum filho associado a esta conta.</p>
                        </div>
                    )}
                </div>

                {/* Documentos & RAG */}
                {selectedStudent && (
                    <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-6">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-teal-custom/5 text-teal-custom rounded-xl flex items-center justify-center shrink-0">
                                    <span className="material-symbols-outlined text-xl">folder_shared</span>
                                </div>
                                <div>
                                    <h3 className="font-headline font-bold text-lg text-primary-navy">Documentos & Motor de RAG</h3>
                                    <p className="text-xs text-slate-500">Alimente o assistente com laudos, atividades ou portfólios de <b>{selectedStudent.full_name}</b></p>
                                </div>
                            </div>
                            
                            <label className="bg-primary-navy hover:bg-teal-custom text-white px-4 py-2.5 rounded-xl text-xs font-bold shadow-md cursor-pointer transition-colors flex items-center gap-2 whitespace-nowrap self-stretch sm:self-auto justify-center">
                                <span className="material-symbols-outlined text-[16px]">{uploadingDoc ? 'sync' : 'upload'}</span>
                                {uploadingDoc ? 'Enviando...' : 'Enviar Laudo/Atividade'}
                                <input type="file" accept=".pdf,.docx,.txt" className="hidden" onChange={handleDocumentUpload} disabled={uploadingDoc} />
                            </label>
                        </div>

                        {docsLoading ? (
                            <div className="py-8 flex justify-center items-center gap-2 text-slate-400 font-semibold text-xs animate-pulse">
                                <span className="w-4 h-4 border-2 border-slate-400 border-t-transparent rounded-full animate-spin"></span>
                                Carregando documentos do aluno...
                            </div>
                        ) : documents.length === 0 ? (
                            <div className="p-6 bg-slate-50 rounded-xl border border-slate-100 text-center text-xs font-medium text-slate-400">
                                Nenhum laudo ou portfólio enviado para este aluno ainda. Envie arquivos para personalizar e turbinar a IA pedagógica!
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {documents.map(doc => (
                                    <div key={doc.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-slate-50 border border-slate-100 rounded-xl gap-4 hover:border-slate-200 transition-colors">
                                        <div className="flex items-center gap-3 overflow-hidden">
                                            <span className="material-symbols-outlined text-red-500 text-2xl shrink-0">description</span>
                                            <div className="overflow-hidden">
                                                <p className="text-xs font-bold text-primary-navy truncate">{doc.filename}</p>
                                                <span className="text-[10px] text-slate-400 font-bold">
                                                    Enviado em: {new Date(doc.uploaded_at).toLocaleDateString()}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-between sm:justify-end gap-3 border-t sm:border-t-0 pt-2 sm:pt-0">
                                            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                                                Compartilhar com Professor
                                            </span>
                                            <button
                                                onClick={() => handleToggleShare(doc.id, doc.shared_with_school)}
                                                className={`w-12 h-6 rounded-full p-0.5 transition-all duration-300 relative focus:outline-none ${
                                                    doc.shared_with_school ? 'bg-teal-custom' : 'bg-slate-300'
                                                }`}
                                            >
                                                <span className={`w-5 h-5 rounded-full bg-white shadow-sm block transition-transform duration-300 transform ${
                                                    doc.shared_with_school ? 'translate-x-6' : 'translate-x-0'
                                                }`}></span>
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* Dicas e Orientações Rápidas */}
                <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
                    <h3 className="font-headline font-bold text-lg text-primary-navy flex items-center gap-2">
                        <span className="material-symbols-outlined text-amber-500 font-bold">lightbulb</span>
                        Dicas de Apoio Familiar
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-amber-50/40 p-4 rounded-xl border border-amber-100/50">
                            <h4 className="text-xs font-bold text-amber-800 uppercase tracking-wider mb-1">Comunicação Empática</h4>
                            <p className="text-xs text-slate-600 leading-relaxed font-semibold">
                                Crianças superdotadas podem manifestar grande sensibilidade. Converse de forma direta e acolhedora, validando seus sentimentos.
                            </p>
                        </div>
                        <div className="bg-teal-50/40 p-4 rounded-xl border border-teal-100/50">
                            <h4 className="text-xs font-bold text-teal-800 uppercase tracking-wider mb-1">Estímulos Adequados</h4>
                            <p className="text-xs text-slate-600 leading-relaxed font-semibold">
                                Incentive a exploração de temas de grande interesse (hiperfoco) sem impor sobrecarga de tarefas formais em casa.
                            </p>
                        </div>
                    </div>
                </div>

            </div>

            {/* Direita: Chat de Suporte Familiar */}
            <div className="col-span-12 lg:col-span-5 h-[calc(100vh-200px)] min-h-[550px]">
                <AIChat />
            </div>

            {triageModalChild && (
                <WechslerModal 
                    student={triageModalChild} 
                    onClose={() => {
                        setTriageModalChild(null);
                        if (refreshSummary) refreshSummary();
                    }} 
                />
            )}
        </div>
    );
};

export default ParentDashboard;
