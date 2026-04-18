const SideNavBar = () => (
    <aside className="h-screen w-64 fixed left-0 top-0 overflow-y-auto bg-emerald-50 flex flex-col py-6 border-r border-slate-200 pt-20">
        <div className="flex items-center gap-3 px-4 py-4 mb-4">
            <div className="w-10 h-10 rounded-xl bg-primary-navy flex items-center justify-center text-white">
                <span className="material-symbols-outlined">school</span>
            </div>
            <div>
                <p className="font-bold text-lg text-primary-navy">Superdott Admin</p>
                <p className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">Gestão Acadêmica</p>
            </div>
        </div>
        <nav className="flex-1 space-y-1">
            <a className="flex items-center gap-3 px-4 py-3 bg-white text-primary-navy font-bold rounded-lg shadow-sm mx-2 text-sm" href="#">
                <span className="material-symbols-outlined">dashboard</span>
                <span>Visão Geral</span>
            </a>
            <a className="flex items-center gap-3 px-4 py-3 text-slate-500 hover:bg-emerald-100/30 mx-2 rounded-lg text-sm" href="#">
                <span className="material-symbols-outlined">group</span>
                <span>Alunos</span>
            </a>
            <a className="flex items-center gap-3 px-4 py-3 text-slate-500 hover:bg-emerald-100/30 mx-2 rounded-lg text-sm" href="#">
                <span className="material-symbols-outlined">assessment</span>
                <span>Triagens</span>
            </a>
        </nav>
        <footer className="mt-auto space-y-1 pt-4 border-t border-slate-200">
            <a className="flex items-center gap-3 px-4 py-2 text-slate-500 hover:bg-emerald-100/30 mx-2 rounded-lg text-sm" href="#">
                <span className="material-symbols-outlined">logout</span>
                <span>Sair</span>
            </a>
        </footer>
    </aside>
);

export default SideNavBar;