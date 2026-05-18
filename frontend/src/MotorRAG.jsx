import React, { useState, useEffect, useRef } from 'react';

const MotorRAG = () => {
    const [documents, setDocuments] = useState([]);
    const [file, setFile] = useState(null);
    const [isDragging, setIsDragging] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [processingStep, setProcessingStep] = useState('');
    const [errorMsg, setErrorMsg] = useState('');
    const [successMsg, setSuccessMsg] = useState('');
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [docToDelete, setDocToDelete] = useState(null);
    const [loadingList, setLoadingList] = useState(false);
    
    const fileInputRef = useRef(null);

    // Carregar a lista de documentos do servidor
    const fetchDocuments = async () => {
        setLoadingList(true);
        try {
            const token = localStorage.getItem('token') || sessionStorage.getItem('token');
            const response = await fetch('/api/admin/knowledge-base', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                const data = await response.ok ? await response.json() : [];
                setDocuments(Array.isArray(data) ? data : []);
            } else {
                console.error('Falha ao carregar documentos:', response.status);
            }
        } catch (error) {
            console.error('Erro na requisição dos documentos:', error);
        } finally {
            setLoadingList(false);
        }
    };

    useEffect(() => {
        fetchDocuments();
    }, []);

    const handleDragOver = (e) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = () => {
        setIsDragging(false);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragging(false);
        const droppedFile = e.dataTransfer.files[0];
        validateAndSetFile(droppedFile);
    };

    const handleFileSelect = (e) => {
        const selectedFile = e.target.files[0];
        validateAndSetFile(selectedFile);
    };

    const validateAndSetFile = (selectedFile) => {
        if (!selectedFile) return;

        if (selectedFile.type !== 'application/pdf' && !selectedFile.name.toLowerCase().endsWith('.pdf')) {
            setErrorMsg('Formato não suportado. O Motor RAG aceita exclusivamente arquivos PDF.');
            setFile(null);
            return;
        }

        // Limite de 10MB
        if (selectedFile.size > 10 * 1024 * 1024) {
            setErrorMsg('O arquivo excede o limite máximo permitido de 10MB.');
            setFile(null);
            return;
        }

        setErrorMsg('');
        setSuccessMsg('');
        setFile(selectedFile);
    };

    const triggerFileSelect = () => {
        fileInputRef.current.click();
    };

    // Iniciar o upload e vetorização
    const handleUpload = async () => {
        if (!file) return;

        setIsProcessing(true);
        setErrorMsg('');
        setSuccessMsg('');
        
        // Simulação do progresso nos passos iniciais
        setUploadProgress(15);
        setProcessingStep('Lendo arquivo PDF...');
        
        const formData = new FormData();
        formData.append('file', file);

        try {
            const token = localStorage.getItem('token') || sessionStorage.getItem('token');
            
            setTimeout(() => {
                setUploadProgress(40);
                setProcessingStep('Extraindo conteúdo textual...');
            }, 800);

            setTimeout(() => {
                setUploadProgress(70);
                setProcessingStep('Vetorizando blocos com Google Gemini...');
            }, 2000);

            const response = await fetch('/api/admin/knowledge-base/upload', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formData
            });

            if (response.status === 413) {
                setErrorMsg('Arquivo rejeitado pelo servidor: Limite máximo de 10MB excedido.');
                setIsProcessing(false);
                return;
            }

            if (response.status === 415) {
                setErrorMsg('Tipo de arquivo não suportado. Apenas PDFs são permitidos.');
                setIsProcessing(false);
                return;
            }

            if (!response.ok) {
                const errData = await response.json();
                setErrorMsg(errData.detail || 'Falha ao processar e salvar o PDF no banco vetorial.');
                setIsProcessing(false);
                return;
            }

            const data = await response.json();
            setUploadProgress(100);
            setProcessingStep('Finalizado!');
            setSuccessMsg(`Documento "${data.nome}" indexado com sucesso! ${data.chunks_created} vetores adicionados à IA.`);
            setFile(null);
            
            // Recarregar lista
            fetchDocuments();
        } catch (error) {
            console.error('Erro no upload vetorial:', error);
            setErrorMsg('Erro de conexão. Não foi possível falar com o servidor RAG.');
        } finally {
            setTimeout(() => {
                setIsProcessing(false);
                setUploadProgress(0);
                setProcessingStep('');
            }, 600);
        }
    };

    // Deletar documento
    const handleDeleteClick = (doc) => {
        setDocToDelete(doc);
        setShowDeleteModal(true);
    };

    const confirmDelete = async () => {
        if (!docToDelete) return;

        try {
            const token = localStorage.getItem('token') || sessionStorage.getItem('token');
            const response = await fetch(`/api/admin/knowledge-base/${docToDelete.id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                setSuccessMsg(`O documento "${docToDelete.nome}" foi removido com sucesso.`);
                fetchDocuments();
            } else {
                const errData = await response.json();
                setErrorMsg(errData.detail || 'Erro ao tentar deletar o documento.');
            }
        } catch (error) {
            console.error('Erro ao deletar:', error);
            setErrorMsg('Não foi possível realizar a exclusão. Erro de rede.');
        } finally {
            setShowDeleteModal(false);
            setDocToDelete(null);
        }
    };

    const formatDate = (isoString) => {
        if (!isoString) return '-';
        const date = new Date(isoString);
        return date.toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    // Calcular estatísticas agregadas
    const totalChunks = documents.reduce((acc, doc) => acc + (doc.chunks_count || 0), 0);

    return (
        <div className="max-w-5xl mx-auto py-10 px-6 font-sans">
            {/* Header Glassmorphism */}
            <div className="mb-10 text-left">
                <span className="inline-block px-3 py-1 bg-teal-custom/10 text-teal-custom font-semibold text-xs rounded-full uppercase tracking-wider mb-3">
                    Painel do SuperAdmin
                </span>
                <h1 className="text-3xl font-extrabold text-primary-navy tracking-tight mb-2">
                    Base de Conhecimento RAG
                </h1>
                <p className="text-slate-500 text-sm max-w-2xl">
                    Gerencie a base de dados jurídica e pedagógica oficial consultada pela IA. Faça upload de novas cartilhas do MEC ou remova as obsoletas para atualizar o comportamento do chat imediatamente.
                </p>
            </div>

            {/* Painel de Estatísticas */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm flex items-center gap-4">
                    <span className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-teal-custom/10 text-teal-custom">
                        <span className="material-symbols-outlined text-2xl">auto_stories</span>
                    </span>
                    <div>
                        <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Documentos Ingeridos</p>
                        <p className="text-2xl font-extrabold text-slate-800">{documents.length}</p>
                    </div>
                </div>

                <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm flex items-center gap-4">
                    <span className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-indigo-50 text-indigo-500">
                        <span className="material-symbols-outlined text-2xl">grid_view</span>
                    </span>
                    <div>
                        <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Total de Chunks Vetoriais</p>
                        <p className="text-2xl font-extrabold text-slate-800">{totalChunks}</p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Lado Esquerdo: Área de Upload */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm">
                        <h3 className="font-bold text-slate-800 text-base mb-4 flex items-center gap-2">
                            <span className="material-symbols-outlined text-teal-custom text-xl">cloud_upload</span>
                            Indexar Novo PDF
                        </h3>
                        
                        <div
                            onDragOver={handleDragOver}
                            onDragLeave={handleDragLeave}
                            onDrop={handleDrop}
                            onClick={triggerFileSelect}
                            className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all duration-200 ${
                                isDragging 
                                    ? 'border-teal-custom bg-teal-custom/5 scale-[1.01]' 
                                    : file 
                                        ? 'border-emerald-400 bg-emerald-50/5' 
                                        : 'border-slate-200 hover:border-teal-custom/40 hover:bg-slate-50/30'
                            }`}
                        >
                            <input
                                type="file"
                                ref={fileInputRef}
                                onChange={handleFileSelect}
                                accept=".pdf"
                                className="hidden"
                            />

                            <span className={`material-symbols-outlined text-3xl mb-3 transition-colors ${
                                file ? 'text-emerald-500' : 'text-slate-400'
                            }`}>
                                {file ? 'picture_as_pdf' : 'library_books'}
                            </span>

                            {file ? (
                                <div>
                                    <p className="font-bold text-slate-800 text-xs truncate max-w-[200px] mx-auto mb-1">{file.name}</p>
                                    <p className="text-slate-400 text-[10px]">{(file.size / (1024 * 1024)).toFixed(2)} MB</p>
                                </div>
                            ) : (
                                <div>
                                    <p className="font-semibold text-slate-700 text-xs mb-1">
                                        Arraste o PDF ou <span className="text-teal-custom underline">busque</span>
                                    </p>
                                    <p className="text-slate-400 text-[9px]">Apenas arquivos PDF (Máx. 10MB)</p>
                                </div>
                            )}
                        </div>

                        {/* Status de Processamento */}
                        {isProcessing && (
                            <div className="mt-6 space-y-3">
                                <div className="flex justify-between items-center text-[10px]">
                                    <span className="font-semibold text-slate-600 animate-pulse">{processingStep}</span>
                                    <span className="font-bold text-teal-custom">{uploadProgress}%</span>
                                </div>
                                <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                                    <div 
                                        className="h-full bg-[linear-gradient(90deg,#0C2C47_0%,#4A9D95_100%)] transition-all duration-300"
                                        style={{ width: `${uploadProgress}%` }}
                                    />
                                </div>
                            </div>
                        )}

                        {/* Mensagem de Erro */}
                        {errorMsg && (
                            <div className="mt-4 p-3 bg-rose-50 border border-rose-100 rounded-xl text-rose-600 text-[10px] font-semibold flex items-start gap-2">
                                <span className="material-symbols-outlined text-rose-500 text-base shrink-0">error</span>
                                <span>{errorMsg}</span>
                            </div>
                        )}

                        {/* Mensagem de Sucesso */}
                        {successMsg && (
                            <div className="mt-4 p-3 bg-emerald-50 border border-emerald-100 rounded-xl text-emerald-600 text-[10px] font-semibold flex items-start gap-2">
                                <span className="material-symbols-outlined text-emerald-500 text-base shrink-0">check_circle</span>
                                <span>{successMsg}</span>
                            </div>
                        )}

                        {/* Ação de Upload */}
                        {file && !isProcessing && (
                            <div className="mt-6 pt-4 border-t border-slate-50 flex gap-2">
                                <button
                                    onClick={() => setFile(null)}
                                    className="flex-1 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-[10px] rounded-lg transition-colors"
                                >
                                    Limpar
                                </button>
                                <button
                                    onClick={handleUpload}
                                    className="flex-1 px-4 py-2.5 bg-[linear-gradient(135deg,#0C2C47_0%,#4A9D95_100%)] text-white font-bold text-[10px] rounded-lg transition-all active:scale-[0.98] shadow-sm hover:shadow-md"
                                >
                                    Vetorizar PDF
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Lado Direito: Inventário de Documentos */}
                <div className="lg:col-span-2">
                    <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm">
                        <h3 className="font-bold text-slate-800 text-base mb-6 flex items-center gap-2">
                            <span className="material-symbols-outlined text-teal-custom text-xl">inventory_2</span>
                            Documentos Ativos na IA
                        </h3>

                        {loadingList ? (
                            <div className="py-12 text-center">
                                <svg className="animate-spin h-6 w-6 text-teal-custom mx-auto mb-3" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                </svg>
                                <p className="text-slate-400 text-xs">Carregando documentos...</p>
                            </div>
                        ) : documents.length === 0 ? (
                            <div className="py-12 text-center border border-dashed border-slate-100 rounded-xl">
                                <span className="material-symbols-outlined text-3xl text-slate-300 mb-2">find_in_page</span>
                                <p className="text-slate-500 font-bold text-xs mb-1">Nenhum documento dinâmico indexado</p>
                                <p className="text-slate-400 text-[10px] max-w-xs mx-auto">
                                    A base está usando apenas os arquivos padrão de seed do sistema. Adicione novos PDFs oficiais ao lado!
                                </p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="border-b border-slate-100">
                                            <th className="pb-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Nome</th>
                                            <th className="pb-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Enviado em</th>
                                            <th className="pb-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider text-center">Vetores (Chunks)</th>
                                            <th className="pb-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider text-right">Ação</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-50">
                                        {documents.map((doc) => (
                                            <tr key={doc.id} className="hover:bg-slate-50/50 transition-colors">
                                                <td className="py-4 pr-3">
                                                    <div className="flex items-center gap-2.5">
                                                        <span className="material-symbols-outlined text-rose-400 text-xl shrink-0">picture_as_pdf</span>
                                                        <span className="font-bold text-slate-700 text-xs truncate max-w-[200px]" title={doc.nome}>
                                                            {doc.nome}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="py-4 text-slate-500 text-[10px]">
                                                    {formatDate(doc.data_upload)}
                                                </td>
                                                <td className="py-4 text-center">
                                                    <span className="inline-block px-2.5 py-0.5 bg-indigo-50 text-indigo-600 font-bold font-mono text-[10px] rounded-full">
                                                        {doc.chunks_count || 0}
                                                    </span>
                                                </td>
                                                <td className="py-4 text-right">
                                                    <button
                                                        onClick={() => handleDeleteClick(doc)}
                                                        className="text-rose-500 hover:bg-rose-50 p-1.5 rounded-lg transition-colors inline-flex items-center"
                                                        title="Excluir documento permanentemente"
                                                    >
                                                        <span className="material-symbols-outlined text-lg">delete</span>
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Modal de Confirmação de Exclusão */}
            {showDeleteModal && (
                <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-xl border border-slate-100 text-center animate-scaleUp">
                        <span className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-rose-50 text-rose-500 mb-4">
                            <span className="material-symbols-outlined text-2xl">warning</span>
                        </span>
                        
                        <h4 className="font-bold text-slate-800 text-sm mb-2">Excluir documento da IA?</h4>
                        <p className="text-slate-500 text-[10px] leading-relaxed mb-6">
                            Você está prestes a excluir o documento <strong>"{docToDelete?.nome}"</strong>. Todos os seus chunks vetoriais correspondentes no Postgres serão excluídos em cascata e a IA esquecerá imediatamente essas diretrizes. Esta ação é irreversível.
                        </p>

                        <div className="flex gap-3">
                            <button
                                onClick={() => { setShowDeleteModal(false); setDocToDelete(null); }}
                                className="flex-1 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-[10px] rounded-xl transition-colors"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={confirmDelete}
                                className="flex-1 px-4 py-2.5 bg-rose-500 hover:bg-rose-600 text-white font-bold text-[10px] rounded-xl transition-colors shadow-sm"
                            >
                                Excluir Permanentemente
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MotorRAG;
