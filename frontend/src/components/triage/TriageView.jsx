import { useState } from 'react';
import CountUp from './CountUp';

const TriageHeader = ({ onOpenModal }) => (
    <section className="mb-8 xl:mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="max-w-xl">
            <p className="text-on-surface-variant mt-2 text-base xl:text-lg">
                Monitore e gerencie o progresso das avaliações pedagógicas em tempo real.
            </p>
        </div>
        <div>
            <button
                onClick={onOpenModal}
                className="group relative inline-flex items-center gap-3 px-6 xl:px-8 py-3 xl:py-4 bg-gradient-to-br from-primary-navy to-teal-custom text-white rounded-full font-headline font-bold text-base xl:text-lg shadow-lg shadow-primary-navy/20 hover:shadow-xl hover:shadow-primary-navy/30 transition-all active:scale-95"
            >
                <span className="material-symbols-outlined">add_circle</span>
                Nova Triagem
            </button>
        </div>
    </section>
);

const TriageStats = () => (
    <section className="grid grid-cols-1 md:grid-cols-4 gap-4 xl:gap-6 mb-8 xl:mb-12">
        <div className="col-span-1 md:col-span-2 bg-surface-container-lowest p-6 xl:p-8 rounded-3xl flex flex-col justify-between min-h-[160px] xl:min-h-[180px] border border-slate-100 shadow-sm">
            <div>
                <span className="text-primary-navy font-bold text-xs xl:text-sm uppercase tracking-tighter">Total de Alunos</span>
                <p className="text-4xl xl:text-5xl font-black mt-2 font-headline text-primary-navy">
                    <CountUp from={0} to={1284} duration={2} separator="." />
                </p>
            </div>
            <div className="flex items-center gap-2 text-teal-custom font-semibold text-xs xl:text-sm mt-4">
                <span className="material-symbols-outlined text-sm">trending_up</span>
                <span>+12% este mês</span>
            </div>
        </div>

        <div className="bg-mint-light/50 p-6 xl:p-8 rounded-3xl flex flex-col justify-between border border-mint-light">
            <span className="text-orange-custom font-bold text-xs xl:text-sm uppercase tracking-tighter">Pendentes</span>
            <p className="text-3xl xl:text-4xl font-black font-headline text-primary-navy mt-2">
                <CountUp from={0} to={42} duration={2.5} />
            </p>
            <div className="h-2 w-full bg-slate-200 rounded-full mt-4">
                <div className="h-2 bg-orange-custom w-1/3 rounded-full"></div>
            </div>
        </div>

        <div className="bg-mint-accent/30 p-6 xl:p-8 rounded-3xl flex flex-col justify-between border border-mint-accent">
            <span className="text-teal-custom font-bold text-xs xl:text-sm uppercase tracking-tighter">Concluídos</span>
            <p className="text-3xl xl:text-4xl font-black font-headline text-teal-custom mt-2">
                <CountUp from={0} to={1242} duration={2} separator="." />
            </p>
            <div className="h-2 w-full bg-slate-200 rounded-full mt-4">
                <div className="h-2 bg-teal-custom w-full rounded-full"></div>
            </div>
        </div>
    </section>
);

