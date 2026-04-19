import noUserPfp from '../../assets/img/no-user-pfp.jpg';

const StudentList = ({ students, activeId, onSelect }) => {
    return (
        <section className="col-span-12 md:col-span-3">
            {/* Altura calculada dinamicamente: 100vh menos ~200px do topo/base */}
            <div className="bg-surface-container-low rounded-xl p-4 border border-outline-variant/10 flex flex-col h-auto md:h-[calc(100vh-200px)] min-h-[500px]">
                <h3 className="font-headline font-bold text-sm mb-4 text-on-surface-variant flex items-center gap-2 shrink-0">
                    <span className="material-symbols-outlined text-lg">group</span>
                    Turma Ativa
                </h3>

                {/* overflow-y-auto permite rolagem apenas nesta área */}
                <div className="space-y-2 flex-1 overflow-y-auto custom-scrollbar pr-2">
                    {students.map(student => (
                        <button
                            key={student.id}
                            onClick={() => onSelect(student)}
                            className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all ${
                                activeId === student.id
                                    ? 'bg-white shadow-sm border-l-4 border-primary-navy'
                                    : 'hover:bg-surface-container-high'
                            } text-left`}
                        >
                            <img
                                className="w-10 h-10 rounded-full object-cover border border-outline-variant/10 shrink-0"
                                src={noUserPfp}
                                alt="Avatar"
                            />
                            <div className="overflow-hidden">
                                <p className={`text-sm font-bold font-headline truncate ${
                                    activeId === student.id ? 'text-primary-navy' : 'text-on-surface'
                                }`}>
                                    {student.full_name}
                                </p>
                                <p className="text-[10px] text-on-surface-variant font-medium truncate">
                                    {student.school?.name || "Sem escola definida"}
                                </p>
                            </div>
                        </button>
                    ))}

                    {students.length === 0 && (
                        <p className="text-xs text-center py-4 text-on-surface-variant italic">
                            Nenhum aluno encontrado.
                        </p>
                    )}
                </div>
            </div>
        </section>
    );
};

export default StudentList;