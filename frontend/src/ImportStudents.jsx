import React, { useState, useRef } from 'react';

const ImportStudents = () => {
    const [file, setFile] = useState(null);
    const [isDragging, setIsDragging] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [result, setResult] = useState(null);
    const [errorMsg, setErrorMsg] = useState('');
    const fileInputRef = useRef(null);

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
        
        if (!selectedFile.name.toLowerCase().endsWith('.csv')) {
            setErrorMsg('Formato não suportado. Por favor, envie apenas arquivos com extensão .csv');
            setFile(null);
            setResult(null);
            return;
        }

        setErrorMsg('');
        setFile(selectedFile);
        setResult(null);
    };

    const triggerFileSelect = () => {
        fileInputRef.current.click();
    };

    // Download do CSV Modelo
    const downloadCSVTemplate = () => {
        const csvContent = 
            "nome_completo_aluno,turma,email_responsavel,nome_responsavel\n" +
            "Gabriel Silva,3º Ano A,gabriel.pai@email.com,Rodrigo Silva\n" +
            "Mariana Santos,5º Ano B,mariana.mae@email.com,Eliane Santos\n" +
            "Pedro Albuquerque,2º Ano C,pedro.responsavel@email.com,Claudia Albuquerque";

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", "modelo_importacao_superdott.csv");
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    // Upload do CSV para API
    const handleUpload = async () => {
        if (!file) return;

        setIsProcessing(true);
        setErrorMsg('');
        setResult(null);
        setUploadProgress(20);

        const formData = new FormData();
        formData.append('file', file);

        try {
            setUploadProgress(50);
            const token = localStorage.getItem('token') || sessionStorage.getItem('token');
            const response = await fetch('/api/students/import-csv', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formData
            });

            setUploadProgress(90);

            if (response.status === 415) {
                setErrorMsg('O servidor rejeitou o arquivo: Tipo de mídia não suportado (HTTP 415). Apenas .csv é permitido.');
                setIsProcessing(false);
                return;
            }

            if (!response.ok) {
                const errData = await response.json();
                setErrorMsg(errData.detail || 'Ocorreu um erro ao processar a importação no servidor.');
                setIsProcessing(false);
                return;
            }

            const data = await response.json();
            setResult(data);
            setUploadProgress(100);
        } catch (error) {
            console.error('Erro no upload:', error);
            setErrorMsg('Falha na comunicação com o servidor. Verifique sua conexão.');
        } finally {
            setIsProcessing(false);
        }
    };

    const resetForm = () => {
        setFile(null);
        setResult(null);
        setErrorMsg('');
        setUploadProgress(0);
    };

    return (
        <div className="max-w-5xl mx-auto py-10 px-6 font-sans">
            {/* Header com Gradiente Premium */}
            <div className="mb-10 text-left">
                <span className="inline-block px-3 py-1 bg-teal-custom/10 text-teal-custom font-semibold text-xs rounded-full uppercase tracking-wider mb-3">
                    Operação B2B & Escala
                </span>
                <h1 className="text-3xl font-extrabold text-primary-navy tracking-tight mb-2">
                    Importação de Alunos em Lote
                </h1>
                <p className="text-slate-500 text-sm max-w-2xl">
                    Cadastre turmas inteiras instantaneamente via CSV. O Superdott criará os perfis dos estudantes, gerará códigos de vínculo exclusivos e enviará convites automatizados aos pais.
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Lado Esquerdo: Instruções e Modelo */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm">
                        <h3 className="font-bold text-slate-800 text-base mb-4 flex items-center gap-2">
                            <span className="material-symbols-outlined text-teal-custom text-xl">info</span>
                            Como funciona?
                        </h3>
                        <ul className="space-y-4 text-xs text-slate-500">
                            <li className="flex gap-3">
                                <span className="flex items-center justify-center w-5 h-5 rounded-full bg-slate-100 text-slate-700 font-bold shrink-0">1</span>
                                <span>Baixe o <strong>CSV Modelo</strong> fornecido para garantir o formato correto das colunas.</span>
                            </li>
                            <li className="flex gap-3">
                                <span className="flex items-center justify-center w-5 h-5 rounded-full bg-slate-100 text-slate-700 font-bold shrink-0">2</span>
                                <span>Insira os nomes, turmas e e-mails dos responsáveis sem alterar os cabeçalhos.</span>
                            </li>
                            <li className="flex gap-3">
                                <span className="flex items-center justify-center w-5 h-5 rounded-full bg-slate-100 text-slate-700 font-bold shrink-0">3</span>
                                <span>Faça o upload do arquivo para disparar os convites automáticos via Resend.</span>
                            </li>
                        </ul>

                        <div className="mt-8 pt-6 border-t border-slate-50">
                            <button
                                onClick={downloadCSVTemplate}
                                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-slate-50 hover:bg-teal-custom/5 text-slate-700 hover:text-teal-custom border border-slate-200 hover:border-teal-custom/30 rounded-xl font-bold text-xs transition-all active:scale-[0.98]"
                            >
                                <span className="material-symbols-outlined text-lg">download</span>
                                Baixar CSV Modelo
                            </button>
                        </div>
                    </div>
                </div>

                {/* Lado Direito: Area de Upload & Resultados */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Drag and Drop Zone */}
                    {!result && (
                        <div className="bg-white border border-slate-100 rounded-2xl p-8 shadow-sm">
                            <div
                                onDragOver={handleDragOver}
                                onDragLeave={handleDragLeave}
                                onDrop={handleDrop}
                                onClick={triggerFileSelect}
                                className={`border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-all duration-200 ${
                                    isDragging 
                                        ? 'border-teal-custom bg-teal-custom/5 scale-[1.01]' 
                                        : file 
                                            ? 'border-emerald-400 bg-emerald-50/5' 
                                            : 'border-slate-200 hover:border-teal-custom/50 hover:bg-slate-50/50'
                                }`}
                            >
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    onChange={handleFileSelect}
                                    accept=".csv"
                                    className="hidden"
                                />

                                <span className={`material-symbols-outlined text-4xl mb-4 transition-colors ${
                                    file ? 'text-emerald-500' : 'text-slate-400'
                                }`}>
                                    {file ? 'description' : 'upload_file'}
                                </span>

                                {file ? (
                                    <div>
                                        <p className="font-bold text-slate-800 text-sm mb-1">{file.name}</p>
                                        <p className="text-slate-400 text-xs">{(file.size / 1024).toFixed(2)} KB</p>
                                    </div>
                                ) : (
                                    <div>
                                        <p className="font-bold text-slate-700 text-sm mb-1">
                                            Arraste seu arquivo CSV ou <span className="text-teal-custom underline">clique para buscar</span>
                                        </p>
                                        <p className="text-slate-400 text-xs">Apenas arquivos .csv são suportados</p>
                                    </div>
                                )}
                            </div>

                            {/* Alerta de erro */}
                            {errorMsg && (
                                <div className="mt-4 p-4 bg-rose-50 border border-rose-100 rounded-xl text-rose-600 text-xs font-semibold flex items-start gap-2.5">
                                    <span className="material-symbols-outlined text-rose-500 text-lg shrink-0">error</span>
                                    <span>{errorMsg}</span>
                                </div>
                            )}

                            {/* Ações de Envio / Processamento */}
                            {file && (
                                <div className="mt-6 flex items-center justify-between gap-4 pt-6 border-t border-slate-50">
                                    <button
                                        onClick={resetForm}
                                        disabled={isProcessing}
                                        className="px-5 py-3 hover:bg-slate-50 text-slate-500 hover:text-slate-800 rounded-xl font-bold text-xs transition-colors disabled:opacity-50"
                                    >
                                        Limpar
                                    </button>
                                    
                                    <button
                                        onClick={handleUpload}
                                        disabled={isProcessing}
                                        className="flex items-center gap-2 px-6 py-3 bg-[linear-gradient(135deg,#0C2C47_0%,#4A9D95_100%)] hover:opacity-95 text-white shadow-md hover:shadow-lg rounded-xl font-bold text-xs transition-all active:scale-95 disabled:opacity-50"
                                    >
                                        {isProcessing ? (
                                            <>
                                                <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                                </svg>
                                                <span>Processando Alunos...</span>
                                            </>
                                        ) : (
                                            <>
                                                <span className="material-symbols-outlined text-lg">cloud_upload</span>
                                                <span>Iniciar Importação</span>
                                            </>
                                        )}
                                    </button>
                                </div>
                            )}

                            {/* Barra de Progresso */}
                            {isProcessing && (
                                <div className="mt-4">
                                    <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                                        <div 
                                            className="h-full bg-teal-custom transition-all duration-300"
                                            style={{ width: `${uploadProgress}%` }}
                                        />
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Exibição dos Resultados (Sucesso / Erros de validação) */}
                    {result && (
                        <div className="space-y-6">
                            {result.success ? (
                                <div className="bg-white border border-slate-100 rounded-2xl p-8 shadow-sm text-center">
                                    <span className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-50 text-emerald-500 mb-6 shadow-sm">
                                        <span className="material-symbols-outlined text-3xl font-bold">check</span>
                                    </span>
                                    
                                    <h2 className="text-xl font-bold text-slate-800 mb-2">
                                        Importação Concluída com Sucesso!
                                    </h2>
                                    <p className="text-slate-500 text-xs max-w-md mx-auto mb-8">
                                        Todos os registros foram adicionados com sucesso no banco de dados. Os convites de e-mail contendo os códigos de vínculo já estão sendo processados.
                                    </p>

                                    <div className="inline-grid grid-cols-2 gap-8 px-8 py-4 bg-slate-50/50 rounded-2xl border border-slate-100 mb-8">
                                        <div className="text-left border-r border-slate-200/80 pr-8">
                                            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Alunos Importados</span>
                                            <p className="text-2xl font-extrabold text-slate-800">{result.imported_count}</p>
                                        </div>
                                        <div className="text-left pl-4">
                                            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Convites Enviados</span>
                                            <p className="text-2xl font-extrabold text-teal-custom">{result.imported_count}</p>
                                        </div>
                                    </div>

                                    <div>
                                        <button
                                            onClick={resetForm}
                                            className="px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-all active:scale-[0.98]"
                                        >
                                            Importar Novo Arquivo
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm">
                                    <div className="flex items-center gap-3 mb-6 p-4 bg-rose-50 border border-rose-100 rounded-2xl">
                                        <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-rose-500 text-white shrink-0">
                                            <span className="material-symbols-outlined text-xl">warning</span>
                                        </span>
                                        <div>
                                            <h3 className="font-bold text-slate-800 text-sm">
                                                A importação falhou de forma atômica
                                            </h3>
                                            <p className="text-slate-500 text-[10px]">
                                                Nenhum dado foi persistido no banco de dados para evitar inconsistências. Corrija os erros listados abaixo e envie novamente.
                                            </p>
                                        </div>
                                    </div>

                                    <h4 className="font-bold text-slate-700 text-xs mb-3 px-1">
                                        Erros Detectados ({result.errors.length}):
                                    </h4>

                                    <div className="max-h-80 overflow-y-auto border border-slate-100 rounded-xl divide-y divide-slate-50">
                                        {result.errors.map((err, idx) => (
                                            <div key={idx} className="p-3.5 flex items-start gap-3 hover:bg-slate-50/50 transition-colors">
                                                <span className="inline-block px-2 py-0.5 bg-rose-50 text-rose-500 font-mono text-[10px] font-bold rounded border border-rose-100">
                                                    Erro
                                                </span>
                                                <span className="text-slate-600 text-xs">{err}</span>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="mt-6 pt-6 border-t border-slate-100 flex justify-end">
                                        <button
                                            onClick={resetForm}
                                            className="px-6 py-3 bg-[linear-gradient(135deg,#0C2C47_0%,#4A9D95_100%)] text-white font-bold text-xs rounded-xl transition-all active:scale-95 shadow-md"
                                        >
                                            Corrigir e Tentar Novamente
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ImportStudents;