const TriageTable = () => (
    <section className="bg-surface-container-lowest rounded-3xl overflow-hidden shadow-sm border border-slate-100">
        <div className="px-6 xl:px-8 py-5 xl:py-6 border-b border-slate-50 flex justify-between items-center">
            <h3 className="font-headline font-bold text-lg xl:text-xl text-primary-navy">Fila de Triagens</h3>
            <div className="flex gap-2">
                <button className="p-2 hover:bg-mint-light rounded-lg text-slate-400">
                    <span className="material-symbols-outlined text-xl">filter_list</span>
                </button>
                <button className="p-2 hover:bg-mint-light rounded-lg text-slate-400">
                    <span className="material-symbols-outlined text-xl">download</span>
                </button>
            </div>
        </div>

        <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-left border-collapse min-w-[800px]">
                <thead>
                <tr className="bg-mint-light/30">
                    <th className="px-6 xl:px-8 py-4 font-label font-bold text-[10px] xl:text-xs uppercase tracking-widest text-primary-navy/70">Nome do Aluno</th>
                    <th className="px-6 xl:px-8 py-4 font-label font-bold text-[10px] xl:text-xs uppercase tracking-widest text-primary-navy/70">Escola</th>
                    <th className="px-6 xl:px-8 py-4 font-label font-bold text-[10px] xl:text-xs uppercase tracking-widest text-primary-navy/70">Data de Cadastro</th>
                    <th className="px-6 xl:px-8 py-4 font-label font-bold text-[10px] xl:text-xs uppercase tracking-widest text-primary-navy/70">Status</th>
                    <th className="px-6 xl:px-8 py-4 font-label font-bold text-[10px] xl:text-xs uppercase tracking-widest text-primary-navy/70 text-right">Ações</th>
                </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                <tr className="hover:bg-mint-light/20 transition-colors">
                    <td className="px-6 xl:px-8 py-4 xl:py-5">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 xl:w-10 xl:h-10 rounded-full bg-primary-navy/10 flex items-center justify-center text-primary-navy font-bold text-sm">AB</div>
                            <span className="font-semibold text-primary-navy text-sm xl:text-base">Ana Beatriz Silva</span>
                        </div>
                    </td>
                    <td className="px-6 xl:px-8 py-4 xl:py-5 text-on-surface-variant text-xs xl:text-sm">Colégio São Bento</td>
                    <td className="px-6 xl:px-8 py-4 xl:py-5 text-on-surface-variant text-xs xl:text-sm">12 Out, 2023</td>
                    <td className="px-6 xl:px-8 py-4 xl:py-5">
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-custom/20 text-orange-custom text-[10px] xl:text-xs font-bold">
                                <span className="w-1.5 h-1.5 xl:w-2 xl:h-2 rounded-full bg-orange-custom"></span>
                                Pendente
                            </span>
                    </td>
                    <td className="px-6 xl:px-8 py-4 xl:py-5 text-right">
                        <div className="flex justify-end gap-1 xl:gap-2">
                            <button className="p-1.5 xl:p-2 text-primary-navy hover:bg-primary-navy/5 rounded-xl transition-all active:scale-90" title="Copiar Link">
                                <span className="material-symbols-outlined text-[20px] xl:text-[24px]">content_copy</span>
                            </button>
                            <button className="p-1.5 xl:p-2 text-teal-custom hover:bg-teal-custom/10 rounded-xl transition-all active:scale-90" title="Enviar WhatsApp">
                                <span className="material-symbols-outlined text-[20px] xl:text-[24px]">chat</span>
                            </button>
                        </div>
                    </td>
                </tr>
                <tr className="hover:bg-mint-light/20 transition-colors">
                    <td className="px-6 xl:px-8 py-4 xl:py-5">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 xl:w-10 xl:h-10 rounded-full bg-teal-custom/10 flex items-center justify-center text-teal-custom font-bold text-sm">GM</div>
                            <span className="font-semibold text-primary-navy text-sm xl:text-base">Gabriel Martins</span>
                        </div>
                    </td>
                    <td className="px-6 xl:px-8 py-4 xl:py-5 text-on-surface-variant text-xs xl:text-sm">Escola Integral Dom Bosco</td>
                    <td className="px-6 xl:px-8 py-4 xl:py-5 text-on-surface-variant text-xs xl:text-sm">11 Out, 2023</td>
                    <td className="px-6 xl:px-8 py-4 xl:py-5">
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-mint-accent text-teal-custom text-[10px] xl:text-xs font-bold">
                                <span className="w-1.5 h-1.5 xl:w-2 xl:h-2 rounded-full bg-teal-custom"></span>
                                Concluído
                            </span>
                    </td>
                    <td className="px-6 xl:px-8 py-4 xl:py-5 text-right">
                        <div className="flex justify-end gap-1 xl:gap-2">
                            <button className="p-1.5 xl:p-2 text-primary-navy hover:bg-primary-navy/5 rounded-xl transition-all active:scale-90" title="Copiar Link">
                                <span className="material-symbols-outlined text-[20px] xl:text-[24px]">content_copy</span>
                            </button>
                            <button className="p-1.5 xl:p-2 text-teal-custom hover:bg-teal-custom/10 rounded-xl transition-all active:scale-90" title="Enviar WhatsApp">
                                <span className="material-symbols-outlined text-[20px] xl:text-[24px]">chat</span>
                            </button>
                        </div>
                    </td>
                </tr>
                </tbody>
            </table>
        </div>

        <div className="px-6 xl:px-8 py-4 xl:py-6 bg-mint-light/20 flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="text-[10px] xl:text-xs font-label text-on-surface-variant">Exibindo 2 de 1.284 alunos</p>
            <div className="flex gap-2">
                <button className="px-3 xl:px-4 py-1.5 xl:py-2 bg-white border border-slate-200 rounded-lg text-xs xl:text-sm font-semibold hover:bg-mint-light transition-all text-primary-navy">Anterior</button>
                <button className="px-3 xl:px-4 py-1.5 xl:py-2 bg-white border border-slate-200 rounded-lg text-xs xl:text-sm font-semibold hover:bg-mint-light transition-all text-primary-navy">Próximo</button>
            </div>
        </div>
    </section>
);

