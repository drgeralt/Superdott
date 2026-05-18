import { useState } from 'react';
import PropTypes from 'prop-types';

const ExportPDIModal = ({ student, onClose }) => {
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [includeCurriculum, setIncludeCurriculum] = useState(true);
    const [includeMethodologies, setIncludeMethodologies] = useState(true);
    const [omitInformal, setOmitInformal] = useState(true);
    const [isGenerating, setIsGenerating] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

    const handleExport = async (e) => {
        e.preventDefault();
        setIsGenerating(true);
        setErrorMessage('');

        try {
            const token = localStorage.getItem('superdott_token');
            const headers = {};
            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            }

            const params = new URLSearchParams({
                include_curriculum: includeCurriculum,
                include_methodologies: includeMethodologies,
                omit_informal: omitInformal
            });

            if (startDate) params.append('start_date', startDate);
            if (endDate) params.append('end_date', endDate);

            const res = await fetch(`/api/students/${student.id}/export-pdi?${params.toString()}`, {
                method: 'GET',
                headers: headers
            });

            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.detail || 'Não foi possível gerar o PDI.');
            }

            // Converter para blob para download do PDF
            const blob = await res.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            
            // Tenta ler o nome do arquivo do header ou usa um padrão elegante
            const disposition = res.headers.get('content-disposition');
            let filename = `pdi_${student.full_name.toLowerCase().replace(/\s+/g, '_')}.pdf`;
            if (disposition && disposition.includes('filename=')) {
                filename = disposition.split('filename=')[1].replace(/["']/g, '');
            }

            a.download = filename;
            document.body.appendChild(a);
            a.click();
            a.remove();
            window.URL.revokeObjectURL(url);
            
            onClose(); // Fechar modal após download bem sucedido
        } catch (err) {
            setErrorMessage(err.message || 'Erro de conexão com o servidor.');
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-primary-navy/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl overflow-hidden border border-slate-100 animate-in fade-in zoom-in-95 duration-200">
                
                {/* Header */}
                <div className="px-6 py-5 bg-gradient-to-r from-primary-navy to-teal-custom text-white flex justify-between items-center">
                    <div>
                        <h3 className="text-base font-bold font-headline">Exportar Relatório PDI</h3>
                        <p className="text-[11px] text-white/80 font-medium mt-0.5">Aluno: {student.full_name}</p>
                    </div>
                    <button 
                        onClick={onClose} 
                        disabled={isGenerating}
                        className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 active:scale-95 transition-all text-white outline-none"
                    >
                        <span className="material-symbols-outlined text-lg">close</span>
                    </button>
                </div>

                {/* Body */}
                <form onSubmit={handleExport} className="p-6 space-y-5">
                    {errorMessage && (
                        <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2 text-red-700 text-xs font-medium animate-shake">
                            <span className="material-symbols-outlined text-red-500 text-base shrink-0">error</span>
                            <span>{errorMessage}</span>
                        </div>
                    )}

                    {/* Janela de tempo */}
                    <div className="space-y-2">
                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">Período de Interações</label>
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <span className="text-[10px] text-slate-500 block mb-1">Data de Início</span>
                                <input 
                                    type="date" 
                                    value={startDate}
                                    onChange={(e) => setStartDate(e.target.value)}
                                    disabled={isGenerating}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-lg py-2 px-3 text-xs text-slate-700 focus:ring-2 focus:ring-primary-navy/20 outline-none"
                                />
                            </div>
                            <div>
                                <span className="text-[10px] text-slate-500 block mb-1">Data Final</span>
                                <input 
                                    type="date" 
                                    value={endDate}
                                    onChange={(e) => setEndDate(e.target.value)}
                                    disabled={isGenerating}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-lg py-2 px-3 text-xs text-slate-700 focus:ring-2 focus:ring-primary-navy/20 outline-none"
                                />
                            </div>
                        </div>
                        <p className="text-[10px] text-slate-400 italic">Deixe em branco para exportar todo o histórico pedagógico do aluno.</p>
                    </div>

                    {/* Filtros de Conteúdo */}
                    <div className="space-y-3 pt-3 border-t border-slate-100">
                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">Configurações do Relatório</label>
                        
                        <div className="space-y-2.5">
                            {/* Omitir Informais */}
                            <label className="flex items-start gap-3 cursor-pointer group">
                                <input 
                                    type="checkbox"
                                    checked={omitInformal}
                                    onChange={(e) => setOmitInformal(e.target.checked)}
                                    disabled={isGenerating}
                                    className="mt-0.5 w-4 h-4 rounded text-primary-navy focus:ring-primary-navy/20 border-slate-300"
                                />
                                <div>
                                    <span className="text-xs font-semibold text-slate-800 group-hover:text-primary-navy transition-colors">Omitir Interações Informais</span>
                                    <p className="text-[10px] text-slate-500 leading-tight">Remove saudações, small talk e mensagens pessoais do histórico.</p>
                                </div>
                            </label>

                            {/* Incluir Adaptações */}
                            <label className="flex items-start gap-3 cursor-pointer group">
                                <input 
                                    type="checkbox"
                                    checked={includeCurriculum}
                                    onChange={(e) => setIncludeCurriculum(e.target.checked)}
                                    disabled={isGenerating}
                                    className="mt-0.5 w-4 h-4 rounded text-primary-navy focus:ring-primary-navy/20 border-slate-300"
                                />
                                <div>
                                    <span className="text-xs font-semibold text-slate-800 group-hover:text-primary-navy transition-colors">Incluir Adaptações Curriculares</span>
                                    <p className="text-[10px] text-slate-500 leading-tight">Gera uma seção detalhada com adaptações curriculares sugeridas pela IA.</p>
                                </div>
                            </label>

                            {/* Incluir Metodologias */}
                            <label className="flex items-start gap-3 cursor-pointer group">
                                <input 
                                    type="checkbox"
                                    checked={includeMethodologies}
                                    onChange={(e) => setIncludeMethodologies(e.target.checked)}
                                    disabled={isGenerating}
                                    className="mt-0.5 w-4 h-4 rounded text-primary-navy focus:ring-primary-navy/20 border-slate-300"
                                />
                                <div>
                                    <span className="text-xs font-semibold text-slate-800 group-hover:text-primary-navy transition-colors">Incluir Metodologias Recomendadas</span>
                                    <p className="text-[10px] text-slate-500 leading-tight">Adiciona ao relatório metodologias práticas de ensino focadas em AH/SD.</p>
                                </div>
                            </label>
                        </div>
                    </div>

                    {/* Footer Buttons */}
                    <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={isGenerating}
                            className="px-4 py-2 text-xs font-bold text-slate-500 hover:text-slate-700 bg-slate-50 hover:bg-slate-100 rounded-lg transition-all"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={isGenerating}
                            className="px-5 py-2.5 bg-gradient-to-r from-primary-navy to-teal-custom hover:from-teal-custom hover:to-primary-navy text-white text-xs font-bold rounded-lg shadow-md hover:shadow-lg transition-all duration-300 flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isGenerating ? (
                                <>
                                    <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                                    <span>Gerando PDI...</span>
                                </>
                            ) : (
                                <>
                                    <span className="material-symbols-outlined text-[16px]">picture_as_pdf</span>
                                    <span>Gerar Relatório PDI</span>
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

ExportPDIModal.propTypes = {
    student: PropTypes.shape({
        id: PropTypes.string.isRequired,
        full_name: PropTypes.string.isRequired,
    }).isRequired,
    onClose: PropTypes.func.isRequired,
};

export default ExportPDIModal;
