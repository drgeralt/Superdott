const StudentList = ({ students, activeId, onSelect }) => (
    <section className="col-span-12 md:col-span-3 space-y-4">
        <div className="bg-surface-container-low rounded-xl p-4">
            <h3 className="font-headline font-bold text-sm mb-4 text-on-surface-variant flex items-center gap-2">
                <span className="material-symbols-outlined text-lg">group</span>
                Turma Ativa
            </h3>
            <div className="space-y-2">
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
                        <img className="w-10 h-10 rounded-full object-cover" src="./src/img/no-user-pfp.jpg" alt="Avatar" />
                        <div>
                            <p className={`text-sm font-bold font-headline ${activeId === student.id ? 'text-primary-navy' : 'text-on-surface'}`}>
                                {student.full_name}
                            </p>
                            <p className="text-[10px] text-on-surface-variant font-medium">
                                {student.school?.name || "Sem escola definida"}
                            </p>
                        </div>
                    </button>
                ))}
            </div>
        </div>
    </section>
);