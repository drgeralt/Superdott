import noUserPfp from '../../assets/img/no-user-pfp.jpg';
import useStudentStore from '../../store/useStudentStore';

const StudentList = () => {
    const students = useStudentStore(state => state.students);
    const selectedStudent = useStudentStore(state => state.selectedStudent);
    const selectStudent = useStudentStore(state => state.selectStudent);
    const isLoading = useStudentStore(state => state.isLoading);

    if (isLoading) {
        return (
            <section className="col-span-12 md:col-span-3">
                <div className="bg-surface-container-low rounded-xl p-4 border border-outline-variant/10 flex flex-col h-auto md:h-[calc(100vh-200px)] min-h-[500px]">
                    <h3 className="font-headline font-bold text-sm mb-4 text-on-surface-variant flex items-center gap-2">
                        <span className="material-symbols-outlined text-lg">group</span>
                        Turma Ativa
                    </h3>
                    <div className="space-y-2 animate-pulse">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-surface-container-high">
                                <div className="w-10 h-10 rounded-full bg-outline-variant/30 shrink-0"></div>
                                <div className="space-y-2 flex-1">
                                    <div className="h-3 bg-outline-variant/30 rounded w-3/4"></div>
                                    <div className="h-2 bg-outline-variant/20 rounded w-1/2"></div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        );
    }

    return (
        <section className="col-span-12 md:col-span-3">
            <div className="bg-surface-container-low rounded-xl p-4 border border-outline-variant/10 flex flex-col h-auto md:h-[calc(100vh-200px)] min-h-[500px]">
                <h3 className="font-headline font-bold text-sm mb-4 text-on-surface-variant flex items-center gap-2 shrink-0">
                    <span className="material-symbols-outlined text-lg">group</span>
                    Turma Ativa
                </h3>
                <div className="space-y-2 flex-1 overflow-y-auto custom-scrollbar pr-2">
                    {students.map(student => (
                        <button
                            key={student.id}
                            onClick={() => selectStudent(student)}
                            className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all ${
                                selectedStudent?.id === student.id
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
                                    selectedStudent?.id === student.id ? 'text-primary-navy' : 'text-on-surface'
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