const QuickAddModal = ({ isOpen, onClose }) => {
    const modalClasses = isOpen
        ? "translate-y-0 opacity-100 pointer-events-auto"
        : "translate-y-12 opacity-0 pointer-events-none";

    return (
        <div className={`fixed bottom-24 right-6 lg:bottom-10 lg:right-10 z-50 max-w-sm w-full bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden transform transition-all duration-300 ${modalClasses}`}>
            <div className="p-5 xl:p-6">
                <div className="flex justify-between items-center mb-4 xl:mb-6">
                    <h4 className="font-headline font-bold text-base xl:text-lg text-primary-navy">Novo Cadastro Superdott</h4>
                    <button onClick={onClose} className="text-slate-400 hover:text-on-surface">
                        <span className="material-symbols-outlined text-[20px] xl:text-[24px]">close</span>
                    </button>
                </div>
                <form className="space-y-4">
                    <div className="space-y-1">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-teal-custom block px-1">Nome do Aluno</label>
                        <input className="w-full px-3 xl:px-4 py-2.5 xl:py-3 bg-mint-light/30 border-b-2 border-transparent focus:border-teal-custom focus:ring-0 rounded-xl text-xs xl:text-sm transition-all outline-none" placeholder="Ex: João da Silva" type="text" />
                    </div>
                    <div className="space-y-1">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-teal-custom block px-1">Escola</label>
                        <select className="w-full px-3 xl:px-4 py-2.5 xl:py-3 bg-mint-light/30 border-b-2 border-transparent focus:border-teal-custom focus:ring-0 rounded-xl text-xs xl:text-sm transition-all outline-none appearance-none">
                            <option>Selecione a Escola</option>
                            <option>Colégio São Bento</option>
                            <option>Escola Integral Dom Bosco</option>
                        </select>
                    </div>

                    <button
                        onClick={onClose}
                        className="w-full py-3 xl:py-4 bg-primary-navy text-white font-headline font-bold text-sm xl:text-base rounded-full shadow-lg shadow-primary-navy/20 hover:bg-primary-navy/90 transition-all mt-4"
                        type="button"
                    >
                        Continuar
                    </button>
                </form>
            </div>
        </div>
    );
};

const TriageView = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);

    return (
        <div className="w-full max-w-[1400px] mx-auto">
            <TriageHeader onOpenModal={() => setIsModalOpen(true)} />
            <TriageStats />
            <TriageTable />
            <QuickAddModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
        </div>
    );
};

export default TriageView